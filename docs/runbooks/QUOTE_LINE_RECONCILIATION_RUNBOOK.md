# Quote-Line Historical Reconciliation Preflight

Status: **Runbook — Isolated Read-Only Preflight Only**

Authority:

- `DEC-DATA-002` defines immutable `quote_line_id`, exact Quote-version and
  Work Order references, per-line quantity limits, and the prohibition on
  inferred or automatic historical backfill.
- ADR-001 governs transaction-required Work Order mutations.

This runbook does not authorize a migration, backfill, shared/staging/
production access, historical mutation, deployment, or go-live.

## Runtime contract

New Quote revisions generate a server-owned unique `quote_line_id` for every
line. Work Order commands require that exact identity and derive the exact
`source_quote_version_id` from the accepted Project. The service never selects
a line by `variant_id`.

A missing or duplicate line identity, missing Project source version, or
Project snapshot/version mismatch returns:

```text
409 quote_line_reconciliation_required
```

The callback stops before a Work Order write. No fallback, generated identity,
or first-match selection is permitted.

## Aggregate-only preflight

`backend/quote_line_reconciliation_report.py` reads only:

- `b2b_quote_versions`;
- `b2b_projects`;
- `work_orders`.

It returns counts by safe category. It never emits Quote, Project, Work Order,
customer, line, product, or version identifiers and exposes no description or
commercial content. The module has no apply, repair, update, insert, delete,
index, or backfill path.

The report checks:

- missing or duplicate Quote-version and line identities;
- duplicate line identity across versions;
- missing/orphan/mismatched Project source versions;
- missing/orphan/mismatched Work Order Project, version, and line references;
- invalid or cumulatively overcommitted Work Order quantities;
- bounded-scan completion.

Any issue returns `blocked_ambiguity`. `ready_for_review` means only that the
approved isolated sample contains no detected ambiguity; it is not migration
or production-readiness approval.

## Local synthetic verification

From the repository root:

```bash
backend/.venv/bin/python -m pytest -n 0 -q \
  backend/tests/test_quote_line_reconciliation_report.py \
  backend/tests/test_b2b_quote_item_snapshots.py \
  backend/tests/test_b2b_project_lifecycle.py \
  backend/tests/test_b2b_work_orders.py
```

Real concurrency evidence additionally requires the isolated replica-set
topology and the explicit environment contract from
`doc/TRANSACTION_CAPABILITY_RUNBOOK.md`.

## Future isolated-data execution gate

Do not execute the report against any non-synthetic dataset until all of the
following are separately approved and recorded:

1. exact isolated target and immutable target label;
2. read-only credential and reviewer;
3. representative dataset provenance and privacy handling;
4. backup and successful restore rehearsal;
5. reviewed mapping for every proposed historical correction;
6. dry run, validation, rollback/restore, and transaction-capability evidence.

The report must be called with `target_scope="isolated"`. Every other value
fails before collection reads. Calling an environment isolated does not itself
grant authority; the approvals above remain mandatory.

## Stop and handoff

Stop on any non-zero issue count. Preserve historical records unchanged and
handoff only the aggregate report. A later reconciliation proposal must remain
non-destructive and must not derive identity from variant, description, price,
quantity, ordering, or another heuristic.
