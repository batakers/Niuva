# API, OpenAPI, and Compatibility Current-Main Audit Task Card

<!-- markdownlint-disable MD013 -->

**Lane:** Readiness.

**Branch/worktree:** `audit/backend-api-contract-current-main` /
`Niuva-worktrees/backend-api-contract-current-main`.

**Stacked base:** `audit/backend-migration-data-integrity` at `a51af37` so
tracker edits remain ordered behind PR #246. The audited runtime baseline is
`origin/main` at `15b759a`.

## Brief

| Field | Contract |
| --- | --- |
| Title and user outcome | Revalidate current-main API/OpenAPI and compatibility contracts with an exact operation inventory, consumer/test evidence, and safe route dispositions. |
| In scope | Response models for every operation; error envelope/status declarations; authentication/security OpenAPI metadata; pagination/cursor/ordering/date filtering; idempotency/conflict responses; all 21 registered compatibility endpoints; routes without a repository consumer or direct test. |
| Out of scope | Removing, redirecting, deprecating, or changing route behavior; adding consumers; activating disabled Retail/payment/file capabilities; schema/data migration; provider, deployment, production-readiness approval, and go-live. |
| Authority | Master Spec; canonical registers; `PHASE-03A`; Feature 8.1/8.2 merged contracts; Feature 8.3 compatibility register; `DEC-AUTH-001/003`; `DEC-ACCESS-003`; applicable payment/file/readiness decisions. |
| Affected areas | Read-only generated OpenAPI and source/test/consumer inventory; bounded audit regressions only if an objective contract-check gap exists; audit packet and primary readiness trackers. |
| Contract/dependency | Preserve the compatible `detail` field, canonical structured error and request ID, fail-closed status semantics, existing security boundaries, exact pagination filters/order, and historical compatibility routes. |
| Done when | Every generated operation has response/security/consumer/test classifications; compatibility count and dispositions are reconciled; gaps are explicit; proportional tests and exact-head CI pass; trackers link the packet. |
| Verification | Generated `app.openapi()` inventory; route/source/frontend/test reference scans; API/pagination/idempotency/compatibility pytest selections; full quality gate; `git diff --check`. |
| Owner and verifier | Codex is Driver; repository API owner/reviewer is the required independent verifier before merge or any later route-governance change. |
| Commit/push/PR permitted | Yes, explicitly requested by the user on 14 August 2026. |
| Risks/open decisions | External consumers are unknowable from repository search; Contact, stale Material sunset, public Material, legacy Health, and broader retirement decisions remain owner-gated. |

## Required negative cases

- Missing response/error metadata is reported rather than inferred from a
  global handler.
- Protected operations without explicit OpenAPI security metadata are not
  treated as documented merely because runtime dependencies enforce access.
- Cursor reuse with changed filters, invalid limits/dates, stale versions,
  duplicate command IDs, and unavailable transactions retain deterministic
  `4xx`/`409`/`503` outcomes.
- A route with no checked-in consumer or direct test is not classified as
  unused externally and is never automatically retired.
- Legacy Order and file reads remain scoped, customer-safe, and read-only;
  tombstones remain registered and cannot reactivate forbidden commands.

## Rollback and handover

This task changes audit evidence and trackers only unless an objective audit-
test defect requires a separately visible bounded guard. Documentation rollback
is a normal revert. Any later route/runtime change needs an endpoint-specific
task, consumer and external-usage evidence, compatibility window, monitoring,
and rollback contract.

<!-- markdownlint-enable MD013 -->
