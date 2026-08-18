# MIG-06 — Candidate compatibility and retirement plan

**Status:** Candidate planning-only register — no retirement or deletion
**Baseline:** `origin/main` at `8555685c29a3fde9976ae6499336e2eb45a330ba`
**Authority:** DS-01A/DS-01B, canonical route/localization decisions,
`DESIGN_TOKENS.md`, current imports/tests/history, and delivery-boundary rules

## Candidate register

| Candidate | Current evidence | Replacement/target | Required proof | Delivery boundary |
| --- | --- | --- | --- | --- |
| Public compatibility aliases | `frontend/src/lib/publicRoutes.js`, `frontend/src/App.js`, route tests; aliases remain inventory-only | Canonical Indonesian/English Public pairs | Exact import/redirect search, one-hop delivery verification, analytics/sitemap impact, rollback | HTTP `308` requires separate infrastructure authorization; do not delete aliases here |
| Reserved project-detail paths | DS-01B route matrix; `/proyek/:slug` and `/en/projects/:slug` reserved | Approved archive or future separately owned detail route | Route ownership, CMS/content, canonical/hreflang, asset and analytics evidence | No activation or deletion in blueprint |
| `BrandButton` compatibility split | DS-01A consumer ledger | Approved Button primitive after consumer migration | Every import mapped, visual/behavior parity, API migration and rollback | Separate source PR and deprecation decision |
| `LegacyOrderStatusBadge` | `frontend/src/components/operational/LegacyOrderStatusBadge.jsx` and tests/import search | Resource-specific status adapter | Zero-consumer evidence or explicit remaining legacy owner; state mapping | Do not remove referenced historical behavior |
| Legacy fonts/old palette selectors | Current source/token audit and compatibility notes | Purpose-based semantic tokens and approved type roles | Exact consumer inventory, visual/contrast evidence, two-consumer replacement, fallback | Separate token migration; preserve compatibility until proven |
| Drawer / `vaul` boundary | DS-01A quarantined, no approved consumer | Native existing mechanics or separately approved dependency | Need, license, bundle, a11y, reduced-motion, owner, removal plan | No dependency or component promotion here |
| Zero-consumer `Progress`, `ResponsiveTable`, `Separator`, `StatCard`, `Tooltip` | DS-01A provisional | Keep provisional until real semantic consumers exist | Consumer, NDS contract, tests, rollback | No deletion merely from zero consumer; separate decision |
| Brand-lab prototypes | DS-01B inventory-only prototype paths | None until explicitly selected | Owner disposition, source/evidence provenance, isolated route gate | Preserve historical evidence; no automatic publication |

## Migration order

1. Refresh exact `origin/main` and search current imports/routes/tests.
2. Name a replacement and owner for each candidate; freeze candidates without
   sufficient evidence.
3. Migrate one bounded consumer group with compatibility and rollback.
4. Verify source/tests, browser/accessibility/localization, delivery boundary,
   and historical evidence.
5. Retire only after a separate approved task proves zero consumers and safe
   rollback. Never treat route visibility or file absence as authorization.

## Required gates and exclusions

This register does not change aliases, redirects, routes, fonts, tokens,
components, prototypes, source, dependencies, APIs, providers, or archives.
Each retirement requires G3 exact-file review, G4 implementation authorization,
staged diff review, commit/push/PR/review/merge approvals, and a documented
rollback. Canonical promotion and delivery/readiness remain separate.

## Self-review

- [x] Each candidate has current evidence, replacement, proof, and delivery
  boundary.
- [x] Aliases, reserved routes, prototypes, and historical records remain
  non-destructively preserved.
- [x] Compatibility and zero-consumer items are not treated as deletions.
- [x] No source or delivery action was taken.

**Self-review result:** Pass as a candidate compatibility/retirement plan.
