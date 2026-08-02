# Backend Compatibility Endpoint Governance — 2 August 2026

Status: **planning complete on source baseline; local verification passed;
review, CI, and merge pending**

## Delivery identity

- Feature: 8.3 Compatibility Endpoint Governance
- Branch: `plan/backend-compatibility-endpoints`
- Worktree:
  `/Users/macintoshhd/NIUVA/Niuva-worktrees/backend-compatibility-endpoints`
- Baseline: `a2b7be0d445cf3a338d91cf74841e3bf8be11a91`
- Documentation commit: `6bc9d89`
- Pull request: #111
- Task card:
  `docs/implementation/production-readiness/phases/FEATURE-8.3-compatibility-endpoints-task-card.md`
- Register:
  `docs/implementation/production-readiness/phases/FEATURE-8.3-compatibility-endpoint-register.md`

## Planning result

- Reconciled 151 generated OpenAPI operations on the exact baseline.
- Identified 21 backend compatibility endpoint candidates: 13 retained, five
  retired tombstones, one deprecated alias, and two `needs_clarification`.
- Recorded exact source behavior, approved disposition, successor boundary,
  repository consumers, and external-consumer uncertainty.
- Kept three approved frontend Auth compatibility routes outside the backend
  endpoint count.
- Separated non-route data/hash/role/migration compatibility from endpoint
  governance.
- Defined endpoint-specific sunset prerequisites, rollback evidence, and
  fail-closed stop conditions without inventing dates or owners.

## Material findings

- Legacy Order history remains retained and read-only with no automatic sunset;
  five old mutation routes remain explicit `410` tombstones.
- The Admin Orders frontend still calls two `410` mutation tombstones.
- Legacy Contact write/read routes need an owner disposition; the canonical
  Contact page already writes structured Inquiry data, but external consumers
  of the old write route remain unverified.
- The logical-path file compatibility route still has a repository consumer.
- The deprecated Material DELETE alias emits a `Sunset` date that expired
  before this baseline without recorded retirement evidence.
- The legacy health summary still appears in an operational runbook.

## Safety and exclusions

No backend/frontend runtime file, route, response, OpenAPI operation,
permission, schema, migration, index, data, dependency, environment, provider,
or deployment state was changed. No compatibility endpoint was removed,
redirected, re-enabled, or assigned a new sunset date.

PR #106, PR #109, and PR #110 are pending overlays and are not represented as
current-main behavior. PR #101 overlaps consolidated tracker documentation and
must be reconciled if either branch merges first.

## Verification

- Generated OpenAPI reconciliation: passed with 151 operations, 21 registered
  candidates, 21 unique IDs, and 21 unique method/path pairs; every candidate
  exists in the baseline schema.
- Register source-path, disposition-count, consumer-reference, and tracker-count
  reconciliation: passed.
- Focused backend Auth/Order/File/Material/Health/Contact compatibility matrix:
  `70 passed`.
- Full backend: `667 passed, 14 skipped, 14 subtests passed`.
- Focused frontend consumer matrix: `9/9` suites and `70/70` tests passed.
- Full frontend: `36/36` suites and `239/239` tests passed.
- Frontend production build: passed; sitemap generation remained skipped
  because `REACT_APP_PUBLIC_SITE_URL` is not configured.
- Backend compile and `git diff --check`: passed.

`npm ci` completed without changing the lockfile, while reporting the existing
peer/deprecation warnings and an audit summary of 36 dependency findings. No
dependency disposition or manifest change is authorized by this documentation
task. The skipped backend tests retain their existing environment gates.

## Next gate

Independent review may assess the inventory and classification. Any runtime
deprecation, header correction, consumer migration, tombstone, or route removal
requires its own approved task card and branch after the named decisions and
rollback evidence are complete.
