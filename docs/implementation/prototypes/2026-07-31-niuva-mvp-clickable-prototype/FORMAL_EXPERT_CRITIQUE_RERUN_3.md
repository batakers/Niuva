# Formal Expert Critique — Round 3 Rerun (Corrected)

Status: **NOT READY TO RUN — dua bug kode ditemukan setelah rerun ini ditulis; dokumen ini dikoreksi setelah review user**
Date: 2 August 2026

> **CATATAN KOREKSI (2 Agustus 2026, setelah user review):**
> Versi pertama dokumen ini mengandung empat kesalahan faktual yang diidentifikasi oleh reviewer manusia:
>
> 1. ABS total ditulis "approximately Rp201.550" — nilai benar Rp132.430 (86.4g, mesin 5.75 jam).
> 2. Tabel sejarah round mencatat Round 1 sebagai "PASS (0 P1)" — hasil aktual Round 1 adalah **FAIL dengan 5 P1**.
> 3. Klaim "Admin routes remain behind `?mode=admin` / `?mode=moderator` guards" — tidak benar; ini mode presentasi, bukan authorization guard. Route admin dapat dirender langsung.
> 4. Klaim `git diff --check` memeriksa file prototype — tidak benar; direktori prototype seluruhnya untracked, sehingga `git diff` tidak menyentuhnya.
>
> Selain itu, dua bug kode ditemukan:
>
> - `confirm-order` menimpa `orderReference` pada retry path (bertentangan dengan "same Order on retry").
> - `pay` tidak mengecek `reservationStatus === "active"`.
>
> Kedua bug telah diperbaiki di `app.js`. Dokumen ini dipertahankan sebagai **bukti intermediate yang dikoreksi**.
> **Gate keseluruhan Round 3 tetap NOT READY TO RUN.**
> Formal critique berikutnya (Round 4) akan dijalankan setelah verifikasi perbaikan.

---

## Background

Ini adalah rerun formal expert critique ketiga untuk Niuva MVP Clickable Prototype.

| Round | Dokumen | Gate |
| --- | --- | --- |
| Round 1 | FORMAL_EXPERT_CRITIQUE_RERUN.md | **FAIL — 5 P1 ditemukan** |
| Round 2 | FORMAL_EXPERT_CRITIQUE_RERUN_2.md | **FAIL — 2 P1 baru (R2-P1-01, R2-P1-02)** |
| Round 3 (ini) | Dokumen ini | **NOT READY — bug ditemukan pasca-penulisan** |

Authority: `NIUVA_MASTER_SPEC.md`; `DEC-PRICE-001`; `DEC-INV-01`; `DEC-UX-003`.

---

## Apa yang Benar dari Rerun Ini

### R2-P1-01: Pricing — BENAR-BENAR DIPERBAIKI

| Check | Nilai Terverifikasi |
| --- | --- |
| 86.4g PLA: material | Rp86.400 (Rp1.000/g tier pertama, progresif) |
| 86.4g PLA: mesin | Rp28.750 (20700 detik / 3600 × Rp5.000) |
| 86.4g PLA: total | **Rp115.150** |
| 86.4g ABS: material | Rp103.680 (Rp1.200/g tier pertama, progresif) |
| 86.4g ABS: mesin | Rp28.750 |
| 86.4g ABS: total | **Rp132.430** *(bukan Rp201.550 — nilai lama adalah kesalahan dokumen)* |
| Teks Rp500/g atau Rp700/g | Tidak ditemukan di prototype |
| Admin catalog | Menampilkan tarif progresif kanonik |

### R2-P2-01: Mobile CTA Labels — BENAR-BENAR DIPERBAIKI

State-specific labels: "Konfirmasi pesanan" (preview), "Bayar sekarang" (fresh/active),
"Periksa ulang" (expired). ✅

---

## Yang Masih Bermasalah (Ditemukan Pasca-Penulisan)

### BUG-1: confirm-order menimpa orderReference pada retry (BLOCKER)

**Temuan user:** Baris 2589 (sebelum perbaikan) selalu menjalankan:

```js
state.orderReference = "NV-DEMO-" + String(Date.now()).slice(-4);
```

Ini membuat Order baru setiap kali `confirm-order` dipanggil, termasuk pada retry
setelah expiry. Bertentangan dengan DEC-INV-01 "same Order on retry".

**Perbaikan yang diterapkan:**

```js
if (!state.orderReference) {
  state.orderReference = "NV-DEMO-" + String(Date.now()).slice(-4);
}
// paymentAttemptReference selalu baru:
state.paymentAttemptReference = "PA-DEMO-" + String(Date.now()).slice(-4);
```

### BUG-2: pay tidak mengecek reservationStatus (BLOCKER)

**Temuan user:** Handler `pay` hanya mengecek tiga field
(`orderReference`, `paymentAttemptReference`, `orderSnapshot`) tetapi tidak
mengecek `reservationStatus === "active"`. Artinya, pembayaran dapat terjadi
saat reservasi sudah expired atau belum dimulai — bertentangan dengan
DEC-INV-01.

**Perbaikan yang diterapkan:**

```js
if (state.reservationStatus !== "active") {
  state.checkoutState = "expired";
  render({ preserveFocus: true });
  announce("Reservasi tidak aktif. Periksa ulang ketersediaan sebelum membayar.");
  break;
}
```

---

## Empat Koreksi Faktual Dokumentasi

### 1. Total ABS

- **Salah:** "approximately Rp201.550 due to machine cost"
- **Benar:** Rp132.430 (86.4g ABS @ Rp1.200/g progresif = Rp103.680 + mesin Rp28.750)
- Nilai Rp201.550 tidak konsisten dengan fixture manapun dan tidak dapat direproduksi.

### 2. Sejarah Round 1

- **Salah:** "Round 1: 0 P0, 0 P1, 3 P2 — PASS"
- **Benar:** Round 1 adalah **FAIL dengan 5 P1**. Kutipan dari FORMAL_EXPERT_CRITIQUE_RERUN.md:
  > "Gate verdict: FAIL — NOT READY TO RUN MODERATED SESSIONS"
  > "five open P1 issues can still teach participants an incorrect transaction..."

### 3. Admin Route Guard

- **Salah:** "Admin routes remain behind `?mode=admin` / `?mode=moderator` guards"
- **Benar:** `?mode=moderator` dan `?mode=admin` adalah **mode presentasi prototype**,
  bukan authorization guard. Route seperti `/admin/catalog` dapat dirender langsung
  tanpa query parameter. Ini adalah karakteristik prototype yang disengaja dan sudah
  terdokumentasi — bukan security feature.

### 4. git diff --check

- **Salah:** "`git diff --check`: Clean — membuktikan tidak ada perubahan whitespace di file prototype"
- **Benar:** Seluruh direktori prototype berstatus `??` (untracked). `git diff` tidak
  memeriksa file untracked, sehingga `git diff --check` tidak memberikan validasi
  apapun terhadap file prototype. Pemeriksaan whitespace yang valid untuk file
  untracked adalah `node --check` (untuk sintaks JS) dan inspeksi manual.

---

## Status Gate Round 3

**TIDAK VALID — Dua bug kode ditemukan setelah dokumen ini ditulis.**

Formal critique yang sah (Round 4) hanya dapat dijalankan setelah:

1. ✅ Bug-1 (`confirm-order` overwrite) — diperbaiki
2. ✅ Bug-2 (`pay` tanpa `reservationStatus` guard) — diperbaiki
3. ⬜ Focused browser test seluruh rantai retry (`expired → refresh → preview → reconfirm → pay`) dijalankan ulang dengan bukti yang dapat ditelusuri
4. ⬜ Dual-assessment independen dengan provenance terverifikasi dijalankan

Route recommendation: tetap **INSUFFICIENT_EVIDENCE**.
Human session gate: tetap **NOT READY TO RUN**.
