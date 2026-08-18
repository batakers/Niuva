# MIG-04 — Candidate Operations source pilot task card

**Status:** G3 reviewed — PASS WITH CONDITIONS; G4 exact-file source pilot
candidate authorized by the active Goal; delivery remains evidence-gated
**Baseline:** `origin/main` at `0cc824f522e00190a16db5c73d4d7615acf2b698`
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

**Self-review result:** Pass with conditions as a G3 task card; G4 remains a
bounded source pilot, not a general Operations redesign or capability launch.
