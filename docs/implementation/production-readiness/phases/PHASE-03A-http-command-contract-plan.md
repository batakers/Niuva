# PHASE-03A — HTTP and Command Contract Plan

Status: **planning — API-owner scope and bounded transport policy recorded;
ready for owner/reviewer review; no source implementation is authorized**

Phase / tasks: `PHASE-03A` / `TASK-03A-01`, `TASK-03A-02`

Baseline: `65a0e4dbf83fd7a5a336e5ed38c87d803735e064` (`origin/main`,
fetched 29 July 2026)

Task branch / worktree: `plan/phase-03a-http-command-contract` /
`C:\Portfolio\Niuva\Niuva-phase-03a-http-command-contract`

Task card: [PHASE-03A-task-card.md](PHASE-03A-task-card.md)

## Objective

Create the bounded contract packet that future source tasks must follow for
HTTP errors, list pagination, client timeout/retry/cancellation behavior, and
idempotent command outcomes. The packet defines a common vocabulary and
representative fixtures; it does not alter any endpoint, consumer, schema,
provider, data, route topology, or business policy.

The Project Owner selected Option C on 29 July 2026: Faiz is the API Owner,
and the packet covers the existing cross-surface boundary through four
representative route families. A full API rewrite is expressly excluded.

## Authority and constraints

- `docs/NIUVA_MASTER_SPEC.md`, sections 9, 11–13, 17, and 18 — distinct
  Public/Retail/B2B/Admin concerns, customer-safe output, explicit conflict
  handling, idempotent operational retry, fail-closed transaction `503`, and
  no implementation from planning alone.
- `docs/decisions/access/DEC-AUTH-005-admin-session-transport-and-remember-me.md`
  — Admin cookie/CSRF/session behavior stays separate from Customer session
  policy; this plan cannot restore bearer storage or alter refresh behavior.
- `docs/decisions/access/DEC-AUTH-006-abuse-protection-interface-and-deferral.md`
  — `429` and `Retry-After` are approved for rate limits, while topology,
  thresholds, outage behavior, and implementation remain open.
- `docs/decisions/access/DEC-ACCESS-003-legacy-order-compatibility-and-customer-projection.md`
  — legacy Order routes stay ownership/role-scoped, customer-safe, historical,
  and read-only. Their retained status is not permission to redesign or retire
  them here.
- `docs/decisions/product/DEC-DATA-002-quote-line-identity-and-ambiguous-history.md`
  — B2B commands that require an exact line identity stop safely on ambiguity;
  historical records are not inferred or backfilled.
- `docs/decisions/architecture/ADR-005-backend-remediation-runtime-policy.md`
  — existing B2B version/operation semantics and public catalog cursor
  pagination are relevant evidence. Cursor-pagination scope beyond public
  catalog reads remains a recorded clarification boundary.
- `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`
  and `DEC-PAY-02` — payment idempotency/provider rules are not imported into
  this general contract or activated by it.

The production-readiness audit, traceability, assignment, and verification
documents are used only to locate the historical findings and planned checks.
They do not authorize the later implementation.

## Selected-SHA revalidation

| Finding | Current selected-SHA observation | Planning treatment |
| --- | --- | --- |
| `FE-001` | `frontend/src/lib/api.js` creates Axios without a timeout and contains direct `fetch` download helpers with no shared timeout, retry, cancellation, or offline normalization. | Define one future transport-policy seam; do not add an interceptor, retry, timeout, or dependency in this phase. |
| `FE-005` | No frontend `zod` import or `safeParse` response boundary is present; consumers access `response.data` directly. | Identify the four critical response shapes and future invalid-data fixtures; do not choose schemas or add parsing here. |
| `FE-006` | `ClientDashboard.jsx` still swallows a failed `/orders` request. | The Customer Order fixture includes visible error/offline/retry states as future consumer acceptance, not a current UI change. |
| `BE-001` | `backend/server.py` has common HTTP, validation, and unhandled-error envelope handlers, but representative route decorators do not declare response models. | Preserve the existing envelope as compatibility evidence and plan explicit JSON/error/OpenAPI tests separately. |
| `BE-010` | Public catalog accepts `limit` and `cursor`; B2B lists sort and cap at 500 but return raw arrays without page metadata. | Use catalog as the only pagination-shape fixture. Inventory Admin/B2B lists as compatibility candidates; do not extend cursor scope. |
| `INT-011` | B2B route handlers expose `expected_version` and `operation_id` for commands, while the frontend’s generic formatter accepts several error shapes and list consumers assume raw arrays. | Freeze representative producer/consumer fixtures before any client or route change. |

This is a source-inventory revalidation only. It does not prove browser,
network, concurrency, transaction, production, or release behavior.

## Scope and route-family inventory

| Contract family | Representative routes / code | Included planning outcome | Explicit boundary |
| --- | --- | --- | --- |
| Auth and shared transport | `/api/auth/me`, refresh/session routes, `frontend/src/lib/api.js` | Define how the client distinguishes unauthenticated, denied, rate-limited, unavailable, cancelled, and offline outcomes. | No Customer-session policy, Admin-session migration, cookie change, limiter topology, threshold, or refresh rewrite. |
| Customer historical Order read | `GET /api/orders`, `GET /api/orders/{oid}`, controlled design-file download | Define safe normal/deny/not-found/network fixture vocabulary for the existing ownership-scoped projection. | No legacy create, estimate, status, payment-proof, checkout, upload, file-storage, or payment change. |
| Admin B2B command | Quote/project/work-order commands using `expected_version`, `operation_id`, and reason | Use existing version/replay/conflict semantics as the representative command contract. | No quote policy, historical reconciliation, transaction fallback, role change, or generic idempotency mechanism. |
| List pagination | `GET /api/catalog/products?limit=&cursor=` and current capped Admin/B2B lists | Document public catalog’s existing cursor contract and classify capped raw arrays as later compatibility work. | Do not add cursor/page metadata to Admin, B2B, legacy Order, CMS, Portfolio, Inventory, or Notifications routes. |
| Binary and retired paths | file/download helpers and endpoints returning `410` | Classify them as special-success transports that still use the standard JSON error vocabulary where applicable. | No file/auth redesign or compatibility retirement decision; PHASE-03C owns broader retained/read-only/retire governance. |

Other route families remain inventoried by category only. CMS/Portfolio,
Notifications/readiness, Inventory, Materials, Retail mutation, provider,
and Organization Portal contracts retain their own phase and decision gates.

## Proposed contract baseline for later owner review

The following is the contract **candidate** for a later source-changing
authorization. It records current evidence and proposed common language; it
does not alter current behavior or silently settle open policy inputs.

### Error envelope and status vocabulary

For JSON failures, preserve the current compatibility envelope:

```json
{
  "detail": "legacy-compatible detail",
  "error": {
    "code": "stable_machine_code",
    "message": "safe user-facing message",
    "details": {}
  },
  "request_id": "request-correlation-id"
}
```

New critical consumers should use `error` and `request_id`; `detail` is a
legacy compatibility field, not a new client contract. Future fixtures must
document the route-specific code and these outcome classes:

| Outcome | HTTP treatment | Contract restriction |
| --- | --- | --- |
| Malformed input | `422` validation envelope, or a documented `400` business-input error | Never convert an authorization, conflict, or unavailable failure to malformed input. |
| Unauthenticated / expired | `401` | Auth handling follows the approved Admin session boundary; do not apply a universal refresh rule. |
| Denied | `403` | Do not expose internal permission, order, or role detail. |
| Stale version or conflicting command identity | `409` | Applies only where an operation has documented version/idempotency semantics. |
| Rate-limited | `429` with `Retry-After` | Current approved meaning is limited to the abuse-control boundary; no topology or threshold is selected here. |
| Retained-but-disabled action | `410` | Must state compatibility/disabled meaning without re-enabling a legacy command. |
| Required dependency unavailable | `503` | Transaction-required mutations remain fail-closed. This plan does not redefine readiness. |
| Unexpected failure | `500` | Safe generic message and request correlation only; no raw exception or sensitive data. |

### Timeout, retry, cancellation, and offline boundary

The later shared client interface must accept cancellation (`AbortSignal` or an
equivalent supported mechanism) and normalize timeout, offline, cancellation,
and HTTP errors into one consumer-facing type. Cancellation caused by a
superseded page/request is not a user-visible failure.

Automatic retry is a future policy only for documented safe reads. It must not
automatically replay a state-changing command merely because the network result
is unknown. `429` must respect `Retry-After`; `401`, `403`, `409`, malformed
input, and client cancellation are not retry candidates.

### Approved bounded transport policy

The API Owner approved the following values on 29 July 2026. They govern a
future shared-client implementation only after a separate source task is
authorized:

- JSON API requests have a 15-second timeout.
- At most one automatic retry is permitted for `GET`/`HEAD` after a transient
  network failure.
- No automatic retry is permitted for `401`, `403`, `409`, `422`, `429`,
  state-changing commands, or file downloads. A `429` surfaces the supplied
  `Retry-After` interval for a user-directed later attempt.
- A manual retry of a documented B2B command reuses its original
  `operation_id`; it does not mint a second command identity.
- A request superseded by navigation or a newer request is cancelled and does
  not become a user-visible error state.

This approval does not set a generic idempotency mechanism, retry a command
with an unknown outcome, redefine file transfer behavior, or extend pagination
beyond public catalog reads.

### Command replay and conflict boundary

The B2B representative commands already carry `expected_version`,
`operation_id`, and a reason. Later contract tests must prove all of the
following without introducing a non-atomic fallback:

- the same valid operation identity returns its documented replay outcome and
  does not create a second business effect;
- a stale `expected_version` produces a controlled conflict;
- conflicting reuse of an operation identity does not masquerade as success;
  and
- transaction capability absence returns the documented fail-closed `503`.

This does not create a generic `Idempotency-Key` rule, retrofit legacy Order
commands, or change the payment adapter boundary.

### Pagination boundary

`GET /api/catalog/products` is the only representative pagination contract:
validated `limit`, opaque `cursor`, stable ordering, and an explicit
continuation outcome as implemented by the catalog service. The plan requires
the future catalog fixture to describe its actual response metadata and invalid
cursor/limit outcomes.

Admin and B2B capped raw-array lists are classified as `legacy_list_contract`
until a separately approved scope clarifies pagination beyond public catalog.
They must not acquire a new cursor, page number, total, date-filter policy, or
response wrapper in PHASE-03A.

## Task breakdown and future fixture matrix

### TASK-03A-01 — Contract and route-family packet

**Objective:** record the source/authority baseline and the compatibility-safe
contract vocabulary above.

**Acceptance criteria:**

- Every included route family has an owner, a customer/admin/public boundary,
  and an explicit exclusion.
- Existing JSON error compatibility, command version/replay evidence, and
  public catalog cursor boundary are distinguished from proposed future work.
- No wording grants implementation, migration, provider, or deployment work.

**Verification:** authority/source cross-check, Markdown link check, changed
path review, and `git diff --check`.

### TASK-03A-02 — Representative fixture and implementation-handoff matrix

**Objective:** specify the minimum future tests and owned source areas before
a later implementation proposal is considered.

| Fixture | Representative boundary | Required later proof |
| --- | --- | --- |
| Normal | Catalog page, customer historical read, and valid B2B command | Consumer receives the documented projection or command result. |
| Malformed | Invalid request body or `limit` | Controlled `422`/documented `400`; no raw framework body. |
| Offline / timeout | Axios and controlled `fetch` boundary | A visible recoverable state; no indefinite spinner or silent empty result. |
| Replay | Same B2B `operation_id` | One business effect and documented replay result. |
| Conflict | Stale B2B `expected_version` or conflicting operation identity | Controlled `409`, no accidental retry as a new command. |
| Deny | Customer versus internal Order surface and protected Admin command | `401`/`403` without leaking customer or internal data. |
| Service unavailable | Transaction-required representative command | Fail-closed `503`, no non-atomic fallback. |

**Future implementation ownership, only after separate authorization:**

| Slice | Likely source/test ownership | Dependency |
| --- | --- | --- |
| Error/OpenAPI and B2B fixture alignment | `backend/server.py`, B2B route/service contract tests | Frozen status/error and replay wording. |
| Shared client transport normalization | `frontend/src/lib/api.js` and focused client tests | API Owner approval of numeric policy; no concurrent AuthContext rewrite. |
| Customer error state | Customer Order consumer tests/components | Shared transport contract plus separately approved customer UI scope. |
| List contract change beyond catalog | Relevant producer and each consumer | A new pagination decision/authorization; explicitly not part of this phase. |

## Stop and resume conditions

Stop before implementation if any work would:

- extend pagination beyond public catalog;
- alter Admin cookie/CSRF/session semantics or Customer session policy;
- re-enable a legacy Order, manual-transfer, payment-proof, payment, upload,
  or checkout command;
- add a provider, dependency, migration, data operation, deployment, or
  readiness claim; or
- choose a business/role/Finance/retention policy not already authoritative.

Resume a source-changing subtask only when the API Owner explicitly approves
the exact route list, source/test file ownership, and verification environment.
The next task must use a fresh task card and selected SHA. It must not treat
this planning plan as implementation approval.

## Handoff

Changed by this planning task: this plan, its task card, and only the linked
PHASE-03A planning-status rows. Intentionally unchanged: all application
source/tests, OpenAPI behavior, config/dependencies, data/migrations, provider
settings, runbooks, and operational topology.

Faiz owns the contract decision and planning handoff. A future reviewer should
confirm that `detail` remains compatibility-only, cursor scope did not expand,
the Customer-safe legacy boundary remains intact, B2B replay/conflict evidence
is not generalized beyond its authority, and no plan language implies
production readiness or go-live.
