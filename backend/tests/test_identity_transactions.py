import asyncio
import os

import httpx
import pytest
from fastapi import FastAPI

MONGO_TRANSACTION_TEST_URL = os.environ.get("MONGO_TRANSACTION_TEST_URL")
if not MONGO_TRANSACTION_TEST_URL:
    pytest.skip(
        "MONGO_TRANSACTION_TEST_URL is required for real transaction tests",
        allow_module_level=True,
    )

from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402

from database_capabilities import DatabaseCapabilities  # noqa: E402
from identity_routes import build_identity_router  # noqa: E402
from transaction_execution import TransactionExecutor  # noqa: E402
from transaction_guard import TransactionMutationGuard  # noqa: E402


def _require_owner(_permission):
    async def dependency():
        return {"id": "owner-real"}

    return dependency


def _safe_user(user):
    return {
        key: value for key, value in user.items() if key not in {"_id", "password_hash"}
    }


async def run_real_identity_transaction_contract(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    database = client[database_name]
    executor = TransactionExecutor(
        client,
        lambda: DatabaseCapabilities(transactions=True),
    )
    guard = TransactionMutationGuard(executor, lambda: True)
    app = FastAPI()
    app.include_router(
        build_identity_router(
            get_db=lambda: database,
            get_transaction_guard=lambda: guard,
            require_permission=_require_owner,
            safe_user=_safe_user,
        )
    )
    owner = {
        "id": "owner-real",
        "roles": ["super_admin"],
        "status": "active",
        "access_state": "approved",
    }
    success_target = {
        "id": "target-success",
        "roles": ["retail_customer"],
        "status": "active",
        "access_state": "approved",
    }
    abort_target = {
        "id": "target-abort",
        "roles": ["retail_customer"],
        "status": "active",
        "access_state": "approved",
    }
    try:
        await database.identity_policy_state.create_index("key", unique=True)
        await database.users.insert_many([owner, success_target, abort_target])
        transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://test"
        ) as api:
            payload = {
                "roles": ["operations"],
                "status": "active",
                "access_state": "approved",
                "reason_code": "role_review_approved",
            }
            committed = await api.put(
                "/admin/users/target-success/access",
                json=payload,
            )
            assert committed.status_code == 200
            assert (await database.users.find_one({"id": "target-success"}))[
                "roles"
            ] == ["operations"]
            assert (
                await database.audit_events.count_documents(
                    {"target_id": "target-success"}
                )
                == 1
            )
            policy_before_abort = await database.identity_policy_state.find_one(
                {"_id": "identity_access_policy"}
            )
            assert policy_before_abort["approved_owner_count"] == 1

            await database.command(
                {
                    "collMod": "audit_events",
                    "validator": {"$expr": {"$eq": [1, 0]}},
                    "validationLevel": "strict",
                    "validationAction": "error",
                }
            )
            aborted = await api.put(
                "/admin/users/target-abort/access",
                json={**payload, "reason_code": "emergency_override"},
            )
            assert aborted.status_code == 500

        unchanged = await database.users.find_one({"id": "target-abort"})
        assert unchanged["roles"] == ["retail_customer"]
        assert (
            await database.audit_events.count_documents({"target_id": "target-abort"})
            == 0
        )
        assert await database.audit_events.count_documents({}) == 1
        policy_after_abort = await database.identity_policy_state.find_one(
            {"_id": "identity_access_policy"}
        )
        assert policy_after_abort == policy_before_abort
    finally:
        await client.drop_database(database_name)
        client.close()


def test_real_access_update_and_forced_audit_failure_are_atomic(
    transaction_database_name,
):
    asyncio.run(run_real_identity_transaction_contract(transaction_database_name))
