# Redesign-to-Main Reconciliation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconcile the approved redesign and Emergent-removal outcome into current `main`, delete the twelve proven no-op remote branches atomically, and open a reviewable PR without importing divergent history.

**Architecture:** Keep `origin/main` as the only ancestry and security/governance source of truth. Treat the already-identical public brand and frontend cleanup as verification-only, then semantically implement the missing provider-neutral backend storage boundary on `reconcile/redesign-to-main`. Remote cleanup uses exact expected-tip leases and one atomic deletion; source branches remain until the reconciliation PR is merged and separately verified.

**Tech Stack:** Git 2.x, PowerShell 7, Python 3.12, FastAPI, pytest/pytest-xdist, React 19, CRACO, Jest, npm, GitHub CLI.

## Global Constraints

- Work only in the fresh clone at `C:\Portfolio\Niuva\Niuva-fresh-20260721` on `reconcile/redesign-to-main`.
- Never merge, rebase, cherry-pick, or force-push `redesign/brand-alignment`; use it only as a read-only semantic reference.
- Never push directly to `main`, delete tags, rewrite published history, or import commits from an old clone.
- `origin/main` must remain at planning baseline `74b2d7c689db7c033a405b329b5844977795c767`. If it moves, stop and recompute this plan before any remote mutation.
- Preserve all identity, RBAC, organization, audit, catalog, material, inventory, transaction-readiness, credential-containment, and authenticated-download work already present in `main`.
- Preserve header-only file authentication; do not reintroduce `?auth=` access tokens.
- `STORAGE_BACKEND` defaults to `disabled`; local storage is allowed only in `development`, `demo`, and `test`.
- Do not select a production storage provider, migrate legacy Emergent objects, enable production uploads, or weaken ADR-002 readiness gates.
- Phase A may delete exactly the twelve branches listed in Task 1 and no others.
- Phase B is outside this execution. It requires the PR to be merged, a fresh-clone verification, and a new explicit user confirmation.

---

## File Map

| File | Responsibility |
|---|---|
| `backend/storage.py` | Provider-neutral disabled/local storage boundary, environment gate, safe path and MIME handling |
| `backend/server.py` | Controlled `503`/`404`/`400`/`500` translation while preserving current auth and RBAC |
| `backend/.env.example` | Explicit safe storage defaults and development-only local example |
| `backend/tests/test_storage.py` | Unit coverage for adapter selection, environment restrictions, paths, metadata, and atomic cleanup |
| `backend/tests/test_storage_routes.py` | Route/helper coverage for disabled storage and current header-only authorization |
| `backend/tests/test_emergent_backend_hygiene.py` | Regression scan for active backend/deployment Emergent integration |
| `doc/PRODUCTION_DEPLOYMENT.md` | Production-disabled storage guidance without reverting current token-security guidance |
| `docs/superpowers/specs/2026-07-21-redesign-main-reconciliation-design.md` | Approved reconciliation and branch-retention policy |
| `docs/superpowers/plans/2026-07-21-redesign-main-reconciliation.md` | This executable implementation plan and safety gates |

The following source-branch files are reference-only and must not be copied wholesale: `backend/server.py`, `backend/tests/backend_test.py`, `backend/tests/test_auth_security.py`, `backend/tests/test_repository_credential_hygiene.py`, `frontend/src/App.js`, `frontend/src/lib/api.js`, all current admin/operational pages, and all main-only foundation modules and migrations.

---

### Task 1: Revalidate and Delete Cleanup Phase A Atomically

**Files:**
- No tracked file changes.

**Interfaces:**
- Consumes the current GitHub branch tips and current `origin/main` tree.
- Produces one all-or-nothing deletion of exactly twelve remote refs.
- Preserves the recorded full tip SHA of every deleted ref for manual recovery.

Planning-baseline tips:

| Branch | Expected full SHA |
|---|---|
| `backup-main` | `41676fe00d7c9ceb845c202a0357bc63185b158a` |
| `design/catalog-material-inventory-foundation` | `1bc0908da7c85dd6603f8075b4d1f1b0e1e5b0af` |
| `dirguy` | `d6264aca22d69c1424c6886c35bdc78502a6803d` |
| `docs/foundation-spec-alignment` | `7ec2d428ff70e1d61ffcc13457a26b0c168b58af` |
| `docs/foundation-spec-review-findings` | `8ce8f05f82c7f00505c886cef73188b0df2299f6` |
| `docs/niv-001-history-rewrite-runbook` | `5182f35e31230e41194360ca0812f1395dbf68be` |
| `docs/niv-001-rehearsal-scope-v2` | `f56a2c80def5ce07f30714cf8c655e8ecbdd98c1` |
| `docs/platform-governance-baseline` | `3871fe91a0d1212958c1263fbd9cad414bbffa17` |
| `feat/tx-readiness-guard` | `9e3bdf6942fac54425aa6cda553dcb5455c5300b` |
| `feat/tx-test-topology` | `9e3bdf6942fac54425aa6cda553dcb5455c5300b` |
| `fix/niv-001-main-containment` | `e146b9fb65897cfbc9a53113a75aab10544b9f98` |
| `plan/foundation-transaction-capability` | `a33de7acbd4b91cdee53319f0eb801e5e2d183a0` |

- [ ] **Step 1: Confirm the fresh reconciliation worktree is clean**

```powershell
git status --short --branch
git branch --show-current
git rev-parse --git-dir
git rev-parse --git-common-dir
```

Expected: branch is `reconcile/redesign-to-main`, the working tree is clean, and both Git-dir commands return `.git`.

- [ ] **Step 2: Fetch and reject any main or candidate drift**

```powershell
git fetch origin
$mainBaseline = '74b2d7c689db7c033a405b329b5844977795c767'
if ((git rev-parse origin/main).Trim() -ne $mainBaseline) { throw 'origin/main moved; stop and recompute the audit' }

$expected = [ordered]@{
  'backup-main' = '41676fe00d7c9ceb845c202a0357bc63185b158a'
  'design/catalog-material-inventory-foundation' = '1bc0908da7c85dd6603f8075b4d1f1b0e1e5b0af'
  'dirguy' = 'd6264aca22d69c1424c6886c35bdc78502a6803d'
  'docs/foundation-spec-alignment' = '7ec2d428ff70e1d61ffcc13457a26b0c168b58af'
  'docs/foundation-spec-review-findings' = '8ce8f05f82c7f00505c886cef73188b0df2299f6'
  'docs/niv-001-history-rewrite-runbook' = '5182f35e31230e41194360ca0812f1395dbf68be'
  'docs/niv-001-rehearsal-scope-v2' = 'f56a2c80def5ce07f30714cf8c655e8ecbdd98c1'
  'docs/platform-governance-baseline' = '3871fe91a0d1212958c1263fbd9cad414bbffa17'
  'feat/tx-readiness-guard' = '9e3bdf6942fac54425aa6cda553dcb5455c5300b'
  'feat/tx-test-topology' = '9e3bdf6942fac54425aa6cda553dcb5455c5300b'
  'fix/niv-001-main-containment' = 'e146b9fb65897cfbc9a53113a75aab10544b9f98'
  'plan/foundation-transaction-capability' = 'a33de7acbd4b91cdee53319f0eb801e5e2d183a0'
}

$remoteRefspecs = @($expected.Keys | ForEach-Object { "refs/heads/$_" })
$remoteLines = @(git ls-remote --heads origin @remoteRefspecs)
if ($LASTEXITCODE -ne 0) { throw 'Unable to read current remote branch tips' }
$actual = @{}
foreach ($line in $remoteLines) {
  $sha, $ref = $line -split '\s+', 2
  $actual[$ref.Substring('refs/heads/'.Length)] = $sha
}
foreach ($name in $expected.Keys) {
  if (-not $actual.ContainsKey($name)) { throw "Missing remote branch: $name" }
  if ($actual[$name] -ne $expected[$name]) { throw "Remote branch moved: $name" }
  if ((git rev-parse "origin/$name").Trim() -ne $expected[$name]) { throw "Remote-tracking ref drifted: $name" }
}
$expected.GetEnumerator() | Format-Table -AutoSize
```

Expected: all twelve server tips and remote-tracking tips exactly match the table above.

- [ ] **Step 3: Re-prove every candidate is a no-op tree merge**

```powershell
$mainTree = (git rev-parse 'origin/main^{tree}').Trim()
foreach ($name in $expected.Keys) {
  $mergeOutput = @(git merge-tree --write-tree origin/main "origin/$name" 2>&1)
  if ($LASTEXITCODE -ne 0) { throw "Synthetic merge failed for $name`n$($mergeOutput -join "`n")" }
  $mergeTree = $mergeOutput[0].Trim()
  if ($mergeTree -ne $mainTree) { throw "Branch is no longer a no-op: $name" }
}
'All Phase A candidates reproduce the exact main tree'
```

Expected: the final message prints and no candidate produces a different tree.

- [ ] **Step 4: Dry-run and perform one leased atomic deletion**

```powershell
$leaseArgs = @($expected.GetEnumerator() | ForEach-Object { "--force-with-lease=refs/heads/$($_.Key):$($_.Value)" })
$deleteRefspecs = @($expected.Keys | ForEach-Object { ":refs/heads/$_" })
git push --dry-run --atomic @leaseArgs origin @deleteRefspecs
if ($LASTEXITCODE -ne 0) { throw 'Atomic deletion dry-run rejected; delete nothing' }
$mainImmediatelyBeforeDelete = ((git ls-remote --heads origin refs/heads/main) -split '\s+')[0]
if ($mainImmediatelyBeforeDelete -ne $mainBaseline) { throw 'main moved after deletion dry-run; delete nothing' }
git push --atomic @leaseArgs origin @deleteRefspecs
if ($LASTEXITCODE -ne 0) { throw 'Atomic deletion rejected; do not retry branch-by-branch' }
```

Expected: Git reports all twelve ref deletions in one successful atomic push. No force-push of a surviving ref occurs.

- [ ] **Step 5: Verify remote absence and unchanged main, then prune safe local copies**

```powershell
$remaining = @(git ls-remote --heads origin @remoteRefspecs)
if ($LASTEXITCODE -ne 0) { throw 'Unable to verify remote deletion' }
if ($remaining.Count -ne 0) { throw "Phase A refs remain:`n$($remaining -join "`n")" }
$mainAfter = ((git ls-remote --heads origin refs/heads/main) -split '\s+')[0]
if ($mainAfter -ne $mainBaseline) { throw 'main changed during cleanup' }

foreach ($name in $expected.Keys) {
  git show-ref --verify --quiet "refs/heads/$name"
  if ($LASTEXITCODE -eq 0) {
    if ((git branch --show-current).Trim() -eq $name) { throw "Candidate is checked out: $name" }
    git branch -d -- $name
    if ($LASTEXITCODE -ne 0) { Write-Warning "Local branch retained for manual review: $name" }
  }
}
git fetch --prune origin
git status --short --branch
```

Expected: all twelve remote refs are absent, `main` is unchanged, and the reconciliation branch remains clean. Do not use `git branch -D` if a local deletion is refused.

---

### Task 2: Verify Brand, Frontend Cleanup, and NIV Containment Are Already in Main

**Files:**
- Verify only: `frontend/package.json`
- Verify only: `frontend/package-lock.json`
- Verify only: `frontend/craco.config.js`
- Verify only: `frontend/public/index.html`
- Verify only: `frontend/.env.example`
- Verify only: `frontend/src/emergent-removal.test.js`
- Verify only: `frontend/src/pages/marketing/HomePage.jsx`
- Verify only: `frontend/src/pages/marketing/AboutPage.jsx`
- Verify only: `frontend/src/pages/marketing/CapabilitiesPage.jsx`
- Verify only: `frontend/src/pages/marketing/ProjectsPage.jsx`
- Verify only: `frontend/src/pages/marketing/ContactPage.jsx`
- Verify only: `frontend/src/components/brand/`
- Verify only: `frontend/src/components/layout/Layout.jsx`
- Verify only: `frontend/src/components/layout/Footer.jsx`
- Verify only: `frontend/src/index.css`
- Verify only: `frontend/tailwind.config.js`
- Verify only: `backend/tests/backend_test.py`
- Verify only: `backend/tests/test_auth_security.py`
- Verify only: `backend/tests/test_repository_credential_hygiene.py`

**Interfaces:**
- Proves the desired public brand tree and frontend Emergent removal need no new patch.
- Proves current `main` credential containment remains authoritative.

- [ ] **Step 1: Prove the approved brand core is byte-identical**

```powershell
$brandPaths = @(
  'frontend/src/pages/marketing/HomePage.jsx',
  'frontend/src/pages/marketing/AboutPage.jsx',
  'frontend/src/pages/marketing/CapabilitiesPage.jsx',
  'frontend/src/pages/marketing/ProjectsPage.jsx',
  'frontend/src/pages/marketing/ContactPage.jsx',
  'frontend/src/components/brand',
  'frontend/src/components/layout/Layout.jsx',
  'frontend/src/components/layout/Footer.jsx',
  'frontend/src/index.css',
  'frontend/tailwind.config.js'
)
git diff --exit-code origin/main origin/redesign/brand-alignment -- @brandPaths
```

Expected: exit code `0` and no diff.

- [ ] **Step 2: Prove frontend runtime/tooling removal is already contained**

```powershell
$frontendRemovalPaths = @(
  'frontend/package.json',
  'frontend/package-lock.json',
  'frontend/craco.config.js',
  'frontend/public/index.html',
  'frontend/.env.example'
)
git diff --exit-code origin/main origin/redesign/brand-alignment -- @frontendRemovalPaths
rg -n "from './home'|from `"./home`"|emergentLink" frontend/src/constants/testIds
if ($LASTEXITCODE -eq 0) { throw 'Stale Emergent-only home test ID remains' }
if ($LASTEXITCODE -ne 1) { throw 'test-ID scan failed' }
```

Expected: no diff in runtime/tooling files and the scan finds no stale home test-ID export.

- [ ] **Step 3: Run the existing frontend and credential containment gates**

```powershell
Push-Location frontend
$env:CI='true'
npm.cmd test -- --watchAll=false --runTestsByPath src/emergent-removal.test.js
Pop-Location

Push-Location backend
.\.venv\Scripts\python.exe -m pytest tests\test_repository_credential_hygiene.py tests\test_auth_security.py -q -n 0 -p no:cacheprovider
Pop-Location
```

Expected: both commands exit `0`. Keep the `main` versions of credential and authentication tests; do not copy the older redesign variants.

---

### Task 3: Add Failing Tests for the Storage Environment Boundary

**Files:**
- Modify: `backend/tests/test_storage.py`
- Modify: `backend/tests/test_storage_routes.py`

**Interfaces:**
- Requires `StorageUnavailableError` and `StorageConfigurationError` subclasses of `StorageError`.
- Requires `init_storage()` to return `None` when disabled.
- Requires local mode only for `development`, `demo`, and `test`.
- Requires safe rejection of colon paths, trailing-dot/space components, and unsafe MIME metadata.

- [ ] **Step 1: Make all existing local-storage tests configure the adapter explicitly**

In `backend/tests/test_storage.py`, add a `local_storage_env` fixture that sets `APP_ENV=test` and `STORAGE_BACKEND=local`. Make `local_root` depend on it, and make the direct root-initialization error test request it.

In `backend/tests/test_storage_routes.py`, add a helper or fixture that sets `APP_ENV=test`, `STORAGE_BACKEND=local`, and the temporary `LOCAL_STORAGE_ROOT`. Use it in every test that writes or reads a local object. Do not change the current header-only download assertions.

- [ ] **Step 2: Add storage-selection and input-hardening tests**

Add these cases to `backend/tests/test_storage.py`:

- the two new typed errors inherit from `StorageError`;
- disabled mode makes `init_storage()` return `None` and makes reads/writes raise `StorageUnavailableError`;
- `STORAGE_BACKEND=local` with `APP_ENV=production` raises `StorageConfigurationError`;
- an unknown backend raises `StorageConfigurationError`;
- paths containing `file:stream`, or a component ending in a space or dot, raise `InvalidStoragePathError`;
- blank, over-255-character, CR-containing, or LF-containing MIME values are stored as `application/octet-stream`.

- [ ] **Step 3: Run the new unit tests and confirm the expected failure**

```powershell
Push-Location backend
.\.venv\Scripts\python.exe -m pytest tests\test_storage.py -q -n 0 -p no:cacheprovider
Pop-Location
```

Expected: FAIL because `StorageUnavailableError`, `StorageConfigurationError`, adapter selection, and the new hardening rules do not yet exist. If it fails for import or environment reasons instead, repair the test setup before continuing.

---

### Task 4: Implement the Provider-Neutral Disabled/Local Storage Port

**Files:**
- Modify: `backend/storage.py`
- Modify: `backend/tests/test_storage.py`
- Modify: `backend/tests/test_storage_routes.py`

**Interfaces:**
- `StorageUnavailableError(StorageError)` for intentionally disabled storage.
- `StorageConfigurationError(StorageError)` for unsupported or unsafe configuration.
- `init_storage() -> pathlib.Path | None`.
- `put_object(path: str, data: bytes, content_type: str) -> dict`.
- `get_object(path: str) -> tuple[bytes, str]`.

- [ ] **Step 1: Implement explicit adapter selection**

In `backend/storage.py`:

- add `LOCAL_ENVIRONMENTS = frozenset({'development', 'demo', 'test'})`;
- normalize `STORAGE_BACKEND`, defaulting an empty/missing value to `disabled`;
- normalize `APP_ENV`, defaulting an empty/missing value to `production`;
- return `None` from `init_storage()` in disabled mode;
- accept `local` only in the three allowed environments;
- reject unknown backends and production-local configuration with `StorageConfigurationError`;
- probe the configured local root during initialization and translate filesystem failures to `StorageConfigurationError`.

- [ ] **Step 2: Harden logical paths and MIME metadata**

Reject absolute, drive-qualified, null-byte, empty, `.`, `..`, colon-containing, trailing-space, and trailing-dot path components. Keep relative logical paths and the existing root-containment check.

Add a MIME sanitizer that falls back to `application/octet-stream` for blank, overlong, CR, or LF values. Use the sanitized value in the metadata sidecar, return value, and read path.

Preserve existing duplicate-write protection, atomic object/metadata writes, cleanup after partial failure, extension fallback, and logical path return values.

- [ ] **Step 3: Run focused storage and existing route tests**

```powershell
Push-Location backend
.\.venv\Scripts\python.exe -m pytest tests\test_storage.py tests\test_storage_routes.py -q -n 0 -p no:cacheprovider
Pop-Location
```

Expected: exit code `0`; existing authorized download and upload behavior remains green with explicit local test configuration.

- [ ] **Step 4: Commit the storage port**

```powershell
git add -- backend/storage.py backend/tests/test_storage.py backend/tests/test_storage_routes.py
git diff --cached --check
git commit -m "refactor: enforce backend storage boundary"
```

Expected: one focused commit containing no server, frontend, or unrelated foundation changes.

---

### Task 5: Map Disabled Storage at the API Boundary and Update Active Guidance

**Files:**
- Modify: `backend/server.py`
- Modify: `backend/.env.example`
- Modify: `backend/tests/test_storage_routes.py`
- Create: `backend/tests/test_emergent_backend_hygiene.py`
- Modify: `doc/PRODUCTION_DEPLOYMENT.md`
- Verify only: `backend/requirements.txt`
- Verify only: `.gitignore`
- Verify only: `doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md`

**Interfaces:**
- Disabled upload/download returns `503` with `File storage unavailable`.
- Invalid paths remain `400`, missing objects remain `404`, and unexpected local I/O remains controlled `500`.
- Startup remains available with disabled storage and fails for invalid local configuration.
- Current header-only token flow and permission checks remain unchanged.

- [ ] **Step 1: Add failing disabled-route tests**

In `backend/tests/test_storage_routes.py`, add one upload-helper test and one authenticated download test under `APP_ENV=production` and `STORAGE_BACKEND=disabled`. Both must expect status `503` and detail `File storage unavailable`. Retain the existing tests for `400`, `404`, `500`, owner/staff access, cross-user denial, safe response MIME, and rejection of query-string auth.

Run:

```powershell
Push-Location backend
.\.venv\Scripts\python.exe -m pytest tests\test_storage_routes.py -q -n 0 -p no:cacheprovider
Pop-Location
```

Expected: the new disabled cases FAIL as `500` because `server.py` still catches the new error through the broad `StorageError` handler.

- [ ] **Step 2: Add precise `503` translation without replacing main server code**

In `backend/server.py`, add `except storage.StorageUnavailableError` before the broad `StorageError` handler in both `store_upload()` and `download_file()`. Map it to status `503` and detail `File storage unavailable`.

Leave these current-main behaviors untouched:

- `Authorization: Bearer` is the only file token source;
- RBAC uses `has_permission(user, 'files.read')` plus customer path scoping;
- response content type comes from `safe_file_content_type(path)` with `nosniff` and restrictive CSP;
- startup still calls `storage.init_storage()` so invalid local configuration fails closed.

- [ ] **Step 3: Add active backend hygiene coverage**

Create `backend/tests/test_emergent_backend_hygiene.py` using `unittest`. Scan only active backend/configuration files (`backend/storage.py`, `backend/server.py`, `backend/requirements.txt`, `backend/.env.example`) for the legacy integration endpoint, key name, and package name. Scan `doc/PRODUCTION_DEPLOYMENT.md` and `doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md` for active Emergent guidance.

The assertions may contain the banned strings; the active files being scanned must not.

- [ ] **Step 4: Update safe defaults and deployment guidance semantically**

In `backend/.env.example`, document:

```env
# File storage defaults to disabled. Local mode is development/demo/test only.
APP_ENV=development
STORAGE_BACKEND=local
LOCAL_STORAGE_ROOT=.local-storage
```

In `doc/PRODUCTION_DEPLOYMENT.md`:

- state that the safe production default is `STORAGE_BACKEND=disabled`;
- state that local mode is accepted only in `development`, `demo`, or `test`;
- require production to remain disabled until private persistent storage and every ADR-002 gate is approved;
- keep the current authenticated blob/header-only download guidance exactly; do not copy the older redesign paragraph that describes query-token risk as current behavior.

Verify `backend/requirements.txt` contains no legacy integration package, `.gitignore` already ignores `backend/.local-storage/`, and the brand implementation plan has no active Emergent note. Do not change those three files if verification passes.

- [ ] **Step 5: Run the focused backend safety suite**

```powershell
Push-Location backend
.\.venv\Scripts\python.exe -m pytest tests\test_storage.py tests\test_storage_routes.py tests\test_auth_security.py tests\test_repository_credential_hygiene.py tests\test_emergent_backend_hygiene.py -q -n 0 -p no:cacheprovider
Pop-Location
```

Expected: exit code `0`; all storage, route, auth, credential, and active-integration checks pass.

- [ ] **Step 6: Commit API/configuration cleanup**

```powershell
git add -- backend/server.py backend/.env.example backend/tests/test_storage_routes.py backend/tests/test_emergent_backend_hygiene.py doc/PRODUCTION_DEPLOYMENT.md
git diff --cached --check
git commit -m "refactor: fail closed when file storage is unavailable"
```

Expected: one focused commit. `backend/requirements.txt`, `.gitignore`, the brand plan, and all frontend files remain unstaged and unchanged.

---

### Task 6: Audit the Reconciled Tree and Exclude Divergent Work Explicitly

**Files:**
- Verify all tracked differences against `origin/main`.

**Interfaces:**
- Allows only the design/plan and backend storage slice.
- Proves no redesign ancestry or main-only feature removal entered the branch.

- [ ] **Step 1: Reject every unexpected changed path**

```powershell
$allowed = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
@(
  'backend/.env.example',
  'backend/server.py',
  'backend/storage.py',
  'backend/tests/test_emergent_backend_hygiene.py',
  'backend/tests/test_storage.py',
  'backend/tests/test_storage_routes.py',
  'doc/PRODUCTION_DEPLOYMENT.md',
  'docs/superpowers/specs/2026-07-21-redesign-main-reconciliation-design.md',
  'docs/superpowers/plans/2026-07-21-redesign-main-reconciliation.md'
) | ForEach-Object { [void]$allowed.Add($_) }
$changed = @(git diff --name-only origin/main...HEAD)
$unexpected = @($changed | Where-Object { -not $allowed.Contains($_) })
if ($unexpected.Count -ne 0) { throw "Unexpected reconciliation paths:`n$($unexpected -join "`n")" }
$changed
```

Expected: every path is in the allowlist and no frontend, migration, identity, catalog, inventory, transaction, or credential-containment file appears.

- [ ] **Step 2: Prove frontend and divergent ancestry are absent**

```powershell
git diff --exit-code origin/main...HEAD -- frontend
git merge-base --is-ancestor origin/redesign/brand-alignment HEAD
if ($LASTEXITCODE -eq 0) { throw 'Divergent redesign ancestry was imported' }
if ($LASTEXITCODE -ne 1) { throw 'Unable to evaluate redesign ancestry' }
git merge-base --is-ancestor origin/main HEAD
if ($LASTEXITCODE -ne 0) { throw 'Reconciliation branch is not based on origin/main' }
```

Expected: frontend is unchanged, redesign is not an ancestor, and current planning-baseline main is an ancestor.

- [ ] **Step 3: Classify the intentionally excluded source differences**

Inspect:

```powershell
git diff --name-status origin/main..origin/redesign/brand-alignment
git log --oneline origin/main..HEAD
```

The handoff/PR must state that main-only foundation modules, current operational UI/API changes, stronger NIV containment, header-only downloads, historical audit documents, and unfinished transaction branches were intentionally retained or excluded. Do not port `doc/WEBSITE_AUDIT_BASELINE_2026-07-19.md`, `docs/superpowers/plans/2026-07-19-niv-001-credential-containment.md`, or the old backend cleanup plan/spec; the current reconciliation design and plan supersede them for this PR.

---

### Task 7: Run the Full Verification Matrix

**Files:**
- Verify all intended reconciliation files.

**Interfaces:**
- Produces local evidence for backend, frontend, build, security, ancestry, and synthetic merge safety.

- [ ] **Step 1: Run repository and backend gates**

```powershell
git diff --check origin/main...HEAD
Push-Location backend
.\.venv\Scripts\python.exe -m pytest -q -p no:cacheprovider
Pop-Location
```

Expected: no whitespace errors; pytest exits `0`. Report environment-driven skips separately from passes and never convert failures into skips.

- [ ] **Step 2: Run full frontend tests and optimized build**

```powershell
Push-Location frontend
$env:CI='true'
npm.cmd test -- --watchAll=false
$env:REACT_APP_PUBLIC_SITE_URL='http://localhost:3000'
$env:REACT_APP_BACKEND_URL='http://127.0.0.1:8001'
$env:GENERATE_SOURCEMAP='false'
npm.cmd run build
Pop-Location
```

Expected: all frontend suites pass and the optimized build completes without an Emergent module/runtime warning.

- [ ] **Step 3: Run an explicit active-integration scan**

```powershell
$activePaths = @(
  'backend/storage.py',
  'backend/server.py',
  'backend/requirements.txt',
  'backend/.env.example',
  'frontend/public/index.html',
  'frontend/craco.config.js',
  'frontend/package.json',
  'frontend/package-lock.json',
  'frontend/.env.example',
  'frontend/src/constants/testIds',
  'doc/PRODUCTION_DEPLOYMENT.md',
  'doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md'
)
rg -n -i 'emergent|EMERGENT_LLM_KEY|ENABLE_EMERGENT|emergentintegrations|@emergentbase/visual-edits' @activePaths
if ($LASTEXITCODE -eq 0) { throw 'Active Emergent reference remains' }
if ($LASTEXITCODE -ne 1) { throw 'Active integration scan failed' }
'No active Emergent references'
```

Expected: `No active Emergent references`.

- [ ] **Step 4: Re-fetch and prove a conflict-free exact synthetic merge**

```powershell
git fetch origin
if ((git rev-parse origin/main).Trim() -ne '74b2d7c689db7c033a405b329b5844977795c767') { throw 'origin/main moved; stop before push' }
$mergeOutput = @(git merge-tree --write-tree origin/main HEAD 2>&1)
if ($LASTEXITCODE -ne 0) { throw "Synthetic merge failed`n$($mergeOutput -join "`n")" }
$headTree = (git rev-parse 'HEAD^{tree}').Trim()
if ($mergeOutput[0].Trim() -ne $headTree) { throw 'Synthetic merge does not reproduce the reconciliation tree' }
git status --short --branch
```

Expected: synthetic merge exits `0`, its tree equals `HEAD`, and the working tree is clean.

---

### Task 8: Push the Reconciliation Branch and Open the PR

**Files:**
- No additional tracked changes.

**Interfaces:**
- Publishes only `reconcile/redesign-to-main`.
- Opens a PR to `main`; does not merge it.

- [ ] **Step 1: Push the review branch without force**

```powershell
git status --porcelain=v1
if ($LASTEXITCODE -ne 0) { throw 'Unable to inspect worktree' }
if ((git status --porcelain=v1).Count -ne 0) { throw 'Working tree is not clean' }
git push -u origin reconcile/redesign-to-main
```

Expected: a normal non-force push creates or advances only `reconcile/redesign-to-main`.

- [ ] **Step 2: Open the PR with the fixed reconciliation scope**

```powershell
$body = @'
## Summary
- preserve latest main ancestry, security containment, and foundation modules
- verify the approved brand/frontend cleanup is already contained
- add the missing disabled/local provider-neutral backend storage boundary
- keep production uploads disabled until ADR-002 readiness is approved

## Verification
- configured backend pytest suite passed
- complete frontend test suite passed
- optimized frontend build passed
- credential and active Emergent hygiene gates passed
- synthetic merge into current main is conflict-free

## Branch cleanup
- Phase A removed exactly 12 audited no-op branches with one leased atomic deletion
- Phase B remains deferred until this PR is merged, a fresh clone passes, and the user confirms again
'@
gh pr create --base main --head reconcile/redesign-to-main --title "Reconcile approved cleanup into main" --body $body
```

Expected: GitHub returns the new PR URL. Do not merge the PR automatically.

- [ ] **Step 3: Record GitHub mergeability/check status for the handoff**

```powershell
gh pr view reconcile/redesign-to-main --json url,state,mergeable,mergeStateStatus,statusCheckRollup
```

Expected: the PR is open and mergeable. If GitHub checks exist, report each result; if none are configured, state that local gates passed but no remote status checks were present.

---

## Deferred Phase B Gate

Do not execute Phase B in this plan run. After the user reports that the reconciliation PR is merged:

1. Fetch or create a new fresh clone from GitHub.
2. Re-run credential hygiene, active Emergent scans, full backend tests, frontend tests, and the production build against the merged `main`.
3. Verify the four source tips remain unchanged.
4. Ask for a new explicit confirmation before atomically deleting only:
   - `chore/remove-frontend-emergent`
   - `fix/niv-001-credential-containment`
   - `refactor/remove-backend-emergent`
   - `redesign/brand-alignment`

Keep `integration/foundation-transaction-capability`, `feat/tx-core`, `fix/niv-001-contact-regression-gate`, `docs/foundation-spec-source-normalization`, `dimsguy`, `fazguy`, and `feature/foundation-identity-rbac-audit` for separate decisions.

## Package Exit Criteria

- Phase A removed exactly twelve unchanged no-op remote branches atomically and left `main` unchanged.
- The reconciliation branch contains no redesign ancestry and no unexpected path.
- Public brand and frontend Emergent removal remain byte-identical to the approved state already in `main`.
- Backend storage defaults to disabled, rejects production-local configuration, and maps disabled file operations to controlled `503` responses.
- Header-only file authentication, RBAC, all main-only foundation modules, and NIV containment remain intact.
- Backend tests, frontend tests, optimized build, credential hygiene, active-integration scan, and synthetic merge all pass.
- Only a PR is opened; `main` is not directly mutated and Phase B remains deferred.
