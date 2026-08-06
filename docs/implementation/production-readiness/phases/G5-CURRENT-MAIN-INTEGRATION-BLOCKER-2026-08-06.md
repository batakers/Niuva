# G5 — Current-main Integration and Release-candidate Blocker Packet

<!-- markdownlint-disable MD013 MD060 -->

**Status:** `BLOCKED / PRE-ACCEPTANCE RECONCILIATION`. This is an evidence
index and decision-routing packet, not final G5 acceptance, release-candidate
selection, production-readiness approval, deployment approval, or go-live
approval.

**Observed baseline:** `origin/main` at
`d4bf4ac0e9454ad09e57856cfebbfa70b9a93294`, with Git tree
`9b1abc0c006342d5e4a63765075a7c8fca7e8897`, after a fresh fetch on 6 August
2026.

**Branch/worktree:** `codex/g34-g5-integration-20260806` /
`C:\tmp\niuva-g34-g5-integration-20260806`.

The G0 staging contract defines G5 as a serial integration gate after the
relevant G1–G4 handovers. Current evidence does not satisfy that prerequisite,
so this packet records the blockers explicitly instead of treating partial
child evidence as acceptance.

## 1. Authority and boundary

This packet follows the repository authority order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. the applicable approved decision or ADR;
5. the applicable deployment, transaction, browser, and backup/restore
   runbooks; and
6. current source, tests, workflows, and child evidence.

The applicable G5 routing contract is
`docs/implementation/production-readiness/phases/RELEASE-CANDIDATE-BOUNDED-STAGING-SCOPE-2026-08-05-task-card.md`.
It requires exact-SHA reconciliation of changed and unchanged paths,
test/build/browser evidence, negative-path behavior, open decisions, rollback
needs, and external approvals. It also states that G5 cannot self-approve
production readiness or go-live.

This packet changes no runtime, data, dependency, workflow, migration,
provider, deployment, secret, or environment state.

## 2. Exact repository identity

The fresh isolated worktree matched the fetched remote before this packet was
added:

| Evidence | Result | Limit |
| --- | --- | --- |
| `origin/main` | `d4bf4ac0e9454ad09e57856cfebbfa70b9a93294` | Point-in-time source identity; DR-001 does not select it |
| Git tree | `9b1abc0c006342d5e4a63765075a7c8fca7e8897` | Source tree identity; not an artifact digest |
| Merge parents | `b1564b082208d55df869e94163eb2eaa3f61ee35`, `de60bfad54ef22da3bf67ca1f5c427c58aa1dfdc` | Git ancestry only |
| Merge change from previous main | PR #173 added the G4 evidence packet only | Documentation integration; no runtime change is inferred |
| Worktree divergence before packet | `origin/main...HEAD = 0/0` | Does not prove any external environment state |
| Working tree before packet | Clean | Packet is the only intended change in this branch |

PR #173 is now merged at `d4bf4ac`:
[`#173`](https://github.com/batakers/Niuva/pull/173). Its G4 packet was
prepared against `b1564b0`; the merge diff is documentation-only. Therefore
its source-path evidence can be carried to the current runtime tree, but its
local artifact observation is not an immutable published release artifact.

## 3. Child-goal handover reconciliation

The status below is deliberately conservative. A merged PR proves branch
integration only; a stale packet or a carried test result does not become
current exact-SHA acceptance automatically.

| Child | Evidence located | Exact-current-SHA status | G5 consequence |
| --- | --- | --- | --- |
| G0 | Bounded staging contract is present in `main` through the earlier G0 documentation lineage | Planning contract only; it does not select a candidate or grant operations authority | Scope is frozen, but G5 still needs child handovers and owner decisions |
| G1 | G1 task card; PR #166 backend/transaction changes and CI evidence; current-main handover in open PR [#176](https://github.com/batakers/Niuva/pull/176) | Packet is tied to `d4bf4ac`; required PR #176 backend, frontend, and secret-scan checks passed, but the packet is not yet merged | Bounded repository/path evidence passes; staging, independent review, and operational reconciliation remain open |
| G2 | G2 task card; DR-003, DR-004, and DR-005 decision packets; current-main handover in open PR [#177](https://github.com/batakers/Niuva/pull/177) | Packet is tied to `d4bf4ac`; auth/security, authorization/privacy, frontend-auth, and exact-main CI evidence are recorded, while DR-003/004/005 remain open | Bounded repository evidence passes with limits; human security decisions and production evidence remain blocking |
| G3 | Historical packet at `5254641c`; current revalidation packet in open PR #175; PR #172 current-main-equivalent frontend CI | Current source revalidation passes `design-system-integration.spec.js` in 4/4 viewports and `npm run audit:production`; PR #175 is not yet merged | Bounded hermetic gate passes; serial handover and external role/staging/manual accessibility evidence remain open |
| G4 | Current-main G4 packet merged by PR #173; packet baseline is `b1564b0`, while the merge itself changed documentation only | Source-path evidence carries to `d4bf4ac`; external staging, artifact publication, restore, and rollback evidence remain absent | G4 is documented, but not operationally accepted |
| G5 | This packet | Final acceptance intentionally not attempted | Blocked until the relevant child handovers, exact-SHA evidence, and owner/verifier decisions exist |

G1 and G2 now have current-main handovers in open PRs #176 and #177, but they
are not yet part of the `main` phase inventory. G2 also remains decision-
blocked by DR-003/004/005. This is evidence that the serial G5 handover record
and human security closure remain incomplete, not evidence that the underlying
backend source is defective.

## 4. Verification evidence that can be carried

### Current-main-equivalent PR quality evidence

PR #172 workflow run
[`31059540675`](https://github.com/batakers/Niuva/actions/runs/31059540675)
ran at head `2b970300a856c5c8c5697c21d335cad78775b15b`. Its tree equals the
first-parent runtime tree carried into `d4bf4ac`:

- backend job `92484240967`: `961 passed, 15 skipped, 14 subtests passed` in
  `28.54s`, with the job's quality stages successful;
- frontend job `92484240976`: `62` suites and `376` tests passed; production
  compilation succeeded;
- hermetic browser contracts: four Retail discovery cases and one Admin
  session cross-tab case passed;
- secret-scan job `92484240912`: successful.

PR #173 then changed only documentation. These results are strong
source/CI evidence for the current runtime tree, but they do not prove
real-role browser behavior, external origin/TLS/proxy/CORS/cookie behavior,
staging health, restore, rollback, monitoring, or go-live.

### Transaction evidence

The latest relevant transaction workflow is PR #166 run
[`31054981154`](https://github.com/batakers/Niuva/actions/runs/31054981154),
head `17dd1f6c4f1ab910259e096e3764097c398d1105`, job
[`92470418730`](https://github.com/batakers/Niuva/actions/runs/31054981154/job/92470418730):
the isolated MongoDB replica-set procedure reported `76 passed in 5.60s`.
The transaction-related paths have no diff between that tested head and the
current runtime tree:

- `backend/transaction_execution.py`;
- `backend/tests/test_transaction_execution.py`;
- `backend/tests/test_transaction_guard.py`; and
- `backend/tests/test_transaction_observability.py`.

This is carried path evidence, not a claim that the transaction workflow ran
on `d4bf4ac`. The earlier PR #164 failure was followed by the retry-safe
correction and later passing transaction evidence.

PR #164's retry-safe follow-up run
[`31054621081`](https://github.com/batakers/Niuva/actions/runs/31054621081),
job
[`92469314161`](https://github.com/batakers/Niuva/actions/runs/31054621081/job/92469314161),
reported `76 passed in 6.02s`. The B2B/catalog conflict paths exercised by
that run have no diff from its tested head `d4c144b7` to current `d4bf4ac`.
The two transaction runs are reported separately because PR #164 and PR #166
changed different portions of the G1 path set.

The exact-current-main backend quality run
[`31061245165`](https://github.com/batakers/Niuva/actions/runs/31061245165),
backend job
[`92489477033`](https://github.com/batakers/Niuva/actions/runs/31061245165/job/92489477033),
also passed with `961 passed, 15 skipped, 14 subtests passed in 20.56s`.
This supports current-tree backend quality, while the isolated transaction
workflow remains path-preserving evidence rather than an exact-current-SHA
transaction workflow run.

### G3 current-source revalidation

The historical G3 packet recorded a mobile 375px focus failure and a Windows
`npm.cmd` audit-runner `EINVAL`. Current-source revalidation in the fresh G3
worktree produced:

- `design-system-integration.spec.js`: **4 passed** across mobile, tablet,
  laptop, and desktop, including mobile focus and Escape focus restoration;
- `npm run audit:production`: passed with two exact RSC-only React Router
  advisory entries accepted for the BrowserRouter SPA;
- `npm run test:release-contracts`: **5 passed**; and
- `npm run test:bundle`: **5 passed**.

The evidence-only child handover is PR
[#175](https://github.com/batakers/Niuva/pull/175), based on `d4bf4ac`; its
backend, frontend, and secret-scan checks passed. The current G3 source gate is
therefore no longer a blocker for the bounded hermetic test scope. Real-role
accounts, external origin/TLS/proxy/CORS/cookie verification, manual
screen-reader review, and staging remain separate unrun gates.

### G4 evidence now on main

PR #173's merged packet records a local build observation, a local artifact
manifest, absent bundle-budget policy, no immutable registry/hosting digest,
and no staging/restore/monitoring evidence. Its local source/build observation
was made against the same runtime source tree as PR #172; the `d4bf4ac` merge
adds only documentation. This supports carrying the source-path evidence, but
does not create an external artifact, staging target, previous-known-good
release, or rollback exercise.

## 5. Provenance hazards and stale context

The following existing context files do not describe the current main and must
not be used as unqualified current-candidate evidence:

| File | Recorded observation | Required treatment |
| --- | --- | --- |
| `CURRENT-RELEASE-CANDIDATE-SELECTION-2026-08-06.md` | `c84743c8` | DR-001 packet is stale; owner selection remains blank |
| `CURRENT-MAIN-DR001-FRESHNESS-2026-08-06.md` | `5d5abcf` | Freshness packet is superseded by later main lineage |
| `CURRENT-MAIN-READINESS-PROVENANCE-RECONCILIATION-2026-08-06.md` | `9f4d3a4` | Carried evidence requires revalidation at `d4bf4ac` |
| `G3-BROWSER-EVIDENCE-SOURCE-GATE-2026-08-06.md` | `5254641c` | Historical residual record; current findings are revalidated in pending PR #175 |
| `G4-CURRENT-MAIN-ARTIFACT-ROLLBACK-EVIDENCE-2026-08-06.md` | `b1564b0` | Merged current-main packet; source-path evidence carries, external evidence remains absent |

No historical packet may be combined with later source changes to create a
hybrid release candidate. Any future candidate must name one exact SHA and
reconcile all applicable evidence against that tree.

## 6. G5 acceptance matrix

| Required G5 item | Current result | Verdict |
| --- | --- | --- |
| Project Owner selects one immutable candidate SHA and scope | DR-001 disposition is blank; `d4bf4ac` is only observed main | `BLOCKED_BY_DECISION` |
| G1 exact-SHA handover with changed/unchanged paths and verifier | PR #176 packet is tied to `d4bf4ac`; path-preserving transaction evidence and exact-current-main backend quality passed; independent verifier and external role matrix absent | `PARTIAL_PASS` |
| G2 exact-SHA auth/security matrix and human decision closure | PR #177 packet is tied to `d4bf4ac`; local auth/security `99` passed, authorization/privacy `197 passed, 2 skipped`, frontend auth `65 passed`, and exact-main CI passed; DR-003/004/005 and external role/staging evidence remain open | `BLOCKED_BY_DECISION` |
| G3 browser, accessibility, role, and negative-path evidence | Hermetic design-system suite `4/4` and audit runner pass; real-role/external/manual evidence absent | `PARTIAL_PASS` |
| G4 artifact, environment, rollback, and operations evidence | Packet is merged, but no external target or immutable published artifact exists | `BLOCKED_BY_EXTERNAL_EVIDENCE` |
| Backend/frontend/transaction quality gates | Exact-current-main backend quality run passed; PR #175, PR #176, and PR #177 required checks passed; relevant isolated transaction runs passed | `PARTIAL_PASS` |
| Exact external origin/TLS/proxy/CORS/cookie verification | No approved target or credentials | `NOT_RUN` |
| Migration dry run/apply/backup/restore/rollback | No approved target or mutation authorization | `NOT_RUN` |
| Immutable artifact registry/attestation and previous-known-good identity | Not present | `MISSING` |
| Monitoring, SLO/error budget, alert route, on-call, incident owner | Not evidenced; DR-012/DR-014 remain open | `BLOCKED_BY_DECISION` |
| Independent release verifier and Project Owner acceptance | Unassigned/not recorded | `MISSING` |
| Production-readiness or go-live decision | Not eligible | `BLOCKED` |

The matrix prevents green repository checks from being promoted into a broader
release claim. G5 final acceptance cannot be marked passed while any required
row is `MISSING`, `NOT_RUN`, or blocked.

## 7. Open decisions and external stop conditions

The following remain outside this packet and must be resolved or explicitly
accepted by the named authority before the corresponding gate can pass:

- DR-001: exact candidate SHA, scope, effective time, owners, verifier,
  exclusions, and accepted risks;
- DR-003, DR-004, and DR-005: authentication scope, abuse-control topology,
  MFA parameters, key custody, retention, alerting, and accountable owners;
- DR-011: storage/payment/provider and Finance/reconciliation activation;
- DR-012: staging topology/access, data policy, RPO/RTO, backup/restore,
  migration, rollback, incident, release, and on-call ownership;
- DR-013: supported package manager, runtime, lock/release/artifact policy,
  vulnerability/license policy, and bundle-budget values;
- DR-014: telemetry destination, retention/access, SLO/error budget,
  capacity, alert route, and worker/operations ownership;
- external consumer/probe ownership and compatibility evidence;
- independent release review and separate production-readiness/go-live
  authority.

Until those inputs exist, the exact stop conditions are: do not enable Retail
checkout, upload, payment, provider integrations, or production mutations; do
not use real credentials or data; do not apply or restore migrations; do not
publish an untracked artifact as a release; and do not declare `d4bf4ac` or any
other SHA production-ready.

## 8. Handover

### Changed

- `docs/implementation/production-readiness/phases/G5-CURRENT-MAIN-INTEGRATION-BLOCKER-2026-08-06.md`

### Intentionally unchanged

- all backend/frontend source, tests, dependencies, and lockfiles;
- all workflows, deployment configuration, environment files, migrations,
  providers, credentials, secrets, and external environments;
- canonical specifications, decision registers, ADRs, and runbooks;
- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md`;
- existing G0–G4 task cards and historical packets;
- PR #173 and all other branches/worktrees owned by parallel chats.

### Verification and limits

- fresh fetch, exact `origin/main` SHA/tree, fresh worktree, and zero divergence
  before this packet: passed;
- current-main-equivalent PR #172 backend/frontend/browser/secret checks:
  passed at the cited PR head;
- exact-current-main backend quality run `31061245165`: passed with `961
  passed, 15 skipped, 14 subtests passed`;
- PR #164 follow-up and PR #166 isolated transaction runs: passed with `76`
  each, with relevant paths unchanged through current `main`;
- current G1 handover PR #176: backend, frontend, and secret-scan checks
  passed; the documentation packet is not yet merged;
- current G2 handover PR #177: backend, frontend, and secret-scan checks
  passed; local auth/security and authorization/privacy selections passed, while
  auth transaction integration remained skipped without an approved isolated
  replica-set target; the documentation packet is not yet merged;
- G3 hermetic browser/audit findings: revalidated in open PR #175; external and
  manual accessibility evidence remains unrun;
- G4 current-main packet: merged by PR #173, with external operational gaps
  still open;
- external smoke, real-role browser/accessibility review, staging health,
  artifact publication, backup/restore, migration, deployment, monitoring,
  and go-live: not run because the target, credentials, owner, or approval is
  absent.

### Risk and rollback

This packet changes no runtime or operational state. Its rollback is a normal
documentation revert. The principal risk is evidence staleness: current main
may advance before a human selects a candidate, so every child handover must be
rechecked against the selected SHA.

### External actions still requiring approval

Project Owner DR-001 selection, source-gate decisions for any future G1/G3
remediation, independent security and release review, staging access and data
policy, artifact publication/attestation, backup/restore exercise, migration
execution, provider activation, secret use or rotation, deployment,
production-readiness approval, and go-live.

<!-- markdownlint-enable MD013 MD060 -->
