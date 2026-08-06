# DR-002 — NIV-001 Credential-Incident Disposition Packet

<!-- markdownlint-disable MD013 -->

**Status:** `DECIDED` / `ACCEPTED_RISK_SELF_VERIFICATION_EXCEPTION`
**Prepared:** 2026-08-06 (Asia/Jakarta; original packet)
**Revalidated:** 2026-08-06 16:44:01 WIB (Asia/Jakarta)
**Observed baseline:** `origin/main` at
`9472537405af3353a68e599a057263ca7aa079ee` (`9472537`)
**Observed tree:** `3a4678333ede6122fdc8d3f87456b83e1567c9cd`
**Observed at:** `2026-08-06T09:44:01Z` (Asia/Jakarta collection window)
**Decision owner:** Faiz (sole incident owner, credential owner, repository
administrator, rewrite operator, application owner, and Final Approver)
**Independent verifier:** Unavailable; the owner-approved exception below is
not independent verification.
**Scope:** Redaction-safe decision and evidence update only

## 1. Purpose and non-authority

DR-002 requires the project to either close the NIV-001 credential incident
with independently verified evidence or record a new/time-bound accepted-risk
disposition. The current register records an accepted risk through
**2026-08-30**, but explicitly says that incident closure is not verified and
that release and go-live remain blocked.

This packet makes the owner decision and evidence boundary explicit. It is not
a credential-incident closure, a security approval, a history-rewrite plan
execution, or a production-readiness decision. It does not select `Verified`,
and it contains no sensitive credential material.

The SHA above is a point-in-time repository observation. It is not a DR-001
release-candidate selection and does not alter the DR-001 decision.

## 1A. Owner decision — 2026-08-06

Faiz confirmed that the project has no second person who can act as an
independent verifier and approved a bounded **sole-owner self-verification
exception** for this packet. The selected disposition is the existing
time-bound accepted risk through **2026-08-30**, with Faiz as the sole
accountable owner and Final Approver.

This exception records a decision; it does not convert self-review into
independent verification and does not authorize or attest to a credential
revocation/rotation, exact-history rewrite, force-push, external cache/PR-ref/
fork cleanup, old-clone disposition, backup retention, or production action.
NIV-001 therefore remains an open P0 incident for release and go-live
purposes. The exception closes the human-decision gap in this packet only.

## 2. Authority and evidence sources

The canonical read order used for this packet is: Master Spec, Document
Register, Decision Register, applicable decision/ADR, applicable runbook, then
current source and tests.

Applicable authority:

- `docs/NIUVA_MASTER_SPEC.md` — canonical authority order and security/
  implementation boundaries;
- `docs/context/DOCUMENT_REGISTER.md` — document status and use limits;
- `docs/decisions/DECISION_REGISTER.md` — formal decision index and open
  consequences;
- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` — DR-002
  current state and expiry;
- `docs/implementation/production-readiness/VERIFICATION_MATRIX.md` — V-00-02;
- `docs/implementation/production-readiness/TEAM_ASSIGNMENT.md` — PHASE-00B
  ownership and evidence-only boundary; and
- `docs/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md` — procedural
  authority for any later, separately approved incident closure.
- [`DR-002-NIV-001-REDACTED-GIT-INVENTORY-2026-08-06.md`](DR-002-NIV-001-REDACTED-GIT-INVENTORY-2026-08-06.md)
  — current redacted Git/GitHub/worktree inventory and scan limits; and
- [`DR-002-NIV-001-REVOKE-ROTATE-EVIDENCE-TEMPLATE-2026-08-06.md`](DR-002-NIV-001-REVOKE-ROTATE-EVIDENCE-TEMPLATE-2026-08-06.md)
  — value-free revoke/rotate sequence and evidence schema.

No approved ADR resolves DR-002. This packet records the explicit owner
exception above as a bounded disposition; it does not amend the runbook. The
NIV-001 runbook remains procedural authority only: it requires explicit
approvals and stop conditions and does not authorize autonomous rotation,
history rewrite, force-push, ref deletion, remote changes, or a `Verified`
status.

## 3. Current disposition and observed limits

| Area | Current observation | Limit |
| --- | --- | --- |
| DR-002 state | Faiz recorded a sole-owner self-verification exception against the existing accepted risk through `2026-08-30`. | This is administrative risk containment, not verified incident closure and not release or go-live approval. |
| NIV-001 runbook state | The runbook states `Implemented, verification pending` and requires redacted evidence before `Verified`. | A runbook is procedural authority; its checklist is not evidence that a step occurred. |
| Credential action | No credential value was inspected or used in this packet. No rotation or revocation was performed. | A redacted owner-controlled revocation/rotation record is still required before closure. |
| History rewrite | No rewrite, force-push, ref deletion, or remote publication was performed. | The full-history rewrite and post-rewrite proof remain entirely unverified. |
| Current repository checks | Focused suite passed `180` tests on the synchronized `9472537` source/test paths; `backend`, `frontend`, and `secret-scan` CI also succeeded at the current main commit. The latest pinned redacted scan remains historical at `f43eea6`. | Source/test evidence and a redacted scan do not prove revocation, remote-cache/fork/clone cleanup, history publication, or final incident closure. Credential-like findings remain residual evidence unless explicitly dispositioned in the restricted incident record. |
| Remote/PR state | Timestamped read-only inventory at `2026-08-06T09:44:01Z`, including the open PR #185 snapshot, is recorded in the linked inventory. | The inventory is not a write freeze or approval. PR refs, cached views, old clones, and backups remain separate closure gates and must be rechecked before execution. |
| Worktrees/clones | Current local counts and fsck result are recorded in the linked inventory at the same timestamp. | The runbook requires owner acknowledgments, quarantine/recreation, and a fresh inventory; local worktree listing is not collaborator/old-clone closure evidence. |
| GitHub surfaces | Read-only PR/fork/ruleset counts were collected; no GitHub Support, cache cleanup, collaborator-clone, or backup evidence was collected. | Those external records are required by the runbook and must remain redacted. |
| Production boundary | No deployment, provider, migration, secret rotation, or go-live action was performed. | DR-002 remains a P0 release/go-live blocker until a final disposition is approved. |

Historical counts and ref snapshots inside the NIV-001 runbook are planning
snapshots, not current inventory. The current redacted inventory is linked
above, but it must be rechecked at execution time and must not be copied into a
closure claim. The inventory timestamp includes the open PR #185 snapshot; any
later repository movement requires another re-inventory before execution.

The runbook's recorded introducing commit is absent from the current checkout's
object database, so an exact-value scan could not be reconstructed without
accessing the credential. This does not prove absence from PR refs, cached
views, forks, old clones, backups, or other repositories.

## 4. Owner decision paths

The following are mutually exclusive disposition paths. This packet records
Option C as the selected disposition. Any later change requires a new approved
decision record.

### Option A — Verified closure after independent evidence

Choose only if the runbook's applicable gates are complete and independently
reviewed. The final record must identify the responsible owners, dates,
redacted references, exact ref/clone/cache/fork/backup outcomes, and the Final
Approver. It must not include any credential value.

Minimum closure evidence includes:

- redacted proof that the old credential was revoked or rotated;
- a non-production account/config reference and controlled authentication result;
- fresh remote branch/tag/PR/fork/ruleset inventory and approved write-freeze
  evidence;
- independently verified recovery mirror/bundle and retention decision;
- redacted pre- and post-rewrite exact-history/Gitleaks results;
- ref-name parity, tree-diff, branch test-matrix, PR/LFS impact, and rewritten
  SHA evidence;
- publication result using the approved atomic/lease procedure, if publication
  was separately authorized;
- GitHub Support/cache/PR-ref/GC and fork outcomes;
- collaborator clone/worktree quarantine or fresh-clone acknowledgments; and
- final independent review plus Final Approver disposition.

If any applicable gate is missing, the owner must not label NIV-001 `Verified`.

### Option B — Renew the accepted risk with an explicit expiry

Choose only if verified closure cannot be completed before the current expiry.
The renewed record must name the Final Approver, incident/credential owner,
independent reviewer, residual scope, compensating controls, evidence still
missing, review date/expiry, and the trigger for escalation. It must state that
the incident remains open and that release, production readiness, and go-live
remain blocked.

A renewal is not permission to defer indefinitely, use the old credential,
rewrite history, force-push, or publish a contaminated ref. It must not be
treated as a security closure.

### Option C — Sole-owner self-verification exception (selected)

This is the selected path because no independent verifier exists. It records
Faiz's explicit acceptance of the residual risk and permits owner-reviewed,
redaction-safe repository and local-test evidence to be attached to this
decision packet. It does not waive credential-action evidence, external
repository-surface evidence, backup/clone evidence, or the independent review
criteria required for a `Verified` label. It does not lift the P0
release/go-live block and expires with the existing accepted-risk record on
**2026-08-30** unless a new decision is recorded.

If the evidence or risk posture no longer fits this exception, the Final
Approver may record a different bounded disposition with owner, rationale,
expiry, controls, and required follow-up. The new record must preserve the P0
and release/go-live blocking boundary until the approved criteria say
otherwise.

## 5. Redacted decision form

Complete this form in the canonical decision record. Keep values, tokens,
authorization headers, cookies, secret-manager output, and raw scanner matches
out of the record.

| Field | Owner entry |
| --- | --- |
| Selected path: `Verified` / renewed `Accepted risk` / other | `Option C — sole-owner self-verification exception; accepted risk through 2026-08-30` |
| Final Approver and approval reference | `Faiz; owner instruction recorded 2026-08-06 in the task thread` |
| Incident owner and credential owner | `Faiz (sole owner)` |
| Independent verifier | `Unavailable; exception recorded; self-review is not independent verification` |
| Current status and rationale | `DECIDED / ACCEPTED_RISK_SELF_VERIFICATION_EXCEPTION; incident closure remains unverified` |
| Redacted credential-action ticket/config reference | `Not available; no credential action performed` |
| Credential action date/result (no value) | `Not run` |
| Non-production account/config reference (no value) | `Not available; controlled new-account authentication not run` |
| Remote/ref/PR/fork/cache inventory reference | `Current redacted inventory; freeze and external cleanup evidence remain absent` |
| Worktree/old-clone disposition reference | `Current local count only; owner quarantine/fresh-clone evidence absent` |
| Backup/restore and retention reference | `Not available; no recovery bundle operation performed` |
| Pre/post scan and rewrite evidence references | `Historical redacted scan at f43eea6 recorded; no current-main scan, rewrite, or exact-value scan run` |
| GitHub Support/cache/PR-ref outcome | `Not available; no Support or cache cleanup action performed` |
| Residual risks and compensating controls | `P0 release/go-live block, time-bound accepted risk, redacted evidence, no old-credential use` |
| Expiry/review date (required for accepted risk) | `2026-08-30` |
| Release/go-live blocking statement acknowledged | `Yes; self-verification exception does not lift the block` |

## 6. Traceability and gate mapping

| Gate | Requirement | Current status |
| --- | --- | --- |
| DR-002 | Close NIV-001 or record a bounded accepted-risk disposition. | Decision recorded as sole-owner exception; incident remains open and accepted risk expires 2026-08-30. |
| PHASE-00B / TASK-00B-01/02 | Obtain secret-safe incident evidence or a new Final Approver disposition. | Owner disposition is recorded; credential/external evidence and verified closure remain open. |
| V-00-02 | Produce redacted gate-by-gate evidence, host/clone/cache assessment, owner disposition, and verified runbook status. | Redacted evidence and owner disposition are recorded; clone/cache assessment and independent verification remain open under the exception. |
| `FINDING_TRACEABILITY.md` SEC-001/OPS-010 | Preserve P0 severity and release/go-live block until independent closure. | Remains P0/open under `accepted_risk_self_verification_exception`; the exception is not independent closure. |
| DR-015 / V-10-01 | Make production-readiness and go-live decisions only after all applicable P0/P1 and accepted risks have current evidence. | Not eligible. DR-002 cannot be silently waived by CI or documentation. |

## 7. Required sequence after an owner decision

1. Record the selected disposition, owner, expiry, and evidence references in
   the canonical decision record.
2. If closure is selected, obtain explicit approvals for the exact rehearsal or
   publication window and runbook command scope; re-inventory all refs, PRs,
   forks, worktrees, clones, and backups immediately before execution.
3. Use only the approved isolated mirrors and redacted evidence process. Keep
   the dirty main worktree and unrelated contributor worktrees untouched.
4. Obtain independent verification of backup, scan, ref/tree parity, tests,
   remote publication, GitHub cleanup, clone disposition, and evidence
   redaction.
5. Have the Final Approver record the final NIV-001 status. If any criterion is
   absent, keep `Verified` unavailable and use the approved risk disposition.
6. Re-evaluate V-00-02, DR-001, DR-012, DR-013, and V-10-01 before any separate
   production-readiness or go-live request.

No step above is authorized by this packet.

## 8. Handover and current verdict

Updated in this repair: the current-main baseline and conflict reconciliation in
`DECISIONS_REQUIRED.md`, this disposition packet, the linked redacted inventory,
the value-free revoke/rotate evidence template, and the
`FINDING_TRACEABILITY.md` addendum.

Intentionally unchanged: credential values and secret stores, Git history and
refs, branches/tags, `main`, worktrees/clones/backups, GitHub settings/support
state, source/tests/dependencies/CI, migrations, providers, deployment state,
and decision-register status.

Local validation for this revalidation includes the focused auth/security/
permission/projection suite (`180 passed`), the historical pinned Gitleaks
result (`2` unresolved redacted findings from `f43eea6`; no current binary was
available), conflict-marker and whitespace checks, and staged secret-pattern
checks. Credential action, controlled authentication with
a new account, exact-value scan, history rewrite, migration commands, staging,
deployment, provider operations, GitHub Support, and production actions were
not run and are not implied.

Current verdict: **NOT READY for release, production deployment, or go-live**.
The NIV-001 decision gate is resolved as a documented sole-owner exception, but
the underlying incident remains a P0/open accepted risk; the exception does
not establish `Verified` closure.

<!-- markdownlint-enable MD013 -->
