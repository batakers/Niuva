# Task Card — B2B Inquiry MVP Backend and Data Contract

<!-- markdownlint-disable MD013 -->

**Status:** Candidate delivery task — source authorization required<br>
**Date:** 2026-08-08 (Asia/Jakarta)<br>
**Observed baseline:** `origin/main` at `2cd4ab29f3f618005ea7063b6f54df9563ba6eb3`<br>
**Proposed branch:** `feat/b2b-inquiry-mvp-backend-20260808`<br>
**Proposed worktree:** `C:\tmp\niuva-b2b-inquiry-mvp-backend-20260808`<br>
**Driver:** Backend/Data Developer<br>
**Reviewer:** Project Lead / Integrator<br>
**Verifier:** Verification Developer<br>
**Commit/push/PR:** No — separate authorization required

## Objective

Implement the approved B2B Inquiry backend contract without changing the
product scope: required structured intake, consent evidence, safe projection,
deterministic retry behavior, existing operator permissions, and safe
provider-neutral notification context.

## Authority and dependency

The governing brief is the
[B2B Inquiry MVP Implementation Contract](2026-08-08-b2b-inquiry-mvp-implementation-contract.md).
Read the canonical Master Spec, registers, `DEC-UX-003`, PRD v2.1, `DEC-ACCESS-002`,
and `DEC-DATA-003` before source work. Do not start until the exact request,
response, and idempotency fixture is reviewed and implementation is separately
authorized.

## Allowed source and test paths

Only these paths may change in this task:

- `backend/b2b_routes.py`
- `backend/b2b_service.py`
- `backend/b2b_domain.py`
- `backend/server.py` (only the existing public settings/Inquiry notification
  boundary)
- `backend/api_contract.py` (only if the existing error/OpenAPI fixture requires
  a bounded declaration)

Backend tests are owned by the Verification task card to keep producer source
and verification edits disjoint.

## Required behavior

- Keep `POST /api/inquiries` and the existing Admin Inquiry routes.
- Require and normalize `pic_phone`; enforce the approved `need` and `timeline`
  contract without inventing new business categories.
- Require a positive privacy acknowledgement and stamp server-owned
  `privacy_policy_version` plus UTC `accepted_at` on new Inquiries.
- Preserve `status = new`, history, version, and customer-safe response behavior.
- Keep consent evidence and operator-only fields out of
  `project_customer_inquiry()`.
- Implement the frozen bounded idempotency behavior for create retries. If it
  needs a new unique index or migration, stop and return a data decision packet
  instead of applying it.
- Keep the existing `sales_estimator` permission mapping and status transition
  guards; do not create a role or portal.
- Order the `new` queue oldest-first and expose the data needed for an age /
  one-working-day indicator without adding a scheduler.
- Keep operational email provider-neutral, include only safe Inquiry reference
  and contact context, and fail open for persistence if notification enqueue
  fails as the current route does.
- Validate the stored public WhatsApp setting at its existing write boundary;
  invalid/empty values must be representable as a disabled CTA, not an unsafe
  redirect.

## Explicit exclusions

- No migration, backfill, collection validator, live database target, or
  destructive cleanup.
- No provider selection/activation, WhatsApp automation, webhook, campaign, or
  new worker.
- No customer B2B portal, public file upload, storage integration, payment,
  Retail route, or notification-policy rewrite.
- No generic idempotency framework or unrelated service refactor.

## Acceptance criteria

1. Positive API tests prove the target request and `201` safe response.
2. Empty/invalid phone, timeline, need, and unchecked consent fail at the
   boundary with the shared `422` envelope.
3. New Inquiry documents contain the approved consent evidence and no raw
   request payload or IP field.
4. Customer projection tests prove consent, history, operator, cost, margin,
   supplier, and internal fields are withheld.
5. Duplicate/retry behavior matches the reviewed idempotency fixture and cannot
   create a second Inquiry silently.
6. Existing `429`, notification-failure, permission, conflict, and transition
   behavior remains covered.
7. Queue ordering and `HRD_EMAIL` activation checks are explicit and tested.
8. `git diff --check`, focused backend tests, OpenAPI/contract tests, and
   compile/lint checks pass.

## Handover and stop conditions

Handover must list changed and unchanged paths, tests run/not run, contract
fixture version, data/migration impact, rollback approach, and any unresolved
idempotency or privacy-owner decision. Stop before source changes if a new
schema/index/migration, role, provider, or customer projection is required.

<!-- markdownlint-enable MD013 -->
