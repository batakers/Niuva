# Niuva Homepage Prototype Review Decision

- Phase: 1.1 - Homepage Prototype Review Decision
- Status: Approved for Homepage production planning
- Scope: Production Homepage only
- Review date: 13 July 2026
- Production baseline: commit `03c4e63`

## 1. Review context

This decision records the outcome of manual visual review after comparing the two isolated Homepage prototypes under the same factual content, routes, CTA destinations, capability hierarchy, project facts, palette, logo, and accessibility requirements.

### Reviewed routes

- Concept A - Editorial Product Studio: `/__brand-lab/editorial`
- Concept B - Experimental Engineering Studio: `/__brand-lab/experimental`
- Clean visual review mode: both routes with `?review=true`

### Reviewed viewports

- 360px
- 430px
- 768px
- 1024px
- 1366px
- 1536px

### Reviewed behavior and evidence

- Standard motion behavior
- `prefers-reduced-motion: reduce` static behavior
- Keyboard focus and prototype-switcher navigation
- CTA reachability and destinations
- Responsive media and heading wrapping
- Horizontal overflow
- Lazy image loading
- Noindex and canonical behavior
- Desktop and mobile screenshots in `output/playwright/brand-homepage-prototypes`

The production Homepage at `/` remained unchanged during prototype work. Public routes, aliases, navigation, backend behavior, operational flows, and production hardening remained protected.

## 2. Concept scorecard

All scores use a 1-5 scale, where 5 is strongest. For implementation risk, 5 means the lowest risk and 1 means the highest risk.

| Criterion | Concept A | Reasoning | Concept B | Reasoning |
| --- | ---: | --- | ---: | --- |
| Studio personality | 4 | Calm and credible, but its restraint can read as a premium editorial studio rather than an experimental engineering studio. | 5 | The artifact framing, asymmetric rhythm, and transformation path express a distinctive engineering-studio identity. |
| Technical credibility | 4 | Clear project facts and open chapters feel rigorous, but the technical method is visually understated. | 5 | Research questions, artifact captions, and the connected process make technical work more visible without inventing evidence. |
| Approachability | 5 | Poppins, Inter, open space, and restrained dividers make the content immediately friendly and readable. | 4 | Manrope remains approachable, but the dark process field and technical annotations create a slightly denser first impression. |
| Hero effectiveness | 5 | The headline remains dominant, CTA hierarchy is immediate, and the flagship image supports rather than competes with the message. | 4 | The hero is more memorable, but the artifact, annotations, and large curve compete more strongly for attention. |
| Typography | 5 | Poppins + Inter is readable, visibly connected to the approved logo system, and already supported by Brand Guidelines v1.0. | 4 | Manrope + Space Mono is distinctive and wraps well, but adds font, governance, and Brand Guidelines v1.1 risk. |
| Project presentation | 5 | Large media, open text, sparse dividers, and minimal metadata give project evidence the strongest clarity. | 4 | Project evidence is still strong, but technical metadata adds density without materially improving every project story. |
| Process clarity | 4 | The numbered sequence is highly readable but less memorable and less expressive of transformation. | 5 | The U-curve gives the five stages one connected meaning, with a complete vertical mobile equivalent. |
| Mobile quality | 5 | Headline, image, and CTA order is natural, stable, and easy to scan at 360px and 430px. | 5 | The mobile composition is intentional and the desktop curve correctly becomes a static vertical sequence. |
| CTA clarity | 5 | Primary and secondary actions are immediately visible and editorial spacing keeps them prominent. | 5 | CTA destinations and hierarchy remain clear despite the more expressive composition. |
| Visual distinctiveness | 3 | Polished and coherent, but closer to established editorial product-studio patterns. | 5 | The connected transformation path and differentiated capability chapters are more recognizably Niuva. |
| Scalability to other public routes | 5 | Open sections and restrained type can adapt to About, Capabilities, Projects, and Contact with low visual complexity. | 4 | The system can scale, but each route will require strict motif and annotation limits to avoid repetition. |
| Implementation risk | 5 | Uses the approved type system, simpler motion, fewer special graphics, and familiar responsive behavior. | 3 | Requires stronger motion governance, path behavior, annotation discipline, and a Brand Guidelines update if its fonts are retained. |

### Scorecard conclusion

Concept A is the stronger control for clarity, typography, project presentation, and implementation safety. Concept B is stronger for studio personality, technical credibility, process clarity, and visual distinctiveness. The final direction therefore uses a precisely defined hybrid rather than adopting either prototype without modification.

## 3. Final layout direction

### Decision

**Approved direction: Experimental Editorial Hybrid.**

This is a fixed composition decision with the following sources:

| Homepage area | Approved source and treatment |
| --- | --- |
| Hero composition | Use Concept B's transformation hero: asymmetric positioning copy, Pindad EV artifact media, and one compact Need-to-Output path. Preserve Concept A's headline dominance, readable measure, and restrained CTA spacing. |
| Capability composition | Use Concept B's differentiated chapters. Research & Development begins with the question that must be answered; Design & Prototyping begins with the artifact or prototype output. Do not mirror them as identical cards. |
| Process model | Use Concept B's single connected U-curve for Need -> Research -> Experiment -> Prototype -> Output. Desktop uses one horizontal U-path; mobile uses one static vertical sequence. |
| Project presentation | Use Concept A's open editorial project layout: dominant media, text outside the image frame, sparse dividers, and minimal metadata. Do not use full bordered case-study cards. |
| CTA treatment | Use Concept A's open terminal CTA: one dominant heading, concise supporting copy, Blue Dark primary action, and restrained secondary contact action. Do not add a nested card shell or decorative U-curve. |

Additional production constraints:

- The flagship proof follows Concept A's media-dominant, open context/challenge/method/output treatment.
- Supporting capabilities use compact divider rows, not feature cards.
- Why Niuva uses aligned proof statements, not a card grid.
- Section labels are used only where they clarify hierarchy; they are not repeated above every heading.

## 4. Final typography decision

### Decision

**Approved public pair: Poppins + Inter.**

| Role | Typeface |
| --- | --- |
| Display and Homepage H1 | Poppins |
| Headings | Poppins |
| Navigation-style UI | Poppins |
| Buttons | Poppins |
| Body copy | Inter |
| Labels and captions | Inter |
| Form content | Inter |
| Short project metadata | Inter |

Rationale:

- Poppins preserves the geometric relationship with the official Niuva mark.
- Inter gives body content, captions, and project descriptions better long-form clarity.
- The manual comparison showed that layout, media hierarchy, and the U-curve provide sufficient experimental character without changing the primary brand family.
- This decision avoids the additional loading and governance cost of Manrope + Space Mono.
- No Brand Guidelines v1.1 typography change is required for the Homepage implementation.

Manrope + Space Mono is not approved for production. Space Mono and JetBrains Mono are not part of the approved public Homepage typography direction.

## 5. U-curve decision

### Approved behavior

The U-curve represents the transformation:

**Need -> Research -> Experiment -> Prototype -> Output**

It must connect real stages or real content relationships. It must never function as decorative wallpaper.

### Placement budget

- Maximum dominant placements on Home: **2**
- Maximum secondary accent placements on Home: **1**
- Approved initial implementation: **2 dominant placements and no secondary accent**

### Approved Home placements

1. **Hero:** one compact transformation path connecting the positioning statement to the flagship artifact.
2. **Process:** one complete path connecting all five stages.

### Prohibited placements

The U-curve must not appear:

- as a repeated section background;
- inside every capability or project block;
- in Navbar or public navigation controls;
- in the Footer;
- behind paragraph text;
- as decoration inside the final CTA;
- as a generic card ornament;
- as multiple competing paths in one viewport.

Circles may appear only as meaningful start, stage, decision, or output nodes.

### Reduced-motion behavior

In reduced-motion mode, the complete path and all nodes are visible immediately. There is no stroke-drawing animation, scrubbing requirement, delayed label, or motion-dependent meaning. The mobile vertical sequence remains fully static and readable.

## 6. Photography decision

### Approved assets for initial Homepage implementation

| Asset | Approved role |
| --- | --- |
| Pindad EV | Primary hero artifact and flagship project proof |
| Xeon redesign | Design & Prototyping evidence and selected project media |
| Bicycle Arcade Agate | Supporting selected-project proof at a restrained size |
| Motorcycle Simulator Agate | Supporting project reference or compact proof only |

### Prohibited hero-scale use

- Bicycle Arcade Agate
- Motorcycle Simulator Agate
- Any low-resolution crop derived from either Agate image
- Stock corporate meeting photography
- Generated or fabricated project imagery
- Unverified sketches, CAD, tests, or workshop artifacts

### Missing photography for later rollout

- Real research and discovery sessions
- Team collaboration around actual project material
- Sketching, CAD, and component-layout work
- Fabrication and assembly
- Prototype testing and simulator usage
- Material, tooling, wiring, and mechanical details
- Workshop facilitation
- Bandung Techno Park and makerspace context
- Higher-resolution Agate project documentation

### Rollout decision

Homepage implementation planning may proceed before new photography is produced. The current Pindad and Xeon assets provide sufficient authentic evidence for the approved Home composition. The Homepage must not add a separate studio/process-photography section until real approved material exists.

New photography remains required before broader About and Projects rollout.

## 7. Motion decision

### Approved intensity

**5/10 - moderate, purposeful public motion.**

### Approved animated events

1. One concise hero entrance establishing headline, CTA, and media hierarchy.
2. One U-curve process progression from Need to Output.
3. One project-media transition supporting the selected-project sequence.

The three event types are maximums, not targets that must all run simultaneously.

### Prohibited motion

- Perpetual loops
- Decorative parallax
- Cursor-following effects
- Floating particles
- Animated gradients
- Marquees
- Hover gimmicks
- Animation on every section
- Scroll hijacking
- Motion that delays CTA access
- Motion required to understand process or project content
- Layout-property animation that creates avoidable reflow or jank

### Reduced-motion requirements

- All content is visible without animation.
- Hero hierarchy is complete on first render.
- The full U-curve and stage sequence is visible statically.
- Project media remains available without transition.
- CTA behavior and focus behavior are unchanged.
- No information depends on timing, path progress, hover, or scroll position.

## 8. Approved Home composition

| Sequence | Section | Purpose | Content | Visual and surface treatment | Relevant media | CTA behavior |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | Studio introduction hero | Establish Niuva as an experimental, technical, and approachable R&D partner. | Approved positioning headline, concise introduction, primary and secondary actions. | Concept B asymmetric artifact composition with Concept A headline dominance. Open layout; one 20-24px media frame; no outer card; compact U-curve below or between content and media on desktop. | Pindad EV. | `Diskusikan Project` -> `/contact`; `Lihat Projects` -> `/projects`. |
| 2 | Flagship project proof | Prove the positioning immediately with a real project. | Pindad EV context, challenge, method, and output using approved facts only. | Concept A media-dominant editorial layout. Text remains outside the media frame; sparse divider; no full bordered case-study card. | Pindad EV, using a non-upscaled alternate crop or framing from the approved source. | Project action -> `/projects`; discussion action, if present, -> `/contact`. |
| 3 | Primary capabilities | Explain the two primary ways Niuva creates product decisions and prototypes. | Research & Development and Design & Prototyping using current public labels and hierarchy. | Concept B differentiated chapters. R&D is question-led; Design & Prototyping is artifact-led. Open grid, no mirrored cards, no repeated label pills. | Xeon may support the Design & Prototyping chapter. R&D remains text/evidence-led until approved process media exists. | Capability links -> `/capabilities`; discussion actions -> `/contact`. |
| 4 | Transformation process | Make the development path understandable and memorable. | Need, Research, Experiment, Prototype, and Output with one concise explanation each. | One connected U-curve on desktop; one static vertical sequence on mobile. Dark or light full-width section band with 0px section radius; no stage cards. | No fabricated media. The path and factual stage copy are sufficient. | No primary CTA inside the sequence. |
| 5 | Supporting capabilities | Show supporting offers without weakening the primary hierarchy. | Consultant & Workshop; Apparel & Merchandise. | Two compact divider rows or one open two-column group. No feature cards and no decorative nodes. | No media required for initial Home. | Supporting links -> `/capabilities`; contextual discussion action -> `/contact` only if needed. |
| 6 | Selected projects | Add broader proof across mobility and interactive products. | Redesain Motor Xeon and Bicycle Arcade Agate previews; retain all approved project names in the project index or link context. | Concept A alternating editorial layout with dominant media, open text, minimal metadata, and sparse dividers. No outer case-study cards. | Xeon and Bicycle Arcade Agate at resolution-appropriate sizes. | Section action -> `/projects`; project discussion action -> `/contact` only where contextually clear. |
| 7 | Why Niuva | State the business reasons for choosing Niuva. | Research-grounded decisions, engineering thinking, prototyping for validation, and custom execution using approved claims. | Open proof statements or divider rows on one controlled contrast band. No four-card grid and no decorative U-curve. | No media required. | No competing CTA; preserve reading flow into the final action. |
| 8 | Final CTA | Convert interest into a structured project conversation. | Concise invitation, short expectation-setting copy, and approved contact destinations. | Concept A open terminal CTA. One strong heading, generous spacing, Blue Dark primary action, no nested card shell, and no motif wallpaper. | No media required. | `Diskusikan Project` -> `/contact`; WhatsApp remains the restrained secondary contact action. |

## 9. Components affected

This section identifies likely implementation work. It does not authorize the changes yet.

### Components likely requiring API changes

| Component | Likely evolution |
| --- | --- |
| `PageHero` | Support a Home-specific asymmetric composition with media, a semantic transformation-path slot, primary and secondary actions, and mobile ordering without changing other route heroes by default. |
| `CapabilityPanel` | Separate capability content from the current contained-card presentation and support question-led and artifact-led chapter variants. |
| `ProcessTimeline` | Accept the five approved stages as one connected sequence with desktop path and mobile static-list renderers. |
| `ProjectCaseStudyCard` | Support an open editorial project-feature variant where text is outside the media frame and the outer card shell is removed. |
| `DecorativeMotif` | Replace generic decorative use on Home with explicit semantic modes such as `transformation-path`, `start-node`, and `output-node`, including a static reduced-motion state. |

Permanent API signatures must be specified in the Phase 3 implementation plan before code changes begin.

### Components likely requiring styling changes only

| Component | Likely evolution |
| --- | --- |
| `SectionHeader` | Use a vertical editorial stack on Home, reduce repeated label pills, and preserve existing semantic heading order. No global default change is approved yet. |
| `CTASection` | Remove the nested visual shell for the Home variant, preserve CTA destinations and control behavior, and use one open terminal action treatment. |

### Components and foundations that must remain unchanged

- `MarketingSection` spacing contract
- `BrandButton` interaction, height, focus, and destination behavior
- Navbar navigation items and mobile-menu behavior
- Footer navigation items and contact destinations
- `BrandIdentity` and official logo geometry
- Contact form fields, validation, payload, privacy behavior, and submission contract
- Project names and factual content model
- Admin, authentication, dashboard, order, backend, and API components

## 10. Protected foundations

The production Homepage plan and implementation must preserve:

- public routes and route aliases;
- Navbar and Footer destinations;
- the official Niuva logo and its geometry;
- official palette values;
- Brand Blue as the identity color;
- Blue Dark `#4A72A0` as the accessible action color;
- Midnight, Steel, Smoke, Silver, Frost, Cloud, and White values;
- `MarketingSection` spacing and container contract;
- semantic spacing and responsive foundations;
- contact form fields, required states, payload, privacy behavior, and API contract;
- approved project names, facts, and evidence model;
- challenge, solution, output, and capability structure;
- semantic HTML, keyboard access, focus visibility, alt text, minimum touch targets, and reduced motion;
- route-level lazy loading and existing performance optimizations;
- source-map, analytics, SEO, security, and production-hardening behavior;
- authentication, admin, dashboard, order, backend, API, and operational flows.

No taxonomy renaming, Office & Signage addition, or other-route rollout is approved by this decision.

## 11. Asset dependencies

### Blocking dependencies

No new asset-production dependency blocks the Phase 3 Homepage implementation plan.

The following existing approved assets are required and already available:

| Required asset | Status | Production role |
| --- | --- | --- |
| Official Niuva logo asset | Available | Public identity |
| Pindad EV image | Available | Hero and flagship proof |
| Xeon redesign image | Available | Capability and project evidence |
| At least one Agate supporting image | Available | Selected-project proof at a restrained size |

If any of these existing files becomes unavailable or is found to have incorrect rights or attribution, that issue becomes blocking. This document does not infer any new rights or licenses.

### Non-blocking dependencies

The following may be produced during later Projects and About work:

- research and discovery-session photography;
- real collaboration around project artifacts;
- sketching, CAD, and component-layout documentation;
- fabrication and assembly photography;
- prototype testing and simulator-in-use photography;
- material, tooling, wiring, and mechanical-detail photography;
- workshop and training facilitation photography;
- Bandung Techno Park and makerspace environment photography;
- higher-resolution Bicycle Arcade Agate documentation;
- higher-resolution Motorcycle Simulator Agate documentation;
- additional Pindad EV engineering-detail and testing images;
- verified Xeon sketches, CAD, or packaging evidence if such artifacts exist.

No missing artifact may be invented or recreated as factual project evidence.

## 12. Next authorized phase

### Decision

**B. Phase 3 - Homepage production implementation plan**

The plan may define:

- the exact Home-only component changes;
- safe component API proposals;
- section-by-section implementation sequence;
- scoped Poppins + Inter loading and token migration requirements;
- U-curve rendering and reduced-motion contract;
- asset mapping and responsive media behavior;
- test, accessibility, performance, and rollback requirements.

This authorization covers planning only. It does not authorize:

- production implementation;
- global design-system migration;
- rollout to About, Capabilities, Projects, or Contact;
- taxonomy changes;
- Office & Signage placement;
- Brand Guidelines v1.1 publication;
- backend, API, admin, authentication, dashboard, or order changes.

## Decision summary

| Decision area | Approved outcome |
| --- | --- |
| Layout direction | Experimental Editorial Hybrid with explicitly assigned Concept A and Concept B treatments |
| Typography | Poppins + Inter |
| U-curve | Two dominant semantic placements maximum; transformation only |
| Photography | Current approved assets are sufficient for Home; new process photography remains a later dependency |
| Motion | 5/10 with three event types maximum and complete static reduced-motion behavior |
| Blocking assets | No new acquisition; required existing logo, Pindad, Xeon, and one Agate asset are available |
| Next phase | Phase 3 - Homepage production implementation plan |
| Other routes | Not authorized |
