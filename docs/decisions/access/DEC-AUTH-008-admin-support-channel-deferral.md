# DEC-AUTH-008 — Admin Support Channel Deferral

Status: **Approved Deferral Decision**
Decision ID: `DEC-AUTH-008`
Decision date: 27 July 2026
Approval source: Explicit owner approval of all recommendations in the Admin
Authentication Phase 0 decision packet on 27 July 2026
Scope: “Bantuan Admin” destination and controlled blocked-account/MFA recovery
ownership
Related review item: `AUTH-P0-08`

## Context

The repository contains public `/contact`, company email/WhatsApp data, and an
`HRD_EMAIL` delivery path. None is documented as an Admin-support or privileged
account-recovery channel. Treating any of them as Admin support would invent
semantics, access, ownership, and identity-verification procedures.

## Decision

- The “Bantuan Admin” link is deferred and omitted from the Concept A
  implementation until an exact existing internal destination and accountable
  operator are approved.
- Public `/contact`, company WhatsApp/contact data, and `HRD_EMAIL` are not used
  for privileged Admin recovery by assumption.
- No new email address, WhatsApp number, route, ticket system, or provider is
  invented by this decision.
- Disabled/review-blocked internal account recovery and MFA recovery remain
  unavailable through self-service and require a later approved controlled
  procedure.
- Concept A may proceed without the help utility while the destination remains
  deferred, provided the UI does not render a dead or misleading control.

## Reopening Inputs Required

To approve a support destination, record:

- exact existing configuration key, email destination, or internal route;
- accountable operator and backup owner;
- service hours and escalation expectations;
- identity-verification procedure for blocked account and MFA recovery;
- data fields visible to support staff;
- request retention/deletion policy;
- abuse, impersonation, and emergency break-glass handling.

## Consequences

- The Concept A header must not show “Bantuan Admin” until this decision is
  reopened and resolved.
- Mandatory MFA rollout under `DEC-AUTH-007` remains operationally blocked until
  controlled recovery ownership exists.
- This deferral does not authorize use of public contact or HRD channels as a
  temporary fallback.

## Excluded from Approval

This decision does not authorize a destination, support workflow, provider,
source change, configuration change, credential handling, commit, push,
rollout, production activation, or go-live.
