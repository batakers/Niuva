# DR-003 — Authentication Scope and Phase 1 Exit Decision Packet

<!-- markdownlint-disable MD013 MD060 -->

**Status:** `OPEN / HUMAN_DECISION_BLOCKED`
**Date:** 2026-08-06 (Asia/Jakarta)
**Observed baseline:** `origin/main` at `c84743c8fcbc158721037b3c02dc0dff0c872242`
**Branch:** `codex/g17-dr003-auth-scope-20260806`
**Worktree:** `C:\tmp\niuva-g17-dr003-auth-scope-20260806`

## 1. Purpose and boundary

DR-003 asks the security/identity and release owners to confirm the bounded
authentication scope and Phase 1 exit after a release candidate is selected.
The approved records already govern recovery, Admin sessions, Customer
sessions, password policy, and hash compatibility. They do not by themselves
prove production delivery, migration, rollback, or go-live.

DR-001 must select the immutable release-candidate SHA before any claim about
current readiness or selected-baseline closure. DR-002's accepted incident risk
and verification deadline remain separate gates.

This packet is a decision aid, not an ADR. It does not amend any decision or
authorize source, migration, deployment, credential, provider, or go-live work.

## 2. Authority and evidence sources

The authority order used here is:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md` and DR-001/003 in
   `docs/implementation/production-readiness/DECISIONS_REQUIRED.md`
4. `DEC-AUTH-001`, `DEC-AUTH-003`, `DEC-AUTH-004`, `DEC-AUTH-005`, and
   `DEC-AUTH-010`
5. `AUTH_RECOVERY_RUNBOOK.md` and `AUTH_SESSION_RUNBOOK.md`
6. Feature 1.1–1.4 revalidation records, current source, and tests

Approved contracts to preserve:

- `DEC-AUTH-003`: shared Admin/Customer recovery, generic responses, 256-bit
  single-use hash-only tokens, 30-minute expiry, atomic completion, session
  revocation, and no automatic login.
- `DEC-AUTH-004`: 15–128 Unicode code points, 512-byte defensive cap,
  blocklist checks, Argon2id new hashes, bcrypt compatibility, and no
  destructive bulk rewrite.
- `DEC-AUTH-005`: same-origin Admin `__Host-` cookies, CSRF/origin defenses,
  explicit lifetimes, rotation/revocation, and server-side session state.
- `DEC-AUTH-010`: separate same-origin Customer cookie/session contract,
  host-only cookies, rotation/replay revocation, CSRF/origin, and no runtime
  bearer fallback.
- `DEC-AUTH-001` and `DEC-AUTH-006`: generic auth responses and the approved
  provider-neutral abuse-control boundaries; DR-004 handles its operations.

## 3. Current evidence and unresolved consequences

The following records and source observations are evidence, not closure:

| Area | Evidence at/near current main | Remaining consequence |
| --- | --- | --- |
| Release candidate | DR-001 and the current-main provenance packets observe different historical heads; no immutable candidate is selected in this packet. | All readiness claims remain baseline-ambiguous until DR-001 is approved. |
| Password recovery | Feature 1.3 records shared transactional recovery and isolated test evidence, but missing-provider behavior, timing, direct session-revocation assertions, and production delivery ownership remain open. | Recovery cannot be called production-closed without approved delivery/configuration and fault evidence. |
| Admin session | Feature 1.2 records bounded source and isolated-session evidence; HTTPS/proxy, migration/cutover, monitoring, deployment, and observation evidence remain unavailable. | Admin auth is locally strong but production acceptance is open. |
| Customer session | Feature 1.1 records logout, cookie/origin, no-store, negative-test, and real-store evidence gaps; DEC-AUTH-010 later records the approved policy. | Selected-baseline revalidation and migration/production evidence are still required. |
| Password policy | Feature 1.4 records canonical policy/hash source, but a customer-provisioning legacy validator and two frontend hardcoded limits conflict with the approved policy. | One-policy consistency and implementation approval are not closed. |
| Hash migration | Argon2id writes are gated; bcrypt verification remains the rollback floor. | Blocklist operations, target-equivalent benchmark, write activation, migration/rollback evidence, and retirement policy remain open. |
| Incident risk | DR-002 records a time-bound accepted NIV-001 risk through 30 August 2026, not verified closure. | Release/go-live cannot claim security closure from the accepted-risk record alone. |

## 4. Scope confirmation required from owners

Owners must explicitly confirm the included and excluded scope for the selected
candidate:

- Admin password verification, session issuance, rotation, logout, replay, and
  access-state revocation;
- Customer login, refresh, logout, legacy compatibility, and origin/CSRF;
- shared forgot/reset request, validation, completion, delivery failure, and
  session revocation;
- password creation through reset, invitation, provisioning, and credential
  change;
- bcrypt compatibility, Argon2id new-write gate, blocklist, and rollback floor;
- local/isolated evidence versus staging-like or production evidence;
- retained exclusions: internal MFA (DR-005), abuse-control operations
  (DR-004), provider activation, migration apply, deployment, and go-live.

No scope is selected by a passing test or a merged historical feature record.

## 5. Owner decision fields

### 5.1 Candidate and revalidation boundary

Record:

- selected immutable SHA and why it is the candidate;
- changed-path matrix from the candidate to the approved audit baseline;
- included feature packets and exact test/revalidation scope;
- intentionally excluded changes and their owner/gate;
- independent reviewer, evidence custody, and revalidation date;
- handling if `origin/main` advances before the candidate is accepted.

### 5.2 Recovery closure

Record:

- non-local missing-delivery configuration behavior and token invalidation;
- approved public origin/configuration and environment owner;
- timing-control policy and acceptable evidence without enumeration;
- direct assertions for Admin and Customer session revocation;
- provider failure, transaction failure, notification failure, and rollback
  tests;
- delivery provider/custody decision in the appropriate separate packet;
- Migration 008 target, backup/restore, window, rollback owner, and execution
  approval (not granted here).

### 5.3 Admin session and Customer session exit

Record:

- exact origin, TLS termination, proxy sanitization, cookie preservation, and
  same-origin evidence;
- Admin and Customer migration/cutover boundaries and supported clients;
- session-store readiness, rotation/replay, revocation, and outage behavior;
- `no-store`, CSRF, origin, cookie attributes, and cross-tab evidence;
- monitoring/on-call owner, observation window, incident plan, and rollback
  floor;
- isolated Migration 007/009 evidence versus any shared/production action.

### 5.4 Password policy and hash migration exit

Record:

- resolution of the legacy customer-provisioning validator conflict;
- frontend policy endpoint adoption for Admin customer creation and invitations;
- approved blocklist dataset, update/integrity process, privacy, outage, and
  owner;
- target-equivalent Argon2id runtime, latency/memory/concurrency budget, and
  acceptance owner;
- write-gate activation scope and observability;
- retain-new-write-only versus later login-time rehash decision;
- mixed bcrypt/Argon2id rollback artifact, migration plan, and retirement
  criteria without destructive bulk rewrite.

### 5.5 Phase 1 exit and acceptance

Record:

- mandatory pass criteria and acceptable residual risks;
- independent security/identity review and evidence reproducibility;
- environment, backup, rollback, monitoring, and support proof;
- relationship to DR-004, DR-005, DR-012, DR-013, DR-014, and DR-015;
- explicit statement that Phase 1 exit does not authorize provider activation,
  migration apply, deployment, production readiness, or go-live.

## 6. Required verification after approval

The later source/revalidation task must cover, proportional to the selected
scope:

- generic login/recovery equivalence and no sensitive output;
- recovery delivery failure, timing, replay, concurrent completion, session
  revocation, and transaction rollback;
- Admin and Customer cookie/origin/CSRF/no-store/expiry/rotation/replay cases;
- real isolated-store concurrency and migration dry-run/idempotence/rollback;
- code-point/byte password boundaries, blocklist outage, Argon2 benchmark, and
  mixed-hash rollback floor;
- frontend policy derivation, paste/autofill, Unicode boundaries, and auth
  accessibility/responsive behavior;
- environment-specific TLS/proxy, backup/restore, monitoring, on-call, and
  redacted evidence;
- customer regression and retained legacy compatibility.

Passing repository CI alone is not sufficient evidence for these environment,
migration, operational, or security gates.

## 7. Owner decision form

| Decision area | Owner | Decision/reference | Evidence required | Date/status |
| --- | --- | --- | --- | --- |
| DR-001 candidate SHA and scope |  |  |  | Open |
| Recovery contract/closure |  |  |  | Open |
| Admin session production boundary |  |  |  | Open |
| Customer session revalidation/migration |  |  |  | Open |
| Password policy consistency |  |  |  | Open |
| Blocklist operations |  |  |  | Open |
| Argon2 benchmark/write gate |  |  |  | Open |
| Hash migration/rollback floor |  |  |  | Open |
| Phase 1 exit approver |  |  |  | Open |
| Migration/deployment/credential action |  |  |  | Not granted |
| Production-readiness/go-live |  |  |  | Not eligible |

## 8. Current verdict and handover

Current verdict: **NOT READY for Phase 1 exit, production authentication, or
go-live**.

The repository contains substantial bounded auth source and local/isolated test
evidence, but the candidate SHA, residual consistency fixes, delivery/provider
inputs, production topology, migration/rollback evidence, and operational
ownership are not all approved or proven. The correct status is
`blocked_by_decision` / `blocked_by_environment`, not closure by inference.

Intentionally unchanged by this packet:

- DR-001/002/003 status, all canonical decisions, and the Decision Register;
- backend/frontend source, schemas, migrations, dependencies, configuration,
  tests, CI workflow, and deployment manifests;
- credentials, providers, shared/staging/production data, deployment,
  readiness, and go-live state;
- all scan rules and configuration except `.gitleaksignore`, which carries only
  the exact verified historical false-positive fingerprint required by the
  published PR history;
- the dirty `main` worktree and unrelated worktrees.

The next authorized action is owner review of DR-001/003 fields. Any source or
migration work must receive a separate explicit source/environment gate and
must preserve the approved rollback and compatibility boundaries.

<!-- markdownlint-enable MD013 MD060 -->
