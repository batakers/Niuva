# PHASE-02B Migration Hardening Task Card

Status: **planning and current-source expert review complete; current-head CI
and merge pending; migration execution prohibited**

| Field | Task brief |
| --- | --- |
| Title and user outcome | Refresh the migration-hardening plan so migrations `001` through `009` each have an explicit safety, evidence, rollback/compensation, restore, and stop-condition disposition. |
| In scope | `PHASE-02B-migration-hardening-plan.md` and the directly related production-readiness coordination rows; read-only inventory of migration source and tests. |
| Out of scope | Migration source/tests, application source, dependencies, configuration, secrets, database connections, migration dry-run/apply/rollback, backup/restore execution, deployment, production readiness, and go-live. |
| Authority | `AGENTS.md`; Master Spec sections 11–13 and 17–18; `ADR-001`; `DEC-DATA-002`; `DEC-DATA-003`; applicable identity, catalog, recovery, and backup/restore runbooks; `DR-012`. |
| Affected areas | Readiness documentation for `PHASE-02B`, `TASK-02B-01`, `TASK-02B-02`, `V-02-02`, and migrations `001`–`009`. |
| Contract or dependency | `PHASE-02A` and `PHASE-00C` remain planning inputs; execution stays blocked by incomplete `DR-012` and requires a separately approved isolated target/window. |
| Done when | The current-SHA packet covers `001`–`009`, distinguishes migration from cleanup, maps existing and missing tests truthfully, preserves per-migration stop rules, and updates only directly stale tracker scope. |
| Verification | Read-only source/test inventory; required-term and path checks; `git diff --check`; changed-path and diff review. No database or migration command. |
| Owner and verifier | Driver: Backend/Codex under Faiz's authorization. Bounded independent source/matrix review completed during PR reconciliation; a named operational reviewer remains required before any future execution proposal. |
| Commit/push/PR permitted? | Yes. The Project Owner separately authorized the recommended PR reconciliation and merge sequence on 3 August 2026. Migration execution, deployment, production-readiness, and go-live remain unauthorized. |
| Risks or open decisions | `001`, `004`, and `005` retain hard reconciliation gaps; `DR-012` target/topology, RPO/RTO, evidence format, and operational ownership remain incomplete; Migration `009` retention cleanup is a separate destructive operation; Migration `010` remains outside this packet under Feature 1.7. |

Selected baseline: `a2b7be0d445cf3a338d91cf74841e3bf8be11a91`
(`origin/main`, verified 2 August 2026, Asia/Jakarta).

Reconciliation baseline: `b16a30b626bd2263d17a45d82313a82d25edfa2c`
(`origin/main`, checked 3 August 2026, Asia/Jakarta).

Branch / worktree: `plan/phase-02b-migration-hardening` /
contributor-local isolated worktree.

Finding scope: `DB-005` through `DB-012`, `DB-014`, `OPS-005`, `QA-004`,
and `GOV-013`.

Global stop rule: this task must stop before any command opens a database
connection or creates a backup, session, index, marker, collection, or data
mutation. Planning completion and PR approval do not remove that stop rule.
