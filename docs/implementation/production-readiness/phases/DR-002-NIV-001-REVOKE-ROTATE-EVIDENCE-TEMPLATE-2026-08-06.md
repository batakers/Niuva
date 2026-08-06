# DR-002 — NIV-001 Revoke/Rotate and Safe-Evidence Procedure

<!-- markdownlint-disable MD013 -->

**Status:** `PREPARATION_ONLY`
**Prepared:** 2026-08-06 (Asia/Jakarta)
**Scope:** Redacted procedure and evidence template; no credential action
**Authority:** `docs/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md`

## 1. Non-negotiable safety boundary

This document does not contain, request, or authorize a credential value. Do
not paste a secret into chat, a command argument, a script, a `.env` file, a
PR, an issue, a transcript, a test report, or retained evidence. Never
authenticate with the old credential.

The credential owner must use the approved secret manager or provider control
plane. The repository operator may retain only the ticket/config reference,
environment, timestamp, actor role, and sanitized result. A successful local
test or a rewritten reachable ref is not a revocation proof.

## 2. Required roles and approvals

Assign these roles before the first credential action or history operation.
Names may be recorded in the restricted incident system, not in this public
repository document.

| Role | Required responsibility | Current state |
| --- | --- | --- |
| Incident owner | Owns freeze, evidence package, escalation, and status proposal | Unassigned in current packet |
| Credential owner | Revokes/rotates old credential and provisions non-production test account | Unassigned in current packet |
| Repository administrator | Approves exact ref set and repository maintenance window | Unassigned in current packet |
| Rewrite operator | Operates only in approved isolated mirrors | Not assigned |
| Independent verifier | Reviews backup, scans, refs, tests, publication, and redaction without operating | Not assigned |
| Application owner | Runs controlled non-production authentication | Not assigned |
| Final Approver | Records `Verified`, renewed accepted risk, or another disposition | Assignment required |

Before proceeding, obtain redacted approvals for the exact environment,
maintenance window, ref inventory, non-production config reference, rollback
owner, evidence retention, and the decision to run each command class.

## 3. Revoke/rotate sequence

### Phase A — Contain and record

1. Declare the incident ID `NIV-001`, current time in Asia/Jakarta, freeze
   window, and write-freeze scope.
2. Stop use of the old credential. Do not test it, print it, or place it in a
   process argument or environment capture.
3. Record only a redacted credential-action ticket/config reference, affected
   environment, credential class, owner role, action timestamp, and result
   (`revoked`, `rotated`, `disabled`, or `failed`).
4. Record the new non-production account/config reference without its email,
   password, token, cookie, or secret value.

### Phase B — Credential action by the credential owner

1. In the approved secret manager/provider control plane, revoke or disable
   the old credential before any history operation.
2. Generate/store the replacement through the approved secret manager. Never
   copy the replacement into the repository or evidence package.
3. Record the provider audit-event reference and action result in the
   restricted incident record. Keep this repository document value-free.
4. If the provider cannot prove revocation/rotation, stop. Do not proceed on
   an assumption of containment.

### Phase C — Controlled non-production verification

1. Use only the new non-production account through a masked secret-manager or
   CI injection. Do not type values into a saved command or `.env` file.
2. Record environment name, application owner, config reference, timestamp,
   command shape, expected role, and sanitized pass/fail result.
3. Capture no token, cookie, authorization header, response body, or raw
   credential. Review the process output before retention.
4. Run the approved backend regression command shape from the runbook and
   record any expected skip separately from a pass.

### Phase D — Repository/history operation, only after separate approval

1. Re-inventory remote heads/tags, PRs, forks, rulesets, worktrees, clones,
   backups, and bot writers immediately before the freeze.
2. Create separate immutable recovery and disposable rewrite mirrors on an
   approved encrypted volume. Do not reuse an existing Niuva worktree.
3. Independently verify the recovery bundle, tool versions/checksums, exact
   scope, pre-scan, rewrite result, ref/tree parity, tests, and post-scan.
4. Obtain explicit approval for the exact atomic lease-based publication.
5. Re-inventory after publication, retain the GitHub Support/cache/PR-ref
   outcome, and quarantine or freshly clone every affected collaborator
   checkout.

This phase is not authorized by this template. The runbook remains the
procedural source for the exact command sequence and abort conditions.

## 4. Safe evidence schema

Retain the following fields only in the redacted incident record:

| Evidence record | Allowed fields | Never retain |
| --- | --- | --- |
| Credential action | Environment, credential class, owner role, ticket/config reference, action time, result | Secret, token, password, provider payload, auth header |
| New test account | Non-production environment, opaque config reference, owner, provisioned time, sanitized test result | Email, password, cookie, token, response body |
| Repository snapshot | Repository identity, visibility, head/tag/PR/fork/ruleset counts, SHA prefixes, timestamp | Secret-bearing lines, raw API payloads, private collaborator details |
| History scan | Tool/version/hash, commit count, hit count, unique paths, redacted finding IDs, report hash | Exact secret, match, `Secret` field, unredacted report |
| Rewrite/publication | Ref names, old/new SHAs, lease result, tree/ref parity, affected PR count, Support reference | Credential value, unredacted filter rule, shell history |
| Clone/backup disposition | Worktree ID, owner role, clean/dirty state, quarantine/fresh-clone result, backup class, checksum, retention/expiry | Clone contents, backup secret material, customer data |
| Final decision | Status, approver, verifier, date, rationale, residual risk, expiry | Unsupported `Verified` claim or raw evidence |

## 5. Acceptance criteria for a closure proposal

Do not propose `Verified` until all applicable criteria have redacted,
independently reviewed evidence:

- old credential revocation/rotation is confirmed by the credential owner;
- a new non-production account/config reference exists and controlled auth
  succeeds without retained secret material;
- the frozen ref/PR/fork/ruleset/worktree/clone/backup inventory is complete;
- recovery mirror/bundle and retention are independently verified;
- pre/post exact-history and Gitleaks scans are zero-hit or formally
  dispositioned by the security owner;
- rewritten ref/tree parity, tests, publication, PR-ref/cache, fork, and
  collaborator outcomes are recorded;
- backup retention/destruction and isolated-session cleanup have owners and
  expiry; and
- the independent verifier and Final Approver sign the redacted outcome.

If any criterion is absent, retain `OPEN`/accepted-risk status or obtain a new
time-bound disposition. Do not use a merged PR, local green test, missing
object in one clone, or self-review as incident closure evidence.

## 6. Current completion state

The current `2026-08-06T05:41:38Z` inventory at `cccc1e8` found no
credential-action proof, no approved non-production account reference, no
exact-current-main local Gitleaks run, 98 registered worktrees with 21 dirty,
and no independent verification. The two redacted Gitleaks findings retained
from the superseded #182 snapshot remain unresolved pending owner review.
Therefore this procedure is prepared but not executed, and NIV-001 remains a
P0 release/go-live blocker.

<!-- markdownlint-enable MD013 -->
