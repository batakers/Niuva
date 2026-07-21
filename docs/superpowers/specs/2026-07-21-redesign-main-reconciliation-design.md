# Redesign-to-Main Reconciliation and Branch Cleanup Design

**Status:** Approved in conversation on 21 July 2026

## Goal

Reconcile the final approved frontend and backend cleanup from `redesign/brand-alignment` into the latest `main` without merging the divergent rewritten histories directly, then remove only remote branches whose content is proven redundant.

## Non-goals

- Do not merge, rebase, or force-push `redesign/brand-alignment`.
- Do not weaken NIV-001 credential containment or reintroduce old repository history.
- Do not complete or merge the unfinished transaction-capability integration.
- Do not import work from unresolved personal or feature branches merely because they exist.
- Do not delete a source branch until its designated retention gate is satisfied.

## Chosen Approach

Create `reconcile/redesign-to-main` from the latest `origin/main` and port the desired final state semantically. Changes are grouped into reviewable commits instead of importing the divergent branch ancestry. `main` remains authoritative for security containment and governance; `redesign/brand-alignment` is the reference for the approved brand/frontend state and the merged Emergent-removal work.

Direct merge conflict resolution was rejected because the simulated merge has 17 conflicted files spanning security-sensitive backend code, storage, tests, deployment guidance, and frontend routing. Rebasing the redesign branch was rejected because it would rewrite published history and require another force-push.

## Source-of-Truth Rules

- `origin/main` is authoritative for NIV-001 containment, sanitized test credentials, current governance records, and all changes already merged to `main`.
- `origin/redesign/brand-alignment` is authoritative for the approved public brand experience, frontend Emergent removal, backend Emergent-storage removal, and the final content of PRs #7, #13, and #14 where those changes do not weaken `main`.
- `fix/niv-001-contact-regression-gate`, transaction branches, and personal branches are excluded from automatic porting. They remain separate review subjects.
- Conflict resolution is semantic: compare the two trees and intentionally reconstruct the desired result on the reconciliation branch. Do not resolve conflicts by selecting one side wholesale.

## Reconciliation Sequence

1. Revalidate `origin/main` and all candidate remote SHAs immediately before mutation.
2. Create or confirm `reconcile/redesign-to-main` from the exact latest `origin/main` SHA.
3. Port the approved frontend/brand state while preserving `main` security and routing contracts.
4. Port frontend Emergent-removal changes and verify no visual-editor dependency, loader, runtime script, environment flag, or stale test-ID remains.
5. Port backend storage cleanup: provider-neutral disabled/local storage, production-local prohibition, typed API failures, tests, dependency cleanup, and deployment guidance.
6. Review every remaining tree difference. Each retained difference must be intentional and documented; excluded work remains on its source branch.
7. Run the full verification matrix and open a PR from `reconcile/redesign-to-main` to `main`. Never push directly to `main`.

## Branch Cleanup Phase A

After a fresh fetch, capture the exact current tip SHA for every candidate. Delete the following remote branches only if each tip remains unchanged and merging it into current `origin/main` produces the exact `main` tree:

- `backup-main`
- `design/catalog-material-inventory-foundation`
- `dirguy`
- `docs/foundation-spec-alignment`
- `docs/foundation-spec-review-findings`
- `docs/niv-001-history-rewrite-runbook`
- `docs/niv-001-rehearsal-scope-v2`
- `docs/platform-governance-baseline`
- `feat/tx-readiness-guard`
- `feat/tx-test-topology`
- `fix/niv-001-main-containment`
- `plan/foundation-transaction-capability`

The deletion must be one atomic remote operation with an explicit expected-tip lease for every ref. If any branch moved, is protected, is no longer a no-op, or the server rejects one deletion, delete none and stop for review. Record branch names and full tip SHAs before deletion; commit SHAs are not secrets and are required for recovery. Then verify all twelve remote refs are absent and `main` is unchanged. Delete matching local branches only after remote verification and only when they are not checked out.

## Branch Cleanup Phase B

Keep all red/source branches during reconciliation. After the reconciliation PR is merged and a fresh clone verifies the merged `main`, the following source branches may be deleted atomically because their approved work is then contained in `main`:

- `chore/remove-frontend-emergent`
- `fix/niv-001-credential-containment`
- `refactor/remove-backend-emergent`
- `redesign/brand-alignment`

Do not delete `integration/foundation-transaction-capability`, `feat/tx-core`, `fix/niv-001-contact-regression-gate`, `docs/foundation-spec-source-normalization`, `dimsguy`, `fazguy`, or `feature/foundation-identity-rbac-audit` under this design. They require separate completion, supersession, or owner decisions.

## Verification Matrix

Before opening the reconciliation PR:

- `git diff --check` must pass.
- The configured backend pytest suite must pass; environment-driven integration skips are reported separately.
- The frontend test suite and optimized production build must pass.
- Repository credential-hygiene tests must pass.
- A tracked-tree scan must find no active Emergent frontend or backend integration.
- Production storage must remain disabled by default and local storage must remain restricted to development, demo, or test.
- A synthetic merge of the reconciliation branch into the latest `origin/main` must be conflict-free.
- The PR diff must contain only intentionally reconciled changes and this design/implementation evidence.

After the PR merge, verify the remote `main` SHA and perform the same security and test gates in a fresh clone. Then request a fresh explicit user confirmation before Cleanup Phase B.

## Failure and Recovery Rules

- If `origin/main`, `origin/redesign/brand-alignment`, or any deletion candidate moves after validation, stop and recompute the audit.
- If a ported slice fails tests, revert or repair only that slice before continuing; do not mask failures by dropping tests.
- If credential hygiene or Emergent-removal scans fail, the reconciliation PR must not be opened.
- If an atomic deletion fails, do not retry branch-by-branch until the cause is understood.
- Deleted refs are not recreated automatically. Recovery requires an explicitly recorded tip SHA and a separate user-authorized push.
- No operation in this design authorizes force-push, tag deletion, `main` deletion, or direct mutation of `main`.

## Success Criteria

- The reconciliation PR reaches `main` with all verification gates green.
- NIV-001 containment remains intact and no removed integration is reintroduced.
- Phase A removes exactly twelve audited no-op branches and nothing else.
- Phase B occurs only after verified reconciliation and removes exactly the four contained source branches.
- Transaction and unresolved branches remain available for their separate decisions.
