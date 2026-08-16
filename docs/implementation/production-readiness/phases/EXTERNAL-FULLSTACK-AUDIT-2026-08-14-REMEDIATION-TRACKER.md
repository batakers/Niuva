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
| QUALITY-001 | Backend static-quality debt (flake8/mypy/black/isort) | Backend | **In progress** | PR #258: black/isort now 0 remaining. PR #262-#266: flake8 fully resolved (2,046 -> 0 across all categories: line-length config, F401/F841/W391, E301/E302/E306, F402, E402). This PR (mypy, part 1 of N): fixed all 17 `var-annotated` findings (mypy `--follow-imports=skip --ignore-missing-imports --check-untyped-defs` against the full `backend/` tree) — each investigated for the correct precise type from real usage in the surrounding code; 2 initial attempts (`list[ast.expr]` in a test, `list[tuple[str, str]]` in another) turned out too strict and surfaced new cascading errors on re-run, so both were relaxed to match what the code actually guarantees (`list`, `list[tuple[str, object]]`). CI-scoped mypy gate (23 files) still reports 0. mypy count: 274 -> 257 project-wide. Remaining 257 mypy findings are case-by-case (arg-type=82, assignment=41, index=40, operator=24, attr-defined=23, union-attr=21, return-value=16, dict-item=3, call-overload=3, call-arg=3, method-assign=1) and some of these may be genuine bugs, not just style — still open for further bounded PRs |
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
| MOTION-001 | Public motion grammar not fully normalized (GSAP timing) | Frontend/Design | **Resolved (pending merge)** | This PR: the only two hardcoded GSAP durations in the codebase (`BrandSystem.jsx`, 700ms and 750ms hero/section entrances) moved to the approved 280ms "deliberate" tier from `DEC-UX-004`'s 0/120/180/280ms grammar, matching `--motion-deliberate` in `index.css`. Grepped the full `frontend/src` tree first to confirm these were the only two GSAP `duration:` values outside test files |

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
| [#263](https://github.com/batakers/Niuva/pull/263) | Remove unused imports/vars (QUALITY-001, part 2) | `chore/niuva-backend-flake8-unused-imports` |
| [#264](https://github.com/batakers/Niuva/pull/264) | Blank-line spacing fixes (QUALITY-001, part 3) | `chore/niuva-backend-flake8-blank-lines` |
| [#265](https://github.com/batakers/Niuva/pull/265) | Fix `field` import-shadowing (QUALITY-001, part 4) | `chore/niuva-backend-flake8-field-shadowing` |
| [#266](https://github.com/batakers/Niuva/pull/266) | E402 import-order noqa annotations (QUALITY-001, part 5) | `chore/niuva-backend-flake8-e402` |
| [#267](https://github.com/batakers/Niuva/pull/267) | mypy var-annotated fixes (QUALITY-001, mypy part 1) | `chore/niuva-backend-mypy-var-annotated` |
| [#268](https://github.com/batakers/Niuva/pull/268) | Normalize GSAP motion timing to approved grammar (MOTION-001) | `fix/niuva-frontend-gsap-motion-timing` |

None of the PRs above have been merged. This tracker records source-level
progress only; it does not itself close any P0/P1 finding, and it does not
authorize deployment, migration, provider activation, or go-live.
