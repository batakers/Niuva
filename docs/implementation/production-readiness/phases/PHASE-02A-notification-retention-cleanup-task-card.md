# PHASE-02A — Notification Retention Cleanup Task Card

Status: **bounded source and test implementation authorized — execution blocked**
Selected dependency: `e3f202a13848e274119d59e3247fba0288a8c39b`
(PR #103, canonical notification schema)
Branch / worktree: `feat/backend-notification-retention` /
`Niuva-worktrees/backend-notification-retention`

## Objective

Implement an application-managed, aggregate-reporting retention boundary for
canonical general notifications and their terminal delivery outbox metadata,
without migrating, backfilling, scheduling, or deleting real data.

## Authority

- `DEC-DATA-003` fixes notification retention at 180 days and terminal
  `delivered`/`exhausted` outbox retention at 30 days.
- The Project Owner approved the recommended Feature 6.4 package on 2 August
  2026 for source and tests only.
- Faiz is the temporary cleanup approver/operator for a future separately
  authorized execution. Every execution still requires explicit per-run target,
  backup/restore, and cleanup approval.

## In scope

- Mark newly created outbox entries with an explicit canonical schema version.
- Select only validated canonical v1 notifications whose exact 180-day expiry
  has elapsed.
- Select only validated canonical v1 terminal outbox entries whose terminal
  update is at least 30 days old.
- Exclude versionless, legacy, future-version, malformed, nonterminal, and
  still-linked notification records.
- Return aggregate-only dry-run and apply reports without identifiers,
  recipients, payloads, content, or exception text.
- Require an isolated target plus explicit cleanup, restore-tested backup, and
  owner confirmations before the reusable cleanup function can mutate.
- Keep dry-run as the default and provide no scheduled/runtime mutation path.

## Explicit exclusions

- No migration file/state marker, index, TTL, backfill, historical rewrite, or
  cleanup execution. The outbox schema-version field applies only to new writes.
- No shared, staging, production, or otherwise data-bearing target access.
- No scheduler, worker integration, cron, deployment, provider, telemetry,
  alert destination, SLA, on-call, or production-readiness claim.
- No change to PR #104 or the notification worker branch.
- No assumption that versionless or shape-compatible history is canonical.

## Acceptance criteria

1. Dry-run performs no deletes and exposes aggregate counts only.
2. Notification eligibility requires canonical schema v1 validation and exact
   expiry; terminal outbox eligibility requires canonical v1 and valid state.
3. Historical/versionless/future/malformed records are never deleted.
4. Pending/processing outbox records are never deleted.
5. A notification with any remaining linked outbox entry is not deleted.
6. Apply fails before reading or writing unless every safety confirmation and
   isolated target boundary is satisfied.
7. Concurrent changes are protected by exact per-record compare-and-delete
   selectors; partial batches are safely repeatable.

## Verification and delivery gate

- Focused retention and notification feed tests: **59 passed**.
- Full backend suite: **701 passed, 14 skipped, 14 subtests passed**.
- Compile, Black, isort, retention mypy, dependency integrity/audit, and
  `git diff --check`: **passed**.
- Final privacy, deletion-query, and history-exclusion review closed truthful
  partial/exclusion dispositions and strict canonical field-set handling.
- Commit, push, and stacked PR only if every local gate passes. Do not merge.

## Remaining risks

- No real-data distribution, query-plan, backup/restore, or deletion evidence
  exists under this authorization.
- A supporting index and migration may be required before any data-bearing run.
- Cleanup cadence and scheduler topology remain unresolved under `DR-014`.
- Expired notifications with retained/nonterminal outbox links are deliberately
  withheld and require aggregate operational review.
