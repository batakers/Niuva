# Candidate Niuva Semantic Token and Component-State Contract Review

**Status:** Candidate — owner-approved contract direction; not canonical, not
implementation authority, and not migration evidence

**Date:** 17 August 2026

**Repository baseline:** `origin/main`
`5df75387b5ead07703cf162179d5fde7f47fdfb7`

**Purpose:** Review the existing NDS 2.0 semantic-token, component, and
cross-surface state contracts after the merged Frontend audit in PR #275. This
packet makes the next contract decisions explicit without changing a token,
component, route, state machine, dependency, or page.

**Owner decision:** The seven decisions in Section 6 were approved as
candidate semantic-token and component-state contract direction on 17 August
2026. A later, separately gated exact-file source slice was implemented and
merged in PR #276. That merge does not promote this packet to canonical
authority or authorize consumer migration, a new dependency, component API
changes, page redesign, deployment, readiness, or go-live.

**Implementation reference:** PR #276 (`5df75387b5ead07703cf162179d5fde7f47fdfb7`)
merged the bounded foundation aliases, mappings, contract tests, and register
evidence. This candidate packet remains a documentation artifact; its
publication and any later consumer migration remain separately gated.

The owner-approved scope includes every active route, compatibility alias,
prototype, shared component, surface composition, and user flow. Prototype and
alias entries remain inventory evidence only. Any later source migration is a
separate exact-file task and gate.

## 1. Authority and review basis

Use this precedence when a contract appears to conflict:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. the applicable approved decision or ADR;
5. `DESIGN.md` and the applicable Brand/Product register;
6. `DEC-UX-004` and the reconciled Frontend component register;
7. the merged cross-surface audit inventory in PR #275; and
8. current source and tests as implementation evidence.

The review basis is:

- `DEC-UX-004` (`DSR-01` through `DSR-22`);
- `DESIGN.md` NDS 2.0 sections 5–19;
- `docs/implementation/plans/pending-reconciliation/2026-08-05-frontend-component-register.md`;
- `docs/implementation/audits/2026-08-17-cross-surface-design-token-inventory.md`;
- current `frontend/src/index.css`, `frontend/tailwind.config.js`, route
  registry, page tree, component tree, and contract tests.

This packet does not override any higher authority or promote the audit into a
new design system.

## 2. Review disposition

| Area | Current authority | Review disposition |
| --- | --- | --- |
| Token dependency direction | Global values → core semantic aliases → surface aliases → justified component tokens → shared UI → surface/domain compositions → route pages | Restate and preserve. Route pages must not consume raw global values directly. |
| Semantic role vocabulary | NDS roles for surface, text, action, status, border, focus, overlay, shape, spacing, elevation, and motion | Candidate contract; values remain unchanged until a foundation task. |
| Public Brand vs Product register | Public is Persuade/Experience; Commerce, Account, and Operations are Operate | Preserve separate composition, density, typography expression, and lifecycle presentation. |
| Component contract | NDS 13-field minimum plus preserved shared APIs | Require for adopted, provisional, quarantined, compatibility, prototype, and retirement-candidate records. |
| State contract | Complete visible/recovery matrix in `DESIGN.md` and `DEC-UX-004` | Restate as a presentation contract; never create or rename backend enums. |
| Motion and focus | CSS-first Niuva grammar, reduced-motion behavior, visible focus | Preserve; no new runtime dependency or global feedback reset. |
| Compatibility/deprecation | Existing aliases remain until zero-consumer evidence and removal approval | No new consumers of deprecated roles; removal requires versioned migration. |
| Iteration | NDS is an approved target, not a frozen pixel specification | Permit bounded page composition iteration inside the approved contracts. |

## 3. Candidate semantic-token contract

### 3.1 Token tiers

| Tier | Owns | Candidate rule |
| --- | --- | --- |
| Global value | Tonal ramps, spacing units, radii, motion durations/easing, and other raw values | Defined once in the foundation; route pages do not consume raw values directly. |
| Core semantic alias | Purpose-based roles independent of one component | Names describe meaning: surface, text, action, status, border, focus, overlay, spacing, shape, elevation, or motion. |
| Surface alias | Public, Commerce, Account, or Operations interpretation of a core role | Surface aliases may tune composition and density without changing lifecycle authority. |
| Component token | A reusable component-specific role with a demonstrated repeated need | Add only when the shared component contract requires it; do not create page-local substitutes. |

The CSS custom-property registry remains the runtime source of truth. Tailwind
and other mappings may expose the vocabulary but must not create a second token
runtime. DTCG/JSON, a new theme engine, or an external design-token package is
not implied.

### 3.2 Role families

The following role families are the review vocabulary, not permission to add or
rename variables:

- **Surface:** canvas, default, muted, elevated, inverse, and evidence/overlay
  surfaces where the surface contract justifies them;
- **Text:** primary, secondary, muted, disabled, inverse, and technical values;
- **Action:** primary, hover/pressed, secondary, quiet, and disabled action
  roles;
- **Status:** information, success, warning, error, conflict, uncertain, and
  expired roles with domain-owned wording and transitions;
- **Boundary:** control border, decorative border, focus ring, divider, and
  overlay scrim;
- **Layout:** semantic spacing, container/prose measures, control/surface
  radii, and justified elevation;
- **Motion:** instant, fast, standard, deliberate, ambient, easing, and the
  reduced-motion alternative.

Status and lifecycle meanings remain domain-owned. A shared color or token role
never authorizes an Inquiry, Request, Offer, Order, payment, Work Order, or
Admin transition.

### 3.3 Surface boundaries

| Surface | Allowed expression | Must not inherit |
| --- | --- | --- |
| Public/Marketing | Editorial composition, authentic evidence, four equal Services, bounded expressive treatment, Public route and Inquiry entry | Retail Order, private upload, payment, Admin density, or fabricated production proof |
| Commerce/Retail | Product/configuration hierarchy, account boundary, authoritative price/file/stock/fulfillment states, `quote_required` context | Public campaign composition, guest checkout, invented totals, or provider success |
| Account/Customer | Identity, privacy, owned records, recovery, next action, customer-safe status | Public conversion motifs, Admin authority, or internal cost/margin/notes |
| Operations/Admin | Queue identity, role/permission, lifecycle status, conflict, history, recovery, audit-safe presentation | Public campaign rhythm, fake KPI/telemetry, or route visibility as authorization |

Shared visual primitives may be used across surfaces only when their states,
content, and domain restrictions remain explicit.

## 4. Candidate component and state contract

### 4.1 Component adoption record

Every adopted or proposed component/composition must record:

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

Adoption status must distinguish `adopted`, `provisional`, `quarantined`,
`compatibility`, `prototype`, and `retirement candidate`. File existence is
not adoption evidence. A shared API remains compatible unless a later approved
task documents migration, rollback, consumer coverage, and breaking-change
impact.

### 4.2 Cross-surface visible-state contract

| State | Required presentation | Recovery rule |
| --- | --- | --- |
| Default/ready | Identity, task, context, and primary action are clear | Continue the owned task |
| Hover/active/focus | Bounded affordance; visible non-color-only focus | Preserve keyboard and pointer parity |
| Disabled | Reason is visible when an action is expected | Show an authorized alternative when one exists |
| Loading/bootstrap | Hierarchy-preserving skeleton or task-labeled progress | Prevent duplicate action; cancel only when safe |
| Empty | Explain why no data exists and provide an authorized next action | Do not use decoration as the only guidance |
| Validation error | Summary/field relationship, preserved values, managed focus | Correct and resubmit |
| System/dependency error | Distinguish invalid input from persistence/provider failure | Preserve safe context and offer bounded retry/fallback |
| Conflict/stale | Identify changed authoritative version and preserve work | Reload, compare, or reconfirm safely |
| Permission/forbidden | Explain unavailable action without protected detail | Return to owned resource or authorized help |
| Expired/offline | State what expired or is unavailable and whether anything persisted | Reauthenticate/restart or retry only when safe |
| Uncertain | State that final outcome is unknown | Reconcile authority before irreversible retry |
| Recovery | Return focus and scroll to the recovered task context | Continue without re-entering permitted context |
| Success | State exactly what completed, reference, ownership, and remaining work | Offer the next owned action |

Critical feedback must be visible to sighted users and available to assistive
technology. Toasts and live regions may reinforce but cannot be the only
representation of failure, conflict, uncertainty, or success.

### 4.3 Lifecycle and flow boundary

Presentation state names such as `loading`, `submitting`, `validating`, and
`quote_required` do not create backend lifecycle enums. The UI must preserve the
durable owners and transitions for Inquiry, Retail Request, Assisted Retail
Offer, Retail Order, B2B Quote/Project, Customer resources, and Operations
records. An uncertain irreversible action must reconcile authoritative state
before a retry that could duplicate an effect.

## 5. Iteration and versioning

The contract deliberately leaves room for design iteration:

- page composition, rhythm, imagery treatment, and motion choreography may
  change through bounded surface slices;
- a compatible token, variant, or surface contract is a minor amendment;
- a documentation/defect correction is a patch amendment; and
- a renamed/removed token, changed component API, or changed shared behavior is
  a major amendment with migration and rollback evidence.

Iteration must not silently change route ownership, lifecycle meaning,
permission, customer-data projection, localization responsibility, focus/state
behavior, or the NDS dependency direction. Prototype and compatibility paths
remain evidence until their own migration/removal gates pass.

## 6. Owner-approved candidate decisions before foundation migration

The following seven decisions are approved as candidate direction and must be
carried into a later exact-file foundation task:

1. **Semantic role vocabulary and naming:** use purpose-based roles grouped by
   surface, text, action, status, boundary, layout, and motion; values remain
   unchanged until a foundation task.
2. **Public Brand versus Product boundary:** keep Public/Marketing in the
   Persuade/Experience register and Commerce/Retail, Account/Customer, and
   Operations/Admin in the Operate register.
3. **Compatibility family windows:** retain compatibility aliases until
   zero-consumer evidence, named replacements, rollback notes, and removal
   approval exist.
4. **Typography and motion classification:** preserve the current NDS roles and
   surface-specific expression, including reduced-motion behavior; no new
   dependency or global feedback reset is approved.
5. **Consumer and rollback evidence:** every migration slice must identify
   consumers, verification, compatibility impact, and rollback requirements.
6. **Foundation ownership:** the foundation contract and changelog require an
   explicitly named owner in the later task card.
7. **First implementation scope:** the first foundation migration must be
   defined as an exact-file, bounded slice after this packet, not inferred from
   this approval.

These approvals do not authorize token edits, font installation, dependency
changes, component API changes, route changes, page redesign, or migration
execution. They authorize only the next planning gate: an exact-file
foundation task card.

The following details remain to be recorded in that task card:

- the concrete Public Brand versus Product register boundary in the component
  register;
- the concrete compatibility family names and replacements;
- the named foundation/changelog owner; and
- the exact files selected for the first migration slice.

## 7. Acceptance criteria for contract approval

The owner-approved candidate contract is recorded when:

- owner approval of the seven decisions in Section 6 is recorded;
- every role family has a current source mapping or an explicitly unresolved
  decision;
- every active component and composition has an adoption status and owner;
- all route/surface/user-flow entries from the PR #275 inventory are preserved;
- state contracts cover visible, recovery, uncertain, permission, and
  localization behavior;
- compatibility and deprecation rules include zero-consumer and rollback gates;
- no proposed role implies backend lifecycle or provider authority; and
- no application source, dependency, route, schema, or business rule changed.

## 8. Explicit exclusions

This packet does not authorize:

- token value edits or consumer migration;
- font installation, removal, or asset migration;
- component API or state behavior changes;
- route, locale, redirect, CMS, API, schema, provider, payment, storage, or
  business-rule changes;
- prototype/alias deletion or activation;
- `PRODUCT.md` refresh; or
- commit, push, PR, merge, deployment, readiness, or go-live.

The next gate after this owner approval is a separate exact-file foundation task
card. Publication of this packet remains separately gated.
