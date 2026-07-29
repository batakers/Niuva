# PHASE-02A — Schema and Reference Report Plan

Status: **planning — ready for owner/reviewer review**
Phase / task: `PHASE-02A` / `TASK-02A-01`
Baseline: `919b05af47f2a235ea7ad11e05098bc5ea5a0ca4` (`origin/main`, 29 July 2026)
Task branch / worktree: `plan/phase-02a-schema-reference` /
`C:\Portfolio\Niuva\Niuva-phase-02a-schema-reference`

## Objective

Define the future, read-only and aggregate-only report required before any
notification schema migration. The report classifies legacy document shapes,
duplicate identities, broken references, retention eligibility, and ambiguity
without exposing customer data or modifying any record.

## Authority and traceability

- `docs/NIUVA_MASTER_SPEC.md` — notification is a shared foundation, and a
  notification failure must not roll back a successful core transaction.
- `docs/decisions/product/DEC-DATA-002-quote-line-identity-and-ambiguous-history.md`
  — ambiguity is preserved and blocks dependent mutation; it is never inferred.
- `docs/decisions/product/DEC-DATA-003-notification-schema-retention-and-delivery-boundary.md`
  — canonical general-notification/outbox boundary, 180-day notification and
  30-day terminal-delivery retention, temporary alert ownership, and exclusions.
- `docs/decisions/access/DEC-AUTH-009-authentication-security-event-governance.md`
  — authentication security events remain separate, redacted, and out of the
  general-notification store.
- `docs/implementation/production-readiness/FINDING_TRACEABILITY.md` —
  `BE-009`, `DB-001`, `INT-008`, `SEC-010`, `SRE-003`, and `SRE-008`.
- `docs/implementation/production-readiness/VERIFICATION_MATRIX.md` —
  `V-02-01`.

## Scope

The plan covers a future report over `notifications`, `notification_outbox`,
and `admin_notification_log`, plus read-only existence checks against the
allowlisted notification reference targets. It also defines the required
implementation/test slices after the report is accepted.

The following are explicitly out of scope: running the report against a shared
or production target; source or test changes; any migration, backfill, index
change, delete/expiry job, provider or scheduler activation; customer/UI scope;
and modifying authentication-event storage.

## Current-source shape inventory

| Collection | Observed shape / writer | Canonical disposition | Report classification |
| --- | --- | --- | --- |
| `notifications` | Legacy email writer has `to_email`, `subject`, `title`, `body_html`, `read`, and ISO `created_at`; modern publisher has `event`, allowlisted `reference_*`, `deduplication_key`, `read_at`, recurrence and timestamps. | Modern recipient-scoped shape is the future target under `DEC-DATA-003`; legacy remains preserved pending separate approval. | `modern_candidate`, `legacy_candidate`, `mixed_or_unknown`. |
| `notification_outbox` | Modern outbox has notification link, channel/recipient/payload, status/attempts, stable delivery key, retry/lease, and timestamps. Migration 007 records an older missing-field shape. | Separate delivery work; never a recipient feed. | `modern_candidate`, `missing_runtime_fields`, `mixed_or_unknown`. |
| `admin_notification_log` | Admin send records target, optional selector, subject/message, recipient count, delivery status, actor, and timestamp. One admin request can produce many notification/outbox records. | Minimum operational accounting only; not an audit viewer or canonical recipient store. | `metadata_candidate`, `mixed_or_unknown`; never infer one-to-one notification links. |

The report records counts by shape and field-presence/type only. It must not
emit document IDs, user IDs, email addresses, messages, HTML, payloads,
reference values, provider errors, tokens, or other raw customer data.

## Field and reference map for the future report

| Subject | Required aggregate checks | Safe outcome |
| --- | --- | --- |
| Notification identity | Missing/duplicate `id`; duplicate `deduplication_key` within a canonical candidate; missing recipient/event/timestamps; timestamp parseability and retention age. | Count each issue and mark affected shape blocked; do not merge, select, or delete documents. |
| Notification reference | For a modern candidate, count absent/unknown `reference_type`, absent `reference_id` where the type requires it, and non-existing target IDs. | Only test fixed allowlisted mappings: inquiry→`inquiries`, b2b_quote→`b2b_quotes`, b2b_project→`b2b_projects`, work_order→`work_orders`, retail_order→`retail_orders`, restock_alert→`restock_alerts`, material→`materials`, product_variant→`product_variants`. |
| Outbox link and delivery identity | Missing/duplicate outbox `id` or `delivery_key`; missing/non-existing `notification_id`; invalid state/attempt/timestamp/lease combinations; terminal-record retention age. | Count `orphan_outbox`, `duplicate_delivery_identity`, and `invalid_delivery_state`; never resend, release, or change lease state. |
| Admin communication log | Missing/duplicate log `id`, actor/timestamp parseability, prohibited payload/contact duplication, and retention age where measurable. | Report `unlinked_admin_log` separately; a broadcast log is not an orphan solely because it maps to multiple recipients. |
| Security separation | Presence counts for prohibited security-field names or nested structures in general notification/outbox/log records. | Any hit is a privacy stop condition; report category/count only and do not copy a value. |

## Report algorithm and stop rules

1. Run only on an explicitly approved isolated target with a read-only
   credential and an immutable target label. Refuse shared/staging/production
   targets and any target without confirmed read-only access.
2. Enumerate field-presence and BSON-type signatures per collection. Classify
   each document solely by the documented signatures above; do not infer a
   missing event, recipient, reference, timestamp, identity, or link.
3. Execute aggregate duplicate and existence checks using bounded queries.
   Emit a versioned JSON summary containing counts, target fingerprint, report
   time, collection totals, shape totals, issue-category totals, and final
   disposition only.
4. Return `blocked_ambiguity` if an unknown/mixed shape, duplicate identity,
   unreadable required timestamp, unresolvable reference, orphan outbox,
   prohibited security-field hit, or an unsafe target is found.
   `ready_for_review` is permitted only when all blocking counts are zero.
5. The report has no `--apply`, write, repair, resend, deletion, index, or
   backfill path. A future migration proposal may consume the aggregate report
   only after separate authorization, backup, dry run, validation, rollback,
   and restore gates.

## Follow-on implementation slices

1. **Report implementation (backend/data, medium):** add a pure read-only
   report command and aggregate-safe serializers. Acceptance: no write method
   is callable; output contains no raw record data.
2. **Report fixtures and verification (backend, medium):** seed isolated
   modern, legacy, mixed, duplicate, orphan, invalid-timestamp, and prohibited
   security-field cases. Acceptance: every ambiguity returns
   `blocked_ambiguity` and an aggregate-only category count.
3. **Canonical-contract reconciliation (backend/frontend, later):** only after
   report review and explicit implementation authority, align writers,
   recipient projection, expiry, and feed/outbox tests with `DEC-DATA-003`.
   This is not a migration authorization.

## Acceptance and verification

`TASK-02A-01` is ready for review when this plan has an authority-backed field
and reference map, aggregate-only output contract, negative cases, stop rules,
and an explicit handoff. `V-02-01` execution remains pending an approved,
representative isolated dataset; no test count or local source inspection is a
substitute for that evidence.

Before a later implementation PR, verify the report against synthetic fixtures
and an approved isolated target; review its diff for write calls and raw-data
output; and preserve backup/dry-run/rollback/restore gates before any data
transition.

## Remaining decisions and handoff

`DEC-DATA-003` does not select a delivery provider, scheduler/worker topology,
telemetry destination, alert channel, SLA, on-call rotation, or any customer
communication surface. `DEC-AUTH-009` security-event owner/storage/deletion
details remain separate.

Faiz is the owner for this planning handoff. A reviewer should verify that the
report cannot infer legacy data, cannot output customer data, and cannot be
run against an unapproved target. The next allowed action after review is the
separately authorized report-implementation slice, not a migration.
