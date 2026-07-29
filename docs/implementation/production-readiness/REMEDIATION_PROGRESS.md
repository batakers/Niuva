# Niuva Production-Readiness Remediation Progress

Status: Planning and Assignment Context — Not Implementation Authority

Last updated: 2026-07-30 (Asia/Jakarta)
Planning baseline: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
Selected release-candidate baseline: `d04e3f009d6c815c0a4d99dfa5c93553da3cef43` (Faiz / `DR-001`, 2026-07-29; local `origin/main` matched at selection, remote freshness unverified)

## Progress rules

This is a roadmap tracker, not evidence that a remediation phase has started.
Only one phase may be `in_progress` after its exact scope, authority,
dependencies, rollback impact, and verification plan are approved. A status of
`planning` permits documentation work only.

Faiz selected the release-candidate SHA under `DR-001`. It is 59 commits and
240 committed paths beyond the audit baseline, so affected auth, migration,
frontend, CI, runbook, register, and other finding groups require
revalidation before implementation planning. The selection does not establish
remote freshness, production readiness, or go-live approval.

| Phase | Scope | Findings | Status | Authorization | Plan Document | Implementation Branch | Baseline SHA | Verification | Last Updated | Next Step |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 - Safety, Baseline, and Evidence Preservation | RC baseline, NIV-001, migration stop conditions, provenance | Freshness; NIV-001; migration/live-schema; governance/provenance | `planning` — PHASE-00A review passed; PHASE-00B closed administratively as a time-bound accepted risk through 30 August 2026; PHASE-00C static preflight revalidated; PHASE-00D independent AI evidence review passed; remaining Phase 0 scope is gated | Planning/evidence only; broader Phase 0 remains `blocked_by_decision` | [REMEDIATION_ROADMAP.md](REMEDIATION_ROADMAP.md) | Not selected | `d04e3f009d6c815c0a4d99dfa5c93553da3cef43` | Git ancestry and 240-path changed-scope map recorded; selected-SHA authority/provenance review and migration static preflight passed without finding closure. PHASE-00B has no verified incident closure and does not authorize release/go-live. | 2026-07-29 | Before 30 August 2026, obtain NIV-001 verification, renewed accepted risk, or a new Final Approver disposition; complete remaining DR-012 target/topology/RPO-RTO/evidence fields before PHASE-00C execution. Keep GOV-011 and OPS-012 open for their assigned later gates. |
| 1 - Identity, Authentication, Authorization, and Privacy | Auth, role, privacy, file/order boundaries, transaction/payment guard | Session/MFA; recovery; password policy/hash migration; abuse; file/order; transaction; quote; payment; Admin parity | `requires_revalidation` — earlier bounded features retain their recorded state. PHASE-01C source candidates are open in PR #95 (shared transaction executor) and PR #96 (exact Quote-line identity); neither is merged evidence yet. | Existing bounded implementation authority only; broader Phase 1 remains `blocked_by_decision` | [Phase evidence index](phases/README.md); [3.1–3.2 register below](#transaction-and-commercial-integrity-feature-register--30-july-2026) | PRs #95–#96 for PHASE-01C; earlier PRs remain recorded in the feature index | `7d8d5c90f6440f1276ee4b82c166258514a93cd1` | Both candidates use the same baseline. PR #95 CI is green but actionable review findings remain. PR #96 CI is green; its substantive automated review was rate-limited. Local PR #96 evidence includes 630 backend tests and 68 real replica-set tests. | 2026-07-30 | Resolve and reverify PR #95 review findings. Obtain review for PR #96, then merge each independently. Preserve payment, migration, historical-data, deployment, and production gates. |
| 2 - Database, Transaction, and Migration Integrity | Schema, references, migration, backup, restore, data topology | Notification; quote/reference; migration/live-schema; transaction/idempotency | `planning` — the Quote-line aggregate-only report is implemented in PR #96; representative historical-data execution, migration, backup/restore, and notification work remain gated | Report source is authorized by `DEC-DATA-002`; data execution and migration remain `blocked_by_decision` | [Quote-line reconciliation runbook](../../runbooks/QUOTE_LINE_RECONCILIATION_RUNBOOK.md) | PR #96 contains the bounded report; no migration branch selected | `7d8d5c90f6440f1276ee4b82c166258514a93cd1` | Report unit tests and static gates pass. No shared, staging, or production data was accessed; no mapping, backfill, or migration ran. | 2026-07-30 | Review/merge PR #96. Execute the report later only against an explicitly approved isolated representative dataset; keep mutation/backfill separately authorized. |
| 3 - Backend Business Logic and API Contracts | HTTP envelope, lifecycle, readiness, notification, compatibility/CMS | API transport; notification; CMS/Portfolio; governance/compatibility | `requires_revalidation` — PHASE-03A plan plus bounded shared-transport and B2B HTTP-contract slices merged in PRs #75–#76; the bounded FE-006 Customer Order recovery slice merged in PR #89; broader FE-001/005 and INT-011 scope remains open | Existing merged slices retain their bounded evidence; broader implementation remains separately authorized | [PHASE-03A HTTP/command plan](phases/PHASE-03A-http-command-contract-plan.md) | Merged `remediate/phase-03a-shared-transport`, `remediate/phase-03a-backend-contract`, and `fix/frontend-customer-order-error-retry`; no new branch selected | `e6d7e451208c5ef45e0f723c5fdb4645802a27fb` current merged-evidence snapshot; selected RC remains `d04e3f0` | Axios 15-second timeout and one response-less safe-read retry are covered; representative B2B 403/409/422/replay contracts are covered. PR #89 adds customer-safe visible order-load failure, explicit retry, and StrictMode read deduplication. Raw fetch/download cancellation and timeout, runtime schemas, broader pagination, selected-RC, release, and production evidence remain absent. | 2026-07-29 | Reconcile PRs #75–#76/#89 into the selected-SHA finding record, then authorize only the next exact frontend gap; do not treat the bounded slices as full PHASE-03A closure. |
| 4 - Frontend Engineering and Integration Parity | Auth/client, approved Retail/customer/B2B/CMS journeys | Auth/client; password-policy consumer; Retail/customer; B2B portal; Admin parity; CMS | `partial` / `requires_revalidation` — current snapshot has auth/recovery, shared password-policy consumers, read-only Retail discovery, customer login, Customer Order failure recovery, Admin B2B/CMS, and shared transport candidates; material gaps are listed below | `ADR-005` authorizes read-only Retail discovery only; Feature 1.4 and PR #89 are bounded evidence; remaining journey/source work is separately bounded and DR-009/DR-010 remain open | This tracker plus [REMEDIATION_ROADMAP.md](REMEDIATION_ROADMAP.md) | FE-006 merged through PR #89; no next branch selected | `e6d7e451208c5ef45e0f723c5fdb4645802a27fb` fetched current-source reconciliation snapshot; selected RC remains `d04e3f0` | FE-006 focused coverage passed 2/2 suites and 11/11 tests with its shared operational-state suite; local mobile/desktop browser QA passed 2/2 with no axe violations in the error state; production build succeeded. Full frontend suite passed 35/36 suites and 238/239 tests; the pre-existing CMS lifecycle contract failure remains. This is not controlled release or production evidence. | 2026-07-29 | Select the bounded FE-004 Admin route fail-closed task next; preserve decision-blocked Retail transaction/B2B portal scope and do not reopen the Feature 1.4 or FE-006 boundaries without a separate task. |
| 5 - UI, UX, Responsive, and Accessibility | Objective accessibility and factual state; deferred visual topics excluded | Objective UX/accessibility; surface direction/typography | `open` / `requires_revalidation` — auth/password-policy and Retail source changed after the audit, but objective focus, target-size, semantic-state, factual-copy, and current contrast gaps remain | `approved_for_planning`; each source slice still needs bounded implementation authority and deferred visual work remains decision-only | This tracker plus [REMEDIATION_ROADMAP.md](REMEDIATION_ROADMAP.md) | Not selected | `af625942cb64e3a4395f44bd57b74e5bacd7f7b1` fetched current-source reconciliation snapshot | Static current-source recheck completed; no current cross-browser, screen-reader, or full axe matrix. Password-policy consumer tests pass, while Navbar focus containment and UserSelector semantics remain absent. | 2026-07-29 | Prefer objective PHASE-05A/05B work after exact path locks; PHASE-05C still needs content-owner copy; PHASE-05D remains a decision package, not redesign authority. |
| 6 - Testing and Release-Quality Gates | CI, E2E, artifact, static/security, coverage, parity | QA/release gates; package/runtime; dependency risk | `environment_blocked` plus current local failure | `blocked_by_environment` and `blocked_by_decision` for toolchain/threshold policy | [VERIFICATION_MATRIX.md](VERIFICATION_MATRIX.md) | Not selected | `e6d7e451208c5ef45e0f723c5fdb4645802a27fb` fetched current-source reconciliation snapshot | Current full frontend test passed 35/36 suites and 238/239 tests with one CMS static-contract failure. The production bundle compiled; postbuild skipped sitemap generation because `REACT_APP_PUBLIC_SITE_URL` is not configured. Prior local `tsc` stops in `@types/node/ffi.d.ts`; controlled browser/API/role, complete release artifact, and direct-route evidence remain absent. | 2026-07-29 | Investigate the CMS contract failure without widening behavior, choose a compatible type-check/toolchain contract under DR-013, and provision the approved release/browser environment before any gate claim. |
| 7 - Deployment and Operational Readiness | Artifact, topology, env, backup/restore, rollback, release ownership | Release/deployment; migration/live-schema; provider boundary; observability | `decision_blocked` | `blocked_by_decision` | Roadmap only | Not selected | `c28684d` | No staging-like deployment or restore/rollback drill | 2026-07-28 | Assign topology, operations, RPO/RTO, provider, release, and rollback decisions. |
| 8 - Reliability, Performance, and Observability | Readiness, telemetry, workers, timeout, capacity, performance | Observability/background; release/readiness; maintainability/performance | `decision_blocked` | `blocked_by_decision` | Roadmap only | Not selected | `c28684d` | Static/local evidence only; no owned telemetry or load environment | 2026-07-28 | Select telemetry/SLO/on-call/worker and capacity ownership before test planning. |
| 9 - Governance, Documentation, and Final Reconciliation | Registers, runbooks, ownership, dependency policy, final status | Governance/provenance; dependency risk; maintainability | `planning` | `approved_for_planning` | This roadmap and traceability set | Not selected | `c28684d` | Documentation reconciliation is planned, not executed | 2026-07-28 | Reconcile only after the RC baseline and decision record are fixed. |
| 10 - Production-Candidate Verification | Full regression, drills, production-like proof, final readiness calculation | All applicable unresolved/accepted risks | `environment_blocked` | `blocked_by_environment` | [VERIFICATION_MATRIX.md](VERIFICATION_MATRIX.md) | Not selected | Not selected | No production-like candidate/environment exists | 2026-07-28 | Complete Phases 0-9, then approve a production-candidate verification window. |

## Team-assignment coordination

The detailed owner, reviewer, verifier, branch, worktree, source-boundary,
parallel-safety, and merge-order register is
[TEAM_ASSIGNMENT.md](TEAM_ASSIGNMENT.md). Its `PHASE-00A`–`PHASE-10E` IDs map
one-to-one to the roadmap group/subphase scope above; none of the proposed
branches or worktrees has been created.

| Assignment set | Current coordination status | Exact next stopping point |
| --- | --- | --- |
| `PHASE-00A`–`PHASE-00D` | `PHASE-00A` review passed; Final Approver closed `PHASE-00B` administratively as a time-bound accepted risk through 30 August 2026; `PHASE-00C` static preflight revalidation passed without starting a service or touching data, but remains `pending_decision`; `PHASE-00D` passed an independent AI evidence review on the selected SHA, without human-review substitution or finding closure. PHASE-00B remains unverified for incident, release, and go-live purposes. | Before the accepted-risk expiry, obtain NIV-001 verification, renewal, or new disposition; complete DR-012 target/topology/RPO-RTO/evidence fields. Any later named human verifier records a separate incident-closure disposition; it is not implied by the AI review or accepted-risk decision. |
| `PHASE-01A`–`PHASE-05D` | Earlier feature evidence retains its recorded state. PHASE-01C now has two independent open candidates: PR #95 for Feature 3.1 and PR #96 for Feature 3.2. Both have green CI, but #95 retains actionable review findings and #96 did not receive substantive CodeRabbit review because of rate limiting. Neither open PR is merged evidence. | Resolve #95 review findings; obtain review for #96; merge independently after acceptance. Preserve all password, MFA, payment, migration, historical-data, portal, deployment, and production gates. |
| `PHASE-06A`–`PHASE-08D` | `blocked_by_decision` and/or `blocked_by_environment`; no CI, topology, provider, migration, or telemetry work is implied. | Assign the policy/environment/operations owners in DR-011 through DR-014. |
| `PHASE-09A`–`PHASE-10E` | `planning` only for reference reconciliation; final verification remains blocked by all preceding exits. | Reconcile only current evidence on the selected SHA; do not claim a candidate or go-live pass. |

## Transaction and commercial integrity feature register — 30 July 2026

This register records the two bounded features requested under PHASE-01C. An
open PR with green CI is a review candidate, not merged evidence or production
acceptance.

| Feature | Branch / PR / head | Completed source scope | Verification | Important notes and exact next step | State |
| --- | --- | --- | --- | --- | --- |
| 3.1 Shared transaction executor | `audit/backend-transaction-boundary`; PR #95; `21cc57b` | Fail-closed shared guard adoption, retries and unknown-commit handling inherited from the central executor, transaction events, removal of non-atomic fallback, and real replica-set commercial coverage. | Backend, frontend, secret-scan, transaction-tests, and CodeRabbit status checks are green. | CodeRabbit identified one runbook command gap plus catalog concurrency/slug-race findings. Verify and resolve every still-valid finding, rerun local and CI evidence, then merge. Do not mark BA-009/current PHASE-01C complete while these review items remain. | `review_changes_required`; open and mergeable, not merged. |
| 3.2 Quote-line identity | `fix/backend-quote-line-identity`; PR #96; `3eccbd6` | Server-owned immutable `quote_line_id`; exact accepted Quote version and Work Order line; cumulative quantity cap per exact line; fail-closed historical ambiguity; no variant fallback or automatic backfill; bounded aggregate-only report and runbook. | Focused 40 passed; full backend 630 passed, 12 skipped, 14 subtests; focused real replica-set 9 passed; full real replica-set 68 passed; backend/frontend/secret-scan/transaction-tests CI green. | Source scope is complete as a review candidate. CodeRabbit was rate-limited and did not perform substantive review, so obtain independent or later automated review before merge. Historical dataset execution is a separate isolated-data operation requiring reviewed mapping, backup, dry run, validation, rollback/restore, and transaction capability. | `source_complete_review_pending`; open and mergeable, not merged. |

Feature 3.2 does not need another source-remediation cycle unless review finds a
specific defect. Its historical-data gate belongs to later PHASE-02/PHASE-07/
PHASE-10 execution and must not be represented as unfinished automatic
backfill work.

## Frontend work register — current-source reconciliation

This register inventories frontend work that is still open, only partially
evidenced, decision-blocked, or environment-blocked. It uses the existing
roadmap task IDs rather than creating a second backlog namespace. Immediately
after `git fetch origin main` on 2026-07-29 at 20:03 Asia/Jakarta, the exact
`refs/remotes/origin/main` snapshot was
`e6d7e451208c5ef45e0f723c5fdb4645802a27fb`, including PRs #88–#89. This
records that fetch only; it does not retroactively establish remote freshness
for the selected release candidate `d04e3f0`, guarantee future remote
freshness, or replace selected-SHA or production-like revalidation.

`Partial` means current source or focused tests contain a candidate correction;
it is not finding closure. `Merged evidence` means the bounded source slice is
an ancestor of the recorded current-main snapshot; it does not establish
selected-RC or future remote freshness, release, production-readiness, or
go-live. `Open` means the gap is still directly observable in current source or
tests. `Blocked` means the next result depends on a named owner decision or
controlled environment; it is not a pass.

| Order | Existing phase / task IDs | Finding or gap | Current evidence | Exact remaining task and acceptance boundary | State / gate |
| ---: | --- | --- | --- | --- | --- |
| 1 | `PHASE-04A`; `TASK-04A-01/02` | `FE-006` Customer Order failure recovery | PR #89 (`97589b7`, merged as `e6d7e45`) replaces the silent catch with a customer-safe visible error, explicit retry, and StrictMode read deduplication. Focused coverage passed 2/2 suites and 11/11 tests; local mobile/desktop browser checks passed 2/2 with zero axe violations in the error state; production build succeeded. | No additional FE-006 source change is implied. Preserve the endpoint, projection, session, Order Detail, and legacy read-only lifecycle; revalidate this bounded slice only when a new selected RC or controlled release environment exists. | `merged evidence`; bounded implementation complete on current `main`, while selected-RC/release gates remain `requires_revalidation`. |
| 2 | `PHASE-04A`; `TASK-04A-01/02` | `FE-004` Admin route fail-closed mapping | `/admin/notifications` is routed through `protectedPage`, but it has no entry in `ADMIN_ROUTE_PERMISSIONS`; its current contract test explicitly expects `undefined`. The feed is an internal self-feed, not the `notifications.write` composer, while `admin.access` is already the shared internal-session boundary. | Map `/admin/notifications` to `admin.access`; update the feed contract; add a customer/no-`admin.access` runtime denial test and an invariant test that every `protectedPage(...)` Admin path resolves to a defined permission. Preserve backend authorization as the security boundary; do not change notification endpoints, role policy, `App.js` routing, or the composer. | `open`; role matrix and internal `admin.access` boundary are present, but this exact frontend source task remains separately authorized. |
| 3 | `PHASE-04C`; `TASK-04C-01/02`; `PHASE-06D` | Current CMS lifecycle contract regression, not represented by an audit finding | On current `main` at `e6d7e45`, the full frontend suite passed 35/36 suites and 238/239 tests. `cms-lifecycle.contract.test.js` still expects an outdated indentation-sensitive source substring around `contentApi.rollback`, while current source passes `blockId`, `versionId`, operator reason, and version. This current-source result supersedes the Feature 1.4 packet's branch-local all-green full-suite claim for current-main reporting only. | Determine whether the static contract or call signature is stale, preserve operator-supplied rollback reason and optimistic version semantics, then rerun focused and full frontend tests. Do not change runtime behavior merely to satisfy formatting-sensitive text matching. | `open — current test failure`; bounded investigation required before any green-suite claim. |
| 4 | `PHASE-03A`; `TASK-03A-01/02`; `PHASE-04A` | Residual `FE-001`, `FE-005`, `INT-011` transport/schema/envelope work | PRs #75–#76 provide Axios timeout, one safe-read network retry, cancellation non-retry, and representative B2B error contracts. Raw `fetchFile`/download paths still have no common timeout/abort policy; no `zod`/`safeParse` use exists; broader list envelope/pagination remains incomplete. | Freeze the next critical response schema and invalid-data state, plus a bounded raw-download timeout/cancellation contract. Do not retry commands or change refresh/CSRF/download semantics implicitly. | `partial` / `requires_revalidation`; critical-schema and pagination scope need owner approval. |
| 5 | `PHASE-04A`; `TASK-04A-01/02`; Feature 1.4 | `FE-002`, `FE-003`, `INT-004` auth/recovery/password-policy client parity | Current routes capture and remove reset tokens, expose validate/success/error states, and use the current cookie/CSRF Admin transport. PR #84 adds the shared backend-derived password-policy adapter to Admin customer creation and staff invitation; its four focused frontend suites passed 11/11 tests on `af62594`. | Execute controlled customer/Admin negative browser journeys, direct navigation, logout/revocation, expiry, refresh, password-manager/autofill/Unicode boundary behavior, and the recorded cross-tab/production-origin checks on the exact selected SHA. Preserve backend password authority and the unresolved canonical password-rule clarification. | `partial` / `requires_revalidation`; focused Feature 1.4 source evidence exists, but controlled browser/environment, PP-003–PP-006, and remaining auth decisions are missing. |
| 6 | `PHASE-04B`; `TASK-04B-01/02` | `UX-001`, `INT-001`, `INT-014` read-only Retail/customer entry | `ADR-005` authorizes read-only discovery. Current source has customer login, `/retail`, product detail, a secondary Homepage/navigation entry, and an inactive legacy order-creation destination. The Homepage process labels still do not show the approved semantic U-curve as two explicit placements. | Revalidate the bounded discovery slice with configured API/error/empty/detail/direct-route/mobile evidence and reconcile the remaining U-curve portion of `UX-001` under explicit Homepage authority. | `partial`; read-only discovery is decided, current E2E is environment-blocked, and broader DR-009 scope remains open. |
| 7 | `PHASE-04B`; `TASK-04B-01/02` | `INT-002`, `INT-003`, `INT-010` remaining Retail lifecycle | Current `/order` explicitly keeps legacy creation inactive. Configure, production upload, safe price/ETA commitment, cart, checkout, payment, fulfilment, and tracking are not implemented as an approved transactional slice. | Product/UX owners select one next bounded slice, field/state contract, and retained inactive capabilities. Do not infer upload, payment, shipping, tax, reservation, refund, return, Finance, or provider behavior. | `blocked_by_decision` under remaining DR-009/DR-011 and provider boundaries. |
| 8 | `PHASE-04C`; `TASK-04C-01/02` | `INT-007` B2B Organization Portal | Admin Inquiry/Quote/Project workbenches exist, but no authenticated customer organization portal routes or UI exist. The current portal packet is Context Only and requires DR-010 owner choices. | Decide first portal slice, membership/assignment policy, customer route and field matrix, historical-data boundary, then create a separate task card before source work. | `blocked_by_decision` under DR-010. |
| 9 | `PHASE-03B`; `PHASE-04C` | `INT-008` notification recipient/customer consumer | `DEC-DATA-003` records the provider-neutral notification model, but `UserSelector` still loads the internal `/admin/users` projection and no customer notification consumer is present. | Approve recipient projection and customer-feed scope; implement role-negative selector/feed tests only after backend projection and permission contracts freeze. | `blocked_by_decision` / `pending_dependency`; no provider or scheduler activation implied. |
| 10 | `PHASE-05A`; `TASK-05A-01/02` | `UX-002` contrast | The audit recorded 27 serious contrast instances; current source changed after that audit, but no current four-viewport axe/contrast matrix exists. | Re-measure first, then correct only confirmed token/component combinations and rerun axe plus manual focus checks. | `open` / `requires_revalidation`; current browser matrix is missing. |
| 11 | `PHASE-05A`; `TASK-05A-01/02` | `UX-003` mobile navigation containment | Navbar moves initial focus and handles Escape, but still has no focus trap, inert background, `aria-modal`, or equivalent containment. | Keep Tab/Shift+Tab inside the open panel, return focus on close, make background unavailable, and add keyboard regression coverage without choosing a new Retail/B2B navigation design. | `open`; bounded interaction implementation authority required. |
| 12 | `PHASE-05A`; `TASK-05A-01/02` | `UX-004` touch targets | Shared defaults and current consumers still include 40px/36px/32px controls; `UserSelector` trigger is `h-10`. | Lock a surface-specific control list, bring primary/frequent mobile actions to the 44px baseline or documented equivalent hit area, and verify destructive-action safety. | `open`; component-owner scope and current viewport evidence required. |
| 13 | `PHASE-05B`; `TASK-05B-01/02` | `UX-005` UserSelector semantics | The trigger has `role="combobox"`, but the popup/options have no listbox/option relationship, active descendant, or Arrow/Home/End/Enter state machine. | Implement or adopt the existing approved accessible primitive, with deterministic keyboard selection, announcement, focus restoration, and role-scoped fixtures. | `open`; bounded source authorization and seeded Admin identities required. |
| 14 | `PHASE-05B`; `TASK-05B-01/02` | `UX-007`, `UX-008` async/motion/form semantics | Reset inputs now expose rule/mismatch associations in current source, but `ProtectedRoute` still renders an unnamed spinner and multiple skeleton/pulse branches lack a consistent reduced-motion/live-region contract. | Revalidate `UX-008` with focused assistive-technology assertions; standardize named status, retry target, and motion-reduce behavior for `UX-007`. | `partial`; current browser/AT evidence remains blocked. |
| 15 | `PHASE-05C`; `TASK-05C-01/02` | `UX-010` plus same-page factual reconciliation | Privacy copy still names Internship collection/use/access after `DEC-OPS-002` removed that active workflow. The page also names current email-provider behavior that must be reconciled with the provider-neutral decision boundary before copy is changed. | Content/privacy owner supplies factual replacement copy; add a focused regression that every named collection purpose maps to an active, documented journey and does not overstate provider/production status. | `blocked_by_decision`; factual correction only, no privacy-policy invention. |
| 16 | `PHASE-05D`; `TASK-05D-01/02` | `UX-006`, `UX-009`, `UX-011` visual-surface disposition | `AuthShell` still uses labels such as `RETURN_TO_SITE` and `ACCESS_SCOPE`; customer pages retain terminal-like decoration. Broader typography/composition findings remain partly subjective or deferment-sensitive. | Owner decides separately whether to defer or authorize each bounded topic. Do not turn this row into an unsanctioned cross-surface redesign. | `blocked_by_decision`. |
| 17 | `PHASE-06D`; `TASK-06D-01/02`; `PHASE-08D` | `FE-007`, `FE-008`, `FE-009` maintainability/performance debt | Five declared runtime packages remain without source imports; direct API/fetch orchestration now appears in 31 files; large modules include `i18n.js` (1382 lines) and several 800+ line Admin pages; no bundle budget is encoded. | Approve a cleanup/refactor boundary, dependency disposition, module/query targets, and bundle/performance thresholds before deletion or broad refactor. Preserve feature behavior with focused coverage. | `open`, but policy/threshold and deletion authority are `blocked_by_decision` under DR-013/DR-014. |
| 18 | `PHASE-06A`; `PHASE-06D` | Untracked executable type-check/toolchain gap | `npm.cmd --prefix frontend exec -- tsc --project frontend/jsconfig.json --noEmit` stops in `frontend/node_modules/@types/node/ffi.d.ts` parse errors. The `jsconfig.json` deprecation compatibility change is present, but it does not create a working type-check gate. | Select a compatible compiler/declaration/runtime set and add a reproducible type-check command only after DR-013. Do not misclassify dependency/compiler incompatibility as a `jsconfig` alias failure. | `open` / `blocked_by_decision` under DR-013; dependency changes are not authorized here. |
| 19 | `PHASE-06C`; `TASK-06C-01/02` | `FE-ENV-001` release/browser proof | `npm.cmd --prefix frontend run build` compiled successfully; postbuild exited successfully but skipped sitemap generation because `REACT_APP_PUBLIC_SITE_URL` is not configured. No current complete sitemap/direct-route/browser-role proof was produced. | Use an approved non-secret public origin and controlled API/role/browser topology; record artifact attribution, direct refresh, supported browsers, responsive, and accessibility results. | `blocked_by_environment`; no deployment or go-live implied. |

The next bounded frontend implementation candidate is row 2 (`FE-004`), then
row 3 for the current CMS contract-test regression. Rows 10–14 remain objective
accessibility candidates after exact path locks. Rows 7–9 and 15–19 must retain
their named decision or environment gates. This ordering is prioritization
evidence only, not source authorization.

## PHASE-01A bounded auth/session revalidation

**Scope and authority:** Faiz approved `DR-003` bounded revalidation on the
selected SHA on 2026-07-29. Scope is password recovery and Admin session only,
under `DEC-AUTH-003` through `DEC-AUTH-005`, `ADR-001`, and the two applicable
auth runbooks. It excludes customer session, real email, shared/staging/
production data, `AUTH_ARGON2_WRITES_ENABLED`, repository migration apply,
deployment, activation, and go-live.

**Controlled environment:** the local disposable MongoDB 7.0 `rs-test` service
at loopback port 27018 was healthy before this work. Transaction integration
tests use unique databases and clean them up; recovery delivery is captured
in-memory. No repository migration was executed and no external mail or
provider was used.

| Evidence family | Command / result | What it supports | Boundary that remains |
| --- | --- | --- | --- |
| Recovery and Admin-session domain plus real replica-set integration | `python -m pytest -n 0 -q backend\\tests\\test_auth_recovery.py backend\\tests\\test_auth_recovery_transaction_integration.py backend\\tests\\test_auth_session.py backend\\tests\\test_auth_session_transaction_integration.py` with explicit local `rs-test` opt-in: `40 passed in 2.66s`. | Recovery replay/concurrency and transaction-unavailable paths; Admin-session rotation, replay-family revocation, expiry, CSRF, and transactional behavior. | Local disposable evidence only; it is not a migration, shared-environment, or production claim. |
| Admin HTTP contract | `python -m pytest -n 0 -q backend\\tests\\test_auth_security.py`: `5 passed in 15.43s`. | Cookie attributes, no-store responses, origin/CSRF defenses, refresh rotation, and logout revocation through the HTTP layer. | The test transport is not a deployed same-origin HTTPS browser. |
| Frontend AuthContext state | `$env:CI='true'; npm test -- --watchAll=false --runInBand AuthContext.test.jsx` from `frontend/`: `8 passed`. | Cookie-session bootstrap, StrictMode-safe Admin bootstrap refresh, no browser token write, server logout invocation, and in-memory session clearing on terminal 401. | This is not a live browser, real Admin account, or deployed-origin verification. |

**Result and stop point:** the bounded local evidence and the disposable
same-origin HTTPS browser-refresh retest passed, but PHASE-01A is not a Phase 1
exit or production-readiness pass. Independent human review remains unavailable
under the team workflow. DR-004 and DR-005, customer-session scope, rollout,
and all broader identity/privacy findings remain outside this result.

**AI re-review (2026-07-29):** a separate read-only pass checked the selected
scope, applicable decisions, recorded commands/results, relevant backend
cookie/origin/CSRF/logout handlers, frontend `AuthContext`, and documentation
diff. It found no scope expansion, source change, secret, migration, or
unrecorded failed check; the bounded local evidence is internally consistent.
This is an `AI_re-review_passed`, not an independent human review or a Phase 1
exit.

**Browser remediation and retest (2026-07-29):** the original disposable
same-origin HTTPS browser run at `https://localhost:3443` exposed two concurrent
Admin bootstrap-refresh requests under development StrictMode. The first rotated
the session and the backend correctly rejected the replay as `401`. The approved
bounded fix adds only an in-flight client-side deduplication for that bootstrap
request in `AuthContext`; backend replay protection was not changed. The targeted
frontend test passed (`8 passed`), the backend concurrent-replay test passed
(`1 passed`), and a new disposable same-origin HTTPS browser run reached
`/admin` after login and remained at `/admin` after reload. The logout control
was visible; logout, revocation, and replay were not re-executed in the browser.
No cookie or token value was inspected or retained. This is local disposable
evidence only, not a deployed-origin or production claim.

**Disposable cleanup:** the named browser-test database was dropped and the
temporary backend, frontend, and proxy processes were stopped. On 2026-07-29,
local cleanup was verified: the temporary PFX and exported CA were absent, and
the temporary CA/leaf certificate counts in both Current User stores were zero.
The user-controlled `rs-test` Docker service was left running. Two temporary
frontend log files remain locked by a pre-existing process; no test runtime,
database, certificate, PFX, cookie, or token artifact remains.

### Backend Feature 1.1–1.7, 2.3, and 2.4 evidence update

The original selected-SHA packet above remains historical evidence for its
stated password-recovery and Admin-session scope. Customer Session was later
authorized separately by `DEC-AUTH-010`. The records below extend bounded
feature evidence across the relevant roadmap phases; they do not merge those
phases or satisfy their production gates.

| Feature | Evidence state | Bounded outcome | Remaining gate |
| --- | --- | --- | --- |
| [Feature 1.1 — Customer Session](phases/FEATURE-1.1-customer-session-remediation.md) | PR #79; merge `1200340f4eab634d608d331f3a830c7ccb258212` | Decision, logout fallback, no-store handling, exact-origin/host-only cookie enforcement, focused tests, isolated MongoDB evidence, and full backend regression recorded. | Migration 007 was not applied. Shared/staging/production topology, proxy observation, deployment, activation, and go-live evidence remain separately gated. |
| [Feature 1.2 — Admin Session](phases/FEATURE-1.2-admin-session-revalidation.md) | PR #80; merge `766d50aee2b16a9788040cd268604c0269611fad` | Local source, backend/frontend regression, disposable MongoDB, and build-compile evidence passed without identifying a requested source defect. | AS-001 production HTTPS/proxy/operations evidence and AS-002 cross-tab policy/browser journey remain open. Migration 009 and production cutover were not run. |
| [Feature 1.3 — Password Recovery](phases/FEATURE-1.3-password-recovery-remediation.md) | PR #81; merge `b69fbb54871774a105ee8dc1d785596ebb6f9692` | Missing-provider handling and the bounded negative/session-revocation evidence gaps were remediated; focused, disposable MongoDB, and full backend evidence passed. | PR-002 timing policy/evidence and PR-004 real-provider delivery/ownership remain open. Migration 008 was not applied. |
| [Feature 1.4 — Password Policy and Hash Migration](phases/FEATURE-1.4-password-policy-hash-migration-remediation.md) | PR #84; merge `29cfae6aabba13c477c2e6e6b2313961c9c30f63` | PP-001/PP-002 bounded local remediation records one canonical backend policy seam plus shared frontend policy consumers. Current-checkout focused frontend evidence passes 4/4 suites and 11/11 tests. | PP-003–PP-006, the `ADR-005`/`DEC-AUTH-004` password-rule clarification, production blocklist operations, target-equivalent Argon2 benchmark, activation/migration, and deployed rollback floor remain open. Current-main full frontend still has the unrelated CMS static-contract failure. |
| [Feature 1.5 — Authentication Rate Limiter](phases/FEATURE-1.5-auth-rate-limit-revalidation.md) | PR #85; merge `af625942cb64e3a4395f44bd57b74e5bacd7f7b1` | Revalidation records the bounded `ADR-005` MongoDB/5-account/20-peer/15-minute source contract, HMAC identifiers, generic 429, `Retry-After`, and 23 passing isolated auth tests. | Real-MongoDB multi-worker concurrency, store-outage policy/tests, spoofed-header negatives, TTL-index application, production proxy topology, monitoring, retention operations, and owners remain open under DR-004. |
| [Feature 1.6 — Internal MFA](phases/FEATURE-1.6-internal-mfa-revalidation.md) | PR #86; merge `b06e60d28be337b199ee1f321fe24d84bb163de6` | Source/decision revalidation confirms password-only Admin sessions and no TOTP, recovery-code, assurance, step-up, or passkey implementation. | DR-005 remains open for TOTP, encryption/key custody, enrollment, pre-auth/session, step-up, recovery, events, rollout, and ownership. No MFA source implementation is authorized. |
| [Feature 1.7 — Authentication Security Events](phases/FEATURE-1.7-auth-security-events-remediation.md) | PR #90; merge `1ada96a591f607e2dba38013cebb1a20e593b782` | A disabled-by-default dedicated event boundary, strict schema, HMAC pseudonymization, 90-day expiry, cleanup/alert foundations, readiness gating, Migration 010 declaration, and local regression evidence were merged. | Migration 010 was not run. Named production owners, external key custody, cleanup scheduling, alert-provider delivery, real-Mongo/isolated recovery evidence, deployment, activation, and go-live remain open. |
| [Feature 2.3 — Legacy Order Compatibility](phases/FEATURE-2.3-legacy-order-projection-remediation.md) | PR #92; merge `7d8d5c90f6440f1276ee4b82c166258514a93cd1` | The merged change binds customer reads to ownership, separates customer/internal allowlists, exposes only safe historical payment metadata, retains all legacy mutations as inactive, and records 47 focused plus 620 full-backend passing tests. | Historical reconciliation, retention, proof custody, production inventory, deployment, production readiness, and go-live remain separately gated. |
| [Feature 2.4 — File Authorization and Security](phases/FEATURE-2.4-file-security-remediation.md) | PR #93 open; implementation commit `6e6da02` | Bounded local/CI remediation under review strengthens upload size/signature checks, partial-write cleanup, database ownership/domain authorization, opaque-ID and compatibility downloads, active-state enforcement, safe media, query-token rejection, and metadata/storage compensation. Focused cross-feature matrix passes 99 tests; full backend passes 635 with 12 documented skips and 14 subtests. | Independent review/merge remain open. Production provider/scanner, retention/quota, backup/restore, owners, historical reconciliation, migration/deployment, production readiness, and go-live remain separately gated. |

Merged records prove that reviewed source and evidence entered `main`; the open
Feature 2.4 record proves only the current PR candidate. None of these records
completes a roadmap phase, resolves grouped MFA, abuse-control,
access-review, historical-reconciliation, or production-operation findings, or
grants migration, deployment, production-readiness, release, or go-live
authority.

## PHASE-01B bounded authorization and privacy revalidation

**Scope and authority:** this is a read-only revalidation of the direct
backend authorization, customer projection, and controlled-file boundaries
under Master Spec § authorization/privacy, `DEC-ACCESS-002`, and
`DEC-ACCESS-003`. It authorizes no source, migration, payment/provider,
deployment, policy, or release change. On 2026-07-29, the Project Owner
selected immutable SHA `9ef645a046518185dcffaf24eaa0136a4f0368cf` after a fresh
fetch confirmed it as `origin/main`. It contains
`704cebe` (`fix(access): constrain legacy order projection`). The former
`d04e3f009d6c815c0a4d99dfa5c93553da3cef43` evidence remains historical and
does not substitute for this candidate result.

**Threat and deny matrix:** the checked trust boundaries are a customer calling
another customer's order or file URL, an internal role attempting the customer
route, a caller guessing a raw storage path, and a record with internal
cost/supplier/note/payment/audit fields reaching a customer response. The B2B
check is limited to the public inquiry acknowledgement and domain projections;
there is no authenticated B2B customer read route in the examined router.

| Boundary / abuse case | Evidence on selected SHA | Result and limit |
| --- | --- | --- |
| Unauthenticated or internal actor calls legacy customer order routes | `GET /api/orders` is authenticated, rejects an actor with `orders.read`, and customer detail requires exact `user_id`; API tests cover `401` unauthenticated and `403` for Admin/customer-route misuse. | Passed for the exercised legacy order endpoints; it does not prove every product surface or frontend consumer. |
| Customer attempts cross-customer order or controlled design-file access | Detail and design-file routes check exact ownership before projection/download; tests assert `403` for the second customer. | Passed in isolated ASGI tests; no shared data or deployed service was used. |
| Caller guesses a raw object-storage path | Generic download requires authenticated ownership or a backend file/media permission; tests assert `401` without credentials and `403` for a non-owner. | Passed for registered active file metadata; it is not storage-provider or deployment evidence. |
| Customer response receives legacy internal fields | The legacy projection is an explicit allowlist. Tests seed notes, internal price, supplier, raw storage paths, estimate notes, payment proofs, and status-history notes, then assert they are absent. | Passed for the exercised response shapes. |
| B2B customer/public projection grows undeclared sensitive fields | B2B inquiry, quote, and project projections are allowlists; poisoned-field tests withhold cost, margin, profit, supplier, internal notes, payment payload, and audit fields. | Passed at domain/public-intake scope only; no B2B customer portal is inferred. |

**Verification (isolated local fixtures only):** in a clean, detached temporary
worktree at selected SHA `9ef645a046518185dcffaf24eaa0136a4f0368cf`,
`python -m pytest -n 0 -q backend/tests/test_auth_security.py backend/tests/test_retail_legacy_classification.py backend/tests/test_storage_routes.py backend/tests/test_identity_foundation.py backend/tests/test_b2b_customer_projection.py` completed with **`50 passed in 14.33s`**. The clean temporary worktree was then removed. The suite uses ASGI and fake/local fixture data; it did not connect to a shared database, start a service, use a provider, or retain a credential.

**Selected-candidate frontend consumer check (2026-07-29):** selected
`OrderDetail` uses `downloadApiFile('/orders/{id}/design-file')`, not the
intentionally withheld `file.storage_path`, so download remains owner-scoped
without exposing a raw storage location. The targeted selected-candidate
command, `$env:CI='true'; npm test -- --watchAll=false --runInBand
src/payment-lockdown.test.js`, completed with **`3 passed in 3.915s`**. The
candidate and local runner have identical frontend manifests/lockfiles; an
ephemeral junction to the existing local `node_modules` was created only for
the test runner and removed before the clean worktree was removed. This is
targeted local contract evidence, not a browser, storage-provider, or deployed
environment proof.

**Result and stop point:** `selected_sha_bounded_evidence_passed`. No
authorization/privacy discrepancy was found in the exercised backend/domain or
frontend consumer matrix, and this task made no source change. It is not an
independent human review, a Phase 1 exit, or closure of FE-004, BE-005/007,
INT-005/006/010, or SEC-008/009. The next gate is an independent human review
of the selected-SHA task card, source/test scope, and evidence. DR-004/005 and
all remaining Phase 1 decision/environment gates remain unchanged.

### TASK-01B-02 candidate rebaseline and customer-file verification

| Field | Task card |
| --- | --- |
| Status / title and objective | `selected_sha_bounded_evidence_passed; independent_review_required` — document the immutable candidate containing the owner-scoped customer design-file correction and prove the bounded PHASE-01B matrix on that exact SHA. |
| Finding / phase / baseline | `BE-005`, `BE-007`, `INT-005`, `INT-006`, `INT-010`, `SEC-008`, `SEC-009`; `PHASE-01B`, `TASK-01B-02`; selected candidate `9ef645a046518185dcffaf24eaa0136a4f0368cf`; superseded evidence target `d04e3f009d6c815c0a4d99dfa5c93553da3cef43`. |
| In scope | Project Owner candidate selection completed; fresh `origin/main` ancestry check confirms `704cebe`; isolated selected-SHA backend/frontend revalidation completed; evidence and handover await independent review. |
| Out of scope | Any new source implementation, raw storage-path exposure, projection-policy change, legacy command/payment activation, provider selection, migration, deployment, commit, push, PR, or finding closure. |
| Authority and dependencies | Master Spec §§13/15; `DEC-ACCESS-002`; `DEC-ACCESS-003`; `DEC-PAY-02`; `FINDING_TRACEABILITY.md`; `TEAM_ASSIGNMENT.md`; candidate selected by the Project Owner. |
| File and worktree boundary | Revalidation used a clean detached worktree from freshly fetched `origin/main`; it was removed cleanly. No source file changed. Post-review tracker scope is limited to `REMEDIATION_PROGRESS.md` and `TEAM_ASSIGNMENT.md`. |
| Acceptance criteria | Exact candidate SHA and `704cebe` ancestry are recorded; backend direct allow/deny matrix passed (`50`); frontend test confirms no raw `file.storage_path` consumer and calls `/orders/{id}/design-file` (`3`); independent reviewer must still record a disposition; status remains `requires_revalidation` unless every broader Phase 1 gate is separately evidenced. |
| Minimum verification | `git fetch origin`; `git merge-base --is-ancestor 704cebe 9ef645a046518185dcffaf24eaa0136a4f0368cf`; five-file backend pytest matrix (`50 passed`); frontend payment-lockdown test (`3 passed`); clean-worktree and `git diff --check` review. |
| Authorization and stop point | This work authorized no source, commit, push, PR, migration, rollout, or go-live. Stop at independent review; do not promote the result to Phase 1 exit or finding closure. |

## PHASE-00D discrepancy disposition and independent review

This is a selected-SHA documentation/provenance check only. It neither closes
audit findings nor changes a decision, runbook, source, test, migration, or
release status.

**Independent AI evidence review (2026-07-29):** this read-only review used
the immutable selected SHA
`d04e3f009d6c815c0a4d99dfa5c93553da3cef43`, rather than treating the current
branch HEAD as release evidence. It checked the Document Register
classifications, exact Git-path existence, the runbook-to-ADR pointer, the
tracked pytest XML metadata, and the absence of the named branch-local plan.
The pre-existing disposition is internally consistent after adding the two
assigned OPS findings below. This is an `AI_independent_review_passed`, not a
human review, a finding closure, a release-candidate approval, or a Phase 0
exit.

| Finding / area | Selected-SHA evidence | Treatment and stop point |
| --- | --- | --- |
| GOV-014 — unregistered pending plans | The Document Register now classifies the 2026-07-25 Admin content-editor and reporting/notification plans, including their no-authority boundaries. | Reconciled for the named plans; preserve their recorded status and do not execute them as authority. |
| GOV-015 — transaction ADR pointer | `doc/TRANSACTION_CAPABILITY_RUNBOOK.md` now points to `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`, which exists. | Reconciled at the selected SHA; later link/path validation remains a separate QA/governance gate. |
| OPS-011 — migration/backup runbook reference | At the selected SHA, the transaction runbook's provenance pointer resolves to the canonical ADR path; both paths exist. The historical audit's stale `doc/decisions/...` reference is not present. | Reconciled only as a documentation-path disposition. Retain the later automated link/path validation gate; do not infer migration, backup, restore, or production authority. |
| GOV-017 — historical tracker freshness | `BACKEND_AUDIT_TRACKER_2026-07-24.md` is registered as Context Only, while the selected-SHA map records its historical baseline separately. | Contained, not revalidated: do not inherit its counts, statuses, or test results. |
| GOV-011 — stale generated pytest XML | `test_reports/pytest/pytest_results.xml` remains a tracked 2026-06-28 report without a selected-SHA provenance record. | Faiz approved the limited 2026-07-29 disposition: treat it as historical non-authoritative evidence, exclude it from release gates, and retain it unchanged in this task. It remains open until a QA/release owner sets retention policy and fresh CI produces attributable replacement evidence. |
| OPS-012 — release versioning/changelog contract | No root `VERSION*`, `CHANGELOG*`, or release manifest is tracked at the selected SHA; no accepted versioning/release-record convention is evidenced. | Correctly remains `blocked_by_decision`, not a pass or a misleading-reference repair. Carry it to DR-013 and PHASE-07D/09B; do not invent a release convention or artifact in PHASE-00D. |
| Unavailable historical Superpowers plan | The Document Register explicitly records the referenced branch-local plan as unavailable and non-authoritative. | Contained. Do not reconstruct it or treat it as current authority. |

## PHASE-00C migration stop-condition preflight

**Scope:** planning-only packet for `DR-012`; it does not select a target or
authorize a migration/rehearsal. Faiz is the recorded owner for migration,
backup/restore, rollback, maintenance-window authority, and evidence custody.
The local disposable `rs-test` replica set is the selected preflight target
only; it is not shared, staging, or production. RPO/RTO, secret evidence,
incident/release/on-call ownership, and the approved evidence format remain
open.

**Global stop rule:** do not run dry-run, apply, rollback, restore, or any
mutation against shared/staging/production data while the target, topology,
RPO/RTO, secret-evidence boundary, evidence format, and independent review are
unassigned. A local or disposable command cannot be substituted for this
decision. Transaction-required mutations must remain fail-closed when replica
set capability is unavailable.

**Environment preflight evidence (2026-07-29, reported by Faiz):**
`docker-compose.transaction-test.yml` validated; Docker daemon version 29.5.2
was active; loopback port 27018 was free before startup; the disposable MongoDB
7.0 service became healthy; and a read-only `db.hello().setName` probe returned
`rs-test`. No repository migration `001`–`009` was executed during preflight.

**Controlled local backup/restore evidence (2026-07-29):** with the disposable
`rs-test` service healthy before and after execution, `python -m pytest -n 0 -q
backend\tests\test_migration_backup_restore.py` completed with `4 passed in
1.24s`. The suite's temporary migration-shaped data exercise is limited to the
disposable test database; it is not an approved migration apply, shared/staging
or production restore, or a release/readiness pass.

**Static preflight revalidation (2026-07-29):** no service was started and no
database command, dry-run, apply, rollback, restore, or mutative test was run.
`docker compose -f docker-compose.transaction-test.yml config --quiet` passed;
the nine tracked candidate modules (`001` through `009`) are unchanged from the
selected SHA. Read-only source review confirms default dry-run behavior and
apply guards in the candidate set: Migration 007 requires a reviewed,
credential-free backup-evidence manifest with checksum, restore result,
reviewer, and timezone-aware approval window; Migrations 006, 008, and 009
require a transaction-capable guard plus their explicit backup/encryption
confirmations for mutation paths. This static result verifies stop conditions,
not an executable migration or recovery environment.

| DR-012 stop condition | Current state | Rule for PHASE-00C |
| --- | --- | --- |
| Isolated target and approved topology | `rs-test` is a disposable local preflight topology only; no shared, staging, or production target is named. | Do not connect any migration command to a target until its identifier, replica-set/capability boundary, and custody are approved. |
| RPO/RTO and backup/restore custody | Faiz is recorded for migration, backup/restore, rollback, maintenance-window authority, and evidence custody; RPO/RTO remain open. | Do not capture, restore, or set a rollback point until the owner-approved recovery objectives and safe storage/custody procedure are recorded. |
| Secret-safe evidence format and review | Backup-evidence fields exist for Migration 007, but an approved shared evidence format and independent reviewer are not assigned. | Do not create or attach a real backup manifest; record only approved, credential-free aggregate evidence after review assignment. |
| Incident, release, and on-call ownership | Not assigned in DR-012. | No execution window, production-like rehearsal, or release claim may be opened by this phase. |
| Explicit authorization | No target/window/rehearsal approval exists. | The global stop rule remains in force for dry-run, apply, rollback, restore, and all shared/staging/production mutation. |

| Migration candidates at selected SHA | Required preconditions before any execution | Status |
| --- | --- | --- |
| `001_identity_rbac_audit.py`, `003_identity_access_policy.py`, `006_granular_role_policy.py` | Named isolated target; approved window; backup and restore custody; transaction-ready replica set; reviewed opaque-ID procedure where applicable; dry-run, validation, rollback, and restore evidence. | Blocked by DR-012 and target/owner absence. |
| `002_catalog_material_inventory.py`, `004_content_blocks_seed.py`, `005_archive_orphan_collections.py` | Named isolated target; data-retention/owner approval; non-destructive dry-run; backup, validation, rollback, and restore plan; historical-record preservation check. | Blocked by DR-012 and data/retention decisions. |
| `007_security_publication_schema.py`, `008_auth_recovery_safety.py`, `009_admin_session_safety.py` | Named isolated target; encrypted backup custody; approved recovery/session runbook gates; transaction readiness; dry-run, failure/second-run validation, rollback, and restore evidence. | Blocked by DR-012, selected-scope revalidation, and absent target/window. |

**Required evidence record before removing a stop rule:** exact selected SHA,
environment and database identifier, timezone-aware window, owner and reviewer,
credential-free backup location plus checksum, dry-run result, apply/second-run
result where authorized, validation, rollback/restore result, and remaining
limitation. No secret, database URI, customer record, token, or password may be
recorded in this tracker.

## Existing authorization packets

The newer local default-branch history contains bounded Admin authentication
Phase 1 and Phase 2 packets. Their stated local gates and separate no-push,
no-deployment, no-activation boundaries remain intact. They are **not** marked
as completed roadmap phases here because:

- the selected `d04e3f0` candidate is 59 commits / 240 committed paths beyond
  audit baseline `c28684d`;
- their relationship to all other finding groups must be revalidated on the
  selected SHA; and
- the packets do not authorize unrelated migration, provider, operational, or
  production work.

## Resume protocol

When work resumes, update only the relevant tracker row with the exact SHA,
decision source, changed source/test scope, verification command/result,
limitations, and next stopping point. Preserve unrelated worktree files and do
not replace a `requires_revalidation` status with `complete` without current
resolution evidence.
