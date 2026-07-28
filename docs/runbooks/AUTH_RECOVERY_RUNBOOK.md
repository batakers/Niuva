# Authentication Recovery Safety Runbook

## Scope

This runbook governs migration `008_auth_recovery_safety.py`, recovery
disablement, rollback, and operator handoff. It does not authorize execution
against shared/staging/production data, real email, Argon2 write enablement,
deployment, or go-live. Phase 1 permits disposable local replica-set evidence
only.

Non-negotiable invariants:

- raw reset tokens, token hashes, emails, passwords, and password hashes never
  enter command output, tickets, logs, migration reports, or backup JSON;
- dry-run is default and read-only;
- apply/rollback require both transaction capability and
  `TRANSACTION_MUTATIONS_ENABLED=true`;
- pre-migration active tokens are preserved but invalidated; no token document
  is deleted;
- no TTL deletion index is created;
- recovery never falls back to sequential writes or persisted token-bearing
  notifications; and
- no rollback may remove Argon2 verification after any Argon2 credential exists.

## Preconditions

Before any later authorized apply or rollback:

1. Obtain environment-specific approval and record operator, reviewer, exact
   revision, database, maintenance window, and rollback owner.
2. Drain password-recovery mutation traffic.
3. Create and restore-test a full database backup in an isolated environment.
4. Select a new, unused path on an approved encrypted backup destination for
   the migration-owned backup. Never place it in Git or an unencrypted temp
   directory.
5. Confirm transaction readiness for the exact database and replica set.
6. Confirm the deployed rollback floor can verify both bcrypt and Argon2id.
7. Keep `AUTH_ARGON2_WRITES_ENABLED=false`. Migration success does not authorize
   enabling writes.

Stop if any state is partial or ambiguous, transaction capability is absent,
the backup path exists, encryption cannot be confirmed, or output contains
sensitive values.

## Disposable Dry Run

From `backend/`, connected only to an approved disposable local replica set:

```powershell
python migrations\008_auth_recovery_safety.py
```

Expected output is aggregate-only: scanned count, field-type counts, active-user
count, duplicate count, planned invalidations, and idempotency state. Dry-run
does not create a backup, index, session, marker, or token mutation.

Any duplicate `token_hash`, more than one active token for a user, malformed
hash/user fields, mixed migration markers, or one-of-two migration indexes stops
apply. Do not repair ambiguous data manually.

## Disposable Apply

Only after the prerequisites and disposable-data authorization are satisfied:

```powershell
$env:TRANSACTION_MUTATIONS_ENABLED = "true"
python migrations\008_auth_recovery_safety.py `
  --apply `
  --backup "<unused-encrypted-backup-path.json>" `
  --encrypted-backup-confirmed
```

Apply creates:

- unique index `unique_password_reset_token_hash` on `token_hash`; and
- partial unique index `one_active_password_reset_token_per_user` on `user_id`
  where `active: true`.

It then transactionally marks every historical token with
`auth_recovery_migration: 008_auth_recovery_safety`, sets `active: false`, and
records migration invalidation fields. Index creation is compensated if either
index or the guarded mutation fails. Historical documents remain intact.

Run the same apply command again. Expected: `second_run_noop: true`, no writes,
no backup overwrite, and the same two indexes. Preserve the backup until the
restore exercise and handoff are accepted.

## Verification

Verify only safe aggregates:

- no token remains active immediately after migration;
- every historical token has the migration marker;
- both named indexes exist with the expected uniqueness/partial filter;
- no TTL index exists;
- a fresh recovery request can create one new active token under the new
  contract; and
- concurrent completion still yields exactly one success with atomic password,
  session-version, and token state.

Scan the backup and evidence for forbidden keys/values. Do not print database
documents to prove absence.

## Rollback

Rollback restores only migration-owned token fields and removes only indexes
that migration `007` introduced:

```powershell
$env:TRANSACTION_MUTATIONS_ENABLED = "true"
python migrations\008_auth_recovery_safety.py `
  --rollback `
  --backup "<verified-encrypted-backup-path.json>"
```

Rollback is not permission to reactivate unsafe legacy recovery. Keep recovery
disabled until the new contract can be restored. Never restore raw-token
persistence, token-bearing general notifications, non-atomic completion, or
startup password reconciliation.

If rollback cannot reconcile every opaque token ID and both index states, stop
recovery traffic and restore the full verified database backup into a
transaction-capable environment. Do not perform direct token edits.

## Recovery Disablement

For delivery, blocklist, transaction, migration, or write-gate incidents:

1. Set `AUTH_ARGON2_WRITES_ENABLED=false` through the approved environment
   control.
2. Keep Argon2 verification enabled for credentials already written.
3. Return only the generic temporarily unavailable recovery outcome.
4. Preserve login verification for eligible existing bcrypt/Argon2 accounts.
5. Reconcile using redacted operation IDs and aggregate counts only.

## Handoff

Record revision, disposable database identifier, transaction-readiness result,
dry-run/apply/second-run/rollback aggregate results, restore-test result, named
index state, and the encrypted backup custody owner. State explicitly that no
shared data, real email, secret, commit, push, deployment, Argon2 write enable,
or production activation occurred.

Open production blockers remain: approved blocklist dataset/update owner,
production-equivalent Argon2 benchmark, delivery procedure, distributed limiter
topology, monitoring/alert ownership, shared-environment migration approval,
and rollout/go-live approval.
