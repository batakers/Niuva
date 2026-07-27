import os
import sys
import types
from datetime import datetime, timezone
from pathlib import Path

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

import server  # noqa: E402
from tests.auth_support import AuthCollection  # noqa: E402


class FakeCollection:
    def __init__(self, items=None):
        self.items = [dict(item) for item in (items or [])]

    @staticmethod
    def _matches(item, query):
        for key, expected in query.items():
            actual = item.get(key)
            if isinstance(expected, dict):
                if "$gt" in expected and not (actual is not None and actual > expected["$gt"]):
                    return False
                if "$gte" in expected and not (actual is not None and actual >= expected["$gte"]):
                    return False
                if "$lte" in expected and not (actual is not None and actual <= expected["$lte"]):
                    return False
                if "$in" in expected:
                    actual_values = actual if isinstance(actual, list) else [actual]
                    if not any(value in expected["$in"] for value in actual_values):
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

    async def find_one(self, query, projection=None):
        for item in self.items:
            if self._matches(item, query):
                return self._project(item, projection)
        return None

    async def insert_one(self, item):
        self.items.append(dict(item))
        return types.SimpleNamespace(inserted_id=item.get("id"))

    def find(self, query, projection=None):
        matched = [self._project(item, projection) for item in self.items if self._matches(item, query)]

        class _Cursor:
            def __init__(self, values):
                self.values = values

            def sort(self, *_args):
                return self

            def limit(self, _value):
                return self

            async def to_list(self, limit):
                return self.values[:limit]

        return _Cursor(matched)

    async def update_one(self, query, update):
        for item in self.items:
            if self._matches(item, query):
                self._apply_update(item, update)
                return types.SimpleNamespace(matched_count=1, modified_count=1)
        return types.SimpleNamespace(matched_count=0, modified_count=0)

    async def update_many(self, query, update):
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

    async def count_documents(self, query):
        return sum(1 for item in self.items if self._matches(item, query))


class FakeDatabase:
    def __init__(self, users):
        self.users = FakeCollection(users)
        self.password_reset_tokens = FakeCollection()
        self.notifications = FakeCollection()
        self.auth_sessions = AuthCollection()
        self.login_rate_limits = AuthCollection()


def bearer(token):
    return {"Authorization": f"Bearer {token}"}


def build_customer():
    return {
        "id": "customer-1", "name": "Reset Customer", "email": "reset-customer@example.com",
        "password_hash": server.hash_password("OldPassword123"),
        "phone": "", "company": "", "role": "client", "created_at": server.now_iso(),
    }


async def run_forgot_password_generic_response_and_rate_limit():
    server.db = FakeDatabase([build_customer()])
    server._rate_buckets.clear()

    transport = httpx.ASGITransport(app=server.app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        registered = await api.post("/api/auth/forgot-password", json={"email": "reset-customer@example.com"})
        unregistered = await api.post("/api/auth/forgot-password", json={"email": "no-such-user@example.com"})

        # Must not leak whether the email exists — identical response body.
        assert registered.status_code == 200
        assert unregistered.status_code == 200
        assert registered.json() == unregistered.json()

        # A token was only actually created for the registered email.
        assert len(server.db.password_reset_tokens.items) == 1

        # Rate limit: 3 requests per email/IP within the window; the 4th is rejected.
        await api.post("/api/auth/forgot-password", json={"email": "reset-customer@example.com"})
        fourth = await api.post("/api/auth/forgot-password", json={"email": "reset-customer@example.com"})
        assert fourth.status_code == 429


def test_forgot_password_never_leaks_account_existence_and_is_rate_limited():
    import asyncio
    asyncio.run(run_forgot_password_generic_response_and_rate_limit())


async def run_reset_password_lifecycle_and_session_invalidation():
    customer = build_customer()
    server.db = FakeDatabase([customer])
    server._rate_buckets.clear()

    transport = httpx.ASGITransport(app=server.app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        login_before = await api.post(
            "/api/auth/login", json={"email": customer["email"], "password": "OldPassword123"}
        )
        assert login_before.status_code == 200
        old_token = login_before.cookies["niuva_access"]
        assert (await api.get("/api/auth/me", headers=bearer(old_token))).status_code == 200

        await api.post("/api/auth/forgot-password", json={"email": customer["email"]})
        raw_token = None
        for record in server.db.password_reset_tokens.items:
            if record["user_id"] == customer["id"] and record["used_at"] is None:
                # The raw token is never persisted; recover it via the same
                # hash function the endpoint uses, from a known plaintext
                # candidate is not possible — instead exercise the real hash
                # path by minting our own token and inserting it directly,
                # mirroring exactly what forgot-password produced.
                raw_token = "test-raw-token-for-lifecycle-check"
                record["token_hash"] = server._hash_reset_token(raw_token)

        reset = await api.post(
            "/api/auth/reset-password", json={"token": raw_token, "new_password": "NewPassword456"}
        )
        assert reset.status_code == 200

        # The session issued before reset must now be rejected, even though
        # its JWT exp has not passed (DEC: invalidate sessions on reset).
        stale_session = await api.get("/api/auth/me", headers=bearer(old_token))
        assert stale_session.status_code == 401

        # Old password no longer works; new password does, and yields a
        # fresh session that is itself valid.
        old_password_login = await api.post(
            "/api/auth/login", json={"email": customer["email"], "password": "OldPassword123"}
        )
        assert old_password_login.status_code == 401
        new_login = await api.post(
            "/api/auth/login", json={"email": customer["email"], "password": "NewPassword456"}
        )
        assert new_login.status_code == 200
        assert (
            await api.get(
                "/api/auth/me",
                headers=bearer(new_login.cookies["niuva_access"]),
            )
        ).status_code == 200

        # The token cannot be replayed a second time.
        reused = await api.post(
            "/api/auth/reset-password", json={"token": raw_token, "new_password": "AnotherPassword789"}
        )
        assert reused.status_code == 400


def test_reset_password_invalidates_old_sessions_and_cannot_be_reused():
    import asyncio
    asyncio.run(run_reset_password_lifecycle_and_session_invalidation())


async def run_reset_password_rejects_unknown_or_expired_token():
    server.db = FakeDatabase([build_customer()])
    server._rate_buckets.clear()

    transport = httpx.ASGITransport(app=server.app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        unknown = await api.post(
            "/api/auth/reset-password", json={"token": "never-issued", "new_password": "SomePassword123"}
        )
        assert unknown.status_code == 400

        expired_record = {
            "id": "expired-1", "user_id": "customer-1",
            "token_hash": server._hash_reset_token("expired-raw-token"),
            "expires_at": datetime(2000, 1, 1, tzinfo=timezone.utc),
            "used_at": None, "created_at": "2000-01-01T00:00:00+00:00",
        }
        server.db.password_reset_tokens.items.append(expired_record)
        expired = await api.post(
            "/api/auth/reset-password", json={"token": "expired-raw-token", "new_password": "SomePassword123"}
        )
        assert expired.status_code == 400


def test_reset_password_rejects_unknown_or_expired_token():
    import asyncio
    asyncio.run(run_reset_password_rejects_unknown_or_expired_token())
