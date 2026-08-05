# Frontend Design-System Integration Task Card

Status: **Local audit correction and bounded verification complete —
commit/push/PR gate pending explicit authorization**

## Identity and baseline

- **Requester / Technical Owner:** Faiz
- **Driver:** Codex in an isolated integration worktree
- **Reviewer / verifier:** Faiz with automated and synthetic browser evidence;
  independent design review is not claimed
- **Branch:** `frontend/design-system-integration-latest`
- **Selected baseline:** `origin/main` at
  `e2a79690a09a1002f8d0b98ab5ee608e99691735`
- **Date:** 5 August 2026, Asia/Jakarta
- **Commit/push/PR permitted?:** No authorization recorded for this
  integration result yet.

## Objective

Combine the locally completed Foundation, Auth, Customer Portal, Retail, Admin
Studio, and Public design-system slices on the latest remote baseline. Resolve
shared-file conflicts and stale contract assertions while preserving existing
routes, API contracts, authentication boundaries, Retail discovery-only state,
and the retained React/Tailwind/shadcn-style/Radix/CVA/Lucide/Sonner stack.

## Integrated scope

- Foundation documentation, component register, semantic contract tests, and
  `DESIGN.md` dependency direction.
- AuthShell, customer/admin login, password recovery, invitation, and related
  contract tests.
- Customer Portal layout, responsive navigation, dashboard, new order, order
  detail, StatusStepper, and related tests.
- Retail catalog/product presentation, product visual, discovery-only e2e
  assertion, and related tests.
- Admin Studio layout, dashboard, users/customers, orders, product editor,
  workbench mapping, AccountStatusBadge, lifecycle-owned status components,
  and tests.
- Public Homepage editorial convergence, shared brand opt-in variants, mobile
  navigation inert/dialog semantics, and public contract tests.

## Conflict and test-resolution record

- `StatusStepper.jsx`: retains only the legacy Customer Order step sequence and
  cancellation state. Shared `Badge` owns semantic presentation tones; Legacy
  Order, B2B, Portfolio, Retail Order, and Work Order own separate status maps.
- `Navbar.jsx`: remains the menu/focus/orchestration shell while
  `PublicNavigation.jsx` and `OperationalNavigation.jsx` own separate
  information architecture and actions. The mobile panel keeps its open-only
  dialog role and closed `inert` boundary.
- `i18n.js`: retained both Customer Portal and Admin Studio translation keys.
- `cms-lifecycle.contract.test.js`: replaced whitespace-sensitive rollback
  matching with an argument-order regex; runtime/API behavior was unchanged.
- `admin-studio-convergence.contract.test.js`: asserts shared semantic tones,
  lifecycle ownership, adopted Select use, and ordinary typography roles.
- `Navbar.test.jsx`: scoped desktop and mobile queries to their responsive
  containers because both DOM copies intentionally exist for responsive CSS.
- `e2e/retail-discovery.spec.js`: asserted the current discovery-only status
  alert instead of a disabled button; checkout remains unavailable.

## Historical pre-correction verification evidence

The results in this section were executed before the read-only integration
audit. They are retained as provenance and must not be quoted as current
post-correction evidence.

- Full Jest: **60/60 suites passed, 348/348 tests passed**.
- CMS regression contract: **10/10 tests passed** before the full run.
- Production build: **passed**. Postbuild only reported that
  `REACT_APP_PUBLIC_SITE_URL` is not configured, so sitemap generation was
  skipped.
- Bundle report-only measurement: **583.18 kB total gzip**, **202.93 kB entry
  gzip**, **100.16 kB largest async gzip**. No budget decision was applied.
- Bundle measurement contract: **4/4 Node tests passed**.
- Integrated synthetic browser audit: **3/3 integration tests passed** across
  Home desktop/mobile semantics, public/auth routes, and protected
  customer/admin redirect gates; the existing Retail discovery e2e also passed
  **2/2**, for **5/5 tests** in the final combined run. All checked routes had
  no horizontal overflow, zero axe WCAG A/AA violations, and no unexpected
  console/page/network errors.
- Existing Retail discovery e2e: **2/2 tests passed**.
- Integrated Home screenshot: `frontend/output/playwright/integrated-home-desktop.png`.
- Authenticated role-matrix/admin browser suites were not run because they
  require real role credentials; no authenticated production claim is made.

## Audit correction record

The subsequent read-only audit returned `REQUIRES CORRECTION`. Faiz then
authorized the exact correction scope recorded in
`2026-08-05-frontend-design-system-audit-correction-task-card.md` for:

- `DS-ARCH-001`: lifecycle-owned status presentation;
- `DS-TOKEN-002`: semantic inverse/color/radius mapping;
- `DS-DOC-003`: selected-baseline and evidence reconciliation;
- `DS-BOUNDARY-004`: separate Public and operational Navbar composition;
- `DS-CONTRACT-005`: adopted Select and appropriate validation-copy contract;
- `DS-TYPE-006`: ordinary email and metric typography; and
- `DS-TEST-007`: recurrence-prevention contracts.

Focused increment evidence:

- lifecycle/status increment: **7/7 suites, 58/58 tests passed**;
- token/component/Navbar increment: **7/7 suites, 33/33 tests passed**.

## Current post-correction verification evidence

The following results were executed against the local correction diff at the
selected baseline. They are bounded development evidence, not merged-source,
production-readiness, or go-live evidence.

- Full Jest: **61/61 suites passed, 362/362 tests passed**.
- Production build: **passed**. Node reported the existing `DEP0176` warning,
  and postbuild skipped sitemap generation because
  `REACT_APP_PUBLIC_SITE_URL` was not configured.
- Bundle report-only measurement: **581.12 kB total gzip**, **203.06 kB entry
  gzip**, and **100.16 kB largest async gzip**. No budget decision was applied.
- Bundle measurement contract: **4/4 Node tests passed**.
- Synthetic browser checks: **20/20 tests passed** across mobile, tablet,
  laptop, and desktop:
  - Homepage Public navigation, keyboard focus return, overflow, stable
    reduced-motion rendering, and axe WCAG A/AA: **4/4**;
  - Retail populated and error/empty discovery states, discovery-only boundary,
    overflow, and axe WCAG A/AA: **8/8**;
  - unauthenticated Admin sign-in axe WCAG A/AA: **4/4**; and
  - unauthenticated protected-route redirect to sign-in: **4/4**.
- Static re-audit found no implementation import of the former unbounded
  `StatusBadge`, no native Select bypass in Product Editor, no arbitrary radius
  or scaled Tailwind palette in active JS/JSX, no conflict markers, and no
  correction diff in backend, manifests, or lockfiles.
- `git diff --check` passed before final documentation reconciliation and must
  be repeated in the pre-commit review.

The first Retail browser attempt omitted the synthetic backend URL, so the app
correctly rendered its disconnected-catalog state and all eight assertions
failed before API mocks were exercised. The configured synthetic rerun passed
8/8; the first result is environment diagnosis, not source evidence. A first
Homepage axe run sampled approved opacity entrance motion mid-animation and
reported transient contrast failures. The durable test now scans the stable
`prefers-reduced-motion` state and passes 4/4.

Authenticated Admin role-matrix and protected Admin-surface axe suites remain
unexecuted because no real role credentials were provided. Independent visual
design acceptance and human screen-reader review are also not claimed.

## Explicit exclusions and publication gate

- No backend, API payload, schema, database, migration, provider, credential,
  deployment, production-readiness, or go-live change.
- No commit, push, PR, merge, or branch deletion performed.
- Generated build/test output remains local and is not a publication artifact.
- Final path, sensitive-value, and boundary scans found no correction-scope
  violation. Faiz must still explicitly authorize commit, then separately
  authorize push and PR as required by the project gates.

## Rollback

Before publication, revert or remove only the integration worktree changes.
The source slice worktrees remain untouched and provide the source handoff
points for any selective rollback.
