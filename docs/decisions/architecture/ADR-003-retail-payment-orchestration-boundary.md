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
Open decision categories: Gateway provider, payment state machine, Finance operations, reconciliation SLA, refund policy, event retention, webhook authentication, and production readiness.
Related baseline: `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md`
Decision log: `docs/decisions/product/DECISION_LOG_Platform_Niuva_v2_1.md`

## Context

Approved v2.1 requirements establish **online payment as the Retail production target**, while the payment gateway provider remains deferred. The Retail checkout candidate currently describes manual transfer and payment proof as its primary slice. That is not an acceptable production baseline without an explicit transitional decision.

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

No new transitional manual-transfer adapter is enabled by this approval.

## Options

### Option A — Provider-neutral online payment contract with deferred adapter selection

Lock the lifecycle and contract now, then select a gateway adapter later.

### Option B — Manual transfer as a time-bound transitional adapter

Keep the same core contract, but enable a separate proof/reconciliation adapter only after explicit approval and expiry controls.

### Option C — Provider-specific payment flow in the core domain

Rejected as a baseline because it locks gateway choice, couples domain data to vendor semantics, and conflicts with the deferred-provider decision.

## Approved Architecture Direction

**Option A — provider-neutral online-payment orchestration** is approved as the Retail production architecture. Option B is not enabled by this approval and would require a separate written decision. Option C remains rejected. The gateway provider remains deferred.

## Dependencies and Impact

- Retail checkout candidate must use the provider-neutral contract and separate adapter boundary.
- Online payment remains the production target even while gateway provider is deferred.
- Manual payment proof requires the production-storage decision from `ADR-002`.
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
