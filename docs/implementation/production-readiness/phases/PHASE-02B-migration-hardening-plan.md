# PHASE-02B — Migration Hardening Plan

Status: **planning — ready for owner/reviewer review; execution remains blocked**

Phase / tasks: `PHASE-02B` / `TASK-02B-01`, `TASK-02B-02`

Baseline: `72eda512541985a2e494ebf23ceb575632d57b34` (`origin/main`, 29 July 2026)

Task branch / worktree: `plan/phase-02b-migration-hardening` /
`C:\Portfolio\Niuva\Niuva-phase-02b-migration-hardening`

## Objective

Create the migration-hardening packet for migrations `001` through `008`.
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
`backend/migrations/001` through `008`, their existing focused tests, and the
applicable runbooks.

Excluded work includes all migration commands, data/index/collection mutation,
backup or restore execution, new mapping files, provider or scheduler work,
environment/configuration changes, credentials, production-readiness claims,
and go-live. Migration `009` is explicitly outside this PHASE-02B inventory.

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

## Task breakdown

### TASK-02B-01 — Preflight and execution-boundary packet

**Objective:** turn the global gate and inventory into a migration-specific
preflight record without selecting a target or running a command.

**Acceptance criteria:**

- Every migration `001`–`008` has an explicit `do not execute`,
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
- Existing focused tests are mapped; missing 001/004/005 migration coverage is
  recorded as a gap rather than assumed passing.
- Evidence is aggregate-only and contains no credentials, personal data,
  token/hash values, backup contents, or raw documents.

**Planned verification matrix:**

| Area | Existing focused evidence to rerun later | Required negative proof |
| --- | --- | --- |
| Catalog / `002` | `test_catalog_material_inventory_migration.py` | SKU/index collision blocks every write; references remain unchanged; second run is a no-op. |
| Identity / `003`, `006` | `test_identity_access_migration.py`, `test_granular_role_migration.py` | No transaction fallback, no unreviewed Owner/mapping, no duplicate audit, and rollback stays fail-closed. |
| Publication / `007` | `test_security_schema_migration.py` | Duplicate or portfolio ambiguity blocks before index/backfill/ledger mutation; recovery uses reviewed evidence. |
| Recovery / `008` | `test_auth_recovery_migration.py`, `test_auth_recovery_transaction_integration.py` | Duplicate/mixed token or index state stops before backup/mutation; no token-bearing output. |
| Backup / restore | `test_migration_backup_restore.py` | Restore refuses unsafe target/overwrite/tampered snapshot and proves captured state only in isolation. |
| Legacy gaps / `001`, `004`, `005` | No dedicated migration test is present in the selected baseline. | A future separately approved reconciliation must add source-specific dry-run, preservation, idempotency, rollback/restore, and dependency tests before execution is considered. |

## Stop and resume record

Current stop: `DR-012` is incomplete for target/topology/RPO-RTO/evidence;
PHASE-00C is not execution-complete. The approved disposable `rs-test` is
preflight-only and cannot be substituted for a selected operational target.

Resume only when a specific migration is separately authorized and the global
execution gate is satisfied. The first execution candidate must be reviewed as
one isolated task with disjoint file ownership, exact SHA, and a fresh task
card; do not batch all eight migrations into one window.

## Handoff

Changed by this planning task: this phase plan and linked readiness status rows
only. Intentionally unchanged: every migration source/test, all runbooks,
environment files, data, indexes, backups, and operational configuration.

Faiz owns the planning handoff and the currently recorded migration,
backup/restore, rollback, maintenance-window, and evidence-custody boundary.
A reviewer should challenge the legacy-migration exclusions, verify no plan
language grants execution, and confirm each blocked condition remains visible.
