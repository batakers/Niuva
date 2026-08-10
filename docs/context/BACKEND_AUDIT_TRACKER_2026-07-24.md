# Niuva Backend Audit Tracker

Status: **Context Only — Active Audit Tracker — Not Implementation Authority**
Audit date: 24 July 2026
Last updated: 30 July 2026
Repository baseline at last update: `origin/main` at
`84f2ece`; Feature 2.4 verification ran on
`fix/backend-file-security` before and after merging that baseline
Backend test baseline: 653 passed, 15 skipped, and 14 subtests passed on the
Feature 2.4 working tree

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
3. migration 007 belum di-dry-run terhadap clone data nyata, belum memiliki
   reviewed duplicate mapping, dan belum di-apply;
4. provider, retention, malware ownership, backup, serta production storage
   readiness pada ADR-002 masih terbuka;
5. staging evidence untuk worker outage/recovery, readiness probes, backup
   restore, dan auth cutover atomik belum tersedia;
6. CRA/toolchain masih memiliki dependency debt; React Router menyisakan
   advisory khusus RSC yang tidak reachable pada SPA BrowserRouter tetapi tetap
   harus dipantau/migrasi;
7. legacy order dan archived organization data dipertahankan read-only dan
   masih memerlukan reviewed compatibility/reconciliation evidence;
8. payment provider, shipping, tax, refund, storage, production-readiness, dan
   go-live decisions tetap terbuka.

### 3.1 Reconciliation update — 28 July 2026

This dated subsection supersedes older status text for the named finding IDs
below. The older entries remain as audit history and must not be used to infer
the current source state.

| Current remediation phase | Status | Remaining gate |
|---|---|---|
| Phase 0 — governance/containment | `partial` | NIV-001 rotation/revocation evidence and any history-rewrite rehearsal still require separate approval |
| Phase 1 — security/auth/runtime | `implemented_with_needs_clarification` | `ADR-005` conflicts with `DEC-AUTH-004`/`DEC-AUTH-005` on password policy, Admin lifetime, route/response contract, and bootstrap prerequisites |
| Phase 2 — schema/data integrity | `implemented_in_source` | 007→008→009 clone rehearsal, reviewed backup/restore evidence, non-production apply, and production rollout are not executed |
| Phase 3 — Retail discovery | `implemented_in_source` | staging performance/accessibility evidence; every transaction capability remains inactive |
| Phase 4 — active frontend/backend integration | `implemented_in_source` | manual Admin browser matrix requires approved HTTPS staging origins and dedicated role accounts |
| Phase 5 — active-scope business logic | `implemented_in_source` | historical compatibility fixtures require migration preflight; excluded checkout/payment/production-storage policy remains unresolved |
| Phase 6 — quality/operations | `partial` | NIV-001 closure evidence remains open, while the current PR scan findings are reviewed exact false positives; alert/metrics provider and numerical performance thresholds are unapproved; staging, outage/recovery, backup/restore, and documentation rehearsal remain operational work |

Current finding reconciliation:

- `BA-004`: `resolved`; local `pip-audit` reports no known backend
  vulnerabilities.
- `BA-005`: remains `open`, but the 28 July rehearsal preflight corrects the
  immediate CI diagnosis. The three findings in the 234-commit PR checkout are
  one test-only CSRF fixture and two historical documentation sentences about
  token removal, all reviewed with a 100%-redacted Gitleaks 8.30.1 report and
  ignored only by exact fingerprint. After pruning deleted remote-tracking
  refs, none of the four advertised remote heads or any remote tag contains
  the recorded NIV-001 introducing commit. Credential rotation/revocation,
  cached PR-ref/clone disposition, and final incident evidence are still
  unverified, so NIV-001 is not closed and no real finding is ignored.
- `BA-007`: `resolved_for_active_scope`; all legacy order creation, estimate,
  payment verification, status, and bulk mutation paths are denied, while
  historical reads remain available.
- `BA-008`: `resolved_for_active_development_scope`; local media now uses
  bounded streaming upload/download, signature validation, DB ownership/state,
  compensation, and published-snapshot authorization. Malware scanning and a
  production provider remain outside the active capability and keep production
  upload inactive.
- `BA-009`: `resolved_in_source`; the named content/catalog/portfolio/settings/
  identity/material/inventory/B2B mutation groups use the shared transaction/
  CAS boundary, including real replica-set regression.
- `BA-010`: `implemented_with_needs_clarification`; Mongo login/public limiters,
  reset single-use/revocation, cookie/CSRF boundaries, safe HTML, and
  customer/staff separation are present. The governing password/Admin-session
  conflict above prevents final closure.
- `BA-013`: `partial_operational`; hermetic backend/frontend suites, Retail
  Playwright, compile, fatal lint, focused mypy, formatting, dependency audits,
  build, and manual external-Admin workflow exist. NIV-001 and unexecuted
  staging jobs prevent a green production-readiness claim.
- Durable notification delivery is now used by Admin messages, inventory
  alerts, canonical inquiries, and retained legacy contact intake. Provider
  delivery remains worker-owned with atomic lease, retry/backoff, and exhausted
  state; local verification does not replace an approved staging outage/recovery
  exercise.

Latest verified evidence is maintained in
[`docs/implementation/history/2026-07-27-backend-remediation-retail-discovery.md`](../implementation/history/2026-07-27-backend-remediation-retail-discovery.md).

### 3.2 Feature 2.3 reconciliation update — 29 July 2026

This update supersedes older BA-006/BA-007 statements that described active
legacy create or status behavior.

- Customer list/detail responses use an explicit nested allowlist and omit
  notes, storage paths, bank/provider fields, cost, margin, supplier, profit,
  raw audit data, and unknown fields.
- Customer detail and design-file lookup bind `id` and authenticated `user_id`
  in the database query.
- Internal readers receive an allowlisted projection. Operational notes require
  `orders.write`; safe estimate/payment history requires `payments.read`.
- Safe historical payment metadata may show amount/currency/time, verification
  state/time, proof-recorded state, and safe proof filename/type/size.
- Legacy creation, estimate, payment-proof upload, payment verification, single
  status mutation, and bulk status mutation remain inactive.
- Focused Feature 2.3 verification passed 47 tests. Full backend regression
  passed 620 tests with 12 documented skips and 14 subtests.

Detailed evidence:
[`FEATURE-2.3-legacy-order-projection-remediation.md`](../implementation/production-readiness/phases/FEATURE-2.3-legacy-order-projection-remediation.md).

Historical reconciliation, retention, proof-object custody, production-data
inventory, deployment, and go-live remain separate operational gates.

### 3.3 Transaction and commercial integrity update — 30 July 2026

This subsection preserves the pre-merge review snapshot from the `origin/main`
baseline `7d8d5c9`. It is superseded for current PR state by the 31 July 2026
revalidation below.

- At that snapshot, Feature 3.1 Shared transaction executor was open in PR #95
  at `21cc57b`.
  Backend, frontend, secret-scan, transaction-tests, and CodeRabbit status
  checks are green. CodeRabbit nevertheless recorded actionable runbook and
  catalog concurrency/slug-race review findings; those must be verified and
  resolved before Feature 3.1 can be marked accepted.
- At that snapshot, Feature 3.2 Quote-line identity was open in PR #96 at
  `3eccbd6`. It enforces
  immutable server-owned line identity, exact accepted Quote-version and Work
  Order references, cumulative quantity per exact line, historical-ambiguity
  rejection, and no variant fallback or automatic backfill.
- Feature 3.2 verification passed 40 focused tests, 630 full backend tests with
  12 documented skips and 14 subtests, 9 focused real replica-set tests, and
  68 full real replica-set tests. All GitHub CI jobs are green.
- PR #96 did not receive a substantive CodeRabbit review because the review
  limit was reached. Independent or later automated review remains a merge
  gate; this does not invalidate the passing source/test evidence.
- The aggregate-only Quote-line report and runbook are source-complete.
  Execution against historical data remains separately gated to an explicitly
  approved isolated target. No shared/staging/production data, migration,
  inference, backfill, deployment, or go-live action occurred.

Detailed Feature 3.2 evidence:
[`2026-07-30-backend-quote-line-identity.md`](../implementation/history/2026-07-30-backend-quote-line-identity.md).

### 3.4 Retail Order contract hardening update — 10 August 2026

This current-source update supersedes only the earlier statement that no
bounded Retail transaction contract slice had been selected. It does not
activate or complete the Retail transaction lifecycle.

- Feature 3.4A adds strict authenticated cart intent, semantic idempotency,
  authoritative published/active catalog snapshots, bounded
  quantity/currency/fulfilment rules, a basic provider-neutral lifecycle, and
  append-only version-bound audit history.
- Duplicate requests are accepted only when their operation ID and semantic
  request fingerprint match exactly; changed reuse is rejected.
- Concurrent lifecycle writers share an `id + version + status`
  compare-and-swap precondition, so a stale command must not overwrite a
  winning transition.
- Focused verification passed `68` tests. Full backend regression passed
  `1031` tests with `15` explicit environment-gated skips and `14` subtests;
  expected-skip enforcement found zero unexpected skips.
- Retail create/transition routes and checkout/payment capabilities remain
  explicitly inactive. No database, reservation, provider, migration,
  deployment, or shared/production environment was used.

Detailed task/evidence:
[`FEATURE-3.4A-retail-order-contract-hardening.md`](../implementation/production-readiness/phases/FEATURE-3.4A-retail-order-contract-hardening.md).

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
- Status: `resolved_for_active_scope`
- Resolution evidence date: 29 July 2026
- Active runtime resolution:
  - legacy create returns `503 legacy_order_creation_inactive`;
  - estimate, payment-proof upload, and verification return `410
    legacy_manual_transfer_disabled`;
  - single and bulk status commands return `410
    legacy_order_mutations_disabled`;
  - tests prove every refused command leaves the historical record unchanged;
  - the retained reads use ownership/permission-scoped allowlisted projections.
- Positive replacement foundation pada 27 July 2026:
  - `backend/retail_domain.py`, `retail_service.py`, dan `retail_routes.py`
    menyediakan Retail Order aggregate terpisah;
  - order baru pada aggregate tersebut memakai integer minor units, immutable
    item/price snapshots, transactional counter, operation ID, version check,
    transition graph, dan customer-safe projection.
- The former concurrency, float, transition, version, idempotency, and atomic
  audit defects are no longer reachable through active legacy commands. They
  must not be treated as permission to re-enable those commands.
- Remaining gates:
  - unresolved historical-case procedure and named reconciliation owner;
  - retention and proof-object custody;
  - production-data inventory and reconciliation evidence;
  - any future Retail mutation activation requires its own approved canonical
    aggregate/payment implementation, not revival of the legacy commands.

### BA-008 — File access, validation, and retention do not meet ADR-002

- Severity: P1
- Status: `resolved_for_active_development_scope`; production gates remain
  `blocked_by_decision`.
- Current bounded controls:
  - storage default `disabled`;
  - local storage hanya diizinkan untuk development/demo/test;
  - path traversal validation tersedia;
  - production local storage ditolak.
  - upload membaca bounded chunks, menerapkan application size limit, dan
    memvalidasi signature untuk caller yang mengaktifkan content validation;
  - metadata database memegang owner, domain/object type, validation, dan
    active/deleted/quarantined state;
  - download customer memerlukan exact owner; internal download memerlukan
    domain permission dan tidak memperoleh owner bypass dari uploader identity;
  - opaque file-object ID dan logical-path compatibility route memakai
    authorization metadata yang sama;
  - download memakai streaming, safe server-selected media type, attachment,
    `nosniff`, restrictive CSP, dan private no-store;
  - query-string `auth`, `token`, dan `access_token` tidak mengautentikasi file;
  - partial storage/metadata failure dikompensasi dan error dinormalisasi.
- Open production/operational gaps:
  - belum ada malware scan/quarantine;
  - provider, retention/quota, backup/restore, RPO/RTO, dan owner belum dipilih;
  - historical validation/reconciliation evidence belum lengkap;
  - logical-path compatibility belum dapat dipensiunkan sampai seluruh consumer
    berpindah ke opaque ID atau domain route;
  - payment-proof retention/custody tetap menunggu procedure terpisah.
- Authority:
  - [`docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`](../decisions/architecture/ADR-002-production-file-storage-architecture.md)
- Production upload remains blocked until ADR readiness gates are satisfied.

### BA-009 — Transaction and audit boundary adoption

- Severity: P1
- Status: `resolved_in_source`
- Evidence date: 30 July 2026
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
  - catalog CRUD/archive dan audit sekarang berada dalam callback/session yang
    sama;
  - seluruh content mutation dan multi-material inventory memakai shared guard;
  - local `_require_transactions()` pada catalog/content/inventory dihapus,
    sehingga shared `transaction_rejected` dan wire contract menjadi satu jalur;
  - catalog publish/rollback memilih revision di dalam transaksi dan memakai
    compare-and-set untuk memproyeksikan contention sebagai domain `409`;
  - real replica-set suite 30 July 2026: 70 passed, 0 skipped, termasuk injected
    catalog audit failure, fail-closed rejection, concurrent publication, dan
    bulk inventory observability.
- Remaining boundary:
  - migration 007 tetap memiliki transaction block sendiri karena migration
    execution dan production data mutation digate terpisah;
  - production topology, rollout, monitoring ownership, dan go-live tetap open
    dan tidak diotorisasi oleh penyelesaian finding source ini.

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
- Resolution evidence date: 31 July 2026
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
  - concurrent publish dan rollback pada real local replica set masing-masing
    menghasilkan satu winner dan satu domain `409 version_conflict`;
  - injected audit failure membuktikan version snapshot, publication snapshot,
    aggregate update, dan audit tetap atomic;
  - scheduled datetime tanpa timezone dan waktu lampau ditolak, sedangkan
    offset yang valid dinormalisasi ke UTC;
  - Content Editor dapat author tetapi tidak dapat publish/rollback;
    Manager/Approver mempertahankan approval boundary;
  - focused CMS/permission/topology contracts: 65 passed;
  - real CMS replica-set contracts: 3 passed;
  - full backend: 662 passed, 14 skipped, 14 subtests passed;
  - full frontend: 36 suites dan 239 tests passed;
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
  mengikuti shared transaction guard pada BA-009. Migration 007, production
  topology, deployment, monitoring, dan go-live tetap open.

### BA-012 — Notification, background task, and readiness boundaries are weak

- Severity: P2
- Status: `resolved_in_source`
- Evidence date: 27 July 2026
- Notification:
  - notification feed sekarang memiliki allowlisted reference, deduplication,
    read state, unread count, dan reader isolation;
  - `notification_outbox` memiliki enqueue, pending claim, attempt count,
    delivered/exhausted state;
  - outbox terhubung ke worker dengan atomic lease, retry/backoff, delivery key,
    dan exhausted state;
  - beberapa legacy mutation masih mengirim email langsung setelah core write.
- Background task:
  - FastAPI lifespan menyimpan dan membatalkan task saat shutdown;
  - notification delivery memakai Mongo lease sehingga duplicate delivery
    dapat dicegah lintas worker;
  - worker dapat dipisah dari web process melalui capability configuration.
- Readiness:
  - `/health/ready` mengembalikan 503 dan memeriksa live DB ping,
    transaction capability, required schema/index version, storage/email
    capability, dan required worker health.

### BA-013 — Static quality and test reporting are not reliable merge gates

- Severity: P2
- Status: `partial_toolchain_debt`
- Evidence (27 July 2026):
  - `.github/workflows/quality-gates.yml` menjalankan `pip check`, dependency
    audit, compile, critical lint/type checks, hermetic backend tests, frontend
    dependency policy, frontend tests/build, dan secret scan;
  - reconciled internal backend suite terbaru lulus 457 tests dengan tujuh documented
    replica-set skips;
  - external integration suite dipisahkan menjadi explicit manually triggered
    job dengan URL environment sendiri;
  - React Router menyisakan advisory high khusus RSC server-action yang tidak
    reachable pada SPA BrowserRouter ini; downgrade 7.11 ditolak karena membuka
    advisory lama dan mematahkan resolver Jest. CRA migration tetap debt aktif;
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
| Backend Framework Security Upgrade | `resolved` | Terimplementasi; `pip check` dan `pip-audit` terbaru lulus tanpa known vulnerability |
| Backend Auth Phase A Login Issuance | `completed execution record` | Terimplementasi dan merged; Phase B sampai D tetap terblokir keputusan |
| Backend Authentication Hardening | `implemented_in_source` | Cookie sessions, rotation/replay revocation, CSRF, Mongo limiter, password/reset policy, customer/staff boundary, dan bearer cutover disetujui oleh `DEC-REMED-001`; rollout tetap belum dilakukan |
| Forgot & Reset Password | `implemented` | Backend/frontend implementation dan focused tests tersedia; production rollout tidak dibuktikan |
| Admin Content Editor and Module Audit | `implemented` | Structured CMS, review/preview/schedule/version/rollback/archive dan UI tersedia; atomic adoption gap dicatat pada BA-009 |
| Reporting, Bulk, Notifications, Dashboard | `implemented` | CSV export, per-item bulk actions, admin notifications, dan role-aware dashboard tersedia |
| Backend Transaction/Audit Boundary Adoption | `implemented_in_source` | Shared guard/CAS/publication adoption mencakup content, settings, portfolio, identity, Work Order, material/inventory, dan migration manifest; production migration tetap belum dijalankan |
| Transaction and Commercial Integrity — Feature 3.1 | `merged_evidence` | PR #95 merged as `84f2ece` after corrective findings and CI; current-main regression passed, while production topology/migration/readiness remain separate |
| B2B Quote-line Identity — Feature 3.2 | `merged_evidence` | PR #96 merged as `850d11a`; exact identity/version/quantity enforcement is present, while historical-data execution remains a separate gated operation |
| Amend Identity Access Model | `context only` + superseded role direction | Three-role target superseded; granular replacement implementation exists under DEC-ACCESS-002, production migration/rollout remains open |
| Foundation Transaction Capability | recorded complete | 120/120 checklist selesai; real local verification sudah direproduksi 26 July 2026 |
| Catalog/Material/Inventory Foundation | `partial` | Real transaction verification sudah terpenuhi 26 July 2026; browser permission/workflow QA masih unchecked |
| Remove Emergent/Local Storage | backend substantially complete | Fresh optimized frontend build masih unchecked; production storage tidak termasuk |
| Foundation Identity/RBAC plan lama | historical, misleading if used as backlog | Puluhan checkbox kosong tetapi implementation berikutnya sudah ada; jangan execute ulang |
| NIV-001 History Rewrite | `open` | Implemented, verification pending; destructive execution perlu explicit approval |
| Auth experience remediation | context only | Pending separate approval; bukan backend implementation authority |
| Admin Studio remediation | context only | Pending separate approval; tidak mengubah backend authorization |
| Retail Catalog Discovery | `implemented_in_source` | Read-only listing/detail dan secondary Homepage/navigation entry disetujui `DEC-REMED-001`; no transaction endpoint dipanggil |
| Retail Order & Checkout | `inactive` | Source aggregate historis tetap ada, tetapi create/legacy mutation/checkout/payment/reservation/fulfillment tidak aktif |

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
- [x] Jalankan `pip-audit` dan simpan redacted result. Verifikasi lokal
      27 July 2026 lulus tanpa known vulnerability.
- [x] Fix RBAC test/runtime setelah Phase 0 decision. Granular runtime matrix,
      identity governance, migration 006, dan tests tersedia; production
      account migration/rollout tetap terbuka pada BA-002.
- [x] Tolak disabled login sebelum token issuance. Selesai melalui Phase A;
      lihat BA-010.
- [x] Tambahkan Mongo atomic login limiter 5/account dan 20/peer-IP per 15
      menit. Disetujui `DEC-REMED-001`, yang secara terbatas supersede deferral
      `DEC-AUTH-002`.
- [x] Tetapkan dan implementasikan password/session/token policy pada scope
      aplikasi sesuai `DEC-REMED-001`.
- [ ] Tetapkan reproducible dependency boundary.
- [x] Konfigurasikan critical lint dan focused type-check gate pada
      `.github/workflows/quality-gates.yml`.
- [x] Jalankan reconciled internal backend suite tanpa failure. Selesai
      27 July 2026: 457 passed, 7 documented replica-set skips, 0 failed,
      14 subtests passed.
      External URL/credential suite tetap environment gate terpisah.

Exit criteria:

- zero known vulnerability pada approved dependency audit;
- `pip check` pass;
- full configured backend suite pass dengan hanya documented environment skip;
- authorization matrix konsisten;
- critical static checks menjadi reproducible.

### Phase 2 — Foundation data integrity

- [x] Terapkan central transaction boundary pada mutation yang membutuhkannya
      dalam scope remediation.
- [x] Jadikan material create/update/archive/price-version dan audit atomic.
      Selesai 27 July 2026 dengan shared guard dan injected-failure regression.
- [x] Jadikan catalog/content/portfolio/settings mutation terkait atomic dan
      expected-version conflict-safe.
- [x] Contain legacy monetary-float risk by keeping every legacy financial
      command inactive; canonical Retail uses integer minor units.
- [x] Contain legacy order-number concurrency risk by keeping legacy creation
      inactive; canonical Retail uses its transactional counter.
- [x] Resolve active legacy transition risk by retaining read-only history;
      legacy single/bulk status commands remain inactive.
- [x] Resolve active legacy replay risk by retaining read-only history; no
      legacy command requires a version or idempotency key while inactive.
- [x] Resolve active legacy audit-atomicity risk by retaining read-only history;
      no sensitive legacy order/payment mutation is enabled.
- [x] Hubungkan notification outbox/retry primitives ke delivery worker,
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

- [x] Implement database-backed file ownership.
- [x] Implement bounded MIME/signature validation untuk active development
      upload; production scanner/provider gates tetap terbuka.
- [ ] Implement malware scanning/quarantine boundary.
- [x] Implement streaming and bounded memory behavior untuk active development
      adapter.
- [x] Implement explicit deletion/quarantine state dan metadata/object
      reconciliation untuk adapter development.
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

- [x] Dapatkan written decision untuk first Retail vertical slice:
      `DEC-REMED-001`, 27 July 2026.
- [x] Dapatkan bounded protected-scope implementation approval.
- [x] Reconcile candidate catalog-discovery spec.
- [x] Implementasikan bounded read-only discovery dengan capability gates,
      migration boundary, dan regression tests.

Current documented candidate:

- read-only Retail catalog discovery;
- kategori, produk, varian, safe price/ETA/availability;
- tanpa cart, checkout, reservation, payment, atau upload.

Slice ini **approved dan implemented in source**. Transaction capability tetap
inactive dan production rollout belum disetujui.

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
- [x] Enforce immutable exact Quote-line identity, exact accepted Quote-version
      and Work Order references, and cumulative quantity per line in source.
- [ ] Execute any approved historical Quote-line reconciliation only as a
      separate isolated-data operation; never infer or automatically backfill.
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

Status: **Resolved for bounded read-only discovery**

Read-only Retail catalog discovery is the approved first slice. Transaction
capabilities remain separate and inactive.

Decision:

```text
Approved via `DEC-REMED-001`; listing/detail, safe projection, cursor
pagination, and secondary discovery entry only.
```

Approval source/date:

```text
Explicit user approval of the NIUVA Backend Remediation dan Retail Discovery
Plan, 27 July 2026.
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

### 27 July 2026 — Backend remediation and Retail discovery implementation

Authority: `DEC-REMED-001`, berdasarkan explicit user approval terhadap NIUVA
Backend Remediation dan Retail Discovery Plan.

- Secure cookie auth, customer/staff login split, refresh rotation/replay
  revocation, CSRF, Mongo limiter, atomic reset, dan bootstrap containment
  diimplementasikan.
- Migration 007, schema/index readiness, immutable content/portfolio
  publications, CAS, file metadata ownership, dan transaction adoption
  diimplementasikan tanpa menjalankan production migration.
- Read-only Retail listing/detail, secondary Homepage/navigation entry,
  customer/staff management split, settings/portfolio integration, Quote
  evidence acceptance, Work Order cap, inventory adjustment approval, dan
  durable notification worker diimplementasikan.
- Retail create, legacy create/mutation, checkout, payment, production upload,
  Organization Portal, dan go-live tetap inactive.
- Verification lokal:
  - backend: 457 passed, 7 documented environment/topology skips, 14 subtests;
  - frontend: 201 passed;
  - Retail Playwright: 4 passed pada mobile dan desktop, termasuk controlled
    empty/error state serta WCAG A/AA scan;
  - optimized frontend build: passed;
  - `pip-audit`: no known vulnerabilities;
  - fatal flake8, focused mypy, black/isort, compile, dan `git diff --check`:
    passed;
  - production npm policy: hanya dua report entry dari satu advisory React
    Router RSC-only yang tidak reachable; semua advisory lain ditolak gate.
- NIV-001 destructive history rewrite, production migration, provider
  selection, deployment, commit/push, dan go-live tidak dilakukan.

### 29 July 2026 — Feature 2.3 legacy Order compatibility remediation

Baseline: `origin/main` `1ada96a591f607e2dba38013cebb1a20e593b782`.

- Customer detail and design-file reads became query-scoped by both order ID
  and authenticated owner ID.
- Customer and internal legacy Order responses now use separate nested
  allowlists.
- Operational notes require `orders.write`; safe estimate/payment history
  requires `payments.read`.
- Historical proof metadata exposes only safe recorded/file metadata and never
  raw storage, bank, provider, cost, margin, supplier, profit, audit, or unknown
  fields.
- Legacy create, estimate, proof upload, verification, single status, and bulk
  status commands remain inactive and are covered by no-mutation assertions.
- Focused compatibility/authorization suite: 47 passed.
- Full backend regression: 620 passed, 12 skipped, 14 subtests passed.
- Dependency audit, compile, critical Flake8, focused MyPy including
  `retail_domain.py`, Black, isort, and diff checks passed.
- The first PR workflow exposed a pre-existing real-time fixed-window boundary
  flake in the login-limiter test. Its test-only clock is now fixed;
  production limiter behavior is unchanged, five consecutive targeted runs
  passed, and the full 620-test backend regression passed again.
- BA-007 is `resolved_for_active_scope`; historical reconciliation, retention,
  proof custody, production inventory, deployment, and go-live remain open.

No migration, historical rewrite/deletion, provider activation, production data
access, deployment, or go-live was performed.

### 30 July 2026 — Transaction and Quote-line integrity status

Feature 3.1 baseline: `origin/main`
`7d8d5c90f6440f1276ee4b82c166258514a93cd1`.

- PR #95 (`21cc57b`) routes catalog, content, and inventory mutations through
  the shared fail-closed transaction boundary.
- Catalog category/product create, update, and archive commit business and
  audit writes in one shared-guard transaction.
- Catalog publish/rollback allocate revisions in-session and use
  compare-and-set conflict handling; concurrent publication has one winner and
  one domain conflict.
- Corrective commit `1cde373` addresses the three valid CodeRabbit findings:
  documented real-test opt-in, slug-race conflict translation, and
  optimistic-concurrency protection for category/product update and archive.
- Feature 3.1 verification before `origin/main` integration: 40 focused tests;
  622 full backend tests with 13 skipped and 14 subtests; 70 mandatory local
  MongoDB 7.0.37 replica-set tests with no skips. Corrective regression:
  14 catalog tests and 624 full backend tests with 13 skipped and 14 subtests.
- Post-integration local regression: 44 focused catalog/Quote-line tests and
  634 full backend tests with 13 skipped and 14 subtests.
- PR #95 merged as `84f2ece` after its corrective backend, frontend,
  secret-scan, and transaction-test jobs passed. Production topology,
  migration, deployment, and readiness remain separate gates.

No historical-data mutation, inference, automatic backfill, migration,
deployment, or go-live action was performed.

### 29 July 2026 — Feature 2.4 file authorization and security remediation

Baseline: `origin/main` `7d8d5c90f6440f1276ee4b82c166258514a93cd1`.

- Local/CI uploads enforce bounded application size while reading; the adapter
  also rejects invalid declared sizes and stops oversized/mismatched sources.
- Explicit signature validators cover PNG, JPEG, WebP, GIF, PDF, ASCII/binary
  STL, and OBJ for callers that enable validation.
- Development media records validation evidence and public media fails closed
  unless publication, state, signature, path type, metadata type, and stored
  type agree.
- Customer file access requires metadata ownership. Internal access requires
  the file-domain permission; `files.read` alone and uploader identity do not
  create a universal bypass.
- Deleted, quarantined, pending, unknown, cross-owner, and cross-domain records
  are hidden as `404`.
- An opaque file-object-ID route was added. The retained logical-path route uses
  the same database-backed policy.
- Normal runtime authentication remains cookie-based. Query parameters named
  `auth`, `token`, and `access_token` do not authenticate file downloads.
- Controlled download headers force safe type handling, attachment,
  `nosniff`, restrictive CSP, and private no-store.
- Partial object/sidecar writes are removed. A failed metadata write compensates
  the just-written development object; metadata and compensation failures
  return normalized `503` responses.
- An ambiguous metadata-write outcome is resolved by opaque file ID/reference
  before compensation. A confirmed active record is accepted; an unresolved or
  conflicting outcome preserves the object and returns a retryable `503` with
  the stable file ID instead of risking an active metadata record that points to
  a deleted object.
- Focused storage, identity/RBAC, legacy projection, and authorization matrix:
  99 passed.
- Full backend regression after merging the PR #95/#96 baseline: 653 passed,
  15 skipped, and 14 subtests passed. The mandatory real replica-set suite
  passed 71 tests without skips.
- Dependency check/audit, compile, critical Flake8, focused storage MyPy,
  Black, isort, and diff checks passed.

BA-008 remains resolved only for the active development/CI scope. Malware
scanning, production provider, retention/quota, backup/restore, RPO/RTO,
operational owners, historical object reconciliation, compatibility-route
retirement, deployment, and go-live remain open.

Implementation lineage beginning at `6e6da02` merged through PR #93 as
`57de1f3`. No dependency, schema, migration, `.env`, provider, shared database,
production data, deployment, or go-live state was changed by that delivery.

Feature 3.2 merged baseline: PR #96, merge commit
`850d11a5a297070e62e23db25120cd4ac79b663a`.

- Exact line/version references, per-line quantity, fail-closed ambiguity, and
  the no-backfill boundary are present on `origin/main`.
- Feature 3.2 local verification recorded 40 focused tests; 630 full backend
  tests with 12 skipped and 14 subtests; 9 focused and 68 full real replica-set
  tests.
- GitHub backend, frontend, secret-scan, and transaction-tests jobs passed
  before merge. Substantive CodeRabbit review was unavailable because of rate
  limiting, so the merge is not independent readiness verification.

Migration apply, historical Quote-line report execution or mapping, backup,
validation against a migration result, rollback/restore, shared/production data
access, provider activation, deployment, production readiness, and go-live
remain separately gated and were not performed. A later local application-
database dry-run audit is recorded below.

### 31 July 2026 — Current-main backend and readiness revalidation

Baseline: `origin/main`
`57de1f36e297e250705e8c47df5bef6b8da86fc9`.

Current Git ancestry confirms PR #96 merged as `850d11a`, PR #95 merged as
`84f2ece`, and PR #93 merged as `57de1f3`. GitHub reported no open pull
requests at revalidation time.

Verification on the isolated audit worktree:

- full backend: 653 passed, 13 skipped, 14 subtests passed;
- auth/session/authorization focus: 92 passed, 1 skipped;
- transaction and Quote-line focus: 53 passed, 2 skipped;
- file security, readiness, and migration-contract focus: 94 passed, 2
  skipped; and
- real local replica-set transaction/session coverage: 21 passed with no
  migration module, using unique `niuva_tx_*` databases that were dropped in
  test cleanup.

The real-replica run used the existing local `rs0` because Docker was not
available. It is useful local evidence but does not replace the tracked
disposable `rs-test`, shared/staging/production verification, backup/restore,
or release evidence.

Live local readiness remained `503 not_ready` while liveness returned `200`.
Database ping and transaction capability were ready. The exact blocking schema
chain was:

- `007_security_publication_schema`: not applied;
- `008_auth_recovery_safety`: not applied; and
- `009_admin_session_safety`: not applied.

Migration 010 is optional while authentication-security events remain
disabled, so its absent marker did not cause this `503`. Its default dry-run
CLI initially had a separate defect: it passed a database object to
`probe_database_capabilities`, which requires the database-name string, and
stopped with `TypeError` before producing its preflight report.

Read-only migration audit against the local application database:

- 007 reported `ready`, 82 planned indexes, no duplicate groups, and no
  portfolio preflight issues;
- 008 scanned zero reset tokens and planned zero invalidations;
- 009 found zero owned indexes, zero TTL indexes, and no existing marker; and
- 010 initially stopped on the CLI probe defect above.

Before/after snapshots matched for migration markers, relevant index names,
and aggregate collection counts. No marker, index, application document,
backup, or migration artifact was created, and no `niuva_tx_*` database
remained. Applying or rolling back 007–010 remains unauthorized until the
target, reviewed backup and restore proof, owner/reviewer, execution window,
stop conditions, and rollback authority are recorded.

#### Bounded Migration 010 dry-run CLI correction

The same audit branch corrects only the Migration 010 CLI seam:

- retain the database name before resolving the Motor database object;
- pass the database-name string to `probe_database_capabilities`; and
- close the Motor client in `finally`.

A regression test verifies the exact probe argument, dry-run report, database
selection, and client cleanup. Verification passed:

- Migration 010 migration tests: 6 passed;
- auth-security/readiness focus: 106 passed;
- full backend: 654 passed, 13 skipped, 14 subtests passed;
- backend compile and `pip check`;
- Black, isort with the Black profile, critical Flake8 selection, and
  `git diff --check`.

The corrected CLI then completed a live local dry run and reported unapplied,
zero owned indexes, zero events, zero alert-outbox records, no historical
backfill, and no second-run no-op. Before/after snapshots remained identical:
the marker was absent, both dedicated collections remained empty, and no owned
index appeared. No apply, rollback, backup, migration marker, application-data
mutation, deployment, or activation occurred.

### 31 July 2026 — Feature 5.1 CMS publication concurrency remediation

Baseline: `origin/main`
`7662a378c3acae6ecc9645b9c471dbb683aac80d`.

The source audit reproduced one remaining CMS publication defect on a real
local MongoDB replica set: two publish requests using the same expected version
produced one successful publication and one raw MongoDB
`OperationFailure`. The losing request did not satisfy the documented domain
conflict contract.

The bounded remediation on `fix/backend-cms-publication`, published for review
as PR #99:

- translates real MongoDB duplicate/write/transient transaction contention on
  versioned content mutations into `409 version_conflict` after reading the
  current aggregate version;
- applies the same boundary to update, transition, publish, rollback, and
  archive without replaying the business callback;
- maps a concurrent unique-slug insert to the retained `409 slug_conflict`;
- adds real replica-set concurrent publish, concurrent rollback, and injected
  audit-failure rollback tests to the mandatory transaction workflow;
- verifies the Content Editor versus Manager/Approver publication boundary;
  and
- verifies future/timezone validation and UTC normalization for scheduled
  publication.

Verification at the branch baseline:

- CMS/permission/topology focus: 65 passed;
- real local CMS transaction suite: 3 passed using unique generated databases
  that were dropped in cleanup;
- complete mandatory local transaction matrix: 74 passed;
- full backend: 662 passed, 14 skipped, 14 subtests passed; and
- full frontend: 36 suites and 239 tests passed.

PR #99 then passed the GitHub backend, frontend, secret-scan, and disposable
`rs-test` transaction jobs.

The local transaction run used the existing `rs0` listener on port 27019
because Docker is unavailable. No migration was executed, no shared or
production data was accessed, and no schema, provider, deployment,
production-readiness, or go-live state was changed.
