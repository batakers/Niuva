# Feature 5.1 — CMS Publication Lifecycle Remediation

Date: 31 July 2026
Branch: `fix/backend-cms-publication`
PR: pending
Baseline: `7662a378c3acae6ecc9645b9c471dbb683aac80d` (`origin/main`)
Authority: `docs/NIUVA_MASTER_SPEC.md` section 10 and `ADR-005`

## Bounded outcome

The existing structured CMS lifecycle remains intact: draft authoring, review,
preview, immediate or scheduled publication, immutable public snapshots,
version history, rollback to a new draft version, and archive. This remediation
closes the verified optimistic-concurrency error seam around versioned CMS
mutations:

- concurrent publish and rollback attempts now produce one committed winner
  and one domain `409 version_conflict` instead of leaking a MongoDB driver
  error;
- update, transition, publish, rollback, and archive share the same
  expected-version conflict translation without retrying the business
  callback;
- a concurrent slug insert maps the unique-index race to the existing
  `409 slug_conflict` contract;
- publish, publication snapshot, version snapshot, aggregate state, and audit
  remain in one fail-closed transaction;
- scheduled publication requires a future timezone-aware datetime and
  normalizes accepted offsets to UTC; and
- route evidence confirms Content Editor can author but cannot publish or roll
  back, while Manager/Approver retains the approval boundary.

No lifecycle, role, schema, migration, public projection, content type, or
frontend behavior was expanded.

## Verification

Focused CMS, permission, and topology contracts:

```text
65 passed
```

Real local replica-set CMS evidence using three generated `niuva_tx_*`
databases, each removed in test cleanup:

```text
3 passed
```

The complete mandatory transaction matrix, including this new CMS file, also
passed locally against `rs0`:

```text
74 passed
```

These tests prove:

- concurrent publish has exactly one committed publication and audit event;
- concurrent rollback has exactly one new draft version and preserves the
  immutable active publication; and
- an injected audit insert failure rolls back the version snapshot,
  publication snapshot, and aggregate update.

Full local regression at the branch baseline:

```text
backend: 662 passed, 14 skipped, 14 subtests passed
frontend: 36 suites passed, 239 tests passed
```

The real tests used the existing local MongoDB `rs0` listener on port 27019
because Docker is unavailable on the host. The test file is also added to the
mandatory disposable `rs-test` CI workflow; local `rs0` evidence does not
replace that PR check.

## Remaining gates

This remediation does not authorize or complete:

- Migration 007 apply/rollback or any shared/staging/production data change;
- production topology, scheduler/worker, deployment, monitoring, backup,
  restore, release, production-readiness, or go-live evidence;
- B2B Organization Portal or project-to-portfolio promotion decisions under
  `DR-010`;
- new CMS content types, customer routes, role grants, or field/publication
  policy; or
- retirement of compatibility routes or static-content consumers.

Commit and PR publication are review artifacts only and do not grant any of
those authorities.
