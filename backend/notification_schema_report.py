"""Read-only, aggregate-safe preflight for general notification documents.

This module is intentionally not a migration utility. It classifies document
shapes and reports only counts so a later, separately approved migration can
stop on ambiguity without exposing notification or customer content.
"""

from __future__ import annotations

from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any


REPORT_VERSION = 1
SCAN_LIMIT = 10_000
NOTIFICATION_RETENTION = timedelta(days=180)
TERMINAL_DELIVERY_RETENTION = timedelta(days=30)

REFERENCE_COLLECTIONS = {
    "inquiry": "inquiries",
    "b2b_quote": "b2b_quotes",
    "b2b_project": "b2b_projects",
    "work_order": "work_orders",
    "retail_order": "retail_orders",
    "restock_alert": "restock_alerts",
    "material": "materials",
    "product_variant": "product_variants",
}

MODERN_NOTIFICATION_FIELDS = {
    "id",
    "user_id",
    "event",
    "title",
    "body",
    "deduplication_key",
    "read_at",
    "occurrence_count",
    "created_at",
    "last_seen_at",
    "updated_at",
}
LEGACY_NOTIFICATION_FIELDS = {
    "id",
    "user_id",
    "to_email",
    "subject",
    "title",
    "body_html",
    "read",
    "created_at",
}
OUTBOX_REQUIRED_FIELDS = {
    "id",
    "notification_id",
    "channel",
    "recipient",
    "payload",
    "status",
    "attempts",
    "delivery_key",
    "created_at",
    "updated_at",
}
ADMIN_LOG_REQUIRED_FIELDS = {"id", "recipient_count", "sent_by", "created_at"}
PROHIBITED_SECURITY_FIELDS = {
    "password",
    "password_hash",
    "reset_token",
    "token_hash",
    "otp",
    "recovery_code",
    "cookie",
    "authorization",
    "csrf",
    "provider_payload",
    "raw_exception",
    "raw_exception_body",
}


def _as_datetime(value: Any) -> datetime | None:
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def _contains_prohibited_security_field(value: Any) -> bool:
    if isinstance(value, dict):
        return any(
            key.lower() in PROHIBITED_SECURITY_FIELDS
            or _contains_prohibited_security_field(nested)
            for key, nested in value.items()
        )
    if isinstance(value, list):
        return any(_contains_prohibited_security_field(item) for item in value)
    return False


def _duplicate_groups(values: list[Any]) -> int:
    counts = Counter(value for value in values if isinstance(value, str) and value)
    return sum(1 for count in counts.values() if count > 1)


def _notification_shape(document: dict) -> str:
    fields = set(document)
    modern = MODERN_NOTIFICATION_FIELDS.issubset(fields)
    legacy = LEGACY_NOTIFICATION_FIELDS.issubset(fields)
    if modern and not legacy:
        return "modern_candidate"
    if legacy and not modern and not (fields & {"event", "body", "deduplication_key"}):
        return "legacy_candidate"
    return "mixed_or_unknown"


async def _read_documents(database, collection_name: str) -> tuple[list[dict], bool]:
    collection = getattr(database, collection_name)
    cursor = collection.find({}, {"_id": 0})
    if hasattr(cursor, "limit"):
        cursor = cursor.limit(SCAN_LIMIT + 1)
    documents = await cursor.to_list(SCAN_LIMIT + 1)
    return [dict(document) for document in documents[:SCAN_LIMIT]], len(documents) > SCAN_LIMIT


def _add_retention_count(
    result: Counter, timestamp: datetime | None, *, cutoff: datetime
) -> None:
    if timestamp is not None and timestamp <= cutoff:
        result["expired"] += 1


async def build_notification_schema_report(
    database,
    *,
    target_label: str,
    target_scope: str,
    now: datetime | None = None,
) -> dict:
    """Return only aggregate preflight evidence; never writes or exposes records."""
    if target_scope != "isolated" or not isinstance(target_label, str) or not target_label:
        return {
            "report_version": REPORT_VERSION,
            "target_label": target_label,
            "disposition": "blocked_ambiguity",
            "collections": {},
            "issues": {"unsafe_target": 1},
        }

    moment = now or datetime.now(timezone.utc)
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    issues: Counter[str] = Counter()
    collections: dict[str, dict] = {}

    notifications, notification_truncated = await _read_documents(database, "notifications")
    notification_shapes = Counter(_notification_shape(document) for document in notifications)
    notification_retention: Counter[str] = Counter()
    notification_ids: set[str] = set()
    reference_documents: list[dict] = []
    for document in notifications:
        shape = _notification_shape(document)
        if _contains_prohibited_security_field(document):
            issues["prohibited_security_field"] += 1
        if not isinstance(document.get("id"), str) or not document["id"]:
            issues["missing_notification_id"] += 1
        else:
            notification_ids.add(document["id"])
        if shape == "legacy_candidate":
            issues["legacy_notification_shape"] += 1
        elif shape == "mixed_or_unknown":
            issues["mixed_or_unknown_notification_shape"] += 1
        else:
            for field in ("created_at", "last_seen_at", "updated_at"):
                if _as_datetime(document.get(field)) is None:
                    issues["invalid_notification_timestamp"] += 1
                    break
            _add_retention_count(
                notification_retention,
                _as_datetime(document.get("created_at")),
                cutoff=moment - NOTIFICATION_RETENTION,
            )
            reference_documents.append(document)
    duplicate_notification_ids = _duplicate_groups(
        [document.get("id") for document in notifications]
    )
    if duplicate_notification_ids:
        issues["duplicate_notification_id"] += duplicate_notification_ids
    duplicate_deduplication_keys = _duplicate_groups(
        [
            document.get("deduplication_key")
            for document in notifications
            if _notification_shape(document) == "modern_candidate"
        ]
    )
    if duplicate_deduplication_keys:
        issues["duplicate_deduplication_key"] += duplicate_deduplication_keys
    if notification_truncated:
        issues["notification_scan_limit_exceeded"] += 1
    collections["notifications"] = {
        "total": len(notifications),
        "shape_counts": dict(sorted(notification_shapes.items())),
        "retention_counts": dict(sorted(notification_retention.items())),
    }

    for document in reference_documents:
        reference_type = document.get("reference_type")
        reference_id = document.get("reference_id")
        if reference_type is None and reference_id is None:
            continue
        collection_name = REFERENCE_COLLECTIONS.get(reference_type)
        if collection_name is None:
            issues["unknown_notification_reference"] += 1
            continue
        if not isinstance(reference_id, str) or not reference_id:
            if reference_type != "restock_alert":
                issues["missing_notification_reference_id"] += 1
            continue
        target = await getattr(database, collection_name).find_one(
            {"id": reference_id}, {"_id": 1}
        )
        if target is None:
            issues["orphan_notification_reference"] += 1

    outbox, outbox_truncated = await _read_documents(database, "notification_outbox")
    outbox_shapes: Counter[str] = Counter()
    outbox_retention: Counter[str] = Counter()
    for document in outbox:
        if _contains_prohibited_security_field(document):
            issues["prohibited_security_field"] += 1
        if OUTBOX_REQUIRED_FIELDS.issubset(document):
            outbox_shapes["modern_candidate"] += 1
        elif {"id", "notification_id"}.issubset(document):
            outbox_shapes["missing_runtime_fields"] += 1
            issues["missing_outbox_runtime_fields"] += 1
        else:
            outbox_shapes["mixed_or_unknown"] += 1
            issues["mixed_or_unknown_outbox_shape"] += 1
        if document.get("notification_id") not in notification_ids:
            issues["orphan_outbox"] += 1
        if _as_datetime(document.get("created_at")) is None or _as_datetime(
            document.get("updated_at")
        ) is None:
            issues["invalid_outbox_timestamp"] += 1
        if document.get("status") in {"delivered", "exhausted"}:
            _add_retention_count(
                outbox_retention,
                _as_datetime(document.get("updated_at")),
                cutoff=moment - TERMINAL_DELIVERY_RETENTION,
            )
    duplicate_outbox_ids = _duplicate_groups([document.get("id") for document in outbox])
    if duplicate_outbox_ids:
        issues["duplicate_outbox_id"] += duplicate_outbox_ids
    duplicate_delivery_keys = _duplicate_groups(
        [document.get("delivery_key") for document in outbox]
    )
    if duplicate_delivery_keys:
        issues["duplicate_delivery_identity"] += duplicate_delivery_keys
    if outbox_truncated:
        issues["outbox_scan_limit_exceeded"] += 1
    collections["notification_outbox"] = {
        "total": len(outbox),
        "shape_counts": dict(sorted(outbox_shapes.items())),
        "retention_counts": dict(sorted(outbox_retention.items())),
    }

    logs, logs_truncated = await _read_documents(database, "admin_notification_log")
    log_shapes: Counter[str] = Counter()
    log_retention: Counter[str] = Counter()
    for document in logs:
        if _contains_prohibited_security_field(document):
            issues["prohibited_security_field"] += 1
        if ADMIN_LOG_REQUIRED_FIELDS.issubset(document):
            log_shapes["metadata_candidate"] += 1
        else:
            log_shapes["mixed_or_unknown"] += 1
            issues["mixed_or_unknown_admin_log_shape"] += 1
        created_at = _as_datetime(document.get("created_at"))
        if created_at is None:
            issues["invalid_admin_log_timestamp"] += 1
        _add_retention_count(
            log_retention, created_at, cutoff=moment - NOTIFICATION_RETENTION
        )
    duplicate_log_ids = _duplicate_groups([document.get("id") for document in logs])
    if duplicate_log_ids:
        issues["duplicate_admin_log_id"] += duplicate_log_ids
    if logs_truncated:
        issues["admin_log_scan_limit_exceeded"] += 1
    collections["admin_notification_log"] = {
        "total": len(logs),
        "shape_counts": dict(sorted(log_shapes.items())),
        "retention_counts": dict(sorted(log_retention.items())),
    }

    return {
        "report_version": REPORT_VERSION,
        "target_label": target_label,
        "disposition": "blocked_ambiguity" if issues else "ready_for_review",
        "collections": collections,
        "issues": dict(sorted(issues.items())),
    }
