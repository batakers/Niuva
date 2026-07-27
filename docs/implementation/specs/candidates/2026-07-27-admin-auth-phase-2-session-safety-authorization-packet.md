# Admin Authentication Phase 2 — Session Safety Authorization Packet

Status: **Candidate — Owner Decisions Required — No Implementation Authorization**
Date: 27 July 2026
Decision owner: Project Owner
Technical reviewer: Acting Technical Owner
Proposed slice: **Admin Session Safety Baseline**

## 1. Authority and Approval Boundary

Read this packet after:

- `docs/NIUVA_MASTER_SPEC.md`;
- `docs/context/DOCUMENT_REGISTER.md`;
- `docs/decisions/DECISION_REGISTER.md`;
- `docs/decisions/access/DEC-AUTH-001-login-failure-and-legacy-compatibility.md`;
- `docs/decisions/access/DEC-AUTH-003-account-recovery-contract-and-compatibility.md`;
- `docs/decisions/access/DEC-AUTH-005-admin-session-transport-and-remember-me.md`;
- `docs/decisions/access/DEC-AUTH-006-abuse-protection-interface-and-deferral.md`;
- `docs/decisions/access/DEC-AUTH-007-internal-mfa-staged-direction.md`;
- `docs/decisions/access/DEC-AUTH-009-authentication-security-event-governance.md`;
- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`; and
- `docs/decisions/architecture/ADR-004-surface-boundary-topology.md`.

`DEC-AUTH-005` approves the Admin-session direction but leaves the exact store,
cookie/CSRF implementation, signing policy, and legacy cutover open. This packet
proposes those bounded implementation choices for explicit review.

Until every `AUTH-P2-*` item in Section 6 has an explicit owner response, this
packet authorizes no source edit, dependency/configuration change, migration,
commit, push, shared-data mutation, deployment, rollout, production activation,
or go-live.

Approval of this packet would authorize only local source/test work on a new
isolated Phase 2 branch/worktree, subject to the sequential gates in Section 7.
Commit, push, pull request, shared-data migration, deployment, and rollout would
remain separately gated.

## 2. Objective

Replace JavaScript-readable Admin bearer persistence with a revocable,
same-origin, server-side session contract while preserving supported customer
bearer compatibility.

The bounded outcome must:

- issue no Admin credential in JSON or browser storage;
- authenticate Admin requests through `Secure`, `HttpOnly`, `__Host-` cookies;
- enforce 15-minute access rotation, idle timeout, absolute lifetime, and
  opt-in remember-me semantics;
- protect every cookie-authenticated state-changing request with CSRF and
  origin validation;
- revoke server-side sessions on logout and existing account/session invalidation
  triggers;
- keep current backend permission/query enforcement authoritative;
- preserve `POST /api/auth/login` customer bearer behavior; and
- avoid MFA, distributed limiter, auth-event persistence, or topology changes.

## 3. Verified Current State

Verified on branch `feat/admin-auth-phase-1-recovery-safety` at commit `871f0a2`:

| Area | Current evidence | Phase 2 consequence |
|---|---|---|
| Issuance | Customer and Admin login both call `auth_response`, returning one seven-day HS256 bearer token | Split Admin session issuance from customer bearer compatibility |
| Browser storage | `AuthContext.jsx` and `api.js` persist `niuva_token` in `localStorage` and inject `Authorization` | Admin bootstrap/login/logout must become cookie-based without breaking customer helpers |
| Cookie input | Backend accepts an `access_token` cookie fallback but never issues or clears it | Remove this ambiguous fallback from the Admin path; use explicitly named cookies |
| Revocation | `token_version` rejects stale JWTs after password/access changes; logout is local-only | Preserve account-wide invalidation and add per-session server revocation |
| Lifetime | JWT expiry is seven days; no idle, absolute, refresh, or remember-me model exists | Session module owns controlled-clock lifetime transitions |
| CSRF | No CSRF contract or Origin/Referer enforcement exists | Cookie cutover and CSRF protection must ship atomically |
| Downloads | `fetchFile` and `downloadCsv` manually add bearer headers | Admin downloads use credentials + CSRF rules; customer download compatibility remains bearer-capable |
| Topology | One React app and FastAPI service; `ADR-004` leaves future topology open | Scope is current same-origin route topology only |
| Store | MongoDB is existing platform storage and transaction capability is established | Use a dedicated Mongo-backed session collection; no new provider/dependency |
| Privacy copy | Public privacy page says login tokens are stored in `localStorage` | Update factual copy when Admin storage behavior changes; do not claim customer migration |

## 4. Recommended Technical Contract

### 4.1 Deep Admin session module

Add `backend/auth_session.py` with one external interface:

```text
create_admin_session(user, remember_me, request_context)
authenticate_admin_session(request_context)
rotate_admin_session(session, request_context)
revoke_admin_session(session, reason)
revoke_user_sessions(user_id, reason)
```

Cookie serialization and CSRF validation belong at this seam. Routes do not
query or mutate session documents directly.

### 4.2 Session store and records

**Recommendation: MongoDB dedicated `admin_sessions` collection.** This reuses
the operated database and existing Motor/PyMongo dependencies; no Redis or new
provider is selected.

Store only:

- opaque session ID;
- hash of each rotating browser secret, never the raw value;
- user ID and account `token_version` snapshot;
- issued, last-seen, access-expiry, idle-expiry, absolute-expiry, rotated,
  revoked, and safe reason timestamps/categories;
- remember-me boolean; and
- minimum approved request context after privacy review.

Do not store cookie values, CSRF secrets, Authorization headers, passwords,
contact data, user-agent strings, or raw IP addresses. Add indexes for unique
secret hash, user/session lookup, active expiry lookup, and approved retention.
TTL hard deletion remains excluded until session/auth-event retention and
backup interaction are explicitly accepted.

### 4.3 Cookie model

**Recommendation: two `__Host-` cookies.**

- `__Host-niuva-admin-access`: opaque short-lived access secret; `Secure`,
  `HttpOnly`, `SameSite=Strict`, `Path=/`, no `Domain`, max age 15 minutes.
- `__Host-niuva-admin-session`: opaque rotating session secret; same attributes;
  session cookie by default, persistent only when remember-me is explicitly
  selected.

The backend stores only hashes. Rotation invalidates the prior secret in one
atomic state transition. Reuse of a rotated secret revokes the session family
and returns a generic expired-session response.

Local automated tests may use non-prefixed, non-Secure names only through an
explicit test adapter. Runtime local HTTP must not be presented as production
cookie evidence.

### 4.4 Lifetimes

Apply the approved `DEC-AUTH-005` values:

| Mode | Access | Idle | Absolute | Persistent cookie |
|---|---:|---:|---:|---|
| Default | 15 minutes | 30 minutes | 8 hours | No |
| Remember me | 15 minutes | 8 hours | 7 days | Yes |

Refresh/rotation never extends absolute expiry. Activity may extend idle expiry
only up to the absolute boundary. Rotation occurs at login, refresh, privilege
change, and later successful step-up.

### 4.5 CSRF and request-origin contract

**Recommendation: synchronizer token held only in React component memory.**

- Admin login response sets HttpOnly cookies and returns `user` plus one CSRF
  token, but no session credential.
- Admin bootstrap/refresh returns a newly rotated CSRF token in JSON after valid
  cookie authentication.
- Axios uses `withCredentials: true` and sends the token as `X-CSRF-Token` for
  non-safe methods.
- Backend compares a keyed digest against session state in constant time.
- Every cookie-authenticated non-safe request requires the CSRF token and an
  exact approved `Origin`; absent `Origin` may use exact `Referer` origin only.
- Requests with neither approved header fail closed.
- Customer bearer-authenticated requests remain outside this CSRF contract.

The approved origin is the validated backend-only `PUBLIC_SITE_URL` already
introduced in Phase 1. Host and forwarded headers do not select it.

### 4.6 Routes and response contract

Preserve:

- `POST /api/auth/admin/login`;
- `POST /api/auth/login`;
- `GET /api/auth/me` for customer bearer compatibility.

Add:

- `GET /api/auth/admin/session` for Admin bootstrap/current session;
- `POST /api/auth/admin/session/refresh`;
- `POST /api/auth/admin/logout`.

Admin login request adds `remember_me: false` by default. Success returns only
allowlisted user/session-expiry metadata plus CSRF token. It never returns a
bearer or cookie value. Auth/session responses use `Cache-Control: no-store`.

Expired/revoked Admin sessions return stable `401` code
`admin_session_expired`. CSRF/origin failures return generic `403`
`request_verification_failed`. Public credential failures remain the generic
`DEC-AUTH-001` response.

### 4.7 Authorization and revocation

Admin cookie authentication resolves the current user from the database on each
request and then applies the existing backend permission/query policy. Session
records and stale claims never grant roles.

Revoke relevant Admin sessions on:

- explicit logout;
- password reset;
- account disablement or `access_review_required`;
- role/permission change;
- confirmed credential compromise; and
- later approved security-owner action.

Phase 2 keeps `token_version` as the account-wide invalidation generation so
existing recovery and identity-governance mutations remain authoritative.

### 4.8 Cutover and migration

**Recommendation: forced Admin re-login, no dual Admin transport window.**

- Deploy backend and frontend atomically under the current same-origin topology.
- On first Phase 2 frontend load, delete legacy `niuva_token` from browser
  storage before Admin bootstrap.
- Stop accepting bearer tokens for `/api/auth/admin/*` login/session routes and
  reject bearer-only authentication for internal-role access to Admin-protected
  handlers.
- Preserve bearer compatibility for active customer routes and customer file
  access.
- Do not import seven-day Admin JWTs into the session store.
- No user/account data migration is required; migration `008` creates/validates
  session indexes and is dry-run first.

Rollback floor must continue to understand both bcrypt/Argon2 credentials and
must not re-enable JavaScript-readable Admin credentials. If session safety
fails, disable Admin login/session issuance and preserve customer compatibility;
do not restore Admin `localStorage` bearer persistence.

## 5. Exact Proposed Scope

Proposed new files:

- `backend/auth_session.py`
- `backend/migrations/008_admin_session_safety.py`
- `backend/tests/test_auth_session.py`
- `backend/tests/test_auth_session_migration.py`
- `backend/tests/test_auth_session_transaction_integration.py`
- `docs/runbooks/AUTH_SESSION_RUNBOOK.md`

Proposed modified files:

- `.github/workflows/transaction-tests.yml`
- `backend/server.py`
- `backend/identity_routes.py`
- `backend/auth_recovery.py`
- `backend/.env.example`
- relevant existing backend auth/identity tests
- `frontend/src/lib/api.js`
- `frontend/src/lib/api.test.js`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/context/AuthContext.test.jsx`
- `frontend/src/pages/admin/AdminLogin.jsx`
- `frontend/src/pages/marketing/PrivacyPolicyPage.jsx`
- relevant Admin download/logout tests
- `docs/context/DOCUMENT_REGISTER.md`
- this packet

No new runtime dependency is proposed. Stop for packet amendment if another
source/config/provider/dependency/migration file is required.

## 6. Approval Docket

Each item requires an explicit owner response.

### AUTH-P2-01 — Scope

**Recommendation:** Approve the Admin Session Safety Baseline only. Exclude
customer-session migration, MFA, distributed limiter, persistent auth events,
surface-topology change, provider activation, and production rollout.

Status: **Awaiting owner decision.**

### AUTH-P2-02 — Session store

**Recommendation:** Use a dedicated MongoDB `admin_sessions` collection through
a deep provider-neutral store seam. Add no dependency/provider. Reopen adapter
selection if deployment topology later makes MongoDB unsuitable.

Status: **Awaiting owner decision.**

### AUTH-P2-03 — Cookie and lifetime contract

**Recommendation:** Approve the two opaque `__Host-` cookie model and the exact
15-minute/30-minute/8-hour/default plus 15-minute/8-hour/7-day/remembered
lifetimes in Section 4.

Status: **Awaiting owner decision.**

### AUTH-P2-04 — CSRF/origin contract

**Recommendation:** Approve in-memory synchronizer CSRF tokens, exact
`PUBLIC_SITE_URL` Origin/Referer validation, and `withCredentials` Admin API
requests. Do not use a JavaScript-readable double-submit cookie.

Status: **Awaiting owner decision.**

### AUTH-P2-05 — Signing and claims

**Recommendation:** Use opaque random session material, not a new JWT signing
policy. Keep existing HS256 JWT only for supported customer bearer
compatibility. Defer customer JWT claim/signing-key modernization.

Status: **Awaiting owner decision.**

### AUTH-P2-06 — Cutover

**Recommendation:** Force Admin re-login and delete legacy browser token state;
do not create a dual Admin bearer/cookie window or import legacy JWTs. Preserve
customer bearer routes.

Status: **Awaiting owner decision.**

### AUTH-P2-07 — Migration and retention

**Recommendation:** Authorize migration `008` implementation plus disposable
replica-set dry-run/apply/rollback tests. Add session indexes but no TTL deletion
index until retention/backup policy receives separate approval. No shared-data
execution.

Status: **Awaiting owner decision.**

### AUTH-P2-08 — Isolation and Git behavior

**Recommendation:** After this packet is approved and checkpointed under
separate commit authorization, create a new isolated branch/worktree from the
exact Phase 1 lineage. Permit local edits/tests only. No commit, push, PR,
shared-data mutation, deploy, or rollout without explicit follow-up instruction.

Status: **Awaiting owner decision.**

## 7. Sequential Gates

### G0 — Decision and isolation

- every `AUTH-P2-*` item has explicit owner response;
- approved packet is checkpointed under separate commit authorization;
- new branch/worktree starts from the exact reviewed Phase 1 lineage; and
- no unrelated changes exist.

### G1 — Session contract tests

- controlled-clock tests cover access, idle, absolute, and remember-me bounds;
- cookie serialization and no-store tests pass;
- raw session/CSRF material is absent from storage/logs/responses/evidence; and
- customer bearer compatibility remains green.

### G2 — CSRF and rotation safety

- non-safe cookie requests fail without valid token and exact origin;
- safe methods do not require CSRF;
- refresh rotates atomically;
- concurrent/replayed old secrets produce one success and family revocation;
- transaction unavailability fails closed without partial rotation.

### G3 — Migration readiness

- migration dry-run is read-only and redacted;
- apply/second-run/rollback pass on a disposable replica set;
- indexes are validated without TTL deletion;
- restore exercise succeeds; and
- no existing account/customer token is mutated.

### G4 — Reviewable local implementation

- targeted/full backend and frontend suites pass;
- production frontend build passes;
- browser storage contains no Admin credential;
- Admin downloads/logout/session-expiry flows pass;
- responsive/accessibility checks cover remember-me and expiry states;
- runbook covers disablement, cutover, rollback floor, and handoff; and
- implementation remains uncommitted/unpushed unless separately approved.

Stop if any gate fails, exact origin cannot be validated, cookie and CSRF
changes cannot ship together, customer compatibility regresses, transaction
capability is absent for rotation/migration, session material reaches evidence,
or rollback would restore Admin browser bearer persistence.

## 8. Explicitly Out of Scope

- Customer cookie/session migration or customer JWT modernization.
- MFA enrollment, challenge, recovery codes, TOTP, passkeys, or step-up.
- Distributed limiter store/topology, thresholds, proxy trust, or outage policy.
- Persistent authentication-event storage/retention job or Admin audit viewer.
- Support-channel or break-glass identity procedure selection.
- Subdomain/separate-app topology.
- New provider, infrastructure, dependency, secrets, or key rotation.
- Shared/staging/production migration, deployment, rollout, readiness, or go-live.

## 9. Proposed Verification

From repository root:

```powershell
python -m pip check
python -m compileall -q backend
python -m pytest -n 0 -q backend/tests/test_auth_session.py backend/tests/test_auth_security.py backend/tests/test_auth_session_migration.py
python -m pytest -n 0 -q backend/tests
```

From `frontend/`:

```powershell
npm test -- --watchAll=false --runInBand --testMatch="**/*.test.jsx"
npm run build
```

The disposable replica-set suite extends
`.github/workflows/transaction-tests.yml` with the approved session rotation and
migration integration tests. It uses only generated opaque test data and removes
the isolated database and volume after execution.

## 10. Approval Response Template

The owner may respond compactly:

```text
AUTH-P2-01 approve/reject/change: ...
AUTH-P2-02 approve/reject/change: ...
AUTH-P2-03 approve/reject/change: ...
AUTH-P2-04 approve/reject/change: ...
AUTH-P2-05 approve/reject/change: ...
AUTH-P2-06 approve/reject/change: ...
AUTH-P2-07 approve/reject/change: ...
AUTH-P2-08 approve/reject/change: ...
```

Approval of all recommendations still does not authorize commit, push, shared
data, deployment, or production activation.
