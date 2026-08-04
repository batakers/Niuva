# Task B2 — Identity-Audit Contract Reconciliation

Status: Approved for bounded source/test implementation and PR publication
Date: 2026-08-05
Branch: `codex/b2-identity-audit-reconciliation`
Baseline: `origin/main` at `881acfb6761e9eb07ca5f248fa331f7ba03fc890`

## Objective

Reconcile every identity-governance event path with the approved strict
identity-audit contract in `audit_events`:

- exact envelope: `id`, `actor_user_id`, `action`, `target_type`, `target_id`,
  `previous`, `result`, `reason_code`, `policy_version`, `created_at`;
- no `actor_email`, free-text `reason`, raw `before`/`after`, email, or name in
  identity projections;
- allowlisted user projections remain `roles`, `access_state`, and `status`;
- staff-invitation events use only their safe invitation projection;
- authentication security events remain in the dedicated
  `authentication_security_events` boundary.

The existing request `reason` fields remain request-validation inputs only; no
free-text reason is persisted in the strict event. Each approved identity
action receives a bounded reason code.

## Authority

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/decisions/access/DEC-AUTH-009-authentication-security-event-governance.md`
- `docs/decisions/access/DEC-AUTH-011-authentication-security-event-implementation.md`
- `docs/decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md`
- `docs/decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md`
- `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md`, section 9

## Exact file scope

### Files to change

1. `backend/audit.py`
   - make the identity-governance writer emit the strict envelope;
   - add bounded action/reason-code mappings for staff invitation, staff role
     and status changes, customer status changes, and granular-role migration;
   - add and validate the safe `staff_invitation` projection;
   - preserve transaction-session forwarding and append-only insertion.
2. `backend/tests/test_audit.py`
   - cover the strict identity-governance adapter, action mappings, invitation
     projection, and rejection of unsafe projection/reason shapes.
3. `backend/tests/test_identity_foundation.py`
   - update the staff lifecycle assertions to verify strict event envelopes and
     absence of identity PII/free-text reason.
4. `backend/tests/test_granular_role_migration.py`
   - verify migration 006's fake-database audit events use the same strict
     envelope for apply and rollback paths.
5. `tasks/task-b2-identity-audit-reconciliation.md`
   - this task card and handover record.

### Intentionally unchanged

- `backend/identity_routes.py`: existing request and transaction call sites
  continue using the bounded adapter; no API shape change is part of B2.
- `backend/server.py`: customer-status call site remains transaction-scoped;
  the adapter enforces the shared contract.
- `backend/migrations/003_identity_access_policy.py` and
  `backend/migrations/006_granular_role_policy.py`: no migration source or
  execution change is required; their existing writer calls are reconciled by
  the shared adapter. Tests may exercise fake in-memory migration behavior only.
- `backend/auth_security_events.py`, `backend/migrations/010_auth_security_events.py`,
  schema manifests, provider integrations, secret stores, and deployment files.

## Acceptance criteria

- All current `append_identity_governance_event` producers persist only the
  strict identity-audit envelope.
- Identity events contain no `actor_email`, `reason`, `before`, `after`, email,
  name, password, token, or other forbidden fields.
- Staff invitation, invitation acceptance, role update, staff deactivate,
  staff reactivate, customer disable/activate, migration apply, and migration
  rollback paths have bounded action/reason-code coverage.
- Existing transaction behavior, version checks, session invalidation, and
  API response contracts remain unchanged.
- Dedicated authentication security event behavior remains unchanged.
- Targeted tests and proportional static checks pass.

## Exclusions and gates

- No historical audit backfill or deletion.
- No execution of migration 010 or any database migration against a real target.
- No provider activation, production credential, deployment, production
  readiness, or go-live action.
- Merge remains outside this task and requires separate review/approval.

## Remaining risks

- The API still accepts a free-text reason for compatibility, but B2 deliberately
  does not retain it in the audit event. A future UI/API decision may introduce
  an explicit approved reason-code field.
- Existing historical `audit_events` documents are not rewritten by B2 and
  require a separate reviewed remediation decision if they must be handled.

## Implementation handover — 2026-08-05

Changed:

- `backend/audit.py`: identity-governance events now flow through the strict
  envelope, bounded reason-code map, and safe user/staff-invitation projections.
- `backend/tests/test_audit.py`: strict adapter, all B2 action mappings, and
  fail-closed noncanonical runtime roles are covered.
- `backend/tests/test_identity_foundation.py`: staff and customer lifecycle
  routes verify strict event shape and no contact/free-text fields.
- `backend/tests/test_granular_role_migration.py`: apply and rollback fake
  paths verify strict event shape.
- This task card records the scope and evidence.

Verification:

- Targeted B2 checks: `28 passed`.
- Related identity/migration checks: `69 passed, 2 skipped`.
- Full backend suite from repository root: `924 passed, 17 skipped, 14 subtests passed`.
- `black --check` passed for all changed Python files.
- `isort --profile black --check-only` passed for all changed Python files.
- Critical flake8 (`E9,F63,F7,F82`) and backend compile checks passed.
- `git diff --check` passed.

The repository's configured xdist invocation could not create Windows workers
(`WinError 6` invalid handle), so the evidence above uses the configured test
selection with serial `-n 0`; no test was disabled. The branch remains
uncommitted and local at handover time. The subsequent user instruction on
2026-08-05 explicitly authorizes review, commit, push, and PR publication for
this exact B2 scope. Merge, migration, provider, deployment, and go-live gates
remain separate.
