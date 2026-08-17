# Public Homepage Art Direction Recovery — Task Card

**Status:** Local recovery scope reconciled — unpublished, uncommitted, and
not delivery evidence

**Baseline:** `origin/main` at `2459c162ec0ffb58f57d2cf47af5f6c7dda4fd86`

**Owner direction:** Recover the previously approved Public Homepage art
direction in a second bounded slice after Navbar PR #272. Do not reopen PR #243
or copy its broad historical commit. On 17 August 2026 the owner additionally
approved a bounded anti-slop composition pass: Hero paper-white, transparent
Public Navbar outer header with the paper capsule retained for contrast, an
italic descender fix, and composition changes that do not alter route, factual
copy, lifecycle, or business rules.

## Objective

Reconcile the current Homepage R4 source with the owner-approved Public art
direction and hierarchy refinement while preserving product, route, locale,
lifecycle, evidence, and accessibility contracts:

- Mineral Prototype Studio: mineral canvas, paper surfaces, blue-black factual
  evidence field, and selective Niuva blue action/identity use;
- expressive but bounded Public motion for hero, one process draw, and
  project-gallery continuity; no Homepage FDM contour is implemented in this
  recovery slice;
- CSS-first delivery, no new dependency, no scroll hijacking, autoplay,
  universal reveal, parallax, or pulsing CTA;
- reduced motion removes spatial/ambient interpolation while retaining complete
  content and essential feedback; and
- remove the redundant `Memahami. Membentuk. Membuktikan.` Homepage section so
  the single five-stage process rail is followed directly by factual Projects;
- center the Hero content in its safe viewport area and keep the Hero-to-
  orientation transition clear without a decorative contour;
- keep Projects as a compact, dependency-free accordion gallery with one
  factual preview sentence per active item; and
- keep the Closing as a full dark terminal field without a contour competing
  with the Footer reserve.
- align the Hero to the approved `public-studio-paper` surface and remove the
  Public-only outer Navbar backdrop while retaining the fixed paper capsule;
- repair Bona Nova descender clearance without changing the approved
  expression role or copy; and
- vary Public composition through asymmetry, editorial service rows, and
  non-card FAQ grouping so the page does not read as a repeated landing-page
  template, while retaining the single process rail and factual evidence.

## Authority and references

Read and apply, in order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. applicable UX decisions and current `DESIGN.md`;
5. current Homepage source and tests; and
6. the owner-approved Public art-direction decisions recorded in this task
   card as bounded implementation input, not a replacement authority.

Impeccable is the primary quality gate. Senior Fullstack checks lifecycle and
scope boundaries. Owl Listener checks governance, tokens, component/state
completeness. Taste red-teams Public specificity. Emil reviews motion and
interaction. UI-UX Pro Max and Plugin87 are donor references only; Plugin87
must not be installed or copied into the repository.

## Owner-approved scope split — 17 August 2026

- The recovery PR may contain the bounded Homepage/Public runtime source,
  tests, gallery, Public Navbar backdrop adjustment, cleaned task card, and
  removal of unused contour-only runtime aliases.
- Canonical FDM contour retirement is a separate documentation amendment. It
  must review the Master Spec, `DEC-UX-004`, `DESIGN.md`, and applicable
  registers without changing backend or FDM business rules.
- Cross-surface design-token inventory and migration planning are a separate,
  read-only-first workstream. No broad token migration or page redesign is
  part of this recovery slice.
- The current dirty `DESIGN.md` art-direction diff is not automatically part
  of the recovery PR; it requires the separate canonical/token review before
  staging exact paths.

## Allowed implementation scope

- `frontend/src/pages/marketing/HomePage.jsx`
- `frontend/src/pages/marketing/home/HomePageR4.css`
- `frontend/src/pages/marketing/home/HomePageVisuals.jsx`
- `frontend/src/pages/marketing/home/NiuvaProjectGallery.jsx` (small,
  dependency-free Public evidence composition required for gallery continuity);
- `frontend/src/components/layout/Navbar.jsx` only for the Public outer
  header backdrop condition; operational Navbar composition must remain
  unchanged;
- `frontend/src/index.css` only for the already-scoped Public aliases required
  by this recovery slice; FDM contour aliases and broad token migration are
  excluded and handled by separate decisions;
- relevant bounded Homepage and Navbar tests under the same feature area;
- `DESIGN.md` is excluded from this recovery PR unless a later exact-file
  decision authorizes a non-canonical task-card correction. Canonical FDM
  retirement and the cross-surface token system are separate work;
- this task card.

## Explicit exclusions

- no Customer, Account, Admin, Operations, Retail, or B2B lifecycle changes;
- no operational Navbar changes; only the Public outer backdrop may become
  transparent while its capsule, focus, mobile panel, and route behavior stay
  intact;
- no route, locale, CMS, API, provider, schema, payment, dependency, or global
  configuration changes;
- no invented project evidence, metrics, clients, outcomes, telemetry, or
  production claims;
- no new image-generation workflow, motion library, or component dependency;
- no commit, push, PR, merge, deployment, readiness, or go-live action in this
  planning slice.

## Acceptance criteria

- Homepage remains B2B-primary with four equal Services and a clear Retail path;
- factual Project evidence remains attributable and available without hover-only
  disclosure, while the Homepage surface presents a compact accordion preview;
- Hero content is geometrically centered and the Hero-to-Orientation transition
  remains clear without a decorative contour or replacement ornament;
- the Closing covers a full viewport-height dark field and remains clear of the
  terminal Footer reserve without a contour;
- the five-stage process rail remains the only linear process explanation;
- palette and motion remain Public-only and do not restyle task-oriented
  surfaces;
- all content is complete before enhancement and reduced-motion output is fully
  usable;
- ID/EN, 320/390/768/1024/1440px, keyboard/focus, Axe, Impeccable, and
  anti-template checks are recorded; and
- current route, state, accessibility, and test contracts remain intact.
- Public Hero resolves to `public-studio-paper`, the Public outer Navbar
  backdrop is transparent, and the paper capsule remains readable over light
  and dark Public fields;
- italic display text has visible descender clearance in ID, EN, normal motion,
  reduced motion, and fallback-font states;
- orientation, Services, Retail, FAQ, and Contact composition no longer rely on
  one repeated article/card rhythm, while the four Services remain equal and
  B2B remains primary;
- decorative horizontal divider rules are removed from Orientation, Services,
  and FAQ; real panel and focus boundaries remain explicit;
- no Homepage FDM contour node or contour stylesheet remains in the runtime
  slice; the five-stage process rail remains the only linear line system;

## Handover and delivery gate

The implementation handoff must list exact changed files, intentionally
unchanged operational Navbar and non-Public surfaces, verification evidence,
unresolved content or provenance risks, and rollback considerations. Stage,
commit, push, PR, review, merge, and deployment remain separate approvals.

## Local verification record

The bounded local implementation was verified after rebaselining to
`2459c162ec0ffb58f57d2cf47af5f6c7dda4fd86`:

- frontend regression before the final Navbar contract assertion: 72 suites /
  449 tests passed;
- production build: passed; 166.07 kB entry gzip and 612.97 kB total JS gzip;
- production dependency audit: passed with the repository's two exact RSC-only
  React Router advisory entries accepted;
- browser matrix: ID/EN at 320, 390, 768, 1024, and 1440px with no overflow,
  runtime error, broken image, or sub-44px control;
- Axe: no violations at 390px or 1440px;
- normal motion: authored Hero/process/gallery feedback settled and gallery
  state changed; no FDM contour is expected;
- reduced motion: authored spatial motion is removed, Hero transform is static,
  the process connector remains understandable, and gallery transition is
  removed;
- Impeccable detector: `[]`;
- Plugin87 donor token validation: 14/14 token files and 450 tokens valid;
- Plugin87 donor hardcode lint: the three Homepage source files passed; the
  Navbar donor run reports four pre-existing hamburger pixel literals at
  `Navbar.jsx:238-244`, intentionally unchanged because this slice is limited
  to the Public outer backdrop and capsule surface; and
- `git diff --check`: passed.

The test run emitted existing React `act(...)` warnings from asynchronous
`ContactPage` settings/content fixtures; no suite failed. Owl Listener, Taste,
and Emil guidance were applied as source/governance reviews; their repositories
were not installed into Niuva and no new runtime dependency was added.

## Historical four-remediation validation — superseded 17 August 2026

The following contour measurements are retained as historical evidence from
the earlier local experiment. They are not current acceptance criteria or a
request to restore the contour; the later owner-approved retirement below is
the controlling Homepage direction.

The owner-approved follow-up geometry and density corrections were implemented
locally without changing the Navbar or shared Footer source:

- Hero content is centered to the safe viewport area within 1px at all tested
  widths;
- the light FDM contour element is centered on the Hero boundary within 1px,
  its visible path center is within 1px of that boundary, and its full-bleed
  bounds extend past both viewport edges without document overflow;
- the removed conceptual chapter remains absent, and Projects remains the
  immediate factual section after the single process rail;
- the dependency-free accordion gallery exposes one factual preview sentence
  for the active project, retains three attributable images, and passed click
  plus Arrow-key activation/focus checks;
- the Closing covers a complete viewport-height dark field and the dark FDM
  contour remains above the terminal Footer reserve;
- browser matrix: ID/EN at 320, 390, 768, 1024, and 1440px, 10/10 with no
  overflow, runtime error, broken image, or sub-44px control;
- Axe: no violations at 390px or 1440px;
- normal motion: contour transform changed and gallery keyboard activation
  moved the active index to the third panel;
- reduced motion: FDM inactive with `animation: none`, Hero transform static,
  and gallery transition `0s`;
- focused Homepage tests: 16/16 passed; full frontend regression before the
  final Navbar contract assertion: 72 suites / 449 tests passed;
- production build: passed; entry gzip 166.00 kB and total JavaScript gzip
  612.90 kB;
- production dependency audit: passed with the repository's two exact RSC-only
  React Router advisory entries accepted;
- Impeccable detector: `[]`;
- Plugin87 donor token validation: 14/14 token files and 450 tokens valid;
- Plugin87 donor hardcode lint: the three Homepage source files passed; the
  Navbar run reports the same four pre-existing hamburger pixel literals at
  `Navbar.jsx:238-244`, intentionally unchanged in this bounded slice;
- `git diff --check`: passed.

The browser evidence is retained outside the repository at
`C:\tmp\niuva-homepage-remediation-browser-20260817`. It is local validation
evidence only, not staging, production, readiness, or go-live evidence. No
stage, commit, push, PR, or merge action was performed.

## Owner-approved anti-slop composition pass — 17 August 2026

The latest bounded pass was applied locally within the approved
Public/Homepage scope:

- Hero background resolves to `public-studio-paper` (`#FCFCF8`); the Public
  outer Navbar is transparent and its fixed capsule remains paper for contrast;
  operational Navbar surfaces retain their existing backdrop and surface
  tokens;
- Bona Nova italic display text receives explicit line-height and descender
  clearance without changing the approved expression copy;
- orientation paths use an asymmetric editorial split, Services use equal
  border-free editorial rows, and FAQ uses a non-card list treatment to reduce repeated
  landing-page rhythm; no route, factual copy, lifecycle, or business rule was
  changed;
- a Navbar contract test covers Public transparent/paper treatment and
  operational backdrop preservation;
- focused Navbar tests: 14/14 passed; full frontend regression after the test
  addition: 72 suites / 450 tests passed;
- the production build, dependency audit, browser matrix, Axe, reduced-motion,
  Impeccable detector, and Taste donor linter passed;
- Plugin87 donor token validation passed (14/14 files, 450 tokens). Its
  hardcode linter passed for the three Homepage source files and retained the
  four legacy hamburger literals in Navbar outside this slice;
- no stage, commit, push, PR, merge, deployment, readiness, or go-live action
  was performed.

## Owner-approved divider and contour retirement — 17 August 2026

The owner approved two final bounded composition decisions after reviewing the
anti-slop pass:

- remove decorative horizontal rules from the Orientation articles, equal
  Services rows, and FAQ list; whitespace and the existing editorial split now
  provide grouping, while the Contact panel, Project panel, focus rings, and
  the desktop Orientation split retain their real boundaries;
- remove the FDM contour from both Homepage Hero and Closing, with no
  replacement ornament in this pass. The five-stage process rail remains the
  only linear process explanation.

This is an owner-approved local implementation exception. The higher-authority
Master Specification and current `DESIGN.md` still describe the FDM contour as
a separately bounded Public identity gesture; no canonical amendment or
promotion is made by this task card. Any future restoration or permanent
canonical retirement requires a separate decision.

The implementation must leave Public routes, ID/EN copy, lifecycle/state
contracts, B2B/Retail boundaries, business rules, operational Navbar behavior,
and non-Public surfaces unchanged. Delivery remains separately gated: no
stage, commit, push, PR, review, merge, deployment, readiness, or go-live is
authorized by this record.

## Latest local verification — divider and contour retirement

The latest implementation was verified against the production build after the
owner-approved retirement pass:

- focused Homepage and contract tests: 16/16 passed;
- full frontend regression: 72 suites / 450 tests passed; existing unrelated
  React `act(...)` warnings from ContactPage fixtures remain non-failing;
- production build: passed; entry gzip 164.94 kB and total JavaScript gzip
  611.84 kB;
- production dependency audit: passed with the repository's two exact
  RSC-only React Router advisory entries accepted;
- browser matrix: ID/EN at 320, 390, 768, 1024, and 1440px, 10/10 passed with
  no horizontal overflow, runtime error, broken image, sub-44px button/summary,
  or Homepage FDM contour node;
- process rail remained five stages and Projects remained the immediate
  factual section after the process rail;
- Orientation, Services, and FAQ article rules computed to zero horizontal
  divider width at every tested viewport; Contact, Project, focus, and the
  desktop Orientation split retained their real boundaries;
- reduced motion: no contour node, no overflow, and the process connector
  remained visible without spatial interpolation;
- Axe: zero violations at 390px and 1440px after authored entrance motion
  settled;
- Impeccable detector: `[]`;
- Plugin87 donor token validation: 14/14 token files and 450 tokens valid;
- Plugin87 donor Homepage hardcode lint: passed for the three Homepage source
  files;
- Plugin87 donor Taste lint: 0 findings for the three Homepage source files;
- `git diff --check`: passed.

Browser screenshots are retained outside the repository at
`C:\tmp\niuva-homepage-no-contour-browser-20260817`. They are local
validation evidence only, not staging, production, readiness, or go-live
evidence. No stage, commit, push, PR, or merge action was performed.
