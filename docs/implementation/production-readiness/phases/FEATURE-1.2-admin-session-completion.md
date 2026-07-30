# Feature 1.2 — Admin Session Bounded Completion

Status: **Bounded source and isolated evidence complete; production blocked**

Date: 29 July 2026

Branch: `audit/backend-admin-session-completion`

Authority: `DEC-AUTH-005`, `DEC-AUTH-012`, and explicit Project Owner
authorization on 29 July 2026

## Outcome

AS-002 is closed for the approved forced re-login policy. A real-browser
journey proves that the first tab can establish an Admin session, replay from a
second tab receives a terminal `401`, and the original tab is also redirected
to Admin login when it next refreshes. No browser-readable Admin credential or
cross-tab credential channel was introduced.

Migration 009 apply, bounded 90-day cleanup, rollback, and Admin rotation/replay
behavior were exercised on a local disposable MongoDB replica set. Each real
test used a generated database name and dropped only that database in
`finally`. Migration 009 was not run on the application database.

AS-001 remains open. Production HTTPS/proxy, monitoring, cutover, restore,
deployment, and observation evidence is outside this authorization.

## Verification

Browser journey:

```bash
cd frontend
PLAYWRIGHT_START_SERVER=true \
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3105 \
PORT=3105 \
npx playwright test e2e/admin-session-cross-tab.spec.js --project=desktop
```

Result: `1 passed` in 16.0 seconds. The desktop Chromium journey passed
without retry.

Disposable replica-set drill:

```bash
NIUVA_RUN_REAL_TRANSACTION_TESTS=1 \
MONGO_TRANSACTION_TEST_URL='mongodb://127.0.0.1:27019/?replicaSet=rs0' \
backend/.venv/bin/python -m pytest -c backend/pytest.ini -n 0 -q \
  backend/tests/test_auth_session_transaction_integration.py \
  backend/tests/test_auth_session_migration.py
```

Result: `7 passed` in 0.57 seconds, including Migration 009
apply/cleanup/rollback and concurrent rotation/replay revocation.

Focused frontend auth regression:

```bash
cd frontend
npm test -- --watchAll=false --runInBand \
  --testPathPattern='AuthContext.test.jsx|ProtectedRoute.test.jsx'
```

Result: 2 suites and 14 tests passed. The full frontend regression also passed
with 36 suites and 239 tests; the rebased full backend regression passed with
650 tests, 13 explicit skips, and 14 subtests after the latest `origin/main`
merge.

## Remaining production gates

- confirmed HTTPS public origin and same-origin routing;
- TLS termination and trusted-proxy/header sanitization evidence;
- named monitoring, incident, migration, and rollback owners;
- approved maintenance window, target, operator, reviewer, and backup custody;
- restore evidence and cutover communication;
- explicit deployment and production-activation permission.

This packet is not production readiness, deployment authority, go-live
approval, or merge authorization.
