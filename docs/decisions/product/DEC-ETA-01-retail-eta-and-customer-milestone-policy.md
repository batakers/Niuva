# DEC-ETA-01 — Retail ETA and Customer Milestone Policy

- **Status:** Approved Customer ETA and Milestone Policy — Activation Gated
- **Decision date:** 31 July 2026
- **Decision owner:** Product and Operations policy authority
- **Decision source:** Explicit user approval of NMVP-D05
- **Scope:** New Retail Ready Product and eligible direct-checkout Custom 3D
  Print orders

## Context

Customers need a credible time expectation before payment and factual progress
after payment. An exact promise without validated operating data creates false
precision. A percentage bar also cannot prove which operational event actually
happened.

ETA and milestone have different meanings:

- ETA is a versioned forecast that may change when its inputs change.
- A milestone is a factual lifecycle event with append-only history.

Retail Order and B2B Quote/Project remain separate aggregates. This decision
does not apply the Retail state machine to B2B work.

## Decision

### Customer ETA before payment

The authoritative checkout preview displays a date/time range, not a guaranteed
single date:

- `eta_earliest_at`;
- `eta_latest_at`;
- timezone `Asia/Jakarta`;
- the target being estimated;
- `eta_calculated_at`;
- ETA policy and operating-calendar versions; and
- customer-safe assumptions or qualification.

`eta_earliest_at` and `eta_latest_at` are timezone-aware and
`eta_earliest_at <= eta_latest_at`.

When fulfillment is pickup, the customer sees an estimated
`ready_for_pickup` range. When fulfillment is delivery, the customer sees
separate ranges for:

1. estimated `ready_to_ship`; and
2. estimated arrival/delivery using the selected fulfillment estimate.

The UI must label the range as an estimate unless a separately approved B2B
quotation or service-level commitment explicitly makes a guarantee.

### ETA inputs

Ready Product ETA uses:

```text
handling_or_packing
+ operational_buffer
+ applicable_fulfillment_estimate
```

Eligible made-to-order or Custom 3D Print ETA uses:

```text
file_review_when_applicable
+ material_readiness_when_applicable
+ production_queue_range
+ exact_accepted_slicer_print_time
+ post_processing_when_applicable
+ quality_control
+ operational_buffer
+ applicable_fulfillment_estimate
```

The following rules apply:

1. The before-payment range assumes successful payment within the active
   attempt. Production does not start before `payment_confirmed` and applicable
   file/material readiness.
2. Exact accepted slicer print duration is not replaced by a guessed rounded
   duration.
3. Human work, machine availability, closed periods, and operating hours use a
   versioned Operations calendar/profile.
4. The production queue is represented as a range; the customer does not see
   another customer's job, an internal printer identifier, or a promised exact
   queue position.
5. A step that does not apply is explicitly excluded by the snapshotted
   product/process profile; it is not shown as fictitiously completed.
6. Numeric handling, review, material-readiness, post-processing, QC, buffer,
   and calendar values require approved operational configuration before
   activation.
7. If the system cannot produce a safe ETA from validated inputs before order
   creation, the request is routed to `quote_required` without creating an
   Order, reservation, payment attempt, or checkout total, unless another
   recovery path is separately approved.

Before order/payment-attempt creation, the server revalidates the ETA together
with price, tax, stock/material, configuration, fulfillment, and file
readiness. A changed range or assumption requires explicit customer
reconfirmation.

### Customer-visible milestones

Ready Product pickup uses:

```text
payment_confirmed
-> processing_or_packing
-> ready_for_pickup
-> picked_up
-> completed
```

Ready Product delivery uses:

```text
payment_confirmed
-> processing_or_packing
-> ready_to_ship
-> shipped
-> delivered
-> completed
```

Made-to-order or Custom 3D Print pickup uses:

```text
payment_confirmed
-> file_review_when_applicable
-> production_queue
-> printing
-> post_processing_when_applicable
-> quality_control
-> ready_for_pickup
-> picked_up
-> completed
```

Made-to-order or Custom 3D Print delivery uses:

```text
payment_confirmed
-> file_review_when_applicable
-> production_queue
-> printing
-> post_processing_when_applicable
-> quality_control
-> ready_to_ship
-> shipped
-> delivered
-> completed
```

These names define the customer-visible milestone contract, not the final
backend aggregate state machine. The customer sees the current milestone,
completed milestone times, next action, current ETA range, and customer-safe
exception or delay explanation.

`file_revision_required`, `on_hold`, `rework_required`, payment exceptions,
cancellation, and refund states are displayed as explicit customer-safe
exceptions or next actions when applicable. They are not converted into a fake
completion percentage.

### Milestone history

Each milestone event records at least:

- order and milestone-template version;
- milestone identity and customer-safe label;
- `started_at` and/or `completed_at` as applicable;
- actor or trusted source;
- customer-safe note or reason when required; and
- immutable audit reference.

A correction, rework, or return to an earlier operational step appends a new
event and reason. It does not erase or rewrite the earlier event.

### ETA changes and authorized operator updates

An authorized operator may update milestones and ETA directly within their
approved domain without a separate reviewer/approver step:

- `production` manages production milestones, blockers, and related ETA input;
- `quality_control` manages QC decisions, rejection, and rework events; and
- `order_admin` coordinates customer-safe order, fulfillment, ETA, and next
  action communication.

One account may perform combined routine work only when it explicitly holds
the required roles under `DEC-ACCESS-002`. Backend authorization and
order/domain scope remain mandatory.

Every ETA change stores:

- previous and new earliest/latest values;
- estimated target;
- actor and changed time;
- reason code;
- customer-safe explanation;
- ETA policy, operating-calendar, queue/profile, and fulfillment references
  used; and
- audit reference.

The initial customer-safe reason taxonomy is:

- `customer_file_revision`;
- `queue_or_capacity_change`;
- `material_unavailable`;
- `printing_rework_or_qc_delay`;
- `operational_disruption`;
- `fulfillment_delay`; and
- `customer_requested_change`.

Customer text must not expose another customer's work, internal cost, margin,
supplier, raw machine/provider errors, private staff notes, or security
details.

### ETA overdue behavior

For each estimated target:

1. When `eta_latest_at` passes and the target milestone has not been completed,
   the order receives internal `eta_overdue`.
2. The responsible operator must record a new range, reason code, and
   customer-safe explanation.
3. The event is eligible for the separately governed customer/operator
   notification surfaces.
4. The active overdue condition resolves when a valid replacement range is
   committed or the target milestone completes; the overdue event remains in
   history. Passing a later replacement range starts a new overdue cycle.
5. `eta_overdue` does not automatically cancel, refund, reprint, dispose of,
   or complete the order.
6. Cancellation, refund, compensation, reprint, and return eligibility are
   governed by `DEC-AFTER-01`; legal/customer terms remain activation-gated.

Operators may update a range before it becomes overdue when credible new
information exists. MVP does not require predictive delay scoring.

## Activation, Versioning, and Boundaries

- Approval does not activate ETA calculation, checkout, production tracking,
  notifications, or fulfillment.
- Activation requires approved operating calendars, process-duration profiles,
  buffer policy, safe reason copy, responsible operational roles, fulfillment
  inputs, and separately authorized implementation/readiness evidence.
- ETA policy, calendar, process profile, milestone template, calculation input,
  checkout preview, order-confirmed ETA, and later changes are versioned.
- Paid orders preserve their original confirmation snapshot and append later
  ETA/milestone history; current configuration never rewrites historical
  records.
- Live printer telemetry, automated printer scheduling, predictive optimization,
  and exact queue-position disclosure are excluded from MVP.
- B2B quotation/project ETA and milestones remain governed by their own
  versioned quotation, approval, dependency, and project lifecycle.
- Notification channels and recipient policy are governed by the NMVP-D07
  amendment to `DEC-DATA-003`. Provider selection, exact event/source mapping,
  preference UI, and implementation/activation remain separate gates.
- This decision does not authorize source-code or schema changes, migrations,
  providers, deployment, production-readiness, or go-live.

## Alternatives Considered

### Guaranteed single completion date for every Retail order

Rejected because current operating calendars, queue behavior, and process
profiles are not yet validated for such a guarantee.

### Fake percentage completion

Rejected because a percentage does not prove an operational event and can
mislead customers.

### No ETA before payment

Rejected because the customer needs a credible time range before committing to
payment.

### Live Bambu printer scheduling or telemetry as an MVP dependency

Deferred because it adds hardware, provider, reliability, privacy, and
operational coupling that is not required for truthful manual milestones.

### Reviewer approval for every routine ETA or milestone update

Not selected for MVP. Authorized domain operators may publish routine factual
updates directly with reason and audit history.

## Consequences and Follow-up

- Operations must define and validate duration profiles, calendars, buffers,
  safe reason copy, and ownership before activation.
- Product/Engineering must later approve the exact Retail aggregate state
  machine and API/schema contract without weakening this customer-facing
  policy.
- Quote-required and Assisted Retail Offer routing follows `DEC-OFFER-01`.
  An offer's approved ETA remains a versioned commercial assumption and is
  revalidated before the accepted offer enters normal Retail checkout.
- `DEC-AFTER-01` defines the Retail cancellation/refund/reprint/return policy;
  amended `DEC-DATA-003` defines the direct-checkout Retail notification
  recipients/channels and their activation gates.
- This decision records product policy only and grants no implementation,
  activation, deployment, readiness, or go-live authority.

## Related Authority

- [`NIUVA_MASTER_SPEC.md`](../../NIUVA_MASTER_SPEC.md)
- [`DEC-ACCESS-002-granular-role-permission-matrix.md`](../access/DEC-ACCESS-002-granular-role-permission-matrix.md)
- [`DEC-AFTER-01-retail-revision-and-after-sales-policy.md`](DEC-AFTER-01-retail-revision-and-after-sales-policy.md)
- [`DEC-FUL-01-shipping-and-pickup-policy.md`](DEC-FUL-01-shipping-and-pickup-policy.md)
- [`DEC-INV-01-retail-checkout-reservation-duration.md`](DEC-INV-01-retail-checkout-reservation-duration.md)
- [`DEC-OFFER-01-retail-offer-file-and-quote-routing.md`](DEC-OFFER-01-retail-offer-file-and-quote-routing.md)
- [`DEC-PRICE-001-custom-print-commercial-pricing.md`](DEC-PRICE-001-custom-print-commercial-pricing.md)
- [`DEC-RT-02-retail-account-required-checkout.md`](DEC-RT-02-retail-account-required-checkout.md)
- [`2026-07-30-niuva-mvp-decision-packet.md`](../../implementation/specs/candidates/2026-07-30-niuva-mvp-decision-packet.md)
