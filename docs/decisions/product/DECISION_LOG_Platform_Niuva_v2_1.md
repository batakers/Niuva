# Decision Log Platform Niuva v2.1

Status: Active Decision Register
Authority: Index keputusan bisnis, operasional, dan teknis
Baseline source: `docs/decisions/evidence/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md`
Created in: Governance Register Pass

## Recorded Approval Context

- **Approval date:** 16 July 2026
- **Approval source:** Role-based internal project approval recorded by the Project Manager / Product Owner through the Niuva platform governance process.
- **Decision owner:** Project Manager / Product Owner
- **Technical approver:** Acting Technical Owner
- **Operations acknowledgement:** Acting Operations Owner
- **Business/Finance approver:** Acting Business and Finance Owner
- **Recorded by:** Project documentation owner
- **Approval scope:** Internal architecture, documentation, and future implementation planning.
- **Excluded from this approval:** Company-wide production authorization, infrastructure procurement approval, Finance operational sign-off, payment gateway activation approval, and production go-live approval.

Approved ADR directions do not automatically close operational, provider, infrastructure, Finance, or production-readiness decisions listed as open.

## Cara Membaca

Setiap entry harus memiliki status, owner, approver, tanggal, options, recommended baseline, rationale, impact, dependencies, related ADR, dan final decision. `Pending`, `Not assigned`, atau `Not recorded` berarti keputusan belum dapat dipakai sebagai approval. Decision log ini tidak mempropagasikan requirement ke baseline approved; ADR menjadi authority teknis hanya setelah direview dan disetujui.

## DEC-ARCH-01 — MVP Surface Boundary Topology

- **Status:** Approved Architecture Decision — No Implementation Authority
- **Decision owner:** Product and technical decision authority
- **Approver:** Explicit user approval
- **Decision date:** 31 July 2026
- **Options:**
  1. Satu frontend, satu origin, dan pemisahan surface berbasis route — selected
     for MVP.
  2. Satu identity dengan surface berbasis subdomain — not selected for MVP.
  3. Frontend application terpisah — not selected for MVP.
- **Recommended baseline:** Option 1 menjadi topology MVP. Route, layout,
  code-splitting, dan navigation dapat memisahkan surface, tetapi backend
  authorization tetap menjadi security boundary.
- **Rationale:** Selaras dengan bentuk repository saat ini, same-origin session
  decisions, model operator kecil, dan biaya deployment/authentication yang
  lebih rendah.
- **Impact:** Public, Retail, account, B2B, Admin Studio, session/origin, CSRF,
  deployment, dan route ownership.
- **Dependencies:** `DEC-PROD-001`, `DEC-AUTH-005`, `DEC-AUTH-010`,
  `DEC-UX-001`, `DEC-OPS-001`, dan `DEC-UX-003`.
- **Related ADR:** `docs/decisions/architecture/ADR-004-surface-boundary-topology.md`.
- **Final decision:** Option A disetujui untuk MVP. Subdomain, cross-host, atau
  separate-application work membutuhkan superseding architecture decision.
  Source changes, infrastructure, deployment, readiness, dan go-live tetap
  memerlukan izin terpisah.

## DEC-UX-003 — MVP User Flow and Canonical Route Contract

- **Status:** Approved Decision — Documentation Amendment; No Implementation Authority
- **Decision owner:** Product decision authority
- **Approver:** Explicit user approval
- **Decision date:** 31 July 2026; amended 8 August 2026
- **Options:**
  1. Paket canonical route `NUF-R02` sampai `NUF-R12`, termasuk pemisahan
     Request/Offer, provider-neutral checkout, serta penajaman legacy
     `NUF-R08` dan `NUF-R09` — selected.
  2. Mengaktifkan kembali `/order`, menggabungkan Request/Offer/Order, atau
     mempertahankan dua Admin Retail Order workbench aktif — rejected.
  3. Migrasi namespace MVP ke `/account` atau route inti yang terikat provider
     — not selected.
- **Recommended baseline:** Gunakan canonical public aliases, `/dashboard`,
  product configuration, Retail Request/Offer, `/retail/checkout`,
  `/orders/:id`, `/dashboard/notifications`, Admin Retail Request/Order/Case
  queues, `/contact` untuk form-first B2B Inquiry dengan optional user-clicked
  WhatsApp continuation, dan `/register` yang tetap berada di belakang
  activation contract.
- **Rationale:** Setiap durable intent memiliki satu route owner, Retail dan
  B2B tidak tercampur, dan historical legacy Order tetap tersedia tanpa menjadi
  work queue aktif.
- **Impact:** Public redirects, public B2B intake, customer
  account/navigation, Custom Print configuration, quote-required handoff,
  Assisted Retail Offer, checkout return, notification deep links, legacy
  compatibility, dan Admin queues.
- **Dependencies:** `DEC-ARCH-01`, `DEC-RT-02`, `DEC-OFFER-01`,
  `DEC-AFTER-01`, `DEC-DATA-003`, `DEC-ACCESS-003`, dan `DEC-PAY-02`.
- **Related ADR:** Route decision:
  `docs/decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md`;
  topology authority:
  `docs/decisions/architecture/ADR-004-surface-boundary-topology.md`.
- **Final decision:** `NUF-R02` sampai `NUF-R12` disetujui dengan penajaman
  bahwa `/order` tidak pernah menjadi checkout baru dan `/admin/orders`
  sementara menjadi arsip legacy baca-saja. Pada amendment 8 August 2026,
  `/contact` ditetapkan sebagai form-first public B2B/partnership Inquiry;
  setelah persistence berhasil, customer boleh membuka destination WhatsApp
  public yang sudah disetujui dengan Inquiry UUID. Ini bukan notification,
  webhook, campaign, atau portal B2B. Cart/customer after-sales exact routes,
  registration/security/API contract, implementation, migration, provider,
  deployment, readiness, dan go-live tetap terpisah.

## DEC-RT-01 — First Retail Vertical Slice

- **Status:** Open
- **Decision owner:** Not assigned
- **Approver:** Not recorded
- **Decision date:** Pending
- **Options:**
  1. Fixed-price ready-stock, account-required checkout per `DEC-RT-02`, authoritative preview, reservation, provider-neutral online-payment lifecycle, dan tracking.
  2. Read-only catalog dan product detail terlebih dahulu, tanpa checkout mutation.
  3. Manual-transfer checkout sebagai slice awal — rejected for the current baseline by `DEC-PAY-02`.
- **Recommended baseline:** Option 1 atau Option 2 tetap memerlukan stakeholder decision. Option 3 tidak dapat dipilih pada baseline saat ini.
- **Rationale:** Memberi vertical slice Retail yang terukur tanpa mengunci provider atau mengubah B2B lifecycle.
- **Impact:** Retail catalog, cart, checkout, inventory reservation, payment, storage, tracking, public discovery, dan operational support.
- **Dependencies:** `DEC-RT-02`, `DEC-PAY-01`, `DEC-FUL-01`, `DEC-TAX-01`, `DEC-INV-01`, `DEC-DATA-01`, `DEC-STOR-01`, `DEC-SCOPE-01`.
- **Related ADR:** `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`, `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`, `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`.
- **Final decision:** Pending stakeholder decision.

## DEC-RT-02 — Retail Account-Required Checkout

- **Status:** Approved Decision
- **Decision owner:** Product and access decision authority
- **Approver:** Explicit user approval
- **Decision date:** 30 July 2026
- **Options:**
  1. Account required before private upload, checkout, payment, history, and tracking — selected.
  2. Guest and account checkout — not selected for new Retail transactions.
  3. Guest checkout followed by mandatory post-payment account creation — not selected.
- **Recommended baseline:** Option 1 is approved. Anonymous visitors may browse,
  configure non-sensitive options, and retain a non-authoritative cart; the
  server revalidates everything after authentication.
- **Rationale:** One authenticated owner simplifies order, private-file,
  tracking, notification, and recovery boundaries and avoids using contact
  equality as ownership proof.
- **Impact:** Registration/login conversion, cart handoff, customer session,
  recovery, file ownership, order creation, payment, tracking, and historical
  guest compatibility.
- **Dependencies:** `DEC-AUTH-003`, `DEC-AUTH-010`, `DEC-INV-01`,
  `DEC-PAY-01`, `DEC-STOR-01`.
- **Related ADR:** Formal decision record:
  `docs/decisions/product/DEC-RT-02-retail-account-required-checkout.md`;
  authentication authority:
  `docs/decisions/access/DEC-AUTH-003-account-recovery-contract-and-compatibility.md`
  and
  `docs/decisions/access/DEC-AUTH-010-customer-session-transport-and-origin.md`.
- **Final decision:** Account-required checkout is approved for all new Retail
  transactions. Implementation, historical claim/migration, provider
  activation, deployment, production readiness, and go-live remain separately
  gated.

## DEC-OFFER-01 — Retail Offer, File, Automatic Pricing, and Quote Routing

- **Status:** Approved Product Contract — Activation Gated
- **Decision owner:** Product and commercial policy authority
- **Approver:** Explicit user approval
- **Decision date:** 31 July 2026
- **Options:**
  1. Safe automatic pricing plus B2B-only fallback — not selected.
  2. Safe automatic pricing plus a bounded Assisted Retail Offer for eligible
     individual/UMKM requests — selected.
  3. Inquiry-only handling for every individual quote request — not selected.
- **Decision:** `offer_type`, `pricing_mode`, and `fulfillment_mode` remain
  independent. Simple/default and Detailed/advanced configuration use only
  calibrated Niuva profiles. `.stl` and supported single-model/plate `.3mf`
  may enter automatic validation/slicing; `.obj`, `.step`, `.stp`, ZIP,
  multiple models/parts/plates, and complex projects require manual review;
  reference images/documents are not geometry; customer `.gcode` is rejected.
- **Automatic-pricing boundary:** A final calculated amount is allowed only
  after file, slicing, profile, quantity plan, tax, capacity, ETA, fulfillment,
  and operator-risk validation. The customer confirms the exact file version,
  dimensions, material/color/quantity/configuration, billable grams, print
  duration, breakdown, total, ETA, and fulfillment before checkout; the server
  revalidates before commitment.
- **Quote routing:** Unsafe or uncertain work is separated from a mixed cart
  without creating an Order, reservation, payment attempt, or checkout total,
  while preserving context. Bulk, borongan, partnership, recurring,
  organizational, contractual, and special-fulfillment work follows B2B.
- **Assisted Retail Offer:** Eligible individual/UMKM work may receive a
  private, versioned, customer-bound offer with
  `draft → awaiting_approval → offered → accepted | declined | expired |
  superseded`. Manual price commitment requires `manager_approver`; acceptance
  enters normal Retail checkout and triggers revalidation. It never mutates
  catalog pricing or merges Retail and B2B lifecycles.
- **Rationale:** Preserve safe automatic pricing and context continuity without
  turning technical uncertainty into an unsupported promise or forcing every
  Retail customer into an organization lifecycle.
- **Impact:** Catalog/configurator semantics, private files, slicing,
  calculation, cart handoff, manual review/approval, checkout, Retail/B2B
  routing, audit, and historical snapshots.
- **Dependencies:** `DEC-RT-02`, `DEC-PRICE-001`, `DEC-TAX-01`, `DEC-FUL-01`,
  `DEC-ETA-01`, `DEC-INV-01`, `DEC-AFTER-01`, `DEC-DATA-003`,
  `DEC-ACCESS-002`, `ADR-002`, and `ADR-003`.
- **Related decision:** `docs/decisions/product/DEC-OFFER-01-retail-offer-file-and-quote-routing.md`.
- **Final decision:** All six NMVP-D02 decision groups and Option B are
  approved as the product contract. Calibration, exact offer expiry,
  storage/provider readiness, technical contract, implementation, migration,
  activation, deployment, production readiness, and go-live remain separately
  gated.

## DEC-PAY-01 — Retail Payment Orchestration and Manual-Transfer Policy

- **Status:** Approved with Open Decisions
- **Decision owner:** Project Manager / Product Owner
- **Approver:** Acting Technical Owner; Business/Finance approver: Acting Business and Finance Owner
- **Operations acknowledgement:** Acting Operations Owner
- **Decision date:** 16 July 2026
- **Historical options at original approval:**
  1. Provider-neutral online payment tanpa manual-transfer adapter.
  2. Provider-neutral online payment dengan manual transfer sebagai transitional adapter yang dibatasi dan disetujui secara eksplisit.
- **Excluded baseline alternative:**
  Manual transfer as the Retail production baseline.

  This alternative conflicts with the approved v2.1 online-payment direction and is not selectable through DEC-PAY-01. It would require an explicit amendment to the approved v2.1 baseline.
- **Current baseline after `DEC-PAY-02`:** Option 1. Option 2 is no longer an open application fallback; legacy records are read-only.
- **Approval scope:** Internal architecture direction, documentation, and future implementation planning.
- **Open decision categories:** Gateway provider, payment state machine, Finance
  operations, reconciliation SLA, provider refund execution/timing and
  accounting/tax correction beyond `DEC-AFTER-01`, event retention, webhook
  authentication, and production readiness.
- **Rationale:** v2.1 mengunci online payment sebagai target production, sementara provider tetap deferred.
- **Impact:** Payment lifecycle, payment proof storage, reconciliation queue, inventory hold, customer messaging, finance operations, dan go-live gate.
- **Dependencies:** `DEC-STOR-01`, `DEC-READY-01`, payment contract ADR.
- **Related ADR:** `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`, `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`.
- **Final decision:** Approved with Open Decisions. `DEC-PAY-02` subsequently
  resolved manual-transfer compatibility as read-only and disabled new
  manual-transfer/payment-proof activity. `DEC-AFTER-01` subsequently resolved
  the Retail after-sales product policy. Gateway provider, reconciliation SLA,
  provider refund execution/timing, Finance accounting/tax correction, payment
  event retention, and production go-live remain open.

## DEC-PAY-02 — Legacy Manual Transfer Is Read-Only

- **Status:** Approved Decision
- **Decision owner:** User / Product decision authority
- **Decision date:** 24 July 2026
- **Approval source:** Explicit user approval in the backend-audit conversation.
- **Decision:** Existing manual-transfer records and proof metadata remain readable through authorized compatibility projections. New manual-transfer instructions, attempts, payment-proof uploads, and proof-driven transitions are disabled.
- **Rationale:** Preserve historical commercial truth without allowing the legacy flow to become a new Retail fallback.
- **Impact:** Legacy order/payment compatibility, payment-proof retention, customer/staff projection, and protected-scope route remediation.
- **Dependencies:** `DEC-PAY-01`, `DEC-STOR-01`, `DEC-SCOPE-01`.
- **Related decision:** `docs/decisions/product/DEC-PAY-02-legacy-manual-transfer-read-only.md`.
- **Excluded:** Code changes, destructive record cleanup, provider selection, Finance activation, production readiness, and go-live.

## DEC-FUL-01 — Shipping and Pickup Policy

- **Status:** Approved Fulfillment Policy — Activation Gated
- **Decision owner:** Product and fulfillment policy authority
- **Approver:** Explicit user approval
- **Decision date:** 30 July 2026
- **Decision:** Eligible direct-checkout Retail orders support Rp0 pickup and
  automatically rated domestic Indonesia delivery. International, special
  packaging, unsupported, unsafe, oversize, or uncertain fulfillment becomes
  `quote_required`. Basic packaging is included in the standard customer
  price.
- **Rate validity:** Provider expiry capped at 30 minutes; use 30 minutes when
  the provider supplies none. Expired or changed rate/service/ETA requires
  refresh and customer reconfirmation before order/payment-attempt creation.
- **Pickup:** Location is selected at checkout; collection window is selected
  after `ready_for_pickup`. Seven calendar days without handover creates
  internal `pickup_overdue` and dashboard/email follow-up, never automatic
  cancellation, disposal, storage fee, refund, or completion.
- **Rationale:** Customer total and eligibility must be authoritative without
  guessed rates or premature production/pickup promises.
- **Impact:** Checkout preview, address/package validation, order snapshots,
  customer communication, tracking, fulfillment, tax, ETA, and operational
  reconciliation.
- **Dependencies:** `DEC-RT-02`, `DEC-OFFER-01`, `DEC-INV-01`,
  `DEC-PRICE-001`, `DEC-TAX-01`, `DEC-PAY-01`, `DEC-AFTER-01`.
- **Related decision:** `docs/decisions/product/DEC-FUL-01-shipping-and-pickup-policy.md`.
- **Excluded:** Provider selection/activation, actual location or package data,
  implementation, migration, deployment, production readiness, and go-live.

## DEC-ETA-01 — Retail ETA and Customer Milestone Policy

- **Status:** Approved Customer ETA and Milestone Policy — Activation Gated
- **Decision owner:** Product and Operations policy authority
- **Approver:** Explicit user approval
- **Decision date:** 31 July 2026
- **Decision:** Checkout shows estimated date/time ranges rather than a
  guaranteed single date. Pickup shows estimated ready range; delivery shows
  separate ready-to-ship and arrival ranges. After payment, customers see
  factual Ready Product or Custom Print milestones, next action, current ETA,
  and customer-safe exceptions without fake percentage progress.
- **Operations:** Authorized `production`, `quality_control`, and `order_admin`
  actors may publish routine domain updates directly with reason and audit
  history. Every ETA change appends previous/new range, target, actor, time,
  reason, safe explanation, and version references.
- **Overdue:** Passing `eta_latest_at` before the target milestone creates
  internal `eta_overdue` and requires a new range/reason. It never
  automatically cancels, refunds, reprints, disposes of, or completes an order.
- **Rationale:** Separates forecast from factual history and gives customers a
  credible commitment range without invented operational precision.
- **Impact:** Checkout preview, order confirmation, production/QC/fulfillment
  tracking, customer communication, audit, analytics, and after-sales review.
- **Dependencies:** `DEC-RT-02`, `DEC-OFFER-01`, `DEC-INV-01`, `DEC-FUL-01`,
  `DEC-PRICE-001`, `DEC-ACCESS-002`, `DEC-AFTER-01`, `DEC-DATA-003`.
- **Related decision:** `docs/decisions/product/DEC-ETA-01-retail-eta-and-customer-milestone-policy.md`.
- **Excluded:** Numeric duration/calendar configuration, exact aggregate state
  machine/API/schema, live printer telemetry, implementation, migration,
  deployment, readiness, and go-live. Retail notification recipients/channels
  follow amended `DEC-DATA-003`; provider and technical activation remain
  separate.

## DEC-PRICE-001 — Custom 3D Print Commercial Pricing

- **Status:** Approved Commercial Policy — Activation Gated
- **Decision owner:** Product and commercial decision authority
- **Approver:** Explicit user approval
- **Decision date:** 30 July 2026
- **Options:**
  1. Progressive PLA/ABS slicer weight plus exact machine time with one final half-up rounding — selected.
  2. Apply one tier rate to the entire weight — rejected.
  3. Round weight, duration, or every component — rejected.
  4. Add a 50-gram minimum — rejected.
- **Recommended baseline:** Policy `NIUVA-CP-FDM-001` is approved for eligible
  Niuva-filament FDM Custom Print. It becomes effective only at separately
  authorized checkout MVP activation with Finance tax confirmation.
- **Rationale:** Progressive tiers avoid price cliffs; exact slicer inputs and
  final-only rounding preserve reproducibility.
- **Impact:** Customer price, slicer integration, commercial snapshot,
  checkout confirmation, historical orders, refunds, analytics, and audit.
- **Dependencies:** `DEC-TAX-01`, `DEC-RT-02`, `DEC-OFFER-01`,
  `DEC-STOR-01`, `DEC-SCOPE-01`, `DEC-READY-01`.
- **Related ADR:** Formal decision record:
  `docs/decisions/product/DEC-PRICE-001-custom-print-commercial-pricing.md`.
- **Final decision:** Formula, inclusions, versioning, historical behavior, and
  launch-relative effective-date strategy are approved. Tax profile,
  fulfillment amount, implementation, activation, deployment, production
  readiness, and go-live remain separately gated.

## DEC-TAX-01 — Tax Treatment

- **Status:** Approved Direction with Open Finance Activation Gate
- **Decision owner:** Product decision authority; Finance confirmation required
- **Approver:** Explicit user approval of display direction; Finance approver not recorded
- **Decision date:** 30 July 2026
- **Options:**
  1. Tax-inclusive customer total with a versioned Finance profile — selected direction.
  2. Tax-exclusive display with a separate tax line added at checkout — rejected.
  3. Assume zero tax while status is unknown — rejected.
- **Recommended baseline:** Do not add tax after customer confirmation. Because
  PKP status is unknown, do not display a PPN amount/rate or promise a Faktur
  Pajak, and do not activate checkout until Finance approves the tax profile.
- **Rationale:** Preserves the approved all-in customer price without inventing
  business status, classification, rate, calculation basis, or invoice duties.
- **Impact:** Price display, invoice, payment amount, refund, reconciliation, analytics, dan historical snapshots.
- **Dependencies:** `DEC-PRICE-001`, `DEC-RT-02`, `DEC-FUL-01`,
  `DEC-AFTER-01`, `DEC-READY-01`.
- **Related ADR:** Formal decision record:
  `docs/decisions/product/DEC-TAX-01-tax-inclusive-display-and-finance-activation-gate.md`.
- **Final decision:** Tax-inclusive display direction and launch-relative
  effective-date strategy are approved. PKP status, classification, rate/basis,
  invoice behavior, regulatory reference, Finance approver, implementation,
  activation, production readiness, and go-live remain open.

## DEC-INV-01 — Reservation Duration

- **Status:** Approved Decision
- **Decision owner:** Product decision authority
- **Approver:** Explicit user approval
- **Decision date:** 30 July 2026
- **Options:**
  1. Fixed 30-minute reservation — selected.
  2. Initial reservation 24 jam — not selected.
  3. Reservation dinamis berdasarkan stock class dan payment method — deferred.
- **Recommended baseline:** Option 1 is approved as the fixed MVP policy; any
  provider-aware or dynamic replacement requires a superseding decision.
- **Approved policy:** Reservation berlaku 30 menit sejak order dan payment
  attempt berhasil dibuat, bukan sejak cart dibuka. Countdown dan peringatan
  lima menit ditampilkan; tidak ada automatic extension. Retry setelah expiry
  harus memvalidasi ulang price, stock/material, shipping, dan ETA sebelum
  membuat reservation baru.
- **Required invariants:** Payment success dan expiry/release adalah competing
  atomic transitions; release terjadi tepat satu kali; late success masuk
  reconciliation; payment method yang tidak kompatibel tidak boleh diaktifkan;
  policy disimpan sebagai versioned snapshot.
- **Rationale:** Mencegah stock/material tertahan terlalu lama sekaligus menjaga
  release/consume, retry, dan late-payment behavior tetap deterministik.
- **Impact:** Inventory availability, overselling, customer expectation, payment review, expiry, refund, dan operational queue.
- **Dependencies:** `DEC-DATA-01`, `DEC-PAY-01`, `DEC-AFTER-01`.
- **Related ADR:** `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`; `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`; formal decision record: `docs/decisions/product/DEC-INV-01-retail-checkout-reservation-duration.md`.
- **Final decision:** Fixed 30-minute duration approved. Provider selection,
  state mapping, reconciliation SLA, implementation, deployment, production
  readiness, and go-live remain separately gated.

## DEC-AFTER-01 — Retail Revision and After-Sales Policy

- **Status:** Approved After-Sales Policy — Activation Gated
- **Decision owner:** Product, Operations, and Finance policy authority
- **Approver:** Explicit user approval
- **Decision date:** 31 July 2026
- **Selected policy shape:** Lifecycle-specific policy for unpaid, paid
  pre-work, post-start, and after-receipt cases.
- **Approved file revision:** `file_revision_required` gives 48 hours from a
  successfully available customer-facing notice. Timeout enters review without
  deletion or automatic refund inference.
- **Approved cancellation/refund:** Unpaid cancellation has no refund and
  releases reservation exactly once. An approved paid cancellation before
  irreversible work receives the full eligible paid amount, including unused
  fulfillment, with no provider/admin-fee deduction. After work starts,
  cancellation is manual and partial refund requires an exact agreed amount.
- **Approved complaint/remedy:** Complaint intake is at least two working days
  after authoritative receipt and is not an automatic waiver of later or
  hidden-defect review. Confirmed Niuva error or carrier damage gives the
  customer affected-scope reprint/replacement or refund, with Niuva-funded
  required return/replacement shipping.
- **Approved SLA and roles:** Immediate durable acknowledgement, first human
  response within one working day, and resolution-decision target within five
  working days after sufficient evidence. `order_admin` triages, domain roles
  contribute evidence, `finance` prepares refunds, and every refund/free
  reprint requires `manager_approver`.
- **B2B boundary:** Direct-checkout Retail Orders use this policy. B2B
  Quote/Project after-sales follows the accepted quotation/SOW/contract.
- **Rationale:** Stage-specific handling protects customer remedies while
  keeping inventory release, work consumption, refunds, returns, and evidence
  deterministic and auditable.
- **Impact:** File review, Order lifecycle, payment, inventory release, refund
  records, fulfillment exceptions, customer support, privacy, legal/Finance
  reconciliation, and reporting.
- **Dependencies:** `DEC-PAY-01`, `DEC-FUL-01`, `DEC-ETA-01`, `DEC-INV-01`,
  `DEC-PRICE-001`, `DEC-TAX-01`, `DEC-ACCESS-002`, `DEC-READY-01`.
- **Related decision:** `docs/decisions/product/DEC-AFTER-01-retail-revision-and-after-sales-policy.md`.
- **Final decision:** Policy direction approved. Legal/customer terms,
  business-calendar configuration, provider refund execution/timing, Finance
  accounting/tax correction, evidence privacy/retention, abuse/fraud handling,
  long-term uncollected-pickup policy, exact technical contract,
  implementation, deployment, readiness, and go-live remain gated.
  Notification policy follows amended `DEC-DATA-003`; provider and technical
  activation remain separate.

## DEC-DATA-003 — Retail Notification Amendment

- **Status:** Approved Decision — Amended for NMVP-D07
- **Decision owner:** Product and Data policy authority
- **Approver:** Explicit user approval of all six NMVP-D07 decision groups
- **Decision date:** 31 July 2026 amendment to the 29 July 2026 decision
- **Recipients:** The authenticated Retail Order owner is the only customer
  recipient. Internal recipients are resolved by role, permission, and domain
  scope rather than broadcast to all Admin users.
- **Events:** Customer and operator allowlists cover only material/actionable
  payment, file, production/ETA, fulfillment, after-sales, stock,
  reconciliation, approval, refund-failure, and terminal-delivery conditions.
  Full production history remains on the order detail.
- **Channels/preferences:** Allowlisted in-app records cannot be disabled.
  Transactional/action-required email must be enqueued; routine
  production-progress email uses one default-on preference. Marketing,
  broadcast, arbitrary recipients, and WhatsApp are excluded.
- **Privacy/links:** Versioned payloads are minimal and customer-safe.
  Audience-aware same-origin links are derived from allowlisted references and
  require authentication plus ownership/permission checks. Email performs no
  direct business action.
- **Delivery/audit:** Source-event idempotency, no more than five email
  attempts, terminal `exhausted`, role-scoped in-app alerting, controlled
  `order_admin` resend, safe audit metadata, 180-day in-app retention, and
  30-day terminal delivery-metadata retention apply. Delivery failure never
  rolls back a committed core transition.
- **B2B boundary:** A B2B Quote/Project notification policy remains governed by
  its accepted contract or a separate future decision.
- **Related decision:** `docs/decisions/product/DEC-DATA-003-notification-schema-retention-and-delivery-boundary.md`.
- **Excluded:** Email/scheduler/worker provider selection, exact event enum and
  source mapping, preference UI, source/schema changes, migration, deployment,
  readiness, B2B policy, and go-live.

## DEC-SCOPE-01 — Protected-Scope Approval

- **Status:** Open
- **Decision owner:** Product / Technical owner — Not assigned
- **Approver:** Not recorded
- **Decision date:** Pending
- **Options:**
  1. Approve all protected surfaces untuk Retail slice: legacy orders,
     reservation/stock, authenticated customer access, historical guest
     compatibility, admin payment/refund, fulfillment, notification, dan
     compatibility API.
  2. Approve read-only catalog/preview only; mutation surfaces menunggu approval lanjutan.
  3. Approve per-surface secara bertahap dengan named owner dan rollback gate.
- **Recommended baseline:** Option 3, dengan option 2 sebagai safe default sampai approval tertulis tersedia.
- **Rationale:** Mencegah candidate spec dianggap sebagai izin implisit untuk mengubah operasi legacy.
- **Impact:** Exact file scope, review owner, regression scope, feature flags, migration boundary, dan rollback.
- **Dependencies:** `DEC-RT-01`, `DEC-DATA-01`, `DEC-STOR-01`, `DEC-READY-01`.
- **Related ADR:** `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`, `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`, `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`.
- **Final decision:** Pending protected-scope approval.

## DEC-DATA-01 — Transaction Capability Policy

- **Status:** Approved Baseline
- **Decision owner:** Project Manager / Product Owner
- **Approver:** Acting Technical Owner
- **Operations acknowledgement:** Acting Operations Owner
- **Decision date:** 16 July 2026
- **Options:**
  1. Replica-set MongoDB multi-document transaction.
  2. Single-document redesign untuk aggregate dan reservation writes.
  3. Saga/compensation dengan idempotent workflow, reconciliation, dan recovery.
- **Recommended baseline:** Option 1 untuk catalog publication pointer, inventory balance/movement/reservation, dan checkout order-plus-reservation writes. Single-node replica set dapat digunakan untuk local development.
- **Approval scope:** Internal architecture direction, documentation, and future implementation planning.
- **Open decision categories:** Exact implementation modules, deployment topology, readiness implementation, monitoring implementation, and production infrastructure authorization.
- **Rationale:** Menjaga atomicity dan mencegah partial order/reservation atau overselling.
- **Impact:** Local/dev, CI, staging, production, startup/readiness diagnostics, deployment topology, mutation feature flags, dan test environment.
- **Dependencies:** `DEC-RT-01`, `DEC-INV-01`, `DEC-SCOPE-01`, `DEC-READY-01`.
- **Related ADR:** `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`.
- **Final decision:** Approved Baseline. Silent fallback to non-atomic writes is prohibited and transaction-required operations fail closed with `503 transaction_unavailable`.

## DEC-STOR-01 — Production File Storage Architecture

- **Status:** Approved with Open Decisions
- **Decision owner:** Project Manager / Product Owner
- **Approver:** Acting Technical Owner
- **Operations acknowledgement:** Acting Operations Owner
- **Decision date:** 16 July 2026
- **Options:**
  1. Private persistent object storage dengan backend authorization atau short-lived signed URL.
  2. Persistent shared volume dengan private backend-proxied access.
  3. Hybrid storage dengan provider abstraction dan explicit migration boundary.
- **Recommended baseline:** Option C sebagai application architecture dan Option A sebagai production adapter class: stable provider-neutral storage port dengan private persistent object storage. Production upload tetap blocked sampai provider, ownership, token removal, validation, quarantine, backup/restore, retention/quota, reconciliation, operational owners, dan production readiness disetujui.
- **Approval scope:** Internal architecture direction, documentation, and future implementation planning.
- **Open decision categories:** Provider, operations, production readiness, RPO/RTO, retention, quota, ownership, backup/restore, malware handling, and Emergent migration.
- **Rationale:** Local filesystem hanya aman untuk development/demo dan tidak memenuhi production persistence.
- **Impact:** Retail design files, B2B/RFQ attachments, design versions, operational files, QC/fulfillment evidence, dan historical payment-proof objects retained under `DEC-PAY-02`; no new proof upload.
- **Dependencies:** `DEC-RT-01`, `DEC-PAY-01`, `DEC-SCOPE-01`, `DEC-READY-01`.
- **Related ADR:** `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`.
- **Final decision:** Approved with Open Decisions. Actual provider, RPO, RTO, retention duration, quota values, storage/backup/restore/malware/incident owners, dan Emergent migration/decommission policy tetap open.

## DEC-READY-01 — Production Readiness Criteria

- **Status:** Open
- **Decision owner:** Release / Operations owner — Not assigned
- **Approver:** Not recorded
- **Decision date:** Pending
- **Options:**
  1. Full production gate sebelum mutation enablement.
  2. Limited pilot dengan restricted users dan explicit rollback.
  3. Read-only public catalog sampai semua operational gate selesai.
- **Recommended baseline:** Option 1 untuk production checkout; option 2 hanya sebagai pilot yang terpisah dan disetujui.
- **Rationale:** Production readiness harus membuktikan transaction capability, persistent storage, payment/reconciliation, policy, backup/restore, monitoring, dan regression.
- **Impact:** Release scope, feature flags, infrastructure, ownership, support, incident recovery, data privacy, dan go-live approval.
- **Dependencies:** Semua entry lain pada log ini, terutama `DEC-DATA-01` dan `DEC-STOR-01`.
- **Related ADR:** `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`, `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`, `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`.
- **Final decision:** Pending production readiness approval.
