# PHASE-02A — Notification Schema Report Hardening Task Card

Status: **local implementation and self-review complete — representative execution gated**
Selected baseline: `a2b7be0d445cf3a338d91cf74841e3bf8be11a91` (`origin/main`, 2 August 2026)
Branch / worktree: `feat/backend-notification-schema-report` /
`Niuva-worktrees/backend-notification-schema-report`

Title and user outcome (objective): Harden the notification schema report so
invalid, privacy-sensitive, or unverified targets cannot produce false-green
representative evidence.

In scope (paths/behaviour): `backend/notification_schema_report.py`, its focused
tests, an executable read-only runner, and an aggregate-only runbook; validate
document types, outbox state/attempt/lease combinations, admin-log payload or
contact duplication, target identity, authenticated MongoDB read-only roles,
privacy stop behavior, and reproducibility metadata.

Out of scope / files that must not change: Notification writers or customer UI;
schema migration, backfill, index, repair, resend, expiry/deletion, provider,
scheduler, telemetry, deployment, shared/staging/production execution, and
representative-data execution.

Authority / approved decisions / runbook: `docs/NIUVA_MASTER_SPEC.md`,
`DEC-DATA-003`, `DEC-AUTH-009`, and
`PHASE-02A-schema-reference-plan.md`; this task card does not expand their
authority.

Affected areas: Backend notification preflight, privacy boundary, data evidence,
and `V-02-01` traceability.

Contract or dependency (if any): Representative execution requires an explicitly
approved isolated database, immutable expected database identity, authenticated
read-only credential evidence, and the complete dataset/snapshot/manifest,
credential-reference, custody, reviewer, execution-window, evidence-location,
and retention-policy manifest.

Done when: Every documented ambiguity blocks; output contains only aggregate
counts plus non-secret reproducibility metadata; the runner fails closed before
collection reads when target or role verification fails; focused tests pass.

Verification: Focused report/runner tests, relevant notification tests, compile,
`git diff --check`, and diff inspection for write paths or raw-data output.

Owner and verifier: Faiz is Driver/temporary notification owner; independent
privacy/data review remains required before representative execution or merge.

Commit/push/PR permitted? No — local changes and handoff only unless separately
authorized.

Risks or open decisions: No representative target, credential, target fingerprint,
data custody, or execution window is approved. Any privacy hit or ambiguity must
stop the report; migration and production status remain open.

## Local handoff — 2 August 2026

- Changed: report version 3; exact integer schema version `1`; acronym-aware
  privacy field matching with bounded nested traversal; strict top-level and
  payload allowlists with hashed field/type and unknown-path signatures;
  writer-derived outbox state/channel/type validation; complete
  representative-evidence manifest and execution-window gate; database-object
  plus observed snapshot-marker binding; credential-reference, retention-policy,
  and independent custodian/reviewer gates;
  deterministic exit codes; aggregate-safe output; and synthetic tests.
- Intentionally unchanged: notification writers/feed/UI, migrations, indexes,
  historical records, provider/worker configuration, and every environment.
- Verification: focused notification/report/admin/inventory matrix `162 passed`;
  full backend `786 passed, 14 skipped, 14 subtests passed`; Black, compile,
  `pip check`, and `git diff --check` passed. No representative target was
  contacted.
- Re-review scope: exact-version rejection; compound privacy normalization;
  strict modern/legacy separation; writer-derived admin metadata types; observed
  snapshot-marker matching; timezone/independent-reviewer gates; deterministic
  unknown-field aggregation; all writer-reachable outbox states plus invalid
  representatives; manifest missing/invalid/mismatch/window gates; exit-code
  behavior; and database substitution before collection reads.
- Not run: representative dataset, shared/staging/production target, migration,
  backup/restore, deployment, and browser checks.
- Git delivery: local uncommitted work only; commit, push, PR, and merge remain
  unapproved.
