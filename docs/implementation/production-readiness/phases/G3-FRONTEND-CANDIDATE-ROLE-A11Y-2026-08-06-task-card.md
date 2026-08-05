# G3 — Frontend Candidate, Role, and Accessibility Evidence

<!-- markdownlint-disable MD013 -->

**Status:** Proposed child task card; candidate evidence is not production
approval
**Planning baseline:** `origin/main` observed at
`7810a38ef00d2076bf651ca07502c8b15d9d6590`; the driver must fetch again before
creating its implementation worktree
**Owner:** Frontend/product owner to assign
**Independent verifier:** Independent accessibility and release reviewer to
assign

## Objective

Revalidate the unified public, authentication, customer, B2B, Admin, and
bounded Retail discovery surfaces against the approved route, role/data,
responsive, accessibility, deep-link, loading, error, and empty-state
contracts. Produce exact-SHA browser and test evidence. Do not turn a visual or
route improvement into an unapproved lifecycle, pricing, payment, storage, or
role decision.

This card does not authorize new Retail transactions, checkout, payment,
upload, storage activation, provider selection, migration, deployment,
production-readiness approval, or go-live.

## Authority and applicable context

Read in this order before any work:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. `docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md`
5. `docs/decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md`
6. `docs/decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md`
7. `docs/decisions/product/DEC-RT-02-retail-account-required-checkout.md`
8. Applicable rollout/handover runbook, then current frontend source and tests

The G0 candidate scope remains provider-neutral and read-only for Retail
discovery. It does not authorize a broader journey.

## Exact path ownership

The child task may inspect these paths and may change them only after the
explicit source gate is recorded:

- `frontend/src/App.js` — serial integration path owned by G3;
- `frontend/src/pages/**`, excluding `frontend/src/pages/auth/**`;
- `frontend/src/components/**`, excluding `frontend/src/components/auth/**`;
- `frontend/src/context/**`, excluding `frontend/src/context/AuthContext.jsx`
  and its tests;
- `frontend/src/lib/**`, excluding shared API contract changes unless they are
  separately assigned;
- specifically related `frontend/src/**/*.test.*` and contract tests,
  excluding the G2 auth-owned tests;
- `frontend/e2e/**` only when the task explicitly owns the browser evidence.

Do not modify `docs/implementation/production-readiness/DECISIONS_REQUIRED.md`
or backend G1/G2 paths. Do not modify this card from the implementation chat.

## Intentionally unchanged and excluded

- backend API envelopes, roles, authorization queries, pricing, order
  lifecycle, payment, storage, fulfillment, and notification semantics;
- G2-owned auth context, auth components, auth pages, and auth tests;
- provider activation, uploads, checkout, tax, shipping, reservation,
  migration, secrets, deployment, and environment state;
- package manifests, lockfiles, CI workflows, and global configuration unless
  a separate serial assignment names the exact path;
- detailed Retail/B2B navigation or routes that remain deferred by authority.

## Dependencies and parallel rules

- Discovery can run in parallel with G1 and G2.
- G3 implementation that consumes changed backend/auth contracts waits for the
  relevant merged PR and refreshes from the new `origin/main` SHA.
- `App.js`, shared API transport, shared auth context, role mapping, and route
  contracts are serial paths; never resolve a conflict by silently changing
  backend semantics in the frontend.
- G5 consumes browser and role evidence only when its credentials, verifier,
  and exact SHA are recorded.

## Acceptance criteria

- Produce a surface/route matrix covering public, auth, customer, B2B, Admin,
  and bounded Retail discovery behavior.
- Record role visibility, customer/internal data projection, loading/error/
  empty states, keyboard/focus behavior, responsive behavior, deep links, and
  known unverified human screen-reader gaps.
- Keep Retail transaction-inactive boundaries visible and truthful.
- If a source gate is granted, make only bounded frontend changes inside the
  path lock and add proportional tests; do not invent product or role policy.
- Record bundle/build, accessibility, browser, rollback, and release-artifact
  impact.

## Minimum verification

- `npm test -- --watchAll=false` from `frontend` for owned frontend tests.
- `npm run build` from `frontend` when source changes.
- Run the specifically owned hermetic Playwright contracts and report the exact
  browser configuration; external role/credential testing remains separate.
- Run bundle checks when the changed surface affects shipped assets.
- Run `git diff --check`, exact-path verification, and a staged secret scan
  before any commit.

## Handover and stop conditions

The handover must list the exact SHA, changed and intentionally unchanged
paths, role/data/accessibility evidence, passed/unrun checks, browser limits,
risks, rollback, open decisions, and external approvals. Stop before checkout,
payment, storage, provider, migration, deployment, readiness, or go-live
actions.

Commit, push, and opening a PR are allowed for an approved bounded slice.
Merge remains user-controlled.

<!-- markdownlint-enable MD013 -->
