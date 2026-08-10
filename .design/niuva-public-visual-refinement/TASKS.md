# Build Tasks: Niuva Public Visual Refinement Prototype

Generated from: `.design/niuva-public-visual-refinement/DESIGN_BRIEF.md`
Date: 10 August 2026

All tasks are prototype-only and must remain inside the isolated build root.
Production source, canonical documents, APIs, databases, providers, and
external network calls are out of scope.

## Foundation

- [ ] **Establish the local visual vocabulary**: implement Poppins/Inter roles,
  approved semantic palette, type/spacing tokens, focus/error/status styles,
  and the shared public shell without adding a font, palette, UI kit, or icon
  family. _New prototype files; authority from `DESIGN.md` and the refinement
  packet._
- [ ] **Copy and register approved evidence assets**: copy only the approved
  mark and project media from the existing R6 prototype, record source paths,
  SHA-256, dimensions, alt intent, and simulation status in
  `ASSET_MANIFEST.md`. _Reuses approved local media; no generated proof._
- [ ] **Create the Participant/Review boundary**: keep `index.html` free of
  fixture, evaluator, route-contract, and review controls; put state seeding in
  `review.html` and `fixtures.js`. _New prototype files._

## Core UI

- [ ] **Home artifact lead**: build the `/` route with one dominant approved
  artifact, B2B-primary `Diskusikan Project`, a readable evidence thread, and
  a secondary Retail route without a generic feature-card grid. _New
  prototype composition; depends on Foundation._
- [ ] **Projects editorial index and detail**: build `/projects` and one detail
  state with varied image scale and an explicit challenge → decision → output
  sequence using only source-approved content. _New prototype composition;
  depends on asset registration._
- [ ] **Contact inquiry composition**: build `/contact` with the approved fields,
  consent wording, response target, and one primary submission intent plus an
  optional WhatsApp confirmation boundary. _New prototype composition; depends
  on shared shell._

## Interactions & States

- [ ] **Validation and recovery states**: cover empty, invalid, submitting,
  persistence-unavailable simulation, success, and preserved-field recovery.
  _New local state machine; no network or durable Inquiry._
- [ ] **Map loading/unavailable fallback**: show useful address context and
  retry/alternative action for provider-unavailable state; never render a blank
  rectangle. _New local state fixture._
- [ ] **Evidence and copy guardrails**: assert no fabricated metric, client
  proof, telemetry, evaluator string, duplicate CTA intent, or English filler
  leaks into Participant Mode. _Contract tests and visible-string audit._
- [ ] **Review scenario reset**: seed each supported state from Review Mode and
  hand off to a clean Participant URL with a neutral simulation notice only.
  _New local fixture flow._

## Responsive & Polish

- [ ] **Responsive composition pass**: validate 390/768/1024/1440px with route-
  specific layout changes, no overflow, stable primary actions, and reserved
  media dimensions. _Prototype CSS and browser evidence._
- [ ] **Accessibility pass**: verify landmarks, focus, keyboard order, error
  summary, live-region feedback, contrast evidence, reduced motion, and 44px
  targets. _Prototype QA only; no canonical WCAG claim._
- [ ] **Impeccable visual review**: run the detector once after the complete
  build, then perform a screenshot critique against `CVR-001`–`CVR-013` and
  record unresolved items in `VISUAL_QA.md`. _Review artifact, not production
  authority._

## Review

- [ ] **Browser evidence**: record route, viewport, fixture/state, console,
  overflow, keyboard/focus, Participant/Review entry, asset identity, and
  screenshot path in `BROWSER_REVALIDATION.md`.
- [ ] **Handover gate**: report changed and intentionally unchanged files,
  checks, open owner decisions, and the separate publication/expert-critique
  gate. Do not commit, push, open, ready, or merge without explicit approval.
