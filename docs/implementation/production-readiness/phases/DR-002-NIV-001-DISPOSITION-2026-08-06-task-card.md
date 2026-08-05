# Task Card — DR-002 / NIV-001 Credential-Incident Disposition Packet

<!-- markdownlint-disable MD013 -->

**Status:** Documentation-only decision packet; human decision blocked
**Date:** 2026-08-06 (Asia/Jakarta; actual preparation date)
**Observed baseline:** `origin/main` at `c84743c8fcbc158721037b3c02dc0dff0c872242`
**Active branch:** `codex/g13-niv001-decision-20260806`
**Active worktree:** `C:\tmp\niuva-g13-niv001-decision-20260806`
**Driver:** Faiz / delegated Codex implementation
**Decision owner:** Incident owner, credential owner, repository administrator,
independent verifier, and Final Approver as assigned by the Project Owner

## Objective

Prepare a redaction-safe owner packet for DR-002, which requires either
verified closure of NIV-001 or a separately approved, time-bound accepted-risk
disposition. The packet must preserve the distinction between repository/CI
evidence and the operational evidence required by the NIV-001 runbook.

This task does not select `Verified`, does not renew the accepted risk, and does
not authorize any credential, repository-history, remote, clone, fork, cache,
backup, or production operation.

## Authority and reading order

The canonical reading order used for this task is: Master Spec, Document
Register, Decision Register, applicable decision/ADR, applicable runbook, then
current source and tests.

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` (DR-002)
- `docs/implementation/production-readiness/VERIFICATION_MATRIX.md` (V-00-02)
- `docs/implementation/production-readiness/TEAM_ASSIGNMENT.md` (PHASE-00B)
- `docs/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md`

No approved ADR closes the incident. DR-002 is the applicable open decision;
NIV-001 is the applicable procedural authority. Current source and CI are
supporting evidence only and cannot authorize secret rotation or history
rewrite.

## Scope

Only these two documentation files may change:

1. `docs/implementation/production-readiness/phases/DR-002-NIV-001-DISPOSITION-2026-08-06-task-card.md`
2. `docs/implementation/production-readiness/phases/DR-002-NIV-001-DISPOSITION-2026-08-06.md`

## Explicit exclusions

- Do not print, inspect, copy, store, or disclose any credential value.
- Do not rotate or revoke a credential, authenticate with an old credential, or
  provision a replacement account.
- Do not rewrite Git history, force-push, delete refs, alter `main`, change
  repository settings, contact GitHub Support, or purge caches/forks/clones.
- Do not inspect or modify another contributor's worktree, branch, clone, or
  backup; the dirty `main` worktree remains out of scope.
- Do not change source, tests, dependencies, CI, migration files, providers,
  deployment configuration, or decision status.
- Do not claim incident closure, security closure, production readiness, or
  go-live.

## Acceptance criteria

- The packet records DR-002 as open and the accepted-risk expiry as
  `2026-08-30`, without silently extending it.
- It presents owner choices for verified closure versus a renewed/new accepted
  risk, without selecting either.
- It maps the runbook's redacted evidence gates to V-00-02 and PHASE-00B.
- It labels current repository/CI observations and their limits, including the
  difference between a Gitleaks result and incident closure.
- It contains no credential, token, secret-manager output, or sensitive literal.
- Only the two task/packet paths are staged.
- `git diff --check`, markdownlint, exact-path verification, and staged secret
  scanning pass.

## Delivery authorization and handover

The user authorizes commit, push, and opening a PR. Merge, credential action,
history rewrite, remote publication, migration, deployment, provider
activation, production-readiness approval, and go-live remain unauthorized.

The PR must list changed and intentionally unchanged files, passed and unrun
checks, risks and rollback, and external actions still requiring approval.

<!-- markdownlint-enable MD013 -->
