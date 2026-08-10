Method: dual-agent (A: /root/formal_critique_r9_a · B: /root/formal_critique_r9_b)

# Formal Expert Critique Rerun — Public Visual Refinement Prototype R1

## Scope and gate verdict

- Target: isolated public/B2B visual refinement prototype r1 and its Home,
  Projects, three project-detail deep links, Contact, and Review handoff.
- Date: 10 August 2026.
- Owner decisions: OVR-01 through OVR-06 accepted; direction remains candidate
  and packet-local.
- Production source, canonical authority, API, database, provider, deployment,
  and go-live are outside this review.

**FAIL — NOT READY FOR OWNER PUBLICATION OR MODERATED VALIDATION.**

The three P1 findings from the previous critique are resolved and independently
revalidated. The current design review found two new P1 gaps in the B2B review
flow. There are no P0 findings. The technical/browser evidence is clean, but
the formal UX gate remains closed until the two residual P1 findings are fixed
in the prototype and reviewed again.

## Design specificity verdict

**PASS — product-specific.** `Evidence-led Prototyping Editorial` still feels
authored for Niuva: artifact-led proof, open editorial sheets, the
Need → Investigation → Decision → Artifact → Output thread, and a B2B-first
studio voice. It is not a generic SaaS dashboard or interchangeable portfolio
card grid.

The remaining problems are flow and validation-contract gaps, not a return to
AI-slop styling.

## Nielsen heuristic scores

| # | Heuristic | Score | Key issue |
| --- | --- | ---: | --- |
| 1 | Visibility of system status | 3/4 | Success and invalid states are now focused and visible; the invalid fixture itself does not open with seeded errors. |
| 2 | Match system / real world | 3/4 | Inquiry, owner, calendar, and artifact language fit Niuva; map fallback remains vague. |
| 3 | User control and freedom | 3/4 | Back, retry, cancel, and handoff controls exist; WhatsApp is not immediately actionable on mobile. |
| 4 | Consistency and standards | 3/4 | Deep links now load assets consistently; Review fixture semantics diverge from the visible invalid state. |
| 5 | Error prevention | 3/4 | Required fields, consent, and preservation are clear; fixture setup can mislead a reviewer before submission. |
| 6 | Recognition rather than recall | 3/4 | First viewport now exposes response contract and form CTA; WhatsApp choice still requires remembering to scroll. |
| 7 | Flexibility and efficiency | 2/4 | Form path is usable but long, and mobile has no immediate secondary WhatsApp action. |
| 8 | Aesthetic and minimalist design | 3/4 | Editorial system is restrained and distinctive; a few internal/prototype labels and fallback ambiguities remain. |
| 9 | Error recovery | 3/4 | Invalid and success focus/scroll are safe; the official invalid fixture does not itself demonstrate recovery until submit is repeated. |
| 10 | Help and documentation | 2/4 | Response contract helps; map fallback and invalid-fixture guidance are incomplete. |
| **Total** |  | **28/40** | **Good lower band; residual P1 work required.** |

## Cognitive load and emotional journey

Cognitive load is low-to-moderate. Grouping, hierarchy, and visible choice count
are controlled, and Contact’s first viewport is materially clearer after R9.
Two failures remain: a mobile participant must scroll to discover the WhatsApp
choice, and a reviewer must infer that `contact-invalid` needs a second submit
to reveal its state. The emotional peak remains the artifact-led Home/Projects
story and the explicit success acknowledgement; the valleys are the silent
WhatsApp alternative and the misleadingly normal invalid fixture.

## Previous P1 remediation status

- Deep-link asset resolution: **PASS** — Pindad, Agate, and Xeon media and the
  approved mark load on direct routes.
- Contact mobile first viewport: **PASS** — Owner, response target, calendar,
  and one primary `Mulai isi form` action are visible at 390px.
- Invalid/success visible status context: **PASS** — focus lands on the summary
  or status region below the sticky header.

## Residual priority findings

### R10-P1-01 — WhatsApp alternative is not actionable in the mobile first viewport

**Why it matters:** The accepted B2B direction is Form + WhatsApp Cepat
sekaligus tetap tercatat. At 390px the first viewport shows only the note
“WhatsApp cepat tersedia sebagai pilihan sekunder di dalam form.” A prospect
cannot choose that channel without scrolling through a long form, and the
prototype does not validate the simultaneous channel choice it promises.

**Fix:** Add one visible secondary `WhatsApp cepat` button beside or directly
under `Mulai isi form` in the Contact intro. Keep the form CTA primary, show a
clear no-auto-send confirmation, and preserve the rule that the Inquiry record
remains the primary record. Suggested command: `$impeccable clarify` plus
`$impeccable layout` within the prototype scope.

### R10-P1-02 — `contact-invalid` fixture does not seed an actionable invalid state

**Why it matters:** Review Mode labels the fixture “Contact · validasi gagal”,
but it only writes `state=invalid`. The participant page shows the invalid
title/intro while `state.errors` is empty, so a reviewer sees a normal form
until submitting again. This weakens the prototype as a validation instrument
and makes evidence capture non-deterministic.

**Fix:** Seed a synthetic invalid fixture with representative preserved values,
field errors, and a visible summary on first open, or change the fixture label
and harness to explicitly drive the submit action. Keep all values synthetic
and local; do not add a production persistence contract. Suggested command:
`$impeccable harden` within the prototype scope.

## P2 observations

- Map-unavailable copy says an address remains usable but gives no approved
  address or safe link.
- Home’s Retail CTA updates only a screen-reader region; its deferred state is
  not visibly acknowledged.
- Detail figcaption says “disetujui untuk prototype visual ini”, which is
  internal/prototype wording that should not appear in Participant Mode.
- Invalid summary is safe and visible, but the preceding form heading is still
  partially clipped by the sticky header in the visual composition.

## Persona red flags

- **Jordan — first-timer:** understands the primary form CTA but may not know
  that WhatsApp is an immediate alternative; the invalid fixture does not show
  what “validasi gagal” means until another action is taken.
- **Casey — distracted mobile user:** must scroll through a long form to choose
  WhatsApp and has no bottom action rail; interruption increases abandonment
  risk even though the first viewport itself is now clear.
- **Sam — keyboard/screen-reader user:** labels, focus, landmarks, and live
  states are strong; sticky-header context and the absence of a visible
  WhatsApp control still need sighted keyboard confirmation.
- **Riley — stress tester:** can expose the fixture mismatch and the silent
  Retail/map fallbacks even though the core browser matrix is clean.

## Strengths to preserve

- Strongly Niuva-specific artifact/editorial composition and B2B-first narrative.
- Root-safe deep links with approved local assets and provenance records.
- Compact Contact response contract visible before the fold.
- Deterministic focus/scroll behavior for invalid and success states.
- Participant/Review separation, neutral simulation boundary, and no evaluator
  vocabulary leakage.
- Responsive/accessibility floor: 44px targets, landmarks, skip-link, labels,
  live region, no overflow, and reduced-motion support.

## Independent Assessment B evidence

- Impeccable detector: `[]`, exit 0.
- Syntax: `node --check app.js fixtures.js server.cjs` — PASS.
- Contract test: `node --test prototype-flow.contract.test.cjs` — **7/7 PASS**.
- Browser matrix: **24/24** (Home, Projects, three direct project details,
  Contact × 390/768/1024/1440px).
- Console/page errors and warnings: 0; external requests: 0; horizontal
  overflow: 0; visible targets below 44px: 0; broken images: 0.
- Landmark, skip-link, `aria-live`, label, and Participant vocabulary checks:
  PASS.
- Targeted checks: deep-link media loaded; Contact first-viewport contract and
  CTA visible; invalid summary and success status focused below sticky header;
  map retry, valid submit, and Review → Participant handoff passed.
- The wrapped consent checkbox has a semantic `<label>`; a simplistic
  `label[for]` detector would be a false positive.

## Questions for the next decision

- Should WhatsApp be an equal first-step channel or a secondary continuation,
  given the accepted Form + WhatsApp direction?
- Should the invalid fixture open already invalid, or should Review Mode make
  the submit action explicit in its label/instructions?
- Is there an approved public studio address or link for the unavailable-map
  state?

## Next gate

Keep the prototype and visual direction candidate-only. Remediate R10-P1-01 and
R10-P1-02 in the isolated prototype, rerun focused browser evidence, then run
another independent dual-agent critique. No production implementation,
canonical promotion, commit, push, PR, merge, provider activation, deployment,
or moderated session is authorized by this report.
