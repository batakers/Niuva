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
- Retail mendukung guest checkout dan akun opsional.
- Portal B2B membutuhkan akun organisasi.
- Retail dan B2B menampilkan milestone serta ETA, bukan persentase progress buatan.
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
- Seluruh pilihan, file, quantity, dan kontak diteruskan tanpa input ulang.
- Jenis transaksi dan jenis pelanggan tetap berbeda: quote_required tidak otomatis menjadikan individu sebagai perusahaan.

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

**Quote required** digunakan jika material, ukuran, quantity, file, finishing, deadline, atau kompleksitas berada di luar aturan.

### 5.2 Upload File

Pelanggan dapat:

- Mengunggah file siap produksi.
- Memilih membutuhkan bantuan desain.
- Membaca format, ukuran, dan batas file.
- Mengganti file sebelum pembayaran.

File divalidasi berdasarkan tipe, ukuran, ownership, dan keamanan. Produksi tidak dimulai sebelum file dinyatakan siap.

Approved storage direction (`docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`): application memakai stable provider-neutral storage port dengan private persistent object storage sebagai production adapter class. Local filesystem hanya development/demo; production objects private by default; backend authorization adalah default; signed access harus short-lived, telah diotorisasi backend, dan scoped ke satu object/action. Database-backed ownership menggantikan path-substring authorization; public bucket/static directory dilarang.

Boundary ini mencakup seluruh persistent Retail, B2B, design, operational, QC, fulfillment, dan payment-proof uploads bila transitional manual-transfer adapter kelak disetujui. Provider, RPO/RTO, retention, quota, owners, backup/restore, malware/quarantine, Emergent migration/decommission, dan production readiness tetap open. Query-string access tokens, ownership, MIME/signature validation, malware quarantine, backup/restore, dan metadata/object reconciliation adalah prerequisite; production upload tetap disabled sampai operational readiness disetujui.

## 6. Retail Checkout, Payment, dan Tracking

### 6.1 Checkout

- Guest checkout atau akun opsional.
- Kontak serta alamat.
- Pengiriman atau pickup.
- Ringkasan produk dan konfigurasi.
- Harga final dan ETA.
- Online payment seperti VA, QRIS, atau e-wallet melalui provider yang dipilih kemudian.
- Provider-neutral payment orchestration adalah Retail production architecture; provider adapters berada di luar core order/payment domain.
- Provider events dan webhooks harus idempotent, refund/reconciliation memiliki boundary eksplisit, dan customer responses memakai customer-safe payment projections.
- Gateway provider tetap deferred. Manual transfer bukan Retail production baseline; legacy records tetap readable dan tidak ada transitional adapter baru yang diaktifkan.
- Transitional adapter masa depan memerlukan written decision, Finance owner, feature flag, SLA, expiry, exit criteria, storage approval, refund/late-payment handling, audit, dan rollback controls.

Ready-stock direservasi saat checkout. Reservasi dilepas jika pembayaran kedaluwarsa.

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

Guest tracking memakai nomor order dan verifikasi kontak. Akun Retail melihat riwayat, repeat order, alamat, serta file yang diizinkan.

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
production_start = max(
  payment_verified_at,
  file_approved_at,
  material_available_at,
  production_slot_at
)

estimated_finish = production_start
                 + process_duration
                 + qc_duration
                 + operational_buffer
```

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

Perubahan ETA menampilkan tanggal lama, tanggal baru, waktu perubahan, dan alasan yang aman. Detail kendala internal tetap tersembunyi.

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
- Refund, large price override, stock adjustment, dan role change dapat memerlukan manager approval.

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

- Guest, Retail, organization, dan internal roles.
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
- Shipping and pickup policy.
- Tax treatment.
- Reservation duration.
- Cancellation, refund, and return policy.
- Transitional manual-transfer adapter.
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
