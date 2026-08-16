# Disposable Backup/Restore Evidence — 2026-08-16

Status: **disposable local proof passed; independent acceptance and
operational DR-012 gates remain open**

This record answers **DATA-001** from the external full-stack audit
(2026-08-14) — see
[EXTERNAL-FULLSTACK-AUDIT-2026-08-14-REMEDIATION-TRACKER.md](EXTERNAL-FULLSTACK-AUDIT-2026-08-14-REMEDIATION-TRACKER.md) —
using the same bounded method and the same test file
(`backend/tests/test_migration_backup_restore.py`) as the prior
[PHASE-02C isolated restore evidence](PHASE-02C-isolated-restore-evidence.md)
from 2 August 2026. It is a fresh, independent run — same procedure, new
date, new SHA, new evidence numbers.

## Authorization and target

The repository owner directed this work in-session on 16 August 2026 and
confirmed proceeding with the safest available approach for each open
item without a separate written decision, per the standing instruction
recorded for this session. The bounded target was a **local, disposable
MongoDB 7.0.37 instance**, started directly (Docker was unavailable on
this machine; a local Homebrew MongoDB Community 7.0 install was used
instead of the `docker-compose.transaction-test.yml` service, configured
identically: single-node replica set `rs-test`, loopback-only port
27018, `tmpfs`-equivalent disposable data directory under this session's
scratch space).

No shared, staging, production, or application database was connected at
any point. The disposable data directory and its MongoDB process were
destroyed at the end of the run.

## Aggregate evidence

Procedure: `NIUVA_RUN_REAL_TRANSACTION_TESTS=1
MONGO_TRANSACTION_TEST_URL=mongodb://127.0.0.1:27018/?replicaSet=rs-test
NIUVA_CAPTURE_RESTORE_EVIDENCE=1 pytest -n 0 -q -s
backend/tests/test_migration_backup_restore.py::test_backup_restore_returns_the_database_to_its_captured_state`

Baseline SHA: `2a6496792ca42e230a301a1688cb7ef5749584b6` (`origin/main`,
same SHA as the external audit target).

Snapshot/restore evidence timestamp (UTC): `2026-08-15T23:36:30.503532+00:00`
(captured via the test file's own built-in
`NIUVA_CAPTURE_RESTORE_EVIDENCE` evidence hook — not hand-assembled).

| Check | Result |
| --- | --- |
| Replica set / primary | `rs-test`; writable primary `true` |
| Source database identity | SHA-256 `63aeabd8cfd537c3aed9286b60b89b350843f970b2fbc06937a6a7db669dad50` |
| Restore database identity | SHA-256 `d3d3814dcc910ec49ad75ca40d7074eea13302808497cd2814863951f0e3c574` |
| Databases distinct | Passed |
| Snapshot inventory | 5 collections; 7 synthetic documents |
| Snapshot checksum | SHA-256 `724bbae17f75f45e6d1286c7a84e82530f3aead7fb28c9dea224a60af7f75173` |
| Migration-shaped source change detected | Passed |
| Restore comparison identical to pre-change snapshot | Passed |
| Historical reference preserved (Quote → Project `source_quote_version_id`) | Passed |
| `Decimal128` preserved through capture/restore | Passed |
| Full test file | `4 passed` (includes the populated-target refusal and checksum-tamper rejection tests) |
| Post-run database list | `['admin', 'config', 'local']` only — both disposable databases confirmed absent |
| Cleanup flags from the test's own teardown | `source_database_absent: true`, `restore_database_absent: true`, `snapshot_deleted: true`, `checksum_manifest_deleted: true` |
| Disposable MongoDB process and data directory | Shut down and deleted after the run; port 27018 confirmed no longer listening |

## What this proof establishes (same scope as PHASE-02C)

- A verified snapshot can restore into a distinct empty database without
  mutating the changed source database.
- A snapshot with a tampered checksum is rejected before it is trusted —
  both for reading it back and for restoring from it.
- A restore refuses to overwrite a populated target unless explicitly
  told to (exercised by the file's other test, not reproduced above).
- Historical Quote/Project references and BSON `Decimal128` survive the
  full capture → mutate → restore cycle intact.
- Test-generated databases, the snapshot file, and its checksum manifest
  are all verifiably absent after the run.

## Limitations and remaining gates (unchanged from PHASE-02C)

- No migration `001`–`010`, migration dry-run/apply/rollback, real
  customer data, shared backup, deployment, or production operation ran.
- This is synthetic disposable-local evidence, not staging or production
  recovery proof, and not an RPO/RTO measurement.
- Independent human review is still required before this closes DATA-001
  for release-readiness purposes — the executor does not verify its own
  evidence for final acceptance.
- DR-012 remains open for operational target/topology, RPO/RTO, approved
  shared evidence format, secret evidence, and incident/release/on-call
  ownership.
- This run used a local Homebrew `mongod` instead of the checked-in
  `docker-compose.transaction-test.yml` service because Docker was not
  available on this machine. The configuration (MongoDB 7.0, single-node
  `rs-test`, loopback port 27018, disposable data directory) matches the
  Compose service; a future run should prefer the Compose service where
  Docker is available, to stay identical to what CI's `transaction-tests`
  workflow exercises.

The next authorized action is independent review. Any
shared/staging/production rehearsal needs a new task card, exact
target/window, separate owner approval, and its own rollback/cleanup
authority.
