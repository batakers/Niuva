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
from transaction_execution import TransactionUnavailableError  # noqa: E402
from transaction_guard import TransactionMutationGuard  # noqa: E402

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
        self.internships = FakeCollection()
        self.contacts = FakeCollection()
        self.settings = FakeCollection()


class FakeTransactionGuard:
    def __init__(self, database, *, available=True, barrier_size=0):
        self.database = database
        self.available = available
        self.calls = []
        self.session = object()
        self._lock = asyncio.Lock()
        self._barrier_size = barrier_size
        self._entrants = 0
        self._barrier = asyncio.Event()

    async def run(self, callback, *, operation_name, retry_safe=False):
        self.calls.append((operation_name, retry_safe))
        if not self.available:
            from transaction_execution import TransactionUnavailableError

            raise TransactionUnavailableError()
        if self._barrier_size:
            self._entrants += 1
            if self._entrants >= self._barrier_size:
                self._barrier.set()
            await self._barrier.wait()
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


class RejectingTransactionExecutor:
    def __init__(self, *, capability_available):
        self.capability_available = capability_available
        self.execute_calls = []
        self.reject_calls = []

    def reject_unavailable(self, **options):
        self.reject_calls.append(options)
        raise TransactionUnavailableError()

    async def execute(self, callback, **options):
        self.execute_calls.append(options)
        if not self.capability_available:
            raise TransactionUnavailableError()
        return await callback(object())


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
        denied_roles = await api.get(
            "/api/admin/roles", headers=bearer(warehouse_token)
        )
        assert denied_roles.status_code == 403

        manager_users = await api.get("/api/admin/users", headers=bearer(manager_token))
        assert manager_users.status_code == 403
        owner_users = await api.get(
            "/api/admin/users", headers=bearer(super_admin_token)
        )
        assert owner_users.status_code == 200
        assert all("password_hash" not in user for user in owner_users.json())

        updated = await api.put(
            "/api/admin/users/user-2/access",
            headers=bearer(super_admin_token),
            json={
                "roles": ["operations"],
                "status": "active",
                "access_state": "approved",
                "reason_code": "role_review_approved",
            },
        )
        assert updated.status_code == 200
        assert updated.json()["roles"] == ["operations"]
        assert "password_hash" not in updated.json()
        assert db.audit_events.items[-1]["action"] == "user.access_updated"

        invalid = await api.put(
            "/api/admin/users/user-2/access",
            headers=bearer(super_admin_token),
            json={
                "roles": ["unknown_role"],
                "status": "active",
                "access_state": "approved",
                "reason_code": "role_review_approved",
            },
        )
        assert invalid.status_code == 422

        final_admin = await api.put(
            "/api/admin/users/admin-1/access",
            headers=bearer(super_admin_token),
            json={
                "roles": ["commercial_finance"],
                "status": "active",
                "access_state": "approved",
                "reason_code": "role_access_removed",
            },
        )
        assert final_admin.status_code == 409


def test_staff_access_routes_enforce_permissions_and_audit():
    try:
        asyncio.run(run_staff_access_matrix())
    finally:
        server.app.state.transaction_guard = REAL_TRANSACTION_GUARD


async def _put_access(api, token, user_id, **overrides):
    payload = {
        "roles": ["operations"],
        "status": "active",
        "access_state": "approved",
        "reason_code": "role_review_approved",
    }
    payload.update(overrides)
    return await api.put(
        f"/api/admin/users/{user_id}/access",
        headers=bearer(token),
        json=payload,
    )


async def run_access_guard_contract():
    owner = make_user("owner-guard", "owner-guard@niuva.com", ["super_admin"])
    target = make_user("target-guard", "target-guard@niuva.com", ["retail_customer"])

    cases = (
        ("disabled_flag", True, False, 1, 0),
        ("unavailable_capability", False, True, 0, 1),
    )
    for failure_source, capability, enabled, reject_count, execute_count in cases:
        db = FakeDatabase([owner, target])
        executor = RejectingTransactionExecutor(capability_available=capability)
        guard = TransactionMutationGuard(executor, lambda: enabled)
        server.db = db
        server.app.state.transaction_guard = guard
        token = server.create_token(owner["id"], owner["email"], "super_admin")
        transport = httpx.ASGITransport(app=server.app, raise_app_exceptions=False)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://test"
        ) as api:
            response = await _put_access(api, token, target["id"])

        assert response.status_code == 503, failure_source
        assert response.json() == {
            "detail": {
                "code": "transaction_unavailable",
                "message": (
                    "Operasi sementara tidak tersedia karena transaksi "
                    "database belum siap."
                ),
            }
        }
        assert db.users.items[1] == target
        assert db.audit_events.items == []
        assert db.identity_policy_state.items == []
        assert len(executor.reject_calls) == reject_count
        assert len(executor.execute_calls) == execute_count
        options = (executor.reject_calls or executor.execute_calls)[0]
        assert options["operation_name"] == "identity.access.update"
        assert options["retry_mode"].value == "never"


def test_access_guard_rejects_before_user_or_audit_write():
    try:
        asyncio.run(run_access_guard_contract())
    finally:
        server.app.state.transaction_guard = REAL_TRANSACTION_GUARD


async def run_access_atomicity_and_session_contract():
    owner = make_user("owner-atomic", "owner-atomic@niuva.com", ["super_admin"])
    target = make_user("target-atomic", "target-atomic@niuva.com", ["retail_customer"])
    db = FakeDatabase([owner, target])
    guard = FakeTransactionGuard(db)
    server.db = db
    server.app.state.transaction_guard = guard
    token = server.create_token(owner["id"], owner["email"], "super_admin")
    transport = httpx.ASGITransport(app=server.app, raise_app_exceptions=False)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as api:
        response = await _put_access(api, token, target["id"])

        assert response.status_code == 200
        assert guard.calls == [("identity.access.update", False)]
        assert response.json()["roles"] == ["operations"]
        assert "reason" not in response.json() and "reason_code" not in response.json()
        assert len(db.audit_events.items) == 1
        assert db.identity_policy_state.items[0]["approved_owner_count"] == 1
        event = db.audit_events.items[0]
        assert event["reason_code"] == "role_review_approved"
        assert set(event) == {
            "id",
            "actor_user_id",
            "action",
            "target_type",
            "target_id",
            "previous",
            "result",
            "reason_code",
            "policy_version",
            "created_at",
        }
        transactional_options = [
            options
            for collection in (
                db.users,
                db.identity_policy_state,
                db.audit_events,
            )
            for _operation, options in collection.operations
            if "session" in options
        ]
        assert transactional_options
        assert all(
            options["session"] is guard.session for options in transactional_options
        )

        before_failure = copy.deepcopy(db.users.items)
        db.audit_events.fail_inserts = True
        failed = await _put_access(
            api,
            token,
            target["id"],
            roles=["commercial_finance"],
            reason_code="emergency_override",
        )
        assert failed.status_code == 500
        assert guard.calls == [
            ("identity.access.update", False),
            ("identity.access.update", False),
        ]
        assert db.users.items == before_failure
        assert len(db.audit_events.items) == 1
        assert db.identity_policy_state.items[0]["approved_owner_count"] == 1


def test_access_update_commits_with_audit_or_rolls_back_and_forwards_one_session():
    try:
        asyncio.run(run_access_atomicity_and_session_contract())
    finally:
        server.app.state.transaction_guard = REAL_TRANSACTION_GUARD


async def run_access_validation_and_stale_token_contract():
    owner = make_user("owner-validation", "owner-validation@niuva.com", ["super_admin"])
    target = make_user(
        "target-validation", "target-validation@niuva.com", ["operations"]
    )
    db = FakeDatabase([owner, target])
    db.materials.items.append({"id": "material-validation", "name": "PLA"})
    guard = FakeTransactionGuard(db)
    server.db = db
    server.app.state.transaction_guard = guard
    owner_token = server.create_token(owner["id"], owner["email"], "super_admin")
    stale_token = server.create_token(target["id"], target["email"], "operations")
    transport = httpx.ASGITransport(app=server.app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as api:
        for invalid_payload in (
            {"roles": ["operations", "commercial_finance"]},
            {"roles": ["warehouse"]},
            {"roles": ["retail_customer"]},
            {"roles": ["organization_customer"]},
            {"reason_code": "free text is forbidden"},
            {"reason": "free text must be rejected"},
        ):
            response = await _put_access(
                api, owner_token, target["id"], **invalid_payload
            )
            assert response.status_code == 422

        reviewed = await _put_access(
            api,
            owner_token,
            target["id"],
            access_state="access_review_required",
            reason_code="role_access_removed",
        )
        assert reviewed.status_code == 200
        denied = await api.get("/api/admin/materials", headers=bearer(stale_token))
        assert denied.status_code == 403


def test_access_contract_is_single_role_reason_coded_and_stale_tokens_fail_closed():
    try:
        asyncio.run(run_access_validation_and_stale_token_contract())
    finally:
        server.app.state.transaction_guard = REAL_TRANSACTION_GUARD


async def run_concurrent_final_owner_contract():
    first = make_user("owner-first", "owner-first@niuva.com", ["super_admin"])
    second = make_user("owner-second", "owner-second@niuva.com", ["super_admin"])
    db = FakeDatabase([first, second])
    guard = FakeTransactionGuard(db, barrier_size=2)
    server.db = db
    server.app.state.transaction_guard = guard
    first_token = server.create_token(first["id"], first["email"], "super_admin")
    second_token = server.create_token(second["id"], second["email"], "super_admin")
    transport = httpx.ASGITransport(app=server.app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as api:
        responses = await asyncio.gather(
            _put_access(
                api,
                first_token,
                second["id"],
                roles=["operations"],
                reason_code="role_access_removed",
            ),
            _put_access(
                api,
                second_token,
                first["id"],
                roles=["operations"],
                reason_code="role_access_removed",
            ),
        )

    assert sorted(response.status_code for response in responses) == [200, 409]
    approved_owners = [
        user
        for user in db.users.items
        if user["roles"] == ["super_admin"]
        and user["status"] == "active"
        and user["access_state"] == "approved"
    ]
    assert len(approved_owners) == 1
    assert len(db.audit_events.items) == 1


def test_concurrent_updates_cannot_remove_the_final_approved_owner():
    try:
        asyncio.run(run_concurrent_final_owner_contract())
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


async def run_organization_isolation_matrix():
    super_admin = make_user("admin-org", "admin-org@niuva.com", ["super_admin"])
    organization_user = make_user(
        "org-user-1",
        "pic@example.com",
        ["organization_customer"],
    )
    other_organization_user = make_user(
        "org-user-2",
        "other-pic@example.com",
        ["organization_customer"],
    )
    retail_user = make_user(
        "retail-user",
        "retail@example.com",
        ["retail_customer"],
    )
    db = FakeDatabase(
        [super_admin, organization_user, other_organization_user, retail_user]
    )
    server.db = db

    super_admin_token = server.create_token(
        super_admin["id"], super_admin["email"], "super_admin"
    )
    organization_user_token = server.create_token(
        organization_user["id"],
        organization_user["email"],
        "organization_customer",
    )
    other_organization_user_token = server.create_token(
        other_organization_user["id"],
        other_organization_user["email"],
        "organization_customer",
    )
    retail_token = server.create_token(
        retail_user["id"], retail_user["email"], "retail_customer"
    )

    transport = httpx.ASGITransport(app=server.app)
    async with httpx.AsyncClient(
        transport=transport, base_url="http://testserver"
    ) as api:
        forbidden = await api.post(
            "/api/admin/organizations",
            headers=bearer(retail_token),
            json={
                "name": "Forbidden Organization",
                "legal_name": "PT Forbidden Organization",
                "tax_id": "",
                "status": "active",
            },
        )
        assert forbidden.status_code == 403

        created = await api.post(
            "/api/admin/organizations",
            headers=bearer(super_admin_token),
            json={
                "name": "PT Example",
                "legal_name": "PT Example Indonesia",
                "tax_id": "",
                "status": "active",
            },
        )
        assert created.status_code == 201
        organization_id = created.json()["id"]

        member = await api.post(
            f"/api/admin/organizations/{organization_id}/members",
            headers=bearer(super_admin_token),
            json={"user_id": "org-user-1", "member_role": "project_pic"},
        )
        assert member.status_code == 201
        membership_id = member.json()["id"]

        mine = await api.get(
            "/api/organizations/mine",
            headers=bearer(organization_user_token),
        )
        assert mine.status_code == 200
        assert [item["id"] for item in mine.json()] == [organization_id]

        other = await api.get(
            "/api/organizations/mine",
            headers=bearer(other_organization_user_token),
        )
        assert other.status_code == 200
        assert other.json() == []

        duplicate = await api.post(
            f"/api/admin/organizations/{organization_id}/members",
            headers=bearer(super_admin_token),
            json={"user_id": "org-user-1", "member_role": "viewer"},
        )
        assert duplicate.status_code == 409

        invalid = await api.post(
            f"/api/admin/organizations/{organization_id}/members",
            headers=bearer(super_admin_token),
            json={"user_id": "org-user-2", "member_role": "invalid_role"},
        )
        assert invalid.status_code == 422

        wrong_customer_type = await api.post(
            f"/api/admin/organizations/{organization_id}/members",
            headers=bearer(super_admin_token),
            json={"user_id": "retail-user", "member_role": "viewer"},
        )
        assert wrong_customer_type.status_code == 422

        changed = await api.put(
            f"/api/admin/organizations/{organization_id}/members/{membership_id}",
            headers=bearer(super_admin_token),
            json={"member_role": "approver"},
        )
        assert changed.status_code == 200
        assert changed.json()["member_role"] == "approver"

        archived = await api.delete(
            f"/api/admin/organizations/{organization_id}/members/{membership_id}",
            headers=bearer(super_admin_token),
        )
        assert archived.status_code == 200
        assert archived.json()["status"] == "inactive"

        mine_after_archive = await api.get(
            "/api/organizations/mine",
            headers=bearer(organization_user_token),
        )
        assert mine_after_archive.status_code == 200
        assert mine_after_archive.json() == []

        reactivated = await api.post(
            f"/api/admin/organizations/{organization_id}/members",
            headers=bearer(super_admin_token),
            json={"user_id": "org-user-1", "member_role": "viewer"},
        )
        assert reactivated.status_code == 201
        assert reactivated.json()["id"] == membership_id
        assert reactivated.json()["status"] == "active"

        assert db.audit_events.items[-1]["action"] == "organization.member_reactivated"
        assert db.audit_events.items[-1]["target_type"] == "organization_membership"


def test_organization_membership_is_tenant_scoped():
    asyncio.run(run_organization_isolation_matrix())


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
