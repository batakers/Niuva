# Niuva Documentation Consolidation Handoff

Status: **Context Only — Not Implementation Authority**
Handoff date: 23 July 2026

This document summarizes available discussion context. It is not a transcript, does not contain hidden reasoning, and must not be used to override the Master Spec, an approved decision, or an ADR.

## Background

The user identified that the Homepage and Admin Dashboard still looked AI-generated and did not express Niuva as a credible, purposeful product-development company and operational platform.

The principal experience problems were:

- repeated cards and repeated page grammar;
- weak visual and action hierarchy;
- generic composition associated with SaaS or generated landing pages;
- insufficient distinction between marketing and operational surfaces;
- pseudo-terminal language and telemetry decoration in Admin Studio;
- decorative technical elements without informational purpose;
- low operational actionability and unclear next actions.

The repository also contained overlapping documents with different dates, approval scopes, supersession states, and authority levels. This created a material risk that people or AI agents could use the wrong requirement.

## Documents Reviewed

The documentation audit reviewed these groups:

- Website v1 BRD and PRS;
- Platform BRD/PRS v2.0 and v2.1;
- Platform PRD v2.1, PRODUCT, and AGENTS baselines;
- approval records, decision log, and ADRs;
- unified platform and foundation design specifications;
- Brand Guidelines and Company Profile PDFs, including visual inspection;
- Brand Website Audit, prototype approval, prototype review, final Homepage decision, and Homepage implementation plan;
- DESIGN, generated design guidance, and current UI evidence;
- identity, catalog, inventory, deployment, and Git security runbooks;
- implementation plans and `.superpowers` execution archives;
- current public routes, Homepage composition, brand identity components, and Admin pseudo-terminal strings as implementation evidence only.

Document paths and authority classifications are recorded in `docs/context/DOCUMENT_REGISTER.md`.

## Important Discoveries

- Niuva is one unified Retail-B2B website and operational platform.
- Business/B2B and the R&D, design engineering, and prototyping positioning remain primary.
- Retail is an additional transaction journey, not a replacement identity.
- Homepage work already had an audit, controlled prototypes, a review, a final design decision, and an implementation plan.
- The earlier Homepage implementation plan predates the v2.1 Retail-B2B baseline and therefore does not yet include the approved secondary Retail path.
- Admin Studio requires a separate operational design direction rather than a raw copy of public marketing expression.
- The official company mark is the `ni` brandmark; a technical “N” exists in implementation but is not the official logo.
- Authority was spread across approved baselines, historical baselines, guardrails, ADRs, plans, drafts, and current implementation.
- No complete raw conversation transcript is available in the repository. It must not be reconstructed.

## Decisions Explicitly Confirmed by User

The following were explicitly confirmed during documentation consolidation on 23 July 2026:

- Use one canonical documentation system.
- Use a Unified Homepage.
- Business/B2B is the primary Homepage narrative.
- Retail is a secondary but clearly discoverable Homepage path.
- Use Experimental Editorial Hybrid for the Homepage.
- Use Poppins + Inter for the public Homepage.
- Use the U-curve as a semantic transformation path.
- Limit the initial Homepage to two dominant U-curve placements.
- Make Admin Studio role-aware, task-oriented, dense but calm, status-driven, auditable, and recovery-aware.
- Reject pseudo-terminal decoration as the Admin Studio design direction.
- Separate canonical specifications, decisions, runbooks, references, implementation plans, context, and archive.

The Homepage decisions are formalized in:

- `docs/decisions/experience/DEC-UX-001-unified-homepage-b2b-primary.md`
- `docs/decisions/experience/DEC-UX-002-homepage-experimental-editorial-hybrid.md`

The Admin Studio operational direction is formalized in:

- `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md`

Final canonical documentation approval is formalized in:

- `docs/decisions/APPROVAL-NIUVA-CANONICAL-DOCUMENTATION-2026-07-23.md`

## Rejected Directions

- Generic SaaS presentation.
- Generic AI-generated landing-page composition.
- Card-heavy Homepage with repeated identical patterns.
- Retail-first or marketplace-first identity.
- E-commerce-only branding.
- Pseudo-terminal dashboard language or styling.
- Fake metrics, telemetry, awards, certifications, testimonials, or operational signals.
- Fake logo, client, project, or process evidence.
- Decorative U-curve wallpaper.
- Identical service cards that erase the primary/supporting capability hierarchy.
- Copying expressive public marketing decoration directly into Admin Studio.

## Current Status

- Documentation audit is complete.
- The canonical documents and formal decision records were approved on 23 July 2026.
- The formal canonical documentation approval record has been created.
- Source code has not been changed by this documentation phase.
- Document migration has not been executed.
- Existing files have not been moved, deleted, archived, or given archive headers.
- `AGENTS.md`, `PRODUCT.md`, and `DESIGN.md` have not been changed.
- The existing untracked cross-surface UI/UX plan has not been changed.
- Homepage, Admin Studio, route, backend, API, database, schema, provider, infrastructure, and go-live implementation are not authorized by this approval.
- No branch, commit, push, application build, or application test is part of this phase.

## Next Gate

1. Prepare a documentation migration and reconciliation plan.
2. Review proposed file movement, archive headers, root pointers, internal links, and transitional documents.
3. Obtain separate approval before executing migration.

Documentation migration execution and product implementation are not authorized by this handoff or the canonical documentation approval.
