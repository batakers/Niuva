# PHASE-08C — Notification Worker Fault-Hardening Task Card

Status: **bounded local implementation authorized — staging remains blocked**
Selected dependency: `e3f202a13848e274119d59e3247fba0288a8c39b`
(PR #103, canonical notification schema)
Branch / worktree: `fix/backend-notification-worker` /
`Niuva-worktrees/backend-notification-worker`

## Objective

Harden and prove the existing provider-neutral outbox worker against concurrent
claim, lease loss, bounded retry, backoff, cancellation, crash-window replay,
and unsafe error evidence without selecting a new topology or operating policy.

## In scope

- Preserve the existing atomic `find_one_and_update` claim and 60-second lease.
- Preserve five bounded attempts and the existing capped exponential backoff.
- Fail closed for malformed claim/result inputs and invalid outbox state.
- Prove stale-token rejection, expired-lease reclaim, exhausted-state finality,
  and one-winner concurrent claims.
- Prove replay reuses the same per-entry delivery idempotency key after a crash
  or cancellation window.
- Ensure provider exception text and payload details do not enter logs or
  persisted `last_error` metadata.
- Prove cancellation propagates and leaves the entry reclaimable after lease
  expiry.

## Explicit exclusions

- No worker topology, scheduler, queue, provider, retry-count, retry-timing,
  jitter, batch-size, lease-duration, shutdown-grace, SLO, SLA, capacity,
  telemetry destination, alert destination, or on-call decision.
- No claim of exactly-once external delivery; the boundary remains at-least-once
  with a stable provider idempotency key per outbox entry.
- No change to whether notification recurrence creates another email outbox
  entry; that requires separate Product/Operations approval.
- No migration, backfill, cleanup, index/TTL change, historical mutation,
  provider activation, deployment, or shared/staging/production execution.
- No merge of dependency PR #102 or #103.

## Authority and dependencies

- `DEC-DATA-003` governs the provider-neutral outbox, bounded retry, exhausted
  state, retention, and privacy boundary.
- `DR-014` remains open for topology, capacity, telemetry, service objectives,
  and production/staging-like operations.
- User authorization on 2 August 2026 permits this bounded implementation,
  commit, push, and stacked PR. It does not permit merge or excluded actions.
- PR #102 and then PR #103 remain merge-order dependencies.

## Acceptance criteria

1. Two workers cannot hold the same valid lease concurrently.
2. A stale lease token cannot record a result; an expired lease is reclaimable.
3. Attempts never exceed five, retry timing follows the existing capped
   exponential function, and `exhausted` is terminal.
4. A provider call is considered successful only on explicit `True`.
5. Provider exception messages are neither logged nor persisted; only a bounded
   safe error code is retained.
6. Cancellation and the post-provider/pre-state-write crash window leave an
   entry leased until expiry, then replay with the identical idempotency key.
7. No staging, provider, migration, topology, or operational policy action is
   introduced.

## Verification and delivery gate

- Focused notification feed/worker suite: **55 passed**.
- Full backend suite: **697 passed, 14 skipped, 14 subtests passed**.
- Compile, Black, isort, worker mypy, dependency integrity/audit, and
  `git diff --check`: **passed**.
- Final diff and privacy/concurrency review found and closed malformed
  idempotency-key forwarding and expired-lease result acceptance.
- Commit, push, and stacked PR only if all local gates pass. Do not merge.

## Remaining risks

- End-to-end provider idempotency is not proven without a separately approved
  provider and controlled environment.
- Embedded-per-web-process versus dedicated-worker topology remains unresolved.
- Staging-like fault, shutdown, capacity, alert, and telemetry evidence remains
  blocked by DR-014 and environment authorization.
