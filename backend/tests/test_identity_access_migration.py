import asyncio
import copy
import importlib.util
import os
import sys
import types
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from database_capabilities import DatabaseCapabilities  # noqa: E402
from permissions import (  # noqa: E402
    ROLE_POLICY_VERSION,
    SUPERSEDED_INTERNAL_ROLE_MARKERS,
    canonical_roles,
)
from transaction_execution import TransactionExecutor, TransactionUnavailableError  # noqa: E402
from transaction_guard import TransactionMutationGuard  # noqa: E402


def load_migration():
    path = BACKEND_DIR / "migrations" / "003_identity_access_policy.py"
    spec = importlib.util.spec_from_file_location("identity_access_policy_migration", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class FakeCursor:
    def __init__(self, items):
        self.items = [copy.deepcopy(item) for item in items]
        self.position = 0

    def __aiter__(self):
        self.position = 0
        return self

    async def __anext__(self):
        if self.position >= len(self.items):
            raise StopAsyncIteration
        item = copy.deepcopy(self.items[self.position])
        self.position += 1
        return item


class FakeCollection:
    def __init__(self, items=None):
        self.items = [copy.deepcopy(item) for item in (items or [])]
        self.operations = []
        self.indexes = []

    @classmethod
    def matches(cls, item, query):
        for key, expected in query.items():
            if key == "$or":
                if not any(cls.matches(item, branch) for branch in expected):
                    return False
                continue
            actual = item.get(key)
            if isinstance(expected, dict):
                if "$exists" in expected and (key in item) != expected["$exists"]:
                    return False
                if "$ne" in expected and actual == expected["$ne"]:
                    return False
                if "$in" in expected:
                    values = actual if isinstance(actual, list) else [actual]
                    if not any(value in expected["$in"] for value in values):
                        return False
                continue
            if actual != expected:
                return False
        return True

    def find(self, query, projection=None, **options):
        self.operations.append(("find", dict(options)))
        return FakeCursor(item for item in self.items if self.matches(item, query))

    async def find_one(self, query, projection=None, **options):
        self.operations.append(("find_one", dict(options)))
        for item in self.items:
            if self.matches(item, query):
                return copy.deepcopy(item)
        return None

    async def update_one(self, query, update, **options):
        self.operations.append(("update_one", dict(options)))
        for item in self.items:
            if self.matches(item, query):
                before = copy.deepcopy(item)
                item.update(copy.deepcopy(update.get("$set", {})))
                for key in update.get("$unset", {}):
                    item.pop(key, None)
                for key, value in update.get("$inc", {}).items():
                    item[key] = item.get(key, 0) + value
                return types.SimpleNamespace(matched_count=1, modified_count=int(item != before))
        if options.get("upsert"):
            item = {
                key: value for key, value in query.items()
                if not key.startswith("$") and not isinstance(value, dict)
            }
            item.update(copy.deepcopy(update.get("$setOnInsert", {})))
            item.update(copy.deepcopy(update.get("$set", {})))
            self.items.append(item)
            return types.SimpleNamespace(matched_count=0, modified_count=0)
        return types.SimpleNamespace(matched_count=0, modified_count=0)

    async def insert_one(self, item, **options):
        self.operations.append(("insert_one", dict(options)))
        self.items.append(copy.deepcopy(item))
        return types.SimpleNamespace(inserted_id=item.get("id"))

    async def create_index(self, keys, **options):
        self.indexes.append((keys, dict(options)))
        return str(keys)


class FakeDatabase:
    def __init__(self, users):
        self.users = FakeCollection(users)
        self.audit_events = FakeCollection()
        self.identity_policy_state = FakeCollection()


class RecordingGuard:
    def __init__(self, database):
        self.database = database
        self.session = object()
        self.calls = []
        self.enabled_provider = lambda: True
        self.executor = types.SimpleNamespace(
            capability_provider=lambda: DatabaseCapabilities(transactions=True)
        )

    async def run(self, callback, *, operation_name, retry_safe=False):
        self.calls.append((operation_name, retry_safe))
        snapshots = {
            name: copy.deepcopy(collection.items)
            for name, collection in vars(self.database).items()
            if isinstance(collection, FakeCollection)
        }
        try:
            return await callback(self.session)
        except BaseException:
            for name, items in snapshots.items():
                getattr(self.database, name).items = items
            raise


class RejectingExecutor:
    def __init__(self, capability_available):
        self.capability_provider = lambda: DatabaseCapabilities(
            transactions=capability_available
        )

    def reject_unavailable(self, **_options):
        raise TransactionUnavailableError()

    async def execute(self, *_args, **_kwargs):
        raise AssertionError("unavailable migration must not start a transaction")


def user(user_id, **overrides):
    document = {"id": user_id, "status": "active", "access_state": "approved"}
    document.update(overrides)
    return document


def test_default_dry_run_is_read_only_and_reports_only_safe_aggregates():
    migration = load_migration()
    database = FakeDatabase([
        user("opaque-admin", role="admin", email="private@example.com", password_hash="secret"),
        user("opaque-client", role="client"),
    ])

    report = asyncio.run(migration.run(database))

    assert set(report) == {"policy_version", "categories", "remediation_ids", "failures"}
    assert report["policy_version"] == ROLE_POLICY_VERSION
    assert report["categories"]["legacy_internal_review_required"] == 1
    assert report["categories"]["legacy_client"] == 1
    assert report["remediation_ids"] == {"access_review_required": ["opaque-admin"]}
    assert report["failures"] == {"total": 0}
    assert "private@example.com" not in repr(report) and "secret" not in repr(report)
    assert database.users.items[0]["role"] == "admin"
    assert database.users.indexes == []
    assert database.identity_policy_state.items == []
    assert database.audit_events.items == []


@pytest.mark.parametrize(
    ("bootstrap_owner_id", "enabled", "capability"),
    [(None, True, True), ("bootstrap-owner", False, True), ("bootstrap-owner", True, False)],
)
def test_apply_rejects_missing_owner_or_transaction_gate_before_any_write(
    bootstrap_owner_id, enabled, capability
):
    migration = load_migration()
    database = FakeDatabase([user("bootstrap-owner", role="admin")])
    guard = TransactionMutationGuard(RejectingExecutor(capability), lambda: enabled)

    with pytest.raises((migration.MigrationSafetyError, TransactionUnavailableError)):
        asyncio.run(migration.run(
            database, apply=True, bootstrap_owner_id=bootstrap_owner_id, guard=guard
        ))

    assert all(operation != "update_one" for operation, _ in database.users.operations)
    assert database.users.indexes == []
    assert database.identity_policy_state.items == []
    assert database.audit_events.items == []


@pytest.mark.parametrize("bootstrap", [user("bootstrap-owner", role="admin", status="disabled"), None])
def test_apply_requires_an_existing_active_bootstrap_owner(bootstrap):
    migration = load_migration()
    database = FakeDatabase([bootstrap] if bootstrap else [])
    guard = RecordingGuard(database)

    with pytest.raises(migration.MigrationSafetyError):
        asyncio.run(migration.run(
            database, apply=True, bootstrap_owner_id="bootstrap-owner", guard=guard
        ))

    assert guard.calls == []
    assert database.users.indexes == []
    assert database.audit_events.items == []


@pytest.mark.parametrize("legacy_role", sorted(SUPERSEDED_INTERNAL_ROLE_MARKERS))
def test_apply_quarantines_every_superseded_internal_role(legacy_role):
    migration = load_migration()
    database = FakeDatabase([
        user("bootstrap-owner", role="admin"),
        user("legacy-internal", roles=[legacy_role]),
    ])
    guard = RecordingGuard(database)

    asyncio.run(migration.run(
        database,
        apply=True,
        bootstrap_owner_id="bootstrap-owner",
        guard=guard,
    ))

    migrated = next(
        account for account in database.users.items
        if account["id"] == "legacy-internal"
    )
    assert migrated["roles"] == []
    assert migrated["access_state"] == "access_review_required"
    assert migrated[migration.EVIDENCE_FIELD]["legacy_roles"] == [legacy_role]

def migration_matrix():
    return [
        user("bootstrap-owner", role="admin"),
        user("legacy-admin", role="admin", roles=["super_admin"]),
        user("old-manager", roles=["manager_approver"]),
        user("legacy-client", role="client"),
        user(
            "canonical-operations",
            roles=["operations"],
            role_policy_version=ROLE_POLICY_VERSION,
        ),
    ]


def test_apply_classifies_fail_closed_audits_each_change_and_is_idempotent():
    migration = load_migration()
    database = FakeDatabase(migration_matrix())
    guard = RecordingGuard(database)

    first = asyncio.run(migration.run(
        database, apply=True, bootstrap_owner_id="bootstrap-owner", guard=guard
    ))

    by_id = {item["id"]: item for item in database.users.items}
    assert canonical_roles(by_id["bootstrap-owner"]) == ("super_admin",)
    assert by_id["bootstrap-owner"]["access_state"] == "approved"
    assert canonical_roles(by_id["legacy-admin"]) == ()
    assert by_id["legacy-admin"]["roles"] == []
    assert by_id["legacy-admin"]["access_state"] == "access_review_required"
    assert canonical_roles(by_id["old-manager"]) == ()
    assert by_id["legacy-client"]["roles"] == ["retail_customer"]
    assert by_id["legacy-client"]["access_state"] == "approved"
    assert by_id["canonical-operations"] == migration_matrix()[-1]
    assert all("role" not in item for item in by_id.values())
    assert by_id["legacy-admin"][migration.EVIDENCE_FIELD] == {
        "policy_version": ROLE_POLICY_VERSION,
        "legacy_role": "admin",
        "legacy_roles": ["super_admin"],
    }
    assert by_id["old-manager"][migration.EVIDENCE_FIELD]["legacy_roles"] == [
        "manager_approver"
    ]
    assert first["categories"]["bootstrap_owner_assigned"] == 1
    assert first["categories"]["legacy_internal_review_required"] == 2
    assert first["categories"]["legacy_client"] == 1
    assert guard.calls == [("identity.policy.migrate_account", False)] * 4
    assert len(database.audit_events.items) == 4
    assert {event["action"] for event in database.audit_events.items} == {
        "identity.policy_migrated",
        "identity.bootstrap_owner_assigned",
    }
    assert all(
        set(event) == {
            "id", "actor_user_id", "action", "target_type", "target_id",
            "previous", "result", "reason_code", "policy_version", "created_at",
        }
        for event in database.audit_events.items
    )
    session_options = [
        options
        for collection in (
            database.users,
            database.identity_policy_state,
            database.audit_events,
        )
        for operation, options in collection.operations
        if operation in {"find_one", "update_one", "insert_one"} and "session" in options
    ]
    assert session_options and all(
        options["session"] is guard.session for options in session_options
    )
    assert database.identity_policy_state.items == [{
        "_id": "identity_access_policy",
        "key": "identity_access_policy",
        "approved_owner_count": 1,
        "policy_version": ROLE_POLICY_VERSION,
        "version": 1,
    }]
    policy_writes = [
        options
        for operation, options in database.identity_policy_state.operations
        if operation == "update_one"
    ]
    assert policy_writes
    assert all(
        options.get("session") is guard.session
        for options in policy_writes
    )
    assert ("key", {"unique": True}) in database.identity_policy_state.indexes
    assert ("access_state", {}) in database.users.indexes
    assert ("roles", {}) in database.users.indexes
    assert ("role_policy_version", {}) in database.users.indexes

    calls_before = list(guard.calls)
    audit_before = copy.deepcopy(database.audit_events.items)
    users_before = copy.deepcopy(database.users.items)
    second = asyncio.run(migration.run(
        database, apply=True, bootstrap_owner_id="bootstrap-owner", guard=guard
    ))
    assert second["categories"]["already_current"] == 5
    assert guard.calls == calls_before
    assert database.audit_events.items == audit_before
    assert database.users.items == users_before
    assert sum(canonical_roles(item) == ("super_admin",) for item in database.users.items) == 1


def test_apply_assigns_reviewed_bootstrap_and_preserves_verified_current_owners():
    migration = load_migration()
    selected = user(
        "reviewed-current-customer",
        roles=["retail_customer"],
        role_policy_version=ROLE_POLICY_VERSION,
    )
    previous_owner = user(
        "unreviewed-current-owner",
        roles=["super_admin"],
        role_policy_version=ROLE_POLICY_VERSION,
    )
    unchanged_operations = user(
        "canonical-operations",
        roles=["operations"],
        role_policy_version=ROLE_POLICY_VERSION,
    )
    database = FakeDatabase([selected, previous_owner, unchanged_operations])
    guard = RecordingGuard(database)

    asyncio.run(migration.run(
        database,
        apply=True,
        bootstrap_owner_id=selected["id"],
        guard=guard,
    ))

    by_id = {item["id"]: item for item in database.users.items}
    assert canonical_roles(by_id[selected["id"]]) == ("super_admin",)
    assert by_id[previous_owner["id"]] == previous_owner
    assert by_id[unchanged_operations["id"]] == unchanged_operations
    assert sum(
        canonical_roles(item) == ("super_admin",)
        for item in database.users.items
    ) == 2
    assert database.identity_policy_state.items[0]["approved_owner_count"] == 2

    asyncio.run(migration.run(
        database,
        rollback=True,
        bootstrap_owner_id=selected["id"],
        guard=guard,
    ))
    by_id = {item["id"]: item for item in database.users.items}
    assert by_id[selected["id"]]["roles"] == []
    assert by_id[selected["id"]]["access_state"] == "access_review_required"
    assert by_id[previous_owner["id"]] == previous_owner
    assert database.identity_policy_state.items[0]["approved_owner_count"] == 1



def test_rollback_is_scoped_audited_and_never_restores_runtime_authority():
    migration = load_migration()
    database = FakeDatabase(migration_matrix())
    guard = RecordingGuard(database)
    asyncio.run(migration.run(
        database, apply=True, bootstrap_owner_id="bootstrap-owner", guard=guard
    ))
    calls_before = len(guard.calls)
    events_before = len(database.audit_events.items)

    report = asyncio.run(migration.run(
        database, rollback=True, bootstrap_owner_id="bootstrap-owner", guard=guard
    ))

    migrated_ids = {"bootstrap-owner", "legacy-admin", "old-manager", "legacy-client"}
    by_id = {item["id"]: item for item in database.users.items}
    for user_id in migrated_ids:
        account = by_id[user_id]
        assert canonical_roles(account) == ()
        assert account["roles"] == []
        assert account["access_state"] == "access_review_required"
        assert "role" not in account
        assert migration.EVIDENCE_FIELD not in account
        assert migration.MARKER_FIELD not in account
        assert "role_policy_version" not in account
    assert by_id["canonical-operations"] == migration_matrix()[-1]
    assert len(guard.calls) - calls_before == len(migrated_ids)
    rollback_events = database.audit_events.items[events_before:]
    assert len(rollback_events) == len(migrated_ids)
    assert all(
        event["action"] == "identity.policy_migration_rolled_back"
        for event in rollback_events
    )
    assert database.identity_policy_state.items[0]["approved_owner_count"] == 0
    rollback_policy_writes = [
        options
        for operation, options in database.identity_policy_state.operations
        if operation == "update_one"
    ][1:]
    assert rollback_policy_writes
    assert all(
        options.get("session") is guard.session
        for options in rollback_policy_writes
    )
    assert report["categories"]["rolled_back"] == len(migrated_ids)


@pytest.mark.skipif(
    not os.environ.get("MONGO_TRANSACTION_TEST_URL"),
    reason="MONGO_TRANSACTION_TEST_URL is required for replica-set migration test",
)
def test_real_replica_set_migrates_user_and_audit_in_the_same_transaction():
    loaded_motor = sys.modules.get("motor.motor_asyncio")
    if loaded_motor is not None and getattr(loaded_motor, "__file__", None) is None:
        sys.modules.pop("motor.motor_asyncio", None)
        sys.modules.pop("motor", None)
    from motor.motor_asyncio import AsyncIOMotorClient

    migration = load_migration()
    client = AsyncIOMotorClient(os.environ["MONGO_TRANSACTION_TEST_URL"])
    database_name = "identity_policy_migration_test"
    database = client[database_name]
    guard = TransactionMutationGuard(
        TransactionExecutor(client, lambda: DatabaseCapabilities(transactions=True)),
        lambda: True,
    )

    async def scenario():
        try:
            await database.users.insert_one(user("bootstrap-real", role="admin"))
            await migration.run(
                database,
                apply=True,
                bootstrap_owner_id="bootstrap-real",
                guard=guard,
            )
            account = await database.users.find_one({"id": "bootstrap-real"})
            assert canonical_roles(account) == ("super_admin",)
            assert await database.audit_events.count_documents({
                "target_id": "bootstrap-real",
                "action": "identity.bootstrap_owner_assigned",
            }) == 1
        finally:
            await client.drop_database(database_name)
            client.close()

    asyncio.run(scenario())
