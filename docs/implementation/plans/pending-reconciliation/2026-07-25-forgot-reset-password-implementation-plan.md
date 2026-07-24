# Forgot & Reset Password — Implementation Plan

Tanggal: 24 Juli 2026
Status: **Context Only — Pending Separate Implementation Approval**
Scope: Menambah alur "Lupa Password" dan "Reset Password" untuk akun admin dan customer. Tidak ada source code yang diubah oleh dokumen ini.
Canonical authority:
- `docs/implementation/plans/pending-reconciliation/2026-07-23-auth-experience-remediation.md` (Bounded Scope: "entry to sign-in or account-access flows... recovery states"; menyatakan implementasi belum diotorisasi)
- `AGENTS.md` (least-privilege authorization; "a documentation plan does not authorize application implementation")
Sumber temuan: audit page-inventory frontend/backend read-only, 24-25 Juli 2026.

Dokumen ini adalah rencana desain. `2026-07-23-auth-experience-remediation.md` baris 11-15
menegaskan perubahan source, provider identitas, atau role model memerlukan "a later,
explicit implementation approval" terpisah dari plan ini. Dokumen ini menyediakan
rencana teknis untuk ditinjau, bukan mengeksekusinya.

## Addendum (25 Juli 2026) — Keputusan Baru Setelah Sinkronisasi Repo

Repo lokal disinkronkan dengan PR #40, #41, #42 (merged 24 Juli 2026) setelah dokumen ini
ditulis. `DEC-ACCESS-001` (granular internal role boundary, dari PR #40) menyatakan model
tiga-role (`super_admin`/`operations`/`commercial_finance`) bukan model final — ini tidak
mengubah desain endpoint reset password di dokumen ini (berlaku untuk semua role tanpa
dibedakan, sesuai keputusan pemilik proyek di §2), tetapi perlu diketahui bahwa migrasi
role di masa depan tidak akan mengurangi cakupan "admin dan customer" yang sudah
ditetapkan. `DEC-PAY-02` (legacy manual transfer) tidak relevan dengan scope dokumen ini.

## 1. Tujuan

Audit page-inventory menemukan gap: tidak ada halaman atau endpoint untuk memulihkan
akses akun bila password lupa. Backend hanya punya `hash_password`/`verify_password`
(bcrypt, `server.py:102-108`) dan `authenticate_credentials` (`server.py:268-272`) —
tidak ada model token reset, tidak ada endpoint `/auth/forgot-password` atau
`/auth/reset-password`. Admin panel (`Users.jsx`) juga tidak punya aksi "reset password
user lain", hanya edit role/access state (`identity_routes.py:122`).

Tujuan: mendefinisikan desain teknis yang lengkap dan aman agar implementasi (saat
diotorisasi) tidak perlu riset ulang keputusan keamanan dasar.

## 2. Keputusan yang Sudah Ditetapkan (Pemilik Proyek, 25 Juli 2026)

| Keputusan | Nilai | Konsekuensi |
|---|---|---|
| Berlaku untuk | Admin **dan** Customer | Endpoint tidak dibedakan per role; satu alur untuk semua `users` |
| TTL token reset | 30 menit | Token dianggap expired setelah 30 menit sejak dibuat |
| Invalidasi sesi lama saat reset | Ya | Perlu `token_version` per user; semua JWT lama otomatis ditolak setelah reset password |

## 3. Batas Scope

### Termasuk
- Endpoint backend: `POST /auth/forgot-password`, `POST /auth/reset-password`.
- Model token reset baru (koleksi atau field pada `users`).
- Perubahan skema JWT: tambah klaim `token_version`, dibandingkan saat verifikasi token.
- Dua halaman frontend baru: `/forgot-password`, `/reset-password`.
- Link "Lupa Password?" pada `AdminLogin.jsx` (satu-satunya halaman login yang ada,
  dipakai admin maupun customer — lihat `ProtectedRoute.jsx:19`).

### Tidak termasuk
- Mengubah backend authorization boundary atau role model (`AGENTS.md` guardrail).
- Memilih atau mengaktifkan identity provider pihak ketiga.
- Redesign Homepage, Admin Studio, atau navigasi publik.
- Registrasi publik (`POST /auth/register` tetap dinonaktifkan, `server.py:343-348`) —
  reset password tidak membuka jalur pembuatan akun baru.
- Two-factor authentication atau security-question — di luar scope permintaan ini.

## 4. Desain Backend

### 4.1 Model Token Reset

Koleksi baru `password_reset_tokens` (mengikuti pola `password_hash` — token mentah
tidak pernah disimpan, hanya hash):

```
{
  "id": "<uuid>",
  "user_id": "<user id>",
  "token_hash": "<sha256 dari token acak>",
  "expires_at": "<created_at + 30 menit, ISO>",
  "used_at": null,
  "created_at": "<ISO>"
}
```

Token mentah: acak kriptografis ≥32 byte (`secrets.token_urlsafe(32)`), dikirim hanya
lewat link email. Hash disimpan pakai `hashlib.sha256` — pola yang sudah dipakai
`inventory_domain.py:132` untuk kebutuhan hashing lain di codebase ini.

### 4.2 Endpoint

**`POST /auth/forgot-password { email }`**
- Selalu balas pesan generik sukses (mis. `{"ok": true, "message": "Jika email terdaftar, instruksi reset telah dikirim."}`), terlepas email ditemukan atau tidak — mencegah user-enumeration.
- Jika email ditemukan: buat token baru, invalidasi (hapus/tandai used) token lama milik user yang sama, kirim email via `emailer.py` (Resend) dengan link `https://.../reset-password?token=...`.
- Rate-limit pakai `rate_limit()` yang sudah ada di `server.py` (pola sama seperti `/contact:641` dan `/orders:394`) — per IP dan per email, mis. 3 permintaan / 15 menit.

**`POST /auth/reset-password { token, new_password }`**
- Hash token yang diterima, cari di `password_reset_tokens` yang `used_at IS NULL` dan `expires_at > now`.
- Token tidak ditemukan/expired/used → error generik "Link reset tidak valid atau sudah kedaluwarsa" (tidak membedakan sebab, untuk keamanan).
- Token valid → update `users.password_hash`, naikkan `users.token_version` (+1), tandai token `used_at = now`, hapus/invalidasi token reset lain milik user yang sama.

### 4.3 Perubahan Skema JWT (Invalidasi Sesi)

`create_token()` (`server.py:113-121`) saat ini membuat payload `{sub, email, role, type, exp}`
dengan `exp = now + 7 hari` (`server.py:118`). Perubahan yang dibutuhkan:

- Tambah klaim `token_version` ke payload saat token dibuat, diisi dari `users.token_version` user tersebut saat itu.
- Tambah field `token_version` (integer, default `0`) ke dokumen `users`.
- Pada fungsi verifikasi token (area `server.py:122-134`), setelah decode JWT, bandingkan `payload["token_version"]` dengan `users.token_version` terkini. Jika tidak sama → tolak token (401), meskipun `exp` belum lewat.
- **Dampak deploy:** karena token lama tidak punya klaim `token_version`, seluruh sesi aktif akan diminta login ulang begitu perubahan ini di-deploy — bukan hanya user yang melakukan reset password. Ini efek samping satu kali saat rilis, bukan per-reset.

## 5. Desain Frontend

- Route baru: `frontend/src/pages/auth/ForgotPassword.jsx`, `ResetPassword.jsx`.
- Style mengikuti pola `AdminLogin.jsx` (operasional/`SurfacePanel`), **bukan** komponen `BrandSystem` bergaya editorial marketing — konsisten dengan `2026-07-23-auth-experience-remediation.md` baris 42-45 yang melarang motif dekoratif Homepage pada access flow.
- State wajib (checklist dari dokumen remediation baris 52-53): label aksesibel, keyboard behavior, focus visible, loading, disabled, error, retry, **expired** (token basi), dan pesan recovery yang tidak membocorkan status akun.
- `AdminLogin.jsx` mendapat tambahan link "Lupa Password?" mengarah ke `/forgot-password`.

## 6. Rute & Komponen Terdampak (identifikasi, bukan eksekusi)

| Jenis | Lokasi | Perubahan |
|---|---|---|
| Baru | `frontend/src/pages/auth/ForgotPassword.jsx` | Halaman form email |
| Baru | `frontend/src/pages/auth/ResetPassword.jsx` | Halaman form password baru + validasi token dari query string |
| Diubah | `frontend/src/App.js` | 2 route baru (lazy-loaded, mengikuti pola route lain) |
| Diubah | `frontend/src/pages/admin/AdminLogin.jsx` | Tambah link "Lupa Password?" |
| Baru | Backend: 2 endpoint di `server.py` | `/auth/forgot-password`, `/auth/reset-password` |
| Diubah | Backend: `server.py` (`create_token`, verifikasi token) | Tambah klaim/pembanding `token_version` |
| Diubah | Backend: skema `users` | Tambah field `token_version` (default `0`) |
| Baru | Backend: migrasi | Koleksi/index `password_reset_tokens` |
| Baru | Test | Token expired, token reused, email tidak terdaftar (tetap generic-success), rate-limit, invalidasi sesi lama pasca-reset |

## 7. Dampak Privasi

- Token reset setara sensitif dengan password mentah — **tidak boleh** tercetak di log. Ikuti pola redaction yang sudah ada (`audit.py:8-9` sudah me-redact `password`/`password_hash`; `token_hash`/token mentah perlu ditambahkan ke daftar redaction yang sama).
- Audit trail sebaiknya mencatat event "password reset requested" / "password reset completed" tanpa menyimpan nilai token di mana pun selain hash-nya.
- `PrivacyPolicyPage.jsx` (sudah dibuat sebelumnya) perlu tambahan baris yang menjelaskan token reset sekali pakai, jika fitur ini nanti dibangun.

## 8. Acceptance & Verifikasi (saat diotorisasi)

- `npx craco build` sukses; test backend (`pytest`) dan frontend tetap hijau.
- Endpoint `/auth/forgot-password` tidak pernah membedakan respons antara email terdaftar dan tidak terdaftar (diuji lewat test).
- Token tidak bisa dipakai dua kali (diuji lewat test reuse).
- Setelah reset password, JWT yang diterbitkan sebelum reset ditolak oleh endpoint terautentikasi (diuji lewat test invalidasi sesi).
- Tidak ada token mentah atau `token_hash` yang muncul di log aplikasi.

## 9. Rollback

Karena belum ada kode yang dibuat, rollback saat ini = tidak melakukan apa-apa. Bila
nanti diimplementasi lalu perlu dibatalkan:
- Hapus 2 route frontend dan link di `AdminLogin.jsx`.
- Hapus 2 endpoint backend dan koleksi `password_reset_tokens`.
- Field `token_version` pada `users` dapat dibiarkan (default `0`, tidak mengganggu fungsi lain) atau dihapus lewat migrasi terpisah.
- Tidak ada migrasi data existing (order, materials, dll) yang tersentuh oleh fitur ini.

## 10. Keputusan yang Masih Dibutuhkan Sebelum Eksekusi

- Approval implementasi eksplisit sesuai gate `2026-07-23-auth-experience-remediation.md`
  (dokumen tersebut menyatakan "a later, explicit implementation approval is required
  before any source change").
- Konfirmasi copy bilingual (ID/EN) untuk pesan generic-success dan pesan expired,
  mengikuti pola `i18n.js` yang sudah ada.
- Konfirmasi threshold rate-limit final untuk `/auth/forgot-password` (draf: 3 permintaan / 15 menit per email dan per IP).

Tidak ada item yang diselesaikan diam-diam oleh plan ini. Status tetap **Pending
Separate Implementation Approval**.
