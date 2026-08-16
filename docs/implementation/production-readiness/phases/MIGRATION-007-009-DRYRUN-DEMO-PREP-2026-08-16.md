# Migration 007-009 Dry-Run — Demo Preparation Check — 2026-08-16

Status: **dry-run only; no migration applied; for the Lead discussion named
in the demo-readiness report's Tahap B item #6**

## Purpose

`Laporan_Kesiapan_Demo_NIUVA.pdf` (16 August 2026) asks the team to
"Diskusikan dengan Lead: apakah migrasi database 007-009 perlu dijalankan
sebelum demo... atau boleh diabaikan untuk demo terbatas." This record is
the read-only input for that discussion: what each migration reports it
would do, run against a disposable local database. It does not decide
whether to apply anything, and it changes nothing.

## Method

Each migration was run in its default **dry-run mode** (no `--apply` flag)
against a throwaway local MongoDB replica set (`rs0`, loopback port 27020,
disposable data directory, deleted after this check) — never the real
application database. Migration scripts refuse to mutate anything without
an explicit `--apply` flag and, for 007, a reviewed backup-evidence
manifest; none of that was supplied here.

## Results

| Migration | Result | Notes |
| --- | --- | --- |
| `007_security_publication_schema` | `status: "ready"`, 82 indexes planned, 0 duplicate/portfolio issues | Matches the same "ready" result recorded in earlier project audits on other baselines |
| `008_auth_recovery_safety` | Dry-run completed cleanly, 0 records scanned (empty database) | No errors |
| `009_admin_session_safety` | Dry-run completed cleanly, `applied: false` | No errors |

All three exited without error and explicitly reported `dry_run: true` /
`applied: false` — none of them touched the disposable database's data,
only inspected it.

## What this does and does not answer

**Does answer:** the migration scripts themselves run cleanly on the
current codebase (`origin/main`) and report a "ready" plan — there is no
crash, syntax error, or schema-planning failure that would surprise anyone
mid-demo if backend readiness output is shown.

**Does not answer:** whether the *application's real local database* (the
one actually used for the demo rehearsal) needs migrations 007-009 applied
for its readiness status to look clean, and whether that matters for the
demo. That depends on what state the real demo database is already in,
which this disposable run cannot tell you. Check the real demo database's
own dry-run output (same commands, pointed at its actual `MONGO_URL`)
before deciding.

**Not decided here:** whether to apply 007-009 to the demo database. Per
the project's own migration policy, `007` additionally requires a reviewed
backup-evidence manifest before `--apply`; `008`/`009` require their own
gates per `docs/runbooks/AUTH_RECOVERY_RUNBOOK.md` and
`AUTH_SESSION_RUNBOOK.md`. This document is the input to the Tahap B #6
discussion with Lead, not a substitute for it.

## Commands run (reproducible)

```bash
cd backend
MONGO_URL="mongodb://127.0.0.1:27020/?replicaSet=rs0&directConnection=true" \
  .venv/bin/python -m migrations.007_security_publication_schema
MONGO_URL="mongodb://127.0.0.1:27020/?replicaSet=rs0&directConnection=true" \
  .venv/bin/python -m migrations.008_auth_recovery_safety
MONGO_URL="mongodb://127.0.0.1:27020/?replicaSet=rs0&directConnection=true" \
  .venv/bin/python -m migrations.009_admin_session_safety
```

No `--apply` flag was used in any command above.
