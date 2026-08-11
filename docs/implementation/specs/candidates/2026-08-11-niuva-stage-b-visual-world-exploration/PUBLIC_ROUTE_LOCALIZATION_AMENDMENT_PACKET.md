# Candidate Public Route Localization Amendment Packet

Status: **OWNER-APPROVED DOCUMENTATION AMENDMENT APPLIED LOCALLY — CANONICAL
PUBLICATION PENDING; NO IMPLEMENTATION AUTHORITY**

Prepared: 11 August 2026 (Asia/Jakarta)

Baseline: `origin/main` at `65604969bfa0fed9ae1d4f72939b6adc177cd5b7`

Related brief:
[`CONFIRMED_CANDIDATE_DESIGN_BRIEF.md`](CONFIRMED_CANDIDATE_DESIGN_BRIEF.md)

Target canonical decision:
[`DEC-UX-003`](../../../../decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md)

## 1. Purpose and authority boundary

This packet records the owner's approved direction for localized Public
marketing routes and the documentation-only amendment applied locally to the
current `DEC-UX-003` route contract.

The owner approved the following three decisions on 11 August 2026:

1. localize the complete Public marketing route family rather than only the
   service overview route;
2. keep each individual project slug stable across Indonesian and English; and
3. retain superseded Public paths as permanent one-hop compatibility redirects
   with no independent content ownership.

The already-confirmed Navbar refinement is carried into this packet: the
visible label is `Layanan` in Indonesian and `Services` in English, and the
language control uses a conventional globe plus a visible active language code
rather than an unexplained globe-only control.

The promoted canonical documents govern only the approved route, alias, locale,
fallback, reserved-project-detail, and retained-Retail boundaries. This packet
does **not** change source or route behavior, activate an indexed locale, create
a project-detail route, modify CMS schema, select hosting or redirect
infrastructure, or authorize commit, push, PR, deployment, readiness, or
go-live.

## 2. Historical conflict resolved by the documentation amendment

Before this documentation amendment, the approved `DEC-UX-003` stated:

- `/capabilities` is the canonical service overview;
- `/services` permanently redirects to `/capabilities`;
- `/projects` is the canonical project proof surface;
- `/portfolio` permanently redirects to `/projects`; and
- `/about`, `/contact`, `/privacy`, `/faq`, and `/retail` retain their existing
  responsibilities;
- `/retail/products/:slug` retains its existing Public Retail product-detail
  responsibility; and
- `/retail/products/:slug/configure` and downstream Retail transaction routes
  retain their existing route responsibilities.

Current frontend source and release generation still follow the former route
contract. The documentation-only amendment now makes the localized direction
canonical, but it does not make the routes implemented or active. A canonical
document cannot override current runtime behavior without a separately
authorized source, migration, delivery, and validation task.

## 3. Owner-approved promoted decisions

| ID | Owner-approved promoted decision | Reason |
| --- | --- | --- |
| `PRL-01` | Use lowercase, language-specific Public marketing slugs: unprefixed Indonesian and `/en`-prefixed English. | The route communicates the selected language consistently with the localized navigation and page copy. |
| `PRL-02` | Localize a project-detail route prefix but keep the individual project `:slug` stable across ID and EN. | One project retains one durable CMS identity without requiring operators to maintain paired slugs. |
| `PRL-03` | Redirect superseded Public paths permanently, in one hop, to the localized canonical destination while carrying applicable query parameters and preserving browser fragment context through standards-defined user-agent inheritance. | Existing links remain recoverable without duplicate content, CMS records, sitemap entries, or analytics identities. |

All canonical route strings are lowercase. Mixed-case examples such as
`/Layanan` and `/en/Services` are not canonical and must not be emitted by the
application, CMS, sitemap, or language selector.

## 4. Candidate canonical route map

### 4.1 Indexable Public routes

| Page responsibility | Indonesian | English | Disposition |
| --- | --- | --- | --- |
| Homepage | `/` | `/en` | Localized pair |
| Company and approach | `/tentang` | `/en/about` | Localized pair |
| Service overview | `/layanan` | `/en/services` | Localized pair; UI label is `Layanan` / `Services` |
| Project archive | `/proyek` | `/en/projects` | Localized pair |
| B2B inquiry and contact | `/kontak` | `/en/contact` | Localized pair; form-first Inquiry contract remains unchanged |
| Retail entry | `/retail` | `/en/retail` | Localized pair; Retail lifecycle and activation gates remain unchanged |
| FAQ | `/faq` | `/en/faq` | Secondary Public pair; outside primary navigation |
| Privacy | `/privasi` | `/en/privacy` | Utility/legal pair; outside primary navigation |

Private Login, customer, Admin, and operational routes remain unprefixed and
`noindex`. They consume the explicit global language preference without
becoming part of the Public SEO route family.

### 4.2 Reserved project-detail direction and stable slug rule

The candidate naming direction localizes the route prefix while keeping the
project slug stable:

```text
/proyek/pindad-ev-motor
/en/projects/pindad-ev-motor
```

CMS title and body translations may differ, but a future language switch must
resolve the same underlying published project record. Missing English content
follows the approved honest-fallback policy and does not create a second slug
or a machine-translated record.

This is a **reserved naming direction**, not an active canonical route. It does
not activate `/proyek/:slug` or `/en/projects/:slug` and must not create
navigation, CMS URL output, `hreflang`, sitemap, analytics, or production route
ownership. The exact project-detail production route remains a separate
route/product decision.

### 4.3 Retained Retail route boundary

Only the Retail entry receives a localized Public pair in this packet. The
existing `/retail/products/:slug`,
`/retail/products/:slug/configure`, Request, Offer, checkout, and other
downstream Retail routes remain unprefixed and retain their current
responsibilities under `DEC-UX-003`. They consume the same explicit global
language preference without gaining a second route identity.

This packet makes no multilingual SEO or indexability claim for those retained
Retail routes. Localized Retail product URLs require a separate route, content,
canonical, sitemap, and migration decision. Nothing here changes Retail Order,
Request, Offer, checkout, payment, production, fulfillment, or after-sales
lifecycle ownership.

## 5. Compatibility redirect contract

| Superseded path | Destination | Ownership after promotion |
| --- | --- | --- |
| `/about` | `/tentang` | Redirect only |
| `/capabilities` | `/layanan` | Redirect only |
| `/services` | `/layanan` | Redirect only |
| `/projects` | `/proyek` | Redirect only |
| `/portfolio` | `/proyek` | Redirect only |
| `/contact` | `/kontak` | Redirect only |
| `/privacy` | `/privasi` | Redirect only |
| `/en/capabilities` | `/en/services` | Redirect only |

The target contract is an HTTP `308` permanent redirect at the eventual public
delivery boundary. The implementation must:

- resolve in one hop to the final localized canonical URL;
- carry applicable query parameters in `Location`; because a fragment is not
  sent to the server, leave it unoverridden so a conforming user agent inherits
  the original fragment under RFC 9110 Section 10.2.2, then verify that browser
  behavior at the selected delivery boundary;
- exclude redirect-only URLs from the sitemap and `hreflang` set;
- emit no canonical tag that points to a redirect-only URL;
- create no duplicate CMS record or independent analytics page identity; and
- preserve the existing fail-safe not-found behavior for unknown paths rather
  than guessing content.

Exact hosting, edge, or server configuration remains an implementation and
deployment decision. A client-only redirect is not sufficient final SEO
evidence, although it may remain temporary local compatibility behavior until
the approved delivery boundary exists.

## 6. Navbar and language-switch behavior

Candidate Indonesian order:

```text
niuva | Layanan | Proyek | Tentang | Kontak | Retail |
globe + ID | Masuk | Diskusikan project
```

Candidate English order:

```text
niuva | Services | Projects | About | Contact | Retail |
globe + EN | Sign in | Discuss a project
```

The language control is a labelled choice, not an unlabeled toggle:

- the active `ID` or `EN` code remains visible beside the globe on desktop;
- mobile exposes full `Bahasa Indonesia` and `English` choices high in the
  menu;
- the accessible name states the current language and action;
- on a complete localized Public pair, each choice is a real link to the
  current page's counterpart;
- no IP, browser-language, or inferred-location redirect overrides the user's
  explicit choice; and
- `/retail` and `/en/retail` navigate to one another, while retained unprefixed
  downstream Retail, Login, customer, Admin, and operational routes preserve
  the current canonical URL and owned-resource context, update the same stored
  preference and supported interface copy, and gain no invented `/en` path.

## 7. Canonical, `hreflang`, sitemap, and fallback rules

For a complete translated pair:

1. each localized page is self-canonical;
2. Indonesian markup uses `lang="id"` and `hreflang="id"`; English markup uses
   `lang="en"` and `hreflang="en"`. Visible selector codes remain `ID` and
   `EN`;
3. Indonesian and English pages emit reciprocal annotations;
4. `x-default` points to the Indonesian counterpart for the same content
   responsibility, such as `/layanan` for the Layanan / Services pair;
5. only the Homepage pair uses `/` as `x-default`;
6. both localized canonical URLs enter the applicable sitemap; and
7. the language selector links the exact counterpart, not only the locale
   Homepage.

The existing CMS fallback remains unchanged:

- Indonesian content is required and English is optional;
- system, Navbar, conversion, form, error, privacy, and CTA copy must be
  complete before the switch activates;
- missing English CMS content may display Indonesian with the visible notice
  `English translation belum tersedia`;
- that fallback emits `noindex,follow`, points its canonical metadata to the
  Indonesian source route for the same content, stays out of the English
  sitemap, and is not emitted as an English `hreflang` counterpart;
- once English becomes ready, the route becomes self-canonical and enters the
  reciprocal annotation and sitemap set; and
- no automatic machine translation is introduced.

Localized slugs improve language consistency and human readability. This
packet does not claim or guarantee a ranking increase.

## 8. Public page-role boundary retained

Route localization does not collapse the Public site into one page:

- Home remains a curated entry with at most three featured projects;
- About / Tentang remains concise and factual;
- Layanan / Services owns the complete service explanation;
- Proyek / Projects owns the growing evidence archive;
- Kontak / Contact owns the B2B inquiry and response contract;
- Home carries a compact FAQ preview while `/faq` and `/en/faq` remain the
  complete secondary routes; and
- Retail remains a separate customer journey inside the same website and
  operational platform.

## 9. Alternatives considered

### Keep `/capabilities` in both languages

- Advantage: no canonical route migration or redirect expansion.
- Rejected candidate direction: the visible `Layanan` / `Services` naming and
  language-specific Public copy would not extend to the URL.

### Localize only the service route

- Advantage: smaller change surface.
- Rejected candidate direction: one Indonesian slug inside an otherwise
  English-slug Indonesian route family produces an inconsistent information
  architecture.

### Translate individual project slugs

- Advantage: every URL segment could match the page language.
- Rejected candidate direction: it creates paired-slug maintenance, collision,
  language-switch, and CMS recovery risk for one underlying project record.

## 10. Promoted canonical amendment scope

| Canonical surface | Promoted treatment | Not promoted |
| --- | --- | --- |
| `DEC-UX-003` Public routes | Replaced only the Public marketing canonical/alias subsection with the localized route and redirect contract in this packet; explicitly retained existing downstream Retail route responsibilities. | Activating project-detail routes; localizing Retail product/transaction routes; changing Retail, customer, Admin, authentication, authorization, or lifecycle ownership. |
| `DEC-UX-003` NUF mapping | Amended `NUF-R02` so `/layanan` and `/proyek` become the Indonesian canonical marketing routes, with their English counterparts and legacy redirects; recorded project-detail prefixes only as a reserved naming direction. | Reopening `NUF-R01` or `NUF-R03` through `NUF-R12`; treating a reserved project-detail prefix as active route ownership. |
| `DECISION_REGISTER.md` | Recorded the documentation amendment, effective date, and owner approval. | Claiming source implementation or route activation. |
| `DOCUMENT_REGISTER.md` | Recorded the amended `DEC-UX-003` authority and candidate evidence. | Promoting the Stage B visual direction or `DESIGN.md` automatically. |
| Master Specification | Reconciled only exact route references affected by the amendment after a source-of-truth comparison. | Broad PRD, product-scope, provider, readiness, or go-live changes. |

The promotion preserved the historical reasoning in `DEC-UX-003` by amending,
rather than deleting, the old route record.

## 11. Later implementation impact — not authorized

An eventual implementation task must audit and update, at minimum:

- `frontend/src/App.js` route registration and compatibility redirects;
- `frontend/src/components/layout/PublicNavigation.jsx`;
- `frontend/src/components/layout/Footer.jsx`;
- `frontend/src/components/layout/Layout.jsx` metadata and canonical mapping;
- all Public cross-links and active-navigation aliases;
- `frontend/scripts/generate-release-files.js` sitemap/release route list;
- route, navigation, metadata, redirect, language, and sitemap tests;
- public delivery/hosting redirect behavior; and
- CMS URL builders or preview links that emit Public routes.

Before implementation, the task must identify every route string by source
search, define an exact redirect matrix, carry query parameters, verify
standards-defined browser fragment inheritance, and verify direct loads on the
deployment topology. No source file listed here is authorized for change by
this packet.

Before activation, that implementation task must also provide:

- an atomic rollout and rollback matrix for route registration, compatibility
  redirects, internal links, canonical tags, `hreflang`, and sitemap output,
  without leaving mixed content ownership or redirect loops;
- rollback triggers for unexpected 404s, redirect failures or loops, canonical
  or `hreflang` mismatches, sitemap drift, and material indexing anomalies;
- a named accountable delivery owner, reviewer, and operational handover
  recipient rather than assuming ownership from this documentation packet; and
- captured before/after evidence for direct loads, redirect status and
  `Location`, query handling, browser fragment behavior, canonical and
  `hreflang` output, sitemap membership, monitoring, and rollback verification.

## 12. Validation and approval checklist

- [x] Owner approved localization of the complete Public marketing route
      family.
- [x] Owner approved stable project slugs across ID and EN.
- [x] Owner approved permanent compatibility redirects.
- [x] Canonical route strings are lowercase.
- [x] `Layanan` / `Services` naming and globe-plus-code language control are
      consistent with the confirmed candidate brief.
- [x] Public page roles and separate Retail lifecycle remain unchanged.
- [x] Existing Retail product, configurator, and downstream transaction routes
      remain unprefixed and outside this localization amendment.
- [x] Project-detail prefixes are recorded only as a reserved naming direction.
- [x] UI codes `ID` / `EN` are distinguished from document and `hreflang`
      codes `id` / `en`.
- [x] `x-default` preserves same-content responsibility and points to `/` only
      for the Homepage pair.
- [x] English-missing fallback, `noindex`, sitemap, and `hreflang` boundaries
      remain explicit.
- [x] Later implementation requires explicit rollout, rollback, ownership,
      handover, monitoring, and verification evidence before activation.
- [x] Owner reviewed the remediated packet.
- [x] Owner explicitly authorized documentation-only canonical promotion.
- [x] `DEC-UX-003`, `NIUVA_MASTER_SPEC.md`, `DOCUMENT_REGISTER.md`, and
      `DECISION_REGISTER.md` have been amended locally.
- [ ] The six-document promotion bundle has been published through a separately
      authorized Git workflow.
- [ ] Source implementation has been separately authorized and validated.

## 13. Next gate

The documentation-only canonical amendment is complete in this worktree. The
next separately authorized action is to stage exactly the two provenance
artifacts and four amended canonical documents, then commit, push, and open a
documentation PR. Publication must still leave application source, CMS schema,
hosting, deployment, readiness, and go-live unchanged. Source implementation
remains a later, separately authorized task after the documentation PR merges.
