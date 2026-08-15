# Feature 3.4A — Retail Order Contract Hardening

Status: **bounded source complete; PR #226 merged as `72018ce`**

Branch: `feat/backend-retail-order-contract-hardening`

Baseline: `954837c9dd4fcaeb9438c16fb6934210e082a364`

Task card:
[FEATURE-3.4A-retail-order-contract-hardening-task-card.md](FEATURE-3.4A-retail-order-contract-hardening-task-card.md)

## Implemented contract

- Authenticated cart intent accepts only customer, operation, variant,
  quantity, and provider-neutral fulfilment fields.
- Cart lines are unique, bounded, and canonically ordered before hashing.
- Request fingerprints exclude the operation ID and classify only exact
  semantic retries as idempotent replays; changed reuse is a named conflict.
- Authoritative catalog input must be published, active, fixed-price,
  ready-stock, and eligible for the selected pickup/delivery method.
- Currency uses a strict uppercase three-letter format and cannot be mixed
  within one checkout snapshot.
- Product, variant, publication, price, tax-policy, and fulfilment-policy facts
  are detached into a customer-safe historical snapshot; internal catalog
  fields are not copied.
- A pure Retail Order aggregate contract starts at `created`, follows only the
  approved next state, binds transitions to exact command fingerprints, and
  records contiguous append-only audit history.
- Every persistence adapter receives an exact `id + version + status`
  compare-and-swap precondition so concurrent stale commands cannot both be
  accepted.

## Capability boundary

No route or runtime capability was activated. Retail create and transition
routes still return `503 retail_transaction_inactive`; public checkout and
payment capabilities remain `inactive`. The contract has no database,
inventory, reservation, payment, provider, credential, migration, or
environment integration.

## Verification

Executed from the isolated feature worktree:

- Focused checkout, lifecycle, aggregate, and route-lockdown matrix:
  `68 passed`.
- Full hermetic backend regression:
  `1031 passed, 15 skipped, 14 subtests passed`; expected-skip enforcement
  reported zero unexpected skips.
- Focused MyPy for both contract modules: passed with no issues.
- Repository critical Flake8 policy (`E9,F63,F7,F82`): passed.
- Black and isort checks for changed Python files: passed.
- `git diff --check`: passed.

The 15 full-suite skips remain the repository's explicit environment-gated
tests. This task did not run a live replica set because it adds only pure
contracts and retains inactive persistence/runtime boundaries.

## Remaining gates

- Pull-request CI and review passed before PR #226 was merged.
- Atomic operation-key persistence, active order creation, reservation,
  payment attempt, webhook, refund, reconciliation, provider integration,
  migrations, deployment, readiness, and go-live remain separately gated.
- This bounded result completes only 3.4A contract hardening; it does not mark
  the full 3.4 Retail Order lifecycle complete or active.
