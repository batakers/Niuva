# Feature 1.1 — Customer Session Read-Only Revalidation

Status: **revalidated — remediation and customer-session decision required**
Feature: Customer Session
Baseline: `7f47bbcb4f599410714e32d3acd6d362878f3d28`
Branch: `audit/backend-customer-session`
Revalidation date: 29 July 2026

## Outcome

The backend already has a distinct customer login surface, short-lived access
credentials, hashed single-use refresh credentials, compare-and-set refresh
rotation, replay-family revocation, logout, CSRF checks, expiry checks, and
generic login refusal.

The feature is not complete. Logout cannot revoke the server-side family when
the refresh cookie is missing, the customer cookie/origin topology has no
approved decision, sensitive customer auth responses lack an explicit
`no-store` contract, and the current customer test packet does not cover the
required negative and production-shaped cases.

This revalidation did not change source, run a migration, query shared data,
edit `.env`, deploy, push, or merge.

## Authority and inspected scope

- Customer-session work list supplied by the backend owner.
- `backend/auth_sessions.py`.
- Customer auth routes and CSRF middleware in `backend/server.py`.
- Customer session indexes in `backend/schema_manifest.py` and Migration 007.
- `backend/tests/test_secure_cookie_sessions.py`.
- Related auth, password-reset, schema, and full backend regression tests.
- `DEC-AUTH-005` only as an explicit exclusion: its approved transport policy
  governs Admin sessions and does not silently authorize customer migration.

## Verified behavior

| Requirement | Current evidence | Result |
| --- | --- | --- |
| Customer login | `/api/auth/login` uses the customer-only role boundary, generic credential refusal, limiter, and server-side session issuance | Pass |
| Refresh rotation | Raw refresh value is not stored; a hash is stored and replaced with a compare-and-set update | Pass |
| Logout | Valid refresh cookie resolves and revokes the active family; cookies are always cleared | Partial — CS-001 |
| CSRF customer | Refresh validates synchronizer cookie/header/hash; other authenticated mutations, including logout, pass through the cookie CSRF middleware | Pass with decision gap CS-002 |
| Expiry | JWT expiry and server-side session expiry are both checked | Source pass; coverage gap CS-004 |
| Replay | Reusing a rotated refresh credential revokes the family and returns generic HTTP 401 | Pass; outage/concurrency evidence incomplete |
| Generic login failure | Unknown, invalid, blocked, wrong-surface, and unsupported-policy users receive the same HTTP 401 login detail | Pass |
| Schema | Migration 007 declares unique session ID, family/user status indexes, and expiry TTL | Present; migration was not run |

## Findings

### CS-001 — Logout revocation depends only on the refresh cookie

Severity: **high**

`AuthSessionService.logout` looks up the session family only from
`niuva_refresh`. If that cookie is absent or malformed while a valid
`niuva_access` cookie remains, logout clears browser cookies but leaves the
server session active. A copied access credential can remain usable until its
15-minute expiry, and a separately retained current refresh credential remains
valid until rotation, revocation, or session expiry.

Required remediation: safely resolve the current session from a verified access
credential when refresh lookup is unavailable, revoke the same family, keep the
public logout response idempotent, and add missing/malformed-refresh tests.

### CS-002 — Customer cookie and login-origin policy is not approved

Severity: **decision blocked**

Customer cookies currently use `SameSite=Lax`, configurable Domain, non-`__Host`
names, and environment-controlled Secure mode. Customer login is exempt from
the cookie CSRF middleware and has no explicit origin verification. This may be
valid for an approved same-site topology, but `DEC-AUTH-005` explicitly excludes
customer-session migration and says topology changes reopen cookie, SameSite,
CORS, CSRF, and handoff design.

Required decision: approve the supported customer frontend/API topology,
cookie host/domain/path/SameSite contract, login-CSRF/origin policy, and legacy
client compatibility before claiming production readiness.

### CS-003 — Customer auth responses have no explicit no-store contract

Severity: **medium**

Customer login, refresh, logout, and `/auth/me` return ordinary FastAPI
responses without the explicit `Cache-Control: no-store` used by the Admin
session surface. They do not return raw credentials in JSON, but the responses
contain account/session state and should have a deterministic non-cacheable
contract.

Required remediation: return or apply a customer auth response policy with
`Cache-Control: no-store` and test it on success and failure paths.

### CS-004 — Customer-session verification is incomplete and order-dependent

Severity: **medium**

The dedicated customer file contains two tests. It proves the main cookie
rotation/replay journey and limiter behavior using an in-memory collection, but
does not prove:

- access and refresh expiry at their exact boundaries;
- concurrent refresh outcomes;
- logout with missing/malformed refresh;
- disabled/review-blocked/token-version revocation through customer cookies;
- production-shaped Secure, SameSite, Domain, and Path attributes;
- session-store failure during issue, rotation, replay revocation, and logout;
- a real isolated MongoDB session-index/rotation path; or
- response `no-store` behavior.

The auth suite is also import-order dependent. Running
`test_secure_cookie_sessions.py` before `test_auth_security.py` leaves
`PUBLIC_SITE_URL` loaded from the local `.env`, causing four Admin-origin tests
to fail. Running the complete suite in its normal collection order passes.
Auth tests must establish their environment before any `server` import.

Required remediation: add a hermetic customer-session test module, real
isolated-store evidence where relevant, and an environment-order regression
test.

## Verification evidence

Dedicated customer session:

```text
backend/.venv/bin/python -m pytest -c backend/pytest.ini -n 0 -q \
  backend/tests/test_secure_cookie_sessions.py

2 passed in 3.76s
```

Full backend baseline:

```text
backend/.venv/bin/python -m pytest -c backend/pytest.ini -n 0 -q backend/tests

555 passed, 11 skipped, 14 subtests passed in 26.92s
```

Order-dependence reproduction:

```text
backend/.venv/bin/python -m pytest -c backend/pytest.ini -n 0 -q \
  backend/tests/test_secure_cookie_sessions.py \
  backend/tests/test_auth_security.py \
  backend/tests/test_reset_password.py \
  backend/tests/test_security_schema_migration.py

15 passed, 4 failed
```

All four failures were Admin-origin assertions caused by the ambient
`PUBLIC_SITE_URL`; the two dedicated customer tests passed.

## Gate and handoff

The safe next branch after review is `fix/backend-customer-session`. It may fix
CS-001, CS-003, and test hermeticity without running Migration 007. Any change
to cookie topology or login-origin behavior under CS-002 requires the explicit
customer-session decision first.

Migration 007 remains separately blocked by approved target, backup/restore
evidence, maintenance window, custody, and explicit execution permission.
