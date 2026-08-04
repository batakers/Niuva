# Backend Current-Main Authority Reconciliation Task Card

Status: **ready for delivery — documentation-only reconciliation verified;
runtime source already merged on the selected baseline**

## Identity and baseline

- **Driver / Technical Owner:** Faiz
- **Reviewer / verifier:** Faiz with source and repository checks; this is not
  an independent human review.
- **Branch:** `codex/backend-authority-reconciliation-20260805`
- **Baseline:** `origin/main` at
  `81da28f02fafd7c11cdcdb3a99eee50d5840aca2` (5 August 2026, Asia/Jakarta)
- **Delivery:** commit, push, and PR are allowed for this bounded slice; merge
  is not authorized by this task.

## Objective

Make the backend delivery records truthful against the latest `origin/main`
and provide one current decision packet for residual backend work. This avoids
reopening already merged runtime changes and avoids treating a plan or a local
test result as migration, provider, deployment, readiness, or go-live proof.

## Authority

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- The applicable feature task cards and decision packets under this directory
- Live GitHub PR state and the selected `origin/main` ancestry

## In scope

- Reconcile stale PR/delivery status text in the named backend feature cards
  and phase index.
- Record the merged current-main backend source slices and their boundaries.
- Add `BACKEND-REMAINING-DECISION-PACKET-2026-08-05.md` for blocked residual
  decisions and environment gates.
- Run documentation checks, selected-source regression checks, and exact-path
  review.

## Explicit exclusions

- No runtime backend or frontend source changes.
- No new route, response, role, business-policy, pagination, notification,
  authentication, or provider behavior.
- No migration/index/data mutation, historical rewrite, secret/credential
  handling, provider activation, deployment, production-readiness, or go-live.
- No merge of the resulting PR.

## Acceptance criteria

1. The phase index and named task cards no longer describe merged backend PRs
   as open, pending review, or pending delivery.
2. The reconciliation records exact current-main/PR evidence and does not
   claim that merged source proves production readiness.
3. The residual decision packet names the required owner/operations/data/
   environment inputs and preserves stop conditions.
4. The changed-path review contains documentation and task-plan files only.
5. Documentation checks, `git diff --check`, and proportional backend
   regression evidence pass; unavailable tools are recorded precisely.

## Verification evidence — 5 August 2026

- Selected baseline remained `origin/main` at `81da28f`; no backend or
  frontend source path changed in this slice.
- `python -m pytest -n 0 backend/tests -q`: **924 passed, 15 skipped, 14
  subtests passed**.
- `compileall`, `py_compile`, `pip check`, and critical `flake8` (`E9,F63,F7,F82`): **passed**.
- Repository workflow mypy check: **no issues in 20 source files**.
- Repository workflow Black check: **36 files unchanged**.
- Repository workflow isort check: **passed**.
- `git diff --check` and the stale-delivery status scan: **passed**. The only
  remaining `current-head CI` matches are historical statements that the
  checks passed before the already merged PR.
- Not run because unavailable locally: `pip-audit`, markdownlint, and Docker
  daemon/replica integration. Their absence is not treated as a pass.

## Handover

The handover must list changed and intentionally unchanged paths, current
baseline, verification results, residual decision gates, and the PR URL. A
reviewer must confirm that the packet does not authorize source implementation,
migration execution, provider activation, deployment, or go-live.
