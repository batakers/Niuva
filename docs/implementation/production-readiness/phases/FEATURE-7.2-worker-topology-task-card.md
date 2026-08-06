# Task Card — Feature 7.2 Worker Topology

Status: **Source-gate implementation prepared; sandbox evidence and all production gates remain separate**

Date: 2 August 2026 (Asia/Jakarta)

Reconciled: 5 August 2026 (Asia/Jakarta; 4 August 2026 UTC), against
`origin/main` `e2a7969` after PR `#136` merged `DEC-OBS-001`.

Branch: `plan/backend-worker-topology`

PR: `#107` merged as `fe1d8a0`; CI passed. The later `DEC-OBS-001` decision
recorded in PR `#136` resolves the bounded Feature 7.3 observability inputs
consumed by this worker packet. The exact source scope is authorized below;
sandbox evidence and Git publication remain separately gated.

Worktree: `/Users/macintoshhd/NIUVA/Niuva-worktrees/backend-worker-topology`

Baseline: `a2b7be0d445cf3a338d91cf74841e3bf8be11a91`
(`origin/main`, fetched 2 August 2026)

Reconciliation baseline: `e2a79690a09a1002f8d0b98ab5ee608e99691735`
(`origin/main`, merged 5 August 2026 through PR `#136`). This reconciliation
imports no source behavior; it aligns the worker planning record with the
approved sandbox observability contract.

Related roadmap task: `PHASE-08C`; `TASK-08C-01`; `TASK-08C-02`

Findings: `SRE-003`, `SRE-004`, `SRE-005`, `BE-009`, and `INT-008`

Decision dependency: `DR-014`

## Identity and ownership

**Planning driver:** Project Owner / backend planning driver.

**Project Owner approval:** On 2 August 2026, the Project Owner explicitly
approved the recommended package recorded in
`FEATURE-7.2-worker-topology-decision-package.md` section 10. This approves the
planning direction only and does not fill pending numerical fields or authorize
source implementation.

**Delegated DR-014 authority:** On 5 August 2026 (Asia/Jakarta; 4 August 2026 UTC), Yanuar/Owner delegated to
Faiz the Ops/SRE accountable role, Security/Data reviewer role, and DR-014
decision-maker responsibility for Commerce Transaction 1A through 30 August
2026. No backup owner exists; the single-person ownership risk is accepted.
This resolves role attribution and the bounded topology/lease/worker values.
`DEC-OBS-001` now also approves the Feature 7.3 sandbox observability inputs
consumed by this packet: closed redaction and access rules, local JSON Lines,
finite metrics and capacity budgets, exporter-failure behavior, worker SLI/SLO
and alert thresholds, responder, and evidence custody. Those values are
approved only for the stated local/test/sandbox scope. The exact source-gate
authorization for the worker implementation is recorded below.

The remaining Feature 7.2-specific fields are platform termination grace,
claimed-but-not-started disposition, API/worker required-versus-optional
classification and outbound-delivery release requirement, named scheduler
service/run evidence details, schedule/catch-up policy, and implementation
evidence for fencing, idempotency/replay, capacity, and bounded shutdown. On
5 August 2026 (Asia/Jakarta; 4 August 2026 UTC), Faiz approved Option B, no
external queue/scheduler provider, at-least-once delivery, bounded shutdown,
15-second maximum operation, 5-second acknowledgement, 40-second margin,
60-second lease, 30-second renewal, concurrency 1, claim-ahead 0, and a
30-second worker drain.

**Existing bounded owner:** `DEC-DATA-003` names Faiz as the temporary owner
for general-notification backlog and delivery-exhaustion alerts. The 5 August
delegation additionally covers the broader DR-014 scope above; it does not
authorize provider activation, production credentials, migration, deployment,
or go-live.

## Objective

Prepare one reviewable Operations/SRE decision package for:

- co-located versus separate worker topology;
- lease duration and renewal/fencing rules;
- multi-instance claim, replay, and capacity behavior;
- graceful shutdown and crash recovery;
- required versus optional dependency semantics; and
- scheduler ownership for periodic jobs.

The package must make the later source implementation testable without
silently selecting a provider, deployment platform, telemetry destination,
production SLA, or go-live policy.

## Authority and reading order

1. `AGENTS.md`.
2. `docs/NIUVA_MASTER_SPEC.md`, especially the shared notification foundation
   and the rule that notification failure must not roll back a committed core
   transaction.
3. `docs/context/DOCUMENT_REGISTER.md` and
   `docs/decisions/DECISION_REGISTER.md`.
4. `docs/decisions/product/DEC-DATA-003-notification-schema-retention-and-delivery-boundary.md`.
5. `docs/implementation/production-readiness/DECISIONS_REQUIRED.md`, especially
   `DR-012` and `DR-014`.
6. `docs/implementation/production-readiness/TEAM_ASSIGNMENT.md`, especially
   `PHASE-08A`, `PHASE-08B`, and `PHASE-08C`.
7. Current source and tests, followed by audit findings as historical context.

## Current-source baseline

The selected baseline already contains useful implementation evidence, but it
does not answer the production topology decision:

- `backend/notification_service.py` atomically claims outbox entries with a
  worker ID, unique lease token, and a hard-coded default 60-second lease;
- `backend/notification_worker.py` processes claimed entries sequentially;
- `backend/server.py` can start the notification worker inside every enabled
  API process and reports its in-process task heartbeat through API readiness;
- `backend/server.py` starts reservation expiry in every API process without a
  scheduler-ownership lease; and
- shutdown cancels the in-process loops and awaits cancellation, but does not
  define stop-claiming, bounded drain, or unstarted-claim disposition.

The source currently claims up to 50 entries before sequential delivery. A
later entry can therefore consume most or all of its lease while waiting for
earlier entries. The decision package must prohibit interpreting the existing
hard-coded 60-second value or batch size as production evidence; the approved
60-second value is a bounded decision input and still requires implementation
and verification before any production claim.

The separate `fix/backend-notification-worker` branch exists and is ahead of
this baseline. It is not silently incorporated into this plan. Any later
implementation must reconcile its exact diff and review state against the
then-current `origin/main`.

## In scope

- Documentation-only decision inputs, options, recommendation, consequences,
  acceptance gates, stop conditions, and approval fields.
- Notification delivery-consumer topology.
- A common ownership model for reservation expiry, notification retention,
  authentication-event cleanup, and other periodic jobs without combining
  their data or policy domains.
- Provider-neutral timing and idempotency requirements.
- Readiness separation between API processes, delivery workers, and scheduled
  jobs.
- Reconciliation of worker observability, SLO, capacity, alert, retention/access,
  and evidence references to the approved `DEC-OBS-001` sandbox contract.
- A bounded post-approval implementation and verification outline.

## Out of scope

- Backend, frontend, test, dependency, environment, deployment, container,
  process-manager, CI, migration, or database changes.
- Starting, stopping, or reconfiguring any shared/staging/production process.
- Selecting or activating an email, queue, scheduler, telemetry, or alert
  provider, or adding credentials.
- Approving an SLA, SLO, on-call rotation, capacity threshold, or production
  alert destination on behalf of Operations/SRE.
- Migration, historical rewrite/backfill/deletion, retention execution,
  provider delivery, production readiness, release, or go-live.
- Changing `DEC-DATA-003`, authentication-event governance, recipient scope,
  or the rule that email delivery is optional and best effort.

## Expected changed files

- `docs/implementation/production-readiness/phases/FEATURE-7.2-worker-topology-task-card.md`
- `docs/implementation/production-readiness/phases/FEATURE-7.2-worker-topology-decision-package.md`
- `docs/implementation/production-readiness/phases/README.md`
- `docs/implementation/production-readiness/TEAM_ASSIGNMENT.md`

Before the explicit source gate, this planning packet intentionally left all
source, test, configuration, migration, decision-register, canonical, and
runbook files unchanged. The approved implementation scope and its evidence
are recorded below.

## Approved source-implementation scope

On 5 August 2026 (Asia/Jakarta; 4 August 2026 UTC), Faiz approved this exact
source scope after the `DEC-OBS-001` source gate was explicitly granted. The
implementation was applied serially on a fresh `origin/main` worktree before
the dependent Feature 7.3 instrumentation. `backend/server.py` and the worker
runtime paths remained serial ownership, not parallel edit paths.

### Source paths

- `backend/notification_service.py` — just-in-time single-item claim,
  validated 60-second lease configuration, renewal/release fencing, reclaim,
  and stale-owner behavior.
- `backend/notification_worker.py` — concurrency 1, bounded operation handling,
  stop-claiming/drain state, and aggregate worker outcomes.
- `backend/server.py` — explicit API-versus-worker runtime mode, development/
  test co-location only, independent readiness, scheduler startup boundaries,
  and bounded shutdown wiring.
- `backend/worker_runtime.py` *(new)* — separate worker entrypoint and named
  periodic-job lease coordination without an external queue/scheduler provider.

### Test paths

- `backend/tests/test_notification_feed.py`
- `backend/tests/test_health.py`
- `backend/tests/test_inventory_service.py`
- `backend/tests/test_worker_runtime.py` *(new)*

No other source, test, dependency, configuration, migration, provider, or
deployment path is authorized by this scope. The 30-second drain, lease
invariant, at-least-once replay, scheduler ownership, and required/optional
dependency fields must remain within their approved or explicitly pending
boundaries.

## Implementation evidence (prepared for Git; not committed)

Worktree: `C:\tmp\niuva-dr014-backend-next-20260805`

Branch: `codex/dr014-backend-next-20260805`
Baseline: `origin/main` `e2a79690a09a1002f8d0b98ab5ee608e99691735`

Implemented in the approved source scope:

- just-in-time one-item notification claims, validated timing configuration,
  renewal/release fencing, timeout/ack bounds, at-least-once replay, and safe
  stop-claiming/drain behavior;
- explicit API/worker/development/test runtime modes, separate worker runtime
  construction, named reservation-expiry lease coordination, and API readiness
  independence from an optional separately managed worker; and
- focused tests for stale owners, lease reclaim, timeout, concurrency,
  shutdown, scheduler ownership, and readiness boundaries.

Verification at this worktree: `941 passed, 15 skipped, 14 subtests passed`
using the repository suite in serial mode (`-n 0`) because the available
Python 3.14 environment could not start the configured xdist workers. Python
compilation passed for 160 backend files and `git diff --check` passed.

This is source/test evidence only. Platform termination grace, claimed-work
disposition policy, provider idempotency validation, environment evidence,
provider activation, production credentials, migration, deployment,
production readiness, release, and go-live remain separate gates.

## Acceptance criteria for planning

The planning packet is ready for Operations/SRE review only when it:

- clearly separates a continuously polling delivery consumer from periodic
  scheduled jobs;
- states the delivery guarantee as at-least-once and covers the
  send-succeeded/ack-failed replay window;
- relates lease duration to bounded operation time rather than copying a
  current constant;
- prevents long pre-claimed sequential batches from outliving their leases;
- defines atomic claim, lease-token fencing, renewal/reclaim, and stale-owner
  behavior;
- defines stop-claiming, bounded drain, forced-termination, and restart
  behavior;
- preserves in-app notifications as required product state and outbound email
  as optional delivery;
- records pending owners, objectives, thresholds, evidence location, and
  approval fields without inventing them, while linking approved sandbox values
  to `DEC-OBS-001`;
- gives testable multi-instance, crash, shutdown, backlog, and dependency-loss
  acceptance scenarios; and
- retains explicit source, provider, migration, deployment, production, and
  go-live gates.

## Stop conditions

Stop before source implementation if any of the following remains unresolved:

- The approved topology or bounded shutdown contract is changed, or the
  topology-specific scheduler, dependency, termination, or claimed-work fields
  remain ambiguous.
- Maximum provider-operation time and process termination grace cannot support
  the selected lease invariant.
- The deployment platform cannot run or probe a separate worker process.
- Provider idempotency behavior is unknown but the design is being described
  as exactly once.
- Required/optional dependency semantics conflict with `DEC-DATA-003`.
- The source plan cannot consume the approved `DEC-OBS-001` redaction,
  alert, retention/access, or evidence boundary without inventing a provider,
  destination, or production objective.
- A schema/index change is discovered without an approved migration plan.

## Minimum verification and handoff

- Confirm the task branch is based on the fetched `origin/main` SHA above.
- Check every authority and current-source anchor named by the package.
- Run Markdown reference checks where available and `git diff --check`.
- Report changed and intentionally unchanged paths and all pending approvals.

**Commit / push / PR authorization:** explicitly granted by the Project Owner
on 2 August 2026 for this planning packet only. On 3 August 2026, the Project
Owner separately authorized PR reconciliation and merge. Source implementation,
deployment, and production actions remain unauthorized and require separate
explicit instructions plus the applicable approvals.
