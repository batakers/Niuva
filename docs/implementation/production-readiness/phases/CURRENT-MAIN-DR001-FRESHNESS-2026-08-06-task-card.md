# Task Card — Current-main DR-001 Freshness Reconciliation after PR #186

<!-- markdownlint-disable MD013 -->

**Status:** Documentation-only provenance correction; DR-001 remains `Open` and
no release candidate is selected
**Date:** 2026-08-06 (Asia/Jakarta)
**Observed baseline:** `origin/main` at
`f43eea6bd633b4250180e4373a62e5fb21fe14fa`, tree
`6d2154bd52785bbc749345c0346651f9752d1646`
**Active branch:** `codex/dr001-current-main-reanchor-20260806`
**Active worktree:** `C:\tmp\niuva-dr001-current-main-reanchor-20260806`
**Driver:** Faiz / delegated Codex implementation

## Objective

Refresh the live DR-001 observation and add current-main provenance after PRs
`#164–#186` entered `main`. The packet must distinguish repository
freshness from release-candidate selection and must not inherit test or
readiness claims from older SHAs across source, test, CI, or operational-path
changes.

This is a documentation and decision-input correction. It does not authorize
source implementation, migration, provider activation, deployment,
production-readiness approval, or go-live.

## Authority and reading order

The canonical reading order for this task is:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. the applicable approved decision/ADR;
5. the applicable runbook; and
6. current source and tests.

Applicable context is `DR-001`, the current release-candidate decision-input
packet, the G0 bounded staging contract, and the G1–G4 child task cards.
Planning and audit documents do not select a candidate or authorize external
operations.

## Exact path ownership

Only these paths may change:

1. `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` — update
   the DR-001 current `origin/main` observation while preserving `Open` status
   and explicit non-selection wording.
2. This task card.
3. `CURRENT-MAIN-DR001-FRESHNESS-2026-08-06.md` — record exact current-head
   provenance, changed-path scope, available checks, and stop conditions.
4. `CURRENT-RELEASE-CANDIDATE-SELECTION-2026-08-06-task-card.md` — re-anchor
   its decision-input identity without selecting an option.
5. `CURRENT-RELEASE-CANDIDATE-SELECTION-2026-08-06.md` — re-anchor the
   candidate-selection provenance and keep the owner disposition blank.

## Explicit exclusions

- Do not select or approve an immutable release-candidate SHA.
- Do not rewrite earlier historical packets or task cards.
- Do not change application source, tests, dependencies, lockfiles, CI,
  runbooks, ADRs, decision status, providers, migrations, credentials,
  deployment configuration, or environment state.
- Do not apply a migration, use production credentials, deploy, or claim
  production readiness or go-live.
- Merge of the follow-up PR remains user-controlled.

## Acceptance criteria

- The fresh fetch and clean isolated worktree record exact SHA
  `f43eea6bd633b4250180e4373a62e5fb21fe14fa`.
- The packet records the tree, parents, ancestry, changed-path scope, and
  current-main lineage through PR #186.
- The packet distinguishes merged-PR checks from a standalone post-merge run;
  no unperformed current-SHA test is represented as passed.
- DR-001 remains `Open` and no option is preselected.
- Changed and intentionally unchanged paths, verification limits, risks,
  rollback, and external approvals are explicit.
- Only the five approved paths are staged; `git diff --check`, markdownlint,
  and staged secret scanning pass.

## Delivery authorization and handover

The user authorizes commit, push, and opening a pull request for this bounded
documentation slice. Merge, deployment, provider activation, migration apply
to a real database, secret rotation, production-readiness approval, and go-live
remain unauthorized.

The PR must list changed and intentionally unchanged paths, passed and unrun
checks, risks and rollback, and external actions still requiring approval.

<!-- markdownlint-enable MD013 -->
