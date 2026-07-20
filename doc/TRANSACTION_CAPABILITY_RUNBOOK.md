# MongoDB Transaction Capability Runbook

Status: Development and CI foundation only.

This runbook implements the internal architecture direction in
`doc/decisions/ADR-001-mongodb-transaction-capability.md`. It does not
authorize production infrastructure, production mutation enablement, or
production go-live.

Retail Checkout remains **Technical Design Candidate — not approved for implementation**.
This runbook does not implement checkout, payment, shipping, tax, refunds, or
production storage.

## Contracts

- Transaction-required cross-collection mutations use the shared
  `TransactionMutationGuard` and `TransactionExecutor`.
- Capability rejection returns `503 transaction_unavailable` before the
  callback executes.
- The default callback retry mode is no retry. A caller must explicitly mark
  a callback retry-safe before `TransientTransactionError` may rerun it.
- `UnknownTransactionCommitResult` retries only `commit_transaction`; it never
  reruns the callback or starts a replacement transaction.
- If commit attempts are exhausted, `TransactionCommitOutcomeUnknownError`
  records `transaction_commit_outcome_unknown`, reconciliation is required,
  and emits `transaction_commit_unknown` with outcome `unknown`.
- An unknown commit outcome is not aborted, is not mapped to
  `503 transaction_unavailable`, and must not be retried automatically because
  the mutation may already have committed.
- Standalone MongoDB remains limited to reads or operations proven safe as
  single-document atomic writes.
- Structured transaction logs pass correlation IDs through
  `safe_correlation_id`, which accepts canonical UUID text case-insensitively
  and emits a canonical lowercase UUID. Invalid or noncanonical input becomes
  `correlation_id=None`.
- Only trusted server-side code may supply a correlation UUID. Authorization headers,
  cookies, query parameters, request bodies, customer data, and provider/payment
  payloads are never correlation-ID sources.
- A silent non-atomic fallback is prohibited.

## Local single-node replica set

From the repository root:

```powershell
docker compose -f docker-compose.transaction.yml up -d
.\scripts\mongodb\wait-for-replica-set.ps1 -TimeoutSeconds 60
```

Use:

```env
MONGO_URL=mongodb://127.0.0.1:27017/?replicaSet=rs0&directConnection=true
DB_NAME=niuva
TRANSACTION_MUTATIONS_ENABLED=false
```

Keep `TRANSACTION_MUTATIONS_ENABLED=false` until capability verification is
ready and the specific mutation consumer has passed its review gate. Setting
the flag to `true` never bypasses the live capability probe.

The local initializer sidecar uses
`mongodb://mongodb:27017/admin?directConnection=true` for this one-member
topology.

The named volume `niuva_mongodb_data` preserves local development data across
ordinary `docker compose down` and restart operations.

## Readiness verification

- `GET /api/health` remains the backward-compatible summary.
- `GET /api/health/live` proves the API process is serving and does not depend
  on transaction capability.
- `GET /api/health/ready` returns `status=ready` and
  `transaction_mutations=ready` only when the read-only session/transaction
  probe succeeds.
- A degraded transaction capability does not disable safe public reads.
- Transaction-required mutations remain fail closed.

Health responses contain only capability availability, safe reason, and check
time. They do not include credentials, connection strings, replica-set member
details, raw `hello` responses, or customer data.

## Isolated transaction tests

Start the ephemeral test topology:

```powershell
docker compose -f docker-compose.transaction-test.yml up -d
$env:MONGO_TRANSACTION_TEST_URL = "mongodb://127.0.0.1:27018/?replicaSet=rs-test&directConnection=true"
.\backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_integration.py backend\tests\test_inventory_transactions.py
```

Always clean it after the test:

```powershell
docker compose -f docker-compose.transaction-test.yml down --volumes --remove-orphans
Remove-Item Env:MONGO_TRANSACTION_TEST_URL -ErrorAction SilentlyContinue
```

The test initializer sidecar uses
`mongodb://mongodb-test:27018/admin?directConnection=true`.

The test topology uses `tmpfs`. Each test receives a database name containing
the xdist worker, test name, and UUID, and drops only that database in
`finally`.

## CI expectation

`.github/workflows/transaction-tests.yml` starts `rs-test`, waits for a
writable primary, sets `MONGO_TRANSACTION_TEST_URL`, and runs both real
transaction modules without `continue-on-error`. A skipped real transaction
module is not acceptable CI evidence because the workflow always supplies the
URL.

## Development reset and recovery

Ordinary restart:

```powershell
docker compose -f docker-compose.transaction.yml down
docker compose -f docker-compose.transaction.yml up -d
.\scripts\mongodb\wait-for-replica-set.ps1
```

Destructive reset is never automatic. Stop the application, verify that the
target is development-only, then run:

```powershell
.\scripts\mongodb\reset-local-replica-set.ps1 -DestroyData
```

PowerShell displays a high-impact confirmation. This deletes the local named
volume and must never be used against staging or production data.

## Troubleshooting

| Symptom | Safe check | Action |
|---|---|---|
| `transaction_reason=replica_set_required` | Confirm the local URI includes `replicaSet=rs0&directConnection=true` and run the wait script | Start the tracked local topology; do not enable mutation |
| `transaction_reason=sessions_required` | Inspect `GET /api/health/ready` only | Use MongoDB 7 replica-set topology; do not fall back |
| `transaction_reason=probe_failed` | Review allowlisted server logs and container health | Restore connectivity/permissions; never expose the URL in a ticket |
| Real test module skipped | Check `MONGO_TRANSACTION_TEST_URL` | Start `rs-test` and rerun; a skip is not a pass |
| Init container exits nonzero with existing config | Read container logs without credentials | Preserve data and inspect the existing replica-set config; initializer never calls `rs.reconfig` |
| `transaction_commit_unknown` | Confirm the allowlisted operation, correlation UUID when present, and commit-attempt count only | Reconcile against authoritative domain state; do not abort, rerun the mutation, or claim committed/aborted |
| Callback fails | Confirm abort event and application error | Fix the caller; do not rerun a non-idempotent callback implicitly |

## Known Limitations

- Existing catalog and inventory services still own their current transaction
  code. Their later migration to the shared guard requires a separate
  behavior-preserving review; this foundation does not silently rewrite them.
- The repository has no established metrics subsystem or request-ID
  middleware. This foundation emits allowlisted structured log records; most
  transaction calls therefore use `correlation_id=None`. A correlation ID is
  present only when trusted server-side code supplies a canonical UUID, never
  by copying raw request or business payload material.
- The tracked Compose topology is for local development and CI only.
  `directConnection=true is limited to tracked single-node environments`; it
  does not define the staging or production connection model.
- Staging and production must use separately approved topology discovery and
  connection settings.
- Staging/production topology, persistence, monitoring, backup/restore,
  incident ownership, and production readiness remain open.
- This foundation does not authorize production infrastructure.
- This foundation does not authorize production go-live.
