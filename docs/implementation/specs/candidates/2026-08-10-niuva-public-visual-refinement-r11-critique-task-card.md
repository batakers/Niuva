# Task Card — R11 Formal Expert Critique

**Status:** Candidate-only review task; no publication authorization.

## Objective

Independently assess the current isolated public visual refinement prototype
after R11-P1-01 remediation. Determine whether the WhatsApp handoff now keeps
Inquiry persistence semantics distinct and whether the candidate visual/flow
gate can advance.

## Authority and scope

- Baseline: prototype worktree from `origin/main` at the recorded prototype
  baseline SHA.
- Applicable candidate authority: public visual refinement direction packet,
  owner review packet OVR-01…OVR-06, prototype task card, and current
  `FORMAL_EXPERT_CRITIQUE_RERUN_2.md` as the remediation input only.
- Inspect only the prototype's Home, Projects, project-detail deep links,
  Contact, Review → Participant handoff, source, tests, and R11 evidence.
- Assessment A: independent visual/UX/design-director critique.
- Assessment B: independent detector, syntax, contract, and browser evidence.

## Exclusions

- No production source, canonical documents, API, database, provider, payment,
  upload, deployment, staging, migration, or go-live changes.
- No external WhatsApp request, map provider request, analytics, or durable
  customer data.
- No moderated human session, publication, commit, push, PR, or merge.
- Each assessment must not read the other assessment or prior critique output
  until both independent observations are complete.

## Acceptance criteria

- R11-P1-01 is explicitly tested for empty, partial, cancel, valid-submit
  continuation, and Review → Participant fixture paths.
- A records specificity, Nielsen scores, cognitive load, emotional journey,
  personas, strengths, P0/P1/P2 findings, and gate verdict.
- B records detector output, syntax, contract test, 24-route/viewport matrix,
  console/network/overflow/target/landmark/focus evidence, and server cleanup.
- A final report records the provenance line for both assessments and does not
  claim production or moderated-session readiness without the applicable gate.

## Minimum checks

- `node --check app.js fixtures.js server.cjs`
- `node --test prototype-flow.contract.test.cjs`
- Impeccable detector on `index.html`, `review.html`, `styles.css`, `app.js`
- Local browser matrix at 390/768/1024/1440px and targeted R11 assertions.

## Handover

Changed prototype files from the R11 remediation are `app.js`, `fixtures.js`,
`review.html`, `styles.css`, and `prototype-flow.contract.test.cjs`. Evidence is
under the prototype `evidence/` directory. The next external action remains
separately gated.
