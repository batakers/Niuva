# DEC-INV-01 — Retail Checkout Reservation Duration

- **Status:** Approved Decision
- **Decision date:** 30 July 2026
- **Decision owner:** Product decision authority
- **Decision source:** Explicit user approval of a fixed 30-minute reservation
- **Scope:** Retail checkout stock and material reservation timing

## Context

Retail checkout needs a bounded reservation so two customers cannot
successfully purchase the same ready stock or consume the same available
material allocation. The duration also has to remain compatible with the
selected payment method and with asynchronous payment callbacks.

The platform decision log previously left the duration open and considered a
24-hour hold, a shorter fixed window, and a provider-aware dynamic window. The
approved MVP direction uses online payment and does not activate a payment
method whose completion window cannot be reconciled safely with the reservation
policy.

## Decision

The Retail checkout reservation duration is **fixed at 30 minutes**.

The following invariants apply:

1. The 30-minute clock begins only after the platform successfully creates the
   order and its payment attempt. Viewing a cart or checkout page does not
   reserve stock or material.
2. The customer must see the remaining time and receive a warning when five
   minutes remain.
3. A reservation is not extended automatically. A retry after expiry must
   revalidate price, ready stock or material availability, shipping cost, and
   applicable production estimates before creating a new reservation.
4. A successful payment confirmed before expiry consumes the reservation.
   Failure, cancellation, or expiry releases it exactly once.
5. Payment confirmation and expiry are competing state transitions and must be
   handled atomically so only one transition wins.
6. A late successful payment callback must enter an explicit reconciliation
   path. It must not silently recreate stock or create a second paid order.
7. A payment method may be activated only when its expiry and callback behavior
   can be enforced or reconciled safely with this 30-minute policy.
8. Each order stores a versioned snapshot of the reservation policy used when
   the payment attempt was created.
9. The reservation lifecycle is explicit:
   `active -> consumed | released | expired`.

This decision applies to ready-product stock and material allocations used by a
directly calculated Retail print order. Quote-required combinations do not
reserve stock or material. An Assisted Retail Offer governed by
`DEC-OFFER-01` also creates no reservation when requested, offered, or
accepted; the fixed 30-minute reservation begins only through the normal
Retail checkout sequence described above.

## Why This Duration

- It limits unnecessary stock and material holds.
- It gives customers a clear checkout window without allowing long-lived
  reservations.
- It supports deterministic expiry, retry, and reconciliation rules.
- It is suitable for the approved online-payment flow, subject to later
  provider compatibility verification.

## Alternatives Considered

### 24-hour fixed reservation

Not selected. It would hold scarce ready stock or material for too long during
an unpaid checkout.

### Provider-aware or dynamic reservation

Deferred. It adds policy and reconciliation complexity that is not required for
the initial MVP decision.

### Reserve only after payment

Not selected. It cannot protect ready stock or material during concurrent
checkout attempts.

## Consequences and Follow-up

- Checkout UX, inventory transitions, payment callbacks, expiry jobs, and
  reconciliation must use the same versioned reservation policy.
- Payment-provider selection and activation remain separate decisions and must
  prove compatibility with this duration.
- Detailed reconciliation ownership, operational SLA, cancellation, refund,
  return, and fulfillment policies remain governed separately.
- This decision resolves only the reservation duration and its required
  invariants. It does not authorize source-code changes, migrations, provider
  activation, deployment, production-readiness, or go-live.

## Related Authority

- [`ADR-001-mongodb-transaction-capability.md`](../architecture/ADR-001-mongodb-transaction-capability.md)
- [`ADR-003-retail-payment-orchestration-boundary.md`](../architecture/ADR-003-retail-payment-orchestration-boundary.md)
- [`DEC-ETA-01-retail-eta-and-customer-milestone-policy.md`](DEC-ETA-01-retail-eta-and-customer-milestone-policy.md)
- [`DEC-FUL-01-shipping-and-pickup-policy.md`](DEC-FUL-01-shipping-and-pickup-policy.md)
- [`DEC-OFFER-01-retail-offer-file-and-quote-routing.md`](DEC-OFFER-01-retail-offer-file-and-quote-routing.md)
- [`DECISION_LOG_Platform_Niuva_v2_1.md`](DECISION_LOG_Platform_Niuva_v2_1.md)
- [`2026-07-14-catalog-material-pricing-inventory-foundation-design.md`](../../implementation/specs/active/2026-07-14-catalog-material-pricing-inventory-foundation-design.md)
- [`2026-07-30-niuva-mvp-decision-packet.md`](../../implementation/specs/candidates/2026-07-30-niuva-mvp-decision-packet.md)
