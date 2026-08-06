# NIUVA Platform

NIUVA is one platform with a Business/B2B-primary public experience, a
secondary read-only Retail discovery journey, customer compatibility surfaces,
and a permission-aware Admin Studio.

Current source capabilities:

| Capability | Status |
|---|---|
| Public brand, settings, capabilities, portfolio | Active |
| Retail catalog listing and product detail | Active, read-only |
| B2B inquiry, Quote, Project, Work Order | Active in source |
| Customer/staff cookie authentication | Active in source |
| Staff governance and customer management | Active in source |
| CMS/portfolio immutable publication | Active in source |
| Local media upload for development/demo/test | Active when explicitly configured |
| Legacy order history | Read-only compatibility |
| Retail order creation, cart, checkout, payment, fulfillment | Inactive |
| New manual transfer/payment proof | Inactive |
| Production upload/storage | Inactive pending provider/readiness decisions |
| Organization Portal/active organization schema | Inactive; historical data preserved |
| Production rollout/go-live | Not authorized |

The machine-readable runtime status is available from
`GET /api/capabilities`. Readiness is `GET /api/health/ready` and intentionally
returns HTTP 503 until required database, transaction, schema/index, and enabled
worker capabilities are ready.

## Authority and documentation

Read these before changing product behavior:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. the relevant ADR/decision and runbook

The remediation implemented in this working tree is governed by
`docs/decisions/architecture/ADR-005-backend-remediation-runtime-policy.md`.
It does not authorize production migration, deployment, payment, production
storage, Organization Portal, history rewrite, or go-live.

## Local setup

Requirements:

- Python 3.14.3, declared by `.python-version`
- Node.js 22 or newer
- Docker with Compose
- MongoDB replica-set capability for mutation work

Backend:

```bash
cp backend/.env.example backend/.env
python3.14 -m venv backend/.venv
backend/.venv/bin/python -m pip install --require-hashes \
  -r backend/requirements.lock
docker compose -f docker-compose.transaction.yml up -d
cd backend
.venv/bin/python -m uvicorn server:app --reload --port 8000
```

Frontend, in another terminal:

```bash
cp frontend/.env.example frontend/.env
cd frontend
npm ci
npm start
```

Use strong, environment-specific values for `JWT_SECRET` and bootstrap
credentials. Startup creates the configured bootstrap Super Admin only when it
does not exist; it never resets an existing password. Startup does not create
sample materials or directly-published portfolio records. Operational and
public content enters through the audited authoring/publication flows.

The checked-in blocklist is a small development fixture only. The example
enables Argon2 writes solely so a fresh local database can create its one
bootstrap Admin. Production must replace the blocklist and complete the
benchmark/migration gates; do not deploy the example values. Open the local
frontend as `http://localhost:3000` (not a different host alias), because Admin
Origin validation and the `__Host-` cookie contract use that exact origin.
The example also enables transaction mutations for the local replica set;
production must keep that gate closed until the reviewed migration chain and
readiness checks pass.

With `APP_ENV=development` and `STORAGE_BACKEND=local`, authorized CMS staff
can upload PNG/JPEG/WebP media from Product and Portfolio editors. The backend
validates file signatures and size, stores DB-backed ownership/state metadata,
and only exposes a `media:<id>` reference publicly after it appears in an
active immutable catalog or portfolio publication. This adapter is never
available in production and is not approval for a production storage provider.

## Database migrations

Migrations 007, 008, and 009 form one ordered readiness chain. Every migration
is dry-run by default and reports aggregate/index state without credentials or
personal data. Run the dry-runs in order:

```bash
cd backend
.venv/bin/python -m migrations.007_security_publication_schema
.venv/bin/python -m migrations.008_auth_recovery_safety
.venv/bin/python -m migrations.009_admin_session_safety
```

Migration 007 apply requires the reviewed backup evidence manifest:

```bash
.venv/bin/python -m migrations.007_security_publication_schema \
  --apply \
  --backup-evidence /absolute/path/to/reviewed-backup-manifest.json
```

Migrations 008 and 009 additionally require their encrypted migration-metadata
backup gates. Follow `docs/runbooks/AUTH_RECOVERY_RUNBOOK.md` and
`docs/runbooks/AUTH_SESSION_RUNBOOK.md`; do not infer their apply flags from
the example above.

Do not apply any migration with preflight failures. Review a redacted mapping,
rehearse backup restoration on a clone, apply in non-production first, verify
the complete 007→008→009 readiness chain, and confirm every second apply is a
no-op.

## Verification

```bash
backend/.venv/bin/python -m pytest \
  -c backend/pytest.ini backend/tests -q

find backend -path 'backend/.venv' -prune -o -name '*.py' -print0 \
  | xargs -0 backend/.venv/bin/python -m py_compile

cd frontend
npm test -- --watchAll=false --runInBand
REACT_APP_PUBLIC_SITE_URL='' npm run build
npm run audit:production
```

Real transaction tests use `.github/workflows/transaction-tests.yml` and the
isolated `docker-compose.transaction-test.yml` replica set. The historical
live-server suite is excluded from hermetic tests and belongs only in the
explicit external smoke job. Admin role/accessibility/responsive browser
contracts require approved staging origins and dedicated role accounts; run
the manual `external-admin-e2e` workflow after configuring its documented
`E2E_*` GitHub Actions secrets.

The read-only load probe is `scripts/load_readonly_api.py`. It requires every
load shape and acceptance threshold explicitly; follow
`docs/runbooks/PERFORMANCE_READONLY_RUNBOOK.md`. The repository deliberately
does not invent an SLA or run the probe against production.

See `backend/README.md` for API/session, readiness, worker, migration, and
backend test details.
