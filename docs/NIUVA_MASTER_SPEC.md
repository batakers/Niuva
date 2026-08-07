# Niuva Master Specification

Status: **Approved Canonical**
Draft date: 23 July 2026
Approval date: 23 July 2026
Last canonical amendment: 8 August 2026 — narrowed MVP B2B public intake
Approval record: `docs/decisions/APPROVAL-NIUVA-CANONICAL-DOCUMENTATION-2026-07-23.md`
Scope: Product, business, experience, data, operational, security, and implementation boundaries for the Niuva website and platform

## 1. Document Status and Authority

This document is Niuva's canonical product and experience specification. It consolidates active decisions into a concise planning baseline without reproducing the full BRD, PRS, PRD, ADR, runbook, brand reference, or implementation plan.

Effective 23 July 2026, this document is the primary product and experience source of truth. Approved decisions and ADRs retain authority within their specific scopes, and approved BRD, PRS, and PRD documents remain provenance and authority where this specification is explicitly silent.

### Effective authority order

1. This Master Specification for consolidated product and experience direction.
2. Approved decision records and ADRs for decisions within their specific scope.
3. Approved BRD, PRS, PRD, and unified platform design as requirements provenance where this document is silent.
4. Active implementation guardrails such as `AGENTS.md`, provided they do not conflict with this document or an approved decision.
5. Runbooks for rollout, migration, rollback, backup, recovery, and handover procedures.
6. Brand Guidelines and Company Profile as supporting brand and factual references.
7. Approved implementation specs and plans within their authorized scope.
8. Current implementation as evidence of system state, not as requirement authority.

Approved ADRs are not replaced by summaries in this document. In particular:

- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
- `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`
- `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`
- `docs/decisions/architecture/ADR-004-surface-boundary-topology.md`

Runbooks are procedural authority only. They do not decide product direction, customer journeys, business policy, visual direction, or brand identity.

Documents marked Superseded, Candidate, Context Only, or Archive Candidate are not implementation authority. A newer date alone does not make a document authoritative. Approval status, scope, supersession, and explicit decision evidence must be checked through `docs/context/DOCUMENT_REGISTER.md` and `docs/decisions/DECISION_REGISTER.md`.

Current source code, UI, schemas, routes, and tests must be inspected before implementation, but they do not override approved requirements. When implementation conflicts with an approved requirement, the conflict must be reported and resolved deliberately.

Primary provenance:

- `docs/decisions/evidence/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md`
- `docs/references/requirements/approved-baselines/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md`
- `docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md`
- `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md`
- `docs/implementation/specs/active/2026-07-14-unified-retail-b2b-platform-design.md`

## 2. Product Definition

Niuva is one website and one operational platform with two customer journeys:

1. **Retail** for individuals and UMKM purchasing ready-stock, 3D printing, apparel, or standardized custom merchandise.
2. **Business/B2B** for companies and institutions requiring bulk or repeat procurement, R&D, design engineering, prototyping, workshops, or complex custom projects.

The journeys share identity, organization, catalog, materials, inventory, production, payment infrastructure, fulfillment, notification, audit, CMS, and Admin Studio foundations.

Shared foundations do not mean shared customer lifecycles. Retail Order and B2B Quote/Project remain separate aggregates, state machines, authorization projections, and customer experiences.

For MVP, the approved technical surface topology is one frontend application
under one origin with route-based Public, Retail, customer-account, B2B, and
Admin Studio surfaces. `ADR-004` / `DEC-ARCH-01` governs this topology and
`DEC-UX-003` governs canonical route ownership. This selection does not merge
journeys or make a route an authorization boundary.

Sources: `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md`; `docs/implementation/specs/active/2026-07-14-unified-retail-b2b-platform-design.md`; `docs/decisions/architecture/ADR-004-surface-boundary-topology.md`; `docs/decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md`.

## 3. Business Positioning

The primary positioning is:

> Mitra R&D, design engineering, dan prototyping untuk pengembangan produk inovatif.

Niuva must be understood as a strategic product-development partner that connects research, design, engineering, prototyping, testing, and implementation.

Retail is an additional transaction journey. It must not replace the main positioning or make Niuva marketplace-first, Retail-first, e-commerce-only, or merchandise-led. R&D, design engineering, prototyping, and real project evidence remain prominent across the public brand experience.

Sources: `docs/references/requirements/historical-active/BRD_Website_Niuva.md`; `docs/references/requirements/historical-active/PRS_Website_Niuva.md`; `docs/references/requirements/approved-baselines/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md`.

## 4. Users and Roles

### Customer users

- **Retail Visitor:** browse, inspect products, choose non-sensitive
  configuration, and maintain a non-authoritative local cart.
- **Retail Account:** authenticated private upload, authoritative checkout,
  payment, order history, permitted file access, and production tracking. Every
  new Retail Order requires an authenticated account.
- **B2B Organization:** inquiry may begin without login; quotation and project access require an organization account.

`DEC-RT-02` supersedes guest checkout for new Retail transactions. Historical
guest-shaped records, if any, remain ownership-scoped and are not automatically
linked to an account by matching contact data.

### B2B organization roles

- Owner
- Project PIC
- Approver
- Finance
- Viewer

Organization members may access only assigned organizations and projects. Approval, finance, and membership rights must be enforced by backend policy and query scope.

### Internal roles

- Content Editor
- Catalog Manager
- Warehouse
- Order Admin
- Sales/Estimator
- Designer/Engineer
- Production
- Quality Control
- Finance
- Manager/Approver
- Super Admin

Authorization must be enforced in backend handlers, services, and data queries. Hiding a control is a usability measure, not authorization. Use least privilege, conflict-safe approval behavior, and audit records for sensitive actions.

The granular internal role model remains canonical. Internal accounts may hold
multiple explicitly assigned granular roles; effective permissions are additive,
while `super_admin` is exclusive. Only Super Admin receives the internal user
directory and identity-governance mutations. Operational staff do not receive a
general user directory, complete role definitions, or the full audit log.
Domain-scoped audit timelines expose only allowlisted fields for records the actor
may read. Safe self-role metadata and minimal order/project-scoped customer
projections are not a general user directory.

Sources: `docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md`; `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md`; `docs/decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md`; `docs/decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md`; `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md` for procedure only.

## 5. Product Structure

```text
Public Website
├── Shared Brand/Company
├── Retail
└── Business/B2B

Authenticated
├── Retail Account
├── B2B Organization Portal
└── Admin Studio
    ├── CMS
    └── Operations Back-office
```

Admin Studio is not a third customer journey. It is the shared operational environment for authorized staff.

## 6. Customer Journeys

### Retail journey

```text
Catalog
→ Configure
→ Register/Login
→ Upload
→ Safe Price/ETA
→ Checkout
→ Payment
→ File Review
→ Production
→ QC
→ Fulfillment
```

Retail prioritizes product discovery, configuration clarity, validated file requirements, authoritative totals, ETA, payment state, real production milestones, and shipment or pickup state.

### Business/B2B

```text
Inquiry/RFQ
→ Estimate
→ Quotation
→ Approval/Revision
→ Design/Engineering
→ Design Approval
→ Payment Term
→ Production
→ QC
→ Shipment
```

B2B prioritizes scope clarity, versioned quotation, approval authority, design versions, milestones, payment terms, and governed change.

When a Retail configuration cannot be priced or scheduled safely, the action
becomes `quote_required`. This is a commitment route, not a customer type.
Product, configuration, file version, quantity, safe analysis, contact, and
fulfillment context must transfer without re-entry. In a mixed cart, the
quote-required item is separated while eligible items remain available for
direct checkout.

Bulk, borongan, partnership, recurring, organizational, contractual, and
special-fulfillment work enters the B2B Inquiry → Quote/Project path. An
individual or UMKM request that can still follow Retail operations may receive
a private, versioned, manager-approved Assisted Retail Offer. Requesting or
accepting that offer creates no Order, reservation, payment attempt, or paid
state; an accepted active offer enters the normal Retail checkout and is
revalidated there. This fallback does not collapse the Retail and B2B
lifecycles into one model. See `DEC-OFFER-01`.

For the narrowed MVP, the first public B2B and partnership entry is a
structured `/contact` form that may be submitted without login. The Inquiry is
persisted with status `new` before an optional user-clicked continuation to the
approved Niuva WhatsApp destination is shown. The existing Inquiry UUID is the
customer reference; the operator remains responsible for manual triage and
follow-up. This continuation is not an automatic notification, webhook,
campaign, retry worker, or SLA reminder, and it does not alter the Retail
no-WhatsApp notification boundary. Public raw-file upload and a customer B2B
organization portal remain outside the narrowed MVP; quotation/project access
still follows the broader organization-account direction when that surface is
separately activated. `DEC-UX-003` governs the route amendment.

## 7. Public Website and Homepage

### Homepage pattern

The Homepage uses a **Unified Homepage**:

- Business/B2B is the primary narrative.
- Retail is a secondary but clearly discoverable path.
- The Homepage must not be Retail-first, marketplace-first, or e-commerce-only.
- It must not resemble a generic SaaS, generic vendor, or AI-generated landing page.

This is an explicit user decision recorded during documentation consolidation, 23 July 2026. It closes the former deferred Homepage-pattern decision. Detailed Retail/B2B navigation treatment remains deferred.

### Visual direction

The approved direction is **Experimental Editorial Hybrid**:

- technical personality and transformation logic from Experimental Engineering Studio;
- clarity, typography, project presentation, and restraint from Editorial Product Studio.

### Homepage rules

- Poppins is used for display, headings, navigation-style UI, and buttons.
- Inter is used for body copy, labels, captions, forms, and public metadata.
- Monospace is used only for real technical data and never as decorative shorthand for engineering.
- The U-curve is a semantic transformation path: `Need → Research → Experiment → Prototype → Output`.
- The initial Homepage has two dominant U-curve placements: one compact path in the hero and one complete path in the process section.
- The U-curve is not wallpaper and is not repeated across cards or sections.
- Public motion intensity is at most 5/10 and must explain hierarchy, process, or media state.
- Reduced-motion mode must show all content, stages, media, and actions without motion-dependent meaning.
- Portfolio content uses authentic evidence and mini case studies with context, challenge, method or solution, output, and capability proven.
- Research & Development and Design & Prototyping remain the primary capabilities.
- Consultant & Workshop and Apparel & Merchandise remain supporting capabilities.

Sources: `docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md`; `docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md`; `docs/decisions/evidence/HOMEPAGE_PROTOTYPE_DECISION.md`.

## 8. Brand System

### Identity

- The official company brandmark is the `ni` mark defined by `docs/references/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf`.
- A constructed technical “N” must not be used as the Niuva company logo.
- Logo geometry, clear space, proportions, and approved color usage must be preserved.

### Palette and color behavior

The approved palette consists of Niuva Blue `#6390BB`, Sky Blue `#8AAECF`, Blue Dark `#4A72A0`, Midnight `#1C2B3A`, Steel `#3D5266`, Smoke `#6B7A8D`, Silver `#E2E8EE`, Frost `#EBF1F7`, Cloud `#F8F9FB`, and Pure White `#FFFFFF`, with semantic success, warning, and error colors where operationally required.

Blue is scarce and purposeful. Use it for identity, primary action, focus/active state, meaningful diagrams, selected emphasis, and real status semantics. Do not turn every card, label, divider, or background into a blue accent. Accessible interaction contrast takes priority over decorative use.

### Typography, shape, elevation, and media

- Poppins + Inter is the official public-brand typography baseline. This baseline defines the intended brand system; it does not claim that implementation has already been migrated across every public route.
- Homepage use is locked: Poppins is used for display, headings, navigation-style UI, and buttons; Inter is used for body copy, labels, captions, forms, and metadata.
- Migration or rollout to About, Capabilities, Projects, and Contact remains deferred.
- Permanent broader digital-brand publication remains tied to the deferred Brand Guidelines v1.1.
- Radius is controlled by component meaning; full pills are reserved for controls or states that require them.
- Elevation is flat-first: borders, spacing, and hierarchy precede shadow.
- Photography must show authentic projects, people, process, materials, testing, workshops, or environments. Stock imagery must not be represented as Niuva project evidence.
- Graphic motifs must carry meaning and remain scarce.
- Gradients, neon, glassmorphism, fake dashboards, fake telemetry, and decorative technical effects are not part of the active direction.

Public brand pages may be more expressive and editorial. Retail, customer portals, and operational surfaces must apply the same identity with greater clarity, restraint, and task focus.

Sources: `docs/references/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf`; `docs/references/brand/BRAND_WEBSITE_AUDIT.md`; `docs/decisions/evidence/HOMEPAGE_PROTOTYPE_DECISION.md`.

## 9. Surface-Specific Experience Rules

### Public Brand/B2B

- Expressive, editorial, evidence-led, and credible.
- Lead with positioning, capability proof, real projects, and a clear project-discussion path.
- Avoid repetitive cards, repeated eyebrow labels, identical sections, or generic consulting composition.

### Retail

- Prioritize discovery, product facts, configuration, file requirements, availability, price/ETA, checkout, payment, and tracking.
- Distinguish fixed, calculated, and quote-required behavior before commitment.
- Show loading, empty, error, conflict, retry, permission, and expired states where relevant.

### Customer Portal

- Prioritize current status, next action, approvals, files, payment, milestones, ETA, QC, and shipment.
- Show only customer-safe information and reasons.
- Use real milestones rather than invented percentage progress.

### Admin Studio

- Role-aware.
- Permission-aware.
- Task-oriented.
- Dense but calm.
- Status-driven.
- Auditable.
- Recovery-aware.
- Accessible.
- Optimized for data clarity, next action, conflict handling, and routine work.
- Does not copy public marketing decoration directly.
- Contains CMS and Operations Back-office; it is not a third customer journey.

The following pseudo-terminal decorations are prohibited as design direction:

- `SYS_ADMIN_CONSOLE`
- `MODULE_LOADED`
- `METRIC_ID`
- `FETCHING_TELEMETRY`
- `ACCESS_LEVEL`
- decorative status dots without functional meaning

Technical IDs, SKU values, order numbers, revision numbers, timestamps, operation IDs, audit identifiers, and real status codes may use an appropriate data treatment, but must not turn the interface into a simulated terminal.

Source: `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md`.

## 10. CMS Rules

CMS is an integrated, structured module in Admin Studio. It is not an external CMS and not a free-form page builder.

For MVP, `DEC-OPS-003` selects a reduced integrated CMS topology. The reduced
surface prioritizes the structured public content required for launch while
retaining validation, permission-aware publishing, versioning, rollback,
archive, and audit requirements. A single operator may author and publish only
when that account also holds the applicable `manager_approver` capability.
Content management remains separate from inventory, pricing, Retail Order,
payment, production, and B2B Project sources of truth.

The content lifecycle is:

```text
draft → review → preview → published/scheduled → archived
```

CMS must support:

- structured fields;
- required-field validation;
- preview;
- review and permission-aware publishing;
- scheduling;
- version history;
- rollback that remains auditable;
- archive or soft delete;
- audit actor, time, target, and reason where required.

Publishing is blocked when required content, SKU, media, CTA, pricing, or production rules are invalid. Homepage schema may be designed only from the recorded Unified Homepage decision and still requires explicit implementation authorization.

## 11. Commercial and Historical Truth

Pricing modes are:

- `fixed` for ready-stock or validated fixed variants;
- `calculated` for standardized custom work with complete, validated rules;
- `quote_required` for nonstandard, uncertain, or complex work.

`DEC-OFFER-01` keeps customer offer, pricing behavior, and fulfillment behavior
independent through `offer_type`, `pricing_mode`, and `fulfillment_mode`.
Ready Products may be ready-stock or made-to-order with fixed pricing; Standard
Custom 3D Print is calculated and made-to-order only when all file, profile,
capacity, ETA, tax, and fulfillment validations succeed.

Custom 3D Print provides a default Simple configuration and an optional
Detailed/advanced configuration containing only Niuva-calibrated values.
Niuva-authoritative machine, nozzle, material, support, and process profiles
always replace customer-embedded slicer settings. `.stl` and a supported
single-model/plate `.3mf` may be eligible for automated validation and slicing;
`.obj`, `.step`, `.stp`, ZIP, multiple models/parts/plates, and complex projects
require manual review and quotation. PDF, JPG/JPEG, and PNG are quotation
references only. Customer `.gcode` is rejected.

Before calculated work enters checkout, the customer confirms the exact file
version, dimensions/scale, material/color/quantity/configuration, slicer-derived
billable grams and print duration, customer-safe price breakdown, final
production total, ETA range, and fulfillment. The server then revalidates all
commercial and production inputs. Validation/slicing failure, unsupported or
unsafe profiles, CAD repair, nonstandard finishing/assembly/post-processing,
complex files, unsafe quantity/deadline/capacity, bulk/bundle/borongan/
partnership/recurring/customer-filament work, unsafe fulfillment, or an audited
operator risk rejection becomes `quote_required`.

An Assisted Retail Offer is private, customer-bound, immutable by version, and
uses `draft → awaiting_approval → offered → accepted | declined | expired |
superseded`. Manual price commitment requires `manager_approver`. Acceptance
enters the normal Retail checkout; ownership, active version, expiry, tax,
capacity, ETA, and fulfillment are revalidated there. It does not mutate public
catalog pricing or merge Retail Order with B2B Quote/Project.

`DEC-PRICE-001` approves Custom 3D Print policy `NIUVA-CP-FDM-001` for
validated FDM work using Niuva-owned PLA or ABS filament:

- PLA uses progressive rates of Rp1.000/g for the first 200 g, Rp900/g for the
  next 300 g, and Rp800/g above 500 g;
- ABS uses progressive rates of Rp1.200/g for the first 200 g, Rp1.100/g for
  the next 300 g, and Rp1.000/g above 500 g;
- machine price is exact print seconds divided by 3.600, multiplied by
  Rp5.000;
- billable weight includes model, support, brim/raft, and purge/waste;
- there is no 50-gram minimum and no weight, duration, or component rounding;
- material plus machine is rounded once using `ROUND_HALF_UP` to the nearest
  rupiah; and
- electricity, basic finishing, basic packaging, support removal, QC,
  failed-print risk, and legally applicable indirect tax are included.
  Shipping/pickup remains a separate fulfillment line.

The policy approval date is not its effective date. Activation occurs only
with a separately authorized checkout MVP launch, an exact `Asia/Jakarta`
`effective_at`, and the Finance-confirmed tax profile required by `DEC-TAX-01`.
While Niuva's PKP status remains unknown, the UI must not display a PPN amount
or rate, promise a Faktur Pajak, or activate production checkout.

Accepted quotation versions and approved design versions are immutable. Scope changes create new versions and may change price, ETA, milestones, and payment terms.

Each Quote-version line has an immutable `quote_line_id`. Work Orders retain
their accepted `source_quote_version_id` and exact `quote_line_id`; a historical
line that cannot be identified uniquely remains read-only and must not be
inferred or backfilled automatically. See `DEC-DATA-002`.

Material prices use versions and effective dates. New prices affect new calculations or explicitly recalculated drafts, not paid orders or accepted quotations. Commercial records store product, configuration, material, price, and policy snapshots appropriate to their lifecycle.

Referenced materials, content, and commercial data are archived rather than hard-deleted. Monetary values use Decimal or a consistent minor-unit representation, never binary floating point.

## 12. Inventory and Operational Integrity

```text
available = on_hand - reserved
projected = available + incoming - planned_demand
```

Inventory and operational mutations must provide:

- unique operation IDs;
- idempotent retry behavior;
- atomic updates or approved multi-document transactions where required;
- negative-stock prevention;
- reservation, release, consume, expiry, and reconciliation behavior;
- explicit conflict handling;
- stale-version rejection;
- audit for sensitive adjustments;
- real milestones and ETA history;
- customer-safe explanations for ETA changes.

Notification failure must not roll back an otherwise successful core transaction.

Retail checkout uses the fixed 30-minute reservation policy in `DEC-INV-01`.
The clock starts after successful creation of the order and payment attempt,
not when a cart or checkout page is opened. Checkout shows the remaining time
and a five-minute warning, does not extend the reservation automatically, and
revalidates price, stock or material, shipping, and ETA before any retry after
expiry. Payment success and expiry are atomic competing transitions; late
success enters reconciliation and never silently recreates stock or creates a
second paid order. A payment method cannot be activated unless its expiry and
callback behavior can be enforced or reconciled safely with this policy.

Retail fulfillment follows `DEC-FUL-01`:

- eligible direct-checkout Ready Product and Custom 3D Print orders offer Rp0
  pickup or automatically rated domestic Indonesia delivery;
- international, special-packaging, unsupported, oversize, unsafe, or uncertain
  fulfillment becomes `quote_required`;
- basic packaging is included in the standard customer price;
- delivery eligibility and rate use authoritative origin, normalized domestic
  address, and versioned package inputs;
- rate validity is the provider expiry capped at 30 minutes, or 30 minutes when
  no provider expiry is supplied;
- an expired or changed rate/service/ETA is refreshed and explicitly
  reconfirmed before order/payment-attempt creation;
- location is selected at checkout, while the pickup window is selected only
  after `ready_for_pickup`; and
- seven calendar days without recorded handover creates internal
  `pickup_overdue` plus dashboard/email follow-up, never automatic
  cancellation, disposal, storage fee, refund, ownership transfer, or
  completion.

The committed order snapshots its fulfillment policy, location or normalized
address, package profile/input, provider-neutral service, delivery amount,
quote timestamps, delivery estimate, and later customer-safe tracking. Actual
providers, origin/location data, operating hours/windows, package profiles,
service allowlists, Finance treatment, and operational ownership remain
activation gates.

Retail ETA and customer milestones follow `DEC-ETA-01`:

- checkout shows an `eta_earliest_at` to `eta_latest_at` range in
  `Asia/Jakarta`, not a guaranteed single date;
- pickup shows an estimated ready range, while delivery separately shows
  estimated ready-to-ship and arrival ranges;
- Ready Product uses handling/packing, buffer, and fulfillment inputs;
- eligible Custom Print additionally uses applicable file/material readiness,
  production queue range, exact accepted slicer time, post-processing, and QC;
- post-payment tracking uses factual, product-appropriate milestones with
  completed times, next action, current ETA, and customer-safe exceptions;
- authorized `production`, `quality_control`, and `order_admin` actors may
  publish routine domain updates directly with reason and append-only audit
  history; and
- passing the latest ETA before its target milestone creates internal
  `eta_overdue` and requires a new range/reason, never automatic cancellation,
  refund, reprint, disposal, or completion.

The Retail milestone contract does not replace the B2B Quote/Project lifecycle.
Numeric duration, operating-calendar, buffer, and safe-copy profiles plus the
exact backend state machine/API/schema remain separate activation or
implementation gates. Retail notification recipients/channels follow amended
`DEC-DATA-003`; provider selection and notification implementation/activation
remain gated. Live printer telemetry is not an MVP dependency.

Retail revision and after-sales handling follows `DEC-AFTER-01`:

- `file_revision_required` gives the customer 48 hours from a successfully
  available customer-facing notice; timeout enters review and never infers an
  automatic refund amount;
- unpaid cancellation releases any reservation exactly once and has no
  paid-order refund;
- an approved paid cancellation before actual printing/customization or
  Ready-Product handoff receives the full eligible customer-paid amount,
  including unused fulfillment, without deducting provider or administrative
  fees;
- after irreversible work starts, cancellation is manual and any partial refund
  requires an exact affected or unperformed amount agreed with the customer;
- defect, damage, wrong-item, or nonconformity complaint intake remains open for
  at least two working days after authoritative delivery or pickup handover,
  without automatically extinguishing later or hidden-defect review;
- confirmed Niuva error or carrier damage gives the customer a choice of
  affected-scope reprint/replacement or refund, with Niuva-funded required
  return/replacement shipping;
- complaint acknowledgement is immediate, first human response targets one
  working day, and the resolution decision targets five working days after
  sufficient evidence; and
- `order_admin` triages, domain roles contribute evidence, `finance` prepares
  refund work, and every refund or free reprint/replacement requires
  `manager_approver`.

Direct-checkout Retail Orders use this policy; B2B Quote/Project after-sales
remains governed by the accepted quotation, statement of work, or contract.
Legal/customer-terms review, working-day configuration, provider refund
execution, Finance accounting/tax handling, exact technical contracts,
notification implementation, and activation remain gated.

Retail operator and customer notifications follow amended `DEC-DATA-003`:

- the authenticated Retail Order owner is the only customer recipient;
- internal recipients are role-, permission-, and domain-scoped rather than
  broadcast to every Admin;
- the customer allowlist covers material payment, file revision, ETA,
  fulfillment, cancellation, complaint, reprint/replacement, and refund events;
- the operator allowlist covers actionable order readiness, stock, payment
  reconciliation, file, production/QC, ETA, fulfillment, after-sales approval,
  refund-failure, and notification-delivery conditions;
- complete milestone tracking remains on the Retail Order detail, while bell
  and email communicate important change or required action;
- in-app allowlisted events cannot be disabled; routine production-progress
  email uses one default-on customer preference;
- mandatory transactional email means the provider-neutral outbox must enqueue
  it, not that external delivery is guaranteed;
- payloads are minimal and customer-safe, and deep links are audience-aware,
  same-origin, allowlisted, authenticated, and ownership/permission checked;
- email is attempted at most five times, then becomes `exhausted`; an authorized
  `order_admin` may request a controlled, immutable-template resend; and
- WhatsApp, marketing/broadcast, arbitrary recipient selection, and B2B
  Quote/Project notification policy are not approved by this Retail amendment.

The existing 180-day in-app and 30-day terminal delivery-metadata retention,
provider-neutral outbox, deduplication, non-rollback, privacy, and historical
data boundaries remain unchanged. Provider/scheduler/worker selection, exact
event enum/source mapping, preference UI, implementation, migration,
deployment, readiness, and go-live remain separate gates.

Detailed rollout, migration, correction, rollback, and recovery procedures remain in `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md` and other relevant runbooks.

## 13. Security and Data Boundaries

- Protected operations require backend authorization and least privilege.
- Customer responses and views must exclude internal cost, margin, supplier, profit, and internal notes.
- Legacy Order compatibility is retained as an ownership-scoped, read-only
  historical surface. Customer output must use an explicit safe allowlist;
  ambiguous free-text provenance stays withheld, and file access remains
  controlled rather than exposing raw storage paths. See `DEC-ACCESS-003`.
- File access requires type/size validation, ownership checks, authorization, and controlled access.
- Production files use private persistent storage through a provider-neutral storage port.
- Local filesystem storage is development/demo only.
- MongoDB replica-set multi-document transactions are required for cross-collection mutations that need atomicity.
- Transaction-required operations fail closed with `503 transaction_unavailable` when capability is unavailable.
- Retail production payment uses provider-neutral online-payment orchestration with separate adapters.
- Provider events and webhooks must be idempotent and have explicit refund and reconciliation boundaries.
- Manual transfer is not the Retail production baseline. `DEC-PAY-02` makes existing manual-transfer records read-only and disables new manual-transfer instructions, attempts, payment-proof uploads, and proof-driven transitions.
- Credentials, secret values, API keys, and raw provider secrets must not be stored in product documentation or committed to the repository.
- Logs must avoid unnecessary personal, financial, file, and provider data.

Technical sources: `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`; `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`; `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`.

## 14. Accessibility and Responsive Requirements

- Indonesian is the primary language. Relevant English technical terms are permitted when they improve clarity.
- Core bilingual journeys, where offered, must be complete rather than partially translated.
- Text and controls require readable contrast.
- Keyboard navigation and visible `:focus-visible` treatment are required.
- Interactive controls require a usable touch target appropriate to their context, with 44px as the general mobile target.
- Headings, landmarks, labels, errors, and state changes must be semantic.
- Layouts must work on desktop, tablet, and mobile without horizontal overflow or lost actions.
- Reduced-motion preferences must be honored.
- Status, validation, approval, progress, and error meaning must not depend only on color, icon, or animation.
- Forms, uploads, configuration, checkout, tables, and recovery actions must remain understandable with assistive technology.

## 15. Locked Decisions

| Decision | Status | Source |
|---|---|---|
| One website and one operational platform | Approved Baseline | `docs/references/requirements/approved-baselines/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md` |
| Retail and Business/B2B are separate customer journeys | Approved Baseline | `docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md` |
| Shared foundations do not merge Retail and B2B lifecycles | Approved Baseline | `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md` |
| R&D, design engineering, and prototyping remain the primary positioning | Historical Active + Approved v2.1 continuation | `docs/references/requirements/historical-active/BRD_Website_Niuva.md`; `docs/references/requirements/approved-baselines/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md` |
| Retail is an additional transaction journey | Approved Baseline | `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md` |
| Unified Homepage | Approved Decision | `docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md` |
| Business/B2B is the primary Homepage narrative | Approved Decision | `docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md` |
| Retail is a secondary but clear Homepage path | Approved Decision | `docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md` |
| MVP surfaces use one frontend application under one origin with route-based boundaries | Approved Architecture Decision | `docs/decisions/architecture/ADR-004-surface-boundary-topology.md` |
| Canonical MVP public aliases, Retail account/configuration/request/offer/checkout and Order destinations, legacy-route treatment, and Admin Retail queue ownership | Approved Decision | `docs/decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md` |
| Narrowed MVP B2B public intake uses a persisted form-first Inquiry with optional user-clicked WhatsApp continuation, existing Inquiry UUID reference, no public raw-file upload, and manual one-working-day follow-up target | Approved Decision — Documentation Only; No Implementation Authority | Amended `docs/decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md`; `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md`; explicit user approval recorded 8 August 2026 |
| Experimental Editorial Hybrid | Approved Decision | `docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md` |
| Homepage uses Poppins + Inter with the approved display/UI and body/metadata roles | Approved Decision | `docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md` |
| U-curve is a semantic transformation path with two initial dominant placements | Approved Decision | `docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md` |
| Official company mark is the `ni` brandmark | Supporting official brand authority + active decision | `docs/references/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf`; `docs/decisions/evidence/HOMEPAGE_PROTOTYPE_DECISION.md` |
| Primary and supporting capability hierarchy | Historical Active Baseline | `docs/references/requirements/historical-active/PRS_Website_Niuva.md`; `docs/decisions/evidence/HOMEPAGE_PROTOTYPE_DECISION.md` |
| Fixed, calculated, and quote-required pricing | Approved Baseline | `docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md` |
| Retail offer/file eligibility, automatic-pricing confirmation, quote routing, mixed-cart separation, and Assisted Retail Offer | Approved Product Contract — Activation Gated | `docs/decisions/product/DEC-OFFER-01-retail-offer-file-and-quote-routing.md` |
| Custom 3D Print progressive material plus exact machine-time policy `NIUVA-CP-FDM-001`, with final-only half-up rounding | Approved Commercial Policy — Activation Gated | `docs/decisions/product/DEC-PRICE-001-custom-print-commercial-pricing.md` |
| Customer price is tax-inclusive if applicable; tax profile and checkout activation require Finance confirmation because PKP status is unknown | Approved Direction with Open Finance Activation Gate | `docs/decisions/product/DEC-TAX-01-tax-inclusive-display-and-finance-activation-gate.md` |
| New Retail checkout requires an authenticated account; historical guest compatibility is retained without automatic claim | Approved Decision | `docs/decisions/product/DEC-RT-02-retail-account-required-checkout.md` |
| Structured integrated CMS and Admin Studio | Approved Baseline | `docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md` |
| Reduced integrated structured CMS for MVP; external CMS and free-form page builder excluded | Approved Decision | `docs/decisions/experience/DEC-OPS-003-reduced-integrated-cms-mvp.md` |
| Admin Studio follows the approved operational experience direction | Approved Decision | `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md` |
| Commercial history uses versions and snapshots | Approved Baseline | `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md` |
| Real milestones and ETA replace fake percentage progress | Approved Baseline | `docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md` |
| Granular internal roles remain canonical; operational staff have no general user directory, complete role definitions, or full audit log | Approved Decision | `docs/decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md` |
| Stable granular role identifiers, additive multi-role policy, separation of duties, and Super Admin-only identity governance | Approved Decision | `docs/decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md` |
| Retained legacy Order compatibility, customer-safe projections, and no automatic sunset | Approved Decision | `docs/decisions/access/DEC-ACCESS-003-legacy-order-compatibility-and-customer-projection.md` |
| Replica-set transaction capability | Approved Baseline | `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md` |
| Provider-neutral private production storage boundary | Approved with Open Decisions | `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md` |
| Provider-neutral Retail online-payment orchestration | Approved with Open Decisions | `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md` |
| Existing manual-transfer records are read-only; no new manual-transfer or payment-proof activity is enabled | Approved Decision | `docs/decisions/product/DEC-PAY-02-legacy-manual-transfer-read-only.md` |
| Retail checkout reservation is fixed at 30 minutes with versioned policy and atomic payment/expiry handling | Approved Decision | `docs/decisions/product/DEC-INV-01-retail-checkout-reservation-duration.md` |
| Retail fulfillment uses Rp0 pickup and automatically rated domestic Indonesia delivery with provider expiry capped at 30 minutes and seven-day pickup-overdue follow-up | Approved Fulfillment Policy — Activation Gated | `docs/decisions/product/DEC-FUL-01-shipping-and-pickup-policy.md` |
| Retail checkout shows ETA ranges and post-payment factual milestones with authorized audited updates and explicit `eta_overdue` behavior | Approved Customer ETA and Milestone Policy — Activation Gated | `docs/decisions/product/DEC-ETA-01-retail-eta-and-customer-milestone-policy.md` |
| Retail file revision and after-sales use lifecycle-specific cancellation, complaint, reprint/replacement, refund, return, SLA, and approval rules | Approved After-Sales Policy — Activation Gated | `docs/decisions/product/DEC-AFTER-01-retail-revision-and-after-sales-policy.md` |
| Retail notifications use authenticated owner and role-scoped recipients, dashboard plus allowlisted transactional email, safe audience-aware links, five delivery attempts, and no WhatsApp | Approved Decision — Amended for NMVP-D07 | `docs/decisions/product/DEC-DATA-003-notification-schema-retention-and-delivery-boundary.md` |
| Secure-session remediation and read-only Retail catalog discovery | Approved Implementation Decision | `docs/decisions/architecture/ADR-005-backend-remediation-runtime-policy.md` |

## 16. Deferred Decisions

| Decision | Status | Blocking scope |
|---|---|---|
| Detailed visual navigation beyond the approved canonical route ownership | Deferred | Public journey switching, CTA labels/placement, and exact desktop/mobile navigation treatment; subdomain or separate-app work requires a superseding `ADR-004` decision |
| Payment gateway provider | Open | Provider integration and production payment activation |
| Provider-specific payment state mapping and webhook authentication | Open | Payment adapter implementation |
| Finance operations, reconciliation SLA, and payment-event retention | Open | Payment operations and production readiness |
| Production storage provider | Open | Production upload and object operations |
| Storage RPO/RTO | Open | Recovery readiness and operational ownership |
| Storage retention, quota, backup, malware, and incident ownership | Open | Production storage readiness |
| Retail offer/file/quote routing | Resolved direction — activation gated | Preset/advanced fields, file/storage limits, machine/process/build/quantity/deadline/risk thresholds, default Assisted Retail Offer expiry, exact technical contract, implementation, providers, migration, readiness, and go-live remain open under `DEC-OFFER-01` |
| Shipping and pickup policy | Resolved direction — activation gated | Provider, origin/location/hours/windows, package profiles, domestic address validation, service allowlist, Finance treatment, operational ownership, implementation, deployment, readiness, and go-live remain open under `DEC-FUL-01` |
| Retail ETA and customer milestone policy | Resolved direction — activation gated | Numeric duration/calendar/buffer profiles, safe reason copy, exact backend state machine/API/schema, implementation, readiness, and go-live remain open under `DEC-ETA-01`; notification recipients/channels are governed by amended `DEC-DATA-003` |
| Tax treatment and rounding policy | Partially resolved | Final-only Custom Print rounding and tax-inclusive display direction are approved; PKP status, classification, rate/basis, invoice profile, and Finance activation remain open under `DEC-PRICE-001` and `DEC-TAX-01` |
| Reservation duration | Resolved: fixed 30 minutes | Implementation, payment-method compatibility, expiry execution, and late-success reconciliation remain separately gated by `DEC-INV-01` |
| Retail revision and after-sales policy | Resolved direction — activation gated | Legal/customer-terms review, working-day calendar, provider refund execution/timing, Finance accounting/tax correction, evidence privacy/retention, abuse/fraud handling, long-term uncollected-pickup policy, exact technical contract, implementation, readiness, and go-live remain open under `DEC-AFTER-01`; notification policy follows amended `DEC-DATA-003` |
| Retail operator/customer notification policy | Resolved direction — activation gated | Email provider, scheduler/worker topology, exact event enum/source mapping, preference UI, implementation, migration, deployment, readiness, and go-live remain open under amended `DEC-DATA-003` |
| First Retail vertical slice | Resolved: read-only discovery | Implemented listing/detail and secondary entry only; no transaction capability |
| Protected-scope implementation permission | Bounded approval | Auth/session, legacy-order quarantine, publication/data-integrity remediation, and Retail discovery per `DEC-REMED-001`; payment, fulfillment, production storage, Organization Portal, rollout, and go-live remain open |
| Production readiness | Open | Feature activation and operational handover |
| Production go-live | Open | Public production availability |
| Service taxonomy rename | Deferred | Public content model and navigation labels |
| Office & Signage placement | Deferred | Public capabilities and brand taxonomy |
| Visual rollout to About, Capabilities, Projects, and Contact | Deferred | Public-route redesign outside Homepage |
| Poppins + Inter implementation rollout to About, Capabilities, Projects, and Contact | Deferred | Public-route typography migration outside Homepage |
| Brand Guidelines v1.1 | Deferred | Permanent brand-system publication |
| Process-photography acquisition | Open dependency | Broader About/Projects/public narrative rollout |

Homepage pattern is not deferred. It is resolved as Unified Homepage with a Business/B2B-primary narrative and a clear secondary Retail path.

The first Retail vertical slice is also no longer deferred. `DEC-REMED-001`
authorizes read-only discovery on the existing route-based surface. `ADR-004`
now selects that single-origin route-based shape for MVP and `DEC-UX-003`
defines the canonical route direction. Neither decision activates cart,
registration, upload, checkout, payment, fulfillment, reservation, production
tracking, after-sales, or any other gated capability.

## 17. Implementation Boundaries

- Approval of this Master Specification does not automatically authorize implementation.
- Homepage approval does not authorize redesign of About, Capabilities, Projects, Contact, authentication, customer portal, Admin Studio, backend, or API surfaces.
- Route and topology approval does not authorize route, navigation, redirect,
  authentication, API, schema, migration, or infrastructure changes.
- UI redesign does not change backend authorization, aggregate boundaries, state machines, or data privacy rules.
- Admin Studio redesign does not activate a payment gateway, production upload, infrastructure change, or go-live.
- Hiding UI is not security.
- No implementation may invent clients, metrics, awards, certifications, project facts, project assets, testimonials, prices, ETA promises, policies, or operational capabilities.
- Deferred decisions must not be silently resolved through schema, component, copy, or provider implementation.
- Work proceeds through bounded vertical slices with explicit authorization, migration compatibility, rollback, and proportional verification.
- Existing users, orders, materials, portfolio records, and payment history must be preserved unless an approved migration says otherwise.

## 18. Acceptance Principles

A product change is acceptable only when the criteria relevant to its scope hold:

- Retail and Business/B2B remain understandable as two journeys in one Niuva platform.
- Business/B2B positioning and R&D/design engineering/prototyping evidence remain primary.
- Standard Retail work can use safe price/ETA and complex work falls back to quote without re-entry.
- B2B quotations, designs, approvals, milestones, payment terms, and fulfillment retain history.
- Customer-facing surfaces expose only customer-safe data.
- Staff actions match role, permission, and audit requirements.
- Paid, accepted, and approved records are not rewritten by later catalog, material, content, or policy changes.
- Stock, payment, approval, and workflow retries do not create duplicate effects.
- Real state, next action, ETA, and recovery paths are clear.
- Public, Retail, portal, and operational surfaces use appropriate density and expression without losing shared identity.
- Responsive, keyboard, contrast, focus, semantic-state, and reduced-motion requirements are satisfied.
- Deferred policy, provider, infrastructure, and go-live decisions remain visibly open until separately approved.
- Documentation, runbook, ownership, migration, and handover impact are addressed in proportion to risk.
