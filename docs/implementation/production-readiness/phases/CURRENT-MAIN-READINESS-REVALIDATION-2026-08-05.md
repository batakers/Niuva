# Current-main Readiness Revalidation — 5 August 2026

**Status:** Context-only evidence packet; not a production-readiness,
deployment, or go-live approval.

**Selected baseline:** `origin/main` at
`0c9a715decfd0b61035338bb66c0f69de5006d1a`.

**Worktree:** `C:\tmp\niuva-g6-current-head-readiness-20260805`

## Purpose and authority

This packet reanchors the bounded readiness evidence after PRs #142 through
#148 entered `main`. Earlier audit and implementation packets use older
selected SHAs and must not be treated as current-head proof without this
revalidation.

The authority order remains:

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. The applicable approved decision or ADR
5. The applicable runbook
6. Current source and tests

This packet is subordinate context. It does not amend canonical product or
technical decisions, authorize source changes outside an explicitly approved
slice, select a provider, authorize migration or deployment, or promote the
repository to production-ready or go-live.

## Current-head lineage

The selected `origin/main` contains the following bounded changes:

| PR | Merged commit | Bounded evidence or change |
| --- | --- | --- |
| #142 | `3100e9b83695741673d3ce49a6ed4c35df2e47c0` | Bounded staging-candidate scope and explicit inactive capabilities |
| #143 | `0694fae88c815913885546a405dfaf6f98dc20bb` | Required authentication security-event key-version field |
| #144 | `d2c67f9bd1b8cc037d80e8a6d124b462e582c32c` | Bounded transaction-observability duration sanitization |
| #145 | `ca23977072e2c04d70a8c3f3059eb27725b2df19` | Reset-password validation error-association regression coverage |
| #146 | `678133f5b42b5253638103cdc0fd71248bdee707` | Mobile-navigation keyboard focus-containment regression coverage |
| #147 | `c1a3764f2634b871522f8ebd590e43c7a309fd5a` | Current-main readiness evidence and source-aligned finding reconciliation |
| #148 | `0c9a715decfd0b61035338bb66c0f69de5006d1a` | Customer protected-route redirect and `state.from` regression coverage |

PRs #146, #147, and #148 are part of this selected SHA. Their bounded changes
do not close browser, staging, real-role, production, or go-live evidence
gates.

## Verification on the selected SHA

The commands below ran in a clean worktree from the selected `origin/main`.
The frontend test runner used an ephemeral local dependency junction; no
tracked dependency, manifest, credential, or configuration value was changed.

| Check | Result | Limit |
| --- | --- | --- |
| `git fetch origin main` and `git rev-parse origin/main` | Passed; exact SHA `0c9a715decfd0b61035338bb66c0f69de5006d1a` | Remote state is a point-in-time observation |
| `$env:PYTHONPATH='backend'; python -m pytest -n 0 -q backend/tests` | **961 passed, 15 skipped, 14 subtests passed** | Local fixtures; skipped environment-dependent paths remain unproven |
| `npm test -- --watchAll=false --runInBand` | **62 suites, 373 tests passed** | Jest is not browser, screen-reader, real-role, or staging evidence |
| `npm run build` | **Compiled successfully** | `postbuild` skipped sitemap generation because `REACT_APP_PUBLIC_SITE_URL` was not configured; public-origin release evidence remains unproven |
| `git diff --check` | Passed before this documentation change | Does not validate deployment or data state |

## Current source-aligned evidence

Several historical UI findings were recorded before later bounded source
changes. They are not automatically closed, but their historical “missing in
source” statements must be revalidated against this SHA:

| Historical area | Current-head evidence | Correct treatment |
| --- | --- | --- |
| UX-001 Homepage/Retail discoverability | `HomePage.jsx` contains a secondary `RetailDiscoverySection` with `BrandButton to="/retail"`; `HomePage.contract.test.js` asserts the secondary Retail path and exactly two transformation paths. | Historical actual is stale; retain browser/independent review as a separate closure gate. |
| UX-003 mobile navigation | `Navbar.jsx` has open-only dialog semantics, `aria-modal`, inert closed state, focus placement, Tab wrapping, Escape handling, and trigger restoration logic. Existing contract/unit tests and merged PR #146 cover the modal/inert and keyboard regression contracts. | Source-aligned, not full browser/manual accessibility closure. |
| UX-005 Admin user selection | `UserSelector.jsx` exposes combobox/listbox/option semantics, active descendant state, Arrow/Home/End/Enter/Escape handling, and trigger restoration; its unit tests cover keyboard selection and filtering. | Historical source snapshot is stale; seeded role/browser evidence remains open. |
| UX-007 loading/motion states | `ProtectedRoute.jsx` exposes `role="status"` and `aria-live`; reduced-motion contract tests cover scoped spinner/pulse usage; `ErrorState` uses a reachable retry target. | Source-aligned bounded evidence; full state matrix remains open. |
| UX-008 reset-password errors | `FormField` wires invalid fields to error IDs; the merged #145 test asserts `aria-invalid` and `aria-describedby` for both password rules. | Bounded regression evidence is present; screen-reader/browser review remains open. |

This table is a revalidation map, not a finding-closure declaration. The
historical layer documents still contain the original snapshot and should be
reconciled only through a separately reviewed current-layer update.

### OPS-011 documentation-pointer revalidation

The historical OPS-011 statement is stale at the selected SHA:

- `doc/TRANSACTION_CAPABILITY_RUNBOOK.md:6` currently points to
  `docs/decisions/architecture/ADR-001-mongodb-transaction-capability.md`.
- The canonical ADR exists at that path. The formerly named
  `doc/decisions/ADR-001-mongodb-transaction-capability.md` path also exists,
  but only as an explicit “MOVED — Compatibility pointer only” file with no
  independent authority.
- This corrects the active runbook pointer, but does not prove that every
  historical/reference document has been normalized or that an automated
link/path gate exists. OPS-011 therefore remains a documentation
revalidation item rather than a production-readiness pass.

### Historical integration finding revalidation

The following historical Layer 05 statements also require current-head
treatment rather than being copied into a new implementation backlog:

| Historical area | Current-head evidence | Correct treatment |
| --- | --- | --- |
| INT-001 customer authentication entrypoint | `App.js` has separate `/login` and `/admin/login` routes; `ProtectedRoute` selects the customer route for non-Admin surfaces; `CustomerLogin` calls `/auth/login`; `AuthContext` bootstraps customer state from `/auth/me`; merged PR #148 verifies the customer redirect and preserved origin state. | Historical “wired to Admin login/no customer page” statement is stale. Customer role/browser/API environment evidence remains a separate gate. |
| INT-003 inactive Retail payment boundary | `RetailOrderDetail.jsx` renders the inactive transaction state without `retail-action-*` controls; `retail-order.contract.test.js` asserts the lockdown; payment capability remains provider-neutral. | Bounded inactive-state evidence is present. Provider, Finance, payment activation, and production evidence remain open. |
| INT-004 auth/recovery transport | `api.js` uses credentialed cookie transport and CSRF handling; `AuthContext` uses customer/admin session endpoints; `ResetPassword` consumes the validation endpoint; auth contract and session tests pass in the current suite. | Historical localStorage/JWT/reset-token statement is stale for current source. Replica-set, browser-cookie, delivery, and dynamic recovery evidence remain open. |

These rows do not authorize customer registration, checkout, payment,
provider activation, migration, deployment, or go-live. They only prevent
older audit snapshots from being mistaken for current source truth.

## Production-readiness verdict

The selected SHA remains **NOT READY for production, deployment, activation,
or go-live**.

No new overall percentage is assigned here. The historical `38%` repository
implementation and `15%` go-live figures belong to an older provisional audit
baseline; the historical frontend `55%` layer score is also not a current
whole-layer score. Adding the merged PRs to those numbers would be misleading
because the layer, environment, ownership, and external-decision gates have
not been re-run at matching scope.

The current evidence supports a bounded local implementation baseline, not an
80–100% production claim. In particular, the following remain open or
unverified:

- staging-like runtime, public-origin, TLS/proxy, CORS, cookie, health,
  release-artifact, browser, real-role, screen-reader, and cross-browser
  evidence;
- credential-incident closure and independent history/remote/old-clone
  verification;
- MFA parameters, recovery/key custody, security-event ownership, retention,
  alerting, and abuse-control production operation;
- worker/scheduler topology, telemetry destination, SLO/SLA, on-call,
  capacity, and notification operations;
- migration target/window, backup custody, restore rehearsal, rollback,
  validation, and independent data owner;
- production storage, payment, fulfillment, Finance, and notification
  provider selections or activation;
- dependency advisory disposition, CI release gates, approved bundle budgets,
  release versioning, rollback artifact ownership, and final independent
  production-readiness review.

All transaction-required mutations must continue to fail closed when MongoDB
transaction capability is unavailable. Provider-neutral storage and Retail
payment remain inactive, and no migration, deployment, secret rotation, or
go-live action was performed by this revalidation.

## Next gate

1. Retain the bounded evidence from merged PRs #146, #147, and #148 while
   keeping browser, staging, role, and independent-review gates open.
2. Reconcile Layers 01, 02, 06, 07, 08, and 11 against `0c9a715` (or a later
   selected SHA) without inheriting historical scores.
3. Record named owners and exact decisions for the residual backend packet
   (`BDR-001` through `BDR-007`) before any blocked operational or provider
   work.
4. Run staging/browser/restore evidence only after the target, credentials,
   data policy, rollback custody, and independent verifier are explicitly
   approved.

## Handover

- **Changed by this packet:** this context-only current-head revalidation file
  and its post-merge task card.
- **Intentionally unchanged:** canonical specifications, decisions, ADRs,
  runbooks, application runtime, migrations, dependencies, CI, providers,
  credentials, shared/staging/production data, and deployment state.
- **Rollback:** revert the documentation commit; no runtime or data rollback
  is required.
- **External actions still requiring approval:** PR merge, staging access,
  provider activation, migration apply/restore, deployment, secret rotation,
  production-readiness decision, and go-live.
