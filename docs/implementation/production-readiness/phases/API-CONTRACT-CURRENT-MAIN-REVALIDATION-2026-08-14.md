# API, OpenAPI, and Compatibility Current-Main Revalidation

<!-- markdownlint-disable MD013 -->

Status: **repository audit complete; contract remediation and retirement remain separate**

Audited runtime baseline: `origin/main` at
`15b759a02b036330f1dd0913611043e0fd6134e2`.

Audit stack base: `audit/backend-migration-data-integrity` at `a51af37`.
The stacked audit commits do not change backend/frontend runtime behavior, so
the generated API below is the selected runtime baseline.

## 1. Outcome

Current-main exposes **133 OpenAPI paths and 152 operations**. Feature 8.1 and
8.2 established a strong bounded contract for representative Auth, legacy
Order, B2B, and Catalog operations, but did not become a whole-API contract.
The principal current gaps are:

- only 23/152 operations publish a success response schema; four of those use
  generic `dict[str, Any]`, leaving 19 concrete typed contracts and 129
  operations without a success schema;
- only 26/152 operations publish the shared `ErrorEnvelope`; 126 do not;
- generated OpenAPI contains zero `securitySchemes`, no global `security`, and
  zero operation-level `security` declarations, even though most Admin and
  customer routes enforce authentication/permissions at runtime;
- 20 JSON command schemas carry `operation_id` or `request_operation_id`, but
  only five operations document a shared `409` response;
- the five approved B2B list families have the complete cursor/date/filter
  contract, while other list families remain raw, capped, unpaged, weakly
  bounded, or undocumented; and
- all 21 compatibility operations remain registered, but their generated
  success/error/security/deprecation metadata is substantially incomplete.

Layer 03 remains at **74% readiness**. Repository confidence for this bounded
API disposition is **98%**; external-consumer and deployed-contract confidence
remain **0%** because no gateway, traffic, client-version, or production
OpenAPI evidence was available.

## 2. Whole-API response and error inventory

| Primary OpenAPI tag | Operations | Success schema | Generic object among schemas | Shared error envelope |
| --- | ---: | ---: | ---: | ---: |
| Untagged | 52 | 7 | 0 | 10 |
| `b2b` | 22 | 13 | 4 | 13 |
| `catalog` | 20 | 3 | 0 | 3 |
| `inventory` | 16 | 0 | 0 | 0 |
| `materials` | 11 | 0 | 0 | 0 |
| `content` | 11 | 0 | 0 | 0 |
| `portfolio` | 9 | 0 | 0 | 0 |
| `identity` | 6 | 0 | 0 | 0 |
| `retail` | 5 | 0 | 0 | 0 |
| **Total** | **152** | **23** | **4** | **26** |

The global runtime exception handlers preserve a compatible JSON envelope, but
they do not make an operation's generated response contract complete. OpenAPI
still publishes FastAPI's default `HTTPValidationError` on 106 operations; 101
operations have only that default validation metadata and no shared error
declaration. Generated error-status coverage is limited to 22 operations with
`401`, 22 with `403`, ten with `404`, five with `409`, one with `410`, three
with `429`, 26 with `500`, and eight with `503`.

Recommended remediation is incremental by route family, not a single unsafe
mechanical wrapper:

1. define concrete success models and route-specific shared errors for active
   consumer-facing and operator-critical operations first;
2. preserve binary/CSV responses as explicitly typed non-JSON transports;
3. replace generated default validation metadata with the actual shared `422`
   envelope where runtime uses it; and
4. add an inventory gate which reports missing contracts before progressively
   making selected families required.

## 3. Authentication and security metadata

Runtime authorization remains enforced by dependencies and was independently
revalidated by the preceding auth/security feature. OpenAPI, however, cannot
tell a generated client which operations are public, Customer bearer, Admin
cookie/CSRF, permission-scoped, or multi-permission:

- `components.securitySchemes`: absent;
- global `security`: absent;
- operations with explicit `security`: 0/152.

The recommended contract is to document Customer bearer and Admin cookie/CSRF
as separate schemes/boundaries. It must not claim that CSRF alone authenticates
a caller, merge Admin and Customer transport, or expose internal permission
names in public errors. Public operations must explicitly remain public rather
than inheriting an accidental global requirement.

## 4. Pagination, cursor, ordering, and dates

| Family | Current contract | Evidence and gap |
| --- | --- | --- |
| Five Admin/B2B lists | `{items,next_cursor}`, limit 1–100/default 50, opaque scope/filter-bound cursor, `updated_at DESC,id DESC`, deterministic legacy tail, timezone-aware half-open `[updated_from,updated_before)` | Complete bounded source/test/OpenAPI contract for Inquiry, Quote, Project, Work Order, and Material Shortage. |
| Public Catalog products | Typed page and opaque cursor; runtime limit 1–50/default 24 | Stable source/tests exist, but OpenAPI's `limit` has no min/max and `cursor` has no documented bound/format. |
| Notification lists | Raw/untyped response with default limit 50 | No cursor/page metadata or OpenAPI min/max; continuation and ordering contract are not published. |
| Inventory lists | Raw/untyped response; several endpoints cap limit at 1–500/default 200 | No cursor/page metadata; ordering/continuation are not a client contract. Query-plan/load evidence is absent. |
| Legacy Admin Orders | Raw untyped array capped internally at 500 | No continuation or truncation signal. Export `date_from/date_to` are unformatted strings applied directly and inclusively to stored `created_at`. |
| Dashboard stats | Bounded canonical date resolver is used | Date semantics are source-tested, but query formats, `400`, and success models are missing from OpenAPI. |
| Catalog/Content/Portfolio/Retail/Identity lists | Mostly raw arrays or dictionaries | No common page contract; several have only implicit sort/caps. Expansion requires a per-consumer migration, not a silent envelope change. |

The next implementation should prioritize lists with active consumers and
silent truncation. It must preserve current B2B cursor binding and must not add
offset/total-count or arbitrary client sort fields without a separate contract.

## 5. Idempotency and conflict responses

Generated request schemas identify 20 commands carrying an operation identity.
Only these five document the shared `409` response: Inquiry transition/
conversion and Quote transition/revision/acceptance.

The 15 commands missing a documented `409` are Quote-to-Project, Project
transition/Work Order creation, Work Order allocate/consume/transition/QC,
Retail Order create/transition, Inventory movement, adjustment request create/
approve, and reservation create/release/consume.

The source and service tests prove many exact replay, fingerprint mismatch,
stale-version, or compare-and-swap outcomes, but generated clients cannot
discover those conflicts. Other Identity, Catalog, Material, Content, and
Portfolio operations also raise runtime `409` without publishing it. This is
an OpenAPI/route-test gap, not authority to generalize one global idempotency
policy or automatically retry an unknown command outcome.

## 6. Compatibility endpoint disposition

All 21 Feature 8.3 operations are still registered. Recommended current-main
primary disposition:

| Disposition | Count | Treatment |
| --- | ---: | --- |
| `retained` | 14 | Keep Auth, historical read-only Order, disabled Order creation, logical-path file, public Material, legacy Health, and read-only Admin Contact history. |
| `redirect` | 0 | No route has proven shape/security/lifecycle parity for a safe HTTP redirect. |
| `deprecated` | 2 | Keep `POST /api/contact` callable while announcing `/api/inquiries` only after external-use/shape review; keep Material DELETE alias behind its POST archive successor and correct the stale sunset plan separately. |
| `retirement_blocked` / tombstone | 5 | Keep the five legacy Order mutation tombstones registered so forbidden commands fail deterministically rather than becoming ambiguous `404`s. |

This recommendation resolves the prior Contact ambiguity as follows: the
legacy Contact write should be deprecated, not redirected or silently removed;
the Admin Contact read should remain read-only for historical records and must
not redirect to Inquiry because the shapes/lifecycles differ. Runtime headers,
route behavior, and canonical decision records are unchanged by this audit.

Generated contract quality for the 21 operations is still weak:

- four have success schemas;
- seven declare the shared error envelope;
- none declares OpenAPI security;
- none sets OpenAPI `deprecated: true`;
- all five tombstones advertise an automatic `200` success response, while
  only the payment-proof tombstone also declares its actual `410`; and
- retained-disabled `POST /api/orders` advertises automatic `200` alongside
  its actual `503` inactive-capability response.

Repository search cannot disprove external consumers. Therefore no route is
eligible for removal merely because it lacks a current frontend call.

## 7. Consumer and direct-test review

A conservative normalized URL-reference scan found 125/152 operations in
backend test files and 130/152 in frontend source/tests. It intentionally
counts a path-family reference as evidence, not proof that every method/status
is exercised.

Manual review of the four operations with neither a direct normalized URL
reference nor a script reference found:

- `GET /api/file-objects/{file_id}` has no checked-in consumer and no direct
  route test; only its implementation exists. External use remains unknown.
- Project transition and Work Order allocate/consume have current dynamic
  frontend consumers and service/domain tests, but lack direct route-level
  request/OpenAPI coverage for their exact status/error/idempotency contract.

Twenty-three frontend-referenced operations have no direct backend URL-level
test match. The most important families are settings, notifications, media,
Quote-to-Project/Project/Work Order commands, Portfolio reorder/transition,
Catalog validate/publish/rollback/archive, Inventory balance/reject, and
Content validate. Service/component tests reduce implementation risk but do
not prove route dependency, HTTP status, shared envelope, and generated schema
together.

## 8. Verification evidence

Read-only generated-schema probes ran against the imported application only;
no server, database, provider, migration, or external target was started.

Focused current-main API, pagination, compatibility, Auth, B2B, Retail,
Inventory, file, Health, and Material suite:

```text
python -m pytest -n 0 -q [17 selected backend API/contract modules]
```

Result: `155 passed in 16.87s`, with zero skips.

Generated-schema checks reproduced:

```text
OpenAPI 3.1.0
133 paths / 152 operations
23 success schemas (4 generic objects)
26 operations with ErrorEnvelope
0 security schemes / 0 secured operations
20 operation-identity commands / 5 documented shared 409 responses
21/21 registered compatibility operations present
```

Exact-head CI is required after publication because this stacked PR's normal
pull-request quality workflow only targets `main`.

## 9. Tracker disposition and next steps

- `BE-001` remains `partial`: the bounded shared envelope works, while whole-
  API success/error/auth metadata is incomplete.
- `BE-010` remains `partial`: five B2B families are complete; broad list/date/
  continuation and query evidence remain incomplete.
- `BE-011` remains `partial`: all 21 endpoints are inventoried and the Contact
  recommendation is now explicit, but external consumers, actual deprecation
  metadata, sunset/monitoring owners, and retirement evidence remain open.
- `INT-011` remains partial because producer/consumer coverage is not a full
  runtime-schema and invalid-data contract.

No endpoint was changed, redirected, deprecated in runtime, or removed. The
recommended next source slice is a bounded OpenAPI coverage gate plus concrete
models/security metadata for one active route family, followed separately by
the 15 missing idempotency/conflict declarations and the high-risk raw list
families.

<!-- markdownlint-enable MD013 -->
