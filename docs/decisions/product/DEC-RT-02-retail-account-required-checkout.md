# DEC-RT-02 — Retail Account-Required Checkout

- **Status:** Approved Decision
- **Decision date:** 30 July 2026
- **Decision owner:** Product and access decision authority
- **Decision source:** Explicit user approval of NMVP-D01 Option A
- **Scope:** Identity and ownership requirements for new Retail transactions

## Context

The original v2.1 baseline allowed both guest and account checkout, including
guest tracking through an order number and verified contact. The approved MVP
discussion instead requires a Retail account for checkout, payment, private
files, order history, and production tracking.

Requiring an account creates one durable ownership boundary for orders and
files, but makes authentication, session continuity, and account recovery part
of the checkout experience. The decision must therefore define what remains
public, how a pre-login cart survives authentication, and how historical guest
records are preserved.

## Decision

Niuva will use **account-required checkout for every new Retail transaction**.

The following rules apply:

1. Anonymous visitors may browse the Retail catalog, inspect products, select
   non-sensitive configuration options, and maintain a non-authoritative local
   cart.
2. Authentication is required before private artwork upload, authoritative
   checkout submission, order and payment-attempt creation, inventory or
   material reservation, payment, order history, file access, and production
   tracking.
3. Every newly created Retail Order has an authenticated `customer_id`. New
   guest orders, guest magic links, guest-order sessions, and verified-contact
   tracking credentials are not created.
4. A pre-login cart may carry only the product, variant, quantity, and
   non-sensitive configuration draft across registration or login. It must not
   carry an authoritative price, stock promise, reservation, payment state,
   private file reference, or server-trusted eligibility result.
5. After authentication, the server revalidates publication, configuration,
   price, stock or material, shipping, ETA, file requirements, and checkout
   eligibility before creating any transaction.
6. Registration, login, verification, or recovery failure does not create an
   order, reservation, or payment attempt. The customer may retry without
   losing the permitted non-sensitive cart draft.
7. If the customer session expires before order creation, reauthentication and
   full checkout revalidation are required. No reservation exists at that
   point.
8. If the session expires after an order and payment attempt have been created,
   the order remains owned by its stored `customer_id` and provider callbacks
   remain idempotent. The customer must reauthenticate to view or act on it.
   Session recovery does not extend the 30-minute reservation in `DEC-INV-01`.
9. Existing guest or guest-shaped historical orders, if any, remain immutable
   and compatible with their approved ownership-scoped read path. They are not
   deleted, rewritten, or automatically linked to an account by matching email,
   phone number, or other contact data.
10. Claiming a historical guest order requires a separately approved,
    verification-backed claim policy with audit and conflict handling.
11. This decision changes only the Retail identity boundary. Public B2B inquiry
    may still begin without login, and Retail Order remains separate from B2B
    Quote and Project lifecycles.

## Why This Option

- It provides one consistent owner for orders, private files, tracking, and
  customer notifications.
- It removes new guest magic-link, verified-contact, and later-claim complexity.
- It supports order history, repeat order, saved details, and authenticated
  recovery in one customer surface.
- It avoids treating email address equality as proof of order ownership.

## Alternatives Considered

### Guest and account checkout

Not selected for new Retail transactions. It reduces initial authentication
friction but requires guest sessions, verified-contact tracking, claim flows,
and two private-file ownership models.

### Guest checkout with mandatory account creation after payment

Not selected. It creates an ambiguous ownership boundary during upload,
reservation, payment, and asynchronous provider callbacks.

## Consequences and Follow-up

- `BR2-06`, the Retail Guest persona, `FR-RT-06`, `FR-RT-10`, `FR2-04`, and
  `FR2-19` are amended within this decision's scope.
- Customer authentication, recovery, and session behavior must follow the
  approved authentication decisions rather than creating a Retail-only auth
  silo.
- Conversion impact and authentication reliability must be evaluated during
  UX validation.
- Historical guest compatibility remains a separate read/claim concern; this
  decision does not authorize migration or automatic account linkage.
- This decision does not authorize source-code changes, schema changes,
  migrations, provider activation, deployment, production-readiness, or
  go-live.

## Related Authority

- [`NIUVA_MASTER_SPEC.md`](../../NIUVA_MASTER_SPEC.md)
- [`BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md`](../../references/requirements/approved-baselines/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md)
- [`PRD_Platform_Niuva_v2_1_retail_b2b.md`](../../references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md)
- [`DEC-AUTH-003-account-recovery-contract-and-compatibility.md`](../access/DEC-AUTH-003-account-recovery-contract-and-compatibility.md)
- [`DEC-AUTH-010-customer-session-transport-and-origin.md`](../access/DEC-AUTH-010-customer-session-transport-and-origin.md)
- [`DEC-INV-01-retail-checkout-reservation-duration.md`](DEC-INV-01-retail-checkout-reservation-duration.md)
- [`2026-07-30-niuva-mvp-decision-packet.md`](../../implementation/specs/candidates/2026-07-30-niuva-mvp-decision-packet.md)
