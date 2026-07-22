# Niuva Canonical Documentation Approval

## Approval Metadata

- Status: **Approved**
- Approval date: 23 July 2026
- Approval source: Explicit user approval recorded during documentation consolidation, 23 July 2026.
- Scope: Canonical product, experience, brand-application, operational-boundary, and documentation-authority baseline.

## Approved Documents

The following documents are approved within their stated scopes:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/context/CONVERSATION_HANDOFF.md`
4. `docs/decisions/DECISION_REGISTER.md`
5. `docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md`
6. `docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md`
7. `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md`

Approval of `docs/context/CONVERSATION_HANDOFF.md` confirms it as an approved context record. Its status remains **Context Only — Not Implementation Authority**.

## Approval Decision

Effective 23 July 2026:

- `docs/NIUVA_MASTER_SPEC.md` is the canonical product and experience source of truth.
- `docs/context/DOCUMENT_REGISTER.md` is the canonical document-authority and reading-order register.
- `docs/decisions/DECISION_REGISTER.md` is the canonical decision index.
- Approved ADRs remain the technical authority within their respective scopes.
- Runbooks remain procedural authority within their respective scopes.
- Brand Guidelines and the Company Profile remain supporting visual and factual references.
- Current implementation remains system-state evidence, not requirement authority.
- Documents classified as Superseded, Candidate, Context Only, or Archive Candidate must not be used as authority for new decisions.

This approval formalizes documentation authority. It does not expand the approval scope of any underlying technical decision, runbook, supporting reference, implementation plan, or current implementation.

## Scope Limitations

This approval does not authorize:

- source-code implementation;
- document migration;
- document deletion;
- implementation-plan execution;
- provider selection;
- policy selection;
- payment activation;
- production upload;
- production readiness; or
- go-live.

It also does not authorize Homepage implementation, Admin Studio implementation, route redesign, backend changes, API changes, database changes, schema changes, infrastructure changes, or production activation.

## Active Locked Decisions

This approval recognizes the active locked direction summarized below without reproducing the full Master Specification:

- Niuva is one unified Retail–B2B website and operational platform.
- Retail and Business/B2B retain separate customer lifecycles.
- Business/B2B and Niuva's R&D, design engineering, and prototyping positioning remain primary.
- The public entry uses a Unified Homepage.
- Business/B2B is the primary Homepage narrative.
- Retail is a secondary but clearly discoverable Homepage path.
- The Homepage visual direction is Experimental Editorial Hybrid.
- The Homepage uses Poppins + Inter in their approved roles.
- The U-curve is a semantic transformation path with two initial dominant Homepage placements.
- Admin Studio follows its approved operational experience direction and remains CMS plus Operations Back-office, not a third customer journey.
- The approved technical boundaries remain governed by ADR-001 for MongoDB transaction capability, ADR-002 for provider-neutral private production-file storage architecture, and ADR-003 for provider-neutral Retail online-payment orchestration.

## Deferred Decisions

Every decision identified as Deferred, Open, Not enabled, or Open dependency in `docs/NIUVA_MASTER_SPEC.md` remains unresolved and unchanged by this approval.

In particular, this approval does not silently resolve detailed Retail/B2B navigation, broader public-route rollout, provider, shipping, pickup, tax, reservation, cancellation, refund, return, production-storage readiness, payment operations, infrastructure, protected-scope implementation, production readiness, or go-live decisions.

## Effective Authority

From 23 July 2026, the effective authority order is:

1. `docs/NIUVA_MASTER_SPEC.md` for canonical product and experience direction.
2. Approved decisions and ADRs within their specific scopes.
3. Approved BRD, PRS, and PRD documents as provenance and authority where the Master Specification is explicitly silent.
4. Runbooks for procedures within their approved operational scopes.
5. Supporting references for facts, visual evidence, and historical context.
6. Current implementation as system-state evidence; it does not override approved requirements.

An approved decision or ADR remains controlling within its specific scope when the Master Specification summarizes that decision. Runbooks cannot create product direction, and supporting references cannot create implementation authorization.

## Next Authorized Activity

The only next activity authorized by this approval is:

`Preparation of a documentation migration and reconciliation plan.`

Execution of document migration, file movement, archival, archive-header insertion, root-pointer changes, link rewriting, implementation-plan execution, and source-code changes is not authorized.
