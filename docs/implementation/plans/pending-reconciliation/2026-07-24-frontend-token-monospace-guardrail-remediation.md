# Frontend Token & Monospace Guardrail Remediation — Implementation Plan

Tanggal: 24 Juli 2026
Status: **Context Only — Pending Separate Implementation Approval**
Scope: Menyelaraskan penggunaan warna dan monospace di frontend dengan `DESIGN.md`; tidak mengubah token, tidak mengubah layout, tidak mengubah navigasi, tidak mengubah copy produk.
Canonical authority:
- `DESIGN.md` (Active Guardrail — cross-surface implementation design system)
- `docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md` (halaman publik)
- `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md` (Admin Studio)
Sumber temuan: audit frontend read-only, 24 Juli 2026.

Dokumen ini adalah rencana. Tidak ada source yang diubah oleh dokumen ini. `DESIGN.md`
baris 17-19 dan 158 menegaskan perubahan component/CSS memerlukan implementation plan
dan otorisasi eksplisit; dokumen ini menyediakan plan tersebut untuk ditinjau, bukan
mengeksekusinya.

## 1. Tujuan

Audit menemukan dua kelas penyimpangan dari `DESIGN.md`:

1. **Token warna di-bypass** oleh warna Tailwind mentah padahal role semantik sudah
   ada (`DESIGN.md` baris 37-38, 162).
2. **Monospace dipakai sebagai dekorasi pseudo-terminal** di luar "genuine technical
   data" (`DESIGN.md` baris 59-64, 88-90, 127-133).

Tujuan remediasi: menghapus penyimpangan **tanpa** mengubah nilai token, kontrak
komponen, layout, navigasi, atau copy produk. Ini pekerjaan penyelarasan, bukan
redesign.

## 2. Batas Scope

### Termasuk
- Mengganti warna mentah dengan role/variant semantik yang **sudah ada**.
- Mengurangi `font-mono-tech`/`font-mono` dekoratif pada surface yang dilarang, diganti
  ke role tipografi yang sesuai (Poppins display / Inter body) yang **sudah ada**.

### Tidak termasuk
- Menambah atau mengubah nilai token di `index.css` atau `tailwind.config.js`.
- Mengubah kontrak `SurfacePanel`, `TechnicalLabel`, `EmptyState`, atau variant Button
  (`DESIGN.md` baris 137-148, 160-167).
- Mengubah layout, spacing, navigasi, route, atau copy produk.
- Redesign Homepage (DEC-UX-002 implementation belum diotorisasi) di luar penggantian
  monospace-dekoratif satu-ke-satu.
- Redesign Admin Studio (DEC-OPS-001 implementation belum diotorisasi) di luar
  penggantian warna/monospace satu-ke-satu.
- Mengubah `font-mono` yang menandai data teknis asli (SKU, order number, ID, timestamp).

## 3. Batch A — Token warna (HIGH, pelanggaran guardrail jelas)

`DESIGN.md` baris 37-38: "do not introduce a parallel palette or hard-coded substitute
where a semantic role already exists." Role sudah ada: `--color-status-success`
(`index.css:22`), `--destructive` (`index.css:155`), dan variant Button `success`
(`button.jsx:23` → `bg-status-success text-white`) serta `destructive`
(`button.jsx:21`).

| Lokasi | Sekarang | Alignment | Catatan |
|---|---|---|---|
| `pages/admin/Orders.jsx:208` | `bg-emerald-600 hover:bg-status-success text-white` pada `<Button>` | Gunakan `variant="success"` (kontrak yang sudah ada) dan hapus kelas warna mentah | Base `emerald-600` tidak konsisten dengan hover `status-success`; variant menyatukan keduanya |
| `pages/admin/Orders.jsx:220` | `bg-emerald-600 hover:bg-status-success text-white` pada `<Button>` | Sama seperti di atas | — |
| `pages/admin/PortfolioAdmin.jsx:72` | `hover:bg-red-500 hover:border-red-500 text-red-400 hover:text-white` pada tombol hapus | Gunakan token `destructive` (mis. `variant="ghost"` + kelas `text-destructive`/`hover:bg-destructive`) tanpa `red-*` mentah | `text-red-400` juga risiko kontras; token `destructive` sudah tervalidasi |

Batch A berisiko sangat rendah: mengubah dari warna mentah ke role semantik dengan
nilai setara, memakai contract yang sudah dipakai komponen lain.

## 4. Batch B — Monospace dekoratif pada halaman publik (DEC-UX-002 scope)

`DESIGN.md` baris 59-64: monospace "not the voice for ordinary navigation, explanatory
copy, customer messaging, metrics, loading copy, empty states, or marketing claims."
Baris 88-90: "Do not use ... decorative telemetry" pada surface publik.

`.font-mono-tech` (`index.css:211`) memaksa JetBrains Mono. Lokasi dekoratif pada
`pages/marketing/*` dan komponen brand publik:

| Lokasi | Konten | Klasifikasi |
|---|---|---|
| `pages/marketing/HomePage.jsx:208` | "WHY NIUVA" (marketing claim/eyebrow) | Dekoratif — bukan data teknis |
| `pages/marketing/AboutPage.jsx:162` | "VISION" eyebrow | Dekoratif |
| `pages/marketing/AboutPage.jsx:172` | "MISSION" eyebrow | Dekoratif |
| `pages/marketing/AboutPage.jsx:141,202` | Index numerik `01`, `02` dekoratif | Dekoratif |
| `pages/marketing/ContactPage.jsx:170` | Index numerik dekoratif | Dekoratif |
| `pages/marketing/CapabilitiesPage.jsx:94` | Index numerik dekoratif | Dekoratif |
| `components/brand/CompanyProfileBlocks.jsx:313,360,411,464,496,498,564` | Label/numerals dekoratif ("PROJECT DOSSIER", numeral 6xl/7xl) | Dekoratif — komponen brand publik |

Alignment: ganti `font-mono-tech` ke role tipografi eyebrow/label yang sesuai (Poppins
display atau Inter, sesuai `DESIGN.md` baris 48-57) yang sudah ada. Tidak mengubah teks,
posisi, atau ukuran struktural — hanya keluarga font role.

Keputusan yang perlu ditegaskan sebelum eksekusi: apakah index numerik dekoratif
(`01`/`02`) dianggap "genuine technical data" atau "decorative telemetry". Plan ini
mengklasifikasikannya sebagai dekoratif; penilaian akhir mengikuti pemilik DEC-UX-002.

## 5. Batch C — Monospace pada customer portal & Admin Studio (DEC-OPS-001 scope)

`DESIGN.md` baris 114-117 (customer portals: "calm semantic states") dan baris 127-133
(Admin Studio: "must not turn ordinary labels, explanations, navigation, metrics, or
empty states into a simulated terminal").

Kandidat (perlu dibedakan data teknis asli vs dekorasi):

| Lokasi | Konten | Klasifikasi awal |
|---|---|---|
| `pages/operational/ClientDashboard.jsx` (loading/empty/"SYSTEM_ONLINE"/"WELCOME_BACK") | Customer messaging, loading, empty | Dekoratif → ganti ke teks kalem |
| `pages/operational/OrderDetail.jsx` ("SYSTEM_NOTICE"/"PAYLOAD_SPECIFICATIONS"/"SYSTEM_EVENT_LOG"/loading) | Label penjelas, loading | Dekoratif → ganti label bermakna |
| `pages/operational/NewOrder.jsx` ("FORMATS: STL_OBJ // MAX_SIZE: 50MB") | Hint form | Dekoratif → kalimat jelas |
| `pages/admin/AdminDashboard.jsx` ("[ FETCHING_TELEMETRY... ]", "METRIC_ID:") | Loading, label metrik | Dekoratif → teks kalem |

Catatan: order number, SKU, ID, revision, timestamp yang memakai `font-mono` **tetap
dipertahankan** — itu data teknis asli sesuai `DESIGN.md` baris 61.

Batch C paling padat keputusan editorial karena menyentuh copy operasional. Perlu
peninjauan pemilik DEC-OPS-001 untuk membedakan "data teknis" vs "dekorasi" per string,
dan copy pengganti (bilingual via `t()` bila jadi teks customer-facing).

## 6. Urutan yang disarankan

1. **Batch A** lebih dulu — pelanggaran token murni, risiko visual minimal, memakai
   contract yang sudah ada. Bisa jadi PR kecil mandiri.
2. **Batch B** — memerlukan tanda tangan DEC-UX-002 karena menyentuh surface publik.
3. **Batch C** — memerlukan tanda tangan DEC-OPS-001 dan keputusan editorial copy;
   paling besar dan paling baik dipecah per halaman.

## 7. Acceptance & Verifikasi (untuk tiap batch saat diotorisasi)

- Tidak ada nilai token yang berubah di `index.css`/`tailwind.config.js`.
- Tidak ada perubahan layout, spacing, navigasi, route, atau copy produk di luar yang
  tercatat pada plan ini.
- `npx craco build` sukses; `npx craco test --watchAll=false` tetap hijau.
- Data-testid dan kontrak komponen tetap kompatibel.
- Kontras dan reduced-motion tetap memenuhi (`DESIGN.md` baris 150-153); kontras final
  memerlukan pengecekan manual.
- Screenshot before/after per surface untuk konfirmasi tidak ada regresi visual tak
  disengaja.

## 8. Rollback

Setiap batch adalah PR terpisah dan reversible melalui revert commit. Tidak ada migrasi
data, tidak ada perubahan schema, tidak ada perubahan token — rollback murni pada layer
presentasi.

## 9. Keputusan yang masih dibutuhkan sebelum eksekusi

- Persetujuan eksplisit untuk mengubah source presentasi pada surface gated
  (DEC-UX-002 untuk Batch B, DEC-OPS-001 untuk Batch C).
- Klasifikasi per-string "genuine technical data" vs "decorative" untuk Batch B index
  numerik dan seluruh Batch C.
- Copy pengganti bilingual untuk string customer-facing yang dilepas dari gaya
  pseudo-terminal.

Tidak ada item yang diselesaikan diam-diam oleh plan ini. Status tetap **Pending
Separate Implementation Approval**.
