# Remediation Phase Working Convention

Status: Planning and Progress Context — Not Implementation Authority Unless Explicitly Approved

This directory is reserved for future bounded phase plans. It intentionally
contains no implementation plan in the initial roadmap handoff.

## Current Phase 1 evidence index

The following packets were merged after the initial roadmap handoff. Their
feature numbering is evidence organization within roadmap `PHASE-01A`; it does
not create three separate roadmap phases.

| Feature | Evidence packets | Merged PR | Tracker status |
| --- | --- | --- | --- |
| 1.1 Customer Session | [Read-only revalidation](FEATURE-1.1-customer-session-revalidation.md); [remediation](FEATURE-1.1-customer-session-remediation.md) | #79 | Bounded source/local-test evidence merged; Migration 007 and production topology/deployment evidence remain open. |
| 1.2 Admin Session | [Read-only revalidation](FEATURE-1.2-admin-session-revalidation.md) | #80 | Local revalidation passed; AS-001 production evidence, AS-002 cross-tab policy/browser evidence, Migration 009, and cutover remain open. |
| 1.3 Password Recovery | [Read-only revalidation](FEATURE-1.3-password-recovery-revalidation.md); [remediation](FEATURE-1.3-password-recovery-remediation.md) | #81 | Bounded remediation evidence merged; PR-002 timing, PR-004 provider delivery, and Migration 008 remain open. |

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
