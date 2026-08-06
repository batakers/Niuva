# Task Card — Feature 7.3 Backend Observability

Status: **Source-gate implementation prepared; sandbox evidence and all production gates remain separate**

Original planning date: 2 August 2026 (Asia/Jakarta)

Reconciliation date: 3 August 2026 (Asia/Jakarta)

Branch: `plan/backend-observability`

PR: `#108` merged as `b336198`; worksheet reconciliation PR `#133` merged as
`5dd6112`; candidate-baseline PR `#134` and remediation PR `#135` merged as
`0b699fe` and `819a4ef`; CI passed. Faiz's complete DR-014 baseline approval
is recorded in `DEC-OBS-001`; the exact source scope is authorized below, while
Git publication and operational execution remain separate gates.

Worktree: contributor-local isolated worktree for `plan/backend-observability`

Baseline: `a2b7be0d445cf3a338d91cf74841e3bf8be11a91`
(`origin/main`, fetched 2 August 2026)

Reconciliation baseline: `fe1d8a0274ae106f9ca400570d53a44bc23e149a`
(`origin/main`, merged 3 August 2026 after PR #107). The approved-decision
baseline is `819a4effd2def557e1485fe919eceb70d69123c3` (`origin/main`, PR
`#135`, fetched 4 August 2026 UTC (5 August 2026 Asia/Jakarta)).

Related roadmap task: `PHASE-08B`; `TASK-08B-01`; `TASK-08B-02`

Related downstream tasks: `PHASE-08C`, `PHASE-08D`, and `PHASE-10D`

Findings: `SRE-002`, `SRE-008`, and `SEC-010`; bounded inputs from
`SRE-001`, `SRE-003`, `SRE-004`, `SRE-005`, and transaction-integrity
evidence

Decision dependency: `DR-014`

## Identity, authority, and authorization

**Planning driver:** Project Owner / backend planning driver.

**Product and technical delegation:** On 4 August 2026 UTC (5 August 2026
Asia/Jakarta), Yanuar/Owner delegated to Faiz the accountable Product Owner
and Technical/Release Owner responsibility for Commerce Transaction 1A through
30 August 2026. The delegation covers G7-B sandbox and implementation-scope
accountability, including product input for customer-visible service
objectives. It does not authorize provider activation, production credentials,
migration, deployment, production readiness, or go-live.

**Delegated DR-014 authority:** On 4 August 2026 UTC (5 August 2026 Asia/Jakarta), Yanuar/Owner delegated to
Faiz the Ops/SRE accountable role, Security/Data reviewer role, and DR-014
decision-maker responsibility for Commerce Transaction 1A through 30 August
2026. No backup owner exists; the single-person ownership risk is accepted.
Product input is covered by the delegated Product Owner and DR-014
decision-maker roles. On 4 August 2026 UTC (5 August 2026
Asia/Jakarta), Faiz approved the complete Feature 7.3 candidate baseline
without amendment after PR `#135` merged, including telemetry, SLO, capacity,
threshold, retention/access, responder, and evidence values. The
approved worker values are 15-second maximum operation, 5-second
acknowledgement, 40-second margin, 60-second lease, 30-second renewal,
concurrency 1, claim-ahead 0, and 30-second drain.
The approved values are recorded in `DEC-OBS-001` and the decision package.
The separate source gate for the exact source/test scope is recorded below;
operational execution remains separately gated.

**Historical planning and Git delivery authorization:** The Project Owner
authorized continuation of Feature 7.3 planning and documentation-only Git
delivery on 2 August 2026. On 3 August 2026, the Project Owner separately
authorized PR reconciliation and merge for that planning packet. Those earlier
authorizations did not approve source implementation, provider selection,
deployment, production readiness, or go-live. The later explicit source gate
authorizes only the exact source/test paths recorded in this card; publication
of this implementation remains a separate Git gate.

Read authority in this order:

1. `AGENTS.md`.
2. `docs/NIUVA_MASTER_SPEC.md`, including privacy, operational-integrity, and
   failure-isolation boundaries.
3. `docs/context/DOCUMENT_REGISTER.md` and
   `docs/decisions/DECISION_REGISTER.md`.
4. `docs/decisions/access/DEC-AUTH-009-authentication-security-event-governance.md`
   and `DEC-AUTH-011-authentication-security-event-implementation.md`.
5. `docs/decisions/product/DEC-DATA-003-notification-schema-retention-and-delivery-boundary.md`.
6. `docs/implementation/production-readiness/DECISIONS_REQUIRED.md`, especially
   `DR-012` and `DR-014`.
7. `docs/implementation/production-readiness/TEAM_ASSIGNMENT.md`, especially
   `PHASE-07B`, `PHASE-08B`, `PHASE-08C`, and `PHASE-10D`.
8. Current source and tests; production-readiness audit layers are context only
   and must be revalidated before implementation.

## Objective

Prepare one provider-neutral Operations/SRE decision package for:

- redacted structured backend logging;
- application and dependency metrics;
- operational alert events and their routing boundary;
- request and dependency timeout visibility;
- worker backlog, lease, and exhaustion visibility; and
- transaction lifecycle and capability diagnostics.

The package must define safe schemas, cardinality constraints, ownership,
objective formulas, approval fields, later source acceptance tests, and stop
conditions. The approved values are bounded to sandbox validation and do not
create a production SLA or 24/7 on-call commitment.

## Current-source baseline

The selected baseline has partial observability controls, not a complete
production telemetry system:

- `backend/server.py` configures plain-text Python logging.
- HTTP middleware generates or validates an `X-Request-ID`, measures elapsed
  milliseconds, returns the request ID, and writes request completion/failure
  messages. It currently logs the concrete request path rather than a bounded
  route template.
- `backend/transaction_observability.py` emits allowlisted transaction events
  and fields through `LogRecord.extra` with safe operation names, correlation
  IDs, outcomes, retry modes, and error classes.
- readiness exposes a safe transaction capability diagnostic and current
  in-process worker status.
- notification batches emit aggregate claimed/delivered/failed values, while
  durable backlog age, exhausted count, stale leases, and lease-loss metrics
  are not exposed.
- authentication security events have a distinct approved redacted store and
  provider-neutral alert-outbox foundation. They are not a generic
  observability log or general alert sink.
- no application metrics exporter, tracing exporter, production dashboard,
  telemetry retention/access policy, or general alert destination is selected
  in the repository.

## Dependency on Feature 7.2

PR `#107` merged as `fe1d8a0` and records the Project Owner-approved
worker-topology planning direction. Faiz's delegated DR-014 authority and the
complete Feature 7.3 baseline are now recorded in `DEC-OBS-001`; source
implementation and environment evidence remain unauthorized.

This task may define provider-neutral worker signal names and decision fields.
It must not copy the approved planning contract into source before the
separate implementation gate, or treat sandbox values as production evidence.

## In scope

- Documentation-only telemetry schema, privacy/cardinality rules, metric and
  alert inventories, SLI formulas, ownership fields, and source-test outline.
- Current logging, request-context, transaction, readiness, worker, alert, and
  timeout source inventory.
- Explicit separation among operational telemetry, domain audit records,
  authentication security events, recipient notifications, and provider
  payloads.
- Provider-neutral destination/export options and a recommended decision
  sequence.
- Later implementation acceptance scenarios, including negative privacy and
  high-cardinality tests.

## Out of scope

- Any backend, frontend, test, dependency, lockfile, configuration, metric
  endpoint, exporter, dashboard, alert rule, collector, or provider change.
- Selecting or activating Prometheus, Grafana, OpenTelemetry, Sentry, PostHog,
  a cloud-native monitor, an email/chat destination, or any other provider.
- Adding credentials, telemetry URLs, production routes, public metric
  endpoints, retention configuration, or alert delivery.
- Inventing KPI/SLO numbers, capacity limits, incident owners, on-call
  rotations, or escalation destinations beyond the approved sandbox baseline.
- Reusing application logs as audit records or authentication security-event
  storage.
- Logging request/response bodies, query strings, raw paths containing
  identifiers, contact data, credentials, tokens, cookies, headers, provider
  payloads, database connection details, or raw exception bodies.
- Source implementation, migration, deployment, production readiness, release,
  PR merge, or go-live.

## Expected changed files

- `docs/implementation/production-readiness/phases/FEATURE-7.3-backend-observability-task-card.md`
- `docs/implementation/production-readiness/phases/FEATURE-7.3-backend-observability-decision-package.md`
- `docs/implementation/production-readiness/phases/README.md`
- `docs/decisions/architecture/DEC-OBS-001-commerce-transaction-sandbox-observability-contract.md`
- `docs/decisions/DECISION_REGISTER.md`
- `docs/context/DOCUMENT_REGISTER.md`

The phase evidence index was reconciled after PR #107 merged, preserving
Feature 7.2 and recording the approved Feature 7.3 baseline. The source gate
was subsequently approved explicitly for the exact scope below; this task card
now records the prepared source/test evidence without converting it into
production evidence.

Before the explicit source gate, this planning packet intentionally left all
source, test, dependency, configuration, migration, runbook, CI, and deployment
files unchanged. The approved implementation scope and its evidence are
recorded below.

## Approved source-implementation scope

On 5 August 2026 (Asia/Jakarta; 4 August 2026 UTC), Faiz approved this exact
scope after Feature 7.2 was implemented and tested. It was applied serially on
a freshly fetched `origin/main`; it does not select a provider or create a
public metric endpoint.

### Source paths

- `backend/observability.py` *(new)* — closed event envelope, finite label and
  bucket registries, provider-neutral metric port, bounded JSON Lines emission,
  buffering/drop rules, and `telemetry_pipeline_degraded` behavior.
- `backend/transaction_observability.py` — preserve the existing safe
  transaction sink while adapting it to the approved common observability
  contract.
- `backend/transaction_execution.py` — expose only bounded transaction timing
  and lifecycle signals; preserve transaction-unknown ambiguity and never
  replay the business callback.
- `backend/server.py` — wire HTTP, dependency, readiness, transaction, and
  accepted worker/scheduler signals with route templates and finite labels.
- `backend/notification_worker.py` and `backend/worker_runtime.py` — add only
  the approved aggregate worker/scheduler signals after Feature 7.2 behavior
  is accepted.

### Test paths

- `backend/tests/test_observability.py` *(new)*
- `backend/tests/test_transaction_observability.py`
- `backend/tests/test_transaction_guard.py`
- `backend/tests/test_health.py`
- `backend/tests/test_notification_feed.py`
- `backend/tests/test_worker_runtime.py`

No `emailer.py`, provider adapter, migration, dependency manifest, deployment
configuration, frontend, or public telemetry endpoint is included. The source
gate remains separate from sandbox evidence, provider activation, production
credentials, migration, deployment, production readiness, and go-live.

## Implementation evidence (prepared for Git; not committed)

Worktree: `C:\tmp\niuva-dr014-backend-next-20260805`

Branch: `codex/dr014-backend-next-20260805`
Baseline: `origin/main` `e2a79690a09a1002f8d0b98ab5ee608e99691735`

Implemented in the approved source scope:

- closed redacted JSON Lines envelopes to local stdout/stderr, finite metric
  registries and histogram buckets, bounded buffering/drop behavior, and
  non-recursive `telemetry_pipeline_degraded` signaling;
- transaction lifecycle timing/unknown-commit signals, route-template HTTP
  signals, readiness/dependency signals, and aggregate worker/scheduler
  signals; and
- negative tests for prohibited values, unsafe request IDs/routes, finite
  labels/cardinality, exporter failure, transaction ambiguity, and optional
  telemetry isolation.

Verification at this worktree: `941 passed, 15 skipped, 14 subtests passed`
using serial repository tests (`-n 0`); Python compilation passed for 160
backend files and `git diff --check` passed. No provider, endpoint, credential,
migration, deployment, or production target was used.

## Planning acceptance criteria

The planning packet is ready for review only when it:

- specifies a strict structured-event envelope and event-specific allowlists;
- distinguishes a valid request ID from user identity and prohibits unsafe
  correlation sources;
- uses route templates and bounded enums rather than raw paths, URLs, free-text
  errors, or unbounded labels;
- inventories request, dependency, worker, transaction, and readiness signals
  with metric types and cardinality controls;
- separates event production from exporter/destination selection;
- defines timeout visibility without exposing dependency endpoints or raw
  failures;
- makes worker signals conditional on the approved Feature 7.2 contract;
- preserves `UnknownTransactionCommitResult` ambiguity and never suggests
  replaying the business callback;
- provides approved sandbox SLI formulas, objectives, thresholds, and error
  budgets without converting them into production SLA claims;
- names approved retention, access, dashboard, alert, response, capacity, and
  evidence ownership for the sandbox boundary;
- includes privacy, spoofing, cardinality, dependency-failure, and exporter-
  outage negative cases; and
- makes no implementation, provider, production, or finding-resolution claim;
- records explicit approval evidence in `DEC-OBS-001` while keeping source
  implementation separately gated.

## Stop conditions

Stop before source implementation if:

- the separate source-implementation authorization on a fresh baseline is
  absent;
- a proposed source change exceeds the approved provider-neutral sandbox
  boundary or requires a new provider, destination, credential, or route;
- metric names, units, labels, cardinality bounds, or SLI formulas remain
  ambiguous relative to `DEC-OBS-001`;
- alerts have no threshold, deduplication, destination, responder, or response
  objective;
- the implementation would add a provider SDK or public metric route without
  separate approval;
- worker signals conflict with the accepted Feature 7.2 topology or approved
  Feature 7.3 baseline;
- authentication-event, audit, notification, and telemetry stores are being
  conflated;
- an exporter outage could block required business writes despite the approved
  failure contract; or
- raw sensitive or unbounded values are proposed as logs, labels, events, or
  alert payloads.

## Verification and handoff

- Confirm branch/worktree baseline and clean scoped status.
- Recheck all named authority and current-source anchors.
- Check documentation references and `git diff --check`.
- Report changed and intentionally unchanged paths.
- Record PR state and CI separately from decision approval and implementation
  readiness.

**Historical commit / push / PR authorization:** granted for the
documentation-only planning packet. **Historical PR reconciliation and merge
authorization:** granted by the Project Owner on 3 August 2026.
**Current source-implementation Git publication authorization:** pending.
**Provider activation, production credentials, migration, deployment,
production readiness, and go-live authorization:** not granted.
