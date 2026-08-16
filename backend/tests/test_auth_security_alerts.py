import asyncio
from datetime import datetime, timezone

import pytest
from auth_security_alerts import (
    ALERT_RETRY_SECONDS,
    AlertDecision,
    AuthenticationAlertPolicy,
    AuthSecurityCleanupWorker,
    AuthSecurityOperationError,
    MongoAlertOutboxStore,
    MongoCleanupLease,
    build_alert_document,
)
from pymongo.errors import DuplicateKeyError

NOW = datetime(2026, 7, 29, 12, 0, tzinfo=timezone.utc)


@pytest.mark.parametrize(
    ("family", "below", "at_threshold", "severity"),
    [
        ("privileged_login_failure", 4, 5, "high"),
        ("privileged_peer_spray", 19, 20, "high"),
        ("admin_session_replay", 0, 1, "critical"),
        ("recovery_abuse", 2, 3, "high"),
        ("mfa_recovery", 0, 1, "medium"),
        ("mfa_recovery_repeated", 1, 2, "critical"),
        ("security_dependency_failure", 0, 1, "critical"),
        ("cleanup_delayed", 0, 1, "high"),
        ("alert_dead_letter", 0, 1, "high"),
    ],
)
def test_alert_thresholds_are_deterministic(family, below, at_threshold, severity):
    policy = AuthenticationAlertPolicy()
    assert policy.decision(family, matching_count=below) is None
    decision = policy.decision(family, matching_count=at_threshold)
    assert decision.severity == severity


@pytest.mark.parametrize("matching_count", [True, False])
def test_alert_policy_rejects_boolean_matching_count(matching_count):
    with pytest.raises(ValueError, match="Invalid alert matching count"):
        AuthenticationAlertPolicy().decision(
            "admin_session_replay", matching_count=matching_count
        )


def test_alert_document_contains_references_not_event_payload():
    decision = AuthenticationAlertPolicy().decision(
        "admin_session_replay", matching_count=1
    )
    alert = build_alert_document(
        decision=decision,
        event_reference="event-1",
        fingerprint_source="session-pseudonym",
        matching_count=1,
        now=NOW,
    )
    assert alert["event_reference"] == "event-1"
    assert alert["retry_schedule_seconds"] == list(ALERT_RETRY_SECONDS)
    assert "payload" not in alert
    assert "subject_ref" not in alert
    assert "reason_code" not in alert
    assert alert["response_due_at"] > NOW


def test_alert_references_reject_raw_identifier_material():
    decision = AuthenticationAlertPolicy().decision(
        "admin_session_replay", matching_count=1
    )
    with pytest.raises(ValueError, match="fingerprint source"):
        build_alert_document(
            decision=decision,
            event_reference="event-1",
            fingerprint_source="user@example.com",
            matching_count=1,
            now=NOW,
        )


def test_alert_builder_rejects_subthreshold_alerts():
    decision = AlertDecision(
        "admin_session_replay", "critical", threshold=1, window_seconds=900
    )
    with pytest.raises(ValueError, match="threshold"):
        build_alert_document(
            decision=decision,
            event_reference="event-1",
            fingerprint_source="session-pseudonym",
            matching_count=0,
            now=NOW,
        )


@pytest.mark.parametrize(
    ("field", "value"),
    [("severity", "high"), ("window_seconds", 60)],
)
def test_alert_store_rejects_family_policy_mismatch_before_persistence(field, value):
    class Collection:
        def __init__(self):
            self.calls = 0

        async def update_one(self, *_args, **_kwargs):
            self.calls += 1
            raise AssertionError("invalid alert reached storage")

    decision = AuthenticationAlertPolicy().decision(
        "admin_session_replay", matching_count=1
    )
    alert = build_alert_document(
        decision=decision,
        event_reference="event-1",
        fingerprint_source="session-pseudonym",
        matching_count=1,
        now=NOW,
    )
    alert[field] = value
    with pytest.raises(ValueError, match="approved alert policy"):
        asyncio.run(MongoAlertOutboxStore(Collection()).enqueue(alert))


def test_alert_store_rejects_unknown_fields_before_persistence():
    class Collection:
        async def update_one(self, *_args, **_kwargs):
            raise AssertionError("invalid alert reached storage")

    decision = AuthenticationAlertPolicy().decision(
        "admin_session_replay", matching_count=1
    )
    alert = build_alert_document(
        decision=decision,
        event_reference="event-1",
        fingerprint_source="session-pseudonym",
        matching_count=1,
        now=NOW,
    )
    alert["payload"] = "secret"
    with pytest.raises(ValueError, match="allowlisted"):
        asyncio.run(MongoAlertOutboxStore(Collection()).enqueue(alert))


def test_alert_fingerprint_deduplicates_within_the_same_window():
    decision = AuthenticationAlertPolicy().decision(
        "admin_session_replay", matching_count=1
    )
    first = build_alert_document(
        decision=decision,
        event_reference="event-1",
        fingerprint_source="same",
        matching_count=1,
        now=NOW,
    )
    second = build_alert_document(
        decision=decision,
        event_reference="event-2",
        fingerprint_source="same",
        matching_count=2,
        now=NOW,
    )
    assert first["fingerprint"] == second["fingerprint"]
    assert first["id"] != second["id"]


class FailingCollection:
    async def update_one(self, *_args, **_kwargs):
        raise RuntimeError("provider body with a secret")


def test_outbox_normalizes_provider_failure():
    store = MongoAlertOutboxStore(FailingCollection())
    decision = AuthenticationAlertPolicy().decision(
        "admin_session_replay", matching_count=1
    )
    alert = build_alert_document(
        decision=decision,
        event_reference="event-1",
        fingerprint_source="session-pseudonym",
        matching_count=1,
        now=NOW,
    )
    with pytest.raises(
        AuthSecurityOperationError,
        match="Authentication alert outbox enqueue failed",
    ) as captured:
        asyncio.run(store.enqueue(alert))
    assert "provider body" not in str(captured.value)


class Lease:
    def __init__(self, acquired):
        self.acquired = acquired
        self.calls = []

    async def acquire(self, *, owner, now):
        self.calls.append((owner, now))
        return self.acquired


class CleanupService:
    def __init__(self):
        self.calls = 0

    async def cleanup(self):
        self.calls += 1
        return 7


def test_cleanup_worker_requires_lease_before_deleting():
    service = CleanupService()
    denied = AuthSecurityCleanupWorker(
        service=service,
        lease=Lease(False),
        owner="worker-1",
        clock=lambda: NOW,
    )
    assert asyncio.run(denied.run_once()) == {
        "status": "lease_not_acquired",
        "deleted_count": 0,
    }
    assert service.calls == 0

    granted = AuthSecurityCleanupWorker(
        service=service,
        lease=Lease(True),
        owner="worker-1",
        clock=lambda: NOW,
    )
    assert asyncio.run(granted.run_once()) == {
        "status": "completed",
        "deleted_count": 7,
    }
    assert service.calls == 1


class LeaseCollection:
    def __init__(self, record=None, failure=None):
        self.record = record
        self.failure = failure
        self.calls = []

    async def find_one_and_update(self, query, update, **options):
        self.calls.append((query, update, options))
        if self.failure:
            raise self.failure
        return self.record


def test_mongo_cleanup_lease_is_owner_scoped_and_normalizes_failure():
    collection = LeaseCollection({"owner": "worker-1"})
    lease = MongoCleanupLease(collection)
    assert asyncio.run(lease.acquire(owner="worker-1", now=NOW)) is True
    assert collection.calls[0][1]["$set"]["lease_expires_at"] > NOW

    unavailable = MongoCleanupLease(
        LeaseCollection(failure=RuntimeError("raw database failure"))
    )
    with pytest.raises(
        AuthSecurityOperationError,
        match="Authentication cleanup lease unavailable",
    ) as captured:
        asyncio.run(unavailable.acquire(owner="worker-1", now=NOW))
    assert "raw database failure" not in str(captured.value)


def test_mongo_cleanup_lease_treats_concurrent_duplicate_as_denied():
    lease = MongoCleanupLease(
        LeaseCollection(failure=DuplicateKeyError("lease already owned"))
    )
    assert asyncio.run(lease.acquire(owner="worker-2", now=NOW)) is False
