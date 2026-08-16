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
work. Several open PRs each carry their own copy of this file (branched
from the same `main` before any of them merged); merging them in sequence
needs a trivial conflict resolution on this one file each time.

## P0

| ID | Finding | Domain | Status | Evidence |
| --- | --- | --- | --- | --- |
| SEC-001 / NIV-001 | Prior credential incident lacks independent closure evidence | Security/ops (not app code) | **Open** | Still requires an independent verifier, not source changes |

## P1

| ID | Finding | Domain | Status | Evidence |
| --- | --- | --- | --- | --- |
| GOV-001 | Readiness evidence split across stale/current baselines | Governance (not app code) | **Open** | Needs a Project Owner decision to freeze one release SHA |
| ROUTE-001 | Canonical Indonesian/English public routes not implemented | Frontend | **Resolved (pending merge)** | PR #243: canonical routes, metadata/hreflang/canonical link, and sitemap generation all updated; CI green |
| INTAKE-001 | Public Inquiry contract missing consent + optional backend phone | Backend + Frontend | **Resolved (pending merge)** | PR #254 |
| ERROR-001 | Inquiry dependency failure was toast-only | Frontend | **Resolved (pending merge)** | PR #254 |
| AUTH-001 | Mandatory internal MFA absent | Backend | **Blocked on decision** | Awaiting Project Owner answers on TOTP provider, key custody, recovery policy |
| SEC-002 | Distributed abuse-control evidence incomplete | Backend | **Partially resolved (pending merge)** | PR #260 |
| OPS-001 | No production deployment/rollback workflow | Platform/DevOps | **Open** | — |
| DATA-001 | Migration/backup/restore evidence missing | Backend/Data | **Resolved for disposable-local scope (pending merge)** | PR #259; migration 007-009 dry-run also recorded, PR #261 |
| SRE-001 | Production observability/SLO evidence incomplete | Backend/Platform | **Blocked on decision** | Awaiting telemetry destination decision |
| A11Y-001 | Public accessibility evidence incomplete | Frontend/QA | **Partially covered** | Contrast (UX-002), focus-trap (UX-003), and target-size (UX-004) all re-verified already-resolved during demo-prep checks on 2026-08-16 (measured in a real browser, not just source review). Full keyboard/screen-reader/zoom-reflow matrix still open |

## P2

| ID | Finding | Domain | Status | Evidence |
| --- | --- | --- | --- | --- |
| API-001 | 25 of 152 operations missing 4xx/5xx OpenAPI metadata | Backend | **Resolved (pending merge)** | PR #257 |
| QUALITY-001 | Backend static-quality debt (flake8/mypy/black/isort) | Backend | **In progress** | PR #258: black/isort now 0 remaining. PR #262: `.flake8` config fix reduced flake8 from 2,046 to 433 genuine findings (1,948 were a line-length config mismatch, not real debt). This PR (part 2): fixed all F401 (9 unused imports), F841 (1 unused exception variable), and W391 (1 trailing blank line) findings across 9 files — flake8 now reports 0 for these three categories. Remaining flake8 categories (E402=58, E302/E301/E306=23, F402=6) and all 274 mypy findings still open, to be worked in further bounded PRs. Pre-existing `black`/`isort` formatting debt in touched files (unrelated to these edits, blank-line spacing elsewhere) is left for PR #258 to resolve on merge, not duplicated here |
| DEP-001 | Unused `framer-motion`; undeclared `vaul` in `drawer.jsx` | Frontend | **Resolved / not-a-bug** | PR #255 removes `framer-motion`. `vaul`/`Drawer` re-checked on 2026-08-16: a dedicated test (`keeps the undeclared vaul Drawer quarantined`) confirms this is an intentional, tested quarantine, not an oversight — no fix needed |
| DESIGN-001 | NDS migration incomplete (legacy fonts, `transition-all`, side-border) | Frontend | **Open** | Not started |
| UX-STATE-001 | `RouteFallback`/`AppErrorBoundary` issues | Frontend | **Resolved (pending merge)** | PR #256 |
| PERF-001 | Bundle report is report-only, no approved budget | Frontend | **Open** | Blocked on a budget-threshold decision |
| PR-001 | PR #243 stale, failing frontend check | Frontend (repo hygiene) | **Resolved** | Rebased onto current `main`; CI green |

## P3

| ID | Finding | Domain | Status | Evidence |
| --- | --- | --- | --- | --- |
| CLEANUP-001 | Unused `StatCard`; undeclared `vaul` boundary | Frontend | **Open (`vaul` half resolved as not-a-bug, see DEP-001)** | `StatCard` removal still needs an approved component decision |
| CONTENT-001 | Project-evidence provenance gate | Content/Product (not code) | **Open** | Not a coding task |
| MOTION-001 | Public motion grammar not fully normalized (GSAP timing) | Frontend/Design | **Open** | Direction already approved (`DEC-UX-004`); not started |

## Open PRs referenced above

| PR | Title | Branch |
| --- | --- | --- |
| [#243](https://github.com/batakers/Niuva/pull/243) | Localized public navigation, Homepage R4.1, sitemap sync | `feat/niuva-shared-navbar-localized-routes` |
| [#254](https://github.com/batakers/Niuva/pull/254) | Public Inquiry contract | `feat/niuva-public-inquiry-contract` |
| [#255](https://github.com/batakers/Niuva/pull/255) | Remove unused `framer-motion` | `chore/niuva-remove-unused-framer-motion` |
| [#256](https://github.com/batakers/Niuva/pull/256) | Error state labeling | `fix/niuva-error-state-labeling` |
| [#257](https://github.com/batakers/Niuva/pull/257) | API error response metadata | `docs/niuva-api-error-response-metadata` |
| [#258](https://github.com/batakers/Niuva/pull/258) | Backend `black`/`isort` formatting | `chore/niuva-backend-black-isort-formatting` |
| [#259](https://github.com/batakers/Niuva/pull/259) | Disposable backup/restore evidence | `ops/niuva-disposable-backup-restore-evidence-20260816` |
| [#260](https://github.com/batakers/Niuva/pull/260) | Rate-limiter multi-worker evidence | `test/niuva-rate-limiter-multiworker-evidence` |
| [#261](https://github.com/batakers/Niuva/pull/261) | Migration 007-009 dry-run evidence | `docs/niuva-migration-007-009-dryrun-evidence-20260816` |
| [#262](https://github.com/batakers/Niuva/pull/262) | `.flake8` config fix (QUALITY-001, part 1) | `chore/niuva-backend-flake8-line-length-config` |
| (this branch) | Remove unused imports/vars (QUALITY-001, part 2) | `chore/niuva-backend-flake8-unused-imports` |

None of the PRs above have been merged. This tracker records source-level
progress only; it does not itself close any P0/P1 finding, and it does not
authorize deployment, migration, provider activation, or go-live.
