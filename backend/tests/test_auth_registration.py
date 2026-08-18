from __future__ import annotations

import asyncio
import copy
import os
import re
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

import httpx
import pytest
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("MONGO_URL", "mongodb://customer-registration-test.invalid")
os.environ.setdefault("DB_NAME", "niuva_customer_registration_test")
os.environ.setdefault("JWT_SECRET", "customer-registration-test-secret-at-least-32-characters")
os.environ.setdefault("ADMIN_EMAIL", "admin@niuva.com")
os.environ.setdefault("ADMIN_PASSWORD", "AdminPassword123")

import server  # noqa: E402


class FakeResult:
    def __init__(self, *, matched_count=0, modified_count=0, inserted_id=None):
        self.matched_count = matched_count
        self.modified_count = modified_count
        self.inserted_id = inserted_id


class FakeCollection:
    def __init__(self, items=None):
        self.items = [dict(item) for item in (items or [])]

    @classmethod
    def matches(cls, item, query):
        for key, expected in query.items():
            if key == "$or":
                if not any(cls.matches(item, branch) for branch in expected):
                    return False
                continue
            actual = item.get(key)
            if isinstance(expected, dict):
                if "$gt" in expected and not (actual is not None and actual > expected["$gt"]):
                    return False
                if "$lte" in expected and not (actual is not None and actual <= expected["$lte"]):
                    return False
                if "$exists" in expected and ((key in item) != expected["$exists"]):
                    return False
                continue
            if actual != expected:
                return False
        return True

    @staticmethod
    def project(item, projection):
        result = dict(item)
        if projection:
            for key, include in projection.items():
                if include == 0:
                    result.pop(key, None)
        return result

    async def find_one(self, query, projection=None, **_options):
        for item in self.items:
            if self.matches(item, query):
                return self.project(item, projection)
        return None

    async def insert_one(self, item, **_options):
        if "email" in item and any(existing.get("email") == item["email"] for existing in self.items):
            raise DuplicateKeyError("users.email")
        if "token_hash" in item and any(existing.get("token_hash") == item["token_hash"] for existing in self.items):
            raise DuplicateKeyError("token_hash")
        if "state_hash" in item and any(existing.get("state_hash") == item["state_hash"] for existing in self.items):
            raise DuplicateKeyError("state_hash")
        self.items.append(dict(item))
        return FakeResult(inserted_id=item.get("id"))

    @staticmethod
    def apply_update(item, update):
        item.update(update.get("$setOnInsert", {}))
        item.update(update.get("$set", {}))
        for key, amount in update.get("$inc", {}).items():
            item[key] = item.get(key, 0) + amount

    async def update_one(self, query, update, **_options):
        for item in self.items:
            if self.matches(item, query):
                self.apply_update(item, update)
                return FakeResult(matched_count=1, modified_count=1)
        return FakeResult()

    async def update_many(self, query, update, **_options):
        matched = 0
        for item in self.items:
            if self.matches(item, query):
                self.apply_update(item, update)
                matched += 1
        return FakeResult(matched_count=matched, modified_count=matched)

    async def find_one_and_update(self, query, update, upsert=False, return_document=None, **_options):
        for item in self.items:
            if self.matches(item, query):
                before = dict(item)
                self.apply_update(item, update)
                return dict(item) if return_document == ReturnDocument.AFTER else before
        if not upsert:
            return None
        item = {key: value for key, value in query.items() if not key.startswith("$") and not isinstance(value, dict)}
        self.apply_update(item, update)
        self.items.append(item)
        return dict(item) if return_document == ReturnDocument.AFTER else None


class FakeDatabase:
    def __init__(self):
        self.users = FakeCollection()
        self.customer_registration_tokens = FakeCollection()
        self.auth_oidc_states = FakeCollection()
        self.auth_identities = FakeCollection()
        self.public_rate_limits = FakeCollection()
        self.login_rate_limits = FakeCollection()
        self.auth_sessions = FakeCollection()


class TransactionGuard:
    def __init__(self, database, *, unavailable=False):
        self.database = database
        self.unavailable = unavailable

    async def run(self, callback, *, operation_name, **_options):
        del operation_name
        if self.unavailable:
            from transaction_execution import TransactionUnavailableError

            raise TransactionUnavailableError()
        snapshot = {
            name: copy.deepcopy(value.items)
            for name, value in vars(self.database).items()
            if isinstance(value, FakeCollection)
        }
        try:
            return await callback(object())
        except BaseException:
            for name, items in snapshot.items():
                getattr(self.database, name).items = items
            raise


def run(coro):
    return asyncio.run(coro)


async def request_client(database, *, email_sender):
    original_db = server.db
    original_guard = server.app.state.transaction_guard
    original_security_service = server.app.state.auth_security_event_service
    original_sender = server.emailer.send_email
    server.db = database
    server.app.state.transaction_guard = TransactionGuard(database)
    server.app.state.auth_security_event_service = None

    async def send_email(*args, **kwargs):
        email_sender.append({"args": args, "kwargs": kwargs})
        return {"status": "sent"}

    server.emailer.send_email = send_email
    transport = httpx.ASGITransport(app=server.app)
    client = httpx.AsyncClient(transport=transport, base_url="https://testserver")
    return client, (original_db, original_guard, original_security_service, original_sender)


async def restore_client(client, state):
    await client.aclose()
    original_db, original_guard, original_security_service, original_sender = state
    server.db = original_db
    server.app.state.transaction_guard = original_guard
    server.app.state.auth_security_event_service = original_security_service
    server.emailer.send_email = original_sender


@pytest.fixture
def registration_env(monkeypatch):
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("PUBLIC_SITE_URL", "https://testserver")
    monkeypatch.setenv("CUSTOMER_REGISTRATION_ENABLED", "true")
    monkeypatch.setenv("CUSTOMER_GOOGLE_OIDC_ENABLED", "false")
    monkeypatch.setenv("AUTH_ARGON2_WRITES_ENABLED", "true")
    monkeypatch.setenv(
        "AUTH_PASSWORD_BLOCKLIST_PATH",
        str(BACKEND_DIR / "config" / "password-blocklist.development.txt"),
    )


def test_registration_requires_consent_and_is_disabled_by_default(monkeypatch):
    async def scenario():
        database = FakeDatabase()
        sent = []
        client, state = await request_client(database, email_sender=sent)
        try:
            monkeypatch.setenv("APP_ENV", "test")
            monkeypatch.setenv("PUBLIC_SITE_URL", "https://testserver")
            monkeypatch.setenv("CUSTOMER_REGISTRATION_ENABLED", "false")
            disabled = await client.post(
                "/api/auth/register",
                json={"name": "Test Customer", "email": "test@example.com", "password": "a" * 15, "privacy_consent": True},
                headers={"Origin": "https://testserver"},
            )
            assert disabled.status_code == 503
            monkeypatch.setenv("CUSTOMER_REGISTRATION_ENABLED", "true")
            missing = await client.post(
                "/api/auth/register",
                json={"name": "Test Customer", "email": "test@example.com", "password": "a" * 15},
                headers={"Origin": "https://testserver"},
            )
            assert missing.status_code == 422
            assert database.users.items == []
        finally:
            await restore_client(client, state)

    run(scenario())


def test_registration_persists_pending_user_and_verifies_once(monkeypatch, registration_env):
    async def scenario():
        database = FakeDatabase()
        sent = []
        client, state = await request_client(database, email_sender=sent)
        try:
            response = await client.post(
                "/api/auth/register",
                json={
                    "name": "Test Customer",
                    "email": "Test@example.com",
                    "password": "a" * 15,
                    "privacy_consent": True,
                    "return_to": "/orders/order-7?tab=history",
                },
                headers={"Origin": "https://testserver"},
            )
            assert response.status_code == 200
            assert response.json()["status"] == "verification_pending"
            assert len(database.users.items) == 1
            assert database.users.items[0]["status"] == "pending_verification"
            assert database.users.items[0]["access_state"] == "verification_pending"
            assert database.users.items[0]["email"] == "test@example.com"
            assert len(database.customer_registration_tokens.items) == 1
            assert len(sent) == 1
            body = sent[0]["args"][3]
            match = re.search(r"https://testserver/register/verify\?token=[^\"<]+", body)
            assert match is not None
            token = parse_qs(urlsplit(match.group(0)).query)["token"][0]

            verified = await client.post(
                "/api/auth/register/verify",
                json={"token": token},
                headers={"Origin": "https://testserver"},
            )
            assert verified.status_code == 200
            assert verified.json()["status"] == "verified"
            assert verified.json()["return_to"] == "/orders/order-7"
            assert database.users.items[0]["status"] == "active"
            assert database.users.items[0]["access_state"] == "approved"
            assert database.users.items[0]["email_verified_at"] is not None

            replay = await client.post(
                "/api/auth/register/verify",
                json={"token": token},
                headers={"Origin": "https://testserver"},
            )
            assert replay.status_code == 400
            assert len(database.auth_sessions.items) == 0
        finally:
            await restore_client(client, state)

    run(scenario())


def test_registration_resend_supersedes_active_token_and_keeps_generic_response(monkeypatch, registration_env):
    async def scenario():
        database = FakeDatabase()
        sent = []
        client, state = await request_client(database, email_sender=sent)
        try:
            payload = {"name": "Test Customer", "email": "resend@example.com", "password": "a" * 15, "privacy_consent": True}
            first = await client.post("/api/auth/register", json=payload, headers={"Origin": "https://testserver"})
            assert first.status_code == 200
            resend = await client.post("/api/auth/register/resend", json={"email": payload["email"]}, headers={"Origin": "https://testserver"})
            assert resend.status_code == 200
            assert resend.json()["status"] == "verification_pending"
            assert len(database.customer_registration_tokens.items) == 2
            assert sum(1 for item in database.customer_registration_tokens.items if item["active"]) == 1
            assert database.customer_registration_tokens.items[0]["active"] is False
            assert len(sent) == 2
        finally:
            await restore_client(client, state)

    run(scenario())


def test_registration_fails_closed_when_transaction_guard_is_unavailable(monkeypatch, registration_env):
    async def scenario():
        database = FakeDatabase()
        sent = []
        client, state = await request_client(database, email_sender=sent)
        server.app.state.transaction_guard = TransactionGuard(database, unavailable=True)
        try:
            response = await client.post(
                "/api/auth/register",
                json={"name": "Test Customer", "email": "blocked@example.com", "password": "a" * 15, "privacy_consent": True},
                headers={"Origin": "https://testserver"},
            )
            assert response.status_code == 503
            assert database.users.items == []
            assert database.customer_registration_tokens.items == []
        finally:
            await restore_client(client, state)

    run(scenario())
