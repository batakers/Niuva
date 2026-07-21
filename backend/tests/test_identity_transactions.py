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


class _BarrierPolicyStateCollection:
    def __init__(self, collection):
        self._collection = collection
        self._arrivals = 0
        self._first_lock_acquired = asyncio.Event()
        self._second_attempt_finished = asyncio.Event()

    async def update_one(self, query, update, **options):
        if update.get("$inc") == {"version": 1}:
            self._arrivals += 1
            if self._arrivals == 1:
                result = await self._collection.update_one(query, update, **options)
                self._first_lock_acquired.set()
                await self._second_attempt_finished.wait()
                return result
            await self._first_lock_acquired.wait()
            try:
                return await self._collection.update_one(query, update, **options)
            finally:
                self._second_attempt_finished.set()
        return await self._collection.update_one(query, update, **options)


class _BarrierDatabase:
    def __init__(self, database):
        self._database = database
        self.identity_policy_state = _BarrierPolicyStateCollection(
            database.identity_policy_state
        )

    def __getattr__(self, name):
        return getattr(self._database, name)


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


async def run_real_concurrent_owner_demotion_contract(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    database = client[database_name]
    guarded_database = _BarrierDatabase(database)
    executor = TransactionExecutor(
        client,
        lambda: DatabaseCapabilities(transactions=True),
    )
    guard = TransactionMutationGuard(executor, lambda: True)
    app = FastAPI()
    app.include_router(
        build_identity_router(
            get_db=lambda: guarded_database,
            get_transaction_guard=lambda: guard,
            require_permission=_require_owner,
            safe_user=_safe_user,
        )
    )
    owners = [
        {
            "id": owner_id,
            "roles": ["super_admin"],
            "status": "active",
            "access_state": "approved",
        }
        for owner_id in ("owner-concurrent-1", "owner-concurrent-2")
    ]
    payload = {
        "roles": ["operations"],
        "status": "active",
        "access_state": "approved",
        "reason_code": "role_access_removed",
    }
    try:
        await database.identity_policy_state.create_index("key", unique=True)
        await database.users.insert_many(owners)
        transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://test"
        ) as api:
            responses = await asyncio.gather(
                api.put("/admin/users/owner-concurrent-1/access", json=payload),
                api.put("/admin/users/owner-concurrent-2/access", json=payload),
            )

        assert sorted(response.status_code for response in responses) == [200, 409]
        conflict = next(
            response for response in responses if response.status_code == 409
        )
        assert conflict.json() == {
            "detail": "Identity access policy changed concurrently"
        }
        assert "writeconflict" not in conflict.text.lower()
        assert (
            await database.users.count_documents(
                {
                    "roles": ["super_admin"],
                    "status": "active",
                    "access_state": "approved",
                }
            )
            == 1
        )
        assert (
            await database.audit_events.count_documents(
                {"action": "user.access_updated"}
            )
            == 1
        )
        policy = await database.identity_policy_state.find_one(
            {"_id": "identity_access_policy"}
        )
        assert policy["approved_owner_count"] == 1
    finally:
        await client.drop_database(database_name)
        client.close()


def test_real_concurrent_owner_demotions_return_conflict_and_preserve_one_owner(
    transaction_database_name,
):
    asyncio.run(run_real_concurrent_owner_demotion_contract(transaction_database_name))
