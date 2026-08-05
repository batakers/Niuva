# Task Card — Feature 7.3 Backend Observability

Status: **Planning / candidate observability contract and sandbox baseline prepared; high-level DR-014 direction and bounded worker values approved; explicit approval pending — source implementation not authorized**

Original planning date: 2 August 2026 (Asia/Jakarta)

Reconciliation date: 3 August 2026 (Asia/Jakarta)

Branch: `plan/backend-observability`

PR: `#108` merged as `b336198`; worksheet reconciliation PR `#133` merged as
`5dd6112`; CI passed; reconciliation is complete and
Faiz's DR-014 decision authority, high-level direction, and bounded worker
values are recorded, while source implementation remains `decision_blocked`.

Worktree: contributor-local isolated worktree for `plan/backend-observability`

Baseline: `a2b7be0d445cf3a338d91cf74841e3bf8be11a91`
(`origin/main`, fetched 2 August 2026)

Reconciliation baseline: `fe1d8a0274ae106f9ca400570d53a44bc23e149a`
(`origin/main`, merged 3 August 2026 after PR #107). The current proposal
baseline is `0b699fea676d285a749f7bf41765b542238c3def` (`origin/main`, fetched
4 August 2026 UTC (5 August 2026 Asia/Jakarta)).

Related roadmap task: `PHASE-08B`; `TASK-08B-01`; `TASK-08B-02`

Related downstream tasks: `PHASE-08C`, `PHASE-08D`, and `PHASE-10D`

Findings: `SRE-002`, `SRE-008`, and `SEC-010`; bounded inputs from
`SRE-001`, `SRE-003`, `SRE-004`, `SRE-005`, and transaction-integrity
evidence

Decision dependency: `DR-014`

## Identity, authority, and authorization

**Planning driver:** Project Owner / backend planning driver.

**Delegated DR-014 authority:** On 4 August 2026 UTC (5 August 2026 Asia/Jakarta), Yanuar/Owner delegated to
Faiz the Ops/SRE accountable role, Security/Data reviewer role, and DR-014
decision-maker responsibility for Commerce Transaction 1A through 30 August
2026. No backup owner exists; the single-person ownership risk is accepted.
Product input for customer-visible service objectives is covered by the
delegated DR-014 decision-maker role. The concrete telemetry, SLO, capacity,
threshold, and retention/access values remain pending approval. This revision
adds a bounded candidate baseline and explicit approval worksheet for those
areas; it does not convert a proposal into an approval. On 4 August 2026 UTC (5 August 2026 Asia/Jakarta), Faiz
approved JSON Lines to stdout/stderr and no external telemetry provider at
high level; exporter and numerical observability values remain pending. The
approved worker values are 15-second maximum operation, 5-second
acknowledgement, 40-second margin, 60-second lease, 30-second renewal,
concurrency 1, claim-ahead 0, and 30-second drain.
The concrete candidate values are recorded in the decision package's
"Recommended sandbox baseline" section and remain approval-gated.

**Planning and Git delivery authorization:** The Project Owner explicitly
authorized continuation of Feature 7.3 planning and authorized commit, push,
and pull-request creation on 2 August 2026. On 3 August 2026, the Project Owner
separately authorized PR reconciliation and merge. Neither authorization
approves the proposed observability decisions, source implementation, provider
selection, deployment, production readiness, or go-live.

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
conditions. Any proposed provider-neutral destination, threshold, SLO, or
response value must remain explicitly candidate until approved and must not
create an on-call commitment.

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
worker-topology planning direction. Faiz's delegated DR-014 authority,
high-level Option B direction, and bounded lease/worker values are now
recorded; telemetry/SLO, capacity, destination, and remaining decision values
remain pending under DR-014, and source implementation remains unauthorized.

This task may define provider-neutral worker signal names and decision fields.
It must not treat the still-pending Operations/SRE contract as final, copy the
planning proposal into source, or finalize worker thresholds before the
required decisions are accepted.

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
  rotations, or escalation destinations.
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

The phase evidence index is reconciled after PR #107 merged, preserving Feature
7.2 and adding Feature 7.3 without importing any source implementation.

All source, test, dependency, configuration, decision-register, canonical,
migration, runbook, CI, and deployment files remain intentionally unchanged.

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
- provides SLI formulas and a clearly labeled candidate numerical baseline while
  keeping approval status visibly pending;
- names retention, access, dashboard, alert, response, capacity, and evidence
  owners as required approval fields;
- includes privacy, spoofing, cardinality, dependency-failure, and exporter-
  outage negative cases; and
- makes no implementation, provider, production, or finding-resolution claim;
- separates candidate contract text from the explicit approval evidence needed
  to leave `decision_blocked`.

## Stop conditions

Stop before source implementation if:

- the delegated Operations/SRE/Security decision authority or accountable
  ownership evidence is absent;
- the telemetry destination/exposure model and retention/access boundary are
  unresolved;
- metric names, units, labels, cardinality bounds, or SLI formulas remain
  ambiguous;
- alerts have no threshold, deduplication, destination, responder, or response
  objective;
- the implementation would add a provider SDK or public metric route without
  separate approval;
- worker signals conflict with the accepted Feature 7.2 topology;
- authentication-event, audit, notification, and telemetry stores are being
  conflated;
- an exporter outage could block required business writes without an approved
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

**Commit / push / PR authorization:** granted for this documentation-only
planning packet. **PR reconciliation and merge authorization:** granted by the
Project Owner on 3 August 2026. **Source implementation, provider activation,
deployment, production readiness, and go-live authorization:** not granted.
