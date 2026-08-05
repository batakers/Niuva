# Retail Design-System Convergence Task Card

Status: **Locally complete — Retail discovery slice only; Git publication not
authorized**

## Identity and baseline

- **Requester / delegated Product and Technical Owner:** Faiz
- **Driver:** Codex in an isolated Retail worktree
- **Reviewer / verifier:** Faiz with automated and browser evidence;
  independent design/Finance/security review is not claimed
- **Branch:** `frontend/retail-design-system-convergence`
- **Selected baseline:** `origin/main` at
  `0b699fea676d285a749f7bf41765b542238c3def`
- **Date:** 5 August 2026, Asia/Jakarta
- **Commit/push/PR permitted?:** No. Local source, tests, screenshots, and
  handover evidence only.

## Objective

Converge the currently implemented public Retail catalog and product-detail
surfaces into a restrained, commerce-oriented Niuva system. Prioritize product
facts, published price/availability state, category filtering, safe recovery,
and truthful CTA state while keeping every transaction and provider capability
inactive unless the existing public catalog response explicitly allows the
approved quote route.

## Authority

- `docs/NIUVA_MASTER_SPEC.md`, especially sections 6, 8, 9, and 11
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- `docs/decisions/product/DEC-OFFER-01-retail-offer-file-and-quote-routing.md`
- `docs/decisions/product/DEC-PRICE-001-custom-print-commercial-pricing.md`
- `docs/decisions/product/DEC-RT-02-retail-account-required-checkout.md`
- `docs/decisions/product/DEC-TAX-01-tax-inclusive-display-and-finance-activation-gate.md`
- `DESIGN.md`
- The active goal instruction to retain the current UI libraries and converge
  the frontend in isolated surface slices

## Audit findings addressed

- Catalog products use repeated rounded feature cards containing another
  rounded visual card, border, and shadow, producing generic marketplace
  composition instead of a restrained Niuva Retail surface.
- Catalog and detail duplicate the same media/fallback logic.
- Missing-media fallbacks use decorative `font-mono-tech` presentation.
- Product detail uses a disabled CTA as information for discovery-only and
  unavailable products rather than a readable state explanation.
- Category filters communicate selection visually but not with `aria-pressed`.
- Catalog load-more failures have no visible recovery state.
- There are no focused frontend tests for the two public Retail pages.

## In scope

- Introduce one shared Retail product-visual component using current tokens,
  Lucide, and media URL resolution.
- Recompose catalog items as unboxed product tiles with meaningful image,
  category, product, price, availability, and detail hierarchy.
- Replace the generic marketing hero with a restrained Retail introduction and
  preserve the existing public Navbar/Footer identity.
- Preserve category filtering and pagination while adding selected-state and
  load-more failure/retry semantics.
- Recompose product detail with shared visual, factual publication data, flat
  variant rows, and clear `quote_required`, `discovery_only`, or `unavailable`
  messaging from the existing `cta_state`.
- Preserve public catalog API paths and the existing Contact handoff for
  `quote_required` only.
- Add focused behavior, accessibility-structure, and static contract tests.
- Capture desktop/mobile screenshots, keyboard/focus evidence, console review,
  and automated accessibility evidence with synthetic publication data only.

## Affected files

- `docs/implementation/plans/pending-reconciliation/2026-08-05-retail-design-system-convergence-task-card.md`
- `frontend/src/components/retail/RetailProductVisual.jsx`
- `frontend/src/components/retail/RetailProductVisual.test.jsx`
- `frontend/src/pages/retail/RetailCatalogPage.jsx`
- `frontend/src/pages/retail/RetailCatalogPage.test.jsx`
- `frontend/src/pages/retail/RetailProductPage.jsx`
- `frontend/src/pages/retail/RetailProductPage.test.jsx`
- `frontend/src/pages/retail/retail-surface.contract.test.js`
- Retail-only browser evidence under `output/playwright/`

`docs/context/DOCUMENT_REGISTER.md` remains unchanged in this worktree to avoid
a same-file conflict with the isolated foundation slice. Registration belongs
to a later explicitly authorized integration step.

## Explicit exclusions

- No checkout, cart, registration handoff, private upload, automatic pricing,
  quotation-request creation, Assisted Retail Offer, inventory reservation,
  payment attempt, tax, ETA, fulfilment, cancellation, refund, return, or
  notification implementation or activation.
- No change to price or availability calculations, publication snapshots,
  `cta_state`, category/product contracts, API paths, backend projections,
  catalog data, or CMS behavior.
- No display of a tax rate, PPN amount, guaranteed ETA, exact stock quantity,
  provider, or unsupported product promise.
- No Admin catalog, Customer Portal, Auth, or public brand-page redesign.
- No new dependency, token value, Tailwind configuration, secret, provider,
  database, migration, deployment, production-readiness, or go-live change.
- No commit, push, PR, merge, or modification of another worktree.

## Acceptance criteria

1. Catalog still reads `GET /catalog/categories` and
   `GET /catalog/products`; detail still reads
   `GET /catalog/products/:slug`; no frontend mutation is introduced.
2. Category filters expose selected state to assistive technology and retain
   the existing in-memory filtering behavior.
3. Pagination preserves cursor use and provides a visible retry path after a
   failed load-more request without discarding loaded publications.
4. Product visual/media logic exists once and missing media no longer renders
   pseudo-terminal typography.
5. `quote_required` retains the Contact handoff; `discovery_only` and
   `unavailable` present information without a fake or dead transaction CTA.
6. Published price and availability continue to use existing catalog helpers;
   no tax, exact stock, ETA, provider, or activation claim is invented.
7. Migrated Retail presentation contains no `font-mono-tech`, nested generic
   marketplace card shell, page-local primary-button styling, or arbitrary
   radius utility.
8. Focused tests, full frontend regression evidence, production build, bundle
   measurement, responsive screenshots, keyboard/focus review, and automated
   accessibility checks are recorded.

## Rollback

Before publication, remove or revert only the listed Retail task paths in this
worktree. There is no data, backend, dependency, or environment rollback because
this slice changes frontend presentation, local read-state handling, and tests
only.

## Verification evidence

- Focused Retail and catalog-helper tests: **5 suites passed, 16 tests passed**.
- Full frontend regression: **47 suites passed, 1 suite failed; 285 tests
  passed, 1 test failed**. The only failure is the existing indentation-sensitive
  string assertion in `src/pages/admin/cms-lifecycle.contract.test.js:83`;
  neither that test nor `ContentEditor.jsx` changed in this slice.
- Production build: `npm run build` completed successfully.
- Bundle report-only measurement: **567.60 kB total gzip**, **197.03 kB largest
  entrypoint**, and **100.10 kB largest async asset**. No budget decision was
  applied because the approved bundle-budget environment variables are not
  present.
- Synthetic-data Chrome review covered catalog and quote-required detail at
  1440 px and 390 px widths. Automated WCAG A/AA checks reported **0
  violations** on all four surfaces, and horizontal overflow was **0 px**.
- The `quote_required` product exposed `Minta penawaran`; the
  `discovery_only` product exposed a factual status and no quote link. Mobile
  navigation opened as a dialog and closed with Escape.
- Keyboard order reached brand/navigation, the special-needs Contact link,
  and category filters in a coherent sequence. Target-route review reported
  no console error, page error, or failed response after all synthetic reads
  were explicitly mocked.
- Fixed-header clearance was measured after remediation: catalog/detail
  content begins below the 88 px header at 104 px desktop and 96 px mobile.
- Screenshots:
  - `output/playwright/retail-catalog-desktop.png`
  - `output/playwright/retail-catalog-mobile.png`
  - `output/playwright/retail-product-quote-desktop.png`
  - `output/playwright/retail-product-quote-mobile.png`

## Handover state

- Changed files are limited to the task card, two Retail pages, one shared
  Retail visual, and their focused/contract tests.
- `App.js`, public catalog helpers/contracts, API paths, backend, CMS, pricing,
  provider, and transaction activation remain unchanged.
- No dependency, token value, configuration, secret, database, migration, or
  production action was introduced.
- No commit, push, or PR has been created. Integration remains a separate gate.
