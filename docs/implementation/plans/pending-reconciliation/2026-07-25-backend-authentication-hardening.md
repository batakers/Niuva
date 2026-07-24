# Niuva Backend Authentication Hardening Plan

Status: **Context Only — One Decision Resolved; Remaining Security Decisions and Separate Implementation Approval Pending**
Prepared: 25 July 2026
Scope: Existing customer and internal login endpoints, access-token validation,
password verification boundary, and login-abuse controls

## 1. Authority and Non-Authorization Gate

This document is a bounded implementation plan. It does not approve or perform
source changes, select infrastructure, establish production policy, migrate
accounts, rotate secrets, change the canonical role model, or authorize
production rollout.

Read authority in this order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. `docs/decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md`;
5. `docs/decisions/access/DEC-AUTH-001-login-failure-and-legacy-compatibility.md`;
6. `docs/decisions/access/DEC-AUTH-002-rate-limit-topology-deferral.md`;
7. applicable runbooks;
8. current source and tests;
9. `docs/context/BACKEND_AUDIT_TRACKER_2026-07-24.md` as context only.

Implementation may begin only after the decisions in Section 7 and the exact
implementation slice receive explicit approval. Commit, push, rollout, and
production activation remain separate actions.

## 2. Reconciliation Result

| Source | Relevant statement | Safe interpretation |
|---|---|---|
| Master Spec | Backend authorization and least privilege are mandatory; credentials and secrets must not be committed | Authentication hardening must preserve backend authorization and keep evidence redacted |
| `DEC-ACCESS-001` | Session/token invalidation and access-review rollout remain open | This plan must not invent invalidation or rollout policy |
| `DEC-AUTH-001` | Blocked/invalid login outcomes share generic `401` and issue no token; supported low-privilege legacy customers remain compatible | Phase A must implement this exact contract without broadening legacy authority |
| `DEC-AUTH-002` | Rate-limit topology/storage is unselected; limiter implementation is deferred; Phase A planning may proceed without source changes | Phase B remains blocked and process-local limiting is not promoted as production authority |
| Backend audit `BA-010` | Disabled login, rate limiting, and public-input hardening remain open | Confirmed problem context, not implementation authority |
| Auth experience remediation plan | Customer-safe errors and recovery are planned; backend authorization changes are excluded | Frontend experience work cannot authorize this backend change |
| Retail checkout candidate | Describes possible guest sessions and rate limits | Candidate only; it cannot define the existing account/session policy |
| Current runtime | Seven-day HS256 access token; bearer header plus cookie fallback; frontend stores bearer token in `localStorage` | Implementation evidence only, not an approved security policy |

No authoritative document currently defines:

- access-token lifetime;
- refresh-token or session-renewal behavior;
- logout/revocation behavior;
- issuer, audience, token ID, or session-version claims;
- password length, composition, rotation, or compromised-password policy;
- login rate-limit thresholds, windows, dimensions, or backing store;
- trusted-proxy/client-IP rules specifically for login;
- authentication-event retention, access, and privacy governance.

Those values remain decision gates rather than defaults. The disabled and
review-blocked public response is no longer open; `DEC-AUTH-001` governs it.

## 3. Verified Current State

Current backend behavior:

- `POST /api/auth/login` and `POST /api/auth/admin/login` share
  `authenticate_credentials`;
- credential lookup lowercases email and verifies a bcrypt hash;
- a disabled account with valid credentials passes authentication and receives
  a token;
- later token use is rejected with `403 User account is disabled`;
- invalid email and invalid password share `401 Invalid email or password`;
- `LoginReq.password` has no explicit length boundary;
- access tokens expire after seven days and require `sub`, `exp`, and `type`;
- the runtime does not require `iat`, `nbf`, `iss`, `aud`, `jti`, or a
  server-side session/access version;
- the frontend persists the bearer token in `localStorage`;
- the backend also accepts an `access_token` cookie, but no current backend
  route sets or clears that cookie;
- the existing `_rate_buckets` helper is process-local memory and is not
  consistent across workers, instances, or restarts;
- login routes do not call the existing rate-limit helper;
- trusted proxy handling exists for the contact endpoint only.

Existing positive controls that must remain:

- invalid and expired JWTs fail closed;
- deleted and disabled users cannot use an existing token;
- token role claims do not override current database permissions;
- public registration remains disabled;
- authentication responses and audit projections exclude password hashes and
  tokens;
- CORS rejects wildcard origins when credentials are enabled.

## 4. Goals

1. Reject disabled or review-blocked accounts before token issuance.
2. Keep authentication failures account-enumeration resistant.
3. Bound login input before expensive password verification.
4. Enforce abuse controls consistently across the approved deployment
   topology.
5. Make token/session behavior explicit, testable, revocable where approved,
   and compatible with the canonical role/access migration.
6. Define password verification and migration behavior without invalidating
   existing hashes unexpectedly.
7. Produce redacted, reproducible verification evidence.

## 5. Exclusions

This plan does not authorize:

- OAuth, social login, SSO, MFA, password reset, email verification, magic
  links, or a new identity provider;
- Retail guest checkout sessions;
- granular-role migration or permission-matrix changes;
- frontend redesign or automatic migration away from `localStorage`;
- production Redis, cache, database, proxy, or gateway selection;
- changing `JWT_SECRET`, exposing secret values, or NIV-001 closure;
- account deletion, forced password rotation, or destructive session cleanup;
- production rollout or go-live.

## 6. Threat and Failure Boundaries

The implementation must cover:

- credential stuffing and repeated password guessing;
- account enumeration through status, body, timing, or limiter behavior;
- oversized password/email input used for resource abuse;
- concurrent attempts across workers or instances;
- spoofed forwarding headers when the service is not behind an approved trusted
  proxy;
- stale tokens after disablement, access review, role migration, or credential
  change;
- limiter-store outage or ambiguous update;
- clock skew and malformed token claims;
- rollback while tokens from the previous policy still exist.

Rate-limit telemetry must never contain plaintext passwords, raw tokens, full
authorization headers, secret values, or unredacted credential payloads.

## 7. Decisions Required Before Source Implementation

### AUTH-DEC-01 — Disabled and review-blocked login response

Status: **Approved as `DEC-AUTH-001` on 25 July 2026**

Customer and admin login return `401 Invalid email or password` and issue no
token for unknown email, wrong password, disabled account, or
`access_review_required`. Supported low-privilege legacy `role: client` records
remain compatible when valid and not explicitly blocked. No implementation is
authorized by the decision alone.

### AUTH-DEC-02 — Login limiter topology and failure behavior

Status: **Deferred by `DEC-AUTH-002` on 25 July 2026**

Approve:

- a shared atomic backing mechanism compatible with every deployed
  worker/instance;
- whether limiter-store unavailability fails closed or returns a controlled
  service-unavailable response;
- retention/TTL and privacy handling for limiter keys;
- non-production behavior.

The existing process-local `_rate_buckets` helper is not an acceptable
multi-instance production authority. No store or topology is selected, and
Phase B must not begin until `DEC-AUTH-002` reopening conditions are satisfied.

### AUTH-DEC-03 — Limit dimensions and thresholds

Approve:

- per-account, per-network/client, and combined dimensions;
- normalization and privacy protection of account identifiers, including
  whether a keyed pseudonym is required instead of a dictionary-reversible
  plain hash;
- key lifecycle and rotation if keyed pseudonymization is selected;
- thresholds and windows;
- whether successful authentication resets or only ages attempts;
- response status, generic body, and `Retry-After` behavior;
- separate or shared budgets for customer and admin login.

No threshold is selected by this plan.

### AUTH-DEC-04 — Trusted client-address contract

Approve the proxy topology and the single trusted source of client address.
Forwarded headers must be ignored unless an approved proxy overwrites them.
IPv4, IPv6, missing address, and malformed forwarded values require tests.

### AUTH-DEC-05 — Access-token and session policy

Approve:

- access-token TTL;
- bearer-only versus an approved secure-cookie migration;
- refresh/renewal behavior, if any;
- logout semantics;
- revocation/session-version behavior;
- required JWT claims and clock-skew tolerance;
- signing algorithm, key strength, key identifier, rotation, and dual-key or
  other compatibility behavior;
- claim minimization, including whether email and role belong in the signed
  token at all;
- compatibility window for already issued tokens;
- response behavior when access state or role policy changes.

An HttpOnly-cookie direction would require a separate frontend/CSRF/origin
implementation slice. This backend plan does not silently select it.

### AUTH-DEC-06 — Password policy and hash migration

Approve:

- minimum and maximum input boundaries;
- byte-versus-character handling for bcrypt;
- composition/passphrase policy, if any;
- compromised-password screening, if any;
- rehash-on-success strategy and target algorithm/cost;
- forced-reset and recovery ownership;
- how the approved policy applies to customer provisioning, administrative
  bootstrap, password change/recovery when later approved, and successful
  login rehash.

Existing bcrypt hashes must remain usable until an approved, reversible
migration says otherwise.

### AUTH-DEC-07 — Authentication security-event governance

Approve:

- which success, invalid, blocked, rate-limited, renewal, logout, and revocation
  outcomes produce an event;
- whether events are transient metrics, persistent audit records, or both;
- pseudonymous actor/account/network dimensions;
- retention, query access, export, alert, and deletion behavior;
- correlation fields and the exact redaction allowlist.

This decision must remain compatible with `DEC-ACCESS-001`: operational staff
do not gain full authentication/security audit access by implication.

## 8. Proposed Implementation Phases

Every phase below needs explicit implementation approval after its decision
dependencies are closed.

### Phase A — Login issuance boundary

Decision dependency: approved `DEC-AUTH-001`; applicable parts of
`AUTH-DEC-06` remain required only for the bounded-input sub-slice.

Detailed bounded plan:

`docs/implementation/plans/pending-reconciliation/2026-07-25-backend-auth-phase-a-login-issuance.md`

Planned behavior:

1. Preserve the supported legacy `role: client` compatibility shape while
   keeping legacy internal/admin markers fail closed.
2. Validate bounded login input before password verification after the
   applicable `AUTH-DEC-06` values are approved.
3. Use a reviewed fixed valid dummy hash or an equivalent constant-work
   password-verification path so unknown email does not skip the expensive
   verification class performed for a known account.
4. Verify credentials without differentiating unknown email from bad password
   through status, body, token issuance, verifier invocation, or limiter
   behavior.
5. Check explicit disabled/review-blocked state and current fail-closed
   eligibility before calling `auth_response`, without treating missing newer
   fields on a supported legacy customer as disabled.
6. Ensure blocked accounts receive no token and no token-bearing cookie.
7. Preserve admin permission enforcement after successful account
   authentication.
8. Keep response and logs free of credential/token material.

Target files:

- modify `backend/server.py`;
- modify `backend/tests/test_auth_security.py`;
- add a focused auth test module only if the existing matrix becomes difficult
  to isolate.

### Phase B — Shared login-attempt limiter

Decision dependency: `AUTH-DEC-02`, `AUTH-DEC-03`, `AUTH-DEC-04`, and
`AUTH-DEC-07`.

Status: **Blocked by `DEC-AUTH-002` reopening conditions.**

Planned behavior:

1. Introduce a small limiter port that accepts normalized, non-secret
   dimensions.
2. Implement the selected shared atomic store with TTL/retention.
3. Apply the limiter before expensive password verification while preserving
   enumeration resistance.
4. Define concurrency, replay, store-outage, and retry behavior.
5. Emit only the aggregate/redacted observability approved by `AUTH-DEC-07`.
6. Keep the process-local helper out of the production login authority.

Conditional target files:

- add `backend/auth_rate_limit.py`;
- modify `backend/server.py`;
- modify `backend/.env.example`;
- add `backend/tests/test_auth_rate_limit.py`;
- add deployment/runbook documentation only after topology approval.

No dependency may be added without separate approval and a dependency-security
review.

### Phase C — Token/session contract

Decision dependency: `AUTH-DEC-05`, `AUTH-DEC-07`, and the token-invalidation
consequence of `DEC-ACCESS-001`.

Planned behavior:

1. Centralize token issue/validation around the approved claim contract.
2. Validate current user state and any approved session/access version on every
   protected request.
3. Implement approved renewal, logout, and revocation semantics.
4. Support an explicit compatibility window or fail-closed cutover for tokens
   issued under the previous contract.
5. Keep frontend transport changes in a separately approved slice.

Conditional target files:

- add `backend/auth_tokens.py` or keep a minimal server-local implementation if
  the approved scope remains small;
- modify `backend/server.py`;
- modify `backend/.env.example`;
- modify `backend/tests/test_auth_security.py`;
- add migration/runbook files only if persistent session/version state is
  approved.

### Phase D — Password verification and migration

Decision dependency: `AUTH-DEC-06` and `AUTH-DEC-07` if rehash creates a
persistent security event.

Planned behavior:

1. Enforce the approved input boundary before hashing/verifying.
2. Preserve existing hashes during the compatibility window.
3. Rehash only after successful verification and only under the approved
   algorithm/cost policy.
4. Apply the approved creation policy consistently to customer provisioning
   and administrative bootstrap; do not harden login while leaving new-account
   creation on a weaker contract.
5. Make any account update atomic, auditable where required, and reversible.
6. Define recovery for accounts that cannot complete an approved migration.

Additional target files/tests may include the existing provisioning and startup
seed paths in `backend/server.py`; they must be named in the approved slice
before implementation.

## 9. Acceptance and Regression Matrix

### Login issuance

- disabled customer credentials do not produce a token;
- disabled internal credentials do not produce a token;
- `access_review_required` accounts do not produce a token;
- unknown email, wrong password, and blocked-account responses follow
  `DEC-AUTH-001`;
- `auth_response`/`create_token` is not called for blocked attempts;
- the password verifier performs the approved equivalent work for known and
  unknown account identifiers;
- timing-sensitive tests assert the work path/call contract rather than flaky
  wall-clock thresholds;
- supported active legacy `role: client` login remains compatible when newer
  fields are absent;
- legacy internal/admin markers remain fail closed;
- active canonical customer and authorized internal login remain compatible;
- a customer cannot use the admin login endpoint;
- public registration remains disabled.

### Limiting

- known and unknown accounts consume equivalent approved budgets;
- account identifier keys use the approved privacy mechanism; a plain
  dictionary-reversible email hash is not described as non-reversible;
- concurrency cannot exceed the approved threshold through lost updates;
- limits apply consistently across worker/instance simulations;
- spoofed forwarding headers do not select a trusted client key;
- `Retry-After` and generic response follow the approved contract;
- limiter-store failure follows the approved failure mode;
- password/token values never appear in limiter state, logs, or errors.

### Token/session

- malformed, expired, wrong-type, wrong-issuer/audience where required, and
  revoked/stale tokens fail closed;
- disablement and access-review changes invalidate access according to the
  approved timing;
- token claims cannot grant permissions absent from current database state;
- signing-key rotation and previous-key compatibility follow the approved
  window without accepting an unapproved algorithm;
- removed claims are absent and required claims are validated;
- previous-token compatibility follows the approved window exactly;
- logout/renewal behavior is deterministic and replay-tested if approved.

### Password

- oversized and invalid input is rejected before bcrypt work;
- Unicode/byte-boundary behavior is deterministic;
- existing approved hashes remain verifiable during migration;
- failed authentication never triggers rehash or account mutation;
- successful rehash behavior is idempotent and rollback-safe;
- customer provisioning and administrative bootstrap enforce the same approved
  password-creation boundary;
- existing valid hashes remain compatible until the approved migration gate.

### Authentication events

- only approved event families are emitted;
- unknown, invalid, disabled, and review-blocked reasons are not exposed in the
  public response;
- persisted and exported fields match the redaction allowlist;
- raw email/network identifiers are absent unless explicitly approved;
- passwords, hashes, tokens, authorization headers, and secret values never
  appear;
- query access does not grant operational staff a full security audit.

### Required commands

Run from a clean checkout or explicitly report local ignored configuration.
Use separate gates rather than allowing a local frontend `.env` to silently
turn an in-process run into an unavailable external-backend run.

In-process regression:

```bash
backend/.venv/bin/python -m pytest -q -rs backend/tests/test_auth_security.py
backend/.venv/bin/python -m pytest -q -rs --ignore=backend/tests/backend_test.py
backend/.venv/bin/python -m pip check
```

Clean-checkout configured suite:

```bash
backend/.venv/bin/python -m pytest -q -rs
```

External integration is a separate gate and requires an explicitly approved
non-production backend URL and credentials. Real transaction/migration tests
are another separate gate and require `MONGO_TRANSACTION_TEST_URL` backed by a
replica set. Missing topology must be reported as a documented environment
skip, not counted as proof that the integration behavior passed.

If a new dependency is separately approved:

```bash
backend/.venv/bin/python -m pip_audit -r backend/requirements.txt
```

Real multi-instance/limiter-store tests and documented environment skips must
be reported separately. A green in-memory unit test is not production-topology
evidence.

## 10. Rollout and Rollback Requirements

Before rollout:

- record the approved policy values without secrets;
- establish redacted observability and alert ownership;
- test the selected limiter topology under concurrency;
- define the previous-token compatibility window;
- prepare customer/staff recovery messaging;
- verify no role or account receives elevated access.

Rollback must:

- use an explicit source revert for each commit boundary;
- preserve users, hashes, and audit history;
- avoid broad deletion of limiter/session state;
- explain behavior of tokens issued before and during rollout;
- retain the disabled-account no-new-token invariant unless a separate security
  decision explicitly changes it;
- include a non-production smoke test after rollback.

## 11. Proposed Commit Boundaries

After approval, keep changes reviewable:

1. legacy-compatibility, blocked-login, and equivalent-work tests;
2. login issuance fix governed by `DEC-AUTH-001`;
3. bounded-input tests and enforcement after `AUTH-DEC-06`;
4. limiter contract and tests;
5. selected limiter implementation/configuration;
6. token/session/signing-key contract and compatibility tests;
7. password creation/verification/migration behavior, if approved;
8. authentication-event governance implementation, if approved;
9. runbook/evidence update.

Do not combine canonical role migration, frontend Auth redesign, Retail guest
sessions, dependency modernization, or production activation with these
commits.

## 12. Exit Criteria

This plan is ready for implementation review only when:

- `DEC-AUTH-001` is applied exactly and `AUTH-DEC-02` through `AUTH-DEC-07`
  have recorded answers for the intended slice;
- exact files and topology-specific tests are approved;
- no candidate/context document is being used as policy authority;
- migration, compatibility, rollout, rollback, and operational owners are
  explicit;
- implementation, commit, push, and production rollout permissions are
  obtained separately.
