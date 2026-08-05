# G0 — Release-Candidate Bounded Staging Scope

**Date:** 2026-08-05
**Status:** Coordination task card / context-only decision packet candidate
**Selected baseline:** `origin/main` at `e6d0d5aab4994264be4b662bff10c3743a03b7c1`
**Branch:** `codex/g0-bounded-staging-contract-20260805`
**Worktree:** `C:\tmp\niuva-g0-bounded-staging-contract-20260805`

## Purpose

Freeze a small, reviewable contract for the next parallel work packets so the
repository can move quickly toward a staging candidate without treating a
task card, passing local checks, a merged PR, or a staging artifact as
production-ready or go-live authorization.

This file is coordination context only. It does not amend the Master Spec,
Decision Register, an ADR, a runbook, or the production-readiness decision.
It does not authorize source implementation, provider selection or activation,
migration execution, production deployment, secret rotation, or go-live.

## Authority and baseline

The required reading order remains:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. The approved decision or ADR for the relevant slice
5. The applicable runbook
6. Current source and tests

The baseline was revalidated from the current remote `origin/main`. The
baseline includes the transaction-observability sanitizer change merged by
PR #141. No canonical authority or runbook file changed between the prior
audited head and this baseline.

Relevant boundaries include:

- The product remains one website with separate Retail and B2B journeys.
- Transaction-required mutations fail closed when MongoDB transaction
  capability is unavailable.
- Storage and Retail payment remain provider-neutral.
- The first Retail vertical slice is read-only discovery; checkout, payment,
  fulfillment, and provider activation remain separate gates.
- Production readiness and go-live remain open decisions.
- Route or topology direction does not authorize implementation, API/schema
  changes, migrations, infrastructure, or deployment.
- `docs/context/AI_AGENT_TEAM_WORKFLOW.md` and
  `docs/implementation/production-readiness/**` provide workflow and
  traceability context; they do not replace canonical authority.

## Candidate definition

The proposed candidate is a bounded, provider-neutral staging evaluation of
the existing application surfaces. It may prove reproducible build/runtime
behavior and evidence collection in an isolated environment. It is not a
production release.

Candidate evaluation may cover the following existing journeys, subject to
each slice's own evidence and authority:

- unified public homepage and public content;
- customer/staff authentication and session boundaries;
- B2B inquiry, quote, project, and work-order lifecycle;
- operational/Admin surfaces required to inspect those lifecycles;
- read-only Retail catalog/configurator discovery;
- customer-data minimization, authorization, transaction failure, retry, and
  observability contracts;
- reproducible frontend/backend checks and candidate artifact metadata.

The candidate must remain inactive or excluded for:

- Retail checkout, payment capture, manual payment proof, fulfillment,
  reservation, tax, Finance, or provider activation;
- production uploads or customer-facing storage activation;
- production migration apply/rollback or shared/staging data mutation;
- production credentials, real provider credentials, secret rotation, or
  external notification activation;
- final production topology, DNS/TLS/CORS approval, on-call ownership,
  incident readiness, production monitoring, or go-live.

## Proposed child goals and path ownership

These are proposed prompts for separate task cards. They are not assignments
until each receives an owner, verifier, exact authority, and path lock.

### G1 — Backend integrity and contract evidence

Revalidate and, only when separately authorized, close bounded backend defects
around authorization, customer projections, transaction failure/rollback,
conflict/retry behavior, and safe observability.

Initial path lock candidates:

- `backend/transaction_api.py`
- `backend/transaction_execution.py`
- `backend/transaction_guard.py`
- `backend/transaction_observability.py`
- the specifically related files under `backend/tests/test_transaction_*.py`
- the applicable API/transaction contract documentation only when expressly
  assigned

Do not touch migrations, provider adapters, payment activation, production
topology, or shared server/readiness/notification handlers without a separate
serial assignment.

### G2 — Auth, security, and abuse decision packet

Produce evidence and unresolved-decision closure for session security,
authorization, recovery, rate limiting, security events, MFA requirements,
retention, alert ownership, and abuse controls. Implementation remains
separate from a decision packet.

Initial path lock candidates:

- `backend/auth_*.py`
- the specifically related files under `backend/tests/test_auth_*.py`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/components/auth/**`
- `frontend/src/pages/auth/**`
- the specifically related frontend auth contract tests

Do not apply migrations, invent MFA parameters or key custody, activate an
alert provider, or claim production security readiness without named owners,
approved decisions, and environment evidence.

### G3 — Frontend candidate and role/accessibility evidence

Revalidate the unified public, authentication, operational, Admin, customer,
and bounded Retail discovery surfaces against the current design-system,
role/data, responsive, accessibility, and deep-link contracts.

Initial path lock candidates:

- `frontend/src/App.js`
- `frontend/src/pages/**`
- `frontend/src/components/**`
- `frontend/src/context/**`
- `frontend/src/lib/**`
- the specifically related `frontend/src/**/*.test.*` and contract tests
- `frontend/e2e/**` only when the task explicitly owns browser evidence

`frontend/src/App.js` and shared API/auth contracts are serial integration
paths. A frontend slice must not silently change backend envelopes, roles,
pricing, payment, storage, or lifecycle semantics.

### G4 — Reproducibility, staging operations, and rollback evidence

Prepare a provider-neutral candidate artifact/evidence packet covering build
inputs, environment inventory without secrets, health checks, release
identity, rollback artifact, backup/restore expectations, telemetry gaps,
owner matrix, and staging stop conditions.

Initial path lock candidates must be selected explicitly before work because
CI workflows, dependency manifests, deployment/runbook documents, and global
configuration are shared or strictly serial paths. No deployment or migration
execution is implied.

### G5 — Serial integration and release-candidate gate

After G1–G4 handovers, independently reconcile the selected SHA, changed and
unchanged paths, test/build/browser evidence, negative-path behavior, open
decisions, rollback needs, and external approvals. G5 is evidence assembly and
decision routing; it cannot self-approve production readiness or go-live.

## Shared contracts required before parallel edits

The following must be frozen or explicitly marked open in every child card:

- API envelope, error codes, idempotency, conflict, retry, and fail-closed
  behavior;
- role matrix and customer/internal data projection boundary;
- Retail/B2B lifecycle boundary and immutable pricing/order snapshots;
- provider-neutral storage/payment seam and inactive-state behavior;
- candidate artifact identity, environment separation, and rollback evidence;
- test commands, required negative cases, evidence location, and independent
  verifier;
- changed paths, intentionally unchanged paths, and known overlapping owners.

If a shared contract is unresolved, the affected slice remains held rather
than inventing behavior locally.

## Dependency and collision map

| Area | Rule |
| --- | --- |
| Canonical authority, readiness tracker, and traceability docs | Serial; do not edit from a child implementation packet unless explicitly assigned. |
| `backend/migrations/**` | Strictly serial; backup, dry-run, validation, rollback, owner, and environment evidence required. |
| `backend/server.py`, notification, readiness, and shared runtime handlers | Serial across backend slices. |
| API envelope and `frontend/src/lib/api.js` | Shared contract first; one owner at a time. |
| `frontend/src/App.js` | Serial integration path. |
| `frontend/package*.json` and `.github/workflows/**` | Strictly serial; no dependency or CI change implied by this card. |
| Deployment, rollback, topology, and production runbooks | Serial and authority-gated; no provider or production change from this card. |
| Final candidate evidence and readiness decision | Strictly serial after child handovers. |

## G0 acceptance criteria

G0 is complete only when this card records:

- the current baseline SHA and isolated worktree/branch;
- candidate scope and explicit inactive/excluded capabilities;
- canonical authority and non-authorizing context documents;
- proposed child goals with initial path ownership and exclusions;
- shared contracts, collision rules, dependencies, and stop conditions;
- required owner/verifier and evidence fields for each follow-up card;
- commit, push, and PR authorization for this documentation change;
- explicit non-authorization for merge, deployment, provider activation,
  migration apply, secret rotation, readiness, and go-live.

## Required child-card fields

Each follow-up goal must state, before editing:

1. objective and measurable acceptance criteria;
2. exact in-scope and intentionally unchanged paths;
3. applicable canonical authority, decision/ADR, and runbook;
4. owner, independent verifier, dependency, and handoff order;
5. minimum local/CI/browser/negative-path verification;
6. migration, data, rollback, observability, and security impact;
7. unresolved decisions, external owners, and stop conditions;
8. whether commit, push, and PR are authorized for that slice.

## Open decisions that keep production/go-live closed

- staging target, access, data policy, and accountable operator;
- backup/restore target, custody, restore window, validation, and rollback
  owner;
- production topology, on-call, monitoring, alert routing, and incident
  ownership;
- MFA parameters, recovery/key-management policy, retention, and security
  event alert ownership;
- final public origin, DNS/TLS, CORS, secrets, and notification policy;
- provider selection/activation for storage, payment, email, or shipping;
- external consumer/probe ownership and compatibility evidence;
- independent release review and final production-readiness/go-live authority.

## Handover format

Every child handover must answer:

- What changed?
- What was intentionally unchanged?
- Which checks passed, failed, or were not run?
- What risks, rollback needs, or data impact remain?
- Which decisions or external owners are still open?
- Which actions remain unauthorized (provider, migration, deployment,
  readiness, or go-live)?
