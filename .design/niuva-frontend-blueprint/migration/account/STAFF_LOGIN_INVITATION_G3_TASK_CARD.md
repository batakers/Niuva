# G3 — Staff Login and Invitation Acceptance Reopening

**Status:** Candidate exact-file G3 task card — review only; no G4/source
authorization

**Task ID:** `MIG-03B-G3`

**Date:** 19 August 2026

**Baseline:** `origin/main`
`0bb9111b2052baa2aef0f52196e700519e61284c`

**Surface:** Account/Auth staff boundary and Operations entry

**Parent:** Phase 6 two-axis status amendment

## 1. Objective

Reopen the Staff login and invitation family as one bounded G3 review. Confirm
that the existing frontend presents the staff audience, safe return, password
policy, invitation validation, expiry/recovery, and visible feedback without
merging customer and staff identity semantics.

This card does not implement a new staff feature. It determines whether a
future G4 frontend slice can be named safely.

## 2. Authority and precedence

Read in this order:

1. [`NIUVA_MASTER_SPEC.md`](../../../../docs/NIUVA_MASTER_SPEC.md)
2. [`DOCUMENT_REGISTER.md`](../../../../docs/context/DOCUMENT_REGISTER.md)
3. [`DECISION_REGISTER.md`](../../../../docs/decisions/DECISION_REGISTER.md)
4. `DEC-AUTH-001`, `DEC-AUTH-003`, `DEC-AUTH-004`, `DEC-AUTH-005`,
   `DEC-AUTH-006`, `DEC-AUTH-007`, `DEC-AUTH-008`, `DEC-AUTH-009`, and
   `DEC-AUTH-012`
5. `DEC-ACCESS-001`, `DEC-ACCESS-002`, and `DEC-OPS-002`
6. [`AUTH-01`](../../wireframes/auth/LOGIN_SAFE_RETURN.md) and
   [`AUTH-03`](../../wireframes/auth/STAFF_INVITATION.md)
7. `COMPONENT_STATUS.md`, current source, and current tests at the selected
   baseline

These references constrain the review; they do not authorize identity,
provider, session, role, invitation, or production activation.

## 3. Exact files for G3 review

### 3.1 Runtime candidates — read-only during G3

- `frontend/src/pages/admin/AdminLogin.jsx`
- `frontend/src/pages/auth/StaffInvitationAccept.jsx`
- `frontend/src/components/auth/AuthShell.jsx`
- `frontend/src/components/auth/ProtectedRoute.jsx`
- `frontend/src/App.js` (route ownership reference only)

### 3.2 Existing tests and contracts — read-only during G3

- `frontend/src/pages/auth/StaffInvitationAccept.test.jsx`
- `frontend/src/pages/auth/auth-surface.contract.test.js`
- `frontend/src/components/auth/AuthShell.test.jsx`
- `frontend/src/components/auth/ProtectedRoute.test.jsx`
- `frontend/src/pages/admin/AdminLogin.test.jsx` when present at the selected
  baseline; if absent, record the coverage gap rather than creating a test in
  G3

### 3.3 G4 candidate paths, only if separately authorized after G3

The likely bounded G4 set is:

- `frontend/src/pages/admin/AdminLogin.jsx`
- `frontend/src/pages/auth/StaffInvitationAccept.jsx`
- `frontend/src/components/auth/AuthShell.jsx` only for staff-safe presentation
  continuity
- the two existing staff-focused test/contract paths above

`frontend/src/App.js`, `ProtectedRoute.jsx`, backend identity/session files,
provider configuration, secrets, and role/permission files remain read-only
references unless a later exact-file card explicitly changes the scope.

## 4. Required G3 review questions

### 4.1 Staff/customer boundary

- Does the shell expose staff/Admin purpose without borrowing the Customer
  Dashboard or Public campaign composition?
- Are staff recovery, safe return, and permissions distinct from customer
  destinations?
- Does no visible route or label imply that route visibility grants a role?

### 4.2 Login contract

- Are email/password labels, autocomplete, validation, loading, generic failure,
  disabled, retry, and success states visible and keyboard reachable?
- Does safe return accept only a validated local `/admin*` destination and
  reject `/admin/login`, external URLs, and malformed state?
- Does remember-me remain a local UI choice governed by the Admin session
  authority rather than becoming a frontend permission claim?
- Are password, session, CSRF, and provider details excluded from user-facing
  errors and logs?

### 4.3 Invitation contract

- Is missing, invalid, expired, used, or unavailable invitation authority
  represented without leaking identity or token details?
- Does policy loading distinguish dependency failure from invalid input?
- Are password and confirmation values preserved safely on validation failure?
- Does the success message describe only authoritative persistence and direct
  the user to staff login, without claiming a role or active session before
  backend confirmation?
- Is retry bounded so an uncertain acceptance cannot duplicate or silently
  fabricate activation?

### 4.4 Accessibility and localization

- Are labels, errors, focus return, keyboard order, status announcements, and
  44px targets covered?
- Does the layout survive ID/EN copy, 200% zoom, 390px, and representative
  desktop widths without losing the task?
- Does reduced motion preserve essential loading, error, recovery, and success
  feedback?

## 5. Explicit exclusions

This G3 card does not authorize:

- a new identity provider or Google OIDC flow;
- invitation API, email delivery, token, session, or role migration;
- MFA enrollment/challenge/recovery implementation;
- permission or granular-role changes;
- new support destinations or Admin help channels;
- backend, schema, database, dependency, secret, or provider changes;
- route activation or `/en` private-route invention;
- production/staging readiness, deployment, or go-live; or
- Phase 7 design review.

## 6. G3 acceptance criteria

- exact source and test consumers are recorded at the selected SHA;
- the staff/customer boundary and safe-return allowlist are explicit;
- all visible states include validation, dependency, expired/invalid,
  uncertain, recovery, and success behavior where applicable;
- password-policy loading and invitation authority are treated as backend-owned;
- ID/EN, keyboard, focus, reduced-motion, zoom, and responsive obligations are
  recorded;
- any missing API/error contract is named as a `DEFERRED` capability reason;
- the G3 result is `PASS`, `PASS WITH HOLD`, or `BLOCKED`;
- no runtime source is changed by this card; and
- G4 scope, if recommended, is exact-file and remains a separate gate.

## 7. Handover and rollback

The G3 artifact is documentation-only and reversible by reverting its
documentation commit. A future G4 must use a new worktree from a fresh
`origin/main`, stage only approved paths, preserve the current auth routes and
tests, and record unchanged backend/provider/permission files.
