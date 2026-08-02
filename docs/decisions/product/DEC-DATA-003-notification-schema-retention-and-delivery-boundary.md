# DEC-DATA-003 — Notification Schema, Retention, and Delivery Boundary

Status: **Approved Decision — Amended for NMVP-D07**
Decision ID: `DEC-DATA-003`
Decision date: 29 July 2026; amended 31 July 2026 (Asia/Jakarta)
Approval source: Explicit Project Owner approval of `DR-008` Option A on
29 July 2026 and explicit user approval of all six `NMVP-D07` decision groups
on 31 July 2026
Scope: General in-app notifications, their provider-neutral delivery outbox,
retention, operational alert ownership, and the direct-checkout Retail
operator/customer notification policy

Related authority:

- `docs/NIUVA_MASTER_SPEC.md`, including the shared-notification foundation and
  the rule that notification failure must not roll back a successful core
  transaction
- `docs/decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md`
- `docs/decisions/access/DEC-AUTH-009-authentication-security-event-governance.md`
- `docs/decisions/experience/DEC-OPS-002-admin-scope-reduction.md`
- `docs/decisions/product/DEC-RT-02-retail-account-required-checkout.md`
- `docs/decisions/product/DEC-ETA-01-retail-eta-and-customer-milestone-policy.md`
- `docs/decisions/product/DEC-AFTER-01-retail-revision-and-after-sales-policy.md`
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

The `NMVP-D07` discussion selected authenticated dashboard notifications and
email for important Retail events, with no WhatsApp. The amendment below
authorizes that bounded product policy without selecting a provider, publishing
a campaign surface, merging Retail with B2B notification lifecycles, or
authorizing source implementation.

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

- In-app delivery is the required product behavior. Email is best-effort
  delivery through a provider-neutral outbox; no provider is selected or
  activated by this decision. For events classified as mandatory below,
  "mandatory" means that the system must enqueue the approved email and cannot
  preference-disable it. It does not promise successful external delivery.
- Each outbox entry is linked to one canonical notification, has a stable
  delivery idempotency identity, and records only the minimum channel,
  recipient, safe payload, state, attempt, lease, and timestamp data needed to
  deliver it.
- Delivery retries are bounded. A terminal `exhausted` outcome is visible to
  operations and does not undo a successfully committed core transaction.
- Recipient resolution remains authorization- and projection-scoped. The
  amendment authorizes only the direct-checkout Retail customer and
  role-scoped internal-operator recipient categories defined below. It does not
  authorize a broad internal-user directory, campaign/broadcast surface, or B2B
  Quote/Project recipient policy.

### Direct-checkout Retail recipients

- A customer notification is addressed only to the authenticated account owner
  bound to the Retail Order. Email, phone, contact-name, organization, or other
  contact equality is not ownership proof and must not link historical or
  unrelated records.
- Internal recipients are resolved by approved role, permission, and domain
  scope rather than broadcast to every Admin:
  - `warehouse` receives inventory and restock conditions;
  - `order_admin` receives paid-order readiness, customer-file, fulfillment,
    cancellation, and complaint conditions;
  - `production` and `quality_control` receive their scoped production, blocker,
    QC, and rework conditions;
  - `finance` receives reconciliation and refund-execution conditions; and
  - `manager_approver` receives refund or free reprint/replacement approval
    requirements.
- One account may receive multiple categories only when it explicitly holds
  the applicable roles. Backend authorization and resource scope remain
  mandatory.
- A direct-checkout business buyer still follows this Retail policy. A B2B
  Quote/Project, partnership, borongan, or quotation-based engagement requires
  a separate accepted notification policy or its governing contract.

### Retail event allowlist

The customer notification allowlist covers only:

- payment confirmation and a failed, expired, or uncertain payment outcome that
  requires customer action;
- `file_revision_required` and its exact deadline;
- a material ETA change or `eta_overdue`;
- `ready_for_pickup`, shipment, delivery exception, and delivery/recorded pickup
  confirmation;
- cancellation request acknowledgement and decision;
- complaint acknowledgement, request for reasonably required evidence, and
  resolution decision;
- approved reprint/replacement and its material fulfillment progress; and
- approved refund submission, processing, success, failure, or reconciliation
  state.

The internal operator allowlist covers only:

- paid orders ready for processing;
- reorder-point, projected-shortage, and out-of-stock conditions;
- payment reconciliation requirements;
- customer file replacement received or revision deadline elapsed;
- production/QC blockers, rework, and `eta_overdue`;
- delivery exceptions and the seven-day `pickup_overdue` follow-up;
- new complaints and complaint service-level risk;
- refund or free reprint/replacement approval requirements;
- refund execution failure; and
- terminal general-notification delivery exhaustion or backlog conditions.

The Retail Order detail remains the complete milestone-tracking surface.
Routine milestone writes do not have to create bell or email noise. Exact API
enum names and source-transition mappings remain a later technical contract;
they must remain within these semantic categories.

### Mandatory delivery and preferences

- Every allowlisted in-app notification is recorded for its authorized
  recipient and cannot be preference-disabled.
- Customer email is mandatory for payment outcomes, customer action/file
  revision, material ETA delay, ready-for-pickup/shipment/delivery exception,
  cancellation/complaint decisions, and reprint/replacement/refund decisions or
  failures.
- Routine production-progress email uses one customer preference, **Email
  progres produksi rutin**. It is enabled by default and may be disabled
  without hiding the complete order timeline.
- Role-scoped critical operator email is mandatory for the responsible role in
  the MVP. Routine work remains visible through the applicable dashboard or
  queue rather than generating email for every update.
- Marketing, bulk campaign, arbitrary recipient selection, and WhatsApp are
  excluded from this policy.

### Safe payload and template boundary

Customer-safe notification content may include:

- the public order reference;
- approved status, required action, occurrence time, deadline, or ETA range;
- amount and currency only when needed for the related payment or refund;
- fulfillment method and customer-safe shipment tracking; and
- an approved customer-safe reason.

The notification title/body and email template are versioned. Visible content
must not contain or attach customer design files, previews, evidence media,
storage links, unnecessary address/phone data, raw provider transaction or
webhook data, internal cost, margin, profit, supplier data, private notes, raw
errors, credentials, tokens, OTPs, cookies, or another customer's data.
Operator email also carries only a minimal safe summary; authorized detail
remains behind the internal authenticated surface.

### Reference, deep-link, and ownership boundary

- Customer and operator routes are resolved from separate, audience-aware
  allowlists using the canonical reference type/identifier. Neither a stored
  route nor an external or caller-supplied URL is trusted.
- Customer links target the owned Retail Order or its approved complaint/action
  surface. Operator links target only the role- and domain-authorized Admin
  record.
- Authentication followed by a backend ownership/permission check is required
  every time the target opens. An absent or unauthorized target returns a
  non-enumerating not-found result.
- Email never performs payment, cancellation, refund, file replacement, or
  approval directly. A payment email returns to the same-origin Retail Order;
  any provider action is issued separately by the authoritative server.
- An unknown or unsafe reference produces an unlinked notification rather than
  a guessed route.

### Retry, exhaustion, resend, and audit

- A stable source-event, recipient, event-category, and occurrence identity
  prevents webhook, worker, or request replay from duplicating a notification
  or email. A genuinely new business occurrence, such as a later ETA-overdue
  cycle, receives a distinct occurrence identity.
- Email delivery is attempted no more than five times. Exact retry spacing,
  worker scheduling, and provider behavior remain configurable technical and
  operational gates.
- After the fifth unsuccessful attempt, delivery becomes `exhausted`. A
  role-scoped in-app operations alert is created without recursively requiring
  another email. No WhatsApp or unapproved channel is used as an automatic
  fallback.
- Notification or email failure never rolls back payment, order, reservation,
  inventory, milestone, refund, or another committed core transition.
- For `file_revision_required`, the 48-hour clock begins only after the
  authenticated customer in-app notice is durably recorded and available as
  required by `DEC-AFTER-01`; email success is not the clock source.
- After exhaustion, an authorized `order_admin` with the applicable
  notification permission may request a controlled resend. The system
  re-resolves the same authorized recipient, uses the same approved template,
  creates a new linked delivery record, and audits the actor and reason. It
  does not permit arbitrary recipient or body editing.
- Audit metadata records the safe source reference, recipient identity, event
  category, occurrence/deduplication identity, channel, template version,
  state, attempts, timestamps, actor/system source, and normalized safe failure
  category. Raw provider errors, full payloads, and retained contact copies are
  prohibited.

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
- The approved Retail customer dashboard/email policy now has an explicit
  recipient, event, payload, link, retry, preference, and audit boundary.
- Complete production tracking remains on the order detail; notifications
  communicate material changes and required action rather than duplicating
  every milestone.
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
- customer campaigns, arbitrary recipient selection, B2B notification policy,
  a broad internal directory, or a broad audit viewer;
- exact API/schema/event enum implementation, source-transition mapping,
  preference UI, worker topology, provider integration, or production
  activation;
- shared/staging/production execution, deployment, production readiness, or
  go-live; or
- any change to the security-event policy, retention, access model, or open
  decisions in `DEC-AUTH-009`.
