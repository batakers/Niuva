# Frontend Design System Audit Correction Task Card

## Status and ownership

- **Status:** Local correction and bounded re-audit complete; commit, push, and
  PR gated
- **Selected baseline:** `e2a79690a09a1002f8d0b98ab5ee608e99691735`
- **Branch:** `frontend/design-system-integration-latest`
- **Worktree:** `C:/tmp/niuva-frontend-design-system-integration-latest`
- **Accountable/Product and Technical Owner:** Faiz, under the recorded delegation
- **Driver:** Codex
- **Verifier:** Faiz plus the automated and browser checks listed below
- **Finding IDs:** `DS-ARCH-001`, `DS-TOKEN-002`, `DS-DOC-003`,
  `DS-BOUNDARY-004`, `DS-CONTRACT-005`, `DS-TYPE-006`, `DS-TEST-007`
- **Commit/push/PR permitted:** No. Separate explicit approval is required.

## Objective

Correct every finding from the 5 August 2026 read-only Frontend Design System
Integration Verification while preserving current product behavior. The result
must retain the approved React, Tailwind, Radix/shadcn-style, CVA, Lucide, and
Sonner stack and the dependency direction:

```text
semantic CSS tokens
-> Tailwind semantic mappings
-> shared UI primitives
-> surface/domain components
-> route pages
```

## Authority

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. `docs/decisions/architecture/ADR-004-surface-boundary-topology.md`
5. `DESIGN.md`
6. `docs/context/AI_AGENT_TEAM_WORKFLOW.md`
7. Current source and tests at the selected baseline

## Exact implementation scope

### Shared presentation and lifecycle ownership

- `frontend/src/components/ui/badge.jsx`
- `frontend/src/components/operational/StatusStepper.jsx`
- `frontend/src/components/operational/LegacyOrderStatusBadge.jsx` (new)
- `frontend/src/components/admin/B2BStatusBadge.jsx` (new)
- `frontend/src/components/admin/PortfolioStatusBadge.jsx` (new)
- `frontend/src/components/admin/RetailOrderStatusBadge.jsx` (new)
- `frontend/src/components/admin/WorkOrderStatusBadge.jsx` (new)
- `frontend/src/pages/operational/ClientDashboard.jsx`
- `frontend/src/pages/operational/OrderDetail.jsx`
- `frontend/src/pages/admin/Orders.jsx`
- `frontend/src/pages/admin/B2BDetail.jsx`
- `frontend/src/pages/admin/B2BList.jsx`
- `frontend/src/pages/admin/PortfolioAdmin.jsx`
- `frontend/src/pages/admin/PortfolioDetail.jsx`
- `frontend/src/pages/admin/ProjectWorkOrders.jsx`
- `frontend/src/pages/admin/RetailOrderDetail.jsx`
- `frontend/src/pages/admin/WorkOrderDetail.jsx`

### Surface boundary, tokens, component contracts, and typography

- `frontend/tailwind.config.js`
- `frontend/src/components/layout/Navbar.jsx`
- `frontend/src/components/layout/PublicNavigation.jsx` (new)
- `frontend/src/components/layout/OperationalNavigation.jsx` (new)
- `frontend/src/components/layout/navigationStyles.js` (new)
- `frontend/src/components/layout/Layout.jsx`
- `frontend/src/components/brand/BrandSystem.jsx`
- `frontend/src/components/brand/CompanyProfileBlocks.jsx`
- `frontend/src/pages/marketing/HomePage.jsx`
- `frontend/src/pages/admin/ProductEditor.jsx`
- `frontend/src/pages/admin/Customers.jsx`
- `frontend/src/pages/admin/Users.jsx`
- `frontend/src/pages/admin/AdminDashboard.jsx`

### Contract and regression tests

- `frontend/e2e/design-system-integration.spec.js` (new)
- `frontend/src/components/ui/design-system-foundation.contract.test.js`
- `frontend/src/components/operational/StatusStepper.test.jsx`
- `frontend/src/components/admin/LifecycleStatusBadge.test.jsx` (new)
- `frontend/src/components/layout/Navbar.contract.test.js`
- `frontend/src/components/layout/Navbar.test.jsx`
- `frontend/src/components/layout/Layout.test.jsx`
- `frontend/src/pages/marketing/HomePage.contract.test.js`
- `frontend/src/pages/operational/customer-portal-surface.contract.test.js`
- `frontend/src/pages/admin/admin-studio-convergence.contract.test.js`
- `frontend/src/pages/admin/portfolio-lifecycle.contract.test.js`
- `frontend/src/pages/admin/retail-order.contract.test.js`

### Reconciliation documentation

- `docs/context/DOCUMENT_REGISTER.md`
- `docs/implementation/plans/pending-reconciliation/2026-08-05-frontend-component-register.md`
- `docs/implementation/plans/pending-reconciliation/2026-08-05-frontend-design-system-foundation-task-card.md`
- `docs/implementation/plans/pending-reconciliation/2026-08-05-frontend-design-system-integration-task-card.md`
- this task card

Read-only inspection and test execution may cover directly related files.
Editing any path not listed above requires an explicit scope amendment before
the edit.

## Required corrections

1. **DS-ARCH-001:** make lifecycle status labels and tone mapping owned by the
   applicable domain component. Shared `Badge` may expose presentation tones,
   but must not own a global lifecycle map or transitions.
2. **DS-TOKEN-002:** replace audited raw inverse colours, direct CSS-variable
   utilities, and arbitrary radius values with existing semantic utilities.
   Do not introduce a second token system.
3. **DS-DOC-003:** reconcile the Component Register and integration evidence to
   the selected baseline and newly executed checks without rewriting historical
   provenance as current proof.
4. **DS-BOUNDARY-004:** separate Public and operational navigation composition
   contracts while retaining one route-based application and unchanged route
   destinations.
5. **DS-CONTRACT-005:** remove audited shared-component near-duplicates and
   misuse of `TechnicalLabel`; use the adopted Select contract where its
   controlled values can preserve existing behavior.
6. **DS-TYPE-006:** reserve monospace for genuine identifiers, filenames,
   revisions, timestamps, and audit data; ordinary email and metric values use
   normal UI typography with tabular numerals where appropriate.
7. **DS-TEST-007:** add static and rendered contracts that fail on recurrence
   of the audited global status map, raw visual values, arbitrary radius, and
   cross-surface navigation ownership.

## Explicit exclusions

- No route, destination, API contract, request payload, mutation, permission,
  authentication, customer terminology, business validation, lifecycle state,
  or allowed transition change.
- No dependency, package manifest, lockfile, secret, environment, or unrelated
  global-configuration change. The missing Tailwind mapping for an existing
  canonical semantic token is the only configuration correction in scope.
- No backend, database, migration, provider, production credential,
  deployment, production-readiness, or go-live work.
- No snapshot regeneration or replacement of the approved UI stack.
- No commit, push, PR, merge, or other Git publication action.

## Increment order

1. Lifecycle-owned status presentation and focused contracts.
2. Semantic token, component-contract, typography, and Navbar boundary fixes.
3. Documentation reconciliation.
4. Full verification and fresh read-only re-audit.

Each increment must be inspected and tested before the next begins. Existing
integration changes and untracked browser output must be preserved.

## Done when

1. Every finding ID has source or documentation evidence showing correction.
2. No shared UI primitive contains route, API, permission, or lifecycle-domain
   authority.
3. Public and operational Navbar composition is explicit and behavior remains
   covered by tests.
4. Audited raw visual values, arbitrary radius, component duplication, and
   decorative monospace are absent from the approved paths.
5. Component Register classifications and evidence match current source.
6. Full Jest, production build, bundle budget, representative browser flows,
   axe checks, responsive widths, keyboard focus, overflow, and wrapping checks
   pass or any failure is reported with its proven scope.
7. A pre-commit handover reports changed and intentionally unchanged files,
   commands and results, residual risks, rollback, and remaining Git gate.

## Finding resolution

<!-- markdownlint-disable MD013 -->

| Finding | Local resolution evidence |
| --- | --- |
| `DS-ARCH-001` | Shared `Badge` is presentation-only. Legacy Order, B2B, Portfolio, Retail Order, and Work Order own separate label-to-tone maps without changing lifecycle states or transitions. |
| `DS-TOKEN-002` | Audited direct color-variable utilities and arbitrary radius were replaced by existing semantic roles; Tailwind now exposes the existing inverse-decoration token. |
| `DS-DOC-003` | Component and task registers distinguish the selected baseline, historical pre-correction evidence, and current local evidence. |
| `DS-BOUNDARY-004` | `Navbar` is an orchestration shell; `PublicNavigation` and `OperationalNavigation` own separate information architecture and actions. |
| `DS-CONTRACT-005` | Product Editor uses the adopted Radix Select composition for all five choices, and validation copy no longer misuses `TechnicalLabel`. |
| `DS-TYPE-006` | Ordinary email and dashboard metric values use normal UI typography; genuine identifiers, filenames, timestamps, and audit data retain technical typography. |
| `DS-TEST-007` | Static contracts and a four-viewport browser contract prevent recurrence of global lifecycle ownership, token/radius bypass, native Select duplication, and navigation-boundary drift. |

<!-- markdownlint-enable MD013 -->

Bounded re-audit verdict: **`CORRECTED_LOCAL / READY_FOR_PRE_COMMIT_REVIEW`**.
This closes the seven finding IDs only for the local selected-baseline diff. It
does not mean merged, production-ready, deployed, or approved for go-live.

## Executed verification

```powershell
npm test -- --watchAll=false --runInBand
npm run build
npm run measure:bundle
npm run test:bundle
npx playwright test e2e/retail-discovery.spec.js
npx playwright test e2e/design-system-integration.spec.js
npx playwright test e2e/accessibility.spec.js --grep "sign-in page"
npx playwright test e2e/role-matrix.spec.js --grep "sent to sign-in"
git diff --check
git status --short
```

- Focused lifecycle/status contracts: **7/7 suites, 58/58 tests passed**.
- Focused token/component/Navbar contracts: **7/7 suites, 33/33 tests passed**.
- Full Jest: **61/61 suites, 362/362 tests passed**.
- Production build: **passed**, with the existing Node `DEP0176` warning and
  sitemap skip because `REACT_APP_PUBLIC_SITE_URL` was unset.
- Bundle measurement: **581.12 kB total gzip**, **203.06 kB entry gzip**, and
  **100.16 kB largest async gzip**; measurement only, no budget decision.
- Bundle contract: **4/4 tests passed**.
- Synthetic browser evidence: **20/20 tests passed** across 375, 768, 1024,
  and 1440 pixel viewports. This comprises Homepage **4/4**, Retail **8/8**,
  Admin sign-in accessibility **4/4**, and protected-route redirect **4/4**.
- Static scans found no implementation use of the former global
  `StatusBadge`, no Product Editor native Select bypass, no active JS/JSX
  arbitrary radius or scaled Tailwind palette, no conflict markers, and no
  correction diff in backend, package manifests, or lockfiles.
- Markdown lint passed with zero issues for the four changed task/register
  documents outside `DOCUMENT_REGISTER.md`. A whole-file lint of
  `DOCUMENT_REGISTER.md` reports **242 existing MD013/MD060 issues** in its
  long authority tables; this bounded task did not mass-reformat that register.

The Retail browser command requires a synthetic same-origin
`REACT_APP_BACKEND_URL=http://localhost:3000` so the local discovery API mocks
exercise the configured-backend branch. The Homepage accessibility scan uses
`prefers-reduced-motion` to avoid sampling its approved opacity entrance in a
transient state.

Authenticated Admin role-matrix and Admin-surface axe suites were not run
because no real role credentials were supplied. Independent design acceptance,
human screen-reader review, production data, and production infrastructure are
not claimed. No test result authorizes commit, deployment, or go-live.

## Rollback

Before Git publication, rollback is a path-bounded reversal of only the
correction diff listed in this card. The pre-existing staged integration diff
and `frontend/output/` remain user-owned and must not be discarded.

## Open external action

After all checks and the pre-commit report, Faiz must decide separately whether
to authorize commit. Push and PR remain additional explicit gates.
