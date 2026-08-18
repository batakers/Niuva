# QA-01 — Responsive and localization validation matrix

**Status:** Candidate artifact validation with bounded source-pilot evidence —
not server, production, or readiness evidence
**Selected SHA:** `814a46329b8de7775c2de8b1ee34536d73df63e1`
**Scope:** Wave B calibration artifacts and their static plates/specifications
**Owner:** Frontend blueprint workstream
**Authority:** `AGENTS.md` → canonical Niuva reading order → `DESIGN_BRIEF.md` →
`INFORMATION_ARCHITECTURE.md` → `DESIGN_TOKENS.md` → DS-01A/DS-01B and DS-02–DS-05

## Evidence boundary

This register checks whether the design artifacts state a complete responsive
and localization contract. It does not claim that the current application or
the static HTML plates were exercised in a browser. No source files were
changed and no screenshots, axe run, or measured DOM inspection was performed
for this documentation-only pass. The bounded source-pilot addendum below
records measured browser runs for Account/Auth and Operations only; it does not
promote the remaining rows or establish server, staging, production, or
readiness evidence.

## Width and locale matrix

| Calibration artifact | 320px resilience | 390px baseline | 768px intermediate | 1024px compact | 1440px wide | 200% zoom/reflow | ID/EN and long-content | Critical action/context | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `PUB-01` Homepage structure and plates | Single-column fallback; no required side-by-side dependency | Primary mobile order and Contact reachability specified | Process and evidence can expand without new hierarchy | Editorial bands may align while preserving measure | Full hierarchy, four equal Services, one process rail | Content remains in document order; no fixed-height dependency | Indonesian-first plus English counterpart; long labels wrap | B2B inquiry remains primary; Retail secondary; locale context retained | **Pass as artifact / runtime hold** |
| `PUB-03` Contact Inquiry specimen | Form controls stack; success reference remains visible | Full field order, consent, failure, and recovery remain readable | Two-column grouping is optional, never required | Wider form measure without hiding consent | Success UUID and next action remain in the primary surface | Error summary and field relationships remain reachable | Exact consent is preserved; ID/EN error copy must expand | Persisted Inquiry UUID precedes optional WhatsApp | **Pass as artifact / runtime hold** |
| `COM-01` Retail catalog | Filters collapse to an explicit control; result state is not clipped | Product names and unavailable state wrap | Filter/result relationship remains visible | Collection density may increase without changing authority | Catalog can expose discovery hierarchy without checkout promise | Result count, reset, and next action reflow | ID/EN names and category labels are allowed to grow | Discovery only; no guest checkout or authoritative price claim | **Pass as artifact / runtime hold** |
| `COM-02` Retail product detail | Configuration groups stack; safe next action remains visible | File/eligibility messaging remains in flow | Media and details may sit adjacent | Detail hierarchy remains product-first | Evidence and configuration context remain distinct | No hidden action or clipped status | Localized configuration and eligibility copy wraps | Authentication/validation boundary stays explicit | **Pass as artifact / runtime hold** |
| `AUTH-01` Customer/staff login | One-column form with visible destination context | Labels, error, and recovery link stay actionable | Shared mechanics, distinct destinations | Staff/customer composition remains separate | Auth shell does not inherit Public campaign layout | Labels and errors remain associated at zoom | ID/EN long labels and non-enumerating copy are supported | Safe return is owned and bounded by route allowlists | **Pass as artifact / runtime hold** |
| `ACC-01` Owned order flow | Record summary stacks; no protected detail leak | Status/reference and next owned action remain visible | List/detail relationship stays understandable | Density may increase only with projection safety | Customer record hierarchy remains task-oriented | No loss of record identity or action | ID/EN status labels and empty/error copy wrap | Customer-safe projection and owned-resource return | **Pass as artifact / runtime hold** |
| `OPS-01` Inquiry queue/detail | Queue controls become a readable stack; no invented KPI | Role-aware action remains visible | Queue/detail split remains explicit | Operational density can increase with role boundaries | Work-home/detail context remains auditable | Critical state and permission copy reflow | Staff labels and history fields may grow | Authorization is not inferred from route visibility | **Pass as artifact / runtime hold** |

## Bounded source-pilot runtime addendum

| Pilot | Exact source evidence | Browser matrix | Measured result | Remaining hold |
| --- | --- | --- | --- | --- |
| `AUTH-01` Customer Login/recovery | Source `18821fd`; PR [#288](https://github.com/batakers/Niuva/pull/288); merge `0cc824f522e00190a16db5c73d4d7615acf2b698` | ID/EN × 320/390/1440; `/login`, `/forgot-password`, `/reset-password` | No overflow or page exception; Axe 0; reset token removed from the URL; keyboard smoke reached the site-return control | Backend session, identity, provider, staging, and production enforcement remain held |
| `OPS-01` Inquiry queue/detail | Source `d5f6877`; PR [#290](https://github.com/batakers/Niuva/pull/290); merge `814a46329b8de7775c2de8b1ee34536d73df63e1` | ID/EN × 390/768/1024/1440; work home, Inquiry list/detail, Quote detail with mocked API boundary | 32/32 cases: no overflow, page errors, or serious/critical Axe findings | Backend authorization, API truth, server projection, staging, and production remain held |

These measurements are source-pilot evidence attached to exact merged commits.
The mocked API boundary proves only client rendering and interaction under the
supplied fixtures; it does not prove backend behavior or readiness.

## Deferred measurement checklist for later browser evidence

The following measurements are intentionally deferred. This documentation
reconciliation did not run a browser, zoom, assistive-technology, or long-
content session for the remaining unimplemented artifacts, so no checkbox is
converted into a false pass:

- **Deferred:** capture each remaining unimplemented artifact at 320, 390, 768,
  1024, and 1440px.
- **Deferred:** check horizontal overflow, clipped focus, lost primary action,
  and fixed height/width assumptions.
- **Deferred:** repeat at 200% zoom/reflow with keyboard access to the same
  action.
- **Deferred:** repeat in Indonesian and English with intentionally long
  labels, errors, names, and status text.
- **Deferred:** record artifact revision, browser, viewport, and screenshot
  path before calling a source pilot responsive-ready.

## Findings and dispositions

No P0/P1 defect is observable from the static structures or the two bounded
source-pilot matrices above. The remaining hold is evidence-related for the
unimplemented rows: runtime/browser measurements, server behavior, and
readiness evidence have not been performed. Any future measured defect returns
to the owning task rather than being silently fixed in a later surface.

## Self-review

- [x] All Wave B calibration surfaces have a row and a named critical action.
- [x] All required widths, 200% reflow, ID/EN, and long-content checks are
  represented.
- [x] Public, Commerce, Account/Auth, and Operations responsibilities remain
  separate.
- [x] Artifact review is explicitly distinguished from browser/runtime proof.
- [x] No route, token, API, lifecycle, or application source was changed by
  this ledger reconciliation.
- [x] Account/Auth and Operations runtime measurements are tied to exact merged
  source commits without being generalized to other rows.

**Self-review result:** Pass with bounded runtime evidence recorded for
`AUTH-01` and `OPS-01`; remaining artifacts retain their runtime hold.
