from __future__ import annotations

import asyncio
import copy
from datetime import datetime, timedelta, timezone

import pytest
from auth_session import (
    ACCESS_COOKIE_NAME,
    ACCESS_TTL,
    DEFAULT_ABSOLUTE_TTL,
    DEFAULT_IDLE_TTL,
    REMEMBER_ABSOLUTE_TTL,
    REMEMBER_IDLE_TTL,
    SESSION_COOKIE_NAME,
    AdminSessionModule,
    RequestVerificationError,
    SessionExpiredError,
    SessionInputError,
    SessionReplayError,
    access_cookie_options,
    session_cookie_options,
)

NOW = datetime(2026, 7, 28, 8, 0, tzinfo=timezone.utc)
USER = {"id": "admin-1", "token_version": 7}


class Clock:
    def __init__(self):
        self.now = NOW

    def __call__(self):
        return self.now


class Tokens:
    def __init__(self):
        self.value = 0

    def __call__(self):
        self.value += 1
        return self.value.to_bytes(32, "big")


class MemoryStore:
    def __init__(self):
        self.records = []
        self.fail_after_rotate = False

    async def create(self, document, *, session):
        self.records.append(copy.deepcopy(document))

    async def find_by_access_hash(self, access_hash, *, session=None):
        return self._find(lambda row: row["access_hash"] == access_hash)

    async def find_by_session_hash(self, session_hash, *, session=None):
        return self._find(
            lambda row: row["session_hash"] == session_hash
            or session_hash in row["rotated_session_hashes"]
        )

    async def touch(
        self, session_id, access_hash, *, last_seen_at, idle_expires_at
    ):
        row = self._row(session_id)
        if row["access_hash"] != access_hash or row["revoked_at"] is not None:
            return False
        row.update(last_seen_at=last_seen_at, idle_expires_at=idle_expires_at)
        return True

    async def rotate(
        self, session_id, expected_session_hash, replacement, *, session
    ):
        row = self._row(session_id)
        if row["session_hash"] != expected_session_hash or row["revoked_at"]:
            return False
        row["rotated_session_hashes"].append(expected_session_hash)
        row.update(copy.deepcopy(replacement))
        if self.fail_after_rotate:
            raise RuntimeError("injected rotation failure")
        return True

    async def revoke_family(self, session_id, reason, revoked_at, *, session):
        row = self._row(session_id)
        if row["revoked_at"] is not None:
            return False
        row.update(revoked_at=revoked_at, revocation_reason=reason)
        return True

    async def revoke_user(self, user_id, reason, revoked_at, *, session):
        changed = 0
        for row in self.records:
            if row["user_id"] == user_id and row["revoked_at"] is None:
                row.update(revoked_at=revoked_at, revocation_reason=reason)
                changed += 1
        return changed

    def _find(self, predicate):
        row = next((row for row in self.records if predicate(row)), None)
        return copy.deepcopy(row) if row else None

    def _row(self, session_id):
        return next(row for row in self.records if row["id"] == session_id)


class AtomicGuard:
    def __init__(self, store, *, unavailable=False):
        self.store = store
        self.unavailable = unavailable
        self.lock = asyncio.Lock()
        self.calls = []

    async def run(self, callback, *, operation_name, **_kwargs):
        self.calls.append((operation_name, _kwargs))
        if self.unavailable:
            raise RuntimeError("transaction unavailable")
        async with self.lock:
            before = copy.deepcopy(self.store.records)
            try:
                return await callback(object())
            except Exception:
                self.store.records = before
                raise


def subject():
    clock, tokens, store = Clock(), Tokens(), MemoryStore()
    module = AdminSessionModule(
        store=store,
        transaction_guard=AtomicGuard(store),
        csrf_key=b"k" * 32,
        clock=clock,
        token_factory=tokens,
    )
    return module, store, clock


def run(awaitable):
    return asyncio.run(awaitable)


def create(module, remember=False):
    return run(module.create_admin_session(USER, remember, {"ip": "must-not-store"}))


@pytest.mark.parametrize(
    ("remember", "idle", "absolute"),
    [
        (False, DEFAULT_IDLE_TTL, DEFAULT_ABSOLUTE_TTL),
        (True, REMEMBER_IDLE_TTL, REMEMBER_ABSOLUTE_TTL),
    ],
)
def test_exact_session_durations(remember, idle, absolute):
    module, _store, _clock = subject()
    grant = create(module, remember)

    assert grant.access_expires_at == NOW + ACCESS_TTL
    assert grant.idle_expires_at == NOW + idle
    assert grant.absolute_expires_at == NOW + absolute


def test_storage_contains_hashes_only_and_token_version_snapshot():
    module, store, _clock = subject()
    grant = create(module)
    row = store.records[0]
    serialized = repr(row)

    assert grant.access_secret not in serialized
    assert grant.session_secret not in serialized
    assert grant.csrf_token not in serialized
    assert all(len(row[name]) == 64 for name in ("access_hash", "session_hash", "csrf_digest"))
    assert row["token_version"] == 7
    assert "ip" not in serialized
    assert len(grant.access_secret) >= 43 and len(grant.session_secret) >= 43


def test_cookie_contract_is_secure_host_only_and_remember_controls_persistence():
    assert ACCESS_COOKIE_NAME.startswith("__Host-")
    assert SESSION_COOKIE_NAME.startswith("__Host-")
    assert access_cookie_options() == {
        "secure": True,
        "httponly": True,
        "samesite": "strict",
        "path": "/",
        "max_age": 900,
    }
    assert "max_age" not in session_cookie_options(False)
    assert session_cookie_options(True)["max_age"] == 7 * 24 * 60 * 60


def test_authentication_extends_idle_but_never_absolute_and_checks_version():
    module, store, clock = subject()
    grant = create(module)
    clock.now = NOW + timedelta(minutes=10)

    authenticated = run(
        module.authenticate_admin_session(
            {"access_secret": grant.access_secret, "token_version": 7}
        )
    )

    assert authenticated.idle_expires_at == clock.now + DEFAULT_IDLE_TTL
    assert store.records[0]["absolute_expires_at"] == NOW + DEFAULT_ABSOLUTE_TTL
    with pytest.raises(SessionExpiredError):
        run(
            module.authenticate_admin_session(
                {"access_secret": grant.access_secret, "token_version": 8}
            )
        )


@pytest.mark.parametrize("boundary", ["access_expires_at", "idle_expires_at", "absolute_expires_at"])
def test_each_expiry_boundary_fails_closed(boundary):
    module, store, clock = subject()
    grant = create(module)
    if boundary != "access_expires_at":
        store.records[0]["access_expires_at"] = NOW + timedelta(days=1)
    clock.now = store.records[0][boundary]

    with pytest.raises(SessionExpiredError) as error:
        run(
            module.authenticate_admin_session(
                {"access_secret": grant.access_secret, "token_version": 7}
            )
        )
    assert error.value.code == "admin_session_expired"


def test_rotation_replaces_all_browser_material_without_extending_absolute():
    module, store, clock = subject()
    first = create(module, remember=True)
    clock.now += timedelta(hours=1)

    second = run(
        module.rotate_admin_session(
            None, {"session_secret": first.session_secret, "token_version": 7}
        )
    )

    assert second.access_secret != first.access_secret
    assert second.session_secret != first.session_secret
    assert second.csrf_token != first.csrf_token
    assert second.absolute_expires_at == first.absolute_expires_at
    assert second.access_expires_at == clock.now + ACCESS_TTL
    assert len(store.records[0]["rotated_session_hashes"]) == 1
    with pytest.raises(SessionExpiredError):
        run(
            module.authenticate_admin_session(
                {"access_secret": first.access_secret, "token_version": 7}
            )
        )


def test_replayed_rotated_secret_revokes_the_family_with_generic_public_code():
    module, store, _clock = subject()
    first = create(module)
    second = run(
        module.rotate_admin_session(
            None, {"session_secret": first.session_secret, "token_version": 7}
        )
    )

    with pytest.raises(SessionReplayError) as error:
        run(
            module.rotate_admin_session(
                None, {"session_secret": first.session_secret, "token_version": 7}
            )
        )
    assert error.value.code == "admin_session_expired"
    assert store.records[0]["revocation_reason"] == "session_secret_replay"
    with pytest.raises(SessionExpiredError):
        run(
            module.authenticate_admin_session(
                {"access_secret": second.access_secret, "token_version": 7}
            )
        )


def test_concurrent_rotation_has_one_success_then_replay_revokes_family():
    async def scenario():
        module, store, _clock = subject()
        first = await module.create_admin_session(USER, False, {})
        results = await asyncio.gather(
            module.rotate_admin_session(
                None, {"session_secret": first.session_secret, "token_version": 7}
            ),
            module.rotate_admin_session(
                None, {"session_secret": first.session_secret, "token_version": 7}
            ),
            return_exceptions=True,
        )
        return results, store

    results, store = run(scenario())
    assert sum(type(result).__name__ == "SessionGrant" for result in results) == 1
    assert sum(isinstance(result, SessionReplayError) for result in results) == 1
    assert store.records[0]["revoked_at"] is not None


def test_rotation_does_not_driver_retry_a_semantically_consumed_secret():
    module, _store, _clock = subject()
    first = create(module)
    run(
        module.rotate_admin_session(
            None, {"session_secret": first.session_secret, "token_version": 7}
        )
    )

    assert module.transaction_guard.calls[-1] == (
        "auth.admin_session.rotate",
        {},
    )


def test_csrf_uses_keyed_digest_and_constant_time_comparison(monkeypatch):
    module, store, _clock = subject()
    grant = create(module)
    authenticated = run(
        module.authenticate_admin_session(
            {"access_secret": grant.access_secret, "token_version": 7}
        )
    )
    calls = []
    real_compare = __import__("hmac").compare_digest

    def capture(left, right):
        calls.append((left, right))
        return real_compare(left, right)

    monkeypatch.setattr("auth_session.hmac.compare_digest", capture)
    module.verify_csrf(authenticated, grant.csrf_token)
    with pytest.raises(RequestVerificationError) as error:
        module.verify_csrf(authenticated, "wrong")

    assert len(calls) == 2
    assert all(len(left) == len(right) == 64 for left, right in calls)
    assert grant.csrf_token not in repr(store.records)
    assert error.value.code == "request_verification_failed"


def test_invalid_csrf_does_not_extend_idle_timeout():
    module, store, clock = subject()
    grant = create(module)
    original_idle = store.records[0]["idle_expires_at"]
    clock.now += timedelta(minutes=10)

    with pytest.raises(RequestVerificationError):
        run(
            module.authenticate_admin_session(
                {
                    "access_secret": grant.access_secret,
                    "token_version": 7,
                    "csrf_token": "wrong",
                }
            )
        )

    assert store.records[0]["idle_expires_at"] == original_idle


def test_revoke_one_and_revoke_user_invalidate_server_state():
    module, store, _clock = subject()
    first = create(module)
    second = create(module, remember=True)

    assert run(module.revoke_admin_session(first.session_id, "logout")) is True
    assert run(module.revoke_user_sessions(USER["id"], "password_reset")) == 1
    assert {row["revocation_reason"] for row in store.records} == {
        "logout",
        "password_reset",
    }
    for grant in (first, second):
        with pytest.raises(SessionExpiredError):
            run(
                module.authenticate_admin_session(
                    {"access_secret": grant.access_secret, "token_version": 7}
                )
            )


def test_transaction_unavailability_and_mid_rotation_failure_leave_no_partial_state():
    module, store, _clock = subject()
    grant = create(module)
    before = copy.deepcopy(store.records)
    module.transaction_guard.unavailable = True
    with pytest.raises(RuntimeError, match="transaction unavailable"):
        run(
            module.rotate_admin_session(
                None, {"session_secret": grant.session_secret, "token_version": 7}
            )
        )
    assert store.records == before

    module.transaction_guard.unavailable = False
    store.fail_after_rotate = True
    with pytest.raises(RuntimeError, match="injected rotation failure"):
        run(
            module.rotate_admin_session(
                None, {"session_secret": grant.session_secret, "token_version": 7}
            )
        )
    assert store.records == before


def test_factories_and_inputs_fail_closed():
    module, _store, _clock = subject()
    module.token_factory = lambda: b"short"
    with pytest.raises(SessionInputError, match="256"):
        create(module)
    with pytest.raises(SessionInputError, match="256"):
        AdminSessionModule(
            store=MemoryStore(),
            transaction_guard=object(),
            csrf_key=b"short",
        )
