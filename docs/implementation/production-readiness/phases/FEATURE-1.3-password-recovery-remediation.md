# Feature 1.3 — Password Recovery Remediation Evidence

Evidence date: 29 July 2026
Branch: `fix/backend-password-recovery`
Baseline: `1200340f4eab634d608d331f3a830c7ccb258212`
Decision: `DEC-AUTH-003`

## Outcome

The locally authorized source-and-test remediation closes PR-001 and the
bounded test gaps in PR-003 from the read-only revalidation.

| Finding | Resolution | Evidence |
| --- | --- | --- |
| PR-001 | Missing email-provider configuration now returns a safe internal delivery error outside `development`, `local`, and `test`. The recovery module consequently invalidates the undelivered token while retaining the generic public response. Mock delivery remains explicitly limited to local/test environments. | Route tests prove production-shaped missing configuration invalidates the token and local test mode remains mocked. |
| PR-003 | The rollback fixture now snapshots both Admin and Customer session collections. Fault tests cover failure of undelivered-token invalidation and post-reset notification delivery. The real Mongo transaction test creates both session types and directly proves both are revoked with the password reset. | Focused unit/route tests and five repeated disposable Mongo concurrent-completion cases. |

No response now exposes provider details. Missing provider configuration emits
only the fixed server-side message `Email provider configuration is
unavailable`; it contains no email address, reset URL, token, password, provider
payload, or raw provider exception.

## Remaining gates

PR-002 remains open. Known accounts necessarily perform persistence and
delivery work that unknown accounts do not. An approved timing policy and
production-shaped statistical evidence are required before claiming controlled
account-enumeration timing. This remediation does not invent a delay or timing
threshold without the security owner's decision. A repository-wide search
found no approved minimum response duration, jitter policy, percentile bound,
measurement topology, or acceptance threshold for recovery timing;
`DEC-AUTH-001` explicitly keeps residual timing behavior separately gated.

PR-004 also remains open. No real provider was selected or activated and no
real email was sent. Production delivery requires an approved provider and
origin, target environment, monitoring and support owners, secret custody,
redacted evidence procedure, test recipient, test window, and explicit
execution permission.

## Verification evidence

Focused password-recovery packet after remediation:

```text
80 passed, 2 skipped in 18.50s
```

The two skips were the explicitly opt-in real-replica-set cases run separately.

Disposable real MongoDB recovery transaction and Migration 008 test packet:

```text
13 passed in 1.72s
```

The transaction test repeats concurrent completion five times. Each disposable
database directly proves exactly one completion, password and token-version
change, token consumption, Admin session revocation, and Customer session
revocation, then drops the unique database. Migration 008 was not run against
the application database.

Full backend regression:

```text
575 passed, 12 skipped, 14 subtests passed in 32.61s
```

Additional gates passed:

- Python compileall;
- critical Flake8 checks (`E9,F63,F7,F82`);
- Black checks for every changed Python file;
- isort with the repository's Black profile; and
- `git diff --check`.

## Authorization boundary

No application migration was run. No `.env`, shared/staging/production
database, real provider, real recipient, deployment, activation, commit, push,
pull request, or merge was changed. The only external-state test used an
already-available local Mongo replica set with unique automatically removed
databases.

Migration 008 and production delivery remain separately gated by their
documented prerequisites and explicit execution permission.
