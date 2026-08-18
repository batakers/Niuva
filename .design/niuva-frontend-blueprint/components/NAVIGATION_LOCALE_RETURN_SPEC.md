# DS-05 Navigation, Locale, and Safe-Return Mechanics Specification

**Status:** Candidate — Context Only — Phase 6 `DS-05` completed for internal
self-review; owner review is consolidated with DS-02 through DS-04

**Date:** 18 August 2026

**Repository baseline:** `origin/main`
`8555685c29a3fde9976ae6499336e2eb45a330ba`

**Objective:** Define shared mechanics and surface-owned composition for Public
navigation, Account navigation, Operations navigation, locale selection, and
safe return after authentication or detail work.

**Authorization:** The owner authorized DS-02 through DS-05 to run as one
documentation goal with independent self-review and one consolidated
owner-report. This specification is planning evidence only. It does not
authorize application source, tests, tokens, dependency, route, redirect,
sitemap, API, schema, privacy, business-rule, stage, commit, push, PR, merge,
deployment, readiness, or go-live work.

## 1. Authority and relationship

Read this specification after the repository authority order, the approved
semantic token contract, [`DESIGN_BRIEF.md`](../DESIGN_BRIEF.md),
[`INFORMATION_ARCHITECTURE.md`](../INFORMATION_ARCHITECTURE.md),
[`DS-01A`](COMPONENT_STATUS.md),
[`DS-01B`](../inventory/ROUTE_COMPONENT_MATRIX.md), and DS-02 through DS-04.
Current source and tests at the selected SHA remain implementation evidence;
this document does not activate a route, promote a navigation composition, or
replace backend authorization.

Shared mechanics cover direct links, disclosure behavior, locale context,
focus, and bounded return values. Public, Account, Commerce, and Operations
retain separate composition, audience, lifecycle, permission, and content
responsibility.

## 2. Scope and non-goals

### In scope

- current Public `Navbar`/`PublicNavigation` direct shallow destinations;
- mobile navigation panel and language disclosure mechanics;
- the approved Indonesian/English route pairs, aliases, and missing-English
  fallback behavior;
- Account/customer navigation and owned-resource context;
- Operations/Admin role-filtered navigation and queue/detail context;
- protected-route login selection and customer/staff safe-return allowlists;
- breadcrumb, queue-return, query, cursor, and detail-context preservation
  rules; and
- keyboard, focus, responsive, localization, and reduced-motion requirements.

### Explicitly out of scope

- changing `Navbar`, `PublicNavigation`, `OperationalNavigation`, `App.js`,
  `ProtectedRoute`, `publicRoutes.js`, or any other application source;
- activating a route, alias, redirect, sitemap, CMS item, project-detail path,
  registration, OAuth/OIDC, or private provider;
- restoring a mega-menu, desktop accordion, hover-only destination, or a
  detailed Public navigation hierarchy not authorized by current authority;
- making route visibility an authorization decision; and
- inventing an `/en` counterpart for an unprefixed private/customer/Operations
  route.

## 3. Navigation laws

1. **Visibility is not authority.** A link, sidebar item, active state, or
   route declaration never grants permission; backend authorization and the
   owning route guard remain decisive.
2. **Public navigation stays shallow.** Services, Projects, About, Contact,
   and Retail are direct destinations. Retail is top-level and secondary to
   the B2B/Public journey; it is not duplicated as a mega-menu branch.
3. **Locale changes preserve responsibility.** A selector chooses the exact
   translated counterpart when it exists, updates one stored preference, and
   does not redirect from IP, browser language, or inferred location.
4. **Private routes keep their canonical shape.** Downstream Retail,
   configurator, Request, Offer, checkout, Order, Login, Account, Admin, and
   Operations paths stay unprefixed/private where governed by authority;
   changing language does not fabricate an `/en` path or discard owned context.
5. **Return values are local and bounded.** A safe return is a validated local
   pathname plus permitted search/hash; it never accepts an external URL,
   protected payload, arbitrary role switch, or stale mutation authority.
6. **Current location is explicit.** Active route is represented by text and
   semantics (`aria-current` or equivalent), not color alone. Compatibility
   aliases remain compatibility ownership, not additional navigation items.
7. **Focus follows the user.** Menu opening enters the first item, Escape and
   outside click close safely, focus returns to the invoker, and locale/detail
   changes preserve a deterministic task context.
8. **Surface expression is local.** Public may use its approved capsule and
   subtle compact-on-scroll behavior; Account and Operations do not inherit
   Public campaign composition or motion.

## 4. NDS 13-field mechanics contract

Every future navigation or return-pattern promotion still fills all NDS fields
from DS-02. The records below describe current mechanics and bounded ownership;
they are not new component adoption decisions.

<!-- markdownlint-disable MD013 -->

| Field | Required treatment for navigation/locale/return mechanics |
| --- | --- |
| 1. Name, purpose, owner, status | Name the current mechanic/composition, one job, owner, and `adopted`, `compatibility-bounded`, `provisional`, or `quarantined` status. |
| 2. Use / not use | State the audience and navigation task fit plus route, authority, and hierarchy anti-patterns. |
| 3. Anatomy | Identify mark/text, links, active state, language control, disclosure/panel, invoker, return target, and focus boundary. |
| 4. Variants, sizes, content limits | Preserve current desktop/mobile variants, 44px targets, compact dimensions, long ID/EN labels, and panel limits. |
| 5. Props/API continuity | Preserve current path, locale, auth, permission, callback, and focus APIs; no new routing schema or redirect API. |
| 6. Interaction/data states | Ready, current, hover, focus, pressed, open/closed, compact, loading, permission, locale fallback, expired/stale, offline, recovery, and success where relevant. |
| 7. Input/focus/screen-reader behavior | Keyboard order, Escape, outside click, focus entry/return, name/role/value, `aria-current`, expanded state, and safe announcements. |
| 8. Responsive/overflow behavior | Desktop/mobile hierarchy, no horizontal shrink of mobile Public capsule, 44px target, 200% reflow, and no clipped long labels. |
| 9. Token dependencies | Durable identity, surface, text, border, focus, spacing, radius, and motion roles; page/art-direction values remain LOCAL. |
| 10. Localization/long content | ID/EN labels, route counterparts, missing-translation notice, login/return copy, and long menu labels expand safely. |
| 11. Surface/domain restrictions | Public, Commerce, Account, or Operations owner is named; a shared focus/control mechanic does not merge navigation authority. |
| 12. Anti-patterns | No mega-menu/accordion restoration, hover-only destination, auto locale redirect, external return, route-visibility authorization, or Public motion on Admin. |
| 13. Migration/deprecation | Current source/tests, compatibility aliases, consumer evidence, verification, rollback, and separate approval for any source change. |

<!-- markdownlint-enable MD013 -->

## 5. Mechanics records

### 5.1 Public navigation and Public Navbar

1. **Name/purpose/owner/status:** `Navbar` and `PublicNavigation`; Public
   surface owner with Foundation mechanics, adopted and compatibility-bounded
   to current route contracts.
2. **Use / not use:** Use for direct Public discovery, B2B Contact, Services,
   Projects, About, and secondary Retail entry. Do not use for Admin queue
   authority, customer-owned records, checkout, or a deep mega-menu.
3. **Anatomy:** Official `ni` mark plus visible `Niuva` text, direct links for
   Services/Projects/About/Contact/Retail, locale control, Sign in, primary
   Contact CTA, mobile menu button, and Public capsule.
4. **Variants/sizes/content:** Desktop direct-link row and mobile panel;
   Public compact-on-scroll uses the existing 96px threshold, 64px to 56px
   capsule height, and desktop-only width shrink (`xl:max-w-[76rem]`). Mobile
   does not shrink horizontally; labels and targets remain usable.
5. **API continuity:** Preserve `pathname`, `search`, `hash`, i18n locale,
   route resolver, `onNavigate`, auth/workspace callbacks, and current link
   destinations. No new menu data model or route hierarchy is proposed.
6. **States:** Ready, current route, hover, focus, pressed, compact, mobile
   open/closed, locale open, signed-in operational branch, and reduced-motion
   direct state change. Compact state freezes while the mobile panel is open.
7. **Interaction/accessibility:** Direct links expose `aria-current` for the
   current route; menu button exposes `aria-expanded`/`aria-controls`; opening
   focuses the first item; Escape closes and returns focus; Tab is contained
   while the panel is modal; outside click closes the scrim.
8. **Responsive/overflow:** Fixed outer header remains transparent on Public;
   paper capsule is the contrast surface. Mobile panel scrolls within the
   viewport, all general targets are 44px, and no critical CTA disappears.
9. **Tokens:** Identity, paper/surface, text, border, focus, navigation
   shadow, spacing, radius, and `motion-deliberate`/reduced-motion roles;
   `--public-studio-paper` remains a Public role, not a global token promotion.
10. **Localization:** Links use the exact ID/EN Public pair; `ID`/`EN` is
    visible; labels, Contact CTA, Sign in, and menu copy tolerate long
    translations; no English-first launch assumption.
11. **Restrictions:** Public only. Customer, Account, and Operations use
    their own composition and do not inherit Public campaign hierarchy or
    compact styling.
12. **Anti-patterns:** No mega-menu, desktop accordion, duplicated Retail
    entry, hover-only destination, blur/opacity auto-hide, logo/text/CTA
    shrink, scroll hijacking, or route visibility as permission.
13. **Migration:** Existing `Navbar`/`PublicNavigation` tests and route matrix
    are evidence. Any visual/source change needs an exact-file task, browser
    and accessibility checks, and rollback to the current composition.

### 5.2 Mobile disclosure panel

1. **Name/purpose/owner/status:** Existing mobile navigation panel and scrim
   in `Navbar`; Public/Operational surface owner, adopted interaction
   mechanic, no separate shared Drawer adoption.
2. **Use / not use:** Use for the bounded mobile navigation set. Do not use a
   drawer library or `vaul` boundary, or hide critical destinations behind
   hover/gesture-only behavior.
3. **Anatomy:** Menu invoker, scrim, labelled panel, direct navigation links,
   locale disclosure, Sign in/Workspace actions, and Contact CTA.
4. **Variants/sizes/content:** Closed/open modal panel; max-height accounts
   for viewport, content scrolls, controls are min 44px, and long ID/EN labels
   wrap rather than clip.
5. **API continuity:** Preserve `open`, `onNavigate`, panel ref, body-scroll
   lock, inert closed state, and existing callback behavior. No new focus-trap
   dependency or wrapper API is introduced.
6. **States:** Closed, opening, open, locale disclosure open, Escape/outside
   click, route-change close, disabled/unavailable action, and reduced-motion
   direct open/close.
7. **Interaction/accessibility:** Panel is a labelled dialog while open;
   first item receives focus; Tab wraps; Escape and scrim close; focus returns
   to menu button; body scrolling is restored on close/unmount.
8. **Responsive/overflow:** Panel is inset from the viewport, has bounded
   vertical scrolling, preserves CTA visibility, and does not cause a
   horizontal mobile shrink of the Public capsule.
9. **Tokens:** Panel/scrim, text, border, focus, overlay shadow, radius,
   spacing, and short disclosure motion; no new overlay token or dependency.
10. **Localization:** Menu, close, language, Sign in, Workspace, and Contact
    labels remain complete in ID/EN and fit the available width.
11. **Restrictions:** Shared disclosure mechanics may serve Public and
    Operations variants; contents, routes, permissions, and lifecycle actions
    remain surface-owned.
12. **Anti-patterns:** No focus leak, scroll lock leak, pointer-only close,
    invisible scrim, accordion hierarchy, or provider/action implication.
13. **Migration:** Current tests cover keyboard/focus and mobile behavior;
    `Drawer` remains quarantined. A future replacement requires dependency,
    focus, bundle, and rollback review.

### 5.3 Locale selector and translated counterpart

1. **Name/purpose/owner/status:** Existing locale button/disclosure in
   `PublicNavigation` and language toggle in `OperationalNavigation`; adopted
   mechanics with surface-owned composition.
2. **Use / not use:** Use to choose `ID` or `EN` for the current responsibility.
   Do not auto-detect, auto-redirect, or use locale selection as authorization.
3. **Anatomy:** Globe/icon plus visible locale code, current selection, exact
   counterpart actions, and fallback notice/metadata where translation is not
   ready.
4. **Variants/sizes/content:** Desktop disclosure and mobile inline disclosure;
   buttons remain min 44px; labels such as “Bahasa Indonesia” and “English”
   expand safely.
5. **API continuity:** Preserve `getPublicLocale`, `getLocaleSwitchPath`,
   `getPublicPath`, `resolvePublicRoute`, `setLang`, and current search/hash.
   No new locale registry or redirect behavior is proposed.
6. **States:** Current ID, current EN, open/closed, selected/pressed, route
   fallback, unavailable translation, and route-change recovery.
7. **Interaction/accessibility:** Button names the language action; expanded
   state is exposed; Escape/outside click closes desktop disclosure; selected
   locale uses text/semantics and `aria-pressed`; focus returns to invoker.
8. **Responsive/overflow:** Locale control and options remain reachable at
   320px/390px and 200% zoom; long labels wrap without changing responsibility.
9. **Tokens:** Text, surface, selected, border, focus, spacing, and short
   disclosure motion roles; no locale-specific page color.
10. **Localization:** Indonesian is primary; a complete pair uses reciprocal
    `hreflang`/self-canonical metadata. An English item without translation
    shows `English translation belum tersedia`, `noindex,follow`, Indonesian
    canonical, and no English sitemap/hreflang entry.
11. **Restrictions:** Public locale pairs use prefixed English routes; private
    Retail/customer/Login/Admin/Operations routes remain unprefixed and retain
    the current owned-resource context.
12. **Anti-patterns:** No IP/browser redirect, machine translation, fabricated
    counterpart, language change to Retail entry, or locale-only state meaning.
13. **Migration:** Current route helper tests and page metadata are evidence.
    Any language infrastructure change requires route/SEO review and rollback;
    no source change is made by DS-05.

### 5.4 Operations navigation and sidebar

1. **Name/purpose/owner/status:** `OperationalNavigation` plus current
   Admin/Operations layouts; Operations owner, adopted surface composition.
2. **Use / not use:** Use for role-filtered workspace/site/sign-out and queue
   context. Do not copy Public campaign hierarchy or use visibility as write
   permission.
3. **Anatomy:** Workspace action, Public site link, language toggle, sign-out,
   and route-family sidebar/queue composition owned by Admin/Operations pages.
4. **Variants/sizes/content:** Desktop compact controls and mobile stacked
   controls; long workspace and logout labels wrap; min 44px interaction target.
5. **API continuity:** Preserve `lang`, permission-derived workspace, sign-out,
   workspace callback, site label, and current layout callbacks. No new role
   or permission model is proposed.
6. **States:** Signed out, signed in, permission-filtered, current queue/detail,
   mobile open, locale toggle, loading bootstrap, forbidden, and sign-out
   recovery.
7. **Interaction/accessibility:** Buttons/links have names and focus; mobile
   order is deterministic; permission errors are visible without protected
   detail; sign-out returns to the approved Public route.
8. **Responsive/overflow:** Controls stack at narrow widths, preserve the
   workspace action, and do not depend on hover or a hidden sidebar.
9. **Tokens:** Product register surface, text, border, focus, spacing, radius,
   and functional motion roles; no Public paper/campaign token.
10. **Localization:** Current ID/EN toggle and operational labels expand; no
    invented `/en` counterpart for `/admin`, `/dashboard`, or `/orders/:id`.
11. **Restrictions:** Account/Operations only; route groups and backend
    permissions remain authoritative and distinct.
12. **Anti-patterns:** No public CTA motif in a queue, invented KPI navigation,
    route-as-permission, hidden forbidden reason, or auto-opening route.
13. **Migration:** Current `OperationalNavigation`, layouts, permission tests,
    and DS-01B matrix are evidence. Any sidebar change requires exact-file
    review and role/accessibility verification.

### 5.5 Account/customer navigation

1. **Name/purpose/owner/status:** Current customer workspace links in
   `Navbar`/operational layout and owned-record links; Account owner,
   compatibility-bounded current composition.
2. **Use / not use:** Use for `/dashboard`, legacy `/order`, `/orders/:id`,
   Retail return, and sign-out context. Do not expose Admin controls or imply
   a public campaign journey.
3. **Anatomy:** Owned workspace action, current record/queue link, Public/Retail
   escape, language preference, and sign-out/recovery action as permitted.
4. **Variants/sizes/content:** Desktop/mobile operational controls; long order
   references and labels wrap; current action remains 44px.
5. **API continuity:** Preserve auth/user, locale, workspace callback, route
   context, and owned-resource links; no new account route or identity link is
   created.
6. **States:** Auth bootstrap, signed in/out, current route, permission-safe
   unavailable, stale/expired session, recovery, and sign-out success.
7. **Interaction/accessibility:** Current location is semantic; links are
   keyboard reachable; session expiry explains reauthentication and preserves
   only permitted return context.
8. **Responsive/overflow:** Mobile controls stack; owned record identity and
   next action remain visible; no hidden route solely on hover.
9. **Tokens:** Product register identity, surface, text, border, focus,
   spacing, radius, and functional motion roles.
10. **Localization:** Stored ID/EN preference updates supported copy while
    retaining the unprefixed current route and owned-resource context.
11. **Restrictions:** Account/customer-owned resources only; customer-safe
    projection and server authorization remain separate from navigation.
12. **Anti-patterns:** No Admin link without permission, internal data in menu,
    route visibility as authorization, or fake order/production state.
13. **Migration:** Current customer routes and `ProtectedRoute` evidence remain;
    later changes require projection, permission, focus, and rollback checks.

### 5.6 Safe return after authentication

1. **Name/purpose/owner/status:** `ProtectedRoute` destination state plus
   `CustomerLogin` and `AdminLogin` allowlists; adopted security/UX mechanic,
   auth owner and backend remain authoritative.
2. **Use / not use:** Use to return a user to a permitted local destination
   after login. Do not accept an external URL, arbitrary query payload, role
   switch, or stale mutation command.
3. **Anatomy:** Guard detects unauthenticated access, chooses `/login` or
   `/admin/login`, stores pathname/search/hash in `state.from`, and login page
   validates a customer or staff destination before navigating.
4. **Variants/sizes/content:** Customer allowlist currently accepts
   `/dashboard`, `/order`, and `/orders/*`; staff accepts `/admin*` except
   `/admin/login`; invalid/missing state falls back to `/dashboard` or `/admin`.
5. **API continuity:** Preserve `Navigate` state shape, local pathname/search/
   hash preservation, `CustomerLogin` and `AdminLogin` destination checks, and
   `replace` navigation. No external redirect API is introduced.
6. **States:** Auth bootstrap/loading, unauthenticated redirect, login ready,
   invalid return fallback, credential failure, dependency failure, expired
   session, permission/forbidden, recovery, and authenticated success.
7. **Interaction/accessibility:** Login errors are visible in-page; submit
   loading prevents duplicate action; after success focus follows the returned
   page's task; invalid destination does not expose protected detail.
8. **Responsive/overflow:** Auth shell/form remains usable at 390px and 200%
   zoom; long destination/error copy is not clipped or hidden in a toast.
9. **Tokens:** Auth Product register surface, form, focus, error, spacing,
   and motion roles; no route-specific visual identity token.
10. **Localization:** Customer/staff labels, errors, recovery copy, and
    permission-safe fallback are complete in supported ID/EN contexts; return
    path itself is not translated.
11. **Restrictions:** Customer and staff allowlists are separate; route and
    backend authorization remain decisive after navigation.
12. **Anti-patterns:** No open redirect, `javascript:`/external return,
    sensitive state payload, `/en` invention for private routes, or login
    success before authoritative session response.
13. **Migration:** Current guards/login tests are evidence. Any hardening or
    allowlist change requires exact-file security review, regression tests, and
    rollback; DS-05 makes no source change.

### 5.7 Breadcrumb and queue-return context

1. **Name/purpose/owner/status:** Existing page-local breadcrumb/back links
   and queue/detail return links; surface/domain owner, adopted mechanics with
   no new shared Breadcrumb component.
2. **Use / not use:** Use to return to the invoking queue or owned record
   context. Do not preserve stale authority, protected filter values, or a
   route that the current user cannot access.
3. **Anatomy:** Current location heading, parent/queue link, optional safe
   query/cursor/filter context, and a clear fallback when context expires.
4. **Variants/sizes/content:** Public archive, Commerce detail, Account order,
   and Operations queue/detail variants; long labels wrap and targets remain
   44px.
5. **API continuity:** Preserve current `pathname`, permitted search/hash,
   route params, and page-local return callbacks; no global navigation history
   store is proposed.
6. **States:** Ready, loading, not found, permission-safe, stale/expired,
   conflict, offline, recovery, and successful return.
7. **Interaction/accessibility:** Current location is semantic; parent link is
   keyboard reachable; focus returns to the invoking item when it still exists,
   otherwise to a visible summary.
8. **Responsive/overflow:** Breadcrumbs may wrap/stack; no clipped record
   identity or hidden back action at 320px/390px or 200% zoom.
9. **Tokens:** Text, focus, border, spacing, surface, radius, and motion roles;
   no decorative process line or lifecycle color.
10. **Localization:** Parent labels and queue names expand in ID/EN; current
    private route stays unprefixed and preserves owned context.
11. **Restrictions:** Public, Commerce, Account, and Operations define their
    own return meaning; route visibility and breadcrumb membership grant no
    permission.
12. **Anti-patterns:** No stale filter replay, invented project-detail link,
    external return, silent context loss, or breadcrumb as a status machine.
13. **Migration:** Existing page-local return links remain. Promotion requires
    two same-meaning consumers, state/permission evidence, and rollback.

## 6. Route and locale contract calibration

<!-- markdownlint-disable MD013 -->

| Responsibility | Canonical/current behavior | Navigation and return boundary |
| --- | --- | --- |
| Public ID/EN | `/` ↔ `/en`, `/tentang` ↔ `/en/about`, `/layanan` ↔ `/en/services`, `/proyek` ↔ `/en/projects`, `/kontak` ↔ `/en/contact`, `/faq` ↔ `/en/faq`, `/privasi` ↔ `/en/privacy`, `/retail` ↔ `/en/retail` | Exact counterpart only; current route/search/hash preserved; no IP/browser redirect. |
| Compatibility aliases | `/about`, `/capabilities`, `/services`, `/projects`, `/portfolio`, `/contact`, `/privacy`, `/en/capabilities` map to canonical Public routes | Inventory/redirect ownership remains separate; aliases are not duplicated nav items and HTTP 308 remains delivery-gated. |
| English missing translation | Current route metadata can fall back to Indonesian content with `English translation belum tersedia`, `noindex,follow`, Indonesian canonical, and no English sitemap/hreflang | Selector must not claim a complete English page or invent a counterpart. |
| Public project detail | `/proyek/:slug` and `/en/projects/:slug` remain reserved | Project cards present in-place evidence or archive/non-link action until route ownership is separately activated. |
| Retail/private routes | Product/configurator/Request/Offer/checkout/Order and operational routes remain unprefixed/private where governed | Language preference updates supported interface copy while preserving URL and owned-resource context; never sends the user to Retail entry. |
| Customer login return | `ProtectedRoute` stores local pathname/search/hash; `CustomerLogin` accepts `/dashboard`, `/order`, `/orders/*`, otherwise `/dashboard` | Customer auth success returns only to the validated local destination. |
| Staff login return | `ProtectedRoute` selects `/admin/login`; `AdminLogin` accepts local `/admin*` except `/admin/login`, otherwise `/admin` | Permission and backend session remain authoritative; no open redirect. |

<!-- markdownlint-enable MD013 -->

## 7. State and keyboard sequence matrix

<!-- markdownlint-disable MD013 -->

| Interaction/state | Required behavior | Prohibited shortcut |
| --- | --- | --- |
| Public desktop ready | Direct links, current route, locale, Sign in, and Contact action are visible. | Mega-menu, duplicated Retail, or hover-only destination. |
| Public compact-on-scroll | At >96px, desktop capsule changes 64px → 56px and may narrow; logo/text/CTA/targets stay stable. | Auto-hide, blur/opacity transition, mobile horizontal shrink, or permission implication. |
| Mobile menu open | Invoker exposes expanded state; first item receives focus; panel traps Tab; scrim/outside click and Escape close; focus returns. | Focus leak, scroll-lock leak, or silent panel. |
| Locale open | Button exposes expanded state; options show ID/EN and selected semantics; Escape/outside close restores focus. | Color-only selection or automatic locale redirect. |
| Route change | Current link updates, menu closes, and exact search/hash context is preserved where allowed. | Returning to home/Retail entry without authority. |
| Auth guard | Loading is announced; unauthenticated user goes to audience-specific login with bounded local state. | False success, external `from`, or arbitrary role switch. |
| Invalid/expired return | Login falls back to the audience home and explains only what is safe. | Replaying stale mutation or leaking protected detail. |
| Permission/forbidden | Navigation may hide or disable an action, but route/backend guard remains decisive. | Treating hidden link as authorization. |

<!-- markdownlint-enable MD013 -->

## 8. Accessibility, responsive, localization, and motion checks

- Desktop and mobile keyboard paths include logo, every direct destination,
  locale, Sign in/Workspace, Contact, menu invoker, panel items, and return
  actions; focus is visible and not obscured by sticky UI.
- The Public mobile panel uses a labelled dialog while open, predictable Tab
  wrapping, Escape, outside-click, focus return, and restored body scrolling.
- Every control is a minimum 44 × 44px general mobile target; 320px/390px
  layouts preserve navigation, locale, Sign in/Workspace, and Contact actions.
- 200% zoom/reflow and long Indonesian/English labels do not clip, overflow,
  or hide the current route or recovery action.
- Active/current, selected locale, permission, error, expired, and recovery
  meaning is carried by text/semantics as well as color or icon.
- Reduced motion removes interpolation, rotation, panel travel, and pointer
  response where applicable while retaining static content, focus, open/close,
  validation, error, recovery, and success feedback. No global 1ms reset or
  `transition: all` is introduced.
- Public compact-on-scroll is a bounded identity treatment; Account and
  Operations retain functional navigation behavior and do not inherit Public
  choreography.

## 9. Consumer and promotion evidence

<!-- markdownlint-disable MD013 -->

| Mechanic/composition | Current evidence | Status and next gate |
| --- | --- | --- |
| Public direct navigation | `Navbar`, `PublicNavigation`, Public route registry, Public route tests | Current adopted composition; no detailed nav promotion or route activation. |
| Mobile disclosure | `Navbar` panel/scrim/focus logic and navigation tests | Adopted current mechanic; `Drawer`/`vaul` remains quarantined. |
| Locale selection | `PublicNavigation`, `OperationalNavigation`, `publicRoutes.js`, metadata/route tests | Adopted route-aware mechanic; SEO/delivery changes remain separate. |
| Operations navigation | `OperationalNavigation`, Admin/Operational layouts, permission helpers | Surface-owned; visibility never substitutes for backend authorization. |
| Safe return | `ProtectedRoute`, `CustomerLogin`, `AdminLogin`, route/permission tests | Adopted bounded local allowlists; future hardening remains an exact-file security task. |
| Breadcrumb/queue return | Current page-local detail/queue links and DS-01B matrix | No shared Breadcrumb promotion; route/domain semantics remain local. |

<!-- markdownlint-enable MD013 -->

No new consumer is created by this specification. A future shared navigation,
locale, breadcrumb, or return wrapper needs two independent consumers with the
same meaning, all NDS fields, accessibility/localization evidence, and an
exact-file migration and rollback plan.

## 10. Internal self-review record

Self-review completed against `8555685c29a3fde9976ae6499336e2eb45a330ba` after
DS-04 and before the consolidated owner report:

- `Navbar`, `PublicNavigation`, `OperationalNavigation`, `ProtectedRoute`,
  login allowlists, and `publicRoutes.js` were spot-checked against DS-01A and
  DS-01B;
- every mechanics record in Section 5 contains all 13 NDS fields;
- Public direct navigation, no mega-menu/accordion, compact-on-scroll, mobile
  focus, locale counterpart/fallback, Operations separation, and bounded
  customer/staff return are explicit;
- reserved project-detail paths, aliases, private unprefixed routes, and
  route-visibility-versus-authorization boundaries remain visible;
- ID/EN long labels, 44px targets, 200% reflow, keyboard/focus, outside-click,
  Escape, reduced motion, and safe recovery are recorded;
- local links resolve; trailing whitespace is absent; and lines over 80 columns
  occur only inside MD013-disabled tables or code-like identifiers; and
- no application source, route, redirect, token, dependency, API, or
  lifecycle file was modified.

**Verification:** Structural checks passed for record fields, route/locale
coverage, local links, trailing whitespace, and scoped long-line exceptions.
Markdownlint was not available in the worktree and was not installed. Browser
and runtime checks are not claimed because this task changed documentation
only.

## 11. Rollback and handoff

This artifact is untracked documentation in the blueprint working set. To
discard DS-05 only, remove this file before any staging; no source rollback,
route rollback, redirect rollback, or auth rollback is required. DS-02 through
DS-05 are now ready for one consolidated owner review. Any Wave B design task
or later exact-file source task remains separately gated.
