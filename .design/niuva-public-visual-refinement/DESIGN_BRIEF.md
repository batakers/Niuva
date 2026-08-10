# Design Brief: Niuva Public Visual Refinement

**Status:** Candidate — Context Only — prototype-only working brief
**Baseline:** `origin/main` at `954837c9dd4fcaeb9438c16fb6934210e082a364`
**Parent packet:** `docs/implementation/specs/candidates/2026-08-10-niuva-visual-refinement-direction-packet.md`

## Problem

The current public surfaces are usable but visually read as one repeated
landing-page template: a large hero, pale section, rounded content blocks, and
a final blue action. A prospective partnership client can miss the actual
evidence of Niuva's work, while the Projects and Contact routes do not yet feel
like distinct tasks. The refinement must make Niuva feel like a working
engineering and fabrication studio without inventing proof or changing the
approved product scope.

## Solution

Create a small, isolated, clickable visual prototype for the public slice:
Home, Projects, and Contact. Each route uses the same approved tokens but a
different composition contract:

- Home leads with one credible project artifact and a B2B-primary action.
- Projects leads with artifact context and a readable challenge → decision →
  output sequence instead of a repeated card grid.
- Contact leads with the inquiry brief, consent, human-response expectation,
  and an intentional WhatsApp handoff; it never promises a quotation or ETA.

The prototype uses local approved media and synthetic state fixtures only. It
does not call a production endpoint, create an Inquiry, open WhatsApp, or
change production UI.

## Experience Principles

1. **Evidence before decoration** — an approved artifact or truthful missing-
   evidence note gets visual priority over ornamental gradients, metrics, or
   stock imagery.
2. **Route intent before template reuse** — share tokens and navigation, not a
   single hero → cards → CTA skeleton.
3. **Confidence over cleverness** — the form, consent, fallback, and response
   contract are explicit; motion is optional and never carries meaning alone.

## Aesthetic Direction

- **Philosophy:** Evidence-led Prototyping Editorial (packet-local candidate
  label; not a new brand or canonical replacement for Experimental Editorial
  Hybrid).
- **Tone:** Precise, warm, grounded, quietly technical, and collaborative.
- **Reference points:** Niuva's approved Experimental Editorial Hybrid,
  artifact-led studio case studies, open sheets and dividers, and readable
  editorial index/rail relationships.
- **Anti-references:** SaaS landing-page boilerplate, marketplace card grids,
  AI-generated marketing copy, fake telemetry, dark neon tech demos,
  glassmorphism, gradients, and decorative dashboards.

## Existing Patterns

The prototype is a standalone static artifact, but its visual choices must
remain compatible with the source authority:

- **Typography:** Poppins for approved Homepage display/UI emphasis; Inter for
  body, metadata, and forms. Projects and Contact use the pairing as a
  candidate extension and do not promote it to canonical authority.
- **Colors:** Existing Niuva semantic palette and token architecture; semantic
  blue is reserved for action, focus, hierarchy, and real state.
- **Spacing:** Existing token rhythm, with route-specific density rather than
  arbitrary new scale values.
- **Components:** Reuse the existing mark and approved project media by local
  copy. Prototype-only HTML/CSS primitives may be new; no production component
  or dependency is changed.

## Component Inventory

| Component | Status | Notes |
| --- | --- | --- |
| Public header/navigation | New in prototype | Shared identity; route-specific active state; keyboard-safe |
| Home artifact lead | New in prototype | One dominant approved image, B2B action, secondary Retail path |
| Evidence thread | New in prototype | Need → investigation → decision → artifact → output, not fake telemetry |
| Project index/rail | New in prototype | Open editorial list with varied media scale, no identical cards |
| Project detail sheet | New in prototype | Challenge, decision, output, source/provenance note |
| Inquiry form | New in prototype | Approved B2B fields and consent wording; local validation only |
| WhatsApp confirmation | New in prototype | User-initiated handoff boundary; no automatic message |
| Map fallback | New in prototype | Loading and unavailable states are explicit, never blank |
| Review harness | New in prototype | Fixture/state selector outside Participant Mode |
| Existing production UI primitives | Reuse as authority only | No imports or edits in this isolated prototype |

## Key Interactions

1. Participant opens Home, sees the artifact and `Diskusikan Project`, and can
   read the evidence thread before choosing the secondary Retail path.
2. Participant opens Projects, selects a project row, reads challenge,
   decision, and output, then returns to the index without losing context.
3. Participant opens Contact and can submit the local form only when required
   fields and consent are valid. Invalid submission returns an alert summary,
   field messages, and preserves entered values.
4. Valid submission shows a synthetic acknowledgement that says an Inquiry is
   recorded in the prototype and that Niuva Operations will respond within the
   approved working-calendar target. It makes no quotation, ETA, or project
   creation promise.
5. WhatsApp is reached through a confirmation boundary. The prototype records
   a user-initiated handoff only; it never sends a message or changes Inquiry
   state.
6. The map can be `loading` or `unavailable`; the unavailable state provides
   address context and a retry/alternative action rather than an empty block.
7. Review Mode seeds synthetic states, then hands off to a clean Participant
   Mode URL. Fixture IDs and evaluator controls never render in Participant
   Mode.

## Responsive Behavior

- Validate 390, 768, 1024, and 1440px.
- At 390px the artifact and text become a deliberate single-column sequence;
  no horizontal scroll, clipped primary action, or hidden consent/error state.
- At 768px the evidence thread becomes a compact two-column reading rhythm
  only where it improves scanning; it does not become a card grid.
- At 1024px the project rail and detail sheet gain breathing room while the
  form remains readable.
- At 1440px a constrained editorial canvas, artifact crop, and asymmetric
  whitespace establish hierarchy without an oversized empty hero.
- Focus order follows document order at every breakpoint. Reduced motion removes
  non-essential transitions.

## Accessibility Requirements

- Semantic `header`, `nav`, `main`, `footer`, `section`, and form landmarks.
- Visible keyboard focus, skip link, logical heading order, and focus return
  after state changes.
- Text and control contrast checks target 4.5:1 normal text and 3:1 large text
  or control boundary for the prototype evidence; no broad WCAG claim is made.
- Every form field has a visible label, adjacent error, and summary target.
- State changes use one live region and do not hide feedback only in a
  screen-reader-only element.
- Touch targets are at least 44px in the prototype; no hover-only meaning.
- Alt text and provenance for every rendered image are recorded in
  `ASSET_MANIFEST.md`.

## Out of Scope

- Any edit under `frontend/`, `backend/`, APIs, schemas, migrations, or tests.
- Retail configurator, checkout, payment, customer account, Order tracking,
  Admin/CMS, inventory, provider, deployment, readiness, and go-live work.
- Real Inquiry persistence, uploads, authentication, analytics, WhatsApp
  activation, map-provider calls, or any external network request.
- Canonical decisions, PRD, design tokens, brand rollout, or route promotion.
- Fabricated client proof, metrics, testimonials, logos, telemetry, or generated
  3D/CAD/slicer evidence.
