# PHASE-02C Isolated Backup/Restore Proof Task Card

Status: **authorized disposable-local rehearsal; shared execution prohibited**

| Field | Task brief |
| --- | --- |
| Title and user outcome | Prove that a checksummed whole-database snapshot from one disposable database can be restored into a second disposable database without losing historical records or BSON types. |
| In scope | `backend/migration_backup.py`; focused backup/restore tests; PHASE-02C evidence and directly related readiness tracker rows. |
| Out of scope | Migrations `001`–`010`; shared/staging/production data; application data; real credentials; provider/config changes; deployment; production readiness; go-live; merge. |
| Authority | `AGENTS.md`; Master Spec sections 11–13 and 17–18; `ADR-001`; `doc/MIGRATION_BACKUP_RESTORE_RUNBOOK.md`; `DR-012`; explicit Project Owner authorization on 2 August 2026 for this bounded Feature 9.2 completion. |
| Affected areas | Whole-database snapshot checksum, second-database restore proof, historical-record/BSON validation, evidence custody, `PHASE-02C`, `V-02-02`, and `OPS-006`. |
| Contract or dependency | PHASE-02B is merged through PR #112. Its planning result does not authorize any migration, and this proof does not broaden that authority. |
| Done when | A unique source database and distinct restore database run on local disposable `rs-test`; snapshot SHA-256 is recorded aggregate-only; restore comparison is identical; historical versions/references and Decimal128 survive; both databases and the raw snapshot are removed; migration rollback status and independent-review handover are recorded. |
| Verification | Focused unit tests; real disposable MongoDB replica-set test; post-run database/temporary-file cleanup check; compile; `git diff --check`; changed-path review. |
| Rollback status | Migration rollback was not exercised. The bounded proof exercised whole-database restore into a second database and recorded its result; any migration apply/rollback remains out of scope. |
| Evidence handover | Aggregate-only evidence is retained in `PHASE-02C-isolated-restore-evidence.md`; raw snapshots are deleted. Independent Lead/human review must verify the procedure, result, cleanup, rollback status, and limitations before acceptance. |
| Owner and verifier | Executor and evidence custodian: Faiz/Codex for the bounded local window. Required PR rule reviewer and verifier: Lead/human reviewer; Driver evidence does not substitute for independent acceptance. |
| Commit/push/PR permitted? | Yes. Commit, push, and PR creation are authorized. Merge and every shared/staging/production action remain unauthorized. |
| Risks or open decisions | DR-012 remains open for operational target, production RPO/RTO, secret evidence, incident/release/on-call ownership, and shared evidence format. This proof closes none of those production gates. |

Execution baseline: `a2b7be0d445cf3a338d91cf74841e3bf8be11a91`
(`origin/main`, verified 2 August 2026; current-main execution scope only).
The historical DR-001 release-candidate selection remains separately recorded
in `REMEDIATION_PROGRESS.md` and is not replaced by this proof baseline.

Branch / worktree: `ops/backend-isolated-restore-proof` /
`/Users/macintoshhd/NIUVA/Niuva-worktrees/backend-isolated-restore-proof`.

Approved target: local Docker Compose service `mongodb-test`, MongoDB 7.0,
single-node replica set `rs-test`, bound to loopback port 27018. Database names
must be unique test-generated identifiers; the restore database must differ
from the source database.

Approved window: this bounded execution session only, beginning with Compose
startup and ending after verified database deletion and `down --volumes
--remove-orphans`. No persistent volume is permitted.

Evidence custody: commit only aggregate counts, SHA-256 checksum, database-name
hashes, timestamps, validation results, and cleanup result. The raw BSON JSON
snapshot stays in a test temporary directory, is never committed, and is
deleted with the temporary directory after the run.

Stop conditions: stop before capture or restore if the endpoint is not
loopback `rs-test`, either database name is not test-generated, the two names
match, the target is populated, the snapshot path already exists, checksum
verification fails, evidence contains raw records/secrets, or cleanup cannot
be verified.
