# COM-01 Retail Catalog State Plates

| State | Skeleton/result treatment | Focus and next action | Must not imply |
| --- | --- | --- | --- |
| Bootstrap/loading | Product rows preserve final heading/action geometry | Keep filter/query context; prevent duplicate request | Published price, stock, or ETA |
| Ready | Factual identity, media, publication/availability | Evaluate product or reset scope | Checkout eligibility |
| Empty | Explain no records for the selected authority | Reset category or use manual handoff | Dependency failure |
| No-match | Say criteria found no match; show selected filters | Remove one/all filter; retain other work | Global catalog empty |
| Error/unavailable | Error region or item-level unavailable reason | Safe retry or archive/manual path | `aria-invalid` on valid filters |
| Load-more | Existing records stay; progress label is contextual | Retry or continue; announce end | Production progress |

**Self-review:** ID/EN, 44px targets, keyboard reset/load-more, narrow
alternative, and no transaction implication are covered. Static plate only;
runtime/browser evidence belongs to QA-01/QA-02.
