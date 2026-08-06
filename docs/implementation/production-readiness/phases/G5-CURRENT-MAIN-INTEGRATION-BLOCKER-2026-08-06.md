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
| G1 | G1 task card; PR #166 backend/transaction changes and CI evidence; backend residual decision packet | No final G1 handover packet tied to `d4bf4ac` was found in the current-main phase inventory | Backend evidence is partial; exact changed-path, negative-path, and independent-review reconciliation remains open |
| G2 | G2 task card; DR-003, DR-004, and DR-005 decision packets; existing auth source/test history | No final G2 handover packet tied to `d4bf4ac` was found; the human decisions remain open | Auth/security acceptance cannot be declared |
| G3 | G3 browser/source-gate packet observed at `5254641c`; PR #172 current-main-equivalent frontend CI | The packet is stale and records a 375px focus failure plus an audit-runner failure; no current-main revalidation closes both | Browser/accessibility/source gate remains blocked |
| G4 | Current-main G4 packet merged by PR #173; packet baseline is `b1564b0`, while the merge itself changed documentation only | Source-path evidence carries to `d4bf4ac`; external staging, artifact publication, restore, and rollback evidence remain absent | G4 is documented, but not operationally accepted |
| G5 | This packet | Final acceptance intentionally not attempted | Blocked until the relevant child handovers, exact-SHA evidence, and owner/verifier decisions exist |

The absence of a final G1 or G2 packet in the current-main phase inventory is
not evidence that the underlying source is defective; it is evidence that the
serial G5 handover record is incomplete.

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

### G3 residual evidence

The current-main G3 packet records:

- `admin-session-cross-tab.spec.js`: `4 passed / 4`;
- `retail-discovery.spec.js`: `8 passed / 8`;
- `design-system-integration.spec.js`: `3 passed / 4`, with the mobile 375px
  focus assertion failing; and
- `npm run audit:production`: failed under the observed Windows Node runner
  because the child `npm.cmd` invocation returned `EINVAL`, even though the
  direct audit report contained only the narrowly accepted BrowserRouter RSC
  advisory entries.

PR #172's frontend run does not include evidence that these two G3 residuals
were revalidated and closed. They remain blockers for an unconditional
frontend/browser gate.

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
| `G3-BROWSER-EVIDENCE-SOURCE-GATE-2026-08-06.md` | `5254641c` | Use only as a residual-finding record until rerun |
| `G4-CURRENT-MAIN-ARTIFACT-ROLLBACK-EVIDENCE-2026-08-06.md` | `b1564b0` | Merged current-main packet; source-path evidence carries, external evidence remains absent |

No historical packet may be combined with later source changes to create a
hybrid release candidate. Any future candidate must name one exact SHA and
reconcile all applicable evidence against that tree.

## 6. G5 acceptance matrix

| Required G5 item | Current result | Verdict |
| --- | --- | --- |
| Project Owner selects one immutable candidate SHA and scope | DR-001 disposition is blank; `d4bf4ac` is only observed main | `BLOCKED_BY_DECISION` |
| G1 exact-SHA handover with changed/unchanged paths and verifier | No final current-SHA G1 handover located | `MISSING` |
| G2 exact-SHA auth/security matrix and human decision closure | DR-003/004/005 remain open; no final current-SHA G2 handover | `BLOCKED_BY_DECISION` |
| G3 browser, accessibility, role, and negative-path evidence | Mobile focus failure and audit-runner failure remain unresolved | `BLOCKED_BY_EVIDENCE` |
| G4 artifact, environment, rollback, and operations evidence | Packet is merged, but no external target or immutable published artifact exists | `BLOCKED_BY_EXTERNAL_EVIDENCE` |
| Backend/frontend/transaction quality gates | Current-main-equivalent PR #172 and relevant transaction run passed | `PARTIAL_PASS` |
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
- latest relevant transaction test run: passed, with relevant paths unchanged
  through current `main`;
- G3 residual browser/audit findings: unresolved and carried as blockers;
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

Project Owner DR-001 selection, source-gate decisions for remaining G1/G3
remediation, independent security and release review, staging access and data
policy, artifact publication/attestation, backup/restore exercise, migration
execution, provider activation, secret use or rotation, deployment,
production-readiness approval, and go-live.

<!-- markdownlint-enable MD013 MD060 -->
