# MIG-03A — Account/Auth customer safe-return pilot

**Status:** G4 exact-file scope amended — implementation authorized by the
owner Goal; no runtime change in this card
**Parent:** `MIG-03` Account/Auth source pilot task card
**Baseline:** `origin/main` at
`2cb2c69e4d8b13232045857616d3c89f954a418b`
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
- `frontend/src/pages/auth/ResetPasswordState.jsx`
- `frontend/src/components/auth/ProtectedRoute.jsx`
- `frontend/src/components/auth/AuthShell.jsx` (copy/presentation only; no
  authentication mechanics or staff-flow change)

Existing test and contract paths:

- `frontend/src/components/auth/ProtectedRoute.test.jsx`
- `frontend/src/pages/auth/ForgotPassword.test.jsx`
- `frontend/src/pages/auth/ResetPassword.test.jsx`
- `frontend/src/pages/auth/ResetPasswordState.test.jsx`
- `frontend/src/pages/auth/auth-surface.contract.test.js`
- `frontend/src/components/auth/AuthShell.test.jsx`

Candidate coverage path, only if G4 identifies the gap as real:

- `frontend/src/pages/auth/CustomerLogin.test.jsx`

The following remain read-only consumer and regression references:
`frontend/src/pages/admin/AdminLogin.jsx`,
`frontend/src/pages/auth/StaffInvitationAccept.jsx`, `frontend/src/App.js`,
and the existing auth/customer route tests. AuthShell and ResetPasswordState
are now bounded change paths only for localized presentation and dedicated
recovery-state copy; their authentication, authorization, and route mechanics
remain unchanged.

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

**Owner disposition:** The MIG-03A split and this amended exact-file G4 scope
are approved through the owner Goal. Dashboard Customer, Order Detail, staff
login, and Operations remain outside the slice.

**G3 result:** **PASS WITH CONDITIONS**, amended for G4 exact-file review at
`origin/main` `2cb2c69e4d8b13232045857616d3c89f954a418b`. The scope is bounded and its
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

1. **Localization resolution:** G4 exact scope now includes AuthShell and
   ResetPasswordState so customer/recovery shell, system, validation, and
   dedicated state copy can use the existing stored ID/EN preference. No new
   private `/en` route, translation dependency, or i18n authority is added.
2. **Recovery-context resolution:** The bounded rule is intentional: the
   protected allowlist is preserved through Customer Login, while recovery
   returns to the explicit customer or staff login destination and does not
   promise an arbitrary protected target after an email handoff. Copy must make
   this rule clear; no open redirect or fabricated owned-resource context is
   allowed.
3. **Focused coverage resolution:** G4 adds `CustomerLogin.test.jsx` and
   extends the existing AuthShell and ResetPasswordState tests for ID/EN copy,
   safe audience separation, generic failure, loading/duplicate-submit, and
   keyboard/focus behavior as applicable.
4. **Authority boundary:** UI state, route visibility, or a successful browser
   response must not be treated as authentication, recovery, session,
   permission, or customer-projection authority. Backend/API verification and
   any source change remain outside this frontend G4 scope.

### G4 exact-file amendment result

**Result:** PASS for the amended exact-file scope, with implementation limited
to the paths below and the exclusions that follow. The amendment is a
documentation gate record; runtime source is still unchanged in this worktree.

| Exact path | Allowed change | Explicitly unchanged |
| --- | --- | --- |
| `CustomerLogin.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx` | Customer/recovery presentation, safe destination handling, state copy, and ID/EN content | API paths, identity provider, registration, session schema, role/permission, backend authority |
| `ResetPasswordState.jsx` | Localized success/error state copy and explicit login destinations | Route ownership, token/session behavior |
| `AuthShell.jsx` | Localized shell copy selected by stored language and existing audience | Customer/staff audience separation and authentication mechanics |
| Named auth tests and new `CustomerLogin.test.jsx` | Contract and focused state/keyboard coverage | No test-only implication of backend or provider readiness |

The owner Goal authorizes staging, commit, push, PR, review-thread handling,
and merge for this bounded slice. It does not authorize any path outside this
table.

### G4 exact-file gate

The owner Goal accepts this amended G4 scope. Implementation must name the
exact runtime/test paths below, preserve the four resolutions above, and pass
the proportional browser/accessibility/security checks before delivery. It
must continue to exclude Dashboard Customer, Order Detail, staff login,
Operations, registration, identity-provider activation, session-schema or
role/permission changes, backend authorization, customer-projection
migration, provider activation, new dependencies, deployment, readiness, and
go-live.

## G4 boundary and exclusions

G4 source implementation is authorized only for the amended exact paths above.
No identity provider, registration, session schema, role/permission mutation,
backend authorization, customer projection migration, dashboard/order-detail
implementation, staff-login flow change, provider, or new dependency is
included.

## Verification and rollback

After G4, run focused auth tests, full frontend regression, production build,
dependency and diff checks, keyboard/return-path browser checks, Axe, and the
Impeccable Product-register critique. Use a fresh isolated worktree from
`origin/main`; rollback only the approved pilot paths and preserve auth history.

**Self-review result:** Amended G4 exact-file review is bounded and recorded as
PASS at the current `origin/main` SHA. Only this documentation card is changed
in the scope-amendment worktree; runtime implementation follows in a separate
source worktree and PR.
