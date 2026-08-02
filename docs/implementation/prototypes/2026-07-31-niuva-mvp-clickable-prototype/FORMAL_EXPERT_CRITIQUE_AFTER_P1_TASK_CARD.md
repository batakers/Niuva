# Formal Expert Critique After P1 Remediation — Task Card

Status: **COMPLETE — GATE FAILED; REPLACEMENT P1 REMEDIATION REQUIRED**
Date: 31 July 2026
Lane: Prototype validation gate

## Assignment Boundary

| Field | Boundary |
| --- | --- |
| Objective | Independently assess whether the current clickable customer/operator prototype has any P0 or P1 UX, UI, visual, flow-integrity, Participant Mode, accessibility, or canonical-alignment defect that blocks a moderated human session. |
| In scope | All current P0/P1 customer and operator tasks, desktop and 390 px mobile behavior, keyboard/focus behavior, reload/recovery, Participant versus Moderator visibility, and canonical route/lifecycle alignment. |
| Out of scope | Editing source or documentation; production code; APIs or schemas; real payment/upload/email; route promotion; human sessions; release or go-live claims. |
| Authority | `docs/NIUVA_MASTER_SPEC.md`; Document and Decision Registers; approved UX/after-sales decisions; current route contract and activation checklist; current prototype source and live behavior. |
| Target | `docs/implementation/prototypes/2026-07-31-niuva-mvp-clickable-prototype/index.html`, supported by `app.js`, `styles.css`, and isolated live URL `http://127.0.0.1:4182`. |
| Assessment A | Unanchored design-director review. Must not read detector output, prior critique reports, remediation task card, validation report, or Assessment B. |
| Assessment B | Independent detector plus browser/technical evidence. Must run `detect.mjs` exactly once and must not read Assessment A or prior critique reports. |
| Gate | PASS only if the combined current evidence contains zero P0 and zero P1. P2/P3 may remain as documented follow-up. |
| Minimum checks | Primary customer checkout/order/revision/complaint flows; operator resolution approval; Participant Mode hygiene; desktop/mobile layout; semantic/keyboard/focus; refresh persistence; console; canonical boundary. |
| Mutation authority | None. Reviewers are read-only. No commit, push, PR, migration, or provider decision. |
| Evidence boundary | A PASS may change the review plan to ready-to-run, but candidate route recommendations remain `INSUFFICIENT_EVIDENCE` until real participants are observed. Human sessions are explicitly prohibited in this task. |

## Handover Contract

Each reviewer must return concrete route/element evidence, a 10-heuristic score,
P0–P3 findings, cognitive-load and persona observations, and a clear PASS/FAIL gate
recommendation. Unknown or untested behavior must be labeled rather than assumed.

## Outcome

The two independent review passes found no P0. The original five P1 remediation
acceptance rows remained observable, but the combined gate failed on two
replacement P1 defects: canonical Custom Print pricing and the reservation
lifecycle shown before its creation event. See
[`FORMAL_EXPERT_CRITIQUE_RERUN_2.md`](./FORMAL_EXPERT_CRITIQUE_RERUN_2.md).

Human sessions remain prohibited. This result does not promote a route or
change the `INSUFFICIENT_EVIDENCE` recommendation.
