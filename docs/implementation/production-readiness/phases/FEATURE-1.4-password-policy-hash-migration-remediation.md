# Feature 1.4 — Password Policy and Hash Migration Remediation Evidence

Status: **bounded local remediation complete — production and rollout gates remain**
Feature: Password policy and hash migration
Branch: `feat/backend-password-policy`
Evidence date: 29 July 2026

## Outcome

The bounded local remediation closes PP-001 and PP-002 from the read-only
revalidation:

| Finding | Resolution | Evidence |
| --- | --- | --- |
| PP-001 | Customer provisioning no longer invokes the superseded 12–72-byte validator. The canonical `hash_new_password` seam is now the only active backend password-creation authority, and the unused legacy module was removed. | Route/service boundary tests accept 15 code points, 73 bytes, and 128 four-byte Unicode code points; short and oversized input fail without creating a user. |
| PP-002 | Admin customer creation and staff invitation acceptance now load `GET /api/auth/password-policy` and share code-point/UTF-8-byte helpers. Both fail closed while policy is unavailable. | Utility, component, retry, 73-byte submission, and existing Reset Password tests pass. |

No Argon2 parameter, bcrypt verification behavior, write gate, environment
value, dependency, account, password hash, migration, blocklist dataset, or
shared data was changed.

## Implementation boundary

### Canonical backend policy

`server.provision_client` now reaches `auth_password.AuthPassword` directly
through `hash_new_password`. That module:

- requires 15–128 Unicode code points;
- caps input at 512 UTF-8 bytes;
- checks the complete candidate against the configured blocklist;
- rejects an unavailable blocklist;
- refuses new writes while `AUTH_ARGON2_WRITES_ENABLED` is false; and
- never falls back to creating bcrypt.

The obsolete `backend/password_policy.py` module was deleted after repository
search confirmed it had no remaining caller.

### Shared frontend policy adapter

`frontend/src/lib/passwordPolicy.js` now owns:

- loading the public backend policy;
- Unicode code-point and UTF-8-byte metrics;
- boundary evaluation; and
- safe user-facing policy summary text.

Admin customer creation and staff invitation acceptance use that adapter.
Neither carries a 12/72 constant, HTML maximum that miscounts surrogate pairs,
or a bcrypt-era byte boundary. Submission remains disabled until the backend
policy loads. Staff invitation provides an explicit retry action after a policy
request failure.

The backend remains authoritative: frontend checks improve correctness and
feedback but cannot authorize a password write.

## Retained migration and rollback controls

- bcrypt and Argon2id verification remain enabled.
- bcrypt verification may report `needs_rehash=True`, but login performs no
  opportunistic password mutation.
- New Argon2id writes remain gated by the blocklist and
  `AUTH_ARGON2_WRITES_ENABLED`.
- Disabled writes do not create a bcrypt fallback.
- No bulk hash rewrite or account-data migration exists or was added.
- Any rollback artifact after Argon2 activation must retain Argon2id
  verification.

PP-003 through PP-006 remain open production/rollout gates:

- approved production blocklist dataset and operations;
- lowest production-equivalent Argon2 benchmark and capacity budget;
- explicit hash-migration activation/monitoring decision; and
- exact deployed rollback-floor evidence.

## Verification evidence

Focused backend security/password packet after remediation:

```text
34 passed in 17.09s
```

Focused frontend policy consumers:

```text
4 suites passed, 11 tests passed in 1.444s
```

Full backend regression:

```text
576 passed, 12 skipped, 14 subtests passed in 33.61s
```

Full frontend regression:

```text
35 suites passed, 236 tests passed in 4.203s
```

Additional gates passed:

- Python compileall;
- critical Flake8 checks (`E9,F63,F7,F82`);
- Black and isort checks for changed Python files;
- MyPy security/storage boundary check;
- `git diff --check`;
- search confirms no active legacy validator or 12–72 credential constants;
  and
- the frontend production bundle compiled successfully.

The subsequent release-file postbuild stopped because the existing local
`REACT_APP_PUBLIC_SITE_URL` is not a confirmed production origin. The
configuration was not changed or printed. A complete release build remains an
environment gate requiring the approved public origin; source compilation
itself succeeded.

## Authorization boundary

This work did not:

- add, download, or select a production blocklist;
- change `.env` or process-independent configuration;
- enable Argon2 writes;
- change Argon2 parameters;
- perform login-time rehash;
- rewrite or inspect stored account hashes;
- run a migration;
- select a production target or public origin;
- deploy; or
- claim production readiness.

The next production-shaped action requires the exact target instance and
runtime, latency/memory/concurrency budget, blocklist source and owner,
configuration custody, rollout/rollback owners, window, and explicit execution
permission.
