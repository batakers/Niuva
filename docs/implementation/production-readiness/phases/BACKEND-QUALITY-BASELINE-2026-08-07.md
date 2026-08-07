# Backend quality baseline — 10.3

Status: implemented as a report-only whole-codebase baseline on
`chore/backend-quality-baseline`. The existing critical checks remain required
CI gates; no repository-wide threshold is promoted until owners approve one.

## Reproducible commands

From the repository root, using the pinned CI Python runtime:

```text
python scripts/collect_backend_quality_baseline.py --output-dir backend-quality-baseline
```

The collector records the exact commands, Python/platform metadata, Git SHA,
raw tool output, exit codes, and finding counts in `summary.json`. It always
returns success after writing evidence: this is intentional while the legacy
baseline is being triaged, and must not be confused with a passed quality gate.

The report-only commands are:

```text
python -m flake8 backend --exclude backend/.venv,__pycache__
python -m mypy backend --explicit-package-bases --ignore-missing-imports --check-untyped-defs --show-error-codes
python -m black --check backend
python -m isort --profile black --check-only backend
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
