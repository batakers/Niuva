# Implementation Plans Index

This directory is not an implementation queue. A plan may be pending approval,
partial, completed, or historical even when its path contains the word
`pending`. Read the plan header and `docs/context/DOCUMENT_REGISTER.md` before
acting.

## Folder Meaning

| Location | Meaning | Safe use |
| --- | --- | --- |
| `completed/` | Completed execution records | Review scope, verification, and rollback history; do not re-execute. |
| `pending-reconciliation/` | Context-only plans, partial records, or proposals awaiting separate approval | Revalidate against canonical authority before preparing any new task; never treat this folder as a work queue. |

The register identifies the authority and lifecycle of each plan. A separate
task card, applicable decision, and explicit implementation authorization are
still required before source work begins.
