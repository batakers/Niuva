# DEC-DATA-002 — Quote-Line Identity and Ambiguous Historical Data

Status: **Approved Decision**
Decision ID: `DEC-DATA-002`
Decision date: 29 July 2026
Approval source: Explicit Project Owner approval of `DR-006` Option A on
29 July 2026 (Asia/Jakarta)
Scope: Immutable B2B Quote-line identity, Work Order references, and treatment
of historical Quote data that lacks a determinable line identity

Related authority:

- `docs/NIUVA_MASTER_SPEC.md`, sections 11–13
- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
- `docs/decisions/product/DEC-PAY-02-legacy-manual-transfer-read-only.md`

## Context

An accepted Quote version is immutable, while an accepted version may contain
more than one line for the same production variant. A variant identifier is
therefore not sufficient to identify the commercial commitment consumed by a
Work Order. Historical Quote versions may also predate the canonical line
identifier and cannot safely be reconstructed from a variant, description,
price, or quantity alone.

## Decision

### Canonical identity

- Each line in every newly created Quote version receives a unique,
  immutable `quote_line_id` when that version is snapshotted.
- An accepted Project retains its `source_quote_version_id`.
- A Work Order created from an accepted Quote must retain both the
  `source_quote_version_id` and the exact `quote_line_id` it consumes.
- Quantity limits are evaluated per accepted Quote line, not merely per
  variant.

### Ambiguous historical data

- A historical Quote that lacks a `quote_line_id`, or whose line cannot be
  uniquely identified, remains preserved and read-only.
- No application, migration, or reconciliation process may infer, generate, or
  silently backfill an identity from variant, description, price, quantity, or
  another heuristic.
- A new Work Order or other mutation that requires such an identity must stop
  with an explicit reconciliation-required result. It must not select the first
  matching line or use a non-atomic fallback.

### Future reconciliation

A later historical-data reconciliation may proceed only under a separately
approved, non-destructive procedure with a reviewed mapping, backup, dry run,
validation, rollback/restore plan, and transaction-capability verification.
This decision does not authorize that procedure.

## Consequences

- Duplicate variants in an accepted Quote remain valid when their individual
  Quote lines are distinct.
- Historical commercial records are preserved rather than rewritten or deleted.
- Ambiguity prevents a new dependent mutation; it is not treated as missing
  data that code may repair automatically.
- Existing backend behavior that rejects absent or ambiguous line identity is
  aligned with this decision; no migration or data rewrite is implied.

## Excluded from Approval

This decision does not itself authorize:

- any migration, backfill, or mutation of historical data;
- provider selection, payment activation, Finance operations, or checkout;
- production/shared-environment execution, deployment, production readiness, or
  go-live; or
- resolution of other data-retention, notification, or legacy-order decisions.
