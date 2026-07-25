# Technical Console Rollout vs DEC-OPS-001 — Conflict Escalation

Tanggal: 25 Juli 2026
Status: **Context Only — Escalation, Pending Owner Decision**
Scope: Melaporkan konflik antara commit yang sudah dibuat di branch
`feat/admin-cms-redesign` (Fase A-D, "Technical Console" visual direction) dengan
`DEC-OPS-001-admin-studio-operational-direction.md` (Approved Decision). Dokumen ini
**tidak mengubah source apa pun** dan tidak mengeksekusi remediasi apa pun — ini adalah
laporan temuan untuk keputusan pemilik `DEC-OPS-001`.

Canonical authority yang dilanggar:
- `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md` (Approved Decision, 23 Juli 2026)
- `docs/implementation/plans/pending-reconciliation/2026-07-24-frontend-token-monospace-guardrail-remediation.md` (Context Only — Pending Separate Implementation Approval)

## 1. Ringkasan Temuan

Pada sesi kerja 25-26 Juli 2026, atas permintaan eksplisit pengguna untuk "audit Dashboard
CMS/Back Office" diikuti arahan "sebarkan Technical Console ke semua halaman", 5 commit
dibuat di branch `feat/admin-cms-redesign` yang menerapkan gaya visual "Industrial
Utilitarian / Technical Console" — font mono-uppercase-tracking untuk header kolom tabel,
label grup navigasi, dan counter total — ke seluruh 19 halaman Admin Studio.

Setelah commit selesai, pengguna mengajukan permintaan tidak terkait ("saya ingin
mengganti font JetBrains Mono, kombinasinya dengan Poppins terasa aneh"). Saat menyelidiki
konteks font sebelum eksekusi, ditemukan `DEC-OPS-001` (disetujui 23 Juli 2026, **sebelum**
commit-commit ini dibuat) secara eksplisit melarang pola yang baru diterapkan.

**Tidak ada permintaan pengguna yang salah** — instruksi "audit lalu sebarkan Technical
Console" dieksekusi sesuai arahan. Namun eksekusinya tidak melakukan pengecekan silang ke
`DEC-OPS-001` sebelum commit, sehingga hasilnya melanggar guardrail yang sudah disetujui.

## 2. Commit yang Terdampak

Branch: `feat/admin-cms-redesign` (belum di-merge ke `main`; sudah di-push ke
`origin/feat/admin-cms-redesign` sebelum konflik ini ditemukan).

| Commit | Tanggal | Isi |
|---|---|---|
| `1df0355` | 26 Jul 2026 | Dashboard Phase 4 — Technical Console direction (StatCard hero, aksen status, mono eyebrow) |
| `a8c4e1a` | 26 Jul 2026 | Fase A — `table.jsx` TableHead sans → mono uppercase tracking (global, 11 halaman); ekstrak `StatCard` |
| `d8e10f4` | 26 Jul 2026 | Fase B — mono tabular-nums untuk sel metrik/tabel (Inventory, Materials, StockMovements, RestockAlerts, Notifications, Catalog, ContentEditor) |
| `2cef8e4` | 26 Jul 2026 | Fase C (1/2) — Organizations & PortfolioAdmin card grid: aksen kiri status |
| `8186535` | 26 Jul 2026 | Fase C (2/2) — counter "Total: X" jadi `TechnicalLabel` mono tabular (Users, Internships, Contacts, AuditLog, Orders) |
| `a3726b5` | 26 Jul 2026 | Fase D — label grup navigasi sidebar (Overview/Commerce/dst) → mono |

## 3. Ketentuan `DEC-OPS-001` yang Dilanggar

Kutipan langsung dari `DEC-OPS-001` baris 46-65:

> "Pseudo-terminal decoration is not an Admin Studio design direction... Monospace use
> does not convert ordinary labels, explanations, navigation, metrics, or empty states
> into simulated terminal output."

Monospace hanya diizinkan untuk "genuine technical data" (SKU, order number, revision,
timestamp, operation ID, status code, audit identifier) — baris 55-63.

## 4. Pemetaan Pelanggaran per Commit

| Commit | Elemen yang di-mono-kan | Kategori menurut `DEC-OPS-001` | Melanggar? |
|---|---|---|---|
| `a8c4e1a` | Semua `TableHead` (header kolom: "Nama", "Status", "Tanggal", dst) di 11 halaman | Label biasa (`ordinary labels`) | **Ya** |
| `1df0355`, `a8c4e1a` | Label eyebrow `StatCard` ("Total Orders", "In Process", dst) | Label metrik (`metrics`) | **Ya** |
| `d8e10f4` | Angka `tabular-nums` pada quantity/harga/reorder-point/lead-time | Data numerik operasional (bukan ID/SKU/timestamp) | **Perlu klasifikasi** — `DEC-OPS-001` tidak menyebut angka kuantitas secara eksplisit; existing `font-mono` untuk order number/SKU/timestamp (sudah ada sebelum sesi ini) jelas diizinkan, tapi quantity/harga di Inventory/Materials bukan identifier |
| `2cef8e4` | Aksen kiri warna status pada card Organizations/PortfolioAdmin | Bukan monospace — indikator visual warna | Tidak melanggar teks `DEC-OPS-001`, tapi berdekatan dengan "decorative status dots without informational meaning" (baris 53) — perlu penilaian karena warna di sini memang informational (status org/featured) |
| `8186535` | Counter "Total: X" jadi mono | Metrik (`metrics`) | **Ya** |
| `a3726b5` | Label grup navigasi sidebar ("Overview", "Commerce", dst) | Navigasi (`navigation`) | **Ya**, paling eksplisit — `DEC-OPS-001` menyebut "navigation" secara harfiah |

## 5. Yang Tidak Terdampak (Existing, Sebelum Sesi Ini)

Pemakaian `font-mono` untuk order number, SKU, ID, timestamp, dan reason code yang sudah
ada **sebelum** sesi Fase A-D (dari fase polish sebelumnya, commit `fdc838f` dst.) **sesuai**
dengan `DEC-OPS-001` — itu genuine technical data. Dokumen ini tidak meminta perubahan pada
pemakaian tersebut.

## 6. Opsi yang Tersedia (Belum Dieksekusi)

Sesuai arahan pengguna, opsi ini **ditunda untuk eskalasi**, bukan dieksekusi:

1. **Revert pola mono-dekoratif** — kembalikan `TableHead`, label eyebrow `StatCard`,
   counter total, dan label navigasi ke Poppins/sans (role tipografi yang sudah ada di
   `DESIGN.md`). Genuine technical data (SKU, order number, timestamp) dipertahankan mono.
   Ini paling sejalan dengan `DEC-OPS-001` tanpa perlu keputusan baru.
2. **Ajukan amandemen `DEC-OPS-001`** — bila pemilik keputusan menilai gaya "Technical
   Console" sebagai arah yang diinginkan meski bertentangan dengan teks saat ini, perlu
   keputusan baru yang men-supersede bagian terkait `DEC-OPS-001`.
3. **Revert sebagian** — pertahankan aksen warna status (Fase C, tidak melanggar teks),
   revert murni elemen mono-dekoratif (Fase A, B sebagian, D).

Dokumen ini tidak merekomendasikan salah satu secara final — itu keputusan pemilik
`DEC-OPS-001`, konsisten dengan pola eskalasi yang sudah dipakai di
`2026-07-24-frontend-token-monospace-guardrail-remediation.md` §9.

## 7. Non-Otorisasi

Dokumen ini tidak mengubah source, tidak melakukan revert, tidak melakukan commit baru,
dan tidak mengubah branch `feat/admin-cms-redesign` yang sudah di-push. Status branch dan
kelima commit di atas dibiarkan seperti apa adanya sampai ada keputusan eksplisit dari
pemilik `DEC-OPS-001`.

## 8. Referensi

- `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md`
- `docs/implementation/plans/pending-reconciliation/2026-07-23-admin-studio-operational-remediation.md`
- `docs/implementation/plans/pending-reconciliation/2026-07-24-frontend-token-monospace-guardrail-remediation.md`
- `docs/context/DOCUMENT_REGISTER.md`
- Branch: `feat/admin-cms-redesign`, commit `a8c4e1a`..`a3726b5`
