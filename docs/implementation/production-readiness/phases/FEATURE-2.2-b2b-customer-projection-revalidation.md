# Feature 2.2 — Customer-Safe B2B Projection Read-Only Revalidation

Status: **projection foundation passes — customer routes and isolation are decision blocked**
Feature: Customer-safe B2B Projection
Baseline: `1200340f4eab634d608d331f3a830c7ccb258212`
Branch: `fix/backend-b2b-customer-projection`
Revalidation date: 29 July 2026

## Outcome

The repository already has default-deny allowlist projections for a customer
inquiry, Quote with current version, and Project milestones. The projection
tests poison every aggregate level with cost, margin, profit, supplier,
internal-note, raw-payment, audit, actor, operation, and internal-state fields
and prove that none reach the resulting customer document.

This does not complete Feature 2.2. Only the anonymous inquiry response uses a
customer projection. Every Quote, Project, Work Order, material-shortage, and
command route is under `/admin/...` and returns an internal projection. There
is no authenticated B2B customer API or frontend consumer.

Organization/project query isolation cannot yet be implemented safely:

- B2B Inquiry, Quote, QuoteVersion, and Project aggregates carry no canonical
  `organization_id` or project-assignment identity;
- B2B service queries use only record ID, status, Quote ID, Inquiry ID, or
  Project ID;
- `organization_customer` intentionally has no Admin permissions;
- `organization_memberships` has no current runtime reader and Migration 005
  treats the organization collections as orphan/archive targets; and
- DR-010 explicitly keeps the portal, lifecycle, and access contract open.

Adding customer routes now would require inventing organization ownership,
assignment, role capabilities, not-found behavior, and lifecycle visibility.
The decision register forbids inferring that scope.

This revalidation changed no backend/frontend source, route, role, schema,
migration, provider, `.env`, or shared data.

## Verified projection boundary

| Requirement | Current evidence | Result |
| --- | --- | --- |
| Hide cost | Customer Quote item allowlist contains price and line total but no cost field | Pass |
| Hide margin and profit | No margin/profit field is present in any customer allowlist; poisoned nested records are withheld | Pass |
| Hide supplier | Quote items do not expose material snapshots or supplier data; poisoned supplier fields are withheld | Pass |
| Hide internal notes | Inquiry, Quote version, Project, and milestone allowlists omit internal notes and undeclared free text | Pass |
| Hide raw payment and audit data | Payment payloads, history, actors, operation IDs, version, and permitted actions are excluded | Pass |
| Default-deny future fields | `_pick` copies only named fields; undeclared aggregate growth stays withheld | Pass |
| Anonymous inquiry response | `POST /api/inquiries` returns `project_customer_inquiry` rather than the internal projection | Pass |
| Customer Quote route | No authenticated customer route or consumer exists | Blocked — B2BCP-001 |
| Customer Project route | No authenticated customer route or consumer exists | Blocked — B2BCP-001 |
| Organization query isolation | No runtime ownership/assignment model joins a customer to B2B aggregates | Blocked — B2BCP-002 |
| Direct object access deny matrix | Cannot be meaningfully tested until the ownership and route contract exists | Blocked — B2BCP-002 |

## Findings

### B2BCP-001 — Customer-safe Quote and Project projections have no route consumer

Severity: **P1 feature gap / decision blocked**

`project_customer_quote` and `project_customer_project` are currently exercised
only as pure domain functions and tests. The B2B router imports only
`project_customer_inquiry`; all Quote, Project, Work Order, shortage, approval,
and transition endpoints are Admin-only.

The approved product baseline expects an organization portal for Quote/design
approval, milestones, ETA, next action, payment terms, QC, and shipment.
DR-010 keeps the exact portal and lifecycle scope open, so this branch must not
create those routes from inference.

Required decision: Product, content, and access owners approve the bounded
customer route/method matrix, visible lifecycle states, read versus command
scope, response envelopes, frontend consumer, and explicit implementation
authorization.

### B2BCP-002 — Organization and assigned-project ownership cannot be enforced

Severity: **high security boundary / decision and data blocked**

The current B2B aggregates do not record a canonical organization owner or
assigned member/project relationship. Existing indexes cover aggregate identity
and internal lifecycle queries, not customer ownership. Organization membership
indexes exist only in the historical identity migration, while Migration 005
classifies those collections as orphan/archive targets.

Exposing lookup-by-ID customer routes without first resolving this model would
create an object-level authorization risk. Filtering a safe projection after an
unscoped lookup is not authorization.

Required decision and design:

- canonical organization identity on Inquiry, Quote, and Project;
- immutable ownership propagation from conversion through Project creation;
- active membership and per-project assignment schema;
- Owner, Project PIC, Approver, Finance, and Viewer read/command matrix;
- query-first isolation and generic not-found behavior;
- membership revocation/session behavior;
- required indexes and ambiguous historical-data policy; and
- separately authorized non-destructive migration/rollback plan if stored data
  must change.

### B2BCP-003 — Existing projection tests do not prove an authenticated boundary

Severity: **medium evidence gap**

The poison tests strongly prove field allowlisting, but there is no
authenticated positive/negative matrix for two organizations, two projects,
inactive membership, unassigned project, cross-organization IDs, role-specific
approval/payment fields, pagination, or direct URL access. That coverage cannot
be added honestly until B2BCP-001 and B2BCP-002 are decided.

Required verification after approval: seed at least two organizations and
crossed memberships/projects, then prove query isolation, direct object denial,
safe fields, role-specific actions, stale/conflict behavior, and frontend/API
parity.

## Verification evidence

Focused B2B domain, route, lifecycle, projection, work-order, and transaction
packet:

```text
backend/.venv/bin/python -m pytest -c backend/pytest.ini -n 0 -q -rs \
  backend/tests/test_b2b_customer_projection.py \
  backend/tests/test_b2b_inquiry_domain.py \
  backend/tests/test_b2b_inquiry_routes.py \
  backend/tests/test_b2b_inquiry_service.py \
  backend/tests/test_b2b_project_lifecycle.py \
  backend/tests/test_b2b_quote_conversion.py \
  backend/tests/test_b2b_quote_item_snapshots.py \
  backend/tests/test_b2b_quote_lifecycle.py \
  backend/tests/test_b2b_work_orders.py \
  backend/tests/test_b2b_transaction_integration.py

42 passed, 1 skipped in 0.57s
```

The skipped real-replica-set test was run separately:

```text
NIUVA_RUN_REAL_TRANSACTION_TESTS=1 \
MONGO_TRANSACTION_TEST_URL=mongodb://127.0.0.1:27019/?replicaSet=rs0 \
backend/.venv/bin/python -m pytest -c backend/pytest.ini -n 0 -q -rs \
  backend/tests/test_b2b_transaction_integration.py

4 passed in 0.86s
```

The transaction tests used unique databases and removed them in cleanup. No
application migration or shared database operation occurred.

Full backend regression:

```text
backend/.venv/bin/python -m pytest -c backend/pytest.ini -n 0 -q -rs backend/tests

571 passed, 12 skipped, 14 subtests passed in 32.56s
```

## Gate and handoff

The existing field projections are safe to retain. Do not add customer B2B
routes, grant Admin permissions to `organization_customer`, reactivate archived
organization collections, infer historical ownership, or modify schema/data
until DR-010 and the ownership/assignment model are explicitly approved.

The next artifact is the context-only candidate decision packet
`2026-07-29-b2b-organization-portal-decision-packet.md`. It presents route,
role, ownership, assignment, lifecycle, safe-field, historical-data, index,
migration, rollback, and E2E options to the required owners without treating a
recommendation as approval.
