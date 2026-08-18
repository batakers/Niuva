# SRC-PUB-02A — Public Not Found G4 exact-file task card

**Status:** G4 exact-file scope — Not Found only; implementation is bounded to
the autonomous Goal and remains separate from Privacy legal/content approval
**Date:** 19 August 2026 (Asia/Jakarta)
**G4 baseline:** `origin/main` at `f90bb7a71848c4f69563583fc685d1da0ea1fd41`
**Parent G3 card:** [`PUBLIC_SUPPORT_PRIVACY_NOT_FOUND_G3_TASK_CARD.md`](PUBLIC_SUPPORT_PRIVACY_NOT_FOUND_G3_TASK_CARD.md)
**Parent design task:** `PUB-06` — FAQ, Privacy, and Not Found support family
**Surface:** Public support/recovery
**Owner:** Public frontend driver; exact individual name is not part of the
repository contract

## Objective

Deliver the smallest Not Found recovery slice from the reviewed Privacy/Not
Found G3 card. The slice may improve the visible 404 explanation, canonical
recovery links, path readability, localized ID/EN copy, and page-local
metadata presentation without changing route ownership or shared metadata
ownership. Privacy is deliberately not part of this G4 task: its Draft/legal-
review hold remains until an authorized content owner supplies legal approval
and a new revision.

This card authorizes no broad Public redesign, route activation, alias or
redirect work, backend behavior, provider capability, readiness, staging,
production, or go-live claim.

## Authority and reading order

Use the authority order already recorded in the parent card:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. the applicable approved Public route and design decisions;
5. `DESIGN.md` within its approved scope;
6. the parent G3 card and current source/tests at the selected baseline; and
7. this exact-file task card.

The parent G3 card remains the record of the combined review. This card is the
Not Found companion only; it does not promote the parent card, the blueprint,
or any prototype to canonical runtime authority.

## Exact change set

Only these two paths may be changed by the Not Found source slice:

### Runtime

- `frontend/src/pages/marketing/NotFoundPage.jsx`

Allowed changes are limited to:

- keeping the wildcard page locale-aware for Indonesian and English without an
  automatic locale redirect;
- keeping the visible 404/missing-path explanation and canonical recovery
  links for Home, Services, Projects, and Contact;
- making an arbitrary or very long missing path readable without introducing
  horizontal overflow;
- preserving semantic heading/recovery navigation, visible keyboard focus,
  general 44px interaction targets, and complete static content under reduced
  motion; and
- keeping page-owned `document.title` and description copy truthful and
  localized.

### Tests

- `frontend/src/pages/marketing/NotFoundPage.test.jsx`

Tests may prove only the behavior owned by the named page: ID/EN selection,
canonical recovery destinations, long-path-safe rendering, visible semantic
relationships, localized title/description, keyboard-reachable recovery, and
duplicate-safe rendering. Tests must not claim server metadata, legal/privacy
approval, route activation, provider behavior, or production readiness.

## Read-only boundaries

These files may be inspected for ownership and regression checks but must not
be modified by this slice:

- `frontend/src/App.js` and `frontend/src/App.route.contract.test.js`;
- `frontend/src/lib/publicRoutes.js` and `frontend/src/lib/publicRoutes.test.js`;
- `frontend/src/components/layout/Layout.jsx` and
  `frontend/src/components/layout/Layout.test.jsx`;
- `frontend/src/components/brand/BrandSystem.jsx` and
  `frontend/src/components/brand/CompanyProfileBlocks.jsx`; and
- `frontend/src/i18n.js`.

`App.js` remains the owner of the wildcard route. `MarketingLayout` remains the
owner of wildcard `noindex, follow`, canonical omission, and alternate-link
removal. The Not Found page must not add a canonical, `hreflang`, sitemap,
redirect, alias, or analytics identity. If a real routing or shared metadata
defect is found, stop and open a new exact-file amendment instead of expanding
this task.

Privacy paths and files are explicitly held and must not be touched:

- `/privasi` and `/en/privacy`;
- `frontend/src/pages/marketing/PrivacyPolicyPage.jsx`; and
- `frontend/src/pages/marketing/PrivacyPolicyPage.test.jsx`.

## State and content contract

| State | Required contract | Prohibited shortcut |
| --- | --- | --- |
| Ready | One meaningful localized 404 heading, readable missing-path explanation, and clear recovery action. | Generic `Sent`, blank shell, or an invented route owner. |
| Indonesian | Unknown non-`/en` Public paths use Indonesian/stored preference as already defined by the current route contract. | IP/browser-language redirect. |
| English | Unknown `/en/...` paths remain in the English recovery journey. | Falling back to Indonesian or inventing an `/en` counterpart for a private route. |
| Recovery | Home, Services, Projects, and Contact are visible canonical destinations with no reserved project-detail link. | Activating aliases, reserved detail routes, sitemap entries, or redirects. |
| Long path | Arbitrary path text wraps or breaks safely while remaining available to sighted and assistive users. | Unbounded unbroken text that causes horizontal overflow or is hidden behind hover. |
| Focus/keyboard | Recovery navigation has a semantic label, deterministic tab order, visible focus, and targets at least the repository mobile floor. | Mouse-only recovery or outline removal without replacement. |
| Reduced motion | Complete static copy and recovery remain available; no meaning depends on animation. | Global transition reset or motion-dependent state. |
| Failure boundary | A missing route is an informational recovery state, not a dependency, permission, persistence, payment, or provider failure. | Fake success, retry loop, or state-machine implication. |

The page may not add search. The current Search UX review found no evidence
that query, ranking, autocomplete, or filtering improves this recovery task;
FAQ search remains a separate future decision.

## Verification contract

Before delivery, run and record, where available:

- focused `NotFoundPage` tests;
- full frontend regression and production build;
- dependency and `git diff --check` checks;
- ID/EN browser checks at 320, 390, 768, 1024, and 1440px for unknown paths;
- keyboard/focus and reduced-motion checks;
- Axe or equivalent accessibility scan; and
- Impeccable Public-register review for overflow, hierarchy, truthfulness, and
  anti-template behavior.

If browser or assistive-technology tooling is unavailable, report that as an
evidence limitation. Green source tests do not prove server routing, staging,
production, provider, readiness, or go-live behavior.

## Rollback and delivery boundary

Rollback is a revert of the one Not Found source/test commit and may touch only
the two exact paths above. No dependency, route, metadata owner, Privacy file,
backend, API, schema, session, payment, upload, or business-rule file may be
included.

The autonomous Goal may stage exact paths, create one corrective commit, push a
dedicated branch, open a PR, review CI and review threads, repair bounded
findings, and merge the exact tested head. Those delivery actions do not imply
canonical promotion, staging/production enforcement, readiness, or go-live.

Privacy remains a separate next task after legal/content review; it is not
unblocked by this Not Found implementation.
