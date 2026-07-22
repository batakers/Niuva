# Niuva Document Register

Status: **Approved Canonical**
Register date: 23 July 2026
Approval date: 23 July 2026
Approval record: `docs/decisions/APPROVAL-NIUVA-CANONICAL-DOCUMENTATION-2026-07-23.md`
Purpose: Help people and AI agents identify the authority, scope, and safe use of Niuva documentation.

This register does not upgrade the approval status of any source. Approval evidence remains limited to what each document and its approval record actually state.

## Status Vocabulary

- **Approved Canonical:** approved primary source or register within its stated canonical scope.
- **Approved Baseline:** approved planning baseline within its recorded scope.
- **Approved Decision:** explicit decision with a recorded source and bounded scope.
- **Approved with Open Decisions:** an approved direction whose listed open decisions remain unresolved.
- **Historical Active Baseline:** older baseline that remains applicable only where it has not been replaced.
- **Active Guardrail:** implementation guidance subordinate to approved requirements and decisions.
- **Runbook:** procedural authority for operations, migration, rollout, rollback, or recovery.
- **Supporting Reference:** factual, visual, analytical, or provenance material that does not independently set implementation direction.
- **Candidate:** proposal not approved for implementation.
- **Context Only:** context or implementation history, not decision authority.
- **Superseded:** replaced and prohibited for new planning.
- **Archive Candidate:** obsolete, redundant, or unapproved material proposed for later archiving.

## Canonical Documents and Formal Decisions

| Document | Status | Scope | Authority | Use when | Do not use for |
|---|---|---|---|---|---|
| `docs/NIUVA_MASTER_SPEC.md` | Approved Canonical | Consolidated product and experience specification | Canonical product and experience source of truth effective 23 July 2026 | Product and experience direction, locked decisions, deferred decisions, and implementation boundaries | Claiming implementation authorization or overriding a specific approved ADR |
| `docs/context/DOCUMENT_REGISTER.md` | Approved Canonical | Document status and reading order | Canonical document-authority and reading-order register | Determining which source governs a question and how sources must be read | Replacing the content of an ADR, requirement, or decision record |
| `docs/context/CONVERSATION_HANDOFF.md` | Context Only | Concise discussion context and current status | No implementation authority | Understanding why consolidation was initiated | Product, visual, technical, or operational decisions |
| `docs/decisions/DECISION_REGISTER.md` | Approved Canonical | Index of approved and open decisions | Canonical decision index; underlying records and ADRs remain authoritative within their scopes | Locating formal decision sources and open consequences | Treating open consequences as approved or authorizing implementation |
| `docs/decisions/APPROVAL-NIUVA-CANONICAL-DOCUMENTATION-2026-07-23.md` | Approved Decision | Canonical documentation approval | Formal record of explicit user approval dated 23 July 2026 | Verifying canonical status; checking effective authority; confirming scope limitations; confirming that migration planning is the next authorized activity | Implementation authorization; provider selection; policy selection; document-migration execution; production readiness; go-live |
| `docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md` | Approved Decision | Homepage product pattern | Explicit user decision recorded during documentation consolidation, 23 July 2026 | Homepage narrative, journey hierarchy, and removal of the old deferred pattern | Deciding detailed Retail/B2B navigation treatment or authorizing implementation |
| `docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md` | Approved Decision | Homepage visual direction | Explicit user decision recorded during documentation consolidation, 23 July 2026, supported by earlier prototype decision | Homepage composition, typography, U-curve, evidence, and motion direction | Redesigning other routes or copying marketing styling into operations |
| `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md` | Approved Decision | Admin Studio operational experience direction | Explicit user decision recorded during documentation consolidation, 23 July 2026 | Admin Studio hierarchy; operational design principles; pseudo-terminal rejection; role, task, status, and recovery direction | Exact navigation; component implementation; KPI invention; backend authorization changes; payment, storage, or go-live activation |

## Product and Requirements Baselines

| Document | Status | Scope | Authority | Use when | Do not use for |
|---|---|---|---|---|---|
| `doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md` | Supporting Reference | Approval record, vocabulary, and supersession map | Evidence for recorded approval only; named approver and approval source are not recorded | Verifying original six-document approval scope and later ADR approval boundaries | Claiming company-wide production, Finance, provider, or go-live approval |
| `doc/BRD_Website_Niuva.md` | Historical Active Baseline | Public brand, company pages, portfolio, and lead generation | Active only where v2.1 and later approved decisions do not replace it | Positioning, B2B credibility, portfolio, contacts, and public brand purpose | Treating Niuva as B2B-only or rejecting the approved Retail journey |
| `doc/PRS_Website_Niuva.md` | Historical Active Baseline | Public v1 goals, users, pages, CTA, and navigation | Active only for uncovered public-v1 scope | Public service hierarchy, project proof, CTA intent, and historical page scope | Treating e-commerce and portal exclusions as current platform direction |
| `doc/BRD_Platform_Niuva_v2_addendum.md` | Superseded | Platform v2.0 business requirements | None for new planning | Historical traceability only | Any new product or implementation decision |
| `doc/PRS_Platform_Niuva_v2_addendum.md` | Superseded | Platform v2.0 product scope | None for new planning | Historical traceability only | Any new product or implementation decision |
| `doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md` | Approved Baseline | Retail-B2B business requirements | Approved planning baseline in recorded scope | Business direction, shared foundations, risk, and scope | Selecting providers, policies, or authorizing production |
| `doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md` | Approved Baseline | Retail-B2B product goals and scope | Approved planning baseline in recorded scope | User groups, functional scope, CMS, operations, and acceptance | Silently resolving deferred decisions |
| `doc/PRD_Platform_Niuva_v2_1_retail_b2b.md` | Approved Baseline | Detailed platform requirements | Approved planning baseline in recorded scope | Journeys, roles, functional requirements, data boundaries, failure cases, and release sequence | Claiming implementation or go-live authorization |
| `PRODUCT.md` | Approved Baseline | Root product orientation | Orientation under approved baselines, canonical records, approved decisions, and ADRs; not a detailed specification | Fast orientation after canonical authority has been read | Overriding a more specific approved decision or ADR, or duplicating detailed requirements |
| `AGENTS.md` | Active Guardrail | Root repository entry point and implementation guardrails | Active implementation guardrail subordinate to canonical records, approved requirements, decisions, ADRs, and applicable runbooks | Safe repository workflow, privacy, data, role, and implementation boundaries | Creating new business, provider, policy, or visual decisions |
| `PRODUCT.brand-baseline-v1.md` | Supporting Reference | Public-v1 product and brand summary | Historical support only | Recovering public positioning and surface separation intent | Current platform scope or role model |
| `AGENTS.brand-baseline-v1.md` | Active Guardrail | Public-v1 brand and page guardrails | Active only where it does not conflict with v2.1 or later approved decisions | Public copy, CTA, capability hierarchy, portfolio, and brand rules | Overriding Unified Homepage, Retail-B2B scope, or specific Homepage decisions |
| `memory/PRD.md` | Context Only | Compatibility pointer to detailed platform requirements | No independent requirement authority; retained because history-rewrite procedures and external probes use this path | Locating canonical authority and the current detailed PRD path | Product decisions or new planning after Master Spec approval |

## Platform Decisions and Design Specifications

| Document | Status | Scope | Authority | Use when | Do not use for |
|---|---|---|---|---|---|
| `docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md` | Approved Baseline | Unified Retail-B2B platform design | Approved planning baseline | Shared architecture, journeys, CMS, operations, data, and release sequence | Homepage pattern after DEC-UX-001 or provider/policy selection |
| `docs/superpowers/specs/2026-07-14-integrated-operations-marketplace-design.md` | Superseded | Earlier integrated marketplace design | None for new planning | Historical traceability | Any current architecture or product direction |
| `docs/decisions/product/DECISION_LOG_Platform_Niuva_v2_1.md` | Approved with Open Decisions | Platform decision index | Active index; approved ADRs govern their technical topics | Identifying open Retail, payment, fulfillment, tax, inventory, storage, and readiness decisions | Treating an open entry or recommendation as approved |
| `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md` | Approved Baseline | MongoDB transaction capability | Technical authority for transaction-required operations | Transaction topology, fail-closed behavior, readiness, and affected mutations | Production infrastructure authorization or unrelated single-document operations |
| `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md` | Approved with Open Decisions | Production file-storage architecture | Technical authority for the approved provider-neutral/private boundary only | Storage port, private access, ownership, validation, and production gates | Selecting provider, RPO/RTO, retention, quota, owners, or enabling production upload |
| `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md` | Approved with Open Decisions | Retail payment architecture | Technical authority for provider-neutral online-payment boundary only | Core payment contract, adapter separation, idempotency, refund/reconciliation boundaries | Selecting gateway, enabling manual transfer, Finance activation, or go-live |
| `docs/superpowers/specs/2026-07-14-catalog-material-pricing-inventory-foundation-design.md` | Approved with Open Decisions | Catalog, material pricing, inventory foundation | Technical direction within documented scope | Catalog publication, material versions, inventory ledger, reservations, and migration | Product direction outside its slice or unresolved open decisions |
| `docs/superpowers/specs/2026-07-16-remove-emergent-local-storage-design.md` | Approved with Open Decisions | Development/demo storage only | Approved only for development/demo scope | Local adapter behavior and Emergent removal | Production storage architecture or readiness |
| `docs/superpowers/specs/2026-07-16-retail-order-checkout-foundation-design.md` | Candidate | First Retail checkout slice | Not approved for implementation | Reviewing a bounded technical proposal | Implementation, provider selection, or protected-scope changes |
| `docs/superpowers/specs/2026-07-21-backend-framework-security-upgrade-design.md` | Approved Decision | Focused dependency security upgrade | Conversation-approved implementation decision for its branch/slice | Security-upgrade scope and verification | Broader product, UI, or framework modernization |
| `docs/superpowers/specs/2026-07-21-redesign-main-reconciliation-design.md` | Approved Decision | Git reconciliation and branch cleanup | Conversation-approved workflow decision for that operation | Historical reconciliation constraints and recovery | Product, UX, or current branch-management policy outside that task |

## Brand and Experience Sources

| Document | Status | Scope | Authority | Use when | Do not use for |
|---|---|---|---|---|---|
| `docs/references/brand/NIUVA_BRAND_GUIDELINES_V1.0.pdf` | Supporting Reference | Official visual identity reference | Official brand reference; specific approved digital decisions govern digital application | Official `ni` mark, palette, Poppins/Inter origin, photography, and general motif language | Repeating motifs decoratively where a specific digital decision forbids it |
| `docs/references/company/Company profile PT Niuva_compressed.pdf` | Supporting Reference | Company positioning, services, projects, and contact facts | Factual source material; approval metadata is not recorded | Verifying company language and project facts | Inventing outcomes, metrics, clients, or current product requirements |
| `docs/references/brand/BRAND_WEBSITE_AUDIT.md` | Supporting Reference | Public website audit | Analysis and recommendation only | Understanding composition, logo, typography, motif, and photography conflicts | Treating recommendations as approval without a decision record |
| `docs/decisions/evidence/BRAND_APPROVAL_DECISIONS.md` | Approved Decision | Isolated Homepage prototype scope | Approved only for prototype work | Prototype constraints, protected foundations, and decision evidence | Production rollout or final Homepage direction where later decision exists |
| `docs/decisions/evidence/HOMEPAGE_PROTOTYPE_REVIEW.md` | Context Only | Prototype comparison evidence | Review evidence only | Understanding comparison, QA, strengths, risks, and recommendation | Production authority or route rollout |
| `docs/decisions/evidence/HOMEPAGE_PROTOTYPE_DECISION.md` | Approved Decision | Production Homepage planning direction | Specific approved Homepage design decision; implementation still not authorized | Experimental Editorial Hybrid, typography, U-curve, motion, composition, and protected foundations | Detailed Retail/B2B navigation or redesigning other routes |
| `doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md` | Context Only | Homepage implementation plan dated 13 July 2026 | Pending reconciliation; it predates the v2.1 Retail-B2B baseline and DEC-UX-001 | Recovering prior implementation analysis after reconciliation | Implementation before it includes Unified Homepage and receives explicit authorization |
| `doc/brand/BRAND_DIGITAL_EXTENSION.md` | Archive Candidate | Draft public digital-brand extension | No active authority; several decisions were resolved later | Historical comparison only | Typography, Homepage, or motif direction |
| `doc/brand/BRAND_IMPLEMENTATION_PLAN.md` | Archive Candidate | Early brand-work checklist | No active authority; checklist is stale | Historical sequencing only | Current planning or completion status |
| `DESIGN.md` | Active Guardrail | Current design-system guidance | Transitional and conflicted guidance; approved requirements and decisions override it | Inspecting current tokens, components, and implementation assumptions | Technical “N” logo, Poppins-only public body, or any rule conflicting with DEC-UX-002 |
| `design_guidelines.json` | Archive Candidate | Generated visual configuration | No recorded approval and multiple direct conflicts | Historical implementation trace only | Typography, palette, imagery, logo, Admin, or Homepage decisions |

## Runbooks

| Document | Status | Scope | Authority | Use when | Do not use for |
|---|---|---|---|---|---|
| `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md` | Runbook | Identity migration, role recovery, audit, handoff | Procedural authority within its operational scope | Migration dry run, backup, rollback, access recovery, and handoff | Product role direction or visual design |
| `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md` | Runbook | Catalog/material/inventory rollout and recovery | Procedural authority within its operational scope | Rollout, migration, correction, verification, rollback, and recovery | Product direction, pricing policy, or customer experience design |
| `doc/PRODUCTION_DEPLOYMENT.md` | Runbook | Provider-neutral production deployment | Procedural authority subject to approved architecture gates | Release, configuration, headers, readiness, and rollback | Selecting provider or authorizing go-live |
| `docs/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md` | Runbook | Controlled Git history rewrite | Procedural authority for NIV-001 only | Freeze, backup, rewrite, verification, publication, and recovery | Ordinary Git workflow or product direction |

## Implementation Plans and Execution Context

| Document | Status | Scope | Authority | Use when | Do not use for |
|---|---|---|---|---|---|
| `docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md` | Context Only | Identity/RBAC implementation plan | Implementation history; older standalone assumptions are overridden by ADR-001 where relevant | Understanding completed/planned slice work | New product decisions or transaction policy |
| `docs/superpowers/plans/2026-07-14-catalog-material-pricing-inventory-foundation.md` | Context Only | Catalog/material/inventory implementation plan | Implementation plan subordinate to its spec and ADRs | Detailed task history and file mapping | Product direction or unresolved policy decisions |
| `docs/superpowers/plans/2026-07-16-remove-emergent-local-storage.md` | Context Only | Emergent removal and local dev storage | Dev/demo implementation context | Historical implementation and verification | Production storage or upload authorization |
| `docs/superpowers/plans/2026-07-17-foundation-transaction-capability.md` | Context Only | Transaction-capability implementation | Implementation context subordinate to ADR-001 | Detailed implementation and verification history | Expanding approved transaction scope or production authorization |
| `docs/superpowers/plans/2026-07-21-redesign-main-reconciliation.md` | Context Only | Reconciliation implementation plan | Task-specific history | Reconstructing prior branch work | Current product or UX authority |
| `docs/superpowers/plans/2026-07-22-cross-surface-ui-ux-consistency-remediation.md` | Context Only | Proposed cross-surface remediation | **Untracked and untouched.** Pending reconciliation; conflicts with current Homepage decisions | Reviewing prior audit evidence and potential Admin remediation tasks | Execution, removing Inter, or treating Homepage as deferred |
| `.superpowers/sdd/*` | Context Only | Agent execution reports and review packages | No product authority | Implementation traceability | Requirements or decisions |
| `.superpowers/archive/Niuva-clean-20260720-sdd/*` | Context Only | Archived transaction implementation evidence | No product authority | Historical verification evidence | Current requirements or planning |

## Non-Product Documentation

| Document | Status | Scope | Authority | Use when | Do not use for |
|---|---|---|---|---|---|
| `README.md` | Context Only | Repository placeholder | None | Repository inspection only | Product or implementation direction |
| `frontend/README.md` | Context Only | Create React App boilerplate | Tooling reference only | Basic script discovery, subject to `package.json` | Product architecture or current deployment truth |
| `frontend/src/assets/brand/README.md` | Active Guardrail | Approved brand-asset directory usage | Local asset guardrail | Adding or referencing approved brand assets | Deciding brand identity or approval status |
| `test_result.md` | Context Only | Legacy testing-agent protocol | No product authority | Understanding historical test workflow | Product, UX, or current verification requirements |

## Reading Order for AI Agents

Canonical reading order:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. Relevant approved decision record or ADR
5. Relevant runbook for migration, rollout, rollback, backup, recovery, or handoff
6. Current source code and tests to understand implementation state
7. Supporting references when factual, brand, historical, or analytical context is needed

Do not use Superseded, Candidate, Context Only, or Archive Candidate documents as authority for new decisions. Do not ignore an ADR referenced by the Master Spec. Do not infer approval for any decision listed as open.
