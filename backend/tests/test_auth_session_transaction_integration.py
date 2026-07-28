import asyncio
import os
import sys
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from auth_session import (  # noqa: E402
    AdminSessionModule,
    MongoSessionStore,
    SessionExpiredError,
    SessionReplayError,
)
from database_capabilities import probe_database_capabilities  # noqa: E402
from transaction_execution import TransactionExecutor  # noqa: E402
from transaction_guard import TransactionMutationGuard  # noqa: E402


@pytest.mark.skipif(
    os.environ.get("NIUVA_RUN_REAL_TRANSACTION_TESTS") != "1"
    or not os.environ.get("MONGO_TRANSACTION_TEST_URL"),
    reason="Explicit real transaction opt-in and URL are required",
)
def test_real_replica_set_rotates_once_and_revokes_replayed_family(
    transaction_database_name,
):
    loaded_motor = sys.modules.get("motor.motor_asyncio")
    if loaded_motor is not None and getattr(loaded_motor, "__file__", None) is None:
        sys.modules.pop("motor.motor_asyncio", None)
        sys.modules.pop("motor", None)
    from motor.motor_asyncio import AsyncIOMotorClient

    client = AsyncIOMotorClient(os.environ["MONGO_TRANSACTION_TEST_URL"])
    database = client[transaction_database_name]

    async def scenario():
        try:
            capabilities = await probe_database_capabilities(
                client, transaction_database_name
            )
            guard = TransactionMutationGuard(
                TransactionExecutor(client, lambda: capabilities),
                lambda: True,
            )

            async def current_version(user_id, session):
                user = await database.users.find_one(
                    {"id": user_id}, session=session
                )
                return user.get("token_version", 0) if user else None

            module = AdminSessionModule(
                store=MongoSessionStore(database),
                transaction_guard=guard,
                csrf_key=b"integration-csrf-key-at-least-32-bytes",
                user_version_provider=current_version,
            )
            user = {"id": "admin-1", "token_version": 0}
            await database.users.insert_one(user)
            first = await module.create_admin_session(user, False, {})

            results = await asyncio.gather(
                module.rotate_admin_session(
                    None, {"session_secret": first.session_secret}
                ),
                module.rotate_admin_session(
                    None, {"session_secret": first.session_secret}
                ),
                return_exceptions=True,
            )
            grants = [result for result in results if not isinstance(result, Exception)]
            errors = [result for result in results if isinstance(result, Exception)]
            assert len(grants) == 1, [
                f"{type(result).__name__}: {result}" for result in results
            ]
            assert len(errors) == 1
            assert isinstance(errors[0], SessionReplayError)

            record = await database.admin_sessions.find_one(
                {"id": first.session_id}, {"_id": 0}
            )
            assert record["revoked_at"] is not None
            assert record["revocation_reason"] == "session_secret_replay"
            assert first.access_secret not in repr(record)
            assert first.session_secret not in repr(record)

            with pytest.raises(SessionExpiredError):
                await module.authenticate_admin_session(
                    {"access_secret": grants[0].access_secret}
                )
        finally:
            await client.drop_database(transaction_database_name)
            client.close()

    asyncio.run(scenario())
