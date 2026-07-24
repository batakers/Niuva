# Batch C — Operational Copy De-terminalization Proposal

Tanggal: 24 Juli 2026
Status: **Context Only — Pending Separate Implementation Approval**
Scope: Proposal copy untuk mengganti bahasa pseudo-terminal pada 4 halaman operasional/customer dengan teks tenang bilingual, sesuai `DESIGN.md`. Ini proposal keputusan editorial; tidak ada source yang diubah.
Authority:
- `DESIGN.md` baris 59-64 (monospace bukan voice untuk copy/label/loading/empty), 107-117 (customer portals: calm semantic states), 127-133 (Admin Studio: no simulated terminal)
- `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md`
- Bagian dari plan induk: `docs/implementation/plans/pending-reconciliation/2026-07-24-frontend-token-monospace-guardrail-remediation.md` (Batch C)

## Konteks & Kenapa Ini Proposal, Bukan Swap Font

Berbeda dari Batch A (warna) dan Batch B (font halaman publik), Batch C bukan perubahan
mekanis. Gaya pseudo-terminal di halaman operasional adalah **copy**, bukan sekadar
font: `SYSTEM_ONLINE`, `[ FETCHING_DATA... ]`, `EXECUTE_TRANSMISSION`, `PHASE_01/04`,
numeral dekoratif raksasa. Menyelaraskannya ke `DESIGN.md` berarti:

1. Menulis ulang copy ke bahasa tenang dan jelas.
2. Menerjemahkan bilingual (ID/EN) via `t()` karena banyak string kini hard-coded.
3. Membedakan **data teknis asli** (dipertahankan) dari **dekorasi** (diganti).

Karena ini keputusan editorial pada surface gated DEC-OPS-001, proposal ini menyiapkan
setiap keputusan untuk ditinjau sebelum implementasi. `DESIGN.md` baris 61 menegaskan
monospace tetap sah untuk data teknis asli: SKU, order number, revision, timestamp,
operation ID, status code, audit identifier.

## Prinsip Klasifikasi

- **PERTAHANKAN (data teknis asli):** order number, order ID, filename, timestamp,
  ukuran file, material name. Boleh tetap `font-mono`.
- **GANTI (dekorasi/simulasi terminal):** label penjelas, loading/empty copy, tombol
  aksi, eyebrow bergaya terminal, numeral dekoratif, separator `//` gaya konsol.
- **AMBIGU (perlu keputusan Anda):** ditandai ⚠️ di tabel.

## Catatan i18n

String yang diganti dan bersifat teks UI perlu key `t()` baru (ID+EN) di `i18n.js`.
Kolom "Usulan ID" / "Usulan EN" di bawah adalah rancangan copy; key i18n aktual
disusun saat implementasi.

---

## 1. `pages/operational/ClientDashboard.jsx` (Customer portal)

| Baris | Sekarang | Klasifikasi | Usulan ID | Usulan EN |
|---|---|---|---|---|
| 31 | `USER_DASHBOARD // CLIENT_ID: {id}` | Ganti (label+separator) | Dasbor · ID: {id} | Dashboard · ID: {id} |
| 36 | `SYSTEM_ONLINE` | Ganti (dekorasi) | Hapus, atau "Aktif" | Remove, or "Online" |
| 42 | `WELCOME_BACK // {name}` | Ganti (customer messaging) | Selamat datang, {name} | Welcome back, {name} |
| 46 | `INITIATE_ORDER` | Ganti (tombol) | Buat Pesanan | New Order |
| 55 | `ORDER_REGISTRY // TOTAL: {n}` | Ganti (label) | Pesanan · {n} | Orders · {n} |
| 60 | `[ FETCHING_DATA... ]` | Ganti (loading) | Memuat… | Loading… |
| 65 | `NO_ACTIVE_ORDERS_FOUND` | Ganti (empty) | Belum ada pesanan | No orders yet |
| 68 | `CREATE_FIRST_ORDER` | Ganti (tombol) | Buat Pesanan Pertama | Create First Order |
| 77-81 | `Order_ID`, `Payload_Data`, `Timestamp`, `Status`, `Action` (header tabel) | Ganti (label) | ID Pesanan, Detail, Waktu, Status, Aksi | Order ID, Details, Date, Status, Action |
| 87 | `{o.order_number}` | **Pertahankan** (data teknis) | — | — |
| 91 | `{o.file?.original_filename}` | **Pertahankan** | — | — |
| 101 | `VIEW_DETAILS` | Ganti (tombol) | Lihat Detail | View Details |

Catatan: `t("dash.title")` (baris 41) sudah pakai i18n — biarkan.

## 2. `pages/operational/OrderDetail.jsx` (Customer portal)

| Baris | Sekarang | Klasifikasi | Usulan ID | Usulan EN |
|---|---|---|---|---|
| 58 | `[ RETRIEVING_DATA_FROM_SERVER... ]` | Ganti (loading) | Memuat pesanan… | Loading order… |
| 68 | `{t("common.back")} // DASHBOARD` | Ganti (separator) | ← Kembali ke Dasbor | ← Back to Dashboard |
| 77 | `ORDER_MANIFEST // ID: {id}` | Ganti (label) | Pesanan · ID: {id} | Order · ID: {id} |
| 84 | numeral raksasa `order_number.substring(4)` (opacity .03) | ⚠️ Dekorasi telemetri (DESIGN.md 89) | Hapus elemen dekoratif | Remove decorative element |
| 87 | `{order.order_number}` | **Pertahankan** | — | — |
| 95 | `PRODUCTION_STATUS` | Ganti (label) | Status Produksi | Production Status |
| 104 | `SYSTEM_NOTICE` | Ganti (label) | Informasi | Notice |
| 114 | `PAYLOAD_SPECIFICATIONS` | Ganti (label) | Spesifikasi | Specifications |
| 135 | `DATE_LOGGED` | Ganti (label) | Tanggal | Date |
| 151 | `COMMERCIAL_EVALUATION` | Ganti (label) | Estimasi Biaya | Cost Estimate |
| 193 | `{t("detail.proofUploaded")} // AWAITING_VERIFICATION` | Ganti (separator+copy) | …menunggu verifikasi | …awaiting verification |
| 200, 211 | `TRANSMITTING...`, `EXECUTE_ORDER` (via NewOrder) | Ganti (tombol) | lihat file NewOrder | see NewOrder |
| 219 | `SYSTEM_EVENT_LOG` | Ganti (label) | Riwayat | History |
| 122, 136, 235 | filename, timestamp | **Pertahankan** | — | — |

## 3. `pages/operational/NewOrder.jsx` (Customer portal)

| Baris | Sekarang | Klasifikasi | Usulan ID | Usulan EN |
|---|---|---|---|---|
| 29 | `"Hanya file STL atau OBJ"` (toast) | Ganti → t() (sudah ID, perlu EN) | Hanya file STL atau OBJ | Only STL or OBJ files |
| 30 | `"File melebihi 50MB"` (toast) | Ganti → t() | File melebihi 50MB | File exceeds 50MB |
| 35-38 | step id `UPLOAD_PAYLOAD`, `CONFIG_MATERIAL`, `ADD_DIRECTIVES`, `EXECUTE_TRANSMISSION` | Ganti (dekorasi) | Unggah, Material, Catatan, Kirim | Upload, Material, Notes, Submit |
| 72 | `ORDER_INITIALIZATION_ROUTINE` | Ganti (label) | Pesanan Baru | New Order |
| 76 | `SLA_24H_ACTIVE` | ⚠️ Ganti | Estimasi 1×24 jam | Est. within 24h |
| 99 | `STEP_0{n}` | Ganti (label) | Langkah {n} | Step {n} |
| 112 | numeral raksasa `0{step}` (opacity .10) | ⚠️ Dekorasi telemetri | Hapus elemen dekoratif | Remove decorative element |
| 129 | `SIZE: {x} MB // CLICK_TO_REPLACE` | Sebagian pertahankan | {x} MB · klik untuk ganti | {x} MB · click to replace |
| 140 | `FORMATS: STL_OBJ // MAX_SIZE: 50MB` | Ganti (hint) | Format STL atau OBJ · maks 50MB | STL or OBJ · max 50MB |
| 183 | `CONFIRM_PAYLOAD_DATA` | Ganti (label) | Konfirmasi Pesanan | Confirm Order |
| 186-188 | `PAYLOAD_FILE`, `MATERIAL_CONFIG`, `EXTRA_DIRECTIVES` | Ganti (label) | File, Material, Catatan | File, Material, Notes |
| 202 | `PHASE_0{step}/04` | Ganti (label) | Langkah {step}/4 | Step {step}/4 |
| 211 | `EXECUTE_ORDER` | Ganti (tombol) | Kirim Pesanan | Submit Order |

## 4. `pages/admin/AdminDashboard.jsx` (Admin Studio)

| Baris | Sekarang | Klasifikasi | Usulan ID | Usulan EN |
|---|---|---|---|---|
| 16 (subtitle) | `System Operations Hub` | ⚠️ Ganti | Ringkasan Operasional | Operations Overview |
| 18 | `[ FETCHING_TELEMETRY... ]` | Ganti (loading) | Memuat… | Loading… |
| 25 | `"Total Orders"` (hard-coded) | Ganti → t() | Total Pesanan | Total Orders |
| 45 | `METRIC_ID: {k}` | Ganti (dekorasi) | Hapus | Remove |

Catatan: label lain (baris 26-31) sudah pakai `t()` — biarkan.

---

## Ringkasan Keputusan yang Dibutuhkan

1. **Konfirmasi arah de-terminalization** untuk copy customer-facing (ClientDashboard,
   OrderDetail, NewOrder) dan Admin (AdminDashboard).
2. **Item ⚠️ ambigu:** numeral dekoratif raksasa (OrderDetail:84, NewOrder:112) — hapus
   atau pertahankan sebagai dekorasi non-telemetri? `SLA_24H_ACTIVE`/subtitle Admin —
   copy pengganti final?
3. **Approval copy ID+EN** per string di tabel (atau revisi Anda).
4. **Tanda tangan DEC-OPS-001** karena menyentuh surface operasional/Admin.

## Rencana Eksekusi Setelah Disetujui

- Tambah key `t()` (ID+EN) di `i18n.js` untuk semua string UI yang diganti.
- Ganti string per tabel; pertahankan `font-mono` hanya pada data teknis asli.
- Data-testid dan kontrak komponen tidak berubah.
- Verifikasi: `craco build` + `craco test` hijau; screenshot before/after per halaman.
- Pecah jadi PR per-halaman bila perlu untuk review yang mudah.

Tidak ada item yang diselesaikan diam-diam oleh proposal ini. Status tetap **Pending
Separate Implementation Approval**.
