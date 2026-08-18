# External template compatibility review — Customer Registration / Google

**Status:** Candidate G3 evidence — reference-only; no source or provider
activation authority

**Review date:** 18 August 2026 (Asia/Jakarta)

**Niuva baseline:** `origin/main`
`e0e43e5ca3126acc7604e2f312abcd7723ed70e4`

**External input:**
[`jonasrenault/fastapi-react-mongodb-docker`](https://github.com/jonasrenault/fastapi-react-mongodb-docker)

**Reviewed external revision:** `ec3f947a671ef522f1acde8ff25410013977de6`
(`refs/heads/main`, read on 18 August 2026)

**License recorded by source repository:** MIT

## Purpose and boundary

This review decides how the external FARM template may inform the separate
Niuva Customer Registration G3 contract. It does not import, fork, copy, run,
vendor, or install the template. It does not activate Google Identity,
OAuth/OIDC, registration, a callback, a provider secret, a session, an API,
or a database change.

The Niuva authority order remains the Master Specification, Document Register,
Decision Register, applicable approved decision/ADR, current source/tests, and
then this candidate evidence. The external template cannot override Niuva
identity, lifecycle, privacy, security, or delivery gates.

## What the template actually provides

The source README describes a FastAPI/React/MongoDB FARM boilerplate, Docker
development and production files, and basic user management with OAuth2 SSO.
Its Google setup documents a client ID, client secret, and Google callback URL.
The reviewed code places the Google flow in `backend/app/routers/login.py`,
the bearer/JWT helpers in `backend/app/auth/auth.py`, and settings in
`backend/app/config/config.py`.

Those observations are reference evidence only. They are not evidence that the
template satisfies Niuva's Customer lifecycle or production security contract.

## Compatibility disposition

| Template area | Disposition | Niuva treatment |
| --- | --- | --- |
| FastAPI/React/MongoDB/Docker shape | Adopt as architectural reference | Compare boundaries only; retain Niuva's existing topology and source owners. |
| Environment-driven Google client configuration | Adopt with amendment | Server-only secrets, environment-specific redirect allowlists, redacted logs, and a separate provider gate. |
| Provider callback concept | Adopt with amendment | Use a provider-neutral identity adapter and Niuva-owned callback/session boundary. |
| `GoogleSSO` integration in a route module | Reference only | Do not copy the route or dependency until G3 dependency, security, and exact-file review. |
| Match/create by email | Reject | Never silently merge or create/link an account solely from an email address. Use stable provider subject plus explicit linking policy. |
| Direct HS256 bearer JWT and `Authorization` cookie | Reject as Niuva session authority | Reuse the existing Niuva session service and customer/admin separation. |
| Automatic user creation during provider callback | Reject as an unbounded shortcut | Creation must follow consent, duplicate-safe outcome, account state, audit event, and safe-return rules. |
| Template user model and permission assumptions | Reject as domain authority | Niuva Customer, staff, Operations, and owned-record lifecycles remain separate. |
| Template Docker production setup | Defer | Deployment, secret injection, callback hostname, TLS, readiness, and provider operation require separate evidence. |

## Material incompatibilities requiring the G3 contract

The reviewed template code is intentionally small, but that simplicity is not
the Niuva contract:

1. The Google callback finds a user by email and creates one when absent. This
   is insufficient for explicit account linking, duplicate-safe errors, and
   stable provider-subject ownership.
2. The template issues its own HS256 access token and puts a bearer value in an
   `Authorization` cookie. Niuva already owns session issuance, revocation,
   replay handling, security events, and customer/admin boundaries.
3. The template's basic active-user check does not define Niuva's pending,
   expired, recovery, abuse, consent, safe-return, or customer-projection
   states.
4. A configured client ID/secret and a locally working callback would prove
   only a provider integration path, not Niuva authorization, Retail account
   eligibility, or production readiness.

## Required Niuva adaptation

The separate Customer Registration G3 task card must specify:

- authorization-code/OIDC flow with server-side exchange and validation;
- issuer, audience, subject, expiry, nonce/state/PKCE, redirect allowlist, and
  `email_verified` policy;
- provider identity keyed by provider plus stable subject, not email alone;
- explicit new-account, existing-account, and account-linking outcomes;
- consent and privacy copy before account creation or linking;
- non-enumerating duplicate/error copy and bounded retry;
- provider cancel, callback-invalid, provider-unavailable, expired, offline,
  and uncertain states;
- Niuva session issuance and safe-return allowlist after successful authority;
- recovery/unlink rules that retain at least one valid recovery method;
- security-event, rate-limit, audit, and redacted-observability obligations;
- ID/EN, keyboard, focus, screen-reader, 200% reflow, and reduced-motion
  behavior; and
- no Order, reservation, payment, private upload, or production state as a
  side effect of registration or Google login.

## Self-review result

**PASS WITH CONDITIONS** as candidate reference evidence.

The template is useful as a donor for a provider callback shape and local
configuration vocabulary. It is not suitable for direct adoption of its
identity matching, JWT/cookie session, user creation, or production setup.
The next artifact is the bounded Customer Registration G3 task card; runtime
source, dependency, secret, provider, staging, and readiness work remain
separately gated.

## Source references

- [Template README](https://github.com/jonasrenault/fastapi-react-mongodb-docker#readme)
- [Template Google login router](https://github.com/jonasrenault/fastapi-react-mongodb-docker/blob/ec3f947a671ef522f1acde8ff25410013977de6/backend/app/routers/login.py)
- [Template auth helper](https://github.com/jonasrenault/fastapi-react-mongodb-docker/blob/ec3f947a671ef522f1acde8ff25410013977de6/backend/app/auth/auth.py)
- [Niuva Customer Registration route inventory](../inventory/ROUTE_COMPONENT_MATRIX.md)
- [Niuva Account/Auth pilot boundary](../migration/account/ACCOUNT_AUTH_G3_SPLIT_TASK_CARD.md)
