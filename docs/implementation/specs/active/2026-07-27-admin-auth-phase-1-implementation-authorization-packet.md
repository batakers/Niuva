# Admin Authentication Phase 1 — Implementation Authorization Packet

Status: **Approved Implementation Authorization — G4 Passed Locally — Argon2 Writes Disabled**
Date: 27 July 2026
Decision owner: Project Owner
Technical reviewer: Acting Technical Owner
Approval source: Explicit owner approval of all `AUTH-P1` recommendations on
27 July 2026.
Proposed implementation slice: **Recovery Safety Baseline**

## 1. Authority and Meaning of Approval

Read this packet after:

- `docs/NIUVA_MASTER_SPEC.md`;
- `docs/context/DOCUMENT_REGISTER.md`;
- `docs/decisions/DECISION_REGISTER.md`;
- `docs/decisions/access/DEC-AUTH-001-login-failure-and-legacy-compatibility.md`;
- `docs/decisions/access/DEC-AUTH-002-rate-limit-topology-deferral.md`;
- `docs/decisions/access/DEC-AUTH-003-account-recovery-contract-and-compatibility.md`;
- `docs/decisions/access/DEC-AUTH-004-password-policy-and-hash-migration.md`;
- `docs/decisions/access/DEC-AUTH-005-admin-session-transport-and-remember-me.md`;
- `docs/decisions/access/DEC-AUTH-006-abuse-protection-interface-and-deferral.md`;
- `docs/decisions/access/DEC-AUTH-007-internal-mfa-staged-direction.md`;
- `docs/decisions/access/DEC-AUTH-008-admin-support-channel-deferral.md`;
- `docs/decisions/access/DEC-AUTH-009-authentication-security-event-governance.md`;
- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`.

Approval of every `AUTH-P1-*` item in this packet would authorize only the
listed work subject to the sequential gates in Section 8:

- an isolated Phase 1 branch/worktree created from the reviewed current
  lineage after the Phase 0 documentation is safely checkpointed;
- source and test changes limited to Section 5;
- the dependency and configuration manifest changes explicitly selected here;
- migration code plus apply/rollback testing against a disposable local
  replica-set database; and
- the verification commands in Section 10.

Before Gate G1 benchmark evidence receives an explicit follow-up owner
acceptance, work is limited to isolation, dependency manifest/setup,
benchmark/test harnesses, and documentation. Approval of this packet alone does
not authorize new Argon2 password writes.

It would not authorize a commit, push, pull request, shared-environment data
mutation, provider activation, production rollout, production readiness,
go-live, or any item listed in Section 4.

## 2. Objective and Success Outcome

Phase 1 closes the highest-risk recovery defects without broadening into a
complete authentication-platform rewrite. The successful result is one deep
recovery module and one password module that:

- keep raw reset tokens out of database notifications, logs, events,
  analytics, responses, and browser history;
- issue, validate, and consume reset tokens under the approved eligibility and
  generic-response contract;
- atomically change the password, increment `token_version`, consume the token,
  and invalidate sibling tokens through the existing transaction guard;
- fail closed before mutation when transaction capability is unavailable;
- validate a backend-only reset origin rather than trusting request headers or
  frontend-prefixed environment configuration;
- stop startup from silently rewriting an existing Admin credential;
- introduce Argon2id as the new-hash format while retaining bcrypt
  verification compatibility;
- prepare a non-destructive, dry-run-first token/index migration with backup,
  validation, and rollback; and
- preserve the Admin and supported Customer compatibility routes.

This phase is complete at a reviewable local implementation. Production
activation remains blocked by the operational gates in Section 9.

## 3. Verified Baseline Used for Scoping

The following facts were verified on branch
`feat/marketing-redesign-dec-ux-002` at commit `2d7aff9`, with the approved
Phase 0 documentation still uncommitted in the active worktree:

| Area | Verified implementation evidence | Phase 1 consequence |
| --- | --- | --- |
| Recovery routes | `backend/server.py` owns forgot/reset handlers directly | Move behavior behind one recovery module; keep handlers thin |
| Token delivery | The raw reset URL is passed into generic `emailer.send_email`, which stores `body_html` in `notifications` | Use a dedicated recovery-delivery adapter that never persists the token or token-bearing body |
| Reset mutation | Password update and token invalidation are sequential writes | Route completion through `TransactionMutationGuard`; no fallback |
| Token origin | Reset URL uses `REACT_APP_PUBLIC_SITE_URL` in backend code | Replace it with validated backend-only `PUBLIC_SITE_URL` |
| Password policy | Reset/client creation use minimum 6; invitation uses 8–256; login has no defensive maximum | Centralize creation/reset/invitation validation and expose a public policy projection |
| Hashing | New writes and verification are bcrypt-only | Add Argon2id new writes plus bcrypt compatibility; do not bulk rewrite existing hashes |
| Session invalidation | `token_version` is enforced when reading bearer/cookie tokens | Preserve it and increment atomically during reset |
| Bootstrap | Startup compares `ADMIN_PASSWORD` and rewrites an existing password on mismatch without incrementing session version | Treat the variable as initial-bootstrap input only; never reconcile an existing credential from startup configuration |
| Browser token | `ResetPassword.jsx` reads `?token=` and leaves it in the visible URL during form interaction | Capture once into ephemeral state and immediately replace browser history |
| State routes | Only `/forgot-password` and `/reset-password` exist | Add generic check-email, success, and error routes without role disclosure |
| Recovery tests | `test_reset_password.py` uses an in-memory fake and does not exercise the real transaction guard or concurrency | Add interface tests plus real replica-set transaction coverage |
| Transaction seam | `TransactionMutationGuard` and replica-set CI already exist | Reuse the existing seam and CI topology; do not create a second transaction abstraction |

## 4. Explicitly Out of Scope

Phase 1 must not implement or select:

- Admin secure-cookie migration, refresh, remember-me, CSRF rollout, or removal
  of the current browser bearer-token path;
- MFA enrollment, TOTP parameters, passkeys, recovery codes, or step-up;
- a distributed limiter adapter, proxy trust contract, login thresholds,
  outage behavior, or production limiter topology;
- an Admin-support destination or blocked-internal-account recovery bypass;
- persistent authentication-event storage, alert thresholds, or a general
  Admin audit viewer;
- a new email provider or production email activation;
- customer role migration, permission changes, or access-review bypasses;
- public Homepage, marketing, Admin dashboard, or unrelated customer-portal UI;
- hard deletion of historical token records;
- shared/staging/production migration execution;
- commit, push, pull request, rollout, production readiness, or go-live.

The current process-local recovery limiter remains implementation evidence and
a production blocker. Phase 1 must not present it as distributed or
production-ready.

## 5. Exact Implementation Scope

### 5.1 Deep password module

Add `backend/auth_password.py` with one external interface:

```text
public_policy()
validate_new_password(candidate, context_terms=())
hash_new_password(candidate)
verify_password(candidate, stored_hash)
```

The implementation owns Unicode/code-point and UTF-8 byte limits, blocklist
adapter invocation, Argon2id encoding, bcrypt compatibility, dummy-hash work,
algorithm detection, and safe error classification. Encoded Argon2 hashes
carry algorithm and work-parameter metadata. Callers do not branch on hash
format.

Apply the module to password reset, client provisioning, staff-invitation
acceptance, login verification, and initial bootstrap creation. Existing bcrypt
credentials remain verifiable. Phase 1 does not enable opportunistic
login-time rehash; that can be reviewed after the recovery slice is stable.

### 5.2 Deep recovery module

Add `backend/auth_recovery.py` and preserve the interface approved by
`DEC-AUTH-003`:

```text
request_password_reset(normalized_email, request_context)
validate_password_reset(raw_token)
complete_password_reset(raw_token, new_password)
```

Database collections, clock, secure randomness, password module, transaction
guard, origin policy, and delivery are injected internal seams. Handlers in
`backend/server.py` translate only allowlisted module results into the stable
public contract.

Request behavior must:

- preserve one generic response for known, unknown, disabled,
  `access_review_required`, delivery-failure, and persistence-failure paths;
- issue tokens only for eligible active accounts;
- generate at least 256 bits of randomness and store only a hash;
- retain the 30-minute TTL and one-active-token rule;
- atomically deactivate an earlier active token and insert its successor before
  delivery; new tokens use an explicit `active: true` marker;
- construct the link only from validated `PUBLIC_SITE_URL`;
- deliver through a dedicated adapter that never creates a general
  notification containing the URL; and
- invalidate an undelivered token where possible without exposing failure.

Completion behavior must atomically:

1. validate and claim one live token;
2. re-check account eligibility;
3. validate and Argon2id-hash the new password;
4. update the password and increment `token_version`;
5. consume the claimed token and invalidate active sibling tokens; and
6. return no login token.

Concurrent completion produces exactly one success. Transaction unavailability
returns the existing stable retryable transaction error and performs no partial
mutation.

### 5.3 Dedicated recovery delivery

Modify `backend/emailer.py` only to add a high-level password-recovery delivery
entry point. It may reuse the already configured email adapter, but it must not
persist token-bearing HTML, log provider payloads, or copy raw provider errors
into evidence. A test adapter may capture delivery in process for assertions.
No provider is newly selected or activated.

Send the post-reset notification separately and without the password or reset
token. General notification persistence is allowed only for the safe
post-reset message.

### 5.4 Backend-only origin policy

Add `PUBLIC_SITE_URL` to `backend/.env.example` and remove backend dependence
on `REACT_APP_PUBLIC_SITE_URL` for recovery links.

The value must be one absolute origin with no credentials, query, fragment, or
unexpected path. HTTPS is mandatory outside explicit local/test mode.
`localhost` or loopback HTTP is allowed only in local/test mode. Request
`Host`, `Origin`, and forwarded headers never choose the reset destination.
Missing or invalid configuration disables token issuance safely while keeping
the generic public response.

### 5.5 Bootstrap correction

Modify startup behavior so `ADMIN_PASSWORD` is used only when creating an
absent bootstrap account. For an existing account, startup never compares,
rewrites, rotates, or repairs the password from environment configuration.
Credential rotation uses the approved recovery/control path.

Fresh bootstrap creation uses the password module and retains the current
fail-closed access-review state; Phase 1 does not assign a role or approve the
account automatically.

### 5.6 Frontend token containment and state routes

Modify the existing recovery pages and route wiring to:

- capture a reset token once, keep it only in component memory, and remove it
  from browser URL/history before rendering the password form;
- validate it through `POST /api/auth/reset-password/validate`;
- add `/forgot-password/check-email`, `/reset-password/success`, and
  `/reset-password/error` with safe direct-visit fallbacks;
- keep full email addresses and raw tokens out of route/query state;
- obtain the password rules from `GET /api/auth/password-policy`;
- preserve paste, autofill, accessible labels, show/hide behavior, focus
  movement, loading, retryable, and generic error states; and
- preserve `/admin/login`, `/forgot-password`, and `/reset-password`.

No Admin login visual redesign or session transport change is included.

### 5.7 Non-destructive migration and indexes

Add `backend/migrations/007_auth_recovery_safety.py` with mutually exclusive
dry-run, apply, and rollback modes. Dry-run is the default and read-only.

The migration must:

- inventory token field types and duplicate active-token conditions without
  exposing token hashes or account contact data;
- invalidate pre-migration active tokens non-destructively so users request a
  fresh link under the new contract;
- preserve historical token documents and mark only migration-owned fields;
- add a unique token-hash index and a partial unique one-active-token-per-user
  index after validation;
- avoid a TTL deletion index until retention/deletion policy is separately
  approved;
- require an unused encrypted backup destination for apply;
- be idempotent and refuse ambiguous or already-partially-applied states;
- require transaction capability for mutation; and
- support rollback of migration-owned fields and indexes from the verified
  backup.

Apply/rollback against shared, staging, or production data is outside this
packet. Only disposable local replica-set integration testing is proposed.

### 5.8 Files

Proposed new files:

- `backend/auth_password.py`
- `backend/auth_recovery.py`
- `backend/migrations/007_auth_recovery_safety.py`
- `backend/tests/test_auth_password.py`
- `backend/tests/test_auth_recovery.py`
- `backend/tests/test_auth_recovery_migration.py`
- `backend/tests/test_auth_recovery_transaction_integration.py`
- `frontend/src/pages/auth/ForgotPassword.test.jsx`
- `frontend/src/pages/auth/ResetPassword.test.jsx`
- `docs/runbooks/AUTH_RECOVERY_RUNBOOK.md`

Proposed modified files:

- `.github/workflows/transaction-tests.yml`
- `backend/server.py`
- `backend/emailer.py`
- `backend/identity_routes.py`
- `backend/requirements.txt`
- `backend/.env.example`
- `backend/tests/test_identity_foundation.py`
- `backend/tests/test_reset_password.py`
- `backend/tests/test_auth_security.py`
- `frontend/src/App.js`
- `frontend/src/pages/auth/ForgotPassword.jsx`
- `frontend/src/pages/auth/ResetPassword.jsx`
- `docs/context/DOCUMENT_REGISTER.md`

Any need to edit outside this list is a stop condition and requires a packet
amendment or separate approval.

## 6. Approval Docket

### AUTH-P1-01 — Scope boundary

**Recommendation:** Approve the Recovery Safety Baseline in Sections 2–5 and
keep every Section 4 item out of Phase 1.

**Status:** Approved on 27 July 2026.

### AUTH-P1-02 — Branch and worktree

**Recommendation:** Do not implement on the dirty marketing worktree. After
the Phase 0 documentation is reviewed and safely checkpointed with explicit
commit authorization, create an isolated worktree and branch named
`feat/admin-auth-phase-1-recovery-safety` from that exact reviewed lineage.
Do not use the stale local `main` branch as the base.

**Status:** Approved and completed on 27 July 2026. Documentation checkpoint
`c28684d` and isolated branch/worktree
`feat/admin-auth-phase-1-recovery-safety` were verified clean before G1 work.

### AUTH-P1-03 — Argon2 dependency and baseline

**Recommendation:** Permit the manifest and benchmark-harness change
`argon2-cffi>=25.1.0,<26`, subject to Python 3.14.3 installation verification.
Use Argon2id with `memory_cost=19456 KiB`, `time_cost=2`, and
`parallelism=1` as the minimum candidate baseline; do not lower it. Benchmark
on the lowest supported production-equivalent instance before enabling new
Argon2 writes. Do not introduce a pepper in Phase 1.

Initial approval authorizes dependency setup and benchmark evidence only. The
owner must explicitly accept the resulting parameters/resource budget before
implementation proceeds beyond Gate G1 or writes an Argon2 credential.

The baseline follows the current OWASP Password Storage Cheat Sheet. The
library documentation confirms that encoded hashes retain parameters and can
be checked for later rehash:

- `https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html`
- `https://argon2-cffi.readthedocs.io/en/stable/api.html`

**Status:** Approved on 27 July 2026. The owner accepted the redacted G1
evidence and candidate parameters (`memory_cost=19456 KiB`, `time_cost=2`,
`parallelism=1`) on 27 July 2026 for continued implementation. Argon2 writes
remain disabled until the production-equivalent benchmark and all write-enable
gates pass.

### AUTH-P1-04 — Password blocklist seam

**Recommendation:** Implement an offline blocklist adapter configured by
`AUTH_PASSWORD_BLOCKLIST_PATH`, with a small deterministic test fixture only.
Do not bundle or download a production dataset in Phase 1. Password-changing
and credential-creation operations fail closed when the approved blocklist is
unavailable; login verification remains available. Production enablement waits
for separate approval of the dataset, update procedure, privacy treatment, and
owner.

This preserves the NIST requirement to compare the whole prospective password
against a maintained common/expected/compromised-password list without
silently selecting a provider or corpus:
`https://pages.nist.gov/800-63-4/sp800-63b.html`.

**Status:** Approved on 27 July 2026; production dataset, update procedure,
privacy treatment, and owner remain open.

### AUTH-P1-05 — Origin and staged hash-write configuration

**Recommendation:** Approve the backend-only names `PUBLIC_SITE_URL`,
`AUTH_PASSWORD_BLOCKLIST_PATH`, and `AUTH_ARGON2_WRITES_ENABLED`.
Argon2 verification is always enabled after deployment of compatible code;
new Argon2 writes remain disabled until benchmark, blocklist, migration, and
rollback-floor gates pass.

While writes are disabled, new credential creation, password reset completion,
and fresh bootstrap creation fail closed; they never fall back to creating a
new bcrypt hash. Existing bcrypt/Argon2 login verification remains available.

**Status:** Approved on 27 July 2026; environment values remain operator-owned
and must not enter Git.

### AUTH-P1-06 — Migration scope

**Recommendation:** Authorize migration implementation and disposable
replica-set apply/rollback tests only. Do not authorize dry-run or mutation
against any shared environment or real account/token dataset.

**Status:** Approved on 27 July 2026 for disposable local replica-set testing
only.

### AUTH-P1-07 — Verification commands

**Recommendation:** Authorize the commands in Section 10, including dependency
installation in an isolated project environment and local Docker replica-set
tests. Network download and Docker execution still use the normal runtime
approval controls when invoked.

**Status:** Approved on 27 July 2026, subject to normal runtime approval
controls for network download and Docker execution.

### AUTH-P1-08 — Git and external-state behavior

**Recommendation:** Permit only the approved branch/worktree creation, local
file edits, and tests. Do not commit, push, open a pull request, mutate shared
data, send real recovery email, or deploy without a new explicit instruction.

**Status:** Approved on 27 July 2026; commit, push, pull request, real email,
shared-data mutation, deployment, and rollout remain unauthorized.

## 7. Approval Summary

| ID | Recommended selection | Owner response |
| --- | --- | --- |
| `AUTH-P1-01` | Recovery Safety Baseline only | Approved |
| `AUTH-P1-02` | Isolated worktree/branch after approved Phase 0 checkpoint | Completed at `c28684d` on the approved isolated worktree |
| `AUTH-P1-03` | `argon2-cffi` 25.x; Argon2id 19 MiB, t=2, p=1 minimum; benchmark then follow-up parameter acceptance | Evidence and parameters accepted for implementation; writes remain gated |
| `AUTH-P1-04` | Offline blocklist seam; test fixture only; production dataset deferred | Approved; production inputs remain open |
| `AUTH-P1-05` | Backend origin, blocklist path, and staged Argon2-write config names | Approved; values remain operator-owned |
| `AUTH-P1-06` | Migration code plus disposable local apply/rollback tests only | Approved for disposable local data only |
| `AUTH-P1-07` | Targeted/full CI-aligned verification commands | Approved; runtime controls still apply |
| `AUTH-P1-08` | Local edits/tests only; no commit, push, real email, shared data, or deploy | Approved |

The owner explicitly approved all `AUTH-P1` recommendations on 27 July 2026.
This activates the bounded implementation authorization described in Section
1, subject to every sequential gate below. Gate G0 and the G1 parameter
checkpoint are complete. This approval is not commit, push, shared-data,
release, or rollout authority.

## 8. Implementation Gates and Stop Conditions

### Gate G0 — Authorization and clean isolation

**Result: Passed on 27 July 2026.** The reviewed base is checkpoint `c28684d`.
The isolated worktree uses branch `feat/admin-auth-phase-1-recovery-safety`;
the source marketing worktree remained clean.

- all `AUTH-P1-*` items have an explicit owner response;
- the Phase 0 decision records and registers are reviewed and safely
  checkpointed under separate commit authorization;
- the exact base commit is recorded;
- the isolated worktree contains no unrelated modifications; and
- no source edit starts on the active marketing worktree.

### Gate G1 — Dependency and policy readiness

- `argon2-cffi` installs and imports on Python 3.14.3;
- `python -m pip check` passes;
- the candidate work factors meet the approved minimum and benchmark gate;
- bcrypt and Argon2 fixture verification both pass;
- missing blocklist configuration fails credential creation/change closed; and
- no raw password/hash/token appears in benchmark output.

After recording this evidence, stop and obtain explicit owner acceptance of
the final parameters and resource budget. Do not proceed to password-write or
recovery-completion implementation before that follow-up approval.

**Parameter-checkpoint result: Accepted on 27 July 2026.** Evidence used Python
3.14.3 with `argon2-cffi` 25.1.0 on AMD64. Fifty samples after five warm-ups
produced hash p50/p95 of 18.317/25.425 ms and verify p50/p95 of
18.133/24.949 ms; the observed maximum was 27.341 ms. `pip check`, Black,
isort, Flake8, redaction tests, Argon2 parameter/verify/mismatch tests, and
legacy bcrypt compatibility passed (`4 passed`). The owner accepted the
candidate parameters for continued implementation.

The remaining blocklist fail-closed condition must be implemented and verified
before any credential write can be enabled. A benchmark on the lowest
production-equivalent instance is still required before
`AUTH_ARGON2_WRITES_ENABLED` may become true.

### Gate G2 — Recovery behavior

- known/unknown/blocked/delivery-failure requests have the same public
  response;
- raw-token evidence scans are empty;
- reset origin validation is fail closed;
- mixed bcrypt/Argon2 verification does not introduce a material new
  known-account timing distinction beyond the residual timing consequence
  already recorded under `DEC-AUTH-001`;
- two concurrent completions yield exactly one success;
- transaction unavailability and injected mid-operation failure yield no
  partial mutation; and
- all pre-reset sessions are rejected after success.

**Result: Passed locally on 27 July 2026.** The backend suite passed with
`481 passed`, `9 skipped`, and `14 subtests passed`. The mandatory disposable
MongoDB replica-set suite passed `46/46`; five independent recovery-concurrency
repetitions each produced exactly one successful completion and one stable
invalid result, one password mutation, one `token_version` increment, one
consumed token, and one post-reset notification. Transaction retry handles a
real MongoDB write conflict without exposing a raw database exception.

The redacted mixed-hash comparison used 15 samples after three warm-ups for
invalid known-account verification. Argon2id recorded p50/p95 of
243.638/305.194 ms and bcrypt recorded 223.240/272.478 ms. The p50 delta was
20.398 ms and ratio was 1.091, inside the local comparison budget of no more
than 150 ms and 1.5x. No password or encoded hash appears in the report.

Password-reset completion, client provisioning, staff-invitation acceptance,
and fresh bootstrap creation now use the centralized Argon2id write path and
fail closed while the write gate or blocklist is unavailable. Startup no
longer compares or reconciles an existing Admin credential. Request
enumeration, origin failure, token-sink redaction, transaction rollback, and
post-reset session-revocation contracts are covered by the passing suite.

This local result does not enable `AUTH_ARGON2_WRITES_ENABLED`, authorize real
email, or satisfy Gate G3. The approved production blocklist, benchmark on the
lowest production-equivalent instance, recovery migration dry-run/apply/
rollback evidence, rollback-floor verification, and all rollout decisions
remain open.

### Gate G3 — Migration readiness

- dry-run is proven read-only;
- backup output contains no raw token, token hash, email, password, or hash;
- duplicate/ambiguous states stop apply;
- apply is idempotent in a disposable replica set;
- rollback restores migration-owned fields/index state from the backup; and
- a restore exercise succeeds before any later shared-environment proposal.

**Result: Passed locally on 27 July 2026.** Migration `007` dry-run and
ambiguity tests were read-only and redacted. A disposable MongoDB replica set
passed all seven migration tests, including apply, second-run idempotency,
typed-field rollback, migration-owned index removal, and database cleanup. No
shared data or retained backup was used.

### Gate G4 — Reviewable implementation

- targeted and full backend/frontend suites pass;
- production frontend build passes;
- no Section 4 file/scope is introduced;
- diff contains no secret/config value or generated backup;
- runbook documents disablement, recovery, rollback floor, and operator handoff;
- implementation remains uncommitted and unpushed unless separately approved.

**Result: Passed locally on 27 July 2026.** The serial backend suite passed
`486` tests with `9` skipped and `14` subtests. The frontend suite passed all
`47` tests and the production build compiled successfully. `pip check`, backend
compilation, diff whitespace validation, runbook review, and disposable Docker
cleanup passed. No commit, push, shared-data mutation, real recovery email,
deployment, Argon2 write enablement, or production activation occurred.

Stop immediately if any gate fails, an unlisted file/dependency becomes
necessary, transaction capability is unavailable, a raw token reaches evidence,
the blocklist is unavailable for a password mutation, Argon2 exceeds the
approved resource budget, migration state is ambiguous, or safe rollback would
require restoring the current non-atomic/token-persisting behavior.

## 9. Rollout and Rollback Boundary

No rollout is authorized, but the implementation must support this later safe
sequence:

1. compatibility release: deploy bcrypt plus Argon2 verification while new
   Argon2 writes remain disabled;
2. verify the rollback floor can read Argon2 and the recovery module remains
   disabled or safe under missing dependencies;
3. complete blocklist, origin, migration, transaction, delivery, monitoring,
   and operator gates;
4. enable Argon2 writes and the new recovery completion contract separately;
5. if write enablement fails, disable new writes while retaining Argon2
   verification for credentials already created.

Never roll back to a version that cannot verify an already-issued Argon2 hash.
If recovery must be disabled, return a generic temporarily-unavailable outcome;
do not restore raw-token persistence, sequential reset writes, or startup
password reconciliation.

Production readiness additionally requires decisions still open in
`DEC-AUTH-006`, an approved blocklist dataset and owner, an exact delivery
procedure, operational monitoring, and a separately approved rollout/runbook
execution.

## 10. Authorized Verification Commands After Approval

From repository root:

```powershell
python -m pip check
python -m compileall -q backend
python -m pytest -q backend/tests/test_auth_password.py backend/tests/test_auth_recovery.py backend/tests/test_auth_recovery_migration.py backend/tests/test_reset_password.py backend/tests/test_auth_security.py backend/tests/test_transaction_guard.py backend/tests/test_transaction_execution.py backend/tests/test_database_capabilities.py
python -m pytest -q backend/tests
```

From `frontend/`:

```powershell
npm test -- --watchAll=false --runInBand
npm run build
```

The disposable replica-set gate extends the existing transaction workflow with
`backend/tests/test_auth_recovery_transaction_integration.py` and runs serially
with `NIUVA_RUN_REAL_TRANSACTION_TESTS=1`. Docker startup/cleanup follows
`.github/workflows/transaction-tests.yml`; it must use only the isolated test
database and temporary volume.

## 11. Evidence Required for Completion Handover

- exact base commit, branch, and worktree path;
- changed-file list matched to Section 5.8;
- dependency version and `pip check` result;
- redacted Argon2 benchmark summary;
- targeted/full test and build results;
- transaction-unavailable, concurrency, and rollback test evidence;
- migration dry-run/apply/rollback summary from disposable data;
- raw-token/credential evidence scan result;
- open production blockers and owners; and
- explicit statement that no commit, push, shared-data mutation, real recovery
  email, deployment, or production activation occurred.
