# PUB-03 Inquiry State Matrix

| State | Visible representation | Safe context/recovery | Prohibited meaning |
| --- | --- | --- | --- |
| Ready | All required fields, consent, expectation copy, and submit action | Continue entry | No upload or quote implication |
| Validation error | Summary plus field errors; values retained; focus managed | Correct and resubmit | Generic toast or `Sent` |
| Submitting | Button label retained with busy state; duplicate submit blocked | Cancel only if safe | Persistence assumed |
| Dependency/system error | In-page error names unavailable persistence; fields remain valid | Bounded retry with retained values | `aria-invalid` on valid fields or false success |
| Offline/unavailable | State whether persistence is known; no automatic retry | Retry only when safe; retain allowed draft | Blind loop or UUID fabrication |
| Uncertain | “Outcome belum diketahui” / equivalent; no completion claim | Reconcile authoritative Inquiry before retry | Duplicate Inquiry |
| Persisted success | Existing Inquiry UUID, `new` status meaning, response target, next action | Optional visitor-clicked WhatsApp | Quote, price, ETA, resolution, or delivery guarantee |
| WhatsApp clicked | External continuation opens after success | Return to persisted confirmation | Create/update/prove Inquiry |

**Assistive technology:** Critical state is a visible region with an appropriate
status/error relationship; ARIA live reinforcement is not the only channel.

**Localization:** Complete ID/EN system, form, error, privacy, and conversion
copy is required; exact approved Indonesian consent remains unchanged.

**Self-review:** Matrix reconciled with the Public Inquiry persistence-first
contract and DS-03 visible-state rules; no source or lifecycle state was added.
