"""Provider-neutral alert outbox and cleanup orchestration for auth events."""

from __future__ import annotations

import hashlib
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Mapping, Protocol

from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

ALERT_DEDUPLICATION = timedelta(minutes=15)
ALERT_RETRY_SECONDS = (60, 300, 900, 3600)
CRITICAL_SLA_SECONDS = 15 * 60
HIGH_SLA_SECONDS = 60 * 60
CLEANUP_LEASE = timedelta(minutes=10)


class AuthSecurityOperationError(RuntimeError):
    pass


class AlertOutboxStore(Protocol):
    async def enqueue(self, alert: Mapping[str, object], *, session=None) -> bool: ...


class CleanupLease(Protocol):
    async def acquire(self, *, owner: str, now: datetime) -> bool: ...


@dataclass(frozen=True)
class AlertDecision:
    family: str
    severity: str
    threshold: int
    window_seconds: int


class AuthenticationAlertPolicy:
    _POLICIES = {
        "privileged_login_failure": AlertDecision(
            "privileged_login_failure", "high", 5, 15 * 60
        ),
        "privileged_peer_spray": AlertDecision(
            "privileged_peer_spray", "high", 20, 15 * 60
        ),
        "admin_session_replay": AlertDecision(
            "admin_session_replay", "critical", 1, 15 * 60
        ),
        "recovery_abuse": AlertDecision("recovery_abuse", "high", 3, 15 * 60),
        "mfa_recovery": AlertDecision("mfa_recovery", "medium", 1, 24 * 60 * 60),
        "mfa_recovery_repeated": AlertDecision(
            "mfa_recovery_repeated", "critical", 2, 24 * 60 * 60
        ),
        "security_dependency_failure": AlertDecision(
            "security_dependency_failure", "critical", 1, 60
        ),
        "cleanup_delayed": AlertDecision("cleanup_delayed", "high", 1, 24 * 60 * 60),
        "alert_dead_letter": AlertDecision("alert_dead_letter", "high", 1, 60),
    }

    def decision(self, family: str, *, matching_count: int) -> AlertDecision | None:
        policy = self._POLICIES.get(family)
        if policy is None:
            raise ValueError("Unsupported authentication alert family")
        if not isinstance(matching_count, int) or matching_count < 0:
            raise ValueError("Invalid alert matching count")
        return policy if matching_count >= policy.threshold else None


def build_alert_document(
    *,
    decision: AlertDecision,
    event_reference: str,
    fingerprint_source: str,
    matching_count: int,
    now: datetime,
) -> dict[str, object]:
    if now.tzinfo is None:
        raise ValueError("Alert time must be timezone-aware")
    now = now.astimezone(timezone.utc)
    if not event_reference or not fingerprint_source:
        raise ValueError("Alert references must be non-empty")
    bucket = int(now.timestamp()) // int(ALERT_DEDUPLICATION.total_seconds())
    fingerprint = hashlib.sha256(
        f"{decision.family}\0{fingerprint_source}\0{bucket}".encode("utf-8")
    ).hexdigest()
    sla_seconds = (
        CRITICAL_SLA_SECONDS
        if decision.severity == "critical"
        else HIGH_SLA_SECONDS
        if decision.severity == "high"
        else None
    )
    return {
        "id": str(uuid.uuid4()),
        "family": decision.family,
        "severity": decision.severity,
        "event_reference": event_reference,
        "matching_count": matching_count,
        "window_seconds": decision.window_seconds,
        "fingerprint": fingerprint,
        "status": "pending",
        "attempt_count": 0,
        "retry_schedule_seconds": list(ALERT_RETRY_SECONDS),
        "created_at": now,
        "next_attempt_at": now,
        "response_due_at": now + timedelta(seconds=sla_seconds)
        if sla_seconds is not None
        else None,
    }


class MongoAlertOutboxStore:
    def __init__(self, collection):
        self.collection = collection

    async def enqueue(self, alert: Mapping[str, object], *, session=None) -> bool:
        options = {"session": session} if session is not None else {}
        try:
            result = await self.collection.update_one(
                {"fingerprint": alert["fingerprint"]},
                {"$setOnInsert": dict(alert)},
                upsert=True,
                **options,
            )
            return result.upserted_id is not None
        except DuplicateKeyError:
            return False
        except Exception as exc:
            raise AuthSecurityOperationError(
                "Authentication alert outbox enqueue failed"
            ) from exc


class AuthSecurityCleanupWorker:
    def __init__(self, *, service, lease: CleanupLease, owner: str, clock):
        if not owner:
            raise ValueError("Cleanup worker owner is required")
        self.service = service
        self.lease = lease
        self.owner = owner
        self.clock = clock

    async def run_once(self) -> dict[str, object]:
        now = self.clock()
        if now.tzinfo is None:
            raise ValueError("Cleanup worker clock must be timezone-aware")
        if not await self.lease.acquire(owner=self.owner, now=now):
            return {"status": "lease_not_acquired", "deleted_count": 0}
        deleted = await self.service.cleanup()
        return {"status": "completed", "deleted_count": deleted}


class MongoCleanupLease:
    def __init__(
        self,
        collection,
        *,
        lease_id: str = "authentication_security_event_cleanup",
    ):
        self.collection = collection
        self.lease_id = lease_id

    async def acquire(self, *, owner: str, now: datetime) -> bool:
        if not owner or now.tzinfo is None:
            raise ValueError("Cleanup lease requires owner and aware time")
        now = now.astimezone(timezone.utc)
        try:
            record = await self.collection.find_one_and_update(
                {
                    "_id": self.lease_id,
                    "$or": [
                        {"lease_expires_at": {"$lte": now}},
                        {"owner": owner},
                        {"lease_expires_at": {"$exists": False}},
                    ],
                },
                {
                    "$set": {
                        "owner": owner,
                        "lease_expires_at": now + CLEANUP_LEASE,
                        "updated_at": now,
                    }
                },
                upsert=True,
                return_document=ReturnDocument.AFTER,
            )
            return bool(record and record.get("owner") == owner)
        except DuplicateKeyError:
            # Another worker owns the fixed lease document. A concurrent upsert
            # can surface as a duplicate key instead of returning no match.
            return False
        except Exception as exc:
            raise AuthSecurityOperationError(
                "Authentication cleanup lease unavailable"
            ) from exc
