# Task Card — G1–G4 Current-main Revalidation Index

<!-- markdownlint-disable MD013 MD060 -->

**Status:** Documentation-only evidence index; not final gate acceptance
**Date:** 2026-08-06 (Asia/Jakarta)
**Observed current main:** `origin/main` at
`f43eea6bd633b4250180e4373a62e5fb21fe14fa`, Git tree
`6d2154bd52785bbc749345c0346651f9752d1646`
**Driver:** Faiz / delegated Codex implementation
**Active branch:** `codex/g1-g4-current-main-revalidation-20260806`
**Active worktree:** `C:\tmp\niuva-g1-g4-current-main-revalidation-20260806`

## Objective

Create one exact-current evidence index for G1 backend integrity, G2
authentication/security, G3 frontend release/browser, and G4
staging/artifact/operations. The index must distinguish path-preserving test
evidence from exact-head evidence and external environment proof.

This task does not mark G1–G4 accepted, select DR-001, choose a provider, or
authorize staging, migration, deployment, production readiness, or go-live.

## Authority and reading order

Use the repository authority in this order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. applicable decisions/ADRs, including `ADR-001`, `ADR-004`, `ADR-005`,
   `DEC-ACCESS-001/002/003`, `DEC-AUTH-003/004/005/006/007/009/010/011/012`,
   `DEC-READY-01`, and `DEC-OBS-001`;
5. `doc/TRANSACTION_CAPABILITY_RUNBOOK.md`,
   `doc/BROWSER_VERIFICATION_RUNBOOK.md`,
   `doc/PRODUCTION_DEPLOYMENT.md`,
   `doc/ROLLOUT_AND_HANDOVER_RUNBOOK.md`, and
   `doc/MIGRATION_BACKUP_RESTORE_RUNBOOK.md`; and
6. current source, tests, workflows, and existing G1–G4 evidence packets.

The existing G1–G4 packets remain historical evidence until reconciled against
the exact current tree. This index does not replace canonical authority or
their applicable source gates.

## Scope

Only these two documentation files may change:

1. this task card; and
2. `G1-G4-CURRENT-MAIN-REVALIDATION-2026-08-06.md`.

## Explicit exclusions

- Do not change backend/frontend source, tests, dependencies, lockfiles,
  workflows, build scripts, migrations, deployment configuration, or secrets.
- Do not select a release candidate or convert any historical SHA into a
  current candidate.
- Do not select or activate storage, payment, email, shipping, telemetry, or
  other providers.
- Do not use credentials, external targets, staging/production data, or real
  database migration/restore operations.
- Do not claim external role, accessibility, origin/TLS/CORS/cookie, artifact,
  rollback, monitoring, production-readiness, or go-live proof.
- Do not modify PR #185, #187, #188, #189, #190, or #191 and do not merge any
  pull request.

## Acceptance criteria

- Pin `origin/main` and its Git tree to the exact observed identity.
- Record each historical G1–G4 packet baseline and the relevant path delta to
  current main.
- Record exact-current focused test results and clearly label prior-head or
  path-preserving CI evidence.
- Preserve decision, staging, artifact, migration, provider, independent-review,
  and go-live blockers rather than inferring closure.
- Pass `git diff --check`, documentation lint, exact staged-path assertion, and
  staged secret-pattern scanning.

## Delivery authorization and handover

The user authorizes commit, push, and opening a PR. Merge, deployment, provider
activation, migration execution, secret use/rotation, production-readiness, and
go-live remain unauthorized.

The PR must list changed/unchanged files, passed and unrun checks, risks and
rollback, and external actions still requiring approval. Rollback is a normal
documentation revert.

<!-- markdownlint-enable MD013 MD060 -->
