# NIV-001 Credential Containment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the tracked administrator credential from the current repository tree, prevent the same integration-test/report pattern from recurring, and record the residual rotation and Git-history obligations without exposing the credential.

**Architecture:** Keep production authentication and admin seed behavior unchanged. Replace the live integration suite's hardcoded administrator credential with test-only environment variables that skip only admin-dependent tests when absent, delete the stale generated report that copied the credential, and add a small repository-hygiene regression test plus a targeted ignore rule. Treat credential rotation and Git-history remediation as separate operational gates because the introducing commit is already present on multiple local and remote branches.

**Tech Stack:** Python 3 standard library `unittest` and `ast`, existing pytest integration suite, Git, Markdown.

## Global Constraints

- Never print, copy into a plan, log, issue, commit message, or test assertion the audited credential value.
- Do not authenticate with the audited credential.
- Do not modify production admin, authentication, authorization, dashboard, order, payment, storage, backend seed, or API behavior.
- Do not modify `backend/tests/test_auth_security.py`; its isolated fake values are test fixtures and are not the audited live integration credential.
- Do not install dependencies.
- Do not rewrite Git history, force-push, delete remote branches, rotate credentials, or change external systems in this implementation branch.
- Keep `.superpowers/` untracked and untouched.
- Do not mark NIV-001 `Verified` until credential rotation/invalidation and the history-remediation decision are recorded by the responsible owner.
- Current implementation branch: `fix/niv-001-credential-containment`.

---

## Root-Cause Record

- The same audited literal occurs exactly twice in the pre-remediation base tree at `0b22d979e2db8c41c175545b70927ec11dc3583c`: `backend/tests/backend_test.py:32` and `test_reports/iteration_1.json:35`.
- Both occurrences were introduced by commit `a75dc92b46e6d0f6f1820a4d1123c17bffdcca84` on 28 June 2026.
- The integration suite already uses an environment-driven module skip when `REACT_APP_BACKEND_URL` is absent, but administrator credentials were hardcoded instead of following an environment/fixture boundary.
- `test_reports/iteration_1.json` is a stale generated report and `test_reports/iteration_*.json` is not ignored.
- The introducing commit is contained in `main`, `origin/main`, `origin/redesign/brand-alignment`, and multiple other local/remote branches. Removing current-tree literals does not remove the credential from Git history.

## File Structure

| File | Responsibility in this plan |
|---|---|
| `backend/tests/test_repository_credential_hygiene.py` | Regression checks for the repository pattern that caused NIV-001 |
| `backend/tests/backend_test.py` | Read live integration administrator credentials only from test-specific environment variables |
| `.gitignore` | Prevent stale `test_reports/iteration_*.json` artifacts from being added again |
| `test_reports/iteration_1.json` | Delete the stale tracked generated report containing the audited credential |
| `doc/WEBSITE_AUDIT_BASELINE_2026-07-19.md` | Record repository containment while keeping external rotation/history gates open |

---

### Task 1: Add a Failing Repository-Hygiene Regression Test

**Files:**
- Create: `backend/tests/test_repository_credential_hygiene.py`
- Inspect: `backend/tests/backend_test.py:30-41`
- Inspect: `.gitignore`
- Inspect: `test_reports/iteration_1.json`

**Interfaces:**
- Consumes: repository paths resolved from `Path(__file__).resolve().parents[2]`.
- Produces: three standard-library tests runnable without pytest-xdist through `python -B -m unittest backend.tests.test_repository_credential_hygiene -v`.

- [x] **Step 1: Write the failing regression test**

Create `backend/tests/test_repository_credential_hygiene.py` with exactly this initial content:

```python
import ast
import unittest
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
INTEGRATION_TEST = REPOSITORY_ROOT / "backend" / "tests" / "backend_test.py"
STALE_ITERATION_REPORT = REPOSITORY_ROOT / "test_reports" / "iteration_1.json"
GITIGNORE = REPOSITORY_ROOT / ".gitignore"


class RepositoryCredentialHygieneTests(unittest.TestCase):
    def test_integration_admin_password_is_not_a_string_literal(self):
        tree = ast.parse(INTEGRATION_TEST.read_text(encoding="utf-8"))
        literal_assignments = [
            node.lineno
            for node in ast.walk(tree)
            if isinstance(node, ast.Assign)
            and any(
                isinstance(target, ast.Name) and target.id == "ADMIN_PASSWORD"
                for target in node.targets
            )
            and isinstance(node.value, ast.Constant)
            and isinstance(node.value.value, str)
        ]

        self.assertEqual(
            literal_assignments,
            [],
            "Integration administrator credentials must come from the test environment.",
        )

    def test_stale_iteration_report_is_not_present(self):
        self.assertFalse(
            STALE_ITERATION_REPORT.exists(),
            "Generated iteration reports must not be tracked in the repository.",
        )

    def test_generated_iteration_reports_are_ignored(self):
        patterns = {
            line.strip()
            for line in GITIGNORE.read_text(encoding="utf-8").splitlines()
            if line.strip() and not line.lstrip().startswith("#")
        }

        self.assertIn("test_reports/iteration_*.json", patterns)


if __name__ == "__main__":
    unittest.main()
```

- [x] **Step 2: Run the test and verify RED**

Run from the repository root:

```powershell
python -B -m unittest backend.tests.test_repository_credential_hygiene -v
```

Expected: exit code `1` with three assertion failures:

- the current integration test assigns `ADMIN_PASSWORD` a string literal;
- `test_reports/iteration_1.json` exists;
- `.gitignore` does not contain `test_reports/iteration_*.json`.

If the command errors instead of reaching these assertions, fix the test harness and rerun until it fails for the three expected reasons.

---

### Task 2: Move Live Integration Credentials to the Test Environment

**Files:**
- Modify: `backend/tests/backend_test.py:1-41`
- Test: `backend/tests/test_repository_credential_hygiene.py`

**Interfaces:**
- Consumes: `NIUVA_TEST_ADMIN_EMAIL` and `NIUVA_TEST_ADMIN_PASSWORD` from the integration-test process environment.
- Produces: the existing `admin_token` fixture and the same authenticated test behavior when both variables are configured.

- [x] **Step 1: Document the test-only environment contract**

Change the module docstring to:

```python
"""
NIUVA backend integration tests (pytest).
Covers: auth, materials, orders, payment, admin order flow,
portfolio, internship/contact, settings, users, stats, notifications.

Required environment for authenticated integration tests:
- REACT_APP_BACKEND_URL
- NIUVA_TEST_ADMIN_EMAIL
- NIUVA_TEST_ADMIN_PASSWORD

Credentials must belong to an approved non-production test environment and
must never be stored in this repository or generated test reports.
"""
```

- [x] **Step 2: Replace the hardcoded administrator constants**

Replace the two administrator assignments after `API = f"{BASE_URL}/api"` with:

```python
ADMIN_EMAIL = os.environ.get("NIUVA_TEST_ADMIN_EMAIL", "").strip()
ADMIN_PASSWORD = os.environ.get("NIUVA_TEST_ADMIN_PASSWORD", "")
```

Do not provide a default email or password.

- [x] **Step 3: Make only the admin fixture skip when credentials are absent**

Change the beginning of `admin_token` to:

```python
@pytest.fixture(scope="session")
def admin_token():
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        pytest.skip(
            "Integration administrator credentials are not configured; set "
            "NIUVA_TEST_ADMIN_EMAIL and NIUVA_TEST_ADMIN_PASSWORD for an approved "
            "non-production test environment."
        )

    r = requests.post(
        f"{API}/auth/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=30,
    )
```

Keep the existing response assertions and returned token immediately after this request. Do not change endpoint behavior or assertions.

- [x] **Step 4: Run the targeted test and confirm only two expected failures remain**

```powershell
python -B -m unittest backend.tests.test_repository_credential_hygiene -v
```

Expected: the administrator-literal test passes; the report-presence and ignore-rule tests still fail. This isolates the integration-test fix before touching generated artifacts.

---

### Task 3: Remove the Generated Credential Report and Prevent Recurrence

**Files:**
- Modify: `.gitignore:83-92`
- Delete: `test_reports/iteration_1.json`
- Test: `backend/tests/test_repository_credential_hygiene.py`

**Interfaces:**
- Consumes: generated iteration-report filename convention `test_reports/iteration_*.json`.
- Produces: a clean current tree in which generated iteration JSON reports are not tracked.

- [x] **Step 1: Add the targeted ignore rule**

Add this block after the existing build-cache section and before `memory/test_credentials.md`:

```gitignore
# Generated test-agent reports can contain environment-specific details.
test_reports/iteration_*.json
```

Keep `.gitkeep` and `test_reports/pytest/pytest_results.xml` unchanged. Do not ignore the entire `test_reports/` directory.

- [x] **Step 2: Delete the stale generated report**

Delete only:

```text
test_reports/iteration_1.json
```

Do not copy its credential field into replacement documentation. The audit baseline already preserves the non-sensitive finding and evidence path.

- [x] **Step 3: Run the targeted test and verify GREEN**

```powershell
python -B -m unittest backend.tests.test_repository_credential_hygiene -v
```

Expected: exit code `0`, `Ran 3 tests`, `OK`.

- [x] **Step 4: Confirm the deleted report is ignored if regenerated**

```powershell
git check-ignore -v --no-index test_reports/iteration_1.json
```

Expected: output points to the new `test_reports/iteration_*.json` rule in `.gitignore`.

---

### Task 4: Prove the Audited Literal Is Absent from the Current Tracked Tree

**Files:**
- Verify: all tracked files
- Verify: `backend/tests/backend_test.py`
- Verify: `test_reports/iteration_1.json`

**Interfaces:**
- Consumes: the audited literal extracted in memory from the immutable pre-remediation base commit without printing it.
- Produces: a count-only current-tree scan and a list of paths/line numbers only if a residual match exists.

- [x] **Step 1: Run a value-redacted exact-literal scan**

Run from the repository root. This command extracts the previous literal in memory, scans current tracked files, and prints only match count plus path/line metadata:

```powershell
$preRemediationSha = '0b22d979e2db8c41c175545b70927ec11dc3583c'
$previous = git show "${preRemediationSha}:backend/tests/backend_test.py"
$sourceLine = $previous | Where-Object { $_ -match '^ADMIN_PASSWORD\s*=' } | Select-Object -First 1
$match = [regex]::Match($sourceLine, 'ADMIN_PASSWORD\s*=\s*["''](?<value>[^"'']+)["'']')
if (-not $match.Success) { throw 'Unable to load the audited literal for a redacted scan' }
$auditSecret = $match.Groups['value'].Value
$matchingFiles = @(
    $auditSecret |
        git grep -l --untracked -F -f - -- . ':(exclude).superpowers/**' 2>$null
)
if ($LASTEXITCODE -notin 0, 1) { throw "git grep failed with exit code $LASTEXITCODE" }
"AuditedLiteralWorktreeFileHits=$($matchingFiles.Count)"
$matchingFiles
```

Expected: `AuditedLiteralWorktreeFileHits=0` and no following path output. The pattern is passed through stdin, tracked plus intended untracked files are checked, `.superpowers/` is excluded and untouched, and matching lines are never printed. Never print `$auditSecret` or `$sourceLine`.

- [x] **Step 2: Run a key-name review without value output**

```powershell
$patterns = 'ADMIN_PASSWORD|NIUVA_TEST_ADMIN_PASSWORD|test_credentials'
foreach ($path in (git ls-files)) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { continue }
    try {
        $matches = Select-String -LiteralPath $path -Pattern $patterns -AllMatches -ErrorAction Stop
    } catch {
        continue
    }
    foreach ($hit in $matches) {
        "${path}:$($hit.LineNumber):key-reference"
    }
}
```

Expected: output contains only path, line number, and `key-reference`; references remain only where a key name or safe environment-variable contract is intentional. Inspect the referenced source locally without printing values.

- [x] **Step 3: Run the repository-hygiene regression test again**

```powershell
python -B -m unittest backend.tests.test_repository_credential_hygiene -v
```

Expected: exit code `0`, `Ran 3 tests`, `OK`.

- [x] **Step 4: Attempt the repository backend suite without changing dependencies**

```powershell
python -B -m pytest backend/tests -v -p no:cacheprovider
```

Expected in the current audit environment: exit code `1` before test collection because `backend/pytest.ini` requires the missing `pytest-xdist` plugin. Record this as an environment blocker. If an existing approved environment already provides the plugin, require the configured suite to pass instead. Do not install dependencies solely for this plan.

---

### Task 5: Record Repository Containment Without Closing the Incident

**Files:**
- Modify: `doc/WEBSITE_AUDIT_BASELINE_2026-07-19.md:88-112`
- Modify: `doc/WEBSITE_AUDIT_BASELINE_2026-07-19.md:114-128`
- Modify: `doc/WEBSITE_AUDIT_BASELINE_2026-07-19.md:348-352`

**Interfaces:**
- Consumes: verified current-tree scan and targeted regression-test results.
- Produces: an auditable partial status that does not claim external rotation or history cleanup.

- [x] **Step 1: Change only NIV-001's status**

In the Findings Register, change NIV-001 from `Open` to:

```text
Implemented, verification pending
```

Keep severity `P0` until external rotation/invalidation and the history decision are complete.

- [x] **Step 2: Add repository-containment evidence under NIV-001**

Append this subsection after the existing NIV-001 bullets:

```markdown
Repository containment progress recorded on 19 July 2026:

- The current branch no longer stores the audited administrator value in the live integration test or generated iteration report.
- Authenticated integration tests now require test-only environment variables and skip admin-dependent coverage when they are absent.
- A repository-hygiene regression test and targeted ignore rule guard the current-tree pattern.
- Credential rotation/invalidation remains an external owner action.
- Git-history remediation remains open because the introducing commit is present on multiple local and remote branches.
- NIV-001 remains P0 and must not be marked `Verified` until both outstanding gates are recorded.
```

- [x] **Step 3: Append the change-log entry**

Add:

```markdown
| 19 July 2026 | Recorded NIV-001 current-tree containment; external credential rotation and Git-history decision remain open | Codex, pending stakeholder verification |
```

---

### Task 6: Final Verification and Review Gate

**Files:**
- Verify: `.gitignore`
- Verify: `backend/tests/backend_test.py`
- Verify: `backend/tests/test_repository_credential_hygiene.py`
- Verify deletion: `test_reports/iteration_1.json`
- Verify: `doc/WEBSITE_AUDIT_BASELINE_2026-07-19.md`
- Verify: `docs/superpowers/plans/2026-07-19-niv-001-credential-containment.md`

**Interfaces:**
- Consumes: all implementation tasks.
- Produces: evidence for review; no remote mutation or history rewrite.

- [x] **Step 1: Run formatting and diff checks**

```powershell
git diff --check
git status --short
git diff --stat
git diff --name-status
git diff -- .gitignore backend/tests/test_repository_credential_hygiene.py doc/WEBSITE_AUDIT_BASELINE_2026-07-19.md docs/superpowers/plans/2026-07-19-niv-001-credential-containment.md
git diff --numstat -- backend/tests/backend_test.py test_reports/iteration_1.json
```

Expected:

- `git diff --check` exits `0`;
- only the six intended paths are changed, plus the pre-existing untracked `.superpowers/`;
- content diffs for `backend/tests/backend_test.py` and the deleted report are not printed because the removed credential would appear in deletion context;
- no production/backend implementation file is changed.

Review the current sanitized integration-test content directly and use the count-only scan from Task 4 for the sensitive paths. Do not print their ordinary Git diff.

- [x] **Step 2: Re-run the completion evidence**

Run:

```powershell
python -B -m unittest backend.tests.test_repository_credential_hygiene -v
```

Expected: exit code `0`, `Ran 3 tests`, `OK`.

Then rerun the redacted exact-literal scan from Task 4 and require `AuditedLiteralWorktreeFileHits=0`.

- [x] **Step 3: Request protected security review**

Review specifically:

- environment-variable names cannot silently fall back to production values;
- the admin fixture skips rather than authenticating when test credentials are absent;
- the stale generated report is deleted and ignored;
- current-tree scan is zero;
- baseline status remains `Implemented, verification pending`, not `Verified`;
- no history rewrite or remote operation occurred.

- [x] **Step 4: Obtain explicit user approval before committing**

Suggested commands after approval:

```powershell
git add -- .gitignore backend/tests/backend_test.py backend/tests/test_repository_credential_hygiene.py test_reports/iteration_1.json doc/WEBSITE_AUDIT_BASELINE_2026-07-19.md docs/superpowers/plans/2026-07-19-niv-001-credential-containment.md
git commit -m "security: remove tracked admin credential"
```

Do not push until separately requested. Do not force-push under this plan.

---

## Operational Follow-Up Required Before NIV-001 Can Be Verified

The repository patch cannot complete the incident by itself. The responsible security/operations owner must:

1. Determine whether the audited administrator credential was ever active.
2. Rotate or invalidate it immediately if active or uncertain.
3. Record a redacted rotation reference and timestamp without storing the new value in Git.
4. Decide whether to rewrite Git history across all affected branches and clones.
5. If history cleanup is approved, create a separate coordinated runbook covering backup, collaborator notification, branch/tag scope, force-push authorization, clone remediation, and post-rewrite secret scanning.
6. Only after rotation/invalidation and the history decision are evidenced may NIV-001 be changed from `Implemented, verification pending` to `Verified` or `Accepted risk`.

## Self-Review Record

- Spec coverage: current-tree removal, recurrence prevention, safe integration-test configuration, partial baseline update, external rotation gate, and history decision are each mapped to a task.
- Scope control: no production auth behavior, dependency, provider, migration, history rewrite, or remote action is included.
- TDD: Task 1 must fail for the three known reasons before Tasks 2 and 3 make it pass.
- Secret hygiene: no credential value is present in this plan; scans output counts and path metadata only.
- Type/interface consistency: Tasks 2-6 use the same `NIUVA_TEST_ADMIN_EMAIL` and `NIUVA_TEST_ADMIN_PASSWORD` contract.
- Completeness scan: every implementation action has exact content, paths, commands, and expected results.
