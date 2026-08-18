# MIG-03A — Account/Auth customer safe-return pilot

**Status:** Candidate exact-file G3 amendment — no G4 source authorization
**Parent:** `MIG-03` Account/Auth source pilot task card
**Baseline:** `origin/main` at
`d8438b2e4e4d6b97eb147f4866b0890e85f0de06`
**Surface:** Customer login and recovery only

## Objective

Test the smallest representative Account/Auth slice: customer login, safe
return, non-enumerating password recovery, and reset-state continuity. This
pilot does not implement customer dashboard or owned-order detail, and it does
not modify staff authentication.

## Exact candidate paths for G3/G4 review

Runtime candidates:

- `frontend/src/pages/auth/CustomerLogin.jsx`
- `frontend/src/pages/auth/ForgotPassword.jsx`
- `frontend/src/pages/auth/ResetPassword.jsx`
- `frontend/src/components/auth/ProtectedRoute.jsx`

Existing test and contract paths:

- `frontend/src/components/auth/ProtectedRoute.test.jsx`
- `frontend/src/pages/auth/ForgotPassword.test.jsx`
- `frontend/src/pages/auth/ResetPassword.test.jsx`
- `frontend/src/pages/auth/auth-surface.contract.test.js`

Candidate coverage path, only if G4 identifies the gap as real:

- `frontend/src/pages/auth/CustomerLogin.test.jsx`

The following are read-only consumer and regression references, not default
change paths: `frontend/src/components/auth/AuthShell.jsx`,
`frontend/src/components/auth/AuthShell.test.jsx`,
`frontend/src/pages/admin/AdminLogin.jsx`,
`frontend/src/pages/auth/StaffInvitationAccept.jsx`,
`frontend/src/pages/auth/ResetPasswordState.jsx`, `frontend/src/App.js`, and
the existing auth/customer route tests.

## Acceptance criteria

- Safe return accepts only an allowlisted owned route/context; no external open
  redirect or invented private `/en` counterpart is introduced.
- Customer login and recovery remain distinct from staff login in audience,
  destination, permission, copy, and shell composition.
- Recovery is non-enumerating, preserves safe context, distinguishes expired
  session from invalid input, and does not activate registration or an
  identity provider.
- Default, focus, validation, loading, dependency failure, expired, offline,
  recovery, and success states remain visible, localized in ID/EN, keyboard
  reachable, and truthful about what persisted.
- Customer-safe projection and owned-order detail are explicitly out of scope;
  no internal cost, margin, supplier, profit, or internal note may be exposed.
- The slice preserves 44px targets, 200% reflow, reduced motion, and browser/
  accessibility evidence at the required viewports.

## G3 review requirements

- Reconfirm exact consumers and route ownership against the selected SHA.
- Confirm the existing AuthShell audience boundary does not require a shared
  primitive change; any such change needs a separate foundation task.
- Record state, localization, focus-return, privacy, rollback, and test scope.
- Keep `frontend/src/App.js` read-only unless a separately approved routing
  defect is demonstrated.

## G4 boundary and exclusions

G3 review does not authorize source changes. G4 requires a separate exact-file
authorization after this card is accepted. No identity provider, registration,
session schema, role/permission mutation, backend authorization, customer
projection migration, dashboard/order-detail implementation, staff-login
change, provider, or new dependency is included.

## Verification and rollback

After G4, run focused auth tests, full frontend regression, production build,
dependency and diff checks, keyboard/return-path browser checks, Axe, and the
Impeccable Product-register critique. Use a fresh isolated worktree from
`origin/main`; rollback only the approved pilot paths and preserve auth history.

**Self-review result:** Candidate G3 split is bounded and ready for owner review;
no runtime source has been changed by this card.
