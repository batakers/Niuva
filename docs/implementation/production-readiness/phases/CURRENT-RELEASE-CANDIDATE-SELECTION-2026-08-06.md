# DR-001 Current Release-Candidate Selection Packet — 6 August 2026

<!-- markdownlint-disable MD013 -->

**Status:** Decision input / context only. No release candidate is selected by
this packet, and it is not production-readiness, deployment, activation, or
go-live approval.

## 1. Decision requested

DR-001 requires the Project Owner to select one immutable SHA and an explicit
scope for all subsequent readiness claims. The current default branch is
observed at:

`origin/main` → `f43eea6bd633b4250180e4373a62e5fb21fe14fa`

The current commit tree is
`6d2154bd52785bbc749345c0346651f9752d1646`. This is a point-in-time
observation only; it is not an owner selection.

The user-provided baseline `c7452b889eec2c3597c622479d46da456f2bf656` is not
current. It is an ancestor of the observed head and is the merge commit for
PR #140. The earlier `d04e3f009d6c815c0a4d99dfa5c93553da3cef43` selection is
historical planning evidence; it must not be silently combined with the new
head to create a hybrid candidate.

### Project Owner disposition — intentionally blank

Record one of the following in a separately approved decision record:

| Option | Meaning | Consequence |
| --- | --- | --- |
| A — select `f43eea6` | Treat the exact current `main` tree as the immutable candidate | Revalidate every applicable readiness claim against this SHA and its full changed-path matrix |
| B — retain `d04e3f0` | Keep the historical candidate for historical audit purposes | It is not current `main`; no current-head claim may use it without a separate revalidation |
| C — select another SHA | Owner supplies an exact immutable SHA and reason | A new ancestry, path, test, and risk matrix is required before readiness claims |

Required owner fields: selected SHA, selected scope, effective date/timezone,
Project Owner, security/data owner, independent verifier, changed-path review,
revalidation exclusions, accepted risks/expiry, and superseded-baseline
treatment.

## 2. Provenance and ancestry evidence

The fresh worktree for this packet was created from fetched `origin/main`:

| Check | Result | Limit |
| --- | --- | --- |
| Requested baseline | `c7452b8` | Stale relative to the remote; not used as the worktree baseline |
| Fresh remote head | `f43eea6bd633b4250180e4373a62e5fb21fe14fa` | Point-in-time observation |
| Commit tree | `6d2154bd52785bbc749345c0346651f9752d1646` | Exact tree identity; not an artifact digest |
| `d04e3f0` → `c7452b8` | Ancestor relationship verified | Does not make the old candidate current |
| `c7452b8` → `f43eea6` | Ancestor relationship verified | Does not constitute owner selection |
| `c84743c` → `f43eea6` | Ancestor relationship verified | The prior packet is historical freshness evidence |
| `9f4d3a4` → `f43eea6` | Ancestor relationship verified | Historical documentation lineage only |
| `d04e3f0..f43eea6` | 325 commits, 405 changed paths | Counts are scope indicators, not closure evidence |

Top-level changed-path distribution from the historical selection to the
observed head is:

| Top-level area | Changed paths |
| --- | ---: |
| `backend/` | 100 |
| `frontend/` | 126 |
| `docs/` | 163 |
| `.github/` | 4 |
| `tasks/` | 3 |
| `doc/` | 5 |
| `scripts/` | 1 |
| repository root | 3 |

The categories above are mutually exclusive by top-level path and total 405.
They show why the historical `d04e3f0` evidence cannot be promoted by merely
adding recent PRs; auth, backend, frontend, tests, CI, documentation, and
operational claims all require selected-SHA scope review.

## 3. Recent current-main lineage

The following merge lineage is present after the historical selection and is
evidence of repository history only:

| PR | Merge commit | Bounded change |
| ---: | --- | --- |
| #138 | `0d0e63c` | Feature 7.2/7.3 provider-neutral observability source/test evidence |
| #139 | `8383cfb` | Frontend design-system post-merge reconciliation |
| #140 | `c7452b8` | Admin notification route fail-closed fix |
| #141 | `e6d0d5a` | Transaction telemetry sanitizer |
| #142 | `3100e9b` | Bounded staging-candidate contract documentation |
| #143 | `0694fae` | Authentication security-event key version |
| #144 | `d2c67f9` | Transaction-observability duration sanitization |
| #145 | `ca23977` | Reset-password accessibility regression coverage |
| #146 | `678133f` | Mobile navigation focus-containment regression coverage |
| #147 | `c1a3764` | Current-main readiness evidence reconciliation |
| #148 | `0c9a715` | Customer protected-route redirect regression coverage |
| #149 | `9f4d3a4` | Post-merge current-main readiness documentation |
| #150 | `c84743c` | Current-main provenance/DR-001 documentation |
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

The exact diff from `c84743c` to `f43eea6` spans 78 paths, with 7,921
additions and 180 deletions. It includes backend/frontend source and tests,
workflow/configuration, staging scripts, and readiness documentation; it is
not documentation-only. Prior checks at `c84743c` therefore cannot be treated
as exact-current evidence without proportional revalidation.

The current-main revalidation packets and merged PR checks provide bounded
path-preserving evidence only. They do not replace a fresh exact-candidate
verification after DR-001 selection.

## 4. Verification evidence available now

- PR #186 is merged at `f43eea6`; its backend, frontend, and secret-scan checks
  passed on its cited head, but no standalone workflow run for the resulting
  merge commit is claimed here.
- PR #187 at head `7143aa9` changes only documentation beyond `f43eea6`; its
  backend, frontend, and secret-scan checks passed. This is path-preserving
  current-main CI evidence, not a new exact-`f43eea6` workflow run.
- Historical backend/frontend results at earlier heads remain historical and
  require exact-candidate revalidation after owner selection.
- No staging-like origin, TLS/proxy/CORS/cookie capture, browser/real-role/
  screen-reader run, restore rehearsal, provider activation, migration apply,
  secret rotation, deployment, or go-live action is evidenced by this packet.

The carried local/CI checks are implementation evidence only. They do not prove
production readiness, and they do not choose the release candidate.

## 5. Consequences after owner selection

Once the Project Owner records a selection, the next revalidation must:

1. pin the exact SHA and worktree in every current evidence packet;
2. map all changed backend/frontend/test/CI/document paths from the historical
   baseline and identify affected findings;
3. rerun proportional backend/frontend/build/security checks at that exact SHA;
4. preserve all skipped/environment-dependent checks as unproven;
5. reconcile Layers 01, 02, 06, 07, 08, and 11 without inheriting historical
   percentages; and
6. retain the separate DR-002 through DR-015, staging, provider, migration,
   release, independent-review, production-readiness, and go-live gates.

No percentage is calculated here. A selected SHA would improve provenance, not
by itself increase production readiness.

## 6. Handover and stop conditions

- **Changed by this packet:** the DR-001 row in
  `docs/implementation/production-readiness/DECISIONS_REQUIRED.md`, the
  current-main freshness packet/task card, and this selection packet/task card.
- **Intentionally unchanged:** source, tests, dependencies, CI, canonical
  decisions, ADRs, runbooks, migrations, providers, credentials, data,
  deployment state, and the DR-001 decision itself.
- **Rollback:** revert the documentation commit; no runtime/data rollback is
  required.
- **Stop:** do not claim a release candidate, run migration/deployment, select
  a provider, rotate credentials, or publish a go-live decision from this
  packet.
- **Next owner action:** Project Owner records Option A, B, or C with the
  required fields above; an independent reviewer then verifies the resulting
  exact-SHA matrix.

<!-- markdownlint-enable MD013 -->
