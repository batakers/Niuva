# PRD v2.1 — Platform Terpadu Niuva untuk Retail dan B2B

Tanggal: 14 Juli 2026
Status: Baseline disetujui untuk perencanaan implementasi; diamendemen 8
Agustus 2026 untuk intake B2B MVP
Business source: `docs/references/requirements/approved-baselines/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md`
Product scope source: `docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md`
Design source: `docs/implementation/specs/active/2026-07-14-unified-retail-b2b-platform-design.md`
Baseline lama: `memory/PRD.md`
Approved architecture pointers:

- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
- `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`
- `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`
- `docs/decisions/product/DECISION_LOG_Platform_Niuva_v2_1.md`

## 1. Ringkasan Produk

Niuva akan memiliki satu website dan satu platform operasional dengan dua journey pelanggan:

1. **Retail** untuk individu dan UMKM yang membutuhkan ready-stock, 3D printing, apparel, atau merchandise custom standar.
2. **Business/B2B** untuk perusahaan dan instansi yang membutuhkan RFQ, bulk/repeat order, R&D, engineering, prototyping, workshop korporat, atau project kompleks.

Kedua journey menggunakan fondasi data yang sama untuk katalog, material, inventory, produksi, pembayaran, fulfillment, notifikasi, audit, dan Admin Studio. Perbedaan journey terletak pada cara membeli, cara menyetujui scope, cara membayar, dan kedalaman tracking.

Platform tetap mempertahankan positioning Niuva sebagai mitra R&D, design engineering, dan prototyping. Retail adalah jalur transaksi tambahan, bukan pengganti identitas bisnis tersebut.

## 2. Status Baseline Lama

Implementasi saat ini sudah memiliki company profile, autentikasi, order 3D printing, estimasi manual, transfer dan bukti bayar, tracking sederhana, material CRUD, portfolio CRUD, serta admin dashboard.

PRD v2.1:

- Mempertahankan fitur lama yang masih relevan.
- Memperluas model dari order 3D printing menjadi Retail dan B2B terpadu.
- Menggantikan asumsi `admin/client` sebagai satu-satunya role dengan permission yang lebih granular.
- Menggantikan perubahan harga langsung dengan version dan snapshot.
- Mengembangkan admin dashboard menjadi Admin Studio yang berisi CMS dan Operations Back-office.
- Tidak menyimpan kredensial, secret, atau API key di dokumen produk.

## 3. Problem Statement

Saat ini Retail belum memiliki alur katalog sampai pembayaran dan tracking yang lengkap, sedangkan B2B belum memiliki RFQ, quotation version, approval, organization portal, serta milestone terpadu. Konten dan katalog juga masih terlalu bergantung pada developer.

Tanpa fondasi bersama, Retail dan B2B berisiko memakai data material, inventory, harga, order, serta produksi yang terpisah. Hal ini dapat menghasilkan overselling, harga historis berubah, progress yang tidak konsisten, dan beban operasional tinggi setelah pengembang awal tidak lagi tersedia.

## 4. Product Goals

| Kode | Goal |
|---|---|
| PG-01 | Menyediakan dua journey pelanggan yang jelas dalam satu website |
| PG-02 | Memungkinkan Retail menyelesaikan order standar secara mandiri |
| PG-03 | Memungkinkan B2B menjalankan RFQ sampai fulfillment melalui portal |
| PG-04 | Menyatukan katalog, material, stock, order, project, produksi, dan shipment |
| PG-05 | Menampilkan harga, ETA, serta milestone yang dapat dipercaya |
| PG-06 | Memungkinkan staf mengelola pekerjaan rutin tanpa perubahan kode |
| PG-07 | Melindungi histori transaksi dengan version dan snapshot |
| PG-08 | Melindungi cost, margin, supplier, dan catatan internal |
| PG-09 | Menjamin operasional dapat diserahterimakan dan dipulihkan |

## 5. Non-Goals

- Menjadi marketplace multi-vendor.
- Membuat external CMS atau free-form page builder.
- Memberikan instant final price untuk engineering kompleks.
- Membuat supplier portal atau automatic supplier purchasing.
- Membuat collaborative design editor real-time.
- Memecah sistem menjadi microservices atau ERP terpisah pada fase ini.
- Membuat advanced production capacity optimizer.

## 6. Persona dan Hak Akses

### 6.1 Retail Visitor

- Melihat dan mencari katalog.
- Mengatur pilihan non-sensitif dan mempertahankan cart lokal
  non-authoritative.
- Melihat informasi harga/ETA yang aman ketika tidak memerlukan file privat.
- Wajib mendaftar atau login sebelum upload file privat, authoritative
  checkout, reservasi, payment, history, dan tracking.

### 6.2 Retail Account

Memiliki kemampuan visitor ditambah upload file privat, authoritative checkout,
payment, riwayat order, saved address, repeat order, tracking, dan akses ke file
yang diizinkan. Setiap Retail Order baru menyimpan authenticated
`customer_id`.

`DEC-RT-02` menggantikan guest checkout untuk transaksi baru. Historical
guest-shaped orders, bila ada, tetap immutable dan ownership-scoped; tidak
di-link otomatis ke akun berdasarkan email, nomor telepon, atau contact match.

### 6.3 B2B Organization

| Role | Hak utama |
|---|---|
| Owner | Anggota organisasi dan seluruh project yang diizinkan |
| Project PIC | Brief, file, komunikasi, dan progress |
| Approver | Persetujuan atau revisi quotation dan desain |
| Finance | Invoice, DP, termin, payment, dan refund |
| Viewer | Read-only pada project yang ditugaskan |

Inquiry awal dapat dikirim tanpa login. Organization account diperlukan ketika inquiry berlanjut ke quotation dan project portal.

### 6.4 Internal Staff

| Role | Hak utama |
|---|---|
| Content Editor | Konten, SEO, media, dan portfolio |
| Catalog Manager | Kategori, produk, variant, konfigurasi, harga jual, dan promo |
| Warehouse | Material, supplier, inventory, movement, reservation, dan restock |
| Order Admin | Order Retail/B2B dan komunikasi pelanggan |
| Sales/Estimator | Inquiry, costing, quotation, dan ETA |
| Designer/Engineer | Design version dan technical review |
| Production | Work order, progress, kendala, dan output |
| Quality Control | QC result dan rework |
| Finance | Invoice, payment, term, refund, dan reconciliation |
| Manager/Approver | Override dan tindakan sensitif |
| Super Admin | User, role, configuration, dan seluruh modul |

Authorization wajib diperiksa di backend, bukan hanya disembunyikan di UI.

## 7. Information Architecture

```text
Public Website
├── Shared Brand/Company Pages
├── Retail
│   ├── Catalog
│   ├── Product Detail/Configurator
│   └── Cart
└── Business/B2B
    ├── Capabilities
    ├── Projects/Portfolio
    ├── Project Inquiry
    └── Bulk RFQ

Authenticated
├── Retail Account
│   ├── Private Upload
│   ├── Checkout/Payment
│   └── Order History/Tracking
├── B2B Organization Portal
└── Admin Studio
    ├── CMS
    └── Operations Back-office
```

Pola homepage dan detail visual navigasi Retail/B2B masih deferred. Foundation tidak boleh mengasumsikan salah satu pola sebagai keputusan final.

## 8. Core User Journeys

### 8.1 Retail Standard Order

```text
Katalog → konfigurasi → daftar/login → upload file → harga dan ETA
→ authoritative checkout → pembayaran → file review → produksi
→ QC → pickup/pengiriman → selesai
```

### 8.2 Retail ke Quote

Jika konfigurasi, material, quantity, deadline, file, atau finishing berada di luar aturan, sistem mengubah tindakan menjadi quote request. Pilihan produk, konfigurasi, file, quantity, dan kontak diteruskan tanpa input ulang.

### 8.3 B2B Project

```text
Inquiry/RFQ → estimasi internal → quotation
→ approval/revision → desain/engineering → design approval
→ DP/termin → produksi → QC → shipment → selesai
```

### 8.4 Content Publishing

```text
Draft → review → preview → published/scheduled → archived
```

Rollback membuat versi publik baru berdasarkan versi lama dan tetap tercatat di audit.

## 9. Functional Requirements

### 9.1 Shared Platform

| Kode | Requirement |
|---|---|
| FR-SH-01 | Sistem menyediakan journey Retail dan B2B dalam satu website |
| FR-SH-02 | Retail dan B2B berbagi katalog, material, inventory, produksi, payment, fulfillment, notification, dan audit |
| FR-SH-03 | Produk dapat memiliki CTA Retail dan Bulk/RFQ |
| FR-SH-04 | Konfigurasi Retail kompleks dapat diteruskan ke quote tanpa input ulang |
| FR-SH-05 | Order menyimpan transaksi komersial; Project menyimpan eksekusi kompleks |
| FR-SH-06 | Seluruh protected operation memakai backend authorization |
| FR-SH-07 | Aksi sensitif dan perubahan penting tercatat di audit |

Shared platform clarification: shared foundations do not mean that Retail Order and B2B Quote/Project use the same aggregate or state machine. Identity, organization, catalog, inventory, payment infrastructure, audit, CMS, and operational foundations may be shared, while Retail and B2B customer lifecycles and projections remain separate.

### 9.2 Retail

| Kode | Requirement |
|---|---|
| FR-RT-01 | Katalog awal mencakup 3D printing, ready-stock, apparel, dan merchandise custom sederhana |
| FR-RT-02 | Catalog mendukung kategori, search, filter, availability, dan price from |
| FR-RT-03 | Configurator mendukung variant, SKU, material, ukuran, warna, finishing, quantity, serta file requirement sesuai produk |
| FR-RT-04 | Pricing mode terdiri dari fixed, calculated, dan quote_required |
| FR-RT-05 | Diubah oleh `DEC-ETA-01`: customer melihat total serta authoritative estimated-ready range dan, untuk delivery, separate arrival range sebelum konfirmasi checkout |
| FR-RT-06 | Diubah oleh `DEC-RT-02`: checkout untuk setiap transaksi Retail baru membutuhkan authenticated account |
| FR-RT-07 | Diubah oleh `DEC-FUL-01`: eligible direct checkout mendukung Rp0 pickup dan automatic-rate domestic Indonesia delivery; international/unsupported/special fulfillment menjadi `quote_required` |
| FR-RT-08 | Online payment diproses secara idempotent |
| FR-RT-09 | Ready-stock memakai reservation dengan expiry |
| FR-RT-10 | Diubah oleh `DEC-RT-02`: tracking order baru membutuhkan authenticated ownership; historical guest access tetap compatibility-only dan tidak menjadi jalur transaksi baru |
| FR-RT-11 | Diubah oleh `DEC-ETA-01`: customer melihat milestone faktual, completed times, next action, current ETA range, dan safe exception/reason, bukan persentase buatan |
| FR-RT-12 | Diubah oleh `DEC-AFTER-01`: Retail mendukung 48-hour file revision, lifecycle-specific cancellation/refund, at least two-working-day complaint intake, governed reprint/replacement/return, explicit SLA, dan manager-approved refund/free reprint |
| FR-RT-13 | Diubah oleh `DEC-OFFER-01`: `offer_type`, `pricing_mode`, dan `fulfillment_mode` independen; Simple/Detailed configurator dan automatic-pricing eligibility memakai Niuva-authoritative profiles |
| FR-RT-14 | Diubah oleh `DEC-OFFER-01`: quote item dipisahkan dari mixed cart dengan context preservation; eligible individual/UMKM dapat menerima private versioned manager-approved Assisted Retail Offer yang masuk normal Retail checkout |

Status utama Retail:

```text
created → awaiting_payment → paid → file_review → queued
→ in_production → quality_control → ready_to_ship/pickup
→ shipped/picked_up → completed
```

Exception state mencakup `payment_failed`, `file_revision_required`, `on_hold`, `cancelled`, `refund_pending`, dan `refunded`.

Fulfillment Retail mengikuti `DEC-FUL-01`:

- basic packaging termasuk dalam harga standar; packaging khusus menjadi
  `quote_required`;
- pickup location dipilih saat checkout dan collection window setelah
  `ready_for_pickup`;
- delivery rate menggunakan authoritative address/package inputs dan berlaku
  sampai provider expiry yang dibatasi maksimum 30 menit;
- rate/service/ETA yang kedaluwarsa atau berubah harus direfresh dan
  dikonfirmasi ulang sebelum order/payment attempt;
- order menyimpan immutable fulfillment, address/location, package, service,
  amount, quote-timestamp, ETA, dan tracking snapshots; dan
- tujuh hari tanpa recorded pickup handover membuat internal
  `pickup_overdue` serta dashboard/email follow-up, bukan automatic
  cancellation, disposal, storage fee, refund, atau completion.

Revision dan after-sales Retail mengikuti `DEC-AFTER-01`:

- timeout file revision setelah 48 jam masuk review dan tidak menghasilkan
  automatic refund amount;
- approved paid cancellation sebelum irreversible work mengembalikan full
  eligible paid amount termasuk unused fulfillment tanpa provider/admin-fee
  deduction;
- cancellation setelah actual work dimulai bersifat manual dan partial refund
  membutuhkan exact affected/unperformed amount yang disepakati;
- complaint intake tetap tersedia sekurang-kurangnya dua hari kerja setelah
  authoritative receipt tanpa automatic waiver untuk later/hidden defect;
- confirmed Niuva error/carrier damage memberi customer pilihan affected-scope
  reprint/replacement atau refund, serta required return/replacement shipping
  ditanggung Niuva;
- acknowledgement immediate, first human response target satu hari kerja, dan
  resolution-decision target lima hari kerja setelah sufficient evidence; dan
- `order_admin` melakukan triage, domain roles memberikan scoped evidence,
  `finance` menyiapkan refund, serta setiap refund/free reprint memerlukan
  `manager_approver`.

Policy ini berlaku pada direct-checkout Retail Order; B2B Quote/Project tetap
memakai accepted quotation/SOW/contract. Activation gates pada
`DEC-AFTER-01` tetap berlaku.

### 9.3 B2B

| Kode | Requirement |
|---|---|
| FR-B2B-01 | Inquiry awal dapat dikirim tanpa login |
| FR-B2B-02 | Brief/RFQ menyimpan company, PIC, scope, output, quantity, specification, timeline, file, serta kebutuhan procurement |
| FR-B2B-03 | Portal quotation/project menggunakan organization account |
| FR-B2B-04 | Quotation memiliki version, breakdown pelanggan, total, ETA, milestone, term, expiry, dan status approval |
| FR-B2B-05 | Accepted quotation immutable; scope change membuat versi baru |
| FR-B2B-06 | Design review mendukung version, comment, approve, dan revision request |
| FR-B2B-07 | Final approved design dikunci; perubahan berikutnya menjadi change request |
| FR-B2B-08 | B2B mendukung invoice, transfer, DP, termin, dan purchase order reference |
| FR-B2B-09 | Portal menampilkan milestone, ETA, next action, payment, QC, dan shipment yang aman bagi customer |

#### Amendment MVP — public B2B intake, 8 August 2026

The full v2.1 B2B organization, quotation, and project requirements remain
the platform direction. For the narrowed MVP, the first public entry is a
manual, form-first inquiry flow:

- `/contact` accepts a B2B or partnership inquiry without login.
- The form persists one Inquiry before offering any follow-up handoff.
- The required public fields are `company`, `pic_name`, `pic_email`,
  `pic_phone`, `need`, `timeline`, and `brief`; the existing Inquiry UUID is
  the MVP customer reference.
- The customer-safe response may echo the submitter's own fields, but does not
  expose triage history, operator notes, provider payloads, cost, margin, or
  private files.
- After successful persistence, the customer may click through to the
  approved Niuva public WhatsApp destination with the Inquiry reference. This
  is a manual continuation, not an automatic notification, webhook, campaign,
  retry worker, or SLA reminder.
- Inquiry statuses retain the existing `new`, `reviewed`, `contacted`,
  `converted`, and `rejected` state machine. Quotation and project states
  remain separate B2B aggregates.
- Public raw-file upload is excluded from this MVP. An operator may request
  files later through an approved private storage process.
- The approved privacy checkbox is required:

  > Saya setuju Niuva menggunakan data ini untuk meninjau inquiry dan
  > menghubungi saya terkait kebutuhan yang saya kirim. Data tidak digunakan
  > untuk marketing tanpa persetujuan terpisah.

The customer-facing expectation is immediate acknowledgement and a first
human response target of one working day, owned by `Niuva Operations`, using
Monday–Friday, 09.00–17.00 WIB, excluding public holidays. This is not a
quotation, price, or delivery guarantee. The narrowed MVP does not activate a
customer B2B organization portal; organization-account quotation/project
access remains a later platform surface.

This amendment is governed by the amended `DEC-UX-003` route decision and the
promotion record:
`docs/implementation/specs/candidates/2026-08-08-niuva-mvp-prd-promotion-amendment-request-b2b-form-whatsapp.md`.

### 9.4 CMS

| Kode | Requirement |
|---|---|
| FR-CMS-01 | CMS menjadi modul internal pada stack dan database Niuva |
| FR-CMS-02 | CMS menggunakan structured fields, bukan free-form page builder |
| FR-CMS-03 | CMS mengelola About, Capabilities, FAQ, CTA, Contact, SEO, media, portfolio, B2B industry, dan project type |
| FR-CMS-04 | CMS mengelola kategori, produk, variant, option, price/rule, promo, lead time, media, dan publish state |
| FR-CMS-05 | Homepage fields dibuat setelah pola homepage disetujui |
| FR-CMS-06 | CMS mendukung draft, review, preview, publish/schedule, archive, version history, dan rollback |
| FR-CMS-07 | Publish diblokir jika field wajib atau konfigurasi harga/produksi tidak valid |
| FR-CMS-08 | Delete konten menggunakan soft delete/archive bila memiliki referensi |

### 9.5 Materials dan Inventory

| Kode | Requirement |
|---|---|
| FR-INV-01 | Staf berwenang dapat add, edit, dan archive material |
| FR-INV-02 | Material menyimpan SKU, unit, supplier, waste, reorder point, lead time, dan status |
| FR-INV-03 | Harga material memiliki version dan effective date |
| FR-INV-04 | Harga baru hanya memengaruhi kalkulasi baru atau draft yang dihitung ulang |
| FR-INV-05 | Paid order dan accepted quote mempertahankan price/material snapshot |
| FR-INV-06 | Material yang direferensikan transaksi tidak dapat hard delete |
| FR-INV-07 | Inventory mencatat receive, reserve, release, consume, produce, ship, damage, dan adjustment |
| FR-INV-08 | Stock operation menggunakan operation ID unik dan atomic update |
| FR-INV-09 | Sistem menolak balance negatif dan duplicate movement |
| FR-INV-10 | Restock alert internal memakai reorder point atau projected shortage |
| FR-INV-11 | Customer dapat meminta back-in-stock notification untuk finished good yang didukung |

Rumus dasar:

```text
available = on_hand - reserved
projected = available + incoming - planned_demand
```

### 9.6 Operations Back-office

| Kode | Requirement |
|---|---|
| FR-OPS-01 | Dashboard menampilkan jumlah order Retail/B2B, status, action queue, at-risk ETA, production queue, QC, dan low stock |
| FR-OPS-02 | Order detail menampilkan customer/organization, configuration/scope, file/design, price/quote snapshot, payment, ETA, work order, QC, shipment, dan audit |
| FR-OPS-03 | Staff dapat mengelola work order, step, status, output, kendala, QC, dan rework sesuai role |
| FR-OPS-04 | Finance dapat mengelola payment, invoice, termin, refund, dan reconciliation sesuai role |
| FR-OPS-05 | `DEC-AFTER-01` mewajibkan `manager_approver` untuk setiap refund/free reprint; sensitive override/adjustment lain mengikuti approved role/decision boundary |

### 9.7 ETA, Progress, dan Notification

| Kode | Requirement |
|---|---|
| FR-ETA-01 | ETA Retail mempertimbangkan payment/file readiness, material, production slot, process, QC, dan buffer |
| FR-ETA-02 | ETA B2B juga mempertimbangkan design cycle, approval, procurement, dependency, dan payment gate |
| FR-ETA-03 | Perubahan ETA menyimpan tanggal lama, tanggal baru, waktu perubahan, actor, dan alasan |
| FR-ETA-04 | Customer hanya melihat alasan perubahan yang aman |
| FR-ETA-05 | `DEC-ETA-01` menetapkan Retail ETA sebagai versioned `eta_earliest_at`–`eta_latest_at` dalam `Asia/Jakarta`; pickup memakai ready range dan delivery memisahkan ready-to-ship dari arrival range |
| FR-ETA-06 | Ready Product memakai handling/packing, buffer, dan fulfillment; eligible Custom Print juga memakai applicable file/material readiness, queue range, exact accepted slicer time, post-processing, dan QC |
| FR-ETA-07 | Authorized production, quality_control, dan order_admin dapat memperbarui routine domain milestone/ETA langsung dengan previous/new range, target, actor, time, reason, safe explanation, version references, dan audit |
| FR-ETA-08 | Melewati `eta_latest_at` sebelum target milestone menghasilkan internal `eta_overdue` dan mewajibkan range/reason baru tanpa automatic cancellation, refund, reprint, disposal, atau completion |
| FR-ETA-09 | Retail Order dan B2B Quote/Project mempertahankan milestone/state machine terpisah; live printer telemetry dan exact queue-position disclosure bukan MVP dependency |
| FR-NOT-01 | General notification mengikuti amended `DEC-DATA-003`: recipient-scoped in-app record adalah canonical state dan email memakai provider-neutral outbox |
| FR-NOT-02 | Customer direct-checkout Retail hanya menerima notification untuk Retail Order yang dimiliki authenticated account; contact/email equality bukan ownership proof |
| FR-NOT-03 | Internal notification dirutekan menurut approved role, permission, dan domain scope; tidak broadcast ke seluruh Admin |
| FR-NOT-04 | Customer event allowlist mencakup material payment, file revision, ETA, fulfillment, cancellation, complaint, reprint/replacement, dan refund conditions |
| FR-NOT-05 | Operator event allowlist mencakup actionable order readiness, stock, reconciliation, file, production/QC, ETA, fulfillment, complaint/SLA, approval, refund-failure, dan notification-delivery conditions |
| FR-NOT-06 | In-app allowlisted events tidak dapat dimatikan; required transactional email selalu dienqueue; routine production-progress email memakai satu default-on customer preference |
| FR-NOT-07 | Notification memakai minimal versioned safe payload serta audience-aware same-origin reference allowlist; target selalu memerlukan authentication dan ownership/permission check |
| FR-NOT-08 | Email delivery mencoba maksimal lima kali; terminal `exhausted` menghasilkan role-scoped in-app alert dan tidak memakai WhatsApp/unapproved fallback |
| FR-NOT-09 | Authorized `order_admin` dapat meminta controlled resend setelah exhaustion dengan recipient/template tetap direkonsiliasi, linked delivery record baru, reason, dan audit |
| FR-NOT-10 | Notification failure tidak membatalkan transaksi utama; duplicate source event tidak menduplikasi effect, sedangkan business occurrence baru mendapat identity baru |
| FR-NOT-11 | In-app notification retain 180 hari dan terminal delivery metadata 30 hari; raw provider error, payload, dan retained contact copy dilarang |

Ketentuan notification di atas berlaku untuk direct-checkout Retail. B2B
Quote/Project notification recipients/events tetap mengikuti kontrak atau
keputusan terpisah.

## 10. Pricing Requirements

### Fixed

Digunakan untuk ready-stock atau variant yang memiliki harga tetap.

### Calculated

Digunakan hanya untuk custom standar yang seluruh inputnya tervalidasi.

`DEC-OFFER-01` mensyaratkan file/version ownership, slicing, Niuva profile,
build/configuration, quantity production plan, tax, capacity, ETA, fulfillment,
dan operator-risk validation sebelum harga otomatis menjadi final. Customer
mengonfirmasi file version, dimensions/scale, material/color/quantity/
configuration, billable grams, print duration, breakdown, total, ETA, dan
fulfillment; server merevalidasi sebelum commitment.

Custom 3D Print memakai Simple mode secara default dan optional
Detailed/advanced mode hanya untuk calibrated fields. `.stl` serta supported
single-model/plate `.3mf` dapat otomatis; embedded customer profiles diabaikan.
`.obj`, `.step`, `.stp`, ZIP, multiple models/parts/plates, serta complex
projects masuk manual review. PDF/JPG/JPEG/PNG hanya reference attachment dan
customer `.gcode` ditolak.

```text
price = material + machine + labor + finishing
      + overhead + retail_margin + tax + shipping
```

Perhitungan uang menggunakan representasi decimal atau minor unit yang konsisten, bukan floating point biner.

#### Custom 3D Print FDM

`DEC-PRICE-001` menetapkan policy `NIUVA-CP-FDM-001` untuk direct-calculated
Custom 3D Print dengan filament PLA/ABS milik Niuva:

```text
PLA =
  min(g, 200) * 1000
  + min(max(g - 200, 0), 300) * 900
  + max(g - 500, 0) * 800

ABS =
  min(g, 200) * 1200
  + min(max(g - 200, 0), 300) * 1100
  + max(g - 500, 0) * 1000

machine = exact_print_seconds / 3600 * 5000

custom_print_price =
  ROUND_HALF_UP(progressive_material_price + machine, 0)
```

Tidak ada minimum 50 gram atau intermediate rounding. Billable weight mencakup
model, support, brim/raft, serta purge/waste. Listrik, basic finishing, basic
packaging, support removal, QC, failed-print risk, dan indirect tax yang
berlaku sudah termasuk; shipping/pickup berada di luar formula ini.

Policy belum aktif pada tanggal approval. `effective_at` dicatat saat checkout
MVP memperoleh authorization terpisah, dalam zona `Asia/Jakarta`, setelah
Finance mengonfirmasi tax profile menurut `DEC-TAX-01`. Paid order dan accepted
quote menyimpan immutable input, policy, rate, tax, unrounded amount, serta
rounded amount snapshots.

### Quote Required

Digunakan untuk kebutuhan nonstandar atau ketika sistem tidak memiliki
kepastian yang cukup. Sistem tidak boleh menampilkan harga final otomatis
seolah-olah pasti.

Quote item tidak menciptakan Order, reservation, payment attempt, atau checkout
total. Pada mixed cart, item tersebut dipisahkan sebagai request dengan account,
product/configuration, quantity, file, safe analysis, fulfillment, dan reason
context tetap utuh.

Bulk, bundle, borongan, partnership, recurring, organizational, contractual,
atau special/international-fulfillment mengikuti B2B Inquiry →
Quote/Project. Eligible individual/UMKM dapat menerima Assisted Retail Offer
yang private, customer-bound, dan immutable per version:

```text
draft
-> awaiting_approval
-> offered
-> accepted | declined | expired | superseded
```

Manual price commitment memerlukan `manager_approver`. Acceptance hanya masuk
normal Retail checkout untuk revalidation terhadap ownership, active version,
`expires_at`, tax, capacity, ETA, dan fulfillment. Offer tidak mengubah catalog
price dan tidak menggabungkan Retail Order dengan B2B Quote/Project.

## 11. Data Model Minimum

| Area | Entity |
|---|---|
| Identity | User, RetailProfile, Organization, OrganizationMember |
| CMS | ContentPage, ContentVersion, MediaAsset, PublishEvent |
| Catalog | Category, Product, Variant, ConfigurationOption, PricingRule |
| Material | Material, MaterialPriceVersion, Supplier |
| Inventory | InventoryBalance, StockMovement, StockReservation |
| Retail | Cart, quote-request record, versioned Assisted Retail Offer record, Order, OrderItemSnapshot, Payment |
| B2B | Inquiry, QuoteVersion, Project, Milestone, DesignVersion, Approval |
| Production | WorkOrder, WorkStep, QCRecord, ReworkRecord |
| Fulfillment | Shipment, Pickup |
| Platform | Notification, AuditEvent, WorkflowJob |

Nama entity/API/state teknis untuk quote request dan Assisted Retail Offer
belum ditetapkan oleh `DEC-OFFER-01`. Model detail ditetapkan dalam
implementation plan dan schema design, tetapi harus menjaga versioning,
snapshot, ownership, expiry, approval, Retail/B2B separation, dan idempotency
di atas.

## 12. Privacy dan Security Requirements

- Response customer tidak boleh mengandung internal cost, margin, supplier, laba, atau internal notes.
- File harus divalidasi berdasarkan tipe, ukuran, ownership, dan hak akses.
- Download sensitif menggunakan endpoint terotorisasi atau link terbatas waktu.
- Organization member hanya dapat mengakses project yang ditugaskan.
- Audit menyimpan actor, waktu, target, before/after yang sesuai, serta reason.
- Secret, kredensial, dan API key hanya disimpan melalui environment/secret management, bukan dokumentasi atau repository.
- Data personal dan financial tidak boleh muncul di log aplikasi secara berlebihan.

## 12.1 Approved Architecture Boundaries

### Transaction capability — `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`

- MongoDB replica-set multi-document transaction adalah baseline yang disetujui untuk cross-collection mutation yang membutuhkan atomicity.
- Local mutation development menggunakan single-node replica set; CI menggunakan isolated replica set.
- Staging dan production wajib memiliki transaction capability sebelum mutation flags yang terdampak diaktifkan.
- MongoDB standalone terbatas pada read-only atau operasi yang terbukti aman sebagai single-document atomic write.
- Operasi yang membutuhkan transaction harus fail closed dengan `503 transaction_unavailable`; silent fallback ke non-atomic writes dilarang.
- Boundary meliputi catalog publication snapshot/active pointer, inventory balance/movement/reservation, multi-line checkout plus reservations, reservation consume/release/expiry lintas record, payment/order transitions yang juga memutasi inventory, dan reconciliation writes yang membutuhkan atomic consistency.

### Persistent storage — `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`

- Application architecture memakai stable provider-neutral storage port dengan private persistent object storage sebagai production adapter class.
- Local filesystem hanya untuk development/demo. Production objects private by default; backend authorization adalah access model default.
- Signed access hanya setelah authorization backend, short-lived, dan scoped ke satu object serta satu action. Database-backed ownership menggantikan path-substring authorization.
- Public bucket dan public static directory dilarang.
- Boundary mencakup seluruh persistent uploads Retail, B2B, design, operational, QC, fulfillment, dan historical payment-proof objects yang dipertahankan berdasarkan `DEC-PAY-02`; tidak ada payment-proof upload baru.
- Provider, RPO/RTO, retention, quota, operational owners, backup/restore ownership, malware/quarantine ownership, Emergent migration/decommission, dan production readiness tetap open.
- Production upload tetap disabled sampai query-string access tokens dihapus, database-backed ownership dan MIME/signature validation diterapkan, malware scanning/quarantine serta backup/restore diuji, metadata/object reconciliation diuji, dan operational readiness disetujui.

### Payment orchestration — `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`

- Retail production target tetap online payment dengan provider-neutral core orchestration dan provider adapters di luar core order/payment domain.
- Provider events/webhooks harus idempotent; refund dan reconciliation memiliki boundary eksplisit; customer responses memakai customer-safe payment projections.
- Refund eligibility, amount, fee allocation, approval, dan customer remedy
  mengikuti `DEC-AFTER-01`; provider execution/timing dan Finance accounting
  tetap gated.
- Gateway provider tetap deferred dan tidak dipilih oleh PRD ini.
- Manual transfer bukan Retail production baseline. `DEC-PAY-02` menetapkan legacy manual-transfer records sebagai read-only dan menonaktifkan instruksi transfer, attempt, payment-proof upload, serta proof-driven transition baru. Historical records tetap dipertahankan.

ADR approval scope tetap terbatas pada internal architecture, documentation, dan future implementation planning; bukan production authorization.

## 13. Reliability dan Failure Handling

- Dua checkout pada stok terakhir: hanya satu reservasi atomik berhasil.
- Duplicate payment webhook: payment dan order tidak diproses dua kali.
- Retried stock movement: operation ID yang sama tidak membuat movement baru.
- Harga berubah sebelum pembayaran: customer harus menyetujui total terbaru.
- Paid order atau accepted quote: snapshot tetap.
- Upload retry: tidak membuat file/design version ganda.
- Stale quote/design/content approval: ditolak sebagai conflict.
- Notification failure: core transaction tetap berhasil dan notifikasi dapat di-retry.
- File-revision timeout: masuk after-sales review tanpa menghapus order atau
  menghasilkan automatic refund amount.
- Duplicate refund/reprint request: satu approved idempotent outcome dan tidak
  menduplikasi payment, inventory, notification, atau audit effect.
- Transaction-required operations fail closed with `503 transaction_unavailable`; silent fallback to non-atomic writes is prohibited. See `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`.

## 14. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Accessibility | Responsive, keyboard-usable, semantic, sufficient contrast, dan reduced-motion support |
| Usability | Loading, empty, error, conflict, retry, permission, dan expired states jelas |
| Performance | Catalog dan dashboard memuat data secara paginated/filterable; target angka ditentukan setelah baseline |
| Security | Backend authorization, least privilege, file ownership, dan audit |
| Data integrity | Atomic reservation, idempotency, version, snapshot, dan no-negative-stock |
| Maintainability | Structured CMS, role matrix, data dictionary, SOP, dan automated regression checks |
| Recoverability | Backup terjadwal dan restore exercise yang terdokumentasi |
| Observability | Error dan workflow failure dapat ditelusuri tanpa membocorkan data sensitif |

## 15. Analytics dan KPI Instrumentation

Sistem harus dapat mengukur:

- Retail catalog-to-checkout conversion.
- Payment success/failure serta cart abandonment.
- Inquiry-to-quote dan quote-to-acceptance conversion.
- Quote/design approval lead time.
- Estimated versus actual cost.
- ETA variance dan on-time milestone.
- Inventory accuracy, stockout, dan projected shortage.
- Correction, duplicate operation, dan manual override.
- Content/catalog update tanpa deployment.
- Aktivitas rutin yang dapat diselesaikan staf tanpa developer.

Target numerik ditetapkan setelah baseline produksi tersedia.

## 16. Migration dan Compatibility

- User, order 3D printing, material, portfolio, dan payment proof lama harus dipetakan, bukan dihapus otomatis.
- Existing 3D printing order menjadi salah satu tipe Retail atau assisted quote sesuai kelengkapan data.
- Role `admin/client` lama dimigrasikan ke role baru dengan least privilege dan review manual untuk admin.
- Material lama memperoleh SKU/status/version awal sebelum dipakai pricing baru.
- Order lama mempertahankan total dan histori yang sudah tercatat.
- Fitur baru diaktifkan bertahap menggunakan explicit configuration/feature flag bila dibutuhkan.
- Tidak ada migrasi destruktif tanpa backup dan dry run.

## 17. Release Sequence

### Phase 1 — Foundation

- Identity, organization, role, permission, dan audit.
- CMS foundation dan publish workflow.
- Catalog foundation.
- Material price version, inventory movement, reservation, dan restock.
- Shared order/project foundation.

### Phase 2 — Retail MVP

- Catalog awal dan configurator.
- File upload, price/ETA, cart, checkout, dan online payment.
- Production milestone, QC, shipment/pickup, dan authenticated tracking sesuai
  `DEC-RT-02` serta ETA/milestone policy `DEC-ETA-01`.
- Revision, complaint, reprint/replacement, refund, dan return sesuai
  `DEC-AFTER-01` setelah seluruh activation gate dipenuhi.
- Authenticated-owner/role-scoped dashboard dan allowlisted transactional email
  sesuai amended `DEC-DATA-003`, setelah provider, worker, technical,
  implementation, migration, dan activation gate dipenuhi.

### Phase 3 — B2B MVP

- Inquiry, bulk RFQ, organization account.
- Quote/design version dan approval.
- Project milestone, invoice, DP/termin, QC, dan shipment.

### Phase 4 — Operational Maturity

- Production board, advanced notification, analytics, dan KPI reporting.

### Phase 5 — Handover

- Admin manual, SOP, data dictionary, training, backup/restore exercise, deployment/recovery guide, ownership matrix, dan regression suite.

## 18. Testing Requirements

- **Unit:** pricing, decimal rounding, ETA, material price version, inventory, restock, dan production gate.
- **API/Integration:** role, privacy boundary, versioning, publish/rollback,
  stock/order/payment/after-sales transition, evidence boundary, dan
  notification retry.
- **Concurrency:** final-stock checkout, duplicate webhook/refund, double
  approval, dan retried movement.
- **E2E Retail:** catalog sampai shipment serta revision/complaint/remedy.
- **E2E B2B:** inquiry sampai shipment.
- **E2E CMS:** draft sampai rollback.
- **Recovery:** backup restore exercise.

## 19. Product Acceptance Criteria

- Retail dan B2B dapat dipahami sebagai dua journey dalam satu platform.
- Retail customer dapat configure, upload, melihat price/ETA, membayar, dan tracking.
- Kebutuhan nonstandar berubah menjadi quote tanpa input ulang.
- B2B customer dapat RFQ, approve quotation/desain, serta melihat milestone, ETA, payment, QC, dan shipment.
- Staf dapat mengelola konten, katalog, material, harga, stock, order, project, produksi, QC, payment, dan shipment sesuai role.
- Update harga/katalog tidak mengubah paid order atau accepted quote.
- Retry dan concurrency tidak menghasilkan payment, approval, atau stock movement ganda.
- Revision timeout, complaint, reprint/replacement, refund, dan return memiliki
  eligibility, SLA, manager approval, immutable snapshot, dan append-only audit
  sesuai `DEC-AFTER-01`.
- Customer tidak menerima data internal sensitif.
- Backup dapat dipulihkan dan aktivitas rutin dapat diteruskan berdasarkan handover pack.

## 20. Deferred Decisions

1. Pola homepage: split gateway, unified homepage, atau retail-first.
2. Provider payment gateway.
3. Detail visual navigasi/switch Retail dan B2B.

Implementation plan untuk Foundation boleh dibuat sekarang. Implementasi surface yang bergantung langsung pada keputusan deferred harus menunggu keputusan terkait.

Offer/file/quote-routing tidak lagi deferred; arahnya governed by
`DEC-OFFER-01`. Preset/advanced fields, file/storage limits, machine/process/
build/quantity/deadline/risk thresholds, default offer expiry, exact technical
contract, implementation, migration, production readiness, dan go-live tetap
gated.

## 21. Definition of Ready untuk Implementation Planning

Foundation siap direncanakan jika:

- BRD v2.1, PRS v2.1, PRD v2.1, dan design spec ditetapkan sebagai baseline.
- Scope implementation plan dibatasi pada Foundation.
- Migration compatibility dan privacy boundary dimasukkan ke plan.
- Deferred decision tidak diasumsikan selesai.
- Setiap task plan memiliki file target, verification, serta acceptance yang terukur.
