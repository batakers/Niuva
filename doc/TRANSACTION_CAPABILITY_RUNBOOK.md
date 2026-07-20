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

## Final Verification

Run this sequence from the repository root. During the NIV-001 freeze, do not
run network Git commands. The approved-plan merge is retained only as
provenance, while the clean-clone `main` commit is the implementation-scope
baseline:

```powershell
$planProvenance = "9e3bdf6942fac54425aa6cda553dcb5455c5300b"
$reviewedPlanBaseline = "74b2d7c689db7c033a405b329b5844977795c767"

if ((git show -s --format=%s $planProvenance) -ne "Merge pull request #5 from batakers/plan/foundation-transaction-capability") {
    throw "Unexpected approved-plan provenance"
}
if ((git rev-parse $reviewedPlanBaseline) -ne $reviewedPlanBaseline) {
    throw "Implementation-scope baseline is unavailable"
}
git merge-base --is-ancestor $planProvenance $reviewedPlanBaseline
if ($LASTEXITCODE -ne 0) { throw "Plan provenance is not retained by the clean baseline" }
git merge-base --is-ancestor $reviewedPlanBaseline HEAD
if ($LASTEXITCODE -ne 0) { throw "Current HEAD does not descend from the clean baseline" }
```

Validate both Compose definitions, start the isolated `rs-test` topology, run
the real tests with an explicit no-skip check, then run the complete backend
suite and focused quality gates. Cleanup is in `finally`, so it runs after
success or failure.

```powershell
function Assert-LastExitCode([string]$step) {
    if ($LASTEXITCODE -ne 0) { throw "$step failed with exit code $LASTEXITCODE" }
}

try {
    docker compose -f docker-compose.transaction.yml config --quiet
    Assert-LastExitCode "local Compose validation"
    docker compose -f docker-compose.transaction-test.yml config --quiet
    Assert-LastExitCode "test Compose validation"
    docker compose -f docker-compose.transaction-test.yml up -d
    Assert-LastExitCode "rs-test startup"
    $primaryReady = $false
    foreach ($attempt in 1..60) {
        docker compose -f docker-compose.transaction-test.yml exec -T mongodb-test `
            mongosh --quiet --port 27018 `
            --eval 'quit(db.hello().isWritablePrimary ? 0 : 1)'
        if ($LASTEXITCODE -eq 0) {
            $primaryReady = $true
            break
        }
        Start-Sleep -Seconds 1
    }
    if (-not $primaryReady) {
        docker compose -f docker-compose.transaction-test.yml logs
        throw "rs-test did not become writable primary"
    }

    $env:MONGO_TRANSACTION_TEST_URL = "mongodb://127.0.0.1:27018/?replicaSet=rs-test&directConnection=true"
    $realOutput = @(
        .\backend\.venv\Scripts\python.exe -m pytest -n 0 -q `
            backend\tests\test_transaction_integration.py `
            backend\tests\test_inventory_transactions.py 2>&1
    )
    $realExitCode = $LASTEXITCODE
    $realOutput | Write-Output
    if ($realExitCode -ne 0) { throw "real rs-test suite failed with exit code $realExitCode" }
    if (($realOutput -join "`n") -match "(?i)\bskipped?\b") {
        throw "real rs-test suite reported a skip"
    }
    Remove-Item Env:MONGO_TRANSACTION_TEST_URL -ErrorAction SilentlyContinue

    .\backend\.venv\Scripts\python.exe -m pytest -q `
        --basetemp C:\tmp\niuva-transaction-final backend\tests
    Assert-LastExitCode "complete backend suite"

    $transactionTests = @(
        Get-ChildItem backend\tests\test_transaction_*.py |
            Select-Object -ExpandProperty FullName
    )
    .\backend\.venv\Scripts\python.exe -m black --check `
        backend\database_capabilities.py `
        backend\transaction_api.py `
        backend\transaction_execution.py `
        backend\transaction_guard.py `
        backend\transaction_observability.py `
        @transactionTests
    Assert-LastExitCode "Black"

    .\backend\.venv\Scripts\python.exe -m flake8 `
        backend\database_capabilities.py `
        backend\transaction_api.py `
        backend\transaction_execution.py `
        backend\transaction_guard.py `
        backend\transaction_observability.py `
        @transactionTests
    Assert-LastExitCode "Flake8"

    .\backend\.venv\Scripts\python.exe -m mypy `
        --ignore-missing-imports --check-untyped-defs `
        backend\database_capabilities.py `
        backend\transaction_api.py `
        backend\transaction_execution.py `
        backend\transaction_guard.py `
        backend\transaction_observability.py
    Assert-LastExitCode "mypy"
    .\backend\.venv\Scripts\python.exe -m pip check
    Assert-LastExitCode "pip check"
    git diff --check
    Assert-LastExitCode "working-tree whitespace check"
    git diff --cached --check
    Assert-LastExitCode "index whitespace check"
} finally {
    docker compose -f docker-compose.transaction-test.yml down --volumes --remove-orphans
    $cleanupExitCode = $LASTEXITCODE
    Remove-Item Env:MONGO_TRANSACTION_TEST_URL -ErrorAction SilentlyContinue
    if ($cleanupExitCode -ne 0) {
        Write-Error "rs-test cleanup failed with exit code $cleanupExitCode"
    }
}
```

Expected evidence is two valid Compose configurations, two passing real test
modules with no skip, zero failures in the complete backend suite, clean
Black/Flake8/mypy results, no broken requirements, and no whitespace errors.

Audit exact implementation scope without contacting a remote:

```powershell
$expectedPaths = @(
    ".github/workflows/transaction-tests.yml",
    "backend/.env.example",
    "backend/database_capabilities.py",
    "backend/server.py",
    "backend/tests/conftest.py",
    "backend/tests/test_database_capabilities.py",
    "backend/tests/test_health.py",
    "backend/tests/test_inventory_transactions.py",
    "backend/tests/test_transaction_documentation.py",
    "backend/tests/test_transaction_error_contract.py",
    "backend/tests/test_transaction_execution.py",
    "backend/tests/test_transaction_guard.py",
    "backend/tests/test_transaction_integration.py",
    "backend/tests/test_transaction_observability.py",
    "backend/tests/test_transaction_topology_files.py",
    "backend/transaction_api.py",
    "backend/transaction_execution.py",
    "backend/transaction_guard.py",
    "backend/transaction_observability.py",
    "doc/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md",
    "doc/PRODUCTION_DEPLOYMENT.md",
    "doc/TRANSACTION_CAPABILITY_RUNBOOK.md",
    "docker-compose.transaction-test.yml",
    "docker-compose.transaction.yml",
    "scripts/mongodb/init-replica-set.js",
    "scripts/mongodb/init-test-replica-set.js",
    "scripts/mongodb/reset-local-replica-set.ps1",
    "scripts/mongodb/wait-for-replica-set.ps1"
)
$actualPaths = @(git diff --name-only "$reviewedPlanBaseline...HEAD")
$pathDiff = @(Compare-Object ($expectedPaths | Sort-Object) ($actualPaths | Sort-Object))
if ($pathDiff.Count -ne 0) { throw "Implementation file scope differs: $($pathDiff | Out-String)" }

$frontendPaths = @(git diff --name-only "$reviewedPlanBaseline...HEAD" -- frontend)
if ($frontendPaths.Count -ne 0) { throw "Unexpected frontend scope: $($frontendPaths -join ', ')" }
```

`backend/tests/test_inventory_transactions.py` is the approved Task 6
correction exposed by the mandatory real topology. It changes stale test
expectations only; it does not change production behavior.

The scope report must include the ten task commits, both review-fix commits,
and the focused quality-gate commit. The following check accepts the state
immediately before or after the final Task 10 commit and rejects any other
sequence:

```powershell
$expectedSubjects = @(
    "feat: add mongodb transaction capability detection",
    "fix: harden transaction capability cleanup",
    "feat: add mongodb transaction execution boundary",
    "feat: define transaction unavailable API contract",
    "feat: expose transaction readiness diagnostics",
    "chore: configure local mongodb replica set",
    "ci: run transaction tests against mongodb replica set",
    "fix: harden transaction test topology startup",
    "feat: add fail-closed transaction mutation guard",
    "feat: add safe transaction lifecycle diagnostics",
    "docs: document transaction-capable development setup",
    "style: satisfy transaction quality gates",
    "docs: finalize transaction verification and rollback"
)
$actualSubjects = @(git log --reverse --format=%s "$reviewedPlanBaseline..HEAD")
if ($actualSubjects.Count -eq ($expectedSubjects.Count - 1)) {
    $expectedAtThisStage = @($expectedSubjects[0..($expectedSubjects.Count - 2)])
} elseif ($actualSubjects.Count -eq $expectedSubjects.Count) {
    $expectedAtThisStage = $expectedSubjects
} else {
    throw "Unexpected implementation commit count: $($actualSubjects.Count)"
}
$subjectDiff = @(Compare-Object $expectedAtThisStage $actualSubjects -SyncWindow 0)
if ($subjectDiff.Count -ne 0) { throw "Implementation commit sequence differs: $($subjectDiff | Out-String)" }

git diff --name-status "$reviewedPlanBaseline...HEAD"
git log --oneline "$reviewedPlanBaseline..HEAD"
git status --short
```

No path may implement Retail Checkout, payment, shipping, tax, refund,
production storage, frontend behavior, migration, or production enablement.
Before the Task 10 commit, `git status --short` may list only the two reviewed
Task 10 files. After that commit it must be empty.

## Level 1 — Code Rollback

Use revert commits; do not reset shared history. Specifically, do not roll back committed database records. A code rollback preserves transaction, publication,
inventory, reservation, movement, audit, and other committed database data.
Start only from a clean reviewed branch, then locate the exact local
implementation commits by subject and revert them newest-first:

```powershell
if (git status --porcelain) { throw "Rollback requires a clean worktree" }

$subjects = @(
    "docs: finalize transaction verification and rollback",
    "style: satisfy transaction quality gates",
    "docs: document transaction-capable development setup",
    "feat: add safe transaction lifecycle diagnostics",
    "feat: add fail-closed transaction mutation guard",
    "fix: harden transaction test topology startup",
    "ci: run transaction tests against mongodb replica set",
    "chore: configure local mongodb replica set",
    "feat: expose transaction readiness diagnostics",
    "feat: define transaction unavailable API contract",
    "feat: add mongodb transaction execution boundary",
    "fix: harden transaction capability cleanup",
    "feat: add mongodb transaction capability detection"
)
foreach ($subject in $subjects) {
    $matches = @(
        git log "$reviewedPlanBaseline..HEAD" --format="%H`t%s" |
            Where-Object { ($_ -split "`t", 2)[1] -eq $subject }
    )
    if ($matches.Count -ne 1) { throw "Expected one task commit for: $subject" }
    $sha = ($matches[0] -split "`t", 2)[0]
    git revert --no-edit $sha
    if ($LASTEXITCODE -ne 0) { throw "Revert failed for: $subject" }
}
```

Run the complete backend regression after the reverts and deploy only a
reviewed, known-good artifact. The revert sequence changes code history; it
must not delete or rewrite committed database evidence.

## Level 2 — Runtime Mutation Disablement

For each service that has explicitly adopted `TransactionMutationGuard`, set
the server-side value to false and restart that service through its separately
approved environment-management process:

```powershell
$env:TRANSACTION_MUTATIONS_ENABLED="false"
```

Then verify:

1. `GET /api/health/live` returns `200`.
2. Safe read-only/public operations remain available.
3. A guard contract request returns `503 transaction_unavailable` before its
   callback executes.
4. Allowlisted logs record `transaction_rejected` without connection,
   request, provider, or customer data.
5. No writer switches to direct non-transactional collection calls.

The flag applies only to consumers that explicitly adopted the guard.
Existing catalog and inventory transaction code remains under its current
capability gate until a separate behavior-preserving adoption review.
Runtime disablement does not enable a non-atomic fallback. Keep guarded
mutation disabled until capability, tests, review, and operational approval
are restored.
