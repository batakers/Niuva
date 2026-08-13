# Test and Quality Evidence Current-Main Revalidation — 14 August 2026

<!-- markdownlint-disable MD013 -->

Status: **repository controls revalidated and collector fail-open corrected;
external, production-like, policy, and independent-review gates remain open**

This packet audits backend test, quality, and dependency reproducibility. It
does not claim staging, production, deployment, provider, migration, release,
or go-live evidence.

## Baseline and change

| Field | Evidence |
| --- | --- |
| Runtime baseline | `origin/main` at `15b759a02b036330f1dd0913611043e0fd6134e2` |
| Stacked audit base | `9073d36c541b6a52e05d1f9cb7d35acf1876e409`, PR #249 head |
| Branch | `audit/backend-quality-evidence-current-main` |
| Supported runtime | CPython `3.14.3` from `.python-version` and all backend test workflows |
| Source change | Quality collector now scans only tracked backend Python files and records input/output SHA-256 values; pytest evidence rejects a JUnit document containing zero test cases; retry-safe transactions use a bounded 10/20 ms backoff so a winning concurrent transaction can commit before the loser retries |

The source change does not alter application runtime, tests selected by CI,
dependency versions, or static-quality thresholds.

## Test-profile audit

| Profile | Fail-closed contract | Current result and limit |
| --- | --- | --- |
| Hermetic | Required `quality-gates / backend` runs the complete `backend/tests` tree, emits JUnit, validates failures/errors and the exact expected-skip allowlist, then uploads JUnit plus JSON evidence with `if-no-files-found: error`. Empty JUnit now fails explicitly. | Local Python 3.14.3 exact-stack run: `1036 passed, 15 skipped, 14 subtests passed`; JUnit contains 1,051 cases, zero failures/errors, zero unexpected skips, SHA-256 `a17aa3571a1deb78e872ce7ff28cda198a4cd23872358c547b39a85a9500a8cf`. Exact PR-head CI remains required. |
| Real transaction | PR workflow starts an isolated MongoDB replica set, sets the explicit opt-in, selects all 15 mandatory integration modules, rejects every skip, and requires JUnit plus JSON evidence. Pytest failure/no collection, evidence failure, or absent artifact fails the job. | A manually dispatched run exposed one real contention flake: 79 passed and Project duplicate concurrency leaked an exhausted Mongo write conflict. The executor now backs off 10/20 ms between its three bounded transient attempts. PR run `31740271681` then passed all 80 with zero skips at the PR merge candidate; JUnit SHA-256 `05502680a1da44bbefcf1cf565128316cc87f458aebde7c15d58652119b7d274`. Docker remains unavailable locally. |
| External public smoke | Manual staging-environment workflow validates an approved credential-free HTTPS origin, performs public smoke plus external pytest, rejects every skip/empty result, and requires smoke JSON, JUnit, and checksum-bearing evidence. | Correctly `environment_blocked`: no approved target was supplied. No external pass is claimed. |
| External Admin browser | Manual staging workflow validates distinct HTTPS frontend/API origins, all five role credentials, API liveness/CORS, and four viewport projects. | No target or credentials were supplied. The workflow currently uploads browser artifacts with `if-no-files-found: ignore` and has no checksum manifest; this is not a required PR check and cannot be promoted to release evidence until artifact enforcement/provenance is approved and implemented. |

The verifier's result is tied to profile, Git SHA, Python/platform, declared
command, test totals, unexpected skips, and JUnit checksum. Malformed or
missing XML already terminates nonzero; the new zero-test regression closes the
remaining empty-artifact success path.

## Whole-tree and required static quality

The reported issue was reproduced structurally. The local
`backend/.venv-python312-backup/` is untracked, occupies 322 MB, and contains
5,015 Python files. Recursive `flake8 backend` therefore admitted unrelated
interpreter packages. The corrected input is the sorted `git ls-files` backend
Python manifest, which excludes that directory and every other generated or
untracked Python tree by construction.

| Measurement | Corrected result at `9073d36` |
| --- | ---: |
| Tracked Python inputs | 169 |
| Input manifest SHA-256 | `1ccb514a864491992cd8805daf1a95cd78aed513e3e0cc8df2dae01348f09f9e` |
| Elapsed collector time | 3.68 seconds |
| Flake8 | 2,046 findings; 168 KiB output |
| Mypy | 288 findings; 40 KiB output |
| Black | 47 files |
| isort | 51 files |

Each raw tool output has its own SHA-256 in `summary.json`. The collector stays
report-only and returns success after recording debt. In contrast, critical
Flake8 `E9,F63,F7,F82`, the 23-file Mypy scope, the bounded Black/isort scope,
compile checks, and the complete backend suite remain required and blocking.
No broad threshold or legacy-debt waiver was introduced.

## Dependency reproducibility and lifecycle

| Control | Result |
| --- | --- |
| Direct versus install input | `requirements.txt` has 30 direct requirements (six exact, 24 ranged); CI installs only the generated `requirements.lock` |
| Lock integrity | 72 locked distributions and 1,044 SHA-256 hash entries; all backend profiles use Python 3.14.3 plus `pip --require-hashes` |
| Installed compatibility | 71 platform-applicable distributions; `uv pip check` passed |
| Vulnerability audit | Fresh isolated `pip-audit==2.10.1`: 71 dependencies, zero known vulnerabilities |
| License metadata | Fresh `pip-licenses==5.5.5`: 71 records, zero empty/`none`/`unknown` license fields |
| License decision | Metadata completeness only; legal compatibility, notice obligations, owner, and exception/expiry remain open |
| Deprecation | `motor==3.3.1` is still used throughout runtime, migrations, and transaction tests. Motor normal support ended 14 May 2026; only critical fixes continue through 14 May 2027. PyMongo Async migration needs a separately reviewed compatibility project. |

The ranged direct requirements are not the release install artifact and do not
invalidate reproducibility while the hash-locked graph is enforced. They do
mean regeneration can select newer compatible versions and must remain an
explicit reviewed dependency change.

## Verification performed

- `python -m pytest -n 0 -q backend/tests/test_backend_quality_baseline.py backend/tests/test_pytest_evidence.py` — `7 passed`.
- Shared transaction executor/guard/observability and B2B conversion focus —
  `32 passed`; the retry unit test asserts the initial 10 ms yield.
- Complete hermetic command with JUnit plus evidence verifier — `1036 passed,
  15 skipped, 14 subtests passed`; zero unexpected skips.
- Corrected quality collector — completed in 3.68 seconds with the exact
  manifest and output checksums above.
- `uv pip check --python backend/.venv/bin/python` — compatible.
- Isolated pinned vulnerability and license commands — zero known
  vulnerabilities and zero invalid license metadata.
- Exact-source quality run `31740275604` — backend, frontend, secret scan, all
  evidence uploads, 1,051-case hermetic evidence, 409 frontend tests, and five
  hermetic browser contracts passed at source SHA `0a3ab5e`.
- PR transaction run `31740271681` — 80 passed with zero skips and validated
  checksum-bearing evidence at the generated PR merge candidate.
- `git diff --check` — passed before documentation finalization.

## Disposition and remaining gates

- The local virtualenv pollution defect, empty-JUnit verifier path, and
  reproduced immediate-retry contention flake are `resolved_in_source` on this
  branch.
- Hermetic, transaction, critical/scoped quality, lock, vulnerability, license
  metadata, and artifact-presence controls are `resolved_in_repository_gate`;
  source-head quality and PR merge-candidate transaction CI passed after the
  contention correction.
- External public and Admin profiles remain `environment_blocked`; the Admin
  browser artifact/checksum contract is also `partial`.
- Whole-tree threshold/ratchet ownership, exception expiry, legal license
  disposition, Motor migration, artifact retention policy, production-like
  evidence, deployment, release, and go-live remain open or decision-blocked.

Rollback is a normal commit revert. Reverting the collector would reintroduce
untracked-environment pollution and must not be treated as an acceptable
baseline restoration.

<!-- markdownlint-enable MD013 -->
