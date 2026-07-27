# Reporting, Bulk Actions, Aggregate Dashboard & Admin Notifications — Implementation Plan

Tanggal: 25 Juli 2026
Status: **Completed Execution Record — Implemented — Production Rollout Not Evidenced**
Scope: Empat fitur backoffice yang diminta pemilik proyek dari hasil audit modul existing:
(1) Export/laporan CSV untuk stok & order, (2) manajemen notifikasi dari sisi admin,
(3) bulk action pada daftar order/produk, (4) dashboard agregat berbasis periode.
Tidak ada source code yang diubah oleh dokumen ini.
Canonical authority:
- `docs/NIUVA_MASTER_SPEC.md` §13 (Security and Data Boundaries), §17 (Implementation Boundaries)
- `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md` (Approved Decision — baris 75: "Admin Dashboard requires a dedicated audit and implementation plan before source changes are authorized")
- `docs/implementation/plans/pending-reconciliation/2026-07-25-admin-content-editor-and-module-audit-plan.md` (audit asal temuan gap ini, §5)
Sumber temuan: audit page-inventory read-only, 24-25 Juli 2026; permintaan eksplisit pemilik proyek, 25 Juli 2026.

Implementation reconciliation: 27 July 2026. CSV export, per-item bulk order
and catalog actions, admin-to-customer notifications, and role-aware aggregate
dashboard endpoints/UI are present with focused tests. Statements below that
say no source existed or approval was pending are retained as planning-time
history.

Dokumen ini adalah rencana. `NIUVA_MASTER_SPEC.md` baris 426 menegaskan persetujuan
dokumen spec tidak otomatis mengotorisasi implementasi. Rencana ini disusun untuk
ditinjau, bukan dieksekusi.

## Addendum (25 Juli 2026) — Keputusan Baru Setelah Sinkronisasi Repo

Repo lokal disinkronkan dengan PR #40, #41, #42 (merged 24 Juli 2026) setelah dokumen ini
ditulis. Dua keputusan baru relevan dengan rencana ini:

1. **`DEC-ACCESS-001`** (granular internal role boundary) — permission yang direferensikan
   di §2-5 (`inventory.read`, `orders.read`/`orders.write`, `catalog.archive`,
   `notifications.write`, `dashboard.read`) masih berlaku untuk role `operations`/
   `commercial_finance` saat ini (`permissions.py`, diverifikasi setelah pull). Namun
   `DEC-ACCESS-001` menyatakan model tiga-role ini bukan model final — migrasi ke role
   granular akan mengubah mapping ini lewat rencana terpisah yang direview. Endpoint yang
   direncanakan di §2-5 tidak perlu didesain ulang, tapi permission check saat implementasi
   perlu ditinjau ulang terhadap model role yang berlaku pada saat itu.
2. **`DEC-PAY-02`** (legacy manual transfer read-only) — relevan untuk Fitur 1 (Export CSV)
   karena export order menyertakan data pembayaran manual-transfer. `DEC-PAY-02` menyatakan
   data historis manual-transfer harus tetap **read-only** dan tidak boleh memicu aktivitas
   verifikasi baru. Export CSV di §2 bersifat read-only (tidak mengubah data), sehingga
   selaras dengan batasan ini tanpa perlu perubahan desain — dicatat sebagai konfirmasi,
   bukan revisi.

PR #41 (upgrade FastAPI/Starlette/Pydantic) tidak berdampak pada desain endpoint di
dokumen ini; diverifikasi lewat `pytest` (270 passed, 5 skipped) setelah sinkronisasi.

## 1. Kondisi Saat Ini (Verified)

- Tidak ada endpoint atau UI export (CSV/Excel) di backend maupun 17 halaman admin (grep `export|csv|xlsx` — nihil).
- `AdminDashboard.jsx:38-46` hanya menampilkan angka total instan (`GET /admin/stats`, `server.py:744-758`), tidak ada breakdown per periode waktu.
- Tidak ada bulk action (checkbox multi-select) di modul manapun (grep `bulk|checkbox|selectAll` — nihil).
- Koleksi `notifications` sudah ada dan dipakai sistem otomatis (estimasi harga, verifikasi pembayaran, restock alert — `server.py:421-429,508-519,539-546`; `inventory_service.py:579-598`), dan permission `notifications.write` sudah terdaftar untuk role `commercial_finance` (`permissions.py:93`). Namun **tidak ada endpoint atau UI untuk admin mengirim notifikasi manual**, hanya `GET /notifications` untuk customer membaca notifikasi miliknya sendiri (`server.py:761-763`).
- `recharts` sudah terpasang di frontend (`package.json:29`) — tidak perlu dependency baru untuk chart.

## 2. Fitur 1 — Export/Laporan CSV

### Batas Scope
- **Termasuk:** export CSV untuk (a) stock balance, (b) stock movement history, (c) daftar order dengan filter tanggal/status.
- **Tidak termasuk:** export Excel (`.xlsx`) dengan formatting — CSV cukup untuk kebutuhan impor ke Excel/Google Sheets tanpa dependency baru. Laporan finansial resmi (pajak/akuntansi) tetap perlu ditinjau oleh pihak yang berwenang sebelum dipakai sebagai dokumen resmi — export ini adalah data mentah, bukan dokumen berformat legal.

### Desain Backend
Endpoint baru, memakai `permission` yang sama dengan endpoint baca yang sudah ada (bukan permission baru):

- `GET /admin/inventory/balances/export?format=csv` — permission `inventory.read` (sama seperti `inventory_routes.py:93`).
- `GET /admin/inventory/movements/export?format=csv&subject_type=&date_from=&date_to=` — permission `inventory.read`.
- `GET /admin/orders/export?format=csv&status=&date_from=&date_to=` — permission `orders.read` (sama seperti `server.py:483-489`).

Response memakai `StreamingResponse` (FastAPI, sudah tersedia lewat dependency `fastapi` yang ada) dengan `Content-Type: text/csv` dan header `Content-Disposition: attachment`. Kolom CSV **menghormati batas customer-safe data** yang sudah berlaku di `serialize_admin_order_for()` (`server.py`) — tidak menambah kolom cost/margin/supplier yang sebelumnya tidak diekspos di endpoint JSON yang sama.

### Desain Frontend
- Tombol "Export CSV" di `StockMovements.jsx`, `Inventory.jsx`, dan `Orders.jsx` — memakai filter yang sedang aktif di UI (tidak export semua data tanpa filter secara default, mencegah file raksasa tak sengaja).
- Memakai util `downloadFile` yang sudah ada di `lib/api.js` sebagai pola unduh (dipakai `Orders.jsx:98-104` untuk file individual), diperluas untuk menerima response CSV.

### Dampak Privasi
- Kolom yang diekspor mengikuti aturan `NIUVA_MASTER_SPEC.md:341`: "Customer responses and views must exclude internal cost, margin, supplier, profit, and internal notes" — export tunduk aturan yang sama karena dikonsumsi staff internal, bukan customer, tapi tetap tidak menambah data sensitif yang sebelumnya tidak terekspos ke role tersebut.
- File hasil export tidak disimpan di server (streaming langsung ke response, tidak ditulis ke disk) — mengurangi risiko kebocoran file tertinggal.

## 3. Fitur 2 — Manajemen Notifikasi dari Sisi Admin

### Batas Scope
- **Termasuk:** admin (permission `notifications.write`, sudah ada di role `commercial_finance` — `permissions.py:93`) dapat mengirim notifikasi manual ke satu customer, sekelompok customer (mis. semua yang order aktif), atau broadcast semua customer.
- **Tidak termasuk:** template email marketing bergaya campaign, jadwal terkirim otomatis berulang (recurring), atau integrasi channel lain (SMS/push) — ini murni perluasan mekanisme `notifications` + `emailer.py` yang sudah ada.

### Desain Backend
- `POST /admin/notifications { target: "user" | "segment" | "broadcast", user_id?, segment?, subject, message }` — permission `notifications.write`.
  - `target: "user"` — kirim ke satu `user_id`.
  - `target: "segment"` — filter sederhana yang sudah bisa dipetakan dari data ada, mis. `segment: "active_orders"` (customer dengan order status `in_process`/`awaiting_payment`).
  - `target: "broadcast"` — semua `CUSTOMER_QUERY` (query yang sudah ada di `server.py:734-736`).
  - Insert ke `db.notifications` untuk setiap penerima (pola sama seperti `emailer.py:39-54`), dan panggil `emailer.send_email` per penerima.
- Rate-limit pengiriman broadcast (mis. batch 50 per detik) agar tidak membebani Resend API sekaligus — mengikuti pola `rate_limit()` yang sudah ada.
- `GET /admin/notifications/sent?limit=50` — riwayat notifikasi yang pernah dikirim admin, untuk transparansi (siapa kirim apa, kapan, ke siapa) — tercatat di audit log yang sudah ada.

### Desain Frontend
- Halaman baru `frontend/src/pages/admin/Notifications.jsx`: form kirim (pilih target, subjek, pesan) + tabel riwayat terkirim.
- Route `/admin/notifications`, permission `notifications.write` di `permissions.js`.

### Dampak Privasi
- Broadcast tidak boleh mengekspos daftar penerima ke pihak yang menerima (setiap customer hanya melihat pesan miliknya sendiri via `GET /notifications` yang sudah ada).
- Isi pesan disimpan di `notifications` collection — perlu ditinjau apakah perlu retensi/pembersihan berkala (di luar scope rencana ini, dicatat sebagai catatan lanjutan).

## 4. Fitur 3 — Bulk Action pada Daftar Order/Produk

### Batas Scope
- **Termasuk:** bulk action pada `Orders.jsx` (ubah status banyak order sekaligus, mis. tandai beberapa "in_process" bersamaan) dan `Catalog.jsx` (bulk archive produk).
- **Tidak termasuk:** bulk edit field lain (harga, deskripsi) sekaligus — bulk action dibatasi pada aksi yang **sudah ada** sebagai aksi tunggal (status update, archive), bukan menambah kapabilitas mutasi baru. Ini menjaga agar bulk action tidak membuka jalur mutasi yang belum divalidasi satu-per-satu.

### Desain Backend
- `POST /admin/orders/bulk-status { order_ids: [...], status, note }` — permission `orders.write`. Setiap order diproses lewat fungsi `update_status` yang sudah ada (dipanggil dalam loop), **bukan** query update massal langsung ke database — ini memastikan validasi transisi status dan `status_history` per order tetap konsisten dengan aksi tunggal yang sudah ada.
- `POST /admin/catalog/products/bulk-archive { product_ids: [...] }` — permission `catalog.archive`, memanggil fungsi archive yang sudah ada (`catalog_routes.py:283`) per produk.
- Response mengembalikan hasil per-item (`{id, success, error}[]`) — bila satu item gagal (mis. transisi status tidak valid), item lain tetap diproses; ini **bukan** operasi all-or-nothing/transactional, karena setiap order/produk independen satu sama lain (bukan cross-collection mutation yang butuh `NIUVA_MASTER_SPEC.md:345` transaction guarantee).

### Desain Frontend
- Checkbox di kolom pertama tabel `Orders.jsx` dan `Catalog.jsx`, dengan "select all" di header.
- Toolbar aksi massal muncul saat ≥1 item terpilih, menampilkan jumlah terpilih dan tombol aksi.
- Hasil per-item (sukses/gagal) ditampilkan sebagai ringkasan toast atau tabel kecil setelah aksi selesai — supaya admin tahu item mana yang gagal dan kenapa.

### Dampak Privasi & Keamanan
- Tidak ada permission baru — memakai permission yang sudah melekat pada aksi tunggal (`orders.write`, `catalog.archive`).
- Setiap item dalam bulk action tetap tercatat di audit log secara individual (bukan satu entri audit untuk seluruh batch) — menjaga traceability per `NIUVA_MASTER_SPEC.md` audit requirement.

## 5. Fitur 4 — Dashboard Agregat Berbasis Periode

### Batas Scope Sesuai `DEC-OPS-001`
`DEC-OPS-001` baris 75 dan §Constraints (baris 84) eksplisit:
- "Admin Dashboard requires a dedicated audit and implementation plan before source changes are authorized" — dipenuhi oleh rencana ini.
- "Do not invent KPI values, operational data, metrics, SLA, or analytics" — semua metrik di bawah **hanya agregasi dari data transaksi yang sudah ada** (order, movement), tidak ada angka yang dibuat-buat atau diasumsikan.
- "Do not give every role an identical dashboard and navigation by default" — breakdown di bawah disesuaikan relevansi per role (`operations` fokus produksi/stok, `commercial_finance` fokus penjualan/pembayaran).

### Desain Backend
- `GET /admin/stats/timeseries?metric=orders|revenue&period=daily|weekly|monthly&date_from=&date_to=` — permission `dashboard.read` (sama seperti `/admin/stats` — `server.py:744-746`).
  - `metric=orders`: hitung jumlah order per bucket waktu, dikelompokkan per `status`.
  - `metric=revenue`: sum `estimate.amount` untuk order dengan `payment.verified = true`, dikelompokkan per bucket waktu — **bukan** proyeksi atau estimasi fiktif, murni agregasi nilai yang sudah tercatat dan terverifikasi.
- Data historis diambil dari `orders.created_at`/`status_history` dan `stock_movements` yang sudah ada — tidak butuh koleksi baru, hanya query agregasi (`$group` MongoDB berdasarkan rentang tanggal).

### Desain Frontend
- `AdminDashboard.jsx` diperluas dengan grafik tren (memakai `recharts` yang sudah terpasang) di bawah kartu total yang sudah ada, bukan menggantikan kartu tersebut.
- Filter rentang tanggal (7 hari/30 hari/custom) untuk grafik.
- **Tidak** menambah kartu KPI baru yang tidak berbasis data nyata (mis. "customer satisfaction score" fiktif) — hanya metrik yang bisa dihitung langsung dari data transaksi yang ada.

### Dampak Keamanan
- Endpoint agregasi tidak mengekspos data individual customer (hanya angka agregat per bucket waktu), jadi tidak menambah risiko privasi baru dibanding `/admin/stats` yang sudah ada.

## 6. Rute & Komponen Terdampak (identifikasi, bukan eksekusi)

| Fitur | Jenis | Lokasi |
|---|---|---|
| Export CSV | Baru | Backend: 3 endpoint (`inventory_routes.py`, `server.py`) |
| Export CSV | Diubah | `StockMovements.jsx`, `Inventory.jsx`, `Orders.jsx` (tombol export) |
| Notifikasi admin | Baru | Backend: 2 endpoint (`server.py`) |
| Notifikasi admin | Baru | `frontend/src/pages/admin/Notifications.jsx` |
| Notifikasi admin | Diubah | `App.js` (route baru), `permissions.js` |
| Bulk action | Baru | Backend: 2 endpoint (`server.py`, `catalog_routes.py`) |
| Bulk action | Diubah | `Orders.jsx`, `Catalog.jsx` (checkbox + toolbar) |
| Dashboard agregat | Baru | Backend: 1 endpoint (`server.py`) |
| Dashboard agregat | Diubah | `AdminDashboard.jsx` (grafik + filter tanggal) |
| Test | Baru | Test per endpoint baru: export format, notifikasi target segment, bulk partial-failure, agregasi periode |

## 7. Urutan yang Disarankan

1. **Export CSV** — risiko paling rendah, tidak menambah permission baru, tidak mengubah data (read-only).
2. **Bulk action** — memakai fungsi mutasi yang sudah divalidasi, hanya menambah loop pemanggilan + UI multi-select.
3. **Notifikasi admin** — memakai infrastruktur `notifications`/`emailer` yang sudah ada, permission sudah terdaftar.
4. **Dashboard agregat** — paling kompleks karena harus dikonfirmasi metrik per role sesuai `DEC-OPS-001`, dan perlu keputusan `DEC-OPS-001` owner untuk komposisi per role sebelum eksekusi.

## 8. Acceptance & Verifikasi (saat diotorisasi)

- `npx craco build` dan `pytest` tetap hijau.
- Export CSV tidak pernah menyertakan kolom cost/margin/supplier/internal notes.
- Bulk action mencatat audit log per-item, bukan per-batch; item gagal tidak menghalangi item lain.
- Notifikasi broadcast tidak membocorkan daftar penerima ke penerima lain.
- Metrik dashboard agregat 100% berasal dari agregasi data transaksi nyata — diverifikasi tidak ada angka hardcoded/fiktif.
- Tidak ada permission baru yang dibuat di luar yang sudah terdaftar (`notifications.write`, `orders.write`, `catalog.archive`, `inventory.read`, `dashboard.read`).

## 9. Rollback

Karena belum ada kode yang dibuat, rollback saat ini = tidak melakukan apa-apa. Bila nanti
diimplementasi lalu perlu dibatalkan: setiap fitur adalah endpoint dan komponen UI mandiri
yang dapat dihapus tanpa memengaruhi fitur lain — tidak ada migrasi skema data yang mengubah
struktur `orders`, `users`, atau `inventory` yang sudah ada (semua fitur ini murni membaca/
mengagregasi data yang sudah ada, kecuali koleksi baru untuk riwayat notifikasi terkirim).

## 10. Keputusan yang Masih Dibutuhkan Sebelum Eksekusi

- Approval implementasi eksplisit untuk keempat fitur (dokumen spec/decision yang ada tidak otomatis mengotorisasi implementasi).
- Definisi `segment` notifikasi yang dianggap perlu di luar "active_orders" (mis. berdasarkan wilayah, jenis kebutuhan) — dicatat sebagai default minimal, bisa diperluas.
- Komposisi metrik dashboard per role (`operations` vs `commercial_finance`) perlu ditinjau pemilik `DEC-OPS-001` sebelum eksekusi, sesuai constraint "Do not give every role an identical dashboard."
- Threshold rate-limit final untuk pengiriman notifikasi broadcast.

Catatan historis: bagian ini menggambarkan status sebelum implementation
authorization dan source changes. Status faktual terbaru tercatat pada header
dan reconciliation note di atas.
