# Layer 02 — UI, UX, Responsive Behavior, and Accessibility

Status: Context Only — Audit Evidence and Progress Tracker — Not
Implementation Authority

## 1. Document status

- Classification: Context Only
- Finding prefix: `UX-`
- Implementation authority: none
- Audit status: `complete` for the recorded repository/static review and
  Chromium public/auth runtime scope; Admin seeded runtime and additional
  browser/assistive-technology evidence remain explicitly blocked.
- No code, design, test, dependency, configuration, commit, push, or product
  decision was changed by this audit.

## 2. Audit scorecard

| Field | Value |
| --- | --- |
| Audit completion | 86% |
| Readiness score | 42% |
| Confidence | 78% |
| Recorded findings | 0 P0 / 5 P1 / 5 P2 / 1 P3 |
| First/last verified SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |

The readiness score is an observed UI/UX/accessibility quality measure, not a
release or go-live decision. The score is capped by the contrast, navigation,
target-size, semantic-control, and missing Admin-runtime evidence below.

## 3. Authority and method

Read in the repository's canonical order: `docs/NIUVA_MASTER_SPEC.md`,
`docs/context/DOCUMENT_REGISTER.md`, `docs/decisions/DECISION_REGISTER.md`,
DEC-UX-001, DEC-UX-002, DEC-OPS-001, DEC-OPS-002, `DESIGN.md`, the active
public brand guardrail, `AUDIT_METHODOLOGY.md`, `AUDIT_BASELINE.md`, then
current source and tests.

The audit separates:

- **Objective usability defect** — a user cannot reliably complete or
  understand an available task.
- **Accessibility violation** — a semantic, keyboard, focus, name, contrast,
  motion, target-size, or state-announcement failure.
- **Canonical-decision conflict** — runtime contradicts an approved decision or
  crosses a documented deferral.
- **Visual consistency issue** — observable inconsistency against the approved
  system without claiming a new design direction.
- **Subjective improvement** — a lower-confidence preference; not a defect or
  authorization to redesign.

## 4. Route and state inventory

### Public / marketing

`/`, `/about`, `/capabilities` (alias `/services`), `/projects` (alias
`/portfolio`), `/contact`, `/privacy`, `/faq`, and the `*` NotFound route.
These render through `MarketingLayout`, `BrandPage`, `PageHero`, section
patterns, and a repeated `CTASection` in
`frontend/src/components/brand/BrandSystem.jsx`.

### Customer and recovery

`/dashboard`, `/order`, and `/orders/:id` are protected customer journeys.
`/admin/login`, `/forgot-password`, and `/reset-password` are the unauthenticated
access/recovery states. Customer surfaces include loading, empty, validation,
upload, progress, success, payment/status, and error/retry branches in
`frontend/src/pages/operational/`.

### Admin Studio

`/admin`, orders, catalog/product editor, materials, inventory, stock
movements, restock alerts, portfolio/detail, content, contacts, inquiries/detail,
B2B quotes/detail/revision, B2B projects/detail, B2B work orders/detail, retail
orders/detail, users, notifications, communication, and settings are routed
in `frontend/src/App.js:148-174`. `AdminLayout` applies role-aware groups,
breadcrumbs, skip link, notification bell, responsive drawer, and permission
states. The hidden brand-lab routes are `/__brand-lab/editorial` and
`/__brand-lab/experimental` when the flag is enabled.

### Important state coverage

| Surface | Reviewed states | Evidence / limitation |
| --- | --- | --- |
| Public | default, navigation open/closed, NotFound, reduced motion, form validation, visible CTA | Chromium smoke plus custom DOM/axe harness at 375, 768, 1024, 1440 |
| Auth/recovery | login, forgot-password, reset-password, validation/success/missing-token branches | Chromium smoke; Admin login API/data branch is not seeded |
| Customer | source-level loading/empty/error/success/status/upload/payment branches | Static review; live API was not available |
| Admin | source-level loading/empty/error/retry/conflict/permission/stale patterns and drawer behavior | Official seeded tests blocked by absent `E2E_SUPER_ADMIN_*`; no role matrix claim |

## 5. Responsive and browser evidence

### Viewport matrix

| Width | Public route result | Auth result | Admin result |
| ---: | --- | --- | --- |
| 375 px | No horizontal overflow on all smoke routes; one `h1` each; mobile menu opens and restores focus | Rendered; several 40/26 px controls and contrast defects | Official test fixture blocked |
| 768 px | No horizontal overflow on all smoke routes; layout reflows | Rendered | Official test fixture blocked |
| 1024 px | No horizontal overflow on all smoke routes | Rendered | Official test fixture blocked |
| 1440 px | No horizontal overflow on all smoke routes | Rendered | Official test fixture blocked |

Chromium smoke routes were `/`, `/about`, `/capabilities`, `/projects`,
`/contact`, `/faq`, `/privacy`, `/does-not-exist`, `/admin/login`,
`/forgot-password`, and `/reset-password`. The custom check found zero
document-level overflow and exactly one `h1` per route at all four widths.
This does not prove zoom/reflow, screen-reader, real-device, Firefox, or
WebKit conformance.

### Automated checks

- `npx.cmd playwright test e2e/accessibility.spec.js --project=mobile --reporter=line`
  → 8 tests collected; 1 passed (login shell), 7 blocked before assertions by
  the fixture's missing `E2E_SUPER_ADMIN_EMAIL` /
  `E2E_SUPER_ADMIN_PASSWORD`.
- `npx.cmd playwright test e2e/responsive.spec.js --project=mobile --reporter=line`
  → 9 tests collected; all blocked by the same fixture requirement.
- An ad-hoc Playwright + `@axe-core/playwright` harness scanned the public and
  auth routes above at the four widths. It recorded 27 route/viewport
  `color-contrast` instances, all serious impact. Representative results:
  Home primary CTA 3.78:1, Home proof text 3.32:1, Contact visual text
  1.91:1, and Forgot Password submit button 2.88:1 where 4.5:1 is required
  for normal text.
- Reduced-motion check on `/` at 375 px with
  `prefers-reduced-motion: reduce` recorded zero active animation/transition
  elements. `BrandPage` also gates GSAP on that media query.

### Manual browser spot-check

At 375 px on `/`, opening the mobile menu moves focus to the first menu link;
Escape closes the panel and restores focus to `Buka menu`. Tabbing then leaves
the open panel and continues into the page because the menu has no focus trap,
inert background, or modal semantics. Admin drawer code has a separate focus
trap and restore implementation, but it could not be exercised with a seeded
role.

Firefox and WebKit executables are not installed in the baseline environment.
No screen reader, mobile hardware, zoom-at-200%, touch assistive technology,
or production/staging content check was performed.

## 6. IA, visual-system, and interaction review

| Review area | Evidence-based assessment |
| --- | --- |
| Information architecture and hierarchy | Public navigation is a coherent five-page marketing set plus Privacy/FAQ, and the public smoke scan found one `h1` per route. Customer and Admin routes are separated in `App.js`; `AdminLayout` groups work, sales/delivery, production, publishing, and governance by role. The approved Retail path is nevertheless absent from the public IA (UX-001). |
| Public/customer/Admin separation | `MarketingLayout`/`BrandPage`, protected customer pages, and role-aware `AdminLayout` are technically separate. Auth/customer console language and “HUD” treatment blur the intended restraint boundary (UX-006). |
| Typography | `DEC-UX-002` roles are Poppins for display/navigation/buttons and Inter for body/forms/metadata; `.brand-page` applies a broad override to deferred public pages (UX-009). Monospace is appropriate for technical identifiers but is used for ordinary customer/auth labels (UX-006). |
| Spacing, grid, cards, radius, icons, surfaces | Public pages use consistent `PageContainer`, responsive grids, controlled rounded frames, border-led sections, and blue action surfaces. `CTASection`, `RoundedVisualFrame`, and case-study cards provide reusable surfaces; the repeated skeleton is recorded as the low-confidence subjective UX-011, not a redesign mandate. Admin uses denser panels/tables and Radix-style controls. Contrast and target-size problems cut across these surfaces (UX-002/004). |
| Pattern purpose and repetition | Variants and content differ, but most public routes use the same hero → sections → CTA composition. This is potentially generic/repetitive, not an objective failure; see UX-011. |
| Semantic HTML and headings | Public routes had one `h1` each in the four-width DOM scan. Forms use native labels and several explicit descriptions. Customer tables, custom combobox options, loading regions, and some state controls require the semantic fixes in UX-005/007/008. |
| Menu/dialog/tabs/select/tooltip behavior | Public menu focus containment is incomplete (UX-003). Admin drawer has dialog semantics, inert background, Escape, trap, and restore. Radix Dialog/Select/Tabs primitives exist, but `UserSelector` replaces the expected listbox behavior with a plain popup (UX-005). No repository consumer was found that depends on a custom tooltip contract; tooltip behavior remains unverified in the blocked Admin runtime. |
| Labels and accessible names | Contact/auth labels and the public menu trigger have names. The main unresolved names/state relationships are UserSelector options, protected-route loading, and reset-password rule messages (UX-005/007/008). |

### State and recovery matrix

| State | Public | Customer | Admin |
| --- | --- | --- | --- |
| Loading | `BrandPage` reveal/loading is visual and reduced-motion safe | Source has dashboard/order loading; ProtectedRoute spinner lacks status semantics (UX-007) | Shared skeleton/error patterns exist; seeded runtime blocked |
| Empty | FAQ/Privacy/content defaults render | Dashboard/order empty branches exist in source | Lists, notifications, portfolio, and inventory expose empty patterns in source |
| Error/retry | App error boundary offers reload | Order/upload/payment errors and toast paths exist in source | `ErrorState` retry is present but undersized and not runtime-verified (UX-007) |
| Success | Contact success state is visible and described | Order submission/status/payment success branches exist | Save/publish/retry/conflict patterns exist in source |
| Disabled | Native form/button disabled states are present | Step controls disable at boundaries | Role/permission checks hide or forbid routes; runtime role matrix blocked |
| Unauthorized/forbidden | NotFound and protected-route redirects are present | Protected route boundary exists | `ForbiddenPage` and permission-aware menu exist; real roles unverified |
| Destructive/conflict/expired | No destructive public action | Source exposes payment/order error states; live conflict not exercised | Admin conflict/stale/expired patterns are documented in source; seeded workflow blocked |

## 7. Findings

### UX-001 — Homepage does not expose the approved Retail path or semantic U-curve

| Field | Value |
| --- | --- |
| Severity / status | `P1` / `open` |
| Category | Canonical-decision conflict; objective usability defect |
| Confidence | 95% |
| Expected | DEC-UX-001 requires one B2B-primary Unified Homepage with a clearly discoverable secondary Retail path. DEC-UX-002 requires the semantic `Need → Research → Experiment → Prototype → Output` U-curve in exactly two purposeful placements. |
| Actual | `HomePage` exposes only `/contact` and `/projects` CTAs (`frontend/src/pages/marketing/HomePage.jsx:240-250`), while its operating model uses Riset/Desain/Engineering/Prototyping/Testing/Implementasi (`:30-50`) and no Retail destination exists in the public route set (`frontend/src/App.js:133-147`). |
| Evidence / command | `frontend/src/App.js:133-147`; `frontend/src/pages/marketing/HomePage.jsx:30-50,240-250`; DEC-UX-001:19-25,41-45; DEC-UX-002:28-33. Chromium smoke at all four widths confirmed no Retail CTA. |
| Impact | Retail visitors cannot discover the approved transaction journey from the unified entry point; process meaning also differs from the approved U-curve. |
| Probable cause | Homepage implementation predates or does not yet consume the approved decision contract. |
| Recommendation / acceptance | Route to the decision owner for an authorized bounded Homepage update. Acceptance requires a clearly discoverable Retail path without making Retail primary, and two semantic U-curve placements with the approved labels. Do not invent CTA copy or Retail product/policy details. |
| Dependencies / human decision | DEC-UX-001 detailed navigation/CTA treatment remains deferred; explicit product/UX authorization is required. |
| First / last SHA | `c28684d` / `c28684d` |

### UX-002 — Repeated color-contrast failures on public and auth surfaces

| Field | Value |
| --- | --- |
| Severity / status | `P1` / `open` |
| Category | Accessibility violation |
| Confidence | 97% |
| Expected | Text and controls meet WCAG contrast expectations and retain visible focus and meaning across the approved palette. |
| Actual | Axe recorded 27 serious `color-contrast` route/viewport instances. Examples include action CTA 3.78:1, proof text 3.32:1, Contact visual text 1.91:1, and Forgot Password submit 2.88:1. Relevant tokens/classes are `frontend/src/index.css:9-10`, `frontend/src/components/brand/BrandSystem.jsx:383-386`, and auth buttons in `frontend/src/pages/auth/ForgotPassword.jsx:84-87` and `ResetPassword.jsx:81,133`. |
| Evidence / command | Ad-hoc Playwright + `@axe-core/playwright` scan at 375/768/1024/1440; `npx.cmd playwright test e2e/accessibility.spec.js --project=mobile --reporter=line` was fixture-blocked for Admin. |
| Impact | Low-vision users may not read primary actions, proof, links, or auth submit controls. |
| Probable cause | Blue surface/text combinations and the legacy `bg-primary`/`text-text-on-primary` auth classes are not contrast-verified as rendered. |
| Recommendation / acceptance | Correct tokens or bounded component variants through an approved remediation; rerun axe and manual focus/contrast checks at all four widths. Acceptance: no WCAG A/AA contrast violations in the audited routes and no loss of focus visibility. |
| Dependencies | Approved palette ownership and a current browser test environment. |
| First / last SHA | `c28684d` / `c28684d` |

### UX-003 — Public mobile navigation allows focus to escape the open panel

| Field | Value |
| --- | --- |
| Severity / status | `P1` / `open` |
| Category | Accessibility violation; objective usability defect |
| Confidence | 94% |
| Expected | An open mobile navigation keeps keyboard focus within the active menu, exposes its state, and returns focus to the trigger on close. |
| Actual | `Navbar` handles Escape and focus placement but has no focus trap, inert background, `aria-modal`, or equivalent containment (`frontend/src/components/layout/Navbar.jsx:71-84,147-206`). Manual 375 px tabbing leaves the open panel and enters page content. |
| Evidence / command | Chromium manual keyboard spot-check on `/` at 375 px; source lines above. |
| Impact | Keyboard and switch users can lose navigation context and activate underlying content while the menu appears open. |
| Probable cause | Mobile panel is implemented as a visibility toggle rather than a contained dialog/menu interaction. |
| Recommendation / acceptance | Add an approved, semantics-correct containment pattern consistent with the existing Admin drawer. Acceptance: Tab/Shift+Tab remain in the open menu, Escape closes, focus returns to the trigger, and background content is unavailable while open. |
| Dependencies | Navigation interaction decision; do not change the deferred Retail/B2B treatment. |
| First / last SHA | `c28684d` / `c28684d` |

### UX-004 — Shared controls are below the 44 px touch-target baseline

| Field | Value |
| --- | --- |
| Severity / status | `P1` / `open` |
| Category | Accessibility violation; objective usability defect |
| Confidence | 91% |
| Expected | Interactive controls are generally at least 44×44 px on touch layouts, with an equivalent larger hit area where a compact visual is unavoidable. |
| Actual | Shared `Button` sizes include 40 px default, 32 px small, and 36 px icon; `Input` is 40 px, `SelectTrigger` 36 px, and `Switch` 20×36 px (`frontend/src/components/ui/button.jsx:29-32`, `input.jsx:10`, `select.jsx:17`, `switch.jsx:9`). Auth links measured 22–26 px; customer detail/download and Admin retry controls use `size="sm"`. |
| Evidence / command | Source review above; custom Chromium bounding-box scan at 375/768/1024/1440. Privacy email/WhatsApp inline links measured 205×17 and 110×17. |
| Impact | Frequent mobile actions are difficult to activate accurately, especially for motor-impaired users. |
| Probable cause | Desktop-density component defaults are reused in touch contexts without a target-size contract. |
| Recommendation / acceptance | Define an approved target-size policy by surface and update only bounded components/consumers. Acceptance: all primary and frequent touch actions pass the 44 px check or have a documented equivalent hit area; no destructive action becomes easier to mis-tap. |
| Dependencies | Component-system owner and Admin density decision. |
| First / last SHA | `c28684d` / `c28684d` |

### UX-005 — UserSelector is not an operable combobox/listbox

| Field | Value |
| --- | --- |
| Severity / status | `P1` / `open` |
| Category | Accessibility violation; objective usability defect |
| Confidence | 93% |
| Expected | A combobox exposes its popup relationship, option roles, active option, and Arrow/Home/End/Enter/Escape keyboard behavior. |
| Actual | `frontend/src/components/admin/UserSelector.jsx:103-207` has `role="combobox"` and `aria-expanded`, but the popup is a plain `div`, options are plain buttons, and the handler only handles Escape. There is no listbox/option relationship, active descendant, or arrow-key selection. |
| Evidence / command | Static source inspection; Admin runtime fixture was blocked by missing E2E super-admin credentials. |
| Impact | Keyboard and screen-reader Admin users cannot reliably search and choose an identity. |
| Probable cause | A visual command-palette pattern was added without the required combobox state machine. |
| Recommendation / acceptance | Use the approved accessible combobox primitive or implement its complete semantics. Acceptance: announced input/popup/options, deterministic keyboard navigation, selection announcement, focus restoration, and a target-size pass. |
| Dependencies | Admin identity-governance owner; role-aware seeded test data. |
| First / last SHA | `c28684d` / `c28684d` |

### UX-006 — Auth and customer workflows use prohibited pseudo-terminal styling

| Field | Value |
| --- | --- |
| Severity / status | `P2` / `open` |
| Category | Canonical-decision conflict; visual consistency issue |
| Confidence | 90% |
| Expected | Admin Studio is dense/calm/task-oriented, while customer journeys remain clear and restrained; DEC-OPS-001 and the Master Spec prohibit pseudo-terminal decoration. |
| Actual | `AuthShell` labels the flow `RETURN_TO_SITE`, `ACCESS_SCOPE`, and `SITE` (`frontend/src/components/auth/AuthShell.jsx:21-53`); `NewOrder` and `OrderDetail` use “Stepper HUD”, terminal-like headers, and tiny monospace labels (`frontend/src/pages/operational/NewOrder.jsx:85-100,193-206`; `OrderDetail.jsx:85-151`). |
| Evidence / command | Static source review against DEC-OPS-001 and `DESIGN.md`; Chromium rendered auth/customer smoke where accessible. |
| Impact | Operational and customer tasks inherit decorative system-console language, weakening hierarchy, comprehension, and the approved surface separation. |
| Probable cause | Marketing/brand-lab visual motifs were reused in operational/auth components. |
| Recommendation / acceptance | Remediate only through an approved bounded content/style correction. Acceptance: customer/Admin task labels are plain-language and task-focused; technical identifiers remain only where meaningful; no prohibited pseudo-terminal strings or decorative telemetry. |
| Dependencies / human decision | DEC-OPS-001 surface-direction owner. |
| First / last SHA | `c28684d` / `c28684d` |

### UX-007 — Loading, retry, and motion states are not consistently announced or motion-safe

| Field | Value |
| --- | --- |
| Severity / status | `P2` / `open` |
| Category | Accessibility violation |
| Confidence | 88% |
| Expected | Loading, retry, error, empty, and progress states are announced semantically; motion has a static reduced-motion equivalent. |
| Actual | `ProtectedRoute` renders a bare `animate-spin` div without `role="status"` or accessible text (`frontend/src/components/auth/ProtectedRoute.jsx:11-17`); `Skeleton` uses `animate-pulse` without a reduced-motion modifier; `ErrorState` retry uses `size="sm"` (`frontend/src/components/ui/error-state.jsx:34-70`). `OrderDetail` adds an `animate-pulse` clock (`:232`) while some status text is not motion-independent. |
| Evidence / command | Static source review; public reduced-motion scan was positive, but these protected/state branches were not runtime-exercised because the API/role fixture was unavailable. |
| Impact | Screen-reader users may not know a protected route is loading; motion-sensitive users may encounter unnecessary animation; retry actions are small. |
| Probable cause | State components evolved independently of the shared live-region and reduced-motion contract. |
| Recommendation / acceptance | Standardize status/live-region semantics, retry target sizes, and `motion-reduce` behavior. Acceptance: each loading/error/retry branch has a named status/action, static equivalent, and keyboard-visible focus. |
| Dependencies | Shared state-component owner and seeded state fixtures. |
| First / last SHA | `c28684d` / `c28684d` |

### UX-008 — Reset-password validation text is not fully associated with fields

| Field | Value |
| --- | --- |
| Severity / status | `P2` / `open` |
| Category | Accessibility violation; objective usability defect |
| Confidence | 89% |
| Expected | Every password error is linked with `aria-describedby` and reflected through `aria-invalid`; success and failure are announced. |
| Actual | `ResetPassword` renders mismatch/length messages around `frontend/src/pages/auth/ResetPassword.jsx:103-120`, but the corresponding inputs do not expose those messages through `aria-describedby`/`aria-invalid`. The success branch does use `role="status"` (`:75`). |
| Evidence / command | Static source inspection; Chromium route smoke with missing-token and form branches. |
| Impact | Assistive-technology users may submit invalid passwords without hearing which field or rule failed. |
| Probable cause | Error wiring was implemented for the email flow but not carried through to both password fields. |
| Recommendation / acceptance | Associate each rule message with its input and preserve focus/error order. Acceptance: invalid state, exact message, and successful completion are announced in keyboard and screen-reader review. |
| Dependencies | Auth/recovery component owner. |
| First / last SHA | `c28684d` / `c28684d` |

### UX-009 — Public typography rollout crosses a documented deferral

| Field | Value |
| --- | --- |
| Severity / status | `P2` / `open` |
| Category | Canonical-decision conflict; visual consistency issue |
| Confidence | 84% |
| Expected | DEC-UX-002 and the Master Spec preserve Poppins for display/navigation/buttons and Inter for body/forms/metadata; the broader public typography rollout to About/Capabilities/Projects/Contact is documented as deferred. |
| Actual | `.brand-page` applies a global public typography override across all brand pages (`frontend/src/index.css:388-401,505-514`), including the deferred pages. |
| Evidence / command | Static source review against DEC-UX-002:28-29 and Master Spec deferred rollout section; Chromium computed-style spot-check on all public routes. |
| Impact | Runtime scope and typography governance are no longer aligned, making later page-by-page decisions and visual regression attribution harder. |
| Probable cause | Shared `brand-page` styling was expanded beyond the authorized Homepage slice. |
| Recommendation / acceptance | Record an explicit approval or bound the typography scope to the authorized surface; do not redesign pages during this audit. Acceptance: source scope and decision register agree, with computed Poppins/Inter roles verified on approved routes. |
| Dependencies / human decision | Product/brand owner approval; this finding is not permission to revert or redesign. |
| First / last SHA | `c28684d` / `c28684d` |

### UX-010 — Privacy page retains removed Internship language

| Field | Value |
| --- | --- |
| Severity / status | `P2` / `open` |
| Category | Canonical-decision conflict; objective content/IA defect |
| Confidence | 92% |
| Expected | Public information architecture and privacy copy reflect the current approved Admin scope and should not imply a live Internship workflow after DEC-OPS-002 removed Internship management. |
| Actual | `PrivacyPolicyPage` still lists “Formulir Pendaftaran Magang” and “pendaftaran magang” (`frontend/src/pages/marketing/PrivacyPolicyPage.jsx:20,39,47`), while DEC-OPS-002 removes Internship from Admin scope. |
| Evidence / command | Static source review against DEC-OPS-002; `/privacy` Chromium smoke. |
| Impact | Visitors may expect an unavailable application flow and receive inaccurate data-use context. |
| Probable cause | Privacy content was not reconciled after the scope reduction. |
| Recommendation / acceptance | Obtain content/privacy-owner approval for a factual update. Acceptance: every named data-collection purpose corresponds to an active, documented journey, without inventing policy. |
| Dependencies | Privacy/content owner and DEC-OPS-002 reconciliation. |
| First / last SHA | `c28684d` / `c28684d` |

### UX-011 — Public composition remains highly repetitive (subjective)

| Field | Value |
| --- | --- |
| Severity / status | `P3` / `open` |
| Category | Subjective improvement; visual consistency issue |
| Confidence | 67% |
| Expected | DEC-UX-002 asks for an editorial hybrid with purposeful composition, not card-heavy or generic repeated SaaS patterns. |
| Actual | All public pages share `MarketingLayout` → `BrandPage` → `PageHero` and commonly `CTASection` (`frontend/src/components/brand/BrandSystem.jsx:83-90,215-250,369-416`). Variants and content differ, so this is not asserted as a functional defect. |
| Evidence / command | Static composition inventory and public screenshot/DOM spot-check. |
| Impact | Repetition may make About, Capabilities, Projects, Contact, FAQ, and Privacy feel templated and reduce information scent. |
| Probable cause | Shared layout primitives are used as default page skeletons. |
| Recommendation / acceptance | Treat as a design-review question only; preserve approved typography, U-curve, routes, CTA names, and surface boundaries. Acceptance is an explicit owner decision, not an automatic redesign. |
| Dependencies / human decision | Brand/UX owner; no implementation authorized by this finding. |
| First / last SHA | `c28684d` / `c28684d` |

## 8. Positive controls verified

- Public navigation links and primary buttons generally use `min-h-11` or
  `min-h-12` in `Navbar.jsx` and `CompanyProfileBlocks.jsx`.
- Contact form labels, `aria-describedby`, and `aria-invalid` are wired for
  its fields in `BrandSystem.jsx:454-631`.
- Public smoke routes have one `h1` and no document-level horizontal overflow at
  375/768/1024/1440 px.
- `BrandPage` skips GSAP when reduced motion is requested, and the CSS
  reduced-motion block removes public transitions/animation.
- Admin drawer includes skip link, dialog/inert state, Escape handling, focus
  trap, and focus restoration in `AdminLayout.jsx:61-92,115-147`.
- Radix-based Dialog/Select/Tabs primitives are present; individual consumer
  semantics still require the blocked Admin runtime recheck.

## 9. Environment and evidence limitations

- Admin official tests require real E2E environment values; no values were
  supplied or exposed. The missing-credential failure is recorded as a
  blocker, not a pass or product defect.
- Backend-backed public/customer states were not fully exercised: attempts to
  reach `/api/health`, `/api/health/live`, and `/api/health/ready` on the
  local port returned 404, and browser console logs showed refused API
  connections for data-backed pages. No server or API configuration was
  changed.
- Firefox/WebKit are unavailable; no screen reader, real-device, zoom, or
  staging smoke was run.
- Screenshots/DOM captures are supporting evidence only; all findings point to
  route/component/source paths.

## 10. Human decisions required

Detailed Retail/B2B navigation and CTA treatment remain deferred by DEC-UX-001
and DEC-UX-002. This audit records the missing discoverability as UX-001 but
does not select a navigation design, product catalog, price, ETA, payment
provider, or policy. Remediation of findings is separately authorized work.

## 11. Resume handoff

- Audit state: `complete` for the bounded evidence scope above.
- Completed: authority mapping, route/state inventory, public/auth Chromium
  smoke, four-width overflow/heading scan, axe contrast scan, keyboard/mobile
  menu check, reduced-motion check, source review, and finding register.
- Not completed: seeded Admin role journeys, live customer/API state matrix,
  Firefox/WebKit, screen reader, real-device touch, zoom/reflow, and staging
  browser smoke.
- Exact next step: provision a non-production seeded E2E environment without
  recording credentials, then rerun `e2e/accessibility.spec.js` and
  `e2e/responsive.spec.js` across mobile/tablet/desktop and manually verify
  UserSelector, dialogs, menus, tables, errors, and permission states.
- Baseline SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
- Timestamp: 2026-07-28 WIB (UTC+07:00)

## 12. Changelog

### 2026-07-28 — Layer 02 UI/UX/accessibility audit

- Completed the bounded repository/static and Chromium public/auth audit.
- Recorded `UX-001` through `UX-011` with 0 P0, 5 P1, 5 P2, and 1 P3.
- Recorded four-width responsive evidence, axe contrast results, keyboard
  navigation, reduced-motion behavior, positive controls, and explicit
  Admin/browser/assistive-technology blockers.
- No implementation, design, test, configuration, credential, commit, push, or
  product decision changed.
