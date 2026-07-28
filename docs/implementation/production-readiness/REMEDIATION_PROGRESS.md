# Niuva Production-Readiness Remediation Progress

Status: Planning and Assignment Context — Not Implementation Authority

Last updated: 2026-07-29 (Asia/Jakarta)
Planning baseline: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
Selected release-candidate baseline: `d04e3f009d6c815c0a4d99dfa5c93553da3cef43` (Faiz / `DR-001`, 2026-07-29; local `origin/main` matched at selection, remote freshness unverified)

## Progress rules

This is a roadmap tracker, not evidence that a remediation phase has started.
Only one phase may be `in_progress` after its exact scope, authority,
dependencies, rollback impact, and verification plan are approved. A status of
`planning` permits documentation work only.

Faiz selected the release-candidate SHA under `DR-001`. It is 59 commits and
240 committed paths beyond the audit baseline, so affected auth, migration,
frontend, CI, runbook, register, and other finding groups require
revalidation before implementation planning. The selection does not establish
remote freshness, production readiness, or go-live approval.

| Phase | Scope | Findings | Status | Authorization | Plan Document | Implementation Branch | Baseline SHA | Verification | Last Updated | Next Step |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 - Safety, Baseline, and Evidence Preservation | RC baseline, NIV-001, migration stop conditions, provenance | Freshness; NIV-001; migration/live-schema; governance/provenance | `in_progress` — PHASE-00A review passed; PHASE-00D is ready for independent review; remaining Phase 0 scope is gated | Planning/evidence only; broader Phase 0 remains `blocked_by_decision` | [REMEDIATION_ROADMAP.md](REMEDIATION_ROADMAP.md) | Not selected | `d04e3f009d6c815c0a4d99dfa5c93553da3cef43` | Git ancestry and 240-path changed-scope map recorded; no finding closure evidence | 2026-07-29 | Review PHASE-00D disposition. Appoint the NIV-001 independent verifier before PHASE-00B; complete remaining DR-012 target/topology/RPO-RTO/evidence fields before PHASE-00C execution. |
| 1 - Identity, Authentication, Authorization, and Privacy | Auth, role, privacy, file/order boundaries, transaction/payment guard | Session/MFA; recovery; abuse; file/order; transaction; quote; payment; Admin parity | `requires_revalidation` — PHASE-01A browser-refresh retest passed; independent review and broader gates remain | `blocked_by_decision` | Roadmap only; existing auth packets retain their own gates | Not selected for roadmap | `d04e3f009d6c815c0a4d99dfa5c93553da3cef43` | Targeted backend, replica-set, HTTP, frontend-state, and disposable same-origin HTTPS browser login/reload evidence passed within DR-003 scope | 2026-07-29 | Obtain independent review where available; keep 01D and broader Phase 1 blocked until DR-004/005 and environment evidence exist. |
| 2 - Database, Transaction, and Migration Integrity | Schema, references, migration, backup, restore, data topology | Notification; quote/reference; migration/live-schema; transaction/idempotency | `decision_blocked` | `blocked_by_decision` | Roadmap only | Not selected | `c28684d` | Disposable evidence exists; live-schema/restore evidence absent | 2026-07-28 | Approve data semantics, backup/restore owner, and a non-destructive migration plan. |
| 3 - Backend Business Logic and API Contracts | HTTP envelope, lifecycle, readiness, notification, compatibility/CMS | API transport; notification; CMS/Portfolio; governance/compatibility | `planning` | `approved_for_planning` | Roadmap only | Not selected | `c28684d` | Contract-planning evidence only | 2026-07-28 | Bound one contract family after Phase 0/1/2 dependencies are satisfied. |
| 4 - Frontend Engineering and Integration Parity | Auth/client, approved Retail/customer/B2B/CMS journeys | Auth/client; Retail/customer; B2B portal; Admin parity; CMS | `decision_blocked` | `blocked_by_decision` | Roadmap only | Not selected | `c28684d` | Unit evidence exists; end-to-end environment and scope authority absent | 2026-07-28 | Obtain slice authority and stable backend contract before frontend implementation plan. |
| 5 - UI, UX, Responsive, and Accessibility | Objective accessibility and factual state; deferred visual topics excluded | Objective UX/accessibility; surface direction/typography | `planning` | `approved_for_planning` | Roadmap only | Not selected | `c28684d` | Audit browser/static evidence; cross-browser/AT evidence blocked | 2026-07-28 | Draft a bounded objective-a11y plan only after affected state contracts are stable. |
| 6 - Testing and Release-Quality Gates | CI, E2E, artifact, static/security, coverage, parity | QA/release gates; package/runtime; dependency risk | `environment_blocked` | `blocked_by_environment` | [VERIFICATION_MATRIX.md](VERIFICATION_MATRIX.md) | Not selected | `c28684d` | Existing tests do not form full release evidence | 2026-07-28 | Provision controlled CI/browser/API/role environment and choose required gates. |
| 7 - Deployment and Operational Readiness | Artifact, topology, env, backup/restore, rollback, release ownership | Release/deployment; migration/live-schema; provider boundary; observability | `decision_blocked` | `blocked_by_decision` | Roadmap only | Not selected | `c28684d` | No staging-like deployment or restore/rollback drill | 2026-07-28 | Assign topology, operations, RPO/RTO, provider, release, and rollback decisions. |
| 8 - Reliability, Performance, and Observability | Readiness, telemetry, workers, timeout, capacity, performance | Observability/background; release/readiness; maintainability/performance | `decision_blocked` | `blocked_by_decision` | Roadmap only | Not selected | `c28684d` | Static/local evidence only; no owned telemetry or load environment | 2026-07-28 | Select telemetry/SLO/on-call/worker and capacity ownership before test planning. |
| 9 - Governance, Documentation, and Final Reconciliation | Registers, runbooks, ownership, dependency policy, final status | Governance/provenance; dependency risk; maintainability | `planning` | `approved_for_planning` | This roadmap and traceability set | Not selected | `c28684d` | Documentation reconciliation is planned, not executed | 2026-07-28 | Reconcile only after the RC baseline and decision record are fixed. |
| 10 - Production-Candidate Verification | Full regression, drills, production-like proof, final readiness calculation | All applicable unresolved/accepted risks | `environment_blocked` | `blocked_by_environment` | [VERIFICATION_MATRIX.md](VERIFICATION_MATRIX.md) | Not selected | Not selected | No production-like candidate/environment exists | 2026-07-28 | Complete Phases 0-9, then approve a production-candidate verification window. |

## Team-assignment coordination

The detailed owner, reviewer, verifier, branch, worktree, source-boundary,
parallel-safety, and merge-order register is
[TEAM_ASSIGNMENT.md](TEAM_ASSIGNMENT.md). Its `PHASE-00A`–`PHASE-10E` IDs map
one-to-one to the roadmap group/subphase scope above; none of the proposed
branches or worktrees has been created.

| Assignment set | Current coordination status | Exact next stopping point |
| --- | --- | --- |
| `PHASE-00A`–`PHASE-00D` | `PHASE-00A` review passed; `PHASE-00D` is ready for independent review; `PHASE-00B` remains human/external-evidence gated; PHASE-00C has partial DR-012 ownership but remains target/topology blocked. | Dimas/Dirga review PHASE-00D when available; Faiz appoints the NIV-001 independent verifier and completes DR-012 target/topology/RPO-RTO/evidence fields. |
| `PHASE-01A`–`PHASE-05D` | PHASE-01A has bounded selected-SHA local evidence and a passing disposable browser-refresh retest; independent human review is unavailable, while broader scope remains `blocked_by_decision` or `requires_revalidation`. | Obtain independent review for PHASE-01A where available, then record DR-004 through DR-010 as applicable. |
| `PHASE-06A`–`PHASE-08D` | `blocked_by_decision` and/or `blocked_by_environment`; no CI, topology, provider, migration, or telemetry work is implied. | Assign the policy/environment/operations owners in DR-011 through DR-014. |
| `PHASE-09A`–`PHASE-10E` | `planning` only for reference reconciliation; final verification remains blocked by all preceding exits. | Reconcile only current evidence on the selected SHA; do not claim a candidate or go-live pass. |

## PHASE-01A bounded auth/session revalidation

**Scope and authority:** Faiz approved `DR-003` bounded revalidation on the
selected SHA on 2026-07-29. Scope is password recovery and Admin session only,
under `DEC-AUTH-003` through `DEC-AUTH-005`, `ADR-001`, and the two applicable
auth runbooks. It excludes customer session, real email, shared/staging/
production data, `AUTH_ARGON2_WRITES_ENABLED`, repository migration apply,
deployment, activation, and go-live.

**Controlled environment:** the local disposable MongoDB 7.0 `rs-test` service
at loopback port 27018 was healthy before this work. Transaction integration
tests use unique databases and clean them up; recovery delivery is captured
in-memory. No repository migration was executed and no external mail or
provider was used.

| Evidence family | Command / result | What it supports | Boundary that remains |
| --- | --- | --- | --- |
| Recovery and Admin-session domain plus real replica-set integration | `python -m pytest -n 0 -q backend\\tests\\test_auth_recovery.py backend\\tests\\test_auth_recovery_transaction_integration.py backend\\tests\\test_auth_session.py backend\\tests\\test_auth_session_transaction_integration.py` with explicit local `rs-test` opt-in: `40 passed in 2.66s`. | Recovery replay/concurrency and transaction-unavailable paths; Admin-session rotation, replay-family revocation, expiry, CSRF, and transactional behavior. | Local disposable evidence only; it is not a migration, shared-environment, or production claim. |
| Admin HTTP contract | `python -m pytest -n 0 -q backend\\tests\\test_auth_security.py`: `5 passed in 15.43s`. | Cookie attributes, no-store responses, origin/CSRF defenses, refresh rotation, and logout revocation through the HTTP layer. | The test transport is not a deployed same-origin HTTPS browser. |
| Frontend AuthContext state | `$env:CI='true'; npm test -- --watchAll=false --runInBand AuthContext.test.jsx` from `frontend/`: `8 passed`. | Cookie-session bootstrap, StrictMode-safe Admin bootstrap refresh, no browser token write, server logout invocation, and in-memory session clearing on terminal 401. | This is not a live browser, real Admin account, or deployed-origin verification. |

**Result and stop point:** the bounded local evidence and the disposable
same-origin HTTPS browser-refresh retest passed, but PHASE-01A is not a Phase 1
exit or production-readiness pass. Independent human review remains unavailable
under the team workflow. DR-004 and DR-005, customer-session scope, rollout,
and all broader identity/privacy findings remain outside this result.

**AI re-review (2026-07-29):** a separate read-only pass checked the selected
scope, applicable decisions, recorded commands/results, relevant backend
cookie/origin/CSRF/logout handlers, frontend `AuthContext`, and documentation
diff. It found no scope expansion, source change, secret, migration, or
unrecorded failed check; the bounded local evidence is internally consistent.
This is an `AI_re-review_passed`, not an independent human review or a Phase 1
exit.

**Browser remediation and retest (2026-07-29):** the original disposable
same-origin HTTPS browser run at `https://localhost:3443` exposed two concurrent
Admin bootstrap-refresh requests under development StrictMode. The first rotated
the session and the backend correctly rejected the replay as `401`. The approved
bounded fix adds only an in-flight client-side deduplication for that bootstrap
request in `AuthContext`; backend replay protection was not changed. The targeted
frontend test passed (`8 passed`), the backend concurrent-replay test passed
(`1 passed`), and a new disposable same-origin HTTPS browser run reached
`/admin` after login and remained at `/admin` after reload. The logout control
was visible; logout, revocation, and replay were not re-executed in the browser.
No cookie or token value was inspected or retained. This is local disposable
evidence only, not a deployed-origin or production claim.

**Disposable cleanup:** the named browser-test database was dropped and the
temporary backend, frontend, and proxy processes were stopped. On 2026-07-29,
local cleanup was verified: the temporary PFX and exported CA were absent, and
the temporary CA/leaf certificate counts in both Current User stores were zero.
The user-controlled `rs-test` Docker service was left running. Two temporary
frontend log files remain locked by a pre-existing process; no test runtime,
database, certificate, PFX, cookie, or token artifact remains.

## PHASE-00D discrepancy disposition

This is a selected-SHA documentation/provenance check only. It neither closes
audit findings nor changes a decision, runbook, source, test, migration, or
release status.

| Finding / area | Selected-SHA evidence | Treatment and stop point |
| --- | --- | --- |
| GOV-014 — unregistered pending plans | The Document Register now classifies the 2026-07-25 Admin content-editor and reporting/notification plans, including their no-authority boundaries. | Reconciled for the named plans; preserve their recorded status and do not execute them as authority. |
| GOV-015 — transaction ADR pointer | `doc/TRANSACTION_CAPABILITY_RUNBOOK.md` now points to `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`, which exists. | Reconciled at the selected SHA; later link/path validation remains a separate QA/governance gate. |
| GOV-017 — historical tracker freshness | `BACKEND_AUDIT_TRACKER_2026-07-24.md` is registered as Context Only, while the selected-SHA map records its historical baseline separately. | Contained, not revalidated: do not inherit its counts, statuses, or test results. |
| GOV-011 — stale generated pytest XML | `test_reports/pytest/pytest_results.xml` remains a tracked 2026-06-28 report without a selected-SHA provenance record. | Faiz approved the limited 2026-07-29 disposition: treat it as historical non-authoritative evidence, exclude it from release gates, and retain it unchanged in this task. It remains open until a QA/release owner sets retention policy and fresh CI produces attributable replacement evidence. |
| Unavailable historical Superpowers plan | The Document Register explicitly records the referenced branch-local plan as unavailable and non-authoritative. | Contained. Do not reconstruct it or treat it as current authority. |

## PHASE-00C migration stop-condition preflight

**Scope:** planning-only packet for `DR-012`; it does not select a target or
authorize a migration/rehearsal. Faiz is the recorded owner for migration,
backup/restore, rollback, maintenance-window authority, and evidence custody.
The local disposable `rs-test` replica set is the selected preflight target
only; it is not shared, staging, or production. RPO/RTO, secret evidence,
incident/release/on-call ownership, and the approved evidence format remain
open.

**Global stop rule:** do not run dry-run, apply, rollback, restore, or any
mutation against shared/staging/production data while the target, topology,
RPO/RTO, secret-evidence boundary, evidence format, and independent review are
unassigned. A local or disposable command cannot be substituted for this
decision. Transaction-required mutations must remain fail-closed when replica
set capability is unavailable.

**Environment preflight evidence (2026-07-29, reported by Faiz):**
`docker-compose.transaction-test.yml` validated; Docker daemon version 29.5.2
was active; loopback port 27018 was free before startup; the disposable MongoDB
7.0 service became healthy; and a read-only `db.hello().setName` probe returned
`rs-test`. No repository migration `001`–`009` was executed during preflight.

**Controlled local backup/restore evidence (2026-07-29):** with the disposable
`rs-test` service healthy before and after execution, `python -m pytest -n 0 -q
backend\tests\test_migration_backup_restore.py` completed with `4 passed in
1.24s`. The suite's temporary migration-shaped data exercise is limited to the
disposable test database; it is not an approved migration apply, shared/staging
or production restore, or a release/readiness pass.

| Migration candidates at selected SHA | Required preconditions before any execution | Status |
| --- | --- | --- |
| `001_identity_rbac_audit.py`, `003_identity_access_policy.py`, `006_granular_role_policy.py` | Named isolated target; approved window; backup and restore custody; transaction-ready replica set; reviewed opaque-ID procedure where applicable; dry-run, validation, rollback, and restore evidence. | Blocked by DR-012 and target/owner absence. |
| `002_catalog_material_inventory.py`, `004_content_blocks_seed.py`, `005_archive_orphan_collections.py` | Named isolated target; data-retention/owner approval; non-destructive dry-run; backup, validation, rollback, and restore plan; historical-record preservation check. | Blocked by DR-012 and data/retention decisions. |
| `007_security_publication_schema.py`, `008_auth_recovery_safety.py`, `009_admin_session_safety.py` | Named isolated target; encrypted backup custody; approved recovery/session runbook gates; transaction readiness; dry-run, failure/second-run validation, rollback, and restore evidence. | Blocked by DR-012, selected-scope revalidation, and absent target/window. |

**Required evidence record before removing a stop rule:** exact selected SHA,
environment and database identifier, timezone-aware window, owner and reviewer,
credential-free backup location plus checksum, dry-run result, apply/second-run
result where authorized, validation, rollback/restore result, and remaining
limitation. No secret, database URI, customer record, token, or password may be
recorded in this tracker.

## Existing authorization packets

The newer local default-branch history contains bounded Admin authentication
Phase 1 and Phase 2 packets. Their stated local gates and separate no-push,
no-deployment, no-activation boundaries remain intact. They are **not** marked
as completed roadmap phases here because:

- the selected `d04e3f0` candidate is 59 commits / 240 committed paths beyond
  audit baseline `c28684d`;
- their relationship to all other finding groups must be revalidated on the
  selected SHA; and
- the packets do not authorize unrelated migration, provider, operational, or
  production work.

## Resume protocol

When work resumes, update only the relevant tracker row with the exact SHA,
decision source, changed source/test scope, verification command/result,
limitations, and next stopping point. Preserve unrelated worktree files and do
not replace a `requires_revalidation` status with `complete` without current
resolution evidence.
