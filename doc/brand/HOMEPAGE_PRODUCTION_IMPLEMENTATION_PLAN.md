# Niuva Homepage Production Implementation Plan

- Phase: 3 - Homepage Production Implementation Plan
- Status: Implementation-ready, pending Phase 4 authorization
- Scope: Production Homepage route `/` only
- Planning date: 13 July 2026
- Approved direction: Experimental Editorial Hybrid
- Production Homepage baseline: commit `03c4e63`
- Planning baseline: commit `c7de6e2`

## 1. Executive summary

The production Homepage should be rebuilt as a Home-scoped composition rather than by copying either Brand Lab prototype or expanding shared component APIs used by other public routes. The approved layout is an exact hybrid: Concept B supplies the asymmetric transformation hero, differentiated capability chapters, and connected process path; Concept A supplies headline clarity, open project presentation, flagship proof treatment, and the open terminal CTA.

The safest architecture is:

1. Keep `MarketingLayout`, `MarketingSection`, `PageContainer`, `BrandButton`, Navbar, Footer, metadata handling, route registration, and operational components unchanged.
2. Create a small `components/brand/home` feature boundary for Home-only composition.
3. Create a dedicated `TransformationPath` instead of overloading `DecorativeMotif` or `ProcessTimeline`.
4. Create a canonical Home content module that derives project and service facts from `profileContent` and owns only approved Home-specific narrative copy.
5. Use a dedicated `HomePage.css` only for scoped font roles, path geometry, complex Home grids, and the three permitted motion events. Use existing semantic utilities for ordinary spacing, color, radius, and controls.
6. Keep the Brand Lab enabled only by `REACT_APP_ENABLE_BRAND_LAB=true` and disabled by default until production Home acceptance.

This plan does not authorize implementation. It does not authorize changes to any other public route, operational route, backend, API, dependency, asset, or production configuration.

## 2. Approved design direction

| Area | Production decision |
| --- | --- |
| Overall direction | Experimental Editorial Hybrid |
| Hero | Concept B asymmetric artifact composition with Concept A headline dominance and CTA clarity |
| Flagship proof | Concept A open, media-dominant Pindad EV feature |
| Primary capabilities | Concept B differentiated question-led and artifact-led chapters |
| Process | Concept B connected `Need -> Research -> Experiment -> Prototype -> Output` path |
| Supporting capabilities | Two compact divider rows, not cards |
| Selected projects | Concept A open editorial previews for Xeon and Bicycle Arcade Agate |
| Why Niuva | Four aligned proof rows, not a card grid |
| Final CTA | Concept A open terminal action, no nested shell and no motif |
| Typography | Poppins for display, headings, navigation-style UI, and buttons; Inter for body, labels, captions, and project descriptions |
| Motion | 5/10; one hero entrance, one process-path progression, and one selected-project media transition maximum |
| U-curve budget | Exactly two dominant placements initially: compact hero path and complete process path |
| Photography | Existing Pindad, Xeon, and Bicycle Arcade assets; no new blocking photography |

The Home must feel experimental, technical, collaborative, approachable, precise, and forward-looking. It must not become corporate-template, card-heavy, generic SaaS, decorative futurism, or a recreation of the Brand Guidelines PDF.

## 3. Current-to-target inventory

### 3.1 Current production Home order

`frontend/src/pages/marketing/HomePage.jsx` currently renders:

1. `PageHero` with a generic blue `HeroProofPanel`.
2. `#positioning` compact section with an introduction and four evidence rows.
3. `#capabilities` with two `CapabilityPanel` cards and two supporting cards.
4. `#operating-model` with six independent `ProcessTimeline` cards.
5. `#projects` with three fully bordered `ProjectCaseStudyCard` links.
6. `#why-niuva` with one blue feature panel and four bordered cards.
7. `CTASection` with a nested white shell, blue inner panel, contact details, and decorative motif.

### 3.2 Approved target order

1. Studio introduction hero.
2. Flagship project proof.
3. Primary capabilities.
4. Transformation process.
5. Supporting capabilities.
6. Selected projects.
7. Why Niuva.
8. Final CTA.

### 3.3 Current production primitives

| Primitive | Current Home use | Other-route dependency |
| --- | --- | --- |
| `MarketingLayout` | Navbar, Footer, metadata, canonical, skip link | Required by all public routes |
| `BrandPage` | Page surface, overflow control, GSAP reveal scanning | Used by all public pages |
| `PageHero` | Production hero and proof-panel slot | Used by About, Capabilities, Projects, and Contact |
| `MarketingSection` | Section spacing and tone | Shared public contract |
| `PageContainer` | Canonical 84rem container and gutters | Shared public contract |
| `SectionHeader` | Split headers with repeated labels | Used across public pages |
| `CapabilityPanel` | Two primary capability cards | Used on Capabilities and through `ServiceCard` |
| `ProcessTimeline` | Six process cards | Used on About and Capabilities |
| `ProjectCaseStudyCard` | Three linked case-study cards | Required by Projects |
| `DecorativeMotif` | Hero proof and Why Niuva decoration | Used by multiple public surfaces |
| `CTASection` | Nested terminal CTA | Used across public pages |
| `BrandButton` | All major actions | Shared interaction contract |
| `profileContent` | Service, project, and contact facts | Canonical facts used by multiple routes |

### 3.4 Prototype-local implementation

| Prototype item | Purpose | Production assessment |
| --- | --- | --- |
| `BrandPrototypeShell` | Internal controls, noindex handling, concept fonts, review mode | Prototype-only; never place in production Home |
| `PrototypeLink` | Lightweight prototype CTA | Duplicated by `BrandButton`; discard for production |
| `PrototypeImage` | Intrinsic dimensions, eager/lazy, priority, sizes | Suitable as behavior reference; rewrite as production media component |
| `TransformationCurve` | Compact and full SVG U-path | Suitable for extraction in concept, but rewrite with semantic list contract and responsive renderers |
| `EditorialFlagship` | Open Pindad proof | Suitable as visual and content-order reference; rewrite cleanly |
| `ExperimentalCapabilities` | Question-led R&D and artifact-led prototyping | Suitable as composition reference; data and markup require clean production components |
| `ExperimentalPath` | Connected process path and five stages | Suitable for extraction in concept; CSS and accessibility contract require rewrite |
| `EditorialProjects` | Open selected-project layout | Suitable as visual reference; rewrite as `HomeProjectPreview` |
| `EditorialCta` | Open terminal action | Suitable as visual reference; compose with production `BrandButton` |
| `bpEditorialReveal` | Hero reveal | Timing reference only; use Home-scoped motion contract |
| `bpPathDraw` | 1200ms path draw | Too long for the approved production budget; rewrite at 800ms maximum |
| `bpProjectReveal` | View-timeline clip reveal | Experimental progressive enhancement only; do not depend on it |
| Concept A Inter injection | Nonblocking prototype font comparison | Behavior reference; production loading belongs in `index.html` and semantic tokens |
| Concept B Manrope/Space Mono injection | Font experiment | Rejected for production |

The required extraction classifications are:

| Classification | Prototype code |
| --- | --- |
| 1. Suitable for extraction | Factual selection logic, intrinsic image attributes, the ordered five-stage data shape, and the high-level TransformationCurve path geometry |
| 2. Suitable only as visual reference | Editorial hero/flagship/project grids, Experimental capability composition, dark process field, and open terminal CTA spacing |
| 3. Too experimental for production | Concept B font injection, 1200ms linear path draw, view-timeline clip reveal as required behavior, review controls, and dense technical annotations |
| 4. Duplicated by an existing production primitive | Prototype buttons, container, section tone/spacing, route links, focus treatment, and common media radius |
| 5. Required to be rewritten cleanly | HomeHero markup, TransformationPath semantics/renderers, capability chapters, project preview, final CTA, motion trigger, responsive rules, and all extracted production CSS |

### 3.5 Data sources and duplication

Production facts currently live in `profileContent` inside `CompanyProfileBlocks.jsx`. Production Home also declares `positioningEvidence`, `operatingModel`, and `whyNiuva` locally. `prototypeContent.js` imports `profileContent` but duplicates the Home headline, introduction, CTA definitions, transformation stages, and Why Niuva copy.

The approved implementation must remove this three-way duplication. `profileContent` remains the canonical company/project/service fact source. A new Home content module will select and shape those facts without copying project objects or service objects.

### 3.6 Production-only behavior to preserve

- `MarketingLayout` updates title, description, and canonical for `/`.
- Navbar stays fixed, sets the active route, manages mobile focus, and closes on navigation.
- Footer retains the current navigation and contact destinations.
- The Home route remains eagerly imported while other public and operational routes remain lazy.
- `BrandPage` currently skips reveal work when reduced motion is requested.
- `ProjectCaseStudyCard` currently provides intrinsic image dimensions, lazy loading, async decoding, focus styles, and project links.
- `BrandButton` provides 48px minimum height, focus ring, active feedback, and route/external-link handling.

### 3.7 Prototype-only behavior to keep isolated

- Brand Lab controls and prototype switcher.
- Dynamic noindex and canonical removal for review routes.
- Concept-specific font injection.
- `?review=true` clean capture mode.
- Review-mode CSS and prototype mastheads.
- Concept A and Concept B route chunks.

### 3.8 Existing animation behavior

Production `BrandPage` imports GSAP, `@gsap/react`, and `ScrollTrigger`. It reveals every `.brand-reveal` element with an 850ms vertical fade and scroll-scrubs every `[data-brand-visual]` scale. The current Home therefore animates many sections and cards.

The new Home must not add `.brand-reveal` broadly and must not use `[data-brand-visual]`. Home-specific motion should be limited to the approved three event types and should use CSS/SVG animation plus `IntersectionObserver`. GSAP remains available for unchanged routes but is not required by the new Home implementation.

### 3.9 Existing image-loading behavior

- Production project cards: all images use `loading="lazy"`, `decoding="async"`, intrinsic width/height, and contain/cover according to `imageFit`.
- Prototype hero: Pindad uses `loading="eager"`, `fetchPriority="high"`, intrinsic dimensions, and `sizes`.
- Prototype below-fold images: lazy and async with intrinsic dimensions.
- CRA emits imported image assets as hashed URLs but does not generate responsive image derivatives.

The production hero must adopt the prototype priority behavior. All later images remain lazy. No alternate bitmap may be fabricated.

### 3.10 SEO, metadata, and selectors

`MarketingLayout` owns the production Home title, meta description, and canonical. `public/index.html` supplies a static fallback description and title. No Home-specific Helmet layer exists and none is needed.

Selectors and contracts to preserve:

- `#main-content` and the skip-link destination.
- `data-marketing-section="hero"`.
- `data-marketing-section="true"`, `data-spacing`, and `data-tone` from `MarketingSection`.
- `#positioning`, retained on the flagship proof as a compatibility anchor.
- `#capabilities`.
- `#operating-model`, retained on the transformation process.
- `#projects`.
- `#why-niuva`.
- `data-marketing-section="cta"` on the final CTA.

No current production Home-specific `data-testid` is rendered. New tests should prefer role, heading, link, and list semantics. Add test IDs only if an existing end-to-end runner cannot select an element semantically.

### 3.11 Source-to-target matrix

| Approved Homepage area | Prototype source | Production source | Planned implementation |
| --- | --- | --- | --- |
| Studio hero | `ExperimentalHero` plus Concept A headline hierarchy | `PageHero` plus `HeroProofPanel` | Dedicated `HomeHero`; reuse `BrandButton`, `PageContainer`, and Pindad facts |
| Flagship proof | `EditorialFlagship` | `#positioning` evidence section and Pindad project facts | `HomeFlagshipProof`; retain `id="positioning"` |
| Primary capabilities | `ExperimentalCapabilities` | `CoreCapabilitiesSection` and `CapabilityPanel` | `HomeCapabilityChapters` with two explicit chapter renderers |
| Transformation process | `ExperimentalPath` and `TransformationCurve` | `OperatingModelSection` and `ProcessTimeline` | `HomeTransformationProcess` plus dedicated `TransformationPath`; retain `id="operating-model"` |
| Supporting capabilities | `ExperimentalSupporting` | Two locally rendered supporting cards | `HomeSupportingCapabilities` as compact divider rows |
| Selected projects | `EditorialProjects` | Three `ProjectCaseStudyCard` items | Two `HomeProjectPreview` items for Xeon and Bicycle Arcade |
| Why Niuva | Concept A open list structure and approved decision | Blue panel plus four cards | `HomeWhyNiuva` with four aligned rows |
| Final CTA | `EditorialCta` | `CTASection` | `HomeTerminalCTA` using `BrandButton`; preserve contact destinations |

## 4. Target component architecture

### 4.1 Recommended file boundary

```text
frontend/src/
  content/marketing/homeContent.js
  components/brand/home/
    HomeHero.jsx
    HomeFlagshipProof.jsx
    HomeCapabilityChapters.jsx
    TransformationPath.jsx
    HomeTransformationProcess.jsx
    HomeSupportingCapabilities.jsx
    HomeProjectPreview.jsx
    HomeWhyNiuva.jsx
    HomeTerminalCTA.jsx
  pages/marketing/
    HomePage.jsx
    HomePage.css
  hooks/
    useOnceInView.js
```

Tests should mirror the existing source layout:

```text
frontend/src/components/brand/home/__tests__/TransformationPath.test.jsx
frontend/src/pages/marketing/__tests__/HomePage.test.jsx
```

If the repository test runner requires colocated tests, keep the same test names beside their subjects. Do not add a new testing dependency.

### 4.2 Why a dedicated Home architecture is safer

- `PageHero`, `CapabilityPanel`, `ProcessTimeline`, `ProjectCaseStudyCard`, and `CTASection` are used on protected routes.
- The approved Home compositions differ structurally, not merely cosmetically.
- Adding broad variants would increase regression surface and produce APIs that only one route uses.
- Home-specific wrappers allow later graduation into shared primitives after another route demonstrates the same need.
- Existing components remain stable and can be compared visually before and after the Home release.

### 4.3 Existing component classification

| Component | Classification for new Home | Decision |
| --- | --- | --- |
| `PageHero` | Do not use in new Homepage | Keep unchanged for other routes; use `HomeHero` |
| `SectionHeader` | Do not use in new Homepage | Keep unchanged; Home section intros use direct semantic markup with varied composition |
| `CapabilityPanel` | Replace only on Homepage | Keep unchanged; use `HomeCapabilityChapters` |
| `ServiceCard` | Do not use in new Homepage | Keep unchanged; supporting capability rows are Home-specific |
| `ProcessTimeline` | Replace only on Homepage | Keep unchanged; use `TransformationPath` and semantic ordered list |
| `ProjectCaseStudyCard` | Replace only on Homepage | Keep unchanged; use `HomeProjectPreview` |
| `DecorativeMotif` | Do not use in new Homepage | Keep unchanged elsewhere; it must not represent the transformation contract |
| `CTASection` | Replace only on Homepage | Keep unchanged; use `HomeTerminalCTA` |
| `MarketingSection` | Reuse unchanged | Preserve spacing, tone, data attributes, and square section bands |
| `PageContainer` | Reuse unchanged | Preserve width and gutters |
| `BrandButton` | Reuse unchanged | Preserve focus, height, route behavior, and active feedback |
| `BrandPage` | Reuse with constraints | Do not add `.brand-reveal` or `[data-brand-visual]` to Home components |

No existing shared component API change is recommended for the first production implementation.

### 4.4 Existing API compatibility audit

| Component | Current props | Proposed change | Default behavior and compatibility | Accessibility/responsive impact | Risk and required test |
| --- | --- | --- | --- | --- | --- |
| `PageHero` | `label`, `eyebrow`, `title`, `body`, actions, `visual`, `proofPanel`, `variant`, `showMotif`, class props | None; new Home stops consuming it | About, Capabilities, Projects, and Contact retain current output | No change | High if edited, therefore protected-route screenshot and heading tests confirm no edit |
| `SectionHeader` | label aliases, `title`, `body`, `align`, metadata/note, class props | None; new Home uses direct section markup | Current split/left/center behavior remains | No change | Medium; visual spot-check all other public routes |
| `CapabilityPanel` | `capability`/`service`, `index`, classes, `featured`, `compact` | None; Home replacement only | Capabilities and `ServiceCard` consumers remain unchanged | No change | High; Capabilities screenshot and CTA-name test |
| `ServiceCard` | `service`, `index`, `featured`, `className` | None; not used on new Home | Current primary delegation and supporting card remain | No change | Medium; Capabilities hierarchy test |
| `ProcessTimeline` | `items`, `className` | None; Home replacement only | About and Capabilities retain card grid | No change | High; ordered-list and route screenshots |
| `ProjectCaseStudyCard` | `project`, `index`, `onClick`, `className`, `to`, `ctaLabel` | None; Home replacement only | Projects retains clickable case-study card | No change | High; Projects link, focus, image, and case-study tests |
| `DecorativeMotif` | `className`, `light`, `density` | None; not used on new Home | Existing routes preserve decorative output | No change | Medium; screenshot comparison confirms no removal elsewhere |
| `CTASection` | label aliases, copy, actions, contact fields, `showMotif`, class | None; Home replacement only | Other public CTAs retain nested treatment | No change | High; other-route CTA links/focus screenshots |
| `MarketingSection` | `spacing`, `tone`, dividers, top/bottom controls, class, section props | Reuse unchanged | Standard/compact contract remains canonical | Preserves section semantics and responsive padding | Low; data-attribute and spacing tests |
| `BrandButton` | children, `to`, `href`, `variant`, class, type, disabled, icon, rest props | Reuse unchanged | All route/external/control behavior remains | Preserves focus, 48px height, active feedback | Low; link names, destinations, and computed target sizes |

### 4.5 New component API table

| Component | Proposed API | Default and Home behavior | Accessibility contract |
| --- | --- | --- | --- |
| `HomeHero` | `{ content, project, pathStages }` | Always renders Home asymmetric hero; no generic variant prop | One H1, figure caption, intrinsic image, two links, path list remains readable |
| `HomeFlagshipProof` | `{ project, id = "positioning" }` | Open project feature with context/challenge/method/output | H2 then H3, figure/figcaption, descriptive alt, no nested link wrapping all content |
| `HomeCapabilityChapters` | `{ capabilities, artifactProject }` | Renders exact `question-led` first chapter and `artifact-led` second chapter internally | H2 section heading, H3 per capability, descriptive CTA labels |
| `TransformationPath` | `{ stages, placement: "hero" | "process", animate = true }` | Two explicit renderers; no arbitrary layout strings | Ordered list owns meaning; SVG is hidden from assistive tech |
| `HomeTransformationProcess` | `{ stages, id = "operating-model" }` | Full process section and process placement of `TransformationPath` | H2 plus ordered list; mobile DOM reading order matches visual order |
| `HomeSupportingCapabilities` | `{ capabilities }` | Exactly two divider rows | H2, H3, independent links with service names in accessible labels |
| `HomeProjectPreview` | `{ project, mediaSide: "start" | "end", priority = false }` | Open media/text feature; only the second item may reverse on desktop | Article, figure, H3, explicit Projects link; no clickable outer article |
| `HomeWhyNiuva` | `{ items }` | Four aligned proof rows; no CTA | H2, four H3 statements, no decorative nodes |
| `HomeTerminalCTA` | `{ title, body, primaryAction, whatsappHref }` | Open terminal field; no motif and no nested card | Section H2, named actions, 48px primary and 44px secondary minimum |

The APIs intentionally avoid `variant="special"`, `experimental`, arbitrary layout props, and class strings as the primary contract.

## 5. Section implementation specifications

### 5.1 Studio introduction hero

| Requirement | Specification |
| --- | --- |
| Business purpose | Establish Niuva as a credible R&D and product-development partner and expose the primary conversion immediately |
| Exact content source | `homeContent.hero`, derived CTA destinations, and Pindad project selected from `profileContent.projects` by exact title |
| Current component | `PageHero` and `HeroProofPanel` |
| Proposed component | `HomeHero` |
| Semantic markup | `<section>` -> `PageContainer` -> copy `<div>` with one `<h1>` and lead -> CTA group -> `<figure>` -> compact `TransformationPath` |
| Desktop composition | At 1024px and above, 12-column equivalent: copy columns 1-6, media columns 7-12, compact path spans the lower grid without crossing body text |
| Tablet | At 768-1023px, copy and media remain two columns only if each has at least 320px; otherwise stack copy, CTA, media, then compact path |
| Mobile order | H1, lead, CTA group, Pindad figure, static compact path labels |
| Typography | Poppins H1; Inter lead and caption; Poppins buttons |
| Heading measure | `max-width: 14ch` desktop, 15ch tablet, full available width mobile |
| Line count | Target 2 lines at 1280px and above, maximum 3 at 768-1279px, maximum 4 at 360-430px without clipping |
| Navbar clearance | Use existing `--space-page-start`; no negative top offset into fixed Navbar |
| Media frame | 20-24px radius; aspect ratio approximately 4:3; maximum rendered width 672px; never render above source dimensions without explicit QA sign-off |
| Image | Pindad EV, `555x414`, `object-fit: contain`, centered with a neutral surface |
| Loading | `loading="eager"`, `fetchPriority="high"`, `decoding="async"`, intrinsic width/height, accurate `sizes` |
| Alt text | Use `project.imageAlt` unchanged |
| Path | `placement="hero"`; compact line with all five text labels visible, but only Need and Output receive stronger node emphasis |
| CTA | Primary `/contact`; secondary `/projects`; full width on mobile and intrinsic width from `sm` upward |
| Motion | One 600ms maximum entrance for copy/media opacity and 12px translate; path is fully visible before optional progress overlay |
| Reduced motion | No entrance transform or delay; complete media and path visible immediately |
| Acceptance | One H1; CTAs visible without a full-viewport hero; no blue proof panel; no outer card; no overlap or horizontal overflow at all QA widths |

Recommendation: use dedicated `HomeHero`. Do not add a Home variant to `PageHero`, because the Home structure adds a semantic path and page-specific media order that other route heroes do not need.

### 5.2 Flagship project proof

| Requirement | Specification |
| --- | --- |
| Business purpose | Prove the hero claim immediately using a real approved project |
| Content | Pindad context/body, challenge, solution as method, output, category, capability, and approved links |
| Source | `profileContent.projects` exact Pindad object through `homeContent.flagshipProject` |
| Proposed component | `HomeFlagshipProof` |
| Composition | H2 introduction, large figure, story column, and three sparse definition rows; text stays outside figure |
| Surface | Open White or Cloud section; no outer border, no complete card, one sparse divider between media and narrative groups |
| Responsive | Two columns from 768px if story retains 18rem minimum; single column below 768px |
| Media | Same Pindad source URL as hero, but use a closer crop through frame ratio and `object-position`; do not create an alternate file |
| Loading | `loading="lazy"`, `decoding="async"`; browser coalesces or serves the same hashed URL from memory/disk cache |
| Repetition control | Hero uses full artifact view; proof uses a restrained detail-oriented frame. If crop QA cannot create a meaningfully different view, reduce proof media height rather than enlarging it |
| CTA | Primary section link `/projects`; optional text discussion link `/contact` after the proof rows, never both at equal visual weight |
| Motion | No required animation |
| Acceptance | No second high-priority request, no upscale, factual labels only, and image/text remain legible at 360px |

### 5.3 Primary capabilities

| Requirement | Specification |
| --- | --- |
| Business purpose | Show the two principal ways Niuva reduces product-development uncertainty |
| Content | Exact `Research & Development` and `Design & Prototyping` service objects |
| Proposed component | `HomeCapabilityChapters` |
| R&D treatment | Question-led: approved question, service body, role/method, output, target need, and CTA |
| Design treatment | Artifact-led: Xeon figure first, service title/body, output emphasis, and CTA |
| Layout | Asymmetric open grid; R&D and Design do not mirror each other; no outer cards or repeated pills |
| Dividers | One top rule per chapter and internal definition-row rules only where needed |
| Mobile | R&D chapter followed by Design chapter; Xeon media appears before Design text; no cross-column reading-order tricks |
| Typography | Poppins H2/H3; Inter body, labels, and descriptions |
| Body measure | 58ch maximum for prose; 42ch maximum for emphasized question |
| Media | Xeon `553x383`, contain, maximum rendered width 640px and no crop that removes the redesigned body |
| CTA | Capability details `/capabilities`; service-specific discussion `/contact` using existing service CTA text |
| Motion | Static; capability differentiation must not rely on animation |
| Acceptance | Labels unchanged; R&D appears first; no Office & Signage; no equal-card treatment; both CTA destinations work |

### 5.4 Transformation process

| Requirement | Specification |
| --- | --- |
| Business purpose | Explain one traceable path from need to output |
| Content | Canonical five `homeContent.transformationStages` items |
| Proposed component | `HomeTransformationProcess` and `TransformationPath` |
| Desktop | Full horizontal U-path at 1024px and above; ordered stage copy aligns to path nodes without absolute-positioning the semantic text |
| Tablet | 768-1023px uses a simplified two-row path or the vertical renderer when labels would fall below 160px each; choose through CSS breakpoint, not runtime width branching |
| Mobile | Static vertical ordered list with left rail and nodes; no squeezed desktop SVG |
| Surface | One square full-width Midnight band is permitted; path and copy use approved contrast tokens |
| CTA | None inside the sequence |
| Motion | Progress overlay draws once when 25% of section is visible; 800ms maximum; no scroll scrubbing |
| Reduced motion | Overlay is not animated; guide/progress renders complete on first paint |
| JS failure | Ordered list and full guide path remain visible; only enhancement class is absent |
| Acceptance | Five stages in correct order, no stage cards, no focusable SVG, no overflow, and static meaning is complete |

### 5.5 Supporting capabilities

| Requirement | Specification |
| --- | --- |
| Business purpose | Show supporting offers without diluting the primary hierarchy |
| Content | Exact `Consultant & Workshop` and `Apparel & Merchandise` service objects |
| Proposed component | `HomeSupportingCapabilities` |
| Treatment | Two compact divider rows, selected over a two-column feature group because it better preserves hierarchy and scales long Indonesian text |
| Desktop | Each row uses title, one concise body, and a trailing link in a three-column grid |
| Mobile | Title, body, then link; 24-32px vertical rhythm; no row card background |
| Media | None in initial Home |
| CTA | `/capabilities`; service-specific `/contact` only if copy needs a direct action, not both by default |
| Motion | None |
| Acceptance | Exactly two supporting labels, no Office & Signage, no images, no pills, no motif nodes |

### 5.6 Selected projects

| Requirement | Specification |
| --- | --- |
| Business purpose | Expand evidence from flagship EV work to mobility redesign and interactive products |
| Content | Exact Xeon and Bicycle Arcade project objects |
| Proposed component | `HomeProjectPreview` |
| Desktop | Xeon media start/text end; Bicycle media end/text start from 1024px; each article separated by a single divider |
| Tablet | Consistent media-start layout to prevent awkward alternation |
| Mobile | Figure, category, H3, body, output, then section-level Projects link |
| Media | Xeon maximum 640x444 rendered; Bicycle maximum 385x546 rendered and never hero scale |
| Intrinsics | Use project `imageWidth` and `imageHeight`; `object-fit: contain` |
| Loading | Lazy, async decoding, accurate `sizes`; no fetch priority |
| Alt | Use `project.imageAlt` exactly |
| Metadata | Category and output only; no case numbering or technical costume labels |
| CTA | One section-level `/projects` action; optional project discussion action only after project-specific context and visually subordinate |
| Motion | First project figure may reveal once with opacity and 12px translate over 500ms; second remains static |
| Acceptance | No outer linked card, no low-resolution upscale, no nested interactive content, and `/projects` remains obvious |

Recommendation: use dedicated `HomeProjectPreview`. Do not add an editorial variant to `ProjectCaseStudyCard` yet, because Projects still needs the existing full clickable case-study behavior.

### 5.7 Why Niuva

| Requirement | Specification |
| --- | --- |
| Business purpose | Summarize the business reasons to choose Niuva before conversion |
| Content | Four approved `whyNiuvaItems` |
| Proposed component | `HomeWhyNiuva` |
| Treatment | H2 and four aligned proof rows with number-free or simple text hierarchy; no cards, circles, or U-curve |
| Desktop | Two-column row grid may be used only when each item retains at least 30ch body measure; otherwise one column |
| Mobile | One sequential list with sparse dividers |
| CTA | None; the section hands off directly to final CTA |
| Motion | None |
| Acceptance | Four factual statements, no card grid, no decorative motif, no competing action |

### 5.8 Final CTA

| Requirement | Specification |
| --- | --- |
| Business purpose | Convert interest into a project discussion |
| Content | Approved collaboration heading, concise project-context copy, `/contact`, and official WhatsApp URL |
| Proposed component | `HomeTerminalCTA` |
| Treatment | One open Blue Dark field or light field with Blue Dark action; no nested white shell, no rounded outer card, no U-curve |
| Layout | Heading and body in one editorial column; actions aligned below or to the side only when their hierarchy remains clear |
| CTA | Primary `Diskusikan Project` -> `/contact`; secondary `Hubungi Niuva` -> official WhatsApp URL |
| Touch | Primary minimum 48px through `BrandButton`; secondary minimum 44px |
| Motion | None |
| Reduced motion | Identical static state |
| Acceptance | Focus ring visible, labels do not wrap on desktop, no nested card, destinations unchanged |

Recommendation: use a Home-specific wrapper. Do not add a `CTASection` variant because the open terminal structure intentionally omits most of the current component's shell and contact-detail API.

## 6. TransformationPath contract

### 6.1 Meaning and placements

The component represents exactly:

1. Need.
2. Research.
3. Experiment.
4. Prototype.
5. Output.

Allowed Home instances:

- `placement="hero"`: compact transformation summary.
- `placement="process"`: complete explanatory sequence.

No other Home component may render `TransformationPath`, `DecorativeMotif`, or `ULineMotif` as a dominant curve.

### 6.2 Semantic structure

The meaning lives in an `<ol>` with five `<li>` children. Every item contains the stage name, approved Indonesian title, and optional body. The SVG is visual correspondence only.

```text
div.home-transformation-path
  svg[aria-hidden="true"][focusable="false"]
    guide path
    optional progress path
    five visual nodes
  ol
    li x 5
```

The SVG must use `aria-hidden="true"`, `focusable="false"`, and no role that exposes individual fragments. The list must not be hidden or replaced by canvas text.

### 6.3 Renderers

| Range | Renderer |
| --- | --- |
| 1024px and above | Horizontal U-path SVG plus five-column semantic list |
| 768-1023px | Simplified path if five labels retain safe measure; otherwise vertical renderer through CSS media query |
| Below 768px | Static vertical rail plus normal-flow ordered list; desktop SVG hidden |

Both SVG and list remain in stable DOM order. CSS controls which visual renderer is displayed. No resize listener is required, so no resize cleanup is required and hydration/layout branching is avoided.

### 6.4 Color and geometry

- Guide: Brand Secondary with sufficient visibility against the section surface.
- Progress: Brand Primary on light surface, or Sky Blue on Midnight if contrast testing confirms at least 3:1 for meaningful non-text graphics.
- Nodes: surface fill with a 3px or greater action/brand stroke.
- Labels: Inter 500/600 with 4.5:1 text contrast.
- The path must sit in its own grid row and may not pass behind paragraph text.
- The component root uses `min-width: 0` and `overflow: clip` only when browser support fallback to hidden is acceptable; the path itself must fit its viewBox without clipping nodes.

### 6.5 Static, animated, and failure states

- Static first render: guide, nodes, ordered labels, and all text are fully visible.
- Enhanced state: a progress path may animate from dash offset to zero after intersection.
- Trigger: once when at least 25% of the process component enters the viewport; hero may trigger after first paint.
- Duration: hero progress maximum 600ms; process progress maximum 800ms.
- Easing: existing `--ease-reveal`; no linear scrub.
- Reduced motion: no animation class is added, or CSS forces full path and zero duration.
- JavaScript failure: guide, nodes, and ordered list remain complete; the optional progress overlay may remain absent.
- Cleanup: disconnect `IntersectionObserver` on unmount; cancel any queued animation frame; never register a window scroll handler.

GSAP is not required. CSS/SVG animation and native `IntersectionObserver` are sufficient and avoid new motion weight or ScrollTrigger coupling.

### 6.6 Interaction behavior

The path is non-interactive. It has no tab stops, hover-only content, click nodes, tooltips, drag, or scroll control. Keyboard behavior is ordinary document reading. It cannot trap focus.

## 7. Typography migration plan

### 7.1 Current state

- `public/index.html` loads Poppins 400/500/600/700/800 and JetBrains Mono 400/500/600/700 through one Google Fonts stylesheet URL with `display=swap`.
- `--font-family-sans` is Poppins and drives body, headings, buttons, and public/operational UI.
- `--font-family-mono` is JetBrains Mono and drives technical/operational roles.
- Tailwind `heading` and `body` both map to `--font-family-sans`; `mono` maps to `--font-family-mono`.
- Inter is not loaded globally. It is injected only by the Concept A prototype while mounted.

### 7.2 Approved first-production scope

Choose **A. Homepage-scoped consumption**.

Inter becomes available through the existing font stylesheet but is applied only below the production Home root class, for example `.home-production`. Other public pages and operational surfaces continue to resolve their existing font variables and classes.

This deliberately avoids a public-marketing-wide or operational migration.

### 7.3 Semantic roles

| Token | Root fallback | Home-scoped value | Purpose |
| --- | --- | --- | --- |
| `--font-family-display` | `var(--font-family-sans)` | `'Poppins', system-ui, sans-serif` | H1, H2, H3 |
| `--font-family-body` | `var(--font-family-sans)` | `'Inter', system-ui, sans-serif` | Body, labels, captions, project descriptions |
| `--font-family-technical` | `var(--font-family-mono)` | `var(--font-family-body)` | Prevent mono use on Home while preserving operational technical type |

Root aliases preserve existing output. `.home-production` overrides only body and technical aliases. Existing `--font-family-sans` and `--font-family-mono` remain unchanged.

### 7.4 Font loading

Future `public/index.html` change:

- Append `Inter:wght@400;500;600` to the existing Google Fonts preload, stylesheet, and noscript URLs.
- Retain current Poppins and JetBrains weight declarations for the first implementation because protected public and operational routes already consume Poppins 400/500 and JetBrains weights. Removing them requires a separate usage audit.
- Do not add Manrope or Space Mono.
- Keep `display=swap`, existing preconnects, preload-as-style, media swap, and noscript fallback.

Home actually uses:

- Poppins 600 for UI, 700 for section/subsection headings, and 800 for H1/major headings.
- Inter 400 for body, 500 for captions/metadata, and 600 for labels.

No redundant Inter or approved Home Poppins weight is proposed.

### 7.5 CSS and Tailwind mapping

Planned `index.css` change:

- Add the three semantic aliases without changing existing values.
- Add Home-scoped overrides under `.home-production`.
- Add or update semantic type classes so `type-display-home` and heading roles resolve `--font-family-display`, while Home body/label classes resolve `--font-family-body`.
- Do not change operational `.font-mono-tech`, `.annotation-label`, or error-boundary type behavior.

Planned `tailwind.config.js` change:

- Map `fontFamily.display` to `var(--font-family-display)`.
- Map `fontFamily.body` to `var(--font-family-body)` instead of directly to `--font-family-sans`; root behavior stays Poppins.
- Add `fontFamily.technical` mapped to `var(--font-family-technical)` only if the implementation uses a utility. Do not replace existing `mono` mapping.

If Home uses the semantic CSS classes exclusively, the Tailwind config change may be omitted. The implementation commit must choose one path and avoid duplicate mechanisms. Preferred path: semantic mappings plus scoped variables, because it keeps component markup declarative and preserves root behavior.

### 7.6 Safeguards and QA

- Direct-load `/admin/login`, `/dashboard`, `/order`, and an admin route before and after. Computed Poppins/JetBrains families must remain unchanged.
- Direct-load `/about`, `/capabilities`, `/projects`, and `/contact`; no computed family change is allowed.
- Verify Home contains no `.font-mono-tech`, `.type-technical-metadata`, Space Mono, or JetBrains-computed text.
- Verify fallback with Google Fonts blocked: system-ui renders without hidden text, broken wrapping, or control overflow.
- QA Indonesian headings at every required width, especially 360, 430, 768, 1024, 1280, 1366, and 1536px.
- The font stylesheet adds Inter declarations to the existing CSS request. Binary font files should download only when used on Home.

## 8. CSS extraction strategy

### 8.1 Production style destinations

| Destination | Allowed content |
| --- | --- |
| `index.css` | Semantic font aliases and type-role mappings only |
| `tailwind.config.js` | Semantic font-family mappings only if adopted |
| `HomePage.css` | Home-scoped grids, TransformationPath geometry, Home-only media frames, and permitted motion |
| Tailwind utilities | Existing color, spacing, radius, container, border, focus, and responsive utilities |
| Existing brand files | No structural Home changes in first implementation |

`HomePage.css` must be imported only by `HomePage.jsx`, use a `.home-production` namespace, contain no prototype shell/review rules, contain no `!important` except an existing global reduced-motion rule that already applies, and target no protected route markup.

Recommended source limit: no more than 350 nonblank lines before review. A larger file must be split by component, not appended to `index.css`.

### 8.2 Prototype CSS migration table

| Prototype selector/group | Production destination | Action |
| --- | --- | --- |
| `.brand-prototype-shell`, controls, switcher, canvas | Brand Lab stylesheet | Keep prototype-only |
| `.brand-prototype-editorial`, `.brand-prototype-experimental` font variables | Scoped semantic aliases | Rewrite |
| `.bp-container` | `PageContainer` | Replace with existing primitive |
| `.bp-section` and tone modifiers | `MarketingSection` | Replace with existing primitive |
| `.bp-masthead` | None | Discard for production Home |
| `.bp-kicker`, `.bp-technical-label` | Home label class using Inter | Rewrite; reduce usage and remove mono |
| `.bp-actions`, `.bp-button*` | `BrandButton` and utilities | Replace with existing primitive |
| `.bp-media-frame` | Home media-frame class plus semantic radius/color utilities | Extract concept, rewrite declaration |
| `.bp-section-intro*` | Direct Home section markup | Rewrite with semantic utilities |
| `.bp-proof-list` | Home definition-row styles | Extract and scope |
| `.bp-project-roster` | None on Home | Discard; use one Projects CTA instead |
| `.bp-editorial-hero*` | `HomeHero` | Visual reference only; rewrite grid and mobile order |
| `.bp-editorial-feature*` | `HomeFlagshipProof` | Extract composition, rewrite classes |
| `.bp-editorial-capabilities*` | None | Discard because Concept B capability treatment won |
| `.bp-editorial-process*` | Mobile fallback reference | Rewrite inside `TransformationPath` |
| `.bp-editorial-supporting*` | Supporting rows | Extract divider-row concept, rewrite |
| `.bp-editorial-projects*` | `HomeProjectPreview` | Extract editorial composition, rewrite |
| `.bp-editorial-why*` | `HomeWhyNiuva` | Extract open-row concept, rewrite |
| `.bp-editorial-cta*` | `HomeTerminalCTA` | Extract open field, rewrite |
| `.bp-experimental-hero*` | `HomeHero` | Extract composition, rewrite typography and captions |
| `.bp-transformation-curve*` | `TransformationPath` | Rewrite with semantic list and two explicit placements |
| `.bp-experimental-proof*` | None | Use Concept A flagship treatment instead |
| `.bp-experimental-capabilities*` | `HomeCapabilityChapters` | Extract composition, rewrite without technical mono |
| `.bp-experimental-path`, stages | `HomeTransformationProcess` | Extract path concept, rewrite renderer and motion |
| `.bp-experimental-supporting*` | `HomeSupportingCapabilities` | Extract row layout, rewrite |
| `.bp-experimental-evidence*` | None | Discard; missing artifacts remain documentation dependencies |
| `.bp-experimental-projects*` | None | Discard in favor of Concept A project treatment |
| `.bp-experimental-why*` | None | Discard in favor of open aligned statements |
| `.bp-experimental-cta*` | None | Discard in favor of Concept A CTA |
| `bpEditorialReveal` | Home hero motion | Rewrite at 600ms maximum |
| `bpExperimentalHeroReveal` | Home hero motion | Rewrite into the same single hero event |
| `bpPathDraw` | TransformationPath progress | Rewrite at 800ms maximum and trigger once |
| `bpProjectReveal` and view timeline | Selected-project enhancement | Rewrite with `IntersectionObserver` or omit if budget fails |
| Prototype responsive blocks | Component-specific responsive rules | Rewrite only the rules required by the approved renderers |
| Prototype reduced-motion block | Existing global rule plus Home-specific guard | Rewrite without universal prototype selectors |

No selector block should be copied verbatim merely because it looks correct in Brand Lab.

## 9. Token impact

### 9.1 Decision

The approved Home requires aliases and local variables only. It requires no new palette values, no spacing-scale change, no radius-scale change, and no `MarketingSection` padding change.

### 9.2 Proposed aliases

| Token | Value source | Purpose | Scope | Replaces existing token | Accessibility and route impact |
| --- | --- | --- | --- | --- | --- |
| `--font-family-display` | Existing `--font-family-sans` | Semantic display role | Root alias, Home consumed | No | No visual change outside Home |
| `--font-family-body` | Existing `--font-family-sans`; Home override Inter | Semantic prose role | Root plus `.home-production` override | No | Improves Home readability; protected routes unchanged |
| `--font-family-technical` | Existing `--font-family-mono`; Home override body | Preserve operational mono and prohibit Home mono | Root plus Home override | No | Prevents unapproved Home mono; operations unchanged |

### 9.3 Local component variables

`HomePage.css` may define local geometry variables such as `--home-path-stroke` and `--home-media-max` only when they express repeated component geometry. Their values must resolve from existing semantic color, radius, spacing, or container tokens. They must not introduce new hex, rgba, shadow, or spacing values that duplicate an existing role.

Official palette values remain exactly:

- `#6390BB`
- `#8AAECF`
- `#4A72A0`
- `#1C2B3A`
- `#3D5266`
- `#6B7A8D`
- `#E2E8EE`
- `#EBF1F7`
- `#F8F9FB`
- `#FFFFFF`

## 10. Data and content architecture

### 10.1 Decision

Create `frontend/src/content/marketing/homeContent.js` as the canonical Home composition module.

It must import `profileContent` and select services/projects by stable exact title. It must not import from a Brand Lab path. It owns Home-only approved copy and the five-stage process schema.

### 10.2 Proposed schema

```text
homeContent
  hero
    companyName
    headline
    introduction
    primaryCta { label, to }
    secondaryCta { label, to }
  flagshipProject
  primaryCapabilities[]
  supportingCapabilities[]
  transformationStages[]
    key
    name
    title
    body
  selectedProjects[]
  whyNiuva[]
  finalCta
    title
    body
    primaryCta
    whatsappLabel
    whatsappHref
```

Project and service array entries are references to `profileContent` objects, not copied facts. Home-only narrative text is declared once in this module.

### 10.3 Migration steps

1. Create the module and tests asserting required selections are defined and ordered.
2. Move `positioningEvidence`, the approved five process stages, Why Niuva copy, hero copy, and CTA labels out of `HomePage.jsx` and `prototypeContent.js`.
3. Update `prototypeContent.js` to re-export or adapt the canonical Home module while Brand Lab remains active.
4. Keep `profileContent` unchanged in the Home migration unless a factual correction is separately approved.
5. After production acceptance and prototype removal, delete only the Brand Lab adapter; retain the canonical Home module.

This provides one factual source, no production dependency on Brand Lab, and temporary prototype compatibility.

## 11. Prototype lifecycle

### 11.1 Decision

Choose **A. Keep temporarily until production acceptance**.

The prototype routes remain disabled by default and serve as the visual rollback/reference during implementation. They are not production alternatives and must not be linked publicly.

### 11.2 Removal gate

Prototype cleanup may begin only after all of the following are true:

- The production `/` route passes Phase 4 acceptance at all required viewports.
- Standard and reduced-motion screenshots are approved.
- Accessibility, route regression, and performance budgets pass.
- Stakeholders confirm that production Home represents the approved hybrid.
- The rollback window has closed or the release tag is available.

### 11.3 Post-acceptance actions

| Item | Action after gate |
| --- | --- |
| `/__brand-lab/editorial` | Remove route and lazy import |
| `/__brand-lab/experimental` | Remove route and lazy import |
| `BrandPrototypeShell` | Remove with Brand Lab code |
| `prototypeContent.js` | Remove adapter after production content module is canonical |
| `brand-prototypes.css` | Remove in full; no production import is allowed |
| Review screenshots | Retain as decision evidence outside production assets |
| Review documentation | Retain in `doc/brand` |
| `REACT_APP_ENABLE_BRAND_LAB` | Remove only after route cleanup; until then default remains false |

Prototype removal should be a separate post-acceptance commit and is not part of the nine implementation commits below.

## 12. Implementation sequence

Every implementation commit runs the common baseline commands unless a focused command is additionally listed:

```text
yarn test --watchAll=false --runInBand
yarn build
git diff --check
```

If the focused test file does not exist until that commit, run the complete non-watch suite. Brand Lab comparison commits additionally run the build once with its flag false and once with its flag true, using the repository's existing environment mechanism without changing committed configuration.

### Commit 1 - Scoped typography foundation

- Expected files: `frontend/public/index.html`, `frontend/src/index.css`, optionally `frontend/tailwind.config.js`.
- Change: add Inter 400/500/600 to existing font request; add semantic aliases and Home-scoped behavior without applying it yet.
- Dependencies: none.
- Main risk: accidental font change outside Home.
- Rollback boundary: revert this commit alone.
- Verification: `yarn build`; direct computed-font checks on `/`, `/about`, `/admin/login`, and an operational route.
- Visual checkpoint: current Home and every protected route remain visually unchanged.

### Commit 2 - Canonical Home content module

- Expected files: new `frontend/src/content/marketing/homeContent.js`, `frontend/src/pages/brand-lab/prototypeContent.js`, content-selection test.
- Change: centralize approved Home copy and derive facts from `profileContent`.
- Dependencies: Commit 1 not technically required, but maintain order.
- Risk: undefined project/service if title changes.
- Rollback boundary: prototypes can restore their former adapter without touching production Home.
- Verification: focused test plus `yarn build` with Brand Lab disabled and enabled.
- Visual checkpoint: both prototypes remain factually and visually equivalent.

### Commit 3 - TransformationPath primitive

- Expected files: new `TransformationPath.jsx`, `useOnceInView.js`, scoped CSS, component test.
- Change: implement semantic ordered list, desktop SVG, mobile static renderer, and reduced-motion/failure behavior.
- Dependencies: canonical stages from Commit 2.
- Risk: SVG/list misalignment or horizontal overflow.
- Rollback boundary: component remains unused by production Home.
- Verification: focused tests, build, manual standalone rendering at 360/768/1024/1536.
- Visual checkpoint: static and animated path screenshots on light and approved dark surface.

### Commit 4 - Home hero and flagship proof

- Expected files: `HomeHero.jsx`, `HomeFlagshipProof.jsx`, scoped CSS, component tests.
- Change: create approved hero and Pindad proof without wiring `/` yet.
- Dependencies: Commits 1-3.
- Risk: duplicate-looking Pindad usage, LCP regression, heading wraps.
- Rollback boundary: remove new unused components.
- Verification: tests, build, local component/harness screenshots, network inspection for one high-priority Pindad URL.
- Visual checkpoint: 360, 430, 1024, 1366, 1536 standard and 360/1366 reduced motion.

### Commit 5 - Capability and supporting chapters

- Expected files: `HomeCapabilityChapters.jsx`, `HomeSupportingCapabilities.jsx`, scoped CSS, tests.
- Change: add question-led R&D, artifact-led Design & Prototyping, and two supporting rows.
- Dependencies: content module and typography.
- Risk: mirrored layouts, overly long service copy, Xeon upscale.
- Rollback boundary: new components remain isolated.
- Verification: tests, build, link destination checks.
- Visual checkpoint: 360, 768, 1024, and 1366 capability captures.

### Commit 6 - Process section integration

- Expected files: `HomeTransformationProcess.jsx`, scoped CSS, tests.
- Change: integrate the full path with the exact section surface and responsive stage layout.
- Dependencies: Commit 3.
- Risk: contrast, path clipping, observer cleanup.
- Rollback boundary: remove process wrapper without changing `TransformationPath`.
- Verification: focused tests, reduced-motion emulation, JS-disabled static inspection, build.
- Visual checkpoint: standard/reduced motion at 360, 768, 1024, and 1536.

### Commit 7 - Projects, Why Niuva, and final CTA

- Expected files: `HomeProjectPreview.jsx`, `HomeWhyNiuva.jsx`, `HomeTerminalCTA.jsx`, scoped CSS, tests.
- Change: add Concept A editorial projects, aligned proof rows, and open terminal CTA.
- Dependencies: Commits 1-2.
- Risk: Bicycle image upscale, CTA competition, interactive nesting.
- Rollback boundary: remove the three unused components.
- Verification: tests, link checks, image loading inspection, build.
- Visual checkpoint: 360, 430, 768, 1024, 1366, and 1536 selected sections.

### Commit 8 - Production Home composition switch

- Expected files: `frontend/src/pages/marketing/HomePage.jsx`, `frontend/src/pages/marketing/HomePage.css`, integration test.
- Change: replace old Home section composition with the eight approved sections, retain `MarketingLayout`, `BrandPage`, selectors, and shared foundations.
- Dependencies: Commits 1-7.
- Risk: primary production cutover, analytics selector drift, unexpected full-page spacing.
- Rollback boundary: revert this commit to restore the old Home while keeping unused new components available.
- Verification: `yarn test --watchAll=false --runInBand`, `yarn build`, full responsive screenshot pass, navigation and focus pass.
- Visual checkpoint: complete `/` at every required width in standard and reduced-motion modes.

### Commit 9 - Regression, performance, and release evidence

- Expected files: tests and `doc/brand` release/verification notes only; no unrelated refactor.
- Change: close accessibility gaps, remove unused Home code/styles, record bundle and Lighthouse comparisons.
- Dependencies: full implementation.
- Risk: late changes expanding scope.
- Rollback boundary: fixes remain individually reviewable; do not combine prototype deletion.
- Verification: complete test matrix, production build, Lighthouse runs, `git diff --check`.
- Visual checkpoint: final approved capture set and protected-route spot checks.

Estimated production implementation commits: **9**, followed by one optional prototype-cleanup commit only after the removal gate.

## 13. Accessibility plan

| Area | Required behavior | Verification |
| --- | --- | --- |
| H1 | Exactly one H1 in `HomeHero` | Role/heading test and manual outline |
| Heading hierarchy | H2 per major section; H3 for capability/project/proof items; no skipped level for visual sizing | DOM outline inspection |
| Process semantics | One ordered list of five stages in DOM order | Screen reader and DOM test |
| Alt text | Use approved `project.imageAlt`; no fabricated descriptions | Unit assertion and manual review |
| Decorative SVG | `aria-hidden`, `focusable=false`, no exposed child fragments | Accessibility tree inspection |
| Focus | Preserve global focus ring and logical order; no full-card links containing buttons | Keyboard pass |
| CTA labels | Use specific visible labels and destinations; accessible name includes capability/project context where needed | Link-role tests |
| Touch targets | General controls at least 44px; primary marketing CTA at least 48px | Computed-size check at 360px |
| Color contrast | Text 4.5:1; large text 3:1; meaningful path/node graphics 3:1 | Automated and manual contrast check |
| Responsive reading order | DOM order matches mobile visual order; desktop grid must not reorder meaning | CSS-off and mobile inspection |
| Reduced motion | All content visible; zero dependence on stroke progression, timing, hover, or scroll position | OS/browser emulation |
| JavaScript failure | Content, lists, images, and links render; only optional motion enhancement is absent | Disable JavaScript after server-render limitation is considered; at minimum remove enhancement class in dev tools |
| Font failure | System fallback remains readable with stable controls and acceptable wrapping | Block fonts in network tools |
| Image failure | Intrinsic space prevents shift; figure caption/project copy still identifies evidence | Block image requests |
| Keyboard | No path tab stops; all links reachable once; mobile Navbar behavior unchanged | Tab/Shift+Tab/Escape pass |

Because the app is a client-rendered SPA, a total JavaScript failure prevents React from mounting. The Home component's progressive-enhancement requirement therefore means animation JavaScript failure after mount must not hide content. This plan does not claim server-rendered no-JS delivery.

## 14. Performance plan

### 14.1 Release budgets

| Metric | Budget |
| --- | --- |
| Additional initial JS gzip | Maximum +6 kB over the same disabled-Brand-Lab production baseline; target <= 183 kB from the measured 176.76 kB reference |
| Additional CSS gzip | Maximum +3.5 kB for production Home-specific CSS |
| New animation-library cost | 0 kB; use existing platform APIs and CSS/SVG |
| Unique project image requests | 3 unique image URLs: Pindad, Xeon, Bicycle; Pindad may appear twice but must reuse one hashed URL |
| Above-fold image priority | Exactly one eager/high-priority image: hero Pindad |
| Font stylesheet requests | One existing combined Google Fonts stylesheet request |
| Home font binaries | Maximum six used faces: Poppins 600/700/800 and Inter 400/500/600; JetBrains must not be requested because of Home text |
| LCP | <= 2.5s on the agreed simulated mobile profile and no regression greater than 200ms from same-condition baseline |
| CLS | <= 0.05, target 0 |
| TBT | <= 200ms |
| Lighthouse performance | Median no more than 3 points below the identical-condition Phase F/current baseline; 100 is not required |

### 14.2 Image requirements

- Hero Pindad uses intrinsic dimensions, eager loading, high fetch priority, async decoding, and an accurate `sizes` attribute.
- Proof Pindad uses the same imported URL, lazy loading, and a different frame/crop. Browser request coalescing/cache should prevent a second transfer.
- Xeon and Bicycle are lazy and async.
- No image is rendered above its intrinsic dimensions in CSS at the target DPR without explicit visual-quality approval.
- Reserve aspect ratio and dimensions before load to prevent layout shift.
- Do not add a carousel, video, canvas, or generated artifact.

### 14.3 Lighthouse comparison protocol

1. Use the same machine, Chrome version, production build command, static server, viewport, throttling profile, cache state, and network conditions before and after.
2. Keep `REACT_APP_ENABLE_BRAND_LAB=false` for both builds.
3. Test the same `/` URL with analytics/session recording configuration held constant.
4. Run one warm-up, then three measured runs with a fresh profile/cache according to the chosen Lighthouse mode.
5. Record median Performance, LCP, CLS, TBT, transferred bytes, request count, and initial JS/CSS gzip.
6. Keep raw reports as release evidence and note any variance.
7. If the budget fails, first remove optional project motion and unused CSS, then inspect fonts and image priority before considering a budget exception.

Brand Lab must remain absent from disabled builds. Confirm no concept strings, prototype stylesheet chunk, or Brand Lab route chunk is emitted.

## 15. Responsive QA matrix

| Viewport | Hero | Path/process | Capabilities | Projects/media | CTA and page flow | Required capture |
| ---: | --- | --- | --- | --- | --- | --- |
| 360px | Four-line maximum H1, stacked full-width actions, no clipped media | Static vertical process; compact hero path labels readable | Single-column natural order | Bicycle never upscaled; figures fit width | Buttons do not wrap awkwardly; footer transition clean | Full page standard + reduced motion; hero/process close-ups |
| 430px | Verify less wrapping without oversized gaps | Vertical renderer and nodes aligned | Body measures remain comfortable | Xeon and Bicycle intrinsic quality | Primary remains dominant | Full page standard; hero/projects close-ups |
| 768px | Validate stack vs safe two-column threshold | Simplified/vertical renderer transition | Chapters remain differentiated | Consistent media-start layout | No narrow CTA columns | Full page standard + process close-up |
| 1024px | First full asymmetric grid; Navbar clearance | Desktop U-path begins without clipping | Two differentiated columns | Editorial layout may alternate | Actions retain hierarchy | Full page standard + reduced motion process |
| 1280px | H1 target two lines | Five stage labels align | Open grid breathes without oversized voids | Pindad/Xeon remain within source-quality limits | Footer transition and section spacing | Full page standard |
| 1366px | Reference desktop composition | Path curve and nodes align | No mirrored-card reading | Alternating selected projects clear | Final CTA label no wrap | Full page standard + hero/projects close-ups |
| 1536px | Container cap prevents overexpansion | Path stays inside 84rem container | Text measures capped | No media upscale beyond approved maximum | Whitespace controlled, not empty | Full page standard + reduced motion |

At every viewport verify hero order, heading wrapping, path rendering, capability composition, process readability, image quality, selected-project layout, CTA hierarchy, no horizontal overflow, no clipped path, no overly narrow prose, Footer transition, and reduced-motion output.

Focused screenshots must use the same folder convention as the prototype review, under a new production-Home subfolder. Do not overwrite prototype evidence.

## 16. Regression safety plan

### 16.1 Protected route checks

| Surface | Required check |
| --- | --- |
| `/about` | PageHero, ProcessTimeline, CTASection, metadata, links, and current screenshot remain unchanged |
| `/capabilities` and `/services` | Alias behavior, service hierarchy, CapabilityPanel, ProcessTimeline, CTA destinations, and metadata remain unchanged |
| `/projects` and `/portfolio` | Alias behavior, ProjectCaseStudyCard, project facts, lazy images, CTA destinations, and metadata remain unchanged |
| `/contact` | PageHero, contact channels, form fields, validation, payload, privacy text, map, email, WhatsApp, and metadata remain unchanged |
| `/admin/login` | Typography, logo, auth behavior, noindex behavior, and layout unchanged |
| `/dashboard` | Protected-route behavior, operational typography, data views, and redirect unchanged |
| `/order` | Auth guard and order workflow unchanged |
| `/orders/*` | Auth guard, route parameter, detail flow, and status UI unchanged |
| `/login`, `/register` | Existing wildcard/redirect behavior unchanged |
| Navbar | Links, aliases, active state, mobile focus, Escape close, language behavior, and CTA unchanged |
| Footer | Navigation and contact destinations unchanged |

### 16.2 Hardening checks

- `AppErrorBoundary` behavior unchanged.
- Other route-level lazy imports unchanged.
- Home remains the only eager marketing route unless a separate performance decision approves otherwise.
- Analytics bootstrap, masking, and session-recording flags unchanged.
- Canonical and meta description behavior unchanged.
- Sitemap and robots generation unchanged.
- CORS, API clients, backend, environment validation, security headers, source-map behavior, and build hardening unchanged.
- Brand Lab remains conditional and disabled by default.

### 16.3 Regression commands

Use repository-supported commands only:

```text
yarn test --watchAll=false --runInBand
yarn build
git diff --check
```

Add focused test paths as they are created. Do not add a test dependency merely to satisfy this plan.

## 17. Rollback plan

### 17.1 Baselines and branch strategy

- Last commit that changed the production Homepage: `03c4e63`.
- Current approved planning baseline: `c7de6e2`; its production Home is still equivalent to `03c4e63`.
- Implement on a dedicated branch created from the approved planning baseline, recommended name `redesign/homepage-production`.
- Keep the nine commit boundaries from Section 12. Do not squash before review because typography, motion, content, and cutover need independent rollback.

### 17.2 Rollback levels

| Failure | Rollback action |
| --- | --- |
| Production Home composition fails | Revert Commit 8 only; old `HomePage.jsx` composition returns while new unused components remain harmless |
| Typography affects protected routes | Revert Commit 1 only; Home falls back to current Poppins system |
| Path/motion causes jank | Revert process integration or disable enhancement while retaining static `TransformationPath` |
| Content mapping fails | Revert Commit 2 and restore prototype adapter; project facts in `profileContent` remain untouched |
| Full release rejected | Revert implementation commits in reverse order; do not reset or rewrite shared history |

Use non-destructive `git revert` for shared/reviewed history. Prototype routes remain available behind their flag throughout rollback. Do not remove Brand Lab in the production implementation series.

### 17.3 Rollback confirmation

- `/` matches the known-good production screenshot and section order.
- Metadata/canonical still resolve for `/`.
- All Navbar/Footer links work.
- Protected public and operational routes pass their smoke checks.
- Brand Lab remains disabled by default and works only when explicitly enabled.
- Production build and `git diff --check` pass.
- No database rollback is required.

## 18. File-change forecast

### 18.1 Expected modifications during Phase 4

| File | Planned change |
| --- | --- |
| `frontend/public/index.html` | Add Inter 400/500/600 to existing font request only |
| `frontend/src/index.css` | Add semantic font aliases and scoped Home type behavior |
| `frontend/tailwind.config.js` | Add semantic font mappings only if the chosen type implementation requires them |
| `frontend/src/pages/marketing/HomePage.jsx` | Replace production Home composition while preserving layout, route, and selectors |
| `frontend/src/pages/brand-lab/prototypeContent.js` | Temporarily adapt prototypes to canonical Home content without visual changes |

### 18.2 Expected new files during Phase 4

- `frontend/src/content/marketing/homeContent.js`
- `frontend/src/pages/marketing/HomePage.css`
- `frontend/src/hooks/useOnceInView.js`
- Home components listed in Section 4.1.
- Focused tests listed in Section 4.1.

### 18.3 Files expected to remain unchanged

- `frontend/src/App.js`
- `frontend/src/components/layout/Navbar.jsx`
- `frontend/src/components/layout/Footer.jsx`
- `frontend/src/components/layout/Layout.jsx`
- `frontend/src/components/brand/BrandSystem.jsx`
- `frontend/src/components/brand/CompanyProfileBlocks.jsx`
- `frontend/src/components/brand/BrandIdentity.jsx`
- Existing public page files other than `HomePage.jsx`.
- Backend, APIs, assets, environment files, build hardening, analytics, sitemap, and robots files.

If implementation discovers that a listed unchanged shared file must change, stop and document the exact reason and regression surface before editing it. Do not silently expand scope.

## 19. Risks and mitigations

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Pindad appears repetitive in hero and proof | Medium | Use full artifact vs detail frame from same source; control height; no second priority request |
| Pindad source is only 555x414 | High for large DPR | Cap rendered dimensions, use contain, and accept neutral space instead of upscale |
| Bicycle image is low resolution | High | Keep within intrinsic portrait size; never use as wide hero media |
| Home Inter leaks to operational UI | High | Root aliases preserve current values; scope override to `.home-production`; computed-font regression checks |
| Shared component variant changes other routes | High | Do not change shared structural APIs; use Home-specific wrappers |
| U-path clips or overflows | High | Separate desktop/mobile renderers, stable viewBox, container tests at seven widths |
| Animation hides content | High | Static first render, enhancement-only overlay, reduced-motion and JS-failure tests |
| Existing `BrandPage` animates too many items | Medium | Do not use `.brand-reveal` or `[data-brand-visual]` in new Home components |
| Prototype CSS contaminates production | High | No wholesale copy; scoped rewrite table and CSS size budget |
| Factual content diverges | High | Derive service/project objects from `profileContent`; one Home content module |
| CTA or aliases regress | High | Reuse `BrandButton`; explicit destination tests; keep App/Navbar/Footer unchanged |
| Initial bundle grows materially | Medium | No new dependency, <=6 kB JS and <=3.5 kB CSS budgets, disabled Brand Lab build audit |
| Font request cost increases | Medium | Add only Inter 400/500/600 to existing request; no Manrope/Space Mono; preserve swap |
| Heading wrap changes after font swap | Medium | Seven-width QA plus font-failure pass |
| Prototype cleanup removes rollback evidence too early | Medium | Keep until acceptance and rollback gate closes |

## 20. Explicit do-not-change list

Phase 4 Homepage implementation must not change:

- `/about`.
- `/capabilities`.
- `/services`.
- `/projects`.
- `/portfolio`.
- `/contact`.
- `/admin/login`.
- `/dashboard`.
- `/order`.
- `/orders/*`.
- `/login` and `/register` redirect behavior.
- Navbar routes, aliases, active states, or mobile behavior.
- Footer destinations or contact details.
- Official logo geometry or asset.
- Official palette values.
- Blue Dark accessible action role.
- `MarketingSection` standard or compact padding.
- Contact form fields, validation, payload, privacy behavior, or API contract.
- Approved project facts, project names, challenge, solution, output, or capability model.
- Taxonomy labels or Office & Signage placement.
- Backend, API, CORS, authentication, admin, dashboard, order, or operational behavior.
- Analytics, sitemap, robots, canonical hardening, source-map configuration, error boundary, lazy-route behavior, or security behavior.
- Assets or dependencies unless separately authorized.
- Brand Lab default-disabled behavior.

Do not add fake metrics, testimonials, outcomes, alternate project images, CAD, sketches, process artifacts, or stock corporate photography.

## 21. Phase 4 implementation acceptance criteria

Phase 4 is acceptable only when all conditions below pass:

### Composition and content

- `/` renders exactly eight approved sections in the approved order.
- Hero, capabilities, and process follow the specified Concept B behaviors.
- Flagship, projects, and final CTA follow the specified Concept A behaviors.
- Existing factual project and service content remains unchanged unless the approved Home module uses an equivalent approved wording.
- No card grid replaces the open capability, project, Why Niuva, or CTA treatments.
- No Office & Signage or taxonomy rename appears.

### Component safety

- Existing shared structural components remain visually unchanged on other routes.
- Home uses dedicated `HomeHero`, `TransformationPath`, capability, project, Why Niuva, and CTA components.
- `MarketingSection`, `PageContainer`, `BrandButton`, Navbar, Footer, metadata, and route behavior are reused unchanged.
- No production import points into `pages/brand-lab`.

### Typography and graphics

- Computed Home headings/buttons are Poppins and body/labels/captions are Inter.
- No Home text computes to JetBrains Mono or Space Mono.
- Exactly two dominant U-curve placements appear.
- The path means Need to Output and never acts as wallpaper.
- Official palette values and action contrast remain intact.

### Media and motion

- Hero Pindad is the only high-priority image.
- Pindad reuse does not cause a duplicate transferred image payload.
- Xeon and Bicycle remain lazy and resolution-appropriate.
- Motion is limited to the three approved event types maximum.
- Reduced-motion output is complete and static.
- No perpetual, parallax, cursor, marquee, gradient, or scroll-hijack effect exists.

### Accessibility, performance, and regression

- One H1, correct heading hierarchy, ordered process semantics, descriptive alt text, and visible focus pass.
- All interaction targets meet minimum size.
- Seven-width QA passes without overflow, clipping, or unreadable wrapping.
- Initial JS, CSS, image, font, LCP, CLS, TBT, and Lighthouse budgets pass or have an explicit approved exception.
- Protected public and operational route checks pass.
- Production build, focused tests, and `git diff --check` pass.
- Brand Lab remains disabled by default and excluded when disabled.

## 22. Next authorized action after this plan

After stakeholder approval of this document, the next action should be **Phase 4 - Production Homepage implementation**, executed through the commit sequence in Section 12.

That authorization must remain limited to `/`. It must not authorize global route rollout, shared public redesign, operational typography migration, prototype deletion before acceptance, taxonomy changes, or Brand Guidelines v1.1 work.
