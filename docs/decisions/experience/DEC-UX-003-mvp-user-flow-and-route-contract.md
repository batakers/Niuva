# DEC-UX-003 — MVP User Flow and Canonical Route Contract

ID: `DEC-UX-003`
Status: **Approved Decision — Documentation Amendment; No Implementation Authority**
Decision date: 31 July 2026; amended 8 and 11 August 2026
Decision owner: Product decision authority
Decision source: Explicit user approval of `NUF-R01` through `NUF-R12` on
31 July 2026, including the approved refinements to `NUF-R08` and `NUF-R09`
and explicit approval of the B2B Form + WhatsApp documentation amendment on
8 August 2026. The owner reviewed the remediated Public route-localization
packet and explicitly authorized its documentation-only canonical promotion on
11 August 2026.
Scope: localized MVP Public marketing routes and aliases, Retail
account/configuration/request/offer/checkout and Order destinations, public B2B
inquiry intake, legacy-route treatment, and Admin Studio Retail queue ownership
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

The 11 August 2026 amendment makes unprefixed Indonesian and `/en`-prefixed
English URLs the canonical Public marketing route family. It preserves former
Public paths as compatibility redirects, keeps downstream Retail routes
unprefixed, and records project-detail localization only as a reserved naming
direction. It does not activate routes or multilingual runtime behavior.

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

### Public canonical routes, locales, and aliases

The 11 August amendment supersedes the former canonical use of
`/capabilities` and `/projects` without deleting its history. The active
documentation contract is:

| Page responsibility | Indonesian | English |
|---|---|---|
| Homepage | `/` | `/en` |
| Company and approach | `/tentang` | `/en/about` |
| Service overview | `/layanan` | `/en/services` |
| Project archive | `/proyek` | `/en/projects` |
| B2B inquiry and contact | `/kontak` | `/en/contact` |
| Retail entry | `/retail` | `/en/retail` |
| FAQ | `/faq` | `/en/faq` |
| Privacy | `/privasi` | `/en/privacy` |

All canonical route strings are lowercase. The service navigation label is
`Layanan` in Indonesian and `Services` in English. A conventional globe plus
the visible active code `ID` or `EN` opens explicit language choices; it is not
an unexplained globe-only control.

Compatibility paths use a one-hop permanent HTTP `308` redirect at the public
delivery boundary:

| Superseded path | Canonical destination |
|---|---|
| `/about` | `/tentang` |
| `/capabilities` | `/layanan` |
| `/services` | `/layanan` |
| `/projects` | `/proyek` |
| `/portfolio` | `/proyek` |
| `/contact` | `/kontak` |
| `/privacy` | `/privasi` |
| `/en/capabilities` | `/en/services` |

A compatibility path preserves applicable query and browser-fragment context,
owns no content, CMS record, sitemap entry, canonical tag, or independent
analytics identity, and resolves directly to its final destination. Exact
server, edge, or hosting mechanics remain separately gated.

For a complete translated pair:

- Indonesian markup uses `lang="id"` and `hreflang="id"`; English markup uses
  `lang="en"` and `hreflang="en"`;
- each localized page is self-canonical and references its counterpart
  reciprocally;
- `x-default` points to the Indonesian route with the same content
  responsibility, while only the Homepage pair uses `/` as `x-default`;
- both localized canonical URLs enter the applicable sitemap; and
- the language selector links the exact counterpart without automatic IP,
  browser-language, or inferred-location redirection.

System, navigation, form, error, privacy, and conversion copy must be complete
in Indonesian and English before the language switch activates. Indonesian CMS
content is required and English is optional. If English content is missing, the
English route may show Indonesian with the visible notice `English translation
belum tersedia`; it emits `noindex,follow`, points canonical metadata to the
same-content Indonesian route, stays out of the English sitemap and
`hreflang` set, and never uses automatic machine translation. When English is
ready, the route becomes self-canonical and enters the reciprocal annotation
and sitemap set.

The same explicit language preference applies across Public, Retail, Login,
customer, and Admin surfaces. Private and operational routes remain unprefixed
and `noindex`. The existing `/retail/products/:slug`,
`/retail/products/:slug/configure`, Request, Offer, checkout, Order, and other
downstream Retail routes also remain unprefixed and retain their current route
and lifecycle responsibilities. This amendment makes no multilingual SEO or
indexability decision for those retained Retail routes.

The candidate prefixes `/proyek/:slug` and `/en/projects/:slug`, using one
stable slug for one project record, are a reserved naming direction only. They
do not create active route ownership, navigation, CMS URL output, `hreflang`,
sitemap, analytics, or implementation authority.

`/kontak` owns the structured public B2B/partnership inquiry, with
`/en/contact` as its translated counterpart. It is available without login and
persists an Inquiry before showing an optional WhatsApp continuation using the
existing approved public-settings destination. The Inquiry UUID is the MVP
customer reference. The primary project-discussion CTA enters this form-first
flow. WhatsApp remains a secondary contact action for a visitor who is not
ready to submit a brief.

Exact mega-menu composition, CTA copy beyond localized route labels, mobile
layout, redirect infrastructure, and route implementation remain separate UX
and technical work.

### Public B2B inquiry amendment

The approved MVP flow is:

```text
/kontak#form-konsultasi or /en/contact#form-konsultasi
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
| `NUF-R02` | Canonical localized Public marketing routes use unprefixed Indonesian and `/en`-prefixed English paths; `/layanan` and `/proyek` replace the former canonical `/capabilities` and `/projects`; legacy paths redirect permanently in one hop; project-detail prefixes remain reserved; downstream Retail routes remain unprefixed | This decision |
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
- Keeping English route slugs as the canonical Indonesian Public route family,
  or localizing only one marketing path, is not selected.
- Translating each individual project slug is not selected; if project detail
  is later activated, one stable slug identifies one underlying project record.
- Sending every `x-default` annotation to the Homepage is not selected;
  fallback responsibility stays with the same content pair.
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
- The localized Public route amendment requires a complete old-to-new URL map,
  permanent delivery-boundary redirects, updated internal links, canonical and
  language annotations, sitemap output, direct-load verification, and
  migration monitoring before activation.
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
- [`CONFIRMED_CANDIDATE_DESIGN_BRIEF.md`](../../implementation/specs/candidates/2026-08-11-niuva-stage-b-visual-world-exploration/CONFIRMED_CANDIDATE_DESIGN_BRIEF.md)
- [`PUBLIC_ROUTE_LOCALIZATION_AMENDMENT_PACKET.md`](../../implementation/specs/candidates/2026-08-11-niuva-stage-b-visual-world-exploration/PUBLIC_ROUTE_LOCALIZATION_AMENDMENT_PACKET.md)
