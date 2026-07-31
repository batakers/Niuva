# Backend Quote Lifecycle — 31 July 2026

Branch: `fix/backend-quote-lifecycle`

Baseline: `735674b72c10a4da52d1539cd1d16c924e15662b`

Delivery state: bounded source candidate rebased onto the current `main` after
Feature 5.1 merged; implementation commit `571cdb9`; PR #100 is open for
independent review.

## Implemented

- Revalidated the internal Quote lifecycle, immutable revisions, exact sent and
  accepted version references, evidence-bearing acceptance, permissions, and
  append-only history.
- Added a canonical SHA-256 command fingerprint to Quote transition, revision,
  and acceptance events. Exact operation replay remains idempotent; reuse with
  different command type, expected version, reason, actor, transition target,
  revision content, or acceptance evidence returns
  `409 operation_id_conflict`.
- Declared the shared HTTP error envelope on Admin Quote list/detail/transition,
  revision, and acceptance routes. Revision creation documents the required
  transaction-unavailable `503` boundary.
- Added service and HTTP coverage for exact replay, conflicting reuse,
  permissions, and OpenAPI error contracts.

## Intentionally unchanged

- Quote-to-Project conversion and Project/Work Order lifecycles.
- Customer Organization Portal, customer Quote projection routes, and customer
  self-acceptance; DR-010 remains open.
- Historical data, migration, provider, deployment, production-readiness, and
  go-live behavior.
- Frontend source; the existing permission-aware Admin Quote workbench remained
  compatible with the backend contract.

## Verification

- Focused backend: `66 passed, 1 skipped`.
- Full backend: `667 passed, 14 skipped, 14 subtests passed`.
- Real local replica-set B2B transaction integration: `5 passed`.
- Adjacent frontend: `2` suites and `29` tests passed from the
  dependency-installed main checkout; no frontend source changed.
- Critical backend lint (`E9,F63,F7,F82`) and `git diff --check`: passed.
- Local Gitleaks was unavailable; secret-scan CI remains required before merge.

The local replica set is disposable development evidence, not shared or
production topology evidence.
