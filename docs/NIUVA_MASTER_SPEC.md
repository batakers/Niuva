# Niuva Master Specification

Status: **Approved Canonical**
Draft date: 23 July 2026
Approval date: 23 July 2026
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

Sources: `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md`; `docs/implementation/specs/active/2026-07-14-unified-retail-b2b-platform-design.md`.

## 3. Business Positioning

The primary positioning is:

> Mitra R&D, design engineering, dan prototyping untuk pengembangan produk inovatif.

Niuva must be understood as a strategic product-development partner that connects research, design, engineering, prototyping, testing, and implementation.

Retail is an additional transaction journey. It must not replace the main positioning or make Niuva marketplace-first, Retail-first, e-commerce-only, or merchandise-led. R&D, design engineering, prototyping, and real project evidence remain prominent across the public brand experience.

Sources: `docs/references/requirements/historical-active/BRD_Website_Niuva.md`; `docs/references/requirements/historical-active/PRS_Website_Niuva.md`; `docs/references/requirements/approved-baselines/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md`.

## 4. Users and Roles

### Customer users

- **Retail Guest:** browse, configure, upload, view safe price/ETA, checkout, pay, and track through verified contact information.
- **Retail Account:** guest capabilities plus permitted order history, saved details, repeat order, and file access.
- **B2B Organization:** inquiry may begin without login; quotation and project access require an organization account.

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

Sources: `docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md`; `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md`; `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md` for procedure only.

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

### Retail

```text
Catalog
→ Configure
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

When a Retail configuration cannot be priced or scheduled safely, the action becomes `quote_required`. Product, configuration, file, quantity, and contact information must transfer into the quote flow without re-entry. This fallback does not collapse the Retail and B2B lifecycles into one model.

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

Accepted quotation versions and approved design versions are immutable. Scope changes create new versions and may change price, ETA, milestones, and payment terms.

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

Detailed rollout, migration, correction, rollback, and recovery procedures remain in `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md` and other relevant runbooks.

## 13. Security and Data Boundaries

- Protected operations require backend authorization and least privilege.
- Customer responses and views must exclude internal cost, margin, supplier, profit, and internal notes.
- File access requires type/size validation, ownership checks, authorization, and controlled access.
- Production files use private persistent storage through a provider-neutral storage port.
- Local filesystem storage is development/demo only.
- MongoDB replica-set multi-document transactions are required for cross-collection mutations that need atomicity.
- Transaction-required operations fail closed with `503 transaction_unavailable` when capability is unavailable.
- Retail production payment uses provider-neutral online-payment orchestration with separate adapters.
- Provider events and webhooks must be idempotent and have explicit refund and reconciliation boundaries.
- Manual transfer is not the Retail production baseline. No new transitional adapter is enabled without a separate written decision.
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
| Experimental Editorial Hybrid | Approved Decision | `docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md` |
| Homepage uses Poppins + Inter with the approved display/UI and body/metadata roles | Approved Decision | `docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md` |
| U-curve is a semantic transformation path with two initial dominant placements | Approved Decision | `docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md` |
| Official company mark is the `ni` brandmark | Supporting official brand authority + active decision | `docs/references/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf`; `docs/decisions/evidence/HOMEPAGE_PROTOTYPE_DECISION.md` |
| Primary and supporting capability hierarchy | Historical Active Baseline | `docs/references/requirements/historical-active/PRS_Website_Niuva.md`; `docs/decisions/evidence/HOMEPAGE_PROTOTYPE_DECISION.md` |
| Fixed, calculated, and quote-required pricing | Approved Baseline | `docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md` |
| Guest Retail checkout and organization-based B2B access | Approved Baseline | `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md` |
| Structured integrated CMS and Admin Studio | Approved Baseline | `docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md` |
| Admin Studio follows the approved operational experience direction | Approved Decision | `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md` |
| Commercial history uses versions and snapshots | Approved Baseline | `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md` |
| Real milestones and ETA replace fake percentage progress | Approved Baseline | `docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md` |
| Replica-set transaction capability | Approved Baseline | `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md` |
| Provider-neutral private production storage boundary | Approved with Open Decisions | `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md` |
| Provider-neutral Retail online-payment orchestration | Approved with Open Decisions | `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md` |

## 16. Deferred Decisions

| Decision | Status | Blocking scope |
|---|---|---|
| Detailed visual navigation/switch for Retail and B2B | Deferred | Public navigation, responsive navigation, journey switching |
| Payment gateway provider | Open | Provider integration and production payment activation |
| Provider-specific payment state mapping and webhook authentication | Open | Payment adapter implementation |
| Finance operations, reconciliation SLA, and payment-event retention | Open | Payment operations and production readiness |
| Production storage provider | Open | Production upload and object operations |
| Storage RPO/RTO | Open | Recovery readiness and operational ownership |
| Storage retention, quota, backup, malware, and incident ownership | Open | Production storage readiness |
| Shipping and pickup policy | Open | Checkout, ETA, fulfillment, and customer communication |
| Tax treatment and rounding policy | Open | Price display, invoice, payment, refund, and reconciliation |
| Reservation duration | Open | Checkout expiry, stock availability, and payment timing |
| Cancellation, refund, and return policy | Open | Checkout terms, Finance, fulfillment, and support |
| Transitional manual-transfer adapter | Not enabled | Retail payment fallback, proof storage, and Finance workflow |
| First Retail vertical slice | Open | Retail implementation sequencing |
| Protected-scope implementation permission | Open | Legacy order, auth, payment, fulfillment, and compatibility changes |
| Production readiness | Open | Feature activation and operational handover |
| Production go-live | Open | Public production availability |
| Service taxonomy rename | Deferred | Public content model and navigation labels |
| Office & Signage placement | Deferred | Public capabilities and brand taxonomy |
| Visual rollout to About, Capabilities, Projects, and Contact | Deferred | Public-route redesign outside Homepage |
| Poppins + Inter implementation rollout to About, Capabilities, Projects, and Contact | Deferred | Public-route typography migration outside Homepage |
| Brand Guidelines v1.1 | Deferred | Permanent brand-system publication |
| Process-photography acquisition | Open dependency | Broader About/Projects/public narrative rollout |

Homepage pattern is not deferred. It is resolved as Unified Homepage with a Business/B2B-primary narrative and a clear secondary Retail path.

## 17. Implementation Boundaries

- Approval of this Master Specification does not automatically authorize implementation.
- Homepage approval does not authorize redesign of About, Capabilities, Projects, Contact, authentication, customer portal, Admin Studio, backend, or API surfaces.
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
