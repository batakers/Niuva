# Feature 1.7 — Authentication Security Events Decision Inputs

Status: Approved for bounded implementation by `DEC-AUTH-011`
Date: 29 July 2026
Branch: `feat/backend-auth-security-events`
Governing decision: `DEC-AUTH-009`

## Purpose

This packet records the inputs approved for bounded implementation by
`DEC-AUTH-011`. Production owners, external key delivery, alert destination,
migration execution, deployment, and activation remain separate gates.

## Already approved and not reopened here

- authentication events use a dedicated module and storage boundary;
- general notifications and the removed general Admin Audit viewer are not
  authentication-event stores or readers;
- event families are login success, classified login failure, reset-request
  processing, reset completion, session revocation, MFA
  enrollment/change/recovery, and limiter decisions;
- public login and recovery responses remain generic;
- unknown identifiers are pseudonymized;
- prohibited credentials, tokens, OTPs, recovery codes, cookies, headers,
  provider payloads, and raw exception bodies are never persisted;
- directly identifiable records retain for 90 days, then are deleted or
  irreversibly aggregated without direct identifiers;
- access is least privilege and restricted to designated security/technical
  owners.

## Decision 1 — Accountable ownership

**Required input**

- primary security/technical owner;
- backup owner;
- cleanup evidence reviewer;
- alert-response/on-call owner;
- privacy/retention approver.

**Recommendation**

Use named roles and named people for production. The primary owner may read
classified events; the backup receives equivalent access only when on duty.
Cleanup evidence requires a second reviewer. Application administrators,
content, catalog, warehouse, sales, Finance, and customer roles receive no
security-event read permission.

**Approval fields**

| Field | Approved value |
|---|---|
| Primary security/technical owner | Pending |
| Backup owner | Pending |
| Cleanup evidence reviewer | Pending |
| Alert-response/on-call owner | Pending |
| Privacy/retention approver | Pending |

## Decision 2 — Storage and availability

**Options**

- **A — Dedicated MongoDB collection (recommended for the bounded current
  architecture):** one `authentication_security_events` collection behind a
  provider-neutral storage port. It uses the existing approved database
  capability while remaining separate from `audit_events` and notifications.
- **B — External security-event provider:** stronger operational separation,
  but introduces an unselected provider, delivery, credential, retention,
  outage, and cost boundary.
- **C — General audit/notification storage:** rejected by `DEC-AUTH-009`.

**Recommendation**

Select Option A for the first bounded implementation. Require a dedicated
collection, schema version, server-only writer, no general route, and no
automatic fallback to logs, notifications, or `audit_events`.

**Availability recommendation**

- auth denial/failure paths remain denied even if event persistence is
  unavailable;
- successful privileged authentication, recovery completion, MFA change, and
  security-sensitive revocation fail closed if the required classified event
  cannot be persisted within the approved transaction boundary;
- customer login success may complete when the event store is unavailable only
  if the owner explicitly accepts the temporary visibility loss and a
  credential-free local counter/health signal exists; otherwise fail closed;
- alert-delivery failure does not roll back an already persisted event, but it
  must create an owned retry state and readiness/alert degradation signal.

The operation-by-operation outage matrix must be explicitly approved; the
recommendation above is not active policy.

## Decision 3 — Event schema and safe vocabulary

**Recommended allowlist**

| Field | Contract |
|---|---|
| `id` | Server-generated opaque UUID |
| `schema_version` | Fixed allowlisted version |
| `event_type` | Approved event-family enum |
| `occurred_at` | UTC datetime |
| `outcome` | `success`, `denied`, `blocked`, or `failed_safe` |
| `reason_code` | Event-specific non-secret enum |
| `subject_kind` | `known_user`, `unknown_identifier`, or `system` |
| `subject_ref` | Internal opaque user ID for known user, keyed pseudonym for unknown identifier, or absent |
| `actor_ref` | Internal opaque actor ID only when distinct and required |
| `session_ref` | Opaque session ID only; never a cookie/session secret |
| `request_context` | Nested strict allowlist approved below |
| `correlation_id` | Server-generated/validated opaque correlation ID |
| `retention_class` | Fixed `direct_90d` |

**Recommended request-context allowlist**

- pseudonymized authoritative peer identifier;
- approved surface: `customer`, `admin`, or `recovery`;
- server-generated request/correlation ID;
- deployment environment identifier from trusted configuration;
- no user agent, raw IP, forwarded header, URL query, request body, email,
  telephone, free text, or provider response.

**Recommended reason-code rule**

Use a closed enum per event type. Never accept free text from requests,
exceptions, providers, database errors, or operators. Unknown internal causes
map to `internal_failure_safe`.

Successful authentication uses `credentials_verified`; it does not expose any
credential detail.

## Decision 4 — Identifier pseudonymization

**Recommendation**

- use HMAC-SHA256 with a dedicated versioned authentication-event
  pseudonymization key;
- do not reuse JWT, password, limiter, CSRF, or encryption keys;
- store only `key_version` and digest, never the key or plaintext identifier;
- normalize email-like identifiers with the same approved account
  normalization before HMAC;
- normalize authoritative peer addresses through the approved proxy policy;
- rotate keys through an explicit dual-read/new-write period only if cross-key
  investigation is required; otherwise rotation starts a new unlinkable
  pseudonym epoch;
- fail closed for event creation when the required key is unavailable; never
  store plaintext as fallback.

**Approval fields**

| Field | Approved value |
|---|---|
| Key provider | Pending |
| Key custodian | Pending |
| Backup custodian | Pending |
| Rotation interval | Pending |
| Cross-version correlation allowed | Pending |
| Key outage behavior by operation | Pending |

## Decision 5 — Read and analyst boundary

**Options**

- **A — No application read API initially (recommended):** approved owners use
  a separately controlled operational query procedure with redacted,
  aggregate-first evidence.
- **B — Dedicated backend analyst API:** requires a new narrow permission,
  step-up MFA, pagination, query allowlist, export policy, query audit, rate
  limiting, and production identity evidence.
- **C — General Admin Audit viewer:** rejected.

**Recommendation**

Select Option A for initial implementation. It minimizes exposure while
retention and alert operations mature. A later Option B requires separate
source authorization and cannot use `super_admin` wildcard alone as the
analyst boundary.

## Decision 6 — Retention and cleanup

**Recommendation**

- directly identifiable events are eligible for deletion at exactly 90 days;
- use an application cleanup worker with controlled-clock selection, bounded
  batches, lease protection, retries, and aggregate evidence;
- do not depend only on MongoDB TTL deletion because exact deletion timing,
  backup interaction, aggregation, and proof require an owned procedure;
- a TTL index may be defense in depth only after migration review;
- cleanup evidence contains counts, time bounds, schema/key versions, job ID,
  result, and reviewer—never event payloads;
- backups must not silently extend identifiable retention; backup expiry,
  restore filtering, legal hold, and exceptional preservation need explicit
  procedures;
- longer-lived aggregates, if approved, contain no user/session/pseudonym
  reference and use only bucketed counts by event type/outcome/environment.

**Approval fields**

| Field | Approved value |
|---|---|
| Cleanup owner | Pending |
| Cleanup schedule | Pending |
| Maximum deletion delay | Pending |
| Batch size/capacity owner | Pending |
| Backup expiry interaction | Pending |
| Legal-hold procedure | Pending |
| Longer aggregate retention | Pending |

## Decision 7 — Alerting

**Candidate alert families**

- repeated privileged-account login failures;
- recovery-request abuse;
- session-family replay or unusual revocation volume;
- MFA recovery or factor replacement;
- event-store, cleanup, pseudonymization-key, or alert-delivery failure.

**Recommendation**

Approve event families first, but do not invent numerical thresholds. Every
alert requires:

- exact threshold/window and deduplication/cooldown;
- destination and credential owner;
- severity;
- response SLA;
- primary and backup responder;
- escalation and closure runbook;
- payload allowlist containing event reference/count only;
- provider outage/retry/dead-letter behavior;
- test-alert and evidence procedure.

**Approval fields**

| Field | Approved value |
|---|---|
| Alert provider/destination | Pending |
| Threshold owner | Pending |
| Response SLA | Pending |
| Escalation owner | Pending |
| Retry/dead-letter policy | Pending |
| Test-alert window | Pending |

## Decision 8 — Migration and rollout boundary

**Recommendation**

- create schema/migration work in a separate branch after Decisions 1–7;
- migration creates only the dedicated collection/index contract and never
  copies historical `audit_events`, notifications, or application logs;
- no historical authentication-event backfill is inferred;
- use isolated preflight, backup, dry run, idempotent apply, validation,
  rollback/compensation, stop rules, and restore rehearsal;
- deploy writer integration disabled until schema/readiness and key/provider
  dependencies pass;
- enable one event family at a time, starting with limiter decisions and
  classified login failures, then session/recovery, and MFA only when MFA
  exists;
- production activation requires exact-SHA, environment, cleanup, access,
  alert, and owner evidence.

## Approval record

The Project Owner explicitly approved use of this recommended package on
29 July 2026. `DEC-AUTH-011` is the authoritative implementation record.

Before production activation, record:

- approver name/role;
- approved option/value for Decisions 1–8;
- exact permitted branch and file scope;
- schema/migration permission separately;
- test environment;
- explicit exclusions;
- approval timestamp and review/expiry date.
