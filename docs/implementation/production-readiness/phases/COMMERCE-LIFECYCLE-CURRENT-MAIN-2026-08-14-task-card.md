# Commerce Lifecycle Current-Main Audit Task Card

<!-- markdownlint-disable MD013 -->

**Lane:** Readiness.

**Branch/worktree:** `audit/backend-commerce-lifecycle` /
`Niuva-worktrees/backend-commerce-lifecycle`.

**Stacked base:** `audit/backend-api-contract-current-main` at `747f3d6` so
tracker edits remain ordered behind PR #247. The audited runtime baseline is
`origin/main` at `15b759a`.

## Brief

| Field | Contract |
| --- | --- |
| Title and user outcome | Revalidate current-main commerce integrity from Inquiry through Quote, Project Conversion, Work Order, and the inactive Retail 3.4A contract. |
| In scope | Inquiry intake/conversion; immutable Quote versions and exact Quote-line identity; per-line quantity caps and price snapshots; Project conversion and customer/organization query scoping; Work Order allocation, QC, shortage recovery, concurrency, and audit history; Retail request fingerprints, replay/conflict behavior, state machine, fulfilment rules, and route lockdown. |
| Out of scope | Payment orchestration, payment intent, provider/webhook work, refund, reconciliation, shipping, capability activation, migration/reconciliation execution, deployment, production-readiness approval, and go-live. |
| Authority | Master Spec; `ADR-001`; `ADR-003`/`DEC-PAY-02`; `DEC-DATA-002`; granular access decisions; Feature 4.1–4.4 and 3.4A bounded contracts. |
| Affected areas | Read-only source/test inspection; bounded regressions only for an objective uncovered integrity gap; audit packet and primary readiness trackers. |
| Contract/dependency | Historical Quote lines are never inferred; accepted commercial snapshots remain immutable; transaction-required commands fail closed; customer/organization reads remain scoped; Retail create/transition/payment remain inactive. |
| Done when | Each lifecycle boundary has source and test evidence, negative/concurrency cases are classified, inactive Retail routes are proven, gaps are explicit, proportional tests and exact-head CI pass, and trackers link the packet. |
| Verification | Focused Inquiry/Quote/Project/Work Order/Retail pytest matrix; real transaction test only when an isolated replica-set target is available; route-capability inspection; critical lint; `git diff --check`; exact-head CI. |
| Owner and verifier | Codex is Driver; repository commerce/data owner is the required independent verifier before merge or any later activation. |
| Commit/push/PR permitted | Yes, explicitly requested by the user on 14 August 2026. |
| Risks/open decisions | DR-010 organization-portal policy and every payment/provider/production gate remain outside this audit; repository tests do not constitute shared-environment or production evidence. |

## Required negative cases

- Ambiguous or missing historical Quote-line identity blocks dependent
  mutation and is never heuristically repaired.
- Changed reuse of an operation ID/request fingerprint conflicts; exact replay
  cannot duplicate Quote, Project, Work Order, Retail aggregate, allocation,
  QC, shortage-recovery, or history effects.
- Work Order quantity cannot exceed the accepted Quote-line cap, and stale
  concurrent commands cannot both succeed.
- Customer/project/organization reads cannot cross their authorized scope or
  expose internal commercial fields.
- Retail create, transition, and payment routes remain unavailable; the pure
  contract cannot activate inventory, reservation, payment, shipping, or a
  provider adapter.

## Rollback and handover

This task changes audit evidence and trackers only unless a reproducible
repository defect requires a separately visible bounded correction.
Documentation rollback is a normal revert. Any activation, migration,
historical reconciliation, payment/provider work, external execution, or
production change requires separate authority, review, and rollback evidence.

<!-- markdownlint-enable MD013 -->
