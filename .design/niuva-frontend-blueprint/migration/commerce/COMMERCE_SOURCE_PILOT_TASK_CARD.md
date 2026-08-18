# MIG-02 — Candidate Commerce source pilot task card

**Status:** Candidate planning-only card — G3/G4 not granted
**Baseline:** `origin/main` at `8555685c29a3fde9976ae6499336e2eb45a330ba`
**Owner:** Commerce frontend driver (to be named at G3)
**Surface:** Retail discovery and product detail only
**Inputs:** `COM-01`/`COM-02`/`COM-03`, QA-01–QA-05, DS-01A/DS-01B,
`DEC-OFFER-01`, `DEC-RT-02`, and current source/tests

## Objective

Test catalog discovery and one product-detail slice without activating
checkout, artwork upload, payment, reservation, provider, or production
tracking capability.

## Candidate exact-file scope

- `frontend/src/pages/retail/RetailCatalogPage.jsx`
- `frontend/src/pages/retail/RetailProductPage.jsx`
- `frontend/src/components/retail/RetailProductVisual.jsx`
- existing tests:
  `frontend/src/pages/retail/RetailCatalogPage.test.jsx`,
  `frontend/src/pages/retail/RetailProductPage.test.jsx`, and
  `frontend/src/components/retail/RetailProductVisual.test.jsx`
- shared primitives only when a separately named consumer and compatibility
  impact are proven; do not broaden the card to the full component library

## Acceptance criteria

- `/retail` and `/en/retail` remain discovery surfaces with complete locale
  copy and no guest-checkout promise.
- Product detail presents configuration/file/material/eligibility context as
  non-authoritative until account/server revalidation.
- `quote_required` remains a commitment-uncertainty result and creates no
  Order, reservation, payment attempt, paid state, or checkout total.
- Mixed-cart and manual-service boundaries remain explicit if referenced.
- Loading, empty, unavailable, validation, dependency, stale, offline, and
  recovery states are visible and do not fabricate price, stock, ETA, or
  provider success.
- 44px targets, keyboard filter/reset/detail return, 200% reflow, ID/EN long
  content, reduced motion, and 390/1440 browser evidence are recorded.

## Verification and rollback

Run focused catalog/product tests, full frontend regression, production build,
dependency audit, `git diff --check`, browser interaction, axe, and
Impeccable Product-register critique. Start from a freshly fetched
`origin/main` in an isolated worktree. Roll back only the exact pilot files;
preserve compatibility aliases and historical evidence.

## Exclusions and gates

No checkout submit, account activation, private upload, price/stock/ETA
authority, payment, storage, reservation, production, provider, schema/API,
or new dependency. G3 exact-file review precedes G4 implementation; commit,
push, PR, review, merge, and readiness remain separate.

## Self-review

- [x] Exact current Commerce page/component/test paths are named.
- [x] Retail lifecycle and account/authority boundaries are preserved.
- [x] No transaction capability or provider is activated.
- [x] Runtime evidence and rollback are required but not claimed.

**Self-review result:** Pass as a candidate G3 task card.
