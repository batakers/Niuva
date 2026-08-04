# Implementation Plan: Backend Current-Main Authority Reconciliation

## Overview

Reconcile backend delivery packets with the latest `origin/main`, record the
current merged source evidence, and prepare a decision packet for remaining
backend work that cannot proceed without owner, environment, migration,
provider, or operations input. This slice does not change runtime code.

## Authority and baseline

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- Applicable phase task cards and decision packets
- Selected baseline: `origin/main` at `81da28f02fafd7c11cdcdb3a99eee50d5840aca2`

## Task list

### Phase 1: Current-head evidence

- [x] Verify `origin/main`, worktree isolation, open PR state, and merged
  backend PRs.
- [x] Verify that current backend runtime source is already represented by
  merged bounded slices.

### Phase 2: Documentation reconciliation

- [x] Update stale phase/task-card delivery states for merged backend PRs.
- [x] Add a current-main residual decision packet with explicit exclusions.

### Checkpoint: Documentation and authority

- [x] Changed paths contain no runtime, migration, dependency, provider, or
  environment edits.
- [x] Status claims match live GitHub/Git evidence.
- [x] Decision packet does not grant implementation or production authority.

### Phase 3: Verification and delivery

- [x] Run Markdown/path checks, `git diff --check`, and backend regression
  evidence against the unchanged selected baseline.
- [x] Review exact changed paths and stage only approved documentation files.
- [ ] Commit, push, and open a PR; do not merge.

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Historical task cards retain old PR states | Reviewers may treat merged work as pending | Reconcile only claims proven by live PR and SHA evidence |
| Decision packet is mistaken for implementation approval | Unsafe source or environment work may start | State owner inputs, exclusions, and separate gates explicitly |
| Dirty parallel worktrees overlap | User changes may be lost or mixed | Use this fresh worktree from `origin/main`; stage exact paths only |

## Explicit non-goals

- No backend runtime source change.
- No frontend change.
- No migration apply/backfill/rollback, database target access, provider
  activation, credential handling, deployment, production-readiness, or
  go-live action.
- No merge of the delivery PR.
