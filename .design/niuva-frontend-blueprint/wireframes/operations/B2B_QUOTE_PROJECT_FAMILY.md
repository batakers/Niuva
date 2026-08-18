# OPS-03 B2B Quote and Project Family

**Status:** Candidate — Context Only — Operations route-family artifact; no
source, lifecycle, commercial rule, or authorization change

## 1. Separate resources

```text
Inquiry queue/detail → Quote queue/detail/revision → Project queue/detail
        (handoff context only; each resource retains its own authority/history)
```

Inquiry, Quote, and Project are not one status machine. Quote revisions expose
version identity, guarded submit, stale/conflict and approval boundaries.
Project detail exposes role-appropriate history and handoff context. Customer
projections never reveal internal cost, margin, supplier, profit, or notes.

## 2. State/action matrix

| Resource | Ready | Guarded states | Next action |
| --- | --- | --- | --- |
| Inquiry | Reference, need, contact, lifecycle | Permission, stale, uncertain | Review/contact through authorized action |
| Quote | Versioned commercial context | Draft/awaiting approval/offered/expired/conflict | Reconcile and guarded revision/offer |
| Project | Scope, contribution, history | Permission, missing evidence, conflict | Authorized detail/history action |

No UI action creates an Order, payment attempt, reservation, or production
state. Confirmation and result must name the authoritative resource/reference.

## 3. Responsive/accessibility

Queue/list alternatives preserve identity and action at 390/768/1024/1440px;
keyboard focus returns after revision/conflict; long commercial copy wraps; no
status is color-only.

## 4. Self-review

Passed against OPS-01, B2B lifecycle authority, DS-02–DS-04, and customer-safe
projection. No source, transition, permission, or commercial rule changed.
