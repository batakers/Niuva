> **ARCHIVED — Do not use for new planning.**
>
> Canonical product and experience authority:
> `docs/NIUVA_MASTER_SPEC.md`
>
> See `docs/context/DOCUMENT_REGISTER.md` for status and permitted use.

# Desain Platform Operasional, Portal B2B, dan Marketplace Niuva

Tanggal: 14 Juli 2026  
Status: Superseded
Superseded by: `docs/implementation/specs/active/2026-07-14-unified-retail-b2b-platform-design.md`
Do not use for new planning. Historical content is preserved for traceability.
Stack saat ini: React, FastAPI, MongoDB standalone

## 1. Ringkasan

Niuva akan dikembangkan dari website B2B dan platform order 3D printing menjadi platform terintegrasi dengan tiga area:

1. Website publik untuk portfolio, marketplace produk siap jual, dan permintaan project custom.
2. Portal pelanggan individu dan perusahaan untuk quotation, approval desain, progress, ETA, pembayaran, dan pengiriman.
3. Dashboard internal untuk project, estimasi biaya, desain, produksi, inventory, quality control, dan administrasi.

Ketiganya memakai satu pusat data operasional. Informasi internal seperti harga modal, supplier, margin, laba, tugas tim, dan catatan kendala tidak pernah ditampilkan kepada pelanggan.

Pendekatan yang dipilih adalah **modular monolith** di stack yang sudah ada. Modul dipisahkan berdasarkan tanggung jawab bisnis, tetapi tetap dijalankan sebagai satu aplikasi dan satu deployment agar implementasi bertahap tetap realistis.

## 2. Konteks dan Batas Produk

Codebase saat ini sudah memiliki:

- Website publik Home, About, Capabilities, Projects, dan Contact.
- Login pelanggan dan dashboard order 3D printing.
- Alur estimasi, pembayaran manual, status order, serta bukti pembayaran.
- Dashboard admin untuk order, material, portfolio, pengguna, kontak, magang, dan pengaturan.

Desain ini adalah perluasan scope setelah MVP publik. Sebelum implementasi, BRD dan PRS perlu diperbarui agar marketplace dan sistem operasional resmi menjadi bagian sumber kebenaran produk.

Portfolio tetap berfungsi sebagai bukti kapabilitas B2B, bukan berubah menjadi daftar barang dagangan. Marketplace menjadi fitur pendukung dan tidak boleh melemahkan positioning Niuva sebagai mitra R&D, design engineering, dan prototyping.

## 3. Keputusan yang Disetujui

- Marketplace menggunakan model hybrid.
- Produk siap jual dapat dibeli langsung.
- Produk custom dan project B2B menggunakan brief, estimasi, dan quotation.
- Sistem dibagi menjadi website publik, portal pelanggan, dan dashboard internal.
- Inventory mencakup bahan baku dan produk jadi, termasuk stok yang direservasi.
- Pelanggan melihat tahapan project, ETA, approval desain, progress produksi, pembayaran, dan pengiriman.
- Pelanggan tidak melihat biaya produksi internal, margin, supplier, tugas tim, atau catatan kendala.
- Desain memakai versi, komentar, approval, dan permintaan revisi.
- Akun mendukung individu dan organisasi dengan beberapa anggota.
- Perhitungan harga dilakukan sistem berdasarkan rencana produksi, kemudian diperiksa admin sebelum dikirim.
- Prioritas rilis pertama adalah sistem operasional internal dan data terpusat.

## 4. Arsitektur Target

```text
Website publik         Portal pelanggan/B2B       Dashboard internal
Portfolio              Quotation & approval       Project control
Marketplace            Design approval            Costing
Custom inquiry         Progress & ETA             Design control
Checkout               Payment & shipment         Production & QC
                                                Inventory & restock
         \                    |                    /
          \                   |                   /
           └────────── Operational Core ─────────┘
```

Operational Core terdiri dari modul:

- Identity & Access
- Customer & Organization
- Inquiry & CRM
- Product & Marketplace
- Quotation & Costing
- Project & Design
- Production & Quality Control
- Inventory
- Payment & Shipment
- Notification & Audit

Setiap modul memiliki service dan kontrak API yang jelas. Modul tidak boleh membaca collection milik modul lain secara sembarang; koordinasi lintas modul dilakukan melalui service aplikasi.

## 5. Tiga Area Produk

### 5.1 Website Publik

- Projects/Portfolio sebagai mini case study.
- Produk siap jual dengan SKU, varian, harga, dan jumlah tersedia.
- Status tersedia, stok terbatas, habis, atau made-to-order.
- Cart dan checkout untuk produk siap jual.
- Form brief untuk kebutuhan custom/B2B.
- Opsi notifikasi pelanggan ketika produk kembali tersedia.

Jumlah yang dapat dilihat publik hanya stok tersedia produk jadi, yaitu stok fisik dikurangi stok yang sudah direservasi. Stok bahan baku tidak pernah dipublikasikan.

### 5.2 Portal Pelanggan

- Ringkasan order dan project.
- Milestone aktif, progress, ETA, dan tindakan berikutnya.
- Quotation berversi dengan Setujui atau Minta Revisi.
- Desain berversi dengan komentar, Setujui, atau Minta Revisi.
- Status pembayaran dan pengiriman.
- Notifikasi dalam aplikasi dan email.
- Anggota perusahaan dengan peran Owner, Project PIC, Approver, Finance, dan Viewer.

### 5.3 Dashboard Internal

- Inquiry, customer, dan organisasi.
- Project, PIC, prioritas, milestone, serta deadline.
- BOM, routing proses, jam mesin, tenaga kerja, overhead, dan harga jual.
- Quotation dan histori versinya.
- Design review internal serta approval pelanggan.
- Work order, antrean, jadwal, progress, kendala, dan QC.
- Inventory bahan baku, consumable, dan produk jadi.
- Stok fisik, reserved, incoming, projected, dan minimum.
- Notifikasi restock, approval terlambat, serta project berisiko melewati ETA.
- Data master produk, proses, mesin, rate biaya, supplier, dan satuan.

## 6. Model Data Utama

| Entitas | Tanggung jawab |
|---|---|
| User | Identitas pengguna dan status akun |
| Organization | Data perusahaan pelanggan |
| OrganizationMember | Keanggotaan dan peran dalam perusahaan |
| Inquiry | Brief awal dari form publik atau sales |
| Product / Variant | Produk marketplace, SKU, harga, serta kebijakan stok |
| QuoteVersion | Snapshot harga, ETA, syarat, masa berlaku, dan approval |
| Order | Catatan komersial, pembayaran, total, dan fulfillment |
| Project | Eksekusi project custom/B2B, milestone, PIC, dan timeline |
| DesignVersion | File desain, komentar, review, dan approval |
| WorkOrder | BOM, routing, jadwal, progress, kendala, dan QC |
| InventoryItem | Bahan atau barang jadi beserta balance dan satuannya |
| StockOperation | Receive, reserve, release, consume, produce, ship, adjust, damage |
| Payment | Termin, bukti, verifikasi, dan refund |
| Shipment | Kurir, resi, alamat, serta status pengiriman |
| Notification | Pesan, penerima, channel, status kirim, dan retry |
| AuditEvent | Aktor, waktu, objek, serta perubahan penting |
| WorkflowJob | Proses lintas entitas yang idempotent dan dapat dicoba ulang |

`Order` dan `Project` tidak menggandakan fungsi:

- Order menyimpan sisi komersial dan transaksi.
- Project menyimpan sisi pelaksanaan pekerjaan.
- Order ready-stock tidak memerlukan Project.
- Order custom/B2B terhubung ke satu Project.

Alur data utama:

```text
Ready-stock:
Product → Order → Payment → Stock Out → Shipment

Custom/B2B:
Inquiry → QuoteVersion → Order + Project → DesignVersion
→ WorkOrder → StockOperation → QC → Shipment
```

## 7. Estimasi Harga

Sistem menghitung harga secara semiotomatis. Admin wajib memeriksa sebelum quotation diterbitkan.

```text
material_cost = planned_quantity_including_waste × unit_cost
machine_cost  = machine_hours × machine_rate
labor_cost    = labor_hours × labor_rate

production_cost = material_cost
                + machine_cost
                + labor_cost
                + design_engineering_cost
                + finishing_cost
                + outsourcing_cost
                + overhead_cost

price_before_tax = production_cost / (1 - target_gross_margin)
customer_total   = price_before_tax + tax + shipping
```

Aturan:

- Nilai uang menggunakan Decimal/Decimal128, bukan floating point.
- Target gross margin harus lebih besar atau sama dengan 0 dan kurang dari 1.
- Admin dapat melakukan penyesuaian komersial dengan alasan yang tercatat.
- Pelanggan melihat rincian kelompok seperti desain, produksi, finishing, pajak, dan pengiriman.
- Pelanggan tidak melihat unit cost, supplier, overhead, target margin, atau laba.
- Perubahan BOM, kuantitas, rate, atau desain membuat estimasi berstatus perlu dihitung ulang.
- Quotation yang sudah dikirim atau disetujui tidak diedit; sistem membuat versi baru.
- Versi lama tetap tersimpan untuk audit.

Status quotation:

```text
draft → internal_review → sent
sent → accepted | revision_requested | expired
accepted → superseded jika perubahan scope disetujui
```

## 8. Estimasi Waktu

ETA mempertimbangkan:

- Durasi desain dan perkiraan waktu approval pelanggan.
- Lead time pengadaan material.
- Ketersediaan material.
- Antrean mesin dan tim produksi.
- Durasi routing untuk quantity yang diminta.
- Quality control.
- Buffer risiko.
- Pengiriman.

Tanggal mulai produksi paling awal adalah saat seluruh gerbang wajib terpenuhi. Sistem menghasilkan rentang tanggal, lalu admin mengonfirmasi sebelum ETA dipublikasikan.

Jika ETA berubah, pelanggan melihat tanggal baru, waktu pembaruan, dan alasan yang aman untuk pelanggan. Catatan kendala internal yang sensitif tetap tersembunyi.

## 9. Gerbang Produksi

Default project custom/B2B hanya dapat membuat work order aktif ketika:

1. Brief lengkap.
2. Quotation diterima.
3. Desain final disetujui.
4. Termin atau DP yang diwajibkan sudah diverifikasi.
5. Material tersedia dan direservasi, atau pengadaan sudah terjadwal.
6. PIC produksi serta jadwal awal tersedia.

Gerbang dapat dinonaktifkan per jenis project jika tidak relevan, tetapi perubahan konfigurasi harus tercatat dalam audit.

## 10. Inventory dan Restock

Jenis inventory:

- Raw material
- Consumable
- Finished good

Nilai utama:

```text
available = on_hand - reserved
projected = available + incoming - planned_demand
```

Notifikasi restock internal dibuat ketika:

- `available <= reorder_point`, atau
- `projected` menunjukkan kekurangan dalam planning horizon.

Peringatan menghasilkan usulan pengadaan internal, bukan pemesanan otomatis ke supplier.

Stock operation wajib memiliki operation ID unik. Update balance dilakukan secara atomik dengan syarat hasil tidak negatif. Pengulangan request dengan operation ID yang sama mengembalikan hasil sebelumnya dan tidak menggandakan pergerakan stok.

Untuk checkout ready-stock, stok direservasi selama masa pembayaran yang dapat dikonfigurasi; default 24 jam. Order kedaluwarsa atau dibatalkan melepaskan reservasi. Untuk project custom, reservasi dilakukan ketika gerbang produksi terpenuhi.

Pelanggan yang memilih notifikasi back-in-stock menerima pesan ketika produk berubah dari tidak tersedia menjadi tersedia. Notifikasi restock supplier tetap khusus internal.

## 11. Status dan Progress Pelanggan

Status internal lebih rinci daripada status pelanggan.

| Status internal | Tampilan pelanggan |
|---|---|
| estimating, internal_quote_review | Menunggu Estimasi |
| design, internal_design_review, revision | Tahap Desain |
| procurement, queued | Persiapan Produksi |
| in_production, temporarily_blocked | Produksi |
| quality_control, rework | Quality Control |
| ready_to_ship, shipped | Pengiriman |
| completed | Selesai |

Status blocked atau rework tidak harus ditampilkan dengan istilah internal. Pelanggan menerima progress dan dampak ETA yang relevan tanpa catatan sensitif.

## 12. Hak Akses

### Pelanggan

- Individu: hanya data miliknya.
- Organization Owner: anggota dan seluruh data perusahaan.
- Project PIC: brief, file, komunikasi, dan progress project terkait.
- Approver: quotation dan desain yang ditugaskan.
- Finance: quotation, invoice, pembayaran, dan refund.
- Viewer: akses baca pada project yang diberikan.

### Internal

- Super Admin: seluruh konfigurasi dan data.
- Sales/Estimator: inquiry, customer, costing, margin, dan quotation.
- Designer: desain, review, feedback, dan milestone desain.
- Production: work order, jadwal, progress, kendala, dan QC.
- Warehouse: inventory, reservasi, restock, dan supplier.
- Finance: invoice, termin, pembayaran, dan refund.
- Content Admin: portfolio dan katalog publik tanpa akses biaya produksi.

Semua pemeriksaan role dan organization scope dilakukan di backend. Frontend hanya menyembunyikan kontrol sebagai bantuan UX, bukan sebagai mekanisme keamanan.

## 13. Notifikasi

### Pelanggan

- Quotation diterbitkan, direvisi, akan kedaluwarsa, atau disetujui.
- Desain siap ditinjau atau membutuhkan keputusan.
- Pembayaran perlu dilakukan atau telah diverifikasi.
- Milestone produksi selesai.
- ETA berubah.
- Barang dikirim.
- Produk yang diikuti kembali tersedia.

### Internal

- Stok minimum atau proyeksi kekurangan.
- Approval quotation/desain melewati batas waktu.
- Work order berisiko melewati ETA.
- Kendala produksi atau QC.
- Pembayaran atau respons pelanggan baru.

Channel awal adalah in-app dan email. Kegagalan pengiriman masuk antrean retry dan tidak membatalkan transaksi utama. WhatsApp otomatis ditunda sampai provider, consent, template, dan biaya operasional disetujui.

## 14. Penanganan Kegagalan dan Konsistensi

Karena MongoDB saat ini berjalan standalone tanpa transaksi multi-document:

- Perubahan balance stok menggunakan update atomik pada satu dokumen.
- Operasi lintas entitas memakai WorkflowJob dengan idempotency key.
- Setiap langkah menyimpan status pending, applied, atau failed.
- Retry melanjutkan langkah yang belum selesai tanpa membuat project, order, atau reservasi ganda.
- Proses rekonsiliasi mendeteksi operasi balance yang belum memiliki audit record.
- Konflik versi atau stok tidak cukup menghasilkan respons 409, bukan overwrite diam-diam.
- Quote dan desain yang disetujui bersifat immutable.
- Upload file memakai validasi tipe, ukuran, ownership, dan nama storage berbasis UUID.
- API pelanggan menggunakan response schema khusus yang mengecualikan field internal.

## 15. Strategi Pengujian

### Unit test

- Formula costing dan gross margin.
- Pembulatan Decimal.
- Formula available dan projected stock.
- Restock trigger.
- ETA dan production gates.
- Pemetaan status internal ke pelanggan.

### API/integration test

- Role dan organization scoping.
- Quote/design versioning dan approval.
- Transisi status yang valid dan tidak valid.
- Reservasi, release, consume, dan stock out.
- Idempotency untuk retry.
- Notification retry.
- Customer response tidak mengandung cost, margin, supplier, atau catatan internal.

### Concurrency test

- Dua checkout tidak dapat mengambil unit stok terakhir yang sama.
- Dua request approval tidak membuat dua Project.
- Retry stock operation tidak menggandakan movement.

### End-to-end test

```text
Custom/B2B:
Inquiry → costing → quotation → approval → design approval
→ payment verification → stock reservation → production → QC → shipment

Ready-stock:
Product → checkout → payment → stock out → shipment
```

UI wajib memiliki state loading, empty, error, retry, permission denied, expired quotation, dan insufficient stock.

## 16. Tahapan Implementasi

### Fase 1 — Internal Operations Core

- Model user, customer, organization, dan internal role.
- Data master item, satuan, proses, mesin, rate, dan supplier.
- Inquiry, Project, Order, dan relasinya.
- Costing semiotomatis dan QuoteVersion.
- DesignVersion serta review internal.
- WorkOrder, production board, dan QC.
- Inventory balance, operation, reservation, dan restock alert.
- Audit, notification center, serta migrasi data order/material lama.

### Fase 2 — Portal Pelanggan/B2B

- Organization member dan role pelanggan.
- Quote approval dan revision request.
- Design approval dan komentar.
- Progress, ETA, pembayaran, shipment, serta notifikasi.
- Response schema yang memisahkan data internal dan pelanggan.

### Fase 3 — Hybrid Marketplace

- Product/variant/SKU dan tampilan ketersediaan.
- Cart, checkout, reservasi ready-stock, serta fulfillment.
- Back-in-stock subscription.
- Integrasi produk siap jual dengan inventory dan dashboard internal.

Setiap fase harus dapat dirilis dan diuji tanpa menunggu fase berikutnya.

## 17. Migrasi dari Sistem Saat Ini

- Role `admin` dan `client` lama tetap dikenali selama masa transisi.
- Material lama dipetakan menjadi InventoryItem bertipe raw material atau consumable.
- Order lama dipertahankan dan diberi tipe serta versi schema.
- Estimate/payment yang sudah tertanam tetap dapat dibaca melalui compatibility layer.
- Portfolio lama tetap menjadi content project dan tidak otomatis menjadi product marketplace.
- Migrasi dilakukan dengan dry-run, laporan jumlah data, backup, dan verifikasi sampel sebelum cutover.
- Tidak ada penghapusan data lama sampai hasil migrasi diverifikasi.

## 18. Di Luar Scope Saat Ini

- Pemesanan otomatis ke supplier.
- Supplier portal.
- Harga final custom tanpa review admin.
- Editor desain kolaboratif real-time.
- Microservices atau ERP terpisah.
- Optimasi kapasitas produksi tingkat lanjut.
- WhatsApp otomatis sebelum provider dan consent disetujui.
- Payment gateway baru; alur transfer manual dan bukti pembayaran tetap menjadi baseline sampai keputusan terpisah dibuat.

## 19. Kriteria Penerimaan

- Satu inquiry dapat berkembang menjadi quotation, order, project, desain, work order, dan shipment tanpa input ulang data inti.
- Produk ready-stock dapat dibeli tanpa membuat Project.
- Project custom memiliki quotation dan desain berversi.
- Pelanggan dapat melihat harga, progress, dan ETA tanpa melihat data internal.
- Sistem menolak stock operation yang menghasilkan balance negatif.
- Retry tidak menghasilkan order, project, reservasi, atau notifikasi ganda.
- Low stock dan projected shortage menghasilkan notifikasi internal.
- Produk kembali tersedia dapat memicu notifikasi pelanggan yang sudah berlangganan.
- Semua approval dan perubahan sensitif memiliki audit trail.
- Implementasi mempertahankan posisi R&D/prototyping sebagai fokus utama website publik.
