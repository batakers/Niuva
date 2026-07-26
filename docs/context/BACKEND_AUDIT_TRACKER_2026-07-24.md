# Niuva Backend Audit Tracker

Status: **Context Only — Active Audit Tracker — Not Implementation Authority**
Audit date: 24 July 2026
Last updated: 26 July 2026
Repository baseline at last update: `origin/main` at `d4d1fba`
Backend test baseline: `e73c99a` on `fix/auth-phase-a-login-issuance`

## 1. Purpose and Authority

Dokumen ini menyimpan hasil audit backend agar review dapat dilanjutkan pada sesi
berikutnya tanpa mengulang pemeriksaan dari awal. Dokumen ini mencatat:

- masalah yang ditemukan pada backend;
- konflik antara source, test, requirement, decision, ADR, runbook, dan
  implementation plan;
- status implementation plan yang sudah selesai, belum selesai, belum dimulai,
  atau belum diizinkan;
- hasil verifikasi yang sudah dijalankan;
- keputusan manusia yang masih dibutuhkan;
- urutan fase remediasi yang disarankan;
- riwayat pembaruan audit.

Dokumen ini **bukan** sumber requirement, keputusan produk, keputusan role,
otorisasi implementasi, provider selection, production readiness, atau go-live.
Jika ada pertentangan, gunakan urutan otoritas berikut:

1. [`docs/NIUVA_MASTER_SPEC.md`](../NIUVA_MASTER_SPEC.md)
2. [`docs/context/DOCUMENT_REGISTER.md`](DOCUMENT_REGISTER.md)
3. [`docs/decisions/DECISION_REGISTER.md`](../decisions/DECISION_REGISTER.md)
4. ADR atau decision record yang relevan
5. Runbook yang relevan
6. Source code dan test terbaru sebagai bukti keadaan implementasi
7. Dokumen audit ini sebagai context dan tracker saja

Jangan mengubah item `blocked_by_decision` menjadi keputusan teknis berdasarkan
asumsi. Minta keputusan manusia dan catat sumber persetujuannya.

## 2. Audit Baseline

### 2.1 Repository state

Audit awal dijalankan terhadap snapshot read-only `origin/main` pada `7505b48`.
Setelah audit, repository lokal diselaraskan ke GitHub terbaru:

- local `main`: `0b0b556`;
- `origin/main`: `0b0b556`;
- working tree: bersih pada saat sinkronisasi;
- posisi lokal lama disimpan pada
  `backup/local-main-before-sync-20260724-e0bf95a`.

Perubahan dari `7505b48` sampai `0b0b556` hanya menyentuh file frontend. Tidak
ada perubahan pada `backend/` atau dokumen kanonis dalam rentang tersebut.
Karena itu hasil audit backend pada `7505b48` masih berlaku untuk baseline
`0b0b556`.

### 2.2 Scope

Audit mencakup:

- dokumentasi kanonis dan authority register;
- decision register dan ADR transaksi, storage, serta payment;
- implementation specs, implementation plans, dan runbook terkait backend;
- authentication dan authorization;
- identity, organization, dan audit;
- catalog, material price, inventory, dan transaction boundary;
- legacy order, estimate, payment proof, dan status lifecycle;
- upload, download, ownership, retention, dan storage;
- portfolio/CMS evidence;
- notification dan background task;
- health/readiness;
- dependency security;
- test suite, compile check, dependency compatibility, type-check, dan lint.

Audit tidak membuktikan:

- kesiapan production infrastructure;
- validitas data production;
- konfigurasi provider;
- backup/restore production;
- transaction behavior pada deployment production;
- E2E browser penuh;
- production go-live.

## 3. Executive Status

Status keseluruhan: **Foundation partially implemented; backend is not
production-ready.**

Foundation identity, organization, catalog, material, inventory, audit, dan
transaction capability sudah memiliki implementasi berarti. Namun release
backend masih diblokir oleh:

1. konflik role model antara authority kanonis dan runtime;
2. insiden credential NIV-001 yang belum `Verified`;
3. legacy manual-transfer flow yang masih dapat membuat transaksi baru;
4. order, file, notification, dan readiness boundary yang belum memenuhi
   requirement kanonis;
5. login rate limit dan token/session/password policy yang masih menunggu
   keputusan `AUTH-DEC-02` sampai `AUTH-DEC-07`.

Pada 26 July 2026 empat blocker sebelumnya sudah tertutup: permission
Operations (BA-003), approved framework security upgrade (BA-004), Phase A
login issuance dari BA-010, dan real MongoDB replica-set verification. Rincian
ada pada finding masing-masing dan pada update log.

## 4. Verification Evidence

### 4.1 Full backend test — 26 July 2026

Dijalankan dari `backend/` pada `e73c99a` dengan local replica-set test
topology aktif (`docker-compose.transaction-test.yml`, port 27018).

Command:

```bash
./.venv/bin/python -m pytest -q -rs
```

Result:

```text
288 passed
23 skipped
0 failed
14 subtests passed
```

Seluruh 23 skip berasal dari satu sumber yang sama, yaitu external integration
suite [`backend/tests/backend_test.py`](../../backend/tests/backend_test.py)
yang memerlukan `NIUVA_TEST_ADMIN_EMAIL` dan `NIUVA_TEST_ADMIN_PASSWORD` pada
approved non-production test environment. Skip ini tetap merupakan environment
gate terpisah dan tidak boleh direpresentasikan sebagai integration evidence.

Empat replica-set skip yang tercatat pada 24 July 2026 sudah tidak ada. Tes
tersebut sekarang berjalan dan lulus:

- `test_transaction_integration.py::test_real_probe_commit_abort_and_cleanup`;
- `test_inventory_transactions.py::test_real_replica_set_commit_rollback_replay_and_concurrency`;
- `test_identity_access_migration.py::test_real_replica_set_migrates_user_and_audit_in_the_same_transaction`.

Skip keempat pada catatan 24 July 2026 berasal dari
`backend/tests/test_identity_transactions.py`, yang sudah dihapus pada `cbb6b97`
bersama penghapusan role management. Coverage replica-set untuk identity kini
berada pada `test_identity_access_migration.py`.

Dua defect test-infrastructure ditemukan dan diperbaiki dalam proses ini:

- suite bootstrap mendaftarkan stub `motor` melalui `sys.modules.setdefault`
  tanpa teardown, sehingga xdist worker yang meng-import suite tersebut lebih
  dulu memberikan stub kepada real replica-set test; diperbaiki dengan
  meng-import driver asli pada [`backend/tests/conftest.py`](../../backend/tests/conftest.py)
  sebelum modul test dikoleksi;
- `test_transaction_topology_files.py` meng-import conftest melalui package
  `backend`, yang hanya resolve bila rootdir adalah repository, sehingga
  menjalankan suite dari `backend/` menghasilkan `ModuleNotFoundError` saat
  collection; diperbaiki dengan fallback ke package `tests`.

CI-style invocation dari repository root juga diverifikasi lulus.

### 4.1.1 Full backend test — 24 July 2026 baseline (historis)

Command:

```bash
python -m pytest -q -rs
```

Result:

```text
274 passed
5 skipped
1 failed
14 subtests passed
```

Kegagalan:

```text
backend/tests/test_identity_foundation.py::
test_staff_access_routes_enforce_permissions_and_audit

Operations -> GET /api/admin/roles
Expected: 403
Actual:   200
```

Source terkait:

- [`backend/permissions.py`](../../backend/permissions.py)
- [`backend/tests/test_identity_foundation.py`](../../backend/tests/test_identity_foundation.py)
- [`docs/superpowers/specs/2026-07-22-identity-access-model-design.md`](../superpowers/specs/2026-07-22-identity-access-model-design.md)

Lima skip:

1. external integration backend URL tidak dikonfigurasi;
2. identity real-transaction test tidak mendapat
   `MONGO_TRANSACTION_TEST_URL`;
3. inventory real-transaction test tidak mendapat
   `MONGO_TRANSACTION_TEST_URL`;
4. central transaction integration test tidak mendapat
   `MONGO_TRANSACTION_TEST_URL`;
5. replica-set identity migration test tidak mendapat
   `MONGO_TRANSACTION_TEST_URL`.

Docker tidak tersedia pada lingkungan audit 24 July 2026, sehingga local
MongoDB replica-set verification belum dapat dijalankan saat itu.

### 4.2 Other checks

Hasil 26 July 2026:

| Check | Result | Interpretation |
|---|---|---|
| `python -m pip check` | Pass | Dependency yang terpasang kompatibel; bukan vulnerability audit |
| `mypy`, source non-test | 41 errors pada 7 file | Type-check belum menjadi quality gate yang lulus |
| `flake8 --exclude=.venv,__pycache__` | 1084 findings | Mayoritas line length; angka 912 pada 24 July memakai cakupan exclude yang tidak tercatat, jadi kedua angka tidak dapat dibandingkan langsung |
| `pip-audit` | Belum dijalankan | Tool belum ada pada `requirements.txt`; menambahkannya memerlukan approval dependency terpisah |

Hasil 24 July 2026 (historis): `compileall` pass, `pip check` pass, mypy 46
errors pada 8 file, flake8 912 findings, critical syntax lint selection pass.

Package yang ter-resolve pada environment 26 July 2026:

```text
fastapi 0.139.2
starlette 1.3.1
pydantic 2.13.4
python-multipart 0.0.32
```

Package yang ter-resolve pada environment audit 24 July 2026:

```text
fastapi 0.110.1
starlette 0.37.2
pydantic 2.13.4
python-multipart 0.0.32
```

## 5. Finding Register

Status vocabulary:

- `open`: masalah terkonfirmasi dan belum diselesaikan;
- `blocked_by_decision`: penyelesaian memerlukan keputusan manusia;
- `approved_not_started`: scope sudah disetujui tetapi belum diterapkan;
- `partial`: implementasi ada, tetapi acceptance/verification belum lengkap;
- `environment_blocked`: verifikasi diblokir oleh environment;
- `resolved`: masalah sudah ditangani dan bukti tercatat;
- `decision_resolved_implementation_open`: authority sudah diputuskan, tetapi
  source, test, migration, atau rollout belum direkonsiliasi;
- `accepted_risk`: hanya boleh digunakan dengan owner dan tanggal review.

### BA-001 — Local and GitHub main divergence

- Severity: P0
- Status: `resolved`
- Evidence date: 24 July 2026
- Previous state: local `main` ahead 31 and behind 116.
- Resolution:
  - posisi lama disimpan pada
    `backup/local-main-before-sync-20260724-e0bf95a`;
  - local `main` diselaraskan ke `origin/main` `0b0b556`;
  - status setelah sinkronisasi bersih dan SHA sama.
- Follow-up:
  - jangan hapus branch backup tanpa approval terpisah;
  - audit commit baru sebelum melanjutkan pekerjaan pada sesi berikutnya.

### BA-002 — Canonical role model conflicts with runtime role model

- Severity: P0
- Status: `decision_resolved_implementation_open`
- Canonical evidence:
  - Master Spec menetapkan role internal granular, dari Content Editor, Catalog
    Manager, Warehouse, dan seterusnya sampai Super Admin.
- Runtime evidence:
  - `backend/permissions.py` hanya memakai `super_admin`, `operations`, dan
    `commercial_finance`.
- Conflicting context:
  - identity amendment design berstatus
    `Proposed — approved design awaiting written-spec review`;
  - three-role change tidak tercatat sebagai keputusan role baru dalam Decision
    Register;
  - implementation plan mengklaim model tiga role sebagai approved, tetapi
    implementation plan bukan authority untuk mengubah Master Spec.
- Decision:
  - granular internal role model remains canonical;
  - recorded in
    [`DEC-ACCESS-001`](../decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md);
  - explicit user approval: 24 July 2026.
- Implementation still open:
  - exact granular technical identifiers and permission matrix;
  - existing-account migration;
  - replacement of the aggregate runtime role model;
  - smoke test and authorized rollout.
- Do not:
  - mengubah test, migration, atau permission matrix untuk memilih salah satu
    model tanpa keputusan tertulis.

### BA-003 — Operations user/audit access conflicts with design and test

- Severity: P0
- Status: `resolved`
- Resolution evidence date: 26 July 2026
- Resolution:
  - [`backend/permissions.py`](../../backend/permissions.py) tidak lagi memberi
    `users.read` maupun `audit.read` kepada role `operations`;
  - `test_staff_access_routes_enforce_permissions_and_audit` lulus, sehingga
    `/api/admin/roles` sudah mengembalikan `403` untuk Operations;
  - perbaikan dilakukan pada runtime, bukan dengan melonggarkan test.
- Catatan lingkup:
  - matrix domain-scoped audit dan governance full-audit tetap terbuka dan
    tetap fail closed sampai disetujui;
  - penutupan BA-003 tidak menutup BA-002.
- Runtime pada 24 July 2026 (historis):
  - role `operations` memiliki `users.read` dan `audit.read`.
- Design:
  - Operations tidak boleh manage users/roles atau inspect full audit.
- Test:
  - `/api/admin/roles` diharapkan `403`, tetapi runtime mengembalikan `200`.
- Impact:
  - least-privilege contract tidak konsisten;
  - test suite merah;
  - perubahan test saja dapat menyembunyikan authorization regression.
- Decision:
  - operational staff do not receive a general user directory;
  - operational staff do not receive complete role definitions;
  - operational staff do not receive the full audit log;
  - domain-scoped audit requires an approved granular role/action/query/field
    matrix and fails closed until that matrix exists.
- Source:
  - [`DEC-ACCESS-001`](../decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md),
    approved 24 July 2026.
- Implementation still open:
  - current broad `operations` grants;
  - exact domain-scoped audit matrix;
  - full-audit governance matrix;
  - code, migration, tests, and rollout.

### BA-004 — Approved framework security upgrade is not implemented

- Severity: P0
- Status: `resolved`
- Resolution evidence date: 26 July 2026
- Resolution:
  - [`backend/requirements.txt`](../../backend/requirements.txt) sudah memakai
    FastAPI `0.139.2`, exact Starlette `1.3.1`, dan Pydantic floor `2.9.0`
    sesuai approved security spec;
  - environment me-resolve FastAPI `0.139.2` dan Starlette `1.3.1`;
  - `pip check` pass;
  - full backend suite pass tanpa failure.
- Verifikasi yang belum dijalankan:
  - `pip-audit` belum dijalankan dan hasil redacted-nya belum disimpan;
  - tool tersebut belum ada pada `requirements.txt`, sehingga penambahannya
    memerlukan approval dependency terpisah.
- Evidence pada 24 July 2026 (historis):
  - `requirements.txt` masih memakai FastAPI `0.110.1`;
  - environment me-resolve Starlette `0.37.2`.
- Security relevance:
  - Starlette `0.37.2` termasuk versi yang terdampak multipart/form-data DoS;
  - backend memiliki public/authenticated form dan upload endpoints.
- Approved scope:
  - [`docs/implementation/specs/active/2026-07-21-backend-framework-security-upgrade-design.md`](../implementation/specs/active/2026-07-21-backend-framework-security-upgrade-design.md)
- Official advisories:
  - <https://github.com/Kludex/starlette/security/advisories/GHSA-f96h-pmfr-66vw>
  - <https://github.com/Kludex/starlette/security/advisories/GHSA-2c2j-9gv5-cj73>
- Required verification:
  - `pip check`;
  - `pip-audit`;
  - app import and OpenAPI generation;
  - complete backend test suite;
  - no behavior change outside approved compatibility exception.

### BA-005 — NIV-001 credential incident is not verified closed

- Severity: P0
- Status: `open`
- Evidence:
  - [`docs/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md`](../runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md)
    menyatakan `Implemented, verification pending`;
  - credential lama harus diperlakukan aktif atau berisiko sampai bukti
    revocation/rotation disetujui;
  - rehearsal berhenti pada scope gate;
  - history rewrite, force-push, publication, dan closure verification belum
    dilakukan.
- Additional evidence:
  - checkout lokal lama memiliki generated report dengan plaintext credential;
  - generated JSON mengklaim 31/31 test pass sementara XML yang menyertainya
    mencatat satu failure.
- Required next gate:
  - redacted rotation/revocation evidence;
  - explicit human approval untuk isolated rewrite rehearsal;
  - seluruh closure checklist runbook;
  - jangan menulis nilai credential ke audit, command, log, atau evidence.

### BA-006 — Legacy manual-transfer flow can create new transactions

- Severity: P1
- Status: `decision_resolved_implementation_open`
- Runtime:
  - estimate route mengirim instruksi transfer bank;
  - customer dapat mengunggah payment proof;
  - Finance dapat memverifikasi payment proof;
  - public settings dapat mengekspos konfigurasi bank legacy.
- Canonical conflict:
  - Retail production baseline adalah provider-neutral online payment;
  - `DEC-PAY-02` now limits manual transfer to read-only historical
    compatibility and disables new activity;
  - candidate checkout hanya mengizinkan legacy records tetap readable.
- Authority:
  - [`docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`](../decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md)
- Decision:
  - existing manual-transfer records remain read-only;
  - new manual-transfer instructions, attempts, payment-proof uploads, and
    proof-driven transitions are disabled;
  - recorded in
    [`DEC-PAY-02`](../decisions/product/DEC-PAY-02-legacy-manual-transfer-read-only.md);
  - explicit user approval: 24 July 2026.
- Implementation still open:
  - protected-scope plan to disable current mutation behavior;
  - legacy compatibility projections;
  - unresolved historical-case procedure;
  - proof retention.
- Re-verifikasi 26 July 2026: belum ada perubahan runtime.
  `POST /api/orders/{oid}/payment-proof` masih aktif pada
  [`backend/server.py`](../../backend/server.py) `:592`, instruksi transfer bank
  masih dikirim pada `:715`, dan public settings masih mengekspos konfigurasi
  bank legacy.

### BA-007 — Legacy order lifecycle and monetary integrity are unsafe

- Severity: P1
- Status: `open`
- Evidence in [`backend/server.py`](../../backend/server.py):
  - estimate amount memakai binary `float`, bukan Decimal/minor unit;
  - amount tidak memiliki positive-value constraint;
  - order number memakai `count_documents + 1`;
  - tidak ada unique index untuk `order_number`;
  - estimate dapat overwrite state tanpa version check;
  - verify-payment dapat diulang;
  - status dapat berpindah ke state apa pun dalam daftar, termasuk backward
    transition;
  - tidak ada operation ID/idempotency key;
  - tidak ada atomic audit untuk legacy order/payment mutations.
- Impact:
  - duplicate order number pada concurrency;
  - duplicate history/notification;
  - status regression;
  - inconsistent amount semantics;
  - retry setelah ambiguous failure dapat menghasilkan efek ganda.
- Re-verifikasi 26 July 2026: belum ada perubahan runtime. `amount: float` pada
  [`backend/server.py`](../../backend/server.py) `:229` dan order number masih
  memakai `count_documents` pada `:543`.

### BA-008 — File access, validation, and retention do not meet ADR-002

- Severity: P1
- Status: `partial`
- Positive controls already present:
  - storage default `disabled`;
  - local storage hanya diizinkan untuk development/demo/test;
  - path traversal validation tersedia;
  - production local storage ditolak.
- Open gaps:
  - customer ownership masih berdasarkan path segment;
  - belum ada database-backed ownership;
  - upload hanya memeriksa extension;
  - seluruh upload dibaca sebelum 50 MB application-level check;
  - belum ada actual MIME/signature validation;
  - belum ada malware scan/quarantine;
  - download membaca seluruh objek ke memory;
  - retention loop hanya menulis `file.deleted=True`;
  - objek tidak dihapus;
  - download route tidak memeriksa `file.deleted`;
  - payment-proof retention tidak ditangani oleh loop yang sama.
- Authority:
  - [`docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`](../decisions/architecture/ADR-002-production-file-storage-architecture.md)
- Production upload remains blocked until ADR readiness gates are satisfied.

### BA-009 — Transaction and audit boundary adoption is incomplete

- Severity: P1
- Status: `partial`
- Positive controls:
  - transaction capability probe tersedia;
  - central executor dan mutation guard tersedia;
  - identity/organization mutation menggunakan shared guard;
  - local/CI replica-set topology files tersedia;
  - fail-closed `transaction_unavailable` contract tersedia.
- Open gaps (diverifikasi ulang 26 July 2026):
  - catalog, inventory, dan content masih mempunyai direct transaction blocks
    melalui `start_session()` langsung, bukan central executor:
    `catalog_service.py` pada `:304`, `:419`, `:513`, `:571`;
    `inventory_service.py` pada `:186` dan `:689`;
    `content_service.py` pada `:142` dan `:185`;
  - material create/update/archive/price-version menulis data lalu audit secara
    terpisah;
  - catalog archive menulis product lalu audit secara terpisah;
  - concurrent catalog publish menghitung next revision sebelum transaksi;
  - catalog/inventory belum memakai central unknown-commit reconciliation
    boundary secara konsisten.
- Impact:
  - mutation dapat berhasil tanpa audit jika audit write gagal;
  - concurrent publication dapat menghasilkan raw conflict;
  - ambiguous transaction outcome tidak diproyeksikan secara seragam.
- Environment limitation:
  - tidak lagi berlaku sejak 26 July 2026; real replica-set verification sudah
    direproduksi lokal dan seluruh real transaction test lulus. Gap adopsi
    central boundary di atas tetap terbuka dan tidak tertutup oleh bukti ini.

### BA-010 — Authentication and public-input hardening is incomplete

- Severity: P1
- Status: `partial`
- Evidence date: 26 July 2026
- Sudah selesai:
  - login issuance boundary (Phase A) terimplementasi pada
    `authenticate_credentials` di [`backend/server.py`](../../backend/server.py):
    satu generic `401 Invalid email or password` untuk unknown email, wrong
    password, hash tidak valid, `disabled`, `access_review_required`, dan
    resolver role kosong; tidak ada token yang terbit untuk jalur tersebut;
  - verifikasi password dipanggil tepat sekali melalui dummy hash konstan untuk
    jalur unknown, sesuai `DEC-AUTH-001`;
  - endpoint internship sudah tidak ada pada backend setelah `DEC-OPS-002`,
    sehingga throttle dan batas panjang field-nya tidak lagi berlaku;
  - contact form dan admin notification sudah memakai `html.escape`.
- Masih terbuka:
  - login tetap tidak memiliki rate limit sama sekali;
  - `_rate_buckets` masih dict in-memory per process dan tidak bertahan lintas
    restart/worker, sehingga limiter yang ada bukan kontrol produksi;
  - order filename dan estimate note masih dimasukkan ke HTML email tanpa
    escaping;
  - password, token/session, dan authentication-event policy belum diputuskan.
- Decision dependency:
  - `DEC-AUTH-002` menahan pemilihan topologi limiter;
  - `AUTH-DEC-03` sampai `AUTH-DEC-07` masih terbuka.
- Impact yang tersisa:
  - brute-force exposure pada login;
  - stored notification/email HTML content spoofing.

### BA-011 — Structured CMS foundation is not implemented

- Severity: P2
- Status: `partial`
- Evidence date: 26 July 2026
- Sudah terimplementasi pada
  [`backend/content_service.py`](../../backend/content_service.py) dan
  [`backend/content_domain.py`](../../backend/content_domain.py):
  - lifecycle `draft` ke `scheduled`/`published` lalu `archived`;
  - validasi field sebelum publish;
  - version snapshot per perubahan;
  - `rollback_block` dengan `rollback_source_version_id`;
  - archive menggantikan hard delete;
  - public projection difilter ke `status: "published"`.
- Belum diverifikasi terhadap requirement kanonis:
  - review state terpisah dan permission-aware review/publish;
  - preview boundary;
  - kelengkapan structured fields terhadap Master Spec;
  - cakupan audit untuk setiap transisi lifecycle.
- Runtime evidence 24 July 2026 (historis):
  - portfolio masih berupa simple CRUD;
  - public list tidak memfilter published/active lifecycle;
  - update tidak menyimpan version history;
  - delete memakai hard delete.
- Canonical requirement:
  - structured fields;
  - validation;
  - preview;
  - permission-aware review/publish;
  - scheduling;
  - version history;
  - auditable rollback;
  - archive/soft delete.
- Note:
  - belum ditemukan approved bounded CMS implementation plan yang dapat langsung
    dieksekusi.

### BA-012 — Notification, background task, and readiness boundaries are weak

- Severity: P2
- Status: `open`
- Notification:
  - order mutation dilakukan sebelum notification insert/send;
  - notification insert failure dapat membuat API mengembalikan error setelah
    core order sudah tersimpan;
  - retry client dapat menyebabkan duplicate effect;
  - belum ada durable outbox, retry state, dead-letter/reconciliation boundary.
- Background task:
  - reservation expiry task disimpan dan dibatalkan saat shutdown;
  - design-file auto-delete task dibuat tanpa disimpan/cancel saat shutdown;
  - multi-instance coordination/leader ownership belum ada.
- Readiness:
  - `/health/ready` hanya memakai cached transaction capability;
  - tidak menguji current DB reachability, storage, indexes, atau background-job
    health.

### BA-013 — Static quality and test reporting are not reliable merge gates

- Severity: P2
- Status: `open`
- Evidence (26 July 2026):
  - full backend suite sudah pass, sehingga bukan lagi bagian dari finding ini;
  - 41 mypy errors pada 7 file source non-test;
  - 1084 flake8 findings dengan `--exclude=.venv,__pycache__`;
  - belum ada konfigurasi yang menetapkan mana yang critical lint dan mana yang
    style debt;
  - `pip-audit` belum menjadi bagian gate;
  - old generated report mengklaim 100% pass tetapi XML menyimpan failure;
  - external integration suite bergantung pada credential environment dan skip
    bila tidak dikonfigurasi.
- Evidence 24 July 2026 (historis):
  - satu failure pada full backend suite;
  - 46 mypy errors pada 8 file;
  - 912 flake8 findings.
- Required direction:
  - tetapkan supported Python/type-check configuration;
  - pisahkan style debt dari critical lint;
  - jadikan test report machine-generated dan immutable;
  - jangan menyimpan credential di fixture/report;
  - jadikan required integration topology eksplisit di CI.

## 6. Implementation Plan Reconciliation

Checklist lama tidak boleh dibaca secara mekanis sebagai backlog. Status pada
bagian ini sudah dibandingkan dengan Document Register, source, dan test.

Status pada tabel ini diperbarui 26 July 2026. Setiap plan yang sebelumnya
tidak memiliki header `Status:` sudah diberi header sesuai kolom
`Safe interpretation` di bawah, tanpa mengubah isi plan dan tanpa memberikan
authority baru.

| Plan or scope | Audit status | Safe interpretation |
|---|---|---|
| Backend Framework Security Upgrade | `resolved` | Terimplementasi; `pip-audit` evidence masih kurang |
| Backend Auth Phase A Login Issuance | `resolved` | Terimplementasi dan merged melalui PR #47; Phase B sampai D tetap terblokir keputusan |
| Amend Identity Access Model | `context only` + superseded role direction | Task 1–7 menjadi implementation evidence; Task 8 must not execute; DEC-ACCESS-001 keeps granular roles canonical |
| Foundation Transaction Capability | recorded complete | 120/120 checklist selesai; real local verification sudah direproduksi 26 July 2026 |
| Catalog/Material/Inventory Foundation | `partial` | Real transaction verification sudah terpenuhi 26 July 2026; browser permission/workflow QA masih unchecked |
| Remove Emergent/Local Storage | backend substantially complete | Fresh optimized frontend build masih unchecked; production storage tidak termasuk |
| Foundation Identity/RBAC plan lama | misleading if used as backlog | Puluhan checkbox kosong tetapi implementation berikutnya sudah ada; reconcile/archive, jangan execute ulang |
| NIV-001 History Rewrite | `open` | Implemented, verification pending; destructive execution perlu explicit approval |
| Auth experience remediation | context only | Pending separate approval; bukan backend implementation authority |
| Admin Studio remediation | context only | Pending separate approval; tidak mengubah backend authorization |
| Retail Catalog Discovery | candidate | Belum approved; bukan implementation plan aktif |
| Retail Order & Checkout | candidate | Belum approved; final implementation plan belum dibuat |

Relevant register:

- [`docs/context/DOCUMENT_REGISTER.md`](DOCUMENT_REGISTER.md)
- [`docs/implementation/plans/pending-reconciliation/`](../implementation/plans/pending-reconciliation/)
- [`docs/implementation/specs/candidates/`](../implementation/specs/candidates/)

## 7. Scope Not Yet Implemented as Canonical Product Capability

Bagian ini bukan authorization untuk mengimplementasikan capability berikut.

### Foundation gaps

- structured CMS lifecycle;
- shared v2 order/project foundation;
- complete file ownership/validation/retention boundary;
- consistent transaction/audit adoption;
- production storage adapter and readiness;
- full operational audit coverage;
- durable notification delivery.

### Retail MVP

- approved first Retail vertical slice;
- Retail catalog/configurator implementation resmi;
- guest-first checkout;
- authoritative preview;
- atomic multi-line reservation;
- provider-neutral payment orchestration implementation;
- production/QC/fulfillment milestones;
- shipment/pickup;
- guest tracking.

### B2B MVP

- complete inquiry/RFQ lifecycle;
- quotation version and approval;
- design version and approval;
- project milestone/ETA history;
- DP/termin/invoice lifecycle;
- QC and shipment lifecycle;
- full organization/project query isolation.

### Operational maturity and handover

- production board;
- advanced notification/reconciliation queue;
- approved analytics and KPI reporting;
- production backup/restore exercise;
- admin manual;
- SOP;
- data dictionary;
- training;
- deployment/recovery evidence;
- operational ownership matrix.

## 8. Remediation Phases

Checkboxes pada bagian ini adalah tracker audit, bukan implementation approval.
Sebelum mulai sebuah item, pastikan scope mempunyai approval yang sesuai.

### Phase 0 — Governance, branch, and incident containment

- [x] Simpan posisi local main lama pada branch backup.
- [x] Selaraskan local `main` dengan GitHub `origin/main`.
- [x] Putuskan canonical role model: granular roles remain canonical.
- [x] Putuskan operational access: no general user directory, complete role
      definitions, or full audit; scoped audit requires an approved matrix.
- [x] Putuskan boundary legacy manual transfer: historical records read-only;
      new manual-transfer/payment-proof activity disabled.
- [ ] Selesaikan redacted credential rotation/revocation evidence.
- [ ] Dapatkan approval khusus sebelum NIV-001 rewrite rehearsal.
- [ ] Rekonsiliasi status identity amendment dengan Master Spec, Document
      Register, dan Decision Register.
- [x] Tandai plan lama sebagai completed/context/superseded sesuai evidence,
      tanpa mengubah status berdasarkan checkbox saja. Selesai 26 July 2026:
      enam plan yang tidak memiliki header `Status:` sudah diberi header sesuai
      Section 6.

Exit criteria:

- satu role matrix kanonis;
- satu permission contract yang sama antara docs, code, dan test;
- test RBAC dapat diperbaiki berdasarkan keputusan, bukan asumsi;
- NIV-001 mempunyai approved next state;
- tidak ada plan lama yang dapat disalahartikan sebagai authority.

### Phase 1 — Security upgrade and green quality gate

- [x] Implement approved FastAPI/Starlette security upgrade. Selesai;
      lihat BA-004.
- [ ] Jalankan `pip-audit` dan simpan redacted result. Memerlukan approval
      penambahan dependency tooling.
- [x] Fix RBAC test/runtime setelah Phase 0 decision. Selesai untuk grant
      `operations`; lihat BA-003. Model role granular BA-002 tetap terbuka.
- [x] Tolak disabled login sebelum token issuance. Selesai melalui Phase A;
      lihat BA-010.
- [ ] Tambahkan login rate limit yang sesuai deployment topology. Terblokir
      `DEC-AUTH-002`.
- [ ] Tetapkan password/session/token policy. Terblokir `AUTH-DEC-05` dan
      `AUTH-DEC-06`.
- [ ] Tetapkan reproducible dependency boundary.
- [ ] Konfigurasikan critical lint dan type-check gate.
- [x] Jalankan full backend suite tanpa unexpected skip/failure. Selesai
      26 July 2026: 288 passed, 23 documented environment skip, 0 failed.

Exit criteria:

- zero known vulnerability pada approved dependency audit;
- `pip check` pass;
- full configured backend suite pass dengan hanya documented environment skip;
- authorization matrix konsisten;
- critical static checks menjadi reproducible.

### Phase 2 — Foundation data integrity

- [ ] Terapkan central transaction boundary pada mutation yang membutuhkannya.
- [ ] Jadikan material/catalog mutation dan audit atomic.
- [ ] Tambahkan safe catalog revision conflict behavior.
- [ ] Ganti monetary float dengan Decimal/minor unit.
- [ ] Buat order number concurrency-safe dan unique.
- [ ] Definisikan legacy order transition graph.
- [ ] Tambahkan version check dan idempotency key.
- [ ] Tambahkan transactional audit untuk sensitive order/payment mutation.
- [ ] Implement durable notification outbox/retry/reconciliation.
- [x] Jalankan real MongoDB replica-set tests. Selesai 26 July 2026 memakai
      `docker-compose.transaction-test.yml`; seluruh real transaction test
      lulus. Ini bukti kapabilitas transaksi, bukan bukti adopsi central
      boundary pada BA-009.

Exit criteria:

- tidak ada silent partial cross-collection mutation;
- retry tidak menghasilkan duplicate business effect;
- monetary values mengikuti canonical representation;
- real transaction commit/abort/concurrency/idempotency evidence tersedia.

### Phase 3 — File, CMS, and shared order/project foundation

- [ ] Implement database-backed file ownership.
- [ ] Implement MIME/signature validation.
- [ ] Implement malware scanning/quarantine boundary.
- [ ] Implement streaming and bounded memory behavior.
- [ ] Implement actual object retention/deletion and reconciliation.
- [ ] Implement CMS draft/review/preview/publish/schedule/version/rollback/archive.
- [ ] Implement shared v2 order/project foundation.
- [ ] Preserve existing users, orders, materials, portfolio, dan payment history
      melalui compatibility mapping.

Exit criteria:

- ADR-002 readiness gates yang termasuk scope telah terbukti;
- public CMS hanya memproyeksikan published safe content;
- rollback/archive auditable;
- tidak ada destructive legacy migration tanpa backup/dry-run/rollback.

### Phase 4 — First Retail vertical slice

- [ ] Dapatkan written decision untuk first Retail vertical slice.
- [ ] Dapatkan protected-scope implementation approval.
- [ ] Reconcile candidate catalog-discovery spec.
- [ ] Buat bounded implementation plan dengan file scope, acceptance, test,
      migration, rollback, feature flag, dan commit boundary.

Current documented candidate:

- read-only Retail catalog discovery;
- kategori, produk, varian, safe price/ETA/availability;
- tanpa cart, checkout, reservation, payment, atau upload.

Candidate tetap **not approved for implementation** sampai ada keputusan
tertulis.

### Phase 5 — Retail order, checkout, payment, and fulfillment

- [ ] Putuskan shipping/pickup policy.
- [ ] Putuskan tax dan rounding.
- [ ] Putuskan reservation duration.
- [ ] Putuskan cancellation/refund/return.
- [ ] Putuskan payment gateway dan provider event mapping.
- [ ] Putuskan Finance reconciliation SLA/retention.
- [ ] Putuskan production storage provider/readiness.
- [ ] Dapatkan protected-scope implementation approval.
- [ ] Implement provider-neutral payment boundary.
- [ ] Implement idempotent webhook/refund/reconciliation behavior.
- [ ] Implement production/QC/shipment/pickup/guest tracking.

### Phase 6 — B2B MVP

- [ ] Implement inquiry/RFQ aggregate.
- [ ] Implement quotation version and approval.
- [ ] Implement design version and approval.
- [ ] Implement project milestones and ETA history.
- [ ] Implement DP/termin/invoice lifecycle.
- [ ] Implement QC and fulfillment.
- [ ] Enforce organization/project assignment in backend queries.

### Phase 7 — Operational maturity and handover

- [ ] Implement production board.
- [ ] Implement advanced notification and reconciliation operations.
- [ ] Add monitoring, alerting, and readiness evidence.
- [ ] Define approved KPI before analytics implementation.
- [ ] Run backup/restore exercise.
- [ ] Complete SOP, admin manual, data dictionary, training, recovery guide, dan
      ownership matrix.
- [ ] Obtain production-readiness and go-live decisions separately.

## 9. Blocking Decisions

### DEC-AUD-BE-001 — Internal role model

Status: **Approved — recorded as `DEC-ACCESS-001`**

Decision:

```text
Keep the granular canonical internal role model.
The aggregate Owner/Operations/Commercial & Finance model is not the canonical
target.
```

Approval source/date:

```text
Explicit user approval in the backend-audit conversation, 24 July 2026.
Formal source:
docs/decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md
```

### DEC-AUD-BE-002 — Operations access boundary

Status: **Approved direction — exact granular matrix remains open**

Decision:

```text
Operational staff may not read the general user directory, complete role
definitions, or full audit events. Domain-scoped audit may be enabled only
through an approved granular role/action/query/field matrix; until then it
fails closed.
```

Approval source/date:

```text
Explicit user approval in the backend-audit conversation, 24 July 2026.
Formal source:
docs/decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md
```

### DEC-AUD-BE-003 — Legacy manual-transfer boundary

Status: **Approved — recorded as `DEC-PAY-02`**

Decision:

```text
Existing manual-transfer records remain read-only. New manual-transfer
instructions, attempts, payment-proof uploads, and proof-driven transitions
are disabled.
```

Approval source/date:

```text
Explicit user approval in the backend-audit conversation, 24 July 2026.
Formal source:
docs/decisions/product/DEC-PAY-02-legacy-manual-transfer-read-only.md
```

### DEC-AUD-BE-004 — First Retail vertical slice

Status: **Open**

Current documented candidate is read-only Retail catalog discovery. Approval of
the candidate and protected scope remain separate requirements.

Decision:

```text
Pending user decision.
```

Approval source/date:

```text
Pending.
```

## 10. Resume Procedure

Pada sesi berikutnya:

1. Read the canonical authority in the order stated in Section 1.
2. Run:

   ```bash
   git status --short --branch
   git fetch origin
   git rev-parse --short HEAD
   git rev-parse --short origin/main
   ```

3. Do not reset, merge, rebase, delete, or force-push without explicit approval.
4. Compare backend/document changes since the recorded baseline:

   ```bash
   git diff --name-only 0b0b556..origin/main -- backend docs AGENTS.md PRODUCT.md
   ```

5. If backend or governing documents changed:
   - re-read the changed authority;
   - rerun proportional tests;
   - update finding status and evidence;
   - do not silently carry an old conclusion forward.
6. Review Section 9 for decisions supplied by the user.
7. Start only the next approved bounded phase.
8. Record commands, result counts, environment limitation, and new baseline SHA.
9. Append a dated entry to the update log.

## 11. Update Log

### 24 July 2026 — Initial audit tracker

- Audited `origin/main` backend at `7505b48`.
- Read canonical Master Spec, Document Register, Decision Register, relevant ADRs,
  runbooks, specs, plans, source, and tests.
- Recorded `274 passed`, `5 skipped`, `1 failed`, and `14 subtests passed`.
- Recorded compile and dependency compatibility pass.
- Recorded 46 mypy errors and 912 flake8 findings.
- Confirmed RBAC authority/runtime/test conflict.
- Confirmed approved framework security upgrade not implemented.
- Confirmed NIV-001 remains verification-pending.
- Confirmed legacy order/payment, file, audit, CMS, notification, and readiness
  gaps.
- Synchronized local `main` to GitHub `0b0b556`.
- Confirmed changes after the tested backend baseline were frontend-only.
- Created this tracker as Context Only; no product implementation was performed.

### 24 July 2026 — Phase 0 access and legacy-payment decisions

- Recorded explicit user approval to retain the granular canonical internal
  role model.
- Recorded that operational staff have no general user directory, complete
  role definitions, or full audit access.
- Recorded domain-scoped audit as a separately gated granular-matrix direction
  that fails closed until approved and implemented.
- Recorded legacy manual-transfer records as read-only and disabled all new
  manual-transfer/payment-proof application activity.
- Added `DEC-ACCESS-001` and `DEC-PAY-02`.
- Reconciled the Master Spec, Decision Register, Document Register, ADR-003,
  superseded identity design/plan status, and this tracker.
- No backend, frontend, migration, provider, production, or go-live
  implementation was authorized or performed.

### 26 July 2026 — Resume verification and Phase 0 plan reconciliation

Baseline: `origin/main` `d4d1fba`; verification dijalankan pada `e73c99a` di
branch `fix/auth-phase-a-login-issuance`.

Dijalankan sesuai Section 10:

- `git status --short --branch`, `git fetch origin`, dan perbandingan
  `0b0b556..origin/main` untuk `backend`, `docs`, `AGENTS.md`, `PRODUCT.md`;
- `./.venv/bin/python -m pytest -q -rs` dari `backend/` dengan local
  replica-set test topology aktif;
- CI-style invocation dari repository root;
- `pip check`, `mypy`, dan `flake8`.

Hasil verifikasi:

- 288 passed, 23 skipped, 0 failed, 14 subtests passed;
- seluruh skip berasal dari external integration suite yang memerlukan
  credential environment;
- `pip check` pass; mypy 41 errors pada 7 file; flake8 1084 findings.

Perubahan status finding:

- BA-003 menjadi `resolved`;
- BA-004 menjadi `resolved`, dengan `pip-audit` masih kurang;
- BA-010 menjadi `partial`, Phase A selesai dan sisanya terblokir keputusan;
- BA-011 menjadi `partial`, lifecycle CMS sudah ada dan sebagian requirement
  belum diverifikasi;
- BA-009 kehilangan environment limitation-nya, gap adopsi tetap terbuka;
- BA-006, BA-007, dan BA-013 diverifikasi ulang dan tetap terbuka dengan
  referensi baris terbaru.

Perbaikan test infrastructure yang dilakukan dan di-commit:

- `backend/tests/conftest.py` meng-import driver motor asli sebelum collection
  agar stub bootstrap tidak bocor ke real replica-set test;
- `backend/tests/test_transaction_topology_files.py` menerima kedua rootdir;
- `backend/migrations/003_identity_access_policy.py` menerima bootstrap Owner
  legacy yang tidak memiliki field `status`, dengan test barunya.

Rekonsiliasi Phase 0:

- enam implementation plan yang tidak memiliki header `Status:` sudah diberi
  header sesuai Section 6, tanpa mengubah isi plan.

Tidak ada keputusan produk, role, provider, payment, production-readiness, atau
go-live yang diambil. Tidak ada push atau pull request yang dibuat.
