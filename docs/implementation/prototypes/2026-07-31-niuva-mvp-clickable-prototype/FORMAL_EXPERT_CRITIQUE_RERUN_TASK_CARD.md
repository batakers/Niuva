# Formal Expert Critique Rerun — Task Card

Status: **COMPLETE — GATE FAILED; P1 REMEDIATION REQUIRED**
Date: 31 July 2026
Lane: Readiness evidence

## Smallest Useful Brief

| Field | Boundary |
| --- | --- |
| Title and user outcome | Independently re-evaluate the remediated clickable customer/operator prototype and decide whether it is fit to enter moderated usability sessions. |
| In scope | UX and visual hierarchy, end-to-end flow integrity, Participant Mode neutrality, canonical route/brand alignment, responsive behavior, accessibility indicators, refresh/state behavior, and customer/operator prototype truthfulness. |
| Out of scope | Production application code, API/schema design, migration, provider selection or activation, deployment, go-live, canonical route promotion, synthetic human evidence, and remediation implementation. |
| Authority | `docs/NIUVA_MASTER_SPEC.md`; Document Register; Decision Register; `DEC-UX-003`; `DEC-AFTER-01`; `DESIGN.md`; the moderated review plan. |
| Affected area | `docs/implementation/prototypes/2026-07-31-niuva-mvp-clickable-prototype/` and formal critique/readiness records in that directory only. |
| Contract or dependency | Two independent assessments are required: Assessment A reviews UX/visual/flow without detector or prior critique findings; Assessment B reviews detector and browser evidence only after A is complete. |
| Done when | Both assessments are complete; P0/P1 findings are classified; the moderated-session readiness gate has an evidence-backed PASS or FAIL; an Impeccable critique snapshot/trend is recorded; documentation status reflects only the proven result. |
| Verification | Desktop and mobile browser inspection; representative customer and operator flows; state refresh; participant/moderator separation; detector; console, overflow, touch-target, keyboard/accessibility observations; scoped Git diff and whitespace check. |
| Owner and verifier | Driver: Codex root agent. Independent reviewers: Assessment A and Assessment B. Final synthesis: Codex root agent. |
| Commit/push/PR permitted? | No. Local evidence documentation only. |
| Risks or open decisions | Human customer/operator evidence remains absent. Passing this critique can only make the prototype ready to run moderated sessions; every candidate route remains `INSUFFICIENT_EVIDENCE` until those sessions and later explicit route decisions. |

## Acceptance Gate

The prototype may change from **NOT READY TO RUN** to **READY TO RUN** only if:

- no open P0 or P1 finding can contaminate participant evidence;
- participant-facing routes contain no evaluator controls or answer-revealing
  instructions by default;
- Customer, Retail, and Admin flows remain consistent with canonical route and
  lifecycle boundaries;
- the critical cart, checkout, tracking, file-revision, cancellation,
  complaint, and operator review states remain truthful through direct entry,
  navigation, and refresh;
- mobile primary actions remain reachable and the audited flows have no
  blocking accessibility or browser-runtime issue;
- both independent assessments support the readiness decision.

Even when this gate passes, `MODERATED_USABILITY_RESULTS.md` must retain
`INSUFFICIENT_EVIDENCE` for all candidate-route recommendations until real
moderated sessions are completed.

## Outcome

The formal dual-agent rerun completed on 31 July 2026. It found no P0 and five
P1 findings that can contaminate participant evidence. The prototype therefore
remains **NOT READY TO RUN**, and no moderated session was started. See
`FORMAL_EXPERT_CRITIQUE_RERUN.md` for the evidence and next gate.
