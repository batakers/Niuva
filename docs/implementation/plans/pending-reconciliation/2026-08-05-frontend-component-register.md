# Niuva Frontend Component Register

Status: **Active integration register — merged-scope evidence at `origin/main`;
not independent product or Git-delivery authority**

Current merged baseline: `origin/main` at
`18f51dee8a8ddf83e438de2f2f0e3acccbc5b8c1` through PR #137, inspected 5 August
2026 (Asia/Jakarta). The selected baseline and local-diff wording retained in
this register is historical provenance for the pre-merge integration worktree;
the current merged-source state is authoritative for implementation evidence.

## Purpose

This register defines which existing frontend contracts may be reused during
design-system convergence, which require domain scoping, and which must not be
adopted yet. It preserves the current React/Tailwind/shadcn-style/Radix stack.
It does not authorize a dependency change or make an unused file canonical.

## Canonical layers

<!-- markdownlint-disable MD013 -->

| Layer | Owner paths | Contract |
| --- | --- | --- |
| Semantic foundation | `frontend/src/index.css`, `frontend/tailwind.config.js` | Own named color, type, spacing, radius, elevation, focus, state, and motion roles. No page-local substitute palette. |
| Shared UI | `frontend/src/components/ui/` | Presentation and interaction primitives with semantic variants and accessibility behavior. No route, API, or cross-domain lifecycle authority. |
| Surface/domain composition | `components/brand`, `components/auth`, `components/layout`, `components/operational`, `components/admin`, and future bounded Retail/customer directories | Compose UI contracts for one experience and own surface-specific layout or lifecycle presentation. |
| Pages | `frontend/src/pages/` | Orchestrate route state, data, permissions, mutations, and page composition. Pages do not recreate shared primitive contracts. |

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

## Surface composition inventory

<!-- markdownlint-disable MD013 -->

| Composition | Current scope | State | Required convergence |
| --- | --- | --- | --- |
| `MarketingLayout`, `BrandSystem`, `CompanyProfileBlocks` | Public marketing; currently also used by Retail | Adopted public composition | Keep expressive editorial composition public. Retail must gain commerce-specific composition where task hierarchy differs instead of cloning public cards. |
| `AuthShell` | Admin login, customer login, shared recovery, and staff invitation | Adopted with explicit audience contract | `audience="customer"`, `audience="staff"`, and `audience="recovery"` keep customer and internal language separate without changing authentication behavior. |
| `StatusStepper` | Legacy Customer Order detail | Adopted, lifecycle bounded | Owns only the legacy Order milestone order and cancellation presentation. It must not absorb B2B, Portfolio, Retail Order, or Work Order states. |
| `LegacyOrderStatusBadge` | Legacy Customer Order and read-only Admin archive | Adopted, lifecycle owned | Owns only the retained legacy Order labels-to-tone mapping and delegates visual rendering to `Badge`. |
| `B2BStatusBadge`, `PortfolioStatusBadge`, `RetailOrderStatusBadge`, `WorkOrderStatusBadge` | Their named Admin domain surfaces | Adopted, lifecycle owned | Each component owns only its applicable status-to-tone map. Shared tones do not imply shared state machines or transitions. |
| `Navbar` shell, `PublicNavigation`, `OperationalNavigation` | Shared fixed shell with separate Public and operational compositions | Adopted with explicit surface boundary | `Navbar` owns route selection, menu state, focus containment, and auth orchestration. Public and operational files own their distinct information architecture and actions; this is not one universal navigation composition. |
| Admin-specific components | Admin Studio workflows | Adopted per feature | Prefer shared UI contracts and domain compositions; split data orchestration from oversized page presentation during Admin slices. |

<!-- markdownlint-enable MD013 -->

## Current import evidence

Counts below exclude test files and were reconciled against the selected local
worktree after the audit correction:

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

<!-- markdownlint-enable MD013 -->

The former unbounded `StatusBadge` export is not a current contract. Its five
domain lifecycle groups were separated without changing status values,
transition authority, API behavior, or customer wording.

## Current local verification

The post-correction selected-baseline run passed **61/61 Jest suites and
362/362 tests**, the production build, **4/4 bundle-contract tests**, and
**20/20 bounded synthetic browser tests** across mobile, tablet, laptop, and
desktop. The browser set covered Homepage Public navigation and stable
reduced-motion WCAG checks, Retail discovery states, unauthenticated Admin
sign-in accessibility, and protected-route redirects.

This evidence validates the local component ownership and recurrence contracts
recorded here. It does not cover authenticated Admin role-matrix behavior,
independent visual acceptance, human screen-reader review, Git publication,
production infrastructure, or go-live readiness.

## Cross-surface migration order

1. **Foundation:** architecture, register, semantic guardrails, and test baseline.
2. **Auth:** separate customer/staff meaning and normalize recovery forms/states.
3. **Customer Portal:** status, next action, files, payment, milestones, and
   history using calm hierarchy rather than field cards.
4. **Retail:** commerce-specific catalog/product composition while retaining the
   shared public shell and current business/API contracts.
5. **Admin Studio:** decompose oversized pages, scope lifecycle statuses, and
   retain dense task-oriented behavior.
6. **Public:** reduce repeated composition and verify editorial consistency
   without importing operational UI or changing approved public direction.
7. **Cleanup audit:** identify truly unused components/dependencies. Removal,
   commit, push, PR, deployment, and go-live remain separately gated.

## Adoption checklist

Before a page or component is migrated:

- identify its surface and lifecycle owner;
- preserve route, API, permission, i18n, test-id, and customer-data contracts;
- reuse semantic tokens and an adopted primitive before writing local styles;
- avoid one-card-per-field composition and arbitrary radius/elevation;
- verify 320, 768, 1024, and 1440 pixel layouts proportionally to the slice;
- verify keyboard, visible focus, labels, semantic status text, reduced motion,
  loading, empty, error, retry, and permission states where applicable; and
- capture focused tests and browser evidence before claiming convergence.
