# MIG-03B G3 exact-SHA review — Customer Registration with optional Google

**Status:** Candidate G3 review — PASS WITH CONDITIONS; no G4 source,
dependency, provider, or runtime activation authority

**Review date:** 18 August 2026 (Asia/Jakarta)

**Niuva baseline:** `origin/main`
`151cbe8c2636c7a8f1d4b19b8f71393193b7198c`

**Primary contract:**
[`CUSTOMER_REGISTRATION_GOOGLE_G3_TASK_CARD.md`](../migration/account/CUSTOMER_REGISTRATION_GOOGLE_G3_TASK_CARD.md)

**Companion evidence:**
[`TEMPLATE_COMPATIBILITY_REVIEW_FASTAPI_REACT_MONGODB.md`](TEMPLATE_COMPATIBILITY_REVIEW_FASTAPI_REACT_MONGODB.md)

## 1. Purpose and boundary

This record revalidates the Customer Registration candidate contract against
the current `origin/main` after the documentation-only PR that introduced the
G3 task card. It records source ownership, current inactive behavior, and the
decisions that still need owner approval before G4.

This review does not activate `/register`, public registration, Google
Identity, OAuth/OIDC, a callback, a provider secret, a session change, an API,
a schema/index, a dependency, staging, production, readiness, or go-live.
It does not copy or vendor the external FARM template.

## 2. Authority applied

The review uses the repository reading order and the following applicable
decisions:

- `DEC-UX-003` reserves `/register` as the canonical Customer account-creation
  route but keeps it inactive until a separately approved registration,
  verification, abuse-control, recovery, and activation contract exists.
- `DEC-UX-004` keeps `/register` and Google inactive until separate product,
  security, provider, callback, session, consent, and account-linking
  authority exists.
- `DEC-RT-02` requires authentication before private upload, authoritative
  checkout, Order/payment creation, history, file access, or tracking; a
  registration failure creates no Retail transaction state.
- `DEC-AUTH-003`, `DEC-AUTH-004`, and `DEC-AUTH-010` govern recovery,
  password-policy direction, and Customer session boundaries. They do not by
  themselves authorize a registration implementation or provider activation.

## 3. Exact consumer revalidation

The following paths were rechecked at the stated baseline. They are evidence
of current ownership, not an authorization to edit them.

| Path | Current finding | G3 implication |
| --- | --- | --- |
| `frontend/src/App.js` | `/login` and recovery routes are registered; `/register` is absent. | Registration remains inactive and needs a separately owned route change. |
| `frontend/src/pages/auth/CustomerLogin.jsx` | Existing Customer entry uses the Customer AuthShell and safe-return boundary. | Registration must preserve Customer semantics and must not become a staff/Admin path. |
| `frontend/src/components/auth/AuthShell.jsx` | Shared Auth presentation exposes Customer, staff, and recovery variants. | Reuse is conditional on matching Customer semantics; no universal lifecycle composition is inferred. |
| `frontend/src/i18n.js` | Existing ID/EN copy source remains the localization owner. | Registration copy, errors, consent, and provider states need complete ID/EN entries. |
| `frontend/src/pages/auth/CustomerLogin.test.jsx` and Auth tests | Existing Login/AuthShell/route contracts are covered. | New registration tests must be additive and must not weaken existing auth coverage. |
| `backend/server.py` | `POST /api/auth/register` explicitly returns `403` with public registration disabled. | Backend authority currently blocks public registration. |
| `backend/auth_sessions.py` | Existing Customer session service owns session issuance and revocation seams. | Google or password registration must not create a parallel token/cookie authority. |
| `backend/auth_recovery.py` | Existing shared recovery service owns reset/recovery seams. | Verification and recovery must integrate with approved recovery semantics. |
| `backend/auth_security_events.py` and `backend/auth_security_alerts.py` | Existing security-event and alert seams are available. | Abuse, provider, linking, and uncertain outcomes require redacted operational evidence. |
| `backend/requirements.txt` | Dependency baseline was inspected; no new provider dependency was selected by this review. | Any new OIDC/provider dependency requires a separate dependency and G4 review. |

## 4. Verification performed

| Check | Result | Boundary |
| --- | --- | --- |
| Frontend Auth/route suites | **PASS — 4 suites, 31 tests** | Existing Login, AuthShell, route, and Auth surface contracts only. |
| Backend auth/recovery/session suites | **PASS — 27 tests** | Existing security, reset, and secure-cookie/session behavior only. |
| Public registration behavior | **PASS — source contract** | `/api/auth/register` remains an explicit `403`; this is inactive behavior, not registration evidence. |
| `/register` route presence | **PASS — inactive by design** | No frontend registration route was added or implied. |
| External template review | **PASS WITH CONDITIONS** | Reviewed revision `ec3f947a671ef522f1acde8ff25410013977de6`; reference-only, MIT, no copied runtime code. |
| Source diff in review worktree | **PASS — clean before this record** | This review adds documentation only. |

The backend test command initially encountered the repository's default
xdist startup issue under the local Python runtime. Re-running with
`pytest -n 0` completed successfully; the issue did not change source or
test results.

## 5. G3 decisions confirmed by current authority

These boundaries are sufficiently supported for candidate planning:

1. `/register` is canonical but inactive.
2. Registration and Google are Account/Customer concerns, not Public B2B,
   Staff, Admin, Retail Order, or Operations concerns.
3. Authentication precedes private Retail upload and authoritative checkout.
4. Registration, verification, login, or recovery failure creates no Order,
   reservation, payment attempt, upload authority, or production state.
5. Provider identity must be keyed by provider plus stable subject; email
   equality alone cannot silently merge accounts.
6. Niuva's existing session, recovery, consent, security-event, and safe-return
   boundaries remain authoritative over any external provider.

## 6. Conditions still open before G4

The G3 task card intentionally leaves these as owner decisions. They must not
be invented from the external template or from current implementation values:

- exact email/password registration fields and retention rules;
- exact privacy/terms consent wording and when consent is recorded;
- verification channel, token lifetime, expiry, resend, revocation, and
  delivery-failure behavior;
- abuse/rate-limit policy, generic duplicate-safe copy, audit events, and
  redacted observability;
- Google issuer, audience, client configuration, environment separation,
  callback allowlist, nonce/state/PKCE, and `email_verified` policy;
- provider-subject persistence, uniqueness, account-linking, unlink, and
  recovery-method rules;
- Customer session issuance/revocation and the exact safe-return allowlist;
- exact G4 source paths, dependency decision, migration/rollback plan, and
  required frontend/backend tests.

Until these conditions are explicitly approved, the result is **G3 PASS WITH
CONDITIONS**, not G4 authorization.

## 7. Next gate

The next decision is owner review of the conditions above and of the exact G4
file/dependency scope. After that approval, a separate G4 implementation may
be performed in an isolated worktree with proportional tests and browser,
accessibility, localization, security, and recovery evidence.

Autonomous staging, commit, push, PR review/thread handling, and merge are
permitted for the documentation record under the active Goal. They do not
collapse G3 into G4 and do not authorize provider credentials, deployment,
staging, production readiness, or go-live.
