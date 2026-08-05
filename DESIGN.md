# Niuva Cross-Surface Implementation Design System

Status: **Active Guardrail — transitional/current-state implementation
guidance.**

Provenance: This guardrail is subordinate to the Master Specification, approved
requirements, applicable decisions and ADRs, runbooks, and current source/test
evidence. It does not independently authorize implementation.

## Authority and Scope

This is the active implementation design guardrail for one Niuva website and one
operational platform. It is subordinate to the approved BRD, PRS, PRD, product
decisions, and architecture decisions recorded in `docs/context/DOCUMENT_REGISTER.md`
and `docs/decisions/DECISION_REGISTER.md`.

`DEC-UX-001` governs the Unified Homepage with its B2B-primary narrative and
clear Retail secondary path. `DEC-UX-002` governs the public Homepage's
Experimental Editorial Hybrid. `DEC-OPS-001` governs Admin Studio as a
role-aware, task-oriented, dense-but-calm operational environment. Detailed
Retail/B2B navigation, provider selection, production activation, and source
implementation remain separately authorized decisions.

This document changes guidance only. Component, CSS, asset, route, page, CMS
schema, and production changes require a later implementation plan and explicit
authorization.

## Shared Semantic Tokens

Preserve the semantic-token pipeline already consumed by
`frontend/src/index.css`, `frontend/tailwind.config.js`, and shared components:

```text
Approved Niuva values
→ semantic CSS tokens
→ semantic Tailwind mappings
→ shared components and surfaces
```

The public semantic color roles remain `--color-brand-primary`,
`--color-brand-secondary`, `--color-action-primary`,
`--color-action-primary-hover`, surface, text, border, focus, status, disabled,
overlay, navigation, and decoration roles. Their current values and semantic
meanings remain the compatibility baseline; do not introduce a parallel palette
or hard-coded substitute where a semantic role already exists.

Preserve the established typography, spacing, container, radius, elevation,
focus, state, and motion roles. This includes the current public and operational
HSL compatibility layer (`--background`, `--foreground`, `--primary`,
`--secondary`, `--muted`, `--border`, `--input`, `--ring`, `--surface-*`,
`--signal`, and status aliases) because current components consume it. New
public work should use the public semantic roles; the compatibility layer is not
a license to create a second public visual system.

## Canonical Frontend Component Architecture

Keep the current React, Tailwind, shadcn-style/Radix, CVA, Lucide, and Sonner
foundation. Design-system convergence is an architecture and usage migration;
it is not authorization to add a replacement UI kit or a second set of visual
primitives.

The canonical dependency direction is:

```text
semantic CSS tokens
-> Tailwind semantic mappings
-> shared UI contracts in components/ui
-> surface or domain compositions
-> route pages
```

The layers have distinct responsibilities:

1. `frontend/src/index.css` and `frontend/tailwind.config.js` own semantic visual
   roles. Components consume those roles; they do not create local palettes or
   radius systems.
2. `frontend/src/components/ui/` owns reusable presentation and interaction
   contracts. These components may own variants, accessibility behavior, and
   responsive presentation, but not route decisions, network requests, or a
   product lifecycle that belongs to one domain.
3. Surface and domain directories such as `components/brand`,
   `components/auth`, `components/operational`, `components/admin`, and future
   Retail or customer-specific directories compose shared contracts for one
   bounded experience. Public editorial composition must not leak into Admin;
   Admin density must not leak into customer or public journeys.
4. Route pages orchestrate route state, data loading, mutations, permissions,
   and page-level composition. When a page repeats a visual or interaction
   pattern, it should extract or reuse a lower-layer contract instead of
   recreating the pattern with page-local utility strings.

Shared appearance does not make lifecycle meaning global. Status order, label,
allowed transition, and customer-safe wording remain owned by the Retail Order,
B2B Inquiry/Quote/Project, Work Order, Portfolio, or other applicable lifecycle.
A shared status-tone helper may be reused, but a single unbounded status map
must not become product authority for unrelated lifecycles.

The current component inventory, adoption state, and migration constraints are
recorded in
`docs/implementation/plans/pending-reconciliation/2026-08-05-frontend-component-register.md`.
That register is implementation evidence, not independent product authority.

## Composition and Visual Restraint

Use a panel only when it communicates one meaningful region, task, or state.
Do not wrap every field, label/value pair, timeline event, or explanatory line
in its own card. Prefer hierarchy, spacing, dividers, lists, and definition
groups inside one containing surface. Nested panels require a distinct
interaction or state boundary, not decoration.

Radius follows component meaning: controls use the control radius, panels use
the panel radius, and pills are reserved for compact statuses, filters, or
other genuinely pill-shaped controls. Avoid arbitrary per-page radius values
and mixtures of square, rounded, and pill containers without a semantic reason.

Use elevation flat-first. Borders and surface contrast establish most grouping;
shadows are reserved for navigation, overlays, or a clear layer transition.
Do not turn repeated hover lift, drop shadows, colored header strips, or uniform
card grids into the default visual language.

Brand blue identifies Niuva and important actions or active states. It must not
fill every neutral container. Mobile layouts must preserve task priority and
readability by recomposing content, not merely shrinking the desktop card grid.

## Typography by Surface

Use Poppins for approved display and UI emphasis; use Inter for body copy, metadata, forms, and dense operational text.

Poppins is appropriate for public display hierarchy, headings, navigation-style
UI, and buttons. Inter is appropriate for readable public body copy as well as
customer and operational body text. Preserve the current typography role names
and utility mapping so existing `type-*`, `font-heading`, `font-display`, and
related consumers remain compatible until separately authorized source changes
are made.

Limit JetBrains Mono to code, identifiers, measurements, and genuinely technical data. It must not create pseudo-terminal decoration on public pages.

Operationally meaningful examples include SKU, order number, revision,
timestamp, operation ID, status code, and audit identifier. It is not the voice
for ordinary navigation, explanatory copy, customer messaging, metrics, loading
copy, empty states, or marketing claims.

## Official Brand Mark

Use the approved lowercase ni mark from the brand source; do not construct an alternative letterform as product identity.

Use approved brand assets and factual company information. The mark, palette,
and typography should establish Niuva identity without fabricated technical
measurements, decorative telemetry, or a substitute logo treatment.

## Public Brand and B2B Surfaces

Public brand and B2B surfaces prioritize credibility, R&D, design engineering,
prototyping, capabilities, and authentic project evidence. The Homepage follows
the Unified Homepage decision: B2B is the primary narrative, while Retail is a
clear secondary path within the same identity.

Public pages may use the Experimental Editorial Hybrid language governed by
`DEC-UX-002`: editorial clarity, differentiated capability chapters, authentic
project context, and a semantic `Need → Research → Experiment → Prototype →
Output` U-curve. The initial Homepage permits two dominant U-curve placements:
a compact hero path and a complete process path. Motion stays restrained, with a
complete static equivalent for reduced-motion users.

Do not use generic marketplace composition, fabricated proof, gradients, neon,
glassmorphism, particles, fake dashboards, decorative telemetry, or repeated
U-curves as ornament. Public composition must not be copied into Admin Studio.

## Retail Commerce Surfaces

Retail surfaces prioritize product discovery, standardized configuration, file
requirements, safe price and ETA, checkout state, payment state, and tracking.
They may be commerce-oriented while preserving Niuva's R&D and engineering
positioning across the wider website.

Retail must remain distinct from B2B inquiry, quotation, design approval, and
project milestones. Use the shared semantic tokens and accessible interaction
states; do not invent product availability, price, ETA, payment-provider
behavior, tax, shipping, pickup, cancellation, refund, or return policy.

Detailed Retail navigation, CTA placement, and implementation are deferred to
their separately approved plan and authorization.

## Customer Portals

Customer portals prioritize current status, next action, milestones, ETA,
approvals, payment, files, and shipment. They show customer-safe information
only and must preserve the separate Retail Order and B2B Quote/Project
lifecycles.

Use calm semantic states for loading, empty, error, conflict, retry, permission,
stale, expired, and recovery conditions. Do not expose internal cost, margin,
supplier, profit, internal notes, or operational data that customers are not
authorized to see.

## Admin Studio Operational Surfaces

Admin Studio follows `DEC-OPS-001`: dense, calm, status-led, role-aware,
permission-aware, task-oriented, auditable, recovery-aware, and accessible. It
contains CMS and Operations Back-office; it is not a third customer journey.

Prioritize data clarity, visible next action, filters, status, validation,
permission boundaries, audit history, conflicts, and routine work. Do not copy
public Homepage composition, decorative telemetry, fabricated metrics, repeated
generic KPI-card grids, or decorative terminal language into Admin Studio.

Monospace remains available for genuine technical data only. Existing operational
component APIs stay compatible, but future visual implementation must not turn
ordinary labels, explanations, navigation, metrics, or empty states into a
simulated terminal.

## Shared Components and Accessibility

Preserve the current shared-component contracts: `SurfacePanel`,
`SurfacePanelHeader`, `TechnicalLabel`, `EmptyState`, and the existing button
variants (`default`, `secondary`, `outline`, `ghost`, `destructive`, `success`,
and `link`). Preserve their semantic token
dependencies while later implementation work aligns their presentation with this
guidance.

`SurfacePanel` and `SurfacePanelHeader` remain reusable operational containers.
`TechnicalLabel` remains for short, genuinely technical metadata. `EmptyState`
continues to represent loading, no-data, and configuration states, but its
content must be clear, meaningful, and non-decorative. Button variants retain
their current API, focus treatment, disabled state, and semantic action roles.

New work must reuse the current component foundation before adding a primitive.
An existing file is not automatically canonical: unused, untested, or
dependency-incomplete components remain provisional until their contract and
adoption are reviewed. Route pages must not directly copy a shared component's
class list to create a near-duplicate. Lifecycle-specific status presentation
must use a scoped domain composition rather than extending one global badge map
indefinitely.

All surfaces require readable contrast, semantic structure, keyboard reach,
visible focus, labels that do not rely on color alone, responsive behavior, and
reduced-motion equivalents. Animation must never be necessary to understand
content or reach an action.

## Transitional Component Mapping

The following mappings are preserved during the documentation transition; this
table does not authorize code changes.

| Current contract | Required continuity | Future alignment constraint |
|---|---|---|
| `frontend/src/index.css` semantic CSS variables | Keep public semantic roles, typography, spacing, radius, elevation, focus, and motion names stable | Use semantic roles rather than parallel public palettes |
| `frontend/tailwind.config.js` mappings | Keep semantic color, font, radius, shadow, motion, and status mappings available | Do not remove compatibility aliases without a separately approved migration |
| `SurfacePanel` / `SurfacePanelHeader` | Keep API, padding, intent, border, and surface-token behavior | Use for calm task-oriented operational grouping, not public decoration |
| `TechnicalLabel` | Keep API, tone, size, and semantic text-color variants | Restrict use to genuinely technical, concise data |
| `EmptyState` | Keep API and frame variants | Use meaningful operational states, not simulated terminal messaging |
| Button variants | Keep names, sizes, focus, disabled, and semantic state behavior | Preserve accessible action hierarchy; do not use technical styling as public decoration |

Any source-level migration must include compatibility, accessibility, responsive,
and role-boundary verification before removing or renaming these contracts.
