# Current-Main Authentication, Authorization, and Privacy Revalidation

<!-- markdownlint-disable MD013 MD060 -->

**Status:** `PARTIAL_PASS / DECISION_AND_ENVIRONMENT_BLOCKED`.

**Audited runtime baseline:** `origin/main` at
`15b759a02b036330f1dd0913611043e0fd6134e2`. The stacked branch starts from
PR #244 head `ea964d8`; its pre-audit delta changes documentation and the
frontend lock only, so the examined backend runtime is identical to `15b759a`.

**Branch/worktree:** `audit/backend-auth-security-current-main` /
`Niuva-worktrees/backend-auth-security-current-main`.

This packet records repository source/test evidence. It does not authorize
MFA implementation, a DR-004/DR-005 decision, key or secret handling, migration
execution, shared/staging/production access, provider activation, deployment,
production readiness, or go-live.

## 1. Scope and authority

The audit follows the Master Spec, Document Register, Decision Register,
`DEC-ACCESS-001/002`, `DEC-AUTH-001` through `DEC-AUTH-012`, `ADR-005`, and the
applicable auth/session/RBAC runbooks. It examines:

- Customer and Admin session transport, rotation, expiry, replay, CSRF,
  revocation, and surface separation;
- password recovery, password policy, bcrypt compatibility, Argon2 write gate,
  and bootstrap Admin preservation;
- MongoDB-backed abuse limiting and dependency-failure boundaries;
- authentication security-event allowlisting, pseudonymization, failure policy,
  retention, cleanup, and alert foundations;
- negative granular RBAC coverage for every effective Admin route; and
- customer-safe B2B and legacy-order projections.

Internal MFA is evidence-only. `DEC-AUTH-007` requires it, but DR-005 still
blocks implementation parameters, key custody, recovery/support, enrollment,
session/step-up, rollout, and ownership.

## 2. Control matrix

| Control | Repository evidence | Disposition | Remaining gate |
| --- | --- | --- | --- |
| Customer sessions | Host-only HttpOnly access/refresh cookies, readable synchronizer CSRF cookie, `SameSite=Lax`, exact-origin login, 15-minute access, seven-day hashed rotating refresh state, replay-family revocation, no-store responses, and test-only bearer gating | `PASS_WITH_REPOSITORY_EVIDENCE` | Exact deployed HTTPS/origin/proxy/TLS/cache capture, Migration 007 execution, monitoring, and external browser verification |
| Admin sessions | Secure HttpOnly `__Host-` Strict cookies, synchronizer CSRF plus origin verification, 15-minute access, bounded idle/absolute lifetime, remember-me limits, opaque Mongo-backed state, rotation/replay revocation, and cross-tab forced re-login behavior | `PASS_WITH_REPOSITORY_EVIDENCE` | Production origin/proxy/TLS, cleanup monitoring, Migration 009 application-database evidence, cutover, and independent verification |
| Recovery and revocation | Generic request/result handling, hashed 30-minute single-use token, atomic completion, sibling-token invalidation, all-session revocation, no automatic login, and safe origin validation | `PASS_WITH_REPOSITORY_EVIDENCE` | Real delivery provider/failure operations, timing review, application-database migration, support ownership, and external evidence |
| Password policy and Argon2 | One 15–128 Unicode-code-point / 512-byte backend policy, blocklist seam, bcrypt verification, Argon2id dependency/work factors, and fail-closed write gate | `PASS_WITH_ACTIVATION_LIMITS` | Resolve the retained `ADR-005` wording conflict, target-equivalent benchmark, blocklist operations, explicit write activation, migration/rollback, and production configuration |
| Bootstrap Admin | Startup creates one configured valid `super_admin` only when absent; an existing account is validated and never has its password or identity credentials rewritten | `PASS_WITH_REPOSITORY_EVIDENCE` | Controlled fresh-environment and rollout evidence; no shared or production account was contacted |
| Authentication limiter | HMAC-derived account/peer keys, MongoDB atomic counters, bounded `5` account / `20` peer failures per 15 minutes, generic `429`, `Retry-After`, and concurrency tests | `PARTIAL_PASS / DR-004_BLOCKED` | Store-outage behavior is not normalized or tested; trusted proxy, TTL/index application, real multi-worker MongoDB concurrency, retention, monitoring, and owners remain open |
| Security-event privacy and retention | Dedicated strict schema, unknown-field rejection, HMAC pseudonyms, no application reader, 90-day expiry, bounded cleanup lease, safe alert references, and dependency-error normalization | `PASS_WITH_IMPLEMENTATION_LIMITS` | Feature remains disabled by default; external HMAC key custody, Migration 010 execution/rollback, cleanup scheduling, alert destination, named owners, backup expiry, and fault drills remain open |
| Granular Admin RBAC | All `112` effective `/api/admin` routes carry at least one declared permission dependency across `42` permission names. New regression coverage invokes every route guard for every canonical role lacking its permission and requires generic `403 Forbidden` | `PASS_WITH_REPOSITORY_EVIDENCE` | Independent review plus seeded deployed-role/API evidence; no production role migration is authorized |
| Customer-safe projection | B2B inquiry/Quote/Project and legacy-order projections use explicit allowlists. Poisoned nested fixtures with cost, margin, supplier, profit, internal notes, raw payment, audit, linkage, and storage fields remain withheld | `PASS_WITH_REPOSITORY_EVIDENCE` | Representative historical/live data inventory, retention/privacy review, external consumer verification, and Organization Portal scope remain separate |
| Internal MFA and step-up | No TOTP enrollment/challenge, recovery-code lifecycle, MFA assurance, step-up, or passkey runtime exists | `BLOCKED_BY_DR-005` | Record the DR-005 package before any source, dependency, enrollment, recovery, key, session, or rollout work |
| Credential-incident closure | Repository tests and scans cannot prove historical credential rotation/revocation or remote/cache/fork cleanup | `OPEN_ACCEPTED_RISK` | NIV-001 remains P0 and accepted only through 30 August 2026; independent incident closure or a new explicit disposition is required |

## 3. Negative authorization and privacy evidence

The audit added
`backend/tests/test_sensitive_route_authorization.py`. It consumes FastAPI's
effective route inventory, not a hand-maintained endpoint list. The test fails
when an Admin route has no permission dependency and exercises each discovered
guard with every canonical role that lacks the declared permission. This closes
the repository-test inventory gap without granting any new role.

Representative HTTP/domain tests additionally cover:

- Customer and internal identities rejected from the wrong login surface;
- unknown, wrong-password, disabled, review-blocked, superseded-role, expired,
  revoked, replayed, cross-origin, and cross-customer cases;
- non-Super-Admin denial from identity governance, general user directory,
  role management, settings, and unrestricted audit boundaries;
- ownership-scoped customer Order and file reads; and
- nested B2B/legacy projection poisoning for cost, margin, supplier, profit,
  internal notes, payment payloads, audit details, and storage paths.

The exhaustive route test verifies permission dependencies and negative guard
behavior. It does not claim one deployed HTTP request for every role-route-body
combination; seeded external API verification remains an environment gate.

## 4. Reproducible verification

### Focused auth/security scope

```text
python -B -m pytest -p no:cacheprovider -n 0 -q [16 focused auth/RBAC modules]
252 passed, 4 skipped in 36.13s
```

The skipped cases are expected migration/transaction gates; none was treated
as production evidence.

### New RBAC and projection regression

```text
python -m pytest -n 0 -q \
  backend/tests/test_sensitive_route_authorization.py \
  backend/tests/test_permissions.py \
  backend/tests/test_identity_foundation.py \
  backend/tests/test_customer_safe_projection_revalidation.py \
  backend/tests/test_b2b_customer_projection.py \
  backend/tests/test_legacy_order_projection_revalidation.py
72 passed in 1.94s
```

Critical Flake8, Black, and isort checks pass for the new test.

### Full hermetic backend suite

```text
python -m pytest -q backend/tests --junitxml=/tmp/niuva-auth-audit-junit.xml
1032 passed, 15 skipped, 14 subtests passed in 19.68s
```

The evidence validator reports `0` errors, `0` failures, and zero unexpected
skips on Python 3.14.3. The same full suite remains a required PR gate.

### Replica-set evidence boundary

Docker is not installed on this local host, so the exact-head replica-set suite
was not rerun locally. The latest path-relevant transaction artifact is PR #226
run `31370658543`: `80 passed`, zero skipped, zero failures, and zero unexpected
skips. No audited auth/session/recovery/permission/projection runtime path
changed between that head and `15b759a`. This is retained CI evidence, not an
exact-head substitute; the new PR transaction job remains required because the
test scope changed.

## 5. Finding disposition and recommendation

- Keep Layer 06 readiness at `49%`; the new negative RBAC test raises evidence
  confidence, not operational readiness.
- Keep unresolved Layer 06 counts at `1 P0 / 4 P1`: NIV-001, MFA/access-review,
  recovery/password operational gates, distributed-abuse operations, and
  release/network evidence are not closed.
- Recommended DR-004 direction for later approval: internet-facing login and
  recovery limiter-store failures should return a generic retryable `503` and
  issue no session/reset token, while preserving revocation paths. Do not
  implement this recommendation until the operation-specific outage contract,
  topology, monitoring, retention, and owner are recorded.
- Keep MFA implementation blocked exactly as requested under DR-005.

## 6. Handover

Changed scope is one route-inventory negative test, this audit/task packet, and
the primary readiness trackers. Backend auth/session/recovery/password/limiter/
event/permission/projection runtime, migrations, dependencies, secrets,
environment, providers, and deployment configuration remain unchanged.

Rollback is a normal revert of the documentation and regression-test commit.
The principal risks are evidence staleness if `main` advances and overstating
repository tests as deployed security. PR #244 must merge first or this stacked
PR must be retargeted/revalidated against the then-current `main`.

<!-- markdownlint-enable MD013 MD060 -->
