# Notification Schema Report Preflight

Status: **Runbook — Approved Isolated Read-Only Target Required**

Authority:

- `DEC-DATA-003` defines the recipient-scoped notification, separate delivery
  outbox, retention, privacy, and legacy-preservation boundary.
- `DEC-AUTH-009` keeps authentication security events outside general
  notifications.
- `PHASE-02A-schema-reference-plan.md` defines the aggregate-only report and its
  ambiguity stop rules.

This runbook does not authorize representative-data access, migration, backfill,
index changes, repair, resend, expiry/deletion, shared/staging/production access,
deployment, production readiness, or go-live.

## Supported command

`backend/notification_schema_report.py` is the only supported operational entry
point. It reads its MongoDB URI from `NOTIFICATION_REPORT_MONGO_URL`; the URI is
never accepted as a command-line argument and is never included in output.

The command has two non-mutating modes:

- `--inspect-target` verifies the exact database name and MongoDB role, then
  returns a SHA-256 target fingerprint without reading report collections. Its
  output is inspection evidence only and cannot authorize a scan.
- `--evidence-manifest <path>` loads the approved representative-evidence
  metadata, verifies its deterministic dataset/snapshot/manifest-bound
  fingerprint, refuses a changed or substituted database object immediately
  before collection reads, and then runs the bounded report.

There is no apply, repair, backfill, delete, resend, index, or migration mode.

## Local synthetic verification

Activate the repository's backend virtual environment so `python` resolves to
its interpreter, then run from the repository root:

```bash
python -m pytest -n 0 -q \
  backend/tests/test_notification_schema_report.py
```

This proves source behavior only. It is not representative-data evidence.

## Representative execution gate

Do not connect the command to a non-synthetic dataset until an owner and an
independent privacy/data reviewer record all of the following:

1. dataset provenance and confirmation that it is an isolated copy;
2. exact database name and an immutable, non-sensitive target label;
3. a dedicated credential having exactly the built-in MongoDB `read` role on
   that database and no additional role;
4. a target topology fingerprint recorded independently in the approved
   environment or topology inventory, plus a match against the inspection-only
   output;
5. a JSON manifest containing exactly `dataset_id`, `snapshot_id`,
   `manifest_id`, `expected_fingerprint`, `read_only_credential_reference`,
   `custody_owner`, `reviewer`, `execution_window`, `evidence_location`, and
   `retention_policy`;
6. evidence custody, access, retention, and disposal handling;
7. an active execution window and stop/handoff owner.

The isolated snapshot must also contain exactly one matching record in
`notification_report_evidence_manifest` with `dataset_id`, `snapshot_id`,
`manifest_id`, and a content-derived `snapshot_fingerprint`. Preparing that
marker is part of the separately approved snapshot/custody process; this report
never creates or changes it.

`execution_window` contains exactly `starts_at` and `ends_at` as timezone-aware
ISO-8601 timestamps. The approved fingerprint is SHA-256 over canonical JSON
containing the inspection `topology_fingerprint` plus `dataset_id`,
`snapshot_id`, `manifest_id`, and the marker's `snapshot_fingerprint`. It must be calculated and recorded by the
approved inventory/custody workflow, not copied from report output. Missing,
malformed, mismatched, or inactive approval metadata blocks before collection
reads. `custody_owner` and `reviewer` must be different people. Window timestamps
must include an explicit UTC offset. Placeholder metadata is rejected. The
credential reference is evidence metadata only; the command separately verifies
that the connected MongoDB identity has exactly the built-in `read` role for the
target database. This interface does not authorize or perform a real execution.

Names or labels containing `shared`, `staging`, or `production`, or using `stage`
or `prod` as a delimited token, are refused. A safe-looking name is not proof of
isolation; recorded provenance, credential scope, and fingerprint approval are
still mandatory.

## Inspection-only command

After the approved secret-delivery mechanism has populated
`NOTIFICATION_REPORT_MONGO_URL`, run from the repository root:

```bash
python \
  backend/notification_schema_report.py \
  --database '<approved-isolated-database>' \
  --target-label '<approved-isolated-label>' \
  --confirm-isolated-target '<approved-isolated-label>' \
  --inspect-target
```

Do not paste the MongoDB URI into the command or store it in documentation.
Inspection must return `target_inspection_only`, `read_only_role_verified: true`,
`topology_fingerprint`, and `collections_read: 0`. Never approve a target merely
because inspection returned a topology fingerprint.

## Aggregate report command

Only after the preceding gate is recorded:

```bash
python \
  backend/notification_schema_report.py \
  --database '<approved-isolated-database>' \
  --target-label '<approved-isolated-label>' \
  --confirm-isolated-target '<approved-isolated-label>' \
  --evidence-manifest '<approved-manifest-path>'
```

Capture stdout only in the approved evidence location. The JSON contains
version/time, non-secret target identity, collection/shape/type/retention counts,
issue-category counts, and disposition. It never emits document identifiers,
recipient identifiers, addresses, messages, HTML, payloads, reference values,
provider errors, credentials, or security-field values.

Exit codes are deterministic:

| Code | Meaning |
| --- | --- |
| `0` | Successful inspection-only output or `ready_for_review` report. |
| `2` | Invocation, confirmation, manifest, target, role, fingerprint, or execution-window validation failure. |
| `3` | Completed report blocked by a data ambiguity or privacy stop. |
| `4` | Unexpected target-verification or report-execution failure; details are suppressed. |

Automation must distinguish inspection success from report success by
`disposition` and treat every non-zero code as a hard stop.

## Stop conditions

Stop and hand off without inspecting raw values when any issue is non-zero,
including:

- legacy, mixed, unknown, or invalid field/type shape, including an
  `unknown_field_signature` aggregate;
- an unknown payload path outside the writer-derived `subject`, `title`, and
  `body_html` allowlist, or an invalid type for one of those known fields;
- duplicate notification, deduplication, outbox, delivery, or log identity;
- missing, orphan, or aggregate-count-mismatched
  notification/outbox/reference/log relationship;
- invalid timestamps, delivery state, attempt, or lease;
- a prohibited authentication/security field;
- admin-log message, payload, or recipient/contact duplication;
- a scan-limit hit, changed fingerprint, broader credential, or unsafe target.

Field names are normalized across acronym, camel/Pascal, snake, kebab, case,
space, and repeated-separator variants before privacy matching. Unknown paths
are normalized, deduplicated, sorted, and hashed without values. A known schema
stops at the first unknown parent (for example,
`payload.future_metadata`); it does not enumerate arbitrary child content.
Nested privacy traversal is bounded and a depth-limit hit blocks rather than
failing open.

A privacy hit stops before later collections are read. `ready_for_review` means
only that this approved isolated dataset contained no detected issue. It does
not authorize migration or establish production readiness.

The report streams one document at a time, retains only the minimum identity,
reference, timestamp, state, and type evidence needed for aggregation, and stops
on the first privacy hit. It does not bulk-load raw message, HTML, recipient,
payload, or provider-error content into the retained report working set.

Retention-eligibility totals are informational aggregate counts. They do not
authorize deletion and do not alone make a readable record ambiguous; an
unreadable retention timestamp remains a blocking issue.

## Handoff

Retain only the aggregate JSON, command version/SHA, execution time, and the
approved `dataset_id`, `snapshot_id`, `manifest_id`, `expected_fingerprint`,
`read_only_credential_reference`, `custody_owner`, `reviewer`,
`execution_window`, `evidence_location`, and `retention_policy`. Do not retain a
MongoDB URI, terminal history containing a URI, or raw records in tickets, pull
requests, chat, or documentation. Any later transition requires separate
migration authority, backup, dry run, validation, rollback, restore, and
historical-preservation review.
