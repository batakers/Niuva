# DEC-OFFER-01 — Retail Offer, File, Automatic Pricing, and Quote Routing

- **Status:** Approved Product Contract — Activation Gated
- **Decision date:** 31 July 2026
- **Decision owner:** Product and commercial policy authority
- **Decision source:** Explicit user approval of all six NMVP-D02 decision
  groups, including Option B — Assisted Retail Offer
- **Scope:** Direct-checkout Retail offer classification, Custom 3D Print
  configuration/file eligibility, automatic-pricing eligibility,
  `quote_required` routing, and the Assisted Retail Offer boundary

## Context

Niuva sells Ready Products and Custom 3D Printing through one Retail catalog
while retaining quotation paths for nonstandard work. Stock behavior, pricing
behavior, and customer journey are different decisions: a made-to-order
keychain may still have a fixed price, while a technically uncertain Custom 3D
Print request may require quotation.

The automatic path must never turn an unsupported file, unsafe production plan,
uncertain fulfillment, or uncalibrated profile into a commercial promise.
Conversely, a Retail customer whose request needs manual estimation must not be
forced to become a B2B organization solely because the request is
`quote_required`.

This decision provides the product contract. It does not approve slicer,
storage, payment, logistics, schema, source implementation, migration,
deployment, production readiness, or go-live.

## Decision

### Independent offer, pricing, and fulfillment attributes

The product contract keeps these concepts separate:

- `offer_type` describes the customer-facing offer, including Ready Product,
  Custom 3D Print, and a separately governed manual service;
- `pricing_mode` is `fixed`, `calculated`, or `quote_required`; and
- `fulfillment_mode` is `ready_stock` or `made_to_order`.

Examples:

- an in-stock keychain may be `fixed` plus `ready_stock`;
- the same standardized keychain produced after purchase may be `fixed` plus
  `made_to_order`;
- Standard Custom 3D Print is `calculated` plus `made_to_order`; and
- complex custom, bundle, bulk, borongan, partnership, or recurring work is
  `quote_required`.

Self Service, customer-owned-filament service, printer rental, membership,
bundle/borongan, partnership, and recurring work may be described on the
website but remain manual request/reservation/quotation paths unless a later
decision approves a direct-checkout contract.

### Simple and detailed customer configuration

The Custom 3D Print configurator provides:

- **Simple mode** as the default, covering material, color, quantity,
  dimensions/scale, and one Niuva quality preset; and
- **Detailed/advanced mode**, exposing only technical parameters and values that
  Niuva has calibrated and explicitly enabled.

Niuva-authoritative machine, nozzle, material, support, and process profiles
are the calculation source. Embedded slicer, printer, material, support, or
process settings supplied by the customer are never trusted as the commercial
source.

Preset labels, exposed advanced fields, allowed values, and their relationships
remain calibration outputs. An unknown, disabled, or unsafe combination cannot
be guessed and becomes `quote_required`.

### Allowed-input matrix

| Input | Product behavior |
| --- | --- |
| `.stl` | Eligible for automated validation and slicing |
| `.3mf` | Eligible only for a supported model/plate; embedded customer profiles are ignored and Niuva profiles are applied |
| `.obj`, `.step`, `.stp` | Accepted only for manual technical review and quotation |
| ZIP, multiple distinct files/models/parts, or multiple plates | Accepted only for manual technical review and quotation |
| `.gcode` | Rejected; customer-supplied machine instructions are never executed or priced |
| PDF, JPG/JPEG, PNG | Optional quotation references only; never geometry or an automatic-pricing source |

File extension alone is never sufficient. Every accepted upload remains subject
to the private provider-neutral storage boundary in `ADR-002`, including
extension, MIME/signature, size, ownership, authorization, malware/quarantine,
quota, retention, backup/restore, and reconciliation gates.

### Automatic-pricing eligibility

A `calculated` result may display a final customer price only when every
applicable condition succeeds:

1. The customer is authenticated under `DEC-RT-02`.
2. The exact file version is eligible, private, owned, validated, and available.
3. Slicing succeeds through an active Niuva-authoritative FDM profile.
4. The material is enabled Niuva-owned PLA or ABS under
   `NIUVA-CP-FDM-001`.
5. Dimensions and scale fit an approved printer/build-volume profile.
6. The selected color, nozzle, process, and configuration are enabled.
7. No CAD repair, nonstandard finishing, assembly, or unsupported
   post-processing is required.
8. Quantity has a validated production plan. The system does not multiply one
   object price when plate layout, repeated jobs, purge/waste, machine time, or
   capacity has not been recalculated safely.
9. Commercial pricing, tax, capacity, ETA, and eligible fulfillment policies
   are active and mutually compatible.
10. The operator-risk policy does not reject automatic commitment.

Single-color or multicolor may remain calculated only when an approved profile
produces the accepted billable weight and machine duration. Otherwise it becomes
`quote_required`.

The calculation follows `DEC-PRICE-001` and retains exact slicer precision
until the one approved final-price rounding step. Tax and fulfillment follow
`DEC-TAX-01` and `DEC-FUL-01`.

### Customer confirmation before checkout

Before a calculated configuration may enter checkout, the customer sees and
confirms:

- the analyzed file version;
- dimensions and scale;
- material, color, quantity, and selected configuration;
- slicer-derived billable filament weight and print duration;
- customer-safe price breakdown and final payable production price;
- the approved ETA range; and
- pickup or delivery selection and its authoritative amount where applicable.

The server revalidates the file/configuration, pricing policy, tax, availability,
ETA, and fulfillment immediately before order/payment-attempt creation. A stale
or changed result requires explicit reconfirmation. A failed, unsafe, or
uncertain result never displays an approximate amount or ETA as final.

### `quote_required` triggers

A request becomes `quote_required` when any applicable condition includes:

- validation or slicing failure;
- unsupported dimensions, build volume, or profile;
- required CAD/geometry repair;
- unavailable or unsupported material, color, nozzle, or process;
- nonstandard finishing, assembly, or post-processing;
- multiple distinct models, parts, plates, dependencies, or complex
  instructions;
- quantity, deadline, capacity, or operational risk that cannot be committed
  safely;
- bulk, bundle, borongan, partnership, recurring order, or customer-owned
  filament;
- special, international, unsupported, oversize, unsafe, or uncertain
  fulfillment; or
- an authorized operator risk rejection with a customer-safe reason and audit
  record.

Exact file-size, build-volume, gram, duration, quantity, part/plate-count,
deadline/capacity, and high-risk thresholds remain calibration gates. No
threshold is inferred from this decision.

### Quote handoff and mixed-cart behavior

`quote_required` is a commitment route, not a customer or organization type.

- A `quote_required` item does not create a Retail Order, inventory reservation,
  payment attempt, or checkout total.
- In a mixed cart, the quote item is separated into a request while eligible
  direct-checkout items remain in the cart.
- The handoff preserves the authenticated account, originating catalog
  product/variant, configuration, quantity, file versions, safe analysis
  results, requested fulfillment context, and reason codes without customer
  re-entry.
- The customer receives a stable request reference, safe status/reason, and next
  action.
- A bulk, partnership, borongan, recurring, organizational, contractual, or
  special/international-fulfillment request enters the B2B Inquiry →
  Quote/Project path after its applicable organization and governance gates.
- An individual or UMKM request that remains suitable for the Retail Order
  lifecycle may use the Assisted Retail Offer below.

The handoff does not merge Retail Order and B2B Quote/Project aggregates,
state machines, permissions, or customer projections.

### Assisted Retail Offer

An Assisted Retail Offer is a private, versioned, one-time commercial offer for
an authenticated Retail customer after manual technical/commercial review. It
is not a public catalog price, a catalog price override, or a B2B Quote/Project.

Each version records at least:

- immutable offer and version identity;
- authenticated customer ownership;
- source request and originating catalog/configuration references;
- exact file, configuration, quantity, and safe technical-analysis snapshots;
- exact approved production price, tax-profile reference, and customer-safe
  breakdown;
- approved ETA range;
- applicable fulfillment eligibility assumptions;
- `expires_at`;
- preparation, approval, offer, acceptance/decline/expiry/supersession actors
  and timestamps; and
- audit references and customer-safe reasons.

The product lifecycle is:

```text
draft
-> awaiting_approval
-> offered
-> accepted | declined | expired | superseded
```

The lifecycle names define the product contract, not the final backend state
machine or API.

- An authorized estimator/operator may prepare the offer.
- Manual price commitment requires `manager_approver` under
  `DEC-ACCESS-002`. One account may perform combined work only when its
  explicitly assigned roles permit every step; actor, role context, reason, and
  audit remain distinct.
- A revision creates a new immutable version and supersedes the prior active
  version. No accepted, declined, expired, or superseded version is silently
  rewritten.
- The MVP does not require negotiation chat. Customer-requested changes return
  to manual review and a new version when Niuva elects to revise the offer.
- Acceptance authorizes entry into the standard Retail checkout; it does not
  itself create an Order, reservation, payment attempt, or paid state.
- Checkout revalidates offer ownership, active version, expiry, tax,
  availability/capacity, ETA, and fulfillment. Standard pickup or domestic
  delivery is recalculated under `DEC-FUL-01`; a stale provider rate is never
  locked for the full offer lifetime.
- Order creation, the fixed 30-minute reservation, online payment, fulfillment,
  production milestones, after-sales, and notifications continue under their
  existing Retail decisions.
- A declined, expired, or superseded offer cannot be used for checkout.

The Assisted Retail Offer's manually approved production price becomes a
private one-time fixed commercial snapshot for that customer, file,
configuration, quantity, and active version. It never changes the catalog
variant or the `NIUVA-CP-FDM-001` policy.

### B2B separation

Assisted Retail Offer is limited to work that can still use the Retail Order,
online-payment, and standard Retail operational policies. Work needing
organization membership, procurement/legal terms, quotation negotiation,
milestone/term invoices, contract-specific approval, recurring commercial
terms, or B2B project tracking remains a B2B Inquiry/Quote/Project.

An individual request is not automatically classified as an organization.
Similarly, selecting a B2B path does not convert a B2B Quote into a Retail
Order.

## Activation and Versioning

Activation requires, at minimum:

- calibrated and versioned machine, nozzle, material, quality, support, and
  process profiles using representative Niuva files/printers;
- approved preset names, advanced fields/values, file limits, build volumes,
  quantity/part/plate/deadline/capacity/risk thresholds, and customer-safe
  validation/reason copy;
- an exact Assisted Retail Offer default/allowed expiry policy;
- an approved tax profile under `DEC-TAX-01`;
- private production storage readiness under `ADR-002`;
- compatible checkout, payment, inventory/reservation, ETA, fulfillment,
  after-sales, notification, and authorization contracts;
- exact schema/API/state/conflict/idempotency/audit contracts;
- non-destructive historical compatibility and migration procedure where
  required; and
- separately authorized implementation, deployment, readiness, and go-live.

Any change to the allowed-input matrix, automatic-pricing eligibility,
quote-routing rule, customer confirmation contract, offer approval rule, or
Assisted Retail Offer commercial behavior requires a documented new version or
amendment. Paid Retail Orders and accepted quotations retain their original
commercial/file/configuration snapshots.

## Alternatives Considered

### Accept every Bambu-importable format for automatic pricing

Rejected. Import capability does not prove safe, reproducible validation,
slicing, or commercial calculation.

### Trust customer `.3mf` profiles or accept customer `.gcode`

Rejected. Customer-supplied machine/process instructions are not authoritative
and may be incompatible or unsafe.

### Display an approximate final price after validation or slicing failure

Rejected. It creates an unsupported commercial promise and undermines the
`quote_required` safety boundary.

### Send every Retail quote request to B2B Organization

Rejected. `quote_required` describes commitment uncertainty, not customer type.
It would force individuals into an organization lifecycle and collapse
approved Retail/B2B boundaries.

### Inquiry-only handling for all individual quote requests

Not selected. It would prevent an approved individual offer from returning to
the required Retail online-payment and tracking path.

### Create a Retail Order immediately when quotation is requested

Rejected. There is no approved price, ETA, inventory commitment, or payment at
request time. Order/reservation/payment effects begin only through the
authorized checkout path.

### Keep a `quote_required` item inside a direct-checkout total

Rejected. A cart total cannot combine an unknown commercial amount with
committed fixed/calculated items.

## Consequences and Follow-up

- Catalog, pricing, stock, customer type, and transaction path remain explicit
  rather than overloaded into one flag.
- Safe `.stl`/`.3mf` work can reach automatic price and checkout; unsupported
  work retains context without invented price or re-entry.
- Assisted Retail Offer adds a bounded manual-review and approval step while
  preserving Retail checkout/payment/tracking.
- A later implementation must test file validation, profile authority, stale
  recalculation, quantity planning, mixed-cart separation, quote handoff,
  offer-version conflicts, approval, expiry, acceptance, checkout reuse,
  privacy, idempotency, and Retail/B2B separation.
- This decision grants no source-code, schema, migration, provider, deployment,
  readiness, production activation, or go-live authority.

## Related Authority

- [`NIUVA_MASTER_SPEC.md`](../../NIUVA_MASTER_SPEC.md)
- [`DEC-RT-02-retail-account-required-checkout.md`](DEC-RT-02-retail-account-required-checkout.md)
- [`DEC-PRICE-001-custom-print-commercial-pricing.md`](DEC-PRICE-001-custom-print-commercial-pricing.md)
- [`DEC-TAX-01-tax-inclusive-display-and-finance-activation-gate.md`](DEC-TAX-01-tax-inclusive-display-and-finance-activation-gate.md)
- [`DEC-FUL-01-shipping-and-pickup-policy.md`](DEC-FUL-01-shipping-and-pickup-policy.md)
- [`DEC-ETA-01-retail-eta-and-customer-milestone-policy.md`](DEC-ETA-01-retail-eta-and-customer-milestone-policy.md)
- [`DEC-AFTER-01-retail-revision-and-after-sales-policy.md`](DEC-AFTER-01-retail-revision-and-after-sales-policy.md)
- [`DEC-DATA-003-notification-schema-retention-and-delivery-boundary.md`](DEC-DATA-003-notification-schema-retention-and-delivery-boundary.md)
- [`DEC-ACCESS-002-granular-role-permission-matrix.md`](../access/DEC-ACCESS-002-granular-role-permission-matrix.md)
- [`ADR-002-production-file-storage-architecture.md`](../architecture/ADR-002-production-file-storage-architecture.md)
