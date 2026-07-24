# Retail Catalog Discovery Slice — Design Spec

Tanggal: 24 Juli 2026
Status: **Technical Design Candidate — not approved for implementation**
Scope kandidat: Read-only public Retail catalog discovery (browse, kategori, produk, varian, safe price/ETA display) sebagai first Retail vertical slice; bukan cart, bukan checkout, bukan payment, bukan implementation approval.
Canonical authority:
- `docs/NIUVA_MASTER_SPEC.md`
- `docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md`
Approved architecture pointers:
- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
- `docs/decisions/architecture/ADR-004-surface-boundary-topology.md` (proposed; topology deferred)
Related candidate (downstream, not part of this slice):
- `docs/implementation/specs/candidates/2026-07-16-retail-order-checkout-foundation-design.md`

Dokumen ini hanya mengubah dokumen desain; tidak ada production code, migrasi, atau infrastruktur yang diubah. Master Spec, DEC-UX-001, dan approved ADR menjadi sumber kebenaran.

## 1. Tujuan dan Posisi Produk

Slice ini mendefinisikan **vertical slice pertama** dari journey Retail: penemuan
katalog publik yang read-only. Tujuannya mengunci scope publik Retail yang paling
kecil dan paling aman — tanpa mutation, tanpa reservation, tanpa payment — sebelum
boundary teknis surface (ADR-004) atau checkout (candidate 2026-07-16) dikerjakan.

Slice ini adalah realisasi konkret dari **Retail** sebagai secondary-but-discoverable
journey di Master Spec §5 dan §6, dan dari Phase 2 ("Read-only Retail catalog") pada
`docs/implementation/specs/candidates/2026-07-16-retail-order-checkout-foundation-design.md` §15.

### Posisi dalam satu website

- Niuva tetap **satu website dan satu identitas** (DEC-UX-001). Slice ini bukan
  aplikasi, subdomain, atau produk terpisah.
- Retail bukan marketplace. Slice ini tidak boleh memperkenalkan multi-vendor,
  discount-led, atau merchandise-led identity (DEC-UX-001; Master Spec §Retail
  positioning).
- Retail dan B2B tetap sama-sama discoverable. Slice ini **tidak** mengunci label,
  placement, ordering, atau visual switch treatment navigasi Retail/B2B. Exact v1
  navigation tetap protected sampai approved Retail/B2B information-architecture
  decision menggantikannya.
- Banteng Print (`https://www.bantengprint.com/bantengprint/index.php`) hanya boleh
  dipakai sebagai referensi pola discovery/kategori/status, **bukan** acuan
  arsitektur, UI, maupun identitas komersial Niuva.

## 2. Batas Scope

### Termasuk dalam candidate

- Public read-only Retail catalog: daftar produk, kategori/filter, detail produk, dan
  varian, untuk item pada active catalog publication yang eligible untuk Retail.
- Safe, backend-authoritative display of price dan ETA untuk fixed-price ready-stock
  variants yang eligible.
- Customer-safe availability display (misalnya "tersedia" / "habis" pada level yang
  disetujui), tanpa membocorkan angka stok internal.
- Empty, loading, not-found, dan publication-inactive states.
- Read-only API contract yang membaca active publication dan authoritative snapshot.

### Tidak termasuk atau belum enabled

- Cart, checkout, preview, order creation, reservation, atau payment apa pun (milik
  candidate 2026-07-16).
- Produk `calculated` atau `quote_required`; slice ini hanya menampilkan yang eligible
  read-only.
- Custom configuration atau design-file upload.
- Customer authentication baru; discovery bersifat publik dan anonim.
- Perubahan navigasi/Homepage visual, atau perubahan protected exact v1 navigation.
- Pemilihan surface topology (route/subdomain/app) — deferred ke ADR-004.
- Penemuan yang menampilkan cost, margin, supplier, profit, planned demand, atau
  internal notes.

### Protected-scope approval

Implementasi slice ini tetap memerlukan izin eksplisit sebelum menyentuh:

- backend catalog route/service/repository dan API yang sudah ada;
- projection katalog dan aturan publikasi aktif;
- navigasi publik dan protected exact v1 navigation;
- shared identity, layout, atau design-system contract.

## 3. Invariant Data dan Otorisasi

- Backend authoritative untuk active catalog publication, eligibility produk/varian,
  price snapshot, dan availability. Browser tidak pernah menjadi sumber kebenaran.
- Hanya published, active, retail-enabled, fixed-price, ready-stock variants yang
  boleh muncul pada slice discovery ini.
- Customer/public response **wajib** mengecualikan internal stock counts, material
  cost, supplier, margin, profit, planned demand, dan internal notes (Master Spec §4;
  AGENTS.md customer-data boundary).
- Availability ditampilkan sebagai status customer-safe yang disetujui, bukan angka
  balance internal.
- Discovery bersifat read-only: tidak ada cross-collection mutation, sehingga ADR-001
  transaction gate tidak diinvokasi oleh slice ini. Bila di masa depan ada endpoint
  yang memutasi, endpoint tersebut berada di luar slice ini dan mengikuti ADR-001.

## 4. Arsitektur (indikatif, belum diotorisasi)

Slice mengikuti modular monolith yang sudah ada. Route hanya memvalidasi request dan
mengembalikan response; aturan eligibility/publication berada pada service/domain;
akses MongoDB dipusatkan pada repository/existing catalog layer.

### Backend (read-only)

- Menggunakan catalog layer yang sudah ada (`backend/catalog_routes.py`,
  `backend/catalog_service.py`, `backend/catalog_domain.py`) sebagai sumber.
- Bila endpoint discovery publik belum ada, tambahkan **read-only** public catalog
  endpoint yang memproyeksikan hanya field customer-safe dari active publication.
  Tidak ada write path yang ditambahkan oleh slice ini.

### Frontend (read-only)

- `frontend/src/pages/retail/RetailCatalog.jsx`: daftar + filter produk publik.
- `frontend/src/pages/retail/RetailProduct.jsx`: detail produk, varian, availability,
  safe price/ETA. Tidak ada tombol add-to-cart pada slice ini.
- `frontend/src/lib/retailCatalog.js`: API adapter dan response mapping read-only.

Retail dan B2B harus sama-sama discoverable, tetapi slice ini tidak mengunci label,
placement, ordering, atau visual switch treatment. Route baru tidak boleh menjadi
orphaned; penempatan entry point Retail mengikuti approved IA decision yang akan
datang, bukan slice ini.

## 5. Alur Data

```text
active catalog publication (retail-eligible, fixed-price, ready-stock)
  → customer-safe read-only projection (price, ETA, availability status)
  → public catalog list / product detail
```

Tidak ada cart, reservation, order, atau payment pada slice ini.

## 6. Candidate API Boundary (read-only)

```text
GET /api/catalog/products              # list retail-eligible published products
GET /api/catalog/products/{slug}       # product detail + variants + safe price/ETA
```

Response bersifat authoritative untuk active publication, eligibility, price snapshot,
availability status, dan waktu response. Tidak ada endpoint mutation pada slice ini.
Bila endpoint di atas sudah ada untuk keperluan lain, slice ini hanya memakai
projection customer-safe-nya dan tidak mengubah kontraknya tanpa protected-scope
approval.

## 7. Customer States

- Discovery menampilkan hanya active-publication, retail-eligible, fixed-price,
  ready-stock variants.
- Menangani loading, empty (kategori/hasil kosong), not-found (slug tidak ada atau
  publication tidak aktif), dan availability status.
- Tidak ada payment/cart/checkout state pada slice ini.

## 8. Feature Flag

- `RETAIL_CATALOG_ENABLED` — mengaktifkan read-only catalog discovery.
- Menonaktifkan flag harus menjaga sisa website tetap berfungsi dan tidak
  meninggalkan route orphaned.

Slice ini tidak mengaktifkan `RETAIL_CART_ENABLED`, `RETAIL_CHECKOUT_ENABLED`,
`RETAIL_PAYMENT_ENABLED`, atau `RETAIL_ADMIN_ENABLED` (lihat candidate 2026-07-16 §11).

## 9. Migration dan Compatibility

- Tidak ada destructive migration. Slice read-only tidak mengubah schema.
- Existing catalog, material, inventory, order, auth, dan admin flows tetap backward
  compatible dan regression checks wajib tetap green.
- Bila read-only public endpoint baru diperlukan, endpoint dibuat additive dan tidak
  mengubah endpoint yang sudah ada.

## 10. Testing dan Acceptance

### Backend

- Discovery projection hanya mengembalikan retail-eligible, active-publication,
  fixed-price, ready-stock variants.
- Customer-safe projection tests: memastikan cost, margin, supplier, profit, planned
  demand, internal stock counts, dan internal notes tidak pernah muncul.
- Inactive/unpublished/ineligible items tidak muncul pada discovery.
- Endpoint bersifat read-only; tidak ada write path yang ditambahkan.
- Existing catalog/inventory/auth/admin compatibility tests tetap green.

### Customer experience

- List dan detail menangani loading, empty, not-found, dan availability states.
- Tidak ada cart/checkout/payment control yang muncul pada slice ini.
- Retail/B2B discovery dapat diuji tanpa mengasersi deferred labels, placement, order,
  atau visual treatment.

### Acceptance criteria untuk candidate

- Candidate tetap **not approved for implementation**.
- Public dapat menelusuri retail-eligible produk dan melihat safe price/ETA dari
  authoritative server response.
- Tidak ada mutation, reservation, cart, checkout, atau payment yang diperkenalkan.
- Customer-data boundary dipertahankan penuh.
- Retail tetap secondary-but-discoverable dan tetap satu website/identitas dengan B2B.
- Surface topology tetap deferred ke ADR-004.

## 11. Deferred Decisions

Slice ini tidak menyelesaikan, dan tidak boleh dianggap menyelesaikan:

- surface topology (route/subdomain/app) — ADR-004;
- Retail/B2B navigation labels, placement, dan visual switch treatment;
- catalog information architecture dan kategori taxonomy final;
- cart, checkout, reservation, payment, fulfillment, tax, refund/return policy —
  candidate 2026-07-16 dan ADR-003;
- provider selection, production storage readiness, production readiness, dan go-live;
- protected-scope implementation permission.

Tidak ada open item yang diselesaikan secara diam-diam oleh candidate ini.

## 12. Boundary untuk Implementation Plan Berikutnya

Setelah spec ini disetujui stakeholder, implementation plan wajib memiliki exact file
scope, dependency, acceptance criteria, test commands, migration boundary (read-only),
rollback procedure, feature flag, commit boundary, dan regression checks. Plan belum
dibuat dalam pass ini.

Status remains **Technical Design Candidate — not approved for implementation**.
