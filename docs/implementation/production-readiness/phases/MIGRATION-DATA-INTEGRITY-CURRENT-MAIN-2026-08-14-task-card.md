# Database, Migration, and Data Integrity Current-Main Audit Task Card

<!-- markdownlint-disable MD013 -->

**Lane:** Readiness.

**Branch/worktree:** `audit/backend-migration-data-integrity` /
`Niuva-worktrees/backend-migration-data-integrity`.

**Stacked base:** `audit/backend-auth-security-current-main` at `f9c4921` so
this feature audit remains reviewable without colliding with open tracker PRs
#244 and #245. The audited runtime baseline remains `origin/main` at
`15b759a`.

## Brief

| Field | Contract |
| --- | --- |
| Title and user outcome | Revalidate Migration 001–010 and historical-data reconciliation controls with exact-SHA evidence and a non-destructive disposition. |
| In scope | Source/test review of dry-run, idempotency, partial failure, rollback, marker/index ownership, record preservation, granular-RBAC rehearsal status, Migration 007–010 rehearsal status, Quote-line reconciliation, and legacy order/file/notification reconciliation. |
| Out of scope | Applying or rolling back any migration; connecting to real, shared, staging, or production data; changing an account; deleting or rewriting historical records; deployment, production-readiness approval, and go-live. |
| Authority | Master Spec; Document Register; Decision Register; `ADR-001`; `DEC-DATA-002/003`; `DEC-ACCESS-003`; migration and reconciliation runbooks. |
| Affected areas | Read-only inspection of migration, report, cleanup, reconciliation, transaction, and test paths; bounded safety regression if a reproducible source gap exists; audit evidence and primary readiness trackers. |
| Contract/dependency | Default dry-run must be read-only; mutations fail closed behind explicit authorization and transaction capability; rollback touches only migration-owned state; ambiguous history is preserved; destructive reconciliation is not inferred. |
| Done when | Migration 001–010 have an evidence matrix; destructive and historical-preservation risks have explicit dispositions; focused tests pass; unavailable representative/real-data evidence remains open; trackers point to the packet. |
| Verification | Migration/reconciliation pytest selections; expected-skip review; static destructive-operation and ownership review; current-head CI provenance where available; Markdown lint and `git diff --check`. |
| Owner and verifier | Codex is Driver; repository reviewer plus Data/Operations owner is the required independent verifier before any data-bearing execution or merge acceptance. |
| Commit/push/PR permitted | Yes, explicitly requested by the user on 14 August 2026. |
| Risks/open decisions | Migration 006 real-account execution, Migration 007–010 representative rehearsal, historical reconciliation targets, backup custody, restore proof, and environment authorization remain open. |

## Negative cases required

- Dry-run creates no marker, index, backup, session, mutation, or deletion.
- Partial index/marker state and ambiguous historical shapes stop rather than
  self-repairing or inferring identity.
- Apply/rollback paths require their documented transaction, backup, and
  authorization gates and compensate only migration-owned indexes.
- Historical Quote, Order, file, notification, recovery, session, and audit
  records are retained unless a separately authorized retention procedure has
  an independently verified restore path.
- A second apply is a no-op or otherwise deterministic under the migration's
  documented contract.
- Logs, reports, backups, and evidence remain aggregate or opaque-ID only and
  do not expose secrets or customer content.

## Rollback and handover

This task may change audit documentation and bounded source-level regression
guards only. It does not authorize database rollback. Repository changes can be
reverted normally. Any later data-bearing operation must use the migration's
approved backup/restore, dry-run, review, transaction, validation, and rollback
procedure against an explicitly authorized target.

<!-- markdownlint-enable MD013 -->
