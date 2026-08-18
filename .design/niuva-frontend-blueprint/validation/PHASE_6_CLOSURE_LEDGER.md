# Niuva Phase 6 Frontend Migration Closure Ledger

**Status:** Candidate closure ledger — all former `PENDING_G3` rows are
reconciled; Phase 6 awaits final owner closure review and Phase 7 remains
**explicitly frozen**

**Date:** 19 August 2026

**Repository baseline:** `origin/main`
`1c018b3c95de086ad107e9d32d56b973a2329b6c`

**Worktree:** `docs/niuva-phase6-pending-g3-review-20260819`

**Scope:** Reconcile the complete Niuva frontend migration boundary across
Public, Commerce/Retail, Account/Auth, Customer-owned records, Operations,
shared components/tokens, compatibility aliases, reserved paths, and
environment-gated prototypes before any Phase 7 design review.

This is a documentation and governance artifact. It does not change
application source, tests, tokens, route declarations, dependencies, APIs,
schemas, lifecycle state machines, permissions, providers, content authority,
or business rules.

## 1. Closure decision

Phase 6 is not closed yet.

The design artifacts and executable Wave B–F candidate tasks are complete at
the candidate/self-review level, and bounded source pilots have been merged.
That is not the same as completing the overall frontend migration. The current
ledger remains open until every eligible route family and shared foundation has
one of these explicit outcomes:

1. `DELIVERED_BOUNDED` — an exact-file G4 slice is merged with proportional
   verification and its limitations are recorded;
2. `HOLD_LEGAL_CONTENT` — source work is blocked by an unresolved legal or
   content authority and is not silently substituted with implementation;
3. `CONTRACT_ONLY_INACTIVE` — the capability is intentionally inactive and
   must not be presented as available automation;
4. `INVENTORY_ONLY` — an alias, reserved path, or prototype is recorded but is
   not an active content owner or migration consumer; or
5. `DEFERRED_WITH_OWNER_REASON` — a separately approved deferral records why
   the work is not part of the current runtime migration.

`PENDING_G3`, `PENDING_G4`, `PLANNING_ONLY`, or an unqualified `UNKNOWN` may
not remain for an eligible active route family at Phase 6 closure.

Strict closure does not mean activating every candidate route or capability.
Inactive Retail transaction paths, reserved project-detail paths, compatibility
aliases, prototypes, provider seams, and legal/content holds remain explicit
exceptions rather than being fabricated into “complete” runtime features.

## 2. Authority and precedence

Use the following order when reconciling this ledger:

1. [`NIUVA_MASTER_SPEC.md`](../../../docs/NIUVA_MASTER_SPEC.md)
2. [`DOCUMENT_REGISTER.md`](../../../docs/context/DOCUMENT_REGISTER.md)
3. [`DECISION_REGISTER.md`](../../../docs/decisions/DECISION_REGISTER.md)
4. The applicable approved decision or ADR
5. [`DESIGN.md`](../../../DESIGN.md)
6. The current source and tests at the selected baseline
7. The Phase 6 blueprint artifacts and this ledger

The primary design and route authorities are `DEC-UX-003`, `DEC-UX-004`, the
approved access/operations decisions, the DS-01A through DS-05 records, and
the exact migration cards in this blueprint. Candidate artifacts do not amend
canonical authority or authorize implementation by themselves.

The working evidence set for this ledger is:

- [`TASKS.md`](../TASKS.md), including the Phase 6 handoff and source-pilot
  disposition;
- [`ROUTE_COMPONENT_MATRIX.md`](../inventory/ROUTE_COMPONENT_MATRIX.md), the
  exact route, alias, prototype, permission, and component inventory;
- [`TASK_EXECUTION_SELF_REVIEW.md`](TASK_EXECUTION_SELF_REVIEW.md), the
  consolidated candidate/self-review record;
- [`REMAINING_BACKLOG_RECONCILIATION.md`](REMAINING_BACKLOG_RECONCILIATION.md),
  the post-pilot hold and expansion disposition; and
- [`FOUNDATION_TASK_CARDS.md`](../migration/FOUNDATION_TASK_CARDS.md), the
  planning-only MIG-05 foundation groups; and
- [`PHASE_6_PENDING_G3_SELF_REVIEW.md`](PHASE_6_PENDING_G3_SELF_REVIEW.md),
  the one-by-one exact-source review and disposition for every former
  `PENDING_G3` row.

## 3. Inventory baseline

The DS-01B route/component inventory at this baseline records:

- 58 current non-wildcard route patterns;
- 8 generated Public compatibility aliases;
- 1 locale-aware wildcard recovery route;
- 67 effective patterns when those categories are combined;
- 2 environment-gated Brand Lab prototype paths;
- reserved and candidate paths that are recorded but intentionally inactive;
- 21 unique Operations permission keys reconciled against the route matrix; and
- shared layout, navigation, state, collection, form, and status mechanics
  whose domain meaning remains owned by the route or lifecycle.

The inventory is evidence of scope, not a readiness score. Route visibility is
never authorization, and a component's existence is never adoption proof.

## 4. Route-family closure ledger

<!-- markdownlint-disable MD013 -->

| Frontend family | Current closure status | Evidence or exact next gate | Exclusion / reason |
| --- | --- | --- | --- |
| Public Home and public shell | `DELIVERED_BOUNDED` | MIG-01 bounded Homepage shell/navigation pilot, merged PR #279 | Does not claim that every future Homepage art-direction iteration or Public route is migrated. |
| About and Services ID/EN | `DELIVERED_BOUNDED` | `PHASE_6_PENDING_G3_SELF_REVIEW.md`; current `AboutPage`, `CapabilitiesPage`, route registry, and state tests | English remains an intentional Indonesian fallback until approved translated content is supplied. |
| Projects ID/EN archive | `DELIVERED_BOUNDED` | `PHASE_6_PENDING_G3_SELF_REVIEW.md`; current `ProjectsPage`, schema/state tests, and route registry | Reserved `/proyek/:slug` and `/en/projects/:slug` detail prefixes remain inactive. |
| Contact/Inquiry ID/EN | `DELIVERED_BOUNDED` | MIG-01B exact source pilot, merged PR #281 | No public upload, Quote/Project creation, price, ETA, or automatic WhatsApp. |
| FAQ ID/EN | `DELIVERED_BOUNDED` | SRC-PUB-01C consumer-state pilot, merged PR #301 | FAQ remains support content; it does not become policy, lifecycle, or provider authority. |
| Not Found wildcard recovery | `DELIVERED_BOUNDED` | SRC-PUB-02A exact Not Found slice, merged PR #305 | Wildcard recovery does not activate aliases, reserved paths, or new content ownership. |
| Privacy ID/EN | `HOLD_LEGAL_CONTENT` | SRC-PUB-02B in `PUBLIC_SUPPORT_PRIVACY_NOT_FOUND_G3_TASK_CARD.md` | Current policy content remains Draft; no Privacy G4 or publication claim until owner/legal supplies an approved revision. |
| Retail catalog ID/EN and product evaluation | `DELIVERED_BOUNDED` | MIG-02 bounded discovery/product pilot, merged PR #284 | No guest checkout, private upload, authoritative price, reservation, payment, or provider activation. |
| Retail Request/Offer/cart/checkout/Order transaction | `CONTRACT_ONLY_INACTIVE` | COM-03 and approved Retail offer/account decisions | `quote_required` preserves context but creates no Order, reservation, payment attempt, or checkout total. |
| Customer Login and recovery | `DELIVERED_BOUNDED` | MIG-03 Account/Auth pilot, merged PR #288 | Backend session, identity, provider, and activation boundaries remain unchanged. |
| Customer Registration email/password | `DELIVERED_BOUNDED` | Registration slice, merged PR #296 | Verification and dormant Google OIDC seams do not activate registration flags or provider credentials. |
| Customer-owned dashboard/order detail | `DELIVERED_BOUNDED` | SRC-ACC-03 read-only order recovery pilot, merged PR #299 | Customer-safe projection only; no new order, payment, upload, or permission authority. |
| Staff login and invitation acceptance | `DEFERRED_WITH_OWNER_REASON` | `PHASE_6_PENDING_G3_SELF_REVIEW.md`; current `AdminLogin`, `StaffInvitationAccept`, AuthShell/ProtectedRoute tests | Invitation validity/identity and staff lifecycle require a separately approved staff API/source card; customer identity remains distinct. |
| Operations Inquiry queue/detail | `DELIVERED_BOUNDED` | MIG-04 bounded Operations presentation pilot, merged PR #290 | Backend authorization, projection, and lifecycle remain the authority. |
| Operations Quotes and B2B Projects | `DEFERRED_WITH_OWNER_REASON` | `PHASE_6_PENDING_G3_SELF_REVIEW.md`; current B2B list/detail/revision source and contract tests | Quote/Project lifecycle transitions, revision authority, and permissions require their own Operations G4. |
| Operations Retail Orders and after-sales | `DEFERRED_WITH_OWNER_REASON` | `PHASE_6_PENDING_G3_SELF_REVIEW.md`; current Retail Order presentation and contract tests | Finance/provider, refund/reprint, fulfillment, permission, API, and activation gates remain open. |
| Operations catalog, materials, inventory, work orders | `DEFERRED_WITH_OWNER_REASON` | `PHASE_6_PENDING_G3_SELF_REVIEW.md`; current Catalog/Materials/Inventory/Work Order source and tests | Product/production state is domain-owned; no provider or production readiness is implied. |
| Operations publishing/CMS | `DEFERRED_WITH_OWNER_REASON` | `PHASE_6_PENDING_G3_SELF_REVIEW.md`; current CMS/Portfolio source and lifecycle tests | Content owner, locale, version, publish, rollback, and asset authority require separate source evidence. |
| Operations governance, settings, notifications | `DEFERRED_WITH_OWNER_REASON` | `PHASE_6_PENDING_G3_SELF_REVIEW.md`; current utility source and contract tests | Recipient scope, notification policy, and provider boundaries remain separate. |
| Operations work home/grid | `DELIVERED_BOUNDED` | `PHASE_6_PENDING_G3_SELF_REVIEW.md`; current AdminDashboard source/tests | Bento/grid remains optional and LOCAL; it is not a universal composition. |
| Account compatibility `/order` | `INVENTORY_ONLY` | DS-01B and MIG-06 compatibility record | Recovery destination only; no create-order activation. |
| Public compatibility aliases | `INVENTORY_ONLY` | DS-01B alias matrix and MIG-06 | Application navigation does not prove the separately gated HTTP `308` contract. |
| Reserved project-detail paths | `INVENTORY_ONLY` | DS-01B reserved-path matrix | No active link, sitemap entry, CMS owner, canonical tag, or analytics identity. |
| Brand Lab prototypes | `INVENTORY_ONLY` | DS-01B prototype inventory | Environment-gated historical evidence; no automatic adoption or deletion. |

<!-- markdownlint-enable MD013 -->

## 5. Shared foundation closure ledger

MIG-05 remains planning-only except for the already merged foundation slice in
PR #276. Each remaining group requires a fresh exact-consumer G3 review at the
current baseline before G4 source authorization.

<!-- markdownlint-disable MD013 -->

| Foundation group | Current status | Required closure evidence | Prohibited shortcut |
| --- | --- | --- | --- |
| Runtime semantic token bridge | `DELIVERED_BOUNDED` | Merged PR #276 and `PHASE_6_PENDING_G3_SELF_REVIEW.md` | Do not duplicate the already merged bridge or promote LOCAL art direction. |
| Shared action/form compatibility | `DELIVERED_BOUNDED` | Current NDS primitive contract tests and cross-surface consumers recorded in `PHASE_6_PENDING_G3_SELF_REVIEW.md` | Broad rename, breaking API, or destructive removal remains separately gated. |
| Shared feedback/state compatibility | `DELIVERED_BOUNDED` | Current state primitives, resource adapters, tests, and cross-surface consumers recorded in `PHASE_6_PENDING_G3_SELF_REVIEW.md` | Shared presentation never replaces domain lifecycle meaning. |
| Collection/status mechanics | `DEFERRED_WITH_OWNER_REASON` | Current domain tables/status adapters plus zero-consumer `ResponsiveTable` evidence in `PHASE_6_PENDING_G3_SELF_REVIEW.md` | No zero-consumer promotion or universal status labels; a named second consumer and mobile contract are required first. |
| Compatibility and retirement | `DEFERRED_WITH_OWNER_REASON` | MIG-06 inventory and later exact retirement cards | File existence, green tests, or one pilot does not authorize deletion or alias retirement. |

<!-- markdownlint-enable MD013 -->

## 6. Required closure sequence

Phase 6 must proceed in this order:

1. Reconcile this ledger and all referenced cards against `origin/main` at the
   selected SHA.
2. Resolve or formally retain every route-family status. All former
   `PENDING_G3` rows must become a bounded delivery, inactive contract, or
   explicit owner-reasoned deferral.
3. For each eligible family, create one exact-file G3 card, review current
   source/tests, and authorize only the named G4 slice.
4. Implement in one owned worktree per slice without changing unrelated
   surfaces, dependencies, lifecycle state machines, or backend authority.
5. Run proportional focused/full tests, production build, dependency/bundle
   audit, `git diff --check`, browser responsive and interaction checks,
   accessibility/Axe, reduced-motion verification, and Impeccable critique.
6. Record the exact commit, PR, review-thread, and merge evidence together
   with unchanged files, exclusions, rollback, and remaining holds.
7. Repeat until every eligible row is `DELIVERED_BOUNDED` or has an explicit
   owner-approved `HOLD_LEGAL_CONTENT`, `CONTRACT_ONLY_INACTIVE`,
   `INVENTORY_ONLY`, or `DEFERRED_WITH_OWNER_REASON` disposition. The
   one-by-one reconciliation is recorded in
   `PHASE_6_PENDING_G3_SELF_REVIEW.md`.
8. Perform a final Phase 6 closure review. Only after that review may Phase 7
   be separately requested.

Staging, commit, push, PR creation, review-thread resolution, merge,
deployment, readiness, and go-live remain separate delivery gates. This ledger
does not grant any of them.

## 7. Phase 7 freeze

Phase 7 is intentionally **not started**. No `DESIGN_REVIEW.md`, screenshots,
visual critique, or broad design-review claim may be created while this ledger
contains unresolved eligible `PENDING_G3` rows or an unresolved strict-closure
hold.

When Phase 6 is closed, Phase 7 must still be bounded by a named route family
and evidence matrix. It must not become a redesign of the entire frontend or a
token-promotion mechanism.

## 8. Acceptance criteria for this ledger

- [x] Baseline is a fresh isolated worktree at `origin/main`.
- [x] Phase 7 is explicitly frozen.
- [x] Route, alias, reserved-path, prototype, and shared-foundation scope is
      represented.
- [x] Delivered pilots are distinguished from full frontend migration.
- [x] Privacy legal/content hold is visible and not fabricated into success.
- [x] Inactive Retail and reserved capabilities are not treated as missing
      runtime features.
- [x] Every open eligible area has an exact next gate instead of an implicit
      “finish everything” instruction.
- [x] G3/G4, verification, rollback, and delivery gates remain separate.
- [x] Owner authorized one-goal autonomous G3 self-review and bounded delivery
      for all former `PENDING_G3` rows.
- [x] All eligible route-family and foundation rows are closed or explicitly
      deferred with a documented owner/domain reason.
- [ ] Final Phase 6 closure verdict.

**Current verdict:** `CANDIDATE CLOSURE — no `PENDING_G3` rows remain; final
owner closure review is still required before Phase 7 can be requested.`
