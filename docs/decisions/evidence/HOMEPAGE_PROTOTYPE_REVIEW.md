# Niuva Homepage Prototype Review

Status: Phase 1 review artifact
Scope: isolated Homepage concepts only
Production Homepage: unchanged

## 1. Purpose

This document supports stakeholder review of two isolated Homepage directions before any public rollout or shared design-system migration. The prototypes compare composition, typography, media emphasis, graphic behavior, and restrained motion while keeping Niuva's facts, service hierarchy, project evidence, routes, and contact behavior aligned.

The prototypes are decision tools, not approved production replacements.

## 2. Routes and activation flag

The internal review routes are:

- Concept A: `/__brand-lab/editorial`
- Concept B: `/__brand-lab/experimental`
- clean capture mode: append `?review=true`

They are registered only when `REACT_APP_ENABLE_BRAND_LAB=true`. The documented default is `false`. With the flag missing or false, the existing wildcard redirect handles these URLs and no Brand Lab content is emitted in the production build. Neither route is linked from public navigation, included in generated sitemap routes, or assigned a canonical URL. Both set `noindex, nofollow` while mounted.

## 3. Shared factual baseline

Both concepts use the same baseline:

- primary CTA: **Diskusikan Project** to `/contact`;
- secondary project action: **Lihat Projects** to `/projects`;
- primary capabilities: **Research & Development** and **Design & Prototyping**;
- supporting capabilities: **Consultant & Workshop** and **Apparel & Merchandise**;
- approved projects: **Redesain Motor Xeon**, **Pengembangan Motor EV PT Pindad**, **Bicycle Arcade Agate**, and **Motorcycle Simulator Agate**;
- the same local project facts, official logo, official palette, WhatsApp destination, and accessibility labels.

No statistics, testimonials, awards, certifications, team-size claims, fabricated artifacts, or fabricated photography were added.

## 4. Concept A explanation

**Editorial Product Studio** is the control direction. It uses an asymmetric editorial grid, open typographic groupings, sparse dividers, and media-led project evidence. Pindad EV anchors the hero and flagship proof. Primary capabilities are presented as two chapters rather than mirrored cards; the process is one numbered reading sequence; supporting capabilities and projects remain open rather than enclosed in large card shells.

The result is calm, approachable, disciplined, and easier to scan. A single cropped curve supports the hero media without becoming wallpaper.

## 5. Concept B explanation

**Experimental Engineering Studio** is the preferred experiment from the approval decision. It uses a more technical editorial rhythm, stronger contrast bands, artifact captions, and one connected U-curve that represents **Need → Research → Experiment → Prototype → Output**.

The two primary capabilities intentionally use different working modes: Research & Development begins with research questions, while Design & Prototyping begins with an artifact and prototype output. Desktop uses the connected transformation curve; mobile replaces it with a complete vertical static sequence. The visual language is engineering-led and kinetic without cyberpunk, decorative futurism, or card-heavy SaaS patterns.

## 6. Typography comparison

| Area | Concept A | Concept B |
| --- | --- | --- |
| Display, headings, UI, buttons | Poppins | Manrope |
| Body, descriptions, captions | Inter | Manrope |
| Short technical annotations | Inter, used sparingly | Space Mono |
| Paragraphs, buttons, navigation in mono | Never | Never |
| JetBrains Mono | Not used by the concept | Not used by the concept |

Computed-style QA confirmed Poppins + Inter for Concept A and Manrope + Space Mono for Concept B. Space Mono is scoped to short technical labels only.

## 7. Hero comparison

Concept A makes the headline the dominant object, with Pindad EV as a supporting editorial figure in a 7/5-style composition. It feels calmer and more familiar.

Concept B balances the positioning statement, flagship artifact, and one compact transformation path. It communicates the approved experimental direction more directly but asks the viewer to process more visual information.

Comparison capture: `output/playwright/brand-homepage-prototypes/comparison-hero.png`.

## 8. Capability comparison

Concept A presents two open chapters with matching information depth and a restrained editorial cadence. This is the clearest option for rapid comprehension.

Concept B differentiates the chapters by work mode: evidence gathering versus artifact production. This gives the capabilities stronger character and makes the relationship between research and prototyping more concrete, with a slightly higher cognitive load.

Comparison capture: `output/playwright/brand-homepage-prototypes/comparison-capabilities.png`.

## 9. Process comparison

Concept A uses a simple numbered sequence with horizontal rules. It is highly readable, low-motion, and resilient across widths.

Concept B uses one connected U-curve on desktop and a vertical static line on mobile. Every stage retains its short explanation without animation, so reduced-motion mode and small screens preserve the full meaning.

Comparison capture: `output/playwright/brand-homepage-prototypes/comparison-process.png`.

## 10. Project comparison

Both concepts make approved media the primary evidence and use Xeon and Bicycle Arcade Agate as additional previews. Agate imagery is kept within a restrained media frame and is not promoted to hero scale.

Concept A uses an alternating editorial layout with sparse dividers. Concept B adds minimal project/category annotations and a more technical evidence rhythm without enclosing projects in case-study cards.

Comparison capture: `output/playwright/brand-homepage-prototypes/comparison-projects.png`.

## 11. Color balance comparison

Both concepts use only the approved palette and existing semantic variables. There are no gradients, purple, neon, or glass effects.

- Concept A is directionally close to the requested **65% light neutrals / 25% Midnight and Steel / 10% blues**. Its long open fields favor Cloud, White, and Frost.
- Concept B is directionally close to **55% light neutrals / 25% Midnight and Steel / 20% blues**. It uses a Midnight process band and more Brand Blue/Sky Blue path expression.
- Blue Dark remains the action color; normal text is not placed on Brand Blue where contrast would be insufficient.

These are compositional targets, not a pixel-area certification.

## 12. Motion comparison

Concept A uses one orchestrated hero reveal. Project imagery remains static, keeping the control concept calm.

Concept B uses at most three event types: hero entrance, transformation-path progression, and one project-media reveal. There are no perpetual loops, particles, parallax, cursor effects, animated gradients, or section-by-section animation. Reduced-motion mode removes the reveal duration and renders the complete path statically.

## 13. Mobile comparison

Both concepts were checked at 360px and 430px in addition to tablet and desktop widths.

- Concept A uses headline → image → CTA order with no absolutely positioned copy.
- Concept B uses headline → CTA → artifact and removes desktop curve geometry from the hero.
- Concept B's process changes to a vertical static sequence rather than shrinking the desktop path.
- Actions remain full-width and reachable; media stays useful; project content remains in normal document flow.

## 14. Accessibility findings

Browser verification found:

- one `h1`, one `main`, and one footer landmark per concept;
- visible `:focus-visible` treatment and keyboard-reachable prototype switcher;
- `aria-current="page"` on the active concept;
- CTA height of 48px for primary marketing actions and at least 46px for other prototype actions, exceeding the 44px general target;
- intrinsic image dimensions, descriptive project alt text, and nonessential brand marks treated decoratively;
- complete static reduced-motion output;
- no horizontal overflow at 360, 430, 768, 1024, 1366, or 1536px;
- `noindex, nofollow` and no canonical on both prototype routes;
- no browser console errors or warnings during prototype and production-route checks.

The Concept B process-introduction contrast and Space Mono selector specificity were corrected during visual QA.

## 15. Performance implications

Prototype pages are route-level lazy chunks. A build with the flag disabled contained no Brand Lab route or concept strings. In the measured local production builds:

- flag disabled initial JavaScript: approximately **176.76 kB gzip**;
- flag enabled initial JavaScript: approximately **177.87 kB gzip**;
- incremental route-gate/lazy-loader cost while enabled: approximately **1.11 kB gzip**;
- shared prototype CSS lazy chunk: approximately **4.04 kB gzip**;
- Concept A and Concept B JavaScript are separate lazy chunks, approximately **3.68 kB** and **4.53 kB gzip** respectively.

Poppins is already loaded by the current application. Concept A injects only Inter 400/500/600. Concept B injects Manrope 400/500/600/700 and Space Mono 400/700. Font stylesheets are nonblocking and concept-scoped; visiting both concepts downloads both sets, after which normal browser caching applies. With the flag disabled, prototype JavaScript, CSS, and font requests are absent.

## 16. Asset limitations

The current approved project assets are sufficient for concept comparison but not for a complete future production narrative.

- Pindad EV works as the flagship visual.
- Xeon works as project and process evidence.
- Agate images are lower-resolution supporting proof and must remain at restrained display sizes.
- Real process photography covering research sessions, engineering iteration, workshop activity, prototype testing, and collaboration is still missing.

That missing process photography is an explicit future asset dependency. No stock corporate photography, fake CAD, fake sketches, or generated project imagery was used.

## 17. Strengths and risks of each concept

### Concept A

Strengths:

- strongest editorial clarity and fastest scan path;
- dependable long-form readability;
- lower motion and implementation risk;
- project evidence feels open and credible.

Risks:

- may feel too restrained to express the approved experimental ambition;
- differentiation from other premium product studios relies heavily on photography quality;
- the transformation model is less memorable.

### Concept B

Strengths:

- most aligned with the approved Experimental Engineering Studio direction;
- U-curve gives a meaningful, ownable transformation model;
- capability chapters better demonstrate how Niuva works;
- stronger technical character without losing approachability.

Risks:

- requires tighter content and motion governance in production;
- technical annotations can become visual noise if expanded;
- the direction will benefit more from new process photography;
- permanent typography adoption would require Brand Guidelines v1.1.

## 18. Decision scorecard

Scores are review aids on a 1–5 scale, not final approval.

| Criterion | Weight | Concept A | Concept B | Review note |
| --- | ---: | ---: | ---: | --- |
| Editorial clarity | 25% | 5 | 4 | A is the calmer control. |
| Approved visual-direction fit | 25% | 3 | 5 | B expresses experimental engineering more directly. |
| Capability communication | 15% | 4 | 5 | B differentiates research and artifact work. |
| Project-evidence credibility | 15% | 5 | 4 | A gives media slightly more breathing room. |
| Responsive resilience | 10% | 5 | 5 | Both pass the requested viewport matrix. |
| Production-governance risk | 10% | 5 | 3 | B needs stricter motif, mono, and motion limits. |
| **Weighted indication** | **100%** | **4.4** | **4.4** | Different strengths produce an intentionally close result. |

## 19. Recommended concept

Advance **Concept B — Experimental Engineering Studio** to stakeholder testing because it best represents the approved visual direction and gives Niuva a more distinctive transformation narrative.

The recommendation is to carry forward Concept A's strongest controls: its content density, open project layouts, restrained dividers, readable text measures, and calm pacing. This is a recommendation for review, not a permanent winner or authorization to replace the production Homepage.

## 20. Decisions still requiring stakeholder approval

The following remain open:

- final public font family or pair;
- final Homepage composition;
- whether Concept B advances, Concept A advances, or a governed hybrid is prototyped;
- final motion timing and production motion budget;
- permanent component API changes;
- taxonomy renaming and any Office & Signage placement;
- process-photography acquisition plan;
- rollout to About, Capabilities, Projects, Contact, or other routes;
- permanent shared design-system migration;
- Brand Guidelines v1.1 typography and digital behavior updates.

No global redesign or rollout is authorized by this Phase 1 prototype review.
