# DEC-AUTH-002 — Rate-Limit Topology Deferral and Phase A Planning Boundary

Status: **Approved Deferral Decision**
Decision ID: `DEC-AUTH-002`
Decision date: 25 July 2026 (Asia/Jakarta; 24 July 2026 UTC)
Approval source: Explicit user approval in the backend-authentication-hardening
conversation on 25 July 2026 (Asia/Jakarta)
Scope: Login rate-limit topology decision state and the next permitted planning
slice

## Context

The current backend has only a process-local in-memory rate-limit helper. It is
not consistent across workers, instances, or restarts. The approved deployment
topology and available shared store have not been established, so selecting
MongoDB, Redis, another provider, or single-process enforcement would invent an
infrastructure decision.

`DEC-AUTH-001` separately establishes the public login-failure and blocked-token
issuance contract. That bounded login issuance work can be planned without
selecting a rate-limit topology.

## Decision

- Login rate-limit topology and backing storage remain **not selected**.
- Distributed/shared login rate-limit implementation is deferred.
- Process-local `_rate_buckets` must not be promoted as a production login
  authority.
- The next permitted activity is documentation-only preparation of the bounded
  Phase A login issuance slice governed by `DEC-AUTH-001`.
- Phase A planning must not include rate-limit implementation, password-policy
  selection, token/session-policy selection, authentication-event persistence,
  role migration, or production rollout.

## Reopening Conditions

The rate-limit decision may be reopened only when the following are known:

- approved production worker/instance topology;
- trusted proxy and authoritative client-address contract;
- available or approved shared atomic store;
- store-outage behavior;
- identifier privacy, retention, and deletion rules;
- thresholds, windows, dimensions, and operational owner.

## Consequences

- `AUTH-DEC-02`, `AUTH-DEC-03`, and `AUTH-DEC-04` remain open rather than being
  silently answered.
- Phase B in the backend authentication hardening plan remains blocked.
- Phase A may be prepared for later review without implying source
  implementation approval.
- Absence of a selected limiter does not mean login abuse risk is accepted; it
  remains an open security finding.

## Excluded from Approval

This decision does not authorize:

- source-code changes, commit, push, or rollout;
- a single-process production assumption;
- MongoDB, Redis, proxy, gateway, or another provider selection;
- login thresholds or response headers;
- production activation or go-live.
