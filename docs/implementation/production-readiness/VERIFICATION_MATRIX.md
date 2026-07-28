# Niuva Production-Readiness Verification Matrix

Status: Planning and Progress Context — Not Implementation Authority Unless Explicitly Approved

This matrix defines evidence that a later, separately approved phase must
produce. It records planned verification only; it does not claim that a check
was run, passed, or is authorized on shared/staging/production systems.

## Verification controls

| ID | Phase | Finding groups | Verification objective | Required environment / decision | Evidence and acceptance criterion | Current state |
| --- | --- | --- | --- | --- | --- | --- |
| V-00-01 | 0 | Freshness; governance/provenance | Prove one exact audited release-candidate SHA and identify all changed finding scope. | DR-001; local Git objects only unless remote access is separately authorized. | SHA, ancestry, changed-path matrix, and `requires_revalidation` mapping are recorded without claiming remote freshness. | Planned. |
| V-00-02 | 0 | NIV-001 | Prove or formally contain credential-incident closure without exposing sensitive material. | DR-002; approved NIV-001 procedure and independent reviewer. | Redacted gate-by-gate evidence, host/clone/cache assessment, owner disposition, and verified runbook status. | Blocked by decision. |
| V-00-03 | 0/2 | Migration/live-schema | Prove that no migration begins without backup, dry run, validation, rollback, owner, and stop conditions. | Named target and migration authority. | Per-migration preflight/rollback plan; no mutation is run merely to fill the tracker. | Planned. |
| V-01-01 | 1 | Session/MFA/access-review | Revalidate Admin/customer auth boundary, no browser-stored Admin credential, logout/revocation, expiry, role and access-review denial. | Selected SHA; controlled same-origin browser/API environment; auth authority. | Positive and negative browser/API matrix; no raw token/session data in artifacts. | Requires revalidation. |
| V-01-02 | 1 | Recovery/password/bootstrap | Prove generic recovery, eligibility, single use, atomic password/session/token behavior, and failure recovery. | Isolated Mongo replica set; DEC-AUTH-003/004 scope; migration approval if data is touched. | Concurrency/replay/transaction-unavailable tests show no partial state and stable safe response. | Requires revalidation. |
| V-01-03 | 1 | Role, file, customer-data, order privacy | Prove least privilege at handler, query, object, field, and route levels. | DEC-ACCESS-002; seeded roles and safe test records. | Allow/deny matrix covers direct API calls; customer responses exclude cost, margin, supplier, profit, and internal notes. | Planned. |
| V-01-04 | 1 | Transaction/idempotency/quote/payment | Prove replay, expected-version conflict, duplicate operation, payment capability denial, and fail-closed transaction behavior. | ADR-001/ADR-003; real disposable replica set; exact quote-line decision. | One-effect behavior, controlled 409/503 responses, and no non-atomic fallback. | Planned. |
| V-02-01 | 2 | Schema/reference/notification | Prove a non-destructive schema/reference report and duplicate/orphan handling plan before migration. | Data/retention decisions and representative isolated data. | Report identifies zero unexplained ambiguity or stops safely; no raw customer data in output. | Blocked by decision. |
| V-02-02 | 2 | Migration/backup/restore | Prove dry run, apply, second run, rollback, and restore on an isolated replica set. | Approved migration plan, encrypted backup custody, restore owner. | Aggregate-only evidence; backup restore succeeds; owned indexes/markers and historical-record preservation are verified. | Blocked by decision/environment. |
| V-03-01 | 3 | API transport/envelope | Prove documented error, pagination, invalid-data, timeout, retry, cancellation, and idempotency behavior. | API governance decision and stable fixtures. | Contract tests cover normal, malformed, offline/timeout, replay, conflict, permission, and service-unavailable cases. | Planning only. |
| V-03-02 | 3 | Notification/readiness/CMS | Prove truthful readiness and governed lifecycle/compatibility behavior. | Service-health and CMS/portfolio scope decisions. | Health endpoint distinguishes dependency failure; publish/rollback/recipient logic has explicit allowed states and tests. | Planning only. |
| V-04-01 | 4 | Customer/Retail/B2B/CMS integration | Prove each approved journey maps UI to API, service, data, and safe projection. | Explicit slice/portal/content authority; seeded role/customer data. | E2E table covers loading, empty, error, retry, conflict, permission, expiry, and success states. | Blocked by decision/environment. |
| V-05-01 | 5 | Objective UX/accessibility | Prove contrast, keyboard focus, dialog/menu trapping, targets, semantic errors/states, reduced motion, viewport/reflow. | Browser and assistive-technology matrix; component/factual-content owner. | Automated scans plus deterministic keyboard and responsive checks; manual AT/real-device evidence where required. | Partially environment-blocked. |
| V-06-01 | 6 | QA/release/artifact | Prove clean install, backend/frontend tests, critical E2E, artifact output, static/coverage/security/dependency/performance signals, and expected-skip enforcement. | Chosen package/runtime policy, CI services, public origin, browser engines, isolated database. | CI records exact SHA/runtime/environment; unexpected skip or absent artifact is a failure, not a pass. | Blocked by environment/decision. |
| V-07-01 | 7 | Deployment/operations | Prove immutable artifact promotion, same-origin/TLS/proxy behavior, controlled configuration, migration/restore/rollback drills, and handoff. | Hosting/topology, owner, RPO/RTO, provider decisions, staging-like environment. | Approved runbook execution log uses redacted aggregates; artifact and data recovery are tested as distinct operations. | Blocked by decision/environment. |
| V-08-01 | 8 | Reliability/observability/capacity | Prove telemetry redaction, alert delivery, readiness truth, worker/shutdown behavior, timeouts/retries, saturation/capacity, and frontend performance budgets. | Telemetry/SLO/on-call/capacity decisions; controlled load environment. | Dashboards/alerts receive test events; bounded load and failure tests meet approved SLO/budget. | Blocked by decision/environment. |
| V-09-01 | 9 | Governance/documentation | Prove every active plan/runbook/register reference is authoritative, current, and mapped to source/test/owner. | Documentation/release/dependency policy. | Link/path check, authority review, decision-status check, and no unregistered plan governs implementation. | Planning only. |
| V-10-01 | 10 | All applicable P0/P1 and accepted risks | Prove a production candidate is ready for an explicit human readiness decision. | Exact candidate, production-like environment, all Phase 0-9 exit evidence. | Full regression, security review, migration dry run, backup/restore, rollback, monitor/alert and handoff evidence are current and attributable. | Blocked by prior phases/environment. |

## Evidence rules

1. A skipped, environment-blocked, or discovery-only check is not a pass.
2. Every result names the exact SHA, command or procedure, environment,
   date/time, owner, limitation, and sanitized evidence location.
3. Do not print passwords, tokens, hashes, customer documents, session values,
   raw IP/user-agent values, or production secrets to prove a control.
4. A transaction-required check uses a real disposable Mongo replica set; fake
   collections cannot close concurrency, unknown-commit, or capability-loss
   findings.
5. A migration check must be non-destructive and include backup, dry run,
   validation, rollback, and restore. No production/shared data operation is
   implied.
6. Browser verification requires the authorized route/API/origin/role topology;
   static route inspection alone cannot close a user-journey finding.
7. Production candidate verification and go-live approval are separate gates.

## Current verification limitations

The audit already recorded useful local evidence: backend native and selected
replica-set tests, frontend unit tests, and compilation. It also recorded
blocked release postbuild, incomplete browser coverage, absent staging/production
topology, and missing operational drills. Those results remain audit evidence
for `c28684d`; they are not carried forward as passing evidence for a newer
candidate.
