# Niuva Production-Readiness Finding Traceability

<!-- markdownlint-disable MD013 -->

Status: Planning and Progress Context — Not Implementation Authority Unless Explicitly Approved

Audit source baseline: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
Normalization source: Layer 01-11 audit registers, especially
`layers/11-production-readiness-summary.md`.

## Current-main backend overlay — 13 August 2026

Layers 03 through 10 were rebaselined at
`15b759a02b036330f1dd0913611043e0fd6134e2`. The complete evidence,
per-layer scores, current source-ID dispositions, verification, and limits are
recorded in
[`CURRENT-MAIN-BACKEND-REBASELINE-2026-08-13.md`](phases/CURRENT-MAIN-BACKEND-REBASELINE-2026-08-13.md).

This overlay supersedes the historical status of the following canonical
groups for current repository claims:

| Canonical group | Current-main disposition |
| --- | --- |
| Freshness and release-candidate baseline | Backend Layers 03–10 are current at `15b759a`; Layer 11 cross-layer synthesis and explicit release-candidate selection remain open |
| Legacy order integrity and customer-note privacy | `BE-005` and `SEC-009` are `resolved_in_source` for the retained read-only compatibility scope; historical reconciliation and production evidence remain gated |
| Transaction guard and idempotency consistency | `BE-002` and `DB-003` are `resolved_in_source`; `INT-009` remains partial across all command families despite Quote, Project Conversion, Work Order, and Retail 3.4A hardening |
| Retail payment and fulfilment capability enforcement | The legacy bypass is closed and Retail 3.4A is hardened, but transaction/payment/fulfilment runtime capability remains deliberately inactive; `BE-003`/`INT-003` must not be read as provider activation |
| Package/runtime reproducibility | `OPS-001`, `GOV-001`, `GOV-002`, and `GOV-005` are resolved in the repository contract through npm, Python 3.14.3, and hashed backend lock enforcement |
| Dependency vulnerability and lifecycle risk | Backend audit reports zero known vulnerabilities; the audited baseline reports `nanoid 3.3.17` under `GHSA-2v37-7h3g-55p8`, while PR #244 validates the `3.3.18` lock correction; `SEC-012`/`GOV-003` remain open on `main` until merge |
| QA and release gates | `QA-001`, `QA-004`, and `QA-005` are resolved in repository workflows; external release/browser evidence and whole-tree threshold ownership remain partial or environment-blocked |
| Governance, compatibility, and evidence provenance | `GOV-015` and backend `GOV-017` freshness are resolved; compatibility disposition, release/version ownership, and broader governance remain partial |

All other canonical rows below remain historical normalization and finding
provenance unless this overlay or a later exact-SHA packet explicitly changes
their disposition. No current source resolution is production or go-live
acceptance.

## Current-main auth/security overlay — 14 August 2026

[`AUTH-SECURITY-CURRENT-MAIN-REVALIDATION-2026-08-14.md`](phases/AUTH-SECURITY-CURRENT-MAIN-REVALIDATION-2026-08-14.md)
revalidates the unchanged backend runtime at `15b759a`. Customer/Admin session,
recovery, password, bootstrap, event-redaction/retention, and customer-safe
projection contracts pass repository checks. All `112` effective Admin routes
carry permission guards, and the new inventory-driven test denies every
canonical role that lacks each declared permission.

This overlay does not close NIV-001, DR-004, DR-005, migration, external key,
retention operation, topology, independent-review, release, or go-live gates.
The Layer 06 disposition remains `1 P0 / 4 P1`, `49%` readiness, with confidence
raised to `96%` because negative route coverage is now enforced rather than
inferred from a hand-maintained list.

## PHASE-00A selected-candidate revalidation map

**Decision record:** Faiz selected
`d04e3f009d6c815c0a4d99dfa5c93553da3cef43` as the local release-candidate
baseline under `DR-001` on 29 July 2026 (Asia/Jakarta). This is an immutable
Git object, and audit baseline `c28684d34c03505ea2f862f32c6edc24b1d7bfba` is
its ancestor. At selection time it equals local `origin/main`; remote freshness
was not checked by a fetch and is therefore unverified.

**Change evidence:** `git diff --name-only
c28684d34c03505ea2f862f32c6edc24b1d7bfba...d04e3f009d6c815c0a4d99dfa5c93553da3cef43`
returns 240 committed paths (88 `backend/`, 65 `frontend/`, 71 `docs/`, 7
`doc/`, 4 CI workflows, and 5 other repository-control paths). The local
`frontend/jsconfig.json` modification is outside that committed comparison and
is preserved as user work. This is a changed-path map, not a re-audit and not
closure evidence.

Every canonical finding below remains open, blocked, partial, or
`requires_revalidation` as already recorded. The selected SHA's scope requires
the following grouped revalidation; no row is promoted to `resolved` by this
matrix, commit history, or test presence alone.

| Candidate changed scope | Canonical findings requiring current treatment | Required PHASE-00A treatment |
| --- | --- | --- |
| Candidate ancestry, audit/planning records, and repository controls | Freshness and release-candidate baseline; Governance, compatibility, and evidence provenance | Record the selected SHA and compare all later evidence against it; retain `SUM-FRESH-001` / `GOV-017` until current evidence is reviewed. |
| `.gitleaksignore`, credential-history records, and security governance documents | NIV-001 credential incident | A Final Approver accepted the risk through 30 August 2026; retain P0 severity, release/go-live blocking, and the need for the existing runbook plus secret-safe independent verification. This is not verified closure, and no scan or commit proves closure. |
| `auth_*`, password policy, identity routes, sessions, and their backend/frontend tests | Admin session, MFA, and access-review boundary; Recovery, password, bootstrap, and secret atomicity; Distributed abuse protection; Admin identity, permission, and selector parity | PRs #79–#81/#84 add bounded Customer Session, Admin Session, Password Recovery, and Password Policy/Hash Migration source/local-test evidence. PRs #85/#86 add rate-limiter and MFA revalidation packets. Retain revalidation or blocked status for the grouped findings not exercised by those packets and for the `ADR-005`/`DEC-AUTH-004` password-rule clarification, migration, blocklist/Argon2 target operations, real-Mongo/proxy/outage/retention evidence, MFA decisions/implementation, production topology/delivery, access-review, and rollout gates. |
| Storage, legacy-order/Retail, catalog, inventory, and customer-facing route/test changes | File ownership, content validation, and storage boundary; Legacy order integrity and customer-note privacy; Retail payment and fulfilment capability enforcement; Provider activation boundary | Revalidate object/field/capability boundaries and safe customer projections. Do not infer a storage or payment provider, Finance policy, or production activation. |
| Transaction, B2B Quote/Work Order, schema, and migration changes | Transaction guard and idempotency consistency; Quote-line identity, references, uniqueness, and retention; Migration, live schema, backup, and restore safety | Revalidate fail-closed transaction and line-identity behavior. `DEC-DATA-002` resolves the identity/ambiguity policy; retain migration and historic-data execution stop conditions pending DR-012, approved runbooks, and isolated evidence. |
| Notification, CMS, portfolio, and readiness changes | Notification schema, delivery, recipient projection, and audit privacy; CMS/Portfolio permission, concurrency, and orphan promotion; API transport, validation, failure, and envelope | `DEC-DATA-003` governs general-notification schema, retention, delivery boundary, and temporary alert ownership. Revalidate the contract and customer-safe/auditable lifecycle behavior; retain CMS, Portfolio, compatibility, and remaining notification implementation decisions where open. |
| Public, Retail, B2B, Admin, and customer frontend/API changes | Unified Homepage, customer account, and Retail journey parity; B2B organization/customer portal parity; Objective accessibility and factual-state defects; Surface direction and typography conflicts | Revalidate only approved journeys and objective UI facts. Retail/B2B navigation, portal, content, and deferred visual decisions remain blocked unless separately approved. |
| CI workflows, browser/E2E configuration, health/readiness, worker, and release artifacts | Release artifact, readiness, deployment, and network evidence; Observability, background lifecycle, timeout, and capacity; QA and release gates | Revalidate against a controlled environment. Local/static evidence cannot replace the missing CI, browser, staging, telemetry, topology, or operational-drill evidence. |
| Package manifests/locks, dependency audit script, and broad backend/frontend maintenance changes | Package/runtime reproducibility; Dependency vulnerability and lifecycle risk; Maintainability, query, and frontend performance debt | Revalidate with the eventually approved runtime/lock/gate policy, compatibility evidence, and performance/quality thresholds. Do not treat changed manifests or passing local checks as a release disposition. |

## Normalization rules

- Every source finding remains retained in this register; 120 source IDs map to
  27 canonical findings.
- A canonical row groups the same root cause or a required dependency chain. It
  is not an additional finding count.
- `OPS-010` is `duplicate_of: NIV-001 / SEC-001`. No other source ID is
  silently discarded as a duplicate.
- Where source evidence conflicts, the final severity is the stricter detailed
  finding severity. The Layer 03 and Layer 05 header counts are superseded by
  their detailed registers: Layer 03 is 9 P1 / 3 P2 and Layer 05 is 10 P1 / 4 P2.
- A source change on local `origin/main` creates
  `requires_revalidation`, not `resolved`. No commit, test existence, or
  changed document is closure evidence by itself.

## Master finding register

| Canonical Finding | Source Finding IDs | Layer | Root Cause | Severity | Status | Confidence | Release Blocking | Go-Live Blocking | Decision Required | Dependencies |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Freshness and release-candidate baseline | `SUM-FRESH-001` | 11 | Scored branch is behind newer local default-branch auth, migration, frontend, CI, and authority changes. | P2 | `requires_revalidation` | 100% | Yes for any current-default-branch claim | Yes | Select exact RC SHA and revalidation scope. | Release owner; changed-path matrix; no fetch implied. |
| NIV-001 credential incident | `SEC-001`, `OPS-010` | 06, 08 | Operational credential-incident closure has not been independently evidenced. `OPS-010 duplicate_of SEC-001`. | **P0** | `accepted_risk_self_verification_exception_approved_until_2026-08-30`; incident remains open and verified closure remains unavailable | 90-99% | **Yes** | **Yes** | Before expiry, obtain independent incident closure evidence, renew the accepted risk, or record another explicit disposition. | Credential owner, repo host admin, incident owner, NIV-001 runbook; current redacted inventory, evidence template, and owner-exception record. |
| Admin session, MFA, and access-review boundary | `FE-002`, `INT-004`, `SEC-002`, `SEC-003`, `SEC-007` | 01, 05, 06 | Legacy Admin bearer/session behavior and incomplete internal access controls conflict with approved auth direction. | P1 | Current-main revalidation enforces permission guards across all 112 effective Admin routes and confirms bounded Admin-session behavior; MFA remains absent and blocked under DR-005, while access-review and production acceptance remain open | 96-100% | Yes | Yes | Complete DR-005 TOTP, encryption/key, enrollment, pre-auth/session, step-up, recovery, event, owner, and rollout contracts; retain exact-target HTTPS/proxy, production migration/cutover, restore, monitoring, deployment, and activation gates. | `DEC-AUTH-005/007/008/009/012`; [current-main auth/security evidence](phases/AUTH-SECURITY-CURRENT-MAIN-REVALIDATION-2026-08-14.md); identity and operations owners; production browser/proxy evidence. |
| Recovery, password, bootstrap, and secret atomicity | `FE-003`, `BE-008`, `DB-002`, `SEC-004`, `SEC-005`, `SEC-013` | 01, 03, 04, 06 | Legacy recovery/password writes were not one approved, atomic, secret-safe contract. | P1 | Current-main recovery, revocation, canonical password seam, Argon2 gate, and no-password-rewrite bootstrap checks pass; timing, provider delivery, PP-003–PP-006, password-rule clarification, migration, and production gates remain open | 96-100% | Yes | Yes | Approve recovery timing/delivery ownership; clarify `ADR-005` versus `DEC-AUTH-004`; retain production blocklist operations, target-equivalent Argon2 benchmark, activation/migration, deployed rollback floor, and rollout gates. | `DEC-AUTH-003/004`; `ADR-005` needs clarification; ADR-001; [current-main auth/security evidence](phases/AUTH-SECURITY-CURRENT-MAIN-REVALIDATION-2026-08-14.md); Migration 008; isolated replica set; recovery runbook. |
| Distributed abuse protection | `SEC-006` | 06 | The bounded MongoDB limiter exists, but real distributed concurrency, production proxy/outage/TTL/retention behavior, monitoring, and ownership are unproven. | P1 | Current-main HMAC, atomic budget, generic 429, and concurrency checks pass; store-outage behavior remains unnormalized/untested and `blocked_by_decision` under DR-004 | 100% | Yes for internet-facing auth | Yes | Complete DR-004 for production topology, proxy trust, store-outage behavior, TTL application, retention, monitoring, and owners; preserve the bounded `ADR-005` 5/20/15-minute contract unless separately changed. | `ADR-005`; DEC-AUTH-002/006; [current-main auth/security evidence](phases/AUTH-SECURITY-CURRENT-MAIN-REVALIDATION-2026-08-14.md); real MongoDB concurrency; deployment topology; security/operations owners. |
| File ownership, content validation, and storage boundary | `BE-007`, `INT-010`, `SEC-008`, `SRE-007` | 03, 05, 06, 09 | Feature 2.4 provides bounded size/signature checks, database ownership/domain scope, active-state controlled download, safe media/query-token handling, and development compensation; production storage remains provider/operation blocked. | P1/P2 | `resolved_for_active_development_scope` / `blocked_by_decision` | 90-97% | Yes for a file-enabled release | Yes | Independent review of PR #93; production provider/scanner, retention/quota, backup/restore, RPO/RTO, owners, historical reconciliation, and compatibility-route retirement. | ADR-002; `FEATURE-2.4-file-security-remediation.md`; object metadata; validation/quarantine; storage owner. |
| Legacy order integrity and customer-note privacy | `BE-005`, `SEC-009` | 03, 06 | Retained legacy order route/projection does not fully enforce integrity or customer-safe field boundaries. | P1 | `decision_resolved_implementation_open` / `requires_revalidation` | 94-100% | Yes for retained customer order routes | Yes | `DEC-ACCESS-003` records retained/read-only compatibility, customer-safe projection, and sunset policy; bounded source implementation and selected-SHA verification remain separate. | Customer-safe projection; legacy data preservation; direct access tests. |
| Transaction guard and idempotency consistency | `BE-002`, `DB-003`, `INT-009` | 03, 04, 05 | Shared transaction adoption is merged evidence. The local Feature 4.2 candidate additionally binds Quote transition, revision, and acceptance operation IDs to exact command fingerprints, but other command families and independent review remain open. | P1 | partial / `requires_revalidation`; Feature 4.2 local candidate | 90-92% | Yes | Yes | Review and deliver the bounded Quote candidate separately; continue per-command-family reconciliation without claiming global idempotency closure. | ADR-001; shared executor; Feature 4.2 task card; real replica-set failure tests. |
| Quote-line identity, references, uniqueness, and retention | `BE-004`, `DB-004`, `DB-013` | 03, 04 | Exact immutable Quote-line and Work Order references are enforced in source; broader retention and approved historical-data execution remain external gates. | P1 | `BE-004`/`DB-004` resolved_in_source; `DB-013` partial | 100% for Quote-line source scope | No for source scope | Yes pending production data evidence | No further source decision; later historical execution needs exact isolated target and reviewed mapping. | `DEC-DATA-002`; aggregate-only report; reconciliation runbook; retention owner. |
| Migration, live schema, backup, and restore safety | `DB-005`, `DB-006`, `DB-007`, `DB-008`, `DB-009`, `DB-010`, `DB-011`, `DB-012`, `DB-014`, `OPS-005`, `OPS-006`, `QA-004`, `GOV-013` | 04, 07, 08, 10 | Migration behavior, live schema evidence, serialization, backup/restore ownership, and rollback guarantees are uneven. | P1/P2 | open / `blocked_by_decision` / `environment_blocked`; newer auth migrations require revalidation | 87-100% | Yes for data-bearing release | Yes | Target, maintenance window, retention, RPO/RTO, restore and migration approval. | Named target; backup owner; migration ledger; replica-set; restore authority. |
| Notification schema, delivery, recipient projection, and audit privacy | `BE-009`, `DB-001`, `INT-008`, `SEC-010`, `SRE-003`, `SRE-008` | 03, 04, 05, 06, 09 | PR #127 reconciles the active identity-governance writers with the strict redacted `audit_events` contract. The SEC-010 packet now records the store, no-deletion preservation boundary, and role-based review/recovery accountability. Broader notification writers, delivery/worker behavior, historical identity records, and operational evidence remain open. | P1/P2 | `DEC-DATA-003` recorded / `SEC-010` source-aligned; broader implementation and revalidation remain open | 92-100% | Yes where notifications are critical | Yes | General-notification schema, retention, delivery boundary, and temporary alert owner are decided; identity-governance active writes are source-aligned; historical records, named production ownership, and dedicated authentication-event operations remain separately gated. | Legacy-shape/reference report; worker/lease and recipient-projection implementation; notification redaction/expiry tests; historical identity-record review; provider/scheduler/telemetry/SLA decisions. |
| Retail payment and fulfilment capability enforcement | `BE-003`, `INT-003` | 03, 05 | Legacy actions can cross the inactive production payment/fulfilment boundary. | P1 | open / `broken_contract` | 95-96% | Yes | Yes | Provider, state map, Finance/reconciliation only when authorized. | ADR-003; DEC-PAY-02; provider-neutral capability boundary. |
| Provider activation boundary | `OPS-008` | 08 | Storage/payment activation is intentionally deferred and cannot be inferred from code or plans. | P1 | `blocked_by_decision` | 99% | No for provider-free development scope | Yes | Storage/payment provider, Finance, RPO/RTO, production approval. | ADR-002; ADR-003; operations and Finance owners. |
| Unified Homepage, customer account, and Retail journey parity | `UX-001`, `INT-001`, `INT-002`, `INT-014` | 02, 05 | Public/customer route implementation does not cover the approved high-level journey; first Retail slice and detailed navigation remain open. | P1/P2 | open / `blocked_by_decision` / deferred | 95-98% | Yes only for promised Retail scope | Yes | First Retail slice, navigation/CTA treatment, customer auth, policy. | DEC-UX-001; Master Spec deferrals; separate vertical-slice authority. |
| B2B organization/customer portal parity | `INT-007` | 05 | B2B backend foundation has no approved customer consumer journey. | P1 | partial | 96% | Yes for full B2B customer scope | Yes | Portal scope, safe projection, approval/design contract. | B2B release sequence; organization access decisions; seeded test data. |
| Admin identity, permission, and selector parity | `FE-004`, `UX-005`, `INT-005`, `INT-006` | 01, 02, 05 | Frontend surface guard, identity UI, and pricing-permission composition do not fully reflect canonical role matrix. | P1/P2 | open / `broken_contract` | 93-96% | Yes for affected Admin roles | Yes | Role matrix/UI scope and implementation authorization. | DEC-ACCESS-002; role fixtures; backend deny tests. |
| CMS/Portfolio permission, concurrency, and orphan promotion | `BE-006`, `INT-013` | 03, 05 | Feature 5.1 closes the CMS contention/error seam. Feature 5.2 PR #101, merged as `aff3d117`, hardens Portfolio revision ownership, immutable publication replacement, rollback/reorder concurrency, dual-permission Project promotion, and historical preservation; no new promotion consumer was added. | P1/P2 | partial / `requires_revalidation`; bounded source review complete, consumer remains orphaned | 95-98% for bounded backend lifecycle scope | Yes for publish-enabled release | Yes | Decide any new Project/customer consumer separately under DR-010; retain migration, controlled release, and production evidence gates. | Feature 5.1 CMS evidence; Feature 5.2 task card; content owner; DR-010. |
| Objective accessibility and factual-state defects | `UX-002`, `UX-003`, `UX-004`, `UX-007`, `UX-008`, `UX-010` | 02 | Controls violate contrast, focus, target-size, semantic state, validation association, or current factual content requirements. | P1/P2 | open | 88-97% | Yes for critical journeys | Yes | Content/privacy confirmation for factual text; normal bounded accessibility authorization. | Component owner; browser/AT environment; seeded state fixtures. |
| Surface direction and typography conflicts | `UX-006`, `UX-009`, `UX-011` | 02 | Current presentation conflicts with Admin/public design direction or crosses a documented visual rollout deferral. | P2/P3 | open | 67-90% | Conditional | Conditional | Brand/UX decision for any deferred visual rollout. | DEC-OPS-001; DEC-UX-002; brand owner. |
| API transport, validation, failure, and envelope | `FE-001`, `FE-005`, `FE-006`, `BE-001`, `INT-011` | 01, 03, 05 | Distributed assumptions about transport, invalid data, error state, retries, and list envelopes. | P1/P2 | partial / `requires_revalidation`; FE-006 is merged, while Feature 8.2 is reconciled with current `main` and locally verified for five Admin/B2B list envelopes | 87-100% | Yes | Yes | Require Feature 8.2 exact-head CI and merge; preserve FE-006 and separately decide remaining critical schemas, raw-download timeout/cancellation, and all other pagination scope. | API governance; stable fixtures; UX state contract; selected-RC and controlled release evidence. |
| Release artifact, readiness, deployment, and network evidence | `FE-ENV-001`, `BE-012`, `INT-012`, `SEC-011`, `OPS-003`, `OPS-004`, `OPS-009`, `SRE-001` | 01, 03, 05, 06, 08, 09 | Required release/browser/service/deployment proof lacks a controlled topology and artifact contract. | P1/P2 | `environment_blocked` / open | 85-100% | Yes | Yes | Staging topology, origin, secret/evidence contract, TLS/proxy and readiness owner. | Environment owner; role fixtures; API topology; trusted proxy policy. |
| Observability, background lifecycle, timeout, and capacity | `OPS-007`, `SRE-002`, `SRE-004`, `SRE-005`, `SRE-009` | 08, 09 | No owned service objectives/telemetry plane; per-process background behavior and capacity limits are unproven. | P1/P2 | open / `environment_blocked` | 92-98% | Yes for release candidate | Yes | Telemetry/SLO/on-call, worker topology, budgets, rollback owner. | Metrics/tracing destination; capacity model; staging-like environment. |
| QA and release gates | `QA-001`, `QA-002`, `QA-003`, `QA-005`, `QA-006`, `QA-007`, `OPS-002` | 07, 08 | CI and test gates can omit critical suites or lack artifact, browser, security, quality, and parity signals. | P1/P2 | open / `environment_blocked` | 90-98% | Yes | Yes | Required-gate, threshold, CI service, and artifact/report ownership. | Seeded roles; public origin; supported browsers; isolated DB. |
| Package/runtime reproducibility | `OPS-001`, `GOV-001`, `GOV-002`, `GOV-005` | 08, 10 | Package manager, lockfile, backend dependency lock, and runtime versions are not one supported contract. | P1 | open | 91-99% | Yes | Yes | Supported package/runtime/lock strategy. | Release owner; CI matrix; backend dependency policy. |
| Dependency vulnerability and lifecycle risk | `SEC-012`, `GOV-003`, `GOV-004` | 06, 10 | Reported frontend advisory and deprecated/lifecycle risks need a compatible, owner-approved disposition. | P1/P2 | open / `requires_revalidation` | 93-100% | Yes until disposition | Yes | Upgrade, mitigation, accepted-risk owner and expiry. | Security owner; compatibility tests; dependency policy. |
| Governance, compatibility, and evidence provenance | `BE-011`, `OPS-011`, `OPS-012`, `GOV-008`, `GOV-009`, `GOV-011`, `GOV-012`, `GOV-014`, `GOV-015`, `GOV-016`, `GOV-017` | 03, 08, 10 | Feature 8.3 inventories 21 source-identified compatibility endpoints and separates observed behavior, approved disposition, repository consumers, external unknowns, sunset prerequisites, and rollback gates. Legacy Contact disposition and the expired Material DELETE sunset remain unresolved; release/version ownership and broader provenance gaps remain open. | P1/P2 | partial / `requires_revalidation`; planning evidence only | 90-99% | Conditional; `GOV-014` is release-blocking | Yes | Review the Feature 8.3 register; owners decide unresolved route/sunset items before any source change, then retain broader documentation/release/dependency governance work. | Compatibility register; decisions; runbooks; CODEOWNERS/review policy; release record. |
| Maintainability, query, and frontend performance debt | `FE-007`, `FE-008`, `FE-009`, `BE-010`, `SRE-006`, `SRE-010`, `GOV-006`, `GOV-007`, `GOV-010` | 01, 03, 09, 10 | Feature 8.2 bounds and stabilizes five approved Admin/B2B list queries in a current-main-reconciled, locally verified candidate; other list growth, module/dependency debt, query-plan/load evidence, and frontend performance/error budgets remain absent. | P2/P3 | partial / `requires_revalidation` | 86-97% | Not alone | Conditional | Require the bounded cursor contract's exact-head CI and merge; separately authorize indexes, query-plan/load evidence, other list families, budgets, and cleanup/refactor scope. | Performance targets; production-like data model; test coverage; owner approval. |

## Evidence conflicts and resolution treatment

| Conflict | Treatment |
| --- | --- |
| Layer 03 header counts versus detailed `BE` register | Detailed register controls severity/status: 9 P1 and 3 P2. |
| Layer 05 header counts versus detailed `INT` register | Detailed register controls severity/status: 10 P1 and 4 P2. |
| Layer 04 earlier absence of real Mongo evidence versus Layer 07 later 45-pass replica-set suite | Later local evidence supersedes only the absence claim; it does not prove production topology, real-data migration, or operational restore. |
| Historical tracker / new default-branch commits versus scored audit snapshot | Preserve as revalidation candidates. Do not change finding to resolved without current verification. |
| Intentional deferral versus broken contract | A deferred Retail/provider surface is not a defect for provider-free development, but becomes release/go-live blocking if the selected production scope promises that journey/capability. |

## NIV-001 current evidence addendum — 2026-08-06

Current baseline: `origin/main` at
`9472537405af3353a68e599a057263ca7aa079ee` (`9472537`), Git tree
`3a4678333ede6122fdc8d3f87456b83e1567c9cd`, observed at
`2026-08-06T09:44:01Z`. PR #185 was open at the inventory timestamp below; its
source and documentation changes are evidence only and do not close
`SEC-001`/`OPS-010`. The earlier `f43eea6` inventory at
`2026-08-06T06:43:09Z` is historical and is not silently treated as current
9472537 evidence.

On 2026-08-06, Faiz recorded a sole-owner self-verification exception because
no independent verifier is available. This resolves the owner-decision gap in
the packet only; it is not independent verification, does not attest to
credential revocation/rotation or external history cleanup, and does not lift
the P0 release/go-live block.

Evidence is recorded in
[`DR-002-NIV-001-REDACTED-GIT-INVENTORY-2026-08-06.md`](phases/DR-002-NIV-001-REDACTED-GIT-INVENTORY-2026-08-06.md)
and the safe procedure is recorded in
[`DR-002-NIV-001-REVOKE-ROTATE-EVIDENCE-TEMPLATE-2026-08-06.md`](phases/DR-002-NIV-001-REVOKE-ROTATE-EVIDENCE-TEMPLATE-2026-08-06.md).

| Evidence group | Current result | Traceability interpretation |
| --- | --- | --- |
| Repository/GitHub inventory | Refreshed at `2026-08-06T09:44:01Z` against `9472537`; counts are recorded in the linked redacted inventory, including the open PR #185 snapshot. | Timestamped read-only snapshot only; freeze, old-clone, cache, backup, and Support evidence remain open. |
| Local worktrees/object database | Refreshed at the same timestamp; `113` worktrees, state counts, and fsck result are recorded in the linked inventory. | No worktree or object cleanup was performed; owner disposition is still required. |
| Redacted history scan | The latest pinned Gitleaks result is historical at `f43eea6` with two unresolved redacted findings; Gitleaks was unavailable for the `9472537` revalidation. | Findings require secret-safe owner review; they are not automatically false positives or closure evidence. |
| Focused non-production verification | Focused auth/security/permission/projection suite passed `180` tests on the synchronized `9472537` source paths; no controlled new-account authentication was run. | Bounded local source evidence only; it does not prove credential revocation or external cleanup. |
| Current-main CI | `backend`, `frontend`, and `secret-scan` checks succeeded at `9472537`. | CI evidence is repository-only and does not prove incident closure or production readiness. |
| Credential/history action | No credential was inspected, revoked, or rotated; no Git history was rewritten or force-pushed; no ref was deleted. | `NIV-001` remains `accepted_risk_self_verification_exception_approved_until_2026-08-30`; the incident remains open and verified closure remains unavailable. |

The current status therefore remains **P0 / release-blocking / go-live-blocking**.
No commit, local test, missing introducing object, or zero-count fork snapshot
may be used to promote the finding to `resolved` or `Verified`.

## Traceability completeness

The source-ID column covers all detailed audit registers: `FE-001`-`FE-009`
plus `FE-ENV-001`; `UX-001`-`UX-011`; `BE-001`-`BE-012`;
`DB-001`-`DB-014`; `INT-001`-`INT-014`; `SEC-001`-`SEC-013`;
`QA-001`-`QA-007`; `OPS-001`-`OPS-012`; `SRE-001`-`SRE-010`; and
`GOV-001`-`GOV-017`.

No source finding has been deleted or marked resolved by this normalization.

<!-- markdownlint-enable MD013 -->
