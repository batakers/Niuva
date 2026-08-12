# Niuva Homepage R4 prototype

Status: **OWNER VISUAL REVIEW PASSED — CANDIDATE BASELINE, PROTOTYPE ONLY**.
The owner accepted R4 as sufficiently complete on 2026-08-12 while explicitly
retaining the ability to revise it through a later candidate version or
canonical amendment. It is not canonical design authority, production source,
implementation approval, deployment evidence, or a go-live claim.

## What R4 evaluates

- the approved centered, project-neutral Homepage hero;
- one full-bleed animated FDM contour positioned as the visual boundary between
  the hero and the orientation section;
- a five-stage process connector that ends exactly at Output;
- three conceptual process illustrations with factual media reserved for
  Projects;
- four globally primary Services with equal visual rank and one shared
  `Lihat layanan` / `View service` action;
- a compact two-column Retail introduction followed by two primary Retail doors
  and the separate Rental & Self Service route;
- a Homepage Contact summary paired with operational details, while the complete
  form remains owned by `/kontak` and `/en/contact`;
- conversational editorial FAQ disclosures without chat-bubble decoration;
- a shared terminal canvas joining the Closing contour and an adaptive minimal
  footer; and
- a reduced horizontal-rule budget that relies on spacing, surface, and
  typography for hierarchy.

The official `ni` mark is copied byte-for-byte from
`frontend/public/niuva-mark.svg` and paired with the text `Niuva`, following the
existing `BrandIdentity` convention.

## Owner-approved R4 correction and refinement

R4 preserves R2 and R3 in sibling folders for side-by-side comparison. It
records the owner's prototype-only decisions from 2026-08-12:

1. remove the redundant hero footnote;
2. raise, center, and overscan the animated FDM contour so it spans the viewport
   without colliding with the orientation content;
3. stop the process connector at its final Output dot;
4. treat Research & Development, Consultant & Workshop, Design & Prototyping,
   and Apparel & Merchandise as four primary Services globally;
5. give all four Services identical visual treatment and one shared service
   detail action;
6. compact the Retail heading into a balanced two-column introduction;
7. keep the full inquiry form on the Contact route and use a split summary plus
   operational details on the Homepage;
8. use conversational editorial FAQ disclosure rather than literal chat
   bubbles; and
9. join Closing and the adaptive minimal footer into one terminal canvas while
   removing non-essential horizontal rules.

The four-primary-Service correction conflicts with the older two-primary / two-
supporting hierarchy in `DEC-UX-002` and the Master Spec. R4 records the owner
direction for evaluation; it does not amend canonical authority. The continuing
Closing contour likewise remains a candidate prototype experiment until its
motif placement receives any required documentation amendment.

## Deliberate boundaries

R4 does not activate or simulate a real inquiry submission, service-detail
route, login, CMS, catalogue, configurator, file upload, pricing, stock,
checkout, payment, tracking, API, database, provider, analytics, privacy route,
or language persistence. Controls outside the Homepage show a visible
prototype-boundary notice.

English metadata and counterpart paths demonstrate candidate interaction only;
they are not server-rendered SEO or crawlability evidence. No dependency was
added. `DESIGN.md`, canonical documents, and production source remain unchanged.

## Preview

From this directory:

```powershell
node server.cjs
```

Open:

- `http://127.0.0.1:4198/` for Indonesian;
- `http://127.0.0.1:4198/en` for English.

Use `Ctrl+C` in the terminal to stop the local server.

## Validation

```powershell
node --check app.js
node --check server.cjs
node --check browser-validate.cjs
node --test homepage-r4.contract.test.cjs
node browser-validate.cjs
```

Browser evidence is written to `evidence/`. `VISUAL_QA.md` records one batched
desktop/mobile QA and, if required, at most one grouped remediation pass.

Asset and font provenance is recorded in `ASSET_MANIFEST.md`.
