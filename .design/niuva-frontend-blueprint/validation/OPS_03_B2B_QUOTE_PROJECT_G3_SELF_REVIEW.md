# OPS-03 — Operations Quotes and B2B Projects G3 Self-Review

**Status:** Candidate self-review — `PASS WITH HOLD`

**Date:** 19 August 2026

**Baseline:** `origin/main`
`74967a33abc6537bdd4a5c0eaec826ad251b8d91`

**Frontend axis:** `PRESENTATION_BOUNDED`

**Capability axis:** `DEFERRED`

**Legacy disposition:** `DEFERRED_WITH_OWNER_REASON`

## 1. Review boundary

This review checks whether the current Operations Quotes and B2B Projects
frontend is ready for a bounded G3 exact-file decision. It is not a claim that
Quote or Project capability is active, that a mutation is authoritative, or
that Operations is production-ready. Phase 7 remains frozen.

No source, API, schema, permission, lifecycle, provider, or business-rule file
was changed for this review.

## 2. Evidence inspected

The review inspected the following current-baseline files:

- `frontend/src/pages/admin/B2BList.jsx`;
- `frontend/src/pages/admin/B2BDetail.jsx`;
- `frontend/src/pages/admin/QuoteRevisionEditor.jsx`;
- `frontend/src/lib/b2bPagination.js`;
- `frontend/src/pages/admin/b2b-workbench.contract.test.js`; and
- `frontend/src/pages/admin/QuoteRevisionEditor.test.jsx`.

Read-only context included the applicable route/permission maps,
`frontend/src/i18n.js`, resource status adapters, API/client callers, the
Operations wireframe candidate, and the current Phase 6 ledger. The source
tests are implementation evidence only; they do not replace owner/domain or
runtime enforcement evidence.

## 3. Findings

### 3.1 Existing bounded presentation

- `B2BList` already distinguishes the configured resource families and has
  explicit loading, error, empty, and load-more handling rather than a blank
  table fallback.
- `B2BDetail` keeps resource-specific endpoint/action maps, status/history and
  blocker presentation, permission boundaries, conflict handling, expected
  version, and operation identity separate from the visual shell.
- `QuoteRevisionEditor` keeps quote revision editing separate from Project and
  Order creation, preserves immutable/version context, and exposes validation,
  unavailable/unpriced, status-conflict, and version-conflict outcomes.
- `b2bPagination` provides cursor continuity for the collection path; it is
  not a lifecycle authority and must not be extended to synthesize one.
- Existing contract tests cover the current resource separation and important
  validation/conflict behavior. This supports `PRESENTATION_BOUNDED`, not an
  active capability claim.

### 3.2 Required hold before G4

The current evidence does not prove the full later G4 claim for every
permission, localized long-content, browser viewport, reduced-motion, 200%
zoom, uncertain-outcome, and safe-retry path. More importantly, the source
does not define a new API contract for any mutation. These are not reasons to
invent a runtime change during G3; they are entry conditions for a separately
approved G4 slice.

The following must remain domain-owned and explicit:

- Quote revision authority, optimistic concurrency, and idempotent operation
  outcome;
- Project creation/conversion and any Quote-to-Project relationship;
- role/permission enforcement and forbidden-detail redaction;
- payment, Order, reservation, fulfillment, inventory, production, refund,
  and provider effects; and
- localization/content ownership for any new copy.

## 4. State and recovery matrix for the next gate

| State | Current G3 conclusion | G4 evidence required |
| --- | --- | --- |
| Ready | Identity, resource, task, and owned action are present in the current source | Browser and keyboard evidence at the named viewports |
| Loading/bootstrap | Explicit collection/detail/editor loading paths exist | Hierarchy-preserving skeleton/label and assistive status proof |
| Empty/no-match | Empty and filtered-zero-result paths are distinct candidates | Copy, reset/next action, ID/EN and long-content proof |
| Validation error | Revision validation preserves context and keeps error separate from dependency failure | Focus/summary/field relationship and retry test |
| Dependency/system error | Errors are surfaced without invalidating otherwise valid fields | Safe retry/fallback and no duplicate mutation proof |
| Permission/forbidden | Permission maps and resource actions are distinct | Runtime enforcement/redaction proof; route visibility is not authority |
| Conflict/stale | Status/version conflict paths are represented in editor/detail | Authoritative reload/compare/reconfirm flow and idempotency proof |
| Expired/offline | Not a new lifecycle state; must not fake persistence | Explicit unavailable copy and safe retained context |
| Uncertain | Operation identity is carried where applicable | Reconciliation before irreversible retry |
| Recovery | Pagination and form context are bounded candidates | Focus/scroll/context retention and no duplicate effect proof |
| Success | Must name the authoritative operation and reference | API response contract and visible success evidence |

## 5. Self-review verdict

`PASS WITH HOLD` for G3 exact-file review. The current source is a bounded
presentation surface and no speculative runtime diff is justified. The exact
candidate write set is locked in
[`OPS_03_B2B_QUOTE_PROJECT_G3_TASK_CARD.md`](../migration/operations/OPS_03_B2B_QUOTE_PROJECT_G3_TASK_CARD.md).

The next gate is owner/domain review of that card. Only after approval of the
API, permission, lifecycle, localization, and test boundaries may a separate
G4 request authorize writes to the six named paths. If no reproducible
presentation defect is found, the correct G4 outcome is no-op plus evidence,
not a redesign.

## 6. Preserved holds and exclusions

- Privacy remains `HOLD_LEGAL_CONTENT`.
- Retail Request/Offer/cart/checkout/Order remains contract-only or inactive
  where the ledger says so; no provider or payment path is activated.
- ResponsiveTable remains unpromoted until it has a named second same-purpose
  consumer and a complete mobile interaction contract.
- Design-token promotion, broad visual redesign, Customer/Auth changes,
  Public/Marketing changes, and Phase 7 are out of scope.
- Supporting historical ledgers with older baselines remain archival context;
  this self-review and the updated closure ledger are the current records for
  OPS-03.

**Final self-review:** `PASS WITH HOLD` — ready for owner/domain G3 review;
not ready for G4 implementation or capability activation.
