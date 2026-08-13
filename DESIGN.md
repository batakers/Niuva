# Niuva Design System — NDS 2.0 Target and Migration Guardrail

Status: **Active Guardrail — Approved Target; Implementation Separately Gated**

Version: `NDS 2.0`

Effective decision: `DEC-UX-004`, approved documentation-only on 13 August
2026

This document defines Niuva's durable cross-surface digital design target and
its compatibility rules. It is subordinate to the Master Specification,
approved requirements, decisions and ADRs, runbooks, and current source/test
evidence. It does not authorize source, dependency, route, provider, migration,
deployment, readiness, or go-live work.

## 1. Authority and Scope

Read this guardrail after:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`; and
4. the decision or ADR applicable to the task.

`DEC-UX-004` governs this reconstruction target. `DEC-UX-001` retains the
Unified Homepage with a B2B-primary narrative and clearly discoverable Retail
path. `DEC-UX-003` retains route, locale, and activation boundaries.
`DEC-OPS-001` and `DEC-OPS-003` retain Admin Studio and CMS authority. Product,
Auth, access, privacy, pricing, payment, fulfilment, and lifecycle decisions
remain unchanged.

NDS 2.0 is comprehensive at the system-contract level without freezing every
page pixel. A page may evolve inside these contracts. A change to identity,
font roles, semantic color roles, surface grammar, component API, or shared
state behavior requires the applicable versioned amendment.

## 2. Product and Visual Thesis

Niuva is one website and one operational platform with separate Retail and
Business/B2B journeys. The digital identity must remain recognizable while
each surface serves a different job:

- Public persuades and proves;
- Commerce helps customers configure and transact safely;
- Account helps people identify themselves, recover, and act on owned records;
  and
- Operations helps staff process queues and resolve state accurately.

The official lowercase `ni` mark, Niuva blue family, additive-layer/FDM
gesture, authentic project evidence, and disciplined interaction behavior form
the shared identity. One identity does not mean one transferable page template.

### Four equally primary Services

The four primary Services are:

1. Research & Development;
2. Consultant & Workshop;
3. Design & Prototyping; and
4. Apparel & Merchandise.

They receive equal navigation tier, CMS publication treatment, Homepage and
Layanan/Services information weight, and default detail action. Do not demote
one through a supporting badge, smaller placement, exceptional tint, or
secondary heading.

Equal Service rank does not make Retail equal to B2B in the Homepage narrative.
B2B/partnership remains primary; Retail remains secondary but clear.

## 3. Anti-Template Quality Gates

Every visible slice must pass all three checks:

1. **First-order:** no unjustified gradient, glass, bento, card-grid, neon,
   fake dashboard, decorative telemetry, or catalog-template shortcut.
2. **Second-order:** no repeated agency rhythm, tiny uppercase eyebrow system,
   decorative numbering, fake proof, one-card-per-field layout, or component
   library collage.
3. **Logo-hidden:** without the mark, the surface must still feel like Niuva
   through truthful content, evidence grammar, density, color roles, and
   interaction behavior.

Do not invent project media, process artifacts, customers, prices, ETA,
metrics, awards, certifications, testimonials, telemetry, or outcomes.

## 4. Official Identity

- Use `frontend/public/niuva-mark.svg` byte-for-byte unless a later approved
  asset supersedes it.
- Pair the mark with the text `Niuva` in primary navigation until a separately
  approved context demonstrates sufficient mark recognition.
- Do not reconstruct the mark as text, CSS, or an approximate SVG.
- Palette tokens do not recolor the embedded official asset.
- Historical brand sources remain provenance; `DEC-UX-004` governs conflicting
  digital typography, motif, and hierarchy clauses.

## 5. Typography

### 5.1 Roles

<!-- markdownlint-disable MD013 -->

| Role | Family | Use | Do not use for |
| --- | --- | --- | --- |
| `font-display` | Mona Sans Variable | Public display, major page title, concise section heading | Condensed/tightly tracked settings that damage letter recognition |
| `font-body` | Mona Sans Variable | Body, forms, customer copy, operational copy, data explanation | Mobile body copy below 16px |
| `font-ui` | Mona Sans Variable | Navigation, button, tab, filter, label, table heading | Artificial uppercase/tracked eyebrow grammar as default hierarchy |
| `font-expression` | Bona Nova Italic | At most one short expressive interruption in a Public composition | Body, form, Retail task, Customer/Auth, Admin, table, badge, status, or technical data |
| `font-technical` | `ui-monospace`, `SFMono-Regular`, `Consolas`, `Liberation Mono`, monospace | Genuine code, hash, or exact machine value that benefits from fixed width | Navigation, ordinary labels, explanatory copy, fake telemetry, or decorative engineering voice |

<!-- markdownlint-enable MD013 -->

Use normal width for Mona body and UI. Do not set Public display tracking below
`-0.03em` without screenshot and legibility evidence. Prefer approximately
400–450 for body, 500–600 for UI, and 550–700 for display rather than making
every heading extra-bold. Use tabular Mona numerals before introducing
monospace solely for numeric alignment. Keep prose near 65–75 characters where
the content type permits.

### 5.2 Font delivery target

```text
frontend/public/fonts/niuva/MonaSansVF.woff2
frontend/public/fonts/niuva/BonaNova-Italic.woff2
frontend/public/fonts/niuva/OFL-Mona-Sans.txt
frontend/public/fonts/niuva/OFL-Bona-Nova.txt
```

The separately authorized foundation implementation must:

- use local `@font-face` declarations with `font-display: swap`;
- preload only first-viewport requirements;
- remove duplicate Google Font delivery only after consumer migration;
- measure fallback and final-font layout shift at 390px and 1440px; and
- record source, license, hash, supported axes, and owner.

Exact `size-adjust` or fallback metric overrides require measurement. Do not
invent them in documentation.

Poppins, Inter, and hosted JetBrains Mono are compatibility-only after this
decision. They remain functional for existing consumers until migrated, but no
new source may adopt them as the NDS 2.0 target.

## 6. Color and Semantic Pairings

### 6.1 Niuva blue tonal family

<!-- markdownlint-disable MD013 -->

| Token | Value | Intended role |
| --- | --- | --- |
| `--nds-blue-50` | `#F1F6FA` | Quiet selected or identity-tinted field |
| `--nds-blue-100` | `#E3EEF6` | Subtle identity surface |
| `--nds-blue-200` | `#C8DCEB` | Light identity line/field |
| `--nds-blue-300` | `#A6C3DA` | Inverse supporting identity detail |
| `--nds-blue-400` | `#7EA5C5` | Large graphic or selected visual support |
| `--nds-blue-500` | `#6390BB` | Signature blue and contour relationship |
| `--nds-blue-600` | `#4875A3` | Selected/active support |
| `--nds-blue-700` | `#315F8F` | Primary action and link on light surfaces |
| `--nds-blue-800` | `#244B73` | Hover/pressed action |
| `--nds-blue-900` | `#193753` | Deep identity field |
| `--nds-blue-950` | `#0E1B27` | Deep ink and bounded dark evidence surface |

<!-- markdownlint-enable MD013 -->

`--nds-blue-500` is the accepted digital relationship to the identity, not a
claim that an embedded raster in the official SVG was sampled exactly.

### 6.2 Core semantic roles

| Role | Value |
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

Measured candidate contrast against `#F8FAFC`:

- primary text `16.66:1`;
- secondary text `7.03:1`;
- muted text `5.29:1`;
- disabled text `4.60:1`;
- `#315F8F` with white `6.64:1` and on the canvas `6.34:1`;
- `#244B73` with white `9.02:1`;
- control border `#708BA3` on the canvas `3.40:1`; and
- signature `#6390BB` on the canvas `3.22:1`, so it is not normal body text.

Decorative lines may be lower contrast only when they are not the sole boundary
or state cue of an interactive control.

### 6.3 Semantic status roles

Status color is independent of brand hierarchy and never acts alone.

| Status | Foreground | Background | Candidate contrast |
| --- | --- | --- | ---: |
| Information | `#214C78` | `#E8F2FA` | `7.81:1` |
| Success | `#23643A` | `#E8F5EC` | `6.33:1` |
| Warning | `#6B4E00` | `#FFF3CC` | `6.98:1` |
| Error | `#8F2430` | `#FBEAEC` | `7.34:1` |

Each domain continues to own status names, order, transitions, permissions,
and customer-safe wording.

## 7. Spacing, Shape, and Elevation

- Use a 4px base unit with a bounded semantic spacing scale.
- Use approximately 16px mobile gutters and at least 24px wider-screen
  gutters, subject to the surface composition.
- Controls use the control radius; task surfaces use a bounded surface radius;
  pills are reserved for compact status or filter semantics.
- Public editorial sections may remain edge-free and are not forced into
  operational panels.
- Default elevation is flat. Shadow communicates an overlay, navigation layer,
  or real layer transition, not generic card decoration.
- Page gaps and section heights remain surface-owned rather than globally
  frozen.

## 8. Token Architecture

The runtime dependency chain is:

```text
global values
  -> core semantic aliases
  -> surface aliases
  -> justified component tokens
  -> shared UI contracts
  -> surface/domain compositions
  -> route pages
```

| Tier | Example | Rule |
| --- | --- | --- |
| Global | `--nds-blue-700`, `--nds-space-4` | Raw values; route pages do not consume them directly. |
| Core semantic | `--color-action-primary`, `--space-control-inline` | Purpose independent of a component. |
| Surface alias | `--public-canvas`, `--commerce-summary-surface`, `--ops-density-row` | One surface's use of core semantics. |
| Component | `--button-primary-background` | Added only when a reusable component needs a scoped contract. |

CSS custom properties are the runtime source of truth. Tailwind maps the
semantic vocabulary. Do not add DTCG/JSON or another token runtime merely to
satisfy an external validator.

Current public semantic, HSL/shadcn, and legacy Niuva aliases remain
compatibility contracts during migration. For each alias, the component
register must record its target, consumer count, status, first replacement,
removal condition, and owner. Deprecated aliases accept no new consumers.

## 9. Surface Registers

### 9.1 Public — Persuade / Experience

Public establishes Niuva as an innovation and product-development partner,
proves work through authentic evidence, and routes people to partnership or
Retail.

Use centered/editorial composition where appropriate, Mona roles, at most one
Bona interruption, official evidence with factual captions, bounded FDM
identity gestures, varied pacing, and an open canvas.

Reject default split-hero product mockups, generic service-card grids, fake
proof, repeated eyebrow/index systems, bento, glass, neon, generic gradient
mesh, and one duplicated template for Home, About, Services, Projects, and
Contact.

### 9.2 Commerce — Operate

Commerce prioritizes product/configuration identity, specification, file,
material, quantity, stock, price, ETA, reservation, payment, fulfilment, and
production state where authorized. It presents `quote_required` honestly and
retains context without creating an Order, reservation, payment attempt, or
authoritative checkout total prematurely.

Do not use Bona Nova, decorative FDM task backgrounds, marketplace card soup,
fake percentages, unverified ETA, or Public campaign composition.

### 9.3 Account — Operate

Customer/Auth prioritizes identity, trust, owned records, next action,
recovery, and privacy. Use Mona Sans in task/state UI, put the form and primary
action first on mobile, and keep Customer and staff language separate.

Public conversion CTA/footer, project-showcase rhythm, decorative contour, and
Admin density do not belong on Account surfaces.

### 9.4 Operations — Operate

Admin/CMS prioritizes queue identity, status, owner, age, next action,
validation, permission, conflict, history, and recovery. Use dense but readable
lists, tables, definition groups, meaningful panels, tabular Mona numerals, and
minimal functional motion.

Do not use Bona Nova, Public contour composition, conversion CTA/footer, fake
KPI grids, pseudo-terminal copy, or decorative monospace.

## 10. FDM Contour and Process Grammar

- The contour is a calm identity field derived from additive layers.
- It may appear at the Homepage hero boundary and terminal closing canvas as
  two bounded placements in one grammar.
- It never represents live printer telemetry, progress, capacity, or Order
  state.
- It remains visually complete when static.
- Pointer response is allowed only for fine pointers and must remain subtle.
- The `Need → Research → Experiment → Prototype → Output` rail appears once in
  the process section and ends at Output.
- Mobile presents the process vertically rather than requiring hidden
  horizontal scrolling.

## 11. Component Architecture

| Layer | Owns | Must not own |
| --- | --- | --- |
| Foundation | Tokens, semantic mappings, fonts, focus, motion primitives | Route, API, lifecycle, or feature policy |
| `components/ui` | Reusable visual/interaction contracts and accessibility | Network requests, permissions, or one domain state machine |
| Surface composition | Public/Commerce/Account/Operations layout and content conventions | Cross-domain lifecycle authority |
| Domain composition | Retail Order, B2B, Portfolio, Work Order, CMS, Auth, customer-safe states | Unrelated status maps or product decisions |
| Route page | Data, route, permission, mutation, orchestration | Near-duplicate primitive styling or page-local palette |

### 11.1 Component specification minimum

Every adopted or proposed component records:

1. name, purpose, owner, and adoption status;
2. when to use and not use;
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

Closely related primitives may share a specification when ownership and states
remain unambiguous.

### 11.2 Preserved contracts

Preserve current APIs unless a separately approved implementation task proposes
a breaking change:

- Button variants and disabled/loading/focus behavior;
- Input, Textarea, Label, FormField, Select, Switch, and Tabs behavior;
- Dialog and AlertDialog focus contracts;
- Alert and in-page critical feedback;
- Skeleton and hierarchy-preserving loading composition;
- SurfacePanel and SurfacePanelHeader for meaningful task grouping;
- TechnicalLabel only for genuine technical metadata;
- EmptyState, ErrorState, and OperationalState recovery contracts;
- Sonner for transient feedback only; and
- lifecycle-owned status badge components.

`Drawer` remains quarantined while it imports undeclared `vaul`. `StatCard`
remains provisional until redesigned. File existence is not adoption.

## 12. Cross-Surface State Contract

<!-- markdownlint-disable MD013 -->

| State | Required visible contract | Prohibited shortcut |
| --- | --- | --- |
| Default/ready | Identity, task, primary action, relevant context | Ambiguous shell |
| Hover/active | Clear affordance without layout shift | Hover lift on every surface |
| Focus | Visible non-color-only ring, unobscured by sticky UI | Removing browser outline without replacement |
| Disabled | Visible reason when an action is reasonably expected | Silent permanent disabled control |
| Loading/bootstrap | Skeleton mirrors final hierarchy; announce status | Spinner-only blank page |
| Empty | Explain why and provide an authorized next action | Decorative illustration without recovery |
| Validation error | Summary plus field relation; preserve values; manage focus | Toast-only or color-only error |
| System error | Distinguish invalid input from dependency failure | False credential, payment, or persistence error |
| Conflict/stale | Preserve work; show changed version and safe resolution | Unexplained last-write-wins |
| Expired | Explain what expired and the safe restart path | Reusing stale reservation, token, price, or session |
| Offline/unavailable | Preserve safe context where allowed; never claim persistence | Fake success or blind retry loop |
| Uncertain | Reconcile before retrying an irreversible action | Duplicate payment/order/submit CTA |
| Success | State what completed and what remains | Provider, Order, or Inquiry success before authority |

<!-- markdownlint-enable MD013 -->

Surface/domain specifications add lifecycle-specific states without changing
these meanings. Important feedback must remain visible to sighted users and
must not exist only in an ARIA live region or toast.

## 13. Motion Grammar

Motion must explain hierarchy, continuity, feedback, or media state; it is not
decoration added to every component.

| Token | Value | Use |
| --- | ---: | --- |
| `motion-instant` | `0ms` | Immediate semantic state change |
| `motion-fast` | `120ms` | Hover, press, focus-supporting color/opacity |
| `motion-standard` | `180ms` | Disclosure, compact enter/exit, form feedback |
| `motion-deliberate` | `280ms` | Modal/panel or bounded page-state change |
| `motion-ambient` | `12–18s` | FDM contour cycle only |

Candidate easing:

- `ease-standard: cubic-bezier(0.2, 0, 0, 1)`;
- `ease-enter: cubic-bezier(0, 0, 0.2, 1)`;
- `ease-exit: cubic-bezier(0.3, 0, 1, 0.3)`; and
- `linear` only for a genuine indefinite spinner or contour loop.

Do not use `transition: all`. A staggered task sequence remains below 500ms
total unless a Public evidence composition receives separate review.

CSS is the default. GSAP is a scoped Public signature exception. Canvas/RAF is
progressive enhancement. Framer Motion receives no new consumer and is audited
for retirement only after consumer verification.

Under `prefers-reduced-motion: reduce`, remove scroll-linked movement,
parallax, path morph, scale, rotation, and pointer response; retain the static
contour, essential loading/progress, and short non-moving opacity/color
feedback. Do not erase all feedback through a global `0.01ms` rule.

## 14. Responsive, Accessibility, and Performance Floor

Review at:

- 390px canonical mobile baseline;
- 320px resilience floor;
- 768px intermediate/tablet;
- 1024px compact desktop/laptop; and
- 1440px representative wide desktop.

At 320px, critical content and actions remain reachable without unintended
horizontal scrolling.

Implementation floors:

- normal text contrast at least 4.5:1;
- large text at least 3:1;
- meaningful control/focus boundary at least 3:1;
- mobile body text at least 16px;
- general mobile interaction target at least 44 × 44px;
- semantic landmarks, headings, labels, names, roles, values, and status;
- managed and visible focus after rendered error, success, and conflict;
- 200% zoom and reflow without lost task/action;
- Indonesian and English long-content checks; and
- status never communicated through color alone.

These are implementation floors, not a formal WCAG conformance claim.

Retain route-level lazy loading. Add no visual dependency without measured
bundle/runtime need. Pause ambient effects offscreen or when the document is
hidden. Keep content complete before optional enhancement where the surface
permits. Use one batched final browser matrix and one detector run for each
bounded implementation slice.

## 15. External Component Intake

Classify every external source as:

1. **Reference:** study only, no copied source or dependency;
2. **Local adaptation:** reviewed material becomes a Niuva-owned contract; or
3. **Runtime dependency:** the build directly depends on the package.

Local adaptation or runtime use requires source URL/revision, license, copied
files, dependency delta, concrete Niuva need, owner layer, token remapping,
accessibility/input evidence, reduced-motion/performance evidence, maintenance
owner, removal plan, and all three anti-template checks.

React Bits, Motion Primitives, Kokonut UI, Animate UI, Magic UI, Baoyu-derived
techniques, or any other catalog may contribute a bounded technique. None
supplies Niuva's identity, product truth, content, state machine, or complete
design system.

3D/WebGL is used only when a real 3D model adds customer or operator value. It
is not required for brand decoration.

## 16. Governance and Versioning

NDS uses hybrid ownership:

| Role | Owns |
| --- | --- |
| Foundation maintainer/Driver | Core tokens, fonts, Tailwind mapping, shared UI API, compatibility map, changelog |
| Public owner | Public composition, authentic assets, editorial and FDM rules |
| Commerce/Account owner | Retail/customer/Auth composition and customer-safe task states |
| Operations owner | Admin/CMS composition, density, permission, conflict, and audit presentation |
| Product/authority reviewer | Product hierarchy, lifecycle, route, policy, provider, and activation boundaries |

One Driver owns shared foundation files in a task/worktree. Surface contributors
propose shared changes rather than creating local replacements.

Contribution lifecycle:

1. request with a repeated use case;
2. triage against existing contracts;
3. write/amend the bounded specification;
4. design, accessibility, lifecycle, and feasibility review;
5. build and test in one owned worktree;
6. publish with migration/changelog evidence; and
7. remove deprecated contracts only after their gate.

Version meaning:

- patch: compatible defect or documentation correction;
- minor: compatible token, component, variant, or surface contract; and
- major: renamed/removed token, changed component API, or changed behavior.

NDS 2.0 names the approved target; it does not claim production completion.

## 17. Compatibility, Deprecation, and Migration

Preserve route, API, permission, i18n key, customer projection, test-id,
lifecycle, and current shared-component API contracts unless a separately
approved task changes them.

A deprecated contract:

- remains functional through its recorded compatibility window;
- accepts no new consumer;
- has a named replacement and migration example;
- appears in the component register/changelog; and
- is removed only after current `origin/main` has zero consumers, targeted and
  aggregate checks pass, and a separate removal change is approved.

Migration order:

1. foundation tokens, fonts, focus, primitives, state contracts, and tests;
2. Homepage R4 Public pilot;
3. Auth Account pilot;
4. remaining Public routes;
5. Retail and Customer compositions;
6. Admin/CMS decomposition; and
7. compatibility/prototype/dependency cleanup after zero-consumer evidence.

Homepage and Auth may overlap only after the foundation merges and their file
ownership is disjoint.

## 18. Production Pilot Boundaries

### 18.1 Homepage R4

Homepage R4 is the first Public production adaptation after foundation
authorization. Preserve its centered project-neutral hero, official mark plus
Niuva text, Mona/Bona roles, calm FDM field, separate process rail, three macro
chapters, authentic project evidence, four equal Services, compact Retail
bridge, Contact summary, editorial FAQ, terminal canvas/minimal footer, and
reduced horizontal-rule budget.

Adapt it to current React, routing, CMS, i18n, accessibility, loading, error,
and content contracts. Do not copy its static server, synthetic controls, route
notices, or data into production.

### 18.2 Auth

Auth is the next Account pilot. Active scope may include Customer Login, Admin
Login, shared audience-aware recovery, Staff Invitation, and current session,
loading, error, expired, permission, and recovery behavior.

Customer/Admin trust surfaces remain distinct. On mobile, the form and primary
action precede visual context. Use Mona Sans only in Auth task/state UI. Admin
has no Google or public registration. Staff invitation never permits role
selection. Public conversion CTA/footer does not enter Account/Admin work.

`/register`, Google Identity/OAuth/OIDC, identity linking, provider-subject
storage, callback configuration, and automatic email-match linking remain
inactive until separately approved.

## 19. Current Compatibility Map

The following contracts remain available during migration; this table does not
authorize source changes.

<!-- markdownlint-disable MD013 -->

| Current contract | NDS 2.0 treatment | Removal gate |
| --- | --- | --- |
| Public semantic CSS variables | Compatibility aliases mapped to core/surface semantics | Zero consumers of deprecated names plus verified replacement |
| HSL/shadcn aliases | Compatibility layer for current Radix/shared UI | Do not remove before all active consumers migrate |
| Poppins / Inter / hosted JetBrains Mono | Compatibility-only font roles | Self-hosted target measured, consumers migrated, layout/test evidence passes |
| `frontend/tailwind.config.js` mappings | Preserve names while adding semantic target mappings | Remove aliases in a separate approved change |
| SurfacePanel / SurfacePanelHeader | Retain meaningful task grouping | API change requires migration notes and consumer review |
| TechnicalLabel | Restrict to genuine technical metadata | Remove/rework only through component contract review |
| EmptyState / ErrorState / OperationalState | Retain bounded state/recovery contracts | Replacement must preserve semantic and recovery behavior |
| Button variants | Retain names, sizes, focus, disabled, and action hierarchy | Breaking changes require a major contract amendment |
| Drawer | Quarantined because `vaul` is undeclared | Separate dependency/adoption or removal decision |
| StatCard | Provisional | Redesign and adoption evidence, or separate zero-consumer removal |
| Framer Motion | Installed with no verified active target use | Separate dependency audit and zero-consumer removal approval |

<!-- markdownlint-enable MD013 -->

The frontend component register owns current consumer counts, adoption status,
provenance, and migration evidence.

## 20. Explicit Non-Authorization

Approval of this guardrail does not authorize:

- production source or dependency changes;
- framework/build migration;
- route, redirect, locale, sitemap, or indexing activation;
- font installation or asset migration;
- API, schema, database, CMS, or content migration;
- Register, Google, identity provider, upload, storage, price, ETA, inventory,
  reservation, checkout, payment, shipment, production, or after-sales
  activation;
- role, permission, session, recovery, identity-linking, or customer-projection
  change;
- secret/environment configuration;
- analytics, monitoring, staging, deployment, readiness, or go-live;
- deleting aliases, fonts, components, dependencies, prototypes, or worktrees;
  or
- treating prototype validation as production proof.

## References

- `docs/decisions/experience/DEC-UX-004-cross-surface-design-system-reconstruction.md`
- `docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md`
- `docs/decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md`
- `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md`
- `docs/decisions/architecture/ADR-004-surface-boundary-topology.md`
- `docs/implementation/specs/candidates/2026-08-13-niuva-design-system-reconstruction-amendment-packet.md`
- `docs/implementation/prototypes/2026-08-12-niuva-homepage-r4-prototype/README.md`
- `docs/implementation/plans/pending-reconciliation/2026-08-05-frontend-component-register.md`
