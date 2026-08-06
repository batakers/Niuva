# Migration Backup and Restore Runbook

Status: Runbook — backup and restore procedure; the exercise is not complete
until restore and comparison evidence are captured for the target environment.

Provenance: This document is procedural guidance for an approved migration. It
does not authorize a migration, environment, provider, or production change.

Whole-database capture and restore around a migration.

A per-migration `--rollback` undoes what that migration knew it changed. This
is the other half: proof you can put the database back as it was, including
anything the migration did not anticipate.

## The exercise

The deliverable is not a backup file. It is having done this, on a copy,
before doing it for real:

1. **Capture** a snapshot.
2. **Verify** the snapshot is what it claims to be.
3. **Run the migration** (dry-run first, then apply).
4. **Compare** live against the snapshot, and read what changed.
5. **Restore**, and compare again. Identical, or the backup was not usable.

Step 5 is the one that matters. A backup nobody has restored is a backup
nobody has.

## Commands

```powershell
$env:MONGO_URL = "mongodb://..."
$env:DB_NAME   = "niuva"
cd backend

python -m migration_backup capture  --snapshot .\snapshots\pre-006.json

# Copy the checksum from capture output into the approved external custody record.
$expectedSha256 = "<trusted SHA-256 from the capture record>"
python -m migration_backup verify   --snapshot .\snapshots\pre-006.json --expected-sha256 $expectedSha256

# run the migration here, dry-run first

python -m migration_backup compare  --snapshot .\snapshots\pre-006.json --expected-sha256 $expectedSha256
python -m migration_backup restore  --snapshot .\snapshots\pre-006.json --expected-sha256 $expectedSha256 --allow-non-empty
python -m migration_backup compare  --snapshot .\snapshots\pre-006.json --expected-sha256 $expectedSha256
```

`--url` and `--database` override the environment.

## What the tool guards

- **Snapshots refuse to overwrite.** Writing over an existing file would
  destroy the only copy of the state you are about to migrate away from.
- **Restore refuses a populated target** unless `--allow-non-empty` is given.
  Restoring over live data by accident is the failure this exists to prevent.
- **Verification compares content, not counts.** A digest per collection
  catches a mutated document that a count would call intact.
- **Snapshot writes report SHA-256.** The checksum binds custody evidence to
  the exact snapshot file bytes without putting raw snapshot contents in the
  evidence record. Capture also writes a detached `.sha256` manifest; verify,
  restore, and compare require the independently recorded expected value before
  they parse or process the snapshot.
- **Collections created after the snapshot are dropped on restore.** Leaving
  them would not return the database to the captured point.
- **BSON types survive.** Snapshots use `bson.json_util`, so Decimal128 comes
  back as Decimal128. A restore that turns a stored decimal into a float has
  changed the money it was meant to protect.

## Rehearsing it

The full cycle runs against the ephemeral replica set, so it can be practised
without touching anything real:

```powershell
docker compose -f docker-compose.transaction-test.yml up -d
$env:NIUVA_RUN_REAL_TRANSACTION_TESTS = "1"
$env:MONGO_TRANSACTION_TEST_URL = "mongodb://127.0.0.1:27018/?replicaSet=rs-test&directConnection=true"
python -m pytest -n 0 -q backend\tests\test_migration_backup_restore.py
docker compose -f docker-compose.transaction-test.yml down --volumes --remove-orphans
```

That suite seeds synthetic decimal balances, accepted Quote history, Project
references, materials, and users; captures; applies a migration-shaped change
including a dropped historical record and a new collection; confirms the
comparison reports every touched collection; restores into a distinct empty
database; and checks the restored database is content-identical, with exact
Quote-line references and Decimal128 still preserved. Both generated databases
and the raw snapshot are removed before the proof completes.

## Before running against real data

- Snapshots contain everything, including user records. Treat the file as
  production data: store it where production data is allowed, and delete it
  when the exercise is over.
- Take the snapshot from a primary, with writes quiesced. A snapshot taken
  under load captures a moment that never existed as a whole.
- Confirm free disk before capture. The snapshot is roughly the size of the
  data, uncompressed.
- Running this against real data is not covered by any prior approval. It
  needs its own.
