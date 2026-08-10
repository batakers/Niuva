# Visual QA — Public Visual Refinement Prototype r1

**Status:** R13 remediation plus focused browser QA complete — PASS WITH
CONDITIONS; prototype remains candidate-only.
**Direction:** Evidence-led Prototyping Editorial (candidate, not canonical).

## Rationale

This slice is deliberately smaller than the existing all-surface R6 prototype.
It tests whether the public routes feel like one Niuva studio with three clear
reading tasks rather than one repeated SaaS landing-page template.

## Anti-slop disposition

| Risk | Required disposition | Evidence |
| --- | --- | --- |
| Repeated hero → cards → CTA skeleton | Home uses artifact lead and evidence thread; Projects uses open rows; Contact uses form + response sheet | screenshot contact sheet |
| Generic rounded-card stacking | Dividers, definition groups, rails, and one meaningful sheet per task | 390/1440 captures |
| Fabricated proof or telemetry | Only manifest-listed approved local media; synthetic states labelled `SIMULASI` | asset manifest + visible-string audit |
| Blue used as wallpaper | Semantic blue limited to action, focus, links, and real state | token/style inspection |
| Review controls leaking into participant surface | Review harness is separate `review.html`; index has no evaluator vocabulary | DOM inspection |
| Blank provider fallback | Map unavailable state explains limitation and offers retry | contact-unavailable capture |

## Evidence disposition

| Parent criterion | Result | Evidence |
| --- | --- | --- |
| `CVR-001` Home is B2B-primary and not a marketplace template | PASS | `evidence/home-390.png`, `evidence/home-1440.png` |
| `CVR-002` Home, Projects, Contact have distinct composition contracts | PASS | route screenshots in `evidence/` |
| `CVR-003` Projects lead with artifact evidence and non-identical rows | PASS | `evidence/projects-1440.png`, `evidence/projects-pindad-ev-motor-1440.png` |
| `CVR-004` Contact communicates Inquiry, consent, WhatsApp, and response target | PASS | `evidence/contact-1440.png`, `evidence/r9-contact-390.png`, `evidence/r9-browser-results.json` |
| `CVR-005` Retail/Admin remain outside this public slice | PASS WITH CONDITION | Only a neutral Retail secondary path is shown; no operational surface was built |
| `CVR-006` No fabricated proof, telemetry, evaluator chrome, or AI filler | PASS | `ASSET_MANIFEST.md`, visible-string browser assertion |
| `CVR-007` Critical composition usable at 390px | PASS | 390px matrix and screenshots |
| `CVR-008` Motion optional and reduced-motion safe | PASS | CSS reduced-motion rule; no state depends on motion |
| `CVR-009` Map unavailable state is useful | PASS | local interaction check and `interaction-results.json` |
| `CVR-010` First viewport shows route thesis | PASS | Home artifact/action, Projects artifact/context, Contact response contract + form-entry CTA in `r9-contact-390.png` |
| `CVR-011` No identical hero → body → CTA skeleton | PASS | side-by-side route screenshots |
| `CVR-012` Typography boundary is labelled candidate | PASS | task card, brief, and packet authority notes |
| `CVR-013` Visual assets have provenance/alt records | PASS | `ASSET_MANIFEST.md` and checksum verification |

## Detector and browser result

- Impeccable detector: `[]` for `index.html`, `review.html`, `styles.css`, and
  `app.js` after the P2 polish pass.
- Browser matrix: R9 passed 24 route/viewport checks (six routes/deep links ×
  four viewports), with no overflow, no console error/warning, no external
  request, and no sub-44px visible target in the checked DOM.
- Interaction checks: invalid summary, success acknowledgement, map retry, and
  Review → Participant handoff passed. Details are in
  `BROWSER_REVALIDATION.md`, `evidence/interaction-results.json`, and
  `evidence/r9-browser-results.json`.
- Formal expert critique rerun: **28/40, P0 0, P1 2, FAIL**. The previous
  three P1 findings were closed by R10 remediation; the R10 critique findings
  are historical and superseded by the independent R11 rerun.
  See `FORMAL_EXPERT_CRITIQUE_RERUN.md`.
- R10 remediation revalidation: **24/24** route/viewport checks, actionable
  WhatsApp first viewport, seeded invalid summary/errors, map retry, success
  focus, and Review → Participant handoff all PASS. See
  `evidence/r10-browser-results.json`.
- R11 formal critique: **27/40, P0 0, P1 1, FAIL**. R10-P1-01 and R10-P1-02
  are closed. R11-P1-01 remains because WhatsApp-only confirmation renders
  the Inquiry-recorded success state before the form is submitted. See
  `FORMAL_EXPERT_CRITIQUE_RERUN_2.md` and the persisted Impeccable snapshot.
- R11 remediation revalidation: **24/24** route/viewport checks plus empty,
  partial, valid-submit continuation, cancel/preservation, invalid history,
  map retry, and Review → Participant WhatsApp boundary all PASS. Empty and
  partial handoff states no longer claim that an Inquiry was recorded. See
  `evidence/r11-browser-results.json`.
- R12 remediation revalidation: **24/24** route/viewport checks plus explicit
  pre-submit channel copy, empty/partial cancel focus restoration, valid-submit
  continuation, invalid history, map retry, and Review → Participant boundary
  all PASS. See `evidence/r12-browser-results.json`.
- Focused P2 polish revalidation: **24/24** route/viewport checks plus opaque
  header, artifact captions/alignment, visible Retail deferred state, explicit
  map fallback, and submit-triggered persistence fixture label all PASS. See
  `P2_POLISH_REVALIDATION.md` and `evidence/p2-browser-results.json`.
- Visual inspection found no unresolved in-scope anti-reference recurrence in
  the captured Home, Projects, and Contact frames. This is an internal expert
  pass, not a substitute for a separately authorized independent critique.

## Required review record

Record `CVR-001`–`CVR-013` from the parent direction packet with screenshot or
DOM evidence. Include route contact sheet at 390 and 1440px, plus 768 and
1024px functional checks. Do not mark this prototype ready for production from
visual evidence alone.

## Open review items

- [x] Impeccable detector result recorded.
- [x] Browser console/overflow/focus evidence recorded.
- [x] Asset checksums filled and verified.
- [x] Owner accepts direction label, route slice, typography boundary, evidence
      set, map fallback, and evidence storage location (OVR-01…OVR-06).
- [x] R10-P1-01 and R10-P1-02 remediated in prototype-only scope and focused
      browser evidence revalidated.
- [x] Independent dual-agent expert critique rerun after R10 remediation.
- [x] R11-P1-01 fixed with a distinct WhatsApp handoff state and revalidated.
- [x] R12-P1-01 and R12-P1-02 fixed with explicit channel copy and deliberate
      focus/scroll restoration, then revalidated.
- [x] Independent dual-agent expert critique rerun after R12 remediation:
      **30/40, P0 0, P1 0, PASS WITH CONDITIONS**. See
      `FORMAL_EXPERT_CRITIQUE_RERUN_3.md`.
- [x] Focused P2 polish applied and browser revalidated without reopening P0/P1.

## Non-blocking conditions

- Remaining conditions are limited to the R12 critique's non-blocking P3/polish
  observations (for example, exact map address policy and optional visual
  spacing review).
- These conditions do not authorize production implementation, canonical
  promotion, publication, or a moderated human session.

## R13 gate update — 11 August 2026

R13 closed the four P1 findings identified by the previous visual review:

- unknown project slugs now use a truthful not-found state;
- persistence failure is a dedicated retryable alert, not field validation;
- decorative numbered/uppercase mono labels were removed while preserving the
  editorial evidence thread;
- Home now exposes the canonical `Need → Research → Experiment → Prototype →
  Output` path and a visibly deferred Retail boundary.

Focused browser revalidation passed **36/36** route × viewport checks with no
console/page/network errors, overflow, broken images, missing labels/landmarks,
or sub-44px visible controls. Contract tests are **12/12** and the Impeccable
detector is `[]`. Formal R13 critique is **31/40, P0 0, P1 0, PASS WITH
CONDITIONS**; R13 P2 conditions are recorded in
`FORMAL_EXPERT_CRITIQUE_RERUN_13.md` and are non-blocking.
