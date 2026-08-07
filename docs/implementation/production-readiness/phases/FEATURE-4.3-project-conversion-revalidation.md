# Feature 4.3 — Project conversion revalidation

Status: source candidate on `audit/backend-b2b-project-conversion`.

## Objective

Revalidate the accepted Quote-to-Project transaction boundary so a Project is
created once, retains the exact accepted Quote version, and rejects corrupted
or replayed commercial commands without inferring historical data.

## Scope and acceptance

- Bind a reused conversion `operation_id` to its original command fingerprint.
- Require current, sent, accepted, and acceptance-evidence version references
  to identify the same Quote version.
- Require the accepted version to belong to the source Quote.
- Update the Quote claim before inserting the Project inside the shared
  transaction, preserving one-Project-per-Quote behavior under contention.
- Retain immutable Quote snapshot, exact line identities, inquiry reference,
  actor, reason, and append-only conversion history.
- Focused lifecycle and transaction tests must pass.

## Exclusions

- No Organization Portal, customer membership, or organization assignment is
  invented; those remain under DR-010.
- No historical backfill, migration, provider, payment, deployment, or
  production operation is performed.
- Transaction-required conversion remains fail-closed when capability is
  unavailable.

## Authority

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
- `docs/decisions/product/DEC-DATA-002-quote-line-identity-and-ambiguous-history.md`
- `docs/decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md`

## Verification

- Focused Project/Quote/transaction matrix: `28 passed, 1 skipped`; the skip is
  the explicit real-replica-set opt-in exercised by CI.
- Full backend regression: `996 passed, 15 skipped, 14 subtests passed`.
- No migration or external target was contacted.
