# NDS 2.0 Gate 2 Lane A - Public Task Card

Status: **LOCAL IMPLEMENTATION VERIFIED - SHARED INTEGRATION GATE REQUIRED**

## Identity and baseline

- **Product owner:** Faiz
- **Surface owner and Driver:** Faiz with Codex assistance
- **Branch:** `feat/niuva-gate2-lane-a-public`
- **Worktree:** `C:\tmp\niuva-gate2-lane-a-public-20260813`
- **Selected baseline:** `origin/main` at
  `3fe2aecdc2aad0ab5f962ae8283965b7da8ec98d`
- **Foundation dependency:** PR #238 merged before this branch was created
- **Prepared:** 13 August 2026, Asia/Jakarta
- **Authorization:** exact-file Homepage R4 implementation approved by the
  product owner on 13 August 2026. Dependency changes, shared integration
  files, commit, push, PR, merge, deployment, readiness, and go-live remain
  separate gates.

The three Gate 2 lanes are owned by the same person. They are parallel in file
ownership and backlog structure, but execution is time-sliced. Only one Driver
may modify a shared integration file at a time.

## Objective

Adapt the accepted Homepage R4 direction into the current React application as
the first bounded Public production pilot. Preserve current route, CMS-content,
ID/EN, SEO, loading/error, accessibility, and lifecycle contracts. Remaining
Public routes start only after the Homepage slice is reviewed and merged.

## Authority and workflow

Authority is resolved in this order:

1. [`NIUVA_MASTER_SPEC.md`](../../../NIUVA_MASTER_SPEC.md)
2. [`DOCUMENT_REGISTER.md`](../../../context/DOCUMENT_REGISTER.md)
3. [`DECISION_REGISTER.md`](../../../decisions/DECISION_REGISTER.md)
4. [`DEC-UX-004`](../../../decisions/experience/DEC-UX-004-cross-surface-design-system-reconstruction.md)
5. [`DEC-UX-001`](../../../decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md)
6. [`DEC-UX-003`](../../../decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md)
7. [`DESIGN.md`](../../../../DESIGN.md)
8. [Frontend Component Register](2026-08-05-frontend-component-register.md)
9. [Homepage R4 evidence](../../prototypes/2026-08-12-niuva-homepage-r4-prototype/README.md)
10. Current source and tests

Execution workflow:

1. Niuva authority and source define product truth.
2. Impeccable is the primary visual workflow and quality gate.
3. Owl Listener guidance checks governance, tokens, component contracts, and
   documentation completeness.
4. Taste red-teams Public specificity using first-order, second-order, and
   logo-hidden anti-template checks.
5. Emil Design Engineering checks interaction purpose, easing, reduced motion,
   interruptibility, and performance.
6. Plugin87 contributes only adapted advisory checks. It is not installed into
   this repository.

## Lane boundary

### Lane-owned area

- Public and marketing route compositions under
  `frontend/src/pages/marketing/`.
- New Public-only compositions under a bounded Public or marketing component
  directory when separately approved.
- Authentic Public media and component-specific presentation assets with
  recorded provenance.
- Public route tests and browser evidence for the affected slice.

Lane A does not edit Auth, Retail, Customer, Admin, backend, provider, payment,
database, or deployment domains.

### Initial Homepage candidate paths

The first implementation authorization request must select exact paths from
this set. Listing them here does not authorize edits.

- `frontend/src/pages/marketing/HomePage.jsx`
- `frontend/src/pages/marketing/HomePage.contract.test.js`
- `frontend/src/lib/content.js`
- `frontend/src/lib/content.test.jsx`
- bounded new Homepage-only component and test files, if decomposition is
  justified before implementation
- bounded authentic Public assets with provenance, if current approved assets
  cannot be reused directly

### Authorized exact paths

The implementation gate is limited to these paths:

- `frontend/src/pages/marketing/HomePage.jsx`;
- `frontend/src/pages/marketing/HomePage.contract.test.js`;
- `frontend/src/pages/marketing/home/HomePageVisuals.jsx`;
- `frontend/src/pages/marketing/home/HomePageR4.css`;
- `frontend/src/pages/marketing/home/HomePage.test.jsx`;
- `frontend/src/components/layout/Footer.jsx`;
- `frontend/src/components/layout/Footer.test.jsx`; and
- this task card.

No asset copy is authorized because the current approved project assets and
the official shared mark can be reused. `frontend/src/lib/content.js` and its
test remain unchanged because the current Homepage is explicitly hardcoded and
has no approved Homepage CMS schema.

### Shared integration paths held by default

The following are not Lane A-owned despite affecting the final Homepage:

- `frontend/src/index.css`
- `frontend/tailwind.config.js`
- `frontend/public/fonts/niuva/`
- `frontend/src/components/ui/`
- `frontend/src/App.js`
- `frontend/src/components/layout/Navbar.jsx`
- `frontend/src/components/layout/Layout.jsx`
- `frontend/src/components/layout/PublicNavigation.jsx`
- `frontend/src/components/layout/OperationalNavigation.jsx`
- `frontend/src/components/layout/navigationStyles.js`
- global i18n, SEO generation, sitemap, and build configuration

`Footer.jsx` and its new proportional test are the only shared-integration
exception authorized after the first local browser review. Every other shared
path above remains held.

If R4 adaptation proves that one of these must change, stop and prepare one
small shared-foundation or integration proposal. Do not copy tokens, navigation,
footer, i18n, or primitive behavior into a page-local substitute.

## First bounded slice

1. Reconcile current Homepage content and state imports against R4 evidence.
2. Adapt the centered hero, one complete FDM contour identity gesture, the
   separate five-stage process rail, three macro chapters, and factual Project
   evidence.
3. Preserve four Services at equal rank and the B2B-primary, Retail-secondary
   journey hierarchy.
4. Preserve the two-door Retail bridge plus separate Rental/Self Service row
   without activating unavailable transaction paths.
5. Keep the Homepage Contact summary separate from the full Contact form.
6. Preserve conversational FAQ, terminal closing canvas, and factual asset
   captions without copying the standalone prototype server.

The implementation must adapt R4 to React, current content sources, and NDS 2.0
contracts. It must not paste prototype HTML/JavaScript wholesale.

## Preserved contracts

- Current Public route and compatibility aliases remain unchanged unless a
  separately approved route task authorizes migration.
- Indonesian and English content behavior, canonical metadata, and fallback
  rules remain intact.
- Four primary Services remain equal: Research & Development, Consultant &
  Workshop, Design & Prototyping, and Apparel & Merchandise.
- The official `ni` mark and text `Niuva` remain the primary navigation identity.
- The FDM contour is an identity gesture, not telemetry, capacity, progress, or
  production evidence.
- B2B Inquiry, Retail Order, quote-required, Auth, and provider boundaries are
  unchanged.

## Acceptance criteria for a later implementation gate

1. Homepage functionality and content contracts pass without route, CMS, SEO,
   locale, or action regressions.
2. Existing NDS 2.0 tokens and primitives are reused; no page-local substitute
   design system is introduced.
3. First-order, second-order, and logo-hidden anti-template checks pass.
4. Default, focus, loading, content-unavailable, error, recovery, and success
   states are visible where the current Homepage lifecycle supports them.
5. Browser evidence covers 320, 390, 768, 1024, and 1440 pixels; 390 is the
   design baseline and 320 is the resilience floor.
6. Keyboard, visible focus, semantic landmarks, zoom/reflow, reduced motion,
   target size, contrast, overflow, and asset integrity pass.
7. FDM motion is CSS-first or uses the already approved bounded mechanism,
   pauses when appropriate, and has a complete reduced-motion result.
8. Impeccable detector and screenshot critique report no open P0/P1 finding.
9. Focused tests plus the proportional frontend suite and production build pass.
10. No dependency, provider, route activation, deployment, readiness, or
    go-live claim is introduced.

## Rollback and handover

- **Rollback trigger:** route, CMS/content, locale, SEO, action, focus,
  accessibility, visual P0/P1, or build regression.
- **Recoverable action:** revert only the bounded Homepage slice while retaining
  the merged NDS 2.0 foundation.
- **Handover evidence:** exact changed paths, route/content map, tests, browser
  matrix, screenshot critique, detector result, asset provenance, open P2/P3,
  and rollback reference.

## Local implementation evidence - 13 August 2026

Exactly the eight authorized paths are changed or untracked. The only shared
integration change is the bounded Footer variant and its test. Lane B, Lane C,
all other shared integration files, backend, provider, payment, database, and
deployment areas remain unchanged.

Verification completed against the selected baseline:

- focused Homepage, Footer, and Layout tests: 4 suites, 16 tests passed;
- proportional frontend suite: 66 suites, 408 tests passed;
- optimized production build and report-only bundle measurement: passed;
- Impeccable detector, executed once against the final Homepage and Footer
  source:
  `[]`;
- browser matrix at 320, 390, 768, 1024, and 1440 pixels: HTTP 200, no
  horizontal overflow, no undersized visible controls, no broken project
  media after lazy-load completion, and no page or network failure after the
  unauthenticated `/api/auth/me` response was isolated by the harness;
- Axe WCAG A/AA checks at 390 and 1440 pixels: zero violations;
- keyboard first target: `Lewati ke konten`; FAQ disclosure interaction passed;
- Mona Sans and Bona Nova delivery: both loaded;
- FDM contour: running at 15 seconds through transform-only animation when
  visible; static when reduced motion is requested; and
- Homepage terminal Footer confirmation at 390 and 1440 pixels: Closing and
  Footer use the same semantic evidence surface, have a `0px` join delta, no
  horizontal overflow, no target below 44 pixels, no console/network failure,
  and zero scoped Axe violations; `/about` retains the legacy Footer; and
- source diff whitespace check: passed.

Finish review results:

- **Owl/governance:** PASS. The slice uses NDS 2.0 semantic aliases and the
  shared Button primitive, keeps four Services at equal rank, and creates no
  page-local palette, dependency, route, provider, or lifecycle contract.
- **Taste/Public specificity:** PASS. Without the logo, the centered thesis,
  FDM contour, five-stage process, three evidence chapters, factual project
  media, four equal Services, and separate Retail doors remain recognizably
  Niuva rather than a transferable agency or SaaS template.
- **Emil/motion:** PASS. Motion is limited to the identity contour and direct
  interaction feedback, uses transform only, pauses when the contour is not
  active, respects document visibility and reduced motion, and does not add a
  continuous React render loop.

The first browser run inspected lazy images before all of them had entered the
viewport and reported two false broken-image readings. Focused response and
natural-dimension evidence confirmed all three approved project assets return
HTTP 200 and render correctly. No source remediation was needed.

## Shared Footer integration - owner-authorized and locally verified

The Homepage now receives a minimal terminal Footer from the existing shared
component. It joins the dark Closing canvas without a light break, uses the
official BrandIdentity and semantic NDS 2.0 tokens, and presents one adaptive
desktop row or two mobile rows. Every other route retains the previous light
multi-column Footer.

The integration adds no route, locale, dependency, provider, or lifecycle
behavior and does not imitate the Footer inside `HomePage.jsx`.

Two lower-priority shared follow-ups remain outside Lane A: the legacy remote
Poppins/Inter/JetBrains font request is still emitted globally despite the R4
surface using self-hosted NDS fonts, and Public navigation still uses the
currently active route labels and aliases. Both require their own shared-file
or route-migration gates.

## Stop rule and next gate

The authorized local implementation has stopped after the bounded Homepage and
Footer slice, proportional automated checks, one batched browser review, and
one focused confirmation. It does not authorize commit, push, PR, merge,
remaining Public routes, additional shared integration changes, provider
activation, deployment, readiness, or go-live.

The next recommended gate is a separate publication review for these eight
paths. Navbar mega-menu, localized route activation, and global language
preference remain a distinct shared navigation/route gate. Remaining Public
routes do not begin until the Homepage slice is accepted and its branch state
is reconciled with the latest `origin/main`.
