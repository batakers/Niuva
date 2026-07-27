# Niuva Backend Audit Tracker

Status: **Context Only — Active Audit Tracker — Not Implementation Authority**
Audit date: 24 July 2026
Last updated: 27 July 2026
Repository baseline at last update: `origin/main` at `fd299cd`, reconciled into
local branch by merge commit `2dbcd8b`
Backend test baseline: local reconciled worktree after Slice B material
transaction completion; 445 internal tests passed

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

Pada 27 July 2026 branch `fix/auth-phase-a-login-issuance` yang sebelumnya
tertinggal 52 commit direkonsiliasi dengan `origin/main` `4403529` melalui
merge commit `0b0c1d0`. Satu konflik pada `backend/content_routes.py`
diselesaikan dengan mempertahankan lifecycle/permission terbaru dan injeksi
shared transaction guard. WIP `backend/material_routes.py` disimpan pada stash
recoverable sebelum merge, dipulihkan setelah merge, lalu dilanjutkan. Backup
stash tidak dihapus pada saat pembaruan ini.

Pada refresh berikutnya di tanggal yang sama, empat commit baru sampai
`origin/main` `fd299cd` di-merge melalui `2dbcd8b`. Perubahan upstream pada
refresh ini hanya menambah pembaruan public marketing frontend. Seluruh WIP
Slice B dan dokumentasi disimpan pada stash recoverable terpisah, dipulihkan
tanpa conflict, dan kedua stash backup tetap dipertahankan.

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

Foundation identity, granular RBAC, catalog, material, inventory, audit,
transaction capability, structured CMS/portfolio, Retail Order aggregate, dan
sebagian B2B inquiry/quotation/project/work-order foundation sudah memiliki
implementasi berarti. Legacy manual-transfer mutation juga sudah ditutup.

Backend tetap belum production-ready karena:

1. insiden credential NIV-001 belum `Verified`;
2. production account migration dan rollout granular RBAC belum dijalankan;
3. legacy order create/status lifecycle masih memiliki integrity gap;
4. file ownership, validation, retention, dan production storage belum
   memenuhi ADR-002;
5. transaction/audit boundary belum konsisten pada seluruh mutation baru dan
   lama;
6. login rate limit serta token/session/password policy masih terbuka;
7. notification outbox belum memiliki delivery worker/operational
   reconciliation lengkap dan readiness masih terbatas;
8. payment provider, shipping, tax, refund, storage, production-readiness, dan
   go-live decisions tetap terbuka.

## 4. Verification Evidence

### 4.1 Reconciled internal backend suite — 27 July 2026

Dijalankan dari repository root setelah merge `origin/main` `4403529`,
penyelesaian konflik content router, dan Slice B material:

```bash
backend/.venv/bin/python -m pytest -q -rs backend \
  --ignore=backend/tests/backend_test.py
```

Result:

```text
445 passed
7 skipped
0 failed
14 subtests passed
```

Tujuh skip adalah real-replica-set modules yang memerlukan explicit opt-in dan
`MONGO_TRANSACTION_TEST_URL`. Focused catalog/content/inventory/material
regression juga lulus `37 passed, 1 skipped`; material suite lulus `8 passed`.

Invocation awal tanpa `--ignore` membaca `frontend/.env` lokal dan mencoba
external integration URL `localhost:8000`. Sandbox menolak koneksi tersebut:
445 internal test tetap lulus, 30 test ter-skip, dan 8 external requests gagal.
Kegagalan itu merupakan environment/configuration gate external suite, bukan
failure pada unit/internal backend suite. Credential integration tidak
dikonfigurasi dan tidak disimpan ke evidence.

### 4.1.1 Full backend test — 26 July 2026

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

### 4.1.2 Full backend test — 24 July 2026 baseline (historis)

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
- Evidence date: 27 July 2026
- Previous state:
  - local `main` pada audit awal ahead 31 dan behind 116;
  - branch kerja pada 27 July 2026 ahead 5 dari branch remote-nya dan behind 52
    dari `origin/main`.
- Resolution:
  - posisi lama disimpan pada
    `backup/local-main-before-sync-20260724-e0bf95a`;
  - WIP material 27 July disimpan pada stash recoverable
    `wip/material-transaction-before-origin-main-reconcile-20260727`;
  - `origin/main` `4403529` di-merge ke branch kerja pada `0b0c1d0`;
  - WIP dipulihkan dan dilanjutkan tanpa kehilangan perubahan.
- Follow-up:
  - jangan hapus branch atau stash backup tanpa approval terpisah;
  - audit commit baru sebelum melanjutkan pekerjaan pada sesi berikutnya.

### BA-002 — Canonical role model conflicts with runtime role model

- Severity: P0
- Status: `decision_resolved_implementation_open`
- Evidence date: 27 July 2026
- Canonical evidence:
  - Master Spec menetapkan role internal granular, dari Content Editor, Catalog
    Manager, Warehouse, dan seterusnya sampai Super Admin.
- Runtime evidence:
  - [`backend/permissions.py`](../../backend/permissions.py) sekarang memakai
    stable granular identifiers dari `content_editor` sampai `super_admin`,
    additive multi-role resolution, dan fail-closed legacy internal markers;
  - [`backend/migrations/006_granular_role_policy.py`](../../backend/migrations/006_granular_role_policy.py)
    menyediakan dry-run, reviewed mapping, apply, dan constrained rollback;
  - identity governance routes dan tests sudah mengikuti granular matrix.
- Decision:
  - granular internal role model remains canonical;
  - recorded in
    [`DEC-ACCESS-001`](../decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md)
    dan
    [`DEC-ACCESS-002`](../decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md).
- Implementation still open:
  - reviewed mapping untuk setiap existing internal account;
  - backup/restore exercise, non-production apply/idempotency evidence, smoke
    test, dan authorized production rollout.

### BA-003 — Operations user/audit access conflicts with design and test

- Severity: P0
- Status: `resolved`
- Resolution evidence date: 27 July 2026
- Resolution:
  - aggregate role `operations` tidak lagi menjadi runtime role kanonis;
  - granular operational roles tidak menerima general user directory, complete
    role definitions, atau full audit log;
  - hanya `super_admin` yang menerima identity governance surface, sedangkan
    domain timelines memakai allowlisted projection;
  - permission dan identity suites lulus pada reconciled internal suite.
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
- Remaining rollout work berada pada BA-002, bukan authorization defect BA-003.

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
- Status: `resolved`
- Resolution evidence date: 27 July 2026
- Runtime resolution:
  - `POST /api/orders/{oid}/payment-proof` mengembalikan `410
    legacy_manual_transfer_disabled`;
  - legacy estimate/manual-transfer instruction dan verify-payment mutation
    juga mengembalikan `410`;
  - public settings memakai allowlisted company-profile projection dan tidak
    mengekspos legacy bank fields;
  - `/api/admin/payment-capabilities` menyatakan provider inactive, manual
    transfer disabled, checkout inactive, dan Finance activation not approved;
  - historical orders tetap dapat dibaca melalui compatibility projection.
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
- Follow-up di luar resolution mutation:
  - unresolved historical-case procedure;
  - payment-proof retention dan storage reconciliation pada BA-008;
  - provider-neutral payment implementation tetap open pada ADR-003.

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
- Positive replacement foundation pada 27 July 2026:
  - `backend/retail_domain.py`, `retail_service.py`, dan `retail_routes.py`
    menyediakan Retail Order aggregate terpisah;
  - order baru pada aggregate tersebut memakai integer minor units, immutable
    item/price snapshots, transactional counter, operation ID, version check,
    transition graph, dan customer-safe projection.
- Gap tetap open karena legacy `/api/orders` create/status routes masih aktif
  dan masih memiliki sebagian besar defect di atas. Replacement aggregate
  belum merupakan guest-first checkout atau production payment flow.
- Impact:
  - duplicate order number pada concurrency;
  - duplicate history/notification;
  - status regression;
  - inconsistent amount semantics;
  - retry setelah ambiguous failure dapat menghasilkan efek ganda.
- Re-verifikasi 27 July 2026: legacy `EstimateReq.amount` masih `float`, legacy
  order number masih memakai `count_documents`, dan legacy status mutation
  belum memakai version/idempotency/transition graph.

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
- Evidence date: 27 July 2026
- Positive controls:
  - transaction capability probe tersedia;
  - central executor dan mutation guard tersedia;
  - identity governance, B2B conversion/project creation, Retail Order create,
    catalog publish/rollback/child replacement, inventory single-operation,
    content publish/rollback, dan material mutation menggunakan shared guard;
  - local/CI replica-set topology files tersedia;
  - fail-closed `transaction_unavailable` contract tersedia.
- Completed on the reconciled branch:
  - delapan direct blocks yang tercatat pada plan 26 July dipindahkan ke shared
    guard;
  - material create, update, archive, dan immutable price-version sekarang
    menempatkan mutation dan audit pada callback/session yang sama;
  - injected audit failure regression membuktikan keempat material mutation
    tidak meninggalkan partial document.
- Open gaps after reconciliation:
  - multi-material work-order inventory operation masih memakai
    `start_session()` langsung;
  - CMS `transition_block` masih memakai direct transaction block;
  - CMS create/update/archive masih menulis mutation dan audit secara terpisah;
  - catalog archive menulis product lalu audit secara terpisah;
  - concurrent catalog publish menghitung next revision sebelum transaksi;
  - direct blocks baru dari 52 upstream commits belum seluruhnya memakai
    central unknown-commit reconciliation boundary.
- Impact:
  - mutation yang tersisa dapat berhasil tanpa audit jika audit write gagal;
  - concurrent publication dapat menghasilkan raw conflict;
  - ambiguous transaction outcome tidak diproyeksikan secara seragam.
- Environment limitation:
  - real replica-set foundation pernah direproduksi 26 July 2026;
  - reconciled 27 July suite menjalankan 445 internal tests, tetapi tujuh
    real-replica-set modules di-skip karena explicit opt-in/URL tidak tersedia.

### BA-010 — Authentication and public-input hardening is incomplete

- Severity: P1
- Status: `partial`
- Evidence date: 27 July 2026
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
  - forgot/reset password sudah memakai generic response, bounded process-local
    limiter, 30-minute single-use token, hashed token storage, dan
    `token_version` session invalidation;
  - granular-role resolver dan blocked account checks diterapkan saat login dan
    token use;
  - contact form dan admin notification sudah memakai `html.escape`.
- Masih terbuka:
  - login tetap tidak memiliki rate limit sama sekali;
  - `_rate_buckets` masih dict in-memory per process dan tidak bertahan lintas
    restart/worker, sehingga limiter yang ada bukan kontrol produksi;
  - legacy order filename masih dimasukkan ke HTML email tanpa escaping;
  - password, token/session, dan authentication-event policy belum diputuskan.
- Decision dependency:
  - `DEC-AUTH-002` menahan pemilihan topologi limiter;
  - `AUTH-DEC-03` sampai `AUTH-DEC-07` masih terbuka.
- Impact yang tersisa:
  - brute-force exposure pada login;
  - stored notification/email HTML content spoofing.

### BA-011 — Structured CMS foundation is not implemented

- Severity: P2
- Status: `resolved`
- Resolution evidence date: 27 July 2026
- Terimplementasi pada
  [`backend/content_service.py`](../../backend/content_service.py) dan
  [`backend/content_domain.py`](../../backend/content_domain.py):
  - lifecycle `draft`, `review`, `preview`, `scheduled`, `published`, dan
    `archived` dengan validated transition graph;
  - permission-aware publish boundary;
  - validasi field sebelum publish;
  - version snapshot per perubahan;
  - `rollback_block` dengan `rollback_source_version_id`;
  - scheduled content menjadi eligible pada public read setelah waktunya;
  - archive menggantikan hard delete;
  - public projection hanya mengekspos allowlisted published-safe fields;
  - portfolio memiliki reviewed publication lifecycle dan archive terpisah.
- Verification:
  - content route/lifecycle suites lulus setelah reconciliation;
  - source-level resolution tidak menyatakan browser, staging, atau production
    rollout selesai.
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
- Atomic adoption pada content create/update/archive dan transition tetap
  dicatat terpisah pada BA-009.

### BA-012 — Notification, background task, and readiness boundaries are weak

- Severity: P2
- Status: `partial`
- Evidence date: 27 July 2026
- Notification:
  - notification feed sekarang memiliki allowlisted reference, deduplication,
    read state, unread count, dan reader isolation;
  - `notification_outbox` memiliki enqueue, pending claim, attempt count,
    delivered/exhausted state;
  - outbox belum dihubungkan ke production delivery worker, leasing/claim
    concurrency, schedule/backoff, atau operator reconciliation surface;
  - beberapa legacy mutation masih mengirim email langsung setelah core write.
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
- Status: `partial`
- Evidence (27 July 2026):
  - `.github/workflows/quality-gates.yml` sekarang menjalankan `pip check`,
    compile, full backend tests, frontend tests, dan frontend build;
  - reconciled internal backend suite lulus 445 tests dengan tujuh documented
    replica-set skips;
  - workflow belum menjalankan mypy, configured critical lint, atau
    `pip-audit`;
  - external integration suite masih bergantung pada URL/credential environment
    dan local `frontend/.env` dapat membuatnya mencoba server yang tidak aktif;
  - old generated report mengklaim 100% pass tetapi XML menyimpan failure;
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

Status pada tabel ini diperbarui 27 July 2026 setelah rekonsiliasi dengan
`origin/main` `fd299cd`. Status implementasi adalah evidence, bukan authority
baru dan bukan production-rollout approval.

| Plan or scope | Audit status | Safe interpretation |
|---|---|---|
| Backend Framework Security Upgrade | `resolved` | Terimplementasi; `pip-audit` evidence masih kurang |
| Backend Auth Phase A Login Issuance | `completed execution record` | Terimplementasi dan merged; Phase B sampai D tetap terblokir keputusan |
| Backend Authentication Hardening | `partial` | Phase A serta forgot/reset selesai; login limiter dan policy Phase B-D masih open/deferred |
| Forgot & Reset Password | `implemented` | Backend/frontend implementation dan focused tests tersedia; production rollout tidak dibuktikan |
| Admin Content Editor and Module Audit | `implemented` | Structured CMS, review/preview/schedule/version/rollback/archive dan UI tersedia; atomic adoption gap dicatat pada BA-009 |
| Reporting, Bulk, Notifications, Dashboard | `implemented` | CSV export, per-item bulk actions, admin notifications, dan role-aware dashboard tersedia |
| Backend Transaction/Audit Boundary Adoption | `partial` | Original Slice A dan material portion dari Slice B selesai; content atomicity, new direct blocks, catalog revision conflict, dan cleanup tetap open |
| Amend Identity Access Model | `context only` + superseded role direction | Three-role target superseded; granular replacement implementation exists under DEC-ACCESS-002, production migration/rollout remains open |
| Foundation Transaction Capability | recorded complete | 120/120 checklist selesai; real local verification sudah direproduksi 26 July 2026 |
| Catalog/Material/Inventory Foundation | `partial` | Real transaction verification sudah terpenuhi 26 July 2026; browser permission/workflow QA masih unchecked |
| Remove Emergent/Local Storage | backend substantially complete | Fresh optimized frontend build masih unchecked; production storage tidak termasuk |
| Foundation Identity/RBAC plan lama | historical, misleading if used as backlog | Puluhan checkbox kosong tetapi implementation berikutnya sudah ada; jangan execute ulang |
| NIV-001 History Rewrite | `open` | Implemented, verification pending; destructive execution perlu explicit approval |
| Auth experience remediation | context only | Pending separate approval; bukan backend implementation authority |
| Admin Studio remediation | context only | Pending separate approval; tidak mengubah backend authorization |
| Retail Catalog Discovery | candidate with source overlap | Candidate belum approved; public catalog foundation exists tetapi bukan evidence approval slice |
| Retail Order & Checkout | candidate with partial source foundation | Admin Retail Order aggregate exists; guest checkout, reservation, payment, dan tracking belum |

Relevant register:

- [`docs/context/DOCUMENT_REGISTER.md`](DOCUMENT_REGISTER.md)
- [`docs/implementation/plans/pending-reconciliation/`](../implementation/plans/pending-reconciliation/)
- [`docs/implementation/specs/candidates/`](../implementation/specs/candidates/)

## 7. Scope Not Yet Implemented as Canonical Product Capability

Bagian ini bukan authorization untuk mengimplementasikan capability berikut.

### Foundation gaps

- complete file ownership/validation/retention boundary;
- consistent transaction/audit adoption;
- production storage adapter and readiness;
- full operational audit coverage;
- connected durable notification delivery worker and reconciliation;
- production migration/rollout evidence for granular RBAC;
- complete replacement or retirement of the unsafe legacy order surface.

### Retail MVP

- approved first Retail vertical slice;
- guest-first checkout;
- authoritative preview;
- atomic multi-line reservation;
- provider-neutral payment orchestration implementation;
- production/QC/fulfillment milestones;
- shipment/pickup;
- guest tracking.

### B2B MVP

- design version and approval;
- DP/termin/invoice lifecycle;
- QC and shipment lifecycle;
- full organization/project query isolation.

Inquiry/RFQ, immutable quotation versions, project conversion, project/work
order lifecycle, BOM allocation, dan shortage recovery sudah memiliki source
foundation. Daftar di atas mencatat gap yang masih tersisa, bukan menyatakan
seluruh B2B belum dimulai.

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
- [x] Rekonsiliasi branch kerja dengan `origin/main` `4403529` tanpa
      kehilangan WIP material. Selesai 27 July 2026 pada merge `0b0c1d0`.
- [x] Refresh empat commit berikutnya sampai `origin/main` `fd299cd` tanpa
      kehilangan WIP. Selesai 27 July 2026 pada merge `2dbcd8b`.
- [x] Putuskan canonical role model: granular roles remain canonical.
- [x] Putuskan operational access: no general user directory, complete role
      definitions, or full audit; scoped audit requires an approved matrix.
- [x] Putuskan boundary legacy manual transfer: historical records read-only;
      new manual-transfer/payment-proof activity disabled.
- [ ] Selesaikan redacted credential rotation/revocation evidence.
- [ ] Dapatkan approval khusus sebelum NIV-001 rewrite rehearsal.
- [x] Rekonsiliasi status identity amendment dengan Master Spec, Document
      Register, dan Decision Register melalui `DEC-ACCESS-002` dan granular
      runtime implementation. Production migration/rollout tetap terpisah.
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
- [x] Fix RBAC test/runtime setelah Phase 0 decision. Granular runtime matrix,
      identity governance, migration 006, dan tests tersedia; production
      account migration/rollout tetap terbuka pada BA-002.
- [x] Tolak disabled login sebelum token issuance. Selesai melalui Phase A;
      lihat BA-010.
- [ ] Tambahkan login rate limit yang sesuai deployment topology. Terblokir
      `DEC-AUTH-002`.
- [ ] Tetapkan password/session/token policy. Terblokir `AUTH-DEC-05` dan
      `AUTH-DEC-06`.
- [ ] Tetapkan reproducible dependency boundary.
- [ ] Konfigurasikan critical lint dan type-check gate.
- [x] Jalankan reconciled internal backend suite tanpa failure. Selesai
      27 July 2026: 445 passed, 7 documented replica-set skips, 0 failed.
      External URL/credential suite tetap environment gate terpisah.

Exit criteria:

- zero known vulnerability pada approved dependency audit;
- `pip check` pass;
- full configured backend suite pass dengan hanya documented environment skip;
- authorization matrix konsisten;
- critical static checks menjadi reproducible.

### Phase 2 — Foundation data integrity

- [ ] Terapkan central transaction boundary pada mutation yang membutuhkannya.
- [x] Jadikan material create/update/archive/price-version dan audit atomic.
      Selesai 27 July 2026 dengan shared guard dan injected-failure regression.
- [ ] Jadikan catalog archive dan content create/update/archive atomic.
- [ ] Tambahkan safe catalog revision conflict behavior.
- [ ] Ganti monetary float dengan Decimal/minor unit.
- [ ] Buat order number concurrency-safe dan unique.
- [ ] Definisikan legacy order transition graph.
- [ ] Tambahkan version check dan idempotency key.
- [ ] Tambahkan transactional audit untuk sensitive order/payment mutation.
- [ ] Hubungkan notification outbox/retry primitives ke delivery worker,
      backoff/claim coordination, dan operator reconciliation.
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
- [x] Implement CMS draft/review/preview/publish/schedule/version/rollback/archive.
- [x] Implement separate Retail Order dan B2B inquiry/quote/project/work-order
      source foundations. Customer journeys, payment, dan rollout tetap open.
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

- [x] Implement inquiry/RFQ aggregate dan triage lifecycle.
- [x] Implement immutable quotation versions dan approval lifecycle.
- [ ] Implement design version and approval.
- [x] Implement project conversion/lifecycle dan work-order production
      foundation.
- [ ] Complete customer-facing project milestones and ETA history.
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

Status: **Approved — recorded as `DEC-ACCESS-001` and detailed by
`DEC-ACCESS-002`**

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
docs/decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md
```

### DEC-AUD-BE-002 — Operations access boundary

Status: **Approved matrix and source implementation — production migration and
rollout remain open**

Decision:

```text
Operational staff may not read the general user directory, complete role
definitions, or full audit events. DEC-ACCESS-002 defines stable granular
roles, additive permissions, Super Admin identity governance, separation of
duties, and allowlisted domain timelines.
```

Approval source/date:

```text
Explicit user approval in the backend-audit conversation, 24 July 2026.
Formal source:
docs/decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md
docs/decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md
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

### 27 July 2026 — Latest-main reconciliation and material atomicity

Baseline: `origin/main` `4403529`, merged into
`fix/auth-phase-a-login-issuance` pada `0b0c1d0`.

- WIP `backend/material_routes.py` disimpan pada recoverable stash sebelum
  merge dan dipulihkan setelah merge; stash backup tidak dihapus.
- Satu merge conflict pada `backend/content_routes.py` diselesaikan dengan
  mempertahankan lifecycle/permission terbaru dan shared-guard injection.
- Material create, update, archive, dan price-version dipindahkan ke
  `TransactionMutationGuard`; mutation dan audit sekarang memakai session yang
  sama.
- Ditambahkan regression yang menginjeksi audit insert failure dan membuktikan
  keempat material mutation di-roll back.
- Focused material suite: 8 passed.
- Focused catalog/content/inventory/material regression: 37 passed, 1 skipped.
- Reconciled internal backend suite: 445 passed, 7 documented replica-set
  skips, 0 failed, 14 subtests passed.
- External integration invocation membaca URL lokal dari `frontend/.env`;
  sandbox menolak delapan request ke server yang tidak aktif. Suite itu
  dipisahkan dari internal evidence dan tidak diberi credential.
- BA-002 diperbarui untuk granular runtime/migration 006 dengan production
  rollout tetap open.
- BA-006 menjadi `resolved` untuk mutation lockdown.
- BA-009 tetap `partial`: original Slice A dan material Slice B selesai,
  sementara content/catalog dan direct blocks baru tetap open.
- BA-011 menjadi `resolved` untuk structured CMS source foundation.
- BA-012 dan BA-013 menjadi `partial` karena outbox primitives dan CI quality
  workflow sudah ada tetapi gate operasional/static belum lengkap.
- Status plan dan Document Register direkonsiliasi dengan source terbaru.

Tidak ada provider, production-readiness, go-live, atau push yang dilakukan.

### 27 July 2026 — Follow-up main refresh

Baseline: `origin/main` `fd299cd`, merged into
`fix/auth-phase-a-login-issuance` pada `2dbcd8b`.

- Empat commit upstream baru di-fetch setelah material/doc reconciliation.
- Seluruh 11 file WIP disimpan pada stash recoverable
  `wip/slice-b-docs-before-main-refresh-20260727`.
- Merge selesai tanpa conflict; perubahan upstream pada refresh ini hanya
  menyentuh public marketing frontend.
- WIP dipulihkan lengkap dan `git diff --check` tetap bersih.
- Branch berada 0 commit di belakang `origin/main`; kedua stash backup tidak
  dihapus.

Tidak ada push, provider, production-readiness, atau go-live action.
