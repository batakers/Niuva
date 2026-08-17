# Cross-Surface Frontend Design-System, Route, Flow, State, Component, and Token Audit — Task Card

**Status:** Owner-approved planning direction — documentation-only inventory
pending; no source migration or implementation authority

**Date:** 17 August 2026

**Baseline:** `origin/main`
`2a8b50050b1545eeebfaa50d61e94ed7b58e40ef`

**Owner decisions:** The inventory covers every active Frontend route, public
compatibility alias, prototype route, shared component, surface composition,
and user flow. Prototypes and aliases are recorded only; they are not migrated
by this audit. Semantic tokens and component/state contracts must be agreed
before any later page-source migration. Design direction remains iteratable
through bounded, versioned slices.

## 1. Objective

Create an evidence-bound inventory of the current Frontend route topology,
surface boundaries, user flows, states, shared components, design tokens, and
their consumers so Niuva can define compatible contracts without forcing a
large visual rewrite.

The audit must distinguish the Public/marketing Brand register from the
Retail, Auth, Customer, and Admin/Product register. Shared primitives do not
merge lifecycle or domain ownership, and UI state terms do not become domain
state-machine authority.

## 2. Authority and references

Read in this order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. applicable UX, Retail, Auth, Customer, and Operations decisions;
5. `DESIGN.md` and the active public brand guardrail where applicable;
6. current token definitions, components, source, and tests.

Impeccable remains the primary quality workflow for later UI implementation.
This audit is read-only and does not authorize a design rewrite.

## 3. Scope boundary

| Area | Included in the inventory | Treatment in this task |
| --- | --- | --- |
| Routes and locale | All active `<Route>` entries, localized Public pairs, private/customer/admin routes, wildcard 404, reserved paths, and the eight Public compatibility aliases | Record path, owner, surface, auth boundary, locale, state, source/test evidence; do not activate or rename routes. |
| Public and B2B | Homepage, About, Services, Projects, Contact, Privacy, FAQ, 404, Public Navbar/Footer/Layout, inquiry entry and its visible states | Distinguish Brand composition from Inquiry lifecycle and evidence truth. |
| Retail and Customer | Catalog, product/configurator, account gate, upload boundary, `quote_required`, mixed cart, checkout, Order/Request/Offer views, dashboard and tracking | Preserve Retail and B2B lifecycles; do not change pricing, payment, storage, or provider behavior. |
| Auth and Operations | Customer/Admin login, recovery, reset, staff invitation, Admin/CMS queues, permissions, conflict, history, and recovery | Keep Customer and staff trust surfaces separate; record permission and state contracts. |
| Shared foundations | Tokens, fonts, Tailwind mapping, UI primitives, layout, brand, forms, dialogs, state/recovery components, status badges, focus, motion, i18n, and route metadata | Record adoption/API/state contracts and consumers; no component API or dependency change. |
| Prototypes and aliases | Brand Lab/prototype routes, historical evidence, deprecated token/font aliases, quarantined components, and compatibility paths | Inventory and classify only; no migration, deletion, activation, or canonical promotion. |

### 3.1 User-flow coverage

The audit records entry, actor, durable lifecycle owner, authoritative state,
view state, primary action, validation, loading, empty, error, conflict/stale,
expired, offline/unavailable, uncertain, recovery, success, permission, and
localization behavior for at least these flows:

- Public discovery → service/evidence decision → B2B Inquiry persistence →
  existing UUID acknowledgement → optional user-clicked WhatsApp;
- Retail discovery → non-authoritative configuration → account gate → file and
  price/eligibility revalidation → direct checkout or `quote_required` context
  handoff → Request/Offer/Order-owned next action;
- Customer and Admin authentication → session/recovery/expiry/forbidden
  handling → owned resource or authorized queue;
- Customer Order/Request/Offer review → stale/conflict/retry-safe action; and
- Operations queue → permission → lifecycle transition → audit/history and
  recovery.

## 4. Inventory fields

### 4.1 Route and surface record

For every route or alias, record path/template, locale, route owner, surface,
authentication boundary, canonical/alias/reserved/prototype status, linked
component/page, visible states, source/test evidence, and prohibited implied
capability.

### 4.2 User-flow and state record

For every flow, record actor, durable lifecycle owner, authoritative resource,
view-state mapping, allowed action, validation, persistence/dependency boundary,
recovery and uncertain outcome behavior, permission/privacy rule, i18n needs,
and evidence status. A UI label such as `loading`, `submitting`, or
`quote_required` must not be promoted into a backend enum.

### 4.3 Component and composition record

For every adopted, provisional, quarantined, or proposed component, record the
NDS minimum contract:

1. name, purpose, owner, and adoption status;
2. when to use and not use;
3. anatomy and required/optional elements;
4. variants, sizes, and content limits;
5. props/API continuity or breaking change;
6. applicable interaction and data states;
7. mouse, keyboard, touch, focus, and screen-reader behavior;
8. responsive and overflow behavior;
9. token dependencies;
10. localization and long-content behavior;
11. surface/domain restrictions;
12. anti-patterns; and
13. migration/deprecation notes.

For every token or compatibility alias, record:

1. name and source file;
2. raw value and semantic role;
3. consuming files/components and surface/domain;
4. typography, color, spacing, shape, elevation, motion, focus, or state
   category;
5. contrast/accessibility evidence where applicable;
6. localization and long-content implications;
7. duplicate, stale, deprecated, or hardcoded substitutes;
8. dependency and browser/runtime impact;
9. proposed canonical role, compatibility alias, or retirement status; and
10. owner, decision reference, verification evidence, and rollback note.

## 5. Required decisions before migration

- semantic role vocabulary and naming convention;
- Public Brand versus Product register boundaries;
- typography roles and approved fallback behavior;
- surface, text, action, status, focus, border, and overlay roles;
- spacing, radius, elevation, and motion scales;
- reduced-motion behavior per interaction contract;
- compatibility/deprecation window for existing consumers; and
- migration order, test evidence, and rollback strategy per surface.

No token value is changed by this audit. No new dependency, font, palette,
dark mode, component, route, provider, or business rule is introduced.

## 6. Anti-slop and governance checks

The audit must flag, rather than silently normalize:

- generic SaaS blue-grey or luxury palette substitutions;
- duplicated card, border, eyebrow, or decorative-rule patterns;
- token names that imply lifecycle authority;
- Public tokens leaking into Retail/Auth/Customer/Admin surfaces;
- Product tokens being used as Public brand expression without rationale;
- raw color/spacing/motion literals where a semantic role exists; and
- deprecated Poppins/Inter or other compatibility consumers without migration
  evidence.

## 7. Deliverables

- route and surface inventory for all active, private, prototype, reserved,
  and compatibility paths;
- user-flow and cross-surface state inventory;
- shared component and composition register with consumer attribution;
- cross-surface token inventory;
- duplicate/stale/hardcode register;
- proposed semantic role map with unresolved decisions;
- Brand/Product boundary map;
- compatibility and deprecation plan;
- migration slices with acceptance checks; and
- owner decision packet before any source migration.

## 8. Minimum verification

- source-level search and consumer attribution for every route, flow,
  component, and proposed token;
- exact route/alias/prototype counts reconciled against `App.js`,
  `publicRoutes.js`, and the component/page tree;
- contrast checks for representative text/action/focus pairs;
- responsive and localization spot checks for affected components;
- current tests/build remain untouched and are not presented as migration
  evidence; any checks run are inventory evidence only;
- no backend, route, API, schema, provider, or lifecycle behavior changes; and
- `git diff --check` with no source modifications expected.

## 9. Delivery gates

This task card authorizes documentation-only discovery and reconciliation. It
does not authorize token edits, page redesign, component API changes, route or
dependency changes, staging, commit, push, PR, merge, deployment, readiness,
or go-live. Each later migration or visual iteration requires exact-file scope,
owner approval, proportional tests, version/changelog evidence where a shared
contract changes, and a reversible handoff. Page composition may iterate inside
an approved semantic/component/state contract; breaking token, font, API, or
behavior changes require a separately versioned amendment.
