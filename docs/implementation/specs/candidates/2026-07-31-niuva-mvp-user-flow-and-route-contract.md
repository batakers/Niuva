# Niuva MVP User Flow & Route Contract

Status: **Context Only — Route Decisions Reconciled — No Implementation Authority**
Prepared: 31 July 2026
Decision update: `NUF-R01` through `NUF-R12` were explicitly approved on
31 July 2026, including the approved refinements to `NUF-R08` and `NUF-R09`.
`NUF-R01` is canonical as `DEC-ARCH-01` / `ADR-004`; `NUF-R02` through
`NUF-R12` are canonical as `DEC-UX-003`.
Scope: Public Website, Retail customer journey, B2B inquiry handoff, Retail
account, and reduced Admin Studio operator journey
Related product candidate:
[`2026-07-30-niuva-mvp-prd.md`](2026-07-30-niuva-mvp-prd.md)

## 1. Purpose and Authority

This document records the candidate user-flow and route proposal that produced
the approved `NUF-R01` through `NUF-R12` decisions. It now serves as provenance,
prototype input, and an activation-gate checklist. It defines:

- the intended customer and operator sequence;
- recommended page and route responsibilities;
- authentication, ownership, handoff, and recovery behavior;
- where Retail and B2B must remain separate;
- current-route compatibility risks; and
- the evidence required before any affected capability may be activated.

This document remains **Context Only**. It does not:

- replace the accepted surface-topology decision in `ADR-004` or the canonical
  route decision in `DEC-UX-003`;
- change the protected route map, navigation, source code, API, schema, or
  permissions;
- activate registration, upload, slicing, automatic pricing, checkout,
  payment, fulfillment, notification, refund, or production tracking;
- select a storage, payment, logistics, email, slicing, queue, scheduler, or
  infrastructure provider;
- authorize migration, deployment, production readiness, or go-live; or
- replace the Master Spec, approved requirements, Decision Register, decisions,
  ADRs, or runbooks.

When this document conflicts with a canonical record, the canonical record
wins. Route names marked `candidate_addition` or `candidate_reconciliation`
record source status and still require separately authorized implementation;
their approved product treatment is governed by `DEC-UX-003`.

## 2. Governing Constraints

1. Niuva remains one website and one operational platform with two customer
   journeys: Retail and Business/B2B.
2. The Homepage is unified, Business/B2B-primary, and provides a clearly
   discoverable secondary Retail entry.
3. Admin Studio contains the reduced integrated structured CMS and Operations
   Back-office. It is shared infrastructure, not a third customer journey.
4. Retail Order and B2B Inquiry/Quote/Project remain separate aggregates,
   state machines, permissions, and customer projections.
5. `quote_required` is a commitment route, not a customer type.
6. Every new Retail transaction requires an authenticated account. Anonymous
   visitors may browse and retain only non-sensitive, non-authoritative cart or
   configuration drafts.
7. Private upload, authoritative analysis, checkout, payment, order history,
   file access, and tracking require authenticated ownership.
8. A quote request or Assisted Retail Offer request creates no Order,
   reservation, payment attempt, checkout total, or paid state.
9. Backend authorization and ownership-scoped queries remain the security
   boundary. A visible or hidden route is not authorization.
10. Customer surfaces exclude internal cost, margin, profit, supplier data,
    private notes, raw provider payloads, secrets, and unrelated personal data.
11. `ADR-004` / `DEC-ARCH-01` selects single-application, single-origin,
    route-based delivery for MVP. Current route presence or absence remains
    implementation evidence only and does not activate a capability.

## 3. Route Status Vocabulary

| Status | Meaning |
| --- | --- |
| `existing` | Present in the current React route map; this does not prove the capability is complete or active |
| `existing_alias` | Present as a compatibility path to an existing page |
| `candidate_addition` | Route absent from the current source snapshot; only entries explicitly mapped in Section 12 are approved direction, while the others remain recommendations; none has implementation authority |
| `candidate_reconciliation` | Existing route or overlap; entries explicitly mapped in Section 12 have an approved treatment whose source reconciliation remains separately gated |
| `deferred` | Outside the selected MVP or blocked by an open decision |
| `excluded` | Must not be introduced through this candidate |

## 4. Current Implementation Baseline

The current `frontend/src/App.js` route map shows:

- public routes `/`, `/about`, `/capabilities`, `/services`, `/projects`,
  `/portfolio`, `/contact`, `/privacy`, and `/faq`;
- Retail discovery routes `/retail` and `/retail/products/:slug`;
- customer routes `/login`, `/dashboard`, `/order`, and `/orders/:id`;
- authentication recovery routes;
- Admin Studio routes under `/admin`; and
- one React application under one origin.

Current source also states:

- Retail catalog and product detail are discovery-only;
- checkout, payment, production upload, reservation, and fulfillment are not
  active;
- `/order` displays a safe unavailable state rather than creating a new
  transaction;
- current public registration is disabled; and
- historical customer orders remain readable through the existing
  ownership-scoped compatibility surface.

These facts are a read-only snapshot on 31 July 2026. They are not evidence
that the candidate routes below exist, that an affected backend contract is
ready, or that production activation is approved.

## 5. Candidate Route Principles

### 5.1 Canonical route and alias behavior

- One user intent has one canonical route.
- An alias may redirect to a canonical public route, but must not create a
  second content identity, separate analytics identity, or divergent CMS
  record.
- Route changes preserve valid bookmarks where practical and use explicit
  redirects rather than duplicate page ownership.
- Canonical/alias ownership follows `DEC-UX-003`; redirect implementation
  mechanics remain separately gated.

### 5.2 Authentication continuation

- Login or registration may return a customer only to an allowlisted,
  same-origin continuation derived from application state.
- Arbitrary caller-supplied URLs, external URLs, storage URLs, or raw query
  strings are never trusted as a post-authentication destination.
- The pre-login handoff contains only product, variant, quantity, and
  non-sensitive configuration draft data.
- After authentication, the server revalidates publication, configuration,
  file requirement, price, stock/material, tax, capacity, ETA, fulfillment,
  and eligibility.
- Registration, login, verification, recovery, or session failure creates no
  Order, reservation, payment attempt, or private file ownership.

### 5.3 Protected-resource behavior

- Customer routes require authenticated resource ownership.
- Admin routes require backend role, permission, and domain scope.
- A missing or unauthorized customer resource returns a non-enumerating
  not-found result.
- A permission denial on an internal route produces an explicit forbidden
  state without disclosing the protected record.
- Session expiry preserves only permitted non-sensitive draft state, then
  requires reauthentication and full revalidation.

### 5.4 State versus route

- A route identifies a durable task or resource, not every transient status.
- Loading, validating, success, warning, stale, expired, conflict, permission,
  retry, and unavailable states normally render inside the owning route.
- A new route is justified when it provides a durable deep link, materially
  different ownership/authorization, or an independently recoverable task.
- Email never performs payment, file replacement, cancellation, refund, or
  approval directly. It returns to an authenticated, allowlisted route.

## 6. Candidate Route Contract

### 6.1 Public and shared routes

| Candidate canonical route | Audience | Purpose | Current status | Candidate treatment |
| --- | --- | --- | --- | --- |
| `/` | Public | Unified Homepage with B2B-primary narrative and Retail secondary entry | `existing` | Retain |
| `/about` | Public | Company profile and trust context | `existing` | Retain |
| `/capabilities` | Public | Primary capability/service overview | `existing` | Approved canonical route |
| `/services` | Public | Compatibility path to capabilities | `existing_alias` | Approved permanent compatibility redirect to `/capabilities`; no separate content |
| `/projects` | Public | Primary project/portfolio proof | `existing` | Approved canonical route |
| `/portfolio` | Public | Compatibility path to projects | `existing_alias` | Approved permanent compatibility redirect to `/projects`; no separate content |
| `/contact` | Public | Public B2B/partnership inquiry and manual-service contact | `existing` | Retain; do not use as a substitute for authenticated Retail request context |
| `/privacy` | Public | Privacy information | `existing` | Retain; legal review remains separate |
| `/faq` | Public | Customer-safe FAQ | `existing` | Retain |
| `/retail` | Public | Retail catalog landing, category/search/filter, Ready Product and Custom 3D Print discovery | `existing` | Retain |
| `/retail/products/:slug` | Public | Published product detail, variants, availability, fixed/calculated/quote CTA semantics | `existing` | Retain; transactional CTA remains activation-gated |

Detailed visual navigation, mobile switch treatment, CTA labels, and redirect
mechanics remain open. Route vocabulary is approved by `DEC-UX-003`; surface
topology is approved by `ADR-004`.

### 6.2 Customer authentication and account routes

| Candidate route | Audience/auth | Purpose | Current status | Candidate treatment |
| --- | --- | --- | --- | --- |
| `/login` | Anonymous/customer | Customer login with allowlisted continuation | `existing` | Retain |
| `/register` | Anonymous | Create a Retail account before private upload or checkout | `candidate_addition` | Approved route direction; policy, verification, abuse control, activation, and implementation remain gated |
| `/forgot-password` | Anonymous | Begin account recovery | `existing` | Retain |
| `/forgot-password/check-email` | Anonymous | Safe recovery acknowledgement | `existing` | Retain |
| `/reset-password` | Anonymous with valid recovery context | Complete password reset | `existing` | Retain |
| `/reset-password/success` | Anonymous | Reset completion | `existing` | Retain |
| `/reset-password/error` | Anonymous | Invalid/expired reset recovery | `existing` | Retain |
| `/dashboard` | Authenticated Retail owner | Retail account home, order list, request/offer summary, actionable notifications | `existing` | Approved MVP account namespace; no `/account` migration |
| `/dashboard/notifications` | Authenticated Retail owner | Recipient-scoped in-app notification feed | `candidate_addition` | Approved durable notification route |

Staff login and invitation remain separate at `/admin/login` and
`/staff-invitation`. Customer and internal roles must never be combined.

### 6.3 Retail shopping, configuration, and checkout routes

| Candidate route | Audience/auth | Purpose | Current status | Candidate treatment |
| --- | --- | --- | --- | --- |
| `/retail/cart` | Public draft; authenticated before commitment | Non-authoritative cart and mixed-cart separation | `candidate_addition` | Recommended supporting route; exact cart route was not a separate `NUF-R01`–`NUF-R12` selection |
| `/retail/products/:slug/configure` | Public for non-sensitive draft; authenticated before upload/analysis | Simple/default or Detailed/advanced configuration | `candidate_addition` | Approved route direction |
| `/retail/requests/:requestId` | Authenticated request owner | Quote-required request status, safe reason, next action, and retained context | `candidate_addition` | Approved as a separate owned resource |
| `/retail/offers/:offerId` | Authenticated offer owner | Active Assisted Retail Offer version, safe breakdown, ETA, expiry, accept/decline action | `candidate_addition` | Approved as a separate owned versioned resource |
| `/retail/checkout` | Authenticated Retail owner | Server-authoritative review, fulfillment, ETA, total, reconfirmation, and payment-attempt creation | `candidate_addition` | Approved provider-neutral route direction |
| `/orders/:id` | Authenticated order owner | Order, payment state, factual production milestones, ETA, fulfillment, next action, and history | `existing` | Retain as the canonical Retail Order detail |
| `/orders/:id/file-revision` | Authenticated order owner | Upload a replacement file within the governed revision flow | `candidate_addition` | Recommended durable action surface; exact route was not a separate `NUF-R01`–`NUF-R12` selection |
| `/orders/:id/cancellation` | Authenticated order owner | Submit/view cancellation request and outcome | `candidate_addition` | Recommended durable action surface; exact route was not a separate `NUF-R01`–`NUF-R12` selection |
| `/orders/:id/complaints/new` | Authenticated order owner | Submit a complaint and scoped evidence | `candidate_addition` | Recommended durable action surface; exact route was not a separate `NUF-R01`–`NUF-R12` selection |
| `/orders/:id/complaints/:caseId` | Authenticated order/case owner | Complaint, evidence request, resolution, remedy, refund/reprint/return progress | `candidate_addition` | Recommended durable action surface; exact route was not a separate `NUF-R01`–`NUF-R12` selection |
| `/order` | Authenticated customer | Current legacy new-order unavailable page | `candidate_reconciliation` | Keep safe unavailable state before activation; then redirect to `/retail`; never reactivate legacy creation |

The checkout route does not imply that one browser page performs every
transactional mutation. Provider-specific actions remain behind the
provider-neutral payment boundary and must return to the owned Order detail.

### 6.4 Admin Studio routes

Existing Admin routes remain implementation evidence. This candidate proposes
task ownership without approving exact Admin navigation or permissions.

| Candidate route | Primary task/role context | Current status | Candidate treatment |
| --- | --- | --- | --- |
| `/admin` | Role-aware operational home | `existing` | Retain |
| `/admin/content` | Structured content workflow; `content_editor` | `existing` | Retain |
| `/admin/portfolio` and `/admin/portfolio/:id` | Portfolio workflow; `content_editor` | `existing` | Retain |
| `/admin/catalog` and `/admin/catalog/:productId` | Catalog/configuration/pricing candidates; `catalog_manager` | `existing` | Retain |
| `/admin/materials` | Material and price-version preparation; `catalog_manager`/`warehouse` by permission | `existing` | Retain |
| `/admin/inventory` | Inventory balances and governed operations; `warehouse` | `existing` | Retain |
| `/admin/stock-movements` | Inventory movement history; `warehouse` | `existing` | Retain |
| `/admin/restock-alerts` | Existing restock page | `existing` | Reconcile with `DEC-OPS-002`, which places Restock Alerts in the header-bell workflow |
| `/admin/inquiries` and `/admin/inquiries/:id` | B2B inquiry triage; `sales_estimator` | `existing` | Retain for B2B |
| `/admin/b2b/quotes` and detail/revision routes | B2B quotation; `sales_estimator` and approval permissions | `existing` | Retain; never reuse as a Retail Offer aggregate |
| `/admin/b2b/projects` and detail routes | B2B project operations | `existing` | Retain |
| `/admin/b2b/work-orders` and detail routes | B2B production execution | `existing` | Retain |
| `/admin/retail-requests` | Retail quote-required and Assisted Retail Offer work queue | `candidate_addition` | Approved route direction |
| `/admin/retail-requests/:id` | File/analysis review, route decision, immutable offer versions, approval, and customer-safe outcome | `candidate_addition` | Approved; offer versions remain inside one request detail for the one-operator MVP |
| `/admin/retail-orders` and `/admin/retail-orders/:id` | Direct-checkout Retail order, production, QC, and fulfillment coordination | `existing` | Retain |
| `/admin/retail-cases` and `/admin/retail-cases/:caseId` | Cancellation, complaint, reprint/replacement, refund, and return queue/detail | `candidate_addition` | Approved route direction |
| `/admin/orders` | Legacy/general order workbench | `candidate_reconciliation` | Retain temporarily as a labelled read-only legacy archive outside active queues; retire only after an approved historical-data procedure |
| `/admin/notifications` | Role-scoped notification feed | `existing` | Retain only with explicit route permission and domain-scoped references |
| `/admin/communication` | Controlled operational message composition | `existing` | Retain separately from notification feed; no campaign or arbitrary recipient behavior |
| `/admin/customers` | Minimal domain-scoped customer operations | `existing` | Retain only within approved permissions and safe projections |
| `/admin/users` | Internal identity governance | `existing` | Super Admin only under `DEC-ACCESS-002` |
| `/admin/settings` | Approved operational configuration | `existing` | Retain only for allowlisted settings and permissions |

Payment reconciliation, provider configuration, and broad analytics routes are
not fixed by this candidate. Their exact routes must follow later Finance,
provider, permission, and operational decisions rather than being inferred
from the current UI.

### 6.5 Deferred or excluded routes

| Route/surface | Treatment |
| --- | --- |
| Authenticated B2B organization quotation/project portal | Deferred from this MVP; governed by a separate decision packet |
| Separate Retail or Admin subdomain | Not selected for MVP; requires a superseding `ADR-004` decision |
| Separate frontend applications | Not selected for MVP; requires a superseding `ADR-004` decision |
| Public storage/file URL | Excluded |
| Provider-specific payment route as the core product contract | Excluded |
| Customer-supplied callback or arbitrary `return_to` URL | Excluded |
| Guest checkout, guest-order magic link, or verified-contact guest tracking | Excluded for new Retail transactions |
| Customer `.gcode` execution/upload-to-production path | Excluded |
| WhatsApp notification preference/automation route | Excluded |
| Free-form CMS page-builder route | Excluded from the selected MVP |
| Broad Admin audit viewer or operational user-directory route | Excluded except the Super Admin identity-governance surface |

## 7. End-to-End Customer Flows

### 7.1 Public B2B and partnership inquiry

```text
Homepage / Capabilities / Projects
-> Contact
-> submit public Inquiry
-> safe acknowledgement/reference
-> internal B2B inquiry triage
-> manual follow-up
```

- Public inquiry may begin without login.
- Bulk, partnership, borongan, recurring, organizational, contractual, and
  special/international-fulfillment work remains B2B.
- A customer B2B portal is not part of this MVP.
- The route does not imply an accepted Quote, Project, Order, payment, or
  production commitment.

### 7.2 Ready Product direct checkout

```text
/retail
-> /retail/products/:slug
-> choose variant and quantity
-> non-authoritative cart (`/retail/cart`, candidate-only)
-> /login or /register when required
-> server revalidation
-> /retail/checkout
-> choose pickup or eligible domestic delivery
-> confirm price, tax treatment, ETA, and fulfillment
-> create Order + payment attempt + 30-minute reservation atomically
-> online payment action
-> /orders/:id
-> factual fulfillment milestones
-> completed or governed recovery
```

The cart never promises stock. The fixed 30-minute reservation begins only
after successful Order/payment-attempt creation, not while browsing or viewing
checkout.

### 7.3 Standard Custom 3D Print automatic path

```text
/retail/products/:slug
-> /retail/products/:slug/configure
-> choose Simple or allowed Detailed configuration
-> /login or /register before private upload
-> upload .stl or supported single-model/plate .3mf
-> validating -> scanning -> slicing/model analysis
-> calculated eligibility succeeds
-> customer reviews exact file version, dimensions/scale,
   material/color/quantity/configuration, billable grams,
   print duration, customer-safe breakdown, total, ETA, fulfillment
-> non-authoritative cart (`/retail/cart`, candidate-only)
-> /retail/checkout
-> server revalidation and explicit reconfirmation if changed
-> create Order + payment attempt + 30-minute reservation atomically
-> payment
-> /orders/:id production tracking
```

The flow does not trust embedded customer profiles or customer `.gcode`.
Quantity uses a validated production plan rather than multiplying one object
price blindly.

### 7.4 Quote-required handoff

```text
validation, slicing, profile, capacity, ETA, fulfillment,
commercial, or operator-risk check cannot commit safely
-> separate affected item from mixed cart
-> retain account/product/configuration/quantity/file/safe-analysis/
   fulfillment/reason context
-> create request reference
-> /retail/requests/:requestId
-> route to B2B or Assisted Retail review
```

- The remaining direct-checkout items stay in the cart.
- No guessed price, ETA, delivery rate, Order, reservation, payment attempt, or
  paid state is created for the quote-required item.
- The customer receives a safe reason and next action.

### 7.5 Assisted Retail Offer

```text
Retail request submitted
-> internal technical/commercial review
-> draft
-> awaiting_approval
-> manager_approver approval
-> offered
-> customer opens /retail/offers/:offerId
-> accept | decline
```

If accepted:

```text
accepted active offer
-> /retail/checkout
-> revalidate owner, version, expires_at, tax, capacity, ETA,
   availability, pickup/delivery and delivery rate
-> customer reconfirms changed inputs
-> normal Retail Order/payment/reservation flow
```

If revised, a new immutable version supersedes the prior active version. A
declined, expired, or superseded version cannot enter checkout. Acceptance
alone creates no Order, reservation, payment attempt, or payment.

### 7.6 Customer tracking and fulfillment

Ready Product and Custom Print use the milestone templates in `DEC-ETA-01`.
The owned Order detail shows:

- current factual milestone and completed milestone times;
- current ETA range and its target;
- next action;
- customer-safe reason or exception;
- payment state;
- pickup/delivery state and safe tracking; and
- append-only history relevant to the customer.

It does not display a fake progress percentage, another customer's queue
position, internal printer identity, internal cost, supplier, margin, profit,
or private notes.

### 7.7 File revision and after-sales

```text
/orders/:id
-> file_revision_required
-> candidate-only file-revision route (`/orders/:id/file-revision`)
-> upload new private file version within revision_due_at
-> operator review
-> continue production OR quote_required OR cancellation/refund review
```

```text
/orders/:id
-> cancellation or complaint action
-> candidate-only owned action/case route
-> operator triage
-> evidence or domain review
-> manager approval where required
-> exact customer-safe result
-> reprint/replacement/refund/return progress
```

File-revision timeout does not infer a refund amount. Complaint, reprint,
refund, and return follow the lifecycle, timing, evidence, approval, and
provider boundaries in `DEC-AFTER-01`.

## 8. Internal Operator Flows

### 8.1 Content and portfolio

```text
/admin/content or /admin/portfolio
-> draft/edit structured fields
-> validate and preview
-> publish with permitted role/approval
-> version history and rollback
```

One person may hold both `content_editor` and `manager_approver`, but actor,
role context, reason, and audit remain explicit. The CMS does not own order,
payment, inventory, production, or fulfillment truth.

### 8.2 Catalog, pricing, and stock

```text
/admin/catalog
-> product/variant/configuration/pricing candidate
-> validate
-> publish with required approval
-> /admin/inventory and stock workflows
-> restock alert when threshold/shortage rule is met
```

Price-policy activation, tax profile, opening balances, reorder points,
machine profiles, and quote thresholds remain activation gates. Historical
paid Orders and accepted offers/quotations are never rewritten.

### 8.3 Retail request and Assisted Offer

```text
/admin/retail-requests
-> open request detail
-> inspect owned file and safe analysis
-> choose Assisted Retail or B2B route
-> prepare immutable offer version when eligible
-> manager approval
-> publish offer to authenticated owner
-> monitor accepted/declined/expired/superseded outcome
```

The operator cannot execute customer `.gcode`, silently repair geometry,
publish an approximate final price, or create an Order/payment as a shortcut.

### 8.4 Retail Order, production, QC, and fulfillment

```text
/admin/retail-orders
-> paid-order readiness queue
-> file review when applicable
-> production queue
-> printing
-> post-processing when applicable
-> quality control
-> ready for pickup or ready to ship
-> handover/shipment/delivery
-> completed
```

Routine updates may be made directly by an authorized role within its domain.
One account may perform combined work only when it explicitly holds every
required role. Each mutation remains reasoned and auditable.

### 8.5 After-sales and reconciliation

```text
/admin/retail-cases
-> triage
-> collect permitted evidence
-> production/QC/Finance input
-> proposed exact outcome
-> manager approval for refund or free reprint/replacement
-> provider execution/reconciliation
-> customer-safe resolution and history
```

Payment uncertainty, late success, refund failure, or provider mismatch enters
an auditable reconciliation path. It never silently recreates stock, duplicates
payment/refund, or rewrites the paid amount.

## 9. Recovery and Exception Contract

| Condition | Customer/operator behavior | Prohibited behavior |
| --- | --- | --- |
| Anonymous user reaches private action | Send to login/registration with safe continuation; preserve only non-sensitive draft | Upload ownership, Order, reservation, or payment before authentication |
| Registration/login/recovery fails | Keep allowed draft and offer retry/recovery | Create transaction or discard safe draft silently |
| Session expires | Reauthenticate, then fully revalidate | Trust stale price, stock, file result, ETA, or delivery rate |
| Product unpublished or variant unavailable | Explain unavailability and return to catalog/cart | Show stale purchase CTA or leak internal reason |
| Upload invalid, too large, unsafe, or scan failed | Keep user on configuration/upload route with safe corrective action | Release file to production or expose raw provider error |
| Slicing/eligibility fails safely | Convert item to `quote_required` with context | Display approximate final price/ETA as committed |
| Mixed cart contains quote item | Separate quote item; retain eligible direct items | Include unknown quote amount in checkout total |
| Offer expired/superseded/declined | Show safe terminal state and next action | Allow checkout from inactive version |
| Price, ETA, tax, stock, or fulfillment changed | Display change and require reconfirmation | Commit silently with stale snapshot |
| Delivery rate expired | Refresh and reconfirm | Reuse guessed or expired rate |
| Reservation expires | Release once; require fresh preview/rate/ETA and new attempt | Reactivate old reservation |
| Late payment succeeds after expiry | Send to reconciliation | Recreate inventory or mark a second Order paid |
| Notification email fails | Keep in-app state and core transaction; bounded retry | Roll back Order/payment/milestone or use WhatsApp fallback |
| `file_revision_required` | Show exact deadline and owned replacement route | Start clock from email failure or overwrite prior file version |
| `eta_overdue` | Require replacement range, safe reason, and follow-up | Automatic cancellation, refund, reprint, or completion |
| Customer lacks ownership | Non-enumerating not-found | Reveal that the resource exists |
| Internal user lacks permission | Explicit forbidden state and safe return | Rely on hidden button as security |
| Provider unavailable | Controlled retry, pickup fallback when approved, quote/reconciliation path | Invent rate, payment result, shipment, or refund result |

## 10. Audience and Data Boundary

| Audience | May see | Must not see |
| --- | --- | --- |
| Public visitor | Published public content, catalog, safe availability/price-from semantics, public policies | Private files, authoritative checkout state, internal inventory, another customer's data |
| Authenticated Retail owner | Owned drafts, requests, active offers, Orders, safe payment/ETA/milestone/fulfillment/after-sales projections | Internal cost, margin, supplier, profit, raw provider payloads, private notes, other customers |
| B2B public prospect | Own submitted inquiry acknowledgement and manual follow-up information available through the approved public process | Retail Order internals or an unapproved B2B portal |
| Internal domain operator | Role- and resource-scoped records/actions needed for assigned work | Broad identity/audit directory, unrelated domains, secrets, or unrestricted evidence |
| `manager_approver` | Sensitive approval context and safe audit needed for the decision | Unrelated customer/provider/identity data |
| `super_admin` | Approved identity-governance and emergency-recovery surface | Provider secrets in UI or authority outside approved product boundaries |

Notification deep links derive from an allowlisted audience plus reference type
and identifier. Stored arbitrary URLs, external redirects, storage URLs, raw
paths, tokens, and provider actions are never accepted as canonical links.

## 11. Prototype Validation Contract

Before route approval or implementation planning, a clickable prototype should
validate at least:

### Customer scenarios

1. Ready Product happy path through cart, authentication boundary, checkout,
   payment handoff, and Order detail.
2. Custom Print Simple mode with valid `.stl`.
3. Custom Print Detailed mode using only allowed values.
4. Supported `.3mf` with customer profiles ignored.
5. Invalid/oversized/unsafe upload and retry.
6. Slicing failure to context-preserving `quote_required`.
7. Mixed-cart separation.
8. Assisted Offer offered, accepted, declined, expired, and superseded states.
9. Stale price/ETA/delivery rate with explicit reconfirmation.
10. Reservation warning at five minutes and expired retry.
11. File-revision action and exact deadline.
12. Order milestone, ETA change, `eta_overdue`, pickup, and delivery flows.
13. Complaint, evidence request, refund/reprint decision, and status follow-up.
14. Session expiry, ownership denial, unavailable backend, and retry.

### Operator scenarios

1. One non-IT operator switches between content, catalog, request, Order,
   production/QC, fulfillment, and after-sales work without losing context.
2. Role-aware dashboard shows next actions rather than a generic KPI grid.
3. Assisted Offer preparation and manager approval are understandable when one
   account holds both permitted roles.
4. File review never exposes unsafe download or customer `.gcode` execution.
5. Stale/conflicting records require refresh or deliberate recovery.
6. Notification delivery failure is visible without changing core state.
7. Refund/free-reprint approval and Finance execution remain distinct.

### Usability and accessibility evidence

- desktop plus at least 390 px mobile flow;
- keyboard-only completion of critical actions;
- visible focus and meaningful heading order;
- 44 px general interactive target;
- no meaning conveyed only by color, icon, motion, or fake percentage;
- reduced-motion behavior;
- loading, empty, error, retry, conflict, forbidden, stale, and expired states;
- customer and operator copy review; and
- observed operator completion notes, confusion points, and required revisions.

Prototype validation is evidence for a later decision. It is not implementation
or production-readiness evidence.

## 12. Promoted Route Decisions

| ID | Approved selection | Canonical record |
| --- | --- | --- |
| `NUF-R01` | Select the current single-application, single-origin, route-based shape for MVP | `DEC-ARCH-01` / `ADR-004` |
| `NUF-R02` | Canonical `/capabilities` and `/projects`; permanent compatibility redirects from `/services` and `/portfolio` | `DEC-UX-003` |
| `NUF-R03` | Retain `/dashboard` for MVP rather than introduce an `/account` migration | `DEC-UX-003` |
| `NUF-R04` | Use `/retail/products/:slug/configure` | `DEC-UX-003` |
| `NUF-R05` | Separate owned `/retail/requests/:requestId` and `/retail/offers/:offerId` | `DEC-UX-003` |
| `NUF-R06` | Use provider-neutral `/retail/checkout`; provider actions return to `/orders/:id` | `DEC-UX-003` |
| `NUF-R07` | Use `/dashboard/notifications` | `DEC-UX-003` |
| `NUF-R08` | Keep the safe `/order` compatibility state before activation, then redirect to `/retail`; never reactivate legacy creation | `DEC-UX-003` |
| `NUF-R09` | Make `/admin/retail-orders` authoritative; retain `/admin/orders` temporarily as a labelled read-only legacy archive outside active queues | `DEC-UX-003` |
| `NUF-R10` | Use one Retail Request queue plus detail and manage immutable offer versions inside that detail | `DEC-UX-003` |
| `NUF-R11` | Use `/admin/retail-cases` plus a dedicated detail route | `DEC-UX-003` |
| `NUF-R12` | Reserve `/register` for customer account creation behind a separately approved registration/verification contract | `DEC-UX-003` |

These approvals provide product, experience, and architecture inputs only. They
do not authorize source, schema, permission, migration, provider, deployment,
readiness, or go-live changes.

## 13. Activation-Gate Checklist

### Status vocabulary

| Status | Meaning |
| --- | --- |
| `resolved_direction` | Product/architecture direction exists, but activation evidence may still be open |
| `open` | Owner decision, configuration, evidence, or contract is missing |
| `requires_revalidation` | Implementation evidence exists or is claimed but must be checked against the approved contract |
| `not_authorized` | The action has not received implementation, deployment, readiness, or go-live authority |

### A. Route, UX, and topology

| Gate | Required result/evidence | Owner | Status |
| --- | --- | --- | --- |
| `AG-UX-01` | MVP single-origin route-based topology follows `DEC-ARCH-01` / `ADR-004`; implementation validation remains separate | Product + Technical | `resolved_direction` |
| `AG-UX-02` | Canonical route ownership, aliases, and legacy redirect/retention direction follow `DEC-UX-003`; exact implementation mechanics remain separate | Product + Technical | `resolved_direction` |
| `AG-UX-03` | Approve public navigation, Retail entry, CTA labels, and mobile treatment without weakening B2B-primary hierarchy | Product + UX/Brand | `open` |
| `AG-UX-04` | Customer route map and ownership direction follow `DEC-UX-003`; exact reference-to-route mapping remains a technical contract | Product + Access | `resolved_direction` |
| `AG-UX-05` | Approve role-aware Admin queue/navigation map without restoring excluded scope | Product + Operations + Access | `open` |
| `AG-UX-06` | Complete prototype scenarios in Section 11 with non-IT operator evidence | Product + UX + Operations | `open` |
| `AG-UX-07` | Record accessibility/responsive findings and corrective decisions | UX + QA | `open` |

### B. Identity, access, and privacy

| Gate | Required result/evidence | Owner | Status |
| --- | --- | --- | --- |
| `AG-AUTH-01` | Approve customer registration, verification, abuse control, and recovery contract compatible with `DEC-RT-02` | Product + Access + Security | `open` |
| `AG-AUTH-02` | Prove safe pre-auth draft handoff and allowlisted post-auth continuation | Frontend + Backend + Security | `open` |
| `AG-AUTH-03` | Prove every customer route uses authenticated ownership queries and non-enumerating denial | Backend + Security | `requires_revalidation` |
| `AG-AUTH-04` | Approve route-to-permission matrix for every new Admin route | Access + Backend | `open` |
| `AG-AUTH-05` | Prove internal multi-role and `manager_approver` separation-of-duty behavior | Access + QA | `requires_revalidation` |
| `AG-AUTH-06` | Approve customer/operator projection allowlists and forbidden-field tests | Security + Domain owners | `open` |
| `AG-AUTH-07` | Validate session expiry, CSRF/origin, cookie, recovery, and logout behavior for the selected topology | Security + Technical | `open` |

### C. Catalog, configuration, file, and slicing

| Gate | Required result/evidence | Owner | Status |
| --- | --- | --- | --- |
| `AG-FILE-01` | Approve Simple presets and Detailed fields/values | Product + Operations | `open` |
| `AG-FILE-02` | Calibrate machine, nozzle, material, support, process, and quality profiles on representative Niuva printers/files | Operations + Technical | `open` |
| `AG-FILE-03` | Approve file size, part/plate count, build volume, quantity, duration, deadline/capacity, and operator-risk thresholds | Product + Operations + Technical | `open` |
| `AG-FILE-04` | Prove `.stl` and supported `.3mf` behavior; ignore customer profiles; reject `.gcode`; route CAD/archive/reference inputs correctly | Technical + QA | `open` |
| `AG-FILE-05` | Approve production quantity-plan behavior for layout, repeated jobs, purge/waste, capacity, and machine time | Operations + Technical | `open` |
| `AG-FILE-06` | Select/approve private storage provider plus ownership, MIME/signature, scan/quarantine, quota, retention, backup/restore, and reconciliation | Security + Operations + Technical | `open` |
| `AG-FILE-07` | Approve slicing deployment topology, failure isolation, timeout/retry, observability, and safe error taxonomy | Technical + Operations | `open` |

### D. Offer, pricing, tax, and checkout

| Gate | Required result/evidence | Owner | Status |
| --- | --- | --- | --- |
| `AG-OFFER-01` | Automatic-pricing and quote-routing product contract follows `DEC-OFFER-01` | Product | `resolved_direction` |
| `AG-OFFER-02` | Approve exact request/offer schema, state/conflict/idempotency/audit contract | Product + Technical + Access | `open` |
| `AG-OFFER-03` | Approve default/allowed Assisted Retail Offer expiry and customer-safe copy | Product + Commercial | `open` |
| `AG-OFFER-04` | Prove immutable versioning, manager approval, owner binding, expiry, supersession, and checkout reuse | Backend + QA | `open` |
| `AG-PRICE-01` | Implement and verify `NIUVA-CP-FDM-001` with exact slicer precision and final-only rounding | Technical + Commercial + QA | `open` |
| `AG-TAX-01` | Finance confirms PKP status, classification, rate/basis, invoice behavior, regulatory reference, approver, and versioned effective profile | Finance | `open` |
| `AG-CHECKOUT-01` | Approve exact cart/preview/Order/payment/reservation API and state contract | Product + Technical | `open` |
| `AG-CHECKOUT-02` | Prove full server revalidation and explicit reconfirmation for changed price, tax, stock, capacity, ETA, offer, and fulfillment | Backend + Frontend + QA | `open` |

### E. Inventory and reservation

| Gate | Required result/evidence | Owner | Status |
| --- | --- | --- | --- |
| `AG-INV-01` | Fixed 30-minute reservation policy and race invariants follow `DEC-INV-01` | Product | `resolved_direction` |
| `AG-INV-02` | Approve and import opening balances plus reorder points by SKU/material/color with audit | Warehouse + Product | `open` |
| `AG-INV-03` | Prove transaction capability and atomic multi-line reserve/release/consume behavior | Backend + Platform + QA | `requires_revalidation` |
| `AG-INV-04` | Prove payment success versus expiry race, idempotent retry, and late-success reconciliation | Backend + Finance + QA | `open` |
| `AG-INV-05` | Approve expiry scheduler ownership, monitoring, recovery, and manual reconciliation procedure | Operations + Platform | `open` |

### F. ETA, production, and QC

| Gate | Required result/evidence | Owner | Status |
| --- | --- | --- | --- |
| `AG-ETA-01` | Customer ETA and factual milestone direction follows `DEC-ETA-01` | Product + Operations | `resolved_direction` |
| `AG-ETA-02` | Approve handling/review/material/queue/post-processing/QC/buffer durations and operating calendar | Operations | `open` |
| `AG-ETA-03` | Approve milestone-template applicability and exact technical state/API mapping | Product + Operations + Technical | `open` |
| `AG-ETA-04` | Validate customer-safe reason copy, ETA change history, and `eta_overdue` recovery | Operations + UX + QA | `open` |
| `AG-OPS-01` | Confirm staff role assignments and accountable owners for order, production, QC, fulfillment, and escalation | Operations + Access | `open` |
| `AG-OPS-02` | Validate manual milestone updates without live Bambu telemetry or fake percentages | Operations + QA | `open` |

### G. Fulfillment

| Gate | Required result/evidence | Owner | Status |
| --- | --- | --- | --- |
| `AG-FUL-01` | Pickup plus domestic automatic-rate direction follows `DEC-FUL-01` | Product | `resolved_direction` |
| `AG-FUL-02` | Select logistics provider and approve adapter contract, credentials boundary, failure/retry, booking, label, and tracking | Operations + Technical | `open` |
| `AG-FUL-03` | Approve origin, pickup locations, hours, contact instructions, availability, and collection windows | Operations | `open` |
| `AG-FUL-04` | Approve Ready Product and Custom Print package profiles plus domestic-address validation and service allowlist | Operations + Catalog | `open` |
| `AG-FUL-05` | Validate rate expiry/refresh/reconfirmation, immutable paid snapshot, and provider variance reconciliation | Backend + QA + Finance | `open` |
| `AG-FUL-06` | Approve pickup handover evidence, seven-day overdue follow-up, and long-term uncollected-item policy | Operations + Legal/Business | `open` |

### H. Payment and Finance

| Gate | Required result/evidence | Owner | Status |
| --- | --- | --- | --- |
| `AG-PAY-01` | Provider-neutral online-payment architecture follows `ADR-003`; no new manual-transfer path | Technical + Product | `resolved_direction` |
| `AG-PAY-02` | Select payment provider and approve state mapping, action expiry, webhook authentication, idempotency, and customer-safe projection | Finance + Technical + Security | `open` |
| `AG-PAY-03` | Approve reconciliation ownership, SLA, queue, escalation, and late/uncertain-payment procedure | Finance + Operations | `open` |
| `AG-PAY-04` | Approve refund provider execution/timing and Finance accounting/tax correction | Finance | `open` |
| `AG-PAY-05` | Prove payment/refund retry cannot duplicate Order, inventory, refund, notification, or audit effects | Backend + QA | `open` |

### I. Notifications

| Gate | Required result/evidence | Owner | Status |
| --- | --- | --- | --- |
| `AG-NOTIF-01` | Retail recipient/event/channel/payload/deep-link/retry direction follows amended `DEC-DATA-003` | Product + Data | `resolved_direction` |
| `AG-NOTIF-02` | Select email provider and approve sender/domain/template/privacy configuration | Operations + Technical | `open` |
| `AG-NOTIF-03` | Approve exact source-event mapping, deduplication, outbox worker, lease, retry spacing, and scheduler topology | Technical + Data | `open` |
| `AG-NOTIF-04` | `/dashboard/notifications` follows `DEC-UX-003`; approve the exact customer/Admin audience-aware reference-to-route allowlists | Product + Access + Security | `open` |
| `AG-NOTIF-05` | Validate mandatory versus preference-controlled email, five-attempt exhaustion, controlled resend, and no rollback | Operations + QA | `open` |
| `AG-NOTIF-06` | Confirm alert destination and operational response for delivery exhaustion/backlog | Operations | `open` |

### J. After-sales and legal

| Gate | Required result/evidence | Owner | Status |
| --- | --- | --- | --- |
| `AG-AFTER-01` | Revision/cancellation/complaint/reprint/refund/return direction follows `DEC-AFTER-01` | Product + Operations + Finance | `resolved_direction` |
| `AG-AFTER-02` | Legal/business review approves customer terms, complaint wording, statutory-right boundary, and return instructions | Legal/Business | `open` |
| `AG-AFTER-03` | Approve working-day calendar, SLA ownership, escalation, and customer-safe reason copy | Operations | `open` |
| `AG-AFTER-04` | Approve evidence type, ownership, privacy, retention, and access behavior | Security + Legal + Operations | `open` |
| `AG-AFTER-05` | Approve exact case state/API/conflict/idempotency/audit contract | Product + Technical | `open` |
| `AG-AFTER-06` | Decide abuse/fraud handling and long-term uncollected-pickup behavior without silent denial/deletion | Legal + Security + Operations | `open` |

### K. CMS and operator readiness

| Gate | Required result/evidence | Owner | Status |
| --- | --- | --- | --- |
| `AG-CMS-01` | Reduced integrated structured CMS direction follows `DEC-OPS-003` | Product | `resolved_direction` |
| `AG-CMS-02` | Approve exact structured fields for public pages, portfolio, SEO, media, and publication validation | Content + Product | `open` |
| `AG-CMS-03` | Validate content/catalog/order workflows with the intended non-IT operator | UX + Operations | `open` |
| `AG-CMS-04` | Approve preview, publish, rollback, archive, and audit behavior without mandatory multi-person workflow | Product + Access | `open` |
| `AG-CMS-05` | Produce operator SOP, training, ownership matrix, and recovery guide | Operations | `open` |

### L. Delivery, migration, and release authority

| Gate | Required result/evidence | Owner | Status |
| --- | --- | --- | --- |
| `AG-DEL-01` | Approve exact bounded implementation plan with file scope, dependencies, tests, migration, rollback, and feature flags | Product + Technical | `not_authorized` |
| `AG-DEL-02` | Review current implementation against this contract and classify legacy overlap without destructive cleanup | Technical + Data | `open` |
| `AG-DEL-03` | Approve non-destructive schema/data migration with backup, dry run, validation, rollback, and second-run behavior | Data + Technical + Operations | `not_authorized` |
| `AG-DEL-04` | Complete automated unit/API/concurrency/E2E/security/accessibility checks for the selected slice | QA + Engineering | `not_authorized` |
| `AG-DEL-05` | Complete staging-like provider, backup/restore, reconciliation, alerting, and operational handover evidence | Release owners | `not_authorized` |
| `AG-DEL-06` | Record production-readiness approval separately from implementation completion | Product + Operations + Security + Finance | `not_authorized` |
| `AG-DEL-07` | Record explicit go-live authorization | Accountable business/release authority | `not_authorized` |

## 14. Reconciled Candidate Quality Criteria

This Context Only record remains usable as provenance and activation-gate
context when:

1. Existing routes, compatibility routes, candidate additions, and deferred
   surfaces are distinguishable.
2. Every customer path has an explicit authentication and ownership boundary.
3. Ready Product, calculated Custom Print, quote-required, Assisted Retail
   Offer, B2B, checkout, tracking, and after-sales flows remain distinct.
4. No route creates an Order, reservation, or payment earlier than the approved
   lifecycle permits.
5. Mixed-cart, stale, expiry, session, upload, provider, and notification
   recovery behavior is explicit.
6. Admin task routes are role-aware and do not merge Retail Offer with B2B
   Quote or restore excluded Admin scope.
7. Customer-safe projections and deep-link allowlists are explicit.
8. Prototype scenarios cover happy paths and material failure/recovery paths.
9. Every activation gate has an owner category, required evidence, and visible
   status.
10. The document makes no implementation, migration, provider, readiness, or
    go-live claim.

## 15. Recommended Review Sequence

1. Keep this document registered as provenance and activation-gate context;
   `NUF-R01` through `NUF-R12` are governed by `ADR-004` and `DEC-UX-003`.
2. Build and validate the clickable customer/operator prototype.
3. Run the bounded file/slicing/profile/quantity/price calibration spike.
4. Produce exact technical contracts for request/offer, checkout, Order,
   notification, and after-sales boundaries.
5. Evaluate providers against the approved provider-neutral requirements.
6. Create a separately authorized implementation plan in bounded vertical
   slices.

## 16. Related Authority and Evidence

Canonical/product authority:

- [`NIUVA_MASTER_SPEC.md`](../../../NIUVA_MASTER_SPEC.md)
- [`DOCUMENT_REGISTER.md`](../../../context/DOCUMENT_REGISTER.md)
- [`DECISION_REGISTER.md`](../../../decisions/DECISION_REGISTER.md)
- [`DEC-UX-001-unified-homepage-b2b-primary.md`](../../../decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md)
- [`DEC-UX-003-mvp-user-flow-and-route-contract.md`](../../../decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md)
- [`DEC-OPS-001-admin-studio-operational-direction.md`](../../../decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md)
- [`DEC-OPS-003-reduced-integrated-cms-mvp.md`](../../../decisions/experience/DEC-OPS-003-reduced-integrated-cms-mvp.md)
- [`DEC-ACCESS-002-granular-role-permission-matrix.md`](../../../decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md)
- [`DEC-RT-02-retail-account-required-checkout.md`](../../../decisions/product/DEC-RT-02-retail-account-required-checkout.md)
- [`DEC-OFFER-01-retail-offer-file-and-quote-routing.md`](../../../decisions/product/DEC-OFFER-01-retail-offer-file-and-quote-routing.md)
- [`DEC-PRICE-001-custom-print-commercial-pricing.md`](../../../decisions/product/DEC-PRICE-001-custom-print-commercial-pricing.md)
- [`DEC-TAX-01-tax-inclusive-display-and-finance-activation-gate.md`](../../../decisions/product/DEC-TAX-01-tax-inclusive-display-and-finance-activation-gate.md)
- [`DEC-FUL-01-shipping-and-pickup-policy.md`](../../../decisions/product/DEC-FUL-01-shipping-and-pickup-policy.md)
- [`DEC-ETA-01-retail-eta-and-customer-milestone-policy.md`](../../../decisions/product/DEC-ETA-01-retail-eta-and-customer-milestone-policy.md)
- [`DEC-AFTER-01-retail-revision-and-after-sales-policy.md`](../../../decisions/product/DEC-AFTER-01-retail-revision-and-after-sales-policy.md)
- [`DEC-DATA-003-notification-schema-retention-and-delivery-boundary.md`](../../../decisions/product/DEC-DATA-003-notification-schema-retention-and-delivery-boundary.md)
- [`DEC-INV-01-retail-checkout-reservation-duration.md`](../../../decisions/product/DEC-INV-01-retail-checkout-reservation-duration.md)
- [`ADR-002-production-file-storage-architecture.md`](../../../decisions/architecture/ADR-002-production-file-storage-architecture.md)
- [`ADR-003-retail-payment-orchestration-boundary.md`](../../../decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md)
- [`ADR-004-surface-boundary-topology.md`](../../../decisions/architecture/ADR-004-surface-boundary-topology.md)

Candidate context:

- [`2026-07-30-niuva-mvp-prd.md`](2026-07-30-niuva-mvp-prd.md)
- [`2026-07-30-niuva-mvp-decision-packet.md`](2026-07-30-niuva-mvp-decision-packet.md)
- [`2026-07-16-retail-order-checkout-foundation-design.md`](2026-07-16-retail-order-checkout-foundation-design.md)

Current implementation evidence only:

- `frontend/src/App.js`
- `frontend/src/pages/retail/RetailCatalogPage.jsx`
- `frontend/src/pages/retail/RetailProductPage.jsx`
- `frontend/src/pages/operational/ClientDashboard.jsx`
- `frontend/src/pages/operational/NewOrder.jsx`
- `frontend/src/pages/operational/OrderDetail.jsx`
- `frontend/src/pages/admin/AdminLayout.jsx`
- `frontend/src/lib/permissions.js`
