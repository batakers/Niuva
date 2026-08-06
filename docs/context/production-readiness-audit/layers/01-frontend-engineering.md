# Layer 01 — Frontend Engineering

Status: Context Only — Audit Evidence and Progress Tracker — Not Implementation Authority

## 1. Audit state

| Field | Value |
| --- | --- |
| Audit status | `requires_revalidation` for current source; historical repository/static audit remains complete |
| Audit completion | 100% for the 2026-07-28 scored snapshot; current design-system overlay is bounded |
| Readiness score | 55 / 100 (historical snapshot; not recomputed) |
| Confidence | 85 / 100 (historical snapshot; not recomputed) |
| Findings | 0 P0, 4 P1, 4 P2, 2 P3 (historical snapshot; current overlay below) |
| Environment state | `FE-ENV-001` remains `environment_blocked` for release and real-role evidence; synthetic browser evidence is recorded below |
| Last updated | 2026-08-05 (UTC+07:00) |

“Complete” means that every checklist item was examined with current evidence.
It does not mean production-ready, and it does not authorize remediation or
go-live. The score reflects basic functionality with material production risk.

## 2. Authority and boundaries

The audit read `AGENTS.md`, `docs/NIUVA_MASTER_SPEC.md`,
`docs/context/DOCUMENT_REGISTER.md`, `docs/decisions/DECISION_REGISTER.md`,
`AUDIT_METHODOLOGY.md`, `AUDIT_BASELINE.md`, `AUDIT_PROGRESS.md`, existing
frontend history/audits, `DESIGN.md`, the applicable DEC-UX/DEC-OPS/
DEC-ACCESS/DEC-AUTH decisions, and `doc/PRODUCTION_DEPLOYMENT.md`.

This is a frontend engineering audit only. Backend files were read only to
confirm route, authentication, recovery, content, order, and notification
contracts. Backend authorization, data integrity, provider choices, and
production operations remain owned by their layers.

## 3. Baseline and HEAD delta

The following branch, HEAD, and environment bullets describe the historical
2026-07-28 scored snapshot. The current bounded post-merge state is recorded in
the overlay immediately below and does not replace the historical evidence.

- Branch: `feat/marketing-redesign-dec-ux-002`
- HEAD: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
- Baseline SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
- Delta: none; HEAD exactly matches the audit baseline, so no source revalidation
  was required for a post-baseline commit.
- Local `origin/main`: `fd299cd0ff03f056f91a911e7fec56ea3f0092de`
  (HEAD is 1 commit ahead and 3 behind); remote freshness was not verified.
- Pre-existing worktree state was preserved: one unrelated tracked Markdown
  change, `.coverage`, and existing `docs/context/production-readiness-audit/`
  and `frontend/output/` artifacts. No source, dependency, or lockfile was
  changed by this audit.

### Current bounded post-merge overlay

- Current selected source: `origin/main` at
  `18f51dee8a8ddf83e438de2f2f0e3acccbc5b8c1`, the merge commit for PR #137.
- PR #137's corrective head is
  `c1571ba2a9137fa15b8c82db6658c23d8c2950fa`; the corrective commit is an
  ancestor of the current `origin/main` merge.
- The merged PR scope is 86 files from the pre-merge integration baseline:
  0 backend files, 0 package manifest/lockfile files, and 0
  `frontend/output` files.
- This overlay revalidates the merged Frontend Design-System Integration and
  Audit Correction scope only. It does not recompute the full Layer 01 score
  or inherit the old score/finding status as current.

## 4. Frontend inventory

### Application and route boundaries

`frontend/src/App.js` uses `React.lazy` plus `Suspense` for route modules,
an application error boundary, a public route group, customer routes
(`/dashboard`, `/order`, `/orders/:id`), recovery routes, and Admin Studio
routes. The Brand Lab routes are feature-flagged. A wildcard `NotFound` route
exists. Home is eager-loaded; other route modules are lazy-loaded.

Admin permission mapping is centralized in `frontend/src/lib/permissions.js`
and consumed by `ProtectedRoute`. Mapped Admin routes render `ForbiddenPage`
when the permission is absent. `/admin/notifications` is currently passed
through `protectedPage` without a corresponding `ADMIN_ROUTE_PERMISSIONS` key,
so it receives authentication protection but no explicit permission check.
Customer routes use the same authentication gate without a distinct customer
surface guard. UI hiding is not treated as backend authorization.

### Components and design system

`DESIGN.md` and `frontend/src/index.css` provide semantic tokens, Poppins/Inter
typography boundaries, reduced-motion handling, and shared components such as
`SurfacePanel`, `SurfacePanelHeader`, `TechnicalLabel`, `Button`, `FormField`,
`EmptyState`, `ErrorState`, and `OperationalState`. Static import counts show
these controls are reused across the application. Detailed visual and
accessibility judgments remain Layer 02.

### State, API, forms, and validation

`frontend/src/lib/api.js` centralizes Axios setup and also contains direct
`fetch` helpers. Auth state is held in `AuthContext`. Pages use local loading,
error, and form state with repeated per-page lifecycle code. Native form
constraints and ad-hoc JavaScript validation are common. `zod` is declared but
there is no runtime schema import, `safeParse`, or equivalent response
validation in `frontend/src`.

The current client stores a bearer token in `localStorage`, attaches it to
Axios requests, and logout only clears local state. Recovery pages read the
reset token from the query string and post it directly. The approved
DEC-AUTH-005 and DEC-AUTH-003 contracts therefore remain implementation gaps.

### Failure and recovery behavior

Shared state components exist, and many Admin pages use explicit
loading/empty/error/retry states. Critical customer flows are inconsistent:
`ClientDashboard.jsx` and `NewOrder.jsx` contain empty catches, and public
portfolio/content loads do not consistently expose retry or offline recovery.
No frontend offline mode, `navigator.onLine` handling, bounded request timeout,
request cancellation, or safe retry policy was found.

### Build, release, and dependency surface

The package declares Yarn 1.22.22 while the repository also has
`package-lock.json` and the deployment runbook uses `npm ci`. `npm ci
--dry-run --ignore-scripts` completed with an existing ESLint peer warning.
CRACO production compilation emitted hashed chunks and route-level splitting,
but the postbuild release-file gate rejected the local public URL and did not
produce a sitemap. Source maps were disabled for this run and no `.map` files
were emitted. No bundle budget/regression gate was found.

Static dependency and import scans identified probable unused runtime
dependencies (`date-fns`, `dayjs`, `framer-motion`, `lodash`, `zod`) and
probable dead components/exports (`responsive-table`, `stat-card`, and several
`CompanyProfileBlocks` exports). These are heuristic signals requiring owner
confirmation, not deletion instructions. Several page modules are large
monoliths and direct API calls appear in 20 page/component files.

## 5. Verification log

| Check | Result | Evidence and limitation |
| --- | --- | --- |
| `npm.cmd test -- --watchAll=false --runInBand` | Pass | 27 suites, 202 tests passed. This is deterministic unit/integration evidence, not browser coverage. |
| `npm.cmd ci --dry-run --ignore-scripts` | Completed with warning | Lockfile/install graph resolves; npm reports an existing `@typescript-eslint/utils` peer mismatch against ESLint 9. |
| `GENERATE_SOURCEMAP=false; npm.cmd run build` | `environment_blocked` | CRACO compilation succeeded; `postbuild` failed because `REACT_APP_PUBLIC_SITE_URL` was local/unconfirmed. Do not claim a release build passed. |
| Build artifact inspection | Partial | 86 files, 47 JS files, 1 CSS file, 0 maps; hashed chunks present, but `sitemap.xml` absent because postbuild stopped. |
| `npm.cmd exec -- playwright test --list` | Pass (discovery only) | 140 tests in 3 files across four viewport projects were discovered. No journey executed. |
| Playwright journey execution | `environment_blocked` | No server/base URL/API or role credentials were configured; Firefox/WebKit are not installed. |
| Frontend lint | Not available | No frontend lint script or ESLint configuration was found. |
| Static route/API/dependency scans | Complete | Current source at baseline SHA; commands and paths are recorded in the findings below. |

### 5.1 Current bounded post-merge design-system verification

| Check | Result | Evidence and limitation |
| --- | --- | --- |
| Full frontend Jest | Pass | 62 suites and 368 tests passed with `--watchAll=false --runInBand`. |
| Production build | Pass with environment note | `npm.cmd run build` compiled successfully; `REACT_APP_PUBLIC_SITE_URL` was not configured, so sitemap generation was skipped. |
| Bundle checks | Pass/report-only | `test:bundle` passed 4/4. Measurement reported 581.26 kB total gzip, 203.10 kB largest entrypoint, and 100.14 kB largest async asset; no budget decision was applied. |
| Browser design-system integration | Pass | Home suite passed 4/4 viewports. Retail discovery passed 8/8 viewport/scenario checks when the synthetic `REACT_APP_BACKEND_URL` was set and API routes were mocked. |
| Browser environment boundary | Not a production pass | No real credentials, live API, provider, deployment, role-matrix journey, human screen-reader session, or production origin was used. The initial Retail run without the synthetic backend variable only exercised the intentional disconnected-catalog state. |
| Dependency install audit | Baseline risk recorded | `npm ci --ignore-scripts` resolved the existing graph and reported 36 advisories: 12 low, 6 moderate, and 18 high. PR #137 changed no manifest or lockfile. |

These checks are current bounded evidence for the merged design-system scope,
not a production-readiness or go-live verdict.

## 6. Coverage checklist

| Checklist area | Status | Evidence |
| --- | --- | --- |
| Package-manager/install contract | Examined | `package.json`, lockfile, deployment runbook, npm dry run |
| Route inventory/protection/surface boundaries | Examined | `App.js`, `ProtectedRoute.jsx`, `permissions.js` |
| API client/auth/error/timeout/retry | Examined | `lib/api.js`, `AuthContext.jsx`, `content.js` |
| State/stale/concurrent handling | Examined | Page-level fetch/form patterns and shared state components |
| Loading/empty/error/conflict/retry/permission/expiry/offline | Examined | Critical customer/Admin pages; offline control absent |
| Customer projection contract | Bounded cross-check | Frontend consumers and relevant backend response contracts; full backend finding deferred |
| Runtime validation/forms | Examined | No Zod/runtime response validation; native/ad-hoc form validation |
| Error boundary | Examined | `AppErrorBoundary` in `App.js` |
| Tests | Executed | 27 suites / 202 tests pass |
| Fresh production build/release artifacts | Examined, blocked | Compile succeeded; postbuild origin gate failed; no sitemap |
| Direct navigation/refresh/canonical/sitemap/cache | Examined, dynamic part blocked | Routes and release script inspected; browser/server not available |
| Bundle/dead code/dependency/performance | Examined | Chunk output, import scans, package manifest, large-module scan |
| Cross-check Layers 03/05/06 | Examined with bounded contract reads | Downstream layer conclusions are not duplicated here |

## 7. Finding register

### FE-001 — API client has no bounded timeout, retry, cancellation, or offline policy

| Required field | Value |
| --- | --- |
| Severity | `P1` |
| Status | `open` |
| Confidence | 96% |
| Category | API client / reliability |
| Expected behavior | Requests have bounded timeouts, normalized network/offline errors, cancellation, and safe idempotent retry semantics. |
| Actual behavior | Axios has no timeout; direct `fetchFile`/`downloadCsv` calls have no timeout, retry, or cancellation; no offline policy was found. `content.js` explicitly documents no cache/retry. |
| Evidence | `frontend/src/lib/api.js:3-8,22-72`; `frontend/src/lib/content.js:97-117` |
| Reproduction or verification command | `rg -n -e "axios.create" -e "fetch\\(" -e "timeout" -e "retry" -e "AbortController" -e "navigator.onLine" frontend/src` |
| Impact | Network stalls can leave critical journeys hanging or silently incomplete, with no bounded recovery path. |
| Root cause or probable cause | Client transport responsibilities are split between Axios and raw `fetch` without a shared request policy. |
| Recommendation | Define an approved transport policy with bounded timeout, cancellation, normalized error types, and retries only for safe/idempotent operations. |
| Acceptance criteria | Critical API calls terminate within a documented bound; offline and timeout states are visible; retry is safe, bounded, and covered by tests. |
| Dependencies | API contract owners and test environment |
| Human decision required | Approve retry/idempotency and timeout policy before implementation. |
| First observed SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Last verified SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Resolution evidence | N/A — open |

### FE-002 — Admin auth token/session persistence does not implement the approved session target

| Required field | Value |
| --- | --- |
| Severity | `P1` |
| Status | `decision_resolved_implementation_open` |
| Confidence | 99% |
| Category | Authentication/session consumer |
| Expected behavior | DEC-AUTH-005 target: secure HttpOnly same-origin `__Host-` cookies, server revocation/logout, CSRF/origin controls, and no web-storage bearer token. |
| Actual behavior | `niuva_token` is stored/read/cleared in `localStorage`, attached as `Authorization: Bearer`, and logout only clears local state. |
| Evidence | `frontend/src/lib/api.js:8-26`; `frontend/src/context/AuthContext.jsx:11-49`; DEC-AUTH-005 |
| Reproduction or verification command | `rg -n -e "localStorage" -e "sessionStorage" -e "Authorization.*Bearer" -e "logout" frontend/src` |
| Impact | Persistent XSS-readable credentials and no server-side revocation semantics conflict with the approved Admin session boundary. |
| Root cause or probable cause | Legacy bearer-token client remains the active implementation while the approved cookie/session direction is not implemented. |
| Recommendation | Plan a separately authorized bounded auth/session migration; do not infer rollout authorization from this audit. |
| Acceptance criteria | No Admin credential in web storage; approved cookie/CSRF/logout behavior is exercised by auth tests and controlled browser journeys. |
| Dependencies | Auth backend contract, security review, migration/rollback runbook, authorized test accounts |
| Human decision required | Implementation and migration approval under DEC-AUTH-005. |
| First observed SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Last verified SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Resolution evidence | N/A — open |

### FE-003 — Recovery frontend does not implement the approved route and token contract

| Required field | Value |
| --- | --- |
| Severity | `P1` |
| Status | `decision_resolved_implementation_open` |
| Confidence | 99% |
| Category | Authentication recovery / routing |
| Expected behavior | DEC-AUTH-003 routes include check-email, success, and error states; the reset token is captured once, kept ephemeral, removed from visible URL/history, and validated through the approved contract. |
| Actual behavior | Only `/forgot-password` and `/reset-password` are routed; `ResetPassword` reads the raw query token and posts it directly; no URL cleanup or validation step exists; `ForgotPassword` only toggles local sent state. |
| Evidence | `frontend/src/App.js:145-147`; `frontend/src/pages/auth/ResetPassword.jsx:9-31,87-136`; `frontend/src/pages/auth/ForgotPassword.jsx:13-25`; DEC-AUTH-003 |
| Reproduction or verification command | `rg -n -e "forgot-password/check-email" -e "reset-password/success" -e "reset-password/error" -e "useSearchParams" -e "history" -e "replace" frontend/src` |
| Impact | Reset tokens can remain in URL/history and the UI cannot represent the approved recovery lifecycle or failure states. |
| Root cause or probable cause | Legacy single-page recovery flow was not reconciled with the approved shared recovery contract. |
| Recommendation | Specify and authorize the bounded recovery-route/token-handling migration. |
| Acceptance criteria | All approved routes exist; token is captured once and removed from URL/history; success/error/expired/invalid states and tests are present. |
| Dependencies | Backend recovery contract, auth runbook, browser journey environment |
| Human decision required | Confirm implementation scope and rollout gate for DEC-AUTH-003. |
| First observed SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Last verified SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Resolution evidence | N/A — open |

### FE-004 — Admin notification route lacks explicit permission mapping and surface mode separation

| Required field | Value |
| --- | --- |
| Severity | `P2` |
| Status | `open` |
| Confidence | 96% |
| Category | Routing / authorization consumer |
| Expected behavior | Every Admin route has an explicit permission mapping; customer routes and Admin Studio have distinct surface guards and test matrices. |
| Actual behavior | `/admin/notifications` is not in `ADMIN_ROUTE_PERMISSIONS`, so `ProtectedRoute` checks only authentication. `/dashboard` and `/order` also use only the generic auth gate. |
| Evidence | `frontend/src/App.js:120,142-173`; `frontend/src/lib/permissions.js:1-19,79`; `frontend/src/components/auth/ProtectedRoute.jsx:7-27` |
| Reproduction or verification command | `rg -n -e "admin/notifications" -e "ADMIN_ROUTE_PERMISSIONS" -e "permission &&" -e "ProtectedRoute" frontend/src` |
| Impact | An authenticated customer token can mount an Admin notification shell, and route-boundary assumptions are not explicit in the frontend. |
| Root cause or probable cause | Route protection is permission-aware only when a mapping entry is present; surface classification is implicit. |
| Recommendation | Add a complete route/surface matrix, explicit permission entries, and negative tests for customer-to-Admin navigation. |
| Acceptance criteria | All `/admin/*` routes fail closed without the mapped permission; customer and Admin journeys are separately tested. |
| Dependencies | Approved role matrix and backend authorization (owned elsewhere) |
| Human decision required | None for the audit; implementation must follow approved access decisions. |
| First observed SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Last verified SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Resolution evidence | N/A — open |

### FE-005 — No runtime API response validation despite a declared Zod dependency

| Required field | Value |
| --- | --- |
| Severity | `P2` |
| Status | `open` |
| Confidence | 92% |
| Category | API contract / runtime safety |
| Expected behavior | Auth, content, order, and Admin responses are validated at the client boundary and produce a controlled invalid-data state. |
| Actual behavior | `zod` is declared but no frontend `zod` import, `safeParse`, or equivalent runtime response validation was found; pages access `response.data` fields directly. |
| Evidence | `frontend/package.json:20-33`; `frontend/src/lib/content.js:97-117`; `frontend/src/pages/marketing/ProjectsPage.jsx:33`; `frontend/src/pages/admin/Users.jsx:73` |
| Reproduction or verification command | `rg -n -e "from [\"']zod" -e "safeParse" -e "response\\.data" -e "\\.data\\." frontend/src` |
| Impact | Contract drift can produce malformed rendering, uncaught exceptions, or incorrect empty states. |
| Root cause or probable cause | API type/shape assumptions are distributed across page code rather than enforced at a boundary. |
| Recommendation | Introduce narrowly scoped schemas for critical response contracts and explicit invalid-data telemetry/state. |
| Acceptance criteria | Critical response schemas reject malformed data in tests and render a controlled recovery state. |
| Dependencies | Stable API schemas and contract-test fixtures |
| Human decision required | Decide which contracts are critical enough for runtime validation. |
| First observed SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Last verified SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Resolution evidence | N/A — open |

### FE-006 — Critical customer data loads silently swallow errors

| Required field | Value |
| --- | --- |
| Severity | `P2` |
| Status | `open` |
| Confidence | 99% |
| Category | Loading/error/recovery state |
| Expected behavior | Customer data failures show an explicit error/offline state, preserve actionable retry, and distinguish empty from failed. |
| Actual behavior | `ClientDashboard.jsx` and `NewOrder.jsx` use empty catches; failed loads only stop loading or leave missing data. Public portfolio/content failures are also inconsistent. |
| Evidence | `frontend/src/pages/operational/ClientDashboard.jsx:23`; `frontend/src/pages/operational/NewOrder.jsx:23`; `frontend/src/pages/marketing/ProjectsPage.jsx` |
| Reproduction or verification command | `rg -n -e "\\.catch\\(\\(\\) => \\{\\}\\)" -e "catch \\(.*\\{\\s*\\}" frontend/src/pages frontend/src/lib` |
| Impact | Users can interpret a failed dashboard/material load as an empty account or cannot recover without a full refresh. |
| Root cause or probable cause | Page-local fetch effects are not consistently wired to shared operational/error state. |
| Recommendation | Replace silent catches with shared error/offline/retry states and tests for failure and recovery. |
| Acceptance criteria | Critical customer loads have loading, empty, error, retry, unauthorized/expired, and offline cases covered by deterministic tests. |
| Dependencies | FE-001 transport policy and approved UX copy/state |
| Human decision required | None beyond normal bounded implementation approval. |
| First observed SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Last verified SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Resolution evidence | N/A — open |

### FE-007 — Probable dead runtime components and unused dependencies

| Required field | Value |
| --- | --- |
| Severity | `P3` |
| Status | `open` |
| Confidence | 90% |
| Category | Maintainability / dependency hygiene |
| Expected behavior | Runtime dependency and component graphs are intentional, documented, and free of unneeded update/security surface. |
| Actual behavior | Static scans found probable unused `date-fns`, `dayjs`, `framer-motion`, `lodash`, and `zod`, plus components/exports with no runtime imports. |
| Evidence | `frontend/package.json:20-33`; `frontend/src/components/ui/responsive-table.jsx`; `frontend/src/components/ui/stat-card.jsx`; `frontend/src/components/marketing/CompanyProfileBlocks.jsx` |
| Reproduction or verification command | `rg -n -e "date-fns" -e "dayjs" -e "framer-motion" -e "lodash" -e "zod" frontend/src; rg -n -e "responsive-table" -e "stat-card" -e "SectionShell" -e "GoalItem" -e "ProjectCard" -e "ProjectGrid" frontend/src` |
| Impact | Larger maintenance/update surface and less reliable bundle/dependency reasoning. |
| Root cause or probable cause | Historical components/dependencies remain after feature changes; static scan cannot prove semantic deadness. |
| Recommendation | Confirm usage with owners, then remove or document only in separately approved cleanup work. |
| Acceptance criteria | Dependency/import graph has an owner-reviewed report with justified exceptions and no unreferenced runtime package. |
| Dependencies | Owner confirmation and dependency policy |
| Human decision required | Approve any dependency or source deletion separately. |
| First observed SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Last verified SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Resolution evidence | N/A — open |

### FE-008 — No bundle budget or regression gate

| Required field | Value |
| --- | --- |
| Severity | `P2` |
| Status | `open` |
| Confidence | 93% |
| Category | Build/performance governance |
| Expected behavior | Production artifacts have an approved size budget and CI/regression check for initial and shared chunks. |
| Actual behavior | Lazy route chunks exist, but the run emitted a 198.13 kB gzip main bundle and 102.27 kB largest shared chunk with no budget/reporting gate in scripts, config, or CI. |
| Evidence | `frontend/src/App.js:11-79`; `frontend/package.json:scripts`; build output from `npm.cmd run build` |
| Reproduction or verification command | `rg -n -e "budget" -e "bundle" -e "size-limit" -e "webpack-bundle-analyzer" frontend package.json .github; npm build artifact size inspection` |
| Impact | Future dependency or shared-module growth can regress first load without detection. |
| Root cause or probable cause | Code splitting is implemented, but performance limits are not encoded as an acceptance gate. |
| Recommendation | Define an approved budget/report and enforce it in CI after owner agreement on thresholds. |
| Acceptance criteria | CI reports main/shared/route chunk sizes, fails or warns on documented thresholds, and preserves lazy route loading. |
| Dependencies | Product performance targets and CI ownership |
| Human decision required | Approve thresholds and enforcement mode. |
| First observed SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Last verified SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Resolution evidence | N/A — open |

### FE-009 — Repeated page fetch/state lifecycle and large modules weaken maintainability

| Required field | Value |
| --- | --- |
| Severity | `P3` |
| Status | `open` |
| Confidence | 88% |
| Category | Component architecture / maintainability |
| Expected behavior | Shared query/error/loading abstractions and cohesive modules keep behavior consistent and testable. |
| Actual behavior | Direct API calls appear in 20 page/component files with repeated loading/error/finally patterns; large modules include `i18n.js` (1370 lines), `Catalog.jsx` (868), and `Materials.jsx` (857). |
| Evidence | Static API-call scan under `frontend/src`; file-size scan; representative Admin and customer pages |
| Reproduction or verification command | `@(rg -l -e "api\\.(get\\(" -e "api\\.(post\\(" -e "api\\.(put\\(" -e "api\\.(patch\\(" -e "api\\.(delete\\(" -e "fetch\\(" frontend/src).Count; @(rg --files frontend/src).Count` |
| Impact | Inconsistent state behavior, higher review cost, and harder isolated testing. |
| Root cause or probable cause | Feature growth accumulated page-local orchestration without a shared data-fetching/query boundary. |
| Recommendation | Plan a bounded maintainability refactor only after route/API behavior is covered by tests; do not redesign in this audit. |
| Acceptance criteria | Repeated critical patterns use a documented abstraction, modules have cohesive boundaries, and behavior remains covered by tests. |
| Dependencies | FE-001, FE-005, and feature-owner review |
| Human decision required | Scope and sequencing approval for any refactor. |
| First observed SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Last verified SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Resolution evidence | N/A — open |

### FE-ENV-001 — Release and browser journey verification is environment-blocked

| Required field | Value |
| --- | --- |
| Severity | `P1` |
| Status | `environment_blocked` |
| Confidence | 100% |
| Category | Build/release/browser verification |
| Expected behavior | A confirmed public origin produces release files, and representative direct-navigation/auth/customer/Admin journeys run in a controlled browser/API environment. |
| Actual behavior | CRACO compilation succeeded but `postbuild` rejected the local public URL; `sitemap.xml` was not produced. Playwright discovered 140 tests but no journey ran because server/base URL/API/role credentials were absent; Firefox/WebKit are unavailable. |
| Evidence | `frontend/scripts/generate-release-files.js:12-34`; `frontend/playwright.config.js`; `frontend/e2e/fixtures.js`; build output and artifact inspection |
| Reproduction or verification command | `GENERATE_SOURCEMAP=false; npm.cmd run build`; `npm.cmd exec -- playwright test --list` |
| Impact | Release artifact integrity, direct route refresh, role separation, and browser compatibility cannot be claimed as passed. |
| Root cause or probable cause | Local environment lacks the authorized production origin and controlled API/test-account topology. |
| Recommendation | Provision a safe staging/release environment with non-secret origin configuration, server/API endpoints, role fixtures, and required browser engines, then rerun the blocked checks. |
| Acceptance criteria | Build completes postbuild with confirmed origin and sitemap/robots; role journeys execute; direct navigation/refresh and supported-browser results are recorded. |
| Dependencies | Environment owner, authorized E2E accounts, browser installation, API topology |
| Human decision required | Authorize the controlled environment and test identities; no production activation is implied. |
| First observed SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Last verified SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Resolution evidence | N/A — blocked |

### PR #137 CodeRabbit reconciliation overlay

The following local labels are bounded review-evidence labels, not new
canonical production-readiness finding IDs. Each item was reconciled against
the merged source, tests, or task-card evidence at `origin/main` `18f51de`.

- **PR137-CR-01 — Navbar backdrop:** the mobile-navigation backdrop and close
  behavior are present in `Navbar.jsx`, `Navbar.test.jsx`, and its contract
  test. Status: `resolved_in_merged_scope`.
- **PR137-CR-02 — Partial Admin queue coverage:** incomplete queue metrics are
  represented as unknown rather than fabricated zeroes, with focused tests.
  Status: `resolved_in_merged_scope`.
- **PR137-CR-03 — Forgot-password resend error:** the sent state retains a
  visible, recoverable resend error with focused coverage. Status:
  `resolved_in_merged_scope`.
- **PR137-CR-04 — OrderDetail stale route ID:** success, error, and cleanup
  paths ignore responses for an older order ID, with a regression test. Status:
  `resolved_in_merged_scope`.
- **PR137-CR-05 — RetailProductPage stale slug:** success, error, and cleanup
  paths ignore responses for an older product slug, with a regression test.
  Status: `resolved_in_merged_scope`.
- **PR137-CR-06 — Integration task-card acceptance criteria:** the merged
  integration task card contains an explicit acceptance-criteria section.
  Status: `resolved_in_merged_scope`.
- **PR137-CR-07 — Retail E2E affected-file scope:**
  `frontend/e2e/retail-discovery.spec.js` is recorded in the integration task
  card's affected files. Status: `resolved_in_merged_scope`.
- **PR137-CR-08 — Admin absent-stat handling:** absent required Admin metrics
  remain unknown while explicit zero values are preserved, with focused
  regression coverage. Status: `resolved_in_merged_scope`.

This overlay does not close `FE-001` through `FE-009` or `FE-ENV-001`. Those
findings cover broader transport, authentication, validation, maintainability,
release, and production-environment questions and require their own current
evidence and gates.

## 8. Positive controls

- Route-level lazy loading, `Suspense`, a wildcard not-found route, and
  `AppErrorBoundary` are present.
- Mapped Admin routes use explicit permissions and a forbidden state.
- Shared semantic tokens and state components are reused; reduced-motion CSS
  is present.
- Jest completed with 27 suites and 202 passing tests.
- Production compilation emitted hashed assets and route chunks; source maps
  were absent when explicitly disabled.
- No runtime mock-data import was found in the scanned frontend source.
- The PR #137 merged scope adds current design-system contracts, stale-response
  guards, failure-state coverage, and bounded Home/Retail browser evidence;
  these controls remain limited to the stated synthetic scope.

These controls reduce risk but do not close the findings above.

## 9. Remediation phases (recommendations only)

1. Resolve the environment blocker and run production/browser checks.
2. Reconcile approved auth/recovery session contracts (FE-002, FE-003).
3. Establish a bounded transport and failure-state policy (FE-001, FE-006).
4. Make route/surface permissions and runtime contracts explicit (FE-004,
   FE-005).
5. Add bundle governance and owner-reviewed maintainability cleanup
   (FE-007–FE-009).

No remediation, dependency change, lockfile change, commit, push, or production
operation was performed.

## 10. Resume handoff

- Historical audit state: `complete` for the 2026-07-28 repository/static
  snapshot; current Layer 01 status is `requires_revalidation` after PR #137.
- Current overlay: bounded design-system integration and audit-correction
  checks passed at `origin/main` `18f51de`; `FE-ENV-001` remains
  `environment_blocked` for release and real-role evidence.
- Exact next step: re-run the full Layer 01 checklist against a selected
  current release candidate, including the broader FE findings and a
  controlled frontend/API/browser environment.
- Revalidation trigger: any change to HEAD, relevant decisions, frontend
  source, lockfiles, build tooling, or test environment.
- Downstream handoff: Layers 02, 03, 05, 06, 07, 08, and 10 should consume
  the evidence without inheriting this score or finding status automatically.

## 11. Changelog

### 2026-08-05 — PR #137 post-merge design-system reconciliation

- Reconciled the merged PR #137 source, task-card evidence, and eight bounded
  CodeRabbit review items at `origin/main` `18f51de`.
- Recorded 62 Jest suites / 368 tests, successful production compilation,
  report-only bundle measurements, and 12/12 synthetic browser checks across
  Home and Retail discovery surfaces.
- Kept the historical 55/100 score and `FE-001`–`FE-ENV-001` finding status
  unchanged; the current Layer 01 row is `requires_revalidation` rather than
  treating bounded design-system evidence as a full-layer closure.
- Recorded the missing public-origin sitemap configuration and the baseline
  dependency advisories as residual risk. No backend, provider, migration,
  deployment, or go-live action was performed.

### 2026-07-28 — Frontend engineering audit completed

- Revalidated HEAD against baseline; no commit delta.
- Completed the frontend route, component, state, API, validation, failure
  state, build, artifact, dependency, bundle, and test checklist.
- Recorded `FE-001` through `FE-009` and `FE-ENV-001`.
- Recorded readiness 55%, confidence 85%, 0 P0, 4 P1, 4 P2, and 2 P3.
- Jest passed; production compilation succeeded but the release postbuild gate
  and browser journeys remain explicitly environment-blocked.
- No source, dependency, lockfile, commit, push, or production state changed.
