# Niuva Confirmed Candidate Design Brief

Status: **OWNER-CONFIRMED CANDIDATE — ROUTE PORTION PROMOTED LOCALLY;
VISUAL DIRECTION REMAINS CANDIDATE ONLY**

Date confirmed: 11 August 2026

Baseline: `origin/main` at `65604969bfa0fed9ae1d4f72939b6adc177cd5b7`

## Authority and disposition

This brief closes the Stage B owner discussion for the Public visual direction,
Navbar, Homepage information architecture, language behavior, CMS translation
fallback, and multilingual SEO. It is subordinate to the Master Specification,
Document Register, Decision Register, applicable approved decisions, and current
production guardrails.

Within the Stage B candidate workspace, this brief supersedes earlier
exploration notes wherever they still mention an asymmetric hero, acid lime, an
unconfirmed font comparison, or owner confirmation still being required.

This brief does **not** amend `DESIGN.md`, replace production tokens, activate a
route or provider, change source or dependencies, authorize CMS schema work, or
grant commit, push, PR, deployment, readiness, or go-live authority.

The owner-approved Public route-localization refinement is recorded in
[`PUBLIC_ROUTE_LOCALIZATION_AMENDMENT_PACKET.md`](PUBLIC_ROUTE_LOCALIZATION_AMENDMENT_PACKET.md).
Its route, alias, locale, fallback, and retained-Retail boundaries were
explicitly approved and applied to `DEC-UX-003`, the Master Specification, and
the applicable registers on 11 August 2026. Those canonical documents now
govern that bounded portion. Typography, palette, motion, composition, and all
other Stage B visual direction in this brief remain candidate-only.

## Job, audience, and proof

The Homepage must help a visitor understand that Niuva turns uncertain ideas
into forms that can be investigated, prototyped, tested, and prepared for real
use.

- Primary audience: B2B decision-makers, product teams, institutions, and
  prospective partners.
- Secondary audience: Retail customers looking for Custom 3D Print or Ready
  Products.
- Primary action: start a project discussion or recorded inquiry.
- Proof: real Niuva project and process artifacts, factual decisions, and
  observable outputs. Never use invented metrics, clients, testimonials,
  dashboards, or generated imagery as if they were real evidence.

## Confirmed candidate decisions

| ID | Confirmed direction |
| --- | --- |
| `NCDB-01` | One Niuva identity spans Public, Retail, customer, Auth, and Admin, while each surface retains its own composition and lifecycle. |
| `NCDB-02` | The official lowercase `ni` mark remains mandatory. Niuva blue remains the primary identity color through a tonal family rather than one hex used everywhere. |
| `NCDB-03` | Mona Sans Variable is the primary candidate family; Bona Nova Italic is restrained expressive punctuation on Public only. Hanken Grotesk remains comparison evidence, not the selected direction. |
| `NCDB-04` | The Public hero is centered, project-neutral, and refuses a split-hero or one-project shortcut. The current headline candidate is “Dari gagasan menjadi bentuk yang bisa diuji.” |
| `NCDB-05` | An animated FDM contour field is the signature visual. It remains calm, supports pointer-responsive depth only on fine pointers, and has a complete static reduced-motion equivalent. |
| `NCDB-06` | Public pacing moves white → mist/off-white → deep ink gradually. Dark surfaces are reserved for project/evidence presentation, not used as a global product theme. |
| `NCDB-07` | The Navbar uses one click-triggered `Layanan` (ID) / `Services` (EN) mega-menu, an intentionally repeated quiet top-level Retail link, a globe plus visible active-language code, sign-in, and the primary project CTA. |
| `NCDB-08` | Homepage process content keeps the five stages compact and expands only three macro-chapters: Memahami, Membentuk, and Membuktikan. |
| `NCDB-09` | A medium Retail bridge follows project evidence and exposes two doors—Custom 3D Print and Ready Products—without taking over the B2B-primary narrative. |
| `NCDB-10` | One explicit language preference applies across Public, Retail, Login, customer portal, and Admin; public URL language controls indexable content and no automatic IP/browser-language redirect is used. |
| `NCDB-11` | Indonesian public marketing URLs remain unprefixed and use lowercase Indonesian slugs; English public URLs use `/en` plus lowercase English slugs. Complete localized counterparts use self-canonical, reciprocal `hreflang="id"` / `hreflang="en"`, a same-content Indonesian `x-default`, and localized sitemap entries. The Homepage pair alone uses `/` as its `x-default`. |
| `NCDB-12` | System and conversion copy must be complete in ID/EN before the switch activates. CMS Indonesian is required and English is optional; missing English falls back honestly to Indonesian without machine translation and remains excluded from the English index set. |
| `NCDB-13` | The Homepage is a curated entry rather than a one-page replacement for the Public site: it shows at most three featured projects, About remains concise and factual, and Home carries only a compact FAQ preview linked to the full secondary FAQ route. |
| `NCDB-14` | Project-detail prefixes and stable cross-language slugs are a reserved naming direction only. They do not create active canonical route ownership, indexability, navigation, or implementation authority; the exact production project-detail route remains separately gated. |
| `NCDB-15` | Superseded public paths become one-hop permanent compatibility redirects to the localized canonical route, carry applicable query parameters, preserve browser fragment context through standards-defined user-agent inheritance, and own no content, CMS record, sitemap entry, canonical identity, or independent analytics identity. |

## Visual-world contract

### Mark and palette

The candidate tonal roles are:

| Role | Candidate value | Use |
| --- | --- | --- |
| Signature blue | `#6390BB` | Official mark relationship, contour field, large identity gesture |
| Action blue | `#315F8F` | Primary action, active navigation, focus-related action semantics |
| Action hover | `#244B73` | Hover/pressed progression with accessible white text |
| Deep ink | `#0E1B27` | Text and bounded project-evidence stage |
| Ground | `#F8FAFC` | Calm Public and product background |
| Mist | `#EDF4F8` | Transitional process/orientation field |

Acid lime, the earlier `#1858D8`, unrelated neon, and a generic gradient mesh
are not part of the confirmed candidate. Status colors remain semantic and
secondary; they never become a competing brand palette.

### Typography

- Mona Sans Variable: Public sans display, navigation, UI, body, and product
  interface candidate.
- Bona Nova Italic: one human editorial interruption on Public; never body copy,
  dense data, Retail configuration, customer tracking, Auth, or Admin.
- Maximum Public display size: `6rem`; mobile body text: at least `16px`;
  readable prose: approximately `65–75ch` where content permits.

### Composition and motion

- Centered first viewport with open but controlled whitespace.
- No project image, dashboard mockup, metric strip, or generic product render in
  the hero.
- One authored motion moment: the FDM contour field breathes slowly and may
  respond subtly to pointer position.
- Content is visible without motion. `prefers-reduced-motion: reduce` disables
  ambient and pointer movement without removing the contour signature.
- Hover and focus communicate interaction; motion does not carry meaning by
  itself.

## Navbar contract

Candidate desktop order in Indonesian:

`niuva | Layanan | Proyek | Tentang | Kontak | Retail | globe + ID | Masuk | Diskusikan project`

Candidate desktop order in English:

`niuva | Services | Projects | About | Contact | Retail | globe + EN | Sign in | Discuss a project`

The `Layanan` / `Services` mega-menu is one open panel with two simultaneously
visible, asymmetric groups—not tabs and not a uniform card grid:

- **Kembangkan ide — approximately 60%**
  - Research & Development
  - Consultant & Workshop
  - Design & Prototyping
  - `Diskusikan kebutuhan`
- **Cetak & pilih produk — approximately 40%**
  - Custom 3D Print
  - Ready Products
  - `Jelajahi Retail`

Desktop behavior is click-triggered, not hover-only. Escape, outside click,
visible focus, focus return, and `aria-expanded` are required. The language
control is not a globe-only mystery control: it keeps the conventional globe
icon and the visible active code (`ID` or `EN`), then opens explicit language
choices. On a complete localized Public pair, each choice is a real link to the
current page's counterpart.

Mobile uses one menu drawer with a `Layanan` / `Services` accordion. The full
language choices appear high in the menu rather than after every navigation
item; the active language remains visible and programmatically determinable.

The localized Retail entry navigates between `/retail` and `/en/retail`. On
retained unprefixed downstream Retail, Login, customer, Admin, and operational
routes, changing language keeps the current canonical URL and owned-resource
context while updating the stored global preference and supported interface
copy. It neither invents an `/en` counterpart nor returns the user to the
Retail entry.

Retail remains a quiet top-level link despite also appearing in the mega-menu.
This is intentional discoverability, not equal narrative weight.

## Homepage sequence

1. Centered, project-neutral hero.
2. Short orientation to the B2B/partnership journey and the separate Retail
   path.
3. Compact `Need → Research → Experiment → Prototype → Output` sequence.
4. Three macro-chapters:
   - **Memahami:** brief, research, decision sketches, or testing notes.
   - **Membentuk:** CAD, form iterations, materials, or prototype process.
   - **Membuktikan:** final object, testing, demonstration, or use context.
5. Deep-ink project evidence with at most three owner-selected featured
   projects; the complete growing archive belongs to the Projects page.
6. Open `Layanan` / `Services` overview.
7. Medium Retail bridge with Custom 3D Print and Ready Products.
8. Partnership start and first-human-response expectation.
9. Compact FAQ preview with a route to the complete secondary FAQ page.
10. Final CTA and footer.

Each macro-chapter uses a different real artifact. A missing artifact produces
an honest text-led state, not a fabricated visual. The five process stages do
not become five large repetitive sections.

### Public page-role boundary

- Home orients, proves, and routes; it does not reproduce every service,
  project, company fact, or contact detail.
- About remains a concise, factual company and approach page rather than a
  second Homepage or an artificially long corporate profile.
- Layanan / Services owns the complete service explanation and routes visitors
  toward either the B2B inquiry or the separate Retail journey.
- Projects owns the growing evidence archive and any later-approved detail
  route; Home carries only selected proof.
- Contact owns the form-first B2B inquiry, consent, response expectation, and
  optional post-persistence WhatsApp continuation.
- FAQ and Privacy remain secondary or utility routes and stay outside the
  primary navigation.

## Language, URL, and SEO contract

### Public URLs

| Indonesian | English |
| --- | --- |
| `/` | `/en` |
| `/tentang` | `/en/about` |
| `/layanan` | `/en/services` |
| `/proyek` | `/en/projects` |
| `/kontak` | `/en/contact` |
| `/retail` | `/en/retail` |
| `/faq` | `/en/faq` |
| `/privasi` | `/en/privacy` |

All canonical URL strings are lowercase.

### Reserved project-detail direction

The candidate naming direction pairs `/proyek/:slug` with
`/en/projects/:slug` while keeping the individual `:slug` stable across
languages. For example, `/proyek/pindad-ev-motor` would pair with
`/en/projects/pindad-ev-motor`.

These examples are reserved naming evidence, not active canonical routes. They
must not enter navigation, CMS URL output, `hreflang`, sitemap, analytics, or
production route registration until the exact project-detail route receives a
separate decision and implementation approval.

### Retained Retail route boundary

This candidate localizes only the Retail entry as `/retail` and `/en/retail`.
The existing `/retail/products/:slug`,
`/retail/products/:slug/configure`, and downstream Retail transaction routes
retain their current unprefixed responsibilities under `DEC-UX-003` and consume
the same explicit global language preference.

This packet makes no multilingual SEO or indexability claim for those retained
Retail routes. Localized Retail product URLs require a separate route, content,
canonical, sitemap, and migration decision rather than being inferred from the
localized Retail entry.

Private routes such as Login, customer, and Admin remain unprefixed and
`noindex`; they consume the same explicit global preference without changing
the public indexed route contract.

### Compatibility redirects

| Superseded path | Localized canonical destination |
| --- | --- |
| `/about` | `/tentang` |
| `/capabilities` | `/layanan` |
| `/services` | `/layanan` |
| `/projects` | `/proyek` |
| `/portfolio` | `/proyek` |
| `/contact` | `/kontak` |
| `/privacy` | `/privasi` |
| `/en/capabilities` | `/en/services` |

Each compatibility path uses a one-hop permanent redirect (`308` at the target
HTTP boundary) whose `Location` carries applicable query parameters. A fragment
is client-side state and is not sent to the server; when `Location` does not
replace it, a conforming user agent inherits the original fragment under RFC
9110 Section 10.2.2. This browser behavior must be validated at the selected
delivery boundary. The path owns no separate page, CMS record, sitemap entry,
canonical tag, or analytics identity. The canonical implementation must not
emit uppercase alternatives such as `/Layanan` or `/en/Services`.

For a complete localized pair:

- each URL is self-canonical;
- Indonesian markup uses `lang="id"` and `hreflang="id"`; English markup uses
  `lang="en"` and `hreflang="en"`. The visible selector codes remain `ID` and
  `EN`;
- Indonesian and English pages reference each other reciprocally;
- `x-default` points to the Indonesian counterpart for the same content
  responsibility, such as `/layanan` for the Layanan / Services pair;
- only the Homepage pair uses `/` as `x-default`;
- both versions are included in the appropriate localized sitemap;
- the selector is a real link to the counterpart route;
- no IP, browser-language, or inferred-location redirect overrides the user's
  chosen URL.

This follows Google Search Central's recommendation to use distinct URLs for
language versions, annotate them, and let users choose through explicit links:
<https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites>.

### CMS translation fallback

- System copy, Navbar, Homepage, form, errors, privacy, and CTA require complete
  ID and EN content before the switch can be activated.
- CMS Indonesian content is required; English is optional.
- Automatic machine translation is not used.
- Operator status exposes `ID ready`, `EN missing`, and `EN ready`.
- When English is missing, the English route may show Indonesian content with
  the visible notice `English translation belum tersedia`.
- That fallback emits `noindex,follow`, points its canonical metadata to the
  Indonesian source route for the same content, stays out of the English
  sitemap, and is not emitted as an English `hreflang` counterpart.
- Once English becomes ready, the fallback marker and `noindex` are removed and
  the route becomes self-canonical and enters the sitemap and reciprocal
  annotation set.

## States and measurable floor

The future implementation must cover default, hover, focus, active, disabled,
loading, empty, error, conflict, recovery, and success where applicable.

- Normal text contrast: at least `4.5:1`.
- Large text contrast: at least `3:1`.
- General mobile target: at least `44 × 44px`.
- Design review baseline: `390px`; resilience floor: `320px`.
- No horizontal overflow at 320px or 390px.
- Keyboard-reachable navigation, visible focus, semantic landmarks, labelled
  controls, zoom/reflow resilience, and a reduced-motion equivalent.
- Important feedback is visible to sighted users and is not exposed only through
  an ARIA live region.

## Reference translation and anti-goals

- **Allgood Studio:** reference for centered art direction, whitespace,
  typographic tension, one continuous gesture, and quiet-to-dense pacing.
- **Ruul:** reference for information architecture, mega-menu disclosure, and
  long-form content rhythm.
- Neither reference supplies Niuva copy, palette, layout, source, claims, or
  component code.

Reject split hero, one-project hero, repeated equal cards, bento composition,
glass, gradient text, fake telemetry, generic dashboard imagery, decorative
section numbering, repeated tiny uppercase eyebrows, lime accents, and motion
that does not explain hierarchy, process, feedback, or media state.

The first-order, second-order, and logo-hidden checks must all pass: removing
the mark, color, and type must still leave a Niuva-specific journey built around
research, physical evidence, a separate Retail path, and truthful project
artifacts—not a transferable agency or SaaS template.

## Prototype scope and next gates

The accompanying centered Public specimen validates only:

- selected typography and tonal roles;
- Navbar/mega-menu/mobile disclosure direction;
- ID/EN counterpart behavior as a non-production interaction demonstration;
- project-neutral centered hero and FDM contour motion;
- the first white → mist → deep-ink pacing transition;
- responsive, focus, contrast, and reduced-motion fundamentals.

It does not implement the full ten-part Homepage, production SEO rendering,
global preference persistence, CMS fields, route activation, authentication,
Retail transactions, or provider behavior.

The bounded Public route-localization promotion is complete locally. Separate
approval remains required to publish its six-document bundle and for any
`DESIGN.md` amendment, production task planning, source/dependency change,
commit, push, PR, deployment, readiness, or go-live action.
