---
name: "NIUVA Website"
description: "Corporate engineering brand system for R&D, design prototyping, and 3D printing service workflows."
colors:
  niuva-blue: "#6390BB"
  sky-blue: "#8AAECF"
  blue-dark: "#4A72A0"
  midnight: "#1C2B3A"
  steel: "#3D5266"
  smoke: "#6B7A8D"
  silver: "#E2E8EE"
  frost: "#EBF1F7"
  cloud: "#F8F9FB"
  pure-white: "#FFFFFF"
  success: "#2E8452"
  warning: "#B87B1E"
  error: "#C14444"
typography:
  display:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "0"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.04em"
rounded:
  none: "0px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  panel: "20px"
  outer: "24px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.blue-dark}"
    textColor: "{colors.pure-white}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.midnight}"
    textColor: "{colors.pure-white}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "40px"
  button-outline:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.midnight}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "40px"
  input-default:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.midnight}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
  nav-shell:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.midnight}"
    rounded: "{rounded.lg}"
    height: "64px"
  button-technical:
    backgroundColor: "{colors.blue-dark}"
    textColor: "{colors.pure-white}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
    height: "36px"
  technical-label:
    textColor: "{colors.steel}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
  surface-panel:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.midnight}"
    rounded: "{rounded.none}"
    padding: "0px"
  empty-state:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.steel}"
    typography: "{typography.label}"
    padding: "48px"
---

# Design System: NIUVA Website

## 1. Overview

**Creative North Star: "The Steel-Blue Engineering Dossier"**

NIUVA's visual system should feel like a precise engineering dossier made presentable for business decision makers: clean, technical, credible, and easy to act on. The public site uses a light corporate surface, steel-blue identity color, real project imagery, measured typography, and clear CTA hierarchy to make R&D, design engineering, prototyping, EV development, and 3D printing feel concrete rather than abstract.

The system rejects commodity-vendor styling. It must not feel like a generic marketplace, a static PDF company profile copied into HTML, or a cheap "best and cheapest service" pitch. Public pages may carry stronger brand expression through imagery, large Poppins headlines, and technical annotations; authenticated dashboards stay restrained, data-dense, and task-first.

**Key Characteristics:**
- Light, steel-tinted surfaces with high-contrast ink.
- Blue is decisive but scarce: primary actions, active states, proof points, and technical highlights.
- Poppins carries the brand voice; JetBrains Mono is reserved for technical data, IDs, status metadata, and compact operational labels.
- Public pages show evidence through portfolio/case-study structure; dashboards optimize order completion, verification, and admin scanning.
- Motion is short, stateful, and respectful of reduced-motion preferences.

## 2. Colors

The palette is a desaturated steel-blue system: trustworthy, technical, and calm without becoming navy corporate default.

### Primary
- **Command Blue**: The primary interactive color. Use it for primary CTA backgrounds, active navigation, focused controls, key icons, status emphasis, and links that need business weight.
- **Niuva Blue**: The brand signal. Use it for identity accents, secondary highlights, subtle fills, proof-point numbers, badges, and hover accents.
- **Sky Blue**: The soft highlight. Use it sparingly for hover washes, selected surfaces, and gentle visual relief inside mostly neutral layouts.

### Secondary
- **Status Green**: Operational completion and positive confirmation.
- **Amber Review**: Pending estimates, warnings, review-needed states, and payment or commercial evaluation attention.
- **Controlled Error Red**: Destructive actions, cancellations, upload failures, validation errors, and unrecoverable status states.

### Neutral
- **Midnight Ink**: Primary text, dark bands, major headings, and high-emphasis structural contrast.
- **Steel Body**: Body copy, muted explanatory text, secondary navigation, metadata that still needs readable contrast.
- **Smoke Label**: Low-emphasis supporting labels only; do not use it for long body text on light backgrounds.
- **Silver Line**: Borders, dividers, table lines, field strokes, and low-emphasis separators.
- **Frost Surface**: Secondary panels, hover surfaces, dashboard rows, and form groups.
- **Cloud Page**: Page background. It keeps the site light without defaulting to pure white everywhere.
- **Pure White Surface**: Cards, nav shell, dropdowns, inputs, dialogs, and high-legibility content blocks.

### Named Rules

**The Scarce Blue Rule.** Blue must guide decisions, not flood the screen. If every heading, icon, and card is blue, the hierarchy has failed.

**The Contrast First Rule.** Body text uses Midnight Ink or Steel Body on Cloud, Frost, or Pure White. Smoke Label is for short metadata only.

## 3. Typography

**Display Font:** Poppins with system-ui fallback
**Body Font:** Poppins with system-ui fallback
**Label/Mono Font:** JetBrains Mono with ui-monospace fallback

**Character:** Poppins gives NIUVA a rounded engineering-business voice close to the approved company profile direction. JetBrains Mono adds technical precision, but only where the content is actually technical.

### Hierarchy

- **Display** (800, `clamp(2.5rem, 6vw, 4.5rem)`, 1.05): Hero statements, major page introductions, and final CTA bands. Keep letter spacing at `-0.02em`; never tighten below `-0.04em`.
- **Headline** (800, `clamp(2rem, 4vw, 3.75rem)`, 1.1): Section leads, capability groups, and portfolio feature headings.
- **Title** (700, `1.25rem`, 1.25): Card titles, modal headings, dashboard block titles, and list item names.
- **Body** (400-500, `1rem`, 1.625): Service explanations, case-study copy, form help text, and operational descriptions. Cap long prose at 65ch.
- **Label** (JetBrains Mono 500, `0.75rem`, 0.04em): Order numbers, technical annotations, short status metadata, SLA snippets, compact table headers, and engineering readouts.

### Named Rules

**The Mono Is Data Rule.** JetBrains Mono is allowed for IDs, measurements, order numbers, short labels, and technical readouts. It is forbidden as a lazy costume for all brand copy.

**The No Shouting Rule.** All-caps is reserved for compact labels and technical tags. Body copy, navigation, service explanations, and case-study text stay sentence case.

## 4. Elevation

NIUVA uses tonal layering first and shadow second. Most public and dashboard surfaces are separated by Cloud, Frost, Pure White, Silver borders, and careful spacing. Shadows are small structural cues for sticky navigation, dropdowns, dialogs, and interactive surfaces; they must never become soft decorative "ghost cards."

### Shadow Vocabulary

- **Subtle** (`0 1px 2px rgba(28, 43, 58, 0.06)`): Inputs, small controls, and low-lift elements that need separation from Cloud.
- **Navigation** (`0 8px 24px rgba(36, 50, 65, 0.09)`): Sticky navbar, dropdowns, and compact panels that float above content.
- **Dialog** (`0 18px 48px rgba(36, 50, 65, 0.16)`): Modals, mobile menu panels, and high-priority overlays.
- **Focus Glow** (`0 0 0 3px rgba(102, 146, 188, 0.22)`): Focus-visible or selected state support; do not use as decorative ambient glow.

### Named Rules

**The Flat First Rule.** A surface starts flat. Add elevation only when it clarifies stacking, focus, hover, or overlay behavior.

**The Border Or Shadow Rule.** Avoid heavy border plus wide shadow on the same card. Use a clear Silver border for structure, or a restrained shadow for floating UI.

## 5. Components

### Buttons

Buttons are confident and utilitarian, not pillowy. They should be immediately scannable in public CTAs and dashboard actions.

- **Shape:** Gently curved by default (12px radius). Square overrides are allowed in dense engineering pages and admin tables when the surrounding system is intentionally technical.
- **Primary:** Command Blue background with Pure White text, 40px default height, 44px large height, 16-28px horizontal padding depending on size.
- **Hover / Focus:** Hover deepens to Midnight Ink. Focus uses a 2px ring plus offset on Cloud or Pure White.
- **Secondary / Ghost / Outline:** Secondary uses Frost with Midnight Ink. Outline uses Pure White, Silver border, and hover border shift to Command Blue. Ghost stays transparent until hover.

### Technical Labels

Technical labels are the reusable system voice for order numbers, registry headers, compact admin metadata, and engineering readouts. They use JetBrains Mono, uppercase text, 0.04em letter spacing, and the Steel Body or Command Blue tones. They must stay short; if the text needs a full sentence, use Poppins body copy instead.

### Surface Panels

Surface panels are the shared operational container: Silver border, Pure White surface, optional Frost header, and no decorative shadow. Use them for admin registry blocks, settings panels, material cards, and other task-first groups. They should replace repeated `border border-border bg-surface-1` markup when the surface has reusable structure.

### Empty States

Empty states use the extracted mono registry style: 48px padding, centered text, Steel Body color, uppercase technical wording, and optional solid or dashed frame. Use them for loading, no-data, and configuration-missing states where the system is reporting status rather than telling a marketing story.

### Chips

Chips and badges are compact status cues. They use 8-10px radius, semibold text, a faint tinted background, and a border in the same semantic family. They must not rely on color alone; the label text must carry the state.

### Cards / Containers

Cards are used only for repeated items, portfolio objects, modal-like panels, and operational blocks. Marketing sections should usually be full-width bands or unframed layouts rather than nested cards.

- **Corner Style:** Default card radius is 12-18px depending on surface. Larger brand panels may use 20-24px. Dense operational containers may be square; nav and dropdown surfaces use 16-20px.
- **Background:** Pure White for readable content, Frost for grouped support areas, Cloud for page canvas.
- **Shadow Strategy:** Flat by default with Silver borders. Shadow only for sticky/floating UI.
- **Border:** Silver 1px border for structure. No colored side stripes.
- **Internal Padding:** 16px for compact controls, 24-32px for cards, 96px vertical rhythm for major marketing sections.

### Inputs / Fields

Inputs are white, bordered, and direct. Default height is 40px with 12px radius, 12px horizontal padding, Midnight text, and Steel placeholder/support copy. Focus changes the border to Command Blue and adds a faint ring. Error states use Controlled Error Red plus text, never color alone.

### Navigation

The public navbar is a compact floating shell: Pure White at high opacity, 20px radius, Silver border, and a modest shadow. Active links use Command Blue; inactive links use Steel Body and turn Midnight on hover. Dropdowns and mobile panels use the same card shell. Language and utility controls may use JetBrains Mono only because they behave like compact system metadata.

### Status Stepper

The status stepper is an operational pattern for order progress. Completed steps use Status Green, the active step uses Command Blue, and future steps use Frost plus Steel. Numbers use JetBrains Mono because they are ordered system markers. The connecting line must update with state and remain understandable with the text label below each step.

### Logo

The mark is a technical "N" form with a Command Blue block and low-opacity measurement marks. The wordmark uses Poppins ExtraBold in title case: `Niuva`, not all-caps shouting. Use it in Midnight on light surfaces and Pure White only on dark bands.

## 6. Do's and Don'ts

### Do:

- **Do** lead with R&D, Design & Prototyping, and real portfolio evidence before supporting services.
- **Do** make contact obvious through WhatsApp, email, consultation forms, project discussion CTAs, and clear order actions.
- **Do** use Command Blue for primary actions and active states, not as decorative fill everywhere.
- **Do** treat portfolio entries as mini case studies: challenge, solution, output, and capability proven.
- **Do** keep operational dashboards task-first: order creation, status tracking, estimation, payment-proof handling, fulfillment, and admin scanning.
- **Do** use extracted primitives for repeated operational UI: `SurfacePanel`, `SurfacePanelHeader`, `TechnicalLabel`, `EmptyState`, and `Button variant="technical"`.
- **Do** keep body text at readable contrast; use Midnight Ink or Steel Body on light surfaces.
- **Do** respect reduced motion. Content must remain visible without animation.

### Don't:

- **Don't** make NIUVA look like a generic vendor, a static PDF company profile converted to a web page, or a cheap "best and cheapest service" marketplace pitch.
- **Don't** present all services with equal weight. R&D and Design & Prototyping are the face of the business; Consultant & Workshop and Apparel & Merchandise are supporting capabilities.
- **Don't** use overpromising, overpromotional copy, generic tech-startup claims, weak portfolio lists without business context, e-commerce-first framing, blog-first framing, or visual choices that bury the path to discuss a project.
- **Don't** add decorative brand theatrics to dashboards when they slow order management, payment verification, or admin decision-making.
- **Don't** use gradient text, colored side-stripe borders, decorative grid backgrounds, repeated tiny uppercase section eyebrows, or identical icon-card grids as default scaffolding.
- **Don't** use Smoke Label for paragraph text or placeholder text if contrast drops below 4.5:1.
- **Don't** use JetBrains Mono for long paragraphs, service explanations, or brand claims.

