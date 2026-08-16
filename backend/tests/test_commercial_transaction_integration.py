"""Real replica-set evidence for catalog commercial transaction integrity.

Opt in with NIUVA_RUN_REAL_TRANSACTION_TESTS=1 and MONGO_TRANSACTION_TEST_URL.
"""

import asyncio
import os

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

from catalog_service import CatalogError, CatalogService  # noqa: E402
from database_capabilities import probe_database_capabilities  # noqa: E402
from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402
from transaction_execution import (  # noqa: E402
    TransactionExecutor,
    TransactionUnavailableError,
)
from transaction_guard import TransactionMutationGuard  # noqa: E402

ACTOR = {"id": "catalog-admin", "email": "catalog@niuva.test"}


class RaisingInsertCollection:
    """Proxy a collection whose insert fails after the business write."""

    def __init__(self, collection):
        self._collection = collection

    def __getattr__(self, name):
        return getattr(self._collection, name)

    async def insert_one(self, *_args, **_kwargs):
        raise RuntimeError("injected audit storage failure")


class DatabaseWithFailingAudit:
    def __init__(self, database):
        self._database = database

    def __getattr__(self, name):
        collection = getattr(self._database, name)
        if name == "audit_events":
            return RaisingInsertCollection(collection)
        return collection


async def build_service(client, database_name, *, enabled=True, failing_audit=False):
    database = client[database_name]
    capabilities = await probe_database_capabilities(client, database_name)
    assert capabilities.transactions is True
    events = []
    executor = TransactionExecutor(
        client,
        lambda: capabilities,
        event_sink=lambda event, fields: events.append((event, fields)),
    )
    guard = TransactionMutationGuard(executor, lambda: enabled)
    service_database = DatabaseWithFailingAudit(database) if failing_audit else database
    return (
        CatalogService(
            db=service_database,
            client=client,
            capabilities=capabilities,
            guard=guard,
        ),
        database,
        events,
    )


async def seed_publishable_product(service):
    category = await service.create_category(
        {
            "name": "Ready Stock",
            "slug": "ready-stock",
            "description": "Ready products",
            "sort_order": 1,
        },
        ACTOR,
    )
    product = await service.create_product(
        {
            "category_id": category["id"],
            "name": "Desk Sign",
            "slug": "desk-sign",
            "short_description": "Custom sign",
            "description": "Printed sign",
            "media": [{"storage_path": "catalog/sign.webp", "alt": "Desk sign"}],
            "pricing_mode": "fixed",
            "price_from": 50000,
            "currency": "IDR",
            "pricing_rule_reference": None,
            "retail_cta_enabled": True,
            "b2b_cta_enabled": True,
            "stock_visibility": "status_only",
        },
        ACTOR,
    )
    await service.replace_variants(
        product["id"],
        [
            {
                "sku": "SIGN-BLUE",
                "name": "Blue",
                "fixed_price": 50000,
                "currency": "IDR",
                "production_type": "ready_stock",
                "inventory_tracking_enabled": True,
                "reorder_point": "2",
                "status": "active",
            }
        ],
        ACTOR,
    )
    await service.submit_publication_candidate(
        product["id"],
        actor=ACTOR,
        reason="Submit reviewed publication candidate",
    )
    return product


async def run_catalog_audit_failure_rolls_back(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    try:
        service, database, events = await build_service(
            client, database_name, failing_audit=True
        )
        with pytest.raises(RuntimeError, match="injected audit storage failure"):
            await service.create_category(
                {"name": "Atomic", "slug": "atomic", "sort_order": 1},
                ACTOR,
            )
        assert await database.categories.count_documents({}) == 0
        assert await database.audit_events.count_documents({}) == 0
        assert any(
            event == "transaction_abort"
            and fields["operation_name"] == "catalog.create_category"
            for event, fields in events
        )
    finally:
        await client.drop_database(database_name)
        client.close()


async def run_catalog_crud_fails_closed(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    try:
        service, database, events = await build_service(
            client, database_name, enabled=False
        )
        with pytest.raises(TransactionUnavailableError):
            await service.create_category(
                {"name": "Rejected", "slug": "rejected", "sort_order": 1},
                ACTOR,
            )
        assert await database.categories.count_documents({}) == 0
        assert any(
            event == "transaction_rejected"
            and fields["operation_name"] == "catalog.create_category"
            for event, fields in events
        )
    finally:
        await client.drop_database(database_name)
        client.close()


async def run_concurrent_publication_has_one_winner(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    try:
        service, database, _events = await build_service(client, database_name)
        await database.catalog_publications.create_index(
            [("product_id", 1), ("revision", 1)],
            name="uq_catalog_publication_revision",
            unique=True,
        )
        product = await seed_publishable_product(service)

        async def publish(reason):
            return await service.publish_product(product["id"], ACTOR, reason)

        results = await asyncio.gather(
            publish("Concurrent approval A"),
            publish("Concurrent approval B"),
            return_exceptions=True,
        )
        succeeded = [item for item in results if not isinstance(item, Exception)]
        rejected = [item for item in results if isinstance(item, Exception)]
        assert len(succeeded) == 1, results
        assert len(rejected) == 1
        assert isinstance(rejected[0], CatalogError)
        assert rejected[0].status_code == 409
        assert rejected[0].code in {
            "catalog_candidate_conflict",
            "catalog_publication_conflict",
        }
        assert await database.catalog_publications.count_documents({}) == 1
        assert (
            await database.audit_events.count_documents(
                {"action": "catalog.product_published"}
            )
            == 1
        )
    finally:
        await client.drop_database(database_name)
        client.close()


def test_catalog_audit_failure_rolls_back_business_write(
    transaction_database_name,
):
    asyncio.run(run_catalog_audit_failure_rolls_back(transaction_database_name))


def test_catalog_crud_fails_closed_when_guard_is_disabled(
    transaction_database_name,
):
    asyncio.run(run_catalog_crud_fails_closed(transaction_database_name))


def test_concurrent_catalog_publication_has_one_winner(
    transaction_database_name,
):
    asyncio.run(run_concurrent_publication_has_one_winner(transaction_database_name))
