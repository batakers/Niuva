# OPS-04 — Operations Retail Order and After-Sales G3 Self-Review

**Status:** G3 owner-approved — historical verdict `PASS WITH HOLD`; both holds
resolved by the approved G4 contract and locally validated implementation

**Date:** 20 August 2026

**Baseline:** `origin/main`
`8748996d79b4d0294512439571c983082768d9da`

**Frontend axis:** `PRESENTATION_BOUNDED`

**Capability axis:** `DEFERRED`

**Legacy disposition:** `DEFERRED_WITH_OWNER_REASON`

## 1. Review boundary

This review checked whether the Operations Retail Order surface was ready for a
bounded G3 decision. The owner approved that decision and the subsequent G4
read/query/projection contract on 20 August 2026. It does not claim that Retail
transaction or after-sales capability is active, that a mutation is
authoritative, or that Operations is production-ready. Phase 7 remains frozen.

No source, API, schema, permission, lifecycle, provider, payment, fulfillment,
or business-rule file was changed during the original G3 review. Subsequent
source changes are bounded by
[`OPS_04_RETAIL_ORDER_G4_API_CONTRACT.md`](../migration/operations/OPS_04_RETAIL_ORDER_G4_API_CONTRACT.md)
and recorded separately in the G4 self-review.

## 2. Evidence inspected

Exact runtime and test paths inspected:

- `frontend/src/pages/admin/B2BList.jsx`;
- `frontend/src/pages/admin/RetailOrderDetail.jsx`;
- `frontend/src/pages/admin/RetailOrderStatusBadge.jsx`;
- `frontend/src/pages/admin/retail-order.contract.test.js`;
- `frontend/src/App.js`;
- `frontend/src/lib/permissions.js`;
- `frontend/src/i18n.js`;
- `backend/retail_routes.py`;
- `backend/retail_service.py`;
- `backend/retail_domain.py`;
- `backend/permissions.py`;
- `backend/tests/test_retail_order_routes.py`;
- `backend/tests/test_retail_order_aggregate.py`;
- `backend/tests/test_retail_order_contract.py`; and
- `backend/tests/test_retail_legacy_classification.py`.

Read-only authority/context included `NIUVA_MASTER_SPEC.md`,
`DEC-AFTER-01`, `DEC-ACCESS-002`, `DEC-ACCESS-003`, `DEC-PAY-02`,
`DEC-OPS-001`, the OPS-04 wireframe, `TASKS.md`, and the Phase 6 ledger.

## 3. Existing bounded presentation

- `/admin/retail-orders` and `/admin/retail-orders/:id` are explicit routes
  guarded by `orders.read`; the legacy `/admin/orders` surface remains a
  compatibility-badged read-only route.
- `B2BList` provides resource identity plus loading, empty, initial error, and
  cursor-recovery states for paginated resources. Retail currently opts out of
  pagination and renders the response as a single bounded collection.
- `RetailOrderDetail` displays order number, version, status, customer,
  fulfillment method, item snapshots, total, blockers, history, conflict/error
  retry, and visibly suspended actions. It does not post transitions or
  after-sales commands.
- `RetailOrderStatusBadge` maps the canonical Retail status list to status tones;
  backend tests cover the aggregate transition and operation-id invariants.
- Backend create, transition, and suspended-action endpoints are explicitly
  inactive/refused. Existing tests confirm permission scoping, inactive status,
  idempotency/concurrency behavior, and legacy separation.

This supports `PRESENTATION_BOUNDED` and preserves the capability axis as
`DEFERRED`.

## 4. Proven gaps and holds

### 4.1 Queue query/filter contract is incomplete

The wireframe calls for Retail Order filters, but the current Retail list
configuration uses `paginated: false`. The backend list accepts only an optional
status filter and returns a hard-limited collection; the frontend does not
expose status/date/search controls or a cursor contract for this family.

This is a real contract gap, not a reason to add speculative client-only
filtering. A later G4 must first define query semantics, stable ordering,
pagination/cursor behavior, no-match meaning, and same-query recovery.

### 4.2 Canonical projection is not explicitly role-allowlisted

`project_retail_order` currently copies every stored field except `_id`, while
the route is protected only by the broad `orders.read` permission. The approved
access decisions require explicit role/domain projections and exclusion of
unknown/internal/provider fields. The legacy projection helpers are allowlisted,
but the canonical Retail projection does not yet provide equivalent evidence.

This is a backend/API contract gap. It must be resolved before a G4 claim that
the detail is safe for every reader with `orders.read`. No redaction behavior is
invented during G3.

### 4.3 Mixed-language inactive copy is a bounded frontend defect

`RetailOrderDetail.jsx` contains the literal English heading `Retail transaction
inactive` and Indonesian body text instead of using the existing ID/EN i18n
contract. This is a bounded presentation/localization gap suitable for a
frontend-only G4 once the owner approves the exact paths.

### 4.4 Existing tests do not cover the proven gaps

`retail-order.contract.test.js` verifies routes, permissions, lifecycle labels,
and inactive commands, but it does not assert the queue filter contract,
hardcoded-copy absence, or role-aware canonical projection. Backend tests verify
inactive endpoints and aggregate invariants, but not a canonical projection
allowlist across roles.

## 5. State and recovery matrix

| State | Current G3 conclusion | Required evidence before G4 closure |
| --- | --- | --- |
| Ready | Identity, status, version, blockers, items, and history are visible | Browser/keyboard evidence for dense desktop and mobile layouts |
| Loading/bootstrap | Explicit detail/list loading states exist | Hierarchy-preserving loading label/skeleton and assistive status |
| Empty/no-match | Empty collection exists; no-match/filter state is not yet defined for Retail | Approved query/filter semantics and distinct empty/no-match copy |
| Validation | No active Retail mutation form is presented | No new command form without an approved domain contract |
| Dependency/system error | Initial/detail retry exists; queue continuation is not available because Retail is unpaginated | Safe retry that retains query/context and does not duplicate effects |
| Permission/forbidden | Route uses `orders.read`; runtime projection breadth needs review | Role-specific redaction and 403/404 handling evidence |
| Conflict/stale | Detail uses a conflict presentation for a failed read/retry; no mutation is exposed | Authoritative version/status reconciliation only if a future command is approved |
| Expired/offline | No false success is shown; explicit unavailable copy is incomplete/localization-mixed | ID/EN unavailable state and retained safe context |
| Uncertain | No active mutation command is exposed | Reconciliation contract before any irreversible retry |
| Recovery | Back link and read retry exist; filter/cursor context is not yet owned | Same-query/cursor retry, focus return, and no duplicate rows |
| Success | Read success renders authoritative response; no mutation success is claimed | Projection allowlist and exact reference/ownership semantics |

## 6. Test evidence

- Backend focused suites: **48 passed** across
  `test_retail_order_routes.py`, `test_retail_order_aggregate.py`,
  `test_retail_order_contract.py`, and `test_retail_legacy_classification.py`.
- Frontend focused Jest could not be executed in this isolated worktree because
  it has no local `node_modules`; using the main worktree's CRACO binary reached
  Jest but failed to resolve `@testing-library/jest-dom` from the isolated
  project's setup file. No dependency was installed or changed for G3.
- Static source/test inspection completed for every exact path listed above.

The backend result is local contract evidence only. It does not prove staging,
production, provider, readiness, or go-live behavior.

## 7. Self-review verdict and next gate

The historical G3 verdict was `PASS WITH HOLD`. The reviewed source was a
bounded read/presentation surface, but two contracts must be resolved before a
complete G4 claim:

1. Retail queue query/filter/pagination/recovery semantics; and
2. an explicit role-aware canonical Retail Order projection allowlist.

Both holds were resolved in the owner-approved G4 contract: the queue now has
explicit filter/cursor semantics and the API uses role-aware allowlisted Retail
Order projections. The bounded localization defect was also corrected in the
named G4 paths. Payment, fulfillment, production, after-sales, refund, reprint,
return, provider, and lifecycle capability remain deferred and inactive.

The exact candidate scope is locked in
[`OPS_04_RETAIL_ORDER_AFTER_SALES_G3_TASK_CARD.md`](../migration/operations/OPS_04_RETAIL_ORDER_AFTER_SALES_G3_TASK_CARD.md).
Owner/domain G3 review, the separate backend-and-frontend G4 authorization, and
local G4 validation are complete. Bounded Git delivery is authorized; its
commit, PR, CI, review-thread, exact-head, and merge evidence remains to be
recorded before the frontend axis becomes `DELIVERED_BOUNDED`.

**Final G3 reconciliation:** historical `PASS WITH HOLD`, now
`HOLD_RESOLVED_FOR_BOUNDED_G4`. This does not activate Retail capability,
deployment, readiness, or go-live.
