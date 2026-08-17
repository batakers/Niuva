# Niuva Semantic-Token Foundation Contract — Exact-File Task Card

**Status:** Implemented and merged in PR #276 — proportional verification
passed with one pre-existing out-of-scope Homepage line-ending failure;
documentation publication and consumer-migration gates remain separate

**Date:** 17 August 2026

**Baseline:** `origin/main`
`5df75387b5ead07703cf162179d5fde7f47fdfb7`

**Related approval:**
[`2026-08-17-niuva-semantic-token-component-state-contract-review.md`](../../specs/candidates/2026-08-17-niuva-semantic-token-component-state-contract-review.md)

**Context:** NDS 2.0 foundation work already exists in the repository from the
earlier Gate 1 change. This task card does not recreate that foundation or
authorize a broad redesign. It defines the first bounded reconciliation slice
for the owner-approved semantic-token and component-state contract after the
cross-surface audit in PR #275.

**Owner decision:** The task card and its exact-file planning boundary were
approved on 17 August 2026. A subsequent explicit gate authorized only the
Section 3 source slice in the current isolated worktree. Staging, commit,
push, PR, and merge were then completed as PR #276. Documentation publication,
consumer migration, deployment, readiness, and go-live remain separate.

## 1. Objective

Reconcile the existing CSS-variable foundation and its contract tests with the
approved semantic vocabulary, surface boundaries, compatibility rules, and
visible-state contract. The slice must preserve current runtime values and
consumer behavior unless a separately approved amendment says otherwise.

The result is a verifiable foundation contract for later per-surface migration,
not a page redesign and not a new token runtime.

## 2. Authority and workflow

Use this order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. the applicable approved decision or ADR;
5. `DESIGN.md` and the applicable Brand/Product register;
6. `docs/decisions/experience/DEC-UX-004-cross-surface-design-system-reconstruction.md`;
7. `docs/implementation/plans/pending-reconciliation/2026-08-05-frontend-component-register.md`;
8. the approved semantic-token/component-state review packet; and
9. current source and tests as implementation evidence.

Impeccable remains the primary frontend quality gate. Owl Listener, Taste,
Emil Design Engineering, Frontend Design, UI/UX Pro Max, and Fullstack
guidance remain filtered supporting references. No validator donor is installed
as a repository dependency.

## 3. Exact implementation paths

Only these paths may be changed by the later implementation slice:

1. `frontend/src/index.css`
   - reconcile core semantic aliases, surface aliases, compatibility aliases,
     focus roles, and motion roles;
   - preserve the existing CSS custom-property runtime;
   - preserve current values by default; and
   - do not add page-local or lifecycle-named token authority.
2. `frontend/tailwind.config.js`
   - keep Tailwind mappings pointed at the CSS-variable runtime;
   - preserve opacity-channel and legacy utility compatibility; and
   - do not introduce a second token source or theme engine.
3. `frontend/src/components/ui/design-system-foundation.contract.test.js`
   - assert required role families, dependency direction, compatibility aliases,
     and absence of backend lifecycle meaning in token names.
4. `frontend/src/components/ui/motion-accessibility.contract.test.js`
   - assert the approved motion grammar, visible focus, and per-contract
     reduced-motion behavior where the foundation contract applies.
5. `frontend/src/components/ui/nds-foundation-primitives.test.jsx`
   - preserve and extend only the existing shared-primitives contract for
     semantic variants and visible state behavior; no new primitive is added.
6. `docs/implementation/plans/pending-reconciliation/2026-08-05-frontend-component-register.md`
   - record the refreshed baseline, exact contract disposition, consumer
     evidence, and rollback reference.
7. `docs/implementation/plans/pending-reconciliation/2026-08-17-niuva-semantic-token-foundation-contract-task-card.md`
   - record the final changed paths, verification, handover, and rollback.

No other path is in scope without a new exact-file review.

## 4. Contract requirements

The implementation must:

- keep the dependency direction `global values -> core semantic aliases ->
  surface aliases -> justified component tokens -> shared UI contracts ->
  surface/domain compositions -> route pages`;
- use purpose-based role families for surface, text, action, status, boundary,
  layout, and motion;
- keep Public/Marketing in the Brand Persuade/Experience register and
  Commerce/Retail, Account/Customer, and Operations/Admin in the Product
  Operate register;
- preserve compatibility aliases until zero-consumer evidence, named
  replacements, rollback notes, and removal approval exist;
- keep `loading`, `submitting`, `validating`, and `quote_required` as view
  presentation terms rather than backend lifecycle enums;
- preserve the NDS 13-field component record and the complete visible,
  recovery, conflict, permission, expired, offline, uncertain, and success
  state contract; and
- keep CSS-first motion, visible focus, and reduced-motion feedback without a
  new dependency or a global feedback reset.

## 5. Explicit exclusions

- No route-page, Homepage, Auth, Retail, Customer, Admin, FAQ, 404, or
  marketing composition migration.
- No source consumer sweep beyond the exact contract tests listed above.
- No font installation/removal, palette redesign, token-value rebrand, dark
  mode, or new design-token package.
- No component API change, new component, dependency change, or build-system
  migration.
- No route, redirect, locale, CMS, API, schema, provider, payment, storage,
  permission, customer-data, or business-rule change.
- No prototype or compatibility-alias deletion or activation.
- No `PRODUCT.md` refresh; that remains a separate documentation task.
- This card did not itself grant staging, commit, push, PR, merge, deployment,
  readiness, or go-live approval. The source slice was later authorized and
  merged separately as PR #276; documentation publication and consumer
  migration remain outside that merge.

## 6. Acceptance criteria

The implementation slice is acceptable only when:

1. every changed token has a semantic role and an identified consumer or an
   explicit compatibility rationale;
2. CSS and Tailwind resolve through one runtime source without broken opacity
   modifiers or legacy aliases;
3. Public and Product surface aliases remain domain-restricted and do not
   imply lifecycle or provider authority;
4. existing shared primitive APIs remain compatible, with no undocumented
   breaking change;
5. focus, loading, validation, error, conflict, recovery, uncertain, and
   success feedback remain visible to sighted and assistive-technology users
   where applicable;
6. no route page or unrelated component file changes; and
7. the exact changed-path list, consumer evidence, rollback action, and
   unresolved follow-ups are recorded in the component register and this card.

## 7. Verification plan

After separate implementation authorization, run from `frontend/`:

- focused contract tests for the three exact test paths above;
- the full frontend test suite with watch mode disabled;
- production build and `npm run audit:production`;
- Impeccable detector after edits are complete;
- browser checks at 320, 390, 768, 1024, and 1440px for focus, reduced motion,
  no overflow, and representative shared primitives; and
- `git diff --check` plus an exact-path staged-diff review.

Tests and browser evidence are implementation evidence only. They do not
establish staging, provider activation, production readiness, or go-live.

## 8. Rollback and handover

Before publication, rollback is restoration of only the exact paths listed in
Section 3. Compatibility aliases must remain available so a later revert does
not require route or data migration. Any unresolved consumer, focus, state,
localization, build, or accessibility regression blocks the slice.

Handover must identify changed and intentionally unchanged files, consumer
coverage, tests and browser checks, compatibility behavior, rollback action,
remaining migration debt, and the next surface owner.

## 9. Delivery gates

This card defines the exact-file planning boundary only. The historical
source-delivery gates are complete; the remaining gates are separate:

1. **Completed:** owner review of this task card and its exact paths;
2. **Completed:** permission to implement only the Section 3 source slice;
3. **Completed:** permission to stage only the reviewed changed paths;
4. **Completed:** commit, push, and PR #276 creation;
5. **Completed:** CI and review-thread validation; and
6. **Completed:** separate merge approval for PR #276;
7. **Pending:** publication of this task card and the candidate contract as a
   documentation-only PR; and
8. **Pending:** a new exact-file task and owner gate for each consumer
   migration slice.

Per-surface token consumer migration, component adoption, page redesign, and
compatibility removal each require their own task card and owner gate.

## 10. Local implementation handover

The bounded local slice changed only these tracked paths:

- `frontend/src/index.css` — added value-preserving semantic aliases for
  technical text, focus border, disabled action, inverse surface, and overlay
  surface roles;
- `frontend/tailwind.config.js` — mapped those aliases to the existing CSS
  custom-property runtime;
- `frontend/src/components/ui/design-system-foundation.contract.test.js` —
  added alias and lifecycle-authority contract assertions;
- `frontend/src/components/ui/motion-accessibility.contract.test.js` — added
  reduced-motion foundation assertions; and
- `docs/implementation/plans/pending-reconciliation/2026-08-05-frontend-component-register.md`
  — refreshed the current baseline and recorded the follow-up contract.

The existing NDS values, page consumers, shared component APIs, routes, and
business lifecycles were intentionally unchanged. The two candidate
documentation files in this worktree remain untracked until a separate
documentation-publication decision.

Verification evidence:

- dependency installation used the existing lockfile only; no package or
  lockfile path changed;
- focused Jest: **3/3 suites, 32/32 tests passed**;
- regression excluding the unrelated Homepage contract: **71/71 suites,
  442/442 tests passed**;
- full Jest: **71/72 suites and 451/452 tests passed**. The single failure is
  the unchanged `src/pages/marketing/HomePage.contract.test.js` expecting LF
  whitespace while the Windows-materialized `HomePageR4.css` is CRLF. No
  Homepage path is in this task and it was not edited;
- production build: passed; report-only JavaScript gzip total **611.76 kB**
  with a **164.93 kB** entry bundle;
- production dependency audit: passed with the two exact accepted RSC-only
  React Router advisory entries for the BrowserRouter SPA;
- NDS browser foundation matrix: **5/5** at 320, 390, 768, 1024, and 1440px,
  including reduced motion, focus, font delivery, 44px controls, layout
  shift, overflow, and Axe checks;
- Impeccable detector: `[]` for the changed CSS/config source. The broader
  exact-file scan reports one existing `overused-font` warning in the contract
  test's compatibility fixture; it is not a new page or runtime consumer;
- static CSS/Tailwind contract check, JavaScript syntax checks, and
  `git diff --check`: passed; and
- trailing-whitespace and NUL-byte checks across changed files: passed.

The source slice was committed, pushed, and merged as PR #276. No
documentation publication, consumer migration, deployment, readiness, or
go-live action is implied by that merge.
