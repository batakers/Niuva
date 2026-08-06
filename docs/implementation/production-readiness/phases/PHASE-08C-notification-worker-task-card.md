# PHASE-08C — Notification Worker Fault-Hardening Task Card

Status: **bounded source complete — PR #104 merged as `9ded3e8`; staging
remains blocked**
Selected dependency: `146c945831864857dff8c9448deafad96e346f2d`
(PR #103 merged, canonical notification schema)

Reconciliation baseline: `146c945831864857dff8c9448deafad96e346f2d`
(`origin/main`, checked 3 August 2026, Asia/Jakarta)
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
- No change to the already merged source scope of PR #102 or #103 beyond
  preserving PR #103's deterministic canonical-notification storage identity.

## Authority and dependencies

- `DEC-DATA-003` governs the provider-neutral outbox, bounded retry, exhausted
  state, retention, and privacy boundary.
- `DR-014` remains open for topology, capacity, telemetry, service objectives,
  and production/staging-like operations.
- User authorization on 2 August 2026 permits this bounded implementation,
  commit, push, and stacked PR. On 3 August 2026, the Project Owner separately
  authorized the recommended reconciliation and merge sequence. Neither
  authorization permits excluded actions.
- PR #102 and PR #103 are merged; this PR is retargeted to `main`.

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
- Reconciliation notification/report/Admin/inventory/password matrix:
  **200 passed**; Black and Python compile checks passed for changed source.
- Commit, push, PR reconciliation, and merge only if all local and current-head
  CI gates pass.

## Remaining risks

- End-to-end provider idempotency is not proven without a separately approved
  provider and controlled environment.
- Embedded-per-web-process versus dedicated-worker topology remains unresolved.
- Staging-like fault, shutdown, capacity, alert, and telemetry evidence remains
  blocked by DR-014 and environment authorization.
- A malformed outbox row with no usable identity is left leased to expire rather
  than mutated by an unsafe guess; poison-entry alert/repair ownership remains an
  operational decision under DR-014.
