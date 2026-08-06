# Task Card — DR-011 Provider and Finance Activation Decision Packet

<!-- markdownlint-disable MD013 -->

**Status:** Documentation-only decision packet; human decision blocked
**Date:** 2026-08-06 (Asia/Jakarta; actual preparation date)
**Observed baseline:** `origin/main` at `c84743c8fcbc158721037b3c02dc0dff0c872242`
**Active branch:** `codex/g14-dr011-provider-boundary-20260806`
**Active worktree:** `C:\tmp\niuva-g14-dr011-provider-boundary-20260806`
**Driver:** Faiz / delegated Codex implementation
**Decision owners:** Product, Finance, storage/payment, security, and
operations owners as assigned by the Project Owner

## Objective

Prepare a neutral owner packet for DR-011. The packet must distinguish a
provider-neutral release candidate with storage/payment inactive from a later
file-enabled or payment-enabled scope that requires provider, Finance,
reconciliation, retention, backup, and operational decisions.

This task records decision fields and evidence boundaries. It does not select a
provider, activate an adapter, enable upload/payment, or authorize production
operations.

## Authority and reading order

The canonical reading order used for this task is: Master Spec, Document
Register, Decision Register, applicable decision/ADR, applicable runbook, then
current source and tests.

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` (DR-011)
- `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`
- `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`
- `docs/decisions/product/DEC-PAY-02-legacy-manual-transfer-read-only.md`
- `doc/PRODUCTION_DEPLOYMENT.md` for the provider-neutral deployment boundary
- current source/tests only as bounded evidence

ADR-002 and ADR-003 are approved with open decisions and authorize only their
provider-neutral architecture boundaries. No provider-specific runbook or
activation approval is applicable. `DEC-PAY-02` keeps legacy manual-transfer
records read-only and does not authorize new payment-proof activity.

## Scope

Only these two documentation files may change:

1. `docs/implementation/production-readiness/phases/DR-011-PROVIDER-FINANCE-ACTIVATION-2026-08-06-task-card.md`
2. `docs/implementation/production-readiness/phases/DR-011-PROVIDER-FINANCE-ACTIVATION-2026-08-06.md`

## Explicit exclusions

- Do not name or select a storage, payment, messaging, logistics, or Finance
  provider as the approved choice.
- Do not add SDKs/adapters, modify source/config/dependencies, enable upload or
  payment, or change the provider-neutral capability responses.
- Do not create credentials, call provider APIs, run payment/refund tests
  against an external provider, or activate Finance/reconciliation operations.
- Do not apply migrations, access shared/staging/production data, deploy, or
  claim readiness/go-live.
- Do not change ADR-002, ADR-003, `DECISION_REGISTER.md`, or DR-011 status.
- Do not modify unrelated files or the dirty `main` worktree.

## Acceptance criteria

- The packet records the approved storage/payment boundaries and their open
  provider/operations consequences without inventing a selection.
- It offers an owner choice between inactive provider-neutral scope and exact
  file/payment activation scope.
- Storage, payment/Finance, data, secret, rollback, and evidence fields are
  explicit and blank until authorized owners decide.
- Current source/test observations are labeled as evidence, not activation
  approval.
- No provider name, credential, token, or external operation is introduced.
- Only the two approved paths are staged.
- `git diff --check`, markdownlint, exact-path verification, and staged secret
  scanning pass.

## Delivery authorization and handover

The user authorizes commit, push, and opening a PR. Merge, provider activation,
Finance operation, migration, deployment, credential use, production-readiness
approval, and go-live remain unauthorized.

The PR must list changed and intentionally unchanged files, passed and unrun
checks, risks and rollback, and external actions still requiring approval.

<!-- markdownlint-enable MD013 -->
