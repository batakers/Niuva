# Feature 4.1 — B2B Inquiry and RFQ Task Card

Status: **bounded source complete — PR #98 merged as `d080480`; operational gates remain separate**

Branch: `audit/backend-b2b-inquiry`

Baseline: `57de1f36e297e250705e8c47df5bef6b8da86fc9`
(`origin/main`, fetched 31 July 2026)

## Objective

Harden the existing public Inquiry intake and internal Inquiry-to-draft-Quote
conversion boundary without expanding the B2B customer journey.

## In scope

- Require the anonymous Inquiry intake limiter at router construction.
- Preserve the existing five-submissions-per-ten-minutes runtime policy as
  current implementation evidence; test `429` and `Retry-After`.
- Preserve public customer-safe acknowledgement and internal Inquiry
  projections.
- Enforce the approved `inquiries.read`, `inquiries.write`, and `quotes.write`
  boundaries, including both write permissions for conversion.
- Preserve the shared JSON HTTP error envelope for malformed, denied, conflict,
  rate-limited, unavailable, and unexpected outcomes.
- Make Inquiry conversion reject conflicting `operation_id` reuse while
  preserving exact replay and fail-closed atomic conversion.
- Add focused route, domain/service, transaction, permission, and contract
  regression coverage.

## Explicit exclusions

- Payment, payment terms, gateway/provider, webhook, proof upload, Finance,
  refund, reconciliation, Retail checkout, fulfillment, or production
  activation.
- B2B Organization Portal, organization ownership/membership, customer Quote
  or Project routes, and historical-data inference or migration.
- Pagination changes, generic idempotency infrastructure, dependencies,
  secrets, deployment, production-readiness, or go-live.

## Authority and dependency boundary

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md`
- `docs/decisions/access/DEC-AUTH-006-abuse-protection-interface-and-deferral.md`
- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
- `docs/decisions/product/DEC-DATA-002-quote-line-identity-and-ambiguous-history.md`
- `docs/implementation/production-readiness/phases/PHASE-03A-http-command-contract-plan.md`
- current source and tests

The shared transaction executor and exact Quote-line identity are present on
the selected baseline. Payment and Organization Portal decisions remain
separate gates.

## Expected files

- `backend/b2b_routes.py`
- `backend/b2b_service.py`
- `backend/tests/test_b2b_inquiry_routes.py`
- `backend/tests/test_b2b_quote_conversion.py`
- `backend/tests/test_stock_movement_contract.py`
- this task card and bounded verification evidence

## Acceptance criteria

- The router refuses to mount public Inquiry intake without a limiter.
- The sixth request in the configured intake window returns `429`, includes
  `Retry-After`, and uses the shared safe error envelope.
- Public submission returns only the customer-safe Inquiry projection.
- Unauthorized internal roles cannot list, transition, or convert Inquiry
  records.
- Conversion requires both Inquiry-write and Quote-write permission.
- Exact replay returns the original conversion result with one Quote and one
  Quote Version.
- Reusing an `operation_id` for a different command, reason, expected version,
  or actor returns `409 operation_id_conflict`.
- Conversion remains atomic and returns the stable `503
  transaction_unavailable` envelope when transaction capability is absent.
- Focused tests, full backend tests, formatting checks, and secret scan pass or
  any environment limitation is recorded precisely.

## Delivery authorization

The Project Owner explicitly authorized implementation through commit, push,
and pull request on 31 July 2026. Merge, migration, deployment, provider
activation, production-readiness, and go-live are not authorized.

## Verification evidence

Executed from the isolated task worktree against the selected branch source:

- Focused Inquiry/RFQ, projection, transaction, and adjacent route matrix:
  `29 passed, 1 skipped`; the skip was the explicit real-transaction opt-in.
- Full backend regression: `660 passed, 13 skipped, 14 subtests passed`.
  All skips were explicit real-transaction or migration opt-ins.
- Real replica-set B2B transaction integration on local `rs0` port `27019`:
  `5 passed`.
- Critical backend lint (`E9,F63,F7,F82`), backend compile, and
  `git diff --check`: passed.
- Local Gitleaks was not available because this machine has neither the
  `gitleaks` binary nor Docker. The repository secret-scan CI gate remains
  required on the pull request.

These are local source and disposable replica-set results. They do not prove a
deployed proxy topology, production limiter policy, provider activation,
production readiness, or go-live.
