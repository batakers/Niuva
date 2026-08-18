from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("MONGO_URL", "mongodb://customer-google-test.invalid")
os.environ.setdefault("DB_NAME", "niuva_customer_google_test")
os.environ.setdefault("JWT_SECRET", "customer-google-test-secret-at-least-32-characters")
os.environ.setdefault("ADMIN_EMAIL", "admin@niuva.com")
os.environ.setdefault("ADMIN_PASSWORD", "AdminPassword123")

import server  # noqa: E402
from tests.test_auth_registration import FakeDatabase, TransactionGuard  # noqa: E402


def run(coro):
    return asyncio.run(coro)


def test_registration_return_allowlist_and_pkce_are_bounded():
    assert server._safe_registration_return("/dashboard") == "/dashboard"
    assert server._safe_registration_return("/orders/order-1?tab=history") == "/orders/order-1"
    assert server._safe_registration_return("/retail/products/pla-1") == "/retail/products/pla-1"
    assert server._safe_registration_return("https://evil.example/steal") == "/dashboard"
    assert server._safe_registration_return("//evil.example/steal") == "/dashboard"
    assert len(server._pkce_challenge("verifier-value")) == 43


def test_google_failures_return_to_the_owning_auth_surface():
    registration = server._google_failure_redirect(
        {"intent": "register", "return_to": "/orders/order-1?tab=history"},
        "google_state_invalid",
    )
    assert registration.status_code == 303
    assert registration.headers["location"] == (
        "/register?return_to=%2Forders%2Forder-1&auth=google_state_invalid"
    )

    login = server._google_failure_redirect(
        {"intent": "login", "return_to": "/dashboard"},
        "google_verification_failed",
    )
    assert login.headers["location"] == (
        "/login?return_to=%2Fdashboard&auth=google_verification_failed"
    )


def test_google_provider_configuration_is_fail_closed(monkeypatch):
    monkeypatch.setenv("CUSTOMER_GOOGLE_OIDC_ENABLED", "true")
    monkeypatch.delenv("GOOGLE_OIDC_CLIENT_ID", raising=False)
    monkeypatch.delenv("GOOGLE_OIDC_CLIENT_SECRET", raising=False)
    monkeypatch.delenv("GOOGLE_OIDC_REDIRECT_URI", raising=False)
    assert server._google_oidc_config() is None

    monkeypatch.setenv("GOOGLE_OIDC_CLIENT_ID", "client-id")
    monkeypatch.setenv("GOOGLE_OIDC_CLIENT_SECRET", "client-secret")
    monkeypatch.setenv("GOOGLE_OIDC_REDIRECT_URI", "http://localhost/callback")
    assert server._google_oidc_config() is None


def test_google_identity_never_merges_existing_email_silently(monkeypatch):
    async def scenario():
        database = FakeDatabase()
        database.users.items.append(
            {
                "id": "customer-1",
                "name": "Existing Customer",
                "email": "existing@example.com",
                "status": "active",
                "access_state": "approved",
                "password_hash": "existing-hash",
            }
        )
        original_db = server.db
        original_guard = server.app.state.transaction_guard
        server.db = database
        server.app.state.transaction_guard = TransactionGuard(database)
        try:
            user, failure = await server._resolve_google_identity(
                {"sub": "google-sub-1", "email": "existing@example.com", "name": "Existing Customer"},
                {"intent": "register", "privacy_consent": True},
            )
            assert user is None
            assert failure == "google_link_required"
            assert database.auth_identities.items == []
        finally:
            server.db = original_db
            server.app.state.transaction_guard = original_guard

    run(scenario())


def test_google_registration_requires_consent_and_persists_subject_identity():
    async def scenario():
        database = FakeDatabase()
        original_db = server.db
        original_guard = server.app.state.transaction_guard
        server.db = database
        server.app.state.transaction_guard = TransactionGuard(database)
        try:
            no_consent, failure = await server._resolve_google_identity(
                {"sub": "google-sub-2", "email": "new@example.com", "name": "New Customer"},
                {"intent": "register", "privacy_consent": False},
            )
            assert no_consent is None
            assert failure == "google_consent_required"
            user, failure = await server._resolve_google_identity(
                {"sub": "google-sub-2", "email": "new@example.com", "name": "New Customer"},
                {"intent": "register", "privacy_consent": True},
            )
            assert failure is None
            assert user["status"] == "active"
            assert user["access_state"] == "approved"
            assert user["registration_source"] == "google"
            assert database.auth_identities.items[0]["provider"] == "google"
            assert database.auth_identities.items[0]["subject"] == "google-sub-2"
        finally:
            server.db = original_db
            server.app.state.transaction_guard = original_guard

    run(scenario())
