# DEC-TAX-01 — Tax-Inclusive Display and Finance Activation Gate

- **Status:** Approved Direction with Open Finance Activation Gate
- **Decision date:** 30 July 2026
- **Decision owner:** Product decision authority; Finance confirmation required
- **Decision source:** Explicit user approval of tax-inclusive pricing; Niuva PKP status recorded as unknown
- **Scope:** Customer price display, tax snapshot, invoice boundary, and activation gate

## Context

The approved Custom 3D Print discussion states that tax is included in the
customer price rather than added later at checkout. Niuva's current Pengusaha
Kena Pajak (PKP) status is not yet known. The system must not infer that status,
an indirect-tax rate, product/service classification, or invoice obligation.

The approved display direction can be recorded now, while commercial activation
remains blocked until Finance confirms the legal tax profile applicable on the
effective date.

## Decision

Niuva uses a **tax-inclusive customer price direction**:

1. A customer-confirmed Custom 3D Print price is all-in for legally applicable
   indirect tax. Checkout must not add a surprise tax surcharge after customer
   confirmation.
2. Until Finance confirms Niuva's tax status and profile, the system must not
   display a PPN amount or rate, promise a Faktur Pajak, or describe any amount
   as PPN collected.
3. Retail checkout/payment activation is blocked while the production tax
   profile is unknown.
4. The Finance-approved tax profile must be versioned and include at least:
   `business_tax_status`, taxable product/service classification,
   calculation method, rate or no-collection basis, customer display mode,
   invoice/faktur behavior, regulatory reference, `effective_at`,
   `approved_by`, reason, and audit reference.
5. If Niuva is confirmed as PKP for the applicable transaction, the customer
   price remains tax-inclusive. The legally required embedded tax amount,
   calculation basis, rate, and invoice data are derived and snapshotted under
   the approved Finance profile; they are not added on top of the confirmed
   price.
6. If Niuva is confirmed as non-PKP for the applicable transaction, the same
   commercial total may remain the final price, but the UI and invoice must not
   label any component as PPN collected.
7. Every committed order stores the exact tax-profile version and tax display,
   basis, rate, amount or no-collection status used for that transaction.
8. A later tax-status, classification, or regulatory change creates a new
   effective version and does not recalculate paid orders or accepted
   quotations.
9. Refund calculation starts from the original paid-order tax and commercial
   snapshot. Retail eligibility, fee allocation, and after-sales policy follow
   `DEC-AFTER-01`; Finance accounting/tax correction remains separately gated.

## Effective Date

- This direction is approved on 30 July 2026 but is not commercially active on
  that date.
- The effective timestamp is recorded only when checkout MVP is separately
  authorized for activation.
- The activation timestamp must be timezone-aware in `Asia/Jakarta`, must not
  be backdated, and must have Finance confirmation of the tax profile.
- Finance confirmation and `manager_approver` publication must both be recorded
  before the profile becomes effective. Combining those duties in one person
  requires that account to hold both approved roles explicitly.

## Alternatives Considered

### Tax-exclusive display with a tax line added at checkout

Not selected. It conflicts with the approved all-in customer-price direction
and risks changing the amount after customer confirmation.

### Hard-code a PPN rate while PKP status is unknown

Rejected. Business tax status, classification, rate, calculation basis, and
invoice duties require current Finance/legal confirmation.

### Treat the unknown tax status as zero tax and activate checkout

Rejected. Unknown is not equivalent to non-PKP and cannot be used as production
tax authority.

## Consequences and Follow-up

- Finance must confirm PKP/non-PKP status, classification, calculation method,
  customer/invoice wording, regulatory reference, and accountable approver
  before checkout activation.
- Legal or tax-adviser review may be required; this record is a product
  governance boundary, not tax advice.
- Provider selection, Finance reconciliation operations, source
  implementation, deployment, production-readiness, and go-live remain
  separately gated.
- This decision does not authorize source-code changes, schema changes,
  migrations, payment activation, or production tax reporting.

## Regulatory Context

- [Direktorat Jenderal Pajak — Pengusaha Kena Pajak](https://pajak.go.id/index.php/id/pengusaha-kena-pajak)
- [JDIH Kementerian Keuangan — PMK 131 Tahun 2024](https://jdih.kemenkeu.go.id/dok/pmk-131-tahun-2024/view)

## Related Authority

- [`NIUVA_MASTER_SPEC.md`](../../NIUVA_MASTER_SPEC.md)
- [`DEC-ACCESS-002-granular-role-permission-matrix.md`](../access/DEC-ACCESS-002-granular-role-permission-matrix.md)
- [`DEC-AFTER-01-retail-revision-and-after-sales-policy.md`](DEC-AFTER-01-retail-revision-and-after-sales-policy.md)
- [`DEC-FUL-01-shipping-and-pickup-policy.md`](DEC-FUL-01-shipping-and-pickup-policy.md)
- [`DEC-PRICE-001-custom-print-commercial-pricing.md`](DEC-PRICE-001-custom-print-commercial-pricing.md)
- [`DECISION_LOG_Platform_Niuva_v2_1.md`](DECISION_LOG_Platform_Niuva_v2_1.md)
- [`2026-07-30-niuva-mvp-decision-packet.md`](../../implementation/specs/candidates/2026-07-30-niuva-mvp-decision-packet.md)
