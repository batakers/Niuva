# Feature 4.4 — Work Order lifecycle

Status: source candidate on `feat/backend-work-order-lifecycle`.

## Objective

Complete the bounded internal production lifecycle from planned Work Order to
production, Quality Control, rework, and completion while preserving exact
Quote-line identity, material integrity, authorization, and immutable history.

## Scope and acceptance

- Replace direct `in_progress → completed` with mandatory
  `in_progress → quality_control`.
- Require `qc.write` for a pass or rework decision.
- Store version-bound, append-only QC records inside the Work Order.
- A failed QC result creates an immutable rework record and moves the Work
  Order to `rework`; resumption records who resumed it and why.
- A passed QC result is the only path to `completed`.
- Reused QC operation IDs are bound to the original outcome, version, actor,
  and reason.
- Reused transition operation IDs are likewise bound to the original target,
  version, actor, and reason.
- Material reservations must be consumed before entering QC.
- Existing cancellation, shortage/recovery, exact Quote-line caps, and
  transaction behavior remain intact.

## Exclusions

- No B2B invoice, DP/payment term, shipment, ETA, Organization Portal, provider,
  or production activation is introduced.
- QC/rework records remain embedded in the Work Order for this bounded source
  phase; no collection migration or historical rewrite is performed.
- No migration, external target, deployment, or production data is touched.

## Authority

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md`
- `docs/decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md`
- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
- `docs/decisions/product/DEC-DATA-002-quote-line-identity-and-ambiguous-history.md`

## Verification

- Focused Work Order/Project/shortage/real-transaction matrix initially passed
  `25 passed, 1 skipped`; the skip is the explicit replica-set opt-in covered by
  CI.
- Full backend regression: `992 passed, 15 skipped, 14 subtests passed`.
- Full frontend regression: `63 suites, 381 tests passed`.
- Frontend production build and release artifact generation passed; the bundle
  check ran in its configured report-only mode.
- No migration or external target was contacted.
