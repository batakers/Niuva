# COM-03 Inactive Transaction and Quote Boundary

**Status:** Candidate — Context Only — contract-only Commerce flow; no URL,
API, schema, upload, storage, payment, reservation, provider, or source change

## 1. Annotated flow

```text
public discovery/configuration (non-sensitive local draft)
  → account boundary before private artwork/upload/authoritative checkout
  → server revalidates publication, configuration, price, stock/material, file,
    ETA, fulfillment, and eligibility
  ├─ eligible direct checkout → normal checkout only after revalidation
  └─ quote_required → Retail Request reference + preserved context
                         → Assisted Retail Offer if eligible
                         → accept offer → revalidate → normal checkout
```

`quote_required` creates no Order, reservation, payment attempt, paid state, or
checkout total. Mixed carts separate direct-eligible and quote-required items.
Retail Request, Assisted Retail Offer, Retail Order, and B2B Inquiry/Quote/
Project remain separate resources.

## 2. State matrix

| State | Visible meaning | Safe next action |
| --- | --- | --- |
| Anonymous draft | Non-authoritative configuration context | Authenticate before sensitive step |
| Validating/revalidating | Server is checking current authority | Prevent duplicate irreversible action |
| Eligible | Authority permits next checkout step | Continue only after account/revalidation |
| `quote_required` | Commitment uncertainty | Preserve context, show request reference/reason, no total |
| Mixed cart | Direct and quote-required items separated | Continue each owned path without re-entry |
| Stale file/offer/config | Authority changed | Reload/compare/reconfirm |
| Uncertain | Final effect unknown | Reconcile before retry |
| Expired offer | Offer authority ended | Restart specific safe step |

## 3. Self-review

Passed against DEC-OFFER-01, DEC-RT-02, DS-03/DS-04/DS-05, and Retail IA. The
diagram assigns no URL or capability and prevents duplicate effects and false
commercial promises.
