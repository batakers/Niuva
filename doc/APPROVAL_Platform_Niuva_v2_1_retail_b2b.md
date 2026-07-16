# Catatan Persetujuan Baseline Platform Niuva v2.1

Tanggal approval: 14 Juli 2026
Status: Approved Baseline untuk perencanaan implementasi

## Metadata Approval

- **Approval party recorded in the source:** Stakeholder
- **Approved by:** Not recorded
- **Approval source:** Not recorded
- **Recorded by:** Achmad Faiz Siregar
- **Approval date:** 14 July 2026
- **Approval record:** Dokumen Markdown ini, commit `bdcbd35140928082fcf6efb417308085372eb046`
- **Approval signature or ticket:** Not recorded

Catatan: `Recorded by` berasal dari metadata commit yang menyimpan approval record. Commit author tidak diperlakukan sebagai approver. Nama, role, dan approval source stakeholder belum tercatat.

## Status Vocabulary

- **Approved Baseline:** Dokumen disebut eksplisit dalam approval record dan scope approval-nya jelas.
- **Approved with Open Decisions:** Scope utama telah disetujui, tetapi keputusan yang tercantum masih menjadi gate.
- **Technical Design Candidate:** Kandidat desain teknis; belum disetujui untuk implementasi.
- **Historical Active Baseline:** Baseline lama yang tetap berlaku pada area yang belum digantikan, walaupun approval evidence historis tidak tercatat.
- **Active Implementation Guardrail:** Aturan aktif untuk coding agent, subordinate terhadap approved v2.1 requirements, tetapi bukan stakeholder-approved requirement yang berdiri sendiri.
- **Draft:** Belum memiliki approval atau authority aktif yang lebih kuat.
- **Superseded:** Digantikan dokumen yang lebih baru dan tidak digunakan untuk planning baru.

## Canonical Document Register

Only documents with Approved Baseline status are authoritative requirements for implementation planning. Candidate, open-decision, historical, guardrail, and superseded entries are listed for governance and traceability only.

| Source | Status | Canonical role | Approval / authority evidence |
|---|---|---|---|
| `doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md` | Approved Baseline | Business requirements v2.1 | Explicitly listed in this record |
| `doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md` | Approved Baseline | Product requirements scope v2.1 | Explicitly listed in this record |
| `doc/PRD_Platform_Niuva_v2_1_retail_b2b.md` | Approved Baseline | Detailed platform requirements v2.1 | Explicitly listed in this record |
| `docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md` | Approved Baseline | Approved unified platform design | Explicitly listed in this record |
| `PRODUCT.md` | Approved Baseline | Product purpose, locked decisions, and deferred decisions | Explicitly listed in this record |
| `AGENTS.md` | Approved Baseline | Platform implementation guardrails | Explicitly listed in this record |
| `doc/BRD_Website_Niuva.md` | Historical Active Baseline | Public brand, company, portfolio, and lead-generation requirements | Approval evidence not recorded |
| `doc/PRS_Website_Niuva.md` | Historical Active Baseline | Public v1 page, navigation, CTA, and scope baseline | Approval evidence not recorded |
| `AGENTS.brand-baseline-v1.md` | Active Implementation Guardrail | Public website and brand guardrails | Stakeholder approval not separately recorded |
| `doc/BRD_Platform_Niuva_v2_addendum.md` | Superseded | Historical v2 business requirements | Superseded by BRD v2.1 |
| `doc/PRS_Platform_Niuva_v2_addendum.md` | Superseded | Historical v2 product scope | Superseded by PRS v2.1 |
| `docs/superpowers/specs/2026-07-14-integrated-operations-marketplace-design.md` | Superseded | Historical integrated marketplace design | Superseded by unified Retail–B2B design |
| `doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md` | Active Decision Register | Business, operational, and technical decision index | Created by this governance pass; entries remain pending until approved |
| `doc/decisions/ADR-001-mongodb-transaction-capability.md` | Technical Design Candidate | Transaction-capability authority candidate | Not approved |
| `doc/decisions/ADR-002-production-file-storage-architecture.md` | Technical Design Candidate | Production persistent-storage authority candidate | Not approved |
| `doc/decisions/ADR-003-retail-payment-orchestration-boundary.md` | Technical Design Candidate | Provider-neutral Retail payment authority candidate | Not approved |

## Known Branch-Local Candidate Documents

The following documents are available only in the catalog worktree and are not part of the primary/integration branch register:

| Document | Branch | Availability | Authority |
|---|---|---|---|
| `docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md` | `design/catalog-material-inventory-foundation` | Not present on primary/integration branch | Does not apply to primary until reviewed and merged |
| `docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md` | `design/catalog-material-inventory-foundation` | Not present on primary/integration branch | Does not apply to primary until reviewed and merged |
| `docs/superpowers/specs/2026-07-16-retail-order-checkout-foundation-design.md` | `design/catalog-material-inventory-foundation` | Not present on primary/integration branch | Does not apply to primary until reviewed and merged |

## Dokumen yang Disetujui Secara Eksplisit

Stakeholder telah menyetujui baseline berikut sebagai dasar implementation planning:

1. `doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md`
2. `doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md`
3. `doc/PRD_Platform_Niuva_v2_1_retail_b2b.md`
4. `docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md`
5. `PRODUCT.md`
6. `AGENTS.md`

Catatan persetujuan ini menggantikan label `Draft untuk review stakeholder` atau `menunggu review dokumen` yang masih tertulis pada header dokumen v2.1 terkait. Isi dokumen tersebut menjadi baseline aktif kecuali diubah melalui keputusan stakeholder berikutnya.

## Scope Approval

Implementation planning yang dicakup record ini dibatasi pada **Foundation**:

- Identity, organization, role, permission, dan audit.
- CMS dan publish workflow foundation.
- Catalog foundation.
- Material price version, inventory movement, reservation, dan restock foundation.
- Shared order/project foundation.
- Migration compatibility, privacy boundary, testing, dan handover foundation.

Approval ini tidak mengubah status kandidat teknis yang dibuat setelah record ini dan tidak memberi approval otomatis untuk implementasi Retail MVP, B2B MVP, payment-provider integration, atau homepage-dependent UI.

## Keputusan dan Dokumen yang Tidak Termasuk Approval

Keputusan berikut tetap deferred dan tidak disetujui oleh record ini:

- Pola homepage: split gateway, unified homepage, atau retail-first.
- Provider payment gateway.
- Detail visual navigasi/switch Retail dan B2B.

Dokumen berikut tidak tercantum sebagai dokumen approved dalam record ini:

- `AGENTS.brand-baseline-v1.md` — tetap menjadi Active Implementation Guardrail.
- `docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md` — Approved with Open Decisions.
- `docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md` — Approved with Open Decisions untuk development/demo saja.
- `docs/superpowers/specs/2026-07-16-retail-order-checkout-foundation-design.md` — Technical Design Candidate.
- `doc/decisions/ADR-001-mongodb-transaction-capability.md` — Technical Design Candidate.
- `doc/decisions/ADR-002-production-file-storage-architecture.md` — Technical Design Candidate.
- `doc/decisions/ADR-003-retail-payment-orchestration-boundary.md` — Technical Design Candidate.

## Supersession Map

```text
doc/BRD_Platform_Niuva_v2_addendum.md
  → doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md

doc/PRS_Platform_Niuva_v2_addendum.md
  → doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md

docs/superpowers/specs/2026-07-14-integrated-operations-marketplace-design.md
  → docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md

Website v1 BRD/PRS
  → remain active for public brand, company, portfolio, and lead generation
  → approved v2.1 requirements win when conflicts exist
```

Historical documents remain preserved for traceability. Superseded documents must not be used for new planning.

## Central Decision Log

Unresolved business, operational, and technical decisions are indexed in:

`doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md`

The decision log is the index only. Technical authority belongs to an approved ADR when an ADR is referenced. A pending decision or candidate ADR does not propagate requirements into the approved baseline.
