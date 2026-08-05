# Current-main Provenance Reconciliation — 6 August 2026

**Status:** Context-only evidence packet; not a production-readiness,
deployment, activation, or go-live approval.

**Observed current head:** `origin/main` at
`9f4d3a4ab8e499f95c501b202b18ded6a4187c7c`.

**Worktree:** `C:\tmp\niuva-g7-next-readiness-20260806`.

## Purpose and authority

This packet records the current remote head after PR #149 and corrects two
provenance hazards: the previous current-main packet stopped at `0c9a715`, and
the historical remediation tracker still contains a “next candidate” statement
for FE-004 even though FE-004 entered `main` through PR #140.

The authority order remains:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. the applicable approved decision or ADR;
5. the applicable runbook;
6. current source and tests.

This packet is subordinate context. It does not select a release candidate,
amend a canonical decision, authorize source changes outside an approved
slice, select or activate a provider, authorize migration or deployment, or
promote the repository to production-ready or go-live.

## Current-head and PR lineage

The fresh worktree was created from fetched `origin/main` and matched the
remote at the start of this slice. PR #149 is merged at the observed head:

| Evidence | Result | Limit |
| --- | --- | --- |
| `git fetch origin main` and `git rev-parse origin/main` | Passed; exact SHA `9f4d3a4ab8e499f95c501b202b18ded6a4187c7c` | Remote state is a point-in-time observation |
| PR #149 state | `MERGED`; merge commit `9f4d3a4`; merged `2026-08-05T17:12:56Z` | A merge proves entry into `main`, not production readiness |
| PR #149 changed paths | Two documentation paths only: the prior task card and current-main revalidation packet | No runtime change is inferred from this PR |
| PR #149 CI | `backend`, `frontend`, and `secret-scan` completed successfully; the CodeRabbit status context was `SUCCESS`, but no independent human review is claimed | CI/review context is repository evidence, not staging, browser, real-role, or go-live evidence |
| Fresh worktree state | Clean at task start; `HEAD` equals `origin/main` | Does not prove external environment state |

The diff from the previous packet baseline `0c9a715` to the observed current
head is documentation-only. Therefore the source/test results recorded in the
previous packet remain attributable to the same runtime tree, but they are
carried evidence rather than a new production-like verification run.

## Evidence carried forward with limits

The following bounded evidence is attributable to the observed runtime tree:

| Check | Carried result | Limit |
| --- | --- | --- |
| Backend suite | **961 passed, 15 skipped, 14 subtests passed** in a fresh run at `9f4d3a4` | Local fixtures; skipped environment-dependent paths remain unproven |
| Frontend suite | **62 suites, 373 tests passed**, carried from the prior packet at `0c9a715` | The runtime source is unchanged by PR #149; Jest is not browser, screen-reader, real-role, staging, or cross-browser evidence |
| Frontend build | **Compiled successfully**, carried from the prior packet at `0c9a715` | The runtime source is unchanged by PR #149; sitemap generation was skipped without `REACT_APP_PUBLIC_SITE_URL`; public-origin release evidence remains unproven |

This documentation-only slice reran the backend suite and verified lineage and
changed paths. It did not rerun frontend tests/build because the fresh worktree
has no installed frontend dependencies; PR #149 frontend CI passed against the
same runtime tree. A future source or release-candidate slice must run
proportional checks at its exact SHA.

## Release-candidate decision status

`9f4d3a4` is the observed current default-branch head for evidence tracking. It
is **not** a newly selected immutable release candidate. DR-001 therefore
remains open until the Project Owner records the selected SHA, scope, and
changed-path/revalidation matrix. The older `d04e3f0` entry in
`REMEDIATION_PROGRESS.md` remains historical selected-SHA planning evidence and
must not be combined with `9f4d3a4` to create a hybrid baseline.

## Historical tracker correction

`REMEDIATION_PROGRESS.md` remains planning/progress context and contains older
baseline dates, source snapshots, and status rows. Its FE-004 “next bounded
frontend implementation candidate” wording is corrected to historical context:
FE-004 was merged through PR #140, while current source-aligned evidence and
remaining browser/role/release gates are recorded in the current-main packets.
The correction does not close a broader frontend layer, authorize a new
frontend slice, or turn the merged PR into production evidence.

## Production-readiness verdict

The observed current head remains **NOT READY for production, deployment,
activation, or go-live**. No overall percentage is assigned or increased by
this provenance correction.

The following gates remain open or unverified:

- staging-like runtime, public-origin, TLS/proxy, CORS, cookie, health,
  release-artifact, browser, real-role, screen-reader, and cross-browser proof;
- credential-incident closure and independent GitHub/history/remote/old-clone
  verification;
- MFA parameters and ownership, recovery/key custody, security-event
  retention/alerting/ownership, and abuse-control production operation;
- worker/scheduler topology, telemetry destination, SLO/error budget, on-call,
  capacity, and notification operations;
- migration target/window, backup custody, restore rehearsal, rollback,
  validation, and independent data ownership;
- production storage, payment, fulfillment, Finance, and notification-provider
  selection or activation;
- dependency advisory disposition, CI/release policy, bundle budgets,
  versioning, rollback artifact ownership, and independent readiness review.

Transaction-required mutations must continue to fail closed when MongoDB
transaction capability is unavailable. Provider-neutral storage and Retail
payment remain inactive. No migration, deployment, secret rotation, provider
activation, or go-live action was performed by this slice.

## Handover

- **Changed:** this task card, this provenance packet, the DR-001 current-head
  observation, and the historical freshness notice in
  `REMEDIATION_PROGRESS.md`.
- **Intentionally unchanged:** canonical specifications, decisions, ADRs,
  runbooks, application source/tests, dependencies, CI, providers,
  credentials, migrations, databases, shared data, deployment state, and
  release-candidate selection.
- **Verification:** lineage, clean worktree, exact SHA, PR #149 merge state,
  changed-path list, backend suite, `git diff --check`, and staged
  secret-pattern review. Frontend/build results are carried from the prior
  packet and PR #149 CI; they were not rerun locally in this documentation-only
  slice because the fresh worktree has no installed frontend dependencies.
- **Rollback:** revert the documentation commit; no runtime or data rollback is
  needed.
- **Next safe gate:** Project Owner records DR-001, then a separately scoped
  current-SHA layer reconciliation or approved source slice can be selected.
- **External actions still requiring approval:** PR merge, staging access,
  provider activation, migration apply/restore, deployment, secret rotation,
  production-readiness approval, and go-live.
