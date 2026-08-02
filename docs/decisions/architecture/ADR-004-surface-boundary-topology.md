# ADR-004 — Surface Boundary Topology (Route vs Subdomain vs Separate Application)

Status: **Accepted — Option A for MVP (no implementation authority)**
Decision ID: `DEC-ARCH-01`
Decision owner: Project Manager / Product Owner
Technical approver: Acting Technical Owner
Operations acknowledgement: Acting Operations Owner
Proposed date: 24 July 2026
Decision date: 31 July 2026
Approval source: Explicit user approval of `NUF-R01` through `NUF-R12`,
including `NUF-R01` Option A, on 31 July 2026
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

Before this approval, the canonical documents deliberately left **the technical
boundary** between these surfaces open. They did not state whether Retail, B2B, and
Admin Studio would be served as routes within a single frontend application, as
separate host names / subdomains, or as separately deployed frontend applications
behind one identity and platform. No earlier approved document in
`docs/context/DOCUMENT_REGISTER.md` recorded a surface-topology selection.

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

Niuva selects **Option A — single application, route-based surfaces under one
origin for MVP**.

- Public, Retail, customer-account, B2B, and Admin Studio surfaces are delivered
  through one frontend application and one origin, separated by canonical route
  ownership.
- Shared-origin session, origin, cookie, CSRF, and recovery behavior follows the
  applicable approved authentication decisions. No cross-host token handoff is
  introduced for MVP.
- Route guards, code splitting, layout ownership, and operational navigation may
  separate user experience and frontend delivery concerns, but backend handlers,
  services, and ownership-scoped data queries remain the authorization boundary.
- Admin Studio remains an internal operational surface and not a third customer
  journey. Retail Order and B2B Quote/Project remain separate aggregates and state
  machines.
- The canonical MVP route responsibilities are governed by `DEC-UX-003`.
- Selecting this topology does not activate routes or capabilities that are absent,
  disabled, deferred, or provider-gated in current source.
- Option B or C requires a new superseding architecture decision before any
  subdomain, cross-host session, or separate-application work begins.

## Approval Basis and Remaining Implementation Inputs

The MVP selection is based on:

1. the existing single-application, single-origin repository shape;
2. the approved same-origin customer and Admin session directions;
3. the small operating model and the lower deployment, authentication, and support
   burden of one frontend;
4. the active shared design-system and brand guardrail in `DESIGN.md`; and
5. the now-approved Retail product and route scope recorded in `DEC-UX-003`.

The following remain implementation inputs rather than reasons to reopen the MVP
topology:

- exact route-level code splitting and bundle boundaries;
- public-versus-operational CSP, caching, indexing, and exposure rules;
- route-to-layout, route-to-permission, and same-origin deep-link allowlists;
- environment-specific origin, cookie, proxy, TLS, and CSRF validation;
- deployment, monitoring, rollback, and operational handover evidence; and
- any later evidence that justifies a superseding Option B or C decision.

## Consequences

- Canonical planning uses the single-origin route-based topology and the route
  responsibilities in `DEC-UX-003`.
- The former open route/subdomain/separate-application selection is closed for MVP.
- Option B or C remains a possible later superseding decision, not an implementation
  alternative that may be started under this ADR.
- A later Option B or C proposal requires an accompanying cross-host or cross-app
  session/auth design and an explicit brand/identity governance note before any
  source or infrastructure change.
- Frontend co-location does not permit customer/internal code, data, routes, or
  permissions to share unsafe projections or bypass backend authorization.
- Choosing any option does not by itself authorize implementation, provider
  selection, migration, infrastructure procurement, deployment, production
  readiness, or go-live.

## References

- `docs/NIUVA_MASTER_SPEC.md` (§Overview, §5 Product Structure, §4 Authorization)
- `docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md`
- `docs/decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md`
- `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md`
- `docs/implementation/specs/candidates/2026-07-16-retail-order-checkout-foundation-design.md`
- `docs/implementation/specs/candidates/2026-07-24-retail-catalog-discovery-slice-design.md`
- `DESIGN.md` (cross-surface implementation design system)
