# MIG-03B — Candidate G4 exact-file scope for Customer Registration

**Status:** Candidate planning-only; G4 source, dependency, provider, and
runtime activation are not authorized by this document

**Follow-up status:** The exact-file G4 scope was subsequently authorized and
implemented in [PR #296](https://github.com/batakers/Niuva/pull/296). This card
is retained as the reviewed scope record; its provider and runtime activation
exclusions still apply.

**Date:** 18 August 2026 (Asia/Jakarta)

**Baseline:** `origin/main`
`652418ebc4fcd049eeb020f7e00bdbe78515bfbb`

**Follow-up implementation baseline:** `origin/main` at
`b1142f1d0bf1edcad33498e71b6a950aa6039450`.

**G3 review:**
[`CUSTOMER_REGISTRATION_GOOGLE_G3_REVIEW.md`](../../validation/CUSTOMER_REGISTRATION_GOOGLE_G3_REVIEW.md)

**G3 contract:**
[`CUSTOMER_REGISTRATION_GOOGLE_G3_TASK_CARD.md`](CUSTOMER_REGISTRATION_GOOGLE_G3_TASK_CARD.md)

## 1. Purpose and boundary

This card maps the smallest candidate file scope for a later Customer
Registration G4 implementation. It exists to make the next exact-file review
concrete without turning an open security/provider decision into source
authority.

The candidate slice covers Customer email/password registration and an
optional, provider-neutral Google identity path. It does not authorize a
runtime route, callback, provider credential, dependency, schema/index,
session-policy change, Retail capability, deployment, staging, readiness, or
go-live.

The current Niuva backend is a FastAPI application whose route and domain
owners are concentrated in `backend/server.py`. The separately named
backend-development skill is supporting guidance only; it does not require a
new Node/Express layered architecture or justify an unreviewed extraction.

## 2. Preconditions before G4

G4 may begin only after the owner explicitly approves all G3 conditions:

- registration fields, retention, and privacy/terms consent;
- password policy presentation and server authority;
- verification channel, token/expiry/resend/revocation behavior;
- duplicate-safe response and abuse/rate-limit policy;
- Google issuer, audience, redirect allowlist, nonce/state/PKCE, and
  `email_verified` policy;
- provider-subject persistence, uniqueness, linking, unlinking, and recovery;
- Customer session issuance, revocation, and safe-return allowlist; and
- the exact file list, dependency decision, rollback, and test evidence below.

Without these approvals this document remains a candidate scope record and no
file in Section 3 may be changed.

## 3. Candidate exact-file scope

### 3.1 Frontend files

| Path | Candidate action | Condition |
| --- | --- | --- |
| `frontend/src/App.js` | Add the canonical `/register` route only when activation is approved. | Must preserve `/login`, recovery, staff, and Admin ownership. |
| `frontend/src/pages/auth/CustomerRegistration.jsx` | **New** Customer registration page with email/password and optional Google states. | Field names, consent, copy, safe return, and provider states must be approved first. |
| `frontend/src/pages/auth/CustomerRegistration.test.jsx` | **New** focused tests for all visible and recovery states. | Must cover ID/EN, keyboard/focus, duplicate-safe errors, provider cancel/error/retry, and no transaction side effects. |
| `frontend/src/pages/auth/auth-surface.contract.test.js` | Add a Customer Registration ownership assertion. | Staff/Admin and Customer/AuthShell separation must remain explicit. |
| `frontend/src/i18n.js` | Add complete Indonesian and English registration, consent, verification, provider, abuse, and recovery copy. | No machine translation or incomplete counterpart. |

The following existing files are **reuse-only by default** and must not be
modified unless the exact G4 review proves a necessary, bounded contract
change: `frontend/src/pages/auth/CustomerLogin.jsx`,
`frontend/src/components/auth/AuthShell.jsx`,
`frontend/src/context/AuthContext.jsx`, and `frontend/src/lib/api.js`.

### 3.2 Backend files

| Path | Candidate action | Condition |
| --- | --- | --- |
| `backend/server.py` | Own the approved registration and callback route declarations, request/response models, origin/CSRF boundary, and integration with existing session/security seams. | Exact endpoints and transaction behavior must be approved; current public registration remains `403` until then. |
| `backend/auth_password.py` | Reuse the existing backend-owned policy; modify only if the approved registration contract needs a policy interface correction. | Do not weaken the 15–128 code-point/512-byte policy or bypass the blocklist gate. |
| `backend/auth_rate_limit.py` | Reuse or extend the existing bounded limiter for registration/provider abuse. | Limits, identifiers, retry copy, and retention require approval. |
| `backend/auth_sessions.py` | Reuse the existing host-only Secure HttpOnly-cookie session issuance and revocation. | No parallel JWT/cookie/bearer authority. Changes require exact session review. |
| `backend/auth_recovery.py` | Integrate approved verification/recovery outcomes only through the existing recovery contract. | No raw token persistence, automatic login after reset, or non-atomic mutation. |
| `backend/auth_security_events.py` and `backend/auth_security_alerts.py` | Emit approved redacted registration/provider/linking/abuse outcomes. | Event vocabulary, retention, and operational owner must be approved. |
| `backend/identity_routes.py` | Reuse only for its existing staff invitation and internal identity ownership. | Do not generalize its Admin routes or role assumptions into Customer registration. |
| `backend/notification_service.py`, `backend/notification_worker.py`, and `backend/emailer.py` | Reuse the existing provider-neutral notification/outbox seams if verification delivery is approved. | Delivery provider, templates, retry, retention, and worker readiness remain separate decisions. |
| `backend/audit.py` | Reuse approved identity-governance/audit seams where registration or linking events require them. | Do not expose raw secrets, tokens, provider assertions, or unapproved event payloads. |
| `backend/schema_manifest.py` | Change only if an approved provider-subject, verification-token, or linking index is required. | Any new collection/index requires a separately approved migration, rehearsal, and rollback plan. |
| `backend/.env.example` | Add only approved non-secret provider configuration names, if needed. | Never add credentials or copy real values; provider activation remains separate. |

Provider-specific new modules are intentionally **not selected** here. A
future exact-file review must choose and name an adapter path (for example, a
provider-neutral identity module plus a Google adapter) only after the OIDC
dependency, callback ownership, subject persistence, and rollback decisions
are approved. No guessed `auth_google.py`, library, index, or schema is
authorized by this card.

### 3.3 Backend tests

| Path | Candidate action |
| --- | --- |
| `backend/tests/test_auth_registration.py` | **New** service/route tests for fields, consent, duplicate-safe behavior, verification, abuse, and no-order side effects. |
| `backend/tests/test_auth_google_identity.py` | **New** provider-protocol tests only after the provider adapter and dependency are approved. |
| `backend/tests/test_auth_security.py` | Extend only for registration/provider abuse and generic non-enumerating responses when required. |
| `backend/tests/test_auth_recovery.py` and `backend/tests/test_reset_password.py` | Extend only when the approved verification/recovery handoff changes their existing contract. |
| `backend/tests/test_secure_cookie_sessions.py` | Extend only when registration success or provider callback issues a Customer session through the existing service. |

## 4. Required G4 verification

Before delivery, the implementation must provide evidence for:

- frontend focused tests and full frontend regression;
- backend unit/integration/security tests with transaction and failure paths;
- duplicate requests and uncertain callback reconciliation without duplicate
  identity effects;
- provider cancel, invalid/expired callback, outage, retry, and account-link
  states;
- password-policy boundaries, blocklist-unavailable fail-closed behavior,
  verification expiry, replay, and recovery;
- Customer/Admin separation, exact-origin/CSRF/session behavior, and no
  bearer credential in browser storage or JSON;
- no Order, reservation, payment attempt, upload authority, or production
  state side effects;
- Indonesian/English copy, semantic labels, focus/error summary, 200% reflow,
  reduced motion, and 320/390/768/1024/1440 responsive checks;
- production build, dependency audit, `git diff --check`, and applicable
  Impeccable/browser evidence; and
- explicit provider, secret, staging, readiness, and rollback evidence if
  those later gates are separately opened.

## 5. Rollback and delivery boundary

The first G4 source slice must be one isolated branch/worktree and one
reviewable change set. If the slice fails review, discard or revert the
change without deleting historical prototypes or altering the inactive
contract. Provider configuration must remain disabled when required secrets
or approved callback allowlists are absent.

The active Goal may stage exact paths, create one commit, push, open and review
a PR, handle review threads, and merge after all checks pass. Those delivery
actions do not promote this candidate scope, activate Google, or establish
runtime/staging/production readiness.

## 6. Next gate

Owner review is required for the preconditions in Section 2 and the candidate
file scope in Section 3. Once approved, a separate G4 authorization can name
the final exact paths and allow implementation. Until then `/register` and
Google remain inactive by design.
