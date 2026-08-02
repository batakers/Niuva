# Desain Satu Platform Niuva dengan Journey Retail dan B2B

Tanggal: 14 Juli 2026
Status: Approved Baseline
Approval record: `docs/decisions/evidence/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md`
Supersedes: `2026-07-14-integrated-operations-marketplace-design.md`
Stack saat ini: React, FastAPI, MongoDB; mutation environments require the replica-set capability defined by ADR-001, while standalone is limited to read-only or proven-safe single-document atomic writes.
Approved architecture pointers:

- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
- `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`
- `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`
- `docs/decisions/product/DECISION_LOG_Platform_Niuva_v2_1.md`

## 1. Ringkasan

Niuva akan memiliki satu website, satu identitas, satu platform, dan dua journey pelanggan:

1. **Retail** untuk individu dan UMKM yang membeli ready-stock atau custom standar.
2. **Business/B2B** untuk perusahaan dan instansi yang membutuhkan RFQ, bulk order, R&D, engineering, prototyping, workshop korporat, atau project kompleks.

Kedua journey berbagi CMS, katalog, customer data, inventory, produksi, pembayaran, shipment, notifikasi, audit, dan Admin Studio. Back-office bukan arah ketiga bagi pengunjung; ia adalah fondasi operasional bersama.

```text
Website Niuva
├── Retail Journey
├── Business/B2B Journey
└── Shared Platform
    ├── CMS
    ├── Customer & Organization
    ├── Product & Pricing
    ├── Material & Inventory
    ├── Order & Project
    ├── Production & QC
    ├── Payment & Shipment
    └── Notification & Audit
```

## 2. Keputusan yang Dikunci

- Dua journey berjalan dalam satu platform, bukan dua subwebsite terpisah.
- Retail mencakup 3D printing, ready-stock, apparel, dan merchandise custom sederhana.
- B2B mencakup project kompleks, bulk/repeat order, procurement, R&D, engineering, prototyping, dan workshop korporat.
- Produk Retail dapat memiliki aksi `Beli Sekarang` dan `Minta Penawaran Bulk`.
- Mode harga: fixed, calculated, dan quote_required.
- Retail memakai online payment; B2B memakai quotation/invoice, transfer, DP, serta termin.
- Setiap transaksi Retail baru membutuhkan authenticated account sesuai
  `DEC-RT-02`; anonymous visitor tetap dapat browse dan configure non-sensitive
  options.
- Eligible direct-checkout Retail menawarkan Rp0 pickup dan automatic-rate
  domestic Indonesia delivery sesuai `DEC-FUL-01`; provider serta operational
  configuration tetap activation-gated.
- Portal B2B membutuhkan akun organisasi.
- Retail dan B2B menampilkan milestone serta ETA, bukan persentase progress buatan.
- Direct-checkout Retail memakai revision dan after-sales policy
  `DEC-AFTER-01`; B2B Quote/Project tetap memakai accepted
  quotation/SOW/contract.
- CMS dibuat sebagai modul internal terstruktur di aplikasi Niuva, bukan aplikasi CMS eksternal.
- Admin Studio mencakup CMS dan Operations Back-office.
- Staf berwenang dapat mengelola material, harga bahan, stok, order, project, produksi, pembayaran, dan shipment.
- Harga material, quotation, desain, serta transaksi memakai versioning/snapshot.
- Homepage entry pattern masih deferred dan tidak termasuk keputusan desain ini.

## 3. Referensi Flow Retail

Banteng Print digunakan sebagai referensi pola alur, bukan referensi visual:

```text
Katalog → konfigurasi produk → upload desain
→ checkout → pembayaran → status produksi
```

Pola yang diadopsi:

- Katalog berbasis kategori.
- Konfigurasi material, ukuran, finishing, dan quantity.
- Upload desain sebelum order.
- Harga dan total sebelum pembayaran.
- Tracking setelah transaksi.

Pola yang diperbaiki untuk Niuva:

- Batas eksplisit antara Retail dan B2B.
- Pricing mode yang aman untuk kebutuhan kompleks.
- ETA berbasis material, queue, routing, QC, dan buffer.
- Structured CMS dan back-office.
- Role, versioning, audit, serta privacy boundary.

Referensi: `https://www.bantengprint.com/`

## 4. Arsitektur Produk

### 4.1 Retail Journey

```text
Katalog
→ Pilih produk
→ Atur spesifikasi
→ Daftar/Login
→ Upload desain
→ Lihat harga dan ETA
→ Checkout
→ Pembayaran online
→ Pemeriksaan file
→ Produksi dan QC
→ Tracking
→ Pengiriman/pengambilan
```

Retail ditujukan bagi kebutuhan yang cukup standar untuk diproses melalui aturan produk dan produksi yang sudah dikonfigurasi.

### 4.2 Business/B2B Journey

```text
Capabilities/Portfolio/Product Bulk
→ Inquiry atau RFQ
→ Review internal
→ Quotation
→ Approval
→ Desain/Engineering
→ Approval desain
→ DP/Termin
→ Produksi dan QC
→ Milestone tracking
→ Pengiriman
```

Inquiry awal dapat dikirim tanpa login. Akun organisasi diwajibkan ketika inquiry memasuki quotation dan portal project.

### 4.3 Perpindahan Journey

- Produk Retail dapat diminta dalam jumlah besar melalui RFQ.
- Konfigurasi Retail yang tidak aman dihitung otomatis berubah menjadi quote request.
- Quote item dipisahkan dari mixed cart tanpa membuat Order, reservation,
  payment attempt, atau checkout total; eligible direct items tetap di cart.
- Account, product/configuration, file version, safe analysis, quantity,
  fulfillment, reason, dan kontak diteruskan tanpa input ulang.
- Jenis transaksi dan jenis pelanggan tetap berbeda: quote_required tidak otomatis menjadikan individu sebagai perusahaan.
- Bulk/borongan/partnership/recurring/organizational work mengikuti B2B.
  Eligible individual/UMKM dapat menerima private versioned Assisted Retail
  Offer sesuai `DEC-OFFER-01`, lalu masuk normal Retail checkout setelah
  acceptance dan revalidation.

## 5. Retail Catalog dan Configurator

Setiap produk dapat memiliki:

- Kategori.
- Nama, deskripsi, foto, dan SEO.
- Variant/SKU.
- Material, ukuran, warna, dan finishing.
- Minimum dan maksimum quantity.
- Persyaratan file.
- Production rule.
- Harga mulai.
- Estimasi produksi dasar.
- Stock visibility.
- Publish status.
- Retail CTA dan B2B bulk CTA.

`DEC-OFFER-01` menjaga `offer_type`, `pricing_mode`, dan `fulfillment_mode`
sebagai atribut independen. Ready Product dapat fixed plus ready-stock atau
made-to-order; Custom 3D Print hanya calculated ketika seluruh eligibility
check berhasil.

### 5.1 Pricing Mode

```text
fixed
calculated
quote_required
```

**Fixed** digunakan untuk ready-stock atau produk dengan harga varian tetap.

**Calculated** digunakan untuk custom standar:

```text
price = material
      + machine
      + labor
      + finishing
      + overhead
      + retail margin
      + tax/shipping
```

Untuk Custom 3D Print FDM dengan filament Niuva, formula generik di atas
dispesifikkan oleh `DEC-PRICE-001` sebagai policy `NIUVA-CP-FDM-001`:

```text
PLA = min(g, 200) * 1000
    + min(max(g - 200, 0), 300) * 900
    + max(g - 500, 0) * 800

ABS = min(g, 200) * 1200
    + min(max(g - 200, 0), 300) * 1100
    + max(g - 500, 0) * 1000

machine = exact_print_seconds / 3600 * 5000
custom_print_price =
  ROUND_HALF_UP(progressive_material_price + machine, 0)
```

Tidak ada minimum 50 gram atau intermediate rounding. Weight mencakup output
slicer untuk model, support, brim/raft, dan purge/waste. Shipping/pickup berada
di luar formula. Policy baru efektif pada separately authorized checkout MVP
activation setelah Finance tax profile `DEC-TAX-01` dikonfirmasi.

**Quote required** digunakan jika validation/slicing gagal, profile/build/
material/color/nozzle/process tidak didukung, CAD repair atau nonstandard
finishing/assembly/post-processing diperlukan, file kompleks, quantity/
deadline/capacity tidak aman, konteks bulk/bundle/borongan/partnership/
recurring/customer filament, fulfillment tidak aman, atau operator risk
rejection tercatat.

Custom 3D Print menyediakan Simple mode sebagai default dan optional
Detailed/advanced mode yang hanya mengekspos calibrated Niuva values. Sebelum
calculated work masuk checkout, customer mengonfirmasi exact file version,
dimensions/scale, material/color/quantity/configuration, billable grams, print
duration, customer-safe breakdown, total, ETA, dan fulfillment. Server
merevalidasi semuanya sebelum commitment.

### 5.2 Upload File

Pelanggan dapat:

- Mengunggah file siap produksi.
- Memilih membutuhkan bantuan desain.
- Membaca format, ukuran, dan batas file.
- Mengganti file sebelum pembayaran.

`.stl` dan supported single-model/plate `.3mf` dapat masuk automatic
validation/slicing; customer-embedded profiles diabaikan dan Niuva profiles
diterapkan. `.obj`, `.step`, `.stp`, ZIP, multiple models/parts/plates, dan
complex projects masuk manual review. PDF/JPG/JPEG/PNG hanya reference
attachment; customer `.gcode` ditolak.

File divalidasi berdasarkan tipe, ukuran, ownership, dan keamanan. Produksi tidak dimulai sebelum file dinyatakan siap.

Assisted Retail Offer mengikuti
`draft → awaiting_approval → offered → accepted | declined | expired |
superseded`, private dan immutable per version. Manual price commitment
memerlukan `manager_approver`. Acceptance tidak langsung membuat transaksi;
normal Retail checkout merevalidasi ownership, active version, `expires_at`,
tax, capacity, ETA, dan fulfillment. Offer tidak mengubah catalog price atau
menyatukan Retail/B2B.

Approved storage direction (`docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`): application memakai stable provider-neutral storage port dengan private persistent object storage sebagai production adapter class. Local filesystem hanya development/demo; production objects private by default; backend authorization adalah default; signed access harus short-lived, telah diotorisasi backend, dan scoped ke satu object/action. Database-backed ownership menggantikan path-substring authorization; public bucket/static directory dilarang.

Boundary ini mencakup seluruh persistent Retail, B2B, design, operational, QC, fulfillment, dan historical payment-proof objects yang dipertahankan berdasarkan `DEC-PAY-02`; tidak ada payment-proof upload baru. Provider, RPO/RTO, retention, quota, owners, backup/restore, malware/quarantine, Emergent migration/decommission, dan production readiness tetap open. Query-string access tokens, ownership, MIME/signature validation, malware quarantine, backup/restore, dan metadata/object reconciliation adalah prerequisite; production upload tetap disabled sampai operational readiness disetujui.

## 6. Retail Checkout, Payment, dan Tracking

### 6.1 Checkout

- Authenticated Retail account wajib sebelum private upload, authoritative
  checkout, order/payment creation, payment, dan tracking sesuai `DEC-RT-02`.
- Kontak serta alamat.
- Pengiriman atau pickup.
- Ringkasan produk dan konfigurasi.
- Harga final dan ETA.
- Online payment seperti VA, QRIS, atau e-wallet melalui provider yang dipilih kemudian.
- Provider-neutral payment orchestration adalah Retail production architecture; provider adapters berada di luar core order/payment domain.
- Provider events dan webhooks harus idempotent, refund/reconciliation memiliki boundary eksplisit, dan customer responses memakai customer-safe payment projections.
- Gateway provider tetap deferred. Manual transfer bukan Retail production baseline; `DEC-PAY-02` menetapkan legacy records sebagai read-only dan menonaktifkan instruksi transfer, attempt, payment-proof upload, serta proof-driven transition baru.

Ready-stock direservasi saat checkout. Reservasi dilepas jika pembayaran kedaluwarsa.

Fulfillment mengikuti `DEC-FUL-01`. Eligible direct checkout menawarkan Rp0
pickup dan automatic-rate domestic Indonesia delivery. Basic packaging
termasuk harga standar; special packaging, international, unsupported,
oversize, unsafe, atau uncertain fulfillment menjadi `quote_required`.

Pickup location dipilih saat checkout dan collection window hanya setelah
`ready_for_pickup`. Tujuh hari tanpa recorded handover membuat internal
`pickup_overdue` plus dashboard/email follow-up, tanpa automatic cancellation,
disposal, storage fee, refund, atau completion.

Delivery quote memakai authoritative normalized address serta versioned package
inputs. Validity adalah provider expiry yang dibatasi maksimum 30 menit, atau
30 menit bila expiry tidak diberikan. Expired atau changed rate/service/ETA
direfresh dan dikonfirmasi ulang sebelum order/payment-attempt creation. Order
menyimpan immutable fulfillment snapshot dan later customer-safe tracking.
Provider serta operational configuration tetap activation-gated.

### 6.2 Tracking Retail

```text
Pesanan dibuat
→ Pembayaran terverifikasi
→ Pemeriksaan file
→ Antrean produksi
→ Produksi
→ Quality control
→ Siap diambil/dikirim
→ Selesai
```

Tracking untuk order baru membutuhkan authenticated ownership. Historical
guest-shaped records, bila ada, mempertahankan compatibility read path tanpa
automatic account claim. Akun Retail melihat riwayat, repeat order, alamat,
serta file yang diizinkan.

## 7. Business/B2B

### 7.1 Entry Point

- Capabilities.
- Portfolio/case study.
- Diskusikan Project.
- Minta Penawaran Bulk.
- Repeat order dari portal organisasi.

### 7.2 Brief/RFQ

- Perusahaan dan PIC.
- Jenis kebutuhan serta target output.
- Scope dan spesifikasi teknis.
- Quantity.
- Material/finishing jika diketahui.
- Target timeline.
- Budget range opsional.
- File pendukung.
- Kebutuhan legal/procurement.

### 7.3 Quotation

Quotation memiliki:

- Version number.
- Customer-facing breakdown.
- Total.
- ETA dan milestone.
- Termin/DP.
- Masa berlaku.
- Syarat dan catatan.
- Accepted atau revision_requested state.

Cost, supplier, overhead, margin, laba, dan catatan internal tidak tampil kepada pelanggan.

### 7.4 Design Approval

```text
Design/Engineering
→ Internal Review
→ Customer Review
→ Approved atau Revision Requested
→ Final Version Locked
```

Perubahan setelah approval menjadi change request yang dapat menghasilkan quote dan ETA versi baru.

### 7.5 Organization Roles

- Owner mengelola anggota.
- Project PIC mengelola brief, file, komunikasi, dan progress.
- Approver menyetujui quotation/desain.
- Finance menangani invoice dan pembayaran.
- Viewer hanya membaca project yang diberikan.

## 8. Estimasi Waktu dan Progress

### 8.1 ETA Retail

```text
ready_product_ready_range =
  handling_or_packing
  + operational_buffer

custom_print_ready_range =
  applicable_file_review
  + applicable_material_readiness
  + production_queue_range
  + exact_accepted_slicer_print_time
  + applicable_post_processing
  + quality_control
  + operational_buffer

delivery_arrival_range =
  ready_to_ship_range
  + selected_fulfillment_estimate
```

`DEC-ETA-01` requires versioned `eta_earliest_at` and `eta_latest_at` in
`Asia/Jakarta`. Pickup shows the ready range; delivery separately shows
ready-to-ship and arrival ranges. A changed range before order/payment-attempt
creation requires customer reconfirmation.

### 8.2 ETA B2B

ETA juga mempertimbangkan:

- Design/revision cycle.
- Customer approval.
- Procurement lead time.
- Milestone dependencies.
- Payment gates.

### 8.3 Progress

Progress menggunakan milestone nyata:

```text
✓ Pembayaran
✓ Pemeriksaan File
● Produksi
○ Quality Control
○ Pengiriman
```

Perubahan ETA menampilkan range lama/baru, target, waktu, actor, reason, dan
customer-safe explanation. Authorized domain operators may publish routine
updates directly with append-only history. Passing `eta_latest_at` before the
target milestone creates internal `eta_overdue` and requires a new range/reason,
not automatic cancellation/refund. Detail kendala internal tetap tersembunyi.
Exact duration/calendar/buffer profiles, aggregate state machine/API/schema,
and notification implementation remain gated; Retail recipients/channels follow
amended `DEC-DATA-003`. Live printer telemetry is not an MVP dependency.

### 8.4 Revision dan After-Sales Retail

`DEC-AFTER-01` menetapkan 48-hour `file_revision_required`, lifecycle-specific
cancellation/refund, complaint intake sekurang-kurangnya dua hari kerja sejak
authoritative receipt, customer-choice affected-scope reprint/replacement atau
refund untuk confirmed Niuva/carrier fault, serta Niuva-funded required
return/replacement shipping.

Approved paid cancellation sebelum actual printing/customization atau
Ready-Product handoff mengembalikan full eligible paid amount termasuk unused
fulfillment tanpa provider/admin-fee deduction. Setelah irreversible work,
cancellation bersifat manual dan partial refund membutuhkan exact agreed
amount. Complaint acknowledgement bersifat immediate, first human response
target satu hari kerja, dan resolution decision target lima hari kerja setelah
sufficient evidence.

`order_admin` melakukan triage, production/QC memberikan scoped evidence,
`finance` menyiapkan refund, dan setiap refund/free reprint membutuhkan
`manager_approver`. Legal/customer wording, working-day calendar,
provider/Finance execution, evidence privacy, exact technical contract,
implementation, dan activation tetap gated. Retail notification policy
mengikuti amended `DEC-DATA-003`.

### 8.5 Notification Retail

Amended `DEC-DATA-003` menetapkan authenticated Retail Order owner sebagai
customer recipient dan internal recipient berdasarkan role, permission, serta
domain scope. Customer/operator event allowlist berfokus pada material atau
actionable payment, file, production/ETA, fulfillment, after-sales, stock,
reconciliation, approval, refund-failure, dan delivery-exhaustion conditions.
Full milestone tracking tetap berada pada order detail.

In-app allowlisted records mandatory. Transactional/action-required email wajib
dienqueue melalui provider-neutral outbox, sedangkan routine
production-progress email memakai satu default-on customer preference. Payload
minimal dan versioned; customer/operator link memakai audience-aware
same-origin allowlist serta authentication dan ownership/permission check.

Delivery menggunakan source-event idempotency, maksimal lima attempt,
`exhausted` plus role-scoped in-app alert, dan controlled audited
`order_admin` resend. Notification failure tidak membatalkan committed core
transaction. WhatsApp, campaign/broadcast, arbitrary recipient, direct email
action, dan B2B notification-policy inference dilarang. Provider/worker, exact
event/source mapping, preference UI, schema/source implementation, migration,
activation, readiness, dan go-live tetap gated.

## 9. CMS Internal

CMS adalah bagian dari Admin Studio dan memakai stack serta database yang sama. CMS bukan aplikasi eksternal dan bukan page builder bebas.

### 9.1 Content Modules

- Homepage content.
- About dan Capabilities.
- FAQ, CTA, contact, dan SEO.
- Portfolio/case study.
- B2B industry dan project type.
- Retail category, product, variant, option, price, promo, serta lead time.
- Media library dan alt text.

### 9.2 Publishing Workflow

```text
Draft → Review → Published/Scheduled → Archived
```

CMS mendukung:

- Preview.
- Version history.
- Rollback.
- Audit actor/time/reason.
- Soft delete.
- Validation sebelum publish.

Publish diblokir jika field wajib, SKU, gambar, price/rate, CTA, atau configuration rule tidak valid.

## 10. Operations Back-office

Admin Studio juga mencakup:

- Dashboard order Retail/B2B.
- Order detail.
- Customer dan organization.
- Material dan supplier.
- Inventory dan stock movement.
- Costing dan quotation.
- Project, design, dan approval.
- Work order, production board, QC, dan rework.
- Payment, invoice, refund, dan shipment.
- Notification dan audit.

### 10.1 Material Management

Staf berwenang dapat:

- Menambahkan material.
- Mengubah data dan harga bahan.
- Mengelola supplier, unit, waste, reorder point, dan lead time.
- Mencatat receive, reserve, release, consume, damage, serta adjustment.
- Menonaktifkan atau mengarsipkan material.

Harga material memakai version history dan effective date. Harga baru hanya memengaruhi perhitungan baru. Paid order dan accepted quote menyimpan snapshot lama.

Material yang sudah direferensikan transaksi tidak dapat dihapus permanen; hanya dapat diarsipkan.

### 10.2 Order Detail

- Order number dan jenis journey.
- Customer/organization.
- Product configuration atau project scope.
- Design file/version.
- Price snapshot atau quote version.
- Payment.
- ETA dan progress.
- Work order dan QC.
- Internal notes.
- Shipment.
- Audit history.

## 11. Role dan Permission Internal

| Role | Kewenangan utama |
|---|---|
| Content Editor | Konten dan portfolio |
| Catalog Manager | Produk, variant, configuration, harga jual, promo |
| Warehouse | Material, inventory, movement, restock |
| Order Admin | Order dan komunikasi pelanggan |
| Sales/Estimator | Costing, quotation, dan ETA |
| Designer/Engineer | Design version dan technical review |
| Production | Work order, progress, kendala, dan output |
| Quality Control | QC result dan rework |
| Finance | Invoice, payment, refund |
| Manager/Approver | Price override, adjustment, dan tindakan sensitif |
| Super Admin | User, role, configuration, dan seluruh modul |

## 12. Model Data Utama

| Area | Entitas |
|---|---|
| Identity | User, RetailProfile, Organization, OrganizationMember |
| CMS | ContentPage, ContentVersion, MediaAsset, PublishEvent |
| Catalog | Category, Product, Variant, ConfigurationOption, PricingRule |
| Material | Material, MaterialPriceVersion, Supplier |
| Inventory | InventoryBalance, StockMovement, StockReservation |
| Retail | Cart, Order, OrderItemSnapshot, Payment |
| B2B | Inquiry, QuoteVersion, Project, Milestone, DesignVersion, Approval |
| Production | WorkOrder, WorkStep, QCRecord, ReworkRecord |
| Fulfillment | Shipment, Pickup |
| Platform | Notification, AuditEvent, WorkflowJob |

Order menyimpan transaksi komersial. Project menyimpan eksekusi custom/B2B. Ready-stock tidak memerlukan Project.

Shared foundations do not imply the same Retail Order and B2B Quote/Project aggregate or state machine. Identity, organization, catalog, inventory, payment infrastructure, audit, CMS, and operational foundations may be shared, while Retail and B2B customer lifecycles and projections remain separate.

## 13. Inventory Rules

```text
available = on_hand - reserved
projected = available + incoming - planned_demand
```

Movement types:

- Receive.
- Reserve.
- Release.
- Consume.
- Produce.
- Ship.
- Damage.
- Adjustment.

Stock operation memakai operation ID unik dan update atomik. Sistem menolak hasil balance negatif.

Internal restock alert dipicu oleh reorder point atau projected shortage. Customer back-in-stock notification dipicu ketika produk finished good kembali tersedia.

## 14. Keamanan dan Privacy Boundary

- Authorization diperiksa backend.
- API pelanggan memakai response schema yang mengecualikan data internal.
- File memakai ownership check dan link terbatas waktu.
- Role organisasi membatasi data per project.
- Aksi sensitif masuk audit.
- Setiap refund/free reprint membutuhkan `manager_approver` sesuai
  `DEC-AFTER-01`; sensitive override/adjustment lain mengikuti approved
  decision boundary.

## 15. Penanganan Kegagalan

- Dua checkout pada stok terakhir: hanya satu reservasi atomik berhasil.
- Payment webhook duplikat: idempotency mencegah pembayaran/order diproses dua kali.
- Harga berubah sebelum pembayaran: customer menyetujui total baru.
- Paid order/accepted quote: snapshot tidak berubah.
- Upload gagal: dapat diulang tanpa membuat versi ganda.
- File invalid: produksi diblokir.
- Notification gagal: masuk retry tanpa membatalkan transaksi utama.
- Approval ganda atau stale version: request ditolak sebagai conflict.

MongoDB replica-set multi-document transaction adalah baseline yang disetujui untuk cross-collection mutation yang membutuhkan atomicity. Local mutation development memakai single-node replica set; CI memakai isolated replica set; staging dan production memerlukan transaction capability sebelum affected mutation flags diaktifkan. Standalone MongoDB terbatas pada read-only atau operasi yang terbukti aman sebagai single-document atomic write. Transaction-required operations fail closed dengan `503 transaction_unavailable`; silent fallback ke non-atomic writes dilarang. See `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`.

## 16. Pengujian

### Unit

- Pricing rules.
- Decimal rounding.
- ETA.
- Material price version.
- Available/projected inventory.
- Restock alert.
- Production gates.

### API/Integration

- Retail visitor, authenticated Retail customer, organization, dan internal
  roles.
- Customer response tidak mengandung internal cost/margin/supplier.
- Quote/design/content versioning.
- CMS publish/rollback.
- Stock/order/payment transitions.
- Idempotency dan notification retry.

### Concurrency

- Stok terakhir diperebutkan checkout.
- Duplicate payment webhook.
- Double approval.
- Retried stock movement.

### End-to-End

```text
Retail:
Catalog → configure → upload → price/ETA → payment
→ file review → production → QC → shipment

B2B:
Inquiry → quote → approval → design → payment term
→ production → milestone → QC → shipment

CMS:
Draft → preview → review → publish → rollback
```

Backup harus diuji melalui restore exercise.

## 17. Strategi Rilis

1. **Foundation:** role, CMS, catalog, material, inventory, order, audit.
2. **Retail MVP:** configurator, price/ETA, online payment, tracking.
3. **B2B MVP:** inquiry, RFQ, quotation, organization, approval, milestone.
4. **Operational maturity:** production board, QC, analytics, advanced notification.
5. **Handover:** documentation, training, backup/recovery, ownership.

Kedua journey dapat terlihat pada website, tetapi kapabilitas transaksinya diaktifkan bertahap.

## 18. Handover dan Operasional Setelah Magang

- Admin manual.
- Short training videos.
- Role/account ownership matrix.
- SOP publish dan rollback.
- SOP backup dan restore.
- Product/pricing data dictionary.
- Product creation checklist.
- Deployment dan recovery guide.
- Automated regression suite.
- Training minimal dua staf.
- Technical contact dan support boundary.

## 19. Deferred dan Out of Scope

### Deferred

- Bentuk homepage: split gateway, unified homepage, atau retail-first.
- Payment gateway provider.
- Detail visual UI untuk Retail/B2B switch.
- Production storage provider.
- Offer/file/quote-routing direction is resolved by `DEC-OFFER-01`; preset/
  advanced fields, file/storage limits, machine/process/build/quantity/
  deadline/risk thresholds, default offer expiry, exact technical contract,
  implementation, migration, readiness, and go-live remain gated.
- Shipping/pickup direction is resolved by `DEC-FUL-01`; provider,
  origin/location/hours/windows, package profiles, service allowlist, Finance
  treatment, implementation, readiness, and go-live remain gated.
- Tax treatment.
- Reservation duration is resolved as a fixed 30 minutes by `DEC-INV-01`;
  implementation, provider compatibility, expiry execution, and late-success
  reconciliation remain separately gated.
- Retail revision dan after-sales direction resolved by `DEC-AFTER-01`;
  legal/customer terms, working-day configuration, provider execution/timing,
  Finance accounting/tax correction, evidence privacy/retention, abuse/fraud,
  long-term uncollected-pickup policy, exact technical contract,
  implementation, readiness, dan go-live tetap gated.
- Retail operator/customer notification policy is resolved by amended
  `DEC-DATA-003`; provider/worker, exact event/source mapping, preference UI,
  implementation, migration, readiness, and go-live remain gated.
- Protected-scope implementation permission.
- Production readiness and go-live.

Deferred item harus diselesaikan sebelum implementasi surface yang bergantung padanya. Foundation dan back-office dapat direncanakan lebih dahulu.

### Out of Scope

- External CMS.
- Free-form page builder.
- Automatic purchase order ke supplier.
- Supplier portal.
- Instant final pricing untuk engineering kompleks.
- Real-time collaborative design editor.
- Microservices/ERP terpisah.
- Advanced capacity optimization.

## 20. Kriteria Penerimaan

- Retail dan B2B terlihat sebagai dua journey dalam satu platform.
- Retail mendukung ready-stock dan custom standar.
- B2B mendukung project dan bulk RFQ.
- Produk dapat memiliki Retail CTA dan B2B CTA.
- Harga, ETA, file, payment, dan tracking Retail terhubung.
- Quote, design, payment term, milestone, dan tracking B2B terhubung.
- Staf mengelola konten, catalog, material, harga, stok, order, project, produksi, dan shipment sesuai role.
- Histori transaksi tidak berubah karena update katalog atau harga material.
- Customer tidak menerima data internal.
- Retry dan concurrency tidak menghasilkan transaksi atau stok ganda.
- CMS serta back-office dapat dioperasikan staf melalui handover yang terdokumentasi.
