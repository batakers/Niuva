# ADR-001 — MongoDB Transaction Capability

Status: Approved Baseline
Decision ID: `DEC-DATA-01`
Decision owner: Project Manager / Product Owner
Technical approver: Acting Technical Owner
Operations acknowledgement: Acting Operations Owner
Decision date: 16 July 2026
Approval source: Role-based internal project approval recorded by the Project Manager / Product Owner through the Niuva platform governance process.
Recorded by: Project documentation owner
Approval scope: Internal architecture direction, documentation, and future implementation planning.
Related baseline: `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md`
Decision log: `docs/decisions/product/DECISION_LOG_Platform_Niuva_v2_1.md`

## Context

Niuva menggunakan MongoDB dan membutuhkan atomicity untuk operasi yang menyentuh lebih dari satu collection. Baseline platform masih membahas MongoDB standalone dengan single-document atomic update dan idempotent workflow, sementara catalog/inventory dan Retail checkout candidate memerlukan transaction capability untuk menjaga balance, movement, reservation, publication pointer, order, dan reservation tetap konsisten.

ADR ini menjadi central technical decision record sebelum wording transaction capability dipropagasikan ke PRD, PRODUCT, AGENTS, unified design, atau catalog spec. Approval ini terbatas pada internal architecture direction dan future implementation planning; approval ini bukan production authorization, infrastructure procurement approval, atau production go-live approval.

## Decision Question

Bagaimana environment Niuva menjamin atomicity untuk operasi lintas collection tanpa silent fallback ke non-atomic writes?

## Options

### Option A — Replica-set multi-document transaction

Gunakan MongoDB replica set untuk setiap environment yang menerima mutation transaction. Local development dapat memakai single-node replica set. Transaction capability diverifikasi melalui startup/readiness preflight.

### Option B — Single-document redesign

Redesign aggregate agar order, reservation, dan balance yang terkait dapat ditulis dalam satu document atau bounded single-document operation. Perubahan ini memerlukan review ulang terhadap inventory ledger, publication snapshot, legacy compatibility, query shape, dan ukuran document.

### Option C — Saga/compensation

Gunakan beberapa writes dengan idempotent workflow, compensation, reconciliation, dan recovery state. Partial state dianggap mungkin dan harus dipulihkan secara eksplisit.

## Affected Operations

Operations yang dipengaruhi keputusan ini:

- Catalog publication snapshot dan active-publication pointer.
- Inventory balance, immutable stock movement, dan reservation lifecycle.
- Multi-line Retail checkout yang membuat order dan seluruh reservation.
- Reservation release/consume/expire yang memperbarui beberapa record.
- Payment/order transitions bila perubahan tersebut menyentuh reservation atau reconciliation record.
- Migration/index rollout yang membutuhkan consistency check setelah deployment.

Read-only catalog projection, ordinary single-document reads, dan operasi yang dapat dibuktikan single-document atomic tidak otomatis membutuhkan multi-document transaction.

## Environment Requirements

| Environment | Requirement sebelum mutation enablement |
|---|---|
| Local development | Single-node replica set untuk transaction tests dan mutation flows; standalone hanya read-only/safe single-document mode |
| CI | Isolated MongoDB replica set untuk integration/concurrency tests |
| Staging | Replica set, capability preflight, backup, dan rollback verification |
| Production | Replica set dengan persistence, monitoring, backup/restore, readiness gate, dan incident owner |

## Fail-Closed Behavior

Jika operation membutuhkan transaction tetapi capability tidak tersedia:

- request mutation ditolak dengan controlled `503 transaction_unavailable`;
- tidak ada fallback diam-diam ke non-atomic write;
- tidak ada partial order, reservation, movement, atau publication pointer yang boleh dianggap berhasil;
- readiness/observability harus mencatat capability failure tanpa membocorkan secret atau data customer;
- read-only/public safe projection dapat tetap berjalan bila boundary-nya tidak memerlukan mutation transaction.

## Approved Architecture Direction

**Option A — Replica-set multi-document transaction** disetujui sebagai internal architecture direction untuk operasi lintas collection. Exact implementation modules, deployment topology details, readiness implementation, monitoring implementation, dan production infrastructure authorization tetap open.

## Migration and Deployment Impact

- Tambahkan capability preflight sebelum mutation flags diaktifkan.
- Sediakan isolated replica-set test environment sebelum integration/concurrency test dianggap valid.
- Deployment topology dan connection configuration harus menyatakan replica-set requirement tanpa menulis credential.
- Existing standalone deployment tidak boleh menerima checkout/reservation/catalog-publication mutation sampai capability tersedia.
- Tidak ada destructive migration yang tersirat oleh ADR ini.
- Rollout harus memiliki backup verification, dry-run bila ada index/migration change, controlled `503`, feature-flag rollback, dan post-deploy consistency checks.
- Jika Option B atau C dipilih, catalog/inventory/checkout design harus direview ulang sebelum implementasi.

## Consequences

### Positif

- Atomicity lintas collection lebih kuat.
- Overselling dan partial order/reservation lebih mudah ditolak.
- Failure behavior dapat diprediksi dan diuji.

### Trade-off

- Environment setup menjadi lebih ketat.
- Local/CI deployment tidak dapat bergantung pada standalone biasa untuk mutation tests.
- Operational monitoring, backup, dan readiness checks menjadi release prerequisites.

## Approval Record

- **Decision owner:** Project Manager / Product Owner
- **Technical approver:** Acting Technical Owner
- **Operations acknowledgement:** Acting Operations Owner
- **Decision date:** 16 July 2026
- **Approval source:** Role-based internal project approval recorded by the Project Manager / Product Owner through the Niuva platform governance process.
- **Recorded by:** Project documentation owner
- **Approval scope:** Internal architecture, documentation, and future implementation planning.
- **Excluded from this approval:** Company-wide production authorization, infrastructure procurement approval, Finance operational sign-off, payment gateway activation approval, and production go-live approval.
- **Final decision:** Approved Baseline.
