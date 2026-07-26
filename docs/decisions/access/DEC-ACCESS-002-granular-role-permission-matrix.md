# DEC-ACCESS-002 — Granular Internal Role and Permission Matrix

Status: **Approved Decision**
Decision ID: **DEC-ACCESS-002**
Decision date: 26 July 2026
Approval source: Explicit user approval of the Niuva Admin Studio implementation plan, 26 July 2026
Scope: Stable internal role identifiers, multi-role assignment, identity governance, separation of duties, and domain-audit boundaries

Related authority:

- docs/NIUVA_MASTER_SPEC.md
- docs/decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md
- docs/decisions/experience/DEC-OPS-002-admin-scope-reduction.md

## Context

DEC-ACCESS-001 preserves the granular internal role direction but deliberately
leaves technical identifiers, the permission matrix, audit scope, and migration
behavior open. The current runtime still uses the aggregate
operations/commercial_finance model, which is implementation evidence rather
than target authority.

The approved Admin Studio implementation plan also requires a bounded rebuild of
staff invitation, deactivation, and role assignment. That rebuild must not restore
the former broad role-management surface for operational staff.

## Decision

### Stable internal roles

The approved internal identifiers are:

- content_editor
- catalog_manager
- warehouse
- order_admin
- sales_estimator
- designer_engineer
- production
- quality_control
- finance
- manager_approver
- super_admin

An internal account may hold multiple explicitly assigned roles. Effective
permissions are the union of those roles. super_admin is exclusive and must not
be combined with another role.

Customer roles remain separate from internal roles and must not be combined with
them.

### Identity governance

Only super_admin may:

- view the general internal user directory;
- invite an internal user;
- assign or remove internal roles;
- deactivate or reactivate an internal account; and
- inspect the identity-governance audit detail required to recover those actions.

Operational roles receive only their own safe role labels and effective
permissions plus minimal domain-scoped customer or staff projections required for
assigned work.

Every invite, role change, deactivation, and reactivation requires an actor,
reason, timestamp, before/after safe projection, session invalidation where
applicable, and an append-only audit event.

### Domain responsibilities

| Role | Approved responsibility |
|---|---|
| content_editor | Draft, edit, validate, and preview structured content and portfolio records; submit publication work for approval |
| catalog_manager | Manage category, product, variant, configuration, pricing draft, and publication candidate data |
| warehouse | Manage materials, routine receipts, reservations, consumption support, restock work, and inventory reads |
| order_admin | Manage Retail order administration, customer-safe communication, and fulfillment coordination |
| sales_estimator | Triage inquiries, prepare quotation versions, and manage customer-safe commercial scope and ETA |
| designer_engineer | Manage design versions, technical project milestones, files, and engineering review data |
| production | Manage work orders, BOM allocation, production steps, outputs, and production blockers |
| quality_control | Manage QC records, release decisions, rejection, and rework requests |
| finance | Read and operate approved payment, invoice, reconciliation, and refund-request workflows |
| manager_approver | Approve publication, price override, manual stock adjustment, refund, and other explicitly sensitive domain actions |
| super_admin | Identity governance, emergency recovery, and unrestricted platform administration within approved product boundaries |

### Separation of duties

- Content and catalog authors may prepare and submit records but may not approve
  their own publication unless they also hold manager_approver.
- warehouse may perform routine governed inventory operations. Manual stock
  adjustment requires manager_approver.
- finance may prepare reconciliation and refund work. Refund execution requires
  manager_approver.
- Price override requires manager_approver; ordinary approved pricing and
  immutable quote/order snapshots remain domain operations.
- UI visibility never replaces backend authorization or query scope.

### Audit visibility

- Full platform audit browsing remains unavailable to non-governance roles.
- Domain detail views may expose an allowlisted workflow timeline for the current
  inquiry, quote, project, Retail order, content record, catalog record, or
  inventory operation when the actor can read that domain record.
- Domain timelines expose only actor display identity, action, status transition,
  reason safe for internal operations, timestamp, and safe operation reference.
- Raw authentication, secret, provider, cost, margin, supplier, profit, and
  unrelated cross-domain fields remain excluded.

## Amendment to DEC-OPS-002

The Role Management row in DEC-OPS-002 is amended only as follows:

- a Super Admin-only internal invitation and access-management surface is approved;
- invite, role assignment, deactivation, and reactivation APIs are approved within
  the constraints above;
- organization management UI, Internship, the full audit viewer, and the Restock
  navigation decision remain unchanged.

This does not restore role management for operational staff.

## Migration and compatibility

- Existing accounts are never silently elevated.
- Existing operations, commercial_finance, legacy admin, and granular markers
  enter access_review_required unless a reviewed mapping explicitly assigns the
  new roles.
- The active bootstrap super_admin remains the only automatically preserved
  internal authority.
- Migration uses a new versioned file; historical migrations are not edited.
- Backup, dry run, opaque reviewed mapping, transaction-capability verification,
  idempotent apply, second-run no-op, validation, and rollback evidence are
  mandatory.

## Authorization boundary

This decision authorizes source implementation on the approved
feat/admin-studio-implementation branch. It does not authorize production account
migration, provider activation, push, merge, production rollout, or go-live.

