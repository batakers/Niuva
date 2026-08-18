# ACC-01 Owned Order Flow Prototype

**Status:** Candidate — Context Only — Account calibration prototype; no API,
authorization, Order lifecycle, or source change

**Routes:** `/dashboard` → `/orders/:id` → dashboard/Retail return

## 1. Flow

```text
auth bootstrap → customer workspace
  ├─ loading/error/empty/retry
  └─ owned legacy-order list
       → selected owned record detail
       → safe reference/status + customer-safe commercial/file/payment/history
       → permitted download/action
       → return to list with safe context
```

The flow never renders internal cost, margin, supplier, profit, or internal
notes. Unowned/not-found and forbidden states do not leak whether another
customer's record exists.

## 2. Calibration states

| State | Visible behavior | Safe next action |
| --- | --- | --- |
| Bootstrap/loading | Stable workspace/list/detail hierarchy | Wait; avoid duplicate request |
| Empty | Explain no owned records and offer Retail discovery | Go to approved Retail route |
| Dependency error | In-page error distinct from empty | Retry with safe context |
| Unowned/forbidden/not found | Non-leaking unavailable state | Return dashboard or authorized help |
| Stale/expired session | State reauthentication need | Customer login retains permitted return |
| Ready detail | Safe reference/status and allowed projection | View permitted file/payment/history |
| Download failure | Preserve detail context; explain no false completion | Bounded retry when safe |
| Success | Name completed permitted action/reference | Continue owned task; no production guarantee |

## 3. Projection checklist

Allowed only when policy permits: customer-facing reference, status, approved
commercial summary, permitted file/download, payment history projection, and
factual work history. Exclude internal cost, margin, supplier, profit, notes,
other customer data, hidden permission metadata, and unsupported ETA/capacity.

## 4. Self-review

Passed against AUTH-01, DS-03/DS-04/DS-05, customer route matrix, and
customer-safe projection authority. Keyboard return, stale session, 390/1440,
200% reflow, and unowned cases are represented. No source or API changed.
