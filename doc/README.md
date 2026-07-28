# Legacy `doc/` Documentation Index

Status: Compatibility, runbook, historical, and reference paths.

This directory is retained for stable repository, test, audit, and historical
references. A document in `doc/` does not independently set product,
implementation, provider, production-readiness, or go-live authority.

Read the canonical sources in this order before using an item here:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. The applicable approved decision or ADR
5. The applicable runbook, current source, and tests

## Compatibility pointers

The following files retain legacy paths only. Follow their destination into
`docs/`; the destination and the Document Register determine their status.

- `APPROVAL_Platform_Niuva_v2_1_retail_b2b.md`
- `BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md`
- `BRD_Website_Niuva.md`
- `CATALOG_MATERIAL_INVENTORY_RUNBOOK.md`
- `PRD_Platform_Niuva_v2_1_retail_b2b.md`
- `PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md`
- `PRS_Website_Niuva.md`
- `IDENTITY_RBAC_AUDIT_RUNBOOK.md`
- `decisions/ADR-001-mongodb-transaction-capability.md`
- `decisions/ADR-002-production-file-storage-architecture.md`
- `decisions/ADR-003-retail-payment-orchestration-boundary.md`
- `decisions/DECISION_LOG_Platform_Niuva_v2_1.md`

## Runbooks retained at this path

| Document | Status and safe use |
| --- | --- |
| `PRODUCTION_DEPLOYMENT.md` | Provider-neutral release and rollback procedure. It does not select a provider or authorize go-live. |
| `BROWSER_VERIFICATION_RUNBOOK.md` | Manual Admin Studio browser-verification procedure. A completed checklist requires current environment and account evidence. |
| `MIGRATION_BACKUP_RESTORE_RUNBOOK.md` | Backup, verify, restore, and comparison procedure. A backup is not accepted until the restore exercise is evidenced. |
| `ROLLOUT_AND_HANDOVER_RUNBOOK.md` | Staging smoke, canary, post-deploy, and handover procedure. Execution requires explicit approval and environment evidence. |
| `TRANSACTION_CAPABILITY_RUNBOOK.md` | Local and CI transaction-topology procedure only. It does not authorize production topology or mutation enablement. |

## Historical records

| Document | Status and safe use |
| --- | --- |
| `brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md` | Context Only. A 13 July 2026 planning record that predates the Unified Homepage decision; it is not an active implementation task. |
| `DELETED_BRANCHES_20260727.md` | Context Only. Branch-recovery provenance only; it does not authorize restoring or deleting branches. |

## Supporting references

- `brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf` is retained as a legacy reference
  path. The registered brand reference is
  `docs/references/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf`.
- `Company profile PT Niuva_compressed.pdf` is retained as a legacy reference
  path. The registered company reference is
  `docs/references/company/Company profile PT Niuva_compressed.pdf`.

Do not move or delete these files solely to simplify the directory. Historical
plans, audits, source tests, and external references may rely on their paths.
