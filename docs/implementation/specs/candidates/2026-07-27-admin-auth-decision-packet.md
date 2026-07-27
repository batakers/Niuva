# Admin Authentication Phase 0 — Decision Packet

Status: **Context Only — Approved Selections Recorded in DEC-AUTH-003 through DEC-AUTH-009 — No Implementation Authorization**
Date: 27 July 2026
Decision owner: Project Owner
Technical reviewer: Acting Technical Owner
Approval source: Explicit owner approval of all Phase 0 recommendations on
27 July 2026.
Scope: Admin authentication, account recovery, session, abuse protection,
second factor, support, security events, and the frontend/backend interface
needed by “Focused Admin Access — Concept A”.

Canonical authority:

- `docs/NIUVA_MASTER_SPEC.md`
- `docs/context/DOCUMENT_REGISTER.md`
- `docs/decisions/DECISION_REGISTER.md`
- `docs/decisions/access/DEC-AUTH-001-login-failure-and-legacy-compatibility.md`
- `docs/decisions/access/DEC-AUTH-002-rate-limit-topology-deferral.md`
- `docs/decisions/access/DEC-AUTH-003-account-recovery-contract-and-compatibility.md`
- `docs/decisions/access/DEC-AUTH-004-password-policy-and-hash-migration.md`
- `docs/decisions/access/DEC-AUTH-005-admin-session-transport-and-remember-me.md`
- `docs/decisions/access/DEC-AUTH-006-abuse-protection-interface-and-deferral.md`
- `docs/decisions/access/DEC-AUTH-007-internal-mfa-staged-direction.md`
- `docs/decisions/access/DEC-AUTH-008-admin-support-channel-deferral.md`
- `docs/decisions/access/DEC-AUTH-009-authentication-security-event-governance.md`
- `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`
- `docs/decisions/experience/DEC-OPS-001-admin-studio-operational-direction.md`
- `docs/decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md`
- `docs/decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md`

This approval evidence does not change source code, select an infrastructure or identity
provider, approve a dependency, authorize a migration, or authorize commit,
push, rollout, production readiness, or go-live.

## 1. Purpose and Decision Semantics

The repository already contains login and password-recovery implementation, but
several runtime values were implemented before their policy authority was
reconciled. Current source and tests are implementation evidence, not automatic
approval of:

- password rules or password-hashing migration;
- token transport, session duration, refresh, logout, or “remember me”;
- rate-limit topology, store, dimensions, or thresholds;
- second-factor requirement;
- recovery eligibility;
- Admin support destination;
- security-event fields, access, or retention.

This packet made those questions reviewable without silently converting the
current implementation into policy. The owner approved all recommended Phase 0
selections on 27 July 2026. `DEC-AUTH-003` through `DEC-AUTH-009` now record the
approved directions, bounded deferrals, open consequences, and implementation
gates. This packet remains context and approval evidence, not policy authority.

## 2. Fixed Constraints

The following constraints are already authoritative and are not reopened by
this packet:

1. Unknown email, wrong password, disabled account, and
   `access_review_required` share the generic public login failure defined by
   `DEC-AUTH-001`; none receives a token.
2. The supported low-privilege legacy `role: client` compatibility path remains
   valid until a separately approved non-destructive migration replaces it.
3. Process-local rate buckets are not production login authority.
   `DEC-AUTH-002` remains in force until an approved successor decision records
   the missing topology, privacy, threshold, and ownership inputs.
4. Cross-collection mutations that require atomicity use MongoDB transactions
   and fail closed when transaction capability is unavailable. No non-atomic
   fallback is permitted.
5. Backend handlers and data queries enforce authorization with least
   privilege. A route, hidden page, token claim, or frontend role check is not
   an authorization boundary.
6. Admin authentication follows the calm, task-oriented, recovery-aware
   operational direction in `DEC-OPS-001`; public Homepage decoration,
   pseudo-terminal styling, and fake telemetry are excluded.
7. No secret, credential, raw reset token, OTP, recovery code, or API key may be
   written to source, product documentation, logs, general notifications, or
   public responses.
8. Provider selection, production activation, and go-live remain outside this
   packet.

## 3. Verified Current Implementation Evidence

The following table records evidence only. The values in this column are not
policy authority.

| Area | Current implementation evidence | Authority state |
|---|---|---|
| Customer login | `POST /api/auth/login` returns `{token,user}` | Generic blocked-account failure is approved by `DEC-AUTH-001`; session policy remains open |
| Admin login | `POST /api/auth/admin/login` authenticates then requires `admin.access` | Permission boundary is approved; transport/session policy remains open |
| Session | HS256 JWT, fixed seven-day expiry, frontend `localStorage`, local-only logout | Open decision |
| Cookie | Backend accepts `access_token` cookie fallback but does not issue or clear it | Implementation inconsistency; not an approved transport |
| Forgot password | Generic happy-path response, random URL token, SHA-256 token hash, current 30-minute expiry | Generic response is required; TTL and recovery policy need explicit approval |
| Resend | Reusing forgot invalidates older tokens sequentially | No approved resend contract; requested UX cooldown is 60 seconds |
| Forgot limiter | Process-local per-IP and plaintext-email buckets, currently 3 requests per 15 minutes | Not production authority; thresholds are not canonically approved |
| Reset | Password update, `token_version` increment, then token invalidation in separate writes | Conflicts with transaction fail-closed guardrail |
| Password rules | Minimum 6 in reset/client paths, minimum 8 and maximum 256 in staff invitation, no login maximum | Inconsistent and open |
| Password hash | bcrypt; runtime evidence confirms its 72-byte input boundary matters | Hash migration is open |
| Recovery email | Raw URL token enters generic notification `body_html` | Security defect; must not be normalized as policy |
| Admin bootstrap | Existing admin password may be rewritten from environment on startup without session-version increment | Security defect; not an approved recovery policy |
| MFA | No enrollment, challenge, recovery, or step-up implementation | Open decision |
| Admin help | Public contact/HRD facilities exist; no approved Admin-support destination exists | Open decision |

## 4. Proposed Module and Seam

This section proposes a codebase shape for later review; it does not authorize a
file or source change.

### 4.1 Authentication recovery module

Use one deep **module** for credential recovery. Its external **interface**
should expose only the behavior callers need:

```text
request_password_reset(normalized_email, request_context)
validate_password_reset(raw_token)
complete_password_reset(raw_token, new_password)
```

The interface includes these invariants:

- public request responses do not reveal account existence;
- tokens are cryptographically random, single-use, time-bounded, and never
  persisted or logged in raw form;
- completion atomically consumes the token, changes the password, increments
  the session version, and invalidates sibling recovery tokens;
- transaction unavailability fails closed;
- delivery failure and security telemetry never enter the public response as
  account-state detail.

Token storage, clock, email delivery, transaction capability, and redacted
security events are internal seams. Production and test adapters justify those
seams; they must not leak through the external interface.

### 4.2 Authentication policy module

Use one read-only policy **interface** as the source for both backend validation
and frontend rendering:

```text
get_password_policy()
get_session_policy()
get_public_auth_error(error_key, locale)
```

The frontend must not duplicate password rules, session duration, or raw
backend errors. Policy presentation may be cached, but backend enforcement is
always authoritative.

### 4.3 Session module

If cookie-backed sessions are approved, isolate creation, rotation,
revocation, idle/absolute expiry, and cookie attributes behind one session
module. Login, refresh, logout, password reset, account disablement, access
review, and role/permission changes must use the same interface rather than
mutating token/session state independently.

## 5. Standards Used as Decision Inputs

These sources are benchmarks, not Niuva approval:

- NIST SP 800-63B (August 2025):
  `https://pages.nist.gov/800-63-4/sp800-63b.html`
- OWASP Authentication Cheat Sheet:
  `https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html`
- OWASP Password Storage Cheat Sheet:
  `https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html`
- OWASP Forgot Password Cheat Sheet:
  `https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html`
- OWASP Session Management Cheat Sheet:
  `https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html`
- OWASP Multifactor Authentication Cheat Sheet:
  `https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html`

The resulting proposals favor long passwords without composition rules,
blocklisting compromised/common values, no periodic rotation without evidence
of compromise, secure single-use recovery tokens, generic recovery responses,
server-side session invalidation, secure cookie attributes, and MFA for
privileged users.

## 6. Decision Docket

### AUTH-P0-01 — Recovery population and surface compatibility

**Question:** Should password recovery remain shared by Admin and Customer
accounts, or become Admin-only?

**Options:**

- **A — Shared backend recovery interface; surface-specific presentation.**
  Preserve `/api/auth/forgot-password` and `/api/auth/reset-password` for all
  eligible users. Concept A applies to Admin presentation. Compatibility routes
  remain valid; a verified reset result may return an allowlisted login
  destination without exposing role before token possession.
- **B — Separate Admin and Customer recovery endpoints.**
  Each surface owns routes and delivery copy. This increases interfaces,
  duplication, and regression risk.
- **C — Admin-only recovery.**
  Customer recovery is removed or blocked. This would be a product regression
  and requires separate customer-access authority.

**Recommendation for review:** **Option A.** It preserves approved legacy
customer compatibility and gives callers one deep recovery module while
keeping Admin UX visually distinct.

**Status:** Approved; canonical record: `DEC-AUTH-003`.

### AUTH-P0-02 — Login and recovery abuse protection

**Question:** What shared enforcement contract replaces process-local buckets?

**Options:**

- **A — Keep process-local buckets.**
  Rejected for production by `DEC-AUTH-002`.
- **B — Provider-neutral distributed limiter interface with an atomic shared
  adapter.**
  Store/provider selection remains separate but all production adapters must
  satisfy the same atomic interface.
- **C — Edge/gateway-only limiter.**
  Useful as defense in depth, but insufficient as the only account-aware
  control.

**Recommendation for review:** **Option B**, with optional edge defense:

- use HMAC/pseudonymous normalized-email keys rather than plaintext email;
- combine account/identifier and authoritative client-address dimensions;
- do not expose whether an account exists;
- avoid permanent account lockout caused only by public forgot/login traffic;
- return `429` with `Retry-After`;
- reset successful-login failure counters according to the approved policy;
- enforce the requested resend cooldown of 60 seconds server-side and render
  the same interval in the client;
- preserve the current `3 per 15 minutes` forgot budget only as an
  implementation observation until the owner explicitly approves or changes
  it;
- keep login thresholds, maximum progressive delay, IP budget, store-outage
  behavior, trusted-proxy contract, retention, and operational owner open until
  the reopening inputs required by `DEC-AUTH-002` are supplied.

Approving this interface alone does not authorize a provider or limiter
implementation. Phase 1 may proceed without presenting the current bucket as a
production control; production release remains blocked.

**Status:** Approved with the listed topology and operations inputs deferred;
canonical record: `DEC-AUTH-006`.

### AUTH-P0-03 — Password-recovery token and delivery contract

**Question:** Which token, delivery, expiry, invalidation, and public-response
rules are canonical?

**Recommendation for review:**

- preserve a generic forgot response for known, unknown, disabled,
  review-blocked, and delivery-failure public paths;
- generate at least 256 bits of randomness for a URL token;
- persist only a cryptographic token hash;
- use a 30-minute token TTL;
- permit one active reset token per user;
- atomically claim and consume the token;
- atomically update the password, increment session version, and invalidate
  sibling reset tokens;
- automatically revoke all existing sessions after a successful reset;
- never automatically log the user in after reset;
- send a separate post-reset notification with no password or reset token;
- do not persist the raw token in general notifications, logs, audit events,
  analytics, or provider error payloads;
- validate one backend-only `PUBLIC_SITE_URL` as an allowlisted absolute HTTPS
  origin outside local development;
- if delivery fails, invalidate the undelivered token where possible, record a
  redacted operational failure, and keep the public response generic;
- mask the user-submitted email client-side for the check-email screen on every
  outcome; masking must not depend on an account lookup.

Eligibility for explicitly disabled, review-blocked, or unmigrated internal
accounts is decided in `AUTH-P0-04`.

**Status:** Approved; canonical record: `DEC-AUTH-003`.

### AUTH-P0-04 — Recovery eligibility

**Question:** Which account states may receive a usable reset token?

**Options:**

- **A — Active eligible accounts only.**
  Disabled and `access_review_required` records receive the same public response
  but no usable token.
- **B — Any account with a verified email.**
  This may let a blocked user rotate a credential but does not restore access.
- **C — Policy by account class.**
  Active customers and active internal accounts use self-service recovery;
  blocked internal accounts require an approved support/review procedure.

**Recommendation for review:** **Option C.** Preserve self-service for active
supported customers and internal users; issue no token to disabled or
review-blocked internal users, while keeping the public response identical.
Their recovery path must use the approved Admin-support/access-review procedure.

**Status:** Approved; recovery eligibility is recorded in `DEC-AUTH-003`, while
the controlled support destination remains deferred by `DEC-AUTH-008`.

### AUTH-P0-05 — MFA requirement and recovery

**Question:** Is a second factor required for internal/Admin access?

**Options:**

- **A — No MFA in the approved target.**
  Lowest effort and highest credential-compromise exposure.
- **B — TOTP required for every internal role, with hashed single-use recovery
  codes.**
  Broad authenticator support and moderate implementation cost; not
  phishing-resistant.
- **C — Passkey/WebAuthn required.**
  Phishing-resistant target with higher enrollment, device, recovery, and
  browser-support work.
- **D — Staged B then C.**
  TOTP establishes mandatory MFA first; passkeys become the preferred
  phishing-resistant factor in a separately approved later phase.

**Recommendation for review:** **Option D**:

- customer MFA remains outside this Admin packet;
- all internal roles must enroll before normal Admin access;
- no email or security questions as an MFA factor;
- TOTP secrets are encrypted at rest; OTPs are short-lived, single-use within
  their acceptance window, attempt-limited, and never logged;
- recovery codes are random, hashed, individually single-use, replaceable, and
  shown only at enrollment/regeneration;
- factor change/removal requires reauthentication with an existing factor or a
  controlled support recovery;
- step-up is required for access-management, credential, session, and MFA
  changes;
- MFA recovery must not be weaker than normal Admin authentication.

**Status:** Approved with open decisions; canonical record: `DEC-AUTH-007`.

### AUTH-P0-06 — Password and password-hashing policy

**Question:** What one policy governs password creation, reset, invitation, and
verification?

**Options:**

- **A — Retain bcrypt as a legacy-only policy.**
  Enforce the bcrypt 72-byte boundary without silent truncation. This has lower
  migration cost but cannot provide a clean long-Unicode-password experience.
- **B — Adopt Argon2id for new hashes with backward-compatible bcrypt
  verification and rehash-on-success/reset.**
  Existing hashes remain usable; migration is non-destructive and gradual.
- **C — Select an external identity provider.**
  This is outside current provider-neutral scope and is not recommended as a
  Phase 0 shortcut.

**Recommended policy proposal:**

- select **Option B**;
- minimum 15 Unicode code points while password-only authentication remains
  possible;
- maximum 128 Unicode code points and a defensive maximum of 512 UTF-8 bytes;
- permit spaces, Unicode, paste, password managers, and show/hide controls;
- no uppercase/lowercase/number/symbol composition rule;
- compare the whole proposed password against a maintained common/compromised
  password blocklist;
- no periodic forced rotation without user request or evidence of compromise;
- no silent truncation;
- store hash algorithm and work parameters to support later rehash;
- new dependency and exact Argon2id cost tuning require explicit implementation
  approval and environment performance verification.

If MFA is later enforced for every affected account, the minimum may be
reopened. It must not drop automatically merely because MFA code exists.

**Status:** Approved with open decisions; canonical record: `DEC-AUTH-004`.

### AUTH-P0-07 — Session, transport, and “remember me”

**Question:** How are authenticated Admin sessions transported, persisted,
expired, refreshed, and revoked?

**Options:**

- **A — Continue bearer JWT in `localStorage`.**
  Lowest change cost, but a same-origin script compromise can extract the token.
- **B — Same-origin secure HttpOnly cookie session with rotation and
  server-side revocation.**
  Requires CSRF and origin controls but removes JavaScript access to the session
  credential.
- **C — Backend-for-frontend/session broker.**
  Strong separation but introduces a broader topology/module change.

**Recommendation for review:** **Option B** for the current route-based,
same-origin application:

- no auth token in `localStorage` or `sessionStorage`;
- `Secure`, `HttpOnly`, `Path=/`, no `Domain`, and `SameSite=Strict` session
  cookies using a `__Host-` prefix in production;
- synchronizer CSRF token plus Origin/Referer validation on state-changing
  cookie-authenticated requests;
- short-lived access credential proposal: 15 minutes;
- default session proposal: 30-minute idle timeout and 8-hour absolute limit;
- “Ingat saya” defaults off and, when selected, permits a rotating persistent
  session with a seven-day absolute limit and an eight-hour idle limit;
- rotate on login, refresh, privilege/role change, and step-up;
- revoke on logout, password reset, disabled/review-blocked state, credential
  compromise, and security-owner action;
- send `Cache-Control: no-store` on responses carrying session credentials.

This decision depends on the current same-origin route topology. A future
subdomain or separate-application decision must reopen cookie scope, SameSite,
CORS, CSRF, and token handoff.

**Status:** Approved with open decisions; canonical record: `DEC-AUTH-005`.

### AUTH-P0-08 — “Bantuan Admin” destination and recovery owner

**Question:** Which existing facility is authorized for Admin access recovery?

**Verified constraint:** `/contact`, company email/WhatsApp data, and
`HRD_EMAIL` exist, but none is documented as an Admin-support channel.

**Options:**

- **A — Reuse public `/contact`.**
  Not recommended because its semantics and data flow are public inquiry/HRD,
  not privileged account recovery.
- **B — Approve a configuration-backed existing internal email destination.**
  Requires the owner to name the exact existing destination and accountable
  operator. No address is invented or stored in source.
- **C — Approve an existing internal ticket/help route.**
  Requires an exact current route and accountable operator.
- **D — Defer the help link.**
  Concept A ships without “Bantuan Admin” until a valid channel is approved.

**Recommendation for review:** **Option D unless the owner supplies an exact
existing destination and owner.** Do not link public contact or HRD by
assumption.

**Required owner input if selecting B or C:**

- exact configuration key or route;
- accountable operator;
- service hours/escalation expectation;
- identity-verification procedure for blocked account or MFA recovery;
- fields that support staff may view and retention of the request.

**Status:** Approved deferral; canonical record: `DEC-AUTH-008`.

### AUTH-P0-09 — Authentication security-event governance

**Question:** Which authentication events may be persisted, who may access
them, and for how long?

**Recommendation for review:**

- use a dedicated redacted security-event module, not general notifications;
- record login success, classified login failure, reset request processing,
  reset completion, session revocation, MFA enrollment/change/recovery, and
  limiter decisions;
- never record passwords, hashes, raw/reset tokens, OTPs, recovery codes,
  cookie values, Authorization headers, or provider payloads;
- pseudonymize unknown identifiers; do not persist plaintext unknown-email keys;
- restrict access to the explicitly approved security/technical owner; do not
  reintroduce the removed general Admin Audit viewer;
- proposed retention: 90 days, followed by deletion or aggregation without
  direct identifiers;
- define alerting separately for repeated privileged-account failures, recovery
  abuse, and MFA recovery;
- public responses remain governed by `DEC-AUTH-001`, regardless of internal
  classification.

**Options for retention:** 30, 90, or 180 days. **Recommended proposal: 90
days**, subject to owner, legal/privacy, and storage review.

**Status:** Approved with owner assignment and operational details still open;
canonical record: `DEC-AUTH-009`.

### AUTH-P0-10 — Compatibility routes and frontend/backend interface

**Question:** Which routes and response contracts are stable for the Concept A
implementation?

**Recommended frontend routes:**

- preserve `/admin/login`;
- preserve `/forgot-password`;
- add `/forgot-password/check-email`;
- preserve `/reset-password`;
- add `/reset-password/success`;
- add `/reset-password/error`.

**Recommended backend interface:**

- preserve `POST /api/auth/admin/login`;
- preserve `POST /api/auth/login` for customer compatibility;
- preserve `POST /api/auth/forgot-password`;
- add `POST /api/auth/reset-password/validate`;
- add `GET /api/auth/password-policy`;
- preserve `POST /api/auth/reset-password`;
- add logout/refresh/session endpoints only if `AUTH-P0-07` is approved;
- add MFA enrollment/challenge/recovery endpoints only if `AUTH-P0-05` is
  approved.

**Interface rules:**

- additive response changes preserve supported clients;
- public errors use an allowlisted stable error key and localized safe copy;
- unknown, expired, and used reset tokens share one public invalid-token key;
- 429 includes `Retry-After`;
- transaction unavailability has a stable retryable error and performs no
  partial mutation;
- raw framework exceptions and arbitrary backend JSON are never rendered;
- the reset token is captured once, kept only in ephemeral state, and removed
  from the visible browser URL/history before form interaction;
- direct visits to check-email/success/error pages have safe generic fallback
  copy and do not require a full email or token in route state.

**Status:** Approved; the interface contract is distributed across
`DEC-AUTH-003`, `DEC-AUTH-004`, `DEC-AUTH-005`, and `DEC-AUTH-007`.

## 7. Decision Summary for Owner Review

| ID | Recommended selection | Owner response |
|---|---|---|
| `AUTH-P0-01` | Shared backend recovery; surface-specific presentation | Approved |
| `AUTH-P0-02` | Provider-neutral shared limiter interface; 60-second resend; remaining values gated | Approved; remaining inputs deferred |
| `AUTH-P0-03` | 256-bit, hashed, 30-minute, atomic single-use reset; revoke all sessions | Approved |
| `AUTH-P0-04` | Active users self-service; blocked internal users use controlled recovery | Approved; support destination deferred |
| `AUTH-P0-05` | Mandatory internal MFA: TOTP first, passkey target | Approved |
| `AUTH-P0-06` | Argon2id migration; 15–128 code points; no composition; blocklist | Approved |
| `AUTH-P0-07` | Same-origin HttpOnly cookie session; remember-me off by default | Approved |
| `AUTH-P0-08` | Defer help link unless exact existing Admin-support destination is supplied | Approved deferral |
| `AUTH-P0-09` | Dedicated redacted events; proposed 90-day retention | Approved |
| `AUTH-P0-10` | Preserve compatibility routes; add validation/policy/dedicated-state routes | Approved |

The owner approved every recommended selection on 27 July 2026. The dedicated
records named above are authoritative. A deferred or open consequence remains
an implementation/release blocker only for the phase that depends on it.

## 8. Reconciliation with Existing Auth Documents

| Existing document or decision | Reconciled use |
|---|---|
| `DEC-AUTH-001` | Its core login-failure and compatibility contract remains authoritative; subsequent bounded decisions are cross-referenced |
| `DEC-AUTH-002` | Remains authoritative for topology and threshold deferrals; amended, not replaced, by `DEC-AUTH-006` |
| `DEC-AUTH-003` through `DEC-AUTH-009` | Canonical authority for the selections, deferrals, and open consequences approved from this packet |
| `2026-07-25-forgot-reset-password-implementation-plan.md` | Context and implemented-state evidence only; its TTL, threshold, scope, and session statements do not become policy by implementation |
| `2026-07-25-backend-authentication-hardening.md` | Context-only gap and planning evidence; some current-state statements are stale |
| `2026-07-25-backend-auth-phase-a-login-issuance.md` | Historical planning/verification context; `DEC-AUTH-001` is the policy authority |
| `2026-07-23-auth-experience-remediation.md` | Customer-access remediation context; it does not authorize Admin Concept A |
| Current source and tests | Implementation and verification evidence only |

The approved selections are recorded in dedicated decision records and both
canonical registers. This packet remains context so its option analysis and
approval mapping can be audited without competing with those records.

## 9. Phase and Authorization Gates

### Phase 0 completion record

Phase 0 was completed on 27 July 2026 because:

- every `AUTH-P0-*` item was approved or explicitly deferred as recommended;
- unresolved owner, topology, provider, threshold, and support inputs are
  preserved as open consequences;
- approved items were converted into `DEC-AUTH-003` through `DEC-AUTH-009`;
- `DOCUMENT_REGISTER.md` and `DECISION_REGISTER.md` were updated without
  overstating authority; and
- the formalization changed documentation only.

### Phase 1 authorization gate

Phase 0 approval alone does not authorize application implementation. Before
Phase 1, obtain explicit approval for the exact security-hardening scope,
branch/worktree strategy, dependency/migration scope, verification commands,
and no-push behavior.

Phase 1 must start with:

- raw reset-token containment;
- atomic/fail-closed recovery mutation;
- admin-bootstrap password correction;
- backend reset-origin validation;
- non-destructive index/migration preparation and rollback.

Limiter, session, MFA, Admin-support, and security-event work remains blocked
where its corresponding Phase 0 item is deferred.

## 10. Verification Required After Formalization

- Markdown links resolve.
- Context/status language points to the dedicated approved records and does not
  imply implementation authorization.
- `DEC-AUTH-001`, `DEC-AUTH-002`, `ADR-001`, and role/access boundaries are not
  contradicted.
- `DOCUMENT_REGISTER.md` records this context packet, the reconciled forgot/reset
  plan, and `DEC-AUTH-003` through `DEC-AUTH-009`.
- `DECISION_REGISTER.md` records `DEC-AUTH-003` through `DEC-AUTH-009` and the
  amendment relationship between `DEC-AUTH-002` and `DEC-AUTH-006`.
- Git diff contains documentation paths only.
