# DEC-READY-01 — Readiness Dependency and Probe Contract

Status: **Approved Bounded Implementation Decision**
Decision ID: `DEC-READY-01`
Decision date: 2 August 2026 (Asia/Jakarta)
Approval source: Explicit Project Owner approval of the recommended
`DEC-READY-01` package on 2 August 2026
Scope: Feature 7.1 backend readiness source and tests only

## Decision

### Required dependencies

- Liveness is process-only and performs no dependency probe.
- A live database ping and compatible required schema/index state are always
  required for readiness.
- Transaction capability is required only when
  `TRANSACTION_MUTATIONS_ENABLED=true`.
- The in-process notification worker is required only on an instance with
  `NOTIFICATION_WORKER_REQUIRED=true`.
- Email configuration is required only when `EMAIL_DELIVERY_REQUIRED=true`.
  Provider reachability is not a web-readiness dependency; durable outbox,
  retry, and monitoring own transient provider failure.

### Probe bounds and publication

- Database ping is fresh for every readiness request and has a 500 ms timeout.
- Transaction evidence has a maximum age of 10 seconds and a one-second probe
  timeout.
- Schema/index evidence has a maximum age of 60 seconds and a two-second probe
  timeout.
- A readiness request has a total three-second deadline. Timeout, stale
  evidence, malformed evidence, and exceptions fail closed.
- Concurrent callers share refresh work through a single-flight coordinator.
  Published snapshots carry a monotonic generation so an older request cannot
  overwrite newer failure evidence.
- The application-owned coordinator refreshes transaction evidence every five
  seconds so the mutation guard does not depend on external health traffic and
  does not cross the approved ten-second maximum age while healthy.
- The readiness route does not directly mutate transaction-guard state. The
  probe coordinator is the sole source of bounded transaction evidence for the
  guard and other transaction-capability consumers.

### Worker and diagnostics

- A live notification-worker task emits an independent heartbeat every five
  seconds, including while a delivery batch is in progress. A required worker
  is unavailable when its task is missing/completed, it is stopped/disabled,
  or its heartbeat is more than 30 seconds old.
- Unknown schema/index inspection counts are represented as `null` with
  `inspection_complete=false`; unknown evidence is never reported as zero.
- Health responses expose only allowlisted status, reason, timestamp, required
  flags, version names, booleans, and aggregate counts. They never expose
  exception text, connection details, credentials, provider payloads,
  recipient data, or customer data.

### Ownership boundary

- Backend owns the bounded coordinator and source/test behavior.
- Platform/SRE owns internal probe routing and the approved timeout contract.
- A named deployment/on-call owner and staging-like route evidence remain open
  under `DR-012` and `DR-014`; this decision does not infer them.

## Explicit exclusions

- No shared, staging, or production probe or data access.
- No migration/index mutation, repair, backfill, deployment, provider
  activation, traffic routing change, alert destination, SLA/on-call
  assignment, production-readiness declaration, or go-live.
- No commit, push, PR, or merge authority is granted by this decision.

## Required source evidence

- Dependency loss, timeout, cache freshness, single-flight, and stale-snapshot
  tests.
- A concurrency test proving older evidence cannot overwrite a newer failure.
- Slow-batch worker heartbeat and stopped/stale/completed worker tests.
- Secret-safe and unknown-diagnostic tests.
- Full backend regression and existing local quality gates.
