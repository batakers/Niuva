# Niuva Brand-to-Website Audit

- Status: Phase 0.1 audit
- Scope: Public website only
- Pages: Home, About, Capabilities, Projects, Contact
- Source date: 12 July 2026
- Implementation baseline: commit `03c4e63`

## 1. Executive summary

The current website has a sound brand foundation. It uses the approved Niuva color family, keeps R&D and prototyping prominent, presents projects as mini case studies, provides clear contact paths, and uses the approved public logo asset. It is already credible, readable, and substantially more disciplined than a generic vendor website.

The main gap is not correctness. The gap is expression. The public website currently behaves like a polished engineering company profile: repeated split heroes, repeated label-heading-explainer headers, repeated bordered cards, and the same blue proof panel across routes. This creates consistency, but also makes the experience feel more corporate, templated, and static than the intended innovation-studio personality.

The next design phase should preserve the business structure, routes, approved logo, palette, accessibility foundations, contact logic, and project evidence. It should change the composition model: fewer cards, more open editorial groupings, stronger use of real process imagery, more varied page rhythm, and one recognizable graphic idea derived from the U-curve.

Recommended direction: **Concept B, Experimental Engineering Studio**, executed with editorial restraint. This direction best expresses experimental, technical, collaborative, precise, approachable, and forward-looking qualities without turning Niuva into a technology spectacle. The direction should use Poppins + Inter as the approved primary typography pair, with motion and composition carrying the expressive shift.

No production implementation should begin until stakeholders approve typography, hero direction, photography treatment, service taxonomy, and the graphic-element budget.

## 2. Audit method and sources

This audit compared the current public implementation with:

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- `docs/references/requirements/historical-active/BRD_Website_Niuva.md`
- `docs/references/requirements/historical-active/PRS_Website_Niuva.md`
- `docs/references/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf`
- `docs/archive/drafts/BRAND_DIGITAL_EXTENSION.md` — archived draft; historical comparison only
- `docs/archive/implementation-history/BRAND_IMPLEMENTATION_PLAN.md` — archived implementation history; historical sequencing only
- Current React components, CSS tokens, public routes, and local project assets
- Desktop renders of Home, About, Capabilities, Projects, and Contact
- Narrow-layout renders of Home and Projects, used as supporting visual evidence only

No standalone files titled Phase A through Phase G were present in the repository. The phase definitions available in `BRAND_IMPLEMENTATION_PLAN.md` were used as the implementation-sequence reference.

Findings use these classifications:

1. **Already aligned**: materially follows the guideline and product intent.
2. **Partially aligned**: correct foundation, incomplete or over-repeated execution.
3. **Conflicting**: implementation works against the intended brand or website role.
4. **Missing**: guideline or product requirement has no meaningful expression.
5. **Should not be implemented literally**: valid guidance for brand governance or print, but unsuitable as direct website composition.

## 3. Alignment score

| Dimension | Score | Classification | Main observation |
|---|---:|---|---|
| Brand personality | 68/100 | Partially aligned | Precise and trustworthy, but not experimental or collaborative enough |
| Logo system | 82/100 | Already aligned | Public navbar/footer use the approved mark; a separate operational logo component conflicts |
| Color palette and roles | 86/100 | Already aligned | Semantic separation is strong; composition remains visually restrained |
| Typography | 65/100 | Partially aligned | Poppins supports the brand, but body and technical roles do not match v1.0 |
| Graphic elements | 64/100 | Partially aligned | U-curve and circles are present, but repeated as decoration rather than narrative structure |
| Photography | 38/100 | Missing | Authentic project proof exists, but people, process, testing, and workspace coverage are absent |
| Layout and composition | 61/100 | Partially aligned | Grid is orderly and responsive, but page grammar repeats too often |
| Tone of voice | 82/100 | Already aligned | Clear, specific, restrained, and business-oriented |
| Studio distinctiveness | 48/100 | Conflicting | Repeated hero and card patterns make pages feel templated |
| Lead-generation clarity | 91/100 | Already aligned | CTA hierarchy and contact routes are obvious |
| **Overall brand-to-website alignment** | **69/100** | **Partially aligned** | **Strong foundation, insufficient studio expression** |

### Perception profile

| Perception | Current | Target |
|---|---:|---:|
| Corporate credibility | 8/10 | 8/10 |
| Technical precision | 8/10 | 9/10 |
| Approachability | 6/10 | 8/10 |
| Collaboration | 5/10 | 8/10 |
| Experimentation | 4/10 | 8/10 |
| Creative-studio character | 4/10 | 8/10 |
| Generic SaaS risk | 5/10 | 2/10 |
| Static company-profile risk | 7/10 | 2/10 |

## 4. Current website strengths

1. **Business hierarchy is clear.** R&D and Design & Prototyping receive greater weight than supporting services.
2. **Projects contain proof structure.** Challenge, solution, output, and capability are present instead of image-only portfolio cards.
3. **Conversion paths are visible.** `Diskusikan Project`, WhatsApp, email, form, and location are consistently available.
4. **The approved palette is implemented semantically.** Brand Blue, Sky Blue, Blue Dark, Midnight, Steel, Smoke, Silver, Frost, Cloud, and White have distinct roles.
5. **The public logo asset is consistent.** Navbar and footer use the approved `niuva-mark.svg` through `BrandIdentity`.
6. **Typography is readable.** Heading weights, body measure, and line height are generally suitable for B2B readers.
7. **Accessibility foundations are present.** Focus states, semantic sections, labels, alt text, reduced-motion checks, and minimum control heights are visible in the implementation.
8. **Copy avoids unsupported claims.** The site does not invent metrics, awards, or exaggerated outcomes.
9. **The public and operational surfaces are structurally separated.** Brand expression is concentrated in marketing components.
10. **The current design can evolve without an IA rewrite.** Routes, content hierarchy, and conversion logic are sound.

## 5. Current website conflicts

### 5.1 Repeated page grammar

Every public route starts with a similar split hero: label, large heading, body, two CTAs, and a blue proof panel with U-curves and circles. This makes navigation predictable, but it also removes page-specific character. About, Capabilities, Projects, and Contact look like content substitutions inside the same template.

Classification: **Conflicting**.

### 5.2 Excessive label and pill cadence

Small rounded labels appear above most page and section headings. The labels are readable and on-brand in isolation, but repetition turns them into interface scaffolding. They also make a marketing website feel more like a brand guideline presentation.

Classification: **Partially aligned**.

### 5.3 Card-heavy information architecture

Capability details, process steps, values, contact channels, supporting services, and project cases frequently use bordered rounded containers. Many are true cards, but several could be open editorial groups or divider rows. The cumulative effect is closer to a component catalogue than a studio narrative.

Classification: **Conflicting**.

### 5.4 Graphic motifs lack a narrative job

U-curves, circles, and dots are present in heroes, proof panels, CTA panels, and section decoration. They consistently reference the logo, but they rarely explain process, movement, connection, or transformation. Repetition makes them wallpaper.

Classification: **Partially aligned**.

### 5.5 Photography is evidence-only, not identity-building

The four project assets are authentic and valuable. Two images are low-resolution workshop snapshots, while the other two are cleaner product views. There are no photographs of discovery sessions, sketches, CAD work, fabrication, testing, collaboration, or the Bandung Techno Park environment.

Classification: **Missing**.

### 5.6 Public and operational logo implementations diverge

`BrandIdentity` uses the approved brand asset on public pages. `Logo.jsx`, currently used by Admin Login, draws a different geometric N with measurement marks. It is not the official `ni` mark and risks creating a second logo system.

Classification: **Conflicting**. This audit does not authorize changing it because operational code is outside the permitted scope.

## 6. Brand guideline findings

| Guideline area | Classification | Evidence and reasoning |
|---|---|---|
| Innovative personality | Partially aligned | Technical content is strong, but the composition is conservative and repetitive |
| Collaborative personality | Missing | Copy says partnership, but imagery and layout show little human collaboration |
| Precise personality | Already aligned | Grid, spacing, project proof, labels, and concise copy communicate rigor |
| Trustworthy personality | Already aligned | Real project names, restrained claims, and transparent process build confidence |
| Futuristic / forward-looking | Partially aligned | EV and simulator content supports it, but the visual system does not feel exploratory |
| Professional personality | Already aligned | Presentation quality and CTA clarity are strong |
| Primary logo lockup | Partially aligned | Public mark and word `Niuva` are consistent, but not always the exact approved lockup |
| Reversed logo | Missing | Current public site does not meaningfully demonstrate the approved reversed lockup |
| Logo clear space and sizing | Already aligned | Public navbar provides sufficient size and spacing |
| Official color palette | Already aligned | Exact values are represented in semantic tokens |
| Brand Blue for identity | Already aligned | Used in the mark, motifs, highlights, and accents |
| Dark Blue for interactive contrast | Already aligned | Blue Dark is separated as the action color |
| Poppins display | Already aligned | Headings and UI use Poppins |
| Inter body, labels, and data | Missing | Current body remains Poppins and technical metadata uses JetBrains Mono |
| U-curve | Partially aligned | Present, but used too frequently as decorative texture |
| Solid circles | Partially aligned | Present across many sections; not always semantically useful |
| Dot-grid pattern | Missing | Not materially used on the public website |
| Line pattern | Missing | Not materially used, which is acceptable unless a technical context justifies it |
| Rounded image frames | Already aligned | Project media uses rounded frames |
| Card radius guidance | Already aligned | Most cards follow the 12-16px range and feature panels use 20-24px |
| Authentic process photography | Missing | Existing assets show products more than process and collaboration |
| Natural light and cool undertones | Partially aligned | Pindad image aligns; workshop photos are inconsistent and weakly art-directed |
| 12-column layout | Partially aligned | Tailwind grids reflect structured columns but do not expose a canonical 12-column system everywhere |
| Clear, confident voice | Already aligned | Copy is direct and avoids jargon-heavy claims |
| Collaborative voice | Already aligned | Partnership language is present without becoming overly promotional |
| Forward-looking voice | Partially aligned | Future orientation is present through subject matter more than verbal character |

### Guideline elements that should not be implemented literally

| Guideline specimen | Classification | Website interpretation |
|---|---|---|
| Card specimen board | Should not be implemented literally | Cards are examples, not a mandate to wrap every content block |
| 12-column diagram on every section | Should not be implemented literally | Use the grid as infrastructure, not as visible decoration |
| Dot-grid on every dark surface | Should not be implemented literally | Reserve it for one technical context per page at most |
| Primary color listed for CTA and links | Should not be implemented literally | Brand Blue cannot carry small white text safely; use Blue Dark for accessible actions |
| Poppins 64px H1 everywhere | Should not be implemented literally | Use fluid type and test Indonesian wrapping at every breakpoint |
| Full set of services as equal cards | Should not be implemented literally | Business documents require a primary and supporting hierarchy |
| Brand application mockup as page template | Should not be implemented literally | It demonstrates identity consistency, not final website composition |

## 7. Typography comparison

### Candidate matrix

Scores use a 1-5 scale, where 5 is strongest. Risk scores use 1 as low risk and 5 as high risk.

| Criterion | A. Poppins + Inter | B. Manrope + Space Mono | C. Space Grotesk + DM Mono |
|---|---:|---:|---:|
| Innovation-studio personality | 4 | 4 | 5 |
| Body readability | 5 | 4 | 4 |
| Heading character | 4 | 4 | 5 |
| Technical annotation | 4 | 5 | 5 |
| Compatibility with Niuva mark | 5 | 4 | 4 |
| Brand-guideline approval | 5 | 2 | 2 |
| Performance efficiency | 4 | 3 | 3 |
| Mobile heading wrapping | 4 | 5 | 3 |
| Corporate appearance risk | 3 | 2 | 2 |
| Generic SaaS risk | 3 | 3 | 5 |

### A. Poppins + Inter

- Poppins preserves the geometry and rounded character explicitly tied to the logo.
- Inter improves long-form body copy, form content, and technical clarity.
- The pair is already approved by Brand Guidelines v1.0.
- Its main risk is not the font itself, but conventional composition. With repeated cards and centered proof panels it can feel corporate. With stronger art direction, Poppins remains distinctive enough.
- Performance is manageable with disciplined weights: Poppins 600/700/800 and Inter 400/500/600.

### B. Manrope + Space Mono

- Manrope feels contemporary, open, and approachable while retaining technical precision.
- Its narrower structure can improve Indonesian heading wrapping on mobile.
- Space Mono creates a visible engineering annotation voice, but it is wide and should be restricted to short metadata.
- Adopting it would require Brand Guidelines v1.1 approval because it replaces the approved brand typeface.

### C. Space Grotesk + DM Mono

- This is the most experimental candidate and gives headings a strong studio character.
- It also has the highest generic technology-startup risk because the pairing is widely used in portfolio and SaaS work.
- Space Grotesk can create awkward wraps in long Indonesian headings when used at heavy weights.
- It is less naturally connected to the rounded `ni` mark than Poppins.

### Typography recommendation

**Primary pair: Poppins + Inter.** Preserve Poppins for display, headings, and UI. Use Inter for body, labels, forms, and non-display content. Expression should come from scale, composition, image integration, and motion rather than an unapproved font replacement.

**Fallback pair requiring approval: Manrope + Space Mono.** Use only if Homepage concept testing demonstrates a meaningful personality improvement and stakeholders approve a Brand Guidelines v1.1 change.

**Do not carry JetBrains Mono forward as the public technical voice by default.** It can remain in operational systems, but public use should be compared with the approved Inter label role or a stakeholder-approved Space Mono alternative.

## 8. Color-role findings

### Current dominance

- Cloud, Frost, White, and Midnight dominate the page canvas and typography.
- Blue Dark dominates interactive controls and large proof panels.
- Niuva Blue appears in the logo, small circles, motif lines, and selected decoration.
- Sky Blue is present but visually secondary.

### Findings

| Finding | Classification | Recommendation |
|---|---|---|
| Exact official palette is implemented | Already aligned | Preserve values |
| Brand Blue and Action Blue are semantically separated | Already aligned | Keep `#6390BB` for identity and `#4A72A0` for accessible interaction |
| Website feels restrained rather than too dark | Already aligned | Maintain light canvas, but create one or two more committed blue moments per page |
| Brand Blue lacks large expressive roles | Partially aligned | Use it in media framing, diagrams, U-curve fields, and controlled section anchors |
| Blue proof panels repeat on every hero | Conflicting | Vary page-specific media and reduce repeated blue rectangles |
| White normal text on Brand Blue is unsafe | Should not be implemented literally | Do not use `#FFFFFF` on `#6390BB` for normal text; use Midnight text or Blue Dark surfaces |
| Neutral bands are visually similar across pages | Partially aligned | Vary composition and imagery before adding more colors |

### Recommended digital roles

| Role | Color | Use |
|---|---|---|
| Brand identity | `#6390BB` | Logo, major motif, selected media field, signature visual moments |
| Brand support | `#8AAECF` | Secondary motif, hover wash, diagram support |
| Primary action | `#4A72A0` | Buttons, links requiring emphasis, active nav, focus |
| High-emphasis ink | `#1C2B3A` | Headings, dark technical fields, accessible hover |
| Body ink | `#3D5266` | Body copy and explanatory text |
| Low-emphasis metadata | `#6B7A8D` | Short metadata only |
| Structural neutral | `#E2E8EE` | Sparse dividers and borders |
| Muted surface | `#EBF1F7` | Supporting sections and form groups |
| Page canvas | `#F8F9FB` | Main light background |
| Readable surface | `#FFFFFF` | Forms, floating nav, true cards, media captions |

## 9. Graphic-element findings

| Element | Current state | Classification | Recommendation |
|---|---|---|---|
| U-curve | Present in heroes, proof panels, CTA, and decorative motifs | Partially aligned | Make it the primary signature, but give it one narrative job per page |
| Solid circles | Frequent decorative accents | Partially aligned | Reduce by at least half; use only as endpoints, stages, or focus markers |
| Dot pattern | Effectively absent | Missing | Introduce only in a specific technical or prototyping context if needed |
| Line pattern | Absent | Missing | Use only where it can represent measurement, iteration, or material testing |
| Rounded image frame | Present | Already aligned | Preserve 20-24px for feature media and 16px for standard media |
| Card component | Present throughout | Conflicting through overuse | Restrict to discrete reusable objects and interactions |

### Recommended signature behavior

Use the U-curve as a **transformation path** rather than a background stamp. It can connect input to experiment to output, crop into photographs, or guide a project sequence. It should not appear in every section.

### Graphic-element budget per page

| Page | Dominant motif placements | Secondary accents | Maximum recommendation |
|---|---:|---:|---|
| Home | 2 | 1 | Hero transformation path, one process/project transition, one small CTA accent |
| About | 1 | 1 | One culture/process composition and one ecosystem accent |
| Capabilities | 2 | 0-1 | One capability map and one process path |
| Projects | 1 | 0 | One index or transition device; photography must dominate |
| Contact | 1 | 0 | One path connecting channel selection to brief submission |

Do not use a motif merely to fill empty space. Empty space is valid when it creates focus.

## 10. Card and surface classification

### Radius contract

| Surface type | Radius | Rule |
|---|---:|---|
| Section background / full-width band | 0px | Structural page rhythm remains square |
| Open editorial layout | 0px | Use spacing and type hierarchy, not a container |
| Divider row | 0px | Use sparse horizontal rules only |
| Input and control | 12px | Clear interaction affordance |
| True card | 16px | Discrete repeated object or selectable item |
| Feature panel | 20px | Major contained narrative or highlighted capability |
| Media frame | 20-24px | Large photography or project artifact |
| Pill or circle | Full | Tags, compact status, avatars, and true circular marks only |

### Shared component classification

| Component | Current type | Recommended type | Radius | Finding |
|---|---|---|---:|---|
| Navbar | Floating control shell | Floating control shell | 20px | Already aligned, but visually similar to SaaS navigation |
| Footer | Section background | Open editorial footer | 0px | Already aligned; preserve restrained structure |
| PageHero | Feature composition | Page-specific editorial/media composition | 0px outer, 20-24px media | Repeated proof-panel template should be retired |
| SectionHeader | Open editorial layout | Vertical editorial header | 0px | Split pattern and pill repetition are overused |
| BrandButton | Control | Control | 12px | Already aligned and accessible |
| CapabilityPanel | Feature panel | Open capability chapter or one feature panel | 20px if contained | Too much detail is boxed into identical structures |
| ServiceCard | True card | Divider row or compact card | 16px if discrete | Supporting services can be lighter than primary capability panels |
| ProjectCaseStudyCard | Media frame + case study | Editorial project feature | 20-24px media, 0px text | Strong content, but the whole case need not be one bordered card |
| ProcessTimeline | Ordered sequence | Process path / open sequence | 0px or 16px only if interactive | Six repeated cards obscure progression |
| CTASection | Feature panel | One strong terminal action | 20px | Valid, but nested shell and card can be simplified |
| ContactSummary | True cards | Channel controls | 16px | Valid cards because each is a distinct contact action |
| ContactForm | Control group | Form surface | 16px | Valid contained surface |
| DecorativeMotif | Graphic layer | Narrative graphic layer | Not applicable | Reduce repeated circles and make motif placement intentional |
| MarketingSection | Section background | Section background | 0px | Already aligned |

### Surface audit by page

| Page area | Current classification | Recommended treatment |
|---|---|---|
| Home hero proof | Feature panel | Replace with real process artifact or project image composition |
| Home positioning | Open editorial layout | Preserve |
| Home core capabilities | Feature panels and cards | Two open primary chapters, supporting services as lighter rows |
| Home process | Six true cards | One connected process sequence with fewer containers |
| Home featured projects | Large bordered cards | Media-led editorial project features |
| Home Why Niuva | One feature panel plus four cards | Keep one anchor panel; convert the four cards to aligned statements or rows |
| About role/background | Cards and split layouts | More people/process imagery and fewer boxes |
| About vision/mission | Feature panels | Preserve one feature panel, open the secondary statement |
| About values | True cards | Convert to an open principles sequence |
| Capabilities primary | Large feature panels | Use chapter-style sections with artifacts, diagrams, and outputs |
| Capabilities supporting | True cards | Keep compact cards or divider rows |
| Projects list | Bordered case-study cards | Open text beside dominant media; sparse divider between cases |
| Contact channels | True cards | Preserve because actions are distinct |
| Contact steps | True cards | Convert to a simple ordered response sequence |
| Contact map | Media frame | Preserve |

## 11. Photography gap list

### Assets already usable

| Asset | Useability | Recommended role |
|---|---|---|
| `pindad-ev-motor.webp` | Strong | Featured project hero or full-width project proof |
| `xeon-redesign.webp` | Good with limitations | Project artifact, preferably paired with sketches/CAD/process detail |
| `agate-bicycle-arcade.webp` | Authentic but low-resolution | Supporting process evidence, not a large hero image |
| `agate-motorcycle-simulator.webp` | Authentic but low-resolution | Supporting workshop proof, crop carefully and avoid large upscale |

### Assets requiring replacement or supplementation

- Bicycle Arcade needs higher-resolution documentation from multiple angles.
- Motorcycle Simulator needs higher-resolution testing and usage photographs.
- Xeon redesign needs process artifacts: sketch, CAD, component packaging, or prototype detail.
- Pindad EV needs collaboration, engineering detail, and testing context to avoid reading as a product beauty shot only.

### Missing photo categories

1. Discovery and research sessions with real project material.
2. Team collaboration across engineering and design.
3. Sketching, CAD, component layout, and design review.
4. Fabrication, assembly, and makerspace activity.
5. Prototype testing with people using the product.
6. Material, tooling, wiring, and mechanical detail.
7. Workshop and training facilitation.
8. Bandung Techno Park exterior, interior, and makerspace context.
9. Team portraits in working context, not formal corporate poses.
10. Supporting apparel, merchandise, and signage examples if those services remain public.

### Future documentation shot list

- Wide environmental shot of the team working around a prototype.
- Overhead table shot containing notes, drawings, components, and measurement tools.
- Close-up of hands assembling or testing a mechanism.
- Screen and physical prototype in the same frame.
- Client collaboration moment with real artifacts visible.
- Before/during/after sequence for one flagship project.
- Simulator in use, not only the machine at rest.
- EV product detail under natural or diffused light.
- One coherent portrait set for team credibility.

Photography should use cool or neutral grading, retain natural material color, avoid heavy HDR, and remain visibly documentary rather than stock-like.

## 12. Service hierarchy recommendation

The official guideline lists eight services while the BRD, PRS, AGENTS.md, and current website require four. The difference should be resolved through taxonomy rather than adding eight equal service cards.

### Recommended canonical architecture

| Tier | Canonical website capability | Guideline services mapped underneath |
|---|---|---|
| Primary | Research & Development | Research & Development |
| Primary | Product Design & Prototyping | Product Design, Prototyping |
| Supporting | Consultation, Workshop & Training | Expert Consultation, Innovation Consulting, Workshop & Training |
| Supporting | Brand Products & Environments | Apparel & Merchandise, Office & Signage |

### Why this architecture

- It preserves the four-part website hierarchy required by business documents.
- It prevents eight equal offerings from making Niuva look unfocused.
- It restores Office & Signage, which is present in the guideline but absent from the current public taxonomy.
- It separates product innovation pillars from capability-building and brand-production support.
- It can be used consistently in Website v1.x and Brand Guidelines v1.1.

### Approval impact

The names `Product Design & Prototyping`, `Consultation, Workshop & Training`, and `Brand Products & Environments` change public taxonomy. They require stakeholder approval and a Brand Guidelines v1.1 taxonomy update before implementation.

Until approval, retain the current four website labels and treat the mapping above as an information-architecture proposal only.

## 13. Page-by-page findings

### 13.1 Home

**Current strengths**

- Clear positioning and primary CTA above the fold.
- R&D and Design & Prototyping are visibly dominant.
- Projects and Why Niuva provide business proof.
- Contact invitation appears at the correct end point.

**Current weaknesses**

- Hero uses a generic blue proof panel instead of tangible studio evidence.
- The page contains many repeated rounded panels and cards.
- Process is represented as a card grid rather than a connected transformation.
- Repeated split section headers create a predictable cadence.
- Photography appears too late and does not define the first impression.

**Studio-brand opportunity**

Introduce Niuva through a live relationship between research artifact, technical object, and human process. Move one flagship project or process photograph close to the hero. Let the U-curve connect problem, experiment, and proof.

**Preserve**

- Positioning statement and CTA logic.
- Primary/supporting capability hierarchy.
- Project case-study evidence.
- Why Niuva business rationale.

**Revise**

- Hero composition.
- Capability presentation.
- Process visualization.
- Section-header cadence.
- Amount of card framing.

**Remove**

- Repeated hero proof-panel template.
- Decorative dots without meaning.
- Card container around content that can stand in open layout.

**Risk level**: Medium. The page can change substantially without altering routes or conversion logic.

### 13.2 About

**Current strengths**

- Communicates strategic partnership rather than commodity execution.
- Vision, mission, approach, values, and Bandung Techno Park are present.
- Copy is concise and credible.

**Current weaknesses**

- The page describes people, culture, and collaboration without showing them.
- Values and approach rely heavily on cards.
- Multiple sections use the same split header and label rhythm.
- Company history and team credibility remain abstract.

**Studio-brand opportunity**

Make About the human and cultural page. Use real team/process photography, working principles, and a visual story of how design, engineering, and collaboration meet in the makerspace.

**Preserve**

- Strategic-partner positioning.
- Vision and mission substance.
- Bandung Techno Park context.

**Revise**

- Add people and working-environment evidence.
- Turn values into a manifesto or annotated working sequence.
- Reduce card grids.

**Remove**

- Duplicate generic labels.
- Decorative panels that repeat Home without adding evidence.

**Risk level**: Medium to high because new approved photography and factual team/history content are required.

### 13.3 Capabilities

**Current strengths**

- Correctly prioritizes R&D and prototyping.
- Explains target users, needs, outputs, and specific CTAs.
- Supporting services are visibly secondary.

**Current weaknesses**

- Large detail panels feel like a consulting catalogue.
- Repeated field labels make capabilities read as specification sheets.
- The blue hero panel repeats the same route template.
- Four-step engagement model is another repeated card sequence.

**Studio-brand opportunity**

Present capabilities as working chapters. Each primary capability should combine one problem, one method artifact, one output, and one proof image. Supporting capabilities can remain compact.

**Preserve**

- Primary/supporting hierarchy.
- Specific client needs and outputs.
- Capability-specific CTAs.

**Revise**

- Replace large bordered dossiers with open chapters.
- Use real artifacts and diagrams.
- Clarify the canonical service taxonomy.

**Remove**

- Equal visual grammar across all capability details.
- Unnecessary numbered labels unless they communicate actual sequence.

**Risk level**: Medium. Content remains valid, but taxonomy approval affects labels.

### 13.4 Projects

**Current strengths**

- Strongest business content in the site.
- Each project contains challenge, solution, output, and capability.
- No fake metrics or unsupported claims.
- Alternating media/text rhythm improves scanning.

**Current weaknesses**

- Page hero still uses an abstract proof panel rather than project imagery.
- Project media is smaller than its proof role warrants.
- Whole case studies are enclosed in large bordered cards.
- Image quality and aspect ratios are inconsistent.
- There is little evidence of process, testing, or collaboration.

**Studio-brand opportunity**

Make Projects the visual center of the website. Use large media, artifacts, and a clear case narrative. Let one flagship project own the first viewport. Use sparse dividers instead of wrapping every case in a card.

**Preserve**

- All four factual projects.
- Challenge, solution, output, and capability model.
- Authentic assets, while recognizing their resolution limits.

**Revise**

- Project-first hero.
- Media scale and cropping.
- Open editorial case layout.
- Supporting artifacts and photo documentation.

**Remove**

- Abstract blue hero proof panel.
- `CASE 01` style metadata if it does not help navigation.
- Borders around the complete case-study block.

**Risk level**: High because photography quality is the main dependency.

### 13.5 Contact

**Current strengths**

- Clear invitation and three contact routes.
- Structured form matches PRS requirements.
- WhatsApp is correctly emphasized as the fastest channel.
- Map and location are present.
- Form accessibility and field labeling are strong.

**Current weaknesses**

- The page repeats the same hero proof panel and split-header cadence.
- Contact channel cards contain decorative dots and circles that do not add meaning.
- The three response steps add another card row.

**Studio-brand opportunity**

Make the page feel like the start of a working session. Frame the form as a project brief canvas, show what information helps, and use one visual path from first contact to review.

**Preserve**

- WhatsApp, email, form, address, and map.
- Form fields, privacy note, validation, and CTA labels.

**Revise**

- Simplify contact-channel presentation.
- Make the form the main visual object.
- Convert response steps into a simple sequence.

**Remove**

- Decorative status dots.
- Repeated abstract proof panel.

**Risk level**: Low to medium. Conversion behavior must not regress.

## 14. Shared component findings

### Navbar

- **Already aligned**: approved mark, visible active state, 44px targets, focus states, mobile menu, and primary CTA.
- **Partially aligned**: floating rounded shell is polished but familiar to SaaS sites.
- **Opportunity**: keep structure and accessibility, reduce visual pill layering, and let page content carry more identity.

### Footer

- **Already aligned**: restrained hierarchy, real contact details, simple navigation, no link farm.
- **Opportunity**: introduce one approved reversed lockup or a single U-curve composition if stakeholders want a stronger closing identity.

### PageHero

- **Conflicting**: one template is used for distinct page jobs.
- **Opportunity**: preserve shared spacing and accessibility contracts, but expose page-specific composition variants.

### SectionHeader

- **Conflicting through repetition**: split headline/body structure and pill labels appear too often.
- **Opportunity**: default to a vertical editorial stack. Use split composition only when the second column carries meaningful media or interaction.

### BrandButton

- **Already aligned**: action color, control radius, focus state, minimum height, pressed feedback, and responsive width.
- **Opportunity**: keep unchanged unless the approved concept changes navigation or CTA composition.

### CapabilityPanel and ServiceCard

- **Partially aligned**: excellent information clarity, excessive container weight.
- **Opportunity**: separate content schema from visual card treatment so the same data can support open chapter layouts.

### ProjectCaseStudyCard

- **Partially aligned**: evidence structure is strong; card framing and image scale reduce impact.
- **Opportunity**: evolve into a project feature with dominant media, open text, and sparse dividers.

### ProcessTimeline

- **Conflicting**: a process is shown as independent cards, weakening continuity.
- **Opportunity**: use one connected path, sticky sequence, or horizontal/vertical progression with a static mobile fallback.

### CTASection

- **Partially aligned**: strong contrast and conversion clarity, but nested rounded shells add visual weight.
- **Opportunity**: simplify to one decisive blue field or open terminal action.

### ContactSummary and ContactForm

- **Already aligned**: these are legitimate controls and grouped actions.
- **Opportunity**: remove non-semantic dots and keep form prominence high.

### DecorativeMotif and MarketingSection

- `MarketingSection` is **already aligned** as neutral infrastructure.
- `DecorativeMotif` is **partially aligned** and should become rarer, larger, and more meaningful.

## 15. Concept A: Editorial Product Studio

### Direction

A calm, media-led studio publication focused on product thinking, artifacts, and case narratives. The tone is deliberate and approachable rather than corporate.

### Typography

- Poppins for display and headings.
- Inter for body, labels, and captions.
- Larger contrast between headline and body, fewer small labels.
- Technical metadata appears only alongside real project artifacts.

### Layout character

- Open vertical compositions.
- Large photography and generous margins.
- Asymmetric editorial grids used selectively.
- Sparse dividers instead of repeated cards.
- One dominant message per section.

### Hero treatment

- Wide headline paired with one documentary image or project artifact.
- No repeated generic proof panel.
- Home hero can layer a process photograph with a cropped U-curve.
- Other pages use route-specific media and composition.

### Card treatment

- Cards only for contact channels, selectable objects, and compact supporting services.
- Project text sits outside the media frame.
- Feature panels use 20px radius; standard cards use 16px.

### Photography

- Documentary process, people, and materials.
- Natural or diffused light.
- Cool-neutral grading.
- One decisive image per section rather than multiple weak images.

### Graphic motifs

- U-curve used as crop, path, or transition.
- Circles used rarely as endpoints.
- No decorative dot grids unless tied to a technical artifact.

### Color balance

- 65% Cloud/White/Frost.
- 25% Midnight/Steel typography and structure.
- 10% Brand Blue/Sky Blue/Blue Dark emphasis.

### Motion approach

- Subtle image reveal and one project transition.
- No automatic motion on every section.
- Reduced-motion mode keeps all content visible.

### Project presentation

- Magazine-like project features with large media, challenge, method, output, and artifact captions.
- One project per major visual chapter.

### Advantages

- Strong readability and B2B credibility.
- Lower implementation and performance risk.
- Photography can progressively improve without blocking every page.
- Clearly separates website composition from the PDF guideline layout.

### Risks

- Can feel too quiet if imagery remains weak.
- Can drift into generic editorial minimalism without a strong U-curve behavior.
- Experimental character may remain understated.

### DFII

| Dimension | Score |
|---|---:|
| Aesthetic impact | 4/5 |
| Context fit | 5/5 |
| Feasibility | 5/5 |
| Performance safety | 5/5 |
| Consistency risk | 2/5 |
| **DFII** | **17** |

Using the defined formula, `(4 + 5 + 5 + 5) - 2 = 17`. The original DFII stated range is inconsistent with its formula; relative comparison remains useful.

## 16. Concept B: Experimental Engineering Studio

### Direction

A precise, kinetic studio experience that makes research, iteration, and testing visible. The aesthetic is engineering in motion, not futuristic decoration.

### Typography

- Recommended approved implementation: Poppins + Inter.
- Optional exploratory prototype: Manrope + Space Mono, requiring stakeholder approval.
- Strong but controlled Poppins headlines, with Inter handling dense explanations.
- Technical annotation only when attached to real measurements, stages, or project evidence.

### Layout character

- Asymmetric media and artifact compositions.
- U-curve as a transformation route through sections.
- Selective sticky or scroll-linked project storytelling.
- Open sections punctuated by one or two committed blue fields.
- Deliberate variation between route types.

### Hero treatment

- Home: research artifact, prototype image, and path-based transformation in one composition.
- About: people and makerspace environment.
- Capabilities: method map or working artifact.
- Projects: flagship project media dominates immediately.
- Contact: a brief canvas or structured input path.

### Card treatment

- Fewer cards than the current site.
- True cards use 16px radius.
- Feature/media panels use 20-24px.
- Section bands remain square.
- No nested card shells except where interaction or overlay requires them.

### Photography

- Hands-on work, prototypes in use, collaborative review, testing, and detail shots.
- Crops can be more dynamic than Concept A.
- Project artifacts such as sketches, CAD, wiring, and testing notes become part of the media system.

### Graphic motifs

- U-curve becomes a live process path.
- Solid circles become start, decision, and output nodes.
- Dot and line patterns appear only in one genuine engineering context.
- Motifs can cross section boundaries once per page when they support continuity.

### Color balance

- 55% Cloud/White/Frost.
- 25% Midnight/Steel.
- 20% Brand Blue/Sky Blue/Blue Dark, concentrated in a few strong moments.
- Blue Dark remains the interactive color.

### Motion approach

- Motion intensity target: 5/10.
- One hero entrance, one process transformation, and one project media sequence.
- Use scroll-linked motion only when it explains progression.
- Avoid perpetual loops, hover gimmicks, and decorative parallax.
- Respect `prefers-reduced-motion` with static equivalents.

### Project presentation

- Flagship project as an immersive proof chapter.
- Research question, artifact, prototype, and result appear sequentially.
- Remaining projects use media-led editorial rows.

### Advantages

- Best fit for the desired experimental, technical, and forward-looking studio personality.
- Creates a memorable device from an existing approved brand element.
- Differentiates Niuva from consulting firms and generic SaaS templates.
- Makes the project and process evidence more persuasive.

### Risks

- Requires stronger photography and project artifacts.
- Motion and responsive QA demand more implementation discipline.
- Overuse of technical annotation could become visual costume.
- Too much blue or too many path graphics would reduce clarity.

### DFII

| Dimension | Score |
|---|---:|
| Aesthetic impact | 5/5 |
| Context fit | 5/5 |
| Feasibility | 4/5 |
| Performance safety | 4/5 |
| Consistency risk | 3/5 |
| **DFII** | **15** |

Using the formula, `(5 + 5 + 4 + 4) - 3 = 15`.

## 17. Recommended direction

### Recommendation

Proceed with **Concept B: Experimental Engineering Studio**, constrained by the information clarity and editorial restraint of Concept A.

### Rationale

Niuva already communicates precision and professionalism. Another restrained corporate iteration would improve polish without solving the central personality gap. Concept B adds visible experimentation, collaboration, and forward movement by turning real research and prototyping evidence into the design language. It also uses the approved U-curve more meaningfully rather than inventing an unrelated identity.

### Typography pair

- Primary: Poppins + Inter.
- Fallback for stakeholder testing: Manrope + Space Mono.
- Keep font weights and files limited for performance.

### Color roles

- Brand Blue for identity and large controlled expression.
- Sky Blue for support and transitions.
- Blue Dark for accessible interaction.
- Midnight and Steel for readable content.
- Frost, Cloud, and White for the primary light canvas.

### Radius contract

- Section bands: 0px.
- Controls: 12px.
- True cards: 16px.
- Feature and media panels: 20-24px.
- Full radius: only compact tags, circles, and semantic pills.

### Motif budget

- Maximum two dominant motif placements on Home and Capabilities.
- Maximum one dominant placement on About, Projects, and Contact.
- Circles only as meaningful nodes or focal accents.
- Dot/line patterns only where they express a real technical context.

### Photography direction

- Prioritize documentary process, people, testing, and artifacts.
- Supplement every flagship product image with process evidence.
- Do not upscale the low-resolution Agate assets into hero placements.
- Projects should receive new documentation before the full rollout.

### Recommended Home composition

1. **Studio introduction hero**: concise positioning, primary CTA, one real project/process visual, and a U-curve showing movement from need to prototype.
2. **Flagship proof**: one strong project immediately after the hero, with challenge, method, and output.
3. **Two primary capabilities**: open chapters for R&D and Product Design & Prototyping.
4. **Process path**: a connected research-to-implementation sequence, not six cards.
5. **Supporting capabilities**: compact rows or two restrained cards.
6. **Studio environment**: people, makerspace, and collaboration evidence.
7. **Selected projects**: two additional media-led cases and a Projects link.
8. **Why Niuva**: concise proof statements without card repetition.
9. **Final CTA**: one strong action field with WhatsApp as supporting contact.

### Implementation risk

Overall risk: **Medium-high**.

The risk is not route or business logic. The risk is asset readiness, project evidence, motion quality, and maintaining responsive clarity across more expressive compositions. A Homepage-only prototype is the correct next step.

### Expected design impact

- Higher creative-studio perception without reducing B2B trust.
- Stronger differentiation from consulting and generic SaaS sites.
- Projects become the most memorable and persuasive part of the experience.
- Brand motifs gain meaning and can be used less often.
- The website stops resembling a direct extension of the guideline PDF.

## 18. Decisions requiring approval

### Already approved by existing guidelines and product documents

- Preserve the Niuva logo and official color values.
- Keep R&D and Design/Prototyping as primary capabilities.
- Keep supporting services visually secondary.
- Use clear, confident, collaborative, forward-looking language.
- Use authentic process-oriented photography.
- Keep cards rounded and section bands square.
- Preserve Home, About, Capabilities, Projects, and Contact routes.
- Preserve `Diskusikan Project` as the primary CTA.
- Preserve accessibility and responsive foundations.
- Preserve challenge, solution, and output project evidence.

### Requires stakeholder approval

1. Select Concept B as the Homepage concept direction.
2. Approve Poppins + Inter as the public digital pair or authorize a Manrope + Space Mono experiment.
3. Approve the canonical four-capability taxonomy and revised labels.
4. Approve Office & Signage being restored under a supporting capability.
5. Approve the U-curve transformation-path behavior.
6. Approve the per-page motif budget.
7. Approve the photography production plan and asset budget.
8. Approve a project-first Projects hero.
9. Approve reducing repeated section labels and card containers.
10. Approve moderate scroll-linked motion for public pages.

### Requires Brand Guidelines v1.1 update

- Any font family change away from Poppins + Inter.
- Canonical service taxonomy and website-to-guideline mapping.
- Digital color-role distinction between Brand Blue and Action Blue.
- Website radius contract by semantic surface type.
- U-curve narrative usage and motif budget.
- Digital motion principles and reduced-motion behavior.
- Photography shot categories and project-documentation standards.
- Public website composition rules that distinguish guidelines specimens from live page layouts.
- Policy that the official mark must replace divergent operational logo drawings.

## 19. Proposed implementation phases

### Phase 0.1 - Audit

- Complete this document.
- Review findings with business, brand, design, and engineering stakeholders.

### Phase 0.2 - Approval workshop

- Approve concept direction.
- Approve typography for Homepage testing.
- Approve service taxonomy proposal.
- Approve motif and photography budgets.

### Phase 1 - Homepage concept prototypes

- Build Concept A and Concept B as isolated Homepage variants.
- Use the same content, routes, and CTA behavior for fair comparison.
- Test desktop, tablet, and mobile.
- Test reduced motion and keyboard navigation.
- Do not roll changes into other pages.

### Phase 2 - Asset production

- Capture missing process, people, testing, and workspace photography.
- Collect sketches, CAD, diagrams, and prototype artifacts for flagship cases.
- Replace or supplement low-resolution project assets.

### Phase 3 - Design-system decision

- Update Brand Digital Extension.
- Update Brand Guidelines v1.1 decisions where required.
- Update `DESIGN.md`, typography roles, motif rules, surface rules, and component documentation.

### Phase 4 - Shared public component evolution

- Evolve PageHero into page-specific composition variants.
- Make SectionHeader vertical by default.
- Separate content schema from card treatment in capabilities and projects.
- Replace card-grid process with a connected sequence.
- Preserve Navbar, Footer, BrandButton, form, and route contracts unless approval says otherwise.

### Phase 5 - Route rollout

1. Home
2. Projects
3. Capabilities
4. About
5. Contact

Projects follows Home because it is the strongest proof surface and the largest photography dependency.

### Phase 6 - Regression and production verification

- Responsive QA at narrow mobile, mobile, tablet, laptop, desktop, and wide desktop.
- WCAG AA contrast and keyboard QA.
- Reduced-motion QA.
- Route, CTA, WhatsApp, email, map, and form verification.
- Performance budget and Core Web Vitals checks.
- SEO metadata and structured heading review.
- Visual consistency review against approved concept and Brand Guidelines v1.1.

## 20. Explicit do-not-change list

The following must remain unchanged during the audit and should remain protected during concept work unless separately approved:

- Public route structure: Home, About, Capabilities, Projects, Contact.
- Primary navigation labels and route aliases.
- Niuva official logo geometry, proportions, clear space, and approved colors.
- Official palette hex values.
- Primary business focus on R&D, design engineering, and prototyping.
- Supporting status of consultation, workshop, apparel, and merchandise.
- Primary CTA intent: `Diskusikan Project`.
- WhatsApp number, email address, and Bandung Techno Park location.
- Contact form field names, required state, privacy behavior, and submission contract.
- The four approved project names and factual descriptions.
- Challenge, solution, output, and capability evidence model.
- Existing authentication, dashboard, admin, backend, and operational routes.
- Analytics hooks, form payloads, API contracts, production hardening, and security behavior.
- Focus visibility, semantic labels, alt-text requirements, keyboard behavior, and reduced-motion support.
- Responsive foundations and production build behavior.
- No fake metrics, awards, clients, outcomes, or project claims.
- No unrelated palettes, neon styling, generic SaaS gradients, glassmorphism, stock corporate poses, or card-heavy bento treatment.

## 21. Audit conclusion

Niuva does not need a new identity. It needs a more expressive digital interpretation of the identity it already owns.

The current website is credible and structurally sound, but its page grammar overuses the visual language of guideline specimens: rounded labels, bordered cards, blue proof panels, and repeated motifs. The highest-value shift is to make real projects, people, process, and artifacts carry the brand. Concept B provides that shift while preserving the approved logo, palette, business hierarchy, accessibility, routes, and production foundations.

The next authorized action should be stakeholder review of this audit, followed by two Homepage-only concept prototypes. No global implementation should begin before those decisions are approved.
