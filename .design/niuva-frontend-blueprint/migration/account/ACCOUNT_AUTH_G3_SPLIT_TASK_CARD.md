# MIG-03A — Account/Auth customer safe-return pilot

**Status:** G3 reviewed — PASS WITH CONDITIONS; no G4 source authorization
**Parent:** `MIG-03` Account/Auth source pilot task card
**Baseline:** `origin/main` at
`a73ea886a6bb317b19ded629cb88bbea885188ec`
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

## Owner review and G3 result

**Review date:** 18 August 2026 (Asia/Jakarta)

**Owner disposition:** The MIG-03A split is approved for owner review and G3
exact-file review. This record does not grant G4 runtime implementation
authority. Dashboard Customer, Order Detail, staff login, and Operations remain
outside the slice.

**G3 result:** **PASS WITH CONDITIONS** at `origin/main`
`a73ea886a6bb317b19ded629cb88bbea885188ec`. The scope is bounded and its
consumers, route owners, state obligations, and rollback boundary are
reviewable. Runtime source remains unchanged by this review.

### Evidence reviewed

| Concern | Current evidence | G3 disposition |
| --- | --- | --- |
| Route ownership | `frontend/src/App.js` owns `/login`, `/forgot-password`, `/forgot-password/check-email`, `/reset-password`, `/reset-password/success`, and `/reset-password/error`; `/dashboard`, `/orders/:id`, and `/admin/login` remain separate route owners. | `App.js` is read-only; no route activation or route rewrite is authorized. |
| Customer safe return | `CustomerLogin.jsx` and `ProtectedRoute.jsx` use an allowlist for owned destinations and preserve pathname/query/hash for the protected redirect. | Keep the allowlist; G4 must not broaden it to arbitrary or external URLs. |
| Customer/staff boundary | `AuthShell.jsx` receives distinct `customer`, `staff`, and `recovery` audiences; `AdminLogin.jsx` and `StaffInvitationAccept.jsx` remain read-only references. | No shared primitive or audience merge is required for G3. |
| Recovery security presentation | `ForgotPassword.jsx` uses generic request handling, local email masking, cooldown/resend, and recoverable failure states; `ResetPassword.jsx` removes the token from the visible URL and exposes invalid/preparation/error/success states. | Frontend presentation is bounded; backend non-enumeration, single-use, transaction, session-revocation, and token-storage authority remains governed by the approved auth decisions and requires separate verification. |
| Existing tests and contracts | `ProtectedRoute.test.jsx`, `ForgotPassword.test.jsx`, `ResetPassword.test.jsx`, and `auth-surface.contract.test.js` cover the current redirect, recovery, audience, token-history, and contract behavior. | Proportional baseline evidence exists; a focused `CustomerLogin.test.jsx` is a G4 candidate only if behavior changes. |
| Read-only integration surface | `frontend/src/App.js`, `AuthShell.jsx`, `AuthShell.test.jsx`, `ResetPasswordState.jsx`, staff invitation, Admin login, and existing route tests are consumers/regression references. | Do not stage or modify these files in MIG-03A unless a separately approved defect changes the exact scope. |

### Conditions carried to G4

1. **Localization:** The current Customer Login and recovery copy is
   Indonesian-first and does not yet demonstrate complete ID/EN system,
   validation, recovery, and error copy. G4 must resolve this against the
   stored-language and Account/Auth contract before claiming localized
   completion; it must not silently invent an `/en` private counterpart.
2. **Recovery context:** The current recovery flow preserves audience and
   dedicated state routes, but does not establish preservation of an arbitrary
   protected `location.state.from` target across forgot/reset screens. G4 must
   either implement an explicitly allowlisted, non-open-redirect context
   handoff or record the intentional rule that recovery returns to the
   customer-login destination without promising the protected target. It must
   not silently discard or fabricate owned-resource context.
3. **Focused coverage:** There is no current `CustomerLogin.test.jsx` in the
   reviewed baseline. If G4 changes Customer Login behavior, add focused
   coverage for safe return, generic failure, loading/duplicate-submit, and
   keyboard/focus behavior. Do not add a test merely to imply runtime
   completion without the corresponding behavior.
4. **Authority boundary:** UI state, route visibility, or a successful browser
   response must not be treated as authentication, recovery, session,
   permission, or customer-projection authority. Backend/API verification and
   any source change remain separately gated.

### G4 exact-file gate

G4 may be requested only after this G3 record is accepted. A future G4 request
must name the exact runtime/test paths, the chosen resolution for all four
conditions above, and the proportional browser/accessibility/security checks.
It must continue to exclude Dashboard Customer, Order Detail, staff login,
Operations, registration, identity-provider activation, session-schema or
role/permission changes, backend authorization, customer-projection
migration, provider activation, new dependencies, deployment, readiness, and
go-live.

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

**Self-review result:** G3 exact-file review is bounded and recorded as PASS
WITH CONDITIONS at the current `origin/main` SHA. Only this documentation card
is changed; no runtime source, route, API, dependency, or capability has been
implemented or authorized.
