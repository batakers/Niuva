# Layer 09 — Reliability, Performance, and Observability

Status: Context Only — Audit Evidence and Progress Tracker — Not Implementation Authority

## 1. Audit result

| Field | Value |
| --- | --- |
| Finding prefix | `SRE` |
| Audit status | `complete` |
| Audit completion | 100% of the requested repository/static scope |
| Readiness score | 43 / 100 |
| Confidence | 71% |
| Recorded findings | 0 P0, 4 P1, 6 P2 |
| Baseline SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Last verified | 2026-07-28 (WIB) |

The repository has useful development/staging foundations: distinct API
liveness/readiness routes, fail-closed transaction guards, bounded
transaction retries with retry-safety opt-in, idempotency keys on several
transactional workflows, database audit records, notification deduplication,
route-level frontend code splitting, and focused tests. It does not yet expose
a production-grade dependency-readiness contract or a verifiable production
observability/control plane. Metrics, tracing, alerting, SLI/SLOs, frontend
error collection, capacity evidence, and production-like load/failure evidence
are absent. The score is therefore capped in the "basic function with high
production risk" band.

Audit completion describes coverage, not readiness or go-live authorization.
No production system, external provider, destructive load test, migration, or
failure injection was used.

## 2. Authority and evidence reviewed

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
- `docs/decisions/access/DEC-AUTH-002-rate-limit-topology-deferral.md`
- `docs/decisions/access/DEC-AUTH-006-abuse-protection-interface-and-deferral.md`
- `docs/decisions/access/DEC-AUTH-009-authentication-security-event-governance.md`
- `doc/TRANSACTION_CAPABILITY_RUNBOOK.md`
- `doc/PRODUCTION_DEPLOYMENT.md`
- Backend entry point, database capability/transaction modules, audit,
  notification, storage, email, services, routes, indexes, and related tests
- Frontend API client, application boundary, build configuration, development
  health plugin, assets, package metadata, and CI workflows

Repository line references below refer to the audited baseline/worktree state.
The audit directory was already untracked and one unrelated tracked Markdown
file was already modified; neither was treated as implementation evidence.

## 3. Requested control coverage

Legend:

- `implemented`: code and focused verification exist, within the stated limit;
- `partial`: some control exists but the production contract is incomplete;
- `planned`: stated in an approved decision/runbook but not implemented;
- `development_only`: local/dev behavior, not a production control;
- `production_unverified`: production configuration or operational evidence is
  outside the repository and was not available;
- `absent`: no applicable implementation or approved operational evidence found.

| Area | Status | Current evidence and limit |
| --- | --- | --- |
| Health endpoint | `implemented` | `/api/health` returns process summary and cached transaction capability (`backend/server.py:1192-1194`); it is not dependency health. |
| Readiness endpoint | `partial` | `/api/health/ready` reports transaction capability (`backend/server.py:1202-1212`) but returns HTTP 200 while degraded and reads only a startup snapshot. |
| Liveness behavior | `implemented` | `/api/health/live` is dependency-independent (`backend/server.py:1197-1199`), matching the runbook. |
| Dependency readiness | `absent` | Mongo reachability freshness, storage state, email/provider state, worker state, and index readiness are not represented. |
| MongoDB readiness | `partial` | Startup blocks on seed/index/database work, but readiness does not issue a fresh bounded ping after startup. |
| Transaction-capability readiness | `partial` | Read-only transaction probe and safe reason exist (`backend/database_capabilities.py:65-123`); result is never refreshed. |
| Structured logging | `partial` | Transaction lifecycle attaches an allowlisted dictionary to a `LogRecord` (`backend/transaction_observability.py:59-92`), but global formatting is plain text and does not serialize that dictionary (`backend/server.py:71-72`). |
| Request correlation | `partial` | Transactional domain `operation_id` can become a safe UUID correlation value; no middleware creates/propagates a request ID across HTTP, logs, provider calls, and responses. |
| Audit logging | `partial` | Mongo-backed, redacted audit helpers and indexes exist (`backend/audit.py:6-87`, `backend/server.py:1407-1410`), but coverage is domain/action-specific and not an operational telemetry stream. |
| Sensitive-data redaction | `partial` | Audit snapshots and transaction fields are allowlisted/redacted; email logging still records recipient email and raw provider exception text (`backend/emailer.py:56-66`). |
| Metrics | `absent` | No application metrics library, endpoint, exporter, or production metric query evidence. |
| Tracing | `absent` | No trace context middleware/exporter or distributed spans. |
| Alerting | `planned` | Authentication alert thresholds/destination/SLA remain open (`DEC-AUTH-009`); no active alert rules or notification route were verified. |
| SLI/SLO | `absent` | No approved availability, error-rate, latency, saturation, freshness, or delivery objective and owner. |
| Error-rate monitoring | `absent` | No backend/frontend rate metric or dashboard. |
| Latency monitoring | `absent` | No request/dependency latency histogram or percentile dashboard. |
| Saturation monitoring | `absent` | No worker, pool, CPU, memory, queue-depth, or event-loop-lag metric. |
| Frontend error monitoring | `partial` | `AppErrorBoundary` gives a user fallback, but production errors are not reported; `console.error` is development-only (`frontend/src/App.js:89-116`). |
| Timeout | `partial` | CI jobs and Mongo topology startup are bounded; Axios/fetch, Resend thread calls, and explicit Mongo client/pool values have no repository-defined timeout. |
| Retry | `partial` | Transaction/commit attempts are bounded; notification outbox records attempts; general API/provider retry policy is absent. |
| Retry safety | `implemented` | Transaction callback retry defaults off and requires explicit `retry_safe`; unknown commits retry only commit (`backend/transaction_guard.py:20-43`, `backend/transaction_execution.py:126-219`). |
| Exponential backoff | `absent` | Transaction retries and outbox state have no delay/jitter/backoff scheduling. |
| Idempotency | `partial` | Inventory, B2B, Retail creation, expiry, and notifications use operation/deduplication keys; legacy order/status/admin-send paths do not offer a uniform request idempotency contract. |
| Circuit breaker applicability | `absent` | No circuit breaker. It is applicable to Resend/optional notification delivery; transaction-required Mongo mutations must continue to fail closed, not be bypassed. |
| Connection pooling | `partial` | One process-global Motor client is reused and closed, but pool, selection, connect, wait-queue, and socket bounds/capacity are not configured or verified (`backend/server.py:74-77,1571`). |
| Resource cleanup | `partial` | Transaction sessions and one background task are cleaned up; file upload/download buffer entire objects and the auto-delete task is not retained for cancellation. |
| Background-task failure | `partial` | Loops catch/log failures and continue; no alert, failure metric, durable scheduler state, or dead-letter path. |
| Duplicate processing | `partial` | Deterministic expiry operation IDs and notification deduplication help; every application instance still starts the same loops and outbox claiming is a non-atomic read. |
| Graceful shutdown | `partial` | Reservation-expiry task is cancelled/awaited and Motor closes; auto-delete is neither retained nor awaited (`backend/server.py:1558-1571`). |
| Partial dependency failure | `partial` | Contact lead persists before email and transaction-required mutations fail closed. Other dependency states are missing from readiness and recovery is not observable. |
| Queue/notification failure | `partial` | Outbox data model and max attempts exist (`backend/notification_service.py:158-225`), but no worker/lease/backoff/dead-letter alert was found; admin broadcast sends inline. |
| Database query efficiency | `partial` | Projections and fixed caps exist, but dashboard aggregation happens in application memory and several large fixed-cap reads remain. |
| Index usage | `partial` | Many indexes are declared, but no `explain`/slow-query evidence exists and dashboard/range/list sort shapes are not fully covered. |
| Pagination | `partial` | Limits bound many lists, but no cursor/offset or `has_more`; several APIs silently return the first 200/500 rows. |
| N+1 equivalent | `open` | Public product listing does one publication query per product (`backend/catalog_service.py:751-767`). |
| Frontend bundle size | `partial` | Production compilation succeeded; main was 198.13 kB gzip and largest shared chunk 102.27 kB gzip. No budget/regression gate exists. |
| Code splitting | `implemented` | Routes except Home use `React.lazy`/`Suspense` (`frontend/src/App.js:11-79,81-87`). |
| Image/media optimization | `partial` | Project media uses WebP and is modest; brand SVG is about 124 kB, no responsive `srcset`/pipeline/budget was verified. |
| Caching | `planned` | CDN/static cache and compression policy is documented (`doc/PRODUCTION_DEPLOYMENT.md:56-67`) but no provider config or header capture verifies it. |
| API payload size | `partial` | Pydantic field/list limits and list caps exist; uploads/downloads permit 50 MB in memory and many response rows have no byte-size budget/compression proof. |
| Concurrency | `partial` | Transaction integration/concurrency topology exists in CI; scheduled jobs, notification claims, legacy updates, and multi-worker rate limiting lack a production concurrency contract. |
| Load-test readiness | `absent` | No safe scenario, fixture model, tool config, thresholds, or isolated performance environment. |
| Capacity assumptions | `absent` | Worker count, instance count, pool size, traffic, data growth, job volume, bandwidth, CPU/memory, and headroom are not approved or measured. |

## 4. Observability classification

| Classification | What is present |
| --- | --- |
| Implemented observability | API health/live/ready routes; safe transaction lifecycle `LogRecord` fields; Mongo audit-event records; bounded notification attempt state; user-visible frontend error boundary. These are partial controls, not a complete production system. |
| Planned observability | Production Mongo monitoring/readiness prerequisites in ADR-001; cache/compression and post-deploy checks in `doc/PRODUCTION_DEPLOYMENT.md`; dedicated authentication security events and possible alerts in DEC-AUTH-009. |
| Development-only logging | Plain console/application logging, `[EMAIL-MOCK]` recipient logging, webpack-dev-server health/error/stats endpoints, and non-production `console.error`. The frontend plugin is conditionally attached only to the development server (`frontend/craco.config.js:5-12,65-74,120-143`). |
| Production controls not verifiable | Probe routing, log aggregation/retention/access, dashboards, alert delivery, CDN cache/compression, production Mongo topology/pool, provider timeouts, frontend error collector, on-call ownership, incident history, and real capacity. Repository evidence neither proves nor disproves externally configured controls. |

## 5. Failure-mode matrix

| Dependency/Component | Failure Mode | Current Behavior | User Impact | Detection | Recovery | Test | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| API process | Process/event loop unavailable | `/health/live` works only while process can answer | All API journeys unavailable | External probe not configured in repo | Platform restart/rollback is only documented | Unit route test only | P1 |
| MongoDB connection | Startup unavailable or runtime disconnect | Startup seed/index work fails startup; after startup, cached readiness may stay ready until a request fails | Requests hang/fail; stale traffic routing | Exception logs only; no fresh readiness/metric | Restore Mongo; no verified automatic traffic removal | Capability unit tests; no runtime disconnect injection | P1 |
| MongoDB transactions | Replica set/session capability missing | Transaction-required guarded mutation returns controlled 503; safe reads may continue | Mutations unavailable without partial fallback | Safe transaction event plus cached readiness | Restore capability, re-probe by restart, reconcile unknown commits | Unit tests and isolated CI topology exist | P1 residual due stale probe |
| Transaction commit | Outcome remains unknown | Retries commit up to configured count, never reruns callback, then requires reconciliation | User cannot know whether mutation committed | Safe lifecycle log only | Manual domain reconciliation per runbook | Focused unit tests pass | P1 until alert/reconciliation ownership |
| Local/object storage | Disabled, inaccessible, or slow | Upload/download returns 503/500; storage is intentionally disabled in production | File journeys unavailable | Exception log only; absent from readiness | Keep disabled or restore approved provider; no production provider selected | Local unit tests exist; production unavailable by design | P2/open decision |
| Resend/email | Provider error or call stalls | In-app notification may be written first; provider error is returned as data; no timeout; contact still succeeds | Delayed/lost email; long requests; misleading admin sent count | Raw error log; no delivery metric/alert | Manual retry; outbox model has no worker | Notification unit tests, no provider failure/timeout exercise | P1 |
| Notification outbox | Worker absent, crash, or duplicate claim | Entries can be pending/exhausted, but no processor/lease/backoff was found | Notifications remain unsent or can be duplicated if externally processed | Queryable state only; no queue-depth/age alert | Manual intervention not documented | State-transition unit tests only | P1 |
| Admin broadcast | Partial failure midway through recipients | Sequential inline send; request retry can repeat earlier recipients; `sent_count` increments regardless provider result | Partial/duplicate communication and slow request | Per-provider error logs, no batch outcome telemetry | Manual reconciliation from logs/data | No bulk partial-failure test found | P1 |
| Reservation expiry job | Multiple instances or repeated failure | Every instance starts a loop; deterministic operation ID limits duplicate effects; failures log and retry next minute | Delayed expiry, contention, alert noise | Plain log only | Automatic next pass; no owner/alert | Service tests; no multi-instance scheduler test | P1 |
| Auto-delete job | Shutdown, crash, or backlog >500 | Task is not retained/cancelled; six-hour fixed scan handles first 500 and performs serial updates | Delayed cleanup and unmanaged shutdown work | Plain log only | Next process pass | No lifecycle/multi-instance test found | P2 |
| Rate limiter | Restart or multiple workers | Process-local buckets diverge/reset; canonical decisions explicitly reject production authority | Abuse budgets can be bypassed | No metric/alert | Await approved shared adapter/topology | No multi-worker test; implementation deferred | P1 security dependency |
| Query layer | Large data set or missing supporting index | Fixed caps, application-side aggregation, and N+1 queries increase latency and may truncate results | Slow/incomplete lists and dashboard data | No slow-query/latency telemetry | Manual query/index remediation | No explain/load regression test | P2 |
| Mongo connection pool | Pool exhaustion or long server selection | Driver defaults apply; no documented bounds or saturation signal | Latency spikes/timeouts across API | No pool/wait metric | Restart/scale changes are unproven | No saturation test | P1 |
| File/media path | Concurrent 50 MB uploads/downloads | Whole object buffered; synchronous filesystem/provider wrapper can block event loop | Memory/event-loop saturation | No memory/latency metric | Restart; production upload remains disabled | Size validation tests only | P2 |
| Frontend runtime | Render/chunk/API error | Error boundary offers reload; API calls have no timeout/retry; no production reporting | Blank/error state or indefinite wait | Development console only | User reload/manual support | Component/build checks only | P2 |
| Static host/CDN | Bad cache, missing chunk, no compression | Correct policy exists only in runbook | Broken deploy or higher latency/bandwidth | Post-deploy manual checklist | Redeploy prior artifact/purge HTML cache | No current header capture | P2 |
| Metrics/alerting plane | Telemetry or alert delivery absent | No implemented plane found | Failures discovered by users/manual review | None | Undefined | None | P1 |

## 6. Positive controls

- Transaction-required guarded mutations fail closed and do not introduce a
  non-atomic fallback (`backend/transaction_guard.py`, `backend/transaction_execution.py`).
- Retry safety is explicit: callbacks are not retried unless marked safe, and
  unknown commit outcomes do not rerun callbacks.
- Transaction sessions end in `finally`; the capability probe attempts abort
  and session cleanup on failure.
- Inventory operation IDs, Retail creation operation IDs, deterministic expiry
  IDs, unique indexes, and notification deduplication provide meaningful
  duplicate-effect protection within their bounded domains.
- Contact data is stored before best-effort email, so an email outage does not
  lose the lead (`backend/server.py:850-869`).
- Read endpoints commonly use projections and hard result limits.
- Route-level code splitting and a frontend render error boundary are present.
- Focused verification on the audit machine passed:
  `python -m pytest -n 0 -q backend/tests/test_health.py
  backend/tests/test_database_capabilities.py
  backend/tests/test_transaction_execution.py
  backend/tests/test_transaction_observability.py
  backend/tests/test_transaction_guard.py
  backend/tests/test_notification_feed.py backend/tests/test_audit.py`
  — 75 passed, 4 deprecation warnings, 1.37 seconds.

## 7. Finding register

### SRE-001 — Readiness can route traffic with stale or failed Mongo state

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P1 / `open` / 96% |
| Category | Readiness, dependency health |
| Expected behavior | A readiness probe uses fresh, bounded checks and a non-ready HTTP status for mandatory failed dependencies; transaction capability freshness is explicit. |
| Actual behavior | Capability is probed once at startup, cached indefinitely, and `/health/ready` returns HTTP 200 even when its body says `degraded`. Mongo reachability and other dependencies are not checked. |
| Evidence | `backend/server.py:1202-1212,1544-1557`; `backend/database_capabilities.py:65-123`; `backend/tests/test_health.py:72-85` |
| Verification | Focused health/capability tests passed; tests also confirm degraded returns 200. No live Mongo outage was injected. |
| Impact | A load balancer can continue sending requests to an instance with failed/stale database state; transaction mutations and ordinary DB calls can fail after routing. |
| Probable cause | Readiness was implemented as a transaction diagnostic, not an operational dependency gate. |
| Recommendation | Define required versus optional dependencies; refresh a bounded Mongo ping/capability result with freshness/timeout; return 503 when mandatory readiness fails while preserving dependency-free liveness. |
| Acceptance criteria | Tests cover startup, runtime disconnect, stale capability, recovery, timeout, safe response fields, and expected 200/503 semantics. |
| Dependencies / Human decision | Approved deployment probe routing and required/optional dependency policy; production topology remains open. |
| First observed / Last verified | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |
| Resolution evidence | None. |

### SRE-002 — Production telemetry and service objectives are absent

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P1 / `open` / 98% |
| Category | Metrics, tracing, alerting, SLI/SLO |
| Expected behavior | Owned error-rate, latency, saturation, dependency, queue/job, transaction-unknown, and frontend-error signals have objectives, dashboards, alerts, and escalation. |
| Actual behavior | No metrics/exporter, tracing, production frontend error collector, alert rules, dashboards, SLI/SLO, or alert ownership is present. Transaction logs and audit records are isolated partial signals. |
| Evidence | `backend/requirements.txt`; `frontend/package.json`; `backend/server.py:71-72`; `frontend/src/App.js:99-101`; DEC-AUTH-009 open decisions |
| Verification | Repository-wide searches for common telemetry libraries, trace/request headers, and metric endpoints found none. No external observability system was accessed. |
| Impact | Error, latency, saturation, job, delivery, and unknown-commit failures may be discovered late and cannot be measured against an objective. |
| Probable cause | Monitoring implementation/provider, thresholds, owners, and production topology remain undecided. |
| Recommendation | Approve provider-neutral telemetry contracts first; instrument RED/USE signals, critical domain failures, frontend errors, and queue/job freshness; then define owner-approved SLI/SLO and actionable alerts. |
| Acceptance criteria | Current staging evidence shows dashboards, alert delivery tests, redaction/access/retention, runbook links, owners, and objective calculations for critical journeys. |
| Dependencies / Human decision | Telemetry destination, retention/access, SLOs, thresholds, on-call/escalation owners. |
| First observed / Last verified | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |
| Resolution evidence | None. |

### SRE-003 — Email and notification delivery are not timeout-, retry-, or claim-safe

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P1 / `open` / 96% |
| Category | External dependency, queue, partial failure |
| Expected behavior | Outbound delivery is decoupled, bounded by timeout, atomically leased, idempotent, backoff/jitter controlled, observable, and recoverable after exhaustion. |
| Actual behavior | Resend runs in an unbounded worker-thread call; admin broadcast sends sequentially inside the request; provider error still increments sent count. Outbox rows/attempts exist but no worker, atomic claim/lease, schedule, backoff, or alert was found. |
| Evidence | `backend/emailer.py:39-66`; `backend/server.py:1148-1181`; `backend/notification_service.py:158-225` |
| Verification | Notification state tests passed; no provider call, timeout, worker crash, or duplicate-claim test was run. |
| Impact | Requests can stall, broadcasts can partially deliver or duplicate on retry, and pending/exhausted messages can remain unnoticed. |
| Probable cause | Persistence model was added before the operational delivery worker/control plane. |
| Recommendation | Route delivery through an approved durable worker; use atomic lease/state transitions, bounded provider timeout, exponential backoff with jitter, idempotency key, dead-letter/exhausted alert, and batch reconciliation. |
| Acceptance criteria | Deterministic tests cover provider timeout, 429/5xx, process crash after send/before acknowledgement, concurrent claim, retry schedule, exhaustion, replay, and accurate per-recipient outcomes. |
| Dependencies / Human decision | Delivery provider, worker topology, retry/retention policy, alert owner and support procedure. |
| First observed / Last verified | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |
| Resolution evidence | None. |

### SRE-004 — Background scheduling is per-process and shutdown is incomplete

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P1 / `open` / 94% |
| Category | Background tasks, concurrency, graceful shutdown |
| Expected behavior | One durable/leased execution occurs per schedule, failure is visible, backlog is bounded/drained, and all tasks stop gracefully. |
| Actual behavior | Every app process starts expiry and auto-delete loops. Expiry uses deterministic operation IDs but no scheduler lease. Auto-delete is not retained/cancelled, handles at most 500 per six-hour pass, and performs serial updates. Both only log exceptions. |
| Evidence | `backend/server.py:1506-1571`; `backend/inventory_service.py:562-591` |
| Verification | Static lifecycle review; no multi-instance, clock, backlog, crash, or shutdown test was found/run. |
| Impact | Duplicate work/contention, delayed cleanup/expiry, silent repeated failures, and unfinished work during shutdown. |
| Probable cause | In-process loops were used without an approved worker/scheduler topology. |
| Recommendation | Establish scheduler ownership/lease, durable run state and backlog metrics; make bounded batches drain safely; retain/cancel/await every task and test termination. |
| Acceptance criteria | Multi-instance and shutdown tests prove single logical execution, idempotent replay, failure alerting, backlog recovery, and no task/resource leak. |
| Dependencies / Human decision | Worker/instance topology, scheduler owner, timing/backlog objectives. |
| First observed / Last verified | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |
| Resolution evidence | None. |

### SRE-005 — Timeout, backoff, and circuit policies are incomplete

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P2 / `open` / 95% |
| Category | Timeout, retry, circuit breaking |
| Expected behavior | Every network dependency has an end-to-end deadline; retries are safe, bounded, backoff/jitter controlled, and optional dependencies can stop cascading failure. |
| Actual behavior | Axios/fetch have no timeout; Resend has no explicit deadline; Motor uses undocumented defaults. Transaction retries are bounded and safe but immediate. No circuit breaker exists. |
| Evidence | `frontend/src/lib/api.js:8-29,37-44,64-71`; `backend/emailer.py:61-66`; `backend/server.py:74-77`; `backend/transaction_execution.py:126-219` |
| Verification | Static review and transaction unit tests; no latency/failure injection. |
| Impact | Slow dependencies can consume workers/connections and create retry storms or indefinite client waits. |
| Probable cause | Per-dependency reliability budgets have not been defined. |
| Recommendation | Define request/dependency deadline budgets; propagate cancellation; add backoff/jitter only to idempotent operations. Consider a circuit breaker for optional email delivery, never as a non-atomic Mongo fallback. |
| Acceptance criteria | Fault-injection tests prove deadlines, cancellation cleanup, retry count/delay/jitter, idempotency, recovery from open/half-open circuit, and correct user errors. |
| Dependencies / Human decision | Latency budget, provider behavior, retry ownership and UX contract. |
| First observed / Last verified | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |
| Resolution evidence | None. |

### SRE-006 — Query, index, and pagination strategy will not scale predictably

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P2 / `open` / 97% |
| Category | Database performance, pagination |
| Expected behavior | List/analytics queries use supporting indexes, database aggregation, deterministic pagination, payload budgets, and explain/performance regression evidence. |
| Actual behavior | Public products use N+1 publication reads; dashboard loads up to 5,000 rows and aggregates in Python; many list endpoints use fixed caps without cursor/offset/`has_more`; query plans are unverified. |
| Evidence | `backend/catalog_service.py:751-772`; `backend/server.py:966-1075`; repository-wide list/query inventory; `backend/server.py:1346-1418` |
| Verification | Static query/index comparison only; no `explain`, profiler, or large-data load test was run. |
| Impact | Latency and database load grow with data, while users can receive silently truncated results and incomplete dashboard counts. |
| Probable cause | Development-sized caps were used in place of a pagination/analytics contract. |
| Recommendation | Add cursor pagination and response metadata; batch/join public projections; move dashboard aggregation to Mongo pipelines; validate indexes using representative `explain("executionStats")` and regression thresholds. |
| Acceptance criteria | Representative data tests show correct complete pagination, bounded query count, index-backed sorts/filters, payload limits, and agreed p95 latency without collection scans on critical paths. |
| Dependencies / Human decision | Data-growth/retention assumptions and approved latency/payload budgets. |
| First observed / Last verified | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |
| Resolution evidence | None. |

### SRE-007 — File and API resource usage is only partially bounded

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P2 / `open` / 96% |
| Category | Memory, event-loop blocking, payload size |
| Expected behavior | Upload/download streams are bounded, synchronous work does not block the event loop, and concurrency/memory budgets are enforced. |
| Actual behavior | A 50 MB upload is read fully before validation/storage; storage writes and reads are synchronous; downloads materialize the full file and frontend blob. Response lists are row-capped but not byte-budgeted. |
| Evidence | `backend/server.py:410-435,818-846`; `backend/storage.py:128-180,184-205`; `frontend/src/lib/api.js:37-44` |
| Verification | Static review; production upload is intentionally disabled and no concurrent file test was run. |
| Impact | Concurrent large transfers can block the event loop and exhaust process/browser memory. |
| Probable cause | Development local-storage adapter is byte-oriented and no production streaming port is approved. |
| Recommendation | Preserve production upload disablement until approved; define streaming interfaces, request/body/server limits, backpressure, concurrency quotas, and safe content processing for the future provider. |
| Acceptance criteria | Isolated tests prove early size rejection, bounded memory, cancellation cleanup, streaming range/download behavior where applicable, and saturation limits. |
| Dependencies / Human decision | ADR-002 provider/architecture and upload operational approval. |
| First observed / Last verified | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |
| Resolution evidence | None. |

### SRE-008 — Logging redaction and audit coverage are inconsistent

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P2 / `open` / 95% |
| Category | Structured logging, privacy, auditability |
| Expected behavior | Production logs are structured, correlation-aware, allowlisted/redacted, and separated from durable business/security audit records with access/retention controls. |
| Actual behavior | General logs are plain text; transaction structured extras are not serialized by the configured formatter; email mock logs include recipient email and provider exception strings. Audit helpers redact many keys but action coverage and production retention/access were not verified. |
| Evidence | `backend/server.py:71-72`; `backend/transaction_observability.py:59-92`; `backend/emailer.py:56-66`; `backend/audit.py:6-87` |
| Verification | Transaction/audit redaction tests passed. No production log sample, sink, access, or retention evidence was available. |
| Impact | Troubleshooting lacks request context while logs can retain personal/provider data; audit completeness cannot be assumed. |
| Probable cause | Domain-specific safe logging evolved without a shared production logging contract. |
| Recommendation | Adopt a provider-neutral JSON schema, server-generated request ID, field allowlist/redaction, error classification, and explicit log/audit access/retention; implement DEC-AUTH-009 only after its open gates are approved. |
| Acceptance criteria | Tests cover nested secrets/PII, exception sanitization, request/provider correlation, schema serialization, audit action matrix, least-privilege access, and retention. |
| Dependencies / Human decision | Logging/audit retention, access owners, security-event owner/storage per DEC-AUTH-009. |
| First observed / Last verified | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |
| Resolution evidence | None. |

### SRE-009 — Connection-pool and capacity assumptions are undefined

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P2 / `environment_blocked` / 92% |
| Category | Scalability, saturation, capacity |
| Expected behavior | Worker/instance/pool sizing, traffic and data growth, headroom, queue/job volume, and scaling limits are approved and proven in a production-like environment. |
| Actual behavior | One default-configured Motor client exists per process, while worker count, pool bounds, timeouts, resources, traffic, growth, and capacity/load evidence are absent. |
| Evidence | `backend/server.py:74-77`; `backend/.env.example`; provider-neutral `doc/PRODUCTION_DEPLOYMENT.md` |
| Verification | Static config review. No production-like topology, data set, telemetry, or authorized load environment was available. |
| Impact | Pool exhaustion, latency collapse, memory pressure, or overload thresholds cannot be predicted or alerted. |
| Probable cause | Production topology and ownership remain open decisions. |
| Recommendation | Record workload model and capacity assumptions; configure bounded client/server resources; create safe isolated smoke/load/soak scenarios and scaling/rollback criteria. |
| Acceptance criteria | Approved representative tests produce throughput, p50/p95/p99, errors, CPU/memory, pool wait, DB utilization, queue lag, and headroom with no production traffic. |
| Dependencies / Human decision | Production topology, capacity owner, workload model, budgets, and isolated test environment. |
| First observed / Last verified | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |
| Resolution evidence | None; blocked evidence is named above. |

### SRE-010 — Frontend delivery has no performance or error-monitoring budget

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P2 / `open` / 91% |
| Category | Frontend performance, caching, error monitoring |
| Expected behavior | Bundle/chunk/media budgets, Web Vitals/error collection, cache/compression headers, and regression gates are verified on a release-like build. |
| Actual behavior | Route splitting and WebP assets exist, but no size/performance budget or production error collector. Main JS is 198.13 kB gzip and largest shared chunk 102.27 kB gzip; a brand SVG is about 124 kB. Cache/compression are runbook-only. |
| Evidence | `frontend/src/App.js:11-87,89-116`; `frontend/craco.config.js:92-115`; `doc/PRODUCTION_DEPLOYMENT.md:56-67`; local build output |
| Verification | `npm run build` compiled successfully and reported chunk sizes; postbuild then correctly failed because `REACT_APP_PUBLIC_SITE_URL` was not a confirmed production origin. No domain, CDN, browser trace, or external request was used. |
| Impact | Regressions in startup time, chunk delivery, media cost, and runtime errors can ship undetected. |
| Probable cause | Release host and monitoring/provider controls are not selected/configured in the repository. |
| Recommendation | Add CI size budgets and representative route checks; optimize the brand SVG/media pipeline; collect privacy-approved Web Vitals and frontend errors; verify cache/compression on staging. |
| Acceptance criteria | Release-like build meets approved budgets, source maps remain private, critical routes pass performance thresholds, errors correlate with backend requests, and staging header captures match policy. |
| Dependencies / Human decision | Public origin/host, error/analytics provider and privacy approval, performance budgets. |
| First observed / Last verified | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` / same |
| Resolution evidence | None. |

## 8. Score and confidence rationale

Readiness is 43/100 because core transaction safety and several bounded
development controls exist, but four P1 operational gaps remain and the
production control plane is unverified. The score cannot enter the 60–74
development/staging-ready band without fresh dependency readiness, actionable
telemetry, safe delivery/background processing, and defined timeout/capacity
contracts.

Confidence is 71%: current source/configuration was reviewed broadly and 75
focused tests passed, with a successful frontend compilation and concrete
bundle output. Confidence is capped because real Mongo integration tests,
multi-instance/background failure tests, query plans, performance/load tests,
production-like deployment, provider failure tests, and external
logs/metrics/alerts were unavailable or intentionally not run.

## 9. Decisions and evidence still required

- Production worker/instance and Mongo replica-set/pool topology
- Required versus optional dependency readiness and probe routing
- Observability/logging/tracing destinations, access, retention, and owners
- SLI/SLO, alert thresholds, escalation/runbook, RPO/RTO, and incident owner
- Notification worker/provider, timeout/retry/backoff/dead-letter policy
- Scheduler/lease ownership and backlog objectives
- Data/traffic growth, payload/latency/error budgets, and capacity headroom
- Privacy approval for frontend monitoring/session recording
- Approved isolated staging/performance environment

## 10. Safe remediation sequence

1. Approve operational contracts and owners without selecting protected
   providers implicitly.
2. Correct readiness freshness/status semantics and add request correlation plus
   redacted structured logs.
3. Add provider-neutral metrics/tracing/error schemas and owned alerts/SLOs.
4. Make notification/background execution lease-, timeout-, retry-, shutdown-,
   and reconciliation-safe.
5. Fix query/pagination/N+1 and resource streaming boundaries with regression
   tests.
6. Establish performance budgets and run safe isolated concurrency/load/soak
   tests; never target production without separate explicit approval.

## 11. Resume handoff

- Audit state: `complete` for requested repository/static scope.
- No remediation is authorized or implemented by this document.
- Environment-blocked evidence: production topology and observability systems,
  representative data, provider endpoints, query plans, and an approved
  load/failure environment.
- First remediation gate: owner approval for readiness semantics and
  provider-neutral telemetry contracts.
- Revalidate this layer when relevant source, tests, dependencies, deployment
  topology, decisions, or production evidence changes.

## 12. Changelog

### 2026-07-28 — Deep Layer 09 audit

- Replaced the initialization template and changed the required finding prefix
  from `REL` to `SRE`.
- Audited all requested reliability, performance, scalability, and
  observability controls.
- Added the failure-mode matrix, observability classification, positive
  controls, score/confidence rationale, and ten current findings.
- Ran focused non-production tests and a local frontend build only; no
  destructive load test or production request was performed.
