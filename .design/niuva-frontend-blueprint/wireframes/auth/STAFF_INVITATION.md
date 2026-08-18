# AUTH-03 Staff Invitation Acceptance

**Status:** Candidate — Context Only — invitation recovery artifact; no role,
invitation, identity, email, session, or source change

**Route:** `/staff-invitation`

## 1. Flow

```text
invitation context/identity (safe projection)
  → loading/token validation
  ├─ invalid/expired/used → non-leaking recovery + restart/contact owner
  ├─ dependency uncertainty → bounded retry, no activation claim
  └─ acceptance form → authoritative success → `/admin/login`
```

Acceptance does not grant a role, change permission, or prove an active staff
session unless the backend authority confirms it. Invitation email and token
details are never exposed beyond the safe context required to continue.

## 2. States and checks

| State | Visible contract | Recovery |
| --- | --- | --- |
| Ready | Safe invitation identity and acceptance purpose | Continue form |
| Invalid/expired/used | Non-disclosing reason class | Restart/request a new invitation through owner |
| Validation | Field relationship and preserved safe values | Correct and resubmit |
| Dependency/uncertain | Outcome unknown; no role/session claim | Reconcile before retry |
| Success | Invitation acceptance persisted; next is staff login | Navigate to `/admin/login` |

Keyboard/focus, ID/EN long copy, 390/1440, 200% reflow, 44px targets, and
reduced motion are required.

## 3. Self-review

Passed against AUTH-01/02, ProtectedRoute and staff authority. No role,
identity, provider, email, session, route, or source behavior changed.
