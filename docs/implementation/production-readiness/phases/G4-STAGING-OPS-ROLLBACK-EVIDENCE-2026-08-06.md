# G4 — Staging, Operations, and Rollback Evidence Packet

<!-- markdownlint-disable MD013 MD060 -->

**Status:** Documentation-only evidence packet; no staging or production
evidence is claimed.

**Observed baseline:** `origin/main` at
`443aefe36810201c89e3c99849a8159558c7fd37` (observed 6 August 2026,
06:08:24 Asia/Jakarta).

**Branch/worktree:** `codex/g26-readiness-next-20260806` /
`C:\tmp\niuva-g26-readiness-next-20260806`.

This packet is a G4 handover input. It does not select a release candidate,
authorize staging or production deployment, activate a provider, apply or
restore a migration, rotate a secret, approve production readiness, or approve
go-live.

## 1. Evidence identity and scope

The isolated worktree was created from a freshly fetched `origin/main` and was
clean before this packet was added:

| Evidence | Result | Limit |
| --- | --- | --- |
| Release/source SHA | `443aefe36810201c89e3c99849a8159558c7fd37` | Point-in-time repository identity; not an owner-selected release candidate |
| Git tree | `992ada163fba7559345ce455dc9af4dd8a1970e7` | Source tree identity only; no built artifact or container digest |
| Parent | `c705a4413c02eef6b31f4e0e76e144733453e0af` | Previous `main` merge parent |
| Merge | PR #163, `docs: define parallel G1-G4 task cards` | Documentation-only delta from the first parent |
| Worktree divergence | `origin/main...HEAD = 0/0` | Proves the isolated checkout matched the fetched remote at creation |
| Working tree | Clean before this packet | Does not prove a deployed environment is clean |

The exact change from the first parent is four G1–G4 task cards under
`docs/implementation/production-readiness/phases/`. No backend, frontend,
dependency, workflow, deployment, migration, or runtime file changed in that
merge. This is a path fact, not a production-readiness decision.

The user-provided `c7452b8` baseline is stale relative to this observation.
The current release-candidate decision (DR-001) remains open; this packet does
not silently select `443aefe`.

## 2. Reproducible inputs

### Toolchain and dependency identity

The local observation in the isolated worktree reported:

| Input | Observed value |
| --- | --- |
| Python | `3.14.3` |
| Node | `v24.14.0` |
| npm | `11.18.0` |
| CI Python | `3.14.3` in `quality-gates.yml` and `transaction-tests.yml` |
| CI Node | `24` in `quality-gates.yml` and external Admin E2E |
| Frontend install | `npm ci` using `frontend/package-lock.json` |
| Backend dependency manifest | `backend/requirements.txt` |
| `frontend/package.json` SHA-256 | `7EA49B0BF92416E1D45596B74EC274138F0B76056EB794977A2A6E705A651CAD9` |
| `frontend/package-lock.json` SHA-256 | `E094B3CA22A3A4C274B2945246EEFF9468DC33C328294216C420F04B3443E88C` |
| `backend/requirements.txt` SHA-256 | `4C1CC9FB948CBF6B798532B3C740DF756393371DFFAECCD60023641A9BB04F00` |

The package metadata declares Yarn `1.22.22`, while the tracked CI release
workflow installs with npm and the local evidence environment did not have a
Yarn executable. DR-013 therefore remains open for the supported package
manager and release-toolchain policy; this packet does not resolve it by
preference.

The repository does not track `frontend/build/`, a release tag, a container
digest, or a hosted artifact for this SHA. A future staging candidate must
record the exact artifact digest produced from the selected source SHA rather
than treating the Git SHA as an artifact digest.

### CI and verification inputs

The tracked workflows provide the following reproducible boundaries:

- `quality-gates.yml` installs backend requirements, runs dependency health,
  compile, critical Flake8, bounded MyPy, Black/isort, the complete backend
  suite, frontend dependency policy, frontend tests, a production build, and
  hermetic Chromium contracts.
- `transaction-tests.yml` creates an isolated `rs-test` MongoDB replica set,
  waits for a writable primary, runs the mandatory transaction modules with
  `-n 0`, and always removes the test volumes.
- `external-smoke.yml` and `external-admin-e2e.yml` are manual
  `workflow_dispatch` workflows. Their target URLs and credentials are inputs
  to a future approved non-production run; no target is selected here.

PR #163 ran `backend`, `frontend`, and `secret-scan` successfully at its head
`6a987f671dd55ca3d096e66a2f6ebdd7289250a4`. Those checks are carried evidence
for the PR head. They are not a workflow run on merge SHA `443aefe`, and they
do not prove staging, browser role, restore, or go-live behavior. At packet
creation, GitHub reported no workflow run whose commit was exactly
`443aefe`.

PR #166 is a separate import-formatting change based on `443aefe`; its
backend, transaction, and secret checks are adjacent evidence for that PR,
not evidence that the current `main` merge itself has been redeployed or
revalidated. Its frontend check was still pending when this packet was
collected.

No local full backend/frontend/build run is claimed for this packet. The fresh
worktree had neither `backend/.venv` nor `frontend/node_modules`; installing
dependencies would be a separate local verification action and would not
replace exact-head CI or staging evidence.

## 3. Readiness and health contract

The source provides separate liveness and readiness boundaries:

- `GET /api/health/live` is process-only and returns a safe liveness response
  without probing transaction capability.
- `GET /api/health/ready` performs bounded dependency/readiness evaluation for
  database availability, transaction capability when mutations are required,
  schema/index readiness, a required co-located notification worker, required
  email configuration, and enabled authentication-security-event migration
  state.
- Readiness exposes safe capability states for transactions, production
  upload, payment, organization portal, notification worker, email delivery,
  and authentication security events. The source marks production upload,
  payment, and organization portal inactive by default.
- `scripts/staging_smoke.py` contains unauthenticated boundary checks for
  readiness, transaction capability, Admin authorization, public projection
  safety, legacy manual-transfer disablement, and public dashboard denial.

These are source contracts only at this SHA. No approved staging origin was
provided, so the smoke script was not run against an external target. A local
source contract or a disposable test response must not be reported as staging
health evidence.

## 4. Environment inventory without values

The tracked `.env.example` files identify configuration names but do not
provide production values. The inventory includes:

- frontend: `REACT_APP_PUBLIC_SITE_URL`, `REACT_APP_BACKEND_URL`, analytics and
  session-recording opt-ins, `REACT_APP_POSTHOG_HOST`, Brand Lab flag, and
  `GENERATE_SOURCEMAP`;
- backend: `APP_ENV`, `PUBLIC_SITE_URL`, `CORS_ORIGINS`, `MONGO_URL`, `DB_NAME`,
  `TRANSACTION_MUTATIONS_ENABLED`, notification/email flags, storage mode,
  proxy trust, auth/session/event settings, and server-side administrator,
  MongoDB, JWT, HMAC, and email secret names.

No value, credential, token, connection string, or target URL is copied into
this packet. A staging inventory still requires an approved environment,
redacted capture method, secret owner, and evidence custodian.

## 5. Artifact, rollback, and data-recovery identity

### Application rollback

The source predecessor immediately before the current `main` merge is
`c705a4413c02eef6b31f4e0e76e144733453e0af`. Because PR #163 changed only
documentation, it is a Git ancestry reference rather than a tested deployment
artifact. No release tag, image digest, hosting revision, or previous-known-
good staging artifact is recorded for `443aefe`.

When a staging release is approved, the release record must bind:

1. the exact built frontend artifact digest;
2. the backend image/package revision and source SHA;
3. the previous-known-good artifact identities;
4. the abort thresholds and accountable release owner; and
5. the redeploy-only rollback command and post-rollback checks.

The repository runbook prohibits rebuilding during rollback because dependency
resolution could change. This packet does not execute a rollback.

### Database and migration recovery

`doc/MIGRATION_BACKUP_RESTORE_RUNBOOK.md` requires capture, verification,
dry-run/apply, comparison, restore, and post-restore comparison on an approved
copy. The restore exercise is explicitly incomplete until an owner, timestamp,
result, and corrective action are recorded. No shared, staging, or production
database was accessed; no migration, backup, restore, or data mutation was
performed.

The transaction runbook keeps the tracked MongoDB replica sets limited to local
development and isolated CI. It does not supply staging persistence,
monitoring, backup/restore, incident ownership, or mutation enablement.

## 6. Observability and operational gaps

`DEC-OBS-001` approves a bounded provider-neutral sandbox observability
contract: redacted JSON Lines to local stdout/stderr, finite labels and
budgets, bounded exporter failure behavior, SLO/alert definitions, and
timestamped evidence. It does not select an external telemetry destination,
production credential, production on-call, staging environment, or go-live.

The current repository therefore has source-level observability and a sandbox
contract, but this packet has no evidence for:

- a staging or production telemetry destination and retention/access policy;
- a production monitoring dashboard, alert route, or independently exercised
  error budget;
- a named backup/restore, incident, release, or 24/7 on-call owner;
- measured staging latency, capacity, browser, transaction, worker, or
  restore outcomes; or
- external consumer/probe ownership and compatibility confirmation.

For the approved sandbox contract, Faiz is the delegated reviewer/responder
for the stated validation window. That limited delegation is not a
production on-call commitment and does not fill the broader DR-012/DR-014
ownership gaps.

## 7. Capability and stop-condition matrix

| Area | Current evidence | Stop condition before staging/production |
| --- | --- | --- |
| Public/API source | Source and CI workflow definitions are present | Exact selected SHA, built artifact, target origin, route/cache/security-header evidence |
| Database transactions | Local/CI replica-set procedure and fail-closed source contract | Approved staging replica-set topology, persistence, readiness, monitoring, and transaction evidence |
| Storage/upload | Provider-neutral boundary; production upload inactive | Provider, private persistence, ownership, scanning/quarantine, quota/retention, backup/restore, reconciliation, and owner approval |
| Payment | Provider-neutral online-payment direction; new manual transfer disabled | Gateway, state/webhook authentication, reconciliation, Finance/tax, refund execution, and activation approval |
| Retail checkout | Inactive/deferred | Separate approved implementation, account/ownership, reservation, fulfillment, tax, payment, and readiness gates |
| Migration/data | No target or mutation used | Named target/window/owner, backup custody, dry run, validation, rollback, restore, and independent review |
| Browser/roles | Hermetic CI contracts exist on relevant PR heads | Approved staging URL, seeded role accounts, real-role/browser run, human screen-reader review, and exact evidence SHA |
| Observability | Sandbox contract and source-level redacted telemetry | Named destination/access/retention, alert route, SLO evidence, capacity result, and accountable operations owner |
| Release/rollback | Git ancestry and runbook only | Immutable artifact/tag, previous-known-good identity, rollback exercise, and handover acceptance |
| Candidate decision | DR-001 remains open | Project Owner records exact SHA, scope, effective time, owners, verifier, exclusions, and accepted risks |

Any missing item above is a stop condition, not an invitation to infer a
provider, threshold, secret, owner, or production policy.

## 8. Handover

### Changed

- `docs/implementation/production-readiness/phases/G4-STAGING-OPS-ROLLBACK-EVIDENCE-2026-08-06.md`

### Intentionally unchanged

- all backend and frontend source, tests, dependencies, and lockfiles;
- all workflows, deployment configuration, environment files, migrations,
  database data, providers, credentials, and secrets;
- canonical Master Spec, Document Register, Decision Register, ADRs, and
  runbooks;
- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` and the
  existing G1–G4 task cards;
- staging/production environments and external targets.

### Verification

- Fresh `origin/main` fetch and exact-SHA/worktree/divergence checks: passed.
- Changed-path and parent-diff inspection: passed; the baseline merge delta is
  documentation-only.
- Toolchain/manifest/hash inventory: captured without secret values.
- `git diff --check`: to be run after this packet is staged.
- Documentation lint and staged secret scan: to be run before any commit.
- Local full backend/frontend/build and external smoke: not run; no fresh
  dependencies or approved external target were available in this worktree.

### Risk and rollback

This packet changes no runtime, data, dependency, or environment state. Its
rollback is a normal revert of the documentation commit; no database or
deployment rollback is required.

The main risk is evidence staleness: PR checks, local contracts, and source
configuration can change or omit environment behavior. The exact SHA and all
limits above must be refreshed before a later candidate decision.

### External actions still requiring approval

Project Owner selection of DR-001, independent release review, staging access
and data policy, artifact publication, backup/restore exercise, migration
execution, provider selection/activation, secret use or rotation, deployment,
production-readiness approval, and go-live remain outside this packet.

<!-- markdownlint-enable MD013 MD060 -->
