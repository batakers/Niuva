# SRC-PUB-02 — Privacy and Not Found support-family G3 task card

**Status:** Historical G3 candidate review — documentation PASS WITH
CONDITIONS; source implementation remains split and separately gated
**Date:** 19 August 2026 (Asia/Jakarta)
**G3 baseline:** `origin/main` at
`f90bb7a71848c4f69563583fc685d1da0ea1fd41` (after documentation PR #303)
**Parent design task:** `PUB-06` — FAQ, Privacy, and Not Found support family
**Surface:** Public support/content
**Owner:** Public frontend driver; exact individual name is not part of the
repository contract

## Objective

Review the smallest remaining Public support-family candidate after the FAQ
consumer-state pilot: the localized Privacy policy page and the locale-aware
wildcard Not Found recovery page. The G3 review establishes two distinct
responsibilities; it does not require them to share one implementation gate.
The existing Public composition, metadata, localization, recovery, and
accessibility contracts must remain bounded without reopening FAQ, navigation,
route activation, policy authority, or a shared component redesign.

This card is a planning and review artifact. It does not authorize source
implementation, policy publication, legal approval, route activation, alias
redirect changes, indexing changes, or readiness/go-live claims.

## Authority and inputs

Read in this order before any later G4 decision:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. `docs/decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md`;
5. `docs/decisions/experience/DEC-UX-004-cross-surface-design-system-reconstruction.md`;
6. `DESIGN.md` within its approved scope;
7. `.design/niuva-frontend-blueprint/wireframes/public/SUPPORT_CONTENT_FAMILY.md`;
8. current source and tests at the G3 baseline; and
9. this candidate card.

The canonical Public pairs are `/privasi` and `/en/privacy`. The wildcard
Not Found route is locale-aware but is not an additional content owner. FAQ is
not in this card: its consumer-state source/test slice was implemented and
merged as [PR #301](https://github.com/batakers/Niuva/pull/301), source commit
`21c740facbc1d6cc1aabe892a753d9bfe6cef92f`, merge commit
`518f951d2dd7aa94c45b65b0f8944bee7b20fe11`.

## Current evidence at the selected SHA

### Privacy

- `App.js` owns `/privasi` and `/en/privacy` and does not create a second
  policy route.
- `publicRoutes.js` marks the Privacy pair translation-ready and supplies the
  self-canonical ID/EN metadata, reciprocal alternates, and `x-default` to
  the Indonesian route.
- `MarketingLayout` owns canonical, robots, alternate-language, and `lang`
  behavior. A Privacy page must not duplicate that metadata in page code.
- `PrivacyPolicyPage.jsx` contains separate ID/EN copy, a visible revision
  date, data-purpose/storage/sharing/cookie/rights sections, and contact links
  derived from the approved public settings boundary.
- The page visibly labels the current policy as `Draft` and states that it has
  not received legal review. This is a content-governance condition, not a
  defect that a frontend task may silently remove.
- `PrivacyPolicyPage.test.jsx` covers current-scope/provider-neutral copy,
  44px contact links, and English copy, but does not by itself prove browser
  metadata, legal approval, or policy completeness.

### Not Found

- `App.js` owns the wildcard `*` route and does not create route ownership for
  the missing pathname.
- `NotFoundPage.jsx` derives ID/EN from the current pathname and stored
  preference, exposes a visible 404 heading and missing-path explanation,
  provides localized Home and Contact actions, and lists only approved
  Public recovery destinations (Home, Services, Projects, Contact).
- The page does not expose reserved project-detail paths, invent aliases, or
  perform an IP/browser-language redirect.
- For a wildcard path, `MarketingLayout` treats the page as `noindex, follow`
  without a canonical or reciprocal `hreflang` set; this shared behavior is a
  read-only dependency of this card.
- `NotFoundPage.test.jsx` covers Indonesian and English headings, Home/Contact
  recovery, and document titles. It does not prove every helpful link,
  metadata boundary, or browser/assistive-technology result.

### Search decision

No search control is proposed for this slice. Privacy is a policy-reading
responsibility and Not Found is a recovery responsibility; neither has current
evidence that query, ranking, autocomplete, or filtering would improve the
task. If a future FAQ search is justified by volume evidence, it must remain a
separate FAQ task.

## G3-reviewed exact-file scope

The following are the only runtime/test paths eligible for a later, separately
authorized G4 source task:

### Runtime candidates

- `frontend/src/pages/marketing/PrivacyPolicyPage.jsx`
  - presentation, semantic structure, long-content/reflow behavior, and
    truthful ID/EN policy display only;
  - no legal claim, revision date, consent meaning, retention rule, provider
    assertion, or policy publication status may be invented or silently
    upgraded;
  - contact links remain user-initiated and use the approved public settings
    boundary.
- `frontend/src/pages/marketing/NotFoundPage.jsx`
  - visible missing-route explanation, locale-safe recovery, helpful-link
    presentation, focus/keyboard behavior, and reduced-motion treatment only;
  - no alias, redirect, sitemap, canonical, analytics, route activation, or
    route-inventory behavior may be added in this file.

### Existing test candidates

- `frontend/src/pages/marketing/PrivacyPolicyPage.test.jsx`
- `frontend/src/pages/marketing/NotFoundPage.test.jsx`

Tests may be extended only to prove behavior that belongs to the two named
pages: ID/EN content selection, truthful copy boundaries, visible recovery,
semantic relationships, keyboard reachability, and duplicate-safe rendering.
They must not turn mocked page tests into evidence of legal approval, server
metadata, provider activation, or production readiness.

### Read-only route, metadata, and component references

These files are inspected to verify ownership and regression boundaries but are
not in the G4 change set:

- `frontend/src/App.js`;
- `frontend/src/App.route.contract.test.js`;
- `frontend/src/lib/publicRoutes.js`;
- `frontend/src/lib/publicRoutes.test.js`;
- `frontend/src/components/layout/Layout.jsx`;
- `frontend/src/components/layout/Layout.test.jsx`;
- `frontend/src/components/brand/BrandSystem.jsx`;
- `frontend/src/components/brand/CompanyProfileBlocks.jsx`;
- `frontend/src/i18n.js`; and
- the current FAQ paths delivered by PR #301.

If a real routing or metadata defect is discovered, stop and create a new
exact-file amendment. Do not expand this card opportunistically.

## Required state and content contract

### Privacy

- **Ready:** current approved revision, scope, purpose, storage/sharing,
  cookie/local-storage, rights, and official contact route are legible in the
  selected language.
- **Localization:** `/privasi` is Indonesian; `/en/privacy` is complete
  English only when the content owner has approved the translation. No machine
  translation or invented reciprocal route.
- **Draft/content hold:** the visible Draft/legal-review notice remains until
  an authorized content owner records legal review and a new revision. UI work
  may not remove it.
- **Long content:** headings, lists, links, and contact actions remain usable
  at 200% zoom and Indonesian/English long-content widths without horizontal
  overflow.
- **Recovery:** contact links remain available without asserting a legal
  remedy, guaranteed response, provider, or deletion result.
- **Accessibility:** semantic headings/sections/lists, visible focus, 44px
  contact targets, non-color-only state, and reduced-motion-safe content.

### Not Found

- **Ready:** visible 404/missing-path explanation and a clear next action.
- **Locale:** an unknown `/en/...` path stays in the English recovery journey;
  other unknown Public paths use Indonesian/stored preference. No automatic
  locale redirect.
- **Recovery:** Home, Services, Projects, and Contact links remain canonical
  and route-owned; no reserved detail route or compatibility alias is
  presented as active.
- **Metadata:** wildcard behavior remains `noindex, follow` without a
  fabricated canonical or `hreflang`; `Layout` remains the owner.
- **Accessibility:** one meaningful heading, labeled recovery navigation,
  keyboard-visible focus, 44px targets, readable path text, and static
  complete content under reduced motion.
- **Failure boundary:** a missing route is not represented as a dependency
  failure, permission grant, persisted action, or successful navigation.

## Acceptance criteria for G3/G4 planning

- Exact runtime and existing test paths above are confirmed against the
  selected SHA; no broad Public or shared-component scope is implied.
- Privacy and Not Found remain separate content/recovery responsibilities;
  FAQ remains the already-delivered PR #301 slice.
- ID/EN, metadata ownership, noindex/canonical behavior, focus, 200% reflow,
  reduced motion, and 44px targets are explicitly testable.
- Privacy's Draft/legal-review status and factual copy remain governed by the
  content owner; no legal-readiness claim is made.
- No search, new dependency, route, alias, redirect, API, schema, provider,
  backend, session, payment, upload, or business-rule change is included.
- Any later G4 claim requires focused tests, full regression, production
  build, dependency/diff checks, browser and Axe evidence at the repository
  viewports, and Impeccable Public-register review. These are not established
  by this G3 card.

## G3 result and next gate

**Self-review result:** PASS WITH CONDITIONS for a bounded candidate G3 scope;
the documentation review is closed by the backlog reconciliation ledger.
The route owners, two-page exact-file boundary, read-only references, state
contract, search decision, and content/legal hold were initially reviewed at
`518f951d2dd7aa94c45b65b0f8944bee7b20fe11` and revalidated against the current
`origin/main` `f90bb7a71848c4f69563583fc685d1da0ea1fd41` during this Goal.

## G4 split disposition

The combined G3 review is now split into two separately governed follow-ups:

- **SRC-PUB-02A — Not Found:** a companion G4 task card
  [`PUBLIC_NOT_FOUND_G4_TASK_CARD.md`](PUBLIC_NOT_FOUND_G4_TASK_CARD.md) covers
  only `NotFoundPage.jsx` and `NotFoundPage.test.jsx`. Its scope is localized
  recovery, long-path-safe presentation, page-local copy/metadata, and
  proportional tests. It does not change route or shared metadata ownership.
- **SRC-PUB-02B — Privacy:** `/privasi` and `/en/privacy`, their page/test
  paths, and any policy publication remain held until legal/content review
  supplies an approved revision. No Privacy G4 is implied by the Not Found
  companion.

The next source gate is therefore the Not Found companion only. G3 does not
change source, stage files, activate routes, publish policy, establish
provider/server behavior, or imply readiness/go-live.

## Rollback and exclusions

This card is documentation-only and reversible by reverting its documentation
commit. The Not Found companion defines its own rollback limited to its two
exact source/test paths. Any later Privacy task must define a separate exact
scope after legal/content approval, preserving route ownership, metadata owner,
FAQ PR #301, historical prototypes, aliases, and all other surfaces.

Explicitly excluded:

- legal approval or publication of Privacy policy content;
- FAQ source/test changes already delivered by PR #301;
- `App.js`, `Layout`, `publicRoutes`, shared Brand components, or global i18n
  changes;
- new search, route, alias, redirect, sitemap, indexing, analytics, API,
  schema, provider, backend, session, payment, upload, or dependency work;
- canonical design-system promotion, broad redesign, deployment, readiness,
  or go-live; and
- any stage, commit, push, PR, or merge authority beyond the separately
  authorized documentation Goal.
