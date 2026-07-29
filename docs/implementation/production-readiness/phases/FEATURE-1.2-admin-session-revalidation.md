# Feature 1.2 — Admin Session Read-Only Revalidation

Audit date: 29 July 2026

Branch: `audit/backend-admin-session`

Baseline: `1200340f4eab634d608d331f3a830c7ccb258212` (`origin/main`)

Authority: `DEC-AUTH-005` and the approved Admin Authentication Phase 2 packet

## Outcome

The Admin Session source-and-local-test baseline is substantially implemented
and passes revalidation. This audit did not identify a source defect requiring
immediate remediation for the requested controls. Production acceptance remains
blocked because HTTPS/proxy, deployment, monitoring, cutover, and observation
evidence is not available.

No migration, `.env`, shared/staging/production database, deployment, provider,
commit from another feature, or production setting was changed during this
audit.

## Control Matrix

| Control | Current implementation | Result |
| --- | --- | --- |
| `__Host-` cookies | Access and rotating session cookies use `__Host-` names with `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/`, and no `Domain`. Responses expose no credential value. | Pass locally |
| Remember-me | Defaults off. Default session cookie is non-persistent; explicit remember-me makes the rotating session cookie persistent for at most seven days. | Pass locally |
| Idle and absolute expiry | Access is 15 minutes. Default idle/absolute limits are 30 minutes/8 hours; remembered limits are 8 hours/7 days. Activity cannot extend the absolute boundary. | Pass locally |
| Refresh rotation | Refresh uses the opaque rotating session secret, rotates access/session/CSRF material atomically, preserves absolute expiry, and fails closed without transaction capability. | Pass locally and on isolated MongoDB |
| Session-family revocation | Replay revokes the family. Logout, password reset, role/access changes, user ineligibility, and token-version changes revoke or invalidate server-side sessions. | Pass locally and on isolated MongoDB |
| Admin CSRF | Non-safe authenticated requests require exact Origin/Referer plus the in-memory synchronizer token. Constant-time keyed-digest verification is covered. Refresh is the approved bootstrap exception and still requires the rotating Strict HttpOnly cookie plus exact Origin/Referer. | Pass locally |
| HTTPS/proxy compatibility | Production origin parsing requires HTTPS, cookies are always Secure, forwarded Host does not select the trusted origin, and CORS rejects wildcard credential origins. | Source boundary passes; production evidence blocked |
| Cache and browser storage | Admin session responses use `Cache-Control: no-store`; Admin credentials are not stored in `localStorage`/`sessionStorage` or JavaScript-readable cookies. | Pass locally |

## Findings and Remaining Evidence

### AS-001 — Production HTTPS/proxy and operational evidence is unavailable

Severity: production blocker; not a local source failure.

The repository cannot prove the real TLS termination boundary, proxy header
sanitization, Secure-cookie preservation, HTTP-to-HTTPS behavior, deployed
same-origin routing, MongoDB latency/readiness, monitoring destination, alert
ownership, or incident response. The approved production hostname and
deployment environment were not supplied.

The production frontend compilation completed, but the postbuild release step
correctly rejected the locally configured localhost value:

```text
REACT_APP_PUBLIC_SITE_URL must use the confirmed public production origin.
```

Do not bypass this check or change `.env` for audit evidence. Close AS-001 only
with an approved target, operator, window, exact public origin, proxy/TLS
evidence, monitoring ownership, and deployment authorization.

### AS-002 — Cross-tab behavior is secure but has no browser-level journey

Severity: evidence/UX gap; not an authorization bypass.

The backend concurrency contract is deterministic: two uses of the same
rotating session secret yield one rotation winner, then replay detection revokes
the family. This is fail-closed, but simultaneous refresh from separate browser
tabs can therefore force all tabs to re-authenticate. React StrictMode
deduplication is tested only within one provider instance; there is no
multi-tab/browser coordination journey.

Before production acceptance, explicitly accept forced re-login as the
cross-tab policy or authorize a separate frontend coordination design and
browser test. Do not weaken replay-family revocation.

## Verification Evidence

Focused backend session, route, migration, identity, and recovery suite:

```text
43 passed, 2 skipped in 15.40s
```

The two skipped cases require explicit real-Mongo opt-in.

Isolated MongoDB Admin rotation and Migration 009 tests:

```text
7 passed in 0.56s
```

These tests used generated database names on a disposable local replica set and
dropped only those databases. They did not run Migration 009 against the
application database.

Full backend regression:

```text
571 passed, 12 skipped, 14 subtests passed in 17.37s
```

Focused frontend auth tests:

```text
23 passed
```

Full frontend regression:

```text
32 suites passed, 229 tests passed
```

The optimized frontend bundle compiled successfully. Postbuild stopped at the
intentional confirmed-production-origin gate described in AS-001.

## Recommended Next Action

The next authorized Admin Session action should be a separate remediation or
evidence branch only after choosing one of these scopes:

1. local source/test work for the AS-002 cross-tab policy; or
2. production/staging evidence work after target, exact origin, proxy/TLS
   topology, monitoring owner, maintenance window, backup custody, operator,
   reviewer, and explicit execution permission are available.

Migration 009, cleanup, cutover, forced re-login, deployment, and production
activation remain unauthorized by this audit.
