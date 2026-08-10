Method: dual-agent (A: /root/formal_critique_r10_a · B: /root/formal_critique_r10_b)

# Formal Expert Critique Rerun 3 — Public Visual Refinement Prototype R1

## Scope and gate verdict

- Target: isolated public/B2B visual refinement prototype r1 and its Home,
  Projects, three project-detail deep links, Contact, and Review handoff.
- Date: 10 August 2026.
- Owner decisions: OVR-01 through OVR-06 accepted; the visual direction remains
  candidate and packet-local.
- Production source, canonical authority, API, database, provider, deployment,
  and go-live are outside this review.
- Assessment A is an independent visual/UX/design-director review. Assessment B
  is independent technical/browser evidence. Each completed its observations
  without reading the other assessment or prior critique reports.

**PASS WITH CONDITIONS — THE P0/P1 PROTOTYPE CRITIQUE GATE IS CLEARED.**

R12-P1-01 (pre-submit channel copy) and R12-P1-02 (WhatsApp cancel/return
recovery context) are closed. No P0 or P1 findings remain. The direction is
specific to Niuva and the browser/accessibility floor is clean. Remaining P2/P3
items are visual polish and discoverability conditions; they do not authorize
production implementation, canonical promotion, publication, or a moderated
session.

## Design specificity verdict

**PASS — product-specific.** `Evidence-led Prototyping Editorial` remains
authored for Niuva: artifact-led proof, open editorial sheets, the
Need → Investigation → Decision → Artifact → Output thread, approved Niuva
media, and a B2B-first studio voice. The Inquiry-first plus WhatsApp-continuation
boundary is now legible in the participant flow. It is not a generic SaaS or
portfolio-card template.

## Nielsen heuristic scores

| # | Heuristic | Score | Key issue |
| --- | --- | ---: | --- |
| 1 | Visibility of system status | 3/4 | Inquiry, WhatsApp handoff, invalid, success, map, and recovery states are visible; sticky-header compositing still reduces polish. |
| 2 | Match system / real world | 4/4 | Inquiry-first wording, Niuva Operations, working calendar, and truthful WhatsApp sequencing match the accepted B2B model. |
| 3 | User control and freedom | 3/4 | Open, confirm, cancel, return, retry, and history paths work; Retail's deferred link has no visible destination. |
| 4 | Consistency and standards | 3/4 | Editorial surfaces and state boundaries are coherent; the Retail guardrail and map fallback are less explicit. |
| 5 | Error prevention | 3/4 | Form validation and no-false-success WhatsApp flow prevent the critical lifecycle error; persistence-failure fixture setup is less deterministic. |
| 6 | Recognition rather than recall | 3/4 | Contact channel contract and project evidence are understandable; Projects first-view image/context separation still adds recall work. |
| 7 | Flexibility and efficiency | 3/4 | Form and WhatsApp paths are both available, and return preserves data/focus; the form remains long and has no durable draft persistence. |
| 8 | Aesthetic and minimalist design | 3/4 | Strong sparse editorial direction; sticky-header bleed and Projects whitespace weaken final polish. |
| 9 | Error recovery | 3/4 | Invalid/history and WhatsApp recovery restore actionable targets below the header; map fallback lacks a concrete alternative. |
| 10 | Help and documentation | 2/4 | Response contract and simulation boundaries help; map unavailable and deferred Retail states need clearer visible guidance. |
| **Total** |  | **30/40** | **Good; no P0/P1 findings, with non-blocking P2/P3 conditions.** |

## Cognitive load and emotional journey

Cognitive load is moderate-low. The Contact route now makes the channel
sequence explicit: the form records the Inquiry, while WhatsApp is a later
handoff. Empty, partial, invalid, and submitted paths preserve the user's data
and restore a deliberate focus target. Remaining load comes from the long form
and the Projects index separating artifact from title/action in the first view.

The emotional journey is strongest on Home's confident artifact lead, the
Niuva-specific Projects evidence, and the truthful Contact acknowledgement. The
previous trust valleys—false WhatsApp success and context-losing cancel—are
closed. A smaller polish valley remains when the translucent header ghosts
large state headings and when a Projects artifact appears before its label.

## R12 remediation closure

- **R12-P1-01 — PASS:** Contact first-viewport copy now says that Inquiry is
  recorded only after the form is sent; WhatsApp is described as a continuation
  and no-auto-send boundary remains visible.
- **R12-P1-02 — PASS:** Empty and partial WhatsApp cancel/return preserve form
  values and restore focus to `#inquiry-form` below the sticky header. Invalid
  state restores `#form-error-summary`; valid submitted continuation restores
  `#contact-status`.
- **R11-P1-01 — PASS:** WhatsApp handoff has a distinct state and never
  impersonates Inquiry persistence before submission.
- Invalid browser-history rehydration, deep-link assets, map retry, and
  Review → Participant boundaries remain deterministic.

## Remaining P2/P3 conditions

- **R12-P2-01:** Make the sticky header opaque or adjust compositing so large
  invalid/success/handoff headings do not ghost through the navigation.
- **R12-P2-02:** Reduce the Projects first-view gap or add a compact factual
  title/caption near the artifact without abandoning the artifact-led layout.
- **R12-P2-03:** Give the deferred Retail path a visible guardrail state or
  explicit deferred label instead of a no-op `#retail` anchor.
- **R12-P2-04:** Provide an approved map-unavailable address/contact action, or
  state clearly that location detail is unavailable and route back to Contact.
- **R12-P3-01:** Make the persistence-failure Review fixture visibly
  deterministic on first open, or label it as a submit-triggered failure case.
- **R12-P2-05 (optional):** Keep the provider-neutral WhatsApp confirmed state
  clearly simulated; no real provider action is required for this prototype.

## Persona impact

- **Jordan — first-time B2B visitor:** sees a clear form-first/WhatsApp-later
  boundary and can distinguish handoff from recorded Inquiry.
- **Casey — distracted mobile visitor:** can choose either channel from the
  first viewport and returns to the same form context without losing work.
- **Riley — stress tester:** empty, partial, valid, invalid/history, map, and
  Review fixture paths are deterministic; deferred Retail and map copy remain
  the main visible edge cases.
- **Sam — keyboard/screen-reader user:** labels, alt text, landmarks, live
  regions, 44px targets, and focused recovery targets pass the checked floor;
  header compositing remains a low-vision polish concern.

## Strengths to preserve

- Niuva-specific editorial composition and artifact evidence rather than a
  generic SaaS/card template.
- Approved local assets, root-safe deep links, and provenance records.
- Explicit B2B response contract and Inquiry-first WhatsApp sequencing.
- Deterministic invalid/success/handoff focus, preserved synthetic values, and
  Review/Participant separation.
- Provider-neutral simulation boundary with no external requests or durable
  customer data.
- Responsive/accessibility floor: 44px targets, landmarks, skip-link, labels,
  live region, reduced-motion support, and no overflow in the checked matrix.

## Independent Assessment B evidence

- Impeccable detector: `[]`, exit 0.
- Syntax: `node --check app.js fixtures.js server.cjs` — PASS.
- Contract test: `node --test prototype-flow.contract.test.cjs` — **8/8 PASS**.
- Browser matrix: **24/24** (Home, Projects, three direct project details,
  Contact × 390/768/1024/1440px).
- Console/page errors and warnings: 0; external requests: 0; failed/bad
  responses: 0; horizontal overflow: 0; broken images: 0; visible targets
  below 44px: 0.
- Landmark, skip-link, `aria-live`, label, image, and Participant vocabulary
  checks: PASS.
- Targeted checks: explicit pre-submit copy; empty/partial cancel and return
  focus/scroll; valid submit continuation; invalid fixture/history; map retry;
  and Review → Participant handoff all passed.
- Local server was stopped and port 4178 was verified free. Temporary browser
  harness files were removed after the run.

## Gate boundary and next decision

The P0/P1 critique gate is cleared **with conditions** for this candidate
prototype. The owner may separately decide whether to address the listed P2/P3
polish items before any human session. This report does not authorize a
moderated session, publication, canonical promotion, production implementation,
commit, push, PR, merge, provider activation, deployment, or go-live.
