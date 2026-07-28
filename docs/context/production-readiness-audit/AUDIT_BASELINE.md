# Niuva Production-Readiness Audit Baseline

Status: Context Only — Audit Evidence and Progress Tracker — Not Implementation Authority

Baseline captured: 2026-07-28 01:53:32 WIB (UTC+07:00)
Baseline SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
Baseline kind: Active branch HEAD plus explicitly recorded pre-existing dirty
working-tree state

## 1. Repository identity and Git state

| Item | Recorded value |
| --- | --- |
| Repository | Local workspace for `batakers/Niuva` |
| Active branch | `feat/marketing-redesign-dec-ux-002` |
| `git rev-parse HEAD` | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Local `git rev-parse origin/main` | `fd299cd0ff03f056f91a911e7fec56ea3f0092de` |
| HEAD versus local `origin/main` | 1 commit ahead, 3 commits behind |
| Remote freshness | Unknown; no fetch was run |
| Automatic synchronization | Not performed |
| Historical tracker baseline availability | `0b0b556` exists locally and is an ancestor of HEAD |

The audit snapshot is the current branch HEAD, not the newer local
`origin/main` reference. Findings created later must use the SHA actually
inspected and must not imply that the missing three `origin/main` commits were
examined.

## 2. Pre-existing working-tree state

Before this audit directory was created:

```text
 M docs/implementation/specs/active/2026-07-27-admin-auth-phase-1-implementation-authorization-packet.md
?? .coverage
```

The tracked diff changes only Markdown table delimiter spacing. It does not
change the recorded authorization text. The `.coverage` file was not opened,
deleted, overwritten, or treated as verified test evidence.

These pre-existing items belong to the user and must remain preserved. Audit
documents created under this directory are additional untracked files until
the user decides how to manage them.

## 3. Change since historical backend tracker

Historical tracker:
`docs/context/BACKEND_AUDIT_TRACKER_2026-07-24.md`

| Item | Recorded value |
| --- | --- |
| Tracker date | 24 July 2026 |
| Tracker state baseline | `main` / `origin/main` at `0b0b556` |
| Tested backend baseline | `7505b48` |
| Current baseline | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Changed paths from `0b0b556` to current HEAD | 236 |
| Changed paths under `backend/` | 75 |
| Changed paths under `frontend/` | 118 |
| Changed governing/documentation paths | 34 |

The old tracker remains relevant as historical finding provenance, but its
executive status, verification counts, resolved/open statuses, and readiness
conclusions are not current. Its current audit status is
`requires_revalidation`.

### Preliminary finding reconciliation

This table is a routing aid, not a deep re-audit:

| Historical area | Current change evidence | Initial classification |
| --- | --- | --- |
| BA-001 Git divergence | Current branch is again divergent from local `origin/main` and the worktree was already dirty | Old resolution is historical; current baseline condition is newly recorded |
| BA-002/BA-003 granular roles and operational access | `backend/permissions.py:4-13` now defines granular role labels; related source/tests and DEC-ACCESS authority changed | `requires_revalidation` |
| BA-004 framework security upgrade | `backend/requirements.txt:1-2` now pins FastAPI `0.139.2` and Starlette `1.3.1`; installed global versions match | Old `approved_not_started` status appears stale; dynamic/security verification still required |
| BA-005 NIV-001 | `docs/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md:13` still says `Implemented, verification pending` | Appears still open; closure evidence remains unverified |
| BA-006 legacy manual transfer | `backend/server.py:630-648` exposes a disabled compatibility response; payment source/tests changed | `requires_revalidation` |
| BA-007 order integrity | Retail aggregate, routes, services, migrations, and tests changed | `requires_revalidation` |
| BA-008 file boundary | Storage routes/tests and governing storage documents changed | `requires_revalidation` |
| BA-009 transaction/audit adoption | Transaction integration tests and several domain services changed | `requires_revalidation` |
| BA-010 authentication/input hardening | Auth issuance, recovery code/tests, and DEC-AUTH records changed | `requires_revalidation` |
| BA-011 structured CMS | `backend/content_domain.py:90-98` and `backend/content_service.py:123-164` now contain a structured lifecycle and version/rollback paths | Old `open` status appears stale; behavior, authorization, migration, and tests still require revalidation |
| BA-012 notifications/readiness | Notification domains/services/tests and operational surfaces changed | `requires_revalidation` |
| BA-013 quality/test reporting | Source, tests, dependencies, CI-related evidence, Python, Node, and Docker availability changed | Historical counts are stale; full current verification is unverified |

No old finding is marked `resolved` by this initialization.

## 4. Other historical audit and report reconciliation

| Artifact | Authority and recorded baseline | Scope | Change/relevance check | Current treatment |
| --- | --- | --- | --- | --- |
| `docs/references/brand/BRAND_WEBSITE_AUDIT.md` | Supporting Reference in the Document Register; source date 12 Jul 2026; declares implementation baseline `03c4e63`, which is unavailable locally | Public Home, About, Capabilities, Projects, and Contact | Exact declared-baseline diff cannot be reproduced. The file was later archived in commit `35d0dc7`; 122 frontend and 20 governance paths changed from that commit to current HEAD | Historical analysis only; scores and findings `requires_revalidation` under current DEC-UX authority and source |
| `docs/archive/implementation-history/test_result.md` | Context Only archive; no repository SHA and no populated current test state | Legacy agent-to-testing-agent protocol template | Does not contain a reproducible current result; source/tests changed broadly | `stale` workflow history and `unverified` as test evidence |
| `test_reports/pytest/pytest_results.xml` | Generated report with no repository SHA; timestamp 2026-06-28 14:35:41 UTC; 31 tests, 1 failure, 0 skipped | Legacy pytest execution | Since its tracked commit, 105 backend paths and 238 test/frontend-related paths changed | `stale` and `unverified`; not a current failure count or pass gate |
| Pre-existing `.coverage` | Untracked; baseline, command, environment, and timestamp not established | Unknown | Not opened or interpreted | Unverified generated artifact; preserve and exclude |

The brand audit's internal `Phase 0.1 audit` label and archived footer do not
upgrade it above the Document Register. The stricter safe interpretation is
historical Supporting Reference only.

## 5. Operating system and runtime tooling

| Tool or platform | Detected state |
| --- | --- |
| Operating system | Microsoft Windows `10.0.26200`, x64 |
| Node.js | `v24.14.0` |
| npm | `11.18.0` |
| pnpm | Not available |
| Yarn CLI | Not available |
| Python | `3.14.3` |
| Python launcher | `3.14.3` |
| pip | `26.1.2` for Python 3.14 |
| Mongo shell (`mongosh`) | Not available |
| Docker CLI | `29.5.2` |
| Docker Compose | `v5.1.4` |
| Docker daemon | Available; server `29.5.2` |

## 6. Package-manager and dependency baseline

Detected manifests:

- `frontend/package.json`
- `frontend/package-lock.json`
- `backend/requirements.txt`
- `backend/pytest.ini`
- `frontend/playwright.config.js`
- `docker-compose.transaction.yml`
- `docker-compose.transaction-test.yml`

Observed package-manager conflict:

- `frontend/package.json:117` declares Yarn `1.22.22`;
- `frontend/package-lock.json` exists;
- `doc/PRODUCTION_DEPLOYMENT.md:28` requires `npm ci`;
- npm is installed, while the Yarn CLI is not.

No package manager or lockfile is selected by this audit. Layer 10 must
determine the reproducible supported path from approved repository authority
and current CI/build behavior.

Local dependency availability:

| Dependency state | Result |
| --- | --- |
| `frontend/node_modules` | Available |
| Existing `frontend/build` | Available; not treated as a fresh build |
| `backend/.venv` | Not available |
| Root `.venv` | Not available |
| Global Python packages | Available for key backend packages |

Selected installed global Python versions:

- FastAPI `0.139.2`
- Starlette `1.3.1`
- Pydantic `2.12.5`
- PyMongo `4.6.3`
- pytest `9.0.2`
- pytest-xdist `3.8.0`

The global environment is not a locked backend virtual environment and is not
automatically representative of CI, staging, or production.

## 7. Integration and browser-test capability

| Capability | State at baseline |
| --- | --- |
| Transaction test Compose file | Available |
| Docker daemon | Available |
| `MONGO_TRANSACTION_TEST_URL` | Not configured |
| Playwright package/CLI | Available, version `1.62.0` |
| Chromium executable | Available |
| Firefox executable | Not installed |
| WebKit executable | Not installed |
| `PLAYWRIGHT_BASE_URL` | Not configured |
| Frontend listener on port 3000 | Not detected |
| Backend listener on port 8000 | Detected, identity/version not verified |
| Browser configuration behavior | Defaults to `http://localhost:3000` and does not start a server |

Interpretation:

- Isolated MongoDB integration testing appears technically possible because
  Docker and the tracked test topology are available, but it was not started
  during initialization.
- Chromium browser testing appears technically possible after starting and
  verifying the required application services.
- Cross-browser evidence is currently incomplete because Firefox and WebKit
  executables are absent.
- No integration or browser pass is claimed.

## 8. Canonical and procedural sources reviewed

Reviewed in order:

1. `AGENTS.md` — Active Guardrail
2. `docs/NIUVA_MASTER_SPEC.md` — Approved Canonical
3. `docs/context/DOCUMENT_REGISTER.md` — Approved Canonical
4. `docs/decisions/DECISION_REGISTER.md` — Approved Canonical
5. `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md` —
   Approved Baseline
6. `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`
   — Approved with Open Decisions
7. `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`
   — Approved with Open Decisions
8. `doc/PRODUCTION_DEPLOYMENT.md` — Runbook
9. `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md` — Runbook
10. `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md` — Runbook
11. `doc/TRANSACTION_CAPABILITY_RUNBOOK.md` — Runbook, development/CI scope
12. `docs/context/BACKEND_AUDIT_TRACKER_2026-07-24.md` — Context Only
13. Current manifest, selected source, tests/configuration paths, Git history,
    and worktree diff as implementation evidence

The Decision Register was used to classify DEC-ACCESS and DEC-AUTH records.
Their detailed application belongs to the applicable layer audit.

## 9. Initial authority conflicts and open gates

| ID | Observation | Classification and consequence |
| --- | --- | --- |
| `BASE-001` | Historical backend tracker predates broad backend, frontend, test, dependency, and governance changes | Context is useful, but every current conclusion requires revalidation |
| `BASE-002` | `packageManager` says Yarn while the tracked lockfile and deployment runbook use npm, and Yarn is unavailable | Reproducible package-manager authority is unresolved; route to Layer 10 |
| `BASE-003` | `doc/TRANSACTION_CAPABILITY_RUNBOOK.md:6` references `doc/decisions/ADR-001-mongodb-transaction-capability.md`, while the canonical ADR is under `docs/decisions/architecture/` | Broken procedural reference; do not infer a different ADR |
| `BASE-004` | NIV-001 remains `Implemented, verification pending` | No production-ready or incident-closed claim is permitted from current repository evidence |
| `BASE-005` | Storage provider, payment gateway, Finance operations, several policies, staging/production topology, production readiness, and go-live remain open | Audit may identify blockers but must not choose or activate them |
| `BASE-006` | Current HEAD is behind local `origin/main`, whose freshness is itself unverified | Audit claims must remain tied to `c28684d`; no automatic synchronization |
| `BASE-007` | Brand audit declares baseline `03c4e63`, but that object is unavailable locally and newer DEC-UX/governance plus frontend source exist | Historical brand score cannot be reproduced or treated as current |
| `BASE-008` | Archived test protocol and generated XML have no repository SHA; XML records one historical failure | Neither artifact is current QA evidence |

## 10. Environment limitations

- Shell execution required approved unsandboxed read-only commands because the
  Windows sandbox rejected process creation.
- No network fetch was performed, so the local remote-tracking ref may be
  stale.
- No clean backend virtual environment was present.
- Python `3.14.3` may differ from the project's intended CI/runtime; that
  support boundary remains unverified.
- Only Chromium is locally runnable through Playwright.
- The frontend test server was not running.
- A process listened on port 8000, but it was not assumed to be the correct
  Niuva backend.
- MongoDB integration topology was not started and no real transaction tests
  were executed.
- Existing build and `.coverage` artifacts were not accepted as current
  evidence.
- Production configuration, infrastructure, providers, data, backup/restore,
  monitoring, owners, and incident evidence were not accessed.

## 11. Commands executed

Representative read-only commands:

```powershell
Get-Content -Raw -LiteralPath <canonical-document>
rg --files -g '*AUDIT*' -g '*audit*' -g '*readiness*'
rg -l -i --glob '*.md' '(audit tracker|production[- ]readiness|audit report)'
git branch --show-current
git rev-parse HEAD
git rev-parse --verify origin/main
git rev-list --left-right --count HEAD...origin/main
git status --short --branch
git diff --name-status 0b0b556..HEAD
git log --format=<redacted-format> 0b0b556..HEAD
node --version
npm --version
python --version
pip --version
docker --version
docker compose version
docker info --format <server-version-only>
```

Targeted `rg -n` probes were used only to establish that historical finding
areas changed. No deep finding validation was performed.

## 12. Baseline conclusion

The audit documentation can be initialized safely, but the repository cannot
be assigned a current readiness score from this baseline alone. The historical
backend audit is materially stale as a current-state report, integration and
browser verification require setup, and explicit production decisions remain
open.

No source code, test, configuration, migration, secret, dependency, canonical
document, or existing tracker was changed during baseline capture.

## 13. Changelog

### 2026-07-28 — Initial baseline

- Recorded Git, worktree, runtime, dependency, Docker, integration, and browser
  capability.
- Reconciled the historical backend tracker, brand audit, archived testing
  protocol, generated pytest XML, and pre-existing coverage artifact.
- Recorded initial conflicts and open production gates.
- Assigned no readiness score.
