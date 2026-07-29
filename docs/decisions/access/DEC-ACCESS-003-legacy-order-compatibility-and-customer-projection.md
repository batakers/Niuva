# DEC-ACCESS-003 — Legacy Order Compatibility and Customer-Safe Projection

Status: **Approved Decision**
Decision ID: `DEC-ACCESS-003`
Decision date: 29 July 2026 (Asia/Jakarta)
Approval source: Explicit Project Owner approval of DR-007 Option A on 29 July
2026
Scope: Retained legacy Order compatibility routes, customer-safe projections,
and future sunset boundary

Related authority:

- `docs/NIUVA_MASTER_SPEC.md` sections 13 and 15
- `docs/decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md`
- `docs/decisions/product/DEC-PAY-02-legacy-manual-transfer-read-only.md`
- `docs/decisions/architecture/ADR-005-backend-remediation-runtime-policy.md`

## Context

The pre-separation `orders` aggregate remains the historical record for an
older upload-driven Retail flow. It does not represent the canonical Retail
Order lifecycle. The current compatibility surface still needs to preserve
authorized history, while the Master Spec prohibits exposing internal cost,
margin, supplier, profit, or internal notes to customers.

`DEC-PAY-02` already disables new manual-transfer instructions, payment-proof
uploads, verification, and proof-driven transitions. It deliberately leaves
the compatibility projection and future retirement policy open. A silent
removal would strand historical customer access; copying every stored legacy
field would violate the customer-data boundary.

## Decision

### Retained read-only compatibility

The legacy Order surface is retained as a read-only historical compatibility
surface for now:

- Customer history and detail reads remain limited to the authenticated record
  owner.
- Internal order reads and exports remain limited by the approved granular
  permission matrix.
- Existing historical manual-transfer records and their permitted historical
  metadata remain readable only through those ownership- and permission-scoped
  projections.
- The former new-order bookmark may remain an informational compatibility
  destination, but it must not create an Order, upload a file, start checkout,
  or imply an active payment or fulfilment capability.

No legacy Order command is re-enabled. Creation, status changes, estimates,
manual-transfer instructions, payment-proof uploads, verification, bulk
updates, and proof-driven transitions remain inactive under the existing
capability boundaries.

### Customer-safe projection

Customer responses must use an explicit allowlist rather than return every
stored legacy field. They may expose only customer-safe historical identity,
lifecycle/status, timestamps, customer-visible product or material details,
and customer-visible financial/payment history where the record supports that
visibility.

They must exclude internal cost, margin, supplier, profit, internal notes,
raw storage paths, internal audit/operational metadata, finance-only state,
and any unknown field. A legacy free-text note whose provenance cannot be
shown to be customer-authored is withheld from customer output. Historical
file access must stay ownership-scoped through controlled file access; a raw
storage location is not a customer projection field.

Internal projections and exports must also be role-specific. A generic
internal reader may not receive payment or other financial evidence merely
because the document contains it; the applicable permission remains required.

### Sunset and retention boundary

There is no current sunset date and no automatic historical rewrite, deletion,
or conversion. Legacy compatibility may be retired only after all of the
following have separately occurred:

1. a replacement Retail customer journey is explicitly approved;
2. the customer-safe compatibility projection and its direct access tests are
   implemented and verified on the selected scope;
3. a retention, customer communication, rollback-compatibility, and historical
   access procedure is approved.

Until then, history remains preserved and read-only. This decision does not
select a retention duration or authorize a deletion procedure.

## Consequences

- DR-007 is resolved as a policy decision.
- PHASE-01B may proceed to a separately scoped implementation/revalidation
  task for projections, direct allow/deny access tests, and controlled file
  references.
- Existing raw legacy-field behavior is not evidence that the new projection
  policy has been implemented; it requires revalidation after a separately
  authorized source change.
- PHASE-03C may use this retained/read-only/retire disposition as one input,
  but remains blocked by its other dependencies and decisions.

## Excluded from Approval

This decision does not authorize:

- source-code, frontend, migration, or historical-data changes;
- enabling a Retail order, upload, checkout, payment, fulfilment, refund, or
  return capability;
- payment-provider, Finance, storage-provider, retention-duration, or
  deletion-procedure selection;
- deployment, production operation, production readiness, or go-live.
