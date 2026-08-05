# Task Card — Post-Merge Current Decision-Queue Freshness Correction

<!-- markdownlint-disable MD013 -->

**Status:** Documentation-only freshness correction; DR-001 remains unresolved and `Open`; no release candidate is selected
**Date:** 2026-08-06 (Asia/Jakarta; post-merge verification)
**Observed baseline:** `origin/main` at `ca8b1947327fdaa1f8df562a8d437d7d628ead21`
**Active branch:** `codex/g20-dr001-impact-postmerge-20260806`
**Active worktree:** `C:\tmp\niuva-g20-dr001-impact-postmerge-20260806`
**Driver:** Faiz / delegated Codex implementation

## Objective

Record the latest `origin/main` observation after the documentation-only merges
of PRs #151–#160. PR #154 accurately corrected the DR-001 row to the SHA that
was current before those merges (`c84743c8fcbc158721037b3c02dc0dff0c872242`),
and PR #160 recorded the next observation at
`a99687222cea4a573c1e191a64445885d9f2dfca`. PR #160 then advanced the default
branch to `ca8b1947327fdaa1f8df562a8d437d7d628ead21`; this follow-up updates the
current observation without selecting a release candidate.

This is a freshness correction, not a release decision. It does not authorize
source implementation, migration, provider activation, deployment,
production-readiness approval, or go-live.

## Authority and reading order

The canonical reading order used for this task is: Master Spec, Document
Register, Decision Register, applicable decision/ADR, applicable runbook, then
current source and tests.

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` (DR-001)
- `docs/implementation/production-readiness/phases/CURRENT-RELEASE-CANDIDATE-SELECTION-2026-08-06.md`
  as decision-input context only

No approved decision or ADR selects a release candidate in this task. No
operational runbook is executed because this is a Git/documentation freshness
correction; deployment, migration, provider, credential, and environment
operations are out of scope.

## Scope

Only these paths may change:

1. `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` — update
   the DR-001 post-merge observation while preserving `Open` status and the
   explicit non-selection statement.
2. This task card.

## Explicit exclusions

- Do not select or approve an immutable release-candidate SHA.
- Do not rewrite the historical PR #154 task card or provenance records.
- Do not change application source, tests, dependencies, lockfiles, CI,
  runbooks, ADRs, decision status, providers, migrations, credentials,
  deployment configuration, or environment state.
- Do not apply migration, use production credentials, deploy, or claim
  production readiness or go-live.
- Merge of this follow-up correction PR remains a separate user-controlled action.

## Decision and change impact

- DR-001 remains unresolved and `Open`; this correction selects no release-candidate SHA.
- Freshness-proof risk is the only issue addressed: without this correction, the
  queue could be read as describing the pre-merge `origin/main` rather than the
  post-merge observation. The updated observation is not proof that the SHA is
  suitable for release or production readiness.
- Operational and migration impact is none. No runtime, database, migration,
  provider, deployment, credential, environment, or go-live action occurs.
- Rollback is a documentation revert or closure of this PR; no runtime or data
  rollback is required.
- Project Owner selection of the release-candidate baseline and scope requires
  separate approval.

## Acceptance criteria

- `origin/main` is freshly fetched and the exact post-merge SHA is recorded as
  `ca8b1947327fdaa1f8df562a8d437d7d628ead21`.
- The DR-001 row remains unresolved and `Open` and explicitly says the
  observation does not select a release candidate.
- The earlier `a99687222cea4a573c1e191a64445885d9f2dfca` and
  `c84743c8fcbc158721037b3c02dc0dff0c872242` observations remain identifiable
  as historical context.
- Only the two approved paths are staged.
- `git diff --check`, markdownlint, exact-path verification, and staged secret
  scanning pass.

## Authorization and handover

The user authorizes commit, push, and opening a pull request for this bounded
follow-up correction. Merge of the new PR, source/runtime implementation, migration,
provider activation, credential use, deployment, production-readiness
approval, and go-live require separate approval.

The PR must list changed and intentionally unchanged paths, passed and unrun
checks, risks and rollback, and external actions still requiring approval.

<!-- markdownlint-enable MD013 -->
