# Candidate Task Card — Public Visual Refinement R13 Remediation

Status: `COMPLETED — PROTOTYPE-ONLY`

## Objective

Close the four P1 findings from the independent public visual refinement review
without changing production source, canonical authority, route decisions,
provider behavior, or readiness status.

## Authority and boundaries

- Baseline: isolated worktree created from `origin/main` at `4cbcd17`.
- Primary workflow: Impeccable; frontend and full-stack skills are references
  for responsive, accessible, and bounded implementation only.
- Affected files are limited to the prototype source, its contract test,
  candidate QA/audit records, and R13 evidence reports.
- No production `frontend/` or `backend/` source, API, database, provider,
  deployment, canonical register, migration, or human session was changed.

## Remediation scope

1. Unknown project slugs render an explicit not-found state; no approved project
   is substituted silently.
2. Persistence-unavailable is distinct from field validation, preserves valid
   values, exposes a visible retry, and restores focus to the form.
3. Decorative numbered/uppercase mono grammar is removed while retaining the
   editorial evidence-led composition.
4. Home exposes the canonical
   `Need → Research → Experiment → Prototype → Output` path and a visible
   deferred Retail boundary.

## Acceptance evidence

- `node --check app.js fixtures.js server.cjs`: PASS.
- `node --test prototype-flow.contract.test.cjs`: 12/12 PASS.
- Impeccable detector: `[]`.
- Focused browser revalidation: 36/36 route × viewport PASS at
  390/768/1024/1440px; no console/page/network errors, overflow, broken images,
  missing labels/landmarks, or sub-44px visible controls.
- Formal R13 critique: 31/40, 0 P0, 0 P1, `PASS WITH CONDITIONS`.

## Explicit exclusions

Retail transaction, Admin/CMS, payment, upload, map provider, WhatsApp provider
activation, production implementation, canonical promotion, moderated session,
and go-live remain out of scope.
