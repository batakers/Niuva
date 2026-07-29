from __future__ import annotations

import asyncio
import copy
from datetime import datetime, timedelta, timezone
from urllib.parse import parse_qs, urlparse

import pytest
from auth_password import build_password_module
from auth_recovery import (
    GENERIC_PASSWORD_RESET_REQUEST,
    PublicSiteOrigin,
    PublicSiteOriginError,
    build_recovery_module,
)
from permissions import ROLE_POLICY_VERSION

NOW = datetime(2026, 7, 27, 8, 0, tzinfo=timezone.utc)


class AtomicGuard:
    def __init__(self, store, *, unavailable: bool = False):
        self.store = store
        self.unavailable = unavailable
        self._lock = asyncio.Lock()

    async def run(self, callback, *, operation_name, **_kwargs):
        if self.unavailable:
            raise RuntimeError("transaction unavailable")
        async with self._lock:
            snapshot = copy.deepcopy((self.store.users, self.store.tokens))
            try:
                return await callback(object())
            except Exception:
                self.store.users, self.store.tokens = snapshot
                raise


class InMemoryRecoveryStore:
    def __init__(self):
        self.users = {
            "active-admin": {
                "id": "active-admin",
                "email": "admin@niuva.com",
                "name": "Niuva Admin",
                "roles": ["super_admin"],
                "status": "active",
                "access_state": "approved",
                "role_policy_version": ROLE_POLICY_VERSION,
                "password_hash": "legacy",
                "token_version": 4,
            },
            "blocked-admin": {
                "id": "blocked-admin",
                "email": "blocked@niuva.com",
                "roles": ["super_admin"],
                "status": "active",
                "access_state": "access_review_required",
                "role_policy_version": ROLE_POLICY_VERSION,
                "password_hash": "legacy",
                "token_version": 1,
            },
            "legacy-customer": {
                "id": "legacy-customer",
                "email": "customer@example.com",
                "role": "client",
                "password_hash": "legacy",
                "token_version": 0,
            },
        }
        self.tokens = []

    async def find_user_by_email(self, email, *, session=None):
        return next(
            (
                copy.deepcopy(user)
                for user in self.users.values()
                if user["email"] == email
            ),
            None,
        )

    async def find_user_by_id(self, user_id, *, session=None):
        user = self.users.get(user_id)
        return copy.deepcopy(user) if user else None

    async def issue_successor(self, user_id, token_document, *, session):
        for token in self.tokens:
            if token["user_id"] == user_id and token["active"]:
                token["active"] = False
                token["invalidated_at"] = token_document["created_at"]
                token["invalidation_reason"] = "superseded"
        self.tokens.append(copy.deepcopy(token_document))

    async def find_live_token(self, token_hash, now, *, session=None):
        return next(
            (
                copy.deepcopy(token)
                for token in self.tokens
                if token["token_hash"] == token_hash
                and token["active"]
                and token["expires_at"] > now
            ),
            None,
        )

    async def invalidate_undelivered(self, token_id, invalidated_at, *, session):
        token = next(item for item in self.tokens if item["id"] == token_id)
        token["active"] = False
        token["invalidated_at"] = invalidated_at
        token["invalidation_reason"] = "delivery_failed"

    async def complete_password_reset(
        self,
        *,
        token_id,
        user_id,
        password_hash,
        completed_at,
        session,
    ):
        claimed = next(
            (item for item in self.tokens if item["id"] == token_id and item["active"]),
            None,
        )
        if claimed is None:
            return False
        claimed["active"] = False
        claimed["used_at"] = completed_at
        claimed["invalidation_reason"] = "consumed"
        self.users[user_id]["password_hash"] = password_hash
        self.users[user_id]["token_version"] += 1
        for token in self.tokens:
            if token["user_id"] == user_id and token["active"]:
                token["active"] = False
                token["invalidated_at"] = completed_at
                token["invalidation_reason"] = "password_reset"
        return True


class CapturingDelivery:
    def __init__(self, *, fail_reset: bool = False):
        self.fail_reset = fail_reset
        self.reset_messages = []
        self.changed_messages = []

    async def send_password_reset(self, *, email, reset_url, expires_at):
        if self.fail_reset:
            raise RuntimeError("provider payload is private")
        self.reset_messages.append(
            {"email": email, "reset_url": reset_url, "expires_at": expires_at}
        )

    async def send_password_changed(self, *, email):
        self.changed_messages.append({"email": email})


def build_subject(tmp_path, *, delivery=None, unavailable=False, origin=None):
    blocklist = tmp_path / "blocked.txt"
    blocklist.write_text("known compromised phrase\n", encoding="utf-8")
    passwords = build_password_module(
        blocklist_path=blocklist,
        argon2_writes_enabled=True,
    )
    store = InMemoryRecoveryStore()
    guard = AtomicGuard(store, unavailable=unavailable)
    delivery = delivery or CapturingDelivery()
    recovery = build_recovery_module(
        store=store,
        transaction_guard=guard,
        passwords=passwords,
        delivery=delivery,
        public_site_origin=origin or PublicSiteOrigin.parse("https://niuva.com"),
        clock=lambda: NOW,
    )
    return recovery, store, delivery


def request(recovery, email):
    return asyncio.run(
        recovery.request_password_reset(email, {"correlation_id": "safe-id"})
    )


def raw_token_from(delivery):
    query = urlparse(delivery.reset_messages[-1]["reset_url"]).query
    return parse_qs(query)["token"][0]


def test_known_unknown_and_blocked_requests_share_one_public_result(tmp_path):
    recovery, store, delivery = build_subject(tmp_path)

    known = request(recovery, "admin@niuva.com")
    unknown = request(recovery, "unknown@niuva.com")
    blocked = request(recovery, "blocked@niuva.com")

    assert known == unknown == blocked == GENERIC_PASSWORD_RESET_REQUEST
    assert len(store.tokens) == 1
    assert len(delivery.reset_messages) == 1


def test_supported_legacy_customer_remains_eligible(tmp_path):
    recovery, store, delivery = build_subject(tmp_path)

    assert request(recovery, "customer@example.com") == GENERIC_PASSWORD_RESET_REQUEST

    assert store.tokens[-1]["user_id"] == "legacy-customer"
    assert len(delivery.reset_messages) == 1


def test_only_a_hash_is_stored_and_a_successor_invalidates_the_prior_token(tmp_path):
    recovery, store, delivery = build_subject(tmp_path)

    request(recovery, "admin@niuva.com")
    first_raw = raw_token_from(delivery)
    request(recovery, "admin@niuva.com")
    second_raw = raw_token_from(delivery)

    serialized = repr(store.tokens)
    assert first_raw != second_raw
    assert first_raw not in serialized
    assert second_raw not in serialized
    assert sum(token["active"] for token in store.tokens) == 1
    assert all(len(token["token_hash"]) == 64 for token in store.tokens)


def test_delivery_failure_is_generic_and_invalidates_undelivered_token(tmp_path):
    delivery = CapturingDelivery(fail_reset=True)
    recovery, store, _delivery = build_subject(tmp_path, delivery=delivery)

    result = request(recovery, "admin@niuva.com")

    assert result == GENERIC_PASSWORD_RESET_REQUEST
    assert len(store.tokens) == 1
    assert store.tokens[0]["active"] is False
    assert store.tokens[0]["invalidation_reason"] == "delivery_failed"


def test_persistence_failure_is_generic_and_sends_nothing(tmp_path):
    recovery, store, delivery = build_subject(tmp_path, unavailable=True)

    result = request(recovery, "admin@niuva.com")

    assert result == GENERIC_PASSWORD_RESET_REQUEST
    assert store.tokens == []
    assert delivery.reset_messages == []


def test_unknown_expired_and_used_tokens_share_one_invalid_result(tmp_path):
    recovery, store, delivery = build_subject(tmp_path)
    request(recovery, "admin@niuva.com")
    raw_token = raw_token_from(delivery)
    live = asyncio.run(recovery.validate_password_reset(raw_token))
    unknown = asyncio.run(recovery.validate_password_reset("unknown-token"))
    store.tokens[-1]["expires_at"] = NOW - timedelta(seconds=1)
    expired = asyncio.run(recovery.validate_password_reset(raw_token))
    store.tokens[-1]["expires_at"] = NOW + timedelta(minutes=1)
    store.tokens[-1]["active"] = False
    used = asyncio.run(recovery.validate_password_reset(raw_token))

    assert live.valid is True
    assert unknown == expired == used
    assert unknown.valid is False
    assert unknown.code == "password_reset_invalid"


def test_successful_completion_is_atomic_revokes_sessions_and_returns_no_login_token(
    tmp_path,
):
    recovery, store, delivery = build_subject(tmp_path)
    request(recovery, "admin@niuva.com")
    raw_token = raw_token_from(delivery)
    original_version = store.users["active-admin"]["token_version"]

    result = asyncio.run(
        recovery.complete_password_reset(raw_token, "a fresh unique password")
    )

    assert result.ok is True
    assert not hasattr(result, "token")
    assert store.users["active-admin"]["password_hash"].startswith("$argon2id$")
    assert store.users["active-admin"]["token_version"] == original_version + 1
    assert not any(token["active"] for token in store.tokens)
    assert delivery.changed_messages == [{"email": "admin@niuva.com"}]


def test_replay_and_two_concurrent_completions_yield_exactly_one_success(tmp_path):
    async def scenario():
        recovery, _store, delivery = build_subject(tmp_path)
        await recovery.request_password_reset("admin@niuva.com", {})
        raw_token = raw_token_from(delivery)
        results = await asyncio.gather(
            recovery.complete_password_reset(raw_token, "a fresh unique password"),
            recovery.complete_password_reset(raw_token, "a fresh unique password"),
        )
        replay = await recovery.complete_password_reset(
            raw_token, "another unique password"
        )
        return results, replay

    results, replay = asyncio.run(scenario())

    assert sum(result.ok for result in results) == 1
    assert replay.ok is False
    assert replay.code == "password_reset_invalid"


def test_completion_transaction_unavailability_has_no_partial_mutation(tmp_path):
    recovery, store, delivery = build_subject(tmp_path)
    request(recovery, "admin@niuva.com")
    raw_token = raw_token_from(delivery)
    before = copy.deepcopy((store.users, store.tokens))
    recovery.transaction_guard.unavailable = True

    with pytest.raises(RuntimeError, match="transaction unavailable"):
        asyncio.run(
            recovery.complete_password_reset(raw_token, "a fresh unique password")
        )

    assert (store.users, store.tokens) == before


def test_injected_mid_operation_failure_rolls_back_all_recovery_mutations(
    tmp_path, monkeypatch
):
    recovery, store, delivery = build_subject(tmp_path)
    request(recovery, "admin@niuva.com")
    raw_token = raw_token_from(delivery)
    before = copy.deepcopy((store.users, store.tokens))
    real_complete = store.complete_password_reset

    async def mutate_then_fail(**kwargs):
        await real_complete(**kwargs)
        raise RuntimeError("injected mid-operation failure")

    monkeypatch.setattr(store, "complete_password_reset", mutate_then_fail)

    with pytest.raises(RuntimeError, match="injected mid-operation failure"):
        asyncio.run(
            recovery.complete_password_reset(raw_token, "a fresh unique password")
        )

    assert (store.users, store.tokens) == before
    assert delivery.changed_messages == []


@pytest.mark.parametrize(
    "value",
    [
        "http://niuva.com",
        "https://user:pass@niuva.com",
        "https://niuva.com/path",
        "https://niuva.com?query=value",
        "https://niuva.com#fragment",
        "//niuva.com",
    ],
)
def test_public_origin_rejects_unsafe_or_non_origin_values(value):
    with pytest.raises(PublicSiteOriginError):
        PublicSiteOrigin.parse(value)


def test_public_origin_allows_local_http_only_in_local_mode():
    origin = PublicSiteOrigin.parse("http://127.0.0.1:3000", local_mode=True)

    assert origin.password_reset_url("opaque-token").startswith(
        "http://127.0.0.1:3000/reset-password?token="
    )
    with pytest.raises(PublicSiteOriginError):
        PublicSiteOrigin.parse("http://example.com", local_mode=True)
