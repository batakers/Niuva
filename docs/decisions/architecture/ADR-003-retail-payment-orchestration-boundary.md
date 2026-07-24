# ADR-003 — Retail Payment Orchestration Boundary

Status: Approved with Open Decisions
Decision ID: `DEC-PAY-01`
Decision owner: Project Manager / Product Owner
Technical approver: Acting Technical Owner
Business/Finance approver: Acting Business and Finance Owner
Operations acknowledgement: Acting Operations Owner
Decision date: 16 July 2026
Approval source: Role-based internal project approval recorded by the Project Manager / Product Owner through the Niuva platform governance process.
Recorded by: Project documentation owner
Compatibility amendment: `DEC-PAY-02`, approved by explicit user decision on
24 July 2026, makes existing manual-transfer records read-only and disables new
manual-transfer/payment-proof activity.
Open decision categories: Gateway provider, payment state machine, Finance operations, reconciliation SLA, refund policy, event retention, webhook authentication, and production readiness.
Related baseline: `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md`
Decision log: `docs/decisions/product/DECISION_LOG_Platform_Niuva_v2_1.md`

## Context

Approved v2.1 requirements establish **online payment as the Retail production
target**, while the payment gateway provider remains deferred. An earlier
checkout direction considered manual transfer and payment proof as a possible
slice. `DEC-PAY-02` now resolves that legacy boundary as read-only and disables
new manual-transfer/payment-proof activity.

This ADR defines the boundary between the Retail payment experience, a provider-neutral payment contract, provider adapters, and exceptional manual-transfer handling. It does not select a gateway provider or authorize production go-live.

## Proposed Boundary

### Retail production target

Retail production uses an online-payment lifecycle with provider-neutral states and actions. The experience must support authoritative amount/currency, payment action, pending/processing, success/failure/expiry, idempotent retry, reconciliation, refund boundary, and customer-safe status projection.

### Provider-neutral lifecycle

The application contract should represent, at minimum:

- payment intent or attempt;
- amount and currency snapshot;
- action required by the customer, without provider-specific UI assumptions;
- pending, processing, succeeded, failed, expired, cancelled, review, refunded, and reconciliation states as appropriate;
- idempotency key and safe correlation reference;
- provider event receipt and deduplication reference;
- refund request/result boundary;
- customer-safe projection that excludes secrets, raw provider payloads, internal notes, and sensitive finance data.

### Provider adapter boundary

- A provider adapter translates provider-specific API, redirect/action, webhook/event, and error semantics into the provider-neutral contract.
- Provider credentials, external references, raw payload handling, and provider retry rules remain inside the adapter boundary.
- The core order/payment domain must not depend on one gateway vendor's field names or webhook assumptions.
- Gateway provider selection remains deferred.

### Event and webhook idempotency

- Each provider event must have a stable deduplication identity.
- Replayed events return the original handling result and do not duplicate payment, order, inventory, refund, or notification effects.
- Conflicting reuse of an idempotency key returns a conflict and is audited.
- Notification failure does not roll back an otherwise successful core payment transition.

### Refund and reconciliation boundary

- Refund is a separate idempotent operation with permission, approval, actor, time, reason, amount, and result.
- Underpayment, overpayment, duplicate event/proof, late payment, wrong destination, sender mismatch, and uncertain provider status enter a reconciliation boundary.
- Finance owns reconciliation policy and SLA once assigned.
- Internal cost, supplier, margin, raw provider payload, and sensitive finance notes are never returned to customers.

## Manual Transfer Policy

Manual transfer is not the Retail production target. `DEC-PAY-02` resolves the
compatibility boundary for the current baseline:

- existing manual-transfer records remain readable through authenticated,
  authorized, ownership-scoped compatibility projections;
- no new manual-transfer instruction or payment attempt is created;
- no new payment proof is uploaded;
- no new proof-driven verification or payment transition is performed;
- historical commercial and proof metadata is preserved rather than deleted or
  rewritten.

Manual transfer must not change the provider-neutral core contract or silently
become a fallback payment experience.

## Options

### Option A — Provider-neutral online payment contract with deferred adapter selection

Lock the lifecycle and contract now, then select a gateway adapter later.

### Option B — Manual transfer as a time-bound transitional adapter

This option was not enabled by the original approval and is no longer an open
application fallback for the current baseline after `DEC-PAY-02`.

### Option C — Provider-specific payment flow in the core domain

Rejected as a baseline because it locks gateway choice, couples domain data to vendor semantics, and conflicts with the deferred-provider decision.

## Approved Architecture Direction

**Option A — provider-neutral online-payment orchestration** is approved as the
Retail production architecture. `DEC-PAY-02` limits Option B to read-only
historical compatibility and disables new manual-transfer/payment-proof
activity. Option C remains rejected. The gateway provider remains deferred.

## Dependencies and Impact

- Retail checkout candidate must use the provider-neutral contract and separate adapter boundary.
- Online payment remains the production target even while gateway provider is deferred.
- Retained legacy payment-proof objects remain governed by the ownership,
  authorization, retention, backup, and recovery boundaries in `ADR-002`; no
  new proof upload is enabled.
- Checkout/order/reservation mutation requires the transaction-capability decision from `ADR-001`.
- Refund, shipping, tax, reservation, protected-scope, and production-readiness decisions remain separate entries in the central decision log.
- Payment provider integration is not authorized by this ADR.
- Gateway provider selection is required for provider integration and production go-live, but not for approval of this architecture.

## Open Decisions After Approval

- Payment gateway provider.
- Exact payment state machine.
- Reconciliation SLA.
- Refund policy.
- Payment event retention.
- Provider-specific webhook authentication.
- Production go-live approval.

## Approval Record

- **Decision owner:** Project Manager / Product Owner
- **Technical approver:** Acting Technical Owner
- **Business/Finance approver:** Acting Business and Finance Owner
- **Operations acknowledgement:** Acting Operations Owner
- **Decision date:** 16 July 2026
- **Approval source:** Role-based internal project approval recorded by the Project Manager / Product Owner through the Niuva platform governance process.
- **Recorded by:** Project documentation owner
- **Approval scope:** Internal architecture, documentation, and future implementation planning.
- **Open provider and operational decisions:** Gateway provider, exact payment state machine, reconciliation SLA, refund policy, payment event retention, provider-specific webhook authentication, and production go-live approval.
- **Excluded from this approval:** Company-wide production authorization, infrastructure procurement approval, Finance operational sign-off for future payment operations, payment gateway activation approval, and production go-live approval.
- **Final decision:** Approved with Open Decisions.

## Compatibility Amendment Record

- **Decision:** Existing manual-transfer records are read-only; new
  manual-transfer instructions, attempts, payment-proof uploads, and
  proof-driven transitions are disabled.
- **Decision ID:** `DEC-PAY-02`
- **Decision date:** 24 July 2026
- **Approval source:** Explicit user approval in the backend-audit conversation.
- **Implementation status:** Decision recorded; protected-scope implementation
  remains separately gated.
