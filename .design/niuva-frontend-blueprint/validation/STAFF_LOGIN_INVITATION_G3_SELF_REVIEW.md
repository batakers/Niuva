# Staff Login and Invitation G3 Self-Review

**Status:** Candidate self-review — `PASS WITH HOLD`

**Task:** `MIG-03B-G3`

**Date:** 19 August 2026

**Baseline:** `origin/main`
`0bb9111b2052baa2aef0f52196e700519e61284c`

**Frontend axis:** `PRESENTATION_BOUNDED`

**Capability axis:** `DEFERRED`

**Legacy disposition:** `DEFERRED_WITH_OWNER_REASON`

This review is read-only. It does not authorize G4 source changes, identity or
session activation, provider selection, role migration, or production work.

## 1. Evidence reviewed

### Runtime and route ownership

- `frontend/src/pages/admin/AdminLogin.jsx`
- `frontend/src/pages/auth/StaffInvitationAccept.jsx`
- `frontend/src/components/auth/AuthShell.jsx`
- `frontend/src/components/auth/ProtectedRoute.jsx`
- `frontend/src/App.js`

### Tests and contracts

- `frontend/src/pages/auth/StaffInvitationAccept.test.jsx`
- `frontend/src/pages/auth/auth-surface.contract.test.js`
- `frontend/src/components/auth/AuthShell.test.jsx`
- `frontend/src/components/auth/ProtectedRoute.test.jsx`

No `frontend/src/pages/admin/AdminLogin.test.jsx` exists at this baseline. That
absence is recorded as a G4 coverage gap, not silently filled during G3.

### Authority and design artifacts

- `AUTH-01` Customer and Staff Login / Safe Return Wireframe
- `AUTH-03` Staff Invitation Acceptance Wireframe
- `DEC-AUTH-001`, `DEC-AUTH-003`, `DEC-AUTH-004`, `DEC-AUTH-005`,
  `DEC-AUTH-006`, `DEC-AUTH-007`, `DEC-AUTH-008`, `DEC-AUTH-009`, and
  `DEC-AUTH-012`
- `DEC-ACCESS-001`, `DEC-ACCESS-002`, and `DEC-OPS-002`
- `COMPONENT_STATUS.md` and the two-axis status amendment

## 2. Review findings

| Concern | Evidence | Result |
| --- | --- | --- |
| Staff/customer separation | `AdminLogin` and `CustomerLogin` use distinct `AuthShell` audiences and recovery destinations; `auth-surface.contract.test.js` asserts the boundary. | Pass |
| Staff safe return | `AdminLogin` rejects `/admin/login` and falls back to `/admin`, but the current `startsWith("/admin")` check does not prove the exact `/admin` or `/admin/` boundary (for example, `/administrator`). | Hold; G4 must add exact boundary evidence and focused tests |
| Permission boundary | `ProtectedRoute` checks authenticated identity and permission; route visibility is not treated as authorization. | Pass; backend remains authoritative |
| Admin session semantics | Login sends `remember_me` and uses the existing auth context; no browser token or provider logic is added by this review. | Pass with capability hold |
| Password policy | Invitation loads the backend-owned policy, fails closed when unavailable, and exposes a bounded retry. Existing test covers this path. | Pass |
| Invitation input validation | Missing token, mismatch, and policy failure preserve the form context and prevent submission. | Pass with test expansion recommended |
| Invitation authority | `POST /auth/staff-invitations/accept` remains the authority for validity, expiry, used state, identity, and persistence. | Hold: exact API/error contract is not part of this G3 |
| Invitation success | Current code navigates to `/admin/login` after the request but does not render a durable visible success message before navigation. | G4 defect/contract gap; do not claim success copy is complete |
| Localization | `AuthShell` has ID/EN staff copy, but invitation labels/messages and the Admin remember-me label contain hardcoded Indonesian. | G4 localization gap |
| Focus and status | Shared `AuthShell`, `FormField`, `Alert`, and `Button` provide the existing focus/state vocabulary; dedicated Admin Login coverage is absent. | G4 coverage gap |
| Reduced motion/responsive | Shared AuthShell and NDS primitives carry the existing responsive/focus/reduced-motion contract. | Pass as shared contract; browser evidence still required for G4 |
| Provider/role/session activation | No new provider, role, invitation, session, MFA, email, or permission behavior is authorized by this artifact. | Pass with explicit exclusion |

## 3. G3 result

**PASS WITH HOLD.** The family has a reviewable bounded presentation and a safe
exact-file candidate scope. It cannot be promoted to a completed G4 delivery
until the following are resolved in a separately approved source card:

1. an authoritative invitation API/error contract for missing, invalid,
   expired, used, dependency, and uncertain outcomes;
2. visible, truthful success/recovery treatment that does not claim a role or
   session before backend confirmation;
3. ID/EN invitation copy and the Admin remember-me label;
4. focused Admin Login and expanded invitation state tests; and
5. browser/accessibility/reduced-motion evidence for the exact staff routes.

The capability axis remains `DEFERRED`; no staff identity or session authority
is activated by this self-review.

## 4. Recommended G4 scope (not authorized here)

If the owner/domain authority approves G4 later, the smallest likely source
scope is:

- `frontend/src/pages/admin/AdminLogin.jsx`
- `frontend/src/pages/auth/StaffInvitationAccept.jsx`
- `frontend/src/components/auth/AuthShell.jsx` only if staff copy needs a
  shared presentation adjustment
- `frontend/src/components/auth/AuthShell.test.jsx` only if `AuthShell.jsx`
  changes
- `frontend/src/i18n.js` for the missing ID/EN staff invitation strings
- `frontend/src/pages/admin/AdminLogin.test.jsx` (new focused coverage)
- `frontend/src/pages/auth/StaffInvitationAccept.test.jsx`
- `frontend/src/pages/auth/auth-surface.contract.test.js`

`App.js`, `ProtectedRoute.jsx`, backend identity/session files, provider
configuration, role/permission files, secrets, and dependencies remain
unchanged unless a new exact-file decision explicitly expands the scope. This
list is identical to the candidate list in the G3 task card; any other file
requires separate authorization.

## 5. Stop conditions and handover

- Do not implement G4 from this self-review alone.
- Do not infer staff role, invitation validity, session issuance, or email
  delivery from a rendered component or a green local test.
- Do not add a new provider, dependency, route, support destination, or secret.
- Preserve this result as `PRESENTATION_BOUNDED + DEFERRED` until an approved
G4 slice and authoritative capability evidence justify a new pair.
