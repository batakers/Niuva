# Niuva Frontend Component Register

Status: **Active integration register — reconciled baseline plus bounded Gate
1 foundation evidence; not independent product or Git-delivery authority**

Selected implementation baseline: `origin/main` at
`c5054ede2ae868858b8764c27587c10144bf39a4`, inspected 13 August 2026
(Asia/Jakarta). The Gate 1 change set described below is bounded work on top of
that baseline; its Git integration state must be read from the applicable task
card and repository rather than inferred from this register.

Historical integration baseline: `origin/main` at
`18f51dee8a8ddf83e438de2f2f0e3acccbc5b8c1` through PR #137, inspected 5 August
2026. Its verification results remain historical evidence; current source at
the reconciliation baseline is authoritative for current implementation
evidence.

Owner-accepted candidate architecture direction is recorded in
[`2026-08-11-niuva-frontend-stack-component-architecture-decision-packet.md`](../../specs/candidates/2026-08-11-niuva-frontend-stack-component-architecture-decision-packet.md).
That packet remains candidate provenance. `DEC-UX-004` and `DESIGN.md` now
govern the NDS 2.0 target where they restate or supersede its direction. None
of these documents independently authorize source or dependency changes.

## Purpose

This register defines which existing frontend contracts may be reused during
design-system convergence, which require domain scoping, and which must not be
adopted yet. It preserves the current React/Tailwind/shadcn-style/Radix stack.
It does not authorize a dependency change or make an unused file canonical.

This reconciliation records current component and dependency evidence, the
relationship between owner-accepted `FSA-01` through `FSA-12` and the approved
NDS 2.0 target, and the separately authorized Gate 1 foundation contract. It
does not authorize page migration, cleanup, dependency changes, provider
activation, deployment, readiness, or go-live.

## Canonical layers

<!-- markdownlint-disable MD013 -->

| Layer | Owner paths | Contract |
| --- | --- | --- |
| Semantic foundation | `frontend/src/index.css`, `frontend/tailwind.config.js` | Own named color, type, spacing, radius, elevation, focus, state, and motion roles. No page-local substitute palette. |
| Shared UI | `frontend/src/components/ui/` | Presentation and interaction primitives with semantic variants and accessibility behavior. No route, API, or cross-domain lifecycle authority. |
| Surface/domain composition | `components/brand`, `components/auth`, `components/layout`, `components/retail`, `components/admin`, lifecycle-bounded `components/operational`, and a future bounded `components/customer` directory | Compose UI contracts for one experience and own surface-specific layout or lifecycle presentation. `operational` currently owns retained Legacy Order compatibility; `customer` remains reserved and absent. |
| Pages | `frontend/src/pages/` | Orchestrate route state, data, permissions, mutations, and page composition. Pages do not recreate shared primitive contracts. |

<!-- markdownlint-enable MD013 -->

## Candidate architecture and NDS 2.0 relationship

`FSA-01` through `FSA-12` remain owner-accepted **candidate planning
provenance**. `DEC-UX-004` and `DESIGN.md` are authoritative for the promoted
NDS 2.0 foundation, surface, component, motion, responsive, external-intake,
governance, compatibility, and migration clauses. Neither candidate nor
canonical documentation authorizes source or dependency changes by itself.

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

The current NDS 2.0 implementation relationship is:

- **retain/adapt:** current React, Router, CRA/CRACO, Tailwind, semantic CSS
  variables, Radix wrappers, CVA, Lucide, Sonner, Axios, Zod, bounded GSAP,
  Recharts, and current test foundation;
- **compatibility only:** Poppins, Inter, hosted JetBrains Mono, old color/token
  aliases, and current visual consumers receive no new consumer and remain
  until an approved migration records zero-consumer evidence;
- **quarantined:** `Drawer` remains unused while it imports undeclared `vaul`;
- **provisional:** unused `Progress`, `ResponsiveTable`, `Separator`,
  `StatCard`, and `Tooltip` require a bounded adoption review before use; and
- **Gate 1 foundation:** NDS 2.0 values, semantic and surface aliases, local
  typography targets, motion/focus roles, and bounded shared primitives are
  introduced through a compatibility-preserving change set; and
- **separately gated:** Homepage R4, Auth, remaining surfaces, dependency
  cleanup, and compatibility removal.

## Gate 1 foundation contract

The separately authorized Gate 1 change set introduces the following bounded
contracts without migrating any route page:

- self-hosted Mona Sans Variable and Bona Nova Italic under
  `frontend/public/fonts/niuva/`, including OFL files, SHA-256 provenance, and
  `font-display: swap`; Bona Nova remains a Public-only expressive role and is
  not globally preloaded;
- one Niuva blue family mapped through core action, text, surface, border,
  focus, and status roles, including RGB-channel aliases so existing Tailwind
  opacity consumers such as `bg-status-warning/10` remain functional;
- opt-in Public, Commerce, Account, and Operations surface aliases; existing
  `brand-page`, `admin-workbench`, Poppins, Inter, JetBrains Mono, HSL, and
  semantic aliases remain available until a later zero-consumer removal gate;
- `0/120/180/280ms` interaction timing, a 15-second ambient role, named
  enter/exit curves, and reduced-motion handling that removes movement without
  globally forcing every duration to `0.01ms`;
- visible focus and bounded Button, form-control, FormField, Alert,
  OperationalState, and Skeleton/SkeletonGroup state contracts; and
- 320px resilience plus 390/768/1024/1440px browser projects in the existing
  Playwright configuration.

This foundation does not activate Mona Sans on a route by default. Surface
adoption remains opt-in through a separately approved pilot so the current
pages do not receive an unreviewed global visual cutover.

## Shared UI inventory

"Adopted" means the contract is imported by current source. It does not mean
every current usage already meets the design system.

<!-- markdownlint-disable MD013 -->

| Contract | State | Canonical use | Constraint / next action |
| --- | --- | --- | --- |
| `Button` | Adopted | Action hierarchy, loading, disabled, and focus behavior | Preserve existing variants and `rounded-control`; unavailable `asChild` actions remain non-operable and exposed with `aria-disabled`; use `asChild` for Link actions instead of copying button classes. |
| `Input`, `Textarea`, `Label`, `FormField` | Adopted | Accessible form controls and validation layout | Keep labels, hints, errors, `aria-describedby`, and `aria-errormessage` explicit; Auth remediation must reuse these contracts. |
| `Select`, `Switch`, `Tabs` | Adopted | Accessible bounded choices and mode switching | Preserve Radix keyboard/focus behavior; do not replace with page-local controls. |
| `Dialog`, `AlertDialog` | Adopted | Modal tasks and destructive confirmation | Keep title/description and focus restoration; do not use as decorative containers. |
| `Table` | Adopted | Dense tabular operational data | Mobile behavior belongs to a domain composition; do not force desktop tables into narrow viewports. |
| `Alert` | Adopted | Inline semantic feedback | Use for actionable state, not generic colored decoration. |
| `Skeleton`, `SkeletonGroup` | Adopted | Shape-preserving loading state with one explicit loading announcement | Match final content hierarchy; visual placeholders remain hidden from assistive technology and pulse remains reduced-motion safe. |
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
| GSAP and `@gsap/react` | Runtime dependency with one current non-test consumer in `components/brand/BrandSystem.jsx` | `DSR-15` keeps GSAP as a bounded Public signature exception; this register does not authorize broader use. |
| Recharts | Runtime dependency with one current non-test consumer in `pages/admin/AdminDashboard.jsx` | Use only for factual operational data. `DEC-OPS-001` prohibits fabricated telemetry and does not select a permanent visualization library. |
| Framer Motion | Installed runtime dependency with zero current non-test source consumers | `DSR-15` adds no new Framer Motion consumer. Removal still requires a separate dependency audit and zero-consumer verification. |
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

Counts below exclude test files and were reconciled against the selected
`c5054ed` source baseline:

<!-- markdownlint-disable MD013 -->

| Contract | Direct implementation consumers | Reconciliation result |
| --- | ---: | --- |
| `Badge` | 5 | Imported only by the five lifecycle-owned badge components; no route page imports it directly. |
| `Progress` | 0 | Remains provisional and unused. |
| `ResponsiveTable` | 0 | Remains provisional and unused; its file existence is not adoption evidence. |
| `Drawer` | 0 | Remains quarantined; `vaul` is still undeclared. |
| `SurfacePanel` / `SurfacePanelHeader` module | 29 | Adopted broadly; semantic grouping remains a per-surface review obligation. Two unused candidate components importing it do not make those candidates adopted. |
| `TechnicalLabel` | 13 | Adopted under the restricted metadata contract, including the bounded Brand Lab prototype consumer; ordinary validation and navigation copy must not use it. |
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

### Selected-baseline reconciliation verification

The `c5054ed` reconciliation performed source, package, and authority
inspection before Gate 1 implementation:

- the component directories remain `admin`, `auth`, `brand`, `layout`,
  `operational`, `retail`, and `ui`; `components/customer` and `features` remain
  absent;
- current non-test consumer counts match the table above;
- `components/operational` contains only the retained Legacy Order badge and
  stepper contracts plus their test;
- installed Radix imports, active GSAP and Recharts consumers, zero Framer
  Motion consumers, and the undeclared `vaul` import match the provenance table;
- the FSA packet, Homepage R4 prototype, approved reconstruction packet,
  `DEC-UX-004`, and amended `DESIGN.md` exist in the selected `origin/main` as
  recorded authority or provenance; and
- the package manifest and lockfile remain unchanged by the bounded Gate 1
  implementation.

### Gate 1 foundation verification

The bounded Gate 1 change was verified locally on 13 August 2026:

- all **64/64 Jest suites and 401/401 tests** passed;
- all **5/5 bundle-contract tests** and the production-dependency audit passed;
- the optimized production build compiled, produced a report-only total of
  588.06 kB gzip, and added no approved budget decision; sitemap generation was
  correctly skipped because `REACT_APP_PUBLIC_SITE_URL` was not configured;
- the focused Playwright foundation matrix passed **5/5** at 320, 390, 768,
  1024, and 1440 pixels, covering local font delivery, runtime token values,
  focus and 44px targets, disabled/loading/error/recovery, reduced motion,
  overflow, layout shift below 0.1, and automated WCAG A/AA checks;
- contrast checks passed for core text/action/status pairs at 4.5:1 or better,
  and control-border/focus pairs at 3:1 or better;
- production CSS contained the retained opacity utilities, including
  `bg-status-warning/10`, `bg-action-primary/5`, and
  `disabled:bg-disabled-surface`;
- copied font and license hashes matched the approved Homepage R4 provenance;
  and
- `git diff --check` passed before documentation closeout.

The Impeccable detector was run exactly once after UI edits. It reported three
expected compatibility warnings for the still-delivered Inter family and one
false-positive warning for Mona Sans. Inter cannot be removed in Gate 1 because
current consumers have not completed surface migration; Mona Sans is the
approved NDS 2.0 target. No detector P0/P1 finding or new transferable page
composition was introduced.

`npm ci --no-audit --no-fund` populated only ignored local `node_modules` for
verification. It did not change `package.json`, `package-lock.json`, repository
dependencies, secrets, providers, or environment configuration.

Neither historical nor current evidence covers authenticated Admin role-matrix
behavior, independent visual acceptance, human screen-reader review, provider
or production infrastructure, or go-live readiness.

## NDS 2.0 implementation and migration sequence

Only after exact-file implementation authorization:

1. **Foundation:** implement approved tokens, self-hosted fonts, focus, shared
   primitives, state contracts, compatibility aliases, and proportional tests.
2. **Homepage R4:** adapt the accepted Public pilot into current React, route,
   CMS, i18n, loading/error, responsive, and accessibility contracts.
3. **Auth:** adapt the accepted Account visual direction while preserving
   Customer/Admin, invitation, recovery, session, role, and provider gates.
4. **Remaining Public:** migrate About/Tentang, Layanan/Services, Projects,
   Contact, FAQ, and Privacy through bounded route slices.
5. **Commerce and Account:** introduce surface-native Retail and Customer
   composition while preserving Order, quote, provider, and customer-data
   boundaries.
6. **Operations:** decompose Admin/CMS compositions without changing granular
   roles, permissions, lifecycle ownership, or audit behavior.
7. **Cleanup:** remove compatibility aliases, provisional components,
   prototype debt, and unused dependencies only after zero-consumer evidence,
   migration notes, passing checks, and separately approved removal.

Foundation merges before parallel Public, Account/Commerce, and Operations
worktrees. Shared-file ownership must be explicit; route pages, domain
lifecycle maps, and provider/security behavior remain outside visual-system
authority.

### Migration stage-control contract

Every stage requires a separately approved task card. Before cutover, that task
card must name the Driver and surface owner, record the compatibility baseline,
define the rollback trigger and exact recoverable action, and identify the
handover evidence and recipient. The controls below are minimums; they do not
authorize source changes, provider activation, deployment, readiness, or
go-live.

| Stage | Compatibility-preserving cutover check | Rollback trigger and action | Handover owner and evidence |
|---|---|---|---|
| 1. Foundation | Current token, font, focus, shared-component API, route, i18n, test-id, and accessibility consumers pass through recorded compatibility aliases. | Any current consumer, build, test, focus, or accessibility regression blocks cutover; revert the bounded foundation change and retain the previous mappings before any surface migrates. | Foundation Driver to affected surface owners: consumer inventory, before/after checks, compatibility map, changelog, and rollback reference. |
| 2. Homepage R4 | Current Public routes, CMS content, ID/EN, loading/error, responsive, focus, and accessibility contracts pass against the adapted React slice. | Any route, CMS, locale, action, focus, or accessibility regression blocks cutover; revert the Homepage slice while retaining compatible foundation contracts. | Public owner to Foundation Driver: route/content map, focused tests, browser matrix, screenshot review, and rollback reference. |
| 3. Auth | Customer/Admin separation, invitation, recovery, session, role, error, and provider-neutral contracts remain unchanged and no Google provider is activated. | Any authentication, session, recovery, role, provider-boundary, or accessibility regression blocks cutover; revert the Auth presentation slice and retain the prior routes/components. | Account/Auth owner to Product/authority reviewer: role/state matrix, focused tests, browser evidence, provider non-activation evidence, and rollback reference. |
| 4. Remaining Public | Each route slice preserves localized canonical URLs/aliases, CMS and SEO fields, ID/EN behavior, internal links, authentic assets, and accessibility contracts. | Any route, locale, CMS, indexing, asset, link, or accessibility regression blocks only the affected slice; revert that slice without rolling back accepted independent routes. | Public owner to Product/authority reviewer: route inventory, link/SEO/i18n checks, asset provenance, browser evidence, and rollback reference. |
| 5. Commerce and Account | Retail Order and B2B Quote/Project lifecycles remain separate; `quote_required` fails closed; pricing, provider gates, permissions, and customer-data projections remain intact. | Any lifecycle merge, unauthorized transaction, pricing/state inconsistency, provider activation, permission regression, or customer-data leak blocks cutover; revert the affected Retail/Customer slice to its compatible predecessor. | Commerce/Account owner to Product/authority reviewer: lifecycle/state matrix, authorization and projection tests, browser evidence, and rollback reference. |
| 6. Operations | Admin/CMS routes preserve granular roles, permissions, conflicts, retries, audit/history presentation, lifecycle ownership, and customer-safe projections. | Any permission, conflict/retry, audit/history, lifecycle, or data-projection regression blocks cutover; revert the affected operational slice and restore its previous component mapping. | Operations owner to Product/authority reviewer: role matrix, conflict/retry and audit checks, projection evidence, browser evidence, and rollback reference. |
| 7. Cleanup | Current `origin/main` shows zero consumers; replacements and migration notes exist; focused and aggregate checks pass; removal has separate approval. | Any remaining consumer, dependency/build/runtime regression, missing rollback evidence, or failed aggregate check blocks removal; restore the prior alias/component/dependency and reopen the migration item. | Foundation Driver and affected surface owner: zero-consumer evidence, dependency diff, focused/aggregate checks, removal changelog, and rollback reference. |

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
