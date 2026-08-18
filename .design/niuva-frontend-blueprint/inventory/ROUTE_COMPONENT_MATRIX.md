# DS-01B Route and Responsibility Matrix

**Status:** Candidate — Context Only — Phase 6 `DS-01B` completed for owner
review; not canonical, not route activation, and not source authority

**Date:** 18 August 2026

**Repository baseline:** `origin/main`
`8555685c29a3fde9976ae6499336e2eb45a330ba`

**Scope:** Exact-SHA inventory of current route declarations, generated
compatibility aliases, environment-gated prototypes, the catch-all, and
authority-defined paths that are reserved, inactive, absent, or still
candidate. Each entry is mapped to its audience, job, lifecycle owner,
surface composition, shared mechanics, visible state/recovery responsibility,
and material exception.

**Owner authorization:** The owner separately authorized Phase 6 only for
`DS-01B` after approving the `DS-01A` component and consumer ledger. This
record does not start `DS-02`, redesign a page, activate a route, or authorize
application source, stage, commit, push, PR, merge, deployment, readiness, or
go-live work.

## 1. Authority and evidence boundary

Read this matrix after:

1. [`NIUVA_MASTER_SPEC.md`](../../../docs/NIUVA_MASTER_SPEC.md);
2. [`DOCUMENT_REGISTER.md`](../../../docs/context/DOCUMENT_REGISTER.md);
3. [`DECISION_REGISTER.md`](../../../docs/decisions/DECISION_REGISTER.md);
4. [`DEC-UX-003`](../../../docs/decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md)
   for route, locale, compatibility, Retail, Account, and Operations route
   ownership;
5. [`DEC-UX-004`](../../../docs/decisions/experience/DEC-UX-004-cross-surface-design-system-reconstruction.md)
   for shared mechanics and surface-native composition;
6. the applicable product, access, and operations decisions;
7. current source and tests as exact-SHA implementation evidence;
8. [`INFORMATION_ARCHITECTURE.md`](../INFORMATION_ARCHITECTURE.md) and
   [`DESIGN_BRIEF.md`](../DESIGN_BRIEF.md); and
9. this inventory.

The source proves what is currently declared and rendered. It does not by
itself authorize a provider, capability, permission, lifecycle transition,
production claim, or canonical route. Backend handlers and scoped queries
remain the authorization boundary; route visibility and frontend guards are
defence-in-depth only.

## 2. Classification and count reconciliation

The selected `App.js` baseline contains `58` current non-wildcard route
patterns, plus one wildcard. Eight additional compatibility routes are
generated from the centralized alias registry.

<!-- markdownlint-disable MD013 -->

| Current class | Count | Reconciliation |
| --- | ---: | --- |
| Public canonical ID/EN paths | 16 | Eight responsibilities with two explicit locale paths each. |
| Retained unprefixed Retail product path | 1 | Current product-evaluation route; transaction routes remain inactive. |
| Account and compatibility paths | 3 | Protected dashboard, inactive legacy create-order destination, and owned legacy-order detail. |
| Authentication, invitation, and recovery paths | 8 | Separate customer, staff, invitation, request, token, success, and failure responsibilities. |
| Operations/Admin paths | 28 | Every path is wrapped by the Admin guard and mapped to an explicit permission key. |
| Environment-gated prototype paths | 2 | Present only when `REACT_APP_ENABLE_BRAND_LAB=true`. |
| **Current non-wildcard path patterns** | **58** | Reconciles exactly to the current `App.js`. |
| Generated Public compatibility aliases | 8 | Materialized through `PUBLIC_ROUTE_ALIASES`; not independent content owners. |
| Wildcard | 1 | Locale-aware Not Found recovery. |
| **Current effective path patterns including aliases and wildcard** | **67** | `58 + 8 + 1`; this is not a readiness or route-quality score. |
| Authority/inventory-only exact path patterns | 17 | Ten canonical target paths absent from source, two reserved project-detail paths, and five candidate exact paths. They are not active. |

<!-- markdownlint-enable MD013 -->

`frontend/src/App.js` uses a centralized alias loop, so raw `<Route>` element
counts and literal path counts are not equivalent. This matrix counts route
patterns, not JSX nodes.

### 2.1 Status vocabulary

<!-- markdownlint-disable MD013 -->

| Status | Meaning in this matrix |
| --- | --- |
| Current canonical pair | Approved Public responsibility and present ID/EN paths. Translation readiness is recorded separately. |
| Current | Present in source at the selected SHA. This is implementation evidence only. |
| Current compatibility | Present for safe continuity, but not the preferred owner of new work. |
| Prototype | Environment-gated exploration, absent from ordinary navigation and not adoption evidence. |
| Wildcard | Current fallback for otherwise unmatched paths. |
| Canonical target — absent/inactive | Approved route ownership, but no current source declaration or capability activation. |
| Reserved | Prefix or path held against accidental ownership; no active page or link may be inferred. |
| Candidate exact path | Useful planning direction whose exact URL was not canonically selected. |
| Contract-only | Required behavior or lifecycle boundary without an assigned active URL. |

<!-- markdownlint-enable MD013 -->

## 3. Cross-cutting route mechanics

<!-- markdownlint-disable MD013 -->

| Mechanic | Current implementation relationship | Responsibility and limit |
| --- | --- | --- |
| Route bootstrap | `App.RouteFallback` inside `Suspense` | Visible localized loading status while a lazy page module resolves. It does not describe a page's data dependency. |
| Render failure | `AppErrorBoundary` | Visible localized render-error recovery with reload and Homepage actions. It does not guess that a network or provider failed. |
| Public locale sync | `LocaleRouteSync` plus `publicRoutes.js` | Synchronizes interface language only for registered Public routes. It must not invent prefixed private paths. |
| Public alias continuity | `PublicAliasRedirect` plus `PUBLIC_ROUTE_ALIASES` | Replaces the client location and preserves query/hash. It does not prove the separately required one-hop HTTP `308`. |
| Public metadata and shell | `MarketingLayout`, `Navbar`, `PublicNavigation`, `Footer` | Owns skip link, public navigation, metadata/canonical/`hreflang`, translation fallback notice, hash/scroll recovery, and Public footer. |
| Public expression | `BrandSystem`, `CompanyProfileBlocks`, page-owned compositions | Public-only composition. Its use by current Retail pages is compatibility debt, not proof of a universal page template. |
| Commerce product evidence | `RetailProductVisual` plus Retail page components | Owns media and public product-evaluation presentation only. It grants no upload, checkout, price, stock, reservation, or payment authority. |
| Account shell | `OperationalLayout`, `OperationalNavigation` | Private/noindex workspace shell for current customer-owned records. Visibility does not prove ownership. |
| Auth shell | `AuthShell`, form primitives, `AuthContext` | Reuses interaction and accessibility mechanics while retaining distinct customer, staff, invitation, and recovery destinations. |
| Account/Admin guard | `ProtectedRoute` | Shows auth bootstrap, preserves a bounded return location, redirects unauthenticated users to the correct login, and shows permission-safe denial. Backend authorization remains mandatory. |
| Operations shell | `AdminLayout`, role-filtered `adminWorkbench`, domain status adapters | Noindex workbench with role home, queue/detail context, notifications, locale, and sign-out. Sidebar visibility is not authorization. |
| Shared state presentation | `OperationalState`, `EmptyState`, `ErrorState`, `Alert`, `Skeleton`, `Button`, Sonner reinforcement | Shared perception and interaction mechanics only. Each route/domain owns the truthful cause, permissible retry, persistence result, conflict, and next action. |

<!-- markdownlint-enable MD013 -->

## 4. Current route and responsibility matrix

Observed state sets below describe current source evidence, not proof that the
complete state contract is implemented. Every route also inherits route-chunk
loading and render-error recovery from Section 3.

### 4.1 Public and Public-to-Commerce routes — 16 paths

<!-- markdownlint-disable MD013 -->

| Paths | Page / current composition | Audience, job, and lifecycle owner | Entry, exit, locale, and observed state/recovery | Material exception |
| --- | --- | --- | --- | --- |
| `/`, `/en` | `HomePage` → `MarketingLayout`; Homepage-local sections plus Public navigation/footer | Visitor or prospect chooses B2B-primary or Retail-secondary journey; Public content/settings owner | Global entry; exits to Services, Projects, Contact, or Retail. ID/EN content is marked ready. Public settings expose loading, recoverable error, and ready states. | Homepage persuasion cannot imply quotation, production capacity, Retail Order, payment, or provider success. |
| `/tentang`, `/en/about` | `AboutPage` → `MarketingLayout`; `BrandSystem`, `CompanyProfileBlocks`, `ErrorState` | Visitor verifies company identity and approach; Public content owner | Public navigation/deep link; exits to owned Public destinations. English is not translation-ready and must use the visible fallback/noindex contract. Current/invalid/dependency-error recovery is visible. | No invented credentials, claims, or automatic English content. |
| `/layanan`, `/en/services` | `CapabilitiesPage` → `MarketingLayout`; Public section/state primitives | Visitor compares four globally equal Services; Public content owner | Public navigation or Homepage; exits to Contact or relevant owned destination. English fallback applies. Loading, error, invalid, empty, and ready states are present. | No primary/supporting hierarchy and no `Capabilities` route ownership restoration. |
| `/proyek`, `/en/projects` | `ProjectsPage` → `MarketingLayout`; project evidence composition, Skeleton/Empty/Error state | Visitor evaluates attributable project evidence; Public evidence/content owner | Public navigation or Homepage; exits to Contact/archive recovery. English fallback applies. Loading, error, invalid, empty, and ready states are present. | Reserved detail prefixes are not active; no unverified client, status, metric, output, or capability claim. |
| `/kontak`, `/en/contact` | `ContactPage` → `MarketingLayout`; complete Contact form composition and visible state regions | Visitor creates a Public B2B Inquiry; Inquiry owns durable persistence after submit | Public navigation, CTA, or contextual handoff; success remains on the page with the existing Inquiry UUID, then offers optional user-clicked WhatsApp. ID/EN ready. Validation preserves values; submitting, dependency failure, and persisted success are distinct. | No public raw-file upload, automatic WhatsApp, false success, Quote/Project creation, price, ETA, or delivery promise. |
| `/privasi`, `/en/privacy` | `PrivacyPolicyPage` → `MarketingLayout`; Public policy content composition | Visitor reviews data-use policy; Public policy/content owner | Linked from form/footer and public navigation context; returns to the originating owned task. ID/EN marked ready; invalid/dependency content cannot silently become current policy. | Policy display is not consent, marketing permission, or legal-readiness evidence. |
| `/faq`, `/en/faq` | `FaqPage` → `MarketingLayout`; FAQ content and state patterns | Visitor resolves common Public or Retail questions; Public support-content owner | Public navigation or contextual help; exits to the relevant owned destination. English fallback applies. Loading, error, invalid, empty, and ready states are present. | FAQ does not replace policy, account support, lifecycle status, or provider truth. |
| `/retail`, `/en/retail` | `RetailCatalogPage` → current `MarketingLayout`; `BrandSystem`, `RetailProductVisual`, catalog controls/state primitives | Visitor discovers categories/products and evaluates public availability; Public-to-Commerce boundary and Retail catalog owner | Public navigation/Homepage; exits to unprefixed product detail or safe Public route. English fallback applies. Unavailable, loading, dependency error, empty, filter/no-match, pagination/loading-more/error, and ready states are present. | Current Public composition is compatibility debt. No guest checkout, reservation, private upload, authoritative price, or provider promise. |

<!-- markdownlint-enable MD013 -->

### 4.2 Current Commerce route — 1 path

<!-- markdownlint-disable MD013 -->

| Path | Page / current composition | Audience, job, and lifecycle owner | Entry, exit, locale, and observed state/recovery | Material exception |
| --- | --- | --- | --- | --- |
| `/retail/products/:slug` | `RetailProductPage` → current `MarketingLayout`; `RetailProductVisual`, shared action/state primitives | Visitor evaluates one published Retail product/variant and its next eligible action; Retail catalog/product owner | Enter from catalog or safe deep link; return to `/retail` or continue only to an already authorized action. Route remains unprefixed and uses stored interface language. Unavailable, loading, dependency error, not found, ready, fixed/calculated/`quote_required` presentation states are observed. | `quote_required` is not an Order or customer type. The page does not activate configuration, private upload, checkout, payment, reservation, or production tracking. |

<!-- markdownlint-enable MD013 -->

### 4.3 Current Account and compatibility routes — 3 paths

<!-- markdownlint-disable MD013 -->

| Path | Page / guard / composition | Audience, job, and lifecycle owner | Entry, safe return, locale, and observed state/recovery | Material exception |
| --- | --- | --- | --- | --- |
| `/dashboard` | `ProtectedRoute` → `ClientDashboard` → `OperationalLayout`; `OperationalState`, legacy status adapter | Authenticated customer reviews owned legacy-order history; customer/session and owned-record owner | Login preserves this destination; exits to owned `/orders/:id`, Retail, or sign-out. Unprefixed route uses stored language. Auth bootstrap, loading, dependency error/retry, empty, and ready states are present. | Customer-safe projection excludes internal cost, margin, supplier, profit, and notes. This is not a Retail transaction dashboard readiness claim. |
| `/order` | `ProtectedRoute` → `NewOrder` → `OperationalLayout`; `SurfacePanel`, Button | Authenticated customer reaches the retired create-order entry; compatibility owner | Safe return from login is supported. The page explains unavailability and routes to `/retail` or `/dashboard`. | Must not be reactivated as create-order, checkout, upload, or transaction authority. A redirect requires separate approval. |
| `/orders/:id` | `ProtectedRoute` → `OrderDetail` → `OperationalLayout`; `OperationalState`, `StatusStepper`, legacy status adapter | Authenticated owner inspects one customer-safe legacy Order projection; owned Order owner | Enter from dashboard or validated local return; exit to dashboard/Retail. Loading, dependency error/retry, ready, allowed download, and download-failure feedback are observed. | Ownership remains server-enforced. Legacy milestones are not production telemetry, ETA, or a universal Retail/B2B lifecycle. |

<!-- markdownlint-enable MD013 -->

### 4.4 Current authentication, invitation, and recovery routes — 8 paths

<!-- markdownlint-disable MD013 -->

| Path | Page / current composition | Audience, job, and owner | Entry, safe return, and observed state/recovery | Material exception |
| --- | --- | --- | --- | --- |
| `/login` | `CustomerLogin` → `AuthShell` (`customer`) | Customer authenticates; customer/session owner | Accepts only safe local Account destinations (`/dashboard`, `/order`, `/orders/*`), otherwise `/dashboard`. Auth bootstrap, validation, submitting, dependency error, and redirect states are present. | No registration or external identity-provider activation. |
| `/admin/login` | `AdminLogin` → `AuthShell` (`staff`) | Staff authenticates; staff/session owner | Accepts a safe `/admin*` return other than itself, otherwise role-aware `/admin`. Loading, validation, submitting, dependency error, and redirect states are present. | Staff and customer audience/return semantics must remain distinct. |
| `/staff-invitation` | `StaffInvitationAccept` → `AuthShell` (`staff`) | Invited staff validates and accepts one bounded invitation; invitation/identity owner | Enter through controlled invitation context; exit to staff login/workspace or bounded expiry recovery. Policy loading/failure, missing/invalid token, busy, success, and return states are observed. | Invitation does not grant a role beyond backend authority and is not public registration. |
| `/forgot-password` | `ForgotPassword` → `AuthShell` (`recovery`) | Customer or staff requests recovery without account enumeration; recovery owner | Enter from the applicable login; successful request continues to `/forgot-password/check-email`. Ready, submitting, non-enumerating acknowledgement, dependency error, and retry are present. | Must not disclose whether an account exists. |
| `/forgot-password/check-email` | `ForgotPassword` → `AuthShell` (`recovery`) | Recovery requester reviews the next safe step; recovery owner | Enter only after request/context; returns to the applicable login or bounded resend/cooldown path. Acknowledgement, cooldown, request error, and retry behavior share the component. | This state does not prove email delivery. |
| `/reset-password` | `ResetPassword` → `AuthShell` (`recovery`) | Valid token holder sets a policy-compliant password; recovery owner | Enter with transient token context; success exits to `/reset-password/success`; invalid/expired authority exits to `/reset-password/error`. Token validation/loading, validation, submitting, dependency error, and retry are present. | Query token is transient sensitive input, not durable navigation or analytics state. |
| `/reset-password/success` | `ResetPasswordState` → `AuthShell` (`recovery`) | Recovery user confirms a completed password reset; recovery owner | Enter only after authoritative success; continue to the correct login destination. | Must not render before persistence succeeds. |
| `/reset-password/error` | `ResetPasswordState` → `AuthShell` (`recovery`) | Recovery user understands invalid/expired authority and restarts safely; recovery owner | Enter from token validation failure; restart at `/forgot-password` or return to the applicable login. | Generic failure must not disclose protected identity detail. |

<!-- markdownlint-enable MD013 -->

### 4.5 Current Operations/Admin routes — 28 paths

Every route below uses `protectedPage`, `ProtectedRoute`, and `AdminLayout`.
The common route states are auth bootstrap, unauthenticated redirect to
`/admin/login` with bounded return context, permission-safe `403`, and allowed
render. Page states are additive. Parent permission keys intentionally guard
some detail routes.

<!-- markdownlint-disable MD013 -->

| Path | Page and permission | Job / lifecycle owner | Page state, exit/recovery, and exception |
| --- | --- | --- | --- |
| `/admin` | `AdminDashboard`; `dashboard.read` | Role-aware work home and factual queue orientation; Operations owner | Dashboard loading/partial error/empty/ready; enter after staff login, exit to a permitted queue. Factual metrics only. |
| `/admin/orders` | `Orders`; `orders.read` | Read-only legacy order archive; legacy Order owner | Loading/error/retry/empty/ready and safe download feedback; return to work home. Not the active Retail Order queue. |
| `/admin/catalog` | `Catalog`; `catalog.read` | Product/category collection and publication-oriented entry; catalog owner | Loading/error/retry/empty/filter/ready; enter from Products group, exit to editor or queue context. Route visibility grants no write authority. |
| `/admin/catalog/:productId` | `ProductEditor`; parent `catalog.read` guard plus command permissions | New/edit product aggregate; catalog owner | New or loading/error/retry/validation/submitting/dependency feedback; return to catalog. `productId=new` is current multiplexing, not a final URL decision. |
| `/admin/materials` | `Materials`; `materials.read` | Material definitions and governed stock-related context; material owner | Loading/error/retry/empty/ready plus permission-disabled writes and mutation feedback; return to Products group. |
| `/admin/inventory` | `Inventory`; `inventory.read` | Inventory balance, allocation, and governed mutation context; inventory owner | Loading/error/retry/empty/ready plus mutation conflict/error feedback; return to inventory context. No silent non-atomic fallback. |
| `/admin/stock-movements` | `StockMovements`; `inventory.read` | Auditable stock movement history; inventory owner | Loading/error/retry/empty/filter/ready; return to inventory. History is not editable telemetry. |
| `/admin/restock-alerts` | `RestockAlerts`; `restock_alerts.read` | Restock exception utility; restock/inventory owner | Loading/error/retry/empty/ready and authorized action feedback; contextual entry/return, not a primary sidebar destination. |
| `/admin/portfolio` | `PortfolioAdmin`; `content.read` | Portfolio evidence queue and publication lifecycle; content owner | Loading/error/empty/ready plus guarded create/action feedback; exit to detail or Publishing group. Evidence provenance remains mandatory. |
| `/admin/portfolio/:id` | `PortfolioDetail`; parent `content.read` guard plus action permissions | One portfolio record, revisions, schedule, publish/archive/rollback; content owner | Loading/error/retry/ready, lifecycle status, validation, busy action, and conflict feedback; return to portfolio queue. Publish authority is separate. |
| `/admin/content` | `ContentEditor`; `content.read` | Public-content list/editor multiplexing; content owner | Loading/error/retry/empty/validation/edit/save feedback; return to Publishing group. Current multiplexing is recorded, not endorsed as final IA. |
| `/admin/contacts` | `Contacts`; `inquiries.read` | Legacy contact archive/compatibility view; Inquiry compatibility owner | Loading/error/retry/empty/ready; return to Sales group. Not the preferred new Inquiry queue. |
| `/admin/inquiries` | `B2BList.InquiryList`; `inquiries.read` | Inquiry triage queue; Inquiry owner | Loading/error/retry/empty/no-match/ready and lifecycle status; exit to owned detail or queue return. |
| `/admin/inquiries/:id` | `B2BDetail.InquiryDetail`; parent `inquiries.read` plus action permissions | One Inquiry review/contact/convert/reject context; Inquiry owner | Loading/error/retry/not-found-safe/ready, guarded actions, dependency/conflict feedback; return to Inquiry queue. Conversion does not merge Inquiry and Quote records. |
| `/admin/b2b/quotes` | `B2BList.QuoteList`; `quotes.read` | B2B Quote queue; Quote owner | Loading/error/retry/empty/no-match/ready and lifecycle status; exit to detail. |
| `/admin/b2b/quotes/:id` | `B2BDetail.QuoteDetail`; parent `quotes.read` plus action permissions | One versioned B2B Quote and governed transitions; Quote owner | Loading/error/retry/not-found-safe/ready, action feedback, conflict-safe recovery; return to Quote queue. |
| `/admin/b2b/quotes/:id/revision` | `QuoteRevisionEditor`; `quotes.write` through revision permission key | Create one bounded Quote revision; Quote owner | Loading/error/retry/validation/edit/submitting/conflict/ready; cancel or succeed back to owned Quote context. No silent overwrite. |
| `/admin/b2b/projects` | `B2BList.ProjectList`; `projects.read` | B2B Project queue; Project owner | Loading/error/retry/empty/no-match/ready and lifecycle status; exit to detail. |
| `/admin/b2b/projects/:id` | `B2BDetail.ProjectDetail`; parent `projects.read` plus action permissions | One B2B Project, continuity, and governed actions; Project owner | Loading/error/retry/not-found-safe/ready, action/conflict feedback; return to Project queue. Project and Work Order remain separate resources. |
| `/admin/b2b/work-orders` | `B2BList.WorkOrderList`; `production.read` | Production Work Order queue; Work Order owner | Loading/error/retry/empty/no-match/ready and lifecycle status; exit to detail. Visibility does not imply production write/QC authority. |
| `/admin/b2b/work-orders/:id` | `WorkOrderDetail`; parent `production.read` plus production/QC/inventory action permissions | One Work Order execution and QC context; Work Order owner | Loading/error/retry/not-found-safe/ready, guarded transitions, version/conflict feedback; return to Work Order queue. No invented machine telemetry. |
| `/admin/retail-orders` | `B2BList.RetailOrderList`; `orders.read` | Active target Retail Order work queue; Retail Order owner | Loading/error/retry/empty/no-match/ready and Retail lifecycle status; exit to detail. This route does not activate customer checkout/payment/provider capability. |
| `/admin/retail-orders/:id` | `RetailOrderDetail`; parent `orders.read` plus action permissions | One Retail Order operational projection; Retail Order owner | Loading/error/retry/not-found-safe/ready, factual state and guarded action feedback; return to Retail Order queue. Separate from B2B Quote/Project and legacy Order. |
| `/admin/users` | `Users`; `users.read` | Staff identity and role/permission governance; identity owner | Loading/error/retry/empty/filter/validation/action feedback; return to Governance group. Frontend controls do not grant roles. |
| `/admin/customers` | `Customers`; `customers.read` | Customer account projection and governed support context; customer/identity owner | Loading/error/retry/empty/filter/validation/action feedback; return to Governance group. Internal data must not leak to customer views. |
| `/admin/notifications` | `NotificationFeed`; `admin.access` | Recipient-scoped Operations notification utility; notification owner | Loading/error/retry/empty/no-match/ready, mark-read feedback; enter from bell and return to the allowlisted owned resource. Payloads never grant access. |
| `/admin/communication` | `Notifications`; `notifications.write` | Governed communication authoring/history; notification owner | Loading/history error/retry/empty/validation/sending/result feedback; return to Governance group. Provider delivery is not inferred from UI send state. |
| `/admin/settings` | `Settings`; `settings.write` | Approved operational/public settings management; settings owner | Loading/error/retry/validation/save/conflict-safe feedback; return to Governance group. No secret or provider activation through presentation alone. |

<!-- markdownlint-enable MD013 -->

### 4.6 Prototype and catch-all routes

<!-- markdownlint-disable MD013 -->

| Path | Page / classification | Audience, job, state, and recovery | Material exception |
| --- | --- | --- | --- |
| `/__brand-lab/editorial` | `EditorialHomepagePrototype`; environment-gated prototype | Internal design review only when `REACT_APP_ENABLE_BRAND_LAB=true`; when disabled, the wildcard owns recovery. | No navigation, production evidence, adoption, migration, or deletion is implied. |
| `/__brand-lab/experimental` | `ExperimentalHomepagePrototype`; environment-gated prototype | Internal design review only when `REACT_APP_ENABLE_BRAND_LAB=true`; when disabled, the wildcard owns recovery. | Same boundary as the editorial prototype. |
| `*` | `NotFoundPage` → `MarketingLayout`; current wildcard | Any unmatched visitor sees the missing path and locale-aware recovery to Home, Services, Projects, and Contact. | Not Found does not create route ownership, aliases, or automatic migration. |

<!-- markdownlint-enable MD013 -->

## 5. Current compatibility alias matrix — 8 generated paths

These paths are inbound compatibility only. They are generated from
`PUBLIC_ROUTE_ALIASES`, preserve safe query/hash context in client navigation,
and have no independent page, content, sitemap, analytics, or lifecycle
ownership.

<!-- markdownlint-disable MD013 -->

| Alias | Current destination | Responsibility / recovery exception |
| --- | --- | --- |
| `/about` | `/tentang` | Replace the client location; destination owns content and locale. |
| `/capabilities` | `/layanan` | Do not restore `Capabilities` as current information architecture. |
| `/services` | `/layanan` | Indonesian canonical destination owns the responsibility. |
| `/projects` | `/proyek` | Project archive destination owns evidence and recovery. |
| `/portfolio` | `/proyek` | Do not create a second Public evidence owner. |
| `/contact` | `/kontak` | Contact destination owns persistence and Inquiry semantics. |
| `/privacy` | `/privasi` | Privacy destination owns policy content. |
| `/en/capabilities` | `/en/services` | English Services destination owns locale behavior; fallback rules still apply. |

<!-- markdownlint-enable MD013 -->

A one-hop permanent HTTP `308` remains a separate delivery-boundary contract.
The current React redirect is not evidence that the HTTP behavior exists.

## 6. Authority and inventory-only route matrix — 17 paths

None of the following paths is declared in current `App.js`. Listing them
preserves ownership and prevents accidental collision; it does not activate a
page, API, provider, upload, payment, registration, notification, case, or
project-detail capability.

### 6.1 Canonical target paths absent or inactive — 10 paths

<!-- markdownlint-disable MD013 -->

| Path | Audience / responsibility / lifecycle owner | Required state and recovery contract before activation | Inactive boundary |
| --- | --- | --- | --- |
| `/register` | Anonymous prospective Retail customer creates the account required before private upload or authoritative checkout; identity owner | Validation, duplicate-safe error, verification pending, abuse control, expiry/retry, recovery, and safe return | Canonical but inactive until the separate registration, verification, abuse, recovery, and security contract is approved. |
| `/dashboard/notifications` | Authenticated customer views recipient-scoped notifications; customer notification owner | Loading, empty, delivery exhausted, forbidden/not found, mark-read, and allowlisted owned-resource return | No current route; notification payload never grants ownership or access. |
| `/retail/products/:slug/configure` | Visitor creates a non-sensitive draft; authenticated owner handles private file/configuration; Retail configuration owner | Default/Simple/Detailed, auth interruption, no file, validating, invalid/unsafe/too large/analysis failure, eligible, `quote_required`, stale and recovery | No upload, storage, analysis, price, stock, ETA, or transaction activation is implied. |
| `/retail/requests/:requestId` | Authenticated owner sees retained `quote_required` context; Retail Request owner | Loading, forbidden/not found-safe, reviewing, routed, terminal, stale, recovery, stable reference and next action | Creates no Order, reservation, payment attempt, paid state, or checkout total. |
| `/retail/offers/:offerId` | Authenticated owner sees one immutable Assisted Retail Offer version; Offer owner | Loading, forbidden/not found-safe, offered, accepted, declined, expired, superseded, stale and revalidation | Acceptance only permits normal checkout entry after revalidation; it does not create an Order. |
| `/retail/checkout` | Authenticated Retail owner reviews server-authoritative commitment and begins provider-neutral payment; Retail Order/payment-attempt boundary | Bootstrap, revalidation, stock/price/ETA/fulfilment deltas, reconfirmation, submitting, pending, failed, expired, uncertain/reconciliation, success to `/orders/:id` | Checkout, provider, reservation, transaction, fulfilment, and payment capability remain separately gated. |
| `/admin/retail-requests` | Authorized Operations user triages Retail Requests and Assisted Offer work; Retail Request owner | Guard/permission, loading, empty/no-match, error/retry, age/stale, filter and queue return | Separate from B2B Quotes and current Retail Order queue; exact permission/navigation/API work is absent. |
| `/admin/retail-requests/:id` | Authorized operator reviews file/analysis, routing, immutable Offer versions, and approval; Retail Request/Offer owners remain separate | Guard/permission, loading, not-found-safe, error/retry, validation, version conflict, approval, offered/terminal and queue return | One-operator detail ownership does not merge Request, Offer, Order, or B2B resources. |
| `/admin/retail-cases` | Authorized Operations user triages cancellation, complaint, reprint/replacement, refund, and return cases; after-sales case owner | Guard/permission, loading, empty/no-match, error/retry, evidence requested, review, approval, executing, terminal and queue return | Legal, privacy, evidence, Finance/provider, permission, API, and activation gates remain open. |
| `/admin/retail-cases/:caseId` | Authorized operator resolves one governed after-sales case; after-sales case owner | Guard/permission, loading, forbidden/not-found-safe, evidence, conflict, approved remedy, executing, resolved/rejected and queue return | Must not invent refund/reprint/return completion or expose protected evidence. |

<!-- markdownlint-enable MD013 -->

### 6.2 Reserved project-detail paths — 2 paths

<!-- markdownlint-disable MD013 -->

| Path | Responsibility held | Rule |
| --- | --- | --- |
| `/proyek/:slug` | Possible Indonesian project-detail ownership | Reserved only. No active link, sitemap entry, canonical tag, analytics identity, CMS URL, or page component until a separate activation decision. |
| `/en/projects/:slug` | Possible English counterpart using the same project identity | Same boundary; complete translation and reciprocal locale ownership are prerequisites. |

<!-- markdownlint-enable MD013 -->

### 6.3 Candidate exact paths — 5 paths

<!-- markdownlint-disable MD013 -->

| Path | Candidate responsibility | Decision still required |
| --- | --- | --- |
| `/retail/cart` | Labelled non-authoritative draft and mixed-cart separation | Exact durable cart URL/state ownership was not a separate canonical route selection. It cannot reserve stock or claim authoritative price. |
| `/orders/:id/file-revision` | Authenticated owner submits an eligible replacement file in a governed window | Exact route/API, private storage, file/evidence policy, validation states, expiry, and rollback. |
| `/orders/:id/cancellation` | Authenticated owner requests or reviews cancellation | Exact route/API, eligibility, legal policy, refund/provider mapping, and case ownership. |
| `/orders/:id/complaints/new` | Authenticated owner starts a scoped complaint and references allowed evidence | Exact route/API, privacy/retention, evidence request, validation, acknowledgement, and case creation. |
| `/orders/:id/complaints/:caseId` | Authenticated owner follows one complaint/remedy case | Exact route/API, ownership projection, evidence request, resolution, refund/reprint/return mapping, and terminal recovery. |

<!-- markdownlint-enable MD013 -->

### 6.4 Contract-only flows without an assigned exact path

- Private artwork upload belongs inside an authenticated, separately approved
  Retail configuration/task boundary; this matrix assigns no additional URL.
- A non-sensitive pre-auth configuration draft may exist without making
  price, stock, ETA, file, or eligibility authoritative.
- The first B2B organization portal slice has no approved exact path here.
- Provider actions, payment reconciliation, and fulfilment callbacks return
  to an owned authoritative resource; this matrix invents no provider URL.

## 7. Entry, exit, locale, and safe-return invariants

<!-- markdownlint-disable MD013 -->

| Transition | Context allowed to continue | Required recovery / prohibited carry-over |
| --- | --- | --- |
| Public → Contact | Locale, selected need, and safe source context | Persistence must produce the existing Inquiry UUID before success or optional WhatsApp. No Quote/Project/payment state. |
| Public → Retail | Stored locale and safe Public source context | No account, reservation, authoritative price, stock, file, or checkout state is fabricated. |
| Retail → Login → owned Retail task | Validated local return plus permitted non-sensitive draft | Revalidate publication, configuration, price, stock/material, file, ETA, fulfilment, and eligibility after auth. Current source only allowlists existing Account paths. |
| Retail `quote_required` → Request/Offer/B2B | Product/variant/configuration/quantity/file version/safe analysis/contact/fulfilment/reason context when approved | Preserve separate Request, Offer, Order, Inquiry, Quote, and Project resources. Never create a commitment by navigation. |
| Account → owned detail | Session plus owned resource reference | Server rechecks ownership; missing/forbidden remains customer-safe and reveals no protected detail. |
| Staff login → Operations | Validated local `/admin*` destination or role home | Guard and backend permission checks still run; `/admin/login` cannot return to itself. |
| Operations queue → detail/editor → queue | Domain reference, filters/return context, and permitted draft where safe | Conflict/stale outcomes preserve allowed work and reconcile authority before retry. No silent last-write-wins. |
| Notification → route | Allowlisted route plus opaque owned reference | Destination repeats authorization/ownership checks; payload does not confer access. |
| Unknown/disabled prototype → Not Found | Requested path and inferred ID/EN recovery language | Offer owned Public destinations only; do not manufacture an alias or activate the requested path. |

<!-- markdownlint-enable MD013 -->

Public canonical pairs use exact counterpart switching. Unprefixed Commerce,
Account, Login, and Operations paths preserve their current URL and owned
context while updating the stored language preference; they do not gain an
invented `/en` counterpart.

## 8. State and responsibility ownership

Shared components may present a state, but the route/domain owns its meaning:

<!-- markdownlint-disable MD013 -->

| State family | Shared mechanic may own | Route/domain must own |
| --- | --- | --- |
| Bootstrap/loading | Stable skeleton/status, `aria-busy`, duplicate-action prevention | Which session, route chunk, content, or record dependency is pending |
| Empty/no-match | Perceivable region and reset/next-action affordance | Why nothing exists, filter truth, and the authorized next action |
| Validation | Field relation, visible summary, focus movement, retained safe values | Field rules, consent, password policy, commercial constraints, and resubmit authority |
| Dependency/system error | Visible error region and bounded retry affordance | Whether anything persisted, safe fallback, provider/dependency cause when known, and retry idempotency |
| Permission/not found | Non-leaking unavailable presentation and safe return | Role, ownership, resource visibility, escalation, and audit-safe logging |
| Conflict/stale/expired | Compare/reload/reconfirm mechanics and focus recovery | Authoritative version, expiry, price/file/offer/session revalidation, and permissible mutation |
| Offline/uncertain | Visible uncertainty and disabled duplicate action | Authoritative reconciliation before irreversible retry |
| Success | Persistent confirmation region, reference slot, next-action affordance | Existing Inquiry UUID, Order/payment/publication result, lifecycle ownership, and what remains incomplete |

<!-- markdownlint-enable MD013 -->

Critical error, conflict, uncertainty, permission, or success feedback cannot
exist only in a toast or ARIA live region.

## 9. Exact-SHA findings and follow-up boundaries

1. **Current route total supersedes older snapshots.** Historical candidate
   packets that counted `53` `App.js` routes predate the localized/current
   baseline. At `8555685c`, the reconciled count is `58` non-wildcard current
   paths, eight generated aliases, and one wildcard.
2. **Retail composition is not yet surface-native.** Current catalog and
   product pages reuse `MarketingLayout` and Public `BrandSystem`
   compositions. This is an explicit compatibility relationship, not a reason
   to universalize Public composition across Commerce.
3. **Translation readiness differs from route presence.** Home, Contact, and
   Privacy are marked ready in the current registry. About, Services,
   Projects, Retail, and FAQ use the approved Indonesian fallback/noindex
   behavior until complete translations exist.
4. **The legacy `/order` route is intentionally safe.** It renders an inactive
   compatibility destination and must not regain create-order or checkout
   ownership through a visual migration.
5. **Operations has two distinct order owners.** `/admin/orders` is the
   read-only legacy archive; `/admin/retail-orders` and its detail are the
   current target Retail Order workbench. Neither may absorb B2B or future
   Retail Request/Case lifecycles.
6. **Detail routes reuse parent permission keys deliberately.** The current
   frontend guard remains fail-closed when a permission mapping is absent;
   command permissions and backend handlers still govern mutations.
7. **Canonical target gaps remain inactive.** Registration, customer
   notifications, Retail configuration/Request/Offer/checkout, and dedicated
   Retail Request/Case Operations routes are absent from source. Their design
   requirements do not prove implementation or readiness.
8. **Prototype and alias preservation is intentional.** This inventory neither
   adopts nor deletes them. Retirement/migration requires consumer evidence,
   a redirect or discard plan, verification, and separate approval.

## 10. Verification record

Verification completed on 18 August 2026:

<!-- markdownlint-disable MD013 -->

| Check | Result |
| --- | --- |
| Baseline | Pass — `HEAD` and fetched `origin/main` both resolve to `8555685c29a3fde9976ae6499336e2eb45a330ba`; divergence is `0 0`. |
| Current route coverage | Pass — source extraction reports 59 literal path values: 58 non-wildcard paths and one wildcard; the matrix has zero missing entries. |
| Generated alias coverage | Pass — all eight keys in `PUBLIC_ROUTE_ALIASES` are represented; zero missing entries. |
| Effective route reconciliation | Pass — `58 + 8 + 1 = 67` current path patterns including generated aliases and wildcard. |
| Authority/inventory-only coverage | Pass — all 17 exact paths are represented and classified; zero missing entries. |
| Permission reconciliation | Pass — all 21 unique `protectedPage` permission keys used by `App.js` exist in `ADMIN_ROUTE_PERMISSIONS`; zero missing keys. Detail routes that intentionally reuse a parent key remain explicit in the matrix. |
| Page/component reconciliation | Pass — route page imports, shells, guards, state primitives, lifecycle adapters, and current DS-01A consumer relationships were source-checked. |
| Focused tests | Pass — 6 suites and 37 tests: `App.route.contract`, `publicRoutes`, `ProtectedRoute`, `permissions`, `adminWorkbench`, and `NotFoundPage`. |
| Local Markdown links | Pass — zero unresolved local links across this matrix, `TASKS.md`, and `README.md`. |
| Whitespace/file endings | Pass — zero trailing-whitespace findings, every reviewed file ends with a newline, and `git diff --check` passes. |
| Scope isolation | Pass — no tracked or application-source diff; the only worktree status is the untracked `.design/niuva-frontend-blueprint/` working set. |
| Markdownlint | Not run — no repository-local executable is available and no dependency was installed for this documentation-only task. |

<!-- markdownlint-enable MD013 -->

Browser, screenshot, performance, and Impeccable visual validation are not
required for this documentation-only inventory because it changes no runtime
route or UI and makes no visual-completion claim.

## 11. DS-01B disposition and next gate

`DS-01B` is complete only as a candidate exact-SHA route and responsibility
record for owner review. It may inform later component specifications,
wireframes, visual studies, state validation, and source task cards. It does
not itself authorize those activities.

The next recommended Phase 6 task is `DS-02` (shared action and form
primitives), but it requires a new, explicit owner authorization after this
matrix is reviewed. No later task starts automatically.

## 12. Explicit exclusions

This matrix does not authorize or perform:

- application source, test, route, redirect, navigation, sitemap, indexing,
  analytics, dependency, token, component API, or configuration changes;
- route activation, canonical promotion, alias migration/retirement,
  prototype adoption/deletion, or project-detail ownership;
- registration, external identity, private upload, storage, configuration,
  checkout, payment, reservation, fulfilment, notification-provider,
  production, or B2B portal activation;
- backend permission, role, query, schema, API, lifecycle, pricing, or business
  rule changes;
- redesign, wireframes, art-direction selection, component promotion, or
  design-system migration; or
- stage, commit, push, PR, merge, deployment, readiness, or go-live.

## Self-review

- [x] Current route declarations, aliases, reserved paths, and prototypes are
  recorded without activation or deletion.
- [x] Route visibility is not treated as authorization; locale and safe-return
  boundaries remain explicit.
- [x] No route, redirect, component, or source behavior changed.

**Self-review result:** Pass; exact-SHA DS-01B matrix retained for owner review.
