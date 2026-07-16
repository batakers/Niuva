# Retail Order & Checkout Foundation — Design Spec

Tanggal: 16 Juli 2026  
Status: Technical design candidate — belum disetujui untuk implementasi
Scope kandidat: Retail ready-stock, fixed-price, multi-item checkout, transfer manual; bukan keputusan platform-wide

Dokumen ini merevisi candidate spec pada commit `a433141` berdasarkan review stakeholder. BRD/PRS v2.1, PRD v2.1, `PRODUCT.md`, `AGENTS.md`, dan keputusan stakeholder terbaru menjadi sumber kebenaran. Revision pass ini hanya mengubah dokumen desain; tidak ada production code yang diubah.

## 1. Tujuan dan Posisi Produk

Membangun vertical slice commerce Retail yang menghubungkan katalog publik, harga fixed, inventory, reservasi stok, checkout guest, pembayaran transfer manual, dan tracking order dalam satu alur yang dapat diuji.

Slice ini menjadi dasar untuk pembayaran online, konfigurasi custom, fulfillment, dan B2B tanpa mengubah histori order 3D-printing yang sudah ada. Dokumen ini tidak menggantikan jalur B2B: B2B tetap memakai capabilities, portfolio, consultation/inquiry, RFQ, quotation, approval, project, dan milestone.

### Posisi dalam satu website

- Retail dan B2B berbagi brand, public website shell, CMS, katalog, inventory, produksi, pembayaran, shipment, notification, audit, dan Admin Studio.
- Entry point dan conversion flow berbeda: Retail memakai katalog → cart → checkout → payment → order tracking; B2B memakai capability/portfolio → consultation atau project inquiry/RFQ → quotation → approval → project delivery.
- Retail order adalah catatan transaksi standar. B2B project/quotation adalah catatan eksekusi kompleks dan governance; keduanya tidak dicampur menjadi satu checkout.
- Public discovery untuk kedua journey wajib tersedia saat release. Visual redesign homepage tetap dapat deferred, tetapi route tidak boleh orphaned.

## 2. Decision Gate dan Baseline Teknis

### 2.1 Keputusan bisnis/product yang memerlukan konfirmasi stakeholder

Technical brainstorming tidak boleh dianggap sebagai approval bisnis. Nilai di bawah adalah scope kandidat atau usulan operasional sampai stakeholder mengonfirmasi secara eksplisit.

| Keputusan | Kandidat untuk slice ini | Status |
|---|---|---|
| Produk dan pricing mode | `ready_stock` + `pricing_mode=fixed` | Requires stakeholder confirmation; tidak mengubah dukungan platform terhadap `calculated`/`quote_required` |
| Keranjang | Multi-item; browser hanya menyimpan variant ID dan quantity | Requires stakeholder confirmation |
| Checkout identity | Guest-first; tidak membangun customer auth baru | Requires stakeholder confirmation; reuse account yang sudah ada bila kontraknya terbukti |
| Fulfillment | Pickup gratis dan shipping flat-rate | Requires stakeholder confirmation |
| Wilayah/alamat shipping | Wilayah, field alamat minimum, dan unsupported-address behavior ditentukan bisnis | Requires stakeholder confirmation |
| Pajak | Harga ditampilkan tax-inclusive tanpa baris pajak terpisah | Requires stakeholder confirmation/finance review |
| Reservation | Durasi awal 24 jam | Requires stakeholder confirmation |
| Pembayaran | Transfer manual + payment proof; gateway provider ditunda | Requires stakeholder confirmation dan finance approval |
| Guest tracking | Magic-link email yang ditukar menjadi session order-scoped | Requires stakeholder confirmation dan kesiapan email boundary |
| Payment review | SLA admin, review hold, grace period, dan absolute deadline | Requires stakeholder confirmation; usulan teknis ada di §7 |
| Cancellation/refund/return | Operational handling wajib ada, customer-facing scope dapat ditunda | Requires stakeholder confirmation/finance policy |

### 2.2 Baseline teknis yang tetap berlaku

- Backend authoritative untuk harga, publication revision, ketersediaan, total, dan status.
- Line item serta pricing snapshot immutable setelah order dibuat.
- Idempotency, conflict handling, audit, legacy compatibility, dan concurrency safety adalah invariant teknis.
- Implementasi target tetap modular monolith React, FastAPI, dan MongoDB, dengan guard transaction capability.
- Slice ini tidak mengunci provider payment gateway, courier, shipping zone, atau pola visual homepage.

## 3. Batas Scope

### Termasuk

- Public Retail catalog dan product detail untuk variant yang lolos publication dan fixed ready-stock policy.
- Cart lokal multi-item.
- Guest-first checkout. Customer account path hanya memakai identity/account contract yang sudah ada; pembuatan auth customer baru tidak termasuk.
- Snapshot harga dan katalog pada order.
- Pickup atau flat-rate shipping setelah wilayah dan tarif disetujui.
- Atomic inventory reservation untuk seluruh line item bila MongoDB transaction capability tersedia.
- Manual transfer instructions dan payment-proof upload sebagai baseline provider-neutral.
- Guest tracking session dan customer tracking dengan customer-safe projection.
- Admin order/payment verification, reconciliation queue, dan permitted fulfillment transition.
- Customer-safe milestone tracking, audit, idempotency, expiry, conflict, dan retry handling.

### Tidak termasuk

- Produk `calculated` atau `quote_required` dalam checkout langsung; konfigurasi kompleks dialihkan ke quote flow pada slice berikutnya.
- Custom configuration atau file upload pada checkout Retail ready-stock.
- Payment gateway online, webhook provider, atau automatic courier integration.
- Live shipping rate, courier label, resi otomatis, atau shipping zone policy yang belum disetujui.
- B2B quotation, organization approval, atau project workflow.
- Supplier purchase automation.
- Pembuatan customer authentication baru.
- Visual redesign homepage yang masih deferred; namun minimum discovery integration pada §11 tetap wajib sebelum release.

### Protected-scope approval

Implementasi Retail memerlukan izin eksplisit sebelum menyentuh:

- collection dan projection `orders`;
- inventory reservation serta release/consume operation;
- backend route/service/repository dan API lama;
- authentication, customer access, dan guest session;
- admin order view, payment verification, reconciliation, dan refund operation;
- dashboard, fulfillment, production, notification, atau operational flow terkait.

Existing 3D-printing orders, auth flow, dashboard, dan API lama harus tetap backward compatible. Tidak ada perubahan pada area protected dalam revision pass ini.


## 4. Arsitektur

Fitur menggunakan modular monolith. Route hanya memvalidasi request dan mengembalikan response; aturan bisnis berada pada service/domain; akses MongoDB dipusatkan pada repository untuk slice ini.

### Backend modules

- `backend/retail_checkout_routes.py`: endpoint public/customer/guest/admin dan Pydantic payload.
- `backend/retail_checkout_service.py`: preview, checkout transaction, state transition, expiry, payment proof, reconciliation, dan idempotency.
- `backend/retail_checkout_repository.py`: query order, catalog publication, inventory balance, reservation, payment attempt, shipping config, dan guest session.
- `backend/retail_checkout_domain.py`: fungsi murni untuk validasi cart, snapshot, subtotal, ongkir, total, expiry, exception projection, dan status transition.
- `backend/retail_checkout_indexes.py`: index order, idempotency, payment, reconciliation, dan guest-session.
- `backend/server.py`: hanya memasang router dan dependency yang sudah ada.

Perubahan tidak merombak modul katalog, material, atau inventory yang sudah merged. Service checkout memanggil kontrak inventory/reservation yang sudah ada dan mengembalikan `503 transaction_unavailable` bila mutation transaction tidak dapat dijamin.

### Frontend modules

- `frontend/src/pages/retail/RetailCatalog.jsx`: list dan filter produk publik.
- `frontend/src/pages/retail/RetailProduct.jsx`: detail, varian, availability, dan add-to-cart.
- `frontend/src/pages/retail/RetailCart.jsx`: cart localStorage.
- `frontend/src/pages/retail/RetailCheckout.jsx`: kontak, fulfillment, preview, dan submit.
- `frontend/src/pages/retail/RetailTracking.jsx`: tracking customer/guest, payment proof, dan exception message.
- `frontend/src/lib/retailCart.js`: validasi, normalisasi, add/update/remove, dan migration key cart.
- `frontend/src/lib/retailCheckout.js`: API adapter dan response mapping.

Route public baru harus dipasang di public navigation dengan feature flag; pemasangan route tidak memilih pola homepage yang masih deferred.

## 5. Alur Data

```text
Public catalog
  → local cart (variant_id, quantity)
  → checkout preview + shipping validation
  → server revalidation
  → transaction: order + line snapshots + reservations
  → payment instructions + guest magic-link dispatch
  → payment proof
  → payment review or reconciliation queue
  → admin verification / exception resolution
  → processing / QC / ready / completed or after-sales exception
```

Browser tidak pernah menjadi sumber kebenaran untuk harga, stok, publication revision, total, shipping config revision, atau order status.

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
  "payment_review_expires_at": null,
  "absolute_payment_deadline_at": "2026-07-18T12:00:00Z",
  "payment_attempt_count": 0,
  "milestones": [],
  "status_history": [],
  "created_at": "...",
  "updated_at": "..."
}
```

Line items, publication revision, shipping fee, dan pricing snapshot immutable. Perubahan katalog, tarif, pajak, atau material tidak mengubah order yang sudah dibuat.

`customer_id` hanya diisi bila customer account contract yang sudah ada digunakan. Guest tetap `null`. Existing legacy orders keep their current shape and are read through a compatibility projection.

### 6.2 `inventory_reservations`

Setiap line item memiliki satu reservation reference:

- `reference_type=retail_order`.
- `reference_id=order.id`.
- `subject_type=product_variant`.
- `subject_id=variant.id`.
- `quantity` sebagai normalized Decimal string.
- `status`: `active`, `payment_review`, `consumed`, `released`, `expired`, atau `cancelled`.
- `expires_at`, `created_at`, `updated_at`, dan operation metadata.

Checkout menulis semua reservation atomically. Jika satu line tidak cukup, tidak ada order/reservation partial yang boleh tersimpan.

### 6.3 `payment_attempts`

Payment proofs adalah append-only records:

- `id`, `order_id`, `proof` metadata, `submitted_at`.
- `status`: `pending_review`, `verified`, `rejected`, `needs_reconciliation`, `duplicate`, atau `expired`.
- `reviewed_by`, `reviewed_at`, `rejection_reason`.
- `audit_reference`, `notification_state`, dan idempotency/reference metadata.

Existing embedded payment fields tetap readable untuk legacy orders.

### 6.4 `payment_reconciliation_cases`

Operational queue untuk pembayaran yang tidak dapat diverifikasi langsung:

- `id`, `order_id`, `payment_attempt_id`, `reason_code`, `status`, `owner_role`, `notes`, `created_at`, `updated_at`.
- `reason_code`: `underpaid`, `overpaid`, `duplicate_proof`, `late_payment`, `wrong_destination`, `sender_mismatch`, atau `needs_clarification`.
- `status`: `open`, `awaiting_customer`, `awaiting_finance`, `resolved`, atau `closed`.
- Resolution wajib menyimpan actor, waktu, keputusan, nominal yang diakui, dan audit reference.

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

### 7.1 Customer-facing projection

```text
awaiting_payment
→ payment_review
→ paid
→ processing
→ ready_for_pickup | ready_to_ship
→ completed
```

Exception projection:

```text
awaiting_payment → expired | cancelled
payment_review → awaiting_payment | payment_reconciliation
paid/processing → on_hold | fulfilment_exception | cancelled
ready_for_pickup → pickup_expired | completed
ready_to_ship → shipping_exception | completed
cancelled/fulfilment_exception → refund_pending → refunded
```

Internal state boleh lebih rinci, tetapi customer hanya menerima state dan next action yang aman.

### 7.2 Bounded payment hold

Angka berikut adalah **usulan baseline teknis yang memerlukan konfirmasi stakeholder**, bukan business approval:

| Parameter | Usulan baseline | Aturan |
|---|---:|---|
| Initial reservation | 24 jam sejak checkout | Expire bila tidak ada proof yang diterima |
| `payment_review_expires_at` | 12 jam sejak proof diterima | Review hold tidak boleh melewati absolute deadline |
| Absolute payment deadline | 48 jam sejak checkout | Setelah ini proof baru masuk reconciliation, tidak otomatis menghidupkan reservation |
| Maksimal payment attempt | 3 attempt per order | Attempt ke-4 ditolak dan diarahkan ke finance queue |
| Grace period setelah rejection | 6 jam | Tidak me-reset 24 jam; tetap dibatasi absolute deadline |
| Admin extension | Satu kali, maksimal 24 jam | Wajib role/permission, alasan, actor, dan audit; tidak otomatis |
| Review SLA | Maksimal 1 hari kerja | Pelanggaran SLA masuk at-risk queue/notification |

Aturan mutasi:

1. Checkout membuat order dan seluruh reservation dalam satu MongoDB transaction capability check.
2. Proof yang diterima sebelum initial expiry mengubah order ke `payment_review`, reservation ke `payment_review`, dan mengisi `payment_review_expires_at`.
3. Rejected proof mengembalikan `awaiting_payment` dengan grace period tersisa; tidak pernah memberikan reset 24 jam berulang.
4. Review hold atau absolute deadline yang lewat me-release seluruh reservation tepat satu kali.
5. Verified payment mempertahankan reservation sampai fulfillment consume.
6. Admin extension memperpanjang deadline yang tercatat, bukan menghapus expiry.
7. Retry dengan idempotency key yang sama mengembalikan hasil lama; payload berbeda mengembalikan `409 idempotency_conflict`.

### 7.3 Payment exception dan reconciliation

| Kondisi | State awal | Penanganan minimum |
|---|---|---|
| Transfer kurang | `needs_reconciliation` | Finance menandai nominal diterima, minta pelunasan atau cancel/refund; tidak boleh auto-verify penuh |
| Transfer lebih | `needs_reconciliation` | Finance memilih credit, refund selisih, atau klarifikasi; simpan keputusan dan nominal |
| Bukti duplikat | `duplicate` | Link ke attempt canonical; tidak membuat reservation/payment operation baru |
| Pembayaran setelah order expired | `expired` + reconciliation case | Jangan re-reserve otomatis; finance memilih refund atau order recreation dengan audit |
| Rekening tujuan salah | `needs_reconciliation` | Finance mengonfirmasi dana; order tidak dianggap paid sebelum keputusan |
| Nama pengirim berbeda | `needs_reconciliation` | Minta klarifikasi atau verifikasi manual; customer response tidak membuka data internal |
| Bukti tidak jelas | `awaiting_customer`/`needs_reconciliation` | Minta upload ulang atau klarifikasi; attempt tetap append-only |

Notification failure tidak me-roll back order/payment record. Queue reconciliation memiliki retry dan idempotency sendiri.

### 7.4 Fulfillment dan after-sales exception

| Kondisi | Operational handling | Customer projection |
|---|---|---|
| Cancellation sebelum paid | Release reservation tepat satu kali; tutup order | `cancelled` |
| Cancellation setelah paid | Hold fulfillment, buat refund case sesuai policy, audit actor/reason | `cancelled` → `refund_pending` |
| Refund | Finance approval dan idempotent refund record | `refund_pending`/`refunded` |
| Pickup tidak diambil | Set pickup grace policy; setelah lewat pindah ke `pickup_expired` dan buat queue follow-up | `pickup_expired` |
| Shipping exception | Set `shipping_exception`, simpan carrier/manual note, retry atau return-to-origin decision | `shipping_exception` |
| Barang rusak atau stok tidak terpenuhi setelah paid | `fulfilment_exception`, manager decision untuk replacement/refund, audit | `on_hold`/`refund_pending` |
| Admin salah verifikasi | Reopen reconciliation/verification case; reversal tidak menghapus history; manager approval untuk correction | Status aman sesuai hasil koreksi |

Cancellation, refund, return, pickup grace, dan shipping exception policy masih memerlukan konfirmasi stakeholder/finance. Operational queue tetap wajib ada sebelum real checkout traffic.

## 8. API Contract

### Customer/public

```text
GET  /api/catalog/products
GET  /api/catalog/products/{slug}
POST /api/retail/checkout/preview
POST /api/retail/orders
GET  /api/retail/orders/{order_id}
POST /api/retail/orders/{order_id}/payment-proof
POST /api/retail/guest-sessions/exchange
```

`checkout/preview` menerima variant IDs, quantities, fulfillment method, dan address bila shipping dipilih. Response authoritative mencakup snapshot, item subtotal, shipping fee, tax-included indicator, shipping config revision, grand total, conflict code bila ada, dan preview timestamp. Preview tidak me-reserve stock.

`POST /api/retail/orders` membutuhkan `Idempotency-Key`, contact data, line items, fulfillment data, dan optional customer bearer token hanya bila account contract yang ada dipakai. Endpoint me-revalidate semua nilai, membuat order/reservations transactionally, dan mengembalikan order summary, payment instructions, serta dispatch status tanpa menampilkan internal data.

Guest order lookup tidak boleh menggunakan email saja. Guest harus menukar magic token menjadi order-scoped session.

### Admin

```text
GET  /api/admin/retail/orders
POST /api/admin/retail/orders/{id}/payment/verify
POST /api/admin/retail/orders/{id}/payment/reject
POST /api/admin/retail/orders/{id}/payment/reconcile
POST /api/admin/retail/orders/{id}/refund
POST /api/admin/retail/orders/{id}/status
GET  /api/admin/retail/shipping-config
PUT  /api/admin/retail/shipping-config
```

Admin transitions memerlukan permission yang sesuai, memvalidasi allowed state transition, menulis audit event, dan tidak mengubah immutable line/pricing snapshot. Refund, payment reconciliation, shipping config, dan correction mengikuti least privilege/manager approval.

## 9. Customer Authentication dan Security

### Customer authentication scope

- Repository saat ini memiliki auth/admin flow; slice ini tidak boleh mengasumsikan customer account system baru tanpa audit dan approval.
- MVP memakai guest-first checkout. Register saat checkout tidak termasuk.
- Bila Retail account contract sudah tersedia, gunakan identity system yang sama; jangan membuat silo auth baru.
- Guest order dapat diklaim setelah login hanya jika claim flow dan ownership policy disetujui; bukan acceptance requirement slice ini.
- User tidak boleh melihat order lain hanya karena email yang sama. Ownership berasal dari authenticated `customer_id` atau order-scoped guest session.

### Security/privacy

- Pydantic payloads reject unknown fields dan validate email, quantity, fulfillment method, shipping address, serta proof metadata.
- Hanya published, active, retail-enabled, fixed-price, ready-stock variants yang boleh masuk checkout slice.
- Exact internal stock, material cost, supplier, margin, planned demand, profit, dan internal notes tidak pernah muncul pada customer response.
- Customer APIs enforce `customer_id` ownership; guest APIs enforce order-scoped session ownership.
- Magic links adalah hashed, short-lived, single-use exchange credentials dan tidak dipakai sebagai bearer URL berulang.
- Guest session HttpOnly, Secure in production, SameSite, order-scoped, dan dilindungi dari CSRF/origin abuse.
- Payment proof memakai existing validated local storage boundary dan controlled download headers.
- Rate limits berlaku untuk checkout, magic-link issuance, token exchange, proof upload, dan reconciliation-sensitive actions.
- Sensitive events mencatat actor, timestamp, target, before/after, reason, dan correlation/idempotency reference.


## 10. UX dan Admin States

### Customer

- `/shop`: product list, category filter, public stock status, dan entry yang jelas ke Retail.
- `/shop/:slug`: variant selection, fixed price, availability, dan add-to-cart.
- `/cart`: multi-item cart, quantity changes, remove, dan stale-data warning.
- `/checkout`: guest contact, pickup/shipping, address, flat fee, tax-inclusive total, shipping unsupported state, dan consent.
- `/track`: milestone timeline, payment state, ETA, next action, upload proof, reconciliation instruction, pickup/shipping status, dan exception-safe message.

Setiap page menangani loading, empty, validation, server error, retry, price conflict, stock conflict, shipping quote conflict, reservation expiry, reconciliation, dan permission/session expiry.

### Admin

Admin order detail menampilkan line snapshots, reservation state, deadline/hold, payment attempts, reconciliation cases, refund records, status history, dan audit events. Finance dapat verify/reject/reconcile/refund sesuai policy; Warehouse dapat mengelola fulfillment; Order Admin dapat mengelola permitted status transitions. UI controls bukan authorization boundary; backend permissions wajib.

## 11. Feature Flag dan Public Discovery

Feature flags minimum:

- `RETAIL_CATALOG_ENABLED` — mengaktifkan public catalog.
- `RETAIL_CART_ENABLED` — mengaktifkan local cart.
- `RETAIL_CHECKOUT_ENABLED` — mengaktifkan preview/order mutation.
- `RETAIL_PAYMENT_PROOF_ENABLED` — mengaktifkan upload dan review proof.
- `RETAIL_ADMIN_ENABLED` — mengaktifkan admin Retail operations.

Rollout bertahap dimulai dari read-only catalog. Bila checkout dinonaktifkan:

- katalog boleh tetap tersedia;
- order yang sudah dibuat tetap dapat dilacak;
- admin tetap dapat menyelesaikan order aktif melalui controlled operational path;
- order, reservation, payment history, dan audit data tidak dihapus.

Minimum public discovery requirement sebelum production release:

- entry `Retail/Shop` pada navigasi;
- entry `For Business` atau B2B;
- CTA Retail dan B2B yang berbeda;
- link Retail support di Footer;
- `/shop` tidak orphaned walaupun homepage visual pattern masih deferred.

## 12. Migration dan Compatibility

- Tidak ada destructive migration.
- Existing legacy orders tetap readable dan mempertahankan field saat ini.
- New Retail orders memakai `schema_version=2` dan `order_type=retail_ready_stock`.
- Existing `GET /orders` dan admin order views tetap mendukung legacy records.
- New index creation memakai existing preflight/startup index path.
- Rollback menonaktifkan Retail mutation flags/routes dan mempertahankan order/reservation/payment records untuk reconciliation; tidak menghapus history.
- Existing 3D-printing order, auth, dashboard, dan API regression checks wajib tetap green.

## 13. Testing dan Acceptance

### Backend

- Unit test cart normalization, price snapshot, flat shipping, tax-inclusive total, shipping region validation, deadline calculation, token hashing, exception projection, dan state transitions.
- Integration test successful checkout, stale price, unavailable product, insufficient stock, shipping quote conflict, duplicate idempotency, reservation release, payment rejection, payment hold expiry, max attempts, reconciliation cases, refund idempotency, guest session ownership, customer projection, dan feature flags.
- Concurrency test dua checkout yang berebut unit terakhir; hanya satu atomic reservation berhasil.
- Migration/index test memverifikasi unique keys dan mempertahankan legacy orders.
- Regression test memastikan existing order/auth/admin APIs tidak berubah secara breaking.

### Frontend

- Cart add/update/remove dan localStorage migration.
- Preview dan checkout success/error/conflict paths.
- Pickup/shipping address validation dan unsupported-region state.
- Reservation timer, payment-review deadline, stale-price/stock conflict, dan retry.
- Guest tracking exchange, proof upload, reconciliation instruction, milestone, refund-pending, pickup-expired, dan shipping-exception states.
- Feature-flag rollout dan public navigation/orphan route check.

### Acceptance criteria untuk slice kandidat

- Guest dapat memilih beberapa fixed-price ready-stock variants, preview total authoritative, dan membuat satu order setelah keputusan bisnis terkait dikonfirmasi.
- Checkout me-reserve seluruh stock secara atomic atau mengembalikan conflict yang jelas tanpa partial data.
- Price, stock, publication revision, dan shipping config direvalidasi server-side saat order creation.
- Pickup/shipping hanya tersedia sesuai policy wilayah dan tarif yang dikonfirmasi.
- Payment proof membuat payment attempt yang dapat direview, tetapi tidak menghentikan expiry tanpa batas.
- Under/overpayment, duplicate proof, late payment, wrong destination, sender mismatch, dan unclear proof masuk reconciliation path yang dapat diaudit.
- Guest tracking tidak pernah membuka order lain dan raw magic token tidak tersisa di final URL.
- Customer responses tidak mengandung internal stock, supplier, cost, margin, profit, atau audit data.
- Retry tidak membuat duplicate order, reservation, payment attempt, refund, reconciliation case, atau notification record.
- Cancellation, refund, pickup, shipping, dan paid-fulfillment exception memiliki operational handling meskipun sebagian customer-facing action deferred.
- Existing legacy order/auth/admin tests tetap green.


## 14. Operational Constraints dan Deferred Decisions

- Checkout/reservation mutation membutuhkan MongoDB transaction capability. Standalone MongoDB dapat melayani read-only/public catalog tetapi mengembalikan controlled `503 transaction_unavailable` untuk checkout mutation.
- Email delivery menggunakan existing emailer boundary; notification failure di-retry dan tidak me-roll back core order creation.
- Payment gateway provider, courier provider, shipping zones, customer account contract detail, payment SLA, cancellation/refund/return policy, pickup grace, dan homepage visual navigation tetap deferred sampai stakeholder approval.
- Production local-file storage tetap membutuhkan persistent volume, backup, retention, dan recovery policy sebelum go-live.
- Operational monitoring minimum: checkout conflict rate, reservation expiry/release, payment review age, reconciliation queue age, refund failure, notification failure, dan feature-flag state.

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
| Phase 6 | Manual payment review |
| Phase 7 | Fulfillment and admin operations |
| Phase 8 | Retail/B2B public website integration |
| Phase 9 | Production hardening and operational readiness |

Setiap fase di implementation plan wajib memiliki exact file scope, dependency, acceptance criteria, test commands, migration boundary, rollback procedure, feature flag, commit boundary, dan regression checks. Plan belum dibuat dalam revision pass ini.

## 16. Risk Register

BFRI dihapus karena tidak ditemukan sebagai framework project yang disepakati pada source-of-truth project. Risiko dicatat dengan risk register berikut:

| Risiko | Dampak | Mitigasi/gate | Owner/approval |
|---|---|---|---|
| Keputusan bisnis belum dikonfirmasi | Implementasi salah arah atau rework | Phase 0 decision log; jangan enable mutation flags | Stakeholder/Product |
| MongoDB transaction capability tidak tersedia | Partial order/reservation atau overselling | Capability preflight; controlled `503`; atomic/idempotent fallback hanya bila disetujui | Backend/Platform |
| Payment review hold tidak berbatas | Stok tertahan tanpa batas | Review hold, absolute deadline, max attempt, grace, extension audit | Finance/Operations |
| Payment exception tidak ter-reconcile | Salah status, refund, atau laporan keuangan | Reconciliation queue, idempotent case, SLA/age monitoring | Finance |
| Legacy order/auth/API regression | Operasi lama terhenti | Compatibility projection dan regression suite | Backend/Order Admin |
| Customer data leakage | Pelanggaran privasi | Ownership query, guest session, safe projection, forbidden-field tests | Security/Backend |
| Shipping policy belum jelas | Total dan eligibility tidak konsisten | Versioned shipping config dan stale-preview conflict | Operations/Stakeholder |
| Feature flag rollback tidak aman | Order aktif kehilangan akses | Disable mutation only; retain tracking/admin reconciliation | Release owner |
| Retail mengaburkan B2B | Positioning dan conversion B2B turun | Dua entry point, CTA, dan public discovery minimum | Product/Brand |
| Local file storage tidak siap production | Bukti pembayaran/file hilang | Persistent volume, backup, retention, recovery gate | Operations |

## 17. Unresolved Risks dan Approval Checklist

Sebelum implementation plan dibuat, stakeholder perlu mengonfirmasi: scope ready-stock/fixed untuk slice, multi-item cart, guest/account behavior, pickup/shipping region dan flat fee, tax treatment, reservation/hold numbers, manual transfer, payment review SLA, cancellation/refund/return policy, customer account availability, protected-scope access, dan minimum Retail/B2B navigation release requirement.

Status dokumen tetap **candidate** sampai checklist tersebut memiliki keputusan tertulis. Setelah itu pengguna diminta meninjau file spec ini kembali; tidak ada coding workflow atau production change yang boleh dimulai dari dokumen candidate.
