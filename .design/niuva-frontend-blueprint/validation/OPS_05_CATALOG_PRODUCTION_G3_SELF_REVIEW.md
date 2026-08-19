# OPS-05 — Catalog, Material, Inventory, and Work-Order G3 Self-Review

**Status:** G3 self-review complete — `PASS WITH HOLD`; no runtime source,
API, schema, permission, lifecycle, provider, or token change made

**Date:** 20 August 2026

**Baseline:** `origin/main`
`3e9b16caf1e56a14f64686b5925a5515a666d95d`

**Worktree:** `docs/niuva-ops05-catalog-production-g3-20260820`

**Frontend axis:** `PRESENTATION_BOUNDED` with bounded G4 holds

**Capability axis:** `DEFERRED`

**Legacy disposition:** `DEFERRED_WITH_OWNER_REASON`

## 1. Review boundary

This review reconciles the Operations Catalog, Materials, Inventory, Restock,
Stock Movements, and Work Order family against the approved Admin Studio,
access, transaction, inventory, and DS-04 collection/state contracts. It names
the smallest candidate G4 scope but does not authorize runtime implementation.

No source, test, route, dependency, token, API, schema, permission, lifecycle,
provider, migration, or business-rule file was changed during the G3 review.
Phase 7 remains frozen.

The candidate wireframe
[`PRODUCT_PRODUCTION_FAMILY.md`](../wireframes/operations/PRODUCT_PRODUCTION_FAMILY.md)
is context-only. It does not turn a visual list, status, or editor into
catalog, inventory, production, or publication authority.

## 2. Authority and evidence inspected

### 2.1 Canonical and supporting authority

- `docs/NIUVA_MASTER_SPEC.md`;
- `docs/context/DOCUMENT_REGISTER.md`;
- `docs/decisions/DECISION_REGISTER.md`;
- `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md`;
- `docs/decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md`;
- `docs/adr/ADR-001-mongodb-transaction-capability.md`;
- `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md`;
- `DESIGN.md` within its approved Operations scope;
- DS-02/DS-03/DS-04/DS-05 blueprint contracts;
- `PRODUCT_PRODUCTION_FAMILY.md`; and
- `PHASE_6_CLOSURE_LEDGER.md` plus `PHASE_6_PENDING_G3_SELF_REVIEW.md`.

### 2.2 Route, frontend, adapter, backend, and test paths

The exact paths inspected are recorded in the task card. The runtime review
covered:

- `frontend/src/App.js`;
- `frontend/src/lib/permissions.js`;
- `frontend/src/lib/adminWorkbench.js`;
- `frontend/src/lib/catalog.js`;
- `frontend/src/lib/materials.js`;
- `frontend/src/lib/inventory.js`;
- `frontend/src/lib/b2bPagination.js`;
- `frontend/src/i18n.js`;
- `frontend/src/lib/domain-translations.js`;
- `frontend/src/pages/admin/Catalog.jsx`;
- `frontend/src/pages/admin/ProductEditor.jsx`;
- `frontend/src/pages/admin/Materials.jsx`;
- `frontend/src/pages/admin/Inventory.jsx`;
- `frontend/src/pages/admin/StockMovements.jsx`;
- `frontend/src/pages/admin/RestockAlerts.jsx`;
- `frontend/src/pages/admin/ProjectWorkOrders.jsx`;
- `frontend/src/pages/admin/WorkOrderDetail.jsx`;
- `frontend/src/pages/admin/B2BList.jsx`; and
- `frontend/src/pages/admin/B2BDetail.jsx`.

The backend/API review covered:

- `backend/catalog_routes.py` and `backend/catalog_service.py`;
- `backend/material_routes.py`;
- `backend/inventory_routes.py`, `backend/inventory_service.py`, and
  `backend/inventory_domain.py`;
- `backend/b2b_routes.py` and `backend/b2b_service.py`; and
- the catalog, inventory, stock-movement, and Work Order test files named in
  the task card.

## 3. Existing bounded evidence

### 3.1 Route and permission boundary

- `App.js` exposes the named catalog, material, inventory, movement, restock,
  and Work Order routes.
- `permissions.js` and `adminWorkbench.js` keep route visibility and menu
  visibility permission-derived; visibility is not treated as authorization.
- Work Order commands distinguish `production.write`, `inventory.write`, and
  `qc.write`, matching the approved separation of duties.
- Material supplier reference, price history, archive, and write actions have
  separate permission checks in the frontend and backend.

### 3.2 State and domain evidence already present

- Catalog and Product Editor include loading, error/retry, validation,
  submitting, archive, publication, and revision-history branches.
- Inventory carries server-computed stock status, expected balance versions,
  operation IDs, reservation transitions, and conflict messages.
- Stock Movements renders a desktop table and a mobile alternative and keeps
  movement history append-oriented.
- Restock Alerts has status selection, loading, empty, error/retry, and guarded
  resolve behavior.
- Work Order list/detail carries cursor pages, retained records on continuation
  failure, expected versions, operation IDs, reason fields, blockers, material
  requirements, status adapters, and history.
- `B2BList` already has caller-owned `overflow-hidden` for its collection
  consumers; `SurfacePanel` remains unchanged.

### 3.3 Backend evidence

Focused backend tests at the selected baseline passed for catalog transaction
and lifecycle boundaries, inventory permissions/idempotency/conflicts,
append-only movement rules, and Work Order quantity/version/lifecycle,
allocation, shortage, and QC behavior. These tests do not establish staging,
provider, production-readiness, or go-live evidence.

## 4. Proven gaps and required preceding contracts

### G3-HOLD-01 — Stock Movement query parity

`StockMovements.jsx` persists `movement_type`, `actor`, and `date` in the URL
and filters the returned array locally. The current `GET /admin/inventory/
movements` and CSV export routes accept only `subject_type`, `subject_id`,
`reference_id`, and `limit` (`backend/inventory_routes.py` around lines
157–172 and 200–213). A deep link can therefore filter only the bounded
response returned by the server, and export can omit the selected local
criteria.

Required before G4: an approved query contract defining supported fields,
stable ordering, limit/cursor behavior, no-match meaning, and export parity.
No client-side workaround may claim complete history coverage.

### G3-HOLD-02 — Bounded internal collections and no-match semantics

Admin catalog/category, materials, balances, adjustment requests, and restock
alerts currently use bounded list responses while their pages filter locally.
The catalog admin list has no query or cursor parameters
(`backend/catalog_routes.py` around lines 308–312), and the material and
inventory internal list routes likewise return bounded collections. A local
filter is not an authoritative search over records outside the response.

Required before G4: either an approved cursor/limit/query projection contract
or an explicit bounded maximum with a visible incomplete-scope rule. Empty and
no-match states must remain distinct.

### G3-HOLD-03 — ID/EN localization and domain-status presentation

Static inspection found raw or mixed copy in the named Operations consumers:

- `Catalog.jsx` and `ProductEditor.jsx` render literal `Slug`/`SKU` and raw
  workflow/status values;
- `Materials.jsx` renders `NEEDS_REVIEW`, `READY`, raw status values, and
  literal English action labels;
- `Inventory.jsx` contains hardcoded English/Indonesian adjustment headings,
  table heads, action labels, and an approval toast;
- `RestockAlerts.jsx` renders raw trigger and status enums; and
- `ProjectWorkOrders.jsx` includes literal unit/action fragments outside the
  domain translation contract.

Required before G4: approved ID/EN keys and resource-specific status/trigger
adapters. Shared tone must not merge catalog, material, inventory, alert, and
Work Order lifecycle names.

### G3-HOLD-04 — Visible approval and recovery feedback

Inventory adjustment approval/rejection currently reports its result through a
toast and closes/refreshes through page state. The important outcome has no
persistent inline result or retry/reconciliation region, while safe reason and
record context must remain available after a failure.

Required before G4: a visible success/error/conflict contract, focus return,
and safe retry behavior. A live region may reinforce but cannot be the sole
representation.

### G3-HOLD-05 — Embedded Work Order bootstrap state

`ProjectWorkOrders.jsx` starts with an empty array and does not track loading.
Until its first request resolves, the same empty-project copy can be rendered
as a genuine no-record result. Its error branch is visible, but loading,
no-match, and retry/focus semantics are not distinct.

Required before G4: a bounded loading/no-record/error contract that preserves
the project version and form context; Work Order lifecycle authority remains
unchanged.

### G3-HOLD-06 — Product Editor compound-save reconciliation

`ProductEditor.jsx` updates the product and then replaces variants and options
through separate requests in `Promise.all`. Each backend mutation is guarded,
but the UI has no single aggregate operation or explicit partial-success
reconciliation state if one request succeeds and another fails.

Required before G4: an owner/domain decision between an approved aggregate
mutation contract and explicitly split save actions with truthful partial
success/retry behavior. No frontend-only “success” may imply atomicity.

## 5. State and recovery matrix

| State | G3 conclusion | Required G4 evidence |
| --- | --- | --- |
| Ready | Identity, scope, and authorized actions are generally present | Localized status/trigger and factual scope labels |
| Loading/bootstrap | Most standalone routes have a loading branch | Add explicit embedded Work Order loading; preserve hierarchy |
| Empty | Present on catalog/material/inventory/restock/movement views | Separate authoritative empty from no-match |
| No-match | Local filters can collapse a bounded response to zero | Approved query scope, visible criteria, and reset |
| Validation | Numeric/reason/field validation exists in several forms | Approval and embedded quantity/error focus evidence |
| Dependency/system error | Initial retry branches are visible | Persistent mutation result and bounded retry/reconciliation |
| Permission/forbidden | Route and command permissions are explicit | Projection redaction and role matrix evidence |
| Conflict/stale | Inventory/Work Order backend contracts are present | Compound editor save reconciliation |
| Expired/unavailable | Transaction/provider seams remain inactive | Localized unavailable state without capability implication |
| Uncertain | Operation IDs and versions protect backend mutations | UI must reconcile before any duplicate retry |
| Recovery | URL context and Work Order back links exist | Preserve criteria/reason/focus on failed approval/query |
| Success/reference | Several outcomes are toast-led | Visible exact result/reference and remaining action |

## 6. Verification evidence

### 6.1 Backend

The following focused command was run against the selected baseline using the
existing main-worktree backend virtual environment (no dependency or file was
copied into this worktree):

```powershell
python -m pytest -q `
  backend/tests/test_catalog_routes.py `
  backend/tests/test_catalog_domain.py `
  backend/tests/test_catalog_bill_of_materials.py `
  backend/tests/test_catalog_material_inventory_migration.py `
  backend/tests/test_inventory_domain.py `
  backend/tests/test_inventory_routes.py `
  backend/tests/test_inventory_service.py `
  backend/tests/test_inventory_stock_status.py `
  backend/tests/test_inventory_transactions.py `
  backend/tests/test_stock_movement_contract.py `
  backend/tests/test_b2b_work_orders.py `
  backend/tests/test_work_order_allocation_integration.py `
  backend/tests/test_work_order_shortage_recovery.py -n 0
```

Result: **115 passed, 2 skipped**. Skips are environment-bound integration
cases and are not promoted to passes.

### 6.2 Frontend

Frontend focused Jest could not be executed in this isolated worktree because
it has no `frontend/node_modules`. Invoking the main worktree CRACO binary
first failed on the isolated config's missing `dotenv`; using `NODE_PATH` to
the main dependencies reached Jest but failed before collection because
`@testing-library/jest-dom` was not resolvable from the isolated setup file.
No dependency was installed or changed. Static source and contract-test
inspection completed for every exact path in the task card.

### 6.3 Non-runtime checks

- No source diff exists in this G3 worktree.
- No new dependency, token, route, API, schema, or provider was introduced.
- Browser, Axe, Impeccable, build, and production claims are intentionally not
  asserted for a documentation-only G3 review; the future G4 card must require
  proportional browser and accessibility evidence.

## 7. Verdict and next gate

**G3 verdict: `PASS WITH HOLD`.** The family is safe to review and its current
frontend presentation is bounded, but six named holds remain. The next safe
step is to resolve the movement query/projection contract, collection scope,
localization/status mapping, approval feedback, embedded loading state, and
compound-save reconciliation in a reviewed G4 contract. Only then may exact
runtime files be changed.

The capability axis remains `DEFERRED`: no catalog publication, material price,
inventory mutation, restock delivery, production transition, QC outcome,
provider, or production-readiness claim is activated by this review.

Phase 7 remains explicitly frozen.

## 8. Delivery and rollback notes

This self-review and its task card are documentation evidence only. A future
G4 must use a new owned worktree from a fresh `origin/main`, stage only the
approved paths, run focused/full tests and responsive/accessibility checks,
record unchanged files and remaining holds, and preserve rollback by keeping
all existing domain routes and APIs compatible unless an approved contract
states otherwise.
