# OPS-05 — Catalog, Material, Inventory, and Work-Order G4 Exact-File Task Card

**Status:** Candidate G4 task card — exact-file plan only; owner/domain
contract review and a separate G4 implementation gate are required

**Date:** 20 August 2026

**Repository baseline:** `origin/main`
`ffa30bf5ef26042abb75221c379aeed9711abae2`

**Worktree:** `docs/niuva-ops05-g4-contracts-20260820`

**Related contract:**
[`OPS_05_CATALOG_PRODUCTION_G4_API_DOMAIN_CONTRACT.md`](OPS_05_CATALOG_PRODUCTION_G4_API_DOMAIN_CONTRACT.md)

**Phase:** Phase 6 frontend migration; Phase 7 remains frozen

This card translates the six OPS-05 G3 holds into bounded implementation
slices. It does not authorize source changes, API activation, schema work, or
production capability. Only the named files for an approved sub-slice may be
staged. A sub-slice may be rejected or narrowed after owner/domain review of
the companion contract.

## 1. Preconditions and stop conditions

G4 may start only when all of the following are recorded:

- owner/domain approval of the six contract decisions, including split-save
  choice B;
- confirmation that existing permissions, projections, lifecycle enums, and
  transaction guards remain authoritative;
- exact response compatibility and migration/rollback behavior for any list
  envelope or new adjustment detail read;
- named backend and frontend test owners; and
- a fresh implementation worktree from the then-current `origin/main`.

Stop immediately if implementation would require an unlisted file, a new
permission/role, a schema or migration, a provider, a transaction fallback, a
new lifecycle state, or a claim of complete history without server scope.

## 2. Bounded G4 sub-slices

### G4-A — Query parity, pagination, projection, and export

**Purpose:** make movement filters, internal collection criteria, cursor
continuation, no-match semantics, and CSV scope server-authoritative.

**Candidate write paths:**

- `backend/inventory_routes.py`
- `backend/inventory_service.py`
- `backend/catalog_routes.py`
- `backend/catalog_service.py`
- `backend/material_routes.py`
- `backend/tests/test_inventory_routes.py`
- `backend/tests/test_inventory_service.py`
- `backend/tests/test_stock_movement_contract.py`
- `backend/tests/test_catalog_routes.py`
- `backend/tests/test_catalog_domain.py`
- `frontend/src/lib/inventory.js`
- `frontend/src/lib/catalog.js`
- `frontend/src/lib/materials.js`
- `frontend/src/pages/admin/Catalog.jsx`
- `frontend/src/pages/admin/Materials.jsx`
- `frontend/src/pages/admin/Inventory.jsx`
- `frontend/src/pages/admin/StockMovements.jsx`
- `frontend/src/pages/admin/RestockAlerts.jsx`
- `frontend/src/pages/admin/stock-deep-links.contract.test.js`
- `frontend/src/pages/admin/inventory-select-render.test.jsx`
- `frontend/src/pages/admin/catalog-production.contract.test.js` (new only if
  existing suites cannot express the contract)
- `backend/tests/test_ops05_query_contract.py` (new only if existing backend
  suites cannot express the contract)

**Required evidence:** server-side filter parity, query-bound cursor tests,
stable ordering, allowlisted projection, explicit complete/no-match states,
export parity and cap behavior, permission/BOLA coverage, and unchanged
movement append-only rules.

### G4-B — ID/EN resource-status adapters

**Purpose:** remove raw/mixed domain enum presentation without merging
lifecycles.

**Candidate write paths:**

- `frontend/src/lib/domain-translations.js`
- `frontend/src/i18n.js`
- `frontend/src/pages/admin/Catalog.jsx`
- `frontend/src/pages/admin/ProductEditor.jsx`
- `frontend/src/pages/admin/Materials.jsx`
- `frontend/src/pages/admin/Inventory.jsx`
- `frontend/src/pages/admin/RestockAlerts.jsx`
- `frontend/src/pages/admin/ProjectWorkOrders.jsx`
- `frontend/src/pages/admin/catalog-production.contract.test.js` (new only if
  needed)
- `frontend/src/pages/admin/work-order.contract.test.js` (only for a proven
  Work Order copy regression)

**Required evidence:** complete ID/EN keys for every visible state and
resource-specific adapter tests, including unknown-enum localized fallback.
No raw technical enum may be the only visible label.

### G4-C — Adjustment approval and recovery feedback

**Purpose:** replace toast-only decision outcomes with visible, reconciled
success/error/conflict/uncertain states.

**Candidate write paths:**

- `frontend/src/pages/admin/Inventory.jsx`
- `frontend/src/lib/inventory.js`
- `frontend/src/pages/admin/inventory-select-render.test.jsx`
- `backend/inventory_routes.py` (only if the approved contract adds the
  single-request reconciliation read)
- `backend/inventory_service.py` (only with the preceding route change)
- `backend/tests/test_inventory_routes.py` (only with the preceding route
  change)

**Required evidence:** expected-version and operation-ID preservation, no
  duplicate retry, visible inline result, focus return, safe reason/context
  retention, and distinct `401/403/404/409/422/5xx` handling.

### G4-D — Embedded Work Order bootstrap

**Purpose:** distinguish bootstrap loading, authoritative empty/no-match,
dependency error, and uncertain creation without changing Work Order domain
authority.

**Candidate write paths:**

- `frontend/src/pages/admin/ProjectWorkOrders.jsx`
- `frontend/src/pages/admin/B2BDetail.jsx` (only if return/project-version
  context requires a paired change)
- `frontend/src/pages/admin/work-order.contract.test.js`
- `frontend/src/pages/admin/b2b-workbench.contract.test.js` (regression only)

`frontend/src/lib/b2bPagination.js`, `backend/b2b_routes.py`, and
`backend/b2b_service.py` are **not** write paths for this sub-slice unless a
reproducible API regression is proven and separately added to the exact-file
review.

### G4-E — Product Editor split-save reconciliation

**Purpose:** make product, variant, and option persistence truthful without
inventing an aggregate mutation endpoint.

**Candidate write paths:**

- `frontend/src/pages/admin/ProductEditor.jsx`
- `frontend/src/lib/catalog.js` (only if adapters need per-section operation
  state; existing endpoints remain)
- `frontend/src/pages/admin/catalog-production.contract.test.js` (new only if
  needed)
- `frontend/src/lib/catalog.test.js` (only for adapter-level coverage)

`backend/catalog_routes.py` and `backend/catalog_service.py` are not write
paths for split-save G4-E. An aggregate backend save is a future, separately
reviewed contract, not an implicit fallback.

### G4-F — Cross-slice contract/regression evidence

**Purpose:** prove that the five implementation slices do not broaden
authority or regress shared Operations composition.

**Candidate write paths:**

- `frontend/src/pages/admin/catalog-production.contract.test.js`
- `frontend/src/pages/admin/inventory-select-render.test.jsx`
- `frontend/src/pages/admin/stock-deep-links.contract.test.js`
- `frontend/src/pages/admin/work-order.contract.test.js`
- `backend/tests/test_ops05_query_contract.py` (if created by G4-A)
- `backend/tests/test_inventory_transactions.py` (only for a proven
  transaction-boundary regression)

No test file may be changed merely to turn an existing failure into a pass;
the assertion must correspond to an approved contract clause.

## 3. Exact-file rules

- The lists above are candidate paths, not permission to stage all of them in
  one commit.
- Each sub-slice gets its own exact-file review, focused tests, and rollback
  note. Unchanged paths must be reported.
- No `git add .`, broad formatting, generated artifacts, dependency updates,
  route registration, schema/migration, permission, provider, or token-global
  change is allowed.
- Existing `SurfacePanel` clipping remains caller-owned; no primitive-level
  `overflow-hidden` change is part of OPS-05.
- Existing APIs remain backward-compatible unless the approved contract
  explicitly records a versioned envelope transition and all consumers are
  named.

## 4. Validation matrix before any G4 closure

| Area | Required evidence |
| --- | --- |
| Backend/API | Focused route/service tests for query validation, cursor binding, ordering, projection/redaction, export cap, error codes, BOLA, and transaction guard |
| Frontend | Focused contract/render tests for request shape, state matrix, ID/EN adapters, no-match/reset, focus, and partial save |
| Browser | Local backend and frontend with ID/EN at 320/390/768/1024/1440px; no overflow; keyboard traversal; 200% zoom; reduced motion |
| Data quality | Completeness, validity, consistency, uniqueness, timeliness, integrity, and traceability evidence |
| Review | `git diff --check`, dependency/bundle audit, Impeccable critique, exact staged-path review, and unchanged-file report |

Local evidence is not staging, production, readiness, or go-live evidence.

## 5. Explicit exclusions

OPS-05 G4 does not activate or change catalog publication, material pricing
policy, inventory arithmetic, reservation, restock delivery, production
transition, QC outcome, provider/storage/notification, payment, customer
capability, role/permission, lifecycle enum, database schema/migration,
transaction topology, Phase 7, or global design-token/art-direction work.

**Next gate:** `OWNER/DOMAIN REVIEW REQUIRED` for
[`OPS_05_CATALOG_PRODUCTION_G4_API_DOMAIN_CONTRACT.md`](OPS_05_CATALOG_PRODUCTION_G4_API_DOMAIN_CONTRACT.md)
and this exact-file plan. Runtime implementation remains a separate G4 gate.
