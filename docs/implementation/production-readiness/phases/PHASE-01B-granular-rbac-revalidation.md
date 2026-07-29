# PHASE-01B — Granular RBAC Read-Only Revalidation

Status: **revalidated — remediation required before Migration 006**
Phase / feature: `PHASE-01B` / Granular RBAC
Baseline: `97bbdaf1b2b6f630c3f23cb3189b5476165f7023`
Branch: `audit/backend-granular-rbac`
Revalidation date: 29 July 2026

## Outcome

The granular role identifiers, additive multi-role rules, customer/internal
separation, Super Admin-only identity routes, optimistic role updates, session
revocation, and unknown-role denial are present and covered by focused tests.
Migration 006 also passes its isolated replica-set integration test.

The phase is not ready for rollout. Runtime role resolution and Migration 006
do not yet fully implement the approved fail-closed bootstrap policy. No
migration, shared-data query, environment change, provider activation, deploy,
push, or merge was performed during this revalidation.

## Authority and inspected scope

- `docs/decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md`
- `docs/decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md`
- `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md`
- `backend/permissions.py`
- `backend/identity_routes.py`
- permission dependencies in backend route modules
- `backend/migrations/006_granular_role_policy.py`
- focused RBAC, identity, authentication, and migration tests
- `.github/workflows/transaction-tests.yml`

This document records source and test evidence only. It is not authority to
apply or roll back Migration 006.

## Verified behavior

| Boundary | Evidence | Result |
| --- | --- | --- |
| Stable granular roles and labels | `ROLE_LABELS`, `INTERNAL_ROLE_ORDER`, and policy tests | Pass |
| Additive internal multi-role assignment | `validate_roles`, permission union, and multi-role tests | Pass |
| `super_admin` exclusivity | role validation and invalid-combination tests | Pass |
| Customer/internal separation | role validation, staff conversion rejection, and route tests | Pass |
| Identity governance | `users.read` and `roles.manage` are available only through the `super_admin` wildcard; direct API tests deny warehouse and manager roles | Pass |
| Role/status mutation safety | expected-version selector, self-change rejection, session revocation, and audit append occur inside the guarded mutation | Pass |
| Superseded and unknown roles | resolver and login tests deny aggregate, legacy, mixed, duplicate, and unknown assignments | Pass |
| Route enforcement | inspected backend route modules consistently use `require_permission(...)` for internal operations | Pass with coverage limitation RBAC-004 |
| Migration transaction path | mandatory CI workflow includes Migration 006; local isolated replica-set test passed | Pass |

## Findings

### RBAC-001 — Current policy version is not required at runtime

Severity: **high**

`canonical_roles` requires active status and valid role syntax, but it does not
require `role_policy_version == ROLE_POLICY_VERSION`. It also treats a missing
`access_state` as approved. Consequently, an active record containing a valid
internal role can receive current permissions even when the record was not
marked with the current reviewed policy version, and a missing access state
does not fail closed.

This conflicts with the versioned migration boundary and the runbook's
review-required invariant. Existing tests construct authorized internal users
without a policy version, so the unsafe compatibility behavior is currently
encoded by the test fixtures.

Required remediation: decide the narrowly compatible legacy-customer rule,
then require current policy version and explicit approved access state for all
internal authority. Add negative resolver, login, session, and direct API tests.

### RBAC-002 — Migration 006 does not select one reviewed bootstrap Owner

Severity: **high**

Migration 006 automatically preserves every record shaped as
`roles: ["super_admin"]` with no legacy `role`. It has no explicit
`bootstrap_owner_id` input and no singularity validation. Multiple historical
records can therefore be classified as automatically preserved Owners without
the one-opaque-ID review required by the approved decision and runbook.

Required remediation: require one explicit reviewed active bootstrap ID,
quarantine other historical Super Admin candidates unless independently mapped
under an approved rule, and add zero/multiple/unknown/inactive bootstrap tests.

### RBAC-003 — Migration 006 rollback can restore stale elevated fields

Severity: **high**

Rollback restores the captured role fields using only the user ID as the update
selector. It does not require the migration marker/current version in the
selector and does not enforce the reviewed bootstrap invariant. A concurrent
identity change after apply could be overwritten, and a captured historical
`super_admin` assignment can become authoritative because of RBAC-001.

Required remediation: constrain rollback to migration-owned state with an
expected version/marker, keep restored historical internal authority
review-required, validate the remaining Owner invariant, and add concurrency
and elevated-restore fault tests.

### RBAC-004 — Direct API matrix is representative, not exhaustive

Severity: **medium**

Current tests cover key allow/deny paths, including identity governance,
materials, orders, files, customer isolation, and several role matrix entries.
They do not enumerate every internal route and every relevant role/permission
pair. Static inspection found permission dependencies, but that is not a
substitute for an exhaustive direct API contract test.

Required remediation: generate or maintain an explicit route-to-permission
inventory and exercise representative allow plus all sensitive deny boundaries
for each role, including multi-role combinations.

## Verification evidence

Hermetic focused suite:

```text
backend/.venv/bin/python -m pytest -c backend/pytest.ini -n 0 -q \
  backend/tests/test_permissions.py \
  backend/tests/test_granular_role_migration.py \
  backend/tests/test_identity_foundation.py \
  backend/tests/test_auth_security.py

60 passed, 1 skipped in 12.52s
```

The skipped case is the opt-in real transaction test.

Isolated MongoDB replica-set suite:

```text
NIUVA_RUN_REAL_TRANSACTION_TESTS=1 \
MONGO_TRANSACTION_TEST_URL=mongodb://127.0.0.1:27019/?replicaSet=rs0 \
backend/.venv/bin/python -m pytest -c backend/pytest.ini -n 0 -q \
  backend/tests/test_granular_role_migration.py

4 passed in 0.28s
```

The real suite used its test-owned temporary database and cleanup path. It did
not execute the Migration 006 CLI or target application data.

## Gate and handoff

Do not run Migration 006 until RBAC-001 through RBAC-003 are fixed and reviewed,
the direct API evidence is expanded, an approved opaque mapping and bootstrap
Owner ID exist, and the backup/restore, maintenance window, transaction
readiness, custody, and explicit execution authorization gates are satisfied.

The next bounded branch should be a Granular RBAC remediation branch. It should
contain only the resolver, Migration 006, runbook reconciliation, and their
tests; it must not include another backend feature.
