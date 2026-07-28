import os
import sys
import types
from pathlib import Path

import httpx


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


class AuthDatabase:
    def __init__(self, users):
        self.users = AuthCollection([
            {"role_policy_version": server.ROLE_POLICY_VERSION, **user}
            for user in users
        ])
        self.auth_sessions = AuthCollection()
        self.login_rate_limits = AuthCollection()


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
            base_url="http://testserver",
        ) as api:
            login = await api.post(
                "/api/auth/login",
                json={
                    "email": customer()["email"],
                    "password": "CookiePassword123",
                },
            )
            assert login.status_code == 200
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

            refresh = await api.post(
                "/api/auth/refresh",
                headers={"X-CSRF-Token": old_csrf},
            )
            assert refresh.status_code == 200
            next_access = refresh.cookies["niuva_access"]
            next_refresh = refresh.cookies["niuva_refresh"]
            next_csrf = refresh.cookies["niuva_csrf"]
            assert next_refresh != old_refresh
            assert next_access != old_access

            async with httpx.AsyncClient(
                transport=transport,
                base_url="http://testserver",
            ) as replay:
                replay.cookies.set("niuva_refresh", old_refresh, path="/api/auth")
                replay.cookies.set("niuva_csrf", old_csrf, path="/")
                replayed = await replay.post(
                    "/api/auth/refresh",
                    headers={"X-CSRF-Token": old_csrf},
                )
                assert replayed.status_code == 401

            api.cookies.set("niuva_refresh", next_refresh, path="/api/auth")
            api.cookies.set("niuva_csrf", next_csrf, path="/")
            revoked_family = await api.post(
                "/api/auth/refresh",
                headers={"X-CSRF-Token": next_csrf},
            )
            assert revoked_family.status_code == 401

            old_access_result = await api.get(
                "/api/auth/me",
                headers={"Authorization": f"Bearer {old_access}"},
            )
            assert old_access_result.status_code == 401
    finally:
        server.db = original_db


def test_cookie_session_rotation_and_replay_revocation():
    import asyncio

    asyncio.run(run_cookie_session_rotation_contract())


async def run_login_failure_limiter_contract():
    original_db = server.db
    server.db = AuthDatabase([customer()])
    try:
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as api:
            responses = []
            for _attempt in range(5):
                responses.append(
                    await api.post(
                        "/api/auth/login",
                        json={
                            "email": customer()["email"],
                            "password": "DefinitelyWrong123",
                        },
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
            )
            assert blocked.status_code == 429
    finally:
        server.db = original_db


def test_login_failure_limiter_is_atomic_and_returns_retry_after():
    import asyncio

    asyncio.run(run_login_failure_limiter_contract())
