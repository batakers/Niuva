# Candidate Amendment — Public Homepage FDM Contour Retirement

**Status:** Owner-approved direction — candidate amendment; not canonical,
not implementation authority, and not delivery evidence

**Date:** 17 August 2026

**Baseline:** `origin/main`
`2459c162ec0ffb58f57d2cf47af5f6c7dda4fd86`

**Owner decision:** The owner approved retirement of the FDM contour as a
visual gesture on the Public Homepage and approved a separate canonical
amendment path. The owner did not approve a replacement visual, a broad
cross-surface redesign, token migration, stage, commit, push, PR, merge,
deployment, readiness, or go-live.

## 1. Purpose

This packet proposes one narrow canonical amendment: retire the **FDM contour
identity gesture from the Public Homepage**. The five-stage semantic process
rail remains the only linear process explanation. No replacement ornament is
selected by this amendment.

“FDM” in this packet refers only to the visual contour gesture. This amendment
does not remove or change fused-deposition modelling as a manufacturing
capability, the Custom 3D Print pricing policy, material rules, production
workflow, or any Retail/B2B lifecycle.

## 2. Authority and precedence

Use the repository canonical order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. the applicable approved decision or ADR;
5. `DESIGN.md` within its approved scope; and
6. current source and tests as implementation evidence.

This candidate packet is below those authorities until a separately reviewed
canonical amendment is approved and published.

## 3. Proposed canonical change

### 3.1 Retire

The following target is proposed for retirement:

- the bounded FDM contour identity gesture in the Public Homepage Hero;
- the bounded FDM contour identity gesture in the Public Homepage closing
  field; and
- Public authored-motion tokens or acceptance language whose only purpose is
  to animate those Homepage contour placements.

### 3.2 Retain

- the five-stage `Need → Research → Experiment → Prototype → Output` semantic
  process rail, appearing once;
- reduced-motion requirements for the remaining authored Public motion;
- factual project evidence and its provenance requirements;
- Public, B2B, Retail, Account, and Operations lifecycle boundaries;
- all FDM manufacturing, pricing, material, order, and production rules; and
- historical prototypes and validation evidence as clearly labelled archives.

### 3.3 Do not decide here

This amendment does not choose a replacement visual identity, new contour,
illustration, animation library, dark mode, global palette, or cross-surface
component system. Those require the separate design-token and design-system
workstream.

## 4. Canonical files requiring amendment review

The later documentation PR must review exact references in:

| File | Required review |
| --- | --- |
| `docs/NIUVA_MASTER_SPEC.md` | Remove the Public Homepage contour target while preserving the semantic rail and FDM domain rules. |
| `docs/decisions/experience/DEC-UX-004-cross-surface-design-system-reconstruction.md` | Amend the FDM identity-gesture decision and motion guidance. |
| `DESIGN.md` | Remove active Homepage contour requirements and contour-only authored-motion aliases; preserve valid Public motion and reduced-motion rules. |
| `docs/decisions/DECISION_REGISTER.md` | Record the amendment and its effective date/status. |
| `docs/context/DOCUMENT_REGISTER.md` | Update only if the repository register requires a new canonical amendment entry. |

The amendment PR must not modify backend code, pricing policy, API/schema,
routes, provider configuration, or business lifecycle rules.

## 5. Relationship to the Homepage recovery PR

The Homepage recovery PR remains a separate runtime slice. It may remove the
Homepage contour from source and tests as an owner-approved local direction,
but it must not silently promote that removal to canonical authority.

Before staging that PR, its task card and tests must not retain active
acceptance criteria that require a contour. Historical contour measurements may
remain only when labelled superseded evidence.

The canonical amendment PR is a separate documentation gate and must not be
folded into the recovery PR merely because both mention the same visual.

## 6. Acceptance criteria for this candidate amendment

- the visual-only FDM scope is explicit and separated from FDM business rules;
- every active canonical FDM-contour reference is identified by file and
  proposed disposition;
- the five-stage process rail remains explicitly retained;
- no replacement visual or dependency is implied;
- historical prototypes/evidence remain preserved and labelled;
- design-token migration is explicitly deferred to its own workstream;
- no route, locale, copy, lifecycle, authorization, API, schema, provider,
  pricing, or production capability changes are authorized; and
- publication, canonical promotion, implementation, commit, push, PR, merge,
  deployment, readiness, and go-live remain separate gates.

## 7. Next gated sequence

1. Owner review of this candidate amendment packet.
2. Exact-file canonical reconciliation and a documentation-only amendment PR.
3. Review and merge of that PR under the repository’s normal canonical gate.
4. Separate publication of the bounded Homepage recovery PR after its task
   card, unused contour tokens, and stale assertions are reconciled.
5. Read-only cross-surface design-token audit before any broad visual migration.

No delivery action was performed by creating this candidate packet.
