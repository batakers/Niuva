import asyncio
import os

import pytest

MONGO_TRANSACTION_TEST_URL = os.environ.get("MONGO_TRANSACTION_TEST_URL")
if not MONGO_TRANSACTION_TEST_URL:
    pytest.skip(
        "MONGO_TRANSACTION_TEST_URL is required for real transaction tests",
        allow_module_level=True,
    )

from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402

from database_capabilities import probe_database_capabilities  # noqa: E402
from transaction_execution import TransactionExecutor  # noqa: E402


async def run_real_transaction_contract(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    database = client[database_name]
    try:
        collections_before_probe = await database.list_collection_names()
        capabilities = await probe_database_capabilities(client, database_name)
        collections_after_probe = await database.list_collection_names()
        assert capabilities.transactions is True
        assert collections_after_probe == collections_before_probe
        assert "__transaction_capability_probe__" not in collections_after_probe
        executor = TransactionExecutor(client, lambda: capabilities)

        async def committed(session):
            await database.transaction_evidence.insert_one(
                {"_id": "committed", "value": 1},
                session=session,
            )
            return "committed"

        assert await executor.execute(
            committed, operation_name="test.commit"
        ) == "committed"
        assert await database.transaction_evidence.count_documents({}) == 1

        async def aborted(session):
            await database.transaction_evidence.insert_one(
                {"_id": "aborted", "value": 2},
                session=session,
            )
            raise RuntimeError("force abort")

        with pytest.raises(RuntimeError, match="force abort"):
            await executor.execute(aborted, operation_name="test.abort")
        assert await database.transaction_evidence.find_one({"_id": "aborted"}) is None
        assert await database.transaction_evidence.count_documents({}) == 1
    finally:
        await client.drop_database(database_name)
        client.close()


def test_real_probe_commit_abort_and_cleanup(transaction_database_name):
    asyncio.run(run_real_transaction_contract(transaction_database_name))
