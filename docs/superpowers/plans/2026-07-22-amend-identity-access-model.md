# Amend Identity Access, Least-Privilege Migration, Transactional Audit, and Redaction Implementation Plan

> **For implementation:** use `superpowers:executing-plans` and execute tasks in
> order. Do not begin the Catalog CMS/Supplier plan until every required test and
> rollout check in this plan is green.

**Goal:** Replace the legacy ten-role internal model with the approved three-role
model, quarantine legacy elevated accounts until an Owner explicitly reviews
them, and ensure access/organization changes are atomically and safely audited.

**Architecture:** `permissions.py` becomes the single policy resolver for the
versioned role matrix and fails closed for disabled/review-required identities.
The existing `TransactionMutationGuard` remains the only transaction entry
point: the identity and organization routers will receive it from the FastAPI
composition root and perform their document writes and allowlisted audit event
in one MongoDB session. Role-aware response/payload projections close the
current Catalog, Material, Organization, Order, and restock-recipient gaps
without implementing the deferred Catalog CMS state machine or Supplier data
model.

**Tech Stack:** Python 3.14, FastAPI, Motor/MongoDB replica set transactions,
Pydantic, React, Vitest, pytest, GitHub Actions.

---

## Status implementasi (22 Juli 2026)

- [x] Task 1 — resolver kebijakan fail-closed dan berversi.
- [x] Task 2 — batas endpoint dan field sesuai peran.
- [x] Task 3 — audit allowlist dengan redaksi default-deny.
- [x] Task 4 — mutasi kebijakan akses transaksional dan aman terhadap konkurensi.
- [x] Task 5 — mutasi organisasi dan membership memakai batas transaksi yang sama.
- [x] Task 6 — migrasi kebijakan dan rollback aman beserta runbook.
- [x] Task 7 — Admin Studio mengikuti kontrak akses aman.
- [ ] Task 8 — verifikasi otomatis selesai; smoke test non-produksi dan rollout berizin masih tertunda.


## Scope, decisions, and guardrails

- The approved technical role identifiers are `super_admin` (display label
  **Owner**), `operations`, and `commercial_finance`. `super_admin` retains
  wildcard `*` and therefore can perform every permissioned action.
- Customer roles remain `retail_customer` and `organization_customer`; they
  never gain internal administration access.
- Store account state as two fields: `status: active|disabled` and
  `access_state: approved|access_review_required`. `disabled` always wins;
  `access_review_required` grants no internal permission. This implements the
  design's three effective states without overloading the existing login status.
- Each approved internal user has exactly one internal role. The access API may
  not accept a multi-role combination. A future policy change is a new,
  versioned migration, not an ad-hoc exception.
- Use a new migration `003_identity_access_policy.py`; never rewrite historical
  migrations `001` or `002` after they may have been applied.
- Reuse `app.state.transaction_guard.run(...)`. Do not create a second executor,
  direct `start_transaction`, fallback write path, or automatic retry policy.
  Set `retry_safe=False`, use fixed operation names, and leave correlation ID
  empty. The existing `transaction_unavailable` 503 contract must remain exact.
- The Catalog amendment, not this plan, owns `draft -> review ->
  publish/schedule/archive`, self-review history, scheduling, Supplier master,
  purchasing, and supplier-specific prices. This plan only creates safe
  permission boundaries around current endpoints so activating Operations does
  not expose price or supplier data first.

### Canonical permission matrix implemented now

| Capability family | Owner | Operations | Commercial & Finance |
|---|:---:|:---:|:---:|
| Identity, role/access review, full audit, settings/recovery | all | — | — |
| Admin workspace dashboard | yes | safe operational view | safe commercial view |
| Content/media, catalog drafts | yes | manage, excluding price fields | read/review-only until CMS amendment |
| Catalog publish/archive | yes | — | manage current publish/archive endpoints |
| Materials and inventory | yes | material/inventory/restock manage, no supplier reference | availability/read only |
| Pricing, quote, payment, invoice, refund | yes | safe order/payment status only | manage |
| Orders, production, quality, fulfilment | yes | manage operational status | read safe status only |
| Customers/organizations | yes | fulfilment-safe read only | manage |

New permission keys may be introduced only where an existing broad key needs
splitting (`dashboard.read`, `internships.read`, `supplier_reference.read`,
`supplier_reference.write`, `organizations.fulfilment.read`). Do **not** add
future CMS keys such as `catalog.review` or `catalog.schedule` in this change;
the Catalog amendment will add their workflow and tests together.

### Required test environment

Run commands from the repository root. When the local virtual environment is
not yet present, create it before testing:

```powershell
python -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

For the rest of this plan, `$py` means `backend\.venv\Scripts\python.exe`.
All focused pytest commands use `-n 0` because the test doubles mutate shared
module state.

## Task 1: Establish the fail-closed, versioned policy resolver

**Files:**

- Modify: `backend/permissions.py`
- Modify: `backend/server.py`
- Modify: `frontend/src/lib/permissions.js`
- Modify: `backend/tests/test_permissions.py`
- Modify: `backend/tests/test_auth_security.py`
- Modify: `frontend/src/lib/permissions.test.js`

### Step 1: Write the policy tests first

Replace legacy-role assertions with a table-driven matrix for each role. Cover:

```python
assert has_permission({"roles": ["super_admin"], "status": "active",
                       "access_state": "approved"}, "roles.manage")
assert has_permission(operations, "inventory.write")
assert not has_permission(operations, "pricing.write")
assert not has_permission(operations, "catalog.publish")
assert has_permission(commercial_finance, "pricing.write")
assert not has_permission(commercial_finance, "inventory.write")
assert permissions_for({"role": "admin", "roles": [],
                        "access_state": "access_review_required"}) == frozenset()
assert permissions_for({"roles": ["operations"], "status": "disabled",
                        "access_state": "approved"}) == frozenset()
```

Add client tests proving that a legacy `client` still resolves as
`retail_customer`, but a legacy `admin` never resolves to Owner. Add equivalent
frontend policy tests for the returned `permissions` array and `*` wildcard.

Run:

```powershell
& $py -m pytest -n 0 -q backend\tests\test_permissions.py backend\tests\test_auth_security.py
npm --prefix frontend test -- --watchAll=false src/lib/permissions.test.js
```

Expected: tests initially fail because the old resolver still has ten roles and
falls back from empty `roles` to `role: admin`.

### Step 2: Implement the policy and response contract

In `backend/permissions.py`:

1. Declare `ROLE_POLICY_VERSION = "2026-07-22-v1"`, canonical customer and
   internal role sets, role labels, and the exact permission sets described in
   the table above. Keep `super_admin: {"*"}`.
2. Make `canonical_roles(user)` return `()` when `status != "active"` or
   `access_state == "access_review_required"`. Presence of `roles`, including
   `roles: []`, is authoritative; it must never trigger a legacy fallback.
3. Retain only low-privilege legacy compatibility (`role: client` ->
   `retail_customer`) during the migration window. `role: admin` and every
   superseded internal role resolve to no authority.
4. Reject invalid/multiple internal role combinations with reusable pure
   validators. Do not accidentally turn unknown values into a customer role.

In `backend/server.py`, extend `safe_user()` with `access_state`,
`role_policy_version`, and user-facing role labels while retaining stable
`roles`/`permissions` fields. Use canonical roles for seed/provisioning:
new customer accounts get `roles: ["retail_customer"]` and
`access_state: "approved"`; the controlled seed/bootstrap path gets canonical
Owner fields rather than `role: "admin"`. Keep the token claim as identity-only:
`get_user_from_token()` must continue loading the live database user for every
request.

Update frontend permission helpers to consume the new safe user contract and
never infer authority from a role name alone.

### Step 3: Re-run the focused policy suite

```powershell
& $py -m pytest -n 0 -q backend\tests\test_permissions.py backend\tests\test_auth_security.py
npm --prefix frontend test -- --watchAll=false src/lib/permissions.test.js
```

Expected: all focused policy tests pass; no role string from the prior ten-role
model remains an effective internal role.

## Task 2: Enforce current endpoint and field boundaries before activating roles

**Files:**

- Modify: `backend/server.py`
- Modify: `backend/catalog_routes.py`
- Modify: `backend/catalog_service.py`
- Modify: `backend/material_routes.py`
- Modify: `backend/organization_routes.py`
- Modify: `backend/inventory_service.py`
- Modify: `backend/tests/test_auth_security.py`
- Modify: `backend/tests/test_catalog_routes.py`
- Modify: `backend/tests/test_material_pricing.py`
- Modify: `backend/tests/test_inventory_service.py`

### Step 1: Add failing boundary tests

Add regression tests proving all of the following, using real route dependencies
or their existing fake database equivalents:

- Operations can create/update catalog draft content but receives `403` for
  publish and archive. Its product write cannot change `pricing_mode`,
  `price_from`, `pricing_rule_reference`, a variant `fixed_price`, or currency.
- Commercial & Finance can use current publish/archive routes but cannot use
  inventory mutations, production transitions, or manual reconciliation.
- Operations receives no `supplier_reference` in material list/detail responses
  and a submitted `supplier_reference` is rejected rather than silently
  persisted. Commercial & Finance can see it only through the explicit
  capability; Owner remains unrestricted.
- Operations receives a fulfilment-safe organization projection only (stable
  identifier, display name, lifecycle state and the minimum active member
  linkage needed for fulfilment), never `tax_id`, `legal_name`, or full member
  profiles. Commercial & Finance/Owner retain the management projection.
- `GET /admin/orders` returns a safe operational projection for Operations:
  identifiers, customer fulfilment contact, material/fulfilment fields and
  operational status/history only. It excludes estimate amount/note, payment
  object/proof, bank data and internal price fields. Commercial & Finance's
  payment-safe status/read authority is tested separately.
- Restock recipients are selected by a capability such as
  `restock_alerts.read`, not the retired literal role names. An approved
  Operations user receives the intended notification; review-required and
  disabled users do not.
- `/admin/internships` no longer uses broad `admin.access`; it is Owner-only
  through `internships.read`. `/admin/stats` uses a deliberately safe
  `dashboard.read` contract instead of becoming a generic admin backdoor.

Run:

```powershell
& $py -m pytest -n 0 -q backend\tests\test_catalog_routes.py backend\tests\test_material_pricing.py backend\tests\test_inventory_service.py backend\tests\test_auth_security.py
```

Expected: failures expose the current broad payloads, broad documents and
literal retired restock roles.

### Step 2: Implement minimal safe projections and payload gates

1. Split the current `admin.access` dependencies in `server.py` into specific
   capabilities. Do not grant an endpoint merely because a user reached the
   Admin Studio shell.
2. In `catalog_routes.py`/`catalog_service.py`, preserve the present
   draft/published/archived model but apply a role-aware payload allowlist before
   service writes. Operations can edit descriptive draft/media/CTA fields and
   variants/options without price-bearing fields; supply an explicit `403`
   machine-readable error for a forbidden submitted field. Do not invent review
   or schedule transitions here.
3. Make `build_material_router` accept the reusable permission checker. Add
   material serializers and write-field validation keyed to
   `supplier_reference.read/write`; all responses and writes retain the current
   full contract for Owner/Commercial & Finance but redact/reject this field for
   Operations. Pricing routes remain unavailable to Operations.
4. Make `build_organization_router` accept the permission checker and serialize
   the safe fulfilment view for `organizations.fulfilment.read`, while
   `organizations.manage` keeps the complete management response. Do not weaken
   customer membership isolation.
5. Add an explicit `serialize_admin_order_for(actor, order)` in `server.py` and
   use it on every internal order read path; select the projection from
   permissions, never a client-supplied role. Ensure write endpoints retain
   their specific `quotes.write`, `payments.write`, and `orders.write` checks.
6. Replace `RESTOCK_ROLES` in `inventory_service.py` with the canonical policy
   resolver/capability check, which also fails closed for review-required or
   disabled documents.

### Step 3: Re-run the boundary regression suite

```powershell
& $py -m pytest -n 0 -q backend\tests\test_catalog_routes.py backend\tests\test_material_pricing.py backend\tests\test_inventory_service.py backend\tests\test_auth_security.py
```

Expected: both normal roles are useful, but neither can gain supplier, pricing,
payment, user/role, audit, or unrelated operations authority through an old
broad endpoint. The later Catalog plan must add the CMS review/self-review and
scheduling tests; this plan establishes the prerequisite that Operations has no
publish authority at all.

## Task 3: Replace raw access/organization snapshots with allowlisted audit events

**Files:**

- Modify: `backend/audit.py`
- Modify: `backend/tests/test_audit.py`
- Modify: `backend/identity_routes.py`
- Modify: `backend/organization_routes.py`

### Step 1: Write default-deny audit tests

Add tests for dedicated access and organization event builders. Assert exact
stored keys, not merely the absence of a few keys:

```python
assert set(event) == {
    "id", "actor_user_id", "action", "target_type", "target_id",
    "previous", "result", "reason_code", "policy_version", "created_at",
}
assert "actor_email" not in event
assert "before" not in event and "after" not in event and "reason" not in event
```

Exercise rejected/unpersisted attempts containing `supplier_reference`,
`tax_id`, `legal_name`, `internal_notes`, password/hash/token/secret values,
payment/bank fields, prices/cost/margin/profit, membership profiles, and a free
text reason. Include an audit-insert test that confirms `session` is forwarded.
Keep a compatibility test for generic catalog/inventory audit redaction.

Run:

```powershell
& $py -m pytest -n 0 -q backend\tests\test_audit.py
```

Expected: tests fail because the generic writer records actor email, arbitrary
snapshots, and free-text reason.

### Step 2: Implement immutable projections and stronger global defence

In `backend/audit.py`:

1. Keep `append_audit_event()` for out-of-scope catalog/inventory callers, but
   extend `SENSITIVE_KEYS` recursively with `supplier_reference`, payment,
   bank/account, internal cost, margin/profit, credentials and free-text reason
   vocabulary.
2. Add a dedicated API such as
   `append_identity_audit_event(db, *, actor_user_id, action, target_type,
   target_id, previous, result, reason_code, policy_version, session)`.
   Validate target/action/reason-code enums and build the event from immutable
   field allowlists. It must not accept an actor object or raw documents.
3. Allow only canonical role(s), `access_state`, `status`, organization ID,
   membership ID/role/lifecycle state, and event metadata in the relevant
   `previous`/`result` projection. Unknown keys raise a domain validation error
   before any insert.

Update the two routers to call this dedicated writer only for their mutations.
Do not introduce update/delete audit endpoints; the existing read route stays
Owner-only through the policy map.

### Step 3: Verify the audit contract

```powershell
& $py -m pytest -n 0 -q backend\tests\test_audit.py
```

Expected: allowlisted events are the only identity/organization audit shape and
generic audit redaction blocks the newly enumerated sensitive fields.

## Task 4: Make access-policy changes transactional and concurrency-safe

**Files:**

- Modify: `backend/identity_routes.py`
- Modify: `backend/server.py`
- Modify: `backend/tests/test_identity_foundation.py`
- Create: `backend/tests/test_identity_transactions.py`
- Modify: `.github/workflows/transaction-tests.yml`

### Step 1: Add failing route and real-replica-set tests

Change access payload tests to use one canonical role or explicit review state,
plus a reason-code enum (for example `role_review_approved`,
`role_access_removed`, `emergency_override`, `policy_migration_v1`) instead of
free text. Add fake-guard tests that prove:

- disabled flag and unavailable transaction capability each return the existing
  stable 503 payload and execute neither user nor audit write;
- success changes the user and writes exactly one allowlisted event with the
  same session object;
- a forced audit insert failure leaves user state unchanged;
- a token issued before a demotion/review requirement cannot use a previously
  allowed permission on its next request;
- no request can make a user multi-role or use an unapproved/superseded role;
- concurrent attempts cannot remove/disable the last approved Owner.

Create `test_identity_transactions.py`, gated by the required
`MONGO_TRANSACTION_TEST_URL` (no `skip` when CI supplies it). Against the
isolated replica set, test one successful access update and one forced audit
failure/abort with a fresh database name. Assert the state and audit event
commit together or neither exists.

Run the local unit portion:

```powershell
& $py -m pytest -n 0 -q backend\tests\test_identity_foundation.py backend\tests\test_auth_security.py backend\tests\test_transaction_error_contract.py
```

Expected: tests fail while identity writes are still outside the guard.

### Step 2: Implement the atomic mutation service/path

1. Change `build_identity_router` to receive `get_transaction_guard`; compose
   it in `server.py` as `lambda: app.state.transaction_guard`.
2. Update `PUT /admin/users/{id}/access` to validate a single canonical role,
   `status`, `access_state`, and constrained `reason_code`. Use a fixed
   `operation_name="identity.access.update"` and
   `await guard.run(callback, retry_safe=False, operation_name=...)`.
3. Inside the callback, pass the supplied session to every `find_one`,
   `update_one`, policy-lock update, and `append_identity_audit_event` call.
   Treat a missing/audit failure as an exception so the transaction aborts.
4. Store a singleton identity-policy guard document (for example
   `identity_policy_state` with a stable key and `approved_owner_count`/version)
   and update/read it in the same transaction whenever an Owner is assigned,
   demoted, review-required, disabled, or deleted. This prevents two independent
   transactions from each believing another Owner remains. The bootstrap
   migration initializes it. Return a deterministic `409` when the operation
   would leave zero approved Owners.
5. Keep unknown-commit handling owned by `TransactionExecutor`; do not convert
   it to 503 or retry/replay the body. Log/reconcile from target ID and safe
   audit state as documented in the runbook.

### Step 3: Add the mandatory CI test path and re-run tests

Append `backend/tests/test_identity_transactions.py` to the existing mandatory
pytest command in `.github/workflows/transaction-tests.yml`; retain the
isolated replica set startup and do not add a fallback skip.

```powershell
& $py -m pytest -n 0 -q backend\tests\test_identity_foundation.py backend\tests\test_auth_security.py backend\tests\test_transaction_error_contract.py
docker compose -f docker-compose.transaction-test.yml up -d
$env:MONGO_TRANSACTION_TEST_URL = 'mongodb://127.0.0.1:27018/?replicaSet=rs-test&directConnection=true'
& $py -m pytest -n 0 -q backend\tests\test_transaction_integration.py backend\tests\test_inventory_transactions.py backend\tests\test_identity_transactions.py
docker compose -f docker-compose.transaction-test.yml down --volumes --remove-orphans
```

Expected: guard-disabled/unavailable cases mutate nothing; real replica-set
tests prove state/audit all-or-nothing.

## Task 5: Make organization and membership mutations use the same transaction boundary

**Files:**

- Modify: `backend/organization_routes.py`
- Modify: `backend/server.py`
- Modify: `backend/tests/test_identity_foundation.py`
- Modify: `backend/tests/test_identity_transactions.py`

### Step 1: Add failing organization transaction tests

Cover create/update organization plus member add, reactivation, role update, and
archive. For each, assert the audit event is safe, shares the transaction
session, and an injected audit error leaves the organization/membership exactly
as before. Repeat a capability-unavailable check expecting the existing 503 and
no mutation. Add the real replica-set case for at least one membership mutation.

Run:

```powershell
& $py -m pytest -n 0 -q backend\tests\test_identity_foundation.py backend\tests\test_identity_transactions.py
```

Expected: failures identify every write-then-audit path that has not yet passed
the common session.

### Step 2: Wrap every organization mutation

1. Inject `get_transaction_guard` from `server.py` into
   `build_organization_router`.
2. For organization create/update and membership add/reactivate/update/archive,
   perform authorization before the guard, then execute all reads needed for
   conditional writes, the write, the safe state projection, and dedicated audit
   insert inside `guard.run(..., retry_safe=False)` with fixed operation names.
3. Include `session=session` in every database call in these callbacks. Preserve
   current 404/409/422 behavior by raising domain/HTTP errors inside the
   transaction before its mutation point.
4. Keep `/organizations/mine` and other read-only paths outside the guard.

### Step 3: Verify both unit and integration cases

```powershell
& $py -m pytest -n 0 -q backend\tests\test_identity_foundation.py backend\tests\test_identity_transactions.py
```

Expected: no organization/membership state can persist without its matching
allowlisted audit event.

## Task 6: Add the safe, explicit policy migration and rollback path

**Files:**

- Create: `backend/migrations/003_identity_access_policy.py`
- Create: `backend/tests/test_identity_access_migration.py`
- Modify: `backend/tests/test_identity_foundation.py`
- Modify: `doc/IDENTITY_RBAC_AUDIT_RUNBOOK.md`
- Modify: `backend/server.py`

### Step 1: Write migration tests before the migration

Add in-memory tests and a replica-set test for this exact behaviour:

- default invocation is read-only and returns only policy version, aggregate
  category counts, opaque IDs where remediation needs them, and failures;
- `--apply` rejects a missing bootstrap Owner ID, a disabled mutation flag, or
  unavailable transaction capability before any write;
- `role: admin`, an old `roles: ["super_admin"]` bearing a legacy marker, and
  every superseded internal role are quarantined as
  `access_review_required` with no effective internal role; their historical
  values are retained only in a non-authoritative migration-evidence field;
- legacy `client` becomes approved `retail_customer` without a privilege grant;
- the explicitly reviewed bootstrap ID becomes the single approved Owner and
  initializes the singleton owner guard;
- re-running apply is idempotent, writes no duplicate audit event, and never
  promotes another account automatically;
- a scoped rollback returns only fields this migration added/changed, requires
  the same explicit Owner/capability safeguards, and never restores elevated
  runtime authority automatically.

Run:

```powershell
& $py -m pytest -n 0 -q backend\tests\test_identity_access_migration.py backend\tests\test_identity_foundation.py
```

Expected: tests fail because `001` currently auto-maps `admin` to
`super_admin` and has no Owner bootstrap or transaction boundary.

### Step 2: Implement migration `003`

Implement a standalone CLI with `--apply`, required
`--bootstrap-owner-id <opaque-user-id>` when applying, and an explicit scoped
`--rollback` mode. It must:

1. Query/classify accounts without exposing credentials or raw snapshots in
   output. Include all former internal identifiers and legacy markers, even
   when an old migration already added `roles`.
2. In dry-run, report category counts and remediation IDs only; do not create
   indexes, sessions, audit events, or writes.
3. In apply mode, create indexes outside a transaction, then use the same
   `TransactionMutationGuard`/executor semantics one affected account at a
   time. Each small transaction updates user policy fields/evidence and inserts
   an `identity.policy_migrated` or `identity.bootstrap_owner_assigned` safe
   event in its session. Never perform one giant transaction.
4. Require the bootstrap account to exist and be active, assign it canonical
   `super_admin` plus `access_state: approved`, and make all other legacy or
   superseded internal accounts review-required. Keep explicit already-canonical
   post-amendment data unchanged only when it has no legacy evidence and matches
   the current policy version.
5. Use conditional filters/policy version to make reruns idempotent. Rollback
   removes/reverts only migration-owned fields and records a safe rollback
   event; it leaves accounts review-required unless an Owner performs a new
   explicit assignment.

Update server seed/provisioning checks so no normal runtime path can recreate
`role: admin` or `role: client` after the migration.

### Step 3: Rewrite the operational runbook

Replace obsolete content in `doc/IDENTITY_RBAC_AUDIT_RUNBOOK.md`:

- show the approved matrix and Owner label, one internal role rule, customer
  separation, access-state meanings, and canonical creation behavior;
- document backup, safe dry-run, reviewed bootstrap Owner input, apply,
  idempotency verification, constrained rollback, and the final Owner
  invariant;
- require `/api/health/ready` transaction readiness and an approved maintenance
  window before enabling `TRANSACTION_MUTATIONS_ENABLED=true`; explain that the
  flag never bypasses a capability probe;
- replace the direct `mongosh` emergency role assignment with a controlled
  bootstrap/break-glass procedure that uses the guarded, audited path;
- document audit projection fields/exclusions, unknown-commit reconciliation,
  and the versioned policy-change lifecycle.

Re-run migration tests:

```powershell
& $py -m pytest -n 0 -q backend\tests\test_identity_access_migration.py backend\tests\test_identity_foundation.py
```

Expected: no legacy elevated identity can obtain Owner authority without the
reviewed bootstrap or a subsequent Owner action.

## Task 7: Make the Admin Studio access UI reflect the safe contract

**Files:**

- Modify: `frontend/src/pages/admin/Users.jsx`
- Modify: `frontend/src/pages/admin/AuditLog.jsx`
- Modify: `frontend/src/pages/admin/AdminLayout.jsx`
- Modify: `frontend/src/lib/permissions.js`
- Modify or create: focused frontend tests beside the changed modules

### Step 1: Add frontend contract tests

Test that the user list displays **Owner** rather than technical
`super_admin`, exposes the separate account/access-review state, permits only
one canonical internal role selection, and offers only backend-approved reason
codes. Test that the audit log renders safe metadata without assuming raw
`before`/`after`, actor email, or a free-text reason. Confirm navigation hides
routes without the explicit permission key.

Run:

```powershell
npm --prefix frontend test -- --watchAll=false
```

Expected: tests initially fail because the dialog uses role checkboxes and a
free-text textarea.

### Step 2: Implement UI changes

1. Replace multi-select role checkboxes with a single role selector and an
   explicit access-state action. Customer roles must not be accidentally
   assignable through the internal-admin UI.
2. Replace free text with the reason-code values supplied by `/admin/roles` (or
   a versioned policy endpoint), submit the new request contract, and show a
   clear 503 transaction-unavailable error without claiming a save occurred.
3. Display `access_review_required`, disabled, and approved states separately;
   use role labels from the server, not title-cased identifiers.
4. Render the allowlisted audit event fields only. Do not add client-side access
   to raw audit data or sensitive fallbacks.
5. Update navigation route mapping to match the explicit new permission keys;
   absence from navigation is convenience only, never the enforcement layer.

### Step 3: Verify UI behavior

```powershell
npm --prefix frontend test -- --watchAll=false
npm --prefix frontend run build
```

Expected: build and tests pass, and a manual Owner session can review/assign
one role while normal roles cannot discover identity/audit/settings screens.

## Task 8: Run the complete verification and controlled rollout checklist

**Files:**

- Modify if necessary: `.github/workflows/transaction-tests.yml`
- Modify if necessary: `doc/IDENTITY_RBAC_AUDIT_RUNBOOK.md`

### Step 1: Run all automated verification

```powershell
& $py -m pytest -n 0 -q backend\tests
npm --prefix frontend test -- --watchAll=false
npm --prefix frontend run build
docker compose -f docker-compose.transaction-test.yml up -d
$env:MONGO_TRANSACTION_TEST_URL = 'mongodb://127.0.0.1:27018/?replicaSet=rs-test&directConnection=true'
& $py -m pytest -n 0 -q backend\tests\test_transaction_integration.py backend\tests\test_inventory_transactions.py backend\tests\test_identity_transactions.py
docker compose -f docker-compose.transaction-test.yml down --volumes --remove-orphans
```

Expected: all suites pass. The identity transaction test must be mandatory in
CI and may not be converted into a silent local-only skip.

**Status (22 Juli 2026):** [x] Verifikasi otomatis selesai.

- Backend penuh: 270 passed, 5 skipped, 14 subtests passed.
- Test frontend: 7 suite dan 34 test passed; build produksi berhasil.
- Test transaksi pada MongoDB replica set lokal: 5 passed.
- Perintah frontend memakai `--watchAll=false` karena versi Jest proyek ini tidak mengenali opsi `--run`.

### Step 2: Perform documented manual authorization smoke tests

In an approved non-production environment, verify:

1. Owner can perform every permissioned action, including access review,
   organization management, current catalog publish/archive, payment action and
   audit read.
2. Operations can work on drafts/material/inventory/fulfilment but is denied
   role/audit/settings, price fields, supplier reference, publish/archive and
   payment actions.
3. Commercial & Finance can manage customers/organizations, pricing and current
   catalog publication, but is denied inventory and production/fulfilment
   mutations.
4. An old token loses its privileged endpoint access immediately after its
   account is demoted, disabled, or review-required.
5. With transaction mutations disabled or capability unavailable, a role or
   membership mutation returns the stable 503 and neither data nor audit event
   changes.

### Step 3: Execute rollout only with approval

Follow the new runbook: backup, dry-run, review opaque account list, select the
bootstrap Owner, enable transaction mutations only after readiness is confirmed,
apply `003`, verify counts/indexes/safe audit events, and retain the rollback
record. Do not assign Operations/Commercial & Finance until the minimum boundary
tests in Task 2 are green.

---

## Handoff boundary to the next plan

After this plan is implemented, verified, deployed, and its checklist is
completed, the next plan may begin: **Amend Catalog: CMS review state and
Supplier Foundation**. It must add `draft -> submitted -> reviewed ->
published/scheduled -> archived` transitions, reviewer independence (Operations
cannot review/publish its own draft), schedule/history audit projections,
Supplier master/purchasing models, and their own permission/data-safety tests.
It must reuse this plan's role resolver, transaction guard, and audit
redaction/allowlist primitives rather than reintroducing local role checks or
raw snapshots.
