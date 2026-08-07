# Granular RBAC (2.1) revalidation

Status: **Revalidated — repository scope**  
Evidence date: 2026-08-07 (Asia/Jakarta)  
Candidate base: `origin/main` (`dd4f535`)  
Branch: `feat/granular-rbac`

## Scope

This slice revalidates the approved granular internal-role policy in
`DEC-ACCESS-001` and `DEC-ACCESS-002` without changing the production account
migration decision. The runtime remains fail-closed for legacy/unclear identity
records, keeps customer roles separate from internal roles, and permits
additive internal roles while keeping `super_admin` exclusive.

## Evidence

The focused permission suite covers:

- every canonical role's positive and negative domain permissions;
- additive multi-role resolution and stable canonical ordering;
- current policy-version and reviewed-access requirements;
- legacy, disabled, mixed customer/internal, and stale-policy records;
- route permission inventory and owner-only governance permissions; and
- the Super Admin-only identity/settings boundary, including wildcard authority.

Reproducible command:

```bash
cd backend
pytest -q tests/test_permissions.py tests/test_identity_foundation.py
```

The full backend CI job remains the required merge gate. This revalidation is
repository/test evidence only; it does not authorize migration `006`, account
role assignment, production rollout, or go-live. Migration `006` remains
dry-run by default and requires the approved backup, transaction-capability,
reviewed mapping, and rollback gates in `IDENTITY_RBAC_AUDIT_RUNBOOK.md`.

## Ownership and follow-up

- Backend identity owner: maintain `backend/permissions.py`, identity routes,
  and the focused policy tests.
- Security/release owner: review any permission-matrix change and rerun the
  focused suite before merge.
- Migration owner: provide the separate non-production migration evidence;
  this PR intentionally does not execute or authorize it.

