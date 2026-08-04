# Task Card — Feature 8.2 Pagination and Stable Ordering

Status: **bounded source complete — PR #110 merged as `ad800d9`; operational
and production gates remain separate**

## Identity and authorization

**Project Owner / API Owner / Driver:** Faiz

**Branch / worktree:** `feat/backend-pagination` /
`C:\\tmp\\niuva-pr110-review`

**Reconciled baseline:** `770a4c3d2d3f3ead0d44f5ac298fac1bb41a0702`
(`main`, after PR #109 merged).

**Authorization:** On 2 August 2026 the Project Owner approved the bounded B2B
pagination policy described below and authorized implementation, tracker
updates, commit, push, and pull request when verification is safe. On 3 August
2026 the owner separately authorized the recommended open-PR reconciliation
sequence, including exact-head merge after review and mandatory CI pass.
Database index application, migration, deployment, production-readiness, and
go-live remain unauthorized.

## Objective and approved contract

Replace capped raw-array responses for the five approved Admin/B2B list
families with deterministic cursor pages:

```json
{
  "items": [],
  "next_cursor": "opaque-or-null"
}
```

Approved rules:

- scope: Inquiry, Quote, Project, Work Order, and Material Shortage lists;
- default `limit=50`, maximum `100`, and invalid limits return `422`;
- order: `updated_at DESC`, then `id DESC` as the stable tie-breaker;
- opaque, versioned cursor bound to the active allowlisted filters;
- allowlisted filters: `status_filter` for every list and `project_id` for Work
  Orders;
- optional `updated_from` and `updated_before` use RFC3339 values with an
  explicit timezone, normalize to UTC, and form the half-open interval
  `[updated_from, updated_before)`;
- no offset, page number, or total-count contract;
- records without a usable `updated_at` remain visible in a deterministic
  legacy tail ordered by `id`, without inference or backfill;
- producer and current frontend consumers move atomically to the page envelope.

## Authority and dependencies

- `AGENTS.md`, `docs/NIUVA_MASTER_SPEC.md`, and the canonical registers.
- `docs/decisions/architecture/ADR-005-backend-remediation-runtime-policy.md`,
  with the owner clarification above explicitly authorizing this bounded
  expansion beyond public Catalog.
- `docs/implementation/production-readiness/phases/PHASE-03A-http-command-contract-plan.md`.
- Feature 8.1 API envelope/OpenAPI contract from PR #109.

PR #106 and PR #109 are merged. Feature 8.2 has been reconciled and locally
revalidated against their resulting `main`; exact-head review and mandatory CI
remain required before merge.

## In scope

- One reusable B2B cursor/date/filter contract and page response model.
- Stable service queries and `limit + 1` continuation behavior for the five
  named list families.
- Exact filter/cursor mismatch, invalid cursor, invalid limit, naive datetime,
  inverted range, duplicate/tie, page-boundary, and legacy-tail tests.
- Current frontend consumers for the five page envelopes, including an
  explicit next-page action where the list surface supports continuation.
- OpenAPI assertions and consolidated readiness tracker/evidence updates.

## Explicit exclusions

- Public Catalog behavior, Notification, Inventory, CMS, Portfolio, Retail,
  Customer Order, Contacts, Users, or any other Admin list.
- New roles, permission changes, business status semantics, or Organization
  Portal behavior.
- Total counts, offset pagination, full-text search, arbitrary filters, or
  client-selected sort fields.
- Schema/index changes, migration files, database apply/backfill, query-plan or
  load/capacity claims, and any production/shared-data operation.
- Provider, payment, storage, deployment, production-readiness, or go-live.

## Expected changed areas

- `backend/b2b_pagination.py`
- `backend/b2b_routes.py`
- `backend/b2b_service.py`
- bounded backend route/service tests
- current B2B list consumers and focused frontend tests
- this task card, history evidence, and consolidated tracker rows

## Acceptance criteria

- Every page returns at most the requested bounded limit and never duplicates
  or skips records across equal-timestamp page boundaries.
- Reusing a cursor with changed filters fails safely and reveals no query or
  internal database detail.
- Dates without a timezone and inverted ranges fail with the shared `422`
  envelope.
- Current consumers render `items`, preserve visible error/empty states, and
  append only the requested next page.
- Authorization and customer/internal data projections remain unchanged.
- Existing mutation, transaction, and replay semantics remain unchanged.
- No index or data mutation is performed or implied.

## Minimum verification

- Focused cursor domain, B2B route/service, OpenAPI, and frontend consumer
  tests.
- Existing B2B Inquiry/Quote/Project/Work Order and API-contract regression.
- Full hermetic backend and frontend suites, frontend build, compile, critical
  lint, changed-file formatting, and `git diff --check` when available.

## Stop and handoff conditions

Stop rather than infer behavior if the task requires expanding route families,
adding an index/migration, hiding legacy records, changing a business filter,
or introducing a second response shape for compatibility.

Handoff must record the implementation SHA, exact changed paths, verification
results and limitations, tracker overlap with PR #101, stacked PR order, and
remaining review/CI/merge/revalidation gates.
