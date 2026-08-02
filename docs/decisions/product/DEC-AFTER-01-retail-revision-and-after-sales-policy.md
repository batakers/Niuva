# DEC-AFTER-01 — Retail Revision and After-Sales Policy

- **Status:** Approved After-Sales Policy — Activation Gated
- **Decision date:** 31 July 2026
- **Decision owner:** Product, Operations, and Finance policy authority
- **Decision source:** Explicit user approval of the four NMVP-D06 decision
  groups
- **Scope:** New direct-checkout Retail Ready Product, made-to-order, and
  eligible Custom 3D Print orders

## Context

Retail Orders need deterministic recovery when a production file is not usable,
a customer cancels, or an item is defective, damaged, or inconsistent with the
committed order. The policy must distinguish unpaid checkout abandonment,
post-payment cancellation, irreversible work, and after-receipt remedies.

The policy must also preserve:

- the fixed reservation and payment-race invariants in `DEC-INV-01`;
- the provider-neutral, idempotent refund boundary in `ADR-003`;
- the original commercial and tax snapshots in `DEC-PRICE-001` and
  `DEC-TAX-01`;
- the fulfillment and receipt facts in `DEC-FUL-01`;
- factual milestone history and non-automatic `eta_overdue` behavior in
  `DEC-ETA-01`; and
- the role and approval boundaries in `DEC-ACCESS-002`.

This is a product and operational-policy decision. It is not legal advice and
does not publish customer-facing terms.

## Decision

### Scope and lifecycle boundary

This policy applies to an order that uses the Retail Order lifecycle, including
a direct-checkout business purchaser. A B2B Quote/Project, partnership,
borongan, or other quotation-based engagement remains governed by its accepted
quotation, statement of work, contract, and versioned change process.

For this policy, irreversible work starts:

- for made-to-order or Custom 3D Print, when actual printing or agreed
  customization begins, not when the order merely enters a queue; and
- for Ready Product, when the item is handed to the carrier or recorded as
  handed to the pickup customer.

The exact aggregate states and API/schema names require a later approved
technical contract. Implementation must not infer irreversible work from a
generic status that lacks the applicable factual event.

### Before successful payment

1. A customer may abandon or cancel the checkout without a paid-order refund.
2. Any reservation is released exactly once under `DEC-INV-01`.
3. A late or conflicting payment event enters reconciliation and never silently
   recreates the reservation, marks a second order paid, or implies an automatic
   refund.

### Paid order before irreversible work

1. A customer may submit a cancellation request.
2. An approved cancellation receives a full refund of the eligible
   customer-paid amount, including an unused fulfillment amount.
3. A payment-provider or administrative fee is not deducted from the approved
   customer refund amount. Niuva absorbs any provider fee that cannot be
   recovered.
4. Inventory or material release occurs exactly once through the governed
   reservation/inventory lifecycle.
5. Cancellation, release, and refund remain separate auditable operations; one
   operation never silently substitutes for another.

### After irreversible work starts

1. Customer-requested cancellation and refund are not automatic.
2. Operations reviews the factual completed work, consumed material, and
   unperformed scope against the immutable order snapshot.
3. A partial refund is permitted only for an exact affected or unperformed
   amount that Niuva and the customer agree to. This decision does not create an
   automatic percentage, penalty, minimum deduction, or cancellation formula.
4. Customer change of mind does not create an automatic free reprint, refund,
   or post-receipt return for conforming work.
5. Statutory rights, confirmed nonconformity, hidden defects, Niuva error, and
   carrier damage are not waived by this lifecycle boundary.

### After receipt

After carrier delivery or recorded pickup handover, ordinary cancellation is no
longer the recovery path. The order uses the complaint, reprint/replacement,
refund, or return process below.

`pickup_overdue` before handover remains governed by `DEC-FUL-01`. It never
automatically cancels, refunds, transfers ownership, creates a storage fee, or
authorizes disposal.

## File Revision

`file_revision_required` is used when an applicable customer file cannot safely
continue through the accepted process, including when it is unreadable,
corrupt, non-printable, dimensionally incompatible with the validated process,
or has an unresolved scale or configuration conflict.

1. The customer has 48 hours from the successful customer-facing revision
   notice to upload a replacement.
2. The deadline is stored as an exact `revision_due_at` and displayed in
   `Asia/Jakarta`.
3. The clock may start only after the notice is durably recorded and made
   available through the later-approved authenticated customer notification
   surface. A failed delivery attempt alone cannot start the clock.
4. Each replacement is a new file version. The accepted production version and
   prior history are never silently overwritten.
5. Niuva does not silently repair, rescale, or alter customer geometry.
6. Work that requires professional design repair or falls outside the validated
   direct-checkout process becomes `quote_required` and follows the routing
   contract in `DEC-OFFER-01`.
7. No response by the deadline creates a cancellation/refund review. It does
   not delete the order or infer a refund amount automatically.
8. When printing has not started, the approved default outcome is the full
   pre-work refund described above.

Exact file validators, machine/process tolerances, retention, privacy, and
storage operations remain governed by later technical, storage, Operations, and
legal approval.

## Complaint Intake and Evidence

1. The standard intake window for defect, damage, wrong item, or
   nonconformity complaints is at least two working days after receipt.
2. Delivery receipt uses the authoritative carrier-delivered event. Pickup
   receipt uses the recorded handover event.
3. The exact `complaint_due_at`, governing business calendar, and timezone-aware
   receipt facts must be visible to the customer before activation.
4. The intake window is not expressed as an automatic waiver of statutory
   rights. A later complaint, including a possible hidden defect, enters
   manual/legal review rather than automatic rejection.
5. A customer supplies a description and reasonable supporting evidence.
   Photo or video evidence is requested when reasonably available, but absence
   of one particular evidence format does not automatically reject the case.
6. Missing evidence produces a customer-safe request for the information
   reasonably needed for review. It does not silently close the case.
7. Complaint evidence is private, ownership-scoped, least-privilege data.
   Customer-visible responses exclude internal cost, margin, supplier, raw
   provider data, and sensitive internal notes.

An `eta_overdue` event may support a complaint but never creates automatic
cancellation, compensation, refund, or reprint. The applicable facts and agreed
terms remain subject to review.

## Reprint, Refund, and Return

### Confirmed Niuva error or carrier damage

When Niuva error, confirmed nonconformity, or carrier damage is established:

1. The customer may choose a reprint/replacement or refund for the affected
   scope.
2. A full-order issue may receive full reprint/replacement or full refund.
3. A partial issue may receive affected-line reprint/replacement or an exact
   partial refund with customer agreement.
4. Reprint uses the same accepted file version, material, color, dimensions,
   quantity, and configuration. A customer-requested specification change
   becomes a new order or quotation.
5. Niuva arranges and pays required replacement delivery and return shipping
   when the confirmed fault belongs to Niuva or the carrier.
6. If a physical return is reasonably required for inspection or recovery,
   Niuva provides customer-safe instructions. A return is not required merely
   to create friction.
7. A returned Ready Product does not re-enter saleable stock until QC approves
   it. A custom item is never automatically returned to saleable inventory.

### Customer-caused issue or conforming work

1. A result that conforms to the accepted file, configuration, disclosed
   tolerances, and order snapshot does not receive an automatic free reprint,
   refund, or change-of-mind return.
2. A confirmed customer file, misuse, or post-receipt damage issue may be
   offered as a new paid order, repair service, or quotation.
3. Customer-paid return shipping may be considered only after reviewed customer
   contribution or negligence and applicable legal/business approval. No
   undisclosed administrative penalty is created by this decision.

The MVP does not offer a discretionary post-receipt change-of-mind return for
conforming goods. Customer-facing wording must state this narrowly and must not
become a blanket no-return or no-refund clause.

### Refund amount and provider execution

1. Every refund starts from the original paid order's immutable commercial,
   fulfillment, and tax snapshots, never the current catalog or policy.
2. The approved customer refund amount is exact and cannot be reduced by a
   separate payment-provider or administrative fee.
3. Refund request, approval, provider submission, processing, success, failure,
   and reconciliation are separate idempotent records or events.
4. A retry never duplicates a refund or any inventory, accounting,
   notification, or audit effect.
5. Provider completion timing, settlement behavior, webhook mapping, Finance
   accounting/tax correction, and customer-facing provider estimate remain
   activation gates after provider and Finance review.

## Service Levels

1. The system acknowledges complaint receipt immediately after a valid
   submission is durably recorded.
2. The target for the first human response is no later than one working day.
3. The target resolution decision is no later than five working days after
   sufficient evidence is recorded.
4. When carrier, payment-provider, technical, or legal investigation prevents
   that target, the case remains open and the customer receives a safe reason
   plus a revised resolution estimate.
5. Operator or provider delay does not silently close the case or erase its
   history.

The exact business calendar, escalation path, and operational owner must be
configured and validated before activation.

## Roles, Approval, and Audit

- `order_admin` receives and triages the case, coordinates customer-safe
  communication, and records the proposed outcome.
- `production` and `quality_control` contribute only the operational and QC
  evidence permitted by their domain roles.
- `finance` prepares refund and reconciliation work.
- Every refund and free reprint/replacement requires an explicit
  `manager_approver` approval; the MVP has no amount threshold that bypasses
  this approval.
- One account may perform more than one step only when it explicitly holds each
  required role. Each step still records its actor, role context, time, reason,
  input snapshot, decision, exact amount when applicable, and result.
- UI visibility never replaces backend authorization or scoped data queries.

Cases preserve append-only lifecycle, evidence references, previous and new
states, customer-safe messages, reprint/return/refund references, provider
result, and failure/retry history. Sensitive evidence access and retention
remain subject to the approved storage, privacy, and legal boundaries.

## Activation and Versioning

- Approval does not activate cancellation, complaints, returns, refunds,
  reprints, customer notifications, payment, fulfillment, or checkout.
- Activation requires legal/business review of customer terms; a validated
  working-day calendar; complaint and escalation ownership; Finance tax and
  accounting handling; provider-compatible refund behavior; customer-safe copy;
  evidence privacy/retention controls; and separately approved implementation,
  deployment, readiness, and go-live.
- The committed order snapshots the applicable after-sales policy version.
  Later policy changes do not rewrite paid orders, accepted quotations, or case
  history.
- Customer notification channels and recipient behavior are governed by the
  NMVP-D07 amendment to `DEC-DATA-003`. Provider selection, exact event/source
  mapping, preference UI, and implementation/activation remain separate gates.
- Suspected abuse/fraud taxonomy, evidence review, blocking/escalation behavior,
  and account consequences remain a separate legal/security/Operations
  decision. Suspicion alone does not authorize silent deletion or an
  unaudited denial.
- Long-term uncollected-pickup storage, fee, disposal, and ownership rules
  remain open; `DEC-FUL-01` continues to prohibit automatic action at the
  seven-day follow-up threshold.
- This decision does not authorize source-code or schema changes, migrations,
  provider selection or activation, deployment, production-readiness, or
  go-live.

## Alternatives Considered

### One cancellation rule for every order state

Rejected because unpaid checkout, paid pre-work cancellation, irreversible
production, shipment, and after-receipt remedies have different inventory,
commercial, operational, and customer consequences.

### Automatic refund after file-revision timeout

Rejected because the timeout determines the next review action, not the refund
amount or payment-provider outcome.

### Two-by-twenty-four-hour complaint deadline

Not selected. The approved standard intake window is at least two working days
after receipt, and later or hidden-defect claims cannot be rejected solely by an
automatic timer.

### Deduct provider fee from an approved customer refund

Not selected. The customer receives the approved refund amount and Niuva
absorbs a provider fee that cannot be recovered.

### No-return and no-refund clause for every custom order

Rejected because it would erase the required distinction between customer
change of mind, conforming work, Niuva error, carrier damage, nonconformity, and
applicable consumer rights.

## Regulatory Review Inputs

These sources inform the activation gate; qualified legal/business review must
confirm applicability and final customer wording:

- [UU No. 8 Tahun 1999 tentang Perlindungan
  Konsumen](https://peraturan.bpk.go.id/Details/45288/uu-no-8-tahun-1999.8Presiden)
- [PP No. 80 Tahun 2019 tentang Perdagangan Melalui Sistem
  Elektronik](https://peraturan.bpk.go.id/Details/126143/pp-no-80-tahun-2019)
- [Permendag No. 19 Tahun 2026 tentang Penyelenggaraan Usaha Perdagangan
  Melalui Sistem
  Elektronik](https://jdih.kemendag.go.id/peraturan/peraturan-menteri-perdagangan-republik-indonesia-nomor-19-tahun-2026-tentang-penyelenggaraan-usaha-perdagangan-melalui-sistem-elektronik)

## Consequences and Follow-up

- Product/Engineering must later approve the exact Retail aggregate state
  machine, case schema/API, state conflicts, idempotency contract, and
  customer-safe projection without weakening this policy.
- Operations and Finance must validate the service-level calendar, ownership,
  evidence process, return handling, refund accounting, and provider recovery
  path.
- Legal/business review must approve customer terms, complaint wording,
  evidence/privacy handling, and any customer-contribution shipping rule before
  activation.
- Amended `DEC-DATA-003` defines the direct-checkout Retail customer/operator
  notification channels and recipient policy while retaining provider,
  technical, implementation, and activation gates.
- The policy is approved for documentation and future planning only. It grants
  no implementation, activation, deployment, readiness, or go-live authority.

## Related Authority

- [`NIUVA_MASTER_SPEC.md`](../../NIUVA_MASTER_SPEC.md)
- [`DEC-ACCESS-002-granular-role-permission-matrix.md`](../access/DEC-ACCESS-002-granular-role-permission-matrix.md)
- [`ADR-003-retail-payment-orchestration-boundary.md`](../architecture/ADR-003-retail-payment-orchestration-boundary.md)
- [`DEC-ETA-01-retail-eta-and-customer-milestone-policy.md`](DEC-ETA-01-retail-eta-and-customer-milestone-policy.md)
- [`DEC-FUL-01-shipping-and-pickup-policy.md`](DEC-FUL-01-shipping-and-pickup-policy.md)
- [`DEC-INV-01-retail-checkout-reservation-duration.md`](DEC-INV-01-retail-checkout-reservation-duration.md)
- [`DEC-OFFER-01-retail-offer-file-and-quote-routing.md`](DEC-OFFER-01-retail-offer-file-and-quote-routing.md)
- [`DEC-PRICE-001-custom-print-commercial-pricing.md`](DEC-PRICE-001-custom-print-commercial-pricing.md)
- [`DEC-TAX-01-tax-inclusive-display-and-finance-activation-gate.md`](DEC-TAX-01-tax-inclusive-display-and-finance-activation-gate.md)
- [`2026-07-30-niuva-mvp-decision-packet.md`](../../implementation/specs/candidates/2026-07-30-niuva-mvp-decision-packet.md)
