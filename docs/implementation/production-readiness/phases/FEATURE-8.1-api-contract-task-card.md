# Task Card — Feature 8.1 API Contract and OpenAPI

Status: **bounded source and local verification complete — PR pending**

## Identity and baseline

**Title:** consistent backend error envelope and route OpenAPI contract

**Project Owner / API Owner / Driver:** Faiz

**Branch / worktree:** `fix/backend-api-contract` /
`/Users/macintoshhd/NIUVA/Niuva-worktrees/backend-api-contract`

**Stacked baseline:** `7471f9f21fe8c019ce9bdc5b25ee50e1ca81895a`
(`fix/backend-readiness-health`, PR #106), itself based on `origin/main`
`a2b7be0d445cf3a338d91cf74841e3bf8be11a91`.

**Authorization:** On 2 August 2026 the Project Owner explicitly authorized
continuing Feature 8.1 through implementation, commit, push, and pull request.
PR merge, deployment, migration, production-readiness, and go-live are not
authorized.

## Objective

Provide one reusable JSON error schema and make representative Auth, Customer
Order, Admin B2B command, and public Catalog routes describe and verify the
same failure contract in runtime responses and generated OpenAPI.

The compatible JSON shape remains:

```json
{
  "detail": "legacy-compatible value",
  "error": {
    "code": "stable_machine_code",
    "message": "safe user-facing message",
    "details": {}
  },
  "request_id": "request-correlation-id"
}
```

`detail` is retained for existing consumers. New contract assertions use
`error` and `request_id` as the canonical fields.

## Authority and dependencies

- `AGENTS.md` and `docs/NIUVA_MASTER_SPEC.md`.
- `docs/context/DOCUMENT_REGISTER.md` and
  `docs/decisions/DECISION_REGISTER.md`.
- `docs/decisions/architecture/ADR-005-backend-remediation-runtime-policy.md`.
- `docs/decisions/access/DEC-AUTH-005-admin-session-transport-and-remember-me.md`.
- `docs/decisions/access/DEC-ACCESS-003-legacy-order-compatibility-and-customer-projection.md`.
- `docs/implementation/production-readiness/phases/PHASE-03A-http-command-contract-plan.md`.

Feature 8.1 is stacked on PR #106 because both tasks touch the shared request
middleware in `backend/server.py`. PR #106 must merge first. The branch must be
revalidated against the resulting `main` before Feature 8.1 merges.

## In scope

- Reusable Pydantic response models for the compatibility error envelope.
- Shared OpenAPI response declarations for the bounded status vocabulary.
- Consistent envelopes for HTTP, request validation, unexpected, password
  policy, and Admin-session/security failures.
- Request ID correlation in both the JSON response and `X-Request-ID` header.
- Representative response models and route-specific HTTP/OpenAPI tests for:
  Auth, Customer historical Order reads, Admin B2B commands, and public Catalog
  pagination.
- Documentation and evidence needed to review this bounded Delivery.

## Explicit exclusions

- Notification schema/feed/worker/retention routes and their active PRs
  #103–#105.
- Readiness semantics beyond the unchanged contract from stacked PR #106.
- Portfolio/CMS route changes while their feature PRs remain open.
- Cursor pagination beyond the existing public Catalog contract.
- Frontend runtime parsing, timeout/retry implementation, a generic
  idempotency mechanism, or removal of `detail`.
- Business-policy, permission, session-lifecycle, provider, payment, storage,
  migration, shared-data, deployment, production, and go-live changes.

## Expected changed areas

- `backend/api_contract.py`
- `backend/server.py`
- bounded representative route declarations where required
- `backend/tests/test_api_contract.py`
- this task card and bounded handoff evidence

## Acceptance criteria

- All handled JSON errors in the bounded runtime seam contain `detail`,
  `error.code`, `error.message`, and `request_id`.
- Validation failures expose safe structured issues without request values or
  internal exception data.
- Response `X-Request-ID` equals the body `request_id`; invalid caller-supplied
  IDs are replaced, while valid IDs are bounded and echoed.
- Representative OpenAPI operations declare the shared error schema and their
  route-specific status outcomes.
- Auth responses remain `Cache-Control: no-store`; authorization failures do
  not leak internal role or permission details.
- Existing status codes, business error codes, compatibility `detail` values,
  transaction fail-closed behavior, and catalog pagination shape do not change.

## Minimum verification

- Focused Feature 8.1 API contract and representative route tests.
- Existing Auth/security, B2B route, Catalog route, storage/request-ID, and
  readiness tests affected by the shared handler seam.
- Full hermetic backend regression if the environment permits it.
- OpenAPI schema assertions, compile check, `git diff --check`, and secret-safe
  changed-path review.

## Stop conditions and handoff

Stop rather than infer behavior if implementation requires changing session
policy, compatibility retirement, non-Catalog pagination, notification or
Portfolio contracts, a business status code, or transaction retry semantics.

Handoff must record the implementation SHA, changed and intentionally
unchanged paths, verification results and limitations, PR base/order, and
remaining review/CI/merge requirements.

## Local verification result — 2 August 2026

- Focused API contract, Catalog compatibility, B2B route, and transaction
  envelope checks: passed.
- Full hermetic backend suite: `693 passed, 14 skipped, 14 subtests passed`.
- Critical Flake8 selection, compileall, Black check on the shared handler and
  new contract/test seam, and `git diff --check`: passed.
- Focused MyPy check for the new shared contract and transaction HTTP adapter:
  passed with no issues.
- No migration, database write, provider operation, deployment, frontend
  change, or production verification was performed.

PR CI and review remain separate gates. The transaction-test workflow will run
against its isolated replica set after the branch is pushed. This stacked
branch must not merge before PR #106.
