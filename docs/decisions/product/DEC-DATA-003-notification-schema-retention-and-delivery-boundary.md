# DEC-DATA-003 — Notification Schema, Retention, and Delivery Boundary

Status: **Approved Decision**
Decision ID: `DEC-DATA-003`
Decision date: 29 July 2026 (Asia/Jakarta)
Approval source: Explicit Project Owner approval of `DR-008` Option A on
29 July 2026
Scope: General in-app notifications, their provider-neutral delivery outbox,
retention, and operational alert ownership

Related authority:

- `docs/NIUVA_MASTER_SPEC.md`, including the shared-notification foundation and
  the rule that notification failure must not roll back a successful core
  transaction
- `docs/decisions/access/DEC-AUTH-009-authentication-security-event-governance.md`
- `docs/decisions/experience/DEC-OPS-002-admin-scope-reduction.md`
- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` (`DR-008`)

## Context

The retained notification domain has a user feed, a provider-neutral outbox,
and more than one historical writer or document shape.  It needs one future
contract for recipient-scoped in-app state, delivery attempts, and retention.
Those rules cannot be safely inferred from existing documents or a provider
integration.

Authentication security events are a distinct redacted and access-restricted
domain under `DEC-AUTH-009`. They must not be folded into a general
notification or Admin-audit implementation.

## Decision

### Canonical general-notification record

- The canonical general-notification record is an in-app, recipient-scoped
  notification. Its minimum future contract is a schema version, immutable
  identifier, recipient identifier, event type, customer-safe title/body,
  allowlisted reference type/identifier, reader state, deduplication identity,
  occurrence count, creation/last-seen/update timestamps, and expiry timestamp.
- Links are derived only from an allowlisted reference. A stored URL, external
  URL, or caller-supplied route is not part of the canonical contract.
- Repeated observation of the same recipient-scoped condition updates the
  canonical notification rather than creating an indistinguishable duplicate.
- The notification record must not store authentication security-event data,
  credentials, tokens, OTPs, recovery codes, cookies, Authorization headers,
  provider payloads, or raw exception bodies.

### Delivery and recipient boundary

- In-app delivery is the required product behavior. Email is optional,
  best-effort delivery through a provider-neutral outbox; no provider is
  selected or activated by this decision.
- Each outbox entry is linked to one canonical notification, has a stable
  delivery idempotency identity, and records only the minimum channel,
  recipient, safe payload, state, attempt, lease, and timestamp data needed to
  deliver it.
- Delivery retries are bounded. A terminal `exhausted` outcome is visible to
  operations and does not undo a successfully committed core transaction.
- Recipient resolution remains authorization- and projection-scoped. This
  decision does not authorize new recipient categories, a broad internal-user
  directory, a customer campaign surface, or a new customer notification UI.

### Historical readability and retention

- A general notification is readable by its authorized recipient for 180 days
  from creation. It is then deleted.
- Terminal delivery metadata is retained for 30 days after a `delivered` or
  `exhausted` outcome, then deleted. Delivery payloads and recipient contact
  data are not retained beyond that period unless a later, separate policy
  approves it.
- Existing legacy notification, outbox, and admin-notification-log documents
  are not rewritten, deleted, or silently treated as canonical by this
  decision. Their classification, report, and any non-destructive transition
  require a separately approved migration procedure.
- Administrative communication history is limited to the minimum operational
  metadata needed to account for a request. It is not a general audit viewer
  and must not become a duplicate store of recipient contact data or message
  payloads.

### Ownership and alert boundary

- Faiz is the temporary operational owner for general-notification delivery
  exhaustion and backlog alerts.
- This ownership does not select an external alert destination, response SLA,
  on-call rotation, telemetry provider, or scheduler topology. Those remain
  separate operational decisions.
- Authentication-event alerting, its owner, and its escalation procedure remain
  governed by `DEC-AUTH-009` and are not resolved here.

## Consequences

- `notifications` and `notification_outbox` have distinct, linked roles:
  recipient-facing state versus delivery work.
- Existing delivery/source code is implementation evidence only; it must be
  reconciled against this contract by a bounded planning and implementation
  task with privacy, idempotency, concurrency, and expiry tests.
- A later migration must first produce a non-destructive report of legacy
  shapes, duplicate identities, orphan references, and records that cannot be
  classified safely. Ambiguity is a stop condition, not a reason to infer or
  discard data.

## Excluded from Approval

This decision does not itself authorize:

- source changes, dependency changes, schema migration, backfill, deletion job,
  or mutation of historical records;
- an email, queue, scheduler, telemetry, or alert provider; any provider
  credential; external alert delivery; or an SLA/on-call commitment;
- a new customer communication journey, internal directory, broad audit viewer,
  or recipient-selection UI;
- shared/staging/production execution, deployment, production readiness, or
  go-live; or
- any change to the security-event policy, retention, access model, or open
  decisions in `DEC-AUTH-009`.
