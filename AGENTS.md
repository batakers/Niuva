# AGENTS.md — Niuva Unified Retail–B2B Platform

This file defines the fixed product, business, UX, data, and implementation rules for coding agents working in this repository.

For detailed website-v1 brand, copy, public-page, contact, and visual rules, also read `AGENTS.brand-baseline-v1.md`. Those rules remain active unless they conflict with this v2.1 file or the approved requirements hierarchy below.

## 1. Project Mission

Build and maintain one Niuva website and one operational platform with two customer journeys:

- **Retail:** catalog, standardized configuration, safe price/ETA, checkout, payment, production tracking, and fulfillment.
- **Business/B2B:** capabilities and portfolio proof, inquiry/RFQ, quotation, approval, project milestone, payment term, and fulfillment.

Both journeys share CMS, customer/organization, catalog, material, inventory, production, payment, shipment, notification, audit, and Admin Studio foundations.

Shared foundations do not mean Retail Order and B2B Quote/Project use the same aggregate or state machine. Identity, organization, catalog, inventory, payment infrastructure, audit, CMS, and operational foundations may be shared, while Retail and B2B customer lifecycles and projections remain separate.

Niuva's main brand positioning remains a strategic partner for R&D, design engineering, and prototyping. Retail must not turn the entire website into a commodity-only marketplace.

## 2. Source of Truth Hierarchy

When requirements conflict, follow this order:

1. `doc/BRD_Website_Niuva.md` plus the latest approved BRD addendum.
2. `doc/PRS_Website_Niuva.md` plus the latest approved PRS addendum.
3. `doc/PRD_Platform_Niuva_v2_1_retail_b2b.md`.
4. `PRODUCT.md`.
5. Approved design specs under `docs/superpowers/specs/`.
6. Official Company Profile source material.
7. This `AGENTS.md` and `AGENTS.brand-baseline-v1.md` for implementation guardrails.
8. Current implementation.

The approved v2.1 addenda are:

- `doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md`
- `doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md`
- `docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md`

They supersede earlier v2 addenda for new planning. Do not implement from a superseded draft when v2.1 addresses the same requirement.

Approved architecture decisions are recorded in:
- `doc/decisions/ADR-001-mongodb-transaction-capability.md`
- `doc/decisions/ADR-002-production-file-storage-architecture.md`
- `doc/decisions/ADR-003-retail-payment-orchestration-boundary.md`
- `doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md`

These pointers govern transaction, persistent-storage, and Retail payment boundaries. Their approval scope is internal architecture, documentation, and future implementation planning; open provider, operational, infrastructure, Finance, and production-readiness decisions remain open.

Do not invent a new business direction, journey, pricing promise, role model, page structure, or visual identity.

## 3. Locked Product Decisions

- Retail and B2B are two journeys inside one website, not separate products.
- Retail initially covers 3D printing, ready-stock, apparel, and simple custom merchandise.
- B2B covers RFQ, bulk/repeat procurement, R&D, engineering, prototyping, workshops, and complex projects.
- A product may offer both Retail purchase and Bulk/RFQ actions.
- Pricing modes are `fixed`, `calculated`, and `quote_required`.
- Retail supports guest checkout and an optional account.
- B2B inquiry may begin without login, but quotation/project access requires an organization account.
- Retail uses online payment; B2B supports quotation/invoice, transfer, DP, and terms.
- Both journeys show real milestones and ETA, not fake percentage progress.
- CMS is an integrated structured module, not an external CMS or free-form page builder.
- Admin Studio contains CMS and Operations Back-office.
- Commercial history uses versioning and snapshots.

## 4. Deferred Decisions

Do not silently decide:

- Homepage pattern: split gateway, unified homepage, or retail-first.
- Payment gateway provider.
- Detailed visual treatment of Retail/B2B navigation.
- Production storage provider.
- Shipping and pickup policy.
- Tax treatment.
- Reservation duration.
- Cancellation, refund, and return policy.
- Transitional manual-transfer adapter.
- Protected-scope implementation permission.
- Production readiness and go-live.

Foundation work may proceed. A public or payment surface that directly depends on one of these choices must wait for the decision or remain provider/pattern-neutral.

## 5. Product Structure

```text
Public Website
├── Shared Brand/Company Pages
├── Retail
│   ├── Catalog
│   ├── Product Detail/Configurator
│   ├── Cart/Checkout
│   └── Order Tracking
└── Business/B2B
    ├── Capabilities
    ├── Projects/Portfolio
    ├── Project Inquiry
    └── Bulk RFQ

Authenticated
├── Retail Account
├── B2B Organization Portal
└── Admin Studio
    ├── CMS
    └── Operations Back-office
```

Back-office is not a third customer journey.

## 6. Experience Boundaries

### Public Brand and B2B Surfaces

Prioritize credibility, capability, portfolio evidence, clear project discussion, and Niuva's R&D/prototyping positioning.

### Retail Surfaces

Prioritize product discovery, configuration clarity, file requirements, price/ETA, checkout state, payment state, and tracking. Retail may be commerce-oriented without making the entire brand an e-commerce-only store.

### Customer Portals

Prioritize current status, next action, milestones, ETA, approvals, payment, files, and shipment. Show only customer-safe information.

### Admin Studio

Prioritize task completion, data density, filters, status, validation, permission, audit, and recovery. Do not apply heavy public-marketing decoration to operational pages.

## 7. Customer Journeys

### Retail

```text
Catalog → configure → upload → price/ETA → checkout
→ payment → file review → production → QC → fulfillment
```

If rules cannot safely calculate a final price or ETA, use `quote_required` and transfer the current configuration, file, quantity, and contact data into the quote flow without re-entry.

### B2B

```text
Inquiry/RFQ → estimate → quotation → approval/revision
→ design/engineering → design approval → DP/term
→ production → QC → shipment
```

Accepted quotations and approved designs are immutable. Scope changes create new versions.

## 8. Roles and Authorization

Internal roles:

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

B2B organization roles:

- Owner
- Project PIC
- Approver
- Finance
- Viewer

Authorization must be enforced in backend handlers and data queries. Hiding a button is not authorization. Use least privilege and audit sensitive actions.

## 9. CMS Rules

CMS manages structured fields for content, SEO, media, portfolio, capabilities, B2B taxonomy, Retail category, product, variant, configuration, price/rule, promo, and base lead time.

Publishing flow:

```text
draft → review → published/scheduled → archived
```

CMS must support preview, validation, version history, rollback, audit, and soft delete/archive. Block publishing when required fields, SKU, media, pricing, CTA, or production rules are invalid.

Do not build homepage-specific schema until the homepage pattern is approved.

## 10. Material, Pricing, and Inventory Rules

Authorized staff can add, edit, and archive materials; update material prices; and manage supplier, unit, waste, reorder point, lead time, and status.

- Material prices use versions and effective dates.
- New prices affect new calculations or explicitly recalculated drafts.
- Paid orders and accepted quotations retain their snapshots.
- Referenced material is archived, never hard-deleted.
- Monetary calculation uses Decimal or a consistent minor-unit representation, not binary floating point.

```text
available = on_hand - reserved
projected = available + incoming - planned_demand
```

Stock movements use unique operation IDs and atomic updates. Reject duplicate movements and any result that would make a balance negative.

## 11. ETA and Progress Rules

Retail ETA considers payment/file readiness, material availability, production slot, process duration, QC, and operational buffer.

B2B ETA also considers design/revision cycle, customer approval, procurement, milestone dependencies, and payment gates.

Use milestone state rather than invented progress percentages. ETA changes retain the previous value, new value, changed time, actor, and reason. Customer responses receive only a safe reason.

## 12. Security and Privacy Boundary

- Customer APIs and views must exclude internal cost, margin, supplier, profit, and internal notes.
- Files require type/size validation, ownership checks, and controlled access.
- Organization members only access assigned organizations/projects.
- Payment webhook, stock operation, workflow retry, and approval must be idempotent or conflict-safe as appropriate.
- Audit actor, time, target, before/after, and reason where required.
- Do not place credentials, secret values, or API keys in source files or product documentation.
- Avoid logging unnecessary personal, financial, or file data.

## 12.1 Approved Architecture Boundaries

### Persistent storage — `doc/decisions/ADR-002-production-file-storage-architecture.md`

- Use a stable provider-neutral storage port with private persistent object storage as the production adapter class.
- Local filesystem is development/demo only. Production objects are private by default and backend authorization is the default access model.
- Short-lived signed access requires prior backend authorization and is scoped to one object and one action. Database-backed ownership replaces path-substring authorization.
- Public buckets and public static directories are prohibited.
- This boundary applies to all persistent Retail, B2B, design, operational, QC, fulfillment, and conditionally approved payment-proof uploads.
- Provider, RPO/RTO, retention, quota, operational ownership, backup/restore ownership, malware/quarantine ownership, Emergent migration/decommission, and production readiness remain open.
- Production upload remains disabled until query-string access tokens are removed, ownership and MIME/signature validation are implemented, malware scanning/quarantine and backup/restore are tested, metadata/object reconciliation is tested, and readiness is approved.

### Payment orchestration — `doc/decisions/ADR-003-retail-payment-orchestration-boundary.md`

- Retail production target is online payment with provider-neutral core orchestration, separate provider adapters, idempotent events/webhooks, explicit refund/reconciliation boundaries, and customer-safe projections.
- Gateway provider remains deferred; no provider-specific API, schema, webhook signature, or SDK is selected here.
- Manual transfer is not the Retail production baseline. Legacy records remain readable; no new transitional adapter is enabled. A future adapter requires a separate written decision, Finance owner, feature flag, SLA, expiry, exit criteria, storage approval, refund/late-payment handling, audit, and rollback controls.

ADR approval scope remains internal architecture, documentation, and future implementation planning; it does not authorize production infrastructure changes, Finance activation, payment gateway activation, production upload enablement, or production go-live.

## 13. Failure Handling

Explicitly handle:

- Final-stock checkout contention.
- Expired reservation.
- Duplicate payment webhook.
- Price changes before payment.
- Invalid or failed file upload.
- Stale quotation/design/content approval.
- Retried stock movement.
- Notification failure and retry.
- Permission denied, conflict, empty, loading, retry, and expired UI states.

Notification failure must not roll back an otherwise successful core transaction.

MongoDB replica-set multi-document transactions are the approved baseline for cross-collection mutation requiring atomicity. Local mutation development uses a single-node replica set; CI uses an isolated replica set; staging and production require transaction capability before affected mutation flags are enabled. Standalone MongoDB is limited to read-only or proven-safe single-document atomic writes. Transaction-required operations fail closed with `503 transaction_unavailable`; silent fallback to non-atomic writes is prohibited. See `doc/decisions/ADR-001-mongodb-transaction-capability.md`.

## 14. Migration Rules

- Preserve existing users, 3D printing orders, materials, portfolio, and payment history unless an approved migration says otherwise.
- Map legacy orders into the new model; do not silently delete or rewrite them.
- Migrate `admin/client` roles to least-privilege roles with manual review for elevated access.
- Seed an initial material price version before new pricing uses a legacy material.
- Never run a destructive migration without backup, dry run, validation, and rollback instructions.

## 15. Development Workflow

Before editing code:

1. Read the applicable BRD, PRS, PRD, PRODUCT, design spec, and AGENTS files.
2. Inspect the real project structure, routes, schemas, models, and scripts.
3. Check the active branch and working tree; preserve unrelated user changes.
4. Identify migration, compatibility, privacy, concurrency, and deferred-decision impact.
5. Make a proportional plan for multi-step work.

While editing:

- Reuse the current React, FastAPI, and MongoDB conventions unless an approved plan changes them.
- Prefer shared components, schemas, services, and tokens.
- Keep public, customer, and operational presentation concerns separated.
- Do not add unnecessary dependencies.
- Do not remove existing operational features without explicit approval.
- Do not commit, push, reset, rebase, force-push, or delete branches without explicit user instruction.
- Do not modify secrets or global environment configuration without explicit permission.

After editing:

- Run relevant tests, type checks, lint, and build commands where available.
- Verify role and customer data boundaries.
- Verify responsive and accessible UI for changed surfaces.
- Verify critical state transitions, conflicts, retry, and migration behavior.
- State what was verified and any checks that could not run.

## 16. Release Sequence

1. Foundation: role, CMS, catalog, material price, inventory, order/project, and audit foundations.
2. Retail MVP: configurator, price/ETA, checkout, online payment, production tracking, and fulfillment.
3. B2B MVP: inquiry/RFQ, organization, quotation, design approval, milestone, terms, and fulfillment.
4. Operational maturity: production board, advanced notifications, analytics, and KPI reporting.
5. Handover: manuals, SOP, data dictionary, training, backup/restore, recovery, ownership, and regression checks.

Do not implement multiple phases as one uncontrolled change. Use vertical slices and explicit migration steps.

## 17. Acceptance Checklist

A change is acceptable only when the criteria relevant to its scope hold:

- Retail and B2B remain understandable as two journeys in one platform.
- Niuva's R&D/design engineering/prototyping positioning remains clear.
- Standard Retail work can use safe price/ETA and complex work falls back to quote.
- B2B quotation, design, approval, milestone, payment, and fulfillment retain version history.
- Staff permissions match their operational role.
- Historical paid/accepted records are not rewritten by later catalog or material edits.
- Stock and payment retries do not create duplicate operations.
- Customer responses do not expose internal data.
- Loading, empty, error, conflict, retry, permission, and expired states are handled.
- Tests and verification are proportional to the risk.
- Documentation and handover impact are updated for operational changes.

For public-page visual and content acceptance details, follow `AGENTS.brand-baseline-v1.md` where it does not conflict with the v2.1 requirements.
