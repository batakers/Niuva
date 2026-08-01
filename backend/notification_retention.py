"""Guarded application retention for canonical notification records.

The reusable function is dry-run by default and has no scheduler or CLI entry
point. It only recognizes records explicitly written with the canonical schema
versions; versionless and historical shapes are outside the deletion boundary.
"""

from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from typing import Any

from notification_domain import (
    CANONICAL_NOTIFICATION_FIELDS,
    NOTIFICATION_OUTBOX_SCHEMA_VERSION,
    NOTIFICATION_RETENTION,
    NOTIFICATION_SCHEMA_VERSION,
    as_utc_datetime,
    notification_expiry,
    project_notification,
)

REPORT_VERSION = 1
TERMINAL_OUTBOX_RETENTION = timedelta(days=30)
MAX_BATCH_SIZE = 1000
TERMINAL_OUTBOX_STATUSES = frozenset({"delivered", "exhausted"})
TARGET_LABEL_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$")
DELIVERY_KEY_PATTERN = re.compile(r"^notification-delivery:[A-Za-z0-9._-]{1,160}$")

CANONICAL_OUTBOX_FIELDS = frozenset(
    {
        "schema_version",
        "id",
        "notification_id",
        "channel",
        "recipient",
        "payload",
        "status",
        "attempts",
        "last_error",
        "next_attempt_at",
        "lease_owner",
        "lease_token",
        "lease_until",
        "delivery_key",
        "created_at",
        "updated_at",
    }
)


def _bounded_text(value: Any, maximum: int) -> bool:
    return bool(
        isinstance(value, str)
        and 0 < len(value) <= maximum
        and not any(ord(character) < 32 or ord(character) == 127 for character in value)
    )


def _valid_terminal_outbox(document: dict, *, cutoff: datetime) -> bool:
    if document.get("_id") is None:
        return False
    if set(document) - (CANONICAL_OUTBOX_FIELDS | {"_id"}):
        return False
    if not CANONICAL_OUTBOX_FIELDS.issubset(document):
        return False
    if (
        type(document.get("schema_version")) is not int
        or document.get("schema_version") != NOTIFICATION_OUTBOX_SCHEMA_VERSION
    ):
        return False
    status = document.get("status")
    attempts = document.get("attempts")
    if status not in TERMINAL_OUTBOX_STATUSES:
        return False
    if type(attempts) is not int or not 1 <= attempts <= 5:
        return False
    if status == "exhausted" and attempts != 5:
        return False
    if not all(
        (
            _bounded_text(document.get("id"), 200),
            _bounded_text(document.get("notification_id"), 200),
            _bounded_text(document.get("channel"), 80),
            _bounded_text(document.get("recipient"), 320),
        )
    ):
        return False
    delivery_key = document.get("delivery_key")
    if not isinstance(delivery_key, str) or not DELIVERY_KEY_PATTERN.fullmatch(
        delivery_key
    ):
        return False
    if not isinstance(document.get("payload"), dict):
        return False
    if any(
        document.get(field) is not None
        for field in ("next_attempt_at", "lease_owner", "lease_token", "lease_until")
    ):
        return False
    if document.get("last_error") is not None and not _bounded_text(
        document["last_error"], 128
    ):
        return False
    created_at = as_utc_datetime(document.get("created_at"))
    updated_at = as_utc_datetime(document.get("updated_at"))
    return bool(
        created_at is not None
        and updated_at is not None
        and created_at <= updated_at <= cutoff
    )


def _valid_expired_notification(document: dict, *, moment: datetime) -> bool:
    if (
        document.get("_id") is None
        or document.get("schema_version") != NOTIFICATION_SCHEMA_VERSION
        or set(document) != CANONICAL_NOTIFICATION_FIELDS | {"_id"}
    ):
        return False
    projected = project_notification(document)
    expiry = notification_expiry(document)
    return bool(
        projected is not None
        and "compatibility_status" not in projected
        and expiry is not None
        and expiry <= moment
    )


async def _candidates(
    collection,
    query: dict,
    *,
    sort: list[tuple[str, int]],
    batch_size: int,
) -> tuple[list[dict], bool]:
    documents = (
        await collection.find(query)
        .sort(sort)
        .limit(batch_size + 1)
        .to_list(batch_size + 1)
    )
    return [dict(value) for value in documents[:batch_size]], len(
        documents
    ) > batch_size


def _empty_report(*, target_label: str, apply: bool, disposition: str) -> dict:
    return {
        "report_version": REPORT_VERSION,
        "target_label": target_label,
        "dry_run": not apply,
        "disposition": disposition,
        "policy": {
            "notification_retention_days": NOTIFICATION_RETENTION.days,
            "terminal_outbox_retention_days": TERMINAL_OUTBOX_RETENTION.days,
        },
        "notifications": {
            "selected": 0,
            "eligible": 0,
            "invalid_excluded": 0,
            "linked_excluded": 0,
            "delete_conflicts": 0,
            "deleted": 0,
            "truncated": False,
        },
        "terminal_outbox": {
            "selected": 0,
            "eligible": 0,
            "invalid_excluded": 0,
            "delete_conflicts": 0,
            "deleted": 0,
            "truncated": False,
        },
    }


async def cleanup_notification_retention(
    database,
    *,
    target_label: str,
    target_scope: str,
    apply: bool = False,
    cleanup_confirmed: bool = False,
    restore_tested_backup_confirmed: bool = False,
    owner_approved: bool = False,
    batch_size: int = 250,
    current_time: datetime | None = None,
) -> dict:
    """Report or delete one repeatable batch from an explicitly isolated target."""
    if not isinstance(batch_size, int) or isinstance(batch_size, bool):
        raise ValueError("batch_size must be an integer")
    if not 1 <= batch_size <= MAX_BATCH_SIZE:
        raise ValueError(f"batch_size must be between 1 and {MAX_BATCH_SIZE}")
    safe_label = (
        target_label
        if isinstance(target_label, str)
        and TARGET_LABEL_PATTERN.fullmatch(target_label)
        else "redacted"
    )
    if target_scope != "isolated" or safe_label == "redacted":
        if apply:
            raise ValueError("cleanup mutations require an isolated named target")
        return _empty_report(
            target_label=safe_label,
            apply=False,
            disposition="blocked_unsafe_target",
        )
    if apply and not cleanup_confirmed:
        raise ValueError("explicit cleanup confirmation is required")
    if apply and not restore_tested_backup_confirmed:
        raise ValueError("restore-tested backup confirmation is required")
    if apply and not owner_approved:
        raise ValueError("cleanup owner approval is required")

    moment = current_time or datetime.now(timezone.utc)
    if not isinstance(moment, datetime) or moment.tzinfo is None:
        raise ValueError("current_time must be timezone-aware")
    moment = moment.astimezone(timezone.utc)
    outbox_cutoff = moment - TERMINAL_OUTBOX_RETENTION
    outbox_documents, outbox_truncated = await _candidates(
        database.notification_outbox,
        {
            "schema_version": NOTIFICATION_OUTBOX_SCHEMA_VERSION,
            "status": {"$in": sorted(TERMINAL_OUTBOX_STATUSES)},
            "updated_at": {"$lte": outbox_cutoff},
        },
        sort=[("updated_at", 1), ("_id", 1)],
        batch_size=batch_size,
    )
    notification_documents, notification_truncated = await _candidates(
        database.notifications,
        {
            "schema_version": NOTIFICATION_SCHEMA_VERSION,
            "expires_at": {"$lte": moment},
            "created_at": {"$lte": moment - NOTIFICATION_RETENTION},
        },
        sort=[("expires_at", 1), ("_id", 1)],
        batch_size=batch_size,
    )
    valid_outbox = [
        document
        for document in outbox_documents
        if _valid_terminal_outbox(document, cutoff=outbox_cutoff)
    ]
    valid_notifications = [
        document
        for document in notification_documents
        if _valid_expired_notification(document, moment=moment)
    ]
    report = _empty_report(
        target_label=safe_label,
        apply=apply,
        disposition="ready_for_review",
    )
    report["terminal_outbox"].update(
        selected=len(outbox_documents),
        eligible=len(valid_outbox),
        invalid_excluded=len(outbox_documents) - len(valid_outbox),
        truncated=outbox_truncated,
    )
    report["notifications"].update(
        selected=len(notification_documents),
        eligible=len(valid_notifications),
        invalid_excluded=len(notification_documents) - len(valid_notifications),
        truncated=notification_truncated,
    )
    if (
        report["terminal_outbox"]["invalid_excluded"]
        or report["notifications"]["invalid_excluded"]
    ):
        report["disposition"] = "blocked_ambiguity"
        return report

    if apply:
        for document in valid_outbox:
            result = await database.notification_outbox.delete_one(
                {
                    "_id": document.get("_id"),
                    "schema_version": NOTIFICATION_OUTBOX_SCHEMA_VERSION,
                    "id": document["id"],
                    "delivery_key": document["delivery_key"],
                    "status": document["status"],
                    "updated_at": document["updated_at"],
                }
            )
            if result.deleted_count:
                report["terminal_outbox"]["deleted"] += 1
            else:
                report["terminal_outbox"]["delete_conflicts"] += 1

    deletable_notifications = []
    for document in valid_notifications:
        linked = await database.notification_outbox.count_documents(
            {"notification_id": document["id"]}, limit=1
        )
        if linked:
            report["notifications"]["linked_excluded"] += 1
        else:
            deletable_notifications.append(document)

    truncated = bool(outbox_truncated or notification_truncated)
    if apply:
        for document in deletable_notifications:
            result = await database.notifications.delete_one(
                {
                    "_id": document.get("_id"),
                    "schema_version": NOTIFICATION_SCHEMA_VERSION,
                    "id": document["id"],
                    "expires_at": document["expires_at"],
                }
            )
            if result.deleted_count:
                report["notifications"]["deleted"] += 1
            else:
                report["notifications"]["delete_conflicts"] += 1
        if (
            report["terminal_outbox"]["delete_conflicts"]
            or report["notifications"]["delete_conflicts"]
        ):
            report["disposition"] = "applied_with_conflicts"
        elif truncated:
            report["disposition"] = "applied_partial_batch"
        elif report["notifications"]["linked_excluded"]:
            report["disposition"] = "applied_with_exclusions"
        else:
            report["disposition"] = "applied"
    elif truncated:
        report["disposition"] = "partial_batch"
    elif report["notifications"]["linked_excluded"]:
        report["disposition"] = "ready_with_exclusions"
    return report
