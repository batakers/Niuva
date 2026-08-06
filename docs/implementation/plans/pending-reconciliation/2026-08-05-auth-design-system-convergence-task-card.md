# Auth Design-System Convergence Task Card

Status: **Auth implementation evidence integrated through PR #137; original
slice branch was not separately published**

## Identity and baseline

- **Requester / Technical Owner:** Faiz
- **Driver:** Codex in an isolated Auth worktree
- **Reviewer / verifier:** Faiz with automated and browser evidence; independent
  design/security review is not claimed
- **Branch:** `frontend/auth-design-system-convergence`
- **Selected baseline:** `origin/main` at
  `5dd611297f8db5db03872d10b605536e2da462cf`
- **Date:** 5 August 2026, Asia/Jakarta
- **Commit/push/PR permitted?:** No. Local source, tests, screenshots, and
  handover evidence only.

## Objective

Make customer login, staff login, shared recovery, and staff invitation feel
like one deliberate Niuva system without conflating customer and internal
access. Remove pseudo-terminal typography and page-local control styling while
preserving backend authentication, recovery, password-policy, route, and safe
return contracts.

## Authority

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- `docs/decisions/access/DEC-AUTH-003-account-recovery-contract-and-compatibility.md`
- `docs/decisions/access/DEC-AUTH-004-password-policy-and-hash-migration.md`
- `docs/decisions/access/DEC-AUTH-005-admin-session-transport-and-remember-me.md`
- `docs/decisions/access/DEC-AUTH-008-admin-support-channel-deferral.md`
- `DESIGN.md`
- The active goal instruction to retain the current UI libraries and converge
  the frontend in isolated surface slices

## In scope

- Replace the simulated-console Auth shell with calm, audience-aware customer,
  staff, and neutral-recovery presentation.
- Introduce one reusable Auth card composition using current shared UI
  primitives.
- Make Customer and Admin forgot-password entry preserve their presentation
  context without treating it as authorization.
- Keep direct recovery routes generic and provide both known login destinations
  after a shared reset where the backend returns no role-safe destination.
- Normalize labels, controls, feedback, and show/hide behavior using current
  Button, Input, Alert, FormField, and SurfacePanel contracts.
- Add focused tests for audience separation, recovery navigation, preserved API
  payloads, and the absence of decorative monospace in migrated Auth files.
- Capture desktop/mobile responsive and accessibility evidence for public Auth
  routes that do not require credentials.

## Affected files

- `docs/implementation/plans/pending-reconciliation/2026-08-05-auth-design-system-convergence-task-card.md`
- `frontend/src/components/auth/AuthShell.jsx`
- `frontend/src/components/auth/AuthShell.test.jsx`
- `frontend/src/pages/auth/CustomerLogin.jsx`
- `frontend/src/pages/admin/AdminLogin.jsx`
- `frontend/src/pages/auth/ForgotPassword.jsx`
- `frontend/src/pages/auth/ForgotPassword.test.jsx`
- `frontend/src/pages/auth/ResetPassword.jsx`
- `frontend/src/pages/auth/ResetPassword.test.jsx`
- `frontend/src/pages/auth/ResetPasswordState.jsx`
- `frontend/src/pages/auth/ResetPasswordState.test.jsx`
- `frontend/src/pages/auth/StaffInvitationAccept.jsx`
- `frontend/src/pages/auth/StaffInvitationAccept.test.jsx`
- `frontend/src/pages/auth/auth-surface.contract.test.js`
- Auth-only browser evidence under `output/playwright/`

`docs/context/DOCUMENT_REGISTER.md` is intentionally unchanged in this worktree
to avoid a same-file conflict with the isolated foundation slice. Registration
belongs to a later explicitly authorized integration step.

## Explicit exclusions

- No backend handler, API path, payload, generic-response behavior, token,
  password-policy, rate-limit, session, cookie, CSRF, role, or permission change.
- No new registration, help/support destination, account-claim flow, identity
  provider, or product policy.
- No general Homepage, Retail, Customer Portal, or Admin Studio page changes
  outside Admin login.
- No dependency, token value, Tailwind configuration, route definition,
  database, migration, provider, credential, deployment, production-readiness,
  or go-live change.
- No commit, push, PR, merge, or modification of another worktree.

## Acceptance criteria

1. Customer login never renders default internal-administration or authorized-
   personnel copy.
2. Staff login and invitation remain clearly internal without pseudo-terminal
   decoration or an invented help destination.
3. Shared recovery remains generic and uses unchanged backend endpoints and
   payloads; URL reset tokens are still removed before form interaction.
4. Customer/Admin forgot-password links preserve presentation context, while a
   direct recovery visit remains neutral and safe.
5. Successful shared reset offers both `/login` and `/admin/login` because the
   current backend completion response does not provide an allowlisted role-safe
   destination.
6. Migrated Auth presentation contains no `font-mono`, `font-mono-tech`,
   `rounded-none`, or page-local primary-button class duplication.
7. Focused tests, full frontend regression evidence, responsive screenshots,
   keyboard/focus review, and automated accessibility checks are recorded.

## Rollback

Before publication, remove/revert only the Auth task paths in this worktree.
There is no data, dependency, backend, or environment rollback because the
slice changes frontend presentation and tests only.

## Implementation outcome

- The former pseudo-terminal shell is replaced by one restrained split layout
  and one reusable `AuthCard` composition built from existing shared UI.
- Customer, staff, and neutral recovery surfaces now use distinct, factual copy
  without using presentation context as an authorization decision.
- Customer and staff forgot-password links retain their originating audience;
  a direct recovery visit remains neutral.
- The check-email state can return to a cleared request form without retaining
  the submitted address or cooldown.
- Existing API paths, request payloads, password-policy behavior, token cleanup,
  role checks, and safe Admin return-path validation remain unchanged.
- An accessibility defect found during browser review in the staff-invitation
  form was corrected by binding its guidance through the shared `FormField`
  hint contract.

## Verification evidence

- Focused Auth tests: **6/6 suites, 34/34 tests passed**.
- Full frontend regression: **46/47 suites and 298/299 tests passed**. The only
  failure is the pre-existing indentation-sensitive string assertion at
  `src/pages/admin/cms-lifecycle.contract.test.js:83`; the failing source is
  outside this Auth scope.
- Production build: **passed**. Sitemap generation was skipped because
  `REACT_APP_PUBLIC_SITE_URL` is not configured.
- Bundle measurement, report-only: **571.23 kB total gzip**, **197.03 kB largest
  entry**, and **100.10 kB largest async asset**.
- Bundle gate: **not evaluated** because `BUNDLE_TOTAL_GZIP_BUDGET`,
  `BUNDLE_ENTRY_GZIP_BUDGET`, and `BUNDLE_ASYNC_GZIP_BUDGET` are not configured.
  This is not recorded as a size pass.
- Browser accessibility checks reported **zero WCAG A/AA violations** on
  customer login, Admin login, direct and customer recovery, both reset-result
  routes, and synthetic-token staff invitation after the label fix.
- Customer-login mobile keyboard order was verified as site return, email,
  password, submit, and forgot-password; the focused link displayed the
  semantic focus ring.
- Browser console review with synthetic bootstrap responses reported no errors.
- Responsive evidence is retained locally under `output/playwright/` as:
  `auth-customer-login-desktop.png`, `auth-customer-login-mobile.png`,
  `auth-admin-login-desktop.png`, and `auth-recovery-mobile.png`.
- `git diff --check` passed after the final source change.

## Handover

- Intentionally unchanged: backend, API contract, routing table, dependency
  manifests, tokens, Tailwind configuration, other frontend surfaces, and the
  Document Register.
- Remaining repository-wide issue: the unrelated CMS lifecycle contract test
  must be handled in its owning slice or cleanup pass; it does not invalidate
  the focused Auth result.
- External action still gated: no commit, push, PR, merge, deployment, or
  production action has been performed.

## Post-merge reconciliation — 5 August 2026

This task card predates Git publication. Its task-card record and integrated
Auth scope were included in PR #137, now merged into `origin/main` at
`18f51dee8a8ddf83e438de2f2f0e3acccbc5b8c1`. The original slice branch was not
published as a separate PR; the current publication and verification record is
the [integration task card](2026-08-05-frontend-design-system-integration-task-card.md).

The original local handover statements above remain historical evidence for the
pre-merge worktree. They do not describe the current merged-source state.
