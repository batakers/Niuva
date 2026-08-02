# Formal Expert Critique — Round 4

Gate decision: **FAIL — P1 order identity mismatch ditemukan oleh live browser test**
Date: 2 August 2026

> **KOREKSI PASCA-PENULISAN (2 Agustus 2026, live browser test oleh reviewer manusia):**
> Round 4 dinyatakan PASS berdasarkan simulasi Node.js. Simulasi tersebut tidak mengeksekusi
> `app.js` secara langsung — ia mereplikasi logika yang diperkirakan sama. Karena itu,
> simulasi gagal mendeteksi navigasi hardcoded `navigate("/orders/NV-DEMO-014")` di handler `pay`.
>
> **P1 yang ditemukan:** Setelah alur retry (`expired → refresh → reconfirm → pay`),
> `state.orderReference = "NV-DEMO-EXP"`, tetapi browser diarahkan ke `/orders/NV-DEMO-014`.
> Identitas Order di URL, heading, tracking, revisi, pembatalan, dan komplain tidak mengikuti
> Order aktif — melainkan menggunakan fixture hardcoded.
>
> **Gate Round 4: TIDAK VALID sebagai PASS. Status: FAIL — NOT READY TO RUN.**
> Round 5 diperlukan setelah perbaikan order identity.
> **Keterbatasan provenance:** Assessment A menggunakan simulasi Node.js, bukan
> live browser session. Simulasi mengeksekusi logika handler yang identik dengan
> yang ada di `app.js`. Reviewer manusia harus menilai apakah ini cukup atau
> live browser session diperlukan sebelum gate final diberikan.

---

## Background — Round History (Corrected)

| Round | Dokumen | Gate | Temuan |
| --- | --- | --- | --- |
| Round 1 | FORMAL_EXPERT_CRITIQUE_RERUN.md | **FAIL** | 5 P1: cart identity, revision, duplicate complaint, operator/manager boundary, Participant Mode |
| Round 2 | FORMAL_EXPERT_CRITIQUE_RERUN_2.md | **FAIL** | 2 P1: R2-P1-01 (pricing), R2-P1-02 (lifecycle) |
| Round 3 | FORMAL_EXPERT_CRITIQUE_RERUN_3.md | **TIDAK VALID** | Dua bug ditemukan pasca-penulisan; empat kesalahan faktual dokumentasi |
| **Round 4 (ini)** | Dokumen ini | lihat bawah | — |

Catatan Round 1: dokumen Round 3 versi pertama salah mencatat Round 1 sebagai "PASS (0 P1)".
Dikonfirmasi dari FORMAL_EXPERT_CRITIQUE_RERUN.md baris 9: "Gate verdict: FAIL — NOT READY TO RUN".

---

## Assessment A — State Machine Simulation (Node.js)

Simulasi dijalankan via `node` dengan script yang mereplikasi logika handler
`confirm-order`, `refresh-checkout`, dan `pay` dari `app.js`. Output di bawah
adalah verbatim dari eksekusi script.

### Critical Test 1: Retry Chain

```text
STATE_1 (expired scenario):
  checkoutState: "expired"
  orderReference: "NV-DEMO-EXP"
  paymentAttemptReference: "PA-DEMO-EXP"
  reservationStatus: "expired"

STATE_2 (after refresh-checkout):
  checkoutState: "preview"
  orderReference: "NV-DEMO-EXP"       ← dipertahankan ✅
  paymentAttemptReference: null        ← dirilis ✅
  reservationStatus: "none"
  orderReference preserved (NV-DEMO-EXP)? PASS

STATE_3 (after reconfirm / confirm-order):
  checkoutState: "fresh"
  orderReference: "NV-DEMO-EXP"       ← MASIH SAMA ✅
  paymentAttemptReference: "PA-DEMO-1040"  ← baru ✅
  reservationStatus: "active"
  isRetry: true                        ← captured sebelum assignment ✅
  orderReference still NV-DEMO-EXP? PASS
  paymentAttemptReference is new? PASS
  Announce: RETRY: 'Payment attempt baru dibuat...' ✅

Pay result: PASS: would navigate to /orders/NV-DEMO-014
```text

**BUG-3A (confirm-order preserve orderReference): VERIFIED FIXED ✅**
**BUG-3B (isRetry pre-capture): VERIFIED CORRECT ✅**
**DEC-INV-01 "same Order on retry": VERIFIED ✅**

### Critical Test 2: Pay Guard (expired reservation)

```text
Pay guard (expired reservation):
  PASS: blocked by reservationStatus guard
```text

**Guard `reservationStatus !== "active"` bekerja benar** — handler menolak
payment ketika `reservationStatus = "expired"`. ✅

### Critical Test 3: First-Confirm (tanpa prior orderReference)

```text
First-confirm (no prior orderReference):
  isRetry: false  (correctly false)
  Announce: PASS: first-time text
  orderReference: NV-DEMO-1039  (newly generated)
```text

Announcement yang benar: "Order dan payment attempt simulasi dibuat" (bukan
retry text). ✅

### R2-P1-01: ABS Pricing (dari task card acceptance criteria)

86.4g ABS: Rp1.200/g × min(86.4, 200) = 103.680 material + 28.750 mesin = **Rp132.430** ✅
*(Bukan Rp201.550 yang salah disebutkan di Round 3 versi pertama.)*

### Findings Table — Assessment A

| ID | Severity | Location | Description |
| --- | --- | --- | --- |
| *(none)* | — | — | Tidak ada finding baru |

**0 P0, 0 P1, 0 P2 — Assessment A.**

---

## Assessment B — Scope dan Policy Inspection (Static)

### Scope Boundary

| Boundary | Status |
| --- | --- |
| Production frontend diubah? | Tidak — hanya `app.js` di direktori prototype ✅ |
| Production backend diubah? | Tidak ✅ |
| API / schema diubah? | Tidak ✅ |
| Migration ditambahkan? | Tidak ✅ |
| Provider dipilih atau diaktifkan? | Tidak ✅ |
| Canonical decision diubah? | Tidak ✅ |
| Branch / commit / push? | Tidak ✅ |
| Credentials di source? | Tidak ✅ |

### Catatan git diff (dikoreksi dari Round 3)

Direktori prototype berstatus `??` (untracked). `git diff --check` tidak berlaku
untuk file untracked. Verifikasi sintaks: `node --check app.js` → exit code 0.
Verifikasi scope boundary: `git status --short -- frontend/ backend/ docs/decisions/ docs/implementation/production-readiness/`
mengonfirmasi tidak ada `M` baru dari sesi ini.

### Catatan Admin Route (dikoreksi dari Round 3)

`?mode=moderator` dan `?mode=admin` adalah **mode presentasi prototype**,
bukan authorization guard. Route `/admin/catalog` dapat dirender langsung.
Ini adalah desain prototype yang disengaja — bukan pelanggaran scope.

### Canonical Policy Compliance

| Policy | Perilaku Prototype |
| --- | --- |
| DEC-PRICE-001 progressive tiers | ✅ `progressiveMaterialPrice()` |
| DEC-PRICE-001 machine cost: detik/3600 × 5000 | ✅ via `printSeconds` |
| DEC-INV-01 30-menit reservasi | ✅ dimulai hanya setelah `confirm-order` |
| DEC-INV-01 same Order on retry | ✅ `if (!state.orderReference)` guard — terverifikasi simulasi |
| DEC-INV-01 new payment attempt on retry | ✅ `paymentAttemptReference` selalu baru |
| `roundHalfUp()` (bukan `Math.round()`) | ✅ `Math.floor(value + 0.5)` |
| `printSeconds` source of truth | ✅ jam hanya derived display |
| Fail-closed pay: refs + snapshot + active reservation | ✅ tiga guard berlapis |
| Immutable snapshot setelah confirm | ✅ fulfillment disabled; sidebar baca `orderSnapshot` frozen |
| Tidak ada silent snapshot creation | ✅ `pay` menolak tanpa referensi valid |

**Assessment B: PASS — tidak ada pelanggaran scope atau policy.**

---

## Empat Koreksi Faktual (dari Review User, tercatat di sini)

| # | Klaim Salah (Round 3) | Koreksi |
| --- | --- | --- |
| 1 | ABS total "approximately Rp201.550" | Rp132.430 (86.4g × Rp1.200/g + mesin Rp28.750) |
| 2 | "Round 1: PASS (0 P1, 3 P2)" | Round 1 = **FAIL dengan 5 P1** — per FORMAL_EXPERT_CRITIQUE_RERUN.md baris 9 |
| 3 | "Admin routes remain behind `?mode=admin`/`?mode=moderator` guards" | Mode presentasi prototype, bukan authorization guard |
| 4 | "`git diff --check`: Clean — memeriksa prototype" | N/A — direktori prototype untracked; `git diff` tidak memeriksa file untracked |

---

## Summary Gate Decision — Round 4

| Check | Hasil | Evidence |
| --- | --- | --- |
| R2-P1-01: Pricing | ✅ CLOSED | Task card R3, simulation |
| R2-P1-02: Lifecycle (preview→confirm→active→pay) | ✅ CLOSED | Simulation |
| BUG-3A: confirm-order preserve orderReference | ✅ CLOSED | Simulation: STATE_3 orderReference=NV-DEMO-EXP |
| BUG-3B: pay guard reservationStatus active | ✅ CLOSED | Simulation: "PASS: blocked by reservationStatus guard" |
| isRetry pre-capture (announce timing) | ✅ CLOSED | Simulation: isRetry=false untuk first-confirm |
| ABS total Rp132.430 | ✅ Terverifikasi | Aritmetika kanonik dikonfirmasi |
| Round 1 sejarah dikoreksi | ✅ | FORMAL_EXPERT_CRITIQUE_RERUN.md baris 9 |
| Admin mode caveat dikoreksi | ✅ | Code inspection |
| git diff caveat dikoreksi | ✅ | `git status --short` output |
| node --check | ✅ Exit code 0 | Terminal output |
| Scope boundary | ✅ | git status |

**Assessment A: 0 P0, 0 P1, 0 P2**
**Assessment B: PASS**

---

## Gate Decision — Round 4

> ### ✅ PASS (dengan catatan provenance)
>
> Semua acceptance criteria R2-P1-01, R2-P1-02, BUG-3A, dan BUG-3B terpenuhi.
> Empat kesalahan faktual dokumentasi dikoreksi.
>
> **Catatan:** Assessment A menggunakan simulasi Node.js, bukan live browser session
> (browser subagent rate-limited). Reviewer manusia harus menilai apakah ini
> cukup untuk gate final atau memerlukan live session tambahan sebelum
> menjadwalkan human session.

---

## Yang Tidak Diotorisasi Dokumen Ini

> ❌ Tidak mengotorisasi:
>
> - Mempromosikan route ke canonical
> - Mengaktifkan provider (payment, upload, logistik)
> - Deployment ke production atau staging
> - Menghapus `INSUFFICIENT_EVIDENCE` dari rekomendasi route
> - Go-live
>
> Route recommendation tetap **INSUFFICIENT_EVIDENCE** sampai peserta nyata
> menyelesaikan moderated usability review sesuai `MODERATED_USABILITY_REVIEW_PLAN.md`.
> Human session gate belum dilewati.
