# G1 — Backend Integrity and Contract Evidence

<!-- markdownlint-disable MD013 -->

**Status:** Proposed child task card; source-gate and environment evidence remain
separate
**Planning baseline:** `origin/main` observed at
`c705a4413c02eef6b31f4e0e76e144733453e0af`; the driver must fetch again before
creating its implementation worktree
**Owner:** Project Owner to assign
**Independent verifier:** Project Owner to assign

## Objective

Revalidate the bounded backend integrity contract for authorization and
customer-safe projections, transaction failure and rollback behavior,
conflict/retry semantics, idempotency, and safe observability. Produce an
evidence-backed handover and, only after a separate explicit source gate,
implement a defect inside the exact path lock below.

This card is a routing and scope contract. It does not authorize source
implementation, migration execution, provider selection or activation,
deployment, production-readiness approval, or go-live.

## Authority and applicable context

Read in this order before any work:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
5. `docs/decisions/architecture/ADR-005-production-backend-remediation-runtime-policy.md`
6. `docs/decisions/access/DEC-ACCESS-003-legacy-order-compatibility-and-customer-projection.md`
7. `docs/decisions/architecture/DEC-OBS-001-commerce-transaction-sandbox-observability-contract.md`
8. The applicable transaction/deployment runbook, then current source and tests

The G0 staging-scope card and production-readiness tracker are coordination
context only. They do not override canonical authority or grant an
implementation gate.

## Exact path ownership

The child task may inspect these paths and may change them only after the
explicit source gate is recorded:

- `backend/transaction_api.py`
- `backend/transaction_execution.py`
- `backend/transaction_guard.py`
- `backend/transaction_observability.py`
- `backend/tests/test_transaction_documentation.py`
- `backend/tests/test_transaction_error_contract.py`
- `backend/tests/test_transaction_execution.py`
- `backend/tests/test_transaction_guard.py`
- `backend/tests/test_transaction_integration.py`
- `backend/tests/test_transaction_observability.py`
- `backend/tests/test_transaction_topology_files.py`

Do not modify `docs/implementation/production-readiness/DECISIONS_REQUIRED.md`;
PR #162 currently owns the DR-001 freshness path. Do not modify this card from
the implementation chat.

## Intentionally unchanged and excluded

- `backend/migrations/**` and any real or shared database data;
- `backend/server.py`, readiness, notification, and shared worker runtime
  handlers;
- `backend/auth_*.py`, authorization policy modules, and frontend auth paths;
- provider adapters, storage, payment, Finance, fulfillment, or production
  topology;
- dependencies, lockfiles, CI workflows, deployment configuration, secrets,
  credentials, and environment state;
- non-transactional fallback behavior when transaction capability is absent.

## Dependencies and parallel rules

- Freeze or explicitly mark open the API envelope, error codes, idempotency,
  conflict, retry, fail-closed, role, and customer-projection contracts before
  editing.
- G1 may be discovered in parallel with G2 because the owned source paths are
  disjoint. If a shared handler or contract must change, stop and request a
  serial path assignment.
- G3 may consume the resulting contract but must not change it from the
  frontend task.
- G5 consumes the final handover only after the relevant PR is merged and
  revalidated against the new `origin/main` SHA.

## Acceptance criteria

- Produce a matrix mapping each required contract to current source, tests,
  observed behavior, and remaining proof gap.
- Prove transaction-required mutations fail closed when capability is absent;
  do not add a non-atomic fallback.
- Cover malformed telemetry, bounded duration, conflict/retry, idempotency,
  rollback, authorization, and customer-safe projection negative cases.
- If a source gate is granted, keep the implementation minimal and add or
  update proportional regression tests only inside the path lock.
- Record operational, migration, rollback, observability, security, and data
  impact even when each is intentionally none.
- Leave unresolved business, provider, security, and environment decisions as
  `blocked_by_decision`; never infer them from passing tests.

## Minimum verification

- `python -m pytest -n 0 -q backend/tests/test_transaction_documentation.py backend/tests/test_transaction_error_contract.py backend/tests/test_transaction_execution.py backend/tests/test_transaction_guard.py backend/tests/test_transaction_observability.py backend/tests/test_transaction_topology_files.py`
- Run the transaction integration test only with its approved isolated MongoDB
  replica-set setup; do not point it at shared or production data.
- Run the full backend suite when source changes are made, and report any
  environment-dependent test that was not run.
- Run `git diff --check`, exact-path verification, and a staged secret scan
  before any commit.

## Handover and stop conditions

The handover must list changed and intentionally unchanged files, checks passed
or not run, evidence SHA, risks and rollback, open decisions and owners, and
external actions still requiring approval. Stop before migration, provider,
credential, deployment, staging mutation, readiness, or go-live actions.

Commit, push, and opening a PR are allowed for an approved bounded slice.
Merge remains user-controlled.

<!-- markdownlint-enable MD013 -->
