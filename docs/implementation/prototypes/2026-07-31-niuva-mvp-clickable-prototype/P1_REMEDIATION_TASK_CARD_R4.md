# P1 Remediation Task Card — Round 4 (R4)

Status: **COMPLETE — R4-P1-01 diperbaiki dan terverifikasi live browser**
Date: 2 August 2026

---

## Context

Formal critique Round 4 dinyatakan PASS berdasarkan simulasi Node.js, tetapi
live browser test oleh reviewer manusia menemukan P1 tambahan yang tidak terdeteksi
oleh simulasi karena simulasi tidak mengeksekusi `app.js` secara langsung.

---

## R4-P1-01 — Order Identity Mismatch (Post-Pay Navigation)

**Severity:** P1
**Ditemukan oleh:** Reviewer manusia, live browser test, 2 Agustus 2026
**Root cause:** `navigate("/orders/NV-DEMO-014")` hardcoded di handler `pay` (baris ~2661),
dan semua customer-facing link (heading, after-sales, notifications, cancellation, complaint,
revision) menggunakan literal `"NV-DEMO-014"` tanpa membaca `state.orderReference`.
Simulasi Node.js tidak mengeksekusi kode `app.js` — ia mereplikasi logika yang
diperkirakan sama. Karena navigasi adalah satu-satunya ekspresi yang berbeda dari logika,
simulasi memberi nilai PASS yang salah.

**Dampak:** Setelah retry checkout (`expired → refresh → reconfirm → pay`), user
diarahkan ke `/orders/NV-DEMO-014` meski `state.orderReference = "NV-DEMO-EXP"`.
Heading, tracking URL, after-sales links, cancellation, dan complaint links
semua menunjuk ke Order yang salah.

**Fix yang dilakukan (2 Agustus 2026):**

1. Tambah helper `activeOrderRef()` — `return state.orderReference || "NV-DEMO-014"` —
   satu titik kebenaran untuk semua render fungsi customer-facing.
2. Ganti semua literal `"NV-DEMO-014"` di customer-facing render (heading, links,
   notifications, after-sales) dengan `activeOrderRef()`.
3. Handler `pay`: `navigate("/orders/" + state.orderReference)`.
4. Scenario targets (`revision-required`, `eta-overdue`, `order-pickup`, `order-delivery`,
   `order-received`, `cancellation`, `complaint`, `case-status`): menggunakan
   `state.orderReference || "NV-DEMO-014"` sebagai fallback agar fixture statis
   tetap bekerja jika scenario dipilih tanpa prior checkout.
5. Form submit navigations (revision, complaint) menggunakan `activeOrderRef()`.

**Admin/operator fixture tetap:** Baris admin (`/admin/retail-orders/NV-DEMO-014`,
tabel admin, operator context) dibiarkan hardcoded karena merupakan fixture
operator independen yang tidak mengikuti checkout flow pelanggan.

**Sintaks:** `node --check app.js` → exit code 0.

**Verifikasi live browser:** Recording `r4p1_order_identity_revalidation`.

| Assertion | Hasil |
| --- | --- |
| URL setelah pay (retry NV-DEMO-EXP) | `/orders/NV-DEMO-EXP` ✅ |
| H1 heading setelah pay (retry) | `NV-DEMO-EXP` ✅ |
| `state.orderReference` setelah pay | `NV-DEMO-EXP` ✅ |
| URL setelah first-confirm (NV-DEMO-1458) | `/orders/NV-DEMO-1458` ✅ |
| H1 heading setelah first-confirm | `NV-DEMO-1458` ✅ |
| Cancellation link href | `/orders/NV-DEMO-1458/cancellation` ✅ |
| Console errors | Zero ✅ |

Status: **CLOSED ✅**

---

## Acceptance Criteria (semua harus PASS untuk gate)

| Kriteria | Status |
| --- | --- |
| R2-P1-01: Pricing | ✅ PASS — ditutup Round 3 |
| R2-P1-02: Lifecycle | ✅ PASS — ditutup Round 3 |
| BUG-3A: confirm-order preserve orderReference | ✅ PASS — ditutup Round 3/4 |
| BUG-3B: pay guard reservationStatus === "active" | ✅ PASS — ditutup Round 3/4 |
| R4-P1-01: Order identity — URL, heading, links | ✅ PASS — ditutup Round 4 |

---

## Batasan Scope

Semua perubahan dibatasi pada:

- `docs/implementation/prototypes/2026-07-31-niuva-mvp-clickable-prototype/app.js`
- Dokumentasi terkait di direktori yang sama

Tidak ada perubahan pada production frontend, backend, API, schema, migration,
canonical decision, provider, atau deployment.

---

## Dokumentasi yang Diperbarui

- `P1_REMEDIATION_TASK_CARD_R4.md` (dokumen ini)
- `FORMAL_EXPERT_CRITIQUE_RERUN_4.md` — dikoreksi ke FAIL
- `VALIDATION_REPORT.md` — Outcome dikoreksi
- `FORMAL_EXPERT_CRITIQUE_RERUN_5.md` — akan dibuat setelah task card ini selesai
