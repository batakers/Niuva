# QA-02 — Accessibility and complete-state validation matrix

**Status:** Candidate artifact validation with bounded source-pilot evidence —
not a complete runtime or readiness assertion
**Selected SHA:** `814a46329b8de7775c2de8b1ee34536d73df63e1`
**Scope:** One calibration flow per surface, mapped to DS-02–DS-05 contracts
**Authority:** Niuva canonical reading order, complete-state grammar, WCAG
floors in `DESIGN_BRIEF.md`, and current component tests as evidence

## Evidence boundary

The matrix evaluates whether each blueprint artifact names the semantics,
interaction, and recovery behavior required for a later implementation. It is
not an axe report, browser test, screen-reader session, or implementation
claim. No application source changed in this pass; runtime checks remain
required before G4.

## Shared accessibility contract

| Requirement | Public Inquiry | Commerce catalog/detail | Account/Auth | Operations queue/detail | Evidence status |
| --- | --- | --- | --- | --- | --- |
| Landmarks and heading order | Form and success are named regions; one task heading | Catalog/detail responsibility is explicit | Auth shell and owned record headings are separate | Queue/detail work areas are separate | **Pass in artifact** |
| Label, name, role, value | Visible labels for all Inquiry fields; status text not color-only | Filters, product options, and availability have names | Login/recovery controls and destination context are named | Queue controls, row actions, and status adapters are named | **Pass in artifact** |
| Keyboard order and focus | Summary/field focus, preserved values, post-success next action | Filter reset/load-more and detail return are ordered | Safe return and recovery links are deterministic | Queue/detail return and permission states are deterministic | **Pass in artifact** |
| Touch and 44px target | Mobile controls remain actionable | Filter and product controls remain reachable | Auth actions meet general mobile target | Queue actions do not depend on pointer hover | **Contract; runtime hold** |
| Focus return | Validation and success context return to task | Reset/load-more returns to result context | Reauthentication returns to owned step | Queue/detail return preserves queue context | **Pass in artifact** |
| Contrast/color independence | Critical success/failure is visible text plus status | Availability is not color-only | Error and permission are not color-only | Role/status is not color-only | **Pass in artifact** |
| Reduced motion | No spatial motion required for UUID or failure | Static catalog/detail hierarchy remains complete | Auth/recovery state is immediate | Operational state remains legible | **Pass in artifact** |
| Loading/bootstrap | Submit label and in-page status; duplicate submit blocked | Collection skeleton mirrors final hierarchy | Auth submit/recovery status retains task label | Queue load state retains work context | **Pass in artifact** |
| Empty | No inquiry-result ambiguity; next owned action named | No products explains authorized next step | No owned records explains scope | Empty queue distinguishes no work from failure | **Pass in artifact** |
| Validation/system error | Field errors distinct from persistence/provider failure | Filter/config errors distinct from unavailable data | Non-enumerating auth/recovery failure | Dependency failure does not invalidate valid fields | **Pass in artifact** |
| Conflict/stale | Uncertain persistence reconciles before retry | Stale price/file/eligibility requires revalidation | Expired session requires reauthentication | Stale queue/detail requires authoritative refresh | **Pass in artifact** |
| Permission/forbidden | Not applicable to public entry; protected request remains absent | Checkout authority is not implied | Destination and role are separated | Route visibility is not authorization | **Pass in artifact** |
| Expired/offline/uncertain | Inquiry outcome uncertainty is explicit; no duplicate retry | Unavailable data and quote uncertainty stay separate | Expired session and recovery remain explicit | Provider/state uncertainty remains domain-owned | **Pass in artifact** |
| Recovery and success | UUID names what persisted; WhatsApp appears only afterward | Next action names discovery or revalidation | Owned return is preserved | Queue/detail action and audit context remain visible | **Pass in artifact** |

## Calibration flow evidence

1. **Public:** `prototypes/public/CONTACT_INQUIRY/` covers ready, validation,
   submitting, dependency failure, offline/uncertain, recovery, UUID success,
   and optional post-persistence WhatsApp.
2. **Commerce:** `wireframes/commerce/RETAIL_CATALOG_STATES.md` and
   `wireframes/commerce/RETAIL_PRODUCT_DETAIL.md` distinguish discovery,
   unavailable, stale, and account/authority boundaries.
3. **Account/Auth:** `prototypes/account/OWNED_ORDER_FLOW/` plus
   `wireframes/auth/LOGIN_SAFE_RETURN.md` cover owned projection and bounded
   safe return.
4. **Operations:** `prototypes/operations/INQUIRY_QUEUE_DETAIL/` covers role
   projection, queue/detail return, permission, conflict, and history.

## Findings and dispositions

No P0/P1 semantic or complete-state gap is introduced by the artifacts. The
runtime evidence line remains held for the unimplemented rows. The merged
Account/Auth and Operations pilots now have bounded axe, keyboard, reduced
motion, responsive, and focus smoke evidence attached to their exact commits;
screen-reader sessions, contrast measurement, server behavior, and production
telemetry remain outside this record. A later source pilot must attach its own
results to its exact SHA and must not reuse this matrix as general proof.

## Bounded source-pilot accessibility addendum

| Pilot | Exact evidence | Measured accessibility result | Remaining hold |
| --- | --- | --- | --- |
| `AUTH-01` | PR [#288](https://github.com/batakers/Niuva/pull/288), source `18821fd` | ID/EN × 320/390/1440; Axe 0 across login/recovery routes; keyboard smoke reached the site-return control; reduced-motion state remained static | Full screen-reader and contrast review, backend/session enforcement, and readiness remain held |
| `OPS-01` | PR [#290](https://github.com/batakers/Niuva/pull/290), source `d5f6877` | ID/EN × 390/768/1024/1440; 32/32 mocked-API cases had no overflow, page error, or serious/critical Axe finding | Full screen-reader and contrast review, backend authorization/projection, and readiness remain held |

## Self-review

- [x] All required state classes are represented, including uncertain,
  conflict, expired, offline, recovery, and success.
- [x] Critical feedback is required in-page and not only in toast/live region.
- [x] Public, Commerce, Account/Auth, and Operations have distinct contracts.
- [x] Reduced-motion and keyboard/focus behavior are explicit.
- [x] Runtime checks are honestly marked pending rather than inferred.

**Self-review result:** Pass with bounded browser/Axe evidence recorded for
`AUTH-01` and `OPS-01`; assistive-technology and server-enforcement evidence
remain held for later source gates.
