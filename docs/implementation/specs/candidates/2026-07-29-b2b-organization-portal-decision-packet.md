# B2B Organization Portal and Customer Projection Decision Packet

Status: **Context Only — Owner Decisions Required — No Implementation Authority**
Decision queue: `DR-010`
Prepared: 29 July 2026
Feature: 2.2 Customer-safe B2B Projection
Evidence baseline: `1200340f4eab634d608d331f3a830c7ccb258212`

## Purpose

This packet asks Product, Access, Data, and Content owners to define the minimum
safe B2B organization portal contract. It does not authorize routes, role
grants, schema changes, migration, frontend implementation, provider
activation, deployment, or go-live.

The current repository has safe field allowlists for customer Inquiry, Quote,
and Project projections. It does not have authenticated customer B2B routes,
canonical aggregate ownership, project assignment, or a runtime organization
membership reader. Those boundaries must be decided before implementation.

## Existing facts

- Anonymous Inquiry submission is implemented.
- Internal Quote, Project, and Work Order lifecycles are implemented under
  `/api/admin/...`.
- Customer Quote and Project projection functions are default-deny allowlists.
- The `organization_customer` role has no Admin Studio permissions.
- Inquiry, Quote, QuoteVersion, and Project records have no canonical
  `organization_id`.
- No active service joins a customer identity to organization membership and
  assigned projects.
- Migration 001 created organization membership indexes, while Migration 005
  later classified organization collections as orphan/archive targets.
- Approved product requirements expect organization-scoped Quote/design
  approval, milestone, ETA, payment-term, QC, and shipment visibility.
- DR-010 remains open and explicitly blocks inventing the portal scope.

## Non-negotiable security invariants

Any approved option must preserve all of these:

1. Backend query scope is the authorization boundary; frontend route hiding and
   response projection are not authorization.
2. A customer lookup includes active membership and permitted organization or
   assigned Project in the database query before a document is returned.
3. Cross-organization, inactive-membership, unassigned-Project, and unknown IDs
   use one generic not-found contract.
4. Customer responses use explicit allowlists and exclude cost, margin, profit,
   supplier, internal notes, raw payment/provider payloads, internal audit,
   actor identity, operation IDs, and internal Work Order details.
5. Customer roles never receive Admin Studio permissions or Admin routes.
6. Organization ownership propagates immutably from Inquiry conversion to Quote
   and Project; it is not accepted from an untrusted command payload.
7. Ambiguous historical records are not inferred, automatically assigned,
   deleted, or silently exposed.
8. Approval commands use immutable versions, optimistic concurrency,
   idempotency identifiers, and auditable actor/organization scope.
9. No migration or organization-collection reactivation occurs without
   preflight, backup/restore, rollback, exact target, custody, window, and
   explicit execution permission.

## Decision 1 — First portal slice

### Option A — Read-only Quote and Project status

Expose only:

- list and detail of customer-safe Quotes;
- list and detail of customer-safe Projects; and
- milestone/ETA/next-action fields explicitly approved for customers.

No customer approval, revision request, design, file, payment, QC, shipment, or
membership command is included.

Benefits:

- smallest authorization and projection surface;
- proves organization ownership and query isolation first;
- no customer mutation or new commercial state transition.

Trade-off: does not yet complete the approved B2B journey.

### Option B — Read plus Quote accept/revision request

Adds versioned Quote acceptance and revision-request commands to Option A.

Benefits: provides the first useful customer commercial action.

Trade-off: requires customer Approver policy, acceptance evidence, stale-state
handling, support/reversal policy, notification behavior, and stronger audit
governance immediately.

### Option C — Full portal lifecycle

Adds design approval/comments, files, payment terms, QC, shipment, and member
management.

Benefits: closest to the complete product requirement.

Trade-off: combines several unresolved access, storage, payment, notification,
content, and operational decisions. It is too broad for a safe first slice.

### Recommendation

Approve **Option A** as the first bounded slice. Prove ownership, assignment,
query isolation, and safe projection before adding customer commands. Treat
Option B as a separately reviewed second slice and keep Option C deferred.

Owner decision required: Product and Access owners select A, B, C, or a
precisely bounded alternative.

## Decision 2 — Canonical ownership attachment

### Option A — Organization required at Inquiry conversion

Public Inquiry remains unowned. Before conversion, an authorized internal actor
selects or creates the canonical organization. The transaction creating the
Quote records immutable `organization_id`; Project inherits it from the
accepted Quote.

Benefits:

- preserves anonymous intake;
- ownership exists before any customer-visible Quote;
- Project ownership cannot diverge from Quote ownership.

Trade-off: needs a controlled organization-resolution workflow and ambiguity
stop rules.

### Option B — Organization required at Inquiry submission

Benefits: every Inquiry is immediately scoped.

Trade-off: breaks anonymous intake and conflicts with the approved baseline.

### Option C — Derive organization from company/email

Benefits: little operator work.

Trade-off: unsafe identity inference; company names and email domains are not
authorization evidence.

### Recommendation — canonical ownership attachment

Approve **Option A**. Explicitly prohibit automatic ownership inference from
company name, email domain, PIC email, or historical free text.

Owner decision required: Product, Access, and Data owners.

## Decision 3 — Membership and project assignment

Recommended minimum model:

- `organizations`: canonical organization identity and active/inactive state;
- `organization_memberships`: user, organization, role, status, and version;
- `project_assignments`: user or membership, Project, role override if
  applicable, status, and version;
- Organization Owner may see every Project in that organization;
- Project PIC, Approver, Finance, and Viewer see only explicitly assigned
  Projects unless an owner-approved role rule says otherwise;
- membership deactivation immediately removes new access;
- current customer session behavior must re-check membership on each scoped
  request or use a separately approved bounded cache/invalidation policy.

Owner decision required:

- whether Owner has organization-wide Project visibility;
- which non-Owner roles require explicit assignment;
- whether a member can hold more than one B2B organization role;
- who may invite, deactivate, or change members;
- whether membership changes revoke customer session families immediately; and
- retention and audit visibility for historical membership.

## Decision 4 — Customer route and method contract

Recommended Option A route family:

| Method | Route | Scope | Projection |
| --- | --- | --- | --- |
| GET | `/api/b2b/organizations` | Active memberships for current customer only | Minimal organization identity |
| GET | `/api/b2b/organizations/{organization_id}/quotes` | Active membership plus organization | Customer Quote summary |
| GET | `/api/b2b/organizations/{organization_id}/quotes/{quote_id}` | Same organization in query | Customer Quote plus approved version |
| GET | `/api/b2b/organizations/{organization_id}/projects` | Owner-wide or assigned Project rule | Customer Project summary |
| GET | `/api/b2b/organizations/{organization_id}/projects/{project_id}` | Same organization plus assignment rule in query | Customer Project and approved milestones |

The exact path names remain subject to owner approval. No `/admin/...` route is
reused. List responses require bounded pagination and stable sorting.

Generic not-found is recommended for unknown organization, inactive membership,
wrong organization, unassigned Project, unknown Quote/Project, and
cross-organization direct object access. The response must not reveal whether
the object exists elsewhere.

Owner decision required: route family, pagination envelope, maximum page size,
sorting, and whether the first slice exposes customer-safe `next_action`.

## Decision 5 — First-slice field matrix

### Organization

Recommended:

- `id`;
- customer display name; and
- customer-safe membership role label.

Withhold legal/tax/internal status, membership history, internal contacts, and
audit metadata unless separately approved.

### Quote

Retain the existing allowlist:

- Quote ID, customer-safe status, current revision, timestamps;
- version revision, currency, total, timestamp;
- customer scope snapshot; and
- line description, quantity, unit price, and line total.

Decision required: expiry, ETA, payment-term summary, and a customer-safe next
action. Always withhold internal acceptance evidence, internal reason, cost,
margin, supplier, sourcing/material snapshots, Work Orders, and audit history.

### Project

Retain the existing allowlist:

- Project ID, customer-safe status, timestamps; and
- milestone title, safe status, due date, and completion date.

Decision required: ETA, customer-safe next action, design summary, payment-term
summary, QC summary, and shipment summary. Always withhold Work Orders,
material allocations, shortages, supplier data, cost/margin/profit, internal
notes, and internal history.

Owner decision required: Product, Finance, Operations, and Access owners approve
every added field by name.

## Decision 6 — Historical data and migration boundary

Recommended policy:

- only records with explicit reviewed organization mapping become
  customer-visible;
- ambiguous records remain internal and read-only;
- no mapping from company string or email domain;
- no automatic backfill;
- preflight reports only safe aggregate counts and opaque identifiers;
- migration planning is separate from route implementation; and
- rollback removes only migration-owned fields/indexes and never rewrites
  commercial history.

Owner decision required:

- whether new records only or reviewed historical records enter the first
  slice;
- mapping/custody owner;
- retention and customer-communication procedure; and
- whether organization collections are restored, replaced, or redesigned.

No migration is authorized by this packet.

## Required verification after approval

The implementation packet must require:

- two organizations with crossed members and Projects;
- Owner, Project PIC, Approver, Finance, Viewer, inactive, and unrelated users;
- positive list/detail tests for the approved matrix;
- generic denial for wrong organization, unassigned Project, inactive
  membership, unknown ID, and direct URL access;
- poison-field tests at every returned nesting level;
- pagination and filter isolation;
- membership-change invalidation;
- concurrent/stale command tests if Option B is approved;
- no customer access to Admin routes;
- frontend/API route and projection parity; and
- disposable data/index evidence before any separately authorized migration.

## Approval record to complete

The approving owners must record:

- selected first portal slice;
- canonical ownership attachment point;
- membership and assignment rules;
- exact route/method/pagination contract;
- allowlisted fields and lifecycle states;
- historical-data policy;
- organization schema direction;
- implementation owner and branch;
- explicitly excluded work; and
- whether approval covers documentation, source implementation, tests, schema
  planning, or any later migration step.

Until that record exists, the correct state remains
`blocked_by_decision`. Approval of this document as context alone does not
authorize implementation.
