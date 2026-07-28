# Layer 08 — DevOps, Deployment, and Operations

Status: Context Only — Audit Evidence and Progress Tracker — Not Implementation Authority

## 1. Audit result

| Field | Result |
| --- | --- |
| Audit status | `complete` for repository/static scope; production-like evidence remains blocked |
| Audit completion | **92%** |
| Repository build readiness | **72 / 100** |
| CI readiness | **45 / 100** |
| Staging readiness | **20 / 100** |
| Production infrastructure readiness | **5 / 100** |
| Operational readiness | **25 / 100** |
| Overall Layer 08 score | **29 / 100** |
| Confidence | **86%** for repository/static findings; **42%** for external environment claims |
| Findings | 0 P0, 10 P1, 2 P2 |
| Baseline SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Audit timestamp | 2026-07-28 03:36 WIB (UTC+07:00) |

The score is capped by the absence of deployable topology, artifact
publication, staging/production evidence, tested restore, monitoring,
ownership, and explicit production/go-live approval. The score does not imply
that external infrastructure is absent; it means the repository contains no
verifiable evidence for it.

## 2. Scope and authority

Included: build reproducibility, package/runtime contract, repository workflow,
tracked CI, environment examples and defaults, Compose/topology files,
migrations and transaction gates, provider-neutral storage/payment boundaries,
release/rollback/runbooks, backup/restore, network boundary documentation,
operational ownership, and production verification evidence.

Excluded: provider selection or provisioning, cloud/DNS/TLS/firewall changes,
secret access or rotation, deployment, migration/backup/restore against real
data, workflow/config/source changes, Git publication, and go-live approval.

Authority reviewed in canonical order:

| Source | Classification | Use |
| --- | --- | --- |
| `AGENTS.md` | Active Guardrail | Read-only audit, provider-neutral and fail-closed constraints |
| `docs/NIUVA_MASTER_SPEC.md` | Approved Canonical | Production boundary, transaction, storage, payment, migration and handover principles |
| `docs/context/DOCUMENT_REGISTER.md` | Approved Canonical | Authority and runbook classification |
| `docs/decisions/DECISION_REGISTER.md` | Approved Canonical | Open provider, readiness and go-live decisions |
| `ADR-001-mongodb-transaction-capability.md` | Approved Baseline | Replica-set and fail-closed mutation gate |
| `ADR-002-production-file-storage-architecture.md` | Approved with Open Decisions | Private provider-neutral storage boundary |
| `ADR-003-retail-payment-orchestration-boundary.md` | Approved with Open Decisions | Provider-neutral online payment boundary |
| `doc/PRODUCTION_DEPLOYMENT.md` | Runbook | Build, headers, readiness, release and rollback procedure |
| `doc/ROLLOUT_AND_HANDOVER_RUNBOOK.md` | Runbook | Staging smoke, canary, post-deploy and handover |
| `doc/MIGRATION_BACKUP_RESTORE_RUNBOOK.md` | Runbook | Backup/verify/restore exercise |
| `doc/TRANSACTION_CAPABILITY_RUNBOOK.md` | Runbook, development/CI only | Local and isolated CI transaction topology |
| `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md` | Runbook | Identity migration, backup, rollback and handoff |
| `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md` | Runbook | Catalog/inventory rollout, rollback and recovery |
| `docs/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md` | Runbook | Credential incident procedure; status remains verification pending |

The audit methodology and baseline are Context Only and cannot authorize
implementation or production activity.

## 3. Repository baseline and working-tree safety

Observed at the recorded baseline:

| Item | Evidence |
| --- | --- |
| HEAD | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Branch | `feat/marketing-redesign-dec-ux-002` |
| Pre-existing tracked change | `docs/implementation/specs/active/2026-07-27-admin-auth-phase-1-implementation-authorization-packet.md` |
| Pre-existing untracked items | `.coverage` and `docs/context/production-readiness-audit/` |
| Audit-created generated output | `frontend/output/` was created for the temporary build check and must be removed before handover |
| Local `origin/main` | It advanced during this session to `f56a9d2`; this remote movement was not used as the audit baseline |
| Remote default branch | `main`, observed with read-only `git ls-remote --symref origin HEAD` and `gh api` |
| Branch protection | GitHub API returned `404 Branch not protected`; rulesets API returned `[]` |
| Tags | No local tags were listed |

No reset, checkout, rebase, commit, push, deployment, or settings mutation was
performed. The remote ref movement is a revalidation trigger for future audits.

## 4. Build and release evidence

### 4.1 Positive build controls

- Frontend `CRACO` production compilation succeeded twice with the same
  controlled, non-production origins and `GENERATE_SOURCEMAP=false`.
  Both manifests matched byte-for-byte: 86 files, 2,213,625 bytes, zero
  source maps. The command used `npx.cmd craco build` with a temporary
  `BUILD_PATH`; it did not overwrite `frontend/build`.
- `python -m compileall -q backend` exited `0`.
- `python -m pip check` exited `0` in the global Python environment.
- `docker compose -f docker-compose.transaction.yml config --quiet` and the
  corresponding transaction-test command both exited `0`.
- `git diff --check` exited `0`.

These are local/static checks. The global Python environment is not a locked
project environment, and the synthetic origins do not prove a confirmed
production origin.

### 4.2 Reproducibility gaps

- `frontend/package.json:117` declares Yarn 1.22.22 while the tracked lockfile
  is npm lockfile v3 (`frontend/package-lock.json:1-9`) and the deployment
  runbook requires `npm ci` (`doc/PRODUCTION_DEPLOYMENT.md:28-29`). Yarn is not
  available in the audit environment.
- Several frontend dependencies use ranges (`frontend/package.json:6-37`);
  the lockfile makes npm resolution reproducible, but the declared package
  manager and Yarn-only `resolutions` block are not aligned with the npm CI
  path.
- `backend/requirements.txt:1-29` mixes exact pins with unbounded `>=` ranges
  and contains test/lint/type-check tooling in the same install set. There is
  no backend lockfile, hash-checked requirements file, or supported runtime
  declaration in the repository.
- CI uses Python `3.14.3` but Node `22` (major only) and `ubuntu-latest`
  (`.github/workflows/quality-gates.yml:17-26,36-47`); the production runtime
  is not pinned by a container or deployment manifest.
- `frontend/package.json:38` runs a postbuild script. The script skips sitemap
  generation when the public URL is empty (`frontend/scripts/generate-release-files.js:12-17`)
  and rejects localhost/non-origin values (`:20-36`). CI explicitly sets the
  public URL to empty (`.github/workflows/quality-gates.yml:55-58`), so its
  successful build is not a complete SEO release artifact.

## 5. Workflow inventory

| Workflow | Trigger | Jobs | Quality gates | Secrets | Artifact | Deployment target | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `quality-gates.yml` | `pull_request` for backend/frontend/docs/workflows; `workflow_dispatch` | Backend and frontend | pip install/check, compile, backend pytest; `npm ci`, Jest, CRACO build | None | None | None | Useful PR checks; no lint/type-check/security/browser/a11y/migration/artifact/release gate |
| `transaction-tests.yml` | `pull_request` for backend/Mongo scripts/Compose/workflow; `workflow_dispatch` | Isolated Mongo `rs-test` | pip install, Compose startup, writable-primary wait, six real transaction/migration modules, cleanup | None | None | None | Strong isolated transaction gate; no publication or deployment |

Both workflows use mutable action tags (`actions/checkout@v4`,
`setup-python@v5`, `setup-node@v4`) and no concurrency/cancel policy. There is
no `push` trigger, no release/tag trigger, no artifact upload, no staging
promotion, no production approval gate, no smoke execution, and no automated
rollback. Direct work on the active feature branch is therefore not
automatically covered by the local workflows.

## 6. Environment matrix

| Environment | Frontend | Backend | Database | Storage | Secrets/config | Observability | Deployment method | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Development | CRA/CRACO; local `.env` exists (values not read) | Uvicorn/local process; `backend/.env` exists (values not read) | `docker-compose.transaction.yml`, `rs0` | Local adapter allowed only for `development/demo/test` (`backend/storage.py:44-58`) | `.env.example` documents names; mutation flag defaults false | Logs plus `/api/health*` | Local process + Docker Compose | Verified Compose config; no production parity |
| Test/CI | Jest/CRACO build; no browser server in workflow | Piped requirements install | Ephemeral `rs-test` tmpfs in `transaction-tests.yml` | No durable production storage assumption | CI-supplied non-secret topology URL; no production secret evidence | Test output only | GitHub Actions runner | Workflow and Compose tracked; real run not executed here |
| Preview | No tracked preview host or environment manifest | No evidence | Unknown | Unknown | Unknown | Unknown | Unknown | Not evidenced |
| Staging | Runbook placeholder only (`staging.example`) | Runbook smoke target only | Required replica set, but topology/credentials absent | Candidate only after ADR-002 gates | No staging secret/config evidence | No dashboards/alerts or owner evidence | No deployment manifest | Environment-blocked |
| Production | Provider-neutral runbook only | No production image/process/deployment manifest | ADR-001 requires persistent monitored replica set; none evidenced | `STORAGE_BACKEND=disabled` until private persistent provider is approved (`doc/PRODUCTION_DEPLOYMENT.md:95,128`) | Secret names documented; values and secret manager absent | No production telemetry, SLO, on-call or alert evidence | No hosting/IaC/reverse-proxy config | Production readiness and go-live remain open |

## 7. Container, infrastructure, network and provider boundary

- The only tracked container topology is the two Mongo Compose files. They use
  floating `mongo:7.0` tags, have no digest pin, no application Dockerfile,
  no app container user, no resource limits, no reverse proxy, and no
  deployment manifest.
- `doc/PRODUCTION_DEPLOYMENT.md:69-83` contains a draft CSP/header set, but
  no host/CDN configuration or staging response evidence proves it is active.
  HSTS is correctly conditional on confirmed HTTPS, but the API host remains a
  placeholder.
- CORS is exact-origin guarded in `backend/server.py:1328-1342`, but the
  default is localhost and no production origin evidence exists. The backend
  rate limiter is process-local (`backend/server.py:385-402`), so it is not a
  multi-instance deployment control.
- The storage implementation is local/disabled only (`backend/storage.py:1-58`,
  `:160-197`); no production adapter, private object namespace, malware
  quarantine, quota, or object restore implementation is tracked.
- Payment capability reports provider-neutral/inactive and disables manual
  transfer (`backend/server.py:630-648`); no gateway or webhook deployment is
  authorized.

## 8. Database, migration and transaction readiness

Positive controls:

- `ADR-001` and `doc/TRANSACTION_CAPABILITY_RUNBOOK.md` require replica-set
  capability and fail-closed `503 transaction_unavailable`; the tracked CI
  workflow supplies `rs-test` and does not use `continue-on-error`.
- Migration 006 requires a transaction-capable guard and an explicit,
  non-overwriting migration backup (`backend/migrations/006_granular_role_policy.py:279-324`).
- `backend/migration_backup.py:70-120,140-194` refuses snapshot overwrite,
  verifies content digests, refuses populated-target restore by default, and
  drops collections created after the snapshot.
- Runbooks require backup, dry-run, validation, second-run/no-op and
  capability checks before apply (`docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md:65-80,138-180`;
  `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md:33-72`).

Gaps:

- The migration scripts have no repository-wide migration registry, distributed
  lock, deployment serialization contract, or old/new schema compatibility
  matrix. Migration 005 renames three collections sequentially without a
  transaction or resume marker (`backend/migrations/005_archive_orphan_collections.py:32-45`).
  A process failure or concurrent application can leave a partial archive.
- `doc/MIGRATION_BACKUP_RESTORE_RUNBOOK.md:11-24` defines the required exercise,
  but no current isolated capture/restore result is recorded for this SHA.
- No production database, migration window, backup, restore, or data-volume
  evidence was accessed or used.

## 9. Release-gate matrix

| Gate | Required evidence | Current evidence | Status | Blocking |
| --- | --- | --- | --- | --- |
| Exact build/install | Clean install, locked runtime and dependency resolution | Frontend lock + deterministic local build; backend ranges/global env | `partial` | Yes |
| CI quality | Tests, lint, type-check, security/dependency/secret scans | Two workflows: tests/compile/build and real transaction tests | `partial` | Yes |
| Artifact identity | Exact SHA, manifest, integrity, publication | Build hashes generated locally; no upload/signature/release manifest | `missing` | Yes |
| Environment separation | Dev/test/preview/staging/prod config and secret separation | Dev/test examples only; staging/prod absent | `environment_blocked` | Yes |
| Transaction readiness | Replica set, probe, fail-closed gate per environment | Local/CI files and code; no staging/prod evidence | `partial` | Yes |
| Migration | Ticket, dry-run, backup, validation, compatibility, rollback | Runbooks and guarded code; no current rehearsal | `partial` | Yes |
| Backup/restore | Capture, checksum, isolated restore, measured result, owner | Guarded utility/runbook; no execution/owner/RPO/RTO | `missing` | Yes |
| Storage | Private adapter, ownership, scan/quarantine, backup, quota | Provider-neutral decision; local/disabled adapter only | `blocked_by_decision` | Yes |
| Payment | Approved gateway, webhook/auth, reconciliation and refund ops | Provider-neutral inactive boundary only | `blocked_by_decision` | Yes |
| Release approval | Owner, version/tag, change approval, canary, smoke, comms | Checklists/runbooks; no release record or owner evidence | `missing` | Yes |
| Rollback | Artifact redeploy, API compatibility, DB restore trigger and proof | Runbook only; no rehearsal | `partial` | Yes |
| Network boundary | TLS/DNS/proxy/CORS/headers/cache/limits evidence | Draft host rules and code CORS; no deployed response | `environment_blocked` | Yes |
| Monitoring/incident | SLI/SLO, alerts, on-call, escalation and handover | No tracked monitoring/incident runbook or owners; Layer 09 confirms gap | `missing` | Yes |
| Production/go-live | Explicit approval and production-like verification | Decision Register keeps both open | `blocked_by_decision` | Yes |

## 10. Findings

### OPS-001 — Package manager and runtime contract are not one reproducible path

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P1 / `open` / 98% |
| Category | Missing build control; configuration risk |
| Expected behavior | One supported package manager, lockfile, exact runtime and deterministic dependency install for CI and release. |
| Actual behavior | Yarn metadata conflicts with npm lockfile/runbook; backend requirements contain open ranges and no lock/hash runtime contract. |
| Evidence | `frontend/package.json:117`; `frontend/package-lock.json:1-9`; `doc/PRODUCTION_DEPLOYMENT.md:28-29`; `backend/requirements.txt:1-29`; `.github/workflows/quality-gates.yml:23-26,45-50` |
| Verification | `node --version` → `v24.14.0`; `npm --version` → `11.18.0`; `python --version` → `3.14.3`; `python -m pip check` exited 0 in global env. |
| Impact | CI and a future deployment can resolve different dependency graphs or runtime behavior. |
| Root cause | Package-manager migration and backend dependency strategy were not reconciled. |
| Recommendation | Approve one manager; align metadata/lockfile/CI/runbook; create a locked, hash-checked backend release set and exact supported runtime. |
| Acceptance criteria | Fresh isolated installs from the approved manifests produce identical dependency manifests and the same artifact across two runs. |
| Dependencies / human decision | Package manager, Python/Node runtime policy, production dependency split. |
| First / last verified SHA | `c28684d` / `c28684d` |

### OPS-002 — CI does not implement the required release quality gates

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P1 / `open` / 98% |
| Category | Missing CI gate |
| Expected behavior | PR/release automation covers lint, type-check, tests, build, dependency/secret scans, browser/a11y, migration validation, artifact publication, approval, smoke and rollback evidence. |
| Actual behavior | Workflows run compile/tests/build and isolated transaction tests only; no artifact, deploy, approval, scan, E2E, accessibility, lint or type-check job exists. |
| Evidence | `.github/workflows/quality-gates.yml:1-59`; `.github/workflows/transaction-tests.yml:1-62`; `frontend/playwright.config.js:1-37` |
| Verification | `git ls-files .github/workflows`; two workflow files only; no deployment workflow or artifact upload path. |
| Impact | A green PR can still ship an unscanned, unbrowser-tested or untraceable release. |
| Root cause | CI scope stops at repository tests and local transaction verification. |
| Recommendation | Define a separate approved release pipeline and required checks; keep deployment/provider choices outside this audit. |
| Acceptance criteria | Every required gate has an executable job, explicit failure policy, provenance and a named approval boundary. |
| Dependencies / human decision | Security scan tooling, browser/DB test infrastructure, artifact registry and release owner. |
| First / last verified SHA | `c28684d` / `c28684d` |

### OPS-003 — Deployable topology and artifact publication are not evidenced

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P1 / `environment_blocked` / 97% |
| Category | Infrastructure evidence gap; deployment gap |
| Expected behavior | A reviewed application image/hosting topology, process model, ports, health checks, persistence, and artifact promotion path exist for each deployable environment. |
| Actual behavior | Tracked infrastructure is limited to local/CI Mongo Compose; no application Dockerfile, IaC, hosting manifest, reverse proxy or artifact upload/publication exists. |
| Evidence | `docker-compose.transaction.yml:1-49`; `docker-compose.transaction-test.yml:1-47`; `doc/PRODUCTION_DEPLOYMENT.md:1-6` |
| Verification | `git ls-files` probe for Dockerfile/IaC/hosting/reverse-proxy manifests returned no matches. |
| Impact | Staging/production deployment, persistence and rollback cannot be independently reproduced or verified. |
| Root cause | Hosting/topology decision remains outside the approved repository scope. |
| Recommendation | Obtain an approved provider-neutral topology package and evidence contract before implementation or deployment work. |
| Acceptance criteria | Isolated staging deployment records exact artifact SHA, topology, health checks, persistence, logs and rollback target. |
| Dependencies / human decision | Hosting/topology, persistence, network and operations owner. |
| First / last verified SHA | `c28684d` / `c28684d` |

### OPS-004 — Environment and secret separation is documented only for development/test

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P1 / `environment_blocked` / 95% |
| Category | Configuration risk; production verification gap |
| Expected behavior | Dev, test, preview, staging and production have separate configuration, secrets, databases, storage, observability and safe missing-config behavior. |
| Actual behavior | `.env.example` files document local/test names and defaults; local `.env` files exist but were not read; no preview/staging/production manifests or secret-manager evidence is tracked. Backend requires `MONGO_URL`, `DB_NAME`, `JWT_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` at startup (`backend/server.py:74-82,1419-1432`). |
| Evidence | `backend/.env.example:1-30`; `frontend/.env.example:1-17`; `backend/server.py:74-82,1419-1432`; `backend/storage.py:44-58` |
| Verification | Environment file names were listed without opening values; no staging/prod config files were found by tracked-file inventory. |
| Impact | Missing or mis-scoped configuration can prevent startup, point to the wrong origin, or create unsafe operational drift. |
| Root cause | Environment management is external and provider-neutral, but no evidence contract or separation record is present. |
| Recommendation | Define redacted environment manifests, secret ownership/rotation references, database separation and parity checks; never commit values. |
| Acceptance criteria | Each environment has a redacted config manifest, secret reference, database/storage identity, safe failure test and owner. |
| Dependencies / human decision | Secret manager, environment owners, production origins and database topology. |
| First / last verified SHA | `c28684d` / `c28684d` |

### OPS-005 — Migration serialization and partial-failure controls are incomplete

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P1 / `open` / 93% |
| Category | Migration risk |
| Expected behavior | Concurrent deploys are serialized; migrations are resumable/idempotent, compatible across application versions, and leave a known state after partial failure. |
| Actual behavior | Migration 005 renames `internships`, `organizations` and `organization_memberships` sequentially with no transaction, lock or resume marker (`backend/migrations/005_archive_orphan_collections.py:32-45`). The repository has no migration registry or compatibility matrix. |
| Evidence | `backend/migrations/005_archive_orphan_collections.py:32-45`; `backend/migrations/001_identity_rbac_audit.py:13-32`; `backend/migrations/002_catalog_material_inventory.py:157-213`; `doc/ROLLOUT_AND_HANDOVER_RUNBOOK.md:20-22` |
| Verification | Read-only source inspection; migrations were not executed against any database. |
| Impact | A process crash or concurrent deployment can produce a mixed schema/archive state and complicate rollback. |
| Root cause | Migration procedures rely on operator sequencing rather than a repository-wide execution lock/state machine. |
| Recommendation | Add an approved migration ledger/lock and explicit compatibility, resume and failure-reconciliation contract before scheduling production migration. |
| Acceptance criteria | An isolated concurrent rehearsal proves one executor, safe retry/no-op behavior, partial-failure recovery and old/new application compatibility. |
| Dependencies / human decision | Migration owner, maintenance window, lock mechanism and schema compatibility policy. |
| First / last verified SHA | `c28684d` / `c28684d` |

### OPS-006 — Backup/restore and disaster-recovery evidence is not current

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P1 / `environment_blocked` / 96% |
| Category | Backup/restore gap; operational ownership gap |
| Expected behavior | Database and file backups have scope, encryption, retention, owner, checksum, isolated restore verification, RPO/RTO and corrective-action evidence. |
| Actual behavior | Backup utility and runbooks contain safety guards, but no current backup capture/restore result, production storage backup, RPO/RTO, retention owner, restore owner or DR drill is evidenced. ADR-002 explicitly leaves these open. |
| Evidence | `backend/migration_backup.py:70-120,140-194`; `doc/MIGRATION_BACKUP_RESTORE_RUNBOOK.md:11-24,49-84`; `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md:76-117` |
| Verification | No database was started for this audit and no backup/restore command was run. |
| Impact | A migration, data corruption or storage incident has no proven recovery time or complete recovery path. |
| Root cause | Recovery operations and owners remain unassigned/open decisions. |
| Recommendation | Rehearse capture/verify/restore/compare on isolated data, then approve retention, encryption, RPO/RTO and owners for database and object storage. |
| Acceptance criteria | Redacted evidence records environment, database, timestamp/timezone, digest, location class, reviewer, restore result, corrective action, RPO/RTO and owner. |
| Dependencies / human decision | Storage provider/adapter, backup system, restore owner, RPO/RTO and retention policy. |
| First / last verified SHA | `c28684d` / `c28684d` |

### OPS-007 — Release, rollback and handover controls are procedural but not owned or rehearsed

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P1 / `open` / 94% |
| Category | Rollback gap; operational ownership gap |
| Expected behavior | Every release has an owner, approved change, version/tag, exact artifact, migration/backup gate, smoke result, rollback trigger, communication and post-release monitoring. |
| Actual behavior | Runbooks describe checklists and artifact rollback (`doc/PRODUCTION_DEPLOYMENT.md:111-154`; `doc/ROLLOUT_AND_HANDOVER_RUNBOOK.md:1-103`) but contain no current release record, owner assignment, version/tag convention, canary evidence, communication plan, on-call roster or rollback rehearsal. |
| Evidence | `doc/PRODUCTION_DEPLOYMENT.md:111-154`; `doc/ROLLOUT_AND_HANDOVER_RUNBOOK.md:1-103`; `doc/TRANSACTION_CAPABILITY_RUNBOOK.md:1-3` |
| Verification | Tracked-file inventory found no release workflow, changelog/version file or deployment manifest; no deploy was attempted. |
| Impact | A failure may be recoverable in theory but not repeatably or accountably under incident pressure. |
| Root cause | Operational ownership and release-management decisions are still external/open. |
| Recommendation | Create an approved release record template and rehearse application rollback without database rewrite; define incident communication and escalation. |
| Acceptance criteria | A staging record links owner/change approval/version/artifact SHA, smoke output, rollback trigger/action, monitoring window and handover. |
| Dependencies / human decision | Release owner, incident/on-call owner, change approval and rollback window. |
| First / last verified SHA | `c28684d` / `c28684d` |

### OPS-008 — Storage and payment activation remain correctly blocked by open decisions

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P1 / `blocked_by_decision` / 99% |
| Category | Provider decision blocked; go-live approval gap |
| Expected behavior | Production upload/payment activate only after approved provider-neutral gates, ownership, security, backup/recovery and go-live evidence. |
| Actual behavior | Storage is local/disabled only and payment is provider-neutral/inactive; ADR-002/003 and the Decision Register leave provider, operations and go-live open. |
| Evidence | `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md:1-18,76-117`; `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md:1-18,95-152`; `backend/server.py:630-648`; `doc/PRODUCTION_DEPLOYMENT.md:95-96` |
| Verification | Static source/runbook inspection; no provider was selected or activated. |
| Impact | Activation before these gates would violate approved architecture and create unrecoverable operational risk. |
| Root cause | Provider and operational decisions are intentionally deferred. |
| Recommendation | Keep the boundaries disabled and route provider/retention/quota/reconciliation/RPO/RTO decisions through separate approval. |
| Acceptance criteria | Decision records, adapter tests, ownership, backup/restore, staging smoke and explicit production approval all exist before enablement. |
| Dependencies / human decision | Storage provider, payment gateway, Finance/reconciliation, retention/quota and go-live owner. |
| First / last verified SHA | `c28684d` / `c28684d` |

### OPS-009 — Network and production verification is not evidenced

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P1 / `environment_blocked` / 92% |
| Category | Network/production verification gap |
| Expected behavior | Staging/production prove HTTPS/TLS, DNS, trusted proxy, exact CORS, security headers, cache/routing, request limits, rate limits and private database access with response evidence. |
| Actual behavior | The deployment runbook has draft headers and host rules (`doc/PRODUCTION_DEPLOYMENT.md:69-108`); code has exact CORS and process-local limits, but no deployed response, proxy, timeout, firewall, DNS, TLS or multi-instance rate-limit evidence exists. |
| Evidence | `doc/PRODUCTION_DEPLOYMENT.md:69-108`; `backend/server.py:385-402,1328-1342`; `backend/server.py:839-845` |
| Verification | No staging/production endpoint was contacted; no network configuration was changed. |
| Impact | Security headers, origin policy, routing and abuse controls may differ from documented intent at the real boundary. |
| Root cause | Hosting/network topology and external controls are not represented in the repository. |
| Recommendation | Validate the exact deployed boundary in an approved staging environment and retain redacted headers, CORS, route, rate-limit and TLS evidence. |
| Acceptance criteria | Staging probes pass for direct/refresh routes, `/api`, headers, cache, CORS, limits and private DB reachability; production promotion requires the same evidence. |
| Dependencies / human decision | Reverse proxy/CDN, DNS/TLS owner, trusted proxy policy and rate-limit topology. |
| First / last verified SHA | `c28684d` / `c28684d` |

### OPS-010 — NIV-001 credential incident is not verified closed

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P1 / `open` / 99% |
| Category | Credential incident; production verification gap |
| Expected behavior | Old credential is revoked/rotated, rewritten refs are verified, affected PR/cache/fork surfaces are handled, fresh-clone checks pass, and a redacted closure decision is approved. |
| Actual behavior | `docs/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md:11-25` keeps status `Implemented, verification pending`; the runbook says not to treat the credential as safe until redacted revocation/rotation evidence exists. No closure evidence is present in this audit scope. |
| Evidence | `docs/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md:11-25,1256-1282`; `docs/context/BACKEND_AUDIT_TRACKER_2026-07-24.md:289-306` |
| Verification | Read-only runbook/tracker inspection; no credential, authentication, rewrite, force-push or GitHub Support action was performed. |
| Impact | Production access and repository history cannot be treated as incident-closed or safe for go-live claims. |
| Root cause | The approved isolated rewrite rehearsal and closure evidence remain pending. |
| Recommendation | Obtain explicit approval for the isolated rehearsal only, then collect the required redacted evidence package and final owner decision. |
| Acceptance criteria | All NIV-001 gates in section 15 are evidenced, reviewed and approved without exposing secret values; status changes separately from this audit. |
| Dependencies / human decision | Credential owner, incident owner, repository administrator, independent verifier and final approver. |
| First / last verified SHA | `c28684d` / `c28684d` |

### OPS-011 — Migration/backup runbook reference is inconsistent

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P2 / `open` / 99% |
| Category | Operational documentation gap |
| Expected behavior | Procedural references resolve to the canonical ADR/runbook path so operators do not select a stale technical source. |
| Actual behavior | `doc/TRANSACTION_CAPABILITY_RUNBOOK.md:6` references `doc/decisions/ADR-001-mongodb-transaction-capability.md`, while the canonical ADR is `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`. |
| Evidence | `doc/TRANSACTION_CAPABILITY_RUNBOOK.md:1-7`; `docs/context/DOCUMENT_REGISTER.md:63-69` |
| Verification | Literal path search; both files were read and only the `docs/decisions/architecture/` path exists. |
| Impact | An operator following the stale path may miss the approved transaction boundary or treat the runbook as broken. |
| Root cause | Documentation path was not reconciled after the canonical-document migration. |
| Recommendation | Correct the reference through a separately reviewed documentation-only change; do not alter the ADR or implementation in this audit. |
| Acceptance criteria | Link/path check resolves in CI and the runbook points to the canonical ADR. |
| Dependencies / human decision | Documentation owner; no provider or production decision is implied. |
| First / last verified SHA | `c28684d` / `c28684d` |

### OPS-012 — No current release versioning/changelog contract is tracked

| Field | Value |
| --- | --- |
| Severity / Status / Confidence | P2 / `open` / 96% |
| Category | Release-management gap |
| Expected behavior | A release has a human-readable version/change record, exact artifact SHA, migration note, owner and rollback reference. |
| Actual behavior | `frontend/package.json:1-4` remains `0.1.0`, no root version/changelog/release manifest is tracked, and workflows publish no artifact or tag. |
| Evidence | `frontend/package.json:1-4`; `.github/workflows/quality-gates.yml:1-59`; tracked-file inventory for `VERSION*`, `CHANGELOG*` and release manifests |
| Verification | `git ls-files` search for version/changelog/release artifacts; no matching tracked release record was found. |
| Impact | Operators cannot unambiguously identify, promote or audit a deployed build. |
| Root cause | Release management is described procedurally but not represented as a controlled repository artifact. |
| Recommendation | Approve a version/release-record convention tied to immutable artifact hashes and change approvals. |
| Acceptance criteria | Each candidate release has a version, source SHA, artifact manifest/hash, migration status, approver, rollback target and post-release record. |
| Dependencies / human decision | Release owner and versioning convention. |
| First / last verified SHA | `c28684d` / `c28684d` |

## 11. Positive controls

| Control | Evidence | Limitation |
| --- | --- | --- |
| Transaction mutation fail-closed architecture | `ADR-001`; `doc/TRANSACTION_CAPABILITY_RUNBOOK.md:8-31`; `.github/workflows/transaction-tests.yml:31-62` | Only local/CI topology is evidenced |
| Local and isolated test Compose definitions | `docker-compose.transaction.yml:1-49`; `docker-compose.transaction-test.yml:1-47` | No staging/production persistence or recovery proof |
| Deterministic frontend compile under controlled inputs | Two CRACO builds, identical 86-file SHA manifests, zero source maps | Postbuild sitemap needs a confirmed public origin; no artifact publication |
| Backup utility safety guards | `backend/migration_backup.py:70-120,140-194` | No current restore exercise or owner/RPO/RTO |
| Provider-neutral storage/payment boundaries | `ADR-002`, `ADR-003`, `backend/server.py:630-648` | Intentionally inactive; provider decisions remain open |
| Release and rollback procedures exist | `doc/PRODUCTION_DEPLOYMENT.md:111-154`; `doc/ROLLOUT_AND_HANDOVER_RUNBOOK.md:1-103` | Procedural only; no execution evidence or ownership record |

## 12. Remediation phases (audit advice only)

1. **Reconcile contracts:** choose the supported package manager/runtime and
   backend lock strategy; repair the stale ADR reference; define release
   version/artifact provenance.
2. **Complete repository gates:** add approved lint/type-check, dependency and
   secret scan, browser/a11y, migration validation and artifact-integrity
   checks; keep real transaction tests mandatory.
3. **Define environments:** record redacted dev/test/preview/staging/prod
   manifests, secret references, database/storage identities, network
   boundaries and owners.
4. **Rehearse operations in isolation:** migration serialization/compatibility,
   backup/restore, artifact-only rollback, smoke, failure handling and
   handover; retain redacted evidence.
5. **Resolve open decisions and review readiness:** storage/payment provider
   and operations, RPO/RTO, monitoring/on-call, Finance, production readiness
   and go-live remain separate approvals.

## 13. Acceptance criteria for Layer 08

- One supported install/runtime path yields deterministic frontend and backend
  release artifacts from an exact source SHA.
- CI has explicit, non-skippable quality, security, browser/accessibility,
  transaction/migration and artifact gates.
- Each environment has separated config/secrets/data/storage/observability and
  a documented deployment method.
- Transaction readiness, storage/payment enablement and network boundaries are
  tested at the appropriate environment.
- Migration, backup, restore, rollback and post-deploy smoke have current
  redacted evidence, owners and recovery criteria.
- No applicable P0/P1 remains open before a release-candidate recommendation.
- Provider, policy, infrastructure, production-readiness and go-live decisions
  remain visibly open until explicitly approved.

## 14. Resume handoff

- **Current audit state:** `complete` for repository/static Layer 08; external
  deployment, restore, network and ownership evidence is `environment_blocked`
  or `blocked_by_decision`.
- **Completed:** authority/runbook review; Git/branch/default-branch/protection
  checks; workflow inventory; build/dependency/runtime inspection; two-build
  reproducibility check; Compose validation; migration/storage/payment/network
  static audit; release-gate matrix; findings and remediation.
- **Incomplete:** staging/production deployment, smoke, rollback, migration,
  backup/restore, telemetry, owner/RPO/RTO and credential-incident closure.
- **Last files inspected:** workflows, manifests/lockfile, env examples,
  CRACO/release script, server/storage, migration/backup code, Compose files,
  production/rollout/migration/transaction/identity/catalog/NIV-001 runbooks.
- **Last commands:** `python -m compileall -q backend` (0);
  `python -m pip check` (0); both Compose `config --quiet` (0);
  two `npx.cmd craco build` runs with identical manifests; `git diff --check`
  (0); read-only GitHub default-branch/protection/ruleset probes.
- **Blockers:** no application deployment/IaC/topology or artifact registry;
  no staging/production access; storage/payment provider and go-live decisions
  open; backup/restore/RPO/RTO/on-call evidence absent; NIV-001 pending;
  local `origin/main` advanced during the session and requires revalidation.
- **Findings requiring revalidation:** all `OPS-001`–`OPS-010` when runtime,
  CI, dependencies, topology, provider, incident or authority changes;
  `OPS-011` after documentation path repair; `OPS-012` after release-contract
  adoption.
- **Next exact step:** obtain separate approval for a disposable, non-production
  staging-like rehearsal package (artifact provenance, isolated database,
  backup/restore, smoke and rollback) and update only after redacted evidence
  exists. Do not deploy or run a production migration.
- **Baseline SHA:** `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
- **Timestamp:** 2026-07-28 03:36:18 WIB (UTC+07:00)

## 15. Changelog

### 2026-07-28 — Layer 08 deep repository/static audit

- Completed repository/static DevOps, CI/CD, deployment, environment,
  migration, release, rollback and operations audit.
- Recorded 0 P0, 10 P1 and 2 P2 findings with separate readiness dimensions.
- Verified backend compile, global pip consistency, Compose syntax and two
  deterministic frontend builds without deployment or production data access.
- Recorded staging/production, provider, backup/restore, network, ownership,
  monitoring and NIV-001 evidence as blocked/unverified where applicable.
