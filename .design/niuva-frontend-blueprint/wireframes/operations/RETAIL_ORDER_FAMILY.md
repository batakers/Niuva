# OPS-04 Retail Order Operations Family

**Status:** Candidate — Context Only — Operations Retail Order artifact; no
Order/payment/fulfillment/provider/source logic change

**Routes:** `/admin/retail-orders`, `/admin/retail-orders/:id`; legacy
`/admin/orders` remains compatibility-bounded

## 1. Hierarchy

```text
role scope + Retail Order filters
  → safe commercial summary/status
  → allowed payment/fulfillment facts
  → guarded action/history
  → uncertain/conflict/retry
  → return to queue with safe filter/cursor
```

Retail Order is distinct from legacy Order, B2B Quote/Project, Retail Request,
and Assisted Retail Offer. Payment/provider success and production progress
come from authoritative domain state, never badge color or a loading animation.

## 2. State/boundary matrix

| State | Visible meaning | Recovery |
| --- | --- | --- |
| Ready | Factual Order reference/status and role-authorized context | Continue permitted operation |
| Payment/fulfillment uncertain | Outcome unknown | Reconcile authoritative record before retry |
| Conflict/stale | Version/state changed | Reload/compare/reconfirm |
| Permission | No protected detail | Return queue/request help |
| Error | Mutation/provider failure distinct from invalid input | Bounded retry only if safe |
| Success | Exact persisted operation and reference | Next owned action; no inferred production state |

## 3. Self-review

Passed against Retail lifecycle authority, OPS-01, COM-03, DS-03/DS-04, and
status adapters. No Order, payment, reservation, fulfillment, or source logic
changed.
