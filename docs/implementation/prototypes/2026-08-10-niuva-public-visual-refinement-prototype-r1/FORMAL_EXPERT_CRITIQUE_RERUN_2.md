Method: dual-agent (A: /root/formal_critique_r10_a · B: /root/formal_critique_r10_b)

# Formal Expert Critique Rerun 2 — Public Visual Refinement Prototype R1

## Scope and gate verdict

- Target: isolated public/B2B visual refinement prototype r1 and its Home,
  Projects, three project-detail deep links, Contact, and Review handoff.
- Date: 10 August 2026.
- Owner decisions: OVR-01 through OVR-06 accepted; direction remains candidate
  and packet-local.
- Production source, canonical authority, API, database, provider, deployment,
  and go-live are outside this review.
- Assessment A is a design/UX review; Assessment B is evidence-only. Each was
  run independently without reading the other assessment or prior critique
  reports.

**FAIL — NOT READY FOR OWNER PUBLICATION OR MODERATED VALIDATION.**

The two R10 P1 findings are closed by the prototype-only remediation and focused
browser evidence. The independent design review found one new P1 semantic-flow
gap: confirming WhatsApp from an unsent or partially filled form renders the
Inquiry-recorded success state. There are no P0 findings. The technical/browser
evidence is clean, but the formal UX gate remains closed until the WhatsApp
handoff state is separated from Inquiry persistence and reviewed again.

## Design specificity verdict

**PASS — product-specific.** `Evidence-led Prototyping Editorial` remains
authored for Niuva: artifact-led proof, open editorial sheets, the
Need → Investigation → Decision → Artifact → Output thread, approved Niuva
media, and a B2B-first studio voice. Form + WhatsApp confirmation is expressed
as a bounded Niuva workflow rather than a generic contact-page template.

The remaining failure is a lifecycle/state contract problem, not a return to
AI-slop styling.

## Nielsen heuristic scores

| # | Heuristic | Score | Key issue |
| --- | --- | ---: | --- |
| 1 | Visibility of system status | 3/4 | Invalid, success, submitting, map, and WhatsApp states exist; WhatsApp-only still displays the wrong success status. |
| 2 | Match system / real world | 3/4 | Indonesian B2B language and response contract fit Niuva; “Inquiry tercatat” is false before form submission. |
| 3 | User control and freedom | 3/4 | Back, cancel, retry, and handoff controls exist; WhatsApp cancel can return to the false success state when a PIC value exists. |
| 4 | Consistency and standards | 3/4 | Editorial surfaces and deep links are consistent; WhatsApp and Inquiry lifecycle states are conflated. |
| 5 | Error prevention | 2/4 | Required fields and consent are clear, but the handoff confirmation permits a misleading record acknowledgement. |
| 6 | Recognition rather than recall | 3/4 | Contact first viewport exposes both actions and the response contract; project context and fallback details still need refinement. |
| 7 | Flexibility and efficiency | 2/4 | Form is usable and WhatsApp is now immediate; long-form entry has no durable draft persistence and the two paths need clearer sequencing. |
| 8 | Aesthetic and minimalist design | 3/4 | Distinctive sparse editorial system; sticky-header bleed and project first-viewport context reduce polish. |
| 9 | Error recovery | 2/4 | Field errors preserve input and focus correctly; the false WhatsApp success is a trust and recovery failure. |
| 10 | Help and documentation | 3/4 | Consent, response target, no-auto-send copy, and simulation boundary help; map fallback lacks concrete approved contact detail. |
| **Total** |  | **27/40** | **Acceptable lower band; one residual P1 keeps the gate closed.** |

## Cognitive load and emotional journey

Cognitive load is moderate-low. The page hierarchy, one-decision-at-a-time
composition, and first-viewport Contact actions are controlled. The remaining
failure is semantic rather than visual: a visitor can initiate WhatsApp before
submitting the form, then receive a success acknowledgement that implies a
persisted Inquiry. Projects image/context separation and the long Contact form
remain secondary working-memory costs.

The emotional journey is strongest on Home and the artifact-led Projects route,
and the Contact response sheet sets reassuring expectations. The peak-end breaks
when a WhatsApp-only handoff says the Inquiry is recorded; this is the specific
trust failure that blocks the gate.

## R10 remediation status

- Deep-link asset resolution: **PASS** — approved mark and Pindad, Agate, and
  Xeon media load on direct routes.
- Contact first viewport: **PASS** — response contract, primary form action,
  and actionable WhatsApp action are visible at 390px.
- Invalid/success status context: **PASS** — seeded invalid summary and valid
  success status receive focus below the sticky header.
- Review `contact-invalid` fixture: **PASS** — synthetic values, field errors,
  and summary are present on first open and through Review → Participant.

## Residual priority finding

### R11-P1-01 — WhatsApp handoff falsely claims that an Inquiry was recorded

**Observed behavior:** From an empty or partially filled `/contact` form,
selecting `WhatsApp cepat`, then `Lanjutkan ke WhatsApp`, sets the prototype
state to `success`. The resulting view says `Inquiry tercatat · simulasi`,
`Brief Anda siap ditinjau`, and shows a new Inquiry reference. Cancelling can
also return to that success view when a PIC value is present.

**Why it matters:** The approved B2B direction is Form + WhatsApp Cepat while
keeping the Inquiry recorded. The canonical lifecycle is Inquiry-first, with
WhatsApp as an optional continuation after persistence. A handoff from an
unsent form must not imply a persisted record, otherwise the participant cannot
distinguish “handoff ready” from “Inquiry submitted”.

**Prototype-only fix:** Introduce a distinct
`whatsapp-handoff-confirmed` state/view. It should say that the WhatsApp handoff
is ready or simulated, preserve the current form, and explicitly state that no
Inquiry was recorded because the form has not been submitted. Keep the existing
success view exclusively on the valid form-submit path. If WhatsApp is intended
only after submission, make that sequencing explicit instead of presenting the
button as a pre-submit action. Add contract and browser assertions for empty,
partial, valid-submit-then-WhatsApp, and cancel paths.

## P2 observations

- Auto-focused invalid/success states still show translucent sticky-header
  bleed over large headings; make the transition background opaque or adjust
  compositing/offset.
- Projects first-viewport media lacks a nearby visible title/action at desktop
  and mobile; add a compact factual label without abandoning the artifact-led
  composition.
- Home’s Retail secondary link has no visible destination or state; label the
  deferred path explicitly without activating Retail.
- Browser back/forward to `contact?state=invalid` can lose the seeded errors;
  rehydrate the fixture on popstate as well as initial load.
- Map-unavailable copy says to use contact detail but supplies no approved
  address or safe contact action.

## Persona red flags

- **Jordan — first-timer:** understands the B2B form and immediate WhatsApp
  choice, but may trust a false “Inquiry recorded” acknowledgement.
- **Casey — distracted mobile user:** first viewport is now clear; the long
  form and ambiguous post-handoff state still increase abandonment risk.
- **Sam — keyboard/screen-reader user:** labels, focus, landmarks, and live
  states are strong; visual state semantics must match the spoken/visible
  lifecycle.
- **Riley — stress tester:** empty, partial, cancel, and browser-history paths
  expose the WhatsApp/Inquiry state conflation and fixture rehydration gap.

## Strengths to preserve

- Niuva-specific editorial composition and artifact evidence rather than a
  generic SaaS/card template.
- Approved local assets with root-safe deep links and provenance records.
- Contact response contract and simultaneous visible Form + WhatsApp actions.
- Deterministic invalid/success focus, preserved synthetic values, and seeded
  Review → Participant validation.
- Participant/Review separation, neutral simulation boundary, and no external
  requests or provider activation.
- Responsive/accessibility floor: 44px targets, landmarks, skip-link, labels,
  live region, reduced-motion support, and no overflow in the checked matrix.

## Independent Assessment B evidence

- Impeccable detector: `[]`, exit 0.
- Syntax: `node --check app.js fixtures.js server.cjs` — PASS.
- Contract test: `node --test prototype-flow.contract.test.cjs` — **7/7 PASS**.
- Browser matrix: **24/24** (Home, Projects, three direct project details,
  Contact × 390/768/1024/1440px).
- Console/page errors and warnings: 0; external requests: 0; horizontal
  overflow: 0; broken images: 0; visible targets below 44px: 0.
- Landmark, skip-link, `aria-live`, label, and Participant vocabulary checks:
  PASS.
- Targeted checks: actionable WhatsApp first viewport, seeded invalid summary
  and preserved values, success focus below header, deep-link media, map retry,
  and Review → Participant handoff all passed.
- Server was stopped and port 4178 was verified free. Temporary browser
  harness files were removed after the run.

## Next gate

Keep the visual direction and prototype candidate-only. Remediate R11-P1-01 in
the isolated prototype, rerun focused browser evidence, then run another
independent dual-agent critique. No production implementation, canonical
promotion, commit, push, PR, merge, provider activation, deployment, or
moderated session is authorized by this report.
