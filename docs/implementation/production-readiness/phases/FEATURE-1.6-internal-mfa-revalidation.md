# Feature 1.6 — Internal MFA Revalidation

Date: 29 July 2026  
Branch: `feat/backend-internal-mfa`  
Baseline: `29cfae6aabba13c477c2e6e6b2313961c9c30f63` (`origin/main`)  
Review mode: source and decision revalidation only

## Outcome

Internal MFA is not implemented. Staff password verification currently creates
an ordinary Admin session immediately. There is no TOTP enrollment or
challenge, recovery-code lifecycle, MFA assurance state, step-up enforcement,
or passkey/WebAuthn implementation.

`DEC-AUTH-007` approves the product and security direction but explicitly does
not authorize source implementation. `DEC-AUTH-008` also keeps privileged MFA
recovery operationally blocked because no controlled support channel, identity
verification procedure, or accountable owner has been approved.

The feature therefore remains **blocked by decision** and is not safe to
implement or describe as production-ready from the current inputs.

## Requirement matrix

| Requirement | Current evidence | Result |
|---|---|---|
| Mandatory MFA for internal roles | `/api/auth/admin/login` creates an Admin session after password verification | Missing; production blocker |
| TOTP enrollment | No enrollment model, service, route, or test exists | Missing; parameters/library/key custody unselected |
| TOTP challenge | No pre-auth challenge state or OTP verification boundary exists | Missing |
| Hashed recovery codes | No recovery-code schema, generation, hashing, consume, or regeneration boundary exists | Missing |
| Step-up authentication | Admin sessions contain no MFA assurance/freshness state and sensitive routes have no step-up dependency | Missing |
| MFA recovery | No approved self-service or controlled support procedure exists | Blocked by `DEC-AUTH-008` |
| Passkey/WebAuthn | Approved only as a later preferred phishing-resistant phase | Intentionally deferred |
| Secret protection | `cryptography` is already a dependency, but no MFA encryption format, key provider, key ID, rotation, or custody contract exists | Blocked |
| Security events | MFA event families are directionally approved by `DEC-AUTH-009`; storage/access/owner details remain open | Blocked |

## Approved invariants

Any later authorized implementation must preserve all of these boundaries:

- every internal role completes MFA before receiving normal Admin access;
- Stage 1 uses TOTP; customer MFA is outside this feature;
- TOTP secrets are encrypted at rest and never logged or returned after the
  bounded enrollment display;
- enrollment is inactive until a valid TOTP confirmation succeeds;
- OTP acceptance has a short window, replay protection, and strict limiting;
- recovery codes are random, hashed, individually single-use, and old unused
  codes are invalidated on regeneration;
- factor replacement/removal requires an existing factor or approved controlled
  recovery;
- sensitive identity, role, credential, session, and MFA actions require
  server-side step-up;
- email and security questions are not MFA factors;
- passkeys require a separate Stage 2 implementation and recovery approval.

## Required decisions before source implementation

1. **TOTP contract:** library, issuer label, digits, period, algorithm,
   acceptance/skew window, replay rule, and attempt threshold.
2. **Secret encryption:** key-management provider, envelope/version format,
   key ID storage, rotation, access boundary, custody, and outage behavior.
3. **Enrollment rollout:** existing-account enrollment window, enforcement
   date, interrupted enrollment behavior, and rollback boundary.
4. **Pre-auth/session contract:** short-lived password-verified challenge,
   binding to account/client context, expiry, attempt limiting, and when an
   ordinary Admin session may be issued.
5. **Step-up contract:** assurance marker, freshness duration, session rotation,
   exact protected operations, and cross-tab behavior.
6. **Recovery operations:** exact support destination, primary/backup owner,
   identity verification, service hours, evidence handling, retention,
   impersonation defense, emergency access, and audit procedure.
7. **Recovery-code policy:** count, entropy, display/download format, hashing
   strategy, regeneration, consume concurrency, and operator visibility.
8. **Security events:** authorized analyst boundary, storage, redaction,
   retention cleanup, alert thresholds, destination, and response owner.
9. **Stage 2 boundary:** passkey/WebAuthn RP ID/origin, attestation,
   authenticator policy, synchronization, device lifecycle, and recovery;
   this is not required to implement Stage 1 but must not be inferred.

## Required verification after approval

- password alone never creates an ordinary Admin session;
- every internal role is challenged while customer login remains unchanged;
- enrollment confirmation, invalid/expired/skewed code, replay, concurrent
  verification, and attempt exhaustion;
- recovery-code hashing, single-use concurrency, regeneration, and factor
  replacement;
- secret ciphertext/key-version behavior and key-provider failure;
- session rotation after MFA and step-up freshness enforcement on every
  approved sensitive route;
- generic failure equivalence and no secret/OTP/recovery-code leakage in logs,
  events, responses, notifications, or test artifacts;
- controlled recovery and emergency-access drill in an isolated environment.

## Safety boundary

This revalidation did not add a dependency, choose cryptographic parameters,
create an MFA schema or migration, modify `.env`, create keys, change login
behavior, commit, push, deploy, or activate production access.
