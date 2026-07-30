# DEC-AUTH-012 — Admin Session Cross-Tab and Isolated Migration Drill

Status: **Approved Bounded Completion Decision**

Decision ID: `DEC-AUTH-012`

Decision date: 29 July 2026

Approval source: Explicit Project Owner approval of the recommended Admin
Session decision package, including forced cross-tab re-login and a Migration
009 drill only on a disposable replica set, on 29 July 2026.

Related decision: `DEC-AUTH-005`

## Decision

- Concurrent browser tabs do not coordinate or share Admin session credentials.
  If the same rotating secret is replayed, the backend revokes the session
  family and every affected tab must authenticate again on its next
  authenticated request or refresh.
- The frontend must clear in-memory Admin identity and CSRF state after a
  terminal `401`, then route protected Admin pages to `/admin/login`.
- Replay-family revocation must not be weakened to improve cross-tab
  convenience. `BroadcastChannel`, shared workers, local/session storage, and
  JavaScript-readable bearer or rotation credentials are excluded from this
  phase.
- Migration 009 may be exercised only against a disposable MongoDB replica set.
  Evidence must use a generated database name and unconditionally drop that
  database after the test. It must not use the local application database,
  shared, staging, or production data.
- Admin-session retention remains 90 days with controlled application cleanup.
  TTL deletion remains prohibited for the initial rollout. Cleanup defaults to
  250 records and is bounded at 1,000.
- Transaction unavailability, ambiguous migration state, or replay detection
  fails closed. No non-atomic fallback is allowed.
- A later production cutover will revoke existing Admin sessions and require
  every Admin to sign in again. Rolling back to bearer credentials or weaker
  session behavior is prohibited.

## Evidence boundary

This decision authorizes source-local browser evidence, generated-database
replica-set tests, documentation updates, and review through a pull request. It
does not authorize running Migration 009 on an application database, changing
`.env`, deploying, activating production, or merging the pull request.

## Production gates

Production activation remains blocked until the exact public origin, TLS and
trusted-proxy topology, target environment, monitoring and incident owners,
named operator and reviewer, maintenance window, backup custody and restoration
evidence, cutover communication, and explicit activation permission are
available.
