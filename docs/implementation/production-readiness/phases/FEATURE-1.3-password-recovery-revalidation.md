# Feature 1.3 — Password Recovery Read-Only Revalidation

Status: **revalidated — remediation and production-delivery evidence required**
Feature: Password Recovery
Baseline: `1200340f4eab634d608d331f3a830c7ccb258212`
Branch: `audit/backend-password-recovery`
Revalidation date: 29 July 2026

## Outcome

The shared Admin/Customer recovery implementation already provides the approved
forgot-password, validation, and completion interfaces. It uses a generic public
request result, eligible-account checks, 256-bit random single-use tokens,
hash-only persistence, a 30-minute expiry, successor invalidation, transactional
password reset, sibling-token invalidation, session-version increment, Admin and
Customer session revocation, no automatic login, and an ephemeral frontend
token flow.

The feature is not ready to close. Missing provider configuration currently
returns a `mock` delivery result that is treated as success, leaving an active
token for an email that was never sent. Required production delivery evidence
is also unavailable, and the verification packet does not directly prove all
failure, timing, and dual-session-revocation cases.

This revalidation changed no backend or frontend source, ran no application
migration, queried no shared database, sent no real email, and did not edit
`.env`, commit, push, deploy, or create a pull request.

## Authority and inspected scope

- Feature 1.3 work list supplied by the backend owner.
- `DEC-AUTH-003` shared recovery contract.
- `backend/auth_recovery.py`.
- Recovery handlers and limiter calls in `backend/server.py`.
- Dedicated recovery delivery in `backend/emailer.py`.
- Migration 008 and its recovery safety runbook.
- Backend recovery, password, route, security, transaction, capability, and
  migration tests.
- Frontend forgot/reset pages, state routes, and focused tests.
- Disposable MongoDB replica-set evidence on a unique automatically removed
  test database.

## Verified behavior

| Requirement | Current evidence | Result |
| --- | --- | --- |
| Forgot password | Shared `POST /api/auth/forgot-password` handler and module interface exist for eligible Admin and Customer accounts | Pass |
| Generic recovery response | Known, unknown, blocked, persistence-failure, and provider-failure paths return the same public status/body | Pass, with timing gap PR-002 |
| Token randomness and storage | `secrets.token_urlsafe(32)` supplies at least 256 bits; only SHA-256 is persisted | Pass |
| Token expiry | Token TTL is fixed at 30 minutes; unknown, expired, and used values share one invalid result | Pass |
| One active token | Successor issuance transactionally invalidates earlier active tokens; Migration 008 declares the partial unique index | Pass in source/tests; migration not run on application data |
| Single use and replay | In-memory and five repeated real-Mongo concurrent completion tests yield exactly one success | Pass |
| Transactional reset | Token claim, password write, token-version increment, sibling invalidation, and both session-store revocations share one transaction | Pass in source and isolated Mongo evidence |
| Revoke all sessions | `admin_sessions` and `auth_sessions` are explicitly revoked and token version is incremented | Source pass; direct evidence gap PR-003 |
| No automatic login | Completion returns only an allowlisted status/message and the frontend sends the user to the login route | Pass |
| Delivery failure | Explicit provider errors invalidate the token and keep the public result generic | Partial — PR-001 |
| Post-reset notice | Notification contains neither password nor reset token; notification failure cannot roll back a completed reset | Source pass; negative-test gap PR-003 |
| Reset URL safety | Backend-only validated HTTPS origin is used; request host/origin/forwarded headers cannot select it | Pass |
| Frontend token containment | URL token is captured once, removed with `history.replaceState`, retained only in component memory, and validated before form display | Pass |
| Production delivery | No approved production-provider/configuration, actual delivery, monitoring, or support evidence was exercised | Blocked — PR-004 |

## Findings

### PR-001 — Missing email-provider configuration leaves an undelivered token active

Severity: **high**

`_send_provider_email` returns `{"status": "mock"}` when `RESEND_API_KEY` is
empty. `PasswordRecoveryDelivery.send_password_reset` raises only when the
status is `error`, so `mock` is treated as successful delivery. The recovery
module consequently retains the newly issued active token although no reset
email was sent.

This conflicts with the delivery-failure contract requiring an undelivered
token to be invalidated where possible. It also makes a missing production
secret look operationally successful.

Required remediation: make non-local missing-provider configuration fail closed
through the token-invalidation path, explicitly constrain mock delivery to an
approved local/test mode, and add tests proving both modes.

### PR-002 — Account-enumeration timing is not controlled or evidenced

Severity: **medium**

Known eligible accounts perform transaction and provider work while unknown,
disabled, or review-blocked accounts return before those operations. Public
status and body are equal, but there is no timing policy, equalization control,
or statistical production-shaped evidence for the required controlled
timing/failure behavior.

Required remediation: define the acceptable timing control with the security
owner, implement it if required, and add non-flaky bounded evidence without
logging account identifiers.

### PR-003 — Negative and session-revocation evidence is incomplete

Severity: **medium**

The implementation updates both session collections, but the real Mongo
recovery test creates no active Admin or Customer session and therefore does
not assert their stored revocation state. The route test proves an old Customer
login state is rejected through `token_version`, not that both session
collections were mutated. There is also no direct test for:

- post-reset notification-provider failure after a successful commit;
- failure of the transaction used to invalidate an undelivered token;
- transaction rollback including `auth_sessions` in the in-memory route guard;
  or
- active Admin and Customer sessions revoked in the same real transaction.

Required remediation: extend the isolated fault packet with both session types,
direct stored-state assertions, notification failure, invalidation failure, and
complete rollback snapshots.

### PR-004 — Production delivery evidence and ownership are unavailable

Severity: **operational blocker**

This audit intentionally sent no real email and did not select or activate a
provider. There is no evidence for exact production origin/provider
configuration, inbox delivery and expiry, redacted failure telemetry,
monitoring/alert ownership, retry/support procedure, or secret/configuration
custody.

Required handoff: obtain the approved provider and public origin, environment
owner, redacted evidence procedure, monitoring owner, support owner, test
recipient, and explicit production-shaped execution permission. This audit does
not grant any of those permissions.

## Verification evidence

Focused backend recovery and transaction packet:

```text
backend/.venv/bin/python -m pytest -c backend/pytest.ini -n 0 -q -rs \
  backend/tests/test_auth_password.py \
  backend/tests/test_auth_recovery.py \
  backend/tests/test_auth_recovery_migration.py \
  backend/tests/test_auth_recovery_transaction_integration.py \
  backend/tests/test_reset_password.py \
  backend/tests/test_auth_security.py \
  backend/tests/test_transaction_guard.py \
  backend/tests/test_transaction_execution.py \
  backend/tests/test_database_capabilities.py

76 passed, 2 skipped in 18.29s
```

The two skips are the explicit real-replica-set tests run separately below.

Disposable real MongoDB recovery transaction and Migration 008 test packet:

```text
NIUVA_RUN_REAL_TRANSACTION_TESTS=1 \
MONGO_TRANSACTION_TEST_URL=mongodb://127.0.0.1:27019/?replicaSet=rs0 \
backend/.venv/bin/python -m pytest -c backend/pytest.ini -n 0 -q -rs \
  backend/tests/test_auth_recovery_transaction_integration.py \
  backend/tests/test_auth_recovery_migration.py

13 passed in 1.59s
```

The tests used unique databases and removed them in cleanup. Migration 008 was
not run against the application database.

Focused frontend recovery packet:

```text
npm test -- --watchAll=false --runInBand \
  --testPathPattern='ForgotPassword.test.jsx|ResetPassword.test.jsx'

2 suites passed, 7 tests passed in 0.923s
```

Full regressions:

```text
backend/.venv/bin/python -m pytest -c backend/pytest.ini -n 0 -q -rs backend/tests

571 passed, 12 skipped, 14 subtests passed in 32.53s
```

```text
npm test -- --watchAll=false --runInBand

32 suites passed, 229 tests passed in 3.071s
```

## Gate and handoff

The safe implementation branch after review is
`fix/backend-password-recovery`. It may remediate PR-001 and add the local fault
tests in PR-002/PR-003 without running Migration 008 or activating a provider.

Production delivery work under PR-004 remains blocked until the exact
provider/origin, target environment, evidence recipient, monitoring and support
owners, secret custody, test window, and explicit execution permission are
available.

Migration 008 remains separately blocked by an approved target, encrypted
backup and restore evidence, maintenance window, custody, rollback owner, and
explicit execution permission.
