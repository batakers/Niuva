# Production deployment runbook

Status dokumen: provider-neutral dan belum production-ready. Repository belum memuat konfigurasi provider yang dapat dijadikan sumber kebenaran. Isi domain dan host API yang telah dikonfirmasi sebelum release. Lihat `STAGING_DECISION_PACKET.md` untuk keputusan dan owner yang wajib ditutup sebelum workflow external dijalankan.

## 1. Release configuration

Frontend dibangun dari `frontend/` dengan `npm run build`; artefaknya berada di `frontend/build/`. Gunakan `frontend/.env.example` sebagai daftar konfigurasi, bukan sebagai nilai produksi.

Konfigurasi frontend wajib:

- `REACT_APP_PUBLIC_SITE_URL`: origin HTTPS publik tanpa trailing slash. Dipakai untuk canonical dan sitemap.
- `REACT_APP_BACKEND_URL`: origin backend tanpa `/api` dan tanpa trailing slash. Client menambahkan `/api`.
- `GENERATE_SOURCEMAP=false`: kebijakan default untuk public release. Jika source map dibutuhkan, unggah secara privat ke error tracker dan jangan sajikan sebagai aset publik.

Konfigurasi pihak ketiga bersifat opt-in:

- `REACT_APP_ENABLE_ANALYTICS=true` dan `REACT_APP_POSTHOG_KEY` mengaktifkan PostHog hanya pada production build.
- `REACT_APP_POSTHOG_HOST` menetapkan host ingestion.
- `REACT_APP_ENABLE_SESSION_RECORDING=true` hanya boleh diaktifkan setelah persetujuan privasi. Default release adalah `false`. Form contact memakai exclusion attribute, seluruh input dimasking, dan cross-origin iframe recording dimatikan.

Backend memakai `backend/.env.example`. Nilai `JWT_SECRET`, kredensial admin, MongoDB, dan Resend adalah secret server-side; jangan memakai prefix `REACT_APP_`, jangan menyimpannya di Git, dan rotasi jika pernah terpapar. Default aman production adalah `STORAGE_BACKEND=disabled`. Mode `local` hanya boleh dipakai saat `APP_ENV` bernilai `development`, `demo`, atau `test`; `LOCAL_STORAGE_ROOT` bukan rancangan storage production.

## 2. Build and release gate

Jalankan dari `frontend/`:

```sh
npm ci
npm run build
```

`postbuild` hanya membuat `sitemap.xml` dan menambahkan URL sitemap ke `robots.txt` bila `REACT_APP_PUBLIC_SITE_URL` valid dan bukan localhost. Build lokal tanpa domain tetap berhasil, tetapi release belum siap SEO sampai domain dikonfigurasi.

Sebelum publish, pastikan:

- build selesai tanpa error;
- tidak ada canonical, sitemap, API URL, atau redirect yang mengarah ke localhost/staging;
- `build/sitemap.xml` memuat hanya `/`, `/about`, `/capabilities`, `/projects`, dan `/contact`;
- `/services` dan `/portfolio` tetap alias aplikasi, bukan URL sitemap;
- source map tidak ikut terpublikasi jika kebijakannya privat.

## 3. SPA routing

Host harus mengembalikan `index.html` untuk direct request pada route aplikasi yang tidak cocok dengan file statis. Jangan rewrite request `/api/*` atau aset yang benar-benar ada.

Aturan provider-equivalent:

```txt
/static/*       -> file statis (jika ada)
/api/*          -> backend/proxy API, jangan fallback ke index.html
/*              -> /index.html (status 200)
```

Verifikasi direct load dan refresh untuk `/about`, `/capabilities`, `/projects`, `/contact`, dan `/admin/login`. Route terlindungi `/dashboard`, `/order`, dan `/admin` harus berakhir di `/admin/login` saat tidak terautentikasi.

## 4. Cache and compression

Aktifkan Brotli bila tersedia, dengan gzip sebagai fallback. Terapkan kebijakan cache berikut:

```txt
/index.html                 Cache-Control: no-cache, must-revalidate
/static/*.[contenthash].*   Cache-Control: public, max-age=31536000, immutable
/robots.txt                 Cache-Control: public, max-age=3600
/sitemap.xml                Cache-Control: public, max-age=3600
```

Jangan memberi cache immutable pada `index.html`; deployment baru harus dapat menunjuk ke chunk terbaru tanpa menunggu cache kedaluwarsa.

## 5. Security headers draft

Terapkan lewat host/CDN dan uji di staging. Ganti placeholder API/PostHog sesuai host final. `unsafe-inline` masih diperlukan oleh template dan beberapa inline style saat ini; hardening lanjutan sebaiknya memakai nonce/hash sebelum menghapusnya.

```txt
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline' https://us-assets.i.posthog.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self' ${REACT_APP_BACKEND_URL} https://us.i.posthog.com; frame-src https://www.google.com https://maps.google.com; worker-src 'self' blob:; upgrade-insecure-requests
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Cross-Origin-Opener-Policy: same-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Aktifkan HSTS hanya setelah HTTPS dan seluruh subdomain dipastikan siap. Bila analytics dimatikan, hapus domain PostHog dari CSP.

## 6. Contact and backend readiness

Endpoint `POST /api/contact` memvalidasi email dan panjang payload, membatasi 5 request per 10 menit per client, menyimpan lead sebelum mengirim notifikasi, dan meng-escape isi email. Kegagalan notifikasi tidak menghilangkan lead yang sudah tersimpan.

Catatan operasional:

- `CORS_ORIGINS` wajib berupa origin frontend final yang presisi; default kode hanya `http://localhost:3000` untuk development.
- Rate limiter saat ini in-memory dan berlaku per process. Deployment multi-instance perlu rate limiter bersama (misalnya Redis atau gateway/CDN rate limit).
- `TRUST_PROXY_HEADERS=true` hanya jika reverse proxy tepercaya menimpa `X-Forwarded-For`; jika tidak, biarkan `false`.
- Pastikan MongoDB persisten, index startup berhasil, `HRD_EMAIL` benar, domain pengirim Resend terverifikasi, dan admin dapat melihat fallback notification.
- Filesystem lokal di `LOCAL_STORAGE_ROOT` hanya untuk development/demo. Pada production, gunakan `STORAGE_BACKEND=disabled`; portal upload tetap nonaktif sampai private persistent storage dan seluruh gate ADR-002 disetujui.
- Jangan mengirim form uji ke production tanpa persetujuan stakeholder. Gunakan staging atau request terkontrol dan hapus data uji sesuai kebijakan retensi.

Download file terautentikasi saat ini menggunakan header `Authorization: Bearer <token>` pada request ke `/api/files/{path}`. Endpoint tidak membaca token dari URL dan menolak URL dengan `?auth=` (tanpa header Authorization request akan dikembalikan sebagai `401`). Frontend mengambil response sebagai blob sehingga token tidak masuk ke browser history atau URL access log.

Riwayat legacy (untuk audit): implementasi sebelum migrasi pernah membawa access token pada query URL. Pola tersebut tidak lagi didukung dan tidak boleh digunakan kembali. Jika menemukan link lama di bookmark, dokumentasi, atau log operasional, cabut dan buat ulang menggunakan alur download berbasis header di atas.

## Approved Architecture Gates

Architecture references:
- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
- `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`
- `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`

- MongoDB replica-set transaction capability is required before transaction-dependent mutation flags in staging/production. Standalone MongoDB is limited to read-only or proven-safe single-document atomic writes. Transaction-required operations must fail closed with `503 transaction_unavailable`; silent fallback is prohibited.
- Production storage uses a stable provider-neutral storage port and private persistent object storage. Local filesystem is development/demo only; production upload remains disabled until provider selection, database-backed ownership, token removal, MIME/signature validation, malware/quarantine, backup/restore, reconciliation, and operational readiness are approved.
- Retail production payment remains provider-neutral online payment orchestration. Gateway provider selection is deferred and required for provider integration/go-live, not for this architectural boundary. No new manual-transfer adapter is enabled.

Transaction-capability setup tracked in this repository is limited to local
development and isolated CI. See
`doc/TRANSACTION_CAPABILITY_RUNBOOK.md`. Staging/production topology,
persistence, monitoring, backup/restore, incident ownership, mutation
enablement, and go-live require separate approval.

These gates record approved architecture direction only. They do not authorize production infrastructure changes, Finance operational activation, payment gateway activation, production upload enablement, or production go-live.

## 7. Pre-deploy and post-deploy checklist

Pre-deploy:

- Domain utama dan redirect `www`/apex telah diputuskan.
- DNS, sertifikat TLS, frontend origin, backend origin, CORS, dan secret backend telah diisi.
- Backup database terbaru tersedia dan proses restore pernah diuji.
- Production tetap memakai `STORAGE_BACKEND=disabled` sampai private persistent storage dan readiness upload disetujui; jangan memakai `backend/.local-storage/`.
- Analytics/session recording memiliki keputusan eksplisit dan consent/privacy copy bila diwajibkan.
- Build commit dicatat sebagai release commit; working tree release bersih.

Post-deploy:

- Buka semua public route lewat direct URL dan refresh.
- Periksa canonical, title, description, `robots.txt`, dan `sitemap.xml` dari domain publik.
- Pastikan tidak ada mixed content, request localhost, chunk 404, atau error console.
- Periksa WhatsApp, email, dan link lokasi tanpa mengirim pesan eksternal.
- Uji form di staging; untuk production gunakan lead terkontrol dengan persetujuan.
- Pastikan API health, database write, email/fallback notification, dan admin login berfungsi.
- Verifikasi 404 aset, cache header, compression, CSP report, CORS, dan rate limit.
- Cek mobile 360px, desktop 1366px, keyboard navigation, reduced motion, dan satu H1 per halaman.

## 8. Rollback

Sebelum deployment, simpan identifier artefak dan tag release pada commit yang benar-benar dibangun. Jangan membuat tag dari working tree yang belum di-commit.

Jika release gagal:

1. Hentikan traffic promotion/canary dan pilih artefak frontend terakhir yang diketahui baik.
2. Redeploy artefak tersebut tanpa rebuild agar dependency tidak berubah.
3. Kembalikan backend ke image/revision kompatibel sebelumnya bila kontrak API berubah.
4. Jangan rollback database secara otomatis. Restore hanya bila migrasi/data corruption terkonfirmasi dan backup tervalidasi.
5. Purge hanya `index.html`/HTML edge cache; aset hash lama tetap aman disajikan.
6. Verifikasi route publik, login, API health, dan contact path setelah rollback, lalu dokumentasikan penyebab dan timeline insiden.

## G4 staging execution contract

Dokumen ini menyediakan kontrak release provider-neutral; workflow yang berhasil,
artifact yang tersedia, atau PR yang merged tidak dengan sendirinya menjadi
otorisasi deployment, production readiness, atau go-live.

Provider dan staging URL belum dipilih di repository. Target external hanya boleh
dimasukkan saat dispatch workflow melalui GitHub Environment `staging` yang
memiliki required reviewer dan approval target. Jangan menulis URL aktual,
credential, atau secret ke source control.

Sebelum target dipakai, release record wajib memuat:

- commit SHA yang benar-benar dibangun;
- frontend origin exact HTTPS tanpa path, credential, query, atau fragment;
- backend origin exact HTTPS tanpa `/api`, credential, query, atau fragment;
- environment approver, target-approval reference, rollback owner, restore
evidence owner, on-call, dan independent verifier;
- kebijakan data staging dan bukti artifact rollback sebelumnya.

### Origin, TLS, CORS, and secret injection

- `REACT_APP_PUBLIC_SITE_URL` dan `PUBLIC_SITE_URL` menggunakan frontend origin
  yang sama; `REACT_APP_BACKEND_URL` menggunakan backend origin tanpa `/api`.
- Backend `CORS_ORIGINS` harus berisi exact frontend origin, tidak wildcard, dan
  harus mengembalikan `Access-Control-Allow-Origin` serta credentials header pada
  request dari frontend origin.
- Kedua origin wajib HTTPS dengan certificate chain valid. Smoke gate menolak
  HTTP, local/placeholder host, credential, path, query, fragment, dan redirect
  target external.
- Backend secret diinjeksikan provider secret/configuration store saat process
  start; tidak memakai `.env` lokal, tidak dicetak di log, dan tidak dimasukkan
  ke GitHub Actions. GitHub Environment `staging` hanya memuat disposable role
  credentials untuk Admin E2E.

### Mongo replica-set and readiness

Staging mutation flows memerlukan MongoDB persistent authenticated replica set.
Release inventory mencatat replica-set name, persistence boundary, TLS/auth
policy, backup scope, schema/index state, dan database owner tanpa credential.
Standalone MongoDB bukan evidence transaction readiness.

Before enabling transaction-dependent mutations:

1. `GET /api/health/live` returns HTTP 200 with `status=ok`.
2. `GET /api/health/ready` returns HTTP 200 with `status=ready`,
   `database=ready`, `schema.ready=true`, and `transaction_mutations=ready`.
3. Required indexes are present and no retired/missing index remains.
4. Required worker/email capabilities are either explicitly disabled by decision
   or ready in the response.

### External workflow and evidence checklist

- [ ] `external-smoke` ran with the approved backend origin and uploaded smoke
      JSON/JUnit evidence.
- [ ] `external-admin-e2e` ran with approved frontend/backend origins and uploaded
      role/accessibility/responsive browser evidence.
- [ ] All five disposable role account pairs exist; a missing credential fails,
      never skips, the role matrix.
- [ ] Release record contains run URLs, SHA, target approval, artifact IDs,
      verifier, and failed/held/rolled-back disposition.
- [ ] Backup/restore evidence has owner, custody, timestamp, restore comparison,
      corrective action, and independent verification.

### Ownership, SLO, and alerts

The release record must name release owner, staging operator, rollback owner,
restore evidence owner, database owner, on-call/incident commander, security
secret custodian, and independent verifier. Proposed staging thresholds (not
approved production SLOs) are: API 5xx `>2%` for 5 minutes; p95 `>1,000 ms` for
10 minutes or `>50%` over baseline; readiness not ready for 5 minutes;
`transaction_mutations=unavailable` when required; backup older than approved
RPO; or a blocking browser/role assertion. These stop or page the named owner.
Alert destination, escalation, RPO/RTO, and production SLO remain open decisions.

### Backup/restore boundary

Follow `MIGRATION_BACKUP_RESTORE_RUNBOOK.md` only on an approved non-live target.
G4 does not apply migrations or restore shared/staging/production data. A restore
gate is complete only with snapshot capture/verify, restore-and-compare result,
BSON/data-integrity result, custody, corrective action, and restore evidence owner.
A backup file without restore evidence is not recoverability evidence.

Until named owners and environment evidence exist, the valid status is
**staging package prepared / deployment not executed / production readiness not
established**.