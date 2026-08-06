# Task Card — Current-main Post-merge Readiness Revalidation

<!-- markdownlint-disable MD013 MD060 -->

**Status:** Documentation-only evidence; not release-candidate selection or
final gate acceptance
**Date:** 2026-08-06 (Asia/Jakarta)
**Requested baseline:** `origin/main` `c7452b889eec2c3597c622479d46da456f2bf656`
**Observed current head:** `origin/main` at
`2ccb340a4694c8fe466531a666514edd5bd9c1e2`, Git tree
`e8893474a388727365a387ee7a11491dc55df842`
**Merge parents:** `1a99bd7cd56500bb3ea08a892f01ffc0ed22ec79` and
`cfed53be307d4a4f9cc2908eacc277a78a9010de`
**Driver:** Faiz / delegated Codex implementation
**Active branch:** `codex/pr-196-197-current-head-fix-20260806`
**Active worktree:** `C:\tmp\niuva-pr-196-197-current-head-fix-20260806`

## Objective

Re-anchor the current decision queue and readiness evidence after PR #199
entered `main` as the current-head documentation re-anchor. The previous
packet was authored against the intermediate `1a99bd7` state and now has a
stale current SHA/tree. The packet must distinguish the current repository
observation from a selected release candidate, preserve the documented DR-002
sole-owner exception as non-independent and unverified, and identify PRs #196
and #197 as stale/conflicting work based on the older `9472537` head.

This task does not select DR-001, approve a release candidate, resolve DR-002,
approve a bundle budget, activate a provider, run a migration, deploy, approve
production readiness, or approve go-live.

## Authority and reading order

Use the repository authority in this order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. applicable ADRs and decisions, including `ADR-001`, `ADR-002`, `ADR-003`,
   `ADR-004`, and `DEC-OBS-001`;
5. `doc/PRODUCTION_DEPLOYMENT.md`,
   `doc/ROLLOUT_AND_HANDOVER_RUNBOOK.md`, and
   `doc/MIGRATION_BACKUP_RESTORE_RUNBOOK.md`; and
6. current source, tests, workflows, and current-main evidence.

Readiness and implementation packets are evidence/context only. They do not
override canonical decisions or authorize external operations.

## Scope

Only these paths may change:

1. `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` — update
   the DR-001 freshness observation and packet link; and
2. this task card and its paired revalidation packet; and
3. `docs/implementation/production-readiness/phases/G5-CURRENT-MAIN-INTEGRATION-BLOCKER-2026-08-06.md` — update the serial G5 current-main observation.

## Explicit exclusions

- Do not change application source, tests, dependencies, lockfiles, or
  workflows.
- Do not rewrite historical evidence packets merely to replace their
  point-in-time SHA; classify them as historical where appropriate.
- Do not merge, rebase, force-push, or delete the superseded PRs/branches #196
  and #197. This replacement may be merged only after its review and required
  checks pass under the user's explicit authorization.
- Do not select or activate storage, payment, email, shipping, telemetry, or
  other providers.
- Do not use credentials, external targets, staging/production data, or real
  database migration/restore operations.
- Do not claim that a successful main quality gate proves staging, rollback,
  production readiness, or go-live.

## Acceptance criteria

- Record the exact fetched `origin/main` SHA, Git tree, merge parents, clean
  worktree state, and requested-baseline staleness.
- Record that `1a99bd7..2ccb340` is documentation-only: four paths, 100
  additions, and 88 deletions from PR #199. Also retain the earlier #185,
  #189, #195, and #198 intervals as historical lineage.
- Record merged lineage and current open PR state without treating either as
  a release decision; #199 is merged and #196/#197 are not part of `main`.
- Record that the #185 sole-owner exception is an accepted-risk disposition,
  not independent verification or `Verified` incident closure.
- Preserve DR-001, DR-002, DR-011–DR-015, provider, migration, deployment,
  independent-review, production-readiness, and go-live blockers.
- Run `git diff --check`, documentation lint, exact staged-path assertion,
  and staged credential-shaped secret scanning before publication.

## Unresolved risks and decisions

- **DR-001 remains open:** the observed `2ccb340` head is not an owner-selected
  release candidate.
- **DR-002 remains open for verified closure:** #185 records a sole-owner
  self-verification exception through 30 August 2026, but independent
  verification, credential action, history/cache/fork/clone evidence, and
  controlled new-account authentication remain absent.
- **DR-011–DR-015 remain open or partial:** provider/Finance activation,
  operational ownership, release policy, observability evidence,
  production-readiness, and go-live decisions are not supplied by this task.
- The requested `c7452b8` baseline and prior `f43eea6` observation can become
  stale as `main` advances; the paired packet must be refreshed before a new
  candidate claim.
- PR #196 and PR #197 were authored against `9472537`; they are now
  stale/conflicting after #198 and #199 and are not evidence for `2ccb340`.
- External smoke, real-role/browser, staging, artifact publication,
  backup/restore, migration, deployment, monitoring, and go-live checks were
  unavailable because target, credentials, owners, or approvals are absent.

See the paired revalidation packet for the exact evidence and current
stop-conditions.

## Delivery authorization and handover

The user authorizes a branch, commit, push, PR, and merge of this replacement
only after review and required checks pass. Deployment, provider activation,
migration execution, secret use/rotation, production-readiness, and go-live
remain outside this task authorization.

The PR must list changed and intentionally unchanged files, passed and unrun
checks, risks and rollback, and external actions still requiring approval.

<!-- markdownlint-enable MD013 MD060 -->
