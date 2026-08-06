# Layer 04 — Database and Data Integrity Reconciliation

Status: **local reconciliation and independent review complete — implementation
and environment validation remain gated**

Selected baseline: `066527a73888fd3e668fe96596d379bba37d847a`
(`origin/main`, fetched 4 August 2026, Asia/Jakarta)

Task card:
[Layer 04 reconciliation task card][layer04-task-card]

[layer04-task-card]:
  phases/LAYER-04-database-data-integrity-reconciliation-task-card.md

Historical input:
[Layer 04 audit][layer04-audit]

[layer04-audit]:
  ../../context/production-readiness-audit/layers/04-database-data-integrity.md
at `3eccbd6c00e8f505792588e73e3339332f12ff32` (the selected audit snapshot;
introduced at `ddf418cec2e4ce1105715d0f77a15564ce2d3ffb`).

## Outcome

The narrowed MVP does not make any of `DB-001` through `DB-014` disappear.
Retail checkout, payment, inventory reservation, authenticated ownership,
production tracking, notifications, and B2B partnership/Quote/Project history
still depend on correct transactional and historical data. Removed or deferred
screens also do not authorize deleting their records.

The current source closes four original source-code causes. Three findings have
meaningful hardening but still need bounded revalidation. Five findings remain
unsafe or decision-blocked, and two cannot be evaluated without an approved
isolated MongoDB environment.

<!-- markdownlint-disable MD013 -->
<!-- Evidence tables keep each finding in one comparable row. -->
| Primary disposition | Findings | Meaning |
| --- | --- | --- |
| `resolved_in_source` | `DB-001`, `DB-002`, `DB-003`, `DB-004` | The original source cause is no longer present at the selected SHA. This is not proof about historical/shared/production data. |
| `partial_requires_revalidation` | `DB-008`, `DB-011`, `DB-013` | Source controls improved, but the original acceptance boundary is not fully evidenced. |
| `still_applicable` or `blocked_by_decision` | `DB-005`, `DB-006`, `DB-007`, `DB-009`, `DB-010` | Do not execute the affected migrations. Their preservation, partial-failure, authority, or rollback gaps remain material. |
| `environment_blocked` | `DB-012`, `DB-014` | Repository evidence cannot prove restore safety, live schema/index state, or runtime topology. |
<!-- markdownlint-enable MD013 -->

`resolved_in_source` is deliberately bounded. It does not mean a migration was
run, a shared database was inspected, a production gate passed, or a finding
may be removed from historical evidence.

## Authority and method

The reconciliation follows this order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. the Document and Decision Registers;
3. approved transaction, data, access, Retail, inventory, and B2B decisions;
4. applicable runbooks;
5. current source and tests at the selected SHA; and
6. historical audit/readiness documents as supporting evidence only.

No database connection, migration command, backup/restore command, schema or
index mutation, application/test implementation, provider decision, or
deployment action was performed. Tests are inventoried as source evidence;
the live-data conclusions remain blocked where an approved target is required.

## Finding reconciliation

<!-- markdownlint-disable MD013 -->
<!-- Evidence tables keep each finding in one comparable row. -->
| Finding | Current disposition | Current evidence and narrowed-MVP impact | Residual gate / next owner input |
| --- | --- | --- | --- |
| `DB-001` — incompatible notification writers | `resolved_in_source`; live-data revalidation pending | `backend/emailer.py` is delivery-only and no longer persists feed records. `backend/notification_service.py` owns the recipient-scoped canonical notification/outbox shape; `notification_schema_report.py` classifies legacy/mixed records without rewriting them; `notification_retention.py` implements the approved 180-day notification and 30-day terminal-outbox boundary behind explicit guarded cleanup. Notifications remain part of Retail and operator MVP. | Backend must preserve one writer and fail-closed schema/report behavior. Security must review safe payloads and retention. A named isolated report, historical transition decision, cleanup approval, scheduler/owner, and production evidence remain separate. |
| `DB-002` — non-atomic password recovery | `resolved_in_source`; migration/production revalidation pending | `backend/auth_recovery.py` runs issue/completion through the shared transaction guard. Completion binds token claim, password/token-version change, sibling invalidation, and session revocation to one transaction; focused, replay/concurrency, rollback, unavailable-transaction, and opt-in replica-set tests exist. Authentication is still required for Retail checkout. | Security owns recovery privacy, delivery, timing, and session policy. Migration `008`, selected-target indexes, traffic drain, isolated rehearsal, deployment, and production proof remain gated. |
| `DB-003` — direct transaction owners outside the shared guard | `resolved_in_source`; broader command/environment revalidation pending | Catalog, content, and inventory mutations now call the shared guard; direct `start_transaction()` is no longer present in those services. The shared executor provides fail-closed capability handling and retry/unknown-commit behavior, with focused and opt-in real transaction tests. This remains essential for price/configuration, stock reservation, publication, and order integrity. | Backend must keep every cross-collection mutation on the shared executor and finish per-command idempotency/fingerprint review. Runtime replica-set/topology and failure evidence remain environment work; no non-atomic fallback is permitted. |
| `DB-004` — ambiguous Quote-line references | `resolved_in_source`; historical-data execution pending | B2B Quote versions use immutable `quote_line_id`; Projects and Work Orders retain the accepted version and exact line. `quote_line_reconciliation_report.py` reports duplicate, missing, orphaned, mismatched, and overcommitted references without inferring a repair. Partnership and quotation work remain in narrowed scope. | Backend must preserve immutable exact references. Any historical report run, reviewed mapping, migration, or repair needs a separately approved isolated target and must preserve ambiguous rows read-only. |
| `DB-005` — Migration `005` conflicts with retained collections | `blocked_by_decision`; **do not execute** | `005_archive_orphan_collections.py` still renames `organizations` and `organization_memberships`. Canonical authority preserves those records, and current B2B/partnership scope still relies on a distinct organization/Quote/Project lifecycle. UI reduction is not data-retirement authority. | Product/data owner must make an explicit retention/retirement decision after a dependency inventory. Backend and Security must treat existing records as preserved. No rename, archive, or cleanup is authorized. |
| `DB-006` — Migration `001` non-atomic/no rollback | `still_applicable`; **do not execute** | Migration `001` is unchanged: per-user writes, stale `admin`/default-customer mapping, indexes after writes, no migration-owned backup, marker, bounded batch, or rollback. Later identity migrations do not make this historical runner safe. | Security/identity owner must decide whether to formally retire/supersede the runner or design a new bounded reconciliation. Never infer current roles from its legacy mapping. Backup/restore and current-policy compatibility are required before any future proposal. |
| `DB-007` — Migration `002` partial/large apply risk | `still_applicable`; decision and environment blocked | It now has deterministic SKU and unique-index preflight, but still loads at most 100,000 materials, updates one record at a time, creates indexes after writes, and has no checkpointed rollback. Material/catalog/inventory data is a critical dependency for automatic pricing and stock management. | Database/backend owner must specify batch/window, reference validation, backup/restore, second-run, and partial-failure recovery on one isolated target. Any collision, missing key, index mismatch, or target ambiguity is a stop. |
| `DB-008` — Migration `003` incomplete operational proof | `partial_requires_revalidation` | Guarded per-account transactions, constrained rollback, policy state, and focused tests remain useful. The selected-SHA change does not add full backup/checksum/restore evidence; indexes are still outside the per-account transaction and prior accounts can commit before a later failure. | Security/identity owner must supply exact Owner selection, aggregate dry run, target capability, applied-ID/result evidence, full restore rehearsal, and representative partial-failure/scale proof. |
| `DB-009` — Migration `004` non-repair-safe seed | `still_applicable`; **do not execute** | The seed is unchanged. Existing `(content_type, slug)` rows are skipped without equivalence checks; create and publish are separate calls. It is also incompatible with the current `ContentService`: construction omits the required guard, while create/publish omit required arguments such as `reason` and `expected_version`. The canonical unique index declared by later schema work does not repair partial state or authorize seed copy. | CMS/content owner must decide adoption versus preservation of existing slugs. Backend needs a current-contract runner, migration ownership markers, repair-safe state handling, collision checks, and rollback/restore tests before a new proposal. |
| `DB-010` — Migration `005` rename rollback gaps | `blocked_by_decision`; **do not execute** | The source remains unchanged: no destination-collision check, dependency proof, index manifest/recreation, multi-collection compensation, or executable rollback. It is also blocked by `DB-005` authority. | Same decision as `DB-005`, followed only if approved by collision-safe preflight, reference scan, index capture/recreation, exclusive window, and tested restore. |
| `DB-011` — Migration `006` backup/rollback too narrow | `partial_requires_revalidation` | The runner now rejects customer mappings, validates a reviewed bootstrap Owner, binds the Owner to backup, checks duplicate IDs, preserves Owner authority, and uses version/marker predicates to reject concurrent rollback. It still writes a local plain JSON field backup, creates indexes outside the transaction, and lacks full encrypted backup/checksum/restore and representative scale proof. | Security/identity owner must approve opaque mapping, encrypted custody, window, size floor, index preflight, full restore, and independent review. The source improvements do not authorize apply or rollback. |
| `DB-012` — backup utility is not a production restore procedure | `environment_blocked` | `migration_backup.py` preserves BSON types, digests snapshots, refuses overwrite, and compares restored content. It still materializes the whole database in memory, excludes index/options metadata, replaces collections without a transaction, can leave partial restore state, and drops later collections. | Operations/Security must choose backup ownership, encryption, RPO/RTO, writer isolation, streaming/scale behavior, index recreation, failure recovery, and evidence custody. Only a separately approved isolated restore rehearsal can move this status. |
| `DB-013` — incomplete uniqueness/references/retention | `partial_requires_revalidation` | `schema_manifest.py` now declares broad unique/query indexes for identity, Retail, B2B, CMS, files, notifications, and inventory; Quote-line integrity is closed in source; notification retention is guarded; auth/session migrations add more index/retention contracts. However the manifest depends on gated migrations `007`–`009`, Migration `010` is intentionally excluded, no live index state or collection-wide orphan report is proven, and retention/legal-hold ownership is incomplete outside bounded domains. | Backend supplies a collection/reference/index register and aggregate orphan checks. Security supplies per-domain retention/legal-hold/backup interaction. Operations later proves the exact manifest on an approved isolated target. |
| `DB-014` — live schema/topology evidence absent | `environment_blocked` | `schema_readiness.py` can read migration markers and compare required indexes, and opt-in replica-set tests exist. This reconciliation intentionally opened no database connection; actual collections, types, indexes, duplicates, or topology are therefore unknown. | Operations/database owner must name an isolated replica set, selected SHA, credentials owner, evidence window, and redaction/custody process before read-only probes. Shared/staging/production access remains separately authorized. |
<!-- markdownlint-enable MD013 -->

## Current data contract for Backend/API reconciliation

The Backend/API layer must take the following as fixed input unless a new
canonical decision changes it:

1. Retail Order and B2B Quote/Project are separate aggregates. Assisted Retail
   Offers also do not become B2B Quotes.
2. Cross-collection writes fail closed through the shared transaction executor;
   transaction loss never activates a non-atomic fallback.
3. Paid/accepted commercial values, file identity, configuration, Quote version,
   `quote_line_id`, customer ownership, and production history are immutable
   snapshots or append-only history, not live catalog lookups.
4. Command identity and idempotency must be bound to the exact actor, aggregate,
   payload/fingerprint, and expected version. `DB-003` source closure is not a
   claim that every command family has completed this review.
5. Canonical notification persistence belongs to `NotificationService`; email
   delivery must not create another feed schema. Legacy rows are classified and
   preserved until a separate transition is approved.
6. Automatic pricing, checkout reservation, stock reservation/release, payment
   transition, production milestones, and after-sales transitions must retain
   their own exact atomic and ownership boundaries.
7. No legacy migration in this report is executable merely because its file is
   present or a dry-run/test exists.

## Current data contract for Security/Auth/Privacy reconciliation

The Security layer receives these non-negotiable inputs:

1. Password recovery completion remains one fail-closed transaction and must
   revoke applicable sessions without exposing raw reset tokens, hashes, or
   internal error detail.
2. Customer/API projections exclude internal cost, margin, supplier, profit,
   internal notes, security fields, and cross-customer records at query and
   serializer boundaries.
3. Authentication/session/recovery indexes and retention are selected-schema
   concerns. Migrations `008`–`010`, TTL/index activation, cleanup, and rollout
   require their own exact target and authorization.
4. General notification retention is 180 days and terminal outbox delivery
   metadata retention is 30 days under `DEC-DATA-003`; ambiguous/legacy records
   are not silently deleted. Other retention/legal-hold periods remain governed
   by their own decisions or unresolved ownership.
5. Backup artifacts, migration mappings, and reconciliation evidence may contain
   sensitive data. They require encryption, least privilege, redacted aggregate
   reporting, integrity checks, custody, and approved destruction/retention.
6. Organization, membership, historical commercial, file, payment-proof, and
   audit records remain preserved unless a later decision explicitly authorizes
   a non-destructive transition.

## Safe parallel follow-up boundary

After reviewer acceptance of this reconciliation, planning may proceed in
parallel without sharing mutable files:

- Backend/API: map the fixed transaction, ownership, snapshot, idempotency, and
  reference contracts to handlers/services/tests. No migration execution.
- Security/Auth/Privacy: reconcile recovery/session projection, retention,
  sensitive evidence, and authorization controls. No TTL/index activation or
  cleanup execution.
- Database/Operations planning: prepare the decision packet for one named
  isolated target, migration/restore ownership, RPO/RTO, evidence custody, and
  per-migration stop rules. No connection or mutation until separately approved.

Schema/migration files and shared API/data contracts remain single-owner work.
The three streams may not independently change the same collection contract,
index manifest, transaction boundary, or migration ledger.

## Verification and handoff

The reproducible lint command for this packet is pinned and transient.
It does not add a project dependency or repository configuration.

```powershell
Set-Location docs/implementation/production-readiness
npx --yes --package markdownlint-cli2@0.23.2 markdownlint-cli2 `
  "LAYER-04-DATABASE-DATA-INTEGRITY-RECONCILIATION.md" `
  "phases/LAYER-04-database-data-integrity-reconciliation-task-card.md"
```

Result: `markdownlint-cli2 v0.23.2` (`markdownlint v0.41.1`),
`0 issues in 0 files`. MD013 is scoped only to the evidence tables; other
rules remain enabled.

This packet reconciles all IDs `DB-001` through `DB-014` exactly once.
Historical audit text is intentionally unchanged. Existing readiness trackers
that still describe the pre-remediation `DB-001`, `DB-002`, or `DB-003` source state
should be updated only in a later explicit tracker-reconciliation task after
review; historical findings must remain traceable.

No readiness score is recalculated. Layer 04 is
**documentation-reconciled**, not database-ready, migration-ready,
production-ready, or go-live-ready.

Local read-only validation on 4 August 2026 passed the selected-SHA,
source/test, completeness, link/path, whitespace, diff, and markdownlint
checks for this documentation packet. The pinned markdownlint command
reported zero issues.
An independent read-only review on 4 August 2026 found no P0, P1, or P2
documentation defects at the selected SHA. Its limitations remain static
source/test evidence only; no test execution, database, live-schema,
index/topology, migration, or restore access. The acceptance does not
authorize implementation, database or migration execution, commit, push, pull
request, deployment, production readiness, or go-live.
