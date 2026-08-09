# R6 Visual QA

Tanggal: 10 Agustus 2026
Baseline candidate: `237e64adce816f71f8461eca3242aa72edb662f2`

## Design read dan dials

| Permukaan | Arah | Variance / motion / density | Anchor yang harus tetap dikenali | Hasil R6 |
| --- | --- | --- | --- | --- |
| Public/B2B | Experimental Editorial Hybrid | 7 / 4 / 4 | Kebutuhan ke objek dan bukti proyek nyata | Terlihat melalui hirarki asimetris, hero editorial, process thread, dan dua image proyek repository |
| Retail/customer | Product Specification Workspace | 4 / 2 / 5 | Object Specification lintas configure, checkout, dan Order | Terlihat melalui evidence thread, detail file/material, delta harga, dan snapshot Offer |
| Admin/CMS | Calm Operational Workspace | 2 / 1 / 7 | Record, state, next action, conflict, audit | Terlihat melalui queue ledger, context strip, status, konflik, dan batas kewenangan |
| Review Mode | Compact evidence tool | 1 / 1 / 7 | Scenario, fixture, frame, dan event saja | Terpisah pada `review.html`; tidak hadir pada Participant DOM |

Poppins dan Inter tersedia pada browser pemeriksaan. Mono hanya dipakai untuk
identifier, waktu, atau pengukuran. Tidak ada font, palette, UI kit, gradient,
glass, glow, emoji, atau icon family baru.

## R5 anti-reference ke R6

| Before R5 | After R6 | Why | Evidence |
| --- | --- | --- | --- |
| Reviewer chrome, sidebar bernomor, open gate, dan ID packet berada di sebelah task B2B | Participant B2B hanya menampilkan form, consent, recovery, dan tindakan produk berbahasa Indonesia | Partisipan menilai produk, bukan membaca spesifikasi | `evidence/r5-b2b-1440.png`, `evidence/r6-b2b-1440.png` |
| Retail memakai shell generik dan tiga kartu marketplace | Retail menjadi workspace dua jalur: produk siap dan Custom 3D Print dengan evidence thread serta komitmen per item | Mempertahankan posisi Niuva sebagai jasa/specification workspace | `evidence/r5-retail-1440.png`, `evidence/r6-retail-1440.png` |
| Admin memakai KPI card generik dan reviewer chrome | Admin menjadi queue ledger padat dengan role context, state, conflict, dan next action | Operator non-IT memperoleh pekerjaan yang dapat ditindaklanjuti tanpa kehilangan guardrail | `evidence/r5-admin-conflict-1440.png`, `evidence/r6-admin-conflict-1440.png` |
| Satu shell biru/putih dipakai lintas permukaan | Public terbuka/editorial, Retail specification-led, Admin ledger-led, Review Mode alat bukti | Shared tokens tidak berubah menjadi shared template | `evidence/r5-r6-contact-sheet.png` |
| English marketing hierarchy muncul pada task operasional | Participant copy Indonesian-first; skala marketing dibatasi pada homepage | Hierarki mengikuti konteks tugas | seluruh contact sheet R6 |
| Status memakai technical/decorative labels | Status memakai teks faktual dengan border/surface semantik | Status menyampaikan arti, bukan dekorasi | checkout, Order, Admin, after-sales captures |

## Contact-sheet index

- Public/B2B: `r6-b2b-390.png`, `r6-b2b-1440.png`.
- Configurator: `r6-configurator-390.png`, `r6-configurator-1440.png`.
- Checkout/payment recovery: `r6-checkout-stale-390.png`,
  `r6-checkout-stale-768.png`, `r6-checkout-stale-1440.png`.
- Order/after-sales: `r6-order-milestones-390.png`,
  `r6-order-milestones-1440.png`.
- Admin/CMS: `r6-admin-conflict-390.png`, `r6-admin-conflict-1024.png`,
  `r6-admin-conflict-1440.png`.
- Review Mode: `r6-review-mode-390.png`, `r6-review-mode-1440.png`.
- Identity without mark: `r6-public-logo-hidden-1440.png`.
- R5/R6 comparison: `r5-r6-contact-sheet.png` dan `contact-sheet.html`.

## Copy dan state review

| State | Review |
| --- | --- |
| Hover | Hanya pada fine pointer; warna/border berubah tanpa displacement atau layout shift |
| Focus | Outline 3 px terlihat; skip link dan focus recovery lulus browser check |
| Active/current | Nav, option, step, dan milestone memakai underline/border/state text; tidak hanya warna |
| Disabled | Opacity dan cursor berbeda; dipakai untuk tindakan Admin yang belum berwenang |
| Loading | Prototype lokal bersifat sinkron dan tidak membuat spinner/provider wait palsu; async production loading tetap di luar scope artifact |
| Error | Summary + adjacent message + recovery; tidak ada success palsu |
| Stale/conflict | Old/new delta dan konflik operator terlihat; nilai yang berubah dijelaskan |
| Success | Status final dan next action terlihat; tidak hanya diumumkan lewat live region |
| Empty/denied | Copy generik dan customer-safe; tidak mengenumerasi record asing |

Participant string audit menemukan nol `WF-*`, `PT-*`, `SCN-*`, atau `FX-*`
pada body. CTA utama stabil dan Indonesian-first. Kata teknis yang tersisa hanya
nama produk/domain yang diperlukan seperti Custom 3D Print, Offer, Request,
quality control, dan file extension.

## Asset truth

- Logo dan empat image proyek berasal dari repository; hash, dimensi, source,
  dan alt intent dicatat di `ASSET_MANIFEST.md`.
- Homepage merender dua image nyata: Pindad EV Motor dan Agate Motorcycle
  Simulator.
- Tidak ada product render, process photography, client proof, atau commercial
  claim baru yang difabrikasi. Kekurangan process photography tidak digantikan
  oleh gradient, doodle, atau synthetic illustration.
- Nilai harga, ETA, stock, payment, dan order selalu diberi konteks simulasi.

## Impeccable detector

Detector dijalankan **tepat satu kali** setelah build visual lengkap:

```text
node C:\Users\FAIZ\.agents\skills\impeccable\scripts\detect.mjs --json app.js styles.css index.html review.html
```

Hasil awal: lima warning `side-tab` pada `styles.css`. Seluruhnya ditutup dalam
satu refinement batch:

- notice memakai border seragam;
- status badge memakai border semantik seragam;
- changed total memakai outline warning seragam;
- permission box memakai outline netral; dan
- notice card memakai outline netral.

Detector tidak dijalankan ulang sesuai batas task card. Contract test dan source
assertion kemudian memastikan tidak ada `border-left` di atas 1 px, gradient,
glass, `transition: all`, `scale(0)`, atau tracking di bawah -0.04em.

## Inline finish-review substitution

Review ini dijalankan inline karena harness tidak memakai subagent. Input yang
tidak tersedia: approved visual comp, QUALITY BAR card, serta concept-roll FORM
seed key; amended candidate packet dan task card dipakai sebagai direction
contract yang tersedia.

disposition: fix

### persistence

Pass untuk `PRODUCT.md`, `DESIGN.md`, packet, task card, baseline SHA, asset
manifest, dan bukti R5/R6. Tidak ada comp approval record karena tidak ada comp
yang dipilih pada task ini.

### fidelity

| Elemen | Klasifikasi | Bukti |
| --- | --- | --- |
| Public asymmetric hierarchy dan real project proof | match | homepage dan logo-hidden capture |
| Retail specification workspace | match | configurator, checkout, Offer, dan Order evidence |
| Admin dense recovery ledger | match | Admin conflict capture |
| Review/Participant separation | match | DOM audit dan paired captures |
| Type | match | Poppins/Inter tersedia dan sesuai `DESIGN.md` |
| Material | acceptable adaptation | Real repository images dipakai pada public; transactional fixtures sengaja tetap data sintetis |
| Approved comp / concept seed | missing | Task tidak memiliki selected comp atau concept-roll seed |

### ceiling

Surface-specific composition, real image evidence, flat-first material, clear
type hierarchy, semantic states, and responsive reflow tercapai. Motion sengaja
dibatasi karena artifact adalah alat validasi deterministic.

### material_fixes

1. Jalankan formal visual concept/comp approval terpisah bila prototype hendak dinilai sebagai final visual direction, bukan bounded validation artifact.
2. Jalankan formal expert critique independen terhadap capture R6 sebelum moderated session.

### keep

Pertahankan pemisahan Participant/Review, evidence thread, Offer snapshot, state
faktual, dan tiga komposisi permukaan yang berbeda.

Kata `fix` di atas adalah disposition Impeccable terhadap input visual-direction
yang belum lengkap, bukan temuan P0/P1 flow baru. Prototype build disposition
tetap **PASS WITH CONDITIONS — READY FOR SEPARATE EXPERT REVIEW**, bukan ready
untuk moderated session.
