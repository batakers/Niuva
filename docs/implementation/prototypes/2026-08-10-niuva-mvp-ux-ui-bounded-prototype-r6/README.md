# Niuva MVP UX/UI Bounded Prototype — R6

Prototype statis ini adalah alat validasi berbasis data sintetis. Ia dibangun
dari empat dokumen candidate pada commit `237e64adce816f71f8461eca3242aa72edb662f2`
dan tidak menjadi bagian dari aplikasi Niuva.

## Menjalankan secara lokal

Dari direktori ini:

```powershell
node --check app.js
node --check fixtures.js
node --check server.cjs
node --test prototype-flow.contract.test.cjs
node server.cjs
```

- Tugas pengguna: `http://127.0.0.1:4176/index.html`
- Persiapan reviewer: `http://127.0.0.1:4176/review.html`
- Pemeriksaan identitas tanpa mark:
  `http://127.0.0.1:4176/index.html?identity=logo-hidden`
- Hentikan server dengan `Ctrl+C`.

## Pemisahan permukaan

`index.html` adalah Participant Mode yang netral. Halaman ini tidak
menampilkan ID frame/transisi/skenario/fixture, route internal, open gate,
catatan evaluator, selector skenario, atau event log.

`review.html` adalah Review Mode. Reviewer memilih data sintetis dan membuka
tugas pengguna pada tab yang sama. Seed disimpan sementara melalui
`sessionStorage`; reset menghapus state tersebut. Review Mode bukan permukaan
untuk partisipan.

## Arah visual

- Halaman publik: editorial dan berbasis bukti karya nyata.
- Retail: workspace spesifikasi yang menjaga alur kebutuhan → file → keputusan
  → objek, bukan tampilan marketplace generik.
- Admin: ledger operasional yang padat, dengan kewenangan, versi, konflik, dan
  tindakan berikutnya yang terlihat.

Semua arah memakai token warna Niuva yang sudah ada, tipografi sistem tanpa
unduhan eksternal, fokus keyboard terlihat, target sentuh minimum 44px, dan
dukungan `prefers-reduced-motion`.

## Batas keselamatan

- Inventori tetap: 37 frame, 95 transisi, 43 fixture, dan 44 skenario.
- Tidak ada API, database, provider pembayaran/logistik/storage, email,
  WhatsApp otomatis, unggah file, slicer, credential, atau endpoint eksternal.
- `quote_required` hanya membuat Request setelah tindakan eksplisit; tidak
  membuat pesanan, reservasi, pembayaran, atau total checkout.
- Hasil pembayaran yang belum pasti tidak menawarkan bayar ulang.
- Cart dan route after-sales pelanggan tetap candidate/TBD.
- Aset proyek berasal dari repository dan dicatat pada `ASSET_MANIFEST.md`.

## Bukti dan gate

Hasil browser dicatat dalam `BROWSER_REVALIDATION.md`; evaluasi visual dalam
`VISUAL_QA.md`; capture lokal dan contact sheet berada di `evidence/`.
Disposition build adalah `PASS WITH CONDITIONS — READY FOR SEPARATE EXPERT
REVIEW`. Artifact ini belum mengizinkan implementasi aplikasi, sesi manusia,
perubahan canonical, provider activation, deployment, readiness, atau go-live.
Formal expert critique independen tetap gate terpisah.
