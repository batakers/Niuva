# PHASE-02B — Migration Hardening Plan

Status: **planning packet merged through PR #112 as `a98463a` — execution
remains blocked**

Phase / tasks: `PHASE-02B` / `TASK-02B-01`, `TASK-02B-02`

Task card: [PHASE-02B-task-card.md](PHASE-02B-task-card.md)

Baseline: `a2b7be0d445cf3a338d91cf74841e3bf8be11a91` (`origin/main`,
verified 2 August 2026, Asia/Jakarta)

Reconciliation baseline: `e5376b951735fe793bee877c81a91f84149dd52b`
(`origin/main`, checked 3 August 2026, Asia/Jakarta)

Task branch / worktree: `plan/phase-02b-migration-hardening` /
contributor-local isolated worktree

## Objective

Create the migration-hardening packet for migrations `001` through `009`.
The packet defines per-migration preflight, idempotency, compensation or
rollback floor, evidence, and stop conditions before any isolated rehearsal is
proposed. It does not authorize an apply, rollback, restore, backfill, index
change, or target selection.

## Entry disposition

`PHASE-02A` is present in the selected baseline through merged PR #72. Its
read-only notification report is implementation evidence, not permission to
migrate records.

`PHASE-00C` remains a planning-only preflight: the disposable `rs-test`
replica set and local backup/restore test are useful bounded evidence, but
`DR-012` still lacks an approved target/topology, RPO/RTO, evidence format, and
the remaining operational ownership. Therefore `V-02-02` and every mutation
in this plan remain blocked by decision/environment.

## Authority and traceability

- `docs/NIUVA_MASTER_SPEC.md`, sections 11–13 — immutable commercial history,
  archival instead of hard deletion, transaction-required fail-closed behavior,
  and customer/security boundaries.
- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md` —
  replica-set transactions for cross-collection mutation and no non-atomic
  fallback.
- `docs/decisions/product/DEC-DATA-002-quote-line-identity-and-ambiguous-history.md`
  — ambiguous historical commercial records are preserved and never inferred or
  silently backfilled.
- `docs/decisions/product/DEC-DATA-003-notification-schema-retention-and-delivery-boundary.md`
  — legacy notification data remains unchanged until a separate approved
  transition; ambiguity stops the transition.
- `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md`,
  `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md`, and
  `docs/runbooks/AUTH_RECOVERY_RUNBOOK.md` — applicable procedural gates.
- `docs/implementation/production-readiness/REMEDIATION_PROGRESS.md` —
  `PHASE-00C` stop-condition evidence and current `DR-012` limitation.
- `docs/implementation/production-readiness/FINDING_TRACEABILITY.md` —
  `DB-005` through `DB-012`, `DB-014`, `OPS-005`, `QA-004`, and `GOV-013`.
- `docs/implementation/production-readiness/VERIFICATION_MATRIX.md` —
  `V-00-03` and `V-02-02`.

## Scope and exclusions

Included work is documentation and read-only source/test inventory for
`backend/migrations/001` through `009`, their existing focused tests, and the
applicable runbooks. Migration `009` index/marker migration and its retention
cleanup are inventoried as distinct operations because cleanup deletes bounded
historical session records and requires separate authorization.

Excluded work includes all migration commands, data/index/collection mutation,
backup or restore execution, new mapping files, provider or scheduler work,
environment/configuration changes, credentials, production-readiness claims,
and go-live. Migration `010_auth_security_events.py` already exists on the
baseline but remains outside this 001–009 packet; Feature 1.7 and its recorded
Migration 010 gates remain its separate implementation authority.

## Global execution gate

No migration may leave `dry_run` until all of the following are recorded for
the exact selected SHA and one named **isolated** target:

1. approved target, timezone-aware maintenance window, executor, reviewer,
   rollback owner, restore owner, and evidence-custody location;
2. replica-set and session capability evidence for any transaction-required
   mutation; a failed probe is a fail-closed stop, never a fallback path;
3. credential-free full-backup location/checksum plus a restore result into a
   separate isolated database; any migration-owned backup must be unused and,
   where required by its runbook, confirmed encrypted;
4. aggregate-only dry-run output with no collision, duplicate, mixed marker,
   ambiguous history, incompatible index, or prohibited sensitive output;
5. a reviewed per-migration apply, second-run, validation, compensation or
   rollback, and full-restore procedure; and
6. explicit authorization for that one migration. Approval of this plan is not
   approval to execute any migration.

If any condition is absent, stop before creating an index, backup file,
session, marker, collection, or data mutation. Preserve the aggregate report
and record `blocked_by_decision` or `blocked_by_environment`; do not repair data
manually.

## Migration inventory and hardening matrix

| Migration | Current bounded behavior | Required evidence before any later execution | Execution disposition |
| --- | --- | --- | --- |
| `001_identity_rbac_audit.py` | Legacy role backfill plus indexes; it maps legacy `admin` directly and has no transaction, backup, second-run, or rollback guard. | Reconcile against the current granular-role authority and prove its target collections/indexes are compatible with migrations 003/006. | **Do not execute.** Its historical role mapping cannot be treated as current authority. Separate reconciliation is required; no inferred role mapping. |
| `002_catalog_material_inventory.py` | Read-only dry-run, deterministic SKU planning, collision/index preflight, and in-place material updates. The catalog runbook supplies the procedural backup/restore floor. | Isolated target; approved data/retention owner; zero collision/failure preflight; full restore-tested backup; reference-preservation and second-run evidence. | Blocked pending `DR-012` and the per-target authorization window. No automatic down migration is assumed. |
| `003_identity_access_policy.py` | Guarded per-account transaction, fail-closed classification, policy singleton, audit event, explicit bootstrap Owner, and constrained rollback. | Identity runbook prerequisites, reviewed opaque Owner selection, backup/restore, readiness/capability, safe aggregate dry-run, and second-run evidence. | Blocked pending `DR-012` target/window and the prescribed review. Never elevate through direct database edits. |
| `004_content_blocks_seed.py` | Read-only dry-run or writes through the content service for fixed seed records. | Content-owner approval, collision/overwrite disposition, historical-content preservation check, and a backup/restore/rollback procedure specific to the selected target. | **Do not execute** until a separate content transition scope is approved. This phase does not choose seed content or overwrite policy. |
| `005_archive_orphan_collections.py` | Renames `internships`, `organizations`, and `organization_memberships` to `_archived_*`; it has a dry-run but no target compatibility proof. | Current-source dependency inventory, retention/legal owner decision, restore-tested backup, and explicit proof that no active code, migration, audit, or membership path needs the collection. | **Do not execute.** Current identity runbook and migrations use organization/membership concepts, so absence of a dependency proof is a hard stop. |
| `006_granular_role_policy.py` | Reviewed opaque mapping, transaction guard, migration-owned backup, index creation, idempotent second run, and constrained rollback. | Identity runbook gates, approved reviewed mapping, unused encrypted backup location, transaction readiness, apply/second-run/rollback/restore verification. | Blocked pending `DR-012` and separately authorized mapping/window. Customer/internal role mixing remains fail-closed. |
| `007_security_publication_schema.py` | Read-only plan generation, duplicate preflight, index declarations, ledger marker, and broad schema/publication/file backfill on apply. | Exact selected-scope revalidation, reviewed backup-evidence manifest, zero duplicate/portfolio ambiguity, index compatibility, transaction/compensation proof, and full restore plan. | Blocked. Do not treat its existing backup-evidence argument as a substitute for restore or rollback authority. |
| `008_auth_recovery_safety.py` | Redacted dry-run, transaction guard, encrypted migration-owned backup, controlled index replacement, idempotent marker, and rollback. | Recovery runbook gates, unused encrypted backup, restore test, transaction readiness, recovery traffic drain, safe output review, and failure/second-run validation. | Blocked pending `DR-012`, selected-SHA revalidation, and an approved isolated window. Argon2 writes remain disabled. |
| `009_admin_session_safety.py` | Aggregate-only default dry-run; duplicate, partial-index, marker, index-definition, and prohibited-TTL preflight; transaction guard; encrypted migration-owned index/marker backup; compensated index creation; idempotent marker; and rollback. Its separate cleanup preview/apply path performs bounded 90-day retention deletion. | Session runbook gates, unused encrypted migration backup, full restore-tested backup, traffic drain, transaction readiness, apply/second-run/rollback proof, index/marker validation, and a separately reviewed cleanup eligibility/retention/restore packet. | Blocked pending `DR-012`, selected-SHA revalidation, and an approved isolated window. Planning or migration approval must not authorize `--apply-cleanup`; cleanup needs its own explicit destructive-operation approval. |

## Per-migration control matrix

`Present` below describes a source guard, not permission or successful evidence.
`Required` means the future isolated rehearsal must supply the control before
execution can be proposed.

| Migration | Dry-run | Duplicate / index preflight | Backup | Second-run no-op | Validation | Rollback / compensation | Full restore | Stop condition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `001` | Present by default; aggregate counts only. | Missing before unique-index creation. | No migration-owned backup; restore-tested full backup required. | Data backfill becomes empty, but index rerun and current-policy compatibility are not a complete no-op proof. | Limited fake-database field/index assertions only; current-role, duplicate, partial-failure, and post-apply validation are missing. | None in source. | Required for every unexpected or partial outcome. | Stop on unresolved legacy role mapping, unreviewed 003/006 compatibility, duplicate index keys, absent transaction/backup floor, or any ambiguous account. **Do not execute.** |
| `002` | Present by default; reports planned changes and failures. | Present for deterministic SKU collisions plus declared unique-index duplicate/missing-key checks. | External full backup and restore proof required. | Candidate selection is idempotent; future isolated evidence must also prove stable indexes and references. | Preserve material/order references, legacy timestamps, and aggregate/index consistency; no invented price or stock. | No down migration; application correction is append/controlled where applicable. | Required recovery floor. | Stop on any collision, missing required key, index incompatibility, reference drift, unresolved retention owner, or non-isolated target. |
| `003` | Present by default with safe classification aggregates. | Identity/Owner classification and conditional-update guards exist; database unique-index compatibility still needs target preflight. | No migration-owned full backup; reviewed full backup/restore required. | Current-policy accounts produce no migration plan; prove stable policy singleton and audit counts. | Validate exactly one approved Owner, policy state, audit linkage, account categories, and preserved customer boundary. | Constrained, audited per-account rollback; it never restores deprecated runtime authority. | Required for unexpected state outside constrained rollback. | Stop on missing transaction capability, unreviewed Owner, ambiguous legacy role/marker, conditional conflict, or unsafe output. |
| `004` | Present by default; reports create/publish versus existing skip. | Missing semantic collision and unique-index preflight; an existing slug is skipped without proving content equivalence. | No migration-owned backup; content-specific full backup/restore required. | Existing rows are skipped, but create-success/publish-failure can leave a draft that rerun also skips. | Content owner must validate exact approved copy, publication pointer, audit, and historical-content preservation. | None; no tested compensation for partial create/publish. | Required recovery floor. | Stop on absent content authorization, any existing-key mismatch, partial draft/publication state, missing transaction capability, or overwrite ambiguity. **Do not execute.** |
| `005` | Present by default; reports source counts. | Missing destination-name, dependency, active-reference, and partial-archive preflight. | No migration-owned backup; restore-tested full backup required. | A renamed source appears `not_found`; this is not proof of a safe completed no-op. | Prove zero active source/migration/runtime dependencies and exact source/destination collection state. | Manual reverse rename only; untested and unsafe after partial or destination-conflict state. | Required recovery floor. | Stop on any organization/membership dependency, retention/legal ambiguity, destination collision, partial rename, or absent exclusive window. **Do not execute.** |
| `006` | Present by default with reviewed mapping categories. | Mapping, role, Owner, and duplicate opaque-ID validation exist; unique invitation-index data needs explicit preflight before index creation. | Migration-owned unused backup required; approved encrypted custody plus full restore proof remain required. | `second_run_noop` is explicit when no plans remain. | Validate Owner invariant, mapping coverage, audit linkage, policy version, index compatibility, and no customer/internal role mixing. | Constrained transaction rollback from reviewed backup with concurrent-state checks. | Required for index or state outside constrained rollback. | Stop on disabled transaction guard, unreviewed/mixed mapping, duplicate IDs/index keys, existing backup path, concurrent change, or invalid Owner count. |
| `007` | Present by default with aggregate plans. | Present across declared indexes plus portfolio-history ambiguity and index-definition compatibility. | Reviewed evidence manifest is mandatory for apply; full backup and successful isolated restore remain the actual recovery floor. | Ledger marker returns `already_applied`; verify indexes, ledger, snapshots, and references remain stable. | Validate all planned/backfilled aggregates, immutable publication/history, date conversions, index manifest, and marker/evidence binding. | Transaction aborts data/ledger backfill; compatible indexes created before the transaction may remain. No rollback CLI exists. | Required recovery for committed migration or residual index state. | Stop on duplicates, portfolio ambiguity, incompatible index, invalid/stale backup evidence, missing transaction capability, selected-scope drift, or failed restore proof. |
| `008` | Present by default; redacted aggregate token/index/marker report. | Present for token hashes, active-user uniqueness, field types, owned/legacy index sets, and marker consistency. | Unused migration-owned encrypted backup required, plus full restore-tested backup. | Explicit marker-backed `second_run_noop`. | Validate every historical token marker/invalidation, zero active legacy token, exact non-TTL indexes, safe fresh recovery, and atomic completion. | Guarded rollback restores owned fields and recorded legacy indexes; apply compensates index changes on failure. | Required if scoped rollback cannot reconcile every token/index/marker. | Stop on sensitive output, malformed/duplicate token state, partial/mixed index or marker, existing backup path, recovery traffic, or unavailable transaction guard. |
| `009` | Present by default; cleanup preview is separately read-only. | Present for duplicate access/session hashes, partial/ambiguous owned indexes, exact index definitions, marker consistency, and any TTL index. | Unused migration-owned encrypted index/marker backup required; cleanup additionally requires a restore-tested encrypted full backup. | Apply and rollback report marker-backed no-op state. | Validate exact seven non-TTL indexes, marker state, unique hashes, session behavior, and zero unreviewed cleanup effects. | Apply compensates created indexes; rollback removes owned indexes/marker and recreates indexes if marker removal fails. Cleanup deletion has no per-record rollback. | Required for cleanup and any state outside scoped index/marker rollback. | Stop on duplicates, TTL/partial/incompatible index, marker ambiguity, traffic not drained, missing confirmations/guard, or unapproved cleanup eligibility. `--apply-cleanup` remains separately prohibited. |

## Task breakdown

### TASK-02B-01 — Preflight and execution-boundary packet

**Objective:** turn the global gate and inventory into a migration-specific
preflight record without selecting a target or running a command.

**Acceptance criteria:**

- Every migration `001`–`009` has an explicit `do not execute`,
  `blocked_by_decision`, or later-execution gate.
- Ambiguous historical identity, duplicate/index conflict, sensitive output,
  missing restore proof, and absent capability each stop before mutation.
- Migrations 001, 004, and 005 are recorded as reconciliation/authority gaps,
  not silently reclassified as executable.

**Verification:** review the source inventory against the listed migration files
and verify that the plan does not contain an apply command, credential, target,
or invented mapping.

### TASK-02B-02 — Idempotency, rollback, and evidence matrix

**Objective:** define the evidence that a separately authorized isolated
rehearsal must produce, while preserving differences between compensation,
constrained rollback, and full database restore.

**Acceptance criteria:**

- Every candidate has dry-run, apply, second-run, validation, rollback or
  compensation, restore, owner, and stop-rule entries before it can be proposed
  for execution.
- Existing focused tests are mapped; limited 001 hardening coverage and missing
  004/005 migration coverage are recorded as gaps rather than assumed passing.
- Evidence is aggregate-only and contains no credentials, personal data,
  token/hash values, backup contents, or raw documents.

**Planned verification matrix:**

| Area | Existing focused evidence to rerun later | Required negative proof |
| --- | --- | --- |
| Catalog / `002` | `test_catalog_material_inventory_migration.py` | SKU/index collision blocks every write; references remain unchanged; second run is a no-op. |
| Identity / `003`, `006` | `test_identity_access_migration.py`, `test_granular_role_migration.py` | No transaction fallback, no unreviewed Owner/mapping, no duplicate audit, and rollback stays fail-closed. |
| Publication / `007` | `test_security_schema_migration.py` | Duplicate or portfolio ambiguity blocks before index/backfill/ledger mutation; recovery uses reviewed evidence. |
| Recovery / `008` | `test_auth_recovery_migration.py`, `test_auth_recovery_transaction_integration.py` | Duplicate/mixed token or index state stops before backup/mutation; no token-bearing output. |
| Admin session / `009` | `test_auth_session_migration.py` | Duplicate, partial, incompatible, or TTL index state stops before backup/mutation; apply is idempotent and rollback is constrained; cleanup remains separately confirmed, bounded, and restore-backed. |
| Backup / restore | `test_migration_backup_restore.py` | Restore refuses unsafe target/overwrite/tampered snapshot and proves captured state only in isolation. |
| Legacy gaps / `001`, `004`, `005` | `test_identity_foundation.py` directly exercises Migration 001 dry-run/idempotency, but not its missing transaction, backup, rollback, current-role reconciliation, or duplicate-index failure floor. No dedicated Migration 004/005 test is present. | A future separately approved reconciliation must add source-specific preservation, failure/partial-state, rollback/restore, authority, and dependency tests before execution is considered. Existing Migration 001 coverage does not make its apply safe. |

## Stop and resume record

Current stop: `DR-012` is incomplete for target/topology/RPO-RTO/evidence;
PHASE-00C is not execution-complete. The approved disposable `rs-test` is
preflight-only and cannot be substituted for a selected operational target.

Resume only when a specific migration is separately authorized and the global
execution gate is satisfied. The first execution candidate must be reviewed as
one isolated task with disjoint file ownership, exact SHA, and a fresh task
card; do not batch all nine migrations into one window, and never bundle the
Migration 009 retention cleanup with index/marker approval.

## Handoff

Changed by this planning task: the task card, this phase plan, and directly
stale readiness scope rows only. Intentionally unchanged: every migration
source/test, all runbooks, environment files, data, indexes, backups, and
operational configuration.

Faiz owns the planning handoff and the currently recorded migration,
backup/restore, rollback, maintenance-window, and evidence-custody boundary.
A reviewer should challenge the legacy-migration exclusions, verify no plan
language grants execution, and confirm each blocked condition remains visible.
