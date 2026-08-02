# Backend API Contract Delivery — 2 August 2026

Status: **original delivery evidence retained; reconciled review complete on
3 August 2026; exact-head CI and merge pending**

## Delivery identity

- Feature: 8.1 API Contract and OpenAPI
- Branch: `fix/backend-api-contract`
- Worktree: `/Users/macintoshhd/NIUVA/Niuva-worktrees/backend-api-contract`
- Base: stacked on `fix/backend-readiness-health` at `7471f9f` (PR #106)
- Main ancestor: `a2b7be0`
- Task card:
  `docs/implementation/production-readiness/phases/FEATURE-8.1-api-contract-task-card.md`

## Implemented source boundary

- Added one reusable error envelope, request-ID validation, JSON error response
  builder, and OpenAPI error-response vocabulary in `backend/api_contract.py`.
- Routed HTTP, validation, unexpected, password-policy, Admin-session, CSRF,
  and transaction-unavailable errors through the shared compatible envelope.
- Kept legacy `detail` while exposing stable `error` and `request_id` fields.
- Added explicit response models and OpenAPI errors for representative Auth,
  Customer historical Order, Admin B2B, and public Catalog operations.
- Added route-level HTTP, request-ID, privacy, compatibility, and generated
  OpenAPI assertions.

## Compatibility and safety results

- Existing HTTP status codes and business error codes remain unchanged.
- Customer Order responses remain allowlisted and omit absent optional fields,
  preserving their legacy serialized shape.
- Public Catalog pagination still returns `next_cursor: null` when no
  continuation exists; cursor scope was not extended.
- Transaction-required mutations still fail closed with `503
  transaction_unavailable`; only their response envelope gained the common
  canonical fields.
- Auth responses retain `Cache-Control: no-store`, and validation issues do not
  echo submitted request values.

## Verification

Commands used the canonical backend virtual environment at
`/Users/macintoshhd/NIUVA/Niuva/backend/.venv/bin/python`.

- Focused contract and compatibility tests: passed.
- Full backend: `693 passed, 14 skipped, 14 subtests passed`.
- `python -m compileall -q backend`: passed.
- Critical Flake8 `E9,F63,F7,F82`: passed.
- Black check for the changed shared handler/contract/test seam: passed.
- Focused MyPy check for `api_contract.py` and `transaction_api.py`: passed
  with no issues.
- `git diff --check`: passed.

The skipped tests retain their existing environment gates. Real-replica CI,
frontend CI, secret scan, PR review, merge, deployment, production-readiness,
and go-live remain unproven or unauthorized.

## Intentionally unchanged

- Notification schema, feed, worker, and retention modules from PRs #103–#105.
- Readiness semantics delivered by the stacked PR #106.
- Portfolio and CMS source/consumer contracts.
- Frontend transport/runtime parsing and retry behavior.
- Non-Catalog pagination, session policy, permissions, migrations, providers,
  payments, storage, shared data, and environment configuration.

## Integration order

PR #106 is the producer/base and must merge before Feature 8.1. After #106
merges, refresh the Feature 8.1 base from current `main`, reconcile any
`backend/server.py` changes introduced by the notification PR stack, rerun the
full backend suite, and require fresh PR CI before merge.

## Reconciliation addendum — 3 August 2026

- PR #106 merged to `main` at `5eaf14c`; PR #109 was retargeted to `main` and
  reconciled in `C:\tmp\niuva-pr109-review` without modifying the older local
  `main` worktree.
- The review fixed request-ID correlation for early CSRF rejection and removed
  internal permission names from generic 403 response detail without changing
  authorization policy or status codes.
- CI coverage now includes the changed contract, route, adapter, and test files
  in the applicable MyPy, Black, and isort scopes.
- Focused API/Catalog/B2B/transaction checks passed `41` tests. The complete
  backend suite passed `878`, with `15 skipped` and `14 subtests passed`.
- Critical Flake8, expanded focused MyPy, Black/isort, compileall/py_compile,
  `pip check`, Markdown, and diff checks passed. Local `pip-audit` was
  unavailable and remains an exact-head CI gate.
- Deployment, migration, shared-environment validation, provider activation,
  production-readiness, and go-live remain outside this delivery.
