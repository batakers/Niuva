# Task Card — DR-012 Staging, Continuity, and Release Ownership Packet

**Status:** Documentation/decision-input only; this card does not authorize
deployment, migration, provider activation, secret rotation, production
credentials, or go-live.

**Observed current head:** `origin/main` at
`f43eea6bd633b4250180e4373a62e5fb21fe14fa`, with Git tree
`6d2154bd52785bbc749345c0346651f9752d1646`.

**Branch:** `codex/continuation-current-main-20260806`

**Worktree:** `C:\tmp\niuva-continuation-current-main-20260806`

## Objective

Turn the remaining DR-012 blocker into an owner-actionable decision packet for
staging-like topology, environment/secret evidence, artifact identity,
backup/restore, RPO/RTO, migration window, rollback, incident, release, and
on-call ownership.

## Scope

Change only:

- this task card; and
- `DR-012-STAGING-ROLLBACK-DECISION-2026-08-06.md`.

The packet records repository evidence and blank decision fields. It does not
choose a host, domain, database target, provider, secret, topology, RPO/RTO,
owner, or rollout policy.

## Authority and context

Apply the repository order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. applicable approved ADRs/decisions, including `ADR-001`, `ADR-002`,
   `ADR-003`, `DEC-READY-01`, and `DEC-OBS-001`;
5. applicable runbooks, including `doc/PRODUCTION_DEPLOYMENT.md`, the
   transaction runbook, recovery/session runbooks, and migration runbooks;
6. current source, workflows, and tests.

`DR-012`, `VERIFICATION_MATRIX.md`, `TEAM_ASSIGNMENT.md`, and this packet are
planning/evidence context. They do not replace canonical authority or grant
execution permission.

## Exclusions and intentionally unchanged areas

No application source/test, dependency/lockfile, CI workflow, environment
value, secret, deployment manifest, migration, database, provider, shared data,
canonical decision, ADR, runbook, or production system may change. No actual
staging/deployment/restore/migration/rollback rehearsal is run by this task.

## Acceptance criteria

- Pin the current observed SHA and exact clean worktree.
- Record the current repository artifact/deployment inventory without exposing
  values from environment templates.
- Distinguish approved provider-neutral architecture from missing operational
  decisions and environment evidence.
- List the exact DR-012 fields, accountable owner, verifier, evidence format,
  stop conditions, and rollback custody still required.
- Map the packet to V-00-03, V-02-02, V-06-01, V-07-01, V-08-01, and V-10-01.
- Preserve **NOT READY** for production, deployment, activation, and go-live.
- Pass `git diff --check` and a staged secret-pattern review.

## Owner and delivery authorization

- **Decision owner:** Project Owner / Faiz, with named operations, security,
  data, release, and independent-verifier assignments still required.
- **Driver:** Faiz / Codex.
- **Commit/push/PR:** permitted by the active user objective.
- **Merge:** user retains merge control; this agent must not merge.
- **Rollback:** revert the documentation commit; no runtime/data rollback is
  required.

## Required external actions still blocked

DR-012 owner assignment and approval, staging access, non-secret origin,
topology/TLS/proxy decision, artifact custody, backup/restore window, isolated
rehearsal authorization, migration target/window, rollback owner, incident/
on-call ownership, provider activation, deployment, production-readiness, and
go-live remain separate actions.
