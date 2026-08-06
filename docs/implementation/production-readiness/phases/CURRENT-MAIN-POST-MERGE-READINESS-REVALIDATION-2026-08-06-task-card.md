# Task Card — Current-main Post-merge Readiness Revalidation

<!-- markdownlint-disable MD013 MD060 -->

**Status:** Documentation-only evidence; not release-candidate selection or
final gate acceptance
**Date:** 2026-08-06 (Asia/Jakarta)
**Requested baseline:** `origin/main` `c7452b889eec2c3597c622479d46da456f2bf656`
**Observed current head:** `origin/main` at
`9472537405af3353a68e599a057263ca7aa079ee`, Git tree
`3a4678333ede6122fdc8d3f87456b83e1567c9cd`
**Merge parents:** `9f116044ea5a8a3eab86beacbb24a6faa8464f47` and
`b1850cf9f1c2e77cd500f4ed330a09ffe3961dea`
**Driver:** Faiz / delegated Codex implementation
**Active branch:** `codex/postmerge-readiness-reconciliation-20260806`
**Active worktree:** `C:\tmp\niuva-postmerge-readiness-reconciliation-20260806`

## Objective

Re-anchor the current decision queue and readiness evidence after PR #189 and
PR #195 entered `main` after the earlier observation. The previous #195 packet
was authored against `4026bc2`; this follow-up corrects its stale current-head
and open-PR statements. The packet must distinguish the current repository
observation from a selected release candidate and must keep the canonical
DR-013 decision open even though #189's source/config is now present.

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
   the DR-001 freshness observation, record the DR-013 source-state mismatch,
   and link the packet; and
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
- Record that `9f11604..9472537` is documentation-only: three paths, 248
  additions, and one deletion. Also distinguish the preceding #189 delta from
  `4026bc2..9f11604`: five frontend source/config/test paths, 216 additions,
  and three deletions; those changes are now part of `main`.
- Record merged lineage and current open PR state without treating either as
  a release decision, and record that #185 is now conflicting against `main`.
- Record that #189's `status: "approved"` bundle-budget source state does not
  close canonical DR-013 or authorize a release budget by inference.
- Preserve DR-001, DR-002, DR-011–DR-015, provider, migration, deployment,
  independent-review, production-readiness, and go-live blockers.
- Run `git diff --check`, documentation lint, exact staged-path assertion,
  and staged credential-shaped secret scanning before publication.

## Unresolved risks and decisions

- **DR-001 remains open:** the observed `9472537` head is not an owner-selected
  release candidate.
- **DR-002 remains open for verified closure:** the accepted-risk expiry,
  independent-verification gap, and credential/history evidence remain active.
- **DR-011–DR-015 remain open or partial:** provider/Finance activation,
  operational ownership, release policy, observability evidence,
  production-readiness, and go-live decisions are not supplied by this task.
- **DR-013 has a source-state mismatch:** #189's budget file says
  `status: "approved"`, but the canonical decision queue remains Open and the
  complete release-policy acceptance/evidence package is absent.
- **PR #185 remains open and conflicting:** its NIV-001 exception is not part
  of `main` and is outside this documentation reconciliation.
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
