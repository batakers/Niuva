# Phase 6 `PENDING_G3` self-review

**Status:** Candidate self-review — all open Phase 6 rows reconciled at the
selected baseline; no new runtime source change is authorized by this record

**Date:** 19 August 2026

**Baseline:** `origin/main` at
`74967a33abc6537bdd4a5c0eaec826ad251b8d91`

**Purpose:** Review every `PENDING_G3` row from the Phase 6 closure ledger one
at a time, name the exact source/test evidence, and choose the smallest safe
outcome. This is not permission to invent a backend lifecycle, provider,
content authority, route, or business rule.

## Review rule

Each row was checked against the canonical authority, the current route and
component inventory, and the source/tests at the selected SHA. The result is
one of:

- `DELIVERED_BOUNDED`: the active source and contract evidence already satisfy
  the bounded frontend migration; no speculative G4 diff is warranted;
- `DEFERRED_WITH_OWNER_REASON`: the remaining work needs a separately owned
  domain/content/provider decision or lacks two same-purpose consumers; and
- `CONTRACT_ONLY_INACTIVE`: the capability is intentionally not active and
  must not be presented as automation.

No row is closed merely because a file exists or a test is green. A deferred
row remains visible in the closure ledger with its reason and next authority
gate.

## Route-family reviews

<!-- markdownlint-disable MD013 -->

| Row | Exact source/test evidence reviewed | G3 result | G4/closure disposition |
| --- | --- | --- | --- |
| Public About and Services ID/EN | `frontend/src/App.js`; `frontend/src/pages/marketing/AboutPage.jsx`; `frontend/src/pages/marketing/CapabilitiesPage.jsx`; `frontend/src/pages/marketing/CapabilitiesPage.states.test.jsx`; `frontend/src/lib/publicRoutes.js`; `frontend/src/lib/publicRoutes.test.js`; `frontend/src/components/layout/Layout.jsx` | `PASS` — canonical ID/EN pairs, four equal service registry, loading/empty/error/invalid states, and Indonesian fallback metadata are already explicit | `DELIVERED_BOUNDED`; the current source is already a bounded Public implementation. English routes intentionally remain `noindex,follow` fallback until approved translated content is supplied. |
| Projects ID/EN archive | `frontend/src/App.js`; `frontend/src/pages/marketing/ProjectsPage.jsx`; `frontend/src/pages/marketing/ProjectsPage.test.jsx`; `frontend/src/lib/publicRoutes.js`; `frontend/src/lib/publicRoutes.test.js`; `frontend/src/pages/marketing/PublicContentInvalidState.test.jsx` | `PASS` — schema validation, loading/error/invalid/empty recovery, factual project fallback, and reserved detail-route boundary are present | `DELIVERED_BOUNDED`; no project-detail route, CMS owner, or unverified evidence is activated. |
| Staff login and invitation acceptance | `frontend/src/pages/admin/AdminLogin.jsx`; `frontend/src/pages/auth/StaffInvitationAccept.jsx`; `frontend/src/pages/auth/StaffInvitationAccept.test.jsx`; `frontend/src/pages/auth/auth-surface.contract.test.js`; `frontend/src/components/auth/ProtectedRoute.jsx`; `frontend/src/components/auth/ProtectedRoute.test.jsx`; `frontend/src/components/auth/AuthShell.test.jsx`; merged PR [#310](https://github.com/batakers/Niuva/pull/310) | `PASS WITH HOLD` — staff/customer audiences, safe return, localization, and bounded handoff are now represented in the merged frontend slice; invitation validity/identity remains backend-owned and the private invitation surface is not a new provider or role activation | `DELIVERED_BOUNDED` on the frontend axis; `DEFERRED` capability with `DEFERRED_WITH_OWNER_REASON` legacy disposition. Invitation API, identity, and staff lifecycle remain separately owned. |
| Operations Quotes and B2B Projects | `frontend/src/pages/admin/B2BList.jsx`; `frontend/src/pages/admin/B2BDetail.jsx`; `frontend/src/pages/admin/QuoteRevisionEditor.jsx`; `frontend/src/pages/admin/b2b-workbench.contract.test.js`; `frontend/src/pages/admin/QuoteRevisionEditor.test.jsx`; `frontend/src/lib/b2bPagination.js` | `PASS WITH HOLD` — current presentation separates Inquiry, Quote, and Project records and preserves resource-specific status adapters | `DEFERRED_WITH_OWNER_REASON`; Quote/Project lifecycle transitions, revision authority, and permission/API truth require a separately approved Operations G4. |
| Operations Retail Orders and after-sales | `frontend/src/pages/admin/B2BList.jsx`; `frontend/src/pages/admin/RetailOrderDetail.jsx`; `frontend/src/pages/admin/Orders.jsx`; `frontend/src/pages/admin/retail-order.contract.test.js`; `frontend/src/components/admin/RetailOrderStatusBadge.jsx`; `docs/decisions/product/DEC-AFTER-01*` | `PASS WITH HOLD` — existing UI is an owned presentation boundary and does not create orders or payment effects | `DEFERRED_WITH_OWNER_REASON`; payment, refund, reprint, fulfillment, and after-sales authority remain domain/provider gates. |
| Operations catalog, materials, inventory, work orders | `frontend/src/pages/admin/Catalog.jsx`; `frontend/src/pages/admin/Materials.jsx`; `frontend/src/pages/admin/Inventory.jsx`; `frontend/src/pages/admin/ProjectWorkOrders.jsx`; `frontend/src/pages/admin/Inventory.jsx`; `frontend/src/pages/admin/inventory-select-render.test.jsx`; `frontend/src/pages/admin/work-order.contract.test.js`; `frontend/src/pages/admin/stock-deep-links.contract.test.js` | `PASS WITH HOLD` — current source has explicit loading/empty/error states, domain labels, and permission-bound pages | `DEFERRED_WITH_OWNER_REASON`; product, stock, production, and work-order transitions remain domain-owned and are not redefined by a visual migration. |
| Operations publishing/CMS | `frontend/src/pages/admin/ContentEditor.jsx`; `frontend/src/pages/admin/PortfolioAdmin.jsx`; `frontend/src/pages/admin/PortfolioDetail.jsx`; `frontend/src/pages/admin/cms-lifecycle.contract.test.js`; `frontend/src/pages/admin/portfolio-lifecycle.contract.test.js`; `frontend/src/lib/content.js` | `PASS WITH HOLD` — draft/review/publish/archive presentation is kept separate from Public evidence claims | `DEFERRED_WITH_OWNER_REASON`; content owner, locale completeness, version, publish, rollback, and asset provenance require a dedicated CMS authority review. |
| Operations governance, settings, notifications | `frontend/src/pages/admin/Settings.jsx`; `frontend/src/pages/admin/Users.jsx`; `frontend/src/pages/admin/Notifications.jsx`; `frontend/src/pages/admin/NotificationFeed.jsx`; `frontend/src/pages/admin/settings-profile.contract.test.js`; `frontend/src/pages/admin/notification-feed.contract.test.js`; `frontend/src/pages/admin/admin-studio-convergence.contract.test.js` | `PASS WITH HOLD` — current utility pages use role-aware presentation and visible empty/error states | `DEFERRED_WITH_OWNER_REASON`; recipient scope, notification policy, and provider delivery remain separately gated. |
| Operations work home/grid | `frontend/src/pages/admin/AdminDashboard.jsx`; `frontend/src/pages/admin/AdminDashboard.test.jsx`; `frontend/src/pages/admin/AdminDashboard.contract.test.js`; `frontend/src/pages/admin/dashboard-charts.contract.test.js`; `.design/niuva-frontend-blueprint/visual-studies/operations/WORK_HOME_GRID_COMPARISON.md` | `PASS` — work home is a role-aware dashboard with a narrow-screen alternative; the bento study is explicitly LOCAL | `DELIVERED_BOUNDED`; no bento/grid token or Public composition is promoted. |

<!-- markdownlint-enable MD013 -->

## Shared foundation reviews

<!-- markdownlint-disable MD013 -->

| Foundation row | Exact evidence | G3 result | Closure disposition |
| --- | --- | --- | --- |
| Runtime semantic token bridge | `frontend/src/index.css`; `frontend/tailwind.config.js`; `frontend/src/components/ui/design-system-foundation.contract.test.js`; `frontend/src/components/ui/nds-foundation-primitives.test.jsx`; `frontend/src/components/ui/motion-accessibility.contract.test.js`; merged PR [#276](https://github.com/batakers/Niuva/pull/276) | `PASS` — value-preserving semantic aliases, fallback mapping, motion/focus roles, and multiple real consumers are already merged | `DELIVERED_BOUNDED`; do not manufacture a duplicate token rewrite. |
| Shared action/form compatibility | `frontend/src/components/ui/button.jsx`; `label.jsx`; `input.jsx`; `textarea.jsx`; `form-field.jsx`; `select.jsx`; `switch.jsx`; `frontend/src/components/ui/nds-foundation-primitives.test.jsx`; `frontend/src/components/ui/design-system-foundation.contract.test.js`; current Auth, Retail, Public, and Admin consumers | `PASS` — API continuity and more than two same-purpose consumers exist across surfaces; lifecycle meaning remains page-owned | `DELIVERED_BOUNDED`; future API changes need a new exact-file card. |
| Shared feedback/state compatibility | `frontend/src/components/ui/dialog.jsx`; `alert.jsx`; `skeleton.jsx`; `empty-state.jsx`; `error-state.jsx`; `operational-state.jsx`; `surface-panel.jsx`; `frontend/src/components/ui/operational-state.test.jsx`; `frontend/src/components/ui/design-system-foundation.contract.test.js`; current Auth, Retail, Customer, and Operations consumers | `PASS` — critical visible states, retry paths, focus/motion contracts, and resource adapters are present | `DELIVERED_BOUNDED`; shared presentation does not own Inquiry, Order, Quote, Project, or Work Order lifecycle. |
| Collection/status mechanics | `frontend/src/components/ui/responsive-table.jsx`; `frontend/src/components/ui/table.jsx`; `frontend/src/components/admin/LifecycleStatusBadge.test.jsx`; `frontend/src/components/admin/{B2BStatusBadge,PortfolioStatusBadge,RetailOrderStatusBadge,WorkOrderStatusBadge}.jsx`; `frontend/src/pages/admin/b2b-workbench.contract.test.js`; current domain table/filter consumers | `PASS WITH HOLD` — domain tables and status adapters have real consumers, but `ResponsiveTable` itself has zero runtime consumers and cannot be promoted on existence | `DEFERRED_WITH_OWNER_REASON`; retain domain-owned collections and status adapters until a named second same-purpose consumer and complete mobile interaction contract exist. |

<!-- markdownlint-enable MD013 -->

## Self-review and stop conditions

Post-merge update: Staff login and invitation frontend evidence now includes
merged PR #310 at the current baseline. This changes only the frontend axis;
it does not activate staff invitation capability or alter the backend contract.

- Every `PENDING_G3` row from the closure ledger is reviewed exactly once.
- No source, route, dependency, API, schema, provider, lifecycle, permission,
  payment, upload, content, or business-rule change is implied by this file.
- Deferred rows are not hidden: each has an owner/domain reason and an exact
  future gate.
- Privacy remains `HOLD_LEGAL_CONTENT` and is not substituted with generated
  copy.
- Compatibility aliases, reserved project-detail paths, and Brand Lab
  prototypes remain inventory-only.
- Phase 7 remains frozen until the updated closure ledger records no unresolved
  `PENDING_G3` status and the final owner closure review is recorded.

**Self-review result:** Pass for the selected baseline. The safe next step is
to publish this review together with an updated closure ledger; no speculative
runtime migration is justified by the current evidence.
