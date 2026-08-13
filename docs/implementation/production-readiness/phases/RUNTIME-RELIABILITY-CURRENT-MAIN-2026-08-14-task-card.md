# Runtime Reliability Current-Main Audit Task Card

<!-- markdownlint-disable MD013 -->

**Lane:** Readiness and reliability.

**Branch/worktree:** `audit/backend-runtime-reliability` /
`Niuva-worktrees/backend-runtime-reliability`.

**Stacked base:** `audit/backend-quality-evidence-current-main` at `c53f06d`
so tracker edits remain ordered behind PR #250. The audited runtime baseline is
`origin/main` at `15b759a` plus the separately reviewed stacked audit lineage.

## Brief

| Field | Contract |
| --- | --- |
| Title and objective | Revalidate process liveness, required-dependency readiness, notification-worker delivery safety, graceful shutdown, bounded telemetry, and read-only query/load evidence; fix only concrete repository defects that can be proven locally. |
| In scope | `/api/health/live` and `/api/health/ready`; MongoDB, transaction, schema/index, storage, email, and required-worker readiness; notification claim/lease/renewal/retry/backoff/exhaustion; worker drain and shutdown; structured-log redaction; timeouts and resource/cardinality bounds; pagination/index contracts; bounded read-only load probe; local dependency-unavailable simulation. |
| Out of scope | Shared/staging/production probes; provider selection or activation; external telemetry/exporter, credential, alert destination, production topology, migration/index mutation, data-bearing cleanup, load against an unapproved target, deployment, production-readiness declaration, and go-live. |
| Authority | `DEC-READY-01`, `DEC-OBS-001`, `DEC-DATA-003`, `ADR-001`, provider-neutral boundaries in `ADR-002`, bounded runtime scope in `ADR-005`, current source/tests/workflows, and the main readiness trackers. |
| Affected areas | Readiness/worker/observability source and tests only if a defect is reproduced; runtime audit packet; primary readiness, verification, and finding trackers. No provider or migration files. |
| Acceptance | Liveness remains process-only; readiness fails closed on every required unavailable/stale/timeout dependency without secret detail; disabled optional dependencies do not fail readiness; claims are fenced and bounded; retry/exhaustion is deterministic; shutdown drains within a bound; logs/metrics reject sensitive or unbounded fields; pagination/load probes stay read-only and bounded. |
| Minimum verification | Focused readiness, health, worker, notification, observability, schema, pagination, and load-probe suites; local unavailable/timeout simulations; compile, critical lint, scoped type/format checks; full backend; exact-head quality and transaction CI; `git diff --check`. |
| Owner and verifier | Codex is Driver; Backend/Platform/QA owners remain independent reviewers. Faiz remains the recorded bounded notification/observability owner; no production on-call role is inferred. |
| Commit/push/PR | Explicitly requested by the user on 14 August 2026 if the result is safe. No merge requested. |
| Remaining decisions | Deployment/on-call ownership, staging targets, provider reachability, storage provider/RPO/RTO, telemetry destination, production capacity/SLO evidence, index application, and production release remain separate gates. |

## Stop conditions

- Do not probe a shared, staging, or production dependency without an approved
  target and credentials.
- Do not make email-provider reachability a web-readiness dependency.
- Do not mutate indexes, schemas, notification records, or historical data.
- Do not emit raw exceptions, connection strings, recipient/customer data,
  identifiers, query strings, provider payloads, or secrets as evidence.
- Do not convert a local simulation, skipped check, or absent environment into
  production evidence.

## Rollback

Source corrections are ordinary commit reverts. Audit/tracker changes are
documentation-only. No database, object, provider, environment, or deployment
rollback is needed because none is authorized or contacted.

<!-- markdownlint-enable MD013 -->
