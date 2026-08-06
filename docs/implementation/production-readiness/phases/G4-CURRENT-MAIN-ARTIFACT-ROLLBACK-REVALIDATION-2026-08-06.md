# G4 — Current-main Artifact and Rollback Revalidation

<!-- markdownlint-disable MD013 MD060 -->

**Status:** Documentation-only current-main evidence; no staging or production
evidence is claimed.

**Observed baseline:** `origin/main` at
`f43eea6bd633b4250180e4373a62e5fb21fe14fa` with Git tree
`6d2154bd52785bbc749345c0346651f9752d1646`, fetched on 6 August 2026
(Asia/Jakarta).

**Worktree/branch:** `C:\tmp\niuva-goal-continuation-current-main-20260806` /
`codex/goal-continuation-current-main-20260806`.

This packet revalidates G4 artifact and rollback evidence against the exact
current merge tree. It does not select a release candidate, authorize staging
or production deployment, activate a provider, use credentials, apply or
restore a migration, rotate a secret, approve production readiness, or approve
go-live.

## 1. Evidence identity

| Evidence | Result | Limit |
| --- | --- | --- |
| Current `origin/main` | `f43eea6bd633b4250180e4373a62e5fb21fe14fa` | Point-in-time remote observation; DR-001 remains open |
| Git tree | `6d2154bd52785bbc749345c0346651f9752d1646` | Source-tree identity, not a published artifact identity |
| Merge parents | `cccc1e8c06abf1eba57854166c01598bd8db2246`, `0b23419a5a0fe46b7dbc8459032213c741c60fbc` | Git ancestry only |
| Merge | PR #186, merged at `2026-08-06T06:13:47Z` | Merge and CI do not prove external environment behavior |
| PR #186 tree comparison | Merge tree is identical to head `0b23419a5a0fe46b7dbc8459032213c741c60fbc` | CI remains attributable to the PR head, not a separately executed merge-SHA workflow |
| Worktree divergence | `origin/main...HEAD = 0/0` before this packet | Does not prove staging or production state |
| Working tree | Clean before this packet; generated `node_modules` and `build` are ignored | Does not prove an external release workspace is clean |

The user-provided baseline `c7452b8` is stale relative to this fetched
observation. This packet records freshness only and does not select
`f43eea6` as the release candidate.

## 2. Authority and operational boundary

The packet was prepared using the canonical authority order and the G4
routing contract:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. `ADR-001`, `ADR-002`, `ADR-003`, and `DEC-OBS-001`;
5. `doc/PRODUCTION_DEPLOYMENT.md`;
6. `doc/ROLLOUT_AND_HANDOVER_RUNBOOK.md`;
7. `doc/MIGRATION_BACKUP_RESTORE_RUNBOOK.md`; and
8. current workflows, manifests, source, and tests.

The runbooks are procedural authority only. DR-001 and DR-011 through DR-015
remain open or separately gated. A successful build, test, merge, or local
artifact hash does not authorize deployment, provider activation, migration,
production readiness, or go-live.

## 3. Reproducible inputs and CI evidence

### Toolchain and dependency installation

| Input | Local observation |
| --- | --- |
| Python | `3.14.3` |
| Node | `v24.14.0` |
| npm | `11.18.0` |
| Frontend install | `npm ci` completed in approximately 3 minutes; 1,481 packages added |
| Dependency audit during install | 36 vulnerabilities reported: 12 low, 6 moderate, 18 high |
| Release manifests | `frontend/package-lock.json` remains the install lock; package metadata declares Yarn `1.22.22` while CI uses npm |

The install warning and vulnerability report are recorded, not silently
waived. `npm run audit:production` passed its repository-specific check with
two exact React Router RSC-only advisory entries accepted for this
BrowserRouter SPA. DR-013 remains open for the supported package-manager,
release, vulnerability, license, review, and versioning policy.

### Merge-tree CI

PR #186 workflow run
[`31076202482`](https://github.com/batakers/Niuva/actions/runs/31076202482)
passed its backend, frontend, secret-scan, and CodeRabbit checks at head
`0b23419`. Because the merge tree is identical to that PR head, this is
path-preserving source/CI evidence for `f43eea6`; it is not claimed as a
separate workflow execution on the merge commit.

No external smoke, Admin E2E, staging health, real-role browser run,
backup/restore exercise, artifact publication, deployment, or go-live check
was run.

## 4. Local build and artifact observation

The following was run in the isolated worktree with no public origin or
credential values:

```powershell
Set-Location frontend
$env:CI = 'true'
$env:REACT_APP_PUBLIC_SITE_URL = ''
$env:REACT_APP_BACKEND_URL = ''
npm ci
npm run build
npm run test:bundle
npm run test:release-contracts
npm run measure:bundle
```

The production compilation succeeded. Release-file generation correctly
skipped `sitemap.xml` because no approved public origin was supplied. The
report-only bundle measurement produced:

| Measurement | Local result |
| --- | ---: |
| Total JavaScript gzip | `581.37 kB` |
| Entry JavaScript gzip | `203.21 kB` |
| Largest async JavaScript gzip | `100.14 kB` |
| Bundle tests | `5 passed` |
| Release-contract tests | `6 passed` |
| Production dependency audit | Passed with the exact repository waiver described above |

The enforcing command `npm run check:bundle` failed closed because all three
approved budget inputs were absent:
`BUNDLE_TOTAL_GZIP_BUDGET`, `BUNDLE_ENTRY_GZIP_BUDGET`, and
`BUNDLE_ASYNC_GZIP_BUDGET`. No numeric budget is invented by this packet.

The locally generated artifact was inventoried for evidence only:

| Artifact evidence | Result |
| --- | --- |
| File count | `102` |
| Total bytes | `2,473,848` |
| Manifest SHA-256 | `c7b84cccfcd65d19795f6d583b879aafc6603e7bb0522e98360e507091e72f35` |
| `index.html` | `4,260` bytes; SHA-256 `95fbfb4973bbf834451d4c1cbe8b8f4b3ab7f831fffbe3caa767f4cf68b01b9f` |
| `robots.txt` | `25` bytes; SHA-256 `1cbdbc6504be7abe1267d01d7f565bfcfe5851ba3f6a3754d1d61c8f8a2c6aa3` |
| `sitemap.xml` | Absent by design because the public origin was not configured |
| Main JavaScript bundle | `main.2c77851b.js`, `652,857` bytes; SHA-256 `c2b262df2b0225e71ea38c2f03d0b5e73deb113f74159af5d4d424a60adc6b20` |

This is a reproducible local observation, not an immutable release artifact.
No registry digest, attestation, release tag, hosting revision, or
previous-known-good deployed artifact is present in the repository. The local
hash must not be used as deployment identity until an approved release process
publishes and retains that artifact.

## 5. Health, environment, and rollback limits

The current source and runbooks provide these bounded contracts:

- `/api/health/live` is process liveness only.
- `/api/health/ready` reports bounded database, transaction, schema/index,
  worker, email, and authentication-security-event readiness as configured.
- `scripts/staging_smoke.py` and the manual external workflows are source-level
  contracts; no approved target URL, credential set, or environment owner was
  supplied for execution.
- Retail checkout, payment, production storage/upload, provider activation,
  migration execution, and production topology remain inactive or separately
  gated.
- Application rollback must redeploy a captured immutable previous artifact;
  rebuilding during rollback is not equivalent evidence. Database restore is a
  separate approved exercise and must not be inferred from an application
  rollback.

No value from `.env.example`, a secret store, a database, or an external
environment was copied into this packet.

| Area | Current evidence | Stop condition before staging/production |
| --- | --- | --- |
| Source/build | Exact current tree, passed PR #186 CI, local build and hashes | Owner-selected SHA, artifact publication/attestation, exact origin and release record |
| Bundle policy | Report-only measurement; enforcement failed closed without budgets | DR-013-approved budgets and passing enforcement run |
| Database/transactions | Repository and path-preserving CI evidence | Approved persistent replica-set topology, readiness, monitoring, backup/restore, and independent review |
| Browser/roles | Hermetic CI only; no real target or seeded credentials | Approved staging URL, real role matrix, accessibility review, and exact artifact SHA |
| Observability | Provider-neutral sandbox contract and source controls | Named destination/access/retention, SLO evidence, alert route, and accountable owner |
| Rollback/recovery | Procedure and local artifact hash only | Previous-known-good immutable artifact, redeploy rehearsal, restore comparison, and custody evidence |
| Candidate | DR-001 still open | Project Owner selection, scope, verifier, effective time, exclusions, and accepted risks |

Every missing item is a stop condition, not an invitation to infer a provider,
threshold, secret, owner, or production policy.

## 6. Handover

### Changed

- `docs/implementation/production-readiness/phases/G4-CURRENT-MAIN-ARTIFACT-ROLLBACK-REVALIDATION-2026-08-06.md`

### Intentionally unchanged

- all backend/frontend source and tests, dependencies, lockfiles, and
  workflows;
- deployment configuration, environment files, migrations, database data,
  providers, credentials, secrets, and external environments;
- canonical specifications, decision registers, ADRs, and runbooks;
- the historical G4 packet and G4 task card;
- PR #185 and open PRs #187–#193; no PR was merged or modified;
- the primary dirty worktree at `C:\Portfolio\Niuva\Niuva-main-latest`.

### Verification, risk, and rollback

- Local `npm ci`, production compilation, bundle measurement, bundle tests,
  release-contract tests, and production dependency audit: passed as recorded;
- bundle enforcement: intentionally failed closed because approved budget
  values are absent;
- `git diff --check`, documentation lint, exact staged-path verification, and
  staged secret scan: required before publication;
- external smoke/Admin E2E, staging, role/accessibility, artifact registry,
  backup/restore, migration, deployment, monitoring/load, and go-live:
  not run because target, credentials, owners, or approvals are absent.

This packet changes no runtime, data, dependency, or environment state. Its
rollback is a normal documentation revert. The principal risks are evidence
staleness, absent release policy, local/CI artifact non-identity, dependency
vulnerabilities, and unverified external operations.

### External actions still requiring approval

Project Owner selection of DR-001; DR-002 incident verification/disposition;
DR-011 provider/Finance scope; DR-012 topology, recovery, release, and on-call
ownership; DR-013 toolchain and bundle policy; DR-014 operational evidence;
independent security/release review; immutable artifact publication and
attestation; backup/restore rehearsal; migration execution; provider
activation; secret use or rotation; deployment; production-readiness approval;
and go-live remain outside this packet.

<!-- markdownlint-enable MD013 MD060 -->
