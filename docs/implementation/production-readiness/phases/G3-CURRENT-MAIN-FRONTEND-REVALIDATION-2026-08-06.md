# G3 — Current-main Frontend and Browser Revalidation

<!-- markdownlint-disable MD013 MD060 -->

**Status:** `REVALIDATED / BOUNDED HERMETIC GATE PASSED`. External role,
staging, manual assistive-technology, release-artifact, and go-live gates
remain open.

**Observed baseline:** `origin/main` at
`d4bf4ac0e9454ad09e57856cfebbfa70b9a93294`, with Git tree
`9b1abc0c006342d5e4a63765075a7c8fca7e8897`, after a fresh fetch on 6 August
2026.

**Branch/worktree:** `codex/g35-g3-current-main-revalidation-20260806` /
`C:\tmp\niuva-g35-g3-current-main-revalidation-20260806`.

This is a documentation-only G3 handover. It records current-source
revalidation and does not authorize new runtime changes, provider activation,
deployment, migration, secret use, production-readiness approval, or go-live.

## 1. Authority and scope

The applicable authority order is:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. `docs/decisions/architecture/ADR-004-surface-boundary-topology.md`;
5. the approved UX/access decisions and
   `docs/implementation/production-readiness/phases/G3-BROWSER-EVIDENCE-SOURCE-GATE-2026-08-06-task-card.md`;
6. `doc/BROWSER_VERIFICATION_RUNBOOK.md`; and
7. current frontend source, tests, workflows, and CI evidence.

The historical G3 packet at `5254641c` recorded two residual findings: a
mobile 375px focus assertion failure and a Windows `npm.cmd` audit-runner
`EINVAL`. PR #172 subsequently changed the bounded frontend release contract,
including `Navbar.jsx` and `audit-production-dependencies.js`. This packet
revalidates those paths at the current runtime tree; it does not modify them.

## 2. Exact provenance

| Evidence | Result | Limit |
| --- | --- | --- |
| Current `origin/main` | `d4bf4ac0e9454ad09e57856cfebbfa70b9a93294` | Point-in-time source identity; DR-001 remains unselected |
| Git tree | `9b1abc0c006342d5e4a63765075a7c8fca7e8897` | Source tree identity, not an artifact digest |
| First parent | `b1564b082208d55df869e94163eb2eaa3f61ee35` | PR #173 documentation predecessor |
| Second parent | `de60bfad54ef22da3bf67ca1f5c427c58aa1dfdc` | G4 packet head; documentation only |
| `b1564b0..d4bf4ac` changed paths | `docs/implementation/production-readiness/phases/G4-CURRENT-MAIN-ARTIFACT-ROLLBACK-EVIDENCE-2026-08-06.md` only | Confirms no frontend source changed in the latest merge |
| Worktree divergence before packet | `origin/main...HEAD = 0/0` | Does not prove external environment state |

PR #172's source commit `2cd19a9baf03ce44884eab8fad78efaf81c50cf3` is in the
first-parent runtime lineage through merge `b1564b0`. Its frontend tree is
unchanged by the documentation-only PR #173 merge. The current revalidation
therefore covers the source paths that were previously reported as residual.

## 3. Source changes being revalidated

No source changes are made by this packet. The current source contains the
following already-merged bounded changes from PR #172:

- `frontend/src/components/layout/Navbar.jsx` moves initial mobile-menu focus
  into an `open` state effect, retries at a bounded 16ms interval, stops after
  30 attempts, and cleans up timers; Escape still restores focus to the menu
  button;
- `frontend/scripts/audit-production-dependencies.js` invokes `cmd.exe` with a
  complete `npm.cmd audit --omit=dev --json` command on Windows and removes
  `npm_config_allow_scripts` from the child environment;
- `frontend/package.json` records npm `11.18.0` as the package-manager
  contract and adds release-contract tests and report-only bundle output.

The exact advisory allowance remains narrow: only the React Router RSC
advisory `GHSA-qwww-vcr4-c8h2` for `react-router` and `react-router-dom` is
accepted for this client-only BrowserRouter application. This packet does not
broaden that allowance or make a dependency/security decision.

## 4. Revalidation evidence

### Local bounded checks

The isolated worktree used Python/Node tooling already available in the
repository's adjacent clean PR #172-equivalent frontend worktree. A fresh
local `npm ci` was not claimed; the dependency tree was reused only to run
read-only verification. No source or tracked dependency file was modified.

| Command | Result | Interpretation |
| --- | --- | --- |
| `npm run audit:production` | Passed: two exact RSC-only React Router advisory entries accepted | The former Windows `EINVAL` runner failure is closed for this toolchain; the narrow waiver remains explicit |
| `npm run test:release-contracts` | **5 passed, 0 failed** | Public/backend origin validation and release-file contract tests pass |
| `npm run test:bundle` | **5 passed, 0 failed** | Bundle report/gate behavior is covered; approved budget values are still absent |

The browser command was run with the repository's no-retry, one-worker
configuration:

```powershell
$env:PLAYWRIGHT_START_SERVER = 'true'
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:3100'
$env:REACT_APP_BACKEND_URL = 'http://127.0.0.1:3100'
$env:PORT = '3100'
npx playwright test e2e/design-system-integration.spec.js --reporter=line
```

Result: **4 passed in 1.2 minutes** across `mobile`, `tablet`, `laptop`, and
`desktop`. The current suite verified the public navigation contract, mobile
menu focus, Escape focus restoration, overflow, and Axe WCAG checks. No retry
was used as evidence.

### CI evidence

PR #172 workflow run
[`31059540675`](https://github.com/batakers/Niuva/actions/runs/31059540675)
passed at the source tree that is unchanged by PR #173:

- frontend job `92484240976`: `62` suites and `376` tests passed and the
  production build compiled successfully;
- hermetic Retail discovery: four cases passed across mobile and desktop;
- hermetic Admin session cross-tab: one desktop case passed;
- secret-scan job `92484240912`: passed.

The dedicated design-system suite above was run locally because that suite is
not one of the two focused suites invoked by the current quality workflow.
The CI evidence and local run are complementary; neither is external staging
or real-role evidence.

## 5. G3 verdict and remaining limits

| Gate | Current result | Verdict |
| --- | --- | --- |
| Mobile focus timing at 375px | Passed in the four-project design-system run | `PASS` for bounded hermetic source evidence |
| Tablet/laptop/desktop navigation and focus | Passed | `PASS` for bounded hermetic source evidence |
| Axe WCAG scan in the suite | Passed with no reported violations | `PASS` for this deterministic page state |
| Windows production dependency audit runner | Passed with the exact two-entry allowance | `PASS` for the approved narrow policy |
| Frontend Jest/build/CI contracts | PR #172 passed; source unchanged by PR #173 | `PASS` for repository CI evidence |
| Bundle enforcement | Tests pass, but budget environment variables are not approved/configured | `BLOCKED_BY_POLICY` |
| Real Admin/customer role accounts | No approved accounts or target | `NOT_RUN` |
| External origin/TLS/proxy/CORS/cookie and direct-refresh behavior | No approved staging origin | `NOT_RUN` |
| Manual screen-reader/real-device review | Not performed | `NOT_RUN` |
| Immutable published artifact and rollback | Not evidenced by G3 | `OUT_OF_SCOPE / G4-G5` |

The two historical G3 residual findings are therefore closed for the bounded
hermetic source/browser gate. This does not make the frontend production-ready
by itself: external topology, real-role verification, manual assistive-
technology review, artifact identity, bundle policy, staging, and go-live
remain separate gates.

## 6. Handover

### Changed

- `docs/implementation/production-readiness/phases/G3-CURRENT-MAIN-FRONTEND-REVALIDATION-2026-08-06.md`

### Intentionally unchanged

- `frontend/src/components/layout/Navbar.jsx`;
- `frontend/scripts/audit-production-dependencies.js`;
- `frontend/package.json`, `frontend/package-lock.json`, and all dependencies;
- all frontend E2E files and workflows;
- all backend source/tests, migrations, providers, deployment configuration,
  credentials, secrets, and environment state;
- canonical specifications, decisions, ADRs, runbooks, `DECISIONS_REQUIRED.md`,
  and existing G0–G5 packets;
- staging/production environments and external targets.

### Risk and rollback

This packet changes no runtime, data, dependency, or environment state. Its
rollback is a normal documentation revert. The local dependency reuse means a
future release candidate must still perform the clean-install CI contract and
capture an immutable artifact identity.

### External actions still requiring approval

Project Owner DR-001 selection, approved bundle-budget values, real-role and
external-origin browser verification, independent accessibility review,
artifact publication/attestation, staging access, backup/restore, migration,
provider activation, secret use/rotation, deployment, production-readiness
approval, and go-live.

<!-- markdownlint-enable MD013 MD060 -->
