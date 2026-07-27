# Admin Authentication Phase 2 — Session Safety Authorization Packet

Status: **Approved Implementation Authorization — G4 Passed Locally; G5 Not Started — No Production Activation**
Date: 27 July 2026
Decision owner: Project Owner
Technical reviewer: Acting Technical Owner
Operational owner: Acting Technical Owner
Approval source: Explicit owner approval of all `AUTH-P2-*` and `P2-PROD-*`
recommendations on 27 July 2026
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

`DEC-AUTH-005` approves the Admin-session direction. The owner has now approved
the bounded store, cookie/CSRF implementation, signing policy, cutover,
retention, ownership, monitoring, and production-readiness gates in this packet.

This approval authorizes local implementation and disposable local
replica-set verification on a new isolated Phase 2 branch/worktree, subject to
the sequential gates in Section 8. It also defines the evidence required before
a later staging rehearsal or production activation proposal.

It does not authorize commit, push, pull request, shared/staging/production data
mutation, deployment, real cutover, production activation, or go-live. Those
remain explicit follow-up actions. Production activation requires separate
two-person approval from the Project Owner and Acting Technical Owner after all
readiness gates pass.

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
- The refresh endpoint is the sole bootstrap exception because an in-memory
  CSRF token is intentionally lost on reload. It requires the rotating HttpOnly
  session cookie plus exact `Origin`/`Referer`, rotates all session material,
  and returns a new CSRF token. It accepts no bearer credential and no
  cross-origin request.
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

The owner approved every item without amendment on 27 July 2026.

### AUTH-P2-01 — Scope

**Recommendation:** Approve the Admin Session Safety Baseline only. Exclude
customer-session migration, MFA, distributed limiter, persistent auth events,
surface-topology change, provider activation, and production rollout.

Status: **Approved on 27 July 2026.**

### AUTH-P2-02 — Session store

**Recommendation:** Use a dedicated MongoDB `admin_sessions` collection through
a deep provider-neutral store seam. Add no dependency/provider. Reopen adapter
selection if deployment topology later makes MongoDB unsuitable.

Status: **Approved on 27 July 2026.**

### AUTH-P2-03 — Cookie and lifetime contract

**Recommendation:** Approve the two opaque `__Host-` cookie model and the exact
15-minute/30-minute/8-hour/default plus 15-minute/8-hour/7-day/remembered
lifetimes in Section 4.

Status: **Approved on 27 July 2026.**

### AUTH-P2-04 — CSRF/origin contract

**Recommendation:** Approve in-memory synchronizer CSRF tokens, exact
`PUBLIC_SITE_URL` Origin/Referer validation, and `withCredentials` Admin API
requests. Do not use a JavaScript-readable double-submit cookie.

Status: **Approved on 27 July 2026.**

### AUTH-P2-05 — Signing and claims

**Recommendation:** Use opaque random session material, not a new JWT signing
policy. Keep existing HS256 JWT only for supported customer bearer
compatibility. Defer customer JWT claim/signing-key modernization.

Status: **Approved on 27 July 2026.**

### AUTH-P2-06 — Cutover

**Recommendation:** Force Admin re-login and delete legacy browser token state;
do not create a dual Admin bearer/cookie window or import legacy JWTs. Preserve
customer bearer routes.

Status: **Approved on 27 July 2026.**

### AUTH-P2-07 — Migration and retention

**Recommendation:** Authorize migration `008` implementation plus disposable
replica-set dry-run/apply/rollback tests. Add session indexes without a TTL
index. Expired/revoked sessions use an approved 90-day retention baseline and a
controlled scheduled cleanup job with dry-run and aggregate evidence. No
shared-data execution.

Status: **Approved on 27 July 2026.**

### AUTH-P2-08 — Isolation and Git behavior

**Recommendation:** After this packet is approved and checkpointed under
separate commit authorization, create a new isolated branch/worktree from the
exact Phase 1 lineage. Permit local edits/tests only. No commit, push, PR,
shared-data mutation, deploy, or rollout without explicit follow-up instruction.

Status: **Approved on 27 July 2026.**

## 7. Production-Readiness Decisions

These decisions govern readiness work and a later activation proposal. They do
not themselves authorize staging/production execution.

### P2-PROD-01 — Topology assumption

**Decision:** Phase 2 production readiness uses the current single-origin,
route-based application shape. This does not resolve `ADR-004` globally. Any
subdomain, cross-origin, or separate-application move reopens the cookie, CSRF,
CORS, and cutover contract before implementation or rollout.

Status: **Approved on 27 July 2026.**

### P2-PROD-02 — Retention and cleanup

**Decision:** Expired/revoked Admin session records are retained for 90 days,
then deleted by a controlled scheduled cleanup job. The job supports dry-run,
bounded batches, aggregate evidence, interruption/retry, backup-window
coordination, and rollback/restore procedures. No TTL index is used for initial
rollout.

Status: **Approved on 27 July 2026.**

### P2-PROD-03 — Ownership and activation authority

**Decision:** Acting Technical Owner is accountable for session security,
readiness, incidents, rollback, and operational acceptance. An Authorized
Technical Operator may execute approved procedures. Production activation
requires explicit Project Owner plus Acting Technical Owner approval; the
operator does not self-approve.

Status: **Approved on 27 July 2026.**

### P2-PROD-04 — HTTPS boundary

**Decision:** Production Admin sessions require end-to-end approved HTTPS and
the exact Secure cookie contract. There is no production HTTP fallback. Proxy
termination and forwarded-header handling must be verified before activation.

Status: **Approved on 27 July 2026.**

### P2-PROD-05 — Cutover window

**Decision:** Production cutover, if later authorized, uses a communicated
maintenance window and forces every Admin to log in again. Existing Admin
bearer tokens are not imported or accepted as session credentials.

Status: **Approved on 27 July 2026.**

### P2-PROD-06 — Monitoring

**Decision:** Readiness requires monitoring for session issuance, rotation,
rotated-secret replay, revocation/logout failure, CSRF/origin rejection,
MongoDB session latency/availability, cleanup failure, and customer-auth
regression. Evidence excludes cookie/CSRF/session values, passwords,
Authorization headers, raw IP addresses, and plaintext unknown identifiers.

Status: **Approved on 27 July 2026.**

### P2-PROD-07 — Failure and rollback

**Decision:** A session-safety failure disables Admin login/session issuance
while preserving customer bearer compatibility. Rollback never restores Admin
`localStorage` bearer persistence or a version unable to verify existing
Argon2id credentials.

Status: **Approved on 27 July 2026.**

### P2-PROD-08 — Rehearsal gate

**Decision:** A staging-equivalent rehearsal, backup/restore exercise, cutover
drill, rollback/disablement drill, and evidence review must pass before any
production activation proposal.

Status: **Approved on 27 July 2026.**

## 8. Sequential Gates

### G0 — Decision and isolation

- every `AUTH-P2-*` item has explicit owner response;
- approved packet is checkpointed under separate commit authorization;
- new branch/worktree starts from the exact reviewed Phase 1 lineage; and
- no unrelated changes exist.

**Result: Passed locally on 27 July 2026.** Approval checkpoint `5c3999a` is
committed. Branch `feat/admin-auth-phase-2-session-safety` and isolated worktree
`.worktrees/admin-auth-phase-2-session-safety` start at that exact clean
checkpoint. No push, shared-data mutation, deployment, or activation occurred.

### G1 — Session contract tests

- controlled-clock tests cover access, idle, absolute, and remember-me bounds;
- cookie serialization and no-store tests pass;
- raw session/CSRF material is absent from storage/logs/responses/evidence; and
- customer bearer compatibility remains green.

**Result: Passed locally on 28 July 2026.** Controlled-clock tests cover both
lifetime modes, each expiry boundary, hash-only storage, keyed CSRF validation,
cookie attributes, account-generation checks, single/user revocation, and
failure rollback. Admin credentials are absent from JSON and browser storage;
customer bearer compatibility remains covered.

### G2 — CSRF and rotation safety

- non-safe cookie requests fail without valid token and exact origin;
- safe methods do not require CSRF;
- refresh rotates atomically;
- concurrent/replayed old secrets produce one success and family revocation;
- transaction unavailability fails closed without partial rotation.

**Result: Passed locally on 28 July 2026.** Route tests cover exact origin,
missing/invalid CSRF, no-store responses, refresh bootstrap, logout, internal
bearer rejection, and customer bearer preservation. Real replica-set evidence
proved one concurrent rotation winner, explicit replay family revocation, and
no raw session material in stored records. Rotation deliberately disables
automatic transaction replay because the presented secret is single-use.

### G3 — Migration readiness

- migration dry-run is read-only and redacted;
- apply/second-run/rollback pass on a disposable replica set;
- indexes are validated without TTL deletion;
- restore exercise succeeds; and
- no existing account/customer token is mutated.

**Result: Passed locally on 28 July 2026.** Migration `008` dry-run, ambiguity
stops, apply, second-run idempotency, 90-day bounded cleanup, and rollback passed
against fake and disposable real replica-set data. Seven real integration tests
passed across session rotation and migration/cleanup. No TTL index, shared data,
retained volume, or account/customer-token mutation was used.

### G4 — Reviewable local implementation

- targeted/full backend and frontend suites pass;
- production frontend build passes;
- browser storage contains no Admin credential;
- Admin downloads/logout/session-expiry flows pass;
- responsive/accessibility checks cover remember-me and expiry states;
- runbook covers disablement, cutover, rollback floor, and handoff; and
- implementation remains uncommitted/unpushed unless separately approved.

**Result: Passed locally on 28 July 2026.** The serial backend suite passed
`509` tests with `12` skipped and `14` subtests. Frontend suites passed `49` JSX
and `166` JavaScript tests; the focused lifecycle suite additionally passed the
controlled auto-refresh timer. Production build, backend compilation,
`pip check`, whitespace validation, secret scan, and Docker cleanup passed.
Implementation remains uncommitted and unpushed.

### G5 — Production-readiness evidence

- deployment topology proves same-origin HTTPS, Secure-cookie handling, trusted
  proxy behavior, and no HTTP fallback;
- the 90-day cleanup job passes dry-run, bounded deletion, retry, backup-window,
  and restore tests without deleting active sessions;
- monitoring and redacted alert destinations are owned and exercised;
- staging-equivalent migration/cutover, forced re-login, customer compatibility,
  backup/restore, disablement, and rollback drills pass;
- a 60-minute intensive and 24-hour extended observation plan is approved;
- operator, independent reviewer, Project Owner, and Acting Technical Owner
  handoff is complete; and
- production activation has its own explicit two-person approval and window.

**Result: Not started.** Local implementation evidence does not prove
production HTTPS/proxy behavior, monitoring destinations, staging-equivalent
cutover, backup/restore, observation, or production activation readiness.

Stop if any gate fails, exact origin cannot be validated, cookie and CSRF
changes cannot ship together, customer compatibility regresses, transaction
capability is absent for rotation/migration, session material reaches evidence,
or rollback would restore Admin browser bearer persistence. Stop production
readiness if monitoring ownership, HTTPS proof, cleanup/restore evidence, or
two-person activation control is absent.

## 9. Explicitly Out of Scope

- Customer cookie/session migration or customer JWT modernization.
- MFA enrollment, challenge, recovery codes, TOTP, passkeys, or step-up.
- Distributed limiter store/topology, thresholds, proxy trust, or outage policy.
- Persistent authentication-event storage/retention job or Admin audit viewer.
- Support-channel or break-glass identity procedure selection.
- Subdomain/separate-app topology.
- New provider, infrastructure, dependency, secrets, or key rotation.
- Shared/staging/production migration execution, deployment, activation, or
  go-live without their explicit follow-up approvals.

## 10. Approved Verification

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

## 11. Approval Summary

The owner explicitly approved all `AUTH-P2-01` through `AUTH-P2-08` and
`P2-PROD-01` through `P2-PROD-08` recommendations without amendment on 27 July
2026. This activates bounded local implementation authorization after G0
checkpoint/isolation. It does not authorize commit, push, shared/staging/
production data mutation, deployment, production activation, or go-live.
