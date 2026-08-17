# Candidate Niuva Frontend Consumer-Migration Matrix

**Status:** Candidate planning artifact — owner-approved sequencing; not
canonical, not source-migration authority, and not readiness evidence

**Date:** 17 August 2026

**Repository baseline:** `origin/main`
`5df75387b5ead07703cf162179d5fde7f47fdfb7`

**Related evidence:**

- [`2026-08-17-cross-surface-design-token-inventory.md`](../../audits/2026-08-17-cross-surface-design-token-inventory.md)
- [`2026-08-17-niuva-semantic-token-component-state-contract-review.md`](2026-08-17-niuva-semantic-token-component-state-contract-review.md)
- [`2026-08-17-niuva-semantic-token-foundation-contract-task-card.md`](../../plans/pending-reconciliation/2026-08-17-niuva-semantic-token-foundation-contract-task-card.md)
- [`DESIGN.md`](../../../../DESIGN.md)
- [`DEC-UX-004`](../../../decisions/experience/DEC-UX-004-cross-surface-design-system-reconstruction.md)

## 1. Purpose and boundary

This matrix turns the approved semantic-token and component-state direction
into a reviewable inventory for later consumer migration. It covers every
frontend route family, prototype, compatibility alias, shared component,
surface composition, and user flow without migrating any consumer now.

It is a planning map, not a design-system rewrite. The merged foundation in
PR #276 supplies semantic aliases and contract evidence; it did not authorize
a page redesign, a token-value rebrand, a component API change, or a route or
lifecycle change.

## 2. Current inventory boundary

The cross-surface audit records the following source measurements. They are
inventory evidence and must be refreshed against the current `origin/main`
before each implementation slice:

| Inventory | Recorded evidence | Migration implication |
| --- | ---: | --- |
| Concrete route declarations | 59 | Group by surface and owner; route visibility is never authorization. |
| Public compatibility aliases | 8 | Preserve one-hop compatibility ownership; do not treat aliases as new pages. |
| Top-level page domains | 6 | Keep Marketing, Auth, Retail, Admin, Operational, and Brand Lab registers distinct. |
| CSS custom-property definitions | 285 in the audit baseline | Reconcile through the CSS runtime; classify aliases before changing values. |
| Direct variable references in pages | 404 in the audit baseline | Page consumers are the largest migration surface; do not sweep globally. |
| Direct variable references in components | 33 in the audit baseline | Shared primitives can fan out through Tailwind and require build evidence. |

The measurements above predate the merged foundation commit. They are not
claims that any consumer is migrated or that a deprecated alias has zero
consumers.

## 3. Surface and route matrix

| Slice | Route/page family | Register and durable owner | Migration concern | Candidate order |
| --- | --- | --- | --- | ---: |
| Foundation | CSS runtime, Tailwind mappings, focus/motion contracts, shared primitive records | Foundation maintainer | Semantic role vocabulary, compatibility aliases, API continuity, reduced motion | Complete in PR #276 |
| Public/Marketing | `/`, `/en`, `/tentang`, `/en/about`, `/layanan`, `/en/services`, `/proyek`, `/en/projects`, `/kontak`, `/en/contact`, `/privasi`, `/en/privacy`, `/faq`, `/en/faq`, Public 404, Navbar, Footer, Layout | Brand register; Public content and Inquiry entry | B2B-primary narrative, four equal Services, factual evidence, ID/EN parity, no lifecycle authority in visual tokens | 1 — pilot after exact-file approval |
| B2B inquiry | Contact form, acknowledgement, recovery, optional visitor-clicked WhatsApp, Operations handoff | Inquiry lifecycle owner | Consent, persisted `new`, existing UUID, validation/dependency distinction, no public upload | Alongside Public only when form files are explicitly scoped |
| Auth/Account | `/login`, `/forgot-password`, `/forgot-password/check-email`, `/reset-password`, `/reset-password/success`, `/reset-password/error`, `/dashboard`, `/order`, `/orders/:id` | Product register; session and owned-resource owners | Identity, privacy, loading, expired, permission, conflict, recovery, customer-safe projection | 2 |
| Retail/Commerce | `/retail`, `/en/retail`, `/retail/products/:slug`, configurator, checkout, Order context | Product register; Retail Request/Offer/Order owners | Account gate, server-authoritative price/file/stock/fulfillment, `quote_required`, mixed-cart and payment boundaries | 3 |
| Operations/Admin | `/admin`, `/admin/orders`, catalog, materials, inventory, portfolio, content, contacts, inquiries, B2B, retail orders, users, customers, notifications, communication, settings | Product register; role-aware operational owners | Permission, lifecycle state, conflict/history, audit-safe density, no Public conversion motifs | 4 |
| Prototypes and compatibility | `/__brand-lab/*`, reserved `/proyek/:slug`, `/en/projects/:slug`, eight Public aliases, legacy fonts and token aliases | Evidence/provenance owners | Record only; preserve until explicit retirement or zero-consumer evidence | Cleanup after migrations |

The route list is source evidence. This matrix does not activate reserved
paths, change locale behavior, or promote Brand Lab prototypes.

## 4. Shared-component adoption matrix

Every component slice must use the NDS 13-field record and identify the
consumer set before changing a token or API.

| Component group | Current classification | Required migration evidence |
| --- | --- | --- |
| Button, Input, Textarea, Label, FormField, Select, Switch, Tabs | Compatibility/adopted baseline | Preserve props, keyboard/focus, disabled/loading/error states, localization, and surface restrictions. |
| Dialog, AlertDialog, Alert, Skeleton, EmptyState, ErrorState, OperationalState | Compatibility/adopted baseline | Preserve visible critical feedback, recovery action, focus return, and hierarchy-preserving loading. |
| SurfacePanel and SurfacePanelHeader | Adopted where task grouping is meaningful | Confirm flat-first elevation and avoid forcing Public editorial sections into task panels. |
| Status badges and state presentations | Domain-owned compatibility | Map presentation roles without renaming Inquiry, Retail, Order, Offer, or Operations lifecycles. |
| TechnicalLabel | Restricted/adopted only for genuine technical metadata | No decorative monospace or fake telemetry; verify content and accessibility. |
| StatCard | Provisional | No migration until its use case, state contract, and anti-template treatment are approved. |
| Drawer | Quarantined | No adoption until the undeclared `vaul` boundary receives a separate decision. |
| Brand Lab and historical prototypes | Prototype evidence | Do not migrate or delete; retain provenance and classify consumers. |

## 5. Token and compatibility migration map

The only permitted dependency direction is:

```text
global values
  -> core semantic aliases
  -> surface aliases
  -> justified component tokens
  -> shared UI contracts
  -> surface/domain compositions
  -> route pages
```

Each future slice must record:

1. exact source and test paths;
2. token names and current values before the change;
3. replacement semantic role and surface register;
4. direct, Tailwind-generated, and CSS-indirect consumers;
5. state and accessibility impact;
6. Indonesian/English long-content impact where visible;
7. zero-consumer or compatibility-window evidence for any deprecated role;
8. rollback action and retained aliases; and
9. owner, verification result, and unresolved follow-up.

No token family may be removed merely because its name is old. No new
consumer may adopt a deprecated alias. Token value changes, font-role changes,
component API changes, or lifecycle implications require their own amendment
or exact-file task.

## 6. User-flow and state matrix

Token and component treatment must preserve the durable flow, authoritative
resource, visible state, and safe recovery below.

| Flow | Authoritative boundary | Required state evidence |
| --- | --- | --- |
| Public → B2B Inquiry | Inquiry persists as `new` before optional WhatsApp | Default, validation, dependency failure, uncertain, success with existing UUID, focus recovery, consent and no-upload boundary |
| Retail direct | Server revalidates publication, configuration, price, stock, file, ETA, fulfillment, and eligibility | Account gate, loading, stale/conflict, permission, unavailable, success only after authority |
| Retail `quote_required` | No Order, reservation, payment attempt, paid state, or checkout total | Context retention, reason/status, stable request reference, safe next action, mixed-cart separation |
| Customer-owned records | Session and owned resources | Loading, empty, permission, expired, conflict, offline, recovery, success without internal data |
| Operations queues | Role-aware domain transitions | Queue identity, validation, conflict/history, permission, recovery, audit-safe presentation |
| Cross-surface locale | Stored preference and exact route ownership | Complete ID/EN copy, counterpart context, no invented private `/en` routes |

Presentation labels such as `loading`, `submitting`, `validating`, and
`quote_required` remain view terms. They must not become backend lifecycle
enums through a visual migration.

## 7. Recommended first consumer slice

The canonical migration order remains foundation, Homepage R4 Public pilot,
Auth/Account, remaining Public routes, Retail/Customer, then Admin/CMS.

The first consumer slice should therefore be a bounded Public/Marketing pilot,
excluding unresolved FDM-specific authority and excluding any route or content
change. Its exact files are **not selected by this matrix**. A separate task
card must choose one stable shared primitive or Public composition boundary,
name its consumers, and define rollback before source edits begin.

The FDM contour retirement candidate in PR #274 is not canonical promotion;
`DEC-UX-004` and `DESIGN.md` still contain the current FDM target. A Public
migration must preserve that authority until a separate canonical amendment
is approved.

## 8. Slice readiness gate

No consumer migration is implementation-ready until the owner reviews an
exact-file task card containing:

- selected surface and route responsibility;
- exact source, test, and documentation paths;
- before/after token map and consumer counts;
- preserved component props and state contracts;
- lifecycle, route, privacy, and provider exclusions;
- responsive, accessibility, localization, and reduced-motion checks;
- Impeccable detector and screenshot/browser evidence plan;
- rollback and compatibility window; and
- separate staging, commit, push, PR, CI/thread, merge, deployment, and
  readiness gates.

## 9. Explicit exclusions

This matrix does not authorize:

- token-value rebrand, font installation/removal, dark mode, or new token
  runtime;
- page redesign or route/locale/redirect/CMS changes;
- component API breaks, dependency adoption, or prototype/alias deletion;
- API, schema, provider, upload, payment, fulfillment, permission, or
  lifecycle changes;
- `PRODUCT.md` refresh; or
- staging, commit, push, PR, merge, deployment, readiness, or go-live.

The next documentation gate is publication of this matrix together with the
candidate contract review and foundation task card. Source migration remains
blocked until its own exact-file task card is approved.
