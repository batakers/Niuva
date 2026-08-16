# Rate-Limiter Multi-Worker and Outage Evidence — 2026-08-16

Status: **disposable local proof passed; trusted-proxy topology, alerting,
and named ownership remain open**

This record answers the source-verifiable part of **SEC-002** from the
external full-stack audit (2026-08-14) — see
[EXTERNAL-FULLSTACK-AUDIT-2026-08-14-REMEDIATION-TRACKER.md](EXTERNAL-FULLSTACK-AUDIT-2026-08-14-REMEDIATION-TRACKER.md).

## What the finding actually asked for, and what was already true

SEC-002 says: *"The source contains rate limiting and abuse-control
foundations, but real Mongo multi-worker behavior, trusted-proxy/header
spoofing behavior, outage behavior, TTL/retention, monitoring, and
operational ownership remain unverified."* Reading the source before
writing any new test changed the scope of what was actually missing:

| Sub-claim | Finding before this work | Action taken |
| --- | --- | --- |
| Real Mongo multi-worker behavior | `backend/auth_rate_limit.py`'s `LoginRateLimiter` and `PublicRateLimiter` were already MongoDB-backed via one atomic `find_one_and_update` (not in-process memory, contrary to an older, unrelated decision-register note about a since-replaced `_rate_buckets` design). The only existing concurrency test (`test_auth_rate_limit.py`) raced `asyncio.gather` against a **fake in-memory collection guarded by an `asyncio.Lock`** — real for one process's coroutines, not for separate OS worker processes. | New test, real separate processes, real MongoDB (below) |
| TTL/retention | Already implemented: `backend/schema_manifest.py` declares `ttl_login_rate_limit` and `ttl_public_rate_limit` indexes (`expireAfterSeconds: 0`, keyed off each document's own `expires_at`). | Verified by reading source; not re-implemented |
| Trusted-proxy/header spoofing | `server.py`'s `client_ip()` returns `request.client.host` directly — there is no `X-Forwarded-For`/`X-Real-IP` trust boundary configured at all. This is correct **only** because no reverse-proxy topology has been decided yet (OPS-001 is still open); configuring a trust boundary before a topology exists would mean guessing which header a not-yet-chosen proxy will send. | Left open — genuinely blocked, not attempted |
| Monitoring/alerting on sustained blocking | No telemetry destination decided (SRE-001 is still open and blocked on the same kind of decision). | Left open — genuinely blocked, not attempted |
| Operational ownership | No named owner in any canonical document. | Left open — a decision, not a coding task |

So the part of SEC-002 that was actually a backend verification gap —
"does the limit really hold across workers, and what happens if MongoDB
is down" — is what this record closes. The rest stays open because it is
blocked on decisions this task does not have authority to make.

## Method

New test file: `backend/tests/test_rate_limiter_multiworker.py`, following
the same `NIUVA_RUN_REAL_TRANSACTION_TESTS=1` / `MONGO_TRANSACTION_TEST_URL`
opt-in convention as every other real-Mongo test in this suite, so it can
be committed permanently and run again by anyone with a real target
(local or CI), not just as a one-off manual exercise.

Target: a disposable, standalone local MongoDB 7.0.37 (Homebrew install;
Docker unavailable on this machine — see the same note in
[DISPOSABLE-BACKUP-RESTORE-EVIDENCE-2026-08-16.md](DISPOSABLE-BACKUP-RESTORE-EVIDENCE-2026-08-16.md)),
loopback port 27019, deleted after the run. No replica set was needed
here — `find_one_and_update` does not require transaction capability.

### Test 1 — real cross-process atomicity

Four separate OS processes (Python `multiprocessing`, `spawn` start
method — no forked/shared state, no shared event loop) each open their
own Motor client to the same disposable MongoDB and each attempt
`PublicRateLimiter.consume()` three times against the **same** rate-limit
key (`limit=5`), for 12 attempts total.

| Check | Result |
| --- | --- |
| Total attempts across all 4 processes | 12 |
| Allowed | Exactly 5 |
| Blocked (HTTP 429) | Exactly 7 |
| Every blocked outcome carries `Retry-After` via `429` | Yes |
| Result reproducible across 5 consecutive runs | Yes, identical 5/7 split every time |
| Disposable database dropped after the run | Verified programmatically in the test's own `finally` block |

Nothing in the test process itself serializes the four workers — only
MongoDB's atomic `find_one_and_update` can produce an exact 5/7 split
across genuinely separate processes.

### Test 2 — outage behavior (documentation, not a fix)

`PublicRateLimiter.consume()` was pointed at an unreachable Mongo address
with a short server-selection timeout.

| Check | Result |
| --- | --- |
| Behavior when MongoDB is unreachable | Raises `pymongo.errors.PyMongoError` (via Motor) — the request errors out rather than silently bypassing the limit |
| Is this a deliberately designed fail-open/fail-closed policy? | **No** — it is the current, unexamined side effect of an unhandled exception. Documented as-is; not changed |

This is deliberately evidence, not a fix: whether abuse control should
fail open or fail closed during a MongoDB outage is a security/product
decision, not something this task decided on its own.

## Verified

| Check | Result |
| --- | --- |
| `test_rate_limiter_multiworker.py` (both tests) | 2/2 passed, 5 consecutive runs |
| Full backend suite | 1036 passed, 16 skipped (one more skip than before: this file, correctly, when the real-Mongo opt-in is absent), 14 subtests, 0 failed |
| `py_compile` | Clean |
| `black --check` / `isort --check-only` on the new file | Clean |
| Disposable MongoDB process and data directory | Shut down and deleted after every run; port confirmed no longer listening |

## What remains open

- Trusted-proxy/client-IP header trust boundary — blocked on a
  reverse-proxy topology decision (OPS-001).
- Alerting/monitoring for sustained blocking — blocked on a telemetry
  destination decision (SRE-001).
- Named operational ownership for abuse-control incidents — a decision,
  not a coding task.
- A deliberate fail-open/fail-closed policy for the MongoDB-outage case
  above — currently an unexamined side effect, not a chosen design.
- Independent human review, per this session's standing practice for
  evidence records.
