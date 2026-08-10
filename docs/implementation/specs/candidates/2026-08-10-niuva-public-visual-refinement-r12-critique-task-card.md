# Task Card — R12 Formal Expert Critique

**Status:** Candidate-only review task; no publication authorization.

## Objective

Independently assess the current isolated public visual refinement prototype
after R12-P1-01 and R12-P1-02 remediation. Determine whether the Contact
channel copy and WhatsApp cancel/return recovery now preserve the Inquiry-first
contract and whether the candidate visual/flow gate can advance.

## Scope and authority

- Target worktree: `C:\tmp\niuva-public-visual-refinement-prototype-r1`.
- Applicable candidate inputs: public visual refinement direction packet,
  owner review packet OVR-01…OVR-06, prototype task card, R11 critique report,
  R12 browser evidence, and current prototype source/test files.
- Assessment A is an independent visual/UX/design-director critique.
- Assessment B is independent detector, syntax, contract, and browser evidence.

## Required scenarios

- Contact first viewport channel copy before any form submission.
- Empty and partial form: WhatsApp open → confirm → return/cancel, with values,
  focus target, and scroll below the sticky header preserved.
- Valid form submit → WhatsApp continuation → return to the recorded Inquiry.
- Invalid fixture and browser history rehydration.
- Review → Participant handoff, map retry, and all public deep links.

## Exclusions

- No production source, canonical authority, API, database, provider, payment,
  upload, deployment, migration, or go-live work.
- No external WhatsApp/map request, analytics, durable customer data,
  moderated session, commit, push, PR, or merge.
- Do not read the other assessment or prior critique output before independent
  observations are complete.

## Acceptance and checks

- A records specificity, Nielsen scores, cognitive load, emotional journey,
  personas, P0/P1/P2 findings, and gate verdict.
- B records detector, syntax, contract, 24 route/viewport matrix, targeted
  state evidence, and server cleanup.
- Minimum commands: `node --check app.js fixtures.js server.cjs`,
  `node --test prototype-flow.contract.test.cjs`, and the Impeccable detector
  on `index.html`, `review.html`, `styles.css`, and `app.js`.
- Final report records both agent provenance and retains candidate-only
  publication boundaries.

## Outcome

Completed 10 August 2026. Assessment A and B independently recorded a
`PASS WITH CONDITIONS` result at 30/40 with 0 P0 and 0 P1 findings. Evidence is
in `FORMAL_EXPERT_CRITIQUE_RERUN_3.md` and `evidence/r12-browser-results.json`.
