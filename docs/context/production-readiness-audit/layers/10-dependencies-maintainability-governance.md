# Layer 10 — Dependencies, Maintainability, and Governance

Status: Context Only — Audit Evidence and Progress Tracker — Not Implementation Authority

## 1. Audit state

| Field | Value |
|---|---|
| Finding prefix | `GOV` |
| Audit status | `complete` |
| Audit completion | 100% of applicable checklist examined; unresolved blockers are recorded as findings |
| Readiness score | 38/100 — basic controls exist, but reproducibility, vulnerable/deprecated tooling, and governance gaps cap release readiness |
| Confidence | 81% — current source/manifest/CI evidence plus official registry checks; clean Yarn install, isolated Python environment, remote freshness, and legal review were not available |
| Recorded P0/P1 | 0 / 6 |
| Baseline SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Last verified | 2026-07-28 03:30 WIB (UTC+07:00) |
| Worktree boundary | Only this layer, `AUDIT_PROGRESS.md`, and `AUDIT_INDEX.md` are intended audit outputs; pre-existing auth change and `.coverage` were preserved |

This is an evidence report, not implementation authorization. No dependency,
source, canonical authority, lockfile, branch, or generated artifact was
changed.

## 2. Authority and method

Reviewed in the repository-required order:

- `AGENTS.md`
- `docs/NIUVA_MASTER_SPEC.md`
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- applicable ADRs/runbooks, especially `doc/PRODUCTION_DEPLOYMENT.md`,
  `doc/TRANSACTION_CAPABILITY_RUNBOOK.md`,
  `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md`, and
  `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md`
- current manifests, lockfile, source, tests, CI, and implementation plans

Commands and checks included:

- `rg --files`, Git status/branch/history/path probes
- manifest/lockfile and package-manager inventory
- `npm ls --package-lock-only --all --json`
- `npm ci --dry-run --ignore-scripts --no-audit --no-fund`
- `npm audit --package-lock-only` and `npm audit --package-lock-only --omit=dev`
- `npm outdated --json`
- direct-import heuristics for frontend and backend
- Python `pip check`, `pip install --dry-run --ignore-installed --report`
  against `backend/requirements.txt`, and PyPI JSON metadata/advisory queries
- license/deprecation markers from `frontend/package-lock.json` and resolver metadata
- endpoint/route, file-size, duplicate-window, duplicate-hash, generated-artifact,
  migration-reference, and Markdown-link probes
- authority/register/plan/status/review/ownership/release-traceability searches

### External freshness check

Checked 2026-07-28 (UTC+07:00) against first-party sources:

- React officially deprecated Create React App and placed it in maintenance mode:
  [Sunsetting Create React App](https://react.dev/blog/2025/02/14/sunsetting-create-react-app).
- CRACO documents that the current line requires CRA 5 and warns that custom
  configuration means the project owns the config and receives no CRA support:
  [CRACO getting started](https://craco.js.org/docs/getting-started/) and
  [CRACO overview](https://craco.js.org/docs/).
- MongoDB documents Motor deprecation and recommends PyMongo Async:
  [Migrate to PyMongo Async](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/reference/migration/).
- Node's official release table lists Node 22 and 24 as LTS on the audit date:
  [Node.js releases](https://nodejs.org/en/about/previous-releases).
- npm's official manifest documentation defines `overrides`; Yarn's manifest
  documentation defines `resolutions` and `packageManager`:
  [npm package.json](https://docs.npmjs.com/cli/configuring-npm/package-json/) and
  [Yarn manifest](https://yarnpkg.com/configuration/manifest).
- Package versions, Python classifiers, and PyPI vulnerability metadata were
  queried from the official PyPI JSON API. This returned no advisory objects for
  the 70-package dry-run resolution; it is not equivalent to a locked,
  production SBOM or a `pip-audit` run.

## 3. Dependency inventory and results

### JavaScript

| Scope | Evidence |
|---|---|
| Direct runtime dependencies | 28 in `frontend/package.json:5-33` |
| Direct development dependencies | 19 in `frontend/package.json:53-72` |
| Lockfile | npm `lockfileVersion: 3` at `frontend/package-lock.json:1-6` |
| Resolved graph | 1,483 package entries; npm reports 227 prod, 1,254 dev, 3 optional, 8 peer |
| Package-manager declaration | `yarn@1.22.22` in `frontend/package.json:117` |
| CI/deployment installer | `npm ci` in `.github/workflows/quality-gates.yml:43-49` and `doc/PRODUCTION_DEPLOYMENT.md:25-30` |
| Local tool result | Yarn unavailable; npm 11.18.0 and Node 24.14.0 available |

The lockfile root mirrors the manifest, and `npm ci --dry-run` completes, but
the dry run emits an ESLint peer override warning. The `resolutions` field is
Yarn-specific; it is not a substitute for npm `overrides`. Representative
declared-vs-lock mismatches include `fast-uri` 3.1.2 vs 3.1.3,
`qs` 6.15.2 vs 6.15.3, `underscore` 1.13.8 vs 1.13.6,
`shell-quote` 1.8.4 vs 1.9.0, `nth-check` 2.0.1 vs 2.1.1,
`serialize-javascript` 7.0.5 vs 6.0.2, `uuid` 11.1.1 vs 8.3.2,
`webpack-dev-server` 5.2.4 vs 4.15.2, and `resolve-url-loader` 5.0.0 vs
4.0.0. The current lock remains installable; the enforcement contract is not
portable across the declared and executed package managers.

`npm audit --package-lock-only` on 2026-07-28 reported 36 findings
(18 high, 6 moderate, 12 low; 0 critical). With `--omit=dev`, it still
reported 3 high findings: PostCSS advisories `GHSA-6g55-p6wh-862q` and
`GHSA-r28c-9q8g-f849`, and React Router advisory
`GHSA-qwww-vcr4-c8h2`. The PostCSS path is build/toolchain exposure; the
React Router advisory concerns RSC mode, which was not observed in this CRA
client. Applicability must be decided and recorded; the scan result must not be
silently treated as resolved.

The lock contains deprecated transitive markers (including obsolete Babel
proposal plugins, old `glob`, `rollup-plugin-terser`, old SVGO/workbox pieces,
and `uuid` versions below 11). `npm outdated` also shows many direct packages
behind their registry latest versions. No upgrade was performed.

### Python

`backend/requirements.txt:1-29` contains 29 direct entries in one file:
6 exact pins, 22 lower bounds, and one bounded range (`httpx>=0.27.0,<1.0`).
There is no requirements lock/constraints file or generated SBOM. A dry
resolver on Python 3.14.3 selected 70 packages (29 requested, 41
transitive), and `pip check` reported no broken requirements in the available
global environment. The resolver is a freshness snapshot, not evidence that
the unpinned graph used by every environment is identical.

Selected exact pins versus PyPI latest on the audit date:

| Package | Repository pin | PyPI latest | Lifecycle/compatibility note |
|---|---:|---:|---|
| FastAPI | 0.139.2 | 0.140.7 | Python 3.14 classifier present |
| Starlette | 1.3.1 | 1.3.1 | Alpha classifier; compatibility matrix still required by the active design |
| Uvicorn | 0.25.0 | 0.51.0 | Exact pin is materially stale |
| PyMongo | 4.6.3 | 4.17.0 | Exact pin is materially stale |
| bcrypt | 4.1.3 | 5.0.0 | Exact pin is materially stale |
| Motor | 3.3.1 | 3.7.1 | MongoDB deprecation notice applies |

PyPI classifiers for the pinned FastAPI and Starlette releases include Python
3.14; the pinned Uvicorn, PyMongo, bcrypt, and Motor releases advertise only
through Python 3.12. This is not proof of failure, but it is a support-evidence
gap against CI's Python 3.14.3.

### Static dependency hygiene

Frontend direct-import probing found no source import for
`date-fns`, `dayjs`, `framer-motion`, `lodash`, or `zod`; these are candidates
for unused-dependency review, not automatic removal. `date-fns` and `dayjs`
are duplicate-purpose date libraries; `framer-motion`, GSAP, and
`@gsap/react` overlap as motion/tooling choices.

Backend import probing found no direct import for several entries, including
`boto3`, `requests-oauthlib`, `cryptography`, `passlib`, `pandas`, `numpy`,
`jq`, `typer`, and the formatter/type-checker tools. Some packages can be
runtime plugins or CLI-only dependencies (`uvicorn`, `python-multipart`,
`email-validator`, `tzdata`), so this is a review queue rather than a removal
decision.

## 4. Maintainability and repository hygiene

- `backend/server.py` is 1,571 lines, `backend/b2b_service.py` 1,504 lines,
  and `frontend/src/i18n.js` 1,370 lines. Eighteen tracked backend/frontend
  files exceed 500 lines and three exceed 1,000.
- Repeated 20-line windows occur across the B2B/portfolio/retail domain error
  classes (`backend/b2b_domain.py:233`, `backend/portfolio_domain.py:69`,
  `backend/retail_domain.py:78`) and across four Admin detail pages. This is
  maintainability evidence, not proof that a refactor is authorized.
- The same 123,865-byte brand SVG is tracked at
  `frontend/public/niuva-mark.svg` and
  `frontend/src/assets/brand/niuva-mark.svg`; the duplication may be required
  by two delivery paths but creates drift/attribution review surface.
- No dead module was confirmed by static reachability alone. The apparent
  `backend/migration_backup.py` orphan is referenced by
  `doc/MIGRATION_BACKUP_RESTORE_RUNBOOK.md` as a CLI module.
- No obsolete route was confirmed from canonical evidence: `/services` and
  `/portfolio` are explicit aliases in `doc/PRODUCTION_DEPLOYMENT.md`, and
  `/admin/restock-alerts` is intentionally preserved for notification deep
  links by `DEC-OPS-002`. The unregistered audit plan's `AuditLog.jsx` claim is
  stale (see GOV-012/GOV-014).
- Tracked generated evidence includes
  `test_reports/pytest/pytest_results.xml`, dated 2026-06-28, with 31 tests
  and one failure but no repository SHA. `.coverage`, local logs, caches, and
  `frontend/build/` are present as pre-existing untracked/ignored artifacts.
  The report is not current pass evidence.

## 5. Documentation and engineering governance

Positive controls exist: the Master Spec and registers define authority
vocabulary; deployment, transaction, migration, identity, rollout, and
handover runbooks exist; CI runs backend/frontend tests and real transaction
tests; `.env.example` files describe local variables without committing
secrets.

The gaps are material:

- Root `README.md:1` is only “Here are your Instructions”. `frontend/README.md:1-25`
  is unmodified CRA boilerplate and states the generic production build story;
  it does not explain Niuva's backend, Mongo replica-set prerequisite,
  environment files, route boundaries, or postbuild semantics.
- There is no checked-in unified onboarding guide, architecture overview for
  the running software, API reference, `CODEOWNERS`, `CONTRIBUTING.md`,
  `SECURITY.md`, support guide, changelog/release notes, release tags, or
  dependency-upgrade policy.
- FastAPI exposes 132 decorated endpoint lines from `backend`, but the
  repository has no maintained endpoint catalog/versioned API contract beyond
  generated runtime OpenAPI (`backend/server.py:107`).
- Migrations 001–003 and 006 are covered by plans/runbooks; 004 and 005 are
  only sparsely referenced, and the active auth packet names migration 007
  (`docs/implementation/specs/active/2026-07-27-admin-auth-phase-1-implementation-authorization-packet.md:239-268`)
  without that file existing at this baseline.
- The three pending-reconciliation plans dated 2026-07-25
  (`admin-content-editor-and-module-audit-plan`,
  `reporting-bulk-notifications-dashboard-plan`, and
  `technical-console-dec-ops-001-conflict-escalation`) are not listed in
  `DOCUMENT_REGISTER.md`. The first claims an `AuditLog.jsx` and audit viewer
  (`...admin-content-editor-and-module-audit-plan.md:56-64`) although the
  approved `DEC-OPS-002` removed that surface and no current route/file exists.
  The reporting plan describes future `/admin/notifications` sender endpoints
  while the current route is a notification feed (`frontend/src/App.js:172-173`).
- `doc/TRANSACTION_CAPABILITY_RUNBOOK.md:5-8` points to the nonexistent
  `doc/decisions/ADR-001-mongodb-transaction-capability.md`; the canonical ADR
  is under `docs/decisions/architecture/`.
- CI has no dependency vulnerability, license, provenance/SBOM, or ownership
  gate. It installs floating Python lower bounds on every run
  (`.github/workflows/quality-gates.yml:21-33`) and runs npm against the
  lockfile (`:43-58`), without declaring one cross-language runtime contract.
- Branch/review strategy is present in historical plans but not as an active
  repository policy. No CODEOWNERS or release/changelog mechanism was found;
  local Git shows branches and commits but no release tags.

## 6. Finding register

### GOV-001 — Package-manager and lockfile contract are inconsistent

- Severity: `P1`; status: `open`; confidence: 99%; category: dependency reproducibility.
- Expected: one approved package manager, matching lockfile, and matching CI/deployment commands.
- Actual: manifest declares Yarn 1.22.22 and Yarn `resolutions`, while only npm lockfile is present and CI/runbook execute `npm ci`.
- Evidence: `frontend/package.json:74-117`, `frontend/package-lock.json:1-6`, `.github/workflows/quality-gates.yml:43-49`, `doc/PRODUCTION_DEPLOYMENT.md:25-30`; Yarn unavailable.
- Verification: `npm ci --dry-run --ignore-scripts --no-audit --no-fund` exits 0 but emits an ESLint peer override; resolution-vs-lock probe above.
- Impact: a regenerated lock can silently lose Yarn-only security resolutions; local/CI/deploy trees can diverge.
- Probable cause: package-manager migration was not completed or explicitly governed.
- Recommendation: approve one manager and enforce it in CI/onboarding; then produce a matching lock/override policy. Do not infer approval from the current lock.
- Acceptance: clean install from the approved manager reproduces the same graph on CI and local runtime; override assertions pass.
- Dependencies/decision: maintainer/package-owner decision; no source change authorized by this audit.
- First/last verified SHA: `c28684d` / `c28684d`.

### GOV-002 — Python dependency graph is not reproducible

- Severity: `P1`; status: `open`; confidence: 98%; category: dependency reproducibility.
- Expected: runtime and development dependencies are separated and resolved by a committed lock/constraints contract.
- Actual: 29 entries share one `requirements.txt`; 23 are lower bounds, with no lock or constraints file.
- Evidence: `backend/requirements.txt:1-29`; CI installs it directly at `.github/workflows/quality-gates.yml:21-33`.
- Verification: dry resolver selected 70 packages (29 requested/41 transitive); no venv or lock exists.
- Impact: rebuilds can change transitive code, license set, and vulnerability exposure without a source diff.
- Probable cause: dependency pinning was treated as a manifest concern only.
- Recommendation: approve runtime/dev split and a reproducible constraints/lock workflow with review cadence.
- Acceptance: clean isolated install twice yields identical hashes and `pip check`; CI consumes the same artifact.
- Dependencies/decision: backend owner and release owner.
- First/last verified SHA: `c28684d` / `c28684d`.

### GOV-003 — Npm audit reports open high-severity findings

- Severity: `P1`; status: `open`; confidence: 94%; category: vulnerability management.
- Expected: release candidates have a reviewed, current vulnerability result with applicability and owner.
- Actual: npm audit reports 36 total findings, including 3 high findings when dev dependencies are omitted.
- Evidence: `frontend/package-lock.json` and the 2026-07-28 `npm audit --package-lock-only --omit=dev --json` result: PostCSS `GHSA-6g55-p6wh-862q`, `GHSA-r28c-9q8g-f849`; React Router `GHSA-qwww-vcr4-c8h2`.
- Verification: exact commands in §2; no `npm audit fix` or upgrade was run.
- Impact: build-chain disclosure/path-traversal exposure and a client dependency advisory remain untriaged; exploitability cannot be claimed absent without a reviewed threat model.
- Probable cause: quality gates run tests/build only and do not run vulnerability policy checks.
- Recommendation: security owner triages each advisory, records applicability/exception or approved remediation, and adds a non-mutating CI check.
- Acceptance: current audit is zero or has owner, scope, expiry, and review evidence for every remaining advisory.
- Dependencies/decision: security owner and release gate owner.
- First/last verified SHA: `c28684d` / `c28684d`.

### GOV-004 — Deprecated/maintenance-mode framework and database driver risk

- Severity: `P1`; status: `open`; confidence: 93%; category: lifecycle compatibility.
- Expected: production-critical frameworks and drivers have an active support path and migration horizon.
- Actual: React/CRA is officially deprecated/maintenance-mode; CRACO makes the repository own custom configs without CRA support; Motor 3.3.1 remains the async Mongo driver while MongoDB recommends PyMongo Async and marks Motor deprecated on 2026-05-14; Starlette 1.3.1 is classified Alpha.
- Evidence: `frontend/package.json:36-39,56,71`, `frontend/craco.config.js:14-20,141-153`, `backend/requirements.txt:2,15`, active framework design `docs/implementation/specs/active/2026-07-21-backend-framework-security-upgrade-design.md:19-40`.
- Verification: official links in §2; PyPI classifiers queried on 2026-07-28.
- Impact: security fixes, runtime compatibility, and future migration cost are concentrated in unsupported/alpha boundaries.
- Probable cause: security upgrade selected exact versions without a recorded lifecycle exit plan.
- Recommendation: record an approved support/exception horizon and compatibility test matrix; do not upgrade as part of this audit.
- Acceptance: owner, target horizon, supported runtime matrix, and rollback-safe migration plan are documented.
- Dependencies/decision: frontend/backend owners and explicit dependency-change approval.
- First/last verified SHA: `c28684d` / `c28684d`.

### GOV-005 — Runtime/toolchain compatibility is not one contract

- Severity: `P1`; status: `open`; confidence: 91%; category: framework compatibility.
- Expected: CI, local, and deployment use supported and declared Node/Python versions with no unresolved peer warnings.
- Actual: CI uses Node 22 and Python 3.14.3; local audit used Node 24.14.0/Python 3.14.3; no `engines`, `.nvmrc`, `.python-version`, or equivalent is present. npm dry-run reports `@typescript-eslint/utils@5.62.0` requiring ESLint ≤8 while root uses ESLint 9.23.0.
- Evidence: `.github/workflows/quality-gates.yml:21-25,43-47`, `frontend/package.json:57-72`, `frontend/package-lock.json`, npm dry-run output.
- Verification: `node --version`, `python --version`, `npm ci --dry-run ...`.
- Impact: CI can pass while local/production fails on unsupported peer/runtime combinations; lint/build behavior is not deterministic.
- Probable cause: runtime support is encoded in CI only and transitive peer constraints are overridden.
- Recommendation: approve a runtime matrix and make peer conflicts fail or explicitly owned.
- Acceptance: declared versions, clean install, tests, build, and lint all pass without unowned peer warnings.
- Dependencies/decision: release owner and maintainers.
- First/last verified SHA: `c28684d` / `c28684d`.

### GOV-006 — Unused and duplicate-purpose direct dependencies

- Severity: `P2`; status: `open`; confidence: 86%; category: dependency hygiene.
- Expected: direct dependencies have a demonstrated import/build role and one library per purpose unless an exception is recorded.
- Actual: no direct imports were found for five frontend packages; date-fns/dayjs and GSAP/framer-motion overlap. Backend static probing produced multiple no-import candidates.
- Evidence: `frontend/package.json:20-24,33`; import probes; backend `requirements.txt:4-29`.
- Verification: fixed-string import searches across `frontend/src`, scripts, configs, and `backend/*.py`.
- Impact: larger attack/license/update surface and unclear ownership; unused packages can still introduce transitive risk.
- Probable cause: dependencies accumulated across prototypes and implementation slices.
- Recommendation: maintain an allowlisted dependency inventory with owner, purpose, and last-use evidence.
- Acceptance: every direct dependency is used or explicitly classified as CLI/plugin/test-only; duplicate-purpose choices are documented.
- Dependencies/decision: package owners; no deletion authorized.
- First/last verified SHA: `c28684d` / `c28684d`.

### GOV-007 — Development/data-science packages leak into backend runtime contract

- Severity: `P2`; status: `open`; confidence: 95%; category: dependency hygiene.
- Expected: production installation excludes test, lint, type-check, formatting, and unrelated analytics packages.
- Actual: pytest, xdist, black, isort, flake8, mypy, pandas, numpy, jq, and typer are in the same requirements file as FastAPI/Mongo runtime.
- Evidence: `backend/requirements.txt:16-28`; `.github/workflows/quality-gates.yml:26-33`.
- Verification: manifest classification and CI direct install.
- Impact: larger production image/install time and increased vulnerability/license surface; no clear deploy-vs-test provenance.
- Probable cause: one historical requirements file serves all workflows.
- Recommendation: separate runtime, test, and tooling contracts while preserving the approved current behavior.
- Acceptance: production install contains only runtime set; CI explicitly installs test/tooling set and records hashes.
- Dependencies/decision: backend packaging owner.
- First/last verified SHA: `c28684d` / `c28684d`.

### GOV-008 — License and provenance metadata require legal review

- Severity: `P2`; status: `open`; confidence: 90%; category: license/provenance.
- Expected: every shipped dependency has normalized SPDX/license evidence and an approved exception process.
- Actual: frontend lock has two missing licenses, GSAP custom “standard license” text, MPL-2.0 packages, and a node-forge BSD/GPL dual expression; Python dry-run metadata has five missing license fields (including direct `resend`).
- Evidence: `frontend/package-lock.json:86,2846,6413,10537`; resolver metadata; license summary in §3.
- Verification: lock/resolver license grouping; no legal conclusion inferred.
- Impact: redistribution and notice obligations are not centrally auditable; custom/commercial terms may be incompatible with intended distribution.
- Probable cause: no license/SBOM gate or normalized inventory.
- Recommendation: legal/engineering owners review licenses and retain machine-readable provenance; do not replace packages in this audit.
- Acceptance: complete SPDX/notice inventory, policy for MPL/GPL/custom terms, and CI drift check.
- Dependencies/decision: legal/owner approval.
- First/last verified SHA: `c28684d` / `c28684d`.

### GOV-009 — Build lifecycle and postbuild contract are under-documented

- Severity: `P2`; status: `open`; confidence: 94%; category: build maintainability.
- Expected: build, postbuild, generated artifacts, and required environment are documented consistently.
- Actual: `package.json:35-39` runs `craco build` then `generate-release-files.js`; the script skips sitemap generation with an empty public URL (`:12-17`), while generic CRA README claims a standard production build.
- Evidence: `frontend/package.json:35-39`, `frontend/scripts/generate-release-files.js:12-47`, CI `quality-gates.yml:54-58`, `frontend/README.md:1-25`.
- Verification: source inspection and existing CI configuration; no build was rerun to avoid generating artifacts.
- Impact: operators can mistake a green build for SEO/release completeness or miss the public-origin prerequisite.
- Probable cause: CRA boilerplate survived a custom CRACO/release lifecycle.
- Recommendation: maintain one Niuva build contract and explicitly classify generated files and environment gates.
- Acceptance: onboarding and deployment docs agree on build/postbuild outcomes and artifact checks.
- Dependencies/decision: frontend/release owner.
- First/last verified SHA: `c28684d` / `c28684d`.

### GOV-010 — Large modules and repeated scaffolding increase change risk

- Severity: `P2`; status: `open`; confidence: 88%; category: maintainability.
- Expected: domain boundaries remain reviewable and repeated policy/error/UI patterns have a documented owner.
- Actual: 18 tracked files exceed 500 lines; repeated error constructors and detail-page state scaffolding occur across domains/pages.
- Evidence: `backend/server.py:1-1571`, `backend/b2b_service.py:1-1504`, `frontend/src/i18n.js:1-1370`, duplicate-window probe.
- Verification: tracked-file line counts and exact 20-line-window hashes.
- Impact: higher regression and review cost; cross-surface fixes can drift.
- Probable cause: vertical slices added behavior without an explicit refactoring budget/ownership boundary.
- Recommendation: record complexity hotspots and ownership; prioritize only through an approved maintainability plan.
- Acceptance: hotspots have owners, test coverage, and agreed thresholds; no broad refactor is implied by this finding.
- Dependencies/decision: engineering lead.
- First/last verified SHA: `c28684d` / `c28684d`.

### GOV-011 — Generated/historical artifacts can be mistaken for current evidence

- Severity: `P2`; status: `open`; confidence: 97%; category: repository hygiene.
- Expected: generated reports are ephemeral or carry baseline/SHA/status metadata and cannot masquerade as current gates.
- Actual: tracked pytest XML is dated 2026-06-28, has one failure, no SHA, and `.coverage` is an untracked local artifact; build/log/cache artifacts exist locally but are not current evidence.
- Evidence: `test_reports/pytest/pytest_results.xml:1-3`, `git status --short --branch`, `.gitignore`.
- Verification: Git status, tracked artifact inventory, XML header inspection.
- Impact: stale failures or local data can mislead release decisions and leak environment-specific details.
- Probable cause: reports were retained without provenance policy.
- Recommendation: require report provenance/retention rules and keep local artifacts outside tracked evidence.
- Acceptance: every retained report has SHA/date/scope; release gates consume fresh CI output only.
- Dependencies/decision: QA/release owner.
- First/last verified SHA: `c28684d` / `c28684d`.

### GOV-012 — Source behavior is broader than maintained documentation

- Severity: `P2`; status: `open`; confidence: 96%; category: API/onboarding documentation.
- Expected: repository docs explain supported setup, architecture, API surface, route aliases, and operational boundaries.
- Actual: root README is unusable; frontend README is generic CRA; 132 decorated backend endpoint lines and 44 frontend routes have no maintained API/route catalog; software architecture is spread across product/ADR/runbook documents.
- Evidence: `README.md:1`, `frontend/README.md:1-25`, `backend/server.py:107`, endpoint/route probes.
- Verification: endpoint and route counts plus documentation searches.
- Impact: onboarding, support, review, and incident response depend on tribal knowledge; docs can claim behavior not present in source.
- Probable cause: product/decision documentation was prioritized while developer-facing documentation remained boilerplate.
- Recommendation: approve a single onboarding/architecture/API documentation owner and freshness check.
- Acceptance: new contributor can start local stack, discover API/route contracts, and find troubleshooting/rollback references from one entry point.
- Dependencies/decision: engineering owner; no README/API edit performed.
- First/last verified SHA: `c28684d` / `c28684d`.

### GOV-013 — Migration and deployment documentation coverage is uneven

- Severity: `P2`; status: `partial`; confidence: 87%; category: migration/handover.
- Expected: every migration has dry-run, backup, validation, rollback, ownership, and release references.
- Actual: runbooks cover 001–003 and 006; 004/005 have limited cross-reference; active auth packet names 007 but the file is absent at this baseline. Deployment/rollback runbooks exist, but package/runtime ownership is not unified.
- Evidence: `backend/migrations/004_content_blocks_seed.py`, `005_archive_orphan_collections.py`, `006_granular_role_policy.py`; `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md:252-313`; auth packet `:239-268`.
- Verification: migration inventory and docs-reference probe.
- Impact: operators may not know whether a migration is planned, safe to run, or already verified.
- Probable cause: implementation plans and runbooks were authored in separate slices.
- Recommendation: maintain one migration matrix with status, owner, backup, dry-run, rollback, and evidence links.
- Acceptance: each migration has one unambiguous runbook/status row; absent future migrations are clearly marked planned.
- Dependencies/decision: migration owner and approval gates.
- First/last verified SHA: `c28684d` / `c28684d`.

### GOV-014 — Unregistered pending plans create authority and runtime conflicts

- Severity: `P1`; status: `open`; confidence: 95%; category: decision traceability.
- Expected: every plan is registered/classified, and stale implementation claims are reconciled before use.
- Actual: three 2026-07-25 pending plans are absent from `DOCUMENT_REGISTER.md`; one claims an `AuditLog.jsx`/viewer that canonical `DEC-OPS-002` removed and source does not expose; another describes future admin-notification endpoints while `frontend/src/App.js:172-173` already routes a feed/communication split.
- Evidence: plan files named above, `docs/decisions/experience/DEC-OPS-002-admin-scope-reduction.md:29-56`, `frontend/src/App.js:148-176`, `Test-Path frontend/src/pages/admin/AuditLog.jsx` false.
- Verification: register-vs-plan inventory and source route/file probes.
- Impact: agents or reviewers can treat stale plans as implementation truth, causing authority misuse or duplicate work.
- Probable cause: plans were added after the last document-register reconciliation.
- Recommendation: reconcile/register/classify these plans through the approved documentation process; do not archive/delete them in this audit.
- Acceptance: every pending plan has a register row and explicit supersession/runtime reconciliation; source claims are either current or labelled historical.
- Dependencies/decision: documentation owner and canonical-authority approval.
- First/last verified SHA: `c28684d` / `c28684d`.

### GOV-015 — Transaction runbook contains a stale canonical path

- Severity: `P2`; status: `open`; confidence: 99%; category: documentation integrity.
- Expected: runbook links resolve to the canonical ADR path.
- Actual: `doc/TRANSACTION_CAPABILITY_RUNBOOK.md:5-8` names nonexistent `doc/decisions/ADR-001-mongodb-transaction-capability.md`; canonical file is `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`.
- Verification: `Test-Path` on both paths and direct source inspection.
- Impact: readers can miss the authoritative transaction boundary or follow a broken link during an incident.
- Probable cause: documentation migration left one literal pointer behind.
- Recommendation: correct the pointer through normal documentation approval and add link/path validation.
- Acceptance: all runbook ADR pointers resolve and a Markdown/path check runs in CI.
- Dependencies/decision: documentation owner; no canonical status change is implied.
- First/last verified SHA: `c28684d` / `c28684d`.

### GOV-016 — Review, ownership, release, and dependency policy are not enforceable

- Severity: `P2`; status: `open`; confidence: 98%; category: engineering governance.
- Expected: CODEOWNERS/review gates, branch/release strategy, changelog, support owner, and dependency-upgrade policy are discoverable and enforced.
- Actual: no `CODEOWNERS`, `CONTRIBUTING.md`, `SECURITY.md`, changelog/release notes, release tags, or dependency policy was found; only two workflows exist and neither performs ownership/license/SBOM/vulnerability gating.
- Evidence: `.github/` inventory; `git tag --list` empty; `git ls-files` policy search.
- Verification: repository file inventory and Git refs.
- Impact: critical dependency, architecture, and operational changes can merge without accountable reviewers or a repeatable release trail.
- Probable cause: governance is recorded in historical plans rather than active repository controls.
- Recommendation: approve named owners/reviewers and a branch/release/dependency policy before release-candidate work.
- Acceptance: policy files/branch protections/CI checks are present, current, and tested by a sample change.
- Dependencies/decision: engineering/release owner.
- First/last verified SHA: `c28684d` / `c28684d`.

### GOV-017 — Historical audit tracker is stale and requires revalidation

- Severity: `P2`; status: `requires_revalidation`; confidence: 97%; category: tracker freshness.
- Expected: historical trackers clearly identify baseline and are revalidated after authority/source/dependency changes.
- Actual: `BACKEND_AUDIT_TRACKER_2026-07-24.md` remains a 24-Jul context tracker while HEAD is 27-Jul and current authority/dependency/source paths changed; its statuses cannot be inherited.
- Evidence: tracker header/status, `AUDIT_PROGRESS.md` reconciliation table, Git HEAD/history.
- Verification: `git rev-parse HEAD`, tracker baseline comparison, changed-path inventory.
- Impact: old “resolved/open” counts can be mistaken for current readiness evidence.
- Probable cause: tracker is intentionally historical but has no automatic freshness gate.
- Recommendation: keep old tracker context-only and record per-finding revalidation status in the layered audit.
- Acceptance: every inherited finding is marked current/stale/revalidated with SHA and command evidence.
- Dependencies/decision: audit owner.
- First/last verified SHA: `c28684d` / `c28684d`.

## 7. Documentation-conflict register

| Topic | Canonical Source | Conflicting Source | Runtime Evidence | Conflict Type | Required Action |
|---|---|---|---|---|---|
| Frontend package manager and security overrides | `doc/PRODUCTION_DEPLOYMENT.md:25-30`; CI `quality-gates.yml:43-49` | `frontend/package.json:74-117` declares Yarn/resolutions while no Yarn lock exists | Yarn unavailable; npm dry-run resolves a different tree and emits peer override | Tooling-contract conflict | Owner chooses npm or Yarn, then aligns lock/override/CI/onboarding; no upgrade in this audit |
| Transaction ADR pointer | `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md` | `doc/TRANSACTION_CAPABILITY_RUNBOOK.md:5-8` | `doc/decisions/ADR-001...` does not exist | Broken documentation reference | Correct pointer and add link/path validation |
| Build readiness wording | Deployment runbook `doc/PRODUCTION_DEPLOYMENT.md:7-40` | `frontend/README.md:1-25` CRA boilerplate | `postbuild` skips sitemap when public URL is empty (`scripts/generate-release-files.js:12-17`) | Documentation claims broader behavior than runtime contract | Replace/retire boilerplate through approved docs workflow |
| Removed Audit viewer | `DEC-OPS-002:29-38,60-73` | Unregistered `2026-07-25-admin-content-editor-and-module-audit-plan.md:56-64` | No `frontend/src/pages/admin/AuditLog.jsx`, no `/admin/audit-events` route observed | Superseded implementation claim | Register/reconcile plan; preserve document until approved archival decision |
| Admin notifications | Current source/route contract `frontend/src/App.js:172-173` and notification feed source | Unregistered `2026-07-25-reporting-bulk-notifications-dashboard-plan.md:47-90` | `/admin/notifications` is a feed; `/admin/communication` is the separate route; planned sender endpoints absent | Stale plan vs runtime | Mark plan historical/pending and reconcile endpoint intent before implementation |
| Migration coverage | `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md:252-313` and rollout runbooks | Auth packet `2026-07-27...:239-268` names migration 007 | `backend/migrations/007_auth_recovery_safety.py` absent at baseline | Planned artifact presented beside current runbook | Record 007 as planned/not present and require separate implementation evidence |

## 8. Coverage and positive controls

| Requested area | Result |
|---|---|
| Direct/transitive dependency inventory | Completed: 28+19 JS direct, 1,483 npm entries; 29+41 Python dry-run |
| Vulnerability/deprecation/freshness | Completed with npm audit, PyPI metadata, official CRA/CRACO/MongoDB/Node sources; no upgrade |
| Framework/package-manager/version/lock consistency | Findings GOV-001/GOV-002/GOV-004/GOV-005 |
| Duplicate/unused/dev leakage/license | Findings GOV-006/GOV-007/GOV-008 |
| Build lifecycle/CRA/CRACO | GOV-004/GOV-009 |
| Code duplication/dead modules/routes/generated artifacts | GOV-010/GOV-011; no dead/obsolete item confirmed without a stronger reachability proof |
| Root docs/onboarding/environment/architecture/API | GOV-012 |
| Migration/deployment/troubleshooting/runbooks | GOV-013/GOV-015; runbooks exist but are split and unevenly cross-referenced |
| Changelog/ownership/review/branch-release strategy | GOV-016 |
| Decision traceability/stale plans/conflicting/superseded docs | GOV-014/GOV-017 plus conflict register |
| Audit tracker freshness/authority misuse | GOV-017 and conflict register |
| Source behavior undocumented | GOV-012/GOV-013 |

Existing positive controls:

- canonical authority order and status vocabulary in the Master Spec/registers;
- provider-neutral deployment/transaction/storage/payment boundaries;
- `.env.example` files and `.gitignore` secret/cache coverage;
- npm lockfile with integrity fields;
- CI backend/frontend tests, compile checks, and isolated real-transaction tests;
- migration/runbook language that preserves backups, dry runs, rollback, and
  explicit approval gates.

## 9. Required decisions and remediation sequencing

These are audit recommendations only:

1. Choose and document the package manager/runtime contract.
2. Establish reproducible Python resolution and split runtime/dev dependencies.
3. Triage npm advisories and lifecycle exceptions with named owners.
4. Create one onboarding/architecture/API entry point and reconcile pending plans.
5. Add ownership/review/release/dependency/license evidence gates.
6. Plan maintainability and Motor/CRA lifecycle work separately; do not infer
   authorization from this report.

Human decisions still required: package manager, supported Node/Python matrix,
dependency upgrade/lifecycle exception owners, license policy, documentation
owner, branch/release policy, and whether/when pending plans are reconciled or
archived. No canonical document status was changed.

## 10. Limitations and handoff

- Yarn clean install was unavailable; npm dry-run is not proof of Yarn
  reproducibility.
- No isolated Python virtual environment was present; global `pip check` and
  dry resolution are non-representative for deployment.
- `pip-audit` is not installed. PyPI JSON advisory metadata returned zero
  advisory objects for the dry-run graph, but this is not a complete SBOM scan.
- No remote fetch, provider, license counsel, ownership system, or branch
  protection settings were accessed.
- No build/test rerun was needed for this governance audit; existing CI/runbook
  evidence was used, and generated artifacts were deliberately not created.

Next safe action is a separately approved governance/dependency baseline
decision, followed by revalidation of GOV-001–GOV-005 and GOV-014 before any
upgrade, source edit, authority edit, commit, or push.

## 11. Changelog

### 2026-07-28

- Replaced the initialization-only Layer 10 template with the dependency,
  maintainability, documentation, governance, and conflict audit.
- Recorded official freshness/lifecycle sources checked on 2026-07-28.
- Added GOV-001 through GOV-017; no remediation or authority change performed.
