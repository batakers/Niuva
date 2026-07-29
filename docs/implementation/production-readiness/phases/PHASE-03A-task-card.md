# Task Card — PHASE-03A / TASK-03A-01 and TASK-03A-02

## Identity and ownership

**Title:** bounded HTTP and command contract planning

**Project Owner / API Owner / Driver:** Faiz

**Reviewer and verifier:** Faiz performs an owner review with AI-assisted
source and documentation checks. This is not an independent human review.

**Phase / tasks:** `PHASE-03A` / `TASK-03A-01`, `TASK-03A-02`

**Findings:** `FE-001`, `FE-005`, `FE-006`, `BE-001`, `BE-010`, and
`INT-011`.

## Objective and decision record

Publish a planning-only HTTP and command-contract packet that gives one
bounded vocabulary for errors, list pagination, timeout/retry/cancellation,
and idempotent command outcomes across the existing Public, Customer, and
Admin surfaces.

The Project Owner approved PHASE-03A Option C on 29 July 2026
(Asia/Jakarta): Faiz is the API Owner; the contract scope is cross-surface but
bounded; route inventory and representative Auth, Customer Order, Admin B2B
command, and list-pagination fixtures are included. The approval explicitly
excludes a mass rewrite, migration, provider selection/activation, deployment,
and business-policy changes.

The API Owner additionally approved the bounded transport policy on 29 July
2026: JSON API requests time out after 15 seconds; one automatic retry is
permitted only for `GET`/`HEAD` transient network failure; `401`, `403`,
`409`, `422`, `429`, command, and file-download requests are never retried
automatically; `429` follows `Retry-After`; manual B2B command retry reuses
the same `operation_id`; and superseded requests are cancelled without a
user-visible error.

## Baseline and freshness

**Task baseline:** `65a0e4dbf83fd7a5a336e5ed38c87d803735e064`
(`origin/main`, fetched 29 July 2026).

**Audit baseline:** `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.
The included findings are historical until the selected source is checked. The
planning inventory below rechecks their relevant current-source anchors; it is
not production, browser, load, or release evidence.

## In scope

- A documentation-only contract and route-family inventory.
- Existing JSON-error envelope, current status outcomes, and compatibility
  treatment for the legacy `detail` field.
- Representative route fixtures for Auth, ownership-scoped legacy Order reads,
  a versioned/idempotent Admin B2B command, and public catalog pagination.
- The future client transport boundary shared by Axios and controlled `fetch`
  helpers, without changing either implementation.
- Current-source and current-test inventory sufficient to plan later bounded
  implementation and verification slices.

## Out of scope

- Any backend, frontend, dependency, configuration, test, OpenAPI, or route
  implementation change.
- Extending cursor pagination beyond public catalog reads. `ADR-005` requires
  clarification before that scope is interpreted or extended.
- New or re-enabled legacy Order, upload, checkout, payment-proof, payment,
  refund, fulfillment, customer-session, Organization Portal, CMS, or
  provider behavior.
- Migration, data backfill, deletion, deployment, production-readiness, and
  go-live work.
- Creating a generic idempotency mechanism beyond existing B2B `operation_id`
  commands.

## Authority and dependencies

Read in order:

1. `docs/NIUVA_MASTER_SPEC.md`, especially sections 9, 11–13, and 17–18.
2. `docs/context/DOCUMENT_REGISTER.md` and
   `docs/decisions/DECISION_REGISTER.md`.
3. `docs/decisions/architecture/ADR-005-backend-remediation-runtime-policy.md`.
4. `docs/decisions/access/DEC-AUTH-005-admin-session-transport-and-remember-me.md`
   and `DEC-AUTH-006-abuse-protection-interface-and-deferral.md`.
5. `docs/decisions/access/DEC-ACCESS-003-legacy-order-compatibility-and-customer-projection.md`
   and `docs/decisions/product/DEC-DATA-002-quote-line-identity-and-ambiguous-history.md`.
6. Current source/tests, then the production-readiness traceability and
   verification material as context only.

Dependencies recorded for PHASE-03A are PHASE-01C, PHASE-02A, and an API-owner
decision. The scope/owner decision is now recorded by this card. This does not
make PHASE-03B, PHASE-03C, PHASE-04B, or PHASE-04C implementation-ready; each
retains its own decisions and environment gates.

## Expected files and acceptance criteria

**Files changed by this planning task only:**

- `docs/implementation/production-readiness/phases/PHASE-03A-task-card.md`
- `docs/implementation/production-readiness/phases/PHASE-03A-http-command-contract-plan.md`
- phase-status rows that link this planning packet.

**Read-only source/test areas:** `backend/server.py`, `backend/b2b_routes.py`,
`backend/b2b_service.py`, `backend/catalog_routes.py`,
`frontend/src/lib/api.js`, representative consumers, and their focused tests.

The plan is acceptable for owner/reviewer review when it:

- maps normal, malformed, offline/timeout, replay, conflict, deny, and `503`
  outcomes to representative fixtures without claiming they are all currently
  implemented;
- preserves the approved Admin cookie/CSRF boundary, Customer-safe legacy
  Order boundary, B2B command invariants, and public-catalog-only cursor
  authority;
- names implementation exclusions, unresolved policy inputs, later file
  ownership, stop conditions, and proportional checks; and
- makes no readiness, deployment, provider, migration, or finding-resolution
  claim.

## Minimum verification and handoff

- Inspect exact `origin/main` ancestry and clean task-worktree status.
- Check Markdown links, changed paths, and `git diff --check`.
- Cross-check each representative source anchor and the listed authority.

**Commit / push / PR authorization:** not granted by this task card. Local
documentation changes and a handoff report are allowed; commit, push, and PR
require a later explicit instruction.

**Primary risks/open inputs:** Admin-list pagination compatibility; generic
command idempotency outside existing `operation_id` routes; exact source/test
file ownership; verification environment; and any required implementation
authorization after this plan review.
