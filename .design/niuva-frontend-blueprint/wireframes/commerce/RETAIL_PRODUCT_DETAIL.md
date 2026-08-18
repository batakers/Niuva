# COM-02 Retail Product Evaluation Wireframe

**Status:** Candidate — Context Only — Commerce product-detail artifact; no
transaction activation

**Route:** `/retail/products/:slug` (current unprefixed product detail)

## 1. Hierarchy

```text
back to Retail with stored language context
  → product identity + factual publication state
  → approved media/alt text + caption
  → variant/material/quantity information where published
  → availability and price/quote status as authoritative or explicitly unknown
  → one truthful next action
  → related discovery / manual special-needs handoff
```

## 2. State and action matrix

| State | Visible behavior | Next action and boundary |
| --- | --- | --- |
| Loading | Identity/media skeleton mirrors final layout | Wait/cancel only when safe |
| Ready/public | Published identity, factual variants, approved media, available next action | Continue public discovery/configuration only |
| Not found | Route-safe missing product message | Return to `/retail` or approved Public route |
| Unpublished/unavailable | Explain that the item cannot be selected now | No private file/upload/payment action |
| Price/quote unknown | Label commitment uncertainty, not customer type | Use approved manual/context handoff; no checkout total |
| Dependency error | Preserve safe slug/context and show retry/fallback | Retry bounded request; no false success |
| Stale publication | Say what changed and require refresh | Re-read authoritative publication before action |

## 3. Responsive, evidence, and return

- Media includes meaningful alt/caption; a missing asset uses a text-led verified
  fact placeholder and never looks like finished client proof.
- Detail header stacks at 320/390px; long variant/material names wrap; primary
  action remains 44px and visible at 200% zoom.
- Back/return preserves `/retail` locale responsibility and permitted query
  context; it does not invent `/en` for the private downstream route.
- Private artwork upload, account requirement, server revalidation, checkout,
  payment, fulfillment, and production tracking remain inactive here.

## 4. Self-review

Passed against COM-01, DS-04/DS-05, DEC-OFFER-01, and DEC-RT-02. No source,
product data, transaction capability, route, or provider was changed.
