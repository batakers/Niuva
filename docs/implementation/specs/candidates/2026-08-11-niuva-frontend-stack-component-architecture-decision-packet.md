# Candidate Frontend Stack and Component Architecture Decision Packet

**Status:** Candidate — `FSA-01` through `FSA-12` owner-accepted —
documentation only; not canonical and not implementation authority

**Date:** 11 August 2026

**Owner decision recorded:** 11 August 2026

**Source baseline:** `origin/main` at
`911866e324d6e011f0352a8a272acf6b7a0ea997`

**Owner direction imported:** Preserve healthy foundations, clarify ownership
before reorganizing files, treat external libraries as references first, and
use an isolated pilot to test the architecture before any canonical promotion.
The owner authorized creation of this candidate packet and explicitly accepted
`FSA-01` through `FSA-12` as candidate planning direction on 11 August 2026.

**Purpose:** Define a bounded candidate for Niuva's frontend stack, component
ownership, external-component intake, motion and performance rules, and
architecture-validation gates without authorizing source or dependency changes.

This packet does not amend [`DESIGN.md`](../../../../DESIGN.md), replace the
existing [Frontend Component Register](../../plans/pending-reconciliation/2026-08-05-frontend-component-register.md),
or authorize implementation. It records the decisions that must be reviewed
before the visual redesign becomes a production workstream.

## 1. Executive disposition

The recommended architecture direction is:

> **Preserve the current Niuva foundation, clarify ownership, adapt external
> techniques locally, and prove the architecture through one bounded pilot
> before promotion or production rollout.**

Niuva should not pursue a generic idea of a "modern stack" by replacing the
framework, build tool, styling system, primitive library, state model, and
component hierarchy during the same redesign.

The candidate instead:

1. retains React, React Router, CRA/CRACO, Tailwind, semantic tokens,
   Radix-based primitives, CVA, Lucide, Sonner, Axios, Zod, GSAP, Recharts, and
   the current test infrastructure during the MVP redesign;
2. keeps `components/ui` limited to domain-neutral presentation and interaction
   contracts;
3. evolves the current surface directories incrementally, without a mass move
   into a speculative replacement folder tree;
4. distinguishes a visual reference, a local adaptation, and a runtime
   dependency;
5. makes CSS the default motion mechanism, GSAP an exception, and Canvas an
   optional enhancement rather than a content foundation;
6. reconciles the existing component register rather than creating a parallel
   register; and
7. uses a centered Public hero pilot to test a later visual foundation only
   after the owner reviews this packet.

## 2. Authority, maturity, and conflict handling

### 2.1 Effective reading order

When this packet conflicts with another source, use this order:

1. [`docs/NIUVA_MASTER_SPEC.md`](../../../NIUVA_MASTER_SPEC.md)
2. [`docs/context/DOCUMENT_REGISTER.md`](../../../context/DOCUMENT_REGISTER.md)
3. [`docs/decisions/DECISION_REGISTER.md`](../../../decisions/DECISION_REGISTER.md)
4. The approved decision or ADR applicable to the surface
5. The applicable runbook
6. [`DESIGN.md`](../../../../DESIGN.md) and current source/tests as active
   implementation guardrails and evidence
7. This packet and other candidate or prototype artifacts

The most relevant approved decisions are:

- [`DEC-UX-001`](../../../decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md)
  — Unified Homepage, B2B-primary, Retail secondary but discoverable;
- [`DEC-UX-002`](../../../decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md)
  — current approved Homepage visual, typography, evidence, and motion
  direction;
- [`DEC-UX-003`](../../../decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md)
  — canonical MVP route and flow ownership;
- [`ADR-004`](../../../decisions/architecture/ADR-004-surface-boundary-topology.md)
  — one application and origin with route-based surface boundaries; and
- [`DEC-OPS-001`](../../../decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md)
  — role-aware, task-oriented, dense-but-calm Admin Studio.

### 2.2 Candidate lifecycle

This packet uses four distinct maturity states:

```text
CANDIDATE
→ reviewed through repository and pilot evidence

ACCEPTED
→ owner accepts the planning direction

PROMOTED
→ applicable canonical and active-guardrail documents are amended

IMPLEMENTED
→ separately approved production slices change source
```

A candidate may be revised or rejected. A successful prototype does not
automatically promote the architecture, and a promoted decision does not
automatically authorize implementation.

### 2.3 Current typography and visual-authority boundary

The current canonical Homepage typography remains Poppins plus Inter under
`DEC-UX-002` and the Master Specification. Owner-approved visual exploration
may test a replacement typography system, but this packet does not select or
promote one.

Likewise, this packet does not set final palette values, motion art direction,
or visual tokens. The official `ni` mark remains required, and Niuva blue
remains the primary identity constraint for the current exploration. Any final
visual replacement requires evidence, owner acceptance, and a separate
promotion or amendment.

### 2.4 Relationship to accepted cross-surface direction

This packet implements the owner-accepted `CSR-01` through `CSR-08` planning
direction from the
[Cross-Surface UX/UI Reconciliation Packet](2026-08-11-niuva-cross-surface-ux-ui-reconciliation-packet.md):

> **One Niuva identity, surface-native composition.**

Public, Retail, customer, authentication, and Admin surfaces may share
semantic foundations without sharing one transferable page template.

## 3. Current repository evidence

The selected baseline contains:

<!-- markdownlint-disable MD013 -->

| Area | Current evidence | Candidate disposition |
| --- | --- | --- |
| Runtime | React `19.0.0`, React DOM `19.0.0`, React Router DOM `7.18.1` | Preserve during MVP redesign |
| Build | CRA through `react-scripts 5.0.1` and CRACO `7.1.0` | Preserve; migration is a separate initiative |
| Styling | Tailwind `3.4.17`, semantic CSS variables, Tailwind semantic mappings | Preserve names and compatibility until an approved migration |
| Accessible primitives | Installed Radix packages plus native HTML | Preserve; add a primitive only for a concrete requirement |
| Component composition | CVA, `clsx`, `tailwind-merge`, internal `components/ui` | Preserve and clarify ownership |
| Feedback and icons | Sonner and Lucide | Preserve |
| Data and validation | Axios, Zod, local state, contexts | Preserve until a demonstrated workflow needs another contract |
| Motion | CSS, GSAP, `@gsap/react`; Framer Motion installed with no current source importer | CSS default; GSAP exception; Framer Motion review only |
| Data visualization | Recharts with bounded current consumers | Preserve for factual operational data only |
| Verification | Jest/RTL, Playwright, axe, release contracts, bundle checks | Preserve and extend proportionally |

<!-- markdownlint-enable MD013 -->

The current component directories are:

```text
frontend/src/components/
├── admin/
├── auth/
├── brand/
├── layout/
├── operational/
├── retail/
└── ui/
```

At this baseline, `components/ui` contains 29 files and has broad active use.
The `operational` directory contains the lifecycle-bounded
`LegacyOrderStatusBadge` and `StatusStepper`; it is not a generic owner for all
new customer or operational experiences. The component register already marks
these contracts as Legacy Order-specific.

The current `Drawer` remains quarantined: it has no current importer and imports
undeclared `vaul`. Framer Motion remains installed but has no current source
importer. These facts identify later cleanup candidates; they do not authorize
deletion or dependency changes.

## 4. Candidate architecture decisions

All `FSA-*` identifiers are local to this packet. Selecting them accepts a
planning direction only.

<!-- markdownlint-disable MD013 -->

| ID | Candidate decision | Recommended selection | Consequence |
| --- | --- | --- | --- |
| `FSA-01` | MVP frontend foundation | Preserve the current React/Router, CRA/CRACO, Tailwind, semantic-token, Radix/CVA, Lucide, Sonner, Axios, Zod, GSAP, Recharts, and test foundation | Visual work does not become a framework migration |
| `FSA-02` | General-purpose UI framework | Do not add MUI, Ant Design, Chakra, Mantine, or another parallel UI framework without a separate architecture decision | Niuva keeps one primitive vocabulary and avoids duplicate focus/style contracts |
| `FSA-03` | Component dependency direction | Tokens → `components/ui` → bounded surface/domain composition → route pages; feature modules may be introduced only under section 6 | Shared primitives cannot acquire route, API, permission, or lifecycle ownership |
| `FSA-04` | Directory evolution | Keep current directories and correct ownership incrementally; no mass folder reorganization | The redesign remains reviewable and regressions remain attributable |
| `FSA-05` | External component intake | Treat reference, local adaptation, and runtime dependency as separate dispositions; default to reference first | A third-party catalog cannot silently become the Niuva design system |
| `FSA-06` | Motion mechanism | CSS is default; GSAP is a bounded exception for signature editorial choreography; Canvas/RAF is progressive enhancement; Framer Motion remains a cleanup candidate only | Engineers receive one default and explicit exceptions |
| `FSA-07` | Canvas and signature visual contract | A signature field must remain decorative/supporting, preserve a complete static experience, and meet section 8 evidence | The hero never depends on animation for content, navigation, status, or action |
| `FSA-08` | Form, client state, and server state | Preserve current local/context state, Axios, and Zod; introduce React Hook Form, Redux, Zustand, or TanStack Query only through a separately justified decision | New libraries follow demonstrated workflow complexity rather than fashion |
| `FSA-09` | Component register | Reconcile the existing register; do not create a replacement register | Adoption, provisional, quarantine, provenance, and removal history remain in one place |
| `FSA-10` | Responsive and visual evidence | Use 390/768/1024/1440 as review viewports and 320 as a resilience floor; add stable screenshot baselines only after fonts/tokens stabilize | Mobile design and minimum-width resilience have different obligations |
| `FSA-11` | Pilot and promotion gate | Use one centered Public hero as an isolated architecture and visual-foundation pilot; review it before any `DESIGN.md` amendment | A prototype may prove, revise, or reject the candidate |
| `FSA-12` | Cleanup and infrastructure | Handle Drawer/`vaul`, Framer Motion, Vite, Tailwind upgrades, and other cleanup in separate audited tasks | Candidate language cannot be interpreted as removal or migration authorization |

<!-- markdownlint-enable MD013 -->

### 4.1 Recorded owner response

```text
FSA-01: accept
FSA-02: accept
FSA-03: accept
FSA-04: accept
FSA-05: accept
FSA-06: accept
FSA-07: accept
FSA-08: accept
FSA-09: accept
FSA-10: accept
FSA-11: accept
FSA-12: accept
```

The owner explicitly accepted all 12 selections as candidate planning direction
on 11 August 2026. The approval explicitly excludes publication, source or
dependency changes, canonical amendment, commit, push, PR, deployment,
readiness, and go-live.

## 5. Component ownership and dependency rules

### 5.1 Layer responsibilities

```text
semantic CSS tokens
→ Tailwind semantic mappings
→ components/ui
→ layout and bounded surface/domain components
→ optional business feature modules
→ route pages
```

#### Semantic foundation

`frontend/src/index.css` and `frontend/tailwind.config.js` own semantic visual
roles and compatibility mappings. A future visual-foundation amendment may
change approved values, but components must continue to consume semantic roles
rather than create a parallel palette, typography scale, radius system, or
motion system.

#### `components/ui`

`components/ui` owns domain-neutral presentation and interaction contracts. It
may own variants, responsive presentation, semantics, keyboard behavior,
focus, validation presentation, and reduced-motion behavior.

It must not:

- make route or redirect decisions;
- call APIs or own server caching;
- encode Retail Order, B2B, Portfolio, Work Order, CMS, or other lifecycle
  transitions;
- decide permissions or customer-safe projections;
- import a page, surface, or business feature; or
- become the landing place for a component merely because ownership is unclear.

#### `components/layout`

`components/layout` owns reusable shells and layout orchestration. A shared
shell may compose separate Public and operational navigation contracts; shared
placement does not merge information architecture or permissions.

#### Surface and domain components

The existing `brand`, `auth`, `retail`, `operational`, and `admin` directories
compose shared primitives for bounded experiences:

- `brand` owns Public, marketing, portfolio, and evidence-led expression;
- `auth` owns audience-aware authentication and recovery presentation;
- `retail` owns product discovery, configuration, and commerce presentation;
- `operational` currently owns retained Legacy Order compatibility components,
  not a universal operational design system;
- `admin` owns role- and task-oriented operator compositions; and
- `customer` is a reserved future directory and should be created only when
  customer-owned components no longer fit a page-local bounded slice.

There is no default `shared`, `common`, or `misc` component directory. A
component with unclear ownership must be classified before reuse.

#### Route pages

Pages own route state, data loading, mutations, permission-aware orchestration,
and page composition. Pages may compose lower layers but must not duplicate a
primitive's implementation or become the global authority for a lifecycle.

### 5.2 Direction rules

Examples:

```text
Button
✓ may know semantic action variants and accessible interaction
✗ must not know Order, CMS, or configurator state

PublicHeroField
✓ may use Button and semantic tokens
✓ belongs to components/brand when approved
✗ must not become a global ui primitive

LegacyOrderStatusBadge
✓ may use Badge
✓ may own only Legacy Order status-to-tone mapping
✗ must not absorb Retail Order or B2B states

OrderDetailPage
✓ may compose lifecycle-owned status, actions, and route data
✗ must not redefine Button, Badge, or permission contracts
```

Shared appearance never merges lifecycle meaning. Status labels, allowed
transitions, customer-safe wording, and audit behavior remain owned by their
applicable domain.

## 6. Threshold for a `features/` module

Niuva does not create a `features/` directory merely to reorganize components.
A bounded feature module becomes justified when one workflow has several of:

- business state across multiple components or routes;
- API orchestration or mutation coordination;
- domain validation beyond presentation;
- retry, idempotency, stale, conflict, permission, or recovery behavior;
- multiple domain components with one lifecycle owner; and
- a stable public module boundary with focused tests.

Likely future candidates include configurator, checkout, Order tracking,
inventory, and authentication workflow. A hero, navbar, footer, button, or
static section is not a business feature.

Feature modules may import shared UI contracts and bounded data/API clients.
They must not import route pages, create a second token system, or make UI
visibility the authorization boundary.

## 7. External component intake and provenance

### 7.1 Three distinct dispositions

```text
REFERENCE
→ study an idea, behavior, or visual technique; no source or runtime dependency

LOCAL ADAPTATION
→ reuse or translate reviewed source/technique into a Niuva-owned component

RUNTIME DEPENDENCY
→ Niuva's runtime or build directly depends on an external package
```

Default policy:

- reference: permitted within task scope;
- local adaptation: permitted only after review and within explicit edit scope;
- new runtime dependency: requires concrete need, dependency review, and
  separate approval.

React Bits, Magic UI, Motion Primitives, Kokonut UI, Animate UI, Aceternity,
and similar catalogs are reference or implementation sources by default. None
becomes Niuva's design system merely because a component looks polished.

### 7.2 Intake record

Each adapted external component must record, in the existing component register
or its approved task evidence:

<!-- markdownlint-disable MD013 -->

| Field | Required evidence |
| --- | --- |
| Source | URL, project, original component, and review date |
| License and provenance | Applicable license, attribution or notice requirement, and source revision when available |
| Dependency impact | Required packages, transitive/browser cost, and whether a local dependency-free adaptation is feasible |
| Accessibility | Semantics, keyboard/focus, labels, contrast, assistive behavior, and failure mode |
| Motion | Purpose, reduced-motion behavior, interruption/cancellation, and offscreen behavior |
| Performance | Rendering mechanism, bundle delta, mobile/GPU risk, and lazy/visibility strategy |
| Adaptation | What was retained, replaced, simplified, or rewritten for Niuva |
| Ownership | Final Niuva layer, owner surface/lifecycle, and status |

<!-- markdownlint-enable MD013 -->

An adapted component enters as `Provisional` unless its contract, tests,
consumers, and ownership support another status. An experiment is not
`Adopted` merely because its file exists.

## 8. Motion, Canvas, and performance contract

### 8.1 Tool selection

<!-- markdownlint-disable MD013 -->

| Interaction | Default mechanism | Constraint |
| --- | --- | --- |
| Hover, focus, active, disabled | CSS | Animate supported properties and preserve visible state |
| Button, input, disclosure, simple enter/exit | CSS | Avoid `transition: all` and layout-shifting feedback |
| Signature Public editorial sequence | GSAP by exception | Must explain hierarchy, process, continuity, or media state |
| Complex approved scroll choreography | GSAP by exception | Must remain interruptible, bounded, and reduced-motion safe |
| Decorative FDM field or similar rendering | Canvas/RAF as progressive enhancement | Static hero remains complete without it |
| Application-state animation | Not selected by this packet | Requires a concrete state-transition need |
| Framer Motion | Candidate for separate dependency review | No removal or new canonical use is authorized here |

<!-- markdownlint-enable MD013 -->

### 8.2 Canvas contract

A Canvas layer must never carry semantic information. It may be decorative,
atmospheric, or supporting, but never the only representation of:

- content or project evidence;
- navigation or an action;
- validation, status, progress, price, ETA, or availability; or
- a required interaction.

The underlying hero must contain complete HTML typography, actions, layout, and
a static visual base. A Canvas enhancement must:

- respect `prefers-reduced-motion` with a complete static result;
- use a simplified or disabled behavior on constrained mobile devices;
- cap rendering pixel density instead of scaling without bound;
- pause when the document is hidden and when the visual is meaningfully
  offscreen;
- remain non-interactive and `pointer-events: none` unless a separately
  approved interaction requires otherwise;
- be hidden from assistive technology when decorative; and
- fail without blocking content, layout, or actions.

### 8.3 Performance policy and evidence

<!-- markdownlint-disable MD013 -->

| Policy | Minimum evidence before production use |
| --- | --- |
| At most one prominent signature animated system in the first viewport | Source/DOM inspection plus desktop and mobile screenshots |
| No WebGL, Three.js, or OGL dependency by default | `package.json`, lockfile, and bundle-diff inspection |
| Static and reduced-motion experience is complete | Browser emulation plus semantic-content/action comparison |
| Offscreen or hidden animation pauses | Visibility/intersection behavior inspection and browser check |
| Mobile behavior is simplified where needed | 390px runtime and screenshot evidence on representative hardware when available |
| Below-the-fold effects activate only when useful | Visibility/lazy behavior inspection |
| Bundle impact remains governed | Existing bundle report, bundle contract, and dependency audit |
| Animation is not semantic authority | Canvas-disabled or JavaScript-failure inspection |

<!-- markdownlint-enable MD013 -->

This packet does not invent new LCP, INP, FPS, or bundle thresholds. Exact
threshold changes require measurement against the existing release and bundle
contracts.

## 9. Form, state, and data policy

The current default remains:

- semantic native form behavior and controlled React state;
- current Niuva form primitives for labels, fields, errors, disabled/loading,
  and recovery;
- Zod where schema validation is justified;
- local state first and Context for genuinely shared application state;
- Axios as the current transport; and
- server authority for price, eligibility, stock, payment, permission, and
  lifecycle commitments.

This packet does not select React Hook Form, Redux, Zustand, or TanStack Query.
TanStack Query may become appropriate when real API-backed Order tracking,
inventory, customer Orders, operator mutations, cache invalidation, pagination,
or refetch behavior demonstrates a shared server-state contract. That decision
must define adoption scope, invalidation, error/retry behavior, compatibility,
and migration—not merely cite common industry use.

Client state and animations never become authority for payment, inventory,
pricing, upload, authentication, permission, or workflow state.

## 10. Component register reconciliation

The existing Frontend Component Register remains the one implementation
inventory. A later reconciliation should update it in place rather than create
`Component Register v2`.

The existing states remain useful:

- `Adopted` — current consumers and a bounded reusable contract exist;
- `Adopted, restricted` — use is allowed only for the recorded meaning;
- `Provisional` — file or candidate contract exists but adoption evidence is
  incomplete;
- `Quarantined` — do not import, repair by dependency addition, or delete
  without a separate decision; and
- future `Deprecated` or `Remove` states — require replacement/consumer and
  cleanup evidence before removal.

The later reconciliation may add only useful metadata:

- owner layer or lifecycle;
- provenance and license note for an adaptation;
- dependency note;
- motion category;
- last reviewed baseline; and
- canonical replacement or removal prerequisite.

It must also reconcile the current historical baseline wording and distinguish
390px as the canonical mobile review viewport from 320px as a resilience floor.

## 11. Responsive, accessibility, and visual-regression evidence

### 11.1 Viewport contract

```text
390px  → canonical mobile design review
768px  → tablet review
1024px → laptop review
1440px → desktop review
320px  → minimum resilience check, not a pixel-perfect design baseline
```

At 320px, the minimum requirements are:

- no unintended horizontal overflow;
- no broken or unreachable navigation;
- no clipped critical status, error, price, or next action; and
- no inaccessible recovery path.

### 11.2 Verification layers

Later implementation work must use proportional evidence:

1. source and contract tests for component ownership and lifecycle behavior;
2. Jest/RTL for deterministic component and state behavior;
3. Playwright for route, interaction, keyboard, focus, recovery, responsive,
   and network evidence;
4. axe plus manual semantic and contrast review;
5. screenshots at canonical viewports for composition critique; and
6. Impeccable anti-template and visual-quality review for broad visual work.

Playwright screenshot regression should begin with a small stable route/state
set only after font loading, typography, tokens, assets, browser version, and
capture environment are deterministic. Before that point, screenshots are
review evidence rather than brittle pixel-golden authority.

Screenshot approval never proves API, database, provider, authorization,
production performance, or go-live readiness.

## 12. Non-goals

This candidate does **not** authorize:

- CRA-to-Vite migration;
- a Tailwind major upgrade or token migration;
- mass folder moves or renames;
- replacement of Radix or current accessible primitives;
- a second general-purpose UI framework;
- React Hook Form, Redux, Zustand, or TanStack Query introduction;
- Framer Motion removal or new canonical use;
- GSAP replacement;
- WebGL, Three.js, OGL, or another graphics dependency;
- `vaul` installation or `Drawer` removal;
- new font installation or typography promotion;
- final palette or visual-token selection;
- `DESIGN.md`, Master Specification, or register amendment;
- production visual redesign or route implementation;
- API, database, schema, permission, provider, migration, or deployment work;
- readiness, go-live, or moderated-research authorization; or
- commit, push, PR, or merge authorization.

Each item requires a separately scoped and approved task where applicable.

## 13. Pilot and promotion sequence

The recommended sequence after owner review is:

```text
01  Owner review of FSA-01 through FSA-12
02  Reconcile the existing component register as candidate evidence
03  Prepare candidate typography, palette, tokens, and motion grammar
04  Build one isolated centered Public hero pilot
05  Validate browser, responsive, accessibility, reduced motion,
    performance, provenance, and anti-template specificity
06  Conduct a decision review: accept, revise, or reject
07  Prepare a separate canonical promotion/amendment request
08  Create incremental production task cards per surface
```

The hero is a pilot, not a production shortcut. Its purpose is to test:

- typography roles;
- blue-led palette behavior;
- semantic token viability;
- centered composition;
- motion grammar and static fallback;
- responsive behavior;
- component ownership;
- asset and provenance handling; and
- performance evidence.

Public pilot success does not authorize copying its composition into Retail,
customer, authentication, or Admin surfaces.

## 14. Packet validation and exit criteria

Before this packet is eligible for publication review:

- the source baseline matches the selected `origin/main` SHA;
- every dependency claim matches `frontend/package.json` and current import
  evidence;
- component ownership reflects current directories and the existing register;
- `operational` is not silently renamed or generalized;
- the current canonical typography conflict is explicit;
- all local links resolve;
- every non-goal is preserved;
- no candidate cleanup is written as an authorized action;
- Markdown structure and whitespace checks pass; and
- the diff contains only this documentation file.

The owner accepted `FSA-01` through `FSA-12` after this validation. Any later
revision, rejection, publication, promotion, or implementation remains a
separate action.

## 15. Traceability

<!-- markdownlint-disable MD013 -->

| Concern | Governing or supporting source |
| --- | --- |
| Product, surface, lifecycle, and implementation boundaries | [`docs/NIUVA_MASTER_SPEC.md`](../../../NIUVA_MASTER_SPEC.md) |
| Document status and authority | [`docs/context/DOCUMENT_REGISTER.md`](../../../context/DOCUMENT_REGISTER.md), [`docs/decisions/DECISION_REGISTER.md`](../../../decisions/DECISION_REGISTER.md) |
| Active frontend design and component guardrail | [`DESIGN.md`](../../../../DESIGN.md) |
| Unified B2B-primary Homepage | [`DEC-UX-001`](../../../decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md) |
| Current Homepage visual, typography, evidence, and motion authority | [`DEC-UX-002`](../../../decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md) |
| Canonical routes and journey ownership | [`DEC-UX-003`](../../../decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md) |
| One-origin route topology | [`ADR-004`](../../../decisions/architecture/ADR-004-surface-boundary-topology.md) |
| Admin operational direction | [`DEC-OPS-001`](../../../decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md) |
| Owner-accepted cross-surface adaptation direction | [`2026-08-11-niuva-cross-surface-ux-ui-reconciliation-packet.md`](2026-08-11-niuva-cross-surface-ux-ui-reconciliation-packet.md) |
| Existing component adoption and quarantine evidence | [`2026-08-05-frontend-component-register.md`](../../plans/pending-reconciliation/2026-08-05-frontend-component-register.md) |
| Current dependency evidence | `frontend/package.json` at the named baseline |
| Current component and import evidence | `frontend/src/components/` and current source at the named baseline |

<!-- markdownlint-enable MD013 -->

## 16. Current verdict and next gate

**Verdict: OWNER REVIEW PASSED — CANDIDATE DOCUMENTATION ONLY.**

The packet is sufficiently bounded to decide the frontend stack and component
architecture direction without authorizing a broad rewrite. `FSA-01` through
`FSA-12` are owner-accepted candidate planning direction.

The next action still requires a separate instruction: publish this packet, or
prepare the bounded reconciliation of the existing component register as
candidate evidence. Neither action is inferred from owner acceptance. Building
the pilot, amending canonical documentation, changing source or dependencies,
committing, pushing, opening or merging a PR, deploying, or claiming readiness
or go-live also remain unauthorized.
