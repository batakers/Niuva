# Feature 1.5 — Authentication Rate Limiter Revalidation

Date: 29 July 2026  
Branch: `feat/backend-auth-rate-limit`  
Baseline: `d54ceec3d43cb5f86a032d8dff38c0dcece3e215` (`origin/main`)  
Review mode: source, decision, schema, and isolated-test revalidation only

## Outcome

The bounded application implementation is substantially present and matches
the runtime and thresholds approved by `ADR-005`: MongoDB-backed counters,
five failed attempts per normalized account and twenty per peer address in a
fixed fifteen-minute window. Account and peer identifiers are stored only as
HMAC-SHA256-derived keys. Limited responses are generic HTTP 429 responses
with `Retry-After`.

This is not production-readiness approval. Real shared-store concurrency,
store-outage behavior, production proxy topology, index application, retention
operations, monitoring, and operational ownership are not evidenced by this
review.

## Decision reconciliation

`DEC-AUTH-002` and `DEC-AUTH-006` preserve the historical deferral and the
provider-neutral privacy/interface requirements. Their unselected store and
login-threshold state is superseded for this bounded implementation by
`ADR-005`, which explicitly selects MongoDB and:

- account limit: 5 failures;
- peer-address limit: 20 failures;
- fixed window: 15 minutes; and
- forwarded headers ignored unless explicitly trusted.

No decision inspected by this review selects store-outage behavior, a
production trusted-proxy chain, monitoring/alert ownership, or production
activation.

## Requirement matrix

| Requirement | Evidence | Result |
|---|---|---|
| Distributed atomic limiter | `LoginRateLimiter` and `PublicRateLimiter` use MongoDB single-document `$inc` upserts; `ADR-005` selects MongoDB | Present in source; real multi-worker MongoDB race evidence missing |
| Account and IP dimensions | Login enforcement and failure recording use normalized account and direct peer address dimensions | Pass |
| Trusted-proxy handling | `client_ip()` uses only `request.client.host`; application code does not consume forwarded headers | Safe default passes; production proxy contract/evidence remains open |
| Generic HTTP 429 | Login limiter uses one non-enumerating Indonesian error detail for account and peer exhaustion | Pass |
| `Retry-After` | Both limiter implementations return seconds remaining in the current fixed window | Pass |
| Identifier privacy | Keys use secret-keyed HMAC-SHA256; raw account and peer identifiers are not stored in limiter documents or limiter logs | Pass in inspected source |
| Retention | Schema manifest declares expiry TTL indexes for both limiter collections | Declared only; migration/application and deletion evidence not produced |
| Thresholds | Constants match the `ADR-005` 5/20/15-minute contract | Pass |
| Store outage | Database errors propagate; no approved operation-specific fail-open/fail-closed contract or explicit response mapping was found | Open decision and fault-test gap |

## Verification

Command:

```text
backend/.venv/bin/python -m pytest -c backend/pytest.ini \
  backend/tests/test_secure_cookie_sessions.py \
  backend/tests/test_reset_password.py \
  backend/tests/test_auth_security.py -q
```

Result: `23 passed in 14.76s`.

The passing isolated tests cover login exhaustion, generic auth behavior,
`Retry-After`, recovery limiting, and adjacent session/auth contracts. The test
named as an atomic limiter contract uses an in-memory test collection and does
not prove cross-process atomic budget enforcement against a real MongoDB
deployment.

## Remaining acceptance work

1. Add an isolated real-MongoDB concurrency test covering simultaneous failed
   attempts from multiple limiter/service instances.
2. Record and test the approved store-outage behavior for customer login,
   Admin login, and recovery separately.
3. Add explicit negative tests proving spoofed `Forwarded` and
   `X-Forwarded-For` values never change the application limiter key in the
   current direct-peer policy.
4. Validate the limiter TTL indexes in an approved isolated schema environment;
   do not run a production migration from this feature.
5. Assign monitoring, incident-response, privacy-retention, and cleanup owners,
   then capture redacted operational evidence.
6. Validate the authoritative peer-address behavior behind the selected
   production ingress/proxy topology.

## Safety boundary

This revalidation did not run migrations, modify `.env`, select infrastructure,
deploy, activate production behavior, commit, push, or open a pull request.
