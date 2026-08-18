# MIG-04 — Candidate Operations source pilot task card

**Status:** Historical bounded source pilot — G4/G5 complete in PR #290;
no backend or capability activation in this card
**Baseline:** `origin/main` at `ff843ce403932de2ff3f77532e60448c789e3aec`
**Owner:** Operations frontend driver under the active Goal
**Surface:** Inquiry queue/detail calibration only
**Inputs:** `OPS-01` through `OPS-08`, QA-01–QA-05, DS-01A/DS-01B,
`DEC-UX-004`, and current source/tests

## Objective

Test queue/detail hierarchy, role projection, conflict/recovery, and audit
context without changing backend authorization, operational lifecycle enums,
or data visibility.

## G3 review record

The G3 review was performed against the fresh `origin/main` baseline above.
The current source already provides role-filtered navigation, protected route
ownership, cursor pagination, explicit loading/empty/dependency/error states,
optimistic-action protection through `expected_version` and `operation_id`,
history, and a role-scoped Operations work home. The review also confirmed that
Inquiry, Quote, Project, Retail Order, and Work Order remain distinct source
families.

The following conditions are binding for G4:

- `OperationalNavigation.jsx` is a shared consumer of Public and customer
  navigation. It is read-only for this pilot and must not be changed merely to
  style Operations.
- `B2BStatusBadge.jsx` is also read-only unless a source-level consumer defect
  is demonstrated; no status enum or lifecycle mapping may change.
- Existing permission checks, protected route declarations, API endpoints,
  customer data projection, and operational lifecycle transitions remain
  read-only. Route visibility is not authorization.
- The bounded source improvement is limited to truthful ID/EN presentation of
  existing Operations records and action/evidence context. It must not invent
  metrics, provider/payment capability, role grants, or new transitions.
- No token promotion, new component family, new dependency, Public motif,
  bento layout, or decorative motion is admitted by this card.

G3 result: **PASS WITH CONDITIONS**. The exact source and test files below are
reviewable, the conditions are testable, and the pilot can be stopped without
touching backend or shared navigation contracts.

## Candidate exact-file scope

- `frontend/src/pages/admin/B2BList.jsx`
- `frontend/src/pages/admin/B2BDetail.jsx`
- `frontend/src/pages/admin/AdminDashboard.jsx`
- `frontend/src/pages/admin/AdminLayout.jsx`
- `frontend/src/i18n.js` (new Operations-facing ID/EN labels only)
- `frontend/src/pages/admin/b2b-workbench.contract.test.js`
- `frontend/src/pages/admin/admin-studio-convergence.contract.test.js`
- `frontend/src/pages/admin/AdminDashboard.contract.test.js`
- `frontend/src/pages/admin/AdminDashboard.test.jsx`
- `frontend/src/pages/admin/dashboard-charts.contract.test.js`
- `frontend/src/components/layout/OperationalNavigation.jsx` is explicitly
  read-only; no source change is authorized by this pilot.
- `frontend/src/components/admin/B2BStatusBadge.jsx` is explicitly
  read-only; no source change is authorized by this pilot.

## Acceptance criteria

- Queue/detail work-home keeps identity, filters, selected record, return
  context, history, and next authorized action visible.
- Role-aware projection and permission/forbidden states are explicit; route
  visibility never becomes authorization.
- Inquiry lifecycle and B2B Quote/Project resource boundaries remain separate.
- Loading, empty, dependency error, conflict/stale, expired, offline/uncertain,
  recovery, and success states never invent KPI, provider, price, or transition.
- Operations uses Product-register density and does not inherit Public campaign
  motifs, generic bento, fake telemetry, or decorative motion.
- Keyboard/focus return, 44px targets, 200% reflow, ID/EN long labels,
  reduced-motion, 390/768/1024/1440 evidence are recorded.
- Existing action/evidence labels are available in both supported locales;
  hardcoded Indonesian-only copy in the bounded Operations detail is removed
  without changing the underlying command or data contract.

## Verification and rollback

Run focused B2B/Admin/layout tests, full frontend regression, build,
dependency/diff checks, browser role/focus/state checks, axe, and Impeccable
Product-register critique. Use a fresh `origin/main` worktree and roll back
exact pilot files only; preserve operational history.

## G4 conditions and exclusions

G4 may change only the exact source/test paths above. It must preserve the
current API payloads, permission map, route ownership, status enums, and
customer/internal data projection. A source defect that would require one of
the read-only paths or a backend change must be split into a new task card.

No backend authorization, role/permission, API/schema, queue worker, provider,
payment, production, notification, KPI, or lifecycle transition changes. G3/G4,
commit, push, PR, review-thread resolution, merge, and readiness remain
separate.

## Self-review

- [x] Exact Operations queue/detail paths are bounded.
- [x] Role/data/lifecycle restrictions are explicit.
- [x] Product-register and anti-template checks are included.
- [x] No backend or operational capability is activated.
- [x] Shared Public/customer navigation and status adapters are explicitly
  excluded from source edits.
- [x] Current `origin/main` baseline and exact test consumers are recorded.

**Self-review result:** Pass as a historical bounded execution record; the
G4/G5 pilot was delivered in [PR #290](https://github.com/batakers/Niuva/pull/290)
and is not a general Operations redesign or capability launch.

## G4 execution record

The bounded pilot was implemented in the isolated Operations worktree from the
baseline above. The implementation:

- localizes existing B2B list record prefixes/references for ID and EN without
  changing payloads, resource identity, or status meaning;
- localizes the Quote acceptance evidence fields, channel options, incomplete
  validation feedback, and completed-project portfolio-draft action;
- localizes the Admin breadcrumb accessible name; and
- adds only the corresponding ID/EN translation keys in `frontend/src/i18n.js`.

Exact changed paths:

- `frontend/src/i18n.js`
- `frontend/src/pages/admin/B2BList.jsx`
- `frontend/src/pages/admin/B2BDetail.jsx`
- `frontend/src/pages/admin/AdminLayout.jsx`
- `frontend/src/pages/admin/b2b-workbench.contract.test.js`
- `frontend/src/pages/admin/admin-studio-convergence.contract.test.js`

Intentionally unchanged: `App.js`, permission maps, API/client contracts,
backend handlers, `OperationalNavigation.jsx`, `B2BStatusBadge.jsx`, all
status/lifecycle enums, customer projections, and shared Public navigation.

Verification completed locally:

- focused Operations/Admin: 5 suites, 42 tests passed;
- full frontend regression: 73 suites, 467 tests passed;
- production build passed; report-only gzip total 625.70 kB and entry 167.34
  kB;
- browser/Axe matrix: 32/32 ID/EN × 390/768/1024/1440 cases across work home,
  Inquiry list/detail, and Quote detail; zero overflow, page errors, or
  serious/critical Axe findings;
- Impeccable detector on changed runtime files: `[]`;
- `git diff --check` passed; and
- preview server stopped and port 3000 verified not listening.

`npm audit --omit=dev --audit-level=high` continues to report two existing
React Router 7.18.1 RSC advisory entries from the repository dependency
baseline. No dependency change is included or implied by this pilot.

This execution record is source/test evidence only. It does not activate a new
Operations capability, change authorization, or establish staging,
production-readiness, deployment, or go-live.
