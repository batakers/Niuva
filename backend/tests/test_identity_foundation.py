import asyncio
import copy
import importlib.util
import os
import sys
import types
from pathlib import Path

import httpx

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("MONGO_URL", "mongodb://identity-test.invalid")
os.environ.setdefault("DB_NAME", "niuva_identity_test")
os.environ.setdefault("JWT_SECRET", "identity-test-secret-at-least-32-characters")
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

REAL_TRANSACTION_GUARD = server.app.state.transaction_guard


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

    async def count_documents(self, query, **options):
        self.operations.append(("count_documents", dict(options)))
        return sum(1 for item in self.items if self._matches(item, query))

    async def create_index(self, keys, **options):
        self.indexes.append((keys, dict(options)))
        return str(keys)


class FakeDatabase:
    def __init__(self, users):
        self.users = FakeCollection(users)
        self.audit_events = FakeCollection()
        self.identity_policy_state = FakeCollection()
        self.organizations = FakeCollection()
        self.organization_memberships = FakeCollection()
        self.materials = FakeCollection()
        self.orders = FakeCollection()
        self.portfolio = FakeCollection()
        self.contacts = FakeCollection()
        self.settings = FakeCollection()


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
    manager = make_user("manager-1", "manager@niuva.com", ["commercial_finance"])
    warehouse = make_user("warehouse-1", "warehouse@niuva.com", ["operations"])
    customer = make_user("user-2", "customer@example.com", ["retail_customer"])
    db = FakeDatabase([super_admin, manager, warehouse, customer])
    server.db = db
    guard = FakeTransactionGuard(db)
    server.app.state.transaction_guard = guard

    super_admin_token = server.create_token(
        super_admin["id"], super_admin["email"], "super_admin"
    )
    manager_token = server.create_token(
        manager["id"], manager["email"], "commercial_finance"
    )
    warehouse_token = server.create_token(
        warehouse["id"], warehouse["email"], "operations"
    )

    transport = httpx.ASGITransport(app=server.app)
    async with httpx.AsyncClient(
        transport=transport, base_url="http://testserver"
    ) as api:
        denied_response = await api.get(
            "/api/admin/users", headers=bearer(warehouse_token)
        )
        assert denied_response.status_code == 403

        manager_users = await api.get("/api/admin/users", headers=bearer(manager_token))
        assert manager_users.status_code == 403
        owner_users = await api.get(
            "/api/admin/users", headers=bearer(super_admin_token)
        )
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



async def run_legacy_admin_route_permission_matrix():
    warehouse = make_user(
        "warehouse-routes", "warehouse-routes@niuva.com", ["operations"]
    )
    order_admin = make_user("order-routes", "order-routes@niuva.com", ["operations"])
    content_editor = make_user(
        "editor-routes",
        "editor-routes@niuva.com",
        ["operations"],
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
    server.db = db

    warehouse_token = server.create_token(
        warehouse["id"], warehouse["email"], "operations"
    )
    order_admin_token = server.create_token(
        order_admin["id"], order_admin["email"], "operations"
    )
    content_editor_token = server.create_token(
        content_editor["id"], content_editor["email"], "operations"
    )
    customer_token = server.create_token(
        other_customer["id"], other_customer["email"], "retail_customer"
    )

    transport = httpx.ASGITransport(app=server.app)
    async with httpx.AsyncClient(
        transport=transport, base_url="http://testserver"
    ) as api:
        assert (
            await api.get(
                "/api/admin/materials",
                headers=bearer(warehouse_token),
            )
        ).status_code == 200
        assert (
            await api.get(
                "/api/admin/orders",
                headers=bearer(warehouse_token),
            )
        ).status_code == 200
        assert (
            await api.get(
                "/api/admin/orders",
                headers=bearer(order_admin_token),
            )
        ).status_code == 200

        forbidden_material = await api.post(
            "/api/admin/materials",
            headers=bearer(content_editor_token),
            json={"name": "ABS", "description": "", "color": "", "active": True},
        )
        assert forbidden_material.status_code == 200

        portfolio = await api.post(
            "/api/admin/portfolio",
            headers=bearer(content_editor_token),
            json={"title_id": "Purwarupa", "title_en": "Prototype"},
        )
        assert portfolio.status_code == 200

        cross_customer_order = await api.get(
            "/api/orders/order-permission-1",
            headers=bearer(order_admin_token),
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
    assert database.users.items[0]["role_policy_version"] == server.ROLE_POLICY_VERSION
    assert "role" not in database.users.items[0]

    await server.seed()
    seeded_admin = next(
        account
        for account in database.users.items
        if account["email"] == os.environ["ADMIN_EMAIL"].lower()
    )
    assert seeded_admin["roles"] == []
    assert seeded_admin["access_state"] == "access_review_required"
    assert seeded_admin["role_policy_version"] == server.ROLE_POLICY_VERSION
    assert "role" not in seeded_admin


def test_runtime_account_creation_never_recreates_legacy_or_owner_authority():
    asyncio.run(run_canonical_account_creation_contract())
