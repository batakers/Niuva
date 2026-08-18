# OPS-05 Catalog, Material, Inventory, and Work-Order Family

**Status:** Candidate — Context Only — Operations product/production artifact;
no inventory arithmetic, transaction, production, or source change

## 1. Archetypes

```text
Catalog list/editor: product identity → publication fields → guarded save
Material/inventory: subject/material → quantity/reason/reference → result/history
Stock movement: movement identity → quantity/reason → append-oriented history
Restock utility: exception context → authorized follow-up (not a lifecycle)
Work Order: reference/status → execution/QC context → guarded transition/history
```

Inventory movement, material state, catalog publication, and Work Order remain
separate contracts. A restock alert is a utility context, not a stock mutation
authority.

## 2. State and input cases

Loading/empty/error/no-match, numeric validation, stale/version conflict,
permission, uncertain mutation, success/reference, and recovery are visible.
Quantity, reason, and reference fields preserve safe values; transaction
atomicity and backend authorization remain decisive. No machine telemetry or
production ETA is invented.

## 3. Responsive/accessibility

Dense table/list alternatives retain identity/action at 390/768/1024/1440px;
keyboard focus returns after validation/conflict; ID/EN labels and long history
copy reflow at 200%; statuses are not color-only.

## 4. Self-review

Passed against OPS-01, DS-02–DS-04, inventory/transaction authority, and
work-order status adapters. No arithmetic, mutation, production, or source
behavior changed.
