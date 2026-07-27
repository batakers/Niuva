# NIUVA Backend

The backend is a FastAPI application backed by MongoDB. Cross-collection
mutations fail closed unless replica-set transactions are available and
`TRANSACTION_MUTATIONS_ENABLED=true`.

## Environment contract

Copy `.env.example` to `.env`. Required values are:

- `MONGO_URL`, `DB_NAME`
- `JWT_SECRET` (long random value)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` for one-time bootstrap
- exact credentialed `CORS_ORIGINS`

Cookie defaults:

- access: HttpOnly, 15 minutes;
- refresh: HttpOnly, seven absolute days, single-use rotation;
- CSRF: readable cookie mirrored in `X-CSRF-Token`;
- `Secure` is enabled outside development/test. Production startup rejects
  `AUTH_COOKIE_SECURE=false`;
- `AUTH_COOKIE_DOMAIN` is optional and should normally remain unset.

`TRUST_PROXY_HEADERS=false` is the safe default. Enable it only behind a proxy
that overwrites client forwarding headers.

## Authentication contract

- `POST /api/auth/login`: customer roles only
- `POST /api/auth/admin/login`: internal staff roles only
- `POST /api/auth/refresh`: rotate refresh session
- `POST /api/auth/logout`: revoke session family and clear cookies
- successful login/refresh responses contain `{user}`, never a bearer token
- blocked/unknown/wrong-surface login returns generic HTTP 401

State-changing cookie requests must send `X-CSRF-Token` equal to the CSRF
cookie. Bearer support exists only when `NIUVA_TEST_BEARER_AUTH=true` in
isolated tests; it must never be enabled in a runtime environment.

## Capability and health endpoints

- `GET /api/health/live`: process liveness
- `GET /api/health/ready`: DB ping, transactions, schema/index version, required
  notification worker, and required email capability; HTTP 503 on failure
- `GET /api/capabilities`: active/inactive user-facing capability contract

`NOTIFICATION_WORKER_ENABLED=true` starts the Mongo-leased delivery worker.
Set `NOTIFICATION_WORKER_REQUIRED=true` only where readiness should require it.
`EMAIL_DELIVERY_REQUIRED=true` additionally requires configured Resend
credentials. Multiple workers coordinate through atomic leases and idempotent
delivery keys.

Production upload, payment, Retail transactions, and Organization Portal remain
inactive regardless of UI state.

## Schema and migrations

Startup inspects schema/index state but does not create the active schema.
Migration 007 owns secure session, reset/invitation, publication, file metadata,
notification, and other required indexes. It never creates active organization
collections.

Dry-run:

```bash
cd backend
.venv/bin/python -m migrations.007_security_publication_schema
```

Apply only after backup, redacted duplicate review, and rollback rehearsal:

```bash
.venv/bin/python -m migrations.007_security_publication_schema \
  --apply \
  --backup-evidence /absolute/path/to/reviewed-backup-manifest.json
```

Rollback is restoration from the reviewed backup on the approved migration
window; do not hand-delete indexes or reconstructed publication/session data.

## API conventions

- Strict request models reject unexpected fields for sensitive mutations.
- CAS mutations require `expected_version`; audited mutations require `reason`.
- Errors return `error.code`, `error.message`, optional `error.details`, and
  `request_id`. The old `detail` field remains temporarily for compatibility.
- Responses include `X-Request-ID`.
- Growing public catalog lists use cursor pagination.
- CSV exports neutralize spreadsheet formula prefixes.

## Tests

Hermetic suite:

```bash
cd ..
backend/.venv/bin/python -m pytest \
  -c backend/pytest.ini backend/tests -q
```

The pytest filename contract excludes `backend_test.py`, which is a legacy
external-live-server smoke suite. Run that only through the explicit external
job with a non-secret target URL.

Compile without traversing the local virtual environment:

```bash
find backend -path 'backend/.venv' -prune -o -name '*.py' -print0 \
  | xargs -0 backend/.venv/bin/python -m py_compile
```

Real transaction tests are mandatory in
`.github/workflows/transaction-tests.yml`.
