# Runtime Reliability Current-Main Revalidation

<!-- markdownlint-disable MD013 -->

**Audit date:** 14 August 2026 (Asia/Jakarta)  
**Runtime baseline:** `origin/main` at `15b759a`  
**Audit branch:** `audit/backend-runtime-reliability`, stacked behind PR #250  
**Authority:** `DEC-READY-01`, `DEC-OBS-001`, `DEC-DATA-003`, `ADR-001`, `ADR-002`, and `ADR-005`

## Outcome

The locally verifiable runtime-reliability contract is source-complete on the
audited baseline. The focused matrix passed **223 tests**. No runtime source
change was justified: the existing code already fails closed for required
dependencies, fences notification claims, bounds worker execution and drain,
redacts structured telemetry, verifies required indexes without mutating them,
and keeps the load probe credential-free, bounded, and read-only.

This is not production-readiness evidence. External providers, production
storage, telemetry delivery, owned SLO/on-call alerts, representative capacity,
deployment topology, and target-environment dependency drills remain open.

## Revalidation matrix

| Area | Current-main result | Local evidence | Residual boundary |
| --- | --- | --- | --- |
| Liveness | `/api/health/live` is process-only and never calls a dependency probe. | `test_liveness_does_not_depend_on_transaction_capability`; `test_liveness_never_invokes_dependency_probe` | Reverse-proxy and deployed-process checks are not available locally. |
| MongoDB readiness | Every request performs a fresh, 500 ms-bounded ping; failure and timeout return not-ready without exception detail. | Mongo failure, timeout, generation-order, and concurrent single-flight tests | No approved staging/production target was contacted. |
| Transaction readiness | Capability is required only when transaction mutations are enabled; required stale, unavailable, or inconsistent capability fails closed. | Fresh-failure, stale-snapshot, and inconsistent-claim tests | Production topology remains governed by `ADR-001`. |
| Schema and indexes | Migration markers and exact required/retired index declarations are inspected read-only and fail closed on incomplete evidence. | Complete, missing migration, missing index, and retired-index tests | No index or migration was applied. Representative-data rehearsal remains separate. |
| Storage | Disabled storage is an explicit inactive capability; configured local storage is validated during startup and rejected outside approved local environments. Storage failures map to controlled errors. | Storage initialization, disabled/backend mismatch, path, atomicity, and route failure tests | Production provider, scanner, quota, retention, RPO/RTO, and provider reachability remain decision-blocked under `ADR-002`. |
| Email | Readiness checks configuration only when delivery is explicitly required and never exposes the credential. Provider reachability is deliberately excluded. | Required-email missing/configured secret-safe test | Provider selection, credentials, and delivery SLA are not authorized. |
| Worker readiness | A required co-located worker needs an active task, running/enabled status, and a non-future heartbeat no older than 30 seconds. Slow batches continue heartbeats. | Missing/done/stale/future heartbeat and slow-batch tests | Separately supervised production topology and on-call ownership remain open. |
| Claim and lease | Claims are atomic, ordered, batch-bounded, and fenced by a unique lease token; stale/expired tokens cannot acknowledge or renew work. | Concurrent claim, reclaim, renewal, release, stale-token, and malformed-input tests | Real multi-process target evidence remains open. |
| Retry and exhaustion | Delivery attempts use bounded backoff and stop permanently at five attempts; exhausted state remains observable. | Retry/backoff, fifth-attempt exhaustion, delivery timeout, and aggregate snapshot tests | Provider-specific retry spacing and incident ownership remain separate. |
| Shutdown and drain | Shutdown stops new claims, drains the active operation up to 30 seconds, then cancels without waiting beyond the hard deadline. Scheduler and telemetry tasks receive stop/cancel signals. | Drain-success and cancellation-resistant deadline tests | Orchestrator termination-grace configuration requires deployment evidence. |
| Structured observability | JSONL event families and labels are closed; untrusted values, raw exceptions, identifiers, credentials, contact data, and arbitrary payloads cannot enter telemetry. Cardinality, output, buffer, and write duration are bounded. | Redaction, event-family, cardinality, non-finite, output-budget, slow-stream, metric-unit, worker, transaction, and alert tests | External telemetry destination, dashboards, alert delivery, SLO, and on-call ownership remain open. |
| Index/pagination/load | Required query indexes are declared; cursor/date/limit validation is bounded. The load tool permits only credential-free origins and a fixed catalog `GET`, caps requests/concurrency/timeout, and emits aggregate results. | Schema-index, B2B/catalog route, pagination, and read-only load-probe tests | No shared or production load target was authorized; capacity/SLO claims are not made. |

## Local dependency-unavailable simulations

All simulations used fakes or local temporary paths and made no external
connection:

- Mongo ping exception and ping timeout -> `503 not_ready` with downstream
  probes suppressed.
- transaction probe exception, inconsistency, and stale capability -> required
  transaction readiness fails closed.
- schema inspection exception or missing marker/index -> schema not ready.
- worker absent, completed, stale, future-dated, or stopped -> required worker
  readiness fails closed.
- required email with missing configuration -> not ready; configured key value
  is never returned.
- disabled, unknown, unsafe-environment, unwritable, and inconsistent local
  storage -> controlled inactive/startup/HTTP failures without partial objects.
- slow telemetry stream and failed emitter -> bounded return and safe degraded
  signal without leaking the rejected value.

## Commands and results

```text
/Users/macintoshhd/NIUVA/Niuva/backend/.venv/bin/python -m pytest -n 0 -q \
  backend/tests/test_health.py \
  backend/tests/test_readiness_health.py \
  backend/tests/test_schema_readiness.py \
  backend/tests/test_storage.py \
  backend/tests/test_storage_routes.py \
  backend/tests/test_worker_runtime.py \
  backend/tests/test_notification_feed.py \
  backend/tests/test_observability.py \
  backend/tests/test_readonly_load_probe.py \
  backend/tests/test_b2b_pagination.py \
  backend/tests/test_catalog_routes.py
223 passed in 1.25s
```

- Full backend: `1036 passed, 15 skipped, 14 subtests passed in 36.43s`; all
  skips match the existing hermetic environment declarations.
- `python -m compileall -q backend scripts` and `git diff --check`: passed.
- Reproducible 169-file tracked-source quality inventory completed. The
  report-only baseline remains 2,046 Flake8, 288 Mypy, 47 Black, and 51 isort
  findings, with checksums recorded by the collector; this audit introduced no
  Python source delta and does not claim those whole-tree thresholds resolved.
- `uv pip check --python .../backend/.venv/bin/python`: 71 installed packages
  compatible.

Exact-head CI is added after publication. An absent external target remains
`environment_blocked`; it must not be recorded as a pass.

## Disposition

- Local/source readiness, worker lifecycle, observability, and bounded
  read-only probe evidence: **revalidated**.
- Runtime source correction: **none required**.
- Migration/index/data/storage/provider mutation: **not performed**.
- Production readiness/go-live: **not claimed**.

<!-- markdownlint-enable MD013 -->
