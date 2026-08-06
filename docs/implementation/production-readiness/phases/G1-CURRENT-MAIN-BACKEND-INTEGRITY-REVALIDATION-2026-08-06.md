# G1 — Current-main Backend Integrity and Transaction Revalidation

<!-- markdownlint-disable MD013 MD060 -->

**Status:** `REVALIDATED / REPOSITORY EVIDENCE PASSED WITH LIMITS`.
Transaction, conflict, and quality evidence is current-path attributable;
staging topology, data recovery, external consumer, independent-review, and
production gates remain open.

**Observed baseline:** `origin/main` at
`d4bf4ac0e9454ad09e57856cfebbfa70b9a93294`, with Git tree
`9b1abc0c006342d5e4a63765075a7c8fca7e8897`, after a fresh fetch on 6 August
2026.

**Branch/worktree:** `codex/g36-g1-current-main-revalidation-20260806` /
`C:\tmp\niuva-g36-g1-current-main-revalidation-20260806`.

This is a documentation-only G1 handover. It does not authorize backend source
changes, migrations, provider selection or activation, deployment, secret use,
production-readiness approval, or go-live.

## 1. Authority and scope

The applicable authority order is:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`;
5. `docs/decisions/architecture/ADR-005-production-backend-remediation-runtime-policy.md`;
6. `docs/decisions/access/DEC-ACCESS-003-legacy-order-compatibility-and-customer-projection.md`;
7. `docs/decisions/architecture/DEC-OBS-001-commerce-transaction-sandbox-observability-contract.md`;
8. `doc/TRANSACTION_CAPABILITY_RUNBOOK.md` and the applicable deployment and
   migration runbooks; and
9. current backend source, tests, workflows, and CI evidence.

The routing contract is
`docs/implementation/production-readiness/phases/G1-BACKEND-INTEGRITY-CONTRACT-2026-08-06-task-card.md`.
Its path lock covers transaction execution/guard/observability, B2B inquiry
conversion, catalog publication, and the corresponding tests. It requires
fail-closed transaction behavior, conflict/retry/idempotency evidence,
customer-safe projection, bounded telemetry, and explicit operational limits.

No file in that runtime path lock is changed by this packet.

## 2. Exact provenance and path coverage

| Evidence | Result | Limit |
| --- | --- | --- |
| Current `origin/main` | `d4bf4ac0e9454ad09e57856cfebbfa70b9a93294` | Point-in-time source identity; DR-001 remains unselected |
| Git tree | `9b1abc0c006342d5e4a63765075a7c8fca7e8897` | Source tree identity, not an artifact or database identity |
| First parent | `b1564b082208d55df869e94163eb2eaa3f61ee35` | PR #173 documentation predecessor |
| Second parent | `de60bfad54ef22da3bf67ca1f5c427c58aa1dfdc` | G4 documentation packet head |
| Latest merge change | PR #173 changed only the G4 evidence packet | No backend source change in the latest merge |
| Worktree divergence before packet | `origin/main...HEAD = 0/0` | Does not prove external database or staging state |

The transaction evidence uses two adjacent tested heads because PR #164 and
PR #166 cover different portions of the current G1 path set:

| Current path subset | Current-tree comparison | Relevant passing run |
| --- | --- | --- |
| `backend/transaction_execution.py`, `backend/tests/test_transaction_execution.py`, `backend/tests/test_transaction_guard.py`, `backend/tests/test_transaction_observability.py` | No diff from PR #166 head `17dd1f6c` to current `d4bf4ac` | PR #166 transaction run `31054981154` |
| `backend/b2b_service.py`, `backend/catalog_service.py`, `backend/tests/test_b2b_quote_conversion.py`, `backend/tests/test_catalog_routes.py` | No diff from PR #164 follow-up head `d4c144b7` to current `d4bf4ac` | PR #164 follow-up transaction run `31054621081` |
| Remaining G1 source/test paths | Covered by the exact current-main backend quality run below; no source change in PR #173 | Current-main run `31061245165` |

This path comparison avoids attributing a test run to files that were changed
after that run. It is source-path evidence, not proof that a transaction test
workflow ran on the current merge SHA.

## 3. Exact verification evidence

### Current-main backend quality gate

The push quality run at exact current head
[`31061245165`](https://github.com/batakers/Niuva/actions/runs/31061245165)
completed successfully. Backend job
[`92489477033`](https://github.com/batakers/Niuva/actions/runs/31061245165/job/92489477033)
reported:

- dependency health: no broken requirements and no known vulnerabilities;
- compile, critical Flake8, bounded MyPy, Black, and isort stages passed; and
- complete backend suite: **961 passed, 15 skipped, 14 subtests passed in
  20.56s**.

The run is exact-current-main evidence for repository backend quality. Its
skips and lack of a persistent staging environment remain limits.

### Isolated transaction workflow evidence

PR #164 follow-up run
[`31054621081`](https://github.com/batakers/Niuva/actions/runs/31054621081),
job [`92469314161`](https://github.com/batakers/Niuva/actions/runs/31054621081/job/92469314161),
checked out the replica-set transaction environment and reported:

```text
76 passed in 6.02s
```

The B2B/catalog conflict paths exercised by that follow-up are unchanged from
its head `d4c144b7` to current `d4bf4ac`.

PR #166 transaction run
[`31054981154`](https://github.com/batakers/Niuva/actions/runs/31054981154),
job [`92470418730`](https://github.com/batakers/Niuva/actions/runs/31054981154/job/92470418730),
also completed the isolated MongoDB replica-set procedure and reported:

```text
76 passed in 5.60s
```

The transaction execution/guard/observability paths exercised by that run are
unchanged from its head `17dd1f6c` to current `d4bf4ac`.

The transaction workflow is PR/path triggered and did not run as a separate
workflow on the current documentation-only merge. The exact-current backend
quality run and the two path-preserving isolated runs are therefore reported
separately rather than combined into a misleading single exact-head claim.

### Contract matrix

| G1 contract | Source/test evidence | Current verdict | Remaining limit |
| --- | --- | --- | --- |
| Transaction-required mutation fails closed when capability is unavailable | Transaction guard/execution source and current backend/isolated transaction suites | `PASS WITH REPOSITORY EVIDENCE` | Staging topology, persistence, readiness, and monitoring are unproven |
| Atomicity and rollback behavior | Replica-set transaction workflow and current backend suite | `PASS WITH REPOSITORY EVIDENCE` | No staging/production rollback exercise or data-recovery rehearsal |
| Conflict/retry/idempotency | PR #164 B2B/catalog conflict paths; PR #166 transaction paths; current backend suite | `PASS WITH PATH-PRESERVING EVIDENCE` | Independent review and external workload evidence are absent |
| B2B stale inquiry conversion | Current `b2b_service.py` and `test_b2b_quote_conversion.py`; PR #164 path-preserving run | `PASS WITH REPOSITORY EVIDENCE` | No staging role/fixture matrix or external consumer compatibility proof |
| Catalog duplicate publication | Current `catalog_service.py` and `test_catalog_routes.py`; PR #164 path-preserving run | `PASS WITH REPOSITORY EVIDENCE` | No shared/staging data mutation or operational rollback evidence |
| Customer-safe projection and authorization | Current backend suite, source contract, and access decisions | `PARTIAL / REQUIRES MATRIX HANDOVER` | Direct seeded-role API matrix and independent verifier are not recorded in this packet |
| Bounded transaction telemetry | Current transaction observability source/tests and backend quality gate | `PASS WITH REPOSITORY EVIDENCE` | Production destination, retention, alerting, SLO, and owner remain open |
| Migration/data integrity | Read-only source/runbook boundaries only | `NOT RUN` | No target, backup, restore, apply, or representative data authorization |

## 4. G1 decision and operational limits

The bounded repository integrity contract is supported by current source and
CI evidence. This is not a production authorization because the following
remain unproven or unassigned:

- dedicated staging replica-set topology, persistence, schema/index readiness,
  monitoring, and transaction capability;
- seeded role/fixture accounts and an independent authorization/projection
  review;
- backup custody, restore validation, RPO/RTO, incident ownership, and a
  redeploy-only application rollback exercise;
- external consumer/probe ownership and compatibility/sunset evidence;
- migration target, window, dry run, validation, restore, and rollback;
- storage/payment/provider/Finance activation and all Retail checkout paths;
- telemetry destination, retention, SLO/error budget, alert route, and
  accountable operations owner; and
- DR-001 candidate selection and independent release verification.

No non-atomic fallback, provider, secret, migration, or production topology is
inferred from the passing tests.

## 5. Handover

### Changed

- `docs/implementation/production-readiness/phases/G1-CURRENT-MAIN-BACKEND-INTEGRITY-REVALIDATION-2026-08-06.md`

### Intentionally unchanged

- all G1 runtime paths and tests, including transaction, B2B, catalog, and
  observability source;
- backend migrations, shared server/readiness/notification handlers,
  dependencies, workflows, deployment configuration, providers, credentials,
  secrets, data, and environments;
- canonical specifications, decision registers, ADRs, runbooks,
  `DECISIONS_REQUIRED.md`, and existing G0–G5 packets;
- all branches and worktrees owned by parallel chats.

### Verification and limits

- fresh current-main worktree, exact SHA/tree, and zero divergence: passed;
- exact current-main backend quality run: passed, `961 passed, 15 skipped, 14
  subtests`;
- path-preserving isolated transaction runs: passed, `76` each at PR #164
  follow-up and PR #166 heads;
- local full backend suite in this fresh worktree: not rerun because no local
  backend environment was provisioned; exact CI evidence is cited instead;
- staging, external role/projection, migration, backup/restore, provider,
  monitoring, independent review, deployment, and go-live: not run or
  authorized.

### Risk and rollback

This packet changes no runtime or operational state. Its rollback is a normal
documentation revert. The main risk is evidence staleness or overextension of
local/CI path evidence into staging/production claims; a selected candidate
must be revalidated at one exact SHA.

### External actions still requiring approval

Project Owner DR-001 selection, seeded staging fixture and independent backend
review, staging topology/access, backup/restore, migration execution, external
consumer compatibility review, provider activation, secret use/rotation,
deployment, production-readiness approval, and go-live.

<!-- markdownlint-enable MD013 MD060 -->
