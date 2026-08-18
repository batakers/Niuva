# MIG-01B — Candidate Public Contact/Inquiry source pilot task card

**Status:** Candidate planning-only card — G3/G4 not granted
**Planning baseline:** `origin/main` at
`e2cbfaa87e1d772ed7243b3a133078fba5c8fa32`; current documentation alignment
baseline is `46708524bfade1dec22a7a8747165fe221cd85f1`
**Owner:** Public frontend driver (to be named at G3)
**Surface:** Public B2B intake only; Inquiry remains the durable lifecycle
owner and Operations remains the manual follow-up owner
**Inputs:** `PUB-03`, QA-01–QA-05, DS-01A/DS-01B,
`DESIGN_BRIEF.md`, `INFORMATION_ARCHITECTURE.md`, `DESIGN_TOKENS.md`

## Objective

Review the smallest exact-file Contact/Inquiry slice independently from the
Homepage shell. It must preserve the form-first, persistence-first contract:
safe validation, exact consent, Inquiry persistence with `new`, visible
acknowledgement of the existing UUID, and optional visitor-clicked WhatsApp
only after persistence.

## Candidate exact-file scope

**Files that may be evaluated or changed only after G3/G4 approval:**

- `frontend/src/pages/marketing/ContactPage.jsx`
- `frontend/src/components/brand/BrandSystem.jsx`
- corresponding existing tests:
  `frontend/src/pages/marketing/ContactPage.intake.test.jsx` and
  `frontend/src/components/brand/BrandSystem.contact-localization.test.jsx`

No backend handler, API contract, schema, storage provider, upload flow,
notification provider, route, dependency, or new file is implied. The
Homepage/Navbar shell remains in MIG-01 and is not part of this card.

## Acceptance criteria

- ID/EN Contact routes remain `/kontak` and `/en/contact`; the form remains
  public and does not require login.
- Required fields remain mapped to the canonical Inquiry attributes:
  `company`, `pic_name`, `pic_email`, `pic_phone`, `need`, `timeline`, `brief`,
  and `consent`.
- The approved consent wording remains exact in Indonesian and the English
  counterpart remains complete and truthful.
- Validation preserves safe entered values, identifies field relationships,
  and moves focus to an actionable error without treating dependency failure as
  invalid input.
- A successful persistence response is required before showing the existing
  Inquiry UUID; a generic `Sent` state or toast-only success is prohibited.
- Dependency/system failure is visible in-page, preserves safe form context,
  and does not auto-retry a POST that could duplicate an Inquiry.
- The optional WhatsApp continuation is visitor-clicked and available only
  after a persisted Inquiry reference is shown. WhatsApp alone cannot create,
  update, retry, or prove an Inquiry.
- The form contains no public raw-file upload and does not create a Quote,
  Project, Order, reservation, payment, price, ETA, or delivery guarantee.
- The first human response target remains expectation-setting, not an SLA or
  resolution promise.

## Required verification

- Focused Contact/Inquiry tests plus full frontend regression.
- Production build, dependency/diff audit, and `git diff --check`.
- Browser interaction/screenshots at 390 and 1440px minimum in ID/EN,
  including invalid input, missing consent, loading/duplicate-submit guard,
  dependency failure, persisted success with UUID, focus return, and optional
  WhatsApp continuation; run axe and Impeccable critique.
- Confirm no backend/provider/auth/payment/upload capability changed and that
  customer-facing output excludes internal notes or commercial internals.

## Rollback and delivery gates

Use one fresh worktree from a newly fetched `origin/main`. Record exact source
SHA and inspect overlap before editing. Rollback is a file-level revert/discard
of this pilot branch; do not rewrite history or delete compatibility evidence.
Stage only approved exact paths. G3 review, G4 implementation authorization,
commit, push, PR, review-thread resolution, merge, and delivery/readiness
decisions remain separate.

## Exclusions

No Homepage composition, Public Navbar, Public route activation, B2B portal,
raw-file upload, payment, provider, project-detail route, CMS migration,
dependency/font adoption, FDM replacement, or canonical `DESIGN.md` amendment.

## Self-review

- [x] Exact Contact/Inquiry source and test paths are bounded and verified
      against the selected planning SHA.
- [x] Form, consent, persistence, UUID, WhatsApp, failure, recovery, and
      privacy boundaries are explicit.
- [x] Homepage shell authority is excluded rather than inferred through a
      link or shared primitive.
- [x] Runtime/browser evidence and all delivery gates remain required.
- [x] No source work is authorized by this card.

**Self-review result:** Pass as a candidate G3 task card; runtime evidence and
G4 implementation authorization remain open.
