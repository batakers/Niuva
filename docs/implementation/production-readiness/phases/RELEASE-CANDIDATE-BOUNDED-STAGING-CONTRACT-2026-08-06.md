# G0 — Niuva Bounded Staging-Candidate Release Contract

**Date:** 2026-08-06 (Asia/Jakarta)

**Status:** Scope frozen for follow-up work; context-only planning contract.
DR-001 remains open and this document does not select an immutable release
candidate. It is not production-readiness approval, deployment authorization,
provider activation, migration authorization, or go-live approval.

**Observed current-main baseline:** `origin/main` at
`443aefe36810201c89e3c99849a8159558c7fd37`

This is a current-main reanchor of the historical PR #142 bounded-scope card.
The contract covers Public, B2B Inquiry/Quote/Project/Work Order, Auth/Admin,
customer session, and Retail read-only discovery without changing runtime
source or canonical product decisions.

The current main also contains the G1–G4 routing cards from PRs #162 and #163.
Those cards remain the applicable child path and source-gate contracts; this
G0 document coordinates them and does not override their exact path locks.
Drivers must fetch again and record a new exact SHA before implementation or
external verification work.

## 1. Purpose, authority, and release boundary

This contract freezes the smallest staging-candidate boundary that can be
verified in parallel. It is a planning and evidence contract, not an approval
to widen product scope. The canonical reading order remains:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. the applicable approved ADR or decision
5. the applicable runbook
6. current source and tests

The candidate is allowed to exercise existing public, B2B, authentication,
administration, customer-session, and read-only Retail discovery behavior.
Every write that requires a transaction, external provider, migration, or
operational activation remains separately gated.

This document does not authorize:

- a canonical product or pricing decision;
- source/runtime implementation, schema migration, backfill, or data repair;
- selection or activation of storage, payment, email, analytics, hosting, or
  other providers;
- production deployment, production credentials, traffic rollout, on-call,
  monitoring activation, readiness approval, or go-live.

The staging candidate is accepted only as a bounded, reversible test
environment. A passing local test, merged PR, or green CI job is evidence for
one check only; it is not production-readiness or go-live evidence by itself.

## 2. Active candidate capabilities

The following capabilities are in scope for a provider-neutral staging
candidate. “Active” means the behavior may be tested when the environment,
role, fixture, and owner evidence are available.

| Capability | Candidate behavior | Boundary |
| --- | --- | --- |
| Public website | Unified public pages, content, portfolio, contact, and direct-load/refresh behavior | No invented product claims, pricing promises, or provider activation |
| B2B Inquiry | Anonymous inquiry creation at `POST /api/inquiries` | Input validation, abuse controls, safe customer projection, and owner response remain required |
| B2B Inquiry administration | Authorized Admin list, detail, transitions, and controlled conversion | Least privilege; no customer exposure of internal notes, cost, margin, or supplier data |
| B2B Quote | Authorized list/detail, transitions, revisions, acceptance, and conversion flows | Commercial history remains immutable; conflict/idempotency behavior must be verified |
| B2B Project | Authorized list/detail, state transitions, and quote-to-project creation | Preserve the separate B2B project lifecycle |
| B2B Work Order | Authorized creation, list/detail, transitions, allocation, and consumption where source behavior permits | Transaction and inventory capability must be ready; otherwise fail closed without partial mutation |
| Auth and Admin | Customer/internal login, secure cookie session, CSRF/origin controls, refresh/logout/recovery validation, role checks, and Admin Studio routes | No new identity provider, MFA decision, or credential policy decision is implied |
| Customer session | Login/refresh/logout and ownership-scoped customer dashboard/history reads | Customer data must exclude internal cost, margin, supplier, profit, and internal notes |
| Retail discovery | `/retail`, `/retail/products/:slug`, and catalog GET routes | Read-only discovery only; no authoritative cart, order, checkout, payment, upload, or fulfillment |
| Candidate controls | Liveness/readiness/capability endpoints, secret-safe logs, and reproducible evidence collection | Readiness must expose dependency failures rather than masking them |

The active list is a test boundary, not a claim that every path is already
ready. Each child goal must attach its own role matrix, fixtures, positive
checks, negative checks, and unresolved risks.

## 3. Explicitly inactive or excluded capabilities

The following behavior must remain unavailable, disabled, or fail closed in
the candidate:

| Area | Inactive behavior |
| --- | --- |
| Retail commerce | Cart/order creation, quote-to-order, checkout, paid order, reservation, fulfillment, shipping, production, QC, tracking, after-sales, tax, and new Retail account claim |
| Payment and Finance | Payment provider credentials/adapters, webhooks, refunds, reconciliation, Finance actions, new manual-transfer/payment-proof actions |
| Storage and media | Production upload, public bucket/object storage, media processing, supplier/customer file exchange, and production retention/restore activation |
| Organization Portal | Organization Portal routes, its schema/role expansion, and organization-level reporting or data migrations |
| Notifications | External email delivery, broadcast, worker activation, analytics, session recording, and provider-backed notification side effects unless separately approved |
| Database change | Migration apply, backfill, cleanup, destructive repair, shared-data rewrite, or rollback of a migration |
| Operations | Production topology, production credentials, deploy/rollout, public traffic switch, monitoring/on-call activation, SLO approval, incident process activation, and go-live |

An inactive request must return the repository's controlled error or inactive
capability response and must not create a record, reserve inventory, send a
notification, upload an object, charge a customer, or mutate payment state.

The candidate must keep the source-level capability boundary visible through
`GET /api/capabilities`. At the current baseline, Retail discovery is active
while Retail creation, legacy order creation, checkout, payment, production
upload, and Organization Portal are inactive.

## 4. Staging environment contract

The environment owner must provide a redacted manifest showing the effective
names and non-secret policy values. Secret values must be injected by the
approved secret store or CI environment and must never be committed, printed,
or copied into this document.

### Backend application variables

| Variable | Candidate policy |
| --- | --- |
| `APP_ENV` | Exactly `staging` |
| `NIUVA_RUNTIME_MODE` | `api`; no worker or migration process is implied |
| `MONGO_URL` | Staging MongoDB URI for a persistent replica set; no local standalone or production URI |
| `DB_NAME` | Dedicated staging database name |
| `JWT_SECRET` | Secret-store value with rotation owner; never a fixture or repository value |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Dedicated staging Admin account; password injected and rotated by owner |
| `PUBLIC_SITE_URL` | Exact HTTPS public/frontend origin used by the candidate |
| `CORS_ORIGINS` | Exact approved frontend origin(s), never wildcard |
| `AUTH_COOKIE_SECURE` | `true` |
| `AUTH_COOKIE_DOMAIN` | Empty host-only cookie unless a separately approved domain boundary exists |
| `AUTH_SESSION_CSRF_KEY` | Secret-store value of at least 32 bytes |
| `AUTH_PASSWORD_BLOCKLIST_PATH` | Approved non-development blocklist path, readable by the API |
| `AUTH_ARGON2_WRITES_ENABLED` | `false` unless a separate password-write test and owner approval are recorded |
| `TRANSACTION_MUTATIONS_ENABLED` | `false` during provisioning; may become `true` only inside the approved staging mutation window after replica-set preflight |
| `STORAGE_BACKEND` | `disabled`; `LOCAL_STORAGE_ROOT` must not become a production upload boundary |
| `NOTIFICATION_WORKER_ENABLED`, `NOTIFICATION_WORKER_REQUIRED` | `false` for the base candidate |
| `EMAIL_DELIVERY_REQUIRED` | `false`; no external delivery side effect in the base candidate |
| `AUTH_SECURITY_EVENTS_ENABLED` | `false` for the base candidate unless the separate event-key, retention, and alert owner is approved |
| `NIUVA_TEST_BEARER_AUTH` | `false` |
| `TRUST_PROXY_HEADERS` | `false` unless the exact trusted proxy and forwarded-header contract is approved |
| `APP_NAME` | `niuva` or the approved staging label |
| `HRD_EMAIL` | Controlled non-secret support/owner address, if the tested flow requires it |
| `RESEND_API_KEY`, `SENDER_EMAIL` | Omitted from the base candidate; delivery activation requires separate approval |

### Frontend application variables

| Variable | Candidate policy |
| --- | --- |
| `REACT_APP_PUBLIC_SITE_URL` | Exact HTTPS public origin and same-origin assumptions used by the candidate |
| `REACT_APP_BACKEND_URL` | Exact HTTPS API origin; no localhost, wildcard, or production origin |
| `GENERATE_SOURCEMAP` | `false` for the candidate artifact unless an approved debugging exception exists |
| Analytics flags and PostHog configuration | Disabled and blank |
| Session-recording configuration | Disabled and blank |
| `REACT_APP_ENABLE_BRAND_LAB` | `false` unless the route is explicitly in the candidate evidence |

### Verification-only variables

These values belong to isolated checks or the external verifier, not the
runtime candidate contract:

| Variable | Use |
| --- | --- |
| `NIUVA_RUN_REAL_TRANSACTION_TESTS` | `1` only for an isolated replica-set transaction test environment |
| `MONGO_TRANSACTION_TEST_URL` | Dedicated `rs-test` MongoDB URI; never staging or production |
| `NIUVA_EXTERNAL_API_URL` | External smoke target supplied for the approved test window |
| `PLAYWRIGHT_BASE_URL`, `PLAYWRIGHT_API_URL` | Exact staging frontend/API targets for browser and API evidence |
| E2E role/account variables | Dedicated test fixtures only; values remain in the secret store |
| `NIUVA_TEST_ADMIN_*` | Legacy test-only compatibility variables, only when a workflow explicitly requires them |

The owner must record the exact origin, TLS/proxy mode, cookie policy, and
secret-injection source without recording secret material. Any missing
variable, unexpected fallback, localhost value, wildcard origin, or production
reference blocks candidate acceptance.

## 5. MongoDB transaction and schema preconditions

The staging owner must prove the database capability before enabling any
transaction-required mutation:

1. `db.hello` reports a replica-set `setName` and a non-null
   `logicalSessionTimeoutMinutes`.
2. An application capability probe can start, commit, and observe a read-only
   transaction on the target.
3. `/api/health/ready` returns HTTP 200 with database, required schema, and
   transaction readiness; disabled worker and email dependencies are reported
   explicitly rather than silently treated as active.
4. One controlled B2B atomic mutation and its idempotent/conflict behavior
   pass in the approved fixture, together with the negative case that returns
   `503 transaction_unavailable` without a partial write.
5. Backup/restore ownership, evidence location, and recovery window are
   recorded before non-read-only staging data is used.

A standalone MongoDB instance is acceptable only for read-only or safe
single-document checks. `directConnection` is limited to local/CI test
fixtures. The candidate does not apply, rollback, or repair migrations. The
required schema/index versions must already exist or the candidate is blocked.

The schema manifest currently makes migrations 007, 008, and 009 required;
Migration 010 security events remains staged and is not part of the required
schema set. This contract does not change that authority or authorize applying
any migration.

## 6. Storage and payment boundaries

Storage remains provider-neutral and disabled in the base candidate:

- `STORAGE_BACKEND=disabled`; no local filesystem is promoted to production
  storage and no public bucket/provider is activated.
- Upload, media processing, file exchange, retention, scanning, backup, and
  restore capabilities remain inactive.
- Historical file references may be read only where existing source behavior
  safely permits it; no new object is written.
- ADR-002 remains the authority for a later stable storage port, provider,
  scanning, retention, backup, restore, and owner decision.

Payment remains provider-neutral and disabled:

- No payment credentials, provider adapter, webhook, checkout, refund,
  reconciliation, or Finance activation is included.
- `checkout` and `payment` remain inactive in the capability contract.
- Existing payment metadata may be displayed only through safe read-only
  projections; no new payment state is created or advanced.
- New manual-transfer or payment-proof actions remain disabled.
- DEC-PAY-02 and ADR-003 remain unchanged; a staging test cannot select or
activate a payment provider.

## 7. Staging acceptance criteria

The Release/Ops owner must attach evidence for every criterion below against
one exact candidate SHA and immutable build artifact. “Not run”, “not
applicable” without a reason, or a result from another SHA is not a pass.

| ID | Acceptance gate | Minimum evidence |
| --- | --- | --- |
| A0 | Artifact identity | Clean checkout of the selected SHA, frontend/backend artifact digests, source map policy, and a record that no untracked file entered the artifact |
| A1 | Environment and boundary | Redacted effective env manifest, exact HTTPS origins, TLS/proxy mode, secure host-only cookies, no wildcard CORS, and no production/provider secret |
| A2 | Repository quality | Backend tests, frontend tests/build, lint/type/compile/format checks, secret scan, and explicit reasons for every skipped check |
| A3 | Database readiness | Replica-set hello evidence, transaction capability probe, required schema/index check, `/api/health/ready` result, backup/restore owner, and fail-closed negative result |
| A4 | Public and Retail discovery | Direct load and refresh for public and read-only Retail routes, API origin check, no localhost/mixed-content/chunk errors, and no inactive control exposed as active |
| A5 | B2B lifecycle | Inquiry, quote, revision/acceptance, project, and work-order role-matrix evidence; idempotency/conflict checks; atomicity; and customer-safe projection |
| A6 | Auth, Admin, and customer session | Login/refresh/logout/recovery validation, origin/CSRF/cookie checks, rotation/revocation, role denial, redirect behavior, and customer-data projection |
| A7 | Negative boundary | Probes for Retail create/checkout/payment/upload/Organization Portal and provider-backed actions show controlled inactive responses and no side effects |
| A8 | Browser/accessibility | External browser evidence for required roles, direct-load/refresh, responsive breakpoints, keyboard/focus/error states, and proportional accessibility checks |
| A9 | Operational reversibility | Secret-safe logs, liveness/readiness evidence, artifact manifest, previous known-good artifact, rollback owner/window, and retained evidence location |
| A10 | Data and migration safety | Explicit confirmation that no migration, backfill, cleanup, destructive repair, or production-data import was performed; data owner signs the fixture policy |

Acceptance is blocked if any required evidence is missing, contradictory, or
owned only by the implementer. Local tests prove local behavior; they do not
prove external origin, TLS, backup/restore, monitoring, on-call, provider
activation, or production readiness.

## 8. Rollback boundary

Rollback triggers include:

- readiness is not `200` or becomes unknown;
- transaction capability is unavailable, inconsistent, or shows a partial
  mutation;
- authentication, authorization, customer projection, cookie, CSRF, or
  origin regression is observed;
- an inactive capability creates a record, sends a notification, uploads an
  object, mutates payment state, or reserves inventory;
- the artifact, SHA, secret source, or provider boundary cannot be identified;
- a critical public/browser/origin failure prevents the bounded candidate
  from being safely tested.

The release owner must:

1. stop the test window and record the exact SHA, artifact digest, symptom,
   timestamp, and last known-good candidate;
2. repoint traffic to the previous immutable candidate artifact, without
   rebuilding it during the incident;
3. stop mutation activity if data consistency is uncertain;
4. verify liveness, readiness, authentication, public discovery, and
   read-only B2B access on the restored artifact;
5. retain secret-safe logs and evidence for the incident and follow-up.

Because G0 authorizes no migration, there is no automatic database rollback.
Fixture cleanup or restore is a separate data-owner action governed by the
approved backup/restore runbook; no ad hoc delete is permitted. Release/Ops
owns the operational rollback and the Independent Release Verifier confirms
the checks. A documentation-only correction is reversible by reverting the
documentation commit.

## 9. Child-goal ownership and path matrix

Each child goal has one Driver who owns the handoff and one independent
Verifier who did not implement the change. The Project Owner assigns people to
these roles; the role names below are the minimum accountable ownership.

| Goal | Driver | Independent verifier | Allowed paths and evidence | Explicit exclusions |
| --- | --- | --- | --- | --- |
| G0 — current-main contract | Release/Planning Driver | Independent Readiness Verifier | This contract, the historical PR #142 card as provenance, and a scope/dependency/blocker handoff | No runtime, tests, migrations, env examples, providers, deployment, or canonical decision edits |
| G1 — backend integrity and transaction evidence | Backend/Transaction Driver | Independent Backend/Data Verifier | Current G1 task-card transaction paths/tests, plus B2B authorization, atomicity, idempotency, conflicts, inventory, and safe-projection evidence | No migration apply, provider activation, server-wide refactor, shared handler, or shared workflow edit |
| G2 — auth/session/security evidence | Auth/Security Driver | Independent Security/Auth Verifier | Current G2 task-card auth/session/security paths/tests and customer-session, CSRF/origin, cookie, recovery, role, and customer-data evidence | No identity provider, secret rotation, migration, payment/storage, or unrelated shared-file edit |
| G3 — public/Retail/Admin UI evidence | Frontend/A11y Driver | Independent Frontend/A11y Verifier | Current G3 task-card non-auth frontend paths and focused browser/a11y checks; `App.js`, shared transport, and role wiring are serial | No backend contract change, payment/storage/org activation, or G2 auth source edit |
| G4 — staging verification harness | Release/Ops Driver | Independent Release Verifier | A newly assigned evidence packet under `docs/implementation/production-readiness/phases/`; current workflows, manifests, and runbooks are read-only inputs unless separately assigned | No actual deployment, provider activation, production secret, migration, production data, or unassigned workflow edit |
| G5 — final integration and acceptance | Release Integration Driver | Project Owner plus Independent Release Verifier | Final exact-SHA acceptance packet, evidence index, and handover reconciliation | No self-approval, runtime widening, migration, provider choice, or go-live declaration |

Only the named Driver may commit the goal's approved paths. Commit, push, and
opening a pull request are permitted for the exact child scope already
authorized by the Project Owner. The Project Owner remains the merge authority;
a merged PR proves branch integration only and does not approve staging,
production, or go-live.

Shared paths are serial and require explicit handoff: `backend/server.py`,
`frontend/src/App.js`, `frontend/src/lib/api.js`, package or lock files,
workflow files, migration files, environment examples, and canonical
documents/decisions. No child may use `git add .`; stage only owned paths.

The current worktree already contains unrelated parallel edits in source,
tests, workflows, scripts, and documentation. Those edits are intentionally
not part of G0. Before a child starts, the Driver must recheck `origin/main`,
the selected SHA, `git status --short --branch`, worktrees, and path overlap.

## 10. Dependency and parallel execution map

The dependency graph is:

`G0 contract` → (`G1 B2B`, `G2 auth`, `G3 frontend`, `G4 harness discovery`) → `G5 final acceptance`

After G0 is merged or its exact contract commit is handed off, G1, G2, and
the disjoint portion of G3 may run in parallel. G4 may inspect and prepare
verification artifacts in parallel, but its final workflow/evidence change
must target the exact post-child SHA. G5 is serial and starts only after
every child provides its handoff.

| Dependency | Required handoff |
| --- | --- |
| G0 → G1/G2/G3/G4 | Frozen capability boundary, env policy, path owner, exclusions, acceptance IDs, and blocker list |
| G1 → G5 | B2B role/fixture matrix, atomicity and fail-closed evidence, changed paths, known risks |
| G2 → G5 | Auth/security matrix, cookie/CSRF/origin and projection evidence, changed paths, known risks |
| G3 → G5 | Browser/a11y evidence, route matrix, responsive/direct-load results, changed paths, known risks |
| G4 → G5 | Exact-SHA workflow/evidence manifest, staging target contract, rollback owner, and skipped-check reasons |
| All children → G5 | Commit SHA, PR link, tests/checks, intentionally unchanged paths, unresolved decisions, and external actions still requiring approval |

Missing staging access, fixture accounts, or provider-neutral infrastructure
blocks only the dependent evidence gate; it does not authorize a scope
expansion or an unverified pass.

## 11. Current blocker and decision register

These are release blockers or explicit exclusions, not items to silently
work around:

| ID | Blocker or open decision | Consequence |
| --- | --- | --- |
| B0 | The checkout contains unrelated parallel edits in source, tests, workflows, scripts, and docs, including untracked coordination files | No broad stage/commit; use a fresh fetched base or an owned worktree and preserve all existing work |
| B1 | Staging host/access, data policy, operator, maintenance window, and test-fixture policy are not evidenced in G0 | External staging acceptance cannot start |
| B2 | Exact frontend/API origins, TLS termination, trusted proxy, CORS, cookie domain, and direct SPA refresh behavior are not proven for the target | Public, auth, and browser gates remain blocked |
| B3 | Replica persistence, backup/restore test, database monitoring, incident owner, and recovery window are not proven | Transaction-required B2B mutation and rollback evidence remain blocked |
| B4 | Required schema/index state is environment-dependent and no migration apply is authorized | Candidate is read-only/blocked until the pre-provisioned target is verified |
| B5 | Dedicated role accounts, safe fixtures, independent verifier, and customer-data test identities are not assigned | Role and projection acceptance cannot pass |
| B6 | MFA/recovery key custody, rate-limit policy, security-event retention, alert routing, and security incident ownership remain open | Auth/security evidence is bounded but not production approval |
| B7 | Storage, payment, Finance, fulfillment, tax, email, worker, and notification providers remain open or intentionally disabled | All related capabilities remain inactive |
| B8 | Production hosting/IaC, deployment, immutable artifact registry, SLO, on-call, monitoring, alerting, and incident runbook ownership are not established | No production-readiness or go-live claim |
| B9 | No exact-SHA external browser, origin, restore, rollback, and acceptance packet exists yet | G0 freezes the plan; G5 cannot declare acceptance |
| B10 | Any change to canonical product/architecture/privacy/security decisions requires its own approved decision or ADR | Child goals must stop and escalate rather than rewrite authority |

## 12. Commit, PR, and merge order

The proposed order is:

1. **PR-G0:** merge the current-main release contract and path/dependency
   boundary.
2. **PR-G1 and PR-G2:** run in parallel on disjoint owned paths; merge after
   their independent verification.
3. **PR-G3:** merge after the API and auth contracts it consumes are frozen;
   shared route wiring is handled serially.
4. **PR-G4:** finalize staging workflows and evidence collection only against
   the exact post-child SHA; do not mix unrelated workflow edits.
5. **PR-G5:** integrate the final exact-SHA acceptance packet and handover
   evidence after all prior PRs are merged.

Each Driver may commit, push, and open the PR for the approved child scope.
Reviewers must verify the path boundary and handoff. The Project Owner merges
in order and separately decides whether any later staging/deployment/provider
approval is warranted. No merge in this sequence is a production or go-live
approval.

## 13. G0 handover

### Changed by G0

- `docs/implementation/production-readiness/phases/RELEASE-CANDIDATE-BOUNDED-STAGING-CONTRACT-2026-08-06.md`

### Intentionally unchanged by G0

Runtime source, application tests, migrations, schema manifests, environment
examples, secrets, provider configuration, database state, deployment
workflows, staging infrastructure, canonical specifications, decision
registers, and all unrelated user/parallel-agent changes remain unchanged.

### G0 verification

The Driver must report:

- selected baseline SHA and branch;
- `git diff --check` result;
- exact staged path list;
- confirmation that no runtime or user-owned parallel path is staged;
- contract cross-check against current capabilities, canonical ADRs, runbooks,
  and the PR #142 historical card;
- checks not run because G0 is documentation-only, with their later owner.

The G0 handoff does not claim that staging was deployed, that a migration or
restore was run, that a provider was activated, that monitoring/on-call was
enabled, or that production/go-live is approved. Those remain external actions
requiring their own authority and evidence.
