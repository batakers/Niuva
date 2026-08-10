# Browser Revalidation — Public Visual Refinement Prototype r1

**Status:** R13 remediation and focused browser revalidation complete — PASS
WITH CONDITIONS; no production/readiness claim.

## Scope

The browser pass is local-only and must inspect Participant Mode separately from
the Review Mode handoff. No network provider, API, database, payment, upload,
analytics, map, or WhatsApp request may occur.

## Required matrix

| Route/state | 390px | 768px | 1024px | 1440px | Console | Overflow | Keyboard/focus | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home artifact lead | PASS | PASS | PASS | PASS | 0 | no | PASS | `evidence/home-{390,768,1024,1440}.png` |
| Projects index | PASS | PASS | PASS | PASS | 0 | no | PASS | `evidence/projects-{390,768,1024,1440}.png` |
| Project detail (Pindad/Agate/Xeon deep links) | PASS | PASS | PASS | PASS | 0 | no | PASS | `evidence/projects-pindad-ev-motor-{390,768,1024,1440}.png`, `r9-detail-pindad-390.png` |
| Contact empty | PASS | PASS | PASS | PASS | 0 | no | PASS | `evidence/contact-{390,768,1024,1440}.png`, `r10-contact-390.png` |
| Contact invalid fixture | PASS | — | — | — | 0 | no | seeded summary focused and viewport-safe | `evidence/r10-invalid-390.png`, `r10-browser-results.json` |
| Contact persistence unavailable | PASS | — | — | — | 0 | no | visible recovery message | `interaction-results.json` |
| Contact success | PASS | — | — | — | 0 | no | acknowledgement focused and viewport-safe | `evidence/contact-success-390.png`, `r9-browser-results.json` |
| Map unavailable/retry | PASS | — | — | — | 0 | no | fallback and retry visible | `interaction-results.json` |
| WhatsApp / Review handoff | PASS | — | — | — | 0 | no | handoff status focused; no false Inquiry success; review controls absent | `r11-browser-results.json` |

## Assertions

- No horizontal overflow or clipped primary action.
- Participant screenshots contain only product language and the neutral
  `SIMULASI` notice; no fixture/evaluator/packet vocabulary.
- Home, Projects, and Contact have distinct first-viewport composition.
- Focus is visible; error summary receives focus; form values survive invalid
  submission; state feedback is visible and announced once.
- Map unavailable state is useful and recoverable.
- Reduced motion removes non-essential transitions.
- No console error or warning appears during selected flows.

## R9 remediation assertions

- Deep links resolve the approved mark and project artwork from the prototype
  asset root; Pindad, Agate, and Xeon detail routes all returned loaded media.
- Contact 390px first viewport exposes Owner, response target, calendar, and
  both the primary `Mulai isi form` action and secondary `WhatsApp cepat`
  action before the fold. WhatsApp opens a no-auto-send confirmation.
- The official `contact-invalid` fixture opens with synthetic preserved values,
  field errors, and a visible summary; Review → Participant uses the same state.
- Invalid submission focuses `#form-error-summary` and positions it below the
  sticky header; success focuses `#contact-status` with the same safe offset.
- Map retry and valid submission continue to produce the expected local states.
- R11 remediation now gives the WhatsApp handoff its own status view. Empty and
  partial forms explicitly say that Inquiry belum tercatat; a valid submitted
  Inquiry keeps its recorded status as a continuation. Cancel preserves the
  prior form/state, and Review → Participant uses the same boundary.
- R12 remediation makes the first-viewport channel note explicit: Inquiry is
  recorded only after form submission. WhatsApp cancel/return now restores a
  deliberate focus target (`#inquiry-form` or `#form-error-summary`) below the
  sticky header, with preserved values and sensible scroll.

The matrix was executed with local Playwright against `http://127.0.0.1:4178`
at the listed viewports. R11 covered 24 route × viewport checks (six routes or
deep links × four widths) and observed no request outside that local origin.
Focused R12 assertions are recorded in `evidence/r12-browser-results.json`.
Passing this matrix is prototype evidence only; it is not a production
readiness, provider activation, or human-research result. The independent
formal R12 critique is recorded in `FORMAL_EXPERT_CRITIQUE_RERUN_3.md`.
The P0/P1 critique gate is cleared with non-blocking P2/P3 conditions; this
does not authorize a human session or production/readiness claim.

## Focused P2 polish revalidation — 11 August 2026

The following prototype-only refinements were checked against the current
source: opaque sticky header, factual project captions/alignment, visible
Retail deferred state, explicit map fallback, and submit-triggered persistence
fixture label.

- Browser matrix: **24/24 PASS** across Home, Projects, Pindad/Agate/Xeon deep
  links, and Contact at 390/768/1024/1440px.
- Console errors/warnings: **0**; page errors: **0**; external requests: **0**.
- Horizontal overflow: **0**; broken images: **0**; visible targets below
  44px: **0**; missing landmarks: **0**.
- Retail click reveals a visible deferred notice and does not create a hash
  route; map-unavailable copy directs visitors to the form and retry restores
  the simulated map; persistence fixture label states `gagal setelah submit`.
- Impeccable detector after edits: `[]`.
- Contract test after edits: **9/9 PASS**.
- Server stopped and port verified free: `port-4178=free`.

Evidence: `evidence/p2-browser-results.json`,
`P2_POLISH_REVALIDATION.md`, and the four `evidence/p2-*.png` captures.
This focused pass does not replace a separately authorized independent formal
critique or moderated human session.

## R13 remediation revalidation — 11 August 2026

The R13 prototype-only pass closed the four P1 findings from the independent
visual review: unknown project slug substitution, persistence failure being
misclassified as validation, repeated numbered/uppercase mono grammar, and
missing canonical U-curve/Retail traceability.

- **36/36 PASS** across Home, Projects, three approved detail routes,
  `/projects/no-such`, Contact invalid, and map-unavailable states at
  390/768/1024/1440px.
- Console/page errors: **0**; failed/external requests: **0**.
- Overflow, broken images, missing labels/landmarks, forbidden Participant
  vocabulary, and visible controls below 44px: **0**.
- Unknown slug shows `Project tidak ditemukan` with a Projects return link and
  no Pindad substitution.
- Persistence failure shows `#persistence-status` with `role="alert"`, keeps
  valid field values, has no `aria-invalid` fields, and offers a retry that
  restores `#inquiry-form` focus before successful recovery.
- Home exposes the canonical `Need → Research → Experiment → Prototype →
  Output` path and a visible Retail-deferred status.

The independent R13 critique is recorded in
`FORMAL_EXPERT_CRITIQUE_RERUN_13.md`. Remaining R13 P2 conditions are
non-blocking and intentionally deferred to a later polish pass.
