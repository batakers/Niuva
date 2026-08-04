# SEC-010 — Identity-Audit Retention and Owner Evidence Task Card

**Status:** Local documentation reconciliation complete; publication not
authorized; source remediation is merged in PR #127
**Date:** 2026-08-05
**Branch:** `docs/sec-010-retention-owner-reconciliation`
**Baseline:** `origin/main` at `bf749c741346255315d09ac96f3fa666408d17c4`
**Worktree:** `C:\tmp\niuva-sec010-retention-owner-reconciliation`

## Objective

Record the bounded retention, store, and role-accountability evidence for
`SEC-010` after the strict identity-governance writer was merged in PR #127.
The packet must distinguish the existing `audit_events` domain-audit boundary
from the dedicated `authentication_security_events` boundary.

This task records existing authority and evidence. It does not invent a
retention duration, appoint a named production owner, or authorize historical
data mutation.

## Authority

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. `docs/decisions/experience/DEC-OPS-002-admin-scope-reduction.md`
5. `docs/decisions/access/DEC-AUTH-009-authentication-security-event-governance.md`
6. `docs/decisions/access/DEC-AUTH-011-authentication-security-event-implementation.md`
7. `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md`, sections 9–10
8. Current source and tests at the selected baseline

`DEC-OPS-002` preserves the `audit_events` collection and states no data
deletion. `DEC-AUTH-009` and `DEC-AUTH-011` govern only the dedicated
authentication-security-event boundary; their 90-day rule must not be inferred
for identity-governance events in `audit_events`.

## Evidence mapping

- **Store:** identity-governance events are written to `audit_events`; the
  strict envelope, allowlisted projections, append-only insert, and indexes are
  evidenced by `backend/audit.py`, `backend/schema_manifest.py`, and section 9
  of the identity runbook.
- **Preservation boundary:** `DEC-OPS-002` preserves `audit_events` and states
  no data deletion. This task does not add a TTL, expiry duration, cleanup job,
  backfill, deletion, or historical rewrite.
- **Role accountability:** for the current source scope, retention
  governance/review maps to the Current Owner and designated reviewer; the
  identity runbook assigns backup/reconciliation execution to an authorized
  technical operator and readiness/recovery evidence to the platform/operations
  owner. This is role-based evidence, not a named-person production appointment.
- **Dedicated authentication events:** `authentication_security_events` remains
  separate under `DEC-AUTH-011`; no authentication-event retention rule is
  copied into the general identity-audit store.

## Exact file scope

### Files to change

1. `docs/implementation/production-readiness/LAYER-06-SECURITY-AUTH-PRIVACY-RECONCILIATION.md`
   - pin the report to the merged baseline;
   - replace the stale SEC-010 source statement;
   - record store, preservation, role-accountability, and test evidence;
   - retain historical, named-owner, and environment limits.
2. `docs/implementation/production-readiness/FINDING_TRACEABILITY.md`
   - distinguish the source-aligned SEC-010 slice from broader notification and
     authentication-event work that remains open.
3. This task card.

### Intentionally unchanged

- `backend/` source and tests;
- `docs/context/production-readiness-audit/` historical findings;
- canonical decisions and registers;
- `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md`;
- migrations, database state, provider integrations, secret stores, deployment,
  and environment files.

## Acceptance criteria

- The Layer 06 report records `bf749c7` as the selected baseline and no longer
  says that active identity-governance writers persist `actor_email` or free
  text `reason`.
- The report identifies `audit_events` as the store and cites the existing
  no-deletion preservation boundary without inventing a duration.
- The report records the existing role-based accountability and clearly marks
  named production ownership, historical-record handling, and operational
  restore/retention proof as separate gates where they remain required.
- The report explicitly keeps `authentication_security_events` under
  `DEC-AUTH-009`/`DEC-AUTH-011` and does not merge the two retention policies.
- Traceability describes SEC-010 as source-aligned while keeping broader
  notification, environment, and production-readiness findings open.
- No source, migration, provider, secret, database, deployment, or go-live
  change is made.

## Verification — 2026-08-05

- Worktree HEAD and `origin/main`: `bf749c741346255315d09ac96f3fa666408d17c4`.
- Historical audit baseline `c28684d34c03505ea2f862f32c6edc24b1d7bfba` is an
  ancestor of the selected baseline.
- Target report and this task card: `markdownlint-cli2@0.23.2`, **0 issues**.
- `git diff --check`: **passed**.
- Changed paths are limited to this task card, the Layer 06 report, and the
  traceability row; no staged changes exist.
- Exact-head B2 evidence: identity/audit/migration tests **70 passed, 2
  skipped**; dedicated authentication-event/health tests **37 passed**. The
  skips are opt-in real-transaction tests and no database was enabled.
- Full-file lint of the pre-existing traceability matrix still reports its
  existing MD013 long-table rows; this task does not reformat that historical
  matrix. No non-MD013 issue was reported for that file.

## Minimum verification

- Confirm worktree HEAD and `origin/main` both equal
  `bf749c741346255315d09ac96f3fa666408d17c4`.
- Review the changed-path list; only the three documentation/task-card files
  are in scope.
- Run targeted Markdown lint if available and `git diff --check`.
- Re-run or cite the exact-head B2 identity/audit and dedicated-auth test
  evidence without enabling real database transaction tests.
- Confirm no staged changes, secrets, provider activation, migration, or
  environment mutation.

## Authorization boundary

This task authorizes bounded documentation changes in the isolated worktree
only. It does not authorize staging, commit, push, pull request, canonical
promotion, source implementation, migration, deployment, provider activation,
production readiness, or go-live.

## Open decisions and limits

- No named person has been assigned as production retention/deletion owner.
- No identity-audit expiry duration or deletion procedure is selected by this
  task; the existing no-deletion preservation statement is the only recorded
  boundary.
- Existing historical `audit_events` documents are not rewritten or inspected
  by this task.
- Role-based source evidence does not prove backup/restore, live retention
  operation, access review execution, or production readiness.
