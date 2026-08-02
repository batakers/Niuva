# DEC-AUTH-005 — Admin Session Transport and Remember-Me Policy

Status: **Approved with Open Decisions**
Decision ID: `DEC-AUTH-005`
Decision date: 27 July 2026
Approval source: Explicit owner approval of all recommendations in the Admin
Authentication Phase 0 decision packet on 27 July 2026
Scope: Admin session transport, persistence, expiry, rotation, refresh,
revocation, logout, and remember-me behavior for the current same-origin route
topology
Related review item: `AUTH-P0-07`

## Context

The current frontend stores a seven-day bearer JWT in `localStorage`, logout is
local-only, and the backend accepts an `access_token` cookie fallback without
issuing or clearing that cookie. There is no approved idle timeout, refresh,
remember-me, server logout, or CSRF contract.

The application is route-based and same-origin. Surface topology was still open
when this decision was approved; `ADR-004` / `DEC-ARCH-01` later selected that
single-origin route-based shape for MVP. This session policy must be reopened if
a future superseding decision moves Admin to a subdomain or separate frontend
application.

## Decision

### Transport

- Admin session credentials are not stored in `localStorage` or
  `sessionStorage`.
- For the current same-origin topology, production Admin sessions use secure
  HttpOnly cookies.
- Session cookies use a `__Host-` prefix, `Secure`, `HttpOnly`, `Path=/`, no
  `Domain`, and `SameSite=Strict`.
- Cookie-authenticated state-changing requests use a synchronizer CSRF token
  plus Origin/Referer validation.
- Responses that carry session credentials use `Cache-Control: no-store`.

### Duration and remember-me

- Short-lived access credential lifetime: 15 minutes.
- Default Admin session: 30-minute idle timeout and 8-hour absolute limit.
- “Ingat saya” defaults off.
- When explicitly selected, remember-me permits a rotating persistent session
  with a seven-day absolute limit and an eight-hour idle limit.
- Remember-me changes persistence and lifetime; it is not a cosmetic checkbox.

### Rotation and revocation

- Rotate session material on login, refresh, privilege or role change, and
  successful step-up authentication.
- Revoke relevant sessions on logout, password reset, explicit disablement,
  `access_review_required`, confirmed credential compromise, and approved
  security-owner action.
- Role/permission changes must not rely on stale token claims to continue
  authorization.
- Logout performs server-side invalidation and client cookie clearing.
- Expired/revoked sessions return a stable safe reason that allows the frontend
  to explain session expiry without exposing internal details.

### Module interface

Session creation, rotation, revocation, idle/absolute expiry, cookie handling,
and session lookup belong behind one deep session module interface. Login,
refresh, logout, password reset, access review, and identity-governance flows use
that interface rather than independently mutating token/session state.

## Compatibility and Reopening Conditions

- This decision applies to Admin/internal sessions. Customer session migration
  is not silently authorized and must preserve supported clients.
- A subdomain, cross-origin, or separate-application topology reopens cookie
  scope, `SameSite`, CORS, CSRF, and token-handoff design.
- Exact session-store adapter, cleanup topology, signing-key rotation, required
  JWT/internal-credential claims, and legacy-token cutover remain open.
- A later phishing-resistant MFA decision may change step-up/session assurance,
  but not without a new record.

## Consequences

- Current `localStorage` bearer persistence is not the approved Admin target.
- A cookie migration requires CSRF/origin protections and coordinated frontend
  and backend rollout.
- Default and remembered sessions have explicit and testable semantics.
- Server-side state/revocation becomes necessary; a purely self-contained
  seven-day JWT cannot satisfy the full decision by itself.

## Required Verification for a Later Approved Implementation

- No Admin auth credential appears in web storage or JavaScript-readable
  cookies.
- Cookie attributes, CSRF, origin, caching, rotation, and clearing are tested.
- Default, idle, absolute, and remember-me expiry use controlled clocks.
- Logout and every approved revocation trigger invalidate server-side state.
- Cross-tab and concurrent-session behavior is deterministic.
- Existing supported customer login is not broken by the Admin migration.

## Excluded from Approval

This decision does not select a session store/provider, signing-key policy,
surface topology, source implementation, migration, dependency, commit, push,
rollout, production activation, or go-live.
