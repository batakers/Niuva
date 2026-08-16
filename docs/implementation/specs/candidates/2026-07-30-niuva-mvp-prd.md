# Niuva MVP Product Requirements Document

Status: **Context Only — Formal Product and Route Reconciliation Complete — No Implementation Authority**
Prepared: 30 July 2026
Approval source: Explicit user approval of the discussion draft on 30 July 2026
Decision update: Explicit user approval of `NMVP-D01`, `NMVP-D03`,
`NMVP-D04`, and `NMVP-D08` Option A plus a fixed 30-minute checkout
reservation on 30 July 2026, followed by `NMVP-D05` approval on 31 July 2026;
promoted as `DEC-RT-02`, `DEC-PRICE-001`, `DEC-TAX-01`, `DEC-FUL-01`,
`DEC-ETA-01`, `DEC-OPS-003`, and `DEC-INV-01`. `NMVP-D06` and all six
`NMVP-D07` decision groups were approved on 31 July 2026 and promoted as
`DEC-AFTER-01` and an amendment to `DEC-DATA-003`. All six `NMVP-D02`
decision groups, including Option B — Assisted Retail Offer, were approved on
31 July 2026 and promoted as `DEC-OFFER-01`. `NUF-R01` through `NUF-R12`
were approved on 31 July 2026, including the refinements to `NUF-R08` and
`NUF-R09`, and promoted as `DEC-ARCH-01` / `ADR-004` plus `DEC-UX-003`.
Scope: Public website, Retail commerce, Custom 3D Print, inventory, customer tracking, notifications, and a reduced operator backoffice
Related decision packet: `docs/implementation/specs/candidates/2026-07-30-niuva-mvp-decision-packet.md`
Related user-flow candidate: `docs/implementation/specs/candidates/2026-07-31-niuva-mvp-user-flow-and-route-contract.md`

> **Read-first notice:** This file is not the active PRD. Start with
> [`NIUVA_MASTER_SPEC.md`](../../../NIUVA_MASTER_SPEC.md), then consult the
> applicable approved decision or ADR. This candidate is retained only for
> discussion and promotion provenance; its approved selections cannot be
> reconstructed or implemented directly from this file.

## 1. Document Purpose and Authority

This candidate translates the 30 July 2026 product discussion into a reviewable
MVP requirement set. It does not replace or silently amend:

- `docs/NIUVA_MASTER_SPEC.md`;
- `docs/context/DOCUMENT_REGISTER.md`;
- `docs/decisions/DECISION_REGISTER.md`;
- approved requirement baselines, decisions, or ADRs; or
- implementation, migration, provider, production-readiness, or go-live gates.

Where this candidate conflicts with current authority, the conflict is stated
explicitly and remains `blocked_by_decision` until an approved record
reconciles it. Approval of the discussion draft does not authorize source
changes, schema changes, migrations, dependencies, provider selection or
activation, payment activation, production upload, deployment, or go-live.

## 2. Executive Summary

Niuva remains one website and one operational platform with two distinct
customer journeys:

1. Business/B2B is the primary public narrative for R&D, design engineering,
   prototyping, consulting, workshops, and partnership work.
2. Retail is the transactional path for ready-stock products, made-to-order
   products, standardized Custom 3D Print, apparel, and merchandise.

Retail Order and B2B Quote/Project remain separate aggregates and lifecycles.
An unsafe Retail configuration transfers to `quote_required` without forcing
the customer to re-enter product, configuration, quantity, contact, or file
context.

The target operator experience is one reduced, structured backoffice that a
non-IT operator can use for content, catalog, pricing, stock, orders,
production, fulfillment, and basic sales monitoring. The MVP does not require
a broad custom page builder, multi-person editorial workflow, ERP, or full B2B
customer portal.

## 3. Business Objectives

| ID | Objective |
| --- | --- |
| `OBJ-01` | Let a non-IT operator maintain public content and portfolio without routine developer assistance. |
| `OBJ-02` | Let customers purchase eligible Retail products through online checkout and payment. |
| `OBJ-03` | Produce a reproducible price and ETA for validated standardized FDM work. |
| `OBJ-04` | Route uncertain, nonstandard, bulk, or high-risk work to quotation without context re-entry. |
| `OBJ-05` | Prevent overselling and expose actionable product and filament shortages to operations. |
| `OBJ-06` | Show customers real order, production, QC, pickup, and shipment milestones. |
| `OBJ-07` | Give the operator a customer-safe, auditable view of orders, production work, and sales activity. |

## 4. Users and Access

### 4.1 Retail customer

`DEC-RT-02` requires a Retail account before private upload, authoritative
checkout, order/payment creation, payment, order history, file access, and
tracking. Anonymous visitors may browse, configure non-sensitive options, and
retain a non-authoritative cart, but the server revalidates all commercial and
eligibility inputs after authentication.

Historical guest-shaped records, if any, remain immutable and
ownership-scoped. Contact matching does not automatically claim an order.

### 4.2 B2B and partnership prospect

- Public inquiry may begin without login.
- MVP inquiry, estimation, quotation, and follow-up are operated manually.
- A complete organization quotation/project portal is excluded from this MVP.
- Retail-to-quote fallback does not merge Retail Order and B2B Quote/Project
  lifecycles.

### 4.3 Internal operator

The expected initial operating model is one person who may perform content,
catalog, warehouse, order, production, QC, and manager-approval duties.
Canonical granular roles and backend authorization remain intact. One account
may hold multiple explicitly assigned roles; `super_admin` remains exclusive.

There is no requirement for different people to act as editor, reviewer, and
approver. An operator who also holds `manager_approver` may approve their own
publication under the existing separation-of-duties rule. Preview, validation,
version history, rollback, and audit remain required.

## 5. MVP Scope

### 5.1 Public website

- Unified Homepage with B2B-primary narrative and clear secondary Retail path.
- About.
- Capabilities/Services.
- Projects/Portfolio.
- Contact and inquiry.
- Retail catalog.
- Privacy and supporting public information required by the approved baseline.

The public label `Capabilities` versus `Services` remains subordinate to the
deferred service-taxonomy decision. This candidate does not silently rename
canonical routes or taxonomy.

### 5.2 Retail and customer surface

- Account registration, login, recovery, and authenticated customer session.
- Catalog categories, search, filtering, availability, and product detail.
- Ready-stock and made-to-order variants.
- Custom 3D Print configuration and private file upload.
- Fixed, calculated, and quote-required pricing behavior.
- Server-authoritative price and ETA review.
- Cart, checkout, online payment, pickup, and delivery.
- Order history, order detail, production tracking, and next action.
- File revision, cancellation request, complaint, reprint, and refund request.
- Dashboard and email notification for approved customer events.

### 5.3 Operator backoffice

- Operational and sales dashboard.
- Structured content and portfolio management.
- Category, product, variant, configuration, media, price, and lead-time
  management.
- Product-variant and filament inventory.
- Restock alerts through the Admin header notification bell and linked workflow.
- Order, payment, file-review, production, QC, pickup, and shipment operations.
- Inquiry and manual quotation work queue.
- Complaint, reprint, refund-request, and reconciliation boundaries.

## 6. Explicit Non-Goals

- Full B2B organization quotation/project portal.
- Automatic printer-calendar booking.
- Automatic recurring membership billing and quota enforcement.
- Live printer telemetry or remote Bambu Lab control.
- Real-time optimization of the full printer fleet.
- Automatic CAD/model repair.
- New manual-transfer or payment-proof workflow.
- ERP, accounting, supplier portal, or automatic procurement.
- Multi-person content approval as a mandatory workflow.
- WhatsApp notification.
- Full profit, supplier-cost, or margin analytics.
- Provider selection, production activation, deployment, or go-live.

## 7. Commercial Offer Model

`DEC-OFFER-01` keeps `offer_type`, `pricing_mode`, and `fulfillment_mode`
independent:

| Offer | Pricing mode | Fulfillment mode | MVP commitment path |
| --- | --- | --- | --- |
| Ready Product | `fixed` | `ready_stock` or `made_to_order` | Direct checkout after stock/capacity validation |
| Standard Custom 3D Print | `calculated` | `made_to_order` | Upload, safe analysis, confirm price/ETA, checkout, payment, production |
| Eligible manually reviewed individual/UMKM request | private one-time fixed Assisted Retail Offer | `made_to_order` | Manager-approved offer, customer acceptance, then normal Retail checkout |
| Complex custom, bulk, bundle, borongan, partnership, or recurring work | `quote_required` | manually governed | Manual inquiry and B2B quotation/project when applicable |
| Self Service / printer rental | manual service price | manual reservation | Public information plus manual request/reservation |
| Membership | manual membership price | manual activation | Public information plus manual application/activation |
| R&D, consulting, workshop, and complex prototyping | `quote_required` | B2B project | Manual inquiry and quotation |

Products and variants may independently declare `ready_stock` or
`made_to_order`. A quote-required route does not create a Retail Order,
reservation, payment attempt, or checkout total. In a mixed cart, the quote
item becomes a separate request while eligible direct-checkout items remain in
the cart.

## 8. Custom 3D Print Configuration and File Rules

### 8.1 Initial process scope

- FDM/filament printing only.
- Initial materials: PLA and ABS under approved pricing rules.
- Niuva machine, process, nozzle, and filament profiles are authoritative.
- Customer-embedded slicer or printer settings are not trusted as the
  commercial calculation source.
- Customer uses Simple mode by default for material, color, quantity,
  dimensions/scale, and one Niuva quality preset.
- Detailed/advanced mode exposes only calibrated fields and values enabled by
  Niuva. Exact exposed fields require prototype and calibration approval.

### 8.2 File handling

| File type | MVP behavior |
| --- | --- |
| `.stl` | Eligible for automated validation and slicing |
| `.3mf` | Eligible only for a supported single model/plate; customer-embedded profiles are ignored and Niuva profiles are applied |
| `.obj`, `.step`, `.stp` | Accepted only for manual technical review and quotation |
| ZIP, multiple distinct files/models/parts, multiple plates, or structurally complex project | Manual technical review and quotation |
| `.gcode` | Rejected |
| PDF, JPG/JPEG, PNG | Optional quotation references only; never geometry or an automatic-pricing source |

Every upload must use the private provider-neutral storage boundary in
`ADR-002`. Production use requires extension, MIME, signature, size, ownership,
authorization, malware/quarantine, quota, retention, backup/restore, and
reconciliation decisions. No public bucket, raw storage path, or local
filesystem production assumption is permitted.

### 8.3 Automated result

When validation and slicing succeed within approved profiles and limits, the
customer sees:

- analyzed file version;
- model dimensions;
- selected material, color, quantity, and configuration;
- billable filament weight;
- estimated print duration;
- selected quality/configuration;
- price breakdown safe for customers;
- final payable production total;
- estimated completion range; and
- pickup or delivery selection and authoritative amount where applicable.

Quantity must use a validated production plan rather than blindly multiplying
one object's price. The customer must confirm every listed field before
checkout. The server revalidates file/configuration, pricing policy, tax,
capacity, ETA, and fulfillment before order/payment-attempt creation. A failed,
stale, unsafe, or uncertain result becomes `quote_required`; the system must
not display an invented final price or ETA.

### 8.4 Quote-required triggers

- File cannot be validated or sliced safely.
- Model exceeds an approved printer build volume or profile.
- CAD/geometry repair is required.
- Material, color, nozzle, or process is not enabled.
- Finishing, assembly, or post-processing is nonstandard.
- Project contains complex parts, plates, dependencies, or instructions.
- Quantity, deadline, capacity, or commercial context cannot be committed
  safely.
- Request is bulk, bundle, borongan, partnership, recurring, or uses
  customer-owned filament.
- Operator risk policy rejects automatic commitment.
- Delivery eligibility or rate cannot be determined safely.

Exact numeric thresholds remain open and must be calibrated with representative
Niuva files and printers.

### 8.5 Quote handoff and Assisted Retail Offer

The handoff preserves the authenticated account, originating product/variant,
configuration, quantity, exact file versions, safe analysis, requested
fulfillment context, and reason codes without customer re-entry.

Bulk, partnership, borongan, recurring, organizational, contractual, or
special/international-fulfillment work follows the B2B Inquiry →
Quote/Project path. An individual or UMKM request that remains suitable for
Retail operations may receive an Assisted Retail Offer.

The Assisted Retail Offer is private, customer-bound, immutable by version, and
uses:

```text
draft
-> awaiting_approval
-> offered
-> accepted | declined | expired | superseded
```

An authorized operator may prepare it; manual price commitment requires
`manager_approver`. A revision creates a new version. Acceptance authorizes
entry into normal Retail checkout but creates no Order, reservation, payment
attempt, or paid state by itself. Checkout revalidates ownership, active
version, `expires_at`, tax, capacity, ETA, and fulfillment. The one-time price
never mutates catalog pricing, and the flow never merges Retail Order with B2B
Quote/Project.

## 9. Pricing Requirements

### 9.1 Standard Custom 3D Print with Niuva filament

Let `g` be the exact billable gram value produced by the approved slicer
profile. Billable weight includes model, support, brim/raft, and applicable
multicolor purge/waste reported by the slicer.

PLA material price:

```text
min(g, 200) * 1000
+ min(max(g - 200, 0), 300) * 900
+ max(g - 500, 0) * 800
```

ABS material price:

```text
min(g, 200) * 1200
+ min(max(g - 200, 0), 300) * 1100
+ max(g - 500, 0) * 1000
```

Machine price:

```text
exact_print_seconds / 3600 * 5000
```

Custom Print production price:

```text
unrounded_custom_print_price = progressive_material_price + machine_price
custom_print_price = ROUND_HALF_UP(unrounded_custom_print_price, 0)
```

Rules:

- A model below 50 grams is charged at its slicer gram value; there is no
  50-gram minimum.
- Weight and duration remain in their original precision.
- Only the final Custom Print production price is rounded to the nearest
  rupiah.
- Single-color and multicolor work use the same formula.
- A multicolor order costs more only through additional slicer-reported weight
  and print time.
- The total includes tax, electricity, basic finishing, basic packaging,
  support removal, QC, and failed-print risk under the approved discussion
  direction.
- Standard Custom 3D Print does not add the separate Full Service fee.

`DEC-PRICE-001` formally governs this formula as policy
`NIUVA-CP-FDM-001`. Its approval date is not its effective date; activation
occurs only with a separately authorized checkout MVP launch and an exact
`Asia/Jakarta` timestamp. `DEC-TAX-01` keeps the customer price tax-inclusive
if applicable, but unknown PKP status blocks PPN labeling and checkout
activation until Finance confirms the versioned tax profile.

Every order stores the raw slicer values, material breakdown, machine
breakdown, unrounded Custom Print price, rounded Custom Print price,
pricing-rule version, material snapshot, configuration snapshot, and
calculation timestamp. Shipping or pickup charges remain outside this formula.

### 9.2 Self Service and membership

| Item | Price or rule |
| --- | --- |
| Printer rental | Rp12.000 per hour |
| Printer package | Rp75.000 per 8 hours |
| Bring customer filament | Rp5.000 per project |
| Communal PLA filament | Rp500 per gram |
| Communal ABS filament | Rp700 per gram |
| Bring customer laptop | Free |
| Niuva PC / Self Service | Rp15.000 per 30 minutes |
| Full Service | Rp35.000 per file |
| Membership | Rp500.000 per month for 50 printer-hours |

Self Service and Full Service are mutually exclusive.

Full Service includes one file, printer/filament profile, orientation, agreed
scale, support, infill, initial slicing, and one parameter correction in the
same session. CAD/model repair, later revised files, new files, and unlimited
revisions are excluded.

Membership hours expire at the end of each month and do not roll over.
Filament is billed separately. MVP application, activation, reservation, and
quota control remain manual.

### 9.3 Commercial history

- Prices use decimal or consistent minor-unit representation, never binary
  floating point.
- Pricing rules and material prices are versioned.
- New prices affect new calculations or explicitly recalculated drafts.
- Paid orders and accepted quotations retain immutable commercial snapshots.
- Referenced commercial records are archived, not hard-deleted.

## 10. Inventory Requirements

### 10.1 Inventory subjects

- Ready-stock product variants.
- Filament by material and color.
- Made-to-order variants expose a made-to-order policy instead of a finished
  goods balance, while their material demand remains operationally visible.

Canonical quantities:

```text
available = on_hand - reserved
projected = available + incoming - planned_demand
```

Customer-facing surfaces expose only `in_stock`, `low_stock`,
`out_of_stock`, or `made_to_order`. Exact balances, reorder points, supplier
data, planned demand, movement reasons, and internal cost remain internal.

### 10.2 Inventory operations

- Receive.
- Reserve.
- Release.
- Consume.
- Produce.
- Ship.
- Damage.
- Adjustment.
- Plan/cancel incoming.
- Plan/cancel demand.

Every mutation requires a unique operation ID, idempotent replay behavior,
negative-stock prevention, conflict handling, immutable movement history, and
an audit record where required.

### 10.3 Checkout reservation

- Checkout revalidates active publication, price, eligibility, and stock.
- Eligible stock is reserved atomically when the order/payment attempt is
  created.
- Successful payment consumes the active reservation atomically according to
  `DEC-INV-01`; it does not create or silently continue a second allocation.
- Failed, cancelled, or expired payment releases the reservation exactly once.
- Late payment after release/expiry enters reconciliation and must not recreate
  stock silently.
- The reservation duration is a fixed 30 minutes from successful creation of
  the order/payment attempt, not from opening the cart.
- Checkout shows a countdown and warns the customer when five minutes remain.
- There is no automatic extension.
- A retry after expiry revalidates price, stock, shipping, and ETA and creates
  a new reservation/payment attempt; it never reactivates the old reservation.
- Payment success versus expiry/release is resolved atomically. If expiry wins,
  a later provider success enters reconciliation.
- A payment method that cannot limit its payment action to the 30-minute
  application reservation must not be activated for MVP.
- The duration is a versioned policy snapshot so later changes do not rewrite
  existing order/payment history.

Custom Print uses slicer-estimated filament to reserve planned material.
Actual operational usage may later reconcile the estimate without changing the
customer's paid snapshot.

### 10.4 Restock alerts

An internal alert cycle begins when:

```text
available <= reorder_point
or
projected < 0
```

Required behavior:

- Admin header bell and linked alert workflow are the primary in-app surface.
- Critical shortage may also generate best-effort email.
- Repeated updates refresh one active alert rather than create notification
  spam.
- The alert resolves only after stock returns to a safe state.
- A later shortage begins a new alert cycle.
- Email failure does not roll back a committed inventory operation.

## 11. Checkout, Payment, Pickup, and Delivery

### 11.1 Checkout

- Authentication is required by `DEC-RT-02`.
- Server preview is authoritative for product, variant, configuration,
  quantity, price, tax, stock, fulfillment, shipping, and ETA.
- Price, stock, or shipping changes before payment require refreshed customer
  confirmation.
- Order creation and all required reservations succeed atomically or fail
  without partial effects.

### 11.2 Payment

- Retail production target is provider-neutral online payment.
- No new manual-transfer instruction, attempt, proof upload, or proof-driven
  transition is permitted.
- Payment actions and events are idempotent.
- Provider-specific payloads, credentials, signatures, and retries remain
  inside the adapter boundary.
- Refund and reconciliation are separate, auditable, idempotent operations.
- Payment and order views expose customer-safe states only.

Provider selection, provider-specific state mapping, webhook authentication,
Finance operations, reconciliation SLA, event retention, and activation remain
open.

### 11.3 Pickup

- Pickup has no shipping charge.
- Customer selects an active approved location during checkout.
- Customer selects an available collection window only after
  `ready_for_pickup`.
- Seven calendar days after `ready_for_pickup_at` without recorded handover
  creates internal `pickup_overdue` and dashboard/email follow-up.
- `pickup_overdue` does not automatically cancel, dispose, transfer ownership,
  charge storage, refund, or complete the order.
- Actual locations, hours, and windows remain activation configuration.

### 11.4 Delivery

- Eligible direct-checkout delivery is domestic Indonesia only.
- International, special-packaging, unsupported, oversize, unsafe, uncertain,
  or missing-profile fulfillment becomes `quote_required`.
- Basic packaging is included in the standard product/Custom Print price.
- Delivery rate is calculated automatically before payment from authoritative
  origin, normalized address, and versioned package inputs.
- Customer selects an eligible service.
- The order snapshots provider-neutral service identity, displayed service
  label, shipping amount, quote timestamp, rate expiry, package/address inputs,
  and delivery estimate.
- Rate validity is the provider expiry capped at 30 minutes from `quoted_at`;
  use 30 minutes when the provider supplies none.
- An expired or changed rate/service/ETA is refreshed and explicitly
  reconfirmed before order/payment-attempt creation.
- A provider failure never produces a guessed rate. Checkout may offer pickup;
  otherwise it becomes `quote_required` or another approved recovery path.
- The committed amount is immutable for the active payment attempt; later
  provider variance/failure enters auditable operational reconciliation.

`DEC-FUL-01` governs this policy. The logistics provider, actual origin/pickup
data, hours/windows, package profiles, service allowlist, Finance treatment,
and operational owner remain activation gates.

## 12. ETA and Customer Milestones

### 12.1 Ready-stock milestones

```text
payment_confirmed
-> processing_or_packing
-> ready_for_pickup -> picked_up
   OR
-> ready_to_ship -> shipped -> delivered
-> completed
```

### 12.2 Made-to-order and Custom Print milestones

```text
payment_confirmed
-> file_review when applicable
-> production_queue
-> printing
-> post_processing when applicable
-> quality_control
-> ready_for_pickup -> picked_up
   OR
-> ready_to_ship -> shipped -> delivered
-> completed
```

Exceptions include `payment_failed`, `file_revision_required`, `on_hold`,
`cancelled`, `refund_pending`, `refunded`, and `rework_required` as applicable.
The exact backend aggregate state machine requires a later approved technical
design; this section defines the required customer-visible milestones.

Before payment, the customer sees versioned `eta_earliest_at` and
`eta_latest_at` in `Asia/Jakarta`. Pickup shows an estimated-ready range;
delivery separately shows ready-to-ship and arrival ranges. Ready Product uses
handling/packing, buffer, and fulfillment. Custom Print additionally uses
applicable file/material readiness, production queue range, exact accepted
slicer time, applicable post-processing, and QC. The MVP does not require live printer
scheduling, predictive optimization, or exact queue-position disclosure.

Authorized `production`, `quality_control`, and `order_admin` update routine
domain milestones/ETA directly with previous/new range, target, actor, time,
reason, customer-safe explanation, version references, and audit. Passing
`eta_latest_at` before its target creates internal `eta_overdue` and requires a
new range/reason without automatic cancellation, refund, reprint, disposal, or
completion.

`DEC-ETA-01` formally governs this policy. Numeric
duration/calendar/buffer profiles, exact backend state machine/API/schema,
notification channels/recipients, implementation, readiness, and go-live
remain gated. Retail Order and B2B Quote/Project retain separate lifecycles.

## 13. Revision, Cancellation, Complaint, and Refund

`DEC-AFTER-01` governs the candidate after-sales policy:

- Before payment, abandonment or cancellation has no paid-order refund and any
  reservation is released exactly once.
- `file_revision_required` provides 48 hours from a successfully available
  customer-facing notice. Each replacement is a new file version; timeout
  enters review without deletion or automatic refund inference.
- An approved paid cancellation before actual printing/customization or
  Ready-Product handoff receives the full eligible paid amount, including
  unused fulfillment. Provider/admin fees are not deducted from the approved
  customer refund amount.
- After irreversible work starts, cancellation is manual. A partial refund is
  permitted only for an exact affected or unperformed amount agreed by the
  customer and Niuva.
- After receipt, ordinary cancellation becomes a complaint, reprint/replacement,
  refund, or return case.
- Complaint intake remains open for at least two working days after the
  authoritative carrier-delivered or pickup-handover event. The deadline does
  not automatically waive later or hidden-defect review.
- Complaint evidence includes a description and reasonable supporting evidence.
  Photo/video is requested when available, but one unavailable evidence format
  does not automatically reject the case.
- Confirmed Niuva error or carrier damage gives the customer affected-scope
  reprint/replacement or refund. Niuva funds required return/replacement
  shipping for the confirmed fault.
- Conforming work has no automatic free reprint/refund or discretionary
  post-receipt change-of-mind return, without creating a blanket no-return or
  no-refund clause.
- Complaint acknowledgement is immediate, first human response targets one
  working day, and the resolution decision targets five working days after
  sufficient evidence. An external investigation keeps the case open and
  requires a safe reason plus revised estimate.
- `order_admin` triages, production/QC contributes domain evidence, `finance`
  prepares refunds, and every refund/free reprint requires
  `manager_approver`.
- Direct-checkout Retail Orders use this policy. B2B Quote/Project after-sales
  follows its accepted quotation, SOW, contract, and change process.
- Decision, evidence references, reason, actor, time, exact amount, provider
  result, reprint/return/refund result, and customer-safe explanation remain in
  append-only history.

Legal/customer wording, working-day configuration, provider refund execution
and timing, Finance accounting/tax correction, evidence privacy/retention,
abuse/fraud handling, long-term uncollected-pickup policy, notification
surfaces, and the exact state/API/schema/idempotency contract remain activation
or implementation gates.

## 14. Notifications

### 14.1 Operator

- In-app Admin notification center/bell is required and routes only to
  role-/permission-/domain-scoped operators.
- Operator events cover paid-order readiness, restock/out-of-stock, payment
  reconciliation, file replacement/deadline, production/QC blockers,
  `eta_overdue`, delivery exception, `pickup_overdue`, complaint/SLA risk,
  refund/free-reprint approval, refund failure, and terminal notification
  delivery conditions.
- Email is mandatory for the responsible role's critical inventory or
  operational conditions. Routine work stays in the applicable dashboard or
  queue.
- WhatsApp is excluded from MVP.

### 14.2 Customer

The authenticated Retail Order owner is the only customer recipient. The
allowlist covers:

- payment confirmation or a failed/expired/uncertain outcome requiring action;
- `file_revision_required` and its deadline;
- material ETA change or `eta_overdue`;
- `ready_for_pickup`, shipment, delivery exception, and receipt;
- cancellation acknowledgement/decision;
- complaint acknowledgement, evidence request, and decision;
- approved reprint/replacement and material fulfillment progress; and
- refund submission, processing, success, failure, or reconciliation.

Complete production tracking remains on the order detail. Routine
production-progress email uses one default-on customer preference; in-app
allowlisted events and transactional/action-required email cannot be disabled.

The 31 July 2026 NMVP-D07 amendment to `DEC-DATA-003` formally governs this
surface. It requires minimal versioned safe payloads, separate customer/operator
same-origin link allowlists, authentication plus ownership/permission checks,
source-event idempotency, at most five email attempts, terminal `exhausted`,
role-scoped alerting, and controlled audited `order_admin` resend. Marketing,
broadcast, arbitrary recipients, direct email actions, and WhatsApp are
excluded.

General notifications retain for 180 days and terminal email-delivery metadata
for 30 days. Delivery failure never rolls back the successful core transaction.
Provider/worker selection, exact event/source mapping, preference UI, schema
and source implementation, migration, activation, readiness, B2B notification
policy, and go-live remain separate gates.

## 15. CMS and Operator Experience

The functional requirement is a single, reduced, structured operating
experience for a non-IT operator.

Content scope:

- About.
- Capabilities/Services.
- FAQ.
- CTA and Contact.
- SEO.
- Media.
- Portfolio/Projects.
- Catalog content and supporting product information.

Minimum behavior:

- structured fields;
- required-field validation;
- preview;
- authorized publish/schedule;
- immutable version history;
- rollback;
- archive/soft delete; and
- audit.

The system does not require a different human reviewer. It does require the
authorized role and server validation. Publication of a customer/client name,
photo, model, or project asset does not require an extra product-owner workflow
in the UI, but Niuva remains responsible for approved media rights, privacy,
and content evidence.

Current canonical authority requires an integrated structured CMS and excludes
an external CMS. The approved discussion selection is `NMVP-D08` Option A:
retain a reduced integrated structured CMS for MVP. External managed CMS
options are deferred outside MVP and may be reconsidered only if operator
usability or maintenance evidence justifies a new formal decision.

## 16. Operator Dashboard and Reporting

The dashboard must support operational monitoring, not claim to be an
accounting or profit system.

Required metrics and queues:

- value of succeeded payments by period;
- refunds shown separately;
- paid-order count by period;
- order count and value by offer, product, SKU, and category;
- average paid-order value with an explicit calculation definition;
- payment success/failure and checkout abandonment where instrumented;
- order status and next-action queue;
- file revisions requiring customer response;
- production queue and at-risk ETA;
- QC, rework, pickup, and shipment queue;
- ready-stock and filament shortage;
- inquiry and quotation follow-up queue; and
- inventory accuracy and stockout events.

Target values are set only after reliable baseline data exists. Customer,
supplier, cost, margin, and profit data follow least-privilege projections.

## 17. Non-Functional Requirements

### Security and privacy

- Backend authorization and query scope enforce access.
- Customer data uses explicit allowlists.
- Production files are private and ownership-scoped.
- Logs exclude secrets, raw provider payloads, unnecessary personal data, and
  file contents.
- Uploaded files use validation, quarantine, and controlled access boundaries.

### Integrity and reliability

- Money uses Decimal/minor units.
- Price and policy snapshots are immutable after commitment.
- Inventory, checkout, payment, refund, and provider-event operations are
  idempotent.
- Transaction-required cross-collection mutations fail closed with
  `503 transaction_unavailable` when capability is absent.
- Notification failure does not roll back a successful core transition.
- Referenced history is preserved; migration and cleanup are non-destructive.

### Accessibility and responsive behavior

- Indonesian is the primary language.
- Desktop, tablet, and mobile are supported without lost actions or horizontal
  overflow.
- Keyboard, visible focus, semantic status, accessible forms, and assistive
  upload feedback are required.
- Mobile interactive targets use 44px as the general target.
- Meaning does not depend on color, icon, animation, or fake percentage.
- Reduced-motion behavior preserves every action and state.

## 18. Product Acceptance Criteria

The MVP candidate is product-complete only when:

1. A non-IT operator can manage content, portfolio, product, price, stock, and
   routine order work without developer intervention.
2. Eligible ready stock cannot be oversold under concurrent checkout.
3. Custom Print price is reproducible from exact slicer data and the stored
   pricing-rule snapshot.
4. Unsafe work becomes quotation without data re-entry or invented totals.
5. The customer confirms authoritative total and ETA before payment.
6. Duplicate requests or provider events do not duplicate order, payment,
   reservation, refund, inventory, or notification effects.
7. Paid orders do not change when catalog, material, or pricing rules change.
8. Customers see real milestones, ETA, next action, and safe recovery paths.
9. Restock shortage produces one active alert cycle and resolves when safe.
10. File access is private, authenticated, ownership-scoped, and auditable.
11. Dashboard reporting separates succeeded payment value and refunds and
    exposes actionable order, production, and stock queues.
12. Retail and B2B remain understandable as separate journeys in one platform.
13. Core customer and operator paths meet responsive and accessibility
    requirements.

## 19. Decision and Readiness Gates

### Formally reconciled selections

- Offer/file eligibility, Simple/Detailed configuration, automatic-pricing
  confirmation, quote routing, mixed-cart behavior, and Assisted Retail Offer
  are governed by `DEC-OFFER-01`.
- Account-required checkout and historical guest compatibility are governed by
  `DEC-RT-02`.
- Custom Print formula, inclusions, versioning, refund snapshot boundary, and
  final-only rounding are governed by `DEC-PRICE-001`.
- Tax-inclusive display and the unknown-PKP Finance activation gate are
  governed by `DEC-TAX-01`.
- Pickup, domestic delivery, rate validity, fulfillment snapshots, and
  pickup-overdue behavior are governed by `DEC-FUL-01`.
- Retail ETA ranges, factual milestones, authorized audited updates, and
  `eta_overdue` behavior are governed by `DEC-ETA-01`.
- Retail file revision, lifecycle-specific cancellation, complaint,
  reprint/replacement, refund, return, SLA, and approval policy are governed by
  `DEC-AFTER-01`.
- Direct-checkout Retail operator/customer recipients, event allowlists,
  dashboard/email behavior, safe payloads/links, retry/resend, and audit are
  governed by amended `DEC-DATA-003`.
- Reduced integrated CMS Option A is governed by `DEC-OPS-003`.
- The fixed 30-minute checkout reservation and its payment-expiry race
  invariants are governed by `DEC-INV-01`.

### Still open

- Payment, logistics, email, and storage providers.
- Payment state mapping, webhook authentication, Finance operations, and
  reconciliation SLA.
- Niuva PKP status, taxable classification, tax rate/basis, invoice behavior,
  regulatory reference, and accountable Finance approver.
- File size, quota, retention, malware, backup/restore, and storage owners.
- Printer, nozzle, build-volume, filament, process, and quality profiles.
- Simple/Detailed fields and allowed values, file/build/quantity/deadline/
  capacity/risk thresholds, and the default/allowed Assisted Retail Offer
  expiry.
- ETA duration, operating-calendar, buffer, and customer-safe reason-copy
  profiles plus exact backend state machine/API/schema.
- Numeric quote-required and high-risk thresholds.
- Opening balances and reorder points by SKU/material/color.
- Fulfillment origin, pickup locations/hours/windows, package profiles,
  domestic address validation, service allowlist, Finance treatment,
  operations ownership, and carrier recovery procedure.
- After-sales legal/customer wording, working-day configuration, provider
  execution/timing, Finance accounting/tax correction, evidence
  privacy/retention, abuse/fraud handling, long-term uncollected-pickup policy,
  and exact technical contract.
- Notification provider, scheduler/worker topology, exact event/source mapping,
  preference UI, schema/source implementation, migration, B2B notification
  policy, and activation.
- Production readiness and go-live.

An external CMS provider is not part of the selected MVP topology. Reopening
that option requires a new product/architecture decision rather than provider
selection under this candidate.

## 20. Recommended Follow-On Sequence

1. Keep this candidate registered as provenance; its `NMVP-D01` through
   `NMVP-D08` product selections are now represented by canonical records.
2. Use `DEC-ARCH-01` / `ADR-004` and `DEC-UX-003` as the canonical topology
   and route inputs; keep the Candidate MVP User Flow & Route Contract as
   provenance and activation-gate context.
3. Validate a clickable prototype with the intended non-IT operator.
4. Run a bounded STL/3MF slicing, profile, threshold, quantity-plan, and price
   calibration technical spike.
5. Define the Assisted Retail Offer technical contract and expiry calibration.
6. Evaluate providers against the approved provider-neutral requirements.
7. Produce an implementation plan in bounded vertical slices.

No step in this sequence authorizes implementation, migration, provider
activation, deployment, production readiness, or go-live by implication.
