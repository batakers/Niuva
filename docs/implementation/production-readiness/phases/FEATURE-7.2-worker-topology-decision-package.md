# Feature 7.2 — Worker Topology Decision Package

Status: **Recommended package approved by Project Owner — Operations/SRE decision required before source implementation**

Date: 2 August 2026 (Asia/Jakarta)

Branch: `plan/backend-worker-topology`

PR: `#107` (open; reconciliation review complete)

Baseline: `a2b7be0d445cf3a338d91cf74841e3bf8be11a91`
(`origin/main`, fetched 2 August 2026)

Reconciliation baseline: `aff3d1177b2be1288b0682ae376eadd1c8029816`
(`origin/main`, merged 3 August 2026). This changes no decision or source gate.

Decision dependency: `DR-014`

Related authority: `DEC-DATA-003`

Related roadmap task: `PHASE-08C`; `TASK-08C-01`; `TASK-08C-02`

## 1. Purpose and decision boundary

This packet asks Operations/SRE to select a worker and scheduler operating
contract. It is a proposal, not an approved ADR and not source authorization.

The contract covers two different workload classes:

1. **Delivery consumers:** continuously poll due `notification_outbox` work.
   Multiple consumers may compete safely for individual leases.
2. **Periodic jobs:** reservation expiry, notification retention,
   authentication-event cleanup, and similar scheduled maintenance. Multiple
   processes may be able to run the code, but only one logical execution may
   own a named schedule at a time.

These workload classes may share runtime primitives, but must not share data,
retention policy, permissions, alert payloads, or business ownership merely
because both run in the background.

`DEC-DATA-003` already decides that recipient-scoped in-app notification state
is required while email delivery is optional and best effort. It also requires
bounded retries, visible exhaustion, and failure isolation from a successfully
committed core transaction. This packet does not reopen those decisions.

## 2. Current baseline and verified design gaps

### 2.1 Existing notification behavior

- Each outbox entry has `pending`, `processing`, `delivered`, or `exhausted`
  state, attempt count, next-attempt time, lease owner/token/expiry, and stable
  delivery key.
- A MongoDB `find_one_and_update` atomically claims one due entry at a time.
- Expired processing entries may be reclaimed.
- Delivery result updates require the matching lease token.
- Retry is bounded and an exhausted entry remains visible.
- The application can enable an in-process polling loop using environment
  flags and can make that in-process task part of API readiness.

### 2.2 Gaps the topology decision must resolve

- The worker claims a batch before processing it sequentially. Lease time is
  already running for entries waiting behind earlier deliveries.
- Lease duration is a code default, not an approved relationship between
  provider timeout, acknowledgement time, clock skew, and termination grace.
- A process can successfully call the provider and terminate before recording
  success. Reclaiming the lease can replay delivery.
- API readiness observes an in-process task, so it cannot truthfully represent
  a separately deployed worker.
- Reservation expiry starts in each API process and has no named scheduler
  owner lease.
- Cancellation is awaited, but graceful drain and claimed-work disposition are
  not specified.
- Backlog age, exhausted volume, stale lease count, repeated lease loss, and
  scheduler-run evidence have no approved thresholds or destination.

## 3. Decision 1 — Co-located or separate worker

### Option A — Co-located in every API instance

Every API process starts delivery and periodic background loops.

#### Option A benefits

- smallest development and deployment shape;
- no separate process command or worker probe; and
- current source is closest to this topology.

#### Option A costs and risks

- API scaling also changes background concurrency;
- deploys and API restarts interrupt all background work;
- periodic jobs run once per API process unless independently leased;
- API and worker readiness, resources, and failure domains remain coupled; and
- request latency can compete with background delivery and cleanup.

### Option B — Separate production worker, co-located development mode

Staging/production runs a separately managed worker process from the same
reviewed application artifact. Local/test may use an explicitly non-production
co-located mode for convenience. API processes enqueue durable work but do not
start delivery or periodic job loops.

#### Option B benefits

- API replicas and worker replicas scale independently;
- worker health, shutdown, resource limits, and incident response are explicit;
- API deploys do not inherently multiply scheduler execution; and
- one artifact can preserve code/version consistency without requiring a new
  queue or scheduler provider.

#### Option B costs and risks

- requires a supported worker entry point, process supervision, separate
  readiness, and deployment evidence;
- local and production modes must not drift semantically; and
- operational cost is higher than one process type.

### Option C — External managed queue/scheduler

Move claim/scheduling responsibilities to an external queue or scheduler.

This may provide strong operational tooling, but it selects a new provider,
credential, failure boundary, cost model, and migration path. No current
decision authorizes that selection.

### Recommendation for approval

Select **Option B**:

- separate worker process in staging/production;
- co-located mode permitted only in development/test and clearly reported as
  non-production topology;
- same immutable application artifact for API and worker initially; and
- no external queue/scheduler provider in Feature 7.2.

**Approval field:** `Pending Operations/SRE decision`

## 4. Decision 2 — Lease duration, fencing, and batch behavior

### Required invariant

For an individual claimed item:

```text
lease_duration >= max_bounded_operation_time + result_ack_budget + clock_margin
```

The maximum bounded operation time includes all provider connection/read
timeouts and bounded internal work. A provider call without a hard timeout
cannot satisfy this invariant.

### Recommended lease and batch contract

- Lease duration is validated configuration, not an unreviewed hard-coded
  policy.
- A consumer claims only work it can start within the lease-start budget.
  Prefer claim-one/process-one, or bounded concurrency where each item is
  claimed immediately before its execution slot.
- Do not pre-claim a long sequential batch.
- Every claim receives a unique lease token. Result acknowledgement, lease
  renewal, and voluntary release require the same token as a fencing value.
- A stale owner may not acknowledge, renew, or release a lease after ownership
  changes.
- Expired work may be reclaimed atomically.
- If an approved operation can run close to the lease limit, renew before half
  the lease elapses. Renewal must fail when the fencing token no longer owns
  the entry, and the stale worker must not record a result.
- Use UTC-aware timestamps and record the approved clock-synchronization or
  database-time assumption. Clock skew must be included in the margin.

### Candidate initial values — not approved policy

If later provider-neutral delivery enforces a maximum 15-second delivery call
and a 5-second result-acknowledgement budget, a 60-second lease leaves a
40-second margin. These values are review inputs only. Operations/SRE must
approve the final timeout, lease, margin, and renewal threshold together.

### Lease approval fields

| Field | Approved value |
| --- | --- |
| Maximum delivery operation time | Pending |
| Result acknowledgement budget | Pending |
| Clock/network margin | Pending |
| Lease duration | Pending |
| Renewal threshold | Pending |
| Maximum active concurrency per worker | Pending |
| Maximum claim-ahead count | Pending; recommendation `0` |

## 5. Decision 3 — Multi-instance and delivery guarantee

### Recommended multi-instance contract

- Zero, one, or multiple delivery-worker replicas may run.
- MongoDB atomic claim plus lease-token fencing prevents two healthy workers
  from concurrently owning the same entry.
- Delivery semantics are **at least once**, not exactly once.
- A process may terminate after the provider accepts a request but before the
  outbox records `delivered`. After lease expiry, another worker may replay it.
- The stable delivery key must be passed to every provider adapter that
  supports idempotency. Provider idempotency behavior and retention window
  must be verified before provider activation.
- If an adapter cannot provide idempotency, Operations/Product must explicitly
  accept possible duplicate external delivery. Source must not claim otherwise.
- Replaying an outbox entry never repeats the core business transaction and
  never mutates recipient-facing notification state as a new occurrence.
- Backoff and exhaustion remain bounded. `exhausted` requires owned operational
  visibility but does not roll back committed business state.
- Worker IDs identify a process instance for evidence and debugging, but lease
  tokens—not worker IDs—are the ownership authority.

### Multi-instance acceptance scenarios

- Two workers race for one entry; one valid lease is returned.
- A stale worker tries to acknowledge after lease reclaim; it receives a
  controlled lease-lost outcome and cannot overwrite the new owner.
- A worker terminates before provider invocation; work becomes reclaimable.
- A worker terminates after provider success but before acknowledgement; replay
  uses the same delivery key and the observed guarantee remains at least once.
- Multiple workers drain a backlog without starvation, duplicate healthy
  ownership, or unbounded database load.

**Approval field:** `Pending Operations/SRE decision`

## 6. Decision 4 — Shutdown and crash behavior

### Recommended graceful-shutdown sequence

1. Receive the platform termination signal.
2. Mark the process draining and stop polling/claiming new work.
3. Allow already-started items to finish within a configured drain deadline.
4. Persist results only while the process still owns each fencing token.
5. Voluntarily release claimed-but-not-started entries when safe; otherwise
   leave them to expire. Never reset another worker's lease.
6. Cancel polling and heartbeat tasks, close database/provider clients, and
   exit before the platform hard-kill deadline.

The process must not claim a large batch and then pretend all entries can be
drained. Shutdown grace must be compatible with the maximum operation time and
lease duration.

### Crash behavior

- No in-memory state is required to make a claimed item recoverable.
- A crashed owner is recovered through lease expiry and atomic reclaim.
- Startup does not blindly clear processing entries.
- Operators may inspect aggregate stale/backlog counts but must not receive
  recipient addresses, payloads, or raw provider errors in alerts.

### Shutdown approval fields

| Field | Approved value |
| --- | --- |
| Platform termination grace | Pending |
| Worker drain deadline | Pending |
| Claimed-not-started disposition | Pending; recommendation fenced release |
| Forced-termination evidence owner | Pending |

## 7. Decision 5 — Required versus optional dependency

### Existing authority

- Recipient-scoped in-app notification state is required product behavior.
- Email delivery is optional and best effort.
- Delivery failure does not roll back a successfully committed core
  transaction.

### Recommended readiness contract

- API readiness requires the database/schema/transaction capabilities already
  required for the API's active behavior. It does not fail merely because an
  optional, separately deployed email worker is absent.
- A separate worker process has its own liveness and readiness. Worker
  readiness requires database access, required indexes/schema, valid timing
  configuration, and any adapter capability explicitly enabled for that
  worker.
- Worker unavailability degrades delivery and accumulates durable backlog; it
  does not make stored in-app notifications unavailable.
- Backlog age and exhaustion trigger owned operational signals independently
  of API readiness.
- An environment may make outbound delivery a release requirement only through
  a later explicit service objective and deployment decision. Enabling a
  `required` flag alone is not that approval.
- A configured required adapter fails the worker's readiness closed when its
  safe configuration/capability is unavailable. It must not silently fall back
  to another channel or inline request delivery.

### Dependency approval fields

| Field | Approved value |
| --- | --- |
| API dependency classification | Pending; recommendation worker optional |
| Worker-service dependency classification | Pending |
| Backlog-age degradation threshold | Pending |
| Outbound-delivery release requirement | Pending / separate decision |

## 8. Decision 6 — Scheduler ownership

### Recommended scheduler ownership contract

- Periodic jobs do not start automatically in every API process in
  staging/production.
- A separate worker runtime hosts scheduled-job runners, but each job has a
  distinct named lease and policy.
- Multiple scheduler-capable worker replicas may exist for availability, while
  one valid fenced lease owns a named logical run.
- A job lease records only safe operational fields: job name, opaque run ID,
  owner instance, fencing token, scheduled/start/heartbeat/finish times,
  status, and aggregate result counts.
- Lease loss stops further job mutation unless the underlying domain operation
  is independently idempotent and its approved contract explicitly permits
  completion.
- Reservation expiry keeps deterministic operation identities and transaction
  fail-closed behavior. A scheduler lease is coordination, not a substitute
  for domain idempotency or transactions.
- Notification retention and authentication-event cleanup keep their separate
  retention rules, evidence, access, and owners.
- Missed runs are not executed concurrently without an approved catch-up
  policy. Backlog is drained in bounded batches.

### Ownership fields

| Field | Approved value |
| --- | --- |
| Scheduler service owner | Pending |
| Reservation-expiry run owner | Pending |
| General-notification retention owner | Pending |
| Authentication-event cleanup owner | Pending under its own decision |
| Schedule/catch-up policy owner | Pending |
| Run-evidence reviewer and location | Pending |

## 9. Decision 7 — Operational objectives and alerts

DR-014 also requires measurable objectives and ownership. Approving topology
without these inputs would leave the worker operationally incomplete.

### Minimum safe, aggregate signals

- worker process heartbeat/readiness;
- oldest due pending-entry age;
- pending and processing counts;
- stale/expired processing lease count;
- delivery attempts by safe outcome/reason code;
- delivery latency buckets without recipient or payload data;
- exhausted-entry count and age;
- lease-lost and renewal-failure counts;
- scheduled-run success/failure/duration and missed-run count; and
- bounded batch/backlog-drain results.

Alerts must exclude recipient addresses, customer identifiers, message
payloads, provider payloads, credentials, tokens, and raw exception bodies.

### Required Operations/SRE inputs

| Field | Approved value |
| --- | --- |
| Telemetry destination | Pending |
| Retention and access | Pending |
| Backlog/exhaustion alert destination | Pending |
| Alert responder and backup | Pending |
| Response objective | Pending |
| Delivery/backlog SLI and objective | Pending |
| Capacity model and scaling trigger | Pending |
| Error budget / accepted degradation | Pending |

Faiz remains the temporary general-notification backlog/exhaustion alert owner
under `DEC-DATA-003`. This does not fill the pending destination, SLA, backup,
on-call, capacity, or scheduler fields.

## 10. Recommended package for Operations/SRE approval

Approve or amend the following package as one coherent contract:

1. Separate worker process for staging/production; co-located only for
   development/test.
2. Same immutable artifact for API and worker initially; no new external
   queue/scheduler provider.
3. Per-item just-in-time claim with unique fencing token; no long sequential
   pre-claimed batch.
4. Lease duration derived from bounded operation time, acknowledgement budget,
   and margin; optional fenced renewal for work approaching the threshold.
5. Horizontally scalable consumers with explicit at-least-once semantics and a
   stable provider idempotency key.
6. Stop-claiming and bounded drain on shutdown; lease-expiry recovery after
   crash.
7. API availability independent of optional outbound delivery; separate
   worker health and backlog degradation.
8. Named, fenced scheduler leases for periodic jobs, with distinct domain
   policies and owners.
9. Aggregate, redacted operational signals with approved objectives,
   thresholds, responders, and evidence custody.

## 11. Post-approval implementation outline

Only after the approval record and separate source authorization exist:

1. Rebase the implementation task on freshly fetched `origin/main` and
   reconcile any still-open notification worker/readiness branches.
2. Extract a supported worker entry point from API lifecycle wiring while
   retaining explicit local/test co-location.
3. Introduce validated provider-neutral timing, concurrency, drain, and
   polling configuration without adding credentials or selecting providers.
4. Change claim behavior to just-in-time per active execution slot and retain
   fencing on every state transition.
5. Add safe lease renewal/release only if the approved timing contract
   requires it.
6. Give API and worker processes truthful independent health contracts.
7. Move periodic job startup out of production API instances and add named
   scheduler-run leases without weakening domain transactions/idempotency.
8. Add deterministic unit/integration tests for multi-instance races, stale
   owners, timeout, crash windows, shutdown drain, backlog recovery, dependency
   loss, and redacted signals.
9. Run real MongoDB multi-process evidence in an approved disposable
   environment before any production-readiness claim.

Potential source areas are `backend/notification_service.py`,
`backend/notification_worker.py`, `backend/server.py`, a bounded worker entry
point/configuration module, scheduler coordination, and focused tests. This
list is planning context, not permission to edit those files now.

## 12. Verification gates for later implementation

The later implementation is not complete until evidence demonstrates:

- two or more real worker processes cannot hold one valid lease concurrently;
- stale fencing tokens cannot acknowledge, renew, or release another owner's
  work;
- a provider timeout finishes before lease/drain limits;
- crash-before-send and crash-after-send-before-ack recover according to the
  stated at-least-once contract;
- shutdown stops claims, drains bounded active work, and closes resources;
- backlog recovery is bounded and does not starve newly due work;
- API readiness and worker readiness remain truthful and independent;
- each scheduled job has one logical run across multiple capable instances;
- transaction-required domain work still fails closed when transaction
  capability is unavailable;
- logs, health payloads, metrics, and alerts contain no prohibited data; and
- no provider, migration, deployment, production, or go-live claim exceeds its
  separate approval and evidence.

## 13. Approval record

No choice below is approved by the existence of this file or branch.

On 2 August 2026, the Project Owner explicitly approved the recommended
package in section 10. The approval establishes the preferred planning
direction: separate staging/production worker, just-in-time fenced claims,
at-least-once delivery, bounded drain, independent API/worker readiness, named
scheduler leases, and redacted owned operational signals. It does not fill the
pending timing, threshold, capacity, destination, or accountable-owner values;
does not identify the Project Owner as an Operations/SRE or Security approver;
and does not authorize source implementation.

| Approval | Owner | Value / evidence | Date |
| --- | --- | --- | --- |
| Recommended package direction | Project Owner | Approved section 10 as the preferred planning direction; bounded as stated above | 2 August 2026 |
| Worker topology | Operations/SRE | Pending | Pending |
| Lease/timing contract | Operations/SRE | Pending | Pending |
| Multi-instance/replay contract | Operations/SRE + Security | Pending | Pending |
| Shutdown contract | Operations/SRE | Pending | Pending |
| Required/optional dependency policy | Operations/SRE + Product | Pending | Pending |
| Scheduler ownership | Operations/SRE | Pending | Pending |
| Telemetry/SLO/alert/capacity inputs | Operations/SRE + Security | Pending | Pending |
| Separate source implementation authorization | Project Owner | Pending | Pending |

Until the remaining fields have attributable approval evidence, Feature 7.2
remains `decision_blocked` and source implementation must not begin.
