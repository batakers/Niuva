# Foundation Transaction Capability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a tested, reusable, fail-closed MongoDB transaction
capability foundation for transaction-required platform mutations.

**Architecture:** Extend the existing asynchronous Motor integration with a read-only capability probe, a centralized transaction executor, and a thin mutation guard composed in `backend/server.py`. Keep liveness available when transaction capability is degraded, expose a separate safe readiness projection, and provide deterministic MongoDB 7 replica-set topology for local development and isolated CI without changing catalog or inventory business rules.

**Tech Stack:** CPython `3.14.3`; FastAPI `0.110.1`; Motor `3.3.1`; PyMongo `4.6.3`; pytest `>=8.0.0`; pytest-xdist `>=3.6.0`; MongoDB `7`; Docker Compose; Windows PowerShell.

## Global Constraints

- MongoDB replica-set multi-document transactions are required for cross-collection mutations that require atomicity.
- Local mutation development uses the single-node `rs0` URI `mongodb://127.0.0.1:27017/?replicaSet=rs0&directConnection=true`.
- CI uses the isolated single-node `rs-test` URI `mongodb://127.0.0.1:27018/?replicaSet=rs-test&directConnection=true`.
- `directConnection=true` is restricted to these tracked single-node local and isolated-test environments; it does not define the staging or production connection model.
- The dedicated transaction CI job pins CPython `3.14.3`; it must not float to another patch release without new baseline evidence.
- Staging and production require transaction capability before affected mutation functionality may be enabled.
- Standalone MongoDB is permitted only for read-only behavior or operations proven safe as single-document atomic writes.
- Transaction-required requests fail closed with `503 transaction_unavailable`.
- Silent fallback to non-atomic writes is prohibited.
- Startup or readiness diagnostics must expose transaction capability.
- The transaction abstraction must support session creation, commit, abort, retries only where safe, and deterministic cleanup.
- Transaction-required operations must not partially mutate state when transaction capability is unavailable.
- The capability probe is read-only and must not mutate business data.
- A callback is retryable only when the caller explicitly selects `RetryMode.DRIVER_TRANSIENT`; the default is `RetryMode.NEVER`.
- No provider credentials, connection strings, topology details, stack traces, customer payloads, uploaded file content, payment data, or sensitive tokens may appear in client errors or transaction logs.
- Existing public website, Admin Studio, authentication, dashboard, order, storage, and unrelated API behavior remain unchanged.
- Retail Checkout remains `Technical Design Candidate — not approved for implementation`.
- Do not implement Retail Checkout, payment orchestration, shipping, tax, refunds, production storage, production infrastructure, or production enablement.
- Do not introduce a repository layer or redesign unrelated database access.
- No new runtime dependency is required; use the versions already declared in `backend/requirements.txt`.

---

## Repository Evidence

### Verified baseline

- Planning baseline is `origin/main` at `983d1206592b38989aafa8379e074db2f251f81e`; merged PR #3 and PR #4 are present and `92913ef74555ffe91b7383bed52965250e030cad` is an ancestor.
- Backend setup used an isolated `backend/.venv` and the declared `backend/requirements.txt`. The environment reported CPython `3.14.3`, FastAPI `0.110.1`, Motor `3.3.1`, PyMongo `4.6.3`, and pytest `9.1.1`; `python -m compileall -q backend` passed, `pip check` reported no broken requirements, and the complete backend suite reported `111 passed, 2 skipped`. The official `actions/python-versions` manifest marks `3.14.3` stable and provides Linux x64 artifacts for Ubuntu 22.04 and 24.04.
- Frontend setup used `npm ci` from `frontend/package-lock.json`. Jest reported `28 passed`, and `npm run build` compiled successfully.
- `backend/tests/test_inventory_transactions.py` is skipped when `MONGO_TRANSACTION_TEST_URL` is absent (`backend/tests/test_inventory_transactions.py:6-12`). The verified planning environment had no such variable and the Docker daemon was unavailable, so the focused real-transaction run reported one skipped module. Task 6 closes this topology and CI evidence gap.

### Current architecture

- The backend is a FastAPI modular monolith. `backend/server.py:17-38` constructs one process-global `AsyncIOMotorClient`, selects `DB_NAME`, and passes database/client/capability providers into route builders at `backend/server.py:704-748`.
- The execution model is asynchronous Motor. Repository pins Motor `3.3.1` and PyMongo `4.6.3` in `backend/requirements.txt:7,14`.
- Database capability state is currently a single Boolean in `backend/database_capabilities.py:4-20`. The probe only evaluates `hello.setName` and `logicalSessionTimeoutMinutes`; it does not open a session or execute a read within a transaction.
- Startup at `backend/server.py:881-891` initializes storage, seeds data, runs the Boolean capability probe, creates indexes, and starts background jobs. The MongoDB client closes at shutdown (`backend/server.py:893-902`).
- `GET /api/health` currently returns `{"status":"ok","transactions":<bool>}` (`backend/server.py:699-701`). There is no backend liveness/readiness split.
- Existing error envelopes for catalog and inventory use FastAPI's `detail` object with stable `code` and `message` fields (`backend/catalog_routes.py:102-111`, `backend/inventory_routes.py:85-92`). Current transaction rejection is `503` plus `transaction_unavailable` in `backend/catalog_service.py:471-478` and `backend/inventory_service.py:88-95`.
- Catalog mutations own four direct session/transaction blocks at `backend/catalog_service.py:296-337`, `411-452`, `505-534`, and `563-593`. Inventory owns transaction blocks and transient-label retry logic at `backend/inventory_service.py:177-237` and `689-724`.
- Current inventory retry checks only `TransientTransactionError` and is embedded in business service logic (`backend/inventory_service.py:223-235`). There is no centralized commit retry for `UnknownTransactionCommitResult` and no shared explicit retry-safety contract.
- Cross-collection write locations include catalog publication/pointer/audit writes (`backend/catalog_service.py:508-530`, `566-589`) and inventory balance/movement/reservation/audit/restock/notification writes (`backend/inventory_service.py:306-404`, `503-607`). These remain future consumers of the new guard; this plan does not rewrite their business rules.
- Unit/API tests primarily use in-memory fakes. The real replica-set test creates a UUID-scoped database and drops it in `finally` (`backend/tests/test_inventory_transactions.py:36-117`). No shared `conftest.py` transaction topology fixture exists.
- Local configuration defaults to standalone `mongodb://127.0.0.1:27017` in `backend/.env.example:1`. The runbook requires a MongoDB 7 replica set but supplies no Compose topology (`doc/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md:13-23,164-169`).
- There are no tracked Docker/Compose files and no tracked `.github` workflow. CI transaction topology is therefore absent.
- Logging uses the standard library and a plain text root formatter (`backend/server.py:34-35`). Transaction lifecycle events are not logged, request/correlation IDs are not established, and no metrics library or metrics endpoint exists.

### Gaps against ADR-001

1. Capability detection does not prove usable session and transaction behavior.
2. Capability state has no safe reason, timestamp, or stable diagnostic projection.
3. Session/commit/abort/retry policy is duplicated across domain services.
4. Callback retry safety is implicit rather than explicitly declared.
5. Liveness and transaction-required mutation readiness are conflated.
6. Local and CI replica-set topology is documented as required but not reproducible from tracked files.
7. The real transaction suite can silently remain skipped outside a correctly configured environment.
8. Transaction lifecycle and failure classification lack safe structured operational events.

## Target File Map

| Action | Path | Single responsibility and public symbols | Covered by | Dependents |
|---|---|---|---|---|
| Modify | `backend/database_capabilities.py` | Capability model and read-only probe: `TransactionCapabilityReason`, `DatabaseCapabilities`, `supports_transactions`, `probe_database_capabilities` | `backend/tests/test_database_capabilities.py` | Tasks 2, 4, 7 |
| Modify | `backend/tests/test_database_capabilities.py` | Unit coverage for replica set, logical sessions, read-only transaction, and safe failure reasons | itself | Task 4 |
| Create | `backend/transaction_execution.py` | Central lifecycle, retry, and reconciliation policy: `RetryMode`, `TransactionUnavailableError`, `TransactionCommitOutcomeUnknownError`, `TransactionExecutor` | `backend/tests/test_transaction_execution.py` | Tasks 3, 7, 8 |
| Create | `backend/tests/test_transaction_execution.py` | Unit coverage for fail-closed gating, commit-only retry, exhausted unknown commit outcome, abort, cleanup, and explicit callback retry | itself | Tasks 3, 7, 8 |
| Create | `backend/transaction_api.py` | Public mapping only for `TransactionUnavailableError`: `TRANSACTION_UNAVAILABLE_DETAIL`, `transaction_unavailable_handler`; no public mapping for unknown commit outcome | `backend/tests/test_transaction_error_contract.py` | Task 7 |
| Create | `backend/tests/test_transaction_error_contract.py` | Stable `503` response, information-leak tests, and proof that unknown commit outcome remains internal | itself | Task 7 |
| Modify | `backend/server.py` | Composition root, startup capability state, safe health/readiness endpoints, and guard wiring | `backend/tests/test_health.py`, `backend/tests/test_transaction_error_contract.py` | Tasks 4, 7, 8 |
| Modify | `backend/tests/test_health.py` | Backward-compatible health, liveness, and degraded/ready transaction diagnostics | itself | Task 7 |
| Create | `docker-compose.transaction.yml` | Persistent local single-node MongoDB 7 replica set with deterministic direct host and initializer connections | `backend/tests/test_transaction_topology_files.py` | Tasks 6, 9 |
| Create | `scripts/mongodb/init-replica-set.js` | Idempotent non-destructive local `rs0` initialization | topology test | Tasks 6, 9 |
| Create | `scripts/mongodb/wait-for-replica-set.ps1` | PowerShell readiness polling with timeout | topology test | Task 9 |
| Create | `scripts/mongodb/reset-local-replica-set.ps1` | Explicitly gated destructive local-volume reset | topology test | Task 9 |
| Modify | `backend/.env.example` | Direct single-node replica-set local URI and isolated transaction-test variable documentation | topology test | Tasks 6, 9 |
| Create | `backend/tests/test_transaction_topology_files.py` | Static contracts for replica-set names, deterministic direct connections, isolation, and safe reset behavior | itself | Tasks 6, 9 |
| Create | `docker-compose.transaction-test.yml` | Ephemeral isolated MongoDB 7 replica set with deterministic direct host and initializer connections | topology test and integration test | Task 6 |
| Create | `scripts/mongodb/init-test-replica-set.js` | Idempotent `rs-test` initialization for the isolated topology | topology test | Task 6 |
| Create | `backend/tests/conftest.py` | Unique xdist-aware transaction database naming | integration test | Task 6 |
| Create | `backend/tests/test_transaction_integration.py` | Real commit/abort/probe evidence against isolated replica set | itself | Tasks 7, 10 |
| Create | `.github/workflows/transaction-tests.yml` | CI setup, readiness polling, and mandatory real transaction test command | topology test | Task 10 |
| Create | `backend/transaction_guard.py` | Thin mutation entry point: `TransactionMutationGuard.run` | `backend/tests/test_transaction_guard.py` | Future catalog/inventory adoption |
| Create | `backend/tests/test_transaction_guard.py` | Contract coverage for guarded and explicitly unguarded safe operations | itself | Task 10 |
| Create | `backend/transaction_observability.py` | Allowlisted sink, trusted UUID correlation normalization, and unknown-commit reconciliation event: `safe_correlation_id`, `TransactionLogSink` | `backend/tests/test_transaction_observability.py` | Task 7 composition |
| Create | `backend/tests/test_transaction_observability.py` | Lifecycle, unknown-commit, UUID correlation, untrusted-source omission, and forbidden-field coverage | itself | Task 10 |
| Create | `doc/TRANSACTION_CAPABILITY_RUNBOOK.md` | Direct single-node local/CI setup, reconciliation, trusted-correlation guidance, verification, troubleshooting, limitations, and rollback | pointer validation | Task 10 |
| Create | `backend/tests/test_transaction_documentation.py` | Runbook setup, direct-connection scope, reconciliation, security, and two-level rollback contract tests | itself | Task 10 |
| Modify | `doc/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md` | Point existing foundation operators to the canonical topology/runbook | pointer validation | Task 10 |
| Modify | `doc/PRODUCTION_DEPLOYMENT.md` | State capability/feature gates without claiming production readiness | pointer validation | Task 10 |

## Dependency Graph

```text
Task 1 capability model/probe ──┬──> Task 2 executor ──> Task 3 API contract
                               │          │                    │
                               ├──> Task 4 readiness           │
Task 5 local topology ─────────┴──> Task 6 test/CI topology    │
Task 2 + Task 3 + Task 4 ─────────> Task 7 mutation guard/composition
Task 2 ────────────────────────────> Task 8 observability
Tasks 4–8 ─────────────────────────> Task 9 documentation
Tasks 1–9 ─────────────────────────> Task 10 E2E verification/rollback
```

Tasks 1 and 5 may start in parallel. Task 3 may start after Task 2 publishes both `TransactionUnavailableError` and `TransactionCommitOutcomeUnknownError`; only the former receives a public mapping. Task 4 may start after Task 1 publishes the diagnostic schema. Task 6 depends on Task 5's topology conventions but uses a separate ephemeral Compose file. Tasks 7 and 8 start only after the core interfaces from Tasks 1–4 are reviewed; Task 8 consumes the unknown-outcome exception for safe reconciliation logging.

### Task 1: Transaction capability model and read-only detection

**Owner:** Developer 2 — Transaction Core Owner

**Files:**
- Modify: `backend/database_capabilities.py:1-20`
- Modify: `backend/tests/test_database_capabilities.py:1-34`

**Interfaces:**
- Consumes: Motor-compatible `client.admin.command`, `client.start_session`, and `client[database_name].command`.
- Produces: `TransactionCapabilityReason(str, Enum)`; `DatabaseCapabilities(transactions: bool, transaction_reason: TransactionCapabilityReason, checked_at: str | None)`; `DatabaseCapabilities.transaction_diagnostic() -> dict[str, bool | str | None]`; `supports_transactions(hello: dict) -> bool`; `probe_database_capabilities(client, database_name: str, *, clock: Callable[[], datetime] = utc_now) -> DatabaseCapabilities`.
- Compatibility: retain `probe_transaction_capability(client) -> bool` until Task 4 moves startup to `probe_database_capabilities`.
- Ownership: this module detects capability only; it never executes business callbacks.

- [ ] **Step 1: Write the failing capability tests**

Replace `backend/tests/test_database_capabilities.py` with:

```python
import asyncio
from datetime import datetime, timezone

from pymongo.errors import ServerSelectionTimeoutError

from database_capabilities import (
    DatabaseCapabilities,
    TransactionCapabilityReason,
    probe_database_capabilities,
    probe_transaction_capability,
    supports_transactions,
)


FIXED_TIME = datetime(2026, 7, 17, 9, 0, tzinfo=timezone.utc)


class FakeSession:
    def __init__(self):
        self.started = False
        self.committed = False
        self.aborted = False
        self.ended = False

    def start_transaction(self):
        self.started = True

    async def commit_transaction(self):
        self.committed = True

    async def abort_transaction(self):
        self.aborted = True

    async def end_session(self):
        self.ended = True


class FakeDatabase:
    def __init__(self, session, *, fail=False):
        self.session = session
        self.fail = fail
        self.commands = []

    async def command(self, name, collection, **kwargs):
        self.commands.append((name, collection, kwargs))
        assert name == "find"
        assert collection == "__transaction_capability_probe__"
        assert kwargs["filter"] == {"_id": "__read_only_probe__"}
        assert kwargs["limit"] == 1
        assert kwargs["session"] is self.session
        if self.fail:
            raise ServerSelectionTimeoutError("mongodb://user:secret@private.invalid")
        return {"cursor": {"firstBatch": []}}


class FakeAdmin:
    def __init__(self, hello=None, error=None):
        self.hello = hello
        self.error = error

    async def command(self, name):
        assert name == "hello"
        if self.error:
            raise self.error
        return self.hello


class FakeClient:
    def __init__(self, hello, *, transaction_fails=False):
        self.admin = FakeAdmin(hello)
        self.session = FakeSession()
        self.database = FakeDatabase(self.session, fail=transaction_fails)
        self.requested_database = None

    async def start_session(self):
        return self.session

    def __getitem__(self, name):
        self.requested_database = name
        return self.database


def test_transaction_support_requires_replica_set_and_sessions():
    assert supports_transactions(
        {"setName": "rs0", "logicalSessionTimeoutMinutes": 30}
    )
    assert not supports_transactions({"logicalSessionTimeoutMinutes": 30})
    assert not supports_transactions({"setName": "rs0"})


def test_probe_proves_read_only_session_and_transaction_capability():
    client = FakeClient(
        {"setName": "rs0", "logicalSessionTimeoutMinutes": 30}
    )
    result = asyncio.run(
        probe_database_capabilities(client, "niuva", clock=lambda: FIXED_TIME)
    )

    assert result == DatabaseCapabilities(
        transactions=True,
        transaction_reason=TransactionCapabilityReason.AVAILABLE,
        checked_at="2026-07-17T09:00:00+00:00",
    )
    assert result.transaction_diagnostic() == {
        "available": True,
        "reason": "available",
        "checked_at": "2026-07-17T09:00:00+00:00",
    }
    assert client.requested_database == "niuva"
    assert client.session.started is True
    assert client.session.committed is True
    assert client.session.aborted is False
    assert client.session.ended is True
    assert len(client.database.commands) == 1


def test_probe_rejects_standalone_without_starting_callback_capability():
    client = FakeClient({"logicalSessionTimeoutMinutes": 30})
    result = asyncio.run(
        probe_database_capabilities(client, "niuva", clock=lambda: FIXED_TIME)
    )
    assert result.transactions is False
    assert result.transaction_reason is TransactionCapabilityReason.REPLICA_SET_REQUIRED
    assert client.session.started is False


def test_probe_rejects_replica_set_without_logical_sessions():
    client = FakeClient({"setName": "rs0"})
    result = asyncio.run(
        probe_database_capabilities(client, "niuva", clock=lambda: FIXED_TIME)
    )
    assert result.transactions is False
    assert result.transaction_reason is TransactionCapabilityReason.SESSIONS_REQUIRED
    assert client.session.started is False


def test_probe_aborts_and_returns_safe_reason_when_transaction_read_fails():
    client = FakeClient(
        {"setName": "rs0", "logicalSessionTimeoutMinutes": 30},
        transaction_fails=True,
    )
    result = asyncio.run(
        probe_database_capabilities(client, "niuva", clock=lambda: FIXED_TIME)
    )
    assert result.transactions is False
    assert result.transaction_reason is TransactionCapabilityReason.PROBE_FAILED
    assert client.session.aborted is True
    assert client.session.ended is True
    assert "secret" not in str(result.transaction_diagnostic())


def test_legacy_boolean_probe_remains_compatible_until_startup_migrates():
    client = FakeClient(
        {"setName": "rs0", "logicalSessionTimeoutMinutes": 30}
    )
    assert asyncio.run(probe_transaction_capability(client)) is True
```

- [ ] **Step 2: Inspect the complete test diff**

Run: `git diff -- backend/tests/test_database_capabilities.py`

Expected: only the test file above is shown; it contains no database write command such as `insert`, `update`, `delete`, or `aggregate` with `$out`/`$merge`.

- [ ] **Step 3: Run the focused test to verify RED**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_database_capabilities.py`

- [ ] **Step 4: Confirm the expected failure**

Expected: collection fails with an import error for `TransactionCapabilityReason` or `probe_database_capabilities`, because the current module exposes only a Boolean model and `hello` probe.

- [ ] **Step 5: Implement the capability model and probe**

Replace `backend/database_capabilities.py` with:

```python
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Callable

from pymongo.errors import PyMongoError


class TransactionCapabilityReason(str, Enum):
    NOT_CHECKED = "not_checked"
    AVAILABLE = "available"
    REPLICA_SET_REQUIRED = "replica_set_required"
    SESSIONS_REQUIRED = "sessions_required"
    PROBE_FAILED = "probe_failed"


@dataclass(frozen=True)
class DatabaseCapabilities:
    transactions: bool
    transaction_reason: TransactionCapabilityReason = (
        TransactionCapabilityReason.NOT_CHECKED
    )
    checked_at: str | None = None

    def __post_init__(self):
        if (
            self.transactions
            and self.transaction_reason is TransactionCapabilityReason.NOT_CHECKED
        ):
            object.__setattr__(
                self,
                "transaction_reason",
                TransactionCapabilityReason.AVAILABLE,
            )

    def transaction_diagnostic(self) -> dict[str, bool | str | None]:
        return {
            "available": self.transactions,
            "reason": self.transaction_reason.value,
            "checked_at": self.checked_at,
        }


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def supports_transactions(hello: dict) -> bool:
    return bool(hello.get("setName")) and (
        hello.get("logicalSessionTimeoutMinutes") is not None
    )


def _capabilities(
    available: bool,
    reason: TransactionCapabilityReason,
    clock: Callable[[], datetime],
) -> DatabaseCapabilities:
    return DatabaseCapabilities(
        transactions=available,
        transaction_reason=reason,
        checked_at=clock().astimezone(timezone.utc).isoformat(),
    )


async def probe_database_capabilities(
    client,
    database_name: str,
    *,
    clock: Callable[[], datetime] = utc_now,
) -> DatabaseCapabilities:
    try:
        hello = await client.admin.command("hello")
    except PyMongoError:
        return _capabilities(
            False, TransactionCapabilityReason.PROBE_FAILED, clock
        )

    if not hello.get("setName"):
        return _capabilities(
            False,
            TransactionCapabilityReason.REPLICA_SET_REQUIRED,
            clock,
        )
    if hello.get("logicalSessionTimeoutMinutes") is None:
        return _capabilities(
            False,
            TransactionCapabilityReason.SESSIONS_REQUIRED,
            clock,
        )

    session = None
    try:
        session = await client.start_session()
        session.start_transaction()
        await client[database_name].command(
            "find",
            "__transaction_capability_probe__",
            filter={"_id": "__read_only_probe__"},
            limit=1,
            session=session,
        )
        await session.commit_transaction()
    except PyMongoError:
        if session is not None and getattr(session, "in_transaction", True):
            try:
                await session.abort_transaction()
            except PyMongoError:
                pass
        return _capabilities(
            False, TransactionCapabilityReason.PROBE_FAILED, clock
        )
    finally:
        if session is not None:
            await session.end_session()

    return _capabilities(
        True, TransactionCapabilityReason.AVAILABLE, clock
    )


async def probe_transaction_capability(client) -> bool:
    try:
        hello = await client.admin.command("hello")
    except PyMongoError:
        return False
    return supports_transactions(hello)
```

- [ ] **Step 6: Inspect the implementation for read-only behavior**

Run: `rg -n "insert|update|delete|replace|\$out|\$merge" backend/database_capabilities.py`

Expected: no matches. The only database operation in the usable-transaction probe is `find` against the technical name `__transaction_capability_probe__`.

- [ ] **Step 7: Run the focused test to verify GREEN**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_database_capabilities.py`

- [ ] **Step 8: Confirm focused passing output**

Expected: `6 passed` and exit code `0`.

- [ ] **Step 9: Run related regression tests**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_database_capabilities.py backend\tests\test_health.py backend\tests\test_catalog_routes.py backend\tests\test_inventory_service.py`

Expected: all selected tests pass; existing services still consume `DatabaseCapabilities.transactions` unchanged.

- [ ] **Step 10: Commit only Task 1 files**

```powershell
git add -- backend/database_capabilities.py backend/tests/test_database_capabilities.py
git diff --cached --check
git commit -m "feat: add mongodb transaction capability detection"
```

### Task 2: Central transaction execution helper

**Owner:** Developer 2 — Transaction Core Owner

**Files:**
- Create: `backend/transaction_execution.py`
- Create: `backend/tests/test_transaction_execution.py`

**Interfaces:**
- Consumes: `Callable[[], DatabaseCapabilities]`, a Motor-compatible client, and `callback(session) -> Awaitable[T]`.
- Produces: `RetryMode.NEVER`; `RetryMode.DRIVER_TRANSIENT`; `TransactionUnavailableError(code="transaction_unavailable")`; `TransactionCommitOutcomeUnknownError(code="transaction_commit_outcome_unknown", reconciliation_required=True, attempts: int)`; `TransactionExecutor.execute(callback, *, operation_name: str, retry_mode: RetryMode = RetryMode.NEVER, correlation_id: str | None = None) -> T`.
- Retry contract: `UnknownTransactionCommitResult` retries only `commit_transaction` without rerunning the callback or starting a replacement transaction. Exhaustion raises the internal `TransactionCommitOutcomeUnknownError`, does not abort, and requires reconciliation because the mutation may already be committed.
- Callback retry contract: `TransientTransactionError` may rerun the callback only when `retry_mode` is explicitly `DRIVER_TRANSIENT`; all other callback errors propagate after abort.
- Public boundary: `TransactionCommitOutcomeUnknownError` is not `transaction_unavailable`, receives no customer-facing retry contract, and never contains driver messages, URIs, topology, callback results, or customer payloads.
- Correlation contract: callers pass only `None` or a canonical UUID generated or validated by trusted server-side code. The executor does not source request headers, cookies, query parameters, request bodies, customer data, or provider/payment payloads; without trusted request-ID middleware, most calls pass `correlation_id=None`.
- Ownership: executor owns session creation, transaction start, commit, abort, and session cleanup. Callbacks own only database work that uses the supplied session.

- [ ] **Step 1: Write the failing executor tests**

Create `backend/tests/test_transaction_execution.py`:

```python
import asyncio

import pytest
from pymongo.errors import ConnectionFailure, OperationFailure

from database_capabilities import DatabaseCapabilities
from transaction_execution import (
    RetryMode,
    TransactionCommitOutcomeUnknownError,
    TransactionExecutor,
    TransactionUnavailableError,
)


class FakeSession:
    def __init__(self, commit_errors=None):
        self.commit_errors = list(commit_errors or [])
        self.in_transaction = False
        self.starts = 0
        self.commits = 0
        self.aborts = 0
        self.ends = 0

    def start_transaction(self):
        self.starts += 1
        self.in_transaction = True

    async def commit_transaction(self):
        self.commits += 1
        if self.commit_errors:
            raise self.commit_errors.pop(0)
        self.in_transaction = False

    async def abort_transaction(self):
        self.aborts += 1
        self.in_transaction = False

    async def end_session(self):
        self.ends += 1


class FakeClient:
    def __init__(self, session=None, start_error=None):
        self.session = session or FakeSession()
        self.start_error = start_error
        self.start_calls = 0

    async def start_session(self):
        self.start_calls += 1
        if self.start_error:
            raise self.start_error
        return self.session


def capabilities(available=True):
    return DatabaseCapabilities(transactions=available)


def transient_error(label, message="safe classification"):
    return OperationFailure(
        message,
        details={"errorLabels": [label]},
    )


def test_unavailable_capability_fails_closed_before_callback():
    callback_calls = 0

    async def run():
        nonlocal callback_calls
        executor = TransactionExecutor(
            FakeClient(), lambda: capabilities(False)
        )

        async def callback(_session):
            nonlocal callback_calls
            callback_calls += 1

        with pytest.raises(TransactionUnavailableError) as caught:
            await executor.execute(callback, operation_name="catalog.publish")
        assert caught.value.code == "transaction_unavailable"

    asyncio.run(run())
    assert callback_calls == 0


def test_success_commits_once_and_closes_session():
    session = FakeSession()

    async def run():
        executor = TransactionExecutor(
            FakeClient(session), lambda: capabilities()
        )

        async def callback(received_session):
            assert received_session is session
            assert received_session.in_transaction is True
            return "committed"

        return await executor.execute(
            callback, operation_name="inventory.apply"
        )

    assert asyncio.run(run()) == "committed"
    assert (session.starts, session.commits, session.aborts, session.ends) == (
        1,
        1,
        0,
        1,
    )


def test_domain_exception_aborts_and_is_not_retried():
    session = FakeSession()
    calls = 0

    async def run():
        nonlocal calls
        executor = TransactionExecutor(
            FakeClient(session), lambda: capabilities()
        )

        async def callback(_session):
            nonlocal calls
            calls += 1
            raise ValueError("domain conflict")

        with pytest.raises(ValueError, match="domain conflict"):
            await executor.execute(
                callback,
                operation_name="inventory.apply",
                retry_mode=RetryMode.DRIVER_TRANSIENT,
            )

    asyncio.run(run())
    assert calls == 1
    assert session.aborts == 1
    assert session.ends == 1


def test_transient_callback_is_not_retried_by_default():
    session = FakeSession()
    calls = 0

    async def run():
        nonlocal calls
        executor = TransactionExecutor(
            FakeClient(session), lambda: capabilities()
        )

        async def callback(_session):
            nonlocal calls
            calls += 1
            raise transient_error("TransientTransactionError")

        with pytest.raises(OperationFailure):
            await executor.execute(callback, operation_name="order.create")

    asyncio.run(run())
    assert calls == 1
    assert session.starts == 1


def test_explicit_retry_safe_callback_retries_transient_transaction():
    session = FakeSession()
    calls = 0

    async def run():
        nonlocal calls
        executor = TransactionExecutor(
            FakeClient(session),
            lambda: capabilities(),
            max_transaction_attempts=2,
        )

        async def callback(_session):
            nonlocal calls
            calls += 1
            if calls == 1:
                raise transient_error("TransientTransactionError")
            return "retried-safely"

        return await executor.execute(
            callback,
            operation_name="inventory.idempotent_apply",
            retry_mode=RetryMode.DRIVER_TRANSIENT,
        )

    assert asyncio.run(run()) == "retried-safely"
    assert calls == 2
    assert session.starts == 2
    assert session.aborts == 1
    assert session.commits == 1
    assert session.ends == 1


def test_unknown_commit_result_retries_commit_not_callback():
    session = FakeSession(
        [transient_error("UnknownTransactionCommitResult")]
    )
    callback_calls = 0

    async def run():
        nonlocal callback_calls
        executor = TransactionExecutor(
            FakeClient(session),
            lambda: capabilities(),
            max_commit_attempts=2,
        )

        async def callback(_session):
            nonlocal callback_calls
            callback_calls += 1
            return "committed"

        return await executor.execute(
            callback, operation_name="catalog.publish"
        )

    assert asyncio.run(run()) == "committed"
    assert callback_calls == 1
    assert (session.starts, session.commits, session.aborts, session.ends) == (
        1,
        2,
        0,
        1,
    )
    assert session.in_transaction is False



def test_exhausted_unknown_commit_result_does_not_rerun_or_abort():
    session = FakeSession(
        [
            transient_error(
                "UnknownTransactionCommitResult",
                message="mongodb://user:secret@db.internal",
            )
            for _attempt in range(2)
        ]
    )
    callback_calls = 0

    async def run():
        nonlocal callback_calls
        executor = TransactionExecutor(
            FakeClient(session),
            lambda: capabilities(),
            max_commit_attempts=2,
        )

        async def callback(_session):
            nonlocal callback_calls
            callback_calls += 1
            return {"customer": "must-not-be-carried"}

        with pytest.raises(TransactionCommitOutcomeUnknownError) as caught:
            await executor.execute(
                callback,
                operation_name="catalog.publish",
            )
        return caught.value

    error = asyncio.run(run())
    assert callback_calls == 1
    assert (session.starts, session.commits, session.aborts, session.ends) == (
        1,
        2,
        0,
        1,
    )
    assert error.code == "transaction_commit_outcome_unknown"
    assert error.reconciliation_required is True
    assert error.attempts == 2
    assert str(error) == "Commit outcome is unknown; reconciliation is required."
    assert error.__cause__ is None
    for forbidden in ("secret", "db.internal", "must-not-be-carried"):
        assert forbidden not in str(error)

def test_connection_failure_is_normalized_without_secret_detail():
    error = ConnectionFailure("mongodb://user:secret@db.internal")

    async def run():
        executor = TransactionExecutor(
            FakeClient(start_error=error), lambda: capabilities()
        )
        with pytest.raises(TransactionUnavailableError) as caught:
            await executor.execute(
                lambda _session: None,
                operation_name="catalog.publish",
            )
        assert "secret" not in str(caught.value)
        assert "db.internal" not in str(caught.value)

    asyncio.run(run())
```

- [ ] **Step 2: Inspect the complete test contract**

Run: `git diff -- backend/tests/test_transaction_execution.py`

Expected: eight tests cover capability rejection, success, abort, default no-retry, explicit transaction retry, temporary commit-only retry, exhausted unknown commit reconciliation without rerun/abort, and unavailable normalization.

- [ ] **Step 3: Run the focused test to verify RED**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_execution.py`

- [ ] **Step 4: Confirm the expected failure**

Expected: collection fails with `ModuleNotFoundError: No module named 'transaction_execution'`.

- [ ] **Step 5: Implement the central executor**

Create `backend/transaction_execution.py`:

```python
from enum import Enum
from typing import Awaitable, Callable, TypeVar

from pymongo.errors import (
    ConnectionFailure,
    ConfigurationError,
    OperationFailure,
    PyMongoError,
    ServerSelectionTimeoutError,
)

from database_capabilities import DatabaseCapabilities


T = TypeVar("T")
TransactionCallback = Callable[[object], Awaitable[T]]
CapabilityProvider = Callable[[], DatabaseCapabilities]
EventSink = Callable[[str, dict[str, object]], None]


class RetryMode(str, Enum):
    NEVER = "never"
    DRIVER_TRANSIENT = "driver_transient"


class TransactionUnavailableError(RuntimeError):
    status_code = 503
    code = "transaction_unavailable"
    message = "Operasi sementara tidak tersedia karena transaksi database belum siap."

    def __init__(self):
        super().__init__(self.message)

class TransactionCommitOutcomeUnknownError(RuntimeError):
    code = "transaction_commit_outcome_unknown"
    message = "Commit outcome is unknown; reconciliation is required."
    reconciliation_required = True

    def __init__(self, *, attempts: int):
        self.attempts = attempts
        super().__init__(self.message)


def _has_error_label(exc: PyMongoError, label: str) -> bool:
    return bool(getattr(exc, "has_error_label", lambda _label: False)(label))


def _is_unavailable(exc: PyMongoError) -> bool:
    if isinstance(
        exc,
        (ConnectionFailure, ConfigurationError, ServerSelectionTimeoutError),
    ):
        return True
    return isinstance(exc, OperationFailure) and exc.code == 20


def _noop_event_sink(_event: str, _fields: dict[str, object]) -> None:
    return None


class TransactionExecutor:
    def __init__(
        self,
        client,
        capability_provider: CapabilityProvider,
        *,
        max_transaction_attempts: int = 3,
        max_commit_attempts: int = 3,
        event_sink: EventSink = _noop_event_sink,
    ):
        if max_transaction_attempts < 1 or max_commit_attempts < 1:
            raise ValueError("transaction and commit attempts must be positive")
        self.client = client
        self.capability_provider = capability_provider
        self.max_transaction_attempts = max_transaction_attempts
        self.max_commit_attempts = max_commit_attempts
        self.event_sink = event_sink

    async def _abort_if_active(self, session) -> None:
        if getattr(session, "in_transaction", False):
            await session.abort_transaction()

    async def _commit(self, session) -> None:
        for attempt in range(1, self.max_commit_attempts + 1):
            try:
                await session.commit_transaction()
                return
            except PyMongoError as exc:
                if not _has_error_label(exc, "UnknownTransactionCommitResult"):
                    raise
                if attempt == self.max_commit_attempts:
                    raise TransactionCommitOutcomeUnknownError(attempts=attempt) from None

    async def execute(
        self,
        callback: TransactionCallback[T],
        *,
        operation_name: str,
        retry_mode: RetryMode = RetryMode.NEVER,
        correlation_id: str | None = None,
    ) -> T:
        if not self.capability_provider().transactions:
            raise TransactionUnavailableError()

        session = None
        try:
            session = await self.client.start_session()
            for attempt in range(1, self.max_transaction_attempts + 1):
                session.start_transaction()
                try:
                    result = await callback(session)
                    await self._commit(session)
                    return result
                except TransactionCommitOutcomeUnknownError:
                    raise
                except PyMongoError as exc:
                    await self._abort_if_active(session)
                    if _is_unavailable(exc):
                        raise TransactionUnavailableError() from exc
                    retry_allowed = (
                        retry_mode is RetryMode.DRIVER_TRANSIENT
                        and _has_error_label(exc, "TransientTransactionError")
                        and attempt < self.max_transaction_attempts
                    )
                    if retry_allowed:
                        continue
                    raise
                except BaseException:
                    await self._abort_if_active(session)
                    raise
            raise AssertionError("transaction attempt loop exited unexpectedly")
        except PyMongoError as exc:
            if _is_unavailable(exc):
                raise TransactionUnavailableError() from exc
            raise
        finally:
            if session is not None:
                await session.end_session()
```

- [ ] **Step 6: Inspect retry and cleanup ownership**

Run: `rg -n "RetryMode|TransientTransactionError|UnknownTransactionCommitResult|TransactionCommitOutcomeUnknownError|abort_transaction|end_session" backend/transaction_execution.py`

Expected: the default is `NEVER`; callback retry requires `DRIVER_TRANSIENT`; commit retry is label-specific; exhausted unknown commit raises the safe reconciliation exception before abort handling; other aborts and every `end_session` remain centralized.

- [ ] **Step 7: Run the focused test to verify GREEN**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_execution.py`

- [ ] **Step 8: Confirm focused passing output**

Expected: `8 passed` and exit code `0`.

- [ ] **Step 9: Run core regression tests**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_database_capabilities.py backend\tests\test_transaction_execution.py backend\tests\test_inventory_service.py backend\tests\test_catalog_routes.py`

Expected: all selected tests pass; no current catalog/inventory service is changed by this task.

- [ ] **Step 10: Commit only Task 2 files**

```powershell
git add -- backend/transaction_execution.py backend/tests/test_transaction_execution.py
git diff --cached --check
git commit -m "feat: add mongodb transaction execution boundary"
```

### Task 3: Stable application error and HTTP contract

**Owner:** Developer 1 — PM and Integration Lead

**Files:**
- Create: `backend/transaction_api.py`
- Create: `backend/tests/test_transaction_error_contract.py`

**Interfaces:**
- Consumes: `TransactionUnavailableError` and `TransactionCommitOutcomeUnknownError` from Task 2.
- Produces: `TRANSACTION_UNAVAILABLE_DETAIL: dict[str, str]`; `transaction_unavailable_handler(request: Request, exc: TransactionUnavailableError) -> JSONResponse`.
- Public response contract: only `TransactionUnavailableError` maps to status `503` with body `{"detail":{"code":"transaction_unavailable","message":"Operasi sementara tidak tersedia karena transaksi database belum siap."}}`.
- Internal reconciliation contract: `TransactionCommitOutcomeUnknownError` has no public handler, is not mapped to `503 transaction_unavailable`, and introduces no browser-facing instruction to retry the mutation.
- Ownership: HTTP mapping never serializes the exception cause or request payload.

- [ ] **Step 1: Write the failing API-contract tests**

Create `backend/tests/test_transaction_error_contract.py`:

```python
import asyncio

import httpx
from fastapi import FastAPI

from transaction_api import transaction_unavailable_handler
from transaction_execution import (
    TransactionCommitOutcomeUnknownError,
    TransactionUnavailableError,
)


async def request_error_response():
    app = FastAPI()
    app.add_exception_handler(
        TransactionUnavailableError,
        transaction_unavailable_handler,
    )

    @app.post("/required-mutation")
    async def required_mutation():
        error = TransactionUnavailableError()
        error.__cause__ = RuntimeError(
            "mongodb://user:secret@db.internal/?replicaSet=private"
        )
        raise error

    transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
    async with httpx.AsyncClient(
        transport=transport, base_url="http://testserver"
    ) as client:
        return await client.post(
            "/required-mutation",
            json={"customer": "private", "token": "sensitive"},
        )


def test_transaction_unavailable_response_uses_stable_existing_envelope():
    response = asyncio.run(request_error_response())
    assert response.status_code == 503
    assert response.json() == {
        "detail": {
            "code": "transaction_unavailable",
            "message": (
                "Operasi sementara tidak tersedia karena transaksi database belum siap."
            ),
        }
    }


def test_transaction_unavailable_response_leaks_no_internal_detail():
    response = asyncio.run(request_error_response())
    text = response.text.lower()
    for forbidden in (
        "secret",
        "db.internal",
        "replicaset",
        "private",
        "sensitive",
        "traceback",
    ):
        assert forbidden not in text


def test_commit_outcome_unknown_remains_internal_without_public_retry_mapping():
    app = FastAPI()
    app.add_exception_handler(
        TransactionUnavailableError,
        transaction_unavailable_handler,
    )
    error = TransactionCommitOutcomeUnknownError(attempts=3)

    assert TransactionCommitOutcomeUnknownError not in app.exception_handlers
    assert not isinstance(error, TransactionUnavailableError)
    assert not hasattr(error, "status_code")
    assert error.code == "transaction_commit_outcome_unknown"
    assert error.reconciliation_required is True
    assert "retry" not in str(error).lower()

```

- [ ] **Step 2: Inspect the complete security assertions**

Run: `git diff -- backend/tests/test_transaction_error_contract.py`

Expected: the exact unavailable status/body and leak exclusions are asserted; the unknown commit exception is proven internal, distinct from `TransactionUnavailableError`, and absent from public handlers.

- [ ] **Step 3: Run the focused test to verify RED**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_error_contract.py`

- [ ] **Step 4: Confirm the expected failure**

Expected: collection fails with `ModuleNotFoundError: No module named 'transaction_api'`.

- [ ] **Step 5: Implement the exact HTTP mapping**

Create `backend/transaction_api.py`:

```python
from fastapi import Request
from fastapi.responses import JSONResponse

from transaction_execution import TransactionUnavailableError


TRANSACTION_UNAVAILABLE_DETAIL = {
    "code": TransactionUnavailableError.code,
    "message": TransactionUnavailableError.message,
}


async def transaction_unavailable_handler(
    _request: Request,
    _exc: TransactionUnavailableError,
) -> JSONResponse:
    return JSONResponse(
        status_code=TransactionUnavailableError.status_code,
        content={"detail": dict(TRANSACTION_UNAVAILABLE_DETAIL)},
    )
```

- [ ] **Step 6: Inspect the response producer**

Run: `git diff -- backend/transaction_api.py`

Expected: the response uses unavailable constants only, does not import or map `TransactionCommitOutcomeUnknownError`, and never interpolates request, exception, client, database, or topology values.

- [ ] **Step 7: Run the focused test to verify GREEN**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_error_contract.py`

- [ ] **Step 8: Confirm focused passing output**

Expected: `3 passed` and exit code `0`.

- [ ] **Step 9: Run API-envelope regression tests**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_error_contract.py backend\tests\test_catalog_routes.py backend\tests\test_inventory_routes.py backend\tests\test_auth_security.py`

Expected: all selected tests pass, existing route envelopes remain unchanged, and no browser-facing retry contract exists for an unknown commit outcome.

- [ ] **Step 10: Commit only Task 3 files**

```powershell
git add -- backend/transaction_api.py backend/tests/test_transaction_error_contract.py
git diff --cached --check
git commit -m "feat: define transaction unavailable API contract"
```
### Task 4: Liveness, readiness, and safe diagnostics

**Owner:** Developer 3 — Test Infrastructure and Readiness Owner

**Files:**
- Modify: `backend/server.py:37-39,63,699-701,881-891`
- Modify: `backend/tests/test_health.py:1-26`

**Interfaces:**
- Consumes: `probe_database_capabilities(client, database_name) -> DatabaseCapabilities` and `DatabaseCapabilities.transaction_diagnostic()` from Task 1.
- Produces: backward-compatible `GET /api/health`; `GET /api/health/live`; `GET /api/health/ready` with `status`, `transaction_mutations`, and allowlisted `capabilities.transactions`.
- Status rules: liveness always returns `200 {"status":"ok"}` while the process is serving; readiness returns HTTP 200 with `status=ready` when transactions are available and `status=degraded` otherwise, so public/read-only traffic is not disabled solely by transaction degradation.
- Ownership: mutation endpoints still enforce fail-closed behavior through Task 7; readiness is diagnostic, not authorization.

- [ ] **Step 1: Write the failing readiness tests**

Replace `backend/tests/test_health.py` with:

```python
import asyncio

import httpx

from database_capabilities import (
    DatabaseCapabilities,
    TransactionCapabilityReason,
)
from tests.test_identity_foundation import server


CHECKED_AT = "2026-07-17T09:00:00+00:00"


async def get(path, capabilities):
    previous = server.app.state.database_capabilities
    transport = httpx.ASGITransport(app=server.app)
    try:
        server.app.state.database_capabilities = capabilities
        async with httpx.AsyncClient(
            transport=transport, base_url="http://testserver"
        ) as api:
            return await api.get(path)
    finally:
        server.app.state.database_capabilities = previous


def available_capabilities():
    return DatabaseCapabilities(
        transactions=True,
        transaction_reason=TransactionCapabilityReason.AVAILABLE,
        checked_at=CHECKED_AT,
    )


def unavailable_capabilities():
    return DatabaseCapabilities(
        transactions=False,
        transaction_reason=TransactionCapabilityReason.REPLICA_SET_REQUIRED,
        checked_at=CHECKED_AT,
    )


def test_legacy_health_projection_remains_backward_compatible():
    response = asyncio.run(get("/api/health", available_capabilities()))
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "transactions": True}


def test_liveness_does_not_depend_on_transaction_capability():
    response = asyncio.run(get("/api/health/live", unavailable_capabilities()))
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_readiness_reports_transaction_capability_when_available():
    response = asyncio.run(get("/api/health/ready", available_capabilities()))
    assert response.status_code == 200
    assert response.json() == {
        "status": "ready",
        "transaction_mutations": "ready",
        "capabilities": {
            "transactions": {
                "available": True,
                "reason": "available",
                "checked_at": CHECKED_AT,
            }
        },
    }


def test_readiness_is_degraded_without_disabling_public_liveness():
    response = asyncio.run(get("/api/health/ready", unavailable_capabilities()))
    assert response.status_code == 200
    assert response.json() == {
        "status": "degraded",
        "transaction_mutations": "unavailable",
        "capabilities": {
            "transactions": {
                "available": False,
                "reason": "replica_set_required",
                "checked_at": CHECKED_AT,
            }
        },
    }
    serialized = response.text.lower()
    for forbidden in ("mongodb://", "replicaset=", "password", "secret"):
        assert forbidden not in serialized
```

- [ ] **Step 2: Inspect the complete readiness matrix**

Run: `git diff -- backend/tests/test_health.py`

Expected: legacy health, independent liveness, ready transactions, and degraded transactions each have exact status/body assertions.

- [ ] **Step 3: Run the focused test to verify RED**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_health.py`

- [ ] **Step 4: Confirm the expected failure**

Expected: `/api/health/live` and `/api/health/ready` return `404` because only `/api/health` exists.

- [ ] **Step 5: Implement startup probing and health separation**

Apply these exact changes to `backend/server.py`:

```diff
-from database_capabilities import DatabaseCapabilities, probe_transaction_capability
+from database_capabilities import DatabaseCapabilities, probe_database_capabilities
@@
 mongo_url = os.environ["MONGO_URL"]
 client = AsyncIOMotorClient(mongo_url)
-db = client[os.environ["DB_NAME"]]
+database_name = os.environ["DB_NAME"]
+db = client[database_name]
@@
 @api.get("/health")
 async def health():
     return {"status": "ok", "transactions": app.state.database_capabilities.transactions}
+
+
+@api.get("/health/live")
+async def health_live():
+    return {"status": "ok"}
+
+
+@api.get("/health/ready")
+async def health_ready():
+    capabilities = app.state.database_capabilities
+    transaction_mutations = "ready" if capabilities.transactions else "unavailable"
+    return {
+        "status": "ready" if capabilities.transactions else "degraded",
+        "transaction_mutations": transaction_mutations,
+        "capabilities": {
+            "transactions": capabilities.transaction_diagnostic(),
+        },
+    }
@@
 @app.on_event("startup")
 async def startup():
     storage.init_storage()
     await seed()
-    app.state.database_capabilities = DatabaseCapabilities(
-        transactions=await probe_transaction_capability(client)
+    app.state.database_capabilities = await probe_database_capabilities(
+        client,
+        database_name,
     )
+    logger.info(
+        "database capability checked transactions=%s reason=%s",
+        app.state.database_capabilities.transactions,
+        app.state.database_capabilities.transaction_reason.value,
+    )
     await ensure_catalog_inventory_indexes(db)
```

- [ ] **Step 6: Inspect diagnostics for forbidden detail**

Run: `rg -n "mongo_url|MONGO_URL|client\.address|setName|hello" backend/server.py backend/tests/test_health.py`

Expected: `mongo_url` remains private initialization state; health response code uses only `transaction_diagnostic()` and does not serialize URL, address, `setName`, or raw `hello` data.

- [ ] **Step 7: Run the focused test to verify GREEN**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_health.py`

- [ ] **Step 8: Confirm focused passing output**

Expected: `4 passed` and exit code `0`.

- [ ] **Step 9: Run startup/API regression tests**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_health.py backend\tests\test_database_capabilities.py backend\tests\test_identity_foundation.py backend\tests\test_auth_security.py`

Expected: all selected tests pass; startup fakes remain compatible and liveness is independent of transaction readiness.

- [ ] **Step 10: Commit only Task 4 files**

```powershell
git add -- backend/server.py backend/tests/test_health.py
git diff --cached --check
git commit -m "feat: expose transaction readiness diagnostics"
```

### Task 5: Deterministic local single-node replica-set topology

**Owner:** Developer 3 — Test Infrastructure and Readiness Owner

**Files:**
- Create: `docker-compose.transaction.yml`
- Create: `scripts/mongodb/init-replica-set.js`
- Create: `scripts/mongodb/wait-for-replica-set.ps1`
- Create: `scripts/mongodb/reset-local-replica-set.ps1`
- Create: `backend/tests/test_transaction_topology_files.py`
- Modify: `backend/.env.example:1-2`

**Interfaces:**
- Produces: local MongoDB endpoint `mongodb://127.0.0.1:27017/?replicaSet=rs0&directConnection=true`; persistent named volume `niuva_mongodb_data`; idempotent `rs0` initializer reached through `mongodb://mongodb:27017/admin?directConnection=true`; PowerShell wait command; explicitly gated reset command.
- Consumes: Docker Compose and MongoDB `7`/`mongosh` supplied by the official image.
- Connection boundary: `directConnection=true` applies only to this tracked single-node local topology and does not specify staging or production discovery.
- Safety boundary: normal startup never deletes or reconfigures existing data. Destructive volume removal requires `reset-local-replica-set.ps1 -DestroyData` plus PowerShell confirmation.

- [ ] **Step 1: Write the failing local-topology contract test**

Create `backend/tests/test_transaction_topology_files.py`:

```python
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def test_local_replica_set_topology_is_persistent_and_non_destructive():
    compose = read("docker-compose.transaction.yml")
    initializer = read("scripts/mongodb/init-replica-set.js")
    wait_script = read("scripts/mongodb/wait-for-replica-set.ps1")
    reset_script = read("scripts/mongodb/reset-local-replica-set.ps1")
    env_example = read("backend/.env.example")

    assert "mongo:7.0" in compose
    assert "--replSet" in compose and "rs0" in compose
    assert "127.0.0.1:27017:27017" in compose
    assert "mongodb://mongodb:27017/admin?directConnection=true" in compose
    assert "niuva_mongodb_data:/data/db" in compose
    assert "tmpfs" not in compose
    assert "rs.initiate" in initializer
    assert "rs.reconfig" not in initializer
    assert "isWritablePrimary" in initializer
    assert "TimeoutSeconds" in wait_script
    assert "DestroyData" in reset_script
    assert "--volumes" in reset_script
    assert "replicaSet=rs0&directConnection=true" in env_example


def test_local_reset_requires_explicit_destructive_switch():
    reset_script = read("scripts/mongodb/reset-local-replica-set.ps1")
    guard_position = reset_script.index("if (-not $DestroyData)")
    destructive_position = reset_script.index("--volumes")
    assert guard_position < destructive_position
    assert "ShouldProcess" in reset_script
```

- [ ] **Step 2: Inspect the complete topology assertions**

Run: `git diff -- backend/tests/test_transaction_topology_files.py`

Expected: persistent volume, exact `rs0` name, direct host and initializer connections, idempotent initialization, readiness polling, and explicit destructive-reset gates are all asserted.

- [ ] **Step 3: Run the focused test to verify RED**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_topology_files.py`

- [ ] **Step 4: Confirm the expected failure**

Expected: `FileNotFoundError` for `docker-compose.transaction.yml`.

- [ ] **Step 5: Add the local topology and PowerShell operations**

Create `docker-compose.transaction.yml`:

```yaml
name: niuva-transaction-local

services:
  mongodb:
    image: mongo:7.0
    command: ["mongod", "--replSet", "rs0", "--bind_ip_all", "--port", "27017"]
    ports:
      - "127.0.0.1:27017:27017"
    volumes:
      - niuva_mongodb_data:/data/db
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "mongosh --quiet --host localhost:27017 --eval 'try { quit(db.hello().isWritablePrimary ? 0 : 1) } catch (error) { quit(1) }'",
        ]
      interval: 2s
      timeout: 5s
      retries: 30
      start_period: 5s

  mongodb-init:
    image: mongo:7.0
    depends_on:
      mongodb:
        condition: service_started
    restart: "no"
    volumes:
      - ./scripts/mongodb/init-replica-set.js:/scripts/init-replica-set.js:ro
    command:
      [
        "mongosh",
        "--quiet",
        "mongodb://mongodb:27017/admin?directConnection=true",
        "/scripts/init-replica-set.js",
      ]

volumes:
  niuva_mongodb_data:
```

Create `scripts/mongodb/init-replica-set.js`:

```javascript
const expectedSet = "rs0";
const expectedHost = "localhost:27017";

try {
  rs.status();
} catch (error) {
  if (error.codeName !== "NotYetInitialized") {
    throw error;
  }
  rs.initiate({
    _id: expectedSet,
    members: [{ _id: 0, host: expectedHost }],
  });
}

const deadline = Date.now() + 60000;
while (Date.now() < deadline) {
  const hello = db.hello();
  if (hello.setName === expectedSet && hello.isWritablePrimary === true) {
    print("Replica set rs0 is writable");
    quit(0);
  }
  sleep(500);
}

throw new Error("Replica set rs0 did not become writable within 60 seconds");
```

Create `scripts/mongodb/wait-for-replica-set.ps1`:

```powershell
[CmdletBinding()]
param(
    [ValidateRange(1, 300)]
    [int]$TimeoutSeconds = 60
)

$composeFile = Join-Path $PSScriptRoot "..\..\docker-compose.transaction.yml"
$deadline = [DateTimeOffset]::UtcNow.AddSeconds($TimeoutSeconds)

while ([DateTimeOffset]::UtcNow -lt $deadline) {
    docker compose -f $composeFile exec -T mongodb mongosh --quiet `
        --host localhost:27017 `
        --eval "quit(db.hello().isWritablePrimary ? 0 : 1)"
    if ($LASTEXITCODE -eq 0) {
        Write-Output "MongoDB replica set rs0 is writable."
        exit 0
    }
    Start-Sleep -Milliseconds 500
}

throw "MongoDB replica set rs0 was not writable within $TimeoutSeconds seconds."
```

Create `scripts/mongodb/reset-local-replica-set.ps1`:

```powershell
[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "High")]
param(
    [switch]$DestroyData
)

if (-not $DestroyData) {
    throw "Reset is destructive. Re-run with -DestroyData and confirm the prompt."
}

$composeFile = Join-Path $PSScriptRoot "..\..\docker-compose.transaction.yml"
$target = "local Docker volume niuva_mongodb_data"
if ($PSCmdlet.ShouldProcess($target, "remove the local MongoDB replica-set volume")) {
    docker compose -f $composeFile down --volumes --remove-orphans
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose failed to remove the local replica-set volume."
    }
}
```

Modify the first line of `backend/.env.example`:

```diff
-MONGO_URL=mongodb://127.0.0.1:27017
+# Local mutation development requires docker-compose.transaction.yml (rs0).
+MONGO_URL=mongodb://127.0.0.1:27017/?replicaSet=rs0&directConnection=true
 DB_NAME=niuva
```

- [ ] **Step 6: Validate Compose syntax without starting or deleting data**

Run: `docker compose -f docker-compose.transaction.yml config --quiet`

Expected: exit code `0`. If Docker CLI/Compose is unavailable, classify it as an environment blocker; do not claim topology validation passed.

- [ ] **Step 7: Run the focused topology tests to verify GREEN**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_topology_files.py`

- [ ] **Step 8: Confirm focused passing output**

Expected: `2 passed` and exit code `0`.

- [ ] **Step 9: Run local-topology regression checks**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_topology_files.py backend\tests\test_database_capabilities.py`

Expected: all selected tests pass. Do not run the reset script during verification.

- [ ] **Step 10: Commit only Task 5 files**

```powershell
git add -- docker-compose.transaction.yml scripts/mongodb/init-replica-set.js scripts/mongodb/wait-for-replica-set.ps1 scripts/mongodb/reset-local-replica-set.ps1 backend/.env.example backend/tests/test_transaction_topology_files.py
git diff --cached --check
git commit -m "chore: configure local mongodb replica set"
```

### Task 6: Isolated replica-set test and CI topology

**Owner:** Developer 3 — Test Infrastructure and Readiness Owner

**Files:**
- Create: `docker-compose.transaction-test.yml`
- Create: `scripts/mongodb/init-test-replica-set.js`
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/test_transaction_integration.py`
- Create: `.github/workflows/transaction-tests.yml`
- Modify: `backend/tests/test_transaction_topology_files.py`
- Modify: `backend/.env.example`

**Interfaces:**
- Produces: ephemeral `rs-test` endpoint `mongodb://127.0.0.1:27018/?replicaSet=rs-test&directConnection=true`; initializer sidecar endpoint `mongodb://mongodb-test:27018/admin?directConnection=true`; `transaction_database_name(request) -> str`; mandatory CI command for real probe/commit/abort tests.
- Isolation: MongoDB data uses container `tmpfs`; every test database includes sanitized xdist worker ID plus UUID; every integration test drops only its generated database in `finally`.
- Connection boundary: `directConnection=true` applies only to the tracked single-node `rs-test` topology and does not specify staging or production discovery.
- CI boundary: no developer-local MongoDB is read. The dedicated workflow pins CPython `3.14.3`, always defines `MONGO_TRANSACTION_TEST_URL`, and must not use `continue-on-error`. Missing `MONGO_TRANSACTION_TEST_URL` remains a local skip only.

- [ ] **Step 1: Write the failing integration and topology tests**

Append this test to `backend/tests/test_transaction_topology_files.py`:

```python
def test_ci_replica_set_is_ephemeral_mandatory_and_isolated():
    compose = read("docker-compose.transaction-test.yml")
    initializer = read("scripts/mongodb/init-test-replica-set.js")
    workflow = read(".github/workflows/transaction-tests.yml")
    fixture = read("backend/tests/conftest.py")
    env_example = read("backend/.env.example")

    assert "mongo:7.0" in compose
    assert "--replSet" in compose and "rs-test" in compose
    assert "127.0.0.1:27018:27018" in compose
    assert "mongodb://mongodb-test:27018/admin?directConnection=true" in compose
    assert "tmpfs" in compose and "/data/db" in compose
    assert "rs.initiate" in initializer
    assert "MONGO_TRANSACTION_TEST_URL" in workflow
    assert "replicaSet=rs-test&directConnection=true" in workflow
    assert "replicaSet=rs-test&directConnection=true" in env_example
    assert "test_transaction_integration.py" in workflow
    assert "test_inventory_transactions.py" in workflow
    assert 'python-version: "3.14.3"' in workflow
    assert "continue-on-error" not in workflow
    assert "PYTEST_XDIST_WORKER" in fixture
    assert "uuid.uuid4" in fixture
```

Create `backend/tests/conftest.py`:

```python
import os
import re
import uuid

import pytest


@pytest.fixture
def transaction_database_name(request):
    worker = os.environ.get("PYTEST_XDIST_WORKER", "gw0")
    safe_worker = re.sub(r"[^a-zA-Z0-9_]", "_", worker)
    safe_node = re.sub(r"[^a-zA-Z0-9_]", "_", request.node.name)[:40]
    return f"niuva_tx_{safe_worker}_{safe_node}_{uuid.uuid4().hex}"
```

Create `backend/tests/test_transaction_integration.py`:

```python
import asyncio
import os

import pytest

MONGO_TRANSACTION_TEST_URL = os.environ.get("MONGO_TRANSACTION_TEST_URL")
if not MONGO_TRANSACTION_TEST_URL:
    pytest.skip(
        "MONGO_TRANSACTION_TEST_URL is required for real transaction tests",
        allow_module_level=True,
    )

from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402

from database_capabilities import probe_database_capabilities  # noqa: E402
from transaction_execution import TransactionExecutor  # noqa: E402


async def run_real_transaction_contract(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    database = client[database_name]
    try:
        collections_before_probe = await database.list_collection_names()
        capabilities = await probe_database_capabilities(client, database_name)
        collections_after_probe = await database.list_collection_names()
        assert capabilities.transactions is True
        assert collections_after_probe == collections_before_probe
        assert "__transaction_capability_probe__" not in collections_after_probe
        executor = TransactionExecutor(client, lambda: capabilities)

        async def committed(session):
            await database.transaction_evidence.insert_one(
                {"_id": "committed", "value": 1},
                session=session,
            )
            return "committed"

        assert await executor.execute(
            committed, operation_name="test.commit"
        ) == "committed"
        assert await database.transaction_evidence.count_documents({}) == 1

        async def aborted(session):
            await database.transaction_evidence.insert_one(
                {"_id": "aborted", "value": 2},
                session=session,
            )
            raise RuntimeError("force abort")

        with pytest.raises(RuntimeError, match="force abort"):
            await executor.execute(aborted, operation_name="test.abort")
        assert await database.transaction_evidence.find_one({"_id": "aborted"}) is None
        assert await database.transaction_evidence.count_documents({}) == 1
    finally:
        await client.drop_database(database_name)
        client.close()


def test_real_probe_commit_abort_and_cleanup(transaction_database_name):
    asyncio.run(run_real_transaction_contract(transaction_database_name))
```

- [ ] **Step 2: Inspect the complete isolation contract**

Run: `git diff -- backend/tests/conftest.py backend/tests/test_transaction_integration.py backend/tests/test_transaction_topology_files.py`

Expected: exact `rs-test` naming, direct host and initializer connections, unique worker/node/UUID database naming, real usable probe/commit/abort behavior, `finally` cleanup, and the grounded CPython `3.14.3` CI pin are explicit.

- [ ] **Step 3: Run the static focused test to verify RED**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_topology_files.py`

- [ ] **Step 4: Confirm the expected failure**

Expected: the new CI-topology test fails with `FileNotFoundError` for `docker-compose.transaction-test.yml` or `.github/workflows/transaction-tests.yml`.

- [ ] **Step 5: Implement the isolated topology and mandatory workflow**

Create `docker-compose.transaction-test.yml`:

```yaml
name: niuva-transaction-test

services:
  mongodb-test:
    image: mongo:7.0
    command: ["mongod", "--replSet", "rs-test", "--bind_ip_all", "--port", "27018"]
    ports:
      - "127.0.0.1:27018:27018"
    tmpfs:
      - /data/db
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "mongosh --quiet --port 27018 --eval 'try { quit(db.hello().isWritablePrimary ? 0 : 1) } catch (error) { quit(1) }'",
        ]
      interval: 2s
      timeout: 5s
      retries: 30
      start_period: 5s

  mongodb-test-init:
    image: mongo:7.0
    depends_on:
      mongodb-test:
        condition: service_started
    restart: "no"
    volumes:
      - ./scripts/mongodb/init-test-replica-set.js:/scripts/init-test-replica-set.js:ro
    command:
      [
        "mongosh",
        "--quiet",
        "mongodb://mongodb-test:27018/admin?directConnection=true",
        "/scripts/init-test-replica-set.js",
      ]
```

Create `scripts/mongodb/init-test-replica-set.js`:

```javascript
const expectedSet = "rs-test";
const expectedHost = "localhost:27018";

try {
  rs.status();
} catch (error) {
  if (error.codeName !== "NotYetInitialized") {
    throw error;
  }
  rs.initiate({
    _id: expectedSet,
    members: [{ _id: 0, host: expectedHost }],
  });
}

const deadline = Date.now() + 60000;
while (Date.now() < deadline) {
  const hello = db.hello();
  if (hello.setName === expectedSet && hello.isWritablePrimary === true) {
    print("Replica set rs-test is writable");
    quit(0);
  }
  sleep(500);
}

throw new Error("Replica set rs-test did not become writable within 60 seconds");
```

Create `.github/workflows/transaction-tests.yml`:

```yaml
name: transaction-tests

on:
  pull_request:
    paths:
      - "backend/**"
      - "scripts/mongodb/**"
      - "docker-compose.transaction-test.yml"
      - ".github/workflows/transaction-tests.yml"
  workflow_dispatch:

permissions:
  contents: read

jobs:
  transaction-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.14.3"
          cache: pip
          cache-dependency-path: backend/requirements.txt
      - name: Install backend dependencies
        run: python -m pip install -r backend/requirements.txt
      - name: Start isolated MongoDB replica set
        run: docker compose -f docker-compose.transaction-test.yml up -d
      - name: Wait for writable primary
        shell: bash
        run: |
          for attempt in $(seq 1 60); do
            if docker compose -f docker-compose.transaction-test.yml exec -T mongodb-test \
              mongosh --quiet --port 27018 \
              --eval 'quit(db.hello().isWritablePrimary ? 0 : 1)'; then
              exit 0
            fi
            sleep 1
          done
          docker compose -f docker-compose.transaction-test.yml logs
          exit 1
      - name: Run mandatory transaction integration tests
        env:
          MONGO_TRANSACTION_TEST_URL: mongodb://127.0.0.1:27018/?replicaSet=rs-test&directConnection=true
        run: >-
          python -m pytest -n 0 -q
          backend/tests/test_transaction_integration.py
          backend/tests/test_inventory_transactions.py
      - name: Stop isolated MongoDB replica set
        if: always()
        run: docker compose -f docker-compose.transaction-test.yml down --volumes --remove-orphans
```

Append to `backend/.env.example`:

```env

# Tests only. CI supplies an isolated rs-test topology on port 27018.
MONGO_TRANSACTION_TEST_URL=mongodb://127.0.0.1:27018/?replicaSet=rs-test&directConnection=true
```

- [ ] **Step 6: Validate both Compose and workflow files**

Run: `docker compose -f docker-compose.transaction-test.yml config --quiet`

Expected: exit code `0`. Then run `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_topology_files.py`; expected `3 passed`.

- [ ] **Step 7: Start the isolated topology and run real focused tests**

Run:

```powershell
docker compose -f docker-compose.transaction-test.yml up -d
$env:MONGO_TRANSACTION_TEST_URL = "mongodb://127.0.0.1:27018/?replicaSet=rs-test&directConnection=true"
backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_integration.py backend\tests\test_inventory_transactions.py
```

- [ ] **Step 8: Confirm real passing output and clean topology**

Expected: both real transaction test modules pass with no skip. Always run `docker compose -f docker-compose.transaction-test.yml down --volumes --remove-orphans` afterward, even when pytest fails.

- [ ] **Step 9: Run isolated-topology regression tests**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_topology_files.py backend\tests\test_database_capabilities.py backend\tests\test_transaction_execution.py backend\tests\test_transaction_integration.py`

Expected: all selected tests pass with `MONGO_TRANSACTION_TEST_URL` set. The generated database names are unique, and cleanup drops only those names.

- [ ] **Step 10: Commit only Task 6 files**

```powershell
git add -- docker-compose.transaction-test.yml scripts/mongodb/init-test-replica-set.js backend/tests/conftest.py backend/tests/test_transaction_integration.py backend/tests/test_transaction_topology_files.py backend/.env.example .github/workflows/transaction-tests.yml
git diff --cached --check
git commit -m "ci: run transaction tests against mongodb replica set"
```

### Task 7: Reusable integration guard for transaction-required mutations

**Owner:** Developer 1 — PM and Integration Lead

**Files:**
- Create: `backend/transaction_guard.py`
- Create: `backend/tests/test_transaction_guard.py`
- Modify: `backend/tests/test_transaction_error_contract.py`
- Modify: `backend/server.py` at the application-state composition block
- Modify: `backend/.env.example`

**Interfaces:**
- Consumes: `TransactionExecutor.execute`, `TransactionUnavailableError`, and `transaction_unavailable_handler`.
- Produces: `TransactionMutationGuard(executor, enabled_provider)`; `TransactionMutationGuard.run(callback, *, operation_name: str, retry_safe: bool = False, correlation_id: str | None = None) -> T`; `app.state.transaction_guard`.
- Correlation contract: the guard forwards only `None` or a trusted canonical server-side UUID. It never derives correlation IDs from raw request material, and most calls remain `None` because this foundation adds no request-ID middleware.
- Feature gate: `TRANSACTION_MUTATIONS_ENABLED=false` is fail-closed and prevents callback execution. Enabling the flag never bypasses the executor's live capability check.
- Ownership: all future cross-collection mutations enter through this guard. Read-only and proven-safe single-document operations remain outside it. Existing catalog/inventory business code is not refactored in this task.

- [ ] **Step 1: Write the failing guard tests**

Create `backend/tests/test_transaction_guard.py`:

```python
import asyncio

import pytest

from database_capabilities import DatabaseCapabilities
from transaction_execution import TransactionExecutor, TransactionUnavailableError
from transaction_guard import TransactionMutationGuard


class FakeSession:
    def __init__(self):
        self.in_transaction = False
        self.commits = 0
        self.aborts = 0
        self.ends = 0

    def start_transaction(self):
        self.in_transaction = True

    async def commit_transaction(self):
        self.commits += 1
        self.in_transaction = False

    async def abort_transaction(self):
        self.aborts += 1
        self.in_transaction = False

    async def end_session(self):
        self.ends += 1


class FakeClient:
    def __init__(self, session):
        self.session = session

    async def start_session(self):
        return self.session


def build_guard(*, capability=True, enabled=True):
    session = FakeSession()
    executor = TransactionExecutor(
        FakeClient(session),
        lambda: DatabaseCapabilities(transactions=capability),
    )
    guard = TransactionMutationGuard(executor, lambda: enabled)
    return guard, session


def test_guard_does_not_invoke_callback_when_capability_is_unavailable():
    calls = 0

    async def run():
        nonlocal calls
        guard, _session = build_guard(capability=False)

        async def callback(_session):
            nonlocal calls
            calls += 1

        with pytest.raises(TransactionUnavailableError):
            await guard.run(callback, operation_name="catalog.publish")

    asyncio.run(run())
    assert calls == 0


def test_runtime_disable_does_not_invoke_callback_or_fallback():
    calls = 0

    async def run():
        nonlocal calls
        guard, _session = build_guard(enabled=False)

        async def callback(_session):
            nonlocal calls
            calls += 1
            return "non-atomic fallback"

        with pytest.raises(TransactionUnavailableError):
            await guard.run(callback, operation_name="inventory.reserve")

    asyncio.run(run())
    assert calls == 0


def test_available_guard_invokes_callback_inside_transaction():
    guard, session = build_guard()

    async def run():
        async def callback(received_session):
            assert received_session is session
            assert received_session.in_transaction is True
            return "atomic"

        return await guard.run(callback, operation_name="inventory.reserve")

    assert asyncio.run(run()) == "atomic"
    assert session.commits == 1
    assert session.ends == 1


def test_callback_exception_aborts_transaction():
    guard, session = build_guard()

    async def run():
        async def callback(_session):
            raise RuntimeError("business failure")

        with pytest.raises(RuntimeError, match="business failure"):
            await guard.run(callback, operation_name="catalog.publish")

    asyncio.run(run())
    assert session.aborts == 1
    assert session.commits == 0
    assert session.ends == 1


def test_read_only_and_proven_single_document_work_stays_outside_guard():
    calls = 0

    async def safe_read():
        nonlocal calls
        calls += 1
        return {"status": "public-safe"}

    assert asyncio.run(safe_read()) == {"status": "public-safe"}
    assert calls == 1
```

Append this composition test to `backend/tests/test_transaction_error_contract.py`:

```python
def test_server_composes_one_shared_transaction_guard_and_handler():
    from tests.test_identity_foundation import server
    from transaction_guard import TransactionMutationGuard

    assert isinstance(server.app.state.transaction_guard, TransactionMutationGuard)
    assert (
        server.app.exception_handlers[TransactionUnavailableError]
        is transaction_unavailable_handler
    )
    assert TransactionCommitOutcomeUnknownError not in server.app.exception_handlers
```

- [ ] **Step 2: Inspect the complete guard contract**

Run: `git diff -- backend/tests/test_transaction_guard.py backend/tests/test_transaction_error_contract.py`

Expected: capability rejection, runtime disablement, transactional execution, abort, safe unguarded read, and server composition all have explicit assertions.

- [ ] **Step 3: Run the focused tests to verify RED**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_guard.py backend\tests\test_transaction_error_contract.py`

- [ ] **Step 4: Confirm the expected failure**

Expected: collection fails because `transaction_guard` does not exist; after adding only the guard file, the composition test still fails because `server.app.state.transaction_guard` is absent.

- [ ] **Step 5: Implement and compose the guard**

Create `backend/transaction_guard.py`:

```python
from typing import Awaitable, Callable, TypeVar

from transaction_execution import (
    RetryMode,
    TransactionExecutor,
    TransactionUnavailableError,
)


T = TypeVar("T")
MutationCallback = Callable[[object], Awaitable[T]]
EnabledProvider = Callable[[], bool]


class TransactionMutationGuard:
    def __init__(
        self,
        executor: TransactionExecutor,
        enabled_provider: EnabledProvider = lambda: True,
    ):
        self.executor = executor
        self.enabled_provider = enabled_provider

    async def run(
        self,
        callback: MutationCallback[T],
        *,
        operation_name: str,
        retry_safe: bool = False,
        correlation_id: str | None = None,
    ) -> T:
        if not self.enabled_provider():
            raise TransactionUnavailableError()
        retry_mode = (
            RetryMode.DRIVER_TRANSIENT if retry_safe else RetryMode.NEVER
        )
        return await self.executor.execute(
            callback,
            operation_name=operation_name,
            retry_mode=retry_mode,
            correlation_id=correlation_id,
        )
```

Apply these exact composition changes to `backend/server.py`:

```diff
 from permissions import canonical_roles, has_permission, permissions_for
+from transaction_api import transaction_unavailable_handler
+from transaction_execution import TransactionExecutor, TransactionUnavailableError
+from transaction_guard import TransactionMutationGuard
@@
 app = FastAPI(title="NIUVA API")
 app.state.database_capabilities = DatabaseCapabilities(transactions=False)
 app.state.reservation_expiry_task = None
+app.state.transaction_executor = TransactionExecutor(
+    client,
+    lambda: app.state.database_capabilities,
+)
+app.state.transaction_guard = TransactionMutationGuard(
+    app.state.transaction_executor,
+    lambda: os.environ.get(
+        "TRANSACTION_MUTATIONS_ENABLED", "false"
+    ).strip().lower() == "true",
+)
+app.add_exception_handler(
+    TransactionUnavailableError,
+    transaction_unavailable_handler,
+)
 api = APIRouter(prefix="/api")
```

Append to `backend/.env.example`:

```env

# Fail closed by default. Enable only after GET /api/health/ready reports transactions ready.
TRANSACTION_MUTATIONS_ENABLED=false
```

- [ ] **Step 6: Inspect the composition for bypass paths**

Run: `rg -n "transaction_guard|TRANSACTION_MUTATIONS_ENABLED|TransactionUnavailableError" backend/server.py backend/transaction_guard.py backend/.env.example`

Expected: `false` is the default; disabled state raises the same controlled exception; enabled state still calls `TransactionExecutor`. No callback invocation exists outside `executor.execute`.

- [ ] **Step 7: Run the focused tests to verify GREEN**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_guard.py backend\tests\test_transaction_error_contract.py`

- [ ] **Step 8: Confirm focused passing output**

Expected: `8 passed` and exit code `0`.

- [ ] **Step 9: Run guard/API/readiness regressions**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_guard.py backend\tests\test_transaction_error_contract.py backend\tests\test_transaction_execution.py backend\tests\test_health.py backend\tests\test_catalog_routes.py backend\tests\test_inventory_service.py`

Expected: all selected tests pass. Catalog and inventory behavior remains unchanged because this task only exposes the shared boundary for later adoption.

- [ ] **Step 10: Commit only Task 7 files**

```powershell
git add -- backend/transaction_guard.py backend/tests/test_transaction_guard.py backend/tests/test_transaction_error_contract.py backend/server.py backend/.env.example
git diff --cached --check
git commit -m "feat: add fail-closed transaction mutation guard"
```

### Task 8: Safe structured transaction observability

**Owner:** Developer 1 — PM and Integration Lead

**Files:**
- Create: `backend/transaction_observability.py`
- Create: `backend/tests/test_transaction_observability.py`
- Modify: `backend/transaction_execution.py`
- Modify: `backend/server.py` at transaction-executor construction

**Interfaces:**
- Consumes: Task 2's `EventSink(event: str, fields: dict[str, object])` hook and standard-library `logging.Logger`.
- Produces: `safe_correlation_id(value: object) -> str | None`; `safe_operation_name(value: object, *, fallback: str = "redacted") -> str`; `safe_enum(value: object, allowed: set, *, fallback)`; `TransactionLogSink(logger)`; allowlisted log record attribute `transaction` containing only `event`, `operation_name`, `outcome`, `attempt`, `retry_mode`, `correlation_id`, and `error_class`.
- Event vocabulary: `transaction_rejected`, `transaction_start`, `transaction_commit`, `transaction_commit_unknown`, `transaction_abort`, and `transaction_retry`.
- Correlation boundary: `safe_correlation_id` parses with standard-library `uuid.UUID`, accepts canonical UUID text case-insensitively, and emits its canonical lowercase representation; every non-UUID value becomes `None`.
- Trust boundary: the repository has no trusted request-ID middleware, so this task adds none and most calls pass `correlation_id=None`. Raw authorization headers, cookies, query parameters, request bodies, customer payloads, and payment/provider payloads are never trusted as correlation IDs.
- Field boundary: operation names and enum-like fields use separate narrow validators; the correlation validator never reuses the generic operation/enum token path. No metrics mechanism is invented.

- [ ] **Step 1: Write the failing observability tests**

Create `backend/tests/test_transaction_observability.py`:

```python
import asyncio
import logging

import pytest
from pymongo.errors import OperationFailure

from database_capabilities import DatabaseCapabilities
from transaction_execution import (
    TransactionCommitOutcomeUnknownError,
    TransactionExecutor,
    TransactionUnavailableError,
)
from transaction_observability import (
    ALLOWED_EVENTS,
    TransactionLogSink,
    safe_correlation_id,
)


VALID_CORRELATION_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
UNTRUSTED_REQUEST_VALUES = {
    "authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.private.signature",
    "cookie": "session=sk_live_private",
    "query": "request-123",
    "request_body": "customer-body-private",
    "provider_payload": "api_key_live_private",
}
INVALID_CORRELATION_IDS = (
    "eyJhbGciOiJIUzI1NiJ9.private.signature",
    "sk_live_private",
    "Bearer eyJhbGciOiJIUzI1NiJ9.private.signature",
    "mongodb://user:secret@db.internal",
    "request-123",
    "x" * 129,
    "customer-body-private",
)


class FakeSession:
    def __init__(self, commit_errors=None):
        self.commit_errors = list(commit_errors or [])
        self.in_transaction = False
        self.starts = 0
        self.commits = 0
        self.aborts = 0
        self.ends = 0

    def start_transaction(self):
        self.starts += 1
        self.in_transaction = True

    async def commit_transaction(self):
        self.commits += 1
        if self.commit_errors:
            raise self.commit_errors.pop(0)
        self.in_transaction = False

    async def abort_transaction(self):
        self.aborts += 1
        self.in_transaction = False

    async def end_session(self):
        self.ends += 1


class FakeClient:
    def __init__(self, session=None):
        self.session = session or FakeSession()

    async def start_session(self):
        return self.session


def test_log_sink_keeps_only_allowlisted_safe_fields(caplog):
    logger = logging.getLogger("niuva.transaction.test")
    sink = TransactionLogSink(logger)

    with caplog.at_level(logging.INFO, logger=logger.name):
        sink(
            "transaction_commit",
            {
                "operation_name": "mongodb://user:secret@db.internal",
                "outcome": "committed",
                "attempt": 1,
                "retry_mode": "never",
                "correlation_id": "unsafe token value",
                "connection_string": "mongodb://user:secret@db.internal",
                "customer_payload": {"email": "private@example.com"},
            },
        )

    record = caplog.records[-1]
    assert record.getMessage() == "mongodb_transaction"
    assert record.transaction == {
        "event": "transaction_commit",
        "operation_name": "redacted",
        "outcome": "committed",
        "attempt": 1,
        "retry_mode": "never",
        "correlation_id": None,
        "error_class": None,
    }
    assert "secret" not in str(record.transaction)
    assert "private@example.com" not in str(record.transaction)



def test_safe_correlation_id_retains_canonical_uuid():
    assert safe_correlation_id(VALID_CORRELATION_ID) == VALID_CORRELATION_ID


def test_safe_correlation_id_canonicalizes_uppercase_uuid():
    assert safe_correlation_id(VALID_CORRELATION_ID.upper()) == VALID_CORRELATION_ID


def test_untrusted_request_values_are_never_sourced_as_correlation_ids():
    values = (*INVALID_CORRELATION_IDS, *UNTRUSTED_REQUEST_VALUES.values())
    assert all(safe_correlation_id(value) is None for value in values)


def test_invalid_correlation_ids_are_none_in_every_lifecycle_event(caplog):
    logger = logging.getLogger("niuva.transaction.correlation.security")
    sink = TransactionLogSink(logger)
    values = (*INVALID_CORRELATION_IDS, *UNTRUSTED_REQUEST_VALUES.values())

    with caplog.at_level(logging.INFO, logger=logger.name):
        for event in ALLOWED_EVENTS:
            for value in values:
                sink(
                    event,
                    {
                        "operation_name": "inventory.reserve",
                        "outcome": "unknown",
                        "attempt": 2,
                        "retry_mode": "never",
                        "correlation_id": value,
                        "error_class": "commit_outcome_unknown",
                    },
                )
                assert caplog.records[-1].transaction["event"] == event
                assert caplog.records[-1].transaction["correlation_id"] is None

    serialized = str([record.transaction for record in caplog.records])
    for forbidden in (
        "eyJhbGci",
        "sk_live",
        "Bearer ",
        "mongodb://",
        "request-123",
        "customer-body-private",
        "api_key_live_private",
    ):
        assert forbidden not in serialized


def test_executor_emits_start_and_commit_without_payload():
    events = []
    executor = TransactionExecutor(
        FakeClient(),
        lambda: DatabaseCapabilities(transactions=True),
        event_sink=lambda event, fields: events.append((event, fields)),
    )

    async def run():
        async def callback(_session):
            return {"customer_payload": "must-not-be-logged"}

        return await executor.execute(
            callback,
            operation_name="inventory.reserve",
            correlation_id=VALID_CORRELATION_ID,
        )

    assert asyncio.run(run()) == {"customer_payload": "must-not-be-logged"}
    assert [event for event, _fields in events] == [
        "transaction_start",
        "transaction_commit",
    ]
    assert all("customer_payload" not in fields for _event, fields in events)
    assert all(
        fields["correlation_id"] == VALID_CORRELATION_ID for _event, fields in events
    )


def test_executor_emits_abort_with_safe_error_class():
    events = []
    executor = TransactionExecutor(
        FakeClient(),
        lambda: DatabaseCapabilities(transactions=True),
        event_sink=lambda event, fields: events.append((event, fields)),
    )

    async def run():
        async def callback(_session):
            raise ValueError("customer=private token=secret")

        with pytest.raises(ValueError):
            await executor.execute(
                callback,
                operation_name="catalog.publish",
            )

    asyncio.run(run())
    assert events[-1][0] == "transaction_abort"
    assert events[-1][1]["error_class"] == "application_error"
    assert "private" not in str(events)
    assert "secret" not in str(events)


def test_capability_rejection_emits_no_topology_detail():
    events = []
    executor = TransactionExecutor(
        FakeClient(),
        lambda: DatabaseCapabilities(transactions=False),
        event_sink=lambda event, fields: events.append((event, fields)),
    )

    async def run():
        with pytest.raises(TransactionUnavailableError):
            await executor.execute(
                lambda _session: None,
                operation_name="inventory.reserve",
            )

    asyncio.run(run())
    assert events == [
        (
            "transaction_rejected",
            {
                "operation_name": "inventory.reserve",
                "outcome": "unavailable",
                "attempt": 0,
                "retry_mode": "never",
                "correlation_id": None,
                "error_class": "transaction_unavailable",
            },
        )
    ]


def test_executor_emits_commit_unknown_without_abort_or_driver_detail():
    commit_errors = [
        OperationFailure(
            "mongodb://user:secret@db.internal",
            details={"errorLabels": ["UnknownTransactionCommitResult"]},
        )
        for _attempt in range(2)
    ]
    session = FakeSession(commit_errors)
    events = []
    callback_calls = 0
    executor = TransactionExecutor(
        FakeClient(session),
        lambda: DatabaseCapabilities(transactions=True),
        max_commit_attempts=2,
        event_sink=lambda event, fields: events.append((event, fields)),
    )

    async def run():
        nonlocal callback_calls

        async def callback(_session):
            nonlocal callback_calls
            callback_calls += 1
            return {"customer": "must-not-be-logged"}

        with pytest.raises(TransactionCommitOutcomeUnknownError):
            await executor.execute(
                callback,
                operation_name="catalog.publish",
            )

    asyncio.run(run())
    assert callback_calls == 1
    assert (session.starts, session.commits, session.aborts, session.ends) == (
        1,
        2,
        0,
        1,
    )
    assert [event for event, _fields in events] == [
        "transaction_start",
        "transaction_commit_unknown",
    ]
    assert events[-1][1] == {
        "operation_name": "catalog.publish",
        "outcome": "unknown",
        "attempt": 2,
        "retry_mode": "never",
        "correlation_id": None,
        "error_class": "commit_outcome_unknown",
    }
    assert "transaction_abort" not in [event for event, _fields in events]
    assert "aborted" not in str(events)
    assert "secret" not in str(events)
    assert "db.internal" not in str(events)
    assert "must-not-be-logged" not in str(events)

```

- [ ] **Step 2: Inspect the complete logging security contract**

Run: `git diff -- backend/tests/test_transaction_observability.py`

Expected: nine tests require all six lifecycle events, safe unknown-outcome reconciliation, canonical lowercase UUID handling, uppercase UUID normalization, and `None` for JWTs, API keys, bearer tokens, MongoDB URIs, request-like tokens, overlong values, customer/provider payloads, and every raw request source.

- [ ] **Step 3: Run the focused test to verify RED**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_observability.py`

- [ ] **Step 4: Confirm the expected failure**

Expected: collection fails with `ModuleNotFoundError: No module named 'transaction_observability'`.

- [ ] **Step 5: Implement the log sink and lifecycle events**

Create `backend/transaction_observability.py`:

```python
import logging
import re
from uuid import UUID


SAFE_OPERATION_NAME = re.compile(r"^[A-Za-z0-9_.:-]{1,128}$")
ALLOWED_EVENTS = {
    "transaction_rejected",
    "transaction_start",
    "transaction_commit",
    "transaction_commit_unknown",
    "transaction_abort",
    "transaction_retry",
}
ALLOWED_OUTCOMES = {
    "unavailable",
    "started",
    "committed",
    "unknown",
    "aborted",
    "retrying",
}
ALLOWED_ERROR_CLASSES = {
    None,
    "transaction_unavailable",
    "commit_outcome_unknown",
    "database_error",
    "application_error",
}
ALLOWED_RETRY_MODES = {"never", "driver_transient"}


def safe_operation_name(value: object, *, fallback: str = "redacted") -> str:
    text = str(value)
    return text if SAFE_OPERATION_NAME.fullmatch(text) else fallback


def safe_enum(value: object, allowed: set[object], *, fallback):
    return value if value in allowed else fallback


def safe_correlation_id(value: object) -> str | None:
    if not isinstance(value, str):
        return None
    try:
        canonical = str(UUID(value))
        return canonical if value.lower() == canonical else None
    except (ValueError, AttributeError, TypeError):
        return None


class TransactionLogSink:
    def __init__(self, logger: logging.Logger):
        self.logger = logger

    def __call__(self, event: str, fields: dict[str, object]) -> None:
        transaction = {
            "event": safe_enum(
                event, ALLOWED_EVENTS, fallback="transaction_abort"
            ),
            "operation_name": safe_operation_name(
                fields.get("operation_name"), fallback="redacted"
            ),
            "outcome": safe_enum(
                fields.get("outcome"), ALLOWED_OUTCOMES, fallback="aborted"
            ),
            "attempt": int(fields.get("attempt", 0)),
            "retry_mode": safe_enum(
                fields.get("retry_mode"), ALLOWED_RETRY_MODES, fallback="never"
            ),
            "correlation_id": safe_correlation_id(
                fields.get("correlation_id")
            ),
            "error_class": safe_enum(
                fields.get("error_class"),
                ALLOWED_ERROR_CLASSES,
                fallback="database_error",
            ),
        }
        self.logger.info(
            "mongodb_transaction",
            extra={"transaction": transaction},
        )
```

Add this method inside `TransactionExecutor` immediately after `__init__`:

```python
    def _emit(
        self,
        event: str,
        *,
        operation_name: str,
        outcome: str,
        attempt: int,
        retry_mode: RetryMode,
        correlation_id: str | None,
        error_class: str | None = None,
    ) -> None:
        self.event_sink(
            event,
            {
                "operation_name": operation_name,
                "outcome": outcome,
                "attempt": attempt,
                "retry_mode": retry_mode.value,
                "correlation_id": correlation_id,
                "error_class": error_class,
            },
        )
```

Apply these exact event calls inside `TransactionExecutor.execute`:

```diff
     ) -> T:
         if not self.capability_provider().transactions:
+            self._emit(
+                "transaction_rejected",
+                operation_name=operation_name,
+                outcome="unavailable",
+                attempt=0,
+                retry_mode=retry_mode,
+                correlation_id=correlation_id,
+                error_class="transaction_unavailable",
+            )
             raise TransactionUnavailableError()
@@
             session = await self.client.start_session()
             for attempt in range(1, self.max_transaction_attempts + 1):
                 session.start_transaction()
+                self._emit(
+                    "transaction_start",
+                    operation_name=operation_name,
+                    outcome="started",
+                    attempt=attempt,
+                    retry_mode=retry_mode,
+                    correlation_id=correlation_id,
+                )
                 try:
                     result = await callback(session)
                     await self._commit(session)
+                    self._emit(
+                        "transaction_commit",
+                        operation_name=operation_name,
+                        outcome="committed",
+                        attempt=attempt,
+                        retry_mode=retry_mode,
+                        correlation_id=correlation_id,
+                    )
                     return result
-                except TransactionCommitOutcomeUnknownError:
+                except TransactionCommitOutcomeUnknownError as exc:
+                    self._emit(
+                        "transaction_commit_unknown",
+                        operation_name=operation_name,
+                        outcome="unknown",
+                        attempt=exc.attempts,
+                        retry_mode=retry_mode,
+                        correlation_id=correlation_id,
+                        error_class="commit_outcome_unknown",
+                    )
                     raise
                 except PyMongoError as exc:
                     await self._abort_if_active(session)
+                    self._emit(
+                        "transaction_abort",
+                        operation_name=operation_name,
+                        outcome="aborted",
+                        attempt=attempt,
+                        retry_mode=retry_mode,
+                        correlation_id=correlation_id,
+                        error_class="database_error",
+                    )
                     if _is_unavailable(exc):
                         raise TransactionUnavailableError() from exc
@@
                     )
                     if retry_allowed:
+                        self._emit(
+                            "transaction_retry",
+                            operation_name=operation_name,
+                            outcome="retrying",
+                            attempt=attempt,
+                            retry_mode=retry_mode,
+                            correlation_id=correlation_id,
+                            error_class="database_error",
+                        )
                         continue
                     raise
-                except BaseException:
+                except BaseException:
                     await self._abort_if_active(session)
+                    self._emit(
+                        "transaction_abort",
+                        operation_name=operation_name,
+                        outcome="aborted",
+                        attempt=attempt,
+                        retry_mode=retry_mode,
+                        correlation_id=correlation_id,
+                        error_class="application_error",
+                    )
                     raise
```

Wire the safe sink in `backend/server.py`:

```diff
 from transaction_guard import TransactionMutationGuard
+from transaction_observability import TransactionLogSink
@@
 app.state.transaction_executor = TransactionExecutor(
     client,
     lambda: app.state.database_capabilities,
+    event_sink=TransactionLogSink(logging.getLogger("niuva.transaction")),
 )
```

- [ ] **Step 6: Inspect event fields and forbidden values**

Run: `rg -n "authorization|cookie|query|request|customer|provider|connection|mongo_url|payload|password|token|exception|str\\(exc\\)|safe_correlation_id" backend/transaction_observability.py backend/transaction_execution.py`

Expected: no raw request source, customer/provider payload, connection string, password, sensitive token, exception message, or `str(exc)` is sent to the event sink. `safe_correlation_id` uses `uuid.UUID`, emits only canonical lowercase UUID text, and turns every noncanonical or invalid value into `None`.

- [ ] **Step 7: Run the focused test to verify GREEN**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_observability.py`

- [ ] **Step 8: Confirm focused passing output**

Expected: `9 passed` and exit code `0`.

- [ ] **Step 9: Run executor/guard/readiness regressions**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_observability.py backend\tests\test_transaction_execution.py backend\tests\test_transaction_guard.py backend\tests\test_health.py`

Expected: all selected tests pass. No metrics assertion is added because the repository has no established metrics mechanism.

- [ ] **Step 10: Commit only Task 8 files**

```powershell
git add -- backend/transaction_observability.py backend/tests/test_transaction_observability.py backend/transaction_execution.py backend/server.py
git diff --cached --check
git commit -m "feat: add safe transaction lifecycle diagnostics"
```

### Task 9: Documentation and developer verification

**Owner:** Developer 3 — Test Infrastructure and Readiness Owner

**Files:**
- Create: `doc/TRANSACTION_CAPABILITY_RUNBOOK.md`
- Create: `backend/tests/test_transaction_documentation.py`
- Modify: `doc/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md:13-23,151-169`
- Modify: `doc/PRODUCTION_DEPLOYMENT.md` under `Approved Architecture Gates`

**Interfaces:**
- Consumes: exact Compose, environment, health, guard, CI, and test commands from Tasks 4–8.
- Produces: one canonical operator/developer runbook and stable links from existing operational documentation.
- Boundary: documentation covers local development and isolated CI. It does not authorize staging/production topology, mutation enablement, infrastructure purchase, or go-live.

- [ ] **Step 1: Write the failing documentation contract tests**

Create `backend/tests/test_transaction_documentation.py`:

```python
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
RUNBOOK = ROOT / "doc" / "TRANSACTION_CAPABILITY_RUNBOOK.md"


def runbook_text():
    return RUNBOOK.read_text(encoding="utf-8")


def test_runbook_documents_local_ci_readiness_and_troubleshooting():
    text = runbook_text()
    for required in (
        "docker-compose.transaction.yml",
        "docker-compose.transaction-test.yml",
        "MONGO_TRANSACTION_TEST_URL",
        "replicaSet=rs0&directConnection=true",
        "mongodb://mongodb:27017/admin?directConnection=true",
        "replicaSet=rs-test&directConnection=true",
        "mongodb://mongodb-test:27018/admin?directConnection=true",
        "directConnection=true is limited to tracked single-node environments",
        "TRANSACTION_MUTATIONS_ENABLED=false",
        "GET /api/health/live",
        "GET /api/health/ready",
        "transaction_unavailable",
        "transaction_commit_outcome_unknown",
        "transaction_commit_unknown",
        "reconciliation is required",
        "safe_correlation_id",
        "canonical lowercase UUID",
        "correlation_id=None",
        "Authorization headers",
        "request bodies",
        "reset-local-replica-set.ps1 -DestroyData",
        "test_transaction_integration.py",
        "Troubleshooting",
        "Known Limitations",
    ):
        assert required in text


def test_runbook_disclaims_checkout_and_production_authorization():
    text = runbook_text()
    assert "Technical Design Candidate — not approved for implementation" in text
    assert "does not authorize production infrastructure" in text
    assert "does not authorize production go-live" in text
    assert "silent non-atomic fallback is prohibited" in text
```

- [ ] **Step 2: Inspect the complete documentation assertions**

Run: `git diff -- backend/tests/test_transaction_documentation.py`

Expected: exact local/CI commands, variables, endpoints, error code, reset warning, limitations, Retail Checkout status, and production disclaimers are required.

- [ ] **Step 3: Run the focused test to verify RED**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_documentation.py`

- [ ] **Step 4: Confirm the expected failure**

Expected: both tests fail with `FileNotFoundError` because `doc/TRANSACTION_CAPABILITY_RUNBOOK.md` does not exist.

- [ ] **Step 5: Write the operational documentation**

Create `doc/TRANSACTION_CAPABILITY_RUNBOOK.md`:

```markdown
# MongoDB Transaction Capability Runbook

Status: Development and CI foundation only.

This runbook implements the internal architecture direction in
`doc/decisions/ADR-001-mongodb-transaction-capability.md`. It does not
authorize production infrastructure, production mutation enablement, or
production go-live.

Retail Checkout remains **Technical Design Candidate — not approved for
implementation**. This runbook does not implement checkout, payment,
shipping, tax, refunds, or production storage.

## Contracts

- Transaction-required cross-collection mutations use the shared
  `TransactionMutationGuard` and `TransactionExecutor`.
- Capability rejection returns `503 transaction_unavailable` before the
  callback executes.
- The default callback retry mode is no retry. A caller must explicitly mark
  a callback retry-safe before `TransientTransactionError` may rerun it.
- `UnknownTransactionCommitResult` retries only `commit_transaction`; it never reruns the callback or starts a replacement transaction.
- If commit attempts are exhausted, `TransactionCommitOutcomeUnknownError` records `transaction_commit_outcome_unknown`, requires reconciliation, and emits `transaction_commit_unknown` with outcome `unknown`.
- An unknown commit outcome is not aborted, is not mapped to `503 transaction_unavailable`, and must not be retried automatically because the mutation may already have committed.
- Standalone MongoDB remains limited to reads or operations proven safe as
  single-document atomic writes.
- Structured transaction logs pass correlation IDs through
  `safe_correlation_id`, which accepts canonical UUID text case-insensitively
  and emits a canonical lowercase UUID. Invalid or noncanonical input becomes
  `correlation_id=None`.
- Only trusted server-side code may supply a correlation UUID. Authorization
  headers, cookies, query parameters, request bodies, customer data, and
  provider/payment payloads are never correlation-ID sources.
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
`mongodb://mongodb:27017/admin?directConnection=true` for this one-member topology.

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
- The tracked Compose topology is for local development and CI only. `directConnection=true is limited to tracked single-node environments`; it does not define the staging or production connection model.
- Staging and production must use separately approved topology discovery and connection settings.
- Staging/production topology, persistence, monitoring, backup/restore,
  incident ownership, and production readiness remain open.
- This foundation does not authorize production infrastructure and does not
  authorize production go-live.
```

Apply these exact pointer updates to
`doc/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md`:

```diff
 ## 2. Prasyarat MongoDB Replica Set dan Capability Check
+
+Setup local, isolated test topology, readiness fields, troubleshooting, dan
+reset aman mengikuti `doc/TRANSACTION_CAPABILITY_RUNBOOK.md`.
@@
 Real transaction test memerlukan Mongo 7 single-node replica set, polling `db.hello().isWritablePrimary`, environment `MONGO_TRANSACTION_TEST_URL`, dan eksekusi:
+
+Gunakan `docker-compose.transaction-test.yml` dan command cleanup dari
+`doc/TRANSACTION_CAPABILITY_RUNBOOK.md`; skipped module bukan bukti lulus CI.
```

Append under `Approved Architecture Gates` in
`doc/PRODUCTION_DEPLOYMENT.md`:

```markdown
Transaction-capability setup tracked in this repository is limited to local
development and isolated CI. See
`doc/TRANSACTION_CAPABILITY_RUNBOOK.md`. Staging/production topology,
persistence, monitoring, backup/restore, incident ownership, mutation
enablement, and go-live require separate approval.
```

- [ ] **Step 6: Validate repository-relative pointers**

Run:

```powershell
$paths = @(
    "doc/decisions/ADR-001-mongodb-transaction-capability.md",
    "docker-compose.transaction.yml",
    "docker-compose.transaction-test.yml",
    "scripts/mongodb/wait-for-replica-set.ps1",
    ".github/workflows/transaction-tests.yml",
    "backend/tests/test_transaction_integration.py"
)
$missing = $paths | Where-Object { -not (Test-Path -LiteralPath $_) }
if ($missing) { $missing; exit 1 }
```

Expected: exit code `0` and no missing path output.

- [ ] **Step 7: Run the focused documentation tests to verify GREEN**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_documentation.py`

- [ ] **Step 8: Confirm focused passing output**

Expected: `2 passed` and exit code `0`.

- [ ] **Step 9: Run documentation/topology regressions**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_documentation.py backend\tests\test_transaction_topology_files.py backend\tests\test_health.py`

Expected: all selected tests pass and all documented commands/names match implementation files.

- [ ] **Step 10: Commit only Task 9 files**

```powershell
git add -- doc/TRANSACTION_CAPABILITY_RUNBOOK.md backend/tests/test_transaction_documentation.py doc/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md doc/PRODUCTION_DEPLOYMENT.md
git diff --cached --check
git commit -m "docs: document transaction-capable development setup"
```

### Task 10: End-to-end verification and two-level rollback

**Owner:** Developer 1 — PM and Integration Lead

**Files:**
- Modify: `backend/tests/test_transaction_documentation.py`
- Modify: `doc/TRANSACTION_CAPABILITY_RUNBOOK.md`

**Interfaces:**
- Consumes: every file, command, test, feature gate, and commit subject from Tasks 1–9.
- Produces: executable final verification sequence; code-revert procedure; runtime mutation-disable procedure.
- Rollback invariant: code rollback preserves committed data, and runtime disablement returns fail-closed errors. Neither path enables a non-atomic fallback.

- [ ] **Step 1: Write the failing rollback-documentation test**

Append to `backend/tests/test_transaction_documentation.py`:

```python
def test_runbook_defines_two_level_rollback_without_fallback():
    text = runbook_text()
    assert "## Final Verification" in text
    assert "## Level 1 — Code Rollback" in text
    assert "## Level 2 — Runtime Mutation Disablement" in text
    assert 'TRANSACTION_MUTATIONS_ENABLED="false"' in text
    assert "git revert --no-edit" in text
    assert "does not enable a non-atomic fallback" in text
    assert "do not roll back committed database records" in text
```

- [ ] **Step 2: Inspect the complete rollback assertions**

Run: `git diff -- backend/tests/test_transaction_documentation.py`

Expected: both rollback levels, exact disabled value, executable `git revert`, database preservation, and the no-fallback invariant are asserted.

- [ ] **Step 3: Run the focused test to verify RED**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_documentation.py`

- [ ] **Step 4: Confirm the expected failure**

Expected: the new test fails because the three final verification/rollback headings do not yet exist.

- [ ] **Step 5: Add final verification and rollback procedures**

Append to `doc/TRANSACTION_CAPABILITY_RUNBOOK.md`:

```markdown
## Final Verification

From the repository root, with the isolated `rs-test` topology available:

```powershell
docker compose -f docker-compose.transaction.yml config --quiet
docker compose -f docker-compose.transaction-test.yml config --quiet
docker compose -f docker-compose.transaction-test.yml up -d
$env:MONGO_TRANSACTION_TEST_URL = "mongodb://127.0.0.1:27018/?replicaSet=rs-test&directConnection=true"
.\backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_integration.py backend\tests\test_inventory_transactions.py
.\backend\.venv\Scripts\python.exe -m pytest -q --basetemp C:\tmp\niuva-transaction-final backend\tests
.\backend\.venv\Scripts\python.exe -m black --check backend\database_capabilities.py backend\transaction_api.py backend\transaction_execution.py backend\transaction_guard.py backend\transaction_observability.py backend\tests\test_transaction_*.py
.\backend\.venv\Scripts\python.exe -m flake8 backend\database_capabilities.py backend\transaction_api.py backend\transaction_execution.py backend\transaction_guard.py backend\transaction_observability.py backend\tests\test_transaction_*.py
.\backend\.venv\Scripts\python.exe -m mypy --ignore-missing-imports --check-untyped-defs backend\database_capabilities.py backend\transaction_api.py backend\transaction_execution.py backend\transaction_guard.py backend\transaction_observability.py
.\backend\.venv\Scripts\python.exe -m pip check
git diff --check
git status --short
```

Expected results:

- both Compose files parse;
- real transaction tests pass with no skipped module;
- the complete backend suite has zero failures;
- focused format, lint, and type checks have zero errors;
- `pip check` reports no broken requirements;
- `git diff --check` exits zero;
- only reviewed implementation files remain in `git status --short` before
  task commits, and the worktree is clean after the final commit.

Resolve the immutable approved-plan merge baseline once, and fail if it cannot
be identified:

```powershell
git fetch origin --prune
$planCommit = git log origin/main -1 --format=%H --fixed-strings --grep="^docs: plan transaction capability foundation$"
if (-not $planCommit) { throw "Approved plan commit is not present on origin/main" }

$reviewedPlanBaseline = $null
foreach ($candidate in (git rev-list --first-parent --reverse origin/main)) {
    git merge-base --is-ancestor $planCommit $candidate
    if ($LASTEXITCODE -eq 0) {
        $reviewedPlanBaseline = $candidate
        break
    }
}
if (-not $reviewedPlanBaseline) { throw "Approved plan merge commit not found" }
$parentCount = (git rev-list --parents -n 1 $reviewedPlanBaseline).Split(" ").Count - 1
if ($parentCount -lt 2) { throw "Approved plan baseline is not a merge commit" }
```

There is no frontend file in this foundation. Confirm with
`git diff --name-only $reviewedPlanBaseline...HEAD -- frontend`. If it
prints no path, record frontend regression as not applicable and retain the
accepted planning baseline evidence. If a frontend path appears unexpectedly,
stop integration and run `npm test -- --watchAll=false --runInBand` plus
`npm run build` after resolving the scope violation.

Always clean the isolated topology:

```powershell
docker compose -f docker-compose.transaction-test.yml down --volumes --remove-orphans
Remove-Item Env:MONGO_TRANSACTION_TEST_URL -ErrorAction SilentlyContinue
```

The integration lead records `$reviewedPlanBaseline` in the integration PR
description before running the scope commands. The resolved commit is not a
guessed SHA and must be identical for all three feature branches.

## Level 1 — Code Rollback

Use revert commits; do not reset shared history and do not roll back committed
database records. From the integration branch, locate the exact task commits
by their fixed subjects and revert them newest-first:

```powershell
$subjects = @(
    "docs: finalize transaction verification and rollback",
    "docs: document transaction-capable development setup",
    "feat: add safe transaction lifecycle diagnostics",
    "feat: add fail-closed transaction mutation guard",
    "ci: run transaction tests against mongodb replica set",
    "chore: configure local mongodb replica set",
    "feat: expose transaction readiness diagnostics",
    "feat: define transaction unavailable API contract",
    "feat: add mongodb transaction execution boundary",
    "feat: add mongodb transaction capability detection"
)
foreach ($subject in $subjects) {
    $sha = git log -1 --format=%H --fixed-strings --grep="^$subject$"
    if (-not $sha) { throw "Missing task commit: $subject" }
    git revert --no-edit $sha
    if ($LASTEXITCODE -ne 0) { throw "Revert failed for: $subject" }
}
```

Run the full regression suite after the reverts. Deploy only a reviewed,
known-good artifact. Do not delete transaction evidence, publication,
inventory, reservation, movement, or audit records.

## Level 2 — Runtime Mutation Disablement

For every service that has adopted `TransactionMutationGuard`, set the
server-side environment value to false and restart that service through its
separately approved environment-management process:

```powershell
$env:TRANSACTION_MUTATIONS_ENABLED="false"
```

Verify:

1. `GET /api/health/live` still returns `200`.
2. Safe read-only/public operations remain available.
3. A guard contract test returns `503 transaction_unavailable` before its
   callback executes.
4. Transaction logs contain `transaction_rejected` without connection or
   customer data.
5. No writer switches to direct non-transactional collection calls.

This runtime switch applies only to consumers that have explicitly adopted the
guard. Existing catalog/inventory transaction code remains under its current
capability gate until a separate behavior-preserving adoption review. The
foundation flag must not be represented as disabling code that does not yet
consume it.

Runtime disablement does not enable a non-atomic fallback. Keep mutation
disabled until capability, tests, review, and operational approval are all
restored.
```

- [ ] **Step 6: Run focused rollback/documentation checks**

Run: `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_documentation.py backend\tests\test_transaction_execution.py backend\tests\test_transaction_guard.py backend\tests\test_transaction_observability.py`

Expected: all selected tests pass, including exhausted unknown commit outcome without callback rerun/abort, safe unknown-outcome observability, and the two-level rollback contract.

- [ ] **Step 7: Run the full final verification sequence**

Run every command under `Final Verification` in order. Use the reviewed plan merge SHA in the frontend scope check. Do not omit the real transaction modules and do not treat a skip as a pass.

- [ ] **Step 8: Confirm complete passing evidence**

Expected: all Compose validations, real transaction tests, complete backend regression, focused format/lint/type checks, dependency check, whitespace check, and scope check exit `0`. The isolated topology is removed afterward.

- [ ] **Step 9: Inspect final implementation scope**

Run:

```powershell
git diff --name-status $reviewedPlanBaseline...HEAD
git log --oneline $reviewedPlanBaseline..HEAD
git status --short
```

Expected: only files listed in this plan and the ten task-level commits are present; no Retail Checkout, payment, shipping, tax, refund, production storage, frontend, migration, or production-infrastructure implementation appears. `$reviewedPlanBaseline` must resolve to the immutable approved plan merge commit before these commands run.

- [ ] **Step 10: Commit only Task 10 files**

```powershell
git add -- doc/TRANSACTION_CAPABILITY_RUNBOOK.md backend/tests/test_transaction_documentation.py
git diff --cached --check
git commit -m "docs: finalize transaction verification and rollback"
```

## Acceptance-Criteria Traceability

| AC | Required result | Task | Test path | Exact test or verification name | Verification command |
|---:|---|---:|---|---|---|
| 1 | Capability is detected without business-data mutation | 1 | `backend/tests/test_database_capabilities.py` | `test_probe_proves_read_only_session_and_transaction_capability` | `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_database_capabilities.py::test_probe_proves_read_only_session_and_transaction_capability` |
| 2 | Local mutation development uses deterministic direct connection to single-node `rs0`, limited to local use | 5 | `backend/tests/test_transaction_topology_files.py` | `test_local_replica_set_topology_is_persistent_and_non_destructive` | `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_topology_files.py::test_local_replica_set_topology_is_persistent_and_non_destructive` |
| 3 | CI uses deterministic direct connection to isolated single-node `rs-test` on grounded CPython `3.14.3`, and proves usable probe/commit/abort behavior | 6 | `backend/tests/test_transaction_topology_files.py` and `backend/tests/test_transaction_integration.py` | `test_ci_replica_set_is_ephemeral_mandatory_and_isolated`; `test_real_probe_commit_abort_and_cleanup` | `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_topology_files.py::test_ci_replica_set_is_ephemeral_mandatory_and_isolated backend\tests\test_transaction_integration.py::test_real_probe_commit_abort_and_cleanup` |
| 4 | Unavailable transaction requests return `503 transaction_unavailable` | 3 | `backend/tests/test_transaction_error_contract.py` | `test_transaction_unavailable_response_uses_stable_existing_envelope` | `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_error_contract.py::test_transaction_unavailable_response_uses_stable_existing_envelope` |
| 5 | No mutation callback executes after capability rejection | 2 | `backend/tests/test_transaction_execution.py` | `test_unavailable_capability_fails_closed_before_callback` | `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_execution.py::test_unavailable_capability_fails_closed_before_callback` |
| 6 | No transaction-required write falls back to non-atomic behavior | 7 | `backend/tests/test_transaction_guard.py` | `test_runtime_disable_does_not_invoke_callback_or_fallback` | `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_guard.py::test_runtime_disable_does_not_invoke_callback_or_fallback` |
| 7 | Session lifecycle is deterministic | 2 | `backend/tests/test_transaction_execution.py` | `test_success_commits_once_and_closes_session` | `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_execution.py::test_success_commits_once_and_closes_session` |
| 8 | Exceptions abort active transactions | 2 | `backend/tests/test_transaction_execution.py` | `test_domain_exception_aborts_and_is_not_retried` | `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_execution.py::test_domain_exception_aborts_and_is_not_retried` |
| 9 | Safe transient retries do not duplicate non-idempotent effects | 2 | `backend/tests/test_transaction_execution.py` | `test_transient_callback_is_not_retried_by_default`; `test_explicit_retry_safe_callback_retries_transient_transaction`; `test_unknown_commit_result_retries_commit_not_callback` | `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_execution.py -k "not_retried_by_default or explicit_retry_safe or commit_result_retries_commit"` |
| 10 | Readiness exposes transaction capability | 4 | `backend/tests/test_health.py` | `test_readiness_reports_transaction_capability_when_available`; `test_readiness_is_degraded_without_disabling_public_liveness` | `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_health.py -k "readiness"` |
| 11 | Client and diagnostic surfaces expose no topology, credentials, raw request material, or customer/provider data; correlation IDs are canonical UUIDs or `None` | 3, 8 | `backend/tests/test_transaction_error_contract.py` and `backend/tests/test_transaction_observability.py` | `test_transaction_unavailable_response_leaks_no_internal_detail`; `test_invalid_correlation_ids_are_none_in_every_lifecycle_event` | `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_error_contract.py::test_transaction_unavailable_response_leaks_no_internal_detail backend\tests\test_transaction_observability.py::test_invalid_correlation_ids_are_none_in_every_lifecycle_event` |
| 12 | Safe reads/single-document operations remain outside the guard | 7 | `backend/tests/test_transaction_guard.py` | `test_read_only_and_proven_single_document_work_stays_outside_guard` | `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_guard.py::test_read_only_and_proven_single_document_work_stays_outside_guard` |
| 13 | Existing unrelated behavior remains regression-tested | 10 | `backend/tests/test_storage.py` and `backend/tests` | `test_put_and_get_object_preserve_bytes_and_metadata`; complete backend suite | `backend\.venv\Scripts\python.exe -m pytest -q --basetemp C:\tmp\niuva-transaction-final backend\tests` |
| 14 | Retail Checkout is not implemented or enabled | 9, 10 | `backend/tests/test_transaction_documentation.py` and repository diff | `test_runbook_disclaims_checkout_and_production_authorization`; `scope_diff_excludes_retail_checkout` | `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_documentation.py::test_runbook_disclaims_checkout_and_production_authorization`, then `git diff --name-only $reviewedPlanBaseline...HEAD -- frontend backend | Select-String -Pattern "retail_checkout|checkout"` must return no new path |
| 15 | No production infrastructure or go-live authorization is implied | 9, 10 | `backend/tests/test_transaction_documentation.py` and repository diff | `test_runbook_disclaims_checkout_and_production_authorization`; `scope_diff_excludes_production_enablement` | `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_documentation.py::test_runbook_disclaims_checkout_and_production_authorization` and `git diff --name-only $reviewedPlanBaseline...HEAD` reviewed against the Target File Map |
| 16 | Exhausted unknown commit outcome does not rerun the callback, abort the transaction, or claim a definitive outcome | 2 | `backend/tests/test_transaction_execution.py` | `test_exhausted_unknown_commit_result_does_not_rerun_or_abort` | `backend\.venv\Scripts\python.exe -m pytest -n 0 -q backend\tests\test_transaction_execution.py::test_exhausted_unknown_commit_result_does_not_rerun_or_abort` |

## Authority Coverage Crosswalk

| Authority requirement | Planned implementation |
|---|---|
| ADR-001 Option A: replica-set multi-document transactions | Tasks 1, 2, 5, and 6 |
| Local single-node replica set | Task 5 |
| Isolated CI replica set | Task 6 |
| Deterministic direct connection restricted to tracked single-node local/test topology | Tasks 5, 6, 9, and 10 |
| Startup/readiness preflight | Tasks 1 and 4 |
| Controlled `503 transaction_unavailable` | Tasks 2, 3, and 7 |
| No partial state and no silent fallback | Tasks 2, 6, and 7 |
| Read-only behavior remains available | Tasks 4 and 7 |
| Explicit session/commit/abort/cleanup | Task 2 |
| Safe retry only | Tasks 2 and 8 |
| Exhausted unknown commit outcome remains internal, un-aborted, and reconciliation-required | Tasks 2, 3, 8, 9, and 10 |
| Trusted canonical UUID correlation or `None`; raw request/business material rejected | Tasks 2, 7, 8, 9, and 10 |
| Deployment feature gate and rollback | Tasks 7 and 10 |
| Catalog publication snapshot/pointer integration seam | Task 7 guard; current catalog business code is not rewritten |
| Inventory balance/movement/reservation integration seam | Task 7 guard; current inventory business code is not rewritten |
| Catalog spec `503` error semantics | Tasks 3 and 7 |
| Catalog spec isolated transaction tests | Task 6 |
| Catalog spec operational handoff diagnostics | Tasks 4, 8, 9, and 10 |
| Retail Checkout candidate remains outside implementation | Tasks 9 and 10 scope tests |

## Three-Developer Delivery Model

All implementation branches must start from the same reviewed plan baseline: the merge commit of the Pull Request containing this plan. Developer 1 records that SHA in the integration PR description before any implementation branch is created. No implementation branch is created during this planning task.

### Developer 1 — PM and Integration Lead

**Branch:** `feat/tx-readiness-guard`

**Owns:**
- Task 3 API/error contract;
- Task 7 guard, composition, and fail-closed runtime flag;
- Task 8 observability integration;
- Task 10 final verification and rollback;
- `backend/transaction_api.py`, `backend/transaction_guard.py`, `backend/transaction_observability.py`, their tests, and the final integration edits to `backend/server.py` and `backend/transaction_execution.py`;
- integration branch `integration/foundation-transaction-capability`;
- cross-task interface review, conflict resolution, full regression, and final implementation PR.

**Required reviewers:** Developer 2 reviews executor/guard/retry semantics; Developer 3 reviews readiness and operational diagnostics.

### Developer 2 — Transaction Core Owner

**Branch:** `feat/tx-core`

**Owns:**
- Task 1 capability model/read-only probe;
- Task 2 executor/session/commit/abort/retry core;
- `backend/database_capabilities.py`, `backend/transaction_execution.py`, and their focused tests until formal handoff.

**Required reviewer:** Developer 1. Developer 3 additionally reviews the probe diagnostic schema before Task 4 begins.

### Developer 3 — Test Infrastructure and Readiness Owner

**Branch:** `feat/tx-test-topology`

**Owns:**
- Task 4 liveness/readiness;
- Task 5 local topology;
- Task 6 isolated test/CI topology;
- Task 9 developer/operations documentation;
- Compose files, MongoDB scripts, CI workflow, topology/integration fixtures, health tests, and transaction runbook;
- first edit of `backend/server.py` for Task 4 and first edits of `backend/.env.example`.

**Required reviewers:** Developer 2 reviews that the real topology proves the core transaction contract; Developer 1 reviews readiness semantics and documentation disclaimers.

### Shared interfaces frozen before parallel work

Before branches diverge, record these exact interfaces in the integration PR:

1. `DatabaseCapabilities.transactions: bool`.
2. `DatabaseCapabilities.transaction_diagnostic() -> dict[str, bool | str | None]`.
3. `probe_database_capabilities(client, database_name: str) -> DatabaseCapabilities`.
4. `TransactionExecutor.execute(callback, *, operation_name: str, retry_mode: RetryMode = RetryMode.NEVER, correlation_id: str | None = None) -> T`.
5. `TransactionUnavailableError.status_code=503` and `code="transaction_unavailable"`.
6. `TransactionCommitOutcomeUnknownError.code="transaction_commit_outcome_unknown"`, `reconciliation_required=True`, and safe `attempts: int`; it is internal and has no `503` handler.
7. `TransactionMutationGuard.run(callback, *, operation_name: str, retry_safe: bool = False, correlation_id: str | None = None) -> T`.
8. `safe_correlation_id(value: object) -> str | None` accepts canonical UUID text case-insensitively, emits canonical lowercase text, and rejects raw request/business/provider material; callers otherwise pass `None`.
9. `MONGO_URL=mongodb://127.0.0.1:27017/?replicaSet=rs0&directConnection=true` for the tracked local single-node topology only.
10. `MONGO_TRANSACTION_TEST_URL=mongodb://127.0.0.1:27018/?replicaSet=rs-test&directConnection=true` for the tracked isolated single-node topology only.
11. `TRANSACTION_MUTATIONS_ENABLED=false` as the fail-closed default.

Changing any frozen name or type requires Developer 1 approval plus focused test updates on every consuming branch.

### File-collision prevention

- Developer 2 exclusively edits `backend/database_capabilities.py` and initially owns `backend/transaction_execution.py`.
- Developer 3 exclusively edits Compose, MongoDB scripts, `.github/workflows/transaction-tests.yml`, test topology fixtures, and runbooks.
- Developer 3 owns `backend/server.py` only through the Task 4 handoff. Developer 1 edits it only after Task 4 is merged into integration.
- Developer 3 owns `backend/.env.example` through Tasks 5–6. Developer 1 adds the Task 7 flag only after that handoff.
- Developer 1 may add Task 8 event calls to `backend/transaction_execution.py` only after Developer 2's Task 2 handoff and review.
- Two developers never edit the same file concurrently. If an interface change is needed, the current owner commits it first; the next owner updates from integration before editing.

### Handoff gates

| Handoff | Required evidence |
|---|---|
| Developer 2 → integration | Task 1 and 2 focused suites pass; callback retry default/opt-in and commit-only retry are reviewed; exhausted unknown commit raises the safe internal reconciliation exception without callback rerun, replacement transaction, abort, or driver detail; `git diff --check` passes |
| Developer 3 topology → integration | both Compose files pass `docker compose config --quiet`; exact local/test runtime and initializer URIs include `directConnection=true`; topology static tests pass; real probe/commit/abort tests pass with no skip in an available Docker environment |
| Developer 3 readiness/docs → Developer 1 | health/documentation tests pass; public liveness remains 200 under degraded transaction capability; runbook covers reconciliation and trusted UUID correlation; no production-readiness claim |
| Developer 1 guard/observability → integration | error, guard, executor, and observability suites pass; disabled/capability-rejected callbacks remain uncalled; unknown commit emits only `transaction_commit_unknown`; canonical UUIDs normalize and untrusted/invalid correlation material becomes `None` |
| Integration → final PR | Task 10 full verification passes; exact file/commit scope matches this plan; worktree is clean |

### Integration method and merge order

Repository history uses Pull Requests and merge commits, so feature integration uses Pull Requests into `integration/foundation-transaction-capability`. Do not cherry-pick between feature branches, do not squash the task-level commits, and do not push directly to `main`.

The repository evidence requires one change from the preferred topology-first order: Task 4 imports the richer Task 1 capability schema, so the core branch must land before the complete readiness/topology branch can be green.

1. Merge `feat/tx-core` into `integration/foundation-transaction-capability`.
2. Update `feat/tx-test-topology` from integration, then merge it.
3. Update `feat/tx-readiness-guard` from integration, complete Tasks 3, 7, 8, and 10, then merge it.
4. Developer 1 runs final regression on integration and opens the final PR to `main`.

Developer 1 owns every conflict resolution. Developer 2 must approve conflicts affecting retry/session behavior; Developer 3 must approve conflicts affecting topology/readiness. No conflict is resolved by dropping a test or weakening fail-closed behavior.

## Task-Level Commit Strategy

| Task | Exact subject |
|---:|---|
| 1 | `feat: add mongodb transaction capability detection` |
| 2 | `feat: add mongodb transaction execution boundary` |
| 3 | `feat: define transaction unavailable API contract` |
| 4 | `feat: expose transaction readiness diagnostics` |
| 5 | `chore: configure local mongodb replica set` |
| 6 | `ci: run transaction tests against mongodb replica set` |
| 7 | `feat: add fail-closed transaction mutation guard` |
| 8 | `feat: add safe transaction lifecycle diagnostics` |
| 9 | `docs: document transaction-capable development setup` |
| 10 | `docs: finalize transaction verification and rollback` |

Each commit stages only the files listed in its task, runs `git diff --cached --check`, and includes focused passing evidence in its PR/handoff note. Do not combine all work into one implementation commit.

## Plan Self-Review Checklist

Before implementation begins, the integration lead confirms:

- [ ] Every ADR-001 direction and relevant catalog-foundation transaction requirement maps to a task above.
- [ ] Every proposed symbol has one owner and matching parameter/return types across consumers.
- [ ] Every behavior task has executable RED, GREEN, regression, and commit commands.
- [ ] Every proposed file appears in the Target File Map.
- [ ] No incomplete code fence or unspecified command remains.
- [ ] No Retail Checkout, payment, shipping, tax, refund, production storage, frontend, migration, or production-enablement implementation is present.
- [ ] Real replica-set coverage is mandatory in CI and cannot pass by skip.
- [ ] Runtime disablement remains fail closed and never selects a non-atomic write path.
- [ ] Existing catalog and inventory service adoption is clearly identified as a later behavior-preserving review, not silently included.
