"""Real replica-set evidence for CMS publication integrity.

Opt in with NIUVA_RUN_REAL_TRANSACTION_TESTS=1 and MONGO_TRANSACTION_TEST_URL.
Every test uses the shared generated ``niuva_tx_*`` database fixture and drops
that database in ``finally``.
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

from content_service import ContentError, ContentService  # noqa: E402
from database_capabilities import probe_database_capabilities  # noqa: E402
from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402
from transaction_execution import TransactionExecutor  # noqa: E402
from transaction_guard import TransactionMutationGuard  # noqa: E402

ACTOR = {"id": "cms-approver", "email": "approver@niuva.test"}
VALID_FAQ_FIELDS = {
    "question": "Apa itu Niuva?",
    "answer": "Mitra R&D dan prototyping.",
}


class RaisingInsertCollection:
    def __init__(self, collection):
        self._collection = collection

    def __getattr__(self, name):
        return getattr(self._collection, name)

    async def insert_one(self, *_args, **_kwargs):
        raise RuntimeError("injected CMS audit storage failure")


class DatabaseWithFailingAudit:
    def __init__(self, database):
        self._database = database

    def __getattr__(self, name):
        collection = getattr(self._database, name)
        if name == "audit_events":
            return RaisingInsertCollection(collection)
        return collection


async def build_service(client, database_name, *, failing_audit=False):
    database = client[database_name]
    capabilities = await probe_database_capabilities(client, database_name)
    assert capabilities.transactions is True
    executor = TransactionExecutor(client, lambda: capabilities)
    guard = TransactionMutationGuard(executor)
    service_database = DatabaseWithFailingAudit(database) if failing_audit else database
    return (
        ContentService(
            db=service_database,
            client=client,
            capabilities=capabilities,
            guard=guard,
        ),
        database,
    )


async def ensure_content_indexes(database):
    await database.content_blocks.create_index(
        [("content_type", 1), ("slug", 1)],
        name="uq_content_type_slug",
        unique=True,
    )
    await database.content_block_versions.create_index(
        [("content_block_id", 1), ("version", 1)],
        name="uq_content_block_version",
        unique=True,
    )
    await database.content_publications.create_index(
        "source_version_id",
        name="uq_content_publication_source",
        unique=True,
    )


async def seed_preview_block(service):
    block = await service.create_block(
        content_type="faq",
        slug="publication-integrity",
        fields=VALID_FAQ_FIELDS,
        actor=ACTOR,
        reason="Create CMS transaction fixture",
    )
    block = await service.transition_block(
        block["id"],
        target_status="review",
        actor=ACTOR,
        reason="Submit CMS fixture for review",
        expected_version=block["version"],
        can_publish=False,
    )
    return await service.transition_block(
        block["id"],
        target_status="preview",
        actor=ACTOR,
        reason="Approve CMS fixture preview",
        expected_version=block["version"],
        can_publish=False,
    )


async def run_concurrent_publish_has_one_winner(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    try:
        service, database = await build_service(client, database_name)
        await ensure_content_indexes(database)
        block = await seed_preview_block(service)

        async def publish(reason):
            return await service.publish_block(
                block["id"],
                actor=ACTOR,
                reason=reason,
                expected_version=block["version"],
            )

        results = await asyncio.gather(
            publish("Concurrent CMS approval A"),
            publish("Concurrent CMS approval B"),
            return_exceptions=True,
        )

        succeeded = [item for item in results if not isinstance(item, Exception)]
        rejected = [item for item in results if isinstance(item, Exception)]
        assert len(succeeded) == 1, results
        assert len(rejected) == 1
        assert isinstance(rejected[0], ContentError), rejected[0]
        assert rejected[0].status_code == 409
        assert rejected[0].code == "version_conflict"

        stored = await database.content_blocks.find_one({"id": block["id"]})
        assert stored["status"] == "published"
        assert stored["version"] == block["version"] + 1
        assert await database.content_publications.count_documents({}) == 1
        assert (
            await database.audit_events.count_documents(
                {"action": "content.block_published"}
            )
            == 1
        )
    finally:
        await client.drop_database(database_name)
        client.close()


async def run_publish_audit_failure_rolls_back(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    try:
        service, database = await build_service(client, database_name)
        await ensure_content_indexes(database)
        block = await seed_preview_block(service)
        versions_before = await database.content_block_versions.count_documents({})

        failing, _database = await build_service(
            client, database_name, failing_audit=True
        )
        with pytest.raises(RuntimeError, match="injected CMS audit storage failure"):
            await failing.publish_block(
                block["id"],
                actor=ACTOR,
                reason="Publish must roll back with failed audit",
                expected_version=block["version"],
            )

        stored = await database.content_blocks.find_one({"id": block["id"]})
        assert stored["status"] == "preview"
        assert stored["version"] == block["version"]
        assert await database.content_publications.count_documents({}) == 0
        assert (
            await database.content_block_versions.count_documents({}) == versions_before
        )
        assert (
            await database.audit_events.count_documents(
                {"action": "content.block_published"}
            )
            == 0
        )
    finally:
        await client.drop_database(database_name)
        client.close()


async def run_concurrent_rollback_has_one_winner(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    try:
        service, database = await build_service(client, database_name)
        await ensure_content_indexes(database)
        block = await seed_preview_block(service)
        published = await service.publish_block(
            block["id"],
            actor=ACTOR,
            reason="Publish before concurrent rollback",
            expected_version=block["version"],
        )
        published_version = await database.content_block_versions.find_one(
            {"content_block_id": block["id"], "event": "published"}
        )

        async def rollback(reason):
            return await service.rollback_block(
                block["id"],
                version_id=published_version["id"],
                actor=ACTOR,
                reason=reason,
                expected_version=published["version"],
            )

        results = await asyncio.gather(
            rollback("Concurrent CMS rollback A"),
            rollback("Concurrent CMS rollback B"),
            return_exceptions=True,
        )

        succeeded = [item for item in results if not isinstance(item, Exception)]
        rejected = [item for item in results if isinstance(item, Exception)]
        assert len(succeeded) == 1, results
        assert len(rejected) == 1
        assert isinstance(rejected[0], ContentError), rejected[0]
        assert rejected[0].status_code == 409
        assert rejected[0].code == "version_conflict"

        stored = await database.content_blocks.find_one({"id": block["id"]})
        assert stored["status"] == "draft"
        assert stored["version"] == published["version"] + 1
        assert await database.content_publications.count_documents({}) == 1
        assert (
            await database.audit_events.count_documents(
                {"action": "content.block_rolled_back"}
            )
            == 1
        )
    finally:
        await client.drop_database(database_name)
        client.close()


def test_concurrent_content_publish_has_one_domain_winner(
    transaction_database_name,
):
    asyncio.run(run_concurrent_publish_has_one_winner(transaction_database_name))


def test_content_publish_audit_failure_rolls_back_every_write(
    transaction_database_name,
):
    asyncio.run(run_publish_audit_failure_rolls_back(transaction_database_name))


def test_concurrent_content_rollback_has_one_domain_winner(
    transaction_database_name,
):
    asyncio.run(run_concurrent_rollback_has_one_winner(transaction_database_name))
