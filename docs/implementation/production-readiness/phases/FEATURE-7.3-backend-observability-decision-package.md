# Feature 7.3 — Backend Observability Decision Package

Status: **DR-014 candidate baseline approved; exact source scope authorized; Git publication and operational gates remain separate**

Original planning date: 2 August 2026 (Asia/Jakarta)

Reconciliation date: 3 August 2026 (Asia/Jakarta)

Branch: `plan/backend-observability`

PR: `#108` merged as `b336198`; the worksheet update in PR `#133` merged as
`5dd6112`; the candidate baseline proposal in PR `#134` merged as `0b699fe`;
review-remediation PR `#135` merged as `819a4ef`. This package records the
approved baseline; the exact source scope is authorized in the addendum below,
while Git publication and operational execution remain separate gates.

Baseline: `a2b7be0d445cf3a338d91cf74841e3bf8be11a91`
(`origin/main`, fetched 2 August 2026)

Reconciliation baseline: `fe1d8a0274ae106f9ca400570d53a44bc23e149a`
(`origin/main`, merged 3 August 2026). This changes no decision or source gate.

Current approved-decision baseline: `819a4effd2def557e1485fe919eceb70d69123c3`
(`origin/main`, PR `#135`, fetched 4 August 2026 UTC (5 August 2026
Asia/Jakarta)). The decision-record follow-up changes documentation only and
does not replace the historical baselines above.

Decision dependency: `DR-014`

Related roadmap task: `PHASE-08B`; `TASK-08B-01`; `TASK-08B-02`

Reconciliation note: statements below that describe source work as gated or
pending preserve the historical planning state of the decision package. The
5 August 2026 source-gate addendum and the Feature 7.2/7.3 task cards record
the later exact source/test authorization. Git publication, sandbox evidence,
provider activation, migration, deployment, and go-live remain separate.

## Decision authority

On 4 August 2026 UTC (5 August 2026 Asia/Jakarta), Yanuar/Owner also
delegated to Faiz the accountable Product Owner and Technical/Release Owner
responsibility for Commerce Transaction 1A through 30 August 2026. That
delegation covers G7-B sandbox and implementation-scope accountability,
including product input for customer-visible service objectives. It does not
authorize provider activation, production credentials, migration, deployment,
production readiness, or go-live.

On 4 August 2026 UTC (5 August 2026 Asia/Jakarta), Yanuar/Owner delegated to Faiz the Ops/SRE accountable
role, Security/Data reviewer role, and DR-014 decision-maker responsibility for
Commerce Transaction 1A through 30 August 2026. No backup owner exists; the
single-person ownership risk is accepted.

This delegation resolves who may review and decide the remaining provider-
neutral observability values. It does not itself approve a telemetry provider
or destination, retention/access policy, SLO, error budget, threshold,
capacity limit, production credential, migration, deployment, or go-live.

On 4 August 2026 UTC (5 August 2026 Asia/Jakarta), Faiz approved JSON Lines
application emission to stdout/stderr and no external telemetry provider at
high level. After PR `#135` merged as `819a4ef`, Faiz explicitly approved the
complete Feature 7.3 candidate baseline without amendment, including the
classification/redaction, retention/access, metrics/SLI/cardinality,
capacity, exporter-outage, SLO/error-budget, alert, responder, and evidence
values recorded below. The source gate for the exact source/test scope is
recorded in the addendum below; operational execution remains separately
gated.

The dependent Feature 7.2 worker values are also approved for the bounded
contract: 15-second maximum delivery operation, 5-second acknowledgement,
40-second clock/network margin, 60-second lease, 30-second renewal threshold,
concurrency 1, claim-ahead 0, and 30-second worker drain. This does not approve
environment execution or production-readiness values.

## Decision status and approved contract

This section records the provider-neutral candidate contract that Faiz approved
without amendment after PR `#135` merged. Existing high-level JSON
Lines/stdout/stderr, no-external-provider, and Feature 7.2 worker-value
approvals remain bounded as recorded above. The approval records the operating
baseline; the later source gate is limited to the exact paths in the addendum.
Provider activation, credentials, migration, deployment, production readiness,
and go-live remain separate gates.

| Decision area | Approved contract | Decision state |
| --- | --- | --- |
| Data classification | Operational telemetry is internal operational data. Domain audit records, authentication security events under `DEC-AUTH-009`/`DEC-AUTH-011`, and recipient notifications under `DEC-DATA-003` remain separate stores and policies. | Approved baseline; exact source scope authorized below |
| Redaction | Emit only closed, allowlisted event fields and safe outcome classes. Exclude credentials, tokens, cookies, contact data, customer/business payloads, concrete identifier-bearing paths, provider/database payloads, and raw exception bodies. | Approved baseline; exact source scope authorized below |
| Retention and access | Use least-privilege named operational/security access; do not create a general audit viewer or expose telemetry as customer data. Raw captured output is retained 7 days; redacted summaries/evidence 30 days; Faiz is the named reviewer. | Approved baseline; operational evidence remains gated |
| Metrics and SLI | Use the finite metric inventory and formula boundaries in Sections 5, 8, and 9. Labels remain closed/finite; unknown values map to `unknown`/`other`; no request/resource/customer identifiers become labels. | Approved baseline; exact source scope authorized below |
| Cardinality and capacity | Use the approved histogram, collection, multiprocess, storage, CPU, memory, latency, and buffer budgets against the representative synthetic workload. | Approved baseline; sandbox evidence remains gated |
| Telemetry model and exporter outage | Use JSON Lines to stdout/stderr with no external provider. Any later adapter is optional, bounded, observable, and must not block a successful core mutation; buffering, drop, backpressure, and degraded-signal behavior are bounded below. | Approved baseline; exact source scope authorized below |
| SLO, error budget, and thresholds | Use the approved SLI formulas with explicit eligibility, low-traffic, maintenance-window, percentile, objective, and burn-rate rules. | Approved baseline; sandbox evidence remains gated |
| Alerts, responder, and evidence | Use the closed alert families with safe severity, deduplication, runbook/evidence correlation, Faiz as primary responder, no backup, and the approved sandbox response objective. | Approved baseline; exact source scope authorized below |

### Approval worksheet

Faiz, acting under the recorded Yanuar/Owner delegation, explicitly approved
each candidate area without amendment after PR `#135` merged. A PR merge or
green CI is not itself the approval; the approval is recorded here and in
`DEC-OBS-001`. The exact source/test scope is authorized in the addendum below;
Git publication and sandbox evidence remain separate.

| Required approval | Current record | Required output |
| --- | --- | --- |
| Classification and redaction | Approved without amendment; see baseline below and `DEC-OBS-001` | Approved data classes, prohibited fields, safe event/exception allowlists |
| Retention/access/evidence | Approved without amendment: 7-day raw capture, 30-day redacted evidence, Faiz-only named access | Retention/deletion periods, authorized roles, review cadence, evidence custody and retention |
| Metric/SLI/cardinality | Approved without amendment; finite inventory, formulas, registries, and buckets below | Metric types/units, finite labels, eligibility rules, collection/bucket/aggregation constraints |
| Capacity/resource overhead | Approved without amendment; CPU, memory, latency, storage, cardinality, and buffer budgets below | CPU, memory, latency, storage, cardinality, and buffer budgets |
| Telemetry destination/exporter outage | Approved without amendment: local JSON Lines; no external provider | Export/exposure model, destination decision, outage/drop/backpressure limits |
| SLO/error budget/threshold | Approved without amendment; numerical objectives and alert thresholds below | Numerical objectives, windows, low-traffic/maintenance treatment, burn-rate policy |
| Alerts/responder/runbook | Approved without amendment; Faiz primary, no backup, sandbox response objective below | Severity, threshold/window, deduplication, response objective, destination, runbook/evidence location |
| Source implementation gate | Historical planning state | Not authorized at the time of this worksheet; superseded by the 5 August 2026 source-gate addendum below |

### Approved sandbox baseline (implementation-gated)

The following is the approved bounded baseline for Commerce Transaction 1A
sandbox validation. It is deliberately local and provider-neutral, and is not
a production SLA, provider selection, credential authorization, source
implementation approval, or go-live decision. Faiz approved every row without
amendment on 5 August 2026 (Asia/Jakarta; 4 August 2026 UTC). The baseline
applies through the recorded delegation end date of 30 August 2026 and only to
local, test, or explicitly named sandbox evidence.

Domain audit, authentication security-event, and recipient-notification
policies remain under their own approved decisions.

#### Data classification, redaction, retention, and access

| Field | Approved baseline value |
| --- | --- |
| Data class | Operational telemetry is **Internal Operational Data**. It is not the domain audit system, authentication security-event store, recipient feed, or provider record. |
| Common allowlist | `schema_version`, UTC `timestamp`, closed `level`, trusted `service` and `environment`, closed `event`, validated opaque `request_id` in access-controlled logs only, route template, HTTP method, status class, bounded duration, and event-specific closed fields. |
| Event-specific allowlist | `dependency_class`, `operation_class`, `worker_class`, `channel`, `job_name`, `safe_state`, `safe_outcome`, `safe_error_class`, `retry_mode`, bounded `attempt_count`, `lease_state`, bounded aggregate `count`, and bounded age/duration buckets. |
| Safe outcome/error classes | `success`, `timeout`, `unavailable`, `rejected`, `failed_safe`, `cancelled`, `commit_unknown`, `schema_rejected`, `dropped`, and `backpressure`. No free-form error class is allowed. |
| Redaction | Emit only the closed allowlist. Prohibit credentials, tokens, cookies, contact data, customer/business payloads, concrete identifier-bearing paths, query strings, provider/database payloads, raw exception bodies, traceback locals, connection details, and arbitrary IDs. |
| Raw telemetry retention | stdout/stderr is ephemeral. If captured as a sandbox file, retain it for 7 calendar days, then delete it; never commit raw telemetry to Git. |
| Derived and evidence retention | Retain only redacted aggregate metric/alert summaries and evidence packets for 30 calendar days. Mark superseded evidence rather than overwriting it. |
| Access and review | Faiz is the only named delegated Ops/SRE and Security/Data reviewer for this sandbox contract. Review access before each validation and at least every 30 days; no general audit viewer and no customer access. |
| Custody boundary | Use the redaction, naming, provenance, and storage rules in `docs/context/production-readiness-audit/evidence/README.md`. Existing domain retention policies are not changed by this baseline. |

#### Metrics, SLI, labels, cardinality, and capacity

| Field | Approved baseline value |
| --- | --- |
| Metric model | Use the provider-neutral internal metric port (Option C). Counters, gauges, and histograms are serialized as bounded JSON Lines records to stdout/stderr; no pull endpoint, SDK exporter, or external provider is selected for sandbox. |
| Collection and aggregation | Counters and event outcomes are recorded at event time. Gauge snapshots and histogram aggregates flush every 60 seconds. Counters and histograms may be added across API/worker processes; global worker gauges come from the accepted worker owner and are never multiplied by process count. |
| Histogram buckets | Milliseconds: `10`, `50`, `100`, `250`, `500`, `1000`, `2000`, `5000`, `10000`, `15000`, `30000`, and `60000`. |
| Allowed labels | Use only the finite inventory in Section 5: method, route template, status class, dependency class, operation class, outcome, worker class, channel, safe state, job name, safe operation name, retry mode, and safe capability reason. |
| Label registry ceilings | At most 32 route templates, 16 safe operation names, 8 dependency classes, 4 worker classes, 4 channels, 8 scheduled jobs, and 8 values for each status/outcome/state/retry registry. Unknown values map to `unknown` or `other`. |
| Cardinality ceiling | Each histogram-family/label combination emits 12 bucket entries plus one `_count` and one `_sum`, or 14 entries. Across all histogram families, allow at most 1,000 active combinations (14,000 entries) and at most 6,000 entries for counters, gauges, and control signals; `14H + C + G + R <= 20,000` across the sandbox process set. Dynamic labels or configurations exceeding an allocation are rejected and counted, never created. |

In that formula, `H` is the total number of active histogram-family/label
combinations, `C` and `G` are active counter and gauge entries, and `R` is the
reserved control/degraded-signal allowance. The 1,000-combination histogram
cap therefore consumes at most 14,000 entries and leaves 6,000 entries for
non-histogram and control signals.

| SLI window and eligibility | Use a rolling 30-day window. Exclude health/readiness/metrics probes and explicitly marked synthetic validation traffic from customer-facing SLIs. Planned maintenance is excluded only when recorded before start and limited to 4 hours per window. |
| Low-traffic rule | Require at least 100 eligible HTTP requests for API SLO calculations and at least 3 eligible logical transaction or worker items for their respective SLOs. Below the minimum, report `insufficient_sample` and raw counts; do not claim pass or failure. |
| CPU budget | Observability-enabled process CPU delta is at most 5 percentage points over a representative 5-minute sandbox run compared with the same run without telemetry. |
| Memory budget | Observability-enabled resident-memory delta is at most 64 MiB during the representative sandbox run. |
| Latency budget | p95 request-duration increase is at most 5 ms and at most 5% versus the telemetry-disabled comparison. |
| Output/storage budget | Structured telemetry output is at most 25 MiB per day at the approved sandbox activity ceiling. No persistent metrics store is assumed. |
| Buffer budget | Any optional adapter may buffer at most 256 records or 1 MiB, whichever is reached first. Buffer capacity is included in the output/storage measurement. |

#### Representative sandbox workload `OBS-DR014-SB-001` (approved baseline)

The CPU, memory, latency, output, and cardinality budgets above are measured
against this bounded synthetic workload. It is an approved workload definition,
not source or production evidence.

| Dimension | Approved baseline definition |
| --- | --- |
| Data and process isolation | Use synthetic Commerce Transaction 1A records only, the same immutable application artifact for both paired runs, one API process, and one explicitly co-located development/test worker. Do not use customer data, production credentials, external providers, or a shared/staging/production target. |
| Request mix | Per repetition, issue 100 synthetic HTTP operations: 50 read/validation operations, 20 authenticated Commerce Transaction 1A reads, 20 transaction-required synthetic mutations with at most 5 order attempts, and 10 controlled invalid/timeout cases. Add 3 synthetic worker items for claim/result/heartbeat signals. |
| Concurrency | Use at most 4 HTTP clients, with no more than 1 transaction-required mutation in flight. Keep worker concurrency at the approved value of 1 and claim-ahead at 0. |
| Warm-up and repetitions | Warm up for 60 seconds, discard warm-up measurements, then run 5 paired repetitions. Each repetition has a 5-minute wall-clock ceiling; stop when the operation cap is reached. |
| Activity ceiling | The 100 HTTP operations, 5 order attempts, 3 worker items, 256-record/1 MiB buffer, and 20,000 emitted-entry budget are hard per-repetition ceilings. |
| Measurement method | Run telemetry-disabled and telemetry-enabled conditions with identical data, process limits, and request order. Measure p95 client-observed latency, process CPU delta, resident-memory delta, JSON Lines bytes, emitted entries, dropped records, and histogram combinations using monotonic timestamps and OS/process counters. Record the SHA, environment, command, sample counts, median/worst repetition, redactions, and limitations in the evidence packet. |

#### Telemetry model and exporter-outage behavior

| Field | Approved baseline value |
| --- | --- |
| Sandbox destination | Local process stdout/stderr as JSON Lines only. No external provider, endpoint, credential, or network destination is part of this decision. |
| Core-transaction boundary | Optional telemetry must never synchronously determine a successful core mutation and must not roll it back. A telemetry write may consume at most 50 ms per record before it is treated as degraded. |
| Buffer and retry | No application-level retry is required for the local sink. A later optional adapter may use one bounded retry, the 256-record/1 MiB limit above, and must return or drop within the bounded budget; it may not block indefinitely. |
| Drop/backpressure | Prefer dropping low-severity success/info records before warning/critical records. When capacity is exhausted, drop the new optional telemetry record, increment a bounded drop counter, and never fall back to sensitive payload logging. Reserve a dedicated single-slot path outside the optional buffer for the redacted `telemetry_pipeline_degraded` control signal; buffer saturation must not evict that signal. |
| Degraded signal | Emit at most one redacted `telemetry_pipeline_degraded` signal per 60 seconds after three consecutive write failures, any buffer saturation, or a drop ratio above 1% over 5 minutes. Emit it directly to local stderr or the dedicated slot, coalesce repeats, and retain a bounded one-bit retry latch if the sink itself is unavailable; never recursively log sensitive data. |
| Security and audit boundary | Required authentication security-event persistence and domain audit writes retain their own approved failure behavior; they are never downgraded to optional telemetry. |

#### SLO, error budget, thresholds, responder, and evidence

| SLI/SLO | Approved sandbox objective and error budget |
| --- | --- |
| API availability | At least 99% of eligible requests are non-5xx in each rolling 30-day window; error budget is 1% of eligible requests. |
| API latency | At least 99% of eligible requests complete within 2,000 ms in each rolling 30-day window; error budget is 1%. The histogram supports additional percentile review but does not change this objective. |
| Required dependency availability | At least 99% of observed required-dependency time is ready; error budget is 1%. |
| Transaction availability | At least 99.5% of eligible transaction-required mutations are not rejected for unavailable transaction capability; error budget is 0.5%. |
| Transaction certainty | At least 99.5% of eligible logical transactions reach a non-ambiguous terminal outcome; error budget is 0.5%. Any commit-unknown event is immediately alertable even when the sample is too small for an SLO claim. |
| Worker delivery freshness | At least 99% of eligible due work completes within 60 seconds of eligibility; error budget is 1%. The approved 60-second lease remains a worker control, not proof of this SLO. |
| Worker exhaustion | At least 99.5% of terminal worker outcomes are not exhausted; error budget is 0.5%. Any newly exhausted item is separately alertable. |
| Telemetry pipeline health | At least 99% of attempted optional telemetry records are accepted rather than dropped when acceptance is measurable. This is a diagnostic SLI, not a customer-facing availability SLO. |
| Low traffic and maintenance | Below the minimum sample, record `insufficient_sample` and do not burn a percentage budget. Only pre-recorded maintenance up to 4 hours per 30-day window is excluded; all other failures count. |
| Burn-rate policy | Warning at 10% of the applicable error budget consumed in a rolling 1-hour window; critical at 50% consumed in a rolling 6-hour window, subject to the minimum sample. A commit-unknown, transaction-capability rejection, newly exhausted item, or buffer saturation over 60 seconds is critical immediately. |

| Alert family | Approved sandbox trigger, severity, and response |
| --- | --- |
| API error rate | Warning at at least 1% over 15 minutes with at least 20 eligible requests; critical at at least 5% over 5 minutes with at least 20. |
| API latency | Warning when at least 1% exceed 2,000 ms over 15 minutes with at least 20 requests; critical when at least 5% exceed 5,000 ms over 5 minutes with at least 20. |
| Dependency timeout/unavailable | Warning at 3 timeouts or 5% over 5 minutes with at least 20 operations; critical when a required dependency is unavailable for more than 60 seconds. |
| Worker backlog/lease | Warning when oldest due work exceeds 60 seconds for 10 minutes or a lease is lost; critical when oldest due work exceeds 300 seconds for 5 minutes or three leases are lost in 5 minutes. |
| Worker exhaustion | Critical on any newly exhausted terminal outcome. |
| Transaction integrity | Critical on any commit-unknown or transaction-capability rejection; do not suppress the first occurrence. |
| Telemetry pipeline degraded | Warning after the approved degraded signal; critical when the buffer is saturated for more than 60 seconds. |
| Severity and deduplication | `critical` means integrity, required-dependency, or sustained-loss review; `warning` means bounded degradation; `info` is an expected transition. Deduplicate by closed family, safe class, environment, and 15-minute bucket; preserve aggregate count and first/last timestamps without identifiers. |
| Destination and responder | Emit the alert as a redacted JSON Lines record to stdout/stderr. Faiz is the primary responder with no backup. This is a sandbox review objective, not a 24/7 production on-call commitment: critical alerts are reviewed within 15 minutes during an active validation session and otherwise before the next run and within one business day; warnings within one business day. |
| Evidence | Store redacted, timestamped decision/test/operational evidence under the existing evidence guide, retain it for 30 days, and record SHA, environment, command or collection method, result, redactions, limitations, collector, and reviewer. Raw telemetry is not committed. |

These values are intentionally conservative sandbox values. Faiz approved them
without amendment after PR `#135` merged. They close the DR-014 baseline
decision for this scope, but they do not authorize source implementation or
operational execution. A separate Project Owner gate is still required.

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

**Approval field:** JSON Lines/stdout/stderr, no external provider, retention,
and exporter-outage behavior are approved for the bounded sandbox baseline by
Faiz without amendment. The exact source schema scope is authorized in the
source-gate addendum; adapter/provider activation and evidence remain gated.

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

### Request-correlation implementation inputs

The safe correlation and route-template requirements above are part of the
approved baseline. At planning time the exact source framework configuration
and tests were a separate implementation-gated design task; the bounded source
paths are now recorded in the source-gate addendum.

| Field | Approved value |
| --- | --- |
| Inbound request-ID trust boundary | Source implementation detail; separate gate |
| Request ID format/length | Approved safe UUID direction; exact source contract separate gate |
| Route-template resolution behavior | Approved requirement; source implementation detail separate gate |
| Successful-request log sampling | Approved no initial sampling direction; source implementation detail separate gate |
| Probe/metrics route SLI treatment | Approved exclusion from customer-facing SLI; source implementation detail separate gate |

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

### Metrics implementation inputs

The metric model, finite registries, buckets, cardinality formula, and resource
budgets below are approved by `DEC-OBS-001`. No adapter dependency is selected;
the source aggregation tests are covered by the exact source-gate scope, while
evidence and any later adapter remain gated.

| Field | Approved value |
| --- | --- |
| Export model (pull/export) | Approved internal metric port; no external provider; no adapter is selected |
| Metrics dependency/adapter | No dependency or external adapter selected; any later adapter is a separate gate |
| Endpoint/network/access boundary | Approved no external endpoint/network destination in sandbox; source detail separate gate |
| Collection interval | Approved 60-second gauge/histogram flush direction; source detail separate gate |
| Histogram buckets | Approved 12 buckets: 10, 50, 100, 250, 500, 1000, 2000, 5000, 10000, 15000, 30000, 60000 ms |
| Multiprocess aggregation model | Approved owner-based global gauges and additive counters/histograms; source tests separate gate |
| Cardinality ceiling | Approved `14H + C + G + R <= 20,000`, with `H <= 1,000` and 6,000 non-histogram/control entries |
| Metrics retention | Approved ephemeral stdout/stderr; captured raw 7 days and redacted aggregate/evidence 30 days |

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

### Approved alert families — source evaluation remains gated

| Family | Approved sandbox trigger input | Approved severity |
| --- | --- | --- |
| API error-rate | Warning at 1% over 15 minutes with at least 20 requests; critical at 5% over 5 minutes with at least 20 | Approved baseline; source evaluation gated |
| API latency | Warning at 1% over 2,000 ms for 15 minutes; critical at 5% over 5,000 ms for 5 minutes, with at least 20 requests | Approved baseline; source evaluation gated |
| Required dependency unavailable | Critical when a required dependency is unavailable for more than 60 seconds | Approved baseline; source evaluation gated |
| Dependency timeouts | Warning at 3 timeouts or 5% over 5 minutes with at least 20 operations | Approved baseline; source evaluation gated |
| Worker backlog stale | Warning oldest due work over 60 seconds for 10 minutes; critical over 300 seconds for 5 minutes | Approved baseline; source evaluation gated |
| Worker exhausted | Any newly exhausted terminal outcome | Approved baseline; source evaluation gated |
| Worker lease instability | Warning on a lost lease; critical on three lost leases in 5 minutes | Approved baseline; source evaluation gated |
| Scheduled job missed/failed | Covered by the approved safe scheduled-job signal; numeric production objective remains separate | Approved signal; source evaluation gated |
| Transaction unavailable | Critical on any transaction-capability rejection | Approved baseline; source evaluation gated |
| Transaction commit unknown | Critical on any ambiguous commit outcome; first occurrence is not suppressed | Approved baseline; source evaluation gated |
| Telemetry pipeline degraded | Warning after the degraded signal; critical when buffer saturation exceeds 60 seconds | Approved baseline; source evaluation gated |

### Alerting approval inputs

| Field | Approved value |
| --- | --- |
| Alert evaluation location | Approved bounded local signal/evaluation boundary for sandbox; source detail separate gate |
| Destination | Approved redacted JSON Lines to stdout/stderr; no external provider |
| Primary responder and backup | Faiz primary (delegated Ops/SRE); no backup; single-person risk accepted |
| Severity definitions | Approved: critical integrity/required-dependency/sustained-loss review; warning bounded degradation; info expected transition |
| Threshold/window per family | Approved in the baseline table and Section 10; source evaluation separate gate |
| Deduplication/suppression policy | Approved safe family/class/environment/15-minute bucket; aggregate count and first/last timestamps only |
| Response objective per severity | Approved sandbox review objective: critical within 15 minutes during active validation, otherwise before next run and within one business day; warning within one business day |
| Runbook/evidence location | Approved existing evidence guide; redacted evidence retained 30 days; source collection separate gate |

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
| HTTP server/request budget | Source implementation detail; separate gate |
| Mongo selection/connect/socket/wait budget | Source implementation detail; separate gate |
| Email/provider budget | Source implementation detail; separate gate; no provider selected |
| Storage/provider budget | Source implementation detail; separate gate; no provider selected |
| Cancellation classification | Approved bounded outcome direction; source detail separate gate |
| Retry-attempt visibility | Approved bounded per-attempt/per-logical-operation direction; source detail separate gate |

Feature 7.2's bounded worker delivery timing is an approved control input; the
source implementation is covered by the exact addendum scope, while acceptance
evidence remains separately gated.

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
- The approved sandbox alert thresholds and backlog objectives are recorded in
  `DEC-OBS-001`; source query work is covered by the exact addendum scope, while
  index/schema changes and evidence remain separately gated.
- General-notification ownership remains distinct from authentication cleanup
  and alert operations.

### Dependency on Feature 7.2

The historical planning text waited for the separate source gate and must be
read with the later addendum: the bounded instrumentation is now prepared, but
the current in-process loop is not production-ready evidence.

**Approval field:** Feature 7.2 bounded controls and the Feature 7.3 worker
observability baseline are approved; source/test implementation is authorized
within the exact addendum scope, while environment acceptance remains a
separate gate.

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

**Approval field:** Transaction diagnostic safety, bounded signals, and
commit-unknown alertability are approved for the sandbox baseline; source
instrumentation remains separately gated.

## 10. Decision 8 — SLI, SLO, error budget, retention, and ownership

### Approved SLI formulas and sandbox objectives

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
percentiles, objective numbers, error budgets, and alert thresholds are
approved for the bounded sandbox contract in `DEC-OBS-001`. They are not
production SLA commitments, and source measurement remains separately gated.

### Required decision fields

| Field | Approved value |
| --- | --- |
| Telemetry destination/provider | Approved local JSON Lines stdout/stderr; no external provider |
| Log retention | Approved ephemeral stdout/stderr; captured raw output 7 days |
| Metrics retention | Approved captured raw output 7 days; redacted aggregate/evidence 30 days |
| Alert/evidence retention | Approved redacted summaries and evidence 30 days |
| Access roles and review cadence | Approved Faiz-only named access; review before each validation and at least every 30 days |
| Privacy/retention approver | Faiz (delegated Security/Data); approved for this sandbox scope |
| Operations/SRE owner and backup | Faiz primary (delegated Ops/SRE); no backup; single-person risk accepted |
| Security reviewer | Faiz (delegated Security/Data) |
| Dashboard owner | Faiz (delegated DR-014); no external dashboard/provider is selected |
| Alert/on-call owner and backup | Faiz primary (delegated Ops/SRE); no backup; single-person risk accepted |
| SLI eligibility definitions | Approved rolling 30-day window, exclusions, sample floors, and maintenance rule below |
| SLO numerical objectives | Approved sandbox objectives in the SLO table above; not production SLA |
| Error budgets and burn-rate policy | Approved 10%/1-hour warning and 50%/6-hour critical burn-rate policy, subject to samples |
| Capacity/resource-overhead budget | Approved CPU, memory, latency, output, buffer, cardinality, and workload ceilings above |
| Evidence custody/location | Approved existing evidence guide; Faiz is collector/reviewer; redacted evidence retained 30 days |

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

**Approval field:** Exporter-outage, bounded buffering/drop, and security/audit
failure boundaries are approved for the sandbox baseline; source behavior and
any future adapter remain separately gated.

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

## 15. Approval record — historical planning state

The Project Owner authorized planning and documentation-only Git delivery of this proposal on
2 August 2026, then separately authorized PR reconciliation and merge on
3 August 2026. On 4 August 2026 UTC (5 August 2026 Asia/Jakarta), Yanuar/Owner
delegated the DR-014 decision authority recorded in section 2 to Faiz. After
PR `#135` merged as `819a4ef`, Faiz approved the complete Feature 7.3 candidate
baseline without amendment. The following table preserves the historical
planning-state approvals; the source-gate addendum below records the later
exact implementation authorization.

| Approval | Owner | Value / evidence | Date |
| --- | --- | --- | --- |
| Planning and commit/push/PR authorization | Project Owner | Granted for documentation-only proposal | 2 August 2026 |
| PR reconciliation and merge | Project Owner | Granted for this documentation-only proposal | 3 August 2026 |
| Candidate sandbox baseline approval | Faiz (delegated Ops/SRE + Security/Data + DR-014 decision-maker) | Complete Feature 7.3 baseline approved without amendment; recorded in `DEC-OBS-001` after PR `#135` merged as `819a4ef`; source gate recorded separately below | 4 August 2026 UTC (5 August 2026 Asia/Jakarta) |
| DR-014 delegated decision authority | Yanuar/Owner -> Faiz | Ops/SRE accountable, Security/Data reviewer, and DR-014 decision-maker through 30 August 2026; no backup owner; single-person risk accepted | 4 August 2026 UTC (5 August 2026 Asia/Jakarta) |
| Data classification and redaction contract | Faiz (delegated Ops/SRE + Security/Data) | Approved without amendment; `DEC-OBS-001` closed allowlist and prohibited-field boundary | 4 August 2026 UTC (5 August 2026 Asia/Jakarta) |
| Structured logging contract | Faiz (delegated Ops/SRE + Security/Data) | Approved JSON Lines to stdout/stderr, closed schema/redaction boundary, and no external provider; exact source scope recorded below | 4 August 2026 UTC (5 August 2026 Asia/Jakarta) |
| Metric inventory/cardinality contract | Faiz (delegated DR-014) | Approved finite inventory, labels, buckets, cardinality formula, and SLI boundaries; exact source scope recorded below | 4 August 2026 UTC (5 August 2026 Asia/Jakarta) |
| Export model/provider/destination | Faiz (delegated Ops/SRE + Security/Data) | Approved local stdout/stderr only, no external provider, and bounded outage/drop behavior | 4 August 2026 UTC (5 August 2026 Asia/Jakarta) |
| Timeout visibility contract | Faiz (delegated DR-014) | Approved safe duration/outcome visibility boundary; exact source scope is recorded below | 4 August 2026 UTC (5 August 2026 Asia/Jakarta) |
| Worker observability contract | Faiz (delegated Ops/SRE) | Approved bounded worker signals, thresholds, lease/control inputs, and evidence boundary; exact source scope is recorded below | 4 August 2026 UTC (5 August 2026 Asia/Jakarta) |
| Transaction diagnostic/alert contract | Faiz (delegated Ops/SRE + Security/Data) | Approved safe transaction signals and immediate commit-unknown alertability; exact source scope is recorded below | 4 August 2026 UTC (5 August 2026 Asia/Jakarta) |
| Retention/access policy | Faiz (delegated Ops/SRE + Security/Data) | Approved 7-day raw capture, 30-day redacted evidence, Faiz-only named access, and review cadence | 4 August 2026 UTC (5 August 2026 Asia/Jakarta) |
| SLI/SLO/error-budget/threshold package | Faiz (delegated DR-014) | Approved sandbox SLI/SLO objectives, sample rules, error budgets, burn-rate policy, and alert thresholds; not a production SLA | 4 August 2026 UTC (5 August 2026 Asia/Jakarta) |
| Alert responder/runbook/evidence ownership | Faiz (delegated Ops/SRE) | Approved Faiz primary/no backup, sandbox response objective, safe deduplication, and existing evidence guide | 4 August 2026 UTC (5 August 2026 Asia/Jakarta) |
| Separate source implementation authorization | Historical planning state | Pending at the time of this record; superseded by the source-gate addendum below | 5 August 2026 update |

The candidate baseline is now an approved DR-014 decision under `DEC-OBS-001`.
Feature 7.3 remains operationally gated: provider activation, production
credentials, migration, deployment, production-readiness claims, and go-live
require separate approval and evidence. The later explicit source gate
approved the exact source/test scope recorded in the Feature 7.2 and Feature
7.3 task cards; current Git publication remains separately gated.

## Source-gate implementation addendum — 5 August 2026

The historical approval record above described the state before source
authorization. On 5 August 2026 (Asia/Jakarta; 4 August 2026 UTC), Faiz
approved the exact Feature 7.2 and Feature 7.3 source/test scopes recorded in
their task cards. That authorization covers only the prepared local/test
source and proportional tests on the fresh `origin/main` worktree. It does
not authorize Git publication, sandbox evidence collection, provider
activation, production credentials, migration, deployment,
production-readiness, or go-live.
