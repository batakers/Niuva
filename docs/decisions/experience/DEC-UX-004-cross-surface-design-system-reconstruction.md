# DEC-UX-004 — Cross-Surface Design-System Reconstruction and Migration

ID: `DEC-UX-004`
Status: **Approved Decision — Documentation Amendment; No Implementation
Authority**
Decision date: 13 August 2026
Decision owner: Product decision authority
Decision source: Explicit owner approval of `DSR-01` through `DSR-22` on
13 August 2026, recorded in the linked amendment packet.
Scope: Niuva digital visual foundation, four-Service hierarchy, cross-surface
composition, component and state contracts, motion, governance, compatibility,
deprecation, and staged migration order

## Context

Niuva has a healthy React/Tailwind/Radix-based frontend foundation, approved
product and lifecycle decisions, and separately validated Public and Auth visual
evidence. Its current canonical visual guidance nevertheless conflicts with the
new owner-approved direction:

- the Master Specification and `DEC-UX-002` classify two Services as primary
  and two as supporting;
- `DEC-UX-002.1` and the transitional `DESIGN.md` require Poppins and Inter,
  while the accepted reconstruction direction uses Mona Sans Variable with a
  narrowly bounded Bona Nova Italic role;
- the old Homepage decision gives the semantic U-curve two dominant
  placements, while the accepted R4 direction separates a bounded FDM contour
  identity gesture from one semantic process rail;
- current source exposes multiple compatibility token vocabularies and uneven
  Public, Commerce, Account, and Operations compositions; and
- candidate architecture and prototype evidence was owner-reviewed but did not
  independently have canonical or production authority.

Keeping these conflicts unresolved during implementation would either deepen
the discarded visual system or create competing local systems across three
developers.

## Decision

Niuva adopts the **NDS 2.0 cross-surface design-system reconstruction target**.
It is introduced through staged, compatibility-preserving migration rather than
a big-bang frontend rewrite.

### Approved decision set

<!-- markdownlint-disable MD013 -->

| ID | Decision |
| --- | --- |
| `DSR-01` | Reconstruct the visual and component contract through staged migration; preserve healthy behavior, lifecycle, test, and accessibility contracts. |
| `DSR-02` | Research & Development, Consultant & Workshop, Design & Prototyping, and Apparel & Merchandise are four globally primary Services with equal information and visual rank. |
| `DSR-03` | Use one Niuva identity with distinct Public, Commerce, Account, and Operations surface registers. |
| `DSR-04` | Preserve the current React, React Router, CRA/CRACO, Tailwind, semantic CSS-variable, Radix-wrapper, CVA, Lucide, Sonner, Axios, Zod, bounded GSAP, Recharts, and test foundation. |
| `DSR-05` | Mona Sans Variable is the primary Niuva sans family across surfaces; Bona Nova Italic is restricted to one bounded expressive interruption on Public; system monospace is reserved for genuine technical values. |
| `DSR-06` | Production fonts use self-hosted, license-recorded WOFF2 assets with measured fallback behavior and no duplicate external delivery path. |
| `DSR-07` | Niuva blue remains the primary identity color through a contrast-aware tonal family with independent semantic status colors. |
| `DSR-08` | Tokens use global values, core semantic aliases, surface aliases, and only justified component tokens; CSS custom properties remain the runtime source of truth. |
| `DSR-09` | Public, Commerce, Account, and Operations use surface-native composition, density, imagery, typography, and motion rather than one transferable page template. |
| `DSR-10` | Every visible slice must pass first-order, second-order, and logo-hidden anti-template checks. |
| `DSR-11` | The FDM contour is a bounded identity gesture; the five-stage process is a separate semantic rail that appears once in the dedicated process section. |
| `DSR-12` | Preserve the dependency direction `tokens → shared UI → surface/domain compositions → route pages`; lifecycle meaning remains domain-owned. |
| `DSR-13` | Adopt one component-spec format covering purpose, anatomy, API, variants, states, behavior, accessibility, responsiveness, content, tokens, anti-patterns, ownership, and migration status. |
| `DSR-14` | Relevant default, hover, focus, active, disabled, loading, empty, error, conflict, stale, expired, offline, uncertain, recovery, and success states are part of the contract. |
| `DSR-15` | Motion is CSS-first, allows GSAP only for bounded Public signature choreography, treats Canvas/RAF as progressive enhancement, and adds no new Framer Motion consumer. |
| `DSR-16` | Use 390px as the mobile design baseline, 320px as the resilience floor, and 768px, 1024px, and 1440px as representative review widths. |
| `DSR-17` | External catalogs are reference-first; local adaptation or runtime adoption requires provenance, license, accessibility, performance, motion, ownership, and maintenance evidence. |
| `DSR-18` | Use hybrid governance: the foundation maintainer owns tokens and primitives; surface owners own bounded compositions; pages retain route, data, and permission orchestration. |
| `DSR-19` | Version, deprecate, and remove contracts through compatibility mappings, consumer evidence, migration notes, and explicit removal gates. |
| `DSR-20` | Homepage R4 is the first Public production pilot after a separately authorized foundation implementation. |
| `DSR-21` | The accepted Auth visual direction is the next Account pilot; `/register` and Google remain inactive until separate security and provider authority exists. |
| `DSR-22` | The foundation merges first; Public, Account/Commerce, and Operations may then proceed in three owned worktrees with explicit shared-file rules. |

<!-- markdownlint-enable MD013 -->

### Four primary Services

The four Services have the same navigation tier, CMS publication treatment,
Homepage and Layanan/Services information weight, and default detail action.
None receives a supporting badge, smaller placement, or exceptional panel that
demotes it.

Equal Service rank does not change the journey hierarchy. Business/B2B remains
the Homepage's primary narrative and Retail remains secondary but clearly
discoverable. Apparel & Merchandise may route to Ready Products or a
Partnership/Inquiry from its detail experience without becoming a lesser
Service.

### Visual foundation

- Keep the official `frontend/public/niuva-mark.svg` and pair it with the text
  `Niuva` in primary navigation unless a later approved context changes that
  treatment.
- Use Mona Sans Variable for display, body, and UI across all surfaces.
- Use Bona Nova Italic for at most one short expressive interruption within a
  Public composition; do not use it for Retail tasks, Customer/Auth, Admin,
  forms, tables, badges, or statuses.
- Use a system monospace stack only when fixed width materially improves a
  genuine code, hash, or machine value.
- Retain Niuva blue as identity through the approved tonal family and semantic
  pairings in `DESIGN.md`; do not use the signature mid-tone as normal body
  text when it lacks required contrast.
- Keep the FDM contour complete when static. It does not represent live
  printer telemetry, production progress, capacity, or an Order state.

### Surface registers

- **Public — Persuade / Experience:** evidence-led, editorial, authentic, and
  B2B-primary, with a clear Retail route and one bounded identity gesture.
- **Commerce — Operate:** specification-first product/configuration hierarchy,
  safe price and ETA, authoritative transaction states, and fail-closed
  `quote_required` behavior.
- **Account — Operate:** task-first identity, owned records, next action,
  recovery, and privacy without Public conversion composition or Admin density.
- **Operations — Operate:** dense but calm queues, ownership, age, status,
  permission, conflict, audit, and recovery without Public motifs or fake KPI
  presentation.

Shared appearance does not create a shared Retail Order, B2B Inquiry/Quote,
Portfolio, Work Order, Auth, or Customer state machine.

### Component, state, and motion contracts

The canonical dependency direction is:

```text
global values
  -> core semantic aliases
  -> surface aliases
  -> justified component tokens
  -> shared UI contracts
  -> surface/domain compositions
  -> route pages
```

Shared primitives own presentation, interaction, and accessibility behavior.
Surface compositions own layout, density, and content conventions. Domain
compositions own lifecycle presentation. Route pages own data, permission,
route, mutation, and orchestration.

Important state feedback must be visible to sighted users and assistive
technology. Critical errors, conflicts, uncertain irreversible actions, or
success cannot exist only in a toast or ARIA live region.

Motion uses one Niuva grammar: immediate semantic changes, fast control
feedback, standard disclosure/form feedback, deliberate bounded panel changes,
and one slow ambient FDM contour cycle. Reduced motion removes path movement,
parallax, morphing, scale, rotation, and pointer response while retaining static
content and essential progress feedback.

## Governance and Migration

NDS 2.0 uses hybrid ownership and semantic version communication:

- patch for compatible defects or documentation corrections;
- minor for compatible tokens, variants, components, or surface contracts; and
- major for renamed/removed tokens, changed component APIs, or changed
  behavior.

The migration order is:

1. foundation tokens, fonts, focus, primitives, state contracts, and tests;
2. Homepage R4 Public pilot;
3. Auth Account pilot;
4. remaining Public routes;
5. Retail and Customer compositions;
6. Admin/CMS decomposition; and
7. removal of compatibility aliases, provisional components, prototype debt,
   and unused dependencies only after consumer evidence reaches zero.

Current route, API, permission, i18n key, data projection, test-id, component
API, and lifecycle contracts remain compatible unless a separately approved
task changes them. A deprecated contract accepts no new consumer, keeps a named
replacement and migration example, and is removed only through a separate
approved change after zero-consumer evidence and passing checks.

## Rationale

- A single approved target prevents three developers from creating parallel
  palettes, primitives, and state meanings.
- Staged migration keeps working routes and accessibility behavior available
  while the visual system changes.
- Surface-native composition avoids turning every experience into either a
  marketing page or a generic dashboard.
- Explicit compatibility and removal gates make a large redesign reversible
  and reviewable.
- R4 and Auth provide owner-reviewed pilot evidence without pretending that a
  static prototype is a production application.

## Consequences

- `DESIGN.md` becomes the NDS 2.0 active target and compatibility guardrail.
- Poppins, Inter, hosted JetBrains Mono, old palette values, and old aliases may
  continue only as recorded compatibility contracts until source consumers are
  migrated; they receive no new consumer.
- Homepage R4 is adapted into current React, routing, CMS, i18n, loading/error,
  and accessibility contracts rather than copied from its prototype server.
- Auth production adaptation preserves current Customer/Admin, invitation,
  recovery, session, role, and permission authority.
- External component libraries may supply bounded techniques but do not become
  Niuva's identity, state machine, content truth, or complete design system.
- Future visual changes remain possible through a versioned amendment instead
  of rewriting history or silently drifting tokens.

## Superseded and Retained Scope

This decision supersedes only the following conflicting statements:

- `DEC-UX-002.1`: Poppins + Inter as the production Homepage typography;
- `DEC-UX-002.2`: the requirement for two dominant U-curve placements; the
  five-stage semantic transformation path itself remains retained;
- `DEC-UX-002` and the Master Specification: two primary and two supporting
  Services;
- the transitional `DESIGN.md` visual values where NDS 2.0 defines a target;
  and
- historical digital guidance that prohibits Mona Sans/Bona Nova or treats the
  old digital palette as the permanent cross-surface target.

The following remain retained:

- `DEC-UX-001` Unified Homepage, B2B-primary, Retail-secondary hierarchy;
- `DEC-UX-002` editorial clarity, authentic evidence, open project
  presentation, restrained motion, and rejection of generic/AI-generated
  Homepage composition;
- official `ni` mark authority;
- `DEC-UX-003` route, locale, and activation boundaries;
- `ADR-004` one-origin route-based topology;
- `DEC-OPS-001` and `DEC-OPS-003` Admin/CMS direction; and
- every approved Retail, B2B, Auth, permission, privacy, transaction, pricing,
  fulfilment, and after-sales decision.

Historical decisions and prototypes remain provenance. They are not deleted or
rewritten to imply that their whole scope was promoted.

## Non-Authorization

This documentation decision does not authorize:

- production source, dependency, framework, build, route, or schema changes;
- font installation or asset migration;
- `/register`, Google Identity, OAuth/OIDC, provider, upload, storage, API,
  database, payment, inventory, reservation, checkout, shipment, or production
  activation;
- role, permission, session, recovery, identity-linking, or customer-projection
  changes;
- secret or environment configuration;
- migration execution, redirect deployment, indexing rollout, analytics,
  monitoring, staging, production readiness, deployment, or go-live;
- deleting current aliases, fonts, components, dependencies, prototypes, or
  worktrees; or
- claiming that prototype validation proves production behavior.

## Open Consequences and Gates

- Foundation implementation requires a separate, exact-file authorization.
- Homepage R4 and Auth production pilots require their own implementation
  authorization after the foundation contract merges.
- Exact font metric overrides and bundle/runtime budgets require measured
  implementation evidence.
- Current alias consumers and component counts must be rechecked on the exact
  implementation baseline before removal.
- `/register` and Google remain inactive until their separate product,
  security, provider, callback, session, consent, and account-linking contracts
  are approved.
- Provider, Finance, production, operational-readiness, and go-live gates remain
  unchanged.

## References

- [`NIUVA_MASTER_SPEC.md`](../../NIUVA_MASTER_SPEC.md)
- [`DESIGN.md`](../../../DESIGN.md)
- [`DEC-UX-001`](DEC-UX-001-unified-homepage-b2b-primary.md)
- [`DEC-UX-002`](DEC-UX-002-homepage-experimental-editorial-hybrid.md)
- [`DEC-UX-003`](DEC-UX-003-mvp-user-flow-and-route-contract.md)
- [`ADR-004`](../architecture/ADR-004-surface-boundary-topology.md)
- [`DEC-OPS-001`](DEC-OPS-001-admin-studio-operational-direction.md)
- [`DEC-OPS-003`](DEC-OPS-003-reduced-integrated-cms-mvp.md)
- [Design-System Reconstruction Amendment Packet](../../implementation/specs/candidates/2026-08-13-niuva-design-system-reconstruction-amendment-packet.md)
- [Homepage R4](../../implementation/prototypes/2026-08-12-niuva-homepage-r4-prototype/README.md)
- [Frontend Component Register](../../implementation/plans/pending-reconciliation/2026-08-05-frontend-component-register.md)
