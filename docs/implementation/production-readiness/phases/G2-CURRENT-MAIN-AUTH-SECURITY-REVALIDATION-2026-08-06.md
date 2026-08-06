# G2 — Current-main Auth, Security, and Abuse Revalidation

<!-- markdownlint-disable MD013 MD060 -->

**Status:** `PARTIAL_PASS / DECISION-BLOCKED`.
Current source and hermetic tests provide bounded authentication, session,
recovery, password, authorization, privacy, rate-limit, and security-event
evidence. Production topology, external role verification, MFA, credential
incident closure, operational ownership, migration, and go-live gates remain
open.

**Observed baseline:** `origin/main` at
`d4bf4ac0e9454ad09e57856cfebbfa70b9a93294`, with Git tree
`9b1abc0c006342d5e4a63765075a7c8fca7e8897`, after a fresh fetch on 6 August
2026.

**Branch/worktree:** `codex/g37-g2-current-main-revalidation-20260806` /
`C:\tmp\niuva-g37-g2-current-main-revalidation-20260806`.

This is a documentation-only G2 handover. It does not authorize authentication
source changes, MFA implementation, key or secret changes, migration,
provider/alert activation, real email, deployment, production-readiness
approval, or go-live.

## 1. Authority and scope

The applicable authority order is:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. `DEC-ACCESS-001`, `DEC-ACCESS-002`, and `DEC-ACCESS-003`;
5. `DEC-AUTH-003`, `DEC-AUTH-004`, `DEC-AUTH-005`, `DEC-AUTH-006`,
   `DEC-AUTH-007`, `DEC-AUTH-009`, `DEC-AUTH-010`, `DEC-AUTH-011`, and
   `DEC-AUTH-012`;
6. `ADR-005` where its bounded backend remediation contract applies; and
7. `AUTH_RECOVERY_RUNBOOK.md`, `AUTH_SESSION_RUNBOOK.md`,
   `CUSTOMER_SESSION_RUNBOOK.md`, `IDENTITY_RBAC_AUDIT_RUNBOOK.md`, current
   source, tests, and CI evidence.

The routing contract is
`docs/implementation/production-readiness/phases/G2-AUTH-SECURITY-ABUSE-2026-08-06-task-card.md`.
That card is planning authority only, and its recorded `c705a441` baseline is
stale. This handover refreshes evidence at the exact current SHA; it does not
modify the card or the decision register.

## 2. Exact repository identity and boundary

| Evidence | Result | Limit |
| --- | --- | --- |
| Current `origin/main` | `d4bf4ac0e9454ad09e57856cfebbfa70b9a93294` | Point-in-time source identity; DR-001 has not selected it as a release candidate |
| Git tree | `9b1abc0c006342d5e4a63765075a7c8fca7e8897` | Source tree identity, not an artifact or database identity |
| Latest main merge | PR #173 changed only the G4 evidence packet | No auth runtime change is inferred from that merge |
| Worktree before packet | Fresh from `origin/main`, clean, `origin/main...HEAD = 0/0` | Does not prove staging, proxy, database, or credential state |
| Changed scope | This packet only | No auth source, test, migration, dependency, workflow, or environment change |

## 3. G2 control matrix

| Control | Current source/test evidence | Current verdict | Remaining gate |
| --- | --- | --- | --- |
| Generic login failure and account eligibility | `DEC-AUTH-001`; login handlers and `test_auth_security.py` cover unknown, wrong-password, disabled, review-blocked, wrong-surface, and legacy-customer cases | `PASS WITH REPOSITORY EVIDENCE` | Residual timing analysis, exact deployed role matrix, and independent review |
| Customer session transport | `auth_sessions.py` uses host-only Secure cookies, HttpOnly access/refresh credentials, readable CSRF cookie, `SameSite=Lax`, 15-minute access, seven-day rotated refresh, hashed server-side state, and test-only bearer gating | `PASS WITH REPOSITORY EVIDENCE` | Exact same-origin HTTPS/proxy/TLS capture and isolated replica-set rotation/replay evidence |
| Customer CSRF, origin, logout, and no-store | `server.py`, `auth_sessions.py`, `DEC-AUTH-010`, and auth security/session tests enforce exact origin, synchronizer CSRF, family revocation fallback, cookie clearing, and auth `no-store` responses | `PASS WITH REPOSITORY EVIDENCE` | External origin, cookie, cache, and browser negative-path verification |
| Admin session transport | `auth_session.py` and `server.py` use `__Host-`, Secure, HttpOnly, Strict cookies, server-side opaque sessions, 15-minute access, bounded idle/absolute limits, CSRF/origin checks, rotation, and revocation | `PASS WITH REPOSITORY EVIDENCE` | HTTPS/proxy preservation, Mongo transaction topology, cleanup, monitoring, and cutover evidence |
| Password recovery | `auth_recovery.py` and tests cover generic responses, eligible-account handling, hashed 30-minute single-use tokens, atomic completion seam, session revocation, no automatic login, and safe origin parsing | `PASS WITH REPOSITORY EVIDENCE` | Real delivery failure behavior, isolated replica-set concurrency, provider-neutral delivery operations, and support procedure |
| Password policy and hash compatibility | `auth_password.py` enforces 15–128 Unicode code points and a 512-byte cap, whole-value blocklist checks, bcrypt verification compatibility, and fail-closed Argon2id write gating; current identity tests exercise provisioning | `PASS WITH ACTIVATION LIMITS` | Approved blocklist operations, Argon2 work-factor benchmark, write-enable decision, migration/rollback, and production configuration |
| Authentication abuse limiter | `auth_rate_limit.py` uses HMAC-derived account/peer dimensions, Mongo atomic counters, generic `429`, and `Retry-After`; focused tests pass | `PASS WITH OPERATIONAL LIMITS` | Trusted proxy policy, store outage behavior, TTL/index application, retention, monitoring, and accountable owner |
| Authentication security events | `auth_security_events.py` provides a dedicated strict allowlist, HMAC pseudonymization, key version, 90-day expiry, bounded cleanup, no application reader, and dependency normalization; event/alert tests pass | `PASS WITH IMPLEMENTATION LIMITS` | Key custody/delivery, enabled production configuration, collection/index deployment, cleanup/alert owner, destination, retention review, and failure drills |
| Authorization and privacy projection | Permission, identity, audit, storage, customer-safe projection, and retail-order tests cover role denial, status/access-state checks, ownership, safe fields, and internal-field exclusion | `PASS WITH REPOSITORY EVIDENCE` | Seeded role matrix across protected handlers/queries, representative historical fixtures, independent verifier, and live data/retention review |
| Internal MFA and step-up | No TOTP enrollment/challenge, recovery-code lifecycle, MFA assurance, step-up, or passkey implementation was found in current backend/frontend source; `DEC-AUTH-007` requires MFA but leaves implementation choices open | `BLOCKED BY DR-005` | Named security/identity owner, factor/library, key custody, recovery/support, session/event contracts, rollout and verification plan |
| Credential incident / history closure | DR-002 records a time-bound accepted risk; current packet does not claim NIV-001 closure, credential rotation, remote/cache/fork purge, or independent verification | `OPEN ACCEPTED RISK` | Incident owner, credential owner, repository administrator, and independent verifier evidence before expiry/renewal decision |

No source or test result is used to infer production secret values, MFA
parameters, limiter topology beyond the bounded implementation, trusted proxy
behavior, delivery provider activation, or external ownership.

## 4. Verification evidence

### 4.1 Local backend auth/security scope

From this fresh current-main worktree, with cache writes disabled and one
worker:

```text
python -B -m pytest -p no:cacheprovider -n 0 -q backend/tests/test_auth_recovery.py backend/tests/test_auth_password.py backend/tests/test_auth_rate_limit.py backend/tests/test_auth_security.py backend/tests/test_auth_security_events.py backend/tests/test_auth_security_alerts.py backend/tests/test_auth_session.py
99 passed in 19.41s
```

The authorization/privacy and projection-focused selection also passed:

```text
python -B -m pytest -p no:cacheprovider -n 0 -q backend/tests/test_identity_foundation.py backend/tests/test_permissions.py backend/tests/test_identity_access_migration.py backend/tests/test_granular_role_migration.py backend/tests/test_audit.py backend/tests/test_storage.py backend/tests/test_storage_routes.py backend/tests/test_retail_order_routes.py
197 passed, 2 skipped in 5.20s
```

The skipped cases are local migration/transaction-gated cases; no shared or
production database was used.

### 4.2 Frontend auth contract scope

Using the clean adjacent dependency installation without changing tracked
frontend files:

```text
CI=true npm test -- --runInBand src/context/AuthContext.test.jsx src/pages/auth/auth-surface.contract.test.js src/pages/auth/ForgotPassword.test.jsx src/pages/auth/ResetPassword.test.jsx src/pages/auth/ResetPasswordState.test.jsx src/pages/auth/StaffInvitationAccept.test.jsx src/components/auth/AuthShell.test.jsx src/components/auth/ProtectedRoute.test.jsx src/lib/permissions.test.js src/lib/passwordPolicy.test.js src/pages/admin/Customers.password-policy.test.jsx
11 suites passed, 65 tests passed
```

The frontend source contains no runtime `localStorage` or `sessionStorage`
credential transport. The API client uses credentialed cookies and a
JavaScript-readable CSRF value only where the approved synchronizer contract
requires it.

### 4.3 Isolated transaction evidence not run here

The auth transaction integration selection was intentionally executed without
an external URL only to verify the fail-closed skip boundary:

```text
python -B -m pytest -p no:cacheprovider -n 0 -q backend/tests/test_auth_recovery_transaction_integration.py backend/tests/test_auth_session_transaction_integration.py
2 skipped in 0.13s
```

The tests require both `NIUVA_RUN_REAL_TRANSACTION_TESTS=1` and
`MONGO_TRANSACTION_TEST_URL`. No approved disposable replica-set target was
provided to this task, so no database was contacted. A real transaction run
must be performed only against an explicitly approved isolated replica set;
this packet does not substitute local skips for that evidence.

### 4.4 Exact current-main CI

The successful push-quality workflow at exact current head
[`31061245165`](https://github.com/batakers/Niuva/actions/runs/31061245165)
completed all required jobs. Its backend job
[`92489477033`](https://github.com/batakers/Niuva/actions/runs/31061245165/job/92489477033)
reported **961 passed, 15 skipped, and 14 subtests passed** with dependency,
compile, lint, type, formatting, and full-suite stages successful. The same
run's frontend and secret-scan jobs also passed. This is exact-current-main
repository CI evidence, not staging or production evidence.

## 5. Decision and operational limits

The bounded repository auth/security contract is supported by source and test
evidence, but G2 cannot be marked complete. The remaining blockers are:

- DR-002 credential-incident closure or a renewed accepted-risk decision;
- DR-003 exact selected-scope and rollout-boundary confirmation;
- DR-004 trusted proxy, outage, TTL/index, retention, monitoring, and owner
  decisions for internet-facing abuse protection;
- DR-005 mandatory internal MFA implementation choices, key custody, recovery,
  support ownership, and step-up/session/event contracts;
- authentication-event key delivery, enabled configuration, cleanup, alert
  destination, retention review, and accountable owners;
- exact same-origin HTTPS, proxy/TLS, cookie, cache, and seeded-role staging
  evidence;
- isolated MongoDB transaction/concurrency evidence for session and recovery;
- migration 007–010 dry-run/apply/rollback/restore evidence, which remains
  unauthorized; and
- independent security and release verification.

The packet therefore records `PARTIAL_PASS / DECISION-BLOCKED`, not security
readiness, production readiness, or go-live approval.

## 6. Handover

### Changed

- `docs/implementation/production-readiness/phases/G2-CURRENT-MAIN-AUTH-SECURITY-REVALIDATION-2026-08-06.md`

### Intentionally unchanged

- all backend auth, session, recovery, password, rate-limit, event, alert,
  permission, identity, projection, and server runtime paths;
- all frontend auth context, API transport, auth components/pages, tests,
  dependencies, and lockfiles;
- migrations, database data, secrets, environment values, workflows,
  deployment configuration, provider/alert delivery, real email, and external
  environments;
- canonical specifications, decision registers, ADRs, runbooks, the G2 task
  card, `DECISIONS_REQUIRED.md`, and existing G0–G5 packets; and
- all worktrees and branches owned by other chats.

### Verification, risk, and rollback

- local backend auth/security: passed, `99` tests;
- local authorization/privacy/projection scope: passed, `197` tests with `2`
  local skips;
- local frontend auth contract scope: passed, `11` suites and `65` tests;
- auth transaction integration: not run against a database; `2` tests skipped
  because no approved isolated URL/opt-in was provided;
- exact current-main CI: passed at `d4bf4ac` with `961` backend tests plus
  frontend and secret-scan jobs;
- Markdown lint and `git diff --check`: passed; Docker-based Gitleaks could not
  run because the Docker Desktop daemon was unavailable, while the fallback
  staged-diff secret-pattern scan found no suspect matches; independent
  Gitleaks verification remains unrun;
- staging, real-role browser/API checks, external delivery, MFA, migration,
  backup/restore, provider/alert activation, deployment, monitoring, and
  go-live: not run or authorized.

This packet changes no runtime or operational state. Rollback is a normal
documentation revert. The principal risk is stale or overextended evidence;
G5 must revalidate every control against one selected immutable candidate SHA
and obtain an independent verifier before release decisions.

### External actions still requiring approval

Project Owner DR-001 selection; DR-002 incident disposition; DR-003/004/005
security decisions; named security, identity, operations, alert, and incident
owners; staging topology and seeded accounts; isolated replica-set access;
backup/restore and migration execution; secret/key use or rotation; alert/email
delivery activation; deployment; independent security/release review;
production-readiness approval; and go-live.

<!-- markdownlint-enable MD013 MD060 -->
