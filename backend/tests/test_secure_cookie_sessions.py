import asyncio
import os
import sys
import types
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx
import pytest

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("MONGO_URL", "mongodb://cookie-session-test.invalid")
os.environ.setdefault("DB_NAME", "niuva_cookie_session_test")
os.environ.setdefault("JWT_SECRET", "cookie-session-test-secret-at-least-32-characters")
os.environ.setdefault("ADMIN_EMAIL", "admin@niuva.com")
os.environ.setdefault("ADMIN_PASSWORD", "AdminPassword123")
os.environ.setdefault("AUTH_COOKIE_SECURE", "false")

resend_module = types.ModuleType("resend")
resend_module.api_key = ""
resend_module.Emails = types.SimpleNamespace(send=lambda _params: {"id": "test"})
sys.modules.setdefault("resend", resend_module)

import server  # noqa: E402

from tests.auth_support import AuthCollection  # noqa: E402

ORIGIN = {"Origin": "https://testserver"}


class AuthDatabase:
    def __init__(self, users):
        self.users = AuthCollection(
            [
                {"role_policy_version": server.ROLE_POLICY_VERSION, **user}
                for user in users
            ]
        )
        self.auth_sessions = AuthCollection()
        self.login_rate_limits = AuthCollection()


class CapturingSecurityEvents:
    def __init__(self):
        self.events = []

    async def emit(self, **event):
        self.events.append(event)
        return event


def customer():
    return {
        "id": "customer-cookie-1",
        "name": "Cookie Customer",
        "email": "cookie-customer@example.com",
        "password_hash": server.hash_password("CookiePassword123"),
        "roles": ["retail_customer"],
        "status": "active",
        "access_state": "approved",
        "token_version": 0,
        "version": 1,
    }


async def run_cookie_session_rotation_contract():
    original_db = server.db
    server.db = AuthDatabase([customer()])
    try:
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="https://testserver",
        ) as api:
            login = await api.post(
                "/api/auth/login",
                json={
                    "email": customer()["email"],
                    "password": "CookiePassword123",
                },
                headers=ORIGIN,
            )
            assert login.status_code == 200
            assert login.headers["cache-control"] == "no-store"
            assert set(login.json()) == {"user"}
            assert "token" not in login.json()
            assert "niuva_access" in login.cookies
            assert "niuva_refresh" in login.cookies
            assert "niuva_csrf" in login.cookies
            set_cookie_headers = login.headers.get_list("set-cookie")
            assert any(
                value.startswith("niuva_access=") and "HttpOnly" in value
                for value in set_cookie_headers
            )
            assert any(
                value.startswith("niuva_refresh=") and "HttpOnly" in value
                for value in set_cookie_headers
            )

            old_access = login.cookies["niuva_access"]
            old_refresh = login.cookies["niuva_refresh"]
            old_csrf = login.cookies["niuva_csrf"]

            missing_csrf = await api.post("/api/auth/logout")
            assert missing_csrf.status_code == 403
            assert missing_csrf.headers["cache-control"] == "no-store"

            refresh = await api.post(
                "/api/auth/refresh",
                headers={"X-CSRF-Token": old_csrf},
            )
            assert refresh.status_code == 200
            assert refresh.headers["cache-control"] == "no-store"
            next_access = refresh.cookies["niuva_access"]
            next_refresh = refresh.cookies["niuva_refresh"]
            next_csrf = refresh.cookies["niuva_csrf"]
            assert next_refresh != old_refresh
            assert next_access != old_access

            async with httpx.AsyncClient(
                transport=transport,
                base_url="https://testserver",
            ) as replay:
                replay.cookies.set("niuva_refresh", old_refresh, path="/api/auth")
                replay.cookies.set("niuva_csrf", old_csrf, path="/")
                replayed = await replay.post(
                    "/api/auth/refresh",
                    headers={"X-CSRF-Token": old_csrf},
                )
                assert replayed.status_code == 401
                assert replayed.headers["cache-control"] == "no-store"

            api.cookies.set("niuva_refresh", next_refresh, path="/api/auth")
            api.cookies.set("niuva_csrf", next_csrf, path="/")
            revoked_family = await api.post(
                "/api/auth/refresh",
                headers={"X-CSRF-Token": next_csrf},
            )
            assert revoked_family.status_code == 401
            assert revoked_family.headers["cache-control"] == "no-store"

            old_access_result = await api.get(
                "/api/auth/me",
                headers={"Authorization": f"Bearer {old_access}"},
            )
            assert old_access_result.status_code == 401
            assert old_access_result.headers["cache-control"] == "no-store"
    finally:
        server.db = original_db


def test_cookie_session_rotation_and_replay_revocation():
    asyncio.run(run_cookie_session_rotation_contract())


async def run_login_failure_limiter_contract():
    original_db = server.db
    server.db = AuthDatabase([customer()])
    try:
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="https://testserver",
        ) as api:
            responses = []
            for _attempt in range(5):
                responses.append(
                await api.post(
                    "/api/auth/login",
                    json={
                        "email": customer()["email"],
                        "password": "WrongPassword123",
                    },
                    headers=ORIGIN,
                )
                )
            assert [response.status_code for response in responses[:4]] == [
                401,
                401,
                401,
                401,
            ]
            assert responses[4].status_code == 429
            assert int(responses[4].headers["Retry-After"]) > 0
            blocked = await api.post(
                "/api/auth/login",
                json={
                    "email": customer()["email"],
                    "password": "CookiePassword123",
                },
                headers=ORIGIN,
            )
            assert blocked.status_code == 429
            assert all(
                response.headers["cache-control"] == "no-store"
                for response in [*responses, blocked]
            )
    finally:
        server.db = original_db


def test_login_failure_limiter_is_atomic_and_returns_retry_after():
    asyncio.run(run_login_failure_limiter_contract())


async def run_customer_login_security_event_contract():
    original_db = server.db
    original_events = server.app.state.auth_security_event_service
    events = CapturingSecurityEvents()
    server.db = AuthDatabase([customer()])
    server.app.state.auth_security_event_service = events
    try:
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="https://testserver",
        ) as api:
            failed = await api.post(
                "/api/auth/login",
                json={
                    "email": customer()["email"],
                    "password": "WrongPassword123",
                },
                headers=ORIGIN,
            )
            succeeded = await api.post(
                "/api/auth/login",
                json={
                    "email": customer()["email"],
                    "password": "CookiePassword123",
                },
                headers=ORIGIN,
            )
            assert failed.status_code == 401
            assert succeeded.status_code == 200
            assert [event["event_type"] for event in events.events] == [
                "auth.login_failed",
                "auth.login_succeeded",
            ]
            failure = events.events[0]
            assert failure["subject_kind"] == "unknown_identifier"
            assert failure["unknown_identifier"] == customer()["email"]
            assert "password" not in failure
            success = events.events[1]
            assert success["known_subject_id"] == customer()["id"]
            assert "unknown_identifier" not in success
    finally:
        server.app.state.auth_security_event_service = original_events
        server.db = original_db


def test_customer_login_emits_classified_events_without_credentials():
    asyncio.run(run_customer_login_security_event_contract())


async def run_logout_fallback_contract(refresh_value):
    original_db = server.db
    database = AuthDatabase([customer()])
    server.db = database
    try:
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="https://testserver",
        ) as api:
            login = await api.post(
                "/api/auth/login",
                json={
                    "email": customer()["email"],
                    "password": "CookiePassword123",
                },
                headers=ORIGIN,
            )
            assert login.status_code == 200
            retained_refresh = login.cookies["niuva_refresh"]
            csrf = login.cookies["niuva_csrf"]
            api.cookies.delete("niuva_refresh", path="/api/auth")
            if refresh_value is not None:
                api.cookies.set(
                    "niuva_refresh",
                    refresh_value,
                    domain="testserver.local",
                    path="/api/auth",
                )

            logout = await api.post(
                "/api/auth/logout",
                headers={**ORIGIN, "X-CSRF-Token": csrf},
            )
            assert logout.status_code == 200
            assert logout.headers["cache-control"] == "no-store"
            assert logout.json() == {"ok": True}
            assert database.auth_sessions.items[0]["status"] == "revoked"
            assert database.auth_sessions.items[0]["revoke_reason"] == "logout"
            assert not {
                "niuva_access",
                "niuva_refresh",
                "niuva_csrf",
            } & set(api.cookies.keys())

            async with httpx.AsyncClient(
                transport=transport,
                base_url="https://testserver",
            ) as retained:
                retained.cookies.set(
                    "niuva_refresh",
                    retained_refresh,
                    path="/api/auth",
                )
                retained.cookies.set("niuva_csrf", csrf, path="/")
                rejected = await retained.post(
                    "/api/auth/refresh",
                    headers={"X-CSRF-Token": csrf},
                )
                assert rejected.status_code == 401
    finally:
        server.db = original_db


@pytest.mark.parametrize("refresh_value", [None, "malformed-refresh"])
def test_logout_revokes_from_access_when_refresh_is_unavailable(refresh_value):
    asyncio.run(run_logout_fallback_contract(refresh_value))


async def run_expiry_and_eligibility_contract():
    original_db = server.db
    database = AuthDatabase([customer()])
    server.db = database
    try:
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="https://testserver",
        ) as api:
            login = await api.post(
                "/api/auth/login",
                json={
                    "email": customer()["email"],
                    "password": "CookiePassword123",
                },
                headers=ORIGIN,
            )
            csrf = login.cookies["niuva_csrf"]
            database.auth_sessions.items[0]["expires_at"] = datetime.now(
                timezone.utc
            ) - timedelta(microseconds=1)

            expired_access = await api.get("/api/auth/me")
            assert expired_access.status_code == 401
            assert expired_access.json()["detail"] == "Session invalid"

            expired_refresh = await api.post(
                "/api/auth/refresh",
                headers={"X-CSRF-Token": csrf},
            )
            assert expired_refresh.status_code == 401
            assert expired_refresh.json()["detail"] == "Session invalid"

        database = AuthDatabase([customer()])
        server.db = database
        async with httpx.AsyncClient(
            transport=transport,
            base_url="https://testserver",
        ) as api:
            login = await api.post(
                "/api/auth/login",
                json={
                    "email": customer()["email"],
                    "password": "CookiePassword123",
                },
                headers=ORIGIN,
            )
            assert login.status_code == 200
            database.users.items[0]["token_version"] += 1
            stale = await api.get("/api/auth/me")
            assert stale.status_code == 401
            assert stale.json()["detail"] == "Session invalid"
    finally:
        server.db = original_db


def test_expired_and_stale_customer_sessions_fail_closed():
    asyncio.run(run_expiry_and_eligibility_contract())


async def run_concurrent_refresh_contract():
    original_db = server.db
    database = AuthDatabase([customer()])
    server.db = database
    try:
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="https://testserver",
        ) as login_api:
            login = await login_api.post(
                "/api/auth/login",
                json={
                    "email": customer()["email"],
                    "password": "CookiePassword123",
                },
                headers=ORIGIN,
            )
        refresh = login.cookies["niuva_refresh"]
        csrf = login.cookies["niuva_csrf"]

        first = httpx.AsyncClient(transport=transport, base_url="https://testserver")
        second = httpx.AsyncClient(transport=transport, base_url="https://testserver")
        try:
            for api in (first, second):
                api.cookies.set("niuva_refresh", refresh, path="/api/auth")
                api.cookies.set("niuva_csrf", csrf, path="/")
            responses = await asyncio.gather(
                first.post(
                    "/api/auth/refresh",
                    headers={"X-CSRF-Token": csrf},
                ),
                second.post(
                    "/api/auth/refresh",
                    headers={"X-CSRF-Token": csrf},
                ),
            )
        finally:
            await first.aclose()
            await second.aclose()

        assert sorted(response.status_code for response in responses) == [200, 401]
        assert database.auth_sessions.items[0]["status"] == "revoked"
        assert database.auth_sessions.items[0]["revoke_reason"] == "refresh_replay"
    finally:
        server.db = original_db


def test_concurrent_refresh_has_one_rotation_then_revokes_the_family():
    asyncio.run(run_concurrent_refresh_contract())


async def run_login_origin_and_generic_failure_contract():
    original_db = server.db
    blocked = {**customer(), "id": "blocked", "email": "blocked@example.com"}
    blocked["access_state"] = "access_review_required"
    server.db = AuthDatabase([customer(), blocked])
    try:
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="https://testserver",
        ) as api:
            payloads = (
                {
                    "email": "unknown@example.com",
                    "password": "CookiePassword123",
                },
                {
                    "email": customer()["email"],
                    "password": "WrongPassword123",
                },
                {
                    "email": blocked["email"],
                    "password": "CookiePassword123",
                },
            )
            failures = [
                await api.post("/api/auth/login", json=payload, headers=ORIGIN)
                for payload in payloads
            ]
            assert {
                (response.status_code, response.json()["detail"])
                for response in failures
            } == {(401, "Invalid email or password")}

            for headers in ({}, {"Origin": "https://evil.example"}):
                rejected = await api.post(
                    "/api/auth/login",
                    json={
                        "email": customer()["email"],
                        "password": "CookiePassword123",
                    },
                    headers=headers,
                )
                assert rejected.status_code == 403
                assert (
                    rejected.json()["detail"]["code"] == "request_verification_failed"
                )
                assert rejected.headers["cache-control"] == "no-store"
    finally:
        server.db = original_db


def test_customer_login_requires_origin_and_keeps_failures_generic():
    asyncio.run(run_login_origin_and_generic_failure_contract())


def test_production_customer_cookies_are_secure_host_only(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("AUTH_COOKIE_SECURE", "true")
    monkeypatch.setenv("AUTH_COOKIE_DOMAIN", "")
    server.validate_cookie_configuration()

    async def scenario():
        original_db = server.db
        server.db = AuthDatabase([customer()])
        try:
            transport = httpx.ASGITransport(app=server.app)
            async with httpx.AsyncClient(
                transport=transport,
                base_url="https://testserver",
            ) as api:
                response = await api.post(
                    "/api/auth/login",
                    json={
                        "email": customer()["email"],
                        "password": "CookiePassword123",
                    },
                    headers=ORIGIN,
                )
                assert response.status_code == 200
                cookies = response.headers.get_list("set-cookie")
                assert len(cookies) == 3
                assert all("Secure" in value for value in cookies)
                assert all("SameSite=lax" in value for value in cookies)
                assert all("Domain=" not in value for value in cookies)
                assert any(
                    value.startswith("niuva_access=")
                    and "HttpOnly" in value
                    and "Path=/" in value
                    for value in cookies
                )
                assert any(
                    value.startswith("niuva_refresh=")
                    and "HttpOnly" in value
                    and "Path=/api/auth" in value
                    for value in cookies
                )
                assert any(
                    value.startswith("niuva_csrf=")
                    and "HttpOnly" not in value
                    and "Path=/" in value
                    for value in cookies
                )
        finally:
            server.db = original_db

    asyncio.run(scenario())


def test_customer_cookie_domain_configuration_is_rejected(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("AUTH_COOKIE_SECURE", "true")
    monkeypatch.setenv("AUTH_COOKIE_DOMAIN", ".niuva.example")
    with pytest.raises(RuntimeError, match="host-only"):
        server.validate_cookie_configuration()
