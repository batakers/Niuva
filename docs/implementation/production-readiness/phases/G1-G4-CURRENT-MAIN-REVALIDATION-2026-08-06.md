# G1–G4 Current-main Revalidation Index — 6 August 2026

<!-- markdownlint-disable MD013 MD060 -->

**Status:** `EVIDENCE INDEX / NOT FINAL ACCEPTANCE`

**Exact current-main observation:** `origin/main` at
`f43eea6bd633b4250180e4373a62e5fb21fe14fa`, with Git tree
`6d2154bd52785bbc749345c0346651f9752d1646`, revalidated in fresh worktree
`C:\tmp\niuva-g1-g4-current-main-revalidation-20260806` on 6 August 2026.
The merge parents are `cccc1e8c06abf1eba57854166c01598bd8db2246` and
`0b23419a5a0fe46b7dbc8459032213c741c60fbc`.

This index is documentation-only. It does not select DR-001, approve a release
candidate, authorize source changes, activate a provider, run a migration,
deploy, or establish production-readiness or go-live.

## 1. Authority and boundary

The canonical authority chain is Master Spec → Document Register → Decision
Register → applicable ADR/decision → applicable runbook → current source/tests.
The applicable boundaries are:

- `ADR-001`: transaction-required cross-collection mutations require MongoDB
  replica-set transactions and fail closed when unavailable;
- `ADR-004` and approved access/UX decisions: route and role boundaries do not
  replace backend authorization or external verification;
- `ADR-005`: bounded backend remediation and read-only Retail discovery only;
- `DEC-AUTH-*`, `DEC-ACCESS-*`, `DEC-READY-01`, and `DEC-OBS-001`: bounded
  security/readiness/observability contracts with separate operational gates;
- `doc/PRODUCTION_DEPLOYMENT.md`, transaction/browser/rollout/migration runbooks:
  procedural guidance only, with explicit target, owner, rollback, and approval
  prerequisites.

Existing G1–G4 packets remain point-in-time evidence. This index prevents their
historical identities from being silently combined with current source into a
hybrid candidate.

## 2. Historical packet provenance

| Area | Historical packet observation | Current-main treatment |
| --- | --- | --- |
| G1 backend integrity | `d4bf4ac0e9454ad09e57856cfebbfa70b9a93294`, tree `9b1abc0c006342d5e4a63765075a7c8fca7e8897` | Critical transaction/B2B/catalog paths are compared separately below; the old packet identity is not current-candidate identity. |
| G2 auth/security | `d4bf4ac0e9454ad09e57856cfebbfa70b9a93294`, tree `9b1abc0c006342d5e4a63765075a7c8fca7e8897` | Five auth-event/alert source and test paths changed before `f43eea6`; prior focused counts require exact-current revalidation. |
| G3 frontend/browser | `d4bf4ac0e9454ad09e57856cfebbfa70b9a93294`, tree `9b1abc0c006342d5e4a63765075a7c8fca7e8897` | `frontend/package.json` and `frontend/scripts/release-script-contract.test.js` changed before `f43eea6`; prior release evidence is not silently promoted. |
| G4 artifact/rollback | `b1564b082208d55df869e94163eb2eaa3f61ee35`, tree `16a603bbba221793d68846501317c0dafa1690d2` | The current tree has a 21-path delta from this baseline; no artifact or rollback identity is created by Git ancestry. |
| G4 staging/operations | `443aefe36810201c89e3c99849a8159558c7fd37`, tree `992ada163fba7559345ce455dc9af4dd8a1970e7` | The current tree has a 59-path delta from this baseline; no external environment state is inferred. |

The G1/G2/G3 baseline delta from `d4bf4ac` to current main is 20 paths,
2,097 additions, and 76 deletions. The G4 artifact baseline delta is 21 paths,
2,410 additions, and 76 deletions. The G4 staging baseline delta is 59 paths,
4,698 additions, and 206 deletions. These are scope indicators, not readiness
percentages.

## 3. Exact-current path and test reconciliation

| Gate | Exact-current observation | Verdict | Remaining limit |
| --- | --- | --- | --- |
| G1 backend integrity | The transaction execution/guard/observability paths have no diff from tested head `17dd1f6c` to `f43eea6`; the B2B/catalog conflict paths have no diff from tested head `d4c144b7` to `f43eea6`. A focused current-main run of those five transaction/B2B/catalog test groups reported **45 passed**. PR #187, whose only delta beyond `f43eea6` is documentation, also passed the backend check. | `PASS WITH REPOSITORY/PATH EVIDENCE` | The isolated replica-set workflow was not rerun at exact `f43eea6`; staging persistence, monitoring, external consumers, migration, recovery, and independent review remain unproven. |
| G2 auth/security | Five auth-event/alert source/test paths changed after the historical G2 packet. A focused current-main run of `test_auth_security_events.py`, `test_auth_security_alerts.py`, and `test_auth_security_event_migration.py` reported **50 passed**. PR #187 backend and secret-scan checks passed on a docs-only branch from `f43eea6`. | `PARTIAL / DECISION-BLOCKED` | Exact external origin/cookie/role proof, MFA, key/secret custody, incident closure, migration/rollback, operational ownership, and independent review remain open. |
| G3 frontend release/browser | `frontend/package.json` and `frontend/scripts/release-script-contract.test.js` changed after the historical G3 packet. PR #187 frontend and secret-scan checks passed on a docs-only branch from `f43eea6`. | `BOUNDED REPOSITORY EVIDENCE` | Manual assistive-technology review, real-role/external browser paths, approved bundle budgets, immutable artifact identity, staging, and go-live remain unproven. |
| G4 staging/artifact/operations | Current runbooks and repository inventories remain provider-neutral. No approved staging origin, deployment target, immutable published artifact, previous-known-good release, restore rehearsal, or external monitoring evidence was found. | `BLOCKED BY EXTERNAL EVIDENCE` | DR-001, DR-011–014, environment/owner assignments, artifact custody, backup/restore, rollback exercise, and independent release review remain open. |

The current focused runs are local source/test evidence. They do not prove that
an external consumer is absent, that a staging or production environment is
configured, or that a deployment can be safely executed.

## 4. CI and unrun evidence

- PR [#187](https://github.com/batakers/Niuva/pull/187) at head `b690236` changed
  only the G5 documentation packet beyond `f43eea6`; its backend, frontend, and
  secret-scan checks passed. This is path-preserving current-main CI evidence,
  not a merged exact-`f43eea6` workflow run.
- The focused current-main backend test groups passed with `45 passed`.
- The focused current-main auth-event/alert/migration groups passed with
  `50 passed`.
- Full exact-current backend/frontend CI was not run locally because the PR CI
  already covered the unchanged runtime tree; no new external or deployment
  operation was attempted.
- Exact external origin/TLS/proxy/CORS/cookie verification, real-role browser
  and screen-reader review, artifact publication/attestation, backup/restore,
  migration, deployment, monitoring, load/capacity, and go-live checks were not
  run because the target, credentials, owners, or approval are absent.

## 5. Stop conditions and decisions still required

Do not use this index to:

- select `f43eea6` or any other SHA as a release candidate;
- enable Retail checkout, upload, payment, provider integrations, or production
  mutations;
- use real credentials/data, apply or restore migrations, or publish an
  untracked artifact;
- claim that local/CI evidence proves staging, production, or go-live readiness.

Required external decisions/evidence remain DR-001 candidate selection, DR-002
NIV-001 verification or renewed disposition, DR-003/004/005 auth decisions,
DR-011 provider/Finance scope, DR-012 staging/rollback ownership, DR-013
toolchain/release policy, DR-014 telemetry/worker/performance operations,
independent security/release review, and the later production-readiness/go-live
decision.

## 6. Handover

### Changed

- `G1-G4-CURRENT-MAIN-REVALIDATION-2026-08-06-task-card.md`;
- `G1-G4-CURRENT-MAIN-REVALIDATION-2026-08-06.md`.

### Intentionally unchanged

- all application source/tests, dependencies, lockfiles, workflows, migrations,
  providers, credentials, secrets, deployment configuration, and environments;
- canonical specifications, decision registers, ADRs, runbooks, and historical
  G1–G4 packets;
- PR #185, #187, #188, #189, #190, and #191; and
- the dirty primary worktree.

This documentation-only index is rolled back by reverting its documentation
commit. It changes no runtime, database, provider, deployment, or operational
state.

<!-- markdownlint-enable MD013 MD060 -->
