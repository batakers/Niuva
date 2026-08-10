# Candidate Visual Refinement Direction Packet

**Status:** Candidate — Context Only — not canonical and not implementation authority
**Date:** 10 August 2026
**Amended:** 10 August 2026 — Impeccable document-critique refinement
**Baseline:** `origin/main` at `954837c9dd4fcaeb9438c16fb6934210e082a364`
**Parent design contract:** [Candidate MVP UX/UI Design Packet](2026-08-08-niuva-mvp-ux-ui-design-packet.md)
**Purpose:** Convert a read-only visual audit of the current public UI into a bounded refinement direction before any production design or implementation work.

This packet is documentation only. It does not change React, CSS, assets,
routes, APIs, schemas, providers, deployment, readiness, or go-live status.

## 1. Authority and boundary

When this packet conflicts with another source, use this order:

1. [`docs/NIUVA_MASTER_SPEC.md`](../../../NIUVA_MASTER_SPEC.md)
2. [`docs/context/DOCUMENT_REGISTER.md`](../../../context/DOCUMENT_REGISTER.md)
3. [`docs/decisions/DECISION_REGISTER.md`](../../../decisions/DECISION_REGISTER.md)
4. The approved decision or ADR applicable to the surface
5. The applicable runbook
6. Current source and tests as implementation evidence
7. This candidate packet and other visual-audit notes

This packet:

- refines the expression of the approved **Experimental Editorial Hybrid**;
- does not replace `DEC-UX-001`, `DEC-UX-002`, `DEC-UX-003`, `DEC-OPS-001`, or
  `DESIGN.md`;
- does not promote a new visual decision to the canonical register;
- does not authorize production-source changes, a component rewrite, a new
  design system, new dependencies, new providers, or new brand assets;
- does not make the R6 bounded prototype a production specification; and
- does not claim that any inactive Retail transaction, upload, payment,
  tracking, CMS, or Admin capability is implemented.

All identifiers in this packet (`CVR-*`, `VRA-*`, and `VG-*`) are packet-local
traceability labels. They are not canonical decisions, API names, CSS tokens,
route contracts, or test identifiers.

## 2. Audit basis

The audit was performed in a clean detached worktree from the baseline above.
It inspected the current public production source, the approved visual
authority, the bounded R6 prototype as comparison evidence, and rendered
screenshots at desktop and 390px mobile widths.

Local evidence is retained outside the repository at:

`C:\tmp\niuva-visual-audit-evidence-20260810-scrolled`

The reproducibility and limitation record is captured in the companion
[visual-audit evidence manifest](2026-08-10-niuva-visual-refinement-evidence-manifest.md).

The evidence set includes Home, Projects, and Contact at desktop and mobile
widths. The audit server, temporary junction, and capture script were removed
after the review. No production file was changed.

### 2.1 Evidence summary

| Check | Result | Meaning |
| --- | --- | --- |
| Browser console on audited routes | 0 errors/warnings | No obvious runtime noise in the captured scope |
| Horizontal overflow at 390px | None observed | Responsive baseline is technically sound in the captured routes |
| Impeccable mechanical detector | `[]` | No mechanical anti-pattern was detected; this does not prove visual distinctiveness |
| Source/status baseline | Clean audit worktree | Findings are based on `origin/main`, not local unfinished work |
| Visual review | Refinement required | The issue is composition and identity, not a broken happy path |

### 2.2 Review limitations

- The source audit captured 1440px desktop and 390px mobile evidence. The
  768px and 1024px compositions remain required for the next wireframe or
  prototype pass; they are not implied by this audit.
- The Impeccable detector scans mechanical markup patterns. A clean `[]` result
  cannot establish visual specificity, brand fit, truthful content, or UX
  quality.
- The screenshot files remain local evidence and are not a canonical asset
  bundle. A later review must recapture or attach evidence that the team can
  access from the task/PR context.
- No moderated participant session, WCAG conformance claim, provider
  activation, or production-readiness claim was made.

## 3. Findings

### 3.1 `VRA-01` — Visual specificity gap (P1)

The current UI is polished, readable, and consistent, but it is visually
interchangeable with a modern agency or SaaS case-study site. The combination
of soft blue surfaces, rounded image frames, repeated large headings, alternating
grids, and a full-width blue CTA band does not yet make Niuva recognizable as an
R&D, design-engineering, and prototyping partner.

**Why it matters:** `DEC-UX-002` explicitly selected Experimental Editorial
Hybrid to move away from repeated heroes, card-heavy grouping, and generic
vendor/SaaS composition. The current result follows the palette but not enough
of the intended editorial point of view.

**Refinement:** preserve the tokens and factual content, but make the evidence
thread, artifact scale, typographic contrast, and page-specific composition do
the differentiating work.

### 3.2 `VRA-02` — Shared route skeleton is too visible (P1)

Home, Projects, and Contact currently reuse a strong visual skeleton:

`hero → pale section → rounded content block → steps/list → blue CTA → footer`

Shared primitives are useful, but the route-level compositions do not have
enough distinct intent:

- Home should persuade and position Niuva B2B-first.
- Projects should let evidence and artifacts lead.
- Contact should help a prospect submit a serious inquiry with low friction.

**Refinement:** retain shared tokens and primitives while giving each route a
different composition contract, density, and reading rhythm.

### 3.3 `VRA-03` — Project evidence remains card-template shaped (P1)

Project facts and imagery are valuable, but repeated rounded bordered wrappers
make the portfolio read as a sequence of generic case-study cards. This reduces
the perceived depth of the actual work.

**Refinement:** use open editorial bands, artifact-led sheets, index/rail
relationships, asymmetric image crops, and explicit challenge/decision/output
relationships. Do not invent project outcomes or metrics.

### 3.4 `VRA-04` — Repeated flagship image weakens memory (P2)

The Home hero and following proof section reuse the same motorcycle image too
quickly. This is not incorrect, but it spends the strongest visual evidence
before the visitor has learned the broader Niuva story.

**Refinement:** keep one dominant hero artifact, then change the later proof
treatment (detail crop, workshop context, or evidence strip) or use another
already-approved project asset.

### 3.5 `VRA-05` — Contact composition is generic (P2)

The current contact form is clear but reads as a generic rounded SaaS form card.
The visual system does not yet communicate a project brief, expected first human
response, consent, and optional WhatsApp continuation as a Niuva-specific
inquiry experience.

**Refinement:** use an editorial inquiry brief with a visible context rail,
structured field grouping, canonical consent wording, and the response contract.
The field and privacy contract must remain governed by the approved B2B
decision; this packet adds no new data collection.

### 3.6 `VRA-06` — External map needs a graceful visual fallback (P2, or P1 if required)

When the external map embed is unavailable, the Contact page can show a large
blank area. This makes a successful page look unfinished and creates an
unnecessary provider dependency in the visual experience.

**Refinement:** define a provider-neutral fallback state containing the approved
address and a safe external-map link, with a clear unavailable label. This is a
candidate state contract only; provider activation and production changes remain
separate gates.

### 3.7 `VRA-07` — Mobile pacing is long and repetitive (P2)

The mobile captures remain readable and do not overflow, but the repeated
heading/section rhythm produces long vertical pages and weakens the sense of
intentional pacing.

**Refinement:** compress repeated explanation, vary section density intentionally,
and let one artifact or decision lead each viewport rather than stacking equal
weight blocks.

## 4. Candidate refinement thesis

### 4.1 Refinement label

**Evidence-led Prototyping Editorial** is a packet-local label for this
refinement. It is not a new canonical brand or a replacement for
Experimental Editorial Hybrid.

The word *prototyping* is intentional: it points to Niuva's real work without
introducing the ambiguity that *fabrication* can mean either manufacturing or
falsification. The label remains a candidate until the owner accepts it.

The thesis is:

> Niuva should feel like a working engineering and fabrication studio whose
> evidence is organized with editorial precision—not like a SaaS landing page,
> marketplace, or decorative technology demo.

### 4.2 Differentiation anchor

The interface should remain recognizable without the logo through one
surface-appropriate thread:

`need → investigation → decision → artifact → physical output`

The thread is expressed differently by mode:

| Surface | Expression | Prohibited shortcut |
| --- | --- | --- |
| Home / B2B | Authentic project evidence and a clear route from need to collaboration | Generic feature-card grid or fabricated proof |
| Projects | Artifact-first case-study reading with challenge, decision, and output | Repeated cards with identical visual weight |
| Contact | A structured project inquiry with a clear human handoff | Generic lead form with unexplained marketing fields |
| Retail | Stable product/configuration specification and safe state language | Fake CAD, live-printer telemetry, or decorative gauges |
| Admin | Record identity, state, next action, conflict, and history | KPI wallpaper or public marketing composition |

### 4.3 Design principles

1. **Artifact before decoration.** Use real approved Niuva project evidence where
   it exists. Missing evidence remains visibly missing; it is never replaced by
   invented metrics, logos, testimonials, or AI-generated proof.
2. **Open composition before card stacking.** Use dividers, definition lists,
   rails, bands, and deliberate whitespace. A panel is reserved for a meaningful
   task or state boundary.
3. **Route intent before component reuse.** Reuse tokens and primitives, not a
   complete page skeleton that makes every route look identical.
4. **Blue is semantic.** Retain the approved palette, but reserve blue emphasis
   for hierarchy, action, focus, and real state instead of filling every major
   section with the same treatment.
5. **Editorial contrast without decorative noise.** Use scale, alignment,
   cropping, and rhythm to create personality. Do not add gradients, neon,
   glassmorphism, fake telemetry, terminal decoration, or ornamental labels.
6. **Participant clarity.** Review tooling, fixture IDs, route diagnostics, and
   implementation vocabulary must never leak into customer or public surfaces.

## 5. Surface composition contracts

These contracts guide a later wireframe or prototype task. They do not authorize
source implementation.

### 5.0 Refinement slice and deferred surfaces

The first refinement slice is intentionally limited to the public/B2B routes:

- `/` Home — B2B-primary persuasion and evidence;
- `/projects` — project evidence and reading experience; and
- `/contact` — inquiry conversion and human handoff.

Retail/customer and Admin/CMS principles remain cross-surface guardrails only.
They are not part of the next visual implementation task unless the owner adds
them explicitly. This prevents the public refinement from becoming a broad
redesign of every surface.

### 5.1 Home — Persuade + Read

- First viewport: one credible project/artifact, B2B-primary positioning, and a
  clear `Diskusikan Project` action.
- Narrative: need → capability → selected evidence → how Niuva works → Retail
  secondary path.
- Composition: one dominant artifact, one evidence thread, then varied editorial
  sections. Avoid equal-weight capability cards.
- Keep the approved U-curve semantic and limited to its canonical placements;
  it must not become a repeated wallpaper motif.
- Success criterion: a prospect can explain what Niuva does and why it is a
  credible partner before encountering the Retail path.

### 5.2 Projects — Experience + Read

- First viewport: project artifact and project context, not a generic portfolio
  title followed by a card grid.
- Each case study exposes the truthful relationship between challenge,
  intervention/decision, and output using the source-approved content fields.
- Vary image scale and text placement without making the reading order
  unpredictable.
- Use open sheets or bands instead of identical rounded containers.
- Success criterion: a reader can compare project decisions and outputs without
  mistaking the page for a product marketplace.

### 5.3 Contact — Persuade + Operate

- First viewport: a concise invitation, expected first human response, and the
  form/WhatsApp choice without competing duplicate CTAs.
- Form grouping follows the approved B2B inquiry contract and consent wording.
- Success state visibly confirms the recorded Inquiry and the next human step;
  it does not promise quotation, ETA, or automatic project creation.
- Map has an explicit loading/unavailable fallback rather than a blank block.
- Success criterion: a prospect knows what will be recorded, who responds, and
  what happens next.

### 5.4 Retail/customer — Operate

- Preserve a stable object/specification summary across configuration, checkout,
  Order, and production tracking.
- Keep price, ETA, material, file version, and fulfilment semantics factual.
- Do not import public editorial composition into checkout, account, or Order
  tasks.
- `quote_required`, uncertain payment, and after-sales states remain explicit
  state boundaries; no automatic durable side effect is implied.

### 5.5 Admin/CMS — Operate

- Keep a dense but calm workbench with record identity, state, next action,
  permission, conflict, and history as the hierarchy.
- Do not reuse public hero/portfolio composition or generic KPI grids.
- Publishing, versioning, preview, rollback, and conflicts must remain visible
  in the later source contract without weakening backend authorization.

## 6. Visual system constraints

### 6.1 Preserve

- Approved Niuva semantic palette and token architecture.
- Homepage typography: Poppins for approved display/UI emphasis and Inter for
  body, metadata, and forms.
- Existing React/Tailwind/Radix/CVA/Lucide/shared-component direction.
- Accessible focus, reduced-motion behavior, responsive composition, and
  minimum touch-target requirements already established by the source/design
  system.

Projects and Contact may explore the same type pairing as a **candidate
extension**, but this packet does not claim that the broader public typography
rollout is approved. Retail, customer, and Admin surfaces must retain their
own approved operational readability contract until a separate decision says
otherwise.

### 6.2 Refine

- Use fewer repeated rounded wrappers and stronger open-edge relationships.
- Introduce route-specific type scale and spacing rhythm while staying on the
  existing token scale.
- Use one meaningful panel per task/state boundary, not one panel per field.
- Give image crops a reason: artifact detail, process context, or output proof.
- Keep motion purposeful and restrained; no motion should be necessary to
  understand a task or state.

### 6.3 Prohibit

- New unapproved palette, gradient, neon, glass, particle field, or dark-mode
  rollout.
- Fabricated project claims, metrics, awards, client logos, testimonials, or
  synthetic “live” printer data presented as real.
- Generic three-card feature rows as the dominant Home or Projects grammar.
- Numbered evaluator labels, route IDs, fixture IDs, or technical diagnostics
  in Participant Mode.
- Public visual treatment copied into Retail checkout, customer Order, or Admin.

### 6.4 Vocabulary guardrail

The following terms are shorthand for the next design pass and must be
explained in participant-facing copy only when they help the user:

| Packet term | Intended meaning | Do not turn it into |
| --- | --- | --- |
| Artifact | An authentic project output, material, prototype, or documented work sample | A fabricated showcase object or generic stock illustration |
| Evidence thread | The visible relationship from need to decision to physical output | A numbered evaluator path or fake telemetry |
| Open editorial composition | Content arranged with deliberate edges, dividers, scale, and whitespace | An excuse for missing hierarchy or inconsistent alignment |
| Index/rail | A compact wayfinding or context relationship beside the main content | A technical sidebar containing route IDs or fixture labels |
| Semantic blue | Blue used for approved hierarchy, action, focus, or real state | A decorative blue panel repeated on every section |

## 7. Responsive and accessibility contract

The later artifact must validate at least 390, 768, 1024, and 1440px widths.

- Recompose layouts rather than merely shrinking desktop columns.
- Keep primary actions visible and reachable without horizontal scrolling.
- Preserve readable body text, comfortable line lengths, and clear heading order.
- Keep focus indicators, keyboard order, non-color state meaning, labels, and
  reduced-motion behavior intact.
- Verify map fallback, form validation, loading, unavailable content, and
  successful submission states at mobile width.
- Do not claim WCAG conformance until a separate target and validation owner are
  approved.

## 8. Candidate acceptance criteria

The following are candidate checks for a later wireframe/prototype review:

| ID | Acceptance criterion | Evidence expected |
| --- | --- | --- |
| `CVR-001` | Home is visibly B2B-primary and not a generic marketplace/agency template | Desktop/mobile contact sheet and route reading-order review |
| `CVR-002` | Home, Projects, and Contact have distinct composition contracts while sharing tokens | Side-by-side route comparison |
| `CVR-003` | Projects lead with authentic artifact evidence and avoid identical card wrappers | Project index and two representative case-study frames |
| `CVR-004` | Contact communicates inquiry recording, consent, WhatsApp option, and first-human-response target without new claims | Form, success, error, and unavailable-map frames |
| `CVR-005` | Retail/customer and Admin remain operationally distinct from public editorial surfaces | Cross-surface comparison with Participant Mode labels |
| `CVR-006` | No fabricated evidence, fake telemetry, evaluator chrome, or generic AI-marketing copy is visible | Content and asset provenance review |
| `CVR-007` | Critical compositions remain usable at 390px without overflow or hidden primary actions | Responsive screenshots and keyboard/focus checks |
| `CVR-008` | Motion is optional, reduced-motion safe, and does not carry meaning alone | Reduced-motion and no-motion walkthrough |
| `CVR-009` | Provider-unavailable map state is explicit and useful | Unavailable-state screenshot and copy review |
| `CVR-010` | Each v1 route has a verifiable first-viewport thesis: Home shows B2B action plus approved evidence; Projects shows artifact plus context; Contact shows inquiry action plus response contract | Annotated first-viewport frames |
| `CVR-011` | No two v1 public routes reuse the same hero → body → CTA composition without an intentional route-specific structural difference | Side-by-side route contact sheet and reviewer checklist |
| `CVR-012` | Typography claims are labelled as Homepage-approved or broader candidate extension; no deferred rollout is presented as canonical | Authority trace and visible copy review |
| `CVR-013` | Every visual evidence item has an accessible provenance/alt-text record and can be regenerated from the evidence manifest | Asset/evidence manifest review |

## 9. Next artifact and gates

The next candidate artifact, after this packet is reviewed, is a bounded
**Visual Refinement Wireframe and Prototype Task Card**. It should name exact
frames, source-of-truth assets, states, viewport checks, and the isolated
prototype location.

### 9.1 Owner review checklist

The next artifact must not begin until the owner records these decisions:

| Decision | Required answer | Why it gates the next artifact |
| --- | --- | --- |
| Direction label | Accept `Evidence-led Prototyping Editorial` or provide a replacement | Prevents ambiguous design language from entering the task card |
| v1 route scope | Home, Projects, Contact only, or an explicit expansion | Prevents uncontrolled Retail/Admin redesign |
| Typography scope | Homepage-only authority plus candidate non-Homepage extension, or another approved boundary | Avoids silently promoting deferred brand rollout |
| Evidence set | Name the approved project assets and provenance owner | Prevents placeholder or fabricated proof |
| Contact fallback | Include the map unavailable state in the wireframe/prototype | Prevents a blank external-provider failure state |
| Review evidence | Agree where desktop/mobile captures will be stored for team review | Makes visual validation reproducible for the team |

Before any production UI implementation, the following gates remain separate:

1. owner review of this refinement direction;
2. annotated wireframe/prototype task card;
3. bounded visual prototype and browser validation;
4. formal expert critique, if the prototype gate requires it;
5. source implementation task card with exact files, tests, and rollback scope;
6. separate commit, push, PR, merge, deployment, readiness, and go-live
   approvals.

## 10. Traceability

| Concern | Authority |
| --- | --- |
| Unified Homepage and B2B-primary hierarchy | [`DEC-UX-001`](../../../decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md) |
| Experimental Editorial Hybrid, typography, and U-curve limits | [`DEC-UX-002`](../../../decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md) |
| Public/B2B inquiry and canonical route boundaries | [`DEC-UX-003`](../../../decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md) |
| Admin operational direction | [`DEC-OPS-001`](../../../decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md) |
| Reduced integrated CMS direction | [`DEC-OPS-003`](../../../decisions/experience/DEC-OPS-003-reduced-integrated-cms-mvp.md) |
| Product orientation and lifecycle separation | [`NIUVA_MASTER_SPEC.md`](../../../NIUVA_MASTER_SPEC.md) |
| Transitional token/component/brand guardrails | [`DESIGN.md`](../../../../DESIGN.md) |
| Parent candidate UX/UI contract | [`2026-08-08-niuva-mvp-ux-ui-design-packet.md`](2026-08-08-niuva-mvp-ux-ui-design-packet.md) |

## 11. Review status

**Verdict:** `PASS WITH CONDITIONS — READY FOR OWNER REVIEW (REVISED)`

The packet is sufficiently specific to guide a bounded wireframe/prototype
refinement. The Impeccable review identified and this amendment addresses the
ambiguous direction label, subjective acceptance language, typography scope,
evidence portability, and public-first slice boundary. It is still not an
approval to implement the visual direction in the production application. The
owner must confirm the checklist in section 9.1, and factual content or asset
changes must continue through the existing authority and provenance gates.

No canonical register, decision record, source file, test, provider, or
deployment artifact was changed by creating this packet.
