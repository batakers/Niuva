# DEC-AUTH-004 — Password Policy and Hash Migration Direction

Status: **Approved with Open Decisions**
Decision ID: `DEC-AUTH-004`
Decision date: 27 July 2026
Approval source: Explicit owner approval of all recommendations in the Admin
Authentication Phase 0 decision packet on 27 July 2026
Scope: One password policy for login, reset, invitation, and credential change;
password-hash migration direction
Related review item: `AUTH-P0-06`

## Context

Current password validation is inconsistent: reset/client paths use a minimum
of six characters, staff invitation uses a different range, login has no safe
maximum, and bcrypt has a 72-byte input boundary. The frontend therefore cannot
render a trustworthy dynamic checklist from current implementation constants.

NIST SP 800-63B and OWASP guidance favor password length, blocklisting common or
compromised choices, password-manager compatibility, no composition rules, and
modern adaptive password hashing. These references informed the approved Niuva
selection but do not independently authorize implementation.

## Decision

### Password rules

One backend-owned policy governs password creation, reset, invitation, and
credential change:

- minimum 15 Unicode code points while password-only authentication remains
  possible;
- maximum 128 Unicode code points;
- defensive maximum 512 UTF-8 bytes;
- spaces, printing characters, Unicode, paste, password managers, autofill, and
  accessible show/hide controls are permitted;
- uppercase, lowercase, number, and symbol composition rules are not imposed;
- the whole proposed password is checked against an approved maintained
  common/compromised-password blocklist;
- periodic rotation is not required without user request or evidence of
  compromise;
- passwords are never silently truncated;
- backend enforcement is authoritative and frontend presentation derives from
  the backend policy interface.

The minimum does not automatically decrease merely because MFA code exists. A
later decision may reopen it only after MFA is enforced for every affected
account and compatibility impact is reviewed.

### Password hashing

- New password hashes use Argon2id.
- Existing bcrypt hashes remain valid during a non-destructive compatibility
  period.
- A successful password verification or reset may rehash an existing bcrypt
  credential to Argon2id after all normal authentication/eligibility checks
  succeed.
- Hash records retain algorithm and work-parameter metadata needed for future
  upgrades.
- Existing users are not forced into a destructive bulk password rewrite.
- Exact Argon2id cost parameters must be benchmarked in the target environment
  before implementation approval.

### Policy interface

Expose a read-only `GET /api/auth/password-policy` interface, or an equivalent
approved interface at the same seam, so frontend checklists do not duplicate
password constants. The public policy may describe rules but never exposes
blocklist contents, hash data, work secrets, or credential state.

## Open Decisions and Preconditions

- Exact Argon2id dependency and version.
- Environment-specific memory/time/parallelism parameters and performance
  budget.
- Blocklist source, update procedure, outage behavior, privacy treatment, and
  operational owner.
- Optional pepper/key-management design, if any.
- Whether customer-facing copy uses the same minimum immediately or requires a
  separately approved compatibility window. Backend acceptance must never be
  weaker than the effective approved policy for newly created credentials.

## Consequences

- Current six/eight-character rules are not the approved target.
- Bcrypt remains a legacy verification adapter, not the new-hash default.
- The UI checklist becomes policy-driven rather than hardcoded.
- Argon2id introduces a dependency and resource cost that require separate
  implementation approval and verification.

## Required Verification for a Later Approved Implementation

- Boundary tests cover code points, UTF-8 bytes, spaces, Unicode, oversized
  requests, and no silent truncation.
- Common/compromised choices are rejected with safe actionable feedback.
- Password-manager paste/autofill and show/hide behavior remain functional.
- Existing bcrypt credentials authenticate and migrate safely.
- Failed authentication never triggers a rehash or credential mutation.
- Argon2id cost benchmarks satisfy the approved latency/resource budget.
- Policy endpoint and backend validation remain consistent.

## Excluded from Approval

This decision does not approve a dependency installation, exact work factors,
blocklist provider/data acquisition, source changes, migration execution,
commit, push, rollout, production activation, or go-live.
