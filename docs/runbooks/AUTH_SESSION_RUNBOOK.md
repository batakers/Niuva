# Admin Session Safety Runbook

## Scope

This runbook governs migration `009_admin_session_safety.py`, controlled 90-day
session cleanup, Admin cutover/disablement, rollback, monitoring, and handoff. It
does not authorize shared, staging, or production mutation; deployment;
production activation; or go-live. Those require separate environment approval,
and production activation requires Project Owner plus Acting Technical Owner
approval.

Admin sessions require same-origin HTTPS end to end. Cookies are
`__Host-niuva-admin-access` and `__Host-niuva-admin-session`, with `Secure`,
`HttpOnly`, `SameSite=Strict`, `Path=/`, and no `Domain`. There is no production
HTTP fallback. Customer bearer compatibility remains separate.

Never place cookie/session/CSRF values, secret hashes, Authorization headers,
passwords, raw IP addresses, user-agent strings, names, email/contact data, or
raw session documents in commands, reports, backups, tickets, logs, or alerts.

## Setup And Gates

Before any later authorized mutation:

1. Record authorization, revision, target database, operator, independent
   reviewer, Acting Technical Owner, window, disablement owner, and restore owner.
2. Verify exact same-origin HTTPS, proxy termination, forwarded-header handling,
   Secure-cookie preservation, and no HTTP fallback.
3. Drain Admin login/session issuance and session mutation traffic.
4. Create a full encrypted database backup and restore-test it in isolation.
5. Select a new unused path on an approved encrypted destination for migration
   metadata backup. Do not use Git or an unencrypted temporary directory.
6. Verify MongoDB replica-set/session transaction capability and readiness.
7. Set `TRANSACTION_MUTATIONS_ENABLED=true` only for the approved window.

Stop on absent transaction capability, existing backup path, ambiguous marker or
index state, any TTL index, failed restore, sensitive output, or customer-auth
regression. The mutation flag never bypasses capability checks.

## Migration Dry Run

From `backend/` against an explicitly approved target (disposable local only
under the Phase 2 packet):

```powershell
python migrations\009_admin_session_safety.py
```

Dry-run is default and read-only. It reports only applied state, owned-index
count, TTL-index count, and idempotency. It creates no collection, index, marker,
backup, or session mutation.

## Apply And Validate

```powershell
$env:TRANSACTION_MUTATIONS_ENABLED = "true"
python migrations\009_admin_session_safety.py `
  --apply `
  --backup "<unused-encrypted-metadata-backup.json>" `
  --encrypted-backup-confirmed
```

Apply creates and validates:

- unique `unique_admin_session_access_secret_hash`;
- unique `unique_admin_session_session_secret_hash`; and
- `admin_session_user_active_expiry` on user, revocation, and access expiry.
- `admin_session_rotated_secret_lookup` for replay detection; and
- separate non-TTL retention indexes for revoked, idle-expired, and
  absolute-expired cleanup candidates.

No TTL index is allowed. The redacted backup contains only migration metadata,
prior owned-index names, and prior marker presence. Marker insertion is guarded
by transaction capability. Failed apply compensates migration-owned indexes.

Run the same apply command again. Expected: `second_run_noop: true`, seven owned
indexes, zero TTL indexes, no overwrite, no session/account/customer mutation.
Treat a subset of indexes, marker/index mismatch, changed named-index definition,
or unexpected marker as an incident; do not repair it manually.

## Rollback

Disable Admin login/session issuance before rollback. Never restore Admin bearer
storage or JavaScript-readable credentials.

```powershell
$env:TRANSACTION_MUTATIONS_ENABLED = "true"
python migrations\009_admin_session_safety.py `
  --rollback `
  --backup "<verified-encrypted-metadata-backup.json>"
```

Rollback validates the redacted backup, removes only migration-owned indexes,
and transactionally removes only migration `008`'s marker. Re-run dry-run and
verify zero owned/TTL indexes. If interrupted into partial state, keep Admin
issuance disabled and restore the verified full backup in a transaction-capable
isolated environment; do not issue direct DB repairs.

## 90-Day Cleanup

Cleanup deletes only sessions revoked at least 90 days ago or whose idle or
absolute expiry is at least 90 days old. It never selects an active session,
never uses access-token expiry as terminal session expiry, and never creates a
TTL index. Each invocation handles one bounded batch (default 250, maximum 1000)
for interruption-safe retry.

Read-only preview:

```powershell
python migrations\009_admin_session_safety.py --cleanup --batch-size 250
```

Output is aggregate-only: eligible, selected, deleted, and estimated remaining
counts. Coordinate apply with the backup window, confirm the full encrypted
restore-tested backup, then use both explicit confirmations:

```powershell
$env:TRANSACTION_MUTATIONS_ENABLED = "true"
python migrations\009_admin_session_safety.py `
  --apply-cleanup `
  --cleanup-confirmed `
  --encrypted-restore-backup-confirmed `
  --batch-size 250
```

Repeat preview/apply until eligible is zero. The guarded conditional delete
rechecks age eligibility inside the transaction, so a changed/non-eligible
record is not deleted. Stop on deleted/selected mismatch, transaction ambiguity,
latency/error threshold breach, backup-window closure, or active-session impact.
Restore deleted history only through the full tested backup procedure.

## Disablement And Cutover

For a later separately authorized cutover:

1. Communicate the maintenance window and drain Admin authentication traffic.
2. Verify backend/frontend revisions ship atomically under current same-origin
   HTTPS topology, cookie/CSRF controls, Mongo readiness, and customer regression
   checks.
3. Force all Admin users to log in again. Do not import or accept legacy Admin
   bearer tokens as sessions; remove legacy Admin browser token state.
4. Observe issuance, rotation, revocation, CSRF/origin rejection, DB health, and
   customer login before ending the window.

On session-safety failure, disable Admin login/session issuance and preserve
customer bearer compatibility. Keep credential verification compatible with
existing bcrypt/Argon2id records. Never roll back to Admin `localStorage` bearer
persistence, insecure cookies, HTTP, dual Admin transport, or missing CSRF.

## Monitoring And Handoff

Monitor aggregate rates/errors for issuance, rotation, rotated-secret replay,
revocation/logout, CSRF/origin rejection, MongoDB session latency/availability,
cleanup failure, and customer-auth regression. Use redacted operation/category
evidence only. Complete the approved 60-minute intensive and 24-hour extended
observation plan before any production acceptance.

Handoff records revision, approvals, topology/HTTPS proof, transaction readiness,
dry-run/apply/second-run/rollback and cleanup aggregates, index definitions,
backup/restore exercise, disablement/cutover drill, monitoring owner/destination,
open incidents, and encrypted backup custody. State explicitly whether execution
was disposable-only and that no production authorization or activation occurred.
