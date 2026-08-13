# Current-Main Backend Rebaseline — 13 August 2026

Status: **current repository audit complete; production and go-live gates remain open**

This packet revalidates production-readiness Layers 03 through 10 against the
current default branch. It is audit evidence only. It does not authorize a
migration, provider, credential operation, deployment, production-readiness
decision, or go-live.

## 1. Baseline and scope

| Field | Current evidence |
| --- | --- |
| Repository baseline | `15b759a02b036330f1dd0913611043e0fd6134e2` |
| Git tree | `05e41a29479d0cb85af41bef2f5dd88fe1b52b1f` |
| Branch | `audit/backend-current-main-rebaseline` |
| Remote freshness | Fresh fetch on 13 August 2026; baseline matched `origin/main` with divergence `0 0` |
| Audited layers | 03 Backend/API, 04 Database, 05 Integration, 06 Security, 07 QA, 08 Operations, 09 Reliability, and 10 Governance |
| Excluded execution | Shared/staging/production data, migrations, credentials, providers, external authenticated journeys, deployment, and go-live |

The audit followed the canonical reading order in `AGENTS.md`, the layered
audit methodology, current decisions and runbooks, current source/tests and
workflows, and historical findings only as provenance.

## 2. Current verification evidence

| Check | Result | Limit |
| --- | --- | --- |
| Hermetic backend suite | `1031 passed`, `15 skipped`, `14 subtests passed`; evidence validator reported zero unexpected skips | Local macOS, Python 3.14.3; the declared skips are environment-gated real transaction cases |
| Exact-SHA GitHub quality gate | Run `31682897208` passed backend, frontend, and secret-scan at `15b759a` | Repository CI, not staging or production evidence |
| Backend dependency audit | `71` locked distributions, zero known vulnerabilities | Point-in-time vulnerability result on 13 August 2026 |
| Backend license metadata | `71` distributions recorded; zero blank, `none`, or `unknown` values | Metadata inventory is not legal approval |
| Dependency compatibility | `uv pip check` passed for the Python 3.14.3 environment | Local environment uses the tracked lock but is not a deployed artifact |
| Compile and required static gates | Compile, critical Flake8, and scoped MyPy passed; MyPy checked 23 source files | Whole-tree quality remains report-only |
| Exact-SHA whole-tree quality artifact | Flake8 `2036`, MyPy `288`, Black `47`, isort `51` findings | Expected report-only debt; no threshold authorizes failure ownership yet |
| Transaction suite | Latest path-relevant PR evidence passed `80` tests with zero skips | Docker was unavailable locally, so no exact-`15b759a` replica-set rerun occurred |
| External smoke | Workflow requires an approved non-production HTTPS origin | No target was supplied; correctly remains environment-blocked |
| Frontend production dependency policy | Failed current point-in-time audit on `nanoid 3.3.17` / `GHSA-2v37-7h3g-55p8` | Exact-SHA CI passed earlier the same day; advisory freshness changed after that run |

The frontend advisory is a current dependency finding, not evidence that the
backend lock regressed. It remains routed through `SEC-012` / `GOV-003` and
must be remediated in a separate dependency branch.

## 3. Merged backend delivery reconciliation

The previous tracker stopped at PR #216. Current `main` also contains:

| Scope | PR | Merge commit | Current disposition |
| --- | ---: | --- | --- |
| 4.3 Project Conversion | #219 | `61d4e79` | Exact accepted Quote/version checks, customer/organization binding, idempotency conflict behavior, and stale-write protection merged |
| 4.4 Work Order lifecycle | #220 | `56ae75a` | Allocation, production, QC, shortage recovery, completion, permission, and concurrency controls merged |
| 3.4A Retail Order contract hardening | #226 | `72018ce` | Provider-neutral cart/snapshot, fingerprint, concurrency, lifecycle, and append-only audit contracts merged; runtime routes remain inactive |

PR #226 is `MERGED`, not open. Its source contract does not activate Retail
creation, reservation persistence, payment, provider behavior, migration,
deployment, or production capability.

## 4. Rebaselined layer results

Counts below are current unresolved source finding IDs after preserving all
historical IDs. A source-level resolution can still have a separate
environment or production gate.

| Layer | Status | Completion | Readiness | Confidence | Current unresolved count | Score cap |
| --- | --- | ---: | ---: | ---: | --- | --- |
| 03 Backend/API/Business Logic | `complete` | 100% | **74%** | 92% | 0 P0 / 2 P1 / 3 P2 | API coverage, inactive Retail lifecycle, and external evidence |
| 04 Database/Data Integrity | `complete` | 100% | **58%** | 88% | 0 P0 / 9 P1 / 1 P2 | Unsafe/blocked historical migrations and absent representative live-data proof |
| 05 Integration/Feature Parity | `complete` | 100% | **68%** | 90% | 0 P0 / 3 P1 / 3 P2 | Organization portal, full Retail lifecycle, cross-command parity, and external journeys |
| 06 Security/Auth/Privacy | `complete` | 100% | **49%** | 92% | 1 P0 / 4 P1 / 2 P2 | NIV-001 hard cap, missing MFA, operational limiter/storage/topology gates, and current frontend advisory |
| 07 Testing/Quality Assurance | `complete` | 100% | **72%** | 91% | 0 P0 / 2 P1 / 2 P2 | External release/browser evidence and whole-tree quality ownership remain open |
| 08 DevOps/Deployment/Operations | `complete` | 100% | **48%** | 91% | 0 P0 / 9 P1 / 1 P2 | No controlled deployment, migration, restore, rollback, network, or provider evidence |
| 09 Reliability/Performance/Observability | `complete` | 100% | **66%** | 88% | 0 P0 / 1 P1 / 4 P2 | Production telemetry/SLO/capacity/load evidence is absent |
| 10 Dependencies/Maintainability/Governance | `complete` | 100% | **62%** | 92% | 0 P0 / 3 P1 / 9 P2 | New frontend advisory, lifecycle debt, governance ownership, and report-only whole-tree debt |

These scores measure implementation evidence, not go-live eligibility. Layers
01 and 02 were not rescored in this backend feature, so no new cross-layer
overall percentage is claimed.

### 4.1 Layer 03 disposition

- `resolved_in_source`: `BE-002`, `BE-004`, `BE-005`, `BE-006`, `BE-007`,
  `BE-008`, `BE-009`.
- `partial`: `BE-001`, `BE-003`, `BE-010`, `BE-011`.
- `environment_blocked`: `BE-012`.

The shared transaction boundary, customer-safe legacy projection, CMS and
Portfolio publication, file development boundary, recovery, notification,
and readiness source causes are no longer the July implementation state.
OpenAPI coverage, compatibility ownership, broad pagination, and activated
Retail payment/fulfilment remain incomplete or deliberately inactive.

### 4.2 Layer 04 disposition

- `resolved_in_source`: `DB-001`, `DB-002`, `DB-003`, `DB-004`.
- `partial`: `DB-008`, `DB-011`, `DB-013`.
- `open` or `blocked_by_decision`: `DB-005`, `DB-006`, `DB-007`, `DB-009`,
  `DB-010`.
- `environment_blocked`: `DB-012`, `DB-014`.

No migration file is authorized merely because its tests or dry run exist.
Migration 006 account mapping/rollout and migrations 007–010 representative
rehearsal remain separate controlled-data tasks.

### 4.3 Layer 05 disposition

- `resolved_in_source`: `INT-001`, `INT-003`, `INT-004`, `INT-005`,
  `INT-006`, `INT-008`, `INT-010`, `INT-014`.
- `partial` or deliberately inactive: `INT-002`, `INT-007`, `INT-009`,
  `INT-011`, `INT-012`, `INT-013`.

PRs #219 and #220 close important B2B conversion and Work Order seams. PR
PR #226 hardens the provider-neutral Retail contract, but the complete Retail
journey and B2B Organization Portal remain outside active capability.

### 4.4 Layer 06 disposition

- `open P0`: `SEC-001`; the time-bound self-verification exception is not
  incident closure.
- `resolved_in_source`: `SEC-002`, `SEC-004`, `SEC-005`, `SEC-007`, `SEC-009`,
  `SEC-013`.
- `partial`, `blocked_by_decision`, or `environment_blocked`: `SEC-003`,
  `SEC-006`, `SEC-008`, `SEC-010`, `SEC-011`.
- `open point-in-time dependency finding`: `SEC-012`, shared with `GOV-003`.

Mandatory internal MFA is still absent. No source result substitutes for
credential-incident closure, production HTTPS/proxy evidence, malware scanning,
or provider/key/retention ownership.

### 4.5 Layer 07 disposition

- `resolved_in_repository_gate`: `QA-001`, `QA-004`, `QA-005`.
- `partial` or `environment_blocked`: `QA-002`, `QA-003`, `QA-006`, `QA-007`.

Hermetic, expected-skip, mandatory transaction, dependency, critical lint,
scoped type, and artifact evidence gates exist. External staging and complete
release/browser evidence remain unavailable. Whole-tree static results remain
report-only rather than silently passing.

### 4.6 Layer 08 disposition

- `resolved_in_repository_contract`: `OPS-001`, `OPS-011`.
- `partial`: `OPS-002`.
- `open`, `blocked_by_decision`, or `environment_blocked`: `OPS-003` through
  `OPS-010`, plus `OPS-012`.

The package/runtime path and transaction runbook pointer are reconciled. A
repository workflow is not a deployable topology, immutable artifact
promotion, restore rehearsal, or owned production rollback.

### 4.7 Layer 09 disposition

- `resolved_in_source`: `SRE-001`, `SRE-003`, `SRE-004`, `SRE-007`, `SRE-008`.
- `partial` or `environment_blocked`: `SRE-002`, `SRE-005`, `SRE-006`,
  `SRE-009`, `SRE-010`.

Truthful readiness, Mongo-leased notification delivery, bounded shutdown,
resource limits, and structured redaction are present. Production telemetry,
SLO/error budgets, representative query/load proof, capacity, and frontend
monitoring remain absent.

### 4.8 Layer 10 disposition

- `resolved_in_repository_contract`: `GOV-001`, `GOV-002`, `GOV-005`,
  `GOV-015`, `GOV-017`.
- `open P1`: `GOV-003`, `GOV-004`, `GOV-014`.
- `partial/open P2`: `GOV-006` through `GOV-013`, plus `GOV-016`.

The npm package manager, Python runtime, and hashed backend lock are now one CI
contract. Backend dependency audit is clean at this timestamp. The new
`nanoid` advisory keeps vulnerability governance open, while framework
lifecycle, dependency separation, legal license review, module debt,
documentation breadth, ownership, and release policy remain incomplete.

## 5. Current hard gates and next feature branches

| Priority | Current gate | Recommended separate branch |
| ---: | --- | --- |
| 1 | Auth, authorization, privacy, MFA/abuse operational boundaries | `audit/backend-auth-security-current-main` |
| 2 | Migration, representative data, backup/restore, and rollback safety | `audit/backend-migration-data-integrity` |
| 3 | API/OpenAPI, compatibility, and pagination ownership | `audit/backend-api-contract-current-main` |
| 4 | B2B/Retail lifecycle cross-command and external journey evidence | `audit/backend-commerce-lifecycle` |
| 5 | Production file/storage boundary | `audit/backend-file-storage-current-main` |
| 6 | Current dependency advisory and whole-tree quality ownership | `audit/backend-quality-evidence-current-main` |
| 7 | Staging readiness, worker, telemetry, capacity, and rollback evidence | `audit/backend-runtime-reliability` |

NIV-001, MFA, provider selection, production storage, data-bearing migration,
staging/deployment, and go-live remain governed external decisions. This audit
does not convert them into implementation assumptions.

## 6. Handover

Changed by this feature:

- this current-main rebaseline packet;
- the main audit progress tracker;
- finding traceability current overlay;
- feature index and Retail 3.4A merged-state correction.

Intentionally unchanged:

- all backend/frontend runtime source and tests;
- migrations and database state;
- credentials, environment values, providers, and external services;
- historical layer documents and finding provenance;
- production, deployment, and go-live state.

Rollback is a normal documentation revert. The primary residual risk is
overextending repository evidence into production claims; every later feature
must retain the exact environment and decision limits recorded here.
