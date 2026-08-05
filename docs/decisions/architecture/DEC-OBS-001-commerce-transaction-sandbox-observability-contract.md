# DEC-OBS-001 — Commerce Transaction 1A Sandbox Observability Contract

Status: **Approved Decision — Source Gate Recorded; Operational Gates Separate**

Decision ID: `DEC-OBS-001`

Decision date: 5 August 2026 (Asia/Jakarta; 4 August 2026 UTC)

Scope: Commerce Transaction 1A, local/test, and explicitly named sandbox
validation through 30 August 2026

Approval source: Yanuar/Owner delegated accountable Product Owner,
Technical/Release Owner, DR-014 Ops/SRE, Security/Data reviewer, and
decision-maker responsibility to Faiz through 30 August 2026 for Commerce
Transaction 1A. The delegation covers G7-B sandbox and implementation-scope
accountability; it does not replace the separate source-implementation gate or
authorize provider activation, production credentials, migration, deployment,
production readiness, or go-live. After PR `#135` merged as `819a4ef`, Faiz
explicitly approved the complete Feature 7.3 candidate baseline without
amendment.

Source package: `docs/implementation/production-readiness/phases/FEATURE-7.3-backend-observability-decision-package.md`

## Decision

The Feature 7.3 candidate baseline is approved as the bounded, provider-neutral
observability contract for the stated sandbox scope. The complete metric
inventory, label registries, bucket list, workload, alert matrix, and evidence
fields in the source package are part of this decision. This approval records
the operating contract; it does not authorize its implementation.

### Data, redaction, retention, and access

- Operational telemetry is **Internal Operational Data**. Domain audit records,
  authentication security events, recipient notifications, and provider
  records remain separate stores and policies.
- Records use a closed allowlist for schema/version, UTC timestamp, level,
  trusted service/environment, event, safe route/method/status, bounded
  duration, safe operation/dependency/worker/channel/state/outcome/error
  classes, retry mode, bounded counts, and bounded age/duration buckets.
- Credentials, tokens, cookies, contact data, customer or business payloads,
  query strings, identifier-bearing paths, arbitrary IDs, provider/database
  payloads, connection details, raw exception bodies, and traceback locals are
  prohibited.
- Local stdout/stderr is ephemeral. If raw output is captured as a sandbox
  file, retain it for 7 calendar days and never commit it to Git. Retain only
  redacted aggregate metric/alert summaries and evidence packets for 30
  calendar days; mark superseded evidence rather than overwriting it.
- Faiz is the only named delegated Ops/SRE and Security/Data reviewer for this
  contract. Review access before each validation and at least every 30 days.
  There is no general audit viewer and no customer access.

### Metrics, SLI, cardinality, and capacity

- Use the provider-neutral internal metric port with closed finite labels.
  Unknown values map to `unknown` or `other`; request, resource, customer,
  and correlation identifiers are not metric labels.
- The histogram buckets are 10, 50, 100, 250, 500, 1000, 2000, 5000,
  10000, 15000, 30000, and 60000 milliseconds. Each combination emits 12
  buckets plus `_count` and `_sum`, or 14 entries.
- At most 1,000 active histogram combinations (14,000 entries) are allowed.
  Counters, gauges, and reserved control signals have at most 6,000 further
  entries, with `14H + C + G + R <= 20,000` across the sandbox process set.
  Dynamic labels or configurations that exceed an allocation are rejected and
  counted, never created.
- The approved budgets are at most 5 percentage points of process CPU delta,
  64 MiB resident-memory delta, 5 ms and 5% p95 latency increase, 25 MiB of
  structured output per day, and 256 records or 1 MiB of optional buffering,
  whichever is reached first.
- Workload `OBS-DR014-SB-001` uses synthetic data, one API process, one
  co-located test worker, 100 HTTP operations, 3 worker items, at most 4 HTTP
  clients, one mutation in flight, 60 seconds of warm-up, 5 paired
  repetitions, and a 5-minute repetition ceiling. The activity, order-attempt,
  buffer, and entry limits are hard ceilings.

### Telemetry model and exporter failure

- Emit provider-neutral JSON Lines to local process stdout/stderr only. No
  external provider, endpoint, credential, or network destination is selected
  by this decision.
- Optional telemetry must not synchronously determine or roll back a
  successful core mutation. A telemetry write has a 50 ms per-record bound.
  Optional buffering is bounded to 256 records or 1 MiB; one bounded retry is
  allowed for a later adapter. It must not block indefinitely.
- Drop lower-severity optional records before warning/critical records when
  capacity is exhausted. Increment a bounded drop counter and never fall back
  to sensitive payload logging.
- Reserve a single-slot path for the redacted
  `telemetry_pipeline_degraded` signal. Emit at most one signal per 60 seconds
  after three consecutive write failures, buffer saturation, or a drop ratio
  above 1% over 5 minutes. A bounded one-bit retry latch may remain when the
  sink is unavailable; recursive sensitive logging is prohibited.
- Required authentication security-event persistence and domain audit writes
  retain their own approved failure behavior and are never downgraded to
  optional telemetry.

### SLO, alerts, responder, and evidence

- Use a rolling 30-day window. Exclude health/readiness/metrics probes and
  explicitly marked synthetic validation traffic from customer-facing SLIs.
  Exclude only pre-recorded maintenance up to 4 hours per window.
- Below 100 eligible HTTP requests, or below 3 eligible logical transaction or
  worker items for their respective SLO, record `insufficient_sample` and do
  not claim pass or failure.
- The approved objectives are: API availability 99%; API latency 99% within
  2,000 ms; required-dependency readiness 99%; transaction availability and
  certainty 99.5% each; worker freshness 99% within 60 seconds; worker
  exhaustion 99.5%; and optional telemetry acceptance 99% as a diagnostic SLI.
- Burn-rate review warns at 10% of the applicable error budget in a rolling
  1-hour window and is critical at 50% in a rolling 6-hour window, subject to
  the sample rule. Commit-unknown, transaction-capability rejection, newly
  exhausted work, and buffer saturation over 60 seconds are immediately
  critical.
- Alert families and thresholds remain the exact closed set in the Feature 7.3
  package. Alerts are redacted JSON Lines to stdout/stderr, deduplicated by
  safe family/class/environment/15-minute bucket, and preserve only aggregate
  count plus first/last timestamps.
- Faiz is the primary responder with no backup. This is a sandbox review
  objective, not a 24/7 production on-call commitment: critical alerts are
  reviewed within 15 minutes during an active validation session and otherwise
  before the next run and within one business day; warnings are reviewed within
  one business day.
- Evidence is redacted, timestamped, and records the SHA, environment,
  command/collection method, result, redactions, limitations, collector, and
  reviewer. Evidence follows the existing evidence guide and is retained for
  30 days.

## Consequences and boundaries

This decision closes the DR-014 Feature 7.3 candidate-baseline question for the
specified sandbox scope. It provides a measurable contract for a later source
review and validation packet while preserving provider neutrality and the
single-person ownership risk accepted by the delegation.

The following remain separate gates and are not authorized by this decision:

- source implementation or instrumentation;
- provider activation, external exporter selection, production credentials, or
  external network destinations;
- database migration, data-bearing execution, deployment, or topology/routing
  changes;
- production-readiness, release, incident/on-call, SLA, or go-live claims; and
- production or shared/staging evidence.

The source gate below is a separate authorization from this decision. The
package and this decision must not be treated as runtime or production
evidence.

## Source-gate implementation addendum — 5 August 2026

On 5 August 2026 (Asia/Jakarta; 4 August 2026 UTC), Faiz approved the exact
Feature 7.2 and Feature 7.3 source/test scopes recorded in their task cards.
The implementation was prepared on a fresh `origin/main` worktree and remains
limited to local/test source and proportional tests. This addendum supersedes
only the earlier source-implementation gate for those exact paths; it does not
authorize Git publication, sandbox evidence collection, provider activation,
production credentials, migration, deployment, production-readiness, or
go-live.
