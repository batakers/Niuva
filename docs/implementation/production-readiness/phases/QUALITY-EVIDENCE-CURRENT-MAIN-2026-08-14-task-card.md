# Test and Quality Evidence Current-Main Audit Task Card

<!-- markdownlint-disable MD013 -->

**Lane:** Readiness.

**Branch/worktree:** `audit/backend-quality-evidence-current-main` /
`Niuva-worktrees/backend-quality-evidence-current-main`.

**Stacked base:** `audit/backend-file-storage-current-main` at `9073d36` so
tracker edits remain ordered behind PR #249. The audited runtime baseline is
`origin/main` at `15b759a`.

## Brief

| Field | Contract |
| --- | --- |
| Title and user outcome | Revalidate reproducible backend test, quality, and dependency evidence and correct the baseline collector so untracked virtual environments cannot pollute or stall its output. |
| In scope | Hermetic, real-transaction, external-live profiles; fail-closed suite/evidence enforcement; JUnit/evidence/checksum artifacts; report-only full Flake8/Mypy/Black/isort baseline; required scoped gates; hashed dependency lock, runtime, pip health, vulnerability, license, and deprecation evidence; focused collector/evidence regressions. |
| Out of scope | Running external-live workflows without an approved target/credentials; changing whole-tree quality thresholds; broad formatting/type/lint cleanup; dependency/driver migration; provider/deployment/production-readiness approval and go-live. |
| Authority | Merged 10.1/10.2/10.3 contracts; current workflows/scripts/tests; `DR-013` unresolved threshold/ownership fields; current-main backend rebaseline and canonical trackers. |
| Affected areas | `scripts/collect_backend_quality_baseline.py`, its focused tests, CI/evidence documentation, and primary readiness trackers; workflow changes only if an objective fail-open defect is reproduced. |
| Contract/dependency | Quality baseline inputs must be explicit tracked Python files, deterministic, reviewable, and report-only; required gates remain blocking; JUnit evidence must bind exact SHA, command/profile, totals, unexpected skips, and checksum; external profiles remain manual environment evidence. |
| Done when | The local virtualenv pollution is reproduced then prevented by a regression; all three profiles and artifacts are classified; no required suite can silently pass without validated evidence; dependency/quality status is current; focused/full tests and exact-head CI pass; trackers link the packet. |
| Verification | Collector unit/integration tests with untracked virtualenv fixtures; pytest-evidence negative tests; workflow static assertions; clean collector run and output-size/input inventory; full backend; critical/scoped quality gates; lock/audit/license/deprecation checks; `git diff --check`; exact-head CI. |
| Owner and verifier | Codex is Driver; repository QA/release owner is the required independent verifier before merge or any threshold/policy change. |
| Commit/push/PR permitted | Yes, explicitly requested by the user on 14 August 2026. |
| Risks/open decisions | External staging target/credentials and owners are absent; whole-tree ratchet thresholds, waiver/expiry, driver migration, license disposition, artifact retention, and release policy remain separately governed. |

## Required negative cases

- An untracked `backend/.venv-*`, arbitrary generated Python tree, or local
  backup cannot enter any whole-tree quality command or artifact.
- A missing/empty/malformed JUnit file, failures/errors, unexpected skip, wrong
  profile, or evidence-generation failure cannot produce a successful required
  profile.
- Hermetic and transaction workflows upload both JUnit and evidence or fail;
  external-live remains unclaimable unless its approved HTTPS target and
  required credentials are supplied and its evidence completes.
- Report-only Flake8/Mypy/Black/isort findings remain visible and do not masquerade
  as required-gate success; required critical/scoped gates remain blocking.
- Dependency installation uses the hashed lock; missing vulnerability/license
  evidence fails the job; known deprecation/compatibility risks remain explicit
  rather than being treated as vulnerability-free release approval.

## Rollback and handover

The collector correction is reversible by normal commit revert. It changes
only report input selection, not application runtime. Thresholds, broad cleanup,
dependency migration, external execution, provider/deployment, and production
decisions require separate authority.

<!-- markdownlint-enable MD013 -->
