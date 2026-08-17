# Preliminary Cross-Surface Frontend Contract and Design-Token Inventory

**Status:** Owner-approved audit direction — read-only preliminary inventory;
no source migration authority

**Date:** 17 August 2026

**Baseline:** `origin/main`
`2a8b50050b1545eeebfaa50d61e94ed7b58e40ef`

**Purpose:** Establish an evidence-bound starting point for a later Frontend
contract decision. This report inventories routes, surfaces, user flows,
states, shared components, tokens, compatibility aliases, and consumers. It
does not choose a new palette, change values, migrate a consumer, or authorize
a page redesign.

## 1. Evidence scope

Inspected:

- `frontend/src/index.css`;
- `frontend/tailwind.config.js`;
- `frontend/src/App.js` and `frontend/src/lib/publicRoutes.js`;
- CSS-variable consumers under `frontend/src`;
- typography and monospace consumers; and
- current page and shared-component trees, contract tests, and surface
  directories under `frontend/src/pages` and `frontend/src/components`.

The baseline includes the merged Homepage recovery and FDM documentation
changes at `origin/main`. Worktree-local modifications, historical prototypes,
and untracked audit files are not treated as canonical source evidence.

## 2. Current inventory measurements

| Measure | Observation | Interpretation |
| --- | ---: | --- |
| Unique custom-property definitions in `frontend/src/index.css` | 285 | One large root registry combines NDS roles, compatibility aliases, operational HSL/shadcn aliases, typography, spacing, shape, elevation, and motion. |
| Unique `var(--...)` names consumed under `frontend/src` | 198 | Consumer attribution is incomplete until Tailwind-generated utilities and CSS indirection are included. |
| Direct CSS-variable references in `frontend/src/pages` | 404 | Page code is the dominant direct consumer area in this baseline. |
| Direct CSS-variable references in `frontend/src/components` | 33 | Shared components consume fewer variables directly but can fan out through Tailwind roles. |
| CSS files under `frontend/src` | 4 | `index.css`, `App.css`, Homepage R4 CSS, and Brand Lab CSS are the authored CSS surfaces. |
| `<Route path="...">` declarations in `frontend/src/App.js` | 59 | Includes Public, Retail, Customer, Auth, Operations/Admin, Brand Lab, and wildcard 404 declarations; one source line contains two Brand Lab routes. |
| Public compatibility aliases in `frontend/src/lib/publicRoutes.js` | 8 | Aliases are compatibility owners, not independent content owners. |
| Top-level page domains | 6 | `admin`, `auth`, `brand-lab`, `marketing`, `operational`, and `retail` require separate register review. |

These counts are navigation evidence, not completion or migration evidence.

## 3. Route and surface inventory

The current route declaration inventory is 59 concrete `<Route>` entries plus
8 Public compatibility aliases. The route list below is source evidence only;
it does not activate, rename, or promote any route.

### 3.1 Active route declarations

```text
/
/en
/tentang
/en/about
/layanan
/en/services
/proyek
/en/projects
/kontak
/en/contact
/privasi
/en/privacy
/faq
/en/faq
/retail
/en/retail
/retail/products/:slug
/dashboard
/order
/orders/:id
/login
/admin/login
/staff-invitation
/forgot-password
/forgot-password/check-email
/reset-password
/reset-password/success
/reset-password/error
/admin
/admin/orders
/admin/catalog
/admin/catalog/:productId
/admin/materials
/admin/inventory
/admin/stock-movements
/admin/restock-alerts
/admin/portfolio
/admin/portfolio/:id
/admin/content
/admin/contacts
/admin/inquiries
/admin/inquiries/:id
/admin/b2b/quotes
/admin/b2b/quotes/:id
/admin/b2b/quotes/:id/revision
/admin/b2b/projects
/admin/b2b/projects/:id
/admin/b2b/work-orders
/admin/b2b/work-orders/:id
/admin/retail-orders
/admin/retail-orders/:id
/admin/users
/admin/customers
/admin/notifications
/admin/communication
/admin/settings
/__brand-lab/editorial
/__brand-lab/experimental
*
```

### 3.2 Compatibility, reserved, and prototype paths

Compatibility aliases are `/about`, `/capabilities`, `/services`, `/projects`,
`/portfolio`, `/contact`, `/privacy`, and `/en/capabilities`. Reserved project
detail prefixes remain `/proyek/:slug` and `/en/projects/:slug`; they are not
active route owners. Brand Lab routes are recorded as prototype evidence and
are not a migration target.

### 3.3 Surface boundary map

| Surface | Route/page responsibilities | Contract focus |
| --- | --- | --- |
| Public/Marketing | Homepage, About, Services, Projects archive, Contact, Privacy, FAQ, 404, Navbar, Footer, Layout | Persuade, prove, explain, route; factual evidence; localized Public navigation. |
| B2B inquiry | Public form and acknowledgement/recovery states; Operations inquiry handoff | Inquiry `new`, UUID acknowledgement, consent, optional user-clicked WhatsApp; no public upload. |
| Retail/Commerce | Catalog, product/configurator, account gate, `quote_required` handoff, checkout, Order context | Server-authoritative eligibility, price, file, stock, fulfillment, payment, and Order boundaries. |
| Account/Customer | Login, recovery, dashboard, owned Order/Request/Offer, order detail | Identity, privacy, session/expiry, owned-resource state, recovery. |
| Auth/Staff | Admin login, staff invitation, password reset | Audience separation, permission, invitation constraints, safe recovery. |
| Operations/Admin | Queues, CMS, portfolio, B2B, Retail orders, inventory, users, customers, notifications, settings | Role-aware actions, lifecycle state, conflict, history, audit-safe presentation. |
| Prototype/compatibility | Brand Lab, aliases, deprecated token/font/component consumers | Evidence and migration classification only. |

## 4. User-flow and state inventory

The audit records actor, durable lifecycle owner, authoritative resource,
view-state mapping, primary action, validation, dependency/persistence
boundary, permission/privacy rule, localization requirement, and recovery
evidence for each flow.

- **Public → B2B Inquiry:** discovery → form validation → persistence attempt →
  Inquiry `new` → existing UUID acknowledgement → optional visitor-clicked
  WhatsApp → Operations triage.
- **Retail direct path:** discovery → non-authoritative configuration → account
  gate → server revalidation → eligible checkout/payment or safe blocking state.
- **Retail `quote_required`:** preserve product, variant, configuration, file,
  quantity, contact, fulfillment context, and reason without creating Order,
  reservation, payment attempt, or checkout total.
- **Customer-owned records:** authenticate → dashboard/list/detail → loading,
  empty, stale, conflict, permission, expired, offline, recovery, and success
  states without exposing internal data.
- **Operations queues:** permission → queue identity → state transition →
  conflict/history → bounded recovery and audit presentation.
- **Cross-surface locale:** Public ID/EN counterpart selection and stored
  preference while private/customer/admin routes retain owned URL context.

View labels such as `loading`, `submitting`, `validating`, and `quote_required`
remain presentation states; they are not new backend lifecycle enums.

## 5. Shared component and composition inventory

The audit includes `components/ui`, layout, brand, auth, retail, admin, and
operational components, plus page-level Public/Commerce/Account/Operations
compositions. Each record uses the NDS 13-field contract: purpose/owner/status,
use boundaries, anatomy, variants/content limits, API continuity, data and
interaction states, input/accessibility behavior, responsive overflow,
token dependencies, localization, surface/domain restrictions, anti-patterns,
and migration notes.

Adoption status must distinguish **adopted**, **provisional**, **quarantined**,
**compatibility**, **prototype**, and **retirement candidate**. Existing Button,
Input, Textarea, Label, FormField, Select, Switch, Tabs, Dialog, AlertDialog,
Alert, Skeleton, SurfacePanel, EmptyState, ErrorState, OperationalState,
status badges, and focus contracts remain compatibility evidence until a later
implementation gate proves a replacement or migration.

## 6. Token families observed

### 3.1 NDS and semantic roles

`index.css` defines Niuva blue scale values (`--nds-blue-*`), canvas/ink/border
primitives, then semantic identity, action, surface, text, border, focus,
status, disabled, overlay, and decoration roles. Tailwind maps many of these
roles to opacity-aware utilities.

### 3.2 Compatibility aliases

The same registry retains aliases such as `--color-brand-*`,
`--color-surface-page`, `--color-border-default`, legacy typography roles, and
legacy spacing/shape names. The comments state that these remain until a
separate zero-consumer migration gate.

### 3.3 Typography registers

The root contains both:

- NDS targets: Mona Sans, Bona Nova, and system technical fallback; and
- compatibility roles: Poppins, Inter in scoped workbench contexts, and
  JetBrains Mono compatibility.

`admin-workbench` and other surface scopes rebind roles locally. A migration
must therefore classify consumers by surface before changing the root role.

### 3.4 Operational HSL and shadcn-compatible aliases

`--niuva-blue`, `--sky-blue`, `--blue-dark`, `--midnight`, `--steel`,
`--smoke`, `--silver`, `--frost`, `--cloud`, `--pure-white`, plus
`--background`, `--foreground`, `--card`, `--popover`, `--primary`,
`--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`,
and `--ring` remain active compatibility families. They must not be deleted
without consumer and rollback evidence.

### 3.5 Shape, elevation, and motion

Root roles cover spacing, containers, prose measures, radii, shadows, focus,
core motion durations, and easing. Tailwind exposes these through border-radius,
box-shadow, animation, transition-duration, and timing-function maps. A direct
consumer search alone cannot classify generated utility consumers, so the
Tailwind map is part of the audit boundary.

## 7. Initial risks and questions

- Public Brand and Product/operational registers currently share one root file;
  the boundary is expressed by aliases and CSS scopes rather than separate
  registries.
- Compatibility aliases and semantic roles have overlapping names and values;
  zero-consumer status must be proven before retirement.
- Typography migration is not a simple global replacement because Public,
  Customer/Auth, Retail, and Admin/Operations have different roles and
  contracts.
- `--motion-ambient` is exposed through Tailwind configuration even when a
  direct source search does not find a `var(--motion-ambient)` call; generated
  utility consumers require a build-level check.
- Raw literals and CSS authored values need classification into token
  definitions, legitimate one-off evidence treatment, or hardcoded drift.
- Homepage-specific aliases and visual exceptions must not become a
  cross-surface token precedent before owner review.

## 8. Required next decisions

1. Approve the semantic role vocabulary and naming convention.
2. Decide the Public Brand versus Product register boundary.
3. Decide which compatibility families remain during migration and for how
   long.
4. Classify typography and motion roles per surface, including reduced motion.
5. Define consumer evidence and rollback requirements for each migration slice.

Until these decisions are recorded, no token values or consumers should be
migrated merely to make a page visually consistent.

### 8.1 Iteration and versioning rule

Page composition, spacing rhythm, imagery treatment, and motion choreography may
be iterated through bounded surface slices while preserving approved semantic
roles, state meanings, lifecycle boundaries, accessibility floors, and shared
component APIs. A change to a semantic token role, font role, component API,
shared state behavior, route contract, or lifecycle implication requires a
versioned amendment with consumer evidence, migration notes, and rollback
conditions. Compatibility aliases remain until zero-consumer evidence is
verified; visual iteration does not authorize alias deletion.

## 9. Verification record

Read-only checks performed:

- source search with `rg` for route declarations, aliases, definitions,
  consumers, typography, and raw literals;
- route and component tree reconciliation against `App.js`,
  `publicRoutes.js`, `frontend/src/pages`, and `frontend/src/components`;
- Tailwind map inspection;
- page-domain and authored-CSS inventory; and
- no application source files changed in this audit worktree; only this report
  and its task card are documentation artifacts.

No build, test, token edit, route change, provider change, lifecycle change,
or business-rule change was performed. The inventory is not migration proof.
