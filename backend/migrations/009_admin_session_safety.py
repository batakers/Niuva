"""Admin-session indexes and controlled retention cleanup. Dry-run is default."""

import argparse
import asyncio
import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

from database_capabilities import probe_database_capabilities
from transaction_execution import TransactionExecutor
from transaction_guard import TransactionMutationGuard

MIGRATION_ID = "009_admin_session_safety"
MARKER_COLLECTION = "migration_state"
MARKER_ID = MIGRATION_ID
RETENTION_DAYS = 90
MAX_BATCH_SIZE = 1000
INDEX_SPECS = {
    "unique_admin_session_access_secret_hash": {
        "keys": [("access_hash", 1)],
        "unique": True,
    },
    "unique_admin_session_session_secret_hash": {
        "keys": [("session_hash", 1)],
        "unique": True,
    },
    "admin_session_user_active_expiry": {
        "keys": [
            ("user_id", 1),
            ("revoked_at", 1),
            ("access_expires_at", 1),
        ],
        "unique": False,
    },
    "admin_session_rotated_secret_lookup": {
        "keys": [("rotated_session_hashes", 1)],
        "unique": False,
    },
    "admin_session_revoked_retention": {
        "keys": [("revoked_at", 1)],
        "unique": False,
    },
    "admin_session_idle_retention": {
        "keys": [("idle_expires_at", 1)],
        "unique": False,
    },
    "admin_session_absolute_retention": {
        "keys": [("absolute_expires_at", 1)],
        "unique": False,
    },
}
OWNED_INDEXES = tuple(INDEX_SPECS)


def now_utc():
    return datetime.now(timezone.utc)


def transaction_mutations_enabled() -> bool:
    return os.environ.get("TRANSACTION_MUTATIONS_ENABLED", "false").lower() == "true"


def _normalized_keys(value):
    return [tuple(item) for item in value]


async def _state(database):
    collection = database.admin_sessions
    indexes = await collection.index_information()
    marker = await database[MARKER_COLLECTION].find_one({"_id": MARKER_ID})
    owned = set(indexes) & set(OWNED_INDEXES)
    if owned and owned != set(OWNED_INDEXES):
        raise ValueError("partially applied admin-session indexes")
    if bool(owned) != bool(marker):
        raise ValueError("partial admin-session migration marker/index state")
    if marker and marker != {"_id": MARKER_ID, "migration": MIGRATION_ID}:
        raise ValueError("ambiguous admin-session migration marker")
    for name in owned:
        actual = indexes[name]
        expected = INDEX_SPECS[name]
        if (
            _normalized_keys(actual.get("key", [])) != expected["keys"]
            or bool(actual.get("unique", False)) != expected["unique"]
            or "expireAfterSeconds" in actual
        ):
            raise ValueError(f"ambiguous index definition: {name}")
    ttl_indexes = [
        name for name, spec in indexes.items() if "expireAfterSeconds" in spec
    ]
    if ttl_indexes:
        raise ValueError("TTL indexes are prohibited for admin sessions")
    sessions = await collection.find(
        {}, {"_id": 0, "access_hash": 1, "session_hash": 1}
    ).to_list(length=None)
    for field in ("access_hash", "session_hash"):
        values = [session.get(field) for session in sessions]
        if any(not isinstance(value, str) or not value for value in values):
            raise ValueError(f"{field} values must be non-empty strings")
        if len(values) != len(set(values)):
            raise ValueError(f"duplicate {field} values")
    return indexes, marker


def _backup_document(indexes, marker):
    return {
        "migration": MIGRATION_ID,
        "created_at": now_utc().isoformat(),
        "owned_indexes_present": [name for name in OWNED_INDEXES if name in indexes],
        "marker_present": marker is not None,
    }


def _write_backup(path, indexes, marker):
    if path.exists():
        raise ValueError("backup_path already exists; refusing to overwrite")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(_backup_document(indexes, marker), indent=2), encoding="utf-8")


def _load_backup(path):
    if not path.exists():
        raise ValueError("backup_path does not exist")
    backup = json.loads(path.read_text(encoding="utf-8"))
    if (
        backup.get("migration") != MIGRATION_ID
        or backup.get("owned_indexes_present") != []
        or backup.get("marker_present") is not False
    ):
        raise ValueError("invalid or ambiguous migration 009 backup")
    return backup


async def _drop_owned_indexes(collection):
    current = await collection.index_information()
    for name in OWNED_INDEXES:
        if name in current:
            await collection.drop_index(name)


async def _apply(database, guard):
    collection = database.admin_sessions
    try:
        for name, spec in INDEX_SPECS.items():
            await collection.create_index(
                spec["keys"], name=name, unique=spec["unique"]
            )

        async def add_marker(session):
            result = await database[MARKER_COLLECTION].insert_one(
                {"_id": MARKER_ID, "migration": MIGRATION_ID}, session=session
            )
            if not result.acknowledged:
                raise RuntimeError("migration marker was not acknowledged")

        await guard.run(
            add_marker,
            operation_name="auth.admin_session_migration.apply",
            retry_safe=True,
        )
    except Exception:
        await _drop_owned_indexes(collection)
        raise


async def _rollback(database, guard):
    collection = database.admin_sessions
    await _drop_owned_indexes(collection)

    async def remove_marker(session):
        result = await database[MARKER_COLLECTION].delete_one(
            {"_id": MARKER_ID, "migration": MIGRATION_ID}, session=session
        )
        if result.deleted_count != 1:
            raise RuntimeError("rollback marker state is ambiguous")

    try:
        await guard.run(
            remove_marker,
            operation_name="auth.admin_session_migration.rollback",
            retry_safe=True,
        )
    except Exception:
        for name, spec in INDEX_SPECS.items():
            await collection.create_index(
                spec["keys"], name=name, unique=spec["unique"]
            )
        raise


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

    indexes, marker = await _state(database)
    applied = marker is not None
    report = {
        "dry_run": not (apply or rollback),
        "applied": applied,
        "owned_indexes": len(set(indexes) & set(OWNED_INDEXES)),
        "ttl_indexes": 0,
        "second_run_noop": (apply and applied) or (rollback and not applied),
    }
    if not apply and not rollback:
        return report
    path = Path(backup_path)
    if apply:
        if applied:
            return report
        _write_backup(path, indexes, marker)
        await _apply(database, guard)
        report.update(applied=True, owned_indexes=len(OWNED_INDEXES))
        return report

    _load_backup(path)
    if not applied:
        return report
    await _rollback(database, guard)
    report.update(applied=False, owned_indexes=0)
    return report


def _cleanup_filter(cutoff):
    return {
        "$or": [
            {"revoked_at": {"$lte": cutoff}},
            {"idle_expires_at": {"$lte": cutoff}},
            {"absolute_expires_at": {"$lte": cutoff}},
        ]
    }


async def cleanup(
    database,
    *,
    apply=False,
    cleanup_confirmed=False,
    encrypted_restore_backup_confirmed=False,
    batch_size=250,
    current_time=None,
    guard=None,
):
    if not 1 <= batch_size <= MAX_BATCH_SIZE:
        raise ValueError(f"batch_size must be between 1 and {MAX_BATCH_SIZE}")
    if apply and not cleanup_confirmed:
        raise ValueError("explicit cleanup confirmation is required")
    if apply and not encrypted_restore_backup_confirmed:
        raise ValueError("encrypted restore-tested backup confirmation is required")
    if apply and guard is None:
        raise ValueError("A transaction-capable guard is required")

    current_time = current_time or now_utc()
    if current_time.tzinfo is None:
        raise ValueError("current_time must be timezone-aware")
    cutoff = current_time - timedelta(days=RETENTION_DAYS)
    query = _cleanup_filter(cutoff)
    collection = database.admin_sessions
    eligible = await collection.count_documents(query)
    candidates = await collection.find(query, {"_id": 1}).limit(batch_size).to_list(
        length=batch_size
    )
    report = {
        "dry_run": not apply,
        "retention_days": RETENTION_DAYS,
        "eligible": eligible,
        "batch_selected": len(candidates),
        "deleted": 0,
        "remaining_estimate": max(eligible - len(candidates), 0),
    }
    if not apply or not candidates:
        return report

    candidate_ids = [candidate["_id"] for candidate in candidates]

    async def delete_batch(session):
        result = await collection.delete_many(
            {"$and": [{"_id": {"$in": candidate_ids}}, query]}, session=session
        )
        return result.deleted_count

    report["deleted"] = await guard.run(
        delete_batch,
        operation_name="auth.admin_session_cleanup.apply",
        retry_safe=True,
    )
    report["remaining_estimate"] = max(eligible - report["deleted"], 0)
    return report


async def run_cli(args):
    from dotenv import load_dotenv
    from motor.motor_asyncio import AsyncIOMotorClient

    backend_dir = Path(__file__).resolve().parents[1]
    load_dotenv(backend_dir / ".env")
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    try:
        database_name = os.environ["DB_NAME"]
        database = client[database_name]
        mutation = args.apply or args.rollback or args.apply_cleanup
        guard = None
        if mutation:
            capabilities = await probe_database_capabilities(client, database_name)
            guard = TransactionMutationGuard(
                TransactionExecutor(client, lambda: capabilities),
                transaction_mutations_enabled,
            )
        if args.cleanup or args.apply_cleanup:
            return await cleanup(
                database,
                apply=args.apply_cleanup,
                cleanup_confirmed=args.cleanup_confirmed,
                encrypted_restore_backup_confirmed=args.encrypted_restore_backup_confirmed,
                batch_size=args.batch_size,
                guard=guard,
            )
        return await run(
            database,
            apply=args.apply,
            rollback=args.rollback,
            backup_path=args.backup,
            encrypted_backup_confirmed=args.encrypted_backup_confirmed,
            guard=guard,
        )
    finally:
        client.close()


def build_parser():
    parser = argparse.ArgumentParser(description="Admin session safety migration 009")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--apply", action="store_true")
    mode.add_argument("--rollback", action="store_true")
    mode.add_argument("--cleanup", action="store_true", help="Read-only cleanup preview")
    mode.add_argument("--apply-cleanup", action="store_true")
    parser.add_argument("--backup", metavar="UNUSED_ENCRYPTED_BACKUP_PATH")
    parser.add_argument("--encrypted-backup-confirmed", action="store_true")
    parser.add_argument("--cleanup-confirmed", action="store_true")
    parser.add_argument("--encrypted-restore-backup-confirmed", action="store_true")
    parser.add_argument("--batch-size", type=int, default=250)
    return parser


if __name__ == "__main__":
    print(json.dumps(asyncio.run(run_cli(build_parser().parse_args())), indent=2))
