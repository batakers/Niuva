# Niuva Frontend Experience and Design-System Blueprint

**Status:** Candidate working set — Context Only — Phases 2 through 5
owner-approved; Phase 6 `DS-01A` owner-approved as an exact-SHA ledger;
`DS-01B` through `DS-05` and all executable Wave B–F tasks completed for one
consolidated owner review; locked `SRC-*` pilots remain separately gated

**Date:** 18 August 2026

**Repository baseline:** `origin/main`
`8555685c29a3fde9976ae6499336e2eb45a330ba`

## Purpose

This directory is the review home for a future cross-surface Niuva Frontend
Experience and Design-System Blueprint. It keeps the design discussion
organized without treating exploration, diagrams, or a design brief as
canonical authority or application implementation.

The working set covers the whole frontend system:

- Public and Marketing;
- Commerce and Retail;
- Account, Customer, and authentication;
- Operations and Admin;
- shared primitives, surface-native compositions, states, and user flows;
- active routes, compatibility aliases, reserved paths, and prototypes; and
- responsive, accessibility, localization, evidence, motion, and migration
  boundaries.

Prototype and compatibility entries are inventory evidence only. They are not
automatically promoted, activated, migrated, or removed.

## Authority

Read this working set after the repository authority that governs the task:

1. [`NIUVA_MASTER_SPEC.md`](../../docs/NIUVA_MASTER_SPEC.md)
2. [`DOCUMENT_REGISTER.md`](../../docs/context/DOCUMENT_REGISTER.md)
3. [`DECISION_REGISTER.md`](../../docs/decisions/DECISION_REGISTER.md)
4. The approved decision or ADR applicable to the task
5. [`DESIGN.md`](../../DESIGN.md) within its approved scope
6. The applicable runbook
7. Current source and tests as implementation evidence
8. This candidate working set

The most directly related approved decision is
[`DEC-UX-004`](../../docs/decisions/experience/DEC-UX-004-cross-surface-design-system-reconstruction.md).
The current candidate semantic contract and source inventory remain supporting
inputs:

- [Semantic token and component-state contract review](../../docs/implementation/specs/candidates/2026-08-17-niuva-semantic-token-component-state-contract-review.md)
- [Cross-surface frontend inventory](../../docs/implementation/audits/2026-08-17-cross-surface-design-token-inventory.md)
- [Frontend component register](../../docs/implementation/plans/pending-reconciliation/2026-08-05-frontend-component-register.md)

If this directory conflicts with higher authority, the higher authority wins.

## Phase map

| Phase | Output | Current status |
| --- | --- | --- |
| 1. Direction discussion | Owner-reviewed boundaries and decisions | Complete as discussion input |
| 2. Design brief | Problem, principles, system model, constraints, and success definition | Owner approved on 18 August 2026 |
| 3. Information architecture | Route families, navigation, flow maps, page responsibilities, and state ownership | Owner approved on 18 August 2026 |
| 4. Design tokens | Reviewable token proposal aligned to the approved semantic tiers | `TOK-01` through `TOK-12` owner approved on 18 August 2026 |
| 5. Brief to tasks | Ordered wireframe, component-contract, visual-study, prototype, and validation slices | Owner approved on 18 August 2026 |
| 6. Frontend design | Separately authorized bounded design or source slices | `DS-01A` owner approved; `DS-01B` through `DS-05` and executable Wave B–F candidate artifacts completed for consolidated owner review on 18 August 2026; locked `SRC-*` pilots remain unchecked |
| 7. Design review | Evidence-bound critique on owner request only | Not authorized |

Advancing from one phase never authorizes the next phase automatically. Source
migration remains a separately gated implementation task.

## File inventory

- [`DESIGN_BRIEF.md`](DESIGN_BRIEF.md) — Phase 2 brief and the seven
  owner-approved blueprint decisions carried forward from discussion.
- [`INFORMATION_ARCHITECTURE.md`](INFORMATION_ARCHITECTURE.md) — Phase 3 route,
  navigation, page-responsibility, user-flow, state-ownership, and growth map.
- [`DESIGN_TOKENS.md`](DESIGN_TOKENS.md) — Phase 4 token classification,
  candidate decisions, compatibility map, and review criteria.
- [`DESIGN_TOKENS.css`](DESIGN_TOKENS.css) — non-runtime Phase 4 CSS-variable
  specimen for reviewing exact token names and values.
- [`design-tokens-preview.html`](design-tokens-preview.html) — static visual
  specimen for reviewing color, type, spacing, shape, state, and surface roles.
- [`TASKS.md`](TASKS.md) — Phase 5 dependency-ordered component, wireframe,
  visual-study, prototype, validation, and later migration backlog.
- [`components/COMPONENT_STATUS.md`](components/COMPONENT_STATUS.md) — exact-SHA
  Phase 6 `DS-01A` component, consumer, owner, state, dependency, and
  restriction ledger.
- [`inventory/ROUTE_COMPONENT_MATRIX.md`](inventory/ROUTE_COMPONENT_MATRIX.md)
  — exact-SHA Phase 6 `DS-01B` route, alias, responsibility, component,
  state/recovery, and inactive-path matrix included in the consolidated owner
  review.
- [`components/SHARED_ACTION_FORM_SPEC.md`](components/SHARED_ACTION_FORM_SPEC.md)
  — candidate `DS-02` NDS 13-field contract for shared action and form
  mechanics, with current consumer evidence and held single-consumer Tabs.
- [`components/SHARED_FEEDBACK_STATE_SPEC.md`](components/SHARED_FEEDBACK_STATE_SPEC.md)
  — candidate `DS-03` visible feedback, overlay, loading, recovery, and
  success-state contract with Drawer/`vaul` quarantine.
- [`components/COLLECTION_RECORD_STATUS_SPEC.md`](components/COLLECTION_RECORD_STATUS_SPEC.md)
  — candidate `DS-04` collection, record identity, query/filter, pagination,
  narrow-layout, and lifecycle-bounded status mechanics.
- [`components/NAVIGATION_LOCALE_RETURN_SPEC.md`](components/NAVIGATION_LOCALE_RETURN_SPEC.md)
  — candidate `DS-05` Public/Account/Operations navigation, locale, mobile
  disclosure, and protected safe-return mechanics.
- [`wireframes/`](wireframes/) — Wave B–C route-family structures and state
  wireframes for Public, Commerce, Auth, and Operations.
- [`prototypes/`](prototypes/) — reviewable Public, Account, and Operations
  state-flow specimens; prototypes are not runtime implementation.
- [`flows/`](flows/) — Commerce transaction and `quote_required` boundary
  contract, without capability activation.
- [`visual-studies/`](visual-studies/) — Public/Operations art-direction,
  evidence, and density alternatives; selected/held directions remain LOCAL.
- [`experiments/`](experiments/) — donor-admission and bounded motion ledgers;
  no new runtime donor dependency is admitted.
- [`validation/`](validation/) — responsive/localization, accessibility/state,
  truth/privacy/lifecycle, Impeccable critique, and consolidated execution
  self-review evidence.
- [`decisions/PROMOTION_REVIEW.md`](decisions/PROMOTION_REVIEW.md) — candidate
  component/token/pattern promotion ledger; no runtime promotion.
- [`migration/`](migration/) — six exact-file candidate source-pilot,
  foundation, and compatibility/retirement cards; planning-only until G3/G4.
- `README.md` — scope, authority, phase map, and working-set rules.

The executable design, validation, and planning files for Wave B–F are complete
in this working set and await one consolidated owner review. Section 11 of
`TASKS.md` remains locked: `SRC-*` source pilots are intentionally unchecked and
still require separate exact-file G3/G4 authorization.

## Working-set rules

- Keep global, core, and surface tokens purpose-based and durable.
- Keep page- or art-direction-specific tokens local until at least two real
  consumers use them with the same semantic meaning.
- Share primitive interaction, API, baseline state, and accessibility
  contracts; do not force one visual composition across all surfaces.
- Keep lifecycle wording, recovery, permission, persistence, and authoritative
  success domain-owned.
- Treat external component catalogs as donors, not as Niuva's design system.
- Record prototypes and aliases without assuming migration or activation.
- Preserve historical evidence when a direction is retired.
- Version changes and retain a rollback path; do not silently rewrite adopted
  contracts.
- Keep candidate art direction and composition iteratable while preserving
  durable route, lifecycle, privacy, accessibility, evidence, and state
  invariants.

## FDM authority note

The owner approved retirement of the Homepage FDM contour as candidate
direction in the
[FDM retirement amendment](../../docs/implementation/specs/candidates/2026-08-17-public-fdm-contour-retirement-amendment.md).
That amendment is not canonical. Higher authority still contains FDM clauses,
so this working set does not claim canonical retirement and does not choose a
replacement visual. The conflict must remain visible until a separate
canonical amendment is approved.

## Explicit exclusions

This directory does not authorize or perform:

- application source, test, route, redirect, dependency, or configuration
  changes;
- token-value migration or component API changes;
- backend, API, schema, authorization, provider, storage, payment, or business
  rule changes;
- prototype or compatibility-alias activation, deletion, or migration;
- canonical promotion or replacement of `DESIGN.md`;
- stage, commit, push, PR, merge, deployment, readiness, or go-live work.
