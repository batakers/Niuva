import asyncio
import copy
import os
import sys
import types
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import patch

import httpx
import jwt


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("MONGO_URL", "mongodb://security-test.invalid")
os.environ.setdefault("DB_NAME", "niuva_security_test")
os.environ.setdefault("JWT_SECRET", "security-test-secret-at-least-32-characters")
os.environ.setdefault("ADMIN_EMAIL", "admin@niuva.com")
os.environ.setdefault("ADMIN_PASSWORD", "AdminPassword123")


resend_module = types.ModuleType("resend")
resend_module.api_key = ""
resend_module.Emails = types.SimpleNamespace(send=lambda _params: {"id": "test"})
sys.modules.setdefault("resend", resend_module)

import server  # noqa: E402


class FakeCursor:
    def __init__(self, items):
        self.items = items

    def sort(self, *_args):
        return self

    async def to_list(self, _limit):
        return [dict(item) for item in self.items]


class FakeCollection:
    def __init__(self, items=None):
        self.items = [dict(item) for item in (items or [])]

    @staticmethod
    def _matches(item, query):
        for key, expected in query.items():
            if key == "$or":
                if not any(FakeCollection._matches(item, clause) for clause in expected):
                    return False
                continue
            actual = item.get(key)
            if isinstance(expected, dict) and "$in" in expected:
                actual_values = actual if isinstance(actual, list) else [actual]
                if not any(value in expected["$in"] for value in actual_values):
                    return False
            elif isinstance(expected, dict) and {"$gte", "$lte"} & expected.keys():
                # The dashboard scopes every aggregate by a date range.
                if actual is None:
                    return False
                if "$gte" in expected and actual < expected["$gte"]:
                    return False
                if "$lte" in expected and actual > expected["$lte"]:
                    return False
            elif isinstance(actual, list):
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
        return FakeCursor(
            [
                self._project(item, projection)
                for item in self.items
                if self._matches(item, query)
            ]
        )

    async def count_documents(self, query):
        return sum(1 for item in self.items if self._matches(item, query))


class FakeDatabase:
    def __init__(self, users):
        self.users = FakeCollection(users)
        self.orders = FakeCollection()
        # The dashboard scopes every aggregate by one range, so it reads the
        # canonical surfaces alongside the legacy one.
        self.retail_orders = FakeCollection()
        self.inquiries = FakeCollection()


def bearer(token):
    return {"Authorization": f"Bearer {token}"}


async def run_security_matrix():
    admin = {
        "id": "admin-1",
        "name": "Security Admin",
        "email": "admin@niuva.com",
        "password_hash": server.hash_password("AdminPassword123"),
        "phone": "",
        "company": "Niuva",
        "roles": ["super_admin"],
        "status": "active",
        "access_state": "approved",
        "created_at": server.now_iso(),
    }
    client = {
        "id": "client-1",
        "name": "Existing Client",
        "email": "client@example.com",
        "password_hash": server.hash_password("ClientPassword123"),
        "phone": "",
        "company": "Client Company",
        "role": "client",
        "created_at": server.now_iso(),
    }
    other_client = {
        "id": "client-2",
        "name": "Other Client",
        "email": "other-client@example.com",
        "password_hash": server.hash_password("OtherClientPassword123"),
        "phone": "",
        "company": "Other Company",
        "role": "client",
        "created_at": server.now_iso(),
    }
    editor = {
        "id": "staff-editor-1",
        "name": "Content Editor",
        "email": "editor@niuva.com",
        "password_hash": server.hash_password("EditorPassword123"),
        "phone": "",
        "company": "Niuva",
        "roles": ["content_editor"],
        "status": "active",
        "access_state": "approved",
        "created_at": server.now_iso(),
    }
    commercial = {
        "id": "commercial-1",
        "name": "Commercial Finance",
        "email": "commercial@example.com",
        "password_hash": server.hash_password("CommercialPassword123"),
        "phone": "",
        "company": "Niuva",
        "roles": ["order_admin", "sales_estimator", "finance"],
        "status": "active",
        "access_state": "approved",
        "created_at": server.now_iso(),
    }
    disabled_client = {
        "id": "client-disabled",
        "name": "Disabled Client",
        "email": "disabled@example.com",
        "password_hash": server.hash_password("DisabledPassword123"),
        "phone": "",
        "company": "Disabled Company",
        "role": "client",
        "status": "disabled",
        "created_at": server.now_iso(),
    }
    review_blocked_staff = {
        "id": "staff-review-blocked",
        "name": "Review Blocked Staff",
        "email": "review-blocked@example.com",
        "password_hash": server.hash_password("ReviewBlockedPassword123"),
        "roles": ["content_editor"],
        "status": "active",
        "access_state": "access_review_required",
        "created_at": server.now_iso(),
    }
    server.db = FakeDatabase(
        [
            admin,
            client,
            other_client,
            editor,
            commercial,
            disabled_client,
            review_blocked_staff,
        ]
    )
    server.db.orders.items.append(
        {
            "id": "order-1",
            "order_number": "NIV-TEST-0001",
            "user_id": client["id"],
            "user_email": client["email"],
            "user_name": client["name"],
            "status": "pending_estimate",
        }
    )

    transport = httpx.ASGITransport(app=server.app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        registration = await api.post(
            "/api/auth/register",
            json={"name": "Public User", "email": "public@example.com", "password": "Password123"},
        )
        assert registration.status_code == 403
        assert registration.json()["detail"].startswith("Public registration is disabled")
        assert await server.db.users.find_one({"email": "public@example.com"}) is None

        malformed_registration = await api.post("/api/auth/register", json={})
        assert malformed_registration.status_code == 403
        assert malformed_registration.json()["detail"].startswith("Public registration is disabled")

        admin_login = await api.post(
            "/api/auth/admin/login",
            json={"email": admin["email"], "password": "AdminPassword123"},
        )
        assert admin_login.status_code == 200
        admin_token = admin_login.json()["token"]
        assert admin_login.json()["user"]["role_labels"] == ["Super Admin"]
        assert admin_login.json()["user"]["role_policy_version"] == "2026-07-26-v2"

        editor_login = await api.post(
            "/api/auth/admin/login",
            json={"email": editor["email"], "password": "EditorPassword123"},
        )
        assert editor_login.status_code == 200
        assert editor_login.json()["user"]["roles"] == ["content_editor"]
        assert "admin.access" in editor_login.json()["user"]["permissions"]
        assert "password_hash" not in editor_login.json()["user"]

        editor_me = await api.get(
            "/api/auth/me", headers=bearer(editor_login.json()["token"])
        )
        assert editor_me.status_code == 200
        assert editor_me.json()["roles"] == ["content_editor"]
        assert "roles.manage" not in editor_me.json()["permissions"]

        commercial_login = await api.post(
            "/api/auth/admin/login",
            json={"email": commercial["email"], "password": "CommercialPassword123"},
        )
        assert commercial_login.status_code == 200
        commercial_token = commercial_login.json()["token"]

        client_admin_login = await api.post(
            "/api/auth/admin/login",
            json={"email": client["email"], "password": "ClientPassword123"},
        )
        assert client_admin_login.status_code == 403

        invalid_admin_login = await api.post(
            "/api/auth/admin/login",
            json={"email": admin["email"], "password": "WrongPassword123"},
        )
        assert invalid_admin_login.status_code == 401

        for path, email, password in (
            ("/api/auth/login", disabled_client["email"], "DisabledPassword123"),
            (
                "/api/auth/admin/login",
                review_blocked_staff["email"],
                "ReviewBlockedPassword123",
            ),
        ):
            blocked_login = await api.post(
                path,
                json={"email": email, "password": password},
            )
            assert blocked_login.status_code == 401
            assert blocked_login.json() == {"detail": "Invalid email or password"}
            assert "token" not in blocked_login.json()
            assert "access_token" not in blocked_login.cookies

        client_login = await api.post(
            "/api/auth/login",
            json={"email": client["email"], "password": "ClientPassword123"},
        )
        assert client_login.status_code == 200
        client_token = client_login.json()["token"]

        other_client_login = await api.post(
            "/api/auth/login",
            json={"email": other_client["email"], "password": "OtherClientPassword123"},
        )
        assert other_client_login.status_code == 200
        other_client_token = other_client_login.json()["token"]

        order_before_payment_lockdown = copy.deepcopy(server.db.orders.items[0])
        disabled_mutations = (
            await api.post(
                "/api/admin/orders/order-1/estimate",
                json={"amount": 250000, "note": "Legacy estimate"},
                headers=bearer(commercial_token),
            ),
            await api.post(
                "/api/orders/order-1/payment-proof",
                files={"file": ("proof.png", b"proof", "image/png")},
                headers=bearer(client_token),
            ),
            await api.post(
                "/api/admin/orders/order-1/verify-payment",
                headers=bearer(commercial_token),
            ),
        )
        for response in disabled_mutations:
            assert response.status_code == 410
            assert response.json()["detail"] == {
                "code": "legacy_manual_transfer_disabled",
                "message": "Mutasi pembayaran transfer manual baru dinonaktifkan.",
            }
        assert server.db.orders.items[0] == order_before_payment_lockdown

        payment_capabilities = await api.get(
            "/api/admin/payment-capabilities",
            headers=bearer(commercial_token),
        )
        assert payment_capabilities.status_code == 200
        assert payment_capabilities.json() == {
            "contract": "provider_neutral",
            "provider_status": "inactive",
            "manual_transfer_mutations": "disabled",
            "checkout": "inactive",
            "finance_activation": "not_approved",
        }

        assert (await api.get("/api/admin/users")).status_code == 401
        assert (await api.get("/api/admin/users", headers=bearer(client_token))).status_code == 403
        assert (await api.get("/api/admin/users", headers=bearer(admin_token))).status_code == 200
        assert (await api.get("/api/admin/users", headers=bearer(commercial_token))).status_code == 403

        assert (await api.get("/api/orders")).status_code == 401
        assert (await api.get("/api/orders", headers=bearer(client_token))).status_code == 200
        assert (await api.get("/api/orders", headers=bearer(admin_token))).status_code == 200

        assert (await api.get("/api/orders/order-1")).status_code == 401
        assert (await api.get("/api/orders/order-1", headers=bearer(client_token))).status_code == 200
        assert (
            await api.get("/api/orders/order-1", headers=bearer(other_client_token))
        ).status_code == 403
        assert (await api.get("/api/orders/order-1", headers=bearer(admin_token))).status_code == 200

        assert (await api.get("/api/files/niuva/orders/client-2/private.stl")).status_code == 401
        assert (
            await api.get(
                "/api/files/niuva/orders/client-2/private.stl",
                headers=bearer(client_token),
            )
        ).status_code == 403

        new_client_payload = {
            "name": "Provisioned Client",
            "email": "provisioned@example.com",
            "password": "Provisioned123",
        }
        assert (await api.post("/api/admin/users", json=new_client_payload)).status_code == 401
        assert (
            await api.post(
                "/api/admin/users",
                json=new_client_payload,
                headers=bearer(client_token),
            )
        ).status_code == 403
        provisioned = await api.post(
            "/api/admin/users",
            json=new_client_payload,
            headers=bearer(commercial_token),
        )
        assert provisioned.status_code == 201
        assert provisioned.json()["roles"] == ["retail_customer"]
        assert provisioned.json()["access_state"] == "approved"
        assert "password_hash" not in provisioned.json()

        assert (await api.get("/api/admin/customers")).status_code == 401
        assert (await api.get("/api/admin/customers", headers=bearer(client_token))).status_code == 403

        commercial_customers = await api.get(
            "/api/admin/customers", headers=bearer(commercial_token)
        )
        assert commercial_customers.status_code == 200
        assert {customer["email"] for customer in commercial_customers.json()} == {
            client["email"], other_client["email"], new_client_payload["email"]
        }
        assert all("password_hash" not in customer for customer in commercial_customers.json())

        invalid = await api.get("/api/auth/me", headers=bearer("not-a-token"))
        assert invalid.status_code == 401
        assert invalid.json()["detail"] == "Invalid token"

        expired_token = jwt.encode(
            {
                "sub": admin["id"],
                "email": admin["email"],
                "role": "admin",
                "type": "access",
                "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
            },
            server.JWT_SECRET,
            algorithm=server.JWT_ALGO,
        )
        expired = await api.get("/api/auth/me", headers=bearer(expired_token))
        assert expired.status_code == 401
        assert expired.json()["detail"] == "Token expired"

        missing_claim_token = jwt.encode(
            {"type": "access", "exp": datetime.now(timezone.utc) + timedelta(minutes=5)},
            server.JWT_SECRET,
            algorithm=server.JWT_ALGO,
        )
        missing_claim = await api.get("/api/auth/me", headers=bearer(missing_claim_token))
        assert missing_claim.status_code == 401
        assert missing_claim.json()["detail"] == "Invalid token"

        stale_token = server.create_token("deleted-user", "deleted@example.com", "admin")
        stale = await api.get("/api/auth/me", headers=bearer(stale_token))
        assert stale.status_code == 401
        assert stale.json()["detail"] == "User not found"

        disabled_token = server.create_token(
            disabled_client["id"], disabled_client["email"], "client"
        )
        disabled = await api.get("/api/auth/me", headers=bearer(disabled_token))
        assert disabled.status_code == 403
        assert disabled.json()["detail"] == "User account is disabled"

        forged_role_token = server.create_token(client["id"], client["email"], "admin")
        role_mismatch = await api.get("/api/admin/users", headers=bearer(forged_role_token))
        assert role_mismatch.status_code == 403


async def run_admin_boundary_projections_and_capability_gates():
    users = [
        {"id": "owner-1", "name": "Owner", "email": "owner@niuva.example.com", "password_hash": server.hash_password("OwnerPassword123"), "roles": ["super_admin"], "status": "active", "access_state": "approved"},
        {"id": "operations-1", "name": "Order Admin", "email": "operations@niuva.example.com", "password_hash": server.hash_password("OperationsPassword123"), "roles": ["order_admin"], "status": "active", "access_state": "approved"},
        {"id": "commercial-1", "name": "Finance", "email": "commercial@niuva.example.com", "password_hash": server.hash_password("CommercialPassword123"), "roles": ["finance"], "status": "active", "access_state": "approved"},
    ]
    database = FakeDatabase(users)
    database.orders.items.append({"id": "order-safe-1", "order_number": "NIV-TEST-0001", "user_id": "customer-1", "user_name": "Customer", "user_email": "customer@niuva.test", "material_id": "material-1", "material_name": "Acrylic", "file": {"storage_path": "orders/customer-1/design.pdf"}, "notes": "Fulfil before Friday", "status": "awaiting_payment", "status_history": [{"status": "pending_estimate", "at": "2026-07-22T00:00:00Z", "note": "Received"}], "estimate": {"amount": 950000, "currency": "IDR", "note": "Internal quote"}, "payment": {"proof": {"storage_path": "payments/proof.png"}, "verified": False}, "internal_price": 600000})
    server.db = database

    transport = httpx.ASGITransport(app=server.app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        async def login(email, password):
            response = await api.post("/api/auth/admin/login", json={"email": email, "password": password})
            assert response.status_code == 200, response.text
            return bearer(response.json()["token"])

        owner_headers = await login("owner@niuva.example.com", "OwnerPassword123")
        operations_headers = await login("operations@niuva.example.com", "OperationsPassword123")
        commercial_headers = await login("commercial@niuva.example.com", "CommercialPassword123")
        operations_orders = await api.get("/api/admin/orders", headers=operations_headers)
        assert operations_orders.status_code == 200
        safe_order = operations_orders.json()[0]
        assert {"id", "order_number", "user_name", "user_email", "material_id", "material_name", "file", "notes", "status", "status_history"}.issubset(safe_order)
        assert not {"estimate", "payment", "internal_price"}.intersection(safe_order)
        commercial_orders = await api.get("/api/admin/orders", headers=commercial_headers)
        assert commercial_orders.status_code == 200
        assert commercial_orders.json()[0]["payment"]["verified"] is False
        assert (await api.get("/api/admin/stats", headers=operations_headers)).status_code == 200
        assert (await api.get("/api/admin/stats", headers=commercial_headers)).status_code == 200


def test_admin_boundary_projections_and_capability_gates():
    asyncio.run(run_admin_boundary_projections_and_capability_gates())

def test_authentication_and_authorization_security_matrix():
    asyncio.run(run_security_matrix())


async def run_login_issuance_contract():
    valid_password = "ValidPassword123"
    users = [
        {
            "id": "disabled-customer",
            "email": "disabled-customer@example.com",
            "password_hash": server.hash_password(valid_password),
            "role": "client",
            "status": "disabled",
        },
        {
            "id": "disabled-staff",
            "email": "disabled-staff@niuva.com",
            "password_hash": server.hash_password(valid_password),
            "roles": ["order_admin"],
            "status": "disabled",
            "access_state": "approved",
        },
        {
            "id": "review-blocked",
            "email": "review-blocked@example.com",
            "password_hash": server.hash_password(valid_password),
            "roles": ["retail_customer"],
            "status": "active",
            "access_state": "access_review_required",
        },
        {
            "id": "missing-hash",
            "email": "missing-hash@example.com",
            "role": "client",
        },
        {
            "id": "malformed-hash",
            "email": "malformed-hash@example.com",
            "password_hash": "not-a-bcrypt-hash",
            "role": "client",
        },
        {
            "id": "legacy-admin",
            "email": "legacy-admin@niuva.com",
            "password_hash": server.hash_password(valid_password),
            "role": "admin",
        },
        {
            "id": "legacy-client",
            "name": "Legacy Client",
            "email": "legacy-client@example.com",
            "password_hash": server.hash_password(valid_password),
            "role": "client",
        },
        {
            "id": "canonical-customer",
            "name": "Canonical Customer",
            "email": "canonical-customer@example.com",
            "password_hash": server.hash_password(valid_password),
            "roles": ["retail_customer"],
            "status": "active",
            "access_state": "approved",
        },
        {
            "id": "canonical-staff",
            "name": "Canonical Staff",
            "email": "canonical-staff@niuva.com",
            "password_hash": server.hash_password(valid_password),
            # A granular role. "operations" is superseded by migration 006 and
            # no longer canonical, so an account still carrying it cannot be
            # the fixture for a successful staff login.
            "roles": ["order_admin"],
            "status": "active",
            "access_state": "approved",
        },
    ]
    server.db = FakeDatabase(users)

    invalid_cases = [
        ("/api/auth/login", "unknown@example.com", valid_password, True),
        ("/api/auth/admin/login", "unknown@example.com", valid_password, True),
        ("/api/auth/login", "legacy-client@example.com", "WrongPassword123", False),
        ("/api/auth/admin/login", "legacy-client@example.com", "WrongPassword123", False),
        ("/api/auth/login", "disabled-customer@example.com", valid_password, False),
        ("/api/auth/admin/login", "disabled-staff@niuva.com", valid_password, False),
        ("/api/auth/login", "review-blocked@example.com", valid_password, False),
        ("/api/auth/admin/login", "review-blocked@example.com", valid_password, False),
        ("/api/auth/login", "missing-hash@example.com", valid_password, True),
        ("/api/auth/admin/login", "malformed-hash@example.com", valid_password, True),
        ("/api/auth/login", "legacy-admin@niuva.com", valid_password, False),
    ]

    transport = httpx.ASGITransport(app=server.app)
    async with httpx.AsyncClient(
        transport=transport,
        base_url="http://testserver",
    ) as api:
        real_verify_password = server.verify_password
        with (
            patch.object(
                server,
                "verify_password",
                wraps=real_verify_password,
            ) as verify_mock,
            patch.object(
                server,
                "auth_response",
                wraps=server.auth_response,
            ) as response_mock,
            patch.object(
                server,
                "create_token",
                wraps=server.create_token,
            ) as token_mock,
        ):
            for endpoint, email, password, uses_dummy_hash in invalid_cases:
                verification_calls = verify_mock.call_count
                response = await api.post(
                    endpoint,
                    json={"email": email, "password": password},
                )

                assert response.status_code == 401
                assert response.json() == {"detail": "Invalid email or password"}
                assert verify_mock.call_count == verification_calls + 1
                if uses_dummy_hash:
                    assert verify_mock.call_args.args[1] == server.DUMMY_PASSWORD_HASH

            response_mock.assert_not_called()
            token_mock.assert_not_called()

        with patch.object(
            server,
            "verify_password",
            wraps=real_verify_password,
        ) as success_verify_mock:
            legacy_login = await api.post(
                "/api/auth/login",
                json={
                    "email": "legacy-client@example.com",
                    "password": valid_password,
                },
            )
            assert legacy_login.status_code == 200
            assert legacy_login.json()["user"]["roles"] == ["retail_customer"]

            canonical_login = await api.post(
                "/api/auth/login",
                json={
                    "email": "canonical-customer@example.com",
                    "password": valid_password,
                },
            )
            assert canonical_login.status_code == 200
            assert canonical_login.json()["user"]["roles"] == ["retail_customer"]

            staff_login = await api.post(
                "/api/auth/admin/login",
                json={
                    "email": "canonical-staff@niuva.com",
                    "password": valid_password,
                },
            )
            assert staff_login.status_code == 200
            assert staff_login.json()["user"]["roles"] == ["order_admin"]

            customer_admin_login = await api.post(
                "/api/auth/admin/login",
                json={
                    "email": "legacy-client@example.com",
                    "password": valid_password,
                },
            )
            assert customer_admin_login.status_code == 403
            assert customer_admin_login.json() == {
                "detail": "Permission required: admin.access"
            }
            assert success_verify_mock.call_count == 4


def test_login_issuance_is_generic_fail_closed_and_legacy_compatible():
    asyncio.run(run_login_issuance_contract())


async def run_admin_stats_counts_canonical_customer_roles():
    original_db = server.db
    try:
        registered = "2026-07-10T00:00:00+00:00"
        server.db = FakeDatabase([
            {"id": "legacy-client", "role": "client", "created_at": registered},
            {"id": "retail-customer", "roles": ["retail_customer"], "status": "active", "access_state": "approved", "created_at": registered},
            {"id": "organization-customer", "roles": ["organization_customer"], "status": "active", "access_state": "approved", "created_at": registered},
            {"id": "outside-range", "roles": ["retail_customer"], "status": "active", "access_state": "approved", "created_at": "2026-06-01T00:00:00+00:00"},
        ])
        stats = await server.admin_stats(
            date_from="2026-07-01",
            date_to="2026-07-31",
            user={"id": "operations-1"},
        )
        # A legacy marker and a canonical role each count once, and the applied
        # range governs this figure like every other on the dashboard.
        assert stats["registered_customers"] == 3
    finally:
        server.db = original_db


def test_admin_stats_counts_legacy_and_canonical_customers():
    asyncio.run(run_admin_stats_counts_canonical_customer_roles())


async def run_superseded_role_cannot_obtain_a_session():
    """An account still carrying a pre-migration role cannot sign in.

    This is the guarantee the login hardening and the granular role matrix
    produce together, and neither one states it alone. "operations" was a real
    role before migration 006 and is superseded by it, so an account that has
    not been migrated resolves to no canonical role. Issuing a session for it
    would hand out an identity the permission matrix can no longer reason
    about: every has_permission call would answer no, and the holder would see
    an empty, inexplicable admin shell.

    Refusing is the safe direction. The account is not broken, it is unmigrated.
    """
    valid_password = "SupersededPassword123"
    original_db = server.db
    try:
        server.db = FakeDatabase(
            [
                {
                    "id": "unmigrated-staff",
                    "name": "Unmigrated Staff",
                    "email": "unmigrated-staff@niuva.com",
                    "password_hash": server.hash_password(valid_password),
                    "roles": ["operations"],
                    "status": "active",
                    "access_state": "approved",
                    "created_at": server.now_iso(),
                }
            ]
        )
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://testserver"
        ) as api:
            for path in ("/api/auth/login", "/api/auth/admin/login"):
                response = await api.post(
                    path,
                    json={
                        "email": "unmigrated-staff@niuva.com",
                        "password": valid_password,
                    },
                )
                assert response.status_code == 401, path
                # Generic, like every other refusal: the response must not
                # reveal that this address exists but is unmigrated.
                assert response.json() == {"detail": "Invalid email or password"}
    finally:
        server.db = original_db


def test_a_superseded_role_cannot_obtain_a_session():
    asyncio.run(run_superseded_role_cannot_obtain_a_session())
