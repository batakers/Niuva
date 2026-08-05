# Staging decision packet

Status: Open decision packet. This document is a provider-neutral execution
contract; it is not a provider selection, deployment approval, production-ready
claim, or go-live authorization.

The repository does not currently select a hosting provider or contain an
approved staging URL. The external workflows therefore accept only an approved
target at dispatch time and fail closed for anything that is not a
credential-free HTTPS origin. Do not put a target URL, secret, or operator
credential in this repository.

## Decision required before staging execution

| Decision | Required contract | Current state | Required owner/evidence |
| --- | --- | --- | --- |
| Staging target | One frontend origin and one backend origin, both exact HTTPS origins without paths, credentials, query strings, or fragments | Open; no URL is selected here | Product/technical approver records the origins in the release record; GitHub Environment `staging` approval is required before a workflow job starts |
| Hosting/provider | A provider-neutral deployment that can serve the SPA, route `/api` to the backend, terminate TLS, inject secrets, persist MongoDB, emit logs/metrics, and redeploy an immutable previous artifact | Open; no provider is selected here | Technical owner records the selected provider separately; this packet does not choose one |
| Environment access | GitHub Environment `staging` with required reviewers; runner can reach both approved origins | Open | Staging operator records the environment approval and reachability evidence |
| Data policy | Disposable or approved staging data, no production credentials, no real customer test data unless separately authorized | Open | Data owner records the data classification and cleanup decision |
| Rollback artifact | Previous known-good frontend/backend artifact identity is recorded before the run | Open per release | Rollback owner attaches the artifact identifier and verification result |
| Restore drill | Restore-tested backup evidence for the target data boundary, or an explicit no-write exception for a read-only run | Open | Restore evidence owner attaches the snapshot verification, restore comparison, timestamp, and corrective action |
| On-call and alerting | Named on-call, rollback owner, restore owner, alert route, and incident commander | Open | Operations owner completes the owner matrix below before execution |

An open row is a stop condition. A green workflow run cannot close an open
decision or authorize production.

## Approved target contract

The release record must contain the actual values supplied to the workflow,
without credentials:

```text
Release commit SHA: <record at execution time>
Frontend origin:    <approved value recorded outside source control>
Backend origin:     <approved value recorded outside source control>
GitHub environment: staging
Environment approver: <named person/team>
Target approval reference: <ticket/change/release record>
```

The angle-bracket fields are release-record fields, not executable URLs. The
workflow inputs are the only acceptance-path target values. If the values are
not approved, do not dispatch the workflows.

Origin rules:

- `Frontend origin` is the public site origin used for the deployed SPA and for
  `REACT_APP_PUBLIC_SITE_URL`.
- `Backend origin` is the API service origin used for
  `REACT_APP_BACKEND_URL`; the frontend appends `/api`.
- The backend must set `PUBLIC_SITE_URL` and `CORS_ORIGINS` to the exact
  frontend origin. Credentialed CORS must never use `*`.
- The two origins must be distinct, externally reachable from the GitHub-hosted
  runner, and serve valid certificates. The workflows reject HTTP, local or
  placeholder/test hosts, credentials, and non-root paths.
- The frontend build must already contain the approved backend origin. Setting
  `PLAYWRIGHT_API_URL` in a workflow does not rewrite a deployed frontend.

## Environment and secret injection

The staging application receives backend configuration from the selected
provider's secret/configuration mechanism at process start. The mechanism must
support redaction, rotation, audit history, and separate staging/production
scopes. Do not copy a local `.env` file to a host and do not print these values
in CI logs.

At minimum, the deployment inventory must account for:

- `MONGO_URL`, `DB_NAME`, `JWT_SECRET`, `AUTH_SESSION_CSRF_KEY`;
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and any approved password-policy material;
- `PUBLIC_SITE_URL`, `CORS_ORIGINS`, `APP_ENV`, and proxy-header policy;
- `RESEND_API_KEY`, `SENDER_EMAIL`, and notification requirements if email is
  enabled for staging;
- storage, authentication-event, and worker flags, each with an explicit
  enabled/required decision.

The GitHub Environment `staging` may contain only the disposable role-matrix
credentials needed by `external-admin-e2e`:

```text
E2E_SUPER_ADMIN_EMAIL / E2E_SUPER_ADMIN_PASSWORD
E2E_SALES_EMAIL       / E2E_SALES_PASSWORD
E2E_WAREHOUSE_EMAIL   / E2E_WAREHOUSE_PASSWORD
E2E_CONTENT_EMAIL     / E2E_CONTENT_PASSWORD
E2E_PRODUCTION_EMAIL  / E2E_PRODUCTION_PASSWORD
```

These accounts must be seeded in the approved staging database, be scoped to
the role named by the variable, and be disposable verification accounts. A
missing pair fails the workflow; it is never silently skipped. Production
operator credentials and provider secrets are not accepted as substitutes.

## MongoDB and readiness contract

Staging mutation flows require a persistent authenticated MongoDB replica set.
The connection inventory must identify the replica-set name, persistence
boundary, TLS/authentication policy, backup scope, and database owner without
recording credentials. A standalone MongoDB deployment is not evidence for
transaction-dependent staging flows.

Before enabling `TRANSACTION_MUTATIONS_ENABLED`, the deployment operator must
prove all of the following on the deployed commit:

1. `GET /api/health/live` returns HTTP 200 with `{"status":"ok"}`.
2. `GET /api/health/ready` returns HTTP 200 with `status=ready`,
   `database=ready`, `schema.ready=true`, and
   `transaction_mutations=ready` when transaction-dependent mutations are in
   the candidate scope.
3. The readiness response shows no missing or retired required indexes.
4. A replica-set capability probe has succeeded recently; a stale or failed
   probe is a stop condition.
5. Any required notification worker and email capability is explicitly either
   disabled by decision or ready according to the readiness response.

The checked-in `scripts/staging_smoke.py` verifies the unauthenticated portion
of this contract and also confirms that protected admin surfaces do not become
public. It does not replace database, backup, restore, or human approval
evidence.

## External test prerequisites

Before dispatching either workflow:

- the deployed frontend and backend correspond to the release SHA recorded in
  the release record;
- both target origins are approved and reachable from a GitHub-hosted runner;
- the frontend was built with the same backend origin supplied to the workflow;
- backend CORS permits the exact frontend origin with credentials and does not
  use a wildcard;
- TLS certificates are valid, and the edge does not downgrade or redirect the
  smoke request to HTTP;
- staging data is classified and cleanup is assigned;
- all five disposable role accounts exist and their role assignments were
  independently checked;
- the rollback artifact, rollback owner, restore evidence owner, on-call, and
  independent verifier are named in the release record;
- no migration apply, production secret rotation, provider activation, or
  production deployment is part of the run.

## Evidence contract

Each run must retain a secret-safe evidence record containing:

- workflow name, run URL, commit SHA, UTC start/end time, and approver;
- approved frontend/backend origins (origins only, never credentials);
- smoke JSON and JUnit output from `external-smoke`;
- Playwright traces/screenshots and role-matrix output from
  `external-admin-e2e`;
- target health/readiness result, CORS result, and any failed response status;
- rollback artifact identity and restore-drill reference;
- independent verifier, disposition, and all open stop conditions.

The workflow artifacts are evidence inputs, not evidence of production
readiness by themselves. An absent artifact, missing owner, or unapproved target
keeps the candidate blocked.

## Owner matrix

The role names below are mandatory. A named person or accountable team must be
recorded for each role before dispatch; assigning the same person to multiple
roles requires an explicit risk acknowledgement.

| Role | Responsibility | Required evidence |
| --- | --- | --- |
| Release owner | Selects the candidate SHA and starts/pauses the run | Release record, SHA, target approval, final disposition |
| Staging operator | Confirms configuration, access, and cleanup window | Environment inventory and workflow run URL |
| Rollback owner | Decides and executes code/artifact rollback when stop criteria fire | Previous artifact, timestamp, rollback verification |
| Restore evidence owner | Owns backup custody, restore exercise, comparison, and corrective action | Snapshot/restore evidence and comparison result |
| Database owner | Confirms replica-set, persistence, schema/index, and backup state | Readiness output and database evidence |
| On-call / incident commander | Receives alerts, coordinates incident response, and communicates status | Alert acknowledgement and incident timeline |
| Security/secret custodian | Confirms secret injection, access scope, rotation, and redaction | Secret inventory metadata, never secret values |
| Independent verifier | Re-runs or reviews the acceptance evidence | Signed review and exceptions |
| Product/technical approver | Accepts scope, data policy, and unresolved decisions | Approval reference; does not imply go-live |

## Proposed SLO and alert baseline

The following is a proposed staging/release-observation baseline, not an
approved production SLO. The operations owner must approve thresholds and map
each alert to a real telemetry destination before production planning.

| Signal | Proposed threshold | Action | Owner |
| --- | --- | --- | --- |
| API liveness availability | `<99.5%` in the observation window | Stop rollout and investigate edge/process health | On-call |
| API 5xx rate | `>2%` for 5 consecutive minutes | Page on-call; rollback if confirmed release-caused | On-call + rollback owner |
| API p95 latency | `>1,000 ms` for 10 minutes or `>50%` over baseline | Hold rollout; rollback if sustained and release-caused | On-call |
| Readiness | `status != ready` for 5 minutes | Stop promotion; inspect Mongo/schema/worker dependencies | Database owner |
| Transaction capability | `transaction_mutations=unavailable` when required | Disable mutation promotion; do not fall back | Database owner + rollback owner |
| Backup freshness | Older than the approved RPO | Stop any data-changing release | Restore evidence owner |
| Browser/client errors | New blocking error or failed role-matrix assertion | Hold/rollback and attach trace | On-call + independent verifier |

Alert routing, escalation timing, and production values remain open decisions.
No alert destination is implied by the presence of this table.

## Rollback and restore stop rule

Rollback is an artifact operation, not a rebuild:

1. The rollback owner stops promotion and records the trigger, time, and
   affected release SHA.
2. Redeploy the last known-good frontend/backend artifact identified before the
   run; do not rebuild from a moving branch.
3. Re-run liveness, readiness, CORS, unauthenticated admin-boundary smoke, and
   the smallest approved browser check.
4. Restore database state only when a migration or data-corruption decision
   explicitly requires it and the restore evidence owner confirms a validated
   backup. Never edit live aggregates manually as a rollback mechanism.
5. Attach the rollback and, if used, restore comparison evidence to the release
   record. Keep the incident open until the on-call and independent verifier
   agree on disposition.

The repository's `MIGRATION_BACKUP_RESTORE_RUNBOOK.md` defines the capture,
verify, compare, restore, and compare-again procedure. G4 does not execute a
migration or restore against shared/staging/production data.

## Decision outcome

Until the open decisions above have named owners and actual environment
evidence, the only valid outcome is **staging package prepared / deployment not
executed / production readiness not established**.
