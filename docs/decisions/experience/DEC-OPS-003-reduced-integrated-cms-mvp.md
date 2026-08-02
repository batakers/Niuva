# DEC-OPS-003 — Reduced Integrated CMS for MVP

- **Status:** Approved Decision
- **Decision date:** 30 July 2026
- **Decision owner:** Product decision authority
- **Decision source:** Explicit user approval of NMVP-D08 Option A
- **Scope:** MVP content-management topology and publishing controls

## Context

The approved platform baseline defines CMS as a structured module inside the
Niuva Admin Studio. The MVP decision packet asked whether Niuva should keep a
reduced integrated CMS, adopt an external CMS, or build a broader custom CMS.

The initial operating model has one content and Retail operator, who may be the
same person. That operator is allowed to publish directly when the account also
holds the applicable approval permission. A separate external CMS would add
integration, authentication, preview, audit, and operating overhead without
removing the need for Niuva's operational Admin modules.

## Decision

Niuva will use **Option A: a reduced integrated structured CMS inside the Admin
Studio for MVP**.

The following constraints apply:

1. The MVP does not use an external CMS provider and does not include a
   free-form page builder.
2. The reduced CMS prioritizes structured management of public content needed
   for launch, including portfolio/projects, service content, contact content,
   and other approved public-page fields. This prioritization does not remove
   structured fields already required by an approved baseline.
3. Content remains structured and validated. Preview, publication state,
   scheduling where supported, version history, rollback, archive, and audit
   requirements remain part of the approved CMS direction.
4. The content lifecycle remains:
   `draft -> review -> preview -> published/scheduled -> archived`.
5. One person may author and publish content only when that account holds the
   applicable `manager_approver` capability. Combining people does not remove
   authorization checks or audit history.
6. CMS and operational tools remain distinct modules within one Admin Studio.
   CMS content must not become the source of truth for inventory, pricing,
   Retail orders, payments, production tracking, or B2B project records.
7. An external CMS, a broader custom CMS, or a different publishing topology is
   deferred and requires a superseding approved decision.

## Why This Option

- It fits the current one-person operating model without creating a second
  administration system.
- It preserves structured validation, authorization, preview, and auditability.
- It keeps operational domains separate while retaining one coherent Admin
  entry point.
- It reduces MVP integration and training complexity.

## Alternatives Considered

### Option B — External headless CMS

Not selected for MVP. It would introduce a second identity and content system,
integration work, preview synchronization, and additional operating overhead.

### Option C — Broad custom CMS or page builder

Not selected for MVP. Its authoring flexibility and implementation scope exceed
the current launch needs.

## Consequences and Follow-up

- MVP planning and implementation must use the integrated structured CMS
  topology.
- The reduced scope must still preserve approved authorization, lifecycle,
  audit, validation, and rollback expectations.
- Detailed field schemas, validation rules, and implementation sequencing
  remain subject to the applicable specification and task authorization.
- Existing routes or source files are implementation evidence only; this
  decision does not claim that the CMS is complete.
- This decision does not authorize source-code changes, migrations, deployment,
  production-readiness, or go-live.

## Related Authority

- [`NIUVA_MASTER_SPEC.md`](../../NIUVA_MASTER_SPEC.md)
- [`PRD_Platform_Niuva_v2_1_retail_b2b.md`](../../references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md)
- [`DEC-OPS-001-admin-studio-operational-direction.md`](DEC-OPS-001-admin-studio-operational-direction.md)
- [`2026-07-30-niuva-mvp-decision-packet.md`](../../implementation/specs/candidates/2026-07-30-niuva-mvp-decision-packet.md)
