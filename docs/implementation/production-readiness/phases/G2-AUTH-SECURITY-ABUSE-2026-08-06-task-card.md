# G2 — Auth, Security, and Abuse Decision Evidence

<!-- markdownlint-disable MD013 -->

**Status:** Proposed child task card; unresolved decisions remain explicit
**Planning baseline:** `origin/main` observed at
`c705a4413c02eef6b31f4e0e76e144733453e0af`; the driver must fetch again before
creating its implementation worktree
**Owner:** Security/identity owner to assign
**Independent verifier:** Independent security reviewer to assign

## Objective

Assemble exact-SHA evidence and decision closure inputs for authentication,
session security, recovery, password policy, rate limiting, security events,
MFA, retention, alert ownership, and abuse controls. Separate decision packets
from source implementation. Do not invent security parameters, key custody,
provider behavior, or operational ownership.

This card does not authorize MFA implementation, migration, secret rotation,
real email, alert-provider activation, deployment, production security
readiness, or go-live.

## Authority and applicable context

Read in this order before any work:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. `docs/decisions/access/DEC-AUTH-003-account-recovery-contract-and-compatibility.md`
5. `docs/decisions/access/DEC-AUTH-004-password-policy-and-hash-migration.md`
6. `docs/decisions/access/DEC-AUTH-005-admin-session-transport-and-remember-me.md`
7. `docs/decisions/access/DEC-AUTH-006-abuse-protection-interface-and-deferral.md`
8. `docs/decisions/access/DEC-AUTH-007-internal-mfa-staged-direction.md`
9. `docs/decisions/access/DEC-AUTH-009-authentication-security-event-governance.md`
10. `docs/decisions/access/DEC-AUTH-010-customer-session-transport-and-origin.md`
11. Applicable auth/security runbooks, then current source and tests

The DR-003, DR-004, and DR-005 packets are decision-input context. They do not
turn an open decision into implementation authority.

## Exact path ownership

The child task may inspect these paths and may change them only after the
explicit source gate or documentation assignment is recorded:

- `backend/auth_session.py`
- `backend/auth_sessions.py`
- `backend/auth_recovery.py`
- `backend/auth_password.py`
- `backend/auth_rate_limit.py`
- `backend/auth_security_events.py`
- `backend/auth_security_alerts.py`
- `backend/tests/test_auth_recovery.py`
- `backend/tests/test_auth_recovery_transaction_integration.py`
- `backend/tests/test_auth_password.py`
- `backend/tests/test_auth_rate_limit.py`
- `backend/tests/test_auth_security.py`
- `backend/tests/test_auth_security_events.py`
- `backend/tests/test_auth_security_alerts.py`
- `backend/tests/test_auth_session.py`
- `backend/tests/test_auth_session_transaction_integration.py`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/context/AuthContext.test.jsx`
- `frontend/src/components/auth/**`
- `frontend/src/pages/auth/**`
- the specifically related frontend auth contract tests

Do not modify `docs/implementation/production-readiness/DECISIONS_REQUIRED.md`
or the G1 transaction paths. Do not modify this card from the implementation
chat.

## Intentionally unchanged and excluded

- `backend/migrations/**` and any migration apply, restore, or data mutation;
- `backend/server.py` and shared readiness/notification/runtime handlers;
- MFA libraries, parameters, encryption/key custody, recovery channels, or
  alert providers without an approved decision and named owner;
- production limiter topology, trusted proxy, retention, monitoring, email,
  credentials, secrets, deployment, and environment state;
- `frontend/src/App.js` and non-auth frontend surfaces owned by G3;
- dependencies, lockfiles, CI workflows, and provider activation.

## Dependencies and parallel rules

- G2 may perform read-only discovery in parallel with G1 and G3.
- G2 owns the auth frontend paths above; G3 must exclude them. `App.js`, shared
  API transport, and any cross-surface role contract are serial integration
  paths.
- Any unresolved DR-003/004/005 consequence remains `blocked_by_decision`.
- G5 consumes only evidence tied to the exact SHA and named verifier.

## Acceptance criteria

- Produce an auth control matrix covering customer/admin session transport,
  generic failure behavior, recovery, password policy, rate limits, security
  events, MFA boundary, privacy/retention, and abuse controls.
- Distinguish approved bounded behavior, source evidence, environment evidence,
  open decisions, and unverified production claims.
- Prove customer/internal authorization and data projection boundaries without
  exposing secrets or internal data.
- If a source gate is granted, implement only the named bounded paths and add
  proportional negative-path tests; do not close an open decision by inference.
- Record risk, rollback, migration impact, owner, and external approval for
  every unresolved control.

## Minimum verification

- `python -m pytest -n 0 -q backend/tests/test_auth_recovery.py backend/tests/test_auth_password.py backend/tests/test_auth_rate_limit.py backend/tests/test_auth_security.py backend/tests/test_auth_security_events.py backend/tests/test_auth_security_alerts.py backend/tests/test_auth_session.py`
- Run auth transaction integration tests only against an approved isolated
  MongoDB replica set, never shared or production data.
- Run the specifically owned frontend auth contract tests and report the exact
  command/result; run a production build when frontend source changes.
- Run `git diff --check`, exact-path verification, and a staged secret scan
  before any commit.

## Handover and stop conditions

The handover must identify approved versus open decisions, exact evidence SHA,
changed and intentionally unchanged paths, passed/unrun checks, security and
privacy risks, rollback, owners, and external actions still requiring
approval. Stop before MFA/key changes, migration, real email or alert
activation, secret use, deployment, readiness, or go-live.

Commit, push, and opening a PR are allowed for an approved bounded slice.
Merge remains user-controlled.

<!-- markdownlint-enable MD013 -->
