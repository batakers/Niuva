import asyncio
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest

from auth_security_events import (
    EVENT_TYPES,
    RETENTION,
    AuthenticationSecurityEvent,
    AuthenticationSecurityEventService,
    EventPseudonymizer,
    MongoSecurityEventStore,
    SecurityEventDependencyError,
    SecurityEventValidationError,
)

NOW = datetime(2026, 7, 29, 12, 0, tzinfo=timezone.utc)
KEY = b"auth-event-test-key-that-is-at-least-32-bytes"


class MemoryStore:
    def __init__(self):
        self.events = []
        self.expired_before = None

    async def append(self, event, *, session=None):
        self.events.append((dict(event), session))

    async def delete_expired(self, *, before, limit):
        self.expired_before = (before, limit)
        return 3


def build_service():
    store = MemoryStore()
    service = AuthenticationSecurityEventService(
        store=store,
        pseudonymizer=EventPseudonymizer(key=KEY, key_version="v1"),
        clock=lambda: NOW,
    )
    return service, store


def test_unknown_identifier_and_peer_are_pseudonymized_without_plaintext():
    service, store = build_service()
    document = asyncio.run(
        service.emit(
            event_type="auth.login_failed",
            outcome="denied",
            reason_code="credentials_invalid",
            subject_kind="unknown_identifier",
            unknown_identifier=" Unknown@Example.COM ",
            surface="admin",
            peer_identifier="203.0.113.10",
        )
    )

    serialized = repr(document)
    assert "unknown@example.com" not in serialized.casefold()
    assert "203.0.113.10" not in serialized
    assert document["subject_ref"].startswith("hmac-sha256:v1:")
    assert document["peer_ref"].startswith("hmac-sha256:v1:")
    assert document["expires_at"] == NOW + RETENTION
    assert store.events == [(document, None)]


def test_pseudonyms_are_stable_per_namespace_but_not_cross_namespace():
    pseudonymizer = EventPseudonymizer(key=KEY, key_version="v1")
    subject = pseudonymizer.digest(namespace="subject", value="same")
    repeated = pseudonymizer.digest(namespace="subject", value=" SAME ")
    peer = pseudonymizer.digest(namespace="peer", value="same")
    assert subject == repeated
    assert subject != peer


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("event_type", "auth.password_dumped"),
        ("outcome", "maybe"),
        ("reason_code", "wrong password for user@example.com"),
        ("subject_kind", "email"),
        ("surface", "mobile"),
        ("session_ref", "cookie value with spaces"),
        ("correlation_id", "attacker-controlled"),
    ],
)
def test_event_rejects_values_outside_the_strict_allowlist(field, value):
    payload = {
        "event_type": "auth.login_failed",
        "outcome": "denied",
        "reason_code": "credentials_invalid",
        "subject_kind": "known_user",
        "subject_ref": "user-1",
        "surface": "admin",
    }
    payload[field] = value
    with pytest.raises(SecurityEventValidationError):
        AuthenticationSecurityEvent(**payload).to_document()


def test_subject_shapes_fail_closed():
    service, _store = build_service()

    async def scenario():
        with pytest.raises(SecurityEventValidationError):
            await service.emit(
                event_type="auth.login_failed",
                outcome="denied",
                reason_code="credentials_invalid",
                subject_kind="unknown_identifier",
                known_subject_id="user-1",
                unknown_identifier="unknown@example.com",
                surface="admin",
            )
        with pytest.raises(SecurityEventValidationError):
            await service.emit(
                event_type="auth.login_failed",
                outcome="denied",
                reason_code="credentials_invalid",
                subject_kind="known_user",
                known_subject_id="user-1",
                unknown_identifier="unknown@example.com",
                surface="admin",
            )
        with pytest.raises(SecurityEventValidationError):
            await service.emit(
                event_type="auth.security_dependency_failed",
                outcome="failed_safe",
                reason_code="dependency_unavailable",
                subject_kind="system",
                known_subject_id="user-1",
                surface="system",
            )

    asyncio.run(scenario())


@pytest.mark.parametrize(
    "key",
    [b"", b"too-short"],
)
def test_missing_or_short_pseudonymization_key_fails_closed(key):
    with pytest.raises(SecurityEventDependencyError):
        EventPseudonymizer(key=key, key_version="v1")


def test_cleanup_uses_controlled_clock_and_bounded_limit():
    service, store = build_service()
    assert asyncio.run(service.cleanup(limit=1000)) == 3
    assert store.expired_before == (NOW, 1000)


def test_all_approved_event_families_build_without_sensitive_payload_fields():
    for event_type in EVENT_TYPES:
        document = AuthenticationSecurityEvent(
            event_type=event_type,
            outcome="success",
            reason_code="internal_failure_safe",
            subject_kind="system",
            surface="system",
            occurred_at=NOW,
        ).to_document()
        assert set(document) == {
            "id",
            "schema_version",
            "event_type",
            "occurred_at",
            "outcome",
            "reason_code",
            "subject_kind",
            "subject_ref",
            "actor_ref",
            "session_ref",
            "surface",
            "peer_ref",
            "correlation_id",
            "key_version",
            "retention_class",
            "expires_at",
        }
        assert not {
            "password",
            "token",
            "cookie",
            "authorization",
            "csrf",
            "provider_payload",
            "exception",
        } & set(document)


class FailingCollection:
    async def insert_one(self, _event, **_options):
        raise RuntimeError("raw provider failure with secret")


def test_store_normalizes_raw_dependency_errors():
    store = MongoSecurityEventStore(FailingCollection())
    with pytest.raises(
        SecurityEventDependencyError,
        match="Authentication security-event persistence failed",
    ) as captured:
        asyncio.run(store.append({"id": "event-1"}))
    assert "raw provider failure" not in str(captured.value)


def test_timezone_naive_event_time_is_rejected():
    with pytest.raises(SecurityEventValidationError, match="timezone-aware"):
        AuthenticationSecurityEvent(
            event_type="auth.login_succeeded",
            outcome="success",
            reason_code="internal_failure_safe",
            subject_kind="system",
            surface="system",
            occurred_at=datetime(2026, 7, 29),
        ).to_document()


def test_no_application_reader_or_general_admin_permission_is_exposed():
    backend = Path(__file__).resolve().parents[1]
    server_source = (backend / "server.py").read_text(encoding="utf-8")
    permission_source = (backend / "permissions.py").read_text(encoding="utf-8")
    assert '@api.get("/auth/security-events' not in server_source
    assert '@api.get("/admin/security-events' not in server_source
    assert "authentication_security_events.read" not in permission_source
    assert "security_events.read" not in permission_source
