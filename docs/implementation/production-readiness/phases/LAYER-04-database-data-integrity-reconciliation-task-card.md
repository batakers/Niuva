# Layer 04 Database and Data Integrity Reconciliation Task Card

Status: **validation complete — markdownlint and independent review passed;
implementation and environment validation remain gated**

<!-- markdownlint-disable MD013 -->
<!-- Evidence tables keep each finding in one comparable row. -->
| Field | Task brief |
| --- | --- |
| Title and user outcome | Reconcile Layer 04 database/data-integrity findings against the narrowed Niuva MVP, current canonical authority, and current `origin/main` source/tests so backend and security planning receive a truthful current-state input. |
| In scope | Read-only review of `DB-001` through `DB-014`, current collections/indexes/transactions/migrations/backup utilities and tests, and creation of one current-SHA reconciliation report. |
| Out of scope | Application or test implementation, schema/index/data mutation, database connection, migration dry-run/apply/rollback, backup/restore execution, dependency/configuration/secret changes, provider selection, deployment, production-readiness or go-live claims. |
| Authority | `docs/NIUVA_MASTER_SPEC.md`; `docs/context/DOCUMENT_REGISTER.md`; `docs/decisions/DECISION_REGISTER.md`; applicable approved data, access, transaction, Retail lifecycle, inventory, pricing, fulfillment, and after-sales decisions/ADRs; applicable runbooks; then current source/tests. |
| Affected areas | Historical audit evidence in `docs/context/production-readiness-audit/layers/04-database-data-integrity.md`; current planning output under `docs/implementation/production-readiness/`; backend data/domain/migration/test paths as read-only evidence. |
| Contract or dependency | Prototype status and candidate route evidence are outside Layer 04. They neither grant database authority nor gate this reconciliation; only registered canonical decisions apply. Layer 04 output will feed Backend/API and Security/Auth/Privacy reconciliation. |
| Done when | Every `DB-001` through `DB-014` finding is mapped to the selected SHA, narrowed-MVP relevance, current evidence, one truthful disposition, unresolved decision/environment blockers, and an owner-facing next input without rewriting the historical audit. |
| Verification | Selected-SHA and ancestry check; explicit source/test path inventory; required-finding completeness check; no duplicate/missing finding IDs; link/path check; markdownlint on new documents; `git diff --check`; changed-path review. No database or migration command. |
| Owner and verifier | Driver: Codex under Faiz's authorization. Verifier: separate developer/reviewer required before any finding is promoted to resolved or any implementation task starts. |
| Commit/push/PR permitted? | No. Local documentation changes and a report only. |
| Risks or open decisions | Historical audit baseline is stale relative to current main; merged source/tests are bounded evidence, not production or live-data proof; provider/topology/retention/RPO-RTO/operational ownership may remain unresolved; candidate routes must not leak into database authority. |
<!-- markdownlint-enable MD013 -->

Selected baseline: `066527a73888fd3e668fe96596d379bba37d847a`
(`origin/main`, fetched 4 August 2026, Asia/Jakarta).

Branch / worktree:
`docs/reconcile-layer04-database-integrity` /
`C:\tmp\niuva-layer04-reconcile`.

Output:
`docs/implementation/production-readiness/LAYER-04-DATABASE-DATA-INTEGRITY-RECONCILIATION.md`.

Finding scope: `DB-001` through `DB-014`.

Global stop rule: stop before any command opens a database connection or
creates, mutates, renames, deletes, restores, or migrates data, indexes,
collections, markers, sessions, backups, or infrastructure.
