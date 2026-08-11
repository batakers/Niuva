# Niuva Frontend Component Register

Status: **Active integration register — reconciled implementation evidence at
`origin/main`; not independent product or Git-delivery authority**

Current reconciliation baseline: `origin/main` at
`e7ab3d5ad7a08cb06f17b641ac741cfa618f89d4` through PR #233, inspected 11
August 2026 (Asia/Jakarta).

Historical integration baseline: `origin/main` at
`18f51dee8a8ddf83e438de2f2f0e3acccbc5b8c1` through PR #137, inspected 5 August
2026. Its verification results remain historical evidence; current source at
the reconciliation baseline is authoritative for current implementation
evidence.

Owner-accepted candidate architecture direction is recorded in
[`2026-08-11-niuva-frontend-stack-component-architecture-decision-packet.md`](../../specs/candidates/2026-08-11-niuva-frontend-stack-component-architecture-decision-packet.md).
That packet is merged candidate documentation, not canonical authority or
implementation authorization.

## Purpose

This register defines which existing frontend contracts may be reused during
design-system convergence, which require domain scoping, and which must not be
adopted yet. It preserves the current React/Tailwind/shadcn-style/Radix stack.
It does not authorize a dependency change or make an unused file canonical.

This reconciliation records current component and dependency evidence plus the
relationship to owner-accepted `FSA-01` through `FSA-12`. It does not promote
those candidate decisions, amend `DESIGN.md`, move files, create a new layer,
or authorize cleanup or implementation.

## Canonical layers

<!-- markdownlint-disable MD013 -->

| Layer | Owner paths | Contract |
| --- | --- | --- |
| Semantic foundation | `frontend/src/index.css`, `frontend/tailwind.config.js` | Own named color, type, spacing, radius, elevation, focus, state, and motion roles. No page-local substitute palette. |
| Shared UI | `frontend/src/components/ui/` | Presentation and interaction primitives with semantic variants and accessibility behavior. No route, API, or cross-domain lifecycle authority. |
| Surface/domain composition | `components/brand`, `components/auth`, `components/layout`, `components/retail`, `components/admin`, lifecycle-bounded `components/operational`, and a future bounded `components/customer` directory | Compose UI contracts for one experience and own surface-specific layout or lifecycle presentation. `operational` currently owns retained Legacy Order compatibility; `customer` remains reserved and absent. |
| Pages | `frontend/src/pages/` | Orchestrate route state, data, permissions, mutations, and page composition. Pages do not recreate shared primitive contracts. |

<!-- markdownlint-enable MD013 -->

## Owner-accepted candidate architecture relationship

`FSA-01` through `FSA-12` are owner-accepted **candidate planning direction**.
They constrain subsequent planning but do not replace the canonical authority
order or authorize source and dependency changes.

<!-- markdownlint-disable MD013 -->

| Candidate | Register reconciliation |
| --- | --- |
| `FSA-01` | Preserve the current frontend foundation during MVP redesign; record current use rather than selecting a replacement stack. |
| `FSA-02` | Do not add a parallel general-purpose UI framework through component adoption. |
| `FSA-03` | Keep semantic tokens → `components/ui` → bounded surface/domain composition → pages as the dependency direction. |
| `FSA-04` | Reconcile ownership incrementally; do not mass-move or rename current directories. |
| `FSA-05` | Record reference, local adaptation, and runtime dependency as distinct dispositions. |
| `FSA-06` | Treat CSS as the motion default, GSAP as a bounded exception, Canvas as progressive enhancement, and Framer Motion as review-only. |
| `FSA-07` | Require complete semantic/static content when a decorative Canvas or signature visual is absent. |
| `FSA-08` | Do not infer React Hook Form, Redux, Zustand, or TanStack Query adoption from this register. |
| `FSA-09` | Reconcile this existing register; do not create a parallel component register. |
| `FSA-10` | Use 390/768/1024/1440 as review viewports and 320 as a resilience floor. |
| `FSA-11` | Keep the centered Public hero as a separately authorized pilot, not a production shortcut. |
| `FSA-12` | Keep dependency cleanup, build migration, and framework upgrades in separate audited tasks. |

<!-- markdownlint-enable MD013 -->

## Shared UI inventory

"Adopted" means the contract is imported by current source. It does not mean
every current usage already meets the design system.

<!-- markdownlint-disable MD013 -->

| Contract | State | Canonical use | Constraint / next action |
| --- | --- | --- | --- |
| `Button` | Adopted | Action hierarchy, loading, disabled, and focus behavior | Preserve existing variants and `rounded-control`; use `asChild` for Link actions instead of copying button classes. |
| `Input`, `Textarea`, `Label`, `FormField` | Adopted | Accessible form controls and validation layout | Keep labels and errors explicit; Auth remediation must reuse these contracts. |
| `Select`, `Switch`, `Tabs` | Adopted | Accessible bounded choices and mode switching | Preserve Radix keyboard/focus behavior; do not replace with page-local controls. |
| `Dialog`, `AlertDialog` | Adopted | Modal tasks and destructive confirmation | Keep title/description and focus restoration; do not use as decorative containers. |
| `Table` | Adopted | Dense tabular operational data | Mobile behavior belongs to a domain composition; do not force desktop tables into narrow viewports. |
| `Alert` | Adopted | Inline semantic feedback | Use for actionable state, not generic colored decoration. |
| `Skeleton` | Adopted | Shape-preserving loading state | Motion must remain reduced-motion safe. |
| `Sonner` | Adopted | Transient global feedback | Do not use a toast as the only record of a critical error or next action. |
| `EmptyState`, `ErrorState`, `OperationalState` | Adopted | Loading, no-data, error, conflict, and recovery presentation | Copy must be clear and non-terminal; customer-safe and permission-safe content remains mandatory. |
| `SurfacePanel`, `SurfacePanelHeader` | Adopted | Meaningful operational/customer grouping | One panel per meaningful region; avoid nested card soup and decorative header bands. |
| `TechnicalLabel` | Adopted, restricted | Short genuine identifiers, measurements, revisions, and audit metadata | Never use for ordinary labels, navigation, explanatory copy, marketing claims, or fake telemetry. |
| `Badge` | Adopted, presentation only | Compact semantic tone vocabulary used by five lifecycle-owned badge components | It renders a non-interactive `span` with semantic tone and radius contracts. It owns no status labels, lifecycle lists, transitions, routes, or permissions. |
| `Progress` | Provisional, unused | Determinate progress when a real value exists | Do not use to fabricate completion or ETA. Review token aliases before adoption. |
| `ResponsiveTable` | Provisional, unused | Candidate table-to-mobile composition | Validate semantics, keyboard row actions, and domain-specific mobile content before adoption. |
| `Separator` | Provisional, unused | Structural or decorative separation | Adopt only when native border/layout semantics are insufficient. |
| `StatCard` | Provisional, unused | Candidate operational summary | Current hover-lift and generic KPI-card behavior conflict with flat-first restraint; redesign before adoption. |
| `Tooltip` | Provisional, unused | Supplemental pointer/keyboard help | Never hide required labels or critical instructions in a tooltip. |
| `Drawer` | Quarantined, unused | None until reviewed | Imports undeclared `vaul` and uses non-semantic local styling. Do not import, add the dependency, or delete the file without a separate gate. |

<!-- markdownlint-enable MD013 -->

## Provenance and dependency evidence

This register distinguishes three external-source relationships:

- **Reference:** an idea or technique is studied without copying source or
  adding a runtime dependency;
- **Local adaptation:** reviewed source or a technique is adapted into a
  Niuva-owned contract with recorded license, dependency, accessibility,
  motion, performance, and ownership notes; and
- **Runtime dependency:** current source or build directly relies on an
  installed external package.

A reference is not a dependency, and an experiment is not an adopted Niuva
component merely because a local file exists.

<!-- markdownlint-disable MD013 -->

| Contract or package group | Current relationship | Current evidence and constraint |
| --- | --- | --- |
| `AlertDialog`, `Dialog`, `Progress`, `Label`, `Separator`, `Select`, `Switch`, `Tabs`, `Tooltip`, and Button `Slot` behavior | Runtime dependency through installed Radix packages | Preserve the current wrappers and accessible behavior. Do not introduce Base UI, Headless UI, or another parallel primitive for the same contract without a separate architecture decision. |
| CVA-backed internal contracts | Runtime dependency on CVA plus Niuva-owned local composition | `Alert`, `Badge`, `Button`, state components, `Label`, `Skeleton`, `SurfacePanel`, and `TechnicalLabel` use local APIs. Historical upstream provenance is not asserted where it is not recorded. |
| `Sonner` wrapper | Runtime dependency | Adopted for transient feedback only; critical state remains visible in-page. |
| Lucide icons | Runtime dependency used across current source | Icons supplement labels and meaning; they do not become a separate visual identity or color-only status authority. |
| GSAP and `@gsap/react` | Runtime dependency with one current non-test consumer in `components/brand/BrandSystem.jsx` | Candidate `FSA-06` keeps GSAP as a bounded exception; this register does not authorize broader use. |
| Recharts | Runtime dependency with one current non-test consumer in `pages/admin/AdminDashboard.jsx` | Use only for factual operational data. `DEC-OPS-001` prohibits fabricated telemetry and does not select a permanent visualization library. |
| Framer Motion | Installed runtime dependency with zero current non-test source consumers | Candidate for a separate dependency audit only; no removal or new canonical use is authorized. |
| `Drawer` / `vaul` | Local wrapper imports an undeclared package; zero consumers | Remains quarantined. Do not install `vaul`, import Drawer, or delete it through reconciliation. |
| React Bits, Magic UI, Motion Primitives, Kokonut UI, Animate UI, Aceternity, and similar catalogs | Reference only unless a later intake record says otherwise | No catalog becomes the Niuva design system. Local adaptation or dependency adoption requires source URL/revision, license, dependency delta, accessibility, motion, performance, adaptation, owner, and status evidence. |

<!-- markdownlint-enable MD013 -->

## Surface composition inventory

<!-- markdownlint-disable MD013 -->

| Composition | Current scope | State | Required convergence |
| --- | --- | --- | --- |
| `MarketingLayout`, `BrandSystem`, `CompanyProfileBlocks` | Public marketing; currently also used by Retail | Adopted public composition | Keep expressive editorial composition public. Retail must gain commerce-specific composition where task hierarchy differs instead of cloning public cards. |
| `AuthShell` | Admin login, customer login, shared recovery, and staff invitation | Adopted with explicit audience contract | `audience="customer"`, `audience="staff"`, and `audience="recovery"` keep customer and internal language separate without changing authentication behavior. |
| `RetailProductVisual` | Retail catalog and product detail | Adopted, Retail-bounded | Owns published product media and a customer-safe fallback. It must not become a generic Public project or Admin media contract. |
| `components/operational` | Retained Legacy Order customer and read-only Admin compatibility | Adopted, lifecycle bounded | The directory currently contains `LegacyOrderStatusBadge` and `StatusStepper`. Do not generalize it into the target for new Retail Order, B2B, or customer account components, and do not rename it through this register. |
| `components/customer` | Future customer-owned composition | Reserved, directory absent | Create only when a separately approved customer slice has a reusable bounded contract. Reserved naming is not implementation evidence. |
| `StatusStepper` | Legacy Customer Order detail | Adopted, lifecycle bounded | Owns only the legacy Order milestone order and cancellation presentation. It must not absorb B2B, Portfolio, Retail Order, or Work Order states. |
| `LegacyOrderStatusBadge` | Legacy Customer Order and read-only Admin archive | Adopted, lifecycle owned | Owns only the retained legacy Order labels-to-tone mapping and delegates visual rendering to `Badge`. |
| `B2BStatusBadge`, `PortfolioStatusBadge`, `RetailOrderStatusBadge`, `WorkOrderStatusBadge` | Their named Admin domain surfaces | Adopted, lifecycle owned | Each component owns only its applicable status-to-tone map. Shared tones do not imply shared state machines or transitions. |
| `Navbar` shell, `PublicNavigation`, `OperationalNavigation` | Shared fixed shell with separate Public and operational compositions | Adopted with explicit surface boundary | `Navbar` owns route selection, menu state, focus containment, and auth orchestration. Public and operational files own their distinct information architecture and actions; this is not one universal navigation composition. |
| Admin-specific components | Admin Studio workflows | Adopted per feature | Prefer shared UI contracts and domain compositions; split data orchestration from oversized page presentation during Admin slices. |

<!-- markdownlint-enable MD013 -->

## Current import evidence

Counts below exclude test files and were reconciled against the current
`e7ab3d5` source baseline:

<!-- markdownlint-disable MD013 -->

| Contract | Direct implementation consumers | Reconciliation result |
| --- | ---: | --- |
| `Badge` | 5 | Imported only by the five lifecycle-owned badge components; no route page imports it directly. |
| `Progress` | 0 | Remains provisional and unused. |
| `ResponsiveTable` | 0 | Remains provisional and unused; its file existence is not adoption evidence. |
| `Drawer` | 0 | Remains quarantined; `vaul` is still undeclared. |
| `SurfacePanel` / `SurfacePanelHeader` module | 29 | Adopted broadly; semantic grouping remains a per-surface review obligation. Two unused candidate components importing it do not make those candidates adopted. |
| `TechnicalLabel` | 12 | Adopted only under the restricted metadata contract; Product Editor validation copy no longer uses it. |
| `EmptyState` | 17 | Adopted across bounded empty-data surfaces and two unused candidate wrappers. |
| `StatusStepper` | 1 | Imported only by legacy Customer Order detail. |
| `Navbar` | 1 | Imported only by `Layout`; it composes `PublicNavigation` and `OperationalNavigation`. |
| `RetailProductVisual` | 2 | Imported only by Retail catalog and product-detail routes. |

<!-- markdownlint-enable MD013 -->

The former unbounded `StatusBadge` export is not a current contract. Its five
domain lifecycle groups were separated without changing status values,
transition authority, API behavior, or customer wording.

## Verification evidence

### Historical integration verification

At the historical `18f51de` integration baseline, the post-correction run
passed **61/61 Jest suites and 362/362 tests**, the production build, **4/4
bundle-contract tests**, and **20/20 bounded synthetic browser tests** across
mobile, tablet, laptop, and desktop. The browser set covered Homepage Public
navigation and stable reduced-motion checks, Retail discovery states,
unauthenticated Admin sign-in accessibility, and protected-route redirects.

These results remain provenance for the original integration scope. They are
not represented as a fresh test run against `e7ab3d5`.

### Current reconciliation verification

The `e7ab3d5` reconciliation performed read-only source and package inspection:

- the component directories remain `admin`, `auth`, `brand`, `layout`,
  `operational`, `retail`, and `ui`; `components/customer` and `features` remain
  absent;
- current non-test consumer counts match the table above;
- `components/operational` contains only the retained Legacy Order badge and
  stepper contracts plus their test;
- installed Radix imports, active GSAP and Recharts consumers, zero Framer
  Motion consumers, and the undeclared `vaul` import match the provenance table;
- the owner-accepted FSA packet exists in the selected `origin/main`; and
- no source, package manifest, lockfile, component status, or dependency was
  changed during this documentation reconciliation.

Focused Jest tests were not rerun: the clean reconciliation worktree has no
installed frontend dependencies, and the existing main-worktree
`node_modules` does not contain CRACO or React Scripts. No dependency install,
junction, or configuration change was performed for a documentation-only task.

Neither historical nor current evidence covers authenticated Admin role-matrix
behavior, independent visual acceptance, human screen-reader review, provider
or production infrastructure, or go-live readiness.

## Candidate validation and later migration sequence

### Candidate architecture validation

1. **Architecture packet:** `FSA-01` through `FSA-12` are owner-accepted
   candidate planning direction and merged as documentation.
2. **Component evidence:** reconcile this existing register without replacing
   it or changing source.
3. **Visual foundation:** prepare candidate typography, palette, tokens, and
   motion grammar without silently overriding current canonical decisions.
4. **Pilot:** build one separately authorized centered Public hero in isolation.
5. **Validation:** verify browser behavior, responsiveness, accessibility,
   reduced motion, performance, provenance, and anti-template specificity.
6. **Decision review:** accept, revise, or reject the candidate from evidence.
7. **Promotion:** prepare a separate canonical amendment request before any
   production rollout.

### Later production surface order

Only after applicable promotion and implementation authorization:

1. **Auth:** separate customer/staff meaning and normalize recovery forms and
   states.
2. **Customer Portal:** prioritize status, next action, files, payment,
   milestones, and history using calm hierarchy rather than field cards.
3. **Retail:** introduce commerce-specific catalog/product composition while
   retaining shared identity and current business/API contracts.
4. **Admin Studio:** decompose oversized pages, scope lifecycle statuses, and
   retain dense task-oriented behavior.
5. **Public:** reduce repeated composition and verify editorial consistency
   without importing operational UI or changing unapproved route scope.
6. **Cleanup audit:** identify truly unused components and dependencies.
   Removal, commit, push, PR, deployment, and go-live remain separately gated.

## Adoption checklist

Before a page or component is migrated:

- identify its surface and lifecycle owner;
- preserve route, API, permission, i18n, test-id, and customer-data contracts;
- reuse semantic tokens and an adopted primitive before writing local styles;
- classify external material as reference, local adaptation, or dependency and
  record applicable license, provenance, dependency, accessibility, motion,
  performance, adaptation, and ownership evidence;
- avoid one-card-per-field composition and arbitrary radius/elevation;
- review composition at 390, 768, 1024, and 1440 pixels proportionally to the
  slice;
- treat 320 pixels as a resilience floor: no unintended horizontal overflow,
  broken navigation, unreachable action, or clipped critical content;
- verify keyboard, visible focus, labels, semantic status text, reduced motion,
  loading, empty, error, conflict, recovery, success, retry, and permission
  states where applicable; and
- capture focused tests and browser evidence before claiming convergence.
