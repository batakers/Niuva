# Decision Log Platform Niuva v2.1

Status: Active Decision Register
Authority: Index keputusan bisnis, operasional, dan teknis
Baseline source: `doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md`
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

## DEC-RT-01 — First Retail Vertical Slice

- **Status:** Open
- **Decision owner:** Not assigned
- **Approver:** Not recorded
- **Decision date:** Pending
- **Options:**
  1. Fixed-price ready-stock, guest-first checkout, authoritative preview, reservation, provider-neutral online-payment lifecycle, dan tracking.
  2. Read-only catalog dan product detail terlebih dahulu, tanpa checkout mutation.
  3. Manual-transfer checkout sebagai slice awal.
- **Recommended baseline:** Option 1 dengan online payment sebagai production target; Option 3 tidak menjadi baseline dan hanya dapat hidup sebagai transitional adapter terkontrol.
- **Rationale:** Memberi vertical slice Retail yang terukur tanpa mengunci provider atau mengubah B2B lifecycle.
- **Impact:** Retail catalog, cart, checkout, inventory reservation, payment, storage, tracking, public discovery, dan operational support.
- **Dependencies:** `DEC-PAY-01`, `DEC-FUL-01`, `DEC-TAX-01`, `DEC-INV-01`, `DEC-DATA-01`, `DEC-STOR-01`, `DEC-SCOPE-01`.
- **Related ADR:** `doc/decisions/ADR-001-mongodb-transaction-capability.md`, `doc/decisions/ADR-002-production-file-storage-architecture.md`, `doc/decisions/ADR-003-retail-payment-orchestration-boundary.md`.
- **Final decision:** Pending stakeholder decision.

## DEC-PAY-01 — Retail Payment Orchestration and Manual-Transfer Policy

- **Status:** Approved with Open Decisions
- **Decision owner:** Project Manager / Product Owner
- **Approver:** Acting Technical Owner; Business/Finance approver: Acting Business and Finance Owner
- **Operations acknowledgement:** Acting Operations Owner
- **Decision date:** 16 July 2026
- **Options:**
  1. Provider-neutral online payment tanpa manual-transfer adapter.
  2. Provider-neutral online payment dengan manual transfer sebagai transitional adapter yang dibatasi dan disetujui secara eksplisit.
- **Excluded baseline alternative:**
  Manual transfer as the Retail production baseline.

  This alternative conflicts with the approved v2.1 online-payment direction and is not selectable through DEC-PAY-01. It would require an explicit amendment to the approved v2.1 baseline.
- **Recommended baseline:** Option 1 untuk production; Option 2 hanya jika disetujui eksplisit dengan Finance owner, reconciliation SLA, expiry date, dan exit criteria.
- **Approval scope:** Internal architecture direction, documentation, and future implementation planning.
- **Open decision categories:** Gateway provider, payment state machine, Finance operations, reconciliation SLA, refund policy, event retention, webhook authentication, and production readiness.
- **Rationale:** v2.1 mengunci online payment sebagai target production, sementara provider tetap deferred.
- **Impact:** Payment lifecycle, payment proof storage, reconciliation queue, inventory hold, customer messaging, finance operations, dan go-live gate.
- **Dependencies:** `DEC-STOR-01`, `DEC-READY-01`, payment contract ADR.
- **Related ADR:** `doc/decisions/ADR-002-production-file-storage-architecture.md`, `doc/decisions/ADR-003-retail-payment-orchestration-boundary.md`.
- **Final decision:** Approved with Open Decisions. No new transitional manual-transfer adapter is enabled by this approval; gateway provider, reconciliation SLA, refund policy, payment event retention, and production go-live remain open.

## DEC-FUL-01 — Shipping and Pickup Policy

- **Status:** Open
- **Decision owner:** Operations — Not assigned
- **Approver:** Not recorded
- **Decision date:** Pending
- **Options:**
  1. Pickup dan shipping flat-rate untuk wilayah yang ditentukan.
  2. Pickup-only untuk vertical slice pertama.
  3. Shipping zone dan tarif dinamis setelah policy serta provider siap.
- **Recommended baseline:** Pending policy decision; metode, wilayah, tarif, required address fields, unsupported-region behavior, pickup location/hours, dan owner harus ditetapkan sebelum checkout production.
- **Rationale:** Checkout tidak boleh menghitung eligibility atau total berdasarkan asumsi yang belum disetujui.
- **Impact:** Checkout preview, order snapshot, customer communication, fulfillment, tax, ETA, dan refund/return handling.
- **Dependencies:** `DEC-RT-01`, `DEC-TAX-01`, `DEC-AFTER-01`.
- **Related ADR:** Not assigned.
- **Final decision:** Pending Operations and stakeholder decision.

## DEC-TAX-01 — Tax Treatment

- **Status:** Open
- **Decision owner:** Finance — Not assigned
- **Approver:** Not recorded
- **Decision date:** Pending
- **Options:**
  1. Tax-inclusive customer total.
  2. Tax-exclusive display with separate tax line.
  3. Policy by product/customer segment, with one immutable calculation mode per order.
- **Recommended baseline:** Pending Finance decision; selected treatment must be stored in the immutable order pricing snapshot with rounding rules.
- **Rationale:** PRD requires auditable monetary calculation, tetapi treatment Retail belum ditetapkan.
- **Impact:** Price display, invoice, payment amount, refund, reconciliation, analytics, dan historical snapshots.
- **Dependencies:** `DEC-RT-01`, `DEC-FUL-01`, `DEC-AFTER-01`.
- **Related ADR:** Not assigned.
- **Final decision:** Pending Finance approval.

## DEC-INV-01 — Reservation Duration

- **Status:** Open
- **Decision owner:** Operations / Warehouse — Not assigned
- **Approver:** Not recorded
- **Decision date:** Pending
- **Options:**
  1. Initial reservation 24 jam, payment-review hold terbatas, absolute deadline, dan satu audited extension.
  2. Reservation lebih singkat untuk ready-stock.
  3. Reservation dinamis berdasarkan stock class dan payment method.
- **Recommended baseline:** Option 1 sebagai proposal teknis, bukan approval; angka TTL, hold, grace period, extension, dan late-payment rule harus disetujui.
- **Rationale:** Mencegah stock tertahan tanpa batas dan menjaga release/consume idempotent.
- **Impact:** Inventory availability, overselling, customer expectation, payment review, expiry, refund, dan operational queue.
- **Dependencies:** `DEC-DATA-01`, `DEC-PAY-01`, `DEC-AFTER-01`.
- **Related ADR:** `doc/decisions/ADR-001-mongodb-transaction-capability.md`.
- **Final decision:** Pending Operations and stakeholder decision.

## DEC-AFTER-01 — Cancellation, Refund, and Return

- **Status:** Open
- **Decision owner:** Finance / Operations — Not assigned
- **Approver:** Not recorded
- **Decision date:** Pending
- **Options:**
  1. Policy terpisah untuk before-paid, after-paid, pickup expiry, shipping exception, damaged goods, dan return eligibility.
  2. Cancel/refund only untuk vertical slice pertama, return ditunda.
  3. Full cancellation/refund/return policy sebelum checkout production.
- **Recommended baseline:** Option 1 sebagai policy shape; final eligibility, SLA, approval role, dan customer-facing scope belum dipilih.
- **Rationale:** Operational handling tetap dibutuhkan walaupun sebagian customer-facing action dapat ditunda.
- **Impact:** Payment, inventory release, refund records, fulfillment exception, customer support, legal/finance reconciliation.
- **Dependencies:** `DEC-PAY-01`, `DEC-FUL-01`, `DEC-INV-01`, `DEC-READY-01`.
- **Related ADR:** `doc/decisions/ADR-003-retail-payment-orchestration-boundary.md`.
- **Final decision:** Pending Finance and Operations approval.

## DEC-SCOPE-01 — Protected-Scope Approval

- **Status:** Open
- **Decision owner:** Product / Technical owner — Not assigned
- **Approver:** Not recorded
- **Decision date:** Pending
- **Options:**
  1. Approve all protected surfaces untuk Retail slice: legacy orders, reservation/stock, auth/guest access, admin payment/refund, fulfillment, notification, dan compatibility API.
  2. Approve read-only catalog/preview only; mutation surfaces menunggu approval lanjutan.
  3. Approve per-surface secara bertahap dengan named owner dan rollback gate.
- **Recommended baseline:** Option 3, dengan option 2 sebagai safe default sampai approval tertulis tersedia.
- **Rationale:** Mencegah candidate spec dianggap sebagai izin implisit untuk mengubah operasi legacy.
- **Impact:** Exact file scope, review owner, regression scope, feature flags, migration boundary, dan rollback.
- **Dependencies:** `DEC-RT-01`, `DEC-DATA-01`, `DEC-STOR-01`, `DEC-READY-01`.
- **Related ADR:** `doc/decisions/ADR-001-mongodb-transaction-capability.md`, `doc/decisions/ADR-002-production-file-storage-architecture.md`, `doc/decisions/ADR-003-retail-payment-orchestration-boundary.md`.
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
- **Related ADR:** `doc/decisions/ADR-001-mongodb-transaction-capability.md`.
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
- **Impact:** Retail design files, B2B/RFQ attachments, design versions, operational files, QC/fulfillment evidence, dan payment proof jika manual-transfer adapter disetujui.
- **Dependencies:** `DEC-RT-01`, `DEC-PAY-01`, `DEC-SCOPE-01`, `DEC-READY-01`.
- **Related ADR:** `doc/decisions/ADR-002-production-file-storage-architecture.md`.
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
- **Related ADR:** `doc/decisions/ADR-001-mongodb-transaction-capability.md`, `doc/decisions/ADR-002-production-file-storage-architecture.md`, `doc/decisions/ADR-003-retail-payment-orchestration-boundary.md`.
- **Final decision:** Pending production readiness approval.
