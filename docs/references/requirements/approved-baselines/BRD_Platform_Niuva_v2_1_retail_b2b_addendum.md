# Addendum BRD v2.1 — Satu Platform Niuva untuk Retail dan B2B

Tanggal: 14 Juli 2026
Status: Approved Baseline
Approval record: `docs/decisions/evidence/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md`
Dokumen induk: `docs/references/requirements/historical-active/BRD_Website_Niuva.md`
Supersedes archived evidence: `docs/archive/superseded/BRD_Platform_Niuva_v2_addendum.md`
Design source: `docs/implementation/specs/active/2026-07-14-unified-retail-b2b-platform-design.md`

## 1. Arah Bisnis

Niuva mengembangkan satu website dengan dua arah pelanggan:

1. **Retail** untuk individu dan UMKM yang membutuhkan ready-stock, 3D printing, apparel, atau merchandise custom standar.
2. **Business/B2B** untuk perusahaan/instansi yang membutuhkan RFQ, bulk/repeat order, R&D, engineering, prototyping, workshop korporat, dan project kompleks.

Kedua arah memakai satu platform, CMS, inventory, produksi, pembayaran, shipment, dan Admin Studio. Marketplace Retail tidak menggantikan positioning utama Niuva sebagai mitra R&D, design engineering, dan prototyping.

BRD website v1.0 tetap berlaku bagi brand, portfolio, lead generation, dan halaman publik utama. Addendum v2.1 mengatur perluasan Retail, B2B portal, CMS, serta operasi internal.

## 2. Masalah Bisnis

| Kode | Masalah |
|---|---|
| BP2-01 | Retail belum memiliki flow katalog, konfigurasi, harga, checkout, payment, dan tracking |
| BP2-02 | B2B belum memiliki RFQ, quotation version, approval, milestone, dan portal organisasi terpadu |
| BP2-03 | Konten publik masih banyak bergantung pada perubahan kode |
| BP2-04 | Atasan membutuhkan sistem yang tetap dapat dioperasikan setelah masa magang selesai |
| BP2-05 | Material, harga bahan, stok, order, project, produksi, dan shipment perlu dikelola dalam satu back-office |
| BP2-06 | Harga dan ETA harus berasal dari data produksi yang dapat diaudit |
| BP2-07 | Perubahan harga/katalog berisiko merusak histori transaksi tanpa versioning/snapshot |
| BP2-08 | Retail dan B2B dapat berebut inventory jika reservasi dan planned demand tidak disatukan |

## 3. Tujuan Bisnis

| Kode | Tujuan |
|---|---|
| BG2-01 | Menyediakan dua journey pelanggan yang jelas dalam satu website |
| BG2-02 | Memungkinkan transaksi Retail end-to-end secara online |
| BG2-03 | Memungkinkan project dan bulk order B2B dikelola end-to-end |
| BG2-04 | Menyatukan data produk, material, inventory, order, project, produksi, dan shipment |
| BG2-05 | Memberikan estimasi harga, ETA, serta progress yang dapat dipercaya |
| BG2-06 | Mengurangi ketergantungan staf pada developer untuk pekerjaan rutin |
| BG2-07 | Menjaga cost, supplier, margin, laba, dan catatan internal tetap rahasia |
| BG2-08 | Menjaga auditability melalui version, snapshot, role, dan history |
| BG2-09 | Menyiapkan handover, backup, recovery, serta ownership operasional |

## 4. Stakeholder

| Stakeholder | Peran |
|---|---|
| Manajemen | Arah bisnis, policy, approval, dan ownership |
| Sales/Estimator | Inquiry, RFQ, costing, quotation, dan ETA |
| Content Editor | Konten website dan portfolio |
| Catalog Manager | Produk, variant, pricing rule, promo, dan publish |
| Warehouse | Material, supplier, stock movement, reservation, dan restock |
| Production | Work order, progress, kendala, dan output |
| Quality Control | QC result dan rework |
| Finance | Payment, invoice, termin, refund, dan reconciliation |
| Retail Customer | Checkout, payment, file, tracking, dan shipment |
| B2B Organization | RFQ, quote/design approval, milestone, payment term, dan shipment |

## 5. Business Requirements

| Kode | Requirement |
|---|---|
| BR2-01 | Website menyediakan journey Retail dan Business/B2B dalam satu platform |
| BR2-02 | Retail mendukung katalog, konfigurasi, upload file, harga/ETA, checkout, online payment, dan tracking |
| BR2-03 | B2B mendukung inquiry/RFQ, quotation, approval, desain, milestone, termin, dan tracking |
| BR2-04 | Retail mendukung fixed, calculated, dan quote_required pricing mode |
| BR2-05 | Produk Retail dapat diminta sebagai bulk RFQ tanpa input ulang data |
| BR2-06 | Retail mendukung guest checkout serta akun opsional |
| BR2-07 | Portal B2B menggunakan organization account dan role anggota |
| BR2-08 | Retail dan B2B berbagi catalog, material, inventory, production, payment, shipment, dan audit |
| BR2-09 | CMS internal mengelola konten, portfolio, catalog, SEO, media, dan publish workflow |
| BR2-10 | Operations Back-office mengelola order, project, material, stock, produksi, QC, payment, dan shipment |
| BR2-11 | Staf berwenang dapat menambah, mengubah, mengarsipkan material, dan memperbarui harga bahan |
| BR2-12 | Harga material dan transaksi menggunakan version/snapshot agar histori tidak berubah |
| BR2-13 | Sistem mencegah stock negatif, overselling, dan operation ganda |
| BR2-14 | Customer melihat milestone serta ETA tetapi tidak melihat data internal sensitif |
| BR2-15 | CMS dan operasi memakai role, approval, audit, backup, serta recovery |
| BR2-16 | Handover mencakup panduan, training, data dictionary, dan ownership matrix |

## 6. Model Pendapatan dan Transaksi

### Retail Fixed

Ready-stock atau variant dengan harga tetap dan checkout langsung.

### Retail Calculated

Custom standar dengan harga berdasarkan material, machine, labor, finishing, overhead, margin, tax, dan shipping.

### Quote Required

Kebutuhan nonstandar diteruskan sebagai quote request. Individu tetap dapat menjadi retail-assisted customer; perusahaan dapat memilih jalur B2B/RFQ.

### B2B

B2B memakai quotation/invoice, transfer, DP, termin, dan purchase order reference. Scope change menghasilkan versi quotation/ETA baru.

## 7. Scope

### Foundation

- Identity, organization, role, permission, dan audit.
- CMS dan publish workflow.
- Catalog, material, material price version, dan supplier.
- Inventory, movement, reservation, dan restock.
- Order/project foundation.

### Retail MVP

- Katalog 3D printing, ready-stock, apparel, dan merchandise.
- Product configurator dan file upload.
- Harga serta ETA.
- Guest/account checkout.
- Online payment integration.
- Production tracking, QC, shipment/pickup.

### B2B MVP

- Capabilities, portfolio, inquiry, dan bulk RFQ.
- Organization account.
- Quote/design version serta approval.
- Project milestone dan ETA.
- Invoice, DP/termin, production, QC, shipment.

### Operations Maturity

- Production board.
- Advanced notification.
- Analytics dan KPI reporting.
- Handover, backup/restore, training, dan SOP.

## 8. KPI

Target numerik ditetapkan setelah baseline tersedia. Sistem harus dapat mengukur:

- Retail catalog-to-checkout conversion.
- Payment success/failure rate.
- Cart abandonment.
- Inquiry-to-quote dan quote-to-acceptance conversion.
- Quote/design approval lead time.
- Estimated versus actual cost.
- ETA variance dan on-time milestone.
- Inventory accuracy, stockout, dan projected shortage.
- Jumlah correction, duplicate operation, dan manual override.
- Content/catalog update tanpa deployment.
- Persentase aktivitas rutin yang dapat dilakukan staf tanpa developer.

## 9. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Retail mengaburkan positioning B2B | Dua journey jelas; R&D/portfolio tetap kuat |
| Scope terlalu besar | Foundation dan vertical slice bertahap |
| Harga otomatis keliru | Pricing mode, validation, snapshot, dan quote fallback |
| Overselling | Atomic reservation dan idempotency |
| Data internal bocor | Backend authorization dan customer response schema |
| CMS merusak layout | Structured fields, preview, approval, dan rollback |
| Staff salah mengubah harga/stok | Role, manager approval, audit, dan training |
| Sistem tidak terurus setelah magang | Handover pack, ownership, SOP, backup/restore exercise |
| External service gagal | Retry, reconciliation, dan graceful error state |

## 10. Out of Scope

- External CMS dan free-form page builder.
- Automatic supplier purchasing.
- Supplier portal.
- Instant engineering-complex pricing.
- Real-time collaborative design editor.
- Microservices/ERP terpisah.
- Advanced production optimization.

## 11. Deferred Decisions

- Homepage pattern: split gateway, unified homepage, atau retail-first.
- Payment gateway provider.
- Detail visual Retail/B2B navigation.

Foundation dapat direncanakan sebelum keputusan ini. Implementasi surface yang bergantung padanya harus menunggu keputusan terkait.

## 12. Kriteria Keberhasilan

- Retail dan B2B tersedia sebagai dua journey dalam satu website.
- Retail dapat menyelesaikan order standar tanpa admin quotation.
- Kebutuhan kompleks dapat berpindah ke quote tanpa input ulang.
- B2B dapat menjalankan quotation, approval, milestone, payment term, dan tracking.
- Staff dapat mengelola konten, catalog, material, harga, stock, order, project, produksi, dan shipment sesuai role.
- Update harga/katalog tidak mengubah histori paid order atau accepted quote.
- Customer tidak menerima internal cost, margin, supplier, atau notes.
- CMS dan operasi tetap dapat digunakan setelah handover terdokumentasi.
