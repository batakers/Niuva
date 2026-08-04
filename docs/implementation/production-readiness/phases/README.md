# Remediation Phase Working Convention

Status: Planning and Progress Context — Not Implementation Authority Unless Explicitly Approved

This directory is reserved for future bounded phase plans. It intentionally
contains no implementation plan in the initial roadmap handoff.

## Current backend feature evidence index

The following packets were opened or merged after the initial roadmap handoff.
Their feature numbering organizes bounded backend evidence; it does not create
separate roadmap phases or bypass decision, dependency, environment, migration,
deployment, or verification gates.

| Feature | Evidence packets | PR state | Tracker status |
| --- | --- | --- | --- |
| 1.1 Customer Session | [Read-only revalidation](FEATURE-1.1-customer-session-revalidation.md); [remediation](FEATURE-1.1-customer-session-remediation.md) | #79 merged | Bounded source/local-test evidence merged; Migration 007 and production topology/deployment evidence remain open. |
| 1.2 Admin Session | [Read-only revalidation](FEATURE-1.2-admin-session-revalidation.md); [bounded completion](FEATURE-1.2-admin-session-completion.md) | #80 merged; #94 changes included in merged #93 | Forced re-login cross-tab browser evidence and disposable replica-set Migration 009 drill complete. AS-001 production HTTPS/proxy, restore, monitoring, cutover, deployment, activation, and observation evidence remain open. |
| 1.3 Password Recovery | [Read-only revalidation](FEATURE-1.3-password-recovery-revalidation.md); [remediation](FEATURE-1.3-password-recovery-remediation.md) | #81 merged | Bounded remediation evidence merged; PR-002 timing, PR-004 provider delivery, and Migration 008 remain open. |
| 1.4 Password Policy and Hash Migration | [Read-only revalidation](FEATURE-1.4-password-policy-hash-migration-revalidation.md); [remediation](FEATURE-1.4-password-policy-hash-migration-remediation.md) | #84 merged | PP-001/PP-002 bounded local remediation evidence merged. PP-003–PP-006, the `ADR-005`/`DEC-AUTH-004` password-rule clarification, production blocklist operations, target-equivalent Argon2 evidence, activation/migration, and deployed rollback floor remain open. |
| 1.5 Authentication Rate Limiter | [Read-only revalidation](FEATURE-1.5-auth-rate-limit-revalidation.md) | #85 merged | Bounded source and isolated-test evidence recorded. Real-MongoDB multi-worker concurrency, store-outage behavior, spoofed-header negatives, TTL-index application, production proxy topology, monitoring, retention operations, and owners remain open under DR-004. |
| 1.6 Internal MFA | [Read-only revalidation](FEATURE-1.6-internal-mfa-revalidation.md) | #86 merged | Revalidation confirms MFA is not implemented. TOTP, encryption/key custody, enrollment, pre-auth/session, step-up, recovery, security-event, rollout, and ownership decisions remain blocked under DR-005; no implementation is authorized. |
| 1.7 Authentication Security Events | [Read-only revalidation](FEATURE-1.7-auth-security-events-revalidation.md); [decision inputs](FEATURE-1.7-auth-security-events-decision-inputs.md); [remediation](FEATURE-1.7-auth-security-events-remediation.md) | #90 merged; bounded Migration 010 CLI fix uncommitted on audit branch | Disabled-by-default foundation remains merged. The CLI fix candidate passes unit/full regression and a live read-only dry-run with no marker/index/data change. Migration apply/rollback, named production owners, external HMAC-key custody, cleanup scheduling, alert-provider delivery, isolated rehearsal, deployment, activation, and go-live remain open. |
| 2.3 Legacy Order Compatibility | [remediation](FEATURE-2.3-legacy-order-projection-remediation.md) | #92 merged | Bounded source and local-test remediation merged: owner-scoped reads, customer/internal allowlists, safe historical payment metadata, and inactive mutations. Historical reconciliation, retention, proof custody, production inventory, deployment, and go-live remain open. |
| 2.4 File Authorization and Security | [remediation](FEATURE-2.4-file-security-remediation.md) | #93 merged as `57de1f3` | Bounded local/CI hardening is merged and current-main backend revalidation passed. Production provider/scanner, retention/quota, backup/restore, owners, reconciliation, deployment, and go-live remain open. |
| 3.1 Shared Transaction Executor | [main tracker notes](../REMEDIATION_PROGRESS.md#transaction-and-commercial-integrity-feature-register--30-july-2026) | #95 merged as `84f2ece` | Corrective review findings and CI were completed before merge; current-main transaction revalidation passed. No production topology or migration claim. |
| 3.2 Quote-Line Identity | [completion evidence](../../history/2026-07-30-backend-quote-line-identity.md); [runbook](../../../runbooks/QUOTE_LINE_RECONCILIATION_RUNBOOK.md) | #96 merged as `850d11a` | Exact source contract is merged. Historical-data execution remains separately gated and must never infer or automatically backfill identities. |
| 5.1 CMS Publication Lifecycle | [remediation](FEATURE-5.1-cms-publication-remediation.md) | PR #99 merged as `735674b` | Concurrent publish/rollback conflicts and audit-failure atomicity are covered by local and disposable-CI replica-set tests; timezone and permission contracts pass. Migration 007, production topology, deployment, and broader DR-010 consumer decisions remain open. |
| 5.2 Portfolio Lifecycle | [task card and evidence](FEATURE-5.2-portfolio-lifecycle-task-card.md) | PR #101 merged as `aff3d117` | Revision ownership, immutable publication replacement, rollback history, atomic reorder, customer-safe concurrent Project promotion, and permission parity passed focused review/tests and CI. New consumer scope, migration, deployment, and production gates remain open. |
| 7.2 Worker Topology | [task card](FEATURE-7.2-worker-topology-task-card.md); [decision package](FEATURE-7.2-worker-topology-decision-package.md) | PR #107 merged as `fe1d8a0` | High-level Option B plus bounded lease/worker values (15s operation, 5s acknowledgement, 40s margin, 60s lease, 30s renewal, concurrency 1, claim-ahead 0, 30s drain) are approved by Faiz; `decision_blocked` remains for SLO, capacity, telemetry, retention/access, alert, and evidence values. Source implementation remains unauthorized. |
| 7.3 Backend Observability | [task card](FEATURE-7.3-backend-observability-task-card.md); [decision package](FEATURE-7.3-backend-observability-decision-package.md) | PR #108 merged as `b336198` | High-level JSON Lines to stdout/stderr, no external provider, and the bounded Feature 7.2 worker values are approved by Faiz; `decision_blocked` remains for schema, metrics, alerting, retention, SLO, responder, capacity, and destination values. Source implementation/provider activation remain unauthorized. |

See [REMEDIATION_PROGRESS.md](../REMEDIATION_PROGRESS.md) and
[TEAM_ASSIGNMENT.md](../TEAM_ASSIGNMENT.md) for the consolidated roadmap
status. A merged feature packet is not by itself a roadmap phase exit,
production-readiness pass, release approval, or go-live approval.

## How to open a phase plan

Create a phase-specific plan only after the corresponding tracker row in
[../REMEDIATION_PROGRESS.md](../REMEDIATION_PROGRESS.md) is eligible under
[../REMEDIATION_ROADMAP.md](../REMEDIATION_ROADMAP.md). The plan must identify:

1. exact release-candidate SHA and active branch/worktree;
2. canonical authority, decisions, ADRs, and runbooks that govern the scope;
3. included canonical and source finding IDs from
   [../FINDING_TRACEABILITY.md](../FINDING_TRACEABILITY.md);
4. explicit exclusions and preserved unrelated work;
5. implementation authorization source and any remaining blocked decision;
6. data/migration/rollback impact;
7. acceptance criteria, negative cases, and verification environment;
8. stop conditions, handoff owner, and a secret-safe evidence location.

A phase plan must not use an audit recommendation, test count, current source,
or this directory as implementation authority.

## Phase status lifecycle

`not_started` -> `decision_blocked` / `planning` ->
`ready_for_review` -> `approved` -> `in_progress` ->
`verification` -> `complete`

A phase may instead be `requires_revalidation` when the exact SHA, authority,
source, tests, dependency, environment, or topology changes. A phase can be
`rolled_back` only with rollback evidence; it must retain its original source
findings and resolution history.

At most one phase may be `in_progress`. A later phase may be planned, but not
implemented, while a dependency remains incomplete.

## Required entry gate

Before a phase moves to implementation planning, verify:

- authority is clear and all required human decisions are recorded;
- every included finding is revalidated against the selected SHA;
- dependencies and environment capability are available;
- migration scope has a non-destructive backup, dry-run, validation, and
  rollback design;
- historical records and unrelated work are preserved;
- acceptance criteria are testable, including relevant negative paths;
- implementation, deployment, provider, production-readiness, and go-live
  authority are all distinguished.

## Required exit record

A completed phase record must state:

- exact implementation SHA(s), changed files, and source finding IDs;
- verification commands/procedures, environment, result, and limitations;
- role, privacy, transaction, migration, responsive, and accessibility impact
  where relevant;
- rollback/recovery result and any residual accepted risk;
- decision records that remain open; and
- the next phase that is genuinely unblocked.

Do not mark a phase complete because a branch exists, a document was drafted, a
test was skipped, or an implementation was merged elsewhere.
