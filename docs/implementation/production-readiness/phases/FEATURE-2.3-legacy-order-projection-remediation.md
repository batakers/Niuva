# Feature 2.3 — Legacy Order Compatibility Remediation

Date: 29 July 2026
Branch: `fix/backend-legacy-order-projection`
Baseline: `1ada96a591f607e2dba38013cebb1a20e593b782` (`origin/main`)
Authority: `DEC-ACCESS-002`, `DEC-ACCESS-003`, `DEC-PAY-02`, and `ADR-005`

## Bounded outcome

The retained legacy `orders` surface remains historical and read-only. Customer
detail and design-file lookups now bind both order ID and authenticated owner ID
in the database query. Customer and internal responses use separate explicit
allowlists; no HTTP route uses raw legacy classification as its response
projection.

No legacy Order creation, estimate, payment-proof upload, payment verification,
single status mutation, or bulk status mutation was enabled.

## Projection contract

### Customer

The customer projection may return:

- historical order identity, material name, status, and timestamps;
- safe file metadata: original filename, content type, and size;
- historical estimate amount, currency, and estimate timestamp;
- historical payment verification/upload timestamps and safe proof-file
  metadata;
- status and timestamp entries without free-text notes;
- explicit `legacy_order`, creation-disabled, and mutations-disabled markers.

The customer projection rejects structured values inside scalar allowlisted
fields and excludes customer identity duplication, internal notes, raw storage
paths, bank/provider data, cost, margin, supplier, profit, audit data, and
unknown fields.

### Internal

An actor still requires `orders.read` at the route boundary. The internal
projection contains only allowlisted order-operation fields and a safe
status-history projection. Operational notes require `orders.write`, while
`payments.read` separately controls the safe estimate and payment projection.
Even a payment reader or `super_admin` does not receive raw provider/bank data,
storage paths, cost, margin, supplier, profit, audit payloads, or unknown legacy
fields.

The CSV export consumes the same safe nested estimate/payment projection rather
than reading raw nested documents after authorization.

## Verification

Focused compatibility and authorization suite:

```text
47 passed
```

The focused cases cover:

- customer field and nested-value allowlists;
- customer payment/proof metadata redaction;
- owner-scoped detail and design-file queries;
- internal `orders.read` and `payments.read` separation;
- raw field exclusion for operational and Finance readers;
- disabled creation, manual-transfer, payment-proof, verification, status, and
  bulk-status commands;
- controlled file ownership and adjacent identity/RBAC behavior.

The full backend and repository quality-gate results are recorded at handoff.

Full backend regression:

```text
620 passed, 12 skipped, 14 subtests passed
```

Dependency audit, compile, critical Flake8, MyPy (including the legacy
projection module), Black, isort, and diff checks also passed.

The first PR workflow crossed a real-time fixed-window boundary while running
the pre-existing login-limiter test, splitting five failures across two
buckets. The test now freezes only its limiter clock; production limiter code
is unchanged. The targeted test passed five consecutive runs and the full
backend suite passed again.

## Remaining historical reconciliation

This source remediation does not resolve the operational handling of ambiguous
historical cases. The following remain separately gated:

- named reconciliation and retention owners;
- approved treatment and customer communication for unresolved historical
  payment/proof records;
- retention/deletion duration and historical proof-object custody;
- production-data inventory and reconciliation evidence;
- deployment, production readiness, or go-live.

No migration, historical rewrite, deletion, provider activation, `.env` change,
production data access, deployment, or go-live action was performed.
