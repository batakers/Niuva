# Niuva Frontend Work Tracker

**Owner:** Dirga / Frontend
**Baseline audit:** `main@d4bf4ac`
**Last reviewed:** 6 Agustus 2026
**Mode saat ini:** FLOW-002 lokal selesai; handover siap diverifikasi Lead
**Commit/push/PR:** Tidak dilakukan oleh tracker ini

Dokumen ini adalah satu tempat untuk melacak pekerjaan frontend setelah audit
production-readiness. Status di sini tidak menggantikan approval Lead,
Decision Register, atau acceptance evidence.

## Aturan status

| Status | Arti |
| --- | --- |
| `analysis_done` | Evidence source/dokumen sudah diperiksa; belum ada perubahan |
| `waiting_lead` | Menunggu keputusan, scope, atau approval Lead |
| `approved_to_implement` | Scope dan acceptance criteria sudah disetujui |
| `in_progress` | Perubahan lokal sedang dikerjakan pada branch/worktree terisolasi |
| `ready_for_verification` | Implementasi lokal selesai; menunggu test/browser/Lead verification |
| `accepted` | Acceptance Lead sudah tercatat dengan evidence |
| `blocked` | Terhenti karena dependency atau keputusan eksternal |

## Baseline dan authority

- Master Spec: `docs/NIUVA_MASTER_SPEC.md`
- Document Register: `docs/context/DOCUMENT_REGISTER.md`
- Decision Register dan keputusan terkait UX/ops
- Route contract: `docs/decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md`
- Kandidat route: `docs/implementation/specs/candidates/2026-07-31-niuva-mvp-user-flow-and-route-contract.md` (Context Only)
- Design authority: `DESIGN.md`
- Design-system register/task card: `docs/implementation/plans/pending-reconciliation/2026-08-05-frontend-component-register.md` dan `2026-08-05-frontend-design-system-foundation-task-card.md`

Urutan kerja: **audit current main → diskusi/disposition Lead → kunci scope dan
acceptance criteria → approval eksplisit → implementasi → verifikasi → handover
→ commit/push/PR hanya jika diminta eksplisit**.

## Snapshot hasil audit

- Public canonical pages, Retail catalog/product discovery, auth/recovery, dan
  Admin route families sudah memiliki source route evidence.
- `/services` dan `/portfolio` masih merender komponen yang sama; kontrak
  dokumen mengharapkan compatibility redirect.
- B2B inquiry terkirim melalui `ContactPage.jsx`; FLOW-002 menambahkan inline
  reference/acknowledgement dari response API, menunggu verifikasi Lead.
- Retail registration, notification feed, cart/configure/request/offer/
  checkout, after-sales, serta Admin Retail request/case routes belum tersedia.
- Retail tetap discovery-only; checkout/payment/upload/reservation/fulfillment
  tidak aktif.
- Design-system gaps: body-font scope, typography scale, raw colors, surface/
  overlay variants, dan spacing scale.

Evidence utama: `frontend/src/App.js:139-190`,
`frontend/src/pages/marketing/ContactPage.jsx:151-152`,
`frontend/src/pages/retail/RetailProductPage.jsx:39-60`,
`frontend/src/index.css:7-105,176-180,505-511`,
`frontend/src/components/ui/{surface-panel,dialog,alert-dialog,drawer,button}.jsx`.

## Work items

| ID | Work item | Status | Dependencies / gate | Acceptance evidence |
| --- | --- | --- | --- | --- |
| AUD-001 | Simpan audit user-flow dan design-system current main | `analysis_done` | Tidak ada | Temuan dengan path/line; baseline `d4bf4ac` |
| FLOW-001 | Disposition alias `/services` dan `/portfolio` | `accepted` | Lead verification tercatat; exact frontend route scope | Route behavior sesuai DEC-UX-003; regression test |
| FLOW-002 | Inquiry reference/acknowledgement inline di `/contact` | `ready_for_verification` | Lead verification masih diperlukan; backend contract existing dipakai apa adanya | 201 + reference asli, 422/429/503, focus dan regression evidence |
| RETAIL-001 | Registration dan `/dashboard/notifications` | `waiting_lead` | Auth, abuse-control, notification contract | Route, unauthorized state, keyboard/browser evidence |
| RETAIL-002 | Retail configure → request/offer → checkout | `waiting_lead` | Provider-neutral API, payment/fulfillment decisions | End-to-end contract, no unsafe mutation, responsive/a11y evidence |
| RETAIL-003 | Order file revision, cancellation, complaints | `waiting_lead` | After-sales decision dan backend contracts | Owned-resource routes, error/empty states, regression coverage |
| ADMIN-001 | Admin Retail request/case queues and detail | `waiting_lead` | Role/permission and lifecycle contract | Permission boundaries, route tests, browser evidence |
| DS-001 | Reconcile body-font scope across Public/Retail/Auth/Customer/Admin | `waiting_lead` | Lead/design-system approval | Computed font evidence per surface; no route/content drift |
| DS-002 | Reconcile semantic typography, color, and spacing usage | `waiting_lead` | Token policy and exact scope | Static guardrails plus responsive/contrast evidence |
| DS-003 | Reconcile shared dialog/alert/drawer surface contracts | `waiting_lead` | Component-register decision; a11y review | Keyboard focus, Escape/restore, contrast, surface contract tests |
| VERIFY-001 | Browser revalidation after an approved slice | `waiting_lead` | Approved implementation and local environment | 320/768/1024/1440 px; keyboard; focus; contrast; console/errors |
| HANDOVER-001 | Lead handover and acceptance record | `waiting_lead` | Verification evidence complete | Lead disposition recorded; status becomes `accepted` only then |

## Recommended execution flow

### Gate 0 — Prepare evidence (read-only)

- Confirm checkout SHA, branch, clean tracked diff, and untouched user evidence.
- Re-read authority documents and record the exact file/line scope.
- Do not edit source, docs, dependencies, auth, backend, or config.

### Gate 1 — Lead disposition

- Send the relevant work-item IDs to Lead.
- Ask Lead to choose priority, approve/reject the behavior, and identify the
  exact files allowed to change.
- Keep each independent slice separate; do not combine Retail transaction work
  with design-system convergence without explicit approval.

### Gate 2 — Implement one vertical slice

- Create a dedicated branch only after explicit instruction.
- Keep the change small (prefer 1–5 files per slice).
- Add or update focused tests in the same slice.
- Preserve API, route, role, i18n, and test-id contracts.

### Gate 3 — Verify

- Run focused tests, full frontend tests as appropriate, lint/build, and
  `git diff --check`.
- Revalidate browser behavior at 320/768/1024/1440 px.
- Check keyboard order, focus containment/restore, Escape, inert background,
  touch targets, responsive layout, contrast, loading/error/empty/unauthorized
  states, and console/network errors.

### Gate 4 — Handover

- Report changed files, intentionally untouched files, commands/results,
  browser evidence, limitations, and remaining risks.
- Use **Ready for Lead Verification**, not **Complete**, until Lead accepts.
- Commit, push, and open a PR only when explicitly requested.

## Checkpoints

- [ ] After the next 2–3 approved work items: tests/build clean and scope still bounded.
- [ ] Before Lead verification: browser evidence and regression evidence attached.
- [ ] Before publication: Lead acceptance recorded and exact changed paths reviewed.

## Open decisions for Lead

- Which missing flow is first: registration/notifications, Retail transaction,
  after-sales, or Admin Retail operations?
- Should `/services` and `/portfolio` perform actual redirects now, or remain
  compatibility-rendered until a separate route implementation slice?
- FLOW-002: customer-visible inquiry reference/acknowledgement dipilih sebagai panel inline setelah `POST /api/inquiries` berhasil; Lead acceptance masih pending.
- Which design-system convergence slice is approved first, and what exact files
  are in scope?
- Which browser/accessibility evidence qualifies as acceptance for each slice?

## Handover template

> **Work item:** `[ID]`
> **Baseline:** `[SHA]`
> **Scope:** `[exact files/routes]`
> **Decision/approval:** `[Lead reference]`
> **Implemented:** `[short summary]`
> **Tests/checks:** `[commands + results]`
> **Browser evidence:** `[viewport/keyboard/contrast results]`
> **Limitations/risks:** `[items]`
> **Status:** `Ready for Lead Verification`

## Handover FLOW-002 — 6 Agustus 2026

> **Work item:** `FLOW-002`
> **Baseline:** `699102c` pada branch `fix/flow-001-public-aliases`
> **Scope:** `frontend/src/pages/marketing/ContactPage.jsx`, `frontend/src/pages/marketing/ContactPage.intake.test.jsx`, dan route public `/contact`; existing `POST /api/inquiries` dikonsumsi tanpa perubahan kontrak.
> **Decision/approval:** User menyetujui slice frontend-only: gunakan `response.data.id` sebagai nomor referensi, tampilkan acknowledgement inline, dan pulihkan focus ke form. Lead acceptance belum tercatat.
> **Implemented:** Panel acknowledgement `role="status"` + `aria-live="polite"`, reference UUID dari response API, aksi “Kirim brief lain”, serta focus management success/restore.
> **Tests/checks:** `npm test -- --watchAll=false --runInBand` — 63 suites / 381 tests passed; `git diff --check` passed (warning hanya normalisasi LF/CRLF). `npm run build` berhasil compile CRACO tetapi command keseluruhan berhenti di postbuild karena `REACT_APP_PUBLIC_SITE_URL` lokal belum confirmed public production origin; config/env tidak diubah.
> **Browser evidence:** `http://localhost:3000/contact` dengan backend nyata `http://127.0.0.1:8001`; `POST /api/inquiries` = `201`, reference asli `e8d1034c-2793-43b8-883b-e02818a5a58a`, panel status fokus otomatis; “Kirim brief lain” memulihkan focus ke `#contact-name`; invalid email menghasilkan `422`; rate-limit sequence menghasilkan empat `201` lalu `429`, dan submit browser berikutnya menampilkan pesan rate-limit; `GET /api/health/ready` menghasilkan `503` nyata.
> **Runtime:** Docker Desktop running, MongoDB replica set `rs0` writable, backend berjalan tanpa `--reload` di port `8001`; frontend existing berjalan di port `3000`.
> **Limitations/risks:** Readiness `503` karena migration 007–009 belum applied; migration sengaja tidak dijalankan karena di luar scope dan memerlukan backup/approval. Console browser memuat `401` anonymous auth probes dan satu `422` yang memang disengaja untuk test; tidak ada React runtime warning/error baru pada success path. Smoke membuat lima inquiry sintetis di database lokal; tidak ada target production.
> **Status:** `Ready for Lead Verification`

## Verification refresh FLOW-001 - 10 Agustus 2026

> **Observed at:** `2026-08-10T14:59:45+07:00` (Asia/Jakarta; browser evidence)
> **Work item:** `FLOW-001`
> **Baseline:** `a61cc2be6a10a4dd5e04d4343cf9d293404a8f30` / tree `b3b509e988af151320d9d1e98ce332a724cd1eb1`
> **Scope:** Existing route registrations and `PublicAliasRedirect` contract in `frontend/src/App.js`, plus `frontend/src/App.route.contract.test.js`; no frontend source, backend, migration, dependency, or config change was made.
> **Decision/approval:** `DEC-UX-003` remains the route authority: `/services` redirects to `/capabilities`, and `/portfolio` redirects to `/projects`. Lead acceptance is recorded from the user's explicit statement on 10 Agustus 2026 (Asia/Jakarta); the acceptance is limited to the frontend route-alias scope.
> **Tests/checks:** `npm test -- --watchAll=false --runInBand src/App.route.contract.test.js` - **1 suite / 3 tests passed**. `git diff --check -- .` produced no whitespace errors; only the existing LF/CRLF normalization warnings.
> **Browser evidence:** Isolated system Chrome/Playwright loaded all four alias/viewport combinations with navigation HTTP `200`. Final URLs preserved the exact query/hash: `/services?utm_source=legacy#capability` -> `/capabilities?utm_source=legacy#capability`; `/portfolio?utm_source=legacy#project` -> `/projects?utm_source=legacy#project`.
> **Responsive/accessibility:** Viewports `390x844` and `1440x900` passed route assertions in **4/4** runs; horizontal overflow was `0 px`; axe reported **0 violations / 0 incomplete** in each run; page errors were `0`.
> **Runtime/network limitations:** Backend was not started for this frontend-only route check. Each isolated page recorded expected connection failures for local `/api/auth/me`, `/api/settings`, and the relevant `/api/content` or `/api/portfolio` probes; these are environment diagnostics, not redirect failures. Chrome DevTools MCP was unavailable, so the fallback isolated Playwright + system Chrome harness was used.
> **Evidence:** `frontend/.flow001-browser-evidence-20260810/flow-001-browser-result.json` and `services-mobile.png`, `services-desktop.png`, `portfolio-mobile.png`, `portfolio-desktop.png`.
> **Lead verification:** User stated: "Saya menerima FLOW-001 sebagai Lead. Redirect dan query/hash preservation sesuai DEC-UX-003. Acceptance terbatas pada frontend route alias; tidak mencakup backend, migration, deployment, atau go-live." on 10 Agustus 2026 (Asia/Jakarta). No commit, push, PR, deployment, migration, or go-live action was performed.
> **Status:** `accepted`
