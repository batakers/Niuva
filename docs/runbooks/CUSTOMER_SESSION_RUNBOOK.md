# Customer Session Runbook

## Scope

This runbook covers customer login, refresh rotation, replay response, logout,
and session revocation. It does not authorize Migration 007, shared or
production database mutation, environment changes, deployment, or merge.

The approved production topology is same-origin HTTPS. Customer access and
refresh credentials use host-only `Secure`, `HttpOnly`, `SameSite=Lax`
cookies. The CSRF cookie is host-only, `Secure`, and `SameSite=Lax`, but is
JavaScript-readable for double-submit. `AUTH_COOKIE_DOMAIN` must be empty.
Access lifetime is 15 minutes and refresh lifetime is 7 days. Production
runtime bearer authentication is not supported.

Never copy access, refresh, or CSRF values; token hashes; passwords; raw session
documents; email addresses; IP addresses; or user-agent values into logs,
tickets, reports, or chat.

## Preflight

1. Verify the browser and `/api` use the exact `PUBLIC_SITE_URL` origin over
   HTTPS.
2. Verify the proxy preserves HTTPS and does not rewrite the `Origin` header.
3. Verify `AUTH_COOKIE_DOMAIN` is empty and `AUTH_COOKIE_SECURE=true` outside
   development, demo, and test.
4. Confirm MongoDB readiness before enabling customer authentication traffic.
5. Run unit and isolated MongoDB integration tests. Do not use a shared
   database for the integration test.

## Expected Behavior

- Login rejects missing or mismatched Origin with a generic verification error.
- Authentication failures do not reveal whether an account exists.
- Refresh requires the refresh cookie and matching CSRF cookie/header.
- Refresh rotates the opaque secret atomically. Reuse or a concurrent loser
  revokes the entire session family.
- Logout revokes by refresh session when available. If the refresh cookie is
  missing or malformed, a valid signed access cookie is used only to locate and
  revoke the family.
- Login, refresh, logout, and all other `/api/auth/*` responses include
  `Cache-Control: no-store`.
- Logout clears access, refresh, and CSRF cookies even if no session is found.

## Verification

From the repository root:

```bash
backend/.venv/bin/python -m pytest -c backend/pytest.ini -n 0 -q \
  backend/tests/test_secure_cookie_sessions.py \
  backend/tests/test_auth_security.py \
  backend/tests/test_reset_password.py
```

The real-Mongo test is opt-in and must point to an approved disposable replica
set. It creates a unique database and drops only that database in cleanup:

```bash
NIUVA_RUN_REAL_TRANSACTION_TESTS=1 \
MONGO_TRANSACTION_TEST_URL='<approved-disposable-replica-set-url>' \
backend/.venv/bin/python -m pytest -c backend/pytest.ini -n 0 -q \
  backend/tests/test_customer_session_integration.py
```

## Incident Response

On refresh replay, keep the family revoked and require a fresh login. On
unexpected Origin/CSRF failures, verify topology and proxy behavior; never
weaken Origin, Secure-cookie, or CSRF checks as a workaround. On database
unavailability, stop session mutation and report readiness failure. Do not
repair session documents manually.

For rollback, revert the application revision while preserving server-side
revocation and host-only secure cookies. Do not restore runtime bearer transport
or JavaScript-readable access/refresh credentials.
