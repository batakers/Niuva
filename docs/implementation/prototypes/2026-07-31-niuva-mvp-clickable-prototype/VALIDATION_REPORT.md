# Niuva MVP Clickable Prototype — Validation Report

Tanggal validasi awal: 31 Juli 2026
**Tanggal validasi R3: 2 Agustus 2026**
**Tanggal focused revalidation R6: 2 Agustus 2026**
**Tanggal formal critique R7: 3 Agustus 2026**
Artifact: `docs/implementation/prototypes/2026-07-31-niuva-mvp-clickable-prototype/`
Runtime: static Node.js server; port `4177`
Browser: Google Chrome lokal melalui Playwright
Viewport: desktop `1440 × 1000` dan mobile `390 × 844`
Reduced motion: aktif pada browser validation context

## Outcome

Status: **NOT READY — formal expert critique R7 failed with four open P1s**.

Round 5 dicatat sebagai historical PASS, tetapi invalid untuk current gate karena
tidak menguji clean-session direct Order URL dengan ID non-fixture dan merujuk
recording yang tidak tersedia dalam artifact repository. Focused browser
revalidation R6 menutup mismatch tersebut:

- direct `/orders/NV-DIRECT-999` menampilkan H1 yang sama;
- cancellation dan return links mempertahankan Order ID;
- dashboard pada session yang sama mempertahankan Order ID; dan
- browser console mencatat 0 error.

Formal expert critique R7 sudah dijalankan setelah focused R6. Review tersebut
terdegradasi menjadi sequential single-context karena dua independent agent
gagal sebelum menghasilkan evidence akibat account usage limit. Browser review
menemukan empat P1 baru: default Admin case dead end dan Participant Mode leak,
legacy `/order` tidak mengikuti safe-unavailable canonical contract, mobile
sticky CTA generik, serta active reservation yang hilang konteks ketika kembali
ke cart. Prototype belum boleh dipakai untuk moderated human session.

Route recommendation tetap `INSUFFICIENT_EVIDENCE`.

Temuan sebelumnya:

- R2-P1-01 (pricing): CLOSED Round 3
- R2-P1-02 (lifecycle): CLOSED Round 3
- BUG-3A (confirm-order preserve orderReference): CLOSED Round 3/4
- BUG-3B (pay guard reservationStatus): CLOSED Round 3/4
- R4-P1-01 (generated/retry identity): CLOSED Round 5
- R6-P1-01 (clean direct-entry identity): CLOSED focused R6; formal gate pending

## Evidence summary

| Check | Hasil |
| --- | --- |
| JavaScript syntax | PASS — `app.js` dan `server.js` |
| Actual server smoke | PASS — direct `/orders/NV-DEMO-014` HTTP 200, HTML, dan CSP header |
| Patch whitespace | N/A — direktori prototype untracked; `git diff --check` tidak memeriksa file untracked |
| Direct route matrix | FAIL in R7 — 34 route/alias lama tetap valid; tambahan canonical check `/order` jatuh ke prototype 404 |
| Route classification | PASS — 5 candidate route dan 1 legacy route diberi label sesuai |
| Scenario selector | PASS — 29/29 fixture membuka layar valid tanpa 404 |
| P0 state integrity | PASS — Custom cart identity, mixed cart, auth continuation, dan cancellation bertahan saat refresh |
| Participant neutrality | FAIL in R7 — Panel Moderator tersembunyi, tetapi default Admin missing-case copy membocorkan instruksi “Panel Moderator” |
| Canonical alignment | FAIL in R7 — aliases dan `/admin/orders` benar; `/order` belum memiliki safe-unavailable compatibility state |
| After-sales review paths | PASS — lifecycle gate, intake, truthful evidence, customer case, Admin case, dan direct refresh |
| Additional branch checks | PASS — safe 3MF, superseded offer, pickup, delivery |
| Automated accessibility | PASS — 0 axe violation pada 7 remediation-critical route |
| Mobile candidate routes | PASS — 0 horizontal overflow pada 6 cart/checkout/after-sales route |
| Touch target | PASS — tidak ada visible control di bawah 44 px pada 6 changed mobile route |
| Keyboard/focus | PASS — skip link first, skip target main, SPA route focus main |
| Operator mobile menu | PASS — state visible, `aria-expanded=true`, route navigation berhasil |
| Browser console | PASS — 0 console error dan 0 uncaught page error |
| Impeccable detector | PASS — `[]`, exit code `0` setelah remediation |
| Visual inspection | FAIL in R7 — sticky mobile Ready Product dan cart masih memakai label generik “Lanjut” |
| **R3: R2-P1-01 pricing** | **PASS** — PLA 86.4g = Rp115.150, ABS Rp132.430, no Rp500/g or Rp700/g |
| **R3: R2-P1-02 lifecycle (partial)** | **INCOMPLETE** — dua bug ditemukan pasca-penulisan: confirm-order overwrite + pay tanpa reservationStatus guard |
| **R3: BUG-3A fix** | ✅ confirm-order preserves orderReference on retry — 2 Agustus 2026 |
| **R3: BUG-3B fix** | ✅ pay requires reservationStatus === "active" — 2 Agustus 2026 |
| **R3: Mobile CTA labels** | **PASS** — state-specific: "Konfirmasi pesanan" / "Bayar sekarang" / "Periksa ulang" |
| **R3: sessionStorage v4** | **PASS** — v4 key present; v3 key null |
| **R3: Formal critique (Round 3)** | **NOT VALID** — dua bug kode ditemukan; dokumen dikoreksi; Round 4 diperlukan |
| **R4: Retry chain** | **PASS** — simulasi Node.js: STATE_3 orderReference=NV-DEMO-EXP dipertahankan; paymentAttemptReference baru |
| **R4: Pay guard** | **PASS** — simulasi Node.js: "blocked by reservationStatus guard" |
| **R4: ABS pricing** | **PASS** — aritmetika: 86.4g × Rp1.200/g (pertama 200g) = Rp103.680 + mesin Rp28.750 = Rp132.430 |
| **R4: Formal critique (Round 4)** | **FAIL — NOT VALID** — P1 order identity mismatch: `navigate("/orders/NV-DEMO-014")` hardcoded; ditemukan live browser |
| **R4-P1-01 fix: `activeOrderRef()` helper** | ✅ helper ditambahkan; semua customer-facing render pakai `activeOrderRef()` |
| **R4-P1-01: pay navigate** | ✅ `navigate("/orders/" + state.orderReference)` |
| **R4-P1-01: scenario targets** | ✅ `state.orderReference \|\| "NV-DEMO-014"` fallback |
| **R4-P1-01: node --check** | ✅ exit code 0 setelah fix |
| **R5: Retry chain URL** | **PASS** — browser: `/orders/NV-DEMO-EXP` setelah pay retry |
| **R5: H1 heading** | **PASS** — browser: `NV-DEMO-EXP` |
| **R5: First-confirm URL** | **PASS** — browser: `/orders/NV-DEMO-1458` |
| **R5: After-sales cancellation link** | **PASS** — browser: `/orders/NV-DEMO-1458/cancellation` |
| **R5: Console errors** | **PASS** — zero errors |
| **R5: Formal critique (Round 5)** | **INVALIDATED FOR CURRENT GATE** — clean-session non-fixture direct entry was not tested and cited recording is not in the repository artifact |
| **R6: Direct Order URL** | **PASS** — `/orders/NV-DIRECT-999` renders H1 `NV-DIRECT-999` in a clean browser session |
| **R6: After-sales identity** | **PASS** — cancellation and return links retain `/orders/NV-DIRECT-999` |
| **R6: Dashboard persistence** | **PASS** — session state and dashboard retain `NV-DIRECT-999` |
| **R6: Console errors** | **PASS** — 0 errors and 0 warnings |
| **R6: Focused revalidation** | **PASS** — targeted finding closed |
| **R7: Formal expert critique** | **FAIL — DEGRADED** — 0 P0, 4 P1, 1 P2; sequential fallback after both independent agents hit account usage limit |
| **Current formal gate** | **NOT READY** — remediasi prototype-only dan revalidation penuh diperlukan |

## Direct route matrix

Route berikut dibuka sebagai direct URL, bukan hanya melalui client navigation:

```text
/
/about
/capabilities
/services
/projects
/portfolio
/contact
/retail
/retail/products/ready-keychain
/retail/products/custom-fdm
/retail/products/custom-fdm/configure
/retail/cart
/login
/register
/retail/checkout
/order
/dashboard
/dashboard/notifications
/retail/requests/REQ-DEMO-01
/retail/offers/OFF-DEMO-01
/orders/NV-DEMO-014
/orders/NV-DEMO-014/file-revision
/orders/NV-DEMO-014/cancellation
/orders/NV-DEMO-014/complaints/new
/orders/NV-DEMO-014/complaints/CASE-DEMO-01
/admin
/admin/content
/admin/catalog
/admin/retail-requests
/admin/retail-requests/REQ-DEMO-01
/admin/retail-orders
/admin/retail-orders/NV-DEMO-014
/admin/retail-cases
/admin/retail-cases/CASE-DEMO-01
/admin/orders
```

`/services` diarahkan ke `/capabilities`; `/portfolio` diarahkan ke `/projects`.
Keduanya menggunakan client-side `replaceState` pada prototype. Mekanisme HTTP
redirect produksi tidak diklaim. R7 menambahkan pemeriksaan `/order`; route ini
masih jatuh ke prototype 404 dan membuka `R7-P1-02` karena belum mengikuti
safe-unavailable compatibility state dari `DEC-UX-003`.

Expected classification terbukti:

- candidate: `/retail/cart`, customer file revision, cancellation, complaint
  intake, dan owned case detail;
- legacy read-only: `/admin/orders`;
- route lain dalam matrix mengikuti route canonical/prototype-helper classification.

## Customer scenario coverage

| Contract concern | Prototype evidence | Status |
| --- | --- | --- |
| Ready Product happy path | Product detail → cart → login → checkout → order | PASS |
| Custom sederhana | Valid STL, simple controls, slicer output, price | PASS |
| Custom detail | Layer height dan infill visible | PASS |
| Supported 3MF | 3MF diterima, customer printer profile diabaikan | PASS |
| Invalid/unsafe upload | Error jelas, tidak membuat order, retry tersedia | PASS |
| Slicing failure | Routing ke `quote_required` | PASS |
| Mixed cart | Ready dan Custom dikelompokkan dengan ETA/fulfillment terpisah | PASS |
| Assisted Offer lifecycle | offered, accepted, declined, expired, superseded | PASS |
| Accepted offer boundary | Acceptance belum membuat order; login dan checkout tetap wajib | PASS |
| Stale price/ETA/rate | Reconfirmation sebelum pembayaran | PASS |
| Reservation | 30 menit, warning 5 menit, expiry, dan refresh | PASS |
| File revision | Exact deadline dan candidate revision route | PASS |
| Production tracking | Delapan milestone, ETA change/overdue, pickup, delivery, receipt | PASS |
| Complaint/reprint/refund | Complaint hanya setelah receipt; optional private evidence dan operator resolution flow | PASS |
| Recovery | Session expiry, ownership denial, backend unavailable, retry | PASS |

## Operator scenario coverage

| Contract concern | Prototype evidence | Status |
| --- | --- | --- |
| Satu operator lintas area | Persistent order context dan navigation antar-area | PASS |
| Role-aware dashboard | Ranked next actions; bukan KPI grid | PASS |
| Default case next action | Dashboard mengiklankan CASE-DEMO-01, tetapi case tidak tersedia tanpa fixture moderator | **FAIL — R7-P1-01** |
| Offer + manager approval | Draft dan approval dicatat sebagai langkah terpisah meski role dapat digabung | PASS |
| Safe file review | STL/3MF only, customer profile ignored, `.gcode` rejected | PASS |
| Stale/conflict recovery | Save ditolak saat versi berubah; reload/compare message | PASS |
| Notification failure | Core milestone tetap tersimpan; email retry terpisah | PASS |
| Refund/reprint separation | Operator review → manager approval → Finance execution | PASS |

## Accessibility and responsive evidence

Automated axe audit remediation dijalankan pada:

- `/retail/cart`
- `/retail/checkout`
- `/orders/NV-DEMO-014/cancellation`
- `/orders/NV-DEMO-014/complaints/new`
- `/orders/NV-DEMO-014/complaints/CASE-DEMO-01`
- `/admin`
- `/admin/retail-cases/CASE-DEMO-01`

Satu temuan remediation awal:

- active Admin navigation memiliki rasio `4.38:1`.

Warna active navigation diperbaiki. Audit terbaru pada tujuh
remediation-critical route menghasilkan **0 violation**.

Mobile validation terbaru pada cart, checkout, file revision, cancellation,
complaint intake, dan case detail menghasilkan:

- `scrollWidth === clientWidth`;
- tidak ada visible link/button/input/select/textarea dengan tinggi di bawah 44 px;
- Participant Mode tidak menampilkan Panel Moderator;
- sticky cart/checkout action tetap berada di viewport tanpa horizontal
  overflow.

Baseline operator mobile sebelumnya juga membuktikan menu terbuka,
`aria-expanded=true`, dan navigation menuju Catalog & Stok.

Keyboard validation:

1. Tab pertama pada initial load menuju **Lewati ke konten utama**.
2. Enter pada skip link memindahkan focus ke `#main-content`.
3. Client-side route navigation memindahkan focus ke `#main-content`.
4. Simple/detail, material, quality, dan upload actions dapat dicapai dengan Tab.
5. Tidak ditemukan keyboard trap pada focused interaction pass.

## Recovery behavior verified

- Invalid file tidak disamarkan sebagai sukses dan tidak meminta pembayaran.
- `quote_required` tidak menghasilkan order langsung.
- Accepted offer tidak menghasilkan order langsung.
- Expired checkout melepaskan simulasi reservasi dan meminta availability refresh.
- Stale checkout mewajibkan reconfirmation.
- Ownership denial tidak membocorkan detail order.
- Backend failure tidak dirender sebagai empty success.
- Conflict mencegah silent overwrite.
- Email failure tidak me-rollback milestone yang sudah tersimpan.
- Refund approval tidak disamakan dengan Finance execution.

## Known limitations and next gate

- Validasi ini memakai data simulasi dalam tab-scoped `sessionStorage`; belum
  ada API contract execution atau persistence backend.
- Belum ada usability session dengan operator Niuva yang sebenarnya.
- Moderated review plan dan results template sudah siap, tetapi belum berisi
  observasi peserta manusia.
- Temuan pricing, reservation lifecycle, dan direct/deep Order identity dari
  round sebelumnya sudah memiliki bukti focused closure. Formal critique R7
  membuka empat P1 baru pada default operator case, `/order` compatibility,
  mobile sticky CTA, dan active-reservation/cart recovery. Moderated session
  tetap belum siap.
- Route candidate tetap candidate walaupun prototipe dapat diklik.
- Provider pembayaran/logistik, email, storage, slicer, dan authentication belum dipilih/diaktifkan.
- Exact business content dan produksi nyata belum diuji.

Rekomendasi gate berikutnya:

1. remediasi prototype-only `R7-P1-01` sampai `R7-P1-04` dan
   `R7-P2-01` pada `FORMAL_EXPERT_CRITIQUE_RERUN_7.md`;
2. lakukan focused browser revalidation dan formal expert critique ulang dengan
   evidence assessment independen yang pulih;
3. hanya setelah expert gate lulus, jalankan `MODERATED_USABILITY_REVIEW_PLAN.md`
   bersama satu operator non-IT dan satu calon pelanggan;
4. catat temuan per scenario tanpa mengubah status route canonical secara otomatis;
5. putuskan apakah candidate cart dan customer after-sales route layak dipromosikan;
6. setelah sign-off UX terpisah, turunkan route contract menjadi implementation backlog/API contract—tetap dengan authorization terpisah.
