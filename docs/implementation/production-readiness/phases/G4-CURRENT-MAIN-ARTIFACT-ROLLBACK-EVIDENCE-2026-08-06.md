# G4 — Current-main Artifact and Rollback Evidence Packet

<!-- markdownlint-disable MD013 MD060 -->

**Status:** Documentation-only evidence packet; no staging or production
evidence is claimed.

**Observed baseline:** `origin/main` at
`b1564b082208d55df869e94163eb2eaa3f61ee35` after a fresh fetch on 6 August
2026. The Git tree is `16a603bbba221793d68846501317c0dafa1690d2`.

**Branch/worktree:** `codex/g32-g4-artifact-rollback-20260806` /
`C:\tmp\niuva-g32-g4-artifact-rollback-20260806`.

This packet is a G4 handover input. It does not select a release candidate,
authorize staging or production deployment, activate a provider, apply or
restore a migration, rotate a secret, approve production readiness, or approve
go-live.

## 1. Evidence identity and scope

The isolated worktree was created from a freshly fetched `origin/main` and was
clean before this packet was added:

| Evidence | Result | Limit |
| --- | --- | --- |
| Release/source SHA | `b1564b082208d55df869e94163eb2eaa3f61ee35` | Point-in-time repository identity; not an owner-selected release candidate |
| Git tree | `16a603bbba221793d68846501317c0dafa1690d2` | Source tree identity only; no published artifact or container digest |
| Merge parents | `8f261fbf6c71fb290b545a6e2e64e7be9a04a9c9`, `2b970300a856c5c8c5697c21d335cad78775b15b` | Git ancestry, not deployed-artifact identity |
| PR #172 | Merged at `b1564b082208d55df869e94163eb2eaa3f61ee35` | The merge tree equals the PR head tree; this does not prove staging or production behavior |
| Worktree divergence | `origin/main...HEAD = 0/0` | Proves this isolated checkout matched fetched remote before the packet change |
| Working tree | Clean before this packet | Does not prove an external environment is clean |

PR #172's head tree is identical to the current merge tree; therefore its
successful CI run is the closest current-main-equivalent source evidence. The
current release-candidate decision remains open. This packet does not silently
select `b1564b0` as a release candidate.

## 2. Authority and applicable boundaries

The packet was prepared against the repository authority order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. applicable architecture decisions and `DEC-OBS-001`;
5. `doc/PRODUCTION_DEPLOYMENT.md`;
6. `doc/ROLLOUT_AND_HANDOVER_RUNBOOK.md`;
7. `doc/MIGRATION_BACKUP_RESTORE_RUNBOOK.md`; and
8. current workflows, manifests, source, and tests.

The transaction, storage, payment, migration, provider, observability,
staging, and go-live boundaries remain separate decisions. A passing source or
CI check does not grant any external operational authorization.

## 3. Reproducible inputs

### Toolchain and dependency identity

The local evidence environment reported:

| Input | Observed value |
| --- | --- |
| Python | `3.14.3` |
| Node | `v24.14.0` |
| npm | `11.18.0` |
| CI Python | `3.14.3` |
| CI Node | `24` |
| Frontend install contract | `npm ci` using `frontend/package-lock.json` |
| Backend dependency manifest SHA-256 | `4C1CC9FB948CBF6B798532B3C740DF756393371DFFAECCD60023641A9BB04F00` |
| `frontend/package.json` SHA-256 | `FFE0FD89D0052F547E7C9216CFC92B51B804AED6BE464C7D8C02C0739C450A2B` |
| `frontend/package-lock.json` SHA-256 | `E094B3CA22A3A4C274B2945246EEFF9468DC33C328294216C420F04B3443E88C` |

The package metadata declares Yarn `1.22.22`, while the tracked release
workflow installs with npm. DR-013 therefore remains open for the supported
package-manager and release-toolchain policy; this packet does not resolve it
by preference.

The repository does not track `frontend/build/`, a release tag, a container
digest, or a hosted artifact for this SHA. A future staging candidate must
record the exact artifact digest produced from the selected source SHA rather
than treating the Git SHA as an artifact digest.

### CI evidence

PR #172 workflow run
[`31059540675`](https://github.com/batakers/Niuva/actions/runs/31059540675)
ran at head `2b970300a856c5c8c5697c21d335cad78775b15b`. Its tree is identical
to current `origin/main`, but the run remains PR-head evidence rather than a
deployment or a run on the merge SHA:

- backend job `92484240967`: `961 passed, 15 skipped, 14 subtests passed` in
  `28.54s`, with the job's dependency, lint, type, compile, and formatting
  stages successful;
- frontend job `92484240976`: `62` test suites and `376` tests passed,
  production compilation succeeded, and the build folder was created;
- hermetic browser contracts in the frontend job: four Retail discovery cases
  across mobile and desktop, plus one Admin session cross-tab case on desktop;
- secret-scan job `92484240912`: successful.

The latest transaction workflow evidence is PR #166 run
[`31054981154`](https://github.com/batakers/Niuva/actions/runs/31054981154),
head `17dd1f6c4f1ab910259e096e3764097c398d1105`, job
[`92470418730`](https://github.com/batakers/Niuva/actions/runs/31054981154/job/92470418730):
the isolated MongoDB replica-set procedure completed and the required
transaction modules reported `76 passed in 5.60s`. The current `main` is a
descendant of that tested head, and the transaction-related paths below have
no diff between that head and current `main`:

- `backend/transaction_execution.py`;
- `backend/tests/test_transaction_execution.py`;
- `backend/tests/test_transaction_guard.py`; and
- `backend/tests/test_transaction_observability.py`.

This is the latest relevant transaction-path evidence, not a claim that the
transaction workflow ran on the current merge SHA. The workflow is PR/path
triggered, so the merge SHA has no separate transaction run in this evidence
set. The earlier PR #164 failure was followed by the retry-safe correction and
the later passing transaction run; it is not silently counted as a current
failure.

## 4. Local build and artifact observation

In the isolated worktree, the frontend build was generated with the CI release
URL behavior:

```powershell
Set-Location frontend
$env:CI = 'true'
$env:REACT_APP_PUBLIC_SITE_URL = ''
.\node_modules\.bin\craco.cmd build
node scripts/generate-release-files.js
node scripts/check-bundle-size.js --report-only
```

The direct build completed with `Compiled successfully.`. Release-file
generation completed and correctly skipped sitemap generation because the
public URL was intentionally empty. The bundle report measured:

| Measurement | Local observation |
| --- | ---: |
| Total JavaScript gzip | `581.49 kB` |
| Entry JavaScript gzip | `203.22 kB` |
| Largest async JavaScript gzip | `100.14 kB` |

The local artifact inventory used a sorted recursive file list. Each row was
`relative path`, byte count, and lowercase SHA-256 separated by tabs, joined
with LF and a final LF, then SHA-256 hashed as UTF-8:

| Artifact evidence | Result |
| --- | --- |
| File count | `101` |
| Total bytes | `2,468,465` |
| Manifest SHA-256 | `ed63dfdcb3b8001c10c45abee25e7351f8905e06a0ae08e4795eb07348f713af` |
| `index.html` | `4,260` bytes; `9a24e26fd3c3278efabbf99a48e474c2178ce88a70c69cb4c8c66028e7b78e8e` |
| `static/js/main.a750c505.js` | `652,840` bytes; `9bc68f031d2d1844f9e753c016501b00854eecae19cb2f3e8a7048382442d11a` |
| `static/js/main.a750c505.js.LICENSE.txt` | `2,550` bytes; `964655ae6abf334adf2f54776324076759a1789e2433a68bd2cbb0f23f1486e2` |

The local dependency tree was reused from an adjacent clean worktree with the
same PR #172-equivalent source tree for artifact generation. A fresh local
`npm ci` was not claimed; an isolated install attempt timed out. CI's `npm ci`
and production build passed in the PR #172 run. The local build is therefore
useful for inspection and hash capture, but it is not a published or
immutable release artifact.

The same Git tree produced different hashed bundle filenames between the local
observation and CI (`main.a750c505.js` locally versus
`main.40131315.js` in CI). The measured sizes are close, but this confirms
that a release process must publish and retain one generated artifact with an
immutable digest; a local build must not be substituted for that identity.

Additional local checks passed:

- `node scripts/audit-production-dependencies.js`: passed with two exact
  React Router RSC-only advisory entries accepted for this BrowserRouter SPA;
- `node --test scripts/check-bundle-size.test.js`: five tests passed.

The bundle gate was also invoked without budget values and failed closed because
these policy inputs are absent:

- `BUNDLE_TOTAL_GZIP_BUDGET`;
- `BUNDLE_ENTRY_GZIP_BUDGET`; and
- `BUNDLE_ASYNC_GZIP_BUDGET`.

No budget value is invented in this packet. The CI report-only measurement is
evidence, not an approved bundle policy.

## 5. Runtime, environment, and health limits

The source and tracked workflows provide separate boundaries:

- `GET /api/health/live` is a process-level liveness check;
- `GET /api/health/ready` evaluates bounded dependency and readiness state,
  including database, transaction capability when mutations are required,
  schema/index state, notification worker, email configuration, and
  authentication-security-event migration state;
- `scripts/staging_smoke.py` contains unauthenticated checks for readiness,
  transaction capability, Admin authorization, public projection safety,
  manual-transfer disablement, and public dashboard denial;
- `external-smoke.yml` and `external-admin-e2e.yml` are manual workflows whose
  target URLs and credentials must be supplied for an approved non-production
  run.

These are source and hermetic CI contracts only. No approved staging origin,
credential set, external target, or environment owner was provided, so no
external smoke, Admin E2E, staging health, latency, capacity, role, or
real-browser evidence is claimed.

The tracked environment examples identify configuration names without values.
No credential, token, connection string, target URL, secret, or API key is
copied into this packet.

## 6. Artifact rollback and data-recovery identity

The first parent of the current merge, `8f261fbf6c71fb290b545a6e2e64e7be9a04a9c9`,
is a source predecessor only. No release tag, artifact registry digest,
attestation, container/image digest, hosting revision, or previous-known-good
deployed artifact is recorded for either the predecessor or current tree.

When a staging release is approved, the release record must bind:

1. the exact frontend artifact digest and backend package/image revision;
2. the source SHA and dependency/toolchain identity used to produce them;
3. previous-known-good artifact identities;
4. abort thresholds and an accountable release owner; and
5. a redeploy-only rollback command followed by health, transaction, browser,
   worker, and data-integrity checks.

Rollback must redeploy an already captured immutable artifact. Rebuilding during
rollback is not evidence of rollback safety because dependency resolution or
build inputs may differ. This packet does not execute a rollback.

`doc/MIGRATION_BACKUP_RESTORE_RUNBOOK.md` requires backup capture and
verification, dry-run/apply comparison, restore comparison, ownership,
timestamped evidence, and corrective action on an approved copy. No shared,
staging, or production database was accessed; no migration, backup, restore, or
data mutation was performed. Database rollback must not be inferred from an
application artifact rollback.

## 7. Capability and stop-condition matrix

| Area | Current evidence | Stop condition before staging or production |
| --- | --- | --- |
| Public/API source | Current source tree and successful PR-head quality gates | Exact selected SHA, artifact identity, target origin, route/cache/security-header evidence |
| Database transactions | PR #166 isolated replica-set run: `76 passed`; fail-closed source boundary | Approved staging topology, persistence, readiness, monitoring, and transaction evidence |
| Storage/upload | Provider-neutral boundary; production upload inactive by default | Provider, private persistence, scanning/quarantine, quota/retention, backup/restore, reconciliation, and owner approval |
| Payment | Provider-neutral boundary; payment activation remains outside this packet | Gateway, webhook authentication, reconciliation, Finance/tax, refund execution, and activation approval |
| Retail checkout | Inactive/deferred | Separate approved implementation, ownership, reservation, fulfillment, tax, payment, and readiness gates |
| Migration/data | No target or mutation used | Named target/window/owner, backup custody, dry run, validation, rollback, restore, and independent review |
| Browser/roles | Hermetic CI contracts only | Approved staging URL, seeded role accounts, real-role/browser run, accessibility review, and exact evidence SHA |
| Observability/on-call | Bounded sandbox contract and source-level telemetry | Named destination/access/retention, alert route, SLO evidence, capacity result, and accountable operations owner |
| Bundle policy | Reported sizes; budget inputs absent | Approved budgets or documented policy decision and a passing enforcement run |
| Release/rollback | Git SHA and local manifest only | Immutable published artifact, previous-known-good identity, rollback exercise, and handover acceptance |
| Candidate decision | DR-001 remains open | Project Owner records exact SHA, scope, effective time, owners, verifier, exclusions, and accepted risks |

Any missing item above is a stop condition, not an invitation to infer a
provider, threshold, secret, owner, or production policy.

## 8. Handover

### Changed

- `docs/implementation/production-readiness/phases/G4-CURRENT-MAIN-ARTIFACT-ROLLBACK-EVIDENCE-2026-08-06.md`

### Intentionally unchanged

- all backend and frontend source, tests, dependencies, and lockfiles;
- all workflows, deployment configuration, environment files, migrations,
  database data, providers, credentials, and secrets;
- canonical Master Spec, Document Register, Decision Register, ADRs, and
  runbooks;
- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md`, the G4
  task card, and the existing historical G4 packet;
- staging/production environments and external targets.

### Verification and limits

- fresh `origin/main` fetch, exact SHA/tree, clean isolated worktree, and
  zero divergence: passed before this packet;
- current-main-equivalent PR #172 backend/frontend/secret/browser CI evidence:
  passed at the cited PR head;
- latest relevant transaction CI evidence: passed at PR #166 head, with the
  transaction-related paths unchanged through current `main`;
- local frontend build, release-file generation, report-only bundle
  measurement, production dependency audit, bundle tests, and artifact hash
  capture: passed as recorded above;
- bundle enforcement: intentionally not passed because the three budget
  policy inputs are not configured;
- fresh local `npm ci`: not passed/claimed because the isolated install attempt
  timed out; CI `npm ci` passed in the cited PR #172 run;
- external smoke/Admin E2E, staging health, backup/restore exercise, artifact
  publication, deployment, and go-live verification: not run because no
  approved target, credentials, owner, or authorization was supplied.

### Risk and rollback

This packet changes no runtime, data, dependency, or environment state. Its
rollback is a normal revert of the documentation commit; no database or
deployment rollback is required.

The main risks are evidence staleness, local/CI artifact non-identity, absent
bundle policy, and unverified external operations. These must be refreshed or
resolved before a later release-candidate decision.

### External actions still requiring approval

Project Owner selection of DR-001, independent release/operations review,
staging access and data policy, artifact publication and attestation,
backup/restore exercise, migration execution, provider selection/activation,
secret use or rotation, deployment, production-readiness approval, and go-live
remain outside this packet.

<!-- markdownlint-enable MD013 MD060 -->
