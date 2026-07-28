"""Real replica-set evidence for atomic password-reset completion.

Opt in with NIUVA_RUN_REAL_TRANSACTION_TESTS=1 and
MONGO_TRANSACTION_TEST_URL. The database name is unique per test and is
dropped in cleanup; no shared data is read or mutated.
"""

from __future__ import annotations

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

from auth_password import build_password_module  # noqa: E402
from auth_recovery import (  # noqa: E402
    MongoRecoveryStore,
    PasswordResetCompletion,
    PublicSiteOrigin,
    build_recovery_module,
)
from database_capabilities import probe_database_capabilities  # noqa: E402
from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402
from transaction_execution import TransactionExecutor  # noqa: E402
from transaction_guard import TransactionMutationGuard  # noqa: E402


class CapturingDelivery:
    def __init__(self):
        self.reset_url = None
        self.changed = []

    async def send_password_reset(self, *, email, reset_url, expires_at):
        del email, expires_at
        self.reset_url = reset_url

    async def send_password_changed(self, *, email):
        self.changed.append(email)


async def run_concurrent_completion(database_name, blocklist_path):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    try:
        capabilities = await probe_database_capabilities(client, database_name)
        assert capabilities.transactions is True
        database = client[database_name]
        executor = TransactionExecutor(client, lambda: capabilities)
        guard = TransactionMutationGuard(executor, lambda: True)
        delivery = CapturingDelivery()
        passwords = build_password_module(
            blocklist_path=blocklist_path,
            argon2_writes_enabled=True,
        )
        recovery = build_recovery_module(
            store=MongoRecoveryStore(database),
            transaction_guard=guard,
            passwords=passwords,
            delivery=delivery,
            public_site_origin=PublicSiteOrigin.parse("https://accounts.niuva.test"),
        )
        user = {
            "id": "concurrent-user",
            "name": "Concurrent User",
            "email": "concurrent@niuva.test",
            "roles": ["super_admin"],
            "status": "active",
            "access_state": "approved",
            "password_hash": "legacy-fixture",
            "token_version": 0,
        }
        await database.users.insert_one(user)
        await recovery.request_password_reset(user["email"], {})
        raw_token = delivery.reset_url.split("token=", 1)[1]

        results = await asyncio.gather(
            recovery.complete_password_reset(
                raw_token, "Concurrent reset password 2026"
            ),
            recovery.complete_password_reset(
                raw_token, "Concurrent reset password 2026"
            ),
            return_exceptions=True,
        )

        assert not [item for item in results if isinstance(item, Exception)], results
        completions = [
            item for item in results if isinstance(item, PasswordResetCompletion)
        ]
        assert sum(item.ok for item in completions) == 1
        assert sum(not item.ok for item in completions) == 1

        stored_user = await database.users.find_one({"id": user["id"]})
        assert stored_user["password_hash"].startswith("$argon2id$")
        assert stored_user["token_version"] == 1
        tokens = await database.password_reset_tokens.find(
            {"user_id": user["id"]}
        ).to_list(10)
        assert len(tokens) == 1
        assert tokens[0]["active"] is False
        assert tokens[0]["invalidation_reason"] == "consumed"
        assert delivery.changed == [user["email"]]
    finally:
        await client.drop_database(database_name)
        client.close()


@pytest.mark.parametrize("_attempt", range(5))
def test_two_real_concurrent_completions_yield_exactly_one_success(
    transaction_database_name, tmp_path, _attempt
):
    blocklist = tmp_path / "password-blocklist.txt"
    blocklist.write_text("known compromised phrase\n", encoding="utf-8")
    asyncio.run(run_concurrent_completion(transaction_database_name, blocklist))
