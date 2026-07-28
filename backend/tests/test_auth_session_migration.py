import asyncio
import copy
import importlib.util
import os
import sys
import types
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
MIGRATION_PATH = ROOT / "backend" / "migrations" / "009_admin_session_safety.py"


def load_migration():
    spec = importlib.util.spec_from_file_location("auth_session_migration", MIGRATION_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def matches(item, query):
    if "$or" in query:
        return any(matches(item, part) for part in query["$or"])
    if "$and" in query:
        return all(matches(item, part) for part in query["$and"])
    for field, expected in query.items():
        actual = item.get(field)
        if isinstance(expected, dict) and "$lte" in expected:
            if actual is None or actual > expected["$lte"]:
                return False
        elif isinstance(expected, dict) and "$in" in expected:
            if actual not in expected["$in"]:
                return False
        elif actual != expected:
            return False
    return True


class Cursor:
    def __init__(self, items):
        self.items = copy.deepcopy(items)

    def limit(self, size):
        self.items = self.items[:size]
        return self

    async def to_list(self, length):
        return self.items if length is None else self.items[:length]


class Collection:
    def __init__(self, items=()):
        self.items = copy.deepcopy(list(items))
        self.indexes = {"_id_": {"key": [("_id", 1)]}}

    async def index_information(self):
        return copy.deepcopy(self.indexes)

    async def create_index(self, keys, **options):
        self.indexes[options["name"]] = {
            "key": list(keys),
            "unique": options.get("unique", False),
        }
        return options["name"]

    async def drop_index(self, name):
        self.indexes.pop(name)

    async def find_one(self, query):
        return next((copy.deepcopy(item) for item in self.items if matches(item, query)), None)

    async def insert_one(self, document, **_options):
        if any(item.get("_id") == document["_id"] for item in self.items):
            raise RuntimeError("duplicate marker")
        self.items.append(copy.deepcopy(document))
        return types.SimpleNamespace(acknowledged=True)

    async def delete_one(self, query, **_options):
        for index, item in enumerate(self.items):
            if matches(item, query):
                self.items.pop(index)
                return types.SimpleNamespace(deleted_count=1)
        return types.SimpleNamespace(deleted_count=0)

    async def count_documents(self, query):
        return sum(matches(item, query) for item in self.items)

    def find(self, query, projection):
        selected = []
        for item in self.items:
            if not matches(item, query):
                continue
            selected.append({
                field: item[field]
                for field, included in projection.items()
                if included and field in item
            })
        return Cursor(selected)

    async def delete_many(self, query, **_options):
        kept = [item for item in self.items if not matches(item, query)]
        deleted = len(self.items) - len(kept)
        self.items = kept
        return types.SimpleNamespace(deleted_count=deleted)


class Database:
    def __init__(self, sessions=()):
        self.admin_sessions = Collection(sessions)
        self.migration_state = Collection()

    def __getitem__(self, name):
        return getattr(self, name)


class Guard:
    async def run(self, callback, **_options):
        return await callback(object())


def test_default_dry_run_is_read_only_and_redacted():
    migration = load_migration()
    database = Database()
    before = copy.deepcopy(database.admin_sessions.indexes)
    report = asyncio.run(migration.run(database))
    assert report == {
        "dry_run": True,
        "applied": False,
        "owned_indexes": 0,
        "ttl_indexes": 0,
        "second_run_noop": False,
    }
    assert database.admin_sessions.indexes == before
    assert database.migration_state.items == []


def test_apply_requires_confirmed_unused_backup_is_idempotent_and_rolls_back(tmp_path):
    migration = load_migration()
    database = Database()
    backup = tmp_path / "session-index-backup.json"
    with pytest.raises(ValueError, match="encrypted backup"):
        asyncio.run(migration.run(database, apply=True, backup_path=backup, guard=Guard()))

    applied = asyncio.run(migration.run(
        database,
        apply=True,
        backup_path=backup,
        encrypted_backup_confirmed=True,
        guard=Guard(),
    ))
    assert applied["owned_indexes"] == 7
    assert set(migration.OWNED_INDEXES) <= set(database.admin_sessions.indexes)
    assert all("expireAfterSeconds" not in value for value in database.admin_sessions.indexes.values())
    assert "secret" not in backup.read_text(encoding="utf-8").lower()

    second = asyncio.run(migration.run(
        database,
        apply=True,
        backup_path=backup,
        encrypted_backup_confirmed=True,
        guard=Guard(),
    ))
    assert second["second_run_noop"] is True

    rolled_back = asyncio.run(migration.run(database, rollback=True, backup_path=backup, guard=Guard()))
    assert rolled_back["applied"] is False
    assert set(migration.OWNED_INDEXES).isdisjoint(database.admin_sessions.indexes)
    assert database.migration_state.items == []


def test_partial_ambiguous_or_ttl_state_is_rejected(tmp_path):
    migration = load_migration()
    database = Database()
    database.admin_sessions.indexes[migration.OWNED_INDEXES[0]] = {
        "key": [("access_hash", 1)], "unique": True
    }
    with pytest.raises(ValueError, match="partially applied"):
        asyncio.run(migration.run(database))

    database = Database()
    database.admin_sessions.indexes["unsafe_ttl"] = {
        "key": [("absolute_expires_at", 1)], "expireAfterSeconds": 0
    }
    with pytest.raises(ValueError, match="TTL"):
        asyncio.run(migration.run(database))

    now = datetime(2026, 7, 28, tzinfo=timezone.utc)
    duplicate = session("duplicate", now)
    database = Database([duplicate, {**session("other", now), "access_hash": duplicate["access_hash"]}])
    with pytest.raises(ValueError, match="duplicate access_hash"):
        asyncio.run(migration.run(database))


def session(session_id, now, *, revoked=None, idle_days=1, absolute_days=1):
    return {
        "_id": session_id,
        "revoked_at": revoked,
        "access_expires_at": now + timedelta(minutes=15),
        "idle_expires_at": now + timedelta(days=idle_days),
        "absolute_expires_at": now + timedelta(days=absolute_days),
        "access_hash": f"access-{session_id}",
        "session_hash": f"session-{session_id}",
        "user_id": f"user-{session_id}",
    }


def test_cleanup_dry_run_is_bounded_aggregate_only_and_never_deletes_active():
    migration = load_migration()
    now = datetime(2026, 7, 28, tzinfo=timezone.utc)
    sessions = [
        session("active", now),
        session("recent-expired", now, idle_days=-30),
        session("old-expired", now, idle_days=-91),
        session("old-revoked", now, revoked=now - timedelta(days=100)),
    ]
    database = Database(sessions)
    report = asyncio.run(migration.cleanup(database, current_time=now, batch_size=1))
    assert report["eligible"] == 2
    assert report["batch_selected"] == 1
    assert report["deleted"] == 0
    assert "old-expired" not in repr(report)
    assert database.admin_sessions.items == sessions


def test_cleanup_apply_requires_two_confirmations_and_deletes_one_bounded_batch():
    migration = load_migration()
    now = datetime(2026, 7, 28, tzinfo=timezone.utc)
    database = Database([
        session("active", now),
        session("old-1", now, idle_days=-91),
        session("old-2", now, revoked=now - timedelta(days=91)),
    ])
    with pytest.raises(ValueError, match="cleanup confirmation"):
        asyncio.run(migration.cleanup(database, apply=True, current_time=now, guard=Guard()))
    with pytest.raises(ValueError, match="restore-tested backup"):
        asyncio.run(migration.cleanup(
            database, apply=True, cleanup_confirmed=True, current_time=now, guard=Guard()
        ))
    report = asyncio.run(migration.cleanup(
        database,
        apply=True,
        cleanup_confirmed=True,
        encrypted_restore_backup_confirmed=True,
        batch_size=1,
        current_time=now,
        guard=Guard(),
    ))
    assert report["deleted"] == 1
    assert len(database.admin_sessions.items) == 2
    assert any(item["_id"] == "active" for item in database.admin_sessions.items)


@pytest.mark.skipif(
    os.environ.get("NIUVA_RUN_REAL_TRANSACTION_TESTS") != "1"
    or not os.environ.get("MONGO_TRANSACTION_TEST_URL"),
    reason="Explicit real transaction opt-in and URL are required",
)
def test_real_replica_set_apply_cleanup_and_rollback(tmp_path, transaction_database_name):
    loaded_motor = sys.modules.get("motor.motor_asyncio")
    if loaded_motor is not None and getattr(loaded_motor, "__file__", None) is None:
        sys.modules.pop("motor.motor_asyncio", None)
        sys.modules.pop("motor", None)
    from motor.motor_asyncio import AsyncIOMotorClient

    from database_capabilities import DatabaseCapabilities
    from transaction_execution import TransactionExecutor
    from transaction_guard import TransactionMutationGuard

    migration = load_migration()
    client = AsyncIOMotorClient(os.environ["MONGO_TRANSACTION_TEST_URL"])
    database = client[transaction_database_name]
    guard = TransactionMutationGuard(
        TransactionExecutor(client, lambda: DatabaseCapabilities(transactions=True)),
        lambda: True,
    )

    async def scenario():
        try:
            backup = tmp_path / "real-session-index-backup.json"
            await migration.run(
                database,
                apply=True,
                backup_path=backup,
                encrypted_backup_confirmed=True,
                guard=guard,
            )
            now = datetime(2026, 7, 28, tzinfo=timezone.utc)
            await database.admin_sessions.insert_many([
                session("active", now),
                session("expired", now, idle_days=-91),
            ])
            cleaned = await migration.cleanup(
                database,
                apply=True,
                cleanup_confirmed=True,
                encrypted_restore_backup_confirmed=True,
                current_time=now,
                guard=guard,
            )
            assert cleaned["deleted"] == 1
            assert await database.admin_sessions.count_documents({"_id": "active"}) == 1
            await migration.run(database, rollback=True, backup_path=backup, guard=guard)
            indexes = await database.admin_sessions.index_information()
            assert set(migration.OWNED_INDEXES).isdisjoint(indexes)
            assert await database.migration_state.count_documents({"_id": migration.MARKER_ID}) == 0
        finally:
            await client.drop_database(transaction_database_name)
            client.close()

    asyncio.run(scenario())
