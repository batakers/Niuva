# DR-001 Current Release-Candidate Selection Packet — 6 August 2026

**Status:** Decision input / context only. No release candidate is selected by
this packet, and it is not production-readiness, deployment, activation, or
go-live approval.

## 1. Decision requested

DR-001 requires the Project Owner to select one immutable SHA and an explicit
scope for all subsequent readiness claims. The current default branch is
observed at:

`origin/main` → `c84743c8fcbc158721037b3c02dc0dff0c872242`

The user-provided baseline `c7452b889eec2c3597c622479d46da456f2bf656` is not
current. It is an ancestor of the observed head and is the merge commit for
PR #140. The earlier `d04e3f009d6c815c0a4d99dfa5c93553da3cef43` selection is
historical planning evidence; it must not be silently combined with the new
head to create a hybrid candidate.

### Project Owner disposition — intentionally blank

Record one of the following in a separately approved decision record:

| Option | Meaning | Consequence |
| --- | --- | --- |
| A — select `c84743c` | Treat the exact current `main` tree as the immutable candidate | Revalidate every applicable readiness claim against this SHA and its full changed-path matrix |
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
| Fresh remote head | `c84743c8fcbc158721037b3c02dc0dff0c872242` | Point-in-time observation |
| `d04e3f0` → `c7452b8` | Ancestor relationship verified | Does not make the old candidate current |
| `c7452b8` → `c84743c` | Ancestor relationship verified | Does not constitute owner selection |
| `9f4d3a4` → `c84743c` | Ancestor relationship verified | PR #150 is documentation-only lineage |
| `d04e3f0..c84743c` | 237 commits, 350 changed paths | Counts are scope indicators, not closure evidence |

Top-level changed-path distribution from the historical selection to the
observed head is:

| Top-level area | Changed paths |
| --- | ---: |
| `backend/` | 98 |
| `frontend/` | 119 |
| `docs/` | 125 |
| `.github/` | 2 |
| `tasks/` | 3 |
| `doc/` | 1 |
| repository root | 2 |

The categories above are mutually exclusive by top-level path and total 350.
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

The exact diff from `9f4d3a4` to `c84743c` is documentation-only:

- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md`;
- `docs/implementation/production-readiness/REMEDIATION_PROGRESS.md`;
- the current-main provenance task card; and
- the current-main provenance packet.

This supports carrying forward source-tree test evidence from `9f4d3a4`, but
does not replace a fresh exact-candidate verification after DR-001 selection.

## 4. Verification evidence available now

- PR #150 is merged at `c84743c`; its `backend`, `frontend`, and `secret-scan`
  quality checks passed.
- A fresh backend run at `c84743c` produced **961 passed, 15 skipped, 14
  subtests**. The previous current-head packet recorded **62 frontend suites /
  373 tests** and a successful frontend build at the unchanged runtime tree;
  those results are carried because PR #150 changed documentation only.
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

- **Changed by this packet:** none yet; this packet and its task card are the
  only proposed paths in the implementation slice.
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
