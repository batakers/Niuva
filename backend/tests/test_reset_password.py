from __future__ import annotations

import asyncio
import copy
import os
import re
import sys
import types
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import unquote

import httpx

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("MONGO_URL", "mongodb://reset-password-test.invalid")
os.environ.setdefault("DB_NAME", "niuva_reset_password_test")
os.environ.setdefault("JWT_SECRET", "reset-password-test-secret-at-least-32-characters")
os.environ.setdefault("ADMIN_EMAIL", "admin@niuva.com")
os.environ.setdefault("ADMIN_PASSWORD", "AdminPassword123")

resend_module = types.ModuleType("resend")
resend_module.api_key = ""
resend_module.Emails = types.SimpleNamespace(send=lambda _params: {"id": "test"})
sys.modules.setdefault("resend", resend_module)

import emailer  # noqa: E402
import server  # noqa: E402


class FakeCollection:
    def __init__(self, items=None):
        self.items = [dict(item) for item in (items or [])]

    @classmethod
    def _matches(cls, item, query):
        for key, expected in query.items():
            actual = item.get(key)
            if isinstance(expected, dict):
                if "$gt" in expected and not (
                    actual is not None and actual > expected["$gt"]
                ):
                    return False
                continue
            if isinstance(actual, list):
                if expected not in actual:
                    return False
            elif actual != expected:
                return False
        return True

    @staticmethod
    def _project(item, projection):
        result = dict(item)
        if projection:
            for key, include in projection.items():
                if not include:
                    result.pop(key, None)
        return result

    async def find_one(self, query, projection=None, **_options):
        for item in self.items:
            if self._matches(item, query):
                return self._project(item, projection)
        return None

    async def insert_one(self, item, **_options):
        self.items.append(dict(item))
        return types.SimpleNamespace(inserted_id=item.get("id"))

    async def update_one(self, query, update, **_options):
        for item in self.items:
            if self._matches(item, query):
                self._apply_update(item, update)
                return types.SimpleNamespace(matched_count=1, modified_count=1)
        return types.SimpleNamespace(matched_count=0, modified_count=0)

    async def update_many(self, query, update, **_options):
        matched = 0
        for item in self.items:
            if self._matches(item, query):
                self._apply_update(item, update)
                matched += 1
        return types.SimpleNamespace(matched_count=matched, modified_count=matched)

    @staticmethod
    def _apply_update(item, update):
        item.update(update.get("$set", {}))
        for field, amount in update.get("$inc", {}).items():
            item[field] = item.get(field, 0) + amount


class FakeDatabase:
    def __init__(self, users):
        self.users = FakeCollection(users)
        self.password_reset_tokens = FakeCollection()
        self.admin_sessions = FakeCollection()
        self.notifications = FakeCollection()


class AtomicGuard:
    def __init__(self, database, *, unavailable=False):
        self.database = database
        self.unavailable = unavailable
        self._lock = asyncio.Lock()

    async def run(self, callback, *, operation_name, **_options):
        del operation_name
        if self.unavailable:
            from transaction_execution import TransactionUnavailableError

            raise TransactionUnavailableError()
        async with self._lock:
            snapshot = copy.deepcopy(
                {
                    "users": self.database.users.items,
                    "tokens": self.database.password_reset_tokens.items,
                    "sessions": self.database.admin_sessions.items,
                    "notifications": self.database.notifications.items,
                }
            )
            try:
                return await callback(object())
            except BaseException:
                self.database.users.items = snapshot["users"]
                self.database.password_reset_tokens.items = snapshot["tokens"]
                self.database.admin_sessions.items = snapshot["sessions"]
                self.database.notifications.items = snapshot["notifications"]
                raise


class CapturingProvider:
    def __init__(self, *, fail=False):
        self.fail = fail
        self.messages = []

    async def __call__(self, *, to_email, subject, title, body_html):
        if self.fail:
            return {"status": "error"}
        self.messages.append(
            {
                "to_email": to_email,
                "subject": subject,
                "title": title,
                "body_html": body_html,
            }
        )
        return {"status": "sent", "id": "test-message"}

    def latest_raw_token(self):
        body = self.messages[-1]["body_html"]
        match = re.search(r"[?&]token=([^\"<]+)", body)
        assert match is not None
        return unquote(match.group(1))


def bearer(token):
    return {"Authorization": f"Bearer {token}"}


def build_customer():
    return {
        "id": "customer-1",
        "name": "Reset Customer",
        "email": "reset-customer@example.com",
        "password_hash": server.hash_password("OldPassword123"),
        "phone": "",
        "company": "",
        "role": "client",
        "created_at": server.now_iso(),
        "token_version": 0,
    }


def build_blocked_admin():
    return {
        "id": "blocked-admin",
        "name": "Blocked Admin",
        "email": "blocked-admin@niuva.com",
        "password_hash": server.hash_password("BlockedPassword123"),
        "roles": ["super_admin"],
        "status": "active",
        "access_state": "access_review_required",
        "token_version": 0,
    }


@contextmanager
def configured_runtime(monkeypatch, tmp_path, users, *, writes_enabled=True):
    blocklist = tmp_path / "password-blocklist.txt"
    blocklist.write_text("known compromised phrase\n", encoding="utf-8")
    monkeypatch.setenv("PUBLIC_SITE_URL", "https://accounts.niuva.example")
    monkeypatch.setenv("AUTH_PASSWORD_BLOCKLIST_PATH", str(blocklist))
    monkeypatch.setenv(
        "AUTH_ARGON2_WRITES_ENABLED", "true" if writes_enabled else "false"
    )
    monkeypatch.setenv("APP_ENV", "test")

    original_db = server.db
    original_guard = server.app.state.transaction_guard
    original_delivery = getattr(server.app.state, "password_recovery_delivery", None)
    database = FakeDatabase(users)
    provider = CapturingProvider()
    server.db = database
    server.app.state.transaction_guard = AtomicGuard(database)
    server.app.state.password_recovery_delivery = emailer.PasswordRecoveryDelivery(
        get_database=lambda: server.db,
        provider_sender=provider,
    )
    server._rate_buckets.clear()
    try:
        yield database, provider
    finally:
        server.db = original_db
        server.app.state.transaction_guard = original_guard
        if original_delivery is None:
            delattr(server.app.state, "password_recovery_delivery")
        else:
            server.app.state.password_recovery_delivery = original_delivery
        server._rate_buckets.clear()


def test_recovery_request_contract_origin_and_policy_routes(monkeypatch, tmp_path):
    async def scenario():
        users = [build_customer(), build_blocked_admin()]
        with configured_runtime(monkeypatch, tmp_path, users) as (database, provider):
            transport = httpx.ASGITransport(app=server.app)
            async with httpx.AsyncClient(
                transport=transport, base_url="http://testserver"
            ) as api:
                headers = {
                    "host": "attacker.example",
                    "origin": "https://attacker.example",
                    "x-forwarded-host": "attacker.example",
                }
                known = await api.post(
                    "/api/auth/forgot-password",
                    json={"email": "reset-customer@example.com"},
                    headers=headers,
                )
                unknown = await api.post(
                    "/api/auth/forgot-password",
                    json={"email": "missing@example.com"},
                )
                blocked = await api.post(
                    "/api/auth/forgot-password",
                    json={"email": "blocked-admin@niuva.com"},
                )
                policy = await api.get("/api/auth/password-policy")

                assert (
                    known.status_code
                    == unknown.status_code
                    == blocked.status_code
                    == 200
                )
                assert known.json() == unknown.json() == blocked.json()
                assert policy.status_code == 200
                assert policy.json()["min_code_points"] == 15
                assert len(database.password_reset_tokens.items) == 1
                assert len(provider.messages) == 1
                assert "https://accounts.niuva.example/reset-password?token=" in (
                    provider.messages[0]["body_html"]
                )
                assert "attacker.example" not in provider.messages[0]["body_html"]

                raw_token = provider.latest_raw_token()
                assert raw_token not in repr(database.password_reset_tokens.items)
                assert raw_token not in repr(database.notifications.items)
                assert database.password_reset_tokens.items[0]["active"] is True
                assert isinstance(
                    database.password_reset_tokens.items[0]["expires_at"], datetime
                )

                valid = await api.post(
                    "/api/auth/reset-password/validate", json={"token": raw_token}
                )
                invalid = await api.post(
                    "/api/auth/reset-password/validate", json={"token": "unknown"}
                )
                assert valid.json() == {"valid": True}
                assert invalid.json() == {
                    "valid": False,
                    "code": "password_reset_invalid",
                }
                rate_limited = await api.post(
                    "/api/auth/forgot-password",
                    json={"email": "another-missing@example.com"},
                )
                assert rate_limited.status_code == 429

    asyncio.run(scenario())


def test_reset_route_revokes_old_session_preserves_compatibility_and_contains_token(
    monkeypatch, tmp_path
):
    async def scenario():
        customer = build_customer()
        with configured_runtime(monkeypatch, tmp_path, [customer]) as (
            database,
            provider,
        ):
            transport = httpx.ASGITransport(app=server.app)
            async with httpx.AsyncClient(
                transport=transport, base_url="http://testserver"
            ) as api:
                login_before = await api.post(
                    "/api/auth/login",
                    json={"email": customer["email"], "password": "OldPassword123"},
                )
                assert login_before.status_code == 200
                old_session = login_before.json()["token"]
                assert (
                    await api.get("/api/auth/me", headers=bearer(old_session))
                ).status_code == 200

                request = await api.post(
                    "/api/auth/forgot-password", json={"email": customer["email"]}
                )
                assert request.status_code == 200
                raw_token = provider.latest_raw_token()
                new_password = "A genuinely new password 2026"
                reset = await api.post(
                    "/api/auth/reset-password",
                    json={"token": raw_token, "new_password": new_password},
                )
                assert reset.status_code == 200
                assert "token" not in reset.json()

                stored_user = database.users.items[0]
                assert stored_user["password_hash"].startswith("$argon2id$")
                assert stored_user["token_version"] == 1
                assert not any(
                    token["active"] for token in database.password_reset_tokens.items
                )
                assert (
                    await api.get("/api/auth/me", headers=bearer(old_session))
                ).status_code == 401

                old_login = await api.post(
                    "/api/auth/login",
                    json={"email": customer["email"], "password": "OldPassword123"},
                )
                new_login = await api.post(
                    "/api/auth/login",
                    json={"email": customer["email"], "password": new_password},
                )
                assert old_login.status_code == 401
                assert new_login.status_code == 200
                assert (
                    await api.get(
                        "/api/auth/me", headers=bearer(new_login.json()["token"])
                    )
                ).status_code == 200

                replay = await api.post(
                    "/api/auth/reset-password",
                    json={
                        "token": raw_token,
                        "new_password": "Another safe password 2026",
                    },
                )
                used_validation = await api.post(
                    "/api/auth/reset-password/validate", json={"token": raw_token}
                )
                assert replay.status_code == 400
                assert used_validation.json() == {
                    "valid": False,
                    "code": "password_reset_invalid",
                }

                assert len(database.notifications.items) == 1
                notification = database.notifications.items[0]
                assert raw_token not in repr(notification)
                assert new_password not in repr(notification)
                assert "berhasil diubah" in notification["body_html"].lower()

    asyncio.run(scenario())


def test_missing_or_invalid_origin_disables_issuance_with_generic_response(
    monkeypatch, tmp_path
):
    async def scenario():
        customer = build_customer()
        with configured_runtime(monkeypatch, tmp_path, [customer]) as (
            database,
            provider,
        ):
            transport = httpx.ASGITransport(app=server.app)
            async with httpx.AsyncClient(
                transport=transport, base_url="http://testserver"
            ) as api:
                monkeypatch.delenv("PUBLIC_SITE_URL")
                missing = await api.post(
                    "/api/auth/forgot-password", json={"email": customer["email"]}
                )
                monkeypatch.setenv("PUBLIC_SITE_URL", "http://attacker.example")
                invalid = await api.post(
                    "/api/auth/forgot-password", json={"email": customer["email"]}
                )
                assert missing.status_code == invalid.status_code == 200
                assert missing.json() == invalid.json()
                assert database.password_reset_tokens.items == []
                assert provider.messages == []

    asyncio.run(scenario())


def test_disabled_write_gate_fails_reset_closed_without_consuming_token(
    monkeypatch, tmp_path
):
    async def scenario():
        customer = build_customer()
        with configured_runtime(
            monkeypatch, tmp_path, [customer], writes_enabled=False
        ) as (database, provider):
            transport = httpx.ASGITransport(app=server.app)
            async with httpx.AsyncClient(
                transport=transport, base_url="http://testserver"
            ) as api:
                await api.post(
                    "/api/auth/forgot-password", json={"email": customer["email"]}
                )
                raw_token = provider.latest_raw_token()
                before = copy.deepcopy(
                    (database.users.items, database.password_reset_tokens.items)
                )
                reset = await api.post(
                    "/api/auth/reset-password",
                    json={
                        "token": raw_token,
                        "new_password": "A gated password change 2026",
                    },
                )
                assert reset.status_code == 503
                assert reset.json()["detail"]["code"] == "password_writes_disabled"
                assert (
                    database.users.items,
                    database.password_reset_tokens.items,
                ) == before

    asyncio.run(scenario())


def test_dedicated_delivery_invalidates_failed_token_without_general_notification(
    monkeypatch, tmp_path
):
    async def scenario():
        customer = build_customer()
        with configured_runtime(monkeypatch, tmp_path, [customer]) as (
            database,
            _provider,
        ):
            failing_provider = CapturingProvider(fail=True)
            server.app.state.password_recovery_delivery = (
                emailer.PasswordRecoveryDelivery(
                    get_database=lambda: server.db,
                    provider_sender=failing_provider,
                )
            )
            transport = httpx.ASGITransport(app=server.app)
            async with httpx.AsyncClient(
                transport=transport, base_url="http://testserver"
            ) as api:
                known = await api.post(
                    "/api/auth/forgot-password", json={"email": customer["email"]}
                )
                unknown = await api.post(
                    "/api/auth/forgot-password", json={"email": "missing@example.com"}
                )
                assert known.status_code == unknown.status_code == 200
                assert known.json() == unknown.json()
                assert len(database.password_reset_tokens.items) == 1
                assert database.password_reset_tokens.items[0]["active"] is False
                assert (
                    database.password_reset_tokens.items[0]["invalidation_reason"]
                    == "delivery_failed"
                )
                assert database.notifications.items == []

    asyncio.run(scenario())


def test_unknown_expired_and_used_tokens_keep_one_public_invalid_contract(
    monkeypatch, tmp_path
):
    async def scenario():
        customer = build_customer()
        with configured_runtime(monkeypatch, tmp_path, [customer]) as (
            database,
            provider,
        ):
            transport = httpx.ASGITransport(app=server.app)
            async with httpx.AsyncClient(
                transport=transport, base_url="http://testserver"
            ) as api:
                await api.post(
                    "/api/auth/forgot-password", json={"email": customer["email"]}
                )
                raw_token = provider.latest_raw_token()
                unknown = await api.post(
                    "/api/auth/reset-password/validate", json={"token": "unknown"}
                )
                database.password_reset_tokens.items[0]["expires_at"] = datetime.now(
                    timezone.utc
                ) - timedelta(seconds=1)
                expired = await api.post(
                    "/api/auth/reset-password/validate", json={"token": raw_token}
                )
                database.password_reset_tokens.items[0]["expires_at"] = datetime.now(
                    timezone.utc
                ) + timedelta(minutes=5)
                database.password_reset_tokens.items[0]["active"] = False
                used = await api.post(
                    "/api/auth/reset-password/validate", json={"token": raw_token}
                )
                assert (
                    unknown.json()
                    == expired.json()
                    == used.json()
                    == {
                        "valid": False,
                        "code": "password_reset_invalid",
                    }
                )

    asyncio.run(scenario())
