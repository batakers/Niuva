# Niuva Backend Auth Phase A — Login Issuance Plan

Status: **Context Only — Prepared for Review — Implementation Not Authorized**
Prepared: 25 July 2026
Scope: Generic login failure, blocked-account token issuance, supported legacy
customer compatibility, and equivalent password-verification work

## 1. Authority and Gate

This bounded plan is governed by:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. `docs/decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md`;
5. `docs/decisions/access/DEC-AUTH-001-login-failure-and-legacy-compatibility.md`;
6. `docs/decisions/access/DEC-AUTH-002-rate-limit-topology-deferral.md`;
7. current source and tests.

This plan authorizes no source edit, commit, push, rollout, or production
activation. A separate explicit implementation approval is required.

## 2. Bounded Outcome

A later approved implementation must:

- return `401 Invalid email or password` for unknown email, wrong password,
  disabled account, and `access_review_required`;
- issue no access token or token-bearing cookie for those outcomes;
- preserve the supported low-privilege legacy `role: client` compatibility
  shape;
- keep legacy internal/admin markers fail closed;
- prevent the unknown-email path from skipping the password-verification work
  class used for a known account;
- preserve current active canonical customer and internal login behavior;
- preserve the separate admin permission check after successful
  authentication.

## 3. Explicit Exclusions

Phase A does not include:

- login rate limiting or shared-store selection;
- password minimum/maximum, composition, compromised-password screening,
  algorithm/cost migration, or rehash;
- access-token TTL, claims, signing-key rotation, refresh, logout, revocation,
  cookie transport, or frontend storage changes;
- new persistent login-attempt/security audit events;
- canonical granular-role migration;
- account data migration;
- public registration, password reset, MFA, SSO, or identity-provider work;
- production rollout.

The unbounded-input finding remains open under `AUTH-DEC-06`; this Phase A
slice must not choose a password boundary indirectly.

## 4. Current Source Boundary

Current relevant implementation is in `backend/server.py`:

- `verify_password`;
- `create_token`;
- `auth_response`;
- `authenticate_credentials`;
- `POST /api/auth/login`;
- `POST /api/auth/admin/login`.

Current regression coverage is primarily in:

- `backend/tests/test_auth_security.py`;
- `backend/tests/test_permissions.py`;
- `backend/tests/test_identity_foundation.py`.

No new runtime dependency is planned.

## 5. Planned Implementation Shape

The exact implementation remains subject to code review, but it must preserve
these boundaries:

1. Define one generic authentication-failure response used by every
   `DEC-AUTH-001` failure outcome.
2. Look up the normalized email without logging it as a credential payload.
3. Select the stored password hash only when it is a valid hash value; otherwise
   use a fixed valid non-secret dummy hash or an equivalent reviewed
   constant-work verification path.
4. Invoke password verification exactly once for unknown, malformed-hash,
   wrong-password, blocked, and successful credential paths.
5. After verification, reject when:
   - the user does not exist;
   - the stored password hash is missing or invalid, regardless of the dummy
     verification result;
   - the password is invalid;
   - status is explicitly disabled;
   - access state is explicitly `access_review_required`;
   - the current fail-closed role resolver yields no supported canonical or
     approved legacy-customer compatibility role.
6. Treat missing newer fields as compatible only for the existing
   low-privilege legacy `role: client` shape recognized by the resolver.
7. Call `auth_response` only after the account passes every Phase A check.
8. Keep `admin.access` enforcement in the admin route after successful
   authentication; an active authenticated customer remains `403` on the admin
   login endpoint rather than being treated as a credential failure.
9. Do not create new persistent login-attempt audit records in this phase.

The dummy hash is not a secret and must never be generated per request. Its
algorithm/cost compatibility with current stored hashes must be reviewed
without selecting the future password-migration policy.

## 6. Target File Map

Permitted source scope for a later approved implementation:

- modify `backend/server.py`;
- modify `backend/tests/test_auth_security.py`.

Conditional test-only scope:

- add `backend/tests/test_auth_login_issuance.py` only if isolation from the
  existing large auth matrix materially improves deterministic testing.

Stop and request approval if implementation requires:

- any other backend source module;
- a database migration or index;
- frontend changes;
- a dependency change;
- persistent audit/event storage;
- configuration or deployment changes.

## 7. Test-First Matrix

### Generic failure and no issuance

For both customer and admin login where applicable:

| Case | Expected public result | Token issuance |
|---|---|---|
| Unknown email | `401 Invalid email or password` | Never |
| Known email, wrong password | `401 Invalid email or password` | Never |
| Disabled account, valid password | `401 Invalid email or password` | Never |
| `access_review_required`, valid password | `401 Invalid email or password` | Never |
| Missing/malformed stored hash | `401 Invalid email or password` | Never |

Tests must fail if `auth_response` or `create_token` is called for any row.

### Equivalent verification work

- password verification is invoked once for unknown and known identifiers;
- the unknown path uses the reviewed valid dummy/equivalent hash;
- tests assert call path and invocation count, not unreliable wall-clock
  equality;
- no per-request bcrypt hash generation occurs;
- exception behavior from malformed stored hashes remains generic and
  fail-closed.

### Compatibility

- supported legacy `role: client` with valid password and missing newer fields
  can still use customer login;
- explicitly disabled legacy client is rejected;
- explicitly review-blocked legacy client is rejected;
- legacy `admin`, `warehouse`, and other superseded internal markers receive no
  token;
- active canonical retail and organization customers remain compatible;
- active current internal roles retain existing successful login behavior;
- active customer with valid credentials remains `403` on admin login because
  it lacks `admin.access`;
- public registration remains disabled.

### Token-use regression

Phase A must not weaken existing behavior:

- malformed and expired token fail closed;
- deleted and disabled user token fail closed;
- token role claim cannot override database permissions;
- password hashes and raw tokens remain absent from user projections and
  evidence.

## 8. Verification Gates

Run from repository root.

Targeted tests:

```bash
backend/.venv/bin/python -m pytest -q -rs backend/tests/test_auth_security.py
```

If the conditional focused test file is approved:

```bash
backend/.venv/bin/python -m pytest -q -rs backend/tests/test_auth_login_issuance.py
```

In-process regression:

```bash
backend/.venv/bin/python -m pytest -q -rs --ignore=backend/tests/backend_test.py
backend/.venv/bin/python -m pip check
```

Clean-checkout configured suite:

```bash
backend/.venv/bin/python -m pytest -q -rs
```

The external integration suite and MongoDB replica-set suites remain separate
environment gates. Skips must be documented and must not be represented as
passed integration evidence.

## 9. Commit Boundary

If implementation is later approved:

1. add failing Phase A tests;
2. implement the minimum login issuance change;
3. run all verification gates;
4. review the diff against the approved two-file scope;
5. request separate commit/push approval.

Do not combine Phase A with rate limiting, password-policy changes,
token/session modernization, role migration, or frontend auth work.

## 10. Rollback

Rollback is a source revert of the bounded Phase A commit. It requires:

- no user-data deletion or migration rollback;
- no secret rotation;
- targeted auth tests after revert;
- clean-checkout regression after revert;
- explicit acknowledgement that reverting the implementation reopens the
  blocked-account token-issuance finding.

No persistent limiter/session/audit state is created by this phase.

## 11. Stop Conditions

Stop without implementation or publication if:

- code cannot preserve supported legacy customer compatibility;
- equivalent-work verification requires selecting a new password
  algorithm/cost;
- a new module, dependency, configuration, migration, or persistent event store
  becomes necessary;
- tests reveal a role-policy conflict not resolved by current authority;
- requested behavior would expose blocked-account state;
- the approved two-file scope is insufficient.

## 12. Readiness for Implementation Review

Phase A is ready to be considered for separate implementation approval only
when reviewers confirm:

- it applies `DEC-AUTH-001` exactly;
- it respects the `DEC-AUTH-002` rate-limit deferral;
- its compatibility cases match the current resolver;
- test-first and rollback gates are sufficient;
- no other open auth policy is being silently selected.
