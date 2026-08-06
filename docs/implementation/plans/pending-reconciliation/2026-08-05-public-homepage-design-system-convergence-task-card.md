# Public Homepage Design-System Convergence Task Card

Status: **Homepage implementation evidence integrated through PR #137;
original slice branch was not separately published**

## Identity and baseline

- **Requester / delegated Product and Technical Owner:** Faiz
- **Driver:** Codex in an isolated Public Homepage worktree
- **Reviewer / verifier:** Faiz with automated and synthetic browser evidence;
  independent brand/usability review is not claimed
- **Branch:** `frontend/public-design-system-convergence`
- **Selected baseline:** `origin/main` at
  `0b699fea676d285a749f7bf41765b542238c3def`
- **Date:** 5 August 2026, Asia/Jakarta
- **Commit/push/PR permitted?:** No. Local source, tests, screenshots, and
  handover evidence only.

## Objective

Converge the production Homepage to the already approved Experimental Editorial
Hybrid while preserving one Niuva identity, a Business/B2B-primary narrative,
and a clear secondary Retail discovery path. Replace the remaining generic
card/template composition with the exact approved evidence, capability,
transformation, project, and final-action hierarchy. Correct measurable mobile
navigation semantics without changing navigation items, destinations, or the
deferred journey-switching design.

## Authority

- `docs/NIUVA_MASTER_SPEC.md`, especially sections 7, 8, 9, 14, 16, 17,
  and 18
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- `docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md`
- `docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md`
- `docs/decisions/evidence/HOMEPAGE_PROTOTYPE_DECISION.md`
- `docs/implementation/plans/pending-reconciliation/2026-07-23-homepage-production-implementation-plan.md`
  as context only
- `docs/references/requirements/historical-active/AGENTS.brand-baseline-v1.md`
  where it does not conflict with later decisions
- `DESIGN.md`
- The active goal instruction to retain the current UI libraries and converge
  the frontend through isolated surface slices

## Audit findings addressed

- The hero uses a generic blue proof panel and does not contain the approved
  Pindad EV artifact or the compact semantic Need-to-Output transformation path.
- The approved immediate Pindad flagship proof is replaced by a generic
  positioning/evidence section.
- Research & Development and Design & Prototyping are rendered as two mirrored
  `CapabilityPanel` cards instead of question-led and artifact-led chapters.
- The operating model contains six disconnected rule-top items; the approved
  model is one connected five-stage `Need → Research → Experiment → Prototype
  → Output` path, horizontal on desktop and static vertical on mobile.
- Home renders three full bordered project cards. The approved selected proof is
  Xeon plus Bicycle Arcade in open editorial layouts with dominant media,
  sparse dividers, and text outside the media frame.
- The Why Niuva section contains a competing CTA inside a large rounded blue
  card rather than one controlled contrast band of aligned proof statements.
- The final CTA nests rounded blue shells and white rings; the approved action
  is an open terminal section with one dominant heading and restrained contact
  action.
- The Retail discovery path is clear but framed as another rounded feature
  card, weakening its intentionally secondary hierarchy.
- The closed mobile navigation keeps a dialog role, `aria-hidden`, and focusable
  descendants instead of using the native inert boundary.

## In scope

- Use Pindad EV as the Home hero artifact and immediate flagship evidence with
  only the existing factual context, challenge, solution/method, output, and
  capability fields.
- Add one reusable semantic transformation-path component with compact and full
  Home renderers: five real stages, one desktop U-path, one static mobile
  sequence, no decorative repetition, and no motion-dependent meaning.
- Recompose the two primary capabilities as differentiated open chapters;
  retain supporting capabilities as compact divider-led rows.
- Add a Home-only open editorial variant to the existing project component and
  use it for Xeon and Bicycle Arcade evidence without changing project facts or
  the Projects index defaults.
- Add a Home-only open CTA variant without changing `BrandButton` contracts or
  destinations.
- Flatten the Retail discovery and Why Niuva groupings while preserving copy,
  hierarchy, and approved destinations.
- Keep the existing public navigation items and behavior; make the mobile panel
  a modal dialog only while open and native-inert while closed.
- Add static/behavior contracts and synthetic desktop/mobile/tablet browser
  evidence for narrative order, exact U-path budget, Retail discoverability,
  responsive overflow, keyboard/focus, accessibility, console, and network
  health.

## Affected files

- `docs/implementation/plans/pending-reconciliation/2026-08-05-public-homepage-design-system-convergence-task-card.md`
- `frontend/src/pages/marketing/HomePage.jsx`
- `frontend/src/pages/marketing/HomePage.contract.test.js`
- `frontend/src/components/brand/CompanyProfileBlocks.jsx`
- `frontend/src/components/brand/BrandSystem.jsx`
- `frontend/src/index.css`
- `frontend/src/components/layout/Navbar.jsx`
- `frontend/src/components/layout/Navbar.contract.test.js`
- Home-only synthetic browser evidence under `frontend/output/playwright/`

## Implementation and verification handover

- Home now uses the approved sequence: Pindad hero and flagship proof, two
  differentiated primary capability chapters, one complete transformation
  path, supporting capability rows, Xeon and Bicycle editorial evidence,
  secondary Retail discovery, Why Niuva proof band, and an open terminal CTA.
- Home opts out of the legacy repeated scroll-reveal behavior so the approved
  content remains present with reduced motion and full-page capture. Other
  public routes retain their existing visual treatment because their rollout
  remains explicitly deferred.
- The mobile navigation panel is `inert` while closed, becomes a dialog only
  while open, traps Tab focus, closes on Escape, and returns focus to its
  trigger. Destinations and labels were not changed.
- Focused Jest checks: 5 suites, 14 tests passed.
- Full Jest regression: 45 suites passed and 1 suite failed; 279 tests passed
  and 1 failed. The sole failure is the pre-existing brittle whitespace
  contract at `src/pages/admin/cms-lifecycle.contract.test.js:83` against the
  untouched `src/pages/admin/cms/ContentEditor.jsx`; it is outside this slice
  and is not claimed as resolved here.
- Production build: passed (`npm run build`). The postbuild script only warned
  that `REACT_APP_PUBLIC_SITE_URL` is not configured, so sitemap generation was
  skipped; no deployment behavior was changed.
- Bundle report: passed in report-only mode; total gzip 566.12 kB, entry gzip
  198.35 kB, largest async gzip 100.10 kB. No budget decision was applied.
- Synthetic browser audit: 2 Playwright tests passed across Home desktop
  1440, tablet 768, mobile 390, mobile navigation open/closed, and eight
  public routes (`/`, `/about`, `/capabilities`, `/projects`, `/contact`,
  `/faq`, `/privacy`, and a Not Found route). All checked layouts had no
  horizontal overflow, axe WCAG A/AA reported zero violations, and there were
  zero console errors, page errors, bad responses, or request failures.
- Evidence retained in `frontend/output/playwright/`: `public-home-desktop.png`,
  `public-home-tablet.png`, `public-home-mobile.png`, and
  `public-navigation-mobile.png`.
- No commit, push, PR, merge, backend change, dependency change, migration,
  provider action, deployment, or go-live action was performed. The temporary
  browser spec and local dev server were removed/stopped after verification.

## Explicit exclusions

- No visual or typography rollout to About, Capabilities, Projects, Contact,
  FAQ, Privacy, or Not Found; those routes are audited for later completion but
  remain governed by the recorded deferral.
- No public taxonomy rename, Office & Signage placement, detailed Retail/B2B
  journey switch, navigation item/destination change, route/redirect change,
  CMS schema, or public-content contract change.
- No fabricated media, client, metric, award, certification, testimonial,
  project fact, outcome, process artifact, availability, price, ETA, policy, or
  capability.
- No Contact form field, validation, payload, privacy, submission, backend,
  API, authentication, Retail transaction, provider, migration, deployment, or
  go-live change.
- No new UI library, dependency, global token value, brandmark geometry,
  `BrandButton` API removal, or shared component default change outside the
  named opt-in Home variants.
- No commit, push, PR, merge, or modification of another worktree.

## Acceptance criteria

1. Home preserves a B2B-primary first impression and a clear but secondary
   Retail route on desktop, tablet, and mobile.
2. Home has exactly two dominant semantic transformation paths: compact hero
   and complete process; both expose all five stages and remain readable with
   reduced motion.
3. Pindad EV is the hero artifact and immediate flagship proof. Xeon and
   Bicycle Arcade are the selected editorial project evidence; no low-resolution
   Agate asset is used at hero scale.
4. Primary capabilities are visibly differentiated, supporting capabilities
   remain secondary, and none are presented as a repeated generic card grid.
5. The process has five connected stages and no stage cards or primary CTA.
6. Selected projects use the Home-only open editorial treatment; Projects page
   defaults and factual project data remain unchanged.
7. Why Niuva and final CTA follow the approved open/contrast treatments without
   a competing inner CTA or nested rounded shell.
8. Mobile navigation is inert when closed, dialog-scoped when open, keyboard
   trapped, Escape-closeable, and returns focus without changing destinations.
9. Focused tests, full frontend regression evidence, production build, bundle
   measurement, responsive screenshots, reduced-motion checks, and automated
   accessibility checks are recorded.

## Rollback

Before publication, remove or revert only the listed Homepage task paths in
this worktree. There is no data, backend, dependency, environment, provider, or
migration rollback because this slice changes Home presentation, shared opt-in
rendering variants, navigation semantics, tests, and evidence only.

## Post-merge reconciliation — 5 August 2026

This task card predates Git publication. Its task-card record and integrated
Homepage scope were included in PR #137, now merged into `origin/main` at
`18f51dee8a8ddf83e438de2f2f0e3acccbc5b8c1`. The original slice branch was not
published as a separate PR; the current publication and verification record is
the [integration task card](2026-08-05-frontend-design-system-integration-task-card.md).

The original local handover statements above remain historical evidence for the
pre-merge worktree. They do not describe the current merged-source state.
