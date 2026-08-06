# Customer Portal Design-System Convergence Task Card

Status: **Customer Portal implementation evidence integrated through PR #137;
original slice branch was not separately published**

## Identity and baseline

- **Requester / delegated Product and Technical Owner:** Faiz
- **Driver:** Codex in an isolated Customer Portal worktree
- **Reviewer / verifier:** Faiz with automated and browser evidence;
  independent design/security review is not claimed
- **Branch:** `frontend/customer-portal-design-system-convergence`
- **Selected baseline:** `origin/main` at
  `5dd611297f8db5db03872d10b605536e2da462cf`
- **Date:** 5 August 2026, Asia/Jakarta
- **Commit/push/PR permitted?:** No. Local source, tests, screenshots, and
  handover evidence only.

## Objective

Converge the existing authenticated Customer Portal into the current Niuva
design system: calm hierarchy, customer-safe status and history, clear next
actions, responsive order history, and a task-focused operational shell. Keep
the retained legacy Order surface read-only and do not imply that new Retail
checkout, payment, fulfilment, or production tracking is active.

## Authority

- `docs/NIUVA_MASTER_SPEC.md`, especially sections 8, 9, and 13
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- `docs/decisions/access/DEC-ACCESS-003-legacy-order-compatibility-and-customer-projection.md`
- `docs/decisions/product/DEC-PAY-02-legacy-manual-transfer-read-only.md`
- `docs/decisions/product/DEC-ETA-01-retail-eta-and-customer-milestone-policy.md`
  as a boundary for future Retail tracking, not authority to activate it here
- `DESIGN.md`
- The active goal instruction to retain the current UI libraries and converge
  the frontend in isolated surface slices

## Audit findings addressed

- `OrderDetail` uses pseudo-terminal labels, decorative monospace, square
  nested boxes, a zig-zag timeline, and page-local button styling.
- `ClientDashboard` still presents a decorative system-active signal and uses a
  desktop-width table without a deliberate mobile order-list composition.
- Operational routes retain the public marketing navigation, while the mobile
  operational menu lacks a logout action.
- Order-detail read failures silently redirect to the dashboard instead of
  presenting a recoverable, customer-safe state.
- The compatibility new-order destination uses a warning box rather than a
  clear informational handoff to the approved Retail discovery route.
- The shared legacy status stepper uses decorative technical typography and
  non-semantic radius utilities.

## In scope

- Refine `OperationalLayout` and operational Navbar behavior so authenticated
  work stays task-focused, keyboard reachable, and able to sign out on mobile.
- Recompose the order dashboard with one meaningful history surface, a mobile
  order list, semantic loading/error/empty states, and factual legacy notice.
- Recompose legacy order detail into clear status, specification, estimate,
  payment-history, and chronological history regions using current primitives.
- Replace decorative status-stepper styling while preserving the existing
  legacy status vocabulary and shared `StatusBadge` API.
- Refine `/order` as a read-only compatibility handoff; no command is restored.
- Add Indonesian and English copy only for the changed customer-facing states.
- Add focused component, route-contract, responsive-structure, and state tests.
- Capture desktop/mobile screenshots, keyboard/focus evidence, console review,
  and automated accessibility evidence with synthetic data only.

## Affected files

- `docs/implementation/plans/pending-reconciliation/2026-08-05-customer-portal-design-system-convergence-task-card.md`
- `frontend/src/components/layout/Layout.jsx`
- `frontend/src/components/layout/Layout.test.jsx`
- `frontend/src/components/layout/Navbar.jsx`
- `frontend/src/components/layout/Navbar.test.jsx`
- `frontend/src/components/operational/StatusStepper.jsx`
- `frontend/src/components/operational/StatusStepper.test.jsx`
- `frontend/src/pages/operational/ClientDashboard.jsx`
- `frontend/src/pages/operational/ClientDashboard.test.jsx`
- `frontend/src/pages/operational/NewOrder.jsx`
- `frontend/src/pages/operational/NewOrder.test.jsx`
- `frontend/src/pages/operational/OrderDetail.jsx`
- `frontend/src/pages/operational/OrderDetail.test.jsx`
- `frontend/src/pages/operational/customer-portal-surface.contract.test.js`
- `frontend/src/i18n.js`
- Customer-Portal-only browser evidence under `output/playwright/`

`docs/context/DOCUMENT_REGISTER.md` remains unchanged in this worktree to avoid
a same-file conflict with the isolated foundation slice. Registration belongs
to a later explicitly authorized integration step.

## Explicit exclusions

- No backend, API path, response projection, ownership rule, route definition,
  schema, storage, file, payment, milestone, ETA, notification, or order-state
  mutation.
- No new Retail Order, checkout, payment attempt, upload, proof submission,
  fulfilment, cancellation, refund, return, or support capability.
- No attempt to apply the activation-gated `DEC-ETA-01` state machine to the
  retained legacy Order aggregate.
- No Admin Studio page, Retail catalog/product, Auth, or public-page redesign.
- No new dependency, token value, Tailwind configuration, secret, provider,
  database, migration, deployment, production-readiness, or go-live change.
- No commit, push, PR, merge, or modification of another worktree.

## Acceptance criteria

1. Operational navigation does not render the public marketing link row on
   Customer Portal routes; desktop and mobile retain account home, language,
   site-return, and logout access.
2. Operational layout exposes a working skip link and one identifiable main
   content target.
3. Dashboard orders remain loaded from `GET /orders`, preserve safe error and
   retry behavior, and provide distinct desktop table and mobile list markup.
4. Detail remains loaded from `GET /orders/:id`; file download remains
   `GET /orders/:id/design-file`; no mutation control is introduced.
5. Detail load failure is generic and recoverable without exposing internal
   diagnostics or falsely showing an empty account.
6. Legacy status, estimate, payment history, and status history remain factual;
   no percentage, fake telemetry, guarantee, or activated payment instruction
   is introduced.
7. Migrated portal presentation contains no `font-mono-tech`, terminal icon,
   simulated command copy, arbitrary radius, or repeated nested card styling.
   Monospace, if retained, is limited to genuine order/file identifiers.
8. Focused tests, full frontend regression evidence, production build, bundle
   measurement, responsive screenshots, keyboard/focus review, and automated
   accessibility checks are recorded.

## Rollback

Before publication, remove or revert only the listed Customer Portal paths in
this worktree. There is no data, backend, dependency, or environment rollback
because this slice changes frontend presentation, local state handling, copy,
and tests only.

## Implementation outcome

- Operational desktop navigation now omits the marketing link row and exposes
  the current workspace, language, and logout actions. The mobile dialog exposes
  the workspace, main-site return, language, and logout actions and initially
  focuses the first workspace control.
- `OperationalLayout` now provides a keyboard-reachable skip link and one
  focusable `main-content` target.
- The dashboard now uses a page-level hierarchy plus one meaningful history
  surface, with a semantic legacy/read-only notice and separate desktop-table
  and mobile-list structures.
- Order detail now uses semantic panels for factual progress, safe file and
  material details, historical estimate/payment state, and a single-column
  chronological history. Decorative terminal copy, the zig-zag timeline, and
  nested micro-cards were removed.
- Detail read failures remain on the route as a generic retryable state instead
  of silently redirecting or exposing diagnostics.
- Customer rendering no longer attempts to display ambiguous `order.notes` or
  `estimate.note` fields that are absent from the approved customer projection.
- The legacy `/order` bookmark remains informational and command-free, with
  clear routes to the Retail catalog and customer order history.
- The shared status presentation keeps its existing status API and lifecycle
  vocabulary while replacing technical decoration with semantic state
  structure. A contrast defect found in browser review was corrected by using
  high-contrast text with state-colored borders and backgrounds.

## Verification evidence

- Focused Customer Portal checks: **7/7 suites, 19/19 tests passed**.
- Full frontend regression: **48/49 suites and 288/289 tests passed**. The only
  failure is the pre-existing indentation-sensitive string assertion at
  `src/pages/admin/cms-lifecycle.contract.test.js:83`; the failing source is
  outside this Customer Portal scope.
- Production build: **passed**. Sitemap generation was skipped because
  `REACT_APP_PUBLIC_SITE_URL` is not configured.
- Bundle measurement, report-only: **571.80 kB total gzip**, **200.21 kB largest
  entry**, and **100.10 kB largest async asset**.
- Bundle gate: **not evaluated** because `BUNDLE_TOTAL_GZIP_BUDGET`,
  `BUNDLE_ENTRY_GZIP_BUDGET`, and `BUNDLE_ASYNC_GZIP_BUDGET` are not configured.
  This is not recorded as a size pass.
- Browser accessibility checks reported **zero WCAG A/AA violations** on the
  dashboard, order detail at desktop and mobile widths, and the compatibility
  new-order route after the contrast fix.
- Dashboard keyboard order was verified as skip link, logo/site return,
  language, customer workspace, logout, Retail catalog, and order detail.
- Opening the mobile menu moved focus to `Pesanan saya`; Escape returned control
  to the menu button through the existing dialog behavior.
- Browser console review with synthetic customer/order responses reported no
  errors. No real customer, credential, order, file, or payment data was used.
- Responsive evidence is retained locally under `output/playwright/` as:
  `customer-dashboard-desktop.png`, `customer-dashboard-mobile.png`,
  `customer-dashboard-mobile-menu.png`, `customer-order-detail-desktop.png`,
  `customer-order-detail-mobile.png`, and
  `customer-order-compatibility-mobile.png`.
- The task-card markdown check and `git diff --check` passed after the final
  source change.

## Handover

- Intentionally unchanged: backend, response projection, ownership rules, API
  paths, route definitions, dependencies, tokens, Tailwind configuration,
  Retail lifecycle, Admin pages, Auth pages, and public pages.
- Remaining repository-wide issue: the unrelated CMS lifecycle contract test
  must be handled in its owning slice or cleanup pass; it does not invalidate
  the focused Customer Portal result.
- External action still gated: no commit, push, PR, merge, deployment, or
  production action has been performed.

## Post-merge reconciliation — 5 August 2026

This task card predates Git publication. Its task-card record and integrated
Customer Portal scope were included in PR #137, now merged into `origin/main` at
`18f51dee8a8ddf83e438de2f2f0e3acccbc5b8c1`. The original slice branch was not
published as a separate PR; the current publication and verification record is
the [integration task card](2026-08-05-frontend-design-system-integration-task-card.md).

The original local handover statements above remain historical evidence for the
pre-merge worktree. They do not describe the current merged-source state.
