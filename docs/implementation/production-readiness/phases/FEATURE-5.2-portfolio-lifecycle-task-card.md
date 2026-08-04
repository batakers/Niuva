# Feature 5.2 — Portfolio Lifecycle Task Card

Status: **bounded source complete — PR #101 merged as `aff3d11`; operational gates remain separate**

Branch: `fix/backend-portfolio-lifecycle`

Pull request: `#101`

Baseline: `a2b7be0d445cf3a338d91cf74841e3bf8be11a91`
(`origin/main`, fetched 1 August 2026)

## Objective

Revalidate and harden the existing Portfolio lifecycle so revisions,
publication snapshots, reorder, rollback, and the existing Project promotion
boundary remain permission-aware, conflict-safe, and historically preserved.

## In scope

- Preserve immutable Portfolio revisions and publication snapshots.
- Make rollback append a new working revision and retain its source reference.
- Keep reorder atomic and reflect public order without rewriting historical
  publication snapshots.
- Keep Project-to-Portfolio promotion customer-safe and idempotent under
  concurrent requests.
- Enforce the existing content and Project read permissions at the backend
  boundary and retain frontend permission parity where an existing control is
  affected.
- Add focused service, route/permission, transaction, and frontend contract
  coverage for verified gaps.
- Reconcile production-readiness evidence without claiming production status.

## Explicit exclusions

- A new Project-to-Portfolio frontend consumer, customer/organization portal,
  customer Portfolio management, or resolution of the broader DR-010 portal
  scope.
- New public fields, content direction, pricing, payment, Finance, provider,
  storage, or upload policy.
- Historical migration/backfill or mutation of shared, staging, or production
  data.
- Deployment, production-readiness, release, or go-live.

## Authority and dependencies

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md`
- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
- current Portfolio source, schema manifest, consumers, and tests

The user explicitly selected the existing Project promotion capability for this
bounded backend task on 1 August 2026. DR-010 remains open for any new consumer
or organization/customer-facing scope.

## Expected files

- `backend/portfolio_domain.py`
- `backend/portfolio_service.py`
- `backend/portfolio_routes.py`
- `backend/tests/test_portfolio_lifecycle.py`
- focused real transaction coverage where required
- existing frontend permission map/contract only if needed for parity
- production-readiness tracker/history files
- this task card

## Acceptance criteria

- Published content is served only from an immutable publication snapshot tied
  to a revision owned by the same Portfolio aggregate.
- Rollback checks the expected aggregate version, appends a new revision with
  the exact rollback source, and never deletes or overwrites an old revision or
  publication.
- Reorder requires the complete ID/version set, is all-or-nothing, and creates
  replacement publication snapshots rather than editing historical snapshots.
- Project promotion requires Portfolio authoring plus Project read authority,
  carries only the approved safe prefill fields, and concurrent replay returns
  the single existing Portfolio aggregate.
- Transaction-required mutations fail closed with `503
  transaction_unavailable` when the guard is unavailable.
- Focused and proportional regression checks pass, or limitations are recorded
  precisely.

## Delivery authorization

The 1 August request authorized bounded source and documentation implementation
on this branch. On 2 August 2026, the Project Owner separately authorized
commit, push, and pull-request creation. The source candidate was committed as
`1dd4086`, pushed, and opened as PR #101. Merge, migration, deployment,
production-readiness, and go-live remain unauthorized.

## Verification evidence

- Focused Portfolio lifecycle and identity/permission integration:
  `32 passed`.
- Real local replica-set Portfolio transaction integration on `rs0` port
  `27019`: `2 passed`, covering concurrent Project promotion and opposing
  concurrent reorder commands.
- Full backend regression: `674 passed, 15 skipped, 14 subtests passed`.
- Full frontend regression: `36` suites and `239` tests passed.
- Critical backend lint (`E9,F63,F7,F82`), compile, and `git diff --check`:
  passed.

The replica-set result is disposable local evidence. It is not migration,
shared-environment, deployment, production-readiness, release, or go-live
evidence. Independent-review evidence is not recorded in this packet; the
merged PR does not establish independent review or production readiness.
