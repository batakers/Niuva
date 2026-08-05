# Task Card — DR-013 Toolchain and Release Policy Decision Packet

<!-- markdownlint-disable MD013 -->

**Status:** Candidate documentation-only task; human decision blocked
**Date:** 2026-08-06 (Asia/Jakarta; actual preparation date)
**Baseline:** `origin/main` at `c84743c8fcbc158721037b3c02dc0dff0c872242`
**Driver:** Faiz / delegated Codex implementation
**Active branch:** `codex/g11-dr013-decision-20260806`
**Active worktree:** `C:\tmp\niuva-g11-dr013-decision-20260806`
**Decision owner:** Engineering/release/security owners, as assigned by the Project Owner

## Objective

Prepare an evidence-bound decision packet for DR-013. The packet must make the
current toolchain and release-policy gaps explicit and provide a form for the
authorized owners to select the supported package-manager, runtime, dependency,
quality-gate, artifact, review, and versioning contract.

This task records options and evidence. It does not select an option and does
not convert the current CI behavior into production approval.

## Applicable authority

The canonical read order used for this task is: Master Spec, Document Register,
Decision Register, applicable decision/ADR, applicable runbook, then current
source and tests.

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` (DR-013)
- `docs/implementation/production-readiness/TEAM_ASSIGNMENT.md` (PHASE-06A,
  PHASE-06D, and PHASE-09B)
- `docs/implementation/production-readiness/VERIFICATION_MATRIX.md`
- `.github/workflows/quality-gates.yml`
- `doc/PRODUCTION_DEPLOYMENT.md`

No DR-013-specific approved decision or ADR is currently applicable; DR-013 is
open. Approved provider-neutral constraints remain applicable where relevant,
including ADR-002 and ADR-003, but they do not choose a toolchain or release
policy. The applicable runbook is the provider-neutral
`doc/PRODUCTION_DEPLOYMENT.md`; no provider-specific runbook is applicable.

## In scope

Only these two documentation files may change:

1. `docs/implementation/production-readiness/phases/DR-013-TOOLCHAIN-RELEASE-DECISION-2026-08-06-task-card.md`
2. `docs/implementation/production-readiness/phases/DR-013-TOOLCHAIN-RELEASE-DECISION-2026-08-06.md`

The packet will document observed repository evidence, open decision fields,
decision dependencies, and the verification work that can begin after approval.

## Explicit exclusions

This task must not:

- change application runtime behavior, source code, tests, or public APIs;
- change `package.json`, `package-lock.json`, `requirements.txt`, or add a
  backend lockfile;
- change `.github/workflows/**`, build scripts, bundle thresholds, coverage
  thresholds, or artifact publication;
- select a Node/Python version, package manager, hosting provider, deployment
  target, or release topology;
- apply a migration, use credentials, activate a provider, deploy, or claim
  staging, production-readiness, or go-live;
- edit `DECISIONS_REQUIRED.md` or mark DR-013 resolved;
- modify unrelated tracked or untracked files.

## Acceptance criteria

- The packet is tied to the exact current `origin/main` SHA and labels all
  observations as evidence rather than approval.
- Current frontend/backend install, runtime, lock, security, test, browser,
  artifact, bundle, review, and versioning evidence is recorded with limits.
- Each DR-013 decision field has an owner-facing choice area and no option is
  silently selected.
- Dependencies to PHASE-06A, PHASE-06D, PHASE-09B, and the verification matrix
  are traceable.
- The packet states the post-decision implementation sequence and the remaining
  production-readiness boundary.
- Only the two approved documentation paths are staged.

## Authorization and delivery

The user authorizes this bounded branch to commit, push, and open a pull
request. The pull request must remain open for the user to review and merge.
Merge, deployment, provider activation, migration execution, credential use,
and go-live remain separately unauthorized.

## Minimum checks

- `git diff --check`
- exact staged-path assertion
- staged-diff secret-pattern scan
- documentation review against the applicable authority

Full backend/frontend CI is expected to run on the pull request. No source or
runtime test is expected from this docs-only task; that limitation must be
reported in the handover.

## Handover requirements

The final handover must identify changed and intentionally unchanged paths,
verification run and outcome, unrun checks and why, unresolved DR-013 choices,
rollback/removal impact, and external approvals still required.

<!-- markdownlint-enable MD013 -->
