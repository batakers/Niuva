# Candidate Niuva Design-System Reconstruction Amendment Packet

Status: **OWNER APPROVED — DOCUMENTATION-ONLY CANONICAL PROMOTION PREPARED;
PUBLICATION PENDING**

Prepared: 13 August 2026 (Asia/Jakarta)

Owner approval recorded: 13 August 2026 (Asia/Jakarta)

Canonical promotion authorization recorded: 13 August 2026 (Asia/Jakarta)

Baseline: `origin/main` at
`1db565c8001ab9612db677cfb25e073562760890`

Proposed canonical decision: `DEC-UX-004 — Cross-Surface Design-System
Reconstruction and Migration`

This packet proposes one complete design-system amendment for Niuva. It turns
the accepted visual exploration, Homepage R4 evidence, cross-surface planning,
frontend architecture direction, Auth design evidence, and the 13 August 2026
reconstruction audit into an implementation-ready target contract.

This packet remains promotion provenance rather than canonical authority. The
owner separately authorized the documentation-only promotion map in section
20. Publication through stage, commit, push, and PR remains a later gate, and
implementation remains separately gated. Nothing here changes application
source, dependencies, routes, API, database, providers, migrations, deployment,
production readiness, or go-live.

## 1. Decision recorded

The owner approved `DSR-01` through `DSR-22` as one coherent target
design-system and migration contract, then separately authorized the
documentation-only canonical promotion. Neither approval authorizes
source/dependency changes, implementation, provider, API, database, payment,
deployment, readiness, or go-live.

The documentation-only promotion:

1. creates `DEC-UX-004`;
2. amends conflicting Homepage capability, typography, and motif clauses;
3. updates the Master Specification and canonical registers;
4. replaces the transitional visual guidance in `DESIGN.md` with an approved
   target plus compatibility contract;
5. reconciles `AGENTS.md` and the existing frontend component register; and
6. leaves production implementation and every activation gate unchanged.

The amendment is comprehensive at the system-contract level. It deliberately
does not freeze the exact pixel composition of every page.

## 2. Why one comprehensive amendment is required

The current repository contains a healthy implementation foundation and
several independently useful candidate artifacts, but they do not yet form one
authorized production contract:

- the Master Specification and `DEC-UX-002` still classify two Services as
  primary and two as supporting;
- owner-approved Homepage R4 treats all four Services as primary and visually
  equal;
- `DEC-UX-002.1` and the current transitional `DESIGN.md` still require
  Poppins, Inter, and JetBrains Mono;
- the confirmed candidate direction and R4 use Mona Sans Variable, restrained
  Bona Nova Italic, a Niuva blue tonal family, deep ink, mist, and an FDM
  contour field;
- current source consumes public semantic tokens, HSL compatibility tokens,
  and legacy Niuva aliases simultaneously;
- shared primitives exist, but Retail/customer composition remains thin and
  several Public/Admin files remain oversized page-local compositions; and
- the Auth wireframe and visual candidate clarify Customer/Admin separation,
  but neither activates Register or Google nor replaces current Auth authority.

Coding the broad redesign before resolving these conflicts would either lock
the old visual system deeper into source or create an unauthorized parallel
system.

## 3. Authority, evidence, and precedence

The applicable reading order remains:

1. [Master Specification](../../../NIUVA_MASTER_SPEC.md)
2. [Document Register](../../../context/DOCUMENT_REGISTER.md)
3. [Decision Register](../../../decisions/DECISION_REGISTER.md)
4. applicable decisions and ADRs
5. applicable runbooks
6. current source and tests
7. candidate and prototype evidence

This packet preserves the following approved decisions:

- [`DEC-UX-001`](../../../decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md):
  Unified Homepage, B2B-primary, Retail-secondary but clearly discoverable;
- [`DEC-UX-003`](../../../decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md):
  Public localization, route ownership, B2B intake, and Retail/customer/Admin
  route boundaries;
- [`ADR-004`](../../../decisions/architecture/ADR-004-surface-boundary-topology.md):
  one frontend application, one origin, route-based surface separation;
- [`DEC-OPS-001`](../../../decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md):
  dense-but-calm, role-aware, task-oriented Admin Studio;
- [`DEC-OPS-003`](../../../decisions/experience/DEC-OPS-003-reduced-integrated-cms-mvp.md):
  reduced integrated structured CMS; and
- every approved Retail, B2B, Auth, permission, customer projection, privacy,
  transaction, pricing, payment, fulfilment, and after-sales boundary.

This packet proposes a scoped supersession or amendment only where a later
owner direction and validated evidence conflict with:

- the two-primary/two-supporting Service hierarchy;
- `DEC-UX-002.1` Poppins + Inter Homepage typography;
- `DEC-UX-002.2` two dominant U-curve placements; and
- current transitional implementation values in `DESIGN.md`.

`DEC-UX-002` remains historical design provenance. `DEC-UX-004` would govern
the reconstructed target where the two decisions conflict.

## 4. Proposed decision set

All `DSR-*` identifiers are packet-local until promotion.

| ID | Proposed decision | Consequence |
| --- | --- | --- |
| `DSR-01` | Reconstruct the complete visual and component contract through staged migration; do not perform a big-bang frontend rewrite. | Healthy stack, behavior, lifecycle, and test contracts remain while visual debt is replaced incrementally. |
| `DSR-02` | Research & Development, Consultant & Workshop, Design & Prototyping, and Apparel & Merchandise are four globally primary Services with equal information and visual rank. | The old primary/supporting hierarchy is superseded on Home, Layanan/Services, mega-menu, CMS, and Service navigation. |
| `DSR-03` | Use one Niuva identity with four surface registers: Public, Commerce, Account, and Operations. | Shared identity does not mean one reusable page template. |
| `DSR-04` | Preserve React, React Router, CRA/CRACO, Tailwind, semantic CSS variables, Radix wrappers, CVA, Lucide, Sonner, Axios, Zod, GSAP exceptions, Recharts, and current test foundations. | Design reconstruction is not a framework or UI-kit migration. |
| `DSR-05` | Mona Sans Variable becomes the primary Niuva sans family across all surfaces. Bona Nova Italic is restricted to one bounded expressive interruption on Public surfaces. Genuine code/hash identifiers use a system monospace stack only. | Poppins, Inter, and hosted JetBrains Mono become compatibility-only and then retire. The Auth prototype's Bona accent is not promoted into task UI. |
| `DSR-06` | Production fonts are self-hosted, license-recorded WOFF2 assets with measured fallback behavior; duplicate Google Font delivery is removed after migration. | Typography remains stable without external font CSS or a second loading path. |
| `DSR-07` | Niuva blue remains the primary identity color through a tonal family, supported by ground, mist, deep ink, and independent semantic status colors. | The signature blue is not reused indiscriminately for body text, every border, or every surface. |
| `DSR-08` | Tokens use global values, semantic aliases, surface aliases, and only justified component tokens. CSS custom properties remain the runtime source of truth. | Current HSL and legacy aliases become explicit compatibility mappings, not parallel design systems. |
| `DSR-09` | Public, Commerce, Account, and Operations receive distinct composition, density, typography-use, imagery, and motion rules. | Public editorial composition cannot leak into Admin; operational density cannot leak into customer-facing pages. |
| `DSR-10` | Every surface must pass first-order, second-order, and logo-hidden anti-template checks. | No component-library collage, agency-template rhythm, fake proof, or generic SaaS/dashboard treatment. |
| `DSR-11` | The FDM contour is a bounded identity gesture; the five-stage process is a separate semantic rail that appears once in the dedicated process section. | The contour no longer carries process status or collides with the process rail. A static contour remains under reduced motion. |
| `DSR-12` | Keep the dependency direction `tokens → shared UI → surface/domain compositions → route pages`; lifecycle meaning remains domain-owned. | Shared appearance never creates a global Retail/B2B/Work Order/Portfolio state machine. |
| `DSR-13` | Every adopted component and composition uses one implementable spec format covering anatomy, API, variants, states, behavior, accessibility, responsive rules, content, anti-patterns, owner, and migration status. | Three developers can implement compatible slices without inventing local variants. |
| `DSR-14` | Relevant default, hover, focus, active, disabled, loading, empty, error, conflict, stale, expired, offline, uncertain, recovery, and success states are part of the design contract. | A happy-path screenshot is not completion evidence. |
| `DSR-15` | Motion follows one Niuva grammar: CSS first, GSAP only for bounded Public signature choreography, Canvas/RAF only as progressive enhancement, and no new Framer Motion use. | Multiple source libraries may inform components, but runtime motion remains one coherent system. |
| `DSR-16` | Use 390px as the mobile design baseline; 320px as the resilience floor; and 768, 1024, and 1440px as representative wider review widths. | Responsive work recomposes task priority rather than shrinking desktop layouts. |
| `DSR-17` | External catalogs are reference-first. Local adaptation and runtime dependency require separate provenance, license, accessibility, performance, motion, ownership, and maintenance review. | No external catalog or skill becomes the Niuva design system. |
| `DSR-18` | Adopt hybrid governance: a foundation maintainer owns core tokens/primitives; surface owners own bounded domain compositions; pages retain route/data/permission orchestration. | Shared foundation does not become a bottleneck and surface contributors cannot silently fork it. |
| `DSR-19` | Version, deprecate, and remove contracts through explicit compatibility mappings, consumer evidence, migration notes, and removal gates. | No token/component/dependency is deleted merely because a replacement exists. |
| `DSR-20` | Homepage R4 is the first Public production pilot after the foundation contract is implemented. | R4 is adapted into React/source; its static prototype is not copied as a production application. |
| `DSR-21` | The accepted Auth visual direction is the next Account pilot after Homepage R4, while `/register` and Google remain inactive until their separate security/provider contracts are approved. | Current login, recovery, session, invitation, and role boundaries remain authoritative. |
| `DSR-22` | Foundation merges first; Public, Account/Commerce, and Operations then proceed in three owned worktrees with explicit shared-file rules. | The deadline can be addressed through parallel delivery without three competing design systems. |

## 5. Product and Service hierarchy amendment

The four primary Services are:

1. Research & Development;
2. Consultant & Workshop;
3. Design & Prototyping; and
4. Apparel & Merchandise.

Equal rank means:

- the same navigation tier;
- the same CMS required-field and publication treatment;
- the same Homepage and Layanan/Services information weight;
- the same default service-detail action label: `Lihat layanan` / `View
  service`; and
- no supporting badge, tinted exception panel, smaller placement, or secondary
  heading that demotes one Service.

Equal rank does not require identical service-detail page composition. Each
detail route may use evidence and interaction appropriate to its service.

Apparel & Merchandise remains one primary Service. Its detail experience may
offer two destinations:

- Ready Products for standard published products; and
- Partnership/Inquiry for custom branding, custom development, or quantities
  requiring manual review.

This Service decision does not change the wider journey hierarchy:

- B2B/partnership remains the Homepage's primary narrative; and
- Retail remains secondary but clearly discoverable.

## 6. Visual foundation

### 6.1 Official identity

- Keep the approved lowercase `ni` asset at
  `frontend/public/niuva-mark.svg` byte-for-byte unless a later approved brand
  asset supersedes it.
- Pair the mark with the text `Niuva` in primary navigation until a separately
  approved context demonstrates that the mark alone is sufficiently
  recognizable.
- Do not reconstruct the mark as text, CSS, or an approximation.
- Palette values do not recolor the embedded official mark asset.

### 6.2 Typography roles

| Role | Family | Default use | Prohibited use |
| --- | --- | --- | --- |
| `font-display` | Mona Sans Variable | Public display, major page title, concise section heading | Condensed axis or extremely tight tracking that damages letter recognition |
| `font-body` | Mona Sans Variable | Body, forms, customer copy, operational copy, data explanation | Body copy below 16px on mobile |
| `font-ui` | Mona Sans Variable | Navigation, button, tab, filter, label, table header | Artificial uppercase/tracked eyebrow grammar as default hierarchy |
| `font-expression` | Bona Nova Italic | At most one short expressive interruption within a Public composition | Body, form, Retail configuration, Customer/Auth task copy, Admin, table, badge, status, or technical data |
| `font-technical` | `ui-monospace`, `SFMono-Regular`, `Consolas`, `Liberation Mono`, monospace | Genuine code, hash, exact machine identifier, or technical value that benefits from fixed width | Navigation, ordinary IDs that work with tabular Mona numerals, explanatory copy, decorative telemetry |

Typography implementation rules:

- use normal width for Mona body and UI roles;
- do not set Public display tracking below `-0.03em` without screenshot and
  legibility evidence;
- prefer 400–450 for body, 500–600 for UI, and approximately 550–700 for
  display rather than making every heading extra-bold;
- use `font-variant-numeric: tabular-nums` before selecting monospace merely
  for numeric alignment;
- keep prose near `65–75ch` where the content type allows; and
- translation expansion must not trigger a smaller body-text fallback.

### 6.3 Font delivery

Target assets:

```text
frontend/public/fonts/niuva/MonaSansVF.woff2
frontend/public/fonts/niuva/BonaNova-Italic.woff2
frontend/public/fonts/niuva/OFL-Mona-Sans.txt
frontend/public/fonts/niuva/OFL-Bona-Nova.txt
```

The implementation must:

- use local `@font-face` declarations and `font-display: swap`;
- preload only files required in the first viewport;
- prevent duplicate Google Font links or dynamic runtime font injection;
- test fallback and final-font layout shift at 390 and 1440px; and
- record source, license, hash, supported weights/axes, and owner in the asset
  manifest.

Exact fallback metric overrides such as `size-adjust` are measured during the
foundation implementation; they are not invented in this packet.

### 6.4 Niuva blue tonal family

The target candidate scale is:

| Token | Value | Intended role |
| --- | --- | --- |
| `blue-50` | `#F1F6FA` | Quiet selected or identity-tinted field |
| `blue-100` | `#E3EEF6` | Subtle identity surface |
| `blue-200` | `#C8DCEB` | Light identity line/field |
| `blue-300` | `#A6C3DA` | Inverse supporting identity detail |
| `blue-400` | `#7EA5C5` | Large graphic or selected visual support |
| `blue-500` | `#6390BB` | Candidate signature blue and contour relationship |
| `blue-600` | `#4875A3` | Selected/active support |
| `blue-700` | `#315F8F` | Primary action and link on light surfaces |
| `blue-800` | `#244B73` | Hover/pressed action |
| `blue-900` | `#193753` | Deep identity field |
| `blue-950` | `#0E1B27` | Deep ink and bounded dark evidence surface |

The candidate `blue-500` is a UI relationship derived from accepted visual
evidence; it is not represented as a sampled exact color from the embedded
raster inside the official SVG.

Core neutral roles:

| Semantic role | Value |
| --- | --- |
| `color-surface-canvas` | `#F8FAFC` |
| `color-surface-default` | `#FFFFFF` |
| `color-surface-muted` | `#EDF4F8` |
| `color-text-primary` | `#0E1B27` |
| `color-text-secondary` | `#44586B` |
| `color-text-muted` | `#566B7D` |
| `color-text-disabled` | `#627486` |
| `color-border-control` | `#708BA3` |
| `color-border-decorative` | `#C8D7E4` |

Contrast evidence against `#F8FAFC`:

- primary text: `16.66:1`;
- secondary text: `7.03:1`;
- muted text: `5.29:1`;
- disabled text: `4.60:1`;
- action blue with white text: `6.64:1`;
- action-hover blue with white text: `9.02:1`;
- action/link blue on the canvas: `6.34:1`;
- control border on the canvas: `3.40:1`; and
- signature blue on the canvas: `3.22:1`, so it is not normal body-text color.

Decorative borders may be lower contrast only when they are not the sole
boundary of an interactive control or required state.

### 6.5 Semantic status roles

Status colors remain independent of brand hierarchy and never rely on color
alone.

| Status | Foreground | Background | Candidate contrast |
| --- | --- | --- | ---: |
| Information | `#214C78` | `#E8F2FA` | `7.81:1` |
| Success | `#23643A` | `#E8F5EC` | `6.33:1` |
| Warning | `#6B4E00` | `#FFF3CC` | `6.98:1` |
| Error | `#8F2430` | `#FBEAEC` | `7.34:1` |

Each lifecycle continues to own status labels, ordering, transitions, and safe
customer wording. The table supplies only visual tones.

### 6.6 Spacing, radius, and elevation

- Keep a 4px base spacing unit with a bounded semantic scale.
- Use approximately 16px mobile gutters and 24px or greater wider-screen
  gutters, subject to each composition.
- Controls use one control radius; task surfaces use a bounded surface radius;
  pills are reserved for compact status/filter semantics.
- Public editorial sections may remain edge-free and must not be forced into
  operational panels.
- Default elevation is flat. Use shadow for overlays, navigation, or a real
  layer transition, not every card.
- Exact page gaps and section heights remain owned by the applicable surface
  composition rather than frozen globally.

## 7. Token architecture

The target dependency chain is:

```text
global values
  -> core semantic aliases
  -> surface aliases
  -> justified component tokens
  -> shared UI contracts
  -> surface/domain compositions
  -> route pages
```

### 7.1 Token tiers

| Tier | Example | Rule |
| --- | --- | --- |
| Global | `--nds-blue-700`, `--nds-space-4` | Raw value only; never consumed directly by route pages. |
| Core semantic | `--color-action-primary`, `--space-control-inline` | Describes purpose independent of one component. |
| Surface alias | `--public-canvas`, `--commerce-summary-surface`, `--ops-density-row` | Expresses one surface's usage of core semantics. |
| Component | `--button-primary-background` | Added only when a reusable component genuinely needs a scoped contract. |

CSS custom properties remain the runtime source of truth. Tailwind maps the
semantic vocabulary. A new DTCG/JSON token dependency is not required merely
to satisfy an external validator.

### 7.2 Compatibility map

Current public semantic, HSL/shadcn, and legacy Niuva aliases remain functional
during migration. The foundation task must record for each existing alias:

- target semantic replacement;
- current consumer count;
- status: `active`, `compatibility`, `deprecated`, or `removed`;
- first replacement version/PR;
- removal condition; and
- owner.

No new source may consume a deprecated alias after the foundation contract is
published. Existing consumers migrate by bounded surface, not by an unreviewed
repository-wide replacement.

## 8. Surface contracts

### 8.1 Public register — Persuade / Experience

Public surfaces establish Niuva as an innovation and product-development
partner, prove work through authentic project evidence, and route people to
partnership or Retail.

Use:

- centered and editorial composition where appropriate;
- Mona display/body/UI plus one restrained Bona interruption;
- official project or company assets with factual captions;
- signature FDM contour in bounded identity moments;
- varied section pacing and open canvas; and
- B2B-primary narrative with a clear but secondary Retail route.

Reject:

- split-hero product mockup by default;
- generic agency service-card grids;
- fake clients, metrics, testimonials, CAD, telemetry, or research artifacts;
- repeated uppercase eyebrows and decorative section numbering;
- bento, glass, neon, or generic gradient mesh; and
- copying the same hero/section template across Home, About, Services,
  Projects, and Contact.

### 8.2 Commerce register — Operate

Retail surfaces help a customer discover Ready Products, configure Custom 3D
Print, understand file/material/quantity constraints, receive safe price/ETA,
and continue only when the transaction is authoritative.

Use:

- stable product/configuration identity;
- specification-first hierarchy;
- visible price, stock, file, ETA, reservation, payment, fulfilment, and
  production states where authorized;
- compact factual blue emphasis; and
- fail-closed `quote_required` presentation with retained context.

Do not use Bona Nova, decorative FDM backgrounds behind tasks, marketplace
card soup, fake percentages, unverified ETA, or public campaign composition.

### 8.3 Account register — Operate

Customer/Auth surfaces prioritize identity, trust, owned records, next action,
recovery, and privacy.

Use:

- Mona Sans only in task and state UI;
- task-first mobile composition;
- compact branded identity field that never delays the primary action;
- Customer and staff language kept separate; and
- customer-safe projections with explicit recovery.

Public conversion CTA/footer, project showcase rhythm, and Admin density do not
belong on these surfaces.

### 8.4 Operations register — Operate

Admin/CMS surfaces prioritize queue identity, status, owner/age, next action,
validation, permission, conflict, history, and recovery.

Use:

- dense but readable lists, tables, definition groups, and meaningful panels;
- Mona Sans with tabular numerals;
- minimal functional motion;
- explicit publish/permission/financial consequence; and
- domain-owned lifecycle status components.

Do not use Bona Nova, Public FDM composition, conversion CTA/footer, fake KPI
grids, pseudo-terminal copy, or decorative monospace.

## 9. FDM contour and process grammar

The FDM contour and product-development process are related but not the same
graphic:

- the contour is a calm identity field derived from additive layers;
- the contour may appear at the Homepage hero boundary and terminal closing
  canvas as two bounded placements within one visual grammar;
- the contour never represents live printer telemetry, progress, capacity, or
  a customer Order state;
- the contour remains visually complete when static;
- pointer response is allowed only on fine pointers and must be subtle;
- the five-stage `Need → Research → Experiment → Prototype → Output` rail
  appears once in its process section and ends at Output; and
- mobile presents the process vertically rather than requiring hidden
  horizontal scrolling.

## 10. Component architecture and specification

### 10.1 Layer ownership

| Layer | Owns | Must not own |
| --- | --- | --- |
| Foundation | Token values, semantic mappings, fonts, focus, motion primitives | Route, API, lifecycle, or feature policy |
| `components/ui` | Reusable visual/interaction contracts and accessibility behavior | Network requests, permissions, one domain's state machine |
| Surface composition | Public/Commerce/Account/Operations layout and content conventions | Cross-domain lifecycle authority |
| Domain composition | Retail Order, B2B, Portfolio, Work Order, CMS, Auth, customer-safe state presentation | Unrelated status maps or product decisions |
| Route page | Data, route, permission, mutation, orchestration | Near-duplicate primitive styling or page-local palette |

### 10.2 Component-spec minimum

Each adopted or newly proposed component must document:

1. name, purpose, owner, and adoption status;
2. when to use and when not to use;
3. anatomy and required/optional elements;
4. variants, sizes, and content limits;
5. props/API continuity or breaking change;
6. applicable interaction and data states;
7. mouse, keyboard, touch, focus, and screen-reader behavior;
8. responsive and overflow behavior;
9. token dependencies;
10. localization and long-content behavior;
11. surface/domain restrictions;
12. anti-patterns; and
13. migration/deprecation notes.

This does not require a separate document for every trivial wrapper. Closely
related primitives may share one specification when their ownership and states
remain unambiguous.

### 10.3 Preserved shared contracts

Preserve API continuity unless a later implementation task explicitly proposes
a breaking change:

- Button variants and disabled/loading/focus behavior;
- Input, Textarea, Label, FormField, Select, Switch, and Tabs keyboard behavior;
- Dialog and AlertDialog focus contracts;
- Alert and in-page critical feedback;
- Skeleton and state-aware loading composition;
- SurfacePanel and SurfacePanelHeader for meaningful task grouping;
- TechnicalLabel only for genuine technical metadata;
- EmptyState, ErrorState, and OperationalState recovery contracts;
- Sonner for transient feedback only; and
- lifecycle-owned status badge components.

`Drawer` remains quarantined while it imports undeclared `vaul`. `StatCard`
remains provisional until redesigned. Existing file presence is not adoption.

## 11. Cross-surface state contract

| State | Required visible contract | Prohibited shortcut |
| --- | --- | --- |
| Default/ready | Identity, current task, primary action, relevant context | Ambiguous empty shell |
| Hover/active | Clear affordance without layout shift | Hover lift on every surface |
| Focus | Visible non-color-only ring, not obscured by sticky UI | Browser outline removed without replacement |
| Disabled | Visible reason where the user could reasonably expect an action | Silent permanent disabled button |
| Loading/bootstrap | Skeleton mirrors final hierarchy; status is announced | Spinner-only blank page |
| Empty | Explain why and provide an authorized next action | Decorative illustration with no recovery |
| Validation error | Summary plus field-level relation; values preserved; focus managed | Toast-only or color-only error |
| System error | Distinguish invalid input from dependency failure | False credential, payment, or persistence error |
| Conflict/stale | Preserve work; show changed version and safe resolution | Last-write-wins without explanation |
| Expired | Explain what expired and the safe restart path | Reuse stale reservation, token, price, or session |
| Offline/unavailable | Preserve safe local context where permitted; never claim persistence | Fake success or blind retry loop |
| Uncertain | Reconcile before retrying an irreversible action | Duplicate payment/order/submit CTA |
| Success | State exactly what was completed and what remains | Provider, Order, or Inquiry success before authoritative completion |

Surface/domain specifications add lifecycle-specific states without changing
the shared meaning above.

## 12. Motion grammar

### 12.1 Principles

1. **Purposeful:** explain hierarchy, continuity, feedback, or media state.
2. **Quiet in work:** frequent Retail, Account, and Operations tasks respond
   quickly and do not perform for the user.
3. **One authored signature:** Public may use bounded FDM contour choreography.
4. **Interruptible:** input, navigation, and focus are never blocked by motion.
5. **Accessible:** content and action remain complete without movement.

### 12.2 Candidate tokens

| Token | Value | Use |
| --- | ---: | --- |
| `motion-instant` | `0ms` | Immediate semantic state change |
| `motion-fast` | `120ms` | Hover, press, focus-supporting color/opacity |
| `motion-standard` | `180ms` | Disclosure, compact enter/exit, form feedback |
| `motion-deliberate` | `280ms` | Modal/panel transition or bounded page-state change |
| `motion-ambient` | `12–18s` | FDM contour cycle only |

Candidate easing:

- `ease-standard: cubic-bezier(0.2, 0, 0, 1)`;
- `ease-enter: cubic-bezier(0, 0, 0.2, 1)`;
- `ease-exit: cubic-bezier(0.3, 0, 1, 0.3)`; and
- `linear` only for a genuine indefinite spinner or ambient contour loop.

Do not use `transition: all`. Specify color, opacity, transform, or the exact
property. A staggered task sequence must remain below 500ms total; Public
editorial evidence may receive a separately reviewed exception.

Under `prefers-reduced-motion: reduce`:

- remove scroll-linked movement, parallax, path morph, scale, rotation, and
  pointer response;
- keep the static contour;
- preserve essential loading/progress indication;
- allow short opacity/color feedback when it does not create movement; and
- do not globally erase all feedback with one indiscriminate `0.01ms` rule.

CSS is the default runtime mechanism. GSAP remains a scoped Public exception.
Canvas/RAF remains progressive enhancement. Framer Motion receives no new
consumer and is reviewed for retirement only after consumer verification.

## 13. Responsive, accessibility, and performance floor

### 13.1 Viewports

- `390px`: canonical mobile design review;
- `320px`: resilience floor, not pixel-perfect target;
- `768px`: tablet/intermediate recomposition;
- `1024px`: compact desktop/laptop; and
- `1440px`: representative wide desktop.

At 320px, critical content and actions must remain reachable without
unintended horizontal scrolling.

### 13.2 Measurable accessibility floor

- normal text contrast at least `4.5:1`;
- large text at least `3:1`;
- meaningful control/focus boundary at least `3:1` against adjacent colors;
- mobile body text at least `16px`;
- general mobile target at least `44 × 44px`;
- visible focus and managed focus after rendered errors/success/conflicts;
- semantic landmarks, heading order, labels, names, roles, and values;
- 200% zoom and reflow without lost task/action;
- status never communicated through color alone; and
- English and Indonesian long-content checks.

These are implementation floors, not a formal conformance claim. Formal WCAG
conformance requires a separately owned audit.

### 13.3 Performance floor

- route-level lazy loading remains;
- fonts are subset/preloaded only where justified;
- no new visual dependency without measured bundle and runtime need;
- ambient effects pause when offscreen or the document is hidden;
- content is visible before JavaScript enhancement where the surface permits;
- low-powered-device behavior is reviewed for the FDM field; and
- one batched final browser matrix and one detector run are used per bounded
  implementation slice.

Exact bundle and Web Vitals budgets remain a separately verified implementation
contract; this packet does not invent production measurements.

## 14. External component and skill intake

Every external reference is classified as:

1. **reference:** study only, no source or runtime dependency;
2. **local adaptation:** reviewed source/technique becomes a Niuva-owned
   component; or
3. **runtime dependency:** the build directly depends on the package.

Local adaptation or runtime adoption requires:

- source URL, revision, license, and copied-file list;
- concrete Niuva use case and rejected native/existing alternative;
- final ownership layer and lifecycle;
- token remapping and visual adaptation;
- accessibility and input-method evidence;
- reduced-motion and performance evidence;
- maintenance/removal owner; and
- proof that it passes the three anti-template checks.

React Bits, Motion Primitives, Kokonut UI, Animate UI, Magic UI, Baoyu-derived
techniques, or another catalog may supply a technique. None supplies Niuva's
identity, content, product truth, state machine, or complete design system.

3D/WebGL is used only where a real 3D model adds customer or operator value. It
is not required for brand decoration and is not authorized by this amendment.

## 15. Governance, versioning, and contribution

### 15.1 Hybrid ownership

| Role | Owns |
| --- | --- |
| Foundation maintainer/Driver | Core tokens, font delivery, Tailwind mapping, shared UI API, compatibility map, design-system changelog |
| Public owner | Public compositions, authentic assets, editorial and FDM rules |
| Commerce/Account owner | Retail/customer/Auth compositions and customer-safe task states |
| Operations owner | Admin/CMS compositions, density, conflict, permission, audit presentation |
| Product/authority reviewer | Product hierarchy, lifecycle, route, policy, provider, and activation boundaries |

One Driver owns any shared foundation file in one task/worktree. Surface teams
may propose foundation changes but do not create local replacements while the
proposal is reviewed.

### 15.2 Contribution lifecycle

1. request with a concrete repeated use case;
2. triage against existing token/component/composition;
3. write or amend the bounded spec;
4. design, accessibility, lifecycle, and feasibility review;
5. build and test in one owned worktree;
6. publish with migration/changelog evidence; and
7. measure consumers and remove deprecated contracts only at their gate.

### 15.3 Version communication

Use semantic release meaning for the design-system contract even if the code
is not distributed as an npm package:

- patch: defect or documentation correction with no API/semantic change;
- minor: compatible token, component, variant, or surface contract; and
- major: renamed/removed token, changed component API, or changed behavior.

The promoted target begins as `NDS 2.0`. Compatibility aliases identify the
transition from the current system; the label does not claim production
completion.

## 16. Migration, compatibility, and deprecation

### 16.1 Preserve during migration

- current route, API, permission, i18n key, data projection, test-id, and
  lifecycle contracts unless a separately approved task changes them;
- current shared component APIs until migration notes say otherwise;
- current semantic alias names through the compatibility window; and
- unrelated user work and historical records.

### 16.2 Migration order

1. foundation tokens, fonts, focus, primitives, state contracts, and tests;
2. Homepage R4 Public pilot;
3. Auth Account pilot;
4. remaining Public routes;
5. Retail and Customer compositions;
6. Admin/CMS decomposition; and
7. cleanup of aliases, prototypes, provisional components, and unused
   dependencies after consumer evidence reaches zero.

The Homepage and Auth pilots may overlap after the foundation PR merges if
their file ownership remains distinct.

### 16.3 Deprecation rule

A deprecated contract:

- remains functional during its recorded compatibility window;
- accepts no new consumer;
- has a named replacement and migration example;
- is listed in the existing component register/changelog; and
- is removed only when current `origin/main` has zero consumers, targeted and
  aggregate checks pass, and a separate removal PR is approved.

No destructive bulk replacement, unreviewed codemod, or dependency removal is
authorized by documentation promotion.

## 17. Pilot 1 — Homepage R4 production adaptation

[Homepage R4](../../prototypes/2026-08-12-niuva-homepage-r4-prototype/README.md)
is the accepted visual baseline for the first Public source slice after the
foundation implementation is approved.

The production pilot must preserve:

- centered, project-neutral hero;
- official mark plus `Niuva` text;
- Mona Sans and one bounded Bona Nova interruption;
- calm animated FDM contour with static reduced-motion equivalent;
- separate five-stage process rail ending at Output;
- three macro chapters: Memahami, Membentuk, Membuktikan;
- authentic project evidence only in the Project evidence section;
- four Services with equal rank and one shared service-detail action;
- compact Retail bridge with Custom 3D Print and Ready Products plus the
  separate Rental/Self Service row;
- Homepage Contact summary with the full form owned by Contact;
- conversational editorial FAQ, not literal chat bubbles;
- terminal closing canvas plus adaptive minimal footer; and
- a reduced horizontal-rule budget.

The source task must adapt these decisions to existing React, CMS, routing,
i18n, accessibility, and loading/error behavior. It must not copy the prototype
server, synthetic controls, route notices, or static data into production.

Pilot acceptance requires:

- Indonesian and English content/route behavior within approved route scope;
- 320/390/768/1024/1440 browser evidence;
- keyboard, focus, 200% zoom, reduced-motion, contrast, and overflow checks;
- authentic asset/provenance verification;
- first-order, second-order, and logo-hidden critique;
- current Homepage/content contracts plus proportional new tests;
- one Impeccable detector run; and
- no P0/P1 visual or lifecycle finding.

This pilot does not by itself authorize every Public route redesign.

## 18. Pilot 2 — Auth production adaptation

The next Account pilot uses the owner-accepted Auth visual direction, but its
production scope is bounded by current Auth authority.

Included active families:

- Customer Login;
- Admin Login;
- Customer/staff-aware recovery;
- Staff Invitation; and
- existing session/loading/error/expired/permission/recovery states.

Target composition:

- desktop may use split form plus bounded visual/trust panel;
- mobile places the form task and primary action before the visual context;
- Customer and Admin remain separate trust surfaces;
- form/status typography uses Mona Sans only;
- Admin has no Google or public registration action;
- staff invitation never permits role selection; and
- public conversion CTA/footer does not appear inside Account/Admin work.

Explicitly inactive until separate authorization:

- `/register` account creation;
- Google Identity Services or OAuth/OIDC;
- client IDs, redirect URIs, provider branding, callback routes, identity
  linking, and provider-subject storage;
- automatic email-match linking;
- any new session, role, or permission behavior; and
- any automatic Order, reservation, upload, checkout, or payment continuation.

If Google is later activated, it remains Customer-only, never grants an
internal role, never auto-links solely by email equality, and must end in the
approved same-origin Customer session boundary after Niuva consent/profile
requirements are satisfied.

Pilot acceptance requires the same responsive/accessibility/anti-template
floor as Homepage plus generic failure, rate-limited, offline, expired,
permission, invitation, and safe-return verification.

## 19. Three-developer delivery model

After the foundation PR merges:

| Lane | Suggested owner | First bounded slice | File boundary |
| --- | --- | --- | --- |
| A — Public | Developer 1 | Homepage R4 production, then Public routes | Public pages/components/assets only; no Auth/Retail/Admin domain changes |
| B — Account/Commerce | Developer 2 | Auth production, then Retail/customer compositions | Auth/Retail/customer pages and bounded domain components; no Admin page edit |
| C — Operations | Developer 3 | Shared state harness, then Admin decomposition | Admin/CMS pages and domain components; no core-token change without foundation review |

Shared `index.css`, Tailwind mapping, fonts, `components/ui`, root navigation,
and i18n infrastructure have one Driver at a time. A lane needing a shared
change submits one small foundation proposal/PR instead of copying the contract
locally.

Parallel delivery does not broaden product, provider, security, route, or
activation authority.

## 20. Authorized canonical promotion map

The owner authorized this documentation-only promotion on 13 August 2026.
Local preparation does not publish the result to `origin/main`.

| Target | Proposed treatment |
| --- | --- |
| New `docs/decisions/experience/DEC-UX-004-cross-surface-design-system-reconstruction.md` | Record `DSR-01` through `DSR-22`, scope, supersession, and open consequences. |
| `docs/NIUVA_MASTER_SPEC.md` | Replace the two-primary/two-supporting Service hierarchy; add the target visual foundation, surface registers, migration boundary, and pilot order. |
| `PRODUCT.md` | Reconcile the product orientation with four equally primary Services while retaining the B2B-primary and Retail-secondary journey hierarchy; do not duplicate design tokens. |
| `docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md` | Mark Poppins/Inter and two-U-curve-placement clauses as superseded where `DEC-UX-004` conflicts; retain historical provenance and compatible editorial/evidence principles. |
| `DESIGN.md` | Replace transitional values with `NDS 2.0` target plus compatibility, surface, component/state, motion, accessibility, and migration contracts. |
| `AGENTS.md` | Remove hard-coded Poppins/Inter/JetBrains preservation after promotion; point frontend agents to the active `DESIGN.md` and `DEC-UX-004` target while keeping Impeccable primary. |
| `docs/context/DOCUMENT_REGISTER.md` | Register `DEC-UX-004`, amended `DESIGN.md`, and this approval/promotion record with exact authority limits. |
| `docs/decisions/DECISION_REGISTER.md` | Add `DEC-UX-004`; mark `DEC-UX-002.1` superseded and `DEC-UX-002.2` amended/superseded in conflicting scope. |
| Existing frontend component register | Reconcile baseline SHA/counts; add NDS 2.0 ownership, specification, compatibility, deprecation, and adoption statuses. |
| FSA/cross-surface/Stage B/R4 artifacts | Retain as candidate/prototype evidence; do not rewrite history or imply that every candidate clause was promoted. |

Historical brand files remain historical evidence. They are not destructively
edited; the newer decision supersedes their conflicting hierarchy or visual
clauses through normal authority precedence.

## 21. Explicit non-authorization

Approval or publication of this packet does not authorize:

- production source changes;
- dependency install, upgrade, or removal;
- framework/build migration;
- route activation, redirect deployment, or SEO rollout;
- `/register` activation or Google/provider setup;
- API/schema/database/index/migration changes;
- CMS field implementation or content migration;
- file upload/storage activation;
- price, ETA, inventory, reservation, checkout, payment, refund, shipment, or
  production activation;
- role, permission, session, recovery, identity-linking, or customer-projection
  changes;
- secret, environment, Google console, or provider configuration;
- analytics, monitoring, deployment, staging, production readiness, or
  go-live;
- deleting current aliases, fonts, components, prototypes, dependencies, or
  worktrees; or
- claiming that prototype validation proves production behavior.

## 22. Owner-approval record

The owner explicitly confirmed:

- [x] `DSR-01` staged reconstruction instead of big-bang rewrite;
- [x] `DSR-02` four equal primary Services globally;
- [x] `DSR-03` one identity with four surface registers;
- [x] `DSR-04` preservation of the current frontend stack;
- [x] `DSR-05` Mona Sans across surfaces, Bona Nova Public-only, system
      monospace only for genuine technical data;
- [x] `DSR-06` self-hosted font delivery;
- [x] `DSR-07` proposed Niuva blue tonal family and role restrictions;
- [x] `DSR-08` token tiers and compatibility mapping;
- [x] `DSR-09` surface-specific composition boundaries;
- [x] `DSR-10` three anti-template gates;
- [x] `DSR-11` separation of FDM contour and process rail;
- [x] `DSR-12` component dependency and lifecycle ownership;
- [x] `DSR-13` component-spec minimum;
- [x] `DSR-14` complete relevant state contract;
- [x] `DSR-15` CSS-first motion with bounded GSAP and no new Framer use;
- [x] `DSR-16` responsive review widths and resilience floor;
- [x] `DSR-17` external component intake policy;
- [x] `DSR-18` hybrid governance;
- [x] `DSR-19` compatibility/deprecation/removal gates;
- [x] `DSR-20` Homepage R4 as first Public production pilot;
- [x] `DSR-21` Auth as next Account pilot with Register/Google inactive;
- [x] `DSR-22` foundation-first, three-lane parallel delivery; and
- [x] explicit acknowledgement of every non-authorization in section 21.

## 23. Evidence and validation basis

The packet was prepared from:

- current canonical documents and source at the named baseline;
- [Frontend Stack and Component Architecture candidate](2026-08-11-niuva-frontend-stack-component-architecture-decision-packet.md),
  including owner-accepted `FSA-01` through `FSA-12`;
- [Cross-Surface UX/UI Reconciliation candidate](2026-08-11-niuva-cross-surface-ux-ui-reconciliation-packet.md),
  including owner-accepted `CSR-01` through `CSR-08`;
- [Confirmed Candidate Design Brief](2026-08-11-niuva-stage-b-visual-world-exploration/CONFIRMED_CANDIDATE_DESIGN_BRIEF.md);
- [Homepage R4 README](../../prototypes/2026-08-12-niuva-homepage-r4-prototype/README.md),
  [Visual QA](../../prototypes/2026-08-12-niuva-homepage-r4-prototype/VISUAL_QA.md),
  and its published browser evidence;
- owner-reviewed local Auth wireframe and visually frozen Auth prototype
  evidence, whose decisions are restated here instead of relying on a
  machine-local link;
- current source token, dependency, component-consumer, route, and file-size
  evidence; and
- the read-only Design-System Reconstruction Audit completed on 13 August 2026.

Mechanical audit evidence included:

- 8 focused Jest suites and 38 focused tests passing;
- four Impeccable detector warnings in current source: two provisional
  StatCard side-tabs, one Portfolio Admin side-tab, and one dynamic Brand Lab
  font load;
- current contrast failures for small muted text and meaningful control
  boundary, corrected in the target candidate pairings above;
- installed but unused Framer Motion;
- three parallel token vocabularies requiring compatibility ownership; and
- oversized Public/Admin compositions requiring bounded decomposition.

The aggregate CRA test command and fresh production build did not complete in
the temporary audit snapshot. This packet therefore makes no fresh aggregate
build, bundle, browser, performance, production-readiness, or go-live claim.

## 24. Stopping rule and next gate

This packet stops after local preparation and validation of the authorized
documentation-only canonical promotion. Stage, commit, push, PR, and merge have
not been authorized by the promotion approval and remain a separate gate.

Only after the documentation promotion is published and merged may a
separately authorized foundation implementation task be prepared.

No additional broad visual-world exploration or broad prototype is required
before owner review. Any later design change follows versioned amendment rather
than reopening the entire reconstruction indefinitely.
