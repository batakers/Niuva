# Niuva AI-Agent Team Workflow

Status: Context Only — Team Working Guide — Not Product, Implementation, or Go-Live Authority

## Tujuan

Panduan ini membantu tiga orang bekerja cepat dengan AI agent tanpa mencampur
perubahan, mengarang aturan bisnis, atau melewati approval. Panduan ini tidak
menggantikan Master Spec, decision/ADR, runbook, atau instruksi repository.

## Peran tim

Gunakan tiga peran berikut untuk setiap task. Satu orang boleh berganti peran
di task berikutnya, tetapi tiap task hanya memiliki satu **Driver**.

| Peran | Tanggung jawab manusia | Batas AI agent |
|---|---|---|
| Driver | Menentukan scope, membuat branch/worktree, menjalankan agent, dan menyiapkan PR. | Boleh mengubah hanya scope yang disetujui. |
| Reviewer aturan | Memeriksa authority, keputusan terbuka, data/privacy, dan scope creep. | Tidak mengubah aturan bisnis tanpa approval. |
| Verifier | Menjalankan atau meninjau test, diff, aksesibilitas, dan bukti handover. | Tidak menyatakan selesai bila bukti belum ada. |

Untuk task kecil, satu orang boleh menjadi Driver dan Verifier, tetapi orang
lain tetap melakukan review PR. Untuk auth, data, migration, payment, atau
authorization, gunakan tiga peran terpisah.

### Kepemilikan kompetensi default

Rotasi peran tidak menghilangkan kejelasan keahlian. Untuk tim ini, gunakan
pembagian default berikut; Project Lead tetap dapat meminta review lintas-area.

| Anggota | Fokus utama | Tanggung jawab integrasi |
|---|---|---|
| Faiz - Project Lead dan Integrator | pemilihan phase/slice, dependency, kontrak lintas layer, urutan merge, dan review akhir | integration/E2E, keputusan yang perlu dieskalasi, serta status roadmap setelah ada evidence yang cukup |
| Dimas - Backend, Data, dan Security | route/service, business logic, auth, authorization, MongoDB, transaksi, dan backend test | menjaga contract backend serta bukti negative-path dan data-safety |
| Dirga - Frontend, UI/UX, dan Accessibility | React, API client, state, route protection, form/state, responsive, a11y, dan browser test | menjaga consumer contract, keyboard/focus, state kegagalan, dan browser evidence |

Pembagian ini adalah fokus utama, bukan izin untuk mengubah lintas layer tanpa
scope. Setiap perubahan contract tetap memiliki satu owner aktif dan review
dari consumer atau producer yang terdampak.

### Rotasi yang sederhana

Jangan menetapkan peran permanen berdasarkan siapa yang paling cepat memakai
AI. Rotasikan peran per task atau per minggu agar semua orang memahami produk,
risiko, dan cara memverifikasi hasil. Contoh satu siklus:

| Task | Driver | Reviewer aturan | Verifier |
|---|---|---|---|
| A: bug frontend terbatas | Dirga | Dimas | Faiz |
| B: endpoint atau data backend | Dimas | Dirga | Faiz |
| C: dokumentasi atau audit | Faiz | Dimas | Dirga |

Peran bukan jabatan. Driver tetap meminta bantuan manusia lain ketika scope
menyentuh area yang belum ia pahami.

## Prinsip kerja

1. Satu task, satu branch, satu worktree, satu Driver.
2. Jangan menjalankan dua agent yang mengedit worktree yang sama secara paralel.
3. AI membantu menemukan, mengubah, dan menguji; manusia tetap pemilik scope,
   keputusan, dan persetujuan.
4. Jangan gunakan source/test terbaru sebagai pengganti aturan bisnis yang
   sudah disetujui.
5. Jangan memberi secret, password, token, connection string, atau data
   pelanggan nyata ke prompt, chat, commit, atau laporan.
6. Tidak ada push, merge, migration, deployment, provider activation, atau
   perubahan credential tanpa instruksi eksplisit dari pemilik yang berwenang.

## Alur kerja standar

### 1. Buat task card sebelum memanggil agent

Tulis card singkat di issue, PR draft, atau catatan tim:

```text
Judul:
Tujuan pengguna:
Finding ID / audit layer (jika remediation):
Baseline SHA dan freshness status (jika remediation):
Phase ID / Task ID (jika remediation):
In scope:
Out of scope:
Authority yang harus dibaca:
Traceability, decision, atau dependency yang terkait:
File/area yang diduga terdampak:
Acceptance criteria:
Verifikasi minimum:
Apakah boleh commit/push/PR?:
Risiko atau keputusan yang masih terbuka:
```

Jika card tidak menyebut izin commit/push/PR, anggap agent hanya boleh membuat
perubahan lokal dan melaporkan hasilnya.

### Gunakan Finding, Phase, dan Task dengan tepat

Untuk pekerjaan remediation, catat tiga tingkat identitas ini pada task card:

| Tingkat | Arti | Contoh |
|---|---|---|
| Finding ID | masalah audit yang dibuktikan pada baseline tertentu | `BE-011`, `SEC-003`, `FE-008` |
| Phase ID | kelompok kerja yang bergantung pada decision dan dependency tertentu | `PHASE-01B` |
| Task ID | slice kecil yang dapat diverifikasi dan direview sendiri | `TASK-01B-02` |

Jangan memberi task seperti “perbaiki semua backend”. Lebih aman: “diagnosis
dan tambah negative-path test untuk `TASK-01B-02` pada `PHASE-01B`.” Bila
finding berasal dari audit historis, status awalnya adalah kandidat
`requires_revalidation` sampai dicek terhadap SHA yang dipilih; bukan fakta
current secara otomatis.

### Dari mana memilih finding, phase, dan task

Untuk memilih pekerjaan remediation, Driver selalu mulai dari dua direktori
berikut di checkout Niuva yang menjadi base task:

```text
docs/context/production-readiness-audit/
docs/implementation/production-readiness/
```

Gunakan keduanya bersama-sama, dengan fungsi yang berbeda:

| Tujuan | File yang dibaca | Hasil yang dicatat di task card |
|---|---|---|
| Memahami baseline dan batas audit | `AUDIT_INDEX.md`, `AUDIT_BASELINE.md`, `AUDIT_METHODOLOGY.md` | SHA audit, freshness note, dan batas evidence |
| Membuktikan finding asal | `layers/01-...md` sampai `layers/11-...md` yang relevan | Finding ID, severity, evidence path, dan status historis |
| Menentukan apakah finding masih berlaku dan terkelompok | `FINDING_TRACEABILITY.md` | status revalidation, dependencies, decision, dan finding duplikat/tergabung |
| Memilih urutan phase/subphase | `REMEDIATION_ROADMAP.md` dan `REMEDIATION_PROGRESS.md` | Phase/Task ID, precondition, blocker, dan exit criteria |
| Memastikan owner, batas slice, dan cara verifikasi | `TEAM_ASSIGNMENT.md` dan `VERIFICATION_MATRIX.md` | owner, file/area scope, test/evidence, dan handoff |
| Memeriksa keputusan yang belum tersedia | `DECISIONS_REQUIRED.md` | Decision Required ID dan alasan `blocked_by_decision` |

Urutan praktisnya:

1. Pilih finding dari layer audit, bukan dari tebakan atau nama branch.
2. Buka traceability untuk melihat apakah finding sudah digabung, duplikat,
   `requires_revalidation`, atau punya dependency/decision terbuka.
3. Pilih phase paling awal yang dependency-nya memenuhi syarat di roadmap dan
   progress tracker; jangan melompati phase hanya karena terlihat lebih mudah.
4. Cocokkan owner dan batas file dengan team assignment, lalu ambil
   verification evidence dari matrix.
5. Jika folder `phases/` belum berisi plan yang disetujui untuk phase itu,
   buat plan **hanya bila** formal plan memang diperlukan; jangan menganggap
   README atau roadmap sebagai izin implementasi.
6. Salin Finding ID, Phase ID, Task ID, baseline SHA, dan decision/blocker ke
   task card sebelum membuat branch atau memberi prompt ke agent.

Folder audit menyimpan evidence historis; folder implementation menyimpan
urutan remediation dan tracker. Tidak satu pun mengesahkan source change,
migration, provider, production-readiness, atau go-live dengan sendirinya.

### Kapan perlu implementation plan formal

Task card cukup untuk perubahan kecil, jelas, dan berisiko rendah. Buat
implementation plan formal bila task lintas frontend/backend, mengubah auth,
authorization, data, transaction, migration, dependency, keputusan terbuka,
atau memiliki rollback yang tidak sepele. Plan harus menyebut scope, files yang
boleh/tidak boleh berubah, test, rollback, serta decision yang masih terbuka.

Plan adalah artefak perencanaan, bukan approval. Eksekusi hanya dimulai jika
otorisasi implementasi yang relevan memang sudah tersedia; bila belum, output
yang sah adalah plan atau audit read-only.

### 2. Baca authority sebelum implementasi

Driver mengarahkan agent untuk membaca, berurutan:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. Decision/ADR yang relevan
5. Runbook yang relevan bila task menyentuh operasi, migration, rollback, atau recovery
6. Source dan test yang terdampak

Catat dokumen yang mengatur task dan pertanyaan yang belum terjawab. Bila ada
konflik atau decision terbuka, berhenti pada perencanaan dan minta keputusan;
jangan meminta AI memilih policy sendiri.

`AGENTS.md` dibaca sebagai guardrail repository sebelum bekerja. Direktori
`docs/context/production-readiness-audit/` dan
`docs/implementation/production-readiness/` dibaca **hanya jika task terkait**,
untuk finding, baseline, dependency, dan bukti revalidasi. Keduanya tidak
menggantikan Master Spec, Decision Register, ADR, runbook, atau approval.

### 3. Isolasi pekerjaan

Sebelum mengedit, Driver memeriksa status repository dan membuat worktree dari
base yang sudah di-fetch. Contoh PowerShell:

```powershell
git fetch origin
git worktree add ../Niuva-<task-singkat> -b <type>/<task-singkat> origin/main
```

Jangan berpindah branch, reset, stash, clean, atau checkout paksa di worktree
yang berisi kerja orang lain. Jangan pernah memakai `git add .` atau `git add -A`.

Jangan memakai `git switch main` lalu `git pull` pada worktree lama sebagai
langkah rutin: itu dapat mencampur atau mengganggu pekerjaan lokal anggota
lain. Base branch diverifikasi lewat `origin/main` yang baru di-fetch. Sebelum
PR atau merge, periksa mergeability dan dependency; update dari `origin/main`
hanya dilakukan pada branch task bila memang diperlukan oleh konflik atau
kebijakan repository, bukan otomatis dengan rebase/merge.

### Kerja paralel yang aman

Paralelkan **penemuan dan verifikasi**, bukan edit pada file atau worktree yang
sama. Gunakan matriks ini sebelum menjalankan beberapa agent:

| Kondisi | Boleh paralel? | Cara aman |
|---|---|---|
| Dua orang mengubah file yang sama atau satu kontrak API | Tidak | Satu Driver menyelesaikan slice lebih dulu. |
| Backend dan frontend bergantung pada kontrak yang belum final | Tidak | Selesaikan decision/kontrak, lalu pecah task. |
| Audit source, audit dokumen, dan penyusunan test matrix | Ya | Read-only di worktree atau clone terpisah; satu catatan temuan. |
| Implementasi backend dan frontend dengan kontrak sudah beku | Ya | Satu branch/worktree per slice, PR terpisah, dan urutan merge dicatat. |
| Verifikasi PR terhadap branch yang sudah siap | Ya | Verifier memakai worktree baca/QA terpisah dan tidak mengedit branch Driver. |

Setiap task paralel harus memiliki `Task ID`, owner, branch, worktree, file
scope, dependency, dan definisi selesai. Jika salah satu field belum jelas,
jangan mulai edit paralel.

Gunakan file ownership sebagai **lock sementara**, bukan kepemilikan mutlak.
Jika dua slice perlu file yang sama, Driver mencatat owner aktif dan urutan
handoff; contributor lain boleh melakukan discovery atau review read-only,
tetapi tidak mengedit file itu sampai handoff selesai.

### 4. Beri prompt yang dapat diaudit

Gunakan prompt yang eksplisit. Contoh:

```text
Anda bekerja pada branch <branch> di worktree <path>.
Tujuan: <tujuan>.
In scope: <path/behaviour>.
Out of scope: <daftar tegas>.
Authority: <dokumen dan decision>.
Jangan ubah dependency, config, credential, migration, atau file di luar scope.
Jangan commit/push/PR tanpa instruksi saya.
Sebelum edit: laporkan file terdampak dan risiko.
Sesudah edit: jalankan <test/check>, tampilkan changed paths, dan laporkan
yang tidak dapat diverifikasi.
```

Untuk audit, tambahkan: `read-only; jangan mengubah file`. Untuk bug yang belum
jelas, minta agent mendiagnosis dulu, bukan langsung memperbaiki.

### Prompt khusus untuk tiga tahap utama

Gunakan prompt berbeda agar agent tidak mencampur discovery, perubahan, dan
penilaian hasil.

**Discovery oleh Reviewer aturan**

```text
Audit read-only untuk Task <ID>. Baca authority yang disebutkan, lalu petakan:
aturan yang mengikat, keputusan terbuka, file kandidat, risiko data/otorisasi,
dan acceptance criteria. Jangan mengubah file dan jangan memilih business rule
yang belum disetujui. Laporkan evidence dengan path dan line bila tersedia.
```

**Implementasi oleh Driver**

```text
Implementasikan Task <ID> hanya pada scope yang disetujui. Pertahankan semua
pre-existing changes. Jangan menyentuh file di luar scope atau menjalankan
commit/push/PR. Bila authority, kontrak, atau test bertentangan, berhenti dan
laporkan blocker. Sesudah perubahan, jalankan verifikasi yang ditentukan.
```

**Verifikasi oleh Verifier**

```text
Review Task <ID> secara independen. Jangan mempercayai ringkasan sebelumnya
tanpa memeriksa diff dan bukti. Nilai changed paths, authority, test yang
dijalankan, test yang tidak dapat dijalankan, security/privacy, dan rollback.
Jangan mengubah source; keluarkan PASS, BLOCKED, atau NEEDS CHANGES beserta
evidence singkat.
```

Tambahkan guardrail sesuai layer pada prompt implementasi:

- Backend: jangan mengurangi authorization, melemahkan test, atau menambah
  fallback non-atomic untuk mutasi yang memerlukan transaksi; selalu uji
  positive dan negative path yang terdampak.
- Frontend: jangan mengarang endpoint, field response, role, atau permission;
  periksa loading/error/empty/unauthorized state, responsive behavior,
  keyboard/focus, label aksesibel, dan kegagalan API.
- Lintas layer: beku dan referensikan contract terlebih dahulu; consumer tidak
  boleh dibangun di atas asumsi contract lama atau mock yang menutupi backend
  yang seharusnya tersedia.

### 5. Implementasi kecil dan berhenti pada batas

Driver membagi task besar menjadi slice yang dapat dihentikan, misalnya:

| Slice | Contoh keluaran |
|---|---|
| Penemuan | authority, file map, risiko, dan acceptance matrix |
| Implementasi | perubahan terbatas pada file yang disetujui |
| Verifikasi | test, lint/build, manual check, dan known limitations |
| Handover | ringkasan diff, rollback, keputusan lanjut, dan PR |

Jangan mencampur refactor “sekalian”, redesign, perubahan dependency, atau
perbaikan lint yang tidak terkait. Jika agent menemukan masalah di luar scope,
catat sebagai follow-up task.

### Pilih mode kerja sesuai jenis task

| Jenis task | Urutan kerja | Batas penting |
|---|---|---|
| Perbaikan kecil yang jelas | Driver -> Verifier -> PR review | Satu branch; jangan menambah refactor. |
| Bug belum jelas | Reviewer discovery -> Driver diagnosis -> Verifier | Jangan melakukan fix sebelum penyebab dan scope dibuktikan. |
| Fitur lintas frontend/backend | Authority/kontrak -> backend atau contract slice -> frontend -> integrasi | Pisahkan PR bila dependency belum bisa di-merge bersama. |
| Audit atau planning | Read-only discovery -> temuan/decision register -> review manusia | Tidak mengubah source atau menandai temuan selesai tanpa evidence current. |
| Dokumentasi | Inventory -> authority/redaction/link review -> PR | Status dokumen tidak mengubah approval atau implementation authority. |
| Auth, data, migration, payment, provider, deployment | Decision/runbook -> approval gate -> isolated implementation -> bukti khusus | Tidak ada asumsi izin untuk data nyata, credential, rollout, atau go-live. |

### 6. Verifikasi berlapis

Verifier memeriksa bukti, bukan hanya ringkasan agent:

```powershell
git status --short
git diff --check
git diff --name-only origin/main...HEAD
git diff --stat origin/main...HEAD
```

Tambahkan verifikasi proporsional:

- Backend: test target, authorization positif/negatif, data customer aman, dan
  replica set nyata untuk mutasi yang membutuhkan transaksi.
- Frontend: test/build yang relevan, route/lazy import/navigation, permission,
  i18n, responsive dan keyboard/focus bila UI berubah.
- Dokumentasi: relative-link check, status/authority header, redaction, dan
  changed-path gate.
- Migration/operasi: ikuti runbook; backup, dry run, validation, rollback, dan
  approval terpisah wajib ada.

Test yang gagal karena environment harus dilaporkan sebagai blocker environment,
bukan disembunyikan atau dianggap lulus.

### 7. Review manusia dan PR

Sebelum PR, Reviewer aturan memastikan:

- scope dan changed paths sesuai task card;
- keputusan terbuka tidak diubah diam-diam;
- tidak ada secret, credential, `.env`, `.coverage`, build/cache, atau artefak test;
- dokumentasi tidak mengklaim approval, readiness, atau resolved tanpa evidence;
- test dan limitasi tercantum.

Jika push/PR sudah diizinkan, Driver stage path eksplisit, membuat commit kecil
yang logis, lalu menyiapkan Draft PR. Minimal satu teman review; untuk task
berisiko, dua reviewer memberi persetujuan sebelum merge.

### Setelah merge: evidence dahulu, tracker kemudian

PR merge membuktikan perubahan source telah masuk, bukan bahwa finding otomatis
selesai atau produk sudah production-ready. Project Lead hanya memperbarui
`REMEDIATION_PROGRESS.md`, `FINDING_TRACEABILITY.md`, `TEAM_ASSIGNMENT.md`, atau
layer audit jika scope tugas memang mengizinkannya dan evidence current mencatat
SHA, test/verification, limitation, serta owner. Status `resolved` memerlukan
evidence yang disyaratkan oleh tracker dan authority terkait; jika belum,
gunakan status seperti `implemented_pending_verification` atau
`requires_revalidation`.

## Ritme kerja tim bertiga

| Waktu | Driver | Reviewer aturan | Verifier |
|---|---|---|---|
| Mulai task | Membuat task card dan worktree | Mengonfirmasi authority/scope | Mengonfirmasi acceptance dan check |
| Saat implementasi | Menjalankan agent dan menjaga scope | Menjawab/eskalasi keputusan | Menyiapkan test/manual matrix |
| Sebelum PR | Menyiapkan diff dan handover | Review aturan, privacy, dan scope | Menjalankan/meninjau verifikasi |
| Setelah merge | Memastikan follow-up tercatat | Memperbarui keputusan hanya bila disetujui | Mencatat bukti dan blocker tersisa |

Lakukan sync 10–15 menit saat mulai dan sebelum PR. Sampaikan hanya: scope,
authority, perubahan yang sedang dilakukan, blocker, dan siapa pemilik langkah
berikutnya.

### Format update yang konsisten

Kirim pembaruan singkat di chat tim saat handoff atau ketika blocker muncul:

```text
Task ID / status: <discovery | implementing | blocked | ready for review>
Owner / reviewer / verifier: <nama>
Branch dan worktree: <nilai>
Authority: <dokumen/decision>
Perubahan atau temuan: <satu sampai tiga poin>
Verifikasi: <lulus / belum jalan dan alasannya>
Blocker atau next owner: <nilai>
```

Jangan menempelkan output panjang agent atau data sensitif ke chat. Simpan
evidence yang perlu direview pada PR, file dokumentasi yang diizinkan, atau
ringkasan yang sudah direduksi.

## Checklist handover agent

Setiap agent harus menghasilkan jawaban singkat untuk:

```text
Apa yang diubah?
Mengapa perubahan ini sesuai authority?
File mana yang berubah dan sengaja tidak berubah?
Verifikasi apa yang lulus?
Verifikasi apa yang tidak dijalankan, dan mengapa?
Risiko, rollback, atau keputusan terbuka apa yang tersisa?
Apakah ada tindakan eksternal yang belum dilakukan (commit/push/PR/migration/deploy)?
```

## Aturan eskalasi cepat

Berhenti dan minta keputusan manusia bila terjadi salah satu hal berikut:

- scope perlu melebar ke source, migration, dependency, config, atau data lain;
- authority bertentangan atau tidak menjawab business rule;
- ada secret/data sensitif atau kemungkinan kebocoran;
- transaksi lintas koleksi tidak bisa dijalankan dalam Mongo replica set;
- test kritis gagal atau hasilnya tidak dapat direproduksi;
- perubahan membutuhkan provider, Finance, production, rollout, atau go-live decision;
- worktree/branch tidak bersih atau berpotensi mencampur kerja orang lain.

## Definition of done

Task dianggap siap direview, bukan otomatis selesai, bila scope dipenuhi,
changed paths bersih, verifikasi relevan tercatat, limitation jujur, dan PR
memiliki reviewer manusia. Task selesai setelah merge yang sah dan follow-up
atau blocker yang tersisa sudah tercatat. Untuk remediation, “task selesai”
tetap berbeda dari finding `resolved`, production-ready, dan go-live approved.

## Rutinitas pertama untuk tim

Untuk memulai minggu ini, pilih satu task kecil tanpa migration, credential,
payment, atau perubahan provider. Buat task card, jalankan alur tiga peran,
dan gunakan Draft PR sebagai bahan latihan review. Setelah merge, lakukan
retrospektif 15 menit: prompt mana yang terlalu longgar, bukti apa yang kurang,
dan guardrail apa yang perlu ditambahkan ke task card berikutnya. Jangan
menambah aturan produk dari retrospektif; catat hanya perbaikan cara kerja.
