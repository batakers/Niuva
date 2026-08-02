# Addendum PRS v2.1 — Satu Platform Niuva untuk Retail dan B2B

Tanggal: 14 Juli 2026
Status: Approved Baseline
Approval record: `docs/decisions/evidence/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md`
Dokumen induk: `docs/references/requirements/historical-active/PRS_Website_Niuva.md`
Supersedes archived evidence: `docs/archive/superseded/PRS_Platform_Niuva_v2_addendum.md`
Business source: `docs/references/requirements/approved-baselines/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md`
Design source: `docs/implementation/specs/active/2026-07-14-unified-retail-b2b-platform-design.md`

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

### 3.1 Retail Visitor

- Browse catalog.
- Configure non-sensitive product options.
- Maintain a non-authoritative local cart.
- Register atau login sebelum private upload dan commercial commitment.

### 3.2 Retail Account

Memiliki kemampuan visitor ditambah private upload, authoritative checkout,
online payment, order history, saved address, repeat order, authenticated
tracking, dan file yang diizinkan sesuai `DEC-RT-02`.

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
│   └── Cart
└── Business/B2B
    ├── Capabilities
    ├── Portfolio
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

Offer, pricing, dan fulfillment merupakan atribut independen sesuai
`DEC-OFFER-01`. Configurator Custom 3D Print menyediakan Simple mode sebagai
default dan Detailed/advanced mode yang hanya mengekspos nilai terkalibrasi.
Niuva machine/nozzle/material/support/process profiles selalu authoritative.

### 5.3 Pricing Mode

| Mode | Perilaku |
|---|---|
| fixed | Variant/ready-stock price |
| calculated | Formula custom standar |
| quote_required | Data diteruskan ke quote request |

Calculated price mempertimbangkan material, machine, labor, finishing, overhead, margin, tax, dan shipping.

Untuk Custom 3D Print, `.stl` dan supported single-model/plate `.3mf` dapat
masuk automatic validation/slicing; embedded customer profiles diabaikan.
`.obj`, `.step`, `.stp`, ZIP, multiple models/parts/plates, serta complex
projects masuk manual review. PDF/JPG/JPEG/PNG hanya reference attachment dan
customer `.gcode` ditolak. Extension saja tidak pernah cukup; seluruh storage
gate `ADR-002` tetap berlaku.

Automatic price hanya final bila file, slicing, profile, build, configuration,
quantity production plan, tax, capacity, ETA, fulfillment, dan operator-risk
validation berhasil. Customer mengonfirmasi exact file version,
dimensions/scale, material/color/quantity/configuration, billable grams, print
duration, customer-safe breakdown, total, ETA, dan fulfillment; server
melakukan revalidation sebelum commitment.

Untuk direct-calculated Custom 3D Print FDM, `DEC-PRICE-001` menggantikan
formula generik dengan policy `NIUVA-CP-FDM-001`: progressive PLA
Rp1.000/Rp900/Rp800 per gram, progressive ABS
Rp1.200/Rp1.100/Rp1.000 per gram, exact machine time Rp5.000/jam, dan satu
`ROUND_HALF_UP` pada total material plus machine. Tidak ada minimum 50 gram atau
intermediate rounding. Inclusions, versioning, historical snapshot, activation
gate, dan batas shipping mengikuti `DEC-PRICE-001`; tax profile mengikuti
`DEC-TAX-01`.

`quote_required` item dipisahkan dari mixed cart tanpa menciptakan Order,
reservation, payment attempt, atau checkout total. Konteksnya diteruskan tanpa
input ulang. Bulk/borongan/partnership/recurring/organizational work masuk B2B;
eligible individual/UMKM dapat menerima Assisted Retail Offer.

Assisted Retail Offer bersifat private, customer-bound, immutable per version,
dan mengikuti `draft → awaiting_approval → offered → accepted | declined |
expired | superseded`. Manual price commitment memerlukan
`manager_approver`. Acceptance masuk normal Retail checkout untuk revalidation;
offer tidak mengubah catalog price atau menggabungkan Retail/B2B.

### 5.4 Checkout dan Payment

- Authenticated Retail account untuk setiap transaksi baru sesuai `DEC-RT-02`.
- Contact dan address.
- Shipping atau pickup.
- Summary, price, dan ETA confirmation.
- Online payment melalui provider yang dipilih kemudian.
- Ready-stock reservation dengan expiry.

`DEC-FUL-01` menetapkan Rp0 pickup serta automatic-rate domestic Indonesia
delivery untuk eligible direct checkout. Pickup location dipilih saat checkout,
collection window setelah `ready_for_pickup`, dan tujuh hari tanpa handover
membuat internal `pickup_overdue` plus dashboard/email follow-up tanpa
automatic cancellation, disposal, storage fee, refund, atau completion.
Delivery quote berlaku sampai provider expiry yang dibatasi maksimum 30 menit,
atau 30 menit bila provider tidak memberi expiry. Expired/changed rate,
service, atau ETA wajib direfresh dan dikonfirmasi ulang. International,
special packaging, unsupported, oversize, unsafe, atau uncertain fulfillment
menjadi `quote_required`. Provider dan operational configuration tetap gated.

### 5.5 Retail Tracking

```text
created → awaiting_payment → paid
→ file_review → queued → in_production
→ quality_control → ready_to_ship/pickup
→ shipped/picked_up → completed
```

Exception states: payment_failed, file_revision_required, on_hold, cancelled, refund_pending, refunded.

### 5.6 Retail Revision dan After-Sales

`DEC-AFTER-01` menetapkan:

- `file_revision_required` memberi 48 jam dari customer-facing notice yang
  berhasil tersedia; timeout masuk review tanpa automatic refund inference;
- approved paid cancellation sebelum actual printing/customization atau
  Ready-Product handoff menerima full eligible paid amount termasuk unused
  fulfillment tanpa provider/admin-fee deduction;
- cancellation setelah irreversible work dimulai bersifat manual dan partial
  refund hanya untuk exact affected/unperformed amount yang disepakati;
- complaint intake berlaku setidaknya dua hari kerja sejak carrier delivery
  atau recorded pickup handover tanpa automatic waiver untuk later/hidden
  defect review;
- confirmed Niuva error/carrier damage memberi customer pilihan affected-scope
  reprint/replacement atau refund, dengan required return/replacement shipping
  ditanggung Niuva;
- acknowledgement immediate, first human response satu hari kerja, dan target
  resolution decision lima hari kerja setelah sufficient evidence; dan
- `order_admin` melakukan triage, `finance` menyiapkan refund, dan setiap
  refund/free reprint membutuhkan `manager_approver`.

Direct-checkout Retail Order mengikuti policy ini. B2B Quote/Project mengikuti
accepted quotation/SOW/contract. Legal wording, provider/Finance execution,
business-calendar configuration, exact technical contract, implementation, dan
activation tetap gated. Notification policy mengikuti amended
`DEC-DATA-003`; provider dan technical activation tetap terpisah.

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

`DEC-ETA-01` menetapkan ETA Retail sebagai versioned range, bukan guaranteed
single date. Pickup menampilkan estimated-ready range; delivery memisahkan
estimated ready-to-ship dan arrival range. Ready Product menggunakan
handling/packing, operational buffer, dan fulfillment estimate. Eligible
Custom Print juga menggunakan applicable file/material readiness, production
queue range, exact accepted slicer print time, applicable post-processing,
serta QC.

ETA B2B juga mempertimbangkan design cycle, customer approval, procurement, dependencies, dan payment gate.

UI menggunakan milestone faktual, bukan progress percentage buatan. Authorized
`production`, `quality_control`, dan `order_admin` dapat memperbarui routine
domain milestone/ETA langsung dengan immutable history. Perubahan ETA menyimpan
old/new range, target, changed at, actor, reason, customer-safe explanation,
version references, dan audit.

Melewati `eta_latest_at` sebelum target selesai membuat internal
`eta_overdue` dan mewajibkan range/reason baru tanpa automatic cancellation,
refund, reprint, disposal, atau completion. Exact duration/calendar/buffer
profiles serta backend state machine/API/schema tetap activation atau
implementation gates. Direct-checkout Retail notification channels/recipients
mengikuti amended `DEC-DATA-003`; Retail dan B2B tetap memakai lifecycle
terpisah.

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
| FR2-04 | Diubah oleh `DEC-RT-02`: Retail mendukung authenticated file upload, price/ETA, account-required checkout, online payment, dan tracking |
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
| FR2-19 | Diubah oleh `DEC-RT-02`: order baru dilacak oleh authenticated owner; verified-contact guest tracking hanya compatibility untuk histori yang sudah ada |
| FR2-20 | Handover artifacts tersedia sebelum ownership berpindah |
| FR2-21 | Diubah oleh `DEC-AFTER-01`: Retail revision/after-sales memakai lifecycle-specific eligibility, at least two-working-day complaint intake, exact auditable refund/reprint/return outcome, explicit SLA, dan manager approval |
| FR2-22 | Diubah oleh `DEC-OFFER-01`: Custom Print Simple/Detailed configuration dan allowed file matrix memakai Niuva-authoritative profiles; customer `.gcode` ditolak |
| FR2-23 | Diubah oleh `DEC-OFFER-01`: automatic price membutuhkan seluruh technical/commercial validation, customer confirmation, dan server revalidation |
| FR2-24 | Diubah oleh `DEC-OFFER-01`: quote item terpisah dari direct cart dengan context preservation; eligible individual/UMKM dapat menerima private versioned manager-approved Assisted Retail Offer sebelum normal Retail checkout |

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

- Authenticated Retail Order owner only.
- Payment confirmation atau failed/expired/uncertain outcome yang membutuhkan
  tindakan.
- File revision required dan deadline.
- Material ETA change atau `eta_overdue`.
- Ready for pickup, shipment, delivery exception, dan receipt.
- Cancellation, complaint, reprint/replacement, dan refund decision/progress.
- Routine production-progress email memakai satu default-on preference; full
  milestone tracking tetap pada order detail.

### B2B

- Quote/design ready for review.
- Revision or approval recorded.
- Payment term due/verified.
- Milestone completed.
- ETA changed.
- Shipment created.

Daftar B2B di atas tetap product baseline, bukan bagian dari amendment
NMVP-D07. Recipient, mandatory channel, safe payload, dan activation contract
B2B memerlukan keputusan atau accepted contract terpisah.

### Internal

- Paid Retail Order ready for processing.
- Low stock/projected shortage/out of stock.
- Payment reconciliation.
- File replacement/deadline.
- Production/QC blocker, rework, atau `eta_overdue`.
- Delivery exception atau `pickup_overdue`.
- Complaint/SLA risk.
- Refund/free-reprint approval atau refund failure.
- Terminal notification delivery exhaustion/backlog.

Operator recipient selalu mengikuti approved role, permission, dan domain
scope. In-app record, safe payload/link, five-attempt delivery, controlled
resend, audit, retention, no-rollback, dan no-WhatsApp boundary mengikuti
amended `DEC-DATA-003`.

## 13. Testing

- Unit: pricing, ETA, inventory, material price version, production gate.
- API: roles, customer privacy, versioning, publish/rollback, state transitions,
  dan after-sales authorization/evidence boundary.
- Concurrency: final stock, duplicate webhook/refund, double approval, retried
  movement.
- E2E: Retail purchase/revision/complaint/remedy, B2B project, CMS
  publish/rollback.
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

Shipping/pickup policy tidak lagi deferred; arahnya governed by `DEC-FUL-01`.
Provider, origin/location/hours/windows, package profile, service allowlist,
Finance treatment, implementation, readiness, dan go-live tetap gated.

Retail revision dan after-sales policy tidak lagi open; arahnya governed by
`DEC-AFTER-01`. Legal/customer terms, working-day configuration, provider
refund execution/timing, Finance accounting/tax correction, evidence
privacy/retention, abuse/fraud handling, long-term uncollected-pickup policy,
exact technical contract, implementation, readiness, dan go-live tetap gated.
Notification policy mengikuti amended `DEC-DATA-003`; provider, worker, exact
event/source mapping, preference UI, implementation, dan activation tetap
gated.

Offer/file/quote-routing policy tidak lagi open; arahnya governed by
`DEC-OFFER-01`. Preset/advanced fields, file/storage limits, machine/process/
build/quantity/deadline/risk thresholds, default offer expiry, exact technical
contract, implementation, migration, readiness, dan go-live tetap gated.

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
