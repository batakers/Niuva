# Catalog, Material Pricing, and Inventory Foundation Design

**Date:** 2026-07-14
**Status:** Approved with Open Decisions
**Base:** `main` at `09de876`
**Related requirements:** `doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md` and `docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md`
**Approved architecture pointers:** `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md` and `docs/decisions/product/DECISION_LOG_Platform_Niuva_v2_1.md`

## 1. Context

The identity, role-based access control, organization, and audit foundation is merged into `main`. The next foundation slice establishes shared catalog, material pricing, and inventory capabilities before Retail MVP and B2B MVP.

The application already has a simple material collection, public material listing, admin material CRUD, and an order flow that stores `material_id` plus a material-name snapshot. It does not yet have product categories, variants, SKU rules, versioned material prices, an inventory ledger, reservations, restock alerts, publication snapshots, or a customer-safe public catalog projection.

This design extends the existing FastAPI, MongoDB, React, permission, notification, and audit patterns. It does not introduce a new service or database.

## 2. Goals

1. Let authorized staff manage categories, products, variants, configuration metadata, pricing modes, publication, materials, prices, inventory, and restock alerts from Admin Studio.
2. Expose a read-only public catalog API containing only published and customer-safe data.
3. Preserve immutable histories for catalog publications, material prices, stock movements, and audit events.
4. Track raw-material stock and ready-stock variants with atomic, idempotent operations.
5. Preserve existing material IDs and order references during migration.
6. Provide stable interfaces for Order Foundation, Retail MVP, B2B MVP, costing, and production.
7. Keep the system maintainable as a modular monolith after the current internship ends.

## 3. Non-goals

The following are explicitly deferred:

- Customer-facing catalog pages, filters, product details, and configurator: Retail MVP.
- Customer price calculation using material, machine, labor, finishing, overhead, margin, tax, or shipping: Retail MVP.
- Checkout, payment, and automatic order-reservation integration: Order Foundation and Retail MVP.
- Customer back-in-stock subscription and consent: Retail MVP.
- B2B RFQ, quotation calculation, and project procurement: B2B MVP.
- Multi-warehouse, bin, batch or lot, expiry, purchase order, and moving-average accounting: Advanced Inventory.
- Supplier master data, supplier-specific prices, and price comparison: Advanced Procurement.

## 4. Locked Decisions

1. Catalog Foundation includes Admin Studio and a public read API, but not customer-facing catalog pages.
2. Each material has one official immutable price stream with effective dates. An internal `supplier_reference` may be recorded, but supplier master data and comparison are excluded.
3. Inventory uses an immutable operation ledger plus materialized current balances.
4. Inventory tracks raw materials and ready-stock product variants.
5. Customers see stock status only, never exact quantities.
6. Catalog stores `fixed`, `calculated`, and `quote_required` modes without implementing the full calculation engine.
7. Catalog Managers may publish directly after server validation; audit is mandatory.
8. Restock notifications are internal only.
9. Legacy materials are migrated in place and retain their IDs.
10. Catalog, material pricing, and inventory remain modules in the current application.

## 5. Architecture

### 5.1 Modular Monolith

FastAPI remains the backend deployment unit, MongoDB remains the database, and React remains the public and Admin Studio frontend. Route handlers validate transport input and permissions, then call domain services. Domain services own business rules and transaction boundaries. Explicit public response builders prevent internal data leakage.

Backend domains:

| Domain | Responsibility |
|---|---|
| Catalog | Category, product, variant, configuration metadata, validation, publication, rollback, and public projection |
| Material | Material registry, supplier reference, archival rules, and legacy compatibility |
| Pricing | Immutable material price versions and effective-price resolution |
| Inventory | Balances, operations, reservations, concurrency, idempotency, and safe stock-status mapping |
| Restock | Shortage evaluation, deduplication, resolution, in-app notification, and optional email |
| Audit | Redacted actor, action, target, before/after, reason, and timestamp persistence |

### 5.2 Hybrid Catalog Publication

- Working categories, products, variants, and options are editable drafts.
- `catalog_publications` stores immutable customer-safe snapshots.
- Public APIs read the active publication and combine it with dynamic safe stock status.
- Draft edits do not affect the live catalog until publish succeeds.

### 5.3 Hybrid Inventory Ledger

- `stock_movements` stores immutable operations.
- `inventory_balances` stores transactionally maintained current balances.
- `stock_reservations` stores reservation lifecycle and business references.
- A balance is never changed through generic CRUD.

### 5.4 Admin Studio Pages

- Catalog Registry
- Product Editor
- Material Registry and Price History
- Inventory Balances
- Stock Movement History
- Restock Alerts

Existing permission-aware routes and navigation remain in use. Backend authorization remains authoritative.

## 6. Storage Conventions

- Store timestamps as UTC ISO-8601 strings. Display them using the user's locale; Indonesia/Jakarta is the default operational timezone.
- Store IDR money as non-negative integer rupiah. Do not use binary floating-point for money.
- Store inventory quantities as MongoDB Decimal128-compatible decimal values.
- A material has one canonical base unit. The initial controlled set is `pcs`, `g`, `kg`, `mm`, `cm`, `m`, `ml`, `l`, `sheet`, and `roll`.
- Material price units must equal the material base unit. Unit conversion is excluded.
- Use UUID strings for entity IDs and caller-supplied UUID strings for inventory `operation_id`.

## 7. Domain Model

### 7.1 Category

Fields: `id`, `name`, globally unique normalized `slug`, `description`, `sort_order`, `status`, and actor/timestamp metadata.

Rules:

- Status is `active` or `archived`.
- An archived category cannot accept new published products.
- A referenced category is archived, never hard-deleted.

### 7.2 Product

Fields:

- `id`, `category_id`, `name`, globally unique `slug`
- `short_description`, `description`, public `media`
- `seo_title`, `seo_description`
- `pricing_mode`: `fixed`, `calculated`, or `quote_required`
- `price_from`, `currency` with initial value `IDR`
- `retail_cta_enabled`, `b2b_cta_enabled`
- `stock_visibility`: `status_only` or `made_to_order`
- `workflow_status`: `draft`, `validated`, `published`, or `archived`
- `active_publication_id`
- actor/timestamp metadata

Rules:

- Media uses storage metadata and public alt text, not unrestricted raw URLs.
- A fixed product requires an active variant with a positive fixed selling price.
- A calculated product requires a rule reference and configured `price_from`; the rule is stored but not executed here.
- A quote-required product requires the B2B/RFQ CTA.
- Published data changes only through a successful publication.

### 7.3 ProductVariant

Fields: `id`, `product_id`, globally unique `sku`, `name`, `option_values`, `fixed_price`, `currency`, `production_type`, `inventory_tracking_enabled`, `reorder_point`, `status`, and actor/timestamp metadata.

Rules:

- `production_type` is `ready_stock` or `made_to_order`.
- A ready-stock variant must enable inventory tracking before publication.
- A referenced variant is archived, never hard-deleted.
- Fixed selling-price history is preserved by publication snapshots.

### 7.4 ConfigurationOption

Configuration metadata supports material, size, color, finishing, quantity, and file requirements. Each option stores `id`, `product_id`, `code`, `label`, type, allowed values or numeric limits, required state, active state, and display order.

Options describe valid choices. They do not calculate customer prices in this foundation.

### 7.5 CatalogPublication

An immutable publication contains:

- `id`, `product_id`, monotonically increasing `revision`
- category, product, active variant, and option projections
- validated pricing metadata
- public media metadata
- `published_at`, `published_by`, and `publish_reason`

Rollback copies a selected historical snapshot into a new revision. It never mutates the older publication.

### 7.6 Material

The expanded material model preserves legacy fields and adds:

- `sku`
- `base_unit`
- optional internal `supplier_reference`
- `waste_percentage`
- `reorder_point`
- `lead_time_days`
- `inventory_tracking_enabled`
- `setup_status`: `needs_review` or `ready`
- `status`: `active` or `archived`
- actor/timestamp metadata

Rules:

- SKU is globally unique.
- Waste is between 0 and 100.
- Reorder point and lead time are non-negative.
- Pricing and inventory writes are blocked while setup needs review.
- A material referenced by an order, price, movement, or reservation is archived, never hard-deleted.

### 7.7 MaterialPriceVersion

Fields: `id`, `material_id`, non-negative integer `amount`, `currency`, `price_unit`, `effective_from`, mandatory `reason`, `created_at`, and `created_by`.

Rules:

- Versions are immutable.
- Corrections create a new version with a new reason.
- Future-effective versions are permitted.
- The active price is the version with the greatest `effective_from` that is not later than the resolution timestamp.
- Resolution returns an explicit unavailable result when no effective version exists.
- Material price changes do not automatically change fixed catalog selling prices.

### 7.8 InventoryBalance

Each balance is uniquely keyed by `subject_type` plus `subject_id`:

- `subject_type`: `material` or `product_variant`
- `subject_id`
- `on_hand`, `reserved`, `incoming`, `planned_demand`
- derived `available = on_hand - reserved`
- derived `projected = available + incoming - planned_demand`
- `version`, `updated_at`

All quantities must remain non-negative, including the derived available value.

### 7.9 StockMovement

Fields:

- `id`, globally unique `operation_id`
- `subject_type`, `subject_id`
- `movement_type`
- signed balance deltas and requested quantity
- `reference_type`, `reference_id`, mandatory reason when required
- `balance_before`, `balance_after`
- `actor_user_id`, `created_at`

Supported types:

- Physical: `receive`, `consume`, `produce`, `ship`, `damage`, `adjustment`
- Reservation: `reserve`, `release`
- Planning: `plan_incoming`, `cancel_incoming`, `plan_demand`, `cancel_demand`

Subject rules:

- Materials support receive, reserve, release, consume, damage, adjustment, and planning operations.
- Product variants support produce, reserve, release, ship, damage, adjustment, and planning operations.
- Incoming planning operations change `incoming` only.
- Demand planning operations change `planned_demand` only.
- Cancellation references the original planning operation and cannot make its planned quantity negative.

Movements are immutable.

### 7.10 StockReservation

Fields: `id`, subject identity, quantity, business reference, `expires_at`, status, and transition audit metadata.

Status lifecycle:

```text
active -> consumed
active -> released
active -> expired
```

Terminal reservations cannot be reactivated. Reservation primitives are available to staff and future order services; the existing order endpoint is not automatically integrated in this foundation.

### 7.11 Restock Alert

Restock state is separate from user-notification delivery. It stores subject identity, safe display label, deduplication key, trigger type, threshold, current safe metrics, severity, active or resolved status, timestamps, and recipient roles.

The existing `notifications` collection stores in-app deliveries. Email remains optional through the current email service.

## 8. Lifecycle Rules

Catalog:

```text
draft -> validated -> published -> archived
```

- Validation is repeated inside publish.
- Publish creates a new revision and advances `active_publication_id` atomically.
- Archive removes the product from new public results without deleting history.

Material price labels are derived from time:

```text
scheduled -> effective -> superseded
```

Restock alert:

```text
safe -> active shortage -> resolved
```

An alert resolves only when `available > reorder_point` and `projected >= 0`.

## 9. Core Data Flows

### 9.1 Catalog Publish

```text
edit draft
-> load complete aggregate
-> permission and server validation
-> create immutable public snapshot
-> update active publication pointer
-> audit
-> public API serves new revision
```

Validation checks required text, category state, slug and SKU uniqueness, media alt text, CTA, pricing mode, active variants, stock policy, and the final customer-safe projection.

### 9.2 Material Price Update

```text
submit amount, effective date, and reason
-> validate permission, material readiness, unit, and money
-> append immutable version
-> audit
-> resolver uses it when effective
```

Past versions cannot be edited or deleted.

### 9.3 Inventory Operation

Every write requires a client-generated `operation_id`:

```text
validate permission and payload
-> begin MongoDB transaction
-> check idempotency
-> load balance and reservation
-> calculate deltas
-> reject invalid or negative state
-> compare-and-set balance version
-> insert immutable movement
-> update reservation when applicable
-> insert audit event
-> evaluate persisted restock state
-> commit
-> attempt optional email
```

Rules:

- Replaying an operation ID with the same canonical payload returns the original result.
- Replaying it with different data returns `409 Conflict`.
- Negative `on_hand`, `reserved`, `available`, `incoming`, or `planned_demand` is rejected.
- Compare-and-set conflicts use bounded retry; persistent contention returns `409` with a refresh instruction.
- Email failure does not roll back inventory or in-app notification data.

### 9.4 Public Catalog Read

```text
query active publication snapshots
-> batch-load relevant variant balances
-> map exact quantities to safe status
-> serialize explicit public schemas
```

Stock mapping:

1. `made_to_order` for that production policy.
2. `out_of_stock` when available quantity is not positive.
3. `low_stock` when available is at or below the reorder point.
4. `in_stock` otherwise.

Public responses exclude exact balance, supplier reference, material price, internal pricing rules, waste, thresholds, planned demand, movement reasons, actors, and audit data.

## 10. API Surface

### 10.1 Admin Catalog

- `GET/POST /api/admin/categories`
- `GET/PUT /api/admin/categories/{id}`
- `POST /api/admin/categories/{id}/archive`
- `GET/POST /api/admin/products`
- `GET/PUT /api/admin/products/{id}`
- `POST /api/admin/products/{id}/validate`
- `POST /api/admin/products/{id}/publish`
- `POST /api/admin/products/{id}/rollback`
- `POST /api/admin/products/{id}/archive`
- Nested variant and configuration-option endpoints under products

### 10.2 Public Catalog

- `GET /api/catalog/categories`
- `GET /api/catalog/products`
- `GET /api/catalog/products/{slug}`

Only active publication snapshots are returned.

### 10.3 Admin Materials and Pricing

- Extend existing `GET/POST/PUT /api/admin/materials`
- `POST /api/admin/materials/{id}/archive`
- `GET/POST /api/admin/materials/{id}/price-versions`
- `GET /api/admin/materials/{id}/effective-price`

The legacy `DELETE /api/admin/materials/{id}` temporarily remains as a deprecated archive alias so existing clients cannot hard-delete data. The legacy public `GET /api/materials` remains backward-compatible while the current order flow is active.

### 10.4 Admin Inventory

- `GET /api/admin/inventory/balances`
- `GET /api/admin/inventory/balances/{subject_type}/{subject_id}`
- `POST /api/admin/inventory/movements`
- `GET /api/admin/inventory/movements`
- `POST /api/admin/inventory/reservations`
- `POST /api/admin/inventory/reservations/{id}/release`
- `POST /api/admin/inventory/reservations/{id}/consume`
- `GET /api/admin/inventory/restock-alerts`
- `POST /api/admin/inventory/restock-alerts/{id}/resolve`

## 11. Permissions

| Capability | Primary roles |
|---|---|
| Read catalog drafts | Catalog Manager, Sales/Estimator, Manager/Approver, Super Admin |
| Edit catalog | Catalog Manager, Manager/Approver, Super Admin |
| Publish or rollback catalog | Catalog Manager, Manager/Approver, Super Admin |
| Read materials | Warehouse, Catalog Manager, Sales/Estimator, Manager/Approver, Super Admin |
| Edit materials | Warehouse, Manager/Approver, Super Admin |
| Read material prices | Catalog Manager, Sales/Estimator, Manager/Approver, Super Admin |
| Append material price | Catalog Manager, Manager/Approver, Super Admin |
| Read inventory | Warehouse, Sales/Estimator, Manager/Approver, Super Admin |
| Routine stock operations | Warehouse, Manager/Approver, Super Admin |
| Damage or adjustment | Manager/Approver, Super Admin |
| Read and resolve alerts | Warehouse, Manager/Approver, Super Admin |
| Archive referenced master data | Manager/Approver, Super Admin |

Permission keys:

- `catalog.read`, `catalog.write`, `catalog.publish`, `catalog.archive`
- `materials.read`, `materials.write`, `materials.archive`
- `pricing.read`, `pricing.write`
- `inventory.read`, `inventory.write`, `inventory.adjust`
- `restock_alerts.read`, `restock_alerts.manage`

The current wildcard covers Super Admin. Backend checks remain authoritative.

## 12. Admin Studio UX

### 12.1 Catalog Registry

Search and filter by category, workflow state, pricing mode, stock status, and archive state. Rows show product, category, variant count, pricing mode, publication revision, stock policy, updated time, and allowed actions.

### 12.2 Product Editor

Use focused sections for basic information, media and alt text, variants and SKU, configuration options, pricing metadata, inventory policy, and publish validation/history. Publish displays server validation failures and remains unavailable until valid.

### 12.3 Material Registry

Show SKU, base unit, supplier reference, effective price, next scheduled price, waste, reorder point, lead time, inventory state, setup state, and archive state. Legacy records needing review are visibly distinct and have a completion action.

### 12.4 Inventory

Show internal `on_hand`, `reserved`, `available`, `incoming`, and `projected`. Forms are operation-specific. Adjustment and damage require a reason and stronger permission.

### 12.5 History and Alerts

Movement history is read-only and filterable by subject, type, reference, actor, and date. Alerts show severity, trigger, safe metrics, start time, recipients, and resolution.

## 13. Transaction, Concurrency, and Availability

`docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md` is the approved authority for transaction capability. MongoDB replica-set multi-document transactions are approved for cross-collection mutations requiring atomicity.

Environment policy:

- Local mutation development uses a single-node replica set.
- CI uses an isolated replica set.
- Staging and production require transaction capability before affected mutation flags are enabled.
- Standalone MongoDB is limited to read-only or operations proven safe as single-document atomic writes.

Transaction-required boundaries include, where applicable:

- publication snapshot and active-publication pointer writes;
- inventory balance, immutable movement, and reservation writes;
- reservation release, consume, and expiry across records;
- the atomic multi-line reservation contract consumed by checkout.

When transaction capability is unavailable, a transaction-required request fails closed with `503 transaction_unavailable`. Silent fallback to non-atomic writes is prohibited. Read-only catalog projection and operations proven safe as single-document atomic writes may remain available.
Defense-in-depth indexes and versions:

- Unique operation ID prevents duplicate application.
- Unique subject key prevents duplicate balances.
- Balance version prevents lost updates.
- Unique slugs prevent conflicting public routes.
- Unique SKUs prevent ambiguous material or variant references.

## 14. Error Semantics

- `400`: a syntactically valid request violates a business rule.
- `403`: the actor lacks permission.
- `404`: the target does not exist or is not visible in that boundary.
- `409`: key conflict, mismatched idempotency replay, stale version, negative stock, invalid transition, or referenced hard-delete attempt.
- `422`: request shape or field type is invalid.
- `503`: a safe write requires unavailable transaction capability.

Errors use stable machine-readable codes and concise Indonesian messages. Internal exceptions and database details are not returned.

## 15. Restock Rules

Evaluate after every committed balance change:

```text
reorder shortage: available <= reorder_point
projected shortage: projected < 0
```

The deduplication key includes subject, trigger type, and alert cycle. While active, repeated changes update alert metrics without sending duplicate in-app notifications. When both conditions are safe, the alert resolves. A later recurrence starts a new cycle.

Warehouse receives operational alerts. Manager/Approver and Super Admin receive escalation visibility. Email is attempted only when configured.

## 16. Migration and Compatibility

### 16.1 Legacy Material Backfill

Migration is idempotent and dry-run by default. For each material:

- Keep `id`, name, description, color, legacy `active`, and creation timestamp.
- Generate deterministic unique SKU `LEGACY-MAT-<normalized-id-prefix>`.
- Set `setup_status` to `needs_review`.
- Leave base unit, supplier reference, price, and balance unconfirmed.
- Disable inventory tracking until setup is completed.
- Set new `status` to `active` when legacy `active` is true, otherwise `archived`; retain the boolean during the compatibility window.
- Map delete behavior to archive.
- Do not fabricate price versions or stock balances.

Existing orders keep `material_id` and `material_name`.

### 16.2 Rollout Sequence

```text
verify backup and database name
-> dry-run and review counts
-> deploy backward-compatible code
-> apply migration and indexes
-> review needs-review materials
-> configure price and inventory
-> verify internal and public boundaries
```

Apply requires an explicit flag. Output reports scanned, changed, already migrated, needs review, collisions, and failures without printing sensitive values.

### 16.3 Required Indexes

- Unique category slug
- Unique product slug
- Unique product-variant SKU
- Unique material SKU using a safe partial index during migration
- Unique publication `(product_id, revision)`
- Material price `(material_id, effective_from)`
- Unique inventory subject `(subject_type, subject_id)`
- Unique movement `operation_id`
- Movement subject and creation-time lookup
- Unique reservation ID and reference lookup
- Unique active restock deduplication key

## 17. Audit and Boundaries

Audit category, product, variant, option, publish, rollback, archive, material, supplier-reference, price, stock, reservation, alert-resolution, and migration-apply actions.

Audit payloads keep the current redaction rules. Public schemas exclude internal costs, price reasons, supplier reference, exact stock, thresholds, planned demand, movement reasons, actor IDs, and audit details.

## 18. Testing Strategy

### 18.1 Unit

- Publish validation and public projection
- Effective-price resolution across past, current, and future dates
- Inventory delta and non-negative invariants
- Subject-to-operation compatibility
- Stock-status mapping
- Idempotency payload comparison
- Reservation transitions
- Alert deduplication and resolution
- Permission matrix and audit redaction

### 18.2 Backend Integration

- Category, product, variant, material, and price APIs
- Draft edits do not affect published responses
- Publish and rollback create immutable revisions
- Prices cannot be edited or deleted
- Movement and balance commit together
- Replay does not double-apply; mismatched replay returns `409`
- Concurrent operations do not lose updates
- Negative operations roll back fully
- Planning operations update incoming and planned demand correctly
- Public APIs exclude all internal fields
- Archive preserves referenced data

Transaction tests run against an isolated MongoDB replica set.

### 18.3 Migration

- Legacy IDs and order references remain unchanged
- Backfill is deterministic
- Missing prices and balances are not fabricated
- Second run produces no additional changes
- Index creation is idempotent
- Dry-run performs no writes

### 18.4 Frontend

- Permission-aware routes and navigation
- Catalog filters and publish validation
- Variant and SKU forms
- Material setup and price form
- Inventory operation forms and conflict refresh
- History and alert states
- Public consumers handle all four safe stock statuses

### 18.5 End-to-End

1. Create category, fixed product, and ready-stock variant; publish; read the safe public snapshot.
2. Edit draft and verify public data stays unchanged until republish.
3. Append a future material price and verify time-based resolution.
4. Receive, reserve, release, consume, damage, adjust, plan incoming, and plan demand with correct balances.
5. Replay an operation and verify no double application.
6. Trigger one alert cycle, restore stock, and verify resolution.
7. Migrate a legacy material and verify existing order references.

## 19. Operational Handoff

1. Add MongoDB transaction-capability diagnostics.
2. Run backend, frontend, transaction integration, E2E, and production build verification.
3. Back up non-production, run dry-run, review output, apply, and configure representative materials.
4. Verify publication, price, inventory, audit, notification, and public-response boundaries.
5. Repeat backup, dry-run, apply, and verification for production.
6. Hand off material setup, price update, stock operation, publication, alert, rollback, and recovery procedures to named operational owners.

## 20. Acceptance Criteria

The foundation is complete when:

1. Catalog Managers can manage and publish validated catalog aggregates.
2. Public APIs return only active publication snapshots and safe stock status.
3. Material prices are immutable versions with effective dates and reasons.
4. Materials and ready-stock variants have atomic, idempotent balance operations.
5. No operation commits a negative or partially updated balance.
6. Restock shortage creates one internal alert cycle and resolves when safe.
7. Legacy material IDs and existing order references remain valid.
8. Referenced master data is archived, never hard-deleted.
9. Sensitive changes are permission-controlled and audited.
10. Dry-run, automated tests, transaction integration, E2E, and production build all pass before production apply.

## 21. Follow-on Sequence

1. Order Foundation: commercial snapshots, order items, reservation integration, and order lifecycle.
2. Retail MVP: catalog UI, configurator, customer price and ETA, checkout, payment, tracking, and customer restock subscription.
3. B2B MVP: inquiry, RFQ, quotation, organization approval, milestones, and project tracking.
