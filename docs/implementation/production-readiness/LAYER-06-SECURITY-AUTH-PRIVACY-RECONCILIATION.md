# Layer 06 Security and Privacy Reconciliation

Status: Candidate / Context Only — Not Implementation Authority

This document reconciles the historical Layer 06 audit with the canonical
decisions and the current repository evidence. It is a review packet, not a
production-readiness approval, implementation authorization, migration plan,
provider selection, or go-live decision.

## 1. Decision and gate

The historical Layer 06 audit remains valid as historical evidence, but its
baseline is no longer the current repository state. Current source and
hermetic tests show meaningful remediation for sessions, recovery, password
handling, customer projections, file authorization, and authentication-event
boundaries. The reconciliation does **not** close the Layer 06 release gate.

The following remain open or environment-dependent: the credential-incident
closure, mandatory internal MFA, the complete distributed abuse-control
contract, production file-storage and malware/quarantine controls, identity
event privacy, production security headers/TLS/proxy evidence, and dependency
security evidence. Source-aligned items still require the dynamic or
environment evidence stated below. No moderated customer/operator session,
production activation, or go-live recommendation is authorized by this
packet.

## 2. Provenance and boundaries

| Field | Value |
| --- | --- |
| Repository | `batakers/Niuva` |
| Current base | `origin/main` at `dddb2a9dbbaea9660313c79ab5d1fe2c96965e52` |
| Reconciliation branch | `docs/reconcile-layer06-security-auth-privacy` |
| Worktree | `C:\tmp\niuva-layer06-reconcile` |
| Historical audit baseline | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Baseline relation | Historical baseline is an ancestor of the current base |
| Review date | 4 August 2026 (Asia/Jakarta) |
| Intended changes | This report and its companion task card only |

The historical evidence is preserved at
`docs/context/production-readiness-audit/layers/06-security-auth-privacy.md`.
No source, test, canonical decision, runbook, migration, environment, or
credential was changed for this reconciliation.

## 3. Applicable authority

The reconciliation follows the repository reading order and treats readiness
documents as context only:

<!-- markdownlint-disable MD013 -->
<!-- Authority links and evidence tables stay comparable in one row. -->
| Authority | Reconciliation use |
| --- | --- |
| [`docs/NIUVA_MASTER_SPEC.md`](../../NIUVA_MASTER_SPEC.md) | Protected operations, least privilege, safe customer projections, file boundaries, transaction fail-closed behavior, provider-neutral storage/payment, and secret hygiene |
| [`docs/context/DOCUMENT_REGISTER.md`](../../context/DOCUMENT_REGISTER.md) | Authority hierarchy and context-only boundary |
| [`docs/decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md`](../../decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md) | Granular internal role boundary |
| [`docs/decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md`](../../decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md) | Additive roles, separation of duties, and allowlisted permissions |
| [`docs/decisions/access/DEC-ACCESS-003-legacy-order-compatibility-and-customer-projection.md`](../../decisions/access/DEC-ACCESS-003-legacy-order-compatibility-and-customer-projection.md) | Read-only legacy history and safe customer projection |
| `DEC-AUTH-001` through `DEC-AUTH-012` in [`docs/decisions/DECISION_REGISTER.md`](../../decisions/DECISION_REGISTER.md) | Login, recovery, password, Admin/Customer sessions, abuse protection, MFA, support deferral, security events, and isolated replay policy |
| [`docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`](../../decisions/architecture/ADR-001-mongodb-transaction-capability.md) | Transaction-required mutation boundary |
| [`docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`](../../decisions/architecture/ADR-002-production-file-storage-architecture.md) | Provider-neutral private production storage boundary |
| [`docs/decisions/architecture/ADR-005-backend-remediation-runtime-policy.md`](../../decisions/architecture/ADR-005-backend-remediation-runtime-policy.md) | Bounded remediation and inactive production/provider capabilities |
| [`docs/runbooks/AUTH_RECOVERY_RUNBOOK.md`](../../runbooks/AUTH_RECOVERY_RUNBOOK.md), [`AUTH_SESSION_RUNBOOK.md`](../../runbooks/AUTH_SESSION_RUNBOOK.md), and [`IDENTITY_RBAC_AUDIT_RUNBOOK.md`](../../runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md) | Operational evidence and verification boundaries |
| [`docs/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md`](../../runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md) | Credential-incident history-rewrite closure procedure; no execution is authorized here |
<!-- markdownlint-enable MD013 -->

## 4. Finding reconciliation

The severity values below are inherited from the historical audit for
traceability. A source-aligned disposition is not a production closure unless
the required dynamic, operational, and environment evidence is also present.

<!-- markdownlint-disable MD013 -->
<!-- Each finding remains in one comparable row. -->
| ID | Historical severity | Current repository evidence | Candidate disposition | Remaining evidence / owner |
| --- | --- | --- | --- | --- |
| SEC-001 | P0 | The historical credential incident and NIV-001 introducing commit are not independently evidenced in this checkout. The current runbook still records verification as pending. | `requires_revalidation` — open | Credential incident owner plus independent rewrite verifier: redacted revocation/rotation record, full-history rewrite, remote/ref and old-clone purge/support evidence, and a final secret scan. Do not run the rewrite from this task. |
| SEC-002 | P1 | Admin auth now uses opaque Mongo sessions, `__Host-` Secure/HttpOnly cookies, CSRF/origin checks, rotation, replay-family revocation, server logout, and eligibility checks. Hermetic session tests pass; real replica-set session integration is opt-in and was skipped. | `source_aligned_environment_gate` | Backend/security owner and deployment owner: staging-like replica-set transaction evidence, browser cookie/proxy/TLS capture, logout/replay evidence, and operational revocation/cleanup proof. |
| SEC-003 | P1 | No TOTP enrollment/challenge, hashed recovery-code lifecycle, or step-up MFA implementation was found for internal roles. The canonical direction requires MFA. | `open` | Security/product owner must approve the implementation packet, factor parameters, recovery ownership, key handling, and rollout gate before source work. |
| SEC-004 | P1 | Recovery uses generic responses, active-account eligibility, hashed single-use 30-minute tokens, atomic claiming, sibling/session revocation, a dedicated delivery adapter, and safe configured origins. Unit coverage passes; real transaction and provider delivery evidence is absent. | `source_aligned_dynamic_pending` | Backend/security and operations: replica-set atomicity/concurrency evidence, configured delivery-provider failure behavior, public-origin capture, notification privacy, and recovery support procedure. |
| SEC-005 | P1 | Password policy enforces 15–128 Unicode code points and a 512-byte cap, blocks known terms, avoids truncation, supports bcrypt verification with Argon2id migration gating, and recovery completion is transaction-guarded. Hermetic coverage passes; real transactions and production Argon2/blocklist evidence are absent. | `source_aligned_dynamic_pending` | Backend/security owner: replica-set completion/replay test, Argon2 work-factor benchmark, blocklist source/operation, migration rollback evidence, and production configuration review. |
| SEC-006 | P1 | Admin login uses a Mongo-backed HMAC-derived account/IP limiter with 5/20 per 15 minutes and `Retry-After`. Recovery still uses a separate 3-per-900-second public limiter rather than the canonical 60-second resend cooldown; exact concurrent budget behavior and trusted-proxy policy are not proven. | `partial_open` | Backend/security owner: reconcile endpoint contracts, prove atomic distributed budgets under concurrency, document trusted proxy/client-IP policy, outage behavior, retention, and privacy ownership. |
| SEC-007 | P1 | Session authentication rejects disabled, unapproved/access-review, invalid-status, and token-version-ineligible identities; Admin authorization also checks approved state and `admin.access`. Hermetic identity/session tests pass; real session integration is skipped. | `source_aligned_dynamic_pending` | Backend/security owner: replica-set session/role-negative evidence and deployment capture across all protected handlers and queries. |
| SEC-008 | P1 | Active file records are owner/domain scoped; traversal, size/signature, deleted/quarantined denial, and streaming tests pass. Production storage is still inactive and provider-neutral; malware scanning/quarantine, retention, quota, backup/restore, and all-domain linkage are not activated or proven. | `partial_open` | Storage/security/operations owner: approve the private storage adapter class and malware/quarantine/retention/quota/backup contract, then produce staging evidence. No provider is selected here. |
| SEC-009 | P1 | Customer legacy-order projection now uses an explicit safe allowlist and excludes internal notes, storage paths, cost/margin/supplier/profit, and other internal fields; legacy history is read-only. Source tests cover the projection and route boundaries. | `source_aligned_dynamic_pending` | Backend/privacy owner: direct customer-response contract test for every legacy route, representative historical fixtures, and production data review/retention procedure. |
| SEC-010 | P2 | A newer strict authentication-event writer exists, but the legacy identity-governance writer still accepts/stores `actor_email` and free-text `reason` on identity routes. | `open` | Backend/privacy owner: route-by-route event inventory and approved migration to the strict redacted schema; verify analyst access and retention. |
| SEC-011 | P1 | CORS, cookie attributes, CSRF/origin checks, and file/media response protections are explicit in source. No global HSTS/CSP/frame/referrer/Permissions/COOP policy is proven; deployment headers remain a draft and staging/proxy/TLS evidence is absent. | `environment_blocked` — open | Deployment/security owner: exact host/CDN header policy, TLS/proxy trust, cookie capture, and staging verification. Do not activate a provider or deploy from this packet. |
| SEC-012 | P2 | Current frontend package-lock audit still reports 36 advisories (18 high, 6 moderate, 12 low, 0 critical); a nested PostCSS finding remains and backend `pip_audit` is unavailable. The limited React Router RSC advisory remains separately accepted by repository policy. | `requires_revalidation` — open | Dependency/security owner: produce complete backend/frontend audit evidence, disposition each advisory, and record a bounded exception or upgrade plan. No dependency change is made here. |
| SEC-013 | P1 | Startup seeding inserts an Admin only when absent and raises on invalid existing identity; it does not overwrite an existing password. Identity-foundation tests verify the hash remains unchanged after an environment-password change. | `source_test_aligned` — implementation evidence present | Deployment owner still needs startup/readiness evidence in a staging-like environment and a documented recovery path for invalid initial configuration. This does not close the general production gate. |
<!-- markdownlint-enable MD013 -->

## 5. Current verification evidence

### 5.1 Hermetic backend checks

Executed from the Layer 06 worktree with cache writes disabled and a single
worker (the Windows worker limitation is avoided without touching the product):

<!-- markdownlint-disable MD013 -->
```text
python -B -m pytest -p no:cacheprovider -n 0 tests/test_auth_recovery.py tests/test_auth_recovery_migration.py tests/test_auth_password.py tests/test_auth_session.py tests/test_auth_security_events.py tests/test_audit.py tests/test_storage.py tests/test_storage_routes.py tests/test_retail_order_routes.py tests/test_identity_foundation.py tests/test_identity_access_migration.py
213 passed, 2 skipped in 9.59s
```
<!-- markdownlint-enable MD013 -->

The skipped tests are opt-in real-transaction checks. The explicit integration
selection produced `3 skipped` because
`NIUVA_RUN_REAL_TRANSACTION_TESTS=1` and `MONGO_TRANSACTION_TEST_URL` were not
provided. No database was touched.

The evidence supports source/test alignment only. It does not prove a
replica-set, production key, delivery provider, storage adapter, proxy/TLS,
header, backup, malware, alert, or rollback environment.

### 5.2 Dependency and tool limits

`npm audit --json --package-lock-only` was run read-only in `frontend` and
reported 36 advisories: 18 high, 6 moderate, 12 low, and 0 critical. The
current graph still includes the reported nested PostCSS range. `pip_audit` and
`gitleaks` were not available in the environment; no replacement tool was
installed and no secret value was printed.

### 5.3 Documentation drift noted, not repaired

`doc/PRODUCTION_DEPLOYMENT.md` still describes the rate limiter as in-memory,
while the current Admin login implementation uses the approved bounded Mongo
limiter. This is a candidate runbook-reconciliation item; it is not changed in
this packet because runbooks are not canonical product authority and no
additional documentation publication was authorized.

## 6. Candidate gate and recommended order

**Gate result: NOT READY for production, activation, or moderated release
validation.** The candidate reconciliation is reviewable, but it does not
promote or close any finding.

Recommended order after review:

1. Assign the credential-incident owner and independently close the NIV-001
   evidence gate without executing it from this branch.
2. Decide and packet the mandatory internal MFA contract.
3. Reconcile abuse-protection endpoint/cooldown semantics and prove the
   distributed limiter under a real replica set.
4. Approve the provider-neutral storage/malware/quarantine and recovery
   operations contract.
5. Replace identity-event paths that still carry direct contact/free-text
   data.
6. Produce staging-like TLS, proxy, cookie, global-header, email, key,
   backup/restore, and readiness evidence.
7. Complete dependency audit/disposition, then continue with Layer 03 using
   the resolved security boundaries as inputs.

Any source remediation, migration execution, provider selection, environment
change, canonical promotion, commit, push, or pull request requires separate
explicit authorization.

## 7. Review questions

Before publication, the Project Owner should confirm:

- whether the proposed disposition vocabulary is acceptable for the readiness
  trackers;
- who owns the credential incident, MFA, limiter, storage, identity-event,
  deployment, and dependency gates; and
- whether the runbook rate-limiter drift should be repaired in a separate,
  narrow documentation change.
