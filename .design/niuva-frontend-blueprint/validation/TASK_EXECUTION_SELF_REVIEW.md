# Consolidated executable-task self-review

**Status:** Candidate working-set evidence — autonomous self-review complete;
owner review remains optional and no runtime gate is inferred
**Planning SHA:** `8555685c29a3fde9976ae6499336e2eb45a330ba`
**Historical alignment baseline:** `814a46329b8de7775c2de8b1ee34536d73df63e1`
**Current alignment baseline:** `origin/main` at
`ce3cc7633ef794050b40baeba42624979782a2c1`
**Post-merge execution baseline:** `origin/main` at
`ce3cc7633ef794050b40baeba42624979782a2c1` (PR #305 Not Found source
delivery)
**MIG-02 G3 review baseline:** `origin/main` at
`8372c4ecf3af69cf2c15e9b9f12a166a750b0cfe`
**Execution authorization:** Owner authorized all executable Wave B–F entries
as one Goal with independent self-review and one final report on 18 August 2026.

This ledger records completion of the executable entries in `TASKS.md`. The
backlog reconciliation separately records the documentation disposition for
`SRC-EXPAND-01` and the candidate `SRC-PUB-02` G3 card. Its follow-up is split:
`SRC-PUB-02A` has a Not Found-only G4 card delivered in PR #305, while
`SRC-PUB-02B` remains a Privacy legal/content hold. The completed Public, Commerce,
Account/Auth, Operations, Customer Registration, customer-owned Order, and
FAQ exceptions are recorded below.

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
| F — Migration | MIG-02 | `migration/commerce/COMMERCE_SOURCE_PILOT_TASK_CARD.md` | Pass; G4/G5 complete in PR #284 |
| F — Migration | MIG-03 | `migration/account/ACCOUNT_AUTH_SOURCE_PILOT_TASK_CARD.md` | Pass; G4/G5 complete in PR #288 |
| F — Migration | MIG-04 | `migration/operations/OPERATIONS_SOURCE_PILOT_TASK_CARD.md` | Pass; G4/G5 complete in PR #290 |
| F — Migration | MIG-05 | `migration/FOUNDATION_TASK_CARDS.md` | Pass; equivalent foundation source slice merged in PR #276; remaining groups remain separately gated |
| F — Migration | MIG-06 | `migration/COMPATIBILITY_RETIREMENT_PLAN.md` | Pass; separate retirement gate |

<!-- markdownlint-enable MD013 -->

**Executable task count:** 35 (8 Wave B + 13 Wave C + 3 Wave D + 5 Wave E + 6
Wave F). **Completed:** 35. **Locked and intentionally not executed:** the
remaining route-family expansion and the new candidate `SRC-PUB-02` G3 review
(these are source-pilot gates, not executable Wave tasks). The Not Found
companion `SRC-PUB-02A` is delivered in PR #305; Privacy `SRC-PUB-02B`
remains held. The executed
`SRC-PUB-01A`, `SRC-PUB-01B`, `SRC-PUB-01C`, `SRC-ACC-01`, `SRC-ACC-02`,
`SRC-ACC-03`, `SRC-COM-01`, and `SRC-OPS-01` exceptions are recorded
separately and are not included in the executable count.

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

## MIG-03 Account/Auth execution record

- **Source commit:** `18821fd5039b7edf4c3c475f7455effd1a576a3e`
- **Merge commit:** `0cc824f522e00190a16db5c73d4d7615acf2b698`
- **PR:** [#288](https://github.com/batakers/Niuva/pull/288), merged 18 August
  2026 from the exact Customer Login/recovery paths in its task card.
- **Scope:** Customer Login, Forgot Password, Reset Password, AuthShell
  responsive floor, safe customer return, and localized ID/EN feedback only.
  No staff login, registration, identity provider, backend, API, role, or
  session contract change.
- **Verification:** 7 focused suites / 49 tests; 73 frontend suites / 466
  tests; production build; `git diff --check`; production dependency audit
  with existing React Router RSC advisory hold; Impeccable detector `[]`;
  browser ID/EN × 320/390/1440 for login/recovery; no overflow, Axe 0, and
  keyboard/reduced-motion smoke.
- **Observed limitation:** browser API/auth behavior was mocked or preview
  bounded; backend session, identity, provider, staging, production, and
  readiness remain outside this evidence.

## MIG-04 Operations execution record

- **Source commit:** `d5f6877689d148acf20e37a5a64e454ac703edcc`
- **Merge commit:** `814a46329b8de7775c2de8b1ee34536d73df63e1`
- **PR:** [#290](https://github.com/batakers/Niuva/pull/290), merged 18 August
  2026 from the seven exact paths in the amended Operations task card.
- **Scope:** Operations B2B list/detail record context, Quote acceptance
  evidence copy, completed-project draft action copy, and Admin breadcrumb
  localization. No shared `OperationalNavigation`, status adapter, route,
  permission, API, backend, role, or lifecycle change.
- **Verification:** 5 focused suites / 42 tests; 73 frontend suites / 467
  tests; production build; `git diff --check`; production dependency audit
  with existing React Router RSC advisory hold; Impeccable detector `[]`;
  browser ID/EN × 390/768/1024/1440 across work home, Inquiry list/detail,
  and Quote detail; 32/32 no overflow, page errors, or serious/critical Axe
  findings.
- **Observed limitation:** browser API/authorization behavior was mocked or
  preview bounded; backend authorization, projection, staging, production,
  and readiness remain outside this evidence.

## Later source execution records on the current baseline

### Commerce discovery/detail — PR #284

- **Merge commit:** `d8438b2e4e4d6b97eb147f4866b0890e85f0de06`.
- **Scope:** localized Retail discovery/detail and inactive, non-transactional
  `quote_required` explanation; no checkout, upload, payment, reservation,
  provider, API/schema, or route change.
- **Verification:** 5 focused suites / 22 tests; 72 suites / 460 tests;
  production build; browser/axe matrix; dependency and diff checks; and
  Impeccable detector `[]`.

### Customer Registration — PR #296

- **Merge commit:** `b1142f1d0bf1edcad33498e71b6a950aa6039450`.
- **Scope:** gated email/password registration and dormant provider-neutral
  Google OIDC seams with bilingual verification/recovery states; feature flags
  and provider credentials remain disabled.
- **Verification:** 4 focused suites / 33 tests; 74 suites / 475 tests;
  backend auth/security/schema checks; production build; browser ID/EN matrix;
  Axe 0; and diff/compile checks.

### Customer-owned Order recovery — PR #299

- **Source commit:** `92dfbda5c0ba847a73461e17ab61d7fcb0d2a027`.
- **Merge commit:** `0488515597719152e2de449dcbd13314e629b855`.
- **Scope:** customer-safe read-only dashboard/order recovery and malformed,
  forbidden, and not-found handling; no new lifecycle, payment, provider,
  upload, or permission authority. Detailed evidence remains in
  `validation/CUSTOMER_OWNED_ORDER_G3_REVIEW.md`.

### FAQ consumer states — PR #301

- **Source commit:** `21c740facbc1d6cc1aabe892a753d9bfe6cef92f`.
- **Merge commit:** `518f951d2dd7aa94c45b65b0f8944bee7b20fe11`.
- **Exact paths:** `frontend/src/pages/marketing/FaqPage.jsx`,
  `frontend/src/pages/marketing/FaqPage.states.test.jsx`, and
  `frontend/src/i18n.js`.
- **Scope:** visible ready/loading/empty/disabled/invalid/dependency-error
  states, browseable FAQ behavior, localized fallback, and static content
  reveal; no route, CMS, backend, dependency, lifecycle, or business-rule
  change.
- **Verification:** 6 focused tests; 74 suites / 481 tests; production build;
  dependency audit; browser ID/EN × 320/390/768/1024/1440; Axe 0;
  reduced-motion check; Impeccable detector `[]`; and `git diff --check`.

The backlog reconciliation at
`validation/REMAINING_BACKLOG_RECONCILIATION.md` closes the planning ambiguity:
the Privacy/Not Found card is a bounded G3 PASS WITH CONDITIONS, its Not
Found follow-up was delivered as bounded G4 PR #305, and Privacy remains a
legal/content hold. Future route-family expansion is explicitly
one-family-at-a-time; no broad route expansion is implied.

## Public Not Found G4 execution record — PR #305

- **Source commit:** `c25ffeb2aefa43e5cb70c32b0a59ebd56ddfcf83`.
- **Merge commit:** `ce3cc7633ef794050b40baeba42624979782a2c1`.
- **Exact paths:** `frontend/src/pages/marketing/NotFoundPage.jsx` and
  `frontend/src/pages/marketing/NotFoundPage.test.jsx` only.
- **Scope:** overflow-safe missing-path presentation, localized page-owned
  title/description, canonical Home/Services/Projects/Contact recovery links,
  accessible targets, and long-path tests. No route, Layout metadata, Privacy,
  dependency, backend, provider, or business-rule change.
- **Verification:** focused 4/4; full frontend 74 suites / 483 tests;
  production build; production dependency audit; `git diff --check`; browser
  ID/EN × 320/390/768/1024/1440 with zero overflow, no sub-44px recovery
  target, `noindex, follow`, and Axe 0; reduced-motion check; Impeccable
  detector `[]`; CI backend/frontend/secret-scan passed; no unresolved review
  threads.
- **Boundary:** source/browser/CI evidence only; server enforcement, staging,
  production readiness, and go-live remain unproven. Privacy `SRC-PUB-02B`
  remains held for legal/content review.

## Cross-task checks

- Canonical authority and selected SHA are recorded in each Wave E/F artifact.
- Public, Commerce, Account/Auth, and Operations responsibilities remain
  separate; no universal composition or lifecycle was introduced.
- Every artifact includes a self-review, explicit exclusions, and a rollback or
  discard path appropriate to its type.
- Page-local art direction, donor experiments, Operations grid, and token
  previews remain LOCAL/held; no component, token, route, or dependency was
  promoted.
- Runtime/browser/Axe evidence is attached to the exact merged Account/Auth and
  Operations pilots; screen-reader, contrast, server, staging, production,
  readiness, and go-live evidence remains pending wherever it was not run.
- This documentation alignment does not modify application source, runtime
  tokens, routes, APIs, schemas, dependencies, capabilities, or business
  rules. The bounded source/test changes are recorded in merged PRs #279,
  #281, #284, #288, #290, #296, #299, and #301; no other source pilot is
  implied.
- The earlier MIG-01 shell card remains unchanged as the PR #279 handoff
  record; its historical MIG-01B candidate wording is superseded for current
  status by the MIG-01B card and execution record in this alignment.

## Self-review

- [x] All 35 executable task IDs in `TASKS.md` are represented above; the
      MIG-01B executed split is recorded separately.
- [x] All primary artifacts exist in this `.design/` working set.
  - [x] `SRC-PUB-02`, its `SRC-PUB-02A`/`SRC-PUB-02B` split, and
      `SRC-EXPAND-01` have an explicit documentation disposition in
      `validation/REMAINING_BACKLOG_RECONCILIATION.md`; Not Found delivery is
      recorded and Privacy remains bounded to its separate hold.
- [x] No delivery or canonical gate is inferred from documentation completion.
- [x] Remaining holds are named rather than silently treated as failures or
  successes.

**Self-review result:** Pass for consolidated owner review; the ledger is
aligned to `origin/main` through PR #305 and records all bounded source
exceptions with their evidence. Privacy G4, future route-family source work,
canonical promotion, readiness, go-live, and all other external gates remain
separate.
