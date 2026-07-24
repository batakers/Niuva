# ADR-004 — Surface Boundary Topology (Route vs Subdomain vs Separate Application)

Status: **Proposed — Open Decision (no architecture change authorized)**
Decision ID: `DEC-ARCH-01` (proposed)
Decision owner: Project Manager / Product Owner
Technical approver: Acting Technical Owner
Operations acknowledgement: Acting Operations Owner
Proposed date: 24 July 2026
Approval source: Not yet approved. This ADR only formalizes an open decision for later resolution.
Related baseline: `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md`
Canonical authority: `docs/NIUVA_MASTER_SPEC.md`; `docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md`
Decision log: `docs/decisions/product/DECISION_LOG_Platform_Niuva_v2_1.md`

## Context

Niuva is approved as **one website and one operational platform** with two customer
journeys (Retail and Business/B2B) plus one shared operational environment (Admin
Studio). This is fixed by `docs/NIUVA_MASTER_SPEC.md` §Overview and §5 Product
Structure, and by `DEC-UX-001` ("Retail and B2B remain part of one website and one
identity rather than separate products or unrelated sub-sites").

The product structure defines three experience surfaces:

```text
Public Website
├── Shared Brand/Company
├── Retail
└── Business/B2B

Authenticated
├── Retail Account
├── B2B Organization Portal
└── Admin Studio (CMS + Operations Back-office)
```

Admin Studio is explicitly **not a third customer journey**; it is the shared
operational environment for authorized staff (Master Spec §5).

The canonical documents deliberately leave **the technical boundary** between these
surfaces open. They do not state whether Retail, B2B, and Admin Studio are served as
routes within a single frontend application, as separate host names / subdomains, or
as separately deployed frontend applications behind one identity and platform. No
approved document in `docs/context/DOCUMENT_REGISTER.md` records a surface-topology
decision.

Today the repository ships a single React application (`frontend/`) with route groups
for marketing, operational, and admin surfaces (`frontend/src/App.js`), backed by one
FastAPI service (`backend/server.py`). Any move toward subdomains or separate
applications would be a new architecture decision, not a continuation of the current
implementation.

## Decision Question

How are the three experience surfaces (Retail, B2B, Admin Studio) delivered
technically, while preserving the approved "one website, one identity, one platform"
constraint and the separate Retail Order and B2B Quote/Project lifecycles?

## Options

### Option A — Single application, route-based surfaces (current shape)

All surfaces are served by one frontend application under one origin, separated by
route prefixes (for example `/`, Retail routes, `/admin`). Code splitting and route
guards separate concerns. This is the shape the repository already has.

- Pros: one deploy, one session/auth origin, no cross-host session design, lowest
  operational cost, matches "one website" literally, least new infrastructure.
- Cons: a single bundle mixes public and operational code unless split carefully;
  weaker physical isolation between public and staff surfaces; blast radius of a
  frontend change spans all surfaces.

### Option B — Single identity, subdomain-separated surfaces

Surfaces are served under distinct host names (illustrative only, not approved names:
a public host, a Retail host, an Admin host) that share one identity and one backend
platform.

- Pros: clearer physical separation of public vs operational surfaces; independent
  caching, CSP, and edge policy per host; independent frontend deploys.
- Cons: requires an explicit cross-host session/auth design (cookie domain scoping,
  SameSite, CSRF, token handoff); more DNS/TLS/CORS operational surface; risks
  implying "separate products" if brand and navigation are not governed; must not
  contradict "one website and one identity".

### Option C — Separate frontend applications behind one platform

Each surface is a separately built and deployed frontend application, consuming the
same identity and backend contracts, composed under one website experience (single
origin via reverse proxy, or subdomains as in Option B).

- Pros: strongest code and deploy isolation; independent release cadence per surface;
  team/ownership boundaries are explicit.
- Cons: highest build/deploy/operational complexity for a three-person operating
  model; most duplication of shared UI, tokens, and identity plumbing; strongest risk
  of surface drift and of eroding one-identity/one-website perception; cross-app
  session and shared design-system governance become hard requirements.

## Constraints (from canonical authority)

- One website and one identity must be preserved. No option may present Retail, B2B,
  or Admin as separate products or unrelated sub-sites (`DEC-UX-001`).
- Retail Order and B2B Quote/Project remain separate aggregates and state machines
  regardless of topology (Master Spec §Overview).
- Admin Studio must remain clearly separated from the public experience but must not
  become a third customer journey (Master Spec §5).
- Authorization is enforced in backend handlers, services, and data queries. Surface
  topology is not an authorization boundary; hiding a surface is a usability measure,
  not access control (Master Spec §4).
- No marketplace-first, multi-vendor, or merchandise-led identity may be introduced by
  any topology choice (`DEC-UX-001`; Master Spec §Retail positioning).
- Provider, deployment infrastructure, and go-live remain governed by their own gates
  and are not resolved here.

## Decision

**Deferred.** No topology is selected. This ADR records the options, constraints, and
the decision inputs required before a choice can be made. Until this ADR is approved,
the current single-application route-based shape (Option A) remains the de facto
implementation, and no subdomain or separate-application work is authorized.

## Decision Inputs Required Before Approval

1. Cross-surface session and authentication model (single-origin cookie vs cross-host
   token handoff) and its CSRF/SameSite implications.
2. Deployment and operations budget for the three-person operating model.
3. Shared design-system and brand-governance mechanism that keeps "one identity"
   true across whatever boundary is chosen (`DESIGN.md` is the active cross-surface
   guardrail).
4. Public-vs-operational isolation requirements (CSP, edge caching, exposure of the
   Admin surface).
5. The first approved Retail vertical slice scope, since the minimum viable Retail
   surface should inform, not follow, the topology commitment.

## Consequences

- Future canonical documents may reference this ADR as the home for the surface-
  topology decision, keeping it out of ad hoc conversation.
- Selecting Option B or C will require an accompanying cross-host or cross-app
  session/auth design and an explicit brand/identity governance note before any
  source or infrastructure change.
- Choosing any option does not by itself authorize implementation, provider
  selection, infrastructure procurement, or go-live.

## References

- `docs/NIUVA_MASTER_SPEC.md` (§Overview, §5 Product Structure, §4 Authorization)
- `docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md`
- `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md`
- `docs/implementation/specs/candidates/2026-07-16-retail-order-checkout-foundation-design.md`
- `docs/implementation/specs/candidates/2026-07-24-retail-catalog-discovery-slice-design.md`
- `DESIGN.md` (cross-surface implementation design system)
