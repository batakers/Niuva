> **ARCHIVED — Do not use for new planning.**
>
> Canonical product and experience authority:
> `docs/NIUVA_MASTER_SPEC.md`
>
> See `docs/context/DOCUMENT_REGISTER.md` for status and permitted use.

# Addendum PRS v2.0 — Integrated Operations, Customer Portal, dan Hybrid Marketplace

Tanggal: 14 Juli 2026  
Status: Superseded
Superseded by: `docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md`
Do not use for new planning. Historical content is preserved for traceability.
Dokumen induk: `docs/references/requirements/historical-active/PRS_Website_Niuva.md`
Business source: `doc/BRD_Platform_Niuva_v2_addendum.md`  
Referensi desain: `docs/superpowers/specs/2026-07-14-integrated-operations-marketplace-design.md`

## 1. Tujuan Addendum

PRS v1.0 tetap menjadi baseline produk untuk website company profile, portfolio, dan lead generation. Addendum v2.0 memperluas produk menjadi platform terintegrasi dengan tiga area:

1. Website publik: portfolio, marketplace ready-stock, serta inquiry custom/B2B.
2. Portal pelanggan: quotation, approval desain, progress, ETA, pembayaran, dan pengiriman.
3. Dashboard internal: project, costing, desain, produksi, inventory, QC, dan administrasi.

Keputusan v1.0 yang tetap dikunci:

- R&D, design engineering, dan prototyping adalah fokus utama.
- Portfolio harus menjadi bukti kapabilitas melalui mini case study.
- CTA `Diskusikan Project` tetap menjadi konversi B2B utama.
- Marketplace merupakan fitur pendukung, bukan identitas utama website.

Keputusan out-of-scope v1.0 tentang e-commerce, portal client, login, dan dashboard kompleks hanya berlaku untuk MVP website v1.0. Fitur tersebut menjadi scope bertahap dalam addendum v2.0 ini.

## 2. Product Goal v2.0

### Goal Utama

_Menyediakan satu platform yang membantu Niuva mengelola kebutuhan pelanggan dari inquiry hingga delivery dan membantu pelanggan melihat harga, approval, progress, serta ETA tanpa membuka informasi internal yang sensitif._

### Product Goals Detail

| Kode | Product goal |
|---|---|
| PG2-01 | Menyatukan inquiry, quotation, order, project, desain, produksi, inventory, dan shipment |
| PG2-02 | Mempercepat penyusunan harga melalui costing berbasis rencana produksi |
| PG2-03 | Memberikan progress serta ETA yang mudah dipahami pelanggan |
| PG2-04 | Mengelola stok fisik, reserved, incoming, dan projected secara konsisten |
| PG2-05 | Mendukung persetujuan quotation dan desain dengan versioning |
| PG2-06 | Mendukung pelanggan individu dan organisasi dengan beberapa peran |
| PG2-07 | Menjual produk ready-stock tanpa mencampur alurnya dengan project custom |
| PG2-08 | Menjaga cost, margin, supplier, tugas tim, dan kendala internal tetap rahasia |

## 3. Target Users v2.0

### 3.1 Pengunjung Publik

Kebutuhan:

- Memahami positioning dan kapabilitas Niuva.
- Melihat portfolio sebagai bukti project.
- Melihat dan membeli produk ready-stock.
- Mengetahui stok tersedia produk jadi.
- Mengirim brief custom/B2B.
- Meminta notifikasi ketika produk kembali tersedia.

### 3.2 Pelanggan Individu

Kebutuhan:

- Membeli produk marketplace.
- Membuat dan memantau order custom miliknya.
- Melihat quotation, desain, progress, ETA, pembayaran, serta shipment.

### 3.3 Organisasi Pelanggan

Peran:

| Peran | Kebutuhan utama |
|---|---|
| Organization Owner | Mengelola anggota dan seluruh project organisasi |
| Project PIC | Mengelola brief, file, komunikasi, dan progress project terkait |
| Approver | Menyetujui atau meminta revisi quotation/desain |
| Finance | Melihat quotation, invoice, pembayaran, dan refund |
| Viewer | Melihat project yang diberikan tanpa mengubah keputusan |

### 3.4 Pengguna Internal

| Peran | Area kerja |
|---|---|
| Super Admin | Seluruh konfigurasi dan data |
| Sales / Estimator | Inquiry, customer, costing, harga, quotation, dan ETA awal |
| Designer / Engineer | Versi desain, review, feedback, dan milestone desain |
| Production | Work order, jadwal, progress, kendala, dan output |
| Quality Control | Pemeriksaan, hasil QC, dan rework |
| Warehouse | Inventory, reservasi, penerimaan, pengeluaran, dan restock |
| Finance | Invoice, termin, verifikasi pembayaran, dan refund |
| Content Admin | Portfolio dan katalog publik tanpa cost internal |

## 4. Struktur Produk

```text
Public Website
├── Home, About, Capabilities, Projects, Contact
├── Marketplace
├── Product Detail
├── Cart dan Checkout
└── Custom Project Inquiry

Customer Portal
├── Overview
├── Orders dan Projects
├── Quotations
├── Design Approvals
├── Progress dan ETA
├── Payments dan Shipments
├── Notifications
└── Organization Members

Internal Operations
├── Overview
├── Inquiries dan Customers
├── Quotations dan Costing
├── Projects dan Design Control
├── Production dan QC
├── Inventory dan Restock
├── Products dan Data Master
├── Payments dan Shipments
├── Notifications dan Audit
└── Settings dan Roles
```

## 5. Prinsip Produk yang Dikunci

1. Satu data inti dipakai lintas public, customer, dan internal surfaces.
2. Order menyimpan transaksi komersial; Project menyimpan pelaksanaan pekerjaan.
3. Ready-stock dapat selesai sebagai Order tanpa Project.
4. Custom/B2B menghubungkan Inquiry, Quotation, Order, Project, Design, dan Work Order.
5. Sistem menghitung estimasi, tetapi admin menerbitkan quotation serta ETA pelanggan.
6. Quotation dan desain yang sudah disetujui tidak ditimpa; perubahan membuat versi baru.
7. Pelanggan hanya melihat data yang relevan untuk keputusan dan progress.
8. Hak akses diperiksa backend, bukan hanya disembunyikan oleh frontend.
9. Inventory tidak boleh menjadi negatif atau diproses dua kali akibat retry.
10. Public marketplace tidak boleh menurunkan hierarki R&D/prototyping dan portfolio proof.

## 6. Scope Website Publik v2.0

### Portfolio

- Tetap menggunakan format challenge, solution, output, dan capability proven.
- Tidak otomatis berubah menjadi produk marketplace.
- Dapat dihubungkan ke produk terkait jika relasi tersebut nyata.

### Marketplace

- Daftar produk ready-stock dan made-to-order.
- Product detail, variant, SKU, harga, foto, deskripsi, dan ketersediaan.
- Stok tersedia produk jadi, yaitu on-hand dikurangi reserved.
- Cart dan checkout.
- Status tersedia, terbatas, habis, atau made-to-order.
- Back-in-stock subscription.

### Custom Inquiry

Field minimum:

- Nama dan kontak.
- Perusahaan/instansi jika ada.
- Jenis kebutuhan.
- Deskripsi brief.
- Quantity.
- Material atau finishing jika sudah diketahui.
- Target timeline.
- File pendukung.

## 7. Scope Portal Pelanggan v2.0

### Overview

- Order/project aktif.
- Status dan milestone terbaru.
- ETA.
- Next action seperti approval atau pembayaran.
- Notifikasi penting.

### Quotation

- Melihat versi aktif, total, breakdown pelanggan, ETA, syarat, dan masa berlaku.
- Setujui quotation.
- Minta revisi dengan alasan.
- Melihat riwayat versi yang pernah dikirim.

### Design Approval

- Melihat atau mengunduh file desain yang diizinkan.
- Melihat versi dan komentar terkait.
- Menyetujui desain.
- Meminta revisi dengan komentar.
- Approval hanya berlaku untuk versi yang sedang ditinjau.

### Progress dan ETA

- Menampilkan status yang disederhanakan.
- Menampilkan milestone selesai dan milestone aktif.
- Menampilkan rentang ETA, waktu pembaruan, dan alasan aman jika berubah.
- Tidak menampilkan task internal, cost, margin, supplier, atau catatan kendala sensitif.

### Payment dan Shipment

- Melihat termin dan status pembayaran.
- Mengunggah bukti pembayaran pada alur manual.
- Melihat hasil verifikasi.
- Melihat status shipment dan nomor resi jika tersedia.

## 8. Scope Internal Operations v2.0

### Inquiry dan Customer

- Registry individu serta organisasi.
- Konversi inquiry menjadi quotation.
- Penugasan owner internal.

### Costing dan Quotation

- Material termasuk waste.
- Jam mesin dan rate.
- Jam tenaga kerja dan rate.
- Design/engineering, finishing, outsourcing, overhead, target gross margin, pajak, dan pengiriman.
- Review internal sebelum publish.
- Versioning dan stale indicator ketika input berubah.

### Project dan Design Control

- PIC, priority, milestone, deadline, serta status.
- Design version, internal review, customer review, approval, dan revision request.
- Lock versi desain yang menjadi dasar produksi.

### Production dan QC

- BOM dan routing proses.
- Work order serta antrean.
- Jadwal awal, aktual, progress, kendala, dan rework.
- QC result sebelum ready-to-ship.

### Inventory

- Raw material, consumable, dan finished good.
- On-hand, reserved, incoming, available, dan projected.
- Receive, reserve, release, consume, produce, ship, adjust, dan damage.
- Reorder point serta projected shortage.
- Restock alert internal.

## 9. Alur Produk Utama

### 9.1 Ready-Stock

```text
Browse Product → Select Variant → Checkout → Reserve Stock
→ Payment Verification → Stock Out → Shipment → Completed
```

Jika pembayaran tidak selesai dalam masa reservasi, order kedaluwarsa dan stok dilepaskan.

### 9.2 Custom/B2B

```text
Inquiry → Internal Costing → Quote Review → Quote Sent
→ Customer Accepts → Design → Customer Approves
→ Required Payment Verified → Material Reserved
→ Work Order → Production → QC → Shipment → Completed
```

Jika scope, desain, quantity, atau rate yang relevan berubah, quotation/ETA ditandai stale dan harus dihitung ulang sebelum produksi dilanjutkan.

### 9.3 Back-in-Stock

```text
Product Unavailable → Customer Subscribes
→ Available Stock Changes Above Zero
→ Notification Sent Once per Availability Event
```

## 10. Estimasi Harga dan Waktu

### Harga

```text
production_cost = material + machine + labor + design/engineering
                + finishing + outsourcing + overhead

price_before_tax = production_cost / (1 - target_gross_margin)
customer_total   = price_before_tax + tax + shipping
```

- Nilai uang menggunakan Decimal, bukan floating point.
- Pelanggan melihat breakdown komersial, bukan komponen cost internal.
- Admin dapat melakukan adjustment dengan alasan yang masuk audit.

### ETA

ETA mempertimbangkan:

- Desain dan approval.
- Lead time pengadaan.
- Ketersediaan material.
- Antrean mesin/tim.
- Durasi routing dan quantity.
- QC, buffer risiko, dan shipment.

Sistem menghasilkan usulan rentang tanggal. Admin mengonfirmasi sebelum dipublikasikan.

## 11. Gerbang Produksi

Default custom/B2B hanya masuk produksi jika:

1. Brief lengkap.
2. Quotation diterima.
3. Desain final disetujui.
4. Termin/DP wajib sudah diverifikasi.
5. Material tersedia dan direservasi atau pengadaan terjadwal.
6. PIC serta jadwal awal tersedia.

Admin dapat menonaktifkan gerbang yang tidak relevan untuk jenis project tertentu dengan audit reason.

## 12. Status dan Visibility

| Status internal | Status pelanggan |
|---|---|
| estimating, internal_quote_review | Menunggu Estimasi |
| design, internal_design_review, revision | Tahap Desain |
| procurement, queued | Persiapan Produksi |
| in_production, temporarily_blocked | Produksi |
| quality_control, rework | Quality Control |
| ready_to_ship, shipped | Pengiriman |
| completed | Selesai |

| Informasi | Internal | Pelanggan |
|---|---:|---:|
| Harga jual dan total | Ya | Ya |
| Breakdown komersial pelanggan | Ya | Ya |
| Unit cost, overhead, margin, laba | Ya | Tidak |
| Supplier dan harga beli | Ya | Tidak |
| Versi desain untuk review | Ya | Ya |
| Task dan catatan kendala internal | Ya | Tidak |
| Milestone, progress, dan ETA | Ya | Ya |
| Stok bahan baku | Ya | Tidak |
| Stok tersedia produk jadi | Ya | Ya |

## 13. Functional Requirements Summary

| Kode | Requirement |
|---|---|
| PRS2-FR-01 | Sistem menyediakan tiga area: public, customer, dan internal |
| PRS2-FR-02 | Sistem mendukung individu dan organization membership |
| PRS2-FR-03 | Setiap role hanya dapat mengakses data sesuai kewenangannya |
| PRS2-FR-04 | Inquiry dapat dikonversi menjadi quotation tanpa input ulang data inti |
| PRS2-FR-05 | Quotation memiliki versi, expiry, approval, dan revision request |
| PRS2-FR-06 | Design memiliki versi, komentar, approval, dan revision request |
| PRS2-FR-07 | Custom order dapat terhubung ke Project dan Work Order |
| PRS2-FR-08 | Ready-stock order dapat selesai tanpa Project |
| PRS2-FR-09 | Costing menghitung material, machine, labor, service, overhead, margin, tax, dan shipping |
| PRS2-FR-10 | ETA memperhitungkan material, queue, routing, QC, dan shipping |
| PRS2-FR-11 | Production gates mencegah work order aktif sebelum syarat terpenuhi |
| PRS2-FR-12 | Inventory mendukung on-hand, reserved, incoming, available, dan projected |
| PRS2-FR-13 | Stock operation tidak boleh membuat balance negatif |
| PRS2-FR-14 | Sistem memberi internal restock alert |
| PRS2-FR-15 | Pelanggan dapat menerima back-in-stock notification |
| PRS2-FR-16 | Pelanggan melihat progress dan ETA yang dipetakan dari status internal |
| PRS2-FR-17 | Sistem menyimpan pembayaran, verifikasi, dan shipment |
| PRS2-FR-18 | Approval serta perubahan sensitif masuk audit trail |
| PRS2-FR-19 | Retry tidak menghasilkan entity atau stock operation ganda |
| PRS2-FR-20 | API pelanggan tidak mengirim field cost atau catatan internal |

## 14. Non-Functional Requirements

- Responsive pada desktop, tablet, dan mobile.
- Dashboard internal mengutamakan task completion serta data clarity.
- Aksi kritis memiliki loading, success, error, retry, dan conflict states.
- File upload memvalidasi tipe, ukuran, ownership, dan akses download.
- Nilai uang tidak memakai floating point.
- Waktu disimpan konsisten dan ditampilkan dalam konteks timezone pengguna.
- Perubahan penting dapat diaudit.
- Operasi yang diulang aman melalui idempotency.
- UI tidak mengandalkan warna saja untuk status.
- Motion menghormati reduced-motion preferences.
- Public pages mempertahankan identitas visual dan positioning Niuva v1.0.

## 15. Notifikasi

### Pelanggan

- Quotation baru, revisi, atau akan kedaluwarsa.
- Desain siap ditinjau.
- Pembayaran perlu dilakukan atau terverifikasi.
- Milestone selesai.
- ETA berubah.
- Barang dikirim.
- Produk kembali tersedia.

### Internal

- Low stock atau projected shortage.
- Approval melewati batas waktu.
- Work order berisiko melewati ETA.
- Kendala produksi atau QC.
- Pembayaran atau respons pelanggan baru.

Channel awal: in-app dan email. WhatsApp otomatis berada di luar scope sampai provider serta consent disetujui.

## 16. Fase Rilis

### Fase 1 — Internal Operations Core

Target: membangun data terpusat dan workflow internal sebelum menambah surface pelanggan atau marketplace.

### Fase 2 — Customer/B2B Portal

Target: membuka approval, progress, ETA, payment, dan shipment kepada pelanggan dengan data yang sudah stabil.

### Fase 3 — Hybrid Marketplace

Target: mengaktifkan ready-stock commerce dan back-in-stock notification di atas inventory core yang sudah berjalan.

Setiap fase harus dapat dirilis, diuji, dan memberikan manfaat tanpa menunggu fase selanjutnya.

## 17. Out of Scope v2.0

- Automatic purchase order ke supplier.
- Supplier portal.
- Instant final pricing untuk custom tanpa review admin.
- Real-time collaborative design editor.
- Microservices atau ERP terpisah.
- Advanced production optimization.
- WhatsApp automation tanpa provider/consent.
- Payment gateway baru sampai ada keputusan produk dan bisnis terpisah.

## 18. Product Acceptance Criteria

- Satu inquiry berkembang menjadi quotation, order, project, desain, work order, dan shipment tanpa input ulang data inti.
- Pelanggan dapat menyetujui atau meminta revisi quotation/desain yang tepat versinya.
- Pelanggan dapat melihat harga, progress, dan ETA tanpa cost, margin, supplier, atau catatan internal.
- Ready-stock checkout mereservasi dan mengurangi inventory secara konsisten.
- Custom/B2B tidak masuk produksi sebelum gerbang wajib terpenuhi.
- Stok negatif serta pemrosesan ganda ditolak.
- Low stock dan projected shortage menghasilkan alert internal.
- Back-in-stock hanya dikirim kepada pelanggan yang berlangganan.
- Role individu, organisasi, dan internal membatasi data dengan benar.
- Semua approval serta perubahan sensitif memiliki audit trail.
- Marketplace tetap mendukung, bukan menggantikan, positioning R&D/prototyping.

## 19. Langkah Berikutnya

Setelah BRD dan PRS addendum v2.0 direview:

1. Selaraskan PRD dengan functional requirements, business rules, data states, dan acceptance criteria.
2. Selaraskan `PRODUCT.md` serta `AGENTS.md` agar scope v2.0 diakui tanpa menghapus guardrail website publik.
3. Gunakan `superpowers:writing-plans` untuk menyusun implementation plan Fase 1 saja.
