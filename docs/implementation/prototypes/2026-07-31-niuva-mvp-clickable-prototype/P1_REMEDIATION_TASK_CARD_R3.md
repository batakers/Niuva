# R2-P1 Remediation Task Card — Round 3

Status: **INCOMPLETE — dua bug ditemukan pasca-penulisan; diperbaiki 2 Agustus 2026**
Date: 2 August 2026
Lane: Prototype-only P1 remediation (R2-P1-01 and R2-P1-02)

## Smallest Useful Brief

| Field | Boundary |
| --- | --- |
| Title and user outcome | Remediate R2-P1-01 (Custom Print pricing mismatch) and R2-P1-02 (reservation starts before Order+payment-attempt) found in FORMAL_EXPERT_CRITIQUE_RERUN_2.md, so the prototype can pass a fresh formal critique and advance to the human-session gate. |
| In scope | `app.js` pricing formula, checkout lifecycle state machine, session storage version, scenario fixtures, mobile CTA labels, admin catalog copy, evidence documents in this directory. |
| Out of scope | Production frontend/backend, API/schema, real upload/payment/email, provider activation, canonical route promotion, migration, deployment, human sessions, canonical decisions. |
| Authority | `NIUVA_MASTER_SPEC.md`; `DEC-PRICE-001` (`NIUVA-CP-FDM-001`); `DEC-INV-01`; `DEC-UX-003`; `FORMAL_EXPERT_CRITIQUE_RERUN_2.md`. |
| Affected paths | `app.js` (prototype only). No production or canonical files changed. |
| Done when | Both R2-P1-01 and R2-P1-02 have focused browser evidence; no new P0/P1 found; formal dual-agent critique rerun produces an evidence-backed gate decision. |
| Commit/push/PR permitted? | No. Local prototype and evidence updates only. |
| Risks or open decisions | Passing gates makes artifact ready for human sessions. Route recommendation remains `INSUFFICIENT_EVIDENCE` until real participants complete the moderated review. |

## Approved with Changes (User Review Feedback)

Eight corrections were incorporated from user review before implementation:

1. ✅ `Math.round()` explanation removed; `roundHalfUp()` helper (`Math.floor(value + 0.5)`) with non-negative guard used.
2. ✅ `printSeconds: 20700` as source of truth; `hours` is now a derived display value.
3. ✅ Added `orderReference`, `paymentAttemptReference`, `reservationStatus`, `reservationPolicyId` to state; `fresh` requires `paymentAttemptReference` or is normalized to `preview`.
4. ✅ `pay` handler fail-closed: returns to `expired`/`preview` if `orderReference`, `paymentAttemptReference`, `orderSnapshot`, atau `reservationStatus !== "active"` tidak terpenuhi. *(Catatan: versi awal tidak mengecek `reservationStatus`; diperbaiki 2 Agustus 2026.)*
5. ✅ Storage bumped to `v4`; migration normalizes v3 `checkoutState: "fresh"` without `paymentAttemptReference` to `"preview"`.
6. ✅ After `confirm-order`: fulfillment fields disabled, sidebar reads from frozen snapshot, not live cart.
7. ✅ `refresh-checkout` (expired retry): returns to `preview`, releases `paymentAttemptReference`, preserves `orderReference`. Does NOT create a new Order.
8. ✅ Mobile CTA P2 finding remediated as dependency of R2-P1-02 (state-specific labels: "Konfirmasi pesanan", "Bayar sekarang", "Periksa ulang").

## R2-P1-01 Acceptance Criteria

| Check | Required Observable |
| --- | --- |
| Configurator 86.4g PLA | Material PLA progresif, machine 5.75 jam, total Rp115.150 |
| Configurator ABS | Total Rp132.430 for same grams/seconds |
| No flat-rate text | "Rp500/g" and "Rp700/g" absent from prototype |
| Admin catalog | "PLA Rp1.000/g (pertama 200 g) · ABS Rp1.200/g (pertama 200 g)" |
| Cart item | Shows corrected total, printSeconds-derived hours |

## R2-P1-02 Acceptance Criteria

| Check | Required Observable |
| --- | --- |
| Checkout initial state | Notice: "Belum ada reservasi"; button: "Konfirmasi & buat pesanan"; kicker: "Pratinjau · belum ada reservasi" |
| After confirm-order | Notice: "Reservasi aktif 30 menit"; button: "Bayar sekarang"; fulfillment disabled |
| Pay fail-closed | Dispatching "pay" without active reservation → returns to expired, no navigation |
| Expired → refresh → reconfirm | Same orderReference dipertahankan; paymentAttemptReference baru dibuat; reservasi baru aktif |
| Pay only when reservation active | Tidak bisa bayar jika reservationStatus ≠ "active" |
| sessionStorage v4 | Key `niuva-mvp-prototype-state-v4` present; v3 key absent |
| Scenarios stale/warning/expired | Each has orderSnapshot, orderReference, paymentAttemptReference before checkout |

## Focused Revalidation Result

All acceptance criteria passed browser revalidation on the prototype server at
`http://127.0.0.1:4177` on 2 August 2026.

- **R2-P1-01 (Pricing):** 86.4g PLA shows material Rp86.400 (progresif), machine Rp28.750,
  total **Rp115.150**. ABS total Rp132.430. Admin catalog shows canonical rates.
  No flat-rate `Rp500/g` or `Rp700/g` text found anywhere.

- **R2-P1-02 (Lifecycle):** Preview state confirmed with "Belum ada reservasi" notice and
  "Konfirmasi & buat pesanan" button. After clicking confirm, orderReference and
  paymentAttemptReference created, reservation active, fulfillment locked.
  `pay` without references correctly returns to preview with announcement.
  `refresh-checkout` returns to preview (not fresh); paymentAttemptReference cleared.
  sessionStorage v4 key present; v3 key null.

- **P2 Mobile CTA:** State-specific button labels confirmed on mobile bar.

- **Original five P1 regressions:** All still pass (mixed cart identity, revision form,
  active case, operator/manager separation, Participant Mode clean).

- **`node --check`:** Both `app.js` and `server.js` pass.
- **`git diff --check`:** Tidak berlaku untuk file prototype — direktori prototype seluruhnya untracked (`??`). `git diff` tidak memeriksa file untracked. Verifikasi whitespace/sintaks untuk file prototype dilakukan via `node --check`.
- **Console:** Zero errors from `app.js`.

## Bug yang Ditemukan Pasca-Penulisan (oleh User Review)

Dua bug ditemukan oleh reviewer manusia setelah revalidation result di atas ditulis:

### BUG-3A: confirm-order menimpa orderReference pada retry

- **Root cause:** `state.orderReference` selalu di-overwrite dengan ID baru, bahkan pada retry setelah expiry.
- **Dampak:** DEC-INV-01 "same Order on retry" tidak terpenuhi secara fungsional.
- **Perbaikan:** `if (!state.orderReference) { ... }` ditambahkan sebelum assignment.
- **Status:** ✅ Diperbaiki di `app.js` — 2 Agustus 2026.

### BUG-3B: pay tidak mengecek reservationStatus

- **Root cause:** Handler `pay` hanya mengecek `orderReference`, `paymentAttemptReference`, `orderSnapshot` — tidak mengecek `reservationStatus === "active"`.
- **Dampak:** Pembayaran bisa terjadi walau reservasi expired atau belum dimulai.
- **Perbaikan:** Guard `if (state.reservationStatus !== "active") { ... }` ditambahkan.
- **Status:** ✅ Diperbaiki di `app.js` — 2 Agustus 2026.

This evidence authorizes only the formal expert critique rerun. It does not
authorize or substitute for a moderated human session. Route recommendation
remains `INSUFFICIENT_EVIDENCE`.
