# DS-01A Component and Consumer Ledger

**Status:** Candidate — Context Only — Phase 6 `DS-01A` owner-approved as an
exact-SHA component and consumer record; `DS-01B` and application source work
are not authorized

**Date:** 18 August 2026

**Repository baseline:** `origin/main`
`8555685c29a3fde9976ae6499336e2eb45a330ba`

**Objective:** Reconcile every current non-test component source module with
its direct consumers, exported contract, layer, owner, adoption status,
visible or interaction states, test evidence, and restrictions. This is an
exact-SHA ledger, not a redesign or a new parallel component register.

**Owner decisions:** The owner approved Phase 5 and authorized Phase 6 only for
`DS-01A` on 18 August 2026. After reviewing the completed ledger, the owner
approved it as the candidate exact-SHA component and consumer record on the
same date. These decisions do not start `DS-01B`, promote or retire a
component, modify application source, or authorize stage, commit, push, PR,
merge, deployment, readiness, or go-live.

## 1. Authority and relationship to the existing register

Read this ledger after:

1. the repository authority order in `AGENTS.md`;
2. [`DESIGN.md`](../../../DESIGN.md) and the applicable approved decision;
3. the active
   [frontend component register](../../../docs/implementation/plans/pending-reconciliation/2026-08-05-frontend-component-register.md);
4. the owner-approved candidate
   [Design Brief](../DESIGN_BRIEF.md),
   [Information Architecture](../INFORMATION_ARCHITECTURE.md), and
   [token contract](../DESIGN_TOKENS.md); and
5. current source and tests as implementation evidence.

The active component register remains the repository planning register. This
file satisfies the bounded Phase 6 `DS-01A` task by refreshing that register's
consumer evidence at the selected SHA. It does not supersede, fork, or
silently amend the register. Higher authority wins if a classification below
conflicts with an approved decision.

## 2. Method and notation

The review inspected:

- all `50` non-test `.js`/`.jsx` component modules under
  `frontend/src/components`;
- all static component imports from non-test source under `frontend/src`;
- named exports and named-import use;
- `72` frontend test files, including direct component tests and static
  contract tests;
- `frontend/package.json` and `frontend/package-lock.json`; and
- current component behavior for keyboard, focus, state, feedback, responsive,
  localization, and dependency boundaries.

Consumer paths in Section 6 are relative to `frontend/src`. Brace notation is
an exact enumeration, not a wildcard. For example,
`pages/auth/{CustomerLogin,ForgotPassword}.jsx` means exactly those two files.
Tests are excluded from direct implementation-consumer counts and are listed
separately.

The graph records direct imports. Route-level lazy imports in `App.js` belong
to `DS-01B`; none dynamically import a component module. File existence,
export count, a test, or a dependency does not by itself establish adoption.

## 3. Layer, owner, and status vocabulary

### 3.1 Ownership

| Owner | Ledger responsibility |
| --- | --- |
| Foundation maintainer | Shared UI API, primitive behavior, identity mechanics, shell mechanics, compatibility map, and dependency boundary. |
| Public owner | Public/marketing composition, editorial content conventions, authentic evidence, and Public interaction expression. |
| Commerce/Account owner | Retail, customer, and authentication composition plus customer-safe task states. |
| Operations owner | Admin/CMS compositions, density, permission presentation, queues, conflict, audit, and domain-status presentation. |
| Product/authority reviewer | Lifecycle, route, privacy, policy, provider, authorization, and activation meaning; never delegated to a visual component. |

### 3.2 Status

- **Adopted:** existing register status backed by current real consumers. It
  does not assert that every consumer is already converged.
- **Adopted, restricted:** current contract with an explicit content, surface,
  or domain restriction.
- **Adopted, compatibility-bounded:** retained for current consumers; no new
  consumer should be inferred and replacement/removal needs a separate task.
- **Provisional, unused:** zero current application consumers; full review is
  required before first adoption.
- **Quarantined, unused:** unsafe or undeclared boundary; do not import,
  install, promote, or delete without a separate decision.

This ledger carries forward current statuses. It promotes and retires nothing.

## 4. Exact-SHA summary

| Evidence | Current result |
| --- | --- |
| Non-test component modules | `50` across `admin`, `auth`, `brand`, `layout`, `operational`, `retail`, and `ui` |
| Adopted shared primitive/pattern modules | `20` |
| Adopted composition/helper/domain modules | `24` |
| Provisional zero-consumer modules | `5`: `Progress`, `ResponsiveTable`, `Separator`, `StatCard`, `Tooltip` |
| Quarantined zero-consumer modules | `1`: `Drawer` |
| Reserved component area | `components/customer` remains absent; reservation is not implementation evidence |
| Test files inspected | `72` under `frontend/src` |
| Runtime component dependency exception | `BrandSystem.jsx` is the only component module importing GSAP/`@gsap/react` |
| Undeclared dependency | `Drawer` imports `vaul`; `vaul` is absent from manifest and lockfile |
| Framer Motion | Absent from current manifest, lockfile, and source; the older register statement that it was installed is stale at this SHA |
| Register count drift | `TechnicalLabel` has `12`, not `13`, direct implementation consumers; the former Brand Lab consumer is absent |

## 5. Component contract ledger

The state column reports current source behavior, not the full future NDS
13-field specification. Missing evidence is a follow-up requirement, not a
license to change the source in `DS-01A`.

### 5.1 Shared UI primitives and patterns

<!-- markdownlint-disable MD013 -->

| Module and exports | Layer / owner | Status | Current API, states, and interaction evidence | Restriction or follow-up |
| --- | --- | --- | --- | --- |
| `components/ui/alert-dialog.jsx` — Radix root, trigger, portal, overlay, content, header/footer, title/description, action/cancel | Shared overlay primitive / Foundation maintainer | Adopted | Open/closed, confirm, and cancel mechanics delegate focus, Escape, and modal semantics to Radix; action/cancel reuse Button classes. | Destructive meaning and final authority remain domain-owned. No direct module test; DS-03 must verify focus entry/return and reduced motion. |
| `components/ui/alert.jsx` — `Alert`, `alertVariants` | Shared feedback primitive / Foundation maintainer | Adopted | `info`, `success`, `warning`, `error`, and `default`; visible region with configurable role, default `role="alert"`; semantic tones are component-tested. | Inline feedback only; success copy requires authoritative domain completion. Never decorative color. |
| `components/ui/badge.jsx` — `Badge`, `badgeVariants` | Shared presentation primitive / Foundation maintainer | Adopted, presentation only | Non-interactive `span`; tones `muted`, `warning`, `info`, `success`, `danger`, `primary`; source contract test prevents lifecycle ownership. | Owns no status label, transition, permission, route, or state machine; domain adapters remain separate. |
| `components/ui/button.jsx` — `Button`, `buttonVariants` | Shared action primitive / Foundation maintainer | Adopted | Variants `default`, `secondary`, `outline`, `ghost`, `destructive`, `success`, `link`; sizes `default`, `sm`, `lg`, `icon`; ready, hover, focus, active, disabled, and loading. Native and `asChild` unavailable actions are blocked; loading stays visibly labelled and exposes `aria-busy`. | Preserve API. Variant names do not authorize lifecycle success or destructive mutation. Use this before copying action mechanics locally. |
| `components/ui/dialog.jsx` — Radix dialog module | Shared overlay primitive / Foundation maintainer | Adopted | Open/closed overlay, content, title, description, close, header/footer; Radix supplies focus/keyboard semantics; visible close name is screen-reader text. | Domain owns dismissal safety and mutation state. No direct module test; current local animation/shape values require DS-03 review, not silent remediation. |
| `components/ui/drawer.jsx` — Vaul drawer module | Candidate overlay primitive / Foundation maintainer | Quarantined, unused | Intended open/closed overlay and bottom sheet API; no consumer or behavioral test. | Imports undeclared `vaul`, uses local arbitrary dimensions/radius and unreviewed behavior. Do not import, install `vaul`, promote, or delete in this task. |
| `components/ui/empty-state.jsx` — `EmptyState`, variants | Shared state pattern / Foundation maintainer | Adopted | Default, icon, and `loading` branches; optional none/solid/dashed frame; loading motion is reduced-motion guarded. | Domain owns why empty and the valid next action. Its loading branch overlaps Skeleton/OperationalState and lacks direct behavior tests; DS-03 must resolve responsibility. |
| `components/ui/error-state.jsx` — `ErrorState` | Shared state pattern / Foundation maintainer | Adopted | Compact/full error, visible `role="alert"`, optional retry Button. | Domain owns safe retry and customer-safe copy. Current English fallback/`Retry` text and truncation are localization/content debt; no direct component test. |
| `components/ui/form-field.jsx` — `FormField` | Shared form pattern / Foundation maintainer | Adopted | Label, hint, required, validation error; preserves child ID and existing description, then adds `aria-invalid`, `aria-describedby`, and `aria-errormessage`; behavior tested. | Validation only. Dependency/system errors must not mark valid fields invalid. One supported form control child is the current anatomy. |
| `components/ui/input.jsx` — `Input` | Shared form primitive / Foundation maintainer | Adopted | Native input API; ready, focus, invalid, disabled, placeholder, and file-input presentation; 44px current height and semantic focus/error tokens. | Labels and error ownership remain outside the primitive. No lifecycle or persistence meaning. |
| `components/ui/label.jsx` — `Label` | Shared form primitive / Foundation maintainer | Adopted | Radix label API with default and peer-disabled presentation. | Must keep an explicit control relationship. No direct behavior test; exercised through FormField tests and consumers. |
| `components/ui/operational-state.jsx` — `OperationalState` | Shared perceivable-state pattern / Foundation maintainer | Adopted | `loading`, `empty`, `no-match`, `error`, `conflict`, `stale`, `expired`, `unavailable`, `uncertain`, `success`, plus neutral fallback; urgent states use `alert`, others `status`; loading exposes `aria-busy`; optional retry; dedicated tests cover states. | Presentation only. Domain owns copy, permissible retry, permission, lifecycle meaning, and authoritative success. |
| `components/ui/progress.jsx` — `Progress` | Candidate shared primitive / Foundation maintainer | Provisional, unused | Intended determinate value and Radix semantics; no application consumer or test. | Must not fabricate progress, ETA, reservation, payment, or production state. Uses compatibility aliases and `transition-all`; first use needs separate adoption review. |
| `components/ui/responsive-table.jsx` — `ResponsiveTable` | Candidate shared collection pattern / Foundation maintainer with surface owner | Provisional, unused | Proposed desktop table/mobile cards with loading, empty, data, and optional row-click branches; motion static contract only. | Pointer-only row/card activation is not yet keyboard-complete; domain mobile content, identity, and actions are unresolved. Do not adopt before DS-04 review. |
| `components/ui/select.jsx` — Radix select module | Shared form primitive / Foundation maintainer | Adopted | Closed/open, placeholder, focus, disabled, invalid, selected item, scroll controls; minimum 44px trigger/items; Radix keyboard behavior. | Bounded choice only. Domain owns option validity and persistence. No direct behavior test at this SHA. |
| `components/ui/separator.jsx` — `Separator` | Candidate shared primitive / Foundation maintainer | Provisional, unused | Horizontal/vertical and decorative/semantic Radix separator; zero consumers and tests. | Native layout/border semantics remain preferred; do not introduce decorative line repetition by default. |
| `components/ui/skeleton.jsx` — Skeleton family | Shared loading pattern / Foundation maintainer | Adopted | Shape variants plus `SkeletonGroup`; visual shapes are `aria-hidden`, group announces one labelled busy status; pulse is reduced-motion guarded; behavior tested. | Must mirror final hierarchy and must not become a blank spinner substitute. `SkeletonGroup` currently has no production consumer even though the module is adopted. |
| `components/ui/sonner.jsx` — `Toaster`, `toast` | Shared transient-feedback adapter / Foundation maintainer | Adopted | One App-level Toaster; package supplies transient open/dismiss behavior. | Critical failure/success cannot exist only in a toast. Current pages mostly import `toast` from `sonner` directly, so wrapper ownership is not yet converged. `theme="dark"` is existing adapter behavior, not approval of a global dark theme. |
| `components/ui/stat-card.jsx` — `StatCard`, `StatCardSkeleton` | Candidate Operations summary composition / Operations owner | Provisional, unused | Default/hero summary plus skeleton; zero consumer and test. | Generic KPI card, hover lift, status-colored accent, and delayed reveal conflict with flat-first restraint. Requires real factual overview need and separate adoption redesign. |
| `components/ui/surface-panel.jsx` — `SurfacePanel`, `SurfacePanelHeader`, variants | Shared grouping pattern / Foundation maintainer | Adopted | `padding` none/sm/md/lg, default/dashed intent, polymorphic element, optional header; semantic surface contract is tested. | One meaningful region per panel. Avoid nested card soup, decorative headers, and treating a panel as lifecycle authority. Two direct consumers are themselves unused candidates. |
| `components/ui/switch.jsx` — `Switch` | Shared form primitive / Foundation maintainer | Adopted | Radix checked/unchecked, focus, disabled, thumb movement, and expanded 44px hit area. | Requires visible external label and domain-owned persistence. No direct behavior test at this SHA. |
| `components/ui/table.jsx` — semantic table family | Shared data primitive / Foundation maintainer | Adopted | Native table anatomy, overflow wrapper, row hover, and selected presentation. | Row actions, mobile alternative, sort/filter state, caption, and record identity remain composed/domain responsibilities. No direct module test. |
| `components/ui/tabs.jsx` — Radix tabs module | Shared mode-selection primitive / Foundation maintainer | Adopted | Active, focus, disabled, list/trigger/content mechanics; minimum 44px target; Radix keyboard behavior. | One current Operations consumer. Tabs must not hide critical state or replace route/history ownership. No direct module test. |
| `components/ui/technical-label.jsx` — `TechnicalLabel`, variants | Shared restricted text primitive / Foundation maintainer | Adopted, restricted | Non-interactive polymorphic label; tones and micro/xs/sm sizes. | Genuine IDs, hashes, revisions, measurements, and audit metadata only. No ordinary labels, navigation, marketing claims, or fake telemetry. Current direct consumer count is 12. |
| `components/ui/textarea.jsx` — `Textarea` | Shared form primitive / Foundation maintainer | Adopted | Native textarea API; ready, focus, invalid, disabled, placeholder; minimum height and semantic focus/error tokens. | Labels, limits, validation, persistence, and recovery remain outside the primitive. |
| `components/ui/tooltip.jsx` — Radix tooltip module | Candidate shared primitive / Foundation maintainer | Provisional, unused | Intended pointer/keyboard supplemental content with open/closed and placement states; zero consumer/test. | Must never contain a required label, instruction, error, status, or only route/action explanation. First use needs a full adoption review. |

<!-- markdownlint-enable MD013 -->

### 5.2 Identity, Public, and shared-shell compositions

<!-- markdownlint-disable MD013 -->

| Module and exports | Layer / owner | Status | Current API, states, and interaction evidence | Restriction or follow-up |
| --- | --- | --- | --- | --- |
| `components/brand/BrandIdentity.jsx` — `BrandIdentity` | Shared identity composition / Foundation maintainer; Public expression review | Adopted | `nav` and `footer` rendering use the official `niuva-mark.svg` plus visible Niuva text; image loading changes by variant. | Prototype consumers are inventory-only. `AdminLayout` currently passes unsupported `variant="mark"` and `size`; record as API drift, not a new variant. |
| `components/brand/BrandSystem.jsx` — Public page, section, hero, CTA, Contact, and form compositions | Public surface composition / Public owner | Adopted, surface-bounded | Public page reveal, container/section/hero/header/CTA, Contact summary, and complete Contact form composition. Contact form exposes required/invalid/loading states; GSAP skips all enhancement under reduced motion. | Public-only expression. Retail's two consumers are compatibility debt, not evidence for a universal composition. GSAP remains a bounded existing dependency. `BrandButton` is only a re-export here and has no direct importer from this module. |
| `components/brand/CompanyProfileBlocks.jsx` — content and Public composition family | Public surface/domain composition / Public owner | Adopted, surface-bounded mixed module | Brand actions, visual frames, equal-service/project/process compositions, and content dataset; visible link/button focus and static semantic content. | Contains historical/local exports with no current external importer. `BrandButton` duplicates shared action mechanics and has weaker disabled-link behavior; no migration is authorized here. Project/content truth remains owner-reviewed. |
| `components/brand/Logo.jsx` — `Logo`, `LogoWordmark` | Compatibility identity helper / Foundation maintainer with Commerce/Account consumer | Adopted, compatibility-bounded | Inline SVG mark plus wordmark; only `AuthShell` imports `LogoWordmark`; no direct test. | Duplicates `BrandIdentity` and does not consume the official asset. Accept no inferred new consumer; convergence needs an exact-file migration and visual review. |
| `components/layout/Footer.jsx` — `Footer` | Public surface composition / Public owner | Adopted | Chooses Homepage terminal or legacy Public footer by resolved route; localized links, contact evidence, focusable navigation, and official identity. | Public only. `MarketingLayout` is the sole direct consumer. Contact data remains settings-owned and factual. |
| `components/layout/Layout.jsx` — `MarketingLayout`, `OperationalLayout`, `resolveCanonicalOrigin` | Shared shell with surface-owned variants / Foundation maintainer plus surface owners | Adopted with compatibility consumers | Public metadata/canonical/hreflang/fallback notice, skip link, hash/scroll recovery, footer; private layout noindex and optional sidebar. Layout tests cover canonical and shell contracts. | `MarketingLayout` currently wraps Retail catalog/product as compatibility debt. `OperationalLayout` serves retained Account pages; neither visual shell grants route or authorization authority. |
| `components/layout/Navbar.jsx` — `Navbar`, compact threshold | Shared shell / Foundation maintainer | Adopted with explicit surface boundary | Public-only compact state at 96px, mobile modal panel, focus containment/return, Escape, body scroll lock, route reset, language orchestration, and distinct Public/operational composition; dedicated and contract tests. | Does not authorize routes or access. Compact state freezes while the mobile menu is open. Public and operational navigation must remain separate. |
| `components/layout/PublicNavigation.jsx` — `PublicNavigation`, exact link registry | Public surface composition / Public owner | Adopted, surface-bounded | Direct route links, active route, desktop/mobile locale disclosure, outside click, Escape/focus return, exact counterpart navigation, and ID/EN actions; covered through Navbar tests/contracts. | No mega menu or hidden hover destination. Public only; route and locale truth come from `publicRoutes`. |
| `components/layout/OperationalNavigation.jsx` — `OperationalNavigation` | Account/Operations surface composition / Commerce/Account owner with Operations consumer | Adopted, surface-bounded | Desktop/mobile workspace, site, language, and sign-out actions; shared shell provides auth and routing callbacks; covered by Navbar and customer-portal contract tests. | Visibility is not authorization. Must not absorb Public link registry or invent private `/en` routes. |
| `components/layout/navigationStyles.js` — three shared class strings | Internal shell helper / Foundation maintainer | Adopted internal helper | Shared default/outline/quiet navigation-control presentation with focus and active feedback. | Not a public primitive API. Existing `transition-all` and scale feedback diverge from current motion guidance; DS-05 must review before any expansion. |

<!-- markdownlint-enable MD013 -->

### 5.3 Account, Commerce, Operations, and domain compositions

<!-- markdownlint-disable MD013 -->

| Module and exports | Layer / owner | Status | Current API, states, and interaction evidence | Restriction or follow-up |
| --- | --- | --- | --- | --- |
| `components/auth/AuthShell.jsx` — `AuthShell`, `AuthCard` | Account/Auth surface composition / Commerce/Account owner | Adopted with explicit audience contract | `customer`, `staff`, and `recovery` framing; desktop/mobile safe return; card title/description/content composition; dedicated tests. | Audience copy and destination stay distinct. Uses compatibility `LogoWordmark`; no auth provider, session, role, or recovery authority. |
| `components/auth/ProtectedRoute.jsx` — `ProtectedRoute` | Route guard/presentation adapter / Commerce/Account owner; Product/authority review | Adopted, authority-bounded | Loading status, unauthenticated safe-return redirect, admin forbidden, staff workspace redirect, permission-forbidden, and allowed child; dedicated tests. | Frontend guard is not backend authorization. Permission and customer projection remain server-enforced. |
| `components/retail/RetailProductVisual.jsx` — `RetailProductVisual` | Commerce composition / Commerce/Account owner | Adopted, Retail-bounded | Image/fallback, eager/lazy load, customer-safe alt/name, fixed aspect and missing-media state; dedicated and Retail contract tests. | Published Retail product media only. Not Public project evidence, Admin upload UI, checkout, file, price, stock, or availability authority. |
| `components/operational/LegacyOrderStatusBadge.jsx` — legacy adapter | Legacy Account/Operations domain composition / Commerce/Account owner | Adopted, compatibility- and lifecycle-bounded | Maps only retained legacy Order statuses to shared Badge tones; lifecycle test covers representative and neutral fallback. | No Retail Order, B2B, Portfolio, or Work Order states; no new lifecycle consumer. |
| `components/operational/StatusStepper.jsx` — legacy milestones | Legacy Account domain composition / Commerce/Account owner | Adopted, compatibility- and lifecycle-bounded | Four ordered milestones plus separate cancelled presentation; `aria-current="step"`, semantic ordered list, mobile/desktop layout; dedicated and portal-contract tests. | Retained legacy Customer Order detail only. It is not production telemetry, ETA, or a universal workflow stepper. |
| `components/admin/AccountStatusBadge.jsx` — account status adapter | Operations domain composition / Operations owner | Adopted, lifecycle-bounded | `active`, `disabled`, and unknown fallback; localized label; non-interactive span. | Owns only account status meaning. It duplicates Badge presentation locally and has no direct test; DS-04 may reconcile presentation without merging lifecycles. |
| `components/admin/B2BStatusBadge.jsx` — Inquiry/Quote/Project adapters | Operations domain composition / Operations owner | Adopted, lifecycle-bounded | Separate `inquiry`, `quote`, and `project` status-to-tone maps with localized labels; lifecycle tests cover each kind and neutral fallback behavior through Badge. | Similar colors do not merge resources or transitions. API requires both `kind` and `status`. |
| `components/admin/PortfolioStatusBadge.jsx` — portfolio adapter | Operations domain composition / Operations owner | Adopted, lifecycle-bounded | Portfolio status-to-tone map and localized label; lifecycle test covers published state. | Publishing authority, transition, schedule, and rollback stay domain-owned. |
| `components/admin/RetailOrderStatusBadge.jsx` — Retail Order adapter | Operations domain composition / Operations owner | Adopted, lifecycle-bounded | Retail Order status-to-tone map and localized label; lifecycle tests cover ready-to-ship and unknown fallback. | No payment/provider truth or transition authority; no reuse for legacy Order or Work Order. |
| `components/admin/WorkOrderStatusBadge.jsx` — Work Order adapter | Operations domain composition / Operations owner | Adopted, lifecycle-bounded | Work Order status-to-tone map and localized label; lifecycle test covers cancelled state. | Work Order only; no Retail Order/B2B Project lifecycle merging. |
| `components/admin/ConfirmSendDialog.jsx` — send confirmation | Operations feature composition / Operations owner | Adopted per feature | Controlled open state, immutable recipient/subject/message preview, cancel, irreversible-send warning, and loading-disabled actions; composes Dialog/Button. | Notifications page only. Final send authority and recipient truth remain API-owned. No direct test; copy is currently Indonesian-only. |
| `components/admin/DevelopmentMediaUpload.jsx` — development upload gate | Operations feature composition / Operations owner; provider boundary review | Adopted per feature, environment-bounded | Capability loading, inactive, active, uploading, success callback/toast, and failure toast; hides control unless capability is active; dedicated tests verify inactive and local upload. | Development-only local media. Does not activate production upload/storage. Failure is currently toast-only and needs visible-state review in DS-03/OPS-06. |
| `components/admin/NotificationBell.jsx` — system feed disclosure | Operations feature composition / Operations owner | Adopted per feature | Loading, error with retry, empty, unread, open/closed, read, mark-all-read, outside click, Escape/focus return, server-derived deep links; dedicated recovery test. | System feed only, not outbound communication. Silent read failures preserve visible state rather than claim success. Route destinations remain server/domain-owned. |
| `components/admin/UserSelector.jsx` — customer combobox | Operations feature composition / Operations owner | Adopted per feature | Loading, error, empty/no-match, open/closed, selected, clear, disabled; ARIA combobox/listbox, Arrow/Home/End/Enter/Escape, active descendant, focus return, outside click; dedicated tests plus reduced-motion contract. | Notifications page only at this SHA. Queries `/admin/customers`; it is not a universal search primitive and does not define permission. |

<!-- markdownlint-enable MD013 -->

## 6. Exact direct-consumer and test ledger

The following table is the reviewable import graph. A test listed as
"contract" may read source statically rather than import the component.

### 6.1 Shared UI modules

<!-- markdownlint-disable MD013 -->

| Module | Direct non-test consumers | Direct or contract test evidence |
| --- | --- | --- |
| `components/ui/alert-dialog.jsx` | `pages/admin/PortfolioAdmin.jsx` | No direct component test. |
| `components/ui/alert.jsx` | `pages/admin/{AdminLogin,ContentEditor,Customers,Orders,ProductEditor,Users}.jsx`; `pages/auth/{CustomerLogin,ForgotPassword,ResetPassword,StaffInvitationAccept}.jsx`; `pages/operational/{ClientDashboard,OrderDetail}.jsx`; `pages/retail/{RetailCatalogPage,RetailProductPage}.jsx` | `components/ui/nds-foundation-primitives.test.jsx` |
| `components/ui/badge.jsx` | `components/admin/{B2BStatusBadge,PortfolioStatusBadge,RetailOrderStatusBadge,WorkOrderStatusBadge}.jsx`; `components/operational/LegacyOrderStatusBadge.jsx` | `components/ui/design-system-foundation.contract.test.js`; adapters in `components/admin/LifecycleStatusBadge.test.jsx` |
| `components/ui/button.jsx` | `components/admin/{ConfirmSendDialog,DevelopmentMediaUpload,NotificationBell,UserSelector}.jsx`; `components/ui/{alert-dialog,error-state,operational-state}.jsx`; `pages/admin/{AdminLayout,AdminLogin,B2BDetail,B2BList,Catalog,ContentEditor,Customers,ForbiddenPage,Inventory,Materials,NotificationFeed,Notifications,Orders,PortfolioAdmin,PortfolioDetail,ProductEditor,ProjectWorkOrders,QuoteRevisionEditor,RestockAlerts,Settings,StockMovements,Users,WorkOrderDetail}.jsx`; `pages/auth/{CustomerLogin,ForgotPassword,ResetPassword,ResetPasswordState,StaffInvitationAccept}.jsx`; `pages/marketing/HomePage.jsx`; `pages/operational/{ClientDashboard,NewOrder,OrderDetail}.jsx`; `pages/retail/{RetailCatalogPage,RetailProductPage}.jsx` | `components/ui/{design-system-foundation.contract.test.js,nds-foundation-primitives.test.jsx,motion-accessibility.contract.test.js}` |
| `components/ui/dialog.jsx` | `components/admin/ConfirmSendDialog.jsx`; `pages/admin/{Catalog,ContentEditor,Customers,Inventory,Materials,Orders,PortfolioAdmin,RestockAlerts,Users}.jsx` | No direct component test. |
| `components/ui/drawer.jsx` | None (`0`). | `components/ui/design-system-foundation.contract.test.js` verifies no consumer and undeclared dependency quarantine. |
| `components/ui/empty-state.jsx` | `components/ui/responsive-table.jsx`; `pages/admin/{AdminDashboard,Catalog,Contacts,ContentEditor,Customers,Inventory,Materials,Orders,PortfolioAdmin,ProductEditor,RestockAlerts,StockMovements,Users}.jsx`; `pages/marketing/{CapabilitiesPage,ProjectsPage}.jsx`; `pages/retail/RetailCatalogPage.jsx` | `components/ui/motion-accessibility.contract.test.js`; consumer tests mock it but do not constitute direct behavior coverage. |
| `components/ui/error-state.jsx` | `pages/admin/{AdminDashboard,Catalog,ContentEditor,Customers,Inventory,Materials,Notifications,Orders,ProductEditor,RestockAlerts,Settings,StockMovements,Users}.jsx`; `pages/marketing/{AboutPage,CapabilitiesPage,ContactPage,ProjectsPage}.jsx` | No direct component test; selected consumer suites mock it. |
| `components/ui/form-field.jsx` | `pages/admin/{AdminDashboard,AdminLogin,Catalog,ContentEditor,Customers,Inventory,Materials,Notifications,Orders,PortfolioAdmin,ProductEditor,RestockAlerts,Settings,StockMovements,Users}.jsx`; `pages/auth/{CustomerLogin,ForgotPassword,ResetPassword,StaffInvitationAccept}.jsx` | `components/ui/nds-foundation-primitives.test.jsx` |
| `components/ui/input.jsx` | `components/admin/UserSelector.jsx`; `components/brand/BrandSystem.jsx`; `pages/admin/{AdminDashboard,AdminLogin,B2BDetail,Catalog,ContentEditor,Customers,Inventory,Materials,Notifications,Orders,PortfolioAdmin,PortfolioDetail,ProductEditor,ProjectWorkOrders,QuoteRevisionEditor,Settings,StockMovements,Users,WorkOrderDetail}.jsx`; `pages/auth/{CustomerLogin,ForgotPassword,ResetPassword,StaffInvitationAccept}.jsx` | `components/ui/nds-foundation-primitives.test.jsx`; static foundation contract. |
| `components/ui/label.jsx` | `components/brand/BrandSystem.jsx`; `components/ui/form-field.jsx`; `pages/admin/{AdminLogin,Catalog,ContentEditor,Materials,PortfolioDetail,ProjectWorkOrders,QuoteRevisionEditor}.jsx` | Indirectly exercised through FormField; no direct Label test. |
| `components/ui/operational-state.jsx` | `pages/admin/{B2BDetail,B2BList,Contacts,NotificationFeed,PortfolioDetail,QuoteRevisionEditor,RetailOrderDetail,WorkOrderDetail}.jsx`; `pages/operational/{ClientDashboard,OrderDetail}.jsx`; `pages/retail/{RetailCatalogPage,RetailProductPage}.jsx` | `components/ui/{operational-state.test.jsx,motion-accessibility.contract.test.js}`; `pages/operational/customer-portal-surface.contract.test.js` |
| `components/ui/progress.jsx` | None (`0`). | None. |
| `components/ui/responsive-table.jsx` | None (`0`). | `components/ui/motion-accessibility.contract.test.js` checks reduced-motion source only. |
| `components/ui/select.jsx` | `pages/admin/{Catalog,ContentEditor,Inventory,Materials,Notifications,Orders,ProductEditor,RestockAlerts,StockMovements}.jsx` | Static controls coverage in `components/ui/design-system-foundation.contract.test.js`; no interaction test. |
| `components/ui/separator.jsx` | None (`0`). | None. |
| `components/ui/skeleton.jsx` | `components/ui/stat-card.jsx`; `pages/admin/{AdminDashboard,Catalog,Contacts,ContentEditor,Inventory,Materials,Notifications,Orders,PortfolioAdmin,ProductEditor,RestockAlerts,Settings,StockMovements,Users}.jsx`; `pages/marketing/ProjectsPage.jsx`; `pages/retail/{RetailCatalogPage,RetailProductPage}.jsx` | `components/ui/{nds-foundation-primitives.test.jsx,motion-accessibility.contract.test.js}` |
| `components/ui/sonner.jsx` | `App.js` | No direct wrapper test. |
| `components/ui/stat-card.jsx` | None (`0`). | None. |
| `components/ui/surface-panel.jsx` | `components/auth/AuthShell.jsx`; `components/ui/{responsive-table,stat-card}.jsx`; `pages/admin/{AdminDashboard,B2BDetail,B2BList,Catalog,Contacts,ContentEditor,Customers,Inventory,Materials,NotificationFeed,Notifications,Orders,PortfolioAdmin,PortfolioDetail,ProductEditor,ProjectWorkOrders,QuoteRevisionEditor,RestockAlerts,RetailOrderDetail,Settings,StockMovements,Users,WorkOrderDetail}.jsx`; `pages/operational/{ClientDashboard,NewOrder,OrderDetail}.jsx` | `components/ui/design-system-foundation.contract.test.js`; consumer surface contracts. |
| `components/ui/switch.jsx` | `pages/admin/{Materials,PortfolioAdmin,ProductEditor}.jsx` | Static controls coverage in `components/ui/design-system-foundation.contract.test.js`; no interaction test. |
| `components/ui/table.jsx` | `components/ui/responsive-table.jsx`; `pages/admin/{Catalog,ContentEditor,Customers,Inventory,Materials,Notifications,Orders,RestockAlerts,StockMovements,Users}.jsx`; `pages/operational/ClientDashboard.jsx` | Consumer surface tests/contracts; no direct table test. |
| `components/ui/tabs.jsx` | `pages/admin/ProductEditor.jsx` | Static controls coverage in `components/ui/design-system-foundation.contract.test.js`; no interaction test. |
| `components/ui/technical-label.jsx` | `pages/admin/{Catalog,ContentEditor,Inventory,Materials,NotificationFeed,PortfolioAdmin,ProductEditor,RestockAlerts,RetailOrderDetail,Settings,StockMovements,WorkOrderDetail}.jsx` | No direct component test. |
| `components/ui/textarea.jsx` | `components/brand/BrandSystem.jsx`; `pages/admin/{Catalog,ContentEditor,Inventory,Materials,Notifications,PortfolioAdmin,ProductEditor,QuoteRevisionEditor,RestockAlerts}.jsx` | Static foundation contract; no direct behavior test. |
| `components/ui/tooltip.jsx` | None (`0`). | None. |

<!-- markdownlint-enable MD013 -->

### 6.2 Identity, shell, and surface/domain modules

<!-- markdownlint-disable MD013 -->

| Module | Direct non-test consumers | Direct or contract test evidence |
| --- | --- | --- |
| `components/brand/BrandIdentity.jsx` | `components/layout/{Footer,Navbar}.jsx`; `pages/admin/AdminLayout.jsx`; `pages/brand-lab/{BrandPrototypeShell,EditorialHomepagePrototype,ExperimentalHomepagePrototype}.jsx` | No direct component test; exercised through Footer/Navbar suites. |
| `components/brand/BrandSystem.jsx` | `pages/marketing/{AboutPage,CapabilitiesPage,ContactPage,FaqPage,NotFoundPage,PrivacyPolicyPage,ProjectsPage}.jsx`; `pages/retail/{RetailCatalogPage,RetailProductPage}.jsx` | `components/brand/BrandSystem.contact-localization.test.jsx`; page state tests. |
| `components/brand/CompanyProfileBlocks.jsx` | `components/brand/BrandSystem.jsx`; `lib/publicSettings.js`; `pages/brand-lab/prototypeContent.js`; `pages/marketing/{AboutPage,CapabilitiesPage,ContactPage,FaqPage,HomePage,NotFoundPage,PrivacyPolicyPage,ProjectsPage}.jsx` | No direct module test; selected Public page tests mock individual exports. |
| `components/brand/Logo.jsx` | `components/auth/AuthShell.jsx` | Exercised through `components/auth/AuthShell.test.jsx`; no direct identity test. |
| `components/layout/Footer.jsx` | `components/layout/Layout.jsx` | `components/layout/Footer.test.jsx` |
| `components/layout/Layout.jsx` | `pages/marketing/{AboutPage,CapabilitiesPage,ContactPage,FaqPage,HomePage,NotFoundPage,PrivacyPolicyPage,ProjectsPage}.jsx`; `pages/operational/{ClientDashboard,NewOrder,OrderDetail}.jsx`; `pages/retail/{RetailCatalogPage,RetailProductPage}.jsx` | `components/layout/Layout.test.jsx`; page route/state suites. |
| `components/layout/Navbar.jsx` | `components/layout/Layout.jsx` | `components/layout/{Navbar.test.jsx,Navbar.contract.test.js}`; `pages/operational/customer-portal-surface.contract.test.js` |
| `components/layout/PublicNavigation.jsx` | `components/layout/Navbar.jsx` | Covered by `components/layout/{Navbar.test.jsx,Navbar.contract.test.js}` |
| `components/layout/OperationalNavigation.jsx` | `components/layout/Navbar.jsx` | Covered by `components/layout/{Navbar.test.jsx,Navbar.contract.test.js}` and customer-portal surface contract. |
| `components/layout/navigationStyles.js` | `components/layout/{OperationalNavigation,PublicNavigation}.jsx` | Static assertions in `components/layout/Navbar.contract.test.js`; no isolated helper test. |
| `components/auth/AuthShell.jsx` | `pages/admin/AdminLogin.jsx`; `pages/auth/{CustomerLogin,ForgotPassword,ResetPassword,ResetPasswordState,StaffInvitationAccept}.jsx` | `components/auth/AuthShell.test.jsx`; auth surface contract. |
| `components/auth/ProtectedRoute.jsx` | `App.js` | `components/auth/ProtectedRoute.test.jsx`; route contracts. |
| `components/retail/RetailProductVisual.jsx` | `pages/retail/{RetailCatalogPage,RetailProductPage}.jsx` | `components/retail/RetailProductVisual.test.jsx`; `pages/retail/retail-surface.contract.test.js` |
| `components/operational/LegacyOrderStatusBadge.jsx` | `components/operational/StatusStepper.jsx`; `pages/admin/Orders.jsx`; `pages/operational/{ClientDashboard,OrderDetail}.jsx` | `components/admin/LifecycleStatusBadge.test.jsx`; `components/operational/StatusStepper.test.jsx` |
| `components/operational/StatusStepper.jsx` | `pages/operational/OrderDetail.jsx` | `components/operational/StatusStepper.test.jsx`; `pages/operational/customer-portal-surface.contract.test.js` |
| `components/admin/AccountStatusBadge.jsx` | `pages/admin/{Customers,Users}.jsx` | No direct component test. |
| `components/admin/B2BStatusBadge.jsx` | `pages/admin/{B2BDetail,B2BList}.jsx` | `components/admin/LifecycleStatusBadge.test.jsx` |
| `components/admin/PortfolioStatusBadge.jsx` | `pages/admin/{PortfolioAdmin,PortfolioDetail}.jsx` | `components/admin/LifecycleStatusBadge.test.jsx` |
| `components/admin/RetailOrderStatusBadge.jsx` | `pages/admin/{B2BList,RetailOrderDetail}.jsx` | `components/admin/LifecycleStatusBadge.test.jsx` |
| `components/admin/WorkOrderStatusBadge.jsx` | `pages/admin/{B2BList,ProjectWorkOrders,WorkOrderDetail}.jsx` | `components/admin/LifecycleStatusBadge.test.jsx` |
| `components/admin/ConfirmSendDialog.jsx` | `pages/admin/Notifications.jsx` | No direct component test. |
| `components/admin/DevelopmentMediaUpload.jsx` | `pages/admin/{PortfolioAdmin,ProductEditor}.jsx` | `components/admin/DevelopmentMediaUpload.test.jsx` |
| `components/admin/NotificationBell.jsx` | `pages/admin/AdminLayout.jsx` | `components/admin/NotificationBell.test.jsx`; notification-feed contracts. |
| `components/admin/UserSelector.jsx` | `pages/admin/Notifications.jsx` | `components/admin/UserSelector.test.jsx`; `components/ui/motion-accessibility.contract.test.js` |

<!-- markdownlint-enable MD013 -->

## 7. Named-export and zero-consumer findings

### 7.1 Zero-consumer modules

Six complete modules have no current non-test importer:

| Module | Status | Gate |
| --- | --- | --- |
| `components/ui/progress.jsx` | Provisional | Real determinate use, semantic/token review, accessibility, tests, and two-consumer promotion evidence. |
| `components/ui/responsive-table.jsx` | Provisional | Keyboard-complete row actions, domain mobile anatomy, loading/empty/error, responsive evidence, and bounded adoption. |
| `components/ui/separator.jsx` | Provisional | Prove native layout/border is insufficient and avoid decorative-line repetition. |
| `components/ui/stat-card.jsx` | Provisional | Factual Operations need, flat-first redesign, state/content contract, and no fake KPI. |
| `components/ui/tooltip.jsx` | Provisional | Supplemental-only need, keyboard/touch behavior, no hidden required information, and tests. |
| `components/ui/drawer.jsx` | Quarantined | Resolve or remove undeclared `vaul` only through a separate dependency/adoption or retirement decision. |

An adopted module can still contain an export with no external importer. That
does not make the export adopted independently. Current examples include:

- `BrandSystem.BrandButton` (re-export only);
- `CompanyProfileBlocks` historical/local exports such as `SectionShell`,
  `TransformationPath`, `ServiceGrid`, and `ProjectGrid`;
- root/portal/overlay helpers consumed only inside their own Dialog modules;
- `SkeletonGroup`, currently production-unused but tested inside the adopted
  Skeleton module; and
- `Logo`, used internally by the one-consumer `LogoWordmark` module.

Export-level retirement needs exact history and transitive internal-use review;
`DS-01A` does not propose deletion.

### 7.2 Duplicate or overlapping responsibilities

These are reconciliation findings, not implementation instructions:

1. **Action mechanics:** shared `Button` and Public `BrandButton` both own
   focus, variants, unavailable behavior, and motion. `BrandButton` also exists
   in `CompanyProfileBlocks` and is re-exported from `BrandSystem`. Its link
   branches expose `aria-disabled` without the shared Button's event blocking
   and tab-order contract, and use `transition-all`/scale feedback.
2. **Identity:** `BrandIdentity` uses the official asset, while
   `Logo`/`LogoWordmark` renders a separate inline mark for Auth. This is a
   compatibility split, not evidence for two durable identity systems.
3. **State presentation:** `EmptyState.loading`, Skeleton, and
   `OperationalState.loading` overlap. Their intended distinctions—shape
   preview, task loading, and no-data meaning—must be completed in `DS-03`.
4. **Status presentation:** five lifecycle adapters use shared `Badge`, while
   `AccountStatusBadge` renders a local span/tone map. Lifecycle ownership must
   remain separate even if presentation later converges.
5. **Public versus Commerce composition:** `MarketingLayout`,
   `BrandSystem.MarketingSection`, and `BrandSystem.PageContainer` currently
   serve Retail catalog/product pages. These are compatibility consumers, not
   proof that Public composition is a universal Commerce template.
6. **Transient feedback entry:** `App.js` uses the local Toaster adapter, but
   `22` other current source modules import `toast` directly from `sonner`.
   This is an ownership/convergence question for `DS-03`, not a dependency or
   API change in this task.

### 7.3 Current API and evidence drift

- `TechnicalLabel` now has 12 direct implementation consumers; the active
  register's prior count of 13 included a Brand Lab consumer no longer present.
- `BrandIdentity` accepts `variant` and `className`; `AdminLayout` passes
  unsupported `variant="mark"` and `size={28}`. React ignores the extra size
  at the component boundary, so current output follows the nav branch.
- Framer Motion is not installed and has no source consumer at this SHA. It
  remains donor/reference-only unless a later intake and dependency decision
  says otherwise.
- `Drawer` still imports `vaul`, while manifest and lockfile contain no `vaul`
  package. Its quarantine remains current and test-enforced.

## 8. Dependency boundary

<!-- markdownlint-disable MD013 -->

| Dependency or source relationship | Current exact-SHA evidence | Disposition |
| --- | --- | --- |
| Radix AlertDialog, Dialog, Label, Progress, Select, Separator, Slot, Switch, Tabs, Tooltip | Installed and imported by the named local wrappers; Progress/Separator/Tooltip still have zero consumers. | Preserve wrapper boundary; installed package does not promote an unused wrapper. |
| CVA | Used by local Alert, Badge, Button, EmptyState, Label, Skeleton, SurfacePanel, and TechnicalLabel contracts. | Runtime dependency behind Niuva-owned APIs. |
| Lucide | Used across shared and surface/domain components. | Icons supplement visible names/status; never color-only meaning. |
| GSAP and `@gsap/react` | Installed; one component module consumer: `components/brand/BrandSystem.jsx`. | Existing bounded Public exception only; no broader adoption. |
| Sonner | Local Toaster adapter in `App.js`; 22 additional modules import package `toast` directly. | Adopted transient feedback only; critical state stays visible in-page. |
| Recharts | Installed; one non-test page consumer in `pages/admin/AdminDashboard.jsx`, outside the component ledger. | Factual Operations data only; no permanent visualization-library decision inferred. |
| Framer Motion | No manifest, lockfile, or source evidence. | Reference-only unless separately reviewed; no removal task is needed from this SHA evidence. |
| Vaul | Imported only by zero-consumer Drawer; absent from manifest and lockfile. | Undeclared and quarantined; do not install or import. |
| React Bits, Magic UI, and similar catalogs | No runtime relationship established by this ledger. | Donor/reference only; intake needs provenance, license, dependency, accessibility, motion, performance, owner, and removal evidence. |

<!-- markdownlint-enable MD013 -->

## 9. Verification

Verification completed on the selected SHA:

- source-to-ledger reconciliation found all `50/50` non-test component modules
  and no missing module path;
- static import and named-export inspection reconciled direct consumers,
  zero-consumer modules, package boundaries, and the 12-consumer
  `TechnicalLabel` drift;
- relative links in this ledger resolved successfully;
- `17/17` focused component and contract suites passed with `99/99` tests;
- `git diff --check` and no-index whitespace checks for the three DS-01A
  artifacts reported no whitespace error; Git emitted only the repository's
  Windows LF-to-CRLF working-copy warning;
- Markdownlint was unavailable and was not installed; and
- `npm ci --no-audit --no-fund` created only ignored local `node_modules` for
  verification. The package manifest, lockfile, application source, runtime
  tokens, and dependencies did not change.

No build, browser session, screenshot critique, or Impeccable detector was run
because `DS-01A` changes documentation only and makes no visual/runtime claim.
The worktree reports only the untracked `.design/niuva-frontend-blueprint/`
candidate working set; `HEAD` and `origin/main` remain equal at the selected
SHA.

## 10. DS-01A disposition and next gate

`DS-01A` establishes the following bounded facts:

- all 50 current component modules are mapped to a layer, owner, carried
  status, current state/interaction evidence, exact direct consumers, tests,
  and restrictions;
- the six zero-consumer modules, compatibility consumers, duplicate/overlap
  areas, source/register drift, and Drawer quarantine are explicit;
- current statuses are evidence-bound and no file is promoted, deprecated,
  retired, moved, renamed, or redesigned;
- current component test gaps are visible rather than converted into false
  completion claims; and
- route responsibility, aliases, reserved paths, and prototypes beyond their
  direct imports remain for `DS-01B`.

Owner review of this bounded ledger completed on 18 August 2026. The approval
accepts the recorded exact-SHA inventory and limitations; it does not convert
any carried status, finding, or follow-up into implementation authority.

The next recommended task is `DS-01B`, but it requires a separate owner gate.
This ledger does not authorize starting it.

## 11. Explicit exclusions

This task does not authorize or perform:

- application source, test, CSS, token, Tailwind, package, route, redirect,
  sitemap, CMS, API, schema, provider, or business-rule changes;
- component adoption, promotion, deprecation, retirement, rename, move, API
  change, or consumer migration;
- installing `vaul`, Framer Motion, a donor catalog, Storybook, or any other
  dependency;
- activating Commerce checkout, upload, payment, storage, registration,
  project detail, or any reserved capability;
- canonical promotion or replacement of the active component register; or
- stage, commit, push, PR, merge, deployment, readiness, or go-live.

## Self-review

- [x] Component and consumer records are tied to the selected SHA.
- [x] Adopted, provisional, quarantined, compatibility, and zero-consumer
  statuses are not silently promoted or retired.
- [x] No source, dependency, API, lifecycle, or delivery behavior changed.

**Self-review result:** Pass; exact-SHA DS-01A ledger retained for owner review.
