# DEC-OPS-001 — Admin Studio Operational Experience Direction

ID: `DEC-OPS-001`
Title: Admin Studio Operational Experience Direction
Status: **Approved Decision**
Decision date: 23 July 2026
Decision source: Explicit user decision recorded during documentation consolidation, 23 July 2026.

## Context

The documentation audit and current-state evidence previously identified experience risks in Admin Studio, including:

- pseudo-terminal language;
- telemetry decoration;
- identical metric cards;
- weak operational hierarchy;
- insufficient visibility of the next action;
- sidebar and dashboard treatment that is not sufficiently role-aware; and
- public-marketing visual expression that is unsuitable for routine operations.

These findings explain why an explicit operational experience direction is required. They do not assert that every issue remains present in every Admin surface, nor that any issue has already been implemented or corrected.

Admin Studio is the shared internal operational environment for Niuva. It contains the structured CMS and Operations Back-office. It supports the unified platform but is not a third customer journey alongside Retail and Business/B2B.

## Decision

Admin Studio must be:

- role-aware;
- permission-aware;
- task-oriented;
- dense but calm;
- status-driven;
- auditable;
- recovery-aware;
- accessible; and
- optimized for data clarity, next action, conflict handling, and routine work.

Admin Studio consists of:

- CMS; and
- Operations Back-office.

The expressive composition of the public Homepage must not be copied directly into Admin Studio. Public and operational surfaces share the Niuva identity, but they serve different information, action, density, and recovery needs.

Pseudo-terminal decoration is not an Admin Studio design direction. Prohibited decorative language and treatments include:

- `SYS_ADMIN_CONSOLE`;
- `MODULE_LOADED`;
- `METRIC_ID`;
- `FETCHING_TELEMETRY`;
- `ACCESS_LEVEL`; and
- decorative status dots without informational meaning.

Monospace may still be used sparingly for real technical data where it improves scanning, such as:

- SKU;
- order number;
- revision;
- timestamp;
- operation ID;
- status code; and
- audit identifier.

Monospace use does not convert ordinary labels, explanations, navigation, metrics, or empty states into simulated terminal output.

## Rationale

Internal staff need fast scanning, visible next actions, effective filtering, clear status and permission boundaries, auditable activity, recoverable conflicts, and controlled data density. Operational clarity is more valuable than decorative novelty when staff are publishing content, reviewing files, managing materials, resolving stock conflicts, processing orders, approving work, checking payment state, or recovering from stale data.

Niuva's brand remains present through the official logo, approved palette, appropriate typography, component quality, and predictable interaction behavior. It is not established through terminal decoration, fabricated telemetry, or technical language without operational meaning.

## Consequences

- Admin Dashboard requires a dedicated audit and implementation plan before source changes are authorized.
- Dashboard overview must not be reduced to a generic KPI-card grid.
- Information, action priority, and navigation visibility must be appropriate to the active role and permissions.
- Loading, empty, error, retry, conflict, permission, stale, and expired states must be designed where applicable.
- Backend authorization remains the security boundary; this decision does not change it.
- This record does not authorize source-code implementation.

## Constraints

- Do not invent KPI values, operational data, metrics, SLA, or analytics.
- Do not change the permission model through UI design.
- Do not expose internal cost, margin, supplier, profit, or internal notes to customers.
- Do not use the Homepage U-curve as the main dashboard decoration.
- Do not give every role an identical dashboard and navigation by default.
- Do not treat a hidden button as authorization.
- Do not activate payment, production upload, infrastructure, or go-live.
- Do not treat `DESIGN.md` as higher authority than approved requirements or this bounded decision.

## Deferred Details

This decision does not determine:

- exact Admin information architecture;
- exact dashboard composition for each role;
- navigation grouping;
- responsive drawer behavior;
- role-homepage mapping;
- analytics or KPI definitions;
- visualization library;
- detailed component API;
- implementation authorization; or
- rollout sequence.

## Superseded Statements

Within the Admin Studio experience scope, this decision supersedes:

- pseudo-terminal or telemetry decoration as the default operational design direction;
- generic identical metric-card grids as sufficient dashboard hierarchy;
- assumptions that every role should receive identical navigation, information, and actions; and
- assumptions that public Homepage composition should be reproduced directly in Admin Studio.

This decision does not supersede `DESIGN.md` in full. `DESIGN.md` remains a transitional current-state reference, and its operational guidance remains useful where it does not conflict with approved requirements or this record. Product requirements, backend authorization, data boundaries, ADRs, and runbooks retain authority within their respective scopes.

## References

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/context/CONVERSATION_HANDOFF.md`
- `doc/PRD_Platform_Niuva_v2_1_retail_b2b.md`
- `doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md`
- `AGENTS.md`
- `DESIGN.md` — transitional/current-state reference only
- `doc/IDENTITY_RBAC_AUDIT_RUNBOOK.md` — procedural reference for role, permission, audit, and access recovery
- `doc/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md` — procedural reference for inventory conflict and recovery operations
