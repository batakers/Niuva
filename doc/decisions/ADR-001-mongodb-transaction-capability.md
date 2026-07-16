# ADR-001 — MongoDB Transaction Capability

Status: Technical Design Candidate — not approved
Decision ID: `DEC-DATA-01`
Decision owner: Backend / Platform technical owner — Not assigned
Technical approver: Not recorded
Decision date: Pending
Related baseline: `doc/PRD_Platform_Niuva_v2_1_retail_b2b.md`
Decision log: `doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md`

## Context

Niuva menggunakan MongoDB dan membutuhkan atomicity untuk operasi yang menyentuh lebih dari satu collection. Baseline platform masih membahas MongoDB standalone dengan single-document atomic update dan idempotent workflow, sementara catalog/inventory dan Retail checkout candidate memerlukan transaction capability untuk menjaga balance, movement, reservation, publication pointer, order, dan reservation tetap konsisten.

ADR ini menjadi central technical decision record sebelum wording transaction capability dipropagasikan ke PRD, PRODUCT, AGENTS, unified design, atau catalog spec. ADR ini tidak memberi approval implementasi.

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

## Recommended Baseline

**Option A — Replica-set multi-document transaction** direkomendasikan untuk operasi lintas collection. Rekomendasi ini belum disetujui dan tidak boleh diperlakukan sebagai final technical authority sebelum ADR direview serta memiliki technical approver dan decision date.

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

- **Technical approver:** Not recorded
- **Decision date:** Pending
- **Approval source:** Not recorded
- **Final decision:** Pending review; recommendation is not approved.
