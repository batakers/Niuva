# Task Card — DR-004 Abuse-Control Operational Decision Packet

<!-- markdownlint-disable MD013 -->

**Status:** Documentation-only decision packet; human decision blocked
**Date:** 2026-08-06 (Asia/Jakarta; actual preparation date)
**Observed baseline:** `origin/main` at `c84743c8fcbc158721037b3c02dc0dff0c872242`
**Active branch:** `codex/g16-dr004-abuse-control-20260806`
**Active worktree:** `C:\tmp\niuva-g16-dr004-abuse-control-20260806`
**Driver:** Faiz / delegated Codex implementation
**Decision owners:** Security, deployment/platform, privacy/operations, and
the Project Owner

## Objective

Prepare a neutral owner packet for DR-004. The packet must distinguish the
bounded MongoDB limiter runtime contract selected by `ADR-005` from the still
open production topology, trusted-proxy, outage, retention, monitoring, and
ownership controls required for internet-facing authentication.

This task records decision fields and evidence boundaries. It does not alter
the limiter, select a production infrastructure topology, apply indexes, or
authorize a deployment or migration.

## Authority and reading order

The canonical reading order used for this task is: Master Spec, Document
Register, Decision Register and DR-004, applicable decisions/ADR, applicable
runbooks, then current source and tests.

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` (DR-004)
- `docs/decisions/access/DEC-AUTH-001-login-failure-and-legacy-compatibility.md`
- `docs/decisions/access/DEC-AUTH-002-rate-limit-topology-deferral.md`
- `docs/decisions/access/DEC-AUTH-006-abuse-protection-interface-and-deferral.md`
- `docs/decisions/architecture/ADR-005-backend-remediation-runtime-policy.md`
- `docs/runbooks/AUTH_RECOVERY_RUNBOOK.md`
- `docs/runbooks/AUTH_SESSION_RUNBOOK.md`
- `docs/implementation/production-readiness/phases/FEATURE-1.5-auth-rate-limit-revalidation.md`
- current source and tests only as bounded evidence

`ADR-005` selects MongoDB and the 5-account / 20-peer / 15-minute bounded
runtime contract. It does not select the production worker, ingress, trusted
proxy chain, outage policy, retention operator, or production activation.
`DEC-AUTH-006` approves the provider-neutral atomic limiter interface, HMAC
identifier treatment, generic 429 responses, `Retry-After`, and a 60-second
recovery-resend cooldown; its operational inputs remain open.

## Scope

Only these two documentation files and one exact scan-fingerprint entry may
change:

1. `docs/implementation/production-readiness/phases/DR-004-ABUSE-CONTROL-OPERATIONAL-2026-08-06-task-card.md`
2. `docs/implementation/production-readiness/phases/DR-004-ABUSE-CONTROL-OPERATIONAL-2026-08-06.md`
3. `.gitleaksignore` for the verified historical false-positive fingerprint
   from the already-published DR-011 packet commit only

## Explicit exclusions

- Do not change `backend/auth_rate_limit.py`, `backend/server.py`, schema
  manifests, migrations, tests, dependencies, or environment configuration.
- Do not select Redis, MongoDB production topology, a gateway, proxy, SaaS, or
  another provider beyond the bounded `ADR-005` source evidence.
- Do not invent forwarded-header trust, fail-open/fail-closed behavior,
  thresholds beyond approved source scope, retention, alert destinations, or
  owners.
- Do not apply TTL indexes or migrations, access shared/staging/production
  data, deploy, rotate secrets, or claim authentication readiness/go-live.
- Do not change `DEC-AUTH-002`, `DEC-AUTH-006`, `ADR-005`, the Decision Register,
  or DR-004 status.
- Do not modify unrelated files or the dirty `main` worktree.

## Acceptance criteria

- The packet separates approved bounded runtime evidence from open production
  operational decisions.
- Topology, trusted proxy, store outage, privacy/retention, TTL, monitoring,
  ownership, rollout, rollback, and verification fields are explicit and blank
  until authorized owners decide.
- Current source/test observations are labeled as evidence, not production
  proof or activation approval.
- No provider, credential, secret value, runtime change, or external operation
  is introduced.
- Only the three approved paths are staged; the `.gitleaksignore` entry must be
  one exact fingerprint and must not disable a rule or path broadly.
- `git diff --check`, markdownlint, exact-path verification, and staged secret
  scanning pass.

## Delivery authorization and handover

The user authorizes commit, push, and opening a PR. Merge, infrastructure or
provider activation, credential use, migration, deployment,
production-readiness approval, and go-live remain unauthorized.

The PR must list changed and intentionally unchanged files, passed and unrun
checks, risks and rollback, and external actions still requiring approval.

<!-- markdownlint-enable MD013 -->
