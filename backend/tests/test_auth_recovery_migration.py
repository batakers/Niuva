import asyncio
import copy
import importlib.util
import json
import os
import sys
import types
from datetime import datetime, timezone
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
MIGRATION_PATH = ROOT / "backend" / "migrations" / "008_auth_recovery_safety.py"


def load_migration():
    spec = importlib.util.spec_from_file_location(
        "auth_recovery_migration", MIGRATION_PATH
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class Cursor:
    def __init__(self, items):
        self.items = copy.deepcopy(items)

    def __aiter__(self):
        self.iterator = iter(self.items)
        return self

    async def __anext__(self):
        try:
            return next(self.iterator)
        except StopIteration as error:
            raise StopAsyncIteration from error


class Tokens:
    def __init__(self, items):
        self.items = copy.deepcopy(items)
        self.indexes = {"_id_": {}}

    def find(self, *_args):
        return Cursor(self.items)

    async def index_information(self):
        return copy.deepcopy(self.indexes)

    async def update_one(self, query, update, **_options):
        for item in self.items:
            marker = query.get("auth_recovery_migration")
            marker_matches = marker == item.get("auth_recovery_migration")
            if isinstance(marker, dict) and marker.get("$exists") is False:
                marker_matches = "auth_recovery_migration" not in item
            if item.get("id") == query["id"] and marker_matches:
                item.update(copy.deepcopy(update.get("$set", {})))
                for field in update.get("$unset", {}):
                    item.pop(field, None)
                return types.SimpleNamespace(matched_count=1)
        return types.SimpleNamespace(matched_count=0)

    async def create_index(self, _key, **options):
        self.indexes[options["name"]] = options

    async def drop_index(self, name):
        self.indexes.pop(name, None)


class Markers:
    def __init__(self):
        self.items = []

    async def find_one(self, query):
        return next(
            (copy.deepcopy(item) for item in self.items if item["_id"] == query["_id"]),
            None,
        )

    async def insert_one(self, document, **_options):
        if any(item["_id"] == document["_id"] for item in self.items):
            raise RuntimeError("duplicate marker")
        self.items.append(copy.deepcopy(document))
        return types.SimpleNamespace(acknowledged=True)

    async def delete_one(self, query, **_options):
        for index, item in enumerate(self.items):
            if item == query:
                self.items.pop(index)
                return types.SimpleNamespace(deleted_count=1)
        return types.SimpleNamespace(deleted_count=0)


class Database:
    def __init__(self, items):
        self.password_reset_tokens = Tokens(items)
        self.migration_state = Markers()

    def __getitem__(self, name):
        return getattr(self, name)


class Guard:
    def __init__(self, database):
        self.database = database

    async def run(self, callback, **_options):
        snapshot = copy.deepcopy(self.database.password_reset_tokens.items)
        marker_snapshot = copy.deepcopy(self.database.migration_state.items)
        try:
            return await callback(object())
        except Exception:
            self.database.password_reset_tokens.items = snapshot
            self.database.migration_state.items = marker_snapshot
            raise


def tokens():
    return [
        {"id": "token-1", "user_id": "user-1", "token_hash": "hash-1", "active": True},
        {"id": "token-2", "user_id": "user-2", "token_hash": "hash-2", "active": False},
    ]


def test_default_dry_run_is_read_only_and_redacted():
    migration = load_migration()
    database = Database(tokens())
    before = copy.deepcopy(database.password_reset_tokens.items)
    report = asyncio.run(migration.run(database))
    assert report["dry_run"] is True
    assert report["planned_invalidations"] == 1
    assert report["duplicate_active_users"] == 0
    assert database.password_reset_tokens.items == before
    assert "hash-1" not in repr(report)


def test_apply_requires_encrypted_unused_backup_then_is_idempotent(tmp_path):
    migration = load_migration()
    database = Database(tokens())
    guard = Guard(database)
    backup = tmp_path / "recovery-backup.json"
    with pytest.raises(ValueError, match="encrypted backup"):
        asyncio.run(
            migration.run(database, apply=True, backup_path=backup, guard=guard)
        )

    report = asyncio.run(
        migration.run(
            database,
            apply=True,
            backup_path=backup,
            encrypted_backup_confirmed=True,
            guard=guard,
        )
    )
    assert report["updated"] == 2
    assert all(
        token["active"] is False for token in database.password_reset_tokens.items
    )
    assert set(migration.OWNED_INDEXES) <= set(database.password_reset_tokens.indexes)
    assert database.migration_state.items == [
        {"_id": migration.MIGRATION_ID, "migration": migration.MIGRATION_ID}
    ]
    backup_text = backup.read_text(encoding="utf-8")
    assert "hash-1" not in backup_text
    assert "user-1" not in backup_text
    assert "token_hash" not in backup_text

    second = asyncio.run(
        migration.run(
            database,
            apply=True,
            backup_path=backup,
            encrypted_backup_confirmed=True,
            guard=guard,
        )
    )
    assert second["second_run_noop"] is True


def test_rollback_restores_owned_fields_and_indexes(tmp_path):
    migration = load_migration()
    original = tokens()
    database = Database(original)
    guard = Guard(database)
    backup = tmp_path / "recovery-backup.json"
    asyncio.run(
        migration.run(
            database,
            apply=True,
            backup_path=backup,
            encrypted_backup_confirmed=True,
            guard=guard,
        )
    )
    result = asyncio.run(
        migration.run(database, rollback=True, backup_path=backup, guard=guard)
    )
    assert result["restored"] == 2
    assert database.password_reset_tokens.items == original
    assert set(migration.OWNED_INDEXES).isdisjoint(
        database.password_reset_tokens.indexes
    )
    assert database.migration_state.items == []


def test_apply_replaces_migration_007_reset_indexes_and_rollback_restores_them(
    tmp_path,
):
    migration = load_migration()
    database = Database(tokens())
    for name, spec in migration.LEGACY_INDEX_SPECS.items():
        asyncio.run(
            database.password_reset_tokens.create_index(
                spec["keys"],
                name=name,
                **spec["options"],
            )
        )
    backup = tmp_path / "recovery-index-transition.json"
    asyncio.run(
        migration.run(
            database,
            apply=True,
            backup_path=backup,
            encrypted_backup_confirmed=True,
            guard=Guard(database),
        )
    )
    assert set(migration.LEGACY_INDEXES).isdisjoint(
        database.password_reset_tokens.indexes
    )
    assert set(migration.OWNED_INDEXES) <= set(database.password_reset_tokens.indexes)

    asyncio.run(
        migration.run(
            database,
            rollback=True,
            backup_path=backup,
            guard=Guard(database),
        )
    )
    assert set(migration.LEGACY_INDEXES) <= set(database.password_reset_tokens.indexes)
    assert set(migration.OWNED_INDEXES).isdisjoint(
        database.password_reset_tokens.indexes
    )


def test_rollback_preserves_preexisting_datetime_type(tmp_path):
    migration = load_migration()
    original = tokens()
    original[1]["invalidated_at"] = datetime(2026, 7, 1, tzinfo=timezone.utc)
    database = Database(original)
    backup = tmp_path / "typed-backup.json"
    guard = Guard(database)
    asyncio.run(
        migration.run(
            database,
            apply=True,
            backup_path=backup,
            encrypted_backup_confirmed=True,
            guard=guard,
        )
    )
    asyncio.run(migration.run(database, rollback=True, backup_path=backup, guard=guard))
    assert database.password_reset_tokens.items == original


@pytest.mark.parametrize(
    "bad_tokens",
    [
        [
            {"id": "a", "user_id": "user", "token_hash": "same", "active": True},
            {"id": "b", "user_id": "other", "token_hash": "same", "active": False},
        ],
        [
            {"id": "a", "user_id": "user", "token_hash": "one", "active": True},
            {"id": "b", "user_id": "user", "token_hash": "two", "active": True},
        ],
    ],
)
def test_ambiguous_duplicates_stop_before_backup_or_mutation(tmp_path, bad_tokens):
    migration = load_migration()
    database = Database(bad_tokens)
    before = copy.deepcopy(database.password_reset_tokens.items)
    backup = tmp_path / "backup.json"
    with pytest.raises(ValueError, match="duplicate"):
        asyncio.run(
            migration.run(
                database,
                apply=True,
                backup_path=backup,
                encrypted_backup_confirmed=True,
                guard=Guard(database),
            )
        )
    assert database.password_reset_tokens.items == before
    assert not backup.exists()


@pytest.mark.skipif(
    os.environ.get("NIUVA_RUN_REAL_TRANSACTION_TESTS") != "1"
    or not os.environ.get("MONGO_TRANSACTION_TEST_URL"),
    reason="Explicit real transaction opt-in and URL are required",
)
def test_real_replica_set_apply_idempotency_and_rollback(
    tmp_path, transaction_database_name
):
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
            original = tokens()
            await database.password_reset_tokens.insert_many(copy.deepcopy(original))
            backup = tmp_path / "real-recovery-backup.json"
            applied = await migration.run(
                database,
                apply=True,
                backup_path=backup,
                encrypted_backup_confirmed=True,
                guard=guard,
            )
            assert applied["updated"] == 2
            assert (
                await database.password_reset_tokens.count_documents({"active": True})
                == 0
            )

            second = await migration.run(
                database,
                apply=True,
                backup_path=backup,
                encrypted_backup_confirmed=True,
                guard=guard,
            )
            assert second["second_run_noop"] is True

            rolled_back = await migration.run(
                database, rollback=True, backup_path=backup, guard=guard
            )
            assert rolled_back["restored"] == 2
            restored = await database.password_reset_tokens.find(
                {}, {"_id": 0}
            ).to_list(None)
            assert sorted(restored, key=lambda item: item["id"]) == original
            indexes = await database.password_reset_tokens.index_information()
            assert set(migration.OWNED_INDEXES).isdisjoint(indexes)
        finally:
            await client.drop_database(transaction_database_name)
            client.close()

    asyncio.run(scenario())
