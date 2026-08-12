# Homepage R4 Visual QA

Status: **OWNER VISUAL REVIEW PASSED — CANDIDATE BASELINE, PROTOTYPE ONLY**

This record applies only to the isolated Homepage R4 prototype. It does not
authorize production-source changes, dependency changes, a `DESIGN.md`
amendment, canonical promotion, route activation, provider integration,
deployment, readiness, or go-live.

The owner accepted the current visual direction as sufficiently complete on
2026-08-12. This acceptance freezes R4 as a reviewable candidate baseline, not
as an immutable final design. Later exploration must use a new version or an
explicit amendment rather than silently rewriting this evidence.

## Reviewed owner direction

R4 tests the following owner-confirmed refinements:

- remove the redundant hero footnote;
- keep one animated FDM contour field between Hero and Orientation without
  colliding with either section;
- end the process connector at the final Output point;
- present Research & Development, Consultant & Workshop, Design &
  Prototyping, and Apparel & Merchandise as four visually equal primary
  Services;
- make each Service use the same `Lihat layanan` or `View service` action;
- tighten the Retail heading and preserve two dominant Retail doors plus one
  quieter Sewa & Self Service route;
- use a split Contact summary and operational-detail handoff on the Homepage,
  with the full form reserved for the Contact route;
- use conversational editorial FAQ disclosure without literal chat bubbles;
- join Closing and the minimal footer in one terminal canvas; and
- reduce decorative horizontal rules.

The four-primary-Service decision is recorded here as owner-approved candidate
direction. It does not silently amend the current canonical service hierarchy.

## Verification

### Source and contract

- `node --check app.js`: PASS.
- `node --check server.cjs`: PASS.
- `node --check browser-validate.cjs`: PASS.
- `node --check homepage-r4.contract.test.cjs`: PASS.
- `node --test homepage-r4.contract.test.cjs`: **15/15 PASS**.
- root-file whitespace and final-newline check: PASS.
- official mark provenance: `assets/niuva-mark.svg` is byte-identical to
  `frontend/public/niuva-mark.svg` and is paired with the text `Niuva` in the
  header and footer.

### Browser matrix

Final browser evidence in `evidence/browser-results.json`:

- 10/10 language and viewport records PASS;
- Indonesian `/` and English `/en`;
- widths 320, 390, 768, 1024, and 1440px;
- no console errors or warnings;
- no page errors, failed responses, or external runtime requests;
- no horizontal overflow, broken images, missing image alternatives, or
  visible interaction targets below 44px;
- one visible header, main landmark, and footer at every width;
- correct canonical route and active language at both language routes;
- animated FDM contour movement observed, while reduced-motion disables the
  animation and reveal transforms;
- process rail is vertical through the 900px mobile/tablet range and horizontal
  above it, with no connector after Output;
- four equal Service entries and one shared CTA label per language;
- Contact details stack after the summary below 900px and align at the top on
  wider layouts;
- terminal contour stays below Closing actions and continues through the
  footer;
- footer resolves to one row above 900px and two adaptive rows at or below
  900px; and
- wide horizontal-rule count is three at all final matrix widths.

Focused interactions also PASS:

- desktop Services mega-menu open and Escape recovery;
- global language menu;
- Project, Retail, Service-detail, and Privacy prototype-only boundaries;
- mobile menu and nested Services disclosure with Escape recovery;
- FAQ disclosure;
- first keyboard focus and skip-link target;
- pointer response on the hero contour; and
- ambient and reduced-motion behavior.

Screenshots:

- `evidence/screenshots/homepage-r4-id-1440-full.png`;
- `evidence/screenshots/homepage-r4-id-390-full.png`; and
- viewport captures for ID and EN at all five widths.

## Screenshot critique

The final desktop and mobile captures preserve the centered hero, give the FDM
field a clear boundary role, and keep the five-stage process separate from the
animated line field. The macro chapters use conceptual illustrations, while
real media remains reserved for factual Project evidence. The four Services
share one open-grid hierarchy, Retail remains a distinct transactional bridge,
and Contact, FAQ, Closing, and footer no longer read as unrelated panels.

First-order anti-template check: PASS. There is no generic three-card marketing
grid, decorative bento system, glass treatment, fake metric strip, dashboard
mockup, or component-library showcase rhythm.

Second-order anti-template check: PASS. The FDM signature, real Niuva project
evidence, partnership-versus-Retail split, quote boundary, four-Service model,
and process vocabulary would not transfer unchanged to an unrelated agency or
SaaS product.

Logo-hidden check: PASS WITH CONDITION. The page remains recognizably about a
physical product-development partner through its process, artefacts, and Retail
boundary. The typography warning below remains open before canonical adoption.

## Closed R4 findings

- `R4-P1-01`: contour collision and right-edge gap — CLOSED.
- `R4-P1-02`: process connector continuing after Output — CLOSED.
- `R4-P1-03`: Apparel & Merchandise visually demoted — CLOSED.
- `R4-P1-04`: oversized Retail heading gap and 320px card overflow — CLOSED.
- `R4-P1-05`: Homepage Contact panel misalignment — CLOSED.
- `R4-P1-06`: Closing/footer contour collision and abrupt separation — CLOSED.
- `R4-P2-01`: excessive wide horizontal rules — CLOSED; final count is three.

## Remaining conditions

### `R4-P2-02` — Impeccable typography warning

The single final detector run reports `overused-font` for `Mona Sans`. The
detector's rule explicitly includes Mona Sans even though its short description
does not name it. This warning is not suppressed. R4 retains Mona Sans + Bona
Nova because the owner selected this candidate pair and the complete visual
composition passes the current anti-template checks. Typography must be
reviewed again before any design-system or production-source promotion.

### `R4-GOV-01` — canonical hierarchy reconciliation

R4 treats all four Services as primary, while current canonical documentation
still contains the earlier primary/supporting hierarchy. The prototype records
the owner correction but does not resolve that documentation conflict. A
separate documentation decision and promotion gate is required before
application implementation.

No P0 or P1 issue remains in this bounded R4 review. This is evidence for owner
visual review only, not evidence of production readiness.
