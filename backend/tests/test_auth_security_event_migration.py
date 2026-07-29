import asyncio
import copy
import importlib.util
import json
import types
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
MIGRATION_PATH = ROOT / "backend" / "migrations" / "010_auth_security_events.py"


def load_migration():
    spec = importlib.util.spec_from_file_location(
        "auth_security_event_migration", MIGRATION_PATH
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class Collection:
    def __init__(self, items=()):
        self.items = copy.deepcopy(list(items))
        self.indexes = {"_id_": {"key": [("_id", 1)]}}

    async def index_information(self):
        return copy.deepcopy(self.indexes)

    async def create_index(self, keys, **options):
        normalized = [(keys, 1)] if isinstance(keys, str) else list(keys)
        self.indexes[options["name"]] = {
            "key": normalized,
            **{
                key: value
                for key, value in options.items()
                if key in {"unique", "expireAfterSeconds"}
            },
        }
        return options["name"]

    async def drop_index(self, name):
        self.indexes.pop(name)

    async def find_one(self, query):
        return next(
            (
                copy.deepcopy(item)
                for item in self.items
                if all(item.get(key) == value for key, value in query.items())
            ),
            None,
        )

    async def insert_one(self, document, **_options):
        self.items.append(copy.deepcopy(document))
        return types.SimpleNamespace(acknowledged=True)

    async def delete_one(self, query, **_options):
        for index, item in enumerate(self.items):
            if all(item.get(key) == value for key, value in query.items()):
                self.items.pop(index)
                return types.SimpleNamespace(deleted_count=1)
        return types.SimpleNamespace(deleted_count=0)

    async def count_documents(self, _query):
        return len(self.items)


class Database:
    def __init__(self):
        self.authentication_security_events = Collection()
        self.authentication_security_alert_outbox = Collection()
        self.migration_state = Collection()

    def __getitem__(self, name):
        return getattr(self, name)


class Guard:
    def __init__(self):
        self.calls = []

    async def run(self, callback, **options):
        self.calls.append(options)
        return await callback(object())


def test_dry_run_is_read_only_and_declares_no_backfill():
    migration = load_migration()
    database = Database()
    before = copy.deepcopy(database.__dict__)
    report = asyncio.run(migration.run(database))
    assert report == {
        "dry_run": True,
        "applied": False,
        "owned_indexes": 0,
        "event_count": 0,
        "outbox_count": 0,
        "historical_backfill": False,
        "second_run_noop": False,
    }
    assert database.authentication_security_events.indexes == (
        before["authentication_security_events"].indexes
    )
    assert database.migration_state.items == []


def test_apply_requires_guard_backup_and_encrypted_confirmation(tmp_path):
    migration = load_migration()
    database = Database()
    backup = tmp_path / "migration-010-backup.json"
    with pytest.raises(ValueError, match="guard"):
        asyncio.run(migration.run(database, apply=True, backup_path=backup))
    with pytest.raises(ValueError, match="backup_path"):
        asyncio.run(
            migration.run(
                database,
                apply=True,
                encrypted_backup_confirmed=True,
                guard=Guard(),
            )
        )
    with pytest.raises(ValueError, match="encrypted backup"):
        asyncio.run(
            migration.run(
                database,
                apply=True,
                backup_path=backup,
                guard=Guard(),
            )
        )


def test_apply_is_bounded_idempotent_and_rollback_requires_empty_collections(
    tmp_path,
):
    migration = load_migration()
    database = Database()
    guard = Guard()
    backup = tmp_path / "migration-010-backup.json"
    applied = asyncio.run(
        migration.run(
            database,
            apply=True,
            backup_path=backup,
            encrypted_backup_confirmed=True,
            guard=guard,
        )
    )
    assert applied["applied"] is True
    assert applied["owned_indexes"] == len(migration.OWNED_INDEXES)
    evidence = json.loads(backup.read_text(encoding="utf-8"))
    assert evidence["contains_event_payloads"] is False
    assert "items" not in evidence

    repeated = asyncio.run(
        migration.run(
            database,
            apply=True,
            backup_path=backup,
            encrypted_backup_confirmed=True,
            guard=guard,
        )
    )
    assert repeated["second_run_noop"] is True

    database.authentication_security_events.items.append({"id": "event-1"})
    with pytest.raises(ValueError, match="non-empty"):
        asyncio.run(
            migration.run(
                database,
                rollback=True,
                backup_path=backup,
                guard=guard,
            )
        )
    database.authentication_security_events.items.clear()
    rolled_back = asyncio.run(
        migration.run(
            database,
            rollback=True,
            backup_path=backup,
            guard=guard,
        )
    )
    assert rolled_back["applied"] is False
    assert rolled_back["owned_indexes"] == 0


def test_apply_refuses_preexisting_event_or_alert_data(tmp_path):
    migration = load_migration()
    database = Database()
    database.authentication_security_events.items.append({"id": "legacy"})
    with pytest.raises(ValueError, match="empty dedicated collections"):
        asyncio.run(
            migration.run(
                database,
                apply=True,
                backup_path=tmp_path / "backup.json",
                encrypted_backup_confirmed=True,
                guard=Guard(),
            )
        )


def test_partial_index_state_fails_closed():
    migration = load_migration()
    database = Database()
    first_name, declaration = next(iter(migration.INDEX_SPECS.items()))
    collection = database[declaration["collection"]]
    asyncio.run(
        collection.create_index(
            declaration["keys"],
            name=first_name,
            **{
                key: value
                for key, value in declaration["options"].items()
                if key != "name"
            },
        )
    )
    with pytest.raises(ValueError, match="partially applied"):
        asyncio.run(migration.run(database))
