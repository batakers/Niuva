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

Documents with Approved Baseline status are authoritative within their approved scope.

Documents with Approved with Open Decisions status are authoritative only for the decisions explicitly recorded as approved. Their listed open decisions remain non-authoritative and must not be inferred.

Historical Active Baseline and Active Implementation Guardrail documents remain applicable only according to their documented authority and override rules.

Candidate and Superseded documents are not implementation authority.

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
| `doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md` | Active Decision Register | Business, operational, and technical decision index | Active register; approved ADR directions recorded in commit `2a45e146f5bc9d7d134c5dd804a9a546cea03a4e`; unresolved entries remain open |
| `doc/decisions/ADR-001-mongodb-transaction-capability.md` | Approved Baseline | Transaction-capability authority | Approved in commit `2a45e146f5bc9d7d134c5dd804a9a546cea03a4e`; internal architecture direction only |
| `doc/decisions/ADR-002-production-file-storage-architecture.md` | Approved with Open Decisions | Production persistent-storage authority | Approved in commit `2a45e146f5bc9d7d134c5dd804a9a546cea03a4e`; operational decisions remain open |
| `doc/decisions/ADR-003-retail-payment-orchestration-boundary.md` | Approved with Open Decisions | Provider-neutral Retail payment authority | Approved in commit `2a45e146f5bc9d7d134c5dd804a9a546cea03a4e`; provider and operational decisions remain open |

## Known Branch-Local Documents

Branch or worktree availability and approval status are separate dimensions. A branch-local document may be approved within its documented scope but cannot govern a clean primary checkout until the reviewed file is available on that branch.

| Document | Status | Approved scope / open decision | Availability | Authority | Primary applicability |
|---|---|---|---|---|---|
| `docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md` | Approved with Open Decisions | Open: transaction-capability alignment and any other decisions explicitly listed in the spec | Branch-local; not yet available on primary/integration | Approved technical direction within its documented scope | Does not apply to primary implementation until the reviewed document is merged or otherwise made available there |
| `docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md` | Approved with Open Decisions | Approved scope: development/demo storage only. Open blocker: production storage architecture and readiness | Branch-local; not yet available on primary/integration | Approved only for its documented development/demo scope | Does not apply to primary implementation until the reviewed document is merged or otherwise made available there |
| `docs/superpowers/specs/2026-07-16-retail-order-checkout-foundation-design.md` | Technical Design Candidate | Not approved | Branch-local | Not approved for implementation | Does not apply to primary implementation |

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

### Original Six-Document Stakeholder Approval

The original stakeholder approval record covers only the following six documents, and this scope remains unchanged:

1. `doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md`
2. `doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md`
3. `doc/PRD_Platform_Niuva_v2_1_retail_b2b.md`
4. `docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md`
5. `PRODUCT.md`
6. `AGENTS.md`

Implementation planning yang dicakup original record ini dibatasi pada **Foundation**:

- Identity, organization, role, permission, dan audit.
- CMS dan publish workflow foundation.
- Catalog foundation.
- Material price version, inventory movement, reservation, dan restock foundation.
- Shared order/project foundation.
- Migration compatibility, privacy boundary, testing, dan handover foundation.

Original approval ini tidak otomatis mencakup ADR yang dibuat kemudian, implementasi Retail MVP, B2B MVP, payment-provider integration, atau homepage-dependent UI.

### Later Role-Based Internal ADR Approval

Approval internal berbasis role yang direkam dalam commit `2a45e146f5bc9d7d134c5dd804a9a546cea03a4e` mencakup:

- `doc/decisions/ADR-001-mongodb-transaction-capability.md` — **Approved Baseline**
- `doc/decisions/ADR-002-production-file-storage-architecture.md` — **Approved with Open Decisions**
- `doc/decisions/ADR-003-retail-payment-orchestration-boundary.md` — **Approved with Open Decisions**

Scope approval later ADR ini hanya:

- internal architecture;
- documentation;
- future implementation planning.

Approval later ADR ini tidak mengotorisasi:

- production infrastructure changes;
- Finance operational activation;
- payment gateway activation;
- production upload enablement;
- production go-live.

ADR-002 dan ADR-003 authoritative hanya untuk direction yang secara eksplisit disetujui; seluruh listed open decisions tetap non-authoritative dan harus menunggu keputusan terpisah.

## Keputusan dan Dokumen yang Tetap Deferred atau Tidak Termasuk Approval

Keputusan berikut tetap deferred dan tidak disetujui oleh record ini:

- Pola homepage: split gateway, unified homepage, atau retail-first.
- Provider payment gateway.
- Detail visual navigasi/switch Retail dan B2B.

Dokumen berikut tetap berada di luar approval requirements dan/atau tetap menjadi guardrail atau candidate:

- `AGENTS.brand-baseline-v1.md` — tetap menjadi Active Implementation Guardrail.
- `docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md` — Approved with Open Decisions; branch-local and unavailable to primary implementation until merged or otherwise made available there.
- `docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md` — Approved with Open Decisions untuk development/demo storage only; branch-local and unavailable to primary implementation until merged or otherwise made available there.
- `docs/superpowers/specs/2026-07-16-retail-order-checkout-foundation-design.md` — branch-local Technical Design Candidate; not approved for implementation.

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
