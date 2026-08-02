# PHASE-08A — Liveness and Readiness Health Task Card

Status: **bounded source implementation complete — environment evidence pending**
Branch / worktree: `fix/backend-readiness-health` /
`Niuva-worktrees/backend-readiness-health`

## Objective

Make liveness process-only and make readiness reflect fresh, secret-safe health
for every currently required dependency without selecting a provider, worker
topology, deployment environment, or production policy.

## Authority and dependency policy

- `ADR-001` requires transaction capability to fail closed for transaction
  mutations and permits readiness to report that capability without secrets.
- `PHASE-08A` requires failed or stale required dependencies to prevent a ready
  response, but its register does not itself authorize production operations.
- The user authorized continuing Feature 7.1 source work on 2 August 2026.
- `DEC-READY-01` was explicitly approved on 2 August 2026 for source and tests.
  It defines required-dependency flags, bounded freshness/timeouts,
  single-flight publication, worker heartbeat, and unknown diagnostics.

## In scope

- Keep `/api/health/live` independent of the database and every capability.
- Perform a fresh database ping for every readiness request.
- Use transaction evidence no older than 10 seconds and schema/index evidence
  no older than 60 seconds; do not rely on unbounded startup-cached state.
- Refresh transaction evidence from the application-owned five-second loop so
  mutation safety does not depend on an external readiness caller.
- Bound ping, transaction, schema, and total probe duration according to
  `DEC-READY-01`, and share concurrent refresh work through single-flight.
- Publish monotonic generations so older results cannot overwrite newer
  failure evidence; the route does not directly mutate transaction-guard state.
- Fail closed for probe exceptions using bounded public reason/status values.
- Require an enabled, running, non-completed worker task with an independent
  five-second heartbeat only when the existing worker-required flag is active.
- Require configured email-provider capability only when the existing
  email-required flag is active; do not contact or activate a provider.
- Preserve required authentication-security-event readiness behavior.
- Return an explicit allowlisted response without connection details,
  exception text, credentials, keys, provider payloads, or customer data.

## Explicit exclusions

- No provider selection, provider network health call, credential change,
  notification-worker topology, scheduler, telemetry, alert, SLO, SLA,
  capacity, retry, or production routing change.
- No migration, index apply/repair, backfill, cleanup, database mutation,
  shared/staging/production execution, deployment, activation, or go-live.
- No change to the meaning of inactive upload, payment, organization-portal,
  or optional notification capabilities.
- No commit, push, PR, or merge unless separately requested.

## Acceptance criteria

1. Liveness remains 200 without touching database/client/provider/worker state.
2. Readiness pings the live database on each request and uses transaction and
   schema/index evidence within the approved bounded age.
3. A failed/stale required dependency returns 503; an inactive optional
   dependency does not.
4. Required worker readiness rejects disabled, stopped, stale, missing, or
   completed tasks without rejecting a live task during a slow batch.
5. Required email capability rejects missing configuration without exposing the
   configuration value or contacting the provider.
6. Probe failures and malicious exception messages never enter the response.
7. Existing `/api/health` compatibility remains unchanged.

## Minimum verification

- Focused health, database-capability, and schema-readiness tests.
- Full backend suite, compile, Black, isort, mypy, dependency integrity/audit,
  and `git diff --check`.
- Final probe freshness, fail-closed, response privacy, and scope review.

## Local implementation evidence — 2 August 2026

- Added a bounded read-only probe coordinator with fresh ping, expiring
  transaction/schema evidence, timeouts, single-flight work, and monotonic
  publication that rejects stale overwrite.
- Kept liveness process-only and preserved the legacy health projection.
- Added fail-closed public projections for transaction and schema diagnostics,
  with explicit response allowlists and malformed-evidence coverage.
- Added an independent worker heartbeat and coverage for disabled, stopped,
  stale, future, missing, completed, and slow-batch task states, plus required
  email-configuration coverage without a provider call or secret exposure.
- Added the readiness module and tests to the repository's focused mypy,
  Black, and isort CI scopes.
- Focused readiness/schema/capability tests: `36 passed`.
- Complete backend suite: `686 passed, 14 skipped, 14 subtests passed`.
- Compile, critical Flake8, focused mypy, Black, isort, `pip check`,
  `pip-audit`, and `git diff --check`: passed.
- No database mutation, migration/index execution, shared-environment probe,
  provider activation, commit, push, PR, merge, deployment, or go-live was
  performed.

## Remaining risks

- Required-versus-optional semantics are approved by `DEC-READY-01`; each
  environment must still supply reviewed flag values.
- Provider reachability is intentionally not checked; configured capability is
  not delivery evidence.
- Named traffic-routing/on-call ownership, telemetry destination, SLO,
  alerting, and staging-like evidence remain blocked by `DR-012`/`DR-014`.
