# Niuva Documentation Migration and Reconciliation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development or superpowers:executing-plans
> only after this plan receives separate execution approval.

**Goal:** Migrate Niuva documentation into the approved canonical authority
structure without breaking references, losing history, changing application
behavior, or accidentally promoting non-authoritative documents.

**Architecture:** The migration uses staged, reversible documentation-only
changes. Canonical documents are established first, authority entry points are
updated second, document groups are moved in bounded batches, internal references
are repaired after each batch, and superseded material is archived without
destroying history.

**Tech Stack:** Markdown, Git, repository search tools, PowerShell-compatible
commands, and existing repository tooling. No application runtime changes.

## Global Constraints

- No application source-code changes.
- No provider, policy, infrastructure, payment, upload, or go-live decisions.
- Approved ADRs retain technical authority.
- Runbooks retain procedural authority.
- Superseded documents cannot become planning authority.
- File history must be preserved where practical.
- All file movements require a documented rollback.
- The existing cross-surface untracked plan must remain untouched until its
  dedicated reconciliation task is separately approved.
- No database, schema, API, route, dependency, test, application build, or application-test change belongs to this migration.
- No file is deleted. Superseded and stale material is moved only after its archive treatment is approved.
- The current protected cross-surface plan must retain SHA-256 `8D169B4CB6CB63E4C7EAA67D5CF794536000F3828E6B24A93396013743613E32` until its dedicated gate is approved.
- Commands in this plan are future execution instructions. They must not run before the Execution Authorization Gate is satisfied.

---

## 1. Inspection Baseline

### 1.1 Repository state at planning time

- Active branch: `chore/backend-framework-security-upgrade`.
- Tracked document-like files across the repository: 54.
- Tracked document-like files within root, `doc/`, `docs/`, and `memory/`: 46.
- Untracked document-like files before this plan: 9; eight canonical/decision documents plus the protected cross-surface plan.
- Ignored local `.superpowers/` Markdown evidence files: 38.
- Scoped inventory across root, `doc/`, `docs/`, `memory/`, and `.superpowers/`: 93 files.
- Reference graph baseline: 360 exact path-reference line hits across 42 migration-candidate paths.
- Content-collision result: no duplicate SHA-256 content in the 93-file scoped inventory.
- Filename collisions exist only inside ignored `.superpowers/` evidence: `progress.md`, `task-1-brief.md`, `task-2-brief.md`, `task-3-brief.md`, `task-4-brief.md`, and `task-5-report.md` each occur twice.
- Generated dependency trees `frontend/node_modules/` and `backend/.venv/` are excluded from documentation migration. Their Markdown, JSON, text, and YAML files are dependency-owned artifacts.
- `.superpowers/` is ignored and has no tracked files. It is local execution evidence, not canonical documentation.
- Actual Markdown relative links are effectively absent from the scoped documents; most repository references are inline-code path strings. A link checker alone is insufficient, so exact stale-path scans are mandatory.
- Windows absolute paths occur in procedural runbooks and ignored execution evidence. They remain only where they are historical evidence or exact Windows procedure inputs.

### 1.2 Hard path dependencies that constrain relocation

The repository contains two source/test references to documentation paths:

| Source | Line | Hard-coded path | Planning consequence |
|---|---:|---|---|
| `frontend/src/emergent-removal.test.js` | 19 | `doc/PRODUCTION_DEPLOYMENT.md` | Keep the runbook at its current path during this documentation-only migration. Moving it would require a source/test change that is outside scope. |
| `frontend/src/emergent-removal.test.js` | 20 | `doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md` | Keep the historical Homepage plan at its current path. Create a reconciled replacement at a new path only after a dedicated review gate. |

No other tracked source, script, CI, or test path references to `doc/`, `docs/superpowers/`, `memory/PRD.md`, `AGENTS.brand-baseline-v1.md`, or `PRODUCT.brand-baseline-v1.md` were found.

### 1.3 Git-history findings

- Canonical documents and the protected cross-surface plan are untracked, so `git mv` cannot preserve history for them until a separately approved baseline commit tracks the canonical set.
- Existing files under `doc/`, root, `memory/`, and tracked `docs/superpowers/` have Git history. Use `git mv` for their physical relocation.
- Representative history: ADR-001 has two commits; the v2.1 BRD has two; the unified platform design has three; the Homepage production plan has two; the Brand Guidelines PDF has one; `DESIGN.md` has two.
- `git mv` records the intended path transition; Git later presents rename history based on content identity and rename detection. Do not rewrite file content in the same commit unless the task explicitly requires reference repair or an archive header.
- The ignored `.superpowers/` reports have no tracked history. Do not import them into Git automatically.
- `doc/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md` governs a credential-history incident, not ordinary documentation relocation. Its rewrite commands must never be used for this migration.

## 2. Migration Strategy Decision

| Criterion | Strategy A — Immediate physical relocation | Strategy B — Staged canonicalization and relocation |
|---|---|---|
| Method | Move every document and repair all references in one large change. | Track canonical entry points first; reconcile root pointers; move decisions, requirements, runbooks, references, specs, and archives in separate reviewed batches. |
| Benefit | New directory structure appears quickly; fewer temporary pointers. | Small review surfaces; authority remains usable after every task; high-risk documents can remain pinned; rollback is commit-local. |
| Primary risk | 360 known inbound reference-line hits, untracked canonical files, binary PDFs, and hard-coded test paths can create an unrecoverable mixed diff. | Transitional compatibility pointers and two retained legacy paths temporarily leave more than one directory in use. |
| Rollback complexity | High: a single revert must reverse many moves, reference rewrites, binary copies, and archive headers together. | Low to medium: each documentation-only commit can be reverted independently in reverse order. |
| Git-history impact | Large move-plus-edit commit obscures rename detection and makes review difficult. | Tracked files use `git mv` in bounded groups; content repairs stay close to the governing move. |
| Link-breakage risk | High, especially for old plans, external bookmarks, ignored evidence, and `frontend/src/emergent-removal.test.js`. | Controlled through 15 temporary compatibility pointers, two retained PDF copies, exact stale-path scans, and explicit exceptions. |
| Recommendation | Rejected. | **Recommended.** Repository evidence strongly favors staged canonicalization. |

### 2.1 Recommended structure with evidence-based exceptions

The target structure remains the approved design, with three temporary safety exceptions:

```text
docs/
├── NIUVA_MASTER_SPEC.md
├── context/
├── decisions/
│   ├── architecture/
│   ├── product/
│   ├── experience/
│   └── evidence/
├── implementation/
│   ├── specs/
│   │   ├── active/
│   │   └── candidates/
│   ├── plans/
│   │   ├── active/
│   │   ├── pending-reconciliation/
│   │   └── completed/
│   └── history/
├── runbooks/
├── references/
│   ├── brand/
│   ├── company/
│   └── requirements/
│       ├── approved-baselines/
│       └── historical-active/
└── archive/
    ├── superseded/
    ├── drafts/
    └── implementation-history/
```

Temporary exceptions:

1. `doc/PRODUCTION_DEPLOYMENT.md` remains in place because a tracked frontend test reads that exact path.
2. `doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md` remains in place as Context Only while a new reconciled plan is prepared and reviewed.
3. Fifteen high-risk old paths receive compatibility pointers after their authoritative content is moved. Pointer removal is a later deprecation task, not part of the first migration pass.

## 3. Treatment Rules

### 3.1 Physical action rules

- Use `git mv` with the literal current and proposed paths from Section 4 when a tracked Markdown, JSON, or PDF has a single approved destination and no source/test path prevents relocation.
- Keep a file in place when source code or tests read the path, when its replacement strategy lacks approval, or when its content is a root entry point.
- Copy a binary PDF to the canonical references tree and retain the old byte-identical file during the transition; binary compatibility cannot be expressed with a Markdown pointer.
- Create a compatibility pointer only for high-inbound, active or historically cited Markdown paths listed in Section 4.4.
- Move Superseded and Archive Candidate Markdown only after adding the canonical archive header in the same task.
- Preserve ignored `.superpowers/` evidence in place. It is not imported, renamed, archived, or committed by this plan.
- Preserve historical literal paths inside archived evidence and inside the NIV-001 runbook when the literal is part of an audit or history-rewrite procedure.

### 3.2 Compatibility pointer wording

Every approved compatibility pointer uses the following four lines. During future
execution, `$destination` is read from the exact source-to-destination mapping in
Section 4.4; the generated file must contain the mapped path, not a variable name:

```powershell
$pointerLines = @(
  '> **MOVED — Compatibility pointer only.**',
  '>',
  "> Canonical location: ``$destination``",
  '>',
  '> This pointer has no independent authority. Follow the canonical location and `docs/context/DOCUMENT_REGISTER.md`.'
)
```

The pointer-generation step verifies that every generated file contains its
literal destination and that no generated file contains the string
`$destination`.

### 3.3 Archive policy

Every archived Markdown file begins with exactly:

```markdown
> **ARCHIVED — Do not use for new planning.**
>
> Canonical product and experience authority:
> `docs/NIUVA_MASTER_SPEC.md`
>
> See `docs/context/DOCUMENT_REGISTER.md` for status and permitted use.
```

- Markdown archive headers are inserted after the move and before the task commit.
- Archived JSON cannot contain a Markdown header. `docs/archive/README.md` records its path, original path, status, SHA-256, and permitted historical use.
- A future archived PDF must retain its bytes and use its archive directory plus `docs/archive/README.md` sidecar metadata. No PDF is archived in the first migration pass; both current PDFs remain Supporting References.
- Active documents may cite archived content only as explicitly labeled supersession, audit, or historical evidence. They may not use archived content as requirement authority.
- Root `AGENTS.md`, the Document Register, archive headers, and the archive sidecar jointly prevent AI agents from treating archive content as current authority.

## 4. Exact Path Migration Matrix

### 4.1 Canonical and root documents

| Current path | Proposed path | Current status | Action | Reason | Inbound references | Reference repair | Rollback |
|---|---|---|---|---|---|---|---|
| `docs/NIUVA_MASTER_SPEC.md` | Same path | Approved Canonical, untracked | Track; modify path references | Canonical product/experience source must be established before moves | Canonical inbound paths are not relocation risks | Replace moved-source paths task by task | Revert the task commit; never delete the approved content manually |
| `docs/context/DOCUMENT_REGISTER.md` | Same path | Approved Canonical, untracked | Track; modify classifications and paths | Canonical authority register must describe every transition | Central register references every migration group | Update each row in the task that owns the move | Revert owning commit |
| `docs/context/CONVERSATION_HANDOFF.md` | Same path | Context Only, untracked | Track; preserve content | Approved context record has no relocation dependency | Canonical paths only | None in first migration pass | Revert baseline commit only with separate approval |
| `docs/decisions/DECISION_REGISTER.md` | Same path | Approved Canonical, untracked | Track; modify source paths | Canonical decision index must point to relocated ADR/evidence paths | Decision and requirement paths | Repair in Tasks 3, 4, and 6 | Revert owning task commit |
| `docs/decisions/APPROVAL-NIUVA-CANONICAL-DOCUMENTATION-2026-07-23.md` | Same path | Approved Decision, untracked | Track; preserve content | Formal canonical approval record | Canonical paths only | None | Revert baseline commit only with separate approval |
| `docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md` | Same path | Approved Decision, untracked | Track; modify reference paths only | Decision substance remains fixed | R02–R06, R18, R34 | Replace exact moved paths; preserve decision wording | Revert reference-only commit |
| `docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md` | Same path | Approved Decision, untracked | Track; modify reference paths only | Decision substance remains fixed | R12–R13, R16–R20 | Replace exact moved/copy destinations; leave Homepage-plan exception | Revert reference-only commit |
| `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md` | Same path | Approved Decision, untracked | Track; modify reference paths only | Decision substance remains fixed | R03–R04, R09–R10 | Replace requirements/runbook paths; keep `DESIGN.md` root path | Revert reference-only commit |
| `AGENTS.md` | Same path | Approved Baseline root guardrail | Modify in place | Must become concise canonical agent entry point while retaining implementation guardrails | Root path is intentionally stable | Replace authority order and old paths; remove Homepage-deferred statement | Revert root-entry-point commit |
| `PRODUCT.md` | Same path | Approved Baseline root orientation | Modify in place | Must become concise product orientation subordinate to Master/decisions/ADRs | Root path is intentionally stable | Replace duplicated source hierarchy and old paths | Revert root-entry-point commit |
| `DESIGN.md` | Same path | Active Guardrail, transitional/conflicted | Preserve until Task 9; then rewrite in place after explicit sub-gate | Valid semantic tokens and current components coexist with typography/logo conflicts | 13 hits across 7 documentation files; source consumes its tokens/components | No path change; reconcile content only | Revert DESIGN commit |
| `README.md` | Same path | Context Only | Preserve untouched | Repository placeholder is outside authority migration | No governing inbound path | None | None |
| `AGENTS.brand-baseline-v1.md` | `docs/references/requirements/historical-active/AGENTS.brand-baseline-v1.md` | Active Guardrail | Move; add compatibility pointer; modify inbound active references | Retain public-v1 guardrails without root authority ambiguity | R39 | Update root/canonical/approval references; protected cross-surface plan continues through pointer | Revert requirements commit |
| `PRODUCT.brand-baseline-v1.md` | `docs/references/requirements/historical-active/PRODUCT.brand-baseline-v1.md` | Supporting Reference | Move; add compatibility pointer | Historical orientation should live with historical-active references | R40 | Update Document Register | Revert requirements commit |
| `design_guidelines.json` | `docs/archive/drafts/design_guidelines.json` | Archive Candidate | Move; archive sidecar entry | Generated configuration conflicts with approved direction | R41 | Update Document Register; no pointer | Revert archive commit |
| `test_result.md` | `docs/archive/implementation-history/test_result.md` | Context Only legacy protocol | Move; add archive header | Legacy testing-agent protocol is not current verification authority | 0 exact path hits | Update Document Register | Revert archive commit |
| `memory/PRD.md` | Same path | Context Only compatibility pointer | Rewrite as canonical compatibility pointer; do not move | NIV-001 contains historical exact-path procedures and external agents may probe this path | R42 | Point to Master, Document Register, Decision Register, and relocated PRD | Revert root-entry-point commit |

### 4.2 Decisions, requirements, runbooks, and references

| Current path | Proposed path | Current status | Action | Reason | Inbound references | Reference repair | Rollback |
|---|---|---|---|---|---|---|---|
| `doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md` | `docs/decisions/evidence/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md` | Supporting Reference | Move; modify paths; add compatibility pointer | Approval evidence belongs with decision evidence | R01 | Update active and pending documents; preserve compatibility path | Revert requirements commit |
| `doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md` | `docs/references/requirements/approved-baselines/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md` | Approved Baseline | Move; modify paths; add compatibility pointer | Approved business baseline | R02 | Update all active/pending sources; historical evidence may use pointer | Revert requirements commit |
| `doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md` | `docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md` | Approved Baseline | Move; modify paths; add compatibility pointer | Approved product baseline | R03 | Update all active/pending sources; historical evidence may use pointer | Revert requirements commit |
| `doc/PRD_Platform_Niuva_v2_1_retail_b2b.md` | `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md` | Approved Baseline | Move; modify paths; add compatibility pointer | Detailed approved requirement provenance | R04 | Update all active/pending sources and ADR related-baseline fields | Revert requirements commit |
| `doc/BRD_Website_Niuva.md` | `docs/references/requirements/historical-active/BRD_Website_Niuva.md` | Historical Active Baseline | Move; add compatibility pointer | Public-v1 scope remains active where canonical documents are silent | R05 | Update active/canonical references | Revert requirements commit |
| `doc/PRS_Website_Niuva.md` | `docs/references/requirements/historical-active/PRS_Website_Niuva.md` | Historical Active Baseline | Move; add compatibility pointer | Public-v1 scope remains active where canonical documents are silent | R06 | Update active/canonical references | Revert requirements commit |
| `doc/BRD_Platform_Niuva_v2_addendum.md` | `docs/archive/superseded/BRD_Platform_Niuva_v2_addendum.md` | Superseded | Move; add archive header | Prohibited for new planning but retained for traceability | R07 | Update explicit supersession/evidence paths; no pointer | Revert archive commit |
| `doc/PRS_Platform_Niuva_v2_addendum.md` | `docs/archive/superseded/PRS_Platform_Niuva_v2_addendum.md` | Superseded | Move; add archive header | Prohibited for new planning but retained for traceability | R08 | Update explicit supersession/evidence paths; no pointer | Revert archive commit |
| `doc/decisions/ADR-001-mongodb-transaction-capability.md` | `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md` | Approved Baseline | Move; modify paths; add compatibility pointer | Technical authority belongs in architecture decisions | R21 | Update active/pending sources; historical evidence may use pointer | Revert decisions commit |
| `doc/decisions/ADR-002-production-file-storage-architecture.md` | `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md` | Approved with Open Decisions | Move; modify paths; add compatibility pointer | Technical authority belongs in architecture decisions | R22 | Update active/pending sources; retain open decisions | Revert decisions commit |
| `doc/decisions/ADR-003-retail-payment-orchestration-boundary.md` | `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md` | Approved with Open Decisions | Move; modify paths; add compatibility pointer | Technical authority belongs in architecture decisions | R23 | Update active/pending sources; retain provider/Finance/go-live openness | Revert decisions commit |
| `doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md` | `docs/decisions/product/DECISION_LOG_Platform_Niuva_v2_1.md` | Approved with Open Decisions | Move; modify paths; add compatibility pointer | Product/operational decision log belongs under product decisions | R24 | Update active/pending sources | Revert decisions commit |
| `doc/IDENTITY_RBAC_AUDIT_RUNBOOK.md` | `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md` | Runbook | Move; add compatibility pointer | Procedural authority belongs under canonical runbooks | R10 | Update active/canonical references; pending plan may use new path | Revert runbook commit |
| `doc/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md` | `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md` | Runbook | Move; add compatibility pointer | Procedural authority belongs under canonical runbooks | R09 | Update active/canonical references; pending plans use new path | Revert runbook commit |
| `doc/PRODUCTION_DEPLOYMENT.md` | Deferred target: `docs/runbooks/PRODUCTION_DEPLOYMENT.md` | Runbook | Preserve current path in this plan | Tracked frontend test pins the old path | R11, including source/test hit | Update ADR references inside file only; do not move | Revert reference-only runbook commit |
| `doc/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md` | `docs/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md` | Runbook | Move; preserve historical literals | Procedural authority belongs under canonical runbooks | R25 | Update Document Register only; preserve credential-incident path literals | Revert runbook commit |
| `doc/Company profile PT Niuva_compressed.pdf` | `docs/references/company/Company profile PT Niuva_compressed.pdf` | Supporting Reference | Copy; retain old byte-identical file | Binary factual reference needs a safe compatibility period | R12 | Update active references to new copy; compare hashes | Remove new copy through commit revert |
| `doc/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf` | `docs/references/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf` | Supporting Reference | Copy; retain old byte-identical file | Binary visual reference needs a safe compatibility period | R20 | Update active references to new copy; compare hashes | Remove new copy through commit revert |
| `doc/brand/BRAND_WEBSITE_AUDIT.md` | `docs/references/brand/BRAND_WEBSITE_AUDIT.md` | Supporting Reference | Move; modify path references | Audit is evidence, not a decision | R16 | Update active/canonical references and audit source paths | Revert brand-reference commit |
| `doc/brand/BRAND_APPROVAL_DECISIONS.md` | `docs/decisions/evidence/BRAND_APPROVAL_DECISIONS.md` | Approved Decision in prototype scope | Move; modify audit reference | Decision evidence belongs under decisions/evidence | R13 | Update DEC-UX-002 and Document Register | Revert brand-reference commit |
| `doc/brand/HOMEPAGE_PROTOTYPE_REVIEW.md` | `docs/decisions/evidence/HOMEPAGE_PROTOTYPE_REVIEW.md` | Context Only | Move | Review evidence belongs under decisions/evidence | R19 | Update DEC-UX-002 and Document Register | Revert brand-reference commit |
| `doc/brand/HOMEPAGE_PROTOTYPE_DECISION.md` | `docs/decisions/evidence/HOMEPAGE_PROTOTYPE_DECISION.md` | Approved Decision | Move without content change | Earlier approved decision evidence supports DEC-UX-002 | R18 | Update Master, registers, and experience decisions | Revert brand-reference commit |
| `doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md` | Deferred historical target: `docs/implementation/history/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN-2026-07-13.md` | Context Only, pending reconciliation | Preserve current path; create a new replacement plan in Task 8 | Source/test pin plus outdated source-state and missing DEC-UX-001 Retail path | R17, including source/test hit | Do not modify or move old file in this plan | Revert only the new replacement-plan commit |
| `doc/brand/BRAND_DIGITAL_EXTENSION.md` | `docs/archive/drafts/BRAND_DIGITAL_EXTENSION.md` | Archive Candidate | Move; add archive header | Unapproved draft conflicts with later decisions | R14 | Update audit and Document Register as historical only | Revert archive commit |
| `doc/brand/BRAND_IMPLEMENTATION_PLAN.md` | `docs/archive/implementation-history/BRAND_IMPLEMENTATION_PLAN.md` | Archive Candidate | Move; add archive header | Stale checklist is implementation history | R15 | Update audit and Document Register as historical only | Revert archive commit |

### 4.3 Implementation specifications, plans, and local evidence

| Current path | Proposed path | Current status | Action | Reason | Inbound references | Reference repair | Rollback |
|---|---|---|---|---|---|---|---|
| `docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md` | `docs/implementation/specs/active/2026-07-14-unified-retail-b2b-platform-design.md` | Approved Baseline | Move; modify paths; add compatibility pointer | Active unified platform design, not product authority | R34 | Update active/pending sources; protected cross-surface plan uses pointer | Revert requirements/spec commit |
| `docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md` | `docs/implementation/specs/active/2026-07-14-catalog-material-pricing-inventory-foundation-design.md` | Approved with Open Decisions | Move; modify paths | Active bounded design with open decisions | R32 | Update its pending plan and authority pointers | Revert implementation-taxonomy commit |
| `docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md` | `docs/implementation/specs/active/2026-07-16-remove-emergent-local-storage-design.md` | Approved with Open Decisions | Move; modify paths | Active only for development/demo storage | R35 | Update its pending plan and authority pointers | Revert implementation-taxonomy commit |
| `docs/superpowers/specs/2026-07-16-retail-order-checkout-foundation-design.md` | `docs/implementation/specs/candidates/2026-07-16-retail-order-checkout-foundation-design.md` | Candidate | Move; modify paths | Candidate must be physically separated from active specs | R36 | Update Document Register; retain Not Approved wording | Revert implementation-taxonomy commit |
| `docs/superpowers/specs/2026-07-21-backend-framework-security-upgrade-design.md` | `docs/implementation/specs/active/2026-07-21-backend-framework-security-upgrade-design.md` | Approved Decision for bounded slice | Move | Current branch-specific approved design remains bounded | R37 | Update Document Register | Revert implementation-taxonomy commit |
| `docs/superpowers/specs/2026-07-21-redesign-main-reconciliation-design.md` | `docs/implementation/history/2026-07-21-redesign-main-reconciliation-design.md` | Approved Decision for completed workflow context | Move | Task-specific Git reconciliation evidence is not current product direction | R38 | Update moved historical plan and Document Register | Revert implementation-taxonomy commit |
| `docs/superpowers/specs/2026-07-14-integrated-operations-marketplace-design.md` | `docs/archive/superseded/2026-07-14-integrated-operations-marketplace-design.md` | Superseded | Move; add archive header | Superseded by unified Retail–B2B design | R33 | Update explicit supersession/evidence paths | Revert archive commit |
| `docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md` | `docs/implementation/plans/pending-reconciliation/2026-07-14-foundation-identity-rbac-organization-audit.md` | Context Only; 47 unchecked steps | Move; repair authority paths | Completion cannot be inferred from repository checkbox state | R27 | Update Document Register and pending-plan source paths | Revert implementation-taxonomy commit |
| `docs/superpowers/plans/2026-07-14-catalog-material-pricing-inventory-foundation.md` | `docs/implementation/plans/pending-reconciliation/2026-07-14-catalog-material-pricing-inventory-foundation.md` | Context Only; 2 unchecked verification steps | Move; repair spec/runbook paths | Real transaction and browser QA remain unchecked | R26 | Update Document Register and moved plan references | Revert implementation-taxonomy commit |
| `docs/superpowers/plans/2026-07-16-remove-emergent-local-storage.md` | `docs/implementation/plans/pending-reconciliation/2026-07-16-remove-emergent-local-storage.md` | Context Only; 1 unchecked build step | Move; repair spec/runbook paths | Optimized build evidence remains unchecked | R28 | Update Document Register and moved plan references | Revert implementation-taxonomy commit |
| `docs/superpowers/plans/2026-07-17-foundation-transaction-capability.md` | `docs/implementation/plans/pending-reconciliation/2026-07-17-foundation-transaction-capability.md` | Context Only; 109 unchecked steps | Move; repair authority paths | Checklist cannot be treated as completed despite separate local reports | R29 | Update Document Register and moved plan references | Revert implementation-taxonomy commit |
| `docs/superpowers/plans/2026-07-21-redesign-main-reconciliation.md` | `docs/implementation/history/2026-07-21-redesign-main-reconciliation.md` | Context Only task history | Move with its design evidence | Branch-specific workflow must not appear executable now | R30 | Update self/design paths and Document Register | Revert implementation-taxonomy commit |
| `docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md` | Dedicated-gate target: `docs/archive/drafts/2026-07-22-cross-surface-ui-ux-consistency-remediation.md` | Context Only, untracked, protected | Preserve byte-identical; exclude from base execution | Contains known authority conflicts and monolithic UI scope | R31 | None before Task 10 receives separate approval | No action exists to roll back before gate |
| `docs/superpowers/plans/2026-07-23-documentation-migration-reconciliation.md` | Final target after successful execution: `docs/implementation/plans/completed/2026-07-23-documentation-migration-reconciliation.md` | Planning deliverable, untracked at creation | Track at current path; move only in final task | Keep review path stable throughout execution, then classify completed | Self-reference only after creation | Update Document Register in final task | Revert final verification commit |

### 4.4 Compatibility pointer mapping

Exactly these 15 old paths receive pointers during future execution:

| Pointer path | Canonical destination |
|---|---|
| `AGENTS.brand-baseline-v1.md` | `docs/references/requirements/historical-active/AGENTS.brand-baseline-v1.md` |
| `PRODUCT.brand-baseline-v1.md` | `docs/references/requirements/historical-active/PRODUCT.brand-baseline-v1.md` |
| `doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md` | `docs/decisions/evidence/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md` |
| `doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md` | `docs/references/requirements/approved-baselines/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md` |
| `doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md` | `docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md` |
| `doc/PRD_Platform_Niuva_v2_1_retail_b2b.md` | `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md` |
| `doc/BRD_Website_Niuva.md` | `docs/references/requirements/historical-active/BRD_Website_Niuva.md` |
| `doc/PRS_Website_Niuva.md` | `docs/references/requirements/historical-active/PRS_Website_Niuva.md` |
| `doc/IDENTITY_RBAC_AUDIT_RUNBOOK.md` | `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md` |
| `doc/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md` | `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md` |
| `doc/decisions/ADR-001-mongodb-transaction-capability.md` | `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md` |
| `doc/decisions/ADR-002-production-file-storage-architecture.md` | `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md` |
| `doc/decisions/ADR-003-retail-payment-orchestration-boundary.md` | `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md` |
| `doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md` | `docs/decisions/product/DECISION_LOG_Platform_Niuva_v2_1.md` |
| `docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md` | `docs/implementation/specs/active/2026-07-14-unified-retail-b2b-platform-design.md` |

Pointer removal requires a later approval after active stale-path scans are clean, external consumers have had a deprecation window, and the protected cross-surface plan has been reconciled.

## 5. Exact Link-Update Manifest

The planning baseline contains **360 reference-line hits** across the 42 reference
IDs below. The count excludes ignored `.diff` review artifacts because those files
are patch snapshots, but includes tracked files, normal untracked files, and
ignored Markdown evidence under `.superpowers/`. Each location below is a
`path:line` location in the pre-migration tree. A location may be repaired,
deliberately retained through a compatibility pointer, or preserved as historical
evidence; none is silently omitted.

During execution, define this read-only inspection helper before running the exact
command in each manifest row:

```powershell
$scanFiles = @(
  git ls-files
  git ls-files --others --exclude-standard
  git ls-files --others --ignored --exclude-standard -- .superpowers
) | Sort-Object -Unique | Where-Object {
  $_ -ne 'docs/superpowers/plans/2026-07-23-documentation-migration-reconciliation.md' -and
  $_ -notlike '*.diff' -and
  (Test-Path -LiteralPath $_ -PathType Leaf)
}

function Show-Reference {
  param([string]$Id, [string]$Needle)
  $hits = foreach ($file in $scanFiles) {
    Select-String -LiteralPath $file -SimpleMatch -Pattern $Needle -ErrorAction SilentlyContinue
  }
  $hits | ForEach-Object { '{0}:{1}:{2}' -f $_.Path, $_.LineNumber, $_.Line.Trim() }
  '{0}|COUNT={1}' -f $Id, @($hits).Count
}
```

### 5.1 Requirements, runbooks, and brand references

| ID | Source file and baseline line(s) | Current reference | New reference or deliberate action | Reason | Verification command |
|---|---|---|---|---|---|
| R01 | `doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md:5`<br>`doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md:5`<br>`doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md:5`<br>`docs/context/DOCUMENT_REGISTER.md:43`<br>`docs/decisions/DECISION_REGISTER.md:12`<br>`docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md:77`<br>`docs/NIUVA_MASTER_SPEC.md:40`<br>`docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md:5` | `doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md` | `docs/decisions/evidence/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md`; old path becomes pointer | Normalize approval evidence while preserving old consumers | `Show-Reference -Id R01 -Needle 'doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md'` |
| R02 | `AGENTS.md:35`<br>`doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md:40,71,86,147`<br>`doc/BRD_Platform_Niuva_v2_addendum.md:5`<br>`doc/PRD_Platform_Niuva_v2_1_retail_b2b.md:5`<br>`doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md:8`<br>`docs/context/DOCUMENT_REGISTER.md:48`<br>`docs/decisions/DECISION_REGISTER.md:12`<br>`docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md:72,86`<br>`docs/NIUVA_MASTER_SPEC.md:41,69,372,375`<br>`docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md:13`<br>`docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md:209`<br>`memory/PRD.md:13`<br>`PRODUCT.md:14` | `doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md` | `docs/references/requirements/approved-baselines/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md`; protected R31 source deliberately retains the old path through pointer | Normalize approved requirement authority without editing the protected plan | `Show-Reference -Id R02 -Needle 'doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md'` |
| R03 | `AGENTS.md:36`<br>`doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md:41,72,87,150`<br>`doc/PRD_Platform_Niuva_v2_1_retail_b2b.md:6`<br>`doc/PRS_Platform_Niuva_v2_addendum.md:5`<br>`docs/context/DOCUMENT_REGISTER.md:49`<br>`docs/decisions/DECISION_REGISTER.md:12`<br>`docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md:124`<br>`docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md:73,87`<br>`docs/NIUVA_MASTER_SPEC.md:42,105,373,385,387,390`<br>`docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md:13`<br>`docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md:210`<br>`docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md:6`<br>`docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md:7`<br>`memory/PRD.md:14`<br>`PRODUCT.md:15` | `doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md` | `docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md`; protected R31 source uses pointer | Normalize approved requirement authority | `Show-Reference -Id R03 -Needle 'doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md'` |
| R04 | `AGENTS.md:26`<br>`doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md:42,73,88`<br>`doc/decisions/ADR-001-mongodb-transaction-capability.md:12`<br>`doc/decisions/ADR-002-production-file-storage-architecture.md:12`<br>`doc/decisions/ADR-003-retail-payment-orchestration-boundary.md:13`<br>`docs/context/DOCUMENT_REGISTER.md:50`<br>`docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md:123`<br>`docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md:74,88`<br>`docs/NIUVA_MASTER_SPEC.md:43,57,105,374,376,386,389`<br>`docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md:13`<br>`docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md:211`<br>`memory/PRD.md:9`<br>`PRODUCT.md:16` | `doc/PRD_Platform_Niuva_v2_1_retail_b2b.md` | `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md`; protected R31 source uses pointer | Normalize approved detailed requirements | `Show-Reference -Id R04 -Needle 'doc/PRD_Platform_Niuva_v2_1_retail_b2b.md'` |
| R05 | `AGENTS.md:24`<br>`doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md:46`<br>`doc/brand/BRAND_WEBSITE_AUDIT.md:28`<br>`doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md:6`<br>`doc/BRD_Platform_Niuva_v2_addendum.md:7`<br>`docs/context/DOCUMENT_REGISTER.md:44`<br>`docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md:84`<br>`docs/NIUVA_MASTER_SPEC.md:69,375`<br>`docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md:207` | `doc/BRD_Website_Niuva.md` | `docs/references/requirements/historical-active/BRD_Website_Niuva.md`; protected R31 source uses pointer | Preserve Historical Active Baseline status | `Show-Reference -Id R05 -Needle 'doc/BRD_Website_Niuva.md'` |
| R06 | `AGENTS.md:25`<br>`doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md:47`<br>`doc/brand/BRAND_WEBSITE_AUDIT.md:29`<br>`doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md:6`<br>`doc/PRS_Platform_Niuva_v2_addendum.md:7`<br>`docs/context/DOCUMENT_REGISTER.md:45`<br>`docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md:85`<br>`docs/NIUVA_MASTER_SPEC.md:69,384`<br>`docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md:208` | `doc/PRS_Website_Niuva.md` | `docs/references/requirements/historical-active/PRS_Website_Niuva.md`; protected R31 source uses pointer | Preserve Historical Active Baseline status | `Show-Reference -Id R06 -Needle 'doc/PRS_Website_Niuva.md'` |
| R07 | `doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md:49,146`<br>`doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md:7`<br>`doc/PRS_Platform_Niuva_v2_addendum.md:8`<br>`docs/context/DOCUMENT_REGISTER.md:46` | `doc/BRD_Platform_Niuva_v2_addendum.md` | `docs/archive/superseded/BRD_Platform_Niuva_v2_addendum.md` | Retain only explicit supersession provenance | `Show-Reference -Id R07 -Needle 'doc/BRD_Platform_Niuva_v2_addendum.md'` |
| R08 | `doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md:50,149`<br>`doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md:7`<br>`docs/context/DOCUMENT_REGISTER.md:47` | `doc/PRS_Platform_Niuva_v2_addendum.md` | `docs/archive/superseded/PRS_Platform_Niuva_v2_addendum.md` | Retain only explicit supersession provenance | `Show-Reference -Id R08 -Needle 'doc/PRS_Platform_Niuva_v2_addendum.md'` |
| R09 | `.superpowers/archive/Niuva-clean-20260720-sdd/task-9-brief.md:8,250,311`<br>`docs/context/DOCUMENT_REGISTER.md:94`<br>`docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md:128`<br>`docs/NIUVA_MASTER_SPEC.md:336`<br>`docs/superpowers/plans/2026-07-14-catalog-material-pricing-inventory-foundation.md:965,980,1065`<br>`docs/superpowers/plans/2026-07-17-foundation-transaction-capability.md:61,105,2803,3045,3106` | `doc/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md` | `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md`; ignored evidence may retain old path through pointer | Normalize procedural authority | `Show-Reference -Id R09 -Needle 'doc/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md'` |
| R10 | `docs/context/DOCUMENT_REGISTER.md:93`<br>`docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md:127`<br>`docs/NIUVA_MASTER_SPEC.md:105`<br>`docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md:49,835,903` | `doc/IDENTITY_RBAC_AUDIT_RUNBOOK.md` | `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md` | Normalize procedural authority | `Show-Reference -Id R10 -Needle 'doc/IDENTITY_RBAC_AUDIT_RUNBOOK.md'` |
| R11 | `.superpowers/archive/Niuva-clean-20260720-sdd/task-9-brief.md:9,265,311`<br>`docs/context/DOCUMENT_REGISTER.md:95`<br>`docs/superpowers/plans/2026-07-16-remove-emergent-local-storage.md:45,747,764,800,861,875,956`<br>`docs/superpowers/plans/2026-07-17-foundation-transaction-capability.md:106,2804,3060,3106`<br>`docs/superpowers/plans/2026-07-21-redesign-main-reconciliation.md:36,363,401,416,438,467,553`<br>`docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md:218`<br>`frontend/src/emergent-removal.test.js:19` | `doc/PRODUCTION_DEPLOYMENT.md` | Preserve exact path; repair moved ADR references inside the runbook | Source/test path pin makes relocation out of scope | `Show-Reference -Id R11 -Needle 'doc/PRODUCTION_DEPLOYMENT.md'` |
| R12 | `docs/context/DOCUMENT_REGISTER.md:78`<br>`docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md:100` | `doc/Company profile PT Niuva_compressed.pdf` | Copy to `docs/references/company/Company profile PT Niuva_compressed.pdf`; retain old bytes | Binary transition requires dual paths and hash equality | `Show-Reference -Id R12 -Needle 'doc/Company profile PT Niuva_compressed.pdf'` |
| R13 | `docs/context/DOCUMENT_REGISTER.md:80`<br>`docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md:102` | `doc/brand/BRAND_APPROVAL_DECISIONS.md` | `docs/decisions/evidence/BRAND_APPROVAL_DECISIONS.md` | Normalize approved prototype decision evidence | `Show-Reference -Id R13 -Needle 'doc/brand/BRAND_APPROVAL_DECISIONS.md'` |
| R14 | `doc/brand/BRAND_WEBSITE_AUDIT.md:31`<br>`docs/context/DOCUMENT_REGISTER.md:84` | `doc/brand/BRAND_DIGITAL_EXTENSION.md` | `docs/archive/drafts/BRAND_DIGITAL_EXTENSION.md` | Unapproved draft must not remain in active brand tree | `Show-Reference -Id R14 -Needle 'doc/brand/BRAND_DIGITAL_EXTENSION.md'` |
| R15 | `doc/brand/BRAND_WEBSITE_AUDIT.md:32`<br>`docs/context/DOCUMENT_REGISTER.md:85` | `doc/brand/BRAND_IMPLEMENTATION_PLAN.md` | `docs/archive/implementation-history/BRAND_IMPLEMENTATION_PLAN.md` | Stale checklist is retained as implementation history | `Show-Reference -Id R15 -Needle 'doc/brand/BRAND_IMPLEMENTATION_PLAN.md'` |
| R16 | `doc/brand/BRAND_APPROVAL_DECISIONS.md:7`<br>`docs/context/DOCUMENT_REGISTER.md:79`<br>`docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md:101`<br>`docs/NIUVA_MASTER_SPEC.md:227` | `doc/brand/BRAND_WEBSITE_AUDIT.md` | `docs/references/brand/BRAND_WEBSITE_AUDIT.md` | Keep audit discoverable as Supporting Reference | `Show-Reference -Id R16 -Needle 'doc/brand/BRAND_WEBSITE_AUDIT.md'` |
| R17 | `docs/context/DOCUMENT_REGISTER.md:83`<br>`docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md:78,91`<br>`docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md:105`<br>`docs/superpowers/plans/2026-07-16-remove-emergent-local-storage.md:46,748,765,830,862,875,957`<br>`docs/superpowers/plans/2026-07-21-redesign-main-reconciliation.md:366,401,554`<br>`frontend/src/emergent-removal.test.js:20` | `doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md` | Preserve old path; create `docs/implementation/plans/pending-reconciliation/2026-07-23-homepage-production-implementation-plan.md` | Source/test pin and authority conflicts require replacement, not in-place promotion | `Show-Reference -Id R17 -Needle 'doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md'` |
| R18 | `docs/context/DOCUMENT_REGISTER.md:82`<br>`docs/decisions/DECISION_REGISTER.md:14,15,16`<br>`docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md:90`<br>`docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md:7,104`<br>`docs/NIUVA_MASTER_SPEC.md:197,227,383,384` | `doc/brand/HOMEPAGE_PROTOTYPE_DECISION.md` | `docs/decisions/evidence/HOMEPAGE_PROTOTYPE_DECISION.md` | Normalize evidence beneath approved DEC-UX records | `Show-Reference -Id R18 -Needle 'doc/brand/HOMEPAGE_PROTOTYPE_DECISION.md'` |
| R19 | `docs/context/DOCUMENT_REGISTER.md:81`<br>`docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md:103` | `doc/brand/HOMEPAGE_PROTOTYPE_REVIEW.md` | `docs/decisions/evidence/HOMEPAGE_PROTOTYPE_REVIEW.md` | Normalize review evidence | `Show-Reference -Id R19 -Needle 'doc/brand/HOMEPAGE_PROTOTYPE_REVIEW.md'` |
| R20 | `doc/brand/BRAND_WEBSITE_AUDIT.md:30`<br>`docs/context/DOCUMENT_REGISTER.md:77`<br>`docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md:99`<br>`docs/NIUVA_MASTER_SPEC.md:203,227,383` | `doc/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf` | Copy to `docs/references/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf`; retain old bytes | Binary transition requires dual paths and hash equality | `Show-Reference -Id R20 -Needle 'doc/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf'` |

### 5.2 Architecture, implementation, and root references

| ID | Source file and baseline line(s) | Current reference | New reference or deliberate action | Reason | Verification command |
|---|---|---|---|---|---|
| R21 | `.superpowers/archive/Niuva-clean-20260720-sdd/task-9-brief.md:95,281`<br>`AGENTS.md:42,260`<br>`doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md:53,108`<br>`doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md:40,114,148,168,205`<br>`doc/PRD_Platform_Niuva_v2_1_retail_b2b.md:10,332,370`<br>`doc/PRODUCTION_DEPLOYMENT.md:105`<br>`docs/context/DOCUMENT_REGISTER.md:64`<br>`docs/decisions/DECISION_REGISTER.md:18`<br>`docs/NIUVA_MASTER_SPEC.md:28,353,391`<br>`docs/superpowers/plans/2026-07-17-foundation-transaction-capability.md:2890,3076`<br>`docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md:7,459`<br>`docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md:9,465`<br>`docs/superpowers/specs/2026-07-16-retail-order-checkout-foundation-design.md:7,56,518`<br>`PRODUCT.md:22,177` | `doc/decisions/ADR-001-mongodb-transaction-capability.md` | `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`; ignored evidence may use pointer | Normalize architecture authority without rewriting local evidence | `Show-Reference -Id R21 -Needle 'doc/decisions/ADR-001-mongodb-transaction-capability.md'` |
| R22 | `AGENTS.md:43,226`<br>`doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md:54,109`<br>`doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md:40,63,148,188,205`<br>`doc/PRD_Platform_Niuva_v2_1_retail_b2b.md:11,341`<br>`doc/PRODUCTION_DEPLOYMENT.md:106`<br>`docs/context/DOCUMENT_REGISTER.md:65`<br>`docs/decisions/DECISION_REGISTER.md:19`<br>`docs/NIUVA_MASTER_SPEC.md:29,353,392`<br>`docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md:10,179`<br>`docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md:8,19,299`<br>`docs/superpowers/specs/2026-07-16-retail-order-checkout-foundation-design.md:8,57,525`<br>`PRODUCT.md:23,175` | `doc/decisions/ADR-002-production-file-storage-architecture.md` | `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`; ignored evidence may use pointer | Normalize architecture authority while retaining open decisions | `Show-Reference -Id R22 -Needle 'doc/decisions/ADR-002-production-file-storage-architecture.md'` |
| R23 | `AGENTS.md:44,236`<br>`doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md:55,110`<br>`doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md:40,63,131,148,205`<br>`doc/PRD_Platform_Niuva_v2_1_retail_b2b.md:12,351`<br>`doc/PRODUCTION_DEPLOYMENT.md:107`<br>`docs/context/DOCUMENT_REGISTER.md:66`<br>`docs/decisions/DECISION_REGISTER.md:20`<br>`docs/NIUVA_MASTER_SPEC.md:30,353,393`<br>`docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md:11`<br>`docs/superpowers/specs/2026-07-16-retail-order-checkout-foundation-design.md:9,58,532`<br>`PRODUCT.md:24,176` | `doc/decisions/ADR-003-retail-payment-orchestration-boundary.md` | `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`; ignored evidence may use pointer | Normalize architecture authority while retaining provider and Finance deferrals | `Show-Reference -Id R23 -Needle 'doc/decisions/ADR-003-retail-payment-orchestration-boundary.md'` |
| R24 | `AGENTS.md:45`<br>`doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md:52,166`<br>`doc/decisions/ADR-001-mongodb-transaction-capability.md:13`<br>`doc/decisions/ADR-002-production-file-storage-architecture.md:13`<br>`doc/decisions/ADR-003-retail-payment-orchestration-boundary.md:14`<br>`doc/PRD_Platform_Niuva_v2_1_retail_b2b.md:13`<br>`docs/context/DOCUMENT_REGISTER.md:63`<br>`docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md:7`<br>`docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md:12`<br>`docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md:8`<br>`docs/superpowers/specs/2026-07-16-retail-order-checkout-foundation-design.md:10`<br>`PRODUCT.md:25` | `doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md` | `docs/decisions/product/DECISION_LOG_Platform_Niuva_v2_1.md` | Normalize product and operational decision evidence | `Show-Reference -Id R24 -Needle 'doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md'` |
| R25 | `docs/context/DOCUMENT_REGISTER.md:96` | `doc/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md` | `docs/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md` | Consolidate procedural authority; preserve literal incident paths inside it | `Show-Reference -Id R25 -Needle 'doc/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md'` |
| R26 | `docs/context/DOCUMENT_REGISTER.md:103` | `docs/superpowers/plans/2026-07-14-catalog-material-pricing-inventory-foundation.md` | `docs/implementation/plans/pending-reconciliation/2026-07-14-catalog-material-pricing-inventory-foundation.md` | Two unchecked verification items prevent completed classification | `Show-Reference -Id R26 -Needle 'docs/superpowers/plans/2026-07-14-catalog-material-pricing-inventory-foundation.md'` |
| R27 | `doc/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md:128`<br>`docs/context/DOCUMENT_REGISTER.md:102`<br>`docs/superpowers/plans/2026-07-16-remove-emergent-local-storage.md:22` | `docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md` | `docs/implementation/plans/pending-reconciliation/2026-07-14-foundation-identity-rbac-organization-audit.md`; NIV-001 historical literal may remain | Forty-seven unchecked items prevent completed classification | `Show-Reference -Id R27 -Needle 'docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md'` |
| R28 | `docs/context/DOCUMENT_REGISTER.md:104`<br>`docs/superpowers/plans/2026-07-16-remove-emergent-local-storage.md:885,987` | `docs/superpowers/plans/2026-07-16-remove-emergent-local-storage.md` | `docs/implementation/plans/pending-reconciliation/2026-07-16-remove-emergent-local-storage.md` | One unchecked build item prevents completed classification | `Show-Reference -Id R28 -Needle 'docs/superpowers/plans/2026-07-16-remove-emergent-local-storage.md'` |
| R29 | `.superpowers/archive/Niuva-clean-20260720-sdd/progress.md:3`<br>`docs/context/DOCUMENT_REGISTER.md:105` | `docs/superpowers/plans/2026-07-17-foundation-transaction-capability.md` | `docs/implementation/plans/pending-reconciliation/2026-07-17-foundation-transaction-capability.md`; ignored progress evidence retains literal | One hundred nine unchecked items prevent completed classification | `Show-Reference -Id R29 -Needle 'docs/superpowers/plans/2026-07-17-foundation-transaction-capability.md'` |
| R30 | `.superpowers/sdd/progress.md:3`<br>`docs/context/DOCUMENT_REGISTER.md:106`<br>`docs/superpowers/plans/2026-07-21-redesign-main-reconciliation.md:38,469` | `docs/superpowers/plans/2026-07-21-redesign-main-reconciliation.md` | `docs/implementation/history/2026-07-21-redesign-main-reconciliation.md`; ignored progress evidence retains literal | Branch-reconciliation workflow is historical context | `Show-Reference -Id R30 -Needle 'docs/superpowers/plans/2026-07-21-redesign-main-reconciliation.md'` |
| R31 | `docs/context/DOCUMENT_REGISTER.md:107` | `docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md` | Preserve byte-identical pending a dedicated gate | User-protected untracked file is outside base migration execution | `Show-Reference -Id R31 -Needle 'docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md'` |
| R32 | `doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md:63,139`<br>`docs/context/DOCUMENT_REGISTER.md:67`<br>`docs/superpowers/plans/2026-07-14-catalog-material-pricing-inventory-foundation.md:11` | `docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md` | `docs/implementation/specs/active/2026-07-14-catalog-material-pricing-inventory-foundation-design.md` | Normalize active bounded design | `Show-Reference -Id R32 -Needle 'docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md'` |
| R33 | `doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md:51,152`<br>`doc/BRD_Platform_Niuva_v2_addendum.md:8`<br>`doc/PRS_Platform_Niuva_v2_addendum.md:9`<br>`docs/context/DOCUMENT_REGISTER.md:62` | `docs/superpowers/specs/2026-07-14-integrated-operations-marketplace-design.md` | `docs/archive/superseded/2026-07-14-integrated-operations-marketplace-design.md` | Superseded design remains historical evidence only | `Show-Reference -Id R33 -Needle 'docs/superpowers/specs/2026-07-14-integrated-operations-marketplace-design.md'` |
| R34 | `AGENTS.md:37`<br>`doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md:43,74,89,153`<br>`doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md:8`<br>`doc/PRD_Platform_Niuva_v2_1_retail_b2b.md:7`<br>`doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md:9`<br>`docs/context/DOCUMENT_REGISTER.md:61`<br>`docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md:89`<br>`docs/NIUVA_MASTER_SPEC.md:44,57`<br>`docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md:13`<br>`docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md:212`<br>`docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md:6`<br>`docs/superpowers/specs/2026-07-14-integrated-operations-marketplace-design.md:5`<br>`docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md:7`<br>`memory/PRD.md:15`<br>`PRODUCT.md:17` | `docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md` | `docs/implementation/specs/active/2026-07-14-unified-retail-b2b-platform-design.md`; protected R31 source uses pointer | Normalize approved unified design while preserving compatibility | `Show-Reference -Id R34 -Needle 'docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md'` |
| R35 | `doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md:64,140`<br>`docs/context/DOCUMENT_REGISTER.md:68`<br>`docs/superpowers/plans/2026-07-16-remove-emergent-local-storage.md:987` | `docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md` | `docs/implementation/specs/active/2026-07-16-remove-emergent-local-storage-design.md` | Normalize approved bounded storage design | `Show-Reference -Id R35 -Needle 'docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md'` |
| R36 | `doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md:65,141`<br>`docs/context/DOCUMENT_REGISTER.md:69` | `docs/superpowers/specs/2026-07-16-retail-order-checkout-foundation-design.md` | `docs/implementation/specs/candidates/2026-07-16-retail-order-checkout-foundation-design.md` | Keep candidate physically distinct from approved specs | `Show-Reference -Id R36 -Needle 'docs/superpowers/specs/2026-07-16-retail-order-checkout-foundation-design.md'` |
| R37 | `docs/context/DOCUMENT_REGISTER.md:70` | `docs/superpowers/specs/2026-07-21-backend-framework-security-upgrade-design.md` | `docs/implementation/specs/active/2026-07-21-backend-framework-security-upgrade-design.md` | Normalize bounded branch-approved design | `Show-Reference -Id R37 -Needle 'docs/superpowers/specs/2026-07-21-backend-framework-security-upgrade-design.md'` |
| R38 | `docs/context/DOCUMENT_REGISTER.md:71`<br>`docs/superpowers/plans/2026-07-21-redesign-main-reconciliation.md:37,468` | `docs/superpowers/specs/2026-07-21-redesign-main-reconciliation-design.md` | `docs/implementation/history/2026-07-21-redesign-main-reconciliation-design.md` | Pair historical plan with its workflow design | `Show-Reference -Id R38 -Needle 'docs/superpowers/specs/2026-07-21-redesign-main-reconciliation-design.md'` |
| R39 | `AGENTS.md:5,30,324`<br>`doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md:48,138`<br>`docs/context/DOCUMENT_REGISTER.md:54`<br>`docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md:204` | `AGENTS.brand-baseline-v1.md` | `docs/references/requirements/historical-active/AGENTS.brand-baseline-v1.md`; root becomes pointer and protected R31 source remains valid | Remove competing root authority while retaining active guardrails | `Show-Reference -Id R39 -Needle 'AGENTS.brand-baseline-v1.md'` |
| R40 | `docs/context/DOCUMENT_REGISTER.md:53` | `PRODUCT.brand-baseline-v1.md` | `docs/references/requirements/historical-active/PRODUCT.brand-baseline-v1.md`; root becomes pointer | Normalize supporting historical orientation | `Show-Reference -Id R40 -Needle 'PRODUCT.brand-baseline-v1.md'` |
| R41 | `docs/context/DOCUMENT_REGISTER.md:87` | `design_guidelines.json` | `docs/archive/drafts/design_guidelines.json`; register via `docs/archive/README.md` | Archive Candidate cannot express a Markdown warning | `Show-Reference -Id R41 -Needle 'design_guidelines.json'` |
| R42 | `doc/PRD_Platform_Niuva_v2_1_retail_b2b.md:8`<br>`doc/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md:7,473,502,510,551,719,766,1303`<br>`docs/context/DOCUMENT_REGISTER.md:55` | `memory/PRD.md` | Preserve path; rewrite it as a concise pointer to canonical authority and the relocated PRD; preserve NIV-001 historical literals | External probes and history-rewrite procedures make movement unsafe | `Show-Reference -Id R42 -Needle 'memory/PRD.md'` |

The manifest baseline sums to 360: R01–R08 = 103, R09–R20 = 88,
R21–R31 = 111, and R32–R42 = 58. A post-migration hit is permitted only
when the matrix explicitly preserves the old path, creates a compatibility
pointer, or retains an immutable historical literal. All other active hits must
resolve to the proposed path.

## 6. Reconciliation Decisions for Transitional Documents

### 6.1 Root `AGENTS.md`

Recommendation: keep `AGENTS.md` at the repository root and rewrite it as a
concise agent entry point. It remains an Active Guardrail, but it must no longer
duplicate the product specification or create a competing requirements hierarchy.
Its target headings are exactly:

```markdown
# AGENTS.md — Niuva Repository Entry Point

## Canonical Reading Order
## Non-Negotiable Implementation Guardrails
## Repository Workflow
## Verification and Handover
```

The `Canonical Reading Order` section must use exactly this order:

```markdown
1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. The approved decision or ADR applicable to the task
5. The applicable runbook
6. The current source code and tests
7. Supporting references only when required
```

It must say exactly: `The Homepage direction is Unified Homepage with a
B2B-primary narrative and a Retail secondary path; detailed Retail/B2B navigation
remains deferred.` It must retain least privilege, customer/internal data
separation, transaction fail-closed behavior, provider-neutral storage/payment
boundaries, non-destructive migration, no-secret, no-unapproved-go-live, and
proportional verification guardrails. It must not cite any file under
`docs/archive/` as authority.

### 6.2 Root `PRODUCT.md`

Recommendation: keep `PRODUCT.md` at root and replace duplicated requirements
with a short orientation under these exact headings:

```markdown
# Niuva Product Orientation

## Product Shape
## Two Customer Journeys
## Shared Foundations and Separate Lifecycles
## Current Authority
## Deferred Decisions
```

The `Current Authority` opening must be exactly:

```markdown
This file is an orientation, not the detailed product specification. Start with
`docs/NIUVA_MASTER_SPEC.md`, then follow `docs/context/DOCUMENT_REGISTER.md` and
`docs/decisions/DECISION_REGISTER.md`.
```

The product shape remains one website and one operational platform with separate
Retail Order and B2B Quote/Project lifecycles. The Homepage direction must not be
listed as deferred; only detailed navigation treatment remains deferred. Detailed
requirements stay in approved baselines and technical constraints stay in ADRs.

### 6.3 Root `DESIGN.md`

Evidence supports an in-place rewrite as the active cross-surface implementation
design system, subject to an explicit DESIGN sub-gate. Splitting it into separate
files now would create a new authority graph before the shared token boundary is
stable. The rewritten file must separate public/brand, Retail, customer portal,
and Admin Studio guidance through sections in one document.

Required target headings are:

```markdown
# Niuva Cross-Surface Implementation Design System

## Authority and Scope
## Shared Semantic Tokens
## Typography by Surface
## Official Brand Mark
## Public Brand and B2B Surfaces
## Retail Commerce Surfaces
## Customer Portals
## Admin Studio Operational Surfaces
## Shared Components and Accessibility
## Transitional Component Mapping
```

Conflict resolutions are evidence-based:

- Preserve semantic color, spacing, radius, elevation, focus, state, and motion
  tokens currently consumed by `frontend/tailwind.config.js`,
  `frontend/src/index.css`, `SurfacePanel`, `TechnicalLabel`, `EmptyState`, and
  existing button variants.
- Replace a Poppins-only body rule with: `Use Poppins for approved display and UI
  emphasis; use Inter for body copy, metadata, forms, and dense operational text.`
- Limit JetBrains Mono to code, identifiers, measurements, and genuinely
  technical data. It must not create pseudo-terminal decoration on public pages.
- Replace the technical “N” mark with: `Use the approved lowercase ni mark from
  the brand source; do not construct an alternative letterform as product
  identity.`
- Public pages may use the Experimental Editorial Hybrid language governed by
  DEC-UX-002. Admin Studio follows DEC-OPS-001: dense, calm, status-led, and free
  of public-marketing decoration.
- This task changes documentation only. Component, CSS, asset, and page changes
  require a later implementation plan and authorization.

### 6.4 Homepage production plan

Recommendation: do not edit or move
`doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md` in the base migration.
`frontend/src/emergent-removal.test.js:20` pins the exact path, and the old plan
contains an outdated statement that Inter is not loaded. Create this replacement:

`docs/implementation/plans/pending-reconciliation/2026-07-23-homepage-production-implementation-plan.md`

Its exact authority statement must be:

```markdown
This plan is governed by DEC-UX-001 and DEC-UX-002. It specifies one Unified
Homepage with a B2B-primary narrative, a clear Retail secondary path, and the
Experimental Editorial Hybrid visual direction. It does not decide the detailed
Retail/B2B navigation treatment and does not authorize implementation.
```

The plan stays Homepage-only: no Auth redesign, Admin redesign, route expansion,
payment choice, provider choice, or production activation. After the replacement
is approved and a later source-change authorization removes the test path pin,
the old file may move to
`docs/implementation/history/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN-2026-07-13.md`.

### 6.5 Protected cross-surface plan

The current protected file is
`docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md`
with planning-baseline SHA-256
`8D169B4CB6CB63E4C7EAA67D5CF794536000F3828E6B24A93396013743613E32`.
Known conflicts are: it treats the Homepage pattern as deferred, proposes removal
of Inter, and combines Homepage, Auth, and Admin work into one broad scope.

The base migration must preserve it byte-identical and must not stage it. A
dedicated approval gate may authorize replacement by exactly two bounded plans:

- `docs/implementation/plans/pending-reconciliation/2026-07-23-auth-experience-remediation.md`
- `docs/implementation/plans/pending-reconciliation/2026-07-23-admin-studio-operational-remediation.md`

Homepage work belongs only in the Homepage replacement from Section 6.4. Neither
replacement may remove Inter or describe Homepage direction as deferred. Only
after both replacements are reviewed may a separate approval authorize moving the
original to
`docs/archive/drafts/2026-07-22-cross-surface-ui-ux-consistency-remediation.md`
and adding the canonical archive header. Because the original is untracked, its
hash must be recorded immediately before any authorized add or move.

## 7. Untouched and Excluded Evidence

### 7.1 Ignored `.superpowers` evidence

The following 38 ignored Markdown files remain in place, unmodified and
uncommitted. They may be scanned for inbound references, but are not imported into
the canonical tree:

- `.superpowers/archive/Niuva-clean-20260720-sdd/final-verification-ccac940.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/final-verification-rerun.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/progress.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/quality-fix-report.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-1-brief.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-1-implementer-report.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-10-brief.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-10-implementer-report.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-2-brief.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-2-implementer-report.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-3-brief.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-3-implementer-report.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-4-brief.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-4-implementer-report.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-5-brief.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-5-report.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-6-brief.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-6-implementer-report.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-7-brief.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-7-implementer-report.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-8-brief.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-8-implementer-report.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-9-brief.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/task-9-report.md`
- `.superpowers/archive/Niuva-clean-20260720-sdd/transaction-guard-rejection-fix-report.md`
- `.superpowers/sdd/progress.md`
- `.superpowers/sdd/task-1-brief.md`
- `.superpowers/sdd/task-1-report.md`
- `.superpowers/sdd/task-2-brief.md`
- `.superpowers/sdd/task-2-report.md`
- `.superpowers/sdd/task-3-brief.md`
- `.superpowers/sdd/task-3-report.md`
- `.superpowers/sdd/task-4-brief.md`
- `.superpowers/sdd/task-4-report.md`
- `.superpowers/sdd/task-5-report.md`
- `.superpowers/sdd/task-6-report.md`
- `.superpowers/sdd/task-7-report.md`
- `.superpowers/sdd/task-8-report.md`

Ignored `.diff` patch snapshots are also untouched. Dependency trees such as
`frontend/node_modules/` and `backend/.venv/`, generated caches, application
source, tests, CI, schemas, APIs, routes, and dependencies are excluded from file
mutation. The two source/test path hits remain read-only constraints.

## 8. Migration Task Sequence

Every task below is a future-execution task. None is authorized by creation or
approval of this plan alone. Migration execution must use an isolated sibling
Git worktree. Before creating one, detect whether execution is already running
inside a linked worktree and confirm that it is not a submodule. The preferred
branch is `docs/documentation-migration-20260723`; the preferred sibling
worktree is `C:\Portfolio\Niuva\Niuva-docs-migration-20260723`. Use a platform
native worktree mechanism when available, otherwise use the Git fallback below.
Because the canonical documents are untracked in the source checkout, copy them
(never move them) into the isolated worktree after creation. The source checkout
remains unchanged; do not create the worktree inside the repository, change
`.gitignore`, or copy the protected cross-surface plan.

### Task 1: Establish Canonical Baseline in an Isolated Worktree

**Purpose:** Create an isolated documentation branch, copy the approved
untracked canonical documents into it with byte-level verification, and create
the first documentation-only checkpoint without changing the source checkout.

**Source checkout:** Resolve dynamically; do not assume the planning-time branch
is still active.

```powershell
$sourceRoot = (git rev-parse --show-toplevel).Trim()
$sourceBranch = (git branch --show-current).Trim()
$sourceBaseCommit = (git rev-parse HEAD).Trim()
$sourceGitDir = (git rev-parse --git-dir).Trim()
$sourceGitCommonDir = (git rev-parse --git-common-dir).Trim()
$superproject = (git rev-parse --show-superproject-working-tree).Trim()
```

**Files copied into the isolated worktree:**

```text
docs/NIUVA_MASTER_SPEC.md
docs/context/CONVERSATION_HANDOFF.md
docs/context/DOCUMENT_REGISTER.md
docs/decisions/APPROVAL-NIUVA-CANONICAL-DOCUMENTATION-2026-07-23.md
docs/decisions/DECISION_REGISTER.md
docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md
docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md
docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md
docs/superpowers/plans/2026-07-23-documentation-migration-reconciliation.md
```

Copy only; never move or delete the source files. Do not copy, modify, stage, or
commit `docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md`.

**Authority constraints:** The eight canonical/decision files are already
stakeholder-approved and this checkpoint does not reopen their substance. Branch
creation, worktree creation, copying, staging, and committing all require
separate execution approval. No pre-existing tracked modification or unrelated
untracked file may enter the checkpoint.

- [ ] **Step 1: Detect isolation and record the source state.**

```powershell
$sourceRoot = (git rev-parse --show-toplevel).Trim()
$sourceBranch = (git branch --show-current).Trim()
$sourceBaseCommit = (git rev-parse HEAD).Trim()
$sourceGitDir = (git rev-parse --git-dir).Trim()
$sourceGitCommonDir = (git rev-parse --git-common-dir).Trim()
$superproject = (git rev-parse --show-superproject-working-tree).Trim()
$sourceStatus = @(git status --short)
$insideLinkedWorktree = $sourceGitDir -ne $sourceGitCommonDir
if ($insideLinkedWorktree -and -not $superproject) {
  throw 'Already inside a linked worktree; stop and report workspace state.'
}
```

Record the variables and complete source status baseline. If in the normal
source checkout, proceed only after explicit execution approval.

- [ ] **Step 2: Validate source files before worktree creation.**

Verify all nine source files exist and none is a directory. Compute SHA-256 for
each, verify the amended migration-plan hash after this rewrite is complete, and
verify the protected cross-surface SHA-256
`8D169B4CB6CB63E4C7EAA67D5CF794536000F3828E6B24A93396013743613E32`.
Do not hardcode the amended migration-plan hash until it has been recorded.

```powershell
$relativePaths = @(
  'docs/NIUVA_MASTER_SPEC.md',
  'docs/context/CONVERSATION_HANDOFF.md',
  'docs/context/DOCUMENT_REGISTER.md',
  'docs/decisions/APPROVAL-NIUVA-CANONICAL-DOCUMENTATION-2026-07-23.md',
  'docs/decisions/DECISION_REGISTER.md',
  'docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md',
  'docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md',
  'docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md',
  'docs/superpowers/plans/2026-07-23-documentation-migration-reconciliation.md'
)
$sourceHashes = foreach ($relativePath in $relativePaths) {
  $source = Join-Path $sourceRoot $relativePath
  if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Missing or non-file source: $relativePath" }
  Get-FileHash -Algorithm SHA256 -LiteralPath $source
}
Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $sourceRoot 'docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md')
```

- [ ] **Step 3: Create the isolated sibling worktree.**

Use the preferred native mechanism first. For the Git fallback:

```powershell
$worktreePath = 'C:\Portfolio\Niuva\Niuva-docs-migration-20260723'
$branchName = 'docs/documentation-migration-20260723'
git show-ref --verify --quiet "refs/heads/$branchName"
if ($LASTEXITCODE -eq 0) { throw "Branch already exists: $branchName" }
if (Test-Path -LiteralPath $worktreePath) { throw "Worktree path already exists: $worktreePath" }
git worktree add $worktreePath -b $branchName $sourceBaseCommit
git -C $worktreePath branch --show-current
git -C $worktreePath rev-parse HEAD
git -C $worktreePath status --short
```

Expected: the correct documentation branch, HEAD equal to the recorded source
base commit, and a clean isolated worktree.

- [ ] **Step 4: Copy only the canonical documents.**

For every listed relative path, use the following literal-path procedure; create
only its required destination parent directory. Do not use wildcard copy or copy
an entire directory.

```powershell
$source = Join-Path $sourceRoot $relativePath
$destination = Join-Path $worktreePath $relativePath
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
Copy-Item -LiteralPath $source -Destination $destination
```

- [ ] **Step 5: Verify byte identity.**

For every copied file, compute source and destination SHA-256 and produce this
table: `Relative path | Source SHA-256 | Destination SHA-256 | Match`. All nine
must match exactly. On any mismatch, stop without staging or committing, leave
the source checkout untouched, and report the mismatch. The destination
migration plan must match the recorded amended migration-plan hash.

- [ ] **Step 6: Verify isolated and source status.**

Run `git -C $worktreePath status --short`. Expect exactly nine untracked files,
no tracked modification, no source-code change, and no protected cross-surface
plan. Also verify that the source checkout status is unchanged from its recorded
baseline.

- [ ] **Step 7: Stage explicit files only.**

```powershell
git -C $worktreePath add -- `
  'docs/NIUVA_MASTER_SPEC.md' `
  'docs/context/CONVERSATION_HANDOFF.md' `
  'docs/context/DOCUMENT_REGISTER.md' `
  'docs/decisions/APPROVAL-NIUVA-CANONICAL-DOCUMENTATION-2026-07-23.md' `
  'docs/decisions/DECISION_REGISTER.md' `
  'docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md' `
  'docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md' `
  'docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md' `
  'docs/superpowers/plans/2026-07-23-documentation-migration-reconciliation.md'
```

Never use `git add .` or `git add -A`.

- [ ] **Step 8: Verify the staged baseline.**

Run `git -C $worktreePath status --short`, `git -C $worktreePath diff --cached
--check`, `git -C $worktreePath diff --cached --stat`, and `git -C $worktreePath
diff --cached --name-status`. Expect exactly nine staged additions; zero
modification, deletion, application-source path, or protected cross-surface-plan
path. Run the documentation link and authority scans already defined by this
plan from `$worktreePath`.

- [ ] **Step 9: Create the baseline commit only after separate approval.**

```powershell
git -C $worktreePath commit -m 'docs: establish canonical documentation baseline'
git -C $worktreePath status --short
git -C $worktreePath show --stat --oneline --decorate HEAD
git -C $worktreePath show --name-status --format=fuller HEAD
git -C $worktreePath rev-parse HEAD
git worktree list
```

Expected: one documentation-only commit with exactly nine added files, a clean
isolated worktree, unchanged source checkout, and no push.

**Rollback:** Before commit, unstage only the nine explicit paths; never delete
source files, and remove the isolated worktree only after confirming it contains
no additional user work with `git -C $worktreePath status --short`. After commit,
revert the baseline commit in the isolated branch; do not reset the source
checkout or delete unrelated branches or worktrees.

### Task 2: Reconcile Root Entry Points

**Purpose:** Make root entry points concise and subordinate to canonical authority
without changing product behavior.

**Files:**
- Modify: `AGENTS.md`
- Modify: `PRODUCT.md`
- Modify: `memory/PRD.md`
- Modify: `docs/context/DOCUMENT_REGISTER.md`
- Preserve untouched: `DESIGN.md`
- Preserve untouched: `docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md`

**Authority constraints:**
- Use the exact headings and wording from Sections 6.1 and 6.2.
- `memory/PRD.md` becomes a pointer, not a new PRD.
- Do not duplicate the Master Spec or cite archive content as authority.
- Do not alter product journeys or deferred provider/policy decisions.

**Inbound references:**
- `AGENTS.md:5,24-45,226,236,260,324`
- `PRODUCT.md:14-25,175-177`
- R42 locations from Section 5.2.

**Rollback:** Revert the root-entry-point commit. If uncommitted, use a reverse
`apply_patch` limited to these four files; do not restore unrelated paths.

- [ ] **Step 1: Replace the authority preamble and duplicated requirement blocks.**

Command:

```powershell
Select-String -Path AGENTS.md,PRODUCT.md,memory/PRD.md -Pattern '^#','Homepage','doc/','docs/'
```

Expected: the implementer applies the exact target headings and statements in
Sections 6.1–6.2. `memory/PRD.md` must contain exactly these authority lines:

```markdown
# Canonical Product Requirements Pointer

This path is retained for compatibility only. Start with
`docs/NIUVA_MASTER_SPEC.md`, then follow
`docs/context/DOCUMENT_REGISTER.md` and
`docs/decisions/DECISION_REGISTER.md`.

Detailed approved platform requirements are currently recorded in
`doc/PRD_Platform_Niuva_v2_1_retail_b2b.md`. Task 4 replaces this line with the
approved-baseline destination in the migration matrix.
```

- [ ] **Step 2: Register the three root treatments.**

Command:

```powershell
Select-String -LiteralPath docs/context/DOCUMENT_REGISTER.md -Pattern 'AGENTS.md','PRODUCT.md','DESIGN.md','memory/PRD.md'
```

Expected: `AGENTS.md` is Active Guardrail, `PRODUCT.md` is orientation under
Approved Baseline, `memory/PRD.md` is Context Only compatibility, and `DESIGN.md`
remains transitional Active Guardrail pending Task 9.

- [ ] **Step 3: Verify root reading order and scope.**

Command:

```powershell
git diff --check -- AGENTS.md PRODUCT.md memory/PRD.md docs/context/DOCUMENT_REGISTER.md
git diff --name-only -- AGENTS.md PRODUCT.md memory/PRD.md docs/context/DOCUMENT_REGISTER.md
Select-String -Path AGENTS.md,PRODUCT.md -SimpleMatch -Pattern 'Homepage pattern remains deferred'
```

Expected: the first command is clean, the second lists exactly the four owned
paths, and the prohibited Homepage statement has zero matches.

- [ ] **Step 4: Commit only after approval.**

Command:

```powershell
git add -- AGENTS.md PRODUCT.md memory/PRD.md docs/context/DOCUMENT_REGISTER.md
git diff --cached --check
git commit -m "docs: reconcile root documentation entry points"
```

Expected: one documentation-only commit; no push.

### Task 3: Normalize Decisions and Architecture Records

**Purpose:** Put approved ADRs and the v2.1 decision log beneath explicit decision
subtrees while keeping high-inbound old paths functional.

**Files:**
- Move: `doc/decisions/ADR-001-mongodb-transaction-capability.md` → `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
- Move: `doc/decisions/ADR-002-production-file-storage-architecture.md` → `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`
- Move: `doc/decisions/ADR-003-retail-payment-orchestration-boundary.md` → `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`
- Move: `doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md` → `docs/decisions/product/DECISION_LOG_Platform_Niuva_v2_1.md`
- Create: the four old-path compatibility pointers defined in Section 4.4
- Modify: `docs/NIUVA_MASTER_SPEC.md`
- Modify: `docs/context/DOCUMENT_REGISTER.md`
- Modify: `docs/decisions/DECISION_REGISTER.md`
- Modify: `AGENTS.md`
- Modify: `PRODUCT.md`
- Modify: `doc/PRODUCTION_DEPLOYMENT.md`
- Modify path references only: `doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md`
- Modify path references only: `doc/PRD_Platform_Niuva_v2_1_retail_b2b.md`
- Modify path references only: `docs/superpowers/plans/2026-07-17-foundation-transaction-capability.md`
- Modify path references only: `docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md`
- Modify path references only: `docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md`
- Modify path references only: `docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md`
- Modify path references only: `docs/superpowers/specs/2026-07-16-retail-order-checkout-foundation-design.md`
- Preserve untouched: ignored `.superpowers/` evidence

**Authority constraints:**
- ADR status, decisions, open questions, and fail-closed rules remain unchanged.
- No provider, Finance, production-upload, infrastructure, or go-live choice is
  introduced.
- Historical ignored evidence is not rewritten.

**Inbound references:**
- R21, R22, R23, and R24 in Section 5.2.

**Rollback:** Revert the decisions commit. Before a commit, reverse the four
`git mv` commands and reverse only the manifest-listed edits. Remove a pointer
only after its original document has returned to that path.

- [ ] **Step 1: Create decision destinations and move with Git history.**

Command:

```powershell
New-Item -ItemType Directory -Force -Path docs/decisions/architecture,docs/decisions/product | Out-Null
git mv -- doc/decisions/ADR-001-mongodb-transaction-capability.md docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md
git mv -- doc/decisions/ADR-002-production-file-storage-architecture.md docs/decisions/architecture/ADR-002-production-file-storage-architecture.md
git mv -- doc/decisions/ADR-003-retail-payment-orchestration-boundary.md docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md
git mv -- doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md docs/decisions/product/DECISION_LOG_Platform_Niuva_v2_1.md
git status --short
```

Expected: four renames are visible; no application path changes.

- [ ] **Step 2: Materialize the four literal compatibility pointers and repair active references.**

Command:

```powershell
Show-Reference -Id R21 -Needle 'doc/decisions/ADR-001-mongodb-transaction-capability.md'
Show-Reference -Id R22 -Needle 'doc/decisions/ADR-002-production-file-storage-architecture.md'
Show-Reference -Id R23 -Needle 'doc/decisions/ADR-003-retail-payment-orchestration-boundary.md'
Show-Reference -Id R24 -Needle 'doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md'
```

Expected: every active authority location named in R21–R24 points to the new
path; old hits exist only in the four pointer files and preserved historical
evidence. Pointer content is generated by Section 3.2 with the four literal
destinations from Section 4.4.

- [ ] **Step 3: Verify decision authority and diff scope.**

Command:

```powershell
git diff --check
git diff --name-status
Select-String -Path docs/decisions/architecture/*.md -Pattern '^Status:','Open','Deferred','provider','go-live'
```

Expected: three ADR destinations and one decision-log destination exist; all
original decision/open-decision language remains; only documentation paths differ.

- [ ] **Step 4: Commit only after approval.**

Command:

```powershell
git add -- AGENTS.md PRODUCT.md doc/PRODUCTION_DEPLOYMENT.md doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md doc/PRD_Platform_Niuva_v2_1_retail_b2b.md doc/decisions/ADR-001-mongodb-transaction-capability.md doc/decisions/ADR-002-production-file-storage-architecture.md doc/decisions/ADR-003-retail-payment-orchestration-boundary.md doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md docs/decisions/architecture/ADR-002-production-file-storage-architecture.md docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md docs/decisions/product/DECISION_LOG_Platform_Niuva_v2_1.md docs/NIUVA_MASTER_SPEC.md docs/context/DOCUMENT_REGISTER.md docs/decisions/DECISION_REGISTER.md docs/superpowers/plans/2026-07-17-foundation-transaction-capability.md docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md docs/superpowers/specs/2026-07-16-retail-order-checkout-foundation-design.md
git diff --cached --check
git commit -m "docs: normalize decisions and architecture records"
```

Expected: one independently revertible documentation-only commit.

### Task 4: Normalize Requirements and Unified Platform Design

**Purpose:** Separate approved v2.1 requirements, historical-active website
requirements, approval evidence, root brand baselines, and the approved unified
design while preserving common old paths.

**Files:**
- Move: `doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md` → `docs/decisions/evidence/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md`
- Move: `doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md` → `docs/references/requirements/approved-baselines/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md`
- Move: `doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md` → `docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md`
- Move: `doc/PRD_Platform_Niuva_v2_1_retail_b2b.md` → `docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md`
- Move: `doc/BRD_Website_Niuva.md` → `docs/references/requirements/historical-active/BRD_Website_Niuva.md`
- Move: `doc/PRS_Website_Niuva.md` → `docs/references/requirements/historical-active/PRS_Website_Niuva.md`
- Move: `AGENTS.brand-baseline-v1.md` → `docs/references/requirements/historical-active/AGENTS.brand-baseline-v1.md`
- Move: `PRODUCT.brand-baseline-v1.md` → `docs/references/requirements/historical-active/PRODUCT.brand-baseline-v1.md`
- Move: `docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md` → `docs/implementation/specs/active/2026-07-14-unified-retail-b2b-platform-design.md`
- Create: nine compatibility pointers at the old paths listed in Section 4.4
- Modify path references only: `AGENTS.md`
- Modify path references only: `PRODUCT.md`
- Modify path references only: `memory/PRD.md`
- Modify path references only: `doc/BRD_Platform_Niuva_v2_addendum.md`
- Modify path references only: `doc/PRS_Platform_Niuva_v2_addendum.md`
- Modify path references only: `doc/brand/BRAND_WEBSITE_AUDIT.md`
- Modify path references only: `docs/NIUVA_MASTER_SPEC.md`
- Modify path references only: `docs/context/DOCUMENT_REGISTER.md`
- Modify path references only: `docs/decisions/DECISION_REGISTER.md`
- Modify path references only: `docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md`
- Modify path references only: `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md`
- Modify path references only: `docs/decisions/product/DECISION_LOG_Platform_Niuva_v2_1.md`
- Modify path references only: `docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md`
- Modify path references only: `docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md`
- Modify path references only: `docs/superpowers/specs/2026-07-14-integrated-operations-marketplace-design.md`
- Modify path references only: `docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md`
- Preserve untouched: the protected R31 source and ignored `.superpowers/` evidence

**Authority constraints:**
- v2.1 requirements remain Approved Baselines; website v1 remains Historical
  Active only where canonical v2.1 is silent.
- The unified design remains subordinate to BRD/PRS/PRD and approved decisions.
- Protected plan references resolve through pointers and its bytes do not change.

**Inbound references:**
- R01–R06, R34, R39, and R40 in Section 5.

**Rollback:** Revert the requirements commit. Before commit, reverse all nine
moves in reverse order, restore old file contents before deleting pointers, and
reverse only R01–R06/R34/R39/R40 path substitutions.

- [ ] **Step 1: Create exact destinations and move tracked files.**

Command:

```powershell
New-Item -ItemType Directory -Force -Path docs/decisions/evidence,docs/references/requirements/approved-baselines,docs/references/requirements/historical-active,docs/implementation/specs/active | Out-Null
git mv -- doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md docs/decisions/evidence/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md
git mv -- doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md docs/references/requirements/approved-baselines/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md
git mv -- doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md
git mv -- doc/PRD_Platform_Niuva_v2_1_retail_b2b.md docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md
git mv -- doc/BRD_Website_Niuva.md docs/references/requirements/historical-active/BRD_Website_Niuva.md
git mv -- doc/PRS_Website_Niuva.md docs/references/requirements/historical-active/PRS_Website_Niuva.md
git mv -- AGENTS.brand-baseline-v1.md docs/references/requirements/historical-active/AGENTS.brand-baseline-v1.md
git mv -- PRODUCT.brand-baseline-v1.md docs/references/requirements/historical-active/PRODUCT.brand-baseline-v1.md
git mv -- docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md docs/implementation/specs/active/2026-07-14-unified-retail-b2b-platform-design.md
```

Expected: nine Git renames with destinations matching Section 4 exactly.

- [ ] **Step 2: Create nine literal pointers and repair active manifest locations.**

Command:

```powershell
Show-Reference -Id R01 -Needle 'doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md'
Show-Reference -Id R02 -Needle 'doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md'
Show-Reference -Id R03 -Needle 'doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md'
Show-Reference -Id R04 -Needle 'doc/PRD_Platform_Niuva_v2_1_retail_b2b.md'
Show-Reference -Id R05 -Needle 'doc/BRD_Website_Niuva.md'
Show-Reference -Id R06 -Needle 'doc/PRS_Website_Niuva.md'
Show-Reference -Id R34 -Needle 'docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md'
Show-Reference -Id R39 -Needle 'AGENTS.brand-baseline-v1.md'
Show-Reference -Id R40 -Needle 'PRODUCT.brand-baseline-v1.md'
```

Expected: active documents use new destinations; each old path contains exactly
one compatibility pointer; the protected plan still matches its approved hash.

- [ ] **Step 3: Verify approval boundaries and file history.**

Command:

```powershell
git diff --check
git diff --summary
Get-FileHash -Algorithm SHA256 -LiteralPath 'docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md'
Select-String -Path docs/references/requirements/approved-baselines/*.md -Pattern 'Approved','Deferred','Open'
```

Expected: renames are detectable, the protected hash remains exact, and approved
versus open decisions remain visible.

- [ ] **Step 4: Commit only after approval.**

Command:

```powershell
git add -- AGENTS.md PRODUCT.md memory/PRD.md AGENTS.brand-baseline-v1.md PRODUCT.brand-baseline-v1.md doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md doc/PRD_Platform_Niuva_v2_1_retail_b2b.md doc/BRD_Website_Niuva.md doc/PRS_Website_Niuva.md docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md docs/decisions/evidence/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md docs/references/requirements/approved-baselines/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md docs/references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md docs/references/requirements/historical-active/BRD_Website_Niuva.md docs/references/requirements/historical-active/PRS_Website_Niuva.md docs/references/requirements/historical-active/AGENTS.brand-baseline-v1.md docs/references/requirements/historical-active/PRODUCT.brand-baseline-v1.md docs/implementation/specs/active/2026-07-14-unified-retail-b2b-platform-design.md doc/BRD_Platform_Niuva_v2_addendum.md doc/PRS_Platform_Niuva_v2_addendum.md doc/brand/BRAND_WEBSITE_AUDIT.md docs/NIUVA_MASTER_SPEC.md docs/context/DOCUMENT_REGISTER.md docs/decisions/DECISION_REGISTER.md docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md docs/decisions/product/DECISION_LOG_Platform_Niuva_v2_1.md docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md docs/superpowers/specs/2026-07-14-integrated-operations-marketplace-design.md docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md
git diff --cached --check
git commit -m "docs: organize approved and historical requirements"
```

Expected: one documentation-only commit, excluding the protected plan.

### Task 5: Normalize Runbooks

**Purpose:** Consolidate procedural authority under `docs/runbooks/` while
retaining paths that are externally or programmatically constrained.

**Files:**
- Move: `doc/IDENTITY_RBAC_AUDIT_RUNBOOK.md` → `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md`
- Move: `doc/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md` → `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md`
- Move: `doc/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md` → `docs/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md`
- Create: compatibility pointers at `doc/IDENTITY_RBAC_AUDIT_RUNBOOK.md` and `doc/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md`
- Modify path references only: `docs/NIUVA_MASTER_SPEC.md`
- Modify path references only: `docs/context/DOCUMENT_REGISTER.md`
- Modify path references only: `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md`
- Modify path references only: `docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md`
- Modify path references only: `docs/superpowers/plans/2026-07-14-catalog-material-pricing-inventory-foundation.md`
- Modify path references only: `docs/superpowers/plans/2026-07-17-foundation-transaction-capability.md`
- Preserve path and verify the Task 3 ADR reference repairs: `doc/PRODUCTION_DEPLOYMENT.md`
- Preserve untouched: ignored `.superpowers/` evidence

**Authority constraints:**
- Runbook procedures remain procedural, not product authority.
- NIV-001 credential-incident literals remain unchanged even when they name old
  paths.
- `doc/PRODUCTION_DEPLOYMENT.md` does not move because
  `frontend/src/emergent-removal.test.js:19` reads its current path.

**Inbound references:**
- R09, R10, R11, and R25 in Section 5.1.

**Rollback:** Revert the runbook commit. Before commit, restore the three files to
their original paths in reverse order; remove a pointer only after the original
content has returned; reverse only path substitutions outside NIV-001 historical
procedure lines.

- [ ] **Step 1: Move only the three unconstrained runbooks.**

Command:

```powershell
New-Item -ItemType Directory -Force -Path docs/runbooks | Out-Null
git mv -- doc/IDENTITY_RBAC_AUDIT_RUNBOOK.md docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md
git mv -- doc/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md
git mv -- doc/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md docs/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md
```

Expected: three renames; `doc/PRODUCTION_DEPLOYMENT.md` remains at the same path.

- [ ] **Step 2: Create two pointers and repair the active R09/R10/R25 sources.**

Command:

```powershell
Show-Reference -Id R09 -Needle 'doc/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md'
Show-Reference -Id R10 -Needle 'doc/IDENTITY_RBAC_AUDIT_RUNBOOK.md'
Show-Reference -Id R25 -Needle 'doc/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md'
```

Expected: canonical and pending documents use `docs/runbooks/` paths; ignored
evidence may use the two pointers; NIV-001 internal historical paths remain.

- [ ] **Step 3: Verify the two source/test pins.**

Command:

```powershell
Select-String -LiteralPath frontend/src/emergent-removal.test.js -SimpleMatch -Pattern 'doc/PRODUCTION_DEPLOYMENT.md','doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md'
Test-Path -LiteralPath doc/PRODUCTION_DEPLOYMENT.md
Test-Path -LiteralPath doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md
```

Expected: both test literals and both target files still exist.

- [ ] **Step 4: Verify and commit only after approval.**

Command:

```powershell
git diff --check
git add -- doc/IDENTITY_RBAC_AUDIT_RUNBOOK.md doc/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md doc/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md docs/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md docs/NIUVA_MASTER_SPEC.md docs/context/DOCUMENT_REGISTER.md docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md docs/superpowers/plans/2026-07-14-catalog-material-pricing-inventory-foundation.md docs/superpowers/plans/2026-07-17-foundation-transaction-capability.md
git diff --cached --check
git commit -m "docs: normalize operational runbooks"
```

Expected: one documentation-only commit; no source/test change.

### Task 6: Normalize Brand and Company References

**Purpose:** Consolidate non-authoritative brand/company source material and
prototype decision evidence without changing binary content.

**Files:**
- Copy: `doc/Company profile PT Niuva_compressed.pdf` → `docs/references/company/Company profile PT Niuva_compressed.pdf`
- Copy: `doc/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf` → `docs/references/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf`
- Move: `doc/brand/BRAND_WEBSITE_AUDIT.md` → `docs/references/brand/BRAND_WEBSITE_AUDIT.md`
- Move: `doc/brand/BRAND_APPROVAL_DECISIONS.md` → `docs/decisions/evidence/BRAND_APPROVAL_DECISIONS.md`
- Move: `doc/brand/HOMEPAGE_PROTOTYPE_REVIEW.md` → `docs/decisions/evidence/HOMEPAGE_PROTOTYPE_REVIEW.md`
- Move: `doc/brand/HOMEPAGE_PROTOTYPE_DECISION.md` → `docs/decisions/evidence/HOMEPAGE_PROTOTYPE_DECISION.md`
- Modify path references only: `docs/NIUVA_MASTER_SPEC.md`
- Modify path references only: `docs/context/DOCUMENT_REGISTER.md`
- Modify path references only: `docs/decisions/DECISION_REGISTER.md`
- Modify path references only: `docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md`
- Modify path references only: `docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md`
- Preserve untouched: `doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md`

**Authority constraints:**
- PDFs and the audit remain Supporting References.
- DEC-UX-001 and DEC-UX-002 remain the active Homepage decision authority.
- Moving older decision/review evidence does not promote it above DEC-UX records.

**Inbound references:**
- R12, R13, R16, R18, R19, and R20 in Section 5.1.

**Rollback:** Revert the brand-reference commit. Before commit, delete only the two
new PDF copies after confirming their old byte-identical sources remain; reverse
the four `git mv` operations and the six manifest path substitutions.

- [ ] **Step 1: Copy binaries and prove byte identity.**

Command:

```powershell
New-Item -ItemType Directory -Force -Path docs/references/company,docs/references/brand | Out-Null
if (Test-Path -LiteralPath 'docs/references/company/Company profile PT Niuva_compressed.pdf') { throw 'Company Profile destination already exists' }
if (Test-Path -LiteralPath 'docs/references/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf') { throw 'Brand Guidelines destination already exists' }
Copy-Item -LiteralPath 'doc/Company profile PT Niuva_compressed.pdf' -Destination 'docs/references/company/Company profile PT Niuva_compressed.pdf'
Copy-Item -LiteralPath 'doc/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf' -Destination 'docs/references/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf'
Get-FileHash -Algorithm SHA256 -LiteralPath 'doc/Company profile PT Niuva_compressed.pdf','docs/references/company/Company profile PT Niuva_compressed.pdf'
Get-FileHash -Algorithm SHA256 -LiteralPath 'doc/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf','docs/references/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf'
```

Expected: each old/new pair has the same SHA-256; both old PDFs remain.

- [ ] **Step 2: Move four tracked Markdown evidence files.**

Command:

```powershell
git mv -- doc/brand/BRAND_WEBSITE_AUDIT.md docs/references/brand/BRAND_WEBSITE_AUDIT.md
git mv -- doc/brand/BRAND_APPROVAL_DECISIONS.md docs/decisions/evidence/BRAND_APPROVAL_DECISIONS.md
git mv -- doc/brand/HOMEPAGE_PROTOTYPE_REVIEW.md docs/decisions/evidence/HOMEPAGE_PROTOTYPE_REVIEW.md
git mv -- doc/brand/HOMEPAGE_PROTOTYPE_DECISION.md docs/decisions/evidence/HOMEPAGE_PROTOTYPE_DECISION.md
```

Expected: four Git renames and two added PDF copies.

- [ ] **Step 3: Repair only R12/R13/R16/R18/R19/R20 active sources.**

Command:

```powershell
Show-Reference -Id R12 -Needle 'doc/Company profile PT Niuva_compressed.pdf'
Show-Reference -Id R13 -Needle 'doc/brand/BRAND_APPROVAL_DECISIONS.md'
Show-Reference -Id R16 -Needle 'doc/brand/BRAND_WEBSITE_AUDIT.md'
Show-Reference -Id R18 -Needle 'doc/brand/HOMEPAGE_PROTOTYPE_DECISION.md'
Show-Reference -Id R19 -Needle 'doc/brand/HOMEPAGE_PROTOTYPE_REVIEW.md'
Show-Reference -Id R20 -Needle 'doc/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf'
```

Expected: active documents use canonical reference/evidence paths; no old
Markdown evidence path remains in active documents.

- [ ] **Step 4: Verify and commit only after approval.**

Command:

```powershell
git diff --check
git add -- 'doc/brand/BRAND_WEBSITE_AUDIT.md' 'doc/brand/BRAND_APPROVAL_DECISIONS.md' 'doc/brand/HOMEPAGE_PROTOTYPE_REVIEW.md' 'doc/brand/HOMEPAGE_PROTOTYPE_DECISION.md' 'docs/references/brand/BRAND_WEBSITE_AUDIT.md' 'docs/references/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf' 'docs/references/company/Company profile PT Niuva_compressed.pdf' 'docs/decisions/evidence/BRAND_APPROVAL_DECISIONS.md' 'docs/decisions/evidence/HOMEPAGE_PROTOTYPE_REVIEW.md' 'docs/decisions/evidence/HOMEPAGE_PROTOTYPE_DECISION.md' docs/NIUVA_MASTER_SPEC.md docs/context/DOCUMENT_REGISTER.md docs/decisions/DECISION_REGISTER.md docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md
git diff --cached --check
git commit -m "docs: normalize brand and company references"
```

Expected: one documentation-only commit; old PDFs remain byte-identical.

### Task 7: Normalize Implementation Specs, Plans, and History

**Purpose:** Separate active specs, candidates, incomplete plans, and completed
branch-workflow history using repository evidence rather than filename age.

**Files:**
- Move: `docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md` → `docs/implementation/specs/active/2026-07-14-catalog-material-pricing-inventory-foundation-design.md`
- Move: `docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md` → `docs/implementation/specs/active/2026-07-16-remove-emergent-local-storage-design.md`
- Move: `docs/superpowers/specs/2026-07-16-retail-order-checkout-foundation-design.md` → `docs/implementation/specs/candidates/2026-07-16-retail-order-checkout-foundation-design.md`
- Move: `docs/superpowers/specs/2026-07-21-backend-framework-security-upgrade-design.md` → `docs/implementation/specs/active/2026-07-21-backend-framework-security-upgrade-design.md`
- Move: `docs/superpowers/specs/2026-07-21-redesign-main-reconciliation-design.md` → `docs/implementation/history/2026-07-21-redesign-main-reconciliation-design.md`
- Move: `docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md` → `docs/implementation/plans/pending-reconciliation/2026-07-14-foundation-identity-rbac-organization-audit.md`
- Move: `docs/superpowers/plans/2026-07-14-catalog-material-pricing-inventory-foundation.md` → `docs/implementation/plans/pending-reconciliation/2026-07-14-catalog-material-pricing-inventory-foundation.md`
- Move: `docs/superpowers/plans/2026-07-16-remove-emergent-local-storage.md` → `docs/implementation/plans/pending-reconciliation/2026-07-16-remove-emergent-local-storage.md`
- Move: `docs/superpowers/plans/2026-07-17-foundation-transaction-capability.md` → `docs/implementation/plans/pending-reconciliation/2026-07-17-foundation-transaction-capability.md`
- Move: `docs/superpowers/plans/2026-07-21-redesign-main-reconciliation.md` → `docs/implementation/history/2026-07-21-redesign-main-reconciliation.md`
- Modify: `docs/context/DOCUMENT_REGISTER.md`
- Modify: the moved files at R26–R30, R32, R35–R38 only for exact path repairs
- Preserve untouched: protected R31 plan

**Authority constraints:**
- Unchecked counts remain evidence: identity 47, catalog 2, storage-removal 1,
  transaction 109, redesign-main 31.
- Candidate checkout design is not promoted.
- Active implementation specs remain subordinate to canonical product authority.
- No checklist item is marked complete by this migration.

**Inbound references:**
- R26–R30, R32, and R35–R38 in Section 5.2.

**Rollback:** Revert the implementation-taxonomy commit. Before commit, reverse
the ten moves in reverse order and reverse only the manifest path substitutions;
do not change checkbox state.

- [ ] **Step 1: Recount checkboxes before classification.**

Command:

```powershell
$planFiles = @(
  'docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md',
  'docs/superpowers/plans/2026-07-14-catalog-material-pricing-inventory-foundation.md',
  'docs/superpowers/plans/2026-07-16-remove-emergent-local-storage.md',
  'docs/superpowers/plans/2026-07-17-foundation-transaction-capability.md',
  'docs/superpowers/plans/2026-07-21-redesign-main-reconciliation.md'
)
foreach ($file in $planFiles) {
  $open = @(Select-String -LiteralPath $file -Pattern '^- \[ \]').Count
  $done = @(Select-String -LiteralPath $file -Pattern '^- \[x\]' -CaseSensitive:$false).Count
  '{0}|OPEN={1}|DONE={2}' -f $file,$open,$done
}
```

Expected: `47/0`, `2/88`, `1/39`, `109/0`, and `31/0` open/done counts in
the listed order. A mismatch pauses classification for review.

- [ ] **Step 2: Move the ten exact paths.**

Command:

```powershell
New-Item -ItemType Directory -Force -Path docs/implementation/specs/active,docs/implementation/specs/candidates,docs/implementation/plans/pending-reconciliation,docs/implementation/history | Out-Null
git mv -- docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md docs/implementation/specs/active/2026-07-14-catalog-material-pricing-inventory-foundation-design.md
git mv -- docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md docs/implementation/specs/active/2026-07-16-remove-emergent-local-storage-design.md
git mv -- docs/superpowers/specs/2026-07-16-retail-order-checkout-foundation-design.md docs/implementation/specs/candidates/2026-07-16-retail-order-checkout-foundation-design.md
git mv -- docs/superpowers/specs/2026-07-21-backend-framework-security-upgrade-design.md docs/implementation/specs/active/2026-07-21-backend-framework-security-upgrade-design.md
git mv -- docs/superpowers/specs/2026-07-21-redesign-main-reconciliation-design.md docs/implementation/history/2026-07-21-redesign-main-reconciliation-design.md
git mv -- docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md docs/implementation/plans/pending-reconciliation/2026-07-14-foundation-identity-rbac-organization-audit.md
git mv -- docs/superpowers/plans/2026-07-14-catalog-material-pricing-inventory-foundation.md docs/implementation/plans/pending-reconciliation/2026-07-14-catalog-material-pricing-inventory-foundation.md
git mv -- docs/superpowers/plans/2026-07-16-remove-emergent-local-storage.md docs/implementation/plans/pending-reconciliation/2026-07-16-remove-emergent-local-storage.md
git mv -- docs/superpowers/plans/2026-07-17-foundation-transaction-capability.md docs/implementation/plans/pending-reconciliation/2026-07-17-foundation-transaction-capability.md
git mv -- docs/superpowers/plans/2026-07-21-redesign-main-reconciliation.md docs/implementation/history/2026-07-21-redesign-main-reconciliation.md
```

Expected: ten renames; protected R31 remains in `docs/superpowers/plans/`.

- [ ] **Step 3: Repair exact implementation references and register status.**

Command:

```powershell
Show-Reference -Id R26 -Needle 'docs/superpowers/plans/2026-07-14-catalog-material-pricing-inventory-foundation.md'
Show-Reference -Id R27 -Needle 'docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md'
Show-Reference -Id R28 -Needle 'docs/superpowers/plans/2026-07-16-remove-emergent-local-storage.md'
Show-Reference -Id R29 -Needle 'docs/superpowers/plans/2026-07-17-foundation-transaction-capability.md'
Show-Reference -Id R30 -Needle 'docs/superpowers/plans/2026-07-21-redesign-main-reconciliation.md'
Show-Reference -Id R32 -Needle 'docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md'
Show-Reference -Id R35 -Needle 'docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md'
Show-Reference -Id R36 -Needle 'docs/superpowers/specs/2026-07-16-retail-order-checkout-foundation-design.md'
Show-Reference -Id R37 -Needle 'docs/superpowers/specs/2026-07-21-backend-framework-security-upgrade-design.md'
Show-Reference -Id R38 -Needle 'docs/superpowers/specs/2026-07-21-redesign-main-reconciliation-design.md'
```

Expected: active paths are repaired; ignored progress evidence may retain literal
old paths; protected R31 remains byte-identical.

- [ ] **Step 4: Verify and commit only after approval.**

Command:

```powershell
git diff --check
Get-FileHash -Algorithm SHA256 -LiteralPath 'docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md'
git add -- docs/context/DOCUMENT_REGISTER.md docs/implementation/specs/active/2026-07-14-catalog-material-pricing-inventory-foundation-design.md docs/implementation/specs/active/2026-07-16-remove-emergent-local-storage-design.md docs/implementation/specs/candidates/2026-07-16-retail-order-checkout-foundation-design.md docs/implementation/specs/active/2026-07-21-backend-framework-security-upgrade-design.md docs/implementation/history/2026-07-21-redesign-main-reconciliation-design.md docs/implementation/plans/pending-reconciliation/2026-07-14-foundation-identity-rbac-organization-audit.md docs/implementation/plans/pending-reconciliation/2026-07-14-catalog-material-pricing-inventory-foundation.md docs/implementation/plans/pending-reconciliation/2026-07-16-remove-emergent-local-storage.md docs/implementation/plans/pending-reconciliation/2026-07-17-foundation-transaction-capability.md docs/implementation/history/2026-07-21-redesign-main-reconciliation.md docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md docs/superpowers/specs/2026-07-16-retail-order-checkout-foundation-design.md docs/superpowers/specs/2026-07-21-backend-framework-security-upgrade-design.md docs/superpowers/specs/2026-07-21-redesign-main-reconciliation-design.md docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md docs/superpowers/plans/2026-07-14-catalog-material-pricing-inventory-foundation.md docs/superpowers/plans/2026-07-16-remove-emergent-local-storage.md docs/superpowers/plans/2026-07-17-foundation-transaction-capability.md docs/superpowers/plans/2026-07-21-redesign-main-reconciliation.md
git diff --cached --check
git commit -m "docs: normalize implementation specifications and plans"
```

Expected: one documentation-only commit; the protected plan is unstaged.

### Task 8: Reconcile Homepage Implementation Planning

**Purpose:** Create a decision-compliant Homepage-only replacement without
editing the source-pinned historical plan or authorizing UI implementation.

**Files:**
- Create: `docs/implementation/plans/pending-reconciliation/2026-07-23-homepage-production-implementation-plan.md`
- Modify: `docs/context/DOCUMENT_REGISTER.md`
- Preserve untouched: `doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md`
- Preserve untouched: `frontend/src/emergent-removal.test.js`
- Preserve untouched: protected R31 plan

**Authority constraints:**
- DEC-UX-001 and DEC-UX-002 both govern the replacement.
- Unified Homepage, B2B-primary narrative, Retail secondary path, and
  Experimental Editorial Hybrid are fixed.
- Detailed Retail/B2B navigation remains deferred.
- The plan stays Homepage-only and carries an implementation stop gate.

**Inbound references:**
- R17 in Section 5.1, including `frontend/src/emergent-removal.test.js:20`.

**Rollback:** Revert the Homepage-plan commit. Before commit, remove only the new
replacement and reverse its Document Register row; do not touch the old plan.

- [ ] **Step 1: Draft the replacement with exact authority framing.**

Command:

```powershell
Select-String -Path docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md,docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md -Pattern '^#','Decision','Retail','B2B','Homepage'
```

Expected: the new file uses the exact authority statement in Section 6.4 and
contains these exact headings:

```markdown
# Niuva Homepage Production Implementation Plan — Pending Reconciliation

## Authority and Non-Authorization Gate
## Homepage-Only Scope
## Unified Homepage Information Architecture
## B2B-Primary Narrative
## Retail Secondary Path
## Experimental Editorial Hybrid Translation
## Responsive and Accessible States
## Verification Before Implementation Approval
```

- [ ] **Step 2: Add explicit scope exclusions.**

Command:

```powershell
Select-String -LiteralPath docs/implementation/plans/pending-reconciliation/2026-07-23-homepage-production-implementation-plan.md -Pattern 'Auth','Admin','navigation','provider','implementation'
```

Expected: the file says exactly: `This document does not authorize source-code
changes, Auth or Admin redesign, detailed Retail/B2B navigation, provider
selection, production activation, commit creation, or push.`

- [ ] **Step 3: Verify old-path preservation and register both documents.**

Command:

```powershell
Test-Path -LiteralPath doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md
Select-String -LiteralPath frontend/src/emergent-removal.test.js -SimpleMatch -Pattern 'doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md'
Get-FileHash -Algorithm SHA256 -LiteralPath 'docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md'
```

Expected: old source-pinned plan remains, test remains unchanged, protected hash
matches, and the register classifies the replacement as Context Only pending
separate implementation approval.

- [ ] **Step 4: Commit only after separate Homepage-plan approval.**

Command:

```powershell
git add -- docs/implementation/plans/pending-reconciliation/2026-07-23-homepage-production-implementation-plan.md docs/context/DOCUMENT_REGISTER.md
git diff --cached --check
git commit -m "docs: reconcile homepage implementation planning"
```

Expected: one documentation-only commit; no old Homepage file or source/test diff.

### Task 9: Resolve the `DESIGN.md` Transition

**Purpose:** Reconcile the active implementation design guardrail with approved
experience decisions while preserving tokens and component contracts that the
current frontend consumes.

**Files:**
- Modify after an explicit DESIGN sub-gate: `DESIGN.md`
- Modify: `docs/context/DOCUMENT_REGISTER.md`
- Preserve untouched: `frontend/tailwind.config.js`
- Preserve untouched: `frontend/src/index.css`
- Preserve untouched: all frontend components and assets

**Authority constraints:**
- Use the in-place strategy and exact headings from Section 6.3.
- Preserve valid semantic tokens and component mappings.
- Resolve the Poppins-only body, public JetBrains Mono, technical “N” logo, and
  public/Admin conflation exactly as Section 6.3 directs.
- Do not implement CSS, component, asset, route, or page changes.

**Inbound references:**
- Current documentation references to root `DESIGN.md` remain path-stable.
- Implementation dependencies: `frontend/tailwind.config.js`,
  `frontend/src/index.css`, `SurfacePanel`, `TechnicalLabel`, `EmptyState`, and
  button variants identified during inspection.

**Rollback:** Revert the DESIGN-only commit. If uncommitted, reverse only the
`DESIGN.md` and Document Register patch; source is never part of this task.

- [ ] **Step 1: Reconfirm the current documentation/source contract read-only.**

Command:

```powershell
Select-String -LiteralPath DESIGN.md -Pattern 'Poppins','Inter','JetBrains','technical','SurfacePanel','TechnicalLabel','EmptyState','token'
Select-String -Path frontend/tailwind.config.js,frontend/src/index.css -Pattern 'token','font','surface','border','primary'
git grep -n -e 'SurfacePanel' -e 'TechnicalLabel' -e 'EmptyState' -- frontend/src
```

Expected: the valid dependencies listed in Section 6.3 remain observable. If a
dependency disappeared, amend the transitional mapping before editing DESIGN.

- [ ] **Step 2: Obtain the explicit DESIGN rewrite sub-gate.**

Command:

```powershell
git status --short
```

Expected: stop unless the user separately approves rewriting `DESIGN.md` under
the Section 6.3 strategy.

- [ ] **Step 3: Rewrite the document using the exact target sections and rules.**

Command:

```powershell
Select-String -LiteralPath DESIGN.md -Pattern '^#','Poppins-only','technical "N"','JetBrains Mono','Public Brand','Admin Studio','Semantic Tokens'
```

Expected: all ten headings from Section 6.3 exist; the exact replacement
statements for typography and logo exist; semantic-token and transitional
component mappings remain; contradictory prescriptive statements have zero hits.

- [ ] **Step 4: Verify documentation-only scope and commit after the sub-gate.**

Command:

```powershell
git diff --check -- DESIGN.md docs/context/DOCUMENT_REGISTER.md
git diff --name-only -- frontend backend
git add -- DESIGN.md docs/context/DOCUMENT_REGISTER.md
git diff --cached --check
git commit -m "docs: reconcile cross-surface design guidance"
```

Expected: no frontend/backend diff and one independently revertible
documentation-only commit.

### Task 10: Review the Protected Cross-Surface Remediation Plan

**Purpose:** Run a dedicated review gate for the protected untracked plan and,
only under additional approvals, replace its broad scope with separate Auth and
Admin plans before archiving the original.

**Files:**
- Preserve untouched by default: `docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md`
- Conditional create after separate approval: `docs/implementation/plans/pending-reconciliation/2026-07-23-auth-experience-remediation.md`
- Conditional create after separate approval: `docs/implementation/plans/pending-reconciliation/2026-07-23-admin-studio-operational-remediation.md`
- Conditional move after a second separate approval: `docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md` → `docs/archive/drafts/2026-07-22-cross-surface-ui-ux-consistency-remediation.md`
- Conditional modify: `docs/context/DOCUMENT_REGISTER.md`

**Authority constraints:**
- Base migration approval does not authorize this task.
- Do not remove Inter, treat Homepage direction as deferred, or combine Homepage,
  Auth, and Admin implementation scopes.
- Auth remains a bounded customer-access experience; Admin follows DEC-OPS-001.
- The original cannot be archived until both replacements are reviewed and a
  second archive approval is explicit.

**Inbound references:**
- R31: `docs/context/DOCUMENT_REGISTER.md:107`.
- The protected file itself contains R02–R06, R34, and R39 references, which
  continue to resolve through compatibility pointers.

**Rollback:** Before any separate approval, there is nothing to roll back. After
replacement-plan creation, revert only that commit. After an archive approval,
revert only the archive commit so the original returns to its exact old path and
hash; never reconstruct it from copied prose.

- [ ] **Step 1: Verify the protected bytes and known conflicts without editing.**

Command:

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath 'docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md'
Select-String -LiteralPath 'docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md' -Pattern 'Homepage','Inter','Admin','Auth'
```

Expected: the hash is
`8D169B4CB6CB63E4C7EAA67D5CF794536000F3828E6B24A93396013743613E32`;
the conflict evidence is recorded for review only.

- [ ] **Step 2: Obtain separate approval for two replacement plans.**

Command:

```powershell
git status --short
```

Expected: stop unless the user explicitly approves creation of both exact
replacement paths. The original remains untracked and byte-identical.

- [ ] **Step 3: If approved, create bounded Auth and Admin plan documents.**

Command:

```powershell
Select-String -Path docs/implementation/plans/pending-reconciliation/2026-07-23-auth-experience-remediation.md,docs/implementation/plans/pending-reconciliation/2026-07-23-admin-studio-operational-remediation.md -Pattern '^#','Authority','Scope','Non-Authorization','Inter','Homepage'
```

Expected: both plans contain `## Authority and Non-Authorization Gate`,
`## Bounded Scope`, and `## Verification`; the Auth plan excludes Homepage and
Admin, the Admin plan excludes Homepage and Auth, neither removes Inter, and
neither authorizes implementation.

- [ ] **Step 4: If replacement plans are approved, commit them without staging the original.**

Command:

```powershell
git add -- docs/implementation/plans/pending-reconciliation/2026-07-23-auth-experience-remediation.md docs/implementation/plans/pending-reconciliation/2026-07-23-admin-studio-operational-remediation.md docs/context/DOCUMENT_REGISTER.md
git diff --cached --name-status
git diff --cached --check
git commit -m "docs: separate auth and admin remediation planning"
```

Expected: the original protected path is absent from the commit.

- [ ] **Step 5: Obtain a second approval before preserving and archiving the original.**

Command:

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath 'docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md'
git status --short
```

Expected: stop unless the user explicitly approves first tracking the exact bytes
as evidence and then archiving them in a separate commit. A changed hash blocks
the action.

- [ ] **Step 6: If the second approval is granted, preserve history before the archive move.**

Command:

```powershell
git add -- docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md
git diff --cached --check
git commit -m "docs: preserve cross-surface draft evidence"
git mv -- docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md docs/archive/drafts/2026-07-22-cross-surface-ui-ux-consistency-remediation.md
```

Expected: the first commit records byte-identical evidence; only then is a Git
rename available for a later archive-header patch and archive commit. This
optional move is outside the base count of 38 planned moves because it requires
two additional approvals.

- [ ] **Step 7: Under the second approval, add the archive header and commit the optional archive move.**

Command:

```powershell
Select-String -LiteralPath docs/archive/drafts/2026-07-22-cross-surface-ui-ux-consistency-remediation.md -SimpleMatch -Pattern '> **ARCHIVED — Do not use for new planning.**'
git add -- docs/archive/drafts/2026-07-22-cross-surface-ui-ux-consistency-remediation.md docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md docs/context/DOCUMENT_REGISTER.md
git diff --cached --check
git commit -m "docs: archive cross-surface draft evidence"
```

Expected: the exact Section 3.3 header is present, the register points to the
archive as Context Only evidence, and the rename/header commit contains no Auth,
Admin, Homepage, or source implementation change.

### Task 11: Archive Superseded and Stale Documents

**Purpose:** Physically isolate seven Superseded or Archive Candidate files while
preserving provenance and preventing their use as current authority.

**Files:**
- Move: `doc/BRD_Platform_Niuva_v2_addendum.md` → `docs/archive/superseded/BRD_Platform_Niuva_v2_addendum.md`
- Move: `doc/PRS_Platform_Niuva_v2_addendum.md` → `docs/archive/superseded/PRS_Platform_Niuva_v2_addendum.md`
- Move: `docs/superpowers/specs/2026-07-14-integrated-operations-marketplace-design.md` → `docs/archive/superseded/2026-07-14-integrated-operations-marketplace-design.md`
- Move: `doc/brand/BRAND_DIGITAL_EXTENSION.md` → `docs/archive/drafts/BRAND_DIGITAL_EXTENSION.md`
- Move: `doc/brand/BRAND_IMPLEMENTATION_PLAN.md` → `docs/archive/implementation-history/BRAND_IMPLEMENTATION_PLAN.md`
- Move: `design_guidelines.json` → `docs/archive/drafts/design_guidelines.json`
- Move: `test_result.md` → `docs/archive/implementation-history/test_result.md`
- Create: `docs/archive/README.md`
- Modify: `docs/context/DOCUMENT_REGISTER.md`
- Modify: R07, R08, R14, R15, R33, and R41 active evidence references

**Authority constraints:**
- Each archived Markdown file receives the exact Section 3.3 header.
- JSON bytes remain unchanged; status is carried by path and sidecar.
- No PDF is archived in this pass.
- Active documents may cite these paths only as labeled supersession, audit, or
  historical evidence.

**Inbound references:**
- R07, R08, R14, R15, R33, and R41 in Section 5.
- `test_result.md` has zero exact-path inbound hits.

**Rollback:** Revert the archive commit. Before commit, remove added Markdown
headers, reverse the seven `git mv` operations, remove the sidecar only if it has
no pre-existing entries, and reverse manifest path substitutions. Never delete
the archived content.

- [ ] **Step 1: Create archive directories and move seven exact files.**

Command:

```powershell
New-Item -ItemType Directory -Force -Path docs/archive/superseded,docs/archive/drafts,docs/archive/implementation-history | Out-Null
git mv -- doc/BRD_Platform_Niuva_v2_addendum.md docs/archive/superseded/BRD_Platform_Niuva_v2_addendum.md
git mv -- doc/PRS_Platform_Niuva_v2_addendum.md docs/archive/superseded/PRS_Platform_Niuva_v2_addendum.md
git mv -- docs/superpowers/specs/2026-07-14-integrated-operations-marketplace-design.md docs/archive/superseded/2026-07-14-integrated-operations-marketplace-design.md
git mv -- doc/brand/BRAND_DIGITAL_EXTENSION.md docs/archive/drafts/BRAND_DIGITAL_EXTENSION.md
git mv -- doc/brand/BRAND_IMPLEMENTATION_PLAN.md docs/archive/implementation-history/BRAND_IMPLEMENTATION_PLAN.md
git mv -- design_guidelines.json docs/archive/drafts/design_guidelines.json
git mv -- test_result.md docs/archive/implementation-history/test_result.md
```

Expected: seven renames, no deletion, and no PDF move.

- [ ] **Step 2: Add the canonical archive header to all six Markdown files.**

Command:

```powershell
$archiveMarkdown = @(
  'docs/archive/superseded/BRD_Platform_Niuva_v2_addendum.md',
  'docs/archive/superseded/PRS_Platform_Niuva_v2_addendum.md',
  'docs/archive/superseded/2026-07-14-integrated-operations-marketplace-design.md',
  'docs/archive/drafts/BRAND_DIGITAL_EXTENSION.md',
  'docs/archive/implementation-history/BRAND_IMPLEMENTATION_PLAN.md',
  'docs/archive/implementation-history/test_result.md'
)
foreach ($file in $archiveMarkdown) {
  Select-String -LiteralPath $file -SimpleMatch -Pattern '> **ARCHIVED — Do not use for new planning.**'
}
```

Expected: each file starts with the exact five-line archive block from Section
3.3; existing content follows without substantive rewriting.

- [ ] **Step 3: Create the JSON sidecar entry and repair evidence paths.**

Command:

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath docs/archive/drafts/design_guidelines.json
Show-Reference -Id R07 -Needle 'doc/BRD_Platform_Niuva_v2_addendum.md'
Show-Reference -Id R08 -Needle 'doc/PRS_Platform_Niuva_v2_addendum.md'
Show-Reference -Id R14 -Needle 'doc/brand/BRAND_DIGITAL_EXTENSION.md'
Show-Reference -Id R15 -Needle 'doc/brand/BRAND_IMPLEMENTATION_PLAN.md'
Show-Reference -Id R33 -Needle 'docs/superpowers/specs/2026-07-14-integrated-operations-marketplace-design.md'
Show-Reference -Id R41 -Needle 'design_guidelines.json'
```

Expected: `docs/archive/README.md` contains these exact headings:

```markdown
# Niuva Documentation Archive Index

## Authority Warning
## Superseded Requirements and Designs
## Drafts
## Implementation History
## Non-Markdown Sidecar Records
```

Its `Non-Markdown Sidecar Records` table contains the JSON original path,
archive path, SHA-256, `Archive Candidate` status, and `Historical inspection
only; not planning authority` permitted use.

- [ ] **Step 4: Verify archive authority boundaries.**

Command:

```powershell
git grep -n -e 'docs/archive/' -- '*.md' ':!docs/archive/**' ':!docs/implementation/plans/completed/**'
git diff --check
```

Expected: every active-to-archive reference is explicitly labeled superseded,
archive, historical, audit, or evidence; no archived file is used as a requirement
source.

- [ ] **Step 5: Commit only after archive approval.**

Command:

```powershell
git add -- doc/BRD_Platform_Niuva_v2_addendum.md doc/PRS_Platform_Niuva_v2_addendum.md docs/superpowers/specs/2026-07-14-integrated-operations-marketplace-design.md doc/brand/BRAND_DIGITAL_EXTENSION.md doc/brand/BRAND_IMPLEMENTATION_PLAN.md design_guidelines.json test_result.md docs/archive/superseded/BRD_Platform_Niuva_v2_addendum.md docs/archive/superseded/PRS_Platform_Niuva_v2_addendum.md docs/archive/superseded/2026-07-14-integrated-operations-marketplace-design.md docs/archive/drafts/BRAND_DIGITAL_EXTENSION.md docs/archive/drafts/design_guidelines.json docs/archive/implementation-history/BRAND_IMPLEMENTATION_PLAN.md docs/archive/implementation-history/test_result.md docs/archive/README.md docs/context/DOCUMENT_REGISTER.md docs/decisions/evidence/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md docs/references/requirements/approved-baselines/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md docs/references/requirements/approved-baselines/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md docs/references/brand/BRAND_WEBSITE_AUDIT.md
git diff --cached --check
git commit -m "docs: archive superseded documentation"
```

Expected: one independently revertible archive commit with seven moves and no
binary or source alteration.

### Task 12: Final Documentation Verification and Plan Completion

**Purpose:** Prove path integrity, authority integrity, archive isolation,
documentation-only scope, and protected-file integrity before classifying this
migration plan as completed.

**Files:**
- Move after all checks pass: `docs/superpowers/plans/2026-07-23-documentation-migration-reconciliation.md` → `docs/implementation/plans/completed/2026-07-23-documentation-migration-reconciliation.md`
- Modify: `docs/context/DOCUMENT_REGISTER.md`
- Preserve untouched: `docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md`, unless Task 10 separately received both additional approvals
- Preserve untouched: all application source, tests, dependencies, schemas,
  routes, APIs, CI, and runtime configuration

**Authority constraints:**
- Verification does not grant production readiness, implementation permission,
  provider choice, policy choice, upload activation, payment activation, or
  go-live approval.
- Active authority matches must be prescriptive and current; archived/history
  matches are evidence only.
- No application test or build is part of this documentation migration.

**Verification amendment — approved 23 July 2026:** The strict scans below
must distinguish active prescriptive guidance from recorded evidence of a
rejected or superseded term. `docs/decisions/evidence/**` is evidence, not an
active instruction surface, and the one literal path in `NIV-001` identified by
R27 remains permitted historical rehearsal evidence. Bare file basenames are
not retired paths when they occur as part of an approved canonical destination.

**Inbound references:**
- This plan's final register row and self-references.
- All R01–R42 manifest entries.

**Rollback:** If any check fails, do not move or commit the plan; return to the
owning task rollback. If the final commit exists, revert it so the plan returns to
its review path and the register returns to pending status.

- [ ] **Step 1: Run the exact Git-state checks.**

Command:

```powershell
git status --short
git diff --check
git diff --stat
git diff --name-status
```

Expected: no whitespace error, no unreviewed change, and only documentation paths
owned by the current task are uncommitted.

- [ ] **Step 2: Run the active-document stale-path scan.**

Command:

```powershell
$retiredPaths = @(
  'doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md',
  'doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md',
  'doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md',
  'doc/PRD_Platform_Niuva_v2_1_retail_b2b.md',
  'doc/BRD_Website_Niuva.md',
  'doc/PRS_Website_Niuva.md',
  'doc/BRD_Platform_Niuva_v2_addendum.md',
  'doc/PRS_Platform_Niuva_v2_addendum.md',
  'doc/decisions/ADR-001-mongodb-transaction-capability.md',
  'doc/decisions/ADR-002-production-file-storage-architecture.md',
  'doc/decisions/ADR-003-retail-payment-orchestration-boundary.md',
  'doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md',
  'doc/IDENTITY_RBAC_AUDIT_RUNBOOK.md',
  'doc/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md',
  'doc/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md',
  'doc/brand/BRAND_WEBSITE_AUDIT.md',
  'doc/brand/BRAND_APPROVAL_DECISIONS.md',
  'doc/brand/HOMEPAGE_PROTOTYPE_REVIEW.md',
  'doc/brand/HOMEPAGE_PROTOTYPE_DECISION.md',
  'doc/brand/BRAND_DIGITAL_EXTENSION.md',
  'doc/brand/BRAND_IMPLEMENTATION_PLAN.md',
  'docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md',
  'docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md',
  'docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md',
  'docs/superpowers/specs/2026-07-16-retail-order-checkout-foundation-design.md',
  'docs/superpowers/specs/2026-07-21-backend-framework-security-upgrade-design.md',
  'docs/superpowers/specs/2026-07-21-redesign-main-reconciliation-design.md',
  'docs/superpowers/specs/2026-07-14-integrated-operations-marketplace-design.md',
  'docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md',
  'docs/superpowers/plans/2026-07-14-catalog-material-pricing-inventory-foundation.md',
  'docs/superpowers/plans/2026-07-16-remove-emergent-local-storage.md',
  'docs/superpowers/plans/2026-07-17-foundation-transaction-capability.md',
  'docs/superpowers/plans/2026-07-21-redesign-main-reconciliation.md'
)
$activeMarkdown = @(
  Get-Item -LiteralPath AGENTS.md,PRODUCT.md,DESIGN.md,memory/PRD.md
  Get-ChildItem -LiteralPath docs -Recurse -File -Filter *.md | Where-Object {
    $_.FullName -notmatch '[\\/]archive[\\/]' -and
    $_.FullName -notmatch '[\\/]decisions[\\/]evidence[\\/]' -and
    $_.FullName -notmatch '[\\/]implementation[\\/]history[\\/]' -and
    $_.FullName -notmatch '[\\/]implementation[\\/]plans[\\/]completed[\\/]' -and
    $_.FullName -notlike '*2026-07-22-cross-surface-ui-ux-consistency-remediation.md' -and
    $_.FullName -notlike '*2026-07-23-documentation-migration-reconciliation.md'
  }
  Get-ChildItem -LiteralPath doc -Recurse -File -Filter *.md | Where-Object {
    $_.FullName -notlike '*HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md'
  }
)
$nivHistoricalPath = (Resolve-Path -LiteralPath 'docs/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md').Path
$nivHistoricalLiteral = 'docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md'
$stale = foreach ($oldPath in $retiredPaths) {
  Select-String -LiteralPath $activeMarkdown.FullName -SimpleMatch -Pattern $oldPath -ErrorAction SilentlyContinue |
    Where-Object { -not ($_.Path -eq $nivHistoricalPath -and $_.Pattern -eq $nivHistoricalLiteral) }
}
$stale | ForEach-Object { '{0}:{1}:{2}' -f $_.Path,$_.LineNumber,$_.Line.Trim() }
if (@($stale).Count -ne 0) { exit 1 }
```

Expected: zero active prescriptive-document matches. Compatibility pointer
files, approval evidence, archived documents, implementation history, the one
R27 NIV-001 historical literal, the old source-pinned Homepage plan, the
protected plan, and this execution record are intentionally outside this strict
scan.

- [ ] **Step 3: Run a standard-library broken Markdown-link checker.**

Command:

```powershell
@'
import pathlib
import re
import subprocess
import sys
import urllib.parse

repo = pathlib.Path.cwd().resolve()
paths = set(subprocess.check_output(['git', 'ls-files', '*.md'], text=True).splitlines())
paths.update(subprocess.check_output(
    ['git', 'ls-files', '--others', '--exclude-standard', '--', '*.md'], text=True
).splitlines())
link_re = re.compile(r'!?\[[^\]]*\]\(([^)]+)\)')
inline_code_re = re.compile(r'`[^`]*`')
missing = []

for raw_path in sorted(paths):
    source = repo / raw_path
    if not source.is_file() or '.superpowers' in source.parts:
        continue
    in_fence = False
    for line_number, line in enumerate(source.read_text(encoding='utf-8').splitlines(), 1):
        if line.lstrip().startswith(('```', '~~~')):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        visible = inline_code_re.sub('', line)
        for match in link_re.finditer(visible):
            target = match.group(1).strip().strip('<>')
            if not target or target.startswith(('#', 'http://', 'https://', 'mailto:')):
                continue
            target = urllib.parse.unquote(target.split('#', 1)[0])
            if re.match(r'^[A-Za-z]:[\\/]', target):
                continue
            candidate = (repo / target.lstrip('/')) if target.startswith('/') else (source.parent / target)
            if not candidate.resolve().exists():
                missing.append(f'{raw_path}:{line_number}:{target}')

for item in missing:
    print(item)
sys.exit(1 if missing else 0)
'@ | python -
```

Expected: no output and exit code 0. The checker ignores external URLs, anchors,
inline code, fenced code, Windows absolute evidence paths, and ignored
`.superpowers` evidence; it fails for missing relative file targets.

- [ ] **Step 4: Run the authority-term scan with active/history separation.**

Command:

```powershell
$authorityTerms = @(
  'Draft Canonical',
  'Draft for stakeholder review',
  'Homepage pattern remains deferred',
  'technical "N"',
  'SYS_ADMIN_CONSOLE',
  'METRIC_ID',
  'FETCHING_TELEMETRY',
  'ACCESS_LEVEL',
  'Poppins-only',
  'Manrope + Space Mono'
)
$authorityFiles = @(
  'AGENTS.md','PRODUCT.md','DESIGN.md','docs/NIUVA_MASTER_SPEC.md',
  'docs/context/DOCUMENT_REGISTER.md','docs/decisions/DECISION_REGISTER.md'
)
$authorityFiles += @(Get-ChildItem -LiteralPath docs/decisions/experience,docs/decisions/architecture,docs/decisions/product -File -Filter *.md | ForEach-Object FullName)
$authorityMatches = @(Select-String -LiteralPath $authorityFiles -SimpleMatch -Pattern $authorityTerms -ErrorAction SilentlyContinue)
function Test-NonPrescriptiveAuthorityContext {
  param($Match)
  $lines = @(Get-Content -LiteralPath $Match.Path)
  $start = [Math]::Max(0, $Match.LineNumber - 8)
  $context = ($lines[$start..($Match.LineNumber - 1)] -join "`n")
  return $context -match '(?i)prohibited|superseded statements|supersedes|do not use|not an acceptable|rejected'
}
$nonPrescriptiveAuthority = @($authorityMatches | Where-Object { Test-NonPrescriptiveAuthorityContext $_ })
$badAuthority = @($authorityMatches | Where-Object { -not (Test-NonPrescriptiveAuthorityContext $_) })
$nonPrescriptiveAuthority | ForEach-Object { 'non-prescriptive:{0}:{1}:{2}' -f $_.Path,$_.LineNumber,$_.Line.Trim() }
$badAuthority | ForEach-Object { '{0}:{1}:{2}' -f $_.Path,$_.LineNumber,$_.Line.Trim() }
if (@($badAuthority).Count -ne 0) { exit 1 }
Select-String -Path docs/archive/**/*.md,docs/implementation/history/*.md -SimpleMatch -Pattern $authorityTerms -ErrorAction SilentlyContinue
```

Expected: zero prescriptive matches in active authority. Rejected, prohibited,
or superseded active-document context is printed as `non-prescriptive` for human
review and never accepted as guidance. Matches in archived or implementation
history are allowed only as rejected, superseded, audit, or historical context.

- [ ] **Step 5: Verify archive references and canonical reading order.**

Command:

```powershell
$archiveRefs = git grep -n -e 'docs/archive/' -- '*.md' ':!docs/archive/**' ':!docs/implementation/history/**' ':!docs/implementation/plans/completed/**'
$invalidArchiveRefs = @($archiveRefs | Where-Object { $_ -notmatch '(?i)archive|superseded|historical|audit|evidence' })
$invalidArchiveRefs
if ($invalidArchiveRefs.Count -ne 0) { exit 1 }

$agentText = Get-Content -LiteralPath AGENTS.md -Raw
$readingOrder = @(
  'docs/NIUVA_MASTER_SPEC.md',
  'docs/context/DOCUMENT_REGISTER.md',
  'docs/decisions/DECISION_REGISTER.md',
  'approved decision or ADR',
  'applicable runbook',
  'current source code and tests',
  'Supporting references'
)
$positions = @($readingOrder | ForEach-Object { $agentText.IndexOf($_,[System.StringComparison]::OrdinalIgnoreCase) })
if ($positions -contains -1) { $positions; exit 1 }
for ($i = 1; $i -lt $positions.Count; $i++) {
  if ($positions[$i] -le $positions[$i-1]) { $positions; exit 1 }
}
```

Expected: active archive citations carry a historical/evidence label and the
seven canonical reading-order concepts appear once in the required order.

- [ ] **Step 6: Verify documentation-only scope and the protected hash.**

Command:

```powershell
$baselineCommit = git log --format=%H --grep '^docs: establish canonical documentation baseline$' -1
if (-not $baselineCommit) { throw 'Canonical baseline commit not found' }
$changed = @(git diff --name-only "$baselineCommit^..HEAD")
$nonDocumentation = @($changed | Where-Object {
  -not (
    $_ -match '^(AGENTS|PRODUCT|DESIGN|README|test_result)(\..+)?$' -or
    $_ -match '^(doc|docs|memory)/.*\.(md|pdf|json|txt|yaml|yml)$'
  )
})
$nonDocumentation
if ($nonDocumentation.Count -ne 0) { exit 1 }
$sourceProtectedPath = 'C:\Portfolio\Niuva\Niuva-fresh-20260721\docs\superpowers\plans\2026-07-22-cross-surface-ui-ux-consistency-remediation.md'
if (-not (Test-Path -LiteralPath $sourceProtectedPath)) { throw 'Protected R31 source path not found' }
$protectedHash = Get-FileHash -Algorithm SHA256 -LiteralPath $sourceProtectedPath
$protectedHash
if ($protectedHash.Hash -ne '8D169B4CB6CB63E4C7EAA67D5CF794536000F3828E6B24A93396013743613E32') { exit 1 }
git status --short
git diff --stat
```

Expected: zero non-documentation paths, protected SHA-256 unchanged unless both
Task 10 approvals were separately granted, and no unexpected working-tree change.
R31 remains source-only by the Task 1 isolation constraint; the source hash is
therefore its proof of integrity.

- [ ] **Step 7: Move this plan to completed, update the register, and make the final commit.**

Command:

```powershell
New-Item -ItemType Directory -Force -Path docs/implementation/plans/completed | Out-Null
git mv -- docs/superpowers/plans/2026-07-23-documentation-migration-reconciliation.md docs/implementation/plans/completed/2026-07-23-documentation-migration-reconciliation.md
git add -- docs/context/DOCUMENT_REGISTER.md docs/implementation/plans/completed/2026-07-23-documentation-migration-reconciliation.md docs/superpowers/plans/2026-07-23-documentation-migration-reconciliation.md
git diff --cached --check
git diff --cached --name-status
git commit -m "docs: verify documentation authority and links"
```

Expected: one final documentation-only commit containing the plan rename and
register completion row. No push occurs.

## 9. Future Commit Strategy

The base migration proposes this atomic sequence after explicit authorization:

1. `docs: establish canonical documentation baseline`
2. `docs: reconcile root documentation entry points`
3. `docs: normalize decisions and architecture records`
4. `docs: organize approved and historical requirements`
5. `docs: normalize operational runbooks`
6. `docs: normalize brand and company references`
7. `docs: normalize implementation specifications and plans`
8. `docs: reconcile homepage implementation planning`
9. `docs: reconcile cross-surface design guidance`
10. `docs: archive superseded documentation`
11. `docs: verify documentation authority and links`

Task 10 has up to three optional commits, each requiring its own approvals:
`docs: separate auth and admin remediation planning`,
`docs: preserve cross-surface draft evidence`, and a later
`docs: archive cross-surface draft evidence`. Each base and optional commit is
documentation-only, receives its own verification gate, excludes source code,
and can be reverted independently. No commit or push is authorized now.

## 10. Rollback and Partial-Recovery Plan

### 10.1 Task rollback

- Task 1 operates across the source checkout and the isolated documentation
  worktree. Preserve the source checkout and its untracked canonical files in
  every Task 1 recovery action.
- For a committed task, identify its exact hash by matching the commit subject in
  Section 9, then pass that hash to `git revert` after confirming that no later
  task depends on its paths. Revert dependent commits in reverse order.
- For an uncommitted task, reverse only its `apply_patch`, `git mv`, copy, and
  pointer operations. Use `git restore --staged --` followed by the literal paths
  in that task's **Files** list only to unstage; do not use destructive reset.
- Confirm `git status --short`, protected-file SHA-256, and the task's manifest
  searches after rollback.

### 10.2 Whole-migration rollback

- Identify the base sequence with
  `git log --oneline --grep '^docs:' -- docs/NIUVA_MASTER_SPEC.md` and record the
  exact commit IDs.
- Revert migration commits from newest to oldest with one `git revert` per commit.
- Retain user work not owned by those commits. Do not use `git reset --hard`,
  branch deletion, or a broad checkout.
- Re-run link, stale-path, authority, archive, and protected-hash checks against
  the restored tree.
- For Task 1, revert only in the isolated documentation branch; never reset the
  source checkout or remove its untracked canonical files.

### 10.3 Recovery from partial execution

| Partial condition | Recovery action | Proof before continuing |
|---|---|---|
| Worktree created but files not copied | Leave the source checkout untouched; inspect the clean isolated worktree, then copy only the nine literal paths after approval | Isolated branch and HEAD match the recorded source base; source status equals its baseline |
| Files copied but hashes do not match | Stop; do not stage or commit; retain source files and report each differing path | Source/destination SHA-256 table identifies the mismatch and source status is unchanged |
| Files staged but commit not created | Unstage only the nine explicit Task 1 paths in the isolated worktree; do not delete source files | Isolated cached diff is empty and source status equals its baseline |
| Commit created but worktree has unexpected changes | Stop and preserve the isolated worktree; inspect exact paths before any revert | `git -C $worktreePath status --short` identifies no unreviewed user work to overwrite |
| Source checkout changed unexpectedly | Stop immediately; do not stage, commit, copy, remove a worktree, or continue Task 1 | Recorded and current source status are compared and differences are reported |
| Branch or worktree path already exists | Stop and inspect the existing ref or directory; never silently reuse, delete, or overwrite it | `git show-ref` and filesystem inspection are recorded |
| Worktree creation interrupted | Inspect `git worktree list`, the target path, and source status; repair only with explicit direction | Source status is unchanged and no target is overwritten |
| User changes appear in either workspace | Stop staging and leave changes untouched; continue only with explicit path-specific approval | Both workspace statuses and cached diffs contain only authorized paths |
| File moved, references not repaired | Keep the task uncommitted; either complete the exact R-ID repairs or reverse that one `git mv` | Old path exists again or every active manifest hit resolves to new path/pointer |
| Archive header added, register not updated | Keep the archive task uncommitted; add the exact register row or reverse the header and move | Header, path, sidecar, and register status agree |
| Root pointer changed before Master Spec is tracked | Stop; reverse the root patch, or complete Task 1 only after approval | `git ls-files --error-unmatch docs/NIUVA_MASTER_SPEC.md` succeeds before root commit |
| Git operation interrupted | Inspect `git status --short`, `git diff --name-status`, and `git diff --cached --name-status`; resume or reverse only paths from the owning task | No unmerged entry and no mixed task scope |
| Unrelated user changes appear | Stop staging; record exact paths; leave them untouched; continue only with explicit task pathspecs | Cached diff contains only task-owned files |
| Pointer exists but destination is missing | Restore the original file to the old path or complete the matching move; do not commit a dangling pointer | `Test-Path` succeeds for both pointer and literal destination |
| PDF copy hashes differ | Remove only the new copy and repeat from the unchanged old PDF | Each old/new pair has identical SHA-256 |
| Protected plan hash changes | Stop Task 10 and all staging involving that path; ask the user to reconcile the changed bytes | Hash matches the approved value or the user issues a new written approval |

## 11. Planning Self-Review Checklist

- [ ] **Authority coverage:** Confirm the matrix explicitly treats Approved
  Canonical, Approved Baseline, Approved Decision, Approved with Open Decisions,
  Historical Active Baseline, Active Guardrail, Runbook, Supporting Reference,
  Candidate, Context Only, Superseded, and Archive Candidate.
- [ ] **Path coverage:** Confirm every planned move has an exact old path, exact
  new path, R-ID or zero-hit statement, rollback, and verification command.
- [ ] **Placeholder wording scan:** Run the concatenated-term scan below and
  remove any non-operational wording it reports.
- [ ] **Scope review:** Confirm no task changes source code, product journeys,
  backend authorization, database/schema/API/route/test/dependency state, provider
  or policy selection, payment/upload activation, production readiness, or go-live.
- [ ] **Untracked review:** Distinguish the eight approved canonical/decision
  documents, this plan, the protected cross-surface plan, tracked history, ignored
  `.superpowers` evidence, and generated dependency/cache files.

Command:

```powershell
$planPath = 'docs/superpowers/plans/2026-07-23-documentation-migration-reconciliation.md'
$weakTerms = @(
  ('T' + 'BD'),
  ('T' + 'ODO'),
  ('as' + ' needed'),
  ('relevant' + ' files'),
  ('update' + ' links'),
  ('sim' + 'ilar'),
  ('and so' + ' on')
)
Select-String -LiteralPath $planPath -SimpleMatch -Pattern $weakTerms -CaseSensitive:$false
```

Expected: zero matches.

## 12. Operation Ledger

The base plan has these reviewable operation counts. Optional Task 10 archive work
is excluded until its two additional approvals exist.

| Operation | Count | Counting rule |
|---|---:|---|
| Planned physical moves | 38 | Every base `current → proposed` move in Section 4, including this plan's final move |
| Existing-document content modifications | 36 | Thirty-two active/historical Markdown sources receive exact manifest/root path edits; `DESIGN.md` is rewritten; three additional archive-only Markdown files receive headers |
| Archive actions | 7 | Six Markdown archives plus one JSON archive; subset of physical moves |
| Compatibility pointers | 15 | Exact old-path pointer files in Section 4.4 |
| Byte-identical PDF copies | 2 | Company Profile and Brand Guidelines |
| Explicitly untouched documentation files | 45 | 38 ignored Markdown evidence files plus 7 named preserved documents/binaries |

The seven named preserved files in the final row are
`docs/context/CONVERSATION_HANDOFF.md`,
`docs/decisions/APPROVAL-NIUVA-CANONICAL-DOCUMENTATION-2026-07-23.md`,
`README.md`,
`docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md`,
`doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md`,
`doc/Company profile PT Niuva_compressed.pdf`, and
`doc/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf`. The production runbook may receive
reference-only edits while its path and procedures remain stable, so it is not
counted as untouched. Application files are excluded from this
documentation-inventory count.

## Execution Authorization Gate

This plan does not authorize execution.

The first allowed execution phase, when separately approved, is **Task 1 only —
isolated canonical baseline checkpoint**. Task 2 through Task 12 require later
batch-specific approval. Task 1 approval does not authorize `DESIGN.md`, Homepage
replacement planning, cross-surface review, archives, file moves, pointers, or
PDF copies.

Before Task 1, obtain explicit user approval covering:

- isolated sibling-worktree and branch creation;
- copying and tracking the nine canonical baseline files;
- the first documentation-only commit;
- no push behavior.

Before a later task, obtain its own batch-specific approval covering the relevant:

- file movements;
- tracked canonical baseline;
- root pointer changes;
- archive actions;
- reconciliation of DESIGN.md;
- reconciliation of Homepage and cross-surface plans;
- commit creation;
- push behavior.

Without explicit approval, stop after plan review.
