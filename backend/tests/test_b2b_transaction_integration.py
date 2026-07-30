"""Real replica-set evidence for B2B cross-collection concurrency.

The fake collections used by the unit suites cannot express a write conflict or
an aborted transaction, so the fail-closed guarantees on Inquiry conversion and
Project creation are only actually proven here, against a real replica set.

Opt in with NIUVA_RUN_REAL_TRANSACTION_TESTS=1 and MONGO_TRANSACTION_TEST_URL.
"""

import asyncio
from datetime import datetime, timezone
import os
import uuid

import pytest

MONGO_TRANSACTION_TEST_URL = os.environ.get("MONGO_TRANSACTION_TEST_URL")
if (
    os.environ.get("NIUVA_RUN_REAL_TRANSACTION_TESTS") != "1"
    or not MONGO_TRANSACTION_TEST_URL
):
    pytest.skip(
        "Explicit real transaction opt-in and MONGO_TRANSACTION_TEST_URL are required",
        allow_module_level=True,
    )

from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402

from b2b_domain import B2BDomainError  # noqa: E402
from b2b_service import B2BService  # noqa: E402
from database_capabilities import probe_database_capabilities  # noqa: E402
from transaction_execution import TransactionExecutor  # noqa: E402
from transaction_guard import TransactionMutationGuard  # noqa: E402

ACTOR = {"id": "user-sales", "email": "sales@niuva.test"}

SUBMISSION = {
    "company": "PT Contoh Industri",
    "pic_name": "Ayu",
    "pic_email": "ayu@example.com",
    "pic_phone": "+628123456789",
    "need": "Prototype enclosure",
    "timeline": "Q4 2026",
    "brief": "Membutuhkan validasi desain dan prototype fungsional.",
}


def operation_id():
    return str(uuid.uuid4())


class RaisingInsertCollection:
    """Proxy a collection whose insert_one fails, to abort mid-transaction."""

    def __init__(self, collection):
        self._collection = collection

    def __getattr__(self, name):
        return getattr(self._collection, name)

    async def insert_one(self, *_args, **_kwargs):
        raise RuntimeError("injected storage failure")


class DatabaseWithFailingCollection:
    def __init__(self, database, failing_collection):
        self._database = database
        self._failing_collection = failing_collection

    def __getattr__(self, name):
        collection = getattr(self._database, name)
        if name == self._failing_collection:
            return RaisingInsertCollection(collection)
        return collection


async def build_service(client, database_name, failing_collection=None):
    capabilities = await probe_database_capabilities(client, database_name)
    assert capabilities.transactions is True
    executor = TransactionExecutor(client, lambda: capabilities)
    guard = TransactionMutationGuard(executor, lambda: True)
    database = client[database_name]
    if failing_collection:
        database = DatabaseWithFailingCollection(database, failing_collection)
    return B2BService(db=database, transaction_guard=guard)


async def seed_contacted_inquiry(service):
    """Drive a fresh inquiry to the only state conversion accepts."""
    inquiry = await service.create_inquiry(dict(SUBMISSION))
    for target, version in (("reviewed", 1), ("contacted", 2)):
        await service.transition_inquiry(
            inquiry["id"],
            target_status=target,
            expected_version=version,
            operation_id=operation_id(),
            reason=f"Menuju {target}",
            actor=ACTOR,
        )
    return inquiry["id"]


async def accept_quote(service, quote_id, *, variant_id=None, quantity=1):
    """Drive a draft quote to accepted so a project may be created from it."""
    quote = await service.get_quote(quote_id)
    quote = await service.create_quote_revision(
        quote_id,
        expected_version=quote["version"],
        operation_id=operation_id(),
        reason="Initial commercial authoring",
        scope_snapshot=quote["current_version"]["scope_snapshot"],
        items=[
            {
                "description": "Engineering service",
                "quantity": quantity,
                "unit_price_minor": 1000000,
                "variant_id": variant_id,
            }
        ],
        total_minor=None,
        actor=ACTOR,
    )
    for target in ("internal_review", "sent"):
        quote = await service.transition_quote(
            quote_id,
            target_status=target,
            expected_version=quote["version"],
            operation_id=operation_id(),
            reason=f"Menuju {target}",
            actor=ACTOR,
        )
    return await service.accept_quote(
        quote_id,
        expected_version=quote["version"],
        operation_id=operation_id(),
        reason="Customer approval recorded",
        approver={"name": "Ayu", "identity": "ayu@example.com"},
        accepted_at=datetime.now(timezone.utc),
        channel="email",
        evidence_reference="email-thread-integration",
        actor=ACTOR,
    )


async def run_double_conversion(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    try:
        service = await build_service(client, database_name)
        database = client[database_name]
        inquiry_id = await seed_contacted_inquiry(service)

        async def convert():
            return await service.convert_inquiry(
                inquiry_id,
                expected_version=3,
                operation_id=operation_id(),
                reason="Konversi ke penawaran",
                actor=ACTOR,
            )

        results = await asyncio.gather(convert(), convert(), return_exceptions=True)

        succeeded = [item for item in results if not isinstance(item, Exception)]
        rejected = [item for item in results if isinstance(item, Exception)]
        assert len(succeeded) == 1, results
        assert len(rejected) == 1
        assert isinstance(rejected[0], B2BDomainError)
        assert rejected[0].status_code == 409

        # The losing branch must leave nothing behind: exactly one quote, one
        # version, and a single conversion recorded on the inquiry.
        assert await database.b2b_quotes.count_documents({}) == 1
        assert await database.b2b_quote_versions.count_documents({}) == 1
        inquiry = await database.inquiries.find_one({"id": inquiry_id})
        assert inquiry["status"] == "converted"
        assert inquiry["converted_quote_id"] == succeeded[0]["quote"]["id"]
        assert inquiry["version"] == 4
    finally:
        await client.drop_database(database_name)
        client.close()


async def run_conversion_replay(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    try:
        service = await build_service(client, database_name)
        database = client[database_name]
        inquiry_id = await seed_contacted_inquiry(service)
        replayed = operation_id()

        first = await service.convert_inquiry(
            inquiry_id,
            expected_version=3,
            operation_id=replayed,
            reason="Konversi ke penawaran",
            actor=ACTOR,
        )
        second = await service.convert_inquiry(
            inquiry_id,
            expected_version=3,
            operation_id=replayed,
            reason="Konversi ke penawaran",
            actor=ACTOR,
        )

        # A replayed operation is the same conversion, not a second quote.
        assert second["quote"]["id"] == first["quote"]["id"]
        assert await database.b2b_quotes.count_documents({}) == 1
    finally:
        await client.drop_database(database_name)
        client.close()


async def run_duplicate_project_creation(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    try:
        service = await build_service(client, database_name)
        database = client[database_name]
        inquiry_id = await seed_contacted_inquiry(service)
        converted = await service.convert_inquiry(
            inquiry_id,
            expected_version=3,
            operation_id=operation_id(),
            reason="Konversi ke penawaran",
            actor=ACTOR,
        )
        quote_id = converted["quote"]["id"]
        accepted = await accept_quote(service, quote_id)

        async def create():
            return await service.create_project_from_quote(
                quote_id,
                expected_version=accepted["version"],
                operation_id=operation_id(),
                reason="Mulai eksekusi proyek",
                actor=ACTOR,
            )

        results = await asyncio.gather(create(), create(), return_exceptions=True)

        projects = await database.b2b_projects.count_documents({})
        assert projects == 1, results

        succeeded = [item for item in results if not isinstance(item, Exception)]
        assert len(succeeded) >= 1
        # Whether the second call is rejected or answered idempotently, it must
        # never yield a second project for the same accepted quotation.
        identifiers = {item["project"]["id"] for item in succeeded}
        assert len(identifiers) == 1

        for rejected in (item for item in results if isinstance(item, Exception)):
            assert isinstance(rejected, B2BDomainError), rejected
            assert rejected.status_code == 409

        quote = await database.b2b_quotes.find_one({"id": quote_id})
        assert quote["project_id"] == next(iter(identifiers))
        assert quote["status"] == "accepted"
    finally:
        await client.drop_database(database_name)
        client.close()


async def run_conversion_rollback(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    try:
        seed = await build_service(client, database_name)
        inquiry_id = await seed_contacted_inquiry(seed)
        database = client[database_name]

        # The quote version is written before the quote, so failing the quote
        # insert leaves a committed orphan unless the transaction rolls back.
        failing = await build_service(
            client, database_name, failing_collection="b2b_quotes"
        )
        with pytest.raises(RuntimeError, match="injected storage failure"):
            await failing.convert_inquiry(
                inquiry_id,
                expected_version=3,
                operation_id=operation_id(),
                reason="Konversi ke penawaran",
                actor=ACTOR,
            )

        assert await database.b2b_quotes.count_documents({}) == 0
        assert await database.b2b_quote_versions.count_documents({}) == 0
        inquiry = await database.inquiries.find_one({"id": inquiry_id})
        assert inquiry["status"] == "contacted"
        assert inquiry["converted_quote_id"] is None
        assert inquiry["version"] == 3

        # The inquiry is untouched, so a later conversion still succeeds.
        recovered = await seed.convert_inquiry(
            inquiry_id,
            expected_version=3,
            operation_id=operation_id(),
            reason="Konversi ulang setelah kegagalan",
            actor=ACTOR,
        )
        assert recovered["quote"]["status"] == "draft"
        assert await database.b2b_quotes.count_documents({}) == 1
    finally:
        await client.drop_database(database_name)
        client.close()


async def run_concurrent_work_order_quantity_cap(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    try:
        service = await build_service(client, database_name)
        database = client[database_name]
        inquiry_id = await seed_contacted_inquiry(service)
        converted = await service.convert_inquiry(
            inquiry_id,
            expected_version=3,
            operation_id=operation_id(),
            reason="Konversi ke penawaran",
            actor=ACTOR,
        )
        await database.products.insert_one(
            {"id": "product-1", "name": "Prototype", "slug": "prototype"}
        )
        await database.product_variants.insert_one(
            {
                "id": "variant-1",
                "product_id": "product-1",
                "sku": "PROTO-1",
                "name": "Prototype",
                "production_type": "made_to_order",
                "bill_of_materials": [],
            }
        )
        accepted = await accept_quote(
            service,
            converted["quote"]["id"],
            variant_id="variant-1",
            quantity=3,
        )
        created = await service.create_project_from_quote(
            accepted["id"],
            expected_version=accepted["version"],
            operation_id=operation_id(),
            reason="Mulai eksekusi proyek",
            actor=ACTOR,
        )
        project = created["project"]
        line_id = project["quote_snapshot"]["items"][0]["quote_line_id"]

        async def create():
            return await service.create_work_order(
                project["id"],
                expected_version=project["version"],
                operation_id=operation_id(),
                reason="Concurrent production run",
                quote_line_id=line_id,
                quantity=2,
                actor=ACTOR,
            )

        results = await asyncio.gather(create(), create(), return_exceptions=True)
        succeeded = [item for item in results if not isinstance(item, Exception)]
        rejected = [item for item in results if isinstance(item, Exception)]
        assert len(succeeded) == 1, results
        assert len(rejected) == 1
        assert isinstance(rejected[0], B2BDomainError)
        assert rejected[0].status_code == 409
        assert await database.work_orders.count_documents({}) == 1
        stored = await database.work_orders.find_one({})
        assert stored["source_quote_version_id"] == project["source_quote_version_id"]
        assert stored["quote_line_id"] == line_id
        assert stored["quantity"] == 2

        current_project = await service.get_project(project["id"])
        with pytest.raises(B2BDomainError) as overcommitted:
            await service.create_work_order(
                project["id"],
                expected_version=current_project["version"],
                operation_id=operation_id(),
                reason="Exceed exact accepted line",
                quote_line_id=line_id,
                quantity=2,
                actor=ACTOR,
            )
        assert overcommitted.value.code == "work_order_quote_quantity_exceeded"
    finally:
        await client.drop_database(database_name)
        client.close()


def test_concurrent_conversion_yields_exactly_one_quote(transaction_database_name):
    asyncio.run(run_double_conversion(transaction_database_name))


def test_replayed_conversion_returns_the_same_quote(transaction_database_name):
    asyncio.run(run_conversion_replay(transaction_database_name))


def test_concurrent_acceptance_yields_exactly_one_project(transaction_database_name):
    asyncio.run(run_duplicate_project_creation(transaction_database_name))


def test_failed_conversion_leaves_no_partial_state(transaction_database_name):
    asyncio.run(run_conversion_rollback(transaction_database_name))


def test_concurrent_work_orders_cannot_overcommit_one_quote_line(
    transaction_database_name,
):
    asyncio.run(run_concurrent_work_order_quantity_cap(transaction_database_name))
