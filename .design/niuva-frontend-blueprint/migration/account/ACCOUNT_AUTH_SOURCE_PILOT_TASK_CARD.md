# MIG-03 — Candidate Account/Auth source pilot task card

**Status:** Historical bounded source pilot — G4/G5 complete in PR #288;
future Account/Auth slices remain separately scoped
**Baseline:** `origin/main` at `ff843ce403932de2ff3f77532e60448c789e3aec`
**Owner:** Account/Auth frontend driver (to be named at G3)
**Surface:** Customer authentication and owned-record return only
**Inputs:** `AUTH-01`/`AUTH-02`/`AUTH-03`/`ACC-01`, QA-01–QA-05, DS-01A/DS-01B,
`DEC-RT-02`, and current source/tests

## Objective

The original candidate inventory covers safe return, non-enumerating recovery,
and customer-safe owned-order projection. It is too broad for one source slice;
the proposed MIG-03A card isolates customer login and recovery first. Staff
login and owned-order projection remain a later MIG-03B scope.

## Candidate exact-file scope

- `frontend/src/pages/auth/CustomerLogin.jsx`
- `frontend/src/pages/admin/AdminLogin.jsx`
- `frontend/src/pages/auth/ForgotPassword.jsx`
- `frontend/src/pages/auth/ResetPassword.jsx`
- `frontend/src/components/auth/ProtectedRoute.jsx`
- `frontend/src/components/auth/AuthShell.jsx`
- `frontend/src/pages/operational/ClientDashboard.jsx`
- `frontend/src/pages/operational/OrderDetail.jsx`
- existing related tests for each named component/page, including
  `ProtectedRoute.test.jsx`, `AuthShell.test.jsx`, `ForgotPassword.test.jsx`,
  `ResetPassword.test.jsx`, `ClientDashboard.test.jsx`, and
  `OrderDetail.test.jsx`

## Acceptance criteria

The exact executable G3 scope is defined in
[`ACCOUNT_AUTH_G3_SPLIT_TASK_CARD.md`](ACCOUNT_AUTH_G3_SPLIT_TASK_CARD.md).
The broader file list below remains inventory only until that split is reviewed.

- Safe return preserves only an allowlisted owned route/context; no external
  open redirect or invented private `/en` counterpart appears.
- Customer and staff login use shared mechanics only where semantics match;
  destinations, permissions, copy, and shell composition remain distinct.
- Recovery is non-enumerating, preserves safe context, distinguishes expired
  session from invalid input, and never activates Google/OAuth/OIDC or
  registration.
- Customer projection excludes internal cost, margin, supplier, profit, and
  internal notes; owned order state remains domain-owned.
- Focus, keyboard, labels, errors, loading, offline/expired/recovery/success,
  ID/EN long content, reduced motion, 200% reflow, and 390/1440 evidence are
  recorded.

## Verification and rollback

Run focused auth/protected-route/account tests, full frontend tests, build,
dependency/diff checks, browser keyboard and return-path checks, axe, and
Impeccable Product-register critique. Use a fresh isolated worktree from
`origin/main`; rollback only exact pilot files and preserve auth history.

## Exclusions and gates

No identity provider, registration, session schema, role/permission mutation,
backend authorization change, customer projection migration, or new provider.
G3/G4, commit, push, PR, thread resolution, merge, and readiness are separate.

## Self-review

- [x] Exact Account/Auth page/component/test paths are bounded.
- [x] Customer and staff responsibilities remain distinct.
- [x] Safe return, privacy, and projection constraints are explicit.
- [x] No identity/provider or backend capability activation is implied.

**Execution record:** The amended Customer Login/recovery scope was executed
and merged as PR [#288](https://github.com/batakers/Niuva/pull/288). Staff login,
provider activation, and broader Account/Auth expansion remain separate.

**Self-review result:** Pass as a historical bounded execution record; this
umbrella card does not authorize a new source slice.
