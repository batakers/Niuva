# DR-004 — Abuse-Control Operational Decision Packet

<!-- markdownlint-disable MD013 MD060 -->

**Status:** `OPEN / HUMAN_DECISION_BLOCKED`
**Date:** 2026-08-06 (Asia/Jakarta)
**Observed baseline:** `origin/main` at `c84743c8fcbc158721037b3c02dc0dff0c872242`
**Branch:** `codex/g16-dr004-abuse-control-20260806`
**Worktree:** `C:\tmp\niuva-g16-dr004-abuse-control-20260806`

## 1. Purpose and boundary

DR-004 is the operational decision gate for internet-facing authentication
abuse control. The bounded source contract is substantially implemented under
`ADR-005`: MongoDB single-document atomic counter operations, five failures per
normalized account, twenty failures per peer address, and a fixed fifteen-minute
window. Production behavior still requires an approved topology, trusted client
address contract, outage handling, retention, monitoring, and named ownership.

This packet makes those unresolved fields reviewable. It is not an ADR, does not
amend `DEC-AUTH-002`, `DEC-AUTH-006`, or `ADR-005`, and does not authorize source
implementation, migration, deployment, or production activation.

## 2. Authority and evidence sources

The authority order used for this packet is:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md` and DR-004 in
   `docs/implementation/production-readiness/DECISIONS_REQUIRED.md`
4. `DEC-AUTH-001`, `DEC-AUTH-002`, `DEC-AUTH-006`, and `ADR-005`
5. `AUTH_RECOVERY_RUNBOOK.md` and `AUTH_SESSION_RUNBOOK.md`
6. `FEATURE-1.5-auth-rate-limit-revalidation.md`, current source, and tests

Approved boundaries:

- `DEC-AUTH-002` rejects process-local buckets as production authority and
  keeps deployment topology, shared store, trusted proxy, thresholds, outage,
  retention, and ownership open.
- `DEC-AUTH-006` approves a provider-neutral distributed atomic interface,
  HMAC/pseudonymous normalized identifiers, account and client-address
  dimensions, generic public responses, HTTP 429 with `Retry-After`, and a
  server-enforced 60-second password-recovery resend cooldown.
- `ADR-005` supersedes the earlier threshold deferral only for the bounded
  implementation: MongoDB, 5 account failures, 20 peer failures, and a fixed
  15-minute window. Forwarded headers are ignored unless a separate trust
  contract exists.
- The runbooks require environment-specific authorization, transaction and
  backup evidence, dry run, validation, rollback, and handover. They do not
  grant production mutation or go-live authority.

## 3. Approved invariants that must not change

Any later authorized operational or source work must preserve:

- generic equivalent public behavior for known and unknown identifiers;
- HMAC/pseudonymous limiter identifiers rather than long-lived plaintext email
  or raw peer address keys;
- account/identifier and authoritative client-address dimensions;
- HTTP 429 and deterministic `Retry-After` behavior for blocked requests;
- no permanent account lockout caused by public traffic alone;
- the server-enforced 60-second recovery-resend cooldown;
- fail-closed or operation-specific behavior only after each operation's policy
  is explicitly approved;
- no trust in forwarded addresses until the ingress/proxy contract is recorded;
- privacy-safe logs, retention, deletion, and least-privilege operational access;
- customer, Admin, and recovery surfaces remain within their approved auth
  contracts.

## 4. Current implementation evidence

The following observations are bounded evidence at the current-main snapshot;
they are not production proof:

| Area | Current evidence | Readiness implication |
| --- | --- | --- |
| Login limiter | `backend/auth_rate_limit.py:47-132` uses HMAC-derived account/peer keys, fixed 15-minute windows, and MongoDB `find_one_and_update` upserts. | Bounded source behavior is present; real multi-worker race evidence is absent. |
| Public/recovery limiter | `backend/auth_rate_limit.py:137-280` uses MongoDB counters and atomic cooldown updates for public edges and recovery resend. | Source interface exists; operation-specific outage and broader budgets remain open. |
| Client address | `backend/server.py:1161-1163` uses `request.client.host` and does not consume forwarded headers. | Safe direct-peer default is evidenced; production ingress/proxy contract is not. |
| Thresholds | `ADR-005` records 5 account failures, 20 peer failures, and 15 minutes for the bounded implementation. | Source contract is bounded; production policy/ownership and other endpoint budgets remain open. |
| TTL schema | `backend/schema_manifest.py:55-62` declares TTL indexes for login and public rate-limit collections. | Declaration is not index-application or retention evidence; migration and deletion ownership remain open. |
| Store outage | Limiter database errors are not mapped by a separately approved operation policy. | Customer login, Admin login, and recovery behavior require explicit fail-safe decisions and fault tests. |
| Review evidence | Feature 1.5 records `23 passed` in its isolated review and explicitly notes missing real-Mongo concurrency, proxy, outage, TTL, monitoring, and owner evidence. | Passing isolated tests do not establish production readiness. |

## 5. Production scope to confirm

The owner must explicitly confirm which surfaces and environments are covered:

- customer login;
- Admin login;
- password-recovery request/resend;
- public contact and inquiry intake;
- any other anonymous or operational endpoint that uses the public limiter;
- disposable local evidence, staging-like rehearsal, or production candidate.

The bounded source thresholds must not be silently generalized to recovery,
contact, inquiry, or future endpoints. Each operation needs its own approved
budget and failure behavior.

## 6. Owner decision fields

### 6.1 Worker, ingress, and authoritative address topology

Record:

- worker/process/instance count and scaling model;
- ingress, load balancer, proxy, TLS termination, and network boundaries;
- exact forwarded-header trust chain and which hop may set/overwrite it;
- authoritative client-address field and spoofing/absence behavior;
- internal versus public traffic treatment;
- topology owner, change owner, and evidence source.

Until this is approved, direct `request.client.host` evidence cannot be
promoted into a production proxy claim.

### 6.2 Shared atomic adapter and capacity

Record:

- approved adapter/store and private namespace;
- atomic operation and consistency guarantee;
- availability zone/region and network access boundary;
- capacity, latency, connection, retry, and timeout budgets;
- store credential custody and rotation ownership without recording values;
- backup/restore, failover, and data-loss expectations;
- adapter outage detection and recovery owner.

No provider or production activation is selected by this packet.

### 6.3 Operation-specific outage behavior

For each surface, record whether the operation fails closed, uses a bounded
safe fallback, or is temporarily disabled when the shared adapter is
unavailable:

| Surface | Normal decision | Outage decision | Public response | Owner/evidence |
| --- | --- | --- | --- | --- |
| Customer login |  |  |  | Open |
| Admin login |  |  |  | Open |
| Recovery request/resend |  |  |  | Open |
| Contact/inquiry intake |  |  |  | Open |
| Other public limiter use |  |  |  | Open |

Do not infer fail-open or fail-closed behavior from current exception
propagation.

### 6.4 Thresholds, windows, and dimensions

Record or explicitly confirm:

- whether the `ADR-005` 5/20/15-minute bounded contract is the production
  candidate for customer and Admin login;
- login progressive delay, retry budget, and escalation behavior;
- recovery account/IP budget beyond the approved 60-second resend cooldown;
- contact, inquiry, and other public budgets;
- counter reset after successful authentication;
- clock boundary, `Retry-After` rounding, and concurrency semantics;
- review cadence and abuse-response authority.

Any change to the approved bounded thresholds requires a separate recorded
decision; this packet does not make one.

### 6.5 Privacy, retention, and deletion

Record:

- HMAC material custody, versioning, access, and lifecycle;
- whether any counter metadata can be linked to an account or peer;
- TTL/index application procedure and exact retention period per collection;
- deletion owner, backup interaction, legal/privacy review, and proof of expiry;
- prohibited fields in logs, alerts, tickets, and operational exports;
- incident handling for identifier or counter-data exposure.

The declared TTL indexes are not evidence that they exist in an approved
environment.

### 6.6 Monitoring, alerting, and on-call

Record:

- counters, rejection rate, adapter errors, latency, and `Retry-After`
  observability;
- cardinality and redaction limits;
- SLO/error budget and alert thresholds;
- incident destination, primary/backup responder, and response SLA;
- retention and access for operational evidence;
- dashboard/runbook location and evidence-custody owner.

### 6.7 Rollout, migration, and rollback

Record:

- exact schema/index revision and non-destructive migration plan;
- disposable dry run, duplicate/index preflight, backup, restore test, and
  validation evidence;
- rollout window, drain/disablement owner, and stop conditions;
- rollback floor, adapter fallback/disablement behavior, and data cleanup;
- post-rollout observation window and handover acceptance.

No migration apply or production mutation is authorized by this packet.

## 7. Required verification after approval

The later implementation/release task must cover at least:

- simultaneous failures across multiple limiter instances against a real
  replica-set/shared adapter;
- atomic budget behavior at boundary and just-over-boundary counts;
- forwarded-header spoofing, missing-header, and trusted-ingress cases;
- deterministic HTTP 429 and `Retry-After` for known and unknown identifiers;
- no plaintext email or raw peer address in counter documents or logs;
- customer/Admin/recovery outage behavior for each approved operation;
- recovery-resend cooldown concurrency and broader approved budget;
- TTL/index application, expiry, cleanup, backup/restore, and rollback;
- adapter latency, retry, connection, failover, and capacity behavior;
- monitoring redaction, alert routing, response SLA, and evidence retention;
- customer auth, Admin auth, privacy, accessibility, and responsive regressions.

The existing isolated test result is useful evidence for bounded behavior but
does not replace these environment and operational checks.

## 8. Owner decision form

| Decision area | Owner | Decision/reference | Evidence required | Date/status |
| --- | --- | --- | --- | --- |
| Production worker/ingress topology |  |  |  | Open |
| Trusted proxy/client address |  |  |  | Open |
| Shared adapter and capacity |  |  |  | Open |
| Customer/Admin outage policy |  |  |  | Open |
| Recovery/public outage policy |  |  |  | Open |
| Thresholds and windows |  |  |  | Open |
| Privacy, retention, and deletion |  |  |  | Open |
| Monitoring and on-call |  |  |  | Open |
| Migration and rollback authority |  |  |  | Not granted |
| Production deployment/activation |  |  |  | Not granted |
| Production-readiness/go-live |  |  |  | Not eligible |

## 9. Current verdict and handover

Current verdict: **NOT READY for internet-facing authentication production
readiness or go-live**.

The repository contains a bounded limiter source contract and isolated tests,
but it does not contain sufficient evidence or approved operational decisions
for shared production behavior. The correct status is `blocked_by_decision`,
not a topology, outage, retention, or owner assumption.

Intentionally unchanged by this packet:

- `DEC-AUTH-002`, `DEC-AUTH-006`, `ADR-005`, the Decision Register, and DR-004
  status;
- backend/frontend source, schema manifests, migrations, dependencies,
  configuration, tests, CI workflow, and deployment manifests;
- credentials, HMAC material, shared/staging/production data, deployment,
  readiness, and go-live state;
- all scan rules and configuration except `.gitleaksignore`, which carries only
  the exact verified historical false-positive fingerprint required by the
  published PR history;
- the dirty `main` worktree and unrelated worktrees.

The next authorized action is an owner decision review. After approval, create
a separately scoped implementation/operations task with explicit environment,
migration, rollback, and verification authority.

<!-- markdownlint-enable MD013 MD060 -->
