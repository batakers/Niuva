# DR-002 — NIV-001 Redacted Git and Repository Inventory

<!-- markdownlint-disable MD013 -->

**Status:** `EVIDENCE_PLUS_OWNER_EXCEPTION` / `CURRENT SNAPSHOT` / `NOT INCIDENT CLOSURE`
**Prepared:** 2026-08-06 13:43:09 WIB (Asia/Jakarta; original packet)
**Revalidated:** 2026-08-06 16:44:01 WIB (Asia/Jakarta)
**Observed baseline:** `origin/main` at
`9472537405af3353a68e599a057263ca7aa079ee` (`9472537`)
**Observed tree:** `3a4678333ede6122fdc8d3f87456b83e1567c9cd`
**Collection timestamp:** `2026-08-06T09:44:01Z`
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
from the `9f6fe38` baseline. The earlier `13:43 WIB` re-inventory was collected
at `f43eea6` and is also historical after later merges. Their counts and scan
provenance are not silently carried forward; this re-inventory supersedes their
current-state claims.

## 2. Remote repository and GitHub surface snapshot

The following values were collected read-only from `origin` and GitHub CLI.
Identities and response bodies not needed for the counts were not retained.

| Surface | Redacted result | Interpretation |
| --- | --- | --- |
| Default branch / head | `main` / `9472537` | Current-main observation only; DR-001 remains open and no release candidate was selected. |
| Git tree | `3a467833` | Source-tree identity only; not an artifact digest. |
| Remote heads | `58` | Branch names and SHAs require a fresh freeze inventory before any operation. |
| Remote tags | `0` | No remote tags were advertised at collection time. |
| Open pull requests | `2` | Timestamped count only; it is not an approval to rewrite. PR #185 was open at collection time. |
| All pull requests | `196` total; `190` merged | Historical PR refs remain a separate contamination surface. |
| PR head refs | `184` | `refs/pull/*/head` was observed through the Git remote; cached views and server-side objects remain unverified. |
| Forks | `0` metadata / `0` API results | A current zero count does not prove absence of old clones or backups. |
| Rulesets | `0` API results | No ruleset was returned by the read-only API query. |
| Main branch protection | `not protected (HTTP 404)` | Current read-only API result only; do not infer any authorization to change repository settings. |
| Collaborator accounts | `3` count only | Login identities were intentionally withheld; clone disposition is unknown. |

The earlier G2 source/alert change is now reachable through PR #180. The
source merge does not remediate the credential incident or its external
history surfaces.

## 3. Local Git and worktree snapshot

| Surface | Redacted result | Limit |
| --- | --- | --- |
| Local branches | `165` | Branch names/owners were not copied into this evidence artifact. |
| Local tags | `0` | This is the current checkout's local ref namespace only. |
| Registered worktrees | `113` | Worktree paths are omitted from the retained artifact. |
| Worktree state | `92` clean, `21` dirty, `0` missing, `8` detached | Dirty-work ownership and disposition are not known. No worktree was changed. |
| `git fsck --full --no-reflogs` | exit `0` | No missing or unreachable object lines were reported. |
| Dangling objects | `229` | Dangling objects are not proof of contamination or cleanup; do not delete them without a separate approved retention/cleanup decision. |

The dirty main worktree and unrelated worktrees remain untouched. The count
does not replace owner-by-owner quarantine or fresh-clone acknowledgments.

## 4. Introducing-commit and redacted scan evidence

The runbook records introducing commit
`a75dc92b46e6d0f6f1820a4d1123c17bffdcca84`. The current checkout's object
database does not contain that commit, so no ref contains it in this checkout.
This is only local object evidence. It is not proof that the audited value is
absent from GitHub PR refs, cached views, forks, old clones, backups, or other
repositories.

The latest available pinned Gitleaks result was collected against the earlier
`f43eea6` snapshot with `--redact=100`, `--log-opts=--all`, and a report outside
the repository. Gitleaks was unavailable on the host during this `9472537`
revalidation, so no fresh current-main scan is claimed:

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

The two findings are **unresolved potential findings** from the historical
`f43eea6` scan, not automatically classified false positives. A value-free
structural review recorded no
placeholder marker, environment-variable reference, or URL on either finding
line; both are therefore retained as `credential-like-documentation` pending
owner review. The source commit subject was `docs: propagate approved
architecture decisions` and only the file/line hashes are retained here.
An owner must review them through a secret-safe process and record a redacted
disposition before any closure claim.

At the `2026-08-06T09:44:01Z` collection window, the read-only GitHub
secret-scanning alert endpoint returned HTTP `404` with the explicit response
`Secret scanning is disabled on this repository`. No authoritative alert
inventory was returned; this must not be interpreted as proof that no alerts
exist.

The runbook's exact-value history scan was not run because the recorded
introducing object is absent from this checkout and no credential value was
inspected or reconstructed.

## 5. Non-production verification performed

The following command ran against the synchronized revalidation worktree after
it was aligned with `origin/main=9472537`, with no credential or external
service value supplied. The source/test paths are unchanged by the
documentation-only PR changes:

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

Result: **`180 passed`** in `22.84s`.

This result validates bounded local source behavior only. Current `origin/main`
CI also reported `backend`, `frontend`, and `secret-scan` success at
`9472537`; those are repository CI signals, not incident closure. It does not prove
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
| Read-only Git/GitHub inventory | `PARTIAL_PASS` — current counts recorded at `2026-08-06T09:44:01Z` against `9472537`; freeze/owner inventory not established |
| Redacted secret scan | `BLOCKED_BY_UNRESOLVED_FINDINGS / CURRENT_SCAN_UNAVAILABLE` — the latest pinned Gitleaks result is historical at `f43eea6` with two credential-like findings; no Gitleaks binary was available for `9472537` |
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
non-production account reference, 113 registered worktrees with 21 dirty, and
no independent verification. The latest available historical Gitleaks scan
retains two unresolved credential-like findings; no fresh `9472537` scan is
claimed. This procedure remains preparation-only and NIV-001 remains a P0
release/go-live blocker.

<!-- markdownlint-enable MD013 -->
