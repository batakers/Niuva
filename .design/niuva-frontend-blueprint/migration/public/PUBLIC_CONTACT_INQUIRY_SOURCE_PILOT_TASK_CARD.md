# MIG-01B — Public Contact/Inquiry source pilot task card

**Status:** Bounded source pilot executed; G4/G5 complete in PR #281.
Canonical promotion, readiness, and go-live remain separate.
**Planning baseline:** `origin/main` at
`e2cbfaa87e1d772ed7243b3a133078fba5c8fa32`; current documentation alignment
baseline is `46708524bfade1dec22a7a8747165fe221cd85f1`
**Execution base:** `origin/main` at
`770f9f157616e2bc44d69d8fbbef206de408099a` (pre-PR #281)
**Source commit:** `effb95ada3ddde5e016ae5330cc7083a4655880f`
**Merge commit:** `b35b5bafafa8efaa8afb1f1626c865fb831c6810`
**Delivery:** [PR #281](https://github.com/batakers/Niuva/pull/281), merged
18 August 2026
**Owner:** Public frontend driver
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

## Exact-file scope

The separately authorized pilot changed exactly these existing paths:

- `frontend/src/pages/marketing/ContactPage.jsx`
- `frontend/src/components/brand/BrandSystem.jsx`
- corresponding existing tests:
  `frontend/src/pages/marketing/ContactPage.intake.test.jsx` and
  `frontend/src/components/brand/BrandSystem.contact-localization.test.jsx`

No backend handler, API contract, schema, storage provider, upload flow,
notification provider, route, dependency, or new file is implied. The
Homepage/Navbar shell remains in MIG-01 and is not part of this card.

## Execution record — PR #281

- G4 implementation and G5 delivery were completed only for this bounded
  Contact/Inquiry slice; this record does not authorize another source pilot.
- The source commit changed exactly four existing files listed above. No
  backend, API/schema, provider, upload, payment, route, dependency, or
  business-rule file changed.
- Focused Contact/Inquiry suites passed: **15 tests**.
- Full frontend regression passed: **72 suites / 455 tests**.
- Production build, production dependency audit, and `git diff --check` passed.
  The audit retained two accepted RSC-only React Router advisory entries for
  the BrowserRouter SPA.
- Browser ID/EN at 390px and 1440px passed the recorded route, overflow,
  invalid-focus, persisted-UUID, and localized-consent checks.
- Axe reported **0 violations** at ID/EN × 390/1440px, and the Impeccable
  detector returned `[]`.
- Preview-only `/api/auth/me` 404s were observed without a backend; they were
  not page exceptions and did not activate an auth capability.
- The merged PR proves delivery of this reviewed slice only. It does not
  promote a component/token, activate a provider or capability, or establish
  production readiness or go-live.

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
- [x] Runtime/browser evidence and the separate delivery gates are recorded
      for PR #281; readiness and go-live remain separate.
- [x] This card does not itself authorize source work; PR #281 was separately
      authorized and is recorded in the execution record above.

**Self-review result:** Pass for the bounded MIG-01B execution record; G4/G5
are complete in PR #281, while canonical promotion, readiness, go-live, and
the remaining source pilots remain separately gated.
