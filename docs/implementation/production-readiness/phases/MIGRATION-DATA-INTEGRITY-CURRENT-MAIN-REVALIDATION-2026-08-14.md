# Database, Migration, and Data Integrity Current-Main Revalidation

<!-- markdownlint-disable MD013 -->

Status: **repository audit complete; every data-bearing execution remains blocked**

Audited runtime baseline: `origin/main` at
`15b759a02b036330f1dd0913611043e0fd6134e2`.

Audit branch base: `audit/backend-auth-security-current-main` at `f9c4921`.
The stacked base changes audit documentation and an authorization regression
test only; Migration 001–010 and the reconciliation implementations are byte-
identical to the audited runtime baseline.

## 1. Outcome

All ten numbered migration sources and their current tests were revalidated.
No migration, database dry-run, apply, rollback, cleanup, restore, account
change, or representative-data report was executed. The repository has useful
source controls, but it is **not safe to run Migration 001–010 as one ordered
production migration set**.

The current disposition is:

- Migration 001, 004, and 005 remain hard stops because their source-level
  partial-failure or authority contracts are unsafe.
- Migration 002 still needs bounded/checkpointed partial-failure recovery;
  Migration 003 is a rehearsal candidate only after a named isolated target,
  full backup/restore proof, owner, reviewer, and window exist.
- Migration 006 has strong fail-closed mapping and transaction tests, including
  optimistic rollback protection, but has never been applied to reviewed real
  accounts and has no authorization to do so.
- Migration 007 has an atomic data/ledger transaction, but creates indexes
  outside it without compensation, has no executable rollback, and does not
  use the shared mutation flag/capability guard. It is not a rehearsal
  candidate until those source gaps are resolved.
- Migration 008 and 009 have the strongest apply/second-run/rollback contracts
  and real disposable-replica-set tests. They still lack representative-data,
  backup-custody, restore, and approved-target evidence.
- Migration 010 is intentionally dry-run-only from its CLI and refuses apply
  when its dedicated collections contain history. It has no historical
  backfill and no real replica-set migration test.
- Quote-line and notification aggregate reports are implemented and synthetic-
  tested, but neither has run against an approved representative snapshot.
  Legacy Order and file history have projection/security tests but no bounded
  historical reconciliation report or executed inventory.

Layer 04 therefore remains at **58% readiness**. Confidence in the current
repository disposition rises to **96%**, while confidence in production data,
topology, backup custody, and restore readiness remains **0%**.

## 2. Authority and safety boundary

This audit applies these controlling rules:

- `ADR-001`: transaction-required mutations fail closed; a feature flag never
  substitutes for replica-set/session capability.
- `DEC-DATA-002`: ambiguous historical Quote-line identity is never inferred or
  automatically backfilled; reviewed mapping plus backup/dry-run/validation/
  rollback is required.
- `DEC-ACCESS-003`: retained legacy Orders remain read-only and are not
  automatically rewritten, deleted, or sunset.
- Identity, recovery, session, Quote-line, notification-schema, and retention
  runbooks: real/shared/staging/production execution requires a separately
  approved target, owner, reviewer, evidence custody, and recovery path.
- The bounded PHASE-02C disposable backup/restore proof does not authorize a
  migration or representative-data rehearsal.

Historical records are the default preservation boundary. A migration-owned
field or index may be reversed only by its documented guarded rollback.
Retention deletion is a separate operation and is not migration execution.

## 3. Migration 001–010 matrix

| Migration | Dry-run and rerun | Partial failure and transaction boundary | Rollback, marker, and index ownership | Historical preservation | Current disposition |
| --- | --- | --- | --- | --- | --- |
| 001 Identity/RBAC | Default dry-run is read-only; a rerun skips users that now have `roles`, but there is no completion marker. | Per-user writes occur before index creation with no transaction, backup gate, or failure checkpoint. Unknown legacy roles are inferred as `retail_customer`. | No rollback. No migration marker. Shared indexes use implicit/default names and are not migration-owned. | Documents are not deleted, but authority can be incorrectly inferred and a partial user population can remain changed. | **Do not apply.** Retain DB-006 open. |
| 002 Catalog/material/inventory | Collision/index preflight and successful second-run no-op are synthetic-tested. The scan has a 100,000-document ceiling. | Per-material writes occur before shared index creation with no transaction/checkpoint; a mid-loop or later index failure leaves a partial apply. | No rollback or marker; restore-only. Indexes are shared declarations, not migration-owned rollback state. | IDs and legacy references are preserved in source, but representative type/reference shapes are unverified. | **Isolated rehearsal only after redesign/approval.** Retain DB-007 open. |
| 003 Identity access policy | Read-only aggregate dry-run and marker-based idempotency are tested. | Each account update plus audit is guarded transactionally, but earlier account transactions can commit before a later account fails; indexes precede account writes. | Constrained migration-field rollback is audited and intentionally restores fail-closed access, not legacy authority. Policy/account markers exist; shared indexes remain. | No account record is deleted and superseded authority is quarantined. | **Approved isolated rehearsal candidate only.** DB-008 remains partial. |
| 004 Content seed | Dry-run is read-only and existing slugs are skipped. | Create and publish are separate service operations; create-success/publish-failure leaves a draft which rerun permanently skips. No dedicated migration test exists. | No marker, rollback, or unique `(content_type, slug)` migration guard. | Existing content is not overwritten or deleted, but incomplete migration-owned drafts cannot be distinguished or repaired. | **Do not apply.** Retain DB-009 open. |
| 005 Archive orphan collections | Dry-run counts source collections. A rerun after rename reports `not_found`, which cannot distinguish success from absence. | Each rename is atomic, but three sequential renames are not; destination collision/dependency/index state is not preflighted. | Only manual reverse-rename instructions; no executable guarded rollback or marker. | Records are renamed rather than deleted, but active organization/membership names can disappear and partial archival can break retained B2B history. | **Do not run.** DB-005/DB-010 remain blocked. |
| 006 Granular role policy | Aggregate/opaque-ID dry-run, reviewed mapping, explicit Owner selection, and second-run no-op are tested. | Account changes and audit events use one fail-closed transaction; transaction size/latency on a real account population is unknown. The field backup is written before the transaction. | Rollback checks migration marker plus expected version and preserves the current Owner. Invitation indexes are retained shared runtime constraints rather than rolled back. | No account is deleted; unmapped/stale authority becomes review-required. | **Source contract strong; real-account execution not authorized.** DB-011 remains partial. |
| 007 Security/publication schema | Dry-run preflights duplicates/history and marker makes rerun a no-op. | Backfill plus ledger are one direct MongoDB transaction, but indexes are created first without compensation. The shared transaction mutation flag/capability guard is not used. | Ledger marker exists; no rollback CLI or migration-owned down procedure. Recovery is full restore. | Portfolio embedded versions are copied to revision/publication collections before transactional removal; legacy date values are retained in migration-owned evidence fields. Representative preservation is unproven. | **Do not rehearse/apply until guard, index compensation, and rollback contract are resolved.** |
| 008 Auth recovery safety | Aggregate dry-run, ambiguity stops, apply, second-run no-op, and rollback are fake- and real-replica-set-tested. | Token changes plus marker are guarded atomically; owned/legacy index replacement is compensated on failure. One transaction covers all tokens. | Redacted migration-owned field backup; owned index names; guarded rollback restores prior fields and transitional index state. | Historical token documents are retained and invalidated; unsafe TTL deletion index is retired. | **Approved isolated representative rehearsal candidate only.** No real target/window/custody exists. |
| 009 Admin session safety | Aggregate dry-run, partial/TTL stops, apply, no-op, rollback, and bounded cleanup are fake- and real-replica-set-tested. | Marker apply/rollback is guarded; index creation is compensated. The separate 90-day cleanup rechecks eligibility in a guarded bounded transaction. | Redacted metadata backup and seven owned indexes; guarded marker rollback. Cleanup has no application undo and requires full restore evidence. | Migration apply does not delete sessions. Cleanup can delete eligible terminal history only under separate explicit confirmations and is not authorized here. | **Migration rehearsal candidate only; cleanup remains separately blocked.** |
| 010 Auth security events | Aggregate dry-run reports counts and no backfill. Library apply is idempotent; CLI intentionally refuses mutation. | Guarded marker transaction plus compensated owned indexes; apply refuses non-empty event/outbox collections. No real-replica-set migration test exists. | Redacted metadata backup; owned named indexes; rollback requires empty dedicated collections and removes only marker/indexes. | Existing dedicated history is never changed or adopted; there is intentionally no historical backfill. | **Source-only foundation; approved isolated runner and real transaction rehearsal still required.** |

## 4. Historical reconciliation matrix

| Historical scope | Implemented repository control | Missing evidence/action | Disposition |
| --- | --- | --- | --- |
| Quote-line | Aggregate-only report rejects missing, duplicate, mismatched, orphaned, and overcommitted identity without exposing row data. | No approved representative snapshot, read-only credential, reviewed mapping, execution window, or captured report. | `environment_blocked`; never infer/backfill. |
| Legacy Order | Retained read-only compatibility and customer/internal allowlists are regression-tested. | No aggregate schema/type/reference inventory, duplicate/orphan classification, retention inventory, or approved representative execution. | `open` for historical reconciliation; do not rewrite/delete. |
| Legacy file | Owner/domain fail-closed and safe download media behavior are regression-tested. | No historical object-to-record reconciliation command, missing/orphan/quarantine aggregate report, storage-provider inventory, or approved representative execution. | `open` for historical reconciliation; preserve metadata and objects. |
| General notification | Strict read-only schema report verifies isolated target identity, exact read-only role, manifest/fingerprint binding, privacy stops, and aggregate-only output. | No approved representative snapshot/manifest/window has been supplied or executed. | `environment_blocked`; report readiness is not migration authority. |
| Notification retention | Source-only bounded cleanup excludes legacy/ambiguous records and requires restore, owner, scope, and transaction confirmations. | No authorized data-bearing invocation, scheduler, backup/restore custody, or deletion evidence. | `blocked_by_decision`; no deletion performed. |
| Authentication events | Migration 010 refuses historical adoption and active writers use dedicated redacted collections. | Historical identity/audit records have no approved reconciliation or migration into the dedicated store. | `open`; preserve existing records and review separately. |

## 5. Verification evidence

Executed locally with Python 3.14.3, `PYTHONPATH=backend`, no database target,
and no transaction-test opt-in:

```text
python -m pytest -n 0 -q \
  backend/tests/test_identity_foundation.py \
  backend/tests/test_catalog_material_inventory_migration.py \
  backend/tests/test_identity_access_migration.py \
  backend/tests/test_granular_role_migration.py \
  backend/tests/test_security_schema_migration.py \
  backend/tests/test_auth_recovery_migration.py \
  backend/tests/test_auth_session_migration.py \
  backend/tests/test_auth_security_event_migration.py \
  backend/tests/test_migration_backup_restore.py \
  backend/tests/test_quote_line_reconciliation_report.py \
  backend/tests/test_notification_schema_report.py \
  backend/tests/test_notification_retention.py \
  backend/tests/test_legacy_order_projection_revalidation.py \
  backend/tests/test_file_security_revalidation.py
```

Result: `229 passed, 5 skipped in 2.39s`.

Expected-skip enforcement was reviewed separately: `46 passed, 5 skipped in
0.09s`. Every skip is an explicit real-replica-set gate for Migration 003,
006, 008, 009, or the backup/restore test. None is counted as a pass. The PR
transaction workflow supplies the disposable replica set for those modules
when a backend path change triggers it; it does not cover a real transaction
for Migration 007 or 010 and does not provide representative historical data.

Static inspection also confirmed:

- no numbered migration apply path deletes historical business or
  authentication records; the only historical-record deletion path is the
  separately confirmed 90-day Admin-session cleanup mode in Migration 009;
- Migration 005 renames rather than deletes records, but remains prohibited
  because rename is a breaking and partially applied historical-data change;
- rollback marker deletions in Migration 008–010 remove only migration-owned
  ledger state, not historical business/authentication records; and
- Migration 007's `$unset` of embedded Portfolio `versions` occurs in the same
  transaction that copies every reviewed version into canonical revision and
  publication collections, but representative preservation is not yet proven.

## 6. Required next gates

1. Do not select one blanket “run 001–010” window. Resolve Migration 001, 004,
   005, and 007 source/authority gaps first.
2. For each eligible migration, approve a distinct named isolated target,
   exact SHA, owner, independent reviewer, window, encrypted backup custody,
   successful isolated restore, and secret-safe evidence location.
3. Execute read-only inventory/dry-run first and stop on duplicates, partial
   marker/index state, unknown types, ambiguous history, or target mismatch.
4. Add real-replica-set migration tests for 007 and 010 before considering
   rehearsal; prove 006 with a reviewed synthetic representative account set
   before any real-account proposal.
5. Run Quote-line and notification reports only after their runbook manifests
   are approved. Build separate aggregate-only legacy Order and file inventory
   tools before asking for data access.
6. Preserve all historical records. Any later retention deletion needs its own
   policy, legal/owner approval, tested restore, bounded batch, conflict report,
   and evidence review.

## 7. Tracker disposition

- `DB-005`, `DB-006`, `DB-007`, `DB-009`, and `DB-010` remain open or blocked.
- `DB-008`, `DB-011`, and `DB-013` remain partial; Migration 006 optimistic
  rollback is now correctly recognized as resolved in source, but execution
  evidence is still absent.
- `DB-012` and `DB-014` remain environment-blocked.
- Canonical unresolved count remains 0 P0 / 9 P1 for Layer 04. This audit adds
  no duplicate canonical finding IDs and does not claim readiness improvement.

Independent Data/Operations review is required before merge acceptance, and a
separate authorization is required before any data-bearing operation.

<!-- markdownlint-enable MD013 -->
