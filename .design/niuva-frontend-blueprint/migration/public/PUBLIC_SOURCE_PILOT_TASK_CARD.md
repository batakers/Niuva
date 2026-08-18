# MIG-01 — Candidate Public source pilot task card

**Status:** Candidate planning-only card — G3/G4 not granted
**Baseline:** `origin/main` at `8555685c29a3fde9976ae6499336e2eb45a330ba`
**Owner:** Public frontend driver (to be named at G3)
**Surface:** Public only; B2B Inquiry remains a separate lifecycle owner
**Inputs:** `PUB-01`/`PUB-02`/`PUB-03`, QA-01–QA-05, DS-01A/DS-01B,
`DESIGN_BRIEF.md`, `INFORMATION_ARCHITECTURE.md`, `DESIGN_TOKENS.md`

## Objective

Test the smallest representative Public slice: the canonical Homepage shell,
Public navigation, and Contact summary/form handoff. The pilot may refine
composition and state presentation while preserving route, locale, Inquiry,
evidence, and Retail/B2B boundaries.

## Candidate exact-file scope

**Files that may be evaluated or changed only after G3/G4 approval:**

- `frontend/src/pages/marketing/HomePage.jsx`
- `frontend/src/pages/marketing/home/HomePageR4.css`
- `frontend/src/components/layout/Navbar.jsx`
- `frontend/src/components/layout/PublicNavigation.jsx`
- `frontend/src/lib/publicRoutes.js` only if a reviewed compatibility defect is
  proven; route changes are otherwise excluded
- corresponding existing tests:
  `frontend/src/pages/marketing/home/HomePage.test.jsx`,
  `frontend/src/pages/marketing/HomePage.contract.test.js`,
  `frontend/src/components/layout/Navbar.test.jsx`,
  `frontend/src/components/layout/Navbar.contract.test.js`, and
  `frontend/src/lib/publicRoutes.test.js`

No new file, dependency, route, API, schema, asset, or CMS record is implied.

## Acceptance criteria

- Homepage order follows the approved IA: B2B-primary entry, one process rail,
  factual project evidence, four equal Services, Retail secondary, Contact,
  FAQ, and closing action.
- Public Navbar remains direct/shallow, ID/EN-aware, keyboard-safe, and
  surface-specific; no mega-menu, auto-hide, or private-route invention.
- Contact preserves exact consent, visible validation/system failure, Inquiry
  UUID only after persistence, and optional user-clicked WhatsApp afterward.
- Factual evidence has visible captions/provenance or the honest missing-asset
  fallback; no generated/stock visual masquerades as project evidence.
- Page-local art direction stays LOCAL; no FDM replacement or token promotion.
- 320/390/768/1024/1440, 200% zoom, ID/EN long-content, focus, reduced motion,
  complete states, and no unintended overflow are evidenced.

## Required verification

- Focused HomePage/Navbar/public-route tests plus full frontend regression.
- Production build, dependency/diff audit, and `git diff --check`.
- Browser interaction/screenshots at 390 and 1440px minimum, including ID/EN,
  compact-on-scroll, mobile menu, Contact failure/success/recovery, axe, and
  Impeccable critique.
- Confirm no backend/provider/auth/payment/upload capability changed.

## Rollback and delivery gates

Use one fresh worktree from a newly fetched `origin/main`. Before editing,
check worktree/branch overlap and record exact source SHA. Rollback is
file-level revert/discard of the pilot branch; do not rewrite history or
delete compatibility evidence. Stage only the approved exact paths. G3 review,
G4 implementation authorization, commit, push, PR, review-thread resolution,
merge, and delivery/readiness decisions remain separate.

## Exclusions

No Retail checkout, B2B portal, upload, payment, provider, project-detail
route, CMS migration, font/dependency adoption, FDM replacement, or canonical
`DESIGN.md` amendment.

## Self-review

- [x] Exact source/test paths are bounded and verified against the selected SHA.
- [x] Public lifecycle, route, locale, evidence, and inquiry constraints are
  preserved.
- [x] Runtime/browser evidence is required rather than claimed.
- [x] Rollback and all delivery gates are explicit.
- [x] No source work is authorized by this card.

**Self-review result:** Pass as a candidate G3 task card.
