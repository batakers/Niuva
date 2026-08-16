# Public Navbar Recovery — Flat Navigation and Compact-on-Scroll

**Status:** Local implementation slice — unpublished, uncommitted

**Baseline:** `origin/main` at `9010405bc053e88fa3a46c4dbe63b654d47d6168`

**Owner direction:** Recover the previously approved Public Navbar behavior in
a new bounded slice. PR #243 and its historical worktree are evidence only;
their broad commit must not be cherry-picked or treated as current authority.

## Objective

Restore a Public-only Navbar that is direct, calm, and subtly responsive:

- `Layanan/Services` is one direct top-level link, not a desktop mega-menu or
  mobile accordion;
- Retail remains one direct top-level link and is not duplicated in a Services
  panel;
- compact-on-scroll starts after `96px`, changes the capsule from `64px` to
  `56px`, and narrows desktop width only;
- mobile keeps its width and changes only vertical spacing/height;
- logo, text, CTA, labels, and 44px interaction targets do not shrink;
- the compact transition is `280ms` with the existing Niuva snap easing, with
  no blur, opacity fade, bounce, overshoot, or auto-hide;
- reduced motion changes state immediately; and
- an open mobile menu freezes the compact state so its panel does not move.

## Authority and references

Read in this order before editing:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. `docs/decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md`
5. `docs/decisions/experience/DEC-UX-004-cross-surface-design-system-reconstruction.md`
6. `DESIGN.md`
7. Current source and tests in this worktree

Supporting workflow references are advisory only: Impeccable is the primary
frontend quality gate; Senior Fullstack checks lifecycle and code boundaries;
Owl Listener checks component/governance/accessibility completeness; Taste
red-teams Public specificity; Emil reviews motion; UI-UX Pro Max and Plugin87
provide donor checks only. Plugin87 is not installed or copied into the repo.

## Scope

### Files allowed to change

- `frontend/src/components/layout/Navbar.jsx`
- `frontend/src/components/layout/PublicNavigation.jsx`
- `frontend/src/components/layout/Navbar.test.jsx`
- `frontend/src/components/layout/Navbar.contract.test.js` (only if current
  contract assertions require a bounded update)
- this task card

### Explicit exclusions

- no Homepage art-direction, palette, gallery, chapter, or process changes;
- no Customer/Admin/Operations Navbar behavior changes;
- no route, locale, CMS, API, provider, schema, dependency, or global config
  changes;
- no new motion or component dependency;
- no rewrite of `DESIGN.md` or canonical decisions in this Navbar slice;
- no stage, commit, push, PR update, merge, deployment, readiness, or go-live.

## Implementation contract

### Navigation

- Preserve the canonical Public route pairs, active-route semantics, language
  selector, sign-in link, Contact CTA, keyboard focus, Escape, focus return,
  and mobile focus trap.
- Render the five existing Public top-level links directly in desktop and
  mobile navigation: Services, Projects, About, Contact, and Retail.
- Remove only the Services mega-menu/accordion and its duplicated Retail
  content. Do not invent a new navigation hierarchy.

### Compact behavior

- Use a `96px` sentinel/observer threshold with a scroll fallback when
  `IntersectionObserver` is unavailable.
- Compact only when the route is Public and the mobile menu is closed.
- Keep the public backdrop and capsule hue stable. The implementation may
  change padding/height and desktop max-width, but must not animate blur,
  opacity, logo scale, text scale, CTA scale, or layout-dependent content.
- Use only the existing tokenized `height`, `max-width`, and spacing transition
  properties. Reduced motion disables interpolation.

## Acceptance criteria

- Desktop and mobile contain no Services mega-menu or Services accordion.
- Retail appears once as a direct link and remains discoverable.
- At `0px` scroll, the Public capsule is `64px`; after `>96px`, it is `56px`.
- Desktop width narrows in compact state; mobile width does not narrow.
- Logo, copy, CTA, focus rings, and hit targets retain their normal size.
- Public compact behavior is absent on Customer/Admin/Operations routes.
- Opening the mobile menu freezes the current compact state; closing it allows
  observation to resume.
- Reduced-motion mode changes state without interpolation.
- No new dependency or route behavior is introduced.
- Existing ID/EN route switching and active-route semantics remain intact.

## Minimum verification

From `frontend/` in this worktree:

1. focused Navbar tests, including direct Services, single Retail, compact
   threshold/freeze, language, keyboard, and operational-route coverage;
2. full frontend test suite;
3. production build;
4. `git diff --check`;
5. browser checks at 320, 390, 768, 1024, and 1440px for ID and EN;
6. keyboard/focus and reduced-motion checks;
7. Axe serious/critical check and Impeccable detector;
8. Owl/Taste/Emil review notes and Plugin87 donor validators where applicable.

Record failures honestly. Passing source/tests does not authorize publication,
merge, deployment, readiness, or go-live.

## Handover

The handoff must list exact changed files, intentionally unchanged Homepage and
operational files, verification evidence, unresolved risks, and the remaining
authorization needed for stage, commit, push, PR, and merge.
