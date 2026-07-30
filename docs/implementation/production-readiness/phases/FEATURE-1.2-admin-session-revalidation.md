# Feature 1.2 — Admin Session Read-Only Revalidation

Audit date: 29 July 2026

Branch: `audit/backend-admin-session`

Baseline: `1200340f4eab634d608d331f3a830c7ccb258212` (`origin/main`)

Authority: `DEC-AUTH-005` and the approved Admin Authentication Phase 2 packet

## Outcome

The Admin Session source-and-local-test baseline is substantially implemented
and passes revalidation. This audit did not identify a source defect requiring
immediate remediation for the requested controls. Production acceptance remains
blocked because HTTPS/proxy, deployment, monitoring, cutover, and observation
evidence is not available.

No migration, `.env`, shared/staging/production database, deployment, provider,
commit from another feature, or production setting was changed during this
audit.

## Control Matrix

| Control | Current implementation | Result |
| --- | --- | --- |
| `__Host-` cookies | Access and rotating session cookies use `__Host-` names with `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/`, and no `Domain`. Response bodies and JavaScript-readable storage expose no Admin session credential. | Pass locally |
| Remember-me | Defaults off. Default session cookie is non-persistent; explicit remember-me makes the rotating session cookie persistent for at most seven days. | Pass locally |
| Idle and absolute expiry | Access is 15 minutes. Default idle/absolute limits are 30 minutes/8 hours; remembered limits are 8 hours/7 days. Activity cannot extend the absolute boundary. | Pass locally |
| Refresh rotation | Refresh uses the opaque rotating session secret, rotates access/session/CSRF material atomically, preserves absolute expiry, and fails closed without transaction capability. | Pass locally and on isolated MongoDB |
| Session-family revocation | Replay revokes the family. Logout, password reset, role/access changes, user ineligibility, and token-version changes revoke or invalidate server-side sessions. | Pass locally and on isolated MongoDB |
| Admin CSRF | Non-safe authenticated requests require exact Origin/Referer plus the in-memory synchronizer token. Constant-time keyed-digest verification is covered. Refresh is the approved bootstrap exception and still requires the rotating Strict HttpOnly cookie plus exact Origin/Referer. | Pass locally |
| HTTPS/proxy compatibility | Production origin parsing requires HTTPS, cookies are always Secure, forwarded Host does not select the trusted origin, and CORS rejects wildcard credential origins. | Source boundary passes; production evidence blocked |
| Cache and browser storage | Admin session responses use `Cache-Control: no-store`; Admin credentials are not stored in `localStorage`/`sessionStorage` or JavaScript-readable cookies. | Pass locally |

## Findings and Remaining Evidence

### AS-001 — Production HTTPS/proxy and operational evidence is unavailable

Severity: production blocker; not a local source failure.

The repository cannot prove the real TLS termination boundary, proxy header
sanitization, Secure-cookie preservation, HTTP-to-HTTPS behavior, deployed
same-origin routing, MongoDB latency/readiness, monitoring destination, alert
ownership, or incident response. The approved production hostname and
deployment environment were not supplied.

The production frontend compilation completed, but the postbuild release step
correctly rejected the locally configured localhost value:

```text
REACT_APP_PUBLIC_SITE_URL must use the confirmed public production origin.
```

Do not bypass this check or change `.env` for audit evidence. Close AS-001 only
with an approved target, operator, window, exact public origin, proxy/TLS
evidence, monitoring ownership, and deployment authorization.

### AS-002 — Cross-tab forced re-login contract is closed in bounded evidence

Status: `closed_in_bounded_source_and_browser_evidence`.

The backend concurrency contract is deterministic: two uses of the same
rotating session secret yield one rotation winner, then replay detection revokes
the family. `DEC-AUTH-012` explicitly accepts forced re-login as the cross-tab
policy. The bounded Playwright journey proves a terminal refresh `401`
redirects the replaying tab and the original tab to Admin login without adding
a browser-readable credential or cross-tab credential channel.

AS-001 and production HTTPS/proxy, monitoring, migration, restore, deployment,
cutover, and observation gates remain open. Do not weaken replay-family
revocation.

## Verification Evidence

Commands below were run from repository baseline
`1200340f4eab634d608d331f3a830c7ccb258212` on macOS with Python `3.12.13`,
Node `24.18.0`, and npm `11.16.0`.

Focused backend session, route, migration, identity, and recovery suite:

```bash
backend/.venv/bin/python -m pytest -c backend/pytest.ini -n 0 -q -rs \
  backend/tests/test_auth_session.py \
  backend/tests/test_auth_security.py \
  backend/tests/test_auth_session_migration.py \
  backend/tests/test_auth_session_transaction_integration.py \
  backend/tests/test_identity_foundation.py \
  backend/tests/test_reset_password.py
```

```text
43 passed, 2 skipped in 14.82s
```

The two explicitly identified skips were:

- `test_real_replica_set_apply_cleanup_and_rollback` in
  `backend/tests/test_auth_session_migration.py`; and
- `test_real_replica_set_rotates_once_and_revokes_replayed_family` in
  `backend/tests/test_auth_session_transaction_integration.py`.

Both require `NIUVA_RUN_REAL_TRANSACTION_TESTS=1` and
`MONGO_TRANSACTION_TEST_URL`.

Isolated MongoDB Admin rotation and Migration 009 tests:

```bash
NIUVA_RUN_REAL_TRANSACTION_TESTS=1 \
MONGO_TRANSACTION_TEST_URL='mongodb://127.0.0.1:27019/?replicaSet=rs0' \
backend/.venv/bin/python -m pytest -c backend/pytest.ini -n 0 -q \
  backend/tests/test_auth_session_transaction_integration.py \
  backend/tests/test_auth_session_migration.py
```

```text
7 passed in 0.56s
```

These tests used generated database names on a disposable local replica set and
dropped only those databases. They did not run Migration 009 against the
application database. The fixture
`transaction_database_name` provides the unique database boundary and each
real-Mongo test drops that database in `finally`. No local log artifact
containing session material was retained.

Full backend regression:

```bash
backend/.venv/bin/python -m pytest -c backend/pytest.ini -q backend/tests
```

```text
571 passed, 12 skipped, 14 subtests passed in 17.37s
```

Focused frontend auth tests:

```bash
cd frontend
npm test -- --watchAll=false --runInBand \
  --testPathPattern='AuthContext.test.jsx|AdminLogin.test.jsx|api.test.js'
```

```text
2 suites passed, 23 tests passed
```

Full frontend regression:

```bash
cd frontend
npm test -- --watchAll=false --runInBand
```

```text
32 suites passed, 229 tests passed
```

The proportional documentation-PR checks are defined in
`.github/workflows/quality-gates.yml`; PR `#80` records successful backend,
frontend, and secret-scan jobs. Real transaction CI is defined in
`.github/workflows/transaction-tests.yml`; the local opt-in run above used the
same two Admin Session test paths and database isolation contract.

`npm run build` compiled the optimized frontend bundle successfully. Its
postbuild step then stopped at the intentional confirmed-production-origin gate
described in AS-001. No approved production origin was available, so a complete
release artifact was unavailable and the gate was not bypassed.

## Recommended Next Action

The bounded AS-002 follow-up is recorded in
[Feature 1.2 — Admin Session Bounded Completion](FEATURE-1.2-admin-session-completion.md).
`DEC-AUTH-012` approves forced cross-tab re-login and a Migration 009 drill only
on a disposable replica set. AS-001 and every production gate remain open.

Deployment, production migration/cutover, and production activation remain
unauthorized by this audit.
