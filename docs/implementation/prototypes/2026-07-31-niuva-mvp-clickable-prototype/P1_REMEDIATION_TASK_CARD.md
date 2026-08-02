# Formal Critique P1 Remediation — Task Card

Status: **ORIGINAL FIVE P1 CLOSED — FORMAL RERUN FOUND REPLACEMENT P1s**
Date: 31 July 2026
Lane: Prototype delivery plus readiness revalidation

## Smallest Useful Brief

| Field | Boundary |
| --- | --- |
| Title and user outcome | Remove the five formal-critique P1 blockers so the clickable prototype can be evaluated again for moderated-session readiness. |
| In scope | Preserve checkout-to-Order line identity; truthful file-revision input/deadline/versioning; existing-case recovery and duplicate prevention; distinct operator submission versus manager approval; Participant Mode removal of task-local evaluator controls. |
| Out of scope | Production frontend/backend, API/schema, real upload/payment/email, provider activation, canonical route promotion, migration, deployment, human sessions, production-readiness, and go-live. |
| Authority | `NIUVA_MASTER_SPEC.md`; `DEC-UX-003`; `DEC-AFTER-01`; `DESIGN.md`; `FORMAL_EXPERT_CRITIQUE_RERUN.md`. |
| Affected paths | Prototype `app.js` and prototype-only review/validation evidence in this directory. CSS changes are permitted only if required by the five fixes. |
| Done when | `FXR-P1-01` through `FXR-P1-05` have focused browser evidence; no replacement P0/P1 is found; formal dual-agent critique rerun produces an evidence-backed gate decision. |
| Verification | JavaScript syntax; direct route and refresh checks; Ready, Custom, and mixed checkout snapshots; revision empty/selected submission; case reopen/duplicate prevention; operator pending/manager approval separation; Participant/Moderator visibility; mobile/desktop geometry; keyboard/focus, console, detector, and scoped documentation checks. |
| Owner and verifier | Driver: Codex root agent. Independent formal reviewers are assigned only after remediation validation. |
| Commit/push/PR permitted? | No. Local prototype and evidence updates only. |
| Risks or open decisions | Passing automated and expert gates can only make the artifact ready for human sessions. Candidate route recommendations remain `INSUFFICIENT_EVIDENCE` until real participants complete the approved review. |

## P1 Acceptance Matrix

| Finding | Required observable result |
| --- | --- |
| `FXR-P1-01` | Checkout lists the exact cart lines and the resulting Order preserves the same Ready/Custom identities, total, and fulfillment snapshot after refresh. |
| `FXR-P1-02` | Revision route displays the exact deadline, requires a replacement STL/3MF selection, prevents empty submit, and confirms a new version without overwriting history. |
| `FXR-P1-03` | An active case is linked from the Order and direct `/complaints/new` entry cannot create a duplicate. |
| `FXR-P1-04` | Operator submission creates a pending-manager state; a separate moderator-only manager fixture records approval; repeated submission/approval is prevented; Finance remains separate. |
| `FXR-P1-05` | Participant Mode contains no failure-simulation or activation-gate controls/copy; those fixtures remain available only in Moderator Mode. |

## Focused Revalidation Result

All five acceptance rows passed browser revalidation on the isolated prototype
server at `http://127.0.0.1:4182`. Desktop flow checks covered exact mixed-cart
identity through checkout and Order reload, revision input/version persistence,
active-case recovery, the operator–manager–Finance boundary, and Participant Mode
visibility. Mobile checks at `390×844` found no horizontal overflow on the changed
transactional routes and no changed-route primary control below 40 px. The browser
console reported zero errors and zero warnings in the final focused route checks.

This evidence authorizes only the formal expert critique rerun. It does not
authorize or substitute for a moderated human session.

The formal rerun completed with the original five fixes still observable, but
found replacement P1 defects outside this task card's five-row scope. The human
session gate remains failed; see
[`FORMAL_EXPERT_CRITIQUE_RERUN_2.md`](./FORMAL_EXPERT_CRITIQUE_RERUN_2.md).
