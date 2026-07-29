# DEC-AUTH-010 — Customer Session Transport and Origin Policy

Status: **Approved Decision**
Decision ID: **DEC-AUTH-010**
Decision date: 29 July 2026
Approval source: Explicit backend-owner approval of the recommended Customer
Session policy, 29 July 2026
Scope: Customer browser session transport, lifetime, origin, CSRF, revocation,
cache, and compatibility boundaries

Related authority:

- `DEC-AUTH-001` — generic login failure and legacy-customer compatibility.
- `DEC-AUTH-003` — recovery revokes all customer and Admin sessions.
- `DEC-AUTH-005` — Admin-only session policy; customer sessions remain a
  separate surface.
- `ADR-005` / `DEC-REMED-001` — bounded secure-cookie implementation evidence.

## Decision

### Supported topology

The production customer web application and API use one same-origin deployment
boundary. Development may use separate localhost ports only with an exact
allowlisted public-site origin and credentialed CORS. A future subdomain,
cross-site, native-application, or third-party handoff topology reopens this
decision.

### Cookie transport

- Customer cookies are host-only. `AUTH_COOKIE_DOMAIN` must remain empty.
- Production cookies require HTTPS and `Secure=true`.
- Access and refresh credentials are `HttpOnly`.
- The synchronizer CSRF cookie is intentionally JavaScript-readable.
- Customer cookies use `SameSite=Lax`.
- The access and CSRF paths are `/`; the refresh path is `/api/auth`.
- Runtime customer bearer transport is prohibited. Test-only bearer support
  remains gated by `NIUVA_TEST_BEARER_AUTH=true`.

The current cookie names remain stable for supported clients. Host-only scope,
Secure mode, HttpOnly, SameSite, path, and server-side state are the security
boundary; this decision does not silently rename customer cookies.

### Lifetime and rotation

- Access lifetime remains 15 minutes.
- Refresh/session absolute lifetime remains 7 days.
- Refresh credentials are opaque, hashed at rest, single-use, and rotated with
  a compare-and-set update.
- Reuse of a rotated refresh credential revokes the active session family.
- Access authentication requires both a current signed access credential and
  an active, unexpired server-side session.

### Origin and CSRF

- Customer login requires the exact approved public-site `Origin` (or the
  already-supported safe Referer origin fallback).
- Refresh requires the synchronizer CSRF cookie/header pair and stored hash.
- Logout and all other authenticated state-changing customer requests require
  the global cookie CSRF check.
- Missing, malformed, cross-origin, or mismatched verification fails closed.

### Logout and response handling

- Logout is idempotent and always clears customer cookies.
- Server-side family revocation first uses the refresh cookie. If it is missing,
  malformed, or no longer resolves, a correctly signed access credential may
  identify the same session solely for revocation.
- An expired but correctly signed current-policy access credential may be used
  for logout revocation; it never restores access.
- Customer login, refresh, logout, current-session, and their error responses
  use `Cache-Control: no-store`.

### Compatibility

Supported canonical and narrowly compatible legacy customer identities keep the
generic login contract from `DEC-AUTH-001`. Customer and internal login surfaces
remain separate. No credential is returned in JSON and no production runtime
may silently fall back to browser-stored bearer authentication.

## Verification

Required source evidence includes:

- generic login allow/deny and exact-origin tests;
- production-shaped cookie attribute tests;
- access/refresh expiry tests;
- refresh rotation, replay, and concurrency tests;
- logout with valid, missing, and malformed refresh cookies;
- disabled/review-blocked/token-version session denial;
- deterministic `no-store` responses;
- hermetic test environment ordering; and
- isolated MongoDB evidence for session rotation/revocation.

## Authorization boundary

This decision authorizes bounded Customer Session source and test work on
`fix/backend-customer-session`. It does not authorize Migration 007 apply,
shared/staging/production execution, `.env` changes, deployment, activation,
legacy data rewriting, or go-live.
