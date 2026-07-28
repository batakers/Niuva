# DEC-AUTH-006 — Authentication Abuse-Protection Interface and Bounded Deferral

Status: **Approved with Open Decisions**
Decision ID: `DEC-AUTH-006`
Decision date: 27 July 2026
Approval source: Explicit owner approval of all recommendations in the Admin
Authentication Phase 0 decision packet on 27 July 2026
Scope: Provider-neutral shared limiter interface, privacy and public-response
invariants, resend cooldown, and the production inputs that remain deferred
Related review item: `AUTH-P0-02`
Related prior decision: `DEC-AUTH-002`

## Context

`DEC-AUTH-002` rejected process-local buckets as production login authority and
deferred store/topology selection until worker, proxy, atomic-store, outage,
privacy, threshold, and ownership inputs are known. The current forgot-password
implementation nevertheless uses process-local plaintext-email and IP buckets;
login has no shared abuse protection.

The owner has now approved the provider-neutral interface direction and a
60-second resend contract. The underlying provider/topology and remaining
numeric thresholds are still not selected.

## Decision

### Approved direction

- Production login and recovery abuse protection use a provider-neutral
  distributed limiter interface backed by an atomic shared adapter.
- An edge/gateway limiter may add defense in depth but is not the only
  account-aware control.
- Process-local buckets remain non-authoritative for production.
- Identifier dimensions use HMAC/pseudonymous normalized identifiers rather
  than retaining plaintext email as a long-lived limiter key.
- Combine account/identifier and authoritative client-address dimensions.
- Known and unknown accounts use the same public response contract.
- Public traffic alone does not cause permanent account lockout.
- Rate-limited responses use HTTP 429 and `Retry-After`.
- Successful authentication resets or disregards failure counters according to
  the later approved threshold policy.
- Forgot-password resend has a server-enforced 60-second cooldown; the frontend
  renders the same interval but is not the security authority.

### Explicitly not approved

- The current `3 requests per 15 minutes` forgot-password value remains
  implementation evidence, not canonical policy.
- No login attempt threshold, IP budget, maximum progressive delay, store
  outage behavior, proxy trust contract, retention period, or operational owner
  is selected by this decision.
- No Redis, MongoDB, gateway, proxy, SaaS, or other provider/adapter is selected.

## Relationship to DEC-AUTH-002

This decision amends `DEC-AUTH-002` only by approving:

- a provider-neutral shared atomic limiter interface;
- privacy/public-response invariants; and
- the 60-second forgot-password resend cooldown.

`DEC-AUTH-002` remains authoritative for the unselected production topology,
adapter/store, trusted client-address contract, remaining thresholds, outage
behavior, privacy/retention details, operational ownership, and implementation
deferral.

## Reopening Inputs Required

Before limiter implementation or production-readiness approval, record:

- production worker/instance topology;
- trusted proxy and authoritative client-address rules;
- available/approved shared atomic adapter;
- store-outage and fail-open/fail-closed behavior per operation;
- login account/IP thresholds and progressive-delay schedule;
- forgot-password broader account/IP budget beyond the approved 60-second
  resend cooldown;
- key retention/deletion and privacy review;
- monitoring, support, and operational owner.

## Required Verification for a Later Approved Implementation

- Multi-worker concurrency cannot exceed the approved atomic budget.
- Forwarded-address spoofing tests enforce the approved proxy contract.
- Known and unknown identifiers receive equivalent public status/body/budget.
- 429 and `Retry-After` are deterministic and frontend countdowns follow them.
- Limiter keys do not retain plaintext email.
- Store outage behavior matches the separately approved operation policy.

## Excluded from Approval

This decision does not authorize a provider/store, the unselected thresholds,
source implementation, dependency, infrastructure, commit, push, rollout,
production activation, or go-live. Absence of an implemented distributed
limiter remains a production-release blocker rather than accepted risk.
