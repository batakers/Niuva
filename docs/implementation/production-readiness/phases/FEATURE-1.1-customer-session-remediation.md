# Feature 1.1 — Customer Session Remediation Evidence

Evidence date: 29 July 2026  
Branch: `fix/backend-customer-session`  
Read-only audit commit: `1585c4f`  
Implementation commit: `17cf0c7`  
Decision: `DEC-AUTH-010`

## Outcome

The source-and-test scope for Feature 1.1 Customer Session is complete on this
branch. The implementation closes the four findings recorded by the read-only
revalidation:

| Finding | Resolution | Evidence |
| --- | --- | --- |
| CS-001 | Logout now falls back to a correctly signed current-policy access cookie when the refresh cookie is missing, malformed, or unresolved. The access token is used only to locate and revoke the server-side family. | Unit tests cover missing and malformed refresh cookies; isolated MongoDB test verifies the persisted family is revoked. |
| CS-002 | Customer transport, lifetime, Origin, CSRF, revocation, cache, and compatibility policy is approved and recorded. | `DEC-AUTH-010` and the Decision Register. |
| CS-003 | Every `/api/auth/*` response, including handled errors, is marked `Cache-Control: no-store`. | Login, limiter, CSRF, refresh, replay, logout, and current-session assertions. |
| CS-004 | Test setup establishes the customer Origin and host-only cookie policy before importing the application. Coverage now includes Origin, production-shaped cookies, expiry, token-version invalidation, concurrency, replay, and logout fallback. | Focused and full backend suites listed below. |

Customer login now verifies the exact approved Origin. Customer cookies are
host-only, and startup rejects non-empty `AUTH_COOKIE_DOMAIN`. Access and
refresh lifetimes remain 15 minutes and 7 days. Runtime bearer support remains
test-only.

## Verification Evidence

Focused authentication and schema tests:

```text
26 passed, 1 skipped in 23.17s
```

The skipped case was the explicitly opt-in real-Mongo test.

Isolated MongoDB replica-set evidence:

```text
backend/tests/test_customer_session_integration.py
1 passed in 0.36s
```

The disposable test used a unique database, verified atomic refresh rotation,
family revocation after concurrent replay, and access-cookie logout fallback,
then dropped only that database.

Full backend regression:

```text
562 passed, 12 skipped, 14 subtests passed in 17.65s
```

Additional gates passed:

- Python compileall;
- critical Flake8 checks (`E9,F63,F7,F82`);
- Black and isort checks for changed Python files;
- MyPy with the repository's security-boundary options for
  `backend/auth_sessions.py`; and
- `git diff --check`.

## Authorization Boundary

No migration was executed or edited. No `.env`, shared/staging/production
database, provider, deployment, activation, or merge was changed. The real
MongoDB evidence was limited to an already-available isolated local replica
set.

Production topology/proxy observation and production runtime evidence remain
deployment gates, not incomplete source work. They require a separately
approved target, window, operator, and deployment authorization.
