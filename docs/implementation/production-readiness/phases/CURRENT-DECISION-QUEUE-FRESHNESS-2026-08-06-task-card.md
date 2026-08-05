# Task Card — Current Decision-Queue Freshness Correction

<!-- markdownlint-disable MD013 -->

**Status:** Documentation-only freshness correction; DR-001 remains open
**Date:** 2026-08-06 (Asia/Jakarta; actual preparation date)
**Observed baseline:** `origin/main` at `c84743c8fcbc158721037b3c02dc0dff0c872242`
**Active branch:** `codex/g12-authority-freshness-20260806`
**Active worktree:** `C:\tmp\niuva-g12-authority-freshness-20260806`
**Driver:** Faiz / delegated Codex implementation

## Objective

Correct the stale current-head observation in the DR-001 row of
`docs/implementation/production-readiness/DECISIONS_REQUIRED.md` from the
previously observed `9f4d3a4` to the freshly fetched `origin/main` SHA
`c84743c`. The correction must preserve DR-001 as **Open** and must not select
an immutable release candidate.

## Authority and reading order

The canonical reading order used for this task is: Master Spec, Document
Register, Decision Register, applicable decision/ADR, applicable runbook, then
current source and tests.

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` (DR-001)
- `docs/implementation/production-readiness/phases/CURRENT-MAIN-READINESS-PROVENANCE-RECONCILIATION-2026-08-06.md`
  as context-only historical evidence

No approved decision or ADR selects a release candidate in this task. DR-001
is the applicable open decision. No operational runbook is applicable because
this is a Git/documentation freshness correction; no deployment, migration,
provider, or environment operation is performed.

## Scope

Only these paths may change:

1. `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` — update
   the DR-001 current remote observation while preserving `Open` status and
   the non-selection statement.
2. This task card.

## Explicit exclusions

- Do not select or approve a release-candidate SHA.
- Do not edit historical `REMEDIATION_PROGRESS.md` or the historical
  current-main provenance packet.
- Do not change application source, tests, dependencies, lockfiles, CI,
  runbooks, ADRs, decision status, providers, migrations, credentials,
  deployment configuration, or environment state.
- Do not merge the pull request or claim production readiness/go-live.

## Acceptance criteria

- `origin/main` is freshly fetched and the exact SHA is recorded as
  `c84743c8fcbc158721037b3c02dc0dff0c872242`.
- The DR-001 row remains `Open` and explicitly says the observation does not
  select a release candidate.
- Historical/context documents remain unchanged and are not presented as
  current authority.
- Only the two approved paths are staged.
- `git diff --check`, markdownlint, exact-path verification, and staged secret
  scan pass.

## Delivery authorization and handover

The user authorizes commit, push, and opening a PR. Merge, deployment,
provider activation, migration apply to a real database, secret rotation,
production-readiness approval, and go-live remain unauthorized.

The PR must list changed and intentionally unchanged files, passed and unrun
checks, risks and rollback, and external actions still requiring approval.

<!-- markdownlint-enable MD013 -->
