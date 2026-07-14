# Addendum BRD v2.0 — Integrated Operations, Customer Portal, dan Hybrid Marketplace

Tanggal: 14 Juli 2026  
Status: Draft untuk review stakeholder  
Dokumen induk: `doc/BRD_Website_Niuva.md`  
Referensi desain: `docs/superpowers/specs/2026-07-14-integrated-operations-marketplace-design.md`

## 1. Tujuan Addendum

Addendum ini memperluas BRD v1.0 setelah website publik dan platform order awal tersedia. BRD v1.0 tetap berlaku untuk positioning, brand, portfolio, lead generation, dan lima halaman publik utama.

Addendum v2.0 menjadi dasar bisnis bagi:

1. Sistem operasional internal yang menyatukan project, estimasi, desain, produksi, inventory, dan administrasi.
2. Portal pelanggan individu dan perusahaan untuk approval, progress, ETA, pembayaran, dan pengiriman.
3. Marketplace hybrid untuk produk siap jual dan permintaan produk custom/B2B.

Jika terdapat perbedaan scope:

- Scope v1.0 tetap menjadi baseline website publik dan lead generation.
- Scope v2.0 berlaku untuk operasional, portal pelanggan, dan marketplace.
- R&D, design engineering, dan prototyping tetap menjadi positioning utama Niuva.
- Marketplace dan merchandise tidak boleh mengambil hierarki utama dari bisnis R&D/prototyping.

## 2. Latar Belakang Bisnis v2.0

Platform saat ini sudah memiliki website publik, akun pelanggan, order 3D printing, estimasi, pembayaran manual, tracking order, dan dashboard admin dasar. Perkembangan kebutuhan bisnis menunjukkan bahwa Niuva membutuhkan alur yang lebih terintegrasi dari inquiry hingga delivery.

Data yang dibutuhkan tim meliputi:

- Pelanggan individu dan organisasi.
- Brief serta scope project.
- Estimasi biaya produksi dan harga jual.
- Versi desain serta approval pelanggan.
- BOM, work order, jadwal produksi, dan QC.
- Stok bahan baku, stok produk jadi, dan reservasi project.
- Progress serta ETA yang aman ditampilkan kepada pelanggan.
- Pembayaran, pengiriman, notifikasi, dan audit.

Tanpa pusat data operasional, tim berisiko melakukan pencatatan berulang, memakai harga atau desain yang tidak berlaku, menjanjikan ETA tanpa melihat antrean, serta mengalokasikan stok yang sama ke beberapa kebutuhan.

## 3. Masalah Bisnis Baru

### 3.1 Pendataan Terfragmentasi

Inquiry, quotation, project, desain, produksi, dan stok dapat dicatat di tempat berbeda. Hal ini meningkatkan pekerjaan administratif dan risiko data tidak sinkron.

### 3.2 Estimasi Belum Terhubung dengan Rencana Produksi

Harga custom perlu mempertimbangkan material, waste, waktu mesin, tenaga kerja, desain/engineering, finishing, outsourcing, overhead, margin, pajak, dan pengiriman. Perhitungan yang tidak terstruktur sulit diaudit dan mudah usang ketika spesifikasi berubah.

### 3.3 Visibility Project bagi Pelanggan Terbatas

Pelanggan membutuhkan quotation, approval desain, progress, ETA, pembayaran, dan pengiriman dalam satu portal. Informasi biaya, supplier, margin, dan kendala internal harus tetap rahasia.

### 3.4 Stok Belum Terhubung dengan Project dan Penjualan

Niuva perlu mengetahui stok fisik, reserved, incoming, kebutuhan terencana, dan risiko kekurangan agar project serta marketplace tidak mengambil persediaan yang sama.

### 3.5 Ready-Stock dan Custom Membutuhkan Alur Berbeda

Produk siap jual memerlukan checkout dan fulfillment. Project custom/B2B memerlukan brief, quotation, desain, approval, dan produksi. Keduanya harus berbagi customer, pembayaran, inventory, serta pengiriman tanpa dipaksa menjadi proses identik.

## 4. Tujuan Bisnis v2.0

### Tujuan Utama

_Membangun satu platform operasional yang menghubungkan permintaan pelanggan, estimasi, desain, produksi, inventory, transaksi, dan progress agar Niuva bekerja lebih terukur sekaligus memberi transparansi yang tepat kepada pelanggan._

### Tujuan Turunan

| Kode | Tujuan | Hasil bisnis yang diharapkan |
|---|---|---|
| BG2-01 | Menyatukan pendataan | Mengurangi input ulang dan perbedaan data antarbagian |
| BG2-02 | Menstandarkan estimasi | Harga dan ETA memiliki dasar yang dapat ditinjau serta diaudit |
| BG2-03 | Mengendalikan produksi | Project memiliki gerbang, work order, jadwal, progress, dan QC |
| BG2-04 | Meningkatkan akurasi inventory | Stok fisik, reserved, incoming, dan projected dapat dipantau |
| BG2-05 | Meningkatkan transparansi pelanggan | Pelanggan mengetahui keputusan, progress, ETA, pembayaran, dan pengiriman |
| BG2-06 | Mendukung pendapatan hybrid | Ready-stock dapat dijual tanpa mengganggu alur custom/B2B |
| BG2-07 | Menjaga kerahasiaan bisnis | Cost, margin, supplier, dan catatan internal tidak bocor |
| BG2-08 | Meningkatkan auditability | Approval serta perubahan sensitif memiliki aktor, waktu, dan versi |

## 5. Stakeholder v2.0

| Stakeholder | Kepentingan dan peran |
|---|---|
| Manajemen Niuva | Kebijakan harga, margin, prioritas, dan persetujuan scope |
| Business Development / Sales | Inquiry, customer, scope, dan quotation |
| Estimator | BOM, proses, biaya, harga, dan ETA awal |
| Design / Engineering | Versi desain, review, dan perubahan teknis |
| Produksi | Work order, progress, kendala, dan target waktu |
| Quality Control | Hasil QC dan rework |
| Warehouse / Procurement | Stok, reservasi, penerimaan, restock, dan supplier |
| Finance | Termin, bukti pembayaran, invoice, verifikasi, dan refund |
| Content Admin | Portfolio dan produk publik tanpa akses cost internal |
| Pelanggan Individu | Pembelian produk dan order custom miliknya |
| Organisasi Pelanggan | Project melalui Owner, PIC, Approver, Finance, dan Viewer |

## 6. Business Requirements v2.0

| Kode | Kebutuhan bisnis |
|---|---|
| BR2-01 | Platform memakai satu sumber data dari inquiry hingga delivery |
| BR2-02 | Order menjadi catatan komersial dan Project menjadi catatan eksekusi |
| BR2-03 | Produk ready-stock dapat diproses tanpa membuat Project |
| BR2-04 | Project custom/B2B mendukung brief, quotation, desain, work order, QC, dan shipment |
| BR2-05 | Estimasi harga berasal dari komponen biaya produksi dan direview admin |
| BR2-06 | Quotation dan desain berversi serta tidak ditimpa setelah disetujui |
| BR2-07 | Pelanggan dapat menyetujui atau meminta revisi quotation dan desain |
| BR2-08 | Pelanggan dapat melihat progress, ETA, pembayaran, dan pengiriman relevan |
| BR2-09 | Cost, margin, supplier, laba, tugas tim, dan kendala tetap khusus internal |
| BR2-10 | Inventory mencakup bahan baku, consumable, produk jadi, dan reservasi |
| BR2-11 | Sistem mencegah stok negatif dan stock operation ganda |
| BR2-12 | Sistem memberi peringatan low stock dan projected shortage kepada internal |
| BR2-13 | Pelanggan dapat berlangganan notifikasi back-in-stock |
| BR2-14 | Akun perusahaan mendukung beberapa anggota dengan kewenangan berbeda |
| BR2-15 | Perubahan sensitif dan approval memiliki audit trail |
| BR2-16 | Pengembangan bertahap dengan Internal Operations Core sebagai fase pertama |

## 7. Model Bisnis Hybrid

### Produk Ready-Stock

```text
Product → Checkout → Payment → Stock Out → Shipment
```

- Menggunakan harga produk yang ditetapkan.
- Menampilkan stok tersedia produk jadi.
- Mereservasi stok selama masa pembayaran.
- Tidak membuat Project kecuali kebutuhan berubah menjadi custom.

### Project Custom/B2B

```text
Inquiry → Quotation → Order + Project → Design Approval
→ Work Order → Production → QC → Shipment
```

- Harga dan ETA berasal dari scope serta rencana produksi.
- Admin mereview quotation sebelum diterbitkan.
- Produksi dimulai setelah gerbang project terpenuhi.
- Perubahan scope setelah approval menghasilkan versi baru.

## 8. Ruang Lingkup v2.0

### Fase 1 — Internal Operations Core

- Customer dan organization registry.
- Role internal.
- Inquiry, Order, Project, dan relasinya.
- Data master item, satuan, proses, mesin, rate, dan supplier.
- Costing semiotomatis dan quotation berversi.
- Design version serta review internal.
- Work order, production board, progress, kendala, dan QC.
- Inventory balance, reservation, operation, dan restock alert.
- Notification center, audit trail, serta migrasi data lama.

### Fase 2 — Portal Pelanggan/B2B

- Akun individu dan organisasi.
- Owner, Project PIC, Approver, Finance, dan Viewer.
- Quote approval dan revision request.
- Design approval dan komentar.
- Progress, ETA, pembayaran, shipment, dan notifikasi pelanggan.
- Pemisahan response data internal dan pelanggan.

### Fase 3 — Hybrid Marketplace

- Product, variant, SKU, harga, dan ketersediaan.
- Cart, checkout, reservasi stok, dan fulfillment.
- Back-in-stock subscription.
- Integrasi ready-stock dengan inventory internal.

## 9. Out of Scope v2.0

- Pemesanan otomatis ke supplier.
- Supplier portal.
- Harga final custom tanpa review admin.
- Editor desain real-time seperti CAD/Figma.
- Microservices atau ERP terpisah.
- Optimasi kapasitas produksi tingkat lanjut.
- WhatsApp otomatis sebelum provider dan consent disetujui.
- Payment gateway baru; transfer manual dan bukti pembayaran tetap menjadi baseline sampai ada keputusan terpisah.

## 10. KPI dan Success Metrics v2.0

Target numerik ditetapkan manajemen setelah baseline tersedia. Sistem harus dapat mengukur:

| KPI | Tujuan pengukuran |
|---|---|
| Waktu inquiry ke quotation | Kecepatan respons komersial |
| Waktu approval quotation/desain | Hambatan keputusan pelanggan |
| Selisih estimated dan actual cost | Akurasi costing |
| Selisih ETA dan tanggal selesai | Akurasi perencanaan |
| Persentase milestone tepat waktu | Kinerja delivery |
| Stockout dan projected shortage | Kesiapan inventory |
| Akurasi stok fisik terhadap sistem | Keandalan inventory |
| Koreksi atau input data ganda | Efektivitas single source of truth |
| Conversion inquiry ke accepted quote | Efektivitas sales custom/B2B |
| Conversion product view ke order | Efektivitas marketplace |

## 11. Business Rules yang Dikunci

1. Sistem menghitung harga, tetapi admin menerbitkan quotation.
2. Pelanggan tidak melihat rincian cost internal atau margin.
3. Quotation dan desain yang disetujui tidak diedit; perubahan membuat versi baru.
4. Ready-stock dan custom berbagi customer, payment, inventory, shipment, notification, serta audit.
5. Stok tersedia adalah stok fisik dikurangi stok yang sudah direservasi.
6. Restock internal menghasilkan peringatan atau usulan, bukan purchase order otomatis.
7. Progress pelanggan berasal dari status internal yang dipetakan dan disederhanakan.
8. Hak akses diperiksa backend berdasarkan role dan organization scope.
9. Retry tidak boleh membuat order, project, reservasi, pembayaran, atau notifikasi ganda.
10. Website publik tetap memprioritaskan R&D, design engineering, prototyping, dan portfolio proof.

## 12. Risiko dan Mitigasi v2.0

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Scope terlalu besar | Pengembangan dan adopsi membengkak | Rilis internal, portal, lalu marketplace |
| Marketplace menggeser positioning | Niuva terlihat seperti vendor barang | Pertahankan R&D dan portfolio sebagai hierarki utama |
| Cost atau margin terlihat pelanggan | Kerugian komersial | Response schema pelanggan dan authorization test |
| Stok tidak akurat | Project terlambat atau overselling | Atomic balance, reservation, operation ID, stock opname |
| Estimate usang | Harga atau ETA tidak realistis | Tandai stale saat BOM, rate, desain, atau quantity berubah |
| Tim tidak mengadopsi sistem | Data kembali tersebar | Workflow sederhana, training, ownership, rilis bertahap |
| Migrasi merusak data lama | Riwayat salah atau hilang | Backup, dry-run, reconciliation, compatibility layer |
| Notifikasi berlebihan | Peringatan penting diabaikan | Severity, recipient rules, deduplication, preference |

## 13. Kriteria Keberhasilan Bisnis

- Data inti tidak diketik ulang ketika inquiry berkembang menjadi project dan order.
- Tim dapat menjelaskan sumber harga serta ETA dari data produksi.
- Pelanggan dapat mengambil keputusan dan melihat progress tanpa data internal.
- Tim mengetahui stok tersedia serta risiko kekurangan sebelum produksi terhambat.
- Ready-stock dapat dijual tanpa memaksa transaksi menjadi project B2B.
- Approval, harga, desain, stok, pembayaran, dan status dapat diaudit.
- Setiap fase memberi manfaat sebelum fase berikutnya dimulai.

## 14. Keputusan Lanjutan

Setelah addendum BRD dan PRS v2.0 disetujui, PRD perlu diselaraskan menjadi requirement terperinci. Implementation plan hanya dibuat setelah BRD, PRS, PRD, `PRODUCT.md`, dan `AGENTS.md` tidak lagi memiliki konflik scope.
