# Frontend Design-System Foundation Task Card

Status: **Foundation implementation evidence integrated through PR #137;
original slice branch was not separately published**

## Identity and baseline

- **Requester / Technical Owner:** Faiz
- **Driver:** Codex, operating in the isolated task worktree
- **Reviewer / verifier:** Faiz with automated repository checks; this is not an
  independent design or accessibility review
- **Branch:** `frontend/design-system-foundation`
- **Selected baseline:** `origin/main` at
  `5dd611297f8db5db03872d10b605536e2da462cf`
- **Date:** 5 August 2026, Asia/Jakarta
- **Commit/push/PR permitted?:** No. Local files and verification evidence only.

## Objective

Freeze one canonical frontend component architecture and a truthful component
register before page-by-page convergence begins. Preserve the current library
stack while preventing new local palettes, duplicate primitives, generic card
grids, unscoped lifecycle badges, and accidental adoption of incomplete
components.

The wider goal covers Public, Auth, Retail, Customer Portal, and Admin Studio in
separate implementation slices. This task card authorizes only the shared
foundation listed below.

## Authority

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- `DESIGN.md`
- `docs/context/AI_AGENT_TEAM_WORKFLOW.md`
- Current frontend source and tests at the selected baseline
- Faiz's explicit 5 August 2026 instruction to retain the current libraries,
  converge the full frontend design system, and execute it as a staged goal

This task applies the existing product and experience decisions. It does not
invent new product behavior, visual identity, roles, policies, providers, or
lifecycles.

## In scope

- Clarify the canonical token-to-page dependency direction in `DESIGN.md`.
- Record active, provisional, restricted, and quarantined frontend components.
- Define composition rules for panels, radius, elevation, color, typography,
  responsive behavior, and lifecycle-scoped statuses.
- Add foundation contract tests for the retained shadcn-style configuration,
  semantic shared primitives, raw-color guardrails, and the undeclared Drawer
  dependency boundary.
- Record this task and component register in the Document Register.

## Affected files

- `DESIGN.md`
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/implementation/plans/pending-reconciliation/2026-08-05-frontend-design-system-foundation-task-card.md`
- `docs/implementation/plans/pending-reconciliation/2026-08-05-frontend-component-register.md`
- `frontend/src/components/ui/design-system-foundation.contract.test.js`

## Explicit exclusions

- No route-page or runtime component presentation change in this foundation
  slice.
- No token-value, Tailwind mapping, asset, content, route, API, data-testid,
  backend, schema, permission, or business-lifecycle change.
- No dependency addition or removal. `drawer.jsx` remains unused and
  quarantined because `vaul` is not declared.
- No database operation, migration, provider activation, credentials,
  deployment, production-readiness claim, or go-live.
- No commit, push, PR, merge, branch deletion, or modification of another
  contributor's worktree.

## Acceptance criteria

1. `DESIGN.md` defines one dependency direction from semantic tokens through
   primitives and surface compositions to pages.
2. The component register distinguishes currently adopted contracts from
   provisional or unsafe files and records the known cross-surface debt.
3. The foundation tests prove the retained shadcn-style/Radix configuration and
   semantic class contracts without snapshotting fragile formatting.
4. Active JavaScript and JSX implementation files contain no hard-coded hex
   colors or scaled Tailwind palette utilities where semantic roles are
   required.
5. No source outside `drawer.jsx` imports the undeclared `vaul`-based Drawer.
6. Focused tests, the existing UI component tests, documentation review, and
   `git diff --check` pass. Any pre-existing suite failure remains reported as a
   limitation rather than silently reclassified.

## Verification plan

- Run the new foundation contract test directly.
- Run all tests under `frontend/src/components/ui/`.
- Run the frontend suite serially to distinguish foundation regressions from
  the known pre-existing contract-test failure.
- Run `git diff --check` and inspect exact changed paths.
- Review the component register against current imports and `package.json`.

## Verification evidence — 5 August 2026

- New foundation contract: **5/5 passed**.
- All shared UI component tests: **3/3 suites, 20/20 tests passed**.
- Full frontend suite: **44/45 suites, 278/279 tests passed**. The only failure
  is the pre-existing indentation-sensitive assertion in
  `src/pages/admin/cms-lifecycle.contract.test.js:83`; current source still
  passes `versionId`, `reason.trim()`, and `block.version` to the rollback API.
- `markdownlint-cli2@0.23.2` on the two new task/register documents: **0
  issues**. Existing MD013/MD060 debt in `DESIGN.md` and
  `docs/context/DOCUMENT_REGISTER.md` was intentionally not reformatted.
- `git diff --check`: **passed**.
- Test execution reused the repository's identical existing dependency
  installation through a temporary junction. The junction was removed after
  the run; no dependency or manifest changed.

## Risks and open decisions

- The evidence above belongs to the original foundation worktree at
  `5dd611297f8db5db03872d10b605536e2da462cf`; it is retained as provenance and
  is not current integration proof.
- In the later integration worktree at selected baseline
  `e2a79690a09a1002f8d0b98ab5ee608e99691735`, `AuthShell` has explicit
  customer/staff/recovery audiences and the former global `StatusBadge` map has
  been decomposed into lifecycle-owned components. Current verification is
  recorded in the integration and audit-correction task cards.
- Documentation and static contracts alone do not prove visual convergence.
  Fresh responsive, keyboard/accessibility, build, and browser evidence remains
  attached only to the worktree and SHA where it was executed.
- Several UI files are unused. Dependency removal or deletion remains a
  separate explicit gate after all migration slices prove they are unnecessary.
- Commit, push, PR, merge, deployment, and go-live remain separate gates.

## Rollback

Before Git publication, rollback is deletion/reversion of only the five paths
listed above in this isolated worktree. No runtime source, data, dependency, or
environment state is changed by this foundation slice.

## Post-merge reconciliation — 5 August 2026

This task card predates Git publication. Its task-card record and integrated
foundation scope were included in PR #137, now merged into `origin/main` at
`18f51dee8a8ddf83e438de2f2f0e3acccbc5b8c1`. The original slice branch was not
published as a separate PR; the current publication and verification record is
the [integration task card](2026-08-05-frontend-design-system-integration-task-card.md).

The original local handover statements above remain historical evidence for the
pre-merge worktree. They do not describe the current merged-source state.
