# COM-01 Retail Catalog Discovery Wireframe

**Status:** Candidate — Context Only — Commerce calibration artifact; no
checkout, upload, payment, provider, price, inventory, or route activation

**Routes:** `/retail` and `/en/retail`

**Baseline:** `8555685c29a3fde9976ae6499336e2eb45a330ba`

## 1. Responsibility and hierarchy

```text
Retail entry expectation
  → category/query/filter controls
  → factual published product results
  → loading / empty / no-match / unavailable / dependency recovery
  → product evaluation link when a current slug exists
  → special-needs or B2B handoff when the need exceeds discovery
```

Retail is a transactional 3D-print journey eventually, but this artifact covers
public discovery only. Anonymous configuration is a non-authoritative local
draft; private upload, authoritative price/stock/eligibility, checkout,
payment, and production tracking remain separately gated.

## 2. Collection wireframe

```text
┌────────────────────────────────────────────┐
│ Retail / purpose + language                │
│ [query] [category] [material] [Reset]      │
│ Selected: category · material   results N  │
├────────────────────────────────────────────┤
│ product identity | factual media | status  │
│ product identity | factual media | status  │
│ product identity | factual media | status  │
│ [Load more] or end-of-results              │
├────────────────────────────────────────────┤
│ Need something special? B2B/manual handoff │
└────────────────────────────────────────────┘
```

Mobile stacks filters in an explicit disclosure and uses semantic product
items. A table is not required; product identity, availability and next action
remain visible without a horizontal-scroll trap.

## 3. State plates

| State | Visible contract | Recovery/boundary |
| --- | --- | --- |
| Loading | Skeleton mirrors product identity/result hierarchy | Prevent duplicate query/load-more; no price claim |
| Ready | Published product/category evidence and factual availability | Open current product detail |
| Empty | No published products in the authoritative scope | Explain and offer category reset or B2B/manual path |
| No-match | Current criteria match none; selected criteria visible | Remove/reset filters without losing unrelated context |
| Unavailable | Product/material/publication unavailable | Explain one next safe action; no checkout promise |
| Dependency error | In-page failure distinct from no-match | Bounded retry; preserve query/filter context |
| Loading more/error | Existing results remain; control label changes | Retry only safe collection request |
| Special need | Explicit manual/B2B handoff | Do not create Request/Offer/Order by visual action |

## 4. Accessibility/localization/truth

- Query/filter/reset controls are labelled, keyboard reachable, and at least
  44px; result replacement returns focus to summary or first result.
- Product names, variants, availability, and errors are tested with long ID/EN
  copy and 200% reflow at 320/390/768/1024/1440px.
- `quote_required` is not a category label; it belongs to the later guarded
  transaction flow. No guest checkout or authoritative total appears here.
- Supporting imagery is labelled; unavailable media uses a factual placeholder.

## 5. Self-review

Passed against DS-02–DS-05, DEC-OFFER-01, DEC-RT-02, and current Retail route
evidence. The wireframe separates collection mechanics from Retail authority,
keeps mobile filter recovery explicit, and introduces no source or URL.
