# Candidate Cross-Surface UX/UI Reconciliation Packet

**Status:** Candidate — `CSR-01` through `CSR-08` owner-accepted — Context
Only — not canonical and not implementation authority

**Date:** 11 August 2026

**Owner decision recorded:** 11 August 2026

**Source baseline:** `origin/main` at
`954837c9dd4fcaeb9438c16fb6934210e082a364`

**Parent design contract:**
[`2026-08-08-niuva-mvp-ux-ui-design-packet.md`](2026-08-08-niuva-mvp-ux-ui-design-packet.md)

**Current component evidence:**
[`2026-08-05-frontend-component-register.md`](../../plans/pending-reconciliation/2026-08-05-frontend-component-register.md)

**Purpose:** Reconcile the approved Niuva product and experience direction,
the current route/component implementation, and the isolated prototype
evidence into one candidate adaptation plan for existing Public, Retail,
customer, authentication, Admin, and CMS pages.

This packet answers one specific question: **how should the refined prototype
direction adapt the pages that already exist without turning every surface
into the same template or authorizing a broad rewrite?**

It does not change React, CSS, routes, APIs, schemas, permissions, providers,
data, deployment, readiness, or go-live status. It does not authorize a
production redesign, migration, dependency change, commit, push, PR, or merge.

## 1. Executive disposition

The existing pages should be **reconciled and adapted, not discarded and not
mechanically reskinned**.

The candidate cross-surface thesis is:

> **One Niuva identity, surface-native composition.** Public pages persuade
> through authentic evidence; Retail pages support safe specification and
> commerce; customer pages explain owned state and next action; Admin/CMS
> pages support repeated operational decisions, recovery, and audit.

This sentence is a packet-local design rule, not a new canonical brand name.
It implements the already approved separation between the public experience,
Retail/customer journeys, and Admin Studio without creating separate products
or visual identities.

The reconciliation result is:

1. preserve the current semantic tokens, type roles, Niuva identity, route
   ownership, permission boundaries, lifecycle-specific status components,
   and adopted UI primitives;
2. adapt page composition, information hierarchy, copy, and state visibility
   where current source does not express the approved experience strongly
   enough;
3. use the accepted public prototype direction only for the public/B2B slice;
4. create distinct composition rules for Retail, customer, authentication,
   and Admin/CMS rather than copying a public hero, open editorial sheet, or
   artifact layout into every page;
5. keep missing canonical routes as design targets only until separate
   technical and implementation gates are approved; and
6. validate a representative cross-surface prototype before any production
   implementation task card is promoted.

## 2. Authority, maturity, and exclusions

### 2.1 Reading order

When this packet conflicts with another source, use this order:

1. [`docs/NIUVA_MASTER_SPEC.md`](../../../NIUVA_MASTER_SPEC.md)
2. [`docs/context/DOCUMENT_REGISTER.md`](../../../context/DOCUMENT_REGISTER.md)
3. [`docs/decisions/DECISION_REGISTER.md`](../../../decisions/DECISION_REGISTER.md)
4. The approved decision or ADR applicable to the surface
5. The applicable runbook
6. Current source and tests as implementation evidence
7. This packet and other candidate/prototype material

The primary applicable decisions are:

- `DEC-ARCH-01` / `ADR-004` — one application and one origin with route-based
  surface boundaries;
- `DEC-UX-001` — Unified Homepage, B2B-primary, Retail secondary but visible;
- `DEC-UX-002` — Experimental Editorial Hybrid for the Homepage;
- `DEC-UX-003` — canonical MVP user-flow and route ownership;
- `DEC-OPS-001` — role-aware, task-oriented, dense but calm Admin Studio;
- `DEC-OPS-002` — reduced Admin scope and restock-alert entry treatment;
- `DEC-OPS-003` — reduced integrated structured CMS; and
- the applicable Retail, payment, inventory, ETA, fulfilment, after-sales,
  notification, access, and authentication decisions for owned states.

### 2.2 Candidate relationship to existing UX artifacts

The parent Candidate MVP UX/UI Design Packet remains the broader workflow,
state, and page contract. Its source snapshot was based on an older SHA. This
packet refreshes only the **current source reconciliation and adaptation
strategy** at the baseline named above; it does not silently promote or replace
the parent packet.

The published bounded R6 prototype is cross-surface validation evidence, not a
production UI specification. The later isolated Public Visual Refinement
prototype is local candidate evidence outside `origin/main`. Its accepted
owner selections (`OVR-01` through `OVR-06`), independent P0/P1 critique
clearance, and focused P2 revalidation may inform this packet, but they do not
become repository or canonical authority through citation here.

The Public prototype covers only:

- `/`;
- `/projects` and candidate project-detail states; and
- `/contact`.

It must not be copied directly into `frontend/` or treated as proof that About,
Capabilities, Retail, customer, authentication, Admin, or CMS pages have been
designed or implemented.

### 2.3 Explicit exclusions

This packet does not:

- approve the broader public typography rollout that remains deferred;
- approve an exact `/projects/:slug` production route;
- decide the exact Public/Retail navigation treatment or CTA wording;
- decide the exact Admin information architecture or smartphone policy;
- activate `/register`, upload, configuration, checkout, payment, logistics,
  notifications, or customer B2B portal capabilities;
- create `/retail/cart` authority or exact after-sales route authority;
- merge Retail Order with B2B Quote/Project or Assisted Retail Offer;
- change authorization, customer-data projections, lifecycle transitions,
  persistence, API, or database contracts;
- select a new UI library, font family, icon family, motion library, or design
  token system; or
- authorize source changes, canonical promotion, publication, moderated
  research, deployment, production readiness, or go-live.

## 3. Method and evidence baseline

### 3.1 Workflow application

Impeccable is the primary workflow for this packet. Its adaptation method is
applied as follows:

- understand the current system before proposing a redesign;
- keep a separate brand register and product/operation register;
- rethink composition for each context rather than shrinking one layout;
- preserve identity and meaningful interaction contracts;
- replace generic visual habits only when they obscure the page's job; and
- define visual evidence gates instead of treating a mechanical detector as a
  design-quality verdict.

Supporting references contributed bounded concerns only:

<!-- markdownlint-disable MD013 -->

| Reference | Applied concern | Explicit limit |
| --- | --- | --- |
| Frontend Design | Intentional composition, route-specific hierarchy, responsive authorship | Does not override Niuva typography, palette, or canonical route decisions |
| Frontend Dev | Feasible component reuse, responsive states, motion restraint, implementation seams | Does not authorize source work, dependencies, cinematic motion, or a replacement UI stack |
| Fullstack Dev | Authentication, permission, data, error, and lifecycle boundary awareness | Does not create API/schema/provider decisions |
| Effective HTML | Semantic landmarks, native controls, progressive disclosure, and content-first reading | No standalone HTML artifact is created by this documentation task |
| Baoyu Design | Existing design-system discovery and evidence-led component selection | No generated design system or new artifact format replaces repository contracts |
| Design Review | Screenshot-based comparison and severity-based critique gates | No screenshot review is claimed for this documentation-only pass |
| Emil Design Engineering | Purposeful interaction feedback and restrained motion | Motion remains subordinate to Niuva accessibility and operational constraints |
| UI/UX Pro Max | Responsive, accessibility, interaction, and performance floors | Its generic style recommendations do not replace canonical Niuva tokens |
| Taste / anti-generic references | Public-page composition critique and anti-template checks | Not applied as a dashboard or workflow-layout template |

<!-- markdownlint-enable MD013 -->

Canonical Niuva rules override any reference advice that would ban the approved
blue palette, replace Poppins/Inter, add dark mode, introduce external fonts,
or force landing-page composition into task-oriented screens.

### 3.2 Repository inspection basis

The audit used a clean worktree created from the fetched `origin/main` SHA
above. It inspected:

- canonical and orientation documents;
- the route table in `frontend/src/App.js`;
- semantic tokens in `frontend/src/index.css` and
  `frontend/tailwind.config.js`;
- Public and Operational navigation composition;
- `MarketingLayout`, `OperationalLayout`, `AdminLayout`, and `AuthShell`;
- current Public, Retail, customer, and representative Admin pages;
- route-to-permission evidence in `frontend/src/lib/permissions.js`;
- role-aware Admin grouping in `frontend/src/lib/adminWorkbench.js`;
- adopted, provisional, and quarantined component contracts; and
- existing source tests as available implementation evidence.

No browser session or application test was required to write this packet. A
later visual prototype must produce its own exact browser evidence.

### 3.3 Classification vocabulary

<!-- markdownlint-disable MD013 -->

| Classification | Meaning in this packet |
| --- | --- |
| `PRESERVE` | Existing responsibility and composition are a valid baseline; later work is bounded polish or state completion. |
| `ADAPT` | Preserve route, data, lifecycle, permissions, and reusable components; revise information hierarchy, composition, copy, or state visibility. |
| `RECOMPOSE` | Current page structure is not an adequate target, but its valid domain behavior must survive a future page-level redesign. |
| `COMPATIBILITY` | Preserve redirect, unavailable state, or read-only archive; do not turn it into a new primary workflow. |
| `TARGET-MISSING` | Canonical target exists but current route/page is absent or partial; design may document it, but implementation remains separately gated. |
| `CANDIDATE-TBD` | Exact route, composition, or policy is not canonical; show only a labelled conceptual state if needed. |
| `DEFER` | Excluded from the next representative prototype or blocked by an unresolved authority/activation gate. |

<!-- markdownlint-enable MD013 -->

These labels are recommendations for review. They do not authorize the action
named by the label.

## 4. Current surface and route reconciliation

### 4.1 Public, brand, legal, and support routes

<!-- markdownlint-disable MD013 -->

| Route / family | Current evidence at baseline | Candidate disposition | Adaptation contract | Gate retained |
| --- | --- | --- | --- | --- |
| `/` | Existing B2B-primary Home with authentic project media and a Retail discovery path | `ADAPT` | Use the accepted Evidence-led Prototyping Editorial direction as a visual reference; preserve the canonical two-journey hierarchy and exactly bounded U-curve semantics | Production composition, exact CTA/navigation, source task card |
| `/about` | Existing CMS-backed public page with loading/invalid handling | `ADAPT`, later public slice | Build a company/approach reading rhythm from factual identity and method; do not clone the Home hero-section sequence | Broader public typography and visual rollout remain deferred |
| `/capabilities` | Existing CMS-backed canonical service overview | `ADAPT`, later public slice | Organize four service families around decisions, methods, outputs, and evidence; avoid equal generic feature cards | Exact content schema, CTA/navigation, source authorization |
| `/services` | Existing redirect to `/capabilities` | `COMPATIBILITY` | No independent visual page, CMS record, or analytics identity | Redirect implementation remains current evidence only |
| `/projects` | Existing portfolio list with loading/error/invalid/empty states | `ADAPT` | Move from repeated card-template reading toward artifact-led comparison while preserving truthful publication data and safe empty states | Broader public rollout; exact detail-route contract |
| `/projects/:slug` | Present only in isolated prototype, not current route table or approved exact route contract | `CANDIDATE-TBD` | A project-detail state may be prototyped for reading quality, but must not be described as a canonical production route | Explicit route/product decision before source work |
| `/portfolio` | Existing redirect to `/projects` | `COMPATIBILITY` | No separate visual ownership | Preserve canonical alias behavior |
| `/contact` | Existing Inquiry payload/validation/UUID acknowledgement; current hero gives WhatsApp primary emphasis and lacks the complete canonical consent/response presentation | `RECOMPOSE` with behavior preservation | Make persisted form primary; show exact consent, owner/calendar/one-working-day target, safe acknowledgement, then optional user-clicked WhatsApp continuation; never show recorded-Inquiry success before persistence | Runtime field/privacy/idempotency/abuse/settings review and source task card |
| `/privacy` | Existing public policy page | `PRESERVE` and readability review | Prioritize legibility, version/contact context, and safe unavailable state; no marketing spectacle | Legal/privacy publication approval |
| `/faq` | Existing CMS-backed FAQ with content states | `PRESERVE` and content adaptation | Searchable/scannable answers, clear category/empty/no-result behavior, and routes to the right journey | Approved final content and support ownership |
| `*` / Not Found | Existing public fallback | `PRESERVE` | Plain recovery to Home, Retail, or Contact without exposing internal route structure | None beyond normal source approval |
| `/__brand-lab/editorial`, `/__brand-lab/experimental` | Environment-conditional internal prototypes | `DEFER` | Keep outside participant navigation and production identity decisions | Separate cleanup/retention decision |

<!-- markdownlint-enable MD013 -->

### 4.2 Retail discovery and transactional targets

<!-- markdownlint-disable MD013 -->

| Route / family | Current evidence at baseline | Candidate disposition | Adaptation contract | Gate retained |
| --- | --- | --- | --- | --- |
| `/retail` | Active read-only catalog discovery with loading, unavailable, error, empty, filter, pagination, and safe transaction-inactive copy | `ADAPT` | Preserve the public shell but introduce commerce-specific hierarchy: product type, published price semantics, availability, filters, and next action; no marketplace-first treatment | Transaction activation, final IA, visual prototype |
| `/retail/products/:slug` | Active read-only product detail with published price/availability and safe CTA states | `ADAPT` | Preserve authoritative publication data; create a stable object/specification summary and explicit `discovery_only`, unavailable, or `quote_required` meaning | Configuration/upload/request/checkout activation |
| `/retail/products/:slug/configure` | Canonical route absent from source | `TARGET-MISSING` | Simple and Detailed modes, authenticated private-file boundary, visible calculation inputs, safe analysis, and explicit eligible versus `quote_required` outcome | File/storage/slicer/profile/pricing/auth/API decisions and implementation |
| `/retail/requests/:requestId` | Canonical route absent from source | `TARGET-MISSING` | Owned retained context, safe reason/status, route outcome, and next action; no Order, reservation, payment attempt, or checkout total | Request aggregate/API/permission implementation |
| `/retail/offers/:offerId` | Canonical route absent from source | `TARGET-MISSING` | One immutable offer version, approved commercial snapshot, expiry/status, accept/decline; acceptance still requires normal checkout | Offer expiry, approval, API, transaction activation |
| `/retail/checkout` | Canonical route absent from source | `TARGET-MISSING` | Provider-neutral commitment review with visible stock/price/ETA/shipping deltas, reconfirmation, payment uncertainty protection, and owned Order return | Tax, fulfilment, payment provider, transactions, reservation, readiness |
| `/retail/cart` | Exact durable route not selected canonically | `CANDIDATE-TBD` | At most a labelled non-authoritative draft concept; never reserve stock or claim authoritative price | Exact route/state ownership decision |

<!-- markdownlint-enable MD013 -->

### 4.3 Customer account, Order, and authentication routes

<!-- markdownlint-disable MD013 -->

| Route / family | Current evidence at baseline | Candidate disposition | Adaptation contract | Gate retained |
| --- | --- | --- | --- | --- |
| `/login` | Existing customer login with customer-specific AuthShell audience | `PRESERVE` and state adaptation | Keep customer language, recovery, allowlisted continuation, loading, generic failure, and focus recovery distinct from staff login | Session/runtime and continuation validation |
| `/admin/login` | Existing staff login with staff-specific AuthShell audience | `PRESERVE` and state adaptation | Keep internal trust, MFA/readiness boundaries, and support wording separate from customer login | Authentication decisions and environment evidence |
| `/staff-invitation` | Existing staff invitation acceptance | `PRESERVE` | Clear policy, invalid/expired/unavailable, success, and next sign-in action | Identity/provider/runtime evidence |
| `/forgot-password`, `/forgot-password/check-email`, `/reset-password`, `/reset-password/success`, `/reset-password/error` | Existing shared recovery family with explicit audience handling | `PRESERVE` | Maintain non-enumerating acknowledgement, invalid/expired token, policy-unavailable, retry, success, and correct audience return | Runtime delivery and security evidence |
| `/register` | Canonical reserved route absent from source | `TARGET-MISSING`, inactive | A design may show the activation boundary only; it must not offer active registration before verification, abuse, recovery, and activation contracts exist | Separate registration decision and implementation |
| `/dashboard` | Existing authenticated legacy Order summary with loading/error/empty/mobile list | `ADAPT` | Evolve toward an owned activity home led by current status and next action across approved Retail resources; preserve customer-safe projections | New Request/Offer/Order/notification APIs and route work |
| `/dashboard/notifications` | Canonical route absent from source | `TARGET-MISSING` | Recipient-scoped feed with safe owned deep links, empty/loading/delivery-exhausted states, and no internal payload leakage | Notification mapping, delivery/runtime, implementation |
| `/order` | Existing safe inactive compatibility destination linking to Retail and Dashboard | `COMPATIBILITY` | Preserve unavailable behavior until authorized redirect timing; never restore legacy create/upload/checkout controls | Activation/redirect authorization |
| `/orders/:id` | Existing legacy/read-only-compatible Order detail with status, payment and history panels | `ADAPT` | Preserve historical compatibility while defining the future Retail Order view around commitment snapshot, factual milestones, ETA, fulfilment, payment state, exceptions, and next action | New Retail aggregate/API/projection and activation |
| `/orders/:id/file-revision`, `/orders/:id/cancellation`, `/orders/:id/complaints/new`, `/orders/:id/complaints/:caseId` | Exact routes absent and not canonically selected | `CANDIDATE-TBD` | Prototype durable revision/cancellation/complaint tasks as owned states without asserting final URLs | Exact after-sales route/API/evidence/privacy/Finance decisions |

<!-- markdownlint-enable MD013 -->

### 4.4 Admin Studio, CMS, and operational routes

<!-- markdownlint-disable MD013 -->

| Route / family | Current evidence at baseline | Candidate disposition | Adaptation contract | Gate retained |
| --- | --- | --- | --- | --- |
| `/admin` | Existing permission-aware work home with role queue evidence and operational layout | `ADAPT` | Preserve role/permission filtering; recompose around owned priority, blocked work, ageing, and recoverable next actions rather than a universal KPI-card grid | Exact role dashboard/IA definitions |
| `/admin/orders` | Existing legacy archive route | `COMPATIBILITY` | Keep clearly labelled, read-only, and separate from active Retail Order work | Non-destructive retirement procedure |
| `/admin/catalog`, `/admin/catalog/:productId` | Existing product list/editor | `ADAPT` | Product identity, publication/version state, validation, and permitted next action lead; immutable commercial history stays visible | Exact catalog/version/approval contracts |
| `/admin/materials` | Existing material/pricing management | `ADAPT` | Price-version/effective-state hierarchy, validation, and audit context; never expose or rewrite historical commitments | Commercial activation and approval boundaries |
| `/admin/inventory`, `/admin/stock-movements` | Existing inventory balance, reservation, adjustment, conflict, and movement evidence | `ADAPT` | Dense operational ledger with low/depleted/reserved/conflict meaning, filters, explicit movement reason, and recovery | Transaction capability and operations evidence |
| `/admin/restock-alerts` | Existing full workflow, reached under the reduced scope direction rather than persistent primary navigation | `PRESERVE` | Header bell surfaces awareness; route owns full resolution, reason, permission, and conflict states | Exact notification/navigation confirmation |
| `/admin/portfolio`, `/admin/portfolio/:id` | Existing structured portfolio lifecycle, preview/publication, reorder, conflict, and permission evidence | `ADAPT` | Authentic asset provenance, structured story fields, lifecycle, preview, publication, archive, and rollback; no free-form page builder | Media/storage and operator validation |
| `/admin/content` | Existing structured content editor with lifecycle/version evidence | `ADAPT` | Reduced CMS workspace with field validation, preview, explicit publish permission, schedule/archive/rollback, conflict, and history | Exact field schemas, SOP, preview/publish/rollback contract |
| `/admin/contacts` | Existing compatibility contact archive | `COMPATIBILITY` | Keep clearly distinguished from active B2B Inquiry work | Retention/retirement decision |
| `/admin/inquiries`, `/admin/inquiries/:id` | Existing B2B Inquiry queue/detail with permission-aware actions | `ADAPT` | Stable Inquiry identity, triage state, owner/age, next action, safe conversion, conflict, and audit; no Retail Offer merge | Public intake completion and operational ownership |
| `/admin/b2b/quotes`, `/admin/b2b/quotes/:id`, `/admin/b2b/quotes/:id/revision` | Existing Quote list/detail/revision | `ADAPT` | Versioned commercial proposal, review/approval/send states, immutable accepted source, conflict, and permission | Customer portal remains inactive; exact operations validation |
| `/admin/b2b/projects`, `/admin/b2b/projects/:id` | Existing B2B Project list/detail | `ADAPT` | Project scope, milestone, accepted Quote reference, next action, change/audit, and permission | Exact operational validation; no Retail lifecycle merge |
| `/admin/b2b/work-orders`, `/admin/b2b/work-orders/:id` | Existing Work Order list/detail | `ADAPT` | Production task, allocation, QC, rework, shortage, and exact source identity; no fake live-printer telemetry | Production/inventory transaction readiness |
| `/admin/retail-orders`, `/admin/retail-orders/:id` | Existing historical/read-only transaction-inactive workbench/detail evidence | `ADAPT`, target partial | Keep it the sole active target workbench; future view must expose payment, production/QC/fulfilment state, blockers, history, and safe next action | Transaction activation, exact API/projection/permissions |
| `/admin/retail-requests`, `/admin/retail-requests/:id` | Canonical route family absent from source | `TARGET-MISSING` | Dedicated Retail Request review and immutable Assisted Offer versions; never merge with B2B Quotes | Exact permissions/navigation/API/implementation |
| `/admin/retail-cases`, `/admin/retail-cases/:caseId` | Canonical route family absent from source | `TARGET-MISSING` | Dedicated cancellation/complaint/reprint/refund/return queue and detail with governed outcomes | Legal, evidence, Finance/provider, API/permission work |
| `/admin/users`, `/admin/customers` | Existing bounded identity/customer operations | `PRESERVE` and task-specific adaptation | Least-privilege tasks, explicit denied/conflict/audit states, no broad operational user directory | Granular access and migration controls |
| `/admin/notifications`, `/admin/communication` | Existing role-scoped feed and allowlisted outbound communication | `ADAPT` | Delivery state, recipient scope, safe deep link, exhaustion/retry, permission, and no arbitrary campaign/WhatsApp automation | Delivery/provider/runtime evidence |
| `/admin/settings` | Existing permission-gated settings | `PRESERVE` and governance adaptation | Configuration identity, validation, version/conflict, audit, and explicit effect boundary | Settings authority and deployment/runtime review |

<!-- markdownlint-enable MD013 -->

## 5. Shared design-system reconciliation

### 5.1 Foundation to preserve

The cross-surface work must use the existing semantic foundation rather than
creating a parallel UI kit:

- Niuva semantic blue, surface, text, border, focus, and status roles from
  `frontend/src/index.css`;
- Tailwind mappings in `frontend/tailwind.config.js`;
- Poppins for approved display/UI emphasis, Inter for body/forms/dense text,
  and JetBrains Mono only for genuine identifiers, measurements, revisions,
  and audit metadata;
- existing radius, elevation, spacing, focus, and motion roles;
- existing React, Tailwind, Radix, CVA, Lucide, Sonner, and chart stack; and
- reduced-motion behavior and 44px general mobile touch target.

The approved palette and fonts are not generic merely because other sites may
also use blue or Inter. Genericness is created by interchangeable composition,
fake evidence, repeated equal cards, and context-free UI patterns—not by
following Niuva's approved identity consistently.

### 5.2 Component disposition

<!-- markdownlint-disable MD013 -->

| Existing contract | Reconciliation use | Constraint |
| --- | --- | --- |
| `MarketingLayout` | Reuse public shell and identity | Do not reuse one full hero/section skeleton for every public route; Retail needs commerce-specific composition inside the shared shell |
| `OperationalLayout` | Reuse customer/account shell | Keep customer state and next action primary; do not import public editorial scale |
| `AdminLayout` | Reuse permission-aware workbench shell | Exact IA remains open; preserve role filtering, focus trap, skip link, and noindex behavior |
| `Navbar`, `PublicNavigation`, `OperationalNavigation` | Preserve shell orchestration and separate navigation compositions | Exact Public/Retail treatment remains gated; route visibility never substitutes for backend authorization |
| `AuthShell` | Reuse customer/staff/recovery audiences | Do not collapse customer and internal trust language |
| `BrandSystem`, `CompanyProfileBlocks` | Reuse tokens, semantic sections, form behavior, and truthful assets selectively | Do not preserve a repeated route skeleton merely because a component already exists |
| `Button`, form primitives, `Alert`, dialogs, tabs, select, switch | Reuse adopted semantics and keyboard behavior | Do not recreate page-local controls or hide critical errors only in toasts/tooltips |
| `SurfacePanel` and header | Reuse for one meaningful task/state region | Avoid nested card soup and one panel per field, status, or metric |
| `EmptyState`, `ErrorState`, `OperationalState`, `Skeleton` | Reuse state presentation | Copy and recovery must remain surface-, permission-, and customer-safe |
| `Table` | Reuse for dense operator data | Mobile needs domain-aware recomposition; do not squeeze a desktop table into 390px |
| `Badge` plus lifecycle-owned badges | Reuse semantic tone only through the correct lifecycle owner | Shared colors never merge state machines or labels |
| `TechnicalLabel` | Restrict to genuine technical/audit metadata | Never use as decorative eyebrow, navigation, ordinary form label, or fake telemetry |
| `StatusStepper` | Preserve only for the legacy Customer Order lifecycle | Do not extend it to Retail Request, Offer, B2B, Portfolio, or Work Order states |
| `Sonner` | Use for transient feedback | Critical rejection, conflict, payment, persistence, or next action must also be visible in-page |
| `Progress`, `ResponsiveTable`, `StatCard`, `Tooltip` | Provisional; review before use | No fabricated ETA/completion; redesign generic KPI behavior before adoption |
| `Drawer` | Quarantined | Do not import it or add `vaul` without a separate dependency decision |

<!-- markdownlint-enable MD013 -->

### 5.3 Component decision rule

For each later page task:

1. identify the surface and lifecycle owner;
2. preserve route, API, permission, customer-projection, i18n, and test
   contracts;
3. select an adopted primitive or composition before creating local styling;
4. explain why the page-level composition is specific to its job;
5. show every critical state and recovery in the page hierarchy; and
6. prove that the result is not merely the same shell with different headings.

## 6. Surface-native composition contracts

### 6.1 Public brand and B2B — Evidence-led editorial

The public surface persuades and explains. It may use asymmetric composition,
larger display hierarchy, deliberate whitespace, authentic artifacts, varied
reading rhythm, and the approved semantic transformation thread.

Each route has a distinct job:

- Home positions Niuva, establishes B2B credibility, and exposes Retail as a
  clear secondary journey;
- About explains the organization and approach;
- Capabilities explains what Niuva can do and how that capability is applied;
- Projects lets evidence, decisions, and outputs lead; and
- Contact turns interest into one persisted structured Inquiry and an honest
  human follow-up expectation.

Public pages must not become a sequence of identical rounded cards, repeated
eyebrows, repeated giant headings, blue proof bands, or equal three-column
feature grids.

### 6.2 Retail — Product specification and safe commerce

Retail is not a second marketing homepage and not a generic marketplace. Its
visual anchor is the **stable object/specification summary**:

- product or Custom Print identity;
- selected variant/material/options;
- file/version where allowed;
- authoritative versus non-authoritative price meaning;
- stock or `quote_required` state;
- ETA and fulfilment meaning;
- current commitment boundary; and
- safe next action.

Catalog pages may be visually inviting, but configuration, checkout, payment,
and recovery must prioritize clarity, comparison, validation, and commitment
semantics over editorial spectacle.

### 6.3 Customer account and Order — Owned state and next action

Customer pages should answer four questions immediately:

1. What owned record am I viewing?
2. What is its current factual state?
3. What changed or requires attention?
4. What safe action can I take next?

The customer portal must not expose internal cost, margin, supplier, profit,
operator notes, provider payloads, another customer's data, or unverified
production telemetry. Historical compatibility content stays visibly separate
from future Retail transaction records.

### 6.4 Authentication — Trust and recovery

Authentication surfaces reuse one technical foundation but preserve three
audiences: customer, staff, and recovery. They require restrained composition,
clear identity, one primary task, non-enumerating errors, retry/recovery, and
safe return destinations. They do not need public campaign composition or
Admin dashboard density.

### 6.5 Admin Studio and CMS — Calm operational workbench

Admin pages are repeated-use workspaces. Their hierarchy is:

`record or queue identity → state → owner/age → next action → blocker/conflict
→ history/audit`.

Admin composition should use dense lists, tables, filters, definition lists,
context strips, and bounded task panels. It must not use:

- a public hero or semantic U-curve as dashboard decoration;
- generic identical KPI-card grids as the primary role home;
- fake terminal, telemetry, system-health, or technical-status decoration;
- decorative monospace labels;
- hover-lift card walls; or
- one identical dashboard/navigation for every role.

The CMS is a structured module inside Admin Studio. It shares operational
identity but remains separate from inventory, pricing, Retail Order, payment,
production, and B2B project truth.

## 7. Cross-surface UI state contract

The visual system must make state ownership and recovery clear without
inventing new backend states.

<!-- markdownlint-disable MD013 -->

| Domain | Minimum visible states in a later prototype/task | Required visual behavior | Forbidden implication |
| --- | --- | --- | --- |
| Public CMS content | Loading, ready, empty, invalid, unavailable | Preserve page context; show reload/contact recovery where applicable | Invalid content silently rendered as trusted current content |
| B2B Inquiry | Empty, validation errors, submitting, persistence failure, persisted acknowledgement, optional WhatsApp handoff | Exact consent, Inquiry UUID, owner/calendar/response target, focused error/success, preserved values | WhatsApp click alone records an Inquiry; quotation/ETA is guaranteed |
| Retail discovery | Loading, unavailable environment, error/retry, empty, filtered empty, ready, unpublished/not found | Published price/availability meaning and safe CTA are explicit | Read-only discovery means transaction is active |
| Configuration/file | No file, local draft, authenticating, validating, invalid/unsafe, analysis failed, eligible, `quote_required` | Stable specification and current authority level remain visible | File analysis, calculation, or upload succeeded when capability is inactive |
| Retail Request | New/reviewing, safely routed, awaiting result, terminal | Retained context, safe reason, owned reference, next action | Request is an Order, B2B Quote, reservation, or payment attempt |
| Assisted Retail Offer | Offered, accepted, declined, expired, superseded | Immutable version, price/ETA/terms snapshot, validity, next action | Acceptance alone creates an Order or paid state |
| Checkout/reservation | Loading, stale delta, reconfirmation, reservation active/expired/consumed/released | Changed values are itemized; 30-minute reservation meaning is factual | Cart holds stock; timer starts before Order/payment-attempt creation |
| Payment | Action required, pending/processing, succeeded, failed, expired/cancelled, uncertain/reconciliation | One owned attempt and safe next action; no blind duplicate payment | Provider return alone proves settlement |
| Retail Order/production | Four approved milestone variants, ETA change/overdue, file revision/on-hold/rework, ready for pickup/delivery, completed | Factual event history and exception reason; no fake percentage | Exact queue position, live printer telemetry, or unverified completion |
| After-sales | Eligibility, submitted, evidence requested, review, approved/rejected, execution, resolved | Owned case identity, requested evidence, decision, remedy progress | Automatic refund, automatic liability, or automatic cancellation |
| Inventory | Healthy, low, depleted, reserved, conflict, adjustment pending/denied/applied | Quantity meaning, version, source, action permission, and reason | Silent overwrite or stock inferred from UI alone |
| CMS/Portfolio | Draft, invalid, submitted/review, preview-approved, scheduled/published, archived, conflict, rollback | Explicit permission and publication consequence; visible version/history | Save equals publish; public content owns operational truth |
| Admin permissions | Loading, allowed, action-denied, route-forbidden, stale permission | Explain the permitted recovery without leaking restricted data | Hidden button is the authorization boundary |
| Async mutation | Idle, in progress, success, rejected, stale/version conflict, unavailable, retry-safe/unsafe | Prevent duplicate action; show durable in-page outcome for critical events | Toast-only critical failure or optimistic success without evidence |

<!-- markdownlint-enable MD013 -->

## 8. Responsive, accessibility, interaction, and motion contract

### 8.1 Required viewports and input modes

Later visual evidence must cover at least 390, 768, 1024, and 1440 pixels.
Where a page is task-critical, also review keyboard-only operation and a real
touch device when available.

Responsive adaptation means recomposition, not uniform scaling:

- Public editorial hierarchy may collapse into a deliberate single reading
  sequence without losing artifact context or primary action.
- Retail keeps the specification summary and commitment state near the current
  action rather than moving them far above the viewport.
- Customer pages keep status and next action before secondary history.
- Admin tables may become domain-specific lists or limited actions on mobile;
  they must not silently hide critical state or expose unsafe write actions.
- Navigation, overlays, dialogs, filters, and sticky actions must preserve
  focus, escape, scroll, and touch behavior.

### 8.2 Accessibility floor

Every later prototype and implementation task must verify:

- semantic landmarks and one clear page heading;
- keyboard reachability and visible focus;
- labels, descriptions, and adjacent errors for form controls;
- post-render focus and scroll recovery for error, success, and handoff states;
- 44px general minimum mobile target;
- no critical meaning conveyed only through color, icon, position, or motion;
- usable zoom/reflow and no unintended horizontal overflow;
- descriptive link/action text and meaningful image alternatives;
- live-region use only where it adds timely meaning; and
- a complete static/reduced-motion equivalent.

No WCAG conformance level is claimed by this packet.

### 8.3 Motion rule

Motion must explain continuity, hierarchy, feedback, or state change. Public
motion remains at or below the canonical 5/10 ceiling. Retail/customer motion
is quieter, and frequent Admin/CMS work uses almost none beyond necessary
feedback. Avoid `transition: all`, layout-shifting hover effects, decorative
parallax, perpetual animation, and motion required to understand content.

## 9. Anti-generic and anti-AI-slop acceptance contract

A later design fails this packet's specificity gate when any of the following
dominates the selected surface:

- the same hero, three-card grid, proof band, CTA band, and footer sequence is
  reused across unrelated routes;
- each field, metric, state, timeline event, or paragraph is enclosed in an
  equal rounded card;
- Public, Retail, customer, and Admin screenshots differ mainly by heading and
  card content;
- decorative technical labels, random section numbers, fake system status,
  fake CAD, fake printer telemetry, fake dashboards, or fabricated metrics are
  used to imply expertise;
- generic gradients, neon, glassmorphism, glows, particles, bento-dashboard
  wallpaper, or floating-card decoration substitute for real evidence;
- oversized marketing headings appear inside checkout, Order recovery,
  authentication, Admin queues, or CMS editing;
- Niuva blue fills every major surface instead of communicating hierarchy,
  action, focus, or real semantic state;
- Poppins, Inter, or monospace is used without its approved role;
- copied UI-library defaults erase Niuva's object, evidence, lifecycle, or
  operational language;
- public composition leaks into Admin, or dense Admin composition leaks into
  public persuasion;
- fake success, fake availability, fabricated precision, or a provider action
  is presented without authoritative evidence; or
- evaluator IDs, fixtures, open gates, implementation notes, or prototype
  chrome appear in Participant Mode.

Positive specificity must come from the page's real job:

- factual Niuva project artifacts and decisions on public routes;
- stable product/configuration/commitment identity in Retail;
- owned state, exceptions, and next action for customers; and
- role, queue, conflict, permission, and audit context for operators.

## 10. Prototype and existing-page adaptation strategy

### 10.1 What can be reused from the Public prototype

The following may be carried into a later isolated reconciliation prototype:

- the artifact-led Home and Projects reading direction;
- open editorial sheets instead of repeated portfolio cards;
- factual `need → investigation → decision → artifact → output` storytelling;
- Inquiry-first Contact semantics and truthful WhatsApp handoff;
- Participant Mode / Review Mode separation;
- local-only fixtures and no external/provider side effects;
- explicit map-unavailable and Retail-deferred states;
- asset provenance records; and
- the browser/focus/reduced-motion evidence method.

### 10.2 What must not be copied

Do not copy:

- prototype HTML/CSS/JS directly into `frontend/`;
- the public type scale or editorial whitespace into checkout, dashboard, or
  Admin pages;
- synthetic values, state transitions, URLs, or route details as product
  authority;
- a project-detail URL before its exact route is approved;
- prototype-only Retail notices as a replacement for the real Retail flow;
- Review Mode, fixture controls, scenario IDs, or simulation language into
  production Participant surfaces; or
- the prototype's local asset/path assumptions into the application build.

### 10.3 Representative cross-surface prototype slice

A later separately authorized prototype should prove the adaptation logic on a
small but representative set rather than redesigning every route at once:

<!-- markdownlint-disable MD013 -->

| Slice | Representative routes/states | Why it is sufficient for the design gate |
| --- | --- | --- |
| Public identity | `/`, `/about` or `/capabilities`, `/projects`, candidate detail state, `/contact` | Proves route-specific editorial composition, authentic evidence, CMS states, and B2B conversion without one repeated template |
| Retail discovery/specification | `/retail`, `/retail/products/:slug`, one synthetic configurator eligible/`quote_required` pair | Proves commerce-specific hierarchy and stable object specification without activating transactions |
| Customer state | `/dashboard`, `/orders/:id` with one normal and one attention-required state | Proves owned identity, status, next action, milestone/history, and compatibility separation |
| Authentication | `/login` plus one recovery error/success state | Proves customer/staff/recovery audience separation and trust-focused composition |
| Admin/CMS | `/admin`, `/admin/content` or `/admin/portfolio`, `/admin/inventory`, `/admin/retail-orders/:id` | Proves role queue, structured publishing, data density, conflict/recovery, and lifecycle-specific operations without public styling |

<!-- markdownlint-enable MD013 -->

The exact synthetic routes and fixtures must be defined in a later task card.
Missing or inactive routes remain visibly simulated and cannot make network,
provider, upload, payment, or durable persistence calls.

## 11. Candidate decisions for owner review

All `CSR-*` identifiers are packet-local. Approval would accept this candidate
planning direction only unless a separate canonical promotion request says
otherwise.

<!-- markdownlint-disable MD013 -->

| ID | Candidate decision | Recommended selection | Consequence |
| --- | --- | --- | --- |
| `CSR-01` | Cross-surface thesis | Accept **One Niuva identity, surface-native composition** as the reconciliation rule | Shared identity no longer implies one visual template |
| `CSR-02` | Existing page treatment | Preserve valid routes/data/permissions/lifecycles and adapt composition; do not start with a wholesale rewrite | Lower implementation risk and clearer traceability |
| `CSR-03` | Public prototype role | Use it as public/B2B adaptation evidence only | Prevents public editorial styling from leaking into task surfaces |
| `CSR-04` | Broader public routes | Prototype About/Capabilities extension as candidate evidence; keep production rollout and typography promotion separately gated | Allows coherence review without silently changing canonical scope |
| `CSR-05` | Retail/customer/Admin visual models | Retail = specification/commerce; customer = owned state/next action; Admin/CMS = calm operational workbench | Makes each surface recognizable by purpose rather than heading |
| `CSR-06` | Component strategy | Reuse current semantic tokens and adopted primitives; no parallel UI kit or new dependency | Preserves accessibility and implementation investment |
| `CSR-07` | Representative prototype scope | Use the five-slice table in section 10.3 | Tests the system without rebuilding the whole application |
| `CSR-08` | Gate boundary | Packet review first, prototype task card second, isolated prototype third, independent critique fourth, production task cards last | Prevents prototype evidence from becoming implementation authority |

<!-- markdownlint-enable MD013 -->

### 11.1 Recorded owner response

The Product Owner accepted all eight candidate selections on 11 August 2026:

```text
CSR-01: accept
CSR-02: accept
CSR-03: accept
CSR-04: accept
CSR-05: accept
CSR-06: accept
CSR-07: accept
CSR-08: accept
```

This acceptance closes the packet-local owner-review gate. It does not promote
the selections into canonical authority and does not authorize publication,
prototype construction, production code, API/schema work, migration, provider
activation, deployment, readiness, go-live, or a moderated session.

## 12. Required evidence and exit criteria

### 12.1 Documentation validation

Before this packet is proposed for publication:

- every current route in `frontend/src/App.js` is represented directly or by
  a clearly named family;
- every canonical missing/candidate route relevant to MVP is represented;
- every disposition preserves the governing lifecycle and authorization
  boundary;
- links to repository authority resolve;
- no local prototype is represented as canonical or production evidence;
- no provider, policy, threshold, route, or capability is silently selected;
  and
- the diff contains only the approved documentation file.

### 12.2 Later prototype validation

A later isolated prototype may receive `PASS WITH CONDITIONS` only when:

- each representative surface is visually distinguishable by purpose without
  abandoning shared Niuva identity;
- selected critical states are completable or safely recoverable;
- source/canonical terms and lifecycle boundaries remain accurate;
- Public/B2B uses authentic approved evidence and no fabricated proof;
- Retail/customer/Admin do not collapse into one card/dashboard template;
- Participant Mode contains no evaluator or implementation vocabulary;
- the Impeccable detector is run once on the final UI edit state and findings
  are dispositioned;
- browser checks cover 390, 768, 1024, and 1440 pixels;
- keyboard, focus, reduced motion, labels, live feedback, 44px targets,
  overflow, images, deep links, and console/network behavior are recorded;
- an independent design critique assesses specificity, Nielsen heuristics,
  cognitive load, emotional journey, and customer/operator personas; and
- all P0/P1 findings are closed or the verdict remains `REVISE`.

A detector result of `[]`, passing unit tests, or a mergeable PR is not by
itself visual acceptance, production readiness, or go-live evidence.

## 13. Proposed delivery sequence

1. **Owner review:** decide `CSR-01` through `CSR-08` and correct any route,
   surface, or priority assumption.
2. **Publication decision:** separately authorize commit/push/PR for this
   candidate documentation if desired.
3. **Task card:** define exact isolated prototype files, representative
   fixtures, approved assets, route/state coverage, reviewer roles, and
   non-authorization boundary.
4. **Read-only baseline capture:** capture the current production-source pages
   at the selected SHA before prototype work so adaptation has a truthful
   before-state.
5. **Isolated prototype:** build only the approved representative slices; no
   production imports or provider calls.
6. **Focused browser validation:** verify responsive, interaction, state, and
   accessibility evidence.
7. **Independent formal critique:** assess design specificity and close P0/P1
   findings.
8. **Surface-specific implementation planning:** create separate task cards
   for Public, Retail, customer/auth, and Admin/CMS so three developers can
   work in parallel without overlapping lifecycle or file ownership.
9. **Production implementation gates:** request source, API/schema, migration,
   provider, deployment, readiness, and go-live approvals separately as they
   become relevant.

## 14. Open-gate register

<!-- markdownlint-disable MD013 -->

| Gate | Still open | Blocks |
| --- | --- | --- |
| Public route rollout | Poppins/Inter and full visual rollout beyond Homepage | Production About/Capabilities/Projects/Contact redesign |
| Public/Retail navigation | Exact journey switch, labels, placement, and mobile behavior | Final shared navigation design |
| Project detail | Exact production route and content contract | Source implementation of `/projects/:slug` |
| Contact runtime | Complete consent/privacy, WhatsApp settings, idempotency/abuse controls, response measurement/escalation | Claim that the amended B2B flow is fully implemented |
| Retail configuration | File limits/storage/slicer/profiles/pricing thresholds and activation | Configurator source and authoritative calculation |
| Registration | Verification, abuse, recovery, activation | Active `/register` |
| Checkout/payment/fulfilment | Tax, provider, transaction, origin/logistics, reconciliation, readiness | Authoritative checkout and payment |
| Cart | Exact route/state ownership | Durable cart URL or server-owned cart claim |
| After-sales | Exact routes, aggregate/API, evidence privacy, legal/Finance/provider handling | Customer and Admin case implementation |
| Admin IA | Exact role-home, navigation placement, permission mapping, smartphone policy | Final Admin prototype/source plan |
| CMS detail | Exact structured fields, preview/publish/rollback/archive behavior, SOP/training | CMS implementation convergence claim |
| Accessibility | Target conformance level and accountable validation owner | Formal conformance claim |
| Prototype publication/research | Exact artifact/task card and separate session authorization | Commit/push/PR and moderated session |

<!-- markdownlint-enable MD013 -->

## 15. Traceability

<!-- markdownlint-disable MD013 -->

| Concern | Governing source |
| --- | --- |
| Product and lifecycle separation | [`docs/NIUVA_MASTER_SPEC.md`](../../../NIUVA_MASTER_SPEC.md), [`PRODUCT.md`](../../../../PRODUCT.md) |
| Shared design foundation and surface boundaries | [`DESIGN.md`](../../../../DESIGN.md) |
| Unified B2B-primary Homepage | [`DEC-UX-001`](../../../decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md) |
| Homepage visual direction, typography, U-curve, authentic evidence, motion | [`DEC-UX-002`](../../../decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md) |
| Canonical routes, B2B form/WhatsApp, Retail/customer/Admin route ownership | [`DEC-UX-003`](../../../decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md) |
| One-origin route topology | [`ADR-004`](../../../decisions/architecture/ADR-004-surface-boundary-topology.md) |
| Admin operational direction | [`DEC-OPS-001`](../../../decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md) |
| Admin scope reduction | [`DEC-OPS-002`](../../../decisions/experience/DEC-OPS-002-admin-scope-reduction.md) |
| Reduced integrated CMS | [`DEC-OPS-003`](../../../decisions/experience/DEC-OPS-003-reduced-integrated-cms-mvp.md) |
| Parent UX/UI route, flow, state, and design contract | [`2026-08-08-niuva-mvp-ux-ui-design-packet.md`](2026-08-08-niuva-mvp-ux-ui-design-packet.md) |
| Current component adoption evidence | [`2026-08-05-frontend-component-register.md`](../../plans/pending-reconciliation/2026-08-05-frontend-component-register.md) |
| Current routes | `frontend/src/App.js` at the named baseline |
| Tokens and component evidence | `frontend/src/index.css`, `frontend/tailwind.config.js`, `frontend/src/components/` at the named baseline |
| Permission and Admin grouping evidence | `frontend/src/lib/permissions.js`, `frontend/src/lib/adminWorkbench.js` at the named baseline |

<!-- markdownlint-enable MD013 -->

## 16. Current packet verdict and next gate

**Verdict: OWNER REVIEW PASSED — CANDIDATE DOCUMENTATION ONLY.**

The packet is sufficiently bounded to answer how the refined prototype should
adapt existing Niuva pages:

- reuse the current foundation;
- adapt each route according to its actual job;
- keep Public, Retail, customer, auth, and Admin composition distinct;
- preserve lifecycle, permission, privacy, and compatibility boundaries; and
- validate representative slices before creating production task cards.

`CSR-01` through `CSR-08` are now owner-accepted. The next action still needs a
separate instruction: either publish this candidate packet through a scoped
documentation PR, or prepare the isolated cross-surface prototype-building
task card. Neither action is inferred from the acceptance above. Production
code, canonical promotion, commit, push, PR, merge, provider activation,
deployment, readiness, go-live, and moderated-session authority remain closed.
