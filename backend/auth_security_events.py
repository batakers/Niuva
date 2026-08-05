"""Strict, privacy-preserving authentication security-event boundary."""

from __future__ import annotations

import hashlib
import hmac
import re
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Mapping, Protocol

SCHEMA_VERSION = "1"
RETENTION = timedelta(days=90)
RETENTION_CLASS = "direct_90d"
MAX_CLEANUP_BATCH = 1_000

EVENT_TYPES = frozenset(
    {
        "auth.login_succeeded",
        "auth.login_failed",
        "auth.login_blocked",
        "auth.reset_requested",
        "auth.reset_completed",
        "auth.session_revoked",
        "auth.session_replay_detected",
        "auth.limiter_blocked",
        "auth.mfa_enrolled",
        "auth.mfa_changed",
        "auth.mfa_recovery_used",
        "auth.security_dependency_failed",
    }
)
OUTCOMES = frozenset({"success", "denied", "blocked", "failed_safe"})
REASON_CODES = frozenset(
    {
        "credentials_verified",
        "credentials_invalid",
        "account_ineligible",
        "surface_not_allowed",
        "rate_limit_exceeded",
        "session_expired",
        "session_revoked",
        "session_replay",
        "reset_processed",
        "reset_completed",
        "mfa_required",
        "mfa_invalid",
        "mfa_recovery",
        "dependency_unavailable",
        "internal_failure_safe",
    }
)
SUBJECT_KINDS = frozenset({"known_user", "unknown_identifier", "system"})
SURFACES = frozenset({"customer", "admin", "recovery", "system"})

_OPAQUE_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$")
_CORRELATION_ID = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
)


class SecurityEventValidationError(ValueError):
    """A caller attempted to cross the strict event boundary."""


class SecurityEventDependencyError(RuntimeError):
    """Required event storage or pseudonymization dependency is unavailable."""


class SecurityEventStore(Protocol):
    async def append(self, event: Mapping[str, object], *, session=None) -> None: ...

    async def delete_expired(
        self, *, before: datetime, limit: int = MAX_CLEANUP_BATCH
    ) -> int: ...


def _utc(value: datetime) -> datetime:
    if not isinstance(value, datetime) or value.tzinfo is None:
        raise SecurityEventValidationError("Event time must be timezone-aware")
    return value.astimezone(timezone.utc)


def _enum(value: str, allowed: frozenset[str], label: str) -> str:
    if not isinstance(value, str) or value not in allowed:
        raise SecurityEventValidationError(f"Unsupported {label}")
    return value


def _opaque(value: str | None, label: str, *, required: bool = False) -> str | None:
    if value is None and not required:
        return None
    if not isinstance(value, str) or not _OPAQUE_ID.fullmatch(value):
        raise SecurityEventValidationError(f"Invalid {label}")
    return value


@dataclass(frozen=True)
class EventPseudonymizer:
    key: bytes
    key_version: str

    def __post_init__(self) -> None:
        if not isinstance(self.key, bytes) or len(self.key) < 32:
            raise SecurityEventDependencyError(
                "Authentication-event pseudonymization key is unavailable"
            )
        _opaque(self.key_version, "key version", required=True)

    def digest(self, *, namespace: str, value: str) -> str:
        if namespace not in {"subject", "peer"}:
            raise SecurityEventValidationError("Unsupported pseudonym namespace")
        if not isinstance(value, str) or not value.strip():
            raise SecurityEventValidationError("Pseudonym source must be non-empty")
        normalized = value.casefold().strip()
        digest = hmac.new(
            self.key,
            f"{namespace}\0{normalized}".encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        return f"hmac-sha256:{self.key_version}:{digest}"


@dataclass(frozen=True)
class AuthenticationSecurityEvent:
    event_type: str
    outcome: str
    reason_code: str
    subject_kind: str
    surface: str
    subject_ref: str | None = None
    actor_ref: str | None = None
    session_ref: str | None = None
    peer_ref: str | None = None
    correlation_id: str | None = None
    key_version: str | None = None
    occurred_at: datetime | None = None

    def to_document(self) -> dict[str, object]:
        event_type = _enum(self.event_type, EVENT_TYPES, "event type")
        outcome = _enum(self.outcome, OUTCOMES, "outcome")
        reason_code = _enum(self.reason_code, REASON_CODES, "reason code")
        subject_kind = _enum(self.subject_kind, SUBJECT_KINDS, "subject kind")
        surface = _enum(self.surface, SURFACES, "surface")
        subject_ref = _opaque(
            self.subject_ref,
            "subject reference",
            required=subject_kind != "system",
        )
        if subject_kind == "system" and subject_ref is not None:
            raise SecurityEventValidationError(
                "System events cannot contain a subject reference"
            )
        actor_ref = _opaque(self.actor_ref, "actor reference")
        session_ref = _opaque(self.session_ref, "session reference")
        peer_ref = _opaque(self.peer_ref, "peer reference")
        correlation_id = self.correlation_id
        if correlation_id is not None and (
            not isinstance(correlation_id, str)
            or not _CORRELATION_ID.fullmatch(correlation_id)
        ):
            raise SecurityEventValidationError("Invalid correlation ID")
        key_version = _opaque(self.key_version, "key version", required=True)
        occurred_at = _utc(self.occurred_at or datetime.now(timezone.utc))
        return {
            "id": str(uuid.uuid4()),
            "schema_version": SCHEMA_VERSION,
            "event_type": event_type,
            "occurred_at": occurred_at,
            "outcome": outcome,
            "reason_code": reason_code,
            "subject_kind": subject_kind,
            "subject_ref": subject_ref,
            "actor_ref": actor_ref,
            "session_ref": session_ref,
            "surface": surface,
            "peer_ref": peer_ref,
            "correlation_id": correlation_id,
            "key_version": key_version,
            "retention_class": RETENTION_CLASS,
            "expires_at": occurred_at + RETENTION,
        }


class MongoSecurityEventStore:
    def __init__(self, collection):
        self.collection = collection

    async def append(self, event: Mapping[str, object], *, session=None) -> None:
        options = {"session": session} if session is not None else {}
        try:
            await self.collection.insert_one(dict(event), **options)
        except Exception as exc:  # normalized dependency boundary
            raise SecurityEventDependencyError(
                "Authentication security-event persistence failed"
            ) from exc

    async def delete_expired(
        self, *, before: datetime, limit: int = MAX_CLEANUP_BATCH
    ) -> int:
        if not isinstance(limit, int) or not 1 <= limit <= MAX_CLEANUP_BATCH:
            raise SecurityEventValidationError("Invalid cleanup batch limit")
        before = _utc(before)
        try:
            cursor = self.collection.find(
                {"expires_at": {"$lte": before}},
                {"_id": 1},
            ).sort("expires_at", 1).limit(limit)
            ids = [item["_id"] async for item in cursor]
            if not ids:
                return 0
            result = await self.collection.delete_many({"_id": {"$in": ids}})
            return int(result.deleted_count)
        except SecurityEventValidationError:
            raise
        except Exception as exc:
            raise SecurityEventDependencyError(
                "Authentication security-event cleanup failed"
            ) from exc


class AuthenticationSecurityEventService:
    def __init__(
        self,
        *,
        store: SecurityEventStore,
        pseudonymizer: EventPseudonymizer,
        clock=lambda: datetime.now(timezone.utc),
    ):
        self.store = store
        self.pseudonymizer = pseudonymizer
        self.clock = clock

    async def emit(
        self,
        *,
        event_type: str,
        outcome: str,
        reason_code: str,
        subject_kind: str,
        surface: str,
        known_subject_id: str | None = None,
        unknown_identifier: str | None = None,
        actor_ref: str | None = None,
        session_ref: str | None = None,
        peer_identifier: str | None = None,
        correlation_id: str | None = None,
        session=None,
    ) -> dict[str, object]:
        if subject_kind == "known_user":
            subject_ref = _opaque(
                known_subject_id, "known subject ID", required=True
            )
            if unknown_identifier is not None:
                raise SecurityEventValidationError(
                    "Known subjects cannot include an unknown identifier"
                )
        elif subject_kind == "unknown_identifier":
            if known_subject_id is not None or not unknown_identifier:
                raise SecurityEventValidationError(
                    "Unknown subjects require only an unknown identifier"
                )
            subject_ref = self.pseudonymizer.digest(
                namespace="subject", value=unknown_identifier
            )
        elif subject_kind == "system":
            if known_subject_id is not None or unknown_identifier is not None:
                raise SecurityEventValidationError(
                    "System events cannot include subject identity"
                )
            subject_ref = None
        else:
            raise SecurityEventValidationError("Unsupported subject kind")
        peer_ref = (
            self.pseudonymizer.digest(namespace="peer", value=peer_identifier)
            if peer_identifier is not None
            else None
        )
        document = AuthenticationSecurityEvent(
            event_type=event_type,
            outcome=outcome,
            reason_code=reason_code,
            subject_kind=subject_kind,
            surface=surface,
            subject_ref=subject_ref,
            actor_ref=actor_ref,
            session_ref=session_ref,
            peer_ref=peer_ref,
            correlation_id=correlation_id,
            key_version=self.pseudonymizer.key_version,
            occurred_at=self.clock(),
        ).to_document()
        await self.store.append(document, session=session)
        return document

    async def cleanup(self, *, limit: int = MAX_CLEANUP_BATCH) -> int:
        return await self.store.delete_expired(before=_utc(self.clock()), limit=limit)
