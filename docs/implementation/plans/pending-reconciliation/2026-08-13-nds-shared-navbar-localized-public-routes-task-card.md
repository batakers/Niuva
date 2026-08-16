# NDS 2.0 Shared Navbar and Localized Public Routes Task Card

Status: **LOCAL APPLICATION SLICE AND R4.1 VALIDATED — UNPUBLISHED**

## Identity and baseline

- **Product owner:** Faiz
- **Driver:** Faiz with Codex assistance
- **Branch:** `feat/niuva-shared-navbar-localized-routes`
- **Worktree:** `C:\\tmp\\niuva-shared-navbar-localized-routes-20260813`
- **Selected baseline:** `origin/main` at
  `15b759a02b036330f1dd0913611043e0fd6134e2`
- **Prepared:** 13 August 2026, Asia/Jakarta
- **Authorization:** local application implementation and proportional
  verification are approved. Stage, commit, push, PR, merge, delivery-layer
  redirects, sitemap publication, deployment, readiness, and go-live remain
  separate gates.

## Objective

Replace the legacy Public navigation and path duplication with one localized
route registry and one shared Navbar contract. Activate the approved Indonesian
and English application routes, the 60/40 Services mega-menu, global language
preference, metadata and truthful English fallback behavior without claiming
that React Router provides delivery-layer HTTP 308 redirects.

## Authority and workflow

Authority is resolved through the repository reading order, especially:

1. [`NIUVA_MASTER_SPEC.md`](../../../NIUVA_MASTER_SPEC.md)
2. [`DOCUMENT_REGISTER.md`](../../../context/DOCUMENT_REGISTER.md)
3. [`DECISION_REGISTER.md`](../../../decisions/DECISION_REGISTER.md)
4. [`DEC-UX-003`](../../../decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md)
5. [`DEC-UX-004`](../../../decisions/experience/DEC-UX-004-cross-surface-design-system-reconstruction.md)
6. [`DESIGN.md`](../../../../DESIGN.md)
7. [Confirmed Candidate Design Brief](../../specs/candidates/2026-08-11-niuva-stage-b-visual-world-exploration/CONFIRMED_CANDIDATE_DESIGN_BRIEF.md)
8. Current source and tests

Execution workflow:

1. Niuva authority and source define product truth.
2. Impeccable is the primary frontend workflow and quality gate.
3. Owl Listener guidance checks route, token, component, and documentation
   completeness.
4. Taste red-teams the Public navigation against transferable SaaS/agency
   patterns.
5. Emil Design Engineering checks focus, interruption, motion restraint, and
   reduced motion.
6. Plugin87 contributes adapted advisory checks only and is not installed.

## Product and interaction contract

- Canonical Public pairs are `/` and `/en`, `/tentang` and `/en/about`,
  `/layanan` and `/en/services`, `/proyek` and `/en/projects`, `/kontak` and
  `/en/contact`, `/retail` and `/en/retail`, `/faq` and `/en/faq`, and
  `/privasi` and `/en/privacy`.
- Four primary Services remain equal: Research & Development, Consultant &
  Workshop, Design & Prototyping, and Apparel & Merchandise.
- Custom 3D Print and Ready Products are Retail destinations, not a fifth and
  sixth Service. Retail remains a quiet top-level link.
- Desktop Services opens a click-triggered 60/40 mega-menu. Mobile uses an
  accordion. Both support keyboard operation, visible focus, Escape, outside
  click, and focus return.
- The language control uses a globe plus visible `ID` or `EN`, exposes both
  explicit choices, and stores one preference shared by Public, Retail, Auth,
  Customer, and Admin surfaces.
- Complete English routes receive self-canonical and reciprocal `hreflang`.
  English routes whose CMS/editorial body is not translated show Indonesian
  content with a visible fallback notice, `lang="id"`, `noindex,follow`, and an
  Indonesian canonical. No machine translation is introduced.
- Application aliases preserve query and hash using a replace navigation.
  They are compatibility only and are not reported as HTTP 308 evidence.

## Authorized exact paths

The local implementation gate is limited to these paths:

- this task card;
- `frontend/src/lib/publicRoutes.js`;
- `frontend/src/lib/publicRoutes.test.js`;
- `frontend/src/i18n.js`;
- `frontend/src/App.js`;
- `frontend/src/App.route.contract.test.js`;
- `frontend/src/components/layout/PublicNavigation.jsx`;
- `frontend/src/components/layout/Navbar.jsx`;
- `frontend/src/components/layout/Navbar.test.jsx`;
- `frontend/src/components/layout/Navbar.contract.test.js`;
- `frontend/src/components/layout/Layout.jsx`;
- `frontend/src/components/layout/Layout.test.jsx`;
- `frontend/src/components/layout/Footer.jsx`;
- `frontend/src/components/layout/Footer.test.jsx`;
- `frontend/src/components/brand/BrandSystem.jsx`;
- `frontend/src/components/brand/BrandSystem.contact-localization.test.jsx`;
- `frontend/src/components/brand/CompanyProfileBlocks.jsx`;
- `frontend/src/components/layout/OperationalNavigation.jsx`;
- `frontend/src/pages/marketing/HomePage.jsx`;
- `frontend/src/pages/marketing/HomePage.contract.test.js`;
- `frontend/src/pages/marketing/home/HomePageR4.css`;
- `frontend/src/pages/marketing/home/HomePageVisuals.jsx`;
- `frontend/src/pages/marketing/home/HomePage.test.jsx`;
- `frontend/src/pages/marketing/AboutPage.jsx`;
- `frontend/src/pages/marketing/CapabilitiesPage.jsx`;
- `frontend/src/pages/marketing/CapabilitiesPage.states.test.jsx`;
- `frontend/src/pages/marketing/ProjectsPage.jsx`;
- `frontend/src/pages/marketing/ProjectsPage.test.jsx`;
- `frontend/src/pages/marketing/ContactPage.jsx`;
- `frontend/src/pages/marketing/ContactPage.intake.test.jsx`;
- `frontend/src/pages/marketing/PublicContentInvalidState.test.jsx`;
- `frontend/src/pages/marketing/FaqPage.jsx`;
- `frontend/src/pages/marketing/FaqPage.states.test.jsx`;
- `frontend/src/pages/marketing/PrivacyPolicyPage.jsx`;
- `frontend/src/pages/marketing/PrivacyPolicyPage.test.jsx`;
- `frontend/src/pages/marketing/NotFoundPage.jsx`;
- `frontend/src/pages/marketing/NotFoundPage.test.jsx`;
- `frontend/src/pages/retail/RetailCatalogPage.jsx`;
- `frontend/src/pages/retail/RetailCatalogPage.test.jsx`;
- `frontend/src/pages/retail/RetailProductPage.jsx`;
- `frontend/src/pages/retail/RetailProductPage.test.jsx`; and
- `frontend/src/pages/retail/retail-surface.contract.test.js`.

Brand-lab prototypes, Auth page compositions, Customer/Admin layouts, backend,
provider selection, dependency manifests, release generators, deployment
configuration, and delivery infrastructure remain unchanged.

## Verification gate

1. Route-registry and compatibility contract tests pass.
2. Navbar desktop mega-menu and mobile accordion pass mouse, keyboard, focus,
   Escape, outside-click, and language-selection tests.
3. Four Services have equal markup and action hierarchy; Retail destinations
   remain visibly separate.
4. ID/EN URL precedence and stored downstream preference pass.
5. Metadata checks cover title, description, canonical, robots, reciprocal
   `hreflang`, `x-default`, and English fallback behavior.
6. Mandatory system, navigation, Homepage, Contact, Privacy, CTA, loading,
   error, and recovery copy is complete in ID and EN.
7. Browser checks cover 320, 390, 768, 1024, and 1440 pixels with no overflow,
   broken focus order, undersized controls, console failure, or accessibility
   P0/P1.
8. Impeccable detector runs exactly once after the final source state. Taste,
   Owl, and Emil checks are recorded in the handover.
9. Focused tests, proportional frontend tests, production build, and
   `git diff --check` pass.

## Owner-approved Homepage fidelity remediation

After the initial localized-route implementation review, the owner approved a
bounded remediation of the production Homepage against the accepted R4 visual
prototype. The remediation may change only the Homepage JSX, its R4 stylesheet,
its visual component, and Homepage tests already listed above. It must:

- restore the R4 content measure, heading scale, and section-grid proportions;
- restore the R4 orientation, process, Services, and Retail heading hierarchy;
- keep the centered project-neutral hero and the current shared Navbar;
- restore the wider, faded, continuously moving light FDM contour with the R4
  line count and reduced-motion fallback;
- preserve current React semantics, localized routes, metadata, accessibility,
  four equal Services, and lifecycle boundaries; and
- leave legacy application aliases and the remaining Public-page redesign for
  their separately gated compatibility and migration work.

The previously recorded detector and browser evidence predates this scope
expansion and is not final evidence. One fresh final-state detector run and one
batched browser inspection are required after the remediation is complete.

## Owner-approved R4.1 continuity refinement

The owner subsequently approved one bounded R4.1 refinement after reviewing the
production rendering. This pass may change this task card, `HomePage.jsx`,
`HomePageR4.css`, the Homepage contract and render tests, `Footer.jsx`, and
`Footer.test.jsx`. `HomePageVisuals.jsx` remains authorized only if the existing
contour geometry cannot satisfy the accepted continuity contract. The pass must:

- let the light FDM contour cross the Hero boundary and fade inside a dedicated
  transition band before Orientation content begins;
- render Closing and the Homepage Footer as one dark terminal canvas using one
  shared contour field, with no light seam or duplicate contour;
- use an editorial stacked intro for Orientation, Process, Services, and Retail,
  while preserving balanced split layouts only where paired content requires
  them;
- preserve four equal primary Services, localized routes, current Navbar,
  responsive order, reduced motion, and lifecycle boundaries; and
- leave the Homepage Contact as summary plus CTA. The approved `/kontak` split
  form and operational-details redesign is a separate future slice and must not
  be introduced here.

All validation evidence recorded below predates this R4.1 expansion. It remains
historical evidence only until focused tests, the batched desktop/mobile browser
inspection, proportional regression tests, build, and one final Impeccable
detector run are refreshed against the final local state.

## Deferred delivery work

HTTP 308 redirects, public-origin validation, sitemap publication, server
direct-load validation, and CDN/hosting configuration stay deferred until a
delivery boundary and public origin are approved. Application aliases must not
be described as substitutes for those controls.

## Pre-remediation implementation evidence

- Full frontend suite: 69 suites and 430 tests passed.
- Production build and bundle report completed successfully; no bundle-budget
  decision was introduced by this slice.
- Browser matrix: 16 canonical Public routes at 320, 390, 768, 1024, and 1440
  pixels, for 80 of 80 passing combinations. No console error or warning,
  failed request, unapproved external request, horizontal overflow, broken
  image, unlabeled field, undersized visible control, or missing required
  landmark was found.
- Interaction evidence passed for the 60/40 desktop mega-menu, four equal
  Services, two separate Retail destinations, Escape, outside click, focus
  return, mobile accordion, global language preference, and query/hash-safe
  application aliases.
- Metadata evidence passed for complete English content and truthful
  Indonesian fallback. Five representative Axe checks reported no violations.
- Impeccable detector returned an empty result on the final application source.
- `git diff --check` passed. All 36 changed or new paths are within the
  authorized path list; four authorized test paths did not require edits.
- No file is staged, and no commit, push, PR, merge, dependency change, HTTP
  308, sitemap, provider, deployment, readiness, or go-live action occurred.

## Post-remediation validation evidence

- The focused Homepage suites passed: 2 suites and 12 tests, including the R4
  content measure, section hierarchy, 11-line contour, animation, fade mask,
  reduced-motion fallback, localized labels, and no obsolete process body.
- The full frontend suite passed: 69 suites and 431 tests. The production build
  and bundle report also completed successfully; this slice introduced no new
  bundle-budget or dependency decision.
- Focused browser confirmation passed at 390 and 1440 pixels with no runtime
  error, horizontal overflow, serious or critical Axe violation, or contour
  edge gap. The content shell measured 358 pixels with 16-pixel mobile gutters
  and exactly 1180 pixels on desktop.
- The light FDM contour uses 11 paths, spans beyond both viewport edges, crosses
  the Hero-to-orientation boundary on the same canvas, visibly changes between
  animation samples, and becomes static when reduced motion is requested.
- The refreshed Public-route browser matrix passed all 80 route and viewport
  combinations. Desktop and mobile mega-menu interaction, focus return,
  Escape, outside click, language persistence, compatibility aliases, complete
  and fallback metadata, and five representative Axe checks remained clean.
- Fresh final-state Impeccable detection for the remediated Homepage source
  returned an empty result. Screenshot critique found no remaining P0 or P1
  Homepage fidelity issue; offscreen secondary project media remains natively
  lazy-loaded and resolves when approached during normal scrolling.
- `git diff --check` passed. No file is staged and no commit, push, PR, merge,
  dependency, HTTP 308, sitemap, provider, deployment, readiness, or go-live
  action occurred.

## R4.1 final local validation evidence

- Focused Homepage, Footer, and source-contract verification passed: three
  suites and 15 tests.
- The full frontend regression suite passed: 69 suites and 432 tests. The
  optimized production build and report-only bundle measurement completed
  successfully without introducing a dependency or bundle-budget decision.
- One batched browser critique covered 390- and 1440-pixel Homepage renders.
  It found no runtime error, horizontal overflow, serious or critical Axe
  violation, or P0/P1 visual issue; the stopping rule therefore required no
  second corrective pass.
- At 390 and 1440 pixels, the light 11-line contour spans beyond both viewport
  edges, moves when motion is permitted, becomes static for reduced motion,
  crosses the Hero boundary by more than 96 pixels, and fades before Orientation
  content begins.
- Orientation, Process, Services, and Retail each expose one stacked editorial
  intro before their related content. Their production heading sizes are 36
  pixels at 390 and approximately 54.7 pixels at 1440, while Contact and FAQ
  retain their approved paired-content split.
- Closing and the Homepage Footer now share one terminal visual field: the
  Footer background is transparent, overlaps the reserved Closing footer band,
  ends at the same document boundary as Closing, and is traversed by the single
  dark contour. Non-Homepage Footer composition remains unchanged.
- The refreshed Public matrix passed all 80 canonical route and viewport
  combinations at 320, 390, 768, 1024, and 1440 pixels. Metadata, truthful
  English fallback, four equal Services, two Retail destinations, desktop and
  mobile navigation, Escape, outside click, focus return, language persistence,
  compatibility aliases, and five representative Axe checks remained clean.
- Browser evidence is stored outside Git under
  `C:\\tmp\\niuva-home-r41-evidence` and
  `C:\\tmp\\niuva-navbar-localization-browser-evidence`. The helper script is
  also temporary and is not part of the publication scope.
- The `/kontak` split form plus operational-details redesign remains explicitly
  deferred to its own slice; no Contact form lifecycle, privacy, validation, or
  error-state implementation was added to R4.1.
- The one final-state Impeccable detector run returned `[]`. `git diff --check`
  passed, the index contains zero staged paths, and the full local application
  slice remains unpublished at 38 modified or untracked paths.

## Rollback and handover

The rollback unit is the complete registry, Navbar, application-route, metadata,
Homepage R4.1, and localized-content slice. Reverting only the Navbar while
retaining the new routes, or reverting routes while retaining localized
metadata, is not a safe partial rollback. Handover must list exact changed
paths, checks run, known English fallbacks, deferred delivery controls, and any
P2/P3 findings.
