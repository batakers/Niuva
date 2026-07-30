# Layer 03 — Backend API and Business Logic

Status: Context Only — Audit Evidence and Progress Tracker — Not
Implementation Authority

## Audit state

| Field | Value |
| --- | --- |
| Audit status | `complete` for the repository/static scope; environment-blocked dynamic evidence is recorded below |
| Audit completion | 100% of the requested review checklist |
| Readiness score | 32% |
| Confidence | 84% |
| Current findings | 0 P0, 8 P1, 4 P2 |
| Finding prefix | `BE` |
| Baseline / last verified SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Last updated | 2026-07-28 05:05 WIB (UTC+07:00) |

This is an audit record, not implementation authority. No source, test,
requirements, migration, credential, commit, push, or operational state was
changed.

## Authority and method

The review followed `AGENTS.md`, `docs/NIUVA_MASTER_SPEC.md`,
`docs/context/DOCUMENT_REGISTER.md`, `docs/decisions/DECISION_REGISTER.md`,
the applicable `DEC-ACCESS`, `DEC-AUTH`, `DEC-PAY` decisions, ADR-001, and the
transaction/identity/catalog runbooks. The historical
`docs/context/BACKEND_AUDIT_TRACKER_2026-07-24.md` was treated as provenance
only. Every BA status below was checked against current HEAD; no historical
score or status was inherited.

Inspected areas include FastAPI assembly, all backend routers and services,
domain models, permissions, transaction helpers, storage/email/notification
boundaries, frontend API consumers, and backend tests. A Python AST/OpenAPI
probe counted 113 paths and 131 operations. The generated schema has 61
component schemas, 37 untagged operations, no generated `security` declaration
on any operation (custom dependencies are not represented in OpenAPI), and
empty `{}` success schemas for untyped handler returns.

## Architecture and boundary assessment

`backend/server.py` is the application composition root. It mounts the B2B,
catalog, content, identity, inventory, material, portfolio, and retail
routers, while also retaining legacy auth, order, file, contact, settings,
notification, dashboard, health, and compatibility handlers. Domain services
are now separated for B2B, Retail, catalog, content, inventory, portfolio,
identity, and notifications, and B2B/Retail use separate aggregates and
transition models. This is a useful boundary, but the legacy handlers remain
reachable and several cross-collection or side-effect paths bypass the shared
transaction/error/outbox contracts.

Positive controls verified in source/tests:

- Granular roles and permission predicates are defined in
  `backend/permissions.py`; identity administration is restricted to
  `users.read`/`roles.manage`, which currently resolve to the super-admin
  boundary.
- B2B customer projections allowlist customer-safe fields.
- Retail and B2B mutation services use the transaction guard for their
  aggregate-critical create/revision/conversion paths with `retry_safe=True`.
- Inventory operations use Decimal/Decimal128 values, operation fingerprints,
  bounded limits, negative-stock checks, and conflict-aware reservation logic.
- Storage path normalization rejects traversal and production storage remains
  provider-neutral/private.
- Contact input is escaped before email, and notification links are
  allowlisted.

The positive controls do not close the current findings because adjacent legacy
routes, untyped contracts, race-prone writes, and missing authorization or
state invariants remain.

## Current finding register

### BE-001 — OpenAPI and response/error contract is incomplete

| Field | Value |
| --- | --- |
| Severity / status | `P1` / `still_open` |
| Confidence | 100% |
| Expected behavior | Every externally reachable operation should expose stable tags, auth requirements, request/response schemas, and documented error/status outcomes. |
| Actual behavior | 113 paths/131 operations are assembled, but all operations lack generated `security`; 37 are untagged; untyped success returns render `{}`; only `TransactionUnavailableError` has a registered exception handler. |
| Evidence | `backend/server.py:1220-1326`; AST/OpenAPI probe (`routes=113`, `operations=131`, `untagged=37`, `security=0`); handlers such as `backend/server.py:447-461`, `565-627`. |
| Impact | Client SDK generation, compatibility review, observability, and controlled error handling cannot rely on the published contract; raw framework/database errors may escape. |
| Recommendation / acceptance | Add operation tags and explicit response models/status/error schemas; add a common exception mapping for validation, auth, conflict, transaction, storage, and unexpected failures; contract-test all critical routes. |
| First / last verified | `c28684d` / `c28684d` |

### BE-002 — Transaction and concurrency guarantees are inconsistent

| Field | Value |
| --- | --- |
| Severity / status | `P1` / `still_open` |
| Confidence | 92% |
| Expected behavior | Transaction-required cross-collection mutations fail closed; retries and ambiguous commits have one bounded contract; audit/outbox side effects are atomic with the core write where required. |
| Actual behavior | B2B/Retail critical paths use the transaction guard, but inventory has local retry/commit handling, catalog/material/content frequently write the primary document then append audit separately, and `content_service.transition_block` starts a session without the common capability guard. No application-wide mapping for unknown commit outcomes is present. |
| Evidence | `backend/transaction_guard.py`; `backend/b2b_service.py:387-419,561-600,1254-1290,1465-1504`; `backend/inventory_service.py:161-238,416-507,841-880`; `backend/catalog_service.py:75-145,226-284,319-547,570-709`; `backend/content_service.py:49-56,75-210,247-290`. |
| Impact | Partial audit/history, duplicate side effects, or unresolved client outcomes can occur during transient failures or replica-set unavailability. |
| Recommendation / acceptance | Route all transaction-required operations through one executor/error contract; use atomic audit/outbox writes or explicitly classify best-effort effects; add transient/unknown-commit tests on a real replica set. |
| First / last verified | `c28684d` / `c28684d` |

### BE-003 — Retail payment and fulfilment transitions are not bounded by business state

| Field | Value |
| --- | --- |
| Severity / status | `P1` / `still_open` |
| Confidence | 95% |
| Expected behavior | Retail order status must respect the provider-neutral payment boundary and the selected shipping/pickup lifecycle. |
| Actual behavior | `POST /api/admin/retail/orders/{order_id}/transition` accepts `paid` through the generic `orders.write` permission while `/api/admin/payment-capabilities` reports checkout/provider inactive. The transition model does not reject incompatible tails such as a shipping order entering `ready_to_pickup`; create snapshots do not verify active/published variant state or reserve inventory. |
| Evidence | `backend/retail_routes.py:82-139`; `backend/retail_service.py` create/transition paths; `backend/retail_domain.py` status graph; `backend/server.py:641-651`. |
| Impact | Staff can create states that imply a payment or fulfilment event which the approved boundary does not support, and stock can be oversold. |
| Recommendation / acceptance | Separate payment-confirmation permission/state from order status; enforce fulfilment-specific transition graphs; validate purchasability and inventory reservation atomically; add negative transition tests. |
| First / last verified | `c28684d` / `c28684d` |

### BE-004 — B2B quote line identity and quantity invariants

| Field | Value |
| --- | --- |
| Severity / status | `P1` / `resolved_in_source` |
| Confidence | 100% |
| Expected behavior | Duplicate quote variants remain distinct by `quote_line_id`; accepted line quantity and source version are preserved into Work Orders. |
| Actual behavior | Quote lines receive server-owned immutable identities. Work Order API/service commands require exact `quote_line_id`, retain the Project's exact source version, and enforce cumulative quantity per line. Missing/duplicate historical identity and source-version mismatch fail with `quote_line_reconciliation_required`; no variant fallback remains. |
| Evidence | `backend/b2b_domain.py`; `backend/b2b_service.py`; `backend/b2b_routes.py`; `backend/tests/test_b2b_work_orders.py`; `backend/tests/test_b2b_transaction_integration.py`. |
| Impact | The original wrong-line and overcommit paths are closed in source. Historical records remain unchanged; an ambiguous record blocks dependent mutation. |
| Recommendation / acceptance | Source acceptance is complete. Any execution against historical data remains separately gated by `DEC-DATA-002` and `docs/runbooks/QUOTE_LINE_RECONCILIATION_RUNBOOK.md`. |
| First / last verified | `c28684d` / 30 July 2026 source branch |

### BE-005 — Legacy order API retains unsafe integrity and projection behavior

| Field | Value |
| --- | --- |
| Severity / status | `P1` / `partially_resolved` |
| Confidence | 94% |
| Expected behavior | Legacy compatibility routes must preserve safe customer projections, monotonic transitions, unique order identity, idempotency, and Decimal monetary behavior. |
| Actual behavior | Legacy create uses `count_documents()+1`, direct insert, and post-insert email; status accepts any member of a flat list and permits backwards moves; bulk status loops with partial success; customer reads return `classify_legacy_order()` (all fields except `_id`); estimate model still uses `float`. |
| Evidence | `backend/server.py:565-627,767-814`; `backend/server.py:227-298,669-683`; `backend/retail_service.py` is separate and safer. |
| Impact | Concurrent creates can collide, customers can receive internal fields, retries can duplicate effects, and historical order state can become invalid. |
| Recommendation / acceptance | Deprecate or wrap legacy routes with the new aggregate/projection layer; use server-generated immutable identifiers, Decimal/minor units, optimistic version/operation IDs, and allowlisted customer fields; document sunset behavior. |
| First / last verified | `c28684d` / `c28684d` |

### BE-006 — CMS and Portfolio publication controls are incomplete

| Field | Value |
| --- | --- |
| Severity / status | `P1` / `partially_resolved` |
| Confidence | 91% |
| Expected behavior | Publish, rollback, schedule, archive, and reorder actions follow manager-approver authority, immutable version rules, timezone-aware dates, and atomic ordering. |
| Actual behavior | Structured content/portfolio lifecycles exist, but content rollback/archive and portfolio rollback/transition/reorder use `content.write`; content transition bypasses the common transaction capability guard; schedule fields are strings compared lexicographically; rollback lacks expected-version protection; portfolio reorder loops independent writes. |
| Evidence | `backend/content_routes.py:56-156`; `backend/content_service.py:49-56,126-142,247-290`; `backend/portfolio_routes.py:71-168`; `backend/portfolio_service.py` reorder/rollback paths. |
| Impact | Unauthorized publication controls, lost updates, timezone misordering, and partial ordering can undermine public content correctness and auditability. |
| Recommendation / acceptance | Align route permissions with DEC-ACCESS-002; use timezone-aware `datetime`; require expected version/operation ID; make reorder/rollback atomic and add concurrent publication tests. |
| First / last verified | `c28684d` / `c28684d` |

### BE-007 — Upload/download boundary is only partially enforced

| Field | Value |
| --- | --- |
| Severity / status | `P1` / `partially_resolved` |
| Confidence | 90% |
| Expected behavior | Uploads and downloads enforce size/type/content/ownership/deletion policy and a single authenticated boundary. |
| Actual behavior | Uploads allowlist extensions but read the entire file into memory; no signature/malware scan is performed. `/api/files/{path}` authorizes only a bearer header, checks ownership by string prefix, reads the full object, and does not consult database ownership/deleted metadata. |
| Evidence | `backend/server.py:410-435,818-846`; `backend/storage.py`; `frontend/src/lib/api.js` file fetch. |
| Impact | Memory exhaustion, spoofed content types, stale/deleted-object access, and cookie-vs-header compatibility gaps remain possible. |
| Recommendation / acceptance | Stream with bounded size, verify signature, persist object metadata/owner/deleted state, authorize from metadata, and use the same documented auth transport. |
| First / last verified | `c28684d` / `c28684d` |

### BE-008 — Recovery, limiter, and notification secret boundaries are not atomic

| Field | Value |
| --- | --- |
| Severity / status | `P1` / `still_open` |
| Confidence | 93% |
| Expected behavior | Recovery token issuance, password update, session invalidation, and token consumption are one atomic, redacted operation with distributed abuse control. |
| Actual behavior | Forgot-password uses a process-local limiter and sends a raw reset URL through `emailer.py`; the emailer persists the raw HTML/body in a legacy notification document. Reset performs separate token read, password update, session-version update, and token update without a shared transaction. |
| Evidence | `backend/server.py:480-551`; `backend/emailer.py:44-66`; `backend/notification_service.py`; `backend/permissions.py`. |
| Impact | Tokens can leak into stored notification data, concurrent reset requests can race, and limits do not hold across workers. |
| Recommendation / acceptance | Use shared/HMAC-bounded limiter, hashed single-use tokens, one transaction for password/session/token state, and redacted delivery/outbox records; add race and replay tests. |
| First / last verified | `c28684d` / `c28684d` |

### BE-009 — Readiness and background side effects do not describe actual service health

| Field | Value |
| --- | --- |
| Severity / status | `P1` / `still_open` |
| Confidence | 91% |
| Expected behavior | Readiness verifies live dependencies and background/outbox workers have an observable, recoverable lifecycle; core mutations do not depend on best-effort email completion. |
| Actual behavior | `/api/health/ready` reports cached transaction capability only; it does not ping the database, storage, indexes, or worker state. `auto_delete_loop` is started without a stored handle and shutdown only cancels the reservation task. Admin notification sends email before writing its log/audit record; retries can duplicate delivery. |
| Evidence | `backend/server.py:1089-1217,1506-1571`; `backend/emailer.py`; `backend/notification_service.py`. |
| Impact | Orchestrators can route traffic to an unhealthy instance and operators cannot distinguish durable core state from lost/duplicated side effects. |
| Recommendation / acceptance | Add live dependency/worker checks, lifecycle handles and cancellation, durable outbox claim/retry/dead-letter semantics, and post-commit notification delivery tests. |
| First / last verified | `c28684d` / `c28684d` |

### BE-010 — List APIs have bounded limits but weak pagination/date contracts

| Field | Value |
| --- | --- |
| Severity / status | `P2` / `still_open` |
| Confidence | 88% |
| Expected behavior | Collection endpoints expose stable cursor/ordering, validated filters, timezone-aware date ranges, and explicit page metadata. |
| Actual behavior | Many services cap `limit` at 200 or 500 but return ad-hoc lists without cursor/total metadata; content, portfolio, and inventory scheduling filters accept strings or mixed date semantics. |
| Evidence | `backend/b2b_service.py:95-101,227-232`; `backend/catalog_service.py`; `backend/content_service.py`; `backend/portfolio_service.py`; `backend/inventory_routes.py`. |
| Impact | Large datasets become difficult to consume consistently and date-window results can vary by timezone or lexical ordering. |
| Recommendation / acceptance | Standardize pagination/filter models, stable sort keys, UTC-aware datetimes, and response metadata; add boundary/date tests. |
| First / last verified | `c28684d` / `c28684d` |

### BE-011 — Compatibility/orphan endpoints are not governed by a current contract

| Field | Value |
| --- | --- |
| Severity / status | `P2` / `still_open` |
| Confidence | 90% |
| Expected behavior | Deprecated routes have an owner, consumer inventory, sunset decision, and non-mutating compatibility behavior where specified. |
| Actual behavior | Payment proof/estimate/verify routes remain reachable but return 410; deprecated `DELETE /api/admin/materials/{id}` still archives and advertises a sunset date of 15 Jul 2026 (already past the audit date); `/api/auth/register` remains disabled compatibility surface. OpenAPI does not identify these as deprecated/legacy consistently. |
| Evidence | `backend/server.py:439-551,630-638,738-764`; `backend/material_routes.py:369-420`; frontend API consumers and route inventory below. |
| Impact | Clients cannot distinguish intentionally retired behavior from accidental regressions, and a past-sunset mutating alias can remain in use. |
| Recommendation / acceptance | Publish a compatibility matrix with consumers, deprecation headers, sunset owner/date, and tests; remove or freeze mutating aliases only after explicit approval. |
| First / last verified | `c28684d` / `c28684d` |

### BE-012 — Critical behavior evidence is incomplete in the current environment

| Field | Value |
| --- | --- |
| Severity / status | `P2` / `requires_revalidation` |
| Confidence | 100% for the recorded run |
| Expected behavior | Focused and complete backend tests, real-transaction suites, and configured static checks should be reproducible. |
| Actual behavior | Correct invocation collected 475 tests: 442 passed, 30 skipped, and 8 failed. The failures are external integration requests in `backend/tests/backend_test.py` against the configured frontend backend URL with no reachable test server. Five real-transaction suites and two migration suites skipped because explicit opt-in plus `MONGO_TRANSACTION_TEST_URL` were absent; 23 credential-gated external tests skipped because `NIUVA_TEST_ADMIN_EMAIL/PASSWORD` were absent. `compileall` and `pip check` passed. Flake8, Black, and isort report existing violations; mypy stops on missing `types-requests` and duplicate module paths. |
| Evidence | `python -m pytest backend -n 0 -rs`; `python -m compileall -q backend`; `python -m pip check`; `python -m flake8 backend --count --statistics`; `python -m black --check backend`; `python -m isort --check-only backend`; `python -m mypy backend --no-incremental`. |
| Impact | Concurrency, migration, external API, and type/static confidence is incomplete; the counts must not be read as a release pass. |
| Recommendation / acceptance | Run in an isolated supported environment with the real replica set and test service; install only approved tooling/stubs in that environment; record all skips and resolve or explicitly accept each gate. |
| First / last verified | `c28684d` / `c28684d` |

## Historical BA reconciliation

| Historical finding | Current status | Current evidence and rationale |
| --- | --- | --- |
| BA-002 role model | `partially_resolved` | Granular roles/permissions now exist in `backend/permissions.py`, but migration/rollout verification and legacy identity markers remain open. |
| BA-003 operations-user/audit access | `partially_resolved` | Broad old Operations grants are no longer the current route model; domain permissions exist, but the current implementation does not prove complete domain-scoped timeline/redaction coverage. |
| BA-004 framework/dependency baseline | `partially_resolved` | Requirements are pinned enough for import/compile and `pip check`, but lint/type/tooling and supported-runtime reproducibility remain open. |
| BA-005 NIV-001 | `still_open` | The runbook still records `Implemented, verification pending`; no credential or production verification was attempted. |
| BA-006 manual transfer | `partially_resolved` | Mutating payment-proof/estimate/verify compatibility handlers return 410, but legacy order/payment read surfaces and the compatibility contract remain. |
| BA-007 legacy order integrity | `still_open` | Legacy count-plus-one identity, unrestricted status list, unallowlisted customer projection, and non-idempotent writes remain. |
| BA-008 file boundary | `partially_resolved` | Traversal/path and provider-neutral controls exist; ownership, content validation, streaming, deletion metadata, and auth transport gaps remain. |
| BA-009 transaction/audit | `partially_resolved` | Shared guard/executor is used by B2B/Retail and inventory has safeguards, but direct writes/audit separation and inconsistent error handling remain (BE-002). |
| BA-010 auth/input hardening | `partially_resolved` | Generic login failure and disabled-account checks are present; recovery atomicity, distributed limiting, token storage, and legacy password/token policy remain (BE-008). |
| BA-011 CMS | `partially_resolved` | Structured lifecycle routes/services now exist; permission, schedule, expected-version, and atomic reorder/transition gaps remain (BE-006). |
| BA-012 notification/background/readiness | `still_open` | Notification domain/outbox primitives exist, but readiness, lifecycle handles, delivery ordering, and durable claim/retry behavior remain (BE-009). |
| BA-013 static/test reporting | `requires_revalidation` | Current counts and tool outputs were rerun and differ from the old tracker; environment-gated failures/skips prevent a release conclusion (BE-012). |

## Route inventory

The inventory below is intentionally compact: methods on one row share the
same handler boundary and contract. `untyped JSON` means FastAPI generated an
empty `{}` success schema. `—` means no dedicated consumer/test was found in
the inspected tree. The AST probe is the authoritative count: 113 paths and
131 operations.

### Application, auth, legacy, admin, files, notifications, and health

| Method | Path | Handler | Authentication | Required Permission | Request Model | Response Model | Collections/Services | Frontend Consumer | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | `register` | public | — | `RegisterReq` | untyped JSON | users | — | auth tests | disabled compatibility |
| POST | `/api/auth/login`, `/api/auth/admin/login` | `login`, `admin_login` | public | — | `LoginReq` | untyped JSON | users/auth | `AuthContext`, admin login | auth tests | untyped contract |
| GET | `/api/auth/me` | `get_current_user` | bearer/cookie | authenticated | — | untyped JSON | users | `AuthContext` | auth tests | active |
| POST | `/api/auth/forgot-password`, `/api/auth/reset-password` | `forgot_password`, `reset_password` | public | — | `ForgotPasswordReq`, `ResetPasswordReq` | untyped JSON | users/reset_tokens/email | forgot/reset pages | reset/auth tests | BE-008 |
| POST/GET | `/api/orders`, `/api/orders/{oid}` | `create_order`, `list_orders`, `get_order` | authenticated | customer/admin query scope | multipart / — | untyped JSON | orders/materials/email | legacy order pages | backend integration | legacy |
| POST | `/api/orders/{oid}/payment-proof` | `upload_payment_proof` | authenticated | customer owner | upload | untyped JSON | orders/files | legacy order page | — | 410 |
| GET | `/api/admin/payment-capabilities` | `payment_capabilities` | permission | `payments.read` | — | untyped JSON | settings | — | payment tests | provider inactive |
| GET | `/api/admin/orders`, `/api/admin/orders/export` | `admin_orders`, `export_orders` | permission | `orders.read` | query filters | untyped JSON/file | orders | admin orders | order tests | legacy |
| POST | `/api/admin/orders/{oid}/estimate`, `/verify-payment` | compatibility handlers | permission | `quotes.write`/`payments.write` | `EstimateReq`/— | untyped JSON | orders | — | — | 410 |
| POST | `/api/admin/orders/{oid}/status`, `/bulk-status` | `update_order_status`, `bulk_status` | permission | `orders.write` | `StatusReq`, `BulkStatusReq` | untyped JSON | orders/email/audit | admin orders | order tests | BE-005 |
| GET | `/api/files/{path:path}` | `download_file` | bearer header only | `files.read` or owner | — | file | storage/files | `api.js` file fetch | storage route tests | BE-007 |
| POST/GET | `/api/contact`, `/api/admin/contacts` | `contact`, `admin_contacts` | public / permission | `inquiries.read` | `ContactReq` / query | untyped JSON | inquiries/email | contact/admin contacts | contact tests | active |
| GET/PUT | `/api/settings`, `/api/admin/settings` | settings handlers | public / permission | `settings.write` | `SettingsReq` for PUT | untyped JSON | settings | Settings page | settings tests | active |
| POST/GET | `/api/admin/users`, `/api/admin/customers` | user/customer handlers | permission | `customers.manage`/`customers.read` | `ClientProvisionReq` | untyped JSON | users | Users page | identity tests | legacy/admin |
| GET | `/api/admin/stats`, `/api/admin/stats/timeseries` | dashboard handlers | permission | `dashboard.read` | query | untyped JSON | orders/inquiries/inventory | admin dashboard | dashboard tests | untyped |
| GET/POST | `/api/notifications`, `/unread-count`, `/{id}/read`, `/read-all`, `/api/admin/notifications`, `/sent` | notification handlers | authenticated / permission | `notifications.write` for admin | `AdminNotificationReq` | untyped JSON | notifications/email | notification pages/bell | notification tests | BE-009 |
| GET | `/api/health`, `/api/health/live`, `/api/health/ready`, `/api/` | health/root | public | — | — | untyped JSON | database capability cache | deployment probes | health tests | BE-009 |

### B2B

| Method | Path | Handler | Authentication | Required Permission | Request Model | Response Model | Collections/Services | Frontend Consumer | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/inquiries` | create inquiry | public | — | `InquiryPayload` | untyped JSON | inquiries | B2B list/contact | B2B lifecycle | active |
| GET | `/api/admin/inquiries`, `/{id}` | list/detail inquiries | permission | `inquiries.read` | filters | untyped JSON | inquiries | B2B list/detail | B2B lifecycle | bounded |
| POST | `/api/admin/inquiries/{id}/transition` | transition inquiry | permission | `inquiries.write` | `InquiryTransitionPayload` | untyped JSON | inquiries/audit | B2B detail | B2B lifecycle | versioned |
| POST | `/api/admin/inquiries/{id}/convert` | convert inquiry | permission | `quotes.write` | `InquiryConversionPayload` | untyped JSON | inquiries/quotes | B2B detail | B2B transaction | transaction guard |
| GET | `/api/admin/quotes`, `/{id}` | list/detail quotes | permission | `quotes.read` | filters | untyped JSON | quotes | B2B list/detail | quote lifecycle | bounded |
| POST | `/api/admin/quotes/{id}/transition`, `/versions` | quote transition/revision | permission | `quotes.write` | `QuoteTransitionPayload`, `QuoteRevisionPayload` | untyped JSON | quotes/audit | quote editor | quote lifecycle | BE-004 adjacent |
| POST | `/api/admin/quotes/{id}/project` | create project | permission | `projects.write` | `ProjectCommandPayload` | untyped JSON | quotes/projects | B2B detail | B2B transaction | transaction guard |
| GET | `/api/admin/projects`, `/{id}` | list/detail projects | permission | `projects.read` | filters | untyped JSON | projects | projects/work orders | project tests | bounded |
| POST | `/api/admin/projects/{id}/transition` | transition project | permission | `projects.write` | `ProjectTransitionPayload` | untyped JSON | projects/audit | project detail | project tests | versioned |
| POST/GET | `/api/admin/projects/{id}/work-orders`, `/work-orders` | create/list work orders | permission | `production.write`/`production.read` | `WorkOrderCreatePayload` | untyped JSON | projects/work_orders | work-order pages | work-order tests | BE-004 |
| GET | `/api/admin/work-orders/{id}` | work-order detail | permission | `production.read` | — | untyped JSON | work_orders | WorkOrderDetail | work-order tests | active |
| GET | `/api/admin/work-orders/{id}/material-shortages` | shortages | permission | `inventory.read` | — | untyped JSON | inventory/work_orders | WorkOrderDetail | shortage tests | active |
| POST | `/api/admin/work-orders/{id}/allocate`, `/consume` | allocation/consumption | permission | `inventory.write` | `WorkOrderCommandPayload` | untyped JSON | inventory/work_orders | ProjectWorkOrders | allocation tests | transaction guard |
| POST | `/api/admin/work-orders/{id}/transition` | work-order transition | permission | `production.write` | `WorkOrderCommandPayload` | untyped JSON | work_orders/audit | WorkOrderDetail | work-order tests | versioned |

### Catalog, content, identity, inventory, materials, portfolio, and Retail

| Method | Path | Handler | Authentication | Required Permission | Request Model | Response Model | Collections/Services | Frontend Consumer | Tests | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/catalog/categories`, `/api/catalog/products`, `/{id}`, `/variants`, `/options`, `/bom` | catalog public/admin reads | public / permission | `catalog.read` for admin | filters | untyped JSON | categories/products/variants/BOM | `catalog.js`, catalog pages | catalog route/domain | bounded |
| POST/PUT | `/api/admin/catalog/categories`, `/products`, `/variants`, `/options`, `/bom` | catalog writes | permission | `catalog.write` | payloads (`extra=ignore`) | untyped JSON | catalog collections/audit | catalog admin | catalog tests | BE-002 |
| POST | `/api/admin/catalog/products/{id}/publish`, `/rollback` | catalog publication | permission | `catalog.publish` | expected version | untyped JSON | products/versions/audit | catalog admin | catalog lifecycle | transaction guard |
| POST | `/api/admin/catalog/categories/{id}/archive`, `/products/{id}/archive` | archive | permission | `catalog.archive` | — | untyped JSON | catalog/audit | catalog admin | catalog tests | audit split |
| GET/POST | `/api/content`, `/api/admin/content`, `/{id}` | content reads/create/update | public / permission | `content.read`/`content.write` | payloads (`extra=ignore`) | untyped JSON | content/versions/audit | `content.js`, CMS | content tests | BE-006 |
| POST | `/api/admin/content/{id}/publish`, `/rollback`, `/archive`, `/transition` | content lifecycle | permission | `content.publish` or `content.write` | `PublishPayload`/transition | untyped JSON | content/versions/audit | CMS admin | content lifecycle | BE-006 |
| GET/POST | `/api/admin/users`, `/api/invitations/accept`, `/api/admin/users/{id}/roles` | identity handlers | permission/public accept | `users.read`/`roles.manage` | invitation/role payloads | untyped JSON | users/invitations/audit | Users/auth | identity tests | granular |
| POST | `/api/admin/users/{id}/deactivate`, `/reactivate` | identity state | permission | `roles.manage` | — | untyped JSON | users/audit | Users | identity tests | transaction guard |
| GET/POST | `/api/admin/inventory/items`, `/movements`, `/reservations`, `/restock-alerts` | inventory handlers | permission | `inventory.read/write`, `inventory.adjust` | movement/reservation/reason payloads | untyped JSON | inventory/audit/notifications | inventory pages | inventory tests | bounded/Decimal |
| POST | `/api/admin/inventory/reservations/{id}/transition`, `/restock-alerts/{id}/resolve` | reservation/alert actions | permission | `inventory.write`/`restock_alerts.manage` | transition/reason | untyped JSON | inventory/alerts/audit | inventory pages | inventory transaction tests | BE-002 adjacent |
| GET/POST/PUT | `/api/materials`, `/api/admin/materials`, `/supplier-refs`, `/pricing` | material handlers | public / permission | `materials.read/write`, `pricing.read/write` | payloads | untyped JSON | materials/suppliers/pricing | `materials.js` | material tests | direct writes |
| DELETE | `/api/admin/materials/{id}` | deprecated archive alias | permission | `materials.write` | — | untyped JSON | materials/audit | — | material tests | past sunset |
| GET/POST | `/api/portfolio`, `/api/admin/portfolio`, `/{id}` | portfolio reads/create/update | public / permission | `content.read/write` | portfolio payloads | untyped JSON | portfolio/versions/audit | portfolio admin/pages | portfolio lifecycle | BE-006 |
| POST | `/api/admin/portfolio/{id}/publish`, `/rollback`, `/transition`, `/reorder` | portfolio lifecycle | permission | `content.write` | transition/reorder | untyped JSON | portfolio/audit | PortfolioAdmin | portfolio tests | BE-006 |
| GET | `/api/admin/retail/orders`, `/{id}` | retail list/detail | permission | `orders.read` | filters | untyped JSON | retail_orders | RetailOrderDetail | retail tests | separate aggregate |
| POST | `/api/admin/retail/orders` | create retail order | permission | `orders.write` | `RetailOrderCreatePayload` | untyped JSON | retail_orders/catalog | retail pages | retail aggregate tests | transaction guard |
| POST | `/api/admin/retail/orders/{id}/transition` | retail transition | permission | `orders.write` | `RetailTransitionPayload` | untyped JSON | retail_orders/audit | RetailOrderDetail | retail route tests | BE-003 |
| POST | `/api/admin/retail/orders/{id}/suspend` | suspend order | permission | `orders.write` | operation payload | untyped JSON | retail_orders/audit | retail admin | retail tests | active |

## Test and static verification record

Commands were run from the repository root without modifying the environment:

| Check | Result |
| --- | --- |
| `PYTHONPATH=.;backend python -m pytest backend -n 0 -rs` | 475 collected; 442 passed, 30 skipped, 8 failed. The 8 failures are external requests in `backend/tests/backend_test.py` to the configured frontend backend URL; no test server was reachable. |
| Skips | 5 real-transaction suites plus 2 migration suites skipped because explicit opt-in and `MONGO_TRANSACTION_TEST_URL` were absent; 23 credential-gated external tests skipped because `NIUVA_TEST_ADMIN_EMAIL/PASSWORD` were absent. |
| `python -m compileall -q backend` | Passed. |
| `python -m pip check` | Passed: no broken requirements. |
| `python -m flake8 backend --count --statistics` | Failed: 1,330 reported violations, dominated by 1,258 E501 line-length findings; no files changed. |
| `python -m mypy backend --no-incremental` | Failed before full checking: missing `types-requests` and duplicate `tests`/`backend.tests` module path. |
| `python -m black --check backend` | Failed: 61 files would be reformatted. |
| `python -m isort --check-only backend` | Failed: existing import-order findings across backend tests. |

Skipped tests were recorded individually in the pytest short summary:

| Skipped test/module | Count | Reason |
| --- | ---: | --- |
| `backend/tests/test_b2b_transaction_integration.py:21` | 1 | Explicit real-transaction opt-in and `MONGO_TRANSACTION_TEST_URL` required |
| `backend/tests/test_inventory_transactions.py:11` | 1 | Explicit real-transaction opt-in and `MONGO_TRANSACTION_TEST_URL` required |
| `backend/tests/test_migration_backup_restore.py:22` | 1 | Explicit real-transaction opt-in and `MONGO_TRANSACTION_TEST_URL` required |
| `backend/tests/test_transaction_integration.py:11` | 1 | Explicit real-transaction opt-in and `MONGO_TRANSACTION_TEST_URL` required |
| `backend/tests/test_work_order_allocation_integration.py:23` | 1 | Explicit real-transaction opt-in and `MONGO_TRANSACTION_TEST_URL` required |
| `backend/tests/test_granular_role_migration.py:233` | 1 | Explicit real-transaction opt-in and URL required |
| `backend/tests/test_identity_access_migration.py:685` | 1 | Explicit real-transaction opt-in and URL required |
| `backend/tests/backend_test.py:101,104,121,133,147,187,193,199,211,217,225,240,246,255,261,267,281,296,307,332,345,351,394` | 23 | Integration administrator credentials are not configured; `NIUVA_TEST_ADMIN_EMAIL` and `NIUVA_TEST_ADMIN_PASSWORD` are required for an approved non-production test environment |

No skipped test was silently converted to a pass. No credentials, real
transaction URL, production service, provider, migration, or deployment was
used.

## Coverage checklist and handoff

The requested review areas are covered: FastAPI assembly and route boundaries;
endpoint inventory; request/response/Pydantic/error/status contracts;
authentication/authorization/query scope and field exposure; Retail/B2B
separation; order/quote/project/catalog/inventory/CMS/storage/notification/
identity logic; invariants and transitions; idempotency/concurrency/
transactions/fail-closed behavior; pagination/filtering/date/money handling;
upload/download; background/external boundaries; health/readiness; OpenAPI and
legacy endpoints; frontend consumers; and critical test/static evidence.

The next safe action is a separately approved remediation plan for BE-001
through BE-009, followed by real-replica-set and configured-service
revalidation. This audit does not authorize implementation, migration,
provider activation, deployment, commit, or push.

### Changelog

#### 2026-07-28 — Backend/API/business-logic audit

- Revalidated BA-002 through BA-013 against current HEAD and recorded the
  required status vocabulary.
- Added current FastAPI/OpenAPI route inventory (113 paths, 131 operations),
  business-boundary findings `BE-001`–`BE-012`, positive controls, and
  frontend/test mappings.
- Recorded 442 passed, 30 skipped, and 8 environment-dependent failures plus
  compile, dependency, lint, format, import-order, and type-check results.
- No source, tests, requirements, migrations, credentials, commits, pushes, or
  operational state changed.
