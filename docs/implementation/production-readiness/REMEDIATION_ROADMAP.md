# Niuva Production-Readiness Remediation Roadmap

Status: Planning and Assignment Context — Not Implementation Authority

Last updated: 2026-07-28 (Asia/Jakarta)
Source audit: `docs/context/production-readiness-audit/` at scored baseline `c28684d34c03505ea2f862f32c6edc24b1d7bfba`

## Purpose and use

This roadmap converts the completed Layer 01-11 audit evidence into bounded,
dependency-ordered remediation planning. It preserves all source finding IDs in
[FINDING_TRACEABILITY.md](FINDING_TRACEABILITY.md), but does not grant source,
migration, deployment, provider, production-readiness, or go-live authority.

The canonical authority order remains the Master Specification, the Document
Register, the Decision Register, the applicable decision/ADR, the applicable
runbook, and current source/tests. `AGENTS.md` is a subordinate implementation
guardrail. Audit recommendations and this roadmap are planning evidence only.

## Baseline and freshness

| Item | Recorded state |
| --- | --- |
| Recorded audit-worktree branch | `feat/marketing-redesign-dec-ux-002` |
| Recorded audit-worktree HEAD | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Recorded audit baseline SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` - exact match with the recorded audit-worktree HEAD |
| Recorded local `origin/main` | `f56a9d231f3baecf8aa7facc8dc42159474fbfe9` |
| Recorded ancestry | Audit-worktree HEAD was 13 commits behind its local `origin/main`; no fetch or synchronization was performed |
| Changed scope observed after audit baseline | 45 paths: 23 backend, 14 frontend, 1 CI workflow, 1 Decision Register, 1 Document Register, 2 runbooks, 2 implementation documents, and 1 repository-history record |
| Findings requiring revalidation | `SUM-FRESH-001`; the Admin session/recovery groups (`FE-002`, `FE-003`, `BE-008`, `DB-002`, `INT-004`, `SEC-002`, `SEC-004`, `SEC-005`, `SEC-007`, `SEC-013`); migration/CI documentation candidates (`QA-004`, `GOV-013`); and any finding whose implementation scope is selected from the newer default branch |
| Pre-existing worktree state | Modified Phase 1 auth authorization packet; untracked `.coverage`; untracked production-readiness audit directory. These are preserved. |
| Roadmap worktree state | This roadmap directory is newly created by this planning task and is untracked until the user decides otherwise. |

The default-branch changes are resolution candidates, not resolution evidence.
In particular, they add recovery and Admin session implementations, migrations
007-008, frontend auth changes, transaction-workflow changes, and new runbooks.
No affected finding may be marked `resolved` until the selected release
candidate baseline has current negative-path, regression, migration, and
environment evidence.

## Audit synthesis and normalization

The Layer 11 synthesis records **120 original findings**: 1 P0, 74 P1, 42 P2,
and 3 P3. They normalize into **27 canonical findings/root-cause groups**
without deleting source IDs. `SEC-001` and `OPS-010` are one NIV-001 incident;
`OPS-010` is recorded as `duplicate_of` the canonical NIV-001 finding. Other
multi-ID rows are related causes or dependent contracts, not duplicates.

The P0 is the unverified closure of NIV-001. It forces `NOT PRODUCTION READY`.
Open P1 families include authentication and authorization, customer-data and
file boundaries, transaction/migration integrity, payment capability,
customer/B2B journey parity, accessibility, release gates, deployment,
observability, and dependency governance.

Root-cause groups are:

1. baseline, incident, and evidence provenance;
2. identity, authentication, authorization, and privacy;
3. database, transaction, migration, backup, and restore integrity;
4. lifecycle, API contract, notifications, CMS, and compatibility;
5. frontend integration, journey parity, and objective accessibility;
6. test, artifact, CI, package/runtime, and dependency controls;
7. topology, deployment, operations, observability, and capacity; and
8. documentation, ownership, maintainability, and governed cleanup.

The complete canonical register, source IDs, severity decision, dependency,
and blocking state is in [FINDING_TRACEABILITY.md](FINDING_TRACEABILITY.md).
Required owner decisions are separated in
[DECISIONS_REQUIRED.md](DECISIONS_REQUIRED.md), and planned evidence is in
[VERIFICATION_MATRIX.md](VERIFICATION_MATRIX.md).

## Environment limitations

The roadmap must not treat the following as passing evidence:

- release postbuild is blocked without a confirmed public origin;
- browser E2E lacks a controlled server/API topology, seeded roles, and
  Firefox/WebKit engines;
- the local Python environment is global rather than a locked project virtual
  environment;
- staging/production topology, secrets, TLS/proxy behavior, private storage,
  payment operations, monitoring, on-call, and deployment controls are absent
  from the audited environment;
- live data shape, production indexes, migration dry-run, backup inventory,
  restore drill, rollback exercise, and capacity evidence remain unavailable;
- no remote freshness check was performed.

These are blockers only where the selected phase requires them. They do not
authorize bypasses, test weakening, or a non-atomic fallback.

## Roadmap phases

Each phase is intentionally stoppable. A later phase cannot start merely
because an earlier phase has a draft document: its exit criteria, decisions,
and verification evidence must be satisfied first.

### Phase 0 - Safety, Baseline, and Evidence Preservation

**Authorization:** `blocked_by_decision`
**Objective:** select one immutable release-candidate baseline, preserve audit
provenance, and close or formally contain destructive/incident risk before
implementation planning.

| Subphase | Scope | Canonical findings | Exit criteria |
| --- | --- | --- | --- |
| 0A - Baseline selection | Choose `c28684d` only as historical evidence or authorize rebaseline to a named newer SHA; make a changed-path/finding matrix. | `SUM-FRESH-001`, `GOV-017` | Owner selects the target SHA; every affected finding is `requires_revalidation` or has current evidence. |
| 0B - NIV-001 disposition | Follow the existing incident runbook with secret-safe evidence; decide closure or an explicitly time-bound accepted risk. | `SEC-001`, `OPS-010` | Independent, redacted verification and an approved disposition. |
| 0C - Migration stop conditions | Freeze unsafe migration candidates until ownership, backup, dry-run, validation, and rollback evidence are complete. | `DB-005`-`DB-012`, `DB-014`, `OPS-005`, `OPS-006`, `QA-004`, `GOV-013` | No ambiguous or destructive migration is scheduled; migration preconditions are recorded. |
| 0D - Authority/provenance reconciliation | Register or quarantine unregistered plans, stale runbook paths, and generated artifacts as non-authoritative. | `GOV-011`, `GOV-014`, `GOV-015`, `GOV-017` | Authority and evidence registers have no unresolved misleading reference for the selected scope. |

**Dependencies:** Project Owner, incident/credential/repository owners, release
baseline owner, migration/backup owner.
**Rollback risk:** high for any history or data operation; Phase 0 itself must
remain planning/evidence-only until separately authorized.

### Phase 1 - Identity, Authentication, Authorization, and Privacy

**Authorization:** `blocked_by_decision` for the phase as a whole. Existing
auth packets remain limited to their own isolated scope and do not authorize
the broader roadmap.
**Objective:** establish least-privilege, customer-safe, transaction-safe
identity and data boundaries before extending journeys.

| Subphase | Scope | Canonical findings | Preconditions and acceptance boundary |
| --- | --- | --- | --- |
| 1A - Auth baseline revalidation | Revalidate recovery and session changes on the selected SHA, including Admin/customer separation. | Session/MFA/access-review; recovery/password/bootstrap | Real replica-set negative paths and browser/session evidence; no credential in reports. |
| 1B - Runtime authorization and privacy | Enforce role, object, route, field, audit, order, and file boundaries. | Admin permission parity; legacy order/customer note; file safety; notification privacy | `DEC-ACCESS-002` matrix, customer-safe query tests, and explicit deny tests. |
| 1C - Transaction and commercial integrity | Align transaction guard, idempotency, quote-line identity, and inactive payment capability. | Transaction/idempotency; quote identity; Retail payment state | ADR-001/ADR-003, exact line semantics, replay/conflict/503 tests. |
| 1D - Abuse and MFA planning | Complete still-open topology/key/support choices before any expansion. | Distributed abuse; MFA/access-review residuals | Explicit owner decisions; no provider or topology inferred. |

**Do not do:** enable `AUTH_ARGON2_WRITES_ENABLED`, select a provider, apply a
shared migration, weaken customer projection, or add a non-atomic fallback.
**Blocks:** Phases 2, 4, 7, and 10 for all affected journeys.

### Phase 2 - Database, Transaction, and Migration Integrity

**Authorization:** `blocked_by_decision`
**Objective:** make data-bearing behavior non-destructive, reversible, and
verifiable before a data-bearing release.

| Subphase | Scope | Canonical findings | Exit criteria |
| --- | --- | --- | --- |
| 2A - Schema/reference contract | Canonical notification shape, quote-line identity, uniqueness, orphan checks, retention boundaries. | Notification; quote/reference; migration/live-schema group | Decision-backed data contract and non-destructive report on representative data. |
| 2B - Migration hardening | Per-migration preflight, idempotency, partial-failure compensation, ledger, rollback floor. | Migration/live-schema group | Reviewed migration plan contains backup, dry run, validation, rollback, and stop criteria. |
| 2C - Restore and topology proof | Isolated replica-set rehearsal and backup/restore evidence. | Migration/live-schema group; transaction/idempotency | Current restore drill and failure simulation; no production data use without approval. |

**Blocks:** customer/order/B2B data changes, Phase 4 integration, Phase 7
staging migration, and Phase 10.
**Rollback risk:** high; historical records remain preserved and referenced
records are never hard-deleted.

### Phase 3 - Backend Business Logic and API Contracts

**Authorization:** `approved_for_planning`
**Objective:** plan bounded contracts only after their authority and integrity
preconditions are clear; do not conflate an API fix with deferred product work.

| Subphase | Scope | Canonical findings | Exit criteria |
| --- | --- | --- | --- |
| 3A - HTTP and command contract | Error envelope, pagination/date semantics, timeout/retry/idempotency policy. | API transport/validation/envelope; transaction/idempotency | Published contract fixtures and negative/replay test plan. |
| 3B - Notification/readiness lifecycle | Health truth, background behavior, delivery claim/retry, recipient projection. | Notification; release/readiness; observability/background | Canonical state/event ownership and safe service-health contract. |
| 3C - CMS/compatibility governance | Publication concurrency, orphan endpoints, legacy compatibility/sunset boundary. | CMS/Portfolio; governance/compatibility | Explicit owner decision for each retained, retired, or read-only route. |

**Blocked implementation inputs:** portfolio semantics, retention, compatibility
sunset, API ownership, and readiness topology.
**Blocks:** Phase 4 integration parity and Phase 6 contract gates.

### Phase 4 - Frontend Engineering and Integration Parity

**Authorization:** `blocked_by_decision`
**Objective:** complete only approved end-to-end journeys after backend
contracts and product/authority decisions are fixed.

| Subphase | Scope | Canonical findings | Exit criteria |
| --- | --- | --- | --- |
| 4A - Auth/client parity | Cookie/recovery UI, surface guards, API failure/invalid-data states. | Auth session/recovery; Admin permission parity; API transport/validation | Selected auth contract passes browser and negative role journeys. |
| 4B - Customer and Retail scope | Customer entrypoint and first Retail slice, if expressly approved. | Unified Homepage/customer/Retail gap | A separately approved vertical-slice scope; no invented checkout/provider behavior. |
| 4C - B2B/CMS integration | Organization portal, safe projections, CMS/portfolio consumer flows. | B2B portal; CMS/Portfolio; notification | Approved portal/content scope, backend contracts, seeded E2E data. |

**Blocks:** Phase 5 objective UX completion and Phase 6 full E2E.
**Not permitted:** create Retail routes/CTAs/topology, activate storage/upload,
or select payment behavior without separate decision and implementation authority.

### Phase 5 - UI, UX, Responsive, and Accessibility

**Authorization:** `approved_for_planning`
**Objective:** correct measurable usability and accessibility defects without
performing subjective redesign or crossing documented visual deferrals.

| Subphase | Scope | Canonical findings | Exit criteria |
| --- | --- | --- | --- |
| 5A - Critical interaction accessibility | Contrast, focus trap, target sizes, combobox semantics, field associations, status/motion announcements. | Objective UX/accessibility group | Keyboard, reduced-motion, responsive, and automated/manual accessibility evidence meets the defined matrix. |
| 5B - Factual/IA correction | Privacy wording and other approved factual state. | `UX-010` | Content owner confirms the source statement and regression coverage exists. |
| 5C - Deferred visual topics | Pseudo-terminal styling, broader typography, repetitive composition. | Surface-direction/typography group | Separate decision/authorization; otherwise remain planned only. |

### Phase 6 - Testing and Release-Quality Gates

**Authorization:** `blocked_by_environment`
**Objective:** make passing evidence reproducible and prevent skipped or
superficial checks from becoming release signals.

`blocked_by_environment` means the required controlled CI/browser/API/role
environment is absent. It does not mean that a quality gate was waived. Some
subphases additionally need a policy decision, which is listed explicitly.

| Subphase | Scope | Canonical findings | Blocking state and why | Exit criteria |
| --- | --- | --- | --- | --- |
| 6A - Reproducible toolchain | Supported package manager, lockfile, Node/Python matrix, and clean-install contract. | Package/runtime reproducibility; dependency risk | `blocked_by_decision`: the supported package/runtime/lock strategy and owner are not selected. | A named supported install path resolves cleanly in local and CI from the exact SHA. |
| 6B - Executable CI suites | Required backend/external, transaction, migration/restore, role, browser, responsive, and accessibility suites. | QA/release gates; auth and migration groups | `blocked_by_environment`: CI service, isolated API/replica set, seeded roles, and supported browser engines are unavailable. | CI executes required suites; unexpected skips or unreachable external services fail the gate. |
| 6C - Release artifact proof | Confirmed public origin, postbuild output, sitemap/robots, direct navigation, artifact checksum and retention. | Release artifact/readiness; governance/provenance | `blocked_by_environment`: no approved non-secret origin or release-artifact environment exists. | One exact SHA produces complete, attributable release files and artifact assertions. |
| 6D - Quality/security signals | Lint/type/coverage thresholds, dependency scan, license review, performance and visual regression signals. | QA/release gates; dependency and maintainability groups | `blocked_by_decision`: thresholds, enforcement mode, license disposition, and owners are not agreed; tools also need CI execution. | Approved thresholds are enforced and produce reviewable reports for the exact SHA. |

**Phase 6 exit:** every required gate has a named owner, environment,
provenance, expected-skip policy, result artifact, and failure behavior.

### Phase 7 - Deployment and Operational Readiness

**Authorization:** `blocked_by_decision`
**Objective:** prove a controlled staging-like release path, rollback, backup,
and ownership without activating production services.

`blocked_by_decision` means the roadmap cannot choose operational behavior on
its own. For example, it cannot invent a host, secret manager, RPO/RTO,
backup owner, storage provider, payment operation, or rollback authority.

| Subphase | Scope | Canonical findings | Blocking state and why | Exit criteria |
| --- | --- | --- | --- | --- |
| 7A - Deployable topology and artifact path | Hosting, same-origin topology, immutable artifact publication, supported runtime, TLS/proxy and network boundary. | Release artifact/readiness; package/runtime; deployment/network | `blocked_by_decision`: hosting/topology and artifact/release owner are unselected. | Approved staging-like topology deploys the exact immutable artifact with documented promotion path. |
| 7B - Environment and secret evidence | Environment separation, origin/configuration evidence, trusted proxy behavior, secret custody and access review. | Release artifact/readiness; security headers | `blocked_by_decision`: secret-management/evidence format, environment owners, and proxy policy are not assigned. | Redacted configuration evidence proves separation and same-origin HTTPS without exposing secrets. |
| 7C - Data continuity and migration operations | Serialization, maintenance window, backup inventory, restore, migration dry run, rollback floor. | Migration/live-schema; transaction/idempotency | `blocked_by_decision`: RPO/RTO, retention, backup/restore owner, target, and migration authority remain open. | Authorized isolated rehearsal passes dry run, apply/rollback, and restore with aggregate-only evidence. |
| 7D - Release, rollback, and handover | Versioning, approval window, abort criteria, operational handoff, incident and rollback exercises. | QA/release gates; observability; governance/provenance | `blocked_by_decision`: release, incident, support, and rollback owners have not accepted the procedure. | A named team completes a staging-like release and separate artifact/data rollback drill. |
| 7E - Provider activation boundary | Private storage and payment activation only when product scope requires them. | Provider activation; file safety; payment capability | `blocked_by_decision`: provider, Finance, reconciliation, retention, and production approval are deliberately deferred. | Keep capability disabled unless a separate approved provider/operations decision exists. |

**Phase 7 exit:** a controlled staging-like path has an owner, reproducible
artifact, secret-safe configuration evidence, data-recovery evidence, and
rehearsed rollback. Production activation remains out of scope.

### Phase 8 - Reliability, Performance, and Observability

**Authorization:** `blocked_by_decision`
**Objective:** establish health truth, bounded external dependency behavior,
telemetry/SLO ownership, safe background work, and capacity evidence.

`blocked_by_decision` applies because a repository audit cannot select a
telemetry destination, privacy/retention policy, SLO, alert threshold,
worker topology, capacity target, or on-call owner.

| Subphase | Scope | Canonical findings | Blocking state and why | Exit criteria |
| --- | --- | --- | --- | --- |
| 8A - Truthful readiness and dependency health | Liveness/readiness routing, Mongo/dependency health, safe degradation contract. | Release artifact/readiness; notification/readiness | `blocked_by_decision`: required-versus-optional dependency policy and probe-routing owner are unspecified. | Approved probes never route traffic as ready when required dependencies are stale or failed. |
| 8B - Telemetry, audit, and service objectives | Metrics, tracing, log redaction, dashboards, alerts, SLI/SLO/error budgets. | Observability/background; notification/audit privacy | `blocked_by_decision`: destination, retention/access, alert recipient, and on-call ownership are unselected. | Redacted telemetry and alert delivery meet approved service objectives. |
| 8C - Background and external failure control | Notification claims, timeouts, retry/backoff, scheduler lease, shutdown and replay behavior. | Notification; API transport; transaction/idempotency | `blocked_by_decision`: worker/provider topology, retry policy, support procedure, and failure ownership are open. | Controlled failures show bounded retries, no duplicate claim, safe shutdown, and actionable alerting. |
| 8D - Performance and capacity | Query/index/pagination behavior, connection pools, upload/API resource bounds, frontend performance/error budget. | Maintainability/query/frontend performance; file safety | `blocked_by_environment`: representative workload and controlled load environment are absent; budgets also need owner approval. | Approved load/capacity scenarios meet documented latency, payload, saturation, and frontend budget targets. |

**Phase 8 exit:** readiness, telemetry, alerting, background recovery, and
capacity behavior are proven in the approved staging-like environment with
named operational ownership.

### Phase 9 - Governance, Documentation, and Final Reconciliation

**Authorization:** `approved_for_planning`
**Objective:** reconcile evidence, plans, runbooks, ownership, dependency
policy, and product/implementation authority after the selected baseline is
revalidated.

`approved_for_planning` permits only documentation and reconciliation work. It
does not authorize source, dependency, infrastructure, migration, or rollout
changes.

| Subphase | Scope | Canonical findings | Blocking state and why | Exit criteria |
| --- | --- | --- | --- | --- |
| 9A - Authority and reference reconciliation | Registers, active/candidate/superseded status, runbook paths, unregistered plans, generated evidence labels. | Governance/provenance | `approved_for_planning`: no implementation decision is needed to prepare the reconciliation report. | Every active plan/reference states its authority and no context-only document governs implementation. |
| 9B - Ownership and release governance | CODEOWNERS/review, release/versioning, dependency/license disposition, evidence retention. | Governance/provenance; dependency risk | `blocked_by_decision` for execution: review, legal/security, release and evidence owners must accept policy. | Approved ownership/policy record has scope, review cadence, and enforcement evidence. |
| 9C - Final finding reconciliation | Resolution/accepted-risk evidence, revalidation after selected-SHA changes, residual risk and handoff. | Freshness; all canonical groups | `requires_revalidation`: no final status is valid until Phase 0 selects the baseline and affected verification is current. | Each finding is open, resolved, accepted-risk, or blocked with current evidence and owner/date. |

No document may silently upgrade an open decision, mark an implementation
complete, or authorize production operations.

### Phase 10 - Production-Candidate Verification

**Authorization:** `blocked_by_environment`
**Objective:** verify the exact approved candidate in a production-like
environment after Phases 0-9 exit criteria are met.

The primary blocker is environment: no exact candidate or production-like
environment is available. Candidate selection and final readiness/go-live
approval are also separate human decisions; neither may be inferred below.

| Subphase | Scope | Canonical findings | Blocking state and why | Exit criteria |
| --- | --- | --- | --- | --- |
| 10A - Candidate freeze and scope check | Immutable candidate SHA, decision ledger, residual-risk and change matrix. | Freshness; governance/provenance | `blocked_by_decision`: Project Owner has not selected the candidate baseline. | One immutable SHA, approved scope, and revalidation matrix are frozen for verification. |
| 10B - Full regression and security verification | Backend/frontend/full critical role and customer flows, auth/privacy/authorization regression, supported browsers and accessibility. | All applicable P0/P1; QA/release; objective UX | `blocked_by_environment`: seeded roles, API/browser topology, and CI capacity are unavailable. | Required suites pass without unexpected skips; results are attributable to the frozen SHA. |
| 10C - Data recovery and rollback drills | Migration dry run, backup/restore, rollback, transaction and recovery failure exercise. | Migration/live-schema; transaction; recovery | `blocked_by_decision` and `blocked_by_environment`: target/owner/window/backup custody and staging-like replica set are absent. | Approved isolated drills prove restore and rollback while preserving historical records. |
| 10D - Production-like deployment and observability | Artifact deployment, TLS/proxy/security headers, readiness, monitors, alerts, capacity and abort trigger. | Release/deployment; observability/background | `blocked_by_environment`: no approved staging-like topology, telemetry plane, or on-call operation exists. | Exact artifact runs under approved topology and emits verified redacted operational evidence. |
| 10E - Readiness decision and controlled rollout proposal | Final risk calculation, owner sign-offs, launch/abort window and communications. | P0/P1 residual and accepted risks | `blocked_by_decision`: production-readiness and go-live approvals are intentionally separate from verification. | Explicit production-readiness approval exists before a separate go-live decision. |

This phase is a verification and decision gate; it does not itself authorize
go-live.

## Team-assignable phase IDs

The roadmap phases above are decomposed into stable, team-assignable IDs in
[TEAM_ASSIGNMENT.md](TEAM_ASSIGNMENT.md). This decomposition changes neither
the authority nor the exit criteria of the roadmap. It only isolates ownership,
file boundaries, review, verification, and merge sequencing so that a later
approved implementation does not put two people in the same module or API
contract concurrently.

| Roadmap group | Team-assignable phase IDs | Decomposition note |
| --- | --- | --- |
| 0 — Safety, baseline, and evidence | `PHASE-00A`–`PHASE-00D` | Keeps baseline choice, NIV-001, migration stops, and provenance separate. |
| 1 — Identity, authorization, and privacy | `PHASE-01A`–`PHASE-01D` | Separates auth revalidation, runtime boundaries, transaction/commercial integrity, and unresolved abuse/MFA decisions. |
| 2 — Database and migration integrity | `PHASE-02A`–`PHASE-02C` | Separates data contract, migration hardening, and restore/topology proof. |
| 3 — Backend/API contracts | `PHASE-03A`–`PHASE-03C` | Separates cross-layer transport, notification/readiness, and CMS/compatibility contracts. |
| 4 — Frontend integration parity | `PHASE-04A`–`PHASE-04C` | Separates auth client, Retail/customer, and B2B/CMS consumers. |
| 5 — UI/UX/accessibility | `PHASE-05A`–`PHASE-05D` | Splits objective public/mobile accessibility, semantic state controls, factual content, and deferred visual work without expanding scope. |
| 6 — Quality gates | `PHASE-06A`–`PHASE-06D` | Separates reproducibility, executable CI, artifact proof, and quality/security signals. |
| 7 — Deployment and operations | `PHASE-07A`–`PHASE-07E` | Separates topology, environment evidence, data continuity, handover, and provider boundary. |
| 8 — Reliability/observability | `PHASE-08A`–`PHASE-08D` | Separates readiness, telemetry, background failure handling, and capacity/performance. |
| 9 — Governance/reconciliation | `PHASE-09A`–`PHASE-09C` | Separates authority references, policy ownership, and final finding reconciliation. |
| 10 — Candidate verification | `PHASE-10A`–`PHASE-10E` | Separates candidate freeze, regression, recovery drills, deployment proof, and human readiness decision. |

No proposed branch or worktree in the assignment register is created by this
roadmap. `PHASE-00A` is the first planning-ready assignment, but it is a human
baseline-selection and evidence-reconciliation action, not an implementation
plan or source-change authorization. No implementation subphase is ready until
the applicable decision, selected SHA, dependency, and verification conditions
in this roadmap are satisfied.

## Dependency matrix

| Phase | Depends on | Blocks | Decision required | Migration required | Rollback risk |
| --- | --- | --- | --- | --- | --- |
| 0 | None | 1-10 | RC baseline; NIV-001 disposition; migration stop conditions | Planning only | High if incident/history action is later approved |
| 1 | 0 | 3, 4, 7, 10 | Auth, access, privacy, quote/payment boundaries | Some bounded auth/data changes | High |
| 2 | 0, 1 where identity data is affected | 3, 4, 7, 10 | Data semantics, retention, backup/restore owner | Yes, only after approved plan | High |
| 3 | 0-2 as applicable | 4, 6, 10 | API/compatibility/readiness ownership | Possibly, only per approved contract | Medium-high |
| 4 | 1-3 plus product slice authority | 5, 6, 10 | Retail, B2B, customer, CMS scope | Depends on selected slice | Medium |
| 5 | 3-4 for stateful journeys | 6, 10 | Only factual/content or deferred-design decisions | No by default | Low |
| 6 | 0-5 stable scope | 7, 10 | Gate, threshold, CI/artifact ownership | No | Low |
| 7 | 2, 6 | 8, 10 | Topology, providers, owners, RPO/RTO | Controlled rehearsal only | High |
| 8 | 3, 6, 7 | 10 | Telemetry, SLO, on-call, capacity decisions | No by default | Medium |
| 9 | 0-8 evidence | 10 | Documentation/release/dependency policy | No | Low |
| 10 | 0-9 exit criteria | Go-live decision | Production-readiness and go-live approvers | Dry run/rehearsal only | High |

## Definition of ready for an implementation plan

A roadmap subphase may move from planning to a bounded implementation plan only
when all of the following are evidenced for its exact SHA and scope:

1. governing authority is identified and no conflict remains unresolved;
2. all included findings are current or explicitly revalidated;
3. required decisions and dependencies are recorded as approved;
4. migration and rollback impact is known, including preservation of historical
   records;
5. acceptance criteria and negative cases are testable in an available
   environment;
6. necessary owners, test data, and verification capability exist; and
7. unrelated tracked and untracked work can remain isolated.

If any condition is absent, the subphase remains `decision_blocked`,
`blocked_by_environment`, or `requires_revalidation`; it is not implementation
ready.

## Current handoff

The first permitted next action is a human decision on the release-candidate
baseline and NIV-001 disposition. After it, update the finding freshness matrix
before drafting any implementation plan. Do not start Phase 0 execution from
this roadmap.

Source code, tests, dependencies, configuration, migrations, canonical
documents, commits, pushes, deployment, and production state were not changed
while creating this roadmap.
