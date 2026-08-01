"""System notification rules: where a notification may point, and when it repeats.

The bell is a feed of things the system did. Two properties matter most here.

A deep link is *derived* from an allowlisted reference, never taken from the
caller. A stored link would let whoever writes a notification choose where a
reader lands, including somewhere off-site, and every reader would follow it.

A deduplication key makes repetition idempotent. The same condition observed
twice is one notification with a later timestamp, not two identical rows the
reader has to dismiss one at a time.
"""

import hashlib
import re
from datetime import datetime, timedelta, timezone
from typing import Any

NOTIFICATION_SCHEMA_VERSION = 1
NOTIFICATION_OUTBOX_SCHEMA_VERSION = 1
NOTIFICATION_RETENTION = timedelta(days=180)
REFERENCE_ID_PATTERN = re.compile(r"[A-Za-z0-9._-]{1,200}\Z")

# Every reference a notification may point at, and the admin route that shows
# it. A reference type absent from this table yields no link at all: an
# unlinked notification is a smaller failure than one pointing anywhere.
NOTIFICATION_REFERENCE_ROUTES = {
    "inquiry": "/admin/inquiries/{id}",
    "b2b_quote": "/admin/b2b/quotes/{id}",
    "b2b_project": "/admin/b2b/projects/{id}",
    "work_order": "/admin/b2b/work-orders/{id}",
    "retail_order": "/admin/retail-orders/{id}",
    "restock_alert": "/admin/restock-alerts",
    "material": "/admin/stock-movements?subject_type=material&subject_id={id}",
    "product_variant": (
        "/admin/stock-movements?subject_type=product_variant&subject_id={id}"
    ),
}

NOTIFICATION_STATUSES = ("unread", "read")

CANONICAL_NOTIFICATION_FIELDS = frozenset(
    {
        "schema_version",
        "id",
        "user_id",
        "event",
        "title",
        "body",
        "reference_type",
        "reference_id",
        "deduplication_key",
        "read_at",
        "occurrence_count",
        "created_at",
        "last_seen_at",
        "updated_at",
        "expires_at",
    }
)

PUBLIC_NOTIFICATION_FIELDS = frozenset(
    {
        "schema_version",
        "id",
        "event",
        "title",
        "body",
        "reference_type",
        "reference_id",
        "occurrence_count",
        "created_at",
        "last_seen_at",
        "updated_at",
        "expires_at",
    }
)

_VERSIONLESS_MODERN_REQUIRED_FIELDS = frozenset(
    {
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
)
_VERSIONLESS_MODERN_ALLOWED_FIELDS = _VERSIONLESS_MODERN_REQUIRED_FIELDS | {
    "_id",
    "reference_type",
    "reference_id",
    "deep_link",
    "link",
    "url",
}
_LEGACY_EMAIL_FIELDS = frozenset({"to_email", "subject", "body_html", "read"})


def as_utc_datetime(value: Any) -> datetime | None:
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _identity(value: Any, *, maximum: int) -> bool:
    return isinstance(value, str) and bool(value.strip()) and len(value) <= maximum


def _valid_identity_fields(document: dict) -> bool:
    limits = {
        "id": 200,
        "user_id": 200,
        "event": 200,
        "title": 300,
        "body": 5000,
        "deduplication_key": 64,
    }
    if not all(
        _identity(document.get(field), maximum=maximum)
        for field, maximum in limits.items()
    ):
        return False
    if any(
        "|" in document[field]
        or any(
            ord(character) < 32 or ord(character) == 127
            for character in document[field]
        )
        for field in ("id", "user_id", "event")
    ):
        return False
    return document["deduplication_key"] == deduplication_key(
        user_id=document["user_id"],
        event=document["event"],
        reference_type=document.get("reference_type"),
        reference_id=document.get("reference_id"),
    )


def _valid_reference(document: dict) -> bool:
    reference_type = document.get("reference_type")
    reference_id = document.get("reference_id")
    if reference_type is None:
        return reference_id is None
    if not is_allowlisted_reference(reference_type):
        return False
    if reference_id is not None and (
        not isinstance(reference_id, str)
        or REFERENCE_ID_PATTERN.fullmatch(reference_id.strip()) is None
    ):
        return False
    template = NOTIFICATION_REFERENCE_ROUTES[reference_type]
    if "{id}" in template:
        return deep_link_for(reference_type, reference_id) is not None
    return reference_id is None or _identity(reference_id, maximum=200)


def _canonical_shape(document: dict) -> bool:
    if type(document.get("schema_version")) is not int:
        return False
    if document.get("schema_version") != NOTIFICATION_SCHEMA_VERSION:
        return False
    if set(document) - (
        CANONICAL_NOTIFICATION_FIELDS | {"_id", "deep_link", "link", "url"}
    ):
        return False
    if not CANONICAL_NOTIFICATION_FIELDS.issubset(document):
        return False
    if not _valid_identity_fields(document):
        return False
    if (
        type(document.get("occurrence_count")) is not int
        or document["occurrence_count"] < 1
    ):
        return False
    if (
        document.get("read_at") is not None
        and as_utc_datetime(document["read_at"]) is None
    ):
        return False
    created_at = as_utc_datetime(document.get("created_at"))
    last_seen_at = as_utc_datetime(document.get("last_seen_at"))
    updated_at = as_utc_datetime(document.get("updated_at"))
    expires_at = as_utc_datetime(document.get("expires_at"))
    if None in (created_at, last_seen_at, updated_at, expires_at):
        return False
    if not (
        created_at <= last_seen_at <= updated_at < expires_at
        and expires_at == created_at + NOTIFICATION_RETENTION
    ):
        return False
    read_at = as_utc_datetime(document.get("read_at"))
    if read_at is not None and not created_at <= read_at < expires_at:
        return False
    return _valid_reference(document)


def _versionless_modern_shape(document: dict) -> bool:
    if "schema_version" in document or set(document) & _LEGACY_EMAIL_FIELDS:
        return False
    if set(document) - _VERSIONLESS_MODERN_ALLOWED_FIELDS:
        return False
    if not _VERSIONLESS_MODERN_REQUIRED_FIELDS.issubset(document):
        return False
    if not _valid_identity_fields(document):
        return False
    if (
        type(document.get("occurrence_count")) is not int
        or document["occurrence_count"] < 1
    ):
        return False
    if (
        document.get("read_at") is not None
        and as_utc_datetime(document["read_at"]) is None
    ):
        return False
    created_at = as_utc_datetime(document.get("created_at"))
    last_seen_at = as_utc_datetime(document.get("last_seen_at"))
    updated_at = as_utc_datetime(document.get("updated_at"))
    if None in (created_at, last_seen_at, updated_at):
        return False
    if not created_at <= last_seen_at <= updated_at:
        return False
    read_at = as_utc_datetime(document.get("read_at"))
    if read_at is not None and read_at < created_at:
        return False
    return _valid_reference(document)


def notification_expiry(document: dict) -> datetime | None:
    if _canonical_shape(document):
        return as_utc_datetime(document["expires_at"])
    if _versionless_modern_shape(document):
        created_at = as_utc_datetime(document["created_at"])
        return created_at + NOTIFICATION_RETENTION if created_at else None
    return None


def is_notification_readable(
    document: dict, *, user_id: str, at: datetime | None = None
) -> bool:
    if document.get("user_id") != user_id:
        return False
    expiry = notification_expiry(document)
    moment = as_utc_datetime(at) if at is not None else datetime.now(timezone.utc)
    if moment is None:
        return False
    return expiry is not None and expiry > moment


def is_allowlisted_reference(reference_type: str | None) -> bool:
    return (
        isinstance(reference_type, str)
        and reference_type in NOTIFICATION_REFERENCE_ROUTES
    )


def deep_link_for(reference_type: str | None, reference_id: str | None) -> str | None:
    """Build the in-app path for a reference, or nothing if it is not allowed."""
    if reference_type is None:
        return None
    template = NOTIFICATION_REFERENCE_ROUTES.get(reference_type)
    if template is None:
        return None
    if "{id}" not in template:
        return template
    if not isinstance(reference_id, str):
        return None
    # Only the identifier is interpolated, and only into a fixed template, so a
    # reference id cannot introduce a host, a scheme, or another path.
    safe_id = str(reference_id).strip()
    if REFERENCE_ID_PATTERN.fullmatch(safe_id) is None:
        return None
    return template.replace("{id}", safe_id)


def deduplication_key(
    *,
    user_id: str,
    event: str,
    reference_type: str | None,
    reference_id: str | None,
) -> str:
    """Identify one notifiable condition for one reader.

    Keyed on the reader too: the same condition still deserves to reach every
    person who needs to act on it.
    """
    canonical = "|".join(
        [
            str(user_id),
            str(event),
            str(reference_type or ""),
            str(reference_id or ""),
        ]
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def project_notification(document: dict) -> dict | None:
    """Present a notification with its derived link and read state.

    Any stored link is dropped rather than trusted: the link a reader follows
    is always recomputed from the reference.
    """
    canonical = _canonical_shape(document)
    compatible = _versionless_modern_shape(document)
    if not canonical and not compatible:
        return None
    value = {
        key: document[key] for key in PUBLIC_NOTIFICATION_FIELDS if key in document
    }
    if compatible:
        value["compatibility_status"] = "versionless_modern"
        value["expires_at"] = notification_expiry(document)
    value["deep_link"] = deep_link_for(
        value.get("reference_type"), value.get("reference_id")
    )
    value["is_read"] = bool(document.get("read_at"))
    return value
