# Task Card — Feature 8.3 Compatibility Endpoint Governance

Status: **planning complete — local verification passed; review, CI, and merge
pending**

## Identity and authorization

**Project Owner / API Owner / Driver:** Faiz

**Branch / worktree:** `plan/backend-compatibility-endpoints` /
`/Users/macintoshhd/NIUVA/Niuva-worktrees/backend-compatibility-endpoints`

**Baseline:** `a2b7be0d445cf3a338d91cf74841e3bf8be11a91`
(`origin/main`, refreshed 2 August 2026).

**Authorization:** On 2 August 2026 the Project Owner authorized Feature 8.3
inventory, governance planning, tracker updates, commit, push, and pull request
when verification is safe. Route deletion, runtime behavior changes, migration,
deployment, production operation, merge, and go-live are not authorized.

## Objective

Create one source-backed register for every route currently identifiable as a
legacy or compatibility endpoint, record its in-repository consumers, and
separate observed behavior from approved governance disposition. Define the
evidence and rollback requirements that must precede any later deprecation,
sunset, tombstone, or retirement implementation.

## Authority

- `AGENTS.md` and `docs/NIUVA_MASTER_SPEC.md`.
- `docs/context/DOCUMENT_REGISTER.md` and
  `docs/decisions/DECISION_REGISTER.md`.
- `docs/decisions/access/DEC-ACCESS-003-legacy-order-compatibility-and-customer-projection.md`.
- `docs/decisions/product/DEC-PAY-02-legacy-manual-transfer-read-only.md`.
- `docs/decisions/access/DEC-AUTH-001-login-failure-and-legacy-compatibility.md`.
- `docs/decisions/access/DEC-AUTH-003-account-recovery-contract-and-compatibility.md`.
- `docs/decisions/architecture/ADR-005-backend-remediation-runtime-policy.md`.
- `docs/implementation/production-readiness/REMEDIATION_ROADMAP.md`, where
  PHASE-03C requires an explicit owner decision for retained, read-only, or
  retired scope.

## In scope

- Enumerate compatibility route candidates from current backend registration,
  route decorators, tests, approved decisions, and explicit legacy markers.
- Record method, path, source owner, observed behavior, approved status or
  `needs_clarification`, successor when known, and route-specific evidence.
- Inventory verified frontend/test/script consumers and distinguish them from
  unverified external consumers.
- Define status vocabulary for `retained`, `read_only`, `deprecated`,
  `retired_tombstone`, and `needs_clarification`.
- Define sunset prerequisites without inventing a sunset date.
- Define rollback-compatibility evidence and stop conditions for any future
  source-changing task.
- Record PR #106, PR #109, and PR #110 as pending contract overlays, not
  current-main behavior.
- Update consolidated readiness tracking with the bounded planning result.

## Explicit exclusions

- Removing, renaming, redirecting, or changing any route or response.
- Adding `Deprecation`, `Sunset`, `Link`, warning, or replacement headers.
- Re-enabling disabled legacy Order, upload, checkout, payment, payment-proof,
  fulfilment, refund, or return commands.
- Editing frontend consumers, permissions, authentication, schema, indexes,
  migrations, data, dependencies, environment, providers, or deployment.
- Selecting retention duration, customer communication content, sunset date,
  external-consumer ownership, rollback mechanism, or production window where
  no approved decision exists.
- Treating an unmerged PR as current source or treating repository search as
  proof that no external consumer exists.

## Classification rules

- `retained`: supported compatibility endpoint remains callable under an
  approved decision.
- `read_only`: retained only for bounded historical reads; mutations stay
  inactive.
- `deprecated`: callable alias with an identified supported successor; new
  consumers must not adopt it. A source comment alone is observed evidence,
  not an owner-approved sunset.
- `retired_tombstone`: endpoint remains registered only to fail explicitly,
  normally with `410`; it is not permission to delete the route.
- `needs_clarification`: compatibility purpose or final disposition lacks an
  explicit authoritative decision.

Multiple labels may apply where useful, for example `retained + read_only`.
The register must distinguish `observed_source_state` from
`approved_governance_status`.

## Expected changed areas

- this task card;
- a new compatibility endpoint register under
  `docs/implementation/production-readiness/phases/`;
- a bounded history/evidence record;
- consolidated readiness tracker and finding traceability rows.

No backend or frontend runtime file is owned by this task.

## Acceptance criteria

- Every source-identified compatibility route is listed exactly once or
  explicitly grouped only when method, disposition, consumer, and rollback
  requirements are identical.
- Inventory generation/reconciliation method and baseline SHA are recorded.
- Repository consumers include exact paths; external consumers remain
  `unverified`, never assumed absent.
- Legacy Order classification matches `DEC-ACCESS-003`: retained, read-only,
  ownership/permission scoped, no automatic sunset or deletion.
- Disabled `410` routes are tombstones, not silently labeled deleted.
- Deprecated aliases name a successor when one is evidenced.
- Every sunset candidate has prerequisites, owner decisions, monitoring,
  rollback evidence, and a stop condition; no date is invented.
- Pending PR #106/#109/#110 overlays and tracker overlap with PR #101 are
  recorded.
- `git diff --check`, link/path checks, route-to-register reconciliation, and
  documentation consistency checks pass.

## Stop and handoff conditions

Stop before assigning a final status where authority conflicts or is absent.
Stop before any runtime edit, route removal, migration, historical-data action,
provider choice, rollout, deployment, production-readiness, or go-live claim.

Handoff must record the documentation SHA, changed paths, inventory counts,
verification results, unverified external-consumer boundary, PR state, overlap,
and the exact owner decisions required before any later implementation.
