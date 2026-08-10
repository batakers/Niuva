# Candidate Owner Review Packet — Public Visual Refinement

**Status:** Candidate — OVR-01 through OVR-06 accepted; not canonical and not
implementation authority

**Date:** 10 August 2026
**Baseline:** `origin/main` at
`954837c9dd4fcaeb9438c16fb6934210e082a364`
**Direction packet:**
[`2026-08-10-niuva-visual-refinement-direction-packet.md`](2026-08-10-niuva-visual-refinement-direction-packet.md)
**Prototype task card:**
[`2026-08-10-niuva-public-visual-refinement-prototype-task-card.md`](2026-08-10-niuva-public-visual-refinement-prototype-task-card.md)
**Prototype evidence:**
[`VISUAL_QA.md`](../../prototypes/2026-08-10-niuva-public-visual-refinement-prototype-r1/VISUAL_QA.md)

## Purpose

This packet turns the parent direction packet's owner checklist into explicit,
reviewable decisions. It records recommended answers based on the isolated
prototype and its evidence; it does not silently convert them into canonical
authority. The owner may accept, replace, or defer each recommendation.

## Decision requests

| ID | Decision | Recommended answer | Evidence / consequence |
| --- | --- | --- | --- |
| `OVR-01` | Direction label | Accept `Evidence-led Prototyping Editorial` as a packet-local refinement label; keep `Experimental Editorial Hybrid` as the canonical public direction | The label describes the artifact-led visual thesis without creating a new brand; see the direction packet and Home captures |
| `OVR-02` | v1 route scope | Home `/`, Projects `/projects` plus one detail state, and Contact `/contact` only | Keeps the refinement public/B2B-first; Retail/customer and Admin/CMS remain guardrails, not redesign scope |
| `OVR-03` | Typography scope | Keep Poppins/Inter pairing as Homepage-approved plus candidate Projects/Contact extension; do not promote broader rollout | Prototype uses local fallbacks and does not edit `DESIGN.md` or production tokens |
| `OVR-04` | Evidence set | Approve the Niuva mark and the three existing project media listed in `ASSET_MANIFEST.md`; provenance owner remains Niuva content/brand owner | No generated proof is used; a changed or unverified source must be removed rather than replaced |
| `OVR-05` | Contact fallback | Accept explicit map loading/unavailable and retry states | Prevents a blank provider failure; no map provider is activated by this decision |
| `OVR-06` | Review evidence location | Keep screenshots and machine-readable results under the isolated prototype `evidence/` folder; review packet and QA remain under candidate documentation | Reproducible for owner and expert review; no production asset import is implied |

## Evidence summary

- Browser matrix: 24/24 route × viewport checks passed at 390, 768, 1024,
  and 1440px after the R9 remediation.
- Interaction checks passed: invalid summary focus, persistence-unavailable
  recovery, success acknowledgement, map retry, and Review → Participant
  handoff.
- Impeccable detector result: `[]` for the Participant shell, Review shell,
  styles, and application state machine.
- Contract test: `7/7`; syntax checks for `app.js`, `fixtures.js`, and
  `server.cjs` passed.
- Assets and checksums are recorded in `ASSET_MANIFEST.md`; only approved local
  Niuva media is rendered.

## Recorded owner response

Recorded 10 August 2026 from the product owner:

```text
OVR-01: accept — Evidence-led Prototyping Editorial remains packet-local; canonical direction remains Experimental Editorial Hybrid.
OVR-02: accept — Home, Projects, one detail state, and Contact only.
OVR-03: accept — Poppins/Inter extension remains candidate-only outside the approved Homepage boundary.
OVR-04: accept — approved ni mark and three manifest-listed project media; provenance owner is Niuva content/brand owner.
OVR-05: accept — explicit map unavailable/retry state; no provider activation.
OVR-06: accept — evidence remains under the isolated prototype evidence/ folder.
```

This response opens the independent critique gate only. It does not promote the
direction, typography boundary, assets, or prototype into canonical or
production authority.

Two exploratory files identified during the audit—`assets/projects/agate-bicycle-
arcade.webp` and `evidence/debug-home.png`—were removed from the isolated
worktree with explicit paths before this packet was finalized. They were never
rendered or listed as approved evidence.

## Owner response format

Record one value for each row before any canonical promotion or production UI
implementation:

```text
OVR-01: accept / replace: ______
OVR-02: accept / expand to: ______
OVR-03: accept / replace boundary: ______
OVR-04: accept / replace evidence set and owner: ______
OVR-05: accept / defer: ______
OVR-06: accept / replace evidence location: ______
```

## Explicit non-authorization

This packet does not authorize production source changes, API/database work,
asset migration, provider activation, canonical register changes, commit,
push, PR, merge, deployment, readiness, go-live, or a moderated session. After
owner review, an independent expert critique remains a separate gate if the
prototype process requires it.
