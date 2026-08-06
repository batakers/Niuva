# Current-main Post-G2 Readiness Revalidation — 6 August 2026

<!-- markdownlint-disable MD013 MD060 -->

**Status:** `CURRENT-MAIN / BOUNDED SOURCE REVALIDATION`. This packet records
evidence after PR #180 entered `main`; it is not a release-candidate selection,
staging acceptance, production-readiness approval, deployment authorization, or
go-live decision.

**Observed pre-packet baseline:** `origin/main` at
`9f6fe38398836b44158783684d23e6455c3cc6c2`, with Git tree
`46656d3c01c0bbc8ba02ad782c68626ab447b67c`, after a fresh fetch on 6 August
2026 (Asia/Jakarta).

This is the exact tree used for the revalidation below. Merging this
documentation-only packet would add only this file; it would not change the
runtime source, select a release candidate, or create staging/production
evidence.

**Verification worktree:** `C:\tmp\niuva-g5-post-g2-revalidation-20260806`

**Branch:** `codex/g5-post-g2-revalidation-20260806`

The separate source-fix PR [#181](https://github.com/batakers/Niuva/pull/181)
is intentionally excluded: it is open and its changes are not part of this
current-main baseline.

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
| Pre-packet `origin/main` | `9f6fe38398836b44158783684d23e6455c3cc6c2` | Point-in-time source identity; DR-001 does not select it |
| Git tree | `46656d3c01c0bbc8ba02ad782c68626ab447b67c` | Source-tree identity; not an artifact digest |
| First parent | `fe804293a1e8e66ccee1ae1f0ba29a94a90eb46e` | Previous main before PR #180 |
| PR #180 second parent | `c627f4ef28897c16906bce7e8dcd6f24ac162377` | Auth-security branch ancestry only |
| Worktree divergence | `origin/main...HEAD = 0/0` before packet edit | Does not prove external environment state |
| Delta from `fe804293` | PR #180 changed five source/test paths plus one G2 packet | No inference about deployment or runtime environment |

PR [#180](https://github.com/batakers/Niuva/pull/180) merged the bounded
authentication-security validation package. Its changed paths are:

- `backend/auth_security_alerts.py`;
- `backend/auth_security_events.py`;
- `backend/tests/test_auth_security_alerts.py`;
- `backend/tests/test_auth_security_event_migration.py`;
- `backend/tests/test_auth_security_events.py`; and
- `docs/implementation/production-readiness/phases/G2-AUTH-SECURITY-GATES-DECISION-PACKET-2026-08-06.md`.

The merge is repository integration evidence only. It does not select a
candidate, activate an event key or alert destination, execute Migration 010,
or prove staging, production, or go-live behavior.

## 3. Exact-current-main verification

All commands in this section ran in the clean worktree at the pre-packet
baseline, with cache writes disabled and pytest parallelism disabled:

| Check | Result | Boundary |
| --- | --- | --- |
| Bounded G2 auth/security suite | `158 passed` | Local source/test evidence only |
| Identity, access, projection, storage companion suite | `164 passed, 2 skipped` | Skips remain explicit; no external role or staging evidence |
| Full backend suite | `967 passed, 15 skipped, 14 subtests passed` | Repository evidence; not a staging or production run |
| `python -B -m compileall -q backend/auth_security_events.py backend/auth_security_alerts.py backend/migrations/010_authentication_security_events.py` | Passed | Syntax/compile evidence only |
| `git status --short --branch` before packet edit | Clean, tracking `origin/main` | Does not prove artifact or environment identity |

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

The companion suite covered identity foundations and migrations, audit,
storage, Retail order projection, and legacy classification. No shared,
staging, or production database was contacted.

## 4. Bounded G2 result

The current main source supports the following bounded contract evidence:

| Control | Current evidence | Remaining limit |
| --- | --- | --- |
| Dedicated event boundary | Strict field allowlist, schema/version, UTC normalization, 90-day expiry, and pseudonymized unknown/peer references are validated before insertion | Key delivery/custody and enabled-target configuration are not evidenced |
| Provider-neutral alert boundary | Alert documents contain references/counts, approved retry schedule, deduplication fingerprint, and bounded response deadline | Delivery worker, destination, dead-letter operation, and alert owner are not evidenced |
| Migration 010 | Source CLI and static tests preserve dry-run and fail-closed apply/rollback behavior | No target was approved or contacted; no apply, rollback, restore, or TTL/index exercise ran |
| Public/auth behavior | Existing bounded auth and permission tests pass on exact current main | External HTTPS/proxy/cookie/cache behavior, timing analysis, and seeded-role verification are absent |
| MFA | No MFA implementation was introduced by PR #180 | DR-005 parameters, key custody, recovery, support, and step-up decisions remain open |

This is a bounded source/test pass, not authentication-security closure. A
passing test, merged PR, feature flag, migration marker, or outbox document does
not satisfy the open operational gates.

## 5. Readiness and G5 impact

| Gate | Current result | Verdict |
| --- | --- | --- |
| Exact current-main source identity | Revalidated at `9f6fe38` / tree `46656d3` | `PASS` for this packet's provenance |
| G2 bounded source/test contract | Exact-main suites pass; PR #180 source is integrated | `PARTIAL_PASS` |
| DR-001 immutable release-candidate selection | Owner disposition remains blank | `BLOCKED_BY_DECISION` |
| DR-003/DR-004/DR-005 auth, abuse-control, and MFA closure | Open consequences remain | `BLOCKED_BY_DECISION` |
| External role/origin/TLS/proxy/CORS/cookie evidence | No approved target or credentials | `NOT_RUN` |
| Migration/backup/restore/rollback evidence | No approved target or mutation authorization | `NOT_RUN` |
| Artifact digest/attestation/previous-known-good identity | Not present | `MISSING` |
| Monitoring, SLO, alert route, on-call, and incident owner | Not evidenced | `BLOCKED_BY_DECISION` |
| Production-readiness/go-live decision | Not eligible | `BLOCKED` |

Existing G1/G3/G4/G5 packets contain earlier point-in-time observations and
must not be combined with this tree to form a hybrid candidate. The older G2
packet in `G2-AUTH-SECURITY-GATES-DECISION-PACKET-2026-08-06.md` records the
pre-PR #180 source baseline and remains historical evidence; this packet is the
current-main reanchor for the bounded G2 result.

## 6. Stop conditions and external actions

Do not, based on this packet:

- select `9f6fe38` as a release candidate without the Project Owner's DR-001
  disposition;
- enable Retail checkout, upload, payment, provider integrations, or
  production mutations;
- create or deliver production event keys, activate alert destinations, or
  run cleanup workers against shared/staging/production data;
- apply, restore, or roll back migrations;
- publish an untracked artifact as a release; or
- declare the repository production-ready or go-live eligible.

Remaining approvals/evidence include DR-001/002/003/004/005/011/012/013/014,
named security and operations owners, key custody, alert delivery, isolated
Migration 007–010 exercises, backup/restore, external staging target and
access, artifact publication/attestation, independent security/release review,
deployment, production-readiness approval, and go-live approval.

## 7. Handover

### Changed

- `docs/implementation/production-readiness/phases/CURRENT-MAIN-POST-G2-REVALIDATION-2026-08-06.md`

### Intentionally unchanged

- all backend/frontend source, tests, dependencies, lockfiles, workflows,
  migrations, providers, credentials, secrets, and environment files;
- canonical specifications, decision registers, ADRs, and runbooks;
- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` and all
  prior G0–G5 packets;
- the open source-fix PR [#181](https://github.com/batakers/Niuva/pull/181);
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
