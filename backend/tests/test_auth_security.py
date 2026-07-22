import asyncio
import os
import sys
import types
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx
import jwt


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("MONGO_URL", "mongodb://security-test.invalid")
os.environ.setdefault("DB_NAME", "niuva_security_test")
os.environ.setdefault("JWT_SECRET", "security-test-secret-at-least-32-characters")
os.environ.setdefault("ADMIN_EMAIL", "admin@niuva.com")
os.environ.setdefault("ADMIN_PASSWORD", "AdminPassword123")


class _BootstrapMongoClient:
    def __init__(self, *_args, **_kwargs):
        pass

    def __getitem__(self, _name):
        return object()


motor_package = types.ModuleType("motor")
motor_asyncio = types.ModuleType("motor.motor_asyncio")
motor_asyncio.AsyncIOMotorClient = _BootstrapMongoClient
motor_package.motor_asyncio = motor_asyncio
sys.modules.setdefault("motor", motor_package)
sys.modules.setdefault("motor.motor_asyncio", motor_asyncio)

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
        self.organizations = FakeCollection()
        self.organization_memberships = FakeCollection()
        self.internships = FakeCollection()


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
        "roles": ["operations"],
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
        "roles": ["commercial_finance"],
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
    server.db = FakeDatabase([admin, client, other_client, editor, commercial, disabled_client])
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
        assert admin_login.json()["user"]["role_labels"] == ["Owner"]
        assert admin_login.json()["user"]["role_policy_version"] == "2026-07-22-v1"

        editor_login = await api.post(
            "/api/auth/admin/login",
            json={"email": editor["email"], "password": "EditorPassword123"},
        )
        assert editor_login.status_code == 200
        assert editor_login.json()["user"]["roles"] == ["operations"]
        assert "admin.access" in editor_login.json()["user"]["permissions"]
        assert "password_hash" not in editor_login.json()["user"]

        editor_me = await api.get(
            "/api/auth/me", headers=bearer(editor_login.json()["token"])
        )
        assert editor_me.status_code == 200
        assert editor_me.json()["roles"] == ["operations"]
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
        {"id": "operations-1", "name": "Operations", "email": "operations@niuva.example.com", "password_hash": server.hash_password("OperationsPassword123"), "roles": ["operations"], "status": "active", "access_state": "approved"},
        {"id": "commercial-1", "name": "Commercial", "email": "commercial@niuva.example.com", "password_hash": server.hash_password("CommercialPassword123"), "roles": ["commercial_finance"], "status": "active", "access_state": "approved"},
    ]
    database = FakeDatabase(users)
    database.orders.items.append({"id": "order-safe-1", "order_number": "NIV-TEST-0001", "user_id": "customer-1", "user_name": "Customer", "user_email": "customer@niuva.test", "material_id": "material-1", "material_name": "Acrylic", "file": {"storage_path": "orders/customer-1/design.pdf"}, "notes": "Fulfil before Friday", "status": "awaiting_payment", "status_history": [{"status": "pending_estimate", "at": "2026-07-22T00:00:00Z", "note": "Received"}], "estimate": {"amount": 950000, "currency": "IDR", "note": "Internal quote"}, "payment": {"proof": {"storage_path": "payments/proof.png"}, "verified": False}, "internal_price": 600000})
    database.organizations.items.append({"id": "organization-1", "name": "Fulfilment Customer", "legal_name": "PT Private Customer", "tax_id": "01.234.567.8-901.000", "status": "active"})
    database.organization_memberships.items.append({"id": "membership-1", "organization_id": "organization-1", "user_id": "customer-1", "member_role": "project_pic", "status": "active", "email": "should-not-leak@niuva.test"})
    database.internships.items.append({"id": "internship-1", "full_name": "Applicant"})
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
        operations_organizations = await api.get("/api/admin/organizations", headers=operations_headers)
        assert operations_organizations.status_code == 200
        safe_organization = operations_organizations.json()[0]
        assert set(safe_organization) == {"id", "name", "status", "memberships"}
        assert safe_organization["memberships"] == [{"id": "membership-1", "organization_id": "organization-1", "user_id": "customer-1", "member_role": "project_pic", "status": "active"}]
        commercial_organizations = await api.get("/api/admin/organizations", headers=commercial_headers)
        assert commercial_organizations.status_code == 200
        assert commercial_organizations.json()[0]["tax_id"] == "01.234.567.8-901.000"
        assert commercial_organizations.json()[0]["legal_name"] == "PT Private Customer"
        assert (await api.get("/api/admin/internships", headers=operations_headers)).status_code == 403
        assert (await api.get("/api/admin/internships", headers=commercial_headers)).status_code == 403
        assert (await api.get("/api/admin/internships", headers=owner_headers)).status_code == 200
        assert (await api.get("/api/admin/stats", headers=operations_headers)).status_code == 200
        assert (await api.get("/api/admin/stats", headers=commercial_headers)).status_code == 200


def test_admin_boundary_projections_and_capability_gates():
    asyncio.run(run_admin_boundary_projections_and_capability_gates())

def test_authentication_and_authorization_security_matrix():
    asyncio.run(run_security_matrix())

async def run_admin_stats_counts_canonical_customer_roles():
    original_db = server.db
    try:
        server.db = FakeDatabase([
            {"id": "legacy-client", "role": "client"},
            {"id": "retail-customer", "roles": ["retail_customer"], "status": "active", "access_state": "approved"},
            {"id": "organization-customer", "roles": ["organization_customer"], "status": "active", "access_state": "approved"},
        ])
        stats = await server.admin_stats({"id": "operations-1"})
        assert stats["clients"] == 3
    finally:
        server.db = original_db


def test_admin_stats_counts_legacy_and_canonical_customers():
    asyncio.run(run_admin_stats_counts_canonical_customer_roles())
