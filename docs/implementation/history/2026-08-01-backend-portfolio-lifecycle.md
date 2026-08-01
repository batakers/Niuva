# Backend Portfolio Lifecycle — 1 August 2026

Branch: `fix/backend-portfolio-lifecycle`

Baseline: `a2b7be0d445cf3a338d91cf74841e3bf8be11a91`

Delivery state: bounded source candidate; commit, push, and pull-request
creation were authorized on 2 August 2026. Independent review remains pending.

## Implemented

- A published Portfolio can open a new draft revision while its immutable
  public snapshot remains live; republishing retires the prior snapshot rather
  than rewriting it.
- Publication fails closed when the aggregate's current revision ID, revision
  number, and Portfolio ownership do not resolve to one exact revision.
- Rollback appends a new draft revision with exact rollback-source metadata,
  preserves all prior revisions/publications, and cancels a future scheduled
  publication when applicable.
- Reorder locks aggregates in stable ID order, updates all aggregate versions
  atomically, and creates replacement publication snapshots while retiring and
  preserving the old snapshots.
- Concurrent promotion of one completed Project returns one customer-safe
  Portfolio draft through the unique `source_project_id` boundary.
- Project promotion requires both `content.write` and `projects.read`;
  rollback requires `content.publish`. The existing Admin consumer now mirrors
  rollback and published-revision permissions.
- The mandatory transaction CI matrix includes the Portfolio replica-set
  integration suite.

## Verification

- Focused backend: `32 passed`.
- Real local replica set: `2 passed`.
- Full backend: `674 passed, 15 skipped, 14 subtests passed`.
- Full frontend: `36` suites, `239` tests passed.
- Critical backend lint, compile, and diff check passed.

## Intentionally unchanged

- No new Project promotion UI or customer/organization Portfolio consumer was
  added; broader DR-010 consumer governance remains open.
- No role received a new permission. Promotion is available only to an account
  whose existing combined roles grant both required permissions, or to
  `super_admin`.
- No historical data, migration, provider, deployment, production-readiness,
  release, or go-live action was performed.
