# DEC-PRICE-001 — Custom 3D Print Commercial Pricing

- **Status:** Approved Commercial Policy — Activation Gated
- **Decision date:** 30 July 2026
- **Policy identifier:** `NIUVA-CP-FDM-001`
- **Decision owner:** Product and commercial decision authority
- **Decision source:** Explicit user approval of NMVP-D03 and its effective-date strategy
- **Scope:** Direct-calculated Custom 3D Print using Niuva-owned PLA or ABS filament

## Context

Niuva needs a reproducible customer price for standardized FDM work whose file,
material, weight, and print duration can be validated through an approved
slicer profile. The original spreadsheet and discussion distinguished this
service from Self Service, customer-owned filament, printer rental, membership,
bulk/partnership work, and other quote-required services.

Applying one rate to the whole weight would create price cliffs at tier
boundaries. Rounding slicer weight or duration would also change the technical
input and make historical reproduction less accurate.

## Decision

Niuva approves commercial pricing policy `NIUVA-CP-FDM-001`.

`DEC-OFFER-01` governs whether an offer, file, configuration, quantity plan,
and operational context are eligible for this automatic calculation. This
formula applies only to an eligible direct-calculated result; it does not turn
an unsupported case into a price promise. Quote-required work and an approved
Assisted Retail Offer follow the routing, review, approval, ownership, expiry,
and checkout-revalidation boundaries in `DEC-OFFER-01`.

### Material price

For exact billable slicer weight `g`:

```text
PLA =
  min(g, 200) * 1000
  + min(max(g - 200, 0), 300) * 900
  + max(g - 500, 0) * 800

ABS =
  min(g, 200) * 1200
  + min(max(g - 200, 0), 300) * 1100
  + max(g - 500, 0) * 1000
```

The progressive tiers mean:

| Material | First 200 g | Next 300 g | Above 500 g |
| --- | ---: | ---: | ---: |
| PLA | Rp1.000/g | Rp900/g | Rp800/g |
| ABS | Rp1.200/g | Rp1.100/g | Rp1.000/g |

### Machine price

```text
machine_price = exact_print_seconds / 3600 * 5000
```

### Custom Print production price

```text
unrounded_custom_print_price =
  progressive_material_price + machine_price

custom_print_price =
  ROUND_HALF_UP(unrounded_custom_print_price, 0)
```

The following rules apply:

1. There is no 50-gram minimum and no inferred minimum duration.
2. Weight and duration retain the exact accepted slicer precision.
3. Material price, machine price, and the combined pre-round total are not
   rounded individually.
4. Only the combined Custom Print production price is rounded, once, half-up to
   the nearest rupiah.
5. Billable weight includes the model plus slicer-reported support, brim/raft,
   and purge/waste.
6. Single-color and multicolor use the same formula. Multicolor affects price
   only through accepted slicer weight and print duration.
7. The production price includes electricity, basic finishing, basic
   packaging, support removal, QC, failed-print risk, and any legally applicable
   indirect tax under `DEC-TAX-01`.
8. Standard Custom 3D Print does not add a separate Full Service fee.
9. Shipping or pickup charges are outside this formula and remain governed by
   the separately approved fulfillment policy.
10. Unsafe, unsupported, uncertain, complex, bulk, borongan, partnership,
    recurring, special-material, finishing/assembly, capacity/deadline, or
    slicing-failure cases become `quote_required`.

## Activation and Versioning

- The approval date is not the commercial effective date.
- `NIUVA-CP-FDM-001` becomes effective only when Retail checkout MVP is
  separately authorized for activation.
- The activation record must store an exact timezone-aware `effective_at` in
  `Asia/Jakarta`, the authorized actor, reason, policy identifier, and audit
  reference.
- A `catalog_manager` may prepare the pricing candidate. Activation/publication
  requires the existing `manager_approver` capability after Finance tax
  confirmation; one account may act only when it explicitly holds the required
  roles.
- Activation is blocked until the Finance tax profile required by `DEC-TAX-01`
  is confirmed.
- The published policy version is immutable. Any rate, tier, inclusion,
  precision, or rounding change creates a new policy version and effective
  timestamp.
- New calculations resolve the policy effective at server calculation time.
  A stale draft or preview is revalidated before commitment.
- Paid orders and accepted quotations retain their original slicer input,
  formula, rate, inclusion, tax, unrounded amount, rounded amount, and policy
  snapshots.

## Refund and Historical Behavior

- A refund or adjustment starts from the paid order's immutable commercial and
  tax snapshots, not the current price policy.
- This decision does not define refund eligibility, fee allocation, partial
  refund rules, return shipping, or reprint entitlement; those Retail
  after-sales topics are governed by `DEC-AFTER-01`.
- Historical orders and quotations are not recalculated or rewritten when this
  policy is activated or superseded.

## Alternatives Considered

### Apply one tier rate to the entire weight

Rejected because crossing a tier boundary could reduce the total price and
produce a commercial price cliff.

### Round weight, duration, or every price component

Rejected because intermediate rounding changes technical inputs and can distort
the final total.

### Add a 50-gram minimum

Rejected by the approved business rule. Work below 50 grams is billed using its
actual accepted slicer weight.

## Consequences and Follow-up

- Slicer/profile calibration, numeric quote-required thresholds, source
  implementation, and production evidence remain separate under the
  activation gates in `DEC-OFFER-01`.
- Customer-owned filament, Self Service, rental, membership, shipping, bulk,
  and partnership pricing are not changed by this decision.
- The formula may be used only with validated Niuva-authoritative FDM profiles.
- This decision does not authorize source-code changes, schema changes,
  migrations, checkout/payment activation, provider selection, deployment,
  production-readiness, or go-live.

## Related Authority

- [`NIUVA_MASTER_SPEC.md`](../../NIUVA_MASTER_SPEC.md)
- [`DEC-ACCESS-002-granular-role-permission-matrix.md`](../access/DEC-ACCESS-002-granular-role-permission-matrix.md)
- [`PRD_Platform_Niuva_v2_1_retail_b2b.md`](../../references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md)
- [`DEC-AFTER-01-retail-revision-and-after-sales-policy.md`](DEC-AFTER-01-retail-revision-and-after-sales-policy.md)
- [`DEC-FUL-01-shipping-and-pickup-policy.md`](DEC-FUL-01-shipping-and-pickup-policy.md)
- [`DEC-OFFER-01-retail-offer-file-and-quote-routing.md`](DEC-OFFER-01-retail-offer-file-and-quote-routing.md)
- [`DEC-TAX-01-tax-inclusive-display-and-finance-activation-gate.md`](DEC-TAX-01-tax-inclusive-display-and-finance-activation-gate.md)
- [`2026-07-30-niuva-mvp-decision-packet.md`](../../implementation/specs/candidates/2026-07-30-niuva-mvp-decision-packet.md)
