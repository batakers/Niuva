# PHASE-02A — Notification Canonical Schema Task Card

Status: **bounded source and reconciliation review complete — current-head CI
and merge pending; operational activation excluded**
Selected baseline: `a2b7be0d445cf3a338d91cf74841e3bf8be11a91`
(`origin/main`, 2 August 2026, Asia/Jakarta)

Reconciliation baseline: `a98463a3b8a7139a5340e6955672b6b3d4a9b461`
(`origin/main`, checked 3 August 2026, Asia/Jakarta)
Branch / worktree: `feat/backend-notification-schema` /
`Niuva-worktrees/backend-notification-schema`

## Objective

Make every new general notification use the versioned, recipient-scoped
canonical contract approved by `DEC-DATA-003`, while preserving bounded
readability for unambiguous historical records and refusing unsafe projections.

## In scope

- Canonical schema version, immutable notification ID, recipient identity,
  allowlisted references, reader state, deduplication identity, recurrence
  metadata, and 180-day expiry metadata.
- Atomic deduplication for concurrent publishers.
- Recipient- and expiry-scoped feed, unread count, and mark-read operations.
- Allowlisted response projection and fail-closed compatibility for recognized
  historical notification shapes.
- Removal of the legacy notification persistence side effect from the email
  transport boundary.
- Focused notification, Admin notification, inventory, and regression tests.

## Explicit exclusions

- No migration, backfill, rewrite, deletion, repair, TTL/index activation, or
  mutation of historical records.
- No representative/shared/staging/production data access or execution.
- No provider, scheduler, telemetry, alert destination, SLA/on-call,
  deployment, production-readiness, or go-live change.
- No new recipient categories, directory, campaign surface, customer UI, or
  authentication-security-event integration.
- No merge of dependency PR #102.

## Authority and dependencies

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/decisions/product/DEC-DATA-003-notification-schema-retention-and-delivery-boundary.md`
- `docs/decisions/access/DEC-AUTH-009-authentication-security-event-governance.md`
- PR #102 merged as `e5376b9`; its aggregate report and representative-data
  execution gates remain separate from this runtime slice.
- User authorization on 2 August 2026 permits implementation, commit, push,
  and pull-request creation for this bounded source slice. On 3 August 2026,
  the Project Owner separately authorized the recommended PR reconciliation and
  merge sequence. Neither authorization permits excluded operational/data
  actions.

## Acceptance criteria

1. New notifications have exact integer `schema_version = 1`, immutable `id`,
   non-empty `user_id`, safe title/body/event values, allowlisted reference,
   deterministic recipient-scoped deduplication, `read_at`, recurrence fields,
   timestamps, and `expires_at = created_at + 180 days`.
2. Concurrent publication of the same condition produces one notification and
   increments its occurrence count without changing its ID or reopening its
   reader state. It must remain atomic before the separately gated Migration 007
   unique deduplication index is active.
3. Feed/count/read mutations are recipient-scoped and exclude expired records.
4. API projection exposes only the canonical safe field allowlist and derives
   deep links from allowlisted references.
5. Recognized historical records remain readable only when recipient ownership
   and safe fields are unambiguous, are explicitly labeled
   `versionless_modern`, and are never projected as schema v1; mixed/unknown
   records fail closed and never leak raw legacy email/HTML/contact fields.
6. Email transport no longer creates legacy notification documents.
7. No migration, collection cleanup, index mutation, or external data access is
   introduced.

## Verification and delivery gate

- Focused canonical schema, notification feed, Admin notification, inventory,
  and email tests.
- Full backend regression suite, compile, formatter check, dependency check,
  `git diff --check`, and final security/diff review.
- Commit, push, PR reconciliation, and merge only when all required local and
  current-head CI gates pass.

## Remaining risks

- Representative historical shapes are not yet evidenced; compatibility is
  limited to synthetic, explicitly recognized shapes.
- Historical backfill and retention deletion require a separate approved
  migration procedure after the aggregate report gate.
- Recurrence retains the existing product behavior: an already-read
  notification remains read.
- Mixed historical-shape filtering can scan more rows than the returned feed
  limit; production capacity and latency remain unverified operational gates.

## Local verification — 2 August 2026

- Focused notification/Admin/inventory/password-recovery integration:
  `63 passed`.
- Full backend suite: `684 passed, 14 skipped, 14 subtests passed`.
- Backend compile, Black check for every changed Python file, `pip check`, and
  `git diff --check` passed.
- Manual security review covered recipient ownership, public-field allowlist,
  hostile references, dedup key consistency and delimiter ambiguity, concurrent
  atomic upsert, immutable identity/expiry, recurrence ordering, legacy email
  exclusion, versionless compatibility labeling, and expired/unknown fail-closed
  behavior.
- Reconciliation review removed the inactive-index dependency from concurrent
  writes by binding each new canonical row to a deterministic internal `_id`;
  the public immutable notification ID remains separate and unchanged.
- No migration, index/TTL mutation, representative/shared/staging/production
  access, deployment, or provider activation was performed.

## Reconciliation verification — 3 August 2026

- Focused RED reproduced reliance on a separately gated deduplication index;
  GREEN passed after the deterministic internal `_id` boundary was added.
- Notification schema report plus canonical feed/Admin/inventory/password
  recovery matrix: `187 passed`.
- Black and Python compile checks passed for the changed Python scope.
- Current `main` through PR #112 was merged without source conflict. The final
  delta remains the ten PR #103 paths; the Document Register conflict preserves
  both notification and merged Portfolio evidence.
- No migration, external database, representative dataset, provider activation,
  deployment, production-readiness, or go-live action was performed.
