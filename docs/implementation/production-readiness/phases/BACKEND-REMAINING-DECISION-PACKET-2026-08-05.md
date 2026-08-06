# Backend Remaining Decision Packet — 5 August 2026

Status: **prepared for owner and specialist input; no implementation or
operational approval is granted by this packet**

Selected baseline: `origin/main`
`81da28f02fafd7c11cdcdb3a99eee50d5840aca2`.

This packet follows the current backend source reconciliation. The bounded
runtime slices represented by PRs #90, #98–#101, #103–#106, #109–#110, #121,
and #125–#128 are already in the selected baseline. The packet therefore
captures only residual work that cannot be closed from source and local tests
alone.

## Decision rule

Each row needs an explicit decision record, named accountable owner, exact
scope, evidence target, and stop condition before implementation or execution.
An approved source contract does not authorize migration, provider activation,
shared/staging/production access, deployment, readiness, or go-live.

## Existing bounded delegation

- Yanuar delegated Faiz the Accountable/Product Owner and
  Technical/Release Owner responsibilities for Commerce Transaction 1A through
  30 August 2026.
- G7-B sandbox validation is approved for synthetic data and the approved local
  PowerShell SecretStore only. Provider activation, production credentials,
  migration, deployment, and go-live remain separate gates.
- These bounded records support sandbox task-card ownership; they do not close
  the residual production, migration, provider, topology, or independent-review
  inputs in the matrix below.

## Residual decision matrix

| ID | Area | Current state | Required input before next action | Explicit stop condition |
| --- | --- | --- | --- | --- |
| BDR-001 | Notification and worker operations | Canonical notification, outbox, worker, retention, and readiness foundations are in `main`; operating topology and objectives remain open. | Select worker/scheduler topology, telemetry destination and retention/access, SLO/SLA, capacity threshold, alert destination, responder, escalation, and poison-entry handling. | Do not add topology, scheduler, telemetry destination, alert provider, or production worker wiring from this packet. |
| BDR-002 | Authentication security events | Dedicated redacted event foundation and Migration 010 source are merged but disabled by default. | Name primary/backup security owner, key custodian/provider, cleanup reviewer/owner, alert owner, outage behavior, and exact activation evidence. | Do not enable the feature, use a real key, execute Migration 010, or add an analyst API. |
| BDR-003 | MFA and privileged authentication | Internal MFA direction is approved, but implementation parameters and recovery ownership remain unresolved. | Choose factor and enrollment contract, key/encryption custody, pre-auth and step-up semantics, recovery/support boundary, events, rollout, and verification owner. | No MFA source implementation or password-only cutover change until the decisions are recorded. |
| BDR-004 | Migration, backup, restore, and topology | Migration candidates have dry-run/stop-rule code evidence; no approved data-bearing target/window or restore proof exists. | Name isolated target, approved window, backup location/checksum, restore reviewer, dry-run/apply/second-run/rollback procedure, and evidence custodian. | No migration apply, backfill, index mutation, rename, cleanup, restore, or shared-data connection. |
| BDR-005 | Abuse-control production operation | Bounded MongoDB limiter source is merged; production proxy, outage, TTL, retention, monitoring, and ownership are open. | Confirm trusted-proxy topology, outage behavior, TTL/index operation, retention, monitoring, alert owner, and multi-worker evidence environment. | Do not change thresholds or enable production topology from the source branch. |
| BDR-006 | Retail transaction activation | Provider-neutral checkout contract is merged; payment, fulfillment, reservation, tax, Finance, and production activation remain separate gates. | Approve exact next source scope and sandbox evidence packet; separately name provider/Finance/Operations decisions for any activation. | Do not activate payment/storage/fulfillment, create production credentials, or enable Retail mutations. |
| BDR-007 | Compatibility and retained history | Compatibility endpoint register and legacy read-only boundaries are merged; external consumers and sunset evidence remain unverified. | Decide only when needed: retained/read-only/deprecated/tombstone treatment, external-consumer owner, communication, monitoring, rollback, and exact route scope. | Do not remove, redirect, or change legacy routes based only on repository search or an expired header. |

## Decision owners to record

| Responsibility | Named owner | Required evidence |
| --- | --- | --- |
| Product/implementation scope | Pending explicit record | Exact files/routes, inclusions, exclusions, acceptance criteria |
| Technical/source reviewer | Pending explicit record | Current-head review and proportional tests |
| Security/data/privacy | Pending explicit record | Safe fields, retention, key/access boundary |
| Database/migration | Pending explicit record | Target, backup, restore, dry-run, rollback evidence |
| Operations/reliability | Pending explicit record | Topology, telemetry, SLO/SLA, alert/on-call evidence |
| Finance/provider | Pending explicit record | Cost ceiling, provider sandbox/production separation, reconciliation boundary |

## What can proceed without these decisions

- Revalidate already merged backend source against a fresh selected SHA.
- Correct stale documentation and provenance references using exact Git
  evidence.
- Add bounded tests for an already approved, unchanged contract when a task
  card names the exact files and no policy is inferred.
- Prepare a new task card after an owner records an exact source scope.

## What cannot proceed

- New production payment, storage, fulfillment, or email provider adapters.
- Migration apply, index changes, historical backfill/repair, cleanup, or
  restore against data-bearing targets.
- Deployment, production credential handling, readiness promotion, or go-live.
- MFA implementation, security-event activation, analyst access, or worker
  topology wiring without the decisions above.

## Handover requirement

Any future slice must cite this packet or the superseding decision record,
select a fresh `origin/main` SHA, create a new task card, state exact files,
run proportional tests and quality gates, and preserve the merge gate. This
packet itself is documentation evidence only.
