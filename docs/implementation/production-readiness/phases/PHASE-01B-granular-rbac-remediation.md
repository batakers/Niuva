# PHASE-01B — Granular RBAC Remediation Evidence

Status: **source remediation complete — rollout remains blocked**
Implementation SHA: `e10edf0e5548d74add89bd3d83938b57bc8dda59`
Branch: `fix/backend-granular-rbac`
Implementation date: 29 July 2026
Source audit:
`PHASE-01B-granular-rbac-revalidation.md`

## Outcome

The four findings from the read-only revalidation are remediated in source,
tests, and the Migration 006 runbook. This record does not authorize or claim a
shared, staging, or production migration. No application data, `.env`, provider,
deployment, push, or merge was changed.

## Finding resolution

| Finding | Implemented control | Verification |
| --- | --- | --- |
| RBAC-001 | Internal authority now requires active status, explicit approved access state, and the exact current role policy version. Mixed legacy-customer/internal records fail closed. | Resolver negative tests, login/session tests, direct API suites, and full backend regression. |
| RBAC-002 | Apply requires one explicit opaque bootstrap Owner ID. The candidate must be active, approved, canonical, non-customer, and absent from the reviewed mapping. Other historical Owners are quarantined unless separately reviewed. | Missing, unknown, customer, wrong-role, multiple-candidate, selected-owner, dry-run, and apply tests. |
| RBAC-003 | Backup is bound to the reviewed Owner. Rollback requires and preserves that current Owner; other records use migration marker and expected post-migration version guards inside the transaction. | Concurrent-change atomic rollback test plus isolated replica-set apply, second-run, and rollback test. |
| RBAC-004 | The role fixtures now carry the canonical versioned identity contract. An automated route-permission inventory guards all literal permission dependencies and the Owner-only set; existing direct HTTP allow/deny tests remain active. | Permission inventory, identity governance, domain-route, customer-isolation, and full backend regression suites. |

## Changed scope

- Runtime resolver: `backend/permissions.py`.
- Migration and rollback: `backend/migrations/006_granular_role_policy.py`.
- Granular policy, migration fault, identity, auth, and affected domain fixtures
  under `backend/tests/`.
- Operator contract:
  `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md`.

No unrelated backend feature was implemented on this branch.

## Verification evidence

Full hermetic backend suite:

```text
backend/.venv/bin/python -m pytest -c backend/pytest.ini -n 0 -q backend/tests

562 passed, 11 skipped, 14 subtests passed in 26.25s
```

The skipped cases are separately gated integration tests.

Migration 006 against the test-owned local MongoDB replica set:

```text
NIUVA_RUN_REAL_TRANSACTION_TESTS=1 \
MONGO_TRANSACTION_TEST_URL=mongodb://127.0.0.1:27019/?replicaSet=rs0 \
backend/.venv/bin/python -m pytest -c backend/pytest.ini -n 0 -q \
  backend/tests/test_granular_role_migration.py

6 passed in 0.25s
```

The integration suite used a unique temporary database and removed it after the
test. The Migration 006 CLI was not run against application data.

Formatting and diff validation:

```text
black --check <changed RBAC source and core tests>
git diff --check

passed
```

`ruff` is not installed in the backend virtual environment. The repository's
available `flake8` default conflicts with Black's 88-character formatting on
pre-existing lines, so it was not used as completion evidence.

## Remaining rollout gate

Migration 006 remains blocked until all of the following are available:

1. approved target, maintenance window, operator, and two-person reviewers;
2. approved opaque reviewed mapping and bootstrap Owner ID;
3. full backup plus successful isolated restore evidence;
4. readiness and transaction-capability evidence for the exact target;
5. secure backup/mapping custody and rollback owner;
6. explicit permission to run dry-run/apply/rollback on that target.

Until those gates exist, the safe next action is review of commit `e10edf0`, not
execution of Migration 006.
