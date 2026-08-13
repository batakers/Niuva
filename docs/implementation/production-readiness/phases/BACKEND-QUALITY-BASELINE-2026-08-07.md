# Backend quality baseline — 10.3

Status: implemented as a report-only whole-codebase baseline on
`chore/backend-quality-baseline`. The existing critical checks remain required
CI gates; no repository-wide threshold is promoted until owners approve one.

## Reproducible commands

From the repository root, using the pinned CI Python runtime:

```text
python scripts/collect_backend_quality_baseline.py --output-dir backend-quality-baseline
```

The collector selects the deterministic set returned by `git ls-files` for
tracked `backend/**/*.py` files. It records that manifest, its SHA-256, the
exact commands, Python/platform metadata, Git SHA, raw tool output, output
SHA-256 values, exit codes, and finding counts in `summary.json`. It always
returns success after writing evidence: this is intentional while the legacy
baseline is being triaged, and must not be confused with a passed quality gate.

The report-only commands are:

```text
python -m flake8 <tracked backend Python manifest>
python -m mypy --explicit-package-bases --ignore-missing-imports --check-untyped-defs --show-error-codes <tracked backend Python manifest>
python -m black --check <tracked backend Python manifest>
python -m isort --profile black --check-only <tracked backend Python manifest>
```

The current CI-required policy remains the critical Flake8 codes `E9,F63,F7,F82`,
the scoped Mypy remediation list, and the scoped Black/isort remediation list.
The `backend` job and complete backend test suite remain required checks.

## Initial evidence

Against `origin/main` at `dd4f5356496bd16195808f410ed3cc940baeca9a` (Python 3.12
local tooling; CI uses Python 3.14.3), the initial report recorded:

| Tool | Findings | Meaning |
| --- | ---: | --- |
| Flake8 | 1,998 | Full-tree legacy findings; critical subset remains gated |
| Mypy | 285 | Full-tree report with explicit package bases |
| Black | 47 | Files not matching current Black formatting |
| isort | 53 | Files with import-order findings |

These are baseline measurements, not waivers. New changes must satisfy the
required scoped checks until the whole-codebase threshold decision is recorded.

## Ownership and triage

- `backend/` runtime and domain modules: Backend maintainers.
- `backend/tests/`: Backend and QA maintainers.
- `backend/migrations/`: Backend/database maintainers; migration safety remains
  a release-owner review item.
- `scripts/` and workflow evidence: DevOps/release owner with Backend support.
- Any failure in the required `backend` job: Backend owner is first responder;
  release owner owns required-check policy and escalation.

Legacy findings stay visible in artifacts and are triaged by directory and
owner. A future change may ratchet only after owners record a threshold,
baseline refresh date, and an explicit exception/expiry process in this phase
document and the main tracker.

## Current-main collector correction — 14 August 2026

The original recursive `backend` arguments allowed an untracked local backup
virtual environment to enter the Flake8 walk. The reproduced local directory
contained 5,015 Python files and occupied 322 MB. The corrected tracked-file
manifest contains 169 Python files, excludes every untracked/generated tree by
construction, and completed all four tools in 3.68 seconds. Its Flake8 output
was 168 KiB rather than the reported approximately 13 MiB polluted output.

At stacked audit base `9073d36`, the corrected report recorded Flake8 `2,046`,
Mypy `288`, Black `47`, and isort `51` findings. These remain report-only debt;
the required critical/scoped CI checks remain blocking. See the
[current-main quality evidence packet](QUALITY-EVIDENCE-CURRENT-MAIN-REVALIDATION-2026-08-14.md)
for checksums, profile results, and limitations.
