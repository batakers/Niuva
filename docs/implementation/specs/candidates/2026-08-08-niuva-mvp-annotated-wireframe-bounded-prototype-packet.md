# Candidate MVP Annotated Wireframe & Bounded Interactive Prototype Packet

**Status:** Candidate — Context Only — not canonical and not implementation authority

**Date:** 8 August 2026

**Revision:** Remediation pass after formal critique; pending independent re-review

**Baseline:** `origin/main` at
`a61cc2be6a10a4dd5e04d4343cf9d293404a8f30`

**Parent candidate:**
`docs/implementation/specs/candidates/2026-08-08-niuva-mvp-ux-ui-design-packet.md`

**Purpose:** Translate the reviewed UX/UI contract into annotated frames,
prototype-only transitions, synthetic fixtures, and validation scenarios without
changing product authority, routes, source, APIs, schemas, providers,
deployment, readiness, or go-live status.

## 1. Authority and boundary

Resolve conflicts in this order:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. The applicable approved decision or ADR
5. The applicable runbook
6. Current source and tests as implementation evidence
7. The parent Candidate MVP UX/UI Design Packet
8. This packet and any prototype built from it

This packet does not:

- promote or amend a canonical document;
- authorize a production route, source file, API, schema, migration, dependency,
  provider, or environment change;
- make a candidate cart or after-sales route canonical;
- activate registration, private upload, automatic calculation, checkout,
  payment, fulfillment, notification, or customer B2B portal capabilities;
- approve final customer copy, legal terms, commercial values, tax behavior,
  SLA, accessibility conformance, or Admin smartphone support;
- authorize a moderated session, deployment, production-readiness claim, or
  go-live action.

All values and transitions shown by a future prototype are simulation evidence,
not implementation evidence.

## 2. Maturity and identifier convention

This is a **prototype-planning artifact**. It is sufficiently detailed to build
one isolated, synthetic-data prototype, but no interactive prototype is created
or validated by this document alone.

Every identifier introduced here is a **packet-local candidate**:

- `WF-*` identifies an annotated wireframe/frame;
- `PT-*` identifies a prototype-only transition;
- `SCN-*` identifies a validation scenario;
- `FX-*` identifies a synthetic fixture; and
- `AN-*` identifies a visual or interaction annotation.

These identifiers are not routes, API names, backend enums, database IDs,
automated-test IDs, canonical requirements, or implementation tasks. Imported
`FLOW-*`, `UX-*`, and `AG-*` labels retain the authority declared by the parent
candidate; they gain no authority here.

Remediation inventory: 37 frame IDs (`WF-*`), 95 prototype transitions
(`PT-*`), 43 synthetic fixtures (`FX-*`), 44 validation scenarios (`SCN-*`),
and 12 annotation labels (`AN-*`).

## 3. Prototype objective and bounded scope

The prototype must answer five validation questions:

1. Can a prospect submit a form-first B2B Inquiry and understand that optional
   WhatsApp continuation occurs only after persistence?
2. Can a Retail customer distinguish fixed/eligible checkout from
   `quote_required`, Assisted Retail Offer, and no-commit recovery?
3. Can a customer understand authoritative checkout changes, payment
   uncertainty, factual production milestones, and after-sales next actions?
4. Can a non-IT operator find the correct queue, record, permission, conflict,
   approval, and recovery path without mixing Retail and B2B lifecycles?
5. Do the same task meanings survive 390px, 768px, 1024px, and 1440px
   composition without hidden actions or misleading state?

### 3.1 Included flow coverage

| Imported flow | Prototype coverage | Boundary |
| --- | --- | --- |
| `FLOW-B2B-01` | Homepage/capability entry, Inquiry form, validation, durable acknowledgement, optional WhatsApp | No public upload, quotation, or portal |
| `FLOW-RET-READY-01` | Ready Product discovery, non-authoritative cart behavior, authentication interruption, checkout, payment, Order | Exact durable cart route remains gated |
| `FLOW-RET-CUSTOM-01` | Simple/Detailed configuration, private-file simulation, analysis, eligible calculation | No real upload, scanner, slicer, or production profile |
| `FLOW-RET-QUOTE-01` | `quote_required`, retained Request, operator review, immutable Offer, accept/decline, checkout revalidation | Offer acceptance creates no Order/reservation/payment |
| `FLOW-PAY-UNCERTAIN-01` | Pending, uncertain, reconciliation-safe recovery, eventual terminal outcome | No real gateway or webhook |
| `FLOW-ORDER-01` | Four milestone variants, ETA range, exception, fulfillment, completion | No fake percentage, queue position, or live telemetry |
| `FLOW-AFTER-01` | Revision/cancellation/complaint entry, evidence, review, approval/rejection, remedy | Exact customer routes and technical aggregate remain gated |
| `FLOW-ADMIN-01` | Queue, detail, authorized action, validation/approval, conflict, history, next action | Exact IA, permissions, and smartphone support remain gated |

### 3.2 Supporting frame coverage

The reduced integrated CMS receives one conflict-and-recovery frame because a
single non-IT operator may also manage content. Inventory/restock alerts and
role-scoped notifications receive two small supporting frames. These are
supporting validation surfaces, not additional customer journeys.

### 3.3 Explicit exclusions

- Full production application or reusable UI-component implementation
- Real authentication, file storage, slicing, malware scanning, calculation,
  inventory reservation, payment, shipping, email, or WhatsApp integration
- Customer B2B Organization Portal
- Live printer telemetry, precise queue position, predictive capacity, and fake
  percentage progress
- Final information architecture for all Admin pages
- Final brand exploration, visual variants, animation exploration, and
  pixel-perfect CSS specification
- Final Indonesian/English legal, tax, refund, delivery, or accessibility claims
- Load, security, migration, deployment, and production-readiness evidence

## 4. Prototype mode contract

The prototype must separate product experience from review tooling.

| Mode | Audience | Visible chrome | Forbidden content |
| --- | --- | --- | --- |
| **Participant Mode** | Prospective customer or non-IT operator | Product-shaped navigation, a persistent neutral “Simulasi prototype” notice, and only controls the role would plausibly use | Evaluator instructions, expected answer, finding IDs, canonical citations, success hints, hidden-state selector |
| **Review Mode** | Product/UX/engineering reviewer | Annotation numbers, frame/flow IDs, authority/gate notes, viewport selector, scenario selector, reset, and event log | Real credentials, real customer data, provider secrets, or claims that a simulation is implemented |

Participant Mode is the only mode used for task-completion observation. Review
Mode may be used before or after a task to inspect annotations and reproduce a
fixture. Switching mode resets the selected scenario unless the validation plan
explicitly records otherwise.

For an operator task, Review Mode is a pre-task seed/reset control only. The
reviewer selects the exact role and fixture, then hands the scenario to
Participant Mode before the operator acts. Participant Mode retains the seeded
role-scoped controls and denied actions, but hides fixture IDs, annotations,
scenario selectors, event logs, and evaluator hints. Review Mode may be
re-entered only after the task for evidence capture or reset.

### 4.1 Global annotation legend

All `AN-*` labels below are packet-local candidates.

| Annotation | Meaning |
| --- | --- |
| `AN-01` | Surface identity and current role/context |
| `AN-02` | Current state and primary next action |
| `AN-03` | Secondary/back/correction action |
| `AN-04` | Field-adjacent validation plus error summary when needed |
| `AN-05` | Customer-safe system-of-record reference or immutable version |
| `AN-06` | Old/new authoritative delta requiring reconfirmation |
| `AN-07` | Ownership/privacy/permission-safe boundary |
| `AN-08` | Factual history, timestamp, actor-safe event, or milestone |
| `AN-09` | Visible conflict/reconciliation/recovery notice |
| `AN-10` | Review-only open-gate or authority annotation |
| `AN-11` | Meaningful dynamic status announcement and focus target |
| `AN-12` | Persistent simulation boundary; never shown as production status |

### 4.2 Participant role and mode matrix

Participant Mode never crosses roles silently. Review Mode may seed a fixture
or switch mode only through an explicit review control; switching resets the
selected scenario and emits a recorded prototype event.

| Participant role | Allowed surfaces/actions | Hidden or forbidden |
| --- | --- | --- |
| Public prospect | `WF-PUB-01/02`, `WF-B2B-01/02`, public Retail discovery | Private upload, owned Request/Offer/Order, operator notes, Review Mode IDs |
| Unauthenticated Retail visitor | Discovery, non-sensitive configuration/cart, `WF-AUTH-01` | Private file preview/upload, analysis, checkout, payment, tracking |
| Authenticated Retail customer | Owned Request/Offer/Order/Case, private configuration, checkout/payment recovery | Foreign records, internal cost/margin, operator approval controls |
| Granular operator | Role-appropriate queue/detail, draft/review/conflict/recovery, inventory/notification support after a Review Mode seed handoff | Actions outside the seeded capability; customer-only projection changes; reviewer chrome during task completion |
| `manager_approver` | Approved Offer approval and CMS direct publish when capability fixture allows | Silent approval, unrelated domain mutation, hidden audit event |
| Review-only evaluator | Review Mode annotations, fixture/state selector, viewport and event log | Participant task hints, real credentials, real data/provider claims |

The exact approved internal role IDs are listed in `FX-ADMIN-ROLE-CAPABILITY`;
the packet does not invent a new role taxonomy or authorize route permissions.

This seed handoff applies to every operator-observed branch: `PT-REQ-02/03`,
`PT-AFS-04/05/06`, `PT-ADM-00/01/02/03/03-DENY/04/05/07/08/09/10`,
`PT-CMS-00/01/02/03`, and `PT-STOCK-01`. Their Review Mode capability seed is
setup evidence, not the participant's task surface.

## 5. Frame inventory

Every `WF-*` identifier is packet-local. `Desktop` means the 1440px reference
composition; `Mobile` means the 390px reference composition. The 768px and
1024px transformations are defined in section 8. The inventory contains 37
frame IDs: 33 customer/operator flow states plus four supporting operational
and legacy-compatibility surfaces.

| Frame ID | Surface / state | Imported requirement or flow | Desktop | Mobile | Source evidence at baseline | Authority / gate |
| --- | --- | --- | --- | --- | --- | --- |
| `WF-PUB-01` | Unified Homepage path choice | `UX-FOUND-001`, `FLOW-B2B-01` | Yes | Yes | Existing | Canonical direction; exact CTA/mobile treatment open |
| `WF-PUB-02` | Capability → Inquiry continuation | `FLOW-B2B-01` | Yes | Yes | Existing | Canonical route; final composition open |
| `WF-B2B-01` | Inquiry form default/validation | `UX-B2B-001` | Yes | Yes | Partial | Form-first amendment canonical; source alignment incomplete |
| `WF-B2B-02` | Durable acknowledgement + optional WhatsApp | `UX-B2B-001`, `UX-B2B-002` | Yes | Yes | Partial | WhatsApp destination from public settings; no automation |
| `WF-RET-01` | Retail catalog and Ready Product detail | `FLOW-RET-READY-01` | Yes | Yes | Existing discovery | Transaction inactive |
| `WF-AUTH-01` | Authentication interruption/continuation | `UX-RET-001` | Yes | Yes | Login existing; registration missing | Registration activation gated |
| `WF-CART-01` | Non-authoritative cart behavior | `FLOW-RET-READY-01` | Yes | Yes | Missing | Exact route/state owner TBD; frame is conceptual only |
| `WF-CFG-01` | Custom Print Simple/Detailed configuration | `FLOW-RET-CUSTOM-01` | Yes | Yes | Missing | Route canonical; implementation/activation gated |
| `WF-CFG-02` | File validation/analysis in progress or failure | `FLOW-RET-CUSTOM-01` | Yes | Yes | Missing | All processing simulated |
| `WF-CFG-03` | Eligible calculated result | `UX-RET-002` | Yes | Yes | Missing | Synthetic values; no commercial activation |
| `WF-REQ-01` | `quote_required` retained Retail Request | `FLOW-RET-QUOTE-01` | Yes | Yes | Missing | Canonical route; technical contract gated |
| `WF-OFFER-01` | Assisted Retail Offer: offered | `UX-OFFER-001` | Yes | Yes | Missing | Immutable version; expiry value remains a fixture, not policy |
| `WF-OFFER-02` | Offer accepted/declined/expired/superseded | `UX-OFFER-001` | Yes | Yes | Missing | Acceptance has no Order/reservation/payment side effect |
| `WF-CHK-01` | Authoritative checkout review | `UX-CHECKOUT-001`, `UX-RES-001` | Yes | Yes | Missing | Tax/provider/activation gated |
| `WF-CHK-02` | Stale price/ETA/stock/rate reconfirmation | `UX-CHECKOUT-001` | Yes | Yes | Missing | Delta is synthetic but behavior canonical |
| `WF-CHK-03` | Fulfillment provider-unavailable fallback | `DEC-FUL-01`, `UX-CHECKOUT-001` | Yes | Yes | Missing | Pickup/quote-required fallback is simulated; no provider activation |
| `WF-PAY-01` | Payment pending/action required | `FLOW-PAY-UNCERTAIN-01` | Yes | Yes | Missing | Provider-neutral simulation |
| `WF-PAY-02` | Payment uncertain/reconciliation required | `UX-PAY-001` | Yes | Yes | Missing | No duplicate pay action |
| `WF-PAY-03` | Payment succeeded/failed/cancelled/expired terminal outcome | `FLOW-PAY-UNCERTAIN-01` | Yes | Yes | Missing | Reservation is consumed or released exactly once; terminal fixture only |
| `WF-ORD-01` | Owned Order summary and next action | `FLOW-ORDER-01` | Yes | Yes | Partial legacy/read-only | New Retail lifecycle inactive |
| `WF-ORD-02` | Factual milestone and ETA history | `UX-ORDER-001` | Yes | Yes | Partial legacy/read-only | Four canonical variants only |
| `WF-ORD-03` | ETA overdue/pickup overdue fulfillment exception | `FLOW-ORDER-01`, `DEC-FUL-01` | Yes | Yes | Partial legacy/read-only | No automatic cancellation/refund |
| `WF-ORD-04` | File/production/payment/after-sales exception recovery | `FLOW-ORDER-01`, `UX-AFTER-001` | Yes | Yes | Missing | Exception-specific owner/action; no automatic remedy |
| `WF-AFS-01` | After-sales intake/eligibility | `UX-AFTER-001` | Yes | Yes | Missing | Exact route/API/terms gated |
| `WF-AFS-02` | Case review/approval/execution/outcome | `UX-AFTER-001` | Yes | Yes | Missing | Remedy execution simulated |
| `WF-ADM-01` | Role-aware queue/home | `FLOW-ADMIN-01` | Yes | Responsive-safe only | Existing/partial by domain | Exact IA and mobile support open |
| `WF-ADM-02` | Inquiry/Request/Offer detail | `FLOW-ADMIN-01` | Yes | Responsive-safe only | Inquiry existing; Retail Request missing | Lifecycle separation mandatory |
| `WF-ADM-03` | Retail Order production/QC/fulfillment detail | `UX-ADMIN-001` | Yes | Responsive-safe only | Partial/read-only | Transaction capability inactive |
| `WF-ADM-04` | Retail after-sales case detail | `UX-ADMIN-001`, `UX-AFTER-001` | Yes | Responsive-safe only | Missing | Legal/Finance/provider gates open |
| `WF-CMS-01` | Structured editor conflict/recovery | `UX-CMS-001` | Yes | Responsive-safe only | Existing | Exact fields/SOP and mobile support open |
| `WF-ADM-05` | Inventory balance and restock-alert recovery | `UX-ADMIN-001` | Yes | Responsive-safe only | Existing/partial | `DEC-OPS-002` header-alert direction; exact alert fields open |
| `WF-NOTIF-01` | Role-scoped dashboard/email notification state | `UX-ADMIN-001` | Yes | Yes | Partial | `DEC-DATA-003`; provider and activation gates open |
| `WF-ADM-06` | Read-only legacy Admin Order archive | `UX-ADMIN-001` | Yes | Responsive-safe only | Existing/partial | `DEC-UX-003` legacy archive; no active workbench actions |
| `WF-LEGACY-01` | Customer `/order` compatibility state | `UX-RET-001` | Yes | Yes | Existing/partial | `DEC-UX-003` safe unavailable/redirect/read-only compatibility |
| `WF-OWN-SAFE` | Non-enumerating foreign/not-found record state | `UX-PRIV-001` | Yes | Yes | Missing | Same safe projection for authenticated foreign and missing references |
| `WF-DASH-01` | Customer dashboard owned next action | `UX-RET-001`, `UX-PRIV-001` | Yes | Yes | Existing/partial | `/dashboard` namespace; exact IA remains review-only |
| `WF-EXT-01` | External-action confirmation modal/state | `UX-B2B-002` | Yes | Yes | Missing | User-initiated WhatsApp only; no automatic send or system-of-record claim |

### 5.1 State-delta contract for grouped diagrams

Grouped ASCII diagrams are coverage sketches only. The following deltas are
independent frame obligations; a prototype may share layout code, but it must
not merge their meaning or primary action.

| Frame family | Required independent distinction |
| --- | --- |
| `WF-PUB-01` / `WF-PUB-02` | Homepage path choice versus capability context and form entry |
| `WF-CFG-01/02/03` | Configuration input, processing/error, and eligible calculated result |
| `WF-OFFER-01` | Active immutable Offer version, scope, expiry, and accept/decline action |
| `WF-OFFER-02` | Accepted, declined, expired, superseded, or stale-revalidation outcome |
| `WF-PAY-01` | Active/pending payment attempt with remaining reservation time and five-minute warning |
| `WF-PAY-02` | Uncertain/late/conflicting evidence with reconciliation-only next action; active timer/warning or expired variant is explicit |
| `WF-PAY-03` | Succeeded, failed, cancelled, expired, consumed, or released terminal result |
| `WF-ORD-01` | Owned Order summary, current state, fulfillment, and next action |
| `WF-ORD-02` | One selected factual milestone sequence and history |
| `WF-ORD-03` | ETA-overdue or pickup-overdue replacement range/reason and governed recovery action |
| `WF-ORD-04` | Exception-specific state, owner, history, deadline, and next action |
| `WF-AFS-01` | Lifecycle-specific after-sales eligibility and customer intake |
| `WF-AFS-02` | Evidence, review, approval, execution, and outcome stages |
| `WF-ADM-01` | Role-aware queue and filters with resource identity |
| `WF-ADM-02` | Inquiry/Request/Offer detail and reviewer/approver capability |
| `WF-ADM-03` | Retail Order production/QC/fulfillment detail |
| `WF-ADM-04` | Retail after-sales Case detail and remedy boundary |
| `WF-ADM-05` | Inventory low/depleted/reserved/conflict alert and next action |
| `WF-ADM-06` | Read-only legacy archive identity, explicit label, and no mutation |
| `WF-CMS-01` | Structured draft/preview/publish/schedule/archive/rollback/conflict |
| `WF-NOTIF-01` | Recipient-scoped dashboard/email notification and safe link |
| `WF-LEGACY-01` | Customer legacy unavailable/redirect/read-only compatibility |
| `WF-OWN-SAFE` | Foreign/not-found record has no existence or protected-data disclosure |
| `WF-DASH-01` | Owned next action and notification entry remain separate from public navigation |
| `WF-EXT-01` | External WhatsApp action is confirmed without creating an Inquiry or hiding durable acknowledgement |

Each state-delta row must be visible in Review Mode and must preserve the
Participant Mode action meaning at 390px and desktop widths.

## 6. Annotated wireframes

The diagrams describe information order and interaction responsibility. They do
not prescribe CSS, component props, exact dimensions, or final copy.

### 6.1 Public path choice and B2B Inquiry

#### Desktop reference — `WF-PUB-01` → `WF-PUB-02` → `WF-B2B-01` → `WF-B2B-02`

```text
+--------------------------------------------------------------------------------+
| [AN-12] SIMULASI PROTOTYPE                           [Nav] [Masuk]              |
+--------------------------------------------------------------------------------+
| [AN-01] Niuva: R&D, design engineering, and prototyping partner                |
| Evidence-led statement                                                         |
| [AN-02] Diskusikan kebutuhan  [AN-03] Lihat Retail                             |
+--------------------------------------+-----------------------------------------+
| Capability / project evidence        | [AN-01] Form konsultasi                 |
| No fabricated metrics                | company | pic_name | pic_email          |
|                                      | pic_phone [required] | need | timeline | brief |
|                                      | [AN-04] summary + adjacent errors       |
|                                      | consent checkbox                       |
|                                      | [AN-02] Kirim inquiry                   |
+--------------------------------------+-----------------------------------------+
| Success replaces form action region:                                            |
| [AN-05] Inquiry reference | status: new | response target, not quote/ETA promise |
| [AN-11] focus/status announcement after durable acknowledgement               |
| [AN-02] Continue on WhatsApp (optional) [AN-03] Submit another                  |
+--------------------------------------------------------------------------------+
```

#### Capability continuation — `WF-PUB-02`

```text
+--------------------------------------------------------------------------------+
| [AN-12] SIMULASI | Capabilities                                               |
+--------------------------------------------------------------------------------+
| [AN-01] What Niuva can help with                                               |
| Research & Development | Design & Prototyping | Apparel & Merchandise         |
| Consultant & Workshop / partnership path                                       |
| [AN-02] Open consultation form                                                 |
| [AN-03] Quick WhatsApp contact (optional; no Inquiry is created)               |
| [AN-03] Return to homepage / [AN-03] Browse Retail                             |
+--------------------------------------------------------------------------------+
```

The continuation frame makes the B2B-primary CTA-to-form handoff explicit. It
does not create or imply a separate services route, quote, or project.

#### 390px capability continuation

```text
+--------------------------------------+
| [AN-12] Simulasi | Capabilities     |
| R&D / Design / Workshop / Retail    |
| [AN-02] Buka form konsultasi        |
| [AN-03] WhatsApp cepat (opsional)   |
| [AN-03] Kembali / Lihat Retail      |
+--------------------------------------+
```

#### 390px B2B reference

```text
+--------------------------------------+
| [AN-12] Simulasi prototype           |
| Menu                                 |
+--------------------------------------+
| [AN-01] B2B-primary statement        |
| [AN-02] Diskusikan kebutuhan         |
| [AN-03] Lihat Retail                 |
+--------------------------------------+
| Evidence / capability               |
+--------------------------------------+
| [AN-01] Form konsultasi              |
| Label + field                        |
| ...                                  |
| [AN-04] error next to owner field    |
| Consent                              |
| [AN-02] Kirim inquiry                |
+--------------------------------------+
| [AN-05] Acknowledgement reference    |
| Response target, no promise          |
| [AN-02] Optional WhatsApp            |
+--------------------------------------+
```

Annotations:

- Inquiry submission is the primary project-discussion path.
- WhatsApp before submission remains a secondary contact option; after a
  successful persistence event it becomes an optional continuation.
- The required checkbox uses the approved wording: “Saya setuju Niuva
  menggunakan data ini untuk meninjau inquiry dan menghubungi saya terkait
  kebutuhan yang saya kirim. Data tidak digunakan untuk marketing tanpa
  persetujuan terpisah.”
- `pic_phone` and consent are visibly marked required; other fields retain the
  canonical contract labels and their approved validation state rather than
  inventing new requiredness.
- The acknowledgement states that the first human response target is no later
  than one working day, owned by Niuva Operations on Monday–Friday,
  09.00–17.00 WIB excluding public holidays. It is not a quotation, price, ETA,
  or delivery guarantee. This is the amended B2B Form + WhatsApp contract in
  `DEC-UX-003`, not a new fixture-only policy or a Retail after-sales SLA.
- Failed persistence retains the form and never exposes a fake reference.
- Failed persistence has an explicit recoverable state: the form remains
  editable, no Inquiry UUID is shown, and retry is the only submit action.
- Required consent is unchecked by default and adjacent to the submit action.
- Public raw-file upload is absent.

### 6.2 Retail discovery, Ready Product, and conceptual cart

#### Desktop reference — `WF-RET-01` → `WF-CART-01`

```text
+--------------------------------------------------------------------------------+
| [AN-12] SIMULASI | Retail discovery | Account                                  |
+----------------------+---------------------------------------------------------+
| Filters              | Ready Product / Custom Print results                    |
| Accessible controls  | availability | offer meaning | factual attributes       |
|                      | [AN-02] Open product                                    |
+----------------------+---------------------------------------------------------+
| Product detail: media | published variants | availability | fixed/calculated   |
| [AN-02] Configure / add non-authoritative draft                                |
+--------------------------------------------------------------------------------+
| Conceptual cart behavior [AN-10: exact route TBD]                               |
| line | configuration | availability | preview amount | edit/remove             |
| [AN-07] No reservation; total is not authoritative                             |
| Mixed cart: Direct-checkout lane | Request lane (`quote_required`)             |
| No combined total; each lane has its own next action                            |
| [AN-02] Authenticate / continue to authoritative review                         |
+--------------------------------------------------------------------------------+
```

#### 390px Retail discovery/cart reference

```text
+--------------------------------------+
| [AN-12] Simulasi | Retail            |
| [Filter drawer]                      |
+--------------------------------------+
| Product result                       |
| Availability + offer meaning         |
| [AN-02] Open                         |
+--------------------------------------+
| Product facts / variants             |
| [AN-02] Configure                    |
+--------------------------------------+
| Cart draft [exact route TBD]         |
| No reservation / no final total      |
| Direct lane | Request lane           |
| No mixed payable total               |
| Edit | Remove                        |
| [AN-02] Continue                     |
+--------------------------------------+
```

Annotations:

- A cart draft never implies stock/material hold, Order, or final payable total.
- Unpublished/unavailable items have no checkout action.
- Mixed direct and quote-required work is separated before checkout: the
  eligible direct lane may continue to checkout while the Request lane retains
  its stable reference and never contributes an unknown amount to a total.
- Review Mode marks `WF-CART-01` as route/state-owner TBD; Participant Mode does
  not expose a fake URL.

### 6.3 Authentication interruption and safe continuation

#### Desktop and mobile contract — `WF-AUTH-01`

```text
+----------------------------------------------------------+
| [AN-01] Sign in to continue this Retail task              |
| Safe summary: product/configuration only                  |
| No private file preview before authenticated ownership    |
| Email                                                     |
| Password                                                  |
| [AN-04] generic credential/rate-limit/recovery feedback   |
| [AN-02] Sign in                                           |
| [AN-03] Recover account                                   |
+----------------------------------------------------------+
| Pre-Order: return to the same non-sensitive task          |
| Post-Order: reauthenticate, then return to owned Order    |
| without extending reservation or skipping revalidation    |
+----------------------------------------------------------+
```

Annotations:

- Registration remains a Review Mode note until its activation contract exists.
  Participant Mode renders neither an inactive registration control nor an
  evaluator/seed instruction. A selected task may begin with an approved
  authenticated fixture; this packet does not authorize account creation.
- Authentication failure does not reveal whether another account exists.
- Private upload and authoritative commitment wait for authenticated ownership.

### 6.4 Custom Print configuration and file analysis

#### Desktop reference — `WF-CFG-01` → `WF-CFG-02` → `WF-CFG-03`

```text
+--------------------------------------------------------------------------------+
| [AN-12] SIMULASI | Custom 3D Print | File version                              |
+----------------------+--------------------------------+------------------------+
| Step/context         | Configuration workspace        | Result summary         |
| Simple / Detailed    | [AN-07] authenticated owner   | state                  |
|                      | [private file control]        |                        |
| Material / color     | validation / analysis          | billable grams         |
| quantity             | [AN-04] safe error             | print duration         |
|                      | [AN-11] analysis status/focus  |                        |
| approved options     | retry / replace                | price + breakdown [SIMULASI] |
|                      |                                | ETA range              |
|                      |                                | [AN-02] Continue       |
+----------------------+--------------------------------+------------------------+
```

#### 390px configurator reference

```text
+--------------------------------------+
| [AN-12] Simulasi | Custom Print      |
| Step 1 of N / Simple or Detailed     |
+--------------------------------------+
| File version / replace               |
| Authenticated owner required         |
| [AN-04] adjacent validation          |
+--------------------------------------+
| Approved configuration fields       |
+--------------------------------------+
| State: validating / failed / eligible|
| grams | duration | price + breakdown [SIMULASI] |
| ETA range                            |
+--------------------------------------+
| [AN-02] Continue when eligible       |
| [AN-03] Edit / request review        |
+--------------------------------------+
```

Annotations:

- The prototype simulates file selection; it stores no file and executes no
  scanner, slicer, or customer `.gcode`.
- Simple and Detailed modes expose only approved-option placeholders; exact
  fields remain gated.
- An analysis failure cannot produce an approximate final price.
- Eligible results identify file version, configuration, billable grams, print
  duration, a synthetic customer-safe amount plus labelled price components,
  ETA range, and next revalidation. The amount is visibly simulation data and
  is not a production commercial promise.
- Review Mode also exposes synthetic commercial metadata: policy ID/version,
  `effective_at`, final-only rounding marker, included-service labels, and a
  tax-safe `fixture/gated` label. Participant Mode sees only customer-safe
  amount/breakdown meaning; no internal cost or unapproved tax rate appears.

#### File and analysis recovery deltas

| State | Visible meaning | Primary action | Forbidden result |
| --- | --- | --- | --- |
| Invalid | Input cannot be processed as supplied | Replace or correct | No raw parser detail |
| Unsupported/unsafe | This path cannot safely continue | Use supported input or request review | No promise that Niuva will repair every file |
| Too large | Approved limit is exceeded | Reduce or replace | No invented limit or upload success |
| Analysis failed | A trustworthy calculated result is unavailable | Retry or create the retained Request | No approximate final price/ETA |

Every row is exercised by `FX-CUSTOM-RECOVERY` and `SCN-CUSTOM-RECOVERY-01`;
the prototype preserves the file/configuration context while showing the
correct corrective action.

#### File-type authority deltas

| Input class | Prototype treatment | Forbidden inference |
| --- | --- | --- |
| `.stl` | Eligible only when the synthetic approved profile accepts it | Universal eligibility |
| Supported `.3mf` | Eligible only with an approved synthetic profile; customer machine profile is ignored | Trusting customer G-code/profile |
| `.obj` / `.step` | `quote_required` or safe review branch | Automatic calculated price |
| `.gcode` | Rejected for this customer upload path | Production authority or slicer trust |
| Multi-model/plate or unsafe combination | `quote_required` with retained context | Approximate final total/ETA |

### 6.5 Quote-required Request and Assisted Retail Offer

#### Desktop reference — separate route/frame states

```text
+--------------------------------------------------------------------------------+
| [AN-12] SIMULASI | `/retail/requests/:requestId` | `WF-REQ-01`              |
| State: created/reviewing | Safe reason | Retained context summary          |
| Request is created at quote_required handoff; no extra retain step             |
| Offer status: not yet available; operator review is required                   |
| [AN-02] View next action  [AN-03] Edit configuration / return                   |
+--------------------------------------------------------------------------------+
| Separate frame: `/retail/offers/:offerId` [AN-05] OFF-DEMO-001 / version       |
| Scope + file version | customer-safe breakdown | ETA | fixture expiry          |
| [AN-02] Accept  [AN-03] Decline                                                 |
+--------------------------------------------------------------------------------+
| Accepted                                                                         |
| “Checkout revalidation is still required.”                                      |
| [AN-07] No Order, reservation, payment attempt, or paid state                   |
| [AN-02] Continue to checkout                                                     |
+--------------------------------------------------------------------------------+
```

#### 390px Request/Offer reference

```text
+--------------------------------------+
| [AN-12] Simulasi                     |
| `/retail/requests/:requestId`        |
| Request reference + state            |
| Offer: not yet available             |
| Safe reason / retained context       |
| [AN-02] Next action                  |
| Offer controls appear only after     |
| approved Offer fixture               |
+--------------------------------------+
| Separate route: `/retail/offers/:offerId` |
| Offer version + fixture expiry       |
| Scope / file / breakdown / ETA       |
| [AN-02] Accept                       |
| [AN-03] Decline                      |
+--------------------------------------+
| Accepted != paid/order/reserved      |
| [AN-02] Continue to revalidation     |
+--------------------------------------+
```

Annotations:

- A Retail Request is not a B2B Quote and does not force an individual into an
  organization lifecycle.
- `WF-REQ-01` is a distinct Request-without-Offer state. The Offer panel and its
  Accept/Decline actions render only for `FX-OFFER-ACTIVE` after an operator has
  prepared and approved the immutable version; a newly created Request never
  implies that an Offer already exists.
- The Request and Offer blocks are separate frames and route identities, even
  when a prototype uses one shell. Navigation records a frame/route change; the
  Offer is never a child panel that appears on the newly created Request.
- The trusted `quote_required` handoff immediately creates a simulated durable
  Retail Request reference with the authenticated account, product,
  configuration, quantity, file versions, safe analysis, fulfillment context,
  and reason. It creates no Order, reservation, payment attempt, or checkout
  total.
- Operator draft/approval details are absent from customer projection.
- Expired and superseded offers are read-only and point to a safe Request or
  owned active version.
- The offer-expiry value is fixture metadata, not an approved default policy.

### 6.6 Checkout, stale revalidation, and payment uncertainty

#### Desktop reference — `WF-CHK-01` → `WF-CHK-02` → `WF-PAY-01/02/03`

```text
+--------------------------------------------------------------------------------+
| [AN-12] SIMULASI | Authoritative checkout review                               |
+-------------------------------------------+------------------------------------+
| Product/configuration/file version        | Commitment summary                 |
| Fulfillment: pickup / supported delivery  | subtotal                           |
| ETA: ready + arrival where applicable     | tax treatment [fixture/gated]      |
| Revalidated stock/material/rate           | delivery                           |
| [AN-06] old -> new changed values         | total [SIMULASI]                   |
| [AN-09] reconfirmation required           | [AN-02] Confirm and begin payment  |
| [AN-11] stale/revalidation status focus   |                                    |
| Delivery rate expires at [SIMULASI]       | pickup location + operating hours |
| Collection window is chosen after         | no guessed carrier/service         |
| `ready_for_pickup`; no `pickup_overdue`   | state is shown at checkout        |
+-------------------------------------------+------------------------------------+
| Pre-commit state: no Order, attempt, or reservation yet                        |
| [AN-05] snapshot reference | [AN-09] safe explanation                        |
| Continue only after explicit reconfirmation; no timer is shown here            |
| NO second prominent pay action                                                  |
+--------------------------------------------------------------------------------+
```

#### 390px checkout/payment reference

```text
+--------------------------------------+
| [AN-12] Simulasi                     |
| Authoritative review                 |
+--------------------------------------+
| Item / file / configuration          |
| Fulfillment + ETA                    |
| [AN-06] old -> new delta             |
| Explicit total [SIMULASI]            |
| [AN-09] Reconfirm changes            |
| [AN-02] Begin payment                |
+--------------------------------------+
| Pre-commit: no reservation/timer     |
| Timer begins only after creation     |
| Reconfirm before payment             |
|--------------------------------------|
| [AN-11] payment status announcement  |
| Payment uncertain                    |
| Attempt reference                    |
| Reservation: active remaining time  |
| Five-minute warning when applicable  |
| Expired variant: no active timer     |
| Do not pay again                     |
| [AN-02] Check status                 |
| [AN-03] View Order / support         |
+--------------------------------------+
```

Annotations:

- Order, payment attempt, and the fixed 30-minute reservation begin only at the
  approved successful creation boundary, not while viewing this frame.
- `WF-CHK-01` never displays a reservation timer. The post-create `WF-PAY-01`
  state displays remaining time, a five-minute warning, and a deterministic
  consumed/released/expired outcome. Expiry never extends or reactivates the
  old reservation.
- Stale price, ETA, stock, tax treatment, or delivery rate appears beside the
  affected value and in one consolidated reconfirmation summary.
- Delivery shows a synthetic `rate_expires_at` and pickup location/operating
  hours when applicable. The fixture labels the shipping-rate cap as
  `quoted_at + 30 minutes` and `rate_expires_at = min(provider_expires_at,
  quoted_at + 30 minutes)` with refresh-before-create behavior, without
  selecting a provider. A collection window is selected only after the Order
  reaches `ready_for_pickup`; `pickup_overdue` is shown on the owned Order after
  the governed interval, never on pre-payment checkout.
- Payment success consumes the reservation and routes to the owned Order.
- Definitive failure/expiry may offer an approved revalidation/retry path.
- Uncertain/late/conflicting evidence enters reconciliation and never invites a
  blind duplicate payment.

#### Post-create payment state delta

The payment frames begin only after `PT-PAY-01` has created the synthetic Order,
payment attempt, and reservation. Their state meanings are not interchangeable.

| Frame/state | Fixture | Customer action | Reservation meaning |
| --- | --- | --- | --- |
| `WF-PAY-01` — action required | `FX-PAY-ACTION-REQUIRED` | Complete the one approved action; do not start a second attempt | Active; timer is visible |
| `WF-PAY-01` — pending/processing | `FX-PAY-PENDING` | Wait/check status; no duplicate pay CTA | Active until terminal evidence |
| `WF-PAY-02` — uncertain/reconciliation | `FX-PAY-UNCERTAIN` | Check status, owned Order, or approved support | Do not infer consumed/released until authoritative result |
| `WF-PAY-03` — terminal | `FX-PAY-TERMINAL` | Follow success, failure, cancellation, or expiry next action | Consumed or released exactly once |

`WF-CHK-01` is pre-commit and has no reservation timer. `WF-PAY-01/02/03`
are post-create states and must retain the attempt/reference context.

#### Fulfillment unavailable fallback — `WF-CHK-03`

```text
+--------------------------------------+
| [AN-12] Simulasi | Delivery fallback |
| Selected service unavailable         |
| Cause: provider timeout/unavailable  |
| [AN-02] Choose pickup if available   |
| [AN-02] Request review if not         |
| No delivery total or payment attempt |
+--------------------------------------+
```

The fallback is shown before commitment. It never invents a carrier, silently
switches a delivery service, creates an Order, or starts a reservation.

### 6.7 Owned Order, milestone tracking, and after-sales

#### Desktop reference — `WF-ORD-01/02/03` → `WF-AFS-01/02`

```text
+--------------------------------------------------------------------------------+
| [AN-12] SIMULASI | Order [AN-05] ORD-DEMO-001 | Current next action            |
+-------------------------------------------+------------------------------------+
| Payment + fulfillment snapshot            | ETA range / overdue explanation    |
| Customer-safe committed breakdown         | pickup or delivery next action     |
+-------------------------------------------+------------------------------------+
| [AN-08] Factual milestone timeline                                              |
| timestamp -> state -> safe reason/history                                       |
| no percentage | no exact queue position | no live printer telemetry             |
+--------------------------------------------------------------------------------+
| Eligible actions for selected lifecycle fixture                                 |
| allowed action(s) | disabled action + safe reason [if applicable]               |
+--------------------------------------------------------------------------------+
| Conditional Case panel [AN-05] CASE-DEMO-001 (only when a case fixture exists)  |
| evidence requested -> review -> approval/rejection -> execution -> resolution   |
| [AN-11] case status/required-action announcement                                  |
| deadline/owner: revision_due_at or complaint_due_at [SIMULASI]                  |
| first response target / resolution target [SIMULASI; not a remedy promise]       |
| [AN-02] Current required action  [AN-03] Return to Order                         |
| No-case variant: show lifecycle-specific eligible action or “No case opened”;   |
| never imply that every Order already has a Case or remedy in progress            |
+--------------------------------------------------------------------------------+
```

#### 390px Order/after-sales reference

```text
+--------------------------------------+
| [AN-12] Simulasi | Order reference   |
| Current state + next action          |
+--------------------------------------+
| ETA / overdue reason                |
| Fulfillment                         |
| Ready pickup: location/hours/window |
+--------------------------------------+
| Vertical factual timeline           |
| time | milestone | safe detail      |
+--------------------------------------+
| Eligible actions for selected phase |
| Disabled actions explain why        |
+--------------------------------------+
| Case state / evidence / outcome     |
| [AN-02] Required action             |
+--------------------------------------+
```

#### Exception recovery reference — `WF-ORD-04`

```text
+--------------------------------------+
| [AN-12] Simulasi | Order exception    |
| State: file_revision_required        |
|        on_hold / rework_required     |
|        payment/cancellation/refund   |
| [AN-08] Owner + factual history      |
| [AN-09] Safe reason + deadline       |
| [AN-02] One governed next action     |
| No automatic refund/reprint/cancel   |
+--------------------------------------+
```

The exception fixture selects exactly one state and its owner/action pair;
exception text must not be rendered as the ETA-overdue state or as an already
approved remedy.

Annotations:

- The scenario selector chooses exactly one canonical variant: Ready Product
  pickup, Ready Product delivery, Custom Print pickup, or Custom Print delivery.
- The Order surface has a no-case variant by default. A Case panel is rendered
  only when the selected `FX-AFTER-*` fixture contains an owned Case reference;
  after-sales entry and actions remain conditional on the lifecycle matrix.
- `ready_for_pickup` and `ready_to_ship` are never collapsed into a new state.
- Pickup location/operating hours may be shown during checkout; the collection
  window appears only in the ready-for-pickup Order state. `pickup_overdue` is
  measured from that selected window and is never a pre-commit checkout state.
- `eta_overdue` requires a replacement range/reason and does not automatically
  cancel, refund, or promise compensation.
- `pickup_overdue` is a separate `WF-ORD-03` variant after `ready_for_pickup`
  and the selected collection window; it shows reminders/manual follow-up and
  the governed collection action, never automatic cancellation or refund.
- After-sales eligibility, review, approval, Finance/provider execution, and
  outcome remain visually distinct.
- Ownership denial and not-found use the same non-enumerating safe treatment.

#### After-sales lifecycle eligibility matrix

The prototype must select one row per scenario; it must not show every action
as universally available.

| Synthetic order phase | Primary eligible actions | Required customer meaning |
| --- | --- | --- |
| Before payment/commitment (`WF-CART-01`) | Cancel or edit the safe draft | No Order or payment remedy exists yet |
| Paid, work not started | Governed cancellation/refund review; file revision when applicable | Review/approval is required; no automatic outcome |
| Production started or irreversible work | Complaint, approved reprint/replacement, or governed refund/return review | Work facts and customer-safe reason are visible |
| After pickup/delivery | Complaint, reprint/replacement, refund/return review within governed window | Receipt event and due window are visible |
| Customer-caused/nonconforming | Correction or quote-required review as applicable | No automatic Niuva-fault remedy is implied |

Revision uses a synthetic 48-hour `revision_due_at`; standard complaint intake
uses a synthetic at-least-two-working-day window. Remedy choice, manager
approval, Finance/provider execution, and resolution remain separate states.

#### Canonical milestone binding

The prototype fixture must select one complete sequence without merging state
names:

- Ready Product pickup:
  `payment_confirmed → processing_or_packing → ready_for_pickup → picked_up → completed`;
- Ready Product delivery:
  `payment_confirmed → processing_or_packing → ready_to_ship → shipped → delivered → completed`;
- Custom Print pickup:
  `payment_confirmed → file_review_when_applicable → production_queue → printing → post_processing_when_applicable → quality_control → ready_for_pickup → picked_up → completed`; or
- Custom Print delivery:
  `payment_confirmed → file_review_when_applicable → production_queue → printing → post_processing_when_applicable → quality_control → ready_to_ship → shipped → delivered → completed`.

For after-sales fixtures:

- a requested replacement file uses the approved 48-hour window from the
  successful customer-facing revision notice and displays a synthetic
  `revision_due_at` in `Asia/Jakarta`; expiry enters review rather than deleting
  the Order or inferring a refund;
- standard complaint intake is at least two working days after authoritative
  receipt, while the exact calendar and `complaint_due_at` remain activation
  gates; and
- complaint acknowledgement is immediate after durable recording, first human
  response targets one working day, and resolution decision targets five
  working days after sufficient evidence. These are service targets, not remedy
  promises.

### 6.8 Admin queue, detail, conflict, and CMS recovery

#### Desktop reference — `WF-ADM-01/02/03/04` and `WF-CMS-01`

```text
+--------------------------------------------------------------------------------+
| [AN-12] SIMULASI | [AN-01] Role context | Admin Studio                         |
+----------------------+-----------------------------------+---------------------+
| Role-aware nav       | Queue / filters / result rows     | Record detail       |
| Inquiry              | identity | state | next action    | identity/version    |
| B2B Quote/Project    | separate lifecycle branch        | safe facts          |
| Retail Request       | no generic KPI decoration         | safe facts          |
| Retail Order         | empty/error/forbidden states      | validation          |
| Retail Case          |                                   | [AN-02] action      |
| Content              |                                   | [AN-08] history     |
+----------------------+-----------------------------------+---------------------+
| [AN-09] Visible stale/version conflict                                         |
| [AN-11] conflict announcement + focus target                                   |
| attempted save rejected; draft retained when safe                               |
| [AN-02] Reload/compare  [AN-03] Return without overwrite                         |
| Transaction unavailable: unchanged record; retry/support, never success       |
+--------------------------------------------------------------------------------+
```

#### 390px responsive-safe reference

```text
+--------------------------------------+
| [AN-12] Simulasi | Role context      |
| [AN-10] Admin mobile level TBD       |
+--------------------------------------+
| Record identity / current state      |
| Next action summary                  |
+--------------------------------------+
| Labelled queue rows or safe overflow |
+--------------------------------------+
| Conflict / permission feedback      |
| Action availability remains TBD     |
+--------------------------------------+
```

Annotations:

- Public editorial grammar does not enter Admin Studio.
- A hidden button is never treated as backend authorization.
- Retail Request/Offer, Retail Order, B2B Quote/Project, Work Order, and
  after-sales Case retain separate lifecycle language.
- Request review, Offer preparation, and Offer approval use separate synthetic
  capability fixtures. A reviewer may prepare a version; only a
  `manager_approver` fixture can make it customer-visible as `offered`.
- CMS states are explicit: draft, review, preview, published/scheduled,
  archived, rollback, and conflict. Version history and actor are visible;
  publish is never implied by a hidden control.
- Conflict rejection is visible to sighted operators and exposed semantically;
  it is never only an `aria-live` message.
- The 390px frame proves safe reflow only. It does not choose full-operation,
  limited-operation, read/triage-only, or responsive-safe-only policy.

### 6.9 Supporting inventory and notification surfaces

#### Desktop reference — `WF-ADM-05` and `WF-NOTIF-01`

```text
+--------------------------------------------------------------------------------+
| [AN-12] SIMULASI | [AN-01] Operations / notifications                         |
+----------------------+-----------------------------------+---------------------+
| Stock alert          | Alert detail / event              | Next action         |
| low | depleted      | domain + severity + timestamp    | inspect movement   |
| reserved | conflict | safe quantity/variant meaning    | resolve/reconcile  |
+----------------------+-----------------------------------+---------------------+
| Role-scoped dashboard/email notification: recipient, event, safe link, state  |
| No provider payload, internal cost, unrelated recipient, or WhatsApp fallback |
+--------------------------------------------------------------------------------+
```

#### 390px responsive-safe reference

```text
+--------------------------------------+
| [AN-12] Simulasi | Alert             |
| Domain + severity + timestamp       |
+--------------------------------------+
| Safe event detail                   |
| Current state / next action         |
| Open dashboard detail               |
+--------------------------------------+
| Notification audience + channel     |
| In-app / transactional email intent |
+--------------------------------------+
```

Annotations:

- `WF-ADM-05` covers only the existing inventory and header-alert direction;
  it does not authorize a new stock schema, scheduler, or email activation.
- Low, depleted, reserved, and conflict states retain domain identity and a
  safe next action. Exact balances remain operator-only.
- `WF-NOTIF-01` proves recipient-scoped, audience-aware presentation for the
  dashboard and transactional-email expectation. It does not enable a provider
  or WhatsApp notification.

#### `WF-DASH-01` — `/dashboard` owned next action

```text
+--------------------------------------+
| [AN-12] Simulasi | Dashboard         |
| Owned next action / current state    |
| Request | Offer | Order | Case        |
| Safe notification summary            |
| [AN-02] Open selected owned record   |
| [AN-03] Open notification feed       |
+--------------------------------------+
```

The dashboard frame is a customer namespace entry, not an operator queue. It
shows only owned safe projections and does not imply that every resource exists.

#### `WF-EXT-01` — external-action confirmation

```text
+--------------------------------------+
| Continue outside Niuva?              |
| WhatsApp opens only after durable    |
| Inquiry acknowledgement              |
| [AN-02] Continue | [AN-03] Cancel    |
+--------------------------------------+
```

This is a modal/state, not a new route. It is available in Participant Mode
without evaluator instructions and records only the user-initiated action.

### 6.10 Legacy compatibility boundaries

#### `WF-ADM-06` — `/admin/orders` read-only archive

```text
+--------------------------------------------------------------------------------+
| [AN-12] SIMULASI | Legacy Order archive [AN-01] READ-ONLY                     |
+--------------------------------------------------------------------------------+
| Historical record identity | safe customer projection | immutable history      |
| No active Retail workbench actions | no mutation | no new payment instruction  |
| [AN-03] Return to active Retail queue / approved support                       |
+--------------------------------------------------------------------------------+
```

#### `WF-LEGACY-01` — customer `/order` compatibility

```text
+--------------------------------------+
| [AN-12] Simulasi | Legacy `/order`  |
| Safe unavailable/redirect state     |
| Historical read-only view only      |
| No create/edit/pay/retry controls   |
| [AN-03] Return to `/retail` or login|
+--------------------------------------+
```

#### `WF-OWN-SAFE` — foreign or missing record

```text
+--------------------------------------+
| [AN-12] Simulasi | Record unavailable |
| We could not display this record      |
| Reference is unavailable or forbidden |
| No owner, status, amount, or history  |
| [AN-03] Return to your dashboard      |
+--------------------------------------+
```

This state is used for authenticated foreign and missing Request, Offer, Order,
and Case references. It is not a sign-in screen and must not reveal whether a
protected record exists.

The active Admin workbench is `/admin/retail-orders`; `/admin/orders` is a
labelled read-only archive. Before activation, `/order` remains a safe
unavailable/compatibility state; after the separately approved redirect it may
lead to the canonical Retail surface. Neither frame reactivates legacy order
creation or manual-transfer/payment-proof activity.

## 7. Prototype-only transition contract

All `PT-*` transitions are packet-local simulation instructions. They do not
define APIs or backend state machines.

| Transition | From | Trigger | Guard | To | Observable result |
| --- | --- | --- | --- | --- | --- |
| `PT-PUB-01` | `WF-PUB-01` | Open B2B-primary consultation path | Public participant fixture | `WF-PUB-02` | Capability context and one clear form CTA |
| `PT-PUB-02` | `WF-PUB-02` | Open consultation form | Public route fixture | `WF-B2B-01` | Form receives focus; no inquiry is created |
| `PT-PUB-03` | `WF-PUB-02` | Open quick WhatsApp before submitting | Public-settings destination fixture | `WF-EXT-01` | User-initiated contact only; no Inquiry or system-of-record claim |
| `PT-PUB-04` | `WF-PUB-01` | Browse Retail secondary path | Public Retail discovery fixture | `WF-RET-01` | Retail remains a separate journey; no B2B Inquiry is created |
| `PT-PUB-05` | `WF-PUB-02` | Browse Retail from capability context | Public Retail discovery fixture | `WF-RET-01` | Capability context is preserved without merging B2B and Retail lifecycles |
| `PT-B2B-01` | `WF-B2B-01` | Submit valid form with consent | Fixture persistence succeeds | `WF-B2B-02` | Inquiry UUID appears; optional WhatsApp is enabled |
| `PT-B2B-02` | `WF-B2B-01` | Submit invalid form | Client-safe validation fixture | Same frame | Summary and adjacent errors; focus moves to summary/first invalid field |
| `PT-B2B-03` | `WF-B2B-02` | Open WhatsApp | Acknowledgement exists and public-settings destination fixture is valid | `WF-EXT-01` | User-initiated action; Inquiry remains system of record |
| `PT-EXT-01` | `WF-EXT-01` | Continue user-initiated WhatsApp action | Valid public-settings destination | External WhatsApp handoff (not a Niuva route) | Explicit confirmation precedes external navigation; no automatic send |
| `PT-EXT-02` | `WF-EXT-01` | Cancel external action from public capability | `FX-EXT-PUBLIC` source variant | `WF-PUB-02` | Returns to capability context without changing Inquiry state |
| `PT-EXT-03` | `WF-EXT-01` | Cancel external action after Inquiry acknowledgement | `FX-EXT-B2B` source variant | `WF-B2B-02` | Returns to acknowledgement without changing Inquiry state |
| `PT-B2B-04` | `WF-B2B-01` | Submit when persistence is unavailable | Durable-write failure fixture | Same frame | Form remains editable; no Inquiry UUID; visible retry guidance |
| `PT-RET-01` | `WF-RET-01` | Add/configure Ready Product | Product published and available in fixture | `WF-CART-01` | Non-authoritative draft only |
| `PT-CART-01` | `WF-CART-01` | Continue to authoritative review | No authenticated fixture | `WF-AUTH-01` | Safe continuation preserves only non-sensitive draft context |
| `PT-CART-02` | `WF-CART-01` | Continue to authoritative review | `FX-AUTH-BOUNDARY.authenticated_owner` | `WF-CHK-01` | Direct lane enters server-authoritative checkout |
| `PT-CART-03` | `WF-CART-01` | Resolve mixed cart | `FX-AUTH-BOUNDARY.authenticated_owner` plus `FX-MIXED-CART` | Same frame with two lanes | Request reference is created; direct lane remains checkoutable; no mixed total |
| `PT-DASH-01` | `WF-AUTH-01` | Enter owned customer dashboard | Authenticated owner fixture | `WF-DASH-01` | Owned next action and notification entry are shown without foreign-record enumeration |
| `PT-DASH-02` | `WF-DASH-01` | Open notification feed | Authenticated owner with notification variant | `WF-NOTIF-01` | Notification feed opens in the same customer namespace |
| `PT-DASH-03` | `WF-DASH-01` | Open owned Order next action | `FX-DASHBOARD.order_variant` | `WF-ORD-01` | Only the owned Order projection is shown |
| `PT-DASH-04` | `WF-DASH-01` | Open owned Request next action | `FX-DASHBOARD.request_variant` | `WF-REQ-01` | Only the owned Request projection is shown |
| `PT-DASH-05` | `WF-DASH-01` | Open owned Offer next action | `FX-DASHBOARD.offer_variant` | `WF-OFFER-01` | Only the owned Offer projection is shown |
| `PT-DASH-06` | `WF-DASH-01` | Open owned Case next action | `FX-DASHBOARD.case_variant` | `WF-AFS-01` | Only the owned Case entry is shown; no foreign case is enumerated |
| `PT-AUTH-01` | `WF-CART-01` | Continue private cart task | No authenticated fixture; `continuation_context=cart` | `WF-AUTH-01` | Only non-sensitive cart context is retained |
| `PT-AUTH-02` | `WF-AUTH-01` | Sign in from cart continuation | `FX-AUTH-BOUNDARY.cart_continuation` | `WF-CART-01` | Cart context restores to the same task; no private file data is exposed |
| `PT-AUTH-04` | `WF-CFG-01` | Continue private configurator task | No authenticated fixture; `continuation_context=configurator` | `WF-AUTH-01` | Configuration context is retained without exposing private file data |
| `PT-AUTH-05` | `WF-AUTH-01` | Sign in from configurator continuation | `FX-AUTH-BOUNDARY.configurator_continuation` | `WF-CFG-01` | Configurator context restores to the same task; upload/analysis remains gated until ownership |
| `PT-AUTH-03` | `WF-ORD-01` | Session expires after Order creation | Post-create reauthentication fixture | `WF-AUTH-01` then owned `WF-ORD-01` | Order remains owned; no reservation extension and full revalidation is not skipped |
| `PT-CFG-01` | `WF-CFG-01` | Select fixture file | `FX-AUTH-BOUNDARY.authenticated_owner` | `WF-CFG-02` | Validating/analysis status, then selected result fixture |
| `PT-CFG-02` | `WF-CFG-02` | Trusted eligible result | Eligible fixture | `WF-CFG-03` | Calculated inputs and next revalidation shown |
| `PT-CFG-03` | `WF-CFG-02` | Trusted `quote_required` result | `FX-AUTH-BOUNDARY.authenticated_owner` plus `FX-CUSTOM-QUOTE` | `WF-REQ-01` | Durable Request reference is created at handoff; no Order/reservation/payment/checkout total |
| `PT-CFG-04` | `WF-CFG-02` | Invalid/unsafe/too-large/analysis-failed result | Safe failure fixture | Same frame | Context retained; replace/retry/request-review action shown without approximate price/ETA |
| `PT-CFG-05` | `WF-CFG-03` | Continue eligible Custom Print | Eligible calculation plus `FX-AUTH-BOUNDARY.authenticated_owner` | `WF-CART-01` | Direct lane carries the calculated context to the conceptual cart; no reservation or payment is created |
| `PT-CFG-06` | `WF-CFG-02` | Request review after analysis failure | `FX-AUTH-BOUNDARY.authenticated_owner` plus analysis-failed variant with retained context | `WF-REQ-01` | Durable Request is created only through the explicit review path; no approximate price/ETA |
| `PT-REQ-01` | `WF-REQ-01` | Open retained Request next action | Owned Request fixture | `WF-REQ-01` | Edit and routing choices are explicit; no hidden consent-to-create step |
| `PT-REQ-02` | `WF-REQ-01` | Route organizational/complex/partnership work | `FX-REQUEST-ROUTING` plus `FX-B2B-HANDOFF`; Review Mode pre-seeds `sales_estimator`, then Participant Mode runs the operator task | `WF-ADM-02` | Synthetic `INQ-DEMO-001` records source `REQ-DEMO-001`, Inquiry status `new`, and a separate `b2b_handoff_recorded` source event; no aggregate merge or Retail Offer |
| `PT-REQ-03` | `WF-REQ-01` | Prepare eligible individual/UMKM Offer draft | `FX-REQUEST-ROUTING` Retail branch; Review Mode pre-seeds `sales_estimator`, then Participant Mode runs the operator task | `WF-ADM-02` | Draft Offer is prepared for approval; Participant Mode cannot silently approve or expose an Offer |
| `PT-OFFER-01` | `WF-OFFER-01` | Accept active owned version | Offered, unexpired fixture | `WF-OFFER-02` | Accepted state; no Order/reservation/payment |
| `PT-OFFER-02` | `WF-OFFER-02` | Continue | Server-revalidation simulation succeeds | `WF-CHK-01` | Offer snapshot enters normal checkout review |
| `PT-OFFER-03` | `WF-OFFER-01` | Open expired or superseded version | Terminal offer fixture | `WF-OFFER-02` | Read-only state returns to Request/active version; no payment CTA |
| `PT-OFFER-04` | `WF-OFFER-02` | Revalidate accepted version | `FX-OFFER-TERMINAL` owner/version/expiry-conflict variant | `WF-REQ-01` | Safe conflict; no Order/reservation/payment and no silent checkout |
| `PT-OFFER-05` | `WF-OFFER-01` | Decline active Offer | Offered, unexpired fixture | `WF-OFFER-02` | Declined terminal state is explicit; no Order/reservation/payment and no hidden re-offer |
| `PT-CHK-01` | `WF-CHK-01` | Revalidate | Current values match | `WF-CHK-01` | Authoritative synthetic snapshot shown |
| `PT-CHK-02` | `WF-CHK-01` | Revalidate | One or more values changed | `WF-CHK-02` | Old/new deltas and explicit reconfirmation |
| `PT-CHK-03` | `WF-CHK-01` | Delivery provider unavailable/timeout | `FX-FULFILLMENT-UNAVAILABLE` | `WF-CHK-03` | Safe pickup or quote-required fallback; no silent carrier switch or commitment |
| `PT-CHK-04` | `WF-CHK-01` | Order/attempt/reservation creation fails | `FX-CHECKOUT-CREATION-FAIL` | `WF-CHK-01` | Checkout draft remains unchanged; visible retry/support path; no partial Order or reservation |
| `PT-CHK-05` | `WF-CHK-03` | Choose available pickup fallback | `FX-FULFILLMENT-UNAVAILABLE.pickup_available` | `WF-CHK-01` | Pickup is re-reviewed without a delivery provider or collection window commitment |
| `PT-CHK-06` | `WF-CHK-03` | Request review when no fulfillment service is available | `FX-FULFILLMENT-UNAVAILABLE.no_service` | `WF-REQ-01` | Durable Request review path is explicit; no Order, reservation, or payment |
| `PT-PAY-01` | `WF-CHK-01` | Confirm payment | `FX-RESERVATION-STATES` creation-success variant | `WF-PAY-01` | Post-create attempt reference and 30-minute reservation shown |
| `PT-RES-01` | `WF-PAY-01` | Five-minute warning | Deterministic warning fixture | `WF-PAY-01` | Remaining time and warning are visible; no automatic extension |
| `PT-RES-02` | `WF-PAY-01` | Payment confirmed before expiry | Consumed reservation fixture | `WF-PAY-03` | Reservation is consumed once and owned Order is available |
| `PT-RES-03` | `WF-PAY-01` | Failure/cancel/expiry | Released or expired fixture | `WF-PAY-03` | Allocation releases once; no paid success is implied |
| `PT-RES-04` | `WF-PAY-03` | Retry after expiry with unchanged authoritative values | Fresh revalidation unchanged variant | `WF-CHK-01` | New review succeeds without reactivating the old reservation |
| `PT-RES-05` | `WF-PAY-03` | Retry after expiry with changed authoritative values | Fresh revalidation changed variant | `WF-CHK-02` | New price/stock/rate/ETA review; old reservation is never reactivated |
| `PT-PAY-02` | `WF-PAY-01` | Unknown/late/conflicting result | `FX-PAY-UNCERTAIN` active/expired variant plus reservation state | `WF-PAY-02` | Active variant retains remaining timer/warning; expired variant has no active timer; no duplicate payment action |
| `PT-PAY-03` | `WF-PAY-01` | Trusted idempotent result | `FX-PAY-TERMINAL` | `WF-PAY-03` | Succeeded/failed/cancelled/expired meaning and next action |
| `PT-PAY-06` | `WF-PAY-02` | Late result reconciles to terminal outcome | `FX-PAY-UNCERTAIN` terminal variant | `WF-PAY-03` | Reconciliation resolves the uncertain state without a duplicate payment action |
| `PT-PAY-04` | `WF-PAY-01` | Customer action required | `FX-PAY-ACTION-REQUIRED` | `WF-PAY-01` | One approved action; no duplicate prominent payment action |
| `PT-PAY-05` | `WF-PAY-01` | Pending/processing | `FX-PAY-PENDING` | `WF-PAY-01` | Wait/check status; no duplicate prominent payment action |
| `PT-ORD-01` | `WF-PAY-03` | View owned Order after succeeded payment | `FX-PAY-TERMINAL` succeeded variant plus ownership | `WF-ORD-01` | Owned summary opens before selecting one milestone sequence |
| `PT-ORD-05` | `WF-ORD-01` | Select one production/fulfillment milestone variant | Exactly one of `FX-ORDER-READY-PICKUP`, `FX-ORDER-READY-DELIVERY`, `FX-ORDER-CUSTOM-PICKUP`, or `FX-ORDER-CUSTOM-DELIVERY` plus ownership | `WF-ORD-02` | Ready pickup/delivery and Custom pickup/delivery remain explicit and are not collapsed |
| `PT-ORD-02` | `WF-ORD-02` | ETA target passes | `FX-ORDER-OVERDUE` | `WF-ORD-03` | Overdue marker, replacement range/reason, safe action |
| `PT-ORD-07` | `WF-ORD-02` | Pickup remains uncollected after governed interval | `FX-ORDER-PICKUP-OVERDUE` | `WF-ORD-03` | `pickup_overdue`, reminders/manual follow-up, and collection action are explicit; no automatic cancellation/refund |
| `PT-ORD-04` | `WF-ORD-02` | Production or payment exception | `FX-ORDER-EXCEPTIONS` | `WF-ORD-04` | `file_revision_required`, `on_hold`, `rework_required`, payment/cancellation/refund exception with safe next action/history |
| `PT-ORD-06` | `WF-ORD-03` | Review an exception after ETA-overdue state | `FX-ORDER-EXCEPTIONS` plus overdue history | `WF-ORD-04` | ETA recovery and exception recovery remain separate state meanings |
| `PT-ORD-03` | `WF-ORD-01` | Open foreign/not-found Order reference | `FX-OWNERSHIP-DENIED` or `FX-NOT-FOUND` | `WF-OWN-SAFE` | No existence enumeration or protected projection; session is not treated as expired |
| `PT-OWN-01` | `WF-REQ-01` | Open foreign Request reference | `FX-OWNERSHIP-DENIED` | `WF-OWN-SAFE` | Request ownership denial uses the same non-enumerating projection |
| `PT-OWN-02` | `WF-OFFER-01` | Open foreign Offer reference | `FX-OWNERSHIP-DENIED` | `WF-OWN-SAFE` | Offer ownership denial exposes no scope, price, or owner |
| `PT-OWN-03` | `WF-AFS-02` | Open foreign Case reference | `FX-OWNERSHIP-DENIED` | `WF-OWN-SAFE` | Case ownership denial exposes no evidence or internal note |
| `PT-OWN-04` | `WF-OWN-SAFE` | Return from safe unavailable state | Authenticated owner fixture | `WF-DASH-01` | Safe return does not reveal the denied/missing record |
| `PT-AFS-00` | `WF-CART-01` | Cancel or edit before commitment | Pre-payment lifecycle fixture | `WF-CART-01` | Safe draft action; no Order/payment remedy is implied |
| `PT-AFS-01` | `WF-ORD-01` | Start eligible action | Lifecycle-specific policy fixture permits action | `WF-AFS-01` | Durable acknowledgement and eligible action are visible |
| `PT-AFS-02` | `WF-AFS-01` | Submit evidence/request | Valid fixture | `WF-AFS-02` | Review/approval/execution/outcome stay distinct |
| `PT-AFS-03` | `WF-AFS-01` | Request disallowed remedy | Lifecycle/customer-cause fixture | Same frame | Safe explanation and allowed escalation; no automatic refund/reprint |
| `PT-AFS-04` | `WF-ADM-04` | Review an operator after-sales Case | `FX-AFTER-REVIEW` plus Review Mode pre-seeded `order_admin`; Participant Mode runs the operator task | `WF-ADM-04` | Case owner, evidence, approval state, and allowed next action remain visible |
| `PT-AFS-05` | `WF-ADM-04` | Approve/reject a governed remedy | Review Mode pre-seeds `manager_approver`; Participant Mode runs the operator task | `WF-ADM-04` | Approval/rejection is auditable and never silently executes a remedy |
| `PT-AFS-06` | `WF-ADM-04` | Prepare Finance reconciliation after approval | Review Mode pre-seeds `finance` plus approved `manager_approver` outcome; Participant Mode runs the operator task | `WF-ADM-04` | Finance prepares/reconciles; it cannot approve a refund/free reprint/replacement |
| `PT-ADM-00` | `WF-ADM-01` | Enter Admin home from an operator fixture | Review Mode pre-seeds the operator role, then hands off to Participant Mode | `WF-ADM-01` | Admin context is visible without silently switching a customer Participant Mode |
| `PT-ADM-01` | `WF-ADM-01` | Open a Retail Request/Inquiry queue record | Role/domain fixture is pre-seeded in Review Mode; Participant Mode runs the operator task | `WF-ADM-02` | Identity, lifecycle, version, next action, history |
| `PT-ADM-07` | `WF-ADM-01` | Open a Retail Order queue record | `order_admin` is pre-seeded in Review Mode; Participant Mode runs the operator task | `WF-ADM-03` | Retail Order workbench detail is not the legacy archive |
| `PT-ADM-08` | `WF-ADM-01` | Open a Retail Case queue record | `order_admin`/`finance` is pre-seeded in Review Mode; Participant Mode runs the operator task | `WF-ADM-04` | Case detail is traversable without changing the customer mode silently |
| `PT-ADM-02` | `WF-ADM-02` | Prepare Retail Offer version | Review Mode pre-seeds `sales_estimator`; Participant Mode runs the operator task | `WF-ADM-02` | Draft → approval-required version; customer projection remains unchanged |
| `PT-ADM-03` | `WF-ADM-02` | Approve Offer | Review Mode pre-seeds `manager_approver`; Participant Mode runs the operator task, then customer view is explicit | `WF-OFFER-01` | Only approved version becomes offered; customer view is explicit |
| `PT-ADM-03-DENY` | `WF-ADM-02` | Reject Offer | Review Mode pre-seeds `manager_approver`; Participant Mode runs the operator task | `WF-ADM-02` | Denial is visible and auditable; no customer Offer is exposed |
| `PT-ADM-04` | `WF-ADM-03` | Save stale Retail Order version | `FX-ADMIN-CONFLICT` plus `order_admin` capability | `WF-ADM-03` | Visible conflict; no overwrite; deliberate reload/compare |
| `PT-ADM-09` | `WF-ADM-04` | Save stale Retail Case version | `FX-ADMIN-CONFLICT` plus `order_admin`/`finance` capability | `WF-ADM-04` | Visible conflict; no overwrite; deliberate reload/compare |
| `PT-ADM-10` | `WF-ADM-03` | Save when transaction capability is unavailable | `FX-ADMIN-TRANSACTION-UNAVAILABLE` plus Review Mode pre-seeded `order_admin`; Participant Mode runs the operator task | `WF-ADM-03` | Record remains unchanged; visible retry/support path; no false success |
| `PT-CMS-00` | `WF-ADM-01` | Enter structured content workspace | Review Mode pre-seeds `content_editor`, then hands off to Participant Mode | `WF-CMS-01` | Operator mode is explicit; no customer surface is silently entered |
| `PT-CMS-01` | `WF-CMS-01` | Edit → validate → preview | Review Mode pre-seeds `content_editor`; Participant Mode runs the operator task with valid structured fields | `WF-CMS-01` | Draft/preview version and actor are visible; no publish action is exposed |
| `PT-CMS-02` | `WF-CMS-01` | Publish without capability or after conflict | Review Mode pre-seeds `content_editor` denied/rollback variant; Participant Mode runs the operator task with `FX-CMS-LIFECYCLE` | `WF-CMS-01` | Visible denial, retained draft, and no silent publish |
| `PT-CMS-03` | `WF-CMS-01` | Publish from the same account with `manager_approver` | Review Mode pre-seeds allowed direct-publish capability; Participant Mode runs the operator task | `WF-CMS-01` | Direct publish is visible with actor/version/audit state |
| `PT-STOCK-01` | `WF-ADM-05` | Open low/depleted/reserved stock alert | Inventory alert fixture | `WF-ADM-05` | Dashboard/header alert shows safe next action and domain identity |
| `PT-NOTIF-01` | `WF-NOTIF-01` | Open role-scoped notification | Recipient/event fixture | `WF-NOTIF-01` | Safe in-app/email expectation and audience-aware link are visible |
| `PT-ADM-05` | `WF-ADM-06` | Open legacy Admin archive | Read-only legacy fixture | `WF-ADM-06` | Archive label and no-mutation boundary are visible |
| `PT-LEGACY-01` | `WF-LEGACY-01` | Visit legacy customer `/order` before activation | Pre-activation fixture | `WF-LEGACY-01` | Safe unavailable/read-only state; no legacy creation |
| `PT-LEGACY-02` | `WF-LEGACY-01` | Follow approved `/order` redirect after activation | Approved-redirect fixture | `WF-RET-01` | Redirect is simulated only; no legacy creation or mutation |

### 7.1 Forbidden prototype transitions

The prototype must not contain a transition that:

- creates an Order, reservation, payment attempt, or checkout total from
  `quote_required`, Retail Request, offered Offer, or accepted Offer alone;
- treats a cart view as a reservation;
- converts Retail Request/Offer into a B2B Quote implicitly;
- sends WhatsApp automatically;
- retries an uncertain payment blindly;
- marks a milestone, refund, reprint, return, or completion without an
  authoritative simulated event and visible history;
- hides a permission/conflict failure while showing success; or
- mutates the read-only legacy `/order` or `/admin/orders` surfaces.

## 8. Responsive composition checkpoints

| Surface family | 390px | 768px | 1024px | 1440px | Evidence required |
| --- | --- | --- | --- | --- | --- |
| Public/B2B | One reading column; form labels/errors adjacent; CTA after meaning | Context above or balanced beside form | Two-column only if reading order survives | Bounded editorial + form composition | No hidden form action; menu focus restoration; no overflow |
| Retail discovery | Filter disclosure/drawer; one result column | Compact filters above results | Persistent filter region permitted | Bounded filter/result composition | Drawer focus trap/return; unavailable meaning before CTA |
| Configurator | Step stack → file/config → result → action | Single workspace with compact step summary | Context rail + workspace/summary | Three bounded regions where readable | File error remains adjacent; persistent action never covers content |
| Cart/checkout | Lines → fulfillment → deltas → explicit total → action | Stacked review with compact summary | Two-column review/summary | Bounded transaction composition | Old/new values and reconfirmation visible before payment |
| Order/after-sales | State/next action first; vertical timeline | Timeline and details may split | Summary/timeline/action regions | Bounded reading/history width | Deadline/error/action never hidden inside collapsed content |
| Admin/CMS | Responsive-safe record identity/state; action level TBD | Filters above labelled result rows | Full queue/detail permitted | Dense, bounded operational layout | No assumption of full mobile operation; visible conflict/permission |

Global constraints:

- No unintended horizontal page overflow.
- A data table may become labelled rows or an accessible scroll region, but
  neither may lose column meaning or current-record identity.
- Sticky actions are optional prototype treatment, not authority. If used, they
  must not obscure content, errors, browser zoom, or focus.
- Modal/drawer focus is trapped, named, escapable where safe, and returned to
  the trigger.

### 8.1 Visual-system handoff

This packet remains a bounded flow/wireframe artifact, but every prototype
surface must inherit the current design guardrail rather than inventing a
parallel visual system:

| Surface | Typography | Visual grammar | Required meaning |
| --- | --- | --- | --- |
| Public/B2B | Poppins for display/UI emphasis; Inter for body/forms | Experimental Editorial Hybrid, authentic evidence, semantic tokens, restrained motion | B2B-primary narrative and clear Retail secondary path |
| Retail/customer | Poppins for headings/actions; Inter for body/status | Calm commerce composition, flat-first panels, semantic status/focus tokens | Safe price/ETA, ownership, payment, milestone, and recovery meaning |
| Admin/CMS | Inter for dense operational text; Poppins only for bounded emphasis; mono only for genuine identifiers | Dense-but-calm, role-aware, status-led, auditable, no decorative telemetry | Lifecycle, capability, conflict, next action, and audit visibility |

Use existing semantic roles from `DESIGN.md` and `frontend/src/index.css` when a
prototype implementation is later authorized. Do not introduce hard-coded
palette, radius, shadow, or typography substitutes, and do not copy public
editorial composition into Admin Studio.

## 9. Synthetic fixture contract

All `FX-*` identifiers and values are packet-local. Fixture data must be visibly
marked `SIMULASI`, contain no real customer information, and reset without
persistence.

| Fixture | Purpose | Minimum data | Deliberate limitation |
| --- | --- | --- | --- |
| `FX-B2B-VALID` | Successful form-first Inquiry | Pre-submit synthetic company/person/contact/need/timeline/brief with checked-consent variant; reference/status appear only after `PT-B2B-01` | No real WhatsApp number or message delivery |
| `FX-B2B-INVALID` | Form recovery | Missing/invalid required fields and unchecked consent | No account enumeration or raw backend error |
| `FX-B2B-PERSISTENCE-FAIL` | Durable-write recovery | Valid form plus simulated persistence-unavailable result | No Inquiry UUID or fake acknowledgement |
| `FX-EXT-PUBLIC` | Public pre-submit external-action source | Public capability context and validated public-settings destination | No Inquiry or acknowledgement exists |
| `FX-EXT-B2B` | Acknowledged Inquiry external-action source | Durable Inquiry acknowledgement and validated public-settings destination | No automatic send or status mutation |
| `FX-B2B-HANDOFF` | Retail-to-B2B lifecycle handoff | `INQ-DEMO-001` with canonical Inquiry status `new`, source `REQ-DEMO-001`, separate `b2b_handoff_recorded` source event, preserved context, `sales_estimator` queue owner | No aggregate merge, automatic Quote/Project creation, or Retail Offer |
| `FX-READY-PICKUP` | Ready Product direct path | Published synthetic product, available quantity, pickup, fixed synthetic price, pickup location/operating hours | Not a production catalog or stock claim |
| `FX-READY-DELIVERY-STALE` | Delivery revalidation | Synthetic old/new stock, ETA, rate, `rate_expires_at`, and total; pickup location/hours only when the fallback is pickup | No real logistics quote/provider or post-ready collection window |
| `FX-FULFILLMENT-UNAVAILABLE` | Delivery provider unavailable | Provider timeout/unavailable variant, pickup available/unavailable branch, quote-required fallback, and safe explanation | No silent carrier switch or provider activation |
| `FX-CHECKOUT-CREATION-FAIL` | Checkout commit failure | Authoritative checkout draft plus simulated transaction-unavailable creation failure | No partial Order, payment attempt, reservation, or false success |
| `FX-AUTH-BOUNDARY` | Authentication continuation | Anonymous draft, `cart_continuation`, `configurator_continuation`, authenticated owner, pre-Order session expiry, post-Order reauthentication, and seeded sign-in variants | No registration/security implementation or account enumeration |
| `FX-DASHBOARD` | Customer dashboard entry | Authenticated owner with one owned Request/Offer/Order/Case next-action variant and role-scoped notification summary | No foreign record, internal note, or account namespace migration |
| `FX-MIXED-CART` | Mixed-cart separation | One eligible direct item plus one authenticated `quote_required` item; Request reference is absent before separation and generated only by `PT-CART-03` | No combined payable total or shared lifecycle |
| `FX-CUSTOM-ELIGIBLE` | Automatic calculation branch | `bracket-demo-v3.stl`, synthetic file version, PLA, grams, duration, price components, ETA, policy ID/version, `effective_at`, included-service labels, final-only rounding, and tax `fixture/gated` label | No real upload/slicing/calibrated profile |
| `FX-CUSTOM-QUOTE` | `quote_required` branch | Pre-handoff safe reason category and retained context; `REQ-DEMO-001` appears only after explicit handoff | No approximate committed price/ETA or Order/reservation/payment |
| `FX-REQUEST-ROUTING` | Retail Request routing | Organizational/complex/partnership B2B branch and individual/UMKM Assisted Offer branch with preserved context | No automatic lifecycle merge or customer type inference |
| `FX-CUSTOM-RECOVERY` | File/analysis recovery | Invalid, unsupported, unsafe, too-large, and analysis-failed variants with retained context plus reason-specific replace/retry/request-review extension | No raw scanner/provider detail or approximate result |
| `FX-OFFER-ACTIVE` | Assisted Retail Offer | `REQ-DEMO-001`, `OFF-DEMO-001`, immutable version, synthetic scope/breakdown/ETA/expiry | Expiry is scenario metadata, not default policy |
| `FX-OFFER-TERMINAL` | Offer expiry/supersession/revalidation | Expired, superseded, owner/version conflict, and safe Request return | No inactive-version checkout or payment CTA |
| `FX-PAY-UNCERTAIN` | Reconciliation-safe payment | `ORD-DEMO-001`, `PAY-DEMO-001`, synthetic amount/currency, active-reservation remaining time/five-minute warning variant, expired-reservation variant, and unknown outcome | No gateway branding, retry, or settlement claim |
| `FX-PAY-ACTION-REQUIRED` | Payment action-required state | Synthetic attempt reference, one approved customer action, safe failure/recovery copy | No duplicate prominent payment action |
| `FX-PAY-PENDING` | Payment pending/processing state | Synthetic attempt reference, pending status, safe check-status action | No duplicate prominent payment action |
| `FX-PAY-TERMINAL` | Payment terminal recovery | Succeeded, failed, cancelled, and expired attempt variants with explicit next action | No raw provider code or unsupported retry promise |
| `FX-RESERVATION-STATES` | Reservation lifecycle | Active 30-minute timer, five-minute warning, consumed, released, expired, and fresh-revalidation variants | No real clock, provider, or automatic extension |
| `FX-ORDER-READY-PICKUP` | Ready Product pickup milestones | One canonical milestone variant, ETA range, pickup location/operating hours, `ready_for_pickup` event, and post-ready collection window | No percentage or telemetry; window is never selected at checkout |
| `FX-ORDER-READY-DELIVERY` | Ready Product delivery milestones | One canonical milestone variant and ETA range | No real carrier tracking |
| `FX-ORDER-CUSTOM-PICKUP` | Custom Print pickup milestones | One canonical milestone variant, safe ETA/reason history | No live printer telemetry |
| `FX-ORDER-CUSTOM-DELIVERY` | Custom Print delivery milestones | One canonical milestone variant, safe ETA/reason history | No real carrier tracking |
| `FX-ORDER-OVERDUE` | ETA recovery | Prior/new range and safe reason category | No automatic remedy promise |
| `FX-ORDER-PICKUP-OVERDUE` | Pickup collection recovery | `ready_for_pickup`, selected collection window, seven-calendar-day governed interval, reminder/manual-follow-up state | No automatic cancellation, disposal, or fee |
| `FX-ORDER-EXCEPTIONS` | Production/payment exception states | `file_revision_required`, `on_hold`, `rework_required`, payment/cancellation/refund review, safe owner and next action | No automatic refund, cancellation, or reprint inference |
| `FX-AFTER-REVIEW` | After-sales distinction | Case reference, evidence request, `order_admin`/`finance` review, `manager_approver` approval, execution/result fixtures, owner and required-action fields | No real legal/Finance/provider execution |
| `FX-AFTER-LIFECYCLE` | After-sales eligibility matrix | Pre-payment, paid-before-work, in-production, after-receipt, customer-cause, and conforming states with allowed remedies | No automatic refund/reprint/return decision |
| `FX-ADMIN-CONFLICT` | Operator recovery | Role/domain, record version mismatch, retained draft, safe history | UI visibility is not authorization evidence |
| `FX-ADMIN-TRANSACTION-UNAVAILABLE` | Admin fail-closed transaction recovery | Operator save attempt plus unavailable transaction capability, unchanged record, retry/support action | No false success or non-atomic fallback |
| `FX-ADMIN-ROLE-CAPABILITY` | Operator authorization | Exact approved roles `content_editor`, `catalog_manager`, `warehouse`, `order_admin`, `sales_estimator`, `designer_engineer`, `production`, `quality_control`, `finance`, `manager_approver`, `super_admin`; explicit scenario seed matrix below; resource/capability/allowed-denied action | UI controls never replace backend authorization |
| `FX-CMS-LIFECYCLE` | Structured CMS lifecycle | Draft, review, preview, publish, schedule, archive, rollback, actor, version conflict, allowed `manager_approver` direct-publish variant, denied non-approver variant | No CMS schema/source activation |
| `FX-OWNERSHIP-DENIED` | Foreign-record protection | Owned session attempts a foreign Order/Offer/Request/Case reference | No existence enumeration or protected data |
| `FX-NOT-FOUND` | Safe missing-record state | Nonexistent or expired reference with same customer-safe response shape | No internal ID disclosure |
| `FX-STOCK-ALERT` | Inventory/restock notification | Low, depleted, reserved, projected-shortage, and conflict alert with safe next action | No data-bearing restock execution |
| `FX-NOTIFICATION-ROLE` | Role-scoped notification | Dashboard/email event including `ready_for_pickup`/`pickup_overdue` variants, audience, safe deep link, delivery state | No provider activation or WhatsApp fallback |
| `FX-LEGACY-ARCHIVE` | Legacy Admin archive | Historical read-only Order projection, explicit legacy label, no mutation capability | No active Retail workbench or payment instruction |
| `FX-LEGACY-ORDER` | Customer legacy compatibility | Safe unavailable, approved redirect, and historical read-only variants | No legacy creation, edit, payment, or retry |

### 9.1 Deterministic operator capability seeds

Every Admin/CMS scenario selects one row below. A prototype may display only
the allowed action for the selected seed, but it must also make the denied
action understandable when the scenario tests recovery.

| Scenario branch | Exact role seed | Resource | Allowed action | Denied action |
| --- | --- | --- | --- | --- |
| `SCN-ADM-01` Order conflict | `order_admin` | Retail Order | Read, edit allowed operational fields, recover stale save | Change customer projection outside capability |
| `SCN-ADM-TRANSACTION-01` transaction unavailable | `order_admin` | Retail Order | Retry/support after fail-closed save | Treat unavailable transaction as success |
| `SCN-ADM-REQUEST-01` Retail Request review | `sales_estimator` | Retail Request/Offer | Read, prepare draft Offer, route | Approve/publish customer-visible Offer |
| `SCN-ADM-02` Offer approval | `manager_approver` | Retail Offer | Approve/reject immutable version | Edit unrelated Order or B2B aggregate |
| `SCN-AFS-REVIEW-01` Case review | `order_admin` | Retail Case | Read/review and prepare governed remedy | Approve/execute a remedy |
| `SCN-AFS-FINANCE-01` Finance reconciliation | `finance` | Retail Case/Finance projection | Prepare reconciliation after approval | Approve refund/free reprint/replacement |
| `SCN-CMS-01` content editing | `content_editor` | Structured content | Edit draft, validate, preview | Publish directly |
| `SCN-CMS-02` lifecycle recovery | `content_editor` | Structured content | View rollback/archive/schedule history | Publish or delete without capability |
| `SCN-CMS-03` direct publish | `manager_approver` | Structured content | Direct publish with actor/version audit | Silent publish without audit |
| `SCN-STOCK-01` stock alert | `warehouse` | Inventory/restock alert | Read alert and safe next action | Payment, Offer, or customer-content mutation |

Role combinations are fixture data, not a new permission model. Route-to-
permission mapping and account activation remain gated by `DEC-ACCESS-002`.

### 9.2 Simulation boundary presentation

- Participant Mode uses one persistent neutral notice: this is a prototype with
  simulated data and no real order/payment/submission.
- It must not reveal the expected task outcome or tell the participant which
  action to choose.
- Review Mode additionally shows fixture ID, active flow/frame, open gates, and
  emitted prototype events.
- Synthetic currency, dates, quantities, phone numbers, UUIDs, and statuses are
  never copied into canonical pricing, policy, source, or test fixtures without
  separate review.

## 10. Accessibility and interaction evidence plan

Accessibility principles apply even though exact conformance remains open under
packet-local parent gate `AG-UX-A11Y`.

| Evidence | Required prototype check | Pass condition |
| --- | --- | --- |
| Keyboard path | Complete every selected primary flow without pointer input | All controls reachable/operable in meaningful order; no trap except a valid modal/drawer |
| Focus management | Route/frame transition, validation, modal/drawer, acknowledgement, conflict | Focus lands on the new task/status/error target and returns safely when dismissed |
| Names and instructions | Form controls, icon-only controls, status, step/context | Accessible name and relationship communicate purpose without visual position alone |
| Error recovery | B2B form, file state, checkout stale state, Admin conflict | Error summary and owning field/state are linked; entered context is retained when safe |
| Dynamic status | Validation, payment, acknowledgement, conflict | Meaningful changes are announced once without flooding; sighted feedback is also visible |
| Non-color meaning | Offer/payment/milestone/after-sales statuses | Text/structure/icon supplement color; status remains understandable in grayscale |
| Reflow and zoom | 390px reference plus browser zoom/reflow | No task-blocking overlap, clipping, or two-dimensional page scroll |
| Reduced motion | Every animated transition used by the prototype | Meaning and task completion remain intact with reduced motion |
| Target size | Primary/secondary controls | Practical 44×44 CSS-pixel target or an explicitly documented equivalent |
| Ownership safety | Owned/foreign/not-found fixture | Foreign-record existence is not enumerated; no protected data leaks |

No `WCAG 2.2 AA` or other conformance claim may be made until the governing
target and accountable validation owner are approved.

## 11. Validation scenario cards

Every `SCN-*` ID is packet-local. These scripts describe tasks, not expected
click sequences. A human moderated session still requires separate approval.

| Scenario | Participant task | Start fixture/frame | Critical observation | Safe completion |
| --- | --- | --- | --- | --- |
| `SCN-B2B-01` | Send enough context for Niuva to review a partnership need, then continue by WhatsApp if desired | `WF-PUB-01`, `FX-B2B-VALID` | Form is primary; acknowledgement precedes WhatsApp; response target is not quote/ETA promise | UUID-shaped reference visible; optional user-clicked continuation |
| `SCN-B2B-02` | Recover from an incomplete Inquiry | `WF-B2B-01`, `FX-B2B-INVALID` | Labels/errors/consent understandable; context retained | Valid resubmission reaches acknowledgement |
| `SCN-B2B-03` | Recover when Inquiry persistence is unavailable | `WF-B2B-01`, `FX-B2B-PERSISTENCE-FAIL` | No fake reference; entered context remains and retry is visible | Safe retry or leave without implying submission |
| `SCN-READY-01` | Buy a Ready Product for pickup without assuming the cart reserves stock | `WF-RET-01`, `FX-READY-PICKUP` | Cart vs authoritative checkout distinction; auth continuation | Confirmable simulated checkout or safe no-commit exit |
| `SCN-DASH-01` | Open the customer dashboard and find the owned next action | `WF-DASH-01`, `FX-DASHBOARD` | Owned Request/Offer/Order/Case projections and notification entry are distinct | `PT-DASH-02`–`PT-DASH-06` open only the selected owned surface |
| `SCN-AUTH-RECOVERY-01` | Recover from session expiry before and after an Order exists | `WF-AUTH-01`, `FX-AUTH-BOUNDARY` | Pre-Order draft remains non-authoritative; post-Order ownership is reauthenticated without reservation extension | Safe return to the correct owned task |
| `SCN-AUTH-CART-01` | Sign in and return to the same non-sensitive cart task | `WF-CART-01`, `FX-AUTH-BOUNDARY.cart_continuation` | Cart continuation is deterministic and does not expose private file data | Returns to `WF-CART-01` without unexpected redirect |
| `SCN-AUTH-CFG-01` | Sign in and return to the same configurator task | `WF-CFG-01`, `FX-AUTH-BOUNDARY.configurator_continuation` | Configurator context is deterministic; private upload/analysis remains gated until ownership | Returns to `WF-CFG-01` with safe context retained |
| `SCN-MIXED-01` | Separate an eligible item from a quote-required item in one cart | `WF-CART-01`, `FX-MIXED-CART` | Two lanes; Request reference is absent before separation and stable after `PT-CART-03`; no unknown amount in direct total | Direct lane can continue; Request lane remains separate |
| `SCN-CUSTOM-01` | Configure an eligible Custom Print and understand its calculated result | `WF-CFG-01`, `FX-AUTH-BOUNDARY.authenticated_owner`, `FX-CUSTOM-ELIGIBLE` | Simple/Detailed meaning, file version, grams/time/price/ETA | `PT-CFG-05` carries the eligible context to the conceptual cart without reservation/payment |
| `SCN-CUSTOM-RECOVERY-01` | Recover from invalid, unsafe, oversized, or failed analysis | `WF-CFG-02`, `FX-AUTH-BOUNDARY.authenticated_owner`, `FX-CUSTOM-RECOVERY` | Safe reason, retained context, replace/retry/request-review choices | `PT-CFG-06` creates a Request only after explicit request review; no approximate price/ETA is shown |
| `SCN-QUOTE-01` | Continue when automatic commitment is unavailable | `WF-CFG-02`, `FX-AUTH-BOUNDARY.authenticated_owner`, `FX-CUSTOM-QUOTE` | No approximate final total; Request reference is absent before explicit handoff; Request vs Offer vs B2B distinction | `PT-CFG-03` creates the stable Request reference and shows the safe next action |
| `SCN-QUOTE-ROUTING-01` | Route quote-required work to B2B or Assisted Retail according to scope | `WF-REQ-01`, `FX-REQUEST-ROUTING` | Organizational/complex/partnership work remains B2B; eligible individual/UMKM work remains Retail Offer | Correct lifecycle and next operator action are visible |
| `SCN-B2B-HANDOFF-01` | Verify a partnership Request becomes a separate B2B Inquiry handoff | `WF-REQ-01`, `WF-ADM-02`, `FX-B2B-HANDOFF` | Source Request, Inquiry reference, owner/status, and no-merge boundary are visible | B2B queue receives a durable linked reference without creating a Retail Offer |
| `SCN-OFFER-01` | Accept an Assisted Retail Offer and continue safely | `WF-OFFER-01`, `FX-OFFER-ACTIVE` | Acceptance is not payment/Order/reservation; immutable version/expiry clear | Checkout revalidation begins |
| `SCN-OFFER-RECOVERY-01` | Recover from an expired, superseded, or stale Offer | `WF-OFFER-02`, `FX-OFFER-TERMINAL` | Inactive version is read-only and returns to Request/active version | No payment CTA from inactive version |
| `SCN-OFFER-DECLINE-01` | Decline an active Assisted Retail Offer | `WF-OFFER-01`, `FX-OFFER-ACTIVE` | Decline is a distinct terminal outcome from acceptance and expiry | No Order/reservation/payment or silent re-offer |
| `SCN-CHK-01` | Decide whether to continue after price/ETA/stock/delivery changes | `WF-CHK-01`, `FX-READY-DELIVERY-STALE` | Old/new deltas and total explain the decision | Explicit reconfirmation or safe return/edit |
| `SCN-CHK-FULFILLMENT-01` | Recover when the selected delivery provider is unavailable | `WF-CHK-03`, `FX-FULFILLMENT-UNAVAILABLE` | Pickup and quote-required fallback are explicit; no silent carrier switch | `PT-CHK-05` chooses pickup when available; `PT-CHK-06` opens Request review otherwise |
| `SCN-CHK-CREATION-FAIL-01` | Recover when checkout Order/attempt/reservation creation fails | `WF-CHK-01`, `FX-CHECKOUT-CREATION-FAIL` | Draft remains unchanged; no false Order/payment/reservation success | Retry/support path is visible without duplicate commitment |
| `SCN-RES-01` | Understand a 30-minute reservation, five-minute warning, and expiry recovery | `WF-PAY-01`, `FX-RESERVATION-STATES` | Remaining time, warning, consumed/released/expired meaning, no extension | Fresh revalidation after expiry; no old reservation reuse |
| `SCN-PAY-01` | Determine what to do when payment outcome is unknown | `WF-PAY-02`, `FX-PAY-UNCERTAIN` | No blind retry; reference and reconciliation path visible | Check status, owned Order, or approved support path |
| `SCN-PAY-RECOVERY-01` | Recover from pending/action-required or terminal payment expiry | `WF-PAY-01/03`, `FX-PAY-ACTION-REQUIRED`, `FX-PAY-PENDING`, `FX-PAY-TERMINAL` | One safe status/revalidation path and no duplicate payment action | Customer understands the next approved action |
| `SCN-ORD-01` | Find current Custom Print progress and expected delivery | `WF-ORD-01`, `FX-ORDER-CUSTOM-DELIVERY` | One factual milestone variant; no fake percentage/telemetry | Current state, ETA, and next action understood |
| `SCN-ORD-02` | Respond to an overdue ETA | `WF-ORD-03`, `FX-ORDER-OVERDUE` | Replacement range/reason; no automatic refund promise | Understand new expectation and eligible complaint path |
| `SCN-ORD-PICKUP-OVERDUE-01` | Respond when a ready pickup is not collected within the governed interval | `WF-ORD-03`, `FX-ORDER-PICKUP-OVERDUE` | Selected window, seven-day interval, reminder/manual follow-up, and no automatic cancellation are visible | Customer sees the governed collection action and support path |
| `SCN-ORD-EXCEPTIONS-01` | Understand a file, production, payment, cancellation, or refund exception | `WF-ORD-04`, `FX-ORDER-EXCEPTIONS` | Exception state, owner, history, deadline, and next action are explicit | No automatic remedy or silent state change |
| `SCN-ORD-VARIANTS-01` | Compare all four canonical production/fulfillment milestone sequences | `WF-ORD-02`, `FX-ORDER-READY-PICKUP`, `FX-ORDER-READY-DELIVERY`, `FX-ORDER-CUSTOM-PICKUP`, `FX-ORDER-CUSTOM-DELIVERY` | Ready pickup/delivery and Custom pickup/delivery are not collapsed | Correct state vocabulary and next action per variant |
| `SCN-AFS-01` | Submit/follow an eligible complaint and understand the decision stage | `WF-AFS-01`, `FX-AFTER-REVIEW` | Intake, evidence, review, approval, execution, outcome distinct | Current owner/action and status understood |
| `SCN-AFS-02` | Determine which after-sales action is allowed at each lifecycle phase | `WF-CART-01`/`WF-AFS-01`, `FX-AFTER-LIFECYCLE` | Revision, cancellation, complaint, refund, reprint, and return eligibility is phase-specific | Disallowed remedy is explained without automatic outcome |
| `SCN-AFS-REVIEW-01` | As an operator, review and govern an after-sales Case | `WF-ADM-04`, `FX-AFTER-REVIEW` | Owner, evidence, approval, execution, and outcome remain distinct; role denial is visible | No remedy executes without the required capability/approval |
| `SCN-AFS-FINANCE-01` | Prepare Finance reconciliation after an approved after-sales decision | `WF-ADM-04`, `FX-AFTER-REVIEW` | Finance sees only the approved outcome and reconciliation fields | Finance cannot approve a refund/free reprint/replacement |
| `SCN-ADM-01` | Triage a record and recover from a stale save | `WF-ADM-01`, `FX-ADMIN-CONFLICT` | Correct lifecycle/role; visible conflict; no overwrite | Reload/compare and preserve safe draft/history |
| `SCN-ADM-REQUEST-01` | Prepare an Assisted Retail Offer draft as the assigned reviewer | `WF-ADM-02`, `FX-ADMIN-ROLE-CAPABILITY` | `sales_estimator` can prepare but cannot approve/customer-publish | Draft remains internal and awaits manager approval |
| `SCN-ADM-02` | Approve or reject a prepared Assisted Retail Offer | `WF-ADM-02`, `FX-ADMIN-ROLE-CAPABILITY` | `manager_approver` decision is distinct and auditable | Only approved version becomes customer-visible |
| `SCN-ADM-TRANSACTION-01` | Recover when an Admin save transaction is unavailable | `WF-ADM-03`, `FX-ADMIN-TRANSACTION-UNAVAILABLE` | Record remains unchanged and failure is visible | Retry/support path is shown; no false success |
| `SCN-CMS-01` | Edit and preview content with a non-approver capability | `WF-CMS-01`, `FX-ADMIN-CONFLICT` | Draft/preview and conflict/permission remain distinct; publish is not available to `content_editor` | Safe save/reload/return without silent loss |
| `SCN-CMS-02` | Use rollback/archive/schedule states without losing version history | `WF-CMS-01`, `FX-CMS-LIFECYCLE` | Structured validation, actor, version, schedule/archive, and rollback are visible | No silent publication or destructive overwrite |
| `SCN-CMS-03` | Publish directly from the same account when it has `manager_approver` capability | `WF-CMS-01`, `FX-CMS-LIFECYCLE`, `FX-ADMIN-ROLE-CAPABILITY` | Direct publish is allowed only for the approved capability; actor/version/audit state remain visible | Non-approver remains draft/review-only; no role escalation is implied |
| `SCN-OWNERSHIP-01` | Open a foreign or missing Order/Offer/Case reference | `WF-ORD-01`, `FX-OWNERSHIP-DENIED`, `FX-NOT-FOUND` | Denial and not-found use the same safe projection | No existence enumeration or protected data |
| `SCN-OWNERSHIP-02` | Attempt foreign Request, Offer, and Case references | `WF-REQ-01`, `WF-OFFER-01`, `WF-AFS-02`, `FX-OWNERSHIP-DENIED` | Each object type uses the same non-enumerating safe projection | No protected record, owner, or internal note is revealed |
| `SCN-STOCK-01` | Triage a low/depleted/reserved/conflict stock alert | `WF-ADM-05`, `FX-STOCK-ALERT` | Dashboard/header alert identifies domain and next action | No fake stock movement or provider action |
| `SCN-NOTIF-01` | Inspect a role-scoped dashboard/email notification | `WF-NOTIF-01`, `FX-NOTIFICATION-ROLE` | Recipient, event (`ready_for_pickup` or `pickup_overdue`), safe link, channel, and delivery state are clear | No WhatsApp fallback or unrelated data |
| `SCN-LEGACY-01` | Distinguish active Retail Order workbench from legacy Admin archive and customer `/order` | `WF-ADM-06`, `WF-LEGACY-01`, `FX-LEGACY-ARCHIVE`, `FX-LEGACY-ORDER` | Active route, read-only archive, and safe compatibility state never merge | No legacy creation or mutation control appears |

### 11.1 Observation record

For each scenario and viewport record:

- participant role and task start state;
- mode and fixture ID;
- first interpretation of current state;
- chosen primary/secondary action and reason;
- error, hesitation, backtrack, or false assumption;
- keyboard/focus/reflow/accessibility evidence;
- final understood state and next action;
- finding severity, affected `UX-*`/`FLOW-*`/`WF-*`, and disposition; and
- any open gate the prototype could not safely simulate.

Do not record unnecessary personal data or treat facilitator hints as successful
task completion.

## 12. Open-gate handling

This packet does not close any gate from the parent candidate.

| Gate | Prototype treatment | Must not be inferred |
| --- | --- | --- |
| `AG-UX-03` | Use current canonical path hierarchy; label final CTA/navigation treatment review-only | Final public navigation or production copy approval |
| `AG-UX-05` | Use the smallest queue/detail shell needed for `SCN-ADM-01` | Final Admin IA or route placement |
| `AG-AUTH-01/02/04` | Simulate authenticated/unauthenticated fixtures and allowlisted continuation | Registration/security/API/permission implementation |
| `AG-UX-MVP-PRIORITY` | Prototype the eight critical flows; label supporting frames and unresolved delivery order | Canonical backlog priority |
| `AG-UX-ADMIN-MOBILE` | Show responsive-safe identity/state and flag action support TBD | Full, limited, or read-only smartphone policy |
| `AG-UX-A11Y` | Apply approved principles and collect evidence without a conformance badge | `WCAG 2.2 AA` or another compliance claim |
| `AG-UX-CART-ROUTE` | Use `WF-CART-01` as a conceptual frame with no product URL | `/retail/cart` route approval |
| `AG-UX-AFTER-ROUTES` | Use `WF-AFS-01/02` frame IDs rather than declaring product URLs | Exact customer after-sales route/state ownership |
| `DEC-OFFER-01` activation gates | Simulate file/result branches and mark thresholds/profile/expiry as fixture-only | Approved technical thresholds or commercial activation |
| `DEC-TAX-01` | Label tax treatment as fixture/gated; never silently select a production rule | PKP, rate, basis, invoice, or effective date |
| `ADR-003` | Use provider-neutral payment states and reconciliation | Gateway, webhook contract, Finance SLA, or activation |
| `DEC-FUL-01` | Use synthetic pickup/delivery data and visible rate expiry | Origin, carrier/service allowlist, package profiles, or operations readiness |
| `DEC-ETA-01` | Use canonical inputs/state variants with synthetic ranges | Numeric production calendars/buffers or guaranteed dates |
| `DEC-AFTER-01` | Simulate policy stages and clearly mark legal/execution gates | Final legal terms, retention, provider execution, or automatic remedy |
| `DEC-OPS-003` | Show structured fields, preview, publish permission, version conflict | Final schema, SOP, training, or CMS completeness |
| `DEC-ACCESS-001/002` | Use the approved stable granular role IDs and synthetic capability/denial states; keep route-to-permission mapping and activation gated | Account migration, rollout, or source authorization |
| `DEC-ACCESS-003` / `DEC-PAY-02` | Keep legacy Order/manual-transfer records read-only and customer-safe | Re-enabling legacy mutation or new manual-transfer/payment-proof activity |
| `DEC-OPS-002` | Show inventory/restock alerts through the header/dashboard support frame | New sidebar scope, stock mutation, scheduler, or alert activation |

## 13. Traceability

### 13.1 Requirement to frame and scenario

| Imported candidate requirement | Frames | Prototype transitions | Validation scenarios | Remaining evidence |
| --- | --- | --- | --- | --- |
| `UX-FOUND-001` | `WF-PUB-01`, all Retail/B2B/Admin frames | All | All | Cross-flow language review |
| `UX-B2B-001` | `WF-PUB-01/02`, `WF-B2B-01/02` | `PT-PUB-01/02/03/04/05`, `PT-B2B-01/02/03/04` | `SCN-B2B-01/02/03` | Final form/copy, browser, participant evidence |
| `UX-B2B-002` | `WF-B2B-02`, `WF-EXT-01` | `PT-B2B-01`, `PT-B2B-03`, `PT-PUB-03`, `PT-EXT-01/02/03` | `SCN-B2B-01` | Response-target comprehension, explicit external-action confirmation, and owner review |
| `UX-RET-001` | `WF-AUTH-01`, `WF-CFG-01/02/03`, `WF-CART-01`, `WF-CHK-01/02`, `WF-DASH-01` | `PT-CART-01/02`, `PT-AUTH-01/02/03/04/05`, `PT-DASH-01/02/03/04/05/06` | `SCN-READY-01`, `SCN-DASH-01`, `SCN-AUTH-RECOVERY-01`, `SCN-AUTH-CART-01`, `SCN-AUTH-CFG-01`, `SCN-MIXED-01`, `SCN-CUSTOM-01` | Registration/continuation contract and security evidence |
| `UX-RET-002` | `WF-CFG-02/03`, `WF-CART-01`, `WF-REQ-01` | `PT-CFG-02/03/04/05/06`, `PT-CART-03`, `PT-REQ-01/02/03` | `SCN-CUSTOM-01`, `SCN-CUSTOM-RECOVERY-01`, `SCN-MIXED-01`, `SCN-QUOTE-01`, `SCN-QUOTE-ROUTING-01`, `SCN-B2B-HANDOFF-01` | Branch/comprehension evidence |
| `UX-OFFER-001` | `WF-REQ-01`, `WF-OFFER-01/02` | `PT-OFFER-01/02/03/04/05`, `PT-ADM-02/03`, `PT-ADM-03-DENY` | `SCN-OFFER-01`, `SCN-OFFER-RECOVERY-01`, `SCN-OFFER-DECLINE-01`, `SCN-ADM-02` | No-side-effect, immutable-version, and approval evidence |
| `UX-CHECKOUT-001` | `WF-CHK-01/02/03` | `PT-CHK-01/02/03/04/05/06` | `SCN-CHK-01`, `SCN-CHK-FULFILLMENT-01`, `SCN-CHK-CREATION-FAIL-01` | Delta, fallback, and no-commit recovery evidence |
| `UX-RES-001` | `WF-CHK-01`, `WF-PAY-01/03` | `PT-PAY-01`, `PT-RES-01/02/03/04/05` | `SCN-READY-01`, `SCN-RES-01` | Timer/expiry/competing-transition evidence |
| `UX-PAY-001` | `WF-PAY-01/02/03` | `PT-PAY-02/03/04/05/06` | `SCN-PAY-01`, `SCN-PAY-RECOVERY-01` | Action-required/pending/terminal/back/reload/retry/reconciliation evidence |
| `UX-ORDER-001` | `WF-ORD-01/02/03/04` | `PT-ORD-01/02/03/04/05/06/07`, `PT-AUTH-03` | `SCN-ORD-01/02`, `SCN-ORD-PICKUP-OVERDUE-01`, `SCN-ORD-VARIANTS-01`, `SCN-ORD-EXCEPTIONS-01`, `SCN-AUTH-RECOVERY-01`, `SCN-OWNERSHIP-01/02` | Four-variant, exception, reauth, pickup, and ownership walkthrough evidence |
| `UX-AFTER-001` | `WF-CART-01`, `WF-AFS-01/02`, `WF-ADM-04`, `WF-ORD-04` | `PT-AFS-00/01/02/03/04/05/06`, `PT-ADM-08/09` | `SCN-AFS-01/02`, `SCN-AFS-REVIEW-01`, `SCN-AFS-FINANCE-01` | Eligibility/approval/remedy comprehension |
| `UX-ADMIN-001` | `WF-ADM-01/02/03/04/05/06`, `WF-NOTIF-01` | `PT-ADM-00/01/02/03/04/05/07/08/09/10`, `PT-REQ-02`, `PT-AFS-04/05/06`, `PT-STOCK-01`, `PT-NOTIF-01` | `SCN-ADM-01`, `SCN-ADM-REQUEST-01`, `SCN-ADM-02`, `SCN-ADM-TRANSACTION-01`, `SCN-AFS-REVIEW-01`, `SCN-AFS-FINANCE-01`, `SCN-B2B-HANDOFF-01`, `SCN-STOCK-01`, `SCN-NOTIF-01`, `SCN-LEGACY-01` | Non-IT operator, permission, inventory, notification, transaction, and legacy-boundary evidence |
| `UX-CMS-001` | `WF-CMS-01` | `PT-CMS-00/01/02/03` | `SCN-CMS-01/02/03` | Draft/preview/publish/rollback/conflict/direct-approver evidence |
| `UX-PRIV-001` | All public/customer/Admin frames, `WF-LEGACY-01`, `WF-OWN-SAFE` | All owned-record transitions, `PT-LEGACY-01/02`, `PT-OWN-01/02/03/04` | All, especially `SCN-OWNERSHIP-01/02` and `SCN-LEGACY-01` | Projection and non-enumeration review |
| `UX-RESP-001` | All frames | N/A | All selected at required widths | Screenshot/reflow/overflow evidence |
| `UX-A11Y-001` | All frames | All interactive transitions | All | Automated and manual evidence; conformance target gated |

### 13.2 Canonical concern mapping

| Concern | Governing authority |
| --- | --- |
| Homepage and public visual direction | `DEC-UX-001`, `DEC-UX-002` |
| Single-origin surface topology and route boundary | `DEC-ARCH-01`, `ADR-004` |
| B2B form-first Inquiry, routes, and Admin queue ownership | Amended `DEC-UX-003` |
| Retail account requirement | `DEC-RT-02` |
| File/configuration/automatic-price/quote/Assisted Offer | `DEC-OFFER-01` |
| Custom Print commercial formula | `DEC-PRICE-001` |
| Reservation duration and race invariants | `DEC-INV-01` |
| Payment orchestration and reconciliation | `ADR-003` |
| Existing manual-transfer records remain read-only | `DEC-PAY-02`, `DEC-ACCESS-003` |
| ETA and factual milestone variants | `DEC-ETA-01` |
| Pickup/delivery | `DEC-FUL-01` |
| Revision and after-sales | `DEC-AFTER-01` |
| Notifications and no automatic WhatsApp fallback | `DEC-DATA-003` |
| Admin/CMS direction | `DEC-OPS-001`, `DEC-OPS-002`, `DEC-OPS-003` |
| Granular internal role and permission boundaries | `DEC-ACCESS-001`, `DEC-ACCESS-002`, `DEC-ACCESS-003` |
| Tokens, component hierarchy, and surface grammar | `DESIGN.md` |
| Journey/lifecycle separation and private projections | `docs/NIUVA_MASTER_SPEC.md` |

### 13.3 Canonical and candidate route-to-frame binding

This table binds the prototype to canonical route ownership without activating
or implementing any route. Rows labelled `candidate/source` reflect the
approved candidate route direction or current implementation evidence; they do
not approve exact Admin navigation, permission mappings, or activation. Cart
and exact customer after-sales URLs remain candidate/TBD as explicitly marked.

| Canonical route or boundary | Frame(s) | Prototype transition | Binding status |
| --- | --- | --- | --- |
| `/` | `WF-PUB-01` | `PT-PUB-01` | Canonical public alias; composition remains review-only |
| `/capabilities` | `WF-PUB-02` | `PT-PUB-02`, `PT-PUB-03`, `PT-PUB-05` | Canonical public alias; no separate service route |
| `/contact#form-konsultasi` | `WF-B2B-01/02` | `PT-B2B-01`, `PT-B2B-02`, `PT-B2B-03`, `PT-B2B-04` | Canonical form-first Inquiry |
| `/login` | `WF-AUTH-01` | `PT-AUTH-01`, `PT-AUTH-02`, `PT-AUTH-03`, `PT-AUTH-04`, `PT-AUTH-05` | Existing shared customer-auth boundary; continuation and reauthentication are simulated |
| `/register` | `WF-AUTH-01` | Review-only gated control; no Participant CTA | Canonical account-creation route, inactive until activation contract |
| `/retail` and `/retail/products/:slug` | `WF-RET-01` | `PT-PUB-04`, `PT-RET-01` | Canonical discovery; transaction remains inactive |
| `/retail/products/:slug/configure` | `WF-CFG-01/02/03` | `PT-CFG-01`, `PT-CFG-02`, `PT-CFG-03`, `PT-CFG-04`, `PT-CFG-05`, `PT-CFG-06` | Canonical route; private upload/analysis gated |
| `/retail/cart` | `WF-CART-01` | `PT-CART-01/02/03` | Candidate exact route; no URL authority or reservation |
| `/retail/requests/:requestId` | `WF-REQ-01` | `PT-CFG-03`, `PT-REQ-01/02/03` | Canonical owned Request; B2B/Retail routing remains separate |
| `/retail/offers/:offerId` | `WF-OFFER-01/02` | `PT-OFFER-01`, `PT-OFFER-02`, `PT-OFFER-03`, `PT-OFFER-04`, `PT-OFFER-05` | Canonical owned Offer; expiry/version gated |
| `/retail/checkout` | `WF-CHK-01/02/03`, `WF-PAY-01/02/03` | `PT-CHK-01`, `PT-CHK-02`, `PT-CHK-03`, `PT-CHK-04`, `PT-CHK-05`, `PT-CHK-06`, `PT-PAY-01`, `PT-PAY-02`, `PT-PAY-03`, `PT-PAY-04`, `PT-PAY-05`, `PT-PAY-06`, `PT-RES-01`, `PT-RES-02`, `PT-RES-03`, `PT-RES-04`, `PT-RES-05` | Canonical provider-neutral checkout; activation gated |
| `/orders/:id` | `WF-ORD-01/02/03/04`, `WF-AFS-01/02` | `PT-ORD-01`, `PT-ORD-02`, `PT-ORD-04`, `PT-ORD-05`, `PT-ORD-06`, `PT-ORD-07`, `PT-AFS-00`, `PT-AFS-01`, `PT-AFS-02`, `PT-AFS-03` | Canonical owned Order; exact after-sales URLs remain gated |
| Owned-record authorization boundary (no URL) | `WF-OWN-SAFE` | `PT-ORD-03`, `PT-OWN-01`, `PT-OWN-02`, `PT-OWN-03`, `PT-OWN-04` | Same non-enumerating projection for foreign/not-found references; no sign-in implication |
| `/dashboard` | `WF-DASH-01` | `PT-DASH-01`, `PT-DASH-02`, `PT-DASH-03`, `PT-DASH-04`, `PT-DASH-05`, `PT-DASH-06` | Canonical customer namespace; exact IA remains review-only |
| `/dashboard/notifications` | `WF-NOTIF-01` | `PT-NOTIF-01` | Canonical notification destination; provider activation gated |
| `/admin` | `WF-ADM-01` | `PT-ADM-00` | Candidate/source Admin home; exact navigation/permissions remain gated |
| `/admin/content` | `WF-CMS-01` | `PT-CMS-00`, `PT-CMS-01`, `PT-CMS-02`, `PT-CMS-03` | Candidate/source CMS route; exact fields/navigation/permissions remain gated |
| `/admin/retail-requests` | `WF-ADM-01/02` | `PT-ADM-01`, `PT-ADM-02`, `PT-ADM-03`, `PT-ADM-03-DENY` | Approved route direction; exact navigation/permissions remain gated |
| `/admin/retail-requests/:id` | `WF-ADM-02` | `PT-ADM-01`, `PT-ADM-02`, `PT-ADM-03`, `PT-ADM-03-DENY` | Candidate/source detail binding; Retail Request/Offer remains separate from B2B |
| `/admin/inquiries` | `WF-ADM-01/02` | `PT-REQ-02`, `PT-ADM-01` | Candidate/source B2B queue; exact navigation/permissions remain gated; no Retail Offer merge |
| `/admin/inquiries/:id` | `WF-ADM-02` | `PT-REQ-02`, `PT-ADM-01` | Candidate/source B2B detail; Inquiry→Quote/Project lifecycle remains separate |
| `/admin/retail-orders` | `WF-ADM-01/03` | `PT-ADM-01`, `PT-ADM-07`, `PT-ADM-04` | Approved route direction; exact navigation/permissions remain gated |
| `/admin/retail-orders/:id` | `WF-ADM-03` | `PT-ADM-07`, `PT-ADM-04`, `PT-ADM-10` | Candidate/source detail binding; one active Retail Order workbench |
| `/admin/retail-cases` | `WF-ADM-01/04` | `PT-ADM-01`, `PT-ADM-08`, `PT-AFS-04`, `PT-AFS-05`, `PT-AFS-06` | Approved route direction; exact navigation/permissions remain gated |
| `/admin/retail-cases/:caseId` | `WF-ADM-04` | `PT-ADM-08`, `PT-AFS-04`, `PT-AFS-05`, `PT-AFS-06`, `PT-ADM-09` | Candidate/source detail binding; exact permission/activation remains gated |
| `/admin/inventory` and header restock alert | `WF-ADM-05` | `PT-STOCK-01` | Supporting inventory/alert surface; source activation gated |
| `/admin/orders` | `WF-ADM-06` | `PT-ADM-05` | Labelled read-only legacy archive; never an active workbench |
| `/order` | `WF-LEGACY-01` | `PT-LEGACY-01`, `PT-LEGACY-02` | Safe unavailable/redirect/read-only compatibility; no legacy creation |
| Exact customer after-sales routes | `WF-AFS-01/02` | `PT-AFS-01/02/03` | Frame-only candidate; route/state ownership remains TBD |

The following canonical/source routes are intentionally not represented by a
dedicated frame in this bounded validation packet; this is an exclusion, not a
route decision or implementation authorization:

| Excluded route family | Reason |
| --- | --- |
| `/about`, `/privacy`, `/faq`, `/projects`, `/services`, `/portfolio` | Public content/compatibility surfaces outside the selected eight critical flows |
| `/admin/portfolio` and `/admin/portfolio/:id` | CMS/portfolio breadth outside the single conflict-and-recovery frame; exact Admin navigation remains gated |

## 14. Prototype validation exit criteria

The verdict applies only to this packet and a later prototype built exactly from
it. It does not apply to source implementation, human-session authorization,
provider activation, staging, production readiness, or go-live.

| Verdict | Criteria |
| --- | --- |
| `PASS` | Every selected scenario is completable without evaluator hints; commitment/ownership meanings are correct; required responsive/accessibility/copy evidence exists; no unresolved gate was silently selected; findings have accepted dispositions. |
| `PASS WITH CONDITIONS` | Critical flow meanings remain safe and completable, while explicitly labelled owner decisions or non-critical evidence remain open and are not represented as implemented/active. |
| `REVISE` | A critical flow is incomplete, misleading, inaccessible, internally contradictory, or dependent on a silently assumed gate. |

Automatic `REVISE` conditions:

- Inquiry appears submitted without durable acknowledgement or WhatsApp becomes
  the system of record;
- a participant mistakes Request, Offer acceptance, cart, reservation, Order,
  payment pending, or payment uncertain for another commitment state;
- `quote_required` shows an authoritative checkout total;
- payment uncertainty presents a blind duplicate-payment action;
- foreign-record existence or protected data is exposed;
- a critical keyboard, focus, semantic-error, or reflow blocker prevents task
  completion;
- production progress uses fake percentage, exact queue position, or unverified
  telemetry;
- an operator cannot see or recover from a permission/version conflict; or
- the prototype silently selects a provider, technical threshold, tax rule,
  route, owner, Admin-mobile level, accessibility target, or legal policy.

No numerical usability threshold is introduced by this packet.

## 15. Build and evidence handoff

If separately authorized, the next prototype-building task card must name:

- its isolated location and exact baseline SHA;
- selected frames/scenarios and any explicitly excluded frame;
- whether it is static or uses the existing application stack;
- exact prototype-only files and confirmation that production imports remain
  one-way or absent;
- fixture/reset behavior and proof that no real endpoint/provider is called;
- Participant/Review Mode separation;
- required 390px, 768px, 1024px, and 1440px screenshots;
- keyboard, focus, error, reflow, reduced-motion, and console checks;
- expected contract tests, browser checks, and cleanup/retention policy;
- unresolved gates and their visible prototype treatment; and
- separate authorization boundaries for edit, commit, push, PR, human session,
  source promotion, provider activation, deployment, readiness, and go-live.

## 16. Current packet verdict and next step

**Current packet-maturity verdict:** `PASS WITH CONDITIONS` — independent
Round 5 review complete; 0 P0, 0 P1, 0 P2. The evidence record is
`2026-08-08-niuva-mvp-annotated-wireframe-bounded-prototype-formal-expert-critique-r5.md`.

The dual review found no unresolved critical-flow or traceability blocker. One
Assessment A concern about the B2B response target was adjudicated against the
baseline `DEC-UX-003` amendment and `DECISION_REGISTER`: the one-working-day
target, Niuva Operations owner, and Monday–Friday 09.00–17.00 WIB calendar are
canonical and are not a new fixture-only policy. Assessment B independently
confirmed all packet-local IDs, imported authority references, route bindings,
and whitespace/fence integrity.

Conditions retained:

1. Every prototype surface must remain visibly simulated and isolated from
   production behavior.
2. Cart and exact customer after-sales URLs remain unresolved; frame IDs must be
   used instead of inventing route authority.
3. Admin smartphone policy and accessibility conformance remain open.
4. Synthetic commercial, ETA, expiry, fulfillment, tax, and payment values must
   not be presented as Niuva production policy.
5. Building the prototype and running any human validation session each require
   separate explicit authorization.
6. The next gate is an isolated prototype-building task card. It remains
   candidate-only and does not authorize application implementation or a human
   session.

This packet does not authorize implementation, canonical promotion, staging,
commit, push, PR, provider activation, deployment, production readiness, or
go-live.
