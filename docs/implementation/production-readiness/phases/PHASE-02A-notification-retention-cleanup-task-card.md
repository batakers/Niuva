# PHASE-02A — Notification Retention Cleanup Task Card

Status: **PR #105 bounded source candidate validated — execution blocked**
Selected dependencies: PR #103 (`146c945`, canonical notification schema) and
PR #104 (`9ded3e8`, notification worker)
Reconciliation baseline: `9ded3e8fb84f2897dad706f5787c38592ee5f28d`
from `origin/main` on 3 August 2026
Branch / worktree: `feat/backend-notification-retention` /
`C:\tmp\niuva-pr105-review`

## Objective

Implement an application-managed, aggregate-reporting retention boundary for
canonical general notifications and their terminal delivery outbox metadata,
without migrating, backfilling, scheduling, or deleting real data.

## Authority

- `DEC-DATA-003` fixes notification retention at 180 days and terminal
  `delivered`/`exhausted` outbox retention at 30 days.
- The Project Owner approved the recommended Feature 6.4 package on 2 August
  2026 for source and tests only.
- The Project Owner authorized the current bounded Git reconciliation and merge
  sequence on 3 August 2026; that authorization does not include cleanup
  execution or a database target.
- Faiz is the temporary cleanup approver/operator for a future separately
  authorized execution. Every execution still requires explicit per-run target,
  backup/restore, and cleanup approval.

## In scope

- Mark newly created outbox entries with an explicit canonical schema version.
- Restrict newly written schema-v1 outbox entries to the supported `email`
  channel and allowlisted string payload fields.
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
- Require one transaction-capable guard and use its session for the complete
  cross-collection selection, validation, and deletion batch.
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
6. Apply fails before reading or writing unless every safety confirmation, the
   isolated target boundary, and a transaction-capable guard are supplied.
7. Concurrent changes are protected by exact per-record compare-and-delete
   selectors; partial batches are safely repeatable.

## Verification and delivery gate

- Focused retention and notification feed tests: **79 passed**.
- Notification schema/feed/retention/admin/inventory/reset integration suite:
  **224 passed**.
- Full backend suite: **847 passed, 15 skipped, 14 subtests passed**.
- Black, isort with the Black profile, focused mypy with imports skipped,
  compileall, dependency integrity, targeted Markdown lint, and
  `git diff --check`: **passed**.
- Final privacy, schema-v1, transaction, deletion-query, and history-exclusion
  review closed truthful partial/exclusion dispositions and strict canonical
  field-set handling.
- Current-head CI must pass before the authorized exact-head merge.

## Remaining risks

- No real-data distribution, query-plan, backup/restore, or deletion evidence
  exists under this authorization.
- The current safe target label/scope is a caller-supplied declaration, not
  database-identity proof. No data-bearing adapter or invocation is authorized.
- A supporting index and migration may be required before any data-bearing run.
- Cleanup cadence and scheduler topology remain unresolved under `DR-014`.
- Expired notifications with retained/nonterminal outbox links are deliberately
  withheld and require aggregate operational review.
