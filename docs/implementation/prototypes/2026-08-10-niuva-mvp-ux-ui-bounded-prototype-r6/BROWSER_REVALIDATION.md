# R6 Browser Revalidation

Tanggal: 10 Agustus 2026
Baseline candidate: `237e64adce816f71f8461eca3242aa72edb662f2`
Prototype: `http://127.0.0.1:4176/`
Mode: browser nyata berbasis Chrome, server statis lokal, data sintetis

## Batas pemeriksaan

- Tidak ada endpoint aplikasi, API, database, provider, credential, upload,
  pembayaran, logistik, email, atau WhatsApp nyata yang dipanggil.
- `index.html` diuji sebagai Participant Mode; `review.html` diuji sebagai
  alat reviewer yang terpisah.
- Semua bukti gambar berada di `evidence/` dan bukan asset aplikasi.
- R5 hanya dibaca dan dijalankan sebagai anti-reference pada port lokal 4175;
  tidak ada file R5 yang diubah.

## Matriks viewport

| Keluarga | Scenario / keadaan | 390 px | 1440 px | Overflow | Target efektif | Participant leak |
| --- | --- | --- | --- | --- | --- | --- |
| Public/B2B | `SCN-B2B-01`, form awal | `evidence/r6-b2b-390.png` | `evidence/r6-b2b-1440.png` | Tidak | Lulus | Tidak |
| Configurator | `SCN-CUSTOM-01`, setup | `evidence/r6-configurator-390.png` | `evidence/r6-configurator-1440.png` | Tidak | Lulus melalui label radio 118–122 × 67 px | Tidak |
| Checkout | `SCN-CHK-01`, delta setelah revalidasi | `evidence/r6-checkout-stale-390.png` | `evidence/r6-checkout-stale-1440.png` | Tidak | Lulus | Tidak |
| Order | `SCN-ORD-01`, seluruh milestone | `evidence/r6-order-milestones-390.png` | `evidence/r6-order-milestones-1440.png` | Tidak | Lulus | Tidak |
| Admin | `SCN-ADM-01`, konflik versi | `evidence/r6-admin-conflict-390.png` | `evidence/r6-admin-conflict-1440.png` | Tidak | Lulus | Tidak |
| Review Mode | `SCN-ORD-01`, kontrol reviewer | `evidence/r6-review-mode-390.png` | `evidence/r6-review-mode-1440.png` | Tidak | Lulus | Tidak berlaku |

Pemeriksaan tengah disimpan di
`evidence/r6-checkout-stale-768.png` dan
`evidence/r6-admin-conflict-1024.png`. Pada seluruh hasil, lebar dokumen tidak
melebihi viewport; perbedaan 15 px adalah scrollbar vertikal browser.

Glyph radio konfigurator berukuran 18 × 44 px, tetapi berada di dalam label
klik berukuran 122 × 67 px dan 118 × 67 px. Label tersebut adalah target
interaksi efektif sehingga tidak dihitung sebagai kegagalan target 44 px.

## Alur kritis

| Alur | Bukti browser | Hasil |
| --- | --- | --- |
| Review Mode fresh/reset | Reset menghasilkan `SCN-B2B-01`, `WF-B2B-01`, dan `FX-B2B-VALID`; scenario, frame, dan fixture sinkron | Lulus |
| Offer ke checkout | `assembly-large.3mf`, PLA multicolor, `Rp185.000`, ETA 5–7 hari kerja, dan label “Harga sesuai Offer” tetap terlihat | Lulus |
| Offer ke payment dan Order | Total delivery `Rp203.000` tetap sama pada checkout, payment, dan tracking | Lulus |
| Checkout stale | `Rp45.000 + Rp18.000 + Rp2.000 = Rp65.000`; penyesuaian tetap ada setelah disetujui dan pada payment | Lulus |
| Payment uncertain | Hanya tombol “Periksa status” dan “Hubungi bantuan”; tidak ada tindakan bayar ulang | Lulus |
| Milestone Custom delivery | Sepuluh state terpisah dari `payment_confirmed` sampai `completed`; tidak ada nama state yang digabung | Lulus |
| After-sales produksi dimulai | Hanya “Komplain hasil” dan “Revisi file” | Lulus |
| After-sales belum mulai | Hanya “Tinjauan pembatalan” dan “Revisi file” | Lulus |
| Admin conflict | Konflik versi tampil secara visual dan pemulihan tidak menimpa data | Lulus |
| Ownership denial | Copy generik, tidak menyebut ID asing, dan tidak membocorkan keberadaan record | Lulus |

## Keyboard, focus, dan form error

- Tab pertama membuka skip link “Lewati ke konten utama” pada posisi terlihat.
- Enter pada skip link memindahkan focus ke `main#product-main`.
- Submit B2B kosong menghasilkan enam pesan adjacent, summary `role="alert"`,
  focus ke `#b2bError`, serta notice `aria-live="polite"` yang menyatakan tidak
  ada Inquiry dibuat.
- Focus memakai outline 3 px dan tidak bergantung pada perubahan warna saja.
- Navigasi produk mobile tetap dapat digeser horizontal tanpa scrollbar visual;
  halaman sendiri tidak overflow.
- `prefers-reduced-motion` menonaktifkan durasi animasi/transisi non-esensial;
  tidak ada `transition: all`, `scale(0)`, gradient, atau entrance `ease-in`.

## Kontras yang diperiksa

| Pasangan | Rasio |
| --- | ---: |
| Ink / page | 13.69:1 |
| Ink soft / page | 7.68:1 |
| Ink muted / page | 5.63:1 |
| White / primary action | 4.99:1 |
| White / ink hero | 14.42:1 |
| Success text / success surface | 6.42:1 |
| Warning text / warning surface | 7.48:1 |
| Danger text / danger surface | 7.40:1 |

Rasio memenuhi floor 4.5:1 untuk teks normal dan 3:1 untuk teks besar serta
batas kontrol yang diperiksa. Ini bukti prototype, bukan klaim konformitas WCAG
aplikasi produksi.

## Console dan jaringan

- Log yang berasal dari `http://127.0.0.1:4176`: **0 error, 0 warning**.
- Browser memuat dua error berulang dari ekstensi Zotero
  (`chrome-extension://...`); error tersebut tidak berasal dari prototype dan
  tidak menyentuh origin lokal.
- Pemeriksaan source dan contract test memastikan tidak ada `fetch`, XHR,
  WebSocket, EventSource, URL eksternal, atau navigasi provider.

## Identitas tanpa logo dan perbandingan

- `evidence/r6-public-logo-hidden-1440.png` memakai mode bukti lokal
  `?identity=logo-hidden`. Logo disembunyikan, sedangkan alur
  “Kebutuhan → File → Keputusan → Objek” dan bukti proyek nyata tetap terlihat.
- `evidence/r5-r6-contact-sheet.png` dan `evidence/contact-sheet.html`
  membandingkan B2B Inquiry, Retail, serta Admin recovery secara berdampingan.

## Disposition

Browser revalidation: **PASS WITH CONDITIONS — READY FOR SEPARATE EXPERT
REVIEW**.

Kondisinya: formal expert critique independen belum dijalankan, sehingga artifact
ini belum siap untuk moderated human session dan tidak memberi izin perubahan
aplikasi, canonical promotion, provider activation, deployment, readiness, atau
go-live.
