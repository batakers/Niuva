# Retail Order & Checkout Foundation — Design Spec

Tanggal: 16 Juli 2026  
Status: Desain disetujui melalui brainstorming; menunggu review dokumen pengguna  
Scope: Retail ready-stock, fixed-price, multi-item checkout, transfer manual

## 1. Tujuan

Membangun vertical slice Retail yang menghubungkan katalog publik, harga fixed, inventory, reservasi stok, checkout guest, pembayaran transfer manual, dan tracking order dalam satu alur yang dapat diuji.

Slice ini menjadi dasar untuk pengembangan pembayaran online, konfigurasi custom, fulfillment, dan B2B tanpa mengubah histori order 3D-printing yang sudah ada.

## 2. Keputusan yang Dikunci

- Produk awal hanya `ready_stock` dengan `pricing_mode=fixed`.
- Checkout mendukung banyak produk/varian dalam satu keranjang.
- Keranjang disimpan di browser dan hanya menyimpan variant ID serta quantity.
- Harga, publication revision, dan ketersediaan selalu dihitung ulang oleh backend.
- Guest checkout tidak mewajibkan akun.
- Tracking guest menggunakan magic link melalui email.
- Pickup di Niuva gratis.
- Shipping memakai satu tarif flat yang dapat diatur admin.
- Harga produk dianggap sudah termasuk pajak; tidak ada perhitungan pajak terpisah.
- Stok direservasi selama 24 jam setelah checkout.
- Upload bukti pembayaran memindahkan order ke `payment_review` dan menghentikan expiry otomatis sampai admin memverifikasi atau menolak bukti.
- Pembayaran menggunakan transfer manual dan bukti pembayaran; provider payment gateway ditunda.
- Implementasi tetap modular monolith React, FastAPI, dan MongoDB.

## 3. Batas Scope

### Termasuk

- Public Retail catalog dan product detail.
- Cart lokal multi-item.
- Checkout guest dan customer login.
- Snapshot harga dan katalog pada order.
- Pickup atau flat-rate shipping.
- Atomic inventory reservation untuk seluruh line item.
- Manual transfer instructions dan payment-proof upload.
- Guest tracking session dan customer tracking.
- Admin order/payment verification.
- Customer-safe milestone tracking.
- Audit, idempotency, expiry, conflict, dan retry handling.

### Tidak termasuk

- Produk `calculated` atau `quote_required`.
- Custom configuration atau file upload pada checkout Retail.
- Payment gateway online.
- Integrasi courier, live shipping rate, atau tracking resi otomatis.
- B2B quotation, organization approval, atau project workflow.
- Supplier purchase automation.
- Perubahan homepage pattern yang masih deferred.

## 4. Arsitektur

Fitur menggunakan modular monolith. Route hanya memvalidasi request dan mengembalikan response; aturan bisnis berada pada service/domain; akses MongoDB dipusatkan pada repository untuk slice ini.

### Backend modules

- `backend/retail_checkout_routes.py`: endpoint public/customer/guest/admin dan Pydantic payload.
- `backend/retail_checkout_service.py`: preview, checkout transaction, state transition, expiry, payment proof, dan idempotency.
- `backend/retail_checkout_repository.py`: query order, catalog publication, inventory balance, reservation, payment attempt, dan guest session.
- `backend/retail_checkout_domain.py`: fungsi murni untuk validasi cart, snapshot, subtotal, ongkir, total, expiry, serta status projection.
- `backend/retail_checkout_indexes.py`: index order, idempotency, payment, dan guest-session.
- `backend/server.py`: hanya memasang router dan dependency yang sudah ada.

Perubahan tidak merombak modul katalog, material, atau inventory yang sudah merged. Service checkout memanggil kontrak inventory/reservation yang sudah ada.

### Frontend modules

- `frontend/src/pages/retail/RetailCatalog.jsx`: list dan filter produk publik.
- `frontend/src/pages/retail/RetailProduct.jsx`: detail, varian, availability, dan add-to-cart.
- `frontend/src/pages/retail/RetailCart.jsx`: cart localStorage.
- `frontend/src/pages/retail/RetailCheckout.jsx`: kontak, fulfillment, preview, dan submit.
- `frontend/src/pages/retail/RetailTracking.jsx`: tracking customer/guest dan payment proof.
- `frontend/src/lib/retailCart.js`: validasi, normalisasi, add/update/remove, dan migration key cart.
- `frontend/src/lib/retailCheckout.js`: API adapter dan response mapping.

Route public baru tidak mengubah pola homepage atau navigasi brand yang masih deferred.

## 5. Alur Data

```text
Public catalog
  → local cart (variant_id, quantity)
  → checkout preview
  → server revalidation
  → transaction: order + line snapshots + reservations
  → payment instructions + guest magic link
  → payment proof
  → admin verification
  → processing / ready / completed
```

Browser tidak pernah menjadi sumber kebenaran untuk harga, stok, publication revision, total, atau order status.

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
    "shipping_fee": 0
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

Line items are immutable snapshots. Later catalog or price changes do not alter an existing order.

`customer_id` is set for authenticated customers and remains null for guests. Existing legacy orders keep their current shape and are read through a compatibility projection.

### 6.2 `inventory_reservations`

Each line item has one reservation reference:

- `reference_type=retail_order`.
- `reference_id=order.id`.
- `subject_type=product_variant`.
- `subject_id=variant.id`.
- `quantity` as a normalized Decimal string.
- `status`: `active`, `payment_review`, `consumed`, `released`, `expired`, or `cancelled`.
- `expires_at`, `created_at`, `updated_at`, and operation metadata.

Checkout writes all reservations atomically. If any line is insufficient, no order or reservation is committed.

### 6.3 `payment_attempts`

Payment proofs are append-only records:

- `id`, `order_id`, `proof` metadata, `submitted_at`.
- `status`: `pending_review`, `verified`, `rejected`.
- `reviewed_by`, `reviewed_at`, `rejection_reason`.
- Audit reference and notification state.

Existing embedded payment fields remain readable for legacy orders.

### 6.4 `guest_order_access`

Only token hashes are stored:

- `token_hash` unique.
- `order_id`.
- `purpose=order_tracking`.
- `expires_at`, `used_at`, `revoked_at`, `created_at`.

The raw token is sent only in the email link and is exchanged once for a short-lived order-scoped HttpOnly session. The browser is then redirected to a clean tracking URL.

### 6.5 Indexes

- Unique partial `orders.order_number`.
- Unique partial `orders.checkout_idempotency_key`.
- `orders.customer_id + created_at`.
- `orders.status + updated_at`.
- `orders.guest_email + created_at` for internal lookup only.
- Unique `guest_order_access.token_hash` and TTL on `expires_at`.
- `payment_attempts.order_id + created_at`.
- Existing reservation operation and reference indexes.

Indexes are added through the existing startup/migration mechanism and are verified before mutation rollout.

## 7. Order and Reservation Lifecycle

Customer-facing order statuses:

```text
awaiting_payment
→ payment_review
→ paid
→ processing
→ ready_for_pickup | ready_to_ship
→ completed
```

Failure paths:

```text
awaiting_payment → expired | cancelled
payment_review → awaiting_payment when proof is rejected
```

Rules:

1. Checkout creates an order and all reservations inside one MongoDB transaction.
2. Reservation duration is 24 hours.
3. A submitted proof changes reservation status to `payment_review` and removes automatic expiry.
4. Rejected proof returns the order to `awaiting_payment` with a new deadline.
5. Expired or cancelled orders release all reservations exactly once.
6. Verified payment retains reservations until the fulfillment operation consumes them.
7. Duplicate requests with the same idempotency key return the original result.
8. Reusing a key with a different payload returns `409 idempotency_conflict`.

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

`checkout/preview` accepts variant IDs, quantities, and fulfillment method. It returns authoritative current snapshots, item subtotal, shipping fee, tax-included indicator, grand total, and a preview timestamp. It does not reserve stock.

`POST /api/retail/orders` requires `Idempotency-Key`, contact data, line items, fulfillment data, and an optional customer bearer token. It revalidates every value, creates the order/reservations transactionally, and returns the order summary plus payment instructions and a one-time tracking link dispatch status.

### Admin

```text
GET  /api/admin/retail/orders
POST /api/admin/retail/orders/{id}/payment/verify
POST /api/admin/retail/orders/{id}/payment/reject
POST /api/admin/retail/orders/{id}/status
```

Admin transitions require the corresponding permission, validate allowed state transitions, append audit events, and never mutate immutable line/pricing snapshots.

## 9. Security and Privacy

- Pydantic payloads reject unknown fields and validate email, quantity, fulfillment method, and address requirements.
- Only published, active, retail-enabled, fixed-price, ready-stock variants can enter this checkout.
- Exact internal stock, material cost, supplier, margin, planned demand, and internal notes never appear in customer responses.
- Customer APIs enforce `customer_id` ownership; guest APIs enforce order-scoped session ownership.
- Magic links are hashed, short-lived, single-use exchange credentials and are not reused as bearer URLs.
- Guest sessions are HttpOnly, Secure in production, SameSite, order-scoped, and protected against CSRF/origin abuse.
- Payment proof uses the existing validated local storage boundary and controlled download headers.
- Rate limits apply to checkout, magic-link issuance, token exchange, and proof upload.
- Sensitive events include actor, timestamp, target, before/after, and reason in audit logs.

## 10. UX and Admin States

### Customer

- `/shop`: product list, category filter, and public stock status.
- `/shop/:slug`: variant selection, fixed price, availability, and add-to-cart.
- `/cart`: multi-item cart, quantity changes, remove, and stale-data warning.
- `/checkout`: guest contact, pickup/shipping, address, flat fee, tax-inclusive total, and consent.
- `/track`: milestone timeline, payment status, upload proof, ETA, pickup/shipping status.

Every page handles loading, empty, validation, server error, retry, price conflict, stock conflict, reservation expiry, and permission/session expiry.

### Admin

Admin order detail shows line snapshots, reservation state, expiry, payment attempts, status history, and audit events. Finance can verify/reject payment, Warehouse can manage fulfillment, and Order Admin can manage permitted status transitions. UI controls are not the authorization boundary; backend permissions are mandatory.

## 11. Migration and Compatibility

- No destructive migration is allowed.
- Existing legacy orders remain readable and keep their current fields.
- New Retail orders use `schema_version=2` and `order_type=retail_ready_stock`.
- Existing `GET /orders` and admin order views continue to support legacy records.
- New index creation uses the existing preflight and startup index path.
- Rollback disables new Retail routes and retains already-created order/reservation records for reconciliation; it never deletes customer or payment history.

## 12. Testing and Acceptance

### Backend

- Unit tests for cart normalization, price snapshot, flat shipping, tax-inclusive totals, expiry, token hashing, and state transitions.
- Integration tests for successful checkout, stale price, unavailable product, insufficient stock, duplicate idempotency, reservation release, payment rejection, guest session ownership, and customer data projection.
- Concurrency test with two checkout requests competing for the last available unit.
- Migration/index test verifies unique keys and preserves legacy orders.

### Frontend

- Cart add/update/remove and localStorage migration.
- Preview and checkout success/error paths.
- Pickup/shipping address validation.
- Reservation timer and stale-price/stock conflict.
- Guest tracking exchange, payment proof upload, and milestone states.

### Acceptance criteria

- A guest can select multiple fixed-price ready-stock variants, preview a correct total, and create one order.
- Checkout reserves all requested stock atomically or returns a clear conflict without partial data.
- Price and stock are revalidated server-side at order creation.
- Pickup is free and shipping uses the current admin flat fee.
- Existing payment transfer instructions are shown and proof upload creates a reviewable payment attempt.
- Guest tracking never exposes another order and does not retain the raw magic token in the final URL.
- Customer responses never include internal stock, supplier, cost, margin, or audit data.
- Retry does not create duplicate order, reservation, payment attempt, or notification records.
- Existing legacy order tests remain green.

## 13. Operational Constraints and Deferred Decisions

- Checkout/reservation mutation requires MongoDB transaction capability. Standalone MongoDB may serve read-only/public catalog but returns a controlled `503 transaction_unavailable` for checkout mutation.
- Email delivery uses the existing emailer boundary; notification failure is retried and does not roll back core order creation.
- Payment gateway provider, courier provider, shipping zones, and homepage Retail/B2B navigation remain deferred.
- Production local-file storage still requires persistent volume, backup, retention, and recovery policy before go-live.

## 14. Backend Feasibility Risk Gate

The unisolated checkout path has a negative BFRI because it combines inventory data risk, payment state, and concurrency. This design reduces the risk before coding:

- Architectural fit: 5 — dedicated routes, service, domain, and repository boundaries.
- Testability: 5 — pure pricing functions plus route, transaction, and concurrency tests.
- Business complexity: 2 — fixed-price ready-stock only; no custom costing or gateway.
- Data risk: 3 — immutable snapshots, reservations, idempotency, and legacy compatibility.
- Operational risk: 2 — manual transfer only, controlled status transitions, audit, and retryable notifications.

The isolated slice has an expected BFRI of `3` (moderate). Implementation therefore requires focused tests, transaction capability checks, structured audit events, and explicit monitoring before it can be enabled for real checkout traffic.

Order number generation must not use `count_documents()+1`; it uses an atomic sequence/counter or a unique-collision retry so concurrent checkouts cannot receive the same business number.
