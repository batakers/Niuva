# File Security and Storage Current-Main Audit Task Card

<!-- markdownlint-disable MD013 -->

**Lane:** Readiness.

**Branch/worktree:** `audit/backend-file-storage-current-main` /
`Niuva-worktrees/backend-file-storage-current-main`.

**Stacked base:** `audit/backend-commerce-lifecycle` at `24b7221` so tracker
edits remain ordered behind PR #248. The audited runtime baseline is
`origin/main` at `15b759a`.

## Brief

| Field | Contract |
| --- | --- |
| Title and user outcome | Revalidate current-main file authorization, validation, local storage compensation, compatibility access, and historical payment-proof custody without enabling production upload. |
| In scope | Object-scoped authorization; customer ownership and internal domain permissions; MIME/signature checks; bounded streaming and maximum size; deleted/quarantined/pending/unpublished behavior; metadata/object compensation including uncertain commits; opaque object and logical-path compatibility routes; historical payment-proof read-only custody. |
| Out of scope | Production provider selection or adapter implementation; malware scanner/provider; retention, quota, legal hold, hard delete; historical reconciliation execution; migration; credentials; deployment; production-readiness approval; upload/payment activation; go-live. |
| Authority | `ADR-002`/`DEC-STOR-01`; `DEC-ACCESS-002/003`; `DEC-PAY-02`; Master Spec; Feature 2.3/2.4 merged contracts; current runtime and tests. |
| Affected areas | Read-only source/test/route inspection; bounded regression only for an objective uncovered control gap; audit packet and primary readiness trackers. |
| Contract/dependency | Local filesystem stays development/demo-only; production objects remain private and provider-blocked; database metadata is authoritative for ownership/domain/status; unauthorized and unsafe objects fail closed; historical proofs are read-only and never projected as raw storage paths. |
| Done when | Every requested boundary has source and negative-test evidence; payment-proof custody and compatibility behavior are explicit; gaps are classified without inventing provider policy; focused/full tests and exact-head CI pass; trackers link the packet. |
| Verification | Focused storage/file/legacy-order/RBAC pytest matrix; route and consumer inventory; signature/streaming/compensation negative cases; critical lint; `git diff --check`; exact-head CI. |
| Owner and verifier | Codex is Driver; repository storage/security owner is the required independent verifier before merge or any provider/production change. |
| Commit/push/PR permitted | Yes, explicitly requested by the user on 14 August 2026. |
| Risks/open decisions | Provider, scanner, retention/quota, RPO/RTO, backup/restore, ownership, historical reconciliation, multi-instance consistency, and production activation remain decision/environment blocked. |

## Required negative cases

- Cross-owner customer access and internal access without the file domain's
  permission fail without revealing object existence.
- Path traversal, absolute/null-byte keys, unsupported or mismatched MIME and
  signature, invalid declared sizes, oversized streams, and client-supplied
  security metadata are rejected before an unsafe release.
- Deleted, quarantined, pending, unknown, inconsistent, and unpublished
  objects are not downloaded through opaque, logical-path, or public-media
  routes.
- Metadata failure after a local object write compensates safely; an unknown
  metadata commit is resolved by stable object identity before deletion and
  never destroys a possibly committed object.
- Query-string tokens do not authenticate file access. Historical payment
  proof remains owner/permission-scoped, customer-safe, and read-only; upload
  and verification stay disabled.

## Rollback and handover

This task changes audit evidence and trackers only unless a reproducible
repository defect requires a separately visible bounded correction.
Documentation rollback is a normal revert. Any provider, malware, retention,
quota, backup/restore, historical-data, migration, deployment, or activation
work requires separate approval and operational evidence.

<!-- markdownlint-enable MD013 -->
