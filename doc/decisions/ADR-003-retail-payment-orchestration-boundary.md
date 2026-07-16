# ADR-003 — Retail Payment Orchestration Boundary

Status: Technical Design Candidate — not approved
Decision ID: `DEC-PAY-01`
Decision owner: Finance / Product / Platform — Not assigned
Technical approver: Not recorded
Business approver: Not recorded
Decision date: Pending
Related baseline: `doc/PRD_Platform_Niuva_v2_1_retail_b2b.md`
Decision log: `doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md`

## Context

Approved v2.1 requirements establish **online payment as the Retail production target**, while the payment gateway provider remains deferred. The Retail checkout candidate currently describes manual transfer and payment proof as its primary slice. That is not an acceptable production baseline without an explicit transitional decision.

This ADR defines the boundary between the Retail payment experience, a provider-neutral payment contract, provider adapters, and exceptional manual-transfer handling. It does not select a gateway provider or approve implementation.

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

Manual transfer is **disabled by default** and is not the Retail production target.

It may be enabled only as a transitional adapter after all of the following are approved in writing:

- explicit stakeholder and Finance approval;
- dedicated feature flag and rollout boundary;
- named Finance owner;
- payment review and reconciliation SLA;
- expiry date for the transitional adapter;
- exit criteria and migration path to online payment;
- approved private persistent storage for payment proof;
- audit, retry, refund, and late-payment handling.

Manual transfer must not change the provider-neutral core contract or silently become the default payment experience.

## Options

### Option A — Provider-neutral online payment contract with deferred adapter selection

Lock the lifecycle and contract now, then select a gateway adapter later.

### Option B — Manual transfer as a time-bound transitional adapter

Keep the same core contract, but enable a separate proof/reconciliation adapter only after explicit approval and expiry controls.

### Option C — Provider-specific payment flow in the core domain

Rejected as a baseline because it locks gateway choice, couples domain data to vendor semantics, and conflicts with the deferred-provider decision.

## Recommended Baseline

Use **Option A** as the production architecture. Permit **Option B** only as an explicitly approved transitional adapter. Do not use Option C. This recommendation is not approved until the ADR and related decision log entry are reviewed.

## Dependencies and Impact

- Retail checkout candidate must use the provider-neutral contract and separate adapter boundary.
- Online payment remains the production target even while gateway provider is deferred.
- Manual payment proof requires the production-storage decision from `ADR-002`.
- Checkout/order/reservation mutation requires the transaction-capability decision from `ADR-001`.
- Refund, shipping, tax, reservation, protected-scope, and production-readiness decisions remain separate entries in the central decision log.
- Payment provider integration is not authorized by this ADR.

## Approval Record

- **Technical approver:** Not recorded
- **Business approver:** Not recorded
- **Decision date:** Pending
- **Approval source:** Not recorded
- **Final decision:** Pending review; recommendation is not approved.
