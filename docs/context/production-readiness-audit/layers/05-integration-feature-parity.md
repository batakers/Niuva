# Layer 05 — Integration and Feature Parity

Status: Context Only — Audit Evidence and Progress Tracker — Not
Implementation Authority

## 1. Document status

- Classification: Context Only
- Finding prefix: `INT`
- Implementation authority: none
- Audit status: `complete` for repository/static integration scope;
  runtime/provider validation remains `environment_blocked`
- Baseline SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
- Last updated: 2026-07-28 03:40:01 WIB (UTC+07:00)

## 2. Audit state

| Field | Value |
| --- | --- |
| Audit completion | 92% of the requested repository/static scope |
| Readiness score | 38% |
| Confidence | 82% |
| Recorded findings | 0 P0, 8 P1, 6 P2 |
| Dynamic validation | blocked: no running frontend/backend pair, seeded production-like data, or approved provider topology |
| Safety boundary | no missing feature implemented; no deferred direction selected; no commit/push/reset/rebase |

The score is an observed integration-readiness score, not a go-live decision.
The score is capped by missing customer journeys, active legacy upload/payment
paths, and contract drift even where isolated tests pass.

## 3. Purpose and scope

This audit traces the approved capability from page/component through frontend
service, HTTP contract, backend handler, permission, collection/service, and
tests. It also reverse-maps backend endpoints to their frontend consumers.
The audit is limited to integration contract and feature parity; deep
database, security, accessibility, performance, and deployment conclusions
remain in their own layers.

Included:

- authentication and recovery transport
- customer account and customer-safe projections
- Admin Studio, CMS/content, catalog, material pricing, inventory
- Retail order and B2B inquiry/quote/project/work-order journeys
- portfolio, storage/upload, notification, reporting, audit timeline
- role/permission management and health/readiness
- route/method, request/response, status/error, authentication, permission,
  pagination/filter, enum/status, date/time, currency/numeric, nullability,
  file, timeout, retry, and idempotency contracts
- active legacy/compatibility routes and intentionally deferred capability

Excluded:

- implementing a missing capability or changing a policy
- choosing the first Retail vertical slice, payment/storage provider, tax,
  shipping, reservation, cancellation/refund, or go-live direction
- migration, database-index, threat-model, visual/accessibility, or capacity
  review except where a contract boundary is necessary to classify parity

## 4. Authority reviewed

The canonical reading order was followed:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. `DEC-ACCESS-001`, `DEC-ACCESS-002`, `DEC-AUTH-003`,
   `DEC-OPS-001`, `DEC-OPS-002`, `DEC-PAY-02`
5. `ADR-001`, `ADR-002`, `ADR-003`
6. v2.1 approved Retail/B2B PRS and PRD baselines
7. applicable source, service, route, and test files

Authority classifications used below:

- `approved`: required and currently authorized
- `open/deferred`: do not treat absence as a defect
- `implemented`: evidence exists at every mapped layer
- `partial`: one or more required layers or user steps are absent
- `blocked_by_decision`: source exists but activation is not authorized
- `intentionally_deferred`: absence is consistent with an approved deferral

The requested implementation vocabulary was applied where evidence supported
it: `implemented`, `partial`, `backend_only`, `orphan`,
`broken_contract`, `blocked_by_decision`, `intentionally_deferred`, and
`removed_but_residue_exists`. No current capability met a strict
`frontend_only`, `database_only`, or `mock_only` classification; those are
not inferred merely from a missing consumer. Database collections are named in
the matrix, and every observed collection capability either has an Admin/API
consumer or is explicitly called out as an incomplete/deferred user flow.

## 5. Evidence inventory

Primary source inspected:

- `frontend/src/App.js`, `frontend/src/lib/api.js`,
  `frontend/src/context/AuthContext.jsx`, `frontend/src/components/auth/ProtectedRoute.jsx`
- operational customer pages under `frontend/src/pages/operational/`
- Admin pages under `frontend/src/pages/admin/`
- `frontend/src/lib/{catalog,content,inventory,materials,permissions}.js`
- `backend/server.py`, `identity_routes.py`, `b2b_routes.py`,
  `retail_routes.py`, `catalog_routes.py`, `material_routes.py`,
  `inventory_routes.py`, `content_routes.py`, `portfolio_routes.py`,
  `permissions.py`, `retail_service.py`, `b2b_service.py`
- backend route/domain/service tests and frontend contract tests

Representative evidence anchors:

- frontend routing and customer protection: `frontend/src/App.js:133-176`,
  `frontend/src/components/auth/ProtectedRoute.jsx:7-27`
- frontend transport: `frontend/src/lib/api.js:1-52`,
  `frontend/src/context/AuthContext.jsx:8-43`
- legacy customer order/upload: `frontend/src/pages/operational/NewOrder.jsx:20-52`,
  `backend/server.py:565-630`
- canonical Retail commands: `frontend/src/pages/admin/RetailOrderDetail.jsx:70-101`,
  `backend/retail_routes.py:105-147`
- Admin identity mismatch: `frontend/src/pages/admin/Users.jsx:55-80,210-249`,
  `backend/server.py:937-963`, `backend/identity_routes.py:92-151,269-302`
- notification target mismatch: `frontend/src/pages/admin/Notifications.jsx:20-44,111-134`,
  `frontend/src/components/admin/UserSelector.jsx:24-55`
- CMS parity: `frontend/src/lib/content.js:6-23,133-164`,
  `backend/content_routes.py:56-158`
- portfolio, catalog, material, inventory route families:
  `backend/portfolio_routes.py:71-170`, `backend/catalog_routes.py:154-343`,
  `backend/material_routes.py:316-430`,
  `backend/inventory_routes.py:109-289`

## 6. Commands and verification

Commands executed in this audit:

```text
rg -n '@api\.(post|get|put|delete)\("...' backend/server.py
rg -n '@router\.(get|post|put|delete)\("...' backend/{route files}
rg -n 'Route path=|ProtectedRoute|api\.(get|post|put|patch|delete)\(' frontend/src
python -m pytest -q backend/tests/test_auth_security.py backend/tests/test_content_routes.py
  backend/tests/test_catalog_routes.py backend/tests/test_material_pricing.py
  backend/tests/test_inventory_routes.py backend/tests/test_retail_order_routes.py
  backend/tests/test_b2b_inquiry_routes.py backend/tests/test_b2b_quote_lifecycle.py
  backend/tests/test_b2b_project_lifecycle.py backend/tests/test_portfolio_lifecycle.py
  backend/tests/test_storage_routes.py backend/tests/test_notification_feed.py
  backend/tests/test_health.py
npm.cmd test -- --watchAll=false --runInBand --passWithNoTests
git status --short
```

Results:

- backend focused suites: **99 passed**, 8 deprecation warnings
- frontend suites: **27 suites / 202 tests passed**
- OpenAPI inspection of the imported FastAPI app found route families but no
  declared `securitySchemes` and mostly only generic 200/201/422 responses;
  protected 401/403/409/410/503 envelopes are not consistently described
- `git status --short` confirmed unrelated pre-existing work was preserved:
  the authorization packet edit, `.coverage`, and generated `frontend/output/`
  were not changed by this audit

These are isolated contract tests, not proof of a browser-driven seeded
journey. No server listener, Mongo replica set, production storage, payment
provider, or mail provider was activated.

## 7. End-to-end traceability matrix

| Journey | Page/Component | User Action | Frontend Service | HTTP Contract | Backend Handler | Permission | Collection | Tests | Canonical Status | Implementation Status | Gap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Authentication | `AdminLogin` | Admin sign-in | `api.post /auth/admin/login` | POST JSON; Bearer JWT response | `server.py:453` | `admin.access` | `users`, sessions | auth security, AuthContext | approved | implemented (admin only) | Customer login entrypoint is absent; see INT-001 |
| Customer account | `ProtectedRoute`, `ClientDashboard` | Open dashboard/order/history | `api.get /auth/me`, `/orders` | Bearer JWT; customer-scoped list | `server.py:464,612` | authenticated customer | `users`, `orders` | ProtectedRoute, AuthContext | approved | broken_contract | ProtectedRoute redirects to `/admin/login`; no customer login/register/account flow |
| Recovery | `ForgotPassword`, `ResetPassword` | Request/reset password | `api.post /auth/forgot-password`, `/auth/reset-password` | raw URL token, min 6 password | `server.py:480,525` | public request; authenticated reset token | `users`, reset tokens, sessions | auth security | approved decision with required atomic recovery | broken_contract | Cookie/validation/state/atomic reset contract not aligned; see INT-004 |
| Admin Studio | `AdminDashboard`, admin workbenches | View/transition operational work | admin services and command pages | GET/POST JSON; command payloads vary | route builders in `b2b_routes.py`, `retail_routes.py`, `content_routes.py` | granular domain permissions | domain collections | B2B, Retail, CMS, inventory contract suites | approved | partial | Operational surfaces exist, but customer portal and identity governance are incomplete |
| CMS/content | `ContentEditor`, public content hooks | Draft, validate, review, publish, rollback | `lib/content.js` | status enum and reason; optional `scheduled_at` | `content_routes.py:56-158` | `content.read/write/publish` | `content`, versions, audit | cms lifecycle, content routes | approved lifecycle | implemented | Homepage remains static by approved/deferred boundary; not a defect |
| Catalog | `AdminCatalog`, `ProductEditor` | Create/edit/publish catalog | `lib/catalog.js` | CRUD + lifecycle reason | `catalog_routes.py:154-343` | catalog permissions | categories, products, variants | catalog routes, catalog lib | approved foundation | implemented (admin) | Public catalog endpoints are orphaned from UI; see INT-014 |
| Material pricing | `Materials` | View/edit material and effective price | `lib/materials.js` | integer IDR amount, effective timestamp, reason | `material_routes.py:316-430` | materials + pricing permissions | materials, price versions | material pricing, materials lib | approved | broken_contract | Role composition prevents a normal single role from completing the screen; see INT-006 |
| Inventory | `Inventory`, `StockMovements`, `RestockAlerts` | Inspect, adjust, reserve, consume, resolve | `lib/inventory.js` | filters/limits; operation IDs on mutations | `inventory_routes.py:109-289` | inventory/material permissions | inventory balances, movements, reservations, alerts | inventory routes/lib | approved foundation | implemented (admin) | No customer-facing reservation/ETA flow; Retail activation is decision-gated |
| Retail order | `NewOrder`, `OrderDetail`, `RetailOrderDetail` | Upload legacy order; admin transition canonical order | `/orders` and `/admin/retail-orders` | multipart legacy vs expected_version/operation_id JSON | `server.py:565-630`, `retail_routes.py:105-147` | customer legacy; admin `orders.write` | `orders`, `retail_orders` | retail order contracts | Retail lifecycle approved; first slice open | partial / blocked_by_decision | Canonical public catalog→configure→checkout/payment/tracking flow is absent; legacy upload remains active (INT-002, INT-010) |
| Retail payment | `RetailOrderDetail` | Request payment/mark paid | admin transition UI | status transition, no capability preflight | `retail_routes.py:112`, payment capabilities `server.py:641` | `orders.write`, `payments.read` | `retail_orders`, payment snapshot | payment lockdown, retail order | provider-neutral and inactive | broken_contract | UI exposes payment actions despite inactive capability; see INT-003 |
| B2B inquiry | `ContactPage`, `B2BList/Detail` | Submit inquiry; triage/convert | public POST `/inquiries`; admin B2B APIs | 201 public; admin status commands | `b2b_routes.py:147-209` | public intake; admin inquiry permissions | inquiries | contact intake, B2B inquiry | approved | implemented (internal) | No authenticated organization portal after intake |
| B2B quote/project | B2B workbench, revision editor, project work orders | Revise quote, approve internally, create project/work order | `/admin/b2b/quotes`, `/projects`, `/work-orders` | expected_version, operation_id, reason, minor-unit prices | `b2b_routes.py:213-399` | pricing/project/work-order permissions | quotes, quote versions, projects, work orders | B2B lifecycle suites | approved internal foundation | partial | Customer quote approval/design/project/shipment flow has no UI/API consumer; see INT-007 |
| Portfolio | `Projects`, `PortfolioAdmin`, detail | Browse published; create/edit/reorder/rollback | public `/portfolio`; admin portfolio service | lifecycle reason; reorder list | `portfolio_routes.py:71-170` | content permissions | portfolio entries, audit | portfolio lifecycle | approved | implemented (admin/public) | `/admin/portfolio/from-project/{project_id}` has no consumer; see INT-013 |
| Storage/upload | `NewOrder`, file download | Upload design; download owned file | multipart `/orders`; `fetchFile /files` | local/provider storage; Bearer download | `server.py:565-612,818-846` | authenticated; path ownership | orders, file metadata/storage | storage routes | production storage explicitly blocked | blocked_by_decision / removed_but_residue_exists | Active UI can upload through legacy path before production storage controls are approved; see INT-010 |
| Notification | `NotificationBell`, `NotificationFeed`, `AdminNotifications` | Read own notifications; send admin notification | `/notifications*`, `/admin/notifications` | read commands; admin send payload | `server.py:1089-1189` | authenticated; `notifications.write` | notifications, users | notification feed, admin notification contract | approved foundation | partial / broken_contract | User target selector reads internal users; customer notification UI is absent; see INT-008 |
| Reporting | `AdminDashboard` | View KPI/timeseries | `/admin/stats`, `/admin/stats/timeseries` | date range; unpaginated aggregate response | `server.py:966-1087` | dashboard permission | orders, retail_orders, inquiries, users | dashboard contract/charts | approved operational foundation | partial | Legacy and canonical aggregates coexist; no documented pagination/contract envelope |
| Audit timeline | B2B/Retail/work-order/portfolio details | Inspect record history | embedded `record.history` | history embedded in detail response | domain services and route details | domain read permission | domain audit/history | B2B/Retail/portfolio lifecycle tests | domain timeline approved; full viewer removed | implemented (domain), intentionally_deferred (full viewer) | DEC-OPS-002 intentionally removed a general audit viewer; audit writes remain |
| Role/permission management | `Users` | List users/provision customer | `/admin/users` | internal list vs customer-create payload | `identity_routes.py:92-302`, `server.py:937` | `users.read`, `customers.manage`, `roles.manage` | users, invitations, audit | identity access/permission tests | Super Admin governance approved | partial / backend_only | Staff invite/role/deactivate/reactivate APIs have no UI; current add form creates a customer into an internal-only list; see INT-005 |
| Health/readiness | no product consumer; dev health plugin only | Probe liveness/readiness | none for backend `/api/health*` | 200 body may be `degraded` | `server.py:1192-1212` | none | transaction capability/cache | health tests; SRE-001 | operational contract approved | backend_only / broken_contract | No app consumer and readiness returns HTTP 200 when transaction mutations unavailable; cross-reference SRE-001/INT-012 |

## 8. Reverse mapping: backend endpoint to frontend consumer

| Backend Endpoint | Intended Capability | Frontend Consumer | Consumer Status | Orphan Reason | Required Decision |
| --- | --- | --- | --- | --- | --- |
| `/auth/login`, `/auth/register`, `/auth/me` | Customer/admin identity | `/auth/me` only; login is admin route | partial | No customer login/register page; register intentionally returns 403 | Decide/authorize customer account entrypoint and recovery UX |
| `/auth/admin/login` | Admin sign-in | `AdminLogin` | used | — | None for current admin scope |
| `/auth/forgot-password`, `/auth/reset-password` | Recovery | Forgot/Reset pages | broken contract | URL token, no validation/state route, non-atomic reset | Reconcile with DEC-AUTH-003/005 implementation authorization |
| `/auth/staff-invitations*`, `/admin/staff/{id}/roles`, `/admin/staff/{id}/deactivate`, `/reactivate` | Super Admin identity governance | none | backend_only | No staff governance components | Confirm UI scope and bounded authorization packet |
| `/orders`, `/orders/{id}` | Legacy customer order | `NewOrder`, `OrderDetail` | used, legacy | Active compatibility path is not the canonical Retail flow | Decide compatibility sunset/allowed environment |
| `/orders/{id}/payment-proof` | Manual transfer proof | none | intentionally_removed / orphan | Backend returns 410 by payment decision | No new payment UI; retain read-only historical behavior |
| `/admin/orders*` | Legacy Admin order projection/status/export | `AdminOrders` | partial | Status/bulk commands lack operation ID and coexist with canonical Retail | Decide legacy projection retirement and command contract |
| `/admin/payment-capabilities` | Provider-neutral payment capability | none | orphan | Retail UI does not preflight this endpoint | Decide how inactive capability is surfaced; no provider selection |
| `/files/{path}` | Private file retrieval | `OrderDetail`/`fetchFile` | partial | Bearer-only transport and path-substring ownership differ from cookie/auth boundary | Confirm storage/file contract before production upload |
| `/contact`, `/admin/contacts` | Public intake and legacy contact projection | Contact page, Contacts page | used/read-only | Contacts is explicitly legacy and links to inquiries | None; preserve read-only projection |
| `/admin/customers` | Customer-safe directory | none | backend_only | User selector uses `/admin/users` instead | Decide customer directory consumer and permission |
| `/admin/users` | Internal directory | `Users`, `UserSelector` | broken_contract | User create form posts customer payload to internal-only list | Split customer provisioning from staff governance |
| `/admin/notifications*` | Admin notification send/history | `AdminNotifications` | partial | Target selector uses internal users and send has no operation ID | Decide recipient projection and retry/idempotency contract |
| `/notifications*` | User notification feed/read | Bell/feed in admin shell | partial | No customer account shell; only authenticated admin context exercises it | Decide customer notification surface with same permission boundary |
| `/admin/stats*` | Reporting/dashboard | `AdminDashboard` | used | Aggregate response unpaginated and mixed legacy/canonical counts | Confirm stable response schema and reporting ownership |
| `/health`, `/health/live`, `/health/ready` | Health/readiness | none (dev plugin is a separate server) | orphan/backend_only | Product runtime does not consume API probes | Confirm deployment/probe contract; retain SRE-001 gate |
| `/catalog/categories`, `/catalog/products*` | Public catalog | none | intentionally_deferred / orphan | Retail public slice and detailed navigation remain open | Choose first Retail slice before exposing consumer |
| `/admin/categories`, `/admin/products*`, `/admin/catalog/quotable-variants` | Admin catalog and quote variants | `AdminCatalog`, `ProductEditor`, quote editor | used | — | None for current admin scope |
| `/materials` | Legacy material picker | `NewOrder` | used, legacy | Supports legacy upload, not canonical configurator | Decide compatibility boundary |
| `/admin/materials*` | Material and price governance | `Materials` | broken_contract | Materials and pricing permissions are split across roles | Reconcile role matrix before implementation |
| `/admin/inventory/*` | Inventory balances/movements/reservations/restock | Inventory admin pages | used | No customer ETA/reservation flow | Decide Retail reservation/ETA activation separately |
| `/inquiries*` | B2B intake/triage | Contact page + B2B admin pages | used internally | No organization/customer portal after conversion | Decide portal scope; do not invent approval policy |
| `/admin/b2b/quotes*`, `/projects*`, `/work-orders*` | Internal B2B lifecycle | B2B admin pages | used internally | Customer-facing consumers absent | Decide customer portal and approval contract |
| `/portfolio`, `/admin/portfolio*` | Public portfolio and Admin publishing | Projects, PortfolioAdmin/detail | used | `from-project` helper has no UI | Decide whether project-to-portfolio promotion is in approved scope |
| `/content`, `/admin/content*` | CMS public/admin lifecycle | public content hooks, ContentEditor | used | Homepage CMS fields are intentionally not active | None until homepage implementation authorization |

## 9. Contract cross-check

| Contract dimension | Observed evidence | Classification / gap |
| --- | --- | --- |
| Route and method | Frontend service paths match the implemented admin route families for CMS, catalog, materials, inventory, B2B, Retail, portfolio | Positive control; public catalog and customer portal routes have no consumer |
| Request fields | Canonical B2B/Retail commands carry `expected_version`, `operation_id`, `reason`; legacy status, notification send, settings, and several catalog/portfolio writes do not | INT-009: inconsistent command contract |
| Response fields | Frontend often assumes raw arrays (`B2BList`, inventory/admin lists); detail pages assume `history`, `permitted_next_actions`, `version` | Partial: isolated tests cover known shapes, but no shared schema/fixture prevents drift |
| Status codes | OpenAPI exposes mostly 200/201/422; 401/403/409/410/503 behavior is implemented but not consistently declared | INT-011: client/error contract is under-described |
| Error payload | Axios formatter supports string/array/object `message`/`msg`/`code`; backend uses FastAPI `detail` and structured domain payloads | Partial normalization; no single typed envelope |
| Authentication header | Frontend localStorage Bearer token and manual file Bearer header; backend also accepts `access_token` cookie | INT-004: transport does not follow approved HttpOnly cookie direction |
| Permission behavior | Route guards use frontend map; backend handlers enforce granular permissions; material pricing requires two permission families | INT-006 and INT-008 |
| Pagination/filter | Some query filters/limits exist, but major B2B/admin lists return capped arrays without cursor/total and consumers send no pagination | INT-011 |
| Enum/status | CMS, Retail, B2B, inventory status enums are duplicated in frontend maps and backend literals; Retail payment actions are exposed despite inactive capability | INT-003; otherwise positive control |
| Date/time | CMS accepts string `scheduled_at`; material pricing requires timezone-aware effective dates; UI uses local datetime and `Date` rendering | Partial: no documented timezone contract in shared client |
| Currency/numeric | Quote editor uses integer IDR minor units; formatters convert with JavaScript `Number`; legacy order amounts and dashboard aggregates are mixed | Partial: canonical quote contract is sound; legacy/reporting representation needs reconciliation |
| Nullability | Frontend uses `|| null` for scheduled dates and optional fields; no generated schema/fixture verifies all nullable fields | Partial, untyped drift risk |
| File handling | Legacy multipart upload and `/files/{path}` are active; production storage boundary is not approved; download auth differs from cookie acceptance | INT-010 |
| Timeout | Axios client has no explicit request timeout in `api.js` | Open integration contract; runtime ownership remains Layer 09 |
| Retry | No shared frontend retry policy; commands are retried only by user interaction | Partial; retry safety is endpoint-specific |
| Idempotency | B2B/Retail/inventory command paths use `operation_id`; legacy Admin status, notification send, and several writes do not | INT-009 |

## 10. Findings register

### INT-001 — Customer account route is wired to Admin login

| Field | Value |
| --- | --- |
| Severity / status | P1 / `broken_contract` |
| Confidence / category | 98% / customer-account integration |
| Expected | Retail Account users can authenticate, view account/order history, and use the approved customer journey; public registration remains policy-controlled |
| Actual | `/dashboard`, `/order`, and `/orders/:id` use generic `ProtectedRoute`, which redirects unauthenticated users to `/admin/login`; no customer login page exists; `/auth/register` always returns 403 |
| Evidence | `frontend/src/App.js:142-147`; `frontend/src/components/auth/ProtectedRoute.jsx:11-22`; `backend/server.py:439-463` |
| Verification | `rg -n 'ProtectedRoute|/auth/login|/auth/register' frontend/src backend/server.py` |
| Impact / cause | Customer account and guest-to-account flow cannot start; route guard assumes admin auth surface |
| Recommendation | Reconcile the approved customer-account entrypoint and authorization packet; do not implement in this audit |
| Acceptance | Approved customer route, auth transport, account scope, and negative cases are documented and tested end to end |
| Dependencies / decision | DEC-AUTH records, Retail release sequencing; human decision required |
| First/last SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |

### INT-002 — Canonical Retail journey is absent while legacy order wizard is active

| Field | Value |
| --- | --- |
| Severity / status | P1 / `blocked_by_decision` |
| Confidence / category | 97% / Retail feature parity |
| Expected | Approved Retail lifecycle: catalog → configure → upload → price/ETA → cart/checkout/payment → tracking |
| Actual | UI `/order` stores local wizard state, loads `/materials`, and posts multipart `/orders`; public catalog/configurator/cart/checkout/payment/tracking consumers are absent; canonical Retail API is Admin-only |
| Evidence | `frontend/src/pages/operational/NewOrder.jsx:20-52`; `backend/server.py:565-630`; `backend/catalog_routes.py:328-343`; `backend/retail_routes.py:65-147` |
| Verification | `rg -n '/materials|/orders|/catalog|checkout|payment' frontend/src/pages frontend/src/lib backend` |
| Impact / cause | User-visible feature parity is incomplete; first Retail slice and payment/shipping/tax/reservation decisions are open |
| Recommendation | Record the approved first Retail slice and compatibility policy before implementation |
| Acceptance | Decision register names the slice, routes, statuses, payment/storage boundaries, and an E2E test |
| Dependencies / decision | DEC-PAY-01/02, ADR-003, Master Spec deferred list; human decision required |
| First/last SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |

### INT-003 — Retail payment actions bypass inactive capability boundary

| Field | Value |
| --- | --- |
| Severity / status | P1 / `broken_contract` |
| Confidence / category | 96% / payment integration |
| Expected | Provider-neutral payment capability is inactive until approved; no UI mutation may imply payment activation |
| Actual | Retail detail exposes `request_payment` and `mark_paid` transition actions; it does not call `/admin/payment-capabilities`; backend transition route permits status changes by `orders.write` |
| Evidence | `frontend/src/pages/admin/RetailOrderDetail.jsx:22-31,84-89`; `backend/retail_routes.py:112-147`; `backend/server.py:641-660` |
| Verification | `rg -n 'payment-capabilities|mark_paid|request_payment|transitions' frontend/src/pages/admin backend` |
| Impact / cause | Staff can represent a payment state that the approved provider boundary says is inactive |
| Recommendation | Reconcile action visibility and backend transition guard with DEC-PAY-01/02; no provider selection |
| Acceptance | Inactive capability produces a read-only state in both UI and API negative tests |
| Dependencies / decision | ADR-003, DEC-PAY-02; human decision required |
| First/last SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |

### INT-004 — Auth/recovery transport and state contract drift

| Field | Value |
| --- | --- |
| Severity / status | P1 / `broken_contract` |
| Confidence / category | 94% / authentication integration |
| Expected | Approved recovery has consistent transport, validation/state routes, URL token removal, single-use expiry, atomic password/session/token mutation |
| Actual | Frontend stores JWT in localStorage and sends Bearer; reset token remains in query URL; password minimum is 6; backend reset updates password and token sequentially; no validate/state endpoint is consumed |
| Evidence | `frontend/src/lib/api.js:1-29`; `frontend/src/context/AuthContext.jsx:8-43`; `frontend/src/pages/auth/ResetPassword.jsx:9-33`; `backend/server.py:480-553` |
| Verification | `rg -n 'localStorage|Authorization|reset-password|validate|MIN_PASSWORD' frontend/src backend/server.py` |
| Impact / cause | Recovery behavior diverges from approved cookie/atomic recovery contract |
| Recommendation | Reconcile DEC-AUTH-003/005 against the separately authorized implementation packet |
| Acceptance | Contract fixture covers transport, validation, generic errors, expiry, atomic rollback, and post-reset session revocation |
| Dependencies / decision | DEC-AUTH-003, DEC-AUTH-005; human decision required |
| First/last SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |

### INT-005 — Admin Users page mixes internal directory and customer provisioning

| Field | Value |
| --- | --- |
| Severity / status | P1 / `broken_contract` |
| Confidence / category | 95% / identity governance |
| Expected | Super Admin identity governance is distinct from customer provisioning; staff invite/roles/deactivate/reactivate have an authorized UI/API flow |
| Actual | GET `/admin/users` returns internal users; Users page POSTs customer fields to `/admin/users` and reloads the internal list, so the created customer is not represented; staff governance endpoints have no consumer |
| Evidence | `frontend/src/pages/admin/Users.jsx:55-80,210-249`; `backend/server.py:937-963`; `backend/identity_routes.py:92-151,269-302` |
| Verification | `rg -n '/admin/users|staff-invitations|deactivate|reactivate' frontend/src backend` |
| Impact / cause | Role/permission management and customer administration are contractually conflated |
| Recommendation | Split projections and obtain explicit bounded UI authorization |
| Acceptance | UI/API matrix distinguishes customer provisioning, internal directory, and staff governance with role-negative tests |
| Dependencies / decision | DEC-ACCESS-002, DEC-OPS-002; human decision required |
| First/last SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |

### INT-006 — Material pricing permission composition blocks a normal role path

| Field | Value |
| --- | --- |
| Severity / status | P1 / `broken_contract` |
| Confidence / category | 93% / permission-to-feature parity |
| Expected | Approved internal operator can open material governance and maintain effective price versions with least privilege |
| Actual | `/admin/materials` requires `materials.read`; price endpoints require `pricing.read/write`; `catalog_manager`/`sales_estimator` have pricing but not materials, while `warehouse` has materials but not pricing |
| Evidence | `frontend/src/lib/permissions.js:5`; `backend/material_routes.py:320-324,389-430`; `backend/permissions.py` role matrix |
| Verification | `rg -n 'materials.read|pricing.read|catalog_manager|sales_estimator|warehouse' backend frontend/src` |
| Impact / cause | A user may pass the frontend route guard but receive 403 on required child operations |
| Recommendation | Reconcile role composition in the approved matrix; do not grant permissions here |
| Acceptance | One approved role path or explicit multi-role policy passes UI/API permission contract tests |
| Dependencies / decision | DEC-ACCESS-001/002; human decision required |
| First/last SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |

### INT-007 — B2B organization/customer portal has no consumer

| Field | Value |
| --- | --- |
| Severity / status | P1 / `partial` |
| Confidence / category | 96% / B2B feature parity |
| Expected | Inquiry can progress to an authenticated organization quote/project portal with customer-safe approval, design, milestone, payment-term, and shipment views |
| Actual | Public inquiry and internal Admin quote/project/work-order APIs exist; all quote/project endpoints are `/admin/...`; no organization account, quote approval, design review, or customer milestone UI/API exists |
| Evidence | `frontend/src/App.js:160-168`; `backend/b2b_routes.py:213-399`; approved PRS B2B scope and PRD `FR-B2B-03..09` |
| Verification | `rg -n '/admin/b2b|organization|quote approval|design approval' frontend/src backend` |
| Impact / cause | Internal B2B implementation cannot complete the approved customer journey |
| Recommendation | Decide portal scope and customer-safe contract before implementation |
| Acceptance | Approved portal route/permission/projection matrix and E2E inquiry-to-project scenario |
| Dependencies / decision | B2B release sequencing and access decisions; human decision required |
| First/last SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |

### INT-008 — Notification user target uses the wrong projection and permission

| Field | Value |
| --- | --- |
| Severity / status | P1 / `broken_contract` |
| Confidence / category | 92% / notification integration |
| Expected | Admin can select an authorized customer/internal recipient projection; customers can read their own notification feed |
| Actual | Admin notification defaults to target `user` and `UserSelector` calls internal-only `/admin/users`; `order_admin` has `notifications.write` but not `users.read`; `/admin/customers` is unused and customer shell is absent |
| Evidence | `frontend/src/pages/admin/Notifications.jsx:20-44`; `frontend/src/components/admin/UserSelector.jsx:24-55`; `backend/server.py:937-963,1089-1189`; `backend/permissions.py` |
| Verification | `rg -n '/admin/users|/admin/customers|notifications.write|users.read' frontend/src backend` |
| Impact / cause | Default send flow can fail 403 or target internal users instead of customers |
| Recommendation | Reconcile recipient projection and customer notification surface |
| Acceptance | Role-specific recipient selector, customer-safe list, and negative/positive send tests |
| Dependencies / decision | DEC-ACCESS-002 and notification product scope; human decision required |
| First/last SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |

### INT-009 — Retry/idempotency contract differs across command families

| Field | Value |
| --- | --- |
| Severity / status | P1 / `broken_contract` |
| Confidence / category | 91% / mutation integration |
| Expected | Repeated user commands are safely deduplicated or explicitly non-retryable with a stable conflict/error envelope |
| Actual | B2B, Retail, and inventory commands carry `operation_id`/`expected_version`; legacy admin order status/bulk, admin notification send, settings, and several catalog/portfolio writes do not |
| Evidence | `frontend/src/pages/admin/Orders.jsx:155-166,632-650`; `frontend/src/pages/admin/Notifications.jsx:111-134`; `backend/server.py:738-816,1148-1190` |
| Verification | `rg -n 'operation_id|expected_version|bulk-status|admin/notifications' frontend/src backend` |
| Impact / cause | Double-click/retry can duplicate or overwrite state in legacy/admin paths |
| Recommendation | Define one command envelope per approved mutation family; cross-reference SRE-003/SRE-005/SRE-006/SRE-008 |
| Acceptance | Duplicate, stale-version, timeout-retry, and 409/503 contract tests for every retained mutation |
| Dependencies / decision | Legacy route retirement and operation policy; human decision required |
| First/last SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |

### INT-010 — Production-blocked storage upload remains active in legacy UI

| Field | Value |
| --- | --- |
| Severity / status | P1 / `blocked_by_decision` |
| Confidence / category | 97% / storage/file integration |
| Expected | Production upload uses approved private provider, ownership, MIME/signature, malware, backup, retention, and reconciliation controls; local FS is dev/demo only |
| Actual | `/order` uploads multipart files to `/orders`; backend stores and serves `/files/{path}`; no explicit production gate is visible in this flow and download accepts Bearer only |
| Evidence | `frontend/src/pages/operational/NewOrder.jsx:39-52`; `backend/server.py:565-612,818-846`; `ADR-002-production-file-storage-architecture.md` |
| Verification | `rg -n 'store_upload|/files|multipart|upload' frontend/src backend docs/decisions/architecture/ADR-002*` |
| Impact / cause | An active UI path crosses a boundary that canonical authority says is not production-ready |
| Recommendation | Keep provider/storage decision open; classify the legacy route explicitly by environment before any activation |
| Acceptance | Production negative test blocks unapproved upload; approved provider checklist and private retrieval contract exist |
| Dependencies / decision | ADR-002, storage ownership/security decisions; human decision required |
| First/last SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |

### INT-011 — Shared HTTP envelope and list pagination are under-specified

| Field | Value |
| --- | --- |
| Severity / status | P2 / `broken_contract` |
| Confidence / category | 87% / API contract |
| Expected | Protected endpoints declare auth/error/conflict/service-unavailable responses; list consumers share pagination/filter schema |
| Actual | OpenAPI has no security schemes and mostly generic responses; frontend assumes raw arrays; several backend lists cap results without cursor/total and B2B list consumers send no filters |
| Evidence | OpenAPI inspection command above; `backend/b2b_routes.py:166-220,279-350`; `frontend/src/pages/admin/B2BList.jsx` |
| Verification | `python -c "import server; print(sorted(server.app.openapi()['paths']))"` from `backend` |
| Impact / cause | Client error handling and large-list behavior can drift despite passing isolated tests |
| Recommendation | Publish generated contract fixtures and a common list/error envelope |
| Acceptance | Every protected route has declared 401/403/409/410/422/503 where applicable and list tests verify cursor/total/filter behavior |
| Dependencies / decision | API governance and pagination ownership; human decision required |
| First/last SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |

### INT-012 — Readiness is not integrated and can report HTTP 200 while degraded

| Field | Value |
| --- | --- |
| Severity / status | P2 / `backend_only` |
| Confidence / category | 95% / health/readiness integration |
| Expected | Deployment probe and runtime consumer distinguish live from ready; unavailable transaction mutations fail readiness |
| Actual | Product frontend has no `/api/health/ready` consumer; `/health/ready` returns HTTP 200 with `status: degraded` and `transaction_mutations: unavailable`; dev plugin probes a separate server |
| Evidence | `backend/server.py:1192-1212`; `frontend/plugins/health-check/health-endpoints.js`; Layer 09 `SRE-001` |
| Verification | `rg -n '/api/health|health/ready|transaction_mutations' frontend backend` |
| Impact / cause | Orchestrators or smoke tests can treat an unsafe instance as ready |
| Recommendation | Reconcile probe status semantics in deployment/runbook scope; no frontend feature required |
| Acceptance | Probe contract has explicit non-ready status and integration test against transaction capability failure |
| Dependencies / decision | Layer 09/SRE-001 and deployment owner; human decision required |
| First/last SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |

### INT-013 — Project-to-portfolio promotion endpoint is orphaned

| Field | Value |
| --- | --- |
| Severity / status | P2 / `orphan` |
| Confidence / category | 90% / portfolio integration |
| Expected | If project-to-portfolio promotion is approved, an Admin action consumes the endpoint; otherwise it is explicitly out of scope |
| Actual | Backend exposes `/admin/portfolio/from-project/{project_id}`; no frontend consumer exists |
| Evidence | `rg -n 'from-project' backend frontend/src` |
| Verification | same command; no matching frontend path |
| Impact / cause | Capability status is ambiguous; unused handler can drift |
| Recommendation | Record scope decision; do not add a button or remove the route here |
| Acceptance | Decision register marks used/deferred/removed and reverse map is updated |
| Dependencies / decision | Portfolio operating decision; human decision required |
| First/last SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |

### INT-014 — Public catalog endpoints have no consumer, consistent with open Retail slice

| Field | Value |
| --- | --- |
| Severity / status | P2 / `intentionally_deferred` |
| Confidence / category | 95% / deferred feature parity |
| Expected | Public catalog consumer only after first Retail slice and navigation are approved |
| Actual | `/catalog/categories`, `/catalog/products`, and `/catalog/products/{slug}` exist without frontend consumer |
| Evidence | `backend/catalog_routes.py:328-343`; `frontend/src/App.js:133-144` |
| Verification | `rg -n '/catalog/products|/catalog/categories' frontend/src backend` |
| Impact / cause | Not a defect by itself; exposing it would choose a deferred product direction |
| Recommendation | Keep orphan status until an approved Retail slice defines consumer, filters, and pricing contract |
| Acceptance | Approved decision names consumer route, contract, and release phase |
| Dependencies / decision | Master Spec deferred navigation/first Retail slice; human decision required |
| First/last SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |

## 11. Positive controls

- Retail and B2B have separate route families, services, collections, statuses,
  and Admin surfaces; canonical commands use version and operation guards.
- CMS editor and public hooks map to the backend lifecycle, validation,
  scheduling, rollback, and version endpoints; CMS contract tests pass.
- Catalog, material, inventory, portfolio, notification, and health route
  families have real handler/service tests rather than mock-only UI behavior.
- Payment capability reporting is provider-neutral; legacy manual-transfer
  proof/estimate/verify endpoints return 410 and no active proof-upload UI was
  found.
- B2B/Retail detail pages render backend history/next-action state rather than
  inventing a client-only lifecycle.
- Customer-safe B2B projections and Admin permission checks exist in backend
  handlers; no internal cost/margin fields were added to customer-facing rows
  in the inspected paths.
- Focused verification passed: 99 backend tests and 202 frontend tests.

## 12. Status summary by requested capability

| Capability | Status |
| --- | --- |
| Authentication | `partial` / `broken_contract` |
| Customer account | `broken_contract` |
| Admin Studio | `partial` |
| CMS/content | `implemented` (homepage CMS intentionally deferred) |
| Catalog | `implemented` for Admin; public consumer deferred |
| Material pricing | `broken_contract` by role composition |
| Inventory | `implemented` for Admin foundation |
| Retail order | `partial` / decision-blocked canonical flow |
| B2B inquiry/quote/project | `partial` (internal only) |
| Portfolio | `implemented` with orphan promotion helper |
| Storage/upload | `blocked_by_decision` with active legacy residue |
| Notification | `partial` / recipient projection mismatch |
| Reporting | `partial` |
| Audit timeline | domain `implemented`; full viewer `intentionally_deferred` |
| Role/permission management | `partial` / backend-only governance |
| Health/readiness | `backend_only` with SRE-001 contract caveat |

## 13. Unverified assumptions and limitations

- No browser-driven E2E run was performed against a running API and seeded
  Mongo replica set. The database/service tests use their own test topology.
- No provider, mailer, production storage, payment, deployment probe, or
  production-like network timeout was exercised.
- Isolated test pass means the inspected handler/component contract is
  internally coherent; it does not prove the absent consumer or full journey.
- The public homepage's static CMS fallback is treated as intentional because
  the canonical Homepage implementation remains separately authorized.

## 14. Human decisions required

No direction is selected by this audit. The following decisions are required
before remediation plans can be authorized:

1. customer account/login/registration and recovery transport;
2. first Retail slice, legacy-order compatibility/sunset, payment and storage
   activation boundaries;
3. customer-facing B2B organization portal and approval/design/shipment
   contract;
4. identity governance UI scope and customer-vs-internal directory split;
5. material/pricing role composition;
6. notification recipient projection and retry/idempotency contract;
7. portfolio project promotion scope;
8. common API error/list envelope and readiness probe semantics.

## 15. Audit-only remediation phases

1. Freeze the authority-to-route decision log for INT-001 through INT-014.
2. Publish contract fixtures for auth, commands, errors, list pagination, files,
   and payment/readiness negative cases.
3. Re-run protected seeded journeys after a Mongo replica set and approved
   test identities are available.
4. Create separately authorized implementation packets for confirmed gaps.
5. Revalidate this layer after each route, permission, provider, or decision
   change.

## 16. Acceptance criteria

- Every requested capability has a row in the traceability matrix and reverse
  mapping, including intentional deferrals and backend-only routes.
- Each finding has evidence path:line, verification command, status, impact,
  dependency, decision owner, and acceptance criteria.
- Retail and B2B lifecycles remain separate; no provider or deferred direction
  is chosen by this document.
- Contract fixtures cover auth, permission, status, error, pagination,
  currency/date/nullability, file, timeout, retry, and idempotency behavior.
- Environment-blocked journeys are rerun before any release-candidate claim.
- No missing feature is implemented as part of this audit.

## 17. Resume handoff

- Audit state: `complete` for repository/static scope; runtime validation
  `environment_blocked`
- Completed: authority review, source/test inventory, traceability matrix,
  reverse mapping, contract cross-check, 14 findings, positive controls,
  focused backend/frontend tests
- Not completed: browser E2E with seeded data, provider/storage/payment
  verification, deployment probe verification
- First next step: obtain explicit decisions for INT-001/002/003/005/006/007
  and an isolated replica-set environment; then re-run the listed journeys
- Baseline SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`

## 18. Changelog

### 2026-07-28

- Replaced the initialization template with the repository/static
  frontend-backend parity audit.
- Added the requested end-to-end traceability matrix and reverse endpoint map.
- Recorded contract findings `INT-001` through `INT-014`, including explicit
  deferred/blocked/orphan classifications.
- Verified 99 focused backend tests and 202 frontend tests.
- Did not implement features, select providers, or change deferred direction.
