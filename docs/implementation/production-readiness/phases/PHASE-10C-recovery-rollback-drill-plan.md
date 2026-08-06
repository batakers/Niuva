# PHASE-10C Recovery and Rollback Drill Plan

Status: **planning — blocked by decision and environment; execution prohibited**

Phase / tasks: `PHASE-10C` / `TASK-10C-01`, `TASK-10C-02`

Task card:
[PHASE-10C-recovery-rollback-drill-task-card.md](PHASE-10C-recovery-rollback-drill-task-card.md)

Planning baseline: `fbaa7bb9188c380dcd18290e46d5da6b3a3cb5b0`
with Git tree `9b17ae3b7ba981271202e63c94cee12abba70177`.
This records the source used to write the plan; it is not the PHASE-10A
candidate selection.

Branch / worktree: `ops/backend-recovery-drill` /
`/Users/macintoshhd/NIUVA/Niuva-worktrees/backend-recovery-drill`.

## Objective

Define one reviewable, fail-closed procedure for later isolated recovery and
rollback drills. The procedure covers migration dry-run, backup/restore,
transaction failure, recovery failure, artifact rollback, and data rollback,
with every result attributable to one exact approved SHA.

This packet does not execute or authorize a drill. It deliberately keeps
application-artifact rollback separate from database recovery: reverting code
must not silently restore data, and restoring data must not imply that an
application artifact is compatible or approved.

## Authority and dependencies

- `docs/NIUVA_MASTER_SPEC.md` requires immutable commercial history,
  non-destructive migration, fail-closed transaction behavior, and explicit
  operational gates.
- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
  prohibits a non-atomic fallback for transaction-required mutation.
- `doc/MIGRATION_BACKUP_RESTORE_RUNBOOK.md` defines capture, verification,
  comparison, restore, and post-restore comparison on an approved copy.
- `doc/TRANSACTION_CAPABILITY_RUNBOOK.md` separates code rollback from data
  effects and requires transaction-capable execution.
- `doc/ROLLOUT_AND_HANDOVER_RUNBOOK.md` separates previous-artifact redeploy
  from database restore and requires owners and evidence.
- `docs/implementation/production-readiness/phases/G4-CURRENT-MAIN-ARTIFACT-ROLLBACK-EVIDENCE-2026-08-06.md`
  supplies current planning evidence only; it is not an immutable published
  artifact or rollback rehearsal.
- PHASE-02B is the migration-hardening planning dependency. PHASE-02C PR #202
  is open at planning time and must be merged and independently accepted before
  its evidence can be consumed.
- PHASE-10A, DR-012, and an approved isolated target remain mandatory entry
  gates.

## Entry gates

All entries below must be recorded for the same drill window before execution
can be proposed:

| Gate | Required record | Current disposition |
| --- | --- | --- |
| Exact candidate | Full Git SHA and tree, clean worktree, approved scope/change matrix, and PHASE-10A owner decision | **Blocked:** this plan's SHA is not a selected candidate. |
| Artifacts | Immutable candidate and last-known-good artifact identifiers, checksums/attestations, runtime/lock provenance, retention location, and compatibility review | **Blocked:** local or CI build observations are not retained rollback artifacts. |
| Target | Named isolated non-production topology, database identifiers, transaction capability, persistence class, access boundary, and cleanup policy | **Blocked:** no PHASE-10C target is approved. |
| People | Drill executor, migration owner, release/rollback owner, restore owner, evidence custodian, incident commander/on-call, and independent verifier | **Blocked:** DR-012 assignments are incomplete. |
| Window | Timezone-aware start/end, traffic/write-quiescence rule, timeout, abort threshold, escalation route, and cleanup deadline | **Blocked:** no window is approved. |
| Recovery objectives | Approved RPO/RTO, measurement start/stop points, allowed data loss, breach action, and acceptance owner | **Blocked:** RPO/RTO remain open. |
| Backup custody | Encryption and storage class, access list, checksum, retention/destruction, restore target, and independent verification | **Blocked:** operational custody is not accepted. |
| Migration scope | Exactly one reviewed migration or explicitly approved set, dry-run-only boundary unless separately expanded, validation, rollback/compensation, and history-preservation rules | **Blocked:** this task grants no migration authority. |
| Failure injection | Named fault mechanism, blast radius, reset/cleanup path, expected fail-closed result, and observer | **Blocked:** no injection is authorized. |
| Independent acceptance | Reviewer is distinct from the executor and signs the aggregate evidence and remaining limitations | **Blocked:** verifier is unassigned. |

Any missing or stale entry is a stop condition. Passing CI, a local disposable
test, a branch, or approval of this plan cannot substitute for these gates.

## Planned drill matrix

| Drill | Planned bounded action after approval | Required evidence | Pass condition | Hard stop / failure disposition |
| --- | --- | --- | --- | --- |
| Migration dry-run | Run only the selected migration's default non-mutating path against the named isolated copy. Never combine dry-run approval with apply. | Exact migration file digest, arguments with secrets redacted, aggregate plans/counts, duplicate/index/marker preflight, before/after aggregate and index manifest. | No mutation; expected plan is stable; no ambiguity, collision, incompatible index, sensitive output, or unexpected skip. | Stop on target/SHA mismatch, any write, ambiguity, collision, unsafe output, missing prerequisite, or plan drift. Do not repair records manually. |
| Backup/restore | Capture and checksum the approved source copy, verify the snapshot, restore into a distinct initially empty database, compare content, and clean up under custody rules. | Snapshot SHA-256, source/restore database-name hashes, aggregate inventory, timestamps, restore duration, content comparison, BSON/history checks, cleanup and independent review. | Checksum verifies; source and restore are distinct; restored content is identical; required historical references and BSON types survive; cleanup is verified. | Stop on populated restore target, checksum mismatch, raw-data evidence, insufficient space, unquiesced writes, custody breach, compare mismatch, or cleanup failure. Preserve incident evidence according to custody rules. |
| Transaction failure | Inject only the approved transaction capability/session/commit fault around a transaction-required synthetic mutation. | Fault identifier, capability probes, operation ID, aggregate before/after counts/digests, returned domain status, retry disposition, audit/telemetry correlation, cleanup. | Mutation fails closed with no partial cross-collection effect; result is the approved controlled failure; no non-atomic fallback occurs. | Stop on any partial effect, ambiguous commit, unsafe retry, missing transaction signal, leaked data, or unavailable observer. Quarantine the target for investigation. |
| Recovery failure | Inject an approved failure into the selected recovery path, such as restore verification, scoped rollback, or recovery-notification boundary, without real users/providers. | Fault stage, checksum/marker/index state, aggregate effects, retry/abort behavior, degraded readiness/alert evidence, operator decision, and cleanup. | Recovery refuses unsafe input or stops at its documented boundary; original evidence remains intact; no false-success status or irreversible partial state. | Stop on checksum/marker ambiguity, partial restore/rollback, unexpected delivery, missing alert, evidence loss, or inability to return the target to a known state. Escalate to the incident owner. |
| Artifact rollback | Deploy the retained candidate artifact to the approved isolated topology, trigger the approved abort condition, then redeploy the already captured last-known-good artifact without rebuilding. | Candidate and previous artifact digests, exact source SHAs, deployment IDs/timestamps, trigger, cache/config compatibility, readiness/smoke results, elapsed rollback time, owner/verifier. | Previous immutable artifact is restored within approved RTO and passes the required readiness/smoke contract; no database restore is implied. | Stop if either artifact is rebuilt, mutable/unavailable, its digest differs, compatibility is unreviewed, configuration cannot be reproduced, or health checks fail. |
| Data rollback | Use only the selected migration's reviewed constrained rollback/compensation when safe; otherwise restore the verified backup into the approved recovery target. Never edit records manually. | Pre/post digests, migration ledger/marker/index manifest, restored collection aggregates, immutable Quote/Order/Project references, audit continuity, RPO/RTO measurement, remaining divergence. | The reviewed target state is restored without inferred history, hard deletion, reference drift, role escalation, or customer/internal projection leakage. | Stop on concurrent state change, ambiguous historical mapping, missing backup, checksum failure, rollback-floor incompatibility, partial index/marker state, or RPO/RTO breach. Preserve the target and escalate; do not improvise. |

## TASK-10C-01 — Migration, transaction, and recovery-failure drill

Planned sequence after all entry gates pass:

1. Verify exact candidate SHA/tree, target identity, owners, window, and evidence
   custody before any connection.
2. Capture read-only topology, readiness, transaction-capability, index/marker,
   and aggregate historical-reference baselines.
3. Run only the authorized migration dry-run and prove the before/after state
   is unchanged.
4. Execute the approved synthetic transaction-failure case and prove there is
   no partial effect or fallback.
5. Execute the separately approved recovery-failure case and prove it stops
   without false success or irreversible partial state.
6. Record aggregate evidence and obtain independent review before considering
   TASK-10C-02.

No apply, rollback, restore, or failure injection is authorized by this
sequence. Each future action needs its own checked approval in the execution
record.

## TASK-10C-02 — Artifact and data rollback drill

Planned sequence after TASK-10C-01 is independently accepted:

1. Confirm the candidate and last-known-good artifacts already exist as
   immutable retained objects with verified digests; do not rebuild rollback.
2. Capture and verify the approved database backup and prove restore into a
   second isolated database before any data-changing exercise.
3. Deploy the candidate artifact, trigger the approved abort condition, and
   redeploy the previous artifact while measuring the approved RTO.
4. Validate compatibility and readiness without treating artifact rollback as
   a data restore.
5. Perform only the authorized data rollback/compensation or full restore on
   the approved recovery target, then compare against the recovery point.
6. Validate immutable historical records, references, BSON types, indexes,
   markers, audit continuity, role boundaries, and customer-safe projections.
7. Verify cleanup, evidence retention, corrective actions, and independent
   acceptance.

## Exact-SHA evidence contract

Each future result must be one immutable, credential-free record. It must not
contain raw documents, names, email addresses, tokens, session values, IP/user
agent strings, database URIs, backup contents, secret references that reveal
values, or provider credentials.

| Field group | Required fields |
| --- | --- |
| Identity | Candidate full SHA/tree; migration file SHA-256 where applicable; candidate and last-known-good artifact digest; dependency lock/runtime identifiers. |
| Scope | Drill ID; selected migration/fault; explicit exclusions; approved target class and hashed database identifiers. |
| Authority | Decision/task-card revision; approver; executor; rollback/restore owners; evidence custodian; independent verifier. |
| Window | UTC and local start/end; maintenance-window ID; RPO/RTO thresholds; measurement points. |
| Before state | Aggregate collection/document counts, per-collection digests, index/marker manifest digest, readiness and transaction-capability result. |
| Action | Sanitized procedure revision, expected fault/abort trigger, artifact deployment IDs, and whether mutation was authorized. |
| Result | Status, controlled error, aggregate differences, restore/rollback comparison, historical-reference checks, artifact/readiness checks, measured recovery times. |
| Custody | Backup/snapshot checksum, artifact checksums, approved storage class/reference, retention/destruction result, and access-review reference. |
| Closure | Cleanup result, corrective action, unresolved limitation/risk, incident reference if needed, and independent disposition. |

Evidence from a different SHA, regenerated artifact, different target, expired
window, or different procedure revision is stale and cannot be carried forward
as a PHASE-10C pass.

## Static source/test inventory for later selection

This inventory identifies candidates only; it does not authorize their use.

| Area | Existing source or test evidence to review | Remaining PHASE-10C need |
| --- | --- | --- |
| Migration hardening | `backend/migrations/001`–`010`; focused migration tests; PHASE-02B plan | Select one reviewed scope; reconcile it to the frozen SHA; retain per-migration stop rules and separate destructive cleanup. |
| Backup/restore | `backend/migration_backup.py`; `backend/tests/test_migration_backup_restore.py`; PR #202 | Merge and independently accept applicable PHASE-02C evidence; approve operational custody, RPO/RTO, target, and window. |
| Transactions | `backend/transaction_execution.py`; transaction capability runbook; real-replica integration tests | Select one fault mechanism and expected controlled outcome; prove no partial effect, unsafe retry, or fallback on the approved topology. |
| Recovery | Auth recovery/session migrations and runbooks; readiness and failure-path tests | Select one bounded recovery failure and explicit cleanup/escalation contract without real provider or user data. |
| Artifact rollback | G4 current-main artifact/rollback packet; deployment and handover runbook | Retain immutable candidate and previous artifacts; approve staging-like target/config/cache compatibility, trigger, owner, and RTO. |
| Data rollback | Per-migration constrained rollback plus whole-database restore runbook | Decide constrained rollback versus full restore before the drill; preserve historical records and forbid manual edits. |

## Stop and resume record

Current status is `blocked_by_decision` and `blocked_by_environment` because
PHASE-10A has not selected a candidate, DR-012 is incomplete, PR #202 is not a
merged independently accepted dependency, and no target, window, RPO/RTO,
immutable rollback artifact, failure-injection scope, or independent verifier
is approved.

Resume planning review when those inputs have named owners and dispositions.
Open execution only with a fresh task card tied to the selected SHA and one
approved target/window. If the SHA, tree, artifact digest, migration scope,
target, procedure, owner, or window changes, stop and revalidate the packet.

## Handoff

Changed by this task: PHASE-10C planning documentation and directly related
coordination status only. Intentionally unchanged: source, tests, workflows,
runbooks, migrations, environment/configuration, artifacts, databases,
backups, providers, credentials, deployment state, and external systems.

Rollback of this planning change is a documentation revert only. No runtime or
data rollback is applicable because no drill or mutating command was run.
