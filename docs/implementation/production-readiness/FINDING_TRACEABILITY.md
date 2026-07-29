# Niuva Production-Readiness Finding Traceability

Status: Planning and Progress Context — Not Implementation Authority Unless Explicitly Approved

Audit source baseline: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
Normalization source: Layer 01-11 audit registers, especially
`layers/11-production-readiness-summary.md`.

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
| `auth_*`, password policy, identity routes, sessions, and their backend/frontend tests | Admin session, MFA, and access-review boundary; Recovery, password, bootstrap, and secret atomicity; Distributed abuse protection; Admin identity, permission, and selector parity | Revalidate on the selected SHA with the approved auth/access decisions, browser/session evidence, and real replica-set negative paths where required. Open topology, MFA, and rollout decisions remain blocked. |
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
| NIV-001 credential incident | `SEC-001`, `OPS-010` | 06, 08 | Operational credential-incident closure has not been independently evidenced. `OPS-010 duplicate_of SEC-001`. | **P0** | `accepted_risk_approved_until_2026-08-30`; verified closure remains open | 90-99% | **Yes** | **Yes** | Before expiry, obtain incident closure evidence, a renewed accepted risk, or an explicit new disposition. | Credential owner, repo host admin, incident owner, independent verifier, NIV-001 runbook. |
| Admin session, MFA, and access-review boundary | `FE-002`, `INT-004`, `SEC-002`, `SEC-003`, `SEC-007` | 01, 05, 06 | Legacy Admin bearer/session behavior and incomplete internal access controls conflict with approved auth direction. | P1 | `requires_revalidation` on newer auth baseline | 94-100% | Yes | Yes | Session/MFA rollout scope and selected baseline. | DEC-AUTH-005/007; identity owner; migration/rollback; browser and replica-set tests. |
| Recovery, password, bootstrap, and secret atomicity | `FE-003`, `BE-008`, `DB-002`, `SEC-004`, `SEC-005`, `SEC-013` | 01, 03, 04, 06 | Legacy recovery/password writes were not one approved, atomic, secret-safe contract. | P1 | `requires_revalidation` on newer auth baseline | 93-100% | Yes | Yes | Confirm bounded recovery/password implementation and rollout gates. | DEC-AUTH-003/004; ADR-001; migration 007; isolated replica set; recovery runbook. |
| Distributed abuse protection | `SEC-006` | 06 | Process-local control has no selected distributed topology, threshold, proxy, outage, or retention contract. | P1 | `decision_resolved_implementation_open` | 100% | Yes for internet-facing auth | Yes | Provider/topology, thresholds, proxy trust, outage and retention owner. | DEC-AUTH-002/006; deployment topology; security owner. |
| File ownership, content validation, and storage boundary | `BE-007`, `INT-010`, `SEC-008`, `SRE-007` | 03, 05, 06, 09 | File flows are only partly object-scoped while production storage remains provider/operation blocked. | P1/P2 | partial / `blocked_by_decision` | 90-97% | Yes for a file-enabled release | Yes | Storage provider/operations only when production scope enters; object/retention policy. | ADR-002; object metadata; validation/quarantine; storage owner. |
| Legacy order integrity and customer-note privacy | `BE-005`, `SEC-009` | 03, 06 | Retained legacy order route/projection does not fully enforce integrity or customer-safe field boundaries. | P1 | `decision_resolved_implementation_open` / `requires_revalidation` | 94-100% | Yes for retained customer order routes | Yes | `DEC-ACCESS-003` records retained/read-only compatibility, customer-safe projection, and sunset policy; bounded source implementation and selected-SHA verification remain separate. | Customer-safe projection; legacy data preservation; direct access tests. |
| Transaction guard and idempotency consistency | `BE-002`, `DB-003`, `INT-009` | 03, 04, 05 | Direct transaction owners and command families have inconsistent fail-closed, retry, and replay behavior. | P1 | open / `requires_revalidation` | 90-92% | Yes | Yes | Guard-adoption and operation-policy implementation approval. | ADR-001; shared executor; real replica-set failure tests. |
| Quote-line identity, references, uniqueness, and retention | `BE-004`, `DB-004`, `DB-013` | 03, 04 | Exact immutable quote line and cross-collection referential invariants are not uniformly enforced. | P1 | open | 91-96% | Yes | Yes | Canonical `quote_line_id` and existing ambiguous-data policy. | Approved B2B quote/version policy; orphan report; retention owner. |
| Migration, live schema, backup, and restore safety | `DB-005`, `DB-006`, `DB-007`, `DB-008`, `DB-009`, `DB-010`, `DB-011`, `DB-012`, `DB-014`, `OPS-005`, `OPS-006`, `QA-004`, `GOV-013` | 04, 07, 08, 10 | Migration behavior, live schema evidence, serialization, backup/restore ownership, and rollback guarantees are uneven. | P1/P2 | open / `blocked_by_decision` / `environment_blocked`; newer auth migrations require revalidation | 87-100% | Yes for data-bearing release | Yes | Target, maintenance window, retention, RPO/RTO, restore and migration approval. | Named target; backup owner; migration ledger; replica-set; restore authority. |
| Notification schema, delivery, recipient projection, and audit privacy | `BE-009`, `DB-001`, `INT-008`, `SEC-010`, `SRE-003`, `SRE-008` | 03, 04, 05, 06, 09 | Competing notification writers and weak worker/recipient/audit contracts. | P1/P2 | `DEC-DATA-003` recorded / implementation and revalidation remain open | 92-100% | Yes where notifications are critical | Yes | General schema, retention, delivery boundary, and temporary alert owner are decided; security events remain under `DEC-AUTH-009`. | Legacy-shape/reference report; worker/lease and recipient-projection implementation; redaction/expiry tests; provider/scheduler/telemetry/SLA decisions. |
| Retail payment and fulfilment capability enforcement | `BE-003`, `INT-003` | 03, 05 | Legacy actions can cross the inactive production payment/fulfilment boundary. | P1 | open / `broken_contract` | 95-96% | Yes | Yes | Provider, state map, Finance/reconciliation only when authorized. | ADR-003; DEC-PAY-02; provider-neutral capability boundary. |
| Provider activation boundary | `OPS-008` | 08 | Storage/payment activation is intentionally deferred and cannot be inferred from code or plans. | P1 | `blocked_by_decision` | 99% | No for provider-free development scope | Yes | Storage/payment provider, Finance, RPO/RTO, production approval. | ADR-002; ADR-003; operations and Finance owners. |
| Unified Homepage, customer account, and Retail journey parity | `UX-001`, `INT-001`, `INT-002`, `INT-014` | 02, 05 | Public/customer route implementation does not cover the approved high-level journey; first Retail slice and detailed navigation remain open. | P1/P2 | open / `blocked_by_decision` / deferred | 95-98% | Yes only for promised Retail scope | Yes | First Retail slice, navigation/CTA treatment, customer auth, policy. | DEC-UX-001; Master Spec deferrals; separate vertical-slice authority. |
| B2B organization/customer portal parity | `INT-007` | 05 | B2B backend foundation has no approved customer consumer journey. | P1 | partial | 96% | Yes for full B2B customer scope | Yes | Portal scope, safe projection, approval/design contract. | B2B release sequence; organization access decisions; seeded test data. |
| Admin identity, permission, and selector parity | `FE-004`, `UX-005`, `INT-005`, `INT-006` | 01, 02, 05 | Frontend surface guard, identity UI, and pricing-permission composition do not fully reflect canonical role matrix. | P1/P2 | open / `broken_contract` | 93-96% | Yes for affected Admin roles | Yes | Role matrix/UI scope and implementation authorization. | DEC-ACCESS-002; role fixtures; backend deny tests. |
| CMS/Portfolio permission, concurrency, and orphan promotion | `BE-006`, `INT-013` | 03, 05 | Publication behavior and project-to-portfolio promotion lack a fully governed consumer/contract. | P1/P2 | partial / orphan | 90-91% | Yes for publish-enabled release | Yes | Portfolio semantics and manager-publish/reorder scope. | CMS lifecycle; content owner; transaction/concurrency policy. |
| Objective accessibility and factual-state defects | `UX-002`, `UX-003`, `UX-004`, `UX-007`, `UX-008`, `UX-010` | 02 | Controls violate contrast, focus, target-size, semantic state, validation association, or current factual content requirements. | P1/P2 | open | 88-97% | Yes for critical journeys | Yes | Content/privacy confirmation for factual text; normal bounded accessibility authorization. | Component owner; browser/AT environment; seeded state fixtures. |
| Surface direction and typography conflicts | `UX-006`, `UX-009`, `UX-011` | 02 | Current presentation conflicts with Admin/public design direction or crosses a documented visual rollout deferral. | P2/P3 | open | 67-90% | Conditional | Conditional | Brand/UX decision for any deferred visual rollout. | DEC-OPS-001; DEC-UX-002; brand owner. |
| API transport, validation, failure, and envelope | `FE-001`, `FE-005`, `FE-006`, `BE-001`, `INT-011` | 01, 03, 05 | Distributed assumptions about transport, invalid data, error state, retries, and list envelopes. | P1/P2 | open / `broken_contract` | 87-100% | Yes | Yes | Timeout/retry/idempotency policy and critical schema scope. | API governance; stable fixtures; UX state contract. |
| Release artifact, readiness, deployment, and network evidence | `FE-ENV-001`, `BE-012`, `INT-012`, `SEC-011`, `OPS-003`, `OPS-004`, `OPS-009`, `SRE-001` | 01, 03, 05, 06, 08, 09 | Required release/browser/service/deployment proof lacks a controlled topology and artifact contract. | P1/P2 | `environment_blocked` / open | 85-100% | Yes | Yes | Staging topology, origin, secret/evidence contract, TLS/proxy and readiness owner. | Environment owner; role fixtures; API topology; trusted proxy policy. |
| Observability, background lifecycle, timeout, and capacity | `OPS-007`, `SRE-002`, `SRE-004`, `SRE-005`, `SRE-009` | 08, 09 | No owned service objectives/telemetry plane; per-process background behavior and capacity limits are unproven. | P1/P2 | open / `environment_blocked` | 92-98% | Yes for release candidate | Yes | Telemetry/SLO/on-call, worker topology, budgets, rollback owner. | Metrics/tracing destination; capacity model; staging-like environment. |
| QA and release gates | `QA-001`, `QA-002`, `QA-003`, `QA-005`, `QA-006`, `QA-007`, `OPS-002` | 07, 08 | CI and test gates can omit critical suites or lack artifact, browser, security, quality, and parity signals. | P1/P2 | open / `environment_blocked` | 90-98% | Yes | Yes | Required-gate, threshold, CI service, and artifact/report ownership. | Seeded roles; public origin; supported browsers; isolated DB. |
| Package/runtime reproducibility | `OPS-001`, `GOV-001`, `GOV-002`, `GOV-005` | 08, 10 | Package manager, lockfile, backend dependency lock, and runtime versions are not one supported contract. | P1 | open | 91-99% | Yes | Yes | Supported package/runtime/lock strategy. | Release owner; CI matrix; backend dependency policy. |
| Dependency vulnerability and lifecycle risk | `SEC-012`, `GOV-003`, `GOV-004` | 06, 10 | Reported frontend advisory and deprecated/lifecycle risks need a compatible, owner-approved disposition. | P1/P2 | open / `requires_revalidation` | 93-100% | Yes until disposition | Yes | Upgrade, mitigation, accepted-risk owner and expiry. | Security owner; compatibility tests; dependency policy. |
| Governance, compatibility, and evidence provenance | `BE-011`, `OPS-011`, `OPS-012`, `GOV-008`, `GOV-009`, `GOV-011`, `GOV-012`, `GOV-014`, `GOV-015`, `GOV-016`, `GOV-017` | 03, 08, 10 | Unregistered/stale plans, documentation drift, weak ownership/versioning, and ambiguous generated evidence. | P1/P2 | open / `requires_revalidation` | 90-99% | Conditional; `GOV-014` is release-blocking | Yes | Documentation/release/dependency policy and named owners. | Registers; runbooks; CODEOWNERS/review policy; release record. |
| Maintainability, query, and frontend performance debt | `FE-007`, `FE-008`, `FE-009`, `BE-010`, `SRE-006`, `SRE-010`, `GOV-006`, `GOV-007`, `GOV-010` | 01, 03, 09, 10 | Unbounded modules/dependencies, query/pagination growth, and absent frontend performance/error budgets. | P2/P3 | open | 86-97% | Not alone | Conditional | Budget, data-growth, ownership, and bounded cleanup/refactor scope. | Performance targets; data model; test coverage; owner approval. |

## Evidence conflicts and resolution treatment

| Conflict | Treatment |
| --- | --- |
| Layer 03 header counts versus detailed `BE` register | Detailed register controls severity/status: 9 P1 and 3 P2. |
| Layer 05 header counts versus detailed `INT` register | Detailed register controls severity/status: 10 P1 and 4 P2. |
| Layer 04 earlier absence of real Mongo evidence versus Layer 07 later 45-pass replica-set suite | Later local evidence supersedes only the absence claim; it does not prove production topology, real-data migration, or operational restore. |
| Historical tracker / new default-branch commits versus scored audit snapshot | Preserve as revalidation candidates. Do not change finding to resolved without current verification. |
| Intentional deferral versus broken contract | A deferred Retail/provider surface is not a defect for provider-free development, but becomes release/go-live blocking if the selected production scope promises that journey/capability. |

## Traceability completeness

The source-ID column covers all detailed audit registers: `FE-001`-`FE-009`
plus `FE-ENV-001`; `UX-001`-`UX-011`; `BE-001`-`BE-012`;
`DB-001`-`DB-014`; `INT-001`-`INT-014`; `SEC-001`-`SEC-013`;
`QA-001`-`QA-007`; `OPS-001`-`OPS-012`; `SRE-001`-`SRE-010`; and
`GOV-001`-`GOV-017`.

No source finding has been deleted or marked resolved by this normalization.
