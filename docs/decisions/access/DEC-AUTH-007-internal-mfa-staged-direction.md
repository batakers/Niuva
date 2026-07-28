# DEC-AUTH-007 — Mandatory Internal MFA Staged Direction

Status: **Approved with Open Decisions**
Decision ID: `DEC-AUTH-007`
Decision date: 27 July 2026
Approval source: Explicit owner approval of all recommendations in the Admin
Authentication Phase 0 decision packet on 27 July 2026
Scope: MFA requirement for internal/Admin roles, initial TOTP factor, recovery
codes, factor lifecycle, step-up, and later passkey direction
Related review item: `AUTH-P0-05`

## Context

The current application has no MFA enrollment, challenge, recovery, trusted
device, or step-up mechanism. Internal roles can access operational and identity
governance functions using a password-only session. OWASP and NIST guidance
support MFA for privileged users and phishing-resistant authentication where
practical.

## Decision

### Coverage and staging

- MFA is required for every internal role before normal Admin access.
- Customer MFA remains outside this Admin decision.
- Stage 1 uses TOTP as the mandatory broadly compatible second factor.
- Stage 2 makes passkey/WebAuthn the preferred phishing-resistant factor after
  a separately approved implementation and recovery design.
- Email and security questions are not accepted as MFA factors.

### TOTP and recovery codes

- TOTP secrets are encrypted at rest and never written to logs, audit events,
  analytics, general notifications, or public responses.
- OTP verification uses a short acceptance window, single-use protection within
  that window, and strict attempt limiting.
- Enrollment requires confirmation of a valid code before the factor becomes
  active.
- Recovery codes are cryptographically random, stored only as hashes,
  individually single-use, replaceable, and shown only during enrollment or
  explicit regeneration.
- Regenerating recovery codes invalidates prior unused codes.

### Factor lifecycle and step-up

- Factor change or removal requires reauthentication with an existing enrolled
  factor or an approved controlled support-recovery procedure.
- Do not trust possession of an ordinary active session alone to replace an MFA
  factor.
- Step-up MFA is required for access-management, role/permission, credential,
  session, and MFA changes.
- Enrollment, challenge, factor change, recovery, and removal use generic safe
  public errors and approved redacted security events.
- MFA recovery must not be weaker than normal Admin authentication.

## Open Decisions and Preconditions

- Exact TOTP library/dependency, secret-encryption/key-management mechanism,
  issuer label, digit count, period, clock-skew policy, and attempt thresholds.
- Enrollment rollout for existing internal accounts and break-glass procedure.
- Exact passkey/WebAuthn attestation, authenticator, device, synchronization,
  and recovery policy for Stage 2.
- Named owner and valid channel for controlled MFA recovery under
  `DEC-AUTH-008`.
- Trusted-device behavior remains unapproved; no bypass cookie is implied.

## Consequences

- Password-only Admin access is not the approved target.
- TOTP is an approved transitional factor, not the phishing-resistant end
  state.
- A valid support/recovery procedure is required before mandatory enrollment
  can safely roll out.
- MFA implementation must integrate with the session rotation and step-up
  interface governed by `DEC-AUTH-005`.

## Required Verification for a Later Approved Implementation

- Every internal role is challenged after password verification and before an
  ordinary Admin session is issued.
- Enrollment, replay, clock window, attempt limit, concurrent verification,
  recovery code single-use, regeneration, and factor replacement are tested.
- No TOTP secret, OTP, or recovery code appears in logs, events, responses, or
  notifications.
- Step-up is enforced server-side for every approved sensitive operation.
- Customer authentication remains unaffected unless separately approved.

## Excluded from Approval

This decision does not approve a library, encryption-key provider, exact TOTP
parameters, passkey implementation, support channel, source change, migration,
dependency, commit, push, rollout, production activation, or go-live.
