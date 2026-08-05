# Task Card — Current-main Provenance Reconciliation

**Status:** Ready for documentation-only delivery; this card creates no
production, deployment, provider, migration, or go-live authority.

**Observed current head:** `origin/main` at
`9f4d3a4ab8e499f95c501b202b18ded6a4187c7c`.

**Branch:** `codex/g7-next-readiness-20260806`

**Worktree:** `C:\tmp\niuva-g7-next-readiness-20260806`

## Objective

Record the post-merge current-main provenance after PR #149, prevent the
historical readiness tracker from being mistaken for current source truth, and
keep the release-candidate decision and production gates explicitly open.

## Scope

Change only these documentation paths:

- this task card;
- `CURRENT-MAIN-READINESS-PROVENANCE-RECONCILIATION-2026-08-06.md`;
- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md`, only to
  record the observed current SHA without selecting it as a release candidate;
- `docs/implementation/production-readiness/REMEDIATION_PROGRESS.md`, only to
  add a freshness notice and correct the historical FE-004 next-candidate
  wording.

The packet will verify that PR #149 changed documentation only, carry forward
the bounded source/test evidence already attributable to PR #149, and identify
the remaining environment, ownership, provider, migration, release, and
independent-review gates.

## Authority and context

Read and apply in order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. applicable approved decisions, ADRs, and runbooks;
5. current source and tests.

`docs/context/AI_AGENT_TEAM_WORKFLOW.md` and
`docs/implementation/production-readiness/**` are workflow/evidence context
only. They do not select a release candidate or authorize source changes,
provider activation, migration, deployment, production readiness, or go-live.

## Exclusions and intentionally unchanged areas

No backend/frontend source or tests, canonical specification, decision, ADR,
runbook, dependency, CI workflow, environment/configuration, migration,
provider, credential, database, deployment state, or shared data may change.
The observed `9f4d3a4` SHA must not be described as a release candidate unless
the Project Owner records that decision separately under DR-001.

## Acceptance criteria

- Record the fetched `origin/main` SHA, exact worktree, and clean-state result.
- Record PR #149 as merged documentation-only lineage and verify its changed
  paths against the current head.
- State which test/build evidence is carried forward and which checks are not
  rerun, with reasons and limits.
- Mark DR-001 as still open while recording `9f4d3a4` as an observed current
  head only.
- Mark the old tracker FE-004 “next candidate” statement as historical because
  FE-004 entered `main` through PR #140; direct current-source evidence remains
  governed by the current-head packet.
- Preserve **NOT READY** for production, deployment, activation, and go-live;
  do not assign or increase an overall percentage.
- State changed/unchanged paths, rollback, residual risks, and external actions
  still requiring approval.
- Pass `git diff --check` and a staged secret-pattern review.

## Owner and delivery authorization

- **Driver:** Faiz / Codex.
- **Verifier:** independent PR review and repository CI checks.
- **Commit/push/PR:** permitted by the active user objective.
- **Merge:** user retains merge control; this agent must not merge.
- **Rollback:** revert the documentation commit; no runtime or data rollback is
  required.

## Required external actions still blocked

Staging access, provider activation, migration apply/restore, secret rotation,
deployment, release-candidate selection, production-readiness approval, and
go-live remain separately authorized actions.
