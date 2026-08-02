# DEC-FUL-01 — Retail Shipping and Pickup Policy

- **Status:** Approved Fulfillment Policy — Activation Gated
- **Decision date:** 30 July 2026
- **Decision owner:** Product and fulfillment policy authority
- **Decision source:** Explicit user approval of NMVP-D04
- **Scope:** Direct-checkout Retail pickup and domestic Indonesia delivery

## Context

Niuva needs a fulfillment policy that shows a complete customer total before
online payment without inventing delivery eligibility, rates, or operational
promises. Ready Products and eligible direct-calculated Custom 3D Print orders
may use the Retail checkout journey. B2B, borongan, partnership, unsafe,
unsupported, or uncertain fulfillment remains quotation-based.

The fixed 30-minute stock/material reservation is already governed separately
by `DEC-INV-01`. A delivery-rate quote also has a validity period, but that
quote validity must not be confused with inventory reservation or with the
later carrier shipment lifecycle.

## Decision

Niuva approves both **pickup** and **delivery** for eligible direct-checkout
Retail orders.

### Scope boundary

1. MVP delivery is limited to supported domestic Indonesia addresses.
2. International delivery becomes `quote_required`.
3. B2B, borongan, partnership, bulk, special packaging, oversize, unsafe,
   unsupported-address, missing-package-profile, and uncertain fulfillment
   follows the quote-routing contract in `DEC-OFFER-01`.
4. Basic packaging is included in the Ready Product or standard Custom 3D
   Print customer price. It is not added as a separate checkout surcharge.
5. Special protective, presentation, export, or other nonstandard packaging
   becomes `quote_required`.

### Pickup

1. Pickup has a shipping charge of Rp0.
2. During checkout, the customer selects an active approved Niuva pickup
   location. The location record must be versioned and contain a customer-safe
   address, operating hours, contact instructions, and availability state.
3. The customer selects an available collection window only after the order
   reaches `ready_for_pickup`. This avoids promising a collection time before
   production and QC are complete.
4. The customer and operator receive dashboard/email notification when the
   order is ready and when pickup follow-up is required.
5. Staff records the handover and `picked_up_at`; that recorded handover is the
   pickup receipt event.
6. An uncollected order becomes internally `pickup_overdue` seven calendar days
   after `ready_for_pickup_at`.
7. `pickup_overdue` creates customer/operator reminders and manual follow-up. It
   does not automatically cancel the order, dispose of or transfer ownership
   of the item, charge storage, create a refund, or mark the order completed.

Actual pickup locations, hours, and available collection windows are
operational configuration that must be approved before activation; they are
not invented by this decision.

### Automatic delivery rate

1. Delivery eligibility and rate are calculated server-side before payment
   through a provider-neutral logistics boundary.
2. The customer selects only an eligible customer-safe service returned by the
   authoritative rate calculation.
3. The calculation uses an approved origin, normalized destination, and
   package profile:
   - Ready Product uses the active sellable-variant shipping/package profile.
   - Direct-calculated Custom 3D Print uses the accepted model dimensions,
     billable object data, and an approved basic-packaging profile.
   - The package snapshot includes quantity, gross weight, dimensions, and
     other provider-neutral inputs needed for rating.
4. A domestic delivery address records at least recipient name, phone, address
   line, province, regency/city, district, subdistrict, postal code, and
   optional delivery notes. Provider-specific identifiers remain inside the
   adapter boundary.
5. Missing, stale, invalid, unsupported, oversize, or unsafe address/package
   data must not produce an estimated or guessed rate.

### Rate validity

For a rate returned at `quoted_at`:

```text
application_expiry = quoted_at + 30 minutes

rate_expires_at =
  min(provider_expires_at, application_expiry)
  when the provider supplies a valid expiry

rate_expires_at =
  application_expiry
  when the provider supplies no expiry
```

The following invariants apply:

1. An already expired or invalid provider quote is rejected.
2. Checkout shows the rate validity and refreshes an expired rate before the
   customer can create an order/payment attempt.
3. A changed amount, service, or delivery estimate requires explicit customer
   reconfirmation.
4. Immediately before creating the order and payment attempt, the server
   revalidates price, tax, stock/material, fulfillment method, address,
   package, delivery service/rate, and ETA.
5. After a valid rate is committed to an active payment attempt, its displayed
   delivery amount is immutable for that attempt. Payment failure,
   cancellation, or expiry requires a new rate and a new customer confirmation
   on retry.
6. Payment success within the approved reservation uses the committed delivery
   snapshot. A later carrier-rate variance, booking failure, or label failure
   enters auditable operational reconciliation and must not silently alter the
   paid customer total.
7. Delivery-rate expiry does not extend or reactivate the separate 30-minute
   inventory reservation governed by `DEC-INV-01`.

### Failure and fallback

1. A provider timeout, unavailable service, unsupported route, or unsafe
   shipment does not create a guessed delivery amount.
2. Checkout may offer pickup when an approved pickup location is available.
3. Otherwise the case becomes `quote_required` or another separately approved
   manual recovery path.
4. Notification failure must not roll back an otherwise committed order or
   fulfillment mutation.

### Order and tracking snapshot

The committed order retains customer-safe, immutable fulfillment evidence
appropriate to its lifecycle, including:

- fulfillment method and policy version;
- pickup-location snapshot or normalized delivery-address snapshot;
- package-profile version and package-input snapshot;
- provider-neutral service identity and displayed label;
- delivery amount, `quoted_at`, and `rate_expires_at`;
- displayed delivery estimate;
- later carrier tracking reference/link and customer-safe shipment milestones;
- handover, shipment, delivered, exception, and reconciliation timestamps where
  applicable.

Customer views exclude internal cost, carrier margin, supplier terms, raw
provider payloads, credentials, internal notes, and unrelated personal data.

## Activation, Versioning, and Authorization

- Approval does not activate fulfillment or checkout.
- Activation requires approved pickup-location data, origin/package profiles,
  domestic address validation, compatible logistics and payment boundaries,
  Finance tax treatment, operational ownership, and separate implementation,
  deployment, readiness, and go-live authorization.
- Policy, location, package, service, and rate snapshots are versioned.
  Changes do not rewrite paid orders or accepted quotations.
- `order_admin` coordinates customer-safe fulfillment and pickup follow-up.
  Catalog/package-profile preparation remains within the approved catalog
  domain; sensitive publication or override requires `manager_approver`.
- Provider selection, credentials, webhook behavior, label purchase, carrier
  contract terms, and production activation remain separate decisions.

## Alternatives Considered

### Pickup-only MVP

Not selected because the approved customer journey requires both pickup and
automatically rated delivery before payment.

### Flat-rate shipping

Not selected because package, destination, and service differences can make a
single assumed amount commercially inaccurate.

### Permanent delivery quote

Rejected because rates and service availability can change. A bounded,
snapshotted quote with explicit refresh and reconfirmation is required.

### Provider expiry with no application cap

Not selected. The 30-minute application cap gives checkout a deterministic
upper bound even when a provider returns a long or missing validity period.

### Automatic cancellation or disposal after overdue pickup

Rejected for MVP. The seven-day threshold creates follow-up, not forfeiture,
fees, cancellation, disposal, refund, or completion.

## Consequences and Follow-up

- Operations must approve the actual origin, pickup location, hours, collection
  windows, package profiles, carrier/service allowlist, escalation owner, and
  recovery procedure before activation.
- Finance must confirm shipping and packaging tax treatment under the
  versioned production tax profile governed by `DEC-TAX-01`.
- Cancellation, refund, return shipping, damaged shipment, and after-sales
  eligibility are governed by `DEC-AFTER-01`. Address-change-after-payment,
  long-term uncollected-pickup storage/fee/disposal, provider execution, and
  other listed activation gates remain separate.
- An Assisted Retail Offer does not freeze a stale delivery rate. Standard
  pickup or domestic delivery eligibility, amount, service, and ETA are
  recalculated and reconfirmed in normal Retail checkout under
  `DEC-OFFER-01`.
- This decision does not authorize source-code or schema changes, migrations,
  provider selection or activation, checkout/payment activation, deployment,
  production-readiness, or go-live.

## Related Authority

- [`NIUVA_MASTER_SPEC.md`](../../NIUVA_MASTER_SPEC.md)
- [`DEC-ACCESS-002-granular-role-permission-matrix.md`](../access/DEC-ACCESS-002-granular-role-permission-matrix.md)
- [`DEC-AFTER-01-retail-revision-and-after-sales-policy.md`](DEC-AFTER-01-retail-revision-and-after-sales-policy.md)
- [`DEC-ETA-01-retail-eta-and-customer-milestone-policy.md`](DEC-ETA-01-retail-eta-and-customer-milestone-policy.md)
- [`DEC-INV-01-retail-checkout-reservation-duration.md`](DEC-INV-01-retail-checkout-reservation-duration.md)
- [`DEC-OFFER-01-retail-offer-file-and-quote-routing.md`](DEC-OFFER-01-retail-offer-file-and-quote-routing.md)
- [`DEC-PRICE-001-custom-print-commercial-pricing.md`](DEC-PRICE-001-custom-print-commercial-pricing.md)
- [`DEC-TAX-01-tax-inclusive-display-and-finance-activation-gate.md`](DEC-TAX-01-tax-inclusive-display-and-finance-activation-gate.md)
- [`ADR-003-retail-payment-orchestration-boundary.md`](../architecture/ADR-003-retail-payment-orchestration-boundary.md)
- [`2026-07-30-niuva-mvp-decision-packet.md`](../../implementation/specs/candidates/2026-07-30-niuva-mvp-decision-packet.md)
