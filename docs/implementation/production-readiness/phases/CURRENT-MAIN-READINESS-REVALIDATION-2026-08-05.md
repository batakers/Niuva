# Current-main Readiness Revalidation — 5 August 2026

**Status:** Context-only evidence packet; not a production-readiness,
deployment, or go-live approval.

**Selected baseline:** `origin/main` at
`ca23977072e2c04d70a8c3f3059eb27725b2df19`.

**Worktree:** `C:\tmp\niuva-current-main-readiness-revalidation-20260805`

## Purpose and authority

This packet reanchors the bounded readiness evidence after PRs #142, #143,
#144, and #145 entered `main`. Earlier audit and implementation packets use
older selected SHAs and must not be treated as current-head proof without this
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

PR #146 is not part of this selected SHA. It remains a separate review item
for mobile-navigation focus-containment regression coverage.

## Verification on the selected SHA

The commands below ran in a clean worktree from the selected `origin/main`.
The frontend test runner used an ephemeral local dependency junction; no
tracked dependency, manifest, credential, or configuration value was changed.

| Check | Result | Limit |
| --- | --- | --- |
| `git fetch origin --prune` and `git rev-parse origin/main` | Passed; exact SHA `ca23977072e2c04d70a8c3f3059eb27725b2df19` | Remote state is a point-in-time observation |
| `$env:PYTHONPATH='backend'; python -m pytest -n 0 -q backend/tests` | **961 passed, 15 skipped, 14 subtests passed** | Local fixtures; skipped environment-dependent paths remain unproven |
| `npm test -- --watchAll=false --runInBand` | **62 suites, 371 tests passed** | Jest is not browser, screen-reader, real-role, or staging evidence |
| `git diff --check` | Passed before this documentation change | Does not validate deployment or data state |

## Current source-aligned evidence

Several historical UI findings were recorded before later bounded source
changes. They are not automatically closed, but their historical “missing in
source” statements must be revalidated against this SHA:

| Historical area | Current-head evidence | Correct treatment |
| --- | --- | --- |
| UX-001 Homepage/Retail discoverability | `HomePage.jsx` contains a secondary `RetailDiscoverySection` with `BrandButton to="/retail"`; `HomePage.contract.test.js` asserts the secondary Retail path and exactly two transformation paths. | Historical actual is stale; retain browser/independent review as a separate closure gate. |
| UX-003 mobile navigation | `Navbar.jsx` has open-only dialog semantics, `aria-modal`, inert closed state, focus placement, Tab wrapping, Escape handling, and trigger restoration logic. Existing contract/unit tests cover the modal/inert contract; PR #146 adds explicit keyboard regression coverage but is outside this SHA. | Source-aligned, not full browser/manual accessibility closure. |
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

## Production-readiness verdict

The selected SHA remains **NOT READY for production, deployment, activation,
or go-live**.

No new overall percentage is assigned here. The historical `38%` repository
implementation and `15%` go-live figures belong to an older provisional audit
baseline; the historical frontend `55%` layer score is also not a current
whole-layer score. Adding the four merged PRs to those numbers would be
misleading because the layer, environment, ownership, and external-decision
gates have not been re-run at matching scope.

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

1. Review/merge PR #146 if its checks and independent review are acceptable.
2. Reconcile Layers 01, 02, 06, 07, 08, and 11 against `ca239770` (or a later
   selected SHA) without inheriting historical scores.
3. Record named owners and exact decisions for the residual backend packet
   (`BDR-001` through `BDR-007`) before any blocked operational or provider
   work.
4. Run staging/browser/restore evidence only after the target, credentials,
   data policy, rollback custody, and independent verifier are explicitly
   approved.

## Handover

- **Changed by this packet:** this context-only current-head revalidation file.
- **Intentionally unchanged:** canonical specifications, decisions, ADRs,
  runbooks, application runtime, migrations, dependencies, CI, providers,
  credentials, shared/staging/production data, and deployment state.
- **Rollback:** revert the documentation commit; no runtime or data rollback
  is required.
- **External actions still requiring approval:** PR merge, staging access,
  provider activation, migration apply/restore, deployment, secret rotation,
  production-readiness decision, and go-live.
