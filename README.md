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

- Python 3.12 locally; CI additionally verifies the repository's pinned
  Python 3.14.3 target
- Node.js 22 or newer
- Docker with Compose
- MongoDB replica-set capability for mutation work

Backend:

```bash
cp backend/.env.example backend/.env
python3.12 -m venv backend/.venv
backend/.venv/bin/python -m pip install -r backend/requirements.txt
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
does not exist; it never resets an existing password.

## Database migration

Migration 007 is dry-run by default and its report contains counts/index names,
not duplicate values or personal data:

```bash
cd backend
.venv/bin/python -m migrations.007_security_publication_schema
```

Applying it requires reviewed backup evidence:

```bash
.venv/bin/python -m migrations.007_security_publication_schema \
  --apply \
  --backup-evidence /absolute/path/to/reviewed-backup-manifest.json
```

Do not apply a migration with duplicate preflight failures. Review a redacted
mapping, rehearse backup restoration on a clone, apply in non-production first,
verify readiness, and confirm a second apply reports `already_applied`.

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
explicit external smoke job.

See `backend/README.md` for API/session, readiness, worker, migration, and
backend test details.
