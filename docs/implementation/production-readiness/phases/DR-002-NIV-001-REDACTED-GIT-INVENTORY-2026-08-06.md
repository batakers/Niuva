# DR-002 — NIV-001 Redacted Git and Repository Inventory

<!-- markdownlint-disable MD013 -->

**Status:** `EVIDENCE_PLUS_OWNER_EXCEPTION` / `CURRENT SNAPSHOT` / `NOT INCIDENT CLOSURE`
**Prepared:** 2026-08-06 13:43:09 WIB (Asia/Jakarta)
**Observed baseline:** `origin/main` at
`f43eea6bd633b4250180e4373a62e5fb21fe14fa` (`f43eea6`)
**Observed tree:** `6d2154bd52785bbc749345c0346651f9752d1646`
**Collection timestamp:** `2026-08-06T06:43:09Z`
**Repository:** `batakers/Niuva` (public)
**Evidence rule:** No credential, token, cookie, authorization header, raw
scanner match, secret-manager output, or secret-bearing line is retained.

## 1. Purpose and authority boundary

This is a timestamped, read-only re-inventory for DR-002/NIV-001. It records counts,
paths, commit prefixes, hashes, and result states only. It does not authorize
credential access, revoke/rotate actions, history rewrite, force-push, ref or
worktree deletion, GitHub Support requests, or a `Verified` status.

The applicable procedure remains
[`NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md`](../../../runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md).
The runbook requires revocation/rotation evidence before any rewrite and
requires independent verification before incident closure.

The earlier `12:02 WIB` snapshot from merged PR #182 is historical evidence
from the `9f6fe38` baseline. Its counts and scan provenance are not silently
carried forward; this re-inventory supersedes its current-state claims.

## 2. Remote repository and GitHub surface snapshot

The following values were collected read-only from `origin` and GitHub CLI.
Identities and response bodies not needed for the counts were not retained.

| Surface | Redacted result | Interpretation |
| --- | --- | --- |
| Default branch / head | `main` / `f43eea6` | Current main includes the merged post-G2 readiness revalidation. |
| Git tree | `6d2154b` | Source-tree identity only; not an artifact digest. |
| Remote heads | `50` | Branch names and SHAs require a fresh freeze inventory before any operation. |
| Remote tags | `0` | No remote tags were advertised at collection time. |
| Open pull requests | `2` | Timestamped count only; it is not an approval to rewrite. PR #185 was open at collection time. |
| All pull requests | `187` total; `181` merged | Historical PR refs remain a separate contamination surface. |
| PR head refs | `175` | `refs/pull/*/head` was observed through the Git remote; cached views and server-side objects remain unverified. |
| Forks | `0` metadata / `0` API results | A current zero count does not prove absence of old clones or backups. |
| Rulesets | `0` API results | No ruleset was returned by the read-only API query. |
| Main branch protection | `not returned (HTTP 404)` | No protection response was available in this query; do not infer a setting change. |
| Collaborator accounts | `3` count only | Login identities were intentionally withheld; clone disposition is unknown. |

The earlier G2 source/alert change is now reachable through PR #180. The
source merge does not remediate the credential incident or its external
history surfaces.

## 3. Local Git and worktree snapshot

| Surface | Redacted result | Limit |
| --- | --- | --- |
| Local branches | `156` | Branch names/owners were not copied into this evidence artifact. |
| Local tags | `0` | This is the current checkout's local ref namespace only. |
| Registered worktrees | `102` | Worktree paths are omitted from the retained artifact. |
| Worktree state | `80` clean, `22` dirty, `0` missing, `7` detached | Dirty-work ownership and disposition are not known. No worktree was changed. |
| `git fsck --full --no-reflogs` | exit `0` | No missing or unreachable object lines were reported. |
| Dangling objects | `220` | Dangling objects are not proof of contamination or cleanup; do not delete them without a separate approved retention/cleanup decision. |

The dirty main worktree and unrelated worktrees remain untouched. The count
does not replace owner-by-owner quarantine or fresh-clone acknowledgments.

## 4. Introducing-commit and redacted scan evidence

The runbook records introducing commit
`a75dc92b46e6d0f6f1820a4d1123c17bffdcca84`. The current checkout's object
database does not contain that commit, so no ref contains it in this checkout.
This is only local object evidence. It is not proof that the audited value is
absent from GitHub PR refs, cached views, forks, old clones, backups, or other
repositories.

A pinned Gitleaks binary was run against the current Git history for the
`f43eea6` re-inventory with `--redact=100`, `--log-opts=--all`, and a report
outside the repository:

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

The read-only GitHub secret-scanning alert endpoints returned HTTP `404` with
the explicit response `Secret scanning is disabled on this repository` for
both `open` and `resolved` queries at the current collection window. No
authoritative alert inventory was returned; this must not be interpreted as
proof that no alerts exist.

The runbook's exact-value history scan was not run because the recorded
introducing object is absent from this checkout and no credential value was
inspected or reconstructed.

## 5. Non-production verification performed

The following command ran against the current `f43eea6` worktree with no
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

Result: **`180 passed`** in `39.45s`.

This result validates bounded local source behavior only. It does not prove
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
| Read-only Git/GitHub inventory | `PARTIAL_PASS` — current counts recorded at `2026-08-06T06:43:09Z`; freeze/owner inventory not established |
| Redacted secret scan | `BLOCKED_BY_UNRESOLVED_FINDINGS` — current Gitleaks scan returned two credential-like findings; GitHub secret-scanning is disabled and its alert inventory is unavailable |
| Old credential revocation/rotation | `NOT RUN` — no credential value or secret manager accessed |
| Controlled non-production authentication | `NOT RUN` — required local config names were absent and no approved external account/config reference was supplied |
| History rewrite/publication | `NOT RUN` — no isolated rewrite approval or exact-value evidence |
| Independent verification | `EXCEPTION_APPROVED / NOT AVAILABLE` — Faiz is sole owner; this is not independent verification |
| NIV-001 / DR-002 | `DECIDED` / `ACCEPTED_RISK_SELF_VERIFICATION_EXCEPTION` — incident remains open |

Faiz's owner decision resolves the human-decision gap for this packet but does
not change the accepted-risk expiry of **2026-08-30** or remove the P0
release/go-live block. No evidence in this inventory establishes `Verified`
incident closure.

The current re-inventory found no credential-action proof, no approved
non-production account reference, two unresolved current-history Gitleaks
findings, 102 registered worktrees with 22 dirty, and no independent
verification. This procedure remains preparation-only and NIV-001 remains a
P0 release/go-live blocker.

<!-- markdownlint-enable MD013 -->
