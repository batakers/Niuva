# DEC-UX-003 — MVP User Flow and Canonical Route Contract

ID: `DEC-UX-003`
Status: **Approved Decision — Documentation Amendment; No Implementation Authority**
Decision date: 31 July 2026; amended 8 August 2026
Decision owner: Product decision authority
Decision source: Explicit user approval of `NUF-R01` through `NUF-R12` on
31 July 2026, including the approved refinements to `NUF-R08` and `NUF-R09`
and explicit approval of the B2B Form + WhatsApp documentation amendment on
8 August 2026.
Scope: MVP public aliases, Retail account/configuration/request/offer/checkout
and Order destinations, public B2B inquiry intake, legacy-route treatment, and
Admin Studio Retail queue ownership
Related architecture: `DEC-ARCH-01` / `ADR-004`

## Context

The approved product model has one Niuva website and one operational platform
with separate Retail and Business/B2B customer journeys. The MVP product
decisions also require authenticated Retail ownership, a private and versioned
Assisted Retail Offer, provider-neutral checkout, customer production tracking,
recipient-scoped notifications, and durable after-sales handling.

The repository already contains public, Retail discovery, customer, legacy
Order, B2B, and Admin Studio routes. It does not yet contain every route needed
by the approved transactional journey. Several current paths also overlap or
act as compatibility surfaces. A canonical route contract is therefore needed
before prototype validation or technical-contract planning.

The narrowed MVP also requires a low-friction B2B and partnership entry point.
The public inquiry may begin without login, must be recorded before any
follow-up handoff, and remains manually operated. This amendment records the
approved form-first flow with an optional user-clicked WhatsApp continuation.

`ADR-004` separately selects the MVP delivery topology. This decision defines
route ownership within that topology; it does not treat a route as an
authorization boundary.

## Decision

### Route and security principles

1. One durable user intent or owned resource has one canonical route.
2. Compatibility paths redirect to their canonical public destination rather
   than owning duplicate CMS content or analytics identity.
3. Customer resources require authenticated ownership. Admin resources require
   backend role, permission, and domain scope. Route visibility is never the
   security boundary.
4. Authentication continuation is same-origin and allowlisted. It carries only
   non-sensitive draft context and is followed by full server revalidation.
5. Loading, stale, expired, conflict, permission, retry, and unavailable states
   normally remain inside the route that owns the durable task or resource.
6. Approval of a route does not imply that its page, API, schema, provider, or
   operational capability exists or is active.

### Public canonical routes and aliases

- `/capabilities` is the canonical capability/service overview.
- `/services` is a permanent compatibility redirect to `/capabilities` and
  must not own separate content or a separate CMS record.
- `/projects` is the canonical project/portfolio proof surface.
- `/portfolio` is a permanent compatibility redirect to `/projects` and must
  not own separate content or a separate CMS record.
- `/`, `/about`, `/contact`, `/privacy`, `/faq`, `/retail`, and
  `/retail/products/:slug` retain their current route responsibilities.
- `/contact` owns the structured public B2B/partnership inquiry. It is
  available without login and persists an Inquiry before showing an optional
  WhatsApp continuation using the existing approved public-settings
  destination. The Inquiry UUID is the MVP customer reference.
- The primary project-discussion CTA enters the form-first flow. WhatsApp
  remains a secondary contact action for a visitor who is not ready to submit
  a brief.
- Exact navigation composition, CTA copy, mobile treatment, and redirect
  implementation mechanics remain separate UX and technical work.

### Public B2B inquiry amendment

The approved MVP flow is:

```text
/contact#form-konsultasi
  -> public form without login
  -> persist Inquiry with status `new`
  -> safe acknowledgement with the existing Inquiry UUID
  -> optional user-clicked WhatsApp continuation
  -> manual operator triage and follow-up
  -> existing B2B Quote/Project conversion when appropriate
```

The form uses the existing Inquiry contract: `company`, `pic_name`,
`pic_email`, required `pic_phone`, `need`, `timeline`, and `brief`. The
customer-safe response may echo the submitter's own fields, but never exposes
operator notes, triage history, provider payloads, private files, cost, or
margin. The approved privacy checkbox copy is:

> Saya setuju Niuva menggunakan data ini untuk meninjau inquiry dan
> menghubungi saya terkait kebutuhan yang saya kirim. Data tidak digunakan
> untuk marketing tanpa persetujuan terpisah.

Public raw-file upload remains excluded from this MVP. An operator may request
files later through an approved private storage process. Inquiry statuses remain
`new -> reviewed -> contacted -> converted`, with permitted rejection
transitions and no new quotation/project statuses added to the Inquiry.

The customer-facing expectation is immediate durable acknowledgement and a
first human response target of one working day. The target is owned by `Niuva
Operations` and uses Monday–Friday, 09.00–17.00 WIB, excluding public holidays;
it is not a quotation, price, or delivery guarantee. WhatsApp is not an
automatic notification, webhook, campaign, retry-worker, or SLA-reminder
channel. This amendment does not add a customer B2B portal to the narrowed
MVP; organization-account quotation/project access remains a later platform
surface.

### Retail account and notification namespace

- `/dashboard` remains the Retail account namespace for MVP. No `/account`
  namespace migration is introduced.
- `/dashboard/notifications` is the canonical authenticated customer
  notification-feed route.
- `/register` is the canonical customer account-creation route required by the
  account-required Retail journey.
- `/register` must remain inactive until a separately approved registration,
  verification, abuse-control, recovery, and activation contract is satisfied.
- Existing login and recovery routes remain compatible with the shared
  customer-authentication boundary.

### Retail configuration, request, offer, checkout, and Order routes

- A durable `/retail/cart` route was not a separate `NUF-R01` through
  `NUF-R12` selection. The non-authoritative pre-auth cart behavior remains
  governed by `DEC-RT-02`, while exact cart route/state ownership remains part
  of the later checkout technical contract.
- `/retail/products/:slug/configure` owns the Simple and Detailed product
  configuration task for the originating published product.
- `/retail/requests/:requestId` owns the authenticated `quote_required`
  request, its safe status/reason, retained context, and next action.
- `/retail/offers/:offerId` owns the authenticated active or historical
  Assisted Retail Offer version and its allowed accept/decline behavior.
- Request and Offer remain separate resources because their actions,
  versioning, and terminal states differ. Neither creates an Order,
  reservation, payment attempt, or paid state.
- `/retail/checkout` is the provider-neutral checkout route. Provider actions
  must not become the core route contract.
- After Order creation, provider return, payment state, production tracking,
  ETA, fulfillment, and customer history resolve through the owned
  `/orders/:id` route.
- `DEC-AFTER-01` requires durable authenticated customer actions for revision,
  cancellation, and complaint/case handling. The candidate paths
  `/orders/:id/file-revision`, `/orders/:id/cancellation`,
  `/orders/:id/complaints/new`, and `/orders/:id/complaints/:caseId` were not
  separate `NUF-R01` through `NUF-R12` selections; their exact route/state
  ownership remains part of the later after-sales technical contract.

### Legacy customer `/order`

`/order` must never be reactivated as the new create-order or checkout route.

- Before the transactional MVP is activated, it retains a safe unavailable
  compatibility state.
- When the approved transactional Retail journey is activated, `/order`
  redirects to `/retail`.
- Historical Order reads remain governed by `DEC-ACCESS-003`.
- Legacy Order and manual-transfer mutations remain disabled under
  `DEC-ACCESS-003` and `DEC-PAY-02`.
- Redirect timing and source implementation require separate authorization.

### Admin Studio Retail routes

- `/admin/retail-orders` and `/admin/retail-orders/:id` are the only active
  Retail Order workbench and detail routes.
- `/admin/orders` is retained temporarily as a clearly labelled, read-only
  legacy Order archive. It is not an active Retail queue, must not expose
  mutation controls, and must not be redirected while that would hide distinct
  historical records.
- Retirement of `/admin/orders` requires a separately approved retention,
  migration or historical-access, customer-communication, validation, and
  rollback procedure. No automatic sunset, rewrite, or deletion is approved.
- `/admin/retail-requests` is the Retail `quote_required` and Assisted Retail
  Offer queue.
- `/admin/retail-requests/:id` owns file/analysis review, routing, immutable
  offer versions, approval, and the customer-safe result. This work must not be
  merged into the B2B Quote aggregate.
- `/admin/retail-cases` and `/admin/retail-cases/:caseId` own cancellation,
  complaint, reprint/replacement, refund, and return work.
- Exact Admin navigation placement and route-to-permission mappings remain
  separately gated. Backend authorization remains mandatory.

## Approved NUF Mapping

| Candidate ID | Approved selection | Canonical authority |
|---|---|---|
| `NUF-R01` | Single-application, single-origin, route-based MVP topology | `DEC-ARCH-01` / `ADR-004` |
| `NUF-R02` | Canonical `/capabilities` and `/projects`; compatibility redirects from `/services` and `/portfolio` | This decision |
| `NUF-R03` | Retain `/dashboard` for MVP | This decision |
| `NUF-R04` | Use `/retail/products/:slug/configure` | This decision |
| `NUF-R05` | Separate owned Retail Request and Assisted Retail Offer routes | This decision |
| `NUF-R06` | Use provider-neutral `/retail/checkout` and return to `/orders/:id` | This decision |
| `NUF-R07` | Use `/dashboard/notifications` | This decision |
| `NUF-R08` | Keep safe `/order` compatibility until activation, then redirect to `/retail`; never reactivate legacy creation | This decision |
| `NUF-R09` | Make `/admin/retail-orders` authoritative; retain `/admin/orders` temporarily as a read-only legacy archive | This decision |
| `NUF-R10` | Use one Retail Request queue and manage immutable offer versions inside request detail | This decision |
| `NUF-R11` | Use a dedicated Retail after-sales case queue and detail | This decision |
| `NUF-R12` | Reserve `/register` for customer account creation, with activation contract still required | This decision |

## Rejected or Deferred Alternatives

- Subdomain-separated or separately deployed frontend surfaces are not selected
  for MVP. Reopening them requires a superseding architecture decision.
- `/account` is not introduced as an alternative MVP namespace.
- Request and Offer are not collapsed into an Order or into one ambiguous
  route.
- Assisted Retail Offer is not merged into B2B Quote.
- `/order` is not reused for checkout.
- `/admin/orders` and `/admin/retail-orders` are not retained as two active
  workbenches.
- Provider-specific payment paths, public file URLs, arbitrary return URLs,
  guest checkout/tracking, customer `.gcode`, WhatsApp automation, a free-form
  CMS, and a broad Admin audit/user-directory surface remain excluded by their
  governing decisions. The user-clicked B2B WhatsApp continuation above is not
  WhatsApp automation and does not amend the Retail notification boundary.

## Consequences and Activation Gates

- `ADR-004` is accepted as `DEC-ARCH-01`; the MVP no longer has an open
  route/subdomain/separate-application selection.
- Prototype and technical-contract work may use these route names as approved
  product and experience inputs.
- Customer registration/verification, exact deep-link/reference allowlists,
  Admin route-to-permission mappings, redirect mechanics, API/state/schema
  contracts, provider selections, runtime WhatsApp-settings verification, and
  legacy-retirement procedure remain open. The approved product target does
  not authorize those implementation or activation steps.
- Current source remains implementation evidence only. Missing routes are not
  considered implemented, and existing routes are not considered complete or
  active merely because they are present.
- This decision does not authorize source-code or schema changes, migration,
  provider activation, deployment, production readiness, or go-live.

## Related Authority

- [`NIUVA_MASTER_SPEC.md`](../../NIUVA_MASTER_SPEC.md)
- [`ADR-004-surface-boundary-topology.md`](../architecture/ADR-004-surface-boundary-topology.md)
- [`DEC-UX-001-unified-homepage-b2b-primary.md`](DEC-UX-001-unified-homepage-b2b-primary.md)
- [`DEC-OPS-001-admin-studio-operational-direction.md`](DEC-OPS-001-admin-studio-operational-direction.md)
- [`DEC-RT-02-retail-account-required-checkout.md`](../product/DEC-RT-02-retail-account-required-checkout.md)
- [`DEC-OFFER-01-retail-offer-file-and-quote-routing.md`](../product/DEC-OFFER-01-retail-offer-file-and-quote-routing.md)
- [`DEC-ACCESS-003-legacy-order-compatibility-and-customer-projection.md`](../access/DEC-ACCESS-003-legacy-order-compatibility-and-customer-projection.md)
- [`DEC-DATA-003-notification-schema-retention-and-delivery-boundary.md`](../product/DEC-DATA-003-notification-schema-retention-and-delivery-boundary.md)
- [`PRD_Platform_Niuva_v2_1_retail_b2b.md`](../../references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md)
- [`2026-08-07-niuva-mvp-prd-promotion-amendment-b2b-form-whatsapp.md`](../../implementation/specs/candidates/2026-08-07-niuva-mvp-prd-promotion-amendment-b2b-form-whatsapp.md)
- [`2026-07-31-niuva-mvp-user-flow-and-route-contract.md`](../../implementation/specs/candidates/2026-07-31-niuva-mvp-user-flow-and-route-contract.md)
