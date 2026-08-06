# G2 — Auth and Security Gates Decision Packet

<!-- markdownlint-disable MD013 MD060 -->

**Status:** `PARTIAL_PASS / DECISION-BLOCKED`
**Prepared:** 2026-08-06 (Asia/Jakarta)
**Verification worktree:** `C:\tmp\niuva-auth-security-gates-20260806`
**Branch:** `codex/auth-security-gates-20260805`
**Source baseline:** `9736d617ca4399e5533be60c919814341e0b1ea9`
**Remote freshness at handoff:** `origin/main` advanced to
`6cd5a6417e1f4e72b1fbcce5d11801358b424d82` during this task; the seven
intervening commits are documentation-only for the scoped auth/security paths.

## 1. Purpose and authority boundary

This packet records the bounded auth/security source gate and the decisions
that remain open. It is subordinate to the canonical authority order:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. `DEC-ACCESS-001`, `DEC-ACCESS-002`, `DEC-ACCESS-003`
5. `DEC-AUTH-001`, `DEC-AUTH-002`, `DEC-AUTH-006`, `DEC-AUTH-007`,
   `DEC-AUTH-009`, `DEC-AUTH-011`, and `DEC-AUTH-012`
6. `ADR-005` where its bounded runtime contract applies
7. Applicable runbooks, current source, and tests

The packet does not authorize MFA implementation, provider or key-custody
selection, secret rotation, alert destination activation, migration execution,
deployment, production readiness, or go-live.

## 2. Bounded implementation completed in this branch

| Exact path | Change | Authority | Verification |
|---|---|---|---|
| `backend/auth_security_events.py` | The Mongo storage adapter now revalidates the exact event field allowlist, schema/version, UTC timestamps, 90-day expiry, pseudonymized unknown subjects, and pseudonymized peer references before insertion. | `DEC-AUTH-009`, `DEC-AUTH-011` | Event tests pass; malformed/raw references and unknown fields fail closed before storage. |
| `backend/auth_security_alerts.py` | The provider-neutral alert outbox now accepts only the bounded initial alert schema, safe opaque references, approved retry schedule, and timezone-aware timestamps. | `DEC-AUTH-011` | Alert tests pass; raw identifier material and unknown fields fail closed before persistence. |
| `backend/tests/test_auth_security_events.py` | Added negative tests for raw unknown-subject/peer references and adapter-level unknown fields. | `DEC-AUTH-009`, `DEC-AUTH-011` | Passed. |
| `backend/tests/test_auth_security_alerts.py` | Added negative tests for raw alert fingerprint material and adapter-level unknown fields. | `DEC-AUTH-011` | Passed. |
| `backend/tests/test_auth_security_event_migration.py` | Added proof that CLI `--apply` and `--rollback` exit before connecting to any target. | `DEC-AUTH-011` and Migration 010 source contract | Passed. |

No `backend/server.py`, MFA implementation, limiter provider/configuration,
secret, migration execution, or environment value was changed.

## 3. Control matrix

| Control | Current behavior and evidence | Approved direction | Missing decision/evidence | Exact owner boundary |
|---|---|---|---|---|
| Internal role authorization | Granular roles, additive multi-role validation, exclusive `super_admin`, current policy/access-state checks, owner-only governance permissions, and positive/negative handler tests pass. | `DEC-ACCESS-001/002`; backend authorization and query scope remain mandatory. | Seeded role matrix across every protected handler/query, external role verification, migration/cutover and live access-review evidence. | Security/Identity owner; named independent verifier still unassigned. |
| Customer-safe projection | Ownership checks and allowlisted historical projections exclude internal cost, margin, supplier, profit, internal notes, raw storage paths, and finance-only state. Projection/identity/storage/order tests pass. | `DEC-ACCESS-003` and Master Spec customer-data boundary. | Representative live historical fixtures, independent projection review, retention/access review, and staging evidence. | Data/Privacy owner; Customer/Operations owner for historical-access procedure; names unassigned. |
| Generic authentication failure | Unknown email, wrong password, disabled/review-blocked account, wrong surface, and legacy low-privilege customer cases retain generic `401` behavior and no token issuance in source tests. | `DEC-AUTH-001`; public responses remain non-enumerating. | Timing analysis, selected release baseline, same-origin HTTPS/proxy evidence, and independent review. | Security/Identity owner; release owner and independent verifier unassigned. |
| Abuse/rate limit | Mongo atomic account/peer limiter uses HMAC-derived dimensions, 5 account / 20 peer failures per 15 minutes under `ADR-005`, generic `429` and `Retry-After`; recovery resend has a server-enforced 60-second cooldown. | `DEC-AUTH-006` plus the bounded Mongo/threshold selection in `ADR-005`. | Trusted proxy/client-address contract, outage behavior, TTL/index application, recovery budgets beyond 60 seconds, monitoring, retention, and production owner. | Security/Identity owner; Platform/Network owner for proxy; Operations/SRE owner for monitoring; Data/Privacy owner for retention. All named people unassigned. |
| Authentication security events | Dedicated Mongo store, strict redacted schema, HMAC pseudonymization, key version, 90-day expiry, no application reader/general Admin viewer, and provider-neutral alert document boundary exist. Feature flag is disabled by default; readiness requires the Migration 010 marker when enabled. | `DEC-AUTH-009/011`; event persistence failure behavior is operation-specific in existing server wiring. | External key delivery/custody, enabled-target configuration, collection/index deployment, cleanup scheduling/lease observation, backup/restore interaction, alert destination, delivery worker/failure drills, and retention review. | Security Lead primary; Backend Security Lead backup; Data/Privacy Lead cleanup reviewer; Operations/SRE Lead alert owner. Named production owners and destination unassigned. |
| MFA boundary | No TOTP enrollment/challenge, recovery-code lifecycle, step-up, or passkey implementation exists in the scoped source. | `DEC-AUTH-007` requires MFA for every internal role; Stage 1 TOTP, Stage 2 passkeys. | Library, parameters, encryption/key custody, enrollment rollout, break-glass/recovery owner, support channel, session/event contract, and verification plan. | Security/Identity owner; key-custody owner; support/recovery owner under `DEC-AUTH-008`; independent verifier. Names unassigned. |
| Migration 010 safety | Dry-run is read-only; CLI mutation flags fail closed before target connection; programmatic apply requires a transaction guard, backup path, encrypted-backup confirmation, empty dedicated collections, idempotence, and rollback refuses non-empty collections. No apply/rollback was run. | `DEC-AUTH-011`; migration source is staged and creates only dedicated indexes/marker with no historical backfill. | Explicit isolated target approval, backup/restore proof, operator/reviewer/window, index/TTL evidence, rollback rehearsal, and production activation approval. | Migration operator; database/backup custody owner; independent reviewer; Project Owner approver. Names/target unassigned. |
| Retention and alert boundary | Direct event expiry is 90 days; application cleanup and TTL defense-in-depth classes exist; alert policy and outbox retry schedule are bounded and payload-free. | `DEC-AUTH-009/011`; no general notifications or Admin audit viewer. | Cleanup worker schedule/observation, deletion proof, longer aggregate-retention decision, alert destination/SLA evidence, and dead-letter handling. | Data/Privacy Lead cleanup reviewer and Operations/SRE Lead alert owner; named people/destination unassigned. |
| NIV-001 | DR-002 remains `OPEN / HUMAN_DECISION_BLOCKED`; current administrative accepted risk runs through 2026-08-30. No credential value was inspected, rotated, or revoked in this work. | NIV-001 runbook and DR-002 require either independently evidenced `Verified` closure or a new/time-bound approved accepted-risk disposition. | Redacted credential-action proof, remote/PR/cache/fork inventory, old-clone/worktree disposition, backup retention decision, independent verification, and Final Approver outcome. | Incident owner, credential owner, repository administrator, independent verifier, and Final Approver. Assignments/evidence remain open. |

## 4. Verification performed

All commands ran in the fresh task worktree with cache writes disabled and
`-n 0`; no shared, staging, or production database was contacted.

```text
python -B -m pytest -p no:cacheprovider -n 0 -q \
  backend/tests/test_auth_recovery.py \
  backend/tests/test_auth_password.py \
  backend/tests/test_auth_rate_limit.py \
  backend/tests/test_auth_security.py \
  backend/tests/test_auth_security_events.py \
  backend/tests/test_auth_security_alerts.py \
  backend/tests/test_auth_session.py \
  backend/tests/test_auth_security_event_migration.py \
  backend/tests/test_permissions.py
158 passed
```

```text
python -B -m pytest -p no:cacheprovider -n 0 -q \
  backend/tests/test_identity_foundation.py \
  backend/tests/test_identity_access_migration.py \
  backend/tests/test_granular_role_migration.py \
  backend/tests/test_audit.py \
  backend/tests/test_storage.py \
  backend/tests/test_storage_routes.py \
  backend/tests/test_retail_order_routes.py \
  backend/tests/test_retail_legacy_classification.py
164 passed, 2 skipped
```

Additional checks:

- `python -B -m compileall -q` passed for the changed modules and Migration 010;
- `git diff --check` passed;
- the changed source/test paths were inspected for secret-bearing values;
- real transaction tests, staging/proxy/TLS tests, external role checks,
  browser checks, cleanup execution, alert delivery, and migration apply/
  rollback were not run.

## 5. Production blockers and stop conditions

The repository evidence supports a bounded source/test pass, not production
security closure. Keep the following gates open until the listed owner records
redacted evidence or an approved disposition:

1. NIV-001/DR-002 incident closure or renewed accepted risk before its expiry.
2. DR-003 selected auth scope and release-candidate baseline.
3. DR-004 trusted proxy, outage, TTL/index, retention, monitoring, and owner
   decisions for internet-facing abuse controls.
4. DR-005 MFA library/parameters/key custody/recovery/support/step-up decisions.
5. Authentication-event key delivery/custody, cleanup owner, alert destination,
   delivery/failure drills, and retention/backup proof.
6. Isolated Migration 007–010 dry-run/apply/rollback/restore evidence; this PR
   does not authorize execution.
7. Same-origin HTTPS/proxy/cookie/cache evidence, seeded-role staging checks,
   independent security review, and release-owner approval.

Any missing owner or target is a stop condition. Do not infer approval from
passing tests, a merged PR, a feature flag, a migration marker, or an alert
outbox document.

## 6. Handover and rollback

**Changed:** the five source/test paths listed in section 2 and this packet.

**Intentionally unchanged:** `backend/server.py`, all MFA/provider/key/secret
configuration, limiter thresholds/topology, migrations at runtime, database
data, `.env` values, deployment/alert delivery, credentials, NIV-001 status,
canonical decisions, and other worktrees.

The source change is reversible by reverting the bounded validation commit;
no data-bearing migration or operational state was changed. If a malformed
pre-existing event/outbox document is encountered after future activation, keep
the feature fail-closed and use an approved data/backup procedure rather than
bypassing the adapter validation.

<!-- markdownlint-enable MD013 MD060 -->
