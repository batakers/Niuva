# R13 Focused Browser Revalidation — Public Visual Refinement

**Date:** 11 August 2026
**Target:** prototype-only worktree `niuva-public-visual-refinement-r1-20260811`
**Server:** local loopback only (`127.0.0.1`, temporary port; stopped after run)

## Matrix

Routes `/`, `/projects`, three approved detail slugs, `/projects/no-such`,
`/contact`, `/contact?state=invalid`, and `/contact?state=unavailable` were
checked at 390, 768, 1024, and 1440px: **36/36 PASS**.

Every matrix entry had:

- 0 console errors/warnings and 0 page errors;
- 0 failed requests and 0 external requests;
- no horizontal overflow;
- no visible interactive target below 44px;
- no broken images, missing input labels, or missing required landmarks;
- no Review/evaluator vocabulary in Participant Mode.

## Focused state assertions

| Assertion | Result |
| --- | --- |
| Home exposes `Need → Research → Experiment → Prototype → Output` | PASS |
| Decorative numbered/mono labels removed | PASS |
| Retail click exposes visible deferred status and no transaction route | PASS |
| Unknown `/projects/no-such` renders not-found, never Pindad content | PASS |
| Persistence failure keeps valid values, clears field errors, shows retry alert | PASS |
| Retry returns focus to `#inquiry-form` and preserves values | PASS |
| Retry recovery can reach success state with `#contact-status` focus | PASS |

The persistence fixture was exercised by seeding
`contact-persistence-fail`, filling a valid form, submitting, activating
`Coba kirim lagi`, and submitting again. No provider, API, or durable storage
was invoked.

## Local checks

- `node --check app.js fixtures.js server.cjs`: PASS
- `node --test prototype-flow.contract.test.cjs`: **12/12 PASS**
- Impeccable detector on `index.html`, `review.html`, `styles.css`, `app.js`:
  `[]`
- `git diff --check`: PASS for tracked changes; candidate files are staged
  explicitly by path only at the publication gate.

This report is prototype evidence only. It is not production, staging,
provider, readiness, go-live, or moderated-session evidence.
