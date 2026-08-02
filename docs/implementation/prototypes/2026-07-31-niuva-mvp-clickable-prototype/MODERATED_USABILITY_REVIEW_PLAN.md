# Moderated Usability Review Plan — Niuva MVP

Status: **NOT READY TO RUN — FULL FORMAL EXPERT CRITIQUE RERUN REQUIRED**
Prepared: 31 July 2026
Minimum participants: one Niuva non-IT operator and one prospective Retail customer
Prototype: `http://127.0.0.1:4177/`
Decision targets:

- `CAND-CART-01`: durable `/retail/cart`;
- `CAND-AFTER-01`: `/orders/:id/file-revision`;
- `CAND-AFTER-02`: `/orders/:id/cancellation`;
- `CAND-AFTER-03`: `/orders/:id/complaints/new`;
- `CAND-AFTER-04`: `/orders/:id/complaints/:caseId`.

This plan is usability evidence preparation. It does not promote a route,
authorize implementation, or change a canonical decision.

Earlier P1 findings were remediated through several focused rounds. Round 5 was
recorded as PASS but is invalid for current gate use: it did not exercise a
clean-session non-fixture direct Order URL, and its cited browser recording is
not present in the repository artifact. Pre-publication review reproduced the
identity mismatch. The prototype-only fix then passed focused browser
revalidation R6. Do not run route-promotion sessions until a complete formal
expert critique confirms the entire P0/P1 scope and this status changes to
`READY TO RUN`. The script and results template remain prepared for use after
that gate. Evidence: `FORMAL_EXPERT_CRITIQUE_RERUN_5.md` and
`FOCUSED_BROWSER_REVALIDATION_R6.md`.

## 1. Review objective

The sessions determine whether participants can:

1. understand the cart as a durable but non-authoritative draft before
   checkout;
2. continue through the account boundary without believing an Order or
   payment already exists;
3. distinguish file revision, cancellation, complaint intake, and case status;
4. recover through direct/deep links without losing the owned task;
5. understand customer-safe status and next action; and
6. operate the corresponding Admin workflow without mixing approval, Finance
   execution, or customer/internal data.

The review tests route ownership and user mental models. It does not decide API
shape, authorization implementation, provider behavior, storage, schema,
migration, deployment, readiness, or go-live.

## 2. Authority and constraints

Use these sources in order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md`;
3. `docs/decisions/product/DEC-RT-02-retail-account-required-checkout.md`;
4. `docs/decisions/product/DEC-AFTER-01-retail-revision-and-after-sales-policy.md`;
5. `docs/implementation/specs/candidates/2026-07-31-niuva-mvp-user-flow-and-route-contract.md`;
6. this prototype and review kit.

Non-negotiable boundaries:

- `/retail/cart` is non-authoritative and is revalidated before commitment;
- login is required before checkout;
- customer resources are ownership-scoped;
- file revision never silently overwrites prior versions;
- cancellation after irreversible work is reviewed, not automatically refunded;
- complaint evidence remains private;
- refund/free-reprint approval is distinct from Finance execution;
- usability success cannot replace backend authorization or a technical contract;
- no route is promoted automatically from session notes.

## 3. Participant profiles

### P-O01 — Niuva non-IT operator

Required:

- currently performs, or is expected to perform, content/catalog/order work;
- does not need programming knowledge;
- may hold multiple approved operational roles;
- has not memorized the prototype task sequence.

Avoid using the prototype designer/developer as the only operator participant.
If no alternative exists, record the familiarity bias.

### P-C01 — prospective Retail customer

Required:

- could plausibly purchase a Ready Product or Custom 3D Print;
- has ordinary experience with online checkout;
- is not required to understand slicer or FDM terminology;
- is not a Niuva developer or the moderator.

One customer provides directional evidence, not statistical confidence. Record
this limitation in the final recommendation.

## 4. Safety, privacy, and consent

Use participant IDs only: `P-O01` and `P-C01`. Do not store participant name,
email, phone, real address, credentials, customer files, or confidential Niuva
data in the repository.

Read this before starting:

> Kami sedang menguji prototipe, bukan kemampuan Anda. Prototipe tidak
> terhubung ke pembayaran atau data nyata. Silakan berpikir keras dan katakan
> apa yang Anda harapkan terjadi. Anda boleh berhenti kapan saja. Catatan akan
> memakai ID peserta, bukan nama. Apakah Anda bersedia melanjutkan dan, jika
> sesi direkam, apakah Anda menyetujui perekaman?

Record consent as `yes/no` without storing a signature. If recording consent is
`no`, take written observations only.

## 5. Moderator preparation

Before each session:

- [ ] Run `node server.js` from the prototype directory.
- [ ] Confirm `http://127.0.0.1:4177/?mode=moderator` loads.
- [ ] Use a clean browser profile or private window.
- [ ] Use only simulated names/files/addresses.
- [ ] Set customer session initially to 390 px or a real mobile viewport.
- [ ] Set operator session initially to desktop.
- [ ] Select the fixture in **Panel moderator**, then press
      **Buka Participant Mode** before handing control to the participant.
- [ ] Open `MODERATED_USABILITY_RESULTS.md` for notes.
- [ ] Confirm screen reader/zoom/browser aids normally used by the participant
      remain available.
- [ ] Do not explain the navigation or intended answer before the task.

The moderator may set the required state through the scenario dropdown before
handing control back. The participant should not use the scenario dropdown as a
navigation shortcut.

## 6. Moderation protocol

For every task:

1. read the task without naming the expected UI control or route;
2. ask the participant to think aloud;
3. do not correct terminology during the task;
4. wait up to 90 seconds before the first rescue;
5. if safety or a hard dead-end occurs, stop and record it;
6. after completion, ask the comprehension question;
7. record outcome, time, rescue count, confidence, quote/paraphrase, and issue.

Outcome values:

- `UA`: completed unaided;
- `A`: completed with one or more moderator assists;
- `F`: failed, abandoned, wrong irreversible expectation, or required rescue;
- `NA`: not run, with reason.

Do not convert `A`, `F`, or `NA` into a pass because the screen technically
works.

## 7. Customer session script

Recommended duration: 40–50 minutes.

### Customer opening and warm-up — 5 minutes

Ask:

- Kapan terakhir Anda membeli produk custom atau produk ready secara online?
- Apa yang biasanya Anda harapkan dari keranjang sebelum pembayaran?
- Jika barang custom bermasalah, di mana Anda biasanya mencari bantuan?

Do not explain Niuva's route model.

### C-01 — Ready Product to cart

Starting state: `/retail`.

Task:

> Anda ingin membeli satu Keychain Layer. Masukkan produk ke tempat yang menurut
> Anda tepat sebelum pembayaran, lalu jelaskan apa yang sudah dan belum
> “terkunci”.

Observe:

- product discovery;
- cart discovery without prompting;
- whether the participant thinks stock/price/order/payment is already final;
- whether `/retail/cart` feels like a durable task rather than a modal.

Comprehension question:

> Jika Anda menutup halaman sekarang, apa yang Anda harapkan ketika kembali?

### C-02 — Mixed cart and account boundary

Starting state: moderator selects **Mixed cart**.

Task:

> Anda memiliki produk ready dan custom print. Periksa apakah keduanya dapat
> diproses dengan waktu yang sama, lalu lanjutkan sejauh yang diperlukan menuju
> pembayaran.

Observe:

- recognition of separate ETA/fulfillment groups;
- login expectation;
- belief about Order creation before checkout;
- loss-of-context concern after login.

Comprehension question:

> Pada titik ini, apakah pesanan dan pembayaran sudah dibuat? Mengapa?

### C-03 — Checkout expiry recovery

Starting state: moderator selects **Reservasi habis**.

Task:

> Anda kembali ke checkout setelah beberapa waktu. Lanjutkan dengan cara yang
> menurut Anda aman.

Observe:

- recognition that reservation expired;
- availability refresh;
- no expectation of duplicate order/payment;
- understanding of a new 30-minute reservation.

### C-04 — File revision from a deep link

Starting state: moderator selects **Revisi file**, then ask the participant to
open `/orders/NV-DEMO-014/file-revision` as if it came from a notification.

Task:

> Niuva meminta file pengganti. Temukan tenggatnya, kirim versi baru, lalu
> jelaskan apa yang seharusnya terjadi pada file lama.

Observe:

- revision versus new order mental model;
- exact deadline comprehension;
- version history expectation;
- direct-link ownership expectation.

### C-05 — Cancellation request

Starting state: `/orders/NV-DEMO-014`, status Printing.

Task:

> Kebutuhan Anda berubah dan Anda ingin membatalkan. Cari jalur yang tepat dan
> jelaskan hasil apa yang Anda harapkan.

Observe:

- cancellation versus complaint choice;
- whether refund is incorrectly assumed automatic;
- recognition that printing has started;
- ability to reopen `/orders/NV-DEMO-014/cancellation`.

Comprehension question:

> Apakah tombol ini menjamin refund penuh? Informasi apa yang masih Anda tunggu?

### C-06 — Complaint intake and case status

Starting state: moderator selects **Produk diterima**.

Task:

> Produk sudah diterima tetapi rusak. Laporkan masalah dengan bukti yang wajar,
> lalu temukan tempat untuk memantau hasilnya.

Observe:

- complaint discovery;
- reasonable evidence expectation;
- transition from `/complaints/new` to `/complaints/:caseId`;
- ability to distinguish intake confirmation from remedy approval;
- privacy expectation.

Comprehension question:

> Apakah refund atau reprint sudah disetujui? Apa tindakan Anda berikutnya?

### C-07 — Direct-link and refresh recovery

Starting state: `/orders/NV-DEMO-014/complaints/CASE-DEMO-01`.

Task:

> Muat ulang halaman, kembali ke Order, lalu buka lagi status kasus tanpa
> membuat laporan baru.

Observe:

- distinction between “new complaint” and “case detail”;
- durable route expectation;
- back navigation;
- duplicate-submission risk.

### Customer closing questions

Rate 1–5:

- Saya tahu posisi saya sebelum pembayaran.
- Saya memahami perbedaan revisi file, pembatalan, dan komplain.
- Saya tahu di mana melihat status kasus.
- Bahasa yang digunakan terasa jelas.
- Saya percaya tindakan tidak akan membuat Order/refund ganda.

Ask:

- Hal apa yang paling membingungkan?
- Label apa yang ingin Anda ubah?
- Informasi apa yang hilang sebelum Anda berani melanjutkan?

## 8. Operator session script

Recommended duration: 45–60 minutes.

### Operator opening and warm-up — 5 minutes

Ask:

- Pekerjaan apa yang paling sering Anda lakukan untuk konten dan order?
- Informasi apa yang Anda butuhkan untuk menentukan next action?
- Apa yang biasanya terjadi jika email pelanggan gagal?

### O-01 — Prioritize work

Starting state: `/admin`.

Task:

> Tanpa membuka semua menu, tentukan pekerjaan pertama yang perlu ditangani dan
> jelaskan alasannya.

Observe:

- comprehension of ranked next actions;
- absence of dependence on KPI cards;
- ability to reach low-stock/catalog work.

### O-02 — Request to Assisted Offer

Starting state: `/admin/retail-requests/REQ-DEMO-01`.

Task:

> Tinjau file dengan aman, siapkan offer, dan lakukan langkah yang diperlukan
> sebelum offer boleh dikirim ke pelanggan.

Observe:

- customer `.gcode` not treated as executable input;
- draft versus manager approval;
- one account/multiple-role comprehension;
- customer-safe versus internal data boundary.

### O-03 — Production update with email failure

Starting state: `/admin/retail-orders/NV-DEMO-014`.

Task:

> Perbarui milestone pelanggan. Kemudian tangani kondisi ketika email gagal.

Observe:

- core milestone remains saved;
- email retry does not repeat the production update;
- customer-facing and internal notes remain distinct.

### O-04 — After-sales triage

Starting state: `/admin/retail-cases/CASE-DEMO-01`.

Task:

> Bukti pelanggan lengkap. Usulkan resolusi refund atau free reprint dan
> jelaskan siapa yang menyetujui serta siapa yang mengeksekusi pembayaran.

Observe:

- operator triage, manager approval, and Finance execution separation;
- no automatic remedy;
- exact affected scope expectation.

### O-05 — Cross-area context retention

Starting state: active Order detail.

Task:

> Periksa stok, kembali ke Order yang sedang Anda tangani, lalu buka kasus
> after-sales tanpa mencari ulang identitas pelanggan dari awal.

Observe:

- navigation comprehension;
- retained Order context;
- customer/order/case identity confusion;
- use of legacy `/admin/orders` by mistake.

### Operator closing questions

Rate 1–5:

- Saya tahu pekerjaan berikutnya tanpa pelatihan teknis.
- Saya dapat membedakan Request, Order, dan after-sales case.
- Saya dapat membedakan approval dengan eksekusi Finance.
- Saya yakin catatan internal tidak terlihat pelanggan.
- Saya dapat berpindah area tanpa kehilangan konteks.

Ask:

- Langkah mana yang paling berisiko salah?
- Istilah apa yang akan menyulitkan operator baru?
- Informasi apa yang harus muncul di dashboard/email?

## 9. Finding severity

| Severity | Definition |
| --- | --- |
| `S1 Critical` | Data/ownership exposure, wrong irreversible action, duplicate payment/refund expectation, or task cannot continue safely |
| `S2 Major` | Primary task fails unaided, route ownership is misunderstood, or wrong lifecycle is selected |
| `S3 Moderate` | Task completes with assist, notable hesitation, unclear label, or recoverable wrong turn |
| `S4 Minor` | Cosmetic/copy friction that does not change task outcome or safety |

Every finding must include participant, task, observed evidence, severity,
affected candidate route, and recommended change. Moderator opinion without an
observation is recorded as a hypothesis, not a finding.

## 10. Route decision gates

Allowed recommendation values:

- `PROMOTE_RECOMMENDATION`: usability evidence supports later canonical review;
- `REVISE_AND_RETEST`: correctable issue blocks promotion;
- `DO_NOT_PROMOTE`: route model conflicts with participant mental model or
  governing policy;
- `INSUFFICIENT_EVIDENCE`: missing participant/task/recording or unresolved
  contradiction.

### CAND-CART-01 gate

All must be true:

- [ ] `C-01` and `C-02` completed unaided by `P-C01`;
- [ ] participant understands cart is not a paid Order;
- [ ] participant expects price, stock, ETA, and delivery to be revalidated;
- [ ] login boundary does not appear to discard the draft;
- [ ] mixed-cart separation is understood;
- [ ] direct refresh/back behavior is understood;
- [ ] no open `S1`, `S2`, or unresolved `S3` finding;
- [ ] technical follow-up confirms safe non-sensitive draft ownership and
      server revalidation.

### CAND-AFTER-01 through CAND-AFTER-04 gate

All must be true:

- [ ] `C-04` through `C-07` completed unaided by `P-C01`;
- [ ] revision, cancellation, complaint intake, and case status are correctly
      distinguished;
- [ ] participant does not expect automatic refund/reprint;
- [ ] participant can reopen an existing case without submitting a duplicate;
- [ ] `O-04` and `O-05` completed unaided by `P-O01`;
- [ ] customer-safe and internal data remain conceptually separate;
- [ ] manager approval and Finance execution remain distinct;
- [ ] no open `S1`, `S2`, or unresolved `S3` finding;
- [ ] technical follow-up confirms ownership, deep-link allowlist, lifecycle
      state, conflict/retry, and customer projection.

Usability sessions validate whether a durable action/resource route is
understandable. They do not prove that the literal URL string is secure or that
the API/state model is complete.

## 11. Final handoff

After both sessions:

1. complete `MODERATED_USABILITY_RESULTS.md`;
2. attach sanitized screenshots only if consent allows;
3. assign severity and affected candidate route to every observation;
4. record one recommendation per candidate route;
5. retain disagreements and sample-size limitations;
6. request separate user approval before updating canonical documentation;
7. do not create an implementation backlog/API contract until route decisions
   are explicitly resolved.
