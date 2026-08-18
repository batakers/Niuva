# AUTH-01 Customer and Staff Login / Safe Return Wireframe

**Status:** Candidate — Context Only — Auth calibration artifact; no auth
provider, session, role, route, or source change

## 1. Shared mechanics, distinct audience

```text
Customer `/login`                         Staff `/admin/login`
Audience: customer-owned records          Audience: Operations/Admin workspace
Credentials → validation/error             Credentials → validation/error
Recovery → customer destination            Recovery → staff destination
Safe return → /dashboard or owned order    Safe return → validated /admin path
```

The primitives are shared; copy, privacy, destination, permission, and
projection meanings remain distinct. A route's visibility never grants role
authority.

## 2. State contract

| State | Customer | Staff | Recovery |
| --- | --- | --- | --- |
| Ready | Customer audience and owned-record purpose | Staff audience and Operations purpose | Visible recovery link; no account enumeration |
| Invalid fields | Preserve values; focus summary/field | Same mechanics; staff labels | Correct and resubmit |
| Dependency/auth error | Visible non-disclosing error | Visible non-disclosing error | Retry only safe request |
| Loading/submitting | Keep action label; block duplicate submit | Same; remember-me remains local UI state | No session assumed before authoritative response |
| Expired/invalid return | Fallback `/dashboard` | Fallback `/admin` | Do not replay stale mutation |
| Success | Validated `/dashboard`, `/order`, or `/orders/*` | Validated local `/admin*` except login | Backend session/permission remains authority |

## 3. Interaction/accessibility

- AuthShell/AuthCard provide a clear audience heading and landmark.
- Email/password labels, autocomplete, errors, and loading states are visible;
  keyboard and password-manager paths remain native.
- Focus enters the first invalid field or summary and continues to the recovery
  action; long ID/EN copy reflows at 390/1440 and 200% zoom.
- Staff `remember me` remains a local preference; it does not change role or
  permission. Customer data is never previewed on the login page.

## 4. Self-review

Passed against DS-02/DS-03/DS-05, `ProtectedRoute`, CustomerLogin,
AdminLogin, and the IA. The two audiences remain semantically distinct and
safe-return bounds are explicit. No auth provider or source was changed.
