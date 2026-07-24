# DEC-PAY-02 — Legacy Manual Transfer Is Read-Only

Status: **Approved Decision**
Decision ID: `DEC-PAY-02`
Decision date: 24 July 2026
Approval source: Explicit user approval in the backend-audit conversation on
24 July 2026
Scope: Legacy manual-transfer compatibility
Related authority:
`docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`

## Context

ADR-003 approves provider-neutral online-payment orchestration as the Retail
production direction and does not enable a transitional manual-transfer
adapter. The current legacy backend can still:

- issue bank-transfer instructions with a new estimate;
- accept a new payment-proof upload;
- verify that proof and advance the order.

The backend audit identified that behavior as new manual-transfer activity, not
read-only compatibility for historical records.

## Decision

Existing manual-transfer records and their historical payment-proof metadata
remain readable only through authenticated, authorized, ownership-scoped
compatibility projections.

The product must not create new manual-transfer activity. In particular, normal
application behavior must not:

- instruct a customer to initiate a new manual bank transfer;
- create a new manual-transfer payment attempt;
- accept a new payment-proof upload;
- newly verify or advance an order from a payment proof;
- expose a transitional manual-transfer option as a Retail fallback.

Historical records must not be deleted, rewritten, or silently converted.
Migration, reconciliation, and support tooling may inspect them only within an
approved operational procedure and must preserve their recorded commercial
history.

This boundary applies to application behavior in every environment.
Test fixtures, migration dry runs, and isolated compatibility tests may create
synthetic records only when they cannot be mistaken for an enabled product
capability.

## Consequences

- The transitional manual-transfer adapter is resolved as **not enabled** for
  the current baseline; it is no longer an open fallback choice.
- Legacy reads require customer ownership or an explicitly approved internal
  permission and safe projection.
- Current mutation routes that create or advance manual-transfer behavior are
  implementation gaps and must be disabled or replaced through a separately
  approved protected-scope plan.
- Existing payment-proof objects remain subject to ADR-002 ownership,
  authorization, retention, backup, and recovery requirements.
- Provider-neutral online payment remains the target. This decision does not
  select or activate a provider.

## Open Implementation Decisions

- Exact compatibility response fields for historical manual-transfer records.
- Customer and staff messaging when a legacy mutation route is unavailable.
- Migration and feature-flag sequence for disabling current mutation routes.
- Treatment of unresolved historical cases through an approved support or
  reconciliation procedure.
- Retention and deletion policy for historical payment-proof objects.

## Excluded from Approval

This decision does not itself authorize:

- source-code or frontend changes;
- destructive cleanup of legacy records;
- a payment gateway selection or integration;
- Finance operations activation;
- production upload;
- production readiness or go-live.
