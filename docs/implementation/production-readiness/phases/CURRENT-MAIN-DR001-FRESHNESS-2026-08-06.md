# Current-main DR-001 Freshness Reconciliation — 6 August 2026

<!-- markdownlint-disable MD013 -->

**Status:** Decision-input and provenance context only. DR-001 remains
`Open`; this packet does not select a release candidate and is not
production-readiness, deployment, provider-activation, migration, or go-live
approval.

## 1. Exact repository observation

A fresh `origin` fetch was completed in an isolated worktree created from
`origin/main`. The observed state is:

| Evidence | Result | Limit |
| --- | --- | --- |
| Requested baseline | `c7452b889eec2c3597c622479d46da456f2bf656` | Stale; not used as the worktree baseline |
| Current `origin/main` | `f43eea6bd633b4250180e4373a62e5fb21fe14fa` | Point-in-time remote observation only |
| Commit tree | `6d2154bd52785bbc749345c0346651f9752d1646` | Identifies the exact tree; does not select it |
| First parents | `cccc1e8c06abf1eba57854166c01598bd8db2246`, `0b23419a5a0fe46b7dbc8459032213c741c60fbc` | Git ancestry only |
| Worktree | `C:\tmp\niuva-dr001-current-main-reanchor-20260806` | Clean before documentation edits; `origin/main...HEAD = 0/0` |
| Toolchain observed | Python `3.14.3`; Node `v24.14.0`; npm `11.18.0` | Local toolchain identity, not a release approval |

The worktree was clean and the branch was based directly on the fetched
`origin/main` before the documentation edits. No application file was edited
for this packet.

## 2. Ancestry and changed-path scope

The requested baseline and the historical candidate remain ancestors of the
current head:

| Relationship | Result | Interpretation |
| --- | --- | --- |
| `d04e3f0` → `f43eea6` | Ancestor verified | Historical evidence is not current-candidate evidence |
| `c7452b8` → `f43eea6` | Ancestor verified | The user-provided baseline is stale |
| `c84743c` → `f43eea6` | Ancestor verified | The prior DR-001 packet is superseded for freshness |
| `d04e3f0..f43eea6` | 325 commits; 405 changed paths | Scope indicator, not closure evidence |

Top-level changed-path counts from the historical `d04e3f0` candidate to the
current head are:

| Area | Paths |
| --- | ---: |
| `backend/` | 100 |
| `frontend/` | 126 |
| `docs/` | 163 |
| `.github/` | 4 |
| `doc/` | 5 |
| `scripts/` | 1 |
| `tasks/` | 3 |
| repository root | 3 |
| **Total** | **405** |

The exact `c84743c..f43eea6` delta includes source changes in
`backend/b2b_service.py`, `backend/catalog_service.py`,
`backend/content_service.py`, `backend/transaction_execution.py`,
`backend/auth_security_alerts.py`, and `backend/auth_security_events.py`;
related backend tests; frontend release-contract scripts and manifest changes;
CI and secret-scan workflow/configuration changes; staging scripts/runbooks;
and multiple readiness decision packets. Therefore the earlier `c84743c` test
and readiness evidence cannot be silently promoted to the current head without
proportional revalidation.

## 3. First-parent lineage after the prior DR-001 observation

The following merges are repository history and freshness evidence only:

| PR | Merge commit | Bounded change |
| ---: | --- | --- |
| #151 | `27057ff` | DR-001 release-candidate decision packet |
| #152 | `7179844` | DR-012 staging decision packet |
| #153 | `a996872` | DR-013 toolchain decision packet |
| #154 | `5ebb394` | DR-001 current-main observation refresh |
| #155 | `b154490` | DR-002 NIV-001 disposition packet |
| #156 | `3624c13` | DR-011 provider/Finance activation packet |
| #157 | `97c07b0` | DR-005 internal MFA decision packet |
| #158 | `a32c20e` | DR-004 abuse-control decision packet |
| #159 | `dad707a` | DR-003 authentication-scope exit packet |
| #160 | `ca8b194` | Post-merge DR-001 observation refresh |
| #161 | `7810a38` | DR-001 observation after PR #160 |
| #162 | `c705a44` | DR-001 observation after PR #161 |
| #163 | `443aefe` | Parallel G1–G4 task cards |
| #164 | `46f3bdd` | Concurrent transaction conflict contract normalization |
| #165 | `0c7b280` | G1 ownership reconciliation |
| #166 | `f9dfe3b` | G1 transaction import quality gate |
| #167 | `784a4d1` | Bounded staging-candidate contract |
| #168 | `0990664` | Provider-neutral staging readiness package |
| #169 | `5d5abcf` | G4 staging rollback evidence packet |
| #170 | `5254641` | DR-001 current-main provenance refresh |
| #171 | `8f261fb` | G3 browser evidence and source gate |
| #172 | `b1564b0` | Frontend release-candidate contracts |
| #173 | `d4bf4ac` | G4 artifact rollback evidence |
| #174 | `6cd5a64` | G5 reconciliation after child merges |
| #175 | `4c105af` | G3 current-main frontend evidence |
| #176 | `d812f95` | G1 current-main backend integrity evidence |
| #177 | `90368e4` | G2 current-main auth/security evidence |
| #178 | `9736d61` | Frontend release bundle gate |
| #179 | `fe80429` | G5 freshness correction |
| #180 | `9f6fe38` | Bounded auth/security gate closure |
| #181 | `2ce11db` | Auth alert-policy threshold enforcement |
| #182 | `c137c40` | Redacted NIV-001 evidence inventory |
| #183 | `cccc1e8` | Current-main revalidation after G2 merge |
| #184 | `07e5185` | DR-013 baseline refresh |
| #186 | `f43eea6` | Readiness/NIV-001 documentation re-anchor |

## 4. Available verification and limits

Checks on the merged PR heads were observed through GitHub:

- PR #164: backend, frontend, secret-scan, and transaction-tests passed.
- PRs #165–#169: required backend/frontend/secret-scan checks passed; the
  applicable transaction-tests checks also passed.
- Merged PRs #170–#184 and #186 had their required checks observed as passed on
  their cited heads; these are merged-PR evidence, not a standalone workflow
  run for the resulting merge commit. PR #185 remains open and is not part of
  the current `main` tree.
- PR #187 at head `7143aa9` changes only this G5 documentation family beyond
  `f43eea6`; its backend, frontend, and secret-scan checks passed. This is
  path-preserving current-main CI evidence, not a new exact-`f43eea6` run.
- No standalone GitHub workflow run was observed for the merge commit
  `f43eea6` itself.
- Local backend/frontend dependencies are not installed in this fresh
  worktree, so no local full backend suite, frontend suite, or build was run
  here. Those checks remain unproven at this exact SHA.

These results are implementation/CI evidence, not proof of production
readiness. No evidence is established here for a staging origin, TLS/proxy
and CORS/cookie capture, external browser or real-role verification,
screen-reader coverage, restore rehearsal, provider activation, migration
execution, deployment, monitoring/on-call activation, or go-live.

## 5. DR-001 disposition and current blockers

The Project Owner disposition remains intentionally blank. Option A (select
the current SHA), Option B (retain the historical candidate), or Option C
(supply another exact SHA) requires an explicit owner decision and a resulting
changed-path/revalidation matrix. This packet does not infer that decision
from merged PRs or green checks.

The following separate gates remain open or owner-controlled: credential
incident verification/renewal under DR-002, auth/MFA/abuse operations,
provider and Finance activation, migration target/backup/restore evidence,
toolchain and release convention, independent review, staging access and
external browser evidence, deployment/rollback ownership, and production
readiness/go-live approval.

## 6. Handover

**Changed by this slice:** the DR-001 row in
`docs/implementation/production-readiness/DECISIONS_REQUIRED.md`, this packet,
its task card, and the current release-candidate selection packet/task card.

**Intentionally unchanged:** application source and tests, dependencies and
lockfiles, CI workflows, canonical specifications, decisions, ADRs, runbooks,
provider configuration, migrations, credentials, databases, deployment state,
and all earlier historical packets/task cards.

**Risk:** without this correction, current decision readers can mistake the
older `7810a38`, `ca8b194`, `c84743c`, or `5d5abcf` observations for the current
default branch. This packet reduces freshness ambiguity but does not reduce
the underlying readiness gates.

**Rollback:** revert the documentation commit; no runtime, database, or
provider rollback is needed.

**External actions still requiring approval:** Project Owner candidate
selection, independent exact-SHA review, staging access, provider activation,
migration apply/restore, secret rotation, deployment, production-readiness
approval, and go-live.

<!-- markdownlint-enable MD013 -->
