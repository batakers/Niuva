# Task Card — B2B Inquiry MVP Contract and Integration Verification

<!-- markdownlint-disable MD013 -->

**Status:** Candidate verification task — source authorization required<br>
**Date:** 2026-08-08 (Asia/Jakarta)<br>
**Observed baseline:** `origin/main` at `2cd4ab29f3f618005ea7063b6f54df9563ba6eb3`<br>
**Proposed branch:** `qa/b2b-inquiry-mvp-verification-20260808`<br>
**Proposed worktree:** `C:\tmp\niuva-b2b-inquiry-mvp-verification-20260808`<br>
**Driver:** Verification / Integration Developer<br>
**Reviewer:** Project Lead / Integrator<br>
**Evidence contributors:** Backend and Frontend Developers<br>
**Commit/push/PR:** No — separate authorization required

## Objective

Prove the B2B Inquiry MVP contract across API, data projection, public UX, and
Admin experience without changing production source. The verifier also records
fresh read-only Layer 04 data-impact evidence; it does not rewrite the Layer 04
tracker or claim live-database readiness.

## Authority and dependency

Use the [Implementation Contract](2026-08-08-b2b-inquiry-mvp-implementation-contract.md)
and the canonical Master Spec, registers, `DEC-UX-003`, PRD v2.1,
`DEC-ACCESS-002`, and `DEC-DATA-003`. Verify the exact producer/consumer fixture
after the backend and frontend owners report their handover. A test pass cannot
grant implementation, migration, deployment, readiness, or go-live authority.

## Owned verification paths

To keep source edits disjoint, this task owns newly added verification files:

- `backend/tests/test_b2b_inquiry_mvp_contract.py`
- `frontend/src/pages/marketing/ContactPage.b2b-mvp.contract.test.jsx`
- `frontend/src/pages/admin/B2BDetail.b2b-mvp.contract.test.jsx`
- `frontend/src/lib/publicSettings.b2b-mvp.contract.test.js`

The verifier may add a task-local evidence note under
`docs/implementation/specs/candidates/` if required by the handover. It must
not edit canonical decisions, the production-readiness trackers, or source
files owned by the other two cards.

## Verification matrix

| Boundary | Required evidence |
| --- | --- |
| API | `201` success, `422` field/consent failures, `429` throttle, `500` safe failure, deterministic duplicate/retry behavior, and OpenAPI response declarations. |
| Data | New consent evidence, no raw payload/IP, customer allowlist projection, historical records without fields remain readable, and no cross-lifecycle leakage. |
| Operator | `sales_estimator` permission checks, oldest-first `new` queue, visible age/target data, phone/reference safety, conflict and transition behavior. |
| WhatsApp | Persistence-before-CTA, safe reference-only message, valid E.164 setting, invalid/empty setting fallback, no automatic status change. |
| Public UX | Form-first CTA, checkbox, acknowledgement, retry/error states, keyboard/focus, 390px responsive layout, and no console/overflow defects. |
| Layer 04 | Read-only current-SHA note covering additive fields, old-record compatibility, idempotency/index decision, and migration stop condition; no live database or migration execution. |

## Commands and minimum checks

Backend, serial on Windows:

```text
python -m pytest -n 0 backend/tests/test_b2b_inquiry_mvp_contract.py backend/tests/test_b2b_inquiry_routes.py backend/tests/test_b2b_inquiry_service.py backend/tests/test_b2b_customer_projection.py -q
```

Frontend and browser checks:

```text
yarn test --watchAll=false --runInBand
yarn build
```

Run the repository's applicable hermetic/browser contract command on the exact
head. Record any unavailable dependency, browser, or database environment
explicitly; do not convert a skipped check into a pass.

## Explicit exclusions

- No production/staging database connection, migration, backup/restore, or
  data export.
- No provider, deployment, external smoke, load test, telemetry destination,
  or go-live claim.
- No source edits outside the four new verification files.
- No expansion into B2B portal, Retail transaction, upload, payment, or
  WhatsApp automation verification.

## Acceptance criteria

1. Every row in the verification matrix has attributable evidence at the exact
   source/test SHA.
2. Positive, negative, permission, privacy, conflict, retry, responsive, and
   accessibility cases are represented; unexpected skips are reported.
3. Backend and frontend results are reconciled after producer/consumer merge;
   no stale fixture or selected-SHA mismatch remains.
4. The Layer 04 note distinguishes source evidence from live database,
   migration, backup/restore, and production-topology evidence.
5. Handover names unresolved decisions, rollback/cleanup needs, and the next
   external authorization instead of declaring production readiness.

## Merge and handover order

1. Freeze the reviewed contract fixture.
2. Backend owner reports source/API handover.
3. Frontend owner reports consumer/UI handover.
4. Verification owner runs the matrix against the integrated head.
5. Lead reviews the evidence and decides whether a separate source PR may be
   prepared. No task card grants merge or deployment authority.

<!-- markdownlint-enable MD013 -->
