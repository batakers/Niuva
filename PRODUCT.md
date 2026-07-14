# Product

## Product Baseline

Niuva is one website and one operational platform with two first-class customer journeys:

- **Retail:** individuals and UMKM purchasing ready-stock, 3D printing, apparel, or standardized custom merchandise.
- **Business/B2B:** companies and institutions requiring bulk/repeat procurement, R&D, design engineering, prototyping, workshops, or complex custom projects.

Both journeys share catalog, materials, inventory, production, payment, fulfillment, notification, audit, and Admin Studio foundations. Niuva's primary brand positioning remains a strategic R&D, design engineering, and prototyping partner. Retail is an additional transaction journey, not a replacement for that positioning.

The approved v2.1 source documents are:

1. `doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md`
2. `doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md`
3. `doc/PRD_Platform_Niuva_v2_1_retail_b2b.md`
4. `docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md`

These documents supersede the earlier v2 addenda for new planning. Website v1 brand and public-page requirements remain applicable where they do not conflict with v2.1.

## Users

### Retail Customers

Retail customers need to browse a catalog, configure a product, upload a design where required, see a safe price and ETA, checkout, pay, and track real production milestones. Guest checkout is supported; an account adds history, saved details, and repeat-order conveniences.

### Business/B2B Customers

Business users include companies, institutions, industry teams, startups, universities, research institutions, and organizations seeking R&D, engineering, prototyping, workshops, bulk orders, or repeat procurement. They need portfolio evidence, inquiry/RFQ, versioned quotations, approvals, milestones, payment terms, and organization-based access.

### Internal Staff

Internal users include Content Editor, Catalog Manager, Warehouse, Order Admin, Sales/Estimator, Designer/Engineer, Production, Quality Control, Finance, Manager/Approver, and Super Admin. Their interfaces must prioritize task completion, data clarity, permissions, and auditability.

## Product Purpose

NIUVA's website is the official digital presence for PT Niuva Inovasi Utama and a shared commercial and operational platform.

The product has two complementary business outcomes:

- Convert standardized Retail demand through a clear catalog-to-checkout flow.
- Convert B2B demand through capabilities, portfolio proof, inquiry/RFQ, quotation, and project delivery.

Success means:

- Retail customers can complete standard purchases and track fulfillment.
- B2B customers can move from inquiry to an approved and traceable project.
- Staff can manage routine content, catalog, material, price, stock, order, project, production, QC, payment, and shipment work without code changes.
- The site remains a credible reference for pitching, proposals, networking, and business development.
- Operations can continue after the initial developer handover using documented ownership, SOP, backup, and recovery procedures.

## Brand Personality

NIUVA should feel professional, innovative, clean, technical, trustworthy, collaborative, and precise.

The voice is confident and clear without sounding overly promotional. Technical terms are welcome when they clarify expertise, but the copy should remain understandable to business decision makers and Retail customers. The brand should communicate strategic partnership and dependable production, not commodity-only selling.

## Product Principles

### Two Journeys, One Platform

Make Retail and B2B explicit. Retail should feel fast and self-service; B2B should feel consultative, governed, and evidence-led. They share data and operations but must not collapse into one ambiguous flow.

### Show Capability Through Evidence

Portfolio and project content should behave like mini case studies: challenge, solution, output, and capability proven. R&D and Design & Prototyping remain visually important even when Retail commerce is present.

### Use Safe Automation

Use `fixed` or `calculated` pricing only when rules and inputs are sufficiently reliable. Use `quote_required` for nonstandard or complex work. Do not present an uncertain engineering estimate as a guaranteed final price.

### Show Real Progress

Use actual milestones and ETA rather than invented percentages. When an ETA changes, retain the history and show a customer-safe reason.

### Protect Historical Truth

Published content, material prices, accepted quotations, approved designs, and paid transactions require versions or snapshots so later edits do not rewrite history.

### Separate Public Impact From Operational Efficiency

Public pages can carry stronger brand expression. Retail purchase surfaces, customer portals, and Admin Studio should prioritize clarity, state, data density, accessibility, and task completion.

### Design for Handover

Routine work belongs in a structured internal CMS and Operations Back-office. Avoid free-form page building and undocumented operational dependencies on one developer.

## Anti-References

Do not make Niuva look like:

- A generic vendor or cheap multi-vendor marketplace.
- A static PDF company profile converted to a website.
- A generic SaaS or AI-generated landing page.
- An e-commerce-only store that hides B2B capability.
- A blog-first content site.
- A decorative dashboard that slows routine work.

Avoid overpromising, fake metrics, generic tech-startup claims, weak portfolio lists without business context, equal service weighting that hides R&D/prototyping, and visual choices that bury either the purchase path or the project-discussion path.

Retail can be transaction-oriented without making merchandise appear to be Niuva's only or primary capability.

## Design Principles

- Keep Retail and Business/B2B entry points understandable.
- Preserve strong R&D, engineering, prototyping, and portfolio evidence.
- Make Retail product price, configuration, availability, ETA, checkout, and tracking states clear.
- Make B2B scope, version, approval, next action, milestone, payment term, and ETA clear.
- Use consistent shared components and brand tokens while adapting density to each surface.
- Keep internal cost, margin, supplier, profit, and internal notes out of customer interfaces and responses.
- Use structured content fields, validation, preview, approval, version history, and rollback in CMS.
- Respect backend authorization; UI visibility is not a security boundary.

## Locked v2.1 Decisions

- One website with Retail and Business/B2B journeys.
- Retail catalog initially covers 3D printing, ready-stock, apparel, and simple custom merchandise.
- Products can expose Retail purchase and B2B bulk/RFQ actions.
- Pricing modes are `fixed`, `calculated`, and `quote_required`.
- Retail supports guest checkout and online payment.
- B2B uses organization accounts, versioned quotation/design approval, invoice, DP, and terms.
- Both journeys show milestones and ETA.
- CMS is an integrated structured module, not an external CMS or free-form page builder.
- Admin Studio contains CMS and Operations Back-office.
- Material prices and commercial records use versions or snapshots.
- Referenced materials are archived rather than hard-deleted.

## Deferred Decisions

- Homepage pattern: split gateway, unified homepage, or retail-first.
- Payment gateway provider.
- Detailed visual treatment for Retail/B2B navigation.

Foundation work must not silently decide these items. A surface that depends directly on one of them waits for the related decision.

## Accessibility and Inclusion

Use Indonesian as the primary language while allowing relevant English technical terms. Where bilingual UI exists, keep both languages complete for core navigation and workflows.

Text must be readable, contrast sufficient, and controls clear. The site must work on desktop, tablet, and mobile. Motion must respect reduced-motion preferences. Forms, uploads, configuration, checkout, approvals, dashboard states, and progress tracking must remain understandable without relying only on color, animation, or icons.

## Security and Data Boundaries

- Protected operations require backend authorization and least privilege.
- Customer responses must exclude internal cost, margin, supplier, profit, and internal notes.
- Files require validation, ownership checks, and controlled download access.
- Stock reservation, payment webhook, workflow retry, and approval operations must be atomic or idempotent as appropriate.
- Credentials, secret values, and API keys must not be written in product documents or committed to the repository.
- Backup and restore must be tested as part of handover readiness.
