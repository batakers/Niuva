# OPS-04 - Retail Order G4 Exact-File Plan and Read Contract

**Status:** Owner-approved G4 implementation contract; local validation passed
and bounded Git delivery is authorized

**Date:** 20 August 2026

**Baseline:** `origin/main`
`8748996d79b4d0294512439571c983082768d9da`

**Authority boundary:** This contract narrows the owner-approved OPS-04 G3
card. It does not activate Retail Order creation, checkout, payment,
fulfilment, production, refund, return, reprint, complaint, provider, or
after-sales capability.

**Owner decision:** The owner authorized delivery of this exact-file slice on
20 August 2026. Commit, PR, CI, review, and merge remain evidence to be recorded
before delivery closure; the authorization does not imply deployment,
readiness, or go-live.

## 1. Exact-file plan

Only these files may be written for this slice:

### Backend/API

- `backend/retail_routes.py`
- `backend/retail_service.py`
- `backend/retail_domain.py`
- `backend/tests/test_retail_order_routes.py`
- `backend/tests/test_retail_order_aggregate.py`

### Frontend/presentation

- `frontend/src/pages/admin/B2BList.jsx`
- `frontend/src/pages/admin/RetailOrderDetail.jsx`
- `frontend/src/i18n.js`
- `frontend/src/pages/admin/retail-order.contract.test.js`
- `frontend/src/pages/admin/b2b-workbench.contract.test.js`

No route registration, permission definition, schema, migration, provider,
storage, payment, fulfilment, or dependency file may change.

## 2. Read API contract

### 2.1 Collection

`GET /api/admin/retail-orders`

Required authorization remains `orders.read`. The URL is not authorization.

Accepted query parameters:

| Parameter | Contract |
| --- | --- |
| `status` | Optional canonical Retail status. Unknown values return `422` with `retail_status_invalid`. |
| `search` | Optional trimmed text, maximum 80 characters. Case-insensitive match against order number, customer name, or customer email only. |
| `updated_from` | Optional ISO-8601 timestamp or `YYYY-MM-DD`, inclusive. |
| `updated_to` | Optional ISO-8601 timestamp or `YYYY-MM-DD`, inclusive. |
| `limit` | Integer `1..50`, default `50`. |
| `cursor` | Opaque base64url cursor issued by this endpoint. Invalid or query-mismatched cursors return `422` with `retail_cursor_invalid`. |

Ordering is fixed and documented: `updated_at DESC`, then `id DESC`.
Client-provided sort fields are not accepted. A continuation page is fetched
with the same filters and cursor; the UI must not silently restart the query.

Response:

```json
{
  "items": [
    {
      "id": "...",
      "order_number": "NIV-R-2608-0001",
      "record_class": "retail_order",
      "status": "created",
      "version": 1,
      "updated_at": "2026-08-20T10:00:00+00:00",
      "created_at": "2026-08-20T10:00:00+00:00",
      "customer": {"name": "Ayu"},
      "item_count": 1,
      "total_minor": 150000,
      "currency": "IDR",
      "fulfilment_method": "ship",
      "permitted_next_actions": ["request_payment"],
      "suspended_actions": ["cancel", "refund", "return"]
    }
  ],
  "next_cursor": null
}
```

`items: []` with `next_cursor: null` is the authoritative empty/no-match
state. A page never contains more than `limit` items. Unknown stored fields
are not copied into the response.

### 2.2 Detail

`GET /api/admin/retail-orders/{order_id}` keeps the existing `orders.read`
boundary and returns an explicit internal projection. It includes the order
identity, status/version, safe customer fields, item/configuration/price
snapshots, currency/total, fulfilment method, timestamps, safe history,
`permitted_next_actions`, and named `suspended_actions`.

It excludes `creation_operation_id`, raw storage paths, provider payloads,
internal cost/margin/profit fields, actor identifiers, and any unknown document
field. `notes` is available only to the operations profile.

The projection profile is selected from the actor roles:

| Profile | Roles | Additional fields |
| --- | --- | --- |
| `operations` | `order_admin`, `super_admin` | Customer email/phone, notes, and history operation reference. |
| `finance` | `finance` | Customer email, financial snapshots, and safe history without phone or notes. |
| `manager` | `manager_approver` | Customer name, financial snapshots, and safe history without contact details or notes. |

All profiles remain read-only. A projection profile never grants a mutation
permission and does not imply that any lifecycle action is active.

## 3. Error and recovery contract

- `401`/`403` remains the authentication/permission boundary.
- `404` returns `retail_order_not_found` without protected detail.
- `422` represents invalid status, date range, search length, or cursor.
- `503` continues to represent intentionally inactive Retail mutations.
- `500` never exposes raw document fields or provider details.
- A failed continuation preserves already-rendered rows and the exact query;
  retrying reuses the same filters and does not duplicate rows.

## 4. Frontend behavior

`B2BList` receives Retail-only status/search/date controls. Existing Inquiry,
Quote, Project, and Work Order consumers retain their current request shape.
Changing a Retail filter resets the cursor and replaces the visible collection.
Continuation appends only after validating `next_cursor`; an error preserves
the current rows and exposes a bounded retry.

`RetailOrderDetail` uses ID/EN translations for every visible string,
including the inactive transaction explanation. It does not render command
buttons or call transition/suspended-action endpoints.

The shared collection composition in `B2BList` clips its own content to the
semantic panel radius. This is a caller-owned `overflow-hidden` boundary for
the five Inquiry, Quote, Project, Work Order, and Retail Order queues. It does
not change the default `SurfacePanel` primitive, whose other consumers may
need visible focus, overlay, tooltip, or menu overflow.

## 5. Evidence required before closure

- backend direct permission, query, cursor, projection, unknown-field, and
  role-redaction tests;
- frontend contract tests for filter request shape, localization, inactive
  copy, no mutation calls, caller-owned collection clipping, and an unchanged
  primitive overflow default;
- local backend/frontend browser validation at the configured local backend
  origin (default `localhost:8000`; this worktree may use a documented
  conflict-free fallback such as `127.0.0.1:8001`) and `localhost:3000`;
- ID/EN, keyboard/focus, reduced-motion, 320/390/768/1024/1440px, and 200%
  zoom checks; and
- truthful recording that local runtime evidence is not staging or production
  readiness evidence.

## 6. Explicit non-goals

This contract does not authorize a new Retail lifecycle, role, permission,
database index/migration, provider, payment, fulfilment, notification, or
production capability. Bounded Git delivery is authorized, but successful
commit, push, PR, CI, review, and merge must be verified rather than inferred.
Deployment, readiness, and go-live remain separate gates.
