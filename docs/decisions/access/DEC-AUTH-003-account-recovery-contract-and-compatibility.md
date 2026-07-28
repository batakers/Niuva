# DEC-AUTH-003 — Account Recovery Contract and Surface Compatibility

Status: **Approved Decision**
Decision ID: `DEC-AUTH-003`
Decision date: 27 July 2026
Approval source: Explicit owner approval of all recommendations in the Admin
Authentication Phase 0 decision packet on 27 July 2026
Scope: Shared Admin/Customer password-recovery interface, eligibility, reset
token contract, delivery safety, compatibility routes, and public recovery
responses
Related review items: `AUTH-P0-01`, `AUTH-P0-03`, `AUTH-P0-04`, `AUTH-P0-10`

## Context

The repository has shared forgot/reset endpoints for Admin and Customer records,
but the implementation does not yet provide atomic single-use completion,
dedicated recovery-state routes, safe token containment, or a canonically
approved recovery policy. Existing implementation values are evidence, not
policy authority.

`DEC-AUTH-001` remains authoritative for generic login failure and supported
legacy-customer compatibility. `ADR-001` requires transaction-required
cross-collection mutations to fail closed when MongoDB transaction capability
is unavailable.

## Decision

### Shared recovery interface

Password recovery remains one shared backend interface for eligible Admin and
Customer records. Admin and Customer may use surface-specific presentation, but
the recovery behavior and security invariants remain in one deep module.

The module interface exposes only:

```text
request_password_reset(normalized_email, request_context)
validate_password_reset(raw_token)
complete_password_reset(raw_token, new_password)
```

Token storage, clock, delivery, transaction, and redacted-event adapters remain
internal seams. Backend handlers and data queries enforce eligibility and
authorization; frontend route selection is not an authorization boundary.

### Recovery eligibility

- Active supported Customer and internal accounts may use self-service
  recovery.
- Explicitly disabled or `access_review_required` internal accounts receive the
  same public response but no usable reset token.
- Recovery for blocked internal accounts requires the controlled procedure that
  may be established after the Admin-support decision is reopened under
  `DEC-AUTH-008`.
- Missing newer fields alone do not block the supported low-privilege legacy
  customer compatibility path established by `DEC-AUTH-001`.

### Public request contract

- Known, unknown, disabled, review-blocked, and delivery-failure request paths
  use one generic public forgot-password status and message.
- Public timing and failure handling must not intentionally reveal account
  existence.
- The check-email screen masks the user-submitted email locally for every
  outcome. Masking does not depend on account lookup or backend account detail.
- A delivery or persistence failure is recorded only through approved redacted
  operational handling; raw framework/provider errors are not returned.

### Reset-token and completion contract

- Generate at least 256 bits of cryptographically secure randomness.
- Persist only a cryptographic hash of the reset token.
- Reset-token TTL is 30 minutes.
- Permit one active reset token per user.
- Token validation, claim, and consumption are single-use.
- Atomically update the password, increment session version, consume the token,
  and invalidate sibling reset tokens.
- Fail closed with no partial mutation when transaction capability is
  unavailable.
- Revoke all existing sessions after successful password reset.
- Do not automatically authenticate the user after reset.
- Send a separate post-reset notification without a password or reset token.
- Never persist or log raw reset tokens in general notifications, audit events,
  analytics, provider errors, or public responses.
- Use one backend-only `PUBLIC_SITE_URL`; validate it as an allowlisted absolute
  HTTPS origin outside local development.
- If delivery fails, invalidate the undelivered token where possible, retain a
  generic public response, and permit a later fresh request.

### Compatibility routes and interface

Preserve these frontend routes:

- `/admin/login`
- `/forgot-password`
- `/reset-password`

Add these dedicated state routes:

- `/forgot-password/check-email`
- `/reset-password/success`
- `/reset-password/error`

Preserve these backend handlers:

- `POST /api/auth/admin/login`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Add a safe `POST /api/auth/reset-password/validate` interface. Unknown,
expired, and used tokens share one public invalid-token key. Additive response
changes preserve supported clients. A verified completion may return an
allowlisted login destination without disclosing role before token possession.

The frontend captures the URL token once, keeps it only in ephemeral state, and
removes it from the visible browser URL/history before form interaction.
Direct visits to dedicated state routes use generic fallback copy and do not
require a full email or token in route state.

## Consequences

- Admin Concept A may evolve without forking recovery security logic.
- Customer compatibility is preserved; an Admin redesign may not remove or
  silently narrow the customer recovery interface.
- The current sequential reset implementation is non-conforming until it uses
  the approved transaction/fail-closed contract.
- The current generic-notification storage of raw reset URLs is non-conforming.
- Blocked internal account recovery remains operationally unavailable until a
  valid support/review procedure is approved.

## Required Verification for a Later Approved Implementation

- Known and unknown request paths have equivalent public status/body and
  controlled timing/failure behavior.
- No raw token appears in database notifications, logs, events, analytics,
  responses, or provider-error evidence.
- Two concurrent completions yield exactly one success.
- Transaction unavailability and mid-operation failure produce no partial
  password, token, or session mutation.
- Replay, expiry, unknown-token, delivery-failure, and sibling-token tests pass.
- Old sessions are rejected after reset.
- Admin and supported Customer compatibility routes remain valid.

## Excluded from Approval

This decision does not authorize source changes, dependency changes,
migrations, commit, push, rollout, provider selection, production activation,
or go-live. Password policy is governed by `DEC-AUTH-004`; Admin session policy
is governed by `DEC-AUTH-005`; abuse protection is governed by
`DEC-AUTH-006`.
