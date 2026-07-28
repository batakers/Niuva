# Admin Studio Content Editor & Existing-Module Audit — Implementation Plan

Tanggal: 25 Juli 2026
Status: **Completed Execution Record — Implemented — Browser/Production Rollout Not Evidenced**
Scope: (1) Audit modul Admin Studio yang sudah ada (Inventory, Stock Movements, Orders,
Audit Log) untuk gap fungsional; (2) rencana desain content editor untuk konten marketing
yang saat ini hardcoded (About/Capabilities/FAQ/CTA/Contact). Tidak ada source code yang
diubah oleh dokumen ini.
Canonical authority:
- `docs/NIUVA_MASTER_SPEC.md` §10 (CMS Rules), §17 (Implementation Boundaries)
- `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md` (Approved Decision)
- `docs/implementation/plans/pending-reconciliation/2026-07-23-admin-studio-operational-remediation.md` (Bounded Scope, belum authorize implementasi)
Sumber temuan: audit page-inventory read-only, 24-25 Juli 2026.

Implementation reconciliation: 27 July 2026. Structured CMS source and tests
now cover draft/review/preview/scheduled/published/archived transitions,
permission-aware publishing, validation, public projection, versions, rollback,
and archive. Statements below that describe missing code or pending approval
are retained as planning-time history.

Dokumen ini adalah rencana. `NIUVA_MASTER_SPEC.md` baris 426 menegaskan "Approval of
this Master Specification does not automatically authorize implementation." Dokumen ini
menyediakan rencana untuk ditinjau, bukan mengeksekusinya.

## Addendum (25 Juli 2026) — Keputusan Baru Setelah Sinkronisasi Repo

PR #40 (merged 24 Juli 2026) menambahkan `docs/decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md`
(Approved Decision) yang menyatakan model tiga-role (`super_admin`/`operations`/
`commercial_finance`) yang dipakai sebagai acuan permission di §B.5 dokumen ini **bukan
model final yang disetujui** — model granular (Content Editor, Catalog Manager, Warehouse,
dst, sesuai `NIUVA_MASTER_SPEC.md`) tetap kanonik, dan migrasi permission akan menyusul
lewat rencana terpisah yang direview.

Dampak ke rencana ini: permission `content.read`/`content.write` yang direferensikan di
§B.6 tetap dapat dipakai untuk implementasi saat ini (kedua permission tersebut sudah ada
di grant `operations` dan tidak dicabut oleh PR #42), namun mapping role-ke-permission
untuk content editor perlu ditinjau ulang saat migrasi ke role granular berlangsung.
Tidak ada perubahan pada desain content type atau lifecycle di dokumen ini.

## 1. Bagian A — Audit Modul yang Sudah Ada

Permintaan awal menyebut kebutuhan "manajemen stok" dan "histori pembayaran/penjualan".
Audit ini mengonfirmasi kedua area **sudah terimplementasi dan berfungsi**, dengan gap
yang tercatat di bawah.

### A.1 Manajemen Stok — Sudah Berfungsi

| Fitur | Status | Bukti |
|---|---|---|
| Lihat balance stok (on hand/reserved/available/incoming/projected) | Ada | `Inventory.jsx:114-130`, `inventory_routes.py:93` |
| Operasi stok (receive/adjustment/reserve) dengan alasan wajib | Ada | `Inventory.jsx:166-191`, `inventory_routes.py:128` |
| Reservasi aktif + release/consume | Ada | `Inventory.jsx:133-157`, `inventory_routes.py:174-213` |
| Histori pergerakan stok (immutable ledger) dengan filter | Ada | `StockMovements.jsx`, `inventory_routes.py:111` |
| Restock alerts + resolve | Ada | `RestockAlerts.jsx`, `inventory_routes.py:213-225` |
| Manajemen bahan (material) + versi harga | Ada | `Materials.jsx`, `material_routes.py:316-413` |

**Gap ditemukan:** Tidak ada fungsi **export** (CSV/Excel) untuk balance stok atau histori
pergerakan. Filter saat ini hanya tampil di UI, tidak bisa diunduh untuk laporan eksternal
(mis. rekonsiliasi bulanan, laporan ke pihak lain). Verifikasi: grep `export|csv|xlsx` di
seluruh `backend/*.py` dan `frontend/src/pages/admin/*.jsx` — nihil hasil.

### A.2 Histori Pembayaran & Penjualan — Sudah Berfungsi

| Fitur | Status | Bukti |
|---|---|---|
| Daftar semua order + filter status | Ada | `Orders.jsx:33-90`, `server.py:483-489` |
| Set estimasi harga + kirim notifikasi email | Ada | `Orders.jsx:164-192`, `server.py:492-521` |
| Verifikasi bukti pembayaran (upload proof, preview, verify) | Ada | `Orders.jsx:194-213`, `server.py:524-547` |
| Update status order + histori status (`status_history`) | Ada | `Orders.jsx:215-223`, `server.py:550+` |
| Audit trail aktivitas staff (siapa, kapan, aksi, before/after) | Ada | `AuditLog.jsx`, `identity_routes.py:225` |

**Gap ditemukan:**
1. Tidak ada **laporan agregat** (total penjualan per periode, breakdown per status,
   grafik tren). `AdminDashboard.jsx` hanya menampilkan angka total instan (`stats[k]`,
   `server.py:744`), bukan laporan historis per rentang tanggal.
2. Tidak ada **export order/transaksi** ke CSV/Excel untuk kebutuhan akuntansi/pajak.
3. Tidak ada tampilan **riwayat pembayaran per pelanggan** yang terpisah dari halaman
   order individual (mis. total belanja lifetime seorang customer).

### A.3 Kesimpulan Bagian A

Fungsi inti (baca, ubah, verifikasi, audit) untuk stok dan pembayaran sudah solid dan
tidak perlu dibangun ulang. Gap yang teridentifikasi adalah **kemampuan pelaporan**
(export dan agregasi), bukan kekurangan CRUD dasar. Ini dicatat sebagai kandidat scope
terpisah (§5), bukan bagian dari content editor di Bagian B.

## 2. Bagian B — Content Editor untuk Konten Marketing

### B.1 Gap yang Dikonfirmasi

Konten di halaman publik (Home, About, Capabilities, Contact) berasal dari objek
JavaScript statis `profileContent` (`components/brand/CompanyProfileBlocks.jsx:9-148`) —
mencakup `intro`, `services` (4 kapabilitas dengan title/body/output/targetUsers/cta),
`goals`, `contact`, dan `projects`. Data ini **hanya bisa diubah lewat edit kode + deploy
ulang**. Tidak ada tabel `content_blocks` atau sejenisnya di backend.

Sebagai perbandingan, `Portfolio` **sudah** punya CMS penuh (`PortfolioAdmin.jsx` +
`GET/POST/PUT/DELETE /admin/portfolio`), dan `ProjectsPage.jsx:30-64` sudah mekanisme
menggabungkan data statis dengan data CMS (`apiProjects`) — pola ini menjadi referensi
migrasi untuk content type lain.

### B.2 Batas Scope (Sesuai `NIUVA_MASTER_SPEC.md` §10, §17)

**Termasuk dalam scope rencana ini:**
- Content type: **About**, **Capabilities** (4 kapabilitas), **FAQ** (baru), **CTA blocks**
  (label/title/body yang berulang di `CTASection`), **Contact info** (`profileContent.contact`).
- Structured fields per content type (bukan free-form rich text/page builder — sesuai
  `NIUVA_MASTER_SPEC.md:278` "not a free-form page builder").
- Lifecycle penuh: `draft → review → preview → published/scheduled → archived`, version
  history, rollback yang auditable, validasi field wajib sebelum publish
  (`NIUVA_MASTER_SPEC.md:280-298`).

**Tidak termasuk (diblokir terpisah):**
- **Homepage fields** — `NIUVA_MASTER_SPEC.md:298`: "Homepage schema may be designed only
  from the recorded Unified Homepage decision and still requires explicit implementation
  authorization." Homepage punya proses approval sendiri, di luar rencana ini.
- **SEO fields** — disebut di `FR-CMS-03` tapi belum ada bukti kebutuhan konkret di kode
  saat ini (tidak ada meta-tag management terpusat selain hardcoded per-route di
  `Layout.jsx:13-51`). Dicatat sebagai kandidat lanjutan, bukan bagian rencana awal ini.
- Redesign Admin Studio dashboard/navigasi di luar modul content editor baru
  (`DEC-OPS-001` butuh "dedicated audit and implementation plan" terpisah untuk Dashboard).

### B.3 Desain Model Data

Koleksi baru `content_blocks`:

```
{
  "id": "<uuid>",
  "content_type": "about | capability | faq | cta | contact",
  "slug": "<identifier unik per instance, mis. 'capability-rnd'>",
  "status": "draft | review | preview | published | scheduled | archived",
  "fields": { <structured fields sesuai content_type, lihat B.4> },
  "scheduled_at": "<ISO atau null>",
  "version": <int>,
  "published_version_id": "<id versi yang sedang live, atau null>",
  "created_by": "<user id>",
  "created_at": "<ISO>",
  "updated_at": "<ISO>"
}
```

Version history disimpan sebagai dokumen terpisah `content_block_versions` (snapshot
penuh `fields` + status pada setiap transisi), mengikuti pola commercial snapshot yang
sudah ada di order (`NIUVA_MASTER_SPEC.md:310` "store product, configuration, material,
price, and policy snapshots").

### B.4 Structured Fields per Content Type

| Content Type | Fields Wajib | Referensi Bentuk Data Saat Ini |
|---|---|---|
| About | `intro`, `dossierItems[]`, `approachSteps[]`, `values[]` | `AboutPage.jsx:19-66` |
| Capability | `title`, `body`, `output`, `targetUsers`, `cta`, `priority` (primary/supporting) | `profileContent.services[]` |
| FAQ | `question`, `answer`, `category`, `sort_order` | Baru — belum ada di kode |
| CTA block | `label`, `title`, `body`, `primaryActionLabel`, `primaryActionTarget` | `CTASection` props, `BrandSystem.jsx:294-306` |
| Contact | `location`, `email`, `whatsapp`, `whatsappHref`, `mapsHref` | `profileContent.contact` |

### B.5 Endpoint Backend (Rencana)

Mengikuti pola yang sudah ada di `catalog_routes.py` (`validate`/`publish`/`rollback`
untuk produk — `catalog_routes.py:251-283`):

- `GET /admin/content?type=<content_type>` — daftar per tipe.
- `POST /admin/content` — buat draft baru.
- `PUT /admin/content/{id}` — update draft.
- `POST /admin/content/{id}/validate` — cek field wajib sebelum publish.
- `POST /admin/content/{id}/publish` — publish (atau `scheduled_at` untuk terjadwal).
- `POST /admin/content/{id}/rollback` — kembali ke versi sebelumnya (tercatat di audit).
- `POST /admin/content/{id}/archive` — soft delete/archive, bukan hard-delete
  (`NIUVA_MASTER_SPEC.md:312`: "archived rather than hard-deleted").
- `GET /content?type=<content_type>` — endpoint publik read-only untuk versi published
  (dikonsumsi frontend, mengganti `profileContent` statis secara bertahap per tipe).

### B.6 Desain Frontend

- Halaman admin baru: `frontend/src/pages/admin/ContentEditor.jsx` (daftar per tipe +
  status badge) dan `frontend/src/pages/admin/ContentBlockEditor.jsx` (form + preview +
  tombol publish/schedule/rollback).
- Mengikuti `DEC-OPS-001`: role-aware (permission `content.write`/`content.read` — sudah
  ada di `ADMIN_ROUTE_PERMISSIONS["/admin/portfolio"] = "content.read"`, bisa diperluas),
  task-oriented, **tanpa** bahasa pseudo-terminal (`SYS_ADMIN_CONSOLE`, `MODULE_LOADED`,
  dll — dilarang eksplisit `DEC-OPS-001` baris 46-53).
- Marketing pages (`AboutPage.jsx`, `CapabilitiesPage.jsx`, dst) secara bertahap
  mengonsumsi `GET /content?type=...` mengikuti pola `ProjectsPage.jsx:26-64` yang sudah
  menggabungkan data statis dengan data API — migrasi tidak sekaligus, per content type.

## 3. Rute & Komponen Terdampak (identifikasi, bukan eksekusi)

| Jenis | Lokasi | Perubahan |
|---|---|---|
| Baru | Backend: koleksi `content_blocks`, `content_block_versions` | Model + migrasi |
| Baru | Backend: 8 endpoint di atas (§B.5) | CRUD + lifecycle |
| Baru | `frontend/src/pages/admin/ContentEditor.jsx`, `ContentBlockEditor.jsx` | UI admin |
| Diubah | `frontend/src/App.js` | Route `/admin/content`, `/admin/content/:id` |
| Diubah | `frontend/src/lib/permissions.js` | Permission mapping untuk route baru |
| Diubah (bertahap) | `AboutPage.jsx`, `CapabilitiesPage.jsx`, `ContactPage.jsx` | Konsumsi `GET /content` mengikuti pola `ProjectsPage.jsx` |
| Baru | Test | Validasi field wajib, publish-blocked saat invalid, rollback, audit trail |

## 4. Dampak Privasi & Keamanan

- Endpoint admin (`POST/PUT/.../content/*`) memerlukan `require_permission` seperti modul
  lain (`catalog_routes.py` pola yang sama) — tidak ada exception.
- Endpoint publik `GET /content` hanya mengekspos versi `published`, tidak pernah `draft`
  atau `review` — mencegah kebocoran konten belum final.
- Rollback dan publish tercatat di audit log yang sudah ada (`identity_routes.py:225`),
  konsisten dengan modul lain.

## 5. Kandidat Scope Terpisah (Tidak Termasuk Rencana Ini)

Dari Bagian A, dua gap berikut layak jadi rencana tersendiri bila dibutuhkan:
1. **Export/laporan** (CSV/Excel) untuk stok, movement, dan order — kebutuhan operasional
   berbeda dari content editor, dan menyentuh modul yang sudah stabil.
2. **Dashboard laporan agregat** (tren penjualan per periode) — `DEC-OPS-001` baris 75
   secara eksplisit menyatakan "Admin Dashboard requires a dedicated audit and
   implementation plan before source changes are authorized," jadi ini butuh rencana
   terpisah, bukan digabung ke content editor.

## 6. Acceptance & Verifikasi (saat diotorisasi)

- `npx craco build` dan `pytest` tetap hijau.
- Publishing diblokir saat field wajib kosong (diuji per content type).
- Endpoint publik tidak pernah mengembalikan versi `draft`/`review` (diuji lewat test).
- Rollback mengembalikan `fields` ke snapshot versi sebelumnya secara tepat, tercatat di
  audit log dengan actor dan waktu.
- Tidak ada perubahan pada Homepage, backend authorization boundary, atau role model di
  luar permission baru yang eksplisit ditambahkan.

## 7. Rollback

Karena belum ada kode yang dibuat, rollback saat ini = tidak melakukan apa-apa. Bila
nanti diimplementasi lalu perlu dibatalkan: hapus 2 halaman frontend, 8 endpoint backend,
dan 2 koleksi baru. Migrasi bertahap dari `profileContent` ke API tidak menghapus data
statis existing — file `CompanyProfileBlocks.jsx` dapat dipertahankan sebagai fallback
selama transisi.

## 8. Keputusan yang Masih Dibutuhkan Sebelum Eksekusi

- Approval implementasi eksplisit untuk Bagian B (content editor), terlepas dari status
  "Approved Baseline" konsep CMS di `NIUVA_MASTER_SPEC.md:387` — approval baseline tidak
  sama dengan approval implementasi (`NIUVA_MASTER_SPEC.md:426`).
- Konfirmasi apakah SEO fields dan export/laporan (§5) perlu direncanakan sebagai
  lanjutan segera atau ditunda.
- Urutan migrasi content type: About dulu, Capabilities dulu, atau paralel — mempengaruhi
  urutan kerja bertahap di §B.6.

Catatan historis: bagian ini menggambarkan status sebelum implementation
authorization dan source changes. Status faktual terbaru tercatat pada header
dan reconciliation note di atas.
