# Current-main Post-G2 Readiness Revalidation — 6 August 2026

<!-- markdownlint-disable MD013 MD060 -->

**Status:** `CURRENT-MAIN / BOUNDED SOURCE REVALIDATION`. This packet records
evidence after PRs #181, #182, #183, and #184 entered `main`; it is not a release-candidate selection,
staging acceptance, production-readiness approval, deployment authorization, or
go-live decision.

**Observed pre-packet baseline:** `origin/main` at
`cccc1e8c06abf1eba57854166c01598bd8db2246`, with Git tree
`4dc9ce2960be84900c58f96351547ed899f11763`, after a fresh fetch on 6 August
2026 (Asia/Jakarta).

This is the exact tree used for the revalidation below. The replacement
documentation-only packet updates point-in-time evidence; it does not change
runtime source, select a release candidate, or create staging/production
evidence.

**Verification worktree:** `C:\tmp\niuva-current-main-reconciliation-post-182-183-20260806`

**Branch:** `codex/current-main-reconciliation-post-182-183-20260806`

PRs [#181](https://github.com/batakers/Niuva/pull/181),
[#182](https://github.com/batakers/Niuva/pull/182),
[#183](https://github.com/batakers/Niuva/pull/183), and
[#184](https://github.com/batakers/Niuva/pull/184) are integrated in this
baseline. No PR was open at the pre-packet inventory timestamp; a replacement
PR opened after that snapshot is not included in the count.

## 1. Authority and boundary

This packet follows the repository authority order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. `DEC-AUTH-009`, `DEC-AUTH-011`, `DEC-AUTH-012`, and `ADR-001` where their
   bounded contracts apply;
5. `docs/runbooks/AUTH_SESSION_RUNBOOK.md` and
   `docs/runbooks/AUTH_RECOVERY_RUNBOOK.md`; and
6. current source, tests, workflows, and merged evidence.

`DEC-AUTH-011` permits the bounded authentication security-event and
provider-neutral alert foundations, while production key custody, named
owners, cleanup/alert operations, Migration 010 execution, deployment, and
go-live remain separately gated. The runbooks are procedural authority only;
they do not authorize shared/staging/production mutation.

## 2. Exact repository identity and delta

The clean fresh worktree matched the fetched remote before this packet was
created:

| Evidence | Result | Limit |
| --- | --- | --- |
| Pre-packet `origin/main` | `cccc1e8c06abf1eba57854166c01598bd8db2246` | Point-in-time source identity; DR-001 does not select it |
| Git tree | `4dc9ce2960be84900c58f96351547ed899f11763` | Source-tree identity; not an artifact digest |
| First parent | `c137c40ba3064e755c08b040f133748e026f99c9` | Previous main before PR #183 |
| PR #183 second parent | `be3a10d545aa8d110535baee2f6e3c3eb5609ce5` | Current-main documentation branch ancestry only |
| Worktree divergence | `origin/main...HEAD = 0/0` before packet edit | Does not prove external environment state |
| Delta from `9f6fe38` | PRs #181–#184 changed two auth source/test paths and seven readiness/documentation paths | No inference about deployment or runtime environment |

PR [#181](https://github.com/batakers/Niuva/pull/181) merged the bounded
strict alert-policy validation and regression coverage. PR [#182](https://github.com/batakers/Niuva/pull/182)
merged the redacted NIV-001 inventory/evidence artifacts. PR [#183](https://github.com/batakers/Niuva/pull/183)
merged the earlier post-G2 packet, and PR [#184](https://github.com/batakers/Niuva/pull/184)
merged the DR-013 baseline refresh. The source paths changed by #181 are:

- `backend/auth_security_alerts.py`; and
- `backend/tests/test_auth_security_alerts.py`.

The merge is repository integration evidence only. It does not select a
candidate, activate an event key or alert destination, execute Migration 010,
or prove staging, production, or go-live behavior.

## 3. Exact-current-main verification

All commands in this section ran in the clean worktree at the pre-packet
baseline, with cache writes disabled and pytest parallelism disabled:

| Check | Result | Boundary |
| --- | --- | --- |
| Bounded G2 auth/security suite | `163 passed` | Local source/test evidence only |
| Full backend suite | `972 passed, 15 skipped, 14 subtests passed` | Repository evidence; not a staging or production run |
| `python -B -m compileall -q backend/auth_security_events.py backend/auth_security_alerts.py backend/migrations/010_auth_security_events.py` | Passed | Syntax/compile evidence only |
| `git status --short --branch` before packet edit | Clean, tracking `origin/main` | Does not prove artifact or environment identity |
| Local Gitleaks executable | Unavailable | No exact-main local secret-scan result is claimed; CI scan remains separate evidence |

The bounded G2 suite covered:

```text
backend/tests/test_auth_recovery.py
backend/tests/test_auth_password.py
backend/tests/test_auth_rate_limit.py
backend/tests/test_auth_security.py
backend/tests/test_auth_security_events.py
backend/tests/test_auth_security_alerts.py
backend/tests/test_auth_session.py
backend/tests/test_auth_security_event_migration.py
backend/tests/test_permissions.py
```

No shared, staging, or production database was contacted. The earlier #183
companion-suite result remains historical evidence from its `9f6fe38` base and
is not combined with this exact-main count.

## 4. Bounded G2 result

The current main source supports the following bounded contract evidence:

| Control | Current evidence | Remaining limit |
| --- | --- | --- |
| Dedicated event boundary | Strict field allowlist, schema/version, UTC normalization, 90-day expiry, and pseudonymized unknown/peer references are validated before insertion | Key delivery/custody and enabled-target configuration are not evidenced |
| Provider-neutral alert boundary | Alert documents contain references/counts, approved family severity/window/threshold, retry schedule, deduplication fingerprint, and bounded response deadline; boolean counts are rejected | Delivery worker, destination, dead-letter operation, and alert owner are not evidenced |
| Migration 010 | Source CLI and static tests preserve dry-run and fail-closed apply/rollback behavior | No target was approved or contacted; no apply, rollback, restore, or TTL/index exercise ran |
| Public/auth behavior | Existing bounded auth and permission tests pass on exact current main | External HTTPS/proxy/cookie/cache behavior, timing analysis, and seeded-role verification are absent |
| MFA | No MFA implementation was introduced by PRs #181–#184 | DR-005 parameters, key custody, recovery, support, and step-up decisions remain open |

This is a bounded source/test pass, not authentication-security closure. A
passing test, merged PR, feature flag, migration marker, or outbox document does
not satisfy the open operational gates.

## 5. Readiness and G5 impact

| Gate | Current result | Verdict |
| --- | --- | --- |
| Exact current-main source identity | Revalidated at `cccc1e8` / tree `4dc9ce2` | `PASS` for this packet's provenance |
| G2 bounded source/test contract | Exact-main suites pass; PR #181 source is integrated | `PARTIAL_PASS` |
| DR-001 immutable release-candidate selection | Owner disposition remains blank | `BLOCKED_BY_DECISION` |
| DR-002/NIV-001 incident closure | Accepted risk remains time-bound; independent closure evidence is absent | `BLOCKED_BY_DECISION` |
| DR-003/DR-004/DR-005 auth, abuse-control, and MFA closure | Open consequences remain | `BLOCKED_BY_DECISION` |
| External role/origin/TLS/proxy/CORS/cookie evidence | No approved target or credentials | `NOT_RUN` |
| Migration/backup/restore/rollback evidence | No approved target or mutation authorization | `NOT_RUN` |
| Artifact digest/attestation/previous-known-good identity | Not present | `MISSING` |
| Monitoring, SLO, alert route, on-call, and incident owner | Not evidenced | `BLOCKED_BY_DECISION` |
| Production-readiness/go-live decision | Not eligible | `BLOCKED` |

Existing G1/G3/G4/G5 packets and the pre-merge packet evidence contain
point-in-time observations and must not be combined with this tree to form a
hybrid candidate. The older G2 packet records a pre-#181 source baseline and
remains historical evidence; this packet is the current-main reanchor for the
bounded G2 result.

## 6. Stop conditions and external actions

Do not, based on this packet:

- select `cccc1e8` as a release candidate without the Project Owner's DR-001
  disposition;
- enable Retail checkout, upload, payment, provider integrations, or
  production mutations;
- create or deliver production event keys, activate alert destinations, or
  run cleanup workers against shared/staging/production data;
- apply, restore, or roll back migrations;
- inspect, rotate, revoke, or test any credential;
- publish an untracked artifact as a release; or
- declare the repository production-ready or go-live eligible.

Remaining approvals/evidence include DR-001/002/003/004/005/011/012/013/014,
named security and operations owners, key custody, alert delivery, isolated
Migration 007–010 exercises, backup/restore, external staging target and
access, artifact publication/attestation, independent security/release review,
deployment, production-readiness approval, and go-live approval.

## 7. Handover

### Changed

- `docs/implementation/production-readiness/FINDING_TRACEABILITY.md`;
- `docs/implementation/production-readiness/phases/CURRENT-MAIN-POST-G2-REVALIDATION-2026-08-06.md`;
- `docs/implementation/production-readiness/phases/DR-002-NIV-001-DISPOSITION-2026-08-06-task-card.md`;
- `docs/implementation/production-readiness/phases/DR-002-NIV-001-DISPOSITION-2026-08-06.md`;
- `docs/implementation/production-readiness/phases/DR-002-NIV-001-REDACTED-GIT-INVENTORY-2026-08-06.md`; and
- `docs/implementation/production-readiness/phases/DR-002-NIV-001-REVOKE-ROTATE-EVIDENCE-TEMPLATE-2026-08-06.md`.

### Intentionally unchanged

- all backend/frontend source, tests, dependencies, lockfiles, workflows,
  migrations, providers, credentials, secrets, and environment files;
- canonical specifications, decision registers, ADRs, and runbooks;
- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` and all
  prior G0–G5 packets;
- the merged PRs #181–#184 and their historical branches/worktrees; and
- all external environments, databases, artifact registries, and deployment
  targets; and
- the primary dirty worktree and parallel-chat worktrees.

### Risk and rollback

This packet changes documentation only. Its rollback is a normal revert of the
documentation commit. The primary risk is evidence staleness if `main` advances
again; any candidate or final G5 acceptance must refetch and revalidate the
selected SHA.

### External actions still requiring approval

Project Owner DR-001 selection, DR-002 incident disposition, auth/security
decision closure, staging access and data policy, artifact publication and
attestation, backup/restore and migration exercises, provider/key activation,
independent release review, deployment, production-readiness approval, and
go-live.

<!-- markdownlint-enable MD013 MD060 -->
