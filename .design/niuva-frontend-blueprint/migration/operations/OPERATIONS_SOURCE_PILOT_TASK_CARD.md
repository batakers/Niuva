# MIG-04 — Candidate Operations source pilot task card

**Status:** Candidate planning-only card — G3/G4 not granted
**Baseline:** `origin/main` at `8555685c29a3fde9976ae6499336e2eb45a330ba`
**Owner:** Operations frontend driver (to be named at G3)
**Surface:** Inquiry queue/detail calibration only
**Inputs:** `OPS-01` through `OPS-08`, QA-01–QA-05, DS-01A/DS-01B,
`DEC-UX-004`, and current source/tests

## Objective

Test queue/detail hierarchy, role projection, conflict/recovery, and audit
context without changing backend authorization, operational lifecycle enums,
or data visibility.

## Candidate exact-file scope

- `frontend/src/pages/admin/B2BList.jsx`
- `frontend/src/pages/admin/B2BDetail.jsx`
- `frontend/src/pages/admin/AdminDashboard.jsx`
- `frontend/src/pages/admin/AdminLayout.jsx`
- `frontend/src/components/layout/OperationalNavigation.jsx`
- relevant existing tests for the named pages/layout/navigation and
  `frontend/src/components/admin/B2BStatusBadge.jsx` only if its existing
  consumer contract requires a compatible presentation change

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

## Verification and rollback

Run focused B2B/Admin/layout tests, full frontend regression, build,
dependency/diff checks, browser role/focus/state checks, axe, and Impeccable
Product-register critique. Use a fresh `origin/main` worktree and roll back
exact pilot files only; preserve operational history.

## Exclusions and gates

No backend authorization, role/permission, API/schema, queue worker, provider,
payment, production, notification, KPI, or lifecycle transition changes. G3/G4,
commit, push, PR, review-thread resolution, merge, and readiness remain
separate.

## Self-review

- [x] Exact Operations queue/detail paths are bounded.
- [x] Role/data/lifecycle restrictions are explicit.
- [x] Product-register and anti-template checks are included.
- [x] No backend or operational capability is activated.

**Self-review result:** Pass as a candidate G3 task card.
