# DR-005 — Internal MFA Decision Packet

<!-- markdownlint-disable MD013 MD060 -->

**Status:** `OPEN / HUMAN_DECISION_BLOCKED`
**Date:** 2026-08-06 (Asia/Jakarta)
**Observed baseline:** `origin/main` at `c84743c8fcbc158721037b3c02dc0dff0c872242`
**Branch:** `codex/g15-dr005-mfa-decision-20260806`
**Worktree:** `C:\tmp\niuva-g15-dr005-mfa-decision-20260806`

## 1. Purpose and boundary

DR-005 is the remaining decision gate for internal/Admin MFA. The approved
direction requires every internal role to complete a Stage 1 TOTP factor before
receiving ordinary Admin access, with hashed single-use recovery codes and
server-side step-up for sensitive operations. Passkeys/WebAuthn are a later
stage. Customer MFA is outside this decision.

This packet makes the unresolved fields reviewable by the owners. It is not an
ADR, does not amend `DEC-AUTH-007` through `DEC-AUTH-009`, and does not authorize
source implementation or production operation.

## 2. Authority and evidence sources

The authority order used for this packet is:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md` and DR-005 in
   `docs/implementation/production-readiness/DECISIONS_REQUIRED.md`
4. `DEC-AUTH-005`, `DEC-AUTH-007`, `DEC-AUTH-008`, `DEC-AUTH-009`,
   `DEC-AUTH-011`, and `DEC-AUTH-012`
5. `docs/runbooks/AUTH_SESSION_RUNBOOK.md` and
   `docs/runbooks/AUTH_RECOVERY_RUNBOOK.md`
6. `FEATURE-1.6-internal-mfa-revalidation.md`, current source, and tests

The decisions establish these boundaries:

- `DEC-AUTH-007` mandates internal MFA, starts Stage 1 with TOTP, requires
  protected recovery codes and step-up, and leaves implementation choices open.
- `DEC-AUTH-008` keeps privileged recovery unavailable until an existing
  internal destination, identity-verification procedure, and accountable owner
  are explicitly approved. Public contact, WhatsApp, and HR channels are not
  fallbacks by assumption.
- `DEC-AUTH-009` permits only a dedicated redacted authentication-event boundary
  with least-privilege access and a 90-day directly identifiable baseline; owner,
  storage, cleanup, and alert operations remain open.
- `DEC-AUTH-005` governs Admin session transport, rotation, revocation, and
  lifetime. MFA must integrate with that boundary rather than introduce a
  second browser credential transport.
- The session and recovery runbooks require explicit authorization, backup and
  rollback evidence, transaction capability, and environment-specific gates;
  they do not authorize MFA rollout.

## 3. Approved invariants that must not change

Any later authorized implementation must preserve all of the following:

- Every internal role is challenged before normal Admin access is issued.
- Stage 1 uses TOTP; customer MFA is not included.
- TOTP secrets are protected at rest and never appear in logs, events,
  analytics, notifications, or public responses.
- Enrollment is inactive until a valid confirmation succeeds.
- OTP acceptance has a short time window, replay protection, and strict attempt
  limiting.
- Recovery codes are random, stored only as hashes, individually single-use,
  replaceable, and invalidated when regenerated.
- Factor replacement/removal requires an enrolled factor or an approved
  controlled recovery procedure; an ordinary session is not an implicit bypass.
- Sensitive identity, role, credential, session, and MFA operations require
  server-side step-up.
- Generic public errors and redacted security events remain the external
  behavior; email and security questions are not MFA factors.
- Passkey/WebAuthn remains a separate Stage 2 decision and implementation.

## 4. Current implementation evidence

The following observations are evidence at the selected current-main snapshot;
they are not authorization:

| Area | Current evidence | Readiness implication |
| --- | --- | --- |
| Admin login | `backend/server.py:1418-1481` verifies the staff password, clears the limiter, and calls `create_admin_session` directly. | Password success still creates an ordinary Admin session without an MFA challenge. |
| MFA service and schema | `FEATURE-1.6-internal-mfa-revalidation.md` records no enrollment, pre-auth challenge, factor state, recovery-code lifecycle, assurance, or step-up implementation. | Stage 1 source work remains missing and decision-blocked. |
| Security events | `backend/auth_security_events.py` contains directionally approved MFA event/reason enums, strict redaction, pseudonymization, and a 90-day constant. | Event vocabulary is not MFA behavior and does not close owner/storage/cleanup/alert operations. |
| Dependencies | `backend/requirements.txt` includes `cryptography`, but no TOTP or WebAuthn dependency is selected. | Existing availability must not be treated as an implementation choice. |
| Admin frontend | Current Admin auth bootstrap and protected routes have no enrollment, challenge, recovery-code, or step-up flow. | Frontend MFA work is also absent. |
| Tests | Current auth tests assert the existing password-to-session contract; no TOTP, replay, clock-skew, recovery-code concurrency, key-outage, MFA recovery, or step-up suite exists. | Existing green auth tests cannot prove MFA readiness. |
| Environment evidence | `FEATURE-1.6-internal-mfa-revalidation.md` records no approved key delivery, production-like store, monitoring, support drill, or rollout target. | Production rollout remains environment-blocked even after a source implementation. |

## 5. Decision scope to confirm

The owner must explicitly confirm the following scope before source work is
authorized:

- Stage 1 is limited to mandatory TOTP for all internal roles and hashed
  recovery codes.
- Customer MFA remains excluded.
- Trusted-device or bypass-cookie behavior is not added without a separate
  approved decision.
- Stage 2 passkey/WebAuthn remains deferred until its own RP/origin,
  authenticator, device, synchronization, and recovery contract is approved.
- Existing Admin session cookies, rotation, revocation, and same-origin rules
  remain the transport boundary.

No default selection is implied by this packet.

## 6. Owner decision fields

### 6.1 TOTP contract

Record an approved value or explicit exclusion for each field:

- implementation dependency and version policy;
- issuer/label and account-label treatment;
- digit count, time period, algorithm, acceptance/skew window;
- replay prevention within an accepted time window;
- per-account, per-peer, and per-challenge attempt limits;
- clock source, drift handling, and failure behavior;
- dependency outage and safe-denial behavior;
- security owner and evidence owner.

### 6.2 Secret protection and custody

Record:

- encryption-at-rest and envelope format;
- versioned key identifier and ciphertext field contract;
- custody boundary, access roles, separation of duties, and audit evidence;
- delivery/provisioning mechanism without placing material in source or logs;
- rotation, retirement, backup/restore, and compromise response;
- unavailable-custody behavior and safe denial;
- recovery and rollback handling for old protected values.

The packet does not select a provider, key store, key value, or rotation
operation.

### 6.3 Enrollment and rollout

Record:

- existing-account enrollment window and accountable operator;
- enrollment eligibility and enforcement date;
- interrupted enrollment, duplicate enrollment, and abandoned challenge
  behavior;
- temporary access policy during the window, with no implicit bypass;
- staged rollout cohorts, stop conditions, rollback floor, and communication;
- evidence required before marking an internal role enrolled.

### 6.4 Pre-auth and Admin session contract

Record:

- short-lived password-verified challenge state and expiry;
- binding to the account, origin, browser/session context, and correlation;
- attempt, replay, cancellation, and concurrent-use behavior;
- exact point at which an ordinary Admin session may be issued;
- session rotation and revocation after successful MFA;
- safe behavior when the MFA dependency is unavailable;
- cross-tab behavior under `DEC-AUTH-012`.

### 6.5 Step-up contract

Record:

- assurance marker and freshness duration;
- exact sensitive operations requiring step-up;
- reauthentication behavior after expiry or session rotation;
- cross-tab invalidation and replay behavior;
- generic response/error contract and redacted event mapping;
- permission and data-query enforcement requirements on the server.

### 6.6 Controlled recovery and break-glass

This section cannot be completed with a public contact or invented channel.
The owner must provide an existing internal destination and record:

- primary and backup accountable owners;
- service hours, escalation path, and emergency access authority;
- identity-verification procedure for blocked account and factor recovery;
- fields visible to support and prohibited secret material;
- evidence, retention, deletion, and access review;
- impersonation defense, dual control, and break-glass expiry;
- incident and post-recovery review procedure.

Until these fields are approved, self-service and controlled MFA recovery remain
unavailable.

### 6.7 Recovery-code policy

Record:

- count, entropy, presentation/download format, and one-time display rule;
- hash algorithm and versioned storage contract;
- consume concurrency, replay response, and regeneration behavior;
- invalidation of old unused codes;
- operator visibility prohibition, support evidence, and retention;
- recovery-code compromise and rollback response.

### 6.8 Authentication security events

Record under `DEC-AUTH-009` and `DEC-AUTH-011`:

- named security/technical owner and backup;
- storage adapter/topology and least-privilege access;
- field allowlist and request-context necessity review;
- expiry/deletion job, backup interaction, and proof of 90-day cleanup;
- alert thresholds, destination, response SLA, and escalation runbook;
- non-identifying aggregate retention and privacy review;
- failure behavior when event persistence or pseudonymization is unavailable.

### 6.9 Stage 2 passkey boundary

Record only the deferred boundary at this stage:

- RP ID and origin;
- attestation/authenticator policy;
- device lifecycle, synchronization, replacement, and removal;
- recovery and support contract;
- separate implementation and verification authorization.

Stage 2 is not required to authorize Stage 1 and must not be inferred from
browser support or an installed dependency.

## 7. Implementation and verification gate after approval

Source implementation may be considered only after the owners approve the
fields above and create a separate source task. That later task must include a
data model and non-destructive migration plan if needed, with dry run, backup,
validation, rollback, and isolated evidence before any shared or production
mutation.

The later verification matrix must cover at least:

- password-only denial and mandatory challenge for every internal role;
- enrollment confirmation and interrupted enrollment;
- invalid, expired, skewed, replayed, and concurrent OTP attempts;
- attempt exhaustion and dependency outage fail-closed behavior;
- recovery-code hashing, single-use concurrency, regeneration, and factor
  replacement;
- secret ciphertext/version behavior and custody failure;
- session rotation, revocation, cross-tab replay, and step-up freshness;
- server-side protection of every approved sensitive operation;
- generic response equivalence and secret-safe logs/events/notifications;
- isolated controlled recovery and emergency-access drill;
- customer-auth regression and accessibility/responsive impact.

No part of this packet runs those checks or creates that implementation.

## 8. Owner decision form

| Decision area | Owner | Decision/reference | Evidence required | Date/status |
| --- | --- | --- | --- | --- |
| Stage 1 scope and Stage 2 boundary |  |  |  | Open |
| TOTP contract |  |  |  | Open |
| Secret protection/custody |  |  |  | Open |
| Enrollment and rollout |  |  |  | Open |
| Pre-auth/session contract |  |  |  | Open |
| Step-up contract |  |  |  | Open |
| Controlled recovery/break-glass |  |  |  | Open |
| Recovery-code policy |  |  |  | Open |
| Security-event operations |  |  |  | Open |
| Source implementation authorization |  |  |  | Not granted |
| Migration/environment/deployment authorization |  |  |  | Not granted |
| Production-readiness/go-live decision |  |  |  | Not eligible |

## 9. Current verdict and handover

Current verdict: **NOT READY for internal production access or go-live**.

The repository has an approved MFA direction and bounded security-event
contract, but the implementation and operational decisions required to enforce
them are not complete. The correct status is `blocked_by_decision`, not a
provider/library/parameter assumption.

Intentionally unchanged by this packet:

- `DEC-AUTH-005`, `DEC-AUTH-007`, `DEC-AUTH-008`, `DEC-AUTH-009`,
  `DEC-AUTH-011`, `DEC-AUTH-012`, the Decision Register, and DR-005 status;
- backend/frontend source, schemas, migrations, dependencies, configuration,
  tests, CI, and deployment manifests;
- credentials, key material, provider activation, shared/staging/production
  data, deployment, readiness, and go-live state;
- the dirty `main` worktree and unrelated worktrees.

The next authorized action is an owner decision review. After approval, create
a separately scoped source task with explicit implementation, migration,
environment, rollback, and verification authority.

<!-- markdownlint-enable MD013 MD060 -->
