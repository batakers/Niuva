# NIUVA Backend

The backend is a FastAPI application backed by MongoDB. Cross-collection
mutations fail closed unless replica-set transactions are available and
`TRANSACTION_MUTATIONS_ENABLED=true`.

Startup only performs the one-time configured Super Admin bootstrap and
ensures the empty public-profile settings document exists. It does not seed
sample materials, portfolio projects, published snapshots, or organization
collections.

## Environment contract

Copy `.env.example` to `.env`. Required values are:

- `MONGO_URL`, `DB_NAME`
- `JWT_SECRET` (long random value)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` for one-time bootstrap
- exact credentialed `CORS_ORIGINS`

The example is intentionally local-development configuration: it uses the
small `config/password-blocklist.development.txt` fixture and enables Argon2
writes plus transaction mutations against the local replica set so the first
bootstrap account can be created and can establish an Admin session. It is not
a production blocklist, benchmark, or migration decision. Production must
provide its approved operator-owned dataset and rollout evidence, and keep
mutations disabled until schema readiness is proven.

Customer-session defaults:

- access: HttpOnly, 15 minutes;
- refresh: HttpOnly, seven absolute days, single-use rotation;
- CSRF: readable cookie mirrored in `X-CSRF-Token`;
- `Secure` is enabled outside development/test. Production startup rejects
  `AUTH_COOKIE_SECURE=false`;
- `AUTH_COOKIE_DOMAIN` must remain empty. Customer cookies are host-only and
  startup rejects a configured cookie domain.

The currently approved Admin-specific implementation uses separate
`__Host-niuva-admin-*` Strict cookies, a 15-minute access secret, a 30-minute
idle/eight-hour absolute default session, and a seven-day absolute lifetime
only when `remember_me` is selected. Admin login/refresh responses also return
the synchronizer CSRF token and expiry metadata required by that surface.
Those Admin details conflict with the universal seven-day and literal
`{user}`-only wording in `ADR-005`; the conflict remains `Needs Clarification`
and is recorded in the Decision Register.

`TRUST_PROXY_HEADERS=false` is the safe default. Enable it only behind a proxy
that overwrites client forwarding headers.

## Authentication contract

- `POST /api/auth/login`: customer roles only, with exact `PUBLIC_SITE_URL`
  Origin verification
- `POST /api/auth/admin/login`: internal staff roles only
- `POST /api/auth/refresh` and `/api/auth/logout`: customer session rotation
  and revocation
- `POST /api/auth/admin/session/refresh` and `/api/auth/admin/logout`: current
  Admin session rotation and revocation
- customer login/refresh responses contain `{user}`; Admin responses additionally
  contain CSRF/expiry metadata; neither surface returns a bearer token
- blocked/unknown/wrong-surface login returns generic HTTP 401
- every `/api/auth/*` response includes `Cache-Control: no-store`

State-changing cookie requests must send `X-CSRF-Token` equal to the CSRF
cookie. Bearer support exists only when `NIUVA_TEST_BEARER_AUTH=true` in
isolated tests; it must never be enabled in a runtime environment.

Local Admin login diagnostics:

- use `http://localhost:3000/admin/login` so its browser `Origin` exactly
  matches `PUBLIC_SITE_URL` and `CORS_ORIGINS`;
- an HTTP 401 means the account/password/surface/role/access state was rejected
  generically; startup never replaces an existing Admin password;
- an HTTP 403 with `request_verification_failed` means the frontend origin does
  not match;
- an HTTP 503 with a transaction/session code means the replica set, mutation
  gate, CSRF key, or required schema/capability is unavailable;
- changing `ADMIN_PASSWORD` after the first bootstrap does not change the
  stored password. Use the audited recovery flow or a fresh disposable local
  database.

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

Request completion, transaction lifecycle, login/public limiter blocks,
notification batches, and reservation-expiry batches emit allowlisted
structured log fields without request bodies, credentials, recipient
addresses, or customer identifiers. Alert routing and numerical thresholds are
not selected in source and remain an operator decision.

Production upload, payment, Retail transactions, and Organization Portal remain
inactive regardless of UI state.

## Development-only media

`GET /api/admin/media/capabilities` reports whether the local adapter is
available. `POST /api/admin/media` requires `media.write` and is enabled only
when `APP_ENV` is `development`, `demo`, or `test` and
`STORAGE_BACKEND=local`. It accepts PNG/JPEG/WebP up to 10 MiB, verifies the
file signature rather than trusting the client MIME type, records ownership
and lifecycle metadata in `file_objects`, and returns a stable `media:<id>`
reference.

`GET /api/media/{file_id}` serves an active local media object only when that
exact reference is reachable from the active immutable catalog or portfolio
publication. Draft, orphaned, deleted, quarantined, and unpublished objects
remain inaccessible. No production storage provider is selected or activated.

## Schema and migrations

Startup inspects schema/index state but does not create the active schema.
Readiness requires the complete ordered chain:

- Migration 007 owns customer sessions, publication, file metadata,
  notification, and the base schema/index manifest.
- Migration 008 replaces the legacy reset-token indexes with the non-TTL,
  single-active-token recovery contract.
- Migration 009 owns the non-TTL Admin-session index and retention contract.

None of these migrations creates active organization collections.

Dry-run:

```bash
cd backend
.venv/bin/python -m migrations.007_security_publication_schema
.venv/bin/python -m migrations.008_auth_recovery_safety
.venv/bin/python -m migrations.009_admin_session_safety
```

Apply only after backup, redacted duplicate review, and rollback rehearsal:

```bash
.venv/bin/python -m migrations.007_security_publication_schema \
  --apply \
  --backup-evidence /absolute/path/to/reviewed-backup-manifest.json
```

Migration 008 and 009 apply/rollback commands have separate encrypted-backup
confirmations in `docs/runbooks/AUTH_RECOVERY_RUNBOOK.md` and
`docs/runbooks/AUTH_SESSION_RUNBOOK.md`. Rollback is performed only through
the applicable reviewed backup/runbook in the approved window; do not
hand-delete indexes, markers, or reconstructed publication/session data.

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
