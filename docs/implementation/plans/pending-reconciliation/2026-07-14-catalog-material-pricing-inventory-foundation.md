# Catalog, Material Pricing, and Inventory Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shared Catalog, Material Pricing, Inventory, and internal Restock Alert foundation that Retail and B2B workflows can safely consume.

**Architecture:** Extend the existing FastAPI, MongoDB, and React modular monolith with focused domain modules. Catalog publishing creates immutable snapshots, inventory writes create immutable movements plus transactionally maintained balances, and public responses expose only published data plus a safe stock status.

**Tech Stack:** Python, FastAPI, Pydantic, Motor/PyMongo, MongoDB replica-set transactions, pytest with the repository's fixed two-worker xdist configuration, React 19, React Router 7, Axios, CRACO/Jest, Tailwind, and existing shadcn/Radix components.

**Design spec:** `docs/implementation/specs/active/2026-07-14-catalog-material-pricing-inventory-foundation-design.md`

## Global Constraints

- Keep one FastAPI service, one MongoDB database, and the existing React application. Do not add a microservice or database.
- Do not add runtime or frontend dependencies. The current project does not include React Testing Library, so frontend automation in this plan tests pure helpers with Jest and verifies rendered behavior through browser QA.
- Store IDR money as non-negative integer rupiah. Never use binary floating-point for money.
- Store inventory quantities as Decimal128-compatible decimals and serialize them to JSON strings.
- Reject negative `on_hand`, `reserved`, `available`, `incoming`, and `planned_demand`; `projected` may be negative because it drives a shortage alert.
- Require MongoDB replica-set transactions for stock writes and catalog publish or rollback. Return `503 transaction_unavailable` instead of using non-atomic fallback writes.
- Use stable error codes and concise Indonesian messages: `400` business rule, `403` permission, `404` invisible/missing target, `409` conflict or invalid transition, `422` request shape/type, and `503` unavailable safe transaction. Never return database or exception details.
- Preserve legacy material IDs, order references, and `GET /api/materials` compatibility.
- Archive instead of hard-delete. Referenced catalog, material, pricing, inventory, publication, and movement records are immutable or retained.
- Public APIs expose immutable publication data and `in_stock|low_stock|out_of_stock|made_to_order` only. They never expose exact quantities, reorder points, supplier references, material prices, actor IDs, audit details, or internal rules.
- Customer catalog UI, calculation engine, checkout, payment, automatic order reservation, customer restock subscriptions, supplier master data, and multi-warehouse operations remain out of scope.
- Keep `backend/pytest.ini` unchanged with `-n 2 --dist loadscope`. Use `-n 0` only for the real MongoDB transaction module.
- Follow red-green-refactor. Every task starts with a failing test and ends with focused verification.
- Do not commit at a checkpoint unless the user explicitly authorizes it. Do not push, merge, delete a branch, or remove the implementation worktree without separate user direction.

---

## Task 1: Extend Permissions, Transaction Capability, and Transactional Audit

**Files:**

- Modify: `backend/permissions.py`
- Create: `backend/database_capabilities.py`
- Modify: `backend/audit.py`
- Modify: `backend/tests/test_permissions.py`
- Create: `backend/tests/test_database_capabilities.py`
- Modify: `backend/tests/test_audit.py`

**Interfaces:**

- Consume: existing canonical roles, `has_permission`, Motor client, and `append_audit_event` callers.
- Produce: catalog/material/pricing/inventory permissions, `DatabaseCapabilities`, one startup capability probe, and transaction-aware audit insertion.

- [x] **Step 1: Add failing permission tests**

Add these role assertions to `backend/tests/test_permissions.py`:

```python
def test_catalog_material_inventory_permissions_match_operational_roles():
    catalog = {"roles": ["catalog_manager"]}
    warehouse = {"roles": ["warehouse"]}
    estimator = {"roles": ["sales_estimator"]}
    manager = {"roles": ["manager_approver"]}

    assert has_permission(catalog, "catalog.publish")
    assert has_permission(catalog, "pricing.write")
    assert has_permission(catalog, "materials.read")
    assert not has_permission(catalog, "inventory.write")
    assert has_permission(warehouse, "materials.write")
    assert has_permission(warehouse, "inventory.write")
    assert has_permission(warehouse, "restock_alerts.manage")
    assert not has_permission(warehouse, "inventory.adjust")
    assert has_permission(estimator, "catalog.read")
    assert has_permission(estimator, "materials.read")
    assert has_permission(estimator, "inventory.read")
    assert has_permission(manager, "catalog.archive")
    assert has_permission(manager, "materials.archive")
    assert has_permission(manager, "inventory.adjust")
```

- [x] **Step 2: Add failing capability and audit-session tests**

Create `backend/tests/test_database_capabilities.py`:

```python
import asyncio

from database_capabilities import probe_transaction_capability, supports_transactions


def test_transaction_support_requires_replica_set_and_sessions():
    assert supports_transactions({"setName": "rs0", "logicalSessionTimeoutMinutes": 30})
    assert not supports_transactions({"logicalSessionTimeoutMinutes": 30})
    assert not supports_transactions({"setName": "rs0"})


def test_probe_reads_hello_response():
    class Admin:
        async def command(self, name):
            assert name == "hello"
            return {"setName": "rs0", "logicalSessionTimeoutMinutes": 30}

    class Client:
        admin = Admin()

    assert asyncio.run(probe_transaction_capability(Client())) is True
```

Extend `backend/tests/test_audit.py` with an insert fake that records keyword arguments. Assert that the supplied session reaches `insert_one` and is not stored inside the event document.

- [x] **Step 3: Run the focused tests and confirm failure**

From `backend/` run:

```powershell
python -m pytest tests\test_permissions.py tests\test_database_capabilities.py tests\test_audit.py -q
```

Expected: collection or assertion failures because the new capability module, permissions, and audit session parameter are missing.

- [x] **Step 4: Implement permissions and capability primitives**

Create `backend/database_capabilities.py` with an immutable `DatabaseCapabilities(transactions: bool)` dataclass, `supports_transactions(hello: dict) -> bool`, and `probe_transaction_capability(client) -> bool`. The probe calls `client.admin.command("hello")`, returns false on exceptions, and is executed once during startup.

Add these exact permission groups without reintroducing supplier-master permissions:

```python
CATALOG_MANAGER_PERMISSIONS = {
    "admin.access", "catalog.read", "catalog.write", "catalog.publish", "materials.read",
    "pricing.read", "pricing.write",
}
WAREHOUSE_PERMISSIONS = {
    "admin.access", "materials.read", "materials.write", "inventory.read",
    "inventory.write", "restock_alerts.read", "restock_alerts.manage",
}
ESTIMATOR_ADDITIONS = {"catalog.read", "materials.read", "pricing.read", "inventory.read"}
MANAGER_ADDITIONS = {
    "catalog.read", "catalog.write", "catalog.publish", "catalog.archive",
    "materials.read", "materials.write", "materials.archive",
    "pricing.read", "pricing.write", "inventory.read", "inventory.write",
    "inventory.adjust", "restock_alerts.read", "restock_alerts.manage",
}
```

- [x] **Step 5: Make audit insertion transaction-aware**

Add the keyword `session=None` to `append_audit_event`. Build `insert_options = {"session": session}` only when a session exists, pass it to `insert_one`, and never include the session object in the event dictionary. Existing callers remain compatible.

- [x] **Step 6: Verify the task**

```powershell
python -m pytest tests\test_permissions.py tests\test_database_capabilities.py tests\test_audit.py tests\test_identity_foundation.py -q
```

Expected: all focused tests and existing identity/audit regressions pass.

- [x] **Step 7: Conditional commit checkpoint**

Only with explicit authorization:

```powershell
git add -- backend/permissions.py backend/database_capabilities.py backend/audit.py backend/tests/test_permissions.py backend/tests/test_database_capabilities.py backend/tests/test_audit.py
git commit -m "feat: add catalog inventory permission and transaction primitives"
```

## Task 2: Add Pure Catalog Validation and Safe Public Projection

**Files:**

- Create: `backend/catalog_domain.py`
- Create: `backend/tests/test_catalog_domain.py`

**Interfaces:**

- Consume: category, product, variant, and configuration-option dictionaries.
- Produce: slug normalization, aggregate validation, immutable publication snapshots, safe public projection, and stock-status mapping.

- [x] **Step 1: Write failing domain tests**

Define a `valid_aggregate` pytest fixture in the same module with one active category, one complete fixed-price product, one tracked active ready-stock variant, and no options.

Create `backend/tests/test_catalog_domain.py` covering:

```python
from decimal import Decimal

from catalog_domain import build_publication_snapshot, public_stock_status


def test_publication_filters_internal_product_variant_and_option_fields(valid_aggregate):
    valid_aggregate["product"]["internal_cost"] = 12000
    valid_aggregate["variants"][0]["reorder_point"] = "2"
    valid_aggregate["options"] = [{
        "id": "opt-1", "name": "Size", "label": "Large",
        "active": True, "internal_cost": 9000,
    }]
    snapshot = build_publication_snapshot(
        valid_aggregate,
        revision=1,
        actor_id="catalog-1",
        reason="Initial publication",
        published_at="2026-07-14T00:00:00+00:00",
    )
    assert snapshot["revision"] == 1
    assert snapshot["publish_reason"] == "Initial publication"
    assert "internal_cost" not in str(snapshot)
    assert "reorder_point" not in str(snapshot)


def test_public_stock_mapping_never_returns_quantity():
    assert public_stock_status("ready_stock", Decimal("0"), Decimal("2")) == "out_of_stock"
    assert public_stock_status("ready_stock", Decimal("2"), Decimal("2")) == "low_stock"
    assert public_stock_status("ready_stock", Decimal("3"), Decimal("2")) == "in_stock"
    assert public_stock_status("made_to_order", Decimal("0"), Decimal("0")) == "made_to_order"
```

Add validation cases for inactive category, missing required copy/media/alt text, no active variant, duplicate variant SKU, non-positive fixed price, missing calculated metadata, disabled B2B RFQ CTA, and ready-stock variants without inventory tracking. Add a deterministic slug test for `Desk Sign / Biru` becoming `desk-sign-biru`.

- [x] **Step 2: Run and confirm import failure**

Run `python -m pytest tests\test_catalog_domain.py -q` from `backend/`.

- [x] **Step 3: Implement explicit allowlists and validation**

Create these allowlists in `backend/catalog_domain.py`:

```python
PUBLIC_PRODUCT_FIELDS = frozenset({
    "id", "name", "slug", "short_description", "description", "media",
    "seo_title", "seo_description", "pricing_mode", "price_from", "currency",
    "retail_cta_enabled", "b2b_cta_enabled", "stock_visibility",
})
PUBLIC_VARIANT_FIELDS = frozenset({
    "id", "sku", "name", "option_values", "fixed_price", "currency",
    "production_type",
})
PUBLIC_OPTION_FIELDS = frozenset({"id", "name", "label", "value", "sort_order"})
```

Implement `normalize_slug`, `validate_catalog_aggregate`, `build_publication_snapshot`, and `public_stock_status`. `build_publication_snapshot` accepts `revision`, `actor_id`, `reason`, and `published_at`, stores publication metadata internally, and filters product, variant, and option objects through the allowlists. Validation returns stable objects with `code`, `field`, and Indonesian `message`.

Add `project_publication_for_public(snapshot, stock_by_variant) -> dict`. It removes `published_by` and `publish_reason`, preserves safe revision/publication time, and adds only `stock_status` to each variant. Compute that status using current internal `available` and the internal variant reorder point; never copy either numeric input into the response.

- [x] **Step 4: Verify the task**

Run `python -m pytest tests\test_catalog_domain.py -q`.

Expected: normalization, validation, privacy projection, publication metadata, and stock-status tests pass.

- [x] **Step 5: Conditional commit checkpoint**

Only with explicit authorization, commit with message `feat: add catalog validation and public projection`.

## Task 3: Add Catalog Persistence, Publication, and Public APIs

**Files:**

- Create: `backend/catalog_service.py`
- Create: `backend/catalog_routes.py`
- Create: `backend/tests/test_catalog_routes.py`
- Modify: `backend/server.py`

**Interfaces:**

- Consume: Task 1 transaction capability/audit and Task 2 validation/projection.
- Produce: category/product administration, variant/option replacement, immutable publication revisions, rollback-as-new-revision, and read-only public APIs.

- [x] **Step 1: Write failing route tests**

Create `backend/tests/test_catalog_routes.py` with a small FastAPI app, Motor-like fake collections, and injected permissions. The happy path must create a category and product, then create the active variant before publish:

```python
category = await api.post("/api/admin/categories", json={
    "name": "Ready Stock", "slug": "ready-stock",
    "description": "Ready products", "sort_order": 1,
}, headers=catalog_headers)

product = await api.post("/api/admin/products", json={
    "category_id": category.json()["id"], "name": "Desk Sign", "slug": "desk-sign",
    "short_description": "Custom sign", "description": "Printed sign",
    "media": [{"storage_path": "catalog/sign.webp", "alt": "Desk sign"}],
    "pricing_mode": "fixed", "price_from": 50000, "currency": "IDR",
    "pricing_rule_reference": None,
    "retail_cta_enabled": True, "b2b_cta_enabled": True,
    "stock_visibility": "status_only",
}, headers=catalog_headers)

variants = await api.put(
    f"/api/admin/products/{product.json()['id']}/variants",
    json={"variants": [{
        "sku": "SIGN-BLUE", "name": "Blue", "fixed_price": 50000,
        "currency": "IDR", "production_type": "ready_stock",
        "inventory_tracking_enabled": True, "reorder_point": "2", "status": "active",
    }]},
    headers=catalog_headers,
)
assert variants.status_code == 200

published = await api.post(
    f"/api/admin/products/{product.json()['id']}/publish",
    json={"reason": "Initial catalog publication"},
    headers=catalog_headers,
)
assert published.status_code == 200
assert published.json()["revision"] == 1

public = await api.get("/api/catalog/products/desk-sign")
assert public.status_code == 200
assert public.json()["product"]["slug"] == "desk-sign"
```

Also prove Warehouse mutation gets `403`, duplicate category/product slug and variant SKU get `409`, invalid publish returns stable field errors, draft edits do not change public data, public data excludes all internal fields, and rollback creates a new revision instead of changing an old one.

- [x] **Step 2: Run and confirm missing routes**

Run `python -m pytest tests\test_catalog_routes.py -q` from `backend/`.

- [x] **Step 3: Implement the service contract**

Implement these concrete `CatalogService` operations in `backend/catalog_service.py`:

| Operation | Required behavior |
|---|---|
| `list_categories`, `get_category` | Return bounded internal category data for authorized staff |
| `list_products`, `get_product` | Return bounded drafts; product detail includes immutable publication history |
| `create_category`, `update_category`, `archive_category` | Normalize slug, archive only, audit each mutation |
| `create_product`, `update_product`, `archive_product` | Maintain working draft and audit; edits set `workflow_status=draft` |
| `replace_variants`, `replace_options` | Replace working children atomically for one product and reject duplicate SKU |
| `validate_product` | Load aggregate and return stable field errors |
| `publish_product` | Validate, build next revision snapshot, write publication/active pointer/audit in one transaction |
| `rollback_product` | Copy a selected old publication into a new revision and update pointer/audit in one transaction |
| `list_public_products`, `get_public_product` | Read active publication only and apply safe public projection |

Map duplicate-key errors to `409`. Publish and rollback first check `capabilities.transactions`; otherwise raise an error mapped to `503 transaction_unavailable`. Both require a 3–500 character reason, persist it only inside the internal publication/audit records, and use the same Mongo session for publication, active pointer, and audit.

- [x] **Step 4: Implement the route matrix**

Create `build_catalog_router(*, get_db, get_client, get_capabilities, require_permission)` with:

| Method and path | Permission |
|---|---|
| `GET /admin/categories` | `catalog.read` |
| `POST /admin/categories` | `catalog.write` |
| `GET /admin/categories/{id}` | `catalog.read` |
| `PUT /admin/categories/{id}` | `catalog.write` |
| `POST /admin/categories/{id}/archive` | `catalog.archive` |
| `GET /admin/products` | `catalog.read` |
| `POST /admin/products` | `catalog.write` |
| `GET /admin/products/{id}` | `catalog.read` |
| `PUT /admin/products/{id}` | `catalog.write` |
| `PUT /admin/products/{id}/variants` | `catalog.write` |
| `PUT /admin/products/{id}/options` | `catalog.write` |
| `POST /admin/products/{id}/validate` | `catalog.write` |
| `POST /admin/products/{id}/publish` | `catalog.publish` |
| `POST /admin/products/{id}/rollback` | `catalog.publish` |
| `POST /admin/products/{id}/archive` | `catalog.archive` |
| `GET /catalog/categories` | public |
| `GET /catalog/products` | public |
| `GET /catalog/products/{slug}` | public |

Pydantic models constrain money to non-negative integers, Decimal quantities to strings at the response boundary, enums to the design values, and reasons to 3–500 characters. Public handlers return explicit response models instead of raw Mongo documents.

- [x] **Step 5: Register and verify**

Register the router before `app.include_router(api)`, then run:

```powershell
python -m pytest tests\test_catalog_domain.py tests\test_catalog_routes.py tests\test_permissions.py -q
```

Expected: permissions, draft isolation, revision history, rollback, conflicts, transaction gating, and public-boundary tests pass.

- [x] **Step 6: Conditional commit checkpoint**

Only with explicit authorization, commit with message `feat: add catalog publication APIs`.

## Task 4: Add Material Registry and Immutable Price Versions

**Files:**

- Create: `backend/material_pricing.py`
- Create: `backend/material_routes.py`
- Create: `backend/tests/test_material_pricing.py`
- Modify: `backend/server.py`

**Interfaces:**

- Consume: material IDs referenced by existing orders, permissions, audit, and integer-IDR convention.
- Produce: expanded material create/update/archive, legacy setup completion, immutable price history, and effective/future price lookup.

- [x] **Step 1: Write failing pricing and compatibility tests**

Create `backend/tests/test_material_pricing.py` with:

```python
from datetime import datetime, timezone

from material_pricing import resolve_effective_price


def test_effective_price_uses_latest_non_future_version():
    versions = [
        {"id": "p1", "amount": 100000, "effective_from": "2026-07-01T00:00:00+00:00"},
        {"id": "p2", "amount": 125000, "effective_from": "2026-08-01T00:00:00+00:00"},
    ]
    at = datetime(2026, 7, 14, tzinfo=timezone.utc)
    assert resolve_effective_price(versions, at=at)["id"] == "p1"
```

Add API cases for create, update, archive, legacy `needs_review` completion, price rejection before setup, current/future price append, no price update/delete routes, unchanged material ID, unchanged order reference, and compatible `GET /api/materials` output.

- [x] **Step 2: Run and confirm failure**

Run `python -m pytest tests\test_material_pricing.py -q` from `backend/`.

- [x] **Step 3: Implement pricing functions and request models**

`resolve_effective_price` parses every `effective_from` with `datetime.fromisoformat`, filters values not later than `at`, and selects `max` using the parsed datetime. It returns `None` before the first effective version.

Use this material shape:

```python
class MaterialPayload(BaseModel):
    sku: str = Field(min_length=2, max_length=100)
    name: str = Field(min_length=2, max_length=200)
    description: str = Field(default="", max_length=2000)
    color: str = Field(default="", max_length=100)
    base_unit: Literal["pcs", "g", "kg", "mm", "cm", "m", "ml", "l", "sheet", "roll"] | None = None
    supplier_reference: str = Field(default="", max_length=200)
    waste_percentage: Decimal = Field(default=Decimal("0"), ge=0, le=100)
    reorder_point: Decimal = Field(default=Decimal("0"), ge=0)
    lead_time_days: int = Field(default=0, ge=0, le=3650)
    inventory_tracking_enabled: bool = False
    setup_status: Literal["needs_review", "ready"] = "needs_review"
    status: Literal["active", "archived"] = "active"
```

Add imports for `Decimal`, `datetime`, `Literal`, `BaseModel`, `Field`, and the Pydantic model validator. Add a validator that requires `base_unit` when `setup_status=ready` and normalize SKU to uppercase. Price append uses `amount: int >= 0`, `currency=IDR`, a supported `price_unit`, timezone-aware `effective_from`, and a 3–500 character reason.

- [x] **Step 4: Implement material and price routes**

Create `build_material_router(*, get_db, require_permission)` with internal list/create/update/archive, a deprecated DELETE-as-archive compatibility alias, legacy public list, internal price-version list/create, effective price read, and future price visibility for internal users.

Use `materials.write` for create/update, `materials.archive` for archive, `pricing.read` for history, and `pricing.write` for append. Price versions are insert-only. On every new or updated material, mirror `active = (status == "active")` until legacy order code is migrated, so existing queries continue to work. Append an audit event for every mutation.

- [x] **Step 5: Remove duplicate handlers and verify**

Remove `MaterialReq` and the old material route block from `server.py`, register the new router, and run:

```powershell
python -m pytest tests\test_material_pricing.py tests\test_identity_foundation.py tests\test_auth_security.py -q
```

Expected: material/pricing cases and legacy order/material references pass.

- [x] **Step 6: Conditional commit checkpoint**

Only with explicit authorization, commit with message `feat: add versioned material pricing`.

## Task 5: Add Pure Inventory Math, Type Rules, and Idempotency

**Files:**

- Create: `backend/inventory_domain.py`
- Create: `backend/tests/test_inventory_domain.py`

**Interfaces:**

- Consume: Decimal quantities and `material|product_variant` subjects.
- Produce: canonical operation fingerprints, movement delta rules, derived balances, type validation, and conflicts.

- [x] **Step 1: Write failing domain tests**

Create `backend/tests/test_inventory_domain.py` with receive, produce, reserve, release, consume, ship, damage, signed adjustment, planning, cancellation, negative protection, invalid subject/movement pair, and order-independent fingerprint tests. Include these core assertions:

```python
BASE = {
    "on_hand": Decimal("10"), "reserved": Decimal("2"),
    "incoming": Decimal("4"), "planned_demand": Decimal("3"),
}

received = apply_deltas(BASE, compute_deltas("receive", Decimal("5")))
assert received["on_hand"] == Decimal("15")
assert received["available"] == Decimal("13")

with pytest.raises(InventoryConflict, match="negative"):
    apply_deltas(BASE, compute_deltas("reserve", Decimal("9")))
```

- [x] **Step 2: Run and confirm import failure**

Run `python -m pytest tests\test_inventory_domain.py -q`.

- [x] **Step 3: Implement exact rules**

Use Decimal throughout, deterministic sorted JSON, and SHA-256 for fingerprints. Implement this delta table:

```python
DELTA_RULES = {
    "receive": {"on_hand": 1},
    "produce": {"on_hand": 1},
    "reserve": {"reserved": 1},
    "release": {"reserved": -1},
    "consume": {"on_hand": -1},
    "ship": {"on_hand": -1},
    "damage": {"on_hand": -1},
    "plan_incoming": {"incoming": 1},
    "cancel_incoming": {"incoming": -1},
    "plan_demand": {"planned_demand": 1},
    "cancel_demand": {"planned_demand": -1},
}
```

Allow material operations `receive|reserve|release|consume|damage|adjustment|plan_incoming|cancel_incoming|plan_demand|cancel_demand`. Allow product-variant operations `produce|reserve|release|ship|damage|adjustment|plan_incoming|cancel_incoming|plan_demand|cancel_demand`.

`adjustment` accepts an explicit signed `on_hand_delta`; every other operation requires positive quantity. Derive `available = on_hand - reserved` and `projected = available + incoming - planned_demand`. Reject negative protected fields while allowing negative projected.

- [x] **Step 4: Verify the task**

Run `python -m pytest tests\test_inventory_domain.py -q`.

Expected: all operation, Decimal, invariant, type, and fingerprint tests pass.

- [x] **Step 5: Conditional commit checkpoint**

Only with explicit authorization, commit with message `feat: add inventory domain rules`.

## Task 6: Add Transactional Inventory Service and Restock Evaluation

**Files:**

- Create: `backend/restock.py`
- Create: `backend/inventory_service.py`
- Create: `backend/tests/test_inventory_service.py`

**Interfaces:**

- Consume: Task 1 capabilities/audit, Task 5 inventory rules, existing users/notifications, and optional email delivery.
- Produce: transactional operations, immutable movements, balances, reservations, active/resolved alerts, and internal notifications.

- [x] **Step 1: Write failing service tests with a transactional fake**

Cover receive success, same-fingerprint replay, mismatched operation ID conflict, negative-stock rollback, compare-and-set retry, reservation transitions, expiry idempotency, shortage deduplication, alert resolution, role-targeted notifications, and email failure after commit.

```python
payload = {
    "operation_id": "11111111-1111-1111-1111-111111111111",
    "subject_type": "material", "subject_id": "mat-1",
    "movement_type": "receive", "quantity": "10",
    "reference_type": "manual_receipt", "reference_id": "receipt-1",
    "reason": "Initial warehouse receipt",
}
result = await service.apply_operation(actor=warehouse, payload=payload)
assert result["balance"]["on_hand"] == "10"
assert len(db.stock_movements.items) == 1
assert len(db.audit_events.items) == 1

replayed = await service.apply_operation(actor=warehouse, payload=dict(payload))
assert replayed["movement"]["id"] == result["movement"]["id"]
assert len(db.stock_movements.items) == 1
```

- [x] **Step 2: Run and confirm import failure**

Run `python -m pytest tests\test_inventory_service.py -q`.

- [x] **Step 3: Implement restock evaluation**

`shortage_triggers(balance, reorder_point)` returns `reorder_point` when available is at or below the threshold and `projected_shortage` when projected is below zero. Use `subject_type:subject_id:trigger_type:active` as the active deduplication key.

On the first active trigger, create one alert and one in-app notification per active user having Warehouse, Manager/Approver, or Superadmin responsibility. On later evaluations update the same active alert without duplicate notifications. Resolve active alerts when their trigger no longer applies. Queue optional email recipient IDs during the transaction and send email only after commit; delivery failure must not roll back stock.

- [x] **Step 4: Implement the service contract**

Implement these concrete `InventoryService` methods:

| Method | Required behavior |
|---|---|
| `apply_operation` | Idempotent transactional movement and balance mutation |
| `create_reservation` | Reserve available stock and create an active reservation transactionally |
| `transition_reservation` | Release or consume exactly once with operation ID and reason |
| `expire_due_reservations` | Release due active reservations using deterministic UUID5 operation IDs |
| `list_balances`, `get_balance`, `list_movements` | Bounded filtered internal reads with Decimal strings |
| `list_alerts`, `resolve_alert` | Bounded alert reads and audited reasoned resolution |

For every write:

1. Reject when transaction capability is unavailable.
2. Compute and persist a canonical request fingerprint.
3. Return the original result for a same-fingerprint replay; return `409` for the same operation ID with different content.
4. Start a Mongo session and transaction.
5. Load or initialize the subject balance.
6. Validate subject/movement/reference state.
7. Apply Decimal deltas and compare-and-set the balance `version`.
8. Insert movement, reservation transition, audit event, alert, and notification with the same session.
9. Retry a stale balance version at most three times.
10. Commit, convert Decimal values to strings, then attempt optional email.

When consume or ship uses an active reservation, decrement both `on_hand` and `reserved`, and transition the reservation to consumed inside the same transaction.

- [x] **Step 5: Verify the task**

```powershell
python -m pytest tests\test_inventory_domain.py tests\test_inventory_service.py tests\test_audit.py -q
```

Expected: transaction fake, rollback, idempotency, concurrency retry, reservation, audit, alert, notification, and email isolation tests pass.

- [x] **Step 6: Conditional commit checkpoint**

Only with explicit authorization, commit with message `feat: add transactional inventory service`.

## Task 7: Add Inventory, Reservation, and Alert APIs With Replica-set Tests

**Files:**

- Create: `backend/inventory_routes.py`
- Create: `backend/tests/test_inventory_routes.py`
- Create: `backend/tests/test_inventory_transactions.py`
- Modify: `backend/server.py`

**Interfaces:**

- Consume: `InventoryService`, permissions, database capability, and existing notification/email service.
- Produce: inventory admin APIs, reservation expiry task, and real MongoDB transaction evidence.

- [x] **Step 1: Write failing route tests**

Test Warehouse read/write and alert management, Warehouse rejection for damage/adjustment, Manager adjustment, Estimator read-only access, Customer rejection, replay behavior, stable `409` conflict payloads, and `503 transaction_unavailable`.

Use Pydantic input with UUID operation ID, `material|product_variant`, allowed movement enum, positive Decimal quantity or signed adjustment delta, reference type/ID, optional expected balance version, and a 3–500 character reason where required.

- [x] **Step 2: Run and confirm missing routes**

Run `python -m pytest tests\test_inventory_routes.py -q`.

- [x] **Step 3: Implement router and dynamic adjustment authorization**

Create `build_inventory_router(*, get_service, require_permission, has_permission)` with:

| Method and path | Permission |
|---|---|
| `GET /admin/inventory/balances` | `inventory.read` |
| `GET /admin/inventory/balances/{subject_type}/{subject_id}` | `inventory.read` |
| `GET /admin/inventory/movements` | `inventory.read` |
| `POST /admin/inventory/movements` | `inventory.write`; additionally require `inventory.adjust` for damage/adjustment |
| `POST /admin/inventory/reservations` | `inventory.write` |
| `POST /admin/inventory/reservations/{id}/release` | `inventory.write` |
| `POST /admin/inventory/reservations/{id}/consume` | `inventory.write` |
| `GET /admin/inventory/restock-alerts` | `restock_alerts.read` |
| `POST /admin/inventory/restock-alerts/{id}/resolve` | `restock_alerts.manage` |

List endpoints use bounded pagination and whitelisted filters. Responses serialize Decimal values as strings. The movement handler checks `has_permission(actor, "inventory.adjust")` after the standard `inventory.write` dependency when movement type is damage or adjustment.

- [x] **Step 4: Register router and expiry lifecycle**

Register the router with `db`, `client`, `app.state.database_capabilities`, `emailer`, `require_permission`, and `has_permission`. At startup create one tracked `asyncio.Task` that checks due reservations every 60 seconds. At shutdown cancel and await it before closing Mongo. Deterministic UUID5 expiry operation IDs prevent duplicate release across app instances.

- [x] **Step 5: Add a real replica-set integration module**

`backend/tests/test_inventory_transactions.py` reads `MONGO_TRANSACTION_TEST_URL` and skips at module level when absent. Use a unique database per run. Prove commit, forced rollback, same-operation replay, mismatched replay conflict, and two concurrent receives with no lost update.

Start the temporary single-node replica set:

```powershell
docker run --rm -d --name niuva-inventory-test-mongo -p 127.0.0.1:27019:27017 mongo:7 --replSet rs0 --bind_ip_all
docker exec niuva-inventory-test-mongo mongosh --quiet --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"localhost:27017"}]})'
$env:MONGO_TRANSACTION_TEST_URL='mongodb://127.0.0.1:27019/?replicaSet=rs0&directConnection=true'
python -m pytest -n 0 tests\test_inventory_transactions.py -q
```

Poll `db.hello().isWritablePrimary` before pytest instead of using a fixed sleep. Always stop the temporary container after verification.

- [x] **Step 6: Verify focused APIs**

```powershell
python -m pytest tests\test_inventory_domain.py tests\test_inventory_service.py tests\test_inventory_routes.py -q
```

Expected: all in-memory inventory tests pass with the repository's two-worker configuration; the real transaction module passes separately with `-n 0`.

- [x] **Step 7: Conditional commit checkpoint**

Only with explicit authorization, commit with message `feat: add inventory and restock APIs`.

## Task 8: Add Idempotent Migration, Indexes, and Startup Wiring

**Files:**

- Create: `backend/migrations/__init__.py`
- Create: `backend/migrations/002_catalog_material_inventory.py`
- Create: `backend/catalog_inventory_indexes.py`
- Create: `backend/tests/test_catalog_material_inventory_migration.py`
- Modify: `backend/server.py`

**Interfaces:**

- Consume: legacy material documents and existing order references.
- Produce: deterministic setup migration, collision reporting, required indexes, and startup capability/index initialization.

- [x] **Step 1: Write failing migration tests**

Seed one active legacy material, one inactive legacy material, and an order referencing the active material. Assert:

- dry-run returns `scanned`, `changed`, `already_migrated`, `needs_review`, `collisions`, `failures`, and `dry_run` without changing documents or indexes;
- apply preserves each material ID and every order reference;
- migrated active/inactive map to `active/archived`;
- migrated documents use deterministic unique legacy SKUs and `setup_status=needs_review`;
- migration creates no price versions or inventory balances;
- a second apply changes zero documents;
- a deterministic SKU collision is reported and blocks writes;
- index declarations match the design requirements.

- [x] **Step 2: Run and confirm missing migration**

Run `python -m pytest tests\test_catalog_material_inventory_migration.py -q`.

- [x] **Step 3: Implement deterministic dry-run-first migration**

Create `legacy_material_sku(material_id)` by normalizing a UUID hex or SHA-256 fallback and using its first 16 uppercase characters in `LEGACY-MAT-<prefix>`. The collision preflight below guarantees uniqueness before apply. For every unmigrated material prepare:

```python
changes = {
    "sku": legacy_material_sku(material["id"]),
    "base_unit": None,
    "supplier_reference": "",
    "waste_percentage": "0",
    "reorder_point": "0",
    "lead_time_days": 0,
    "inventory_tracking_enabled": False,
    "setup_status": "needs_review",
    "status": "active" if material.get("active", True) else "archived",
}
```

Preflight every candidate SKU against another material ID before any apply write. Increment `collisions` and `failures` for conflicts, include the affected material ID without customer data, and exit nonzero without modifying any candidate if a collision exists. The CLI defaults to dry-run and requires `--apply` for writes.

- [x] **Step 4: Implement one shared index declaration**

`ensure_catalog_inventory_indexes(db)` owns all index definitions and is called by migration apply and app startup. Include unique category slug, unique product slug, unique variant SKU, unique material SKU, unique product-publication revision, unique material/effective-time price version, unique inventory subject pair, unique movement operation ID, movement subject/time lookup, unique reservation ID, reservation reference/status lookup, and unique active restock deduplication key. Use partial filters where archive/history semantics require them.

Dry-run must not create indexes. Do not duplicate the definitions in `server.py`.

- [x] **Step 5: Wire startup capability and indexes**

At startup set:

```python
app.state.database_capabilities = DatabaseCapabilities(
    transactions=await probe_transaction_capability(client)
)
```

Add `GET /api/health` returning `{"status": "ok", "transactions": app.state.database_capabilities.transactions}` so readiness diagnostics expose the actual transaction boolean. Never log the connection string. Then call `ensure_catalog_inventory_indexes(db)`. Register catalog/material/inventory routers only once and preserve the current `/api` prefix.

- [x] **Step 6: Verify migration and regressions**

```powershell
python -m pytest tests\test_catalog_material_inventory_migration.py tests\test_material_pricing.py tests\test_catalog_routes.py tests\test_inventory_routes.py tests\test_auth_security.py -q
```

Expected: migration idempotency/collision safety, compatibility, indexes, routes, and auth regressions pass.

- [x] **Step 7: Conditional commit checkpoint**

Only with explicit authorization, commit with message `feat: add catalog inventory migration and indexes`.

## Task 9: Add Frontend Permissions, Catalog Registry, and Product Editor

**Files:**

- Modify: `frontend/src/lib/permissions.js`
- Modify: `frontend/src/lib/permissions.test.js`
- Create: `frontend/src/lib/catalog.js`
- Create: `frontend/src/lib/catalog.test.js`
- Create: `frontend/src/pages/admin/Catalog.jsx`
- Create: `frontend/src/pages/admin/ProductEditor.jsx`
- Modify: `frontend/src/pages/admin/AdminLayout.jsx`
- Modify: `frontend/src/App.js`
- Modify: `frontend/src/i18n.js`

**Interfaces:**

- Consume: catalog admin APIs and authenticated user permissions.
- Produce: permission-aware navigation, registry filters, draft editor, publication validation, and rollback actions.

- [x] **Step 1: Write failing pure-helper and permission tests**

Add route permission assertions for `/admin/catalog`, `/admin/materials`, and `/admin/inventory`. Create `frontend/src/lib/catalog.test.js`:

```javascript
import { emptyProductDraft, normalizeValidationErrors, visibleCatalogActions } from "./catalog";

test("empty catalog draft has explicit safe defaults", () => {
  expect(emptyProductDraft()).toEqual({
    category_id: "", name: "", slug: "", short_description: "", description: "",
    media: [], pricing_mode: "fixed", price_from: 0, currency: "IDR",
    pricing_rule_reference: "", retail_cta_enabled: true, b2b_cta_enabled: true,
    stock_visibility: "status_only",
  });
});

test("validation errors are grouped by field", () => {
  const errors = [{field: "media", code: "required", message: "Media wajib."}];
  expect(normalizeValidationErrors(errors)).toEqual({media: ["Media wajib."]});
});

test("catalog actions follow exact permissions", () => {
  expect(visibleCatalogActions(["catalog.read"])).toEqual([]);
  expect(visibleCatalogActions(["catalog.write", "catalog.publish"])).toEqual(["create", "edit", "publish"]);
});
```

- [x] **Step 2: Run and confirm failure**

From `frontend/` run:

```powershell
npm test -- --watchAll=false --runInBand --testMatch "**/src/**/*.test.js"
```

Expected: catalog helper and new route assertions fail.

- [x] **Step 3: Implement helpers and API wrapper**

`catalog.js` exports the tested pure functions plus API calls for list/create/update categories, list/get/create/update/archive products, replace variants/options, validate, publish, and rollback. Keep backend validation payloads intact so the editor can group errors by field. Do not compute material cost or customer calculated price in the browser.

- [x] **Step 4: Build the Catalog registry**

`Catalog.jsx` renders search/category/workflow/pricing/stock/archive filters, semantic table, loading/error/empty states, and product links. Rows show product, category, active variant count, pricing mode, publication revision, stock policy, update time, and permitted actions. Gate create/edit/publish/archive controls using `catalog.write|catalog.publish|catalog.archive`. Reuse existing `SurfacePanel`, `Table`, `Select`, `Input`, `Button`, `TechnicalLabel`, `EmptyState`, and toast utilities.

- [x] **Step 5: Build the Product editor**

`ProductEditor.jsx` uses existing Tabs for Basic, Media, Variants, Options, Pricing/Stock, and Publish. Keep inputs controlled, persist product/variants/options through separate API calls, display grouped server validation, require a 3–500 character publish/rollback reason, and show immutable revision history. The screen only manages fixed price and calculated/quote metadata.

- [x] **Step 6: Register routes, navigation, and translations**

Lazy-load registry and editor. Protect both `/admin/catalog` and `/admin/catalog/:productId` with `catalog.read`; render fields read-only without `catalog.write`, while publish/archive remain independently permission-gated. Use nested-route active matching in AdminLayout. Add complete Indonesian/English keys for catalog, variants, pricing mode, publication, validation, rollback, and archive.

- [x] **Step 7: Verify frontend helpers and build**

```powershell
npm test -- --watchAll=false --runInBand --testMatch "**/src/**/*.test.js"
npm run build
```

Expected: helper/permission tests pass and the optimized build compiles. Rendered behavior is covered by Task 12 browser QA because no new testing dependency is allowed.

- [x] **Step 8: Conditional commit checkpoint**

Only with explicit authorization, commit with message `feat: add catalog administration UI`.

## Task 10: Upgrade Material Registry With Setup and Price History

**Files:**

- Create: `frontend/src/lib/materials.js`
- Create: `frontend/src/lib/materials.test.js`
- Modify: `frontend/src/pages/admin/Materials.jsx`
- Modify: `frontend/src/i18n.js`

**Interfaces:**

- Consume: expanded material and price-version APIs.
- Produce: legacy setup completion, material editing, effective/future price history, and reasoned archive workflow.

- [x] **Step 1: Write failing helper tests**

Test `materialFormFromRecord` with legacy missing fields, integer-IDR formatting, price payload conversion, supported units, reason validation, setup readiness, and permission-derived actions. Assert a read-only `pricing.read` user gets history but no append action.

- [x] **Step 2: Run and confirm failure**

Run the full frontend Jest command and expect the material helper import to fail.

- [x] **Step 3: Implement material helpers and API wrapper**

Export the supported unit list, safe legacy form defaults, `Intl.NumberFormat("id-ID", {style: "currency", currency: "IDR", maximumFractionDigits: 0})` for labels, and API calls for internal list/create/update/archive, price list, and price append. API amounts remain integers; Decimal fields remain strings.

- [x] **Step 4: Build the operational registry**

Replace the card-only screen with a responsive desktop table and stacked mobile rows. Show SKU, unit, internal supplier reference, setup state, effective/next price, reorder point, lead time, tracking, and status. Keep legacy description/color fields.

Gate edit with `materials.write`, archive with `materials.archive`, price history with `pricing.read`, and price append with `pricing.write`. Archive and price append require reason dialogs. Display API validation/conflict errors through the existing error formatter.

- [x] **Step 5: Verify frontend helpers and build**

Run the full frontend Jest command and `npm run build`.

Expected: material/permission helpers pass and the build compiles; Task 12 verifies the rendered workflow.

- [x] **Step 6: Conditional commit checkpoint**

Only with explicit authorization, commit with message `feat: add material pricing administration UI`.

## Task 11: Add Inventory, Movement History, and Restock Alert UI

**Files:**

- Create: `frontend/src/lib/inventory.js`
- Create: `frontend/src/lib/inventory.test.js`
- Create: `frontend/src/pages/admin/Inventory.jsx`
- Create: `frontend/src/pages/admin/StockMovements.jsx`
- Create: `frontend/src/pages/admin/RestockAlerts.jsx`
- Modify: `frontend/src/lib/permissions.js`
- Modify: `frontend/src/pages/admin/AdminLayout.jsx`
- Modify: `frontend/src/App.js`
- Modify: `frontend/src/i18n.js`

**Interfaces:**

- Consume: balance, movement, reservation, alert APIs, and role permissions.
- Produce: exact internal stock monitoring, type-safe mutation forms, immutable history, and alert resolution.

- [x] **Step 1: Write failing inventory helper tests**

Create tests for operation defaults with `crypto.randomUUID`, Decimal-string payload preservation, movement types by subject, Manager-only damage/adjustment visibility, stable `409` messages, status tones, reason validation, and alert action permissions.

```javascript
const value = operationDefaults("material", "mat-1", "receive");
expect(value.subject_type).toBe("material");
expect(value.subject_id).toBe("mat-1");
expect(value.operation_id).toMatch(/^[0-9a-f-]{36}$/);
expect(value.quantity).toBe("");
expect(parseInventoryConflict({code: "stale_balance"})).toBe(
  "Data stok berubah. Muat ulang sebelum mencoba lagi."
);
```

- [x] **Step 2: Run and confirm missing module**

Run the full frontend Jest command and expect the inventory helper import to fail.

- [x] **Step 3: Implement inventory helpers and API wrapper**

Export material/product-variant movement constants, permission-derived movement actions, operation/reservation payload builders, conflict mapping, semantic status tones, and API calls for balances, single balance, movements, apply, reserve, release, consume, alerts, and resolve alert. Keep all quantities as strings until the API validates them.

- [x] **Step 4: Build the three operational pages**

`Inventory.jsx` shows bounded filters and exact internal balance columns. Gate normal movements with `inventory.write`; hide damage/adjustment unless `inventory.adjust` exists. Require references and reasons according to the API.

`StockMovements.jsx` is read-only and filterable by subject, type, reference, actor, and date. Show immutable before/after values.

`RestockAlerts.jsx` shows active/resolved state, severity, trigger, internal safe metrics, recipients, timestamps, and a reasoned resolve action gated by `restock_alerts.manage`.

- [x] **Step 5: Register routes and translations**

Add route permissions:

```javascript
"/admin/inventory": "inventory.read",
"/admin/stock-movements": "inventory.read",
"/admin/restock-alerts": "restock_alerts.read",
```

Lazy-load the pages, add permission-filtered navigation, and add Indonesian/English labels. Unauthorized users must not see links and must still be blocked by route guards and backend permissions.

- [x] **Step 6: Verify frontend helpers and build**

Run the full frontend Jest command and `npm run build`.

Expected: inventory/permission helper suites pass and the optimized build compiles; Task 12 verifies rendered loading/error/empty/conflict/action behavior.

- [x] **Step 7: Conditional commit checkpoint**

Only with explicit authorization, commit with message `feat: add inventory and restock administration UI`.

## Task 12: Add Operations Runbook and Perform Full Verification

**Files:**

- Create: `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md`
- Modify: `backend/tests/backend_test.py`
- Verify: all backend/frontend files from Tasks 1–11

**Interfaces:**

- Consume: completed foundation, migration, Admin Studio, and Docker replica-set flow.
- Produce: reproducible rollout/rollback/handoff documentation and final evidence.

- [x] **Step 1: Extend external API coverage**

Add URL-dependent assertions to `backend/tests/backend_test.py` for Catalog Manager create/validate/publish/public read, legacy material setup/current/future price append, Warehouse receive/replay, Manager adjustment, Customer admin rejection, and public exclusion of supplier reference, exact balances, prices, reorder points, actor/audit fields, and internal rules. Retain the module-level skip when `REACT_APP_BACKEND_URL` is absent.

- [x] **Step 2: Write the operational runbook**

`docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md` contains:

1. Scope and owners
2. MongoDB replica-set prerequisite and capability check
3. Non-production backup
4. Migration dry-run command and expected summary keys
5. Migration apply command
6. Legacy material setup workflow
7. Catalog publish and rollback workflow
8. Material price update and correction workflow
9. Stock operation, reservation, and conflict recovery
10. Restock alert delivery and resolution
11. Post-deployment verification queries
12. Application rollback and database restore boundaries
13. Emergency response for balance/movement mismatch
14. Handoff checklist and named role ownership

Do not include credentials, real customer data, or production connection strings.

- [x] **Step 3: Run complete backend verification**

From repository root:

```powershell
python -m compileall -q backend
python -m pytest -q --basetemp C:\tmp\niuva-catalog-inventory-final backend\tests
python -m pip check
```

Expected: compile and dependency checks exit zero; all local tests pass and only the URL-dependent external module may skip.

- [ ] **Step 4: Run real transaction verification**

Start the Task 7 replica set, poll for primary, set `MONGO_TRANSACTION_TEST_URL`, and run:

```powershell
python -m pytest -n 0 backend\tests\test_inventory_transactions.py -q
```

Expected: commit, rollback, concurrency, and idempotency tests pass. Stop the temporary container afterward.

- [x] **Step 5: Verify migration against isolated populated data**

Seed active/inactive legacy materials and an order reference. Prove dry-run has no effects, apply preserves IDs/references, collision handling blocks unsafe writes, and second apply is a no-op.

- [x] **Step 6: Run frontend verification**

```powershell
Set-Location frontend
npm test -- --watchAll=false --runInBand --testMatch "**/src/**/*.test.js"
npm run build
```

Expected: all Jest suites pass and production build compiles. A missing `REACT_APP_PUBLIC_SITE_URL` may skip sitemap generation but must not fail the build.

- [ ] **Step 7: Perform browser permission and workflow QA**

Against a non-production API verify:

- Catalog Manager sees Catalog/Pricing actions but no stock mutations.
- Warehouse sees Materials, Inventory, Movements, and Alerts but no catalog publish or damage/adjustment.
- Sales/Estimator sees read-only catalog, material pricing, and inventory data.
- Manager sees archive and adjustment actions.
- Customer cannot enter Admin Studio routes.
- Draft changes do not alter public data before publish.
- Public catalog never renders exact/internal values.
- Receive, reserve, release, consume/ship, shortage, and resolve flows update without console errors.
- Loading, empty, error, validation, stale-version conflict, and unauthorized states are understandable.

Automate repeatable portions with the existing Playwright CLI or in-app browser controller, without adding a frontend dependency, and save concise pass/fail evidence in the runbook.

- [x] **Step 8: Run final repository checks**

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors or unexpected generated artifacts. Review every changed file against the design acceptance criteria.

- [x] **Step 9: Conditional final commit checkpoint**

Only with explicit authorization:

```powershell
git add -- backend frontend/src docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md
git commit -m "feat: complete catalog material pricing inventory foundation"
```

Do not push, merge, delete a branch, or remove the implementation worktree without separate user direction.

## Code Review Remediation — 2026-07-15

- [x] Preserve variant and configuration-option identity across SKU/code renames by resolving submitted IDs first.
- [x] Reject foreign, duplicate submitted, and duplicate resolved child IDs before any write.
- [x] Preflight SKU/option-code conflicts and replace children, archive omissions, mark the product draft, and append audit in one transaction.
- [x] Add unique variant ID, option ID, and per-product option-code indexes.
- [x] Preflight every unique index during migration dry-run/apply and block all writes when existing data violates a constraint.
- [x] Use database-side aggregation for production index preflight so large collections are not truncated at the test-fixture batch limit.
- [x] Add permission-controlled active-reservation listing and dedicated Release/Consume transitions.
- [x] Reject generic Reserve/Release movements at both route and service boundaries.
- [x] Add permission-aware category create/edit/archive workflows so a clean installation can create its first product.
- [x] Add Indonesian/English labels, empty states, validation, conflict handling, and reload behavior for the new workflows.
- [x] Verify remediation with 85 passing backend tests, 16 passing frontend tests, successful compile/dependency checks, optimized frontend build, and `git diff --check`.

Real Mongo replica-set verification and browser role/workflow QA remain deliberately unchecked in Steps 4 and 7 until the required external environment is available.
