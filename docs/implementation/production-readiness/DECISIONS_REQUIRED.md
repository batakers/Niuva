# Niuva Production-Readiness Decisions Required

Status: Planning and Progress Context — Not Implementation Authority Unless Explicitly Approved

This register separates human decisions from implementation tasks and environment
proof. A row is not an approval request by itself, and no decision below is
treated as made merely because source code, a branch, or an audit
recommendation exists.

## Decision queue

| ID | Decision required | Why it is needed | Blocks | Authority / evidence to use | Required owner and output | Current state |
| --- | --- | --- | --- | --- | --- | --- |
| DR-001 | Select one immutable release-candidate baseline. | The audit is exact for `c28684d`, while local `origin/main` is 13 commits / 45 paths newer. | All claims about current readiness; affected auth/migration planning. | Audit baseline, Layer 11 freshness analysis, Git ancestry/diff. | Project Owner selects SHA and scope; record a changed-path/revalidation matrix. | Open. |
| DR-002 | Close NIV-001 or approve a time-bound accepted risk. | The credential incident is the only P0 and has no verified closure package. | Release and go-live; any claim of security closure. | NIV-001 runbook and secret-safe independent verification. | Incident and credential owners, repository administrator, independent verifier; redacted outcome. | Open; `OPS-010 duplicate_of SEC-001`. |
| DR-003 | Confirm the bounded Admin auth recovery/session scope on the selected baseline. | Newer default-branch Phase 1/2 work is evidence of change, not closure of the audit snapshot. | Auth implementation planning and Phase 1 exit. | DEC-AUTH-003/004/005; recovery/session packets and runbooks; selected-SHA tests. | Security/identity owner; explicit included/excluded scope and rollout boundary. | Faiz approved the bounded selected-SHA revalidation scope on 2026-07-29: password recovery and Admin session only; excludes customer session, real email, shared/staging/production, Argon2-write enablement, migration application, deployment, activation, and go-live. This does not resolve remaining DR-004/005, rollout, or Phase 1 exit decisions. |
| DR-004 | Select distributed abuse-control topology, trusted-proxy policy, thresholds, outage behavior, and retention owner. | A provider-neutral interface is approved, but operational choices remain deferred. | Internet-facing authentication readiness. | DEC-AUTH-002 and DEC-AUTH-006. | Security/deployment owner; decision record with privacy and failure behavior. | Open. |
| DR-005 | Select MFA parameters, key/recovery operations, support ownership, and later passkey boundary. | Mandatory internal MFA direction is approved, but implementation choices remain open. | Internal production access readiness. | DEC-AUTH-007. | Security/identity owner; staged implementation and recovery plan. | Open. |
| DR-006 | Confirm quote-line identity and remediation policy for ambiguous historic data. | Duplicate quote variants cannot be resolved safely without an exact line identity. | B2B work-order integrity and migration planning. | Master Spec commercial-history rules; B2B audit evidence. | Product/data owner; immutable identifier and non-destructive migration policy. | Resolved by `DEC-DATA-002` on 29 July 2026: each Quote-version line has immutable `quote_line_id`; ambiguous history remains read-only; no automatic inference/backfill; later reconciliation requires separate approval and non-destructive safeguards. |
| DR-007 | Decide retained legacy order/API compatibility and customer-safe projection/sunset policy. | Existing legacy behavior has integrity/privacy gaps and cannot be silently removed. | Customer order remediation and API planning. | Master Spec privacy boundary; DEC-PAY-02; compatibility findings. | Product/access owner; retained/read-only/retire decision and rollback compatibility. | Open. |
| DR-008 | Decide canonical notification schema, historical-readability/retention, delivery model, and alert owner. | Competing writers and recipient/audit gaps cannot be fixed from code inference. | Notification migration, background reliability, privacy. | Notification, security-event, and data findings; DEC-AUTH-009 where applicable. | Product/data/operations owners; schema and retention decision. | Open. |
| DR-009 | Approve the first Retail vertical slice, detailed public navigation/CTA treatment, customer-auth scope, and applicable commercial policies. | Unified Homepage direction is approved, but detailed navigation and Retail slice remain deferred. | Retail/customer frontend and E2E journey work. | DEC-UX-001; Master Spec deferred decisions; candidate slice documents are not authority. | Product/UX owner; bounded slice authorization. | Open. |
| DR-010 | Approve B2B organization portal and CMS/Portfolio consumer scope. | Backend foundations do not themselves define a customer portal or portfolio-promotion consumer. | B2B/CMS integration parity. | Master Spec B2B/CMS rules; DEC-ACCESS-002; portfolio findings. | Product/content/access owners; safe projection and lifecycle scope. | Open. |
| DR-011 | Select storage/payment providers and Finance/reconciliation/retention operations only when production scope requires them. | Architecture approves provider-neutral boundaries, not activation. | File-enabled/payment-enabled production release and Phase 7/10. | ADR-002, ADR-003, DEC-PAY-02. | Product, Finance, storage/payment and operations owners; separate operational approval. | Deliberately open. |
| DR-012 | Assign topology, environment/secret evidence, RPO/RTO, backup/restore, migration, rollback, incident, release, and on-call ownership. | External operational controls are not present in the repository audit environment. | Phase 7, Phase 8, and Phase 10. | Deployment, transaction, recovery, and session runbooks; audit Layer 08/09. | Project Owner assigns accountable owners and approved evidence format. | Partially assigned 2026-07-29: Faiz owns migration, backup/restore, rollback, maintenance-window authority, and evidence custody. A local disposable `rs-test` replica set is verified for preflight only; it is not a shared/staging/production target. RPO/RTO, secret evidence, incident/release/on-call owners, and evidence format remain open. |
| DR-013 | Select supported package manager, Node/Python/runtime and lock strategy; set CI/release/artifact, vulnerability, license, review, and versioning policy. | Reproducibility and quality gates are not one enforceable contract. | Phase 6 release-quality gates. | Layer 07/10 evidence; deployment runbook; legal/security input. | Engineering/release/security owners; policy and enforcement acceptance. | Open. |
| DR-014 | Select telemetry destination, retention/access, SLO/error budgets, worker topology, capacity model, and performance thresholds. | Reliability cannot be proven without operating objectives and ownership. | Phase 8 and production-candidate verification. | Layer 09; DEC-AUTH-009 privacy constraints; deployment decision. | Operations/SRE/security owners; measurable objective and alert ownership. | Open. |
| DR-015 | Make production-readiness and go-live decisions separately after exact-candidate evidence exists. | Passing repository checks or a staging rehearsal cannot imply launch authority. | Production activation and public go-live. | Phase 10 verification, provider/Finance/operations evidence, explicit approval record. | Product, security, data, Finance, operations, and final approvers. | Not yet eligible. |

## Decisions that must not be inferred

The roadmap explicitly does **not** select or authorize:

- a payment gateway, storage provider, upload activation, Finance operation, or
  production provider event;
- a Retail route, CTA, checkout, tax, shipping, reservation, refund, return,
  customer-account, B2B portal, or surface topology;
- a distributed limiter store, MFA library/parameters, signing-key policy,
  customer-session migration, support channel, or auth-event storage owner;
- enabling `AUTH_ARGON2_WRITES_ENABLED`, shared/staging/production migration,
  deployment, history rewrite, credential use, production readiness, or
  go-live.

## Decision sequencing

1. **Now:** DR-001 and DR-002.
2. **Before data/auth implementation planning:** DR-003 through DR-008.
3. **Before customer-journey implementation planning:** DR-009 and DR-010.
4. **Before staging-like operations:** DR-011 through DR-014.
5. **Only after Phase 10 evidence:** DR-015.

Where a decision remains open, the correct roadmap status is
`blocked_by_decision`, not an invented implementation assumption.
