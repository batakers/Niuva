# Retail Order & Checkout Foundation — Design Spec

Tanggal: 16 Juli 2026
Status: Technical Design Candidate — not approved for implementation
Scope kandidat: Retail ready-stock, fixed-price, account-required checkout, authoritative server preview, atomic reservation, provider-neutral payment orchestration, dan customer-safe tracking; bukan implementation approval
Approved architecture pointers:

- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
- `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`
- `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`
- `docs/decisions/product/DEC-PAY-02-legacy-manual-transfer-read-only.md`
- `docs/decisions/product/DEC-RT-02-retail-account-required-checkout.md`
- `docs/decisions/product/DEC-OFFER-01-retail-offer-file-and-quote-routing.md`
- `docs/decisions/product/DEC-FUL-01-shipping-and-pickup-policy.md`
- `docs/decisions/product/DEC-ETA-01-retail-eta-and-customer-milestone-policy.md`
- `docs/decisions/product/DECISION_LOG_Platform_Niuva_v2_1.md`

Dokumen ini merevisi candidate spec pada commit `a433141` berdasarkan review stakeholder. BRD/PRS v2.1, PRD v2.1, `PRODUCT.md`, `AGENTS.md`, dan keputusan stakeholder terbaru menjadi sumber kebenaran. Revision pass ini hanya mengubah dokumen desain; tidak ada production code yang diubah.

## 1. Tujuan dan Posisi Produk

Candidate ini mendefinisikan vertical slice commerce Retail yang menghubungkan active catalog publication, fixed-price authoritative snapshots, atomic inventory reservation, account-required checkout, provider-neutral online-payment orchestration, dan customer-safe order tracking.

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
| Offer/file/quote routing | Safe automatic pricing, context-preserving quote handoff, dan Option B Assisted Retail Offer | Product contract resolved by `DEC-OFFER-01`; outside this fixed ready-stock slice and activation remains gated |
| Keranjang | Multi-item; browser hanya menyimpan variant ID dan quantity | Candidate; atomic multi-line reservation contract adalah foundation prerequisite |
| Checkout identity | Authenticated Retail account required by `DEC-RT-02` | Approved product/access decision; implementation remains gated |
| Checkout preview | Server authoritative untuk publication, price, stock, fulfillment input, dan total | Candidate invariant |
| Fulfillment | Rp0 pickup + automatic-rate domestic Indonesia delivery | Resolved by `DEC-FUL-01`; provider/configuration/implementation remain gated |
| ETA dan milestone | Pre-payment date/time range + factual post-payment milestones | Resolved by `DEC-ETA-01`; Operations configuration and technical contract remain gated |
| Pajak | Treatment dan display | Tetap open; memerlukan Finance decision |
| Reservation duration | Fixed 30 minutes from successful order/payment-attempt creation | Resolved by `DEC-INV-01`; implementation remains gated |
| Payment architecture | Provider-neutral online-payment orchestration | Approved architecture direction melalui ADR-003; provider tetap deferred |
| Manual transfer | Legacy records read-only; no new instruction, attempt, proof upload, or proof-driven transition | Resolved by `DEC-PAY-02`; not an open application fallback |
| Cancellation/refund/return | Lifecycle-specific policy resolved by `DEC-AFTER-01` | Approved After-Sales Policy — Activation Gated; provider execution, Finance treatment, legal wording, and exact technical contract remain open |
| Retail notifications | Authenticated-owner and role-scoped dashboard plus allowlisted transactional email; no WhatsApp | Resolved by amended `DEC-DATA-003`; provider/worker/exact mapping/implementation remain gated |
| Protected scope | Implementation permission | Tetap open |

### 2.2 Baseline teknis yang tetap berlaku

- Backend authoritative untuk active catalog publication, product/variant eligibility, price snapshot, availability, total, dan state.
- Line item dan pricing snapshot immutable setelah order dibuat.
- Checkout memakai inventory reservation service; checkout tidak langsung memutasi inventory balance, stock movement, atau reservation collections.
- Foundation reservation lifecycle tetap `active → consumed | released | expired`. Payment review atau cancellation adalah order/payment state, bukan inventory reservation state baru.
- Cross-collection checkout/order/reservation mutation mengikuti `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`, fail closed dengan `503 transaction_unavailable`, dan tidak memiliki silent non-atomic fallback.
- Upload-dependent flows mengikuti `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`; production upload tetap blocked sampai readiness conditions disetujui.
- Payment lifecycle mengikuti `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`: core provider-neutral, adapter terpisah, event/webhook idempotent, serta refund/reconciliation boundary eksplisit.
- Idempotency, conflict handling, audit, legacy compatibility, customer-safe projection, dan concurrency safety tetap invariant.

## 3. Batas Scope

### Termasuk dalam candidate

- Public Retail catalog dan product detail untuk variant pada active publication yang memenuhi fixed-price ready-stock policy.
- Cart lokal multi-item.
- Account-required checkout dan authoritative server checkout preview.
- Immutable product, variant, publication, dan pricing snapshots pada order.
- Atomic reservation untuk seluruh line item melalui inventory reservation service.
- Provider-neutral payment orchestration boundary, idempotent provider-event handling contract, refund/reconciliation boundary, dan customer-safe payment projection.
- Authenticated customer-safe tracking serta permitted fulfillment transition.
- Audit, idempotency, expiry, conflict, retry, dan legacy compatibility.

### Tidak termasuk atau belum enabled

- Produk `calculated`, quote handoff, atau Assisted Retail Offer. Product
  contract-nya governed by `DEC-OFFER-01`, tetapi tidak diimplementasikan oleh
  candidate fixed ready-stock slice ini.
- Custom configuration atau design-file upload pada ready-stock checkout.
- Provider selection atau provider-specific SDK, schema, webhook signature, dan API.
- New manual-transfer adapter, payment-proof upload pada primary production path, atau manual-payment review flow.
- Live logistics-provider integration, tax policy, cancellation/refund/return policy, atau production go-live.
- Supplier purchase automation.
- B2B quotation, organization approval, atau project workflow.
- Pembuatan customer authentication baru.
- Homepage/navigation visual redesign atau perubahan terhadap protected exact v1 navigation.

### Protected-scope approval

Implementasi Retail memerlukan izin eksplisit sebelum menyentuh:

- collection dan projection `orders`;
- inventory reservation serta release/consume operation;
- backend route/service/repository dan API lama;
- authentication, customer access, customer session, dan historical guest compatibility;
- admin order view, payment, reconciliation, dan refund operation;
- dashboard, fulfillment, production, notification, atau operational flow terkait.

Existing 3D-printing orders, auth flow, dashboard, dan API lama harus tetap backward compatible. Tidak ada perubahan pada area protected dalam synchronization pass ini.

## 4. Arsitektur

Fitur menggunakan modular monolith. Route hanya memvalidasi request dan mengembalikan response; aturan bisnis berada pada service/domain; akses MongoDB dipusatkan pada repository untuk slice ini.

### Backend modules

- `backend/retail_checkout_routes.py`: endpoint public/customer/admin dan Pydantic payload.
- `backend/retail_checkout_service.py`: preview, checkout orchestration, order/payment state transition, expiry, reconciliation, dan idempotency.
- `backend/retail_checkout_repository.py`: query ownership-scoped order, active catalog publication, authoritative pricing snapshot, payment attempt, fulfillment config, dan customer session boundary. Inventory mutation tetap melalui foundation reservation service.
- `backend/retail_checkout_domain.py`: fungsi murni untuk validasi cart, snapshot, subtotal, ongkir, total, expiry, exception projection, dan status transition.
- `backend/retail_checkout_indexes.py`: index order, authenticated customer ownership, idempotency, payment, dan reconciliation.
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

Collection lama tetap dipakai. Contoh struktur berikut hanya normatif untuk field dan authoritative snapshots yang sudah disetujui.
Nilai dalam angle brackets adalah illustrative placeholders, bukan approved defaults; fulfillment, ETA/milestone, tax, dan policy-dependent fields yang exact technical contract-nya belum disetujui sengaja dihilangkan.

```json
{
  "schema_version": 2,
  "order_type": "retail_ready_stock",
  "channel": "retail_web",
  "id": "uuid",
  "order_number": "NIV-2607-0001",
  "checkout_idempotency_key": "opaque-key",
  "checkout_request_fingerprint": "canonical-request-fingerprint",
  "customer_id": "authenticated-customer-id",
  "contact_snapshot": {
    "name": "Buyer",
    "email": "buyer@example.com",
    "phone": "..."
  },
  "line_items": [
    {
      "order_line_id": "stable-line-id",
      "product_id": "uuid",
      "variant_id": "uuid",
      "publication_id": "uuid",
      "publication_revision": 3,
      "sku": "MUG-BLK",
      "name": "Mug Black",
      "option_values": {},
      "quantity": 2,
      "unit_price": "<authoritative-unit-price>",
      "subtotal": "<authoritative-line-subtotal>",
      "currency": "<authoritative-pricing-currency>"
    }
  ],
  "reservation_references": [
    {
      "order_line_id": "stable-line-id",
      "reservation_id": "returned-reservation-id"
    }
  ],
  "pricing_snapshot": {
    "items_subtotal": "<authoritative-items-subtotal>",
    "currency": "<authoritative-pricing-currency>"
  },
  "status": "awaiting_payment",
  "reservation_expires_at": "<later-policy-derived-expiry>",
  "milestones": [],
  "status_history": [],
  "created_at": "...",
  "updated_at": "..."
}
```

Line items, publication revision, dan setiap later-approved authoritative commercial atau fulfillment snapshot yang dicatat pada order bersifat immutable. Perubahan katalog, tarif, pajak, atau material tidak mengubah order yang sudah dibuat.

Fulfillment, ETA/milestone, dan tax fields sengaja tidak muncul pada contoh
ringkas karena exact API/schema contract tetap gated. `DEC-FUL-01` governs
pickup/delivery policy, `DEC-ETA-01` governs ETA/milestone policy, dan
`DEC-INV-01` governs versioned 30-minute reservation. Contoh tidak menginvent
actual provider, location, package, duration/calendar/buffer, tax, atau
notification values.

`customer_id` wajib diisi dari authenticated customer identity untuk setiap
Retail Order baru sesuai `DEC-RT-02`. Existing guest-shaped historical orders
keep their stored shape and are read only through an ownership-scoped
compatibility projection; contact equality does not prove ownership.

Checkout idempotency mengikuti contract berikut:

- Setiap `checkout_idempotency_key` terikat pada canonical request fingerprint yang mencakup normalized cart-line identities dan quantities, normalized contact input, serta hanya fulfillment input yang diizinkan oleh policy yang disetujui kemudian.
- Browser-generated price, stock, payment state, atau total tidak masuk sebagai authoritative fingerprint input; backend selalu menghitung ulang nilai authoritative tersebut.
- Key yang sama dengan fingerprint yang sama mengembalikan original customer-safe checkout result. Key yang sama dengan fingerprint berbeda mengembalikan `409 idempotency_conflict` dan tidak menjalankan mutation.
- Persisted key, fingerprint, dan stable original order/result reference di-commit secara atomic bersama order dan seluruh applicable reservation references dalam ADR-001 transaction boundary. Retry tidak boleh membuat order atau reservation tambahan.
- Exact fingerprint encoding, hash algorithm, dan implementation library tetap implementation detail dan tidak dipilih oleh candidate ini.

### 6.2 Foundation reservation contract

Checkout calls the foundation multi-line inventory reservation service and stores stable returned reservation associations on the order boundary.

Cardinality is exactly one association for each inventory-reserved order line. Every association records the stable `order_line_id` and returned `reservation_id`. Consume, release, expiry, reconciliation, tracking, dan permitted admin workflows must use this same association.

Checkout tidak menulis inventory balance, immutable movement, atau reservation collections secara langsung. Foundation reservation service tetap menjadi owner reservation records dan lifecycle; checkout hanya memanggil contract service tersebut dan menyimpan reference yang dikembalikan.

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
- provider-neutral event-claim reference bound to `(adapter_key, provider_event_id)`;
- customer-safe projection, audit reference, and notification state.

Provider credentials, raw payloads, vendor field names, signature details, and provider retry semantics stay inside a separate adapter. Exact provider schema and state-machine detail remain open.
Provider-neutral event claims use an adapter-scoped unique identity `(adapter_key, provider_event_id)`. `adapter_key` adalah internal stable adapter identifier, bukan vendor credential.

Sebelum core effect diterapkan, handler wajib melakukan atomic claim/insert terhadap unique identity tersebut. Event claim dan resulting core transition mengikuti approved transaction/idempotency boundary; application-level read-then-write check tanpa unique atomic claim dilarang.

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

### 6.6 Historical guest compatibility

Candidate ini tidak membuat guest Order, guest magic link, guest-order session,
atau verified-contact tracking credential baru. Existing guest-shaped records,
bila ada, mempertahankan stored shape dan approved ownership-scoped read path.
Automatic account linkage berdasarkan email, phone, atau contact match dilarang.
Claim flow memerlukan decision, verification, audit, dan conflict policy
terpisah.

### 6.7 Shipping configuration

`DEC-FUL-01` governs the fulfillment policy. Configuration is versioned and
must reference approved origin, domestic address schema, pickup locations,
package profiles, service allowlist, policy revision, effective time, actor,
and audit reference.

- Pickup needs no delivery address and has shipping fee Rp0. The customer
  selects a location during checkout and an available collection window only
  after `ready_for_pickup`.
- Delivery is limited to supported domestic Indonesia addresses. International,
  special-packaging, unsupported, oversize, unsafe, invalid, or
  missing-package-profile cases become `quote_required`.
- The server obtains an authoritative automatic rate from normalized
  address/package inputs. It never guesses a fee.
- `rate_expires_at` is provider expiry capped at `quoted_at + 30 minutes`, or
  that 30-minute application expiry when the provider supplies none.
- Expired or changed rate/service/ETA produces `409 shipping_quote_stale`,
  refreshes preview, and requires explicit customer reconfirmation.
- Immediately before order/payment-attempt creation, the server revalidates
  fulfillment inputs. The committed amount is immutable for that active
  payment attempt.
- If delivery is unavailable, the UI may offer pickup but never silently
  changes the customer's method.

Provider, actual origin/location/hours/windows, package profiles, service
allowlist, Finance treatment, operations owner, and activation remain gated.

### 6.8 Indexes

- Unique partial `orders.order_number`.
- Unique partial `orders.checkout_idempotency_key`; persisted idempotency boundary juga menyimpan canonical request fingerprint dan stable original order/result reference.
- `orders.customer_id + created_at`.
- `orders.status + updated_at`.
- `payment_attempts.order_id + created_at`.
- Unique provider-event claim `(adapter_key, provider_event_id)`.
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

- Reservation duration is fixed at 30 minutes by `DEC-INV-01`, beginning only
  after successful order and payment-attempt creation. The checkout must expose
  a countdown and five-minute warning, with no automatic extension.
- Checkout creates the order and all line-item reservations through the foundation multi-line reservation service within the ADR-001 transaction boundary.
- Missing transaction capability returns `503 transaction_unavailable`; no order or partial reservation is treated as successful.
- Silent fallback to non-atomic writes is prohibited.
- Payment success consumes the active reservation through an atomic competing
  transition. The exact downstream inventory and fulfillment transition
  remains governed by the later-approved fulfillment contract.
- Payment review, reconciliation, refund, and cancellation do not create additional inventory reservation states.

The following provider-neutral race matrix is normative. Every winner is selected by conditional state checks inside the same ADR-001 transaction; an application-level ordering assumption is insufficient.

| Competing transitions | Atomic eligibility and winner | Losing request or retry |
|---|---|---|
| Payment success vs reservation expiry | Payment success is eligible only while every required reservation reference is still eligible; expiry is eligible only before payment success has been accepted. Exactly one transaction wins. | Losing expiry is an idempotent no-op; losing or late payment enters reconciliation without marking the order paid. |
| Payment success vs cancellation | Payment success is eligible only before cancellation is accepted; cancellation is eligible only before payment success is accepted and releases through the foundation service. | Loser becomes an idempotent no-op or enters reconciliation as applicable; no second release occurs. |
| Payment success vs explicit release | Payment success is eligible only before release and while every required reservation reference remains eligible; release is eligible only before payment success is accepted. | Loser is a no-op or reconciliation case; released stock is not silently recreated. |
| Repeated expiry or release | The first valid foundation lifecycle transition wins. | Every repeated expiry/release is an idempotent no-op and cannot emit another release effect. |
| Duplicate payment-success event | The unique provider-event claim and accepted core transition may succeed once. | Duplicate events replay the recorded outcome without another payment, order, reservation, or notification effect. |
| Payment after release or expiry | Released or expired reservation references make automatic payment-success transition ineligible. | The event enters provider-neutral reconciliation; it does not mark the order paid, recreate reservation, or imply a refund policy. |

Normative invariants:

- Payment success may succeed only when every required order-line reservation reference is still eligible under the same atomic transaction.
- Expiry, release, atau cancellation may succeed only when the order/payment state has not accepted payment success.
- Exactly one competing transition wins; losing retries are idempotent no-ops or reconciliation cases as stated above.
- Release occurs at most once through the foundation reservation service.
- Late or conflicting payment never recreates reservation and enters provider-neutral reconciliation.
- The system must never produce a paid order backed only by released or expired reservations.
- Reservation duration is resolved by `DEC-INV-01`; post-payment fulfillment
  policy and implementation authorization remain open.

### 7.3 Provider events, refund, and reconciliation

- Provider events/webhooks require adapter-scoped unique identity `(adapter_key, provider_event_id)`; adapter key adalah internal stable identifier dan bukan credential.
- Atomic claim/insert wajib berhasil sebelum payment, order, reservation, refund, reconciliation, notification, atau audit effect diterapkan.
- Duplicate claims menjadi replay-safe no-op atau mengembalikan previously recorded outcome tanpa mengulang effect.
- Application-level read-then-write deduplication tanpa unique atomic claim dilarang.
- Event claim dan resulting core transition memakai approved transaction/idempotency boundary.
- Raw provider payloads, credentials, dan signatures tetap berada di adapter boundary dan tidak masuk core domain.
- Refund is a separate idempotent boundary with permission, actor, time, reason, amount, and result.
- Refund eligibility, amount, fee allocation, customer remedy, and approval
  follow `DEC-AFTER-01`.
- Conflicting or uncertain payment outcomes enter reconciliation without silently changing inventory or customer-visible paid state.
- Notification failure does not roll back an otherwise successful core payment transition.
- Exact payment state machine, event retention, webhook authentication, Finance
  operations, reconciliation SLA, provider refund execution/timing, and
  accounting/tax correction remain open.

### 7.4 Manual-transfer policy

- Manual transfer is not the Retail production baseline.
- Existing legacy manual-transfer records and proof metadata remain readable.
- `DEC-PAY-02` disables new manual-transfer instructions, attempts,
  payment-proof uploads, and proof-driven transitions.
- Payment proof is not part of the primary production path.

### 7.5 Fulfillment and after-sales boundary

`DEC-FUL-01` resolves direct-checkout pickup/delivery direction, rate validity,
and seven-day `pickup_overdue` follow-up. Automatic overdue cancellation,
disposal, storage fee, refund, ownership transfer, or completion is prohibited.
`DEC-AFTER-01` resolves the Retail revision, lifecycle-specific cancellation,
complaint, reprint/replacement, refund, return-shipping allocation, SLA, and
approval-policy direction. Address change after payment, legal/customer terms,
working-day configuration, provider execution/timing, Finance accounting/tax
correction, evidence privacy/retention, abuse/fraud, long-term uncollected
pickup, exact technical contract, implementation, and activation remain gated.
Retail notification recipients/channels follow amended `DEC-DATA-003`;
provider, worker, exact event/source mapping, preference UI, implementation,
and activation remain gated. The candidate retains explicit order/payment
boundaries and auditable customer-safe projections.

## 8. Candidate Core API Boundary

### Public

```text
GET  /api/catalog/products
GET  /api/catalog/products/{slug}
```

### Authenticated Retail customer

```text
POST /api/retail/checkout/preview
POST /api/retail/orders
GET  /api/retail/orders/{order_id}
```

`checkout/preview` requires authenticated customer ownership. It accepts variant
IDs, quantities, and only the fulfillment inputs permitted by the
later-approved policy. The response is authoritative for active publication,
product/variant eligibility, price snapshot, availability, total, conflicts,
and preview time. Preview does not reserve stock.

`POST /api/retail/orders` revalidates every authoritative value and invokes the atomic multi-line reservation service inside the ADR-001 transaction boundary. Setiap request membawa checkout idempotency key. Identical key/fingerprint retries replay the original customer-safe result; reuse dengan fingerprint berbeda mengembalikan `409 idempotency_conflict`; dan retry tidak membuat order atau reservation tambahan. Response mengembalikan customer-safe order dan server-produced provider-neutral payment action/state data.

Order creation and lookup require authenticated `customer_id` ownership.
Historical guest-shaped records remain outside the new-transaction API
contract and use only their separately approved compatibility read path.

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

Admin transitions require least privilege, allowed-state validation, audit, and
immutable commercial snapshots. Refund policy follows `DEC-AFTER-01`; exact
Finance operations, reconciliation SLA, provider execution/timing, and
accounting/tax correction remain open and are not approved by these candidate
routes.

## 9. Customer Authentication dan Security

### Customer authentication scope

- `DEC-RT-02` requires an authenticated Retail account before private upload,
  authoritative checkout, order/payment creation, payment, history, and
  tracking.
- Anonymous visitors may browse, configure non-sensitive options, and retain a
  non-authoritative cart. Login/register handoff carries no price promise,
  reservation, payment state, or private file reference.
- Reuse the approved customer identity, recovery, and session system; do not
  create a Retail-only auth silo.
- Failed registration/login/recovery creates no order, reservation, or payment
  attempt. After authentication, every authoritative value is revalidated.
- Historical guest order claim is excluded until a verification, ownership,
  audit, and conflict policy is approved.
- User tidak boleh melihat order lain hanya karena email yang sama. New-order
  ownership berasal hanya dari authenticated `customer_id`.

### Security/privacy

- Pydantic payloads reject unknown fields and validate email, quantity, permitted fulfillment inputs, serta permitted provider-neutral payment intent/action inputs.
- Customer/browser payloads tidak pernah menerima payment state field; browser tidak dapat submit, override, atau transition payment state.
- Payment state hanya diproduksi oleh trusted server logic atau provider adapter. Backend tetap authoritative untuk payment lifecycle dan customer-safe projection.
- Hanya published, active, retail-enabled, fixed-price, ready-stock variants yang boleh masuk checkout slice.
- Exact internal stock, material cost, supplier, margin, planned demand, profit, dan internal notes tidak pernah muncul pada customer response.
- Customer APIs enforce `customer_id` ownership. Historical compatibility
  access, if present, remains a separate ownership-scoped read boundary and
  cannot create a new transaction.
- Customer session behavior follows `DEC-AUTH-010`; session expiry before order
  creation requires reauthentication and full revalidation.
- Session expiry after order/payment-attempt creation does not change stored
  ownership or provider callback handling and does not extend `DEC-INV-01`.
- ADR-002 applies to design files and every upload-dependent flow. Payment proof remains legacy-readable only; `DEC-PAY-02` disables new proof uploads.
- Rate limits apply to registration/login/recovery, checkout, payment retries,
  and reconciliation-sensitive actions.
- Sensitive events mencatat actor, timestamp, target, before/after, reason, dan correlation/idempotency reference.

## 10. Customer and Admin States

### Customer

- Product discovery shows only active-publication, fixed-price, ready-stock variants eligible for this candidate.
- Cart and checkout handle loading, empty, validation, stale publication/price, stock conflict, retry, and transaction-unavailable states.
- Checkout preview remains server-authoritative.
- Tracking shows factual customer-safe milestone history, current/previous ETA
  ranges, next action, safe exception/reason, provider-neutral payment
  state/action, reconciliation guidance, and fulfillment under `DEC-ETA-01`.
- Payment-proof upload is not part of the primary production experience.

### Admin states

Admin order detail may show immutable line/pricing snapshots, the same order-line reservation associations used by lifecycle workflows, customer-safe payment state, reconciliation cases, refund records, status history, and audit events according to role. UI controls are not an authorization boundary. Exact Finance/payment operations remain open.

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
- Checkout idempotency tests prove same-key/same-fingerprint replay, `409 idempotency_conflict` untuk same-key/different-fingerprint, atomic persistence of the original result, dan tidak ada duplicate order atau reservation pada retry.
- Checkout calls the foundation atomic multi-line reservation contract, persists exactly one stable order-line/reservation association for every reserved line, and never writes inventory collections directly.
- Missing transaction capability returns `503 transaction_unavailable` without partial order/reservation data or fallback.
- Concurrency test for the final available unit allows only one successful reservation.
- Atomic race-matrix tests cover payment success versus expiry, cancellation, and explicit release; repeated expiry/release; duplicate payment-success events; and late payment after release/expiry.
- Provider-event concurrency tests prove only one atomic `(adapter_key, provider_event_id)` claim can apply payment, order, reservation, refund, reconciliation, notification, atau audit effects; duplicate claims are no-ops or replay the recorded outcome.
- Customer projections exclude provider secrets, raw events, internal stock, supplier, cost, margin, profit, and Finance notes.
- Customer payload tests reject payment state and unknown fields while accepting only permitted payment intent/action inputs; trusted server logic or provider adapter remains the sole payment-state producer.
- Legacy manual-transfer orders/proofs remain readable without enabling a new proof flow.
- Upload-dependent tests remain blocked from production assumptions until ADR-002 readiness is approved.
- Existing order/auth/admin compatibility tests remain green.

### Customer experience

- Visitor cart plus authenticated preview, checkout, and tracking handle
  loading, empty, validation, auth handoff, conflict, retry,
  permission/session expiry, and `transaction_unavailable` states.
- Payment UI consumes provider-neutral action/state and does not assume a gateway vendor.
- Tracking shows customer-safe payment, reconciliation, refund, fulfillment, milestone, and next-action states.
- Retail and B2B discovery can be tested without asserting deferred labels, placement, order, or visual treatment.

### Acceptance criteria untuk candidate

- Candidate remains not approved for implementation.
- Anonymous visitors can browse and configure eligible fixed-price ready-stock
  items; authenticated customers receive the authoritative checkout preview
  before order creation.
- Order creation and every line-item reservation succeed atomically or fail without partial writes.
- Active catalog publication and authoritative product/variant pricing snapshots are reused.
- Foundation reservation lifecycle remains `active → consumed | released | expired`.
- Provider-neutral payment lifecycle, adapter separation, idempotent events, refund/reconciliation boundary, and customer-safe projection are preserved.
- No provider-specific SDK, schema, webhook signature, or API is selected.
- No new manual-transfer adapter or payment-proof production path is enabled.
- Retail Order and B2B Quote/Project remain separate aggregates and state machines.
- Except for the fixed duration and invariants resolved by `DEC-INV-01`, all
  listed business, provider, storage, protected-scope, and readiness decisions
  remain open.

## 14. Operational Constraints dan Deferred Decisions

### Transaction gate — `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`

- Checkout/order/reservation cross-collection mutation requires replica-set transaction capability.
- Local mutation development uses a single-node replica set; CI uses an isolated replica set; staging/production require capability before affected mutation flags.
- Standalone MongoDB is limited to read-only or proven-safe single-document atomic operations.
- Missing capability returns `503 transaction_unavailable`; silent non-atomic fallback is prohibited.

### Storage gate — `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`

- ADR-002 applies to design files and every upload-dependent flow.
- Production upload remains blocked by provider, authorization/ownership, validation, malware/quarantine, backup/restore, reconciliation, ownership, and readiness conditions.
- Historical manual-payment proof remains read-only; `DEC-PAY-02` disables new proof uploads regardless of storage readiness.
- Local development storage does not satisfy production persistence.

### Payment gate — `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`

- Online payment remains the Retail production target.
- Provider-neutral core, separate adapters, idempotent events, refund/reconciliation boundaries, and customer-safe projections are required.
- Gateway provider selection is required for provider integration and production go-live, not for this candidate architecture.
- Manual transfer remains disabled as a new path.

The following remain open:

- offer Simple/Detailed fields, file/storage limits, machine/process/build/
  quantity/deadline/risk thresholds, default Assisted Retail Offer expiry,
  exact technical contract, dan separately authorized implementation;
- logistics provider and approved fulfillment configuration/operations;
- ETA duration/calendar/buffer/reason profiles and exact state/API/schema;
- tax treatment;
- after-sales legal/customer terms, working-day configuration, provider
  execution/timing, Finance accounting/tax correction, evidence
  privacy/retention, abuse/fraud, long-term uncollected pickup, and exact
  technical contract;
- notification provider/worker, exact event/source mapping, preference UI,
  implementation, migration, B2B policy, and activation;
- protected-scope implementation permission;
- payment provider;
- production storage provider;
- production readiness and go-live.

Reservation duration is no longer open: `DEC-INV-01` fixes it at 30 minutes.
Payment-method compatibility, expiry execution, late-success reconciliation,
and implementation remain separately gated.

Shipping/pickup policy is no longer open: `DEC-FUL-01` governs Rp0 pickup,
domestic automatic rate, quote validity, snapshots, fallback, and
pickup-overdue behavior. Provider/configuration/activation remain gated.

ETA/milestone policy is no longer open: `DEC-ETA-01` governs pre-payment
ranges, factual milestones, authorized audited updates, and `eta_overdue`.
Operations configuration, exact technical contract, implementation, and
activation remain gated. Retail notification policy follows amended
`DEC-DATA-003`.

Retail revision/after-sales policy is no longer open: `DEC-AFTER-01` governs
the 48-hour file-revision window, lifecycle-specific cancellation/refund,
two-working-day complaint intake, customer remedy, fee allocation, return
shipping, SLA, and manager approval. Its listed legal, provider, Finance,
privacy, technical, implementation, and activation gates remain. Notification
policy follows amended `DEC-DATA-003`.

Retail notification recipient/channel policy is no longer open: amended
`DEC-DATA-003` governs authenticated owner and role-scoped recipients, event
allowlists, dashboard/email behavior, safe payloads and links, at most five
attempts, controlled resend, audit, retention, and no WhatsApp. Provider,
worker, exact event/source mapping, preference UI, schema/source changes,
migration, B2B policy, implementation, readiness, and go-live remain gated.

Offer/file/quote-routing policy is no longer open: `DEC-OFFER-01` governs
independent offer/pricing/fulfillment semantics, allowed-input behavior,
automatic-pricing confirmation, mixed-cart/context handoff, Retail/B2B routing,
and the Assisted Retail Offer. This candidate still excludes those flows;
calibration, technical contract, storage readiness, implementation, migration,
readiness, and go-live remain gated.

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
| Phase 5 | Authenticated customer access, session recovery, and tracking |
| Phase 6 | Provider-neutral payment orchestration boundary; provider integration remains gated |
| Phase 7 | Fulfillment and admin operations |
| Phase 8 | Retail/B2B public website integration |
| Phase 9 | Production hardening and operational readiness |

Setiap fase di implementation plan wajib memiliki exact file scope, dependency, acceptance criteria, test commands, migration boundary, rollback procedure, feature flag, commit boundary, dan regression checks. Plan belum dibuat dalam revision pass ini.

## 16. Risk Register

Tabel berikut mencatat risiko candidate, dampak, mitigation gate, serta owner atau approval boundary yang masih diperlukan:

| Risiko | Dampak | Mitigasi/gate | Owner/approval |
|---|---|---|---|
| Keputusan bisnis belum dikonfirmasi | Implementasi salah arah atau rework | Phase 0 decision log; jangan enable mutation flags | Stakeholder/Product |
| MongoDB transaction capability tidak tersedia | Partial order/reservation atau overselling | Capability preflight; controlled `503 transaction_unavailable`; no non-atomic fallback | Backend/Platform |
| Payment/reservation implementation belum diverifikasi | Stok dapat tertahan atau dilepas tidak konsisten | Implement and verify `DEC-INV-01` atomically; do not enable mutation without provider compatibility and race evidence | Finance/Operations |
| Payment exception tidak ter-reconcile | Salah status, refund, atau laporan keuangan | Reconciliation queue, idempotent case, SLA/age monitoring | Finance |
| Legacy order/auth/API regression | Operasi lama terhenti | Compatibility projection dan regression suite | Backend/Order Admin |
| Customer data leakage | Pelanggaran privasi | Authenticated ownership query, historical compatibility isolation, safe projection, forbidden-field tests | Security/Backend |
| Provider/config fulfillment belum siap | Total dan eligibility tidak dapat diaktifkan dengan aman | Enforce `DEC-FUL-01`; versioned origin/location/package/service config; stale-preview conflict; no guessed rate | Operations/Finance |
| Feature flag rollback tidak aman | Order aktif kehilangan akses | Disable mutation only; retain tracking/admin reconciliation | Release owner |
| Retail mengaburkan B2B | Positioning dan conversion B2B turun | Preserve discoverability without locking deferred IA labels or visual treatment | Product/Brand |
| Production storage belum siap | Design/upload data dapat hilang atau tidak aman | Block production upload until ADR-002 provider and readiness gates are approved | Operations |

## 17. Unresolved Risks dan Approval Checklist

Before Retail checkout implementation or related production enablement, the
following approvals/configurations are still required:

- logistics provider; approved origin, pickup location/hours/windows, package
  profiles, domestic address validation, service allowlist, Finance treatment,
  operations owner, and recovery procedure;
- approved ETA duration/calendar/buffer/reason profiles and exact Retail
  state/API/schema contract;
- approved offer/configuration/file profiles and thresholds, default Assisted
  Retail Offer expiry, and exact offer/quote technical contract;
- tax treatment;
- after-sales legal/customer terms, working-day configuration, provider
  execution/timing, Finance accounting/tax correction, evidence
  privacy/retention, abuse/fraud, long-term uncollected pickup, and exact
  technical contract;
- notification provider/worker, exact event/source mapping, preference UI,
  schema/source implementation, migration, B2B policy, and activation;
- protected-scope implementation permission;
- payment gateway provider and provider activation;
- production storage provider and ADR-002 readiness;
- production readiness and go-live.

`DEC-INV-01` already supplies the 30-minute reservation decision. A later
implementation plan must reference it and retain its atomic expiry, retry,
versioned-snapshot, and reconciliation requirements.

`DEC-FUL-01` already supplies the pickup/delivery policy. A later implementation
plan must retain provider-neutral automatic rates, the 30-minute application
cap, explicit refresh/reconfirmation, immutable snapshots, quote fallback, and
seven-day pickup-overdue behavior.

`DEC-ETA-01` already supplies the Retail ETA/milestone policy. A later
implementation plan must retain separate ready/arrival ranges, factual
milestones, authorized audited updates, append-only history, customer-safe
reasons, and `eta_overdue` without automatic after-sales action.

`DEC-AFTER-01` already supplies the Retail revision/after-sales policy. A later
implementation plan must retain its lifecycle boundaries, exact deadlines and
SLA, customer-choice remedy, fee/return-shipping allocation, immutable
snapshots, idempotent refund, scoped evidence, manager approval, and B2B
separation without treating policy approval as activation.

`DEC-RT-02` already supplies the account-required identity decision. A later
implementation plan must retain authenticated `customer_id` ownership,
non-authoritative cart handoff, full post-login revalidation, session-expiry
behavior, and historical guest isolation.

`DEC-OFFER-01` already supplies the offer/file/quote-routing product contract.
A later separately authorized plan for calculated/quote flows must retain
Niuva-authoritative profiles, customer confirmation and server revalidation,
mixed-cart separation, context preservation, immutable offer versions,
manager approval, expiry checks, normal Retail checkout entry, and strict
Retail/B2B lifecycle separation.

This gate does not block separate Foundation implementation planning and coding for approved transaction capability, catalog publication, inventory movement/balance/reservation contracts, or development/demo storage work, provided the work remains within approved scope and does not modify protected areas without permission.

The atomic multi-line inventory reservation service contract is a foundation prerequisite. If it is unavailable, checkout must not redefine inventory collections or proceed with a non-atomic fallback.

Status remains **Technical Design Candidate — not approved for implementation**. This synchronization records approved architecture constraints but does not approve coding, migrations, infrastructure, payment activation, uploads, or production release.
