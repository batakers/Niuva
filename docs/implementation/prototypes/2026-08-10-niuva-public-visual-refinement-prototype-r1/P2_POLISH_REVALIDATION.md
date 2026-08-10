# P2 Polish Revalidation — Public Visual Refinement Prototype r1

**Date:** 11 August 2026
**Scope:** prototype-only visual/state polish after the R12 critique
**Verdict:** `PASS WITH CONDITIONS` remains; no P0/P1 was reopened by this pass.

## Changes reviewed

- Sticky header now uses the opaque page-surface token, so focused error,
  success, and handoff states do not show page-heading text through the nav.
- Projects rows keep the editorial artifact-first composition while adding a
  factual title/label caption directly on each artifact and aligning the
  featured copy with the image on larger screens.
- Retail remains inactive, but its secondary action now says `Retail sedang
  disiapkan` and reveals a visible deferred notice without a fake `#retail`
  route.
- Map-unavailable state now says that the location detail is unavailable in
  the prototype and directs the visitor to the Contact form or retry action.
- Review fixture copy now says `Penyimpanan gagal setelah submit`, making the
  trigger condition explicit without seeding a false initial error in
  Participant Mode.

## Verification

| Check | Result |
| --- | --- |
| Impeccable detector (`index.html`, `review.html`, `styles.css`, `app.js`) | `[]` |
| `node --check app.js fixtures.js server.cjs` | PASS |
| Contract test | 9/9 PASS |
| Browser route/viewport matrix | 24/24 PASS |
| Console/page errors, external requests | 0 / 0 |
| Horizontal overflow, broken images, targets below 44px | 0 / 0 / 0 |
| Projects caption/alignment at desktop and mobile | PASS |
| Retail deferred notice without route activation | PASS |
| Map fallback and retry | PASS |
| Review persistence-failure label | PASS |
| Server cleanup | `port-4178=free` |

Detailed machine-readable evidence is in
`evidence/p2-browser-results.json`; visual captures are the four `p2-*.png`
files in the same folder.

## Gate interpretation

This is a focused P2 polish pass, not a new independent formal expert critique
or moderated usability session. The latest independent critique remains R12:
`30/40`, `P0=0`, `P1=0`, `PASS WITH CONDITIONS`. The prototype stays
candidate-only and does not authorize production implementation, canonical
promotion, provider activation, deployment, or go-live.
