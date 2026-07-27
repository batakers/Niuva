"""Migration 007: secure sessions, immutable publications, and file ownership.

Dry-run is the default. Apply requires explicit backup evidence:

    python -m migrations.007_security_publication_schema
    python -m migrations.007_security_publication_schema \
      --apply --backup-evidence /path/to/reviewed-backup-manifest.json

The report contains counts and index names only; it never emits duplicate
values, user identifiers, tokens, file paths, or other sensitive data.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path

from schema_manifest import INDEX_DECLARATIONS, REQUIRED_SCHEMA_VERSION

MIGRATION_ID = REQUIRED_SCHEMA_VERSION
BACKUP_EVIDENCE_FIELDS = frozenset(
    {
        "migration_id",
        "environment",
        "database",
        "backup_at",
        "checksum",
        "location",
        "reviewer",
        "restore_test",
        "approval_window",
    }
)


def validate_backup_evidence(reference: str) -> dict:
    path = Path(reference).expanduser()
    if not path.is_absolute() or not path.is_file():
        raise ValueError("backup_evidence must be an existing absolute JSON file")
    try:
        evidence = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError("backup_evidence must be readable valid JSON") from exc
    if not isinstance(evidence, dict) or not BACKUP_EVIDENCE_FIELDS <= evidence.keys():
        raise ValueError("backup_evidence is missing required fields")
    if evidence.get("migration_id") != MIGRATION_ID:
        raise ValueError("backup_evidence is not bound to Migration 007")
    for field in ("environment", "database", "backup_at", "location", "reviewer"):
        if not str(evidence.get(field) or "").strip():
            raise ValueError(f"backup_evidence.{field} is required")
    checksum = evidence.get("checksum")
    if not isinstance(checksum, dict) or not all(
        str(checksum.get(field) or "").strip() for field in ("algorithm", "value")
    ):
        raise ValueError("backup_evidence.checksum requires algorithm and value")
    restore = evidence.get("restore_test")
    if (
        not isinstance(restore, dict)
        or restore.get("status") != "passed"
        or not str(restore.get("tested_at") or "").strip()
    ):
        raise ValueError("backup_evidence requires a passed restore test")
    window = evidence.get("approval_window")
    if not isinstance(window, dict) or not all(
        str(window.get(field) or "").strip() for field in ("starts_at", "ends_at")
    ):
        raise ValueError("backup_evidence approval window is incomplete")
    for timestamp in (
        evidence["backup_at"],
        restore["tested_at"],
        window["starts_at"],
        window["ends_at"],
    ):
        parsed = _as_utc_date(timestamp)
        if (
            parsed is None
            or datetime.fromisoformat(str(timestamp).replace("Z", "+00:00")).tzinfo
            is None
        ):
            raise ValueError("backup evidence timestamps require timezone")
    window_start = _as_utc_date(window["starts_at"])
    window_end = _as_utc_date(window["ends_at"])
    if window_start >= window_end:
        raise ValueError("backup evidence approval window is invalid")
    now = datetime.now(timezone.utc)
    if not window_start <= now <= window_end:
        raise ValueError("Migration 007 apply is outside the approved window")
    if "://" in str(evidence["location"]) and "@" in str(evidence["location"]):
        raise ValueError("backup evidence location must not contain credentials")
    return evidence


def _keys(declaration: dict) -> list[tuple[str, int]]:
    keys = declaration["keys"]
    if isinstance(keys, str):
        return [(keys, 1)]
    return list(keys)


def _duplicate_pipeline(declaration: dict) -> list[dict]:
    options = declaration["options"]
    pipeline = []
    partial = options.get("partialFilterExpression")
    if partial:
        pipeline.append({"$match": deepcopy(partial)})
    key_fields = [field for field, _direction in _keys(declaration)]
    group_id = (
        f"${key_fields[0]}"
        if len(key_fields) == 1
        else {field: f"${field}" for field in key_fields}
    )
    pipeline.extend(
        [
            {"$group": {"_id": group_id, "count": {"$sum": 1}}},
            {"$match": {"count": {"$gt": 1}}},
            {"$count": "duplicate_groups"},
        ]
    )
    return pipeline


async def _duplicate_group_count(database, declaration: dict) -> int:
    if not declaration["options"].get("unique"):
        return 0
    cursor = getattr(database, declaration["collection"]).aggregate(
        _duplicate_pipeline(declaration),
        allowDiskUse=True,
    )
    rows = await cursor.to_list(1)
    return int(rows[0]["duplicate_groups"]) if rows else 0


def _index_compatible(spec: dict, declaration: dict) -> bool:
    if list(spec.get("key", [])) != _keys(declaration):
        return False
    options = declaration["options"]
    return (
        bool(spec.get("unique", False)) == bool(options.get("unique", False))
        and spec.get("expireAfterSeconds") == options.get("expireAfterSeconds")
        and spec.get("partialFilterExpression")
        == options.get("partialFilterExpression")
    )


async def ensure_indexes(database) -> dict:
    created = []
    compatible_existing = []
    for declaration in INDEX_DECLARATIONS:
        collection = getattr(database, declaration["collection"])
        existing = await collection.index_information()
        compatible_name = next(
            (
                name
                for name, spec in existing.items()
                if _index_compatible(spec, declaration)
            ),
            None,
        )
        if compatible_name:
            compatible_existing.append(compatible_name)
            continue
        created_name = await collection.create_index(
            declaration["keys"],
            **declaration["options"],
        )
        created.append(created_name)
    return {
        "created_count": len(created),
        "compatible_existing_count": len(compatible_existing),
        "created_indexes": sorted(created),
    }


def _as_utc_date(value):
    if isinstance(value, datetime):
        moment = value
    elif isinstance(value, str):
        try:
            moment = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    else:
        return None
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    return moment.astimezone(timezone.utc)


async def _plan_file_backfill(database) -> list[dict]:
    planned = []
    cursor = database.orders.find(
        {"file.storage_path": {"$type": "string"}},
        {
            "_id": 0,
            "id": 1,
            "user_id": 1,
            "file": 1,
            "created_at": 1,
            "updated_at": 1,
        },
    )
    async for order in cursor:
        file_record = order.get("file") or {}
        path = file_record.get("storage_path")
        if not path or await database.file_objects.find_one(
            {"storage_path": path},
            {"_id": 1},
        ):
            continue
        planned.append(
            {
                "id": file_record.get("id") or f"migration-file:{order.get('id')}",
                "storage_path": path,
                "original_filename": file_record.get("original_filename", ""),
                "content_type": file_record.get(
                    "content_type",
                    "application/octet-stream",
                ),
                "size": file_record.get("size"),
                "owner_type": "user",
                "owner_id": order.get("user_id"),
                "object_type": "order_design",
                "linked_type": "order",
                "linked_id": order.get("id"),
                "state": "deleted" if file_record.get("deleted") else "active",
                "created_at": _as_utc_date(order.get("created_at"))
                or datetime.now(timezone.utc),
                "updated_at": _as_utc_date(order.get("updated_at"))
                or datetime.now(timezone.utc),
                "migration_id": MIGRATION_ID,
            }
        )
    return planned


async def _plan_publication_backfill(database) -> list[dict]:
    planned = []
    cursor = database.content_blocks.find(
        {"status": {"$in": ["published", "scheduled"]}},
        {"_id": 0},
    )
    async for block in cursor:
        source_version_id = block.get("published_version_id") or (
            f"migration-version:{block['id']}:{block.get('version', 1)}"
        )
        if await database.content_publications.find_one(
            {"source_version_id": source_version_id},
            {"_id": 1},
        ):
            continue
        version = await database.content_block_versions.find_one(
            {"id": block.get("published_version_id")},
            {"_id": 0},
        )
        fields = deepcopy((version or block).get("fields") or {})
        activates_at = (
            _as_utc_date(block.get("scheduled_at"))
            or _as_utc_date(block.get("published_at"))
            or _as_utc_date(block.get("updated_at"))
            or datetime.now(timezone.utc)
        )
        planned.append(
            {
                "id": f"migration-publication:{block['id']}:{block.get('version', 1)}",
                "content_block_id": block["id"],
                "content_type": block["content_type"],
                "slug": block["slug"],
                "fields": fields,
                "source_version_id": source_version_id,
                "source_version": block.get("version", 1),
                "activates_at": activates_at,
                "retired_at": None,
                "created_by": "migration:007",
                "created_at": block.get("updated_at"),
                "updated_at": block.get("updated_at"),
                "migration_id": MIGRATION_ID,
            }
        )
    return planned


async def _plan_portfolio_backfill(database) -> dict:
    revisions = []
    publications = []
    entry_updates = []
    issues: dict[str, int] = {}
    cursor = database.portfolio.find({}, {"_id": 0})
    async for entry in cursor:
        if entry.get("current_revision_id") and entry.get("revision_count"):
            continue
        legacy_versions = entry.get("versions")
        if not isinstance(legacy_versions, list) or not legacy_versions:
            issues["empty_or_missing_versions"] = (
                issues.get("empty_or_missing_versions", 0) + 1
            )
            continue
        try:
            revision_numbers = [int(item["revision"]) for item in legacy_versions]
        except (KeyError, TypeError, ValueError):
            issues["invalid_revision"] = issues.get("invalid_revision", 0) + 1
            continue
        if revision_numbers != list(range(1, len(revision_numbers) + 1)):
            issues["unordered_or_duplicate_revision"] = (
                issues.get("unordered_or_duplicate_revision", 0) + 1
            )
            continue
        matching_revisions = [
            index
            for index, legacy in enumerate(legacy_versions)
            if isinstance(legacy.get("content"), dict)
            and legacy["content"]
            and all(
                entry.get(field) == value for field, value in legacy["content"].items()
            )
        ]
        if matching_revisions != [len(legacy_versions) - 1]:
            issues["active_revision_ambiguous"] = (
                issues.get("active_revision_ambiguous", 0) + 1
            )
            continue
        current_revision_id = None
        for legacy in legacy_versions:
            revision_number = int(legacy.get("revision", 1))
            revision_id = (
                f"migration-portfolio-revision:{entry['id']}:{revision_number}"
            )
            current_revision_id = revision_id
            if not await database.portfolio_revisions.find_one(
                {"id": revision_id},
                {"_id": 1},
            ):
                revisions.append(
                    {
                        "id": revision_id,
                        "portfolio_id": entry["id"],
                        "revision": revision_number,
                        "content": deepcopy(legacy.get("content") or {}),
                        "actor_user_id": legacy.get("actor_user_id") or "migration:007",
                        "reason": legacy.get("reason") or "Legacy portfolio snapshot",
                        "created_at": legacy.get("created_at")
                        or entry.get("created_at"),
                        "migration_id": MIGRATION_ID,
                    }
                )
        entry_updates.append(
            {
                "id": entry["id"],
                "revision_count": len(legacy_versions),
                "current_revision_id": current_revision_id,
            }
        )
        if entry.get("status") not in {"published", "scheduled"}:
            continue
        publication_id = (
            f"migration-portfolio-publication:{entry['id']}:" f"{len(legacy_versions)}"
        )
        if await database.portfolio_publications.find_one(
            {"id": publication_id},
            {"_id": 1},
        ):
            continue
        activates_at = (
            _as_utc_date(entry.get("scheduled_for"))
            or _as_utc_date(entry.get("published_at"))
            or _as_utc_date(entry.get("updated_at"))
            or datetime.now(timezone.utc)
        )
        public_fields = (
            "id",
            "title_id",
            "title_en",
            "category",
            "description_id",
            "description_en",
            "images",
            "featured",
            "display_order",
            "published_at",
        )
        publications.append(
            {
                "id": publication_id,
                "portfolio_id": entry["id"],
                "source_revision_id": current_revision_id,
                "source_revision": len(legacy_versions),
                "snapshot": {
                    field: deepcopy(entry[field])
                    for field in public_fields
                    if field in entry
                },
                "activates_at": activates_at,
                "retired_at": None,
                "created_by": "migration:007",
                "reason": "Legacy portfolio publication",
                "created_at": _as_utc_date(entry.get("updated_at"))
                or datetime.now(timezone.utc),
                "migration_id": MIGRATION_ID,
            }
        )
    return {
        "revisions": revisions,
        "publications": publications,
        "entry_updates": entry_updates,
        "issues": issues,
    }


async def _plan_date_conversions(database) -> list[dict]:
    planned = []
    for collection_name, field_name in (
        ("password_reset_tokens", "expires_at"),
        ("staff_invitations", "expires_at"),
        ("content_blocks", "scheduled_at"),
        ("portfolio", "scheduled_for"),
    ):
        collection = getattr(database, collection_name)
        cursor = collection.find(
            {field_name: {"$type": "string"}},
            {"_id": 1, "id": 1, field_name: 1},
        )
        async for record in cursor:
            converted = _as_utc_date(record.get(field_name))
            if converted is not None:
                planned.append(
                    {
                        "collection": collection_name,
                        "field": field_name,
                        "selector": (
                            {"_id": record["_id"]}
                            if "_id" in record
                            else {"id": record["id"]}
                        ),
                        "legacy": record[field_name],
                        "converted": converted,
                    }
                )
    return planned


async def _plan_runtime_backfills(database) -> dict:
    outbox = []
    cursor = database.notification_outbox.find({}, {"_id": 1, "id": 1})
    async for record in cursor:
        selector = {"_id": record["_id"]} if "_id" in record else {"id": record["id"]}
        full = await database.notification_outbox.find_one(selector)
        if all(
            field in full
            for field in (
                "delivery_key",
                "next_attempt_at",
                "lease_owner",
                "lease_token",
                "lease_until",
            )
        ):
            continue
        timestamp = (
            _as_utc_date(full.get("updated_at"))
            or _as_utc_date(full.get("created_at"))
            or datetime.now(timezone.utc)
        )
        outbox.append(
            {
                "selector": selector,
                "fields": {
                    "delivery_key": full.get("delivery_key")
                    or f"migration-outbox:{full.get('id')}",
                    "next_attempt_at": _as_utc_date(full.get("next_attempt_at"))
                    or timestamp,
                    "lease_owner": full.get("lease_owner"),
                    "lease_token": full.get("lease_token"),
                    "lease_until": _as_utc_date(full.get("lease_until")),
                    "updated_at": timestamp,
                },
            }
        )

    settings = []
    cursor = database.settings.find(
        {},
        {"_id": 1, "key": 1, "version": 1},
    )
    async for record in cursor:
        if isinstance(record.get("version"), int) and record["version"] >= 1:
            continue
        settings.append(
            {
                "selector": (
                    {"_id": record["_id"]}
                    if "_id" in record
                    else {"key": record["key"]}
                ),
                "fields": {"version": 1},
            }
        )
    return {"outbox": outbox, "settings": settings}


async def migrate(
    database,
    *,
    dry_run: bool,
    backup_evidence: str | None = None,
) -> dict:
    existing = await database.schema_migrations.find_one({"_id": MIGRATION_ID})
    if existing:
        return {
            "migration": MIGRATION_ID,
            "dry_run": dry_run,
            "status": "already_applied",
        }
    evidence = None
    if not dry_run:
        if not backup_evidence:
            raise ValueError("apply requires reviewed backup_evidence")
        evidence = validate_backup_evidence(backup_evidence)

    duplicates = {}
    for declaration in INDEX_DECLARATIONS:
        count = await _duplicate_group_count(database, declaration)
        if count:
            duplicates[declaration["options"]["name"]] = count

    files = await _plan_file_backfill(database)
    publications = await _plan_publication_backfill(database)
    portfolio = await _plan_portfolio_backfill(database)
    date_conversions = await _plan_date_conversions(database)
    runtime_backfills = await _plan_runtime_backfills(database)
    report = {
        "migration": MIGRATION_ID,
        "dry_run": dry_run,
        "status": (
            "blocked_duplicates"
            if duplicates
            else "blocked_portfolio_history" if portfolio["issues"] else "ready"
        ),
        "duplicate_groups_by_index": duplicates,
        "portfolio_preflight_issues": portfolio["issues"],
        "planned": {
            "file_objects": len(files),
            "content_publications": len(publications),
            "portfolio_revisions": len(portfolio["revisions"]),
            "portfolio_publications": len(portfolio["publications"]),
            "portfolio_entry_updates": len(portfolio["entry_updates"]),
            "date_conversions": len(date_conversions),
            "notification_outbox": len(runtime_backfills["outbox"]),
            "settings_versions": len(runtime_backfills["settings"]),
            "indexes": len(INDEX_DECLARATIONS),
        },
    }
    if dry_run or duplicates or portfolio["issues"]:
        return report

    # Indexes cannot participate in MongoDB multi-document transactions. Create
    # compatible indexes first; the data backfill and migration ledger then
    # commit atomically. A retry treats already-created indexes as compatible.
    report["indexes"] = await ensure_indexes(database)

    async with await database.client.start_session() as session:
        async with session.start_transaction():
            options = {"session": session}
            for item in files:
                await database.file_objects.insert_one(item, **options)
            for item in publications:
                await database.content_publications.insert_one(item, **options)
            for item in portfolio["revisions"]:
                await database.portfolio_revisions.insert_one(item, **options)
            for item in portfolio["publications"]:
                await database.portfolio_publications.insert_one(item, **options)
            for item in portfolio["entry_updates"]:
                await database.portfolio.update_one(
                    {"id": item["id"]},
                    {
                        "$set": {
                            "revision_count": item["revision_count"],
                            "current_revision_id": item["current_revision_id"],
                        },
                        "$unset": {"versions": ""},
                    },
                    **options,
                )
            for conversion in date_conversions:
                await getattr(database, conversion["collection"]).update_one(
                    conversion["selector"],
                    {
                        "$set": {
                            conversion["field"]: conversion["converted"],
                            (
                                "migration_007_legacy_" f"{conversion['field']}"
                            ): conversion["legacy"],
                        }
                    },
                    **options,
                )
            for update in runtime_backfills["outbox"]:
                await database.notification_outbox.update_one(
                    update["selector"],
                    {"$set": update["fields"]},
                    **options,
                )
            for update in runtime_backfills["settings"]:
                await database.settings.update_one(
                    update["selector"],
                    {"$set": update["fields"]},
                    **options,
                )
            await database.schema_migrations.insert_one(
                {
                    "_id": MIGRATION_ID,
                    "applied_at": datetime.now(timezone.utc),
                    "backup_evidence": {
                        "manifest_filename": Path(str(backup_evidence)).name,
                        "migration_id": evidence["migration_id"],
                        "environment": evidence["environment"],
                        "database": evidence["database"],
                        "backup_at": _as_utc_date(evidence["backup_at"]),
                        "checksum_algorithm": evidence["checksum"]["algorithm"],
                        "checksum_value": evidence["checksum"]["value"],
                        "restore_test_status": evidence["restore_test"]["status"],
                        "restore_tested_at": _as_utc_date(
                            evidence["restore_test"]["tested_at"]
                        ),
                        "reviewer": evidence["reviewer"],
                        "approval_window_start": _as_utc_date(
                            evidence["approval_window"]["starts_at"]
                        ),
                        "approval_window_end": _as_utc_date(
                            evidence["approval_window"]["ends_at"]
                        ),
                    },
                    "manifest_index_count": len(INDEX_DECLARATIONS),
                },
                **options,
            )
    report["status"] = "applied"
    return report


async def run_cli(*, apply: bool, backup_evidence: str | None) -> dict:
    from dotenv import load_dotenv
    from motor.motor_asyncio import AsyncIOMotorClient

    backend_dir = Path(__file__).resolve().parents[1]
    load_dotenv(backend_dir / ".env")
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    try:
        return await migrate(
            client[os.environ["DB_NAME"]],
            dry_run=not apply,
            backup_evidence=backup_evidence,
        )
    finally:
        client.close()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--backup-evidence")
    args = parser.parse_args()
    result = asyncio.run(
        run_cli(
            apply=args.apply,
            backup_evidence=args.backup_evidence,
        )
    )
    print(json.dumps(result, indent=2, sort_keys=True, default=str))


if __name__ == "__main__":
    main()
