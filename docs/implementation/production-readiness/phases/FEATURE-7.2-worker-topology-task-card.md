# Task Card — Feature 7.2 Worker Topology

Status: **Project Owner approved recommendation / Operations-SRE decision-blocked — source implementation not authorized**

Date: 2 August 2026 (Asia/Jakarta)

Branch: `plan/backend-worker-topology`

Worktree: `/Users/macintoshhd/NIUVA/Niuva-worktrees/backend-worker-topology`

Baseline: `a2b7be0d445cf3a338d91cf74841e3bf8be11a91`
(`origin/main`, fetched 2 August 2026)

Related roadmap task: `PHASE-08C`; `TASK-08C-01`; `TASK-08C-02`

Findings: `SRE-003`, `SRE-004`, `SRE-005`, `BE-009`, and `INT-008`

Decision dependency: `DR-014`

## Identity and ownership

**Planning driver:** Project Owner / backend planning driver.

**Project Owner approval:** On 2 August 2026, the Project Owner explicitly
approved the recommended package recorded in
`FEATURE-7.2-worker-topology-decision-package.md` section 10. This approves the
planning direction only. It does not identify the Project Owner as an
Operations/SRE or Security approver, fill pending numerical/ownership fields,
or authorize source implementation.

**Required decision approvers:** Operations/SRE and Security owners. The
accountable people, review date, and approval evidence are pending.

**Existing bounded owner:** `DEC-DATA-003` names Faiz as the temporary owner
for general-notification backlog and delivery-exhaustion alerts only. That
assignment does not make Faiz the approved scheduler, telemetry, SLA, on-call,
or topology owner.

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
60-second value or batch size as approved production policy.

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

All source, test, configuration, migration, decision-register, canonical, and
runbook files remain intentionally unchanged.

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
  approval fields without inventing them;
- gives testable multi-instance, crash, shutdown, backlog, and dependency-loss
  acceptance scenarios; and
- retains explicit source, provider, migration, deployment, production, and
  go-live gates.

## Stop conditions

Stop before source implementation if any of the following remains unresolved:

- Operations/SRE has not approved topology, scheduler ownership, and shutdown
  behavior.
- Maximum provider-operation time and process termination grace cannot support
  the selected lease invariant.
- The deployment platform cannot run or probe a separate worker process.
- Provider idempotency behavior is unknown but the design is being described
  as exactly once.
- Required/optional dependency semantics conflict with `DEC-DATA-003`.
- Alert/backlog ownership, review evidence, or incident handoff has no
  accountable owner.
- A schema/index change is discovered without an approved migration plan.

## Minimum verification and handoff

- Confirm the task branch is based on the fetched `origin/main` SHA above.
- Check every authority and current-source anchor named by the package.
- Run Markdown reference checks where available and `git diff --check`.
- Report changed and intentionally unchanged paths and all pending approvals.

**Commit / push / PR authorization:** explicitly granted by the Project Owner
on 2 August 2026 for this planning packet only. Source implementation, PR
merge, deployment, and production actions remain unauthorized and require
separate explicit instructions plus the applicable approvals.
