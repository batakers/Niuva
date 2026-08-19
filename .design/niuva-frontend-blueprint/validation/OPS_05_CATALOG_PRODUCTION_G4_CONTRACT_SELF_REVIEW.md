# OPS-05 — G4 API/Domain Contract Self-Review

**Status:** `PASS WITH HOLD` — candidate contract is internally complete for
owner/domain review; runtime G4 is not authorized

**Date:** 20 August 2026

**Baseline:** `origin/main`
`ffa30bf5ef26042abb75221c379aeed9711abae2`

**Worktree:** `docs/niuva-ops05-g4-contracts-20260820`

**Artifacts reviewed:**

- [`OPS_05_CATALOG_PRODUCTION_G4_API_DOMAIN_CONTRACT.md`](../migration/operations/OPS_05_CATALOG_PRODUCTION_G4_API_DOMAIN_CONTRACT.md)
- [`OPS_05_CATALOG_PRODUCTION_G4_TASK_CARD.md`](../migration/operations/OPS_05_CATALOG_PRODUCTION_G4_TASK_CARD.md)
- [`OPS_05_CATALOG_PRODUCTION_G3_TASK_CARD.md`](../migration/operations/OPS_05_CATALOG_PRODUCTION_G3_TASK_CARD.md)
- [`OPS_05_CATALOG_PRODUCTION_G3_SELF_REVIEW.md`](OPS_05_CATALOG_PRODUCTION_G3_SELF_REVIEW.md)

This is a documentation self-review. It does not promote the candidate
contract, authorize source changes, or unfreeze Phase 7.

## 1. Baseline and authority checks

- [x] Fresh isolated worktree is based on current `origin/main` at the exact
      SHA above, after the merged OPS-05 closure reconciliation.
- [x] `DEC-OPS-001`, `DEC-ACCESS-002`, the transaction ADR, and the catalog/
      material/inventory runbook are named in the contract's precedence order.
- [x] The transaction ADR path is corrected to
      `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`;
      the stale `docs/adr` reference from the G3 review is not reused.
- [x] Backend authorization, projection, lifecycle, version, inventory
      arithmetic, and audit remain the authority.
- [x] Phase 7 is explicitly frozen.

## 2. Six-hold coverage

| G3 hold | Contract section | Self-review result |
| --- | --- | --- |
| Movement filter/API mismatch and export parity | Contract 1 | Query fields, date normalization, stable ordering, cursor binding, export parity, and explicit cap/error are stated |
| Bounded internal collections and no-match | Contract 2 | Candidate server-side query/projection envelope, completeness, empty/no-match, and continuation rules are stated |
| ID/EN and raw domain enums | Contract 3 | Resource-specific adapter contract, unknown fallback, and complete state copy are stated |
| Toast-only approval/recovery | Contract 4 | Existing mutation authority, reconciliation read condition, decision states, focus, and safe retry are stated |
| Work Order bootstrap ambiguity | Contract 5 | Loading/empty/no-match/error/uncertain states retain project and form context without lifecycle changes |
| Product Editor compound save | Contract 6 | Split-save choice B is explicit; partial success and no-atomicity claim are defined |

Result: all six holds have a bounded preceding contract. No hold is silently
marked delivered, and no new capability is inferred from a UI state.

## 3. Data-quality and API review

- [x] Completeness: server-side filters and export scope are required; local
      filtering cannot claim full history.
- [x] Validity: enum, date, cursor, limit, and reason constraints are named.
- [x] Consistency: read and export use the same normalized filter vocabulary;
      ordering and projection are deterministic.
- [x] Uniqueness: cursors are query-bound and orderings include an `id`
      tie-breaker; operation IDs remain domain-owned.
- [x] Timeliness: authoritative timestamps remain in projections and stale
      state requires revalidation.
- [x] Integrity: permissions, BOLA/IDOR checks, expected versions, and
      fail-closed transaction behavior remain required.
- [x] Traceability: operation/reference/version/audit evidence is preserved;
      no raw document or private actor field is added to a projection.
- [x] Error semantics use the existing safe `detail.code/message/errors`
      compatibility floor and do not expose internals.

The proposed `50` default / `100` maximum page and initial `5000` export cap
are explicitly identified as candidate values for owner/domain confirmation;
they are not asserted as current runtime behavior.

## 4. Frontend state and accessibility review

- [x] Loading is distinct from authoritative empty and no-match.
- [x] First-load and continuation errors preserve query and safe rows.
- [x] Approval success, conflict, dependency failure, uncertainty, and
      recovery are visible inline; toast/live regions are supplementary.
- [x] Focus return, keyboard order, ID/EN copy, 200% zoom, and reduced motion
      are required before a G4 closure claim.
- [x] Split-save UI reports per-section state and never claims aggregate
      atomicity from `Promise.all`.
- [x] Work Order list/create context does not imply production start,
      allocation, completion, capacity, or provider success.

## 5. Exact-file and scope review

- [x] The companion task card separates G4-A through G4-F and marks
      conditional backend paths explicitly.
- [x] No global `SurfacePanel` clipping, token promotion, route activation,
      provider, schema, migration, or permission file is in the default write
      set.
- [x] Existing B2B cursor mechanics and Work Order backend are preserved
      unless a separate regression proves an exact change is necessary.
- [x] Product Editor's aggregate backend endpoint is deferred rather than
      invented.
- [x] Runtime source diff in this documentation worktree is expected to be
      empty; only the candidate artifacts and ledger reference may change.

## 6. Verification performed

- [x] Baseline, route, source, API, schema/model, runbook, and focused test
      paths were inspected read-only.
- [x] Contract links resolve to files present at this baseline.
- [x] The six hold names and exact proposed G4 paths are cross-referenced.
- [ ] Runtime backend/frontend tests — intentionally not run; this slice does
      not alter runtime source and the contract values still require review.
- [ ] Browser/Axe/Impeccable runtime evidence — intentionally deferred to the
      matching G4 implementation slice.

## 7. Verdict and next gate

**Self-review verdict:** `PASS WITH HOLD` for documentation completeness.

**Required next gate:** owner/domain review of the six contract decisions and
the exact-file task card. If approved, request one G4 sub-slice at a time in a
fresh worktree, then stage only its named paths and run the required API,
frontend, browser, accessibility, and data-quality evidence.

Until then:

- OPS-05 remains `frontend_status: PRESENTATION_BOUNDED` and
  `capability_status: DEFERRED`;
- no runtime API/domain implementation has started;
- no catalog, inventory, restock, production, provider, or transaction
  capability is activated; and
- Phase 7 remains frozen.
