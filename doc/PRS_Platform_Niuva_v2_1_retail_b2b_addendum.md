# Addendum PRS v2.1 — Satu Platform Niuva untuk Retail dan B2B

Tanggal: 14 Juli 2026  
Status: Draft untuk review stakeholder  
Dokumen induk: `doc/PRS_Website_Niuva.md`  
Supersedes: `doc/PRS_Platform_Niuva_v2_addendum.md`  
Business source: `doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md`  
Design source: `docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md`

## 1. Product Goal

_Menyediakan satu platform Niuva dengan journey Retail dan B2B yang berbeda tetapi memakai CMS, katalog, inventory, produksi, pembayaran, shipment, dan Admin Studio yang sama._

Website v1.0 tetap menjadi baseline brand, portfolio, dan lead generation. Addendum v2.1 menambahkan transaksi Retail, portal B2B, CMS, serta operasi internal tanpa menurunkan hierarki R&D/design engineering/prototyping.

## 2. Product Principles

1. Dua journey, satu platform dan satu sumber data.
2. Retail mengutamakan kecepatan serta self-service.
3. B2B mengutamakan scope clarity, approval, milestone, dan governance.
4. Produk dapat memiliki Retail CTA dan B2B bulk/RFQ CTA.
5. Order adalah catatan komersial; Project adalah catatan eksekusi kompleks.
6. Harga/ETA otomatis hanya diberikan ketika aturan cukup pasti.
7. Version dan snapshot melindungi histori.
8. Customer hanya menerima data yang relevan.
9. CMS menggunakan structured fields, bukan page builder bebas.
10. Staf mengoperasikan aktivitas rutin melalui Admin Studio sesuai role.

## 3. Target Users

### 3.1 Retail Guest

- Browse catalog.
- Configure product.
- Upload file.
- Checkout dan online payment.
- Tracking melalui order number serta contact verification.

### 3.2 Retail Account

Memiliki kemampuan guest ditambah order history, saved address, repeat order, dan file yang diizinkan.

### 3.3 B2B Organization

| Role | Kemampuan |
|---|---|
| Owner | Organization member dan seluruh project |
| Project PIC | Brief, file, komunikasi, dan progress |
| Approver | Quote/design approval atau revision request |
| Finance | Invoice, DP, termin, payment, dan refund |
| Viewer | Read-only pada project yang diberikan |

### 3.4 Internal Users

| Role | Area |
|---|---|
| Content Editor | Content dan portfolio |
| Catalog Manager | Product, variant, option, price, promo |
| Warehouse | Material, supplier, inventory, movement, restock |
| Order Admin | Retail/B2B order dan customer communication |
| Sales/Estimator | Inquiry, costing, quotation, dan ETA |
| Designer/Engineer | Design version dan review |
| Production | Work order dan progress |
| Quality Control | QC serta rework |
| Finance | Payment, invoice, term, refund |
| Manager/Approver | Sensitive adjustment dan approval |
| Super Admin | User, role, configuration, seluruh modul |

## 4. Product Structure

```text
Public Website
├── Shared Brand/Company Pages
├── Retail
│   ├── Catalog
│   ├── Product Detail/Configurator
│   ├── Cart/Checkout
│   └── Order Tracking
└── Business/B2B
    ├── Capabilities
    ├── Portfolio
    ├── Project Inquiry
    └── Bulk RFQ

Authenticated
├── Retail Account
├── B2B Organization Portal
└── Admin Studio
    ├── CMS
    └── Operations Back-office
```

Homepage pattern dan detail navigation tetap deferred.

## 5. Retail Scope

### 5.1 Catalog

- 3D printing.
- Ready-stock.
- Apparel.
- Merchandise custom sederhana.
- Category, search, filter, availability, serta price from.

### 5.2 Product Detail/Configurator

- Product media dan description.
- Variant/SKU.
- Material, size, color, finishing, dan quantity.
- Min/max order.
- File requirement.
- Price dan ETA.
- Retail CTA serta Bulk/RFQ CTA.

### 5.3 Pricing Mode

| Mode | Perilaku |
|---|---|
| fixed | Variant/ready-stock price |
| calculated | Formula custom standar |
| quote_required | Data diteruskan ke quote request |

Calculated price mempertimbangkan material, machine, labor, finishing, overhead, margin, tax, dan shipping.

### 5.4 Checkout dan Payment

- Guest atau account.
- Contact dan address.
- Shipping atau pickup.
- Summary, price, dan ETA confirmation.
- Online payment melalui provider yang dipilih kemudian.
- Ready-stock reservation dengan expiry.

### 5.5 Retail Tracking

```text
created → awaiting_payment → paid
→ file_review → queued → in_production
→ quality_control → ready_to_ship/pickup
→ shipped/picked_up → completed
```

Exception states: payment_failed, file_revision_required, on_hold, cancelled, refund_pending, refunded.

## 6. B2B Scope

### 6.1 Inquiry/RFQ

- Company dan PIC.
- Need/project type.
- Scope dan target output.
- Quantity dan technical specification.
- Material/finishing jika diketahui.
- Timeline serta optional budget range.
- File upload.
- Procurement/legal requirement.

Inquiry awal tidak memerlukan login. Organization account diperlukan untuk quote dan project portal.

### 6.2 Quotation

- Version, amount, customer breakdown, ETA, milestone, term, expiry.
- Accept atau request revision.
- Internal cost/margin/supplier tidak dikirim ke customer.
- Accepted version immutable; scope change membuat versi baru.

### 6.3 Design dan Project

- Design version dan comments.
- Internal review dan customer review.
- Approve atau request revision.
- Milestone, ETA, next action, payment term, QC, shipment.

### 6.4 B2B Tracking

```text
inquiry_received → estimating → quote_review
→ awaiting_customer_approval → design
→ awaiting_design_approval → procurement/queued
→ in_production → quality_control
→ ready_to_ship → shipped → completed
```

Internal blocked/rework states dipetakan menjadi customer-safe status dan ETA impact.

## 7. ETA dan Progress

ETA Retail dihitung dari payment/file readiness, material availability, production slot, process duration, QC, dan buffer.

ETA B2B juga mempertimbangkan design cycle, customer approval, procurement, dependencies, dan payment gate.

UI menggunakan milestone, bukan progress percentage buatan. Perubahan ETA menampilkan old date, new date, changed at, dan customer-safe reason.

## 8. CMS Scope

### 8.1 Content

- Homepage fields setelah pola homepage disetujui.
- About, Capabilities, FAQ, CTA, Contact, SEO.
- Portfolio/case study.
- B2B industry dan project type.
- Media dan alt text.

### 8.2 Catalog

- Category, product, variant, SKU.
- Configuration option.
- Pricing/production rule.
- Base lead time.
- Stock visibility.
- Promo dan featured state.

### 8.3 Publishing

```text
draft → review → published/scheduled → archived
```

CMS mendukung preview, version history, rollback, audit, validation, dan soft delete. Publish diblokir ketika data wajib atau pricing configuration tidak lengkap.

## 9. Operations Back-office

### 9.1 Dashboard

- Retail dan B2B order count.
- Status breakdown.
- Payment/file/approval actions.
- At-risk ETA.
- Production queue dan QC.
- Low stock/projected shortage.

### 9.2 Order Detail

- Customer/organization.
- Product configuration/project scope.
- File/design version.
- Price snapshot/quote version.
- Payment, ETA, work order, QC, shipment, audit.

### 9.3 Material dan Inventory

Staf berwenang dapat add, edit, archive, serta memperbarui material price. Material menyimpan SKU, unit, supplier, waste, reorder point, lead time, dan status.

Harga menggunakan version/effective date. Material yang direferensikan transaksi hanya dapat diarsipkan, bukan hard delete.

```text
available = on_hand - reserved
projected = available + incoming - planned_demand
```

Movement: receive, reserve, release, consume, produce, ship, damage, adjustment.

## 10. Functional Requirements

| Kode | Requirement |
|---|---|
| FR2-01 | Sistem menyediakan Retail dan B2B journey dalam satu website |
| FR2-02 | Product mendukung Retail CTA serta Bulk/RFQ CTA |
| FR2-03 | Retail mendukung fixed, calculated, dan quote_required pricing |
| FR2-04 | Retail mendukung file upload, price/ETA, guest/account checkout, online payment, dan tracking |
| FR2-05 | Complex Retail configuration diteruskan ke quote request tanpa input ulang |
| FR2-06 | B2B mendukung inquiry, organization, quotation, design approval, milestone, term, dan tracking |
| FR2-07 | CMS mengelola content, catalog, portfolio, SEO, media, dan publish workflow |
| FR2-08 | Admin Studio menerapkan role serta permission per modul |
| FR2-09 | Staf berwenang dapat mengelola material, material price, dan supplier |
| FR2-10 | Inventory mendukung balance, movement, reservation, dan restock |
| FR2-11 | Harga/material/content/quote/design memakai version atau snapshot sesuai kebutuhan |
| FR2-12 | Paid order dan accepted quote tidak berubah karena update catalog/material |
| FR2-13 | Customer melihat milestone/ETA tanpa internal cost, margin, supplier, atau note |
| FR2-14 | System mencegah negative stock serta duplicate operation |
| FR2-15 | Online payment processing bersifat idempotent |
| FR2-16 | Upload file memakai validation dan ownership check |
| FR2-17 | Notification failure tidak membatalkan core transaction |
| FR2-18 | Sensitive action memiliki audit dan optional manager approval |
| FR2-19 | Guest dapat track order melalui order number dan verified contact |
| FR2-20 | Handover artifacts tersedia sebelum ownership berpindah |

## 11. Non-Functional Requirements

- Backend authorization untuk setiap protected operation.
- Customer-specific response schema.
- Atomic stock reservation.
- Idempotent workflow dan payment webhook.
- Decimal money representation.
- Structured validation dan clear error states.
- Responsive serta accessible UI.
- Reduced-motion support.
- Backup dan tested restore.
- Audit actor/time/before/after/reason.
- Loading, empty, error, conflict, retry, permission, dan expired states.
- CMS/back-office task-oriented dan tidak memakai dekorasi marketing berlebihan.

## 12. Notification

### Retail

- Payment confirmed/failed.
- File revision required.
- Production started.
- ETA changed.
- QC completed.
- Shipped/ready for pickup.

### B2B

- Quote/design ready for review.
- Revision or approval recorded.
- Payment term due/verified.
- Milestone completed.
- ETA changed.
- Shipment created.

### Internal

- New order/inquiry/payment.
- File or approval pending.
- Low stock/projected shortage.
- At-risk work order.
- QC/rework issue.

## 13. Testing

- Unit: pricing, ETA, inventory, material price version, production gate.
- API: roles, customer privacy, versioning, publish/rollback, state transitions.
- Concurrency: final stock, duplicate webhook, double approval, retried movement.
- E2E: Retail purchase, B2B project, CMS publish/rollback.
- Recovery: backup restore exercise.

## 14. Release Sequence

1. Foundation.
2. Retail MVP.
3. B2B MVP.
4. Operational maturity.
5. Handover.

Kedua journey dapat tampil lebih awal, tetapi transactional capability diaktifkan bertahap.

## 15. Deferred dan Out of Scope

Deferred:

- Homepage pattern.
- Payment gateway provider.
- Retail/B2B navigation visual.

Out of scope:

- External CMS atau free-form page builder.
- Automatic supplier purchase dan supplier portal.
- Instant complex engineering pricing.
- Real-time design editor.
- Microservices/ERP terpisah.
- Advanced capacity optimizer.

## 16. Product Acceptance Criteria

- Retail dan B2B dapat dipahami sebagai dua journey dalam satu platform.
- Retail customer dapat configure, upload, melihat price/ETA, pay, dan track.
- B2B customer dapat RFQ, approve quote/design, melihat milestone/ETA, payment, dan shipment.
- Staf dapat mengelola content, catalog, material, price, stock, order, project, production, QC, dan shipment sesuai role.
- Snapshot/version melindungi histori.
- Stock/payment/approval retry tidak membuat operasi ganda.
- Customer tidak menerima data internal.
- Handover memungkinkan kegiatan rutin tanpa developer.

