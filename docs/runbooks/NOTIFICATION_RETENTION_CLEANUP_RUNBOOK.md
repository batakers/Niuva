# Notification Retention Cleanup Runbook

Status: **source/test procedure only — cleanup execution is not authorized**
Owner boundary: Faiz is the temporary cleanup approver/operator under the
explicit Feature 6.4 approval recorded on 2 August 2026.

## Purpose

This runbook describes the guarded application cleanup contract for canonical
general notifications and terminal notification outbox metadata. It does not
authorize a database connection, migration, index application, scheduler,
deployment, or deletion run.

The approved policy is:

- canonical general notifications expire after 180 days;
- canonical terminal `delivered` and `exhausted` outbox metadata expires 30
  days after its terminal update; and
- versionless, legacy, future-version, malformed, and ambiguous records remain
  excluded.

## Current permitted activity

- Review `backend/notification_retention.py` and its synthetic tests.
- Run the focused or full local test suites without a database target.
- Review aggregate report fields and stop conditions.

There is intentionally no CLI, runtime hook, scheduler, or deployment setting
for cleanup in this feature. Do not construct an ad-hoc database invocation.
The current safe target label and scope are caller declarations, not verified
database-identity evidence, so they cannot authorize a data-bearing run.

## Future execution prerequisites

Every data-bearing execution requires a separate approval packet containing:

1. the exact isolated/shared/staging/production target and data classification;
2. an approved migration/index decision and current schema-report result;
3. a verified encrypted backup and successful restore rehearsal;
4. explicit cleanup confirmation from the Data/Operations owner;
5. explicit owner approval from Faiz or a formally recorded successor;
6. batch size, maintenance window, query-plan evidence, and rollback owner; and
7. aggregate-only evidence storage and review instructions.

The current implementation refuses non-isolated targets even when confirmation
flags are present. Shared, staging, or production enablement requires a reviewed
source change after the prerequisites above are approved.

## Dry-run contract

Dry-run is the default. Its report contains policy days, disposition, and only
aggregate selected/eligible/excluded/conflict/deleted/truncated counts. It must
not contain document identifiers, recipients, notification content, payloads,
delivery keys, or exception text.

Stop when the disposition is any of:

- `blocked_unsafe_target`: target scope or label is not accepted;
- `blocked_ambiguity`: a version-marked candidate fails canonical validation;
- `partial_batch`: more candidates exist than the bounded report batch; or
- `ready_with_exclusions`: an expired notification still has an outbox link.

These dispositions are evidence for review, not permission to bypass a guard.

An apply run that passes its preconditions returns `applied`,
`applied_with_exclusions`, `applied_partial_batch`, or
`applied_with_conflicts`. A malformed marked candidate returns
`blocked_ambiguity` before deletion. An unsafe target or missing confirmation
or transaction guard raises before any read and does not return a disposition.
Stop and preserve aggregate evidence when the disposition is
`applied_with_conflicts`; do not continue to another batch without review.

## Apply contract for synthetic/isolated verification

The reusable function requires all of the following before any read:

- `target_scope="isolated"` with a bounded safe target label;
- explicit cleanup confirmation;
- restore-tested backup confirmation;
- explicit owner approval; and
- a transaction-capable guard.

It runs the complete cross-collection selection, validation, and deletion batch
in one transaction session. Terminal outbox entries are deleted first, then
notifications without any remaining outbox link. Deletes use the database
`_id` plus immutable/version/timestamp fields as compare-and-delete selectors.
A changed row is retained and counted as a conflict. Batches are repeatable and
partial completion is reported truthfully.

## Rollback and incident boundary

Deletion has no application-level undo. Recovery requires the separately
approved restore artifact and owner-controlled restore procedure. If any
deleted count, conflict count, candidate distribution, or linked exclusion is
unexpected, stop; preserve aggregate evidence; do not rerun, backfill, edit a
record, or widen a query without a new review and approval.
