# Niuva Phase 6 Frontend Migration Closure Ledger

**Status:** Candidate closure ledger — Phase 6 remains **OPEN**; Phase 7 is
explicitly frozen until this ledger reaches a reviewed closure verdict

**Date:** 19 August 2026

**Repository baseline:** `origin/main`
`b38ae61532647cec4ef3b259c0909195e0ae3bff`

**Worktree:** `docs/niuva-phase6-closure-ledger-20260819`

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
  planning-only MIG-05 foundation groups.

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
| About and Services ID/EN | `PENDING_G3` | PUB-04 candidate wireframe; requires a route-family exact-file G3 and then G4 card | Four equal Services and Indonesian-first fallback remain mandatory. |
| Projects ID/EN archive | `PENDING_G3` | PUB-05 and EXP-03 evidence language; requires exact source scope and provenance review | Reserved `/proyek/:slug` and `/en/projects/:slug` detail prefixes remain inactive. |
| Contact/Inquiry ID/EN | `DELIVERED_BOUNDED` | MIG-01B exact source pilot, merged PR #281 | No public upload, Quote/Project creation, price, ETA, or automatic WhatsApp. |
| FAQ ID/EN | `DELIVERED_BOUNDED` | SRC-PUB-01C consumer-state pilot, merged PR #301 | FAQ remains support content; it does not become policy, lifecycle, or provider authority. |
| Not Found wildcard recovery | `DELIVERED_BOUNDED` | SRC-PUB-02A exact Not Found slice, merged PR #305 | Wildcard recovery does not activate aliases, reserved paths, or new content ownership. |
| Privacy ID/EN | `HOLD_LEGAL_CONTENT` | SRC-PUB-02B in `PUBLIC_SUPPORT_PRIVACY_NOT_FOUND_G3_TASK_CARD.md` | Current policy content remains Draft; no Privacy G4 or publication claim until owner/legal supplies an approved revision. |
| Retail catalog ID/EN and product evaluation | `DELIVERED_BOUNDED` | MIG-02 bounded discovery/product pilot, merged PR #284 | No guest checkout, private upload, authoritative price, reservation, payment, or provider activation. |
| Retail Request/Offer/cart/checkout/Order transaction | `CONTRACT_ONLY_INACTIVE` | COM-03 and approved Retail offer/account decisions | `quote_required` preserves context but creates no Order, reservation, payment attempt, or checkout total. |
| Customer Login and recovery | `DELIVERED_BOUNDED` | MIG-03 Account/Auth pilot, merged PR #288 | Backend session, identity, provider, and activation boundaries remain unchanged. |
| Customer Registration email/password | `DELIVERED_BOUNDED` | Registration slice, merged PR #296 | Verification and dormant Google OIDC seams do not activate registration flags or provider credentials. |
| Customer-owned dashboard/order detail | `DELIVERED_BOUNDED` | SRC-ACC-03 read-only order recovery pilot, merged PR #299 | Customer-safe projection only; no new order, payment, upload, or permission authority. |
| Staff login and invitation acceptance | `PENDING_G3` | AUTH-01 and AUTH-03 candidate records; exact source ownership is not covered by the bounded customer pilot | Must remain distinct from Customer identity and Operations authorization. |
| Operations Inquiry queue/detail | `DELIVERED_BOUNDED` | MIG-04 bounded Operations presentation pilot, merged PR #290 | Backend authorization, projection, and lifecycle remain the authority. |
| Operations Quotes and B2B Projects | `PENDING_G3` | OPS-03 candidate wireframe and lifecycle record | Quote/Project resources, revision history, and permissions require their own exact-file slice. |
| Operations Retail Orders and after-sales | `PENDING_G3` | OPS-04 candidate family and after-sales decisions | Finance/provider, permission, API, and activation gates remain open. |
| Operations catalog, materials, inventory, work orders | `PENDING_G3` | OPS-05 candidate family | Product/production state is domain-owned; no provider or production readiness is implied. |
| Operations publishing/CMS | `PENDING_G3` | OPS-06 candidate family | Content, locale, version, publish, and rollback authority require separate source evidence. |
| Operations governance, settings, notifications | `PENDING_G3` | OPS-07 candidate family | Recipient scope, permissions, notification policy, and provider boundaries remain separate. |
| Operations work home/grid | `PENDING_G3` | OPS-02 and OPS-08 candidate visual study | Bento/grid remains optional and LOCAL; it is not a universal composition. |
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
| Runtime semantic token bridge | `PENDING_G3` | `index.css`, Tailwind bridge, named tests, two real same-purpose consumers, contrast/long-content/fallback and bundle evidence | Promoting LOCAL art direction or a preview token without two real consumers. |
| Shared action/form compatibility | `PENDING_G3` | Button/Label/Input/Textarea/FormField/Select/Switch exact files, NDS 13 fields, API compatibility, two consumers across allowed surfaces, keyboard/focus/error evidence | Broad rename, breaking API, or destructive removal. |
| Shared feedback/state compatibility | `PENDING_G3` | Dialog/Alert/Skeleton/EmptyState/ErrorState/OperationalState/SurfacePanel exact files, visible critical states, focus return, reduced motion, resource adapters, two consumers | Replacing domain lifecycle meaning with a generic status component. |
| Collection/status mechanics | `PENDING_G3` | DS-04 named collection/table/filter/status files, distinct resources, narrow-layout alternative, stable return context, two consumers | Zero-consumer promotion or universal status labels. |
| Compatibility and retirement | `DEFERRED_WITH_OWNER_REASON` | MIG-06 inventory and later exact retirement cards | File existence, green tests, or one pilot does not authorize deletion or alias retirement. |

<!-- markdownlint-enable MD013 -->

## 6. Required closure sequence

Phase 6 must proceed in this order:

1. Reconcile this ledger and all referenced cards against `origin/main` at the
   selected SHA.
2. Resolve or formally retain every route-family status. `PENDING_G3` is not a
   failure, but it is not closure.
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
   `INVENTORY_ONLY`, or `DEFERRED_WITH_OWNER_REASON` disposition.
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
- [ ] Owner review of this closure ledger.
- [ ] All eligible route-family and foundation rows closed or owner-approved
      with a documented hold/defer reason.
- [ ] Final Phase 6 closure verdict.

**Current verdict:** `OPEN — Phase 6 migration closure work remains.`
