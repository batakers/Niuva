import asyncio
import copy
import hashlib
import importlib.util
import os
import sys
import types
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx
import pytest

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("MONGO_URL", "mongodb://identity-test.invalid")
os.environ.setdefault("DB_NAME", "niuva_identity_test")
os.environ.setdefault("JWT_SECRET", "identity-test-secret-at-least-32-characters")
os.environ.setdefault("ADMIN_EMAIL", "admin@niuva.com")
os.environ.setdefault("ADMIN_PASSWORD", "AdminPassword123")
os.environ.setdefault("PUBLIC_SITE_URL", "https://testserver")
os.environ.setdefault(
    "AUTH_SESSION_CSRF_KEY", "identity-test-csrf-key-at-least-32-bytes"
)


resend_module = types.ModuleType("resend")
resend_module.api_key = ""
resend_module.Emails = types.SimpleNamespace(send=lambda _params: {"id": "test"})
sys.modules.setdefault("resend", resend_module)

import server  # noqa: E402
from tests.auth_support import AuthCollection  # noqa: E402

REAL_TRANSACTION_GUARD = server.app.state.transaction_guard
ORIGIN = {"Origin": "https://testserver"}


def configure_password_writes(monkeypatch, tmp_path, *, enabled):
    blocklist = tmp_path / "identity-password-blocklist.txt"
    blocklist.write_text("known compromised phrase\n", encoding="utf-8")
    monkeypatch.setenv("AUTH_PASSWORD_BLOCKLIST_PATH", str(blocklist))
    monkeypatch.setenv("AUTH_ARGON2_WRITES_ENABLED", "true" if enabled else "false")


def test_development_password_blocklist_resolves_from_backend_root(monkeypatch):
    monkeypatch.setenv(
        "AUTH_PASSWORD_BLOCKLIST_PATH",
        "config/password-blocklist.development.txt",
    )

    passwords = server.get_password_module()

    assert passwords.blocklist.contains("adminpassword") is True


def test_bootstrap_rejects_an_unusable_admin_email_before_writing(monkeypatch):
    database = FakeDatabase([])
    original_database = server.db
    server.db = database
    monkeypatch.setenv("ADMIN_EMAIL", "admin@example.test")
    try:
        with pytest.raises(RuntimeError, match="ADMIN_EMAIL must be a valid email"):
            asyncio.run(server.seed())
    finally:
        server.db = original_database

    assert database.users.items == []


def test_settings_schema_rejects_unsafe_public_links_and_invalid_email():
    payload = {
        "expected_version": 1,
        "reason": "Update public contact profile",
        "legal_name": "PT Niuva Inovasi Utama",
        "email": "hello@example.com",
    }
    with pytest.raises(server.ValidationError):
        server.SettingsReq(**{**payload, "maps_url": "javascript:alert(1)"})
    with pytest.raises(server.ValidationError):
        server.SettingsReq(**{**payload, "email": "not-an-email"})


class FakeCursor:
    def __init__(self, items):
        self.items = [dict(item) for item in items]
        self._position = 0

    def sort(self, key, direction):
        self.items.sort(key=lambda item: item.get(key, ""), reverse=direction < 0)
        return self

    def limit(self, value):
        self.items = self.items[:value]
        return self

    async def to_list(self, limit):
        return [dict(item) for item in self.items[:limit]]

    def __aiter__(self):
        self._position = 0
        return self

    async def __anext__(self):
        if self._position >= len(self.items):
            raise StopAsyncIteration
        item = dict(self.items[self._position])
        self._position += 1
        return item


class FakeCollection:
    def __init__(self, items=None):
        self.items = [dict(item) for item in (items or [])]
        self.indexes = []
        self.operations = []
        self.fail_inserts = False

    @classmethod
    def _matches(cls, item, query):
        for key, expected in query.items():
            if key == "$or":
                if not any(cls._matches(item, branch) for branch in expected):
                    return False
                continue

            actual = item.get(key)
            if isinstance(expected, dict):
                if "$exists" in expected and (key in item) != expected["$exists"]:
                    return False
                if "$ne" in expected and actual == expected["$ne"]:
                    return False
                if "$in" in expected and actual not in expected["$in"]:
                    return False
                if "$gt" in expected and not actual > expected["$gt"]:
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

    async def find_one(self, query, projection=None, **options):
        self.operations.append(("find_one", dict(options)))
        for item in self.items:
            if self._matches(item, query):
                return self._project(item, projection)
        return None

    def find(self, query, projection=None, **options):
        self.operations.append(("find", dict(options)))
        return FakeCursor(
            self._project(item, projection)
            for item in self.items
            if self._matches(item, query)
        )

    async def insert_one(self, item, **options):
        self.operations.append(("insert_one", dict(options)))
        if self.fail_inserts:
            raise RuntimeError("forced audit insert failure")
        self.items.append(dict(item))
        return types.SimpleNamespace(inserted_id=item.get("id"))

    async def update_one(self, query, update, **options):
        self.operations.append(("update_one", dict(options)))
        for item in self.items:
            if self._matches(item, query):
                item.update(update.get("$set", {}))
                for key in update.get("$unset", {}):
                    item.pop(key, None)
                for key, value in update.get("$inc", {}).items():
                    item[key] = item.get(key, 0) + value
                return types.SimpleNamespace(matched_count=1, modified_count=1)
        if options.get("upsert"):
            item = {
                key: value
                for key, value in query.items()
                if not isinstance(value, dict) and not key.startswith("$")
            }
            item.update(update.get("$setOnInsert", {}))
            item.update(update.get("$set", {}))
            for key, value in update.get("$inc", {}).items():
                item[key] = item.get(key, 0) + value
            self.items.append(item)
            return types.SimpleNamespace(
                matched_count=0, modified_count=0, upserted_id=item.get("key")
            )
        return types.SimpleNamespace(matched_count=0, modified_count=0)

    async def update_many(self, query, update, **options):
        self.operations.append(("update_many", dict(options)))
        modified_count = 0
        for item in self.items:
            if self._matches(item, query):
                item.update(update.get("$set", {}))
                for key in update.get("$unset", {}):
                    item.pop(key, None)
                modified_count += 1
        return types.SimpleNamespace(
            matched_count=modified_count, modified_count=modified_count
        )

    async def count_documents(self, query, **options):
        self.operations.append(("count_documents", dict(options)))
        return sum(1 for item in self.items if self._matches(item, query))

    async def create_index(self, keys, **options):
        self.indexes.append((keys, dict(options)))
        return str(keys)


class FakeDatabase:
    def __init__(self, users):
        for user in users:
            user.setdefault("role_policy_version", server.ROLE_POLICY_VERSION)
            user.setdefault("token_version", 0)
        self.users = FakeCollection(users)
        self.login_rate_limits = AuthCollection()
        self.auth_sessions = AuthCollection()
        self.audit_events = FakeCollection()
        self.admin_sessions = FakeCollection()
        self.staff_invitations = FakeCollection()
        self.identity_policy_state = FakeCollection()
        self.organizations = FakeCollection()
        self.organization_memberships = FakeCollection()
        self.materials = FakeCollection()
        self.orders = FakeCollection()
        self.portfolio = FakeCollection()
        self.portfolio_revisions = FakeCollection()
        self.contacts = FakeCollection()
        self.settings = FakeCollection()
        self.file_objects = FakeCollection()


class FakeTransactionGuard:
    def __init__(self, database):
        self.database = database
        self.calls = []
        self.session = object()
        self._lock = asyncio.Lock()

    async def run(self, callback, *, operation_name, retry_safe=False):
        self.calls.append((operation_name, retry_safe))
        async with self._lock:
            snapshots = {
                name: copy.deepcopy(collection.items)
                for name, collection in vars(self.database).items()
                if isinstance(collection, FakeCollection)
            }
            try:
                return await callback(self.session)
            except BaseException:
                for name, items in snapshots.items():
                    getattr(self.database, name).items = items
                raise


class FakeAdminSessionModule:
    def __init__(self, database):
        self.database = database
        self.counter = 0

    async def create_admin_session(self, user, remember_me, _request_context):
        self.counter += 1
        now = datetime.now(timezone.utc)
        grant = types.SimpleNamespace(
            session_id=f"identity-session-{self.counter}",
            user_id=user["id"],
            access_secret=f"identity-access-{self.counter}",
            session_secret=f"identity-refresh-{self.counter}",
            csrf_token=f"identity-csrf-{self.counter}",
            access_expires_at=now + timedelta(minutes=15),
            idle_expires_at=now + timedelta(minutes=30),
            absolute_expires_at=now + timedelta(hours=8),
            remember_me=remember_me,
        )
        self.database.admin_sessions.items.append(
            {
                "id": grant.session_id,
                "user_id": user["id"],
                "access_secret": grant.access_secret,
                "csrf_token": grant.csrf_token,
                "revoked_at": None,
                "revocation_reason": None,
            }
        )
        return grant

    async def authenticate_admin_session(self, request_context):
        record = await self.database.admin_sessions.find_one(
            {
                "access_secret": request_context.get("access_secret"),
                "revoked_at": None,
            }
        )
        if not record:
            raise server.SessionExpiredError()
        return types.SimpleNamespace(
            session_id=record["id"],
            user_id=record["user_id"],
            _csrf_token=record["csrf_token"],
        )

    async def revoke_admin_session(self, session, reason):
        result = await self.database.admin_sessions.update_one(
            {"id": session.session_id, "revoked_at": None},
            {
                "$set": {
                    "revoked_at": datetime.now(timezone.utc),
                    "revocation_reason": reason,
                }
            },
        )
        return result.modified_count == 1

    def verify_csrf(self, session, candidate):
        if candidate != session._csrf_token:
            raise server.RequestVerificationError()


class AdminApi:
    def __init__(self, transport, session_module):
        self.api = httpx.AsyncClient(transport=transport, base_url="https://testserver")
        self.session_module = session_module
        self.csrf = None

    async def authorize(self, user):
        grant = await self.session_module.create_admin_session(user, False, {})
        self.api.cookies.set(server.ACCESS_COOKIE_NAME, grant.access_secret)
        self.api.cookies.set(server.SESSION_COOKIE_NAME, grant.session_secret)
        self.csrf = grant.csrf_token
        return grant

    async def request(self, method, path, **kwargs):
        headers = dict(kwargs.pop("headers", {}))
        if method.upper() not in {"GET", "HEAD", "OPTIONS"}:
            headers.update(ORIGIN)
            headers["X-CSRF-Token"] = self.csrf
        return await self.api.request(method, path, headers=headers, **kwargs)

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_args):
        await self.api.aclose()


def install_fake_admin_sessions(database):
    module = FakeAdminSessionModule(database)
    server.app.state.admin_session_module = module
    return module


def bearer(token):
    return {"Authorization": f"Bearer {token}"}


def make_user(user_id, email, roles, *, status="active"):
    return {
        "id": user_id,
        "name": email.split("@", 1)[0].replace(".", " ").title(),
        "email": email,
        "password_hash": "not-returned",
        "roles": list(roles),
        "status": status,
        "access_state": "approved",
        "created_at": "2026-07-14T00:00:00+00:00",
    }


async def run_staff_access_matrix():
    super_admin = make_user("admin-1", "admin@niuva.com", ["super_admin"])
    manager = make_user("manager-1", "manager@niuva.com", ["manager_approver"])
    warehouse = make_user("warehouse-1", "warehouse@niuva.com", ["warehouse"])
    customer = make_user("user-2", "customer@example.com", ["retail_customer"])
    db = FakeDatabase([super_admin, manager, warehouse, customer])
    server.db = db
    server.app.state.transaction_guard = FakeTransactionGuard(db)
    guard = FakeTransactionGuard(db)
    server.app.state.transaction_guard = guard
    session_module = install_fake_admin_sessions(db)

    transport = httpx.ASGITransport(app=server.app)
    async with (
        AdminApi(transport, session_module) as owner_api,
        AdminApi(transport, session_module) as manager_api,
        AdminApi(transport, session_module) as warehouse_api,
    ):
        await owner_api.authorize(super_admin)
        await manager_api.authorize(manager)
        await warehouse_api.authorize(warehouse)
        denied_response = await warehouse_api.request("GET", "/api/admin/users")
        assert denied_response.status_code == 403

        manager_users = await manager_api.request("GET", "/api/admin/users")
        assert manager_users.status_code == 403
        owner_users = await owner_api.request("GET", "/api/admin/users")
        assert owner_users.status_code == 200
        assert all("password_hash" not in user for user in owner_users.json())


def test_staff_access_routes_enforce_permissions_and_audit():
    try:
        asyncio.run(run_staff_access_matrix())
    finally:
        server.app.state.transaction_guard = REAL_TRANSACTION_GUARD


def load_identity_migration():
    migration_path = BACKEND_DIR / "migrations" / "001_identity_rbac_audit.py"
    spec = importlib.util.spec_from_file_location(
        "identity_rbac_migration", migration_path
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


async def run_migration_matrix():
    migration = load_identity_migration()
    legacy_admin = {
        "id": "legacy-admin",
        "email": "legacy-admin@niuva.com",
        "role": "admin",
    }
    legacy_client = {
        "id": "legacy-client",
        "email": "legacy-client@example.com",
        "role": "client",
        "status": "disabled",
    }
    canonical_user = make_user(
        "canonical-user",
        "canonical@example.com",
        ["retail_customer"],
    )
    db = FakeDatabase([legacy_admin, legacy_client, canonical_user])

    dry_run = await migration.migrate(db, dry_run=True)
    assert dry_run == {"scanned": 2, "updated": 2, "dry_run": True}
    assert "roles" not in db.users.items[0]

    first_apply = await migration.migrate(db, dry_run=False)
    assert first_apply == {"scanned": 2, "updated": 2, "dry_run": False}
    assert db.users.items[0]["roles"] == ["super_admin"]
    assert db.users.items[0]["status"] == "active"
    assert db.users.items[1]["roles"] == ["retail_customer"]
    assert db.users.items[1]["status"] == "disabled"

    second_apply = await migration.migrate(db, dry_run=False)
    assert second_apply == {"scanned": 0, "updated": 0, "dry_run": False}

    index_summary = await migration.ensure_indexes(db)
    assert index_summary == {"indexes_ensured": 12}
    assert ("id", {"unique": True}) in db.organizations.indexes
    assert (
        [("organization_id", 1), ("user_id", 1)],
        {"unique": True},
    ) in db.organization_memberships.indexes


def test_identity_migration_is_dry_run_safe_and_idempotent():
    asyncio.run(run_migration_matrix())


async def run_staff_invitation_and_access_lifecycle():
    owner = make_user("owner-lifecycle", "owner-lifecycle@niuva.com", ["super_admin"])
    owner["password_hash"] = server.hash_password("OwnerLifecycle123")
    warehouse = make_user(
        "warehouse-lifecycle", "warehouse-lifecycle@niuva.com", ["warehouse"]
    )
    warehouse["password_hash"] = server.hash_password("WarehouseLifecycle123")
    customer = make_user(
        "customer-lifecycle", "customer-lifecycle@example.com", ["retail_customer"]
    )
    database = FakeDatabase([owner, warehouse, customer])
    server.db = database
    guard = FakeTransactionGuard(database)
    server.app.state.transaction_guard = guard
    session_module = install_fake_admin_sessions(database)

    transport = httpx.ASGITransport(app=server.app)
    async with (
        httpx.AsyncClient(transport=transport, base_url="https://testserver") as api,
        AdminApi(transport, session_module) as owner_api,
        AdminApi(transport, session_module) as warehouse_api,
        AdminApi(transport, session_module) as staff_api,
    ):
        await owner_api.authorize(owner)
        await warehouse_api.authorize(warehouse)

        directory = await owner_api.request("GET", "/api/admin/users")
        assert directory.status_code == 200
        assert customer["email"] not in {item["email"] for item in directory.json()}

        customer_conversion = await owner_api.request(
            "PUT",
            f"/api/admin/staff/{customer['id']}/roles",
            json={
                "roles": ["warehouse"],
                "expected_version": 1,
                "reason": "Percobaan konversi customer menjadi staf",
            },
        )
        assert customer_conversion.status_code == 409
        assert (
            customer_conversion.json()["detail"]["code"] == "customer_account_boundary"
        )

        invite_payload = {
            "name": "Staff Baru",
            "email": "staff-baru@niuva.com",
            "roles": ["manager_approver", "warehouse"],
            "reason": "Menambah penanggung jawab gudang cabang utama",
        }
        forbidden = await warehouse_api.request(
            "POST",
            "/api/admin/staff-invitations",
            json=invite_payload,
        )
        assert forbidden.status_code == 403

        invited = await owner_api.request(
            "POST",
            "/api/admin/staff-invitations",
            json=invite_payload,
        )
        assert invited.status_code == 201, invited.text
        setup_token = invited.json()["setup_token"]
        stored_invite = database.staff_invitations.items[0]
        assert stored_invite["token_hash"] != setup_token
        assert stored_invite["roles"] == ["warehouse", "manager_approver"]
        assert stored_invite["status"] == "pending"
        assert database.audit_events.items[-1]["reason"] == invite_payload["reason"]

        accepted = await api.post(
            "/api/auth/staff-invitations/accept",
            json={"token": setup_token, "password": "StaffBaruPassword123"},
        )
        assert accepted.status_code == 201, accepted.text
        staff = await database.users.find_one({"email": invite_payload["email"]})
        assert staff["roles"] == ["warehouse", "manager_approver"]
        assert staff["status"] == "active"
        assert staff["access_state"] == "approved"
        assert staff["version"] == 1
        assert staff["password_hash"].startswith("$argon2id$")
        assert server.verify_password("StaffBaruPassword123", staff["password_hash"])
        replay = await api.post(
            "/api/auth/staff-invitations/accept",
            json={"token": setup_token, "password": "StaffBaruPassword123"},
        )
        assert replay.status_code == 410

        role_session = await staff_api.authorize(staff)

        changed = await owner_api.request(
            "PUT",
            f"/api/admin/staff/{staff['id']}/roles",
            json={
                "roles": ["order_admin"],
                "expected_version": 1,
                "reason": "Memindahkan tanggung jawab ke administrasi pesanan",
            },
        )
        assert changed.status_code == 200, changed.text
        assert changed.json()["roles"] == ["order_admin"]
        assert changed.json()["version"] == 2
        stored_staff = await database.users.find_one({"id": staff["id"]})
        assert stored_staff["token_version"] == 1
        assert (
            next(
                item
                for item in database.admin_sessions.items
                if item["id"] == role_session.session_id
            )["revocation_reason"]
            == "identity_access_changed"
        )
        assert (await staff_api.request("GET", "/api/auth/me")).status_code == 401

        stale = await owner_api.request(
            "POST",
            f"/api/admin/staff/{staff['id']}/deactivate",
            json={"expected_version": 1, "reason": "Versi stale untuk test konflik"},
        )
        assert stale.status_code == 409
        assert stale.json()["detail"]["code"] == "version_conflict"
        assert stale.json()["detail"]["current_version"] == 2

        status_session = await staff_api.authorize(stored_staff)
        deactivated = await owner_api.request(
            "POST",
            f"/api/admin/staff/{staff['id']}/deactivate",
            json={"expected_version": 2, "reason": "Akses sementara tidak diperlukan"},
        )
        assert deactivated.status_code == 200
        assert deactivated.json()["status"] == "disabled"
        assert deactivated.json()["version"] == 3
        stored_staff = await database.users.find_one({"id": staff["id"]})
        assert stored_staff["token_version"] == 2
        assert (
            next(
                item
                for item in database.admin_sessions.items
                if item["id"] == status_session.session_id
            )["revocation_reason"]
            == "identity_access_changed"
        )
        blocked_login = await api.post(
            "/api/auth/admin/login",
            json={"email": staff["email"], "password": "StaffBaruPassword123"},
            headers=ORIGIN,
        )
        assert blocked_login.status_code == 401

        reactivated = await owner_api.request(
            "POST",
            f"/api/admin/staff/{staff['id']}/reactivate",
            json={
                "expected_version": 3,
                "reason": "Akses operasional dibutuhkan kembali",
            },
        )
        assert reactivated.status_code == 200
        assert reactivated.json()["status"] == "active"
        assert reactivated.json()["version"] == 4
        assert (await database.users.find_one({"id": staff["id"]}))[
            "token_version"
        ] == 3

    session_updates = [
        options
        for operation, options in database.admin_sessions.operations
        if operation == "update_many"
    ]
    assert len(session_updates) == 3
    assert all(options.get("session") is guard.session for options in session_updates)

    assert [call[0] for call in guard.calls] == [
        "identity.assign_staff_roles",
        "identity.invite_staff",
        "identity.accept_staff_invitation",
        "identity.accept_staff_invitation",
        "identity.assign_staff_roles",
        "identity.deactivate_staff",
        "identity.deactivate_staff",
        "identity.reactivate_staff",
    ]


def test_staff_invitation_and_access_lifecycle_is_audited_and_versioned(
    monkeypatch, tmp_path
):
    configure_password_writes(monkeypatch, tmp_path, enabled=True)
    try:
        asyncio.run(run_staff_invitation_and_access_lifecycle())
    finally:
        server.app.state.transaction_guard = REAL_TRANSACTION_GUARD


async def run_legacy_admin_route_permission_matrix():
    warehouse = make_user(
        "warehouse-routes", "warehouse-routes@niuva.com", ["warehouse"]
    )
    order_admin = make_user("order-routes", "order-routes@niuva.com", ["order_admin"])
    content_editor = make_user(
        "editor-routes",
        "editor-routes@niuva.com",
        ["content_editor"],
    )
    customer = make_user(
        "customer-routes",
        "customer-routes@example.com",
        ["retail_customer"],
    )
    other_customer = make_user(
        "other-customer-routes",
        "other-customer-routes@example.com",
        ["retail_customer"],
    )
    db = FakeDatabase(
        [warehouse, order_admin, content_editor, customer, other_customer]
    )
    db.materials.items.append(
        {
            "id": "material-1",
            "name": "PLA",
            "active": True,
            "created_at": "2026-07-14T00:00:00+00:00",
        }
    )
    db.orders.items.append(
        {
            "id": "order-permission-1",
            "user_id": customer["id"],
            "status": "pending_estimate",
            "created_at": "2026-07-14T00:00:00+00:00",
        }
    )
    db.file_objects.items.append(
        {
            "id": "private-file",
            "storage_path": "niuva/orders/customer-routes/private.stl",
            "owner_id": customer["id"],
            "state": "active",
        }
    )
    server.db = db
    server.app.state.transaction_guard = FakeTransactionGuard(db)
    session_module = install_fake_admin_sessions(db)
    customer_token = server.create_token(
        other_customer["id"], other_customer["email"], "retail_customer"
    )

    transport = httpx.ASGITransport(app=server.app)
    async with (
        httpx.AsyncClient(transport=transport, base_url="https://testserver") as api,
        AdminApi(transport, session_module) as warehouse_api,
        AdminApi(transport, session_module) as order_admin_api,
        AdminApi(transport, session_module) as content_editor_api,
    ):
        await warehouse_api.authorize(warehouse)
        await order_admin_api.authorize(order_admin)
        await content_editor_api.authorize(content_editor)
        assert (
            await warehouse_api.request("GET", "/api/admin/materials")
        ).status_code == 200
        assert (
            await warehouse_api.request("GET", "/api/admin/orders")
        ).status_code == 403
        assert (
            await order_admin_api.request("GET", "/api/admin/orders")
        ).status_code == 200

        forbidden_material = await content_editor_api.request(
            "POST",
            "/api/admin/materials",
            json={"name": "ABS", "description": "", "color": "", "active": True},
        )
        assert forbidden_material.status_code == 403

        portfolio = await content_editor_api.request(
            "POST",
            "/api/admin/portfolio",
            json={"title_id": "Purwarupa", "title_en": "Prototype"},
        )
        # Creation answers 201, and the entry starts as a draft: content.write
        # authors, it does not publish.
        assert portfolio.status_code == 201
        assert portfolio.json()["status"] == "draft"

        cross_customer_order = await order_admin_api.request(
            "GET", "/api/orders/order-permission-1"
        )
        assert cross_customer_order.status_code == 200

        forbidden_file = await api.get(
            "/api/files/niuva/orders/customer-routes/private.stl",
            headers=bearer(customer_token),
        )
        assert forbidden_file.status_code == 403


def test_legacy_admin_routes_use_exact_backend_permissions():
    asyncio.run(run_legacy_admin_route_permission_matrix())


async def run_canonical_account_creation_contract():
    database = FakeDatabase([])
    server.db = database
    provisioned = await server.provision_client(
        server.ClientProvisionReq(
            name="Retail Customer",
            email="retail@example.com",
            password="SafePassword123",
            phone="",
            company="",
        )
    )

    assert provisioned["roles"] == ["retail_customer"]
    assert database.users.items[0]["password_hash"].startswith("$argon2id$")
    assert database.users.items[0]["role_policy_version"] == server.ROLE_POLICY_VERSION
    assert "role" not in database.users.items[0]

    await server.seed()
    seeded_admin = next(
        account
        for account in database.users.items
        if account["email"] == os.environ["ADMIN_EMAIL"].lower()
    )
    assert seeded_admin["roles"] == ["super_admin"]
    assert seeded_admin["access_state"] == "approved"
    assert seeded_admin["role_policy_version"] == server.ROLE_POLICY_VERSION
    assert "role" not in seeded_admin
    assert database.materials.items == []
    assert database.portfolio.items == []
    assert database.portfolio_revisions.items == []

    original_hash = seeded_admin["password_hash"]
    assert original_hash.startswith("$argon2id$")
    os.environ["ADMIN_PASSWORD"] = "A different environment password 2026"
    await server.seed()
    unchanged = next(
        account
        for account in database.users.items
        if account["email"] == os.environ["ADMIN_EMAIL"].lower()
    )
    assert unchanged["password_hash"] == original_hash


async def run_password_write_gate_contract():
    database = FakeDatabase([])
    server.db = database
    guard = FakeTransactionGuard(database)
    server.app.state.transaction_guard = guard

    with pytest.raises(server.PasswordWriteDisabledError):
        await server.provision_client(
            server.ClientProvisionReq(
                name="Gated Retail Customer",
                email="gated-retail@example.com",
                password="A gated customer password 2026",
                phone="",
                company="",
            )
        )
    assert database.users.items == []

    raw_token = "invitation-token-with-at-least-thirty-two-characters"
    database.staff_invitations.items.append(
        {
            "id": "gated-invitation",
            "name": "Gated Staff",
            "email": "gated-staff@niuva.com",
            "roles": ["warehouse"],
            "token_hash": hashlib.sha256(raw_token.encode("utf-8")).hexdigest(),
            "status": "pending",
            "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
        }
    )
    transport = httpx.ASGITransport(app=server.app)
    async with httpx.AsyncClient(
        transport=transport, base_url="http://testserver"
    ) as api:
        response = await api.post(
            "/api/auth/staff-invitations/accept",
            json={
                "token": raw_token,
                "password": "A gated staff password 2026",
            },
        )
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "password_writes_disabled"
    assert database.users.items == []
    assert database.staff_invitations.items[0]["status"] == "pending"

    with pytest.raises(server.PasswordWriteDisabledError):
        await server.seed()
    assert database.users.items == []


def test_runtime_account_creation_never_recreates_legacy_or_owner_authority(
    monkeypatch, tmp_path
):
    configure_password_writes(monkeypatch, tmp_path, enabled=True)
    original_admin_password = os.environ["ADMIN_PASSWORD"]
    try:
        asyncio.run(run_canonical_account_creation_contract())
    finally:
        os.environ["ADMIN_PASSWORD"] = original_admin_password


def test_all_runtime_password_writes_fail_closed_when_gate_is_disabled(
    monkeypatch, tmp_path
):
    configure_password_writes(monkeypatch, tmp_path, enabled=False)
    try:
        asyncio.run(run_password_write_gate_contract())
    finally:
        server.app.state.transaction_guard = REAL_TRANSACTION_GUARD
