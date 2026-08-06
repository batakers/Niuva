# Task Card — Current Release-Candidate Selection Packet

**Status:** Documentation/decision-input only; this card does not select a
release candidate or authorize production, deployment, provider activation,
migration, secret rotation, or go-live.

**Observed current head:** `origin/main` at
`f43eea6bd633b4250180e4373a62e5fb21fe14fa`, with Git tree
`6d2154bd52785bbc749345c0346651f9752d1646`.

**Branch:** `codex/dr001-current-main-reanchor-20260806`

**Worktree:** `C:\tmp\niuva-dr001-current-main-reanchor-20260806`

## Objective

Prepare the exact DR-001 decision input needed to select one immutable
release-candidate SHA: current remote freshness, ancestry, changed-path scope,
recent merged lineage, verification evidence, and the consequences of each
possible disposition.

## Scope

Change only:

- this task card; and
- `CURRENT-RELEASE-CANDIDATE-SELECTION-2026-08-06.md`.

The packet records the observed `origin/main` head and preserves the prior
historical selected SHA as historical evidence. It deliberately leaves the
Project Owner's SHA and scope selection blank.

## Authority and context

Apply the repository reading order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. applicable approved decisions/ADRs;
5. applicable runbooks;
6. current source and tests.

`docs/implementation/production-readiness/**` and the team-assignment tracker
are context and planning inputs. They do not select a release candidate or
authorize source, dependency, environment, migration, provider, deployment, or
go-live work. DR-001 requires the Project Owner to record the selected SHA,
scope, and changed-path/revalidation matrix.

## Exclusions and intentionally unchanged areas

No application source or tests, dependency/lockfile, CI, configuration,
canonical decision, ADR, runbook, migration, provider, credential, database,
shared data, deployment state, or readiness percentage may change. No decision
is inferred from a merged PR or passing test.

## Acceptance criteria

- Record the fetched current SHA and exact clean worktree.
- Prove the relationship between the historical `d04e3f0` selection, the
  requested-but-stale `c7452b8`, and the observed `f43eea6` head.
- Record exact ancestry/path-count evidence and recent merged lineage.
- Record the merged lineage through PR #186 and which checks passed, with
  production limits.
- Present explicit DR-001 disposition fields without preselecting an option.
- Keep **NOT READY** for production, deployment, activation, and go-live.
- State changed/unchanged paths, verification limits, rollback, and external
  actions requiring approval.
- Pass `git diff --check` and a staged secret-pattern review.

## Owner and delivery authorization

- **Decision owner:** Project Owner / Faiz.
- **Driver:** Faiz / Codex.
- **Independent verifier:** separate reviewer after the owner records a SHA and
  scope.
- **Commit/push/PR:** permitted by the active user objective.
- **Merge:** user retains merge control; this agent must not merge.
- **Rollback:** revert the documentation commit; no runtime or data rollback is
  required.

## Required external actions still blocked

Project Owner selection of the immutable candidate and scope, independent
revalidation review, staging access, provider activation, migration
apply/restore, secret rotation, deployment, production-readiness approval, and
go-live remain separate actions.
