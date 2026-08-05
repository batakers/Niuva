# Task Card — Current-main Post-Merge Readiness Revalidation

**Status:** Ready for documentation-only delivery; no production or go-live
authority is created by this card.

**Selected baseline:** `origin/main` at
`0c9a715decfd0b61035338bb66c0f69de5006d1a`

**Branch:** `codex/g6-current-head-readiness-20260805`

**Worktree:** `C:\tmp\niuva-g6-current-head-readiness-20260805`

## Objective

Re-anchor the current-main readiness evidence after PRs #146, #147, and #148
entered `main`, using fresh source/test/build evidence and preserving the
separate production, deployment, provider, migration, and go-live gates.

## Scope

Change only:

- this task card; and
- `docs/implementation/production-readiness/phases/CURRENT-MAIN-READINESS-REVALIDATION-2026-08-05.md`.

The packet update will correct the selected SHA, current-head lineage,
verification results, and stale next-gate references. It will not convert
local checks or merged PRs into readiness approval.

## Authority and context

Read in order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. applicable approved decisions/ADRs and runbooks;
5. current source and tests.

`docs/context/AI_AGENT_TEAM_WORKFLOW.md` and
`docs/implementation/production-readiness/**` are workflow and evidence
context only. They do not authorize source changes, provider activation,
migration, deployment, production readiness, or go-live.

## Intentionally unchanged

No backend/frontend source or tests, canonical decision, ADR, runbook,
dependency, CI workflow, environment/configuration, migration, provider,
credential, database, deployment state, or shared data may change.

## Acceptance criteria

- Record the fetched `origin/main` SHA and exact selected worktree.
- Record merged PRs #146, #147, and #148 with their bounded evidence.
- Record the current backend/frontend/build verification and its limits.
- Preserve the verdict **NOT READY** for production, deployment, activation,
  and go-live; do not assign a new overall percentage.
- Keep staging, browser/real-role, security ownership, migration,
  provider/Finance, release/rollback, and independent-review gates explicit.
- State changed and intentionally unchanged paths, rollback, and external
  actions requiring approval.
- Pass `git diff --check` and a staged secret-pattern review.

## Owner, verifier, and handoff

- **Driver:** Faiz / Codex.
- **Verifier:** independent PR review and repository CI checks.
- **Commit/push/PR:** permitted by the active user objective.
- **Merge:** not permitted to this agent; user retains merge control.
- **Rollback:** revert the documentation commit; no runtime or data rollback
  is needed.

## Required external actions still blocked

Staging access, provider activation, migration apply/restore, secret rotation,
deployment, production-readiness approval, and go-live remain separately
authorized actions.
