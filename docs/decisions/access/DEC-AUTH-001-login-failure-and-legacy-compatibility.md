# DEC-AUTH-001 — Generic Login Failure and Legacy Customer Compatibility

Status: **Approved Decision**
Decision ID: `DEC-AUTH-001`
Decision date: 25 July 2026
Approval source: Explicit user approval in the backend-authentication-hardening
conversation on 25 July 2026
Scope: Login failure response, token issuance for blocked accounts, and
compatibility for valid legacy customer records

## Context

The current backend verifies credentials before checking whether an account is
disabled or awaiting access review. A blocked account can therefore receive an
access token even though later token use fails closed.

Returning a different public response for unknown credentials, disabled
accounts, or review-blocked accounts would also expose account state. At the
same time, existing low-privilege legacy customer records may not yet contain
the newer `status`, `access_state`, or `roles` fields. Those historical records
must not be silently disabled by an unrelated login hardening change.

## Decision

### Generic login failure

Customer and internal login use the same public failure contract for:

- unknown email;
- wrong password;
- disabled account;
- account with `access_state=access_review_required`.

The public response is:

```text
HTTP 401
Invalid email or password
```

No access token or token-bearing cookie is issued for any of those outcomes.
The response must not disclose which condition caused the failure.

Internal reason classification may be observed only through a separately
approved redacted authentication-event governance policy. Until that policy is
approved, this decision does not authorize new persistent login-attempt audit
records.

### Legacy customer compatibility

A valid, low-privilege historical customer record using the supported legacy
`role: client` compatibility shape remains eligible to authenticate when:

- the supplied password is valid;
- the record is not explicitly disabled;
- the record is not explicitly marked `access_review_required`; and
- the current fail-closed role resolver recognizes it as the existing legacy
  retail-customer compatibility case.

Missing newer fields alone must not block such a customer. This exception does
not apply to legacy internal/admin role markers, does not grant new
permissions, and does not replace the separately approved migration process.

## Security and Compatibility Consequences

- Blocked accounts cannot receive new access tokens.
- Public responses remain resistant to direct account-state enumeration.
- Timing, limiter, and telemetry side channels still require separate
  implementation and policy controls.
- Existing low-privilege legacy customers remain compatible until an approved
  non-destructive migration replaces the compatibility path.
- Current token invalidation, password, rate-limit, signing-key, and
  authentication-event policies remain open.

## Required Verification for a Later Approved Implementation

- unknown email, wrong password, disabled account, and review-blocked account
  return the exact same public status and body;
- none of those paths calls token issuance;
- a supported active legacy `role: client` record can still authenticate;
- legacy internal/admin markers remain fail closed;
- response timing and password-verification work do not introduce a known-user
  distinction;
- no password, hash, token, or raw credential payload appears in logs or
  evidence.

## Excluded from Approval

This decision does not authorize:

- source-code changes, commit, push, or rollout;
- rate-limit topology or threshold selection;
- token TTL, refresh, revocation, transport, signing-key rotation, or claim
  policy;
- password policy or hash migration;
- persistent authentication-event storage;
- granular-role migration;
- production activation or go-live.

