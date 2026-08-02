# Niuva MVP Product Decision Packet

Status: **Context Only — Formal Product Promotion Complete — No Implementation Authority**
Prepared: 30 July 2026
Decision update: Explicit user approval of `NMVP-D08` Option A and a fixed
30-minute checkout reservation, followed by explicit approval to promote
`NMVP-D01` Option A, `NMVP-D03`, and `NMVP-D04` on 30 July 2026. PKP status
was recorded as unknown and launch-relative effective date was approved.
`NMVP-D05` was explicitly approved on 31 July 2026. Promoted as
`DEC-OPS-003`, `DEC-INV-01`, `DEC-RT-02`, `DEC-PRICE-001`, `DEC-TAX-01`,
`DEC-FUL-01`, and `DEC-ETA-01`. `NMVP-D06` and all six `NMVP-D07` decision
groups were explicitly approved on 31 July 2026 and promoted as
`DEC-AFTER-01` and an amendment to `DEC-DATA-003`. All six `NMVP-D02`
decision groups, including Option B — Assisted Retail Offer, were explicitly
approved on 31 July 2026 and promoted as `DEC-OFFER-01`.
Related PRD candidate: `docs/implementation/specs/candidates/2026-07-30-niuva-mvp-prd.md`
Scope: Product-policy reconciliation required before Niuva MVP user-flow,
technical design, or transactional implementation approval

## 1. Purpose

This packet records:

- product selections explicitly approved in the 30–31 July 2026 discussion;
- conflicts between those selections and current canonical authority;
- decisions that remain genuinely open;
- recommended options and consequences; and
- the formal approval records required before implementation.

This packet is not an approved Decision Register entry. The local references
`NMVP-D01` through `NMVP-D08` remain packet identifiers only. Formal
`DEC-RT-02`, `DEC-OFFER-01`, `DEC-PRICE-001`, `DEC-TAX-01`, `DEC-FUL-01`,
`DEC-ETA-01`, `DEC-AFTER-01`, amended `DEC-DATA-003`, `DEC-OPS-003`, and
`DEC-INV-01` records now govern the promoted selections.

Nothing in this packet authorizes source changes, API or schema changes,
migrations, dependency changes, provider selection or activation, payment,
production upload, deployment, production readiness, or go-live.

## 2. Authority and Invariants

The following remain non-negotiable:

1. Niuva is one website and one operational platform.
2. Business/B2B remains the primary public narrative; Retail remains a clear
   secondary transactional path.
3. Retail Order and B2B Quote/Project remain separate aggregates and state
   machines.
4. Unsafe pricing or scheduling becomes `quote_required` without customer
   context re-entry.
5. Backend authorization and query scope enforce least privilege.
6. Customer projections exclude cost, margin, supplier, profit, internal
   notes, raw provider payloads, and unrelated audit data.
7. Transaction-required cross-collection operations fail closed without
   MongoDB transaction capability.
8. Production files remain private behind the provider-neutral `ADR-002`
   storage boundary.
9. Retail payment remains provider-neutral online payment; new manual transfer
   and payment-proof activity remain disabled.
10. Paid orders, accepted quotations, inventory movements, and audit history
    are not silently rewritten or deleted.
11. Notification failure does not roll back a committed core transaction.
12. No candidate decision implies implementation, provider activation,
    production readiness, or go-live.

## 3. Reconciliation Summary

| Packet ID | Topic | Discussion selection | Current repository status | Required action |
| --- | --- | --- | --- | --- |
| `NMVP-D01` | Retail identity | Account required | Approved and baseline amended by `DEC-RT-02` | Prepare separately authorized UX/implementation planning |
| `NMVP-D02` | Offer and file routing | Independent offer/pricing/fulfillment; safe file matrix and automatic pricing; Option B Assisted Retail Offer | Approved by `DEC-OFFER-01` | Calibrate profiles/thresholds/offer expiry and prepare separately authorized technical planning |
| `NMVP-D03` | Pricing | Progressive material + Rp5.000/hour; final half-up rounding | Formula approved by `DEC-PRICE-001`; tax-inclusive direction and Finance gate governed by `DEC-TAX-01` | Confirm tax profile and separately authorize activation |
| `NMVP-D04` | Inventory and fulfillment | Stock management, pickup, automatic delivery rate, fixed 30-minute reservation | Reservation governed by `DEC-INV-01`; pickup/delivery governed by `DEC-FUL-01` | Configure providers/operations and separately authorize implementation/activation |
| `NMVP-D05` | ETA and tracking | Range before payment; real milestones | Approved by `DEC-ETA-01` | Configure Operations inputs and separately authorize implementation/activation |
| `NMVP-D06` | Revision and after-sales | 48-hour file revision; lifecycle-specific cancellation/refund; at least two-working-day complaint intake; governed reprint/return/SLA/approval | Approved by `DEC-AFTER-01` | Complete legal/Operations/Finance/technical activation gates before implementation or publication |
| `NMVP-D07` | Notifications | Authenticated-owner/role-scoped dashboard plus allowlisted email; no WhatsApp | Approved as the 31 July 2026 amendment to `DEC-DATA-003` | Configure provider/worker/exact event mapping and separately authorize implementation/activation |
| `NMVP-D08` | CMS/backoffice | Option A: reduced integrated structured CMS | Approved by `DEC-OPS-003` | Validate operator usability and prepare a separately authorized bounded implementation plan |

## 4. NMVP-D01 — Retail Account Requirement

### Context

The approved baseline supports guest checkout and verified-contact tracking.
The discussion selected mandatory account creation for checkout and customer
tracking.

### Options

#### Option A — Account required

- Anonymous visitors may browse and configure.
- Authentication is required before checkout, payment, file access, order
  history, and tracking.
- Cart/configuration/file handoff must survive the login boundary safely.

Benefits:

- one ownership model for orders and private files;
- simpler order history, repeat order, address, and notification experience;
- removes guest magic-link and verified-contact tracking complexity.

Trade-offs:

- adds registration/login friction before conversion;
- account recovery and session reliability become checkout dependencies;
- required formal amendment of the guest-first baseline and candidate checkout
  documents, now completed by `DEC-RT-02`.

#### Option B — Retain guest and account checkout

Benefits: lower initial commitment and retains the current approved baseline.

Trade-offs: requires guest session, verified-contact tracking, later claim
flow, and more complex private-file ownership.

### Recorded discussion selection

**Option A — Account required.**

### NMVP-D01 formal promotion record

`DEC-RT-02` formally approves account-required checkout and amends the guest
persona, `BR2-06`, `FR-RT-06`, `FR-RT-10`, `FR2-04`, `FR2-19`, and
guest-first assumptions in the existing Retail checkout candidate.

It defines non-authoritative cart continuity, authenticated file ownership,
post-login revalidation, registration/recovery failure behavior, session
expiry, and historical guest compatibility. Implementation, migration,
historical claim, deployment, production readiness, and go-live remain
separately gated.

## 5. NMVP-D02 — Offer, File, and Quote Routing

### Approved contract

1. `offer_type`, `pricing_mode`, and `fulfillment_mode` remain independent.
   Ready Products may be fixed and ready-stock or made-to-order. Standard
   Custom 3D Print is calculated and made-to-order only while every required
   validation succeeds.
2. The configurator provides a default Simple mode and an optional
   Detailed/advanced mode. Only calibrated Niuva machine, nozzle, material,
   support, and process profiles are authoritative.
3. `.stl` and a supported single-model/plate `.3mf` may enter automatic
   validation and slicing. Customer-embedded profiles are ignored. `.obj`,
   `.step`, `.stp`, ZIP, multiple models/parts/plates, and complex projects
   require manual review. PDF/JPG/JPEG/PNG are reference attachments only.
   Customer `.gcode` is rejected.
4. Automatic pricing is allowed only when file, slicing, profile, dimensions,
   configuration, quantity production plan, pricing, tax, capacity, ETA,
   fulfillment, and operator-risk validation all succeed. Before checkout the
   customer confirms the exact file version, dimensions/scale,
   material/color/quantity/configuration, billable grams, print duration,
   customer-safe breakdown, final production total, ETA, and fulfillment. The
   server revalidates before commitment.
5. Validation/slicing failure, unsupported build/profile, CAD repair,
   unsupported material/color/nozzle/process, nonstandard finishing/assembly/
   post-processing, complex files, unsafe quantity/deadline/capacity,
   bulk/bundle/borongan/partnership/recurring/customer-filament work, unsafe
   fulfillment, or an audited operator risk rejection becomes
   `quote_required`.
6. A quote item is separated from a mixed cart and retains its account,
   product, configuration, file, analysis, quantity, fulfillment, and reason
   context without creating an Order, reservation, payment attempt, or checkout
   total. Bulk and organizational work follows B2B. An eligible individual or
   UMKM may use Option B — Assisted Retail Offer.

The Assisted Retail Offer is private, customer-bound, and immutable by version
with `draft → awaiting_approval → offered → accepted | declined | expired |
superseded`. Manual price commitment requires `manager_approver`. Acceptance
only authorizes entry into normal Retail checkout, where ownership, active
version, expiry, tax, capacity, ETA, and fulfillment are revalidated. It does
not mutate catalog pricing or merge Retail and B2B.

### Alternatives considered

- Accept every Bambu Studio import format for automatic pricing: rejected
  because importer support does not itself prove safe, repeatable automated
  pricing behavior.
- Reject all non-STL input: rejected because 3MF is relevant to Bambu workflows
  and richer project context, while manual review can safely retain other
  formats.
- Display an approximate final price after slicing failure: rejected because it
  would create an unsafe commercial promise.

### Approved selection — NMVP-D02

All six decision groups and **Option B — Assisted Retail Offer** are approved.

### NMVP-D02 formal promotion record

`DEC-OFFER-01` formally approves the independent offer/pricing/fulfillment
model, Simple/Detailed configuration boundary, allowed-input matrix,
automatic-pricing eligibility and customer confirmation, quote-required
triggers, mixed-cart/context handoff, Retail/B2B routing, and Assisted Retail
Offer lifecycle.

Exact preset/advanced fields, file/storage limits, machine/process/build/
quantity/deadline/risk thresholds, and default offer expiry remain calibration
or technical gates. `ADR-002` storage readiness, providers, exact schema/API/
state/idempotency/audit contracts, implementation, migration, activation,
deployment, production readiness, and go-live remain separately gated.

## 6. NMVP-D03 — Custom Print Pricing and Rounding

### Proposed selected rule

PLA:

```text
min(g, 200) * 1000
+ min(max(g - 200, 0), 300) * 900
+ max(g - 500, 0) * 800
```

ABS:

```text
min(g, 200) * 1200
+ min(max(g - 200, 0), 300) * 1100
+ max(g - 500, 0) * 1000
```

Machine:

```text
exact_print_seconds / 3600 * 5000
```

Custom Print production price:

```text
ROUND_HALF_UP(progressive_material_price + machine_price, 0)
```

Selected policy:

- no 50-gram minimum;
- no weight or duration rounding;
- single-color and multicolor use the same formula;
- slicer-reported support, brim/raft, and purge/waste are billable;
- tax, electricity, basic finishing, basic packaging, support removal, QC, and
  failed-print risk are included;
- no separate Full Service fee for standard Custom 3D Print; and
- raw slicer values and commercial snapshots remain stored.

### Alternatives considered — NMVP-D03

- Apply each tier to the whole weight: rejected because it creates price cliffs.
- Round weight or duration before calculation: rejected because it changes
  technical input and makes reproduction less accurate.
- Round every component: rejected because repeated rounding can distort totals.
- Add a 50-gram minimum: rejected by the recorded business rule.

### Recorded discussion selection — NMVP-D03

Approve the proposed pricing and final-only rounding direction.

### Formal promotion records

`DEC-PRICE-001` approves policy `NIUVA-CP-FDM-001`, including formula,
inclusions, final-only rounding, immutable versioning, launch-relative
`effective_at`, and original-snapshot refund/historical behavior.

`DEC-TAX-01` approves the tax-inclusive display direction while recording
Niuva's PKP status as unknown. PPN labeling, tax rate/basis, classification,
invoice behavior, and checkout activation remain blocked until Finance
approves a versioned production tax profile.

These records resolve no provider, reconciliation-operation,
production-readiness, or go-live decision.

## 7. NMVP-D04 — Inventory, Pickup, Delivery, and Reservation

### Recorded discussion selection — NMVP-D04 inventory and fulfillment

- Track ready-stock variants and filament by material/color.
- Support `ready_stock` and `made_to_order` per variant.
- Customer sees safe status only; operator sees exact balance.
- Notify the operator through dashboard and critical email.
- Offer pickup and delivery.
- Pickup has no shipping charge.
- Basic packaging is included; special packaging becomes `quote_required`.
- Direct-checkout delivery is domestic Indonesia only; international delivery
  becomes `quote_required`.
- Calculate delivery rate automatically before payment using authoritative
  address and package inputs.
- Use provider expiry capped at 30 minutes, or 30 minutes when none is supplied.
- Refresh and explicitly reconfirm an expired or changed rate/service/ETA.
- Snapshot the selected provider-neutral service, amount, address/package,
  quote timestamps, ETA, and later tracking on the order.
- Unsupported/unsafe delivery routes to pickup, quotation, or an approved
  recovery path without a guessed rate.
- Select pickup location during checkout and collection window after
  `ready_for_pickup`.
- Seven days without pickup creates internal `pickup_overdue` plus
  dashboard/email follow-up, never automatic cancellation, disposal, storage
  fee, refund, or completion.

### Reservation options

#### Option A — Fixed short reservation window

The system reserves inventory for a configured duration during payment.

Benefits: predictable release and simpler monitoring.

Trade-offs: duration may not fit every payment method or provider action.

#### Option B — Provider-action-aware window

Reservation expiry considers the allowed provider payment-action window, with
an application maximum.

Benefits: better alignment with actual payment flow.

Trade-offs: more provider mapping and reconciliation complexity.

#### Option C — Reserve only after payment

Rejected for ready stock because concurrent successful payments can oversell
the final unit.

### Recorded discussion selection — NMVP-D04 reservation

Use **Option A — fixed 30-minute reservation** for MVP:

- the reservation begins after the order/payment attempt is created
  successfully, not when the customer opens the cart;
- checkout displays a countdown and a five-minute warning;
- there is no automatic extension;
- payment success before expiry consumes the allocation according to the
  approved order/inventory transition;
- failed, cancelled, or expired payment releases the reservation exactly once;
- a retry after expiry revalidates price, stock, shipping, and ETA and creates
  a new reservation/payment attempt;
- an old reservation is never reactivated;
- payment success versus expiry/release is resolved atomically;
- a late provider success after expiry enters reconciliation and does not
  recreate stock or silently produce a paid order; and
- a payment method that cannot enforce a compatible action expiry is not
  eligible for MVP activation.

The 30-minute duration is stored as a versioned policy snapshot so a later
change does not rewrite existing order/payment history. A future provider-aware
policy requires a new approved decision.

### Formal promotion records — NMVP-D04

`DEC-INV-01` formally approves the fixed 30-minute reservation and its atomic
expiry, retry, versioned-snapshot, payment-method compatibility, and
late-success reconciliation invariants.

`DEC-FUL-01` formally approves Rp0 pickup, domestic automatic delivery rate,
provider expiry capped at 30 minutes, basic-packaging inclusion,
international/special/unsupported quotation fallback, immutable fulfillment
snapshots, and seven-day pickup-overdue follow-up.

Payment/logistics provider selection, actual location/origin/package/service
configuration, Finance treatment, operational ownership, reconciliation SLA,
implementation verification, checkout activation, production readiness, and
go-live remain separately gated.

## 8. NMVP-D05 — ETA and Customer Milestones

### Recorded discussion selection — NMVP-D05

Before payment:

- ready stock uses handling/packing, buffer, and applicable fulfillment;
- made-to-order and Custom Print additionally use applicable file/material
  readiness, production queue range, exact accepted slicer time, applicable
  post-processing, and QC;
- pickup shows estimated-ready range;
- delivery separates ready-to-ship and arrival ranges; and
- customer sees `eta_earliest_at`–`eta_latest_at` in `Asia/Jakarta`, not a
  guaranteed fake precision.

Customer-visible Custom Print milestones:

```text
payment_confirmed
-> file_review
-> production_queue
-> printing
-> post_processing_when_applicable
-> quality_control
-> ready_for_pickup -> picked_up
   OR
-> ready_to_ship -> shipped -> delivered
-> completed
```

Authorized `production`, `quality_control`, and `order_admin` may update routine
domain milestones and ETA directly. History stores previous/new range, target,
actor, time, reason, customer-safe explanation, version references, and audit.
Passing `eta_latest_at` before the target creates internal `eta_overdue` and
requires a new range/reason without automatic cancellation, refund, reprint,
disposal, or completion. Live printer scheduling is excluded from MVP.

### Alternatives considered — NMVP-D05

- Fake percentage completion: rejected by the approved platform baseline.
- No ETA before payment: rejected because the customer needs time expectation
  before commitment.
- Live printer telemetry as MVP dependency: rejected as excessive scope and
  operational coupling.

### Formal promotion record — NMVP-D05

`DEC-ETA-01` formally approves Retail date/time ranges before payment, separate
ready/arrival targets, factual customer milestones, routine authorized operator
updates with append-only history, customer-safe reasons, and `eta_overdue`
without automatic after-sales action.

Numeric duration/calendar/buffer profiles, safe reason copy, exact backend
aggregate state machine/API/schema, notification channels/recipients,
implementation, production readiness, and go-live remain separately gated.

## 9. NMVP-D06 — File Revision, Cancellation, Complaint, and Refund

### Recorded discussion selection — NMVP-D06

- `file_revision_required` provides 48 hours from a successfully available
  customer-facing notice. No response enters cancellation/refund review without
  deleting history or inferring an automatic refund amount.
- Unpaid cancellation has no paid-order refund and releases reservation exactly
  once. An approved paid cancellation before irreversible work receives the
  full eligible customer-paid amount, including unused fulfillment, without a
  provider/admin-fee deduction.
- After actual printing/customization or Ready-Product handoff, cancellation is
  manual. A partial refund requires an exact affected or unperformed amount
  agreed by the customer and Niuva.
- Complaint intake remains open for at least two working days after
  carrier-delivered or recorded pickup handover. The deadline is not an
  automatic waiver of later or hidden-defect review.
- Reasonable photo/video evidence is requested when available; one missing
  evidence format does not automatically reject a complaint.
- Confirmed Niuva error or carrier damage gives the customer affected-scope
  reprint/replacement or refund. Niuva funds required return and replacement
  shipping for those confirmed faults.
- The MVP has no discretionary post-receipt change-of-mind return for conforming
  goods, but it also has no blanket no-return/no-refund clause.
- Complaint acknowledgement is immediate. First human response targets one
  working day, and a resolution decision targets five working days after
  sufficient evidence.
- `order_admin` triages, domain roles contribute evidence, `finance` prepares
  refunds, and every refund or free reprint/replacement requires
  `manager_approver`.
- Direct-checkout Retail Orders use the policy. B2B Quote/Project after-sales is
  governed by the accepted quotation, statement of work, or contract.

### Formal promotion record — NMVP-D06

`DEC-AFTER-01` formally approves the product-policy direction above. It also
requires immutable commercial/fulfillment/tax snapshots, separate idempotent
refund records, append-only case history, and exact actor/reason/amount/result
audit.

Legal/customer terms, working-day configuration, provider refund execution and
timing, Finance accounting/tax correction, evidence privacy/retention,
abuse/fraud handling, long-term uncollected-pickup policy, notification
surfaces, exact technical contract, implementation, readiness, and go-live
remain separately gated.

## 10. NMVP-D07 — Operator and Customer Notifications

### Recorded discussion selection — NMVP-D07

Operator:

- Admin dashboard/header notification bell;
- email for critical stock or operational events;
- no WhatsApp.

Customer:

- authenticated dashboard notification;
- email for important payment, file, production, ETA, fulfillment,
  cancellation, and refund events;
- no WhatsApp.

### Canonical boundary

`DEC-DATA-003` already requires a recipient-scoped in-app canonical record,
provider-neutral delivery outbox, deduplication, 180-day in-app retention,
30-day terminal delivery-metadata retention, bounded retries, and no rollback
of successful core transactions.

The original 29 July decision explicitly did not authorize a new customer
recipient surface, provider, scheduler, SLA, or source implementation.

### Approved selection

All six decision groups were explicitly approved on 31 July 2026:

1. the authenticated Retail Order owner and role-/domain-scoped operators are
   the permitted recipients;
2. customer and operator event categories are allowlisted around actionable
   payment, file, production/ETA, fulfillment, after-sales, stock,
   reconciliation, approval, and terminal-delivery conditions;
3. in-app allowlisted events are mandatory, transactional email is enqueued
   when required, routine production-progress email uses one default-on
   preference, and WhatsApp/marketing/broadcast are excluded;
4. title/body/template payloads are minimal, versioned, and customer-safe;
5. customer/operator deep links use separate same-origin allowlists plus
   authentication and ownership/permission checks; and
6. source-event idempotency, at most five email attempts, terminal
   `exhausted`, role-scoped alerting, controlled `order_admin` resend, safe
   audit metadata, and existing 180-/30-day retention apply.

Complete production tracking remains on the Retail Order detail rather than
creating a bell/email event for every routine milestone.

### Formal promotion record — NMVP-D07

The selection is promoted as the 31 July 2026 amendment to
`DEC-DATA-003`. The amendment retains the existing provider-neutral outbox,
privacy, retention, historical-data, and non-rollback boundaries.

Email provider, scheduler/worker topology, exact enum/source-transition mapping,
preference UI, schema/source implementation, migration, deployment, readiness,
B2B notification policy, and go-live remain open.

## 11. NMVP-D08 — CMS and Reduced Backoffice Topology

### Context — NMVP-D08

The product objective is to let one non-IT operator manage content, portfolio,
catalog, stock, orders, production, and sales monitoring without a broad
custom CMS burden.

Current canonical authority requires a structured integrated CMS in Admin
Studio and explicitly excludes an external CMS/free-form page builder.

### Options — NMVP-D08

#### Option A — Reduced integrated structured CMS

Retain the current modular-monolith and Admin Studio boundary. Limit content to
structured fields, preview, publish/schedule, version, rollback, archive, and
audit.

Benefits:

- aligns with current canonical authority;
- one identity, permission model, and operator surface;
- catalog, price, media, and publication validation remain close to operations;
- no provider integration or content synchronization boundary.

Trade-offs:

- Niuva continues to own and maintain the content module;
- operator usability still requires deliberate UX and testing.

#### Option B — External managed CMS with its own operator UI

Benefits:

- mature authoring, media, preview, and version capabilities may reduce custom
  content implementation.

Trade-offs:

- requires a formal canonical amendment;
- creates a second operator system and identity/access boundary;
- adds provider cost, content projection, webhook/sync, availability,
  migration, backup, retention, and lock-in decisions;
- does not replace commerce, pricing, inventory, production, or tracking
  backoffice.

#### Option C — External managed CMS behind the Niuva Admin shell

Benefits: preserves a more unified operator experience while delegating content
storage/workflow.

Trade-offs: highest integration complexity; Niuva must still build the adapter,
permission mapping, preview, error recovery, synchronization, and operational
ownership.

### Recorded discussion selection — NMVP-D08

Retain **Option A — reduced integrated structured CMS** for MVP. Validate it
with the intended operator before reversing the canonical architecture. Keep
Options B/C deferred outside MVP and reconsider them only if operator testing
or maintenance evidence demonstrates that the integrated module cannot meet
the objective.

This selection does not claim that the existing implementation already
meets the required usability or completeness.

### Formal promotion record — NMVP-D08

`DEC-OPS-003` formally approves Option A and defines the reduced integrated CMS
topology for MVP. It still requires operator validation and a separately
authorized bounded UX and implementation plan, not a full page builder.
Any later selection of B or C requires a new superseding
product/architecture decision, provider-neutral data/portability requirements,
migration strategy, and provider approval.

## 12. Provider and Operational Decisions That Remain Open

This packet does not select:

- payment gateway;
- logistics/rate/tracking provider;
- email provider;
- production private object-storage provider;
- printer automation or slicing deployment topology;
- scheduler, queue, telemetry, or alert provider; or
- production infrastructure.

It also does not resolve:

- payment state mapping and webhook authentication;
- Finance reconciliation SLA;
- file size, quota, retention, backup/restore, malware, and incident ownership;
- exact machine/nozzle/material/process profiles;
- exact Simple/Detailed fields, automatic-pricing thresholds, and Assisted
  Retail Offer default/allowed expiry;
- ETA duration, operating-calendar, buffer, and customer-safe reason-copy
  profiles plus exact backend state machine/API/schema;
- automatic-pricing and quote-required numeric thresholds;
- opening stock and reorder points;
- fulfillment origin, pickup locations/hours/windows, package profiles,
  domestic address validation, service allowlist, Finance treatment,
  operations owner, and recovery procedure;
- after-sales legal/customer wording, working-day configuration, provider
  execution/timing, Finance accounting/tax correction, evidence
  privacy/retention, abuse/fraud handling, long-term uncollected-pickup policy,
  and exact technical contract;
- production readiness; or
- go-live.

An external CMS provider is not part of the selected MVP topology. Reopening
that option requires a new product/architecture decision.

## 13. Required Formal Records

Before a user-flow contract is treated as implementation input, owners should
record:

1. A documented Finance tax profile covering PKP status, classification,
   rate/basis, invoice behavior, effective timestamp, and approver.
2. A documented technical contract for the approved after-sales lifecycle,
   conflicts, case schema/API, customer-safe projection, and idempotency.
3. A documented technical contract for the approved notification event/source
   mappings, audience-specific routes, preferences, worker/resend behavior, and
   customer-safe projections.
4. A documented technical contract for the approved offer/file eligibility,
   automatic-pricing validation, quote handoff, Assisted Retail Offer
   versioning/approval/expiry, and checkout revalidation.
5. A documented list of still-open provider, technical, operations, Finance,
   legal, readiness, and go-live gates.

The offer/file/quote-routing contract, account-required checkout, Custom Print
commercial policy, tax-inclusive direction, fixed 30-minute reservation,
fulfillment policy, Retail ETA/milestone policy, revision/after-sales policy,
Retail notification policy, and reduced integrated CMS records are complete as
`DEC-OFFER-01`, `DEC-RT-02`, `DEC-PRICE-001`, `DEC-TAX-01`, `DEC-INV-01`,
`DEC-FUL-01`, `DEC-ETA-01`, `DEC-AFTER-01`, amended `DEC-DATA-003`, and
`DEC-OPS-003`.

The Master Spec, Document Register, Decision Register, approved PRD, or
candidate checkout designs must be reconciled only after the applicable
approval and only within its explicit scope. Historical records are preserved.

## 14. Approval Record to Complete

The approving owners must record:

- selected option for every decision above;
- explicit documents and requirements amended or superseded;
- effective date and policy/version identifier where commercial;
- implementation owner, scope, exclusions, and branch/worktree;
- migration and compatibility impact;
- verification and rollback expectations;
- provider and operational decisions intentionally left open;
- whether approval covers documentation only, implementation planning, source
  changes, tests, migration preparation, or a later execution step; and
- explicit confirmation that production activation and go-live remain
  separate.

All `NMVP-D01` through `NMVP-D08` product selections in this packet now have
formal canonical records. The remaining records above are activation,
technical, provider, operational, Finance, legal, readiness, or go-live gates;
they are not permission to implement. This packet and the linked PRD remain
provenance/context and must not be treated as implementation authority.
