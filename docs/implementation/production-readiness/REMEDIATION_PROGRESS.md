# Niuva Production-Readiness Remediation Progress

Status: Planning and Assignment Context — Not Implementation Authority

Last updated: 2026-07-28 (Asia/Jakarta)
Planning baseline: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`

## Progress rules

This is a roadmap tracker, not evidence that a remediation phase has started.
Only one phase may be `in_progress` after its exact scope, authority,
dependencies, rollback impact, and verification plan are approved. A status of
`planning` permits documentation work only.

The selected release-candidate SHA is not yet decided. Because local
`origin/main` is 13 commits ahead of the audit baseline, findings affected by
its auth, migration, frontend, CI, runbook, and register changes require
revalidation before implementation planning.

| Phase | Scope | Findings | Status | Authorization | Plan Document | Implementation Branch | Baseline SHA | Verification | Last Updated | Next Step |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 - Safety, Baseline, and Evidence Preservation | RC baseline, NIV-001, migration stop conditions, provenance | Freshness; NIV-001; migration/live-schema; governance/provenance | `requires_revalidation` | `blocked_by_decision` | [REMEDIATION_ROADMAP.md](REMEDIATION_ROADMAP.md) | Not selected | `c28684d` | Audit evidence only; no Phase 0 execution | 2026-07-28 | Project Owner selects exact RC SHA and NIV-001 disposition. |
| 1 - Identity, Authentication, Authorization, and Privacy | Auth, role, privacy, file/order boundaries, transaction/payment guard | Session/MFA; recovery; abuse; file/order; transaction; quote; payment; Admin parity | `requires_revalidation` | `blocked_by_decision` | Roadmap only; existing auth packets retain their own gates | Not selected for roadmap | `c28684d` | Prior local evidence is stale for the newer default-branch auth changes | 2026-07-28 | Revalidate selected auth/transaction findings on chosen SHA; obtain remaining decisions. |
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
| `PHASE-00A`–`PHASE-00D` | `planning`; `PHASE-00A` and `PHASE-00B` remain human/external-evidence gated. | Project Owner selects one immutable RC SHA and appoints the NIV-001 independent verifier. |
| `PHASE-01A`–`PHASE-05D` | `blocked_by_decision` or `requires_revalidation`; no source ownership is active. | Revalidate selected-baseline auth/data contracts and record DR-003 through DR-010 as applicable. |
| `PHASE-06A`–`PHASE-08D` | `blocked_by_decision` and/or `blocked_by_environment`; no CI, topology, provider, migration, or telemetry work is implied. | Assign the policy/environment/operations owners in DR-011 through DR-014. |
| `PHASE-09A`–`PHASE-10E` | `planning` only for reference reconciliation; final verification remains blocked by all preceding exits. | Reconcile only current evidence on the selected SHA; do not claim a candidate or go-live pass. |

## Existing authorization packets

The newer local default-branch history contains bounded Admin authentication
Phase 1 and Phase 2 packets. Their stated local gates and separate no-push,
no-deployment, no-activation boundaries remain intact. They are **not** marked
as completed roadmap phases here because:

- this roadmap has not selected `origin/main` as its baseline;
- the audit baseline is still `c28684d`;
- their relationship to all other finding groups must be revalidated; and
- the packets do not authorize unrelated migration, provider, operational, or
  production work.

## Resume protocol

When work resumes, update only the relevant tracker row with the exact SHA,
decision source, changed source/test scope, verification command/result,
limitations, and next stopping point. Preserve unrelated worktree files and do
not replace a `requires_revalidation` status with `complete` without current
resolution evidence.
