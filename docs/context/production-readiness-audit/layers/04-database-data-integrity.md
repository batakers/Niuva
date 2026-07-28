# Layer 04 — Database and Data Integrity

Status: Context Only — Audit Evidence and Progress Tracker — Not Implementation Authority

## 1. Audit state

| Field | Value |
| --- | --- |
| Audit status | `complete` for the requested repository/static scope; dynamic database scope is `environment_blocked` |
| Audit completion | 94% of applicable repository checklist; live/staging/production evidence is explicitly unverified |
| Readiness score | 44% |
| Confidence | 78% for source/tests/migration evidence; 0% for production data/topology/backup ownership |
| Recorded P0/P1 | 0 / 13 |
| Finding prefix | `DB-` |
| Last verified SHA | `c28684d34c03505ea2f862f32c6edc24b1d7bfba` |
| Last updated | 2026-07-28 03:43 WIB (UTC+07:00) |

The score is capped by the unverified live schema, absent production-like
backup/restore evidence, non-atomic legacy/recovery writes, migration rollback
gaps, and missing referential/retention controls. It is not a production or
go-live decision.

## 2. Safety boundary and evidence

No MongoDB connection, migration, restore, mutation, data export, or production
query was executed. No production database, staging database, backup location,
owner, dataset, RPO/RTO, retention approval, or replica-set deployment was
inspected. Therefore this audit inventories code-addressed/expected collections,
not confirmed live collections.

Reviewed authority and procedure:

- `AGENTS.md` — Active Guardrail.
- `docs/NIUVA_MASTER_SPEC.md` — Approved Canonical; historical preservation,
  Decimal/minor-unit money, customer-safe projections, and replica-set
  transaction boundary.
- `docs/context/DOCUMENT_REGISTER.md` and
  `docs/decisions/DECISION_REGISTER.md` — Approved Canonical registers.
- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md` —
  Approved Baseline; transaction-required mutations fail closed.
- `docs/decisions/access/DEC-AUTH-003-account-recovery-contract-and-compatibility.md`
  and `DEC-AUTH-009-authentication-security-event-governance.md` — Approved
  recovery atomicity and 90-day event-retention direction.
- `docs/runbooks/CATALOG_MATERIAL_INVENTORY_RUNBOOK.md`,
  `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md`, and
  `doc/TRANSACTION_CAPABILITY_RUNBOOK.md` — Runbook evidence only.
- `backend/` source, `backend/migrations/001`–`006`, index declarations,
  backup utility, tests, Compose files, and CI transaction workflow.

Safe verification executed:

```text
$env:PYTHONPATH='backend'
python -m pytest -q `
  backend/tests/test_catalog_material_inventory_migration.py `
  backend/tests/test_identity_access_migration.py `
  backend/tests/test_granular_role_migration.py `
  backend/tests/test_database_capabilities.py `
  backend/tests/test_migration_backup_restore.py `
  backend/tests/test_transaction_error_contract.py `
  backend/tests/test_transaction_guard.py
```

Result: `51 passed, 3 skipped, 4 warnings`. The three skips are the explicit
real-replica-set/backup tests gated by `NIUVA_RUN_REAL_TRANSACTION_TESTS=1` and
`MONGO_TRANSACTION_TEST_URL`; they are not a pass. Tests use fakes or an
isolated database name fixture when the real topology is explicitly opted in.

## 3. Collection inventory and source-of-truth matrix

The matrix is a repository inventory. “Exists” means code addresses the
collection; it does not assert that the collection exists in any external
environment. Index names refer to startup/index-declaration code, not a live
`listIndexes` result.

| Collection | Writer | Reader | Key Fields | References | Indexes | Transaction Requirement | Migration | Tests | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `users` | `server.py`, `identity_routes.py`, `001`, `003`, `006` | auth, permissions, notifications, admin | `id`, `email`, `password_hash`, `roles`, `status`, `access_state`, `version`, `token_version`, timestamps | audit actor; invitations; reset tokens; notifications; legacy orders | `email` UQ, `id` UQ, `roles+status`, `access_state`, `roles`, `role_policy_version` | Yes for guarded identity/recovery changes; legacy reset path is not guarded | `001`, `003`, `006` | identity/auth/migration suites | PII/credentials, mixed legacy fields, recovery partial writes |
| `audit_events` | `audit.py`, guarded migrations | no application audit browser; tests | envelope, before/after or previous/result, action, target, `created_at` | actor/target IDs | `id` UQ, `created_at`, actor, target pair | Same session as the mutation when caller supplies one | `001`, `003`, `006` | audit/migration suites | no retention/deletion job; generic events can carry PII |
| `organizations` | no current runtime writer; `001` indexes | no current runtime reader | undocumented | membership/user references intended by canonical B2B model | `id` UQ, status | N/A currently; must be transactional when reintroduced | `001`, targeted by `005` | identity foundation fakes only | current existence/ownership unknown; `005` must not be run without approval |
| `organization_memberships` | no current runtime writer; `001` indexes | no current runtime reader | undocumented | `organization_id`, `user_id` | `id` UQ, org+user UQ, user+status | N/A currently; membership changes require atomic policy updates | `001`, targeted by `005` | identity foundation fakes only | no schema or orphan checks |
| `internships` | no runtime writer/reader | no runtime reader | undocumented | none found | none | N/A | targeted by `005` | none | not proven orphan in a live DB |
| `identity_policy_state` | `003` reconciliation | `003` | singleton `_id`, `key`, owner count, policy version | canonical owner state | `key` UQ plus `_id` | Guarded transaction for reconciliation | `003` | identity migration suite | no live-state evidence |
| `staff_invitations` | `identity_routes.py`, `006` indexes | invitation acceptance | `id`, email, roles, token hash, status, version, expiry, timestamps | target user on acceptance | token hash UQ; pending email UQ partial | Guarded with user creation/acceptance | `006` | identity foundation/granular migration | no expiry/retention index |
| `password_reset_tokens` | `server.py` recovery | `server.py` recovery | `id`, `user_id`, `token_hash`, `expires_at`, `used_at`, `created_at` | `user_id` → `users` | none | Required by DEC-AUTH-003, but current path is non-atomic | no existing migration; `007` is only proposed | reset-password unit tests; real recovery migration absent | duplicate/expired-token scans and atomic consumption absent |
| `settings` | `server.py` startup/profile update | public/admin settings | singleton `key=site`, profile fields, legacy payment fields | none | none | Single-document upsert | none | settings profile tests | duplicate singleton possible; no history/retention index |
| `orders` | `server.py` legacy order flow | customer/admin/stats/notifications | legacy customer/file/payment/status/history/timestamps | `user_id`, `material_id`, file path | `id` UQ only | Legacy writes are non-transactional; payment mutation endpoints disabled | `002` preserves material references | legacy order/auth suites | count-based order number race; PII/file/payment history; no status/time index |
| `retail_orders` | `retail_service.py` | retail routes/admin | operation ID, order number, customer snapshot, items, minor-unit totals, lifecycle/version/history | variant/product snapshots; reservations conceptually | `id`, `order_number`, `creation_operation_id` UQ; status+updated | Yes for creation guard; ordinary transitions are single-document optimistic updates | none | retail aggregate/routes and transaction suites | no live schema validation; customer snapshot retention open |
| `retail_order_counters` | `retail_service.py` | order-number allocator | month `id`, sequence | none | none beyond Mongo `_id` | Same transaction as retail order | none | retail aggregate tests | `id` has no unique index; upsert race relies on order-number UQ |
| `contacts` | `server.py` legacy contact form | admin contacts | contact PII, subject/message, `created_at` | none | none | Single insert | none | backend smoke coverage | unbounded PII retention; legacy read-only projection |
| `inquiries` | `b2b_service.py` | B2B routes/stats | contact PII, need/brief, status, version/history, converted quote, timestamps | quote via `converted_quote_id` | `id` UQ; status+updated | Conversion must be guarded across inquiry/quote/version | none | B2B service/routes/transaction suites | no DB FK/orphan scan; PII retention open |
| `b2b_quotes` | `b2b_service.py` | B2B routes | inquiry ID, status/version, current/accepted version IDs, project ID, history | inquiry, quote version, project | `id` UQ; `inquiry_id` UQ; status+updated is not declared | Revision/create-project/convert guarded; simple transitions are single-document | none | B2B lifecycle/transaction suites | references not enforced; duplicate line identity unresolved |
| `b2b_quote_versions` | `b2b_service.py` | B2B service/routes | quote ID, revision, snapshots, integer minor totals, creator/reason/time | quote, variant/product/material snapshots | `id` UQ; quote+revision UQ | Insert + pointer update guarded | none | quote snapshot/lifecycle suites | no DB validator for immutable fields or snapshot shape |
| `b2b_projects` | `b2b_service.py` | B2B/portfolio/stats | quote/inquiry/version snapshot, status/version, milestones, design/QC/fulfilment IDs, history | quote, inquiry, quote version, work orders, portfolio | `id` UQ; `quote_id` UQ; status+updated | Create project/work-order/allocation guarded where cross-collection | none | project/work-order/transaction suites | array references can orphan; unbounded history/arrays |
| `work_orders` | `b2b_service.py` | B2B routes/inventory | project/quote/version/variant IDs, quantity, material requirements, reservations, status/version/history | project, quote/version, variant, reservations | `id` UQ; project+updated; status+updated | Create/allocation/consume guarded | none | work-order/allocation suites | first matching variant line; no line-level reference constraint |
| `work_order_shortages` | `b2b_service.py` | B2B routes | work order/project, open/resolved status, shortage lines, operation/timestamps | work order/project/material IDs | `id` UQ; status+updated; work order ID | Created after aborted allocation by design; dedupe is application check | none | shortage recovery suites | no unique open-shortage constraint; race can duplicate |
| `categories` | `catalog_service.py` | catalog/public projections | id, name/slug, status, sort order, timestamps | product `category_id` | slug UQ only | Single-document CRUD; publication aggregate uses transaction | none | catalog routes/domain | id not unique; slug check-then-insert race |
| `products` | `catalog_service.py` | catalog/B2B/retail/public | id, category, slug, pricing mode, CTA, workflow/publication pointer, timestamps | category, variants/options/publications | slug UQ only | Variant/option replacement and publication guarded | none | catalog route/domain | id not unique; pointer/reference consistency not DB-enforced |
| `product_variants` | `catalog_service.py` | catalog/B2B/retail/inventory | id, product, SKU, option values, fixed price, Decimal-string quantities, status | product, materials via BOM | SKU UQ; id UQ | replacement guarded; reads otherwise | `002` index declarations | catalog/BOM/retail suites | product ID not indexed; BOM orphan scans absent |
| `configuration_options` | `catalog_service.py` | catalog/public | id, product, code, type, bounds, values, active/order | product | id UQ; product+code UQ | replacement guarded | `002` | catalog route tests | no schema validator for bound/type combinations |
| `catalog_publications` | `catalog_service.py` | public/catalog admin | id, product, revision, sanitized snapshot, actor/reason/time | product, active pointer | product+revision UQ; no id UQ | publish/rollback guarded | `002` | catalog route tests | no validator; active pointer can be orphaned by external/manual writes |
| `materials` | `material_routes.py`, `server.py`, `002` | material/inventory/B2B/catalog | id, SKU, name, unit, supplier reference, Decimal-string quantities, setup/status, timestamps | BOM, price versions, balances, legacy orders | SKU UQ partial only; no id/status index | price/material CRUD mostly single-document; inventory cross-collection guarded | `002` | material/migration/inventory suites | id not unique; legacy type drift and supplier PII |
| `material_price_versions` | `material_routes.py` | material pricing/B2B snapshots | id, material, integer amount, currency/unit, effective timestamp, reason | material | material+effective_from UQ | append-only single insert | `002` index declaration | material pricing tests | no id UQ; string/date mixed legacy values affect uniqueness/order |
| `inventory_balances` | `inventory_service.py` | inventory/B2B/stats | subject pair, Decimal128 balances, derived values, version/timestamps | material or variant subject | subject pair UQ | Required for movement/reservation/allocation | `002` | inventory/transaction suites | query sort lacks updated index; orphan subjects not scanned |
| `stock_movements` | `inventory_service.py` | inventory/stats/audit | operation/fingerprint, subject, movement, Decimal128 deltas, balance versions, ref, time | subject, reference, reservation | operation UQ; subject+created | Required; operation idempotency and stale version | `002` | inventory transaction/contract suites | reference queries lack index; replay consistency only tested in isolated paths |
| `inventory_reservations` | `inventory_service.py` | inventory/B2B | subject/ref, Decimal128 quantity, status, expiry, transition operation, timestamps | subject, order/project/work order reference | id UQ; reference+status | Required for reserve/release/consume/expire | `002` | inventory service/transaction suites | expiry and subject/status query shapes lack compound index |
| `restock_alerts` | `inventory_service.py` | inventory/notification/admin | subject, trigger, active dedup key, last balance, status/resolution | subject; notification reference | active dedup key UQ partial; no subject/status/updated index | Created/resolved inside movement transaction | `002` | inventory/notification suites | check-then-insert race relies on unique error path; query alignment gap |
| `content_blocks` | `content_service.py`, `004` | content/public | id, type/slug, status, fields, version, published pointer, timestamps | versions; public projection | none | publish/transition/rollback require transaction | `004` | content lifecycle/routes | no `(content_type,slug)` UQ; create/publish seed partial failure leaves draft |
| `content_block_versions` | `content_service.py` | content admin/rollback | id, block, content/status/version snapshot, event/actor/reason/time | content block | none | Same transaction as block lifecycle | `004` | content lifecycle tests | no id/block+version index; immutable shape only app-enforced |
| `portfolio` | `portfolio_service.py`, `server.py` seed | public/admin | id, content, source project, lifecycle/version/order, embedded versions/history | project | id UQ; status+display; source project nonunique | Current writes are single-document; reorder is multiple writes | none | portfolio lifecycle | one-project-one-draft is check-then-insert; unbounded embedded history |
| `notifications` | `emailer.py` and `notification_service.py` | user feed/admin | two competing shapes: legacy `read/to_email/body_html` and modern `read_at/event/dedup` | user; allowlisted reference | id UQ; dedup UQ partial; user+read; user+created | Modern publish may share caller transaction; emailer writer is outside guard | none | notification feed/admin tests | schema drift, duplicate delivery, PII/raw message retention |
| `notification_outbox` | `notification_service.py` | delivery worker/API | notification, channel, recipient, payload, status/attempts/error, timestamps | notification | id UQ; status+created | Optional session on enqueue; delivery updates not guarded | none | notification feed tests | no `(notification,channel)` UQ/claim lease; payload/recipient retention open |
| `admin_notification_log` | `server.py` | admin sent-notification page | target/segment/subject/message/count/actor/time | actor/user segment | none | Single insert after external email loop | none | admin notification tests | partial external failure and unbounded PII log |
| `transaction_evidence` | integration tests only | integration tests only | test marker/result | none | test-defined | Test-only | none | real transaction test module | not an application collection; never infer production state |

Potential `_archived_*` collections are outputs of migration `005`; no live
existence was established.

## 4. Schema, type, lifecycle, and data-boundary assessment

### Positive controls

- Application IDs are normally opaque UUID strings; the most important
  operation IDs, user IDs, and references are not exposed as secrets.
- Catalog/B2B/Retail customer-facing projections use explicit allowlists
  (`catalog_domain.py`, `b2b_domain.py`, `portfolio_domain.py`,
  `content_domain.py`) rather than broad blacklists.
- Commercial snapshots use integer minor units for current B2B/Retail/material
  pricing paths; inventory quantities use Decimal128 at persistence
  (`inventory_service.py:297-343`).
- Catalog/material/inventory lifecycle values are explicitly enumerated in
  domain/route code; invalid transitions are rejected at the service boundary.
- Archive/soft-delete semantics preserve categories, products, variants,
  materials, content, and portfolio history instead of hard-deleting
  referenced records.
- Inventory uses operation fingerprints, unique operation IDs, optimistic
  balance versions, deterministic expiry IDs, and an active restock
  deduplication key.
- B2B quote versions, catalog publications, content versions, portfolio
  revisions, and order histories are append/snapshot-oriented, but their
  immutability is application-enforced rather than Mongo schema-enforced.

### Gaps and inconsistencies

- There is no MongoDB collection validator/schema migration. Required fields,
  optional fields, enum values, and scalar types can drift when legacy data or
  direct operators bypass Pydantic/service validation.
- Timestamps are mostly UTC ISO strings, while `migration_backup.py` explicitly
  supports BSON dates/Decimal128. Mixed legacy string/date values are not
  normalized or preflighted for every collection; lexicographic date queries
  can therefore misorder or miss records.
- Inventory stores Decimal128, catalog/material quantity fields are commonly
  JSON strings, and legacy `orders.estimate.amount` was modeled as `float`
  even though its mutation endpoint is now disabled. Historical monetary type
  inventory is not proven.
- `notifications` has two incompatible writers. `emailer.py:31-39` writes
  `read`, `to_email`, and `body_html` without `deduplication_key`/`updated_at`;
  `notification_service.py:92-106` writes `read_at`, event/reference fields,
  and occurrence counters. `project_notification()` only derives read state
  from `read_at`, so legacy rows can remain effectively unread and bypass
  deduplication.
- `orders` and `retail_orders` are intentionally separate lifecycles, but
  both are active persistence surfaces. Legacy `orders` still carries
  customer/file/payment fields; it is not a migration target and its
  order-number allocation is count-based.
- Required references are application checks, not database constraints.
  There is no orphan scan or recurring referential-integrity report.
- Internal fields (supplier reference, cost/margin/profit, payment and audit
  details) are allowlisted away in several projections, but notification and
  generic audit paths can retain direct contact/message data. Production
  retention and deletion ownership are not evidenced.

### Lifecycle/status inventory

`users`: `active|disabled`; `access_state`: `approved|access_review_required`.
`staff_invitations`: at least `pending|accepted`. `categories`, `materials`,
`variants`: `active|archived`. Content and portfolio:
`draft|review|preview|scheduled|published|archived`. B2B inquiries:
`new|reviewed|contacted|converted|rejected`; quotes:
`draft|internal_review|sent|accepted|revision_requested|expired|rejected`;
projects: `planned|active|on_hold|completed|cancelled`; work orders:
`planned|in_progress|completed|cancelled`; shortages: `open|resolved`.
Inventory reservations: `active|released|consumed|expired`; restock alerts:
`active|resolved`; notifications: `unread|read` in the domain model, but
legacy email rows use a boolean `read`. Retail orders use the canonical
12-stage lifecycle in `retail_domain.py`; legacy `orders` use
`pending_estimate|awaiting_payment|in_process|completed|cancelled`.

There is no database-level enum/check enforcement for any of these values.

## 5. Index, uniqueness, and query alignment audit

The central catalog/index declaration is positive for the declared keys:
`backend/catalog_inventory_indexes.py:1-78`, and startup invokes it at
`backend/server.py:1544-1559`. However, the following gaps remain:

- ID lookups are common but `categories.id`, `products.id`, `materials.id`,
  `catalog_publications.id`, and several legacy collection IDs have no unique
  index. A UUID generator is not a database uniqueness proof.
- Singleton `settings.key` has no unique index; concurrent first startup or
  direct data repair can create multiple `site` documents.
- `content_blocks(content_type,slug)` has only a check-then-insert, and
  `portfolio.source_project_id` has only a non-unique lookup despite the
  one-project-one-draft invariant.
- Legacy `orders.order_number`, `password_reset_tokens.token_hash`,
  `password_reset_tokens.expires_at`, and outbox deduplication have no
  uniqueness/expiry protection.
- `work_order_shortages(work_order_id,status)` has no unique open-shortage
  constraint. `notifications` has a modern dedup index, but legacy rows are
  deliberately outside the partial filter.
- Query/sort shapes are not fully aligned: inventory balances sort by
  `updated_at`, movements query `reference_id`, reservations query
  `subject_type+subject_id+status` and expire by `status+expires_at`, restock
  alerts query subject/status and sort `updated_at`, while the declarations
  do not cover those compound shapes. Similar gaps exist for contacts,
  settings, admin notification log, and password reset records.
- Unique index creation is often performed after data writes in migrations;
  index failure can leave earlier writes committed.

## 6. Transaction and referential-integrity map

### Required atomic boundaries

The approved boundary is MongoDB replica-set multi-document transactions with
fail-closed behavior (`ADR-001`). B2B quote revision, inquiry conversion,
project creation, work-order creation/allocation/consumption, Retail order
creation, and modern inventory movement/reservation paths use the shared guard
or a capability gate. Catalog and content lifecycle methods use direct
`start_transaction()` blocks after checking a cached capability; inventory
also owns direct transaction loops. The transaction runbook records that
later shared-guard adoption for catalog/inventory remains pending.

### Current integrity risks

- `server.py:495-508` invalidates sibling reset tokens and inserts a new token;
  `server.py:529-550` reads a token, updates `users`, then marks tokens used.
  Password, session version, token consumption, and sibling invalidation are
  not one transaction, contrary to DEC-AUTH-003.
- `content_service.py:123-162` and `:164-205` read a block, create a version,
  and update the block without a version predicate. Concurrent publishes can
  create duplicate logical versions and last-write-wins pointers.
- `portfolio_service.py:296-310` reorders by multiple independent updates;
  a failure can leave a partially assigned order and concurrent calls can
  interleave.
- `b2b_service.py:447-458` selects the first quote item matching only
  `variant_id`. The API permits repeated variant lines, but there is no
  line-level identity/reference, so a work order can consume the wrong
  quoted line.
- `work_order_shortages` and `content_blocks` rely on read-then-insert checks
  without a database uniqueness guard.
- No general consistency job checks category/product, product/variant,
  variant/BOM/material, quote/version/project, project/work-order,
  reservation/reference, notification/reference, or balance/subject orphans.

## 7. Findings

### DB-001 — Notification collection has incompatible persistence schemas

- Severity: `P1`; status: `open`; confidence: 98%; category: schema consistency / duplicate prevention.
- Expected: one canonical notification schema with idempotent delivery and a
  stable read-state contract.
- Actual: `emailer.py:31-39` writes legacy email-shaped rows; the modern service
  writes a different row shape at `notification_service.py:92-109`.
- Evidence: `backend/emailer.py:31-39`; `backend/notification_service.py:68-109`;
  `backend/server.py:1378-1389`.
- Verification: `rg -n "notifications\.(insert_one|update_one)" backend`.
- Impact: legacy notifications bypass dedupe and `read_at` semantics; users can
  receive duplicates and see incorrect unread state.
- Probable cause: legacy fallback writer was not migrated to the modern
  notification contract.
- Recommendation: choose one schema, inventory/backfill legacy rows
  non-destructively, add a controlled dedupe/index plan, and keep raw email
  fields outside the feed.
- Acceptance: schema/type report is zero-drift; replay is one row per
  deduplication key; read/unread behavior and PII redaction pass on legacy and
  new rows.
- Dependencies/decision: approved notification/recovery data contract and
  retention owner.
- Human decision required: retention period and whether historical email rows
  remain readable or move to an archive projection.
- First/last SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.

### DB-002 — Password recovery violates the approved atomic cross-collection contract

- Severity: `P1`; status: `open`; confidence: 99%; category: transaction / recovery integrity.
- Expected: password update, session-version increment, token consume, and
  sibling invalidation commit atomically and fail closed when transactions are
  unavailable (`DEC-AUTH-003:69-88`).
- Actual: the current implementation performs separate token/user writes with
  no transaction guard (`server.py:495-508`, `529-550`).
- Impact: a crash can change a password while leaving a reusable token, or
  consume tokens while leaving the password unchanged.
- Verification: inspect the reset route and confirm no `session=`, guard, or
  transaction around the four writes.
- Recommendation: implement the approved transaction boundary only after
  separate implementation authorization and isolated replica-set tests.
- Acceptance: fail-closed `503`, single-use replay, sibling invalidation,
  session revocation, unknown-commit reconciliation, and no partial state.
- Dependencies/decision: DEC-AUTH-003 and proposed migration `007`; no `007`
  implementation exists in this checkout.
- Human decision required: implementation/rollout authorization and recovery
  retention/deletion owner.
- First/last SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.

### DB-003 — Direct transaction owners are not fully covered by the shared guard

- Severity: `P1`; status: `requires_revalidation`; confidence: 90%;
  category: transaction capability / fail-closed behavior.
- Expected: every transaction-required mutation has a shared capability probe,
  controlled `503 transaction_unavailable`, retry policy, and unknown-commit
  reconciliation.
- Actual: catalog, content, and inventory services call
  `start_transaction()` directly after a cached capability check; the runbook
  explicitly records later shared-guard adoption as pending.
- Evidence: `catalog_service.py:570-607`, `633-689`;
  `content_service.py:54-162`; `inventory_service.py:178-238`;
  `doc/TRANSACTION_CAPABILITY_RUNBOOK.md:145-156`.
- Impact: capability loss after startup can surface driver errors instead of the
  controlled contract; retry/unknown-commit behavior differs by domain.
- Recommendation: behavior-preserving guard adoption and real replica-set
  failure tests; do not add a non-atomic fallback.
- Acceptance: each affected operation rejects before writes, emits safe
  transaction events, and has explicit replay/reconciliation tests.
- Dependencies: ADR-001, runtime topology, operational owner.
- Human decision required: guard-adoption implementation approval.
- First/last SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.

### DB-004 — Cross-collection references and quote-line identity are not enforced

- Severity: `P1`; status: `open`; confidence: 91%; category: referential integrity.
- Expected: every reference resolves to the intended immutable parent/version and
  an operation identifies the exact quoted line.
- Actual: references are checked in services only; no database constraints or
  orphan scans exist. Work-order lookup matches the first item by
  `variant_id` only (`b2b_service.py:447-458`).
- Impact: duplicate quote lines or deleted/archived parents can cause the wrong
  price/material requirement or orphaned operational records.
- Recommendation: add stable line identity/reference, parent/version
  consistency checks, and non-destructive orphan reporting before migration.
- Acceptance: duplicate-line test, cross-collection consistency report, and
  no work order can resolve an ambiguous line.
- Dependencies/decision: approved B2B quotation/version policy; do not invent
  line semantics in a migration.
- Human decision required: confirm canonical line identifier and remediation
  policy for existing ambiguous data.
- First/last SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.

### DB-005 — Migration 005 targets collections explicitly retained by current authority

- Severity: `P1`; status: `blocked_by_decision`; confidence: 100%;
  category: migration scope / historical preservation.
- Expected: the removed Admin UI does not imply data deletion or archival;
  organization data remains valid until separately approved cleanup.
- Actual: `005_archive_orphan_collections.py:25-43` renames
  `organizations` and `organization_memberships` (and internships), while
  `DEC-OPS-002:20,33-34,64` says the collections remain untouched and any
  cleanup needs explicit approval.
- Impact: B2B organization access can break if the source names disappear;
  current live ownership/existence is unknown.
- Recommendation: do not execute; first inventory a named non-production
  database, prove no references, obtain explicit approval, and preserve a
  tested rename/restore plan.
- Acceptance: approved scope, dependency/orphan report, collision-safe rename,
  index recreation, and restore rehearsal.
- Human decision required: whether and when organization/internship cleanup is
  authorized; no production assumption is made here.
- First/last SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.

### DB-006 — Migration 001 is non-atomic and has no migration-owned rollback

- Severity: `P1`; status: `open`; confidence: 98%; category: migration safety.
- Expected: backup gate, dry run, validation, resumable/idempotent apply, and
  recoverable partial failure.
- Actual: `001_identity_rbac_audit.py:12-31` updates users one at a time and
  only creates indexes after all updates (`:34-52`); there is no marker,
  backup argument, audit trail, or rollback mode.
- First run/rerun: dry run is read-only and rerun usually skips users that now
  have `roles`; not a proof of complete recovery if a write or index step fails.
- Partial/rollback: partial user updates remain committed; no down migration.
- Legacy/large: unknown roles default to `retail_customer`; unbounded cursor
  and per-user writes are not tested for large populations.
- Recommendation/acceptance: require reviewed mapping, backup/restore gate,
  progress marker, bounded batches, and tested recovery before any apply.
- Human decision: migration ownership and legacy-role mapping approval.
- Evidence: `backend/migrations/001_identity_rbac_audit.py:12-52`.

### DB-007 — Migration 002 is dry-run/idempotent in fakes but unsafe for partial or large apply

- Severity: `P1`; status: `open`; confidence: 97%; category: migration safety / scale.
- Expected: collision preflight, backup gate, bounded/ resumable apply, index
  validation, and rollback/restore evidence.
- Actual: it loads at most `100000` materials, updates each candidate outside a
  transaction, and creates indexes after writes (`002_catalog_material_inventory.py:96-239`).
- First run/rerun: dry-run and deterministic-SKU collision checks are positive;
  a successful second run is a no-op in `test_catalog_material_inventory_migration.py`.
- Partial/rollback: a mid-loop failure leaves a subset changed; no down
  migration. Legacy references are preserved, but only tested in fakes.
- Legacy/large: >100,000 documents are not covered; mixed field types and
  live-index conflicts are unverified.
- Recommendation/acceptance: chunked checkpointed apply, full backup/restore,
  live-like duplicate/type preflight, and recovery rehearsal.
- Human decision: acceptable batch size/downtime and backup owner.
- Evidence: `backend/migrations/002_catalog_material_inventory.py:96-239`.

### DB-008 — Migration 003 has guarded per-account transactions but incomplete operational proof

- Severity: `P2`; status: `open`; confidence: 95%; category: migration safety / auditability.
- Expected: approved backup/restore proof, transaction readiness, accurate
  result reporting, idempotency, and constrained rollback.
- Actual: dry-run is read-only and apply/rollback are guarded, but indexes are
  ensured before account transactions and the returned report is computed
  before apply. There is no full-backup checksum/restore evidence in code.
- First/rerun: tested as idempotent in fakes; partial account batches can commit
  before a later account fails because each account is its own transaction.
- Rollback/legacy: rollback intentionally fail-closes roles rather than
  restoring legacy authority; this is safe only with approved recovery
  expectations.
- Large: one transaction per account scales better than a giant transaction,
  but live throughput/lock behavior is unknown.
- Recommendation/acceptance: record applied IDs/results, validate indexes before
  data mutation, and prove backup/restore plus representative failure cases.
- Evidence: `backend/migrations/003_identity_access_policy.py:204-386`;
  `backend/tests/test_identity_access_migration.py`.

### DB-009 — Migration 004 seed is not repair-safe after partial create/publish

- Severity: `P1`; status: `open`; confidence: 96%; category: seed/migration idempotency.
- Expected: rerun repairs only migration-owned incomplete seed state without
  creating duplicates or leaving drafts unexpectedly.
- Actual: `_seed_one()` skips any existing `(content_type,slug)` row; create and
  publish are separate calls (`004_content_blocks_seed.py:103-120`), and no
  unique index protects the pair.
- First/rerun: clean first run can create/publish; rerun skips. If create
  succeeds and publish fails, rerun leaves the draft forever.
- Partial/rollback/legacy/large: no rollback; existing content is never
  reconciled; seed is small but no test covers it.
- Recommendation/acceptance: migration-owned marker, unique key, repairable
  state machine, and tests for failure between create/publish.
- Human decision: whether existing slugs may be adopted or must remain untouched.
- Evidence: `backend/migrations/004_content_blocks_seed.py:103-120`.

### DB-010 — Migration 005 rename has no collision, dependency, or executable rollback guard

- Severity: `P1`; status: `blocked_by_decision`; confidence: 99%;
  category: migration rollback / historical preservation.
- Expected: dry-run proves source/destination state, references, indexes, and
  restore path before any rename.
- Actual: it counts and renames source collections but does not check an
  existing `_archived_*` target, does not recreate indexes, and only documents
  manual rollback (`005_archive_orphan_collections.py:25-43`).
- Partial failure: one collection can be renamed before a later rename fails;
  rerun reports source `not_found` rather than proving completed state.
- Recommendation/acceptance: block until DB-005 is resolved; add collision-safe
  plan, index capture/recreation, post-rename reference scan, and tested
  rollback.
- Human decision: explicit cleanup authorization and target ownership.
- Evidence: `backend/migrations/005_archive_orphan_collections.py:1-43`.

### DB-011 — Migration 006 has strong guarded atomicity but the backup/rollback contract is narrower than runbook expectations

- Severity: `P1`; status: `open`; confidence: 96%; category: migration backup/rollback.
- Expected: verified full backup, migration-owned backup with provenance/checksum,
  bounded apply, safe rollback that cannot overwrite later changes.
- Actual: `_write_backup()` writes a local plain JSON field backup and refuses
  overwrite (`006_granular_role_policy.py:101-127`); one transaction covers all
  plans (`:168-227`), but rollback updates by `id` without a version predicate
  (`:230-278`).
- First/rerun: dry-run is read-only; apply is idempotent when markers are
  present; second apply with no plans avoids rewriting the existing path.
- Partial/rollback: account changes/audit events are atomic inside one
  transaction, but the external backup file remains if the DB transaction
  aborts; rollback can overwrite post-migration edits.
- Legacy/large: reviewed mappings fail closed; one transaction for all planned
  accounts risks transaction size/time limits at scale.
- Recommendation/acceptance: require full backup/restore evidence, checksum,
  bounded batches or a proven size limit, and optimistic rollback predicates.
- Human decision: approved backup location, reviewer, and large-population
  execution window.
- Evidence: `backend/migrations/006_granular_role_policy.py:101-278`.

### DB-012 — Backup/restore utility is data-correctness useful but not a production restore procedure

- Severity: `P1`; status: `environment_blocked`; confidence: 98%;
  category: backup/restore / partial failure.
- Expected: verified, owned, encrypted backup with known environment, checksum,
  index metadata, restore isolation, and recoverable failure behavior.
- Actual: `migration_backup.py` captures every document in memory, stores
  per-collection digests, and `restore(..., allow_non_empty=True)` deletes and
  reinserts collections without transaction or index recreation
  (`migration_backup.py:45-153`).
- First/rerun: capture refuses overwrite and verify detects tampering; restore
  is guarded against populated targets unless explicitly overridden.
- Partial/rollback/large: a failure during delete/insert can leave a partially
  restored database; full-database memory loading is not proven for large
  datasets; there is no automatic rollback of a failed restore.
- Recommendation/acceptance: operator-owned encrypted backup system, index/
  options manifest, isolated restore rehearsal, chunked/streaming restore,
  failure recovery, and explicit downtime/writer isolation.
- Human decision: production backup owner, RPO/RTO, retention, and restore
  authority.
- Evidence: `backend/migration_backup.py:45-153`; real tests are skipped
  without explicit replica-set opt-in.

### DB-013 — Referential, uniqueness, and retention controls are incomplete

- Severity: `P1`; status: `open`; confidence: 93%; category: integrity/index/retention.
- Expected: duplicate prevention and orphan/retention checks for every
  customer, commercial, inventory, identity, audit, and notification record.
- Actual: multiple ID/singleton/reference keys lack unique indexes; no periodic
  orphan scan exists; reset tokens, audit events, contacts, notifications,
  outbox, and admin logs have no evidenced retention job.
- Evidence: startup indexes `server.py:1346-1418`; declarations
  `catalog_inventory_indexes.py:1-78`; auth retention decision
  `DEC-AUTH-009:45-54`.
- Impact: duplicates/orphans can be silently accepted, storage/PII can grow
  indefinitely, and the approved 90-day auth-event contract is not proven.
- Recommendation/acceptance: per-collection integrity/retention register,
  safe reports, TTL/deletion only after policy approval, and restore-aware
  deletion tests.
- Human decision: retention durations, legal hold, deletion owner, and
  backup interaction.
- First/last SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.

### DB-014 — Live schema, production topology, and test-database evidence are unverified

- Severity: `P1`; status: `environment_blocked`; confidence: 100%;
  category: environment / data assumptions.
- Expected: isolated replica-set proof, live `listCollections`/`listIndexes`,
  schema/type sample, consistency report, and verified backup/restore for each
  release environment.
- Actual: no live DB was queried; `mongosh` and `MONGO_TRANSACTION_TEST_URL`
  were unavailable; real transaction/backup modules skipped. Production
  ownership, dataset shape, and topology are unknown.
- Impact: repository evidence cannot prove first-run safety, index state,
  orphan absence, transaction capability, or restore readiness.
- Recommendation: execute only against a named disposable/staging target after
  approval; record redacted environment, timestamp/timezone, indexes, checksums,
  restore result, reviewer, and approval window.
- Acceptance: current reproducible evidence attached without customer data or
  secrets; no production assumptions inferred from this audit.
- Human decision: authorize environment and operator; never use an unclear
  database.
- First/last SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.

## 8. Migration execution-order and safety matrix

There is no migration ledger, dependency resolver, or single ordered runner.
The numeric order is a planning convention only. A safe non-production review
order is `001 → 002 → 003 → 004 → (005 blocked) → 006`, with a fresh full
backup/restore gate before each write-bearing migration. Migration `007` is a
proposal in `docs/implementation/specs/active/2026-07-27-admin-auth-phase-1-implementation-authorization-packet.md:237-260`,
not a file in this checkout.

| Migration | First run | Rerun | Partial failure | Rollback | Legacy format | Large data | Overall decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `001_identity_rbac_audit.py` | Conditional: dry-run only is safe; apply needs external backup/approval | Usually resumes users lacking `roles`; no completion marker | Unsafe: prior users remain changed; indexes may not exist | None in code; restore-only | Default unknown roles to customer role; requires reviewed policy | Unbounded cursor/per-user writes | Do not apply without redesigned gate |
| `002_catalog_material_inventory.py` | Conditional: collision/type preflight is good; apply is non-transactional | Good for successfully migrated rows; rerun no-op in fake test | Unsafe: mid-loop subset can commit; later index failure leaves writes | None in code; restore-only | Preserves IDs/order references and marks `needs_review` | `to_list(100000)` hard ceiling; no chunk/checkpoint | Rehearse only in isolated DB after backup |
| `003_identity_access_policy.py` | Conditional: dry-run and guard/owner checks strong | Good marker-based no-op in fake tests | Conditional: one guarded transaction per account, so earlier accounts can commit | Constrained fail-closed rollback, not legacy authority restore | Explicitly quarantines legacy/superseded roles | Per-account transactions; throughput unverified | Rehearse only with full backup/restore evidence |
| `004_content_blocks_seed.py` | Conditional: clean seed only; no unique index | Skips existing rows | Unsafe: create-success/publish-failure leaves draft and rerun skips | None | Existing content is not reconciled | Small fixed seed; no failure/scale test | Do not apply until repair semantics/test exist |
| `005_archive_orphan_collections.py` | Blocked by `DEC-OPS-002`; source/destination existence unknown | Misleading `not_found` after source rename | Unsafe: sequential renames can stop halfway | Manual rename instructions only; no tested guard | Non-destructive rename in theory, but dependencies unverified | Collection rename itself is bounded; index/reference scale unknown | Do not run |
| `006_granular_role_policy.py` | Conditional: dry-run, reviewed mapping, backup path, guard required | Good marker no-op when no plans | Strong inside one transaction; external backup artifact remains | Guarded field rollback, but no optimistic version guard | Fail-closed reviewed mapping; no customer role assignment | One transaction for all plans; size/timeout unknown | Rehearse only on isolated replica set |

### Migration audit trail

`003`/`006` write identity audit events, but there is no general migration-run
collection containing migration ID, environment, checksum, operator, start/end,
counts, failure phase, or approval window. `002` returns a report only; `001`,
`004`, and `005` do not persist a run record. This prevents reliable
post-hoc proof that a migration ran once, against which database, and with
which source/backup.

## 9. Backup, restore, retention, seed, and environment expectations

- Runbooks require backup → dry run → validation → controlled apply, but the
  code does not enforce a full backup gate for `001`–`005`; `006` enforces only
  a caller-supplied local field-backup path.
- Production backup system, encryption, retention, RPO/RTO, restore owner,
  legal hold, and monitoring are open. No production data or backup was
  inspected.
- `migration_backup.py` is useful as an isolated exercise and preserves
  BSON-aware values, but it is not proof of production restore capability.
- Startup `seed()` mutates users, materials, settings, and portfolio on normal
  application startup (`server.py:1346-1503`). These are operational writers,
  not versioned migrations; concurrent startup and existing legacy shape are
  not migration-gated.
- Seed/default data is not isolated by a dedicated test database in the normal
  server path. Real integration tests use generated database names only when
  explicitly opted in.
- Sensitive fields include password hashes/tokens, contact PII, supplier
  references, payment/file metadata, and internal commercial information.
  Projections are generally allowlisted, but retention and notification/audit
  storage are not complete.

## 10. Unverified production assumptions and blockers

The following are intentionally unknown, not negative production claims:

- whether each listed collection exists, is populated, or has extra legacy
  collections in production;
- actual live indexes, validators, collation, shard/replica topology, and
  feature flags;
- data type distribution for timestamps, decimals, IDs, legacy status values,
  and duplicate/reference conditions;
- whether any migration has already run in any environment;
- backup completeness, encryption, checksum custody, restore result, RPO/RTO,
  retention, legal hold, incident owner, and writer-isolation procedure;
- whether organization/internship collections contain historical or active
  data;
- whether current environment capability probe is transaction-ready.

Safe next step requires a named disposable or approved staging target, explicit
owner, read-only inventory command, and separate approval before any mutation.

## 11. Acceptance criteria and remediation sequence

Audit recommendations only; none authorize implementation or migration:

1. Create a redacted schema/index/reference inventory on an isolated named
   replica set; include counts/types/status distributions and orphan reports.
2. Define canonical collection schemas, immutable fields, line/reference IDs,
   unique indexes, query-aligned compounds, and retention owners.
3. Add migration-run audit metadata and make every migration expose dry-run,
   apply, validation, bounded progress, idempotent rerun, and rollback/restore
   behavior.
4. Rehearse each migration with legacy, duplicate, partial-failure, and
   large-volume fixtures; test restore and index recreation.
5. Replace incompatible notification/recovery writers only under approved
   implementation decisions; keep customer/internal projections default-deny.
6. Re-run real replica-set transaction, backup, and consistency tests; record
   evidence separately from this static audit.

Layer acceptance is not met for release-candidate recommendation while
DB-001, DB-002, DB-004, DB-005, DB-006, DB-007, DB-009, DB-011, DB-012,
DB-013, or DB-014 remain open/blocked.

## 12. Resume handoff

- Current audit state: `complete` for repository/static scope;
  `environment_blocked` for live/staging/production evidence.
- Completed: authority review; collection inventory; source-of-truth/writer/
  reader mapping; required/optional/type/status review; ID/reference,
  uniqueness/index/query alignment; transaction/fail-closed review; PII and
  customer/internal projection review; migration `001`–`006` safety matrix;
  backup/restore, seed, test isolation, and unverified-production register.
- Incomplete: live collection/index/schema query; real replica-set execution;
  migration rehearsal; production-like backup/restore; data-volume/orphan
  scan; owner/RPO/RTO/retention evidence.
- Last files inspected: `backend/migrations/001`–`006`,
  `backend/migration_backup.py`, `backend/catalog_inventory_indexes.py`,
  `backend/*service.py`, `backend/*domain.py`, `backend/server.py`, related
  tests and runbooks.
- Last command: focused pytest command recorded in §2; 51 passed, 3 skipped.
- Blockers: no authorized target database; no explicit real-test URL/opt-in;
  production data/backup/topology/ownership unknown.
- Findings requiring revalidation: all environment-blocked items, plus any
  source/authority/index/migration change.
- Next exact step: obtain separate approval for an isolated replica-set
  inventory/rehearsal, run read-only collection/index/type/orphan checks first,
  then attach redacted backup/restore evidence before considering any apply.
- Baseline SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`.
- Timestamp: 2026-07-28 03:43:13 WIB (UTC+07:00).

## 13. Changelog

### 2026-07-28 — Database/data-integrity audit

- Completed repository/static audit with `DB-` findings and collection matrix.
- Audited migrations `001`–`006`; recorded the proposed but absent `007` as
  unimplemented evidence only.
- Recorded safe fake-DB/unit verification: 51 passed, 3 real-topology tests
  skipped.
- No source, migration, data, database, dependency, commit, or push changed.
