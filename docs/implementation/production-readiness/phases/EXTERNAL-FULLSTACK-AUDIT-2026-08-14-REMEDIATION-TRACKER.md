# External Full-Stack Audit (2026-08-14) — Remediation Tracker

Status: Context Only — Working Tracker; Not Canonical Audit Authority

Source: an external "NIUVA — CURRENT-MAIN FULL-STACK PROJECT AUDIT" report,
dated 14 August 2026, scored against `origin/main` at
`2a6496792ca42e230a301a1688cb7ef5749584b6`. That report is not one of this
repository's canonical documents; this tracker exists only to record, in
one place, which of its findings have moved and which have not, with a
link to the exact PR that did the work. It does not replace, supersede, or
carry any authority over `docs/context/production-readiness-audit/` or
`docs/implementation/production-readiness/AUDIT_PROGRESS.md`, and it does
not authorize migration, deployment, provider activation, or go-live by
itself.

Every row below is updated in the same PR that does the corresponding
work, so this table is current as of the latest merge into this tracker
file — not as of the original 14 August audit.

## P0

| ID | Finding | Domain | Status | Evidence |
| --- | --- | --- | --- | --- |
| SEC-001 / NIV-001 | Prior credential incident lacks independent closure evidence | Security/ops (not app code) | **Open** | Unchanged since the audit; still requires an independent verifier, not source changes |

## P1

| ID | Finding | Domain | Status | Evidence |
| --- | --- | --- | --- | --- |
| GOV-001 | Readiness evidence split across stale (`15b759a`) and current (`2a649679`) baselines | Governance (not app code) | **Open** | Needs a Project Owner decision to freeze one release SHA |
| ROUTE-001 | Canonical Indonesian/English public routes not implemented | Frontend | **Partially addressed** | PR #243 adds `/tentang`, `/layanan`, `/proyek`, `/kontak`, `/privasi`, `/en/*` — open, CI green, not merged. HTTP 308 redirect boundary, `hreflang`, sitemap still not done |
| INTAKE-001 | Public Inquiry contract missing consent + optional backend phone | Backend + Frontend | **Resolved (pending merge)** | PR #254: consent required at API + UI, `pic_phone` now required and validated server-side |
| ERROR-001 | Inquiry dependency failure was toast-only | Frontend | **Resolved (pending merge)** | PR #254: persistent, focus-managed error state replacing toast-only handling |
| AUTH-001 | Mandatory internal MFA absent | Backend | **Blocked on decision** | Needs TOTP provider, key custody, and recovery/break-glass policy from Project Owner before implementation starts |
| SEC-002 | Distributed abuse-control evidence incomplete | Backend | **Partially resolved (pending merge)** | [RATE-LIMITER-MULTIWORKER-EVIDENCE-2026-08-16.md](RATE-LIMITER-MULTIWORKER-EVIDENCE-2026-08-16.md): real cross-process atomicity proven (4 separate OS processes, exact 5/7 split, 5 consecutive runs) and outage behavior documented. TTL/retention confirmed already implemented. Trusted-proxy header trust, alerting, and named ownership remain genuinely blocked on OPS-001/SRE-001 decisions — not attempted |
| OPS-001 | No production deployment/rollback workflow | Platform/DevOps (not backend/frontend) | **Open** | No Dockerfile, staging target, or deploy workflow exists yet |
| DATA-001 | Migration/backup/restore evidence missing | Backend/Data | **Resolved for disposable-local scope (pending merge)** | [DISPOSABLE-BACKUP-RESTORE-EVIDENCE-2026-08-16.md](DISPOSABLE-BACKUP-RESTORE-EVIDENCE-2026-08-16.md): fresh disposable-local backup/restore proof, 4/4 tests passed, full cleanup verified. Staging/production restore drill, migration 001–010 apply, and independent review remain open |
| SRE-001 | Production observability/SLO evidence incomplete | Backend/Platform | **Blocked on decision** | Source instrumentation exists; needs a telemetry destination decision from Project Owner |
| A11Y-001 | Public accessibility evidence incomplete | Frontend/QA | **Open** | Not started |

## P2

| ID | Finding | Domain | Status | Evidence |
| --- | --- | --- | --- | --- |
| API-001 | 25 of 152 operations missing 4xx/5xx OpenAPI metadata | Backend | **Resolved (pending merge)** | PR #257: all 25 documented per-route from actual code, plus a regression test |
| QUALITY-001 | Backend static-quality debt (flake8/mypy/black/isort) | Backend | **Partially resolved (pending merge)** | This PR: `black` (47 files) and `isort` (51 files) now 0 remaining, project-wide, verified against full test suite. flake8 (2,046 findings) and mypy (274 errors) deliberately deferred — those need case-by-case review, not a bulk mechanical pass, per this same audit's own caution against reformatting without diff control |
| DEP-001 | Unused `framer-motion`; undeclared `vaul` in `drawer.jsx` | Frontend | **Partially resolved (pending merge)** | PR #255 removes `framer-motion` (verified zero consumers). `vaul` quarantine/declaration still open, tied to CLEANUP-001 |
| DESIGN-001 | NDS migration incomplete (legacy fonts, `transition-all`, side-border) | Frontend | **Open** | Not started |
| UX-STATE-001 | `RouteFallback` near-blank; `AppErrorBoundary` mislabels render crashes as connection loss | Frontend | **Resolved (pending merge)** | PR #256: honest copy + visible spinner + second recovery action |
| PERF-001 | Bundle report is report-only, no approved budget | Frontend | **Open** | Not started |
| PR-001 | PR #243 stale, failing frontend check | Frontend (repo hygiene) | **Resolved** | Rebased onto current `main` (picked up the `nanoid` security fix); all checks now pass. PR itself still open pending review |

## P3

| ID | Finding | Domain | Status | Evidence |
| --- | --- | --- | --- | --- |
| CLEANUP-001 | Unused `StatCard`; undeclared `vaul` boundary | Frontend | **Open** | Needs an approved component/dependency decision before removal, per the audit's own instruction |
| CONTENT-001 | Project-evidence provenance gate | Content/Product (not code) | **Open** | Not a coding task |
| MOTION-001 | Public motion grammar not fully normalized (GSAP timing) | Frontend/Design | **Open** | Not started |

## Open PRs referenced above

| PR | Title | Branch | Status |
| --- | --- | --- | --- |
| [#243](https://github.com/batakers/Niuva/pull/243) | Localized public navigation and Homepage R4.1 | `feat/niuva-shared-navbar-localized-routes` | **Merged** |
| [#254](https://github.com/batakers/Niuva/pull/254) | Public Inquiry contract (consent, phone, error state) | `feat/niuva-public-inquiry-contract` | **Merged** |
| [#255](https://github.com/batakers/Niuva/pull/255) | Remove unused `framer-motion` | `chore/niuva-remove-unused-framer-motion` | **Merged** |
| [#256](https://github.com/batakers/Niuva/pull/256) | Stop mislabeling render crashes as connection failures | `fix/niuva-error-state-labeling` | **Merged** |
| [#257](https://github.com/batakers/Niuva/pull/257) | Declare 4xx/5xx responses for 25 undocumented operations | `docs/niuva-api-error-response-metadata` | **Merged** |
| [#258](https://github.com/batakers/Niuva/pull/258) | Backend `black`/`isort` formatting | `chore/niuva-backend-black-isort-formatting` | **Merged** |
| [#259](https://github.com/batakers/Niuva/pull/259) | Disposable local backup/restore evidence (DATA-001) | `ops/niuva-disposable-backup-restore-evidence-20260816` | **Merged** |
| [#260](https://github.com/batakers/Niuva/pull/260) | Rate-limiter multi-worker evidence (SEC-002) | `test/niuva-rate-limiter-multiworker-evidence` | Open, CI green |

Being merged in sequence as of 2026-08-16; this tracker records source-level
progress only, it does not itself close any P0/P1 finding, and it does not
authorize deployment, migration, provider activation, or go-live.
