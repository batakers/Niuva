# MIG-01 — Public shell/navigation source pilot task card

**Status:** G4 implementation and G5 delivery complete for the shell/navigation
slice in PR #279; MIG-01B is recorded separately as complete in PR #281
**Planning baseline:** `origin/main` at
`8555685c29a3fde9976ae6499336e2eb45a330ba`; the later pre-implementation
rebaseline was `e2cbfaa87e1d772ed7243b3a133078fba5c8fa32`
**Merged execution:** source commit `bcbbb54e6f1796475262363d6436ca78f9578018`,
merge commit `46708524bfade1dec22a7a8747165fe221cd85f1`
**Owner:** Public frontend driver (to be named at G3)
**Surface:** Public Homepage shell and Public navigation only; B2B Inquiry and
the Contact form remain a separate lifecycle-owned pilot recorded in MIG-01B
**Inputs:** `PUB-01`/`PUB-02`, QA-01–QA-05, DS-01A/DS-01B,
`DESIGN_BRIEF.md`, `INFORMATION_ARCHITECTURE.md`, `DESIGN_TOKENS.md`

## Objective

Test the smallest representative Public shell slice: the canonical Homepage
composition and Public navigation. The Homepage Contact section may preserve a
factual summary and handoff to the canonical Contact route, but the Contact
form, Inquiry persistence, UUID acknowledgement, and WhatsApp continuation are
deliberately excluded and planned in MIG-01B. The pilot may refine composition
and shell state presentation while preserving route, locale, evidence, and
Retail/B2B boundaries.

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
Contact form and Inquiry files are intentionally outside this card; see
[`PUBLIC_CONTACT_INQUIRY_SOURCE_PILOT_TASK_CARD.md`](PUBLIC_CONTACT_INQUIRY_SOURCE_PILOT_TASK_CARD.md).

## Acceptance criteria

- Homepage order follows the approved IA: B2B-primary entry, one process rail,
  factual project evidence, four equal Services, Retail secondary, Contact,
  FAQ, and closing action.
- Public Navbar remains direct/shallow, ID/EN-aware, keyboard-safe, and
  surface-specific; no mega-menu, auto-hide, or private-route invention.
- Homepage Contact summary preserves the approved B2B-first handoff to
  `/kontak#form-konsultasi` or `/en/contact#form-konsultasi`; form lifecycle
  semantics are verified only by MIG-01B.
- Factual evidence has visible captions/provenance or the honest missing-asset
  fallback; no generated/stock visual masquerades as project evidence.
- Page-local art direction stays LOCAL; no FDM replacement or token promotion.
- 320/390/768/1024/1440, 200% zoom, ID/EN long-content, focus, reduced motion,
  complete states, and no unintended overflow are evidenced.

## Required verification

- Focused HomePage/Navbar/public-route tests plus full frontend regression.
- Production build, dependency/diff audit, and `git diff --check`.
- Browser interaction/screenshots at 390 and 1440px minimum, including ID/EN,
  compact-on-scroll, mobile menu, Contact summary handoff, axe, and Impeccable
  critique. Contact failure/success/recovery are recorded in MIG-01B.
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
route, CMS migration, font/dependency adoption, FDM replacement, Contact form,
Inquiry persistence, WhatsApp continuation, or canonical `DESIGN.md` amendment.

## Split disposition

MIG-01 is the shell/navigation calibration slice. The former Contact/form
acceptance language is intentionally moved to MIG-01B so a G3 review can name
all exact consumers and tests without treating a Homepage link as authority for
Inquiry persistence. Owner G4 authorization and PR #279 delivery were separate
from this card; no Contact/Inquiry source was authorized or changed here.

## Execution record

- Owner-authorized G4 implementation changed only these three exact source/test
  paths in PR #279:
  `frontend/src/pages/marketing/HomePage.jsx`,
  `frontend/src/pages/marketing/home/HomePage.test.jsx`, and
  `frontend/src/pages/marketing/HomePage.contract.test.js`.
- The merged Homepage handoff now targets the existing Contact form anchor in
  both locales; route registry, Navbar, backend, API, and lifecycle contracts
  were not changed.
- PR #279 passed backend, frontend, secret-scan, browser, axe, build, and
  focused contract verification before merge.

## Self-review

- [x] Exact source/test paths are bounded and verified against the selected SHA.
- [x] Public lifecycle, route, locale, evidence, and inquiry constraints are
  preserved.
- [x] Runtime/browser evidence for the merged shell/navigation slice is recorded
      in PR #279; MIG-01B evidence is recorded in its separate execution card.
- [x] Rollback and all delivery gates are explicit.
- [x] This card did not itself authorize source work; owner G4 and PR #279
      delivery were separate gates.

**Self-review result:** Pass as the bounded MIG-01 record; shell/navigation
implementation and delivery are complete in PR #279, while MIG-01B is complete
under its separate execution card and PR #281.
