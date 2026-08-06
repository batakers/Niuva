# Task Card — Current-main Post-merge Readiness Revalidation

<!-- markdownlint-disable MD013 MD060 -->

**Status:** Documentation-only evidence; not release-candidate selection or
final gate acceptance
**Date:** 2026-08-06 (Asia/Jakarta)
**Requested baseline:** `origin/main` `c7452b889eec2c3597c622479d46da456f2bf656`
**Observed current head:** `origin/main` at
`4026bc25d2d3a0e39574f3030101d42044b6ceb5`, Git tree
`61c95415ef164c70d2c5221fb71a679a976b2f7b`
**Driver:** Faiz / delegated Codex implementation
**Active branch:** `codex/postmerge-readiness-audit-20260806`
**Active worktree:** `C:\tmp\niuva-postmerge-readiness-audit-20260806`

## Objective

Re-anchor the current decision queue and readiness evidence after the
documentation-only merges of PRs #187, #188, #190, #191, #192, #193, and #194.
The packet must distinguish the current repository observation from a selected
release candidate, and must keep open PRs #185 and #189 outside `main`.

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
   the DR-001 freshness observation and link the packet; and
2. this task card and its paired revalidation packet.

## Explicit exclusions

- Do not change application source, tests, dependencies, lockfiles, or
  workflows.
- Do not rewrite historical evidence packets merely to replace their
  point-in-time SHA; classify them as historical where appropriate.
- Do not merge, rebase, force-push, or delete PRs/branches.
- Do not select or activate storage, payment, email, shipping, telemetry, or
  other providers.
- Do not use credentials, external targets, staging/production data, or real
  database migration/restore operations.
- Do not claim that a successful main quality gate proves staging, rollback,
  production readiness, or go-live.

## Acceptance criteria

- Record the exact fetched `origin/main` SHA, Git tree, merge parents, clean
  worktree state, and requested-baseline staleness.
- Record that the `f43eea6..4026bc2` post-merge delta is documentation-only,
  with no source/test/workflow paths changed.
- Record merged lineage and current open PR state without treating either as
  a release decision.
- Preserve DR-001, DR-002, DR-011–DR-015, provider, migration, deployment,
  independent-review, production-readiness, and go-live blockers.
- Run `git diff --check`, documentation lint, exact staged-path assertion,
  and staged credential-shaped secret scanning before publication.

## Unresolved risks and decisions

- **DR-001 remains open:** the observed `4026bc2` head is not an owner-selected
  release candidate.
- **DR-002 remains open for verified closure:** the accepted-risk expiry,
  independent-verification gap, and credential/history evidence remain active.
- **DR-011–DR-015 remain open or partial:** provider/Finance activation,
  operational ownership, release policy, observability evidence,
  production-readiness, and go-live decisions are not supplied by this task.
- The requested `c7452b8` baseline and prior `f43eea6` observation can become
  stale as `main` advances; the paired packet must be refreshed before a new
  candidate claim.
- External smoke, real-role/browser, staging, artifact publication,
  backup/restore, migration, deployment, monitoring, and go-live checks were
  unavailable because target, credentials, owners, or approvals are absent.

See the paired revalidation packet for the exact evidence and current
stop-conditions.

## Delivery authorization and handover

The user authorizes a branch, commit, push, and PR. Merge, deployment,
provider activation, migration execution, secret use/rotation,
production-readiness, and go-live remain outside this task authorization.

The PR must list changed and intentionally unchanged files, passed and unrun
checks, risks and rollback, and external actions still requiring approval.

<!-- markdownlint-enable MD013 MD060 -->
