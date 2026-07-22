# Foundation Identity, RBAC, Organization, and Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first testable Foundation package: granular internal permissions, compatible customer authentication, B2B organizations and memberships, and auditable identity changes.

**Architecture:** Keep `backend/server.py` as the FastAPI composition root while extracting pure permission policy, audit writing, and focused identity/organization routers into small modules. Preserve existing users and tokens through a legacy-role compatibility layer, use MongoDB single-document atomic updates, and expose permissions to the React client so routes and Admin Studio navigation match backend authorization.

**Tech Stack:** Python 3.14, FastAPI 0.110.1, Pydantic 2, Motor/PyMongo with MongoDB standalone, PyJWT, React 19, React Router 7, Axios, Jest through react-scripts.

## Global Constraints

- Source baseline: `docs/references/requirements/approved-baselines/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md`, `docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md`, `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md`, and `docs/implementation/specs/active/2026-07-14-unified-retail-b2b-platform-design.md`.
- This package covers only Identity, RBAC, Organization, and Audit. CMS, catalog, material pricing, inventory, order/project redesign, payment gateway, and homepage decisions are separate packages.
- Do not add runtime dependencies; use packages already declared in `backend/requirements.txt` and `frontend/package.json`.
- Backend authorization is authoritative. UI visibility is only a usability layer.
- MongoDB is standalone: use atomic single-document updates, unique indexes, and idempotent migration behavior; do not assume multi-document transactions.
- Preserve legacy `admin` and `client` users. Map them to `super_admin` and `retail_customer` until migration persists canonical `roles`.
- Never expose `password_hash`, internal cost, margin, supplier, profit, secret, token, or internal notes in API responses or audit snapshots.
- Organization access is membership-scoped; a member cannot read or modify another organization.
- Existing public and operational routes must remain functional during this package.
- The worktree is already dirty with approved requirement documents. Preserve unrelated changes.
- Do not commit, push, reset, rebase, or create/delete branches unless the user explicitly authorizes it. Commit steps below are conditional checkpoints.

---

## File Responsibility Map

| File | Responsibility |
|---|---|
| `backend/permissions.py` | Canonical roles, permission vocabulary, legacy mapping, pure permission checks |
| `backend/audit.py` | Redacted audit-event creation and persistence |
| `backend/identity_routes.py` | Role catalog, staff/customer listing, role/status mutation |
| `backend/organization_routes.py` | Organization and membership APIs with tenant scoping |
| `backend/migrations/001_identity_rbac_audit.py` | Idempotent legacy-user backfill and index creation |
| `backend/server.py` | Authentication composition, permission dependency, router registration, startup indexes |
| `backend/tests/test_permissions.py` | Pure permission-policy tests |
| `backend/tests/test_audit.py` | Audit redaction and persistence tests |
| `backend/tests/test_identity_foundation.py` | API authorization, role mutation, organization isolation, audit tests |
| `frontend/src/lib/permissions.js` | Client-side permission helper |
| `frontend/src/lib/permissions.test.js` | Permission-helper tests without new test dependencies |
| `frontend/src/components/auth/ProtectedRoute.jsx` | Permission-aware authenticated route guard |
| `frontend/src/pages/admin/AdminLayout.jsx` | Permission-filtered Admin Studio navigation |
| `frontend/src/pages/admin/Users.jsx` | User status and role administration |
| `frontend/src/pages/admin/Organizations.jsx` | Organization and membership administration |
| `frontend/src/pages/admin/AuditLog.jsx` | Read-only audit event viewer |
| `frontend/src/App.js` | Permission-specific route registration |
| `frontend/src/i18n.js` | Indonesian and English labels for new modules |
| `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md` | Role matrix, migration, rollback, and verification procedure |

## Public Interfaces Locked by This Plan

```text
canonical_roles(user: dict) -> tuple[str, ...]
permissions_for(user: dict) -> frozenset[str]
has_permission(user: dict, permission: str) -> bool
require_permission(permission: str) -> FastAPI dependency
append_audit_event(db, *, actor, action, target_type, target_id, before, after, reason) -> dict
build_identity_router(*, get_db, require_permission) -> APIRouter
build_organization_router(*, get_db, require_permission, get_current_user) -> APIRouter
```

API additions:

```text
GET    /api/admin/roles
GET    /api/admin/users
PUT    /api/admin/users/{user_id}/access
GET    /api/admin/audit-events
GET    /api/admin/organizations
POST   /api/admin/organizations
PUT    /api/admin/organizations/{organization_id}
POST   /api/admin/organizations/{organization_id}/members
PUT    /api/admin/organizations/{organization_id}/members/{membership_id}
DELETE /api/admin/organizations/{organization_id}/members/{membership_id}
GET    /api/organizations/mine
```

## Task 1: Add the Canonical Permission Policy

**Files:**

- Create: `backend/permissions.py`
- Create: `backend/tests/test_permissions.py`

**Interfaces:**

- Consumes: legacy user documents containing `role`, and canonical documents containing `roles`.
- Produces: `canonical_roles`, `permissions_for`, `has_permission`, `is_internal`, `ROLE_PERMISSIONS`, and `ASSIGNABLE_ROLES`.

- [ ] **Step 1: Write failing policy tests**

Create `backend/tests/test_permissions.py`:

```python
from permissions import canonical_roles, has_permission, is_internal, permissions_for


def test_legacy_roles_are_mapped_without_database_migration():
    assert canonical_roles({"role": "admin"}) == ("super_admin",)
    assert canonical_roles({"role": "client"}) == ("retail_customer",)


def test_canonical_roles_are_deduplicated_and_sorted():
    user = {"roles": ["warehouse", "content_editor", "warehouse"]}
    assert canonical_roles(user) == ("content_editor", "warehouse")


def test_internal_role_receives_only_declared_permissions():
    warehouse = {"roles": ["warehouse"]}
    assert has_permission(warehouse, "admin.access")
    assert has_permission(warehouse, "materials.write")
    assert has_permission(warehouse, "inventory.write")
    assert not has_permission(warehouse, "roles.manage")


def test_super_admin_wildcard_and_customer_boundary():
    assert has_permission({"roles": ["super_admin"]}, "roles.manage")
    assert is_internal({"roles": ["super_admin"]})
    assert permissions_for({"roles": ["retail_customer"]}) == frozenset()
    assert not is_internal({"roles": ["organization_customer"]})
```

- [ ] **Step 2: Run the test and confirm the expected failure**

From `backend/` run:

```powershell
python -m pytest tests\test_permissions.py -q
```

Expected: collection fails because `permissions.py` does not exist. If pytest reports `Missing required plugins: pytest-xdist`, install the already-declared requirements with `python -m pip install -r requirements.txt`, then repeat; do not change `pytest.ini`.

- [ ] **Step 3: Implement the permission policy**

Create `backend/permissions.py` with explicit role sets. The minimum policy is:

```python
LEGACY_ROLE_MAP = {
    "admin": ("super_admin",),
    "client": ("retail_customer",),
}

CUSTOMER_ROLES = frozenset({"retail_customer", "organization_customer"})
INTERNAL_ROLES = frozenset({
    "content_editor",
    "catalog_manager",
    "warehouse",
    "order_admin",
    "sales_estimator",
    "designer_engineer",
    "production",
    "quality_control",
    "finance",
    "manager_approver",
    "super_admin",
})
ASSIGNABLE_ROLES = tuple(sorted(CUSTOMER_ROLES | INTERNAL_ROLES))

ROLE_PERMISSIONS = {
    "retail_customer": frozenset(),
    "organization_customer": frozenset(),
    "content_editor": frozenset({"admin.access", "content.read", "content.write", "media.read", "media.write"}),
    "catalog_manager": frozenset({"admin.access", "catalog.read", "catalog.write", "pricing.read", "pricing.write"}),
    "warehouse": frozenset({"admin.access", "materials.read", "materials.write", "inventory.read", "inventory.write", "suppliers.read", "suppliers.write"}),
    "order_admin": frozenset({"admin.access", "orders.read", "orders.write", "customers.read", "notifications.write"}),
    "sales_estimator": frozenset({"admin.access", "inquiries.read", "inquiries.write", "quotes.read", "quotes.write", "pricing.read", "projects.read"}),
    "designer_engineer": frozenset({"admin.access", "designs.read", "designs.write", "projects.read", "files.read"}),
    "production": frozenset({"admin.access", "production.read", "production.write", "orders.read", "projects.read", "inventory.read"}),
    "quality_control": frozenset({"admin.access", "qc.read", "qc.write", "production.read", "orders.read", "projects.read"}),
    "finance": frozenset({"admin.access", "payments.read", "payments.write", "invoices.read", "invoices.write", "refunds.write", "orders.read", "projects.read"}),
    "manager_approver": frozenset({"admin.access", "users.read", "organizations.read", "audit.read", "approvals.read", "approvals.write", "inventory.read", "orders.read", "projects.read", "pricing.read"}),
    "super_admin": frozenset({"*"}),
}


def canonical_roles(user: dict) -> tuple[str, ...]:
    roles = user.get("roles")
    if roles:
        valid = {role for role in roles if role in ROLE_PERMISSIONS}
        return tuple(sorted(valid))
    return LEGACY_ROLE_MAP.get(user.get("role"), tuple())


def permissions_for(user: dict) -> frozenset[str]:
    permissions: set[str] = set()
    for role in canonical_roles(user):
        permissions.update(ROLE_PERMISSIONS[role])
    return frozenset(permissions)


def has_permission(user: dict, permission: str) -> bool:
    permissions = permissions_for(user)
    return "*" in permissions or permission in permissions


def is_internal(user: dict) -> bool:
    return any(role in INTERNAL_ROLES for role in canonical_roles(user))
```

- [ ] **Step 4: Run the policy tests**

Run: `python -m pytest tests\test_permissions.py -q`  
Expected: `4 passed`.

- [ ] **Step 5: Conditional commit checkpoint**

Only with explicit user authorization:

```powershell
git add -- backend/permissions.py backend/tests/test_permissions.py
git commit -m "feat: add canonical permission policy"
```

Without authorization, leave the changes uncommitted and continue.

## Task 2: Add Redacted Audit Persistence

**Files:**

- Create: `backend/audit.py`
- Create: `backend/tests/test_audit.py`

**Interfaces:**

- Consumes: Motor-like database object and an authenticated actor document.
- Produces: `append_audit_event(...) -> dict`; later routers depend on the returned event shape.

- [ ] **Step 1: Write audit tests for persistence and redaction**

Create a fake collection in `backend/tests/test_audit.py` with `insert_one`, then assert:

```python
import asyncio

from audit import append_audit_event


class AuditCollection:
    def __init__(self):
        self.items = []

    async def insert_one(self, item):
        self.items.append(dict(item))


class AuditDatabase:
    def __init__(self):
        self.audit_events = AuditCollection()


def test_audit_event_redacts_sensitive_fields():
    db = AuditDatabase()
    event = asyncio.run(append_audit_event(
        db,
        actor={"id": "staff-1", "email": "staff@example.com"},
        action="user.access_updated",
        target_type="user",
        target_id="user-2",
        before={"roles": ["retail_customer"], "password_hash": "hidden"},
        after={"roles": ["warehouse"], "token": "hidden"},
        reason="Assigned warehouse duties",
    ))
    assert event["actor_user_id"] == "staff-1"
    assert event["before"] == {"roles": ["retail_customer"]}
    assert event["after"] == {"roles": ["warehouse"]}
    assert db.audit_events.items == [event]
```

- [ ] **Step 2: Run the test and confirm failure**

Run: `python -m pytest tests\test_audit.py -q`  
Expected: import failure for `audit`.

- [ ] **Step 3: Implement audit writing**

Create `backend/audit.py` with:

```python
import uuid
from datetime import datetime, timezone
from typing import Any

SENSITIVE_KEYS = frozenset({"password", "password_hash", "token", "secret", "api_key", "internal_cost", "margin", "profit"})


def _redact(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: _redact(item) for key, item in value.items() if key.lower() not in SENSITIVE_KEYS}
    if isinstance(value, list):
        return [_redact(item) for item in value]
    return value


async def append_audit_event(
    db,
    *,
    actor: dict,
    action: str,
    target_type: str,
    target_id: str,
    before: dict | None = None,
    after: dict | None = None,
    reason: str | None = None,
) -> dict:
    event = {
        "id": str(uuid.uuid4()),
        "actor_user_id": actor["id"],
        "actor_email": actor.get("email", ""),
        "action": action,
        "target_type": target_type,
        "target_id": target_id,
        "before": _redact(before or {}),
        "after": _redact(after or {}),
        "reason": reason or "",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.audit_events.insert_one(event)
    event.pop("_id", None)
    return event
```

- [ ] **Step 4: Run the audit tests**

Run: `python -m pytest tests\test_audit.py -q`  
Expected: `1 passed`.

- [ ] **Step 5: Conditional commit checkpoint**

Only with explicit authorization, commit `backend/audit.py` and `backend/tests/test_audit.py` with message `feat: add redacted audit events`.

## Task 3: Integrate Canonical Roles Into Authentication

**Files:**

- Modify: `backend/server.py:47-109`
- Modify: `backend/server.py:179-221`
- Modify: `backend/server.py:254-279`
- Modify: `backend/tests/test_auth_security.py:106-280`

**Interfaces:**

- Consumes: `canonical_roles`, `permissions_for`, `has_permission`, and `is_internal` from Task 1.
- Produces: safe auth responses containing `roles` and `permissions`, plus `require_permission(permission)` for all protected routers.

- [ ] **Step 1: Extend the security matrix with canonical-role assertions**

Add an internal `content_editor` user to the fake database and assert:

```python
editor_login = await api.post(
    "/api/auth/admin/login",
    json={"email": editor["email"], "password": "EditorPassword123"},
)
assert editor_login.status_code == 200
assert editor_login.json()["user"]["roles"] == ["content_editor"]
assert "admin.access" in editor_login.json()["user"]["permissions"]
assert "password_hash" not in editor_login.json()["user"]

me = await api.get("/api/auth/me", headers=bearer(editor_login.json()["token"]))
assert me.status_code == 200
assert me.json()["roles"] == ["content_editor"]
assert "roles.manage" not in me.json()["permissions"]
```

Keep the existing forged JWT-role assertion; it proves the database user document, not the JWT role claim, controls authorization.

- [ ] **Step 2: Run the security test and confirm failure**

Run: `python -m pytest tests\test_auth_security.py -q`  
Expected: failure because the auth response lacks `roles` and `permissions`, and non-legacy internal users cannot use admin login.

- [ ] **Step 3: Add permission-aware dependencies and safe user serialization**

In `backend/server.py`, import Task 1 and replace the fixed admin check with:

```python
from permissions import canonical_roles, has_permission, is_internal, permissions_for


def require_permission(permission: str):
    async def dependency(user: dict = Depends(get_current_user)) -> dict:
        if not has_permission(user, permission):
            raise HTTPException(status_code=403, detail=f"Permission required: {permission}")
        return user
    return dependency


require_admin = require_permission("admin.access")


def safe_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "phone": user.get("phone", ""),
        "company": user.get("company", ""),
        "status": user.get("status", "active"),
        "role": canonical_roles(user)[0] if canonical_roles(user) else "",
        "roles": list(canonical_roles(user)),
        "permissions": sorted(permissions_for(user)),
        "created_at": user.get("created_at"),
    }


def auth_response(user: dict) -> dict:
    primary_role = canonical_roles(user)[0] if canonical_roles(user) else user.get("role", "")
    token = create_token(user["id"], user["email"], primary_role)
    return {"token": token, "user": safe_user(user)}
```

Change `admin_login` to reject only users without `admin.access`, and change `/auth/me` to return `safe_user(user)`. In `get_user_from_token`, reject `status == "disabled"` with HTTP 403.

- [ ] **Step 4: Run auth and permission tests**

Run:

```powershell
python -m pytest tests\test_permissions.py tests\test_auth_security.py -q
```

Expected: all tests pass; legacy admin/client behavior remains covered.

- [ ] **Step 5: Conditional commit checkpoint**

Only with explicit authorization, commit the auth compatibility changes with message `feat: authorize canonical staff roles`.

## Task 4: Add Staff Access Management and Idempotent Migration

**Files:**

- Create: `backend/identity_routes.py`
- Create: `backend/migrations/__init__.py`
- Create: `backend/migrations/001_identity_rbac_audit.py`
- Modify: `backend/server.py:607-614`
- Modify: `backend/server.py:662-687`
- Create: `backend/tests/test_identity_foundation.py`

**Interfaces:**

- Consumes: `require_permission`, permission constants, `safe_user`, and `append_audit_event`.
- Produces: role catalog, user access mutation, audit query, canonical user backfill, and required indexes.

- [ ] **Step 1: Write API tests for least privilege and mutation audit**

Cover these exact cases in `backend/tests/test_identity_foundation.py` using an in-memory Motor-like fake:

```python
assert (await api.get("/api/admin/roles", headers=bearer(warehouse_token))).status_code == 403
assert (await api.get("/api/admin/users", headers=bearer(manager_token))).status_code == 200

updated = await api.put(
    "/api/admin/users/user-2/access",
    headers=bearer(super_admin_token),
    json={"roles": ["warehouse"], "status": "active", "reason": "Assigned warehouse operations"},
)
assert updated.status_code == 200
assert updated.json()["roles"] == ["warehouse"]
assert "password_hash" not in updated.json()
assert db.audit_events.items[-1]["action"] == "user.access_updated"

invalid = await api.put(
    "/api/admin/users/user-2/access",
    headers=bearer(super_admin_token),
    json={"roles": ["unknown_role"], "status": "active", "reason": "Invalid assignment"},
)
assert invalid.status_code == 422
```

Also test that a super admin cannot disable or remove `super_admin` from the final active super-admin account.

- [ ] **Step 2: Run the new API test and confirm route failures**

Run: `python -m pytest tests\test_identity_foundation.py -q`  
Expected: 404 for the new endpoints.

- [ ] **Step 3: Create `identity_routes.py`**

Define `UserAccessUpdate` with non-empty `roles`, `status` limited to `active|disabled`, and a 3–500 character `reason`. Build an `APIRouter(prefix="/admin")` that:

- returns an explicit role/permission catalog from `GET /roles`;
- lists all users through `GET /users` with `password_hash` excluded;
- atomically updates `roles`, `status`, and `updated_at` through `PUT /users/{user_id}/access`;
- prevents deletion/disablement of the final active super admin;
- writes `user.access_updated` through `append_audit_event`;
- returns paginated audit records from `GET /audit-events`, sorted newest first and limited to 200.

The router factory signature must be:

```python
def build_identity_router(*, get_db, require_permission, safe_user) -> APIRouter:
    router = APIRouter(prefix="/admin", tags=["identity"])
    return router
```

Use `get_db()` inside each handler so tests that replace `server.db` are respected.

- [ ] **Step 4: Replace duplicate user routes and register the router**

Remove the existing `GET /admin/users` implementation at `backend/server.py:607-609`, keep `POST /admin/users` for compatibility, and protect provisioning with `require_permission("users.manage")`. Register:

```python
from identity_routes import build_identity_router

api.include_router(build_identity_router(
    get_db=lambda: db,
    require_permission=require_permission,
    safe_user=safe_user,
))
```

Register it before `app.include_router(api)`.

- [ ] **Step 5: Add the explicit migration and startup indexes**

`backend/migrations/001_identity_rbac_audit.py` must expose:

```python
async def migrate(db, *, dry_run: bool) -> dict:
    mapping = {"admin": ["super_admin"], "client": ["retail_customer"]}
    scanned = updated = 0
    async for user in db.users.find({"roles": {"$exists": False}}):
        scanned += 1
        roles = mapping.get(user.get("role"), ["retail_customer"])
        if not dry_run:
            await db.users.update_one(
                {"id": user["id"], "roles": {"$exists": False}},
                {"$set": {"roles": roles, "status": user.get("status", "active")}},
            )
        updated += 1
    return {"scanned": scanned, "updated": updated, "dry_run": dry_run}
```

The CLI must require `--apply` for writes; without it, run as dry-run. Add unique indexes for audit-event `id` and user `id/email`, plus indexes for user `roles/status` and audit `created_at/actor_user_id/target_type+target_id`.

- [ ] **Step 6: Run the migration twice in fake-database tests**

Assert the first apply backfills canonical roles and the second apply reports no new updates. Then run:

```powershell
python -m pytest tests\test_identity_foundation.py tests\test_auth_security.py -q
```

Expected: all tests pass.

- [ ] **Step 7: Conditional commit checkpoint**

Only with explicit authorization, commit this task with message `feat: add staff access administration`.

## Task 5: Add Organization and Membership Isolation

**Files:**

- Create: `backend/organization_routes.py`
- Modify: `backend/server.py:637-642`
- Modify: `backend/migrations/001_identity_rbac_audit.py`
- Modify: `backend/tests/test_identity_foundation.py`

**Interfaces:**

- Consumes: authenticated users, `require_permission`, `append_audit_event`, and canonical `organization_customer` role.
- Produces: organization documents, membership documents, admin CRUD, and membership-scoped `/organizations/mine`.

- [ ] **Step 1: Add failing organization-isolation tests**

Test these states:

```python
created = await api.post(
    "/api/admin/organizations",
    headers=bearer(super_admin_token),
    json={"name": "PT Example", "legal_name": "PT Example Indonesia", "tax_id": "", "status": "active"},
)
assert created.status_code == 201
organization_id = created.json()["id"]

member = await api.post(
    f"/api/admin/organizations/{organization_id}/members",
    headers=bearer(super_admin_token),
    json={"user_id": "org-user-1", "member_role": "project_pic"},
)
assert member.status_code == 201

mine = await api.get("/api/organizations/mine", headers=bearer(org_user_token))
assert mine.status_code == 200
assert [item["id"] for item in mine.json()] == [organization_id]

other = await api.get("/api/organizations/mine", headers=bearer(other_org_user_token))
assert other.status_code == 200
assert other.json() == []
```

Also assert duplicate active membership returns 409 and an invalid `member_role` returns 422.

- [ ] **Step 2: Run the focused tests and confirm 404 responses**

Run: `python -m pytest tests\test_identity_foundation.py -q`.

- [ ] **Step 3: Implement organization schemas and routes**

Create `backend/organization_routes.py` with these allowed member roles:

```python
ORGANIZATION_MEMBER_ROLES = frozenset({"owner", "project_pic", "approver", "finance", "viewer"})
```

Organization documents contain `id`, `name`, `legal_name`, `tax_id`, `status`, `created_at`, and `updated_at`. Membership documents contain `id`, `organization_id`, `user_id`, `member_role`, `status`, `created_at`, and `updated_at`.

The router factory must be:

```python
def build_organization_router(*, get_db, require_permission, get_current_user) -> APIRouter:
    router = APIRouter(tags=["organizations"])
    return router
```

Admin mutations require `organizations.manage`; admin reads require `organizations.read`. `/organizations/mine` uses `get_current_user`, queries active memberships by `user_id`, and returns only active organizations referenced by those memberships. Membership delete performs an atomic status change to `inactive`; it does not hard-delete history. Every mutation writes an audit event.

- [ ] **Step 4: Register the router and add indexes**

Register before `app.include_router(api)`:

```python
from organization_routes import build_organization_router

api.include_router(build_organization_router(
    get_db=lambda: db,
    require_permission=require_permission,
    get_current_user=get_current_user,
))
```

Add unique indexes for organization `id`, membership `id`, and compound membership `(organization_id, user_id)`. Add query indexes for organization `status` and membership `(user_id, status)`.

- [ ] **Step 5: Run identity, organization, audit, and security tests**

Run:

```powershell
python -m pytest tests\test_permissions.py tests\test_audit.py tests\test_identity_foundation.py tests\test_auth_security.py -q
```

Expected: all focused backend tests pass.

- [ ] **Step 6: Conditional commit checkpoint**

Only with explicit authorization, commit with message `feat: add organization membership foundation`.

## Task 6: Make React Routes and Navigation Permission-Aware

**Files:**

- Create: `frontend/src/lib/permissions.js`
- Create: `frontend/src/lib/permissions.test.js`
- Modify: `frontend/src/components/auth/ProtectedRoute.jsx:1-26`
- Modify: `frontend/src/pages/admin/AdminLayout.jsx:1-69`
- Modify: `frontend/src/App.js:1-130`

**Interfaces:**

- Consumes: `user.permissions` returned by Task 3.
- Produces: `hasPermission(user, permission)`, permission-specific route protection, and filtered Admin Studio navigation.

- [ ] **Step 1: Write the pure frontend permission tests**

Create `frontend/src/lib/permissions.test.js`:

```javascript
import { hasPermission } from "./permissions";

test("allows an explicit permission", () => {
  expect(hasPermission({ permissions: ["users.read"] }, "users.read")).toBe(true);
});

test("allows the super-admin wildcard", () => {
  expect(hasPermission({ permissions: ["*"] }, "roles.manage")).toBe(true);
});

test("denies missing users and permissions", () => {
  expect(hasPermission(null, "users.read")).toBe(false);
  expect(hasPermission({ permissions: [] }, "users.read")).toBe(false);
});
```

- [ ] **Step 2: Run the test and confirm failure**

From `frontend/` run:

```powershell
npm test -- --watchAll=false --runTestsByPath src/lib/permissions.test.js
```

Expected: failure because `permissions.js` does not exist.

- [ ] **Step 3: Implement the helper and route guard**

Create `frontend/src/lib/permissions.js`:

```javascript
export function hasPermission(user, permission) {
  const permissions = user?.permissions || [];
  return permissions.includes("*") || permissions.includes(permission);
}
```

Change `ProtectedRoute` to accept `permission` and redirect authenticated-but-forbidden users to `/dashboard`. Retain `adminOnly` temporarily by mapping it to `admin.access` so unchanged routes remain compatible:

```javascript
const requiredPermission = permission || (adminOnly ? "admin.access" : null);
if (requiredPermission && !hasPermission(user, requiredPermission)) {
  return <Navigate to="/dashboard" replace />;
}
```

- [ ] **Step 4: Assign exact permissions to current admin routes**

Use these mappings in `App.js` and `AdminLayout.jsx`:

```javascript
const ADMIN_ROUTE_PERMISSIONS = {
  "/admin": "admin.access",
  "/admin/orders": "orders.read",
  "/admin/materials": "materials.read",
  "/admin/portfolio": "content.read",
  "/admin/internships": "admin.access",
  "/admin/contacts": "inquiries.read",
  "/admin/users": "users.read",
  "/admin/organizations": "organizations.read",
  "/admin/audit": "audit.read",
  "/admin/settings": "settings.read",
};
```

Until fine-grained permissions are added to old endpoints, protect their backend handlers with matching `require_permission` dependencies in `server.py`; do not rely only on this map.

- [ ] **Step 5: Run unit test and build**

Run:

```powershell
npm test -- --watchAll=false --runTestsByPath src/lib/permissions.test.js
npm run build
```

Expected: three tests pass and production build compiles.

- [ ] **Step 6: Conditional commit checkpoint**

Only with explicit authorization, commit with message `feat: guard admin studio by permission`.

## Task 7: Add User, Organization, and Audit Admin Screens

**Files:**

- Modify: `frontend/src/pages/admin/Users.jsx`
- Create: `frontend/src/pages/admin/Organizations.jsx`
- Create: `frontend/src/pages/admin/AuditLog.jsx`
- Modify: `frontend/src/pages/admin/AdminLayout.jsx`
- Modify: `frontend/src/App.js`
- Modify: `frontend/src/i18n.js:148-162`
- Modify: `frontend/src/i18n.js:308-322`

**Interfaces:**

- Consumes: the APIs from Tasks 4–5 and `hasPermission` from Task 6.
- Produces: usable Admin Studio management for users and organizations, plus read-only audit visibility.

- [ ] **Step 1: Update the Users screen contract**

Load `GET /admin/users` and `GET /admin/roles` concurrently. Show name, email, status, canonical roles, and created date. Display the access-edit action only when `hasPermission(user, "roles.manage")`.

The access mutation payload must be:

```javascript
await api.put(`/admin/users/${selected.id}/access`, {
  roles: selectedRoles,
  status: selectedStatus,
  reason: reason.trim(),
});
```

Disable save when no role is selected or the trimmed reason contains fewer than three characters. Surface 409/422 errors with `formatApiError`.

- [ ] **Step 2: Add the Organizations screen**

`Organizations.jsx` must:

- fetch `GET /admin/organizations`;
- create an organization with name, legal name, optional tax ID, and active status;
- open a detail dialog that lists memberships;
- add a member by existing `user_id` and one of `owner|project_pic|approver|finance|viewer`;
- change a membership role;
- archive a membership only after confirmation;
- show explicit loading, empty, error, and permission-denied states.

Use the existing `Dialog`, `AlertDialog`, `Input`, `Select`, `Button`, `SurfacePanel`, and `EmptyState` components; do not add a UI dependency.

- [ ] **Step 3: Add the read-only Audit screen**

`AuditLog.jsx` fetches `GET /admin/audit-events?limit=100` and displays `created_at`, actor email, action, target type/id, and reason. Do not render arbitrary before/after JSON by default; show it only in a details dialog to users with `audit.read`, and the API has already redacted sensitive fields.

- [ ] **Step 4: Register routes and navigation**

Add lazy imports and routes:

```jsx
<Route path="/admin/organizations" element={<ProtectedRoute permission="organizations.read"><AdminOrganizations /></ProtectedRoute>} />
<Route path="/admin/audit" element={<ProtectedRoute permission="audit.read"><AdminAuditLog /></ProtectedRoute>} />
```

Add Indonesian labels `Organisasi`, `Audit`, `Peran & Akses` and English labels `Organizations`, `Audit`, `Roles & Access` in both i18n dictionaries.

- [ ] **Step 5: Verify the frontend**

Run: `npm run build`  
Expected: optimized build compiles with no missing imports.

Manual checks using seeded accounts:

1. Warehouse sees Materials but not Users, Organizations, or Audit.
2. Manager/Approver can read Users, Organizations, and Audit but cannot edit roles.
3. Super Admin can edit access and organization membership.
4. A forbidden direct URL redirects without briefly rendering protected content.
5. Disabled users receive HTTP 403 on their next authenticated request.

- [ ] **Step 6: Conditional commit checkpoint**

Only with explicit authorization, commit with message `feat: add identity administration screens`.

## Task 8: Document Migration, Run Full Verification, and Record Handoff

**Files:**

- Create: `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md`
- Modify: `backend/.env.example` only if the implementation introduces a real new environment variable; this plan does not require one.
- Test: all focused backend and frontend checks listed below.

**Interfaces:**

- Consumes: migration CLI, role matrix, APIs, tests, and UI delivered in Tasks 1–7.
- Produces: an executable deployment and rollback procedure for the next Foundation packages.

- [ ] **Step 1: Write the runbook**

Document these exact sections:

1. Purpose and scope.
2. Platform role matrix and organization member-role matrix.
3. Dry-run migration command.
4. Backup prerequisite.
5. Apply command.
6. Post-migration verification queries.
7. Rollback procedure that restores the backup instead of deleting canonical fields ad hoc.
8. How to recover access when no staff account can enter Admin Studio.
9. Audit-event fields and sensitive-field exclusions.
10. Ownership: Super Admin manages roles; Manager reviews audit; technical owner runs migration/restore.

- [ ] **Step 2: Run the migration dry-run against the configured non-production database**

From `backend/`:

```powershell
python migrations\001_identity_rbac_audit.py
```

Expected: JSON summary with `dry_run: true`; no document changes. Do not run `--apply` until backup existence and target database name are explicitly confirmed.

- [ ] **Step 3: Run focused backend verification**

```powershell
python -m pytest tests\test_permissions.py tests\test_audit.py tests\test_identity_foundation.py tests\test_auth_security.py -q
```

Expected: all focused tests pass under the repository's fixed two-worker pytest configuration.

- [ ] **Step 4: Run the broader backend suite**

```powershell
python -m pytest -q
```

Expected: security/unit tests pass; URL-dependent integration tests may report module-level skip when `REACT_APP_BACKEND_URL` is not configured. Any real failure must be resolved before handoff.

- [ ] **Step 5: Run frontend verification**

```powershell
npm test -- --watchAll=false --runTestsByPath src/lib/permissions.test.js
npm run build
```

Expected: permission tests pass and production build compiles.

- [ ] **Step 6: Review the final data boundary**

Using API responses from login, `/auth/me`, `/admin/users`, `/admin/organizations`, `/organizations/mine`, and `/admin/audit-events`, assert that none contains `password_hash`, secret/token values, internal cost, margin, supplier, profit, or internal notes.

- [ ] **Step 7: Conditional final commit**

Only with explicit user authorization:

```powershell
git add -- backend frontend/src docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md
git commit -m "feat: establish identity rbac organization and audit foundation"
```

Without authorization, provide the verified diff and leave the worktree uncommitted.

## Coverage Matrix

| Requirement | Task |
|---|---|
| Internal granular roles and backend authorization | 1, 3, 4 |
| Retail/customer compatibility | 1, 3, 4 |
| B2B organization account and member roles | 5 |
| Audit actor/time/before/after/reason | 2, 4, 5 |
| Customer and organization isolation | 3, 5 |
| Legacy `admin/client` migration | 1, 3, 4 |
| Permission-aware Admin Studio | 6, 7 |
| Backup, dry-run, recovery, and ownership | 8 |

## Package Exit Criteria

- Legacy admin and client authentication still works.
- Canonical roles and permissions are returned without sensitive fields.
- Every protected endpoint enforces backend permission checks.
- Only Super Admin can assign platform roles.
- The final active Super Admin cannot be disabled or demoted.
- Organization membership is tenant-scoped and archived rather than hard-deleted.
- Identity and organization mutations create redacted audit events.
- Migration is idempotent and dry-run by default.
- Focused backend tests, frontend permission tests, and frontend build pass.
- The runbook allows another staff/technical owner to migrate, verify, and recover the package.
