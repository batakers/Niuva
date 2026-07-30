# Niuva Backend Transaction and Audit Boundary Adoption Plan

Status: **Context Only — Implementation Completed on Feature Branch; Review/Merge Pending**
Prepared: 26 July 2026
Scope: BA-009 — central transaction boundary adoption, mutation/audit
atomicity, and catalog revision conflict behavior

Implementation reconciliation: 30 July 2026. All catalog, content, and
inventory runtime mutation owners now use the shared guard; catalog CRUD and
audit writes are atomic; multi-material inventory no longer opens its own
session; duplicated local capability checks were removed; and catalog
publication/rollback revision selection and compare-and-set conflict handling
run inside the transaction. Real replica-set regression covers fail-closed
rejection, injected audit failure rollback, publication contention, and
multi-material bulk observability. Migration 007 remains separately gated and
out of this runtime-adoption slice. This status grants no production rollout
authority.

## 1. Authority and Gate

This bounded plan is governed by:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
   (`DEC-DATA-01`);
5. `doc/TRANSACTION_CAPABILITY_RUNBOOK.md`;
6. current source and tests.

This plan authorizes no source edit, commit, push, rollout, or production
activation. A separate explicit implementation approval is required, and each
slice below must be approved on its own.

## 2. Corrected Current State

The audit tracker records as a positive control that "identity/organization
mutation menggunakan shared guard". That statement is **no longer true** and
must not be carried forward.

Verified on 26 July 2026 against `e73c99a`:

- `TransactionMutationGuard` is constructed in `backend/server.py` and passed to
  the identity router, but `backend/identity_routes.py` is now 19 lines and
  exposes only `GET /admin/users`. It never calls the guard, so
  `get_transaction_guard` is a dead parameter.
- The organization router was removed under `DEC-OPS-002`.
- The only runtime caller of the guard is
  `backend/migrations/003_identity_access_policy.py`.

Application-code adoption of the central boundary is therefore effectively
zero. Every transactional mutation in catalog, inventory, and content opens its
own session directly, and several mutations write their audit event outside any
session.

This does not weaken `DEC-DATA-01`. The direct blocks are still real MongoDB
transactions and still fail closed through their own local
`_require_transactions()` check. What is missing is uniformity: the central
executor's unknown-commit reconciliation projection, its observability events,
its retry policy, and one shared `transaction_unavailable` contract.

## 3. Bounded Outcome

A later approved implementation must:

- route every transactional mutation through `TransactionMutationGuard.run`;
- keep the fail-closed contract identical in wire format for existing clients;
- make each mutation and its audit event commit or abort together;
- project ambiguous commit outcomes uniformly as requiring reconciliation;
- emit the same transaction observability events for every domain;
- preserve current success behavior and current response shapes.

## 4. Explicit Exclusions

This plan does not include:

- monetary representation, order number concurrency, legacy order transition
  graph, or idempotency keys (BA-007);
- durable notification outbox (BA-012);
- file ownership, validation, or retention (BA-008);
- legacy manual-transfer disablement (BA-006, `DEC-PAY-02`);
- granular role model migration (BA-002);
- any product, provider, production-readiness, or go-live decision.

## 5. Verified Source Boundary

### 5.1 Direct transaction blocks that bypass the central executor

| Module | Line | Function |
|---|---|---|
| `backend/catalog_service.py` | `:304` | `replace_variants` |
| `backend/catalog_service.py` | `:419` | `replace_options` |
| `backend/catalog_service.py` | `:513` | `publish_product` |
| `backend/catalog_service.py` | `:571` | `rollback_product` |
| `backend/inventory_service.py` | `:186` | `_apply_operation` |
| `backend/inventory_service.py` | `:689` | `resolve_alert` |
| `backend/content_service.py` | `:142` | publish path |
| `backend/content_service.py` | `:185` | rollback path |

These already include their audit write inside the session, so they are atomic
today. The gap is boundary uniformity, not atomicity.

### 5.2 Mutations whose audit write is outside any session

| Module | Line | Function |
|---|---|---|
| `backend/material_routes.py` | `:174`, `:203`, `:224`, `:272` | create, update, archive, price version |
| `backend/content_service.py` | `:96` | `create_block` |
| `backend/content_service.py` | `:110` | `update_block` |
| `backend/content_service.py` | `:210` | `archive_block` |

These are the real atomicity defects: the mutation can commit while the audit
event fails, leaving an unaudited change.

Inventory was checked and is **not** in this category. Its audit writes at
`inventory_service.py:389`, `:539`, and `:567` sit inside
`_apply_operation_in_transaction` and `_evaluate_restock`, both of which receive
the caller's session. The tracker's wording should not be read as implying an
inventory atomicity defect.

### 5.3 Catalog revision conflict

`CatalogService._next_revision` reads the highest existing revision before the
transaction starts, so two concurrent publications can select the same revision
number and surface a raw driver conflict instead of a domain conflict.

### 5.4 Duplicated fail-closed checks

`_require_transactions()` exists separately in `catalog_service.py`,
`inventory_service.py`, and `content_service.py`. Each raises a domain error
with its own message rather than the shared `transaction_unavailable` contract.

## 6. Proposed Slices

Each slice is separately approvable and separately revertible.

### Slice A — Central boundary adoption, no behavior change intended

Move the eight direct blocks in section 5.1 to
`TransactionMutationGuard.run(callback, operation_name=..., retry_safe=...)`.

- Inject the guard into `CatalogService`, `InventoryService`, and
  `ContentService` at their construction sites in `backend/server.py`.
- Replace each local `_require_transactions()` with the executor's own
  capability rejection, keeping the existing HTTP status and error code
  observable to clients unchanged.
- Choose `retry_safe` per operation and justify each choice in the diff; default
  to `False` where a retry could duplicate a business effect.
- Do not change any query, projection, or response body.

Risk: low. Behavior should be identical except for added observability events
and the uniform unknown-commit projection.

### Slice B — Mutation and audit atomicity

Bring the audit writes in section 5.2 inside the same transaction as their
mutation, through the same guard.

- `material_routes.py` currently performs no transaction at all for create,
  update, archive, and price-version; each needs a guard-wrapped callback.
- `content_service.py` `create_block`, `update_block`, and `archive_block` need
  the same treatment.
- `inventory_service.py` needs no change in this slice.

Risk: medium. This is a deliberate behavior change — an audit failure will now
roll the mutation back instead of leaving it committed and unaudited. That is
the intended `DEC-DATA-01` semantics, but it must be stated in the commit and
covered by tests.

### Slice C — Catalog revision conflict — approval gated separately

Move revision selection inside the transaction and project a concurrent
publication as a domain conflict rather than a raw driver error.

This slice likely requires a unique index on
`catalog_publications (product_id, revision)`. Per the repository gate, an index
or migration requires separate explicit approval, together with backup, dry
run, validation, and rollback instructions. **Do not begin Slice C with Slice A
or B approval alone.**

### Slice D — Dead guard parameter

Remove `get_transaction_guard` from `build_identity_router` if no identity
mutation is reinstated, or leave it and document why. This is cleanup, not a
correctness fix, and should not be bundled into Slice A or B.

## 7. Target File Map

Slice A:

- modify `backend/server.py` (service construction only);
- modify `backend/catalog_service.py`;
- modify `backend/inventory_service.py`;
- modify `backend/content_service.py`;
- modify the affected tests.

Slice B adds:

- modify `backend/material_routes.py`.

Stop and request approval if implementation requires:

- a database migration or index;
- a frontend change;
- a dependency change;
- a change to the public error contract;
- any module not listed above.

## 8. Test-First Matrix

### Boundary adoption

- every listed mutation rejects with the shared `transaction_unavailable`
  contract when capability is unavailable;
- the existing HTTP status and error code observed by clients do not change;
- transaction observability events are emitted for start, commit, abort, and
  unknown-commit on every migrated operation;
- an unknown commit outcome surfaces the reconciliation-required projection
  rather than a generic 500.

### Atomicity

- a failing audit write aborts its mutation and leaves no partial document, for
  each site in section 5.2;
- a successful mutation always has exactly one corresponding audit event;
- no mutation writes its audit event outside a session after the change.

### Regression

- existing catalog, inventory, material, and content suites pass unchanged;
- real replica-set suites pass against the local test topology;
- customer-facing projections still exclude cost, margin, supplier, and internal
  notes.

## 9. Verification Gates

Run from `backend/` with the local replica-set test topology active:

```bash
./.venv/bin/python -m pytest -q -rs
```

CI-style, from the repository root:

```bash
MONGO_TRANSACTION_TEST_URL='mongodb://127.0.0.1:27018/?replicaSet=rs-test&directConnection=true' backend/.venv/bin/python -m pytest -n 0 -q backend/tests/test_transaction_integration.py backend/tests/test_inventory_transactions.py
```

Also run `pip check`, and confirm the changed files add no new flake8 findings.

The external integration suite remains a separate environment gate. Its skips
must not be represented as integration evidence.

## 10. Commit Boundary

Per approved slice:

1. add failing tests for that slice only;
2. implement the minimum change;
3. run all verification gates;
4. review the diff against the approved file map;
5. request separate commit and push approval.

Do not combine Slice A, B, C, or D in one commit.

## 11. Rollback

Rollback is a source revert of the slice commit. No data migration is created
by Slice A or B, so no data rollback is required. Slice C's index, if ever
approved, requires its own documented rollback.

Reverting Slice B explicitly reopens the unaudited-mutation finding.

## 12. Stop Conditions

Stop without implementation or publication if:

- preserving the current public error contract conflicts with the shared
  `transaction_unavailable` contract;
- an operation cannot be classified as retry-safe or not retry-safe from
  current authority;
- atomicity requires an index, migration, or schema change;
- tests reveal a mutation that cannot be made atomic without touching BA-006,
  BA-007, or BA-008 scope;
- the approved file map proves insufficient.

## 13. Tracker Impact

On approval and completion, update
`docs/context/BACKEND_AUDIT_TRACKER_2026-07-24.md`:

- correct the stale BA-009 positive control described in section 2 of this
  plan;
- record which Phase 2 checkboxes the completed slices satisfy;
- append a dated update-log entry with commands and result counts.

## 14. 30 July 2026 Completion Reconciliation

The owner approved the remaining runtime-adoption work and delivery. The
implementation:

- routes the catalog CRUD/audit pairs and inventory bulk operation through
  `TransactionMutationGuard`;
- removes catalog, content, and inventory `_require_transactions()` prechecks,
  making shared rejection and observability the single fail-closed path;
- keeps catalog revision allocation inside the transaction and uses
  compare-and-set updates so concurrent publish/rollback attempts return a
  domain `409` instead of leaking a driver conflict;
- adds `test_commercial_transaction_integration.py` to the mandatory
  replica-set workflow;
- leaves migration 007 and all production topology, migration execution,
  rollout, provider, and go-live work outside this branch.

Local evidence on 30 July 2026:

- affected fake/unit suites: 40 passed, 2 explicit real-topology skips;
- mandatory real replica-set suite: 70 passed, 0 skipped;
- direct runtime `start_session`/`start_transaction` ownership is confined to
  `transaction_execution.py` and the read-only capability probe.
