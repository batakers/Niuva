# Feature 1.4 — Password Policy and Hash Migration Read-Only Revalidation

Status: **local foundation passes — policy conflict requires remediation; production gates open**
Feature: Password policy and hash migration
Baseline: `0ef4938ac3fd70f6ca771eb4ec06ed55bbc88746`
Branch: `feat/backend-password-policy`
Revalidation date: 29 July 2026

## Outcome

The canonical backend password module implements the approved 15–128 Unicode
code-point policy, 512-byte defensive cap, whole-value blocklist check,
Argon2id new-write gate, bcrypt/Argon2id verification compatibility, encoded
work parameters, and safe failure when the blocklist or write gate is
unavailable.

The feature is not complete. One active customer-provisioning path still calls
the legacy 12–72 UTF-8-byte policy before invoking the canonical module. Two
frontend credential-creation surfaces also hardcode 12–72 instead of consuming
`GET /api/auth/password-policy`. Production blocklist operations,
production-equivalent Argon2 benchmarking, hash-write activation, and deployed
rollback-floor evidence remain separately gated.

This audit changed no source, dependency, environment value, password, hash,
account, migration, provider, or shared data.

## Current control matrix

| Requirement | Current evidence | Result |
| --- | --- | --- |
| Canonical length policy | `auth_password.py` enforces 15–128 code points and at most 512 UTF-8 bytes | Pass in canonical module |
| Customer provisioning | `provision_client` first invokes the legacy 12–72-byte validator | Conflict — PP-001 |
| Password reset UI | Reads the backend policy and calculates code points and UTF-8 bytes | Pass |
| Admin customer creation UI | Hardcodes 12–72 UTF-8 bytes | Conflict — PP-002 |
| Staff invitation UI | Hardcodes 12–72 JavaScript string units and HTML limits | Conflict — PP-002 |
| Staff invitation backend | Uses the canonical `hash_new_password` seam transactionally | Pass |
| Whole-value blocklist | Operator-configured file adapter, case-insensitive whole-value comparison, fail closed when unavailable | Local pass; production blocked — PP-003 |
| Argon2id parameters | 19,456 KiB, time cost 2, parallelism 1, 32-byte hash, 16-byte salt | Approved local candidate |
| Argon2 local benchmark | Redacted harness passed on current ARM64 development machine | Local pass; production blocked — PP-004 |
| bcrypt compatibility | Existing bcrypt hashes verify and are marked `needs_rehash` | Pass |
| New hash gate | Disabled writes never fall back to bcrypt | Pass |
| Automatic migration | Login verification does not mutate bcrypt credentials | Safe staged boundary — PP-005 |
| Rollback floor | Current source verifies both bcrypt and Argon2id regardless of new-write gate | Source pass; deployment evidence blocked — PP-006 |

## Findings

### PP-001 — Customer provisioning still enforces the superseded 12–72-byte policy

Severity: **high consistency defect**

`server.provision_client` calls `password_policy.validate_password` before
calling canonical `hash_new_password`. The legacy module accepts 12-byte
passwords and rejects values over 72 UTF-8 bytes, while `DEC-AUTH-004` requires
15–128 Unicode code points with a 512-byte cap.

The canonical hash call eventually rejects a too-short value, but a valid
73–128-byte password can be incorrectly rejected by the legacy pre-check. The
result depends on which credential-creation route is used.

Required remediation: remove the legacy validator from the active path, make
the canonical backend module the only password-creation authority, remove or
retire the unused legacy module, and add route tests for 15-code-point,
73-byte, 128-code-point, 512-byte, and over-512-byte boundaries.

### PP-002 — Two frontend surfaces duplicate obsolete password constants

Severity: **medium contract defect**

Admin customer creation calculates 12–72 UTF-8 bytes. Staff invitation
acceptance uses `minLength=12`, `maxLength=72`, and JavaScript `.length`.
Neither reads the backend password-policy endpoint. JavaScript and HTML length
also count UTF-16 code units, not the approved Unicode code-point definition.

Consequences:

- valid long passwords can be blocked before reaching the backend;
- locally accepted short input is rejected by the backend;
- Unicode behavior differs by surface; and
- future policy changes can drift again.

Required remediation: use one reusable frontend policy adapter sourced from
`GET /api/auth/password-policy`, calculate code points with `Array.from` and
bytes with `TextEncoder`, retain paste/autofill/show-hide behavior, and keep the
backend authoritative when the policy endpoint is temporarily unavailable.

### PP-003 — Production blocklist dataset and operations are unavailable

Severity: **production blocker**

The file adapter and development fixture are intentionally present. The
fixture is explicitly not a production compromised-password dataset. No
approved production source, acquisition process, update cadence, integrity
verification, outage procedure, privacy treatment, storage/custody owner, or
monitoring owner is recorded.

Required decision and evidence: Security/Operations select the dataset and
owner, update/integrity procedure, deployment path, retention/privacy
treatment, failure alert, and recovery procedure. Do not commit the production
dataset or silently reuse the development fixture.

### PP-004 — Production-equivalent Argon2 resource evidence is missing

Severity: **production blocker**

The current candidate passes the local redacted benchmark, but the current
machine is CPython 3.12.13 on ARM64 with eight logical CPUs. It is not evidence
for the lowest supported production-equivalent instance, concurrent login
load, worker coexistence, memory pressure, or capacity budget.

Required evidence: exact target instance/runtime, accepted p50/p95/max latency,
memory/concurrency budget, sample/warm-up method, owner acceptance, and
rollback/disablement threshold. Candidate parameters must not be lowered below
the approved minimum merely to pass an unapproved budget.

### PP-005 — bcrypt-to-Argon2id migration is safely staged but not operationally complete

Severity: **rollout gate**

Successful bcrypt verification returns `needs_rehash=True`, but the login path
does not write a replacement hash. This matches the Phase 1 choice not to
perform opportunistic login-time rehash. Reset, invitation acceptance,
provisioning, and fresh bootstrap use Argon2id only when both the blocklist and
write gate pass.

Required decision: retain reset/new-write-only migration or approve a later
transactional login-time rehash contract. Define idempotency/concurrency,
eligibility re-check, write failure behavior, audit/privacy, monitoring, and
the point at which bcrypt creation and later verification may be retired.
Never perform a destructive bulk rewrite of passwords.

### PP-006 — Rollback floor is proven in source, not in the deployed artifact

Severity: **deployment blocker**

The current verifier accepts bcrypt and Argon2id even when new writes are
disabled. This is the correct rollback floor. There is no exact deployed
artifact/candidate evidence proving that an artifact available to operators
would retain Argon2id verification after any Argon2 credential exists.

Required evidence: identify and test the exact minimum rollback artifact,
disable new writes without disabling Argon2 verification, prove mixed-hash
login, document recovery ownership, and prohibit rollback below that floor.

## Local benchmark evidence

Command:

```text
cd backend
PYTHONPATH=. .venv/bin/python tests/test_auth_password.py \
  --samples 30 --warmups 5
```

Redacted result:

```text
argon2-cffi 25.1.0
CPython 3.12.13, arm64, 8 logical CPUs
Argon2id: memory=19456 KiB, time=2, parallelism=1
hash ms: min=19.740, p50=21.317, p95=22.709, max=23.395
verify ms: min=19.956, p50=21.167, p95=22.695, max=22.779
30 samples, 5 warm-ups, all samples match the candidate
```

Mixed invalid-verification comparison:

```text
PYTHONPATH=. .venv/bin/python tests/test_auth_password.py \
  --samples 15 --warmups 3 --mixed-hash-timing

Argon2id p50/p95: 241.724/246.972 ms
bcrypt p50/p95: 222.019/223.818 ms
p50 delta: 19.705 ms
p50 ratio: 1.089
within local comparison budget: true
```

Both reports exclude password fixtures and encoded hashes. These numbers are
local characterization only and do not approve production parameters.

## Test evidence

Focused backend password, identity, security, reset, and recovery packet:

```text
60 passed in 19.67s
```

Full backend regression:

```text
575 passed, 12 skipped, 14 subtests passed in 32.90s
```

Full frontend regression:

```text
32 suites passed, 229 tests passed in 3.319s
```

The current suites pass because they prove the implemented behavior; they do
not currently assert that every credential-creation frontend and backend path
derives from the same policy.

## Safe next implementation scope

Without production inputs, a bounded local remediation may:

- remove the legacy backend pre-validator from customer provisioning;
- retire the now-unused `backend/password_policy.py`;
- make Admin customer creation and staff invitation consume the public policy;
- add code-point/byte boundary and endpoint-failure frontend tests;
- add route-level backend boundary tests; and
- preserve the Argon2 write gate, bcrypt verifier, and no-login-rehash boundary.

It must not:

- add or download a production blocklist;
- enable or alter production environment values;
- lower Argon2 parameters;
- implement opportunistic login-time rehash without approval;
- rewrite stored password hashes;
- run migration against any account data; or
- claim production readiness from this local benchmark.
