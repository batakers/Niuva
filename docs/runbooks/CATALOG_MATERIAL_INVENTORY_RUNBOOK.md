# Catalog, Material Pricing, and Inventory Foundation Runbook

Dokumen ini adalah panduan rollout, rollback, operasi, dan handoff untuk foundation Catalog, Material Pricing, Inventory, Reservation, dan Restock NIUVA. Dokumen tidak memuat credential, connection string produksi, atau data pelanggan.

## 1. Ruang Lingkup dan Pemilik

| Area | Pemilik operasional | Pemilik persetujuan |
|---|---|---|
| Katalog, kategori, varian, publikasi | Catalog Manager | Manager/Approver |
| Registry bahan baku | Warehouse | Manager/Approver |
| Harga resmi bahan baku | Catalog Manager | Manager/Approver |
| Saldo, movement, dan reservation | Warehouse | Manager/Approver |
| Damage dan adjustment | Manager/Approver | Super Admin |
| Alert restock | Warehouse | Manager/Approver |
| Identity, permission, index, restore | Super Admin | Manager/Approver |

Foundation ini tidak menghitung harga jual calculated di browser, tidak menangani checkout/payment, dan tidak menampilkan kuantitas stok internal kepada pelanggan.

## 2. Prasyarat MongoDB Replica Set dan Capability Check

Setup local, isolated test topology, readiness fields, troubleshooting, dan
reset aman mengikuti `doc/TRANSACTION_CAPABILITY_RUNBOOK.md`.

Publikasi katalog dan setiap mutation inventory memerlukan transaction. Standalone MongoDB hanya boleh melayani read dan mutation non-transaksional yang aman.

1. Pastikan MongoDB berjalan sebagai replica set dan logical sessions tersedia.
2. Jalankan aplikasi terhadap environment non-produksi.
3. Periksa `GET /api/health`.
4. Lanjutkan mutation hanya jika respons berisi `{"status":"ok","transactions":true}`.

Aplikasi tidak mencetak connection string. Jika capability bernilai `false`, endpoint publish/inventory mengembalikan `503 transaction_unavailable`.

## 3. Backup Non-Produksi

Sebelum migration apply:

1. Catat nama environment dan waktu backup tanpa menulis credential ke repository.
2. Buat dump database non-produksi dengan mekanisme resmi operator.
3. Verifikasi dump dapat dibaca dan berisi collection `materials`, `orders`, `users`, dan `audit_events`.
4. Simpan checksum dan lokasi backup pada sistem operasional perusahaan, bukan pada repository.
5. Jangan memakai data pelanggan produksi untuk latihan migration.

## 4. Migration Dry Run

Dari folder `backend`, dengan environment non-produksi aktif:

```powershell
.\.venv\Scripts\python.exe -m migrations.002_catalog_material_inventory
```

Tanpa `--apply`, perintah wajib bersifat read-only. Ringkasan berisi:

- `scanned`
- `changed` (jumlah yang akan berubah)
- `already_migrated`
- `needs_review`
- `collisions`
- `failures`
- `affected_material_ids`
- `dry_run: true`

Hentikan rollout jika `collisions` atau `failures` lebih dari nol. Periksa hanya ID internal yang dilaporkan; jangan menyalin data pelanggan.

## 5. Migration Apply

Setelah backup dan dry-run disetujui:

```powershell
.\.venv\Scripts\python.exe -m migrations.002_catalog_material_inventory --apply
```

Apply mempertahankan `materials.id`, `orders.material_id`, nama snapshot order, dan timestamp legacy. Apply membuat SKU deterministik, menandai `setup_status=needs_review`, memetakan boolean `active` ke `status`, dan membuat index terpusat. Apply tidak membuat harga atau saldo stok fiktif. Jalankan dry-run sekali lagi; hasil aman adalah `changed: 0`.

## 6. Penyelesaian Setup Material Legacy

Warehouse membuka Admin Studio → Materials dan menyaring `NEEDS_REVIEW`. Untuk setiap record:

1. Verifikasi nama, deskripsi, warna, dan SKU.
2. Pilih satu canonical base unit.
3. Isi supplier reference internal bila diperlukan.
4. Isi waste percentage, reorder point, lead time, dan tracking policy.
5. Ubah `setup_status` menjadi `ready` hanya setelah base unit dan SKU benar.
6. Simpan, lalu minta Manager/Approver melakukan spot-check.

Harga dan inventory write ditolak selama material masih `needs_review`.

## 7. Publish dan Rollback Katalog

1. Catalog Manager melengkapi Basic, Media + alt text, Variants + SKU, Options, dan Pricing/Stock.
2. Simpan working draft. Draft tidak mengubah data publik aktif.
3. Jalankan server validation dan perbaiki semua error per field.
4. Masukkan alasan 3–500 karakter.
5. Publish membuat snapshot immutable dengan revision baru dalam transaction.
6. Untuk rollback, pilih snapshot historis dan masukkan alasan. Sistem menyalinnya menjadi revision baru; snapshot lama tidak dimutasi.
7. Verifikasi endpoint publik hanya membaca `active_publication_id`.

Archive menghilangkan publication aktif dari publik tanpa menghapus histori.

## 8. Update dan Koreksi Harga Material

1. Pastikan material `ready` dan `price_unit` sama dengan base unit.
2. Masukkan amount integer IDR, waktu efektif timezone-aware, dan alasan.
3. Append membuat versi immutable; tidak ada endpoint update/delete versi harga.
4. Harga future tidak menjadi current sebelum waktunya.
5. Jika input salah, append versi koreksi baru dengan waktu efektif dan alasan yang jelas. Jangan mengubah dokumen lama langsung di database.

## 9. Operasi Stok, Reservation, dan Recovery Konflik

Setiap request mutation menggunakan caller-supplied UUID `operation_id`:

- Replay payload yang sama mengembalikan movement asli.
- UUID yang sama dengan payload berbeda menghasilkan `409 operation_id_conflict`.
- `receive` hanya untuk material; `produce` hanya untuk ready-stock variant.
- `damage` dan `adjustment` memerlukan `inventory.adjust`.
- Quantity tetap Decimal string dari UI sampai divalidasi API.
- Reservation aktif dapat di-release atau di-consume/ship tepat satu kali.
- Worker expiry memakai UUID5 deterministik sehingga aman pada beberapa instance.

Jika menerima stale/balance version conflict, muat ulang balance, periksa movement terbaru, buat operation ID baru, lalu kirim ulang berdasarkan state baru. Jangan mengulang payload berbeda dengan operation ID lama.

## 10. Delivery dan Resolusi Alert Restock

Trigger internal:

- `reorder_point` ketika available tidak lebih besar dari threshold.
- `projected_shortage` ketika projected kurang dari nol.

Satu active deduplication key menghasilkan satu alert. Notifikasi in-app dibuat untuk Warehouse, Manager/Approver, dan Super Admin yang aktif. Email dikirim setelah transaction commit; kegagalan email tidak membatalkan stock movement. Warehouse/Manager meninjau alert, melakukan replenishment, lalu resolve dengan alasan. Kondisi pulih juga dapat auto-resolve alert.

## 11. Post-Deployment Verification

Gunakan API non-produksi dan query read-only:

1. `GET /api/health` menunjukkan transaction capability aktual.
2. Pastikan slug kategori/produk, SKU material/varian, publication revision, material/effective price, inventory subject, operation ID, reservation ID, dan active restock key unik.
3. Bandingkan setiap balance dengan replay movement secara offline pada sample data.
4. Pastikan setiap mutation memiliki audit event terkait.
5. Pastikan public catalog tidak memiliki supplier reference, harga bahan, exact balances, reorder point, planned demand, actor ID, alasan internal, atau audit payload.
6. Pastikan order legacy masih menunjuk material ID yang sama.
7. Jalankan full backend/frontend verification pada bagian 15.

## 12. Batas Rollback Aplikasi dan Restore Database

- Code rollback boleh mengembalikan deployment aplikasi, tetapi tidak boleh menghapus publication, price version, movement, reservation transition, atau audit event yang sudah committed.
- Migration bersifat in-place dan tidak menyediakan down migration otomatis.
- Restore database hanya dilakukan operator berwenang dari backup tervalidasi dan memerlukan downtime/isolasi writer.
- Jangan menjalankan aplikasi versi lama yang melakukan hard-delete material setelah migration.
- Setelah restore, jalankan capability probe, migration dry-run, ensure indexes, dan consistency check sebelum membuka mutation.

## 13. Emergency: Balance dan Movement Tidak Cocok

1. Nonaktifkan mutation inventory pada environment terdampak; read tetap tersedia.
2. Catat subject type/ID, waktu deteksi, balance version, dan operation IDs tanpa data pelanggan.
3. Ekspor movement subject secara read-only dan replay menggunakan aturan domain yang sama.
4. Jangan mengedit atau menghapus movement.
5. Bandingkan hasil replay dengan materialized balance.
6. Manager/Approver menentukan adjustment bertanda; masukkan reason insiden dan operation ID baru.
7. Super Admin memverifikasi audit, restock side effects, dan reservation aktif.
8. Jika integritas transaction diragukan, isolasi database dan lakukan restore sesuai bagian 12.

## 14. Handoff Checklist

- [ ] Super Admin mengetahui lokasi environment configuration dan backup SOP.
- [ ] Manager/Approver memahami approval archive, damage, adjustment, dan price correction.
- [ ] Catalog Manager dapat membuat draft, memvalidasi, publish, dan rollback.
- [ ] Warehouse dapat menyelesaikan material legacy, receive, reserve, release, dan resolve alert.
- [ ] Sales/Estimator memahami bahwa akses katalog/material/inventory bersifat read-only.
- [ ] Tim support memahami pesan `transaction_unavailable`, stale version, dan operation ID conflict.
- [ ] Tidak ada credential atau production connection string di source/runbook.
- [ ] Migration dry-run, apply, dan second-run no-op telah dibuktikan pada data isolasi.
- [ ] Test transaksi replica-set real telah dijalankan pada daemon Docker/Mongo yang ready.
- [ ] Browser QA role matrix telah dicatat.

## 15. Perintah Verifikasi

Backend dari root worktree:

```powershell
.\backend\.venv\Scripts\python.exe -m compileall -q backend
.\backend\.venv\Scripts\python.exe -m pytest -q --basetemp C:\tmp\niuva-catalog-inventory-final backend\tests
.\backend\.venv\Scripts\python.exe -m pip check
```

Frontend:

```powershell
Set-Location frontend
npm test -- --watchAll=false --runInBand --testMatch "**/src/**/*.test.js"
npm run build
```

Real transaction test memerlukan Mongo 7 single-node replica set, polling `db.hello().isWritablePrimary`, environment `MONGO_TRANSACTION_TEST_URL`, dan eksekusi:

Gunakan `docker-compose.transaction-test.yml` dan command cleanup dari
`doc/TRANSACTION_CAPABILITY_RUNBOOK.md`; skipped module bukan bukti lulus CI.

```powershell
.\backend\.venv\Scripts\python.exe -m pytest -n 0 backend\tests\test_inventory_transactions.py -q
```

## 16. Evidence Eksekusi Saat Implementasi

| Pemeriksaan | Hasil |
|---|---|
| Unit/in-memory backend terfokus Tasks 1–8 | Lulus pada setiap checkpoint |
| Regresi backend lengkap setelah code review | 85 test lulus, 2 test integrasi eksternal dilewati |
| Frontend Jest | 16 test lulus |
| Frontend optimized build | Lulus; sitemap dilewati bila public site URL tidak dikonfigurasi |
| Migration isolated-data test | Dry-run/apply/collision/unique-index preflight/no-op lulus |
| URL-dependent external API | Otomatis skip tanpa `REACT_APP_BACKEND_URL` |
| Real Mongo replica-set | Tertunda: Docker daemon belum ready setelah polling lokal |
| Browser role/workflow QA | Tertunda sampai API non-produksi transactional tersedia |

Perbarui tabel ini pada deployment non-produksi berikutnya. Status “tertunda” tidak boleh diubah menjadi “lulus” tanpa output test/QA aktual.
