"""Real replica-set evidence for Portfolio lifecycle integrity."""

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

from database_capabilities import probe_database_capabilities  # noqa: E402
from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402
from portfolio_service import PortfolioDomainError, PortfolioService  # noqa: E402
from transaction_execution import TransactionExecutor  # noqa: E402
from transaction_guard import TransactionMutationGuard  # noqa: E402

ACTOR = {"id": "portfolio-author", "email": "author@niuva.test"}
APPROVER = {"id": "portfolio-approver", "email": "approver@niuva.test"}
DRAFT = {
    "title_id": "Purwarupa Enclosure",
    "title_en": "Enclosure Prototype",
    "category": "Prototyping",
    "description_id": "Validasi desain.",
    "description_en": "Design validation.",
    "images": ["portfolio/one.webp"],
    "featured": False,
}
COMPLETED_PROJECT = {
    "id": "project-portfolio-1",
    "status": "completed",
    "quote_snapshot": {
        "scope_snapshot": {
            "need": "Prototype enclosure",
            "company": "PT Private Customer",
            "brief": "Private brief",
        },
        "total_minor": 3000000,
    },
}


async def build_service(client, database_name):
    database = client[database_name]
    capabilities = await probe_database_capabilities(client, database_name)
    assert capabilities.transactions is True
    executor = TransactionExecutor(client, lambda: capabilities)
    return (
        PortfolioService(
            db=database,
            transaction_guard=TransactionMutationGuard(executor),
        ),
        database,
    )


async def ensure_indexes(database):
    await database.portfolio.create_index("id", unique=True, name="uq_portfolio_id")
    await database.portfolio.create_index(
        "source_project_id",
        unique=True,
        name="uq_portfolio_source_project",
        partialFilterExpression={"source_project_id": {"$type": "string"}},
    )
    await database.portfolio_revisions.create_index(
        "id", unique=True, name="uq_portfolio_revision_id"
    )
    await database.portfolio_revisions.create_index(
        [("portfolio_id", 1), ("revision", 1)],
        unique=True,
        name="uq_portfolio_revision",
    )
    await database.portfolio_publications.create_index(
        "id", unique=True, name="uq_portfolio_publication_id"
    )


async def publish(service, payload):
    entry = await service.create(payload, actor=ACTOR)
    for target in ("review", "preview", "published"):
        entry = await service.transition(
            entry["id"],
            target_status=target,
            expected_version=entry["version"],
            reason=f"Move Portfolio to {target}",
            actor=APPROVER,
            can_write=True,
            can_publish=True,
            can_archive=True,
        )
    return entry


async def run_concurrent_project_promotion(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    try:
        service, database = await build_service(client, database_name)
        await ensure_indexes(database)
        await database.b2b_projects.insert_one(dict(COMPLETED_PROJECT))

        results = await asyncio.gather(
            service.create_from_project(COMPLETED_PROJECT["id"], actor=ACTOR),
            service.create_from_project(COMPLETED_PROJECT["id"], actor=ACTOR),
            return_exceptions=True,
        )

        assert all(not isinstance(item, Exception) for item in results), results
        assert results[0]["id"] == results[1]["id"]
        assert await database.portfolio.count_documents({}) == 1
        assert await database.portfolio_revisions.count_documents({}) == 1
        stored = await database.portfolio.find_one({}, {"_id": 0})
        assert stored["source_project_id"] == COMPLETED_PROJECT["id"]
        assert "PT Private Customer" not in repr(stored)
        assert "Private brief" not in repr(stored)
        assert "3000000" not in repr(stored)
    finally:
        await client.drop_database(database_name)
        client.close()


async def run_concurrent_reorder(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    try:
        service, database = await build_service(client, database_name)
        await ensure_indexes(database)
        first = await publish(service, dict(DRAFT))
        second = await publish(
            service,
            {**DRAFT, "title_id": "Portfolio second", "title_en": "Second"},
        )
        expected_versions = {
            first["id"]: first["version"],
            second["id"]: second["version"],
        }

        results = await asyncio.gather(
            service.reorder(
                [first["id"], second["id"]],
                expected_versions=expected_versions,
                actor=ACTOR,
            ),
            service.reorder(
                [second["id"], first["id"]],
                expected_versions=expected_versions,
                actor=ACTOR,
            ),
            return_exceptions=True,
        )

        succeeded = [item for item in results if not isinstance(item, Exception)]
        rejected = [item for item in results if isinstance(item, Exception)]
        assert len(succeeded) == 1, results
        assert len(rejected) == 1, results
        assert isinstance(rejected[0], PortfolioDomainError), rejected[0]
        assert rejected[0].code == "version_conflict"

        aggregate_order = [
            item["id"]
            for item in await database.portfolio.find({}, {"_id": 0})
            .sort("display_order", 1)
            .to_list(10)
        ]
        public_order = [
            item["portfolio_id"]
            for item in await database.portfolio_publications.find(
                {"retired_at": None}, {"_id": 0}
            )
            .sort("snapshot.display_order", 1)
            .to_list(10)
        ]
        assert public_order == aggregate_order
        assert await database.portfolio_publications.count_documents({}) == 4
        assert (
            await database.portfolio_publications.count_documents(
                {"retired_at": {"$ne": None}}
            )
            == 2
        )
    finally:
        await client.drop_database(database_name)
        client.close()


def test_concurrent_project_promotion_returns_one_portfolio(
    transaction_database_name,
):
    asyncio.run(run_concurrent_project_promotion(transaction_database_name))


def test_concurrent_reorder_has_one_atomic_winner(transaction_database_name):
    asyncio.run(run_concurrent_reorder(transaction_database_name))
