# Feature 7.3 — Backend Observability Decision Package

Status: **High-level DR-014 direction and bounded worker values approved by Faiz — observability values required before source implementation**

Original planning date: 2 August 2026 (Asia/Jakarta)

Reconciliation date: 3 August 2026 (Asia/Jakarta)

Branch: `plan/backend-observability`

PR: `#108` merged as `b336198`; CI passed; this package remains a planning
record and does not authorize source implementation.

Baseline: `a2b7be0d445cf3a338d91cf74841e3bf8be11a91`
(`origin/main`, fetched 2 August 2026)

Reconciliation baseline: `fe1d8a0274ae106f9ca400570d53a44bc23e149a`
(`origin/main`, merged 3 August 2026). This changes no decision or source gate.

Decision dependency: `DR-014`

Related roadmap task: `PHASE-08B`; `TASK-08B-01`; `TASK-08B-02`

## Decision authority

On 5 August 2026, Yanuar/Owner delegated to Faiz the Ops/SRE accountable
role, Security/Data reviewer role, and DR-014 decision-maker responsibility for
Commerce Transaction 1A through 30 August 2026. No backup owner exists; the
single-person ownership risk is accepted.

This delegation resolves who may review and decide the remaining provider-
neutral observability values. It does not itself approve a telemetry provider
or destination, retention/access policy, SLO, error budget, threshold,
capacity limit, production credential, migration, deployment, or go-live, and
it does not replace separate source implementation authorization.

On 5 August 2026, Faiz approved JSON Lines application emission to stdout/stderr
and no external telemetry provider at high level. External collection,
destination, retention, metrics, SLO, alert, and capacity values remain pending.

The dependent Feature 7.2 worker values are also approved for the bounded
contract: 15-second maximum delivery operation, 5-second acknowledgement,
40-second clock/network margin, 60-second lease, 30-second renewal threshold,
concurrency 1, claim-ahead 0, and 30-second worker drain. This does not approve
the remaining observability or production-readiness values.

## 1. Purpose and decision boundary

This packet asks Operations/SRE/Security to approve a provider-neutral backend
observability contract before application instrumentation or exporter work
begins.

It distinguishes five records that must not be conflated:

1. **Operational telemetry:** bounded logs, metrics, and alert signals used to
   operate the service.
2. **Domain audit records:** durable business/accountability history governed
   by domain authorization and retention.
3. **Authentication security events:** dedicated redacted records governed by
   `DEC-AUTH-009` and `DEC-AUTH-011`.
4. **Recipient notifications:** customer/internal recipient-facing state and
   delivery outbox governed by `DEC-DATA-003`.
5. **Provider/export records:** external system data whose destination,
   access, retention, cost, and outage behavior require separate approval.

Operational logs are not the audit system. Metrics are not a recipient feed.
General alerts must not become a second authentication-event store. No
telemetry signal may contain credentials, contact data, business payloads, or
raw provider/database errors.

## 2. Current implementation evidence

### Present

- Plain-text process logging at INFO level.
- Validated/generated request IDs and response propagation.
- Request completion/failure messages with method, concrete path, status, and
  elapsed milliseconds.
- Allowlisted transaction lifecycle records with safe operation name,
  correlation ID, outcome, attempt, retry mode, and error class.
- Transaction capability reason/freshness in readiness.
- Aggregate notification batch results and an in-process worker heartbeat.
- Dedicated authentication security-event and alert-outbox foundations.

### Missing or incomplete

- A serialized structured-log envelope applied consistently across events.
- A route-template boundary that prevents identifier cardinality and path
  disclosure.
- An application metrics registry/export contract and destination.
- Approved metric names, types, units, buckets, labels, and cardinality limits.
- General operational alert events, thresholds, destination, responder, and
  tested delivery path.
- Dependency-duration and timeout-result visibility.
- Durable worker backlog age, stale lease, exhaustion, and scheduler-run
  signals.
- Approved SLI/SLO/error-budget formulas, numerical objectives, owners, and
  review cadence.
- Telemetry retention, access, deletion, evidence custody, and exporter-outage
  policy.

## 3. Decision 1 — Structured logging contract

### Option A — Continue formatted plain text

**Benefits:** no formatter change and direct local readability.

**Risks:** nested allowlisted fields in `LogRecord.extra` are not reliably
serialized; machine parsing and schema validation are weak; downstream queries
depend on message text.

### Option B — JSON Lines to stdout/stderr

Each record is one UTF-8 JSON object emitted to process stdout/stderr. Runtime
collection, storage, search, and retention remain deployment decisions.

**Benefits:** provider-neutral, machine-readable, compatible with container and
process logging, and testable without selecting a collector.

**Risks:** schema and redaction must be strict; local readability needs tooling;
multiline traceback handling and collector limits require operational review.

### Option C — Direct provider SDK/export only

Application code exports directly to a selected telemetry provider.

This can support rich correlation, but it selects a dependency, destination,
credential, buffering, outage, and cost boundary that DR-014 has not resolved.

### Structured logging decision

Option B is approved as the canonical application log emission format: JSON
Lines to stdout/stderr. External collection/export remains a separate
adapter/deployment decision. A later provider adapter may consume the same
schema but must not replace safe local emission or become required for business
mutation success by default.

### Recommended common envelope

| Field | Contract |
| --- | --- |
| `schema_version` | Fixed allowlisted version |
| `timestamp` | UTC RFC 3339 generated by the application/runtime |
| `level` | Closed enum |
| `service` | Trusted configured service identifier |
| `environment` | Trusted configured environment enum |
| `event` | Closed event-name registry |
| `request_id` | Server-generated or strictly validated opaque value; optional outside HTTP |
| `route_template` | Framework route template or `unmatched`; never concrete path |
| `method` | Closed HTTP-method enum when applicable |
| `status_class` | Bounded class such as `2xx`, not arbitrary status text |
| `duration_ms` | Non-negative bounded integer when applicable |
| `fields` | Event-specific strict allowlist; no arbitrary mappings/free text |

### Globally prohibited values

- request/response bodies and query strings;
- concrete URLs/paths containing identifiers;
- cookies, authorization/CSRF headers, tokens, OTPs, recovery codes, secrets,
  connection strings, or provider credentials;
- email, telephone, address, contact/message content, file names, or customer
  free text;
- raw exception text, traceback locals, database/provider payloads, or driver
  topology details; and
- arbitrary user IDs, organization IDs, resource IDs, operation IDs, or
  request-controlled values unless a specific decision approves a safe opaque
  correlation field.

Tracebacks may remain available only through an approved formatter that
redacts exception messages and locals, applies access/retention controls, and
is covered by negative tests. Otherwise emit an allowlisted error class and
safe event outcome.

**Approval field:** High-level JSON Lines/stdout/stderr direction approved by
Faiz on 5 August 2026; exporter, destination, retention, and outage values
remain pending.

## 4. Decision 2 — Request correlation and HTTP signals

### Request-correlation contract

- Generate a UUID request ID when an inbound ID is absent or invalid.
- Accept an inbound request ID only under a strict length/character contract;
  it is never a user/account identity or authorization input.
- Return the effective request ID to the caller.
- Log and measure the framework route template after routing, never the
  concrete path or query.
- Do not use arbitrary `User-Agent`, forwarding, tracing, session, or business
  operation values as correlation IDs.
- Record one request-completion event with method, route template, status
  class, and duration. Record a bounded failure class when processing raises.
- Health/metrics routes, if approved, need explicit inclusion/exclusion policy
  so probes do not distort service objectives.
- Sampling may reduce successful high-volume completion logs only after
  metrics provide complete aggregate counts. Errors, transaction-unknown, and
  security-relevant safe events retain their separately approved policy.

### Request-correlation approval inputs

| Field | Approved value |
| --- | --- |
| Inbound request-ID trust boundary | Pending |
| Request ID format/length | Pending; recommendation canonical UUID |
| Route-template resolution behavior | Pending |
| Successful-request log sampling | Pending; recommendation none initially |
| Probe/metrics route SLI treatment | Pending |

## 5. Decision 3 — Metrics and cardinality

### Metric implementation options

#### Option A — OpenMetrics-compatible pull endpoint

Simple and widely supported, but requires dependency selection, internal route
protection, scrape topology, retention, and destination decisions.

#### Option B — OpenTelemetry SDK/export

Vendor-neutral protocol direction with metrics/tracing/log export potential,
but still adds dependencies, processors, endpoint credentials, buffering,
sampling, and exporter-outage behavior.

#### Option C — Approved internal metric port, exporter selected separately

Application domains emit typed counter/gauge/histogram operations through one
small internal interface. A later approved adapter exposes or exports them.

This keeps domain instrumentation provider-neutral but provides no operational
visibility until an adapter/destination is approved and connected.

### Metrics recommendation

Approve the canonical metric inventory and **Option C** first. Select Option A
or B as a separate Operations/SRE implementation input before source work that
adds dependencies or endpoints. Do not build an unconsumed in-memory metrics
system and describe it as operational observability.

### Proposed canonical metric inventory

| Signal | Type | Unit | Allowed dimensions |
| --- | --- | --- | --- |
| HTTP requests | Counter | requests | method, route template, status class |
| HTTP duration | Histogram | milliseconds | method, route template |
| Dependency operations | Counter | operations | dependency class, operation class, outcome |
| Dependency duration | Histogram | milliseconds | dependency class, operation class, outcome |
| Readiness transitions | Counter | transitions | dependency class, ready/unavailable |
| Worker claims/results | Counter | entries | worker class, channel, safe outcome |
| Worker backlog | Gauge | entries | worker class, safe state |
| Oldest due work | Gauge | seconds | worker class |
| Stale leases | Gauge | entries | worker class |
| Exhausted work | Gauge | entries | worker class, channel |
| Scheduled runs | Counter | runs | job name, safe outcome |
| Scheduled duration | Histogram | milliseconds | job name, safe outcome |
| Transaction lifecycle | Counter | transactions | safe operation name, outcome, retry mode |
| Transaction duration | Histogram | milliseconds | safe operation name, outcome |
| Transaction capability | Gauge | boolean | safe capability reason |

### Cardinality rules

- Every dimension uses a closed registry or framework route template.
- No concrete path, request ID, user/resource/organization ID, email, file
  name, error message, exception type from untrusted code, provider response,
  query value, or operation UUID is a metric dimension.
- Safe transaction operation names must come from a finite application
  registry before use as labels. Regex validation alone does not prove bounded
  cardinality.
- Unknown values map to a bounded `unknown`/`other` value and increment a safe
  schema-violation signal; they never create a new label dynamically.
- Histogram buckets, collection interval, process aggregation, multiprocess
  behavior, and resource overhead require approved capacity evidence.

### Metrics approval inputs

| Field | Approved value |
| --- | --- |
| Export model (pull/export) | Pending |
| Metrics dependency/adapter | Pending |
| Endpoint/network/access boundary | Pending |
| Collection interval | Pending |
| Histogram buckets | Pending |
| Multiprocess aggregation model | Pending |
| Cardinality ceiling | Pending |
| Metrics retention | Pending |

## 6. Decision 4 — Operational alert events

### Recommended boundary

- Application code emits closed, redacted operational events and metrics.
- Alert evaluation/routing normally belongs to the approved telemetry system,
  not request handlers.
- A durable application alert outbox is used only where a specific approved
  domain decision requires it. Authentication alert outbox behavior remains
  governed by `DEC-AUTH-011`; it is not generalized silently.
- Alerts contain event family, safe severity, environment, time window,
  aggregate count/state, deduplication identity derived from bounded enums,
  runbook reference, and evidence correlation where approved.
- Alerts never contain recipient/customer identifiers, raw paths, payloads,
  credentials, or exception/provider bodies.
- Export/destination failure must not roll back an otherwise successful core
  transaction. Required security-event persistence retains its own
  operation-specific fail-closed policy.

### Candidate alert families — thresholds pending

| Family | Candidate trigger input | Candidate severity |
| --- | --- | --- |
| API error-rate | Bounded 5xx ratio/count window | Pending |
| API latency | Approved percentile/objective breach | Pending |
| Required dependency unavailable | Readiness transition and duration | Pending |
| Dependency timeouts | Count/ratio by safe dependency class | Pending |
| Worker backlog stale | Oldest due age and backlog count | Pending |
| Worker exhausted | Exhausted count/new terminal outcomes | Pending |
| Worker lease instability | Lease-lost/stale-lease rate | Pending |
| Scheduled job missed/failed | Missed window or failed logical run | Pending |
| Transaction unavailable | Required mutation rejection rate | Pending |
| Transaction commit unknown | Any ambiguous commit outcome; proposed immediate review | Pending |
| Telemetry pipeline degraded | Export failures/drop/buffer saturation | Pending |

### Alerting approval inputs

| Field | Approved value |
| --- | --- |
| Alert evaluation location | Pending |
| Destination | Pending |
| Primary responder and backup | Faiz primary (delegated Ops/SRE); no backup; single-person risk accepted |
| Severity definitions | Pending |
| Threshold/window per family | Pending |
| Deduplication/suppression policy | Pending |
| Response objective per severity | Pending |
| Runbook/evidence location | Faiz (delegated DR-014); location/value pending |

## 7. Decision 5 — Timeout visibility

### Timeout visibility contract

- Every external or database dependency operation that can block has an
  approved end-to-end deadline before it is instrumented as compliant.
- Emit duration and a bounded outcome: `success`, `timeout`, `unavailable`,
  `rejected`, or `failed_safe` as applicable.
- Dependency and operation classes are closed enums. Do not log/export host,
  URL, database name, recipient, provider payload, exception message, or
  connection details.
- Record the configured deadline class/version rather than arbitrary runtime
  values when needed for rollout comparison.
- Cancellation and caller disconnect are distinct bounded outcomes where the
  framework can determine them safely.
- Retries are measured per attempt and per logical operation without using a
  high-cardinality operation ID.
- Metrics/logging do not authorize adding retries. Transaction callback retry
  remains off unless explicitly retry-safe, and an unknown commit never
  replays the business callback.

### Timeout approval inputs

| Field | Approved value |
| --- | --- |
| HTTP server/request budget | Pending |
| Mongo selection/connect/socket/wait budget | Pending |
| Email/provider budget | Pending |
| Storage/provider budget | Pending |
| Cancellation classification | Pending |
| Retry-attempt visibility | Pending |

Feature 7.2 proposes candidate worker delivery timing, but PR `#107` is not an
approved or merged source for final values.

## 8. Decision 6 — Worker backlog and exhaustion visibility

### Worker visibility contract

- Worker signals are aggregate queries/state transitions, never scans that
  expose payloads or recipient fields.
- Minimum signals are due-pending count, processing count, oldest due age,
  stale/expired lease count, newly exhausted count, total retained exhausted
  count, claim/result count, delivery duration, lease-lost count, heartbeat,
  logical scheduled-run status, missed-run count, and bounded batch result.
- Metric collection queries require supporting indexes and a measured bounded
  cost. An index/schema need discovered here requires a separate migration
  plan; observability does not authorize an ad hoc production index.
- Multi-process gauges require one approved aggregation model to avoid
  multiplying global backlog by process count.
- Worker class, safe state/outcome, channel enum, and named scheduled job are
  the only proposed dimensions.
- Alert thresholds and backlog objectives remain pending Operations/SRE
  approval.
- General-notification ownership remains distinct from authentication cleanup
  and alert operations.

### Dependency on Feature 7.2

Instrumentation implementation waits for acceptance of worker process
topology, lease timing/fencing, shutdown, readiness, and scheduler ownership.
Metrics must describe the accepted runtime, not the current in-process loop or
a planning direction with pending Operations/SRE decisions as if it were final.

**Approval field:** `Pending Operations/SRE decision and Feature 7.2 acceptance`

## 9. Decision 7 — Transaction diagnostics

### Preserved invariants

- Transaction-required mutations fail closed when capability is unavailable.
- Retry only explicitly retry-safe callbacks for transient transaction errors.
- `UnknownTransactionCommitResult` retries the commit only within its bounded
  policy; it never replays the business callback.
- An exhausted unknown commit remains ambiguous and requires reconciliation;
  telemetry must not label it committed or aborted.

### Recommended signals

- start, commit, abort, retry, unavailable rejection, and commit-unknown counts;
- transaction duration by finite safe operation name and final outcome;
- attempt count distribution without correlation/operation IDs as labels;
- capability availability and safe reason with probe freshness;
- commit-unknown operational alert event with safe operation class, attempt
  count, environment, timestamp, and runbook reference only; and
- telemetry-schema rejection count for invalid/unbounded operation names.

Request IDs may appear in access-controlled structured logs for bounded
correlation but never as metric labels or alert-deduplication keys. Raw driver
errors, labels, connection strings, database names, topology, and callback
payloads remain prohibited.

**Approval field:** `Pending Operations/SRE/Security decision`

## 10. Decision 8 — SLI, SLO, error budget, retention, and ownership

### Proposed SLI formulas — numerical objectives pending

| SLI | Formula boundary |
| --- | --- |
| API availability | Eligible non-5xx responses / eligible requests, with approved route exclusions |
| API latency | Eligible requests completed within the approved threshold / eligible requests |
| Required-dependency availability | Time required dependency is ready / observed time |
| Worker delivery freshness | Eligible due work completed before the approved age / eligible due work observed in the measurement window |
| Worker exhaustion | Non-exhausted terminal deliveries / terminal delivery outcomes |
| Scheduled-job reliability | Successful on-time logical runs / expected logical runs |
| Transaction availability | Eligible transaction-required mutations not rejected for capability / eligible mutations |
| Transaction certainty | Logical transactions reaching a non-ambiguous terminal outcome / eligible logical transactions observed in the measurement window |
| Telemetry pipeline health | Accepted non-dropped telemetry records / attempted records, where measurable |

Eligibility, low-traffic handling, maintenance windows, burn-rate windows,
percentiles, objective numbers, error budgets, and alert thresholds require
Operations/SRE/Product approval. This packet deliberately does not invent
them.

### Required decision fields

| Field | Approved value |
| --- | --- |
| Telemetry destination/provider | Pending |
| Log retention | Pending |
| Metrics retention | Pending |
| Alert/evidence retention | Pending |
| Access roles and review cadence | Pending |
| Privacy/retention approver | Faiz (delegated Security/Data); policy value pending |
| Operations/SRE owner and backup | Faiz primary (delegated Ops/SRE); no backup; single-person risk accepted |
| Security reviewer | Faiz (delegated Security/Data) |
| Dashboard owner | Faiz (delegated DR-014); dashboard scope/details pending |
| Alert/on-call owner and backup | Faiz primary (delegated Ops/SRE); no backup; single-person risk accepted |
| SLI eligibility definitions | Pending |
| SLO numerical objectives | Pending |
| Error budgets and burn-rate policy | Pending |
| Capacity/resource-overhead budget | Pending |
| Evidence custody/location | Faiz (delegated DR-014); location pending |

## 11. Exporter and telemetry-outage behavior

### Exporter-outage recommendation

- Core request/business success does not depend synchronously on an optional
  telemetry exporter.
- Local structured emission and metric recording use bounded memory/time and
  never block indefinitely.
- Export buffering, retry, drop, and backpressure are bounded and observable
  without recursively generating unbounded telemetry.
- Export failure degrades observability and triggers a safe local signal; it
  does not silently switch to logging sensitive payloads.
- Security-event persistence and domain audit writes keep their approved
  operation-specific behavior and are not downgraded to optional telemetry.
- If Operations later classifies a telemetry control as production-required,
  its readiness/release effect needs explicit approval and deployment evidence;
  adding a `required` flag alone is insufficient.

**Approval field:** `Pending Operations/SRE/Security decision`

## 12. Recommended decision sequence

Approve or amend decisions in this order:

1. Data classification, global prohibited values, and access/retention owners.
2. JSON Lines structured-log envelope and event registry.
3. Metric inventory, units, finite labels, cardinality/resource budgets, and
   SLI formulas.
4. Export/exposure model, destination/provider, and exporter-outage behavior.
5. Numerical SLOs, thresholds, error budgets, dashboards, alerts, responders,
   and runbooks.
6. Feature 7.2 worker topology acceptance, followed by worker metric/query
   implementation design.
7. Separate source implementation authorization on a freshly fetched baseline.

The branch name for that later implementation may be
`feat/backend-observability`. This planning branch must not be repurposed into
source work.

## 13. Post-approval implementation outline

Only after the approval record and separate source authorization exist:

1. Revalidate current source, dependencies, PR `#107`, and deployment
   assumptions against freshly fetched `origin/main`.
2. Introduce a strict structured-event schema/formatter and replace concrete
   request paths/free-text operational events with bounded route/event fields.
3. Extend redaction/spoofing tests across request, dependency, worker,
   transaction, readiness, and exception paths.
4. Add the approved metric port plus the approved exporter/exposure adapter;
   do not add unused instrumentation or a public endpoint.
5. Instrument HTTP RED, dependency, readiness, transaction, and accepted
   worker/scheduler signals with finite labels and measured overhead.
6. Emit approved operational alert events and connect only the approved
   destination/rules.
7. Add exporter-outage, backpressure/drop, multiprocess, cardinality,
   timeout/cancellation, worker backlog, and transaction-unknown tests.
8. Verify dashboards and alert delivery in an approved staging-like topology
   with redacted evidence and named responders.

Potential later source areas include `backend/server.py`,
`backend/transaction_observability.py`, a bounded observability schema/metric
port, worker/scheduler modules after Feature 7.2 acceptance, and focused tests.
This list is planning context, not permission to edit those files now.

## 14. Later implementation verification gates

- Every structured event validates against a closed schema.
- Negative fixtures prove prohibited request, identity, provider, exception,
  database, and credential values never reach logs/metrics/alerts.
- Request metrics use route templates and remain bounded under arbitrary paths.
- Unknown metric labels map to one bounded value and cannot create series
  growth.
- Metrics/export do not alter API/domain outcomes when telemetry is optional.
- Export outage and buffer saturation remain bounded and visible.
- Dependency timeouts produce safe duration/outcome signals and clean up
  resources.
- Worker gauges represent global state correctly across the accepted topology.
- Transaction unknown outcomes remain ambiguous, alertable, and never trigger
  callback replay.
- Staging-like dashboards calculate the approved SLIs from the exact artifact.
- Test alerts reach the approved destination and responder with no prohibited
  data.
- CPU, memory, latency, storage, and cardinality overhead stay inside the
  approved capacity budget.

## 15. Approval record

The Project Owner authorized planning and Git delivery of this proposal on
2 August 2026, then separately authorized PR reconciliation and merge on
3 August 2026. On 5 August 2026, Yanuar/Owner delegated the DR-014 decision
authority recorded in section 2 to Faiz, who approved the high-level JSON
Lines/stdout/stderr and no-external-provider direction plus the bounded
Feature 7.2 lease/worker values. Numerical observability values and source
implementation remain separately gated.

| Approval | Owner | Value / evidence | Date |
| --- | --- | --- | --- |
| Planning and commit/push/PR authorization | Project Owner | Granted for documentation-only proposal | 2 August 2026 |
| PR reconciliation and merge | Project Owner | Granted for this documentation-only proposal | 3 August 2026 |
| DR-014 delegated decision authority | Yanuar/Owner -> Faiz | Ops/SRE accountable, Security/Data reviewer, and DR-014 decision-maker through 30 August 2026; no backup owner; single-person risk accepted | 5 August 2026 |
| Data classification and redaction contract | Faiz (delegated Ops/SRE + Security/Data) | Pending value | Pending |
| Structured logging contract | Faiz (delegated Ops/SRE + Security/Data) | Approved high-level Option B: JSON Lines to stdout/stderr; schema/redaction details pending | 5 August 2026 |
| Metric inventory/cardinality contract | Faiz (delegated DR-014) | Pending value | Pending |
| Export model/provider/destination | Faiz (delegated Ops/SRE + Security/Data) | No external provider approved; local stdout/stderr emission approved at high level; destination/export details pending | 5 August 2026 |
| Timeout visibility contract | Faiz (delegated DR-014) | Pending value | Pending |
| Worker observability contract | Faiz (delegated Ops/SRE) | Feature 7.2 high-level and bounded lease/worker values approved; metric/query/capacity evidence pending | 5 August 2026 |
| Transaction diagnostic/alert contract | Faiz (delegated Ops/SRE + Security/Data) | Pending value | Pending |
| Retention/access policy | Faiz (delegated Ops/SRE + Security/Data) | Pending value | Pending |
| SLI/SLO/error-budget/threshold package | Faiz (delegated DR-014) | Pending value | Pending |
| Alert responder/runbook/evidence ownership | Faiz (delegated Ops/SRE) | Pending value | Pending |
| Separate source implementation authorization | Project Owner | Pending | Pending |

Until the remaining fields have explicit values and approval evidence, Feature
7.3 remains `decision_blocked`; the approved worker values do not replace the
remaining observability values. Source implementation, provider activation,
deployment, production-readiness claims, and go-live must not begin.
