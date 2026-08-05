# Task Card — DR-005 Internal MFA Decision Packet

<!-- markdownlint-disable MD013 -->

**Status:** Documentation-only decision packet; human decision blocked
**Date:** 2026-08-06 (Asia/Jakarta; actual preparation date)
**Observed baseline:** `origin/main` at `c84743c8fcbc158721037b3c02dc0dff0c872242`
**Active branch:** `codex/g15-dr005-mfa-decision-20260806`
**Active worktree:** `C:\tmp\niuva-g15-dr005-mfa-decision-20260806`
**Driver:** Faiz / delegated Codex implementation
**Decision owners:** Project Owner, Security/Identity owner, Operations, and
the accountable internal-support owner to be assigned

## Objective

Prepare a neutral owner packet for DR-005. The packet must make the approved
mandatory internal MFA direction actionable by recording the still-open Stage 1
TOTP, secret-protection, recovery, session, step-up, event, and rollout fields.
It must preserve the later passkey boundary without selecting an implementation
or inventing an internal support channel.

This task records decision fields and evidence boundaries. It does not choose a
library, cryptographic parameter, key-custody mechanism, support destination,
dependency, schema, migration, source change, rollout, or production operation.

## Authority and reading order

The canonical reading order used for this task is: Master Spec, Document
Register, Decision Register and DR-005, applicable decisions and ADRs, applicable
runbooks, then current source and tests.

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` (DR-005)
- `docs/decisions/access/DEC-AUTH-005-admin-session-transport-and-remember-me.md`
- `docs/decisions/access/DEC-AUTH-007-internal-mfa-staged-direction.md`
- `docs/decisions/access/DEC-AUTH-008-admin-support-channel-deferral.md`
- `docs/decisions/access/DEC-AUTH-009-authentication-security-event-governance.md`
- `docs/decisions/access/DEC-AUTH-011-authentication-security-event-implementation.md`
- `docs/decisions/access/DEC-AUTH-012-admin-session-cross-tab-and-isolated-drill.md`
- `docs/runbooks/AUTH_SESSION_RUNBOOK.md`
- `docs/runbooks/AUTH_RECOVERY_RUNBOOK.md` for procedural safety boundaries
- `docs/implementation/production-readiness/phases/FEATURE-1.6-internal-mfa-revalidation.md`
- current source and tests only as bounded evidence

`DEC-AUTH-007` is approved with open decisions. `DEC-AUTH-008` is an approved
deferral, and `DEC-AUTH-009` is approved with open decisions. None authorizes
source implementation, dependency selection, migration, credential handling,
deployment, production activation, or go-live.

## Scope

Only these two documentation files may change:

1. `docs/implementation/production-readiness/phases/DR-005-INTERNAL-MFA-DECISION-2026-08-06-task-card.md`
2. `docs/implementation/production-readiness/phases/DR-005-INTERNAL-MFA-DECISION-2026-08-06.md`

## Explicit exclusions

- Do not select a TOTP/WebAuthn library, parameter set, encryption format,
  key-custody mechanism, support destination, alert destination, or provider.
- Do not add dependencies, modify source/config/schema, create keys, enable MFA,
  change Admin login behavior, or add a migration.
- Do not invent a public contact, WhatsApp, HR, email, or ticket channel for
  privileged recovery.
- Do not apply migrations, access shared/staging/production data, deploy,
  rotate secrets, or claim security closure, production readiness, or go-live.
- Do not change `DEC-AUTH-007`, `DEC-AUTH-008`, `DEC-AUTH-009`, the Decision
  Register, or DR-005 status.
- Do not modify unrelated files or the dirty `main` worktree.

## Acceptance criteria

- The packet preserves every approved MFA invariant and separates it from
  unselected implementation and operational choices.
- TOTP, secret protection, enrollment, pre-auth/session, step-up, recovery,
  event, rollout, rollback, and verification fields are explicit and blank
  until authorized owners decide.
- The packet records that passkeys are a later separately approved stage and
  that customer MFA is outside this scope.
- Current source/test observations are labeled as evidence, not approval or
  production readiness.
- No secret, token, credential value, provider activation, dependency, or
  external operation is introduced.
- Only the two approved paths are staged.
- `git diff --check`, markdownlint, exact-path verification, and staged secret
  scanning pass.

## Delivery authorization and handover

The user authorizes commit, push, and opening a PR. Merge, dependency or
provider activation, credential use, migration, deployment, production-readiness
approval, and go-live remain unauthorized.

The PR must list changed and intentionally unchanged files, passed and unrun
checks, risks and rollback, and external actions still requiring approval.

<!-- markdownlint-enable MD013 -->
