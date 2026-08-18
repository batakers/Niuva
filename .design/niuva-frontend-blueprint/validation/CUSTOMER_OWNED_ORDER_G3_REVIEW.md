# SRC-ACC-03 G3 exact-SHA review — Customer-owned order workspace

**Status:** G3 PASS WITH CONDITIONS; G4 source implementation remains bounded
to the companion task card
**Review date:** 19 August 2026 (Asia/Jakarta)
**Baseline:** `origin/main`
`deeb30af708c50aae5c8954b938c96d66d7071f3`
**Primary contract:**
[`CUSTOMER_OWNED_ORDER_G3_TASK_CARD.md`](../migration/account/CUSTOMER_OWNED_ORDER_G3_TASK_CARD.md)

## 1. Review purpose and boundary

This review validates the exact Customer Account route-family source scope
after the blueprint rebaseline and PR #297. It does not promote a new design
system, alter semantic tokens, change backend authority, or activate a Retail
transaction capability.

The slice covers only the customer-owned legacy history path:

```text
/dashboard
  -> owned-order loading/error/empty/list
  -> /orders/:id
  -> customer-safe read-only detail, file read, payment/history projection
  -> /dashboard or the approved Retail discovery route
```

`/order` remains a compatibility explanation and not an active create-order
flow. Customer dashboard and detail are distinct from Staff Login, Admin,
Operations, Retail checkout, payment, upload, reservation, production, and
provider flows.

## 2. Evidence reviewed

| Evidence | Finding | G3 result |
| --- | --- | --- |
| `frontend/src/App.js` | `/dashboard` and `/orders/:id` are protected; `/order` remains a protected compatibility destination. | PASS — route owner is existing and read-only. |
| `frontend/src/pages/operational/ClientDashboard.jsx` | Reads `/orders`, uses shared operational primitives, and offers desktop table plus mobile list. | PASS WITH CONDITION — malformed list payload must fail closed in G4. |
| `frontend/src/pages/operational/OrderDetail.jsx` | Reads `/orders/:id`, guards stale route responses, exposes controlled file download, and performs no mutations. | PASS WITH CONDITION — 403/404 need customer-safe distinct outcomes in G4. |
| `backend/server.py` | Customer list/detail/file reads are authenticated and constrained by `user_id`; mutation endpoints remain separate. | PASS — no backend source change required. |
| `backend/retail_domain.py` | Customer legacy projection is allowlist-based and excludes internal notes, supplier, margin, profit, and storage paths. | PASS — browser must not reconstruct or widen projection. |
| Existing focused tests and contract test | Retry, StrictMode deduplication, stale response, read-only download, projection exclusions, and responsive structures are covered. | PASS — extend named tests for the amended states. |

## 3. Exact G4 scope

| Exact path | Allowed change | Explicitly unchanged |
| --- | --- | --- |
| `frontend/src/pages/operational/ClientDashboard.jsx` | Fail closed on malformed collection payload while preserving loading/error/empty/retry semantics. | Route, API method, projection, lifecycle, Retail capability, mutation behavior. |
| `frontend/src/pages/operational/OrderDetail.jsx` | Map safe 403/404 outcomes to localized forbidden/not-found states; keep generic retry only for retryable dependency failure. | Ownership query, route, file endpoint, payment/history projection, backend status authority. |
| `frontend/src/i18n.js` | Add the minimal ID/EN copy for forbidden/not-found outcomes if absent. | Existing language preference and all unrelated copy. |
| Named dashboard/detail/contract tests | Cover malformed collection, 403, 404, retry boundary, and existing safety invariants. | No test may imply provider, backend, staging, or production readiness. |

No new dependency, shared primitive, token, route, backend file, API schema,
session, role, permission, or database change is in scope.

## 4. State and safety decisions

1. A 404 is rendered as an unavailable record with a safe explanation and
   return-to-dashboard action; it does not reveal whether another customer's
   record exists.
2. A 403 is rendered as an access boundary with the same safe recovery shape;
   permission internals and backend detail remain hidden.
3. A malformed `/orders` response is a dependency error, not an empty account.
4. A generic dependency error retains a bounded retry; forbidden/not-found do
   not offer a retry that could loop without a changed authority.
5. Download remains a user-clicked, authenticated GET through the existing
   helper. Failure remains a visible generic toast plus the unchanged page
   state; no mutation or upload affordance is added.
6. Status labels and history remain projections. They do not authorize
   production tracking, payment, fulfillment, or a new Retail Order.

## 5. Required verification

- focused `ClientDashboard`, `OrderDetail`, and customer-portal contract tests;
- full frontend test suite and production build;
- `git diff --check` and dependency audit;
- browser checks for ID/EN at 320, 390, 768, 1024, and 1440px with no
  horizontal overflow, runtime exception, lost action, or target below 44px;
- keyboard/focus and 200% reflow checks;
- Axe at representative mobile and desktop widths;
- reduced-motion check for unchanged layout/state semantics; and
- Impeccable/Product-register review limited to the exact Customer Account
  paths, with Public/Commerce/Operations registers treated as read-only.

## 6. G3 result and next gate

**Result: PASS WITH CONDITIONS.** The route owner, customer-safe backend
projection, current consumers, and exact frontend/test paths are reviewable at
the selected SHA. The conditions are mechanical and bounded: close the
malformed-payload and 403/404 presentation gaps, prove the listed evidence,
and keep all inactive capabilities dormant.

The next gate is G4 implementation in a fresh source worktree from the updated
`origin/main`. After proportional verification, the active Goal permits exact
path staging, commit, push, PR review/thread handling, and merge without a new
interactive approval. A passing G4 does not establish staging, production
readiness, or go-live.
