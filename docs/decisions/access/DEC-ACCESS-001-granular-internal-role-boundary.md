# DEC-ACCESS-001 — Granular Internal Role and Operational Access Boundary

Status: **Approved Decision**
Decision ID: `DEC-ACCESS-001`
Decision date: 24 July 2026
Approval source: Explicit user approval in the backend-audit conversation on
24 July 2026
Scope: Internal role direction, general identity metadata, and audit visibility

## Context

The canonical Master Spec defines granular internal roles:

- Content Editor;
- Catalog Manager;
- Warehouse;
- Order Admin;
- Sales/Estimator;
- Designer/Engineer;
- Production;
- Quality Control;
- Finance;
- Manager/Approver;
- Super Admin.

The current runtime instead contains a three-role startup model:
`super_admin`, `operations`, and `commercial_finance`. A proposed identity
amendment described that model, but it was not reconciled into the canonical
Master Spec or Decision Register. The runtime also grants `users.read` and
`audit.read` to `operations`, while its own design and a backend test expect a
stricter boundary.

The backend audit therefore requested an explicit decision before changing
requirements, permission code, migrations, or tests.

## Decision

### Canonical role direction

The granular internal role model in the Master Spec remains canonical.

The aggregate three-role startup model is not approved as the target role
model. Its presence in source code is implementation evidence to be
reconciled, not authority to replace the canonical roles.

No current account may be silently elevated or automatically remapped while
the granular permission and migration matrix is being prepared. Migration must
remain fail-closed, reviewed, auditable, and reversible.

### General user and role metadata

Internal roles whose assigned business responsibility does not include identity
governance must not receive:

- a general user directory;
- complete role definitions or the role-management surface;
- unrestricted identity or access-review data.

A handler may still return the authenticated actor's own safe role label and
effective permissions. A domain workflow may return a minimal customer or
contact projection required for an assigned order or project. Those projections
are not a general user directory and must remain query-scoped and
field-restricted.

### Audit visibility

Operational staff must not receive the full audit log.

Domain-scoped audit visibility is the approved direction only where it is
required for the actor's assigned operational responsibility. Before any such
access is enabled, a separately reviewed permission matrix must define:

- the granular role;
- allowed audit action and target families;
- organization, project, order, or operational query scope;
- customer-safe and staff-safe field projection;
- redacted fields;
- retention and export behavior;
- tests for forbidden cross-domain access.

Until that matrix is approved and implemented, non-governance audit access
fails closed. This decision does not assign full-audit authority to a particular
role; that exact governance matrix remains open.

## Consequences

- `operations` and `commercial_finance` are not permanent canonical replacements
  for the granular internal roles.
- The current `operations` grants for `users.read` and `audit.read` must not be
  treated as approved behavior.
- The failing `/api/admin/roles` test must be resolved from this decision and
  the eventual granular permission matrix, not by weakening the test to match
  the current runtime.
- The proposed three-role identity design and its implementation plan are
  superseded for future role direction. They remain context for migration and
  implementation history only.
- Backend, frontend, migration, and rollout changes require a bounded
  implementation plan with compatibility, backup, dry-run, rollback, and
  verification steps.

## Open Implementation Decisions

- Stable technical identifiers for every granular role.
- Exact permission matrix for each granular role.
- Full-audit governance roles and emergency-access behavior.
- Domain-scoped audit event and field matrix.
- Mapping of existing `operations`, `commercial_finance`, legacy `admin`, and
  other existing accounts.
- Session/token invalidation and access-review rollout.
- Non-production smoke test, migration window, and rollback owner.

No open implementation decision silently restores the three-role model or
grants general user, role-definition, or full-audit access to operational staff.

## Excluded from Approval

This decision does not itself authorize:

- source-code or frontend changes;
- account migration;
- permission rollout;
- production activation;
- destructive data changes;
- provider selection or go-live.
