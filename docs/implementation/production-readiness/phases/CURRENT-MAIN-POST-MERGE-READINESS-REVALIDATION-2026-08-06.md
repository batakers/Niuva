# Current-main Post-merge Readiness Revalidation — 6 August 2026

<!-- markdownlint-disable MD013 MD060 -->

**Status:** `CURRENT-MAIN EVIDENCE / NOT RELEASE-CANDIDATE SELECTION`

**Observed current head:** `origin/main` at
`1a99bd7cd56500bb3ea08a892f01ffc0ed22ec79` (`1a99bd7`), Git tree
`8d190098fe819b4c284d65d9e4ca2fbcbb81ff9f`, fetched on 6 August 2026
(Asia/Jakarta).

**Merge parents:** `9b3044170f24b857348af073387ab4401f8822d7` and
`230ed2fcc7be630bc14ef1096d8f3df826ee15af`.

**Worktree:** `C:\tmp\niuva-post-198-main-20260806`, clean at task start, with
`HEAD = origin/main` and `origin/main...HEAD = 0/0`.

The requested baseline `c7452b8` is stale. The immediately prior current-main
observation was `9b30441` after PR #185. PR #198 then entered `main` with the
current-head documentation re-anchor. This packet records the subsequent
repository state only; it does not select `1a99bd7` as a release candidate or
lift any readiness gate.

## 1. Authority and non-authority

The canonical chain used here is Master Spec → Document Register → Decision
Register → applicable ADR/decision → applicable runbook → current source and
tests. The Master Spec keeps production readiness and go-live open, requires
provider-neutral storage/payment boundaries, and treats current implementation
as evidence rather than requirement authority.

The deployment, rollout/handover, and migration/backup/restore runbooks are
procedural authority only. They do not authorize a target, credential use,
provider activation, migration execution, deployment, or go-live.

## 2. Evidence identity and post-merge lineage

| Evidence | Current observation | Limit |
| --- | --- | --- |
| Requested baseline | `c7452b889eec2c3597c622479d46da456f2bf656` | Ancestor of current main; stale and not selected |
| Prior current-main observation | `f43eea6bd633b4250180e4373a62e5fb21fe14fa` (`f43eea6`) | Point-in-time observation after PR #186; historical after later merges |
| Intermediate current-main observation | `9b3044170f24b857348af073387ab4401f8822d7` (`9b30441`) | Point-in-time observation after PR #185; historical after #198 |
| Current `origin/main` | `1a99bd7cd56500bb3ea08a892f01ffc0ed22ec79` (`1a99bd7`) | Point-in-time observation only; DR-001 remains open |
| Git tree | `8d190098fe819b4c284d65d9e4ca2fbcbb81ff9f` | Source-tree identity, not a published artifact identity |
| Merge parents | `9b3044170f24b857348af073387ab4401f8822d7` and `230ed2fcc7be630bc14ef1096d8f3df826ee15af` | Git ancestry only; current merge is PR #198 |
| Requested-baseline delta | `c7452b8..1a99bd7`: 136 commits, 95 paths, 9998 additions, 212 deletions | Scope indicator, not readiness completion |

PRs merged after the prior `f43eea6` observation:

| PR | Merge commit | Scope |
| --- | --- | --- |
| #187 | `2dfb2d7` | G5 current-main blocker reanchor, documentation-only |
| #188 | `b27d712` | DR-012 current-main revalidation, documentation-only |
| #190 | `01baf05` | DR-013 current-main reanchor, documentation-only |
| #191 | `b10a1cd` | DR-011 current-main reanchor, documentation-only |
| #192 | `503f1b2` | G1–G4 current-main evidence index, documentation-only |
| #193 | `4842c69` | DR-001 current-main reanchor, documentation-only |
| #194 | `4026bc2` | G4 artifact/rollback revalidation, documentation-only |
| #189 | `9f11604` | Frontend release-bundle budget/runner and related tests; now part of `main` |
| #195 | `9472537` | Post-merge readiness packet; documentation-only but authored against `4026bc2` |
| #185 | `9b30441` | NIV-001 sole-owner accepted-risk exception and redacted evidence refresh; documentation-only |
| #198 | `1a99bd7` | Current-head readiness/G5 documentation re-anchor; documentation-only |

PR #185 is merged and its packet records a sole-owner self-verification
exception through 30 August 2026. It explicitly does not claim independent
verification, credential rotation/revocation, history rewrite, or `Verified`
incident closure; the P0 release/go-live block remains. PR #198 is merged and
reconciles the current-head documentation. PRs #196 and #197 are stale,
conflicting branches based on the older `9472537` head and are not part of this
tree.
PR #189's numeric bundle budget remains source/config state while canonical
DR-013 remains Open.

## 3. Changed-path boundaries after PR #198

The exact `9b30441..1a99bd7` delta from PR #198 is **four documentation paths,
174 additions, and 118 deletions**. The preceding `9472537..9b30441` interval
from PR #185 remains five documentation paths; earlier #189 and #195 intervals
remain separately classified historical evidence. No application runtime,
dependency, migration, provider, credential, or environment path changed in
the #198 interval.

These path boundaries permit only carefully scoped interpretation of evidence;
they do not make repository state external-environment proof. The exact
current-main quality gate provides the current-merge-tree check recorded below.

## 4. Verification and CI evidence

| Check | Result | Limit |
| --- | --- | --- |
| Fresh fetch and exact worktree | Passed; `HEAD = origin/main = 1a99bd7`, clean, `0/0` divergent | Does not prove external environment state |
| Current main `quality-gates` | Passed at SHA `1a99bd7`; run [`31099077596`](https://github.com/batakers/Niuva/actions/runs/31099077596) | CI evidence only; not staging or production evidence |
| Post-merge changed-path audit | Passed; `9b30441..1a99bd7` is four documentation paths; earlier #185/#189/#195 intervals are separately classified | Does not re-run every historical packet's external gate |
| `git diff --check` | Passed before commit | Checks whitespace/error markers in this documentation slice only |
| Documentation lint | Passed; `markdownlint-cli2@0.23.2`, 0 issues across four changed files | Does not validate product or operational correctness |
| Exact staged-path validation | Passed; exactly the four approved documentation paths were staged | Does not validate unstaged or external files |
| Credential-shaped staged scan | Passed; 0 matches for private-key/token/bearer/JWT-shaped patterns | Does not prove absence from history, external stores, or old clones |
| Application source/test edits | None in this follow-up | #185/#189 source-state observations are not changed here |
| External smoke, real-role/browser, staging, artifact publication, restore, migration, deployment, monitoring, and go-live | Not run | Target, credentials, owners, or approvals are absent |

## 5. Current decision and readiness boundary

- **DR-001:** Open. `1a99bd7` is observed current `main`, not a selected
  immutable release candidate. A candidate still requires owner-selected SHA,
  scope, exclusions, effective time, and independent verification.
- **DR-002:** The time-bound accepted risk through 30 August 2026 now includes
  the documented sole-owner self-verification exception from #185. Verified
  credential-incident closure, independent verification, external
  history/cache/fork/clone evidence, controlled new-account authentication,
  and any credential action remain absent; the P0 release/go-live block stays.
- **DR-003–DR-005:** Authentication scope, distributed abuse-control operations,
  and MFA decisions remain partially resolved or blocked as recorded by the
  canonical queue; no new policy is inferred here.
- **DR-011–DR-014:** Provider/Finance activation, topology/recovery ownership,
  toolchain/bundle policy, and operational evidence remain open or partial.
- **DR-013:** #189's `status: "approved"` budget is source-state evidence, not
  closure of the canonical release-policy decision.
- **PRs #196/#197:** Open, stale, and conflicting after #198; their passing
  historical checks do not make their old-head documentation current-main
  evidence.
- **DR-015:** Production-readiness and go-live decisions remain ineligible.

The current repository therefore has a current-main documentation observation
with the #185 accepted-risk exception recorded and successful/pending
repository CI evidence, but it is not proven staging-ready,
production-ready, or go-live-ready. Source maturity, staging/deployment
evidence, and go-live approval remain separate verdicts.

## 6. Handover, risk, and rollback

### Changed

- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` — DR-001
  freshness observation and packet link;
- this task card; and
- this revalidation packet.
- `docs/implementation/production-readiness/phases/G5-CURRENT-MAIN-INTEGRATION-BLOCKER-2026-08-06.md` — current G5 observation.

### Intentionally unchanged

- all application source/tests, dependencies, lockfiles, workflows,
  migrations, provider configuration, credentials, secrets, databases, and
  external environments;
- historical G1–G5, DR-002–DR-013, and artifact packets; they remain
  point-in-time evidence and are not silently rewritten;
- the five #185 NIV-001 documentation paths; they are observed as merged
  historical evidence but not rewritten by this follow-up;
- PRs #196 and #197; no stale-head merge, rebase, or closure was performed;
  and
- the dirty primary worktree at `C:\Portfolio\Niuva\Niuva-main-latest`.

This is documentation-only and reversible with a normal documentation revert.
The main risks are evidence staleness, treating `1a99bd7` as an unapproved
candidate, and mistaking green CI or local/path-preserving evidence for
external operational proof.

External actions still requiring approval include DR-001 selection, DR-002
incident disposition/verification, DR-003–DR-005 security decisions, DR-011
provider/Finance scope, DR-012 operational ownership, DR-013 release policy,
DR-014 observability ownership/evidence, independent security/release review,
artifact publication/attestation, backup/restore rehearsal, migration,
provider activation, secret use/rotation, deployment, production-readiness,
and go-live.

<!-- markdownlint-enable MD013 MD060 -->
