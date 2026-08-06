# Feature 1.7 — Authentication Security Events Remediation

Date: 29 July 2026
Branch: `feat/backend-auth-security-events`
PR baseline: `e6d7e451208c5ef45e0f723c5fdb4645802a27fb` (`origin/main`)
Initial revalidation baseline:
`a2747aab58ae25536cab28f55415c5628559c27e`
Authority: `DEC-AUTH-009` and `DEC-AUTH-011`

Current-main integration: PR #90 merged as `1ada96a`. The feature remains
disabled by default; Migration 010, key custody, cleanup operations, alerting,
and production activation remain separately gated.

## Bounded outcome

The local candidate now has a dedicated strict authentication-event domain,
MongoDB storage port, HMAC-SHA256 pseudonymization boundary, 90-day expiry,
bounded cleanup service, lease-aware cleanup worker, deterministic alert
policy, provider-neutral alert outbox, readiness gating, and a staged
Migration 010.

Authentication integrations cover:

- generic Customer/Admin login failures and limiter blocks using
  pseudonymized unverified identifiers and peers;
- Customer login success as best-effort visibility;
- Admin login success in the same transaction as Admin-session creation;
- Customer/Admin session revocation and replay detection without exposing raw
  credentials or tokens;
- generic recovery-request processing;
- password-reset completion in the same transaction as token consumption,
  password mutation, and session revocation.

The feature is disabled by default. Enabling it requires a dedicated externally
injected HMAC key and an applied Migration 010 marker; otherwise readiness
returns unavailable. No analyst/read API or general Admin viewer was added.

## Implemented controls

| Control | Result |
|---|---|
| Dedicated schema/storage | `authentication_security_events` port and Mongo adapter; no general audit/notification reuse |
| Strict allowlist | Closed event/outcome/reason/subject/surface vocabulary and opaque scalar validation |
| Pseudonymization | Dedicated versioned HMAC-SHA256 key with subject/peer namespace separation |
| Secret minimization | API accepts no password, token, OTP, cookie, header, provider body, exception body, or free-text payload |
| Retention | `expires_at = occurred_at + 90 days`; application cleanup is primary |
| Cleanup | Maximum 1,000 records per run; lease-aware worker foundation; errors normalized |
| TTL defense | Migration 010 declares an `expires_at` TTL index but is not active/required yet |
| Reader boundary | No application read route or general role permission |
| Alerting | Approved thresholds, 15-minute fingerprint deduplication, provider-neutral outbox, 1/5/15/60-minute retry schedule, Critical/High SLA metadata |
| Transaction boundary | Admin-session issue and reset completion can fail closed with event persistence |
| Readiness | Enabled feature requires key/service readiness and Migration 010 marker |
| Historical safety | Migration 010 performs no backfill and refuses non-empty pre-existing dedicated collections |

## Verification

Focused command:

```text
backend/.venv/bin/python -m pytest -c backend/pytest.ini \
  backend/tests/test_auth_security_events.py \
  backend/tests/test_auth_security_alerts.py \
  backend/tests/test_auth_security_event_migration.py \
  backend/tests/test_auth_session.py \
  backend/tests/test_auth_recovery.py \
  backend/tests/test_auth_security.py \
  backend/tests/test_secure_cookie_sessions.py \
  backend/tests/test_reset_password.py \
  backend/tests/test_health.py -q
```

Result: `104 passed in 14.73s`.

Full backend regression result:

```text
617 passed, 12 skipped, 14 subtests passed in 20.27s
```

The tests cover allowlist rejection, pseudonym namespace separation, raw
dependency-error normalization, expiry, cleanup lease behavior, alert
threshold/deduplication/SLA metadata, Migration 010 dry-run/apply/idempotence/
rollback guards in memory, session/reset transaction hooks, login event
classification, adjacent auth regression, and readiness failure without key or
migration.

## Remaining production gates

- replace temporary role labels with named primary/backup security, privacy,
  cleanup-review, and alert/on-call owners;
- select and provision an external pseudonymization-key provider and prove
  custody, rotation, outage, and environment separation;
- authorize, rehearse, validate, and roll back Migration 010 on an approved
  isolated replica set; it was not run by this work;
- integrate and operate the cleanup scheduler with heartbeat, retry, deletion
  proof, backup expiry/filtering, capacity, and alert evidence;
- connect the alert outbox to an approved destination/provider and prove retry,
  dead-letter, delivery, SLA, escalation, and provider-outage behavior;
- add production-like multi-worker cleanup and real-Mongo transaction evidence;
- decide whether a later dedicated analyst API is necessary; none is currently
  authorized;
- capture exact-candidate deployment, monitoring, privacy, rollback, and smoke
  evidence before any production-readiness claim.

## Safety boundary

Migration 010 was created but not run. No `.env` file, key, alert provider,
shared database, deployment, production activation, or go-live state was
changed.
