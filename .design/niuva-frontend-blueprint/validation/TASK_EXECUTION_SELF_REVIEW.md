# Consolidated executable-task self-review

**Status:** Candidate working-set evidence — consolidated owner review pending
**Planning SHA:** `8555685c29a3fde9976ae6499336e2eb45a330ba`
**Current alignment baseline:** `46708524bfade1dec22a7a8747165fe221cd85f1`
**Post-merge execution baseline:** `origin/main` at
`b35b5bafafa8efaa8afb1f1626c865fb831c6810`
**MIG-02 G3 review baseline:** `origin/main` at
`8372c4ecf3af69cf2c15e9b9f12a166a750b0cfe`
**Execution authorization:** Owner authorized all executable Wave B–F entries
as one Goal with independent self-review and one final report on 18 August 2026.

This ledger records completion of the executable entries in `TASKS.md`. The
remaining locked `SRC-*` entries are intentionally excluded and remain
unchecked; the completed `SRC-PUB-01A` and `SRC-PUB-01B` exceptions are
recorded below.

## Task ledger

<!-- markdownlint-disable MD013 -->

| Wave | Task IDs | Primary artifact(s) | Self-review |
| --- | --- | --- | --- |
| B — Public | PUB-01 | `wireframes/public/HOME_STRUCTURE.md` plus desktop/mobile plates | Pass |
| B — Public | PUB-02 | `visual-studies/public/HOME_ART_DIRECTION_A.md`, B, comparison | Pass |
| B — Public | PUB-03 | `prototypes/public/CONTACT_INQUIRY/` | Pass |
| B — Commerce | COM-01 | `wireframes/commerce/RETAIL_CATALOG.md` and states | Pass |
| B — Commerce | COM-02 | `wireframes/commerce/RETAIL_PRODUCT_DETAIL.md` | Pass |
| B — Auth | AUTH-01 | `wireframes/auth/LOGIN_SAFE_RETURN.md` | Pass |
| B — Account | ACC-01 | `prototypes/account/OWNED_ORDER_FLOW/` | Pass |
| B — Operations | OPS-01 | `prototypes/operations/INQUIRY_QUEUE_DETAIL/` | Pass |
| C — Public | PUB-04 | `wireframes/public/ABOUT_SERVICES_FAMILY.md` | Pass |
| C — Public | PUB-05 | `wireframes/public/PROJECT_EVIDENCE_ARCHIVE.md` | Pass |
| C — Public | PUB-06 | `wireframes/public/SUPPORT_CONTENT_FAMILY.md` | Pass |
| C — Commerce | COM-03 | `flows/commerce/TRANSACTION_QUOTE_BOUNDARY.md` | Pass |
| C — Auth | AUTH-02 | `wireframes/auth/PASSWORD_RECOVERY_SEQUENCE.md` | Pass |
| C — Auth | AUTH-03 | `wireframes/auth/STAFF_INVITATION.md` | Pass |
| C — Operations | OPS-02 | `wireframes/operations/ROLE_WORK_HOME.md` | Pass |
| C — Operations | OPS-03 | `wireframes/operations/B2B_QUOTE_PROJECT_FAMILY.md` | Pass |
| C — Operations | OPS-04 | `wireframes/operations/RETAIL_ORDER_FAMILY.md` | Pass |
| C — Operations | OPS-05 | `wireframes/operations/PRODUCT_PRODUCTION_FAMILY.md` | Pass |
| C — Operations | OPS-06 | `wireframes/operations/PUBLISHING_FAMILY.md` | Pass |
| C — Operations | OPS-07 | `wireframes/operations/GOVERNANCE_UTILITY_FAMILY.md` | Pass |
| C — Operations | OPS-08 | `visual-studies/operations/WORK_HOME_GRID_COMPARISON.md` | Pass |
| D — Expression | EXP-01 | `experiments/DONOR_ADMISSION_LEDGER.md` | Pass |
| D — Expression | EXP-02 | `experiments/MOTION_CONTRACTS.md` and specimen | Pass |
| D — Expression | EXP-03 | `visual-studies/public/EVIDENCE_VISUAL_LANGUAGE.md` | Pass |
| E — Validation | QA-01 | `validation/RESPONSIVE_LOCALIZATION_MATRIX.md` | Pass with runtime hold |
| E — Validation | QA-02 | `validation/ACCESSIBILITY_STATE_MATRIX.md` | Pass with runtime hold |
| E — Validation | QA-03 | `validation/TRUTH_PRIVACY_LIFECYCLE_AUDIT.md` | Pass with server/runtime hold |
| E — Validation | QA-04 | `validation/VISUAL_CRITIQUE_REGISTER.md` | Pass at static artifact level |
| E — Validation | QA-05 | `decisions/PROMOTION_REVIEW.md` | Pass; no runtime promotion |
| F — Migration | MIG-01 | `migration/public/PUBLIC_SOURCE_PILOT_TASK_CARD.md` | Pass; G4/G5 complete in PR #279 |
| F — Migration | MIG-01B | `migration/public/PUBLIC_CONTACT_INQUIRY_SOURCE_PILOT_TASK_CARD.md` | Pass; G4/G5 complete in PR #281 |
| F — Migration | MIG-02 | `migration/commerce/COMMERCE_SOURCE_PILOT_TASK_CARD.md` | G3 pass with exact-scope amendment at `8372c4e`; G4 holds |
| F — Migration | MIG-03 | `migration/account/ACCOUNT_AUTH_SOURCE_PILOT_TASK_CARD.md` | Pass; G3/G4 hold |
| F — Migration | MIG-04 | `migration/operations/OPERATIONS_SOURCE_PILOT_TASK_CARD.md` | Pass; G3/G4 hold |
| F — Migration | MIG-05 | `migration/FOUNDATION_TASK_CARDS.md` | Pass; G3/G4 hold |
| F — Migration | MIG-06 | `migration/COMPATIBILITY_RETIREMENT_PLAN.md` | Pass; separate retirement gate |

<!-- markdownlint-enable MD013 -->

**Executable task count:** 35 (8 Wave B + 13 Wave C + 3 Wave D + 5 Wave E + 6
Wave F). **Completed:** 35. **Locked and intentionally not executed:** 4
remaining `SRC-*` entries; the executed `SRC-PUB-01A` and `SRC-PUB-01B`
exceptions are recorded separately and are not included in the executable
count.

## MIG-01B execution record

- **Source commit:** `effb95ada3ddde5e016ae5330cc7083a4655880f`
- **Merge commit:** `b35b5bafafa8efaa8afb1f1626c865fb831c6810`
- **PR:** [#281](https://github.com/batakers/Niuva/pull/281), merged 18 August
  2026 from the four exact paths named in the MIG-01B task card.
- **Scope:** Public Contact/Inquiry only. No backend, API/schema, provider,
  upload, payment, route, dependency, or business-rule change.
- **Verification:** 15 focused tests; 72 frontend suites / 455 tests;
  production build; dependency audit; `git diff --check`; browser ID/EN at
  390/1440px; axe 0 violations; Impeccable detector `[]`.
- **Observed limitation:** preview-only `/api/auth/me` 404s without a backend
  were not page exceptions. Production readiness, provider activation, and
  go-live were not established.

## MIG-02 G3 exact-file review record

- **Review baseline:** `8372c4ecf3af69cf2c15e9b9f12a166a750b0cfe` on
  18 August 2026 in a fresh, isolated worktree.
- **Scope result:** the existing catalog/detail/visual files and their three
  tests remain bounded; `frontend/src/lib/catalog.js`,
  `frontend/src/i18n.js`, `frontend/src/lib/catalog.test.js`, and
  `frontend/src/pages/retail/retail-surface.contract.test.js` are additionally
  required for a truthful complete-locale and route-contract implementation.
- **Route result:** `/retail` and `/en/retail` are the localized entry pair;
  `/retail/products/:slug` remains an unprefixed downstream Retail route.
  G4 must not invent an English-prefixed detail route.
- **Lifecycle result:** `quote_required` remains an inactive informational
  manual/B2B handoff in this pilot. No Retail Request, Order, reservation,
  payment attempt, paid state, private upload, provider, or context-persistence
  capability is authorized.
- **Baseline verification:** 5 focused Commerce suites / 17 tests passed. This
  is not browser, provider, staging, production, readiness, or go-live
  evidence.
- **Next gate:** a separately authorized G4 source implementation in the
  amended exact paths; this G3 documentation review grants none.

## Cross-task checks

- Canonical authority and selected SHA are recorded in each Wave E/F artifact.
- Public, Commerce, Account/Auth, and Operations responsibilities remain
  separate; no universal composition or lifecycle was introduced.
- Every artifact includes a self-review, explicit exclusions, and a rollback or
  discard path appropriate to its type.
- Page-local art direction, donor experiments, Operations grid, and token
  previews remain LOCAL/held; no component, token, route, or dependency was
  promoted.
- Runtime/browser/axe/assistive-technology evidence is marked pending wherever
  it was not actually run.
- This documentation alignment does not modify application source, runtime
  tokens, routes, APIs, schemas, dependencies, capabilities, or business
  rules. The bounded MIG-01 and MIG-01B source/test changes are recorded in
  merged PRs #279 and #281; no other source pilot is implied.
- The earlier MIG-01 shell card remains unchanged as the PR #279 handoff
  record; its historical MIG-01B candidate wording is superseded for current
  status by the MIG-01B card and execution record in this alignment.

## Self-review

- [x] All 35 executable task IDs in `TASKS.md` are represented above; the
      MIG-01B executed split is recorded separately.
- [x] All primary artifacts exist in this `.design/` working set.
- [x] Remaining locked `SRC-*` tasks remain unchecked and explicitly out of
      scope; the merged `SRC-PUB-01A` and `SRC-PUB-01B` exceptions are recorded
      above.
- [x] No delivery or canonical gate is inferred from documentation completion.
- [x] Remaining holds are named rather than silently treated as failures or
  successes.

**Self-review result:** Pass for consolidated owner review; MIG-01 shell/
navigation and MIG-01B Contact/Inquiry delivery are recorded as merged, while
canonical promotion, readiness, go-live, and all other source-pilot gates
remain separate.
