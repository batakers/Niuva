# G4 — Reproducibility, Staging Operations, and Rollback Evidence

<!-- markdownlint-disable MD013 -->

**Status:** Proposed child task card; evidence preparation only
**Planning baseline:** `origin/main` observed at
`7810a38ef00d2076bf651ca07502c8b15d9d6590`; the driver must fetch again before
creating its implementation worktree
**Owner:** Project Owner/operations owner to assign
**Independent verifier:** Independent release/operations reviewer to assign

## Objective

Prepare a provider-neutral evidence packet for a bounded candidate evaluation:
build inputs, environment inventory without secrets, health checks, release
identity, artifact and rollback identity, backup/restore expectations,
telemetry gaps, owner matrix, and explicit staging stop conditions.

This card does not authorize staging deployment, production deployment,
migration apply or restore, provider activation, credential use, secret
rotation, shared-data mutation, production readiness, or go-live.

## Authority and applicable context

Read in this order before any work:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
5. `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`
6. `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`
7. `docs/decisions/architecture/DEC-OBS-001-commerce-transaction-sandbox-observability-contract.md`
8. `doc/PRODUCTION_DEPLOYMENT.md`
9. `doc/ROLLOUT_AND_HANDOVER_RUNBOOK.md`
10. `doc/MIGRATION_BACKUP_RESTORE_RUNBOOK.md`
11. Current workflows, manifests, source, and tests

DR-011 through DR-014 remain open or only partially resolved. Their packets
are decision inputs, not authorization to execute operations.

## Exact path ownership

The child task may change only a newly assigned G4 evidence packet under
`docs/implementation/production-readiness/phases/` after its exact filename is
recorded in the handover. This task card itself is the routing contract.

The following are read-only inputs unless a separate serial assignment names
an exact path:

- `.github/workflows/**`;
- `frontend/package.json`, lockfiles, backend dependency manifests, and global
  configuration;
- `doc/**`, `docs/decisions/**`, canonical authority, and existing runbooks;
- deployment configuration, environment files, migrations, and data.

Do not modify `docs/implementation/production-readiness/DECISIONS_REQUIRED.md`
or the G1–G3 implementation paths. Do not modify this card from the operations
chat.

## Intentionally unchanged and excluded

- no deployment or staging mutation of any kind;
- no production or real-provider credentials, secrets, tokens, or API keys;
- no provider selection or activation for storage, payment, email, shipping,
  telemetry, or alerting;
- no migration apply, restore, backup of real data, or database mutation;
- no DNS/TLS/CORS/origin/topology change, on-call commitment, or incident
  ownership invented from repository evidence;
- no dependency, workflow, lockfile, runtime, source, or product change.

## Dependencies and parallel rules

- G4 evidence preparation may run read-only in parallel with G1–G3.
- Any workflow, manifest, runbook, deployment, or shared configuration edit is
  strictly serial and requires a new exact path assignment.
- Candidate evidence must identify the exact merged SHA and all child handovers;
  it must not select a release candidate while DR-001 is open.
- G5 consumes the packet after G1–G4 handovers and independent verification.

## Acceptance criteria

- Record reproducible build/test commands, toolchain and dependency identity,
  artifact identity, environment separation, and a redacted environment
  inventory.
- Record readiness/health checks, transaction capability prerequisites,
  browser evidence limits, backup/restore expectations, rollback artifact and
  owner, telemetry/SLO gaps, and a named owner matrix—or explicitly mark each
  owner as unassigned.
- State the candidate's inactive/excluded Retail checkout, payment, storage,
  provider, migration, and production capabilities.
- State exact stop conditions for missing access, secrets, data policy,
  backup/restore evidence, monitoring, on-call, independent review, or
  unresolved decisions.
- Do not claim staging or production evidence when only local/CI evidence exists.

## Minimum verification

- Verify the selected SHA, clean isolated worktree, changed-path inventory, and
  artifact identity without writing secrets.
- Reuse existing CI/build/test evidence only with its exact run/commit and
  coverage limits; do not rerun deployment or migration operations.
- Run documentation lint and `git diff --check` for any evidence packet.
- Verify staged paths exactly and run a staged secret scan before any commit.

## Handover and stop conditions

The handover must list evidence files, intentionally unchanged operational
paths, passed/unrun checks, external environment evidence that is missing,
risks, rollback, owners, and approval requirements. Stop before any command
that changes a shared/staging/production environment or uses credentials.

Commit, push, and opening a PR are allowed for an approved documentation or
evidence packet. Merge, deployment, migration, provider activation, readiness,
and go-live remain user-controlled and separately gated.

<!-- markdownlint-enable MD013 -->
