# Niuva MVP Clickable Customer/Operator Prototype

Status: **prototype validation artifact**
Tanggal: 31 Juli 2026
Authority: route contract pada `DEC-UX-003` dan kebijakan canonical terkait
Scope: customer dan operator journey
Di luar scope: application implementation, backend integration, migration, provider activation, production-readiness, go-live, commit, dan push

## Tujuan

Prototipe ini membuat route MVP dapat diklik dan diuji sebelum implementasi aplikasi. Ia memvalidasi:

- Unified Homepage dengan narasi B2B-primary dan jalur Retail sekunder;
- Ready Product dan Custom 3D Print dalam satu katalog;
- konfigurasi sederhana/detail, upload, slicing, automatic pricing, dan `quote_required`;
- login wajib sebelum checkout;
- Assisted Retail Request dan Assisted Retail Offer;
- reservasi checkout 30 menit, stale data, expiry, dan recovery;
- order tracking dengan milestone customer-safe;
- workspace operator non-IT untuk konten, katalog/stok, request/offer, order/produksi, dan after-sales;
- konflik data, kegagalan notifikasi, dan pemisahan approval dari eksekusi Finance.

Semua identitas, harga produk ready, ongkir, ETA, file, dan transaksi adalah
data simulasi. State non-sensitif disimpan hanya di `sessionStorage` tab browser
agar refresh/deep link dapat diuji; tidak ada data yang dikirim ke server.

## Menjalankan prototipe

Prasyarat: Node.js. Tidak perlu instalasi dependency.

```powershell
Set-Location "C:\Portfolio\Niuva\Niuva-main-latest\docs\implementation\prototypes\2026-07-31-niuva-mvp-clickable-prototype"
node server.js
```

Buka `http://127.0.0.1:4177/` untuk **Participant Mode**.

Moderator membuka `http://127.0.0.1:4177/?mode=moderator`. Panel skenario,
surface switch, route classification, dan reset sesi hanya tampil dalam mode
ini.

Server memberikan SPA fallback, sehingga route seperti `/orders/NV-DEMO-014` dan `/admin/retail-orders/NV-DEMO-014` dapat dibuka langsung. Port dapat diubah dengan environment variable `NIUVA_PROTOTYPE_PORT`.

## Cara meninjau

1. Buka URL dengan `?mode=moderator`.
2. Pilih fixture melalui **Panel moderator**.
3. Tekan **Buka Participant Mode** sebelum menyerahkan kontrol kepada peserta.
4. Dalam Panel Moderator, gunakan surface switch untuk berpindah antara
   customer dan operator.
5. Badge route hanya tersedia untuk moderator:
   - **Route canonical**: route sudah menjadi kontrak canonical.
   - **Route candidate**: kebutuhan UX dapat diuji, tetapi exact path belum dipromosikan.
   - **Legacy · read-only**: route compatibility tanpa mutasi.
6. Uji pada desktop dan lebar 390 px.
7. Uji keyboard mulai dari skip link, menu, form, hingga aksi utama.

## Route yang dicakup

### Customer

| Area | Route |
| --- | --- |
| Public | `/`, `/about`, `/capabilities`, `/projects`, `/contact` |
| Retail catalog | `/retail` |
| Ready Product | `/retail/products/ready-keychain` |
| Custom 3D Print | `/retail/products/custom-fdm` |
| Configurator | `/retail/products/custom-fdm/configure` |
| Account | `/login`, `/register`, `/dashboard`, `/dashboard/notifications` |
| Checkout | `/retail/checkout` |
| Assisted Retail | `/retail/requests/REQ-DEMO-01`, `/retail/offers/OFF-DEMO-01` |
| Tracking | `/orders/NV-DEMO-014` |

Prototype mensimulasikan compatibility redirect `/services` →
`/capabilities` dan `/portfolio` → `/projects` melalui client-side
`replaceState`. Mekanisme HTTP redirect produksi tetap di luar scope.

Candidate UX routes yang diberi label eksplisit:

- `/retail/cart`
- `/orders/NV-DEMO-014/file-revision`
- `/orders/NV-DEMO-014/cancellation`
- `/orders/NV-DEMO-014/complaints/new`
- `/orders/NV-DEMO-014/complaints/CASE-DEMO-01`

### Operator

| Area | Route |
| --- | --- |
| Next actions | `/admin` |
| Content/portfolio | `/admin/content` |
| Catalog, pricing, stok | `/admin/catalog` |
| Request queue/detail | `/admin/retail-requests`, `/admin/retail-requests/REQ-DEMO-01` |
| Order queue/detail | `/admin/retail-orders`, `/admin/retail-orders/NV-DEMO-014` |
| After-sales queue/detail | `/admin/retail-cases`, `/admin/retail-cases/CASE-DEMO-01` |
| Legacy compatibility | `/admin/orders` |

## Design direction

Nama aesthetic: **Technical Editorial Utility**.

Differentiation anchor: **layer rail**—bahasa visual lapisan FDM yang digunakan pada konfigurasi, status, dan next action. Customer surface memakai komposisi editorial yang ramah; operator surface memakai kepadatan informasi yang tenang, status-led, role-aware, dan auditable.

Design system:

- Poppins untuk display/UI dan Inter untuk body/form/operational, dengan
  fallback lokal;
- approved lowercase `ni` mark disalin byte-identik dari
  `frontend/public/niuva-mark.svg`;
- semantic palette Niuva: midnight, steel, smoke, silver, frost, cloud, dan brand blue;
- tanpa gradient, glass, neon, generic marketplace composition, pseudo-terminal, atau KPI grid generik;
- target interaksi minimum 44 px, visible focus, skip link, semantic landmarks, `aria-live`, dan reduced-motion support.

DFII:

| Faktor | Nilai |
| --- | ---: |
| Impact | 4 |
| Fit | 5 |
| Feasibility | 4 |
| Performance | 5 |
| Risk | 4 |
| **Total: I + F + F + P - R** | **14/15** |

## Batas artefak

- State mock non-sensitif berada di `sessionStorage` tab browser. Gunakan
  **Reset state sesi** dari Panel Moderator untuk kembali ke fixture awal.
- Nama/isi file bukti tidak disimpan; prototype hanya menyimpan jumlah file
  yang dipilih selama sesi.
- Upload dan slicing adalah simulasi; tidak ada file yang dibaca.
- Pembayaran dan logistik tetap provider-neutral.
- Email/notifikasi tidak dikirim.
- Tidak ada backend authorization; halaman hanya mendemonstrasikan UX fail-closed.
- Harga/ETA/stock pada layar tidak boleh digunakan sebagai penawaran bisnis.
- Prototipe dan validation report bukan bukti bahwa aplikasi telah diimplementasikan atau siap production.

Hasil validasi aktual tercatat di [VALIDATION_REPORT.md](./VALIDATION_REPORT.md).

Moderated human review menggunakan:

- [EXPERT_UX_UI_VISUAL_REVIEW.md](./EXPERT_UX_UI_VISUAL_REVIEW.md)
- [FORMAL_EXPERT_CRITIQUE_RERUN.md](./FORMAL_EXPERT_CRITIQUE_RERUN.md)
- [FORMAL_EXPERT_CRITIQUE_RERUN_2.md](./FORMAL_EXPERT_CRITIQUE_RERUN_2.md)
- [FORMAL_EXPERT_CRITIQUE_RERUN_5.md](./FORMAL_EXPERT_CRITIQUE_RERUN_5.md)
- [FOCUSED_BROWSER_REVALIDATION_R6.md](./FOCUSED_BROWSER_REVALIDATION_R6.md)
- [MODERATED_USABILITY_REVIEW_PLAN.md](./MODERATED_USABILITY_REVIEW_PLAN.md)
- [MODERATED_USABILITY_RESULTS.md](./MODERATED_USABILITY_RESULTS.md)

Review kit sudah disiapkan. Historical Round 5 PASS di-invalidasi saat
pre-publication review menemukan clean direct-entry Order ID mismatch yang
belum diuji dan evidence recording yang tidak tersedia di artifact repository.
Focused browser revalidation R6 untuk fix tersebut lulus, tetapi sesi peserta
tetap **NOT READY TO RUN** sampai formal expert critique penuh dijalankan ulang
dan lulus. Results serta route recommendation tetap `INSUFFICIENT_EVIDENCE`.
