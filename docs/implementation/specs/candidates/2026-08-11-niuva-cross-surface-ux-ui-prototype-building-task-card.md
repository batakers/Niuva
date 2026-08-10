# Candidate Task Card — Build Cross-Surface UX/UI Reconciliation Prototype

**Status:** Candidate — Context Only — task-card preparation authorized;
prototype construction requires separate owner approval

**Date:** 11 August 2026

**Fresh baseline:** `origin/main` at
`f8426db218922b2b61fb23f291014a57b9df294c`

**Parent packet:**
[`2026-08-11-niuva-cross-surface-ux-ui-reconciliation-packet.md`](2026-08-11-niuva-cross-surface-ux-ui-reconciliation-packet.md)

**Public visual evidence:**
[`2026-08-10-niuva-public-visual-refinement-prototype-r1`](../../prototypes/2026-08-10-niuva-public-visual-refinement-prototype-r1/README.md)

**Owner decisions imported:** `CSR-01` through `CSR-08`, accepted
11 August 2026

**Owner workflow refinements accepted:** canonical-first skill hierarchy,
surface-specific design reads, anti-template checks, complete UI-state floors,
measurable accessibility constraints, bounded motion/assets, and a finite
iteration rule, accepted 11 August 2026

## 1. Objective and gate

When separately authorized, build one isolated, synthetic, clickable prototype
that tests the accepted rule **One Niuva identity, surface-native
composition** across five representative slices:

1. Public identity and B2B conversion;
2. Retail discovery and product specification;
3. customer-owned activity and Order state;
4. customer authentication and recovery; and
5. Admin Studio, structured CMS, inventory, and Retail Order operations.

The prototype must prove that the surfaces share Niuva identity and semantic
foundations without becoming one relabelled hero/card/dashboard template. It
must adapt existing page responsibilities, not discard their valid route,
lifecycle, permission, privacy, compatibility, and recovery contracts.

This task card authorizes planning only. It does not authorize prototype file
creation, production source changes, commit, push, PR, merge, moderated
research, canonical promotion, provider activation, deployment, readiness, or
go-live.

## 2. Authority and freshness

### 2.1 Required reading order

The build driver must resolve conflicts in this order:

1. [`docs/NIUVA_MASTER_SPEC.md`](../../../NIUVA_MASTER_SPEC.md)
2. [`docs/context/DOCUMENT_REGISTER.md`](../../../context/DOCUMENT_REGISTER.md)
3. [`docs/decisions/DECISION_REGISTER.md`](../../../decisions/DECISION_REGISTER.md)
4. the approved decision or ADR applicable to the surface;
5. the applicable runbook;
6. source and tests at the selected baseline;
7. the parent packet, this task card, and prototype evidence.

The primary experience authority is:

- [`DEC-ARCH-01` / `ADR-004`](../../../decisions/architecture/ADR-004-surface-boundary-topology.md);
- [`DEC-UX-001`](../../../decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md);
- [`DEC-UX-002`](../../../decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md);
- [`DEC-UX-003`](../../../decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md);
- [`DEC-OPS-001`](../../../decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md);
- [`DEC-OPS-002`](../../../decisions/experience/DEC-OPS-002-admin-scope-reduction.md);
- [`DEC-OPS-003`](../../../decisions/experience/DEC-OPS-003-reduced-integrated-cms-mvp.md); and
- [`DESIGN.md`](../../../../DESIGN.md) as the subordinate active
  cross-surface implementation guardrail.

The prototype states must also remain subordinate to:

- [`DEC-OFFER-01`](../../../decisions/product/DEC-OFFER-01-retail-offer-file-and-quote-routing.md);
- [`DEC-INV-01`](../../../decisions/product/DEC-INV-01-retail-checkout-reservation-duration.md);
- [`DEC-ETA-01`](../../../decisions/product/DEC-ETA-01-retail-eta-and-customer-milestone-policy.md);
- [`DEC-FUL-01`](../../../decisions/product/DEC-FUL-01-shipping-and-pickup-policy.md);
- [`DEC-AFTER-01`](../../../decisions/product/DEC-AFTER-01-retail-revision-and-after-sales-policy.md);
- [`DEC-DATA-003`](../../../decisions/product/DEC-DATA-003-notification-schema-retention-and-delivery-boundary.md); and
- [`DEC-ACCESS-003`](../../../decisions/access/DEC-ACCESS-003-legacy-order-compatibility-and-customer-projection.md).

Other applicable inventory, payment, access, and authentication decisions
remain authoritative for their owned state. A visual fixture may not invent or
amend those contracts.

### 2.2 Baseline refresh after PR #228

The parent packet inspected `origin/main` at `954837c`. This task card was
reconciled against `f8426db`, after PR #228 and the later merged changes.

The refresh found:

- no changed file under `frontend/src` between the packet baseline and this
  baseline;
- the route and component mapping in the parent packet therefore remains
  current source evidence;
- Retail Order backend contract hardening after the packet does not activate a
  frontend transaction or provider;
- the Public Visual Refinement prototype is now merged documentation/evidence
  and may be reused one-way inside a new isolated prototype; and
- merged prototype evidence does not promote typography, routes, providers,
  or application implementation authority.

If `origin/main` changes before the build starts, the driver must record the
new SHA and repeat the route, authority, selected-source, and overlapping-diff
checks before editing.

### 2.3 Design workflow and skill conflict resolution

The build must use this authority hierarchy:

1. canonical Niuva authority and approved owner decisions;
2. the Impeccable workflow as the primary design and visual-quality method;
3. the selected supporting skills only for their bounded concern; and
4. the Driver's implementation judgment inside the approved prototype scope.

No skill, detector, style database, aesthetic preset, or generated suggestion
may amend a route, lifecycle, role, provider, commercial policy, brand token,
or other canonical contract. The explicitly invoked Impeccable installation
for this task-card review was
`C:\Users\FAIZ\.codex\skills\impeccable` (`3.9.1`). Before building, the
Driver must record the actual skill base, version, and detector checksum used
and must not silently combine instructions from a different installed version.

<!-- markdownlint-disable MD013 -->

| Workflow/reference | Owned concern | Required use | Explicitly rejected automatic behavior |
| --- | --- | --- | --- |
| Impeccable | Primary UX/UI workflow and visual-quality gate | Load project context, inspect incumbent visual truth, select Brand or Product register per surface, run first-order/second-order anti-reflex checks, complete browser review, and run the detector once after the final UI edit state | It does not supersede canonical Niuva authority, approve implementation, or turn detector output into a design verdict |
| Frontend Design, Taste, and Baoyu Design | Public composition, design specificity, and non-template critique | Use for the Public/B2B slice, artifact-led composition, route-specific visual rhythm, and design-option reasoning | Do not apply marketing-page patterns to Admin/customer workflow UI; do not automatically replace Poppins/Inter, add dark mode, use gradients/glass/bento, generate assets, or introduce a new aesthetic system |
| Frontend Dev and Effective HTML | Prototype feasibility, local assets, responsive behavior, complete reachable states, browser evidence, and implementation restraint | Build the smallest credible experience that answers the review questions; keep it local, deterministic, keyboard-operable, and self-contained | Do not add dependencies, cinematic motion, fake provider behavior, or production abstractions |
| Fullstack Dev | Lifecycle, authentication, authorization, privacy, error, data, and provider boundary review | Verify that every simulated transition and projection remains safe and subordinate to its owning contract | Do not create API, schema, migration, service, provider, persistence, or production implementation authority |
| Emil Design Engineering, UI/UX Pro Max, and Design Review | Purposeful interaction feedback, motion restraint, accessibility/responsive floors, and screenshot critique | Apply only relevant motion, state, performance, screenshot, and accessibility checks | Do not make motion decorative, require a motion library or dark mode, replace brand tokens, or expand the prototype surface set |

<!-- markdownlint-enable MD013 -->

The following repository decisions win over generic skill defaults:

- Poppins and Inter retain their approved semantic roles; no skill-level font
  preference authorizes replacement or external font loading;
- Niuva blue remains a scarce semantic brand/action/focus color; generic
  advice to avoid blue does not apply;
- light/dark mode is not added merely because a reference recommends it;
- no dependency, UI kit, icon family, token system, motion library, or global
  configuration is added;
- no gradient, glow, glass, bento, card grid, perpetual motion, or generated
  imagery is introduced by default; and
- existing approved local assets and truthful content win over decorative or
  synthetic filler.

## 3. Boundary and exclusions

The prototype must not:

- edit or runtime-import any file under `frontend/` or `backend/`;
- call an API, database, authentication service, storage service, map,
  WhatsApp, payment, shipping, analytics, notification, or other provider;
- create a real Inquiry, Retail Request, Offer, Order, reservation, payment
  attempt, case, content version, inventory movement, or audit event;
- activate `/register`, configuration, upload, checkout, payment, logistics,
  notification, after-sales, or customer B2B portal behavior;
- choose `/retail/cart` or exact customer after-sales routes;
- treat a candidate project-detail path as a production route decision;
- merge Retail Request/Offer/Order with B2B Inquiry/Quote/Project;
- expose internal cost, margin, supplier, profit, internal notes, provider
  payloads, foreign-customer data, or unverified production telemetry;
- invent products, availability, client proof, CAD, slicer output, metrics,
  prices, ETA, queue position, completion percentage, testimonials, or SLA;
- add a dependency, font, icon family, token system, UI kit, secret, global
  configuration, or environment variable;
- copy public editorial scale into customer, authentication, or Admin tasks;
  or
- claim production implementation, accessibility conformance, provider
  readiness, deployment readiness, or go-live.

All fixture values are synthetic and visibly identified as `SIMULASI`.
Approved local Niuva marks and project media are the only non-synthetic
evidence and require exact provenance. Commercial or duration values may
appear only when they are traced to an approved decision or are clearly
fixture-local examples that cannot be read as an Niuva quotation, checkout
total, or production promise.

## 4. Isolation and exact file ownership

### 4.1 Planned build location

The separately authorized build must use a new worktree from a freshly fetched
`origin/main`:

`C:\tmp\niuva-cross-surface-ux-ui-prototype-r1`

The repository artifact root, if publication is later approved, is:

`docs/implementation/prototypes/2026-08-11-niuva-cross-surface-ux-ui-prototype-r1/`

The current Public prototype and every existing application worktree remain
read-only inputs. Do not edit, overwrite, reset, clean, or delete them.

### 4.2 Planned prototype files

Only the following prototype paths may be created by the build task:

```text
docs/implementation/prototypes/2026-08-11-niuva-cross-surface-ux-ui-prototype-r1/
  index.html
  review.html
  styles.css
  app.js
  fixtures.js
  server.cjs
  browser-validation.cjs
  prototype-flow.contract.test.cjs
  README.md
  BASELINE_CAPTURE.md
  BROWSER_REVALIDATION.md
  VISUAL_QA.md
  COMPLETION_AUDIT.md
  ASSET_MANIFEST.md
  assets/
    niuva-mark.svg
    projects/*
    retail/*
  evidence/
    baseline/*
    prototype/*
    browser-results.json
```

The `retail` asset directory is optional. It may contain only a traced,
approved local source asset or an unmistakably synthetic object visual that is
labelled `SIMULASI` and recorded in `ASSET_MANIFEST.md`. The prototype must use
a truthful text/specification fallback when no suitable asset exists; it must
not generate fake customer proof, CAD, slicer, or printer imagery to fill
space.

The task card itself owns only:

`docs/implementation/specs/candidates/2026-08-11-niuva-cross-surface-ux-ui-prototype-building-task-card.md`

Formal critique reports, publication metadata, or production task cards are
not silently added to the build scope. Each requires its named later gate.

## 5. Read-only baseline capture and reuse map

Before building the prototype, capture the selected current-source routes at
the build SHA. If protected or data-backed routes cannot be opened without
credentials or a real backend, record the safe redirect/unavailable state and
the limitation; do not bypass authentication, seed production data, or weaken
guards merely to obtain a screenshot.

<!-- markdownlint-disable MD013 -->

| Slice | Current source evidence to inspect | Reuse disposition | Prototype responsibility |
| --- | --- | --- | --- |
| Public | `HomePage.jsx`, `CapabilitiesPage.jsx`, `ProjectsPage.jsx`, `ContactPage.jsx`, `MarketingLayout`, Public navigation | Carry forward approved Public prototype evidence and current behavior; do not import runtime code | Add Capabilities and cross-surface comparison while preserving Home/Projects/Contact truth and route-specific composition |
| Retail | `RetailCatalogPage.jsx`, `RetailProductPage.jsx`, `RetailProductVisual.jsx`, catalog helpers and tests | Preserve discovery/loading/error/availability semantics; recompose as safe commerce | Demonstrate catalog, stable product specification, and candidate configurator outcomes without activating transactions |
| Customer | `ClientDashboard.jsx`, `OrderDetail.jsx`, `OperationalNavigation`, lifecycle-owned legacy components | Preserve customer projection and compatibility meaning; do not promote legacy state machine | Demonstrate owned activity, factual next action, normal and attention-required Order states |
| Authentication | `CustomerLogin.jsx`, `ResetPassword.jsx`, `ResetPasswordState.jsx`, `AuthShell` and tests | Reuse audience, recovery, and non-enumerating trust contracts | Demonstrate one-task composition, generic failure, expired recovery, and safe return action |
| Admin/CMS | `AdminDashboard.jsx`, `ContentEditor.jsx`, `Inventory.jsx`, `RetailOrderDetail.jsx`, `AdminLayout`, permission and lifecycle components | Preserve role/permission/lifecycle ownership; do not import public styling | Demonstrate role queue, structured CMS conflict, inventory recovery, and Retail Order blocker/history |
| Shared foundation | `index.css`, `tailwind.config.js`, adopted `components/ui`, component register | Reuse semantic roles and documented component contracts as design authority | Recreate only the minimum standalone prototype primitives; no parallel production UI kit |

<!-- markdownlint-enable MD013 -->

Every baseline capture must record route, viewport, source state, date, SHA,
authentication/data limitation, and screenshot path in `BASELINE_CAPTURE.md`.

## 6. Participant Mode and Review Mode

- **Participant Mode** is served by `index.html`. It contains product-facing
  navigation, one neutral `SIMULASI` boundary, and the selected task only. It
  must not contain fixture/scenario IDs, packet language, evaluator prompts,
  expected answers, route diagnostics, open gates, implementation notes,
  source paths, or Review controls in its DOM.
- **Review Mode** is served separately by `review.html`. It may select/reset a
  fixture, role, viewport note, and evidence state. It must explicitly hand off
  to a clean Participant URL before a task is assessed.
- Review Mode may never log credentials, secrets, production data, full
  provider payloads, or another customer's record.
- Reset removes all prototype-only in-memory/session state and never touches
  application storage, cookies, APIs, or production data.
- Participant URLs may resemble approved routes for comprehension, but every
  missing or candidate route remains visibly simulated and gains no production
  authority through the prototype.

## 7. Exact representative route and fixture contract

All IDs below are local to this prototype. They are visible only in Review Mode
and evidence files.

### 7.1 Public identity and B2B conversion

<!-- markdownlint-disable MD013 -->

| Fixture | Participant route/state | Required proof | Forbidden implication |
| --- | --- | --- | --- |
| `XSR-FX-PUB-01` | `/` ready | B2B-primary artifact evidence, compact and complete semantic `Need → Research → Experiment → Prototype → Output`, clearly secondary Retail path | Retail-first marketplace or repeated decorative U-curve |
| `XSR-FX-PUB-02` | `/capabilities` ready | Four service families expressed through decisions, methods, outputs, and evidence; route composition differs from Home | Four interchangeable feature cards or a cloned Home hero sequence |
| `XSR-FX-PUB-03` | `/capabilities` unavailable | Page context, factual unavailability, and safe recovery | Empty content rendered as trusted current CMS content |
| `XSR-FX-PUB-04` | `/projects` ready | Artifact-led comparison with truthful project context | Fabricated metrics, logos, or equal portfolio card wall |
| `XSR-FX-PUB-05` | candidate detail state | Challenge, decision, artifact, output, provenance, and return to Projects | Claim that an exact production detail route is approved |
| `XSR-FX-B2B-01` | `/contact` empty/invalid | Form-first Inquiry, exact consent, adjacent errors, focused summary, preserved values | WhatsApp click records an Inquiry |
| `XSR-FX-B2B-02` | `/contact` persistence unavailable/retry | Distinct unavailable state, values preserved, safe retry, no field-invalid blame | Record was saved or operator received it |
| `XSR-FX-B2B-03` | `/contact` persisted/WhatsApp handoff | Synthetic Inquiry reference, Niuva Operations calendar/response target, user-confirmed optional handoff | Quotation/ETA guarantee, automatic message, or success before persistence |

<!-- markdownlint-enable MD013 -->

The Public prototype merged through PR #230 may be copied one-way as a
starting evidence implementation for Home, Projects, and Contact. The new
prototype must record its source SHA/checksum and must still revalidate every
carried state. Capabilities must be newly composed for its own route job.

The Contact form fields are `company`, `pic_name`, `pic_email`, required
`pic_phone`, `need`, `timeline`, and `brief`. Its response expectation is owned
by Niuva Operations: Monday–Friday, 09.00–17.00 WIB, excluding public holidays,
with a first-human-response target of at most one working day. This is not a
quotation, price, ETA, or project-start guarantee.

### 7.2 Retail discovery and specification

<!-- markdownlint-disable MD013 -->

| Fixture | Participant route/state | Required proof | Forbidden implication |
| --- | --- | --- | --- |
| `XSR-FX-RET-01` | `/retail` ready | Product type, published-price meaning, availability, filter state, and safe next action | Transaction capability is active |
| `XSR-FX-RET-02` | `/retail` unavailable/filtered empty | Distinguish environment unavailable, true empty, and no-filter-result recovery | No products exist when only the environment failed |
| `XSR-FX-RET-03` | `/retail/products/custom-fdm-sim` discovery only | Stable object/specification summary, publication meaning, and inactive action boundary | Product is purchasable or stock is reserved |
| `XSR-FX-RET-04` | `/retail/products/custom-fdm-sim/configure` simple eligible simulation | Selected material/options, file boundary, authority label, calculation inputs, safe eligible outcome | Real upload, authoritative checkout total, or Order creation |
| `XSR-FX-RET-05` | same candidate route, detailed `quote_required` | Retained specification, reason, manual-review next step, and no re-entry | Request, Offer, Order, reservation, or payment exists |
| `XSR-FX-RET-06` | same candidate route, analysis unavailable | Preserve local selections and explain safe retry/manual path | File analysis or calculation succeeded |

<!-- markdownlint-enable MD013 -->

The configurator route is an approved product target but absent from current
source. The prototype may test its composition only. It must not simulate an
active provider, private upload, durable Request, cart, checkout, or payment.

### 7.3 Customer-owned state

<!-- markdownlint-disable MD013 -->

| Fixture | Participant route/state | Required proof | Forbidden implication |
| --- | --- | --- | --- |
| `XSR-FX-CUS-01` | `/dashboard` owned activity | Record identity, factual state, attention summary, next action, and clear legacy/future separation | B2B resources and Retail Orders share one lifecycle |
| `XSR-FX-CUS-02` | `/orders/ORD-SIM-001` normal | Commitment snapshot, approved milestone wording, ETA meaning, fulfilment, history, and next action | Live printer telemetry, queue position, or percentage complete |
| `XSR-FX-CUS-03` | `/orders/ORD-SIM-002` attention required | One explicit exception such as ETA overdue or file revision, reason, customer-safe recovery, and preserved history | Internal notes, automatic cancellation/refund, or blind duplicate payment |
| `XSR-FX-CUS-04` | missing/foreign Order | Same non-enumerating customer-safe unavailable projection | Existence or data of another customer's Order |

<!-- markdownlint-enable MD013 -->

All Order identifiers are synthetic. The future Retail Order composition must
remain visibly distinct from the current legacy read-only compatibility
contract.

### 7.4 Authentication and recovery

<!-- markdownlint-disable MD013 -->

| Fixture | Participant route/state | Required proof | Forbidden implication |
| --- | --- | --- | --- |
| `XSR-FX-AUTH-01` | `/login` empty/submitting | Customer audience, one primary task, allowlisted continuation explanation, visible loading and focus | Staff language, active registration, or real session creation |
| `XSR-FX-AUTH-02` | `/login` generic failure | Non-enumerating error, preserved non-secret field, retry and recovery | Account existence or credential detail |
| `XSR-FX-AUTH-03` | `/reset-password/error` expired/invalid | Clear expired-token state, safe request-new-link and customer return | Token validity or account existence disclosure |
| `XSR-FX-AUTH-04` | `/reset-password/success` simulated | Clear completion boundary and safe sign-in destination | Password was changed in a real identity system |

<!-- markdownlint-enable MD013 -->

No fixture contains a real email, password, token, cookie, or account.

### 7.5 Admin Studio, CMS, inventory, and Retail Order

<!-- markdownlint-disable MD013 -->

| Fixture | Participant route/state | Required proof | Forbidden implication |
| --- | --- | --- | --- |
| `XSR-FX-ADM-01` | `/admin` role-aware home | Owned priority, blocked work, age, permission-safe next action, and calm density | Universal KPI-card grid, fake telemetry, or identical role home |
| `XSR-FX-ADM-02` | `/admin/content` draft/preview | Structured fields, version, validation, preview, explicit publication consequence, and permission | Free-form page builder or save equals publish |
| `XSR-FX-ADM-03` | `/admin/content` stale conflict | Visible old/new version context, rejected save, reload/compare recovery, and audit note | Silent overwrite or toast-only critical failure |
| `XSR-FX-ADM-04` | `/admin/inventory` low/depleted | Quantity meaning, source/version, filter, restock awareness, and allowed next action | Stock inferred from UI alone or supplier data exposed broadly |
| `XSR-FX-ADM-05` | `/admin/inventory` adjustment conflict/denied | Reason, current value, submitted change, permission/transaction boundary, and recovery | Non-atomic fallback or optimistic success |
| `XSR-FX-ADM-06` | `/admin/retail-orders/ORD-SIM-002` attention required | Retail Order identity, payment/production/QC/fulfilment state, blocker, history, and safe allowed action | Legacy `/admin/orders` is an active queue or Retail/B2B lifecycle merge |

<!-- markdownlint-enable MD013 -->

Admin fixtures use synthetic role and record data. Hidden controls never count
as authorization; the prototype must show both route-level and action-level
permission outcomes without exposing restricted data.

## 8. Shared identity and surface-native composition contract

### 8.1 Design read and real-use context

**Design read:** this is a cross-surface reconciliation prototype for a 3D
printing studio with one identity and several different jobs. It is not a new
brand campaign, marketplace template, universal dashboard skin, or production
redesign. Public surfaces persuade through authentic artifacts; transactional
and account surfaces make commitments and owned state understandable; Admin
helps one non-IT operator act safely under normal work pressure.

The numeric dials below are prototype-local review controls, not canonical
tokens or production requirements. They exist to prevent one visual template
from spreading across every surface.

<!-- markdownlint-disable MD013 -->

| Surface | Mode and physical-use scene | Variance / motion / density | First-viewport focal moment |
| --- | --- | --- | --- |
| Public/B2B | Persuade/Experience; a prospective partner scans credibility on a phone or laptop before deciding whether to discuss a project | `7 / 3 / 3` | One authentic artifact plus the relevant decision/transformation and a clear B2B action |
| Retail | Operate; an individual or UMKM compares an object, specification, availability, and safe next step, often on a phone | `4 / 2 / 5` | Product/specification identity and current commitment authority, not a campaign hero |
| Customer | Operate; an authenticated customer checks an Order during an interrupted mobile session and needs the current state and next action quickly | `3 / 2 / 5` | Owned record identity, factual state, attention, and one safe next action |
| Authentication | Operate; a customer may be stressed or time-limited while signing in or recovering access on phone or desktop | `3 / 1 / 4` | Trust, audience, one task, and recoverable feedback without account enumeration |
| Admin/CMS | Operate; one non-IT Niuva operator works primarily on a laptop during operating hours and may manage content and Retail work in the same shift | `4 / 1 / 8` | Owned queue/record, blocker or age, permission-safe action, and recoverable history |
| Review Mode | Operate; the owner or expert reviewer compares deterministic states and evidence on a desktop without entering Participant Mode language | `2 / 1 / 8` | Fixture/evidence control and a clean handoff to the selected Participant task |

<!-- markdownlint-enable MD013 -->

Motion values above describe intensity, not a requirement to animate. A static
composition is correct when motion would not explain hierarchy, feedback, or
state change.

### 8.2 Anti-template and category-reflex gate

Every primary route must pass all three tests:

1. **First-order reflex:** the visual cannot be guessed solely from the route
   category. Public cannot default to an agency landing template, Retail to a
   marketplace card wall, customer/auth to generic SaaS panels, or Admin to a
   universal KPI dashboard.
2. **Second-order reflex:** avoiding the first cliché cannot merely replace it
   with another saturated aesthetic family, such as generic editorial agency,
   terminal-native operations, glass/bento commerce, or oversized sparse
   dashboard styling.
3. **Logo-hidden recognition:** when the Niuva mark and route title are hidden,
   a reviewer must still explain which surface job the composition supports
   from its information hierarchy, artifact/record anchor, density, state, and
   action model.

The design fails if it could be transferred unchanged to an unrelated studio,
store, SaaS portal, or admin product by replacing only the logo, heading,
accent color, and fixture data. Each route needs one evidence-led focal moment
that belongs to its task. Repeated focal patterns across unrelated jobs count
as template reuse, even when their copy differs.

<!-- markdownlint-disable MD013 -->

| Surface | Visual anchor | Density and composition | Must not inherit |
| --- | --- | --- | --- |
| Public/B2B | Authentic artifact, decision, and transformation evidence | Expressive but restrained editorial hierarchy and varied reading rhythm | Admin tables, generic feature-card grids, decorative technical labels |
| Retail | Stable object/specification and commitment authority | Comparable groups, persistent summary, validation, and safe action | Public campaign hero, marketplace promotions, fake product proof |
| Customer | Owned record, current state, attention, next action | Calm status-first hierarchy with secondary history | Admin-only detail, internal metrics, editorial whitespace spectacle |
| Authentication | Identity, trust, one task, recovery | Restrained single-purpose composition and non-enumerating feedback | Public campaign blocks, Admin density, registration activation |
| Admin/CMS | Queue/record, state, owner/age, blocker, action, history | Dense lists, definitions, filters, ledgers, and bounded task panels | Public hero/U-curve, universal KPI cards, pseudo-terminal decoration |
| Review Mode | Fixture and evidence control | Compact evaluator tool visually outside the product | Product navigation or participant-facing claims |

<!-- markdownlint-enable MD013 -->

Use the existing semantic Niuva palette and type roles. Poppins remains the
approved Homepage display/UI emphasis. Inter remains body, form, customer, and
operational text. Broader Public typography is still candidate evidence, not a
production rollout. Monospace is limited to genuine identifiers,
measurements, revisions, and audit metadata.

The prototype fails the specificity gate if Public, Retail, customer, auth,
and Admin screenshots differ mainly by heading text, accent color, or card
content. It also fails when repeated uppercase eyebrows, random section
numbers, equal rounded cards, generic gradients, neon, glow, glass, fake
dashboards, decorative telemetry, fabricated precision, or evaluator language
become the visual identity.

## 9. Interaction, state, privacy, and lifecycle assertions

Contract tests and browser checks must fail if the prototype:

1. treats a WhatsApp action as Inquiry persistence;
2. creates an Order, reservation, payment attempt, checkout total, or paid
   state from configuration, `quote_required`, Request, or Offer alone;
3. accepts an Offer directly into payment without checkout revalidation;
4. offers blind duplicate payment from pending, processing, or uncertain
   state;
5. treats a provider return as settlement evidence;
6. merges Retail and B2B lifecycles or reactivates legacy `/order`;
7. exposes foreign or internal-only data;
8. turns a hidden UI action into the authorization boundary;
9. silently overwrites a stale CMS, inventory, or operational record;
10. uses a toast or live region as the only visible critical failure;
11. shows fabricated product availability, proof, price authority, ETA,
    production percentage, queue position, or telemetry;
12. makes missing or inactive routes appear implemented;
13. leaks fixture IDs, evaluator instructions, source paths, open gates, or
    Review controls into Participant Mode; or
14. contacts an external origin or writes durable browser/application state.

Every state transition must preserve the owning record/specification identity,
show what changed, move focus to a visible status or error target, and provide
a safe next action when recovery is possible.

### 9.1 Complete component-state floor

Not every state is meaningful for every component. When a state applies, it
must be both visibly distinguishable and semantically exposed; an absent state
requires a short disposition in `VISUAL_QA.md` rather than a silent omission.

<!-- markdownlint-disable MD013 -->

| Component or pattern | Required applicable states |
| --- | --- |
| Link, button, and action control | default, hover when hover-capable, focus-visible, active/pressed, disabled or unavailable, and loading/submitting |
| Form control | empty, filled, hover where useful, focus, invalid with adjacent reason, disabled/read-only, and success only when field-level success is meaningful |
| Data collection or route | loading, ready, true empty, filtered no-result, unavailable, error, stale/conflict, and safe recovery where owned by the fixture |
| Customer or operational record | normal, attention required, missing/non-enumerating, denied, stale/conflict, and history/identity preservation |
| Async mutation simulation | idle, submitting, success acknowledgement, unavailable/failure, preserved input, retry, and duplicate-action protection |
| Dialog, confirmation, or handoff | closed, open, confirm, cancel, return, Escape/dismiss where allowed, and deliberate focus entry/return |

<!-- markdownlint-enable MD013 -->

These UI states may explain only lifecycle states already owned by section 7
fixtures and applicable canonical authority. A visual success style never
creates durable success or grants authorization.

### 9.2 Measurable visual and interaction floors

- normal text, labels, placeholders, helper text, and essential metadata must
  reach at least `4.5:1` contrast against their background;
- large text and meaningful non-text boundaries, state indicators, and focus
  indicators must reach at least `3:1` where the applicable accessibility
  criterion permits that threshold;
- Participant body text, labels, inputs, buttons, instructions, errors, and
  recovery copy must be at least `16px` on mobile; non-essential metadata may
  be smaller only when it remains readable, sufficiently contrasted, and is
  not the sole carrier of state;
- prose measure should normally stay within `65–75ch`; forms, alerts, and
  operational explanations should use a shorter measure when scanning wins;
- visible pointer targets must be at least `44 × 44px`, including icon-only
  actions and compact operational controls;
- display letter spacing must not be tighter than `-0.04em`, and display scale
  must be tested for overflow at every required viewport;
- focus must remain visible, unobscured by sticky content, and moved only when
  it helps the user understand a new route, error, status, or returned context;
  and
- zoom/reflow evidence must preserve content, meaning, order, and primary
  actions without requiring two-dimensional scrolling for ordinary content.

### 9.3 Motion and asset budget

- Animate only when it communicates hierarchy, feedback, or a state
  transition. High-frequency and keyboard-triggered actions should remain
  instant or nearly instant.
- UI feedback should normally complete in `150–250ms`; no interaction may use
  `transition: all`, animate layout properties without a demonstrated need, or
  hide essential content until an animation fires.
- Prefer CSS transitions on explicit properties for the bounded prototype. Do
  not add Motion, GSAP, a smooth-scroll tool, or another dependency.
- `prefers-reduced-motion` must preserve a complete static equivalent. Motion
  may not be required to discover content, state, or an action.
- Reuse approved local Niuva assets first. Any generated image or synthetic
  object visual requires separate owner approval, visible `SIMULASI`
  labelling, provenance in `ASSET_MANIFEST.md`, and confirmation that it cannot
  be mistaken for client proof, CAD, slicer output, stock, or production data.
- When approved media is unavailable, use a truthful text/specification or
  clearly bounded placeholder. Do not fill space with decorative fake media,
  hand-drawn substitute logos, fake screenshots, or external network assets.

## 10. Ordered vertical build tasks

Each task is independently reviewable. One Driver owns the prototype files;
parallel agents may perform read-only evidence or critique only when separately
authorized and assigned non-overlapping outputs.

### Foundation and highest-risk proof

- [ ] **Capture current-source before states:** record the selected source
  routes, SHA, viewport, safe runtime limitation, and screenshots without
  modifying application source or authentication. _Reuses current routes and
  tests as evidence only._
- [ ] **Create the Participant/Review boundary:** implement the standalone
  semantic shell, deterministic fixture reset, local server, and forbidden-
  vocabulary contract before page work. _Creates prototype-only files; no
  dependency or network call._
- [ ] **Establish one shared identity with six compositions:** implement the
  semantic palette/type/focus/state vocabulary plus one skeletal layout per
  surface so reviewers can reject a generic shared template early. _Reuses
  documented tokens; creates no production component._

### Representative surface slices

- [ ] **Public carry-forward plus Capabilities:** revalidate the approved Home,
  Projects, Contact, and candidate detail states from the Public prototype,
  then add a route-specific Capabilities composition and unavailable state.
  _One-way reuse of merged prototype evidence; depends on Foundation._
- [ ] **Retail stable specification slice:** build catalog ready/unavailable,
  product discovery-only, and configurator eligible/`quote_required`/analysis-
  unavailable states around one persistent specification summary. _Creates
  synthetic commerce UI; no transaction activation._
- [ ] **Customer owned-state slice:** build Dashboard plus normal,
  attention-required, and missing/foreign Order states with customer-safe
  projection and visible next action. _Reuses lifecycle wording as authority;
  does not extend legacy `StatusStepper`._
- [ ] **Authentication trust slice:** build customer login empty/submitting,
  generic failure, and recovery expired/success states with explicit audience
  and focus recovery. _Reuses `AuthShell` behavior as reference; no real auth._
- [ ] **Admin/CMS operational slice:** build role home, CMS draft/conflict,
  inventory low/conflict, and Retail Order blocker/history with lifecycle-owned
  status and permission-safe recovery. _Reuses adopted operational contracts
  as reference; no public composition or mutation._

### Interaction, responsive, and evidence closure

- [ ] **Complete cross-surface state assertions:** implement deterministic
  transitions and contract tests for persistence, ownership, permission,
  conflict, inactive capability, and forbidden side effects. _Creates local
  test coverage._
- [ ] **Recompose all selected states at four widths:** author 390, 768, 1024,
  and 1440 layouts so primary identity, state, and action remain visible without
  horizontal overflow or desktop-table squeezing. _Depends on all slices._
- [ ] **Run accessibility and interaction pass:** verify landmarks, headings,
  labels, adjacent errors, focus, keyboard order, touch targets, contrast,
  reduced motion, live feedback, dialog return, and zoom/reflow evidence.
- [ ] **Run anti-generic visual comparison:** produce a cross-surface contact
  sheet and explain why each composition belongs to its job; repeat the review
  with the logo hidden. _Fails when the surfaces are recognizable only by
  labels or color._
- [ ] **Complete formal handover evidence:** record all checks, screenshots,
  assets, open gates, changed/unchanged paths, and cleanup steps before asking
  for critique or publication.

## 11. Verification contract

### 11.1 Local checks

From the prototype root, run and record:

```text
node --check app.js
node --check fixtures.js
node --check server.cjs
node --check browser-validation.cjs
node --check prototype-flow.contract.test.cjs
node --test prototype-flow.contract.test.cjs
node C:\Users\FAIZ\.codex\skills\impeccable\scripts\detect.mjs --json index.html review.html styles.css app.js
```

Run the Impeccable detector exactly once after the final UI edit state. Its
result is mechanical evidence, not the design verdict. Record the skill base,
version, and detector checksum with the result. A different installed copy may
be used only when its detector checksum is confirmed identical or the change
is explicitly reviewed and recorded. If the expected tool or browser
dependency is unavailable, record the limitation and stop that check; do not
install a dependency or change global configuration without approval.

### 11.2 Browser matrix

Use a loopback-only local server. At minimum validate every primary route in
sections 7.1–7.5 at 390, 768, 1024, and 1440 pixels. Secondary error/conflict
fixtures require 390 and 1440 evidence plus focused interaction replay.

Record:

- HTTP/deep-link result and route identity;
- console errors and warnings;
- page errors, failed responses, and external requests;
- horizontal overflow and clipped primary actions;
- visible interactive targets below 44px;
- landmarks, headings, labels, descriptions, image alternatives, and live
  feedback;
- keyboard traversal, focus entry/return, error/status focus, and skip link;
- reduced-motion and static-equivalent behavior;
- Participant/Review separation and forbidden-string scan;
- missing/foreign ownership projection;
- asset natural dimensions and manifest match; and
- screenshot/result paths.

The required focused flows are:

1. Public Home → Capabilities → Projects → candidate detail → Contact;
2. Contact invalid → corrected → persistence unavailable → retry → persisted
   acknowledgement → optional WhatsApp confirmation/return;
3. Retail catalog → product → simple eligible, then reset → detailed
   `quote_required`, with no durable resource or checkout side effect;
4. customer Dashboard → normal Order → attention-required Order → missing/
   foreign projection;
5. login generic failure → recovery expired → safe return; and
6. Admin role home → CMS stale conflict recovery → inventory adjustment
   conflict → Retail Order blocker/history.

No external request, credential, or provider action may occur during these
flows.

### 11.3 Visual review and critique gate

`VISUAL_QA.md` must include:

- current-source baseline versus prototype comparison for every surface;
- 390 and 1440 contact sheets covering all six compositions;
- logo-hidden recognition review;
- typography, density, hierarchy, color-role, asset, copy, and state review;
- anti-generic/AI-slop disposition against section 8;
- customer, operator, first-time, distracted-mobile, keyboard, low-vision, and
  edge-case persona checks; and
- every unresolved issue classified P0, P1, P2, or P3.

After focused browser validation, a separately authorized independent critique
must assess Nielsen heuristics, cognitive load, emotional journey, surface
specificity, lifecycle/canonical alignment, and Participant Mode neutrality.

The critique roles are:

- **Driver:** builds and self-verifies the prototype but does not issue the
  independent gate verdict;
- **Assessment A:** reviews visual specificity, hierarchy, cognitive load,
  emotional journey, Nielsen heuristics, and customer/operator personas
  without reading prior critique output;
- **Assessment B:** verifies source, contract, browser, accessibility, network,
  and Participant/Review evidence without making the design-taste verdict; and
- **Product Owner:** accepts, rejects, or requests remediation after both
  assessments are available.

Using separate agents for Assessment A and B requires explicit owner approval
at that gate. Their file ownership must not overlap with the Driver.

The prototype may be recommended for owner review only when:

- contract and browser checks pass;
- all assets and fixture values are traceable and honestly labelled;
- no external side effect or production import is observed;
- Participant Mode contains no evaluator vocabulary;
- Public, Retail, customer, auth, and Admin are distinguishable by job rather
  than heading or color; and
- the final critique reports `0 P0` and `0 P1`.

`PASS WITH CONDITIONS` may retain documented P2/P3 findings. It does not
authorize moderated research, production implementation, provider activation,
deployment, readiness, or go-live.

### 11.4 Bounded iteration and stop rule

Prototype self-review is finite:

1. complete one integrated build against the approved fixtures;
2. run one batched desktop/mobile browser and visual review;
3. apply one coherent remediation batch for the evidence found; and
4. run one confirmation pass before requesting the independent critique gate.

If a P0 or P1 remains after the confirmation pass, mark the prototype `FAIL`,
record the evidence, and stop for Product Owner disposition. Do not begin an
open-ended polish loop or expand the route/fixture set to chase a passing
score. After an independent critique, only its evidenced P0/P1 findings block
the next owner-review gate. P2/P3 findings remain an explicit backlog unless
the Product Owner separately reclassifies them with new evidence.

A new finding may reopen only the affected surface/state. It may not silently
reopen accepted unrelated surfaces, amend canonical authority, or reset the
entire prototype. Repeated critique rounds without a new P0/P1 cause or an
explicit owner request are prohibited.

After the first independent critique, one separately authorized targeted
P0/P1 remediation batch, focused browser confirmation, and one critique rerun
form the maximum default follow-up cycle. If that rerun still reports any P0
or P1, including a newly discovered one, record `FAIL` and stop for Product
Owner disposition. Any further remediation or critique round requires a new
explicit owner authorization that names the evidence and affected state; it
is never an automatic continuation.

## 12. Traceability to accepted CSR decisions

### 12.1 Accepted CSR decisions

<!-- markdownlint-disable MD013 -->

| Accepted decision | Task-card implementation |
| --- | --- |
| `CSR-01` | Sections 1 and 8 make one identity with surface-native composition the prototype thesis and visual acceptance rule. |
| `CSR-02` | Sections 5 and 10 preserve valid source responsibilities and require bounded adaptation rather than wholesale rewrite. |
| `CSR-03` | Sections 5 and 7.1 constrain the merged Public prototype to Public/B2B evidence and one-way reuse. |
| `CSR-04` | Section 7.1 adds Capabilities as candidate Public extension while preserving typography, route, and production gates. |
| `CSR-05` | Sections 7.2–7.5 and 8 define distinct Retail, customer, authentication, and Admin/CMS composition models. |
| `CSR-06` | Sections 5 and 8 reuse current semantic tokens and adopted component contracts without a parallel UI kit or dependency. |
| `CSR-07` | Section 7 converts the five representative slices into 28 exact deterministic fixture contracts. |
| `CSR-08` | Sections 1, 11, and 13 preserve packet → task card → isolated prototype → critique → production-task-card gates. |

<!-- markdownlint-enable MD013 -->

### 12.2 Accepted workflow refinements

<!-- markdownlint-disable MD013 -->

| Owner-approved refinement | Task-card disposition |
| --- | --- |
| Canonical Niuva → Impeccable → supporting references | Section 2.3 defines the hierarchy, version/checksum evidence, and the limit of every skill |
| Design read and real-use context per surface | Section 8.1 defines the mode, physical-use scene, prototype-local dials, and first-viewport focal moment for all six compositions |
| First-order, second-order, and logo-hidden anti-template review | Section 8.2 defines all three gates and the unrelated-product transfer test; section 11.3 requires the evidence |
| Complete applicable UI states | Section 9.1 defines state floors for actions, forms, collections, records, async simulations, and handoffs |
| Measurable contrast, mobile type, line length, and target size | Section 9.2 defines the measurable floors; sections 10 and 11 require responsive/accessibility evidence |
| Bounded motion, assets, and iteration | Section 9.3 constrains motion/dependencies/media; section 11.4 defines finite self-review and critique follow-up cycles |
| Disposition of conflicting generic skill defaults | Section 2.3 preserves Poppins/Inter, Niuva blue, approved local assets, and the no-new-system/provider/dependency boundary |

<!-- markdownlint-enable MD013 -->

## 13. Handover and later authorization gates

The build handover must state:

- exact build SHA, branch, worktree, and file list;
- changed and intentionally unchanged paths;
- one-way reused assets/code and their provenance;
- the Impeccable skill base/version/detector checksum and the supporting-skill
  disposition actually used;
- checks passed, failed, or not run;
- browser/evidence locations;
- unresolved findings and rollback/cleanup needs;
- decisions that remain open; and
- every external action still requiring authorization.

The next gates remain separate and ordered:

1. owner approval to construct the isolated prototype;
2. focused browser validation;
3. independent formal critique;
4. owner disposition of residual findings;
5. separate commit/push/PR/merge decision for the prototype artifact;
6. separate surface-specific production task cards; and
7. source, API/schema, migration, provider, deployment, readiness, and go-live
   approvals as applicable.

No production task card should cover all surfaces in one branch. After the
prototype gate, Public, Retail, customer/authentication, and Admin/CMS work
must receive separate file ownership and can then be assigned to different
developers without merging their lifecycle responsibilities.
