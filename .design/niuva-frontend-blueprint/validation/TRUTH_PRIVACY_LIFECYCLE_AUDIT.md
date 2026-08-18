# QA-03 — Truth, privacy, lifecycle, and authorization audit

**Status:** Candidate artifact audit — not domain or production approval
**Selected SHA:** `814a46329b8de7775c2de8b1ee34536d73df63e1`
**Scope:** Wave B calibration set plus COM-03 quote boundary
**Authority:** canonical Niuva reading order, `DEC-UX-003`, `DEC-UX-004`,
`DEC-OFFER-01`, `DEC-RT-02`, `DESIGN_BRIEF.md`, and current source/tests

## Audit matrix

| Surface/artifact | Route or responsibility | Durable owner | Required truth/privacy/lifecycle rule | Evidence in artifact | Finding/disposition |
| --- | --- | --- | --- | --- | --- |
| `PUB-03` Contact Inquiry | `/kontak` and `/en/contact` | Inquiry | Form-first; exact consent; persist `new`; show existing UUID; optional user-clicked WhatsApp only afterward; no public upload | README, state matrix, plate | **Pass; retain as candidate** |
| `COM-01` catalog | `/retail` and `/en/retail` | Retail discovery/request | Discovery is not guest checkout; price, stock, ETA, eligibility remain authoritative | Catalog hierarchy and state plate | **Pass; runtime/data proof held** |
| `COM-02` product detail | Retail product responsibility | Retail configuration | File, material, price, and eligibility require account/server revalidation before authority | Product-detail contract | **Pass; source gate required** |
| `COM-03` transaction/quote boundary | Future Retail Request/Offer/Order handoff | Retail Request, Assisted Retail Offer, Retail Order | `quote_required` creates no Order, reservation, payment attempt, paid state, or checkout total; context is preserved | `flows/commerce/TRANSACTION_QUOTE_BOUNDARY.md` | **Pass; no capability activation** |
| `AUTH-01/02/03` auth | Customer/staff login, recovery, invitation | Session, Customer, staff authority | No identity-provider activation; non-enumerating recovery; safe return is allowlisted | Login/recovery/invitation wireframes plus bounded `AUTH-01` source evidence | **Pass; provider/identity/server gate held** |
| `ACC-01` account | Owned dashboard/order detail | Customer and owned resources | Projection excludes internal cost, margin, supplier, profit, and internal notes | Projection checklist and flow | **Pass; server enforcement remains required** |
| `OPS-01` Inquiry queue/detail | Operations Inquiry work | Inquiry and role-owned queue | Role projection, permission, conflict, and audit history are visible without inventing access | Role projection matrix plus bounded `OPS-01` source evidence | **Pass; backend authorization unchanged** |
| `OPS-03/04/05` work families | Quotes/Projects, Retail Orders, Production | Domain-owned operational records | Separate resources and states; provider/payment/production truth is not a UI promise | Route-family wireframes | **Pass; implementation separately gated** |
| `EXP-03` evidence language | Public and Commerce visual evidence | Content owner and factual record | Real approved assets require provenance; supporting/stock/generated visuals cannot prove Niuva work | Evidence visual language | **Pass; no asset migration** |
| Locale behavior | Public translated pairs and private unprefixed routes | Route/content ownership | Indonesian-first; exact counterpart; no invented `/en` private route; incomplete English shows approved notice | IA and route matrix | **Pass; delivery contract held** |
| Uncertain irreversible effects | Inquiry retry, payment/order/reservation contexts | Domain lifecycle owner | Reconcile authoritative state before retry; never fabricate persistence or duplicate effects | State and quote boundary docs | **Pass; runtime/API proof held** |

## Protected data and capability checks

- Public artifacts do not expose private upload, payment, reservation,
  quotation, production capacity, or automatic WhatsApp behavior.
- Retail artifacts preserve the account boundary and do not turn approximate
  UI state into authoritative price, inventory, eligibility, or ETA.
- Account artifacts describe owned records only and explicitly exclude internal
  operational fields from customer projection.
- Operations artifacts describe role-aware presentation; a visible route or
  control is never treated as permission.
- Evidence artifacts separate factual project evidence from explanatory or
  generated imagery and require owner/rights/caption/alt-text provenance.

## Findings and dispositions

No P0/P1 truth, privacy, lifecycle, or authorization conflict is present in the
candidate artifacts. Holds are deliberate: server-side enforcement, API/schema
state machines, provider behavior, storage, payment, and delivery evidence
remain outside this Goal. A later source pilot must re-run the relevant audit
against the exact implementation SHA.

## Bounded source-pilot addendum

- `AUTH-01` PR [#288](https://github.com/batakers/Niuva/pull/288) retained
  customer/staff separation, bounded customer return, non-enumerating recovery,
  and no provider/registration change. Browser fixtures and client tests do not
  prove server session or identity enforcement.
- `OPS-01` PR [#290](https://github.com/batakers/Niuva/pull/290) retained
  role-filtered navigation, permission checks, resource-specific status/history,
  and no backend/API change. Mocked API browser evidence does not prove backend
  authorization or customer/internal projection.

The addendum narrows the remaining holds; it does not close them.

## Self-review

- [x] Inquiry persistence, UUID, consent, WhatsApp ordering, and no-upload rule
  are explicit.
- [x] Retail account, `quote_required`, mixed-resource, and manual-path
  boundaries are not collapsed.
- [x] Customer-safe projection and Operations authorization boundaries are
  named.
- [x] Evidence provenance and supporting-visual separation are included.
- [x] No artifact claims provider, API, schema, payment, or production success.

**Self-review result:** Pass with bounded client evidence recorded for
`AUTH-01` and `OPS-01`; server/runtime enforcement and provider gates remain
held for their owning decisions.
