# DEC-AUTH-011 — Authentication Security-Event Bounded Implementation

Status: **Approved Bounded Implementation Decision**
Decision ID: `DEC-AUTH-011`
Decision date: 29 July 2026
Approval source: Explicit Project Owner approval to use the recommended
Feature 1.7 decision package on 29 July 2026
Related decision: `DEC-AUTH-009`

## Decision

- Use a dedicated `authentication_security_events` MongoDB collection behind a
  provider-neutral storage interface. Do not write these events to general
  notifications, application logs, or `audit_events`.
- Use a strict schema and reject unknown fields. Approved fields are opaque ID,
  schema version, event type, UTC occurrence time, outcome, safe reason code,
  subject kind/reference, optional actor/session references, safe surface,
  pseudonymized peer reference, trusted correlation ID, retention class, key
  version, and expiry time.
- Successful login uses the safe `credentials_verified` reason; denied paths
  use closed non-enumerating categories and never free text.
- Use a dedicated versioned HMAC-SHA256 key for unknown identifiers and peer
  references. Never reuse JWT, CSRF, password, limiter, or encryption keys.
  Missing key material fails event construction closed.
- Initial access has no application read API or general Admin viewer.
  Temporary accountable roles are Security Lead (primary), Backend Security
  Lead (backup), Data/Privacy Lead (cleanup reviewer), and Operations/SRE Lead
  (alert owner). Production requires named people.
- Directly identifiable events expire after 90 days. An application cleanup
  worker is the primary owned control; a MongoDB TTL index is defense in depth.
  Cleanup runs hourly in batches of at most 1,000 under a 10-minute lease,
  retries at 1/5/15 minutes, and must not exceed 24 hours deletion delay.
- Longer aggregate retention may be 365 days only for counts without user,
  session, peer, pseudonym, or correlation references.
- Alert families and initial thresholds are:
  - five privileged-account login failures in 15 minutes: High;
  - twenty peer failures across internal accounts in 15 minutes: High;
  - one Admin session replay: Critical;
  - three recovery-abuse events in 15 minutes: High;
  - each MFA recovery/factor replacement: Medium;
  - two MFA recovery events in 24 hours: Critical;
  - event-store/key failure: Critical;
  - cleanup delay above 24 hours: High;
  - permanent alert-outbox failure: High.
- Alerts use a provider-neutral outbox, contain references/counts rather than
  event payloads, deduplicate for 15 minutes, and retry after 1/5/15/60
  minutes. Production destination remains separately gated. Tests use an
  in-memory adapter. SLA is 15 minutes for Critical and one hour for High.
- Failure behavior is operation-specific:
  - denied/blocked auth remains denied if event persistence fails;
  - revocation proceeds even if event persistence fails;
  - Admin login success, password-reset completion, and future MFA
    enrollment/change/recovery fail closed when their required event cannot be
    persisted within the approved transaction boundary;
  - Customer login success may proceed while readiness becomes degraded;
  - persisted events are not rolled back by alert-delivery failure.
- Migration 010 is prepared separately, creates only the dedicated
  collection/index contract, performs no historical backfill, and is not run
  without isolated-target authorization.

## Required implementation order

1. Strict domain schema, redaction, and pseudonymization tests.
2. Storage port and MongoDB adapter.
3. Bounded login, limiter, session, and recovery integration.
4. Cleanup and provider-neutral alert outbox foundations.
5. Migration 010 source and static/dry-run tests without execution.
6. Security, access-negative, concurrency, expiry, and dependency-fault tests.

## Explicit exclusions

- No application analyst/read API or general Admin Audit viewer.
- No production alert provider or destination activation.
- No secret-manager provider selection or production key creation.
- No migration execution, shared/staging/production mutation, deployment,
  production activation, or go-live.
- No MFA source implementation or passkey work under this decision.

## Production gates

Production acceptance still requires named owners, external key delivery,
approved alert destination, isolated migration/rollback evidence, backup expiry
procedure, production-like cleanup and fault evidence, deployment topology,
monitoring, and explicit activation approval.
