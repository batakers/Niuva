⚠️ DEGRADED: single-context (sub-agent spawn failed: You've hit your usage limit. Upgrade to Pro (<https://chatgpt.com/explore/pro>), visit <https://chatgpt.com/codex/settings/usage> to purchase more credits or try again at Aug 10th, 2026 1:24 AM.)

# Formal Expert Critique — Round 7

Gate decision: **FAIL — NOT READY TO RUN**
Date: 3 August 2026
Target: `docs/implementation/prototypes/2026-07-31-niuva-mvp-clickable-prototype/`
Scope: UX, UI, visual quality, flow integrity, Participant Mode, canonical
alignment, and suitability as a moderated-validation instrument

## Executive Direction

The prototype is substantially better than a wireframe: it explains the
Retail/B2B separation, preserves direct Order identity, gives customers useful
production milestones, and keeps provider behavior simulated. It is not yet a
safe moderated-test instrument. Four P1 findings can change participant
behavior or teach an incorrect route/lifecycle model.

The strongest design quality is operational honesty. The weakest point is the
transition from coherent individual screens to trustworthy cross-screen state:
the interface sometimes advertises an action whose state is absent, hides an
active reservation after back-navigation, or falls through to a generic 404
where canonical compatibility behavior is already decided.

Human sessions must remain blocked. Candidate cart and after-sales route
recommendations remain `INSUFFICIENT_EVIDENCE`.

## Method and Evidence Boundary

Assessment A reviewed the experience before reading the detector result or
prior critique files. It exercised Public, Retail, Request/Offer, checkout,
Order tracking, after-sales, and Admin paths in visible Chrome at desktop and
390 x 844 px.

Assessment B began only after Assessment A was complete. The two requested
independent agents both failed before evidence collection because of the usage
limit shown above, so Assessment B was a sequential second pass in the root
context. It repeated the critical default Admin, legacy `/order`, mobile CTA,
and active-reservation paths, then ran the static detector.

The Impeccable CLI detector returned `[]` with exit code 0. That is a useful
negative static-style signal, but it does not test route policy, seeded state,
or back-navigation lifecycle integrity. Mutable overlay injection was not
available in the selected browser surface; live DOM snapshots, screenshots,
direct navigation, interaction, and source inspection were used instead.

No human participant was involved, and no automated result is represented as
human usability evidence.

## Experience Summary

### What the experience communicates well

- The Unified Homepage keeps B2B primary while making Retail discoverable.
- Ready Product and Custom Print are distinct without feeling like separate
  websites.
- Login before checkout is explained as an ownership and tracking boundary.
- Request and Assisted Offer remain visibly separate from Order and payment.
- Checkout clearly explains when the 30-minute reservation starts.
- `/orders/NV-DIRECT-999` retains its non-fixture identity through refresh and
  customer after-sales links.
- Production milestones and complaint status expose customer-safe next steps
  without internal cost, margin, or operator notes.
- Admin is organized around ranked work rather than a decorative KPI grid.

### Where confidence breaks

- The default Admin dashboard sends a non-IT operator to a case that does not
  exist in that session, then instructs the participant to use the moderator
  fixture.
- `/order` renders a generic prototype 404 instead of the canonical safe
  unavailable compatibility state.
- Mobile sticky actions say only “Lanjut” even when they perform materially
  different actions such as adding a product or entering checkout.
- After an Order and payment attempt exist, the customer can return to an
  ordinary editable cart that does not reveal the active reservation.

## Nielsen Heuristic Score

Scoring: 1 = poor, 4 = strong for this prototype's validation purpose.

| Heuristic | Score | Evidence |
| --- | ---: | --- |
| Visibility of system status | 3 | Reservation, payment, production, and complaint status are clear on their own pages; active reservation disappears in cart. |
| Match with the real world | 3 | Order, Request, Offer, printing, QC, pickup/delivery, and after-sales language is understandable. |
| User control and freedom | 2 | Back-navigation after Order creation exposes an ambiguous editable cart without a defined recovery/cancel path. |
| Consistency and standards | 2 | Sticky “Lanjut” conflicts with specific main CTAs; default Admin task conflicts with available state. |
| Error prevention | 2 | Pay guard and immutable fulfillment help, but the active attempt/cart relationship is not protected or explained. |
| Recognition rather than recall | 3 | Totals, milestones, and next actions are visible; active lifecycle context still requires memory. |
| Flexibility and efficiency | 2 | Operator shortcuts are promising, but one advertised shortcut is a dead end in the default fixture. |
| Aesthetic and minimalist design | 3 | Calm palette and readable cards; oversized first-fold media and repeated motifs dilute hierarchy. |
| Error recognition and recovery | 2 | Several fail-closed states exist, but the default case dead end and `/order` 404 do not offer the correct recovery. |
| Help and documentation | 2 | Prototype disclosures are strong; Participant Mode leaks evaluator setup instructions in a failed case state. |
| **Total** | **24/40** | **Acceptable foundation, not yet suitable for human-session evidence.** |

## Anti-Pattern and Visual-Quality Verdict

AI-pattern risk is **moderate**, not dominant. The product does not look like a
generic marketplace and avoids gradients, glass, neon, and dashboard vanity
metrics. However, repeated tiny uppercase eyebrows, identically bordered
cards, numbered next-action rows, oversized display type, and large placeholder
line art form a recognizable generated-design vocabulary. The visual system is
coherent, but it is not yet distinctly Niuva beyond its palette and FDM layer
metaphor.

On mobile Ready Product, the product H1 began around 936 px on an 844 px-high
viewport because the placeholder artwork consumed the first screen. This makes
the first actionable product context arrive too late, even though there was no
horizontal overflow and no visible interactive target below 44 px in the
audited routes.

## Cognitive Load and Emotional Journey

Cognitive load is moderate. Progressive disclosure and chunked status panels
work well, but three burdens remain:

1. the customer must infer what generic “Lanjut” will do on each mobile page;
2. the customer must remember an active reservation after the cart stops
   displaying it; and
3. the operator must understand that a dashboard task may require a hidden
   moderator fixture before it can be completed.

The emotional high point is post-payment tracking: the milestone sequence,
paid state, Order identity, and customer-safe detail are reassuring. Complaint
case status also ends with a credible next action. The main confidence valleys
are the active-reservation back path and the operator dead end; both make the
prototype feel less deterministic at exactly the moments where trust matters.

## Findings

### R7-P1-01 — Default operator action opens unavailable case

Severity: **P1**

The default `/admin` dashboard lists “Tinjau CASE-DEMO-01” and a “Buka kasus”
action. Following it in Participant Mode opens “Kasus tidak tersedia” because
`state.complaintCase` is empty. The screen then says to choose a fixture from
“Panel Moderator”, which exposes evaluator machinery to the participant.

Source evidence: `app.js:1762-1765` advertises the task;
`app.js:2015-2023` renders the missing-state and moderator instruction.

Impact: the operator's primary-task evidence becomes invalid because the
participant cannot know whether the dead end is the product model or test
setup.

Required remediation:

- seed the advertised case in the default operator fixture, or omit/disable the
  dashboard task until the case exists;
- remove all Panel Moderator instructions from Participant Mode;
- prove direct entry and dashboard navigation both reach the same truthful case
  state without moderator controls.

### R7-P1-02 — Legacy `/order` violates the canonical compatibility state

Severity: **P1**

Direct `/order` falls through to “Route belum dibuat” and returns only to Home.
`DEC-UX-003` requires a safe unavailable compatibility state before
transactional activation, followed by a later redirect to `/retail` only when
activation is separately authorized. It must never become a new checkout.

Source evidence: `app.js:2163-2169` provides the generic 404 and
`app.js:2175-2209` has no `/order` branch. Canonical evidence:
`DEC-UX-003:102-113`.

Impact: the prototype teaches the wrong legacy-route contract and cannot be
used to validate the approved route topology.

Required remediation: add a dedicated, non-mutating safe-unavailable `/order`
screen with a clear Retail discovery path. Do not implement the post-activation
redirect in this prototype unless that activation is separately authorized.

### R7-P1-03 — Mobile sticky CTA hides the actual action

Severity: **P1**

The Ready Product sticky bar performs `add-ready` but says “Lanjut”; the cart
sticky bar performs `go-checkout` but also says “Lanjut”. Their corresponding
main CTAs correctly say “Tambah ke keranjang” and “Lanjut checkout”.

Source evidence: `app.js:341-346` defaults to “Lanjut”;
`app.js:669-676` and `app.js:940-952` call the helper without a specific button
label.

Impact: on mobile the persistent control is the most visible action, so the
generic label weakens informed consent and makes two different lifecycle steps
look identical.

Required remediation: pass explicit labels at every call site, at minimum
“Tambah ke keranjang” and “Lanjut checkout”; reduce the Ready Product media
height so product identity and the first decision appear in the initial
viewport; repeat keyboard, overflow, and touch-target checks.

### R7-P1-04 — Active reservation becomes invisible in editable cart

Severity: **P1**

After “Konfirmasi & buat pesanan”, checkout correctly creates an Order/payment
attempt and starts the 30-minute reservation. Yet the page retains “Kembali ke
keranjang” while also saying fulfillment is locked and the user should return
to a “pratinjau”. The cart then shows no active Order, payment attempt, or
reservation warning and leaves quantity/removal controls available. Re-entering
checkout restores the same active attempt, so no duplicate was observed, but
the intermediate state is misleading.

Source evidence: `app.js:1101-1105` always links back to cart and visually marks
the stepper; `app.js:1146` says to return to a preview after the Order already
exists.

Impact: a participant may believe cart edits replace the active Order snapshot,
or may initiate an inconsistent retry. This contaminates the cart and checkout
mental-model tasks.

Required remediation: define and display one explicit active-attempt recovery
model. The cart must reveal the existing Order/reservation and either prevent
mutation or explain a deliberate cancel/reprice/revalidation operation. Copy
must not promise return to a pre-Order preview after the Order exists.

### R7-P2-01 — Checkout stepper status is visual-only

Severity: **P2**

Stepper list items receive `done` and `current` classes, but no `aria-current`
or equivalent status text. In the audited confirmed-checkout state, the DOM had
zero `[aria-current]` elements. Visual styling communicates progress; assistive
technology receives only four undifferentiated list items.

Source evidence: `app.js:1086-1105`; visual states in
`styles.css:906-965`.

Recommended remediation: add `aria-current="step"` to the current item and
provide concise completed/current wording that remains understandable without
CSS.

## Persona Red Flags

| Persona | Risk |
| --- | --- |
| Prospective Retail customer | Generic mobile actions and hidden active reservation can create a wrong belief about when an Order exists or what an edit changes. |
| Niuva non-IT operator | Default next action opens a dead end and asks for evaluator knowledge that the operator should never need. |
| Screen-reader user | Checkout progress is not exposed as current/completed state. |
| Product decision owner | `/order` demonstrates behavior that conflicts with an already approved canonical route contract. |

## Minor Observations

- `/services` correctly resolves to `/capabilities`; `/portfolio` correctly
  resolves to `/projects`.
- `/admin/orders` remains clearly labelled and read-only.
- Direct `/orders/NV-DIRECT-999` retained URL, H1, refresh identity, and
  after-sales links.
- Request and Offer copy correctly state that neither is an Order or payment.
- Participant Mode removed the moderator panel and query parameter when opened
  from moderator mode; the remaining leak is the failed-case instruction.
- Audited mobile routes had no horizontal overflow and no visible control below
  44 px.
- Keyboard focus began at the skip link and showed a visible 3 px outline on
  the tested product path.
- No console error or warning was observed in the completed browser passes.
- The static detector produced zero findings; no detector false positive
  required suppression.

## Gate and Remediation Order

Gate: **FAIL — NOT READY TO RUN**.

Recommended prototype-only sequence:

1. fix `R7-P1-01` and remove Participant Mode evaluator leakage;
2. implement the safe-unavailable `/order` compatibility state for
   `R7-P1-02`;
3. resolve the active reservation/cart recovery contract in `R7-P1-04`;
4. make mobile actions explicit and reduce first-fold obstruction for
   `R7-P1-03`;
5. add semantic stepper status for `R7-P2-01`;
6. run focused browser revalidation from clean sessions, followed by another
   full expert critique with restored independent assessment evidence.

No moderated session may start until the next formal gate records zero open P0
and P1. Even after that gate passes, candidate routes remain
`INSUFFICIENT_EVIDENCE` until one non-IT operator and one prospective customer
complete the approved moderated plan.

## Questions for the Next Review

- Does every participant-visible task exist in the default state in which it
  is advertised?
- Can a customer always tell whether they are editing a draft cart or viewing
  an already-created Order snapshot?
- Does each persistent mobile action name the irreversible or lifecycle-changing
  step it performs?
- Do legacy routes demonstrate the approved compatibility behavior instead of
  falling through to a generic prototype state?
- Can progress and recovery be understood without color, CSS class names, or
  moderator knowledge?
