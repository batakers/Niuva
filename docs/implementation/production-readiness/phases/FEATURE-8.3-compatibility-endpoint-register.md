# Feature 8.3 — Compatibility Endpoint Governance Register

Status: **planning complete on baseline; owner decisions and any runtime work
remain separate**

Baseline: `a2b7be0d445cf3a338d91cf74841e3bf8be11a91`
(`origin/main`, refreshed 2 August 2026)

Reconciliation baseline: `fe1d8a0274ae106f9ca400570d53a44bc23e149a`
(`origin/main`, checked 3 August 2026). The OpenAPI operation count, candidate
count, and dispositions below remain unchanged.

Branch: `plan/backend-compatibility-endpoints`

## Result summary

The baseline exposes 151 OpenAPI operations. Source, tests, approved decisions,
active implementation specifications, and explicit legacy/compatibility
markers identify 21 backend compatibility endpoint candidates:

| Primary disposition | Count | Meaning in this register |
| --- | ---: | --- |
| `retained` | 13 | Current compatibility contract remains registered. Five are historical read-only routes and one is an inactive `503` command boundary. |
| `retired_tombstone` | 5 | Route remains registered and deterministically rejects the old mutation with `410`; this is not permission to delete it. |
| `deprecated` | 1 | Callable material archive alias has a supported successor; retirement is not yet authorized. |
| `needs_clarification` | 2 | Legacy Contact write/read routes have observed behavior and repository consumers, but no approved final governance disposition. |

No OpenAPI operation currently sets `deprecated: true`. The material DELETE
alias emits a runtime `Deprecation: true` header and a `Sunset` date of 15 July
2026, which is already earlier than this baseline date. The expired header is
not evidence that consumer, communication, monitoring, rollback, or retirement
requirements were completed, so the route must not be removed from this plan.

### Current-main revalidation overlay — 14 August 2026

The [current-main API contract audit](API-CONTRACT-CURRENT-MAIN-REVALIDATION-2026-08-14.md)
revalidated all entries against runtime baseline `15b759a`. OpenAPI now exposes
152 operations; all 21 compatibility operations remain registered and the
original source-state inventory remains applicable.

The audit's recommended primary governance grouping is 14 `retained`, zero
`redirect`, two `deprecated`, and five `retirement_blocked` tombstones. It
recommends deprecating, but not redirecting or removing, legacy Contact write;
historical `GET /api/admin/contacts` should remain retained and read-only. Any
runtime metadata or source change still requires its own task.

Only four compatibility operations publish a success schema, seven publish
the shared error envelope, none publishes OpenAPI security, and none sets
OpenAPI `deprecated: true`. All five tombstones still advertise automatic
`200`; only payment-proof additionally declares its actual `410`. These are
current contract gaps, not retirement authority.

## Method and scope boundary

The inventory was reconciled from:

1. generated `app.openapi()` operations on the exact baseline;
2. route handlers in `backend/server.py` and `backend/material_routes.py`;
3. explicit compatibility tests and current production frontend calls;
4. approved decisions and registered implementation evidence; and
5. repository-wide references under `frontend/src`, `backend/tests`, `scripts`,
   runbooks, and active implementation specifications.

An endpoint enters this register only when an approved record, source handler,
test, or active specification explicitly identifies its route/interface as
legacy, backward-compatible, retained, deprecated, or a disabled historical
command. Compatibility inside data, password hashes, role resolution,
migrations, or response fields is not mislabeled as a compatibility endpoint.

Repository search can prove a checked-in consumer exists. It cannot prove that
an external bookmark, integration, operator probe, or older deployed client
does not exist. External consumers are therefore `unverified` for every route.

## Status vocabulary

- `retained`: supported compatibility interface stays registered.
- `read_only`: historical retrieval only; no associated legacy mutation may be
  inferred or re-enabled.
- `deprecated`: callable alias with an evidenced successor; new consumers must
  not adopt it.
- `retired_tombstone`: registered endpoint deliberately returns `410` for the
  old operation. The tombstone itself remains compatibility behavior.
- `retained_disabled`: registered endpoint advertises an inactive capability
  without performing the old command.
- `needs_clarification`: source behavior is known, but an owner-approved final
  disposition is absent.

`Observed source state` and `approved governance disposition` are deliberately
separate. A source comment, current lack of a repository consumer, or an
expired header cannot authorize retirement.

## Complete backend compatibility endpoint inventory

| ID | Method and path | Source | Observed source state | Approved governance disposition | Successor or canonical boundary | Verified repository consumer |
| --- | --- | --- | --- | --- | --- | --- |
| CE-001 | `POST /api/auth/admin/login` | `backend/server.py` | Active Admin login interface | `retained` by `DEC-AUTH-003` | Same handler remains supported; no retirement selected | `frontend/src/pages/admin/AdminLogin.jsx` |
| CE-002 | `POST /api/auth/login` | `backend/server.py` | Active Customer login and supported legacy `role: client` compatibility | `retained` by `DEC-AUTH-001` and `DEC-AUTH-003` | Same handler; role migration is separate | `frontend/src/pages/auth/CustomerLogin.jsx` |
| CE-003 | `POST /api/auth/forgot-password` | `backend/server.py` | Shared generic recovery request | `retained` by `DEC-AUTH-003` | Same shared recovery interface | `frontend/src/pages/auth/ForgotPassword.jsx` |
| CE-004 | `POST /api/auth/reset-password` | `backend/server.py` | Shared reset completion | `retained` by `DEC-AUTH-003` | Additive validation uses `/api/auth/reset-password/validate`; completion stays here | `frontend/src/pages/auth/ResetPassword.jsx` |
| CE-005 | `POST /api/orders` | `backend/server.py` | `503 legacy_order_creation_inactive`; performs no creation | `retained_disabled`; no deletion or reactivation approved | Future Retail customer journey is not yet approved as a replacement | No production frontend call found; negative tests only |
| CE-006 | `GET /api/orders` | `backend/server.py` | Owner-scoped customer historical list | `retained + read_only` by `DEC-ACCESS-003` | No approved replacement for historical access | `frontend/src/pages/operational/ClientDashboard.jsx` |
| CE-007 | `GET /api/orders/{oid}` | `backend/server.py` | Owner-scoped customer-safe historical detail | `retained + read_only` by `DEC-ACCESS-003` | No approved replacement for historical access | `frontend/src/pages/operational/OrderDetail.jsx` |
| CE-008 | `GET /api/orders/{oid}/design-file` | `backend/server.py` | Owner-scoped controlled historical file read | `retained + read_only` by `DEC-ACCESS-003` | Domain-specific controlled read; raw storage path remains hidden | `frontend/src/pages/operational/OrderDetail.jsx` |
| CE-009 | `POST /api/orders/{oid}/payment-proof` | `backend/server.py` | Always `410 legacy_manual_transfer_disabled` | `retired_tombstone` by `DEC-PAY-02`; keep registered | No payment-proof successor is approved | No production frontend call; `frontend/src/payment-lockdown.test.js` proves absence |
| CE-010 | `GET /api/admin/orders` | `backend/server.py` | Permission-scoped historical internal list | `retained + read_only` by `DEC-ACCESS-003` | Canonical `/api/admin/retail-orders` does not replace legacy history | `frontend/src/pages/admin/Orders.jsx` and Admin workbench/navigation |
| CE-011 | `GET /api/admin/orders/export` | `backend/server.py` | Permission-scoped historical CSV projection | `retained + read_only` by `DEC-ACCESS-003` | No approved historical export replacement | `frontend/src/pages/admin/Orders.jsx` |
| CE-012 | `POST /api/admin/orders/{oid}/estimate` | `backend/server.py` | Always `410 legacy_manual_transfer_disabled` | `retired_tombstone` by `DEC-ACCESS-003` and `DEC-PAY-02` | B2B Quote and canonical Retail are separate lifecycles, not transparent aliases | No production frontend call found |
| CE-013 | `POST /api/admin/orders/{oid}/verify-payment` | `backend/server.py` | Always `410 legacy_manual_transfer_disabled` | `retired_tombstone` by `DEC-PAY-02` | No payment verification successor/provider is approved | No production frontend call found |
| CE-014 | `POST /api/admin/orders/{oid}/status` | `backend/server.py` | Delegates to a historical mutation guard that always returns `410 legacy_order_mutations_disabled` | `retired_tombstone` by `DEC-ACCESS-003` | Canonical Retail transitions do not mutate legacy records | `frontend/src/pages/admin/Orders.jsx` still calls this tombstone |
| CE-015 | `POST /api/admin/orders/bulk-status` | `backend/server.py` | Always `410 legacy_order_mutations_disabled` | `retired_tombstone` by `DEC-ACCESS-003` | No legacy bulk-mutation successor | `frontend/src/pages/admin/Orders.jsx` still calls this tombstone |
| CE-016 | `POST /api/contact` | `backend/server.py` | Active write to legacy `contacts`; canonical Contact page posts structured `/api/inquiries` instead | `needs_clarification` | Candidate successor is `POST /api/inquiries`; external consumers unverified | No production API consumer found; `/contact` browser route is not this API endpoint |
| CE-017 | `GET /api/admin/contacts` | `backend/server.py` | Permission-scoped, source-classified `legacy_contact`, read-only projection | `needs_clarification` despite observed read-only behavior | Canonical triage is `GET /api/admin/inquiries`; history has no automatic conversion | `frontend/src/pages/admin/Contacts.jsx` and Admin workbench/navigation |
| CE-018 | `GET /api/files/{path}` | `backend/server.py` | Authenticated logical-path compatibility read using current metadata authorization | `retained` by merged Feature 2.4 evidence | `GET /api/file-objects/{file_id}` or domain-specific controlled download | `frontend/src/lib/api.js`, consumed by `frontend/src/pages/admin/Orders.jsx` |
| CE-019 | `GET /api/materials` | `backend/material_routes.py` | Backward-compatible public material array | `retained` by the approved Catalog/Material design; retirement trigger remains open | No approved public replacement with equivalent material semantics | No production frontend consumer found |
| CE-020 | `DELETE /api/admin/materials/{material_id}` | `backend/material_routes.py` | Callable archive alias; emits `Deprecation: true` and an expired `Sunset` header | `deprecated`; retirement and header correction require a separate decision/change | `POST /api/admin/materials/{material_id}/archive` | No production frontend consumer; current `frontend/src/lib/materials.js` uses the successor |
| CE-021 | `GET /api/health` | `backend/server.py` | Backward-compatible summary `{status, transactions}` | `retained` current compatibility contract; sunset owner absent | `/api/health/live` and `/api/health/ready` provide canonical split semantics | `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md`; tests use it, runtime probes use the split routes |

### Inventory conclusions that require follow-up

- CE-014 and CE-015 have current Admin UI callers even though the backend
  always returns `410`. Removing the routes would turn a controlled disabled
  response into an uncontrolled `404`; consumer correction is a separately
  authorized frontend task.
- CE-016 remains an active legacy write with no current production frontend
  API caller. Absence from this repository is not evidence that an external
  consumer is absent, so deprecation or retirement needs an owner decision and
  observation/communication evidence.
- CE-017 preserves pre-Inquiry history but cannot be transparently redirected
  because legacy rows lack Inquiry company, status, and version fields.
- CE-018 still has a current logical-path frontend helper/consumer, so its
  documented retirement prerequisite has not been met.
- CE-020's expired `Sunset` header is an unresolved governance defect. It does
  not authorize deletion, and this planning branch does not alter the header.
- CE-021 remains referenced by an operational runbook even though current
  staging smoke uses `/api/health/ready`.

## Frontend route compatibility inventory

These are browser routes explicitly preserved by `DEC-AUTH-003`; they are not
additional backend operations and are therefore excluded from the 21 count.

| Browser route | Status | Current owner/consumer |
| --- | --- | --- |
| `/admin/login` | `retained` | `frontend/src/App.js`, `frontend/src/pages/admin/AdminLogin.jsx` |
| `/forgot-password` | `retained` | `frontend/src/App.js`, Admin and Customer login links |
| `/reset-password` | `retained` | `frontend/src/App.js`, `frontend/src/pages/auth/ResetPassword.jsx` |

The additive `/forgot-password/check-email`, `/reset-password/success`, and
`/reset-password/error` state routes are current canonical routes, not legacy
entries.

## Non-endpoint compatibility kept outside this register

The following are compatibility concerns, but are not old endpoints:

- supported legacy Customer `role: client` resolution inside current Auth;
- bcrypt hash verification during the staged password migration;
- legacy Order status/data projection inside retained read endpoints;
- legacy payment fields exposed only through safe, role-scoped settings/order
  projections;
- migration readers, legacy document classifiers, old index detection, and
  notification-shape reporting;
- Feature 8.1's compatible `detail` error field; and
- Feature 8.2's response-contract migration for five active B2B list routes.

These items must not be used to inflate the endpoint count or to infer route
retirement authority.

## Consumer inventory and evidence boundary

| Family | Verified production repository consumers | Verification fixtures / operational references | External boundary |
| --- | --- | --- | --- |
| Auth compatibility | `AdminLogin.jsx`, `CustomerLogin.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx` | Auth security, recovery, session, and frontend route tests | Older browser/client versions unverified |
| Customer legacy Order reads | `ClientDashboard.jsx`, `OrderDetail.jsx`, `App.js`, route-aware login/navigation | `payment-lockdown.test.js`, Customer dashboard/detail and storage authorization tests | Historical bookmarks and external clients unverified |
| Admin legacy Order reads/tombstones | `Orders.jsx`, `AdminDashboard.jsx`, `adminWorkbench.js`, `permissions.js`, `App.js` | Auth/security, legacy projection, Retail/Admin workbench contract tests | CSV operators and external integrations unverified |
| Legacy Contact | `Contacts.jsx`, Admin workbench/navigation for the read route; no production API caller for the write route | Contact/B2B workbench tests and historical backend smoke | Any old public form/integration unverified |
| Logical-path file read | `api.js` helper and `Orders.jsx` | API helper, storage, identity, and authorization tests | Stored links/bookmarks and external clients unverified |
| Material compatibility | No production caller for public list or DELETE alias; current Admin uses POST archive successor | Material pricing tests and active Catalog/Material specification | External public/material clients unverified |
| Legacy health summary | No current frontend or staging-smoke caller | Health tests and Catalog/Material operational runbook | External load balancer/operator probes unverified |

## Sunset requirements

No new sunset date is approved. A later endpoint-specific sunset proposal must
record all of the following before implementation:

1. named API, product/consumer, operations, retention, communication, and
   rollback owners;
2. exact route/method and current projection/error contract;
3. approved successor and parity limits, including why redirecting does not
   cross customer, permission, data, or lifecycle boundaries;
4. repository consumer migration with direct tests;
5. external-consumer discovery method, observation window, usage evidence, and
   explicit treatment of unknown consumers;
6. retention, historical access, customer/operator communication, and legal
   requirements where records or bookmarks are involved;
7. deprecation/tombstone phase, accurate `Deprecation`, `Sunset`, and successor
   link metadata where applicable;
8. controlled monitoring, abort thresholds, and a tested rollback procedure;
9. selected release artifact/SHA, environment, window, approver, and evidence
   retention; and
10. post-change verification that no route removal re-enables a forbidden
    capability or exposes raw/internal data.

Additional mandatory boundaries:

- Legacy Order routes have no automatic sunset. `DEC-ACCESS-003` requires an
  approved replacement Retail journey, verified customer-safe projection, and
  approved retention, communication, rollback-compatibility, and historical
  access procedure first.
- Logical-path file retirement requires every internal consumer to use opaque
  file IDs or domain-specific routes and requires historical-link treatment.
- Legacy Contact cannot be redirected blindly because request/record shapes
  differ from Inquiry.
- Public material compatibility needs a public successor or an explicit owner
  decision that no supported public material contract remains.
- Legacy health retirement requires operator/load-balancer inventory and
  runbook migration, not only frontend search.

## Rollback compatibility requirements

Any later source-changing proposal must preserve the pre-change behavior as a
reviewable rollback target and define route-specific recovery:

| Proposed future change | Required rollback evidence before change |
| --- | --- |
| Add or correct deprecation metadata | Exact prior headers/OpenAPI snapshot; client behavior test; rollback removes only the new metadata without changing authorization or payload. |
| Move a consumer to a successor | Old/new consumer contract fixtures; reversible frontend release; direct-route evidence for both versions during the approved compatibility window. |
| Change active compatibility route to a `410` tombstone | Frozen prior handler/projection tests; usage and communication evidence; ability to restore the prior handler without rewriting historical data. |
| Remove a tombstone registration | Evidence that the tombstone observation window completed; rollback can re-register the same path/method/status/error contract from the reviewed artifact. |
| Change a historical read projection | Old/new allowlists and deny tests; rollback never restores unsafe raw fields and never rewrites stored history. |

Rollback must fail closed: it may restore a previously approved read or alias,
but may not restore legacy Order creation/mutation, manual transfer,
payment-proof, provider, upload, checkout, or fulfilment capability. No rollback
may depend on deleting or rewriting historical records.

## Merged-PR overlay

This register describes current `origin/main`; the following contract overlays
are already merged and are not unmerged candidates:

- PR #106 (`5eaf14c`) changes readiness implementation/evidence but does not
  retire `GET /api/health`.
- PR #109 (`770a4c3`) standardizes API errors/OpenAPI while retaining the
  compatibility `detail` field; it does not add or remove compatibility routes.
- PR #110 (`ad800d9`) changes five active Admin/B2B list response contracts and
  their current consumers. It does not make those active routes legacy or
  retire them.

The three merged overlays are recorded against the current baseline. The
inventory must be refreshed only if a later source or contract change affects
them. PR #101 merged as `aff3d117`; its tracker changes were reconciled, and a
fresh OpenAPI check confirmed that the 151-operation inventory and 21 candidate
dispositions did not change.

## Decision queue and exact next gates

| Decision | Required owner/result | Current state |
| --- | --- | --- |
| Legacy Contact write/read disposition | Product/API/Data owner chooses retain, deprecate, or tombstone separately for CE-016 and CE-017, including historical access | `needs_clarification` |
| Material DELETE expired sunset | API/consumer/operations owners replace the stale date with an evidence-backed plan or explicitly withdraw it; no deletion by default | `needs_clarification` |
| Logical-path file retirement | Storage/API/consumer owners prove zero required path consumers and approve historical-link rollback | prerequisite not met |
| Public material endpoint future | Product/API owner confirms supported public successor and external-consumer treatment | `needs_clarification` for sunset only; route remains retained |
| Legacy health future | Operations/API owner inventories external probes and updates the remaining runbook before any sunset | `needs_clarification` for sunset only; route remains retained |
| Legacy Order future | Product/access/retention/communication/rollback owners satisfy all `DEC-ACCESS-003` prerequisites | blocked; no automatic sunset |

No item in this queue authorizes a runtime edit. Every implementation must use
a separate task card, branch, verification plan, and explicit source authority.
