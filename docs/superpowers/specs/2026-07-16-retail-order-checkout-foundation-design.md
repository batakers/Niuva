# Retail Order & Checkout Foundation — Design Spec

Tanggal: 16 Juli 2026
Status: Technical Design Candidate — not approved for implementation
Scope kandidat: Retail ready-stock, fixed-price, guest-first checkout, authoritative server preview, atomic reservation, provider-neutral payment orchestration, dan customer-safe tracking; bukan implementation approval
Approved architecture pointers:
- `doc/decisions/ADR-001-mongodb-transaction-capability.md`
- `doc/decisions/ADR-002-production-file-storage-architecture.md`
- `doc/decisions/ADR-003-retail-payment-orchestration-boundary.md`
- `doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md`

Dokumen ini merevisi candidate spec pada commit `a433141` berdasarkan review stakeholder. BRD/PRS v2.1, PRD v2.1, `PRODUCT.md`, `AGENTS.md`, dan keputusan stakeholder terbaru menjadi sumber kebenaran. Revision pass ini hanya mengubah dokumen desain; tidak ada production code yang diubah.

## 1. Tujuan dan Posisi Produk

Candidate ini mendefinisikan vertical slice commerce Retail yang menghubungkan active catalog publication, fixed-price authoritative snapshots, atomic inventory reservation, guest-first checkout, provider-neutral online-payment orchestration, dan customer-safe order tracking.

Online payment adalah Retail production target. Gateway provider tetap deferred, dan candidate ini tidak memilih provider, SDK, schema, webhook signature, atau provider-specific API. Existing legacy manual-transfer records tetap readable, tetapi manual transfer bukan production baseline dan tidak ada transitional adapter baru yang diaktifkan.

Dokumen ini tidak menggantikan jalur B2B. Retail Order dan B2B Quote/Project tetap merupakan aggregate dan state machine terpisah walaupun menggunakan shared identity, catalog, inventory, payment infrastructure, audit, CMS, dan operational foundations.

### Posisi dalam satu website

- Retail dan B2B sama-sama harus discoverable.
- Label, placement, ordering, serta visual switch treatment untuk journey Retail/B2B tetap deferred.
- Exact v1 navigation tetap protected sampai approved Retail/B2B information-architecture decision menggantikannya.
- Retail memakai catalog → cart → authoritative preview → checkout → provider-neutral payment → tracking.
- B2B tetap memakai capability/portfolio → inquiry/RFQ → quotation → approval → project delivery.

## 2. Decision Gate dan Baseline Teknis

### 2.1 Candidate scope dan keputusan yang tetap open

Status document ini tetap candidate dan tidak memberi implementation approval.

| Keputusan | Candidate / approved direction | Status |
|---|---|---|
| Produk dan pricing mode | `ready_stock` + `pricing_mode=fixed` | Candidate initial slice; protected-scope permission tetap diperlukan |
| Keranjang | Multi-item; browser hanya menyimpan variant ID dan quantity | Candidate; atomic multi-line reservation contract adalah foundation prerequisite |
| Checkout identity | Guest-first; tidak membangun customer auth baru | Candidate; reuse account yang sudah ada bila contract-nya approved |
| Checkout preview | Server authoritative untuk publication, price, stock, fulfillment input, dan total | Candidate invariant |
| Fulfillment | Shipping dan pickup | Policy tetap open |
| Pajak | Treatment dan display | Tetap open; memerlukan Finance decision |
| Reservation duration | Tidak ditetapkan oleh candidate ini | Tetap open |
| Payment architecture | Provider-neutral online-payment orchestration | Approved architecture direction melalui ADR-003; provider tetap deferred |
| Manual transfer | Bukan Retail production baseline; tidak ada adapter baru yang enabled | Transitional adapter tetap open dan memerlukan written approval terpisah |
| Cancellation/refund/return | Boundary wajib ada; policy detail belum dipilih | Tetap open |
| Protected scope | Implementation permission | Tetap open |

### 2.2 Baseline teknis yang tetap berlaku

- Backend authoritative untuk active catalog publication, product/variant eligibility, price snapshot, availability, total, dan state.
- Line item dan pricing snapshot immutable setelah order dibuat.
- Checkout memakai inventory reservation service; checkout tidak langsung memutasi inventory balance, stock movement, atau reservation collections.
- Foundation reservation lifecycle tetap `active → consumed | released | expired`. Payment review atau cancellation adalah order/payment state, bukan inventory reservation state baru.
- Cross-collection checkout/order/reservation mutation mengikuti `doc/decisions/ADR-001-mongodb-transaction-capability.md`, fail closed dengan `503 transaction_unavailable`, dan tidak memiliki silent non-atomic fallback.
- Upload-dependent flows mengikuti `doc/decisions/ADR-002-production-file-storage-architecture.md`; production upload tetap blocked sampai readiness conditions disetujui.
- Payment lifecycle mengikuti `doc/decisions/ADR-003-retail-payment-orchestration-boundary.md`: core provider-neutral, adapter terpisah, event/webhook idempotent, serta refund/reconciliation boundary eksplisit.
- Idempotency, conflict handling, audit, legacy compatibility, customer-safe projection, dan concurrency safety tetap invariant.

## 3. Batas Scope

### Termasuk dalam candidate

- Public Retail catalog dan product detail untuk variant pada active publication yang memenuhi fixed-price ready-stock policy.
- Cart lokal multi-item.
- Guest-first checkout dan authoritative server checkout preview.
- Immutable product, variant, publication, dan pricing snapshots pada order.
- Atomic reservation untuk seluruh line item melalui inventory reservation service.
- Provider-neutral payment orchestration boundary, idempotent provider-event handling contract, refund/reconciliation boundary, dan customer-safe payment projection.
- Guest/customer-safe tracking serta permitted fulfillment transition.
- Audit, idempotency, expiry, conflict, retry, dan legacy compatibility.

### Tidak termasuk atau belum enabled

- Produk `calculated` atau `quote_required` dalam direct checkout.
- Custom configuration atau design-file upload pada ready-stock checkout.
- Provider selection atau provider-specific SDK, schema, webhook signature, dan API.
- New manual-transfer adapter, payment-proof upload pada primary production path, atau manual-payment review flow.
- Live shipping rate, courier integration, shipping-zone policy, tax policy, reservation duration, cancellation/refund/return policy, atau production go-live.
- Supplier purchase automation.
- B2B quotation, organization approval, atau project workflow.
- Pembuatan customer authentication baru.
- Homepage/navigation visual redesign atau perubahan terhadap protected exact v1 navigation.

### Protected-scope approval

Implementasi Retail memerlukan izin eksplisit sebelum menyentuh:

- collection dan projection `orders`;
- inventory reservation serta release/consume operation;
- backend route/service/repository dan API lama;
- authentication, customer access, dan guest session;
- admin order view, payment, reconciliation, dan refund operation;
- dashboard, fulfillment, production, notification, atau operational flow terkait.

Existing 3D-printing orders, auth flow, dashboard, dan API lama harus tetap backward compatible. Tidak ada perubahan pada area protected dalam synchronization pass ini.

## 4. Arsitektur

Fitur menggunakan modular monolith. Route hanya memvalidasi request dan mengembalikan response; aturan bisnis berada pada service/domain; akses MongoDB dipusatkan pada repository untuk slice ini.

### Backend modules

- `backend/retail_checkout_routes.py`: endpoint public/customer/guest/admin dan Pydantic payload.
- `backend/retail_checkout_service.py`: preview, checkout orchestration, order/payment state transition, expiry, reconciliation, dan idempotency.
- `backend/retail_checkout_repository.py`: query order, active catalog publication, authoritative pricing snapshot, payment attempt, fulfillment config, dan guest session. Inventory mutation tetap melalui foundation reservation service.
- `backend/retail_checkout_domain.py`: fungsi murni untuk validasi cart, snapshot, subtotal, ongkir, total, expiry, exception projection, dan status transition.
- `backend/retail_checkout_indexes.py`: index order, idempotency, payment, reconciliation, dan guest-session.
- `backend/server.py`: hanya memasang router dan dependency yang sudah ada.

Perubahan tidak merombak foundation catalog, material, atau inventory. Checkout membaca active catalog publication, memakai authoritative product/variant pricing snapshots, dan memanggil inventory reservation service. Checkout tidak langsung memutasi inventory balance, stock movement, atau reservation collections. Jika atomic multi-line reservation contract belum tersedia, contract tersebut dicatat sebagai foundation prerequisite dan tidak didefinisikan ulang di candidate ini. Missing transaction capability mengembalikan `503 transaction_unavailable` tanpa silent fallback.

### Frontend modules

- `frontend/src/pages/retail/RetailCatalog.jsx`: list dan filter produk publik.
- `frontend/src/pages/retail/RetailProduct.jsx`: detail, varian, availability, dan add-to-cart.
- `frontend/src/pages/retail/RetailCart.jsx`: cart localStorage.
- `frontend/src/pages/retail/RetailCheckout.jsx`: kontak, fulfillment, preview, dan submit.
- `frontend/src/pages/retail/RetailTracking.jsx`: customer-safe tracking, payment state/action, reconciliation guidance, dan exception message.
- `frontend/src/lib/retailCart.js`: validasi, normalisasi, add/update/remove, dan migration key cart.
- `frontend/src/lib/retailCheckout.js`: API adapter dan response mapping.

Retail dan B2B harus sama-sama discoverable, tetapi candidate ini tidak mengunci label, placement, ordering, atau visual switch treatment. Exact v1 navigation tetap protected sampai approved Retail/B2B IA decision menggantikannya.

## 5. Alur Data

```text
active catalog publication
  → local cart (variant_id, quantity)
  → authoritative server checkout preview
  → server revalidation of publication, price, and availability
  → ADR-001 transaction: order + immutable line snapshots
  → atomic multi-line reservation service contract
  → provider-neutral payment action/state
  → idempotent provider event or customer retry
  → paid | failed | expired | reconciliation | refund boundary
  → customer-safe tracking and fulfillment
```

Browser tidak pernah menjadi sumber kebenaran untuk harga, stok, publication revision, total, payment state, atau order status. Provider-specific details remain inside a future adapter and are not defined by this candidate.

## 6. Model Data

### 6.1 `orders`

Collection lama tetap dipakai. Order baru memiliki field berikut:

```json
{
  "schema_version": 2,
  "order_type": "retail_ready_stock",
  "channel": "retail_web",
  "id": "uuid",
  "order_number": "NIV-2607-0001",
  "checkout_idempotency_key": "key-hash",
  "customer_id": null,
  "guest_email": "buyer@example.com",
  "contact_snapshot": {
    "name": "Buyer",
    "email": "buyer@example.com",
    "phone": "..."
  },
  "fulfillment": {
    "method": "pickup",
    "address_snapshot": null,
    "shipping_fee": 0,
    "shipping_config_revision": 4
  },
  "line_items": [
    {
      "product_id": "uuid",
      "variant_id": "uuid",
      "publication_id": "uuid",
      "publication_revision": 3,
      "sku": "MUG-BLK",
      "name": "Mug Black",
      "option_values": {},
      "quantity": 2,
      "unit_price": 75000,
      "subtotal": 150000,
      "currency": "IDR"
    }
  ],
  "pricing_snapshot": {
    "items_subtotal": 150000,
    "shipping_fee": 0,
    "tax_included": true,
    "grand_total": 150000,
    "currency": "IDR"
  },
  "status": "awaiting_payment",
  "reservation_expires_at": "2026-07-17T12:00:00Z",
  "milestones": [],
  "status_history": [],
  "created_at": "...",
  "updated_at": "..."
}
```

Line items, publication revision, shipping fee, dan pricing snapshot immutable. Perubahan katalog, tarif, pajak, atau material tidak mengubah order yang sudah dibuat.

`customer_id` hanya diisi bila customer account contract yang sudah ada digunakan. Guest tetap `null`. Existing legacy orders keep their current shape and are read through a compatibility projection.

### 6.2 Foundation reservation contract

Checkout calls the inventory reservation service and stores only the returned reservation references on the order boundary. It does not directly write inventory balance, immutable movement, or reservation collections.

The foundation lifecycle remains:

```text
active → consumed
active → released
active → expired
```

Payment review, reconciliation, cancellation, and refund remain order/payment states. They must not introduce new inventory reservation states. The multi-line reservation operation is atomic: if one line cannot be reserved, neither the order nor any partial reservation is committed. If this service contract does not yet exist, it is a foundation prerequisite rather than a checkout-owned inventory redesign.

### 6.3 Provider-neutral `payment_attempts`

The core payment attempt stores provider-neutral data only:

- order reference, authoritative amount/currency snapshot, and idempotency key;
- safe correlation reference and adapter reference without exposing provider secrets;
- customer action requirement in provider-neutral form;
- lifecycle state such as pending, processing, succeeded, failed, expired, cancelled, review, refunded, or reconciliation as approved later;
- provider-event deduplication reference;
- customer-safe projection, audit reference, and notification state.

Provider credentials, raw payloads, vendor field names, signature details, and provider retry semantics stay inside a separate adapter. Exact provider schema and state-machine detail remain open.

Existing embedded/manual-transfer payment records and payment-proof metadata remain readable through legacy compatibility. No new proof upload or transitional manual-transfer adapter is enabled by this candidate.

### 6.4 `payment_reconciliation_cases`

Reconciliation is an explicit provider-neutral boundary for conflicting, duplicate, late, uncertain, underpaid, overpaid, or otherwise unresolved payment outcomes.

- Resolution stores actor, time, reason, recognized amount, result, and audit reference.
- Replayed provider events do not create duplicate cases or repeat order, inventory, refund, or notification effects.
- Finance policy, owner, SLA, and exact reason taxonomy remain open.
- Manual-proof-specific reconciliation applies only to readable legacy records or a future separately approved transitional adapter.

### 6.5 `refund_records`

Minimum operational record untuk refund, tanpa menjadikan customer-facing refund flow sebagai scope MVP:

- `id`, `order_id`, `payment_attempt_id`, `amount`, `currency`, `reason_code`, `status`, dan idempotency key.
- `status`: `requested`, `approved`, `processing`, `completed`, `failed`, atau `cancelled`.
- `requested_by`, `approved_by`, `processed_at`, `failure_reason`, dan audit reference.
- Refund, large price override, dan stock adjustment mengikuti permission/manager approval yang berlaku.

### 6.6 `guest_order_access`

Hanya token hash yang disimpan:

- `token_hash` unique.
- `order_id`.
- `purpose=order_tracking`.
- `expires_at`, `used_at`, `revoked_at`, `created_at`.

Raw token hanya dikirim melalui email dan ditukar sekali menjadi short-lived order-scoped HttpOnly session. Browser kemudian diarahkan ke clean tracking URL.

### 6.7 Shipping configuration

Konfigurasi dikelola melalui Admin Studio dan memiliki versioned record:

- `enabled`, `supported_regions`, `required_address_fields`, `flat_fee`, `currency`, `revision`, `effective_at`, `updated_by`, dan `audit_reference`.
- Pickup tetap tidak memerlukan address dan memiliki fee `0` hanya setelah kebijakan disetujui.
- Alamat di luar wilayah atau field wajib yang kurang mengembalikan `shipping_unavailable`; sistem tidak diam-diam mengganti ke pickup.
- Jika shipping dinonaktifkan, method shipping tidak dapat dipilih dan preview mengembalikan `shipping_unavailable`; pickup tetap mengikuti availability/policy terpisah.
- Perubahan fee/region setelah preview mengembalikan `409 shipping_quote_stale` dan meminta preview ulang.

Wilayah, alamat minimum, pemilik konfigurasi, dan kemampuan menonaktifkan shipping masih memerlukan konfirmasi stakeholder.

### 6.8 Indexes

- Unique partial `orders.order_number`.
- Unique partial `orders.checkout_idempotency_key`.
- `orders.customer_id + created_at`.
- `orders.status + updated_at`.
- `orders.guest_email + created_at` untuk internal lookup only; tidak menjadi authorization.
- Unique `guest_order_access.token_hash` dan TTL pada `expires_at`.
- `payment_attempts.order_id + created_at`.
- `payment_reconciliation_cases.status + updated_at`.
- `refund_records.order_id + created_at`.
- Existing reservation operation dan reference indexes.

Indexes ditambahkan melalui existing startup/migration mechanism dan diverifikasi sebelum mutation rollout.


## 7. Order, Payment, dan Reservation Lifecycle

### 7.1 Customer-safe projection

```text
awaiting_payment
→ payment_pending | payment_processing
→ paid
→ processing
→ ready_for_pickup | ready_to_ship
→ completed
```

Failure, expiry, cancellation, reconciliation, refund, hold, and fulfillment exceptions use customer-safe states and next actions. Raw provider payloads, internal Finance notes, credentials, and sensitive reconciliation details are never exposed.

### 7.2 Reservation lifecycle and transaction gate

- Reservation duration remains an open decision and is not fixed by this candidate.
- Checkout creates the order and all line-item reservations through the foundation multi-line reservation service within the ADR-001 transaction boundary.
- Missing transaction capability returns `503 transaction_unavailable`; no order or partial reservation is treated as successful.
- Silent fallback to non-atomic writes is prohibited.
- Payment success may consume or retain the active reservation according to the later-approved fulfillment contract; cancellation or expiry releases it exactly once.
- Payment review, reconciliation, refund, and cancellation do not create additional inventory reservation states.

### 7.3 Provider events, refund, and reconciliation

- Provider events/webhooks require stable deduplication identity and idempotent handling.
- Replayed events return the prior result and do not duplicate payment, order, inventory, refund, or notification effects.
- Refund is a separate idempotent boundary with permission, actor, time, reason, amount, and result.
- Conflicting or uncertain payment outcomes enter reconciliation without silently changing inventory or customer-visible paid state.
- Notification failure does not roll back an otherwise successful core payment transition.
- Exact payment state machine, event retention, webhook authentication, Finance operations, reconciliation SLA, and refund policy remain open.

### 7.4 Manual-transfer policy

- Manual transfer is not the Retail production baseline.
- Existing legacy manual-transfer records and proof metadata remain readable.
- No new transitional manual-transfer adapter or payment-proof upload is enabled.
- Payment proof is not part of the primary production path.
- A future transitional adapter requires a separate written decision, Finance owner, feature flag, SLA, expiry date, exit criteria, approved production storage, refund and late-payment handling, audit, and rollback controls.

### 7.5 Fulfillment and after-sales boundary

Shipping/pickup, cancellation, refund, return, pickup grace, and fulfillment-exception policies remain open. The candidate requires explicit order/payment boundaries and auditable customer-safe projections without selecting the final policy.

## 8. Candidate Core API Boundary

### Customer/public

```text
GET  /api/catalog/products
GET  /api/catalog/products/{slug}
POST /api/retail/checkout/preview
POST /api/retail/orders
GET  /api/retail/orders/{order_id}
POST /api/retail/guest-sessions/exchange
```

`checkout/preview` accepts variant IDs, quantities, and only the fulfillment inputs permitted by the later-approved policy. The response is authoritative for active publication, product/variant eligibility, price snapshot, availability, total, conflicts, and preview time. Preview does not reserve stock.

`POST /api/retail/orders` revalidates every authoritative value and invokes the atomic multi-line reservation service inside the ADR-001 transaction boundary. It returns customer-safe order and provider-neutral payment action/state data.

Guest order lookup never uses email alone. A guest exchanges a short-lived magic token for an order-scoped session.

### Payment adapter boundary

No provider-specific endpoint, SDK, schema, webhook signature, or API is selected by this candidate. A future provider adapter translates external payment actions/events into the provider-neutral core lifecycle and idempotency contract. Gateway selection and activation remain separate decisions.

Payment-proof upload is absent from the primary API boundary. Legacy proof records remain readable; a new proof endpoint requires a separately approved transitional adapter and ADR-002 production storage readiness.

### Admin API boundary

```text
GET  /api/admin/retail/orders
POST /api/admin/retail/orders/{id}/payment/reconcile
POST /api/admin/retail/orders/{id}/refund
POST /api/admin/retail/orders/{id}/status
```

Admin transitions require least privilege, allowed-state validation, audit, and immutable commercial snapshots. Exact Finance operations, reconciliation SLA, refund policy, and provider operations remain open and are not approved by these candidate routes.

## 9. Customer Authentication dan Security

### Customer authentication scope

- Repository saat ini memiliki auth/admin flow; slice ini tidak boleh mengasumsikan customer account system baru tanpa audit dan approval.
- MVP memakai guest-first checkout. Register saat checkout tidak termasuk.
- Bila Retail account contract sudah tersedia, gunakan identity system yang sama; jangan membuat silo auth baru.
- Guest order dapat diklaim setelah login hanya jika claim flow dan ownership policy disetujui; bukan acceptance requirement slice ini.
- User tidak boleh melihat order lain hanya karena email yang sama. Ownership berasal dari authenticated `customer_id` atau order-scoped guest session.

### Security/privacy

- Pydantic payloads reject unknown fields and validate email, quantity, permitted fulfillment inputs, and provider-neutral payment action/state inputs.
- Hanya published, active, retail-enabled, fixed-price, ready-stock variants yang boleh masuk checkout slice.
- Exact internal stock, material cost, supplier, margin, planned demand, profit, dan internal notes tidak pernah muncul pada customer response.
- Customer APIs enforce `customer_id` ownership; guest APIs enforce order-scoped session ownership.
- Magic links adalah hashed, short-lived, single-use exchange credentials dan tidak dipakai sebagai bearer URL berulang.
- Guest session HttpOnly, Secure in production, SameSite, order-scoped, dan dilindungi dari CSRF/origin abuse.
- ADR-002 applies to design files and every upload-dependent flow. Payment proof remains legacy-readable only and cannot be enabled for new production orders without a separately approved transitional adapter and production storage readiness.
- Rate limits apply to checkout, magic-link issuance, token exchange, payment retries, and reconciliation-sensitive actions.
- Sensitive events mencatat actor, timestamp, target, before/after, reason, dan correlation/idempotency reference.


## 10. Customer and Admin States

### Customer

- Product discovery shows only active-publication, fixed-price, ready-stock variants eligible for this candidate.
- Cart and checkout handle loading, empty, validation, stale publication/price, stock conflict, retry, and transaction-unavailable states.
- Checkout preview remains server-authoritative.
- Tracking shows customer-safe order, provider-neutral payment state/action, reconciliation guidance, milestone, ETA, fulfillment, and exception states.
- Payment-proof upload is not part of the primary production experience.

### Admin states

Admin order detail may show immutable line/pricing snapshots, reservation references, customer-safe payment state, reconciliation cases, refund records, status history, and audit events according to role. UI controls are not an authorization boundary. Exact Finance/payment operations remain open.

## 11. Feature Flags and Public Discovery

Candidate feature flags remain provider-neutral:

- `RETAIL_CATALOG_ENABLED` — read-only catalog discovery.
- `RETAIL_CART_ENABLED` — local cart.
- `RETAIL_CHECKOUT_ENABLED` — authoritative preview and protected order/reservation mutation.
- `RETAIL_PAYMENT_ENABLED` — provider-neutral payment orchestration only after dependencies and provider activation are approved.
- `RETAIL_ADMIN_ENABLED` — permitted Retail operations.

Disabling mutation flags must preserve readable order, reservation, payment, audit, and tracking history.

Retail and B2B must both remain discoverable, but this candidate does not lock the labels `Retail/Shop`, `For Business`, placement, ordering, or visual switch treatment. Exact v1 navigation remains protected until an approved Retail/B2B information-architecture decision replaces it. New routes must not become orphaned, and no homepage/navigation pattern is selected here.

## 12. Migration dan Compatibility

- Tidak ada destructive migration.
- Existing legacy orders tetap readable dan mempertahankan field saat ini.
- New Retail orders memakai `schema_version=2` dan `order_type=retail_ready_stock`.
- Existing `GET /orders` dan admin order views tetap mendukung legacy records.
- New index creation memakai existing preflight/startup index path.
- Rollback menonaktifkan Retail mutation flags/routes dan mempertahankan order/reservation/payment records untuk reconciliation; tidak menghapus history.
- Existing 3D-printing order, auth, dashboard, dan API regression checks wajib tetap green.

## 13. Testing dan Acceptance

### Backend and integration

- Authoritative preview rejects stale publication, price, availability, and disallowed fulfillment inputs.
- Checkout calls the foundation atomic multi-line reservation contract and never writes inventory collections directly.
- Missing transaction capability returns `503 transaction_unavailable` without partial order/reservation data or fallback.
- Concurrency test for the final available unit allows only one successful reservation.
- Provider-event replay is idempotent and does not duplicate order, inventory, refund, reconciliation, or notification effects.
- Customer projections exclude provider secrets, raw events, internal stock, supplier, cost, margin, profit, and Finance notes.
- Legacy manual-transfer orders/proofs remain readable without enabling a new proof flow.
- Upload-dependent tests remain blocked from production assumptions until ADR-002 readiness is approved.
- Existing order/auth/admin compatibility tests remain green.

### Customer experience

- Guest-first cart, preview, checkout, and tracking handle loading, empty, validation, conflict, retry, permission/session expiry, and `transaction_unavailable` states.
- Payment UI consumes provider-neutral action/state and does not assume a gateway vendor.
- Tracking shows customer-safe payment, reconciliation, refund, fulfillment, milestone, and next-action states.
- Retail and B2B discovery can be tested without asserting deferred labels, placement, order, or visual treatment.

### Acceptance criteria untuk candidate

- Candidate remains not approved for implementation.
- Guest can preview fixed-price ready-stock items using an authoritative server response.
- Order creation and every line-item reservation succeed atomically or fail without partial writes.
- Active catalog publication and authoritative product/variant pricing snapshots are reused.
- Foundation reservation lifecycle remains `active → consumed | released | expired`.
- Provider-neutral payment lifecycle, adapter separation, idempotent events, refund/reconciliation boundary, and customer-safe projection are preserved.
- No provider-specific SDK, schema, webhook signature, or API is selected.
- No new manual-transfer adapter or payment-proof production path is enabled.
- Retail Order and B2B Quote/Project remain separate aggregates and state machines.
- All listed business, provider, storage, protected-scope, and readiness decisions remain open.

## 14. Operational Constraints dan Deferred Decisions

### Transaction gate — `doc/decisions/ADR-001-mongodb-transaction-capability.md`

- Checkout/order/reservation cross-collection mutation requires replica-set transaction capability.
- Local mutation development uses a single-node replica set; CI uses an isolated replica set; staging/production require capability before affected mutation flags.
- Standalone MongoDB is limited to read-only or proven-safe single-document atomic operations.
- Missing capability returns `503 transaction_unavailable`; silent non-atomic fallback is prohibited.

### Storage gate — `doc/decisions/ADR-002-production-file-storage-architecture.md`

- ADR-002 applies to design files and every upload-dependent flow.
- Production upload remains blocked by provider, authorization/ownership, validation, malware/quarantine, backup/restore, reconciliation, ownership, and readiness conditions.
- Manual payment proof cannot be enabled without a separately approved transitional adapter and approved production storage.
- Local development storage does not satisfy production persistence.

### Payment gate — `doc/decisions/ADR-003-retail-payment-orchestration-boundary.md`

- Online payment remains the Retail production target.
- Provider-neutral core, separate adapters, idempotent events, refund/reconciliation boundaries, and customer-safe projections are required.
- Gateway provider selection is required for provider integration and production go-live, not for this candidate architecture.
- Manual transfer remains disabled as a new path.

The following remain open:

- shipping and pickup policy;
- tax treatment;
- reservation duration;
- cancellation, refund, and return policy;
- transitional manual-transfer adapter;
- protected-scope implementation permission;
- payment provider;
- production storage provider;
- production readiness and go-live.

No open item is silently resolved by this candidate.

## 15. Boundary untuk Implementation Plan Berikutnya

Setelah spec ini disetujui stakeholder, implementation plan harus dipisah menjadi fase berikut:

| Fase | Fokus |
|---|---|
| Phase 0 | Stakeholder and product lock |
| Phase 1 | Repository and infrastructure audit |
| Phase 2 | Read-only Retail catalog |
| Phase 3 | Local cart and authoritative checkout preview |
| Phase 4 | Transactional order and stock reservation |
| Phase 5 | Guest access and tracking |
| Phase 6 | Provider-neutral payment orchestration boundary; provider integration remains gated |
| Phase 7 | Fulfillment and admin operations |
| Phase 8 | Retail/B2B public website integration |
| Phase 9 | Production hardening and operational readiness |

Setiap fase di implementation plan wajib memiliki exact file scope, dependency, acceptance criteria, test commands, migration boundary, rollback procedure, feature flag, commit boundary, dan regression checks. Plan belum dibuat dalam revision pass ini.

## 16. Risk Register

BFRI dihapus karena tidak ditemukan sebagai framework project yang disepakati pada source-of-truth project. Risiko dicatat dengan risk register berikut:

| Risiko | Dampak | Mitigasi/gate | Owner/approval |
|---|---|---|---|
| Keputusan bisnis belum dikonfirmasi | Implementasi salah arah atau rework | Phase 0 decision log; jangan enable mutation flags | Stakeholder/Product |
| MongoDB transaction capability tidak tersedia | Partial order/reservation atau overselling | Capability preflight; controlled `503 transaction_unavailable`; no non-atomic fallback | Backend/Platform |
| Payment/reservation timing belum disetujui | Stok dapat tertahan atau dilepas tidak konsisten | Keep duration open; do not enable mutation until policy is approved | Finance/Operations |
| Payment exception tidak ter-reconcile | Salah status, refund, atau laporan keuangan | Reconciliation queue, idempotent case, SLA/age monitoring | Finance |
| Legacy order/auth/API regression | Operasi lama terhenti | Compatibility projection dan regression suite | Backend/Order Admin |
| Customer data leakage | Pelanggaran privasi | Ownership query, guest session, safe projection, forbidden-field tests | Security/Backend |
| Shipping policy belum jelas | Total dan eligibility tidak konsisten | Versioned shipping config dan stale-preview conflict | Operations/Stakeholder |
| Feature flag rollback tidak aman | Order aktif kehilangan akses | Disable mutation only; retain tracking/admin reconciliation | Release owner |
| Retail mengaburkan B2B | Positioning dan conversion B2B turun | Preserve discoverability without locking deferred IA labels or visual treatment | Product/Brand |
| Production storage belum siap | Design/upload data dapat hilang atau tidak aman | Block production upload until ADR-002 provider and readiness gates are approved | Operations |

## 17. Unresolved Risks dan Approval Checklist

Before a Retail Order & Checkout implementation plan, Retail checkout implementation, or related production enablement, the following written decisions are still required:

- shipping and pickup policy;
- tax treatment;
- reservation duration;
- cancellation, refund, and return policy;
- any transitional manual-transfer adapter and its Finance controls;
- protected-scope implementation permission;
- payment gateway provider and provider activation;
- production storage provider and ADR-002 readiness;
- production readiness and go-live.

This gate does not block separate Foundation implementation planning and coding for approved transaction capability, catalog publication, inventory movement/balance/reservation contracts, or development/demo storage work, provided the work remains within approved scope and does not modify protected areas without permission.

The atomic multi-line inventory reservation service contract is a foundation prerequisite. If it is unavailable, checkout must not redefine inventory collections or proceed with a non-atomic fallback.

Status remains **Technical Design Candidate — not approved for implementation**. This synchronization records approved architecture constraints but does not approve coding, migrations, infrastructure, payment activation, uploads, or production release.
