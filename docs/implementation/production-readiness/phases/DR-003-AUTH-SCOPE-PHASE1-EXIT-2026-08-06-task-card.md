# Task Card — DR-003 Authentication Scope and Phase 1 Exit Packet

<!-- markdownlint-disable MD013 -->

**Status:** Documentation-only decision packet; human decision blocked
**Date:** 2026-08-06 (Asia/Jakarta; actual preparation date)
**Observed baseline:** `origin/main` at `c84743c8fcbc158721037b3c02dc0dff0c872242`
**Active branch:** `codex/g17-dr003-auth-scope-20260806`
**Active worktree:** `C:\tmp\niuva-g17-dr003-auth-scope-20260806`
**Driver:** Faiz / delegated Codex implementation
**Decision owners:** Security/Identity, Project Owner, Operations, and release
owner

## Objective

Prepare a neutral owner packet for DR-003. The packet must reconcile the
approved recovery, Admin session, Customer session, password-policy, and hash
migration direction with the remaining Phase 1 scope, production evidence, and
rollback gates. DR-001 release-candidate selection remains a prerequisite and
must not be inferred here.

This task records decision fields and exit evidence. It does not select a
release candidate, provider, dependency, policy exception, migration target,
source change, deployment, or production activation.

## Authority and reading order

The canonical reading order used for this task is: Master Spec, Document
Register, Decision Register and DR-003, applicable decisions, applicable
runbooks, then current source and tests.

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` (DR-001/003)
- `DEC-AUTH-001`, `DEC-AUTH-003`, `DEC-AUTH-004`, `DEC-AUTH-005`, and
  `DEC-AUTH-010`
- `docs/runbooks/AUTH_RECOVERY_RUNBOOK.md`
- `docs/runbooks/AUTH_SESSION_RUNBOOK.md`
- `FEATURE-1.1` through `FEATURE-1.4` revalidation records
- current source and tests only as bounded evidence

The decisions are authoritative within their scopes, but their open
consequences remain separate. Current source, passing tests, or an older audit
baseline cannot select DR-001 or close Phase 1 by themselves.

## Scope

Only these two documentation files and one exact scan-fingerprint entry may
change:

1. `docs/implementation/production-readiness/phases/DR-003-AUTH-SCOPE-PHASE1-EXIT-2026-08-06-task-card.md`
2. `docs/implementation/production-readiness/phases/DR-003-AUTH-SCOPE-PHASE1-EXIT-2026-08-06.md`
3. `.gitleaksignore` for the verified historical false-positive fingerprint
   from the already-published DR-011 packet commit only

## Explicit exclusions

- Do not select DR-001's immutable release-candidate SHA or rewrite history.
- Do not change recovery, session, password, frontend, schema, migration,
  dependency, environment, or deployment source.
- Do not select an email/delivery provider, public origin, blocklist source,
  Argon2 target, session store, or production topology.
- Do not apply migrations, mutate shared/staging/production data, send real
  email, rotate credentials, deploy, or claim security closure/go-live.
- Do not change DEC-AUTH records, the Decision Register, DR-001, DR-003 status,
  or the dirty `main` worktree.

## Acceptance criteria

- The packet distinguishes approved contracts, historical evidence, open
  decisions, implementation defects, and environment evidence gaps.
- Recovery, Admin session, Customer session, password policy/hash migration,
  Phase 1 exit, rollback, and owner fields are explicit.
- DR-001 dependency and the separate DR-002 incident-risk gate are recorded.
- No provider, credential, secret value, runtime change, or external action is
  introduced.
- Only the three approved paths are staged; the `.gitleaksignore` entry is one
  exact fingerprint and not a broad rule/path ignore.
- `git diff --check`, markdownlint, exact-path verification, and staged secret
  scanning pass.

## Delivery authorization and handover

The user authorizes commit, push, and opening a PR. Merge, source/runtime
implementation, migration, credential/provider use, deployment,
production-readiness approval, and go-live remain unauthorized.

The PR must list changed and intentionally unchanged files, passed and unrun
checks, risks and rollback, and external actions still requiring approval.

<!-- markdownlint-enable MD013 -->
