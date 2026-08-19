# OPS-04 — Operations Retail Order and After-Sales G3 Exact-File Review

**Status:** Owner-approved G3 task card — bounded G4 implemented and validated
locally; Git delivery authorized, capability activation excluded

**Date:** 20 August 2026

**Repository baseline:** `origin/main`
`8748996d79b4d0294512439571c983082768d9da`

**Surface:** Operations / Admin — Retail Orders and after-sales

**Phase:** Phase 6 frontend migration; Phase 7 remains frozen

**Owner decisions:** The owner approved this exact-file G3 review, the narrowed
G4 read/query/projection contract, local G4 implementation, and bounded Git
delivery on 20 August 2026. These decisions do not activate Retail transaction
or after-sales capability.

## 1. Purpose and boundary

Review the current Operations Retail Order queue/detail and its retained legacy
Order boundary against the approved Niuva authority. The review names the
smallest exact source and test set for a later bounded G4 only where a
reproducible presentation or projection-contract gap exists.

This card originated as documentation and G3 review scope. The later
owner-approved G4 contract authorizes only the exact read/query/projection and
presentation paths named below. It does not authorize schema, permission,
lifecycle, provider, payment, fulfillment, refund, reprint, return, production,
migration, deployment, readiness, or go-live work.

Retail Order remains a separate aggregate from legacy `/admin/orders`, B2B
Quote/Project, Retail Request, and Assisted Retail Offer. A status badge,
loading state, or suspended-action label never creates an Order, payment,
reservation, fulfillment, production, refund, reprint, or return effect.

## 2. Authority and precedence

Resolve conflicts in this order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md` and the applicable approved decision or
   ADR;
4. `DESIGN.md` within its approved scope;
5. the applicable runbook and current source/tests as implementation evidence;
6. the Phase 6 closure ledger and this task card.

The applicable boundaries are:

- `DEC-AFTER-01`: after-sales policy is activation-gated; exact technical
  contract, legal/Finance/provider operation, and implementation remain open;
- `DEC-ACCESS-002`: backend authorization and role-scoped projections remain
  the security boundary; finance/refund and manager approval are separate;
- `DEC-ACCESS-003`: legacy Order history remains ownership/permission-scoped,
  read-only, and preserved without automatic sunset; and
- `DEC-PAY-02`: historical manual-transfer records are readable only and no new
  manual-transfer or proof-driven activity may be enabled.

Source and tests prove current behavior only. They do not activate any deferred
Retail capability or replace runtime authorization evidence.

## 3. Exact-file candidate scope

The following files are the only proposed G3/G4 paths. G4 may not expand this
set without a new review.

### 3.1 Frontend candidate write set

| Path | G3 purpose | G4 write status |
| --- | --- | --- |
| `frontend/src/pages/admin/B2BList.jsx` | Retail collection identity, filters, loading/empty/error, and bounded query/recovery presentation | Candidate write only for a proven presentation-support defect; no mutation or capability activation |
| `frontend/src/pages/admin/RetailOrderDetail.jsx` | Retail detail, blockers, history, inactive actions, localization, and safe recovery presentation | Candidate write only for a proven presentation or safe-rendering defect |
| `frontend/src/i18n.js` | Indonesian/English copy for the bounded Retail Order states | Candidate write only paired with the named frontend change |
| `frontend/src/pages/admin/retail-order.contract.test.js` | Route, state, localization, inactive-action, and data-boundary contract evidence | Candidate test update paired with a proven source change |
| `frontend/src/pages/admin/b2b-workbench.contract.test.js` | Shared collection clipping ownership and unchanged primitive-overflow contract | Candidate test update paired with the bounded `B2BList` composition change |

### 3.2 Backend projection/query candidate write set

These files are read-only during G3 and may enter G4 only after an explicit
API/domain contract is reviewed:

| Path | G3 purpose | G4 entry condition |
| --- | --- | --- |
| `backend/retail_routes.py` | Current list/detail permission boundary and query surface | Approved query parameters and role-aware projection response contract |
| `backend/retail_service.py` | Current Retail Order read service and result shaping | Approved allowlist, pagination/ordering, and unknown-field behavior |
| `backend/retail_domain.py` | Current canonical projection and inactive action metadata | Explicit internal projection allowlist with no lifecycle/provider activation |
| `backend/tests/test_retail_order_routes.py` | HTTP permission, inactive mutation, and response contract evidence | Direct allow/deny and redaction tests for the approved response contract |
| `backend/tests/test_retail_order_aggregate.py` | Aggregate projection and suspended-action evidence | Projection and recovery tests paired with the approved contract |

Other route registration, permission definitions, payment/provider adapters,
fulfillment, inventory, production, storage, migration, and database files are
inspection-only and are not candidate write paths for OPS-04.

## 4. G3 review contract

### 4.1 Queue and query behavior

- Retail Order identity remains explicit and is not collapsed into a generic
  B2B or legacy Order record.
- Status, date, and text filter semantics must be owned by an explicit API
  contract before server-side filtering is claimed. Client-only filtering of a
  truncated response must not be presented as complete queue coverage.
- Stable cursor/limit ordering, duplicate protection, retained rows after a
  continuation failure, and same-query retry are required for a later full
  collection claim.
- Empty collection and no-match states are distinct and provide a valid next
  action.

### 4.2 Detail, projection, and after-sales behavior

- Detail shows authoritative order identity, status, version, item/configuration
  snapshots, fulfillment facts, blockers, and history without inferring domain
  success from presentation.
- Internal response fields use an explicit role-aware allowlist. Unknown fields,
  internal cost/margin/profit/supplier data, raw storage paths, provider payloads,
  and unrelated audit metadata are not returned merely because a document has
  them. Customer-safe and internal projections remain separate.
- Payment, fulfillment, production, refund, reprint, return, and complaint
  outcomes remain domain-owned. Suspended actions explain the inactive boundary
  and do not become buttons that imply an available command.
- An uncertain or conflict result reconciles the authoritative record before a
  retry that could duplicate an effect.

### 4.3 Accessibility, localization, and responsive behavior

- Loading, empty, dependency error, permission, conflict/stale, unavailable,
  recovery, and success states have visible and assistive-technology-readable
  representations where reachable.
- Indonesian and English labels, inactive explanations, error/retry copy, and
  status names are complete for the bounded path. Hardcoded mixed-language copy
  is not accepted.
- Keyboard order, visible focus, deterministic return context, reduced motion,
  320px/390px/768px/1024px/1440px layouts, and 200% zoom remain usable.

## 5. G3 acceptance evidence

The self-review must record:

1. the exact baseline SHA and every inspected source/test path;
2. route and permission ownership without treating URL visibility as
   authorization;
3. a state matrix for ready, loading, empty, dependency, permission,
   conflict/stale, expired/unavailable, uncertain, recovery, and success;
4. query/filter/pagination and projection findings;
5. ID/EN, keyboard/focus, reduced-motion, responsive, and zoom requirements;
6. each reproducible gap, its owner, and whether contract work precedes G4; and
7. focused test evidence, including any environment limitation.

G3 must end with `PASS`, `PASS WITH HOLD`, or `FAIL`:

- `PASS`: no source or contract gap is justified;
- `PASS WITH HOLD`: a bounded gap is named, but authority/API/domain work must
  precede G4; or
- `FAIL`: the route, permission, projection, or lifecycle cannot be reviewed
  safely.

## 6. G4 entry criteria and exclusions

G4 requires owner/domain review of this card, an exact-file diff plan, and an
approved query/projection/error contract for every source path it changes. A
frontend-only G4 may address localization and presentation defects without
activating Retail transactions. A backend G4 may change only the approved
projection/query files and must include direct permission/redaction tests.

Explicitly excluded:

- enabling Retail Order creation, checkout, payment, reservation, fulfillment,
  production, refund, reprint, return, complaint, or provider integration;
- changing role identifiers, permission authority, lifecycle enums, or customer
  projections outside the named contract;
- migration, deletion, alias retirement, new runtime dependency, Phase 7 work,
  commit, push, PR, merge, deployment, readiness, or go-live authority.

**Gate disposition:** owner/domain G3 review and the separate G4 contract,
implementation, and local validation gates are complete. Git delivery of the
14 exact paths is authorized and must still record staged-diff, CI, review
thread, exact-head, and merge evidence before the frontend axis may be marked
`DELIVERED_BOUNDED`. Retail transaction and after-sales capability remain
`DEFERRED`; Phase 7 remains frozen.
