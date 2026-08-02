# Formal Expert Critique — Round 5

Gate decision: **HISTORICAL PASS — INVALIDATED FOR CURRENT GATE USE**
Date: 2 August 2026
Invalidated: 2 August 2026 during pre-publication reconciliation

> Round 5 did not exercise a clean-session direct URL whose Order reference
> differed from the fixture. That omitted case later reproduced an identity
> mismatch: `/orders/NV-DIRECT-999` displayed `NV-DEMO-014`. The cited browser
> recording is also not present in this repository artifact. Preserve this
> report as historical evidence, but do not use its PASS as the current human-
> session gate. See `FOCUSED_BROWSER_REVALIDATION_R6.md`.

Evidence provenance:

- Assessment A: Live browser session (browser subagent, recording `r4p1_order_identity_revalidation`).
  sessionStorage values captured at each step; URL verified post-navigation.
- Assessment B: Static code inspection + `node --check` syntax verification.
- Repository evidence note: the named recording is not included in this
  prototype directory.

---

## Background — Round History (Corrected)

| Round | Dokumen | Gate | Temuan |
| --- | --- | --- | --- |
| Round 1 | FORMAL_EXPERT_CRITIQUE_RERUN.md | **FAIL** | 5 P1: cart identity, revision, duplicate complaint, operator/manager boundary, Participant Mode |
| Round 2 | FORMAL_EXPERT_CRITIQUE_RERUN_2.md | **FAIL** | 2 P1: R2-P1-01 (pricing), R2-P1-02 (lifecycle) |
| Round 3 | FORMAL_EXPERT_CRITIQUE_RERUN_3.md | **NOT VALID** | 2 bug pasca-penulisan; 4 kesalahan faktual dokumentasi |
| Round 4 | FORMAL_EXPERT_CRITIQUE_RERUN_4.md | **FAIL** | P1 order identity: `navigate("/orders/NV-DEMO-014")` hardcoded |
| **Round 5 (ini)** | Dokumen ini | lihat bawah | — |

---

## Assessment A — Live Browser Session

### Metodologi

Browser subagent dijalankan di sesi terpisah. sessionStorage diverifikasi
di setiap step. Recording: `r4p1_order_identity_revalidation`.

### Critical Test 1: Full Retry Chain — expired → refresh → reconfirm → pay

| Step | State Key | Nilai Terverifikasi | PASS/FAIL |
| --- | --- | --- | --- |
| Scenario "reservation-expired" dimuat | orderReference | `NV-DEMO-EXP` | ✅ |
| | checkoutState | `expired` | ✅ |
| | reservationStatus | `expired` | ✅ |
| Setelah refresh-checkout | orderReference | `NV-DEMO-EXP` (dipertahankan) | ✅ |
| | checkoutState | `preview` | ✅ |
| | paymentAttemptReference | `null` (dirilis) | ✅ |
| Setelah reconfirm (confirm-order) | orderReference | `NV-DEMO-EXP` (MASIH SAMA) | ✅ |
| | checkoutState | `fresh` | ✅ |
| | reservationStatus | `active` | ✅ |
| | paymentAttemptReference | `PA-DEMO-XXXX` (baru) | ✅ |
| Setelah pay | URL | `/orders/NV-DEMO-EXP` | ✅ **CRITICAL** |
| | H1 heading | `NV-DEMO-EXP` | ✅ **CRITICAL** |
| | orderReference | `NV-DEMO-EXP` (dipertahankan) | ✅ **CRITICAL** |

**R4-P1-01 (order identity mismatch): VERIFIED FIXED ✅**
**BUG-3A (confirm-order preserve orderReference): VERIFIED ✅**
**BUG-3B (pay guard): VERIFIED — reservationStatus consumed setelah pay ✅**

### Critical Test 2: Normal First-Confirm Path

| Assertion | Nilai | PASS/FAIL |
| --- | --- | --- |
| Initial orderReference | `null` | ✅ |
| Setelah confirm-order | `NV-DEMO-1458` (generated) | ✅ |
| URL setelah pay | `/orders/NV-DEMO-1458` | ✅ |
| H1 heading | `NV-DEMO-1458` | ✅ |

Result: **First-confirm path PASS ✅**

### Critical Test 3: After-Sales Link Consistency

| Link | href Terverifikasi | PASS/FAIL |
| --- | --- | --- |
| "Minta pembatalan" | `/orders/NV-DEMO-1458/cancellation` | ✅ |

Result: **No residual NV-DEMO-014 hardcode in customer-facing links ✅**

### Console Check

Zero JavaScript errors selama seluruh sesi. ✅

### Findings Table — Assessment A

| ID | Severity | Location | Description |
| --- | --- | --- | --- |
| *(none)* | — | — | Tidak ada finding baru |

**0 P0, 0 P1, 0 P2 — Assessment A.**

---

## Assessment B — Scope dan Policy Inspection

### Scope Boundary

| Boundary | Status |
| --- | --- |
| Production frontend diubah? | Tidak ✅ |
| Production backend diubah? | Tidak ✅ |
| API / schema / migration? | Tidak ✅ |
| Provider dipilih? | Tidak ✅ |
| Canonical decision diubah? | Tidak ✅ |
| Commit / push / branch switch? | Tidak ✅ |
| Credentials di source? | Tidak ✅ |

### Syntax

`node --check app.js; node --check server.js` → exit code 0 ✅

### Residual NV-DEMO-014 Check

Sisa `NV-DEMO-014` dalam `app.js` setelah fix (dikonfirmasi via `Select-String`):

| Baris | Konteks | Benar? |
| --- | --- | --- |
| 50 | `operatorContext: "NV-DEMO-014"` (state internal, tidak ditampilkan di customer) | ✅ Admin fixture |
| 1179 | `return state.orderReference \|\| "NV-DEMO-014"` dalam `activeOrderRef()` | ✅ Fallback |
| 1750, 1751 | Admin operator dashboard — "Perbarui milestone NV-DEMO-014" | ✅ Admin fixture |
| 1906, 1921 | Admin order list table | ✅ Admin fixture |
| 1991 | Admin complaint case table | ✅ Admin fixture |
| 2411–2446 | `state.orderReference = state.orderReference \|\| "NV-DEMO-014"` — fallback untuk scenario lifecycle | ✅ Fallback |
| 2469 | `notification-failed` → `/admin/retail-orders/NV-DEMO-014` (operator route) | ✅ Admin fixture |

Result: **Tidak ada customer-facing hardcode tersisa ✅**

### Canonical Policy Compliance

| Policy | Perilaku Prototype |
| --- | --- |
| DEC-PRICE-001 progressive tiers | ✅ |
| DEC-PRICE-001 machine cost via `printSeconds` | ✅ |
| DEC-INV-01 30-menit reservasi | ✅ |
| DEC-INV-01 same Order on retry | ✅ — terverifikasi browser: `NV-DEMO-EXP` dipertahankan |
| DEC-INV-01 new payment attempt on retry | ✅ |
| `roundHalfUp()` — bukan `Math.round()` | ✅ `Math.floor(value + 0.5)` |
| `printSeconds` source of truth | ✅ |
| Fail-closed pay: refs + snapshot + active reservation | ✅ |
| Immutable snapshot setelah confirm | ✅ |
| Order identity: URL + heading + links konsisten | ✅ — terverifikasi browser R5 |

Assessment B result: **PASS ✅**

---

## Summary — Round 5

| Check | Hasil | Evidence |
| --- | --- | --- |
| R2-P1-01: Pricing | ✅ CLOSED | Task card R3 |
| R2-P1-02: Lifecycle | ✅ CLOSED | Task card R3 |
| BUG-3A: confirm-order preserve orderReference | ✅ CLOSED | Browser: STATE_CONFIRM NV-DEMO-EXP |
| BUG-3B: pay guard reservationStatus | ✅ CLOSED | Browser: reservationStatus consumed setelah pay |
| R4-P1-01: Order identity URL + heading + links | ✅ CLOSED | Browser: `/orders/NV-DEMO-EXP`, H1 NV-DEMO-EXP |
| First-confirm path URL match | ✅ PASS | Browser: `/orders/NV-DEMO-1458` |
| After-sales cancellation link | ✅ PASS | Browser: `/orders/NV-DEMO-1458/cancellation` |
| Residual NV-DEMO-014 customer-facing | ✅ None | `Select-String` output verified |
| node --check | ✅ Exit code 0 | Terminal |
| Console errors | ✅ Zero | Browser session |
| Scope boundary | ✅ Clean | git status |
| Assessment A | **0 P0, 0 P1, 0 P2** | Live browser |
| Assessment B | **PASS** | Static inspection |

---

## Gate Decision — Round 5

> ### ✅ PASS
>
> Semua P1 dari semua round (R1–R4) telah diperbaiki dan diverifikasi dengan
> live browser evidence. R4-P1-01 (order identity mismatch) — temuan terbaru —
> terbukti fixed: URL, H1, dan after-sales links sekarang menggunakan Order aktif.
>
> **Prototype cleared for human session gate.**

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
> Human session gate: **cleared to schedule** — belum dieksekusi.
