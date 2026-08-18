# MIG-02 — Commerce source pilot task card

**Status:** Bounded source pilot executed; G4 implementation and G5 delivery
complete in PR #284
**G3 review baseline:** `origin/main` at
`8372c4ecf3af69cf2c15e9b9f12a166a750b0cfe`, reviewed 18 August 2026
**Execution base:** `origin/main` at `ed5fbac73463382381b183b2a3a6f1514c323d14`
**Merged execution:** source commits `808558b` and `af05810`; merge commit
`d8438b2e4e4d6b97eb147f4866b0890e85f0de06`
**Owner:** Commerce frontend driver (execution recorded; individual driver name
is not part of the repository contract)
**Surface:** Retail discovery and product detail only
**Inputs:** `COM-01`/`COM-02`/`COM-03`, QA-01–QA-05, DS-01A/DS-01B,
`DEC-UX-003`, `DEC-OFFER-01`, `DEC-RT-02`, and current source/tests

## Objective

Test catalog discovery and one product-detail slice without activating
checkout, artwork upload, payment, reservation, provider, or production
tracking capability.

## G3-reviewed exact-file scope

**Exact G3-reviewed paths executed only under separate G4 authorization:**

- `frontend/src/pages/retail/RetailCatalogPage.jsx`
- `frontend/src/pages/retail/RetailProductPage.jsx`
- `frontend/src/components/retail/RetailProductVisual.jsx`
- `frontend/src/lib/catalog.js`, limited to locale-aware public price and
  availability labels used only by the two named Retail pages; it must not
  change catalog endpoints, payloads, or commercial calculation authority
- `frontend/src/i18n.js`, limited to namespaced Retail discovery/detail copy;
  it must not alter language-preference behavior or unrelated translations
- existing tests:
  `frontend/src/pages/retail/RetailCatalogPage.test.jsx`,
  `frontend/src/pages/retail/RetailProductPage.test.jsx`, and
  `frontend/src/components/retail/RetailProductVisual.test.jsx`, plus
  `frontend/src/pages/retail/retail-surface.contract.test.js` and
  `frontend/src/lib/catalog.test.js`

`frontend/src/App.js` is a G3-inspected, read-only route owner. It already
owns `/retail`, `/en/retail`, and the deliberately unprefixed
`/retail/products/:slug` detail route. G4 must not add an English-prefixed
product-detail route, alter the router, or broaden this card to shared
primitives or the full component library.

## Acceptance criteria

- `/retail` and `/en/retail` remain localized public discovery surfaces; all
  system, state, conversion, price/availability, media-fallback, title, and
  navigation copy supplied by this slice is complete in Indonesian and English
  without machine translation or a guest-checkout promise.
- `/retail/products/:slug` remains the single, unprefixed downstream detail
  route. Its stored language preference updates supported copy without
  inventing `/en/retail/products/:slug`; its return link goes to the matching
  localized Retail entry without losing the permitted language context.
- Product detail states that any later configuration, file eligibility,
  material/stock, price, ETA, fulfillment, or checkout authority requires the
  account boundary and fresh server revalidation. It does not expose a
  configurator, file control, or authoritative commercial value.
- `quote_required` is only a commitment-uncertainty explanation and an
  approved manual/B2B discussion handoff in this inactive slice. It must not
  claim a Retail Request reference, preserved private context, Order,
  reservation, payment attempt, paid state, or checkout total.
- Mixed-cart and manual-service boundaries are stated only if they are
  referenced; they must not be simulated by the catalog/detail UI.
- Loading, collection empty, category no-match, environment unavailable,
  dependency failure, pagination recovery, detail not-found, and stale-route
  response states are visible. Validation is not applicable to this read-only
  slice; offline is described as a bounded load failure unless the runtime can
  actually observe it. No state fabricates price, stock, ETA, provider, or
  persistence success.
- 44px targets, keyboard category selection and return behavior, 200% reflow,
  ID/EN long content, reduced motion, and browser/axe evidence at 320, 390,
  768, 1024, and 1440px are recorded before any G4 completion claim.

## Verification and rollback

The G3 baseline check at the reviewed SHA passed five focused Commerce suites
(17 tests): catalog page, product detail, product visual, surface contract,
and catalog helper. It is source evidence only and does not prove browser,
provider, staging, production, or go-live behavior.

The separately authorized G4 ran the five focused Commerce suites (22 tests),
the full frontend suite (72 suites, 460 tests), production build, production
dependency audit, `git diff --check`, browser interaction and Axe checks at
320, 390, 768, 1024, and 1440px, English localized return-path verification,
and the Impeccable detector. Rollback remains limited to the named G4 paths;
routes, compatibility aliases, and historical evidence are preserved.

## Exclusions and gates

No checkout submit, account activation, private upload, price/stock/ETA
authority, payment, storage, reservation, production, provider, schema/API,
or new dependency. G3 exact-file review precedes G4 implementation; commit,
push, PR, review, merge, and readiness remain separate.

## G3 review findings

- The current router proves the localized Retail entry pair and the unprefixed
  product-detail route, so a new English detail route would conflict with
  `DEC-UX-003`.
- The two page files call `useI18n`, but almost all customer-visible Retail
  copy remains Indonesian. The current price/availability helper also returns
  Indonesian strings. `i18n.js` and `catalog.js` are therefore necessary
  exact paths rather than optional follow-ups.
- The existing surface contract verifies read-only behavior and the
  `quote_required` handoff but did not assert `/en/retail`; the existing
  catalog-helper test also needs locale-label cases. Both are named test paths
  for the amended contract.
- The present `quote_required` link is not a durable Retail Request handoff.
  G4 may improve its truthful inactive/manual explanation but must not add a
  request, private-context transfer, or transaction capability.

## Self-review

- [x] All current Commerce source/test paths required to satisfy the reviewed
      locale, route, state, and read-only contract are named.
- [x] Retail lifecycle, account, route, and commercial-authority boundaries
      are preserved.
- [x] No transaction capability, provider, route activation, or unrelated
      source capability was introduced by the executed slice.
- [x] Runtime/browser evidence and rollback are recorded for the bounded G4/G5
      execution.

**Self-review result:** G3 scope amendment, G4 implementation, and G5 delivery
are complete for PR #284. This does not establish production readiness or
go-live.
