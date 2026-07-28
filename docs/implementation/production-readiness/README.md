# Production-Readiness Audit and Remediation Context

Status: **Context Only — audit, planning, and progress material; not
implementation authority.**

This directory preserves the production-readiness audit, its normalization,
planning, assignment, and verification context. It does not authorize source
changes, migrations, deployment, provider selection, production activation, or
go-live.

The directory is listed in the [Document Register](../../context/DOCUMENT_REGISTER.md)
only to make this non-authority boundary discoverable. Individual findings,
scores, checklists, and progress entries remain audit context, not decisions or
execution approval.

## Read before using this material

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. The applicable approved decision or ADR
5. The applicable runbook, current source, and tests

## Directory contents

| Document | Safe use |
| --- | --- |
| `DECISIONS_REQUIRED.md` | Decision inputs and unresolved decision boundaries; it does not choose a policy or provider. |
| `FINDING_TRACEABILITY.md` | Mapping of audit finding IDs and normalization history. |
| `REMEDIATION_PROGRESS.md` | Planning-progress handoff; progress is not completion or readiness evidence. |
| `REMEDIATION_ROADMAP.md` | Dependency-ordered remediation planning based on a recorded audit snapshot. |
| `TEAM_ASSIGNMENT.md` | AI-agent team task coordination and ownership context. |
| `VERIFICATION_MATRIX.md` | Planned verification controls and evidence expectations. |
| `phases/README.md` | Convention for opening a separately authorized phase plan. |

The recorded audit baseline can become stale as source or decisions change. A
new implementation or release claim requires a separately approved scope and
fresh verification against the selected candidate baseline.
