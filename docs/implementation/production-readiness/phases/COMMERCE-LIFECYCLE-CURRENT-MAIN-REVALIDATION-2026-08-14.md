# Commerce Lifecycle Current-Main Revalidation

<!-- markdownlint-disable MD013 -->

Status: **repository audit complete; active Retail/payment and customer Organization Portal remain gated**

Audited runtime baseline: `origin/main` at
`15b759a02b036330f1dd0913611043e0fd6134e2`.

Audit stack base: `audit/backend-api-contract-current-main` at `747f3d6`.
The stacked audit commits do not change backend/frontend runtime behavior, so
all source conclusions below apply to the selected current-main runtime.

## 1. Outcome

The bounded Inquiry-to-production source chain is internally consistent at the
selected baseline. Inquiry conversion, Quote lifecycle, Project conversion,
and Work Order creation use version/fingerprint or operation-ID controls;
transaction-required cross-collection changes fail closed. Accepted Quote
lines carry server-owned immutable identities, quantities, prices, and line
totals. Work Orders consume the exact accepted line, enforce its cumulative
quantity cap, and derive material requirements from the accepted snapshot.

Retail 3.4A remains a pure, provider-neutral contract. Its cart fingerprint,
authoritative snapshot, lifecycle, append-only history, fulfilment tail, and
compare-and-swap precondition are tested, while runtime create and transition
routes return `503 retail_transaction_inactive`. Legacy manual-transfer
estimate, proof-upload, and verification routes return
`410 legacy_manual_transfer_disabled`; refund and return remain named suspended
actions. No payment, refund, webhook, shipping, provider, inventory,
reservation, migration, or activation behavior was added by this audit.

Layer 05 readiness remains **68%** because the Organization Portal, active
Retail journey, external consumer, representative data, and production gates
remain open. Confidence for the bounded repository commerce contracts rises
from 90% to **97% repository / 0% production**. The audit found no new P0 or P1
source defect in the selected scope.

## 2. Lifecycle disposition

| Boundary | Current-main evidence | Disposition |
| --- | --- | --- |
| Inquiry | Public intake is throttled and customer-safe; internal triage requires `inquiries.read/write`; conversion requires both Inquiry and Quote write permissions; exact replay is stable, changed reuse conflicts, and conversion fails closed without a transaction. | Bounded source contract revalidated. External limiter topology and delivery/operations remain separate. |
| Quote | Revisions freeze authoritative catalog facts; line identity is server-owned; arithmetic is derived; sent/accepted version links and acceptance evidence must agree; lifecycle/revision/acceptance commands bind operation IDs to exact fingerprints. | Bounded source contract revalidated. Historical ambiguous lines stay read-only and require approved reconciliation. |
| Project Conversion | A transaction claims the accepted Quote before inserting one Project; accepted/current/sent/evidence version links must match and the version must belong to the Quote; the exact Quote snapshot and line identities are retained. | Bounded source contract revalidated. No customer/organization query surface is activated. |
| Work Order | Exact Quote line and source version are required; cumulative non-cancelled quantity cannot exceed that accepted line; Project version CAS serializes competing creation; material allocation is all-or-none; shortage queue/recovery is bounded; QC pass/rework and history are versioned and immutable. | Bounded source contract revalidated. Real replica-set behavior remains CI/local-isolated evidence, not production evidence. |
| Retail 3.4A | Intent normalization, semantic fingerprint, exact replay/conflict, authoritative fixed-price snapshot, currency/quantity/fulfilment rules, lifecycle graph, append-only history, and CAS filter are pure contracts. | Contract complete for inactive scope. No active persistence/runtime capability is claimed. |
| Retail routes | Admin list/read is permission-scoped for historical records. Create and transition return named `503`; cancel/refund/return are suspended. Legacy estimate/proof/verification mutations return named `410`. | Inactive boundary is enforced. Payment/fulfilment activation remains blocked and out of scope. |

## 3. Quote-line, quantity, and price integrity

- `build_quote_item_snapshot` assigns a UUID `quote_line_id`, validates positive
  integer quantity and non-negative integer unit price, and derives
  `line_total_minor`; a caller cannot submit a contradictory total.
- Quote readiness rejects missing or duplicate identities and inconsistent
  arithmetic. `DEC-DATA-002` therefore remains satisfied without inventing an
  identity for ambiguous history.
- Project conversion deep-copies the exact accepted Quote version. Work Order
  lookup checks the source version belongs to the Project's Quote and refuses
  a missing, duplicate, foreign, or unknown line.
- Work Order committed quantity is summed only for the same Project, accepted
  source version, exact line, and non-cancelled status. The Project
  `id + version + status` transaction claim prevents concurrent commands using
  the same expected version from both committing.
- Retail checkout copies the published catalog's unit price, currency,
  product/variant identity, tax-policy version, and fulfilment-policy version.
  Later catalog repricing cannot mutate an already built snapshot.

## 4. Customer and organization query scoping

The registered Quote, Project, Work Order, and shortage HTTP operations are
internal `/admin/b2b/*` routes protected by their granular read/write
permissions. The public Inquiry response alone uses a customer-safe projection.
Customer projection helpers for Inquiry, Quote, and Project use explicit
allowlists and withhold costing, sourcing, internal linkage, notes, and audit
fields.

There is no customer or organization Quote/Project query route on current-main,
and the commercial aggregates do not establish an organization membership or
assignment model. Consequently there is no active cross-organization query to
approve or test. This is a deliberate fail-closed gap under DR-010, not evidence
that Organization Portal scoping is complete. A later portal task must decide
membership, assignment, ownership transfer, historical binding, route fields,
and negative cross-organization fixtures before mounting any customer query.

## 5. Work Order allocation, QC, and recovery

Allocation sends one bulk operation set to the inventory transaction service
and updates the Work Order under the same transaction. A measurable inventory
conflict creates or refreshes one open shortage record; unrelated errors do not
create false shortages. Successful later allocation resolves the open queue
entry without turning a committed allocation into a failure if queue cleanup
itself fails.

Reserved materials must be consumed before entry into QC. Completion is only
available through a QC pass; a failed result creates an immutable open rework
record, and resumption records actor, time, and reason. Allocation, consumption,
transition, cancellation, and QC updates use expected-version/status filters;
exact command replay is read-only and conflicting operation reuse fails.

## 6. Retail lockdown

The pure Retail aggregate recognizes lifecycle states needed to validate a
future contract, but this does not expose those commands at runtime:

- `POST /api/admin/retail-orders` returns `503
  retail_transaction_inactive` after authorization and payload validation;
- `POST /api/admin/retail-orders/{id}/transitions` returns the same named
  inactive response;
- `POST /api/admin/retail-orders/{id}/refund` and the other suspended actions
  return named `409` refusals;
- legacy payment-proof upload, estimate, and payment verification return
  `410 legacy_manual_transfer_disabled`; and
- the runtime capability response continues to report checkout/provider as
  inactive and manual-transfer mutations as disabled.

The internal `RetailOrderService` remains usable by isolated synthetic tests,
but no active route calls its create/transition methods. That separation is
intentional contract evidence, not a hidden activation path.

## 7. Verification evidence

Focused supported-runtime Python 3.14.3 matrix:

```text
Inquiry and conversion: 21 passed
Quote lifecycle/snapshot/routes: 20 passed
Project and customer-safe projection: 17 passed
Work Order/allocation/shortage: 21 passed, 1 skipped
Retail contract/aggregate/routes/legacy projection: 82 passed
Combined selection: 161 passed, 1 skipped
Full hermetic backend: 1032 passed, 15 skipped, 14 subtests passed
Expected-skip enforcement: zero unexpected skips
```

The one skip is the explicit real-replica-set Work Order allocation module when
`NIUVA_RUN_REAL_TRANSACTION_TESTS` and `MONGO_TRANSACTION_TEST_URL` are absent.
Exact-head transaction CI must execute that module against the repository's
isolated replica set before merge. No external target, historical record,
migration, payment provider, or production environment was contacted.

Critical lint, Markdown/diff checks, full hermetic quality gates, mandatory
real-transaction CI, and independent review remain required at the published
head. Results are attached to the PR rather than converted into a production
claim.

## 8. Finding and tracker disposition

- `BE-002`/`DB-003` remain resolved in source for the shared executor.
  `INT-009` improves to current revalidated evidence for the five commerce
  boundaries, but stays partial across command families outside this audit.
- `BE-004`/`DB-004` remain resolved in source. `DB-013` remains partial because
  historical Quote-line reconciliation has not been authorized or executed.
- `BE-003`/`INT-003` are corrected from the stale `broken_contract` wording to
  `resolved_for_inactive_scope / blocked_by_decision_for_activation`: forbidden
  legacy mutations and Retail transaction routes fail deterministically, while
  no active Retail/payment/fulfilment journey exists.
- `INT-007` remains `blocked_by_decision`: customer-safe projection helpers do
  not constitute an Organization Portal or a membership-scoped query contract.
- No score, finding, or passing test authorizes payment orchestration, refund,
  webhook, shipping, provider selection, deployment, or activation.

<!-- markdownlint-enable MD013 -->
