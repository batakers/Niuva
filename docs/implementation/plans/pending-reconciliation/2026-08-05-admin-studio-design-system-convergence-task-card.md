# Admin Studio Design-System Convergence Task Card

Status: **Local implementation and proportional verification complete — Admin
Studio presentation and safe legacy-boundary remediation only; Git publication
not authorized**

## Identity and baseline

- **Requester / delegated Product and Technical Owner:** Faiz
- **Driver:** Codex in an isolated Admin Studio worktree
- **Reviewer / verifier:** Faiz with automated and synthetic browser evidence;
  independent operations/security review is not claimed
- **Branch:** `frontend/admin-studio-design-system-convergence`
- **Selected baseline:** `origin/main` at
  `0b699fea676d285a749f7bf41765b542238c3def`
- **Date:** 5 August 2026, Asia/Jakarta
- **Commit/push/PR permitted?:** No. Local source, tests, screenshots, and
  handover evidence only.

## Objective

Converge the active Admin Studio shell and Work Home into a dense, calm,
task-oriented Niuva operational system. Correct misleading queue semantics,
restore the approved read-only boundary of the legacy Order archive, improve
sidebar readability, reduce rounded-card repetition, and align remaining
high-impact form/copy outliers without changing backend authorization or
domain behavior.

## Authority

- `docs/NIUVA_MASTER_SPEC.md`, especially sections 4, 9, 10, 17, and 18
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md`
- `docs/decisions/experience/DEC-OPS-002-admin-scope-reduction.md`
- `docs/decisions/experience/DEC-OPS-003-reduced-integrated-cms-mvp.md`
- `docs/decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md`
- `docs/decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md`
- `docs/decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md`
- `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md`
- `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md`
- `DESIGN.md`
- The active goal instruction to retain the current UI libraries and converge
  the frontend in isolated surface slices

## Audit findings addressed

- `/admin/orders` is approved as a read-only legacy archive, but the page still
  contains bulk and per-record status-mutation controls whenever historical
  response data advertises `mutations_enabled`.
- Several role-home definitions still use `/admin/orders` as routine work even
  though `/admin/retail-orders` is the authoritative active Retail queue.
- Dashboard queue paths with no supported statistic are coerced to zero and
  described as having no blocker, which overstates available evidence.
- `Operational Spine` is internal design jargon rather than a clear operator
  label in the Indonesian surface.
- Date filter, two charts, and withheld-data notice become a repeated rounded
  card stack on mobile rather than a calm operational reading sequence.
- Compatibility badges consume the sidebar label width and truncate the names
  of the two legacy surfaces.
- Staff and Customer pages contain hard-coded Indonesian/English mixtures and
  bypass the shared translation system.
- Product Editor native selects use a shorter, square, page-local control style
  while comparable Admin native selects already use tokenized control geometry
  and focus treatment.
- Compact sidebar labels, queue indices, the legacy status filter, and the
  shared operational status badge expose measurable accessible-name or
  contrast failures in the Admin browser surface.

## In scope

- Make Work Home queue counts tri-state: loading, measured count, or explicitly
  unmeasured/review-required.
- Map active Retail statistics to `/admin/retail-orders` and remove the legacy
  archive from role-home work queues while retaining its badged navigation.
- Replace dashboard jargon and unsupported green-state claims with factual,
  bilingual operational copy.
- Recompose dashboard filters/charts as flat divided operational sections while
  retaining Recharts, accessible descriptions, data tables, and safe withheld
  revenue explanation.
- Improve Admin shell navigation label wrapping, badge placement, mobile drawer
  semantics, and shared page width without changing permission filtering.
- Use existing high-contrast semantic text roles for compact sidebar, queue,
  and status labels, and provide the legacy status filter an accessible name.
- Remove all mutation state, selection, API calls, and actions from
  `/admin/orders`; retain filtering, inspection, safe downloads, and explicit
  read-only explanation.
- Move Staff/Customer page-level and table/dialog copy into the existing ID/EN
  translation system without changing identity/customer API behavior.
- Align Product Editor native select geometry/focus with existing semantic
  tokens without changing field values or payload construction.
- Add static and behavior contracts for the route boundary, queue truthfulness,
  localization, and presentation rules.
- Capture desktop/mobile screenshots, keyboard/focus evidence, console review,
  responsive overflow, and automated accessibility evidence using synthetic
  data only.

## Affected files

- `docs/implementation/plans/pending-reconciliation/2026-08-05-admin-studio-design-system-convergence-task-card.md`
- `frontend/src/pages/admin/AdminLayout.jsx`
- `frontend/src/pages/admin/AdminDashboard.jsx`
- `frontend/src/pages/admin/AdminDashboard.contract.test.js`
- `frontend/src/pages/admin/Orders.jsx`
- `frontend/src/pages/admin/Users.jsx`
- `frontend/src/pages/admin/Customers.jsx`
- `frontend/src/pages/admin/Customers.password-policy.test.jsx`
- `frontend/src/components/admin/AccountStatusBadge.jsx`
- `frontend/src/components/operational/StatusStepper.jsx`
- `frontend/src/pages/admin/ProductEditor.jsx`
- `frontend/src/pages/admin/retail-order.contract.test.js`
- `frontend/src/pages/admin/admin-studio-convergence.contract.test.js`
- `frontend/src/lib/adminWorkbench.js`
- `frontend/src/lib/adminWorkbench.test.js`
- `frontend/src/i18n.js`
- Admin-only synthetic browser evidence under `output/playwright/`

## Explicit exclusions

- No Admin route addition/removal, exact navigation-policy decision, permission
  mapping change, role assignment rule, backend authorization, query scope,
  API contract, payload, schema, or data mutation outside removal of the
  forbidden legacy frontend commands.
- No Retail Request, Assisted Offer, after-sales Case, payment, upload,
  fulfilment, notification-provider, migration, deployment, or go-live
  activation.
- No CMS lifecycle, Catalog publication, Inventory conflict, B2B state machine,
  identity-governance action, or Customer operation behavior change.
- No new UI library, dependency, token value, Tailwind configuration, global
  component API removal, secret, provider, database, or production action.
- No commit, push, PR, merge, or modification of another worktree.

## Acceptance criteria

1. `/admin/orders` contains no frontend mutation API call, bulk selection, or
   status-change action and remains visibly read-only.
2. `/admin/retail-orders` is the only Retail Order work queue in role-home
   definitions; legacy navigation remains present and compatibility-badged.
3. Unsupported queue metrics are presented as review-required, never as zero
   or blocker-free; supported zero counts remain distinguishable.
4. Dashboard retains role/permission filtering, accessible chart descriptions,
   data-table alternatives, date filtering, empty/error/retry states, and
   withheld-revenue truthfulness without a repeated rounded-card grid.
5. Sidebar labels and compatibility state remain readable at desktop and mobile
   widths; drawer focus is trapped, Escape closes it, and focus returns.
6. Staff and Customer page copy is provided in both existing languages and
   domain/API behavior remains unchanged.
7. Product Editor select controls use existing semantic control, surface,
   border, text, and focus roles with no field or payload change.
8. Focused tests, full frontend regression evidence, production build, bundle
   measurement, responsive screenshots, keyboard/focus review, and automated
   accessibility checks are recorded.

## Rollback

Before publication, remove or revert only the listed Admin task paths in this
worktree. There is no data, backend, dependency, environment, or migration
rollback because this slice changes frontend presentation, read-only boundary,
copy, and tests only.

## Local implementation outcome

- Work Home now distinguishes loading, measured, and unsupported queue metrics;
  an unsupported metric asks the operator to review the queue and never claims
  zero work or a blocker-free state.
- Active Retail work for applicable roles points to `/admin/retail-orders`.
  `/admin/orders` remains in navigation as a compatibility-badged historical
  archive and contains no mutation state, command, or mutation API call.
- The dashboard is composed as a flat operational reading sequence with a
  factual queue, divided date controls, accessible charts/data tables, and a
  withheld-revenue explanation rather than repeated summary cards.
- Admin navigation labels and compatibility badges wrap without truncation;
  the mobile drawer is inert while closed, focuses its close control when
  opened, closes with Escape, and returns focus to the trigger.
- Staff and Customer copy uses the existing ID/EN dictionary, and both surfaces
  share one localized account-status badge.
- Product Editor selects use the existing semantic control geometry and focus
  treatment. Compact sidebar, queue, and operational status text uses existing
  high-contrast foreground roles; the legacy status filter has an accessible
  name.
- No backend, API contract, schema, provider, migration, deployment, go-live,
  dependency, token value, or UI-library change was made.

## Verification evidence

- Focused Jest: **6 suites passed; 51 tests passed** for dashboard, work-home
  roles, Retail/legacy boundary, Admin convergence, Customer password policy,
  and B2B workbench contracts.
- Full frontend Jest: **44 suites passed, 1 suite failed; 284 tests passed,
  1 test failed**. The sole failure is the pre-existing whitespace-sensitive
  assertion at `src/pages/admin/cms-lifecycle.contract.test.js:83` against
  `ContentEditor.jsx`; neither file is changed by this task.
- Synthetic Playwright audit: **3 scenarios passed** for Super Admin desktop,
  Order Admin mobile/drawer, and legacy Order archive desktop. Each checked
  horizontal overflow, console errors, page errors, failed requests, HTTP error
  responses, and axe WCAG 2.1 A/AA findings; all reported zero. The drawer was
  also scanned while open.
- Retained synthetic screenshots:
  `admin-dashboard-desktop.png`, `admin-dashboard-mobile.png`,
  `admin-navigation-mobile.png`, and `admin-legacy-orders-desktop.png` under
  `frontend/output/playwright/`.
- Production build: **passed**. Postbuild reported only that
  `REACT_APP_PUBLIC_SITE_URL` was not configured, so sitemap generation was
  skipped; no deployment was attempted.
- Bundle measurement in report-only mode: **567.47 kB total gzip**,
  **200.34 kB** largest entrypoint, and **100.16 kB** largest async asset. No
  budget decision was applied.

## Evidence limits and handover

- Browser traffic and identities were synthetic. This does not prove live API,
  real-account, production authorization, provider, migration, deployment, or
  go-live readiness.
- Automated axe checks do not replace a human screen-reader or usability
  session. No independent operations/security review is claimed.
- Git publication remains a separate gate: there is no commit, push, or PR for
  this worktree.
