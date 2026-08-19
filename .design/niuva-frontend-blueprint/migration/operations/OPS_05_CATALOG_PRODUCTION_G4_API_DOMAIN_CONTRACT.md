# OPS-05 — Catalog, Material, Inventory, and Work-Order G4 API/Domain Contract

**Status:** Candidate contract — owner/domain review required; not canonical,
not runtime authorization, and not a production/readiness claim

**Date:** 20 August 2026

**Repository baseline:** `origin/main`
`ffa30bf5ef26042abb75221c379aeed9711abae2`

**Worktree:** `docs/niuva-ops05-g4-contracts-20260820`

**Surface:** Operations / Admin — Catalog, Materials, Inventory, Restock,
Stock Movements, and embedded Work Orders

**Phase:** Phase 6 frontend migration; Phase 7 remains explicitly frozen

This document resolves the six bounded G3 holds from
[`OPS_05_CATALOG_PRODUCTION_G3_TASK_CARD.md`](OPS_05_CATALOG_PRODUCTION_G3_TASK_CARD.md)
into one reviewable candidate API/domain contract. It deliberately separates
query truth, projection, presentation, and recovery from the domain lifecycles
that own catalog publication, material pricing, inventory, restock, and Work
Order transitions. It does not add an endpoint, schema, permission, provider,
transaction fallback, or runtime behavior by itself.

The choices below are the safest bounded defaults for a future G4. They are
**proposed decisions for owner/domain review**, not claims that the owner has
already approved a new API. A later G4 must use the exact-file task card and
must stop if the reviewing domain owner changes a decision.

## 1. Authority and boundary

Resolve conflicts in this order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md` and the applicable approved decision;
4. `DEC-OPS-001` for Admin Studio composition and operational truth;
5. `DEC-ACCESS-002` for role, permission, projection, and separation of
   duties;
6. `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
   for fail-closed multi-document transactions;
7. `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md` for operational
   recovery, idempotency, export, and rollback;
8. current source and tests as implementation evidence; and
9. this candidate contract and its G4 task card.

The backend remains the authority for authorization, query scope, projections,
versions, inventory arithmetic, append-only movement history, approval,
publication, pricing, and Work Order lifecycle. A visible route, filtered
array, status badge, or successful request cannot create or broaden that
authority.

## 2. Shared API conventions proposed for G4

### 2.1 Resource and error conventions

Existing FastAPI REST resource nouns remain in place. G4 must not introduce a
second transport style or rename a lifecycle resource. Read endpoints retain
their existing permission dependencies and return a safe allowlisted
projection. The URL is never an authorization boundary.

When an endpoint returns a handled error, the existing envelope remains the
compatibility floor:

```json
{
  "detail": {
    "code": "stable_machine_code",
    "message": "Bahasa pengguna yang aman.",
    "errors": []
  }
}
```

`errors` is optional and contains field-level data only when useful. A request
or correlation identifier may be included when the platform already supplies
one. Internal stack traces, raw Mongo documents, provider payloads, actor
secrets, and permission-debug detail are never returned. Proposed status
semantics are:

| HTTP | Meaning in this slice | Examples |
| --- | --- | --- |
| `200` | Successful read or idempotent/read-only response | collection, detail, replayed approval |
| `201` | A new request/resource was accepted | existing adjustment request creation |
| `401` | No authenticated session | existing auth boundary |
| `403` | Authenticated actor lacks the domain permission | catalog, inventory, production read/write |
| `404` | Resource is absent or not visible in the actor's scope | adjustment or Work Order detail |
| `409` | Version, lifecycle, or idempotency conflict | `version_conflict`, `balance_version_conflict`, `adjustment_request_closed` |
| `422` | Query, cursor, date, enum, or field validation failure | `cursor_invalid`, `export_scope_exceeded` |
| `429` | Existing platform rate limit, if applied | no new client retry loop |
| `500` | Unexpected server failure without internal detail | bounded retry only when safe |
| `503` | Required transaction/capability is unavailable | existing `transaction_unavailable` boundary |

The frontend maps these codes to visible, localized states. It never treats a
`200` response containing an empty collection as a mutation success.

### 2.2 Collection envelope and cursor rules

For the list endpoints changed by G4, the candidate response is:

```json
{
  "items": [],
  "next_cursor": null,
  "query": {},
  "scope_complete": true
}
```

Rules:

- `items` contains only the endpoint's documented projection;
- `next_cursor` is `null` when no continuation exists;
- `scope_complete` is `false` while another page exists and `true` only when
  the complete filtered scope has been read;
- `query` is the normalized, non-sensitive filter set used by the server;
- cursors are opaque, server-issued, query-bound, and rejected when malformed
  or reused with different filters;
- `limit` is an integer from `1..100`, with a default of `50`; the server may
  choose a lower resource-specific maximum when documented;
- ordering is server-defined and stable with a unique `id` tie-breaker;
- the client never infers completeness from the current array length; and
- a continuation failure preserves already-rendered rows and the exact query.

An authoritative empty collection and a no-match result both have
`items: []`, `next_cursor: null`, and `scope_complete: true`. The UI
distinguishes them from the normalized `query`: no active criteria means
“belum ada data dalam scope”, while active criteria means “tidak ada hasil
untuk filter ini” and exposes a reset action. The API must not pretend that a
bounded page is a complete scope.

## 3. Contract 1 — Stock Movement query parity and export

### 3.1 Read and export endpoints

The existing resources remain:

- `GET /api/admin/inventory/movements`;
- `GET /api/admin/inventory/movements/export`; and
- `GET /api/admin/inventory/balances/export` for the matching balance filter
  vocabulary.

The server-supported movement query is:

| Parameter | Contract |
| --- | --- |
| `subject_type` | Optional `material` or `product_variant` |
| `subject_id` | Optional exact subject identifier, max 200 characters |
| `reference_id` | Optional exact source/reference identifier, max 200 characters |
| `movement_type` | Optional canonical movement enum; unknown values return `422` |
| `actor` | Optional exact `created_by` actor identifier. Display-name search is out of scope until a separately approved actor directory/projection exists |
| `created_from` | Optional timezone-aware ISO timestamp, inclusive |
| `created_to` | Optional timezone-aware ISO timestamp, inclusive; before `created_from` is `422` |
| `limit` | `1..100`, default `50` for the paged read |
| `cursor` | Opaque cursor bound to the complete filter set |

The existing UI's `date` URL field maps to `created_from`/`created_to` using a
documented local-day boundary. It is not silently sent as an unsupported
server parameter. The server orders movements by `created_at DESC, id DESC`.
Movement history remains append-only; correction is a new movement, never an
update or delete.

The response uses the collection envelope above and includes only the existing
safe movement fields needed by the Operations projection: timestamp, subject,
movement type, quantity/delta, before/after balance versions, reference,
reason, and the approved actor display. Unknown stored fields are omitted.

The export route accepts the same filter fields **except `cursor`** and applies
them server-side. It exports the full filtered scope up to an explicit
server-documented `MAX_EXPORT_ROWS` (proposed initial value: `5000`). If the
scope exceeds that cap, it returns `422` with `export_scope_exceeded` and the
UI explains how to narrow the filters. It must never silently export only the
first bounded page. Export ordering matches the read ordering.

### 3.2 Data-quality obligations

- **Completeness:** filter fields affect the query before pagination/export;
  no client-only filter may be presented as complete history.
- **Consistency:** the same normalized filter set produces the same row scope
  for table and CSV, subject to concurrent changes.
- **Uniqueness:** cursor ordering has the `id` tie-breaker and rejects query
  drift.
- **Traceability:** movement `operation_id`, reference, versions, and audit
  data remain domain-owned; a read projection does not create a new movement.

## 4. Contract 2 — Internal collection scope, projection, and no-match

The following collections use the shared envelope and server-side criteria in
G4. Existing permissions and resource ownership do not change.

| Resource | Endpoint | Candidate filters | Stable ordering | Projection rule |
| --- | --- | --- | --- | --- |
| Categories | `/api/admin/categories` | `search`, `status` | `sort_order ASC, id ASC` | category identity, name/slug, description summary, status, timestamps |
| Products | `/api/admin/products` | `search`, `category_id`, `status`, `pricing_mode` | `updated_at DESC, id DESC` | product identity, safe catalog metadata, status, pricing/stock policy, timestamps |
| Materials | `/api/admin/materials` | `search`, `status`, `setup_status` | `created_at DESC, id DESC` | material identity, SKU, setup/status, unit, supplier reference only when permission allows, timestamps |
| Inventory balances | `/api/admin/inventory/balances` | `subject_type`, `search`, `stock_status` | `updated_at DESC, subject_type ASC, subject_id ASC` | server-enriched balance, derived availability/status, version, safe subject identity |
| Adjustment requests | `/api/admin/inventory/adjustment-requests` | `status`, `subject_type`, `subject_id` | `created_at DESC, id DESC` | request identity, subject, delta, reason, status/version, safe timestamps and decision reference |
| Restock alerts | `/api/admin/inventory/restock-alerts` | `status`, `subject_type`, `subject_id`, `trigger_type` | `updated_at DESC, id DESC` | alert identity, safe subject, trigger/status, quantity/threshold facts, timestamps and resolution reason |

`search` is trimmed, case-insensitive, and capped at 80 characters. Each
resource documents the fields it searches; it does not become a wildcard over
raw documents. The server owns derived fields such as inventory stock status.
Role-aware projection remains enforced server-side, especially for supplier
references, actor fields, internal cost, and audit details.

The UI must show three distinct outcomes:

1. **Loading:** hierarchy-preserving skeleton/status while the first request is
   pending;
2. **Authoritative empty:** no criteria and a complete scope with zero items;
3. **No-match:** active criteria and a complete scope with zero items, with a
   visible reset action; and
4. **Incomplete/continuation:** rows remain visible with a bounded “load more”
   or continuation retry, never a false empty replacement.

Changing any query criterion resets the cursor. A failed continuation keeps
the current rows and query. A failed first request keeps the page identity and
offers a bounded retry. No route may claim that a local array filter covers
records beyond the server scope.

## 5. Contract 3 — ID/EN semantic localization and status adapters

All visible strings in the six consumers use the existing i18n/domain
translation mechanism. G4 may add keys, but may not rename a backend lifecycle
enum or merge distinct domain states into a generic “status”.

The adapter contract is:

```js
resolveDomainLabel({ resource, field, value, locale })
// -> { label, known, code }
```

Known values map to stable purpose-based keys. Unknown values return a
localized fallback such as “Status tidak dikenal” / “Unknown status”, set
`known: false`, and retain the technical `code` only as secondary diagnostic
context where the actor is authorized. A raw enum must never be the only label
shown to an operator.

Required adapter families:

| Resource | Fields that require semantic keys |
| --- | --- |
| Catalog/Product Editor | workflow status, publication status, pricing mode, stock policy, option type, unit, validation outcome |
| Materials | setup status, material status, base unit, price-version state |
| Inventory/Movements | subject type, movement type, stock status, adjustment status, reservation state, unit |
| Restock Alerts | trigger type, alert status, subject type |
| Work Orders | lifecycle status, quantity unit, material count, command result |

Indonesian and English keys must be complete for ready, loading, empty,
no-match, validation, forbidden, dependency error, conflict/stale, uncertain,
and success/recovery copy. Existing keys in
`frontend/src/lib/domain-translations.js` are reused before adding new keys to
`frontend/src/i18n.js`. Copy must not imply publication, stock availability,
approval, production progress, provider delivery, or an SLA that the backend
has not established.

## 6. Contract 4 — Adjustment approval, conflict, and recovery feedback

The existing mutation endpoints remain the authority:

- `POST /api/admin/inventory/adjustment-requests/{id}/approve` requires
  `expected_version`, `operation_id`, and `reason`; approval is transactional
  and replay-safe for the same operation ID;
- `POST /api/admin/inventory/adjustment-requests/{id}/reject` requires
  `expected_version` and `reason`; and
- a candidate read endpoint `GET
  /api/admin/inventory/adjustment-requests/{id}` may be added only if the
  existing list cannot reconcile an uncertain single-record decision without
  broadening query scope. It returns the same safe request projection and
  `404 adjustment_request_not_found` without protected detail.

Approve success preserves the authoritative `request`, resulting `movement`,
and replay indication. Reject success preserves the authoritative `request`.
The frontend derives the visible reference from these existing fields; it does
not invent a new approved status.

The decision UI uses an explicit state machine:

| View state | Required behavior |
| --- | --- |
| `idle` | Dialog/row shows current request version and reason context |
| `submitting` | Disable duplicate action, retain reason, announce a task-specific loading label |
| `success` | Inline result names the request, new status, and movement/reference when present; toast/live region may reinforce |
| `validation_error` | Keep reason and focus the actionable field/summary |
| `conflict` | Explain stale/closed/self-approval/balance conflict; keep row context and require reload/reconfirm |
| `dependency_error` | Keep dialog context, show bounded retry, and do not mark fields invalid |
| `uncertain` | State that outcome is unknown; reconcile authoritative request before any retry |

Focus returns to the triggering row action after close or recovery. A retry
reuses the same safe context only after reconciliation; it never blindly
duplicates an approval, movement, or rejection. The UI does not convert a
toast into the sole proof of success or failure.

## 7. Contract 5 — Embedded Work Order bootstrap and recovery

`GET /api/admin/b2b/work-orders` already owns cursor pagination, `project_id`,
`status`, and the `production.read` permission. Its `B2BPageResponse` and
Work Order lifecycle remain unchanged. G4 is a presentation/bootstrap repair:

| State | Required meaning and recovery |
| --- | --- |
| `loading` | Show a hierarchy-preserving skeleton/status; never render “none” before the first response |
| `ready_nonempty` | Render the returned project-scoped Work Orders and preserve project context |
| `ready_empty` | Complete project scope has no Work Orders; show the authorized create action only when permission and project state allow it |
| `no_match` | An explicit status/criteria returns no records; expose reset without changing project identity |
| `error` | Distinguish dependency/permission error from empty; retain project and form values and offer bounded retry |
| `uncertain_create` | Reconcile the project/Work Order list before retrying creation; do not duplicate a Work Order |

The component must retain `project.id`, `project.version`, selected quote line,
quantity, reason, and focus across safe retry. A successful create states that
the Work Order was accepted and asks the parent to reload its project version;
it does not claim production start, allocation, completion, or capacity.

## 8. Contract 6 — Product Editor compound-save reconciliation

The approved bounded choice for the first G4 is **split actions (B)**. No new
aggregate mutation endpoint is invented in this contract. The current backend
resources remain independent:

- `PUT /api/admin/products/{id}` for product fields;
- `PUT /api/admin/products/{id}/variants` for variants; and
- `PUT /api/admin/products/{id}/options` for options.

The editor must expose the independent ownership of those writes. A newly
created product is saved first; child sections become editable after the
authoritative product ID exists. Each section has its own submitting,
success, validation, conflict, dependency-error, and retry state. A single
“Save all” button may remain only if it runs a documented sequence and reports
partial success truthfully:

```text
product: saved | failed
variants: saved | failed | not_attempted
options: saved | failed | not_attempted
```

`Promise.all` must not be presented as atomicity. If one child save succeeds
and another fails, the UI keeps the successful result, reloads authoritative
data, identifies the remaining action, and offers a bounded retry. A generic
“product saved” message is prohibited when a child section is still pending.
An aggregate product/variant/option transaction may be proposed later as a
separate API/domain contract with its own operation ID, expected version,
transaction capability, tests, and rollback evidence.

## 9. Cross-cutting data-quality, accessibility, and security floors

Before a G4 closure claim, evidence must cover:

- completeness and query/export parity for every changed collection;
- validity of enum, date, cursor, limit, and reason inputs;
- consistency of normalized query, ordering, projection, and continuation;
- uniqueness of cursor tie-breakers and idempotency references;
- timeliness via authoritative `updated_at`/`created_at` values;
- integrity through backend permission, projection, version, and transaction
  checks;
- traceability through existing operation IDs, audit events, and references;
- BOLA/IDOR checks for every detail and decision endpoint;
- ID/EN copy at 320/390/768/1024/1440px and 200% zoom;
- keyboard order, visible focus and deterministic focus return;
- reduced-motion behavior for loading/recovery feedback; and
- no provider, secret, internal-cost, actor-private, or raw-document leakage.

## 10. G4 gate, delivery, and exclusions

The companion
[`OPS_05_CATALOG_PRODUCTION_G4_TASK_CARD.md`](OPS_05_CATALOG_PRODUCTION_G4_TASK_CARD.md)
names the only candidate files for a future implementation. Before runtime
work begins, owner/domain review must confirm the six contracts, exact
sub-slice, response compatibility, and test ownership. A G4 implementation
may then be requested separately with a fresh worktree and exact staged paths.

This contract does not authorize:

- catalog publication, pricing-policy changes, inventory arithmetic,
  reservation, restock delivery, production transition, QC outcome, or
  customer-facing capability;
- new roles, permissions, lifecycle enums, schema/migration, indexes,
  transaction fallbacks, provider, storage, notification, payment, or
  deployment changes;
- a global `SurfacePanel` overflow rule or token promotion;
- a new aggregate product save endpoint;
- Phase 7 design review, redesign, or go-live; or
- commit, push, PR, merge, readiness, or production evidence as a consequence
  of this candidate document.

**Candidate gate:** `OWNER/DOMAIN REVIEW REQUIRED` for the six contracts.
Until that gate is recorded, OPS-05 remains `PRESENTATION_BOUNDED` /
`DEFERRED`, and Phase 7 remains frozen.
