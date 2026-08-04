# Feature 4.2 — B2B Quote Lifecycle Task Card

Status: **bounded source complete — PR #100 merged as `a2b7be0`; operational gates remain separate**

Branch: `fix/backend-quote-lifecycle`

Pull request: `#100`

Baseline: `735674b72c10a4da52d1539cd1d16c924e15662b`
(`origin/main`, fetched 31 July 2026)

## Objective

Revalidate and harden the existing internal Admin Quote lifecycle without
expanding the B2B customer journey or the separate Quote-to-Project boundary.

## In scope

- Preserve the approved Quote transition graph and immutable version snapshots.
- Preserve exact sent and accepted version references.
- Require evidence-bearing acceptance with timezone-aware time.
- Enforce expected-version concurrency and exact `operation_id` replay.
- Reject reuse of an `operation_id` for a materially different command.
- Preserve append-only lifecycle history and exact Quote-line identity.
- Revalidate `quotes.read` and `quotes.write` backend/UI permission parity.
- Add focused domain/service, route, transaction, permission, and frontend
  contract coverage for verified gaps.
- Reconcile bounded production-readiness trackers with current-source evidence.

## Explicit exclusions

- Quote-to-Project conversion implementation, Project lifecycle, Work Orders,
  production, fulfilment, payment, Finance, reconciliation, or providers.
- B2B Organization Portal, customer Quote routes, customer self-acceptance, or
  organization ownership and assignment policy.
- Historical inference/backfill, migration execution, deployment,
  production-readiness, or go-live.

## Authority and dependency boundary

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md`
- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
- `docs/decisions/architecture/ADR-005-backend-remediation-runtime-policy.md`
- `docs/decisions/product/DEC-DATA-002-quote-line-identity-and-ambiguous-history.md`
- current source and tests

DR-010 remains open for customer Organization Portal scope. This task may
revalidate the existing internal Admin consumer but does not authorize a
customer-facing Quote consumer.

## Expected files

- `backend/b2b_service.py`
- `backend/b2b_routes.py`
- `backend/tests/test_b2b_quote_lifecycle.py`
- focused B2B route/transaction tests where required
- `frontend/src/pages/admin/b2b-workbench.contract.test.js`
- production-readiness tracker/history files
- this task card

## Acceptance criteria

- The allowed lifecycle graph remains fail-closed and every command requires a
  reason, expected version, operation ID, and backend write permission.
- Generic transition cannot accept a Quote; acceptance records approver,
  identity, timezone-aware accepted time, channel, evidence reference, actor,
  reason, and exact accepted version.
- An exact command replay returns the current aggregate representation without
  another mutation.
- Reusing an operation ID with different command content, expected version,
  reason, or actor returns `409 operation_id_conflict`.
- Quote revision creation remains atomic and fails closed when transaction
  capability is unavailable.
- Accepted Quote versions and Quote-line identities remain immutable and
  historical records are not rewritten or deleted.
- Focused and proportional regression checks pass, or limitations are recorded
  precisely.

## Delivery authorization

Implementation, verification, commit, push, and pull-request creation were
authorized by the Project Owner on 31 July 2026. Merge, migration, deployment,
production-readiness, and go-live are not authorized by the current request.

## Verification evidence

Executed from the isolated task worktree against the selected branch source:

- Focused Quote lifecycle, route, snapshot, conversion, transaction, and
  permission matrix: `66 passed, 1 skipped`; the skip was the explicit real
  transaction opt-in.
- Full backend regression: `667 passed, 14 skipped, 14 subtests passed`.
- Real local replica-set B2B transaction integration on `rs0` port `27019`:
  `5 passed` without migration execution.
- Adjacent frontend Admin workbench and Quote revision contracts: `2` suites,
  `29` tests passed from the dependency-installed main checkout. No frontend
  source changed in this task. The first worktree attempt could not resolve
  `@testing-library/jest-dom` because dependencies are intentionally not
  installed in worktrees.
- Critical backend lint (`E9,F63,F7,F82`) and `git diff --check`: passed.
- Local Gitleaks was unavailable; the repository secret-scan, backend,
  frontend, and transaction-tests checks passed on merged PR #100.
- CodeRabbit reported a rate limit and did not provide substantive review. A
  separate independent-review record is not attached to this packet; that is a
  residual evidence gap, not an outstanding pre-merge statement.

These are local source and disposable replica-set results. They do not prove a
customer Organization Portal contract, migration, deployment, production
topology, production readiness, or go-live.
