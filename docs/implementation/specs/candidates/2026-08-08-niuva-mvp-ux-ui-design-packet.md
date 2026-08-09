# Candidate MVP UX/UI Design Packet

**Status:** Candidate — Context Only — not canonical and not implementation authority
**Date:** 8 August 2026
**Amended:** 9 August 2026 — visual-craft and anti-generic prototype contract
**Baseline:** `origin/main` at `a61cc2be6a10a4dd5e04d4343cf9d293404a8f30` (`docs: promote B2B form-first inquiry amendment (#221)`)
**Purpose:** Provide a prototype-ready and implementation-planning-ready UX/UI contract for review without changing source, routes, APIs, schemas, providers, deployment, readiness, or go-live status.

This packet applies `impeccable` (`shape`) as its primary design-planning
method; the accessibility/component discipline of `frontend-ui-engineering`;
and bounded reference checks from `ui-ux-pro-max`,
`design-taste-frontend` (Leonxlnx), `emil-design-eng` (Emil Kowalski), and
`frontend-design`. The taste reference applies only to public/B2B/project
composition because its own scope excludes dashboards and multi-step product
UI. Canonical Niuva product, route, role, lifecycle, brand, and design decisions
override generic skill defaults.

## 1. Authority and boundary

Use this order when a statement in this packet conflicts with another source:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. The applicable approved decision or ADR
5. The applicable runbook
6. Current source and tests as implementation evidence
7. This candidate packet and other supporting analysis

This packet does not:

- promote or amend a canonical decision;
- authorize React, CSS, API, schema, migration, storage, payment, logistics, or provider work;
- select or activate a payment, storage, email, WhatsApp, or logistics provider;
- change `PRODUCT.md`, `DESIGN.md`, a register, an ADR, or a runbook;
- claim that a route, state, CMS workflow, checkout, payment, production upload, or tracking capability is implemented;
- establish production readiness, deployment approval, or go-live authority.

The packet is a candidate design contract. A later implementation task card and source gate must name exact files, dependencies, tests, migration/rollback impact, and publication authority.

### 1.1 Maturity and identifier convention

`Prototype-ready` means the packet is detailed enough to prepare annotated
wireframes and a bounded interactive prototype without inventing approved
product behavior. `Implementation-planning-ready` means it can inform a later
task card; it does not authorize source work or prove that an implementation is
ready.

All identifiers introduced by this packet, including `UX-*`, `FLOW-*`, and new
`AG-UX-*` identifiers, are **packet-local candidates**. They are traceability
labels only. They are not canonical decisions, API names, backend enums, test
IDs, activation approvals, or implementation requirements. Identifiers imported
from an earlier Context Only candidate remain labelled as such and gain no
additional authority here.

## 2. Product shape and UX north star

Niuva is one website and one operational platform with two understandable but separate customer journeys:

- **Business/B2B:** capability proof, form-first inquiry, manual triage, quotation/project work when appropriate, and governed engineering/prototyping work.
- **Retail:** Ready Product and Custom 3D Print discovery, authenticated configuration, safe price/ETA, checkout/payment when activated, production milestones, and pickup/delivery recovery.

Shared foundations (identity, catalog, materials, inventory, production, payment, fulfillment, notifications, audit, CMS, and Admin Studio) do not merge the Retail Order and B2B Quote/Project lifecycles.

The experience must make the following visible without inventing commitments:

1. Niuva is primarily an R&D, design-engineering, and prototyping partner.
2. Retail is a clear secondary path, not the brand's entire identity.
3. A safe calculated price/ETA is different from `quote_required`.
4. Customer-visible production progress is factual milestone history, not fake percentage progress or live printer telemetry.
5. Admin Studio is a role-aware operating environment, not a third customer journey.

## 3. Surface modes and visual stance

The packet uses surface-specific modes rather than forcing one visual density across the product.

| Surface | Primary mode | Audience | UX priority | Visual expression |
| --- | --- | --- | --- | --- |
| Public homepage and capability pages | Persuade + Read | Prospects, partners, Retail visitors | Understand Niuva, trust evidence, choose a path | Experimental Editorial Hybrid where approved; B2B-primary hierarchy; restrained motion |
| Projects/portfolio | Experience + Read | Prospects and partners | Let authentic project evidence lead | Editorial clarity; no fabricated metrics or proof |
| B2B contact/inquiry | Persuade + Operate | Business/partnership prospect | Submit a complete inquiry and understand follow-up | Credible, low-friction form; optional user-clicked WhatsApp continuation |
| Retail catalog/product/configurator | Persuade + Operate | Retail visitor/account | Discover, configure safely, see authoritative price/ETA semantics | Commerce clarity within Niuva identity; no marketplace-first treatment |
| Retail account/order/after-sales | Operate | Authenticated Retail owner | Know current state and next action | Calm, status-led, customer-safe |
| Admin Studio CMS and operations | Operate | Authorized internal staff | Scan, decide, recover, publish, and audit routine work | Dense but calm, permission-aware, task-oriented |

The public Homepage direction remains governed by `DEC-UX-001` and `DEC-UX-002`. Admin direction remains governed by `DEC-OPS-001`; CMS topology remains governed by `DEC-OPS-003`. No new visual world is selected by this packet.

### 3.1 Design read and cross-surface thesis

**Design read:** Niuva is an engineering and prototyping platform for business
decision makers, Retail customers, and one small non-IT operating team. It must
feel evidence-led, precise, collaborative, and materially connected to the
journey from a need or file to a physical output. It must not feel like a SaaS
template, marketplace, fake CAD tool, or generic admin dashboard.

The established visual world is refined, not replaced. The cross-surface thesis
is **evidence before decoration**:

- public and B2B surfaces use the approved **Experimental Editorial Hybrid** to
  connect a real need, authentic project evidence, method, and output;
- Retail/customer surfaces use a **Product Specification Workspace** in which
  the same owned object summary (file version, material, grams, duration,
  price/ETA meaning, and fulfilment) remains recognizable across configuration,
  checkout, and Order tracking; and
- Admin/CMS surfaces use a **Calm Operational Workspace** in which record
  identity, state, next action, conflict, and history create the hierarchy.

These names are packet-local design calibration, not new canonical brands,
routes, components, or lifecycle terms.

### 3.2 Differentiation anchor

If the Niuva logo is removed from a screenshot, the interface should still be
recognizable through one product-specific anchor: a continuous **need/file to
physical output evidence thread**.

| Surface | Evidence thread expression | Must not become |
| --- | --- | --- |
| Public/B2B | The canonical `Need → Research → Experiment → Prototype → Output` transformation logic, used semantically and supported by authentic project media | Repeated U-curve wallpaper, numbered technical labels, or fabricated proof |
| Retail/customer | A stable object/specification summary that follows the owned configuration through safe calculation, checkout revalidation, factual production, and fulfilment | Fake CAD, live-printer telemetry, decorative gauges, or a generic step-card wizard |
| Admin/CMS | Stable record identity plus visible state, next action, conflict/recovery, and audit history | Generic KPI cards, terminal decoration, or marketing-page composition |

The anchor does not require one visual motif to appear on every surface. Public,
customer, and operator modes remain intentionally different.

### 3.3 Prototype calibration dials

The following dials calibrate a candidate prototype only. They are not CSS
variables or production implementation authority.

| Surface family | Design variance | Motion intensity | Visual density | Rationale |
| --- | ---: | ---: | ---: | --- |
| Public/B2B/projects | 7/10 | 4/10 | 4/10 | Asymmetric editorial evidence with controlled technical personality; motion remains below the canonical 5/10 ceiling |
| Retail/customer | 4/10 | 2/10 | 5/10 | Task clarity and a persistent specification thread outrank visual spectacle |
| Admin/CMS | 2/10 | 1/10 | 7/10 | Dense, calm, repeat-use operation with almost no decorative motion |
| Review Mode | 1/10 | 1/10 | 7/10 | Evidence tooling is explicit and compact, but never leaks into Participant Mode |

Using the Design Feasibility & Impact Index as a non-authoritative challenge
tool, all three participant-facing directions clear the minimum score of 8:

| Direction | Impact | Context fit | Feasibility | Performance safety | Consistency risk | DFII |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Experimental Editorial Hybrid | 4 | 5 | 4 | 4 | 4 | 13 |
| Product Specification Workspace | 3 | 5 | 5 | 5 | 4 | 14 |
| Calm Operational Workspace | 3 | 5 | 5 | 5 | 4 | 14 |

### 3.4 Reference-skill conflict resolution

Generic skill guidance is advisory and cannot override Niuva authority. The
following choices are deliberate:

| Reference suggestion or ban | Niuva resolution | Reason |
| --- | --- | --- |
| Replace Inter/Roboto/system-like typography with a novel display/body pairing | **Reject for this amendment.** Preserve Poppins for approved display/UI emphasis and Inter for body/forms/operations | `DEC-UX-002`, `DESIGN.md`, and current semantic font roles are authoritative; distinctiveness must come from evidence, composition, and craft rather than an unapproved font swap |
| Introduce a new “trust” palette, dark mode, gradient, or glass treatment | **Reject.** Preserve the existing semantic Niuva blue, neutral, status, focus, and surface roles | Canonical guardrails prohibit unrelated palettes, gradients, neon, and glassmorphism; dark-mode rollout has not been authorized |
| Add a new UI kit or icon family | **Reject.** Preserve the current React, Tailwind, Radix/CVA, Lucide, and shared-component direction for later source planning | A candidate prototype cannot create a second component architecture |
| Apply landing-page anti-template rules to every surface | **Scope-limited.** Use them for public, B2B, and project composition; do not force them onto configurator, checkout, account, or Admin workflows | The installed taste reference explicitly excludes dashboards and multi-step product UI; operate surfaces require different density and predictability |
| Use badges, certificates, metrics, testimonials, trust logos, or generated claims to increase authority | **Reject unless authentic, approved evidence exists.** | `DEC-UX-002` prohibits fabricated clients, metrics, awards, certifications, testimonials, and outcomes |

### 3.5 Anti-generic composition floor

The prototype must not use any of the following as its dominant visual grammar:

- a centered headline over a gradient/blob followed by three equal feature
  cards;
- a numbered left sidebar, route path, fixture ID, responsive-contract label,
  or evaluator hint inside Participant Mode;
- one white rounded card around every field, metric, state, or timeline event;
- repeated uppercase tracked eyebrows, section numbers, decorative status dots,
  or monospace labels that imitate engineering evidence;
- mixed Indonesian and English without a product or technical-language reason;
- a generic marketplace product grid, fake dashboard, fake CAD viewport,
  fabricated telemetry, or stock SaaS illustration; or
- oversized marketing headings inside checkout, account, Order, Admin, or CMS
  task surfaces.

Use open editorial composition, authentic imagery, specification groups,
definition lists, sparse dividers, labelled tables/rows, and one meaningful
panel per task or state boundary. Rounded roles and blue accents remain
semantic, not decoration.

## 4. Terminology and domain-object glossary

This glossary describes approved product meaning. It does not create a schema,
API, collection, or backend state machine.

| Term | Meaning | Created when | Customer-visible? | Never means |
| --- | --- | --- | --- | --- |
| B2B Inquiry | The public or operator-entered starting record for a business, partnership, bulk, recurring, organizational, or complex need. | The public form is validated and persisted with status `new`, or an approved internal intake path creates it. | The submitter may see their own safe acknowledgement and Inquiry UUID; no public history or portal is implied. | A B2B Quote, Project, Retail Request, committed price, or delivery promise. |
| Retail Request | The owned retained-context record created when Retail work cannot be committed safely through direct calculation. | An authenticated `quote_required` handoff preserves product, configuration, quantity, file versions, safe analysis, contact, and fulfilment context. | Yes: owned reference, safe reason/status, and next action. | A Retail Order, reservation, payment attempt, checkout total, or B2B Quote. |
| `quote_required` | A commitment-routing condition indicating that price, capacity, technical feasibility, or fulfilment cannot be committed automatically. | An approved eligibility rule, safe validation, or authorized risk review rejects direct calculation. | Yes, with a safe reason and correction/request path. | A customer type, approximate final price, failed Order, or authorization to charge. |
| Assisted Retail Offer | A private, immutable-version, one-time commercial offer for eligible Retail work after manual review and approval. | An operator prepares a version and the required approval makes that version `offered`. | Only owned customer-safe `offered`, accepted, declined, expired, or superseded information. | A catalog price override, B2B Quote/Project, Order, reservation, payment attempt, or paid state. |
| Retail Order | The authenticated Retail commercial transaction and its immutable commitment snapshots. | Normal Retail checkout successfully creates the Order and payment attempt under the approved transaction boundary. | Yes, to its authenticated owner through customer-safe projections. | A B2B Project, non-authoritative cart draft, Retail Request, or accepted offer alone. |
| B2B Quote | A versioned commercial proposal for a B2B Inquiry, with scope, lines, amount, ETA/milestones, terms, expiry, and approval. | An authorized B2B conversion/preparation workflow creates a Quote version from an Inquiry. | Not through the narrowed public MVP; later organization-account access remains separately gated. | An Assisted Retail Offer, public catalog price, or Retail Order. |
| B2B Project | The governed execution context for accepted B2B scope, approvals, design versions, milestones, payment terms, and change. | The approved B2B lifecycle converts an accepted quotation under its own contract. | Later through an authorized organization portal; not activated by the narrowed public MVP. | A Retail Order or a shared state machine for Retail. |
| Work Order | An internal production execution unit tied to the governing Project and exact accepted Quote-line identity. | Authorized production planning creates it from an accepted, reconcilable B2B source. | The raw Work Order is internal; customers may see only approved safe milestones/projections. | The customer Project, Retail Order, Quote line, or live-printer telemetry. |
| Complaint / After-sales Case | The governed customer-action and review context for complaint evidence, cancellation, reprint/replacement, refund, or return. | An owned eligible action is acknowledged under `DEC-AFTER-01`; exact aggregate, API, and route ownership remain gated. | Yes, as an owned safe status, requested evidence, decision, and remedy progress. | An automatic refund, automatic liability admission, or automatic Order cancellation. |
| Calculated price | A result produced only for an eligible configuration using approved Niuva-authoritative profiles and pricing policy. | Safe analysis and all applicable pricing eligibility checks succeed. | Yes, with its inputs and meaning; it remains subject to required server revalidation before commitment. | A client-supplied amount, approximate fallback after analysis failure, or price for `quote_required` work. |
| Authoritative price | The server-revalidated customer amount and applicable commercial snapshot used at the commitment boundary. | Checkout revalidates product/configuration, policy, tax, availability, ETA, and fulfilment; paid history preserves the committed snapshot. | Yes, including the customer-safe breakdown and reconfirmation when changed. | A stale preview, browser calculation, catalog `price_from`, or private internal cost. |
| Reservation | A versioned temporary hold on eligible ready stock or material allocation for one checkout attempt. | The platform successfully creates the Retail Order and its payment attempt; the approved duration is 30 minutes. | Yes, as remaining time, warning, and explicit consumed/released/expired outcome. | A cart hold, offer hold, quote request, extension promise, or payment success. |
| Payment attempt | The provider-neutral record for one authorized payment action, amount/currency snapshot, correlation, and safe outcome. | Normal checkout creates it with the Order and reservation under the transaction boundary. | Yes, through a customer-safe pending/action/success/failure/expiry/reconciliation projection. | Proof that funds settled, an Order before checkout, or permission to retry blindly during an uncertain state. |

## 5. MVP scope classification

The priority labels below are **packet-local candidate classifications**. They
help prototype and backlog planning but do not amend product scope, activate a
capability, or authorize implementation. `Owner confirmation required` is used
where canonical sources establish an MVP direction but do not establish a P0
versus P1 priority.

| Classification | Candidate scope | Evidence basis | Confirmation / boundary |
| --- | --- | --- | --- |
| **P0 — MVP Blocking** | Unified Homepage path selection and the persisted form-first B2B Inquiry acknowledgement | Explicit narrowed-MVP amendment in `DEC-UX-003` and the approved PRD | Evidence-backed candidate classification; current `/contact` source is partial and is not declared complete here. |
| **P0 — MVP Blocking** | Retail discovery, configuration, authenticated private upload, safe fixed/calculated/`quote_required` branching, checkout/payment target, owned Order detail, factual tracking, and fulfilment | Approved PRD Retail journey plus `DEC-RT-02`, `DEC-OFFER-01`, `DEC-INV-01`, `ADR-003`, `DEC-ETA-01`, and `DEC-FUL-01` | Evidence-backed MVP target; transaction, upload, checkout, payment, and fulfilment activation remain gated. |
| **P0 — owner confirmation required** | Admin Inquiry, Retail Request/Offer, Retail Order, inventory/production/QC/fulfilment, and after-sales queues required to operate P0 customer flows | `DEC-UX-003`, `DEC-OPS-001`, granular access decisions, and approved lifecycle policies | Product/Operations must confirm exact P0 queue subset and merge order; route approval is not source completion. |
| **P1 — owner confirmation required** | Reduced structured CMS, portfolio/catalog maintenance, notification feeds, supporting public pages, customer dashboard aggregation, and operational recovery/reporting | `DEC-OPS-003`, `DEC-DATA-003`, approved PRD, and current route responsibilities | Supporting-MVP classification is not canonical; owner must confirm what can follow the first transaction slice. |
| **P2 — Post-MVP** | Customer B2B Organization Portal, quotation/project self-service access, and broader organization-account surface | The 8 August amendment explicitly keeps the portal outside the narrowed MVP and as a later platform surface | Internal B2B operations remain separate and may exist without activating this customer portal. |
| **P2 — Post-MVP / excluded dependency** | Live printer telemetry, exact queue-position disclosure, predictive optimization, and advanced capacity optimizer | Explicitly excluded as MVP dependencies by approved requirements and `DEC-ETA-01` | Do not place these in the prototype as required progress evidence. |
| **Compatibility Only** | `/services`, `/portfolio`, `/order`, `/admin/orders`, and owned historical Order/payment reads | `DEC-UX-003`, `DEC-ACCESS-003`, and `DEC-PAY-02` | Preserve safe redirects/read-only history; never reactivate legacy transaction mutations. |

## 6. Page inventory

The inventory records four independent dimensions. `Source existence` means a
navigable route/page observed at baseline SHA `a61cc2b`, not that every target
capability behind it is implemented. `UX authority` records route/design
authority. `MVP scope` uses the packet-local classification above. `Activation`
records current capability status and must never be inferred from route
existence.

### 6.1 Public and shared surfaces

| Route | Audience | Page job | Primary action | Required states | Source existence | UX authority | MVP scope | Activation gate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Public | Establish B2B-primary positioning and expose the Retail secondary path | Explore capability or start an inquiry | Loading, unavailable content, reduced motion | Existing | Canonical direction: `DEC-UX-001`, `DEC-UX-002` | P0 candidate | Page active; exact navigation/CTA/mobile treatment open |
| `/about` | Public | Explain company, approach, and credibility | Continue to capabilities/contact | Loading, empty, invalid CMS content | Existing | Approved current responsibility | P1; owner confirmation required | Active public surface; broader visual rollout separately gated |
| `/capabilities` | Public | Explain approved capability families | Choose a capability or inquire | Loading, empty, unavailable | Existing | Canonical route: `DEC-UX-003` | P0; owner confirmation required | Active public route |
| `/services` | Public | Preserve the former alias | Redirect to `/capabilities` | Redirect, not-found fallback | Existing redirect | Canonical compatibility redirect | Compatibility Only | Active redirect; no separate content |
| `/projects` | Public | Show authentic project/portfolio evidence | Inspect a project or contact Niuva | Loading, empty, invalid item | Existing | Canonical route: `DEC-UX-003` | P1; owner confirmation required | Active public route; authentic evidence required |
| `/portfolio` | Public | Preserve the former alias | Redirect to `/projects` | Redirect, not-found fallback | Existing redirect | Canonical compatibility redirect | Compatibility Only | Active redirect; no separate content |
| `/contact` | Public/B2B | Persist a structured B2B/partnership Inquiry before optional follow-up | Submit Inquiry; after success optionally open WhatsApp | Validation, submitting, acknowledgement/reference, error, consent unchecked | **Partial** | Canonical form-first flow: amended `DEC-UX-003` | P0 evidence-backed | Submission/reference exist; required consent checkbox, form-primary hierarchy, and post-success WhatsApp continuation are not fully aligned in current source |
| `/privacy` | Public | Explain data use and consent boundaries | Read policy | Loading, unavailable, legal-review dependency | Existing | Approved current responsibility | P1; owner confirmation required | Active; final legal approval remains separate |
| `/faq` | Public/Retail | Answer safe customer questions | Find an answer or contact Niuva | Loading, empty, no result | Existing | Approved current responsibility | P1; owner confirmation required | Active public route |
| `/retail` | Public | Discover Ready Product and Custom 3D Print | Open product detail or configurator | Loading, empty, unavailable, no result | Existing | Canonical current route | P0 evidence-backed | Read-only discovery active; transaction capability inactive |
| `/retail/products/:slug` | Public | Explain published offer, variants, availability, and CTA semantics | Continue to configuration or safe request path | Loading, unpublished, unavailable, `quote_required` explanation | Existing | Canonical current route | P0 evidence-backed | Discovery active; upload/configuration/checkout CTA activation gated |

### 6.2 Authentication and customer account

| Route | Audience | Page job | Primary action | Required states | Source existence | UX authority | MVP scope | Activation gate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/login` | Anonymous/customer | Authenticate before private Retail commitment | Sign in and return to an allowlisted continuation | Invalid credentials, rate limit, loading, recovery | Existing | Approved shared authentication boundary | P0 candidate | Customer session source exists; environment activation evidence remains separate |
| `/register` | Anonymous | Create the account required for new Retail transactions | Register and verify | Validation, duplicate-safe error, verification pending, abuse control | Missing | Canonical reserved route: `DEC-UX-003` | P0 candidate | Inactive until registration/verification/abuse/recovery contract is approved |
| `/forgot-password` and result routes | Anonymous/recovery | Recover account without enumeration | Request or complete recovery | Generic acknowledgement, invalid/expired token, policy error, success | Existing | Approved current route family | P1; owner confirmation required | Source exists; runtime/provider evidence remains separate |
| `/dashboard` | Authenticated Retail owner | Own the customer account namespace and surface the next owned action | Open an owned record | Loading, no activity, error, forbidden, stale | **Partial** | Canonical MVP namespace: `DEC-UX-003` | P0 candidate | Existing legacy/customer summary; Request/Offer/new transaction aggregation incomplete |
| `/dashboard/notifications` | Authenticated Retail owner | Show recipient-scoped in-app notifications | Open an allowlisted owned link or mark read | Loading, empty, exhausted delivery, forbidden | Missing | Canonical route: `DEC-UX-003` | P1; owner confirmation required | Source route missing; notification activation gates remain open |

### 6.3 Retail configuration, transaction, and after-sales target

| Route | Audience | Page job | Primary action | Required states | Source existence | UX authority | MVP scope | Activation gate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/retail/cart` | Visitor/account | Hold non-authoritative drafts and separate quote items | Authenticate, review, remove, or continue | Empty, mixed, stale, unavailable | Missing | **Candidate exact route**; cart behavior only is approved | TBD; owner confirmation required | Exact route/state ownership not authorized; no reservation or authoritative price |
| `/retail/products/:slug/configure` | Visitor/account | Configure Ready Product or Custom Print safely | Select Simple/Detailed, upload after auth, calculate | Missing file, validating, invalid, unsafe, eligible, `quote_required` | Missing | Canonical route: `DEC-UX-003` | P0 candidate | Upload, analysis, profiles, pricing, storage, and transaction activation gated |
| `/retail/requests/:requestId` | Authenticated owner | Show retained `quote_required` context and next route | Follow Assisted Retail or B2B path | Loading, not found/denial, reviewing, routed, terminal | Missing | Canonical route: `DEC-UX-003` | P0 candidate | Source/technical contract not authorized |
| `/retail/offers/:offerId` | Authenticated owner | Show one immutable Assisted Retail Offer version | Accept or decline | Offered, accepted, declined, expired, superseded | Missing | Canonical route: `DEC-UX-003` | P0 candidate | Offer expiry/exact technical contract and transaction activation gated |
| `/retail/checkout` | Authenticated owner | Revalidate the commitment snapshot and start provider-neutral payment | Reconfirm and continue to payment action | Loading, stale deltas, rate expired, reconfirmation, pending/success/failure/uncertain | Missing | Canonical route: `DEC-UX-003` | P0 candidate | Checkout/payment/tax/fulfilment/provider/transaction capability inactive |
| `/orders/:id` | Authenticated owner | Own the Retail Order, payment, ETA, milestones, fulfilment, and recovery destination | Take the current safe next action | Loading, not found/denial, payment, factual milestone, conflict, overdue | **Partial** | Canonical target route: `DEC-UX-003` | P0 candidate | Existing customer page is legacy/read-only compatible; new Retail transaction lifecycle inactive |
| `/orders/:id/file-revision` | Authenticated owner | Replace an eligible file within its governed window | Submit replacement | Deadline, validating, rejected, accepted, expired | Missing | Candidate exact route; durable action required by `DEC-AFTER-01` | TBD; owner confirmation required | Exact route/API/state contract and private storage gated |
| `/orders/:id/cancellation` | Authenticated owner | Submit or inspect a lifecycle-specific cancellation request | Request review | Ineligible, pending, approved, refund pending, rejected, resolved | Missing | Candidate exact route; policy canonical | TBD; owner confirmation required | Legal/case/refund/provider contracts gated |
| `/orders/:id/complaints/new` | Authenticated owner | Start a scoped complaint | Submit complaint/evidence reference | Validation, evidence required, acknowledgement | Missing | Candidate exact route; policy canonical | TBD; owner confirmation required | Exact route, evidence privacy/retention, legal copy, and case contract gated |
| `/orders/:id/complaints/:caseId` | Authenticated owner | Follow an owned after-sales case and remedy | Provide requested evidence or read outcome | Evidence requested, review, approval, executing, resolved/rejected | Missing | Candidate exact route; policy canonical | TBD; owner confirmation required | Exact case state/API, refund/reprint/return execution gated |
| `/order` | Authenticated customer | Preserve a safe legacy compatibility state | Return to Retail when allowed | Unavailable, compatibility message, redirect | Existing | Canonical compatibility treatment: `DEC-UX-003` | Compatibility Only | Never reactivate creation; redirect only after separately authorized activation |

### 6.4 Admin Studio and operator surfaces

| Route/family | Audience / page job | Primary action | Required states | Source existence | UX authority | MVP scope | Activation gate |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/admin` | Role-aware operational home | Open the highest-priority owned action | Loading, no assigned work, forbidden, stale | Existing | Approved direction: `DEC-OPS-001` | P1; owner confirmation required | Exact role-home/navigation composition open |
| `/admin/content` | Structured CMS editing | Save, validate, preview, publish if permitted | Draft, validation, conflict, preview, published/scheduled, archived | Existing | Canonical reduced CMS: `DEC-OPS-003` | P1; owner confirmation required | Exact fields, preview/publish/rollback, SOP/training gated |
| `/admin/portfolio` and detail | Manage authentic project evidence | Create/edit, preview, publish, archive, rollback | Empty, invalid media, conflict, permission | Existing | Approved structured CMS scope | P1; owner confirmation required | Media/storage and final structured-field contract separately gated |
| `/admin/catalog` and detail | Maintain published offers and safe pricing candidates | Prepare approved fields/version | Draft, invalid, unpublished, version conflict | Existing | Approved Catalog/Admin direction | TBD; owner confirmation required | Paid history immutable; calculated/transaction activation gated |
| `/admin/materials` | Maintain material and price-version preparation | Add/review a version | Validation, approval, effective/expired, conflict | Existing | Approved material/pricing foundation | TBD; owner confirmation required | Tax/pricing activation and approval boundaries apply |
| `/admin/inventory` and `/admin/stock-movements` | Monitor and reconcile stock/material balances | Record a governed movement or resolve conflict | Healthy, low, depleted, reserved, conflict, permission | Existing | Approved inventory foundation | P0 candidate; owner confirmation required | Transaction capability and operational evidence remain separate |
| `/admin/restock-alerts` | Full restock resolution reached from the header bell | Resolve with an auditable reason | Empty, unread, conflict, permission | Existing | Canonical preserved workflow: `DEC-OPS-002` | P1; owner confirmation required | Must not return as a persistent sidebar destination |
| `/admin/inquiries` and detail | Triage B2B/partnership Inquiry records | Review, contact, reject, or convert | New, reviewed, contacted, converted/rejected, conflict | Existing | Approved internal B2B lifecycle | P0 candidate | Public intake source is partial; no customer B2B portal implied |
| `/admin/b2b/quotes`, projects, work-orders | Operate separate B2B aggregates | Prepare/approve or advance owned work | Draft, approval, conflict, milestone, permission | Existing | Approved B2B platform direction | TBD; owner confirmation required | Customer organization portal remains inactive |
| `/admin/retail-requests` and detail | Review `quote_required` Requests and manage Assisted Offer versions | Route, prepare version, request approval | New, reviewing, awaiting approval, offered, terminal | Missing | Canonical route family: `DEC-UX-003` | P0 candidate; owner confirmation required | Source/permission/technical contract not authorized |
| `/admin/retail-orders` and detail | Coordinate active Retail production/QC/fulfilment | Advance factual milestones or resolve blockers | Payment, four canonical milestone variants, conflict, overdue | **Partial** | Canonical active-workbench ownership: `DEC-UX-003` | P0 candidate; owner confirmation required | Current source explicitly shows historical/read-only transaction-inactive records |
| `/admin/retail-cases` and detail | Triage cancellation, complaint, reprint, refund, and return | Record review and approved outcome | New, evidence requested, review, approval, executing, resolved/rejected | Missing | Canonical route family: `DEC-UX-003` | TBD; owner confirmation required | Legal, evidence, exact case, provider, and Finance gates open |
| `/admin/orders` | Read the historical legacy Order archive | Inspect an immutable legacy record | Read-only, labelled legacy, not found | Existing | Canonical temporary legacy archive: `DEC-UX-003` | Compatibility Only | No mutation controls; retirement requires a separate non-destructive decision |
| `/admin/notifications` and `/admin/communication` | Monitor role-scoped notifications and approved operational messages | Inspect delivery or compose allowlisted communication | Queued, delivered, exhausted, permission, invalid recipient | Existing | Approved notification boundary | P1; owner confirmation required | No campaigns, arbitrary recipients, or WhatsApp automation |
| `/admin/customers`, `/admin/users`, `/admin/settings` | Customer operations and bounded identity/configuration governance | Perform an allowlisted task | Permission, conflict, audit, validation | Existing | Approved granular access and Admin direction | P1; owner confirmation required | Super Admin/domain boundaries remain mandatory |

## 7. End-to-end UX flow index

Every identifier in this section is a packet-local candidate traceability label.
The `system-of-record transition` column describes the approved conceptual
commitment boundary; it does not create an API, collection, or state-machine
implementation.

| Flow ID | Entry point and authentication boundary | System-of-record transition | Branches and visible states | Terminal outcome | Governing authority | Open gate |
| --- | --- | --- | --- | --- | --- | --- |
| `FLOW-B2B-01` | `/` or `/capabilities` → `/contact#form-konsultasi`; no login for public intake | A valid form persists one B2B Inquiry with status `new`; its UUID becomes the acknowledgement reference | Field/consent validation → submitting → safe acknowledgement or recoverable error; after persistence, optional user-clicked WhatsApp; operator sees new/reviewed/contacted/converted/rejected | Durable acknowledgement followed by manual triage; optional conversion to the separate B2B Quote/Project lifecycle | Amended `DEC-UX-003`; approved PRD amendment | Current source is partial; no public raw-file upload; exact final CTA/copy treatment remains gated |
| `FLOW-RET-READY-01` | `/retail` → product → non-sensitive configuration → non-authoritative cart behavior → login/register before authoritative commitment → `/retail/checkout`; exact durable cart route remains gated | Normal checkout, when activated, creates the authenticated Retail Order and payment attempt and begins the 30-minute reservation | Unavailable/unpublished; local non-authoritative cart draft; auth interruption/continuation; stale stock/price/ETA/rate; pickup/delivery; payment pending/succeeded/failed/expired/uncertain | Owned `/orders/:id` with an authoritative commitment snapshot, or a safe no-commit recovery state | Approved PRD; `DEC-RT-02`; `DEC-INV-01`; `DEC-FUL-01`; `ADR-003`; `DEC-UX-003` | Exact cart route/state ownership, registration, tax, provider, transaction capability, fulfilment profiles, and activation evidence |
| `FLOW-RET-CUSTOM-01` | `/retail` → Custom Print product → `/retail/products/:slug/configure`; login is required before private upload | An authenticated file/configuration version enters safe validation/analysis; only an eligible result can continue to checkout | No file → validating/scanning/analysis → invalid/unsupported/unsafe/too large/analysis failed or eligible; eligible result shows calculated inputs and may continue; otherwise `quote_required` | Eligible checkout handoff, corrected draft, or retained-context Retail Request | `DEC-OFFER-01`; `DEC-PRICE-001`; `DEC-RT-02`; `DEC-UX-003` | Exact file limits, storage, calibrated profiles, printer/build thresholds, slicing contract, and automatic-pricing activation |
| `FLOW-RET-QUOTE-01` | Configurator analysis → `quote_required`; authenticated ownership before durable Request | A Retail Request is created without Order/reservation/payment/checkout total; operator routes it to B2B or prepares an Assisted Retail Offer | Request reviewing/routed/terminal; B2B handoff for organizational/complex work; Retail offer draft/approval hidden internally, then offered/accepted/declined/expired/superseded; acceptance proceeds to checkout revalidation | Stable Request reference, separate B2B path, or accepted active Retail Offer awaiting normal checkout | `DEC-OFFER-01`; `DEC-UX-003`; `ADR-003` | Exact cart route, offer default expiry, Request/Offer technical contract, and route-specific implementation |
| `FLOW-PAY-UNCERTAIN-01` | Valid `/retail/checkout` after full server revalidation and customer reconfirmation | Retail Order, payment attempt, and reservation already exist; unknown/late/conflicting provider evidence enters reconciliation rather than a new payment | Action required → pending/processing → succeeded, failed, expired, cancelled, or uncertain/reconciliation-required; customer sees safe status and must not be prompted into accidental duplicate payment | Reconciled succeeded/failed/expired outcome or an owned case that still requires Finance/Operations action | `ADR-003`; `DEC-INV-01`; `DEC-AFTER-01` | Gateway/state mapping, webhook authentication, reconciliation ownership/SLA, event retention, and provider evidence |
| `FLOW-ORDER-01` | Owned `/orders/:id` after Order creation; authenticated ownership on every read/action | Immutable Order snapshots plus append-only ETA and factual milestone history become the customer source of truth | Ready Product versus Custom Print; pickup versus delivery; exceptions for file revision, on hold, rework, payment, fulfilment, and `eta_overdue`; no fake percentage or live telemetry | Picked up/delivered and completed, or an explicit governed recovery/after-sales path | `DEC-ETA-01`; `DEC-FUL-01`; `DEC-AFTER-01`; `DEC-DATA-003` | Numeric calendars/profiles, exact aggregate/API, notification event mapping, logistics activation, and safe reason copy |
| `FLOW-AFTER-01` | Owned Order next action → candidate revision/cancellation/complaint surface; authentication and ownership mandatory | A durable governed request/case is acknowledged; exact aggregate/API/route ownership remains an activation gate | Eligibility/deadline; evidence requested; under review; approval required; executing refund/reprint/return; resolved or rejected; no automatic remedy promise | Recorded customer-safe decision and remedy/recovery status with retained history | `DEC-AFTER-01`; `ADR-003`; `DEC-FUL-01`; granular access decisions | Exact routes, technical state/idempotency, legal terms, calendar, evidence privacy/retention, abuse/fraud, Finance/provider execution |
| `FLOW-ADMIN-01` | Role-aware Admin queue → owned record/detail; backend permission and domain scope on every operation | An authorized command changes only its owning aggregate and appends version/audit history; UI visibility is not authorization | Loading/empty/forbidden; validation; approval; stale/version conflict; transaction unavailable; accepted/rejected; recovery and retry | Governed state advance, explicit rejection, or recoverable unchanged record with visible next action | `DEC-OPS-001`; `DEC-ACCESS-001`; `DEC-ACCESS-002`; applicable lifecycle decision/runbook | Exact Admin navigation/permission map, smartphone support level, source task card, and capability-specific activation |

## 8. Wireframe and responsive blueprint

These are low-fidelity composition contracts, not final visual mockups and not CSS instructions.

### 8.1 Public homepage and capability pages

**Desktop:** brand/navigation → B2B-primary statement and inquiry action → compact Retail secondary path → capability/process chapters → authentic projects/proof → closing contact action.

**390px:** preserve B2B-primary reading order, collapse navigation into an accessible menu, keep one primary action visible, and move the Retail path after the primary value proposition.
**Distinctive composition:** use an asymmetric editorial opening with one approved project/process image and a compact semantic transformation path. Capability chapters must differ by content and evidence rather than appearing as four interchangeable cards. Exactly the two Homepage U-curve placements approved by `DEC-UX-002` may dominate; no additional decorative curve repetition is allowed.
**Must not:** become a Retail marketplace, fabricate metrics, or hide the contact action inside decorative content.

### 8.2 B2B/partnership inquiry

**Desktop:** concise context/proof column + labelled form column; consent and response target are near the submit action; success state shows a safe reference and optional WhatsApp continuation.

**390px:** single column; fields remain labelled and grouped; consent is readable without zoom; submit and optional WhatsApp action are distinct.
**Distinctive composition:** present the inquiry as a clear project brief, not a generic “contact us” card. Use one authentic capability/project evidence region and an open, bounded form workspace. Group related fields through headings, spacing, and dividers; avoid a large form card paired with a second equally weighted explainer card. Indonesian is primary; approved technical terms remain selective.
**Must not:** make WhatsApp the system of record, promise a quote/ETA, expose internal notes, or add public raw-file upload.

### 8.3 Retail catalog and product detail

**Desktop:** discovery controls → product/service result region → detail media/specification region → offer/pricing mode explanation → primary CTA.

**390px:** filters become an accessible disclosure/drawer; product information remains scannable; the primary CTA stays reachable without horizontal overflow.
**Distinctive composition:** Ready Product and Custom 3D Print use visibly different entry compositions rather than one generic product-card grid. A Ready Product foregrounds factual product media, variant, availability, and fulfilment. Custom Print foregrounds the file-to-object service, material choices, safe calculation meaning, and the configure action. Synthetic prototype product media is labelled `SIMULASI` and never presented as a real Niuva catalog claim.
**Must not:** show a checkout commitment for unpublished, unavailable, or `quote_required` work.

### 8.4 Custom 3D Print configurator

**Desktop:** step/context rail → file and configuration workspace → validation/result summary → price/ETA/fulfillment summary and primary action.

**390px:** stack steps and result sections; use a clearly labelled bottom action region only when it does not obscure content; keep file errors adjacent to the file control.

**Distinctive composition:** do not render a generic numbered wizard made of repeated cards. Use named task states and one persistent **Object Specification** summary whose identity survives file replacement, Simple/Detailed mode changes, calculation, and checkout handoff. Material, grams, duration, price meaning, and ETA are factual decision fields, not decorative gauges. A file preview may show an approved/generated neutral simulated object render or a labelled file placeholder; it must not imitate CAD, slicing, or printer telemetry that the prototype does not perform.

**Simple mode:** customer chooses approved high-level options.

**Detailed mode:** customer chooses only approved technical options.
**Must show:** file version, material/color, quantity, billable grams, print duration, price breakdown, ETA range, fulfillment choice, and whether the item is calculated or `quote_required`.

### 8.5 Cart and checkout

**Desktop:** cart lines → authentication boundary → authoritative review → fulfillment choice/rate → price/tax/ETA summary → reservation/payment action.

**390px:** one-column order summary with explicit total; preserve a visible back/review path; surface stale deltas and reconfirmation before payment.
**Distinctive composition:** the Object Specification becomes a compact commitment ledger. Changed values use adjacent old/new rows and one consolidated reconfirmation region; they must not be hidden in toasts, decorative badges, or a generic checkout progress bar.
**Must not:** create an Order, reservation, payment attempt, or checkout total for a quote-required item; trust stale delivery rates; or show a false reservation after payment.

### 8.6 Customer Order detail and tracking

**Desktop:** status/next-action header → payment and fulfillment summary → factual production milestone timeline → ETA/exception explanation → owned after-sales actions → append-only customer-safe history.

**390px:** current state and next action first; timeline becomes a readable vertical sequence; secondary details collapse without hiding required action.
**Distinctive composition:** retain the same owned object/file/order identity from checkout and present milestone evidence as one continuous factual history. Do not use percentages, circular progress, exact queue position, pulsing “live” indicators, or a dashboard-like card grid.
**Must show:** the applicable canonical milestone variant from `DEC-ETA-01`:

- Ready Product pickup: `payment_confirmed → processing_or_packing → ready_for_pickup → picked_up → completed`;
- Ready Product delivery: `payment_confirmed → processing_or_packing → ready_to_ship → shipped → delivered → completed`;
- Custom Print pickup: `payment_confirmed → file_review_when_applicable → production_queue → printing → post_processing_when_applicable → quality_control → ready_for_pickup → picked_up → completed`; or
- Custom Print delivery: `payment_confirmed → file_review_when_applicable → production_queue → printing → post_processing_when_applicable → quality_control → ready_to_ship → shipped → delivered → completed`.

The presentation may use approved customer-safe labels, but it must not invent a
combined canonical state such as `ready_for_pickup_or_shipping`.

### 8.7 Admin Studio queues and detail

**Desktop:** role-aware navigation → next-action summary → filters/search → dense but readable table/list → detail workspace with status, validation, history, and recovery.

**390px:** prioritize the next action and identity of the record; convert tables into stacked rows or an accessible overflow treatment; keep permission and conflict feedback visible.
**Distinctive composition:** use a compact role header, work queue, and record-detail ledger. A large marketing H1, six numbered “surface” links, generic KPI cards, and full-page rounded panels are prohibited. High-frequency actions remain visually stable and almost motionless.
**Must not:** use public editorial decoration, fake telemetry, generic KPI grids, or a hidden-only error for sighted operators.

### 8.8 Structured CMS editor

**Desktop:** record identity/version → structured fields → validation messages → preview → publication controls/history.

**390px:** fields stack; publication controls remain reachable; preview and validation do not erase draft content.
**Distinctive composition:** treat the editor as a structured document workspace with one record identity and visible version/history. Do not surround every field with a card or imitate a code editor/terminal. Preview and publish are distinct actions with explicit state and permission feedback.
**Lifecycle:** `draft → review → preview → published/scheduled → archived`. One person may author and publish only when the account also has the applicable approval capability.

## 9. Responsive composition contract

The breakpoints below describe information composition, not pixel-perfect CSS.
Sticky behavior is not required by canonical authority; where a prototype uses
it, the action must remain non-obscuring, keyboard reachable, and removable
without changing the task. No surface may depend on horizontal page overflow.

| Critical surface | 390px | 768px | 1024px | 1440px | CTA, error, overlay, and overflow constraints |
| --- | --- | --- | --- | --- | --- |
| Public Homepage/capabilities | One narrative column; B2B proposition and Inquiry action precede the Retail path; accessible menu | Single column with wider evidence blocks; two-column proof only when reading order remains intact | Full navigation and selective two-column editorial composition | Bounded content width; do not stretch lines or multiply decorative columns | Primary Inquiry action remains discoverable; menu restores focus; errors stay in owning section; no decorative horizontal scroll |
| B2B Inquiry | Context then labelled form; consent and submit remain together; success replaces or follows form with reference | Context may remain above form or become balanced two-column when labels remain readable | Context/proof and form may use two columns | Bounded form width with surrounding evidence, not an oversized empty canvas | Validation is adjacent plus summarized; optional WhatsApp appears only after persistence; no modal required for success |
| Retail catalog/product | Filters use disclosure/drawer; results and availability lead; CTA follows product facts | Filters may use compact horizontal controls or a dismissible drawer | Persistent filter column is allowed when result width remains usable | Bounded filter + result composition with stable product density | Drawer traps/restores focus; no clipped filters; unavailable/`quote_required` meaning appears before CTA |
| Configurator | One step/context stack; file error adjacent; result summary precedes action | Step summary plus one main workspace column | Context rail + workspace + summary may form two/three regions | Cap workspace width; keep analysis and summary visually connected | Persistent bottom CTA is prototype-optional and must not cover errors/content; no action before required revalidation |
| Cart/checkout | One-column lines, explicit totals/deltas, fulfilment, then action | Lines and summary may remain stacked with a compact review rail | Cart/checkout and authoritative summary may use two columns | Bounded transaction width; summary may remain visible without hiding policy/errors | Stale change is adjacent to changed value and summarized before payment; overlay never hides expiry/reconciliation copy |
| Order/after-sales | Current state and next action first; vertical factual timeline; details disclose progressively | Timeline and details may use two regions | Summary/timeline plus owned action panel | Bounded reading width; history may use a secondary column | Critical deadline/error/action is never collapsed; case modal/drawer must preserve history and focus |
| Admin queue/detail | Responsive-safe identity, status, and next action only until `AG-UX-ADMIN-MOBILE` is resolved; tables become labelled rows or accessible overflow | Compact queue with filters above results; bulk/dense actions require explicit support decision | Full queue/detail composition with role navigation | Dense but bounded columns; avoid whitespace-filling KPI grids | No hidden-only conflict; drawer/modal restores focus; full smartphone operational capability is not implied |
| Structured CMS | Fields stack; draft preservation and validation precede preview/publish | Form and preview may switch or stack | Form/preview/history may use two regions | Bounded editor; history remains scan-friendly | Publish controls cannot obscure validation; destructive/archive actions require clear confirmation and permission feedback |

## 10. UI state contract

The following is a presentation and interaction contract. It does not invent backend enum names. Existing domain state machines and approved decisions remain authoritative.

### 10.1 Cross-surface states

Every data-bearing surface must define:

- loading/skeleton with reserved layout space;
- empty state that explains why it is empty and the next safe action;
- validation or domain error near the affected control;
- unavailable/backend error with retry or safe return;
- forbidden/not-found behavior that does not enumerate protected records;
- session-expired reauthentication with safe continuation;
- stale/conflict state with the changed value, source of truth, and deliberate retry/reload;
- success acknowledgement that remains visible long enough to understand;
- reduced-motion equivalent and keyboard-complete action path.

### 10.2 File and analysis states

`no_file → selecting → validating → scanning → slicing/model_analysis → eligible` or `invalid | unsupported | unsafe | too_large | quote_required`.

Customer copy must explain the corrective action without exposing raw provider errors or private operational data. Customer profiles and customer `.gcode` are never treated as production authority. A failed safe calculation routes to `quote_required` with retained context rather than an approximate committed price.

### 10.3 Request and offer states

- Public B2B Inquiry: `new → reviewed → contacted → converted` with permitted rejection outcomes.
- Retail quote-required Request: owned reference, safe reason, next action, and route decision.
- Assisted Retail Offer: internal preparation/approval followed by customer-visible `offered`; customer actions are `accept` or `decline`; inactive versions are `expired` or `superseded`.
- Acceptance does not create an Order, reservation, payment attempt, or paid state; checkout revalidates the active version.

### 10.4 Price, checkout, reservation, and payment

The customer sees only the authoritative snapshot required for the decision: configuration/file version, material/color, quantity, billable grams, print time, customer-safe price breakdown, tax treatment, ETA range, pickup/delivery amount, and expiry/reconfirmation message where applicable.

- Calculated values show their source/meaning, not an unexplained number.
- Changed price, ETA, tax, stock, or delivery rate is shown as a visible delta and requires reconfirmation.
- A quote-required item has no checkout total.
- Reservation is inactive before successful Order/payment-attempt creation, active for the approved 30-minute window, and expired only through the approved policy.
- Payment is represented as pending, succeeded, failed, expired, or uncertain/reconciliation-required; UI never silently marks a late or unknown event as paid.

### 10.5 Production, ETA, and fulfillment

Customer-facing production uses the applicable Ready Product/Custom Print and
pickup/delivery milestone variant listed in section 8.6. It uses factual events
and an ETA range, not fake percentage completion, exact queue position, or a
non-canonical combined ready state.

Fulfillment must distinguish pickup (`Rp0` direction) from automatically rated supported domestic delivery. Delivery-rate expiry, pickup overdue, carrier exception, and `eta_overdue` each require explicit reason and next action; none silently cancels or refunds an Order.

### 10.6 Stock and notifications

Stock presentation distinguishes healthy, low, depleted, reserved/held, movement pending, and conflict/reconciliation. Low/depleted alerts are visible in the Admin dashboard/header-bell direction and use allowlisted transactional email only where `DEC-DATA-003` permits it.

Notifications distinguish in-app state from best-effort email delivery: queued, delivered, failed, exhausted, read/unread. Email failure never rolls back a core transaction and never falls back to automatic WhatsApp.

### 10.7 After-sales and CMS

After-sales presentation distinguishes file-revision-required, cancellation review, complaint intake, evidence requested, operator review, manager approval, refund/reprint/return execution, reconciliation, resolved, and rejected outcomes. The UI must not promise an outcome before the responsible review/approval.

CMS presentation distinguishes draft, review, preview, published/scheduled, archived, validation failure, permission denial, stale edit, and save conflict. A visible notice is required when a sighted operator's save is rejected by a version conflict.

## 11. Critical presentation-state matrix

These labels specify customer/operator presentation. They do not rename backend
enums or replace an approved domain state machine. A transition is automatic
only when a trusted system result is authoritative; user or operator actions
remain deliberate and auditable.

### 11.1 File and analysis

| Presentation state | User-facing meaning | UI treatment | Primary action | Secondary action | Transition |
| --- | --- | --- | --- | --- | --- |
| Validating | The selected file is being checked; no commitment exists | In-place progress with file name/version and reserved layout | Wait/cancel selection when safe | Review accepted file rules | Automatic trusted result |
| Invalid | Required file structure or input is not valid | Field-adjacent error plus safe reason | Replace/correct file | Review requirements | Manual correction then revalidate |
| Unsupported | File type/profile/process is not accepted for this path | Warning panel retaining configuration | Use supported input | Start retained-context request when allowed | Manual |
| Unsafe | File or content cannot proceed safely | High-prominence refusal without raw scanner/provider details | Replace file | Contact/request review if policy permits | Manual after safe review |
| Too large | Approved size/limit is exceeded | Exact applicable safe limit when approved; no invented threshold | Reduce/replace file | Request review | Manual |
| Analysis failed | A trustworthy calculated result could not be produced | Recoverable error; retained file/configuration context | Retry safe analysis | Continue as `quote_required` when permitted | Automatic failure, then manual choice |
| Eligible | Approved checks produced a result eligible for the next commitment step | Success summary with file version, configuration, calculated inputs, price/ETA meaning | Review and continue | Edit configuration | Trusted result followed by manual confirmation |
| Quote required | Niuva cannot safely commit this configuration automatically | Neutral decision panel with retained-context explanation and no checkout total | Create/view Retail Request | Edit configuration | Trusted rule or authorized risk decision |

### 11.2 Offer, checkout, and payment

| Presentation state | User-facing meaning | UI treatment | Primary action | Secondary action | Transition |
| --- | --- | --- | --- | --- | --- |
| Offered | One approved immutable offer version is available until its expiry | Version, scope/file, safe breakdown, ETA, expiry, and ownership summary | Accept | Decline/request manual review | Manual customer action |
| Accepted | Customer accepted this version; checkout revalidation is still required | Confirmation without paid/order/reservation language | Continue to checkout | Return to offer detail | Manual, then server revalidation |
| Declined | Customer declined this version | Terminal explanation and retained reference | Return to Request/Retail | Contact Niuva | Manual terminal state |
| Expired | The version can no longer enter checkout | Expiry notice with no active payment CTA | Return to Request | Ask for review | Trusted time/policy transition |
| Superseded | A newer immutable version replaced this one | Read-only history with link to active owned version | Open active version | Review history | Operator-approved revision |
| Checkout valid | Current server snapshot is eligible for customer confirmation | Authoritative breakdown, ETA, fulfilment, and commitment summary | Confirm and begin payment | Edit/review | Manual confirmation |
| Stale price | Price differs from the previously reviewed value | Old/new delta adjacent to price and in summary | Reconfirm changed total | Return/edit | Trusted revalidation then manual confirmation |
| Stale ETA | Ready/arrival range changed | Old/new range, safe reason, and effect on fulfilment | Reconfirm | Return/edit | Trusted revalidation then manual confirmation |
| Stale stock | Availability or allocation eligibility changed | Blocking or reduced-quantity notice; no false hold | Refresh/select alternative | Return to product | Trusted inventory result then manual choice |
| Stale delivery rate | Delivery service, amount, or expiry changed | Old/new service/amount/expiry delta | Reconfirm refreshed rate | Choose pickup/other eligible service | Trusted provider result then manual confirmation |
| Reconfirmation required | One or more authoritative commitment values changed | Consolidated change summary before payment action | Reconfirm all changes | Cancel/return | Manual |
| Payment pending | A known attempt is awaiting an authoritative outcome | Persistent attempt reference/status and safe wait/recovery action | Continue approved action or refresh status | Return to owned Order | Trusted provider/application transition |
| Payment succeeded | The authoritative payment result succeeded | Clear success; reservation consumed; route to owned Order | View Order/tracking | Download safe receipt when approved | Trusted idempotent event |
| Payment failed | A known attempt definitively failed | Failure reason category without secrets; no false paid state | Retry only through approved new/reusable action | Return to checkout/order | Trusted terminal failure |
| Payment expired | The payment action/reservation window expired | Expiry and required full revalidation | Revalidate and start an allowed new attempt | Return to Retail | Trusted expiry winner |
| Payment uncertain / reconciliation required | Niuva cannot yet confirm success or failure | High-trust warning, attempt reference, no duplicate-payment CTA | Check status/contact approved support path | View owned Order | Manual/automatic reconciliation; never blind retry |

### 11.3 Production and fulfilment

| Presentation state | User-facing meaning | UI treatment | Primary action | Secondary action | Transition |
| --- | --- | --- | --- | --- | --- |
| File check | Applicable Custom Print file is under operational review | Current factual milestone, time, ETA, safe next action | Provide revision only when requested | View accepted file summary | Authorized operator/trusted event |
| Production queue | Work is accepted into the production queue | Factual milestone and ETA range; no exact queue position | View details | Contact through approved path | Authorized operator |
| Printing | Printing has factually started | Started time and safe ETA; no live machine telemetry requirement | View progress history | Report a concern | Authorized operator/trusted event |
| Post-processing | Applicable finishing/support-removal work is active | Applicable-only milestone and ETA | View details | None unless action required | Authorized operator |
| Quality control | Output is under QC | Factual QC milestone; result not pre-empted | Wait/view next action | Respond if evidence/action requested | Authorized QC role |
| Ready | Use exact `ready_for_pickup` or `ready_to_ship` presentation | Prominent next fulfilment action, location/service, window/range | Follow pickup/shipping action | View history | Authorized fulfilment event |
| Completed | Applicable pickup/delivery and completion evidence exists | Terminal summary and customer-safe history | View receipt/history | Start eligible after-sales action | Trusted completion event |
| ETA overdue | Current target passed without completion | Visible overdue marker, replacement range/reason required | Review new ETA/next action | Start governed complaint when eligible | System detection plus authorized operator update |

### 11.4 After-sales

| Presentation state | User-facing meaning | UI treatment | Primary action | Secondary action | Transition |
| --- | --- | --- | --- | --- | --- |
| Evidence requested | Review needs specific additional evidence | Scoped request, privacy note, due context when approved | Provide evidence | Ask for clarification | Operator request then customer action |
| Under review | Case is acknowledged and being assessed | Reference, received time, target expectation, no outcome promise | View status | Add evidence when allowed | Authorized operator |
| Approval required | A sensitive remedy awaits authorized approval | Customer-safe pending explanation; internal view names required capability, not secrets | Wait / operator requests approval | Return to case | Authorized approver |
| Executing | An approved refund/reprint/return is being carried out | Exact remedy scope and provider-neutral progress | Follow required instruction | Contact approved support | Authorized roles/provider result |
| Resolved | The approved remedy or decision is complete | Outcome, scope, time, and safe history | Review resolution | Reopen only if policy permits | Trusted terminal event |
| Rejected | The requested outcome was not approved | Customer-safe reason and available escalation/alternative | Review next allowed action | Contact support | Authorized reviewed decision |

## 12. Critical UX copy contract

This is copy guidance, not final Indonesian or English production copy. Final
copy still requires the applicable product, legal, Finance, Operations, and
accessibility review.

| Risk state | What the user must understand | Must not promise | Primary action guidance | Prohibited wording or pattern |
| --- | --- | --- | --- | --- |
| `quote_required` | Automatic commitment is unavailable, context is retained, and the next path is manual review or correction | Final price, guaranteed acceptance, reservation, or checkout availability | Explain why safely; create/view Request or edit configuration | Approximate “final” total; “Order dibuat”; treating it as a B2B customer label |
| Invalid/unsafe file | The file cannot proceed in its current form and what safe correction is possible | That Niuva can repair every file or that a raw scanner message is definitive customer advice | Replace/correct; request review only when permitted | Raw provider errors, blame, malware detail, or “file aman” without authoritative result |
| Stale price | The payable amount changed and confirmation is required | That the prior price is still reserved | Show old/new values and reconfirm | Silent replacement; generic “data changed” without amount delta |
| Stale ETA | The ready/arrival range changed and why, in customer-safe terms | Guaranteed completion date or compensation | Show old/new range and reconfirm | Fake precision; exposing another order or internal notes |
| Stale stock | Availability changed before commitment | That a cart/offer had reserved stock | Refresh, reduce quantity, choose alternative, or return | “Reserved for you” before Order/payment-attempt creation |
| Payment uncertain | The attempt exists but success/failure is not yet authoritative; paying again may duplicate payment | Failed, succeeded, refunded, or safe immediate retry | Check status or use approved reconciliation/support action | “Payment failed—pay again”; duplicate prominent pay CTA |
| Payment failed | A trusted terminal failure occurred and no successful payment was recorded for that attempt | That retry will succeed or retain expired values | Use approved retry after required revalidation | Blaming bank/provider; exposing raw codes or secrets |
| ETA overdue | The prior range passed, work/case remains active, and a replacement range/reason is required | Automatic refund, cancellation, reprint, or compensation | Review new range/reason; show governed complaint path when eligible | Fake percentage, silence, or “selesai segera” without evidence |
| Ownership denial/not found | The resource cannot be shown through this session | Whether a protected foreign record exists | Return to owned list/login or contact approved support | Different messages that enumerate foreign IDs; internal permission names |
| Cancellation rejected | The reviewed request was not approved and which next action remains | Blanket no-refund/no-return legal conclusion | Read safe reason; choose allowed escalation/complaint path | Vague “ditolak sistem”; unreviewed legal language |
| Complaint under review | The case is acknowledged, who acts next, and the response target is not the final resolution promise | Approval, refund, reprint, liability, or exact provider timing | View status/provide requested evidence | “Refund sedang diproses” before approval; silent closure |
| Conflict/stale edit | Another committed version exists; the attempted save did not overwrite it | That retrying blindly will preserve both versions | Reload/compare, retain draft when safe, then retry deliberately | Screen-reader-only rejection; silent discard; generic success toast |

## 13. Design-system contract

### 13.1 Tokens and typography

- Consume the existing semantic token pipeline: CSS variables → Tailwind mappings → `components/ui` → surface/domain composition → route page.
- Preserve current semantic roles for brand, action, surface, text, border, focus, status, disabled, navigation, decoration, spacing, radius, elevation, and motion.
- Use approved Niuva typography roles: Poppins for approved display/UI emphasis and Inter for readable body, metadata, forms, and dense operational text where the surface scope binds it. JetBrains Mono is reserved for genuine technical identifiers, measurements, and codes.
- Do not add a parallel public palette, arbitrary per-page radius system, hard-coded color substitute, or replacement UI kit.

### 13.2 Components and composition

- Reuse `Button`, `FormField`, `Input`, `Select`, `Textarea`, `SurfacePanel`, `SurfacePanelHeader`, `EmptyState`, `ErrorState`, `Skeleton`, `ResponsiveTable`, status primitives, and existing Radix/CVA contracts before adding a primitive.
- A panel represents one meaningful region, task, or state. Use hierarchy, spacing, dividers, lists, and definition groups instead of wrapping every field in a card.
- Lifecycle-specific statuses remain scoped to Retail Order, B2B, Work Order, Portfolio, CMS, or after-sales domains. Shared tone vocabulary does not create a global lifecycle map.
- Public editorial composition must not leak into Admin. Admin density must not leak into customer or public journeys.

### 13.3 Accessibility and interaction

- Keyboard access and visible focus are mandatory for every actionable control.
- General interactive targets are at least 44×44 CSS pixels where practical, with labels for icon-only controls.
- Labels, errors, status, and dynamic changes are exposed semantically; color, icon, motion, and position never carry meaning alone.
- Use `aria-live` only for meaningful dynamic feedback and move focus when a modal or route-level state requires it.
- Support `prefers-reduced-motion`; no animation is required to understand content or complete a task.
- Test mobile at 390px and wider baselines at 768px, 1024px, and 1440px with no unintended horizontal overflow.

| Accessibility layer | Packet contract | Status |
| --- | --- | --- |
| Principles | Keyboard-complete operation, visible focus, semantic names/errors/status, non-color-only meaning, reduced motion, and practical 44×44 targets | Required design principles |
| Target conformance | Exact standard and level, including whether `WCAG 2.2 AA` is selected | `TBD` under packet-local `AG-UX-A11Y`; no canonical conformance level was found in the audited authority set |
| Validation evidence | Automated checks plus manual keyboard, focus, reading-order, zoom/reflow, contrast, error-recovery, and assistive-technology evidence for the exact prototype/source state | Required separately; prior checks on other routes/states are not evidence for this packet |

### 13.4 Motion and media

Motion is sparse and purposeful. Use existing motion roles and CSS-first
transitions where possible; expensive effects are not required for operate
surfaces. Any motion has a static/reduced-motion equivalent.

| Surface / trigger | Candidate treatment | Maximum intent | Prohibited treatment |
| --- | --- | --- | --- |
| Public first view | One restrained reveal sequence and, when used, semantic U-curve explanation | Explain hierarchy or the transformation sequence | Continuous decorative loops, parallax dependency, scroll hijack, or motion above the canonical 5/10 ceiling |
| Button/press feedback | Existing fast motion role, subtle press response, exact transitioned properties | Acknowledge input | `transition: all`, `scale(0)`, layout-shifting hover, or feedback longer than the action requires |
| Dialog, drawer, popover | Origin-aware entry/exit with focus management; exit may be faster than entry | Preserve spatial/state continuity | Center-origin popover detached from its trigger, trapped focus, or animation required to understand the state |
| Retail state change | In-place status, reserved layout, and concise transition | Explain validation, calculation, stale values, or commitment change | Animated gauges, fake live status, automatic carousel, or celebratory motion during payment uncertainty/error |
| Admin/CMS repeat action | Immediate state update; only short feedback for occasional overlay/toast | Confirm the command without slowing routine work | Animation on keyboard-initiated actions, repeated list-navigation motion, bounce, or decorative stagger |

Motion implementation, when later authorized, uses transform/opacity for
predetermined visual movement, avoids layout-animation jank, gates hover-only
effects behind fine-pointer capability, and cleans up any programmatic
animation. Reduced motion keeps useful opacity/color feedback but removes
non-essential displacement.

### 13.5 Media and asset provenance

Use authentic, approved local media and factual content; do not add placeholder
URLs, fabricated client proof, fake dashboard telemetry, or unapproved claims.

- The official lowercase `ni` mark is the only product identity mark.
- Public/B2B/project frames use the approved local project assets already in
  `frontend/src/assets/projects/` where they match the content. Missing process
  photography remains a labelled dependency.
- A prototype-only synthetic object render may be generated for a fixture only
  when it is labelled `SIMULASI`, has recorded provenance, and cannot be
  mistaken for a real Niuva product, customer file, printer output, or approved
  catalog image.
- Do not create a fake CAD viewport, slicer screenshot, G-code visualization,
  machine telemetry panel, logo wall, testimonial, certification, or client
  proof to fill visual space.
- Every image slot records source/provenance, intrinsic dimensions, intended
  crop/aspect behavior, alt-text intent, and whether it is content or
  decorative. Layout reserves its dimensions to avoid content shift.

### 13.6 Language and microcopy consistency

Participant-facing copy uses Indonesian as the primary language. English is
limited to approved product/domain terms such as Research & Development,
Design & Prototyping, Retail, Custom 3D Print, and status/identifier data that
would genuinely use English. Review Mode may expose packet IDs and evaluator
language; Participant Mode may not.

Use one label for one action intent within a surface. Do not alternate generic
synonyms such as “Mulai”, “Lanjut”, “Proceed”, and “Continue” for the same
commitment. Buttons use concrete verbs and do not wrap at the target desktop
viewport. Copy must be re-read for fabricated precision, vague AI marketing
phrases, blame, false assurance, or mixed-language filler before visual review.

## 14. Role, privacy, and data boundary

| Audience | Allowed UX information | Never expose |
| --- | --- | --- |
| Public visitor | Published content, safe catalog semantics, public policies | Private files, authoritative checkout state, internal inventory, other customers |
| Authenticated Retail owner | Owned drafts, requests, active offers, Orders, safe payment/ETA/milestone/fulfillment/after-sales projections | Cost, margin, supplier, profit, raw provider payloads, private notes, other customers |
| B2B prospect | Own inquiry acknowledgement and approved manual follow-up information | Retail Order internals, an unapproved B2B portal, internal triage notes |
| Domain operator | Role/resource-scoped records and actions for assigned work | Unrelated domains, secrets, unrestricted evidence, broad identity/audit directory |
| `manager_approver` | Approval context and safe audit needed for the decision | Provider secrets or unrelated customer data |
| `super_admin` | Approved identity governance and recovery surface | Provider secrets in the UI or authority outside approved boundaries |

All customer and operator deep links must be same-origin, audience-aware, allowlisted, and followed by backend ownership/permission checks. A hidden button is not an authorization boundary.

## 15. Customer and operator flow acceptance criteria

### Customer scenarios

1. B2B form submission stores a safe Inquiry acknowledgement and offers optional user-clicked WhatsApp without treating WhatsApp as the system of record.
2. Ready Product discovery reaches the authentication boundary before private commitment.
3. Custom Print Simple and Detailed flows distinguish valid automatic calculation from `quote_required`.
4. Invalid, unsafe, oversized, unsupported, or failed analysis retains context and offers a safe correction or request path.
5. Mixed carts separate quote-required work from eligible direct-checkout items.
6. Assisted Offer states show immutable version, safe breakdown, expiry, accept/decline, and revalidation before checkout.
7. Checkout exposes stale deltas, fulfillment choice, authoritative total, reservation state, and payment outcome without false success.
8. Order detail shows factual production milestones, ETA range, fulfillment, and the correct next action.
9. File revision, cancellation, complaint, evidence, refund, reprint, and return actions are lifecycle-specific and owned.
10. Session expiry, ownership denial, unavailable backend, conflict, and retry remain understandable.

### Operator scenarios

1. One non-IT operator can move between CMS, portfolio, catalog, stock, Retail requests/offers, Orders, production/QC, fulfillment, and after-sales without losing record context.
2. Next actions, filters, permission boundaries, conflicts, and audit history are visible without decorative KPI noise.
3. A single account holding both author and approval capability still produces explicit actor, role-context, reason, and history.
4. File review never implies customer `.gcode` execution or unsafe file exposure.
5. Stock alerts are actionable in the dashboard/header-bell direction and email policy is not confused with WhatsApp.
6. Save conflicts and stale records show visible recovery feedback to sighted operators.
7. Refund and free-reprint approval remain distinct from Finance/provider execution.

### 15.1 Visual-craft acceptance scenarios

1. With the logo hidden, a reviewer can explain the Niuva-specific
   need/file-to-output evidence thread from at least one public, one Retail, and
   one Order/Admin screenshot without relying on decorative technical labels.
2. The public/B2B first view uses approved authentic media and asymmetric
   evidence hierarchy; it is not a centered generic hero followed by equal
   cards.
3. The B2B form reads as a project brief in Indonesian, not as a template form
   paired with a generic explainer card.
4. The configurator, checkout, and Order frames preserve one recognizable
   Object Specification identity while changing only authoritative state and
   next action.
5. Admin/CMS frames prioritize record identity, queue, next action, conflict,
   and history without marketing-scale headings, numbered surface chrome,
   decorative telemetry, or generic KPI cards.
6. Participant Mode screenshots contain no Review Mode switch, scenario/fixture
   ID, frame ID, route contract, open-gate note, responsive-contract label,
   event log, evaluator instruction, or “bounded prototype” branding.
7. Indonesian/English usage, CTA intent, shape roles, color roles, and motion
   behavior remain consistent within each surface family.
8. Every visual asset has provenance and alt-text intent; no synthetic asset is
   mistaken for factual Niuva/client evidence.

### 15.2 Current implementation-evidence snapshot

This snapshot is descriptive evidence from baseline SHA `a61cc2b`; it is not
product authority, test-pass evidence, or an implementation authorization.

| Evidence area | Observed baseline | Packet implication |
| --- | --- | --- |
| Public and Retail discovery routes | `/`, public pages, `/retail`, and product detail exist | Mark route existence independently from whether the approved visual or transaction target is complete |
| B2B public intake | Inquiry payload, persistence call, safe UUID acknowledgement, and Admin Inquiry routes exist; form-primary hierarchy, required consent checkbox, and post-success WhatsApp continuation are incomplete | `/contact` is `Partial`, not “implemented amendment complete” |
| Customer transaction routes | `/register`, `/dashboard/notifications`, configurator, Request, Offer, checkout, and exact after-sales candidate routes are absent from `App.js` | Canonical/candidate route direction must not become an implementation claim |
| Customer and Admin Order routes | `/orders/:id`, `/admin/retail-orders`, and `/admin/orders` exist | Current customer/Admin Retail views are partial or historical/read-only; canonical target ownership is separate from source completeness |
| Public capability contract | Retail discovery is `active`; Retail create, checkout, payment, production upload, and Organization Portal are `inactive` | Prototype may show target/recovery states, but must label them simulated candidate evidence and never claim activation |
| Tests and browser evidence | Source tests exist for multiple current surfaces, but Phase B did not execute them and no prototype was produced by this packet | No test, browser, accessibility, moderated-session, readiness, or go-live claim is made |

### 15.3 Evidence required before implementation planning is promoted

- annotated desktop, 390px, 768px, 1024px, and 1440px compositions for the
  selected critical surfaces;
- a visual contact sheet covering Public/B2B, Retail/configurator,
  checkout/payment recovery, Order/after-sales, Admin/CMS, and Review Mode;
- a before/after visual-critique table for any prior prototype used as an
  anti-reference, with each issue mapped to the amended requirement that
  prevents recurrence;
- an asset manifest proving official-logo, authentic-project, and synthetic
  fixture provenance;
- a copy pass that confirms Indonesian-first Participant Mode and removes
  evaluator/technical chrome;
- one bounded anti-generic detector pass plus one independent expert visual
  critique over the final exact prototype state; detector success alone is
  insufficient;
- bounded interactive walkthroughs for every selected `FLOW-*` branch;
- keyboard-only completion of critical actions;
- visible focus, heading/landmark order, meaningful live-region behavior, and
  manual reflow/zoom checks;
- no meaning conveyed only by color, icon, motion, position, or fake percentage;
- loading, empty, error, retry, conflict, forbidden, stale, expired, uncertain,
  and reconciliation states;
- customer/operator copy review, including payment-uncertain and ownership-safe
  behavior;
- one non-IT operator review and one prospective-customer review only after the
  applicable prototype/session gate is explicitly opened; and
- recorded findings, severity, disposition, unresolved gates, and corrective
  decisions.

Prototype evidence is UX evidence only. It is not source completion, API/schema
approval, staging evidence, production readiness, or go-live evidence.

## 16. Open-gate registry

The registry preserves unresolved decisions rather than resolving them through
design. Imported `AG-*` labels originate in the Context Only 31 July route
candidate; they are not canonical decisions. New labels explicitly marked
`packet-local candidate` exist only in this packet.

| Gate | Decision required | Owner | Blocks | Required before | Current status |
| --- | --- | --- | --- | --- | --- |
| `AG-UX-03` — imported Context Only | Detailed Public/Retail navigation, CTA wording, and mobile journey-switch treatment | Owner TBD; prior candidate suggestion is not authority | Final navigation prototype and source plan | Final annotated navigation and implementation task card | Open; not canonical |
| `AG-UX-05` — imported Context Only | Exact role-aware Admin information architecture and navigation placement | Owner TBD | Final Admin IA/prototype and source plan | Admin interactive prototype and route task card | Open; `DEC-OPS-001` leaves exact IA deferred |
| `AG-AUTH-01/02/04` — imported Context Only | Registration/verification/abuse/recovery, safe draft continuation, and exact Admin route-to-permission mapping | Owner TBD | Authenticated Retail prototype assumptions and source implementation | Source task card; any transaction activation | Open; not authorized by this packet |
| `AG-UX-MVP-PRIORITY` — **packet-local candidate** | Confirm P0 versus P1 ownership and delivery order where authority only establishes an MVP direction | Owner TBD | Final implementation backlog and team sequencing | Backlog/API/task-card promotion | Open; classification remains candidate |
| `AG-UX-ADMIN-MOBILE` — **packet-local candidate** | Select full-operational, limited-operation, read/triage-only, or responsive-safe-only Admin smartphone support | Owner TBD | Final Admin 390px interactions and acceptance scope | Final Admin annotated wireframe/prototype and source plan | Open; no canonical selection found |
| `AG-UX-A11Y` — **packet-local candidate** | Select the target accessibility standard/conformance level and accountable validation owner | Owner TBD | Conformance claim and final validation plan | Prototype validation plan and any source acceptance gate | Open; principles approved, conformance target TBD |
| `AG-UX-CART-ROUTE` — **packet-local candidate** | Decide exact durable cart route/state ownership while preserving non-authoritative pre-auth behavior | Owner TBD | Final cart URL/state prototype and route plan | Cart prototype promotion or source task card | Open; `/retail/cart` is not a promoted NUF selection |
| `AG-UX-AFTER-ROUTES` — **packet-local candidate** | Decide exact revision/cancellation/complaint route and durable state ownership | Owner TBD | Final after-sales navigation and technical planning | After-sales interactive prototype promotion or source task card | Open; policy approved, exact paths candidate |
| `DEC-OFFER-01` activation gates | Exact preset/advanced fields, file/storage limits, profiles, slicing, build/quantity/deadline/risk thresholds, and offer expiry | Named accountable owner TBD under governing roles | Committed automatic calculation, file workflow, Assisted Offer activation | Source/API task card and transaction activation | Resolved direction; details open |
| `DEC-TAX-01` Finance gate | PKP/classification/rate/basis/invoice behavior and versioned tax profile | Finance authority; named owner TBD | Authoritative checkout total and payment activation | Checkout source/activation | Open Finance activation gate |
| `ADR-003` payment gates | Gateway, exact provider-state mapping, webhook authentication, reconciliation SLA/ownership, retention, and refund execution | Finance/Technical accountable owner TBD | Payment interactive detail, adapter source, activation, go-live | Provider integration and payment activation | Architecture approved; provider/operations open |
| `DEC-FUL-01` activation gates | Origin, pickup locations/hours/windows, package profiles, domestic validation, provider/service allowlist, and operations ownership | Accountable Operations/Technical owner TBD | Authoritative delivery/pickup implementation and activation | Checkout source/activation | Resolved direction; operational details open |
| `DEC-ETA-01` + `DEC-DATA-003` gates | Numeric calendars/durations/buffers, safe reason copy, exact aggregate/API, and event/source mapping | Accountable Product/Operations owner TBD | Authoritative ETA/tracking/notification implementation | Source task card and transaction activation | Resolved direction; implementation details open |
| `DEC-AFTER-01` activation gates | Legal terms, working-day calendar, evidence privacy/retention, abuse/fraud, exact case contract, Finance/provider handling, and long-term pickup policy | Accountable Legal/Operations/Finance owner TBD | Final after-sales copy, source, remedy execution, activation | After-sales source task card and customer activation | Resolved policy; activation details open |
| `DEC-OPS-003` CMS gates | Exact structured fields, preview/publish/rollback/archive behavior, operator SOP, training, and recovery | Accountable Product/Operations owner TBD | Final CMS prototype and source plan | CMS implementation task card/operator validation | Reduced topology approved; details open |
| `AG-DEL-*` — imported Context Only | Exact files, dependencies, tests, migration/rollback, feature flags, publication, deployment, readiness, and go-live approvals | Owner TBD by selected task/release | Source edits and every external-state transition | Each separately authorized delivery phase | Not authorized |

The packet may represent an open gate as disabled, pending, simulated, or
“requires confirmation.” It must not invent a value, owner, provider, SLA,
threshold, route authority, or completion claim.

## 17. Prototype validation exit criteria

These verdicts apply only to the maturity of this packet and a later prototype
built from it. They do not assess source implementation, moderated-session
authorization, staging, provider activation, production readiness, or go-live.

| Verdict | Qualitative criteria |
| --- | --- |
| `PASS` | Every selected critical flow is completable; commitment and ownership states are unambiguous; required responsive/accessibility/copy evidence is present; no open gate blocks the tested scope; findings have accepted dispositions. |
| `PASS WITH CONDITIONS` | Critical flows remain understandable and safe, but explicitly declared owner decisions or non-critical evidence remain open; the prototype neither hides those conditions nor represents them as implemented/active. |
| `REVISE` | A critical flow is incomplete, misleading, internally contradictory, or dependent on an unresolved gate that the prototype silently assumes. |

Automatic `REVISE` conditions are:

- a selected critical flow cannot be completed or safely exited;
- payment, Order, reservation, Request, Offer, or reconciliation state can be
  mistaken for another commitment state;
- ownership/authorization presentation reveals or implies access to another
  customer's record;
- a critical keyboard, focus, semantic-error, reflow, or equivalent-access
  blocker prevents task completion;
- a customer can interpret `quote_required` or offer acceptance as a committed
  checkout, Order, reservation, payment, or paid state;
- production progress presents fake percentage, exact queue position, or
  unverified telemetry as authoritative;
- an operator cannot find a visible recovery path for a stale/version conflict;
- the prototype silently selects a provider, threshold, policy, owner, route,
  Admin-mobile level, or accessibility conformance target that remains open.
- Participant Mode exposes Review Mode chrome, packet/fixture/frame/scenario
  IDs, evaluator instructions, responsive-contract labels, event logs, open
  gates, or prototype-only route annotations;
- the visual hierarchy is dominated by a reusable generic shell, repeated
  equal cards, numbered navigation, fake technical labels, oversized task-page
  headings, or one rounded panel per field/state;
- the public/B2B visual path lacks approved authentic evidence where such an
  asset exists, or fills a missing asset with fabricated proof;
- configurator, checkout, Order, and Admin screenshots cannot be distinguished
  except by changing headings and card contents;
- Participant Mode copy has unexplained mixed-language labels, duplicate CTA
  intents, fabricated precision, or generic AI marketing language; or
- visual review covers only one viewport, one happy state, or Review Mode and
  therefore cannot prove the amended cross-surface direction.

No numerical usability threshold is introduced. A later moderated-study plan
may propose metrics only through separate review and approval.

## 18. Traceability

### 18.1 Concern to governing authority

| Packet concern | Governing authority |
| --- | --- |
| Unified Homepage and B2B-primary hierarchy | `docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md` |
| Experimental Editorial Hybrid and Homepage typography/U-curve | `docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md` |
| Canonical routes, B2B form-first flow, optional WhatsApp, Retail routes, `/order`, and Admin queue ownership | `docs/decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md` |
| Admin Studio experience | `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md` |
| Admin scope reduction and restock-bell entry | `docs/decisions/experience/DEC-OPS-002-admin-scope-reduction.md` |
| Reduced structured integrated CMS | `docs/decisions/experience/DEC-OPS-003-reduced-integrated-cms-mvp.md` |
| Retail account requirement | `docs/decisions/product/DEC-RT-02-retail-account-required-checkout.md` |
| Offer/file/configuration/automatic-price/quote routing | `docs/decisions/product/DEC-OFFER-01-retail-offer-file-and-quote-routing.md` |
| Pricing formula and authoritative inputs | `docs/decisions/product/DEC-PRICE-001-custom-print-commercial-pricing.md` |
| Reservation duration and invariants | `docs/decisions/product/DEC-INV-01-retail-checkout-reservation-duration.md` |
| Provider-neutral payment and reconciliation | `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md` |
| ETA and factual milestone variants | `docs/decisions/product/DEC-ETA-01-retail-eta-and-customer-milestone-policy.md` |
| Pickup and domestic delivery | `docs/decisions/product/DEC-FUL-01-shipping-and-pickup-policy.md` |
| Revision, cancellation, complaint, refund, reprint, return | `docs/decisions/product/DEC-AFTER-01-retail-revision-and-after-sales-policy.md` |
| Notifications and no-WhatsApp automation boundary | `docs/decisions/product/DEC-DATA-003-notification-schema-retention-and-delivery-boundary.md` |
| Semantic tokens and component architecture | `DESIGN.md`, `frontend/src/index.css`, `frontend/tailwind.config.js`, `frontend/src/components/ui/` |
| Product orientation and journey separation | `docs/NIUVA_MASTER_SPEC.md`; `PRODUCT.md` remains subordinate orientation |

### 18.2 Critical requirement traceability

All `UX-*` IDs are packet-local candidates.

| Requirement ID | Requirement | Surface / flow | Authority | Wireframe / prototype | Validation / test |
| --- | --- | --- | --- | --- | --- |
| `UX-FOUND-001` | Keep Retail Order and B2B Quote/Project lifecycles distinct across shared foundations | All; every `FLOW-*` | Master Spec; approved PRD; `ADR-004` | TBD — next artifact | Lifecycle-language and cross-link review TBD |
| `UX-B2B-001` | Persist one public Inquiry before optional WhatsApp continuation | `/contact`; `FLOW-B2B-01` | Amended `DEC-UX-003` | TBD — annotated form/success states | Form, consent, acknowledgement, link-order evidence TBD |
| `UX-B2B-002` | Show Inquiry UUID and one-working-day first-human-response target without price/ETA promise | `/contact` success | Amended PRD/`DEC-UX-003` | TBD | Copy and safe-projection review TBD |
| `UX-RET-001` | Require authentication before private upload or authoritative Retail commitment | Configurator, checkout, Order | `DEC-RT-02` | TBD | Auth boundary/continuation review TBD |
| `UX-RET-002` | Route unsafe or uncertain automatic commitment to retained-context `quote_required` | `FLOW-RET-CUSTOM-01`, `FLOW-RET-QUOTE-01` | `DEC-OFFER-01` | TBD | Branch/context-retention review TBD |
| `UX-OFFER-001` | Keep Request and immutable Assisted Offer separate; acceptance creates no Order/reservation/payment | Request/Offer | `DEC-OFFER-01`; `DEC-UX-003` | TBD | State-language and negative-effect review TBD |
| `UX-CHECKOUT-001` | Show authoritative snapshot and visible deltas requiring reconfirmation | Checkout | `DEC-OFFER-01`; `DEC-FUL-01`; `DEC-ETA-01` | TBD | Stale price/ETA/stock/rate scenarios TBD |
| `UX-RES-001` | Start the 30-minute reservation only after Order and payment-attempt creation | Checkout/payment | `DEC-INV-01` | TBD | Timer, expiry, competing-transition review TBD |
| `UX-PAY-001` | Treat uncertain payment as reconciliation-required and prevent blind duplicate payment | `FLOW-PAY-UNCERTAIN-01` | `ADR-003`; `DEC-INV-01` | TBD | Back-navigation/retry/reconciliation scenario TBD |
| `UX-ORDER-001` | Show the correct one of four factual milestone variants and safe ETA/exception history | `FLOW-ORDER-01` | `DEC-ETA-01` | TBD | Ready/custom × pickup/delivery walkthroughs TBD |
| `UX-AFTER-001` | Keep after-sales eligibility, review, approval, execution, and outcome distinct | `FLOW-AFTER-01` | `DEC-AFTER-01` | TBD | Revision/cancellation/complaint branches TBD |
| `UX-ADMIN-001` | Make role, next action, conflict, permission, history, and recovery visible without changing backend authority | `FLOW-ADMIN-01` | `DEC-OPS-001`; access decisions | TBD | Non-IT operator and role-boundary review TBD |
| `UX-CMS-001` | Preserve structured fields, explicit publication control, versions, rollback, and visible save conflicts | CMS | `DEC-OPS-003`; `DESIGN.md` | TBD | Draft/preview/publish/conflict scenarios TBD |
| `UX-PRIV-001` | Exclude internal cost, margin, supplier, profit, notes, raw provider payloads, and foreign-customer data | Customer/public projections | Master Spec; access decisions; lifecycle decisions | TBD | Projection/copy/ownership review TBD |
| `UX-VIS-001` | Express the need/file-to-output evidence thread through surface-appropriate composition without copying one motif everywhere | Public/B2B, Retail/customer, Admin/CMS | `DEC-UX-002`; `DEC-OPS-001`; `DESIGN.md`; packet sections 3 and 8 | Amended prototype task card | Cross-surface contact sheet plus human visual critique TBD |
| `UX-VIS-002` | Keep Participant Mode free from review chrome and generic numbered prototype-shell treatment | All Participant Mode frames | Packet mode boundary; `DEC-OPS-001`; `DESIGN.md` | Amended prototype task card | Participant/Review screenshot diff and detector assertions TBD |
| `UX-ASSET-001` | Use official identity, approved authentic project evidence, and provenance-labelled synthetic fixture media only | Public/B2B, projects, Retail fixtures | `DEC-UX-002`; brand guardrail; `DESIGN.md` | Amended prototype task card | Asset-manifest and alt-text review TBD |
| `UX-MOTION-001` | Keep motion purposeful, surface-calibrated, reduced-motion safe, and nearly absent from high-frequency operator work | All selected surfaces | `DEC-UX-002`; `DEC-OPS-001`; `DESIGN.md` | Amended prototype task card | Reduced-motion, keyboard, timing/property, and visual review TBD |
| `UX-COPY-001` | Use Indonesian-first participant copy, stable action labels, and no evaluator or generic AI-marketing language | All Participant Mode frames | Brand voice guardrail; amended `DEC-UX-003`; packet copy contract | Amended prototype task card | Full visible-string audit TBD |
| `UX-RESP-001` | Recompose critical surfaces at 390/768/1024/1440 without hidden actions or unintended overflow | All selected surfaces | `DESIGN.md`; packet section 9 | TBD | Responsive composition/overflow evidence TBD |
| `UX-A11Y-001` | Provide keyboard, focus, semantics, non-color meaning, reduced motion, and accessible error/recovery | All selected surfaces | `DEC-OPS-001`; `DESIGN.md` | TBD | Target level gated; manual/automated evidence TBD |

## 19. Review, verdict, and handoff status

**Current packet-maturity verdict:** `PASS WITH CONDITIONS`.

The packet is ready to remain the parent design contract for the existing
**Annotated Wireframe & Bounded Interactive Prototype Packet** and its amended
prototype-building task card. The 9 August amendment adds a named
cross-surface thesis, differentiation anchor, surface calibration, asset/copy
rules, anti-generic failure conditions, and visual-evidence requirements. It
does not retroactively make an earlier prototype visually accepted.

The conditions are:

1. MVP classifications marked `Owner confirmation required` cannot become a
   delivery backlog until `AG-UX-MVP-PRIORITY` is resolved.
2. Admin smartphone interaction beyond responsive-safe composition cannot be
   finalized until `AG-UX-ADMIN-MOBILE` is resolved.
3. No WCAG conformance claim or final accessibility acceptance plan may be made
   until `AG-UX-A11Y` is resolved.
4. `/retail/cart` and exact after-sales paths remain candidate routes and must
   be labelled as such in prototype evidence.
5. Simulated transaction states must be visibly separated from current source
   existence and inactive capabilities.
6. The existing R5 synthetic prototype is visual anti-reference evidence only
   until an amended prototype run proves the `UX-VIS-*`, `UX-ASSET-001`,
   `UX-MOTION-001`, and `UX-COPY-001` requirements on the exact final state.

The next execution artifact is the amended **prototype-only** task card. It
maps the selected `UX-*` requirements and `FLOW-*` branches to isolated
desktop/mobile frames, interaction transitions, simulated data states, asset
provenance, visual QA, and a validation plan. It is not a production-source
implementation task card.
Any canonical promotion, source implementation, API/schema work, migration,
commit, push, PR, provider activation, deployment, moderated session,
production-readiness, or go-live step requires separate explicit authorization.
