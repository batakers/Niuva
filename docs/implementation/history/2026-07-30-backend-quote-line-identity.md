# Backend Quote-Line Identity Completion

Status: **Implementation Evidence — Historical Execution Separately Gated**

Date: 30 July 2026
Baseline: `origin/main` `7d8d5c90f6440f1276ee4b82c166258514a93cd1`
Branch: `fix/backend-quote-line-identity`

## Completed source contract

- Quote revision lines receive unique, server-owned `quote_line_id` values.
- Work Order HTTP and service commands require the exact line identity; the
  legacy service-level `variant_id` inference path was removed.
- Work Orders derive and persist the exact accepted
  `source_quote_version_id` and `quote_line_id`.
- Active Work Order quantity is capped cumulatively per exact accepted Quote
  line and version.
- Missing/duplicate historical line identity, missing Project source version,
  and Project snapshot/version mismatch stop with
  `409 quote_line_reconciliation_required`.
- Historical Quotes are not inferred, rewritten, deleted, or backfilled.
- The aggregate-only preflight reports missing/duplicate/orphan/mismatched
  references and overcommit counts without exposing record identifiers or
  commercial/customer content.

## Verification

- Focused B2B and report suites: 40 passed.
- Full backend suite: 630 passed, 12 documented skips, 14 subtests passed.
- Full mandatory MongoDB 7.0.37 replica-set suite: 68 passed, 0 skipped.
- Focused real Work Order/B2B concurrency: 9 passed.
- Report MyPy, critical Flake8, compile, Black for new report files, and diff
  checks passed.

The real concurrency case proves that two Work Order commands using one stale
Project version cannot cumulatively overcommit an accepted Quote line. The
winning record retains the exact version and line references; a later command
with the current Project version is rejected by the per-line quantity cap.

## Remaining external gate

No shared, staging, production, or other historical dataset was accessed. A
future isolated-data report execution requires separate approval of the exact
target, read-only credential, dataset provenance/privacy handling, reviewer,
backup/restore rehearsal, and reviewed mapping. Any data correction still
requires its own non-destructive migration procedure, dry run, validation, and
rollback/restore approval.

This external gate is not incomplete source work and does not authorize
automatic backfill, historical mutation, deployment, production readiness, or
go-live.
