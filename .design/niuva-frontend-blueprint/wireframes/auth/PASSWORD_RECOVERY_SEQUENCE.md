# AUTH-02 Password Recovery Sequence

**Status:** Candidate — Context Only — Auth recovery artifact; no token policy,
email provider, session, identity, or source change

**Routes:** `/forgot-password`, `/forgot-password/check-email`,
`/reset-password`, `/reset-password/success`, `/reset-password/error`

## 1. Sequence

```text
request (customer/staff audience)
  → non-enumerating acknowledgement/check-email
  → token validation
  ├─ invalid/expired → safe error + restart
  ├─ dependency uncertainty → visible error + bounded retry
  └─ valid → password policy form → success → correct audience login
```

## 2. Contract

- Request never reveals whether an account exists.
- Token validity, expiry, and password policy remain server/domain authority.
- New-password validation preserves safe values but never logs or echoes the
  secret; submit is disabled while the authoritative request is pending.
- Success names the completed reset and directs to customer or staff login;
  it does not authenticate or grant a role by itself.
- Expired/error state allows safe restart without replaying stale authority.

## 3. Accessibility/localization

Auth landmarks, visible labels, focus to summary/field, password-manager
autocomplete, non-disclosing ID/EN errors, 44px targets, 390/1440 and 200%
reflow, and reduced-motion static states are required.

## 4. Self-review

Passed against AUTH-01, DS-03, current recovery routes, and privacy rules. No
provider, session, token, route, or source behavior changed.
