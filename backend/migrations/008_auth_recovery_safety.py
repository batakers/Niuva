"""Non-destructive password-recovery token migration. Dry-run is default."""

import argparse
import asyncio
import json
import os
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from database_capabilities import probe_database_capabilities
from schema_manifest import AUTH_RECOVERY_MIGRATION_VERSION
from transaction_execution import TransactionExecutor
from transaction_guard import TransactionMutationGuard

MIGRATION_ID = AUTH_RECOVERY_MIGRATION_VERSION
MARKER = "auth_recovery_migration"
MARKER_COLLECTION = "migration_state"
MUTATED_FIELDS = (MARKER, "active", "invalidated_at", "invalidation_reason")
TOKEN_HASH_INDEX = "unique_password_reset_token_hash"
ACTIVE_USER_INDEX = "one_active_password_reset_token_per_user"
OWNED_INDEXES = (TOKEN_HASH_INDEX, ACTIVE_USER_INDEX)
LEGACY_INDEX_SPECS = {
    "uq_password_reset_hash": {
        "keys": "token_hash",
        "options": {"unique": True},
    },
    "ttl_password_reset_expiry": {
        "keys": "expires_at",
        "options": {"expireAfterSeconds": 0},
    },
}
LEGACY_INDEXES = tuple(LEGACY_INDEX_SPECS)


def now_utc():
    return datetime.now(timezone.utc)


def transaction_mutations_enabled() -> bool:
    return os.environ.get("TRANSACTION_MUTATIONS_ENABLED", "false").lower() == "true"


def _field_types(tokens):
    fields = ("id", "user_id", "token_hash", "active", "created_at", "expires_at")
    return {
        field: dict(
            sorted(Counter(type(token.get(field)).__name__ for token in tokens).items())
        )
        for field in fields
    }


def _validate(tokens, index_names, marker):
    ids = [token.get("id") for token in tokens]
    if any(not isinstance(value, str) or not value for value in ids) or len(ids) != len(
        set(ids)
    ):
        raise ValueError("token IDs must be unique non-empty strings")
    markers = [token.get(MARKER) for token in tokens if MARKER in token]
    if any(marker != MIGRATION_ID for marker in markers):
        raise ValueError("ambiguous migration marker")
    if markers and len(markers) != len(tokens):
        raise ValueError("partially applied migration state")

    hashes = [token.get("token_hash") for token in tokens]
    if any(not isinstance(value, str) or not value for value in hashes):
        raise ValueError("token_hash values must be non-empty strings")
    if len(hashes) != len(set(hashes)):
        raise ValueError("duplicate token_hash values")

    active_users = [
        token.get("user_id") for token in tokens if token.get("active") is True
    ]
    if any(not isinstance(value, str) or not value for value in active_users):
        raise ValueError("active tokens require a user_id")
    duplicates = [
        user_id for user_id, count in Counter(active_users).items() if count > 1
    ]
    if duplicates:
        raise ValueError("duplicate active tokens per user")

    owned = set(index_names) & set(OWNED_INDEXES)
    if owned and owned != set(OWNED_INDEXES):
        raise ValueError("partially applied migration indexes")
    legacy = set(index_names) & set(LEGACY_INDEXES)
    if legacy and legacy != set(LEGACY_INDEXES):
        raise ValueError("partially applied legacy recovery indexes")
    if marker and marker != {"_id": MIGRATION_ID, "migration": MIGRATION_ID}:
        raise ValueError("ambiguous migration marker")
    if bool(owned) != bool(marker):
        raise ValueError("migration marker/index state is inconsistent")
    if marker and legacy:
        raise ValueError("retired recovery indexes remain after migration")


def _backup_value(value):
    if isinstance(value, datetime):
        return {"type": "datetime", "value": value.isoformat()}
    return {"type": "value", "value": value}


def _restore_value(value):
    if not isinstance(value, dict) or set(value) != {"type", "value"}:
        raise ValueError("invalid backup field encoding")
    if value["type"] == "datetime":
        return datetime.fromisoformat(value["value"])
    if value["type"] == "value":
        return value["value"]
    raise ValueError("unknown backup field encoding")


def _backup_document(tokens, existing_indexes, marker):
    return {
        "migration": MIGRATION_ID,
        "created_at": now_utc().isoformat(),
        "indexes_present": [name for name in OWNED_INDEXES if name in existing_indexes],
        "legacy_indexes_present": [
            name for name in LEGACY_INDEXES if name in existing_indexes
        ],
        "marker_present": marker is not None,
        "tokens": [
            {
                "id": token["id"],
                "fields": {
                    field: _backup_value(token[field])
                    for field in MUTATED_FIELDS
                    if field in token
                },
            }
            for token in tokens
        ],
    }


def _write_backup(path, tokens, existing_indexes, marker):
    if path.exists():
        raise ValueError("backup_path already exists; refusing to overwrite")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(
            _backup_document(tokens, existing_indexes, marker),
            indent=2,
            default=str,
        ),
        encoding="utf-8",
    )


def _load_backup(path):
    if not path.exists():
        raise ValueError("backup_path does not exist")
    backup = json.loads(path.read_text(encoding="utf-8"))
    if backup.get("migration") != MIGRATION_ID or not isinstance(
        backup.get("tokens"), list
    ):
        raise ValueError("invalid migration 008 backup")
    if backup.get("indexes_present") != [] or backup.get("marker_present") is not False:
        raise ValueError(
            "migration 008 backup does not describe a clean pre-apply state"
        )
    if set(backup.get("legacy_indexes_present", [])) - set(LEGACY_INDEXES):
        raise ValueError("migration 008 backup contains unknown legacy indexes")
    return backup


async def _index_names(collection):
    info = await collection.index_information()
    return set(info)


async def _restore_legacy_indexes(collection, names):
    for name in names:
        spec = LEGACY_INDEX_SPECS[name]
        await collection.create_index(
            spec["keys"],
            name=name,
            **spec["options"],
        )


async def _drop_indexes(collection, names):
    current = await _index_names(collection)
    for name in names:
        if name in current:
            await collection.drop_index(name)


async def _apply(database, guard, tokens, timestamp, legacy_indexes):
    token_ids = [token["id"] for token in tokens]
    collection = database.password_reset_tokens

    try:
        await _drop_indexes(collection, legacy_indexes)
        await collection.create_index("token_hash", unique=True, name=TOKEN_HASH_INDEX)
        await collection.create_index(
            "user_id",
            unique=True,
            partialFilterExpression={"active": True},
            name=ACTIVE_USER_INDEX,
        )
    except Exception:
        current = await _index_names(collection)
        for name in OWNED_INDEXES:
            if name in current:
                await collection.drop_index(name)
        raise

    async def mutate(session):
        for token_id in token_ids:
            result = await database.password_reset_tokens.update_one(
                {"id": token_id, MARKER: {"$exists": False}},
                {
                    "$set": {
                        MARKER: MIGRATION_ID,
                        "active": False,
                        "invalidated_at": timestamp,
                        "invalidation_reason": "migration_008",
                    }
                },
                session=session,
            )
            if result.matched_count != 1:
                raise RuntimeError("concurrent token change detected")
        result = await database[MARKER_COLLECTION].insert_one(
            {"_id": MIGRATION_ID, "migration": MIGRATION_ID},
            session=session,
        )
        if not result.acknowledged:
            raise RuntimeError("migration marker was not acknowledged")

    try:
        await guard.run(
            mutate, operation_name="auth.recovery_migration.apply", retry_safe=True
        )
    except Exception:
        await _drop_indexes(collection, OWNED_INDEXES)
        await _restore_legacy_indexes(collection, legacy_indexes)
        raise


async def _rollback(database, guard, backup):
    async def mutate(session):
        for entry in backup["tokens"]:
            fields = {
                field: _restore_value(value)
                for field, value in (entry.get("fields") or {}).items()
            }
            if set(fields) - set(MUTATED_FIELDS):
                raise ValueError("backup contains non-migration fields")
            unset = {field: "" for field in MUTATED_FIELDS if field not in fields}
            result = await database.password_reset_tokens.update_one(
                {"id": entry["id"], MARKER: MIGRATION_ID},
                {"$set": fields, "$unset": unset},
                session=session,
            )
            if result.matched_count != 1:
                raise RuntimeError("rollback token state is ambiguous")
        result = await database[MARKER_COLLECTION].delete_one(
            {"_id": MIGRATION_ID, "migration": MIGRATION_ID},
            session=session,
        )
        if result.deleted_count != 1:
            raise RuntimeError("rollback marker state is ambiguous")

    await guard.run(
        mutate, operation_name="auth.recovery_migration.rollback", retry_safe=True
    )
    await _drop_indexes(database.password_reset_tokens, OWNED_INDEXES)
    await _restore_legacy_indexes(
        database.password_reset_tokens,
        backup.get("legacy_indexes_present", []),
    )
    return len(backup["tokens"])


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

    path = Path(backup_path) if backup_path else None
    if rollback:
        restored = await _rollback(database, guard, _load_backup(path))
        return {"rollback": True, "restored": restored}

    collection = database.password_reset_tokens
    tokens = [token async for token in collection.find({}, {"_id": 0})]
    indexes = await _index_names(collection)
    marker = await database[MARKER_COLLECTION].find_one({"_id": MIGRATION_ID})
    _validate(tokens, indexes, marker)
    active_by_user = Counter(
        token["user_id"] for token in tokens if token.get("active") is True
    )
    report = {
        "dry_run": not apply,
        "scanned": len(tokens),
        "field_types": _field_types(tokens),
        "active_users": len(active_by_user),
        "duplicate_active_users": sum(count > 1 for count in active_by_user.values()),
        "planned_invalidations": sum(token.get("active") is True for token in tokens),
        "retired_indexes": len(set(indexes) & set(LEGACY_INDEXES)),
        "applied": marker is not None,
        "updated": 0,
        "second_run_noop": marker is not None,
    }
    if not apply or report["second_run_noop"]:
        return report

    _write_backup(path, tokens, indexes, marker)
    await _apply(
        database,
        guard,
        tokens,
        now_utc(),
        [name for name in LEGACY_INDEXES if name in indexes],
    )
    report["applied"] = True
    report["retired_indexes"] = 0
    report["updated"] = len(tokens)
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
        guard = None
        if args.apply or args.rollback:
            capabilities = await probe_database_capabilities(client, database_name)
            guard = TransactionMutationGuard(
                TransactionExecutor(client, lambda: capabilities),
                transaction_mutations_enabled,
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
    parser = argparse.ArgumentParser(description="Auth recovery safety migration 008")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--apply", action="store_true")
    mode.add_argument("--rollback", action="store_true")
    parser.add_argument("--backup", metavar="ENCRYPTED_BACKUP_PATH")
    parser.add_argument("--encrypted-backup-confirmed", action="store_true")
    return parser


if __name__ == "__main__":
    print(json.dumps(asyncio.run(run_cli(build_parser().parse_args())), indent=2))
