"""Authentication security-event indexes. Dry-run is the default."""

import argparse
import asyncio
import json
import os
from datetime import datetime, timezone
from pathlib import Path

from database_capabilities import probe_database_capabilities
from schema_manifest import (
    AUTH_SECURITY_EVENT_INDEX_DECLARATIONS,
    AUTH_SECURITY_EVENT_MIGRATION_VERSION,
)
from transaction_execution import TransactionExecutor
from transaction_guard import TransactionMutationGuard

MIGRATION_ID = AUTH_SECURITY_EVENT_MIGRATION_VERSION
MARKER_COLLECTION = "migration_state"
MARKER_ID = MIGRATION_ID
OWNED_COLLECTIONS = frozenset(
    {
        "authentication_security_events",
        "authentication_security_alert_outbox",
    }
)
INDEX_SPECS = {
    declaration["options"]["name"]: declaration
    for declaration in AUTH_SECURITY_EVENT_INDEX_DECLARATIONS
}
OWNED_INDEXES = tuple(INDEX_SPECS)


def now_utc():
    return datetime.now(timezone.utc)


def _normalized_keys(value):
    if isinstance(value, str):
        return [(value, 1)]
    return [tuple(item) for item in value]


async def _state(database):
    marker = await database[MARKER_COLLECTION].find_one({"_id": MARKER_ID})
    present = {}
    for collection_name in OWNED_COLLECTIONS:
        indexes = await database[collection_name].index_information()
        for name, declaration in INDEX_SPECS.items():
            if declaration["collection"] != collection_name or name not in indexes:
                continue
            actual = indexes[name]
            expected = declaration["options"]
            if (
                _normalized_keys(actual.get("key", []))
                != _normalized_keys(declaration["keys"])
                or bool(actual.get("unique", False))
                != bool(expected.get("unique", False))
                or actual.get("expireAfterSeconds")
                != expected.get("expireAfterSeconds")
            ):
                raise ValueError(f"ambiguous index definition: {name}")
            present[name] = collection_name
    if present and set(present) != set(OWNED_INDEXES):
        raise ValueError("partially applied auth-security-event indexes")
    if bool(present) != bool(marker):
        raise ValueError("partial auth-security-event migration marker/index state")
    if marker and marker != {"_id": MARKER_ID, "migration": MIGRATION_ID}:
        raise ValueError("ambiguous auth-security-event migration marker")
    event_count = await database.authentication_security_events.count_documents({})
    outbox_count = (
        await database.authentication_security_alert_outbox.count_documents({})
    )
    return marker, present, event_count, outbox_count


def _backup_document(marker, present, event_count, outbox_count):
    return {
        "migration": MIGRATION_ID,
        "created_at": now_utc().isoformat(),
        "marker_present": marker is not None,
        "owned_indexes_present": sorted(present),
        "event_count": event_count,
        "outbox_count": outbox_count,
        "contains_event_payloads": False,
    }


def _write_backup(path, marker, present, event_count, outbox_count):
    if path.exists():
        raise ValueError("backup_path already exists; refusing to overwrite")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(
            _backup_document(marker, present, event_count, outbox_count),
            indent=2,
        ),
        encoding="utf-8",
    )


def _load_backup(path):
    if not path.exists():
        raise ValueError("backup_path does not exist")
    backup = json.loads(path.read_text(encoding="utf-8"))
    if (
        backup.get("migration") != MIGRATION_ID
        or backup.get("marker_present") is not False
        or backup.get("owned_indexes_present") != []
        or backup.get("event_count") != 0
        or backup.get("outbox_count") != 0
        or backup.get("contains_event_payloads") is not False
    ):
        raise ValueError("invalid or ambiguous Migration 010 backup")
    return backup


async def _drop_owned_indexes(database):
    for name, declaration in INDEX_SPECS.items():
        collection = database[declaration["collection"]]
        indexes = await collection.index_information()
        if name in indexes:
            await collection.drop_index(name)


async def _apply(database, guard):
    try:
        for name, declaration in INDEX_SPECS.items():
            options = dict(declaration["options"])
            options.pop("name")
            await database[declaration["collection"]].create_index(
                declaration["keys"],
                name=name,
                **options,
            )

        async def add_marker(session):
            result = await database[MARKER_COLLECTION].insert_one(
                {"_id": MARKER_ID, "migration": MIGRATION_ID},
                session=session,
            )
            if not result.acknowledged:
                raise RuntimeError("migration marker was not acknowledged")

        await guard.run(
            add_marker,
            operation_name="auth.security_event_migration.apply",
            retry_safe=True,
        )
    except Exception:
        await _drop_owned_indexes(database)
        raise


async def _rollback(database, guard):
    if (
        await database.authentication_security_events.count_documents({})
        or await database.authentication_security_alert_outbox.count_documents({})
    ):
        raise ValueError("rollback refuses non-empty auth-security collections")
    await _drop_owned_indexes(database)

    async def remove_marker(session):
        result = await database[MARKER_COLLECTION].delete_one(
            {"_id": MARKER_ID, "migration": MIGRATION_ID},
            session=session,
        )
        if result.deleted_count != 1:
            raise RuntimeError("rollback marker state is ambiguous")

    await guard.run(
        remove_marker,
        operation_name="auth.security_event_migration.rollback",
        retry_safe=True,
    )


async def run(
    database,
    *,
    apply=False,
    rollback=False,
    backup_path=None,
    encrypted_backup_confirmed=False,
    guard=None,
):
    if apply and rollback:
        raise ValueError("apply and rollback are mutually exclusive")
    if (apply or rollback) and guard is None:
        raise ValueError("A transaction-capable guard is required")
    if (apply or rollback) and backup_path is None:
        raise ValueError("backup_path is required")
    if apply and not encrypted_backup_confirmed:
        raise ValueError("encrypted backup destination confirmation is required")

    marker, present, event_count, outbox_count = await _state(database)
    applied = marker is not None
    report = {
        "dry_run": not (apply or rollback),
        "applied": applied,
        "owned_indexes": len(present),
        "event_count": event_count,
        "outbox_count": outbox_count,
        "historical_backfill": False,
        "second_run_noop": (apply and applied) or (rollback and not applied),
    }
    if not apply and not rollback:
        return report
    path = Path(backup_path)
    if apply:
        if applied:
            return report
        if event_count or outbox_count:
            raise ValueError("Migration 010 requires empty dedicated collections")
        _write_backup(path, marker, present, event_count, outbox_count)
        await _apply(database, guard)
        report.update({"applied": True, "owned_indexes": len(OWNED_INDEXES)})
        return report
    if not applied:
        return report
    _load_backup(path)
    await _rollback(database, guard)
    report.update({"applied": False, "owned_indexes": 0})
    return report


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--rollback", action="store_true")
    parser.add_argument("--backup-path")
    parser.add_argument("--encrypted-backup-confirmed", action="store_true")
    args = parser.parse_args()
    if args.apply or args.rollback:
        raise SystemExit(
            "Migration 010 execution requires an explicitly approved isolated runner"
        )
    from motor.motor_asyncio import AsyncIOMotorClient

    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    database = client[os.environ["DB_NAME"]]
    capabilities = await probe_database_capabilities(client, database)
    guard = TransactionMutationGuard(
        TransactionExecutor(client, lambda: capabilities),
        lambda: False,
    )
    print(json.dumps(await run(database, guard=guard), default=str))


if __name__ == "__main__":
    asyncio.run(main())
