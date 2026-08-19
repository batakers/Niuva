# OPS-04 — Retail Order G4 Local Self-Review

**Status:** Local G4 implementation validated; bounded Git delivery authorized
and pending evidence

**Date:** 20 August 2026

**Baseline:** `origin/main`
`8748996d79b4d0294512439571c983082768d9da`

**Capability axis:** `DEFERRED` — Retail creation, checkout, payment,
fulfilment, production, refund, return, reprint, complaint, and provider
actions remain inactive.

## 1. Scope and exact paths

The implementation follows
[`OPS_04_RETAIL_ORDER_G4_API_CONTRACT.md`](../migration/operations/OPS_04_RETAIL_ORDER_G4_API_CONTRACT.md).
Changed runtime/test paths are limited to:

- `backend/retail_routes.py`;
- `backend/retail_service.py`;
- `backend/retail_domain.py`;
- `backend/tests/test_retail_order_routes.py`;
- `backend/tests/test_retail_order_aggregate.py`;
- `frontend/src/pages/admin/B2BList.jsx`;
- `frontend/src/pages/admin/RetailOrderDetail.jsx`;
- `frontend/src/i18n.js`;
- `frontend/src/pages/admin/retail-order.contract.test.js`; and
- `frontend/src/pages/admin/b2b-workbench.contract.test.js`.

No route registration, role/permission definition, schema, migration,
provider, payment, fulfilment, storage, or dependency file changed.

## 2. Implemented contract

- Retail collection requests now use `status`, `search`, `updated_from`,
  `updated_to`, `limit`, and opaque cursor parameters.
- Ordering is fixed to `updated_at DESC`, then `id DESC`; continuation returns
  `{items, next_cursor}` and rejects invalid or mismatched cursors with a
  structured `422` error.
- Search is limited to order number, customer name, and customer email and is
  capped at 80 characters.
- Detail and list responses use explicit allowlists. Unknown fields, creation
  operation IDs, actor IDs, raw paths, provider payloads, and internal margin
  data are excluded.
- Operations, finance, and manager profiles receive only their approved safe
  fields. A projection profile does not grant mutation permission.
- The frontend exposes Retail-only status/search/date controls, keeps the
  current rows and exact filters on continuation failure, and renders a
  distinct no-match state. Filter and continuation responses carry a local
  request sequence, so a stale response cannot overwrite a newer query.
- Inactive Retail transaction copy is localized in Indonesian and English;
  no transition or suspended-action command is introduced.
- The five shared Operations collections clip their content at the
  `B2BList` composition boundary. The shared `SurfacePanel` primitive remains
  unchanged so other consumers keep caller-controlled overflow behavior.

## 3. Verification

- Focused backend: **50 passed** (`-n 0`) across the four OPS-04 suites.
- Backend regression excluding environment-bound integration/quality harnesses:
  **1038 passed, 17 skipped, 14 subtests passed**.
- Frontend focused collection contracts: **2 suites, 40 tests passed**. The
  new clipping contract failed before the consumer fix and passed afterward.
- Frontend full suite: **75 suites, 504 tests passed**. Existing asynchronous
  `act(...)` warnings in the Contact test remain outside this slice.
- Frontend production build: successful; postbuild bundle report completed
  (report-only mode, total gzip 630.88 kB).
- Local build intentionally left the production-site variable empty, so
  release sitemap generation was skipped; no production origin was inferred.
- Python compilation and `git diff --check`: passed.
- Browser matrix: all five shared collections passed at 390px and 1440px
  (**10/10**). Each panel computed four 20px radii plus hidden x/y overflow,
  with no page or panel overflow, page exception, console error, or
  Axe WCAG A/AA violation. Keyboard focus remained visible; the Retail search
  field retained its focus ring and every filter control remained 44px high.
- 200% zoom: all five routes passed both a 390px mobile visual-viewport scale
  of 2 and a 1440px desktop browser-zoom equivalent using a 720 CSS-pixel
  viewport at device-pixel ratio 2 (**10/10**). Content and state remained
  present without internal or page horizontal overflow. A preliminary CSS
  `zoom` style check was discarded because it scales the existing grid without
  browser reflow and is not valid browser-zoom evidence.
- Screenshot critique confirmed the lower white state region follows both
  bottom panel radii on the Retail, Project, Quote, Inquiry, and Work Order
  queues at the representative mobile and desktop widths.
- Impeccable detector returned `[]`; the production dependency audit passed;
  and `git diff --check` reported no whitespace error.
- Local API smoke: `GET /api/health` returned `200`; unauthenticated Retail
  queue access returned `401`.

The full backend command was also attempted. Nine failures were isolated to
the pre-existing external service on port 8000, environment-bound security
fixtures, or subprocess-based quality harnesses; none occurred in the focused
OPS-04 suites or the broad backend run with those harnesses excluded.

## 4. `SurfacePanel` consumer audit and promotion disposition

The source audit enumerated every current `<SurfacePanel>` opening tag under
`frontend/src`: **71 instances across 29 source files**. Ten instances in
seven files opt into caller-owned clipping; 61 retain the visible-overflow
primitive default. The non-clipped consumers include 16 files with a table or
form, 13 with a select or overlay responsibility, and seven with explicit
focus styling.

**Disposition:** do not promote `overflow-hidden` into the shared primitive.
The five queue routes have one proven shared composition owner in `B2BList`,
so clipping is correct there. A primitive default would silently change 61
other instances and could crop focus indication or content that needs an
explicit responsive/overlay boundary. Promotion remains deferred until those
consumers receive route/state/browser evidence under their own surface tasks.

## 5. Local runtime evidence

For this isolated worktree, local services are currently reachable at:

- frontend: `http://localhost:3000`;
- backend: `http://127.0.0.1:8001`; and
- MongoDB replica set: `127.0.0.1:27017` via the transaction compose file.

Port `8000` was already occupied by an unrelated local container, so the
backend used `8001` and the frontend was configured to call that local origin.
This is local evidence only; it is not staging, production readiness, or
go-live evidence.

## 6. Gate disposition

`PASS WITH CONDITIONS` for local G4 validation:

- The approved query/projection/localization contract is implemented and
  verified in the named paths.
- The shared collection corner defect is corrected at the caller boundary and
  regression-protected without changing the `SurfacePanel` primitive.
- Retail transaction and after-sales capabilities remain explicitly deferred.
- The owner authorized bounded Git delivery on 20 August 2026. At the time of
  this self-review update, staging, commit, push, PR, and merge evidence has not
  yet been recorded.
- Delivery must verify the exact staged paths, CI, review threads, exact head,
  and clean merge state. Deployment, readiness, and go-live remain excluded.
