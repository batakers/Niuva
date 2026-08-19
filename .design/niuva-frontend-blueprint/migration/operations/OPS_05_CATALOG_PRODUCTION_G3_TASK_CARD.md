# OPS-05 — Catalog, Material, Inventory, and Work-Order G3 Review

**Status:** Candidate G3 task card — exact-source review completed; bounded
G4 contract work is identified, but no runtime source change is authorized by
this card

**Date:** 20 August 2026

**Repository baseline:** `origin/main`
`3e9b16caf1e56a14f64686b5925a5515a666d95d`

**Worktree:** `docs/niuva-ops05-catalog-production-g3-20260820`

**Surface:** Operations / Admin — Catalog, Materials, Inventory, Restock,
Stock Movements, and Work Orders

**Phase:** Phase 6 frontend migration; Phase 7 remains frozen

**Owner direction:** The owner authorized reconciliation and entry into OPS-05
after the merged OPS-04 delivery. This review keeps the frontend and capability
axes separate. It does not activate catalog publication, pricing, inventory,
production, provider, or go-live capability.

## 1. Objective and boundary

Review the current Operations product/production route family against the
approved Niuva authority and the candidate
[`PRODUCT_PRODUCTION_FAMILY.md`](../../wireframes/operations/PRODUCT_PRODUCTION_FAMILY.md).
Name the smallest exact source/test set for a later G4 only where a
reproducible presentation, localization, query, projection, or recovery gap
exists.

This card is a G3 review and planning record. It may document a contract gap;
it may not silently repair that gap, add an API, or promote a candidate
wireframe into runtime authority.

The following remain separate contracts:

- catalog publication and product/variant configuration;
- material registry and material price versions;
- inventory balances, append-only movements, reservations, and adjustments;
- restock alerts as an exception utility; and
- Work Order execution, allocation, consumption, transition, and QC.

A shared table, status label, `SurfacePanel`, or loading state never becomes
authority for a product, material, movement, reservation, Work Order, price,
publication, or production transition.

## 2. Authority and precedence

Resolve conflicts in this order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md` and the applicable approved decision
   or ADR;
4. `DESIGN.md` within its approved scope;
5. the applicable runbook and current source/tests as implementation evidence;
6. the Phase 6 ledger, DS-02 through DS-05 contracts, and this card; and
7. the candidate wireframe only within its documented scope.

The primary applicable authority is:

- `DEC-OPS-001` for role-aware, permission-aware, task-oriented, dense-but-
  calm, status-driven, auditable, and recovery-aware Admin Studio;
- `DEC-ACCESS-002` for stable internal roles, least-privilege domain
  responsibilities, separation of duties, and allowlisted audit projections;
- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md` for fail-closed transaction
  boundaries on cross-collection mutations;
- `CATALOG_MATERIAL_INVENTORY_RUNBOOK.md` for publication, material setup,
  immutable pricing, movement idempotency, conflict recovery, restock, and
  rollback; and
- DS-02 through DS-05, especially the collection/state laws: route-owned query
  meaning, factual counts, distinct empty/no-match/error states, retained
  context on retry, visible focus, safe projections, and resource-specific
  status adapters.

Source and tests prove current behavior only. They do not authorize a new
permission, schema, lifecycle enum, provider, migration, transaction
fallback, inventory arithmetic rule, production promise, or deployment.

## 3. Route family and ownership inventory

| Route | Current composition | Permission boundary | G3 disposition |
| --- | --- | --- | --- |
| `/admin/catalog` | `Catalog` | `catalog.read`; write/archive actions are separately permission-gated | Review collection query, filters, localized status, and no-match/recovery semantics |
| `/admin/catalog/:productId` | `ProductEditor` | Parent `catalog.read`; commands require `catalog.write`, `catalog.publish`, `catalog.archive`, or `media.write` | Review compound-save reconciliation, validation, media/provider boundary, and long-label states |
| `/admin/materials` | `Materials` | `materials.read`; material, archive, pricing, and supplier-reference permissions are distinct | Review projection, N+1 price query, setup/status localization, and mutation recovery |
| `/admin/inventory` | `Inventory` | `inventory.read`; writes and adjustment approval are separate | Review bounded query, numeric/conflict states, visible approval feedback, and localization |
| `/admin/stock-movements` | `StockMovements` | `inventory.read`; movement writes are separately gated | Review URL filter/API parity, append-only history, export parity, and continuation limits |
| `/admin/restock-alerts` | `RestockAlerts` | `restock_alerts.read`; resolve requires `restock_alerts.manage` | Review alert projection, enum localization, limit/recovery, and reason feedback |
| `/admin/b2b/work-orders` | `B2BList.WorkOrderList` | `production.read` | Existing cursor/load-more and clipping contract is evidence; inspect only for OPS-05 regressions |
| `/admin/b2b/work-orders/:id` | `WorkOrderDetail` | `production.read`; commands map to production, inventory, or QC permissions | Review state/recovery and status projection; do not redefine the Work Order lifecycle |
| `/admin/b2b/projects/:id` | `B2BDetail` + `ProjectWorkOrders` | Project read plus `production.write` for creation | Review embedded loading/error/quantity/reason behavior; creation remains domain-owned |

Public `/retail` and `/retail/products/:slug` are delivered discovery
consumers and are explicitly outside the OPS-05 runtime write set. They must
not receive internal material, inventory, supplier, production, or pricing
changes in this slice.

## 4. Exact-file candidate scope

The paths below are the only candidate files for a future OPS-05 G4. They are
inspection-only during this G3. Any expansion requires a new exact-file review.

### 4.1 Frontend runtime and adapter candidates

| Path | G3 purpose | Possible G4 entry condition |
| --- | --- | --- |
| `frontend/src/pages/admin/Catalog.jsx` | Product/category collections, local filters, archive states, and responsive table/list | Approved catalog query/pagination contract plus localized resource-status and no-match states |
| `frontend/src/pages/admin/ProductEditor.jsx` | Draft/editor tabs, validation, publication history, media seam, and save orchestration | Approved aggregate-save/reconciliation contract or an explicit split-action contract; no provider activation |
| `frontend/src/pages/admin/Materials.jsx` | Material list/editor, supplier reference, price history, setup/status | Approved material projection/query and setup/price error contract |
| `frontend/src/pages/admin/Inventory.jsx` | Balance, reservation, adjustment, numeric input, conflict, and approval presentation | Approved inventory query/approval response contract and visible state treatment |
| `frontend/src/pages/admin/StockMovements.jsx` | URL-persisted filters, immutable history, export, and mobile alternative | API parity for movement type/actor/date filters, bounded continuation, and export semantics |
| `frontend/src/pages/admin/RestockAlerts.jsx` | Alert list, status filter, resolve dialog, and recovery | Approved alert pagination/projection and localized trigger/status contract |
| `frontend/src/pages/admin/ProjectWorkOrders.jsx` | Embedded Work Order list/create context | Approved loading/error/quantity validation contract; no new Work Order transition |
| `frontend/src/pages/admin/WorkOrderDetail.jsx` | Work Order spine, blockers, requirements, history, conflict, and guarded actions | Only a proven presentation/state gap; lifecycle and command authority remain backend-owned |
| `frontend/src/pages/admin/B2BList.jsx` | Existing Work Order collection consumer and caller-owned clipping boundary | Only a regression-proven change; preserve the merged OPS-04/OPS-03 collection contract |
| `frontend/src/pages/admin/B2BDetail.jsx` | Embedded `ProjectWorkOrders` consumer and return context | Only if the embedded-state contract requires a paired change |
| `frontend/src/lib/catalog.js` | Catalog request and validation adapter | Approved query/cursor or aggregate-save API contract |
| `frontend/src/lib/materials.js` | Material request and reason/price helpers | Approved material projection/query contract |
| `frontend/src/lib/inventory.js` | Movement, balance, reservation, alert, and conflict adapters | Approved movement/alert query and error taxonomy |
| `frontend/src/lib/b2bPagination.js` | Existing bounded cursor mechanics used by Work Orders | Only if the API contract requires a compatible continuation change |
| `frontend/src/i18n.js` | Shared Admin copy keys not covered by domain translations | Paired with named source changes and complete ID/EN copy |
| `frontend/src/lib/domain-translations.js` | Catalog/material/inventory domain labels and status names | Paired with named source changes; no generic status promotion |

### 4.2 Frontend contract-test candidates

| Path | G3 evidence | Possible G4 coverage |
| --- | --- | --- |
| `frontend/src/pages/admin/admin-studio-convergence.contract.test.js` | Shared Admin shell and Product Editor compatibility assertions | Long-label, localization, and operational-state regression if the source changes |
| `frontend/src/pages/admin/inventory-select-render.test.jsx` | Inventory and Stock Movement render smoke coverage | Visible approval/error/recovery and filter-state assertions |
| `frontend/src/pages/admin/stock-deep-links.contract.test.js` | URL filter and movement-history link contracts | Server-supported filter parity, reset, no-match, and export-query assertions |
| `frontend/src/pages/admin/work-order.contract.test.js` | Route, permission, command, history, and localization contracts | Embedded loading/error and long-content regression only if required |
| `frontend/src/pages/admin/b2b-workbench.contract.test.js` | Shared collection cursor/recovery/clipping contract | Regression guard; no primitive-level overflow change |
| `frontend/src/pages/admin/catalog-production.contract.test.js` | New exact family contract if existing suites cannot express Catalog/Materials/Restock gaps | Must cover route ownership, ID/EN, resource-specific statuses, state matrix, and rollback-safe UI behavior |

### 4.3 Backend/API inspection and conditional G4 candidates

These files are read-only for G3. A backend G4 may touch them only after the
query/projection/error contract is approved and direct tests are named:

- `backend/catalog_routes.py`;
- `backend/catalog_service.py`;
- `backend/material_routes.py` (the current `MaterialService` is defined in
  this module);
- `backend/inventory_routes.py`;
- `backend/inventory_service.py`;
- `backend/inventory_domain.py`;
- `backend/b2b_routes.py`;
- `backend/b2b_service.py`;
- `backend/tests/test_catalog_routes.py`;
- `backend/tests/test_catalog_domain.py`;
- `backend/tests/test_inventory_routes.py`;
- `backend/tests/test_inventory_service.py`;
- `backend/tests/test_inventory_transactions.py`;
- `backend/tests/test_stock_movement_contract.py`; and
- `backend/tests/test_b2b_work_orders.py` plus the allocation/shortage
  integration tests.

No route registration, permission definition, schema, migration, provider,
storage, payment, checkout, or transaction-guard file is a G4 candidate by
default.

## 5. G3 findings

### 5.1 Bounded evidence already present

- Admin routes are permission-gated in `App.js` and `permissions.js`; menu
  visibility is derived from permissions and does not replace backend auth.
- Catalog/Product Editor has loading, error/retry, validation, submitting,
  publication, archive, and revision-history branches.
- Inventory has server-provided stock status mapping, operation IDs, expected
  balance versions, reservation transitions, and conflict messages.
- Work Order list/detail carries cursor pagination, expected version,
  operation ID, reason, permission-scoped commands, blockers, material
  requirements, and audit history.
- `B2BList` already owns caller-level clipping for its collection consumers;
  `SurfacePanel` remains unmodified and must not receive a global overflow
  default from OPS-05.
- Backend focused tests cover catalog transaction gates and version conflicts,
  inventory idempotency/permissions/transaction failures, and Work Order
  quantity, stale-version, lifecycle, allocation, shortage, and QC rules.

### 5.2 Reproducible gaps requiring a bounded G4 contract

1. **Movement filter/API mismatch.** `StockMovements` persists
   `movement_type`, `actor`, and `date` in the URL and filters the returned
   array locally. `inventory_routes.py` and its export route accept only
   `subject_type`, `subject_id`, `reference_id`, and `limit`. A deep link can
   therefore appear complete while filtering only the first bounded response;
   export can omit the selected local criteria. The API query contract must be
   decided before claiming complete history filtering.
2. **Unpaginated internal collections.** Admin catalog, category, material,
   balance, adjustment, and alert endpoints use bounded list responses while
   their pages perform local search/filtering. The UI must not imply that a
   local filter covers records beyond the authoritative response. A future
   G4 needs an explicit cursor/limit/no-match contract or an owner-approved
   bounded maximum with a visible incomplete-scope state.
3. **Mixed localization and raw domain enums.** Catalog and Product Editor
   render `Slug`/`SKU` directly; Catalog renders raw workflow/status values;
   Materials renders `NEEDS_REVIEW`, `READY`, and raw status values; Inventory
   contains hardcoded English/Indonesian adjustment headings, actions, and
   approval toast; Restock renders raw trigger/status values; and some action
   labels in Materials are literal English. These are presentation defects,
   not permission or lifecycle changes.
4. **Approval feedback is toast-only.** Inventory adjustment approval/rejection
   has no persistent inline result or visible retry/reconciliation region. A
   toast may reinforce the result, but it cannot be the only representation of
   an important success or failure. Safe entered reason/context must remain
   available after a failed decision.
5. **Embedded Work Order bootstrap state is ambiguous.**
   `ProjectWorkOrders` starts with an empty list and no loading state, so an
   in-flight request can render the same copy as a genuinely empty project.
   A later frontend G4 may add an explicit loading/error/no-record distinction
   without changing Work Order authority.
6. **Product Editor compound save has no single reconciliation contract.**
   `ProductEditor` updates the product, then replaces variants and options in
   separate requests with `Promise.all`. The backend guards each mutation, but
   the UI has no contract for partial success if one request completes and
   another fails. This requires an API/domain decision (aggregate mutation or
   explicitly split actions) before a G4 may claim atomic editor save.

### 5.3 Deliberately held or not a defect

- `DevelopmentMediaUpload` and `storage_path` remain permission-gated,
  provider-neutral development seams. OPS-05 does not activate media storage,
  upload, CMS publication, or asset migration.
- Work Order statuses, command permissions, quantity caps, and QC outcomes are
  domain-owned and already covered by backend and contract tests. No new status
  enum or visual inference is proposed.
- Restock remains a contextual utility and does not become a stock mutation
  authority or a primary lifecycle.
- The public Retail catalog remains a separate discovery surface; internal
  inventory and supplier data must not cross that boundary.

## 6. Required state and recovery matrix for G4

| State | Required OPS-05 behavior | Current G3 result |
| --- | --- | --- |
| Ready | Identity, scope, owner, status, and authorized next action are explicit | Present on most routes; raw enum/localization gaps remain |
| Loading/bootstrap | Hierarchy-preserving skeleton or status; no false empty state | Catalog/Materials/Inventory/Restock present; embedded Work Order lacks a distinct loading branch |
| Empty | No records in authoritative scope with an owned next action | Present, but some local filters need distinct no-match semantics |
| No-match | Records may exist outside current criteria; criteria and reset are visible | Not consistently distinguishable in local-filtered collections |
| Validation | Numeric/reason/required errors preserve safe input and focus | Backend validation exists; approval and embedded quantity UI need explicit evidence |
| Dependency/system error | Visible error separate from invalid input; bounded retry | Initial errors generally visible; approval result is toast-only |
| Permission/forbidden | Explain unavailable action without exposing protected fields | Route/command guards are present; projection evidence remains conditional |
| Conflict/stale | Show authoritative version/change and require reload/reconfirm | Inventory and Work Order contracts present; compound Product Editor save lacks reconciliation |
| Expired/unavailable | State what is unavailable; no provider/transaction success implied | Provider/transaction gates remain inactive; copy needs localization audit |
| Uncertain | Reconcile before retrying an irreversible mutation | Backend operation IDs/version guards present; frontend compound save needs contract |
| Recovery | Preserve safe context, selected criteria, reason, and return/focus | URL movement context exists; approval/embedded loading recovery needs G4 evidence |
| Success/reference | State exactly what changed and authoritative reference/remaining action | Several mutations rely on toast; no new authority is implied |

## 7. G3 acceptance criteria

The self-review must record:

1. baseline SHA, worktree, and every inspected exact path;
2. route, role, permission, and internal projection boundaries;
3. the state/recovery matrix above, including uncertain and stale behavior;
4. query/filter/pagination and compound-save findings;
5. ID/EN, keyboard/focus, responsive, 200% zoom, and reduced-motion floors;
6. each proven gap, owner, required preceding API/domain decision, and
   proposed G4 file set;
7. focused backend test evidence and frontend environment limitations; and
8. explicit exclusions for provider, transaction, production, and Phase 7.

G3 result meanings:

- `PASS`: no source or contract gap justifies a bounded G4;
- `PASS WITH HOLD`: gaps are bounded and named, but API/domain or content
  decisions must precede G4; and
- `FAIL`: the route, permission, projection, or lifecycle cannot be reviewed
  safely.

## 8. Delivery gates and exclusions

This G3 documentation may be delivered as a separate documentation PR after
the self-review and exact staged-diff check. Runtime G4 requires a new
owner/domain contract review and a separate exact-file implementation gate.

Explicitly excluded from OPS-05 G3/G4 by default:

- inventory arithmetic, stock-policy changes, or non-atomic fallbacks;
- catalog price calculation in the browser;
- product/material/inventory/Work Order lifecycle or permission changes;
- production telemetry, ETA, capacity, machine control, or go-live claims;
- storage/upload/provider activation, payment, checkout, reservation, or
  customer-facing internal inventory;
- schema, migration, hard-delete, route registration, dependency, or global
  token changes;
- public Retail redesign or copy changes;
- Phase 7 design review; and
- treating green source tests, a merged PR, or local browser evidence as
  staging, production-readiness, or go-live proof.

**G3 disposition:** `PASS WITH HOLD`. The family is reviewable and has a
bounded frontend axis, but movement-query parity, collection scope, localized
status/state presentation, embedded loading semantics, and Product Editor
compound-save reconciliation must be resolved in named contracts before a
complete G4 claim. Capability remains `DEFERRED`; Phase 7 remains frozen.
