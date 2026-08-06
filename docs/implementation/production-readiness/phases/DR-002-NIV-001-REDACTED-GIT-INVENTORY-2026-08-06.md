# DR-002 — NIV-001 Redacted Git and Repository Inventory

<!-- markdownlint-disable MD013 -->

**Status:** `EVIDENCE_ONLY` / `NOT INCIDENT CLOSURE`
**Prepared:** 2026-08-06 12:02 WIB (Asia/Jakarta)
**Observed baseline:** `origin/main` at `9f6fe38398836b44158783684d23e6455c3cc6c2`
**Repository:** `batakers/Niuva` (public)
**Evidence rule:** No credential, token, cookie, authorization header, raw
scanner match, secret-manager output, or secret-bearing line is retained.

## 1. Purpose and authority boundary

This is a current, read-only inventory for DR-002/NIV-001. It records counts,
paths, commit prefixes, hashes, and result states only. It does not authorize
credential access, revoke/rotate actions, history rewrite, force-push, ref or
worktree deletion, GitHub Support requests, or a `Verified` status.

The applicable procedure remains
[`NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md`](../../../runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md).
The runbook requires revocation/rotation evidence before any rewrite and
requires independent verification before incident closure.

## 2. Remote repository and GitHub surface snapshot

The following values were collected read-only from `origin` and GitHub CLI.
Identities and response bodies not needed for the counts were not retained.

| Surface | Redacted result | Interpretation |
| --- | --- | --- |
| Default branch / head | `main` / `9f6fe38` | Current main includes the merge of PR #180. |
| Remote heads | `43` | Branch names and SHAs require a fresh freeze inventory before any operation. |
| Remote tags | `0` | No remote tags were advertised at collection time. |
| Open pull requests | `0` | This satisfies the count observation only; it is not an approval to rewrite. |
| All pull requests | `180` total; `176` merged | Historical PR refs remain a separate contamination surface. |
| PR head refs | `168` | `refs/pull/*/head` was observed through the Git remote; cached views and server-side objects remain unverified. |
| Forks | `0` metadata / `0` API results | A current zero count does not prove absence of old clones or backups. |
| Rulesets | `0` | No ruleset was returned by the read-only API query. |
| Main branch protection | `not returned (HTTP 404)` | No protection response was available in this query; do not infer a setting change. |
| Collaborator accounts | `3` count only | Login identities were intentionally withheld; clone disposition is unknown. |

The earlier G2 source/alert change is now reachable through PR #180. The
source merge does not remediate the credential incident or its external
history surfaces.

## 3. Local Git and worktree snapshot

| Surface | Redacted result | Limit |
| --- | --- | --- |
| Local branches | `147` | Branch names/owners were not copied into this evidence artifact. |
| Local tags | `0` | This is the current checkout's local ref namespace only. |
| Registered worktrees | `93` | Worktree paths are omitted from the retained artifact. |
| Worktree state | `73` clean, `20` dirty, `0` missing, `6` detached | Dirty-work ownership and disposition are not known. No worktree was changed. |
| `git fsck --full --no-reflogs` | exit `0` | No missing or unreachable object lines were reported. |
| Dangling objects | `219` | Dangling objects are not proof of contamination or cleanup; do not delete them without a separate approved retention/cleanup decision. |

The dirty main worktree and unrelated worktrees remain untouched. The count
does not replace owner-by-owner quarantine or fresh-clone acknowledgments.

## 4. Introducing-commit and redacted scan evidence

The runbook records introducing commit
`a75dc92b46e6d0f6f1820a4d1123c17bffdcca84`. The current checkout's object
database does not contain that commit, so no ref contains it in this checkout.
This is only local object evidence. It is not proof that the audited value is
absent from GitHub PR refs, cached views, forks, old clones, backups, or other
repositories.

A pinned Gitleaks binary was run against the current Git history with
`--redact=100`, `--log-opts=--all`, and a report outside the repository:

| Field | Result |
| --- | --- |
| Tool | Gitleaks `8.30.1` |
| Tool SHA-256 | `17157e2ee8b76fc8b1d8bee607a250e34b8a8023c8bc81822d4b5ee4d78fcb7c` |
| Exit code | `1` |
| Findings | `2` redacted `generic-api-key` findings |
| Paths | `PRODUCT.md`; `doc/PRODUCTION_DEPLOYMENT.md` |
| Commit prefix | `d595b7d9f251` |
| Report SHA-256 | `322e4e3e004980e3a26e45e451dd448377a0093f09572b0a56e356c368fe824b` |
| Retained report | Temporary path outside repository; retention/destruction remains an owner decision |

The two findings are **unresolved potential findings**, not automatically
classified false positives. A value-free structural review recorded no
placeholder marker, environment-variable reference, or URL on either finding
line; both are therefore retained as `credential-like-documentation` pending
owner review. The source commit subject was `docs: propagate approved
architecture decisions` and only the file/line hashes are retained here.
An owner must review them through a secret-safe process and record a redacted
disposition before any closure claim.

The read-only GitHub secret-scanning alert endpoints returned HTTP `404` for
both `open` and `resolved` queries in this session. No authoritative alert
inventory was returned; this must not be interpreted as proof that no alerts
exist.

The runbook's exact-value history scan was not run because the recorded
introducing object is absent from this checkout and no credential value was
inspected or reconstructed.

## 5. Non-production verification performed

The following command ran against the current `origin/main` worktree with no
credential or external service value supplied:

```text
$env:PYTHONPATH='backend'
python -B -m pytest `
  backend/tests/test_auth_security.py `
  backend/tests/test_auth_security_events.py `
  backend/tests/test_auth_security_alerts.py `
  backend/tests/test_auth_security_event_migration.py `
  backend/tests/test_permissions.py `
  backend/tests/test_identity_foundation.py `
  backend/tests/test_b2b_customer_projection.py `
  backend/tests/test_auth_password.py `
  backend/tests/test_auth_rate_limit.py `
  backend/tests/test_auth_recovery.py `
  backend/tests/test_auth_session.py `
  -n 0 -q
```

Result: **`175 passed`** in `21.44s`.

This validates bounded local source behavior only. It does not prove
credential revocation, controlled authentication with a newly provisioned
account, remote history cleanup, GitHub Support action, clone disposition,
backup retention, or independent verification.

A presence-only check for `NIUVA_TEST_ADMIN_EMAIL`,
`NIUVA_TEST_ADMIN_PASSWORD`, `E2E_SUPER_ADMIN_EMAIL`,
`E2E_SUPER_ADMIN_PASSWORD`, and `REACT_APP_BACKEND_URL` returned `false` in
the current process, machine, and user environment scopes. No values were
read. This proves only that this host has no injected test configuration; it
does not query or disprove an external secret manager reference.

## 6. Current gate outcome

| Gate | Result |
| --- | --- |
| Read-only Git/GitHub inventory | `PARTIAL_PASS` — current counts recorded; freeze/owner inventory not established |
| Redacted secret scan | `BLOCKED_BY_UNRESOLVED_FINDINGS` — two credential-like Gitleaks findings require owner review; GitHub alert API inventory returned `404` |
| Old credential revocation/rotation | `NOT RUN` — no credential value or secret manager accessed |
| Controlled non-production authentication | `NOT RUN` — required local config names were absent and no approved external account/config reference was supplied |
| History rewrite/publication | `NOT RUN` — no isolated rewrite approval or exact-value evidence |
| Independent verification | `NOT RUN` |
| NIV-001 / DR-002 | `OPEN` / `HUMAN_DECISION_BLOCKED` |

No evidence in this inventory changes the accepted-risk expiry of
**2026-08-30** or removes the P0 release/go-live block.

<!-- markdownlint-enable MD013 -->
