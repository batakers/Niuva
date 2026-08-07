# Layer 07 — Testing and Quality Assurance

Status: Context Only — Audit Evidence and Progress Tracker — Not Implementation Authority

## 1. Audit identity and scorecard

| Field | Value |
| --- | --- |
| Audit status | `complete` for the repository/static and safely runnable local scope; production-like evidence remains blocked |
| Finding prefix | `QA` |
| Baseline SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| HEAD verified | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Audit completion | 95% |
| Testing readiness score | 48% |
| Confidence | 68% |
| Critical flows | 5 covered; 10 partial; 4 environment-blocked; 0 missing |
| Skipped/environment-blocked evidence | 30 pytest skips in the full configured run; 4 Playwright skips; 128 Playwright environment-blocked failures; 8 legacy HTTP failures caused by an unavailable endpoint |
| Findings | 0 P0; 3 P1; 4 P2; 0 P3 |
| Last updated | 2026-07-28 03:38:25 WIB (UTC+07:00) |

`covered` means that current automated evidence exists at a representative
unit, route, or real-topology integration layer. It does not mean that a
browser or production-like journey passed. The score is capped below release
candidate level because critical authorization, responsive, accessibility, and
release-artifact paths are not in a trusted CI signal.

## 2. Scope and authority

### Included

- Backend unit, route, domain, contract, migration, transaction, database,
  permission, privacy, health/readiness, storage, and notification tests.
- Frontend Jest/component/contract tests, build and release-artifact behavior.
- Playwright role, responsive, keyboard, reduced-motion, and axe accessibility
  suites.
- CI workflows, package/runtime requirements, fixtures, skips, retries,
  cleanup, report provenance, and manual verification runbooks.
- Requirement-to-test traceability for the critical capabilities named in the
  audit request.

### Excluded

- Source, test, fixture, dependency, lockfile, CI, or assertion changes.
- Dependency installation, browser installation, production requests, real
  credentials, provider activation, migration against real data, commit, push,
  merge, or deployment.
- Coverage instrumentation that would overwrite the pre-existing untracked
  `.coverage` artifact.
- Human screen-reader quality, visual-regression baselines, load/chaos testing,
  and staging/production smoke; these are recorded as unavailable or
  environment-blocked rather than treated as passes.

### Canonical authority reviewed

- `AGENTS.md`
- `docs/NIUVA_MASTER_SPEC.md` — role/backend authorization, customer-safe
  projections, CMS lifecycle, version/snapshot truth, transaction fail-closed
  boundary, file/payment constraints, and responsive/accessibility rules.
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- `docs/decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md`
- `docs/decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md`
- `docs/decisions/access/DEC-AUTH-001-login-failure-and-legacy-compatibility.md`
- `docs/decisions/access/DEC-AUTH-003-account-recovery-contract-and-compatibility.md`
- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
- `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`
- `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`
- `docs/decisions/product/DEC-PAY-02-legacy-manual-transfer-read-only.md`
- `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md`
- `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md`
- `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md`
- `doc/TRANSACTION_CAPABILITY_RUNBOOK.md`
- `doc/BROWSER_VERIFICATION_RUNBOOK.md`
- `doc/PRODUCTION_DEPLOYMENT.md`

The decisions above are behavior authority. Current tests and workflows are
implementation evidence only. Open provider, MFA, session, rate-limit,
storage, payment, production, and go-live decisions were not converted into
test requirements or release approval.

## 3. Baseline and repository state

- Branch: `feat/marketing-redesign-dec-ux-002`.
- `HEAD` matched the recorded audit baseline; no HEAD delta required a second
  baseline.
- Pre-existing user work was preserved: the modified auth authorization packet,
  `.coverage`, the untracked audit directory, and the pre-existing frontend
  output directory were not cleaned or interpreted as authoritative.
- Historical backend tracker baseline `7505b48` and XML report
  `test_reports/pytest/pytest_results.xml` have no current SHA provenance and
  remain stale/unverified.
- Local runtime: Windows 10 x64, Node `v24.14.0`, npm `11.18.0`, Python
  `3.14.3`, pytest `9.0.2`, Docker `29.5.2`, Compose `v5.1.4`.
- CI declares Python `3.14.3` but Node `22`; the package declares Yarn
  `1.22.22` while CI uses `npm ci` and Yarn is not installed locally.
- No repository-local backend virtual environment exists. Global packages were
  used only as a bounded local probe, not as CI equivalence.

## 4. Test and verification inventory

The inventory is complete for the current checkout. Paths below are grouped by
behavioral layer; every listed file was discovered with `rg --files` and
reviewed for collection, environment, and assertion behavior.

| Test file/suite group | Layer | Scope / test type | Environment requirement | CI status | Current result | Reliability |
| --- | --- | --- | --- | --- | --- | --- |
| `backend/tests/backend_test.py` | Backend external integration | HTTP smoke and legacy auth/material/order/portfolio/settings/notification workflow | Running backend URL; approved admin credentials; transaction capability | Included in `quality-gates.yml`, but can module-skip when URL is absent | 8 connection failures, remaining tests skipped when local URL/credentials are incomplete | Low as a release signal until CI supplies a service and fails unexpected skips |
| `backend/tests/test_auth_security.py`, `test_reset_password.py`, `test_permissions.py`, `test_identity_foundation.py`, `test_identity_access_migration.py`, `test_granular_role_migration.py`, `test_audit.py`, `test_repository_credential_hygiene.py` | Backend security/identity | Unit, route, permission, migration, redaction, recovery | In-memory/fake DB for most; real replica set for two migration cases | General backend job; two real migration cases also in transaction job | Passed in native suite; real migration cases passed in replica set | Strong negative-path assertions; real account/production session evidence absent |
| `backend/tests/test_b2b_customer_projection.py`, `test_b2b_inquiry_domain.py`, `test_b2b_inquiry_routes.py`, `test_b2b_inquiry_service.py`, `test_b2b_project_lifecycle.py`, `test_b2b_quote_conversion.py`, `test_b2b_quote_item_snapshots.py`, `test_b2b_quote_lifecycle.py`, `test_b2b_work_orders.py` | Backend B2B | Domain, route, projection, lifecycle, snapshot, and service tests | Fake/in-memory fixtures; transaction topology for conversion/allocation integration | General backend; selected real transaction modules in transaction job | Passed in native suite; B2B transaction integration included in real run | Good lifecycle/negative coverage; no authenticated browser journey |
| `backend/tests/test_b2b_transaction_integration.py`, `test_work_order_allocation_integration.py` | Backend integration | Real Mongo transaction and allocation paths | `NIUVA_RUN_REAL_TRANSACTION_TESTS=1`, `MONGO_TRANSACTION_TEST_URL` | Yes | Included in 45 passing real-topology tests | Strong for selected cross-collection paths; not production topology |
| `backend/tests/test_catalog_bill_of_materials.py`, `test_catalog_domain.py`, `test_catalog_routes.py`, `test_catalog_material_inventory_migration.py`, `test_content_lifecycle.py`, `test_content_routes.py`, `test_material_pricing.py`, `test_portfolio_lifecycle.py` | Backend catalog/CMS/pricing | Domain, route, validation, publication, migration, version/rollback | Fake/in-memory fixtures; isolated migration data | General backend; catalog migration not a real-data rehearsal | Passed in native suite | Meaningful behavior assertions; no browser/public projection E2E |
| `backend/tests/test_inventory_domain.py`, `test_inventory_routes.py`, `test_inventory_service.py`, `test_inventory_stock_status.py`, `test_inventory_transactions.py`, `test_stock_movement_contract.py`, `test_work_order_shortage_recovery.py` | Backend inventory | Domain, route, CAS/idempotency, shortage, movement and real transaction tests | Fake fixtures; replica set for transaction module | General backend; `test_inventory_transactions.py` in transaction job | Native suite passed; real inventory transactions passed | Good conflict/retry/negative assertions; production data volume not tested |
| `backend/tests/test_retail_legacy_classification.py`, `test_retail_order_aggregate.py`, `test_retail_order_routes.py`, `test_settings_profile.py`, `test_storage.py`, `test_storage_routes.py` | Backend Retail/storage | Aggregate, route, customer-safe settings, upload/download and payment-proof lockdown | Fake/in-memory storage; external provider deliberately unavailable | General backend | Passed in native suite | Provider-neutral boundary is tested; no private production adapter or browser checkout evidence |
| `backend/tests/test_admin_dashboard_timeseries.py`, `test_admin_notifications.py`, `test_dashboard_domain.py`, `test_health.py`, `test_database_capabilities.py`, `test_notification_feed.py`, `test_admin_studio_quality_workflow.py`, `test_transaction_documentation.py`, `test_transaction_error_contract.py`, `test_transaction_execution.py`, `test_transaction_guard.py`, `test_transaction_observability.py`, `test_transaction_topology_files.py` | Backend operational/transaction contract | Health/readiness, notifications, static workflow/topology contracts, error/retry/observability | Mostly fake fixtures and repository files; real topology for selected modules | General backend; transaction job covers only selected modules | Passed in native suite; real transaction subset passed | Transaction semantics are well asserted; several contract tests inspect text/config rather than executing CI |
| `backend/tests/test_migration_backup_restore.py` | Backend migration/backup | Real capture, tamper detection, restore and decimal round-trip | Disposable Mongo replica set and temp snapshot | Not included in `.github/workflows/transaction-tests.yml` | 4 backup/restore tests passed locally in disposable replica set | Strong local evidence; CI/release gate absent |
| `frontend/src/components/auth/ProtectedRoute.test.jsx`, `context/AuthContext.test.jsx`, `lib/api.test.js`, `lib/identityAccess.test.js`, `lib/permissions.test.js`, `lib/adminWorkbench.test.js` | Frontend auth/API | Unit/component and download/error behavior | Jest/jsdom; mocked API/Auth context | Yes, frontend job | Included in 202 passing tests | Useful state assertions; API and auth are mocked, so server/UI parity needs E2E |
| `frontend/src/lib/catalog.test.js`, `lib/materials.test.js`, `lib/inventory.test.js`, `lib/format.test.js`, `components/ui/operational-state.test.jsx` | Frontend domain/state | Unit and operational state tests | Jest/jsdom | Yes | Passed | Behavior-focused, no snapshots |
| `frontend/src/pages/admin/*.contract.test.js`, `QuoteRevisionEditor.test.jsx`, `pages/marketing/ContactPage.intake.test.jsx`, `FaqPage.states.test.jsx`, `payment-lockdown.test.js`, `emergent-removal.test.js` | Frontend component/contract | Contract/source-adjacent UI assertions, form state, marketing states | Jest/jsdom; GSAP/API/UI mocks | Yes | Passed | Good contract breadth; several tests intentionally inspect source/config and do not prove runtime routes |
| `frontend/e2e/role-matrix.spec.js` | Browser E2E | Role navigation, forbidden direct routes, unauthenticated redirect and API 401 | Running frontend/backend, `PLAYWRIGHT_API_URL`, five role accounts | Not in CI | 1 unauthenticated pass per project; API check skipped; role tests blocked by missing credentials | Fail-closed fixture avoids false pass, but no role evidence is available |
| `frontend/e2e/responsive.spec.js` | Browser E2E | Four widths, overflow, touch targets, keyboard, drawer, reduced motion | Running app plus super-admin account | Not in CI | All role-dependent checks environment-blocked; mobile/tablet conditional skip is after auth fixture | No reliable responsive signal in this environment |
| `frontend/e2e/accessibility.spec.js` | Browser accessibility | axe WCAG 2.1 A/AA on Admin surfaces and sign-in | Running app plus super-admin account; Chromium | Not in CI | Sign-in smoke passed; Admin scans environment-blocked | Sign-in evidence useful; Admin accessibility unverified |
| `.github/workflows/quality-gates.yml`, `.github/workflows/transaction-tests.yml` | CI | Install, pip check, compile, backend/frontend tests/build, real transaction subset | Ubuntu, Python 3.14.3, Node 22, Docker for transaction job | Active PR/manual workflows | Static review only; no remote CI run performed | Commands are explicit but gates omit browser, coverage, lint/type/security, and backup/restore |
| `doc/BROWSER_VERIFICATION_RUNBOOK.md`, `doc/TRANSACTION_CAPABILITY_RUNBOOK.md`, `doc/PRODUCTION_DEPLOYMENT.md`, `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md`, `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md` | Manual QA/runbook | Browser, topology, migration, deployment and handoff verification | Named non-production environment and approved accounts/owners | Manual only | Procedures present; required environment/owner evidence absent | Procedural guidance is clear; a checklist is not an execution result |

Available but absent from this checkout: dedicated visual-regression suites,
performance/load tests, coverage configuration/reporting, type-check command,
lint job, dependency vulnerability job, and a CI artifact publisher.

## 5. Commands executed and raw results

All commands were run against the recorded HEAD and did not modify source,
tests, fixtures, dependencies, workflows, or environment files.

| Command | Exit | Raw result / interpretation |
| --- | ---: | --- |
| `git rev-parse HEAD` and `git status --short --branch` | 0 | HEAD matched `c28684d`; pre-existing user changes preserved |
| `python -m pytest --collect-only -q backend/tests` | 0 | `475 tests collected`; four deprecation warnings |
| `python -m pytest -q backend/tests` | 1 | xdist worker startup failed before collection execution: `OSError: [WinError 6] The handle is invalid` |
| `python -m pytest -n 0 -q backend/tests` | 1 | `442 passed, 30 skipped, 8 failed, 14 subtests passed`; failures were HTTP calls to unavailable `localhost:8010`; four deprecation warnings |
| `python -m pytest -n 0 -q backend/tests --ignore=backend/tests/backend_test.py` | 0 | `442 passed, 7 skipped, 14 subtests passed`; four deprecation warnings |
| `python -m compileall -q backend` | 0 | Backend compilation passed |
| `python -m pip check` | 0 | `No broken requirements found` |
| Disposable `docker compose -f docker-compose.transaction-test.yml up -d`, writable-primary probe, and real transaction/migration command | 0 | `45 passed in 4.97s`; stack then cleaned with scoped `down --volumes --remove-orphans` |
| `npm test -- --watchAll=false --runInBand` in `frontend` | 0 | `27 passed, 27 total`; `202 passed, 202 total`; `0 snapshots` |
| `npm run build` in `frontend` | 1 | CRA compiled successfully; `postbuild` failed because the configured public origin was not an approved absolute production origin |
| `npx playwright test --project=desktop -g "unauthenticated\|sign-in"` | 0 | `2 passed, 1 skipped` |
| `npx playwright test` | 1 | `140 tests`: `8 passed, 4 skipped, 128 failed`; failures were missing role-account environment variables, not assertion failures |
| Static `rg` inventory/skip/mock/time/CI probes | 0 or no-match | 57 backend test modules, 27 Jest files, 3 Playwright specs, 2 workflows; no xfail, snapshot, coverage, lint, type, security, performance, or visual gate found |

The old XML report and the pre-existing `.coverage` file were not used as
current evidence. No coverage command was run because it would overwrite the
unproven `.coverage` artifact.

## 6. Requirement-to-test traceability

| Requirement / decision | Expected behavior | Test evidence | Positive path | Negative path | Permission path | Failure/recovery path | Coverage status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `DEC-AUTH-001` login | Unknown, wrong, disabled, and review-blocked accounts return identical `401 Invalid email or password` and no token; legacy low-privilege customer remains compatible | `backend/tests/test_auth_security.py`, `backend/tests/backend_test.py` | Yes | Yes | Yes | Token absence and invalid token paths | **covered** at route/unit layer; no authenticated browser evidence |
| Blocked account | Disabled/review-blocked accounts cannot receive access or recovery token | `backend/tests/test_auth_security.py`, `test_reset_password.py` | Yes | Yes | Yes | Expired/reused reset token and session invalidation | **covered** at route/unit layer |
| `DEC-ACCESS-001/002` roles and permission | Granular additive roles; Super Admin-only identity governance; backend authorization and query scope | `test_permissions.py`, `test_identity_foundation.py`, `test_auth_security.py`, route tests, `frontend/e2e/role-matrix.spec.js` | Yes | Yes | Yes | Migration dry-run/rollback and forbidden routes | **environment_blocked** for browser role matrix |
| Customer-data boundary | Customer projections exclude cost, margin, supplier, profit, internal notes, audit and sourcing data | `test_b2b_customer_projection.py`, `test_catalog_domain.py`, `test_material_pricing.py`, `test_settings_profile.py`, `test_portfolio_lifecycle.py` | Yes | Yes | Partial | Projection/allowlist assertions | **partial**; no cross-surface E2E |
| Admin Studio access | Role-aware, permission-aware, auditable operational surface; hiding UI is not authorization | backend route/permission tests, frontend admin contract tests, `role-matrix.spec.js` | Partial | Yes | Partial | Direct forbidden-route browser checks blocked | **environment_blocked** |
| CMS/content | `draft → review → preview → published/scheduled → archived`, approval-aware publish, version and reversible archive | `test_content_lifecycle.py`, `test_content_routes.py`, frontend `cms-lifecycle.contract.test.js` | Yes | Yes | Yes | Validation, slug conflict, archive/revision paths | **partial** |
| Catalog | Validated structured catalog, public allowlist, immutable child identity, safe publish/rollback | `test_catalog_domain.py`, `test_catalog_routes.py`, BOM tests, frontend catalog contracts | Yes | Yes | Yes | Conflict/no-partial-replacement/rollback tests | **partial** |
| Material pricing | Versioned/effective pricing; no supplier/internal price leakage; immutable commercial snapshots | `test_material_pricing.py`, `test_b2b_quote_item_snapshots.py`, frontend materials tests | Yes | Yes | Yes | Archive/conflict/public projection | **partial** |
| Inventory | Idempotent operations, negative-stock prevention, reservation lifecycle, stale-version/conflict and shortage behavior | inventory domain/service/routes/transactions and shortage tests | Yes | Yes | Yes | Real transaction, retry, expiry and shortage paths | **covered** for selected service/integration scope |
| `ADR-001` transaction atomicity | Replica-set multi-document mutations; fail closed with stable `503`; no silent fallback; safe commit retry semantics | `test_transaction_*`, B2B/work-order/inventory integration modules, `test_database_capabilities.py` | Yes | Yes | Partial | Abort, unknown commit, retry-safe, real replica set | **covered** for exercised modules; no production topology |
| Retail Order | Separate lifecycle, immutable placed snapshot, idempotent creation/transition, permission scope | `test_retail_order_aggregate.py`, `test_retail_order_routes.py`, legacy classification tests, frontend retail contract | Yes | Yes | Yes | Replayed creation, stale version, suspended actions | **partial**; no browser/customer journey |
| B2B inquiry/quote/project | Separate inquiry → quote/version → project/work-order lifecycle with customer-safe projections | B2B domain/route/service/lifecycle/snapshot and transaction tests, frontend B2B contract | Yes | Yes | Yes | Rejection, scope change, duplicate conversion, stale project | **partial**; no authenticated E2E |
| `ADR-002` upload/download | Private provider-neutral storage boundary, ownership/authorization/type safety; local storage is non-production | `test_storage.py`, `test_storage_routes.py`, frontend API download test | Yes | Yes | Yes | Disabled storage, unsafe path/type, unauthorized download | **partial**; provider and browser path unverified |
| Notification | Notification failure must not roll back core transaction; safe feed/projection | `test_notification_feed.py`, `test_admin_notifications.py`, B2B inquiry notification tests, frontend notification contract | Yes | Yes | Partial | Delivery failure and safe projection | **partial**; no real delivery/provider failure |
| Migration | Non-destructive, dry-run, backup, reviewed mapping, idempotent apply, validation and rollback | catalog/material migration, identity/granular migration tests | Yes | Yes | Yes | Collision/preflight/rollback and real replica-set migration | **partial**; CI lacks backup/restore module |
| Backup/restore | Validated snapshot, tamper detection, decimal fidelity, restore to captured state | `test_migration_backup_restore.py` | Yes | Yes | Yes | Populated-target refusal, tamper, exact restore | **partial**; local disposable pass, no CI/release gate |
| Health/readiness | Liveness remains available; readiness reports transaction capability and safe reason | `test_health.py`, `test_database_capabilities.py` | Yes | Yes | N/A | Standalone/degraded capability | **covered** at route/unit layer; no running current backend probe |
| Responsive behavior | No horizontal overflow; 44px controls; keyboard skip link; drawer focus/Escape; reduced motion | `responsive.spec.js`, browser runbook | N/A | N/A | Requires role | Width-specific browser run | **environment_blocked** |
| Accessibility | WCAG A/AA axe checks, semantic labels/states, keyboard and reduced-motion behavior | `accessibility.spec.js`, frontend operational-state/component tests | Sign-in yes | Admin surfaces blocked | Requires role | Axe output on Admin routes unavailable | **environment_blocked** |

## 7. Critical-flow matrix

Legend: `Y` = current evidence, `P` = partial/unit-only evidence,
`B` = environment-blocked, `N` = none. “Production-like” means an approved
staging/production-equivalent run, which was not performed.

| Critical flow | Unit | Integration | Contract | E2E | Negative | Permission | Production-like | Status |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Login | Y | Y (TestClient) | Y | P (redirect only) | Y | Y | N | covered |
| Blocked account | Y | Y (TestClient) | P | N | Y | Y | N | covered |
| Role and permission | Y | Y (route) | Y | B | Y | Y | N | environment_blocked |
| Customer-data boundary | Y | Y (route/projection) | Y | N | Y | Y | N | partial |
| Admin Studio access | Y | P | Y | B | Y | Y | N | environment_blocked |
| CMS/content | Y | Y (route) | Y | N | Y | Y | N | partial |
| Catalog | Y | Y (route) | Y | N | Y | Y | N | partial |
| Material pricing | Y | Y (route) | Y | N | Y | Y | N | partial |
| Inventory | Y | Y (real selected modules) | Y | N | Y | Y | N | covered |
| Transaction atomicity | Y | Y (45 real tests) | Y | N | Y | P | N | covered |
| Retail Order | Y | Y (fake route) | Y | N | Y | Y | N | partial |
| B2B inquiry/quote/project | Y | Y (selected real transaction) | Y | N | Y | Y | N | partial |
| Upload/download | Y | P (local adapter) | Y | N | Y | Y | N | partial |
| Notification | Y | P | Y | N | Y | P | N | partial |
| Migration | Y | Y (selected real migrations) | Y | N | Y | Y | N | partial |
| Backup/restore | Y | Y (disposable Mongo) | Y | N | Y | Y | N | partial |
| Health/readiness | Y | Y (TestClient) | Y | N | Y | N/A | N | covered |
| Responsive | N | N | P | B | N | Requires auth | N | environment_blocked |
| Accessibility | P (components) | N | P | B | P | Requires auth | N | environment_blocked |

## 8. Skipped and blocked register

| Test/suite | Reason | Missing environment | Risk not verified | Required verification | Release impact |
| --- | --- | --- | --- | --- | --- |
| `backend/tests/backend_test.py` module | URL fallback finds no endpoint in CI, or credentials are absent | Approved non-production backend plus admin/client accounts | Legacy HTTP auth, order, catalog/material, settings, portfolio, notification journey | Run against current backend with approved data; record counts and fail unexpected skips | High; currently not a trusted CI signal |
| Seven real-topology modules in a normal local pytest run | Explicit opt-in and Mongo URL are absent | Disposable `rs-test` | Cross-collection atomicity/migration | Start tracked Compose topology and run the exact transaction command | High if skipped in CI; local rerun passed 45 tests |
| `frontend/e2e/role-matrix.spec.js` API test | `PLAYWRIGHT_API_URL` absent | API origin separate from SPA origin | Unauthenticated API 401 contract | Set approved non-production API origin and rerun | Medium |
| 128 Admin/role/responsive/axe Playwright tests | Five role credential pairs absent; fixture deliberately raises instead of silently skipping | Seeded active accounts for Super Admin, Sales, Warehouse, Content, Production; running current backend | Browser authorization, direct forbidden routes, Admin accessibility and responsive behavior | Use non-production role accounts, current API/frontend, all four projects | High; no release browser signal |
| Desktop/tablet drawer conditional | `test.skip` is evaluated after `beforeEach` authentication | Same Super Admin account as above | Drawer focus/Escape behavior | Move execution to an authorized E2E environment and record skip/pass per project; no source change made in this audit | Medium |
| Cross-browser coverage | Only Chromium executable is installed; projects vary viewport, not browser engine | Firefox/WebKit browser binaries | Browser-specific layout/accessibility regressions | Approved browser installation in disposable CI/QA environment | Medium |
| Human screen-reader review | Not automatable by axe | Screen-reader operator and approved QA environment | Reading order and announcement quality | Execute the manual section of the browser runbook | Medium |

Skipped tests are not counted as passes. The full Playwright result’s 128
credential failures are recorded as environment-blocked, not product failures,
because every failure stopped in `credentialsFor` before the requested
behavior ran.

## 9. Test-quality assessment

### Positive controls

- Backend tests contain meaningful exact status/body and sensitive-field
  assertions, including generic login failures, forbidden role paths,
  customer-safe projections, transaction error envelopes, and audit redaction.
- The disposable replica set run exercised 45 real transaction/migration tests,
  including backup restore, decimal fidelity, rollback and atomic migration.
- Frontend Jest ran all 27 suites with 202 tests and no snapshots.
- Playwright retries are `0`, workers are `1`, and each viewport is a separate
  project; the missing-account fixture fails closed rather than reporting a
  silent role pass.
- Transaction CI uses an ephemeral `tmpfs` Mongo topology, waits for a writable
  primary, and always cleans the stack.
- Unique transaction database names include worker, node and UUID; real tests
  drop only their own database in `finally`.

### Weaknesses and reliability risks

- `backend/tests/backend_test.py` conditionally module-skips based on a local
  `.env`/URL. This makes the same “complete backend suite” mean “HTTP smoke
  exercised” locally and “HTTP smoke absent” in CI.
- `test_admin_studio_quality_workflow.py` and parts of
  `test_transaction_topology_files.py` assert YAML/source text. They prove
  declarations exist, not that CI executed the command or that the topology
  behaved correctly.
- Frontend Auth/API/GSAP tests use broad mocks. They are appropriate for
  component state but cannot prove backend contract, cookie/session transport,
  network failure, or browser data boundaries.
- Many backend domain tests use fake collections; real Mongo coverage is
  limited to the selected transaction/migration modules and does not exercise
  all catalog, order, storage, notification, or production adapter paths.
- Time-sensitive fixtures call `datetime.now(timezone.utc)` for reservation
  expiry and token expiry. They are currently safely separated by minutes or
  hours, but no clock-freezing policy prevents boundary flakiness.
- Random UUIDs are used intentionally for isolation, but no seeded random-data
  or repeated-flake job exists.
- No retry/flake quarantine policy, test duration budget, JUnit/JSON publication,
  or raw-result checksum ties generated reports to a SHA.
- No statement, branch, function, or line coverage is collected. The
  pre-existing `.coverage` file has unknown provenance and was excluded.
- No lint, type-check, dependency vulnerability, performance, visual
  regression, browser, or accessibility job is part of the release workflow.

## 10. CI quality-gate analysis

| Gate | Current state | Assessment |
| --- | --- | --- |
| Reproducible install | Backend installs from `requirements.txt`; frontend uses `npm ci` and lockfile; package declares Yarn; Node version differs local/CI | Partial; policy is not single-source |
| Backend test | `python -m pytest -q backend/tests` | Present, but conditional external module skips and no unexpected-skip assertion |
| Real transaction test | Six modules in isolated Mongo job, no `continue-on-error` | Strong selected gate; backup/restore module omitted |
| Migration test | Identity/granular migrations in transaction job; catalog migration in general job | Partial; backup/restore and all migration paths are not one mandatory gate |
| Frontend Jest | `npm test -- --watchAll=false --runInBand` | Present and passed locally |
| Production build | `npm run build` with empty public URL in CI | Compile is gated; sitemap/robots release artifact is skipped or fails locally and is not asserted |
| Browser E2E | No workflow job | Missing critical gate |
| Accessibility | No workflow job | Missing critical gate; only local axe suite exists |
| Lint/type-check | No scripts/workflow command | Missing gate |
| Security audit | No `pip-audit`, `npm audit`, SAST, or equivalent workflow | Missing gate |
| Coverage | No config, command, threshold, or artifact | Missing gate |
| Artifact/result publication | No XML/JSON/HTML upload or raw-result reconciliation | Missing release evidence |
| Performance/visual regression | No test/configuration found | Not available; must be explicit before claiming broad QA |

## 11. Test-result reconciliation

Raw command output is the evidence of record for this audit. The historical
`test_reports/pytest/pytest_results.xml` (31 tests, one failure, no SHA) and the
untracked `.coverage` file were not reconciled as current results. The
Playwright list output reported 140 tests, while failure attachments under
`frontend/test-results` have no repository-SHA provenance; they are retained as
diagnostic artifacts only. No current XML, JSON, Markdown, or CI result exists
to override the raw console results.

## 12. Findings

### QA-001 — Complete backend CI command permits critical external tests to disappear

- Severity: `P1`
- Status: `open`
- Confidence: 92%
- Category: missing critical test; false-positive release signal; environment parity
- Expected behavior: the complete backend gate must either run the legacy HTTP
  journey against an approved current non-production service or fail explicitly
  when its required environment is absent. Unexpected skips must not produce a
  green release signal.
- Actual behavior: `backend/tests/backend_test.py:23-36` reads a local
  `.env`/URL and module-skips when absent; `.github/workflows/quality-gates.yml:32-33`
  invokes the complete suite without an endpoint or skip policy. With the local
  URL present but no service, eight HTTP tests failed with connection refused
  while credential-dependent cases skipped.
- Evidence: `backend/tests/backend_test.py:23-50`,
  `.github/workflows/quality-gates.yml:32-33`.
- Verification: `python -m pytest -n 0 -q backend/tests`.
- Impact: login, order, catalog/material, portfolio, settings, file and
  notification journeys represented only by this legacy suite can be absent from
  CI without a dedicated failure.
- Probable cause: external smoke tests are mixed into a complete backend
  collection without an explicit service fixture or required-skip policy.
- Recommendation: separate service-backed smoke from repository-native tests and
  make CI publish/fail on unexpected skip counts in an approved non-production
  environment.
- Acceptance criteria: CI shows the external suite collected and executed,
  reports raw pass/fail/skip counts, and fails if its endpoint/credentials are
  missing; no credential value is stored in the repository.
- Dependencies: approved disposable API environment and account owner.
- Human decision required: supported CI test-environment ownership and whether
  this legacy suite remains a release gate.
- First observed SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.

### QA-002 — Browser authorization, responsive, and accessibility suites are not CI gates

- Severity: `P1`
- Status: `environment_blocked`
- Confidence: 98%
- Category: missing CI gate; insufficient permission coverage; environment-blocked verification
- Expected behavior: critical role, forbidden-route, responsive, keyboard,
  reduced-motion, and WCAG checks must contribute to a release signal.
- Actual behavior: the two workflows contain no Playwright or axe command. The
  local full run was `8 passed, 4 skipped, 128 environment-blocked failures`;
  only sign-in and unauthenticated redirect evidence passed. The fixture
  correctly raises when five role accounts are absent.
- Evidence: `.github/workflows/quality-gates.yml:15-58`,
  `frontend/e2e/fixtures.js:48-68`, `frontend/e2e/accessibility.spec.js:18-46`,
  `frontend/e2e/responsive.spec.js:18-20`.
- Verification: `npx playwright test`.
- Impact: UI/server authorization disagreement, direct forbidden-route access,
  Admin data-boundary regressions, mobile overflow, keyboard and WCAG
  regressions can merge without a trusted gate.
- Probable cause: browser QA is manual-runbook-only and depends on seeded
  accounts/current backend.
- Recommendation: add an approved disposable browser job with seeded non-
  production accounts, separate API origin, all four viewport projects, and
  explicit skip/failure publication.
- Acceptance criteria: all role expectations execute against the current API;
  all four projects report; no credential-dependent test is silently skipped;
  axe output and browser artifacts are published with SHA provenance.
- Dependencies: seeded role accounts, current backend/frontend service, browser
  binaries, and CI secret-handling approval.
- Human decision required: CI browser environment owner and account lifecycle.
- First observed SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.

### QA-003 — Release build verification is blocked by public-origin configuration and lacks artifact assertions

- Severity: `P1`
- Status: `environment_blocked`
- Confidence: 95%
- Category: environment-blocked verification; missing release gate
- Expected behavior: a production build must compile and generate validated
  release artifacts (`sitemap.xml`/`robots.txt`) from an approved public origin.
- Actual behavior: local `npm run build` compiled successfully but `postbuild`
  exited 1 because the configured origin was not an approved absolute
  production origin. CI sets `REACT_APP_PUBLIC_SITE_URL` to an empty string
  (`.github/workflows/quality-gates.yml:54-58`), which causes the release script
  to skip sitemap generation rather than assert the artifact.
- Evidence: `frontend/scripts/generate-release-files.js:12-37`,
  `.github/workflows/quality-gates.yml:54-58`.
- Verification: `npm run build`.
- Impact: “build passed” does not establish a deployable release artifact or
  canonical metadata; deployment checklist requirements remain unverified.
- Probable cause: public-origin configuration is intentionally withheld, but
  the CI gate does not separate compile-only verification from release-artifact
  verification.
- Recommendation: keep public-origin selection outside this audit, but define a
  separately approved non-production origin test and assert artifact presence
  and content when that gate is enabled.
- Acceptance criteria: compile-only and artifact-producing jobs are named
  separately; artifact job fails on missing/invalid origin and publishes
  checksums; no placeholder origin is accepted.
- Dependencies: approved public/non-production origin and release owner.
- Human decision required: origin and sitemap/robots verification policy.
- First observed SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.

### QA-004 — Backup/restore evidence is not part of the mandatory transaction CI gate

- Severity: `P2`
- Status: `open`
- Confidence: 98%
- Category: missing migration/backup gate
- Expected behavior: backup capture, tamper verification, decimal fidelity,
  populated-target refusal, and exact restore must run in the same disposable
  topology used for migration readiness.
- Actual behavior: `backend/tests/test_migration_backup_restore.py` ran four
  tests successfully in the disposable local replica set, but
  `.github/workflows/transaction-tests.yml:43-54` lists six modules and omits
  the backup/restore module.
- Evidence: `backend/tests/test_migration_backup_restore.py:1-25`,
  `.github/workflows/transaction-tests.yml:43-54`.
- Verification: the exact local transaction command including
  `test_migration_backup_restore.py`.
- Impact: CI can pass while restore integrity and backup safety regress.
- Probable cause: the transaction workflow was expanded for identity/inventory
  modules without adding the backup exercise.
- Recommendation: add the existing test to a separately approved CI change and
  require raw result publication; do not run it against real data.
- Acceptance criteria: disposable CI run executes and reports the backup/restore
  module with zero unexpected skips; cleanup is guaranteed.
- Dependencies: CI Docker capacity and migration owner.
- Human decision required: whether backup/restore is a release gate or a
  scheduled operational rehearsal.
- First observed SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.

### QA-005 — Workflow contract tests can pass without executing the workflow

- Severity: `P2`
- Status: `open`
- Confidence: 93%
- Category: false-positive test; implementation-detail assertion
- Expected behavior: quality gates prove the command ran and produced the
  expected result, not only that a string appears in YAML.
- Actual behavior: `backend/tests/test_admin_studio_quality_workflow.py:11-35`
  asserts command and path substrings in workflow files. It cannot detect a
  failing remote job, an unexpected skip, a wrong working directory, or an
  artifact/report mismatch.
- Evidence: `backend/tests/test_admin_studio_quality_workflow.py:11-35`.
- Verification: `python -m pytest -n 0 -q backend/tests/test_admin_studio_quality_workflow.py`.
- Impact: a green repository-native test can coexist with a broken or
  unexecuted CI release gate.
- Probable cause: static workflow contracts were used as a substitute for CI
  execution evidence.
- Recommendation: retain static contracts only as guardrails and pair them with
  required CI job results, skip-count checks, and artifact publication.
- Acceptance criteria: merge protection consumes actual workflow conclusions;
  static contract tests are explicitly labeled non-execution checks.
- Dependencies: CI result publication and branch protection ownership.
- Human decision required: required checks and merge-gate policy.
- First observed SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.

### QA-006 — Coverage, lint/type, dependency-security, performance, and visual signals are absent

- Severity: `P2`
- Status: `open`
- Confidence: 96%
- Category: missing CI gate
- Expected behavior: release verification either runs or explicitly records
  approved non-applicability for coverage, static quality, dependency
  security, performance, and visual regression.
- Actual behavior: `frontend/package.json` exposes only `start`, `build`,
  `postbuild`, and `test`; the two workflows run pip check/compile/tests/build
  but no coverage threshold, lint, type-check, `pip-audit`/`npm audit`,
  performance, visual, or artifact-report job.
- Evidence: `frontend/package.json:14-20`, `.github/workflows/quality-gates.yml:26-58`,
  `.github/workflows/transaction-tests.yml:26-57`.
- Verification: static `rg` probes for coverage/lint/type/security/performance/
  visual commands.
- Impact: untested permission branches, exception/rollback behavior, known
  dependency risk, browser-specific regressions, and performance degradation
  can escape the nominal green gates.
- Probable cause: the quality workflow is a narrow unit/compile/transaction
  baseline rather than a complete release-verification policy.
- Recommendation: define thresholds and owners first, then add bounded gates;
  do not infer readiness from test counts alone.
- Acceptance criteria: each applicable signal has a reproducible command,
  threshold, artifact, owner, and explicit blocked/not-applicable status.
- Dependencies: approved toolchain and release policy.
- Human decision required: coverage thresholds, supported static-analysis tools,
  browser matrix, and performance budget.
- First observed SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.

### QA-007 — Local and CI test environments are not reproducibly equivalent

- Severity: `P2`
- Status: `open`
- Confidence: 90%
- Category: test infrastructure issue; environment parity
- Expected behavior: the documented local command and CI command should be
  reproducible under a supported runtime, or the difference should be an
  explicit, owned limitation.
- Actual behavior: local configured xdist execution failed before tests with
  Windows `WinError 6`; serial fallback passed. Local Node is 24.14.0 while CI
  uses Node 22; the package declares Yarn while CI/local use npm; no backend
  virtualenv exists locally.
- Evidence: `backend/pytest.ini:1-9`,
  `docs/context/production-readiness-audit/AUDIT_BASELINE.md:100-140`.
- Verification: `python -m pytest -q backend/tests` and runtime/package probes.
- Impact: a local green serial result is not evidence that the configured
  two-worker command or CI dependency graph is green; worker/order/shared-state
  regressions may be missed.
- Probable cause: Windows process-handle behavior and an unresolved package/
  runtime policy.
- Recommendation: document supported local runner/serial fallback and
  reconcile Node/package-manager/Python environment policy in a separate
  governance change.
- Acceptance criteria: supported versions and package-manager path are
  authoritative; CI and disposable local verification produce comparable
  collection/skip/result counts.
- Dependencies: maintainer decision on supported toolchain and Windows CI
  support.
- Human decision required: canonical package manager and local-vs-CI parity
  policy.
- First observed SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.

## 13. Remediation phases (audit advice only)

1. **Gate inventory and ownership:** decide which external API, browser,
   backup/restore, coverage, static, security, and performance signals are
   release gates; assign environment owners without adding credentials to the
   repository.
2. **Reproducible test contract:** reconcile Node/Python/package-manager
   versions, provide a supported backend environment, make unexpected skips
   visible, and retain the safe serial Windows fallback until xdist parity is
   proven.
3. **Critical integration gates:** run the current backend against an approved
   disposable API/Mongo environment; add backup/restore to the transaction
   gate; publish raw counts and artifacts.
4. **Browser/accessibility gate:** seed short-lived non-production role
   accounts, run all viewport projects against the current API, publish axe
   and trace evidence, and keep human screen-reader review separate.
5. **Quality-depth signals:** add approved coverage/static/security/performance/
   visual thresholds with owners and review dates; do not use coverage as a
   proxy for authorization or data-boundary correctness.

## 14. Acceptance criteria for closing Layer 07

- Current authority-to-test traceability is maintained for every critical flow.
- Complete backend, frontend, transaction, migration, browser, responsive and
  accessibility commands have reproducible environments and explicit
  pass/skip/fail counts.
- Unexpected skips cannot make a required gate green.
- Real replica-set transaction and backup/restore evidence is mandatory in the
  agreed CI scope.
- Role, customer-data, direct-forbidden-route, negative, conflict, retry,
  rollback, and sensitive-field paths have representative integration/E2E
  evidence.
- Build release artifacts are validated from an approved origin, with no
  placeholder or silently skipped sitemap/robots gate.
- Raw results, report artifacts, SHA, runtime, and environment provenance are
  published without secrets.
- No applicable P0/P1 remains open before a release-candidate recommendation.

## 15. Resume handoff

- Audit state: `complete` for this repository/static and safely runnable local
  scope; re-open as `requires_revalidation` when HEAD, authority, dependencies,
  CI, or blocked environments change.
- Completed: authority review; current suite inventory; 475-test collection;
  native backend run; real Mongo transaction/migration/backup run; frontend
  Jest; build; browser smoke/full attempt; CI and test-quality review;
  traceability, critical-flow matrix, skip register, findings, scoring, and
  remediation.
- Incomplete: approved role-account browser matrix; separate API-origin
  authorization E2E; production-like/staging smoke; CI execution result;
  cross-browser engines; human screen-reader review; coverage/static/security/
  performance/visual gates.
- Last files inspected: this layer’s source/test/CI inventory, both workflow
  files, frontend package and Playwright config, browser and transaction
  runbooks, canonical Master Spec and approved access/auth/architecture
  decisions.
- Last commands: `python -m pytest -q backend/tests`; serial backend/native and
  real replica-set commands; `npm test -- --watchAll=false --runInBand`;
  `npm run build`; targeted and full `npx playwright test`; compile/pip check.
- Blockers: approved non-production API and role accounts; CI browser/Docker
  environment; public-origin artifact policy; canonical toolchain/package
  manager; missing coverage/static/security/performance/visual policy.
- Findings requiring revalidation: `QA-001` through `QA-007`; all become
  stale if workflow, package/runtime, test, fixture, or authority paths change.
- Next exact step: obtain decisions/owners for CI external API, browser
  accounts, artifact origin, backup gate, and toolchain; then rerun the exact
  blocked commands and update raw result reconciliation before any readiness
  recommendation.
- Baseline SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.
- Timestamp: 2026-07-28 03:38:25 WIB (UTC+07:00).

## 16. Changelog

### 2026-08-07 — Backend quality baseline (10.3)

- Added a report-only full-codebase Flake8, Mypy, Black, and isort collector to
  the backend CI job, with raw artifacts, command/runtime/SHA provenance, and
  explicit ownership for legacy findings.
- Existing critical/scoped checks remain required; no whole-codebase threshold
  is claimed until the owner decision and ratchet date are recorded.

### 2026-07-28 — Deep Layer 07 audit

- Replaced the initialization placeholder with current test inventory,
  requirement traceability, critical-flow matrix, skip/blocked register,
  quality assessment, CI gate analysis, raw-result reconciliation, findings
  `QA-001` through `QA-007`, score rationale, remediation phases, and resume
  handoff.
- Verified backend native (`442 passed, 7 skipped` excluding the external
  suite), real disposable Mongo (`45 passed`), frontend Jest (`202 passed`),
  compile/pip checks, build failure at the public-origin release gate, and
  Playwright smoke/full results.
- No source, test, fixture, dependency, workflow, secret, migration, commit,
  push, or production action was changed.
