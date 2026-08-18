# SRC-ACC-03 — Customer-owned order workspace source pilot

**Status:** G3 candidate exact-file review — PASS WITH CONDITIONS; no G4
implementation or delivery authority is implied by this card alone
**Parent:** `SRC-EXPAND-01` route-family expansion and `ACC-01` customer
dashboard-to-owned-order prototype
**Baseline:** `origin/main` at
`deeb30af708c50aae5c8954b938c96d66d7071f3`
**Surface:** Customer Account only — `/dashboard` and `/orders/:id`

## Objective

Validate and, after this G3 gate, improve the smallest Customer Account source
slice that presents an owned legacy-order collection and one customer-safe
read-only detail record. The slice clarifies recoverable dependency failure,
forbidden/not-found outcomes, and malformed collection responses without
changing route ownership, backend projection, order lifecycle, or transaction
capability.

This is not a new Retail Request, Offer, Order, checkout, payment, upload,
reservation, production-tracking, or provider flow. The existing `/order`
compatibility page remains inactive for creation.

## Current route and authority evidence

| Concern | Current evidence | G3 disposition |
| --- | --- | --- |
| Route ownership | `frontend/src/App.js` protects `/dashboard`, `/orders/:id`, and the inactive `/order` compatibility destination. | `App.js` is read-only; no route or redirect change. |
| Customer projection | `backend/server.py` owns `GET /orders`, `GET /orders/{oid}`, and the controlled design-file read. Ownership is constrained by the authenticated customer id. | Backend routes and schemas are read-only references; no backend G4 path. |
| Projection safety | `backend/retail_domain.py::project_customer_legacy_order` uses an allowlist and excludes internal notes, supplier, margin, profit, and storage paths. | Do not duplicate or broaden the projection in the browser. |
| Existing composition | `ClientDashboard.jsx` and `OrderDetail.jsx` already reuse `OperationalLayout`, `SurfacePanel`, `OperationalState`, status adapters, and responsive collection/detail structures. | Reuse existing primitives; no new component library or dependency. |
| Existing state gap | Detail read failures are rendered as one generic error, including 403/404; collection code assumes a list-shaped payload. | G4 may add explicit customer-safe forbidden/not-found copy and fail closed on malformed collection data. |
| Existing tests | Focused dashboard, detail, and customer-portal contract tests cover read-only behavior, retry, stale-route protection, projection exclusions, and desktop/mobile structure. | Extend only the named tests for the amended states. |

## Exact candidate paths for G3/G4 review

### Runtime paths

- `frontend/src/pages/operational/ClientDashboard.jsx`
- `frontend/src/pages/operational/OrderDetail.jsx`
- `frontend/src/i18n.js`

### Test and contract paths

- `frontend/src/pages/operational/ClientDashboard.test.jsx`
- `frontend/src/pages/operational/OrderDetail.test.jsx`
- `frontend/src/pages/operational/customer-portal-surface.contract.test.js`

All other frontend and backend files are read-only consumers or regression
references for this slice. In particular, do not stage `frontend/src/App.js`,
`OperationalLayout`, `OperationalState`, `SurfacePanel`, `StatusStepper`,
`ProtectedRoute`, any Admin/Operations page, or any backend file unless a new
approved contract identifies a concrete defect in one of those owners.

## State and interaction contract

The source must preserve these visible meanings without promoting them to
backend lifecycle enums:

- ready: identify the signed-in customer workspace and owned records;
- loading: announce the read task and reserve the final layout hierarchy;
- empty: explain that no owned history is available and offer the approved
  Retail discovery route;
- dependency error: keep the error generic, preserve the retry, and never show
  provider/internal detail;
- malformed collection: fail closed as a dependency error rather than render a
  fabricated empty account;
- detail not found: state that the record is unavailable without confirming
  protected data;
- forbidden: state that this account cannot access the record without exposing
  permission detail;
- stale route response: never replace the current `id` with an older response;
- read-only detail: expose only the server projection and controlled file read;
  no browser-side mutation, payment, upload, or lifecycle transition; and
- recovery: return to `/dashboard` or the existing approved Retail route using
  ordinary internal navigation only.

Critical states remain visible in the page and available to assistive
technology. Existing `OperationalState` semantics, focus behavior, reduced
motion behavior, and shared token usage remain the default.

## Localization and accessibility

- New or changed customer-facing copy must have complete Indonesian and
  English entries in the existing `frontend/src/i18n.js` owner.
- The existing stored language preference is used; no `/en/dashboard` or
  `/en/orders/:id` route is invented.
- Keep semantic headings, links, table/list alternatives, `aria-live`, visible
  focus, keyboard return, 200% reflow, and minimum 44px controls.
- Do not use color, icon, hover, motion, or hidden route state as the only
  carrier of status or access meaning.

## G3 review requirements

1. Reconfirm the exact consumers and route ownership against the baseline SHA.
2. Confirm that backend projection and authorization already provide the
   customer-safe boundary; frontend work must not become a second authority.
3. Record the 403/404 and malformed-payload state contract, localization,
   recovery, test, browser, accessibility, rollback, and dependency scope.
4. Confirm no shared primitive, token, API, schema, session, permission, or
   lifecycle change is needed.
5. Keep G4 implementation and Git delivery as separate gates, even though the
   active owner Goal permits autonomous delivery after the exact scope passes.

## G4 acceptance criteria

- Customer dashboard and detail remain read-only and customer-safe.
- A 403 or 404 detail response is not presented as a successful empty record
  or as a raw backend message.
- A non-array collection response does not render a false empty state.
- Generic retry remains available only where retry is a safe next action.
- No `POST`, `PUT`, `PATCH`, or `DELETE` is introduced in these pages.
- Existing `/dashboard`, `/orders/:id`, and inactive `/order` route semantics
  remain unchanged.
- ID/EN copy, keyboard/focus, reduced motion, 320/390/768/1024/1440 layouts,
  200% reflow, and Axe evidence are reviewed.
- No new runtime dependency, backend source, provider, checkout, payment,
  upload, reservation, production, deployment, readiness, or go-live claim is
  made.

## Verification and rollback

G4 must run focused dashboard/detail/contract tests, full frontend regression,
production build, dependency and diff checks, and browser/accessibility checks
for ID/EN at the required viewports. Rollback is limited to the exact runtime,
copy, and test paths listed above; backend projection and route ownership remain
untouched.

## Owner Goal disposition

The owner Goal authorizes autonomous review and delivery for this bounded
documentation/source sequence: exact-path staging, one commit per coherent
PR, push, PR opening, CI/thread review, and merge after all checks pass. That
authorization does not broaden this card, activate an inactive capability, or
replace backend authorization and production evidence.
