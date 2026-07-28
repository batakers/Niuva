# Layer 06 — Security, Authentication, Authorization, and Privacy

Status: Context Only — Audit Evidence and Progress Tracker — Not Implementation Authority

## 1. Document status

- Classification: Context Only
- Finding prefix: `SEC`
- Implementation authority: none
- Audit scope: repository/static security review with safe local verification
- No remediation, credential operation, migration, provider activation, commit, or push was performed.

## 2. Audit state

| Field | Value |
| --- | --- |
| Audit status | `complete` for repository/static scope; production controls explicitly `environment_blocked` |
| Audit completion | 92% |
| Readiness score | 25 / 100 |
| Confidence | 86% |
| Recorded findings | 1 P0, 10 P1, 2 P2, 0 P3 |
| Release posture | Blocked by open P0/P1 findings and unverified production controls |

The score measures observed control readiness, not production authorization. The
open credential incident, password-only Admin access, bearer-token session
handling, recovery weaknesses, abuse-control gaps, file boundary gaps, and
customer-data exposure prevent a release-candidate recommendation.

## 3. Authority and scope

Reviewed in canonical order: `docs/NIUVA_MASTER_SPEC.md`,
`docs/context/DOCUMENT_REGISTER.md`, `docs/decisions/DECISION_REGISTER.md`,
DEC-ACCESS-001/002, DEC-AUTH-001 through DEC-AUTH-009, ADR-001 through
ADR-003, `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md`,
`doc/PRODUCTION_DEPLOYMENT.md`, the audit methodology/baseline, and the
historical backend tracker. The review covers:

- login, generic failures, disabled/review-blocked issuance, legacy compatibility;
- password policy/hash, recovery tokens, delivery, atomicity, and revocation;
- Admin session transport, CSRF/origin, lifetime, rotation, logout, and MFA;
- limiter topology, abuse resistance, identifier privacy, and security events;
- granular roles, separation of duties, handler/query enforcement, ownership;
- customer-safe projections, internal notes, contact data, files, CORS/headers;
- credential history and dependency-security evidence.

Excluded by instruction: credential inspection/use/rotation, destructive
exploitation, source/test/config/dependency edits, production requests,
provider selection, migration rehearsal, rollout, and go-live.

## 4. Baseline and evidence

- Baseline/HEAD: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
- Branch: `feat/marketing-redesign-dec-ux-002`
- Audit timestamp: 2026-07-28 WIB
- Existing unrelated work was preserved: one formatting-only tracked Markdown
  change and untracked `.coverage`.
- `107 passed, 4 warnings`:
  `backend/tests/test_auth_security.py`,
  `test_reset_password.py`, `test_permissions.py`,
  `test_identity_foundation.py`, `test_storage.py`,
  `test_storage_routes.py`, and `test_b2b_customer_projection.py`, single
  process with cache provider disabled.
- Frontend targeted Jest: 3 suites, 16 tests passed.
- Credential-hygiene unittest: 3 tests passed.
- Default pytest worker mode could not start on Windows (`WinError 6`); this is
  an execution-environment limitation, not a product pass/fail result.
- `npm audit --json` reported 36 frontend advisories (18 high, 6 moderate,
  12 low, 0 critical). `pip_audit` is unavailable, so backend dependency
  coverage is unverified. `gitleaks` is unavailable.
- A redacted current-tree scan produced 19 fixture/documentation
  `credentialed_mongo_uri` detector hits only; no private-key, JWT-secret, or
  provider-key shape was reported. Values were not printed. Full history could
  not be scanned locally.
- The NIV-001 introducing commit is unavailable in this checkout, so history
  rewrite/revocation closure cannot be independently revalidated.

## 5. Threat-surface matrix

| Surface / actor | Asset and failure path | Existing control | Gap / residual risk | Severity |
| --- | --- | --- | --- | --- |
| Public/customer login and Admin login / unknown attacker | Credentials, account availability; repeated guesses reach `/auth/login` or `/auth/admin/login` | Generic 401 contract, disabled-account checks, backend permission gate | No distributed limiter; Admin has no MFA; 7-day bearer token | P1 |
| Password recovery / attacker or blocked account | Reset capability and token; `/auth/forgot-password` → `/auth/reset-password` | Generic body, hashed token, 30-minute expiry, one active token intent | Raw token in URL/notification, no eligibility check, non-atomic consume/reset | P1 |
| Admin browser session / XSS, extension, stolen workstation | JWT and privileged API access | Token-version check, Authorization header accepted | Token in `localStorage`, 7-day lifetime, cookie fallback, client-only logout, no MFA | P1 |
| File upload/download / customer or internal user | Design/payment files and private documents | Path traversal checks, Authorization header, production local storage disabled | Path substring ownership, global `files.read`, no DB owner/deleted check, extension-only validation, whole-file reads | P1 |
| Customer order read / customer or staff overreach | Order history, payment/status data, internal notes | Owner-or-`orders.read` gate | Raw legacy order/status history returned; notes are not customer-safe | P1 |
| Identity governance / internal operator | Roles, status, audit trail, contact metadata | Granular resolver and super-admin gate | Identity event stores actor email and free-text reason contrary to exact envelope | P2 |
| Contact/inquiry / spammer | Lead PII and mail workload | HTML escaping and process-local contact limiter | Restart/worker bypass; forwarded IP trust is configurable and not proven | P2 |
| Dependency/build pipeline / malicious contributor or source-map input | Build host and generated bundle | Lockfiles and package audit tooling | Affected PostCSS versions; backend audit tool unavailable | P2 |
| Credential history / public reader or old clone | Historical credential incident | NIV-001 runbook and no credential use here | Runbook remains verification pending; closure/revocation evidence absent | P0 |

## 6. Authorization matrix

| Surface | Intended actor / permission | Handler and query evidence | Field boundary | Result |
| --- | --- | --- | --- | --- |
| `/api/auth/admin/login` | Approved internal role; `admin.access` | `backend/server.py:453-461`, `backend/permissions.py` | `safe_user` excludes password hash | Partial: MFA/session controls absent |
| Staff invitations, role/status changes | `super_admin`; `roles.manage` / `users.read` | `backend/identity_routes.py:92-145`, `:170-252` | Password hash excluded; identity event emitted | Partial: policy and event-envelope gaps |
| Admin orders and exports | Internal roles with `orders.read`/export permission | `backend/server.py:565-609`, `:901-943` | Admin serializer differs from customer view | Partial: global operational scope needs owner decision |
| `/api/orders/{id}` | Owner or internal `orders.read` | `backend/server.py:620-627` | Raw legacy order returned | Violation: internal status notes can cross customer boundary |
| `/api/files/{path}` | Owner or narrowly scoped project/order role | `backend/server.py:818-846` | Blob returned with `nosniff`/CSP | Violation: path substring/global role and no DB ownership/deleted check |
| B2B admin project/quote surfaces | Internal permission-gated roles | B2B routes/services use `require_permission`; customer projections are allowlists | Customer projections omit cost/margin/supplier/internal notes | Partial: admin query scope remains broad |
| `/api/admin/settings` | `settings.write`, effectively super-admin | `backend/server.py:945-1001` | Admin-only response | Partial: arbitrary URL-like settings need validation |
| `/api/admin/notifications` | `notifications.write` | `backend/server.py:1148-1189` | Email body HTML-escaped | Partial: raw message is retained in notification log |
| Recovery endpoints | Public, generic response | `backend/server.py:480-551` | Token hash stored | Violation: eligibility, delivery, transaction, and policy gaps |

UI permission maps and protected routes are not trusted authorization. Backend
handler and data-query checks remain the security boundary.

## 7. Current positive controls

- Generic login failures and disabled-account behavior are covered by the
  passing backend auth tests; legacy customer compatibility remains explicit.
- `require_permission` and the granular resolver fail closed for unknown,
  inactive, legacy-internal, and `access_review_required` role states.
- Legacy manual payment-transfer mutation endpoints return 410
  (`legacy_manual_transfer_disabled`) and targeted tests pass.
- Local storage is development/demo/test-only by default; path traversal is
  rejected and file downloads require an Authorization header.
- B2B customer projections use allowlists excluding cost, margin, supplier,
  profit, and internal notes; projection tests pass.
- CORS rejects wildcard origins when credentials are enabled.
- Generic audit redaction covers password/token/cost-like keys, although the
  identity-governance envelope has a separate privacy defect.

## 8. Finding register

### SEC-001 — Historical credential incident has no verified closure

- Severity: `P0`
- Status: `requires_revalidation`
- Confidence: 90%
- Category: secret management / incident response
- Actor: public repository reader, old clone holder, or CI/log consumer
- Asset: historical credential and any account/data reachable with it
- Attack/failure path: the credential remains usable in reachable history or
  retained clones because rotation, revocation, rewrite, purge, and support
  closure are not evidenced.
- Expected behavior: NIV-001 is `Verified` or explicitly accepted risk only
  after redacted rotation/revocation and approved history/support evidence.
- Actual behavior: runbook still records `Implemented, verification pending`.
- Evidence: `docs/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md:13-25`,
  `:1256-1282`; `docs/context/BACKEND_AUDIT_TRACKER_2026-07-24.md:289-309`.
- Safe reproduction/verification: inspect the runbook status and run
  `git cat-file -e <introducing-commit>^{commit}` without printing credential
  material; this checkout reports the introducing object unavailable.
- Impact: account compromise, unauthorized data access, and incident
  non-closure.
- Root cause/probable cause: gated operational closure is not evidenced in this
  repository and cannot be inferred from implementation status.
- Mitigation: keep the incident gate open; do not use or expose the value.
- Remediation: incident owner must complete the approved rotation/revocation,
  history rewrite, hosting purge, clone-risk assessment, and support closure.
- Acceptance criteria: redacted evidence for every gate, independent
  verification, and runbook status changed through its approved process.
- Dependencies: credential owner, repository host administrator, incident owner.
- Human decision required: incident owner and credential owner must authorize
  closure or documented accepted risk.
- First observed SHA: `7505b48` (historical tracker tested snapshot)
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
- Resolution evidence: none.

### SEC-002 — Admin session uses long-lived bearer storage without server logout

- Severity: `P1`
- Status: `decision_resolved_implementation_open`
- Confidence: 100%
- Category: authentication / session management
- Actor: XSS, malicious extension, or stolen workstation
- Asset: Admin JWT and privileged API actions
- Attack/failure path: token returned by login is stored in browser
  `localStorage`, remains valid for seven days, and client logout only deletes
  the local copy; a stolen token is reusable until expiry/token-version change.
- Expected behavior: secure `__Host-` HttpOnly cookie, Strict SameSite,
  CSRF/origin checks, bounded idle/absolute lifetime, rotation, and server-side
  revocation per DEC-AUTH-005.
- Actual behavior: `backend/server.py:156-165,199-208`;
  `frontend/src/lib/api.js:6-26`; `frontend/src/context/AuthContext.jsx:41-49`.
- Safe reproduction: static inspection; no token was created or used.
- Impact: privileged session theft and weak incident containment.
- Root cause: legacy bearer-token transport remains the active contract.
- Mitigation: keep Admin access out of production readiness until the approved
  session contract is implemented and tested.
- Remediation: implement the approved cookie/CSRF/session-revocation design.
- Acceptance criteria: XSS/localStorage negative test, logout invalidation,
  idle/absolute expiry, rotation, CSRF/origin, and cross-role revocation tests.
- Dependencies: DEC-AUTH-005 implementation packet and production cookie origin.
- Human decision required: security/identity owner approves rollout and cookie
  domain/origin.
- First observed SHA: `138b0c57`
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`

### SEC-003 — Admin authentication is password-only; mandatory MFA is absent

- Severity: `P1`
- Status: `decision_resolved_implementation_open`
- Confidence: 100%
- Category: authentication / MFA
- Actor: attacker with a phished, reused, or guessed internal password
- Asset: internal administrative capabilities
- Attack/failure path: `/auth/admin/login` authenticates a password and
  immediately issues a token; no TOTP, recovery-code, or step-up challenge is
  present.
- Evidence: `backend/server.py:453-461`;
  `frontend/src/pages/admin/AdminLogin.jsx`; DEC-AUTH-007.
- Safe reproduction: route/source inspection and existing auth tests; no login
  with real credentials.
- Impact: password compromise directly yields Admin access.
- Root cause: the approved mandatory-internal-MFA direction is not implemented.
- Mitigation: do not enable production Admin access on password-only evidence.
- Remediation: implement TOTP first, hashed recovery codes, and step-up for
  sensitive actions.
- Acceptance criteria: enrollment/recovery/revocation, replay/clock-skew,
  step-up, and “password alone cannot issue Admin session” tests.
- Dependencies: MFA owner, secret storage, session design.
- Human decision required: security owner selects enrollment/recovery
  operations within DEC-AUTH-007.
- First observed SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`

### SEC-004 — Password recovery can leak raw tokens and ignores eligibility

- Severity: `P1`
- Status: `decision_resolved_implementation_open`
- Confidence: 100%
- Category: recovery / privacy / origin security
- Actor: notification-reader, mail/log/provider compromise, or blocked-account
  requester
- Asset: password-reset capability and reset token
- Attack/failure path: `/auth/forgot-password` creates a raw token in the reset
  URL, passes it to the general notification store/emailer, uses a frontend
  public URL without a backend HTTPS allowlist, and does not check active
  eligibility before token creation.
- Evidence: `backend/server.py:480-523`;
  `backend/emailer.py:20-45`.
- Safe reproduction: static inspection; do not call the endpoint or print a
  token.
- Impact: token exposure through notification/log/provider surfaces and reset
  attempts for disabled/review-blocked identities.
- Root cause: recovery delivery and eligibility contract is only partially
  implemented.
- Mitigation: keep recovery behind the generic response and do not treat email
  delivery as a verified secure boundary.
- Remediation: deliver raw token only through an approved dedicated channel,
  use backend-owned allowlisted HTTPS origin, enforce active eligibility, and
  prevent token persistence in general logs/notifications.
- Acceptance criteria: raw-token absence tests for DB/log/notification,
  generic blocked responses, safe-origin tests, and delivery redaction.
- Dependencies: DEC-AUTH-003, mail owner, origin owner.
- Human decision required: recovery-channel and public-origin owner.
- First observed SHA: `7d754bc9`
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`

### SEC-005 — Reset is non-atomic and password policy/hash do not match authority

- Severity: `P1`
- Status: `decision_resolved_implementation_open`
- Confidence: 100%
- Category: recovery integrity / password security
- Actor: concurrent requester, replaying token holder, or weak-password user
- Asset: account password, token single-use guarantee, session revocation
- Attack/failure path: reset reads an unused token, updates the user, then
  separately marks tokens used; concurrent requests can both pass the read or
  leave partial state. Password/reset and invitation validation allow lengths
  below the approved 15–128 Unicode codepoint policy, and current writes are
  bcrypt rather than the approved Argon2id path.
- Evidence: `backend/server.py:139-153,244-246,525-551`;
  `backend/identity_routes.py:34-35,170-178`; DEC-AUTH-003/004.
- Safe reproduction: code review plus an isolated replica-set concurrency test;
  no reset token was generated here.
- Impact: replay/race-driven password changes, inconsistent revocation, and
  weaker password resistance.
- Root cause: transaction and password-policy migration remain incomplete.
- Mitigation: do not enable the Argon2 write flag or run migration rehearsal.
- Remediation: use a transaction-required atomic consume/reset/revoke flow,
  enforce the exact policy, and migrate new writes to Argon2id with legacy
  verification only.
- Acceptance criteria: real Mongo replica-set race test has one success,
  transaction-unavailable fails closed, password policy edge cases pass, and
  token-version/session revocation is verified.
- Dependencies: ADR-001, DEC-AUTH-003/004, disposable replica set.
- Human decision required: security/identity owner authorizes migration and
  operational enablement separately.
- First observed SHA: `7d754bc9`
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`

### SEC-006 — Authentication abuse controls are process-local and incomplete

- Severity: `P1`
- Status: `decision_resolved_implementation_open`
- Confidence: 100%
- Category: abuse resistance / rate limiting / privacy
- Actor: distributed password sprayer, reset/contact spammer, or proxy-spoofing
  client
- Asset: login availability, account enumeration resistance, email workload
- Attack/failure path: `_rate_buckets` is process-local; login has no limiter,
  recovery keys use raw lower-cased email, and the first
  `X-Forwarded-For` value may be trusted when configured.
- Evidence: `backend/server.py:385-402,447-486,850-869`;
  DEC-AUTH-002/006.
- Safe reproduction: static inspection and unit tests only; no live attack.
- Impact: worker/restart bypass, brute-force exposure, identifier leakage,
  mail abuse, and unreliable cooldowns.
- Root cause: distributed provider-neutral limiter topology and thresholds are
  deferred.
- Mitigation: keep limits conservative and treat process-local limits as
  non-production evidence.
- Remediation: shared atomic limiter with HMAC identifiers, account/IP
  dimensions, 429/Retry-After, cooldown, trusted-proxy handling, and fail-safe
  outage behavior.
- Acceptance criteria: multi-worker/restart/concurrency tests, no raw email
  keys in limiter storage/logs, and configured-proxy negative tests.
- Dependencies: DEC-AUTH-002/006 and platform limiter owner.
- Human decision required: topology, thresholds, outage mode, proxy trust, and
  retention owner.
- First observed SHA: `7d754bc9`
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`

### SEC-007 — Access-review state is not rejected by token validation

- Severity: `P1`
- Status: `decision_resolved_implementation_open`
- Confidence: 95%
- Category: authorization / session revocation
- Actor: user whose access is placed under review after token issuance
- Asset: active session and protected customer/internal data
- Attack/failure path: `get_user_from_token` checks disabled status and
  `token_version` but does not reject `access_review_required`; a previously
  issued token can continue through `/auth/me` and protected routes.
- Evidence: `backend/server.py:168-196`; `backend/permissions.py` resolver;
  DEC-AUTH-005 and identity runbook.
- Safe reproduction: static inspection; a real token was not created or used.
- Impact: stale access survives an access-review block.
- Root cause: issuance-time and request-time access-state checks are
  inconsistent.
- Mitigation: manual review/revocation remains required; no rollout claim.
- Remediation: reject review-blocked state on every token validation and
  revoke existing sessions when state changes.
- Acceptance criteria: token issued before state change is rejected, generic
  response is preserved, and role/status/access-review transitions increment
  the revocation version transactionally.
- Dependencies: DEC-AUTH-001/005 and identity governance migration.
- Human decision required: identity owner confirms review-state semantics.
- First observed SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`

### SEC-008 — File authorization and content validation are not object-scoped

- Severity: `P1`
- Status: `partial`
- Confidence: 95%
- Category: authorization / privacy / file security
- Actor: internal role with broad `files.read`, customer guessing another path,
  or attacker uploading unsafe content
- Asset: private design/payment files and deleted objects
- Attack/failure path: download authorization uses a path substring containing
  the user id or any global `files.read` role; it does not consult DB-backed
  owner/order/project scope or a deleted flag. Upload/storage validation is
  extension-only, reads the whole file before size enforcement, and has no
  signature/malware/quarantine boundary.
- Evidence: `backend/server.py:818-846`;
  `backend/storage.py`; `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`;
  historical BA-008.
- Safe reproduction: static review and existing route tests; no cross-user
  file was accessed or uploaded.
- Impact: cross-tenant disclosure, stale deleted-file access, resource
  exhaustion, and unsafe content delivery.
- Root cause: storage provider/ownership design remains deferred and legacy
  path authorization is still active.
- Mitigation: production local storage is disabled by default; keep uploads
  disabled until the ADR gate is satisfied.
- Remediation: DB ownership and domain scope, deleted/retention checks,
  streaming size limits, MIME/signature validation, quarantine/malware scan,
  and short-lived authorized URLs.
- Acceptance criteria: cross-owner/role negative matrix, deleted-file denial,
  signature/size/quarantine tests, and provider-neutral private-storage
  evidence.
- Dependencies: ADR-002, storage owner, retention/quota/backup decisions.
- Human decision required: provider-neutral storage and operational controls.
- First observed SHA: `138b0c57`
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`

### SEC-009 — Customer order responses can include internal status notes

- Severity: `P1`
- Status: `open`
- Confidence: 100%
- Category: privacy / customer-data boundary
- Actor: authenticated customer viewing their own order
- Asset: internal staff notes and operational history
- Attack/failure path: staff `note` is appended to `status_history`, then
  `get_order` returns the raw classified legacy order to the owner without a
  customer-safe field projection.
- Evidence: `backend/server.py:620-627,767-788`;
  `docs/NIUVA_MASTER_SPEC.md:347-360`.
- Safe reproduction: seed an order with a status-history note and request it as
  the owner in an isolated test; no production data was touched.
- Impact: disclosure of internal notes and operational context to customers.
- Root cause: owner authorization is present but response projection is not.
- Mitigation: do not place internal notes in customer-visible status history.
- Remediation: separate internal/customer timelines and explicit customer
  allowlists for every order response.
- Acceptance criteria: customer response contract excludes notes, cost, margin,
  supplier, profit, and internal metadata; staff response remains permissioned.
- Dependencies: Layer 03 data contract and approved order-lifecycle decision.
- Human decision required: product/security owner confirms customer timeline.
- First observed SHA: `138b0c57`
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`

### SEC-010 — Identity-governance audit events exceed the privacy envelope

- Severity: `P2`
- Status: `open`
- Confidence: 100%
- Category: audit privacy / data minimization
- Actor: authorized audit reader or log operator
- Asset: staff contact metadata and free-text operational context
- Attack/failure path: `append_identity_governance_event` stores `actor_email`
  and free-text `reason`, while the identity runbook requires an exact
  envelope excluding actor email, contact data, and free text.
- Evidence: `backend/audit.py:119-155`;
  `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md` identity-event contract.
- Safe reproduction: inspect the event builder and its invitation caller; no
  event containing personal data was created.
- Impact: unnecessary PII retention, inconsistent deletion/retention handling,
  and broader insider exposure.
- Root cause: generic governance event schema was reused instead of the
  dedicated allowlist.
- Mitigation: restrict access to existing audit data and avoid free-text
  reasons.
- Remediation: enforce the exact identity envelope and dedicated redacted auth
  event path.
- Acceptance criteria: schema test rejects actor email/free text and sensitive
  fields; retention owner and store are documented.
- Dependencies: identity runbook and audit store owner.
- Human decision required: audit/privacy owner confirms retention and deletion.
- First observed SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`

### SEC-011 — Production security headers and runtime topology are unverified

- Severity: `P1`
- Status: `environment_blocked`
- Confidence: 85%
- Category: deployment security / configuration
- Actor: network attacker or misconfigured proxy
- Asset: browser security policy, cross-origin boundary, and transport secrecy
- Attack/failure path: source configures exact-origin CORS, but no global
  security-header middleware is present; deployment headers are only a draft
  runbook contract and production/staging proxy behavior was not accessible.
- Evidence: `backend/server.py:1328-1342`;
  `doc/PRODUCTION_DEPLOYMENT.md:43-58`.
- Safe reproduction: static source/runbook comparison only; no production
  request or header probe was made.
- Impact: HSTS/CSP/frame/referrer protections may be absent or inconsistent.
- Root cause: runtime owner/topology evidence is outside this checkout.
- Mitigation: do not treat local CORS as production verification.
- Remediation: obtain staging/production header, TLS, trusted-proxy, CORS,
  cookie, and CSP evidence under the deployment runbook.
- Acceptance criteria: reproducible HTTPS response capture from approved
  environment and explicit owner sign-off.
- Dependencies: deployment/platform owner and approved environment.
- Human decision required: production security owner decides header/CSP policy.
- First observed SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`

### SEC-012 — Frontend dependency audit reports affected PostCSS versions

- Severity: `P2`
- Status: `requires_revalidation`
- Confidence: 100% for the current npm audit result
- Category: dependency/build security
- Actor: malicious build input or contributor controlling CSS/source-map input
- Asset: build host and generated frontend artifact
- Attack/failure path: frontend uses PostCSS `8.5.10`; published advisories
  cover arbitrary file read through attacker-controlled `sourceMappingURL` and
  path traversal/source-map disclosure in affected ranges.
- Evidence: `frontend/package-lock.json`/`frontend/package.json` current
  dependency resolution; `npm audit --json` on 2026-07-28; advisories:
  [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q)
  and [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849).
- Safe reproduction: run `npm audit --json` in `frontend`; no exploit input
  was supplied and no package was changed. React Router's separate high
  advisory was reviewed as RSC-specific and not shown as an applicable
  finding for this BrowserRouter/Routes app.
- Impact: build-time file disclosure or artifact compromise if attacker
  controls the relevant input/build context.
- Root cause: dependency versions are below current patched PostCSS releases.
- Mitigation: restrict untrusted build inputs and keep audit result visible.
- Remediation: dependency owner must evaluate patched versions, lockfile
  compatibility, and transitive React Scripts/CRACO advisories.
- Acceptance criteria: reproducible audit with disposition for all 36
  advisories, patched/accepted-risk evidence, and build/test verification.
- Dependencies: Layer 10 package-owner review; no upgrade was authorized here.
- Human decision required: dependency owner approves upgrade or documented
  risk acceptance.
- First observed SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`

### SEC-013 — Startup can overwrite an existing Admin password from environment

- Severity: `P1`
- Status: `open`
- Confidence: 100%
- Category: credential lifecycle / authentication
- Actor: operator or attacker who can alter startup environment/configuration
- Asset: existing Admin credential and account continuity
- Attack/failure path: startup compares `ADMIN_PASSWORD` with the stored
  password and rewrites the existing Admin hash when they differ, turning
  configuration drift or an injected environment value into an implicit
  credential reset.
- Evidence: `backend/server.py:1419-1432`.
- Safe reproduction: static inspection only; no environment or password was
  changed.
- Impact: unexpected account takeover/lockout, loss of recovery auditability,
  and secret-rotation bypass.
- Root cause: bootstrap seeding is coupled to an existing account's password.
- Mitigation: keep startup seed credentials isolated from existing identities.
- Remediation: remove implicit overwrite; use an explicit, audited recovery or
  rotation operation with policy and revocation.
- Acceptance criteria: restart with changed seed value does not alter an
  existing account; explicit recovery emits a redacted event and revokes
  sessions.
- Dependencies: identity bootstrap owner and DEC-AUTH-004/005.
- Human decision required: identity owner approves the supported bootstrap and
  recovery lifecycle.
- First observed SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
- Last verified SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`

## 9. Historical finding reconciliation

| Historical ID | Current status | Evidence-based treatment |
| --- | --- | --- |
| BA-002 granular roles | `partially_resolved` | Granular permissions/resolver exist; migration and rollout gates remain open. |
| BA-003 broad operations access | `resolved` for the historical role-label condition; current file/query scope is covered by SEC-008/009 | Old label condition is no longer reproduced, but it does not prove domain scope. |
| BA-004 framework/security upgrades | `partially_resolved` | Versions changed; current npm advisories and unavailable backend audit require revalidation. |
| BA-005 / NIV-001 credential incident | `requires_revalidation` | Runbook remains verification pending; no closure evidence or secret value is shown. |
| BA-006 manual transfer | `partially_resolved` | Mutation endpoints return 410; old read-only/decision boundaries remain visible. |
| BA-008 file access | `partially_resolved` | Traversal and header controls exist; ownership, deletion, validation, and malware gaps remain. |
| BA-010 auth/input hardening | `partially_resolved` | Generic auth behavior improved; MFA, distributed limiting, session, recovery, and password-policy gaps remain. |

Historical scores and statuses were not inherited as current proof.

## 10. Unverified controls and blockers

- Production/staging TLS, HSTS/CSP/frame/referrer headers, exact CORS,
  trusted-proxy behavior, cookie attributes, email provider behavior, shared
  limiter, MFA secret storage, audit store/retention, and private object
  storage were not accessed.
- Backend dependency vulnerability coverage is unverified because
  `pip_audit` is not installed; no installation was performed.
- Full Git-history secret scan and NIV-001 introducing object are unavailable
  locally; no secret value is reported.
- Real replica-set recovery concurrency and production-like role/query
  negative tests remain required. Fake/in-memory tests are not accepted as
  transaction proof.
- The default pytest worker failure (`WinError 6`) requires a CI/runtime
  owner if parallel execution is a release gate.

## 11. Human decisions and safe remediation order

1. Incident owner/credential owner: close or explicitly accept NIV-001 risk.
2. Identity/security owner: authorize session, MFA, recovery, password-policy,
   limiter, and bootstrap lifecycle implementation.
3. Storage/data owner: approve DB ownership, retention, validation, quarantine,
   and private-provider boundary.
4. Deployment/platform owner: provide approved staging evidence for headers,
   TLS, proxy, CORS, cookies, email, limiter, and audit storage.
5. Dependency owner: disposition npm and backend audit results.

This audit does not authorize any of those changes, credential operations,
migration rehearsal, provider activation, deployment, or go-live.

## 12. Acceptance gate

No release-candidate recommendation until SEC-001 and all applicable P1
findings are resolved or explicitly accepted by the named owner with evidence;
production controls in SEC-011 are verified; dependency findings are
dispositioned; and negative/concurrency/session/privacy tests pass in an
approved environment.

## 13. Changelog

### 2026-07-28 — Layer 06 completed

- Completed the requested repository/static security, authentication,
  authorization, privacy, and abuse-resistance audit.
- Added threat-surface and authorization matrices, 13 current findings,
  historical BA reconciliation, positive controls, safe verification results,
  and explicit environment blockers.
- No source, test, configuration, dependency, credential, migration, commit,
  push, or production state was changed.
