# PHASE-10C Recovery and Rollback Drill Task Card

Status: **planning authorized; every drill and environment action prohibited**

| Field | Task brief |
| --- | --- |
| Title and user outcome | Prepare an executable-after-approval recovery and rollback drill packet covering migration dry-run, backup/restore, transaction failure, recovery failure, artifact rollback, data rollback, and exact-SHA evidence. |
| In scope | Planning documents and directly related PHASE-10C coordination rows; read-only inventory of current runbooks, source, tests, workflows, and evidence. |
| Out of scope | Selecting a release candidate or environment; starting services; connecting to any database; migration dry-run/apply/rollback; backup/restore; failure injection; build/deploy/redeploy; artifact publication/promotion; data mutation; provider/config/secret changes; production-readiness or go-live claims. |
| Authority | User authorization for planning on 6 August 2026; `AGENTS.md`; Master Spec sections 11–13 and 17–18; `ADR-001`; applicable migration, transaction, recovery, deployment, and handover runbooks; `DR-012`; PHASE-10C roadmap and team charter. |
| Affected areas | `PHASE-10C`, `TASK-10C-01`, `TASK-10C-02`, `V-02-02`, `V-07-01`, `V-10-01`, and the recovery/rollback evidence contract. |
| Contract or dependencies | PHASE-10A exact-candidate freeze; completed PHASE-02B plan; independently accepted PHASE-02C backup/restore evidence; completed DR-012 target, owners, window, RPO/RTO, custody, incident/on-call, and evidence-format fields; immutable candidate and last-known-good artifacts. |
| Done when | The packet separates artifact rollback from data rollback, assigns a planned evidence schema and stop rule to every requested drill, records exact-SHA requirements, and leaves all execution states blocked. |
| Verification | Read-only authority/source/test inventory; required-term and path checks; Markdown/reference review; `git diff --check`; changed-path review. No runtime, database, migration, artifact, or failure-injection command. |
| Owner and verifier | Planning driver: Backend/Codex. Execution owner, rollback owner, restore owner, evidence custodian, incident commander, and independent verifier remain unassigned until DR-012 is completed. |
| Commit/push/PR permitted? | Planning file edits are authorized. Commit, push, PR creation, merge, and every execution action require separate explicit authorization. |
| Risks or open decisions | No frozen candidate, approved target/window, RPO/RTO, immutable rollback artifact, accepted backup custody, independent verifier, or incident/on-call assignment. PR #202 is open evidence and must not be treated as merged or independently accepted. |

Planning baseline: `fbaa7bb9188c380dcd18290e46d5da6b3a3cb5b0`
with Git tree `9b17ae3b7ba981271202e63c94cee12abba70177`, freshly
fetched from `origin/main` on 6 August 2026. This is a planning baseline, not a
PHASE-10A release-candidate selection.

Branch / worktree: `ops/backend-recovery-drill` /
`/Users/macintoshhd/NIUVA/Niuva-worktrees/backend-recovery-drill`.

Global stop rule: stop before any command starts a service, connects to a
database or external environment, captures/restores data, runs a migration,
injects a failure, builds/promotes/redeploys an artifact, or mutates runtime
state. A planning review, passing repository check, or merged prerequisite does
not remove this stop rule.
