# DR-012 Staging, Continuity, and Release Ownership Packet — 6 August 2026

<!-- markdownlint-disable MD013 -->

**Status:** Decision input / context only. This packet is not a deployment,
migration, restore, production-readiness, or go-live approval.

**Observed current head:** `origin/main` at
`f43eea6bd633b4250180e4373a62e5fb21fe14fa`, with Git tree
`6d2154bd52785bbc749345c0346651f9752d1646`, revalidated on 6 August 2026 in
fresh worktree `C:\tmp\niuva-continuation-current-main-20260806`.

The earlier packet baseline `c84743c8fcbc158721037b3c02dc0dff0c872242` is
historical. Its diff to the current head spans 78 paths and includes backend,
frontend, workflow, test, documentation, and staging-smoke changes; therefore
historical source/test observations must not be treated as exact-`f43eea6`
proof. The current-main quality path has nevertheless been exercised by PR
[#187](https://github.com/batakers/Niuva/pull/187) at head `b690236`, whose only
change beyond `f43eea6` is documentation; backend, frontend, and secret-scan
checks passed. This packet still records no external-environment evidence.

## 1. Decision boundary

DR-012 is partially assigned but not executable. The repository records Faiz as
owner of migration, backup/restore, rollback, maintenance-window authority, and
evidence custody. It does not yet record the complete staging-like topology,
RPO/RTO, secret-evidence format, incident/release/on-call owners, target,
window, independent verifier, or approved execution conditions.

This packet makes those missing fields explicit. It does not fill them by
inference. A task card, green CI, local Compose file, or provider-neutral ADR
cannot substitute for the Project Owner's operational decision.

## 2. Applicable authority and limits

| Authority | What it governs here | What it does not authorize |
| --- | --- | --- |
| `docs/NIUVA_MASTER_SPEC.md` | Fail-closed transaction boundary, single-origin assumptions, secret hygiene, provider-neutral storage/payment, and activation gates | Host/provider selection, deployment, migration, or go-live |
| `ADR-001` | Replica-set capability and no non-atomic fallback for transaction-required mutations | A shared/staging/production database target or deployment |
| `ADR-002` | Private provider-neutral storage port and inactive production upload boundary | Storage provider, retention/quota/RPO/RTO, or activation |
| `ADR-003` / `DEC-PAY-02` | Provider-neutral payment boundary and inactive legacy manual transfer | Payment gateway, Finance operation, or payment activation |
| `DEC-READY-01` | Bounded source/test readiness probes and secret-safe diagnostics | Routing owner, staging target, production health, or go-live |
| `DEC-OBS-001` | Approved provider-neutral sandbox observability values and evidence contract | Telemetry vendor, production credentials, alert activation, or deployment |
| `doc/PRODUCTION_DEPLOYMENT.md` | Provider-neutral release configuration, SPA routing, headers draft, pre/post checks, and rollback procedure | A confirmed host/domain, actual environment values, deployment, or production approval |
| `DECISIONS_REQUIRED.md` DR-012 | Required owner decision for topology, environment/secret evidence, RPO/RTO, backup/restore, migration, rollback, incident, release, and on-call | Execution of any of those operations |

The production-readiness roadmap and verification matrix remain context only.

## 3. Current repository evidence

### 3.1 Deployment and artifact inventory

The fresh exact-`f43eea6` current-main worktree contains local/test and CI
material, but no
provider-specific deployment source of truth:

| Observed item | Evidence | Disposition |
| --- | --- | --- |
| Transaction Compose files | `docker-compose.transaction.yml` and `docker-compose.transaction-test.yml` | Local/isolated transaction test support; not a staging or production topology |
| CI workflows | `.github/workflows/quality-gates.yml`, `external-smoke.yml`, `external-admin-e2e.yml`, and `transaction-tests.yml` | Verification workflows; no deployment/promotion workflow or release artifact custody |
| Frontend dependency lock | `frontend/package-lock.json` | Supports reproducible npm install subject to DR-013 policy; not an immutable release artifact |
| Backend dependency input | `backend/requirements.txt` | Contains exact and range constraints but no separately recorded Python lock/artifact policy |
| Environment templates | `frontend/.env.example`, `backend/.env.example` | Names/placeholders only; no approved staging/production values or custody evidence |
| Provider manifests | No Vercel, Netlify, Render, Nginx, Kubernetes, Helm, Terraform, or equivalent deployment manifest was found in the inspected tree | Deployment target remains unselected and unproven |
| Release identity | No tracked `VERSION`, `CHANGELOG`, or release manifest was found by the inspected filename search | Versioning/artifact policy remains a DR-013 dependency |

### 3.2 Existing CI and runbook evidence

The current quality workflow observes, but does not establish, a toolchain:

- backend uses `actions/setup-python` with Python `3.14.3`, installs
  `backend/requirements.txt`, runs `pip check`, `pip_audit`, compile/lint/type/
  formatting checks, and the complete backend suite;
- frontend uses `actions/setup-node` with Node `24`, `npm ci`, production
  dependency policy, frontend tests, build, Playwright browser installation,
  and hermetic browser contracts;
- the workflow has timeouts and read-only repository permissions, but does not
  publish a signed/attested immutable release artifact or record promotion,
  rollback custody, staging origin, or production environment identity;
- `doc/PRODUCTION_DEPLOYMENT.md` requires a confirmed HTTPS public origin,
  backend origin, exact CORS, TLS/proxy policy, backup/restore proof, release
  commit identity, and rollback artifact, but leaves the host/provider and
  values to a later approved operation.

These are repository observations, not evidence that a staging environment or
production topology exists.

## 4. Required DR-012 owner fields

The following table is intentionally a decision form. `Open` means no
repository evidence or owner approval was found; it is not a recommendation.

| Field | Required decision/evidence | Current state | Accountable owner / verifier |
| --- | --- | --- | --- |
| Candidate SHA | Immutable SHA and scope from DR-001 | Open; current head is only observed | Project Owner / independent reviewer |
| Staging-like target | Host/runtime class, isolation boundary, access path, expiry, and data policy | Open; no target in repository | Project Owner + Operations / independent verifier |
| Frontend/API origins | HTTPS public origin, backend origin, DNS, redirect, exact CORS, cookie and CSRF origin policy | Open; templates contain development placeholders | Deployment/Security owner / security verifier |
| TLS/proxy | TLS termination, trusted proxy headers, HSTS timing, security headers, direct-route/API routing | Draft runbook only; no environment capture | Deployment/Security owner / independent security reviewer |
| Database topology | Replica-set target, persistence, transaction capability, index/schema readiness, access and isolation | Local `rs0`/`rs-test` evidence only; no shared target | Backend/Operations owner / data verifier |
| Data policy | Synthetic/seeded data, customer-data exclusion, masking, retention, cleanup, and evidence redaction | Open | Data owner / privacy verifier |
| RPO/RTO | Recovery point/time objectives, measurement method, breach escalation, and expiry | Open per DR-012 | Operations/Data owner / independent reviewer |
| Backup custody | Encrypted backup class, location class, access list, checksum, retention/destruction, restore owner | Faiz owns evidence custody in the tracker; target/custody proof absent | Faiz + named backup owner / independent restore verifier |
| Restore rehearsal | Approved isolated target/window, aggregate-only evidence, success criteria, and stop conditions | Not authorized or run | Faiz + Backend / independent verifier |
| Migration window | Exact migration set, dry-run/apply boundary, maintenance window, preflight, rollback and abort criteria | Apply remains prohibited; target/window open | Faiz / independent migration verifier |
| Release artifact | Build input SHA, runtime versions, dependency lock, checksum/attestation, storage/custody, promotion identity | No release manifest/artifact custody recorded | Release owner / independent reviewer |
| Rollback | Last-known-good artifact, API compatibility, database/data split, abort trigger, cache handling, and owner | Runbook procedure exists; owner/artifact proof open | Faiz + Release owner / independent verifier |
| Incident/on-call | Incident commander, escalation, alert destination, coverage window, handoff, evidence retention | Open | Operations/Security owner / independent reviewer |
| Secret evidence | Secret-manager class/reference without values, rotation/rollback custody, access review, redacted capture | Open; no values may enter Git or packet | Security owner / independent security verifier |
| Provider boundary | Storage/payment/email/shipping providers and activation status, if any | Deliberately unselected under DR-011 | Product/Finance/Operations owners / independent reviewer |
| Final handover | Runbook revision, owner sign-off, evidence location, risk expiry, and stop/go record | Open | Project Owner / final independent reviewer |

## 5. Verification matrix mapping

| Control | Required evidence | Current result |
| --- | --- | --- |
| V-00-03 migration/live schema | Per-migration backup, dry run, validation, rollback, restore, owner, and stop rule | Local read-only preflight exists; target, backup/restore, and execution remain blocked by DR-012 |
| V-02-02 migration/backup/restore | Isolated replica-set rehearsal with aggregate-only proof and history preservation | Planning package exists; no approved target/window or rehearsal result |
| V-06-01 QA/release/artifact | Exact SHA/runtime, clean install, tests, browser, artifact, security/dependency/performance signals, expected-skip enforcement | CI checks are partial repository evidence; policy, artifact, public origin, browser runner, and environment gates remain open |
| V-07-01 deployment/operations | Immutable promotion, same-origin/TLS/proxy, controlled config, recovery drills, and handoff | Blocked by DR-012 and environment; no deployment performed |
| V-08-01 reliability/observability | Redacted telemetry, alerts, readiness, worker behavior, capacity/load and performance budgets | Sandbox contract/source evidence exists; production destination, ownership, alert delivery, and load environment remain open |
| V-10-01 final candidate | Full current Phase 0–9 evidence at one exact candidate | Not eligible; DR-001, DR-002, DR-011–014, environment, and independent review remain open |

## 6. Required decision sequence

After the Project Owner and independent reviewers fill the fields above, the
safe order is:

1. select and freeze one exact candidate under DR-001;
2. assign DR-012 owners, evidence custody, target, data policy, RPO/RTO, and
   stop/abort conditions;
3. approve an isolated, non-production environment and non-secret origin;
4. produce an attributable build artifact and redacted environment inventory;
5. authorize only the isolated backup/restore and migration rehearsal required
   by the applicable runbooks;
6. collect exact-origin health, browser/role, cookie/TLS, readiness, alert,
   rollback, and handover evidence;
7. independently review residual risks before any separate DR-015 decision.

None of these steps is executed by this packet. Provider activation, real
credentials, production data, migration apply, deployment, and go-live remain
outside scope.

## 7. Handover

- **Changed:** no runtime or operational state; this packet and its task card
  only.
- **Intentionally unchanged:** source/tests, dependencies, CI, manifests,
  configuration values, credentials, providers, databases, migrations, shared
  data, deployment state, canonical decisions, ADRs, and runbooks.
- **Verification performed:** fresh exact-`f43eea6`/tree
  `6d2154bd52785bbc749345c0346651f9752d1646` worktree check and read-only
  inventory of workflow, dependency, environment-template, artifact, and
  deployment files. No environment command or data-bearing operation ran.
- **Rollback:** revert the documentation commit; no runtime/data rollback is
  needed.
- **Readiness verdict:** **NOT READY** for production, deployment, activation,
  or go-live; no percentage is assigned.
- **Next owner action:** complete the open DR-012 fields and identify the
  independent verifier. Until then, the correct status is
  `blocked_by_decision`/`blocked_by_environment`, not an invented topology or
  successful deployment claim.

<!-- markdownlint-enable MD013 -->
