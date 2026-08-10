# Feature 3.4A — Retail Order Contract Hardening Task Card

Status: **bounded source candidate — local verification passed; PR #226 open**

Branch: `feat/backend-retail-order-contract-hardening`

Baseline: `954837c9dd4fcaeb9438c16fb6934210e082a364`
(`origin/main`, fetched 10 August 2026)

## Objective

Harden the provider-neutral Retail checkout and Order contracts while every
Retail transaction route remains inactive.

## In scope

- Strict authenticated cart-intent validation with bounded line quantities.
- Stable semantic request fingerprints and exact idempotent replay/conflict
  classification.
- Detached, customer-safe snapshots from authoritative catalog facts.
- Provider-neutral currency and fulfilment-policy validation.
- A deterministic basic Retail Order state-machine command contract.
- Append-only, version-bound lifecycle audit/history events.
- Duplicate request and concurrent stale-version regression coverage.
- Capability-lockdown regression evidence and tracker reconciliation.

## Explicit exclusions

- Activating cart, checkout, Retail Order creation, transitions, reservation,
  payment, production, shipment, pickup, or customer routes.
- Selecting a payment, logistics, tax, storage, or notification provider.
- Provider webhook, payment intent, refund, reconciliation, credentials, or
  Finance activation.
- Schema migration, historical rewrite, shared/staging/production data,
  deployment, readiness, or go-live.

## Authority and dependency boundary

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`
- `docs/decisions/product/DEC-RT-02-retail-account-required-checkout.md`
- `docs/decisions/product/DEC-FUL-01-shipping-and-pickup-policy.md`
- `docs/decisions/product/DEC-INV-01-retail-checkout-reservation-duration.md`
- approved Retail lifecycle in the canonical PRD/PRS
- current source and tests

The selected policy records provide contract direction but do not activate a
provider or runtime capability. This task uses only their provider-neutral,
activation-gated invariants.

## Expected files

- `backend/retail_checkout_domain.py`
- `backend/contract_time.py`
- `backend/retail_order_contract.py`
- focused Retail contract and route-lockdown tests
- `.github/workflows/quality-gates.yml`
- bounded production-readiness tracker/evidence files
- this task card

## Acceptance criteria

- Client price, total, stock, provider, payment, tax, and server eligibility
  facts cannot enter the cart-intent contract.
- Equivalent carts produce the same fingerprint independent of item ordering;
  changed intent under one operation ID is a named conflict.
- Catalog snapshots reject missing, unpublished, inactive, quote-required,
  unsupported-fulfilment, invalid quantity, invalid currency, and mixed
  currency input without leaking internal catalog fields.
- Order transitions require expected version, actor, reason, time, and
  operation ID; exact replay is read-only and changed reuse conflicts.
- History remains append-only and version-contiguous, and stale concurrent
  commands cannot both win.
- Public capabilities and Retail mutation routes remain explicitly inactive.
- Focused tests, full backend tests, formatting, lint, and type checks pass, or
  any environment limitation is recorded precisely.

## Delivery authorization

The Project Owner explicitly authorized implementation, tracker update,
verification, commit, push, and pull-request creation on 10 August 2026.
Merge, migration, provider activation, deployment, production-readiness, and
go-live are not authorized by this task.

## Local verification evidence

- Focused Retail checkout/lifecycle/aggregate/route matrix: `68 passed`.
- Full backend regression: `1031 passed, 15 skipped, 14 subtests passed`;
  expected-skip enforcement reported zero unexpected skips.
- Focused MyPy, repository critical Flake8 policy, changed-file Black/isort,
  and `git diff --check`: passed.
- No service, database, provider, migration, shared environment, or deployment
  target was contacted.
