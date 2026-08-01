"""Read-only, aggregate-safe preflight for general notification documents.

This module is intentionally not a migration utility. It classifies document
shapes and reports only counts so a later, separately approved migration can
stop on ambiguity without exposing notification or customer content.
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import os
import re
from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Any

REPORT_VERSION = 3
SCAN_LIMIT = 10_000
NOTIFICATION_RETENTION = timedelta(days=180)
TERMINAL_DELIVERY_RETENTION = timedelta(days=30)
MAX_DELIVERY_ATTEMPTS = 5
MAX_NESTED_DEPTH = 16
SUPPORTED_NOTIFICATION_SCHEMA_VERSIONS = frozenset({1})
SUPPORTED_OUTBOX_CHANNELS = frozenset({"email"})
OUTBOX_PAYLOAD_ALLOWED_FIELDS = frozenset({"subject", "title", "body_html"})

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
CANONICAL_NOTIFICATION_FIELDS = {
    "schema_version",
    "reference_type",
    "reference_id",
    "expires_at",
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
    "last_error",
    "next_attempt_at",
    "lease_owner",
    "lease_token",
    "lease_until",
    "created_at",
    "updated_at",
}
ADMIN_LOG_REQUIRED_FIELDS = {"id", "recipient_count", "sent_by", "created_at"}
ADMIN_LOG_ALLOWED_FIELDS = {
    "id",
    "target",
    "user_id",
    "segment",
    "subject",
    "message",
    "recipient_count",
    "delivery_status",
    "sent_by",
    "created_at",
}
PROHIBITED_SECURITY_FIELDS = {
    "access_token",
    "api_key",
    "api_secret",
    "secret",
    "private_key",
    "password",
    "password_hash",
    "credential",
    "credentials",
    "client_secret",
    "refresh_token",
    "reset_token",
    "token_hash",
    "session_token",
    "token",
    "otp",
    "recovery_code",
    "recovery_codes",
    "cookie",
    "set_cookie",
    "authorization",
    "csrf",
    "provider_payload",
    "raw_exception",
    "raw_exception_body",
}
ADMIN_LOG_CONTENT_OR_CONTACT_FIELDS = {
    "body",
    "body_html",
    "email",
    "message",
    "payload",
    "recipient",
    "recipients",
    "subject",
    "to_email",
    "user_id",
}
PLACEHOLDER_METADATA_VALUES = frozenset(
    {"changeme", "none", "placeholder", "tbd", "todo", "unknown", "unset"}
)
VALID_OUTBOX_STATES = {"pending", "processing", "delivered", "exhausted"}
TARGET_LABEL_PATTERN = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]{0,79}\Z")
FINGERPRINT_PATTERN = re.compile(r"[0-9a-f]{64}\Z")
_VERIFIED_TARGET_PROOF = object()
_REPORT_FIELD_NAMES = "__report_field_names__"
_FIELD_PRESENCE_SIGNATURE = "__field_presence_signature__"
_FIELD_TYPE_SIGNATURE = "__field_type_signature__"
_UNKNOWN_FIELD_SIGNATURE = "__unknown_field_signature__"
_INVALID_OUTBOX_PAYLOAD_FIELD = "__invalid_outbox_payload_field__"
_INVALID_VALUE = object()
_UNKNOWN_VALUE = object()

_CANONICAL_FIELD_NAMES = (
    MODERN_NOTIFICATION_FIELDS
    | CANONICAL_NOTIFICATION_FIELDS
    | LEGACY_NOTIFICATION_FIELDS
    | OUTBOX_REQUIRED_FIELDS
    | ADMIN_LOG_ALLOWED_FIELDS
    | PROHIBITED_SECURITY_FIELDS
    | ADMIN_LOG_CONTENT_OR_CONTACT_FIELDS
    | OUTBOX_PAYLOAD_ALLOWED_FIELDS
)
_COMPACT_FIELD_ALIASES = {
    field.replace("_", ""): field for field in _CANONICAL_FIELD_NAMES
}


class ReportTargetError(ValueError):
    """Safe target-verification failure whose code may appear in output."""

    def __init__(self, code: str):
        super().__init__(code)
        self.code = code


@dataclass(frozen=True)
class InspectedReportTarget:
    """Inspection evidence that cannot authorize collection reads."""

    label: str
    database_name: str
    topology_fingerprint: str


@dataclass(frozen=True)
class RepresentativeEvidenceApproval:
    """Required approval metadata; raw values are never copied into a report."""

    dataset_id: str
    snapshot_id: str
    manifest_id: str
    expected_fingerprint: str
    read_only_credential_reference: str
    custody_owner: str
    reviewer: str
    execution_window_start: datetime
    execution_window_end: datetime
    evidence_location: str
    retention_policy: str


@dataclass(frozen=True)
class VerifiedReportTarget:
    """Evidence bound to an independently approved target fingerprint."""

    label: str
    database_name: str
    fingerprint: str
    approval_fingerprint: str
    _proof: object = field(repr=False, compare=False)
    _database: object = field(repr=False, compare=False)
    _approval: RepresentativeEvidenceApproval = field(repr=False, compare=False)


def _identity(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


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


def _normalize_field_name(value: Any) -> str:
    text = str(value).strip()
    text = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1_\2", text)
    text = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", text)
    normalized = (
        re.sub(r"_+", "_", re.sub(r"[^A-Za-z0-9]+", "_", text)).strip("_").lower()
    )
    return _COMPACT_FIELD_ALIASES.get(normalized.replace("_", ""), normalized)


def _matches_named_field(value: Any, prohibited_names: set[str]) -> bool:
    normalized = _normalize_field_name(value)
    return any(
        normalized == prohibited
        or normalized.startswith(f"{prohibited}_")
        or normalized.endswith(f"_{prohibited}")
        or f"_{prohibited}_" in normalized
        for prohibited in prohibited_names
    )


def _scan_named_fields(
    value: Any,
    names: set[str],
    *,
    compound_match: bool,
    require_nonempty: bool,
    exempt_root_names: frozenset[str] = frozenset(),
) -> tuple[bool, bool]:
    """Return ``(found, depth_exceeded)`` without retaining a field value."""
    stack = [(value, 0, True)]
    visited: set[int] = set()
    depth_exceeded = False
    while stack:
        current, depth, is_root = stack.pop()
        if depth > MAX_NESTED_DEPTH:
            depth_exceeded = True
            continue
        if isinstance(current, (dict, list)):
            marker = id(current)
            if marker in visited:
                continue
            visited.add(marker)
        if isinstance(current, dict):
            for key, nested in current.items():
                normalized = _normalize_field_name(key)
                exempt = is_root and normalized in exempt_root_names
                matches = (
                    _matches_named_field(key, names)
                    if compound_match
                    else normalized in names
                )
                if (
                    not exempt
                    and matches
                    and (not require_nonempty or nested not in (None, "", [], {}))
                ):
                    return True, depth_exceeded
                stack.append((nested, depth + 1, False))
        elif isinstance(current, list):
            stack.extend((item, depth + 1, False) for item in current)
    return False, depth_exceeded


def _duplicate_groups(values: list[Any]) -> int:
    counts = Counter(value for value in values if _identity(value))
    return sum(1 for count in counts.values() if count > 1)


def _notification_shape(document: dict) -> str:
    fields = _document_fields(document)
    modern = MODERN_NOTIFICATION_FIELDS.issubset(fields)
    legacy = LEGACY_NOTIFICATION_FIELDS.issubset(fields)
    modern_allowed = MODERN_NOTIFICATION_FIELDS | CANONICAL_NOTIFICATION_FIELDS
    if modern and not legacy and fields <= modern_allowed:
        return "modern_candidate"
    if legacy and not modern and fields <= LEGACY_NOTIFICATION_FIELDS:
        return "legacy_candidate"
    return "mixed_or_unknown"


def _document_fields(document: dict) -> set[str] | frozenset[str]:
    return document.get(_REPORT_FIELD_NAMES, frozenset(document))


def _bson_type_name(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "bool"
    if isinstance(value, int):
        return "int"
    if isinstance(value, float):
        return "double"
    if isinstance(value, str):
        return "string"
    if isinstance(value, datetime):
        return "date"
    if isinstance(value, dict):
        return "object"
    if isinstance(value, (list, tuple)):
        return "array"
    if isinstance(value, bytes):
        return "binary"
    return "other"


def _signature(parts: list[str]) -> str:
    canonical = "|".join(sorted(parts))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def _allowed_fields(collection_name: str) -> set[str]:
    if collection_name == "notifications":
        return (
            MODERN_NOTIFICATION_FIELDS
            | CANONICAL_NOTIFICATION_FIELDS
            | LEGACY_NOTIFICATION_FIELDS
        )
    if collection_name == "notification_outbox":
        return OUTBOX_REQUIRED_FIELDS
    return ADMIN_LOG_ALLOWED_FIELDS


def _unknown_schema_paths(collection_name: str, document: dict) -> list[str]:
    """Collect normalized schema paths, stopping at the first unknown parent."""
    unknown = {
        _normalize_field_name(field)
        for field in document
        if not isinstance(field, str) or field not in _allowed_fields(collection_name)
    }
    if collection_name == "notification_outbox" and isinstance(
        document.get("payload"), dict
    ):
        unknown.update(
            f"payload.{_normalize_field_name(field)}"
            for field in document["payload"]
            if not isinstance(field, str) or field not in OUTBOX_PAYLOAD_ALLOWED_FIELDS
        )
    return sorted(unknown)


def _document_signatures(
    collection_name: str, document: dict
) -> tuple[str, str, str | None]:
    normalized = [
        (_normalize_field_name(field), value) for field, value in document.items()
    ]
    presence_signature = _signature(list({field for field, _value in normalized}))
    type_signature = _signature(
        [f"{field}:{_bson_type_name(value)}" for field, value in normalized]
    )
    unknown = _unknown_schema_paths(collection_name, document)
    return presence_signature, type_signature, _signature(unknown) if unknown else None


def _text_shape(value: Any) -> str | None | object:
    if value is None:
        return None
    if isinstance(value, str):
        return "present" if value.strip() else ""
    return _INVALID_VALUE


def _identity_value(value: Any) -> str | None | object:
    if value is None:
        return None
    return value if _identity(value) else _INVALID_VALUE


def _datetime_value(value: Any) -> datetime | None | object:
    if value is None:
        return None
    return _as_datetime(value) or _INVALID_VALUE


def _integer_value(value: Any) -> int | object:
    if isinstance(value, int) and not isinstance(value, bool):
        return value
    return _INVALID_VALUE


def _notification_summary(document: dict) -> dict:
    summary = {_REPORT_FIELD_NAMES: frozenset(document)}
    identity_fields = {
        "id",
        "event",
        "reference_type",
        "reference_id",
        "deduplication_key",
    }
    for field in identity_fields:
        if field in document:
            summary[field] = _identity_value(document[field])
    for field in (
        "read_at",
        "created_at",
        "last_seen_at",
        "updated_at",
        "expires_at",
    ):
        if field in document:
            summary[field] = _datetime_value(document[field])
    for field in ("occurrence_count", "schema_version"):
        if field in document:
            summary[field] = _integer_value(document[field])
    for field in ("user_id", "title", "body"):
        if field in document:
            summary[field] = _text_shape(document[field])
    return summary


def _outbox_summary(document: dict) -> dict:
    summary = {_REPORT_FIELD_NAMES: frozenset(document)}
    for field in ("id", "notification_id", "delivery_key"):
        if field in document:
            summary[field] = _identity_value(document[field])
    if "status" in document:
        status = document["status"]
        summary["status"] = (
            status
            if isinstance(status, str) and status in VALID_OUTBOX_STATES
            else _INVALID_VALUE
        )
    if "attempts" in document:
        summary["attempts"] = _integer_value(document["attempts"])
    for field in (
        "next_attempt_at",
        "lease_until",
        "created_at",
        "updated_at",
    ):
        if field in document:
            summary[field] = _datetime_value(document[field])
    if "channel" in document:
        channel = document["channel"]
        if isinstance(channel, str) and channel in SUPPORTED_OUTBOX_CHANNELS:
            summary["channel"] = channel
        elif _identity(channel):
            summary["channel"] = _UNKNOWN_VALUE
        else:
            summary["channel"] = _INVALID_VALUE
    for field in ("recipient", "lease_owner", "lease_token", "last_error"):
        if field in document:
            summary[field] = _text_shape(document[field])
    if "payload" in document:
        payload = document["payload"]
        summary["payload"] = {} if isinstance(payload, dict) else None
        if isinstance(payload, dict) and any(
            field in OUTBOX_PAYLOAD_ALLOWED_FIELDS and not isinstance(value, str)
            for field, value in payload.items()
        ):
            summary[_INVALID_OUTBOX_PAYLOAD_FIELD] = True
    return summary


def _admin_log_summary(document: dict) -> dict:
    summary = {_REPORT_FIELD_NAMES: frozenset(document)}
    if "id" in document:
        summary["id"] = _identity_value(document["id"])
    if "recipient_count" in document:
        summary["recipient_count"] = _integer_value(document["recipient_count"])
    if "created_at" in document:
        summary["created_at"] = _datetime_value(document["created_at"])
    for field in (
        "sent_by",
        "target",
        "user_id",
        "segment",
        "delivery_status",
        "subject",
        "message",
    ):
        if field in document:
            summary[field] = _text_shape(document[field])
    return summary


def _admin_log_type_issues(document: dict) -> set[str]:
    issues = set()
    for field in ("target", "delivery_status"):
        if field in _document_fields(document) and not _identity(document.get(field)):
            issues.add(f"invalid_admin_log_{field}")
    for field in ("user_id", "segment", "subject", "message"):
        value = document.get(field)
        if (
            field in _document_fields(document)
            and value is not None
            and not isinstance(value, str)
        ):
            issues.add(f"invalid_admin_log_{field}")
    return issues


def _privacy_issue(collection_name: str, document: dict) -> str | None:
    exempt_root_names = (
        frozenset({"lease_token"})
        if collection_name == "notification_outbox"
        else frozenset()
    )
    security_found, security_depth_exceeded = _scan_named_fields(
        document,
        PROHIBITED_SECURITY_FIELDS,
        compound_match=True,
        require_nonempty=False,
        exempt_root_names=exempt_root_names,
    )
    if security_found:
        return "prohibited_security_field"
    if security_depth_exceeded:
        return "nested_structure_depth_exceeded"
    if collection_name == "admin_notification_log":
        contact_found, contact_depth_exceeded = _scan_named_fields(
            document,
            ADMIN_LOG_CONTENT_OR_CONTACT_FIELDS,
            compound_match=True,
            require_nonempty=True,
            exempt_root_names=frozenset({"recipient_count"}),
        )
        if contact_found:
            return "admin_log_privacy_boundary"
        if contact_depth_exceeded:
            return "nested_structure_depth_exceeded"
    return None


SUMMARY_BUILDERS = {
    "notifications": _notification_summary,
    "notification_outbox": _outbox_summary,
    "admin_notification_log": _admin_log_summary,
}


def _target_has_forbidden_marker(value: str) -> bool:
    normalized = value.lower()
    if any(marker in normalized for marker in ("production", "shared", "staging")):
        return True
    tokens = {token for token in re.split(r"[^a-z0-9]+", normalized) if token}
    return bool(tokens & {"prod", "stage"})


def _client_nodes(database) -> list[str]:
    client = getattr(database, "client", None)
    nodes = getattr(client, "nodes", None) or ()
    normalized = sorted(f"{host}:{port}" for host, port in nodes)
    if normalized:
        return normalized
    address = getattr(client, "address", None)
    if isinstance(address, tuple) and len(address) == 2:
        return [f"{address[0]}:{address[1]}"]
    return []


def _target_fingerprint(database, database_name: str) -> str:
    nodes = _client_nodes(database)
    if not nodes:
        raise ReportTargetError("target_identity_unavailable")
    options = getattr(getattr(database, "client", None), "options", None)
    replica_set = getattr(options, "replica_set_name", None)
    canonical = json.dumps(
        {
            "database": database_name,
            "nodes": nodes,
            "replica_set": replica_set,
        },
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def build_representative_fingerprint(
    topology_fingerprint: str,
    *,
    dataset_id: str,
    snapshot_id: str,
    manifest_id: str,
    snapshot_fingerprint: str,
) -> str:
    canonical = json.dumps(
        {
            "topology_fingerprint": topology_fingerprint,
            "dataset_id": dataset_id,
            "snapshot_id": snapshot_id,
            "manifest_id": manifest_id,
            "snapshot_fingerprint": snapshot_fingerprint,
        },
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def _approval_fingerprint(approval: RepresentativeEvidenceApproval) -> str:
    canonical = json.dumps(
        {
            "dataset_id": approval.dataset_id,
            "snapshot_id": approval.snapshot_id,
            "manifest_id": approval.manifest_id,
            "read_only_credential_reference": approval.read_only_credential_reference,
            "custody_owner": approval.custody_owner,
            "reviewer": approval.reviewer,
            "execution_window_start": approval.execution_window_start.isoformat(),
            "execution_window_end": approval.execution_window_end.isoformat(),
            "evidence_location": approval.evidence_location,
            "retention_policy": approval.retention_policy,
        },
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def _validate_approval(approval: Any) -> RepresentativeEvidenceApproval:
    if not isinstance(approval, RepresentativeEvidenceApproval):
        raise ReportTargetError("representative_evidence_approval_required")
    text_fields = (
        approval.dataset_id,
        approval.snapshot_id,
        approval.manifest_id,
        approval.read_only_credential_reference,
        approval.custody_owner,
        approval.reviewer,
        approval.evidence_location,
        approval.retention_policy,
    )
    if (
        not all(_identity(value) for value in text_fields)
        or any(_is_placeholder_metadata(value) for value in text_fields)
        or not isinstance(approval.expected_fingerprint, str)
        or not FINGERPRINT_PATTERN.fullmatch(approval.expected_fingerprint)
        or not isinstance(approval.execution_window_start, datetime)
        or approval.execution_window_start.tzinfo is None
        or approval.execution_window_start.utcoffset() is None
        or not isinstance(approval.execution_window_end, datetime)
        or approval.execution_window_end.tzinfo is None
        or approval.execution_window_end.utcoffset() is None
        or approval.execution_window_start >= approval.execution_window_end
        or approval.custody_owner.strip().casefold()
        == approval.reviewer.strip().casefold()
    ):
        raise ReportTargetError("representative_evidence_manifest_invalid")
    return approval


def _is_placeholder_metadata(value: str) -> bool:
    normalized = value.strip().casefold()
    return normalized in PLACEHOLDER_METADATA_VALUES or (
        normalized.startswith("<") and normalized.endswith(">")
    )


def _manifest_datetime(value: Any) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        return None
    return parsed


def load_representative_evidence_manifest(
    path: str | None,
) -> RepresentativeEvidenceApproval:
    if not _identity(path):
        raise ReportTargetError("representative_evidence_approval_required")
    try:
        with open(path, encoding="utf-8") as manifest_file:
            manifest = json.load(manifest_file)
    except (OSError, ValueError, TypeError):
        raise ReportTargetError("representative_evidence_manifest_invalid") from None
    required = {
        "dataset_id",
        "snapshot_id",
        "manifest_id",
        "expected_fingerprint",
        "read_only_credential_reference",
        "custody_owner",
        "reviewer",
        "execution_window",
        "evidence_location",
        "retention_policy",
    }
    if not isinstance(manifest, dict) or set(manifest) != required:
        raise ReportTargetError("representative_evidence_manifest_invalid")
    window = manifest["execution_window"]
    if not isinstance(window, dict) or set(window) != {"starts_at", "ends_at"}:
        raise ReportTargetError("representative_evidence_manifest_invalid")
    text_fields = required - {"execution_window", "expected_fingerprint"}
    if not all(_identity(manifest[field]) for field in text_fields):
        raise ReportTargetError("representative_evidence_manifest_invalid")
    if any(_is_placeholder_metadata(manifest[field]) for field in text_fields):
        raise ReportTargetError("representative_evidence_manifest_invalid")
    expected = manifest["expected_fingerprint"]
    start = _manifest_datetime(window["starts_at"])
    end = _manifest_datetime(window["ends_at"])
    if (
        not isinstance(expected, str)
        or not FINGERPRINT_PATTERN.fullmatch(expected)
        or start is None
        or end is None
        or start >= end
        or manifest["custody_owner"].strip().casefold()
        == manifest["reviewer"].strip().casefold()
    ):
        raise ReportTargetError("representative_evidence_manifest_invalid")
    return RepresentativeEvidenceApproval(
        dataset_id=manifest["dataset_id"],
        snapshot_id=manifest["snapshot_id"],
        manifest_id=manifest["manifest_id"],
        expected_fingerprint=expected,
        read_only_credential_reference=manifest["read_only_credential_reference"],
        custody_owner=manifest["custody_owner"],
        reviewer=manifest["reviewer"],
        execution_window_start=start,
        execution_window_end=end,
        evidence_location=manifest["evidence_location"],
        retention_policy=manifest["retention_policy"],
    )


async def _read_snapshot_marker(
    database, approval: RepresentativeEvidenceApproval
) -> str:
    collection = getattr(database, "notification_report_evidence_manifest", None)
    if collection is None:
        raise ReportTargetError("representative_snapshot_identity_unavailable")
    cursor = collection.find(
        {"manifest_id": approval.manifest_id},
        {
            "_id": 0,
            "dataset_id": 1,
            "snapshot_id": 1,
            "manifest_id": 1,
            "snapshot_fingerprint": 1,
        },
    )
    if hasattr(cursor, "limit"):
        cursor = cursor.limit(2)
    markers = []
    async for marker in cursor:
        markers.append(dict(marker))
    if len(markers) != 1:
        raise ReportTargetError("representative_snapshot_identity_mismatch")
    marker = markers[0]
    snapshot_fingerprint = marker.get("snapshot_fingerprint")
    if (
        marker.get("dataset_id") != approval.dataset_id
        or marker.get("snapshot_id") != approval.snapshot_id
        or marker.get("manifest_id") != approval.manifest_id
        or not isinstance(snapshot_fingerprint, str)
        or not FINGERPRINT_PATTERN.fullmatch(snapshot_fingerprint)
    ):
        raise ReportTargetError("representative_snapshot_identity_mismatch")
    return snapshot_fingerprint


async def inspect_report_target(
    database,
    *,
    target_label: str,
    expected_database_name: str,
) -> InspectedReportTarget:
    """Inspect an explicitly isolated target without authorizing a scan.

    Only the built-in ``read`` role scoped to the exact target database is
    accepted. Broader or additional roles fail closed even when they are
    nominally read-only, preserving least privilege for sensitive data.
    """
    if (
        not isinstance(target_label, str)
        or not TARGET_LABEL_PATTERN.fullmatch(target_label)
        or _target_has_forbidden_marker(target_label)
    ):
        raise ReportTargetError("unsafe_target_label")
    if (
        not _identity(expected_database_name)
        or _target_has_forbidden_marker(expected_database_name)
        or getattr(database, "name", None) != expected_database_name
    ):
        raise ReportTargetError("unsafe_database_identity")

    status = await database.command({"connectionStatus": 1})
    roles = status.get("authInfo", {}).get("authenticatedUserRoles", [])
    normalized_roles = {
        (role.get("role"), role.get("db")) for role in roles if isinstance(role, dict)
    }
    if normalized_roles != {("read", expected_database_name)}:
        raise ReportTargetError("read_only_role_not_verified")

    actual_fingerprint = _target_fingerprint(database, expected_database_name)
    return InspectedReportTarget(
        label=target_label,
        database_name=expected_database_name,
        topology_fingerprint=actual_fingerprint,
    )


async def verify_report_target(
    database,
    *,
    target_label: str,
    expected_database_name: str,
    approval: RepresentativeEvidenceApproval,
    now: datetime | None = None,
) -> VerifiedReportTarget:
    """Bind an independently approved fingerprint to the current database."""
    approval = _validate_approval(approval)
    moment = now or datetime.now(timezone.utc)
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    if not approval.execution_window_start <= moment <= approval.execution_window_end:
        raise ReportTargetError("representative_execution_window_inactive")
    inspected = await inspect_report_target(
        database,
        target_label=target_label,
        expected_database_name=expected_database_name,
    )
    snapshot_fingerprint = await _read_snapshot_marker(database, approval)
    actual_fingerprint = build_representative_fingerprint(
        inspected.topology_fingerprint,
        dataset_id=approval.dataset_id,
        snapshot_id=approval.snapshot_id,
        manifest_id=approval.manifest_id,
        snapshot_fingerprint=snapshot_fingerprint,
    )
    if actual_fingerprint != approval.expected_fingerprint:
        raise ReportTargetError("target_fingerprint_mismatch")
    return VerifiedReportTarget(
        label=inspected.label,
        database_name=inspected.database_name,
        fingerprint=actual_fingerprint,
        approval_fingerprint=_approval_fingerprint(approval),
        _proof=_VERIFIED_TARGET_PROOF,
        _database=database,
        _approval=approval,
    )


async def _read_documents(
    database, collection_name: str
) -> tuple[list[dict], bool, str | None, int]:
    collection = getattr(database, collection_name)
    cursor = collection.find({}, {"_id": 0})
    if hasattr(cursor, "limit"):
        cursor = cursor.limit(SCAN_LIMIT + 1)
    documents: list[dict] = []
    scanned = 0
    async for raw_document in cursor:
        scanned += 1
        if scanned > SCAN_LIMIT:
            return documents, True, None, scanned
        document = dict(raw_document)
        privacy_issue = _privacy_issue(collection_name, document)
        if privacy_issue:
            return documents, False, privacy_issue, scanned
        summary = SUMMARY_BUILDERS[collection_name](document)
        presence_signature, type_signature, unknown_signature = _document_signatures(
            collection_name, document
        )
        summary[_FIELD_PRESENCE_SIGNATURE] = presence_signature
        summary[_FIELD_TYPE_SIGNATURE] = type_signature
        if unknown_signature:
            summary[_UNKNOWN_FIELD_SIGNATURE] = unknown_signature
        documents.append(summary)
    return documents, False, None, scanned


def _signature_counts(documents: list[dict], field: str) -> dict[str, int]:
    counts = Counter(document[field] for document in documents if document.get(field))
    return dict(sorted(counts.items()))


def _record_unknown_field_issues(
    documents: list[dict], issues: Counter[str]
) -> dict[str, int]:
    counts = _signature_counts(documents, _UNKNOWN_FIELD_SIGNATURE)
    if counts:
        issues["unknown_field_signature"] += sum(counts.values())
    return counts


def _add_retention_count(
    result: Counter, timestamp: datetime | None, *, cutoff: datetime
) -> None:
    if timestamp is not None and timestamp <= cutoff:
        result["expired"] += 1


def _base_report(target: VerifiedReportTarget, moment: datetime) -> dict:
    return {
        "report_version": REPORT_VERSION,
        "report_time": moment.isoformat(),
        "target": {
            "label": target.label,
            "database": target.database_name,
            "fingerprint": target.fingerprint,
            "approval_fingerprint": target.approval_fingerprint,
            "read_only_role_verified": True,
        },
    }


def _finish_report(
    target: VerifiedReportTarget,
    moment: datetime,
    collections: dict[str, dict],
    issues: Counter[str],
) -> dict:
    return {
        **_base_report(target, moment),
        "disposition": "blocked_ambiguity" if issues else "ready_for_review",
        "collections": collections,
        "issues": dict(sorted(issues.items())),
    }


def _notification_type_issues(document: dict) -> set[str]:
    issues = set()
    fields = _document_fields(document)
    for field in CANONICAL_NOTIFICATION_FIELDS - {"schema_version"}:
        if field not in fields:
            issues.add(f"missing_notification_{field}")
    for field in ("id", "user_id", "event", "title", "body", "deduplication_key"):
        if not _identity(document.get(field)):
            issues.add(f"invalid_notification_{field}")
    schema_version = document.get("schema_version")
    if (
        "schema_version" not in fields
        or type(schema_version) is not int
        or schema_version not in SUPPORTED_NOTIFICATION_SCHEMA_VERSIONS
    ):
        issues.add("unknown_notification_schema_version")
    occurrence_count = document.get("occurrence_count")
    if (
        not isinstance(occurrence_count, int)
        or isinstance(occurrence_count, bool)
        or occurrence_count < 1
    ):
        issues.add("invalid_notification_occurrence_count")
    if (
        document.get("read_at") is not None
        and _as_datetime(document.get("read_at")) is None
    ):
        issues.add("invalid_notification_read_at")
    for field in ("created_at", "last_seen_at", "updated_at"):
        if _as_datetime(document.get(field)) is None:
            issues.add(f"invalid_notification_{field}")
    expires_at = _as_datetime(document.get("expires_at"))
    created_at = _as_datetime(document.get("created_at"))
    if "expires_at" in fields and expires_at is None:
        issues.add("invalid_notification_expires_at")
    elif (
        "expires_at" in fields
        and created_at is not None
        and expires_at != created_at + NOTIFICATION_RETENTION
    ):
        issues.add("invalid_notification_expiry_boundary")
    return issues


def _outbox_state_issue(document: dict) -> str | None:
    if not OUTBOX_REQUIRED_FIELDS.issubset(_document_fields(document)):
        return "invalid_delivery_state"
    status = document.get("status")
    attempts = document.get("attempts")
    if status not in VALID_OUTBOX_STATES:
        return "unknown_outbox_state"
    if (
        not isinstance(attempts, int)
        or isinstance(attempts, bool)
        or attempts < 0
        or attempts > MAX_DELIVERY_ATTEMPTS
    ):
        return "invalid_delivery_state"
    channel = document.get("channel")
    if channel is _UNKNOWN_VALUE:
        return "unknown_outbox_channel"
    if channel not in SUPPORTED_OUTBOX_CHANNELS:
        return "invalid_outbox_channel"
    last_error = document.get("last_error")
    if last_error is not None and not _identity(last_error):
        return "invalid_outbox_last_error"
    if status == "delivered" and last_error is not None:
        return "invalid_outbox_last_error"
    lease_values = tuple(
        document.get(field) for field in ("lease_owner", "lease_token", "lease_until")
    )
    if status == "processing":
        valid = (
            attempts < MAX_DELIVERY_ATTEMPTS
            and _identity(lease_values[0])
            and _identity(lease_values[1])
            and _as_datetime(lease_values[2]) is not None
            and _as_datetime(document.get("next_attempt_at")) is not None
        )
        return None if valid else "invalid_delivery_state"
    if any(value is not None for value in lease_values):
        return "invalid_delivery_state"
    if status == "pending":
        valid = (
            attempts < MAX_DELIVERY_ATTEMPTS
            and _as_datetime(document.get("next_attempt_at")) is not None
        )
        return None if valid else "invalid_delivery_state"
    if document.get("next_attempt_at") is not None or attempts < 1:
        return "invalid_delivery_state"
    if status == "exhausted" and attempts != MAX_DELIVERY_ATTEMPTS:
        return "invalid_delivery_state"
    return None


async def build_notification_schema_report(
    database,
    *,
    target: VerifiedReportTarget,
    now: datetime | None = None,
) -> dict:
    """Return only aggregate preflight evidence; never writes or exposes records."""
    if (
        not isinstance(target, VerifiedReportTarget)
        or target._proof is not _VERIFIED_TARGET_PROOF
        or target._database is not database
    ):
        raise ReportTargetError("target_not_verified")
    target = await verify_report_target(
        database,
        target_label=target.label,
        expected_database_name=target.database_name,
        approval=target._approval,
        now=now,
    )
    moment = now or datetime.now(timezone.utc)
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=timezone.utc)
    issues: Counter[str] = Counter()
    collections: dict[str, dict] = {}

    (
        notifications,
        notification_truncated,
        notification_privacy_issue,
        notification_scanned,
    ) = await _read_documents(database, "notifications")
    if notification_privacy_issue:
        issues[notification_privacy_issue] = 1
        collections["notifications"] = {"scanned_before_stop": notification_scanned}
        return _finish_report(target, moment, collections, issues)

    notification_shapes = Counter(
        _notification_shape(document) for document in notifications
    )
    notification_unknown_signatures = _record_unknown_field_issues(
        notifications, issues
    )
    notification_retention: Counter[str] = Counter()
    notification_type_issues: Counter[str] = Counter()
    notification_ids: set[str] = set()
    reference_documents: list[dict] = []
    admin_notification_links: Counter[str] = Counter()
    for document in notifications:
        shape = _notification_shape(document)
        modern_fields_present = MODERN_NOTIFICATION_FIELDS.issubset(
            _document_fields(document)
        )
        if not _identity(document.get("id")):
            issues["missing_notification_id"] += 1
        else:
            notification_ids.add(document["id"])
        if shape == "legacy_candidate":
            issues["legacy_notification_shape"] += 1
        elif shape == "mixed_or_unknown":
            issues["mixed_or_unknown_notification_shape"] += 1
        if modern_fields_present:
            document_type_issues = _notification_type_issues(document)
            for issue in document_type_issues:
                issues[issue] += 1
                notification_type_issues[issue] += 1
            if any(
                issue
                in {
                    "invalid_notification_created_at",
                    "invalid_notification_last_seen_at",
                    "invalid_notification_updated_at",
                }
                for issue in document_type_issues
            ):
                issues["invalid_notification_timestamp"] += 1
            _add_retention_count(
                notification_retention,
                _as_datetime(document.get("created_at")),
                cutoff=moment - NOTIFICATION_RETENTION,
            )
            event = document.get("event")
            if _identity(event) and event.startswith("admin.message."):
                admin_notification_links[event.removeprefix("admin.message.")] += 1
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
        "type_issue_counts": dict(sorted(notification_type_issues.items())),
        "field_presence_signature_counts": _signature_counts(
            notifications, _FIELD_PRESENCE_SIGNATURE
        ),
        "field_type_signature_counts": _signature_counts(
            notifications, _FIELD_TYPE_SIGNATURE
        ),
        "unknown_field_signature_counts": notification_unknown_signatures,
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
        if not _identity(reference_id):
            if reference_type != "restock_alert":
                issues["missing_notification_reference_id"] += 1
            continue
        target_document = await getattr(database, collection_name).find_one(
            {"id": reference_id}, {"_id": 1}
        )
        if target_document is None:
            issues["orphan_notification_reference"] += 1

    (
        outbox,
        outbox_truncated,
        outbox_privacy_issue,
        outbox_scanned,
    ) = await _read_documents(database, "notification_outbox")
    if outbox_privacy_issue:
        issues[outbox_privacy_issue] = 1
        collections["notification_outbox"] = {"scanned_before_stop": outbox_scanned}
        return _finish_report(target, moment, collections, issues)

    outbox_shapes: Counter[str] = Counter()
    outbox_retention: Counter[str] = Counter()
    outbox_type_issues: Counter[str] = Counter()
    outbox_unknown_signatures = _record_unknown_field_issues(outbox, issues)
    for document in outbox:
        if OUTBOX_REQUIRED_FIELDS.issubset(_document_fields(document)):
            outbox_shapes["modern_candidate"] += 1
        elif {"id", "notification_id"}.issubset(_document_fields(document)):
            outbox_shapes["missing_runtime_fields"] += 1
            issues["missing_outbox_runtime_fields"] += 1
        else:
            outbox_shapes["mixed_or_unknown"] += 1
            issues["mixed_or_unknown_outbox_shape"] += 1
        for field in ("id", "notification_id", "recipient", "delivery_key"):
            if not _identity(document.get(field)):
                issue = f"invalid_outbox_{field}"
                issues[issue] += 1
                outbox_type_issues[issue] += 1
        if not isinstance(document.get("payload"), dict):
            issues["invalid_outbox_payload"] += 1
            outbox_type_issues["invalid_outbox_payload"] += 1
        elif document.get(_INVALID_OUTBOX_PAYLOAD_FIELD):
            issues["invalid_outbox_payload_field"] += 1
            outbox_type_issues["invalid_outbox_payload_field"] += 1
        notification_id = document.get("notification_id")
        if _identity(notification_id) and notification_id not in notification_ids:
            issues["orphan_outbox"] += 1
        created_at = _as_datetime(document.get("created_at"))
        updated_at = _as_datetime(document.get("updated_at"))
        if created_at is None or updated_at is None or created_at > updated_at:
            issues["invalid_outbox_timestamp"] += 1
            outbox_type_issues["invalid_outbox_timestamp"] += 1
        state_issue = _outbox_state_issue(document)
        if state_issue:
            issues[state_issue] += 1
            outbox_type_issues[state_issue] += 1
        if document.get("status") in {"delivered", "exhausted"}:
            _add_retention_count(
                outbox_retention,
                updated_at,
                cutoff=moment - TERMINAL_DELIVERY_RETENTION,
            )
    duplicate_outbox_ids = _duplicate_groups(
        [document.get("id") for document in outbox]
    )
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
        "type_issue_counts": dict(sorted(outbox_type_issues.items())),
        "field_presence_signature_counts": _signature_counts(
            outbox, _FIELD_PRESENCE_SIGNATURE
        ),
        "field_type_signature_counts": _signature_counts(outbox, _FIELD_TYPE_SIGNATURE),
        "unknown_field_signature_counts": outbox_unknown_signatures,
    }

    logs, logs_truncated, log_privacy_issue, logs_scanned = await _read_documents(
        database, "admin_notification_log"
    )
    if log_privacy_issue:
        issues[log_privacy_issue] = 1
        collections["admin_notification_log"] = {"scanned_before_stop": logs_scanned}
        return _finish_report(target, moment, collections, issues)

    log_shapes: Counter[str] = Counter()
    log_retention: Counter[str] = Counter()
    log_type_issues: Counter[str] = Counter()
    log_unknown_signatures = _record_unknown_field_issues(logs, issues)
    for document in logs:
        if ADMIN_LOG_REQUIRED_FIELDS.issubset(_document_fields(document)):
            log_shapes["metadata_candidate"] += 1
        else:
            log_shapes["mixed_or_unknown"] += 1
            issues["mixed_or_unknown_admin_log_shape"] += 1
        for issue in _admin_log_type_issues(document):
            issues[issue] += 1
            log_type_issues[issue] += 1
        if not _identity(document.get("id")):
            issues["invalid_admin_log_id"] += 1
            log_type_issues["invalid_admin_log_id"] += 1
        if not _identity(document.get("sent_by")):
            issues["invalid_admin_log_actor"] += 1
            log_type_issues["invalid_admin_log_actor"] += 1
        recipient_count = document.get("recipient_count")
        if (
            not isinstance(recipient_count, int)
            or isinstance(recipient_count, bool)
            or recipient_count < 0
        ):
            issues["invalid_admin_log_recipient_count"] += 1
            log_type_issues["invalid_admin_log_recipient_count"] += 1
        created_at = _as_datetime(document.get("created_at"))
        if created_at is None:
            issues["invalid_admin_log_timestamp"] += 1
            log_type_issues["invalid_admin_log_timestamp"] += 1
        _add_retention_count(
            log_retention, created_at, cutoff=moment - NOTIFICATION_RETENTION
        )
        log_id = document.get("id")
        if (
            _identity(log_id)
            and isinstance(recipient_count, int)
            and recipient_count > 0
            and not admin_notification_links[log_id]
        ):
            issues["unlinked_admin_log"] += 1
        if (
            _identity(log_id)
            and isinstance(recipient_count, int)
            and recipient_count >= 0
            and admin_notification_links[log_id] != recipient_count
        ):
            issues["admin_log_notification_count_mismatch"] += 1
    duplicate_log_ids = _duplicate_groups([document.get("id") for document in logs])
    if duplicate_log_ids:
        issues["duplicate_admin_log_id"] += duplicate_log_ids
    if logs_truncated:
        issues["admin_log_scan_limit_exceeded"] += 1
    collections["admin_notification_log"] = {
        "total": len(logs),
        "shape_counts": dict(sorted(log_shapes.items())),
        "retention_counts": dict(sorted(log_retention.items())),
        "type_issue_counts": dict(sorted(log_type_issues.items())),
        "field_presence_signature_counts": _signature_counts(
            logs, _FIELD_PRESENCE_SIGNATURE
        ),
        "field_type_signature_counts": _signature_counts(logs, _FIELD_TYPE_SIGNATURE),
        "unknown_field_signature_counts": log_unknown_signatures,
    }

    return _finish_report(target, moment, collections, issues)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Inspect or run the isolated read-only notification schema report."
    )
    parser.add_argument("--database", required=True)
    parser.add_argument("--target-label", required=True)
    parser.add_argument(
        "--confirm-isolated-target",
        required=True,
        help="Must exactly repeat --target-label.",
    )
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument(
        "--inspect-target",
        action="store_true",
        help="Verify role/identity and print only the fingerprint; do not scan collections.",
    )
    mode.add_argument(
        "--evidence-manifest",
        help="Path to the approved representative-evidence JSON manifest.",
    )
    return parser


async def execute_report_command(
    database, args: argparse.Namespace
) -> tuple[dict, int]:
    """Execute the supported operational entry point with stable safe failures."""
    if args.confirm_isolated_target != args.target_label:
        return {
            "report_version": REPORT_VERSION,
            "disposition": "blocked_ambiguity",
            "collections": {},
            "issues": {"isolated_target_confirmation_mismatch": 1},
        }, 2
    try:
        if args.inspect_target:
            inspected = await inspect_report_target(
                database,
                target_label=args.target_label,
                expected_database_name=args.database,
            )
        else:
            approval = load_representative_evidence_manifest(args.evidence_manifest)
            target = await verify_report_target(
                database,
                target_label=args.target_label,
                expected_database_name=args.database,
                approval=approval,
            )
    except ReportTargetError as exc:
        return {
            "report_version": REPORT_VERSION,
            "disposition": "blocked_ambiguity",
            "collections": {},
            "issues": {exc.code: 1},
        }, 2
    except Exception:
        return {
            "report_version": REPORT_VERSION,
            "disposition": "blocked_ambiguity",
            "collections": {},
            "issues": {"target_verification_unavailable": 1},
        }, 4

    if args.inspect_target:
        return {
            "report_version": REPORT_VERSION,
            "disposition": "target_inspection_only",
            "target": {
                "label": inspected.label,
                "database": inspected.database_name,
                "topology_fingerprint": inspected.topology_fingerprint,
                "read_only_role_verified": True,
            },
            "collections_read": 0,
        }, 0
    try:
        report = await build_notification_schema_report(database, target=target)
        return report, 0 if report["disposition"] == "ready_for_review" else 3
    except ReportTargetError as exc:
        return {
            "report_version": REPORT_VERSION,
            "disposition": "blocked_ambiguity",
            "collections": {},
            "issues": {exc.code: 1},
        }, 2
    except Exception:
        return {
            "report_version": REPORT_VERSION,
            "disposition": "blocked_ambiguity",
            "collections": {},
            "issues": {"report_execution_unavailable": 1},
        }, 4


async def _main(args: argparse.Namespace) -> int:
    mongo_url = os.environ.get("NOTIFICATION_REPORT_MONGO_URL")
    if not mongo_url:
        print(
            json.dumps(
                {
                    "report_version": REPORT_VERSION,
                    "disposition": "blocked_ambiguity",
                    "collections": {},
                    "issues": {"report_credential_unavailable": 1},
                },
                sort_keys=True,
            )
        )
        return 2

    from motor.motor_asyncio import AsyncIOMotorClient

    client = AsyncIOMotorClient(
        mongo_url,
        serverSelectionTimeoutMS=5_000,
        connectTimeoutMS=5_000,
    )
    try:
        database = client[args.database]
        output, return_code = await execute_report_command(database, args)
        print(json.dumps(output, indent=2, sort_keys=True))
        return return_code
    finally:
        client.close()


if __name__ == "__main__":
    raise SystemExit(asyncio.run(_main(build_parser().parse_args())))
