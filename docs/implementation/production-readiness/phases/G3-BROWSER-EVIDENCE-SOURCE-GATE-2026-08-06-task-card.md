# Task Card — G3 Browser Evidence and Frontend Source-Gate Request

<!-- markdownlint-disable MD013 -->

**Status:** Evidence and source-gate input only; no frontend source gate is
granted by this card
**Date:** 2026-08-06 (Asia/Jakarta)
**Observed baseline:** `origin/main` at
`5254641c3049e1063bc283264fb771d270f53eea`
**Active branch:** `codex/g29-g3-browser-source-gate-20260806`
**Active worktree:** `C:\tmp\niuva-g29-g3-browser-source-gate-20260806`
**Driver:** Faiz / delegated Codex implementation

## Objective

Record exact-SHA frontend/Jest/build/browser evidence and isolate the one
remaining hermetic browser failure before G3 implementation. Prepare a precise
source-gate request for the mobile navigation focus race and the independent
Windows production-dependency audit runner failure.

This card does not authorize a runtime change, test-fixture change, dependency
change, CI/configuration change, migration, provider activation, deployment,
production-readiness approval, or go-live.

## Authority and applicable context

Use the repository reading order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. applicable approved decision/ADR;
5. applicable runbook; and
6. current source and tests.

The applicable child contract is
`docs/implementation/production-readiness/phases/G3-FRONTEND-CANDIDATE-ROLE-A11Y-2026-08-06-task-card.md`.
Its frontend path lock requires an explicit source gate before changing
`Navbar.jsx` or its tests. The G0 contract keeps external role, staging,
provider, migration, deployment, and go-live evidence separate.

## Exact path ownership

Only these new documentation paths may change in this slice:

- this task card; and
- `G3-BROWSER-EVIDENCE-SOURCE-GATE-2026-08-06.md`.

No existing tracker, source, test, package manifest, lockfile, workflow,
configuration, or runbook is changed.

## Evidence scope

The packet records the current head `5254641c` and carries verification from
`5d5abcf` only where the exact diff proves PR #170 changed documentation and
did not change source, tests, dependencies, or CI. It records the required
`REACT_APP_BACKEND_URL` test-runner contract instead of treating a missing
environment variable as an application failure.

## Explicit source-gate request

If the Project Owner grants a separate source gate, the bounded candidate
scope is:

- `frontend/src/components/layout/Navbar.jsx` — replace the fixed
  post-click focus timer with a focus operation synchronized to the committed
  `open` state, preserving Escape, focus trap, inert background, and focus
  restoration behavior;
- `frontend/src/components/layout/Navbar.test.jsx` — add or strengthen a
  regression for the delayed/mobile open path; and
- `frontend/e2e/design-system-integration.spec.js` only if the owner assigns a
  test-contract correction, not to weaken the focus assertion.

The separate production-audit runner finding is outside this slice:
`frontend/scripts/audit-production-dependencies.js` uses `spawnSync("npm.cmd",
...)`, which returned `EINVAL` under the observed Node `v24.14.0` Windows
runtime. It requires its own exact-path source gate and regression test.

No proposed fix is applied by this card.

## Acceptance criteria

- Record exact SHA, tree, parent, clean worktree, and manifest hashes.
- Record backend, frontend, build, bundle, dependency-audit, and browser
  commands with passed, failed, and unrun results.
- Distinguish the missing `REACT_APP_BACKEND_URL` setup failure from the
  actual mobile focus failure.
- Preserve Retail transaction-inactive boundaries and role/credential gaps.
- State changed and intentionally unchanged paths, risks, rollback, and
  approvals.
- Pass `git diff --check`, markdownlint, exact-path verification, and staged
  secret scanning before publication.

## Delivery authorization and handover

The user authorizes commit, push, and opening a PR for this documentation
packet. Merge, source implementation, dependency/configuration changes,
provider activation, migration apply/restore, secret rotation, deployment,
production-readiness approval, and go-live remain separately controlled.

<!-- markdownlint-enable MD013 -->
