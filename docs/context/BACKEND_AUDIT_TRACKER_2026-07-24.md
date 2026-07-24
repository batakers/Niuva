# Niuva Backend Audit Tracker

Status: **Context Only — Active Audit Tracker — Not Implementation Authority**
Audit date: 24 July 2026
Last updated: 24 July 2026
Repository baseline at last update: `main` / `origin/main` at `0b0b556`
Backend test baseline: `7505b48`

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
2. permission Operations yang bertentangan dengan desain dan test;
3. dependency Starlette rentan sementara upgrade yang sudah disetujui belum
   diterapkan;
4. insiden credential NIV-001 yang belum `Verified`;
5. legacy manual-transfer flow yang masih dapat membuat transaksi baru;
6. order, file, audit, CMS, notification, dan readiness boundary yang belum
   memenuhi requirement kanonis;
7. real MongoDB replica-set verification yang belum dapat direproduksi di
   lingkungan audit.

## 4. Verification Evidence

### 4.1 Full backend test

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

Docker tidak tersedia pada lingkungan audit, sehingga local MongoDB replica-set
verification belum dapat dijalankan.

### 4.2 Other checks

| Check | Result | Interpretation |
|---|---|---|
| `python -m compileall -q backend` | Pass | Tidak ditemukan compile error Python |
| `python -m pip check` | Pass | Dependency yang terpasang kompatibel; bukan vulnerability audit |
| `mypy`, source non-test | 46 errors pada 8 file | Type-check belum menjadi quality gate yang lulus |
| `flake8` | 912 findings | Mayoritas line length; terdapat unused import dan formatting debt |
| Critical syntax lint selection | Pass | Tidak ditemukan critical syntax/static failure pada selection tersebut |

Package yang ter-resolve pada environment audit:

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
- Status: `blocked_by_decision`
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
- Required decision:
  - pertahankan model role granular kanonis; atau
  - formally amend canonical requirements dan Decision Register ke model tiga
    role.
- Do not:
  - mengubah test, migration, atau permission matrix untuk memilih salah satu
    model tanpa keputusan tertulis.

### BA-003 — Operations user/audit access conflicts with design and test

- Severity: P0
- Status: `blocked_by_decision`
- Runtime:
  - role `operations` memiliki `users.read` dan `audit.read`.
- Design:
  - Operations tidak boleh manage users/roles atau inspect full audit.
- Test:
  - `/api/admin/roles` diharapkan `403`, tetapi runtime mengembalikan `200`.
- Impact:
  - least-privilege contract tidak konsisten;
  - test suite merah;
  - perubahan test saja dapat menyembunyikan authorization regression.
- Required decision:
  - apakah Operations boleh mempunyai `users.read`;
  - apakah Operations boleh mempunyai `audit.read`;
  - apakah `/api/admin/roles` termasuk safe metadata atau privileged identity
    administration.

### BA-004 — Approved framework security upgrade is not implemented

- Severity: P0
- Status: `approved_not_started`
- Evidence:
  - [`backend/requirements.txt`](../../backend/requirements.txt) masih memakai
    FastAPI `0.110.1`;
  - environment me-resolve Starlette `0.37.2`;
  - approved security spec menargetkan FastAPI `0.139.2`, exact Starlette
    `1.3.1`, dan Pydantic floor `2.9.0`.
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
- Status: `blocked_by_decision`
- Runtime:
  - estimate route mengirim instruksi transfer bank;
  - customer dapat mengunggah payment proof;
  - Finance dapat memverifikasi payment proof;
  - public settings dapat mengekspos konfigurasi bank legacy.
- Canonical conflict:
  - Retail production baseline adalah provider-neutral online payment;
  - tidak ada transitional manual-transfer adapter baru tanpa keputusan tertulis;
  - candidate checkout hanya mengizinkan legacy records tetap readable.
- Authority:
  - [`docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`](../decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md)
- Required decision:
  - ubah flow menjadi read-only legacy compatibility; atau
  - izinkan creation hanya pada environment tertentu dengan decision, expiry,
    Finance control, storage boundary, dan feature flag tertulis.

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
- Open gaps:
  - catalog dan inventory masih mempunyai direct transaction blocks;
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
  - real replica-set verification belum direproduksi lokal.

### BA-010 — Authentication and public-input hardening is incomplete

- Severity: P1
- Status: `open`
- Evidence:
  - customer login tidak memeriksa `disabled` sebelum menerbitkan token;
  - token tersebut ditolak pada request berikutnya, sehingga bukan bukti access
    bypass, tetapi login contract tetap salah dan membingungkan;
  - login tidak memiliki rate limit;
  - contact limiter berada di memory per process dan tidak bertahan lintas
    restart/worker;
  - internship endpoint tidak memiliki throttle;
  - beberapa internship fields tidak memiliki batas panjang;
  - order filename, estimate note, dan internship values dimasukkan ke HTML
    email/notification tanpa escaping.
- Impact:
  - brute-force dan spam exposure;
  - resource abuse;
  - stored notification/email HTML content spoofing.

### BA-011 — Structured CMS foundation is not implemented

- Severity: P2
- Status: `open`
- Runtime evidence:
  - portfolio masih berupa simple CRUD;
  - public list tidak memfilter published/active lifecycle;
  - update tidak menyimpan version history;
  - delete memakai hard delete;
  - tidak ada draft, review, preview, publish, schedule, version, rollback, atau
    auditable archive lifecycle.
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
- Evidence:
  - full backend suite memiliki satu failure;
  - 46 mypy errors pada source non-test;
  - 912 flake8 findings;
  - old generated report mengklaim 100% pass tetapi XML menyimpan failure;
  - external integration suite bergantung pada server URL dan skip bila tidak
    dikonfigurasi.
- Required direction:
  - tetapkan supported Python/type-check configuration;
  - pisahkan style debt dari critical lint;
  - jadikan test report machine-generated dan immutable;
  - jangan menyimpan credential di fixture/report;
  - jadikan required integration topology eksplisit di CI.

## 6. Implementation Plan Reconciliation

Checklist lama tidak boleh dibaca secara mekanis sebagai backlog. Status pada
bagian ini sudah dibandingkan dengan Document Register, source, dan test.

| Plan or scope | Audit status | Safe interpretation |
|---|---|---|
| Backend Framework Security Upgrade | `approved_not_started` | Sudah approved dalam bounded security scope; requirements masih versi lama |
| Amend Identity Access Model | `partial` + `blocked_by_decision` | Task 1–7 tampak diterapkan, Task 8 tertunda; role authority masih bertentangan |
| Foundation Transaction Capability | recorded complete | 120/120 checklist selesai dan implementation exists; real local verification tidak direproduksi |
| Catalog/Material/Inventory Foundation | `partial` | Real transaction verification dan browser permission/workflow QA masih unchecked |
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
- [ ] Putuskan canonical role model.
- [ ] Putuskan akses Operations terhadap user metadata, role metadata, dan audit.
- [ ] Putuskan boundary legacy manual transfer.
- [ ] Selesaikan redacted credential rotation/revocation evidence.
- [ ] Dapatkan approval khusus sebelum NIV-001 rewrite rehearsal.
- [ ] Rekonsiliasi status identity amendment dengan Master Spec, Document
      Register, dan Decision Register.
- [ ] Tandai plan lama sebagai completed/context/superseded sesuai evidence,
      tanpa mengubah status berdasarkan checkbox saja.

Exit criteria:

- satu role matrix kanonis;
- satu permission contract yang sama antara docs, code, dan test;
- test RBAC dapat diperbaiki berdasarkan keputusan, bukan asumsi;
- NIV-001 mempunyai approved next state;
- tidak ada plan lama yang dapat disalahartikan sebagai authority.

### Phase 1 — Security upgrade and green quality gate

- [ ] Implement approved FastAPI/Starlette security upgrade.
- [ ] Jalankan `pip-audit` dan simpan redacted result.
- [ ] Fix RBAC test/runtime setelah Phase 0 decision.
- [ ] Tolak disabled login sebelum token issuance.
- [ ] Tambahkan login rate limit yang sesuai deployment topology.
- [ ] Tetapkan password/session/token policy.
- [ ] Tetapkan reproducible dependency boundary.
- [ ] Konfigurasikan critical lint dan type-check gate.
- [ ] Jalankan full backend suite tanpa unexpected skip/failure.

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
- [ ] Jalankan real MongoDB replica-set tests.

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

Status: **Open**

Choose one:

- keep granular canonical internal roles; or
- formally adopt Owner, Operations, and Commercial & Finance, then amend
  canonical requirements and decision records.

Decision:

```text
Pending user decision.
```

Approval source/date:

```text
Pending.
```

### DEC-AUD-BE-002 — Operations access boundary

Status: **Open**

Questions:

- May Operations read the user list?
- May Operations read role definitions?
- May Operations inspect full audit events?
- If only safe summaries are allowed, what fields and scopes are permitted?

Decision:

```text
Pending user decision.
```

Approval source/date:

```text
Pending.
```

### DEC-AUD-BE-003 — Legacy manual-transfer boundary

Status: **Open**

Choose one:

- existing records remain readable, but new manual-transfer creation is
  disabled; or
- allow a bounded non-production transitional flow with explicit environment,
  expiry, Finance control, storage, audit, and feature-flag rules.

Decision:

```text
Pending user decision.
```

Approval source/date:

```text
Pending.
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
