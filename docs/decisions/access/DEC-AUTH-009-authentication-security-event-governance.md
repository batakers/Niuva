# DEC-AUTH-009 — Authentication Security-Event Governance

Status: **Approved with Open Decisions**
Decision ID: `DEC-AUTH-009`
Decision date: 27 July 2026
Approval source: Explicit owner approval of all recommendations in the Admin
Authentication Phase 0 decision packet on 27 July 2026
Scope: Authentication event families, redaction, access, retention, and
separation from general notifications/Admin audit presentation
Related review item: `AUTH-P0-09`

## Context

`DEC-AUTH-001` permits internal reason classification only through separately
approved redacted authentication-event governance. The current system has
generic audit/notification mechanisms, but recovery tokens and provider payloads
must not enter those general stores, and `DEC-OPS-002` removed the general Admin
Audit viewer from active scope.

## Decision

### Dedicated event module

- Authentication security events use a dedicated redacted module and storage
  interface, not general notifications.
- The approved event families are login success, classified login failure,
  reset-request processing, reset completion, session revocation, MFA
  enrollment/change/recovery, and limiter decisions.
- Public login/recovery responses remain generic as required by
  `DEC-AUTH-001`, regardless of internal classification.

### Prohibited fields and identifier treatment

- Never persist passwords, password hashes, raw or hashed reset tokens, OTPs,
  recovery codes, cookie values, Authorization headers, CSRF secrets, provider
  payloads, or raw exception bodies.
- Pseudonymize unknown identifiers; do not persist plaintext unknown-email
  limiter/event keys.
- Store only the minimum actor/account reference, event type, safe reason
  category, timestamp, approved request context, outcome, and correlation data
  required for security operations.
- Customer-facing projections exclude internal reason categories and security
  metadata.

### Access and retention

- Authentication security events are not exposed through the removed general
  Admin Audit viewer.
- Access is restricted to the explicitly designated security/technical owner
  using least privilege.
- Directly identifiable event records are retained for 90 days, then deleted or
  aggregated without direct identifiers.
- Alerting may be defined for repeated privileged-account failures, recovery
  abuse, session revocation anomalies, and MFA recovery, but exact thresholds
  require separate approval.

## Open Decisions and Preconditions

- Named security/technical owner and backup owner.
- Exact storage adapter, deletion job, backup interaction, and proof of expiry.
- Which request-context fields are necessary and privacy-safe.
- Alert thresholds, notification destination, response SLA, and escalation
  runbook.
- Whether any longer aggregated non-identifying metrics are needed.

## Consequences

- Persistent classified auth events are now permitted only within this
  redacted, access-restricted, 90-day contract.
- General notifications cannot be used as a recovery-token or authentication
  event store.
- No new broad Admin audit-browsing capability is authorized.
- Implementation remains blocked until a named owner and storage/deletion
  design are approved.

## Required Verification for a Later Approved Implementation

- Field allowlist and redaction tests reject every prohibited value and common
  nested representation.
- Public responses remain identical across protected account states.
- Access-control tests prevent operational roles and customer surfaces from
  reading classified events.
- 90-day expiry/deletion is tested with controlled time and backup/restore
  considerations.
- Logs, events, notifications, and provider-error evidence contain no reset
  token, OTP, recovery code, cookie, or credential material.

## Excluded from Approval

This decision does not name an owner, select storage/alert providers, approve an
Admin Audit viewer, authorize source changes, dependency, migration, commit,
push, rollout, production activation, or go-live.
