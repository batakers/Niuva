# NIV-001 Git History Rewrite Runbook

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` only after the human owner explicitly approves the exact execution window and commands. This document is a plan, not authorization. Never autonomously rotate credentials, authenticate with the old credential, rewrite history, force-push, delete a branch or tag, change `main`, or modify another worktree.

**Goal:** Remove the audited administrator credential from reachable Git history while preserving approved repository content, preventing recontamination, and collecting redacted evidence required to close `AUD-DEC-01`.

**Architecture:** Perform all destructive work in two new, isolated copies on an approved encrypted volume: one immutable recovery mirror and one disposable rewrite mirror. Freeze repository writes, inventory every ref, run a redacted full-history scan, replace only the audited value in `backend/tests/backend_test.py` and `memory/PRD.md`, remove `test_reports/iteration_1.json` from every reachable ref, verify the rewritten graph, then publish all mutable refs atomically with explicit leases. Treat GitHub pull-request refs, cached views, forks, old clones, and existing worktrees as separate contamination surfaces.

**Tech Stack:** Git 2.53 or newer, GitHub CLI, `git-filter-repo` 2.47 or newer, Gitleaks, PowerShell 7, GitHub Support.

## Global Constraints

- Current status remains `Implemented, verification pending`; this runbook does not authorize `Verified`.
- Treat the old credential as active or risky until a redacted revocation/rotation record is approved.
- Never print, log, commit, upload, or place either credential value in documentation, a PR, an issue, a command argument, or an evidence artifact.
- Never place the audited value in a replacement-rule file, helper script, shell-history file, transcript, debug trace, crash dump, or retained session artifact. It may exist only in volatile memory inside the approved isolated process.
- Never authenticate with the old credential.
- Do not run this procedure in `C:\Portfolio\Niuva\Niuva` or any existing Niuva worktree.
- Do not use `git filter-repo --force`; its fresh-clone safety check must remain active.
- Do not use an unleased force-push as the default publication method.
- Do not delete branches, tags, worktrees, clones, or backups without a separate explicit approval.
- Do not alter `main`, branch protection, rulesets, repository visibility, collaborators, or remote settings before the approved maintenance window.
- Stop on any unexpected ref, changed remote SHA, unresolved secret-scan finding, failed test, failed backup verification, or mismatch between pre- and post-rewrite ref names.
- A historical dependency failure that is reproduced by the pre-rewrite baseline is classified separately as `environment_blocked_preexisting`; a new failure or changed failure signature after rewrite remains a stop condition.
- All evidence must be redacted and must contain counts, paths, commit identifiers, timestamps, owners, approvals, and result states only.

---

## 1. Current State and Known Impact Snapshot

Snapshot date: 20 July 2026, 15:40 WIB (Asia/Jakarta).

- Repository: `batakers/Niuva`.
- Visibility: public.
- Default branch: `main`.
- Commit that introduced the audited value: `a75dc92b46e6d0f6f1820a4d1123c17bffdcca84`.
- Current `main`: `8a804288662cc4bc58f21b7f29c1f821a158a57f`.
- Current containment merge: `abec0befa04e6f1ec12fb71b968a6672b7674b8b` (PR `#10`).
- Current open pull requests: 0.
- Current merged pull requests: 11; PRs `#1` through `#11` may have rewritten commit references or broken historical diff views.
- Current fork count: 0. Recheck immediately before execution because the repository is public.
- Current repository rulesets: 0.
- Current protection query for `main` and `redesign/brand-alignment`: no protection returned. Recheck every affected branch before execution.
- `git-filter-repo` 2.47.0 is provisioned only in the approved rehearsal tool directory; it is not installed globally.
- Gitleaks 8.30.1 is provisioned only in the approved rehearsal tool directory; it is not installed globally.

### 1.1 Affected remote branches

All 22 remote heads advertised by `origin` currently contain the introducing commit:

1. `backup-main`
2. `design/catalog-material-inventory-foundation`
3. `dimsguy`
4. `dirguy`
5. `docs/foundation-spec-alignment`
6. `docs/foundation-spec-review-findings`
7. `docs/foundation-spec-source-normalization`
8. `docs/niv-001-history-rewrite-runbook`
9. `docs/niv-001-rehearsal-scope-v2`
10. `docs/platform-governance-baseline`
11. `fazguy`
12. `feat/tx-core`
13. `feat/tx-readiness-guard`
14. `feat/tx-test-topology`
15. `feature/foundation-identity-rbac-audit`
16. `fix/niv-001-contact-regression-gate`
17. `fix/niv-001-credential-containment`
18. `fix/niv-001-main-containment`
19. `integration/foundation-transaction-capability`
20. `main`
21. `plan/foundation-transaction-capability`
22. `redesign/brand-alignment`

### 1.2 Affected tags

No remote tag is currently advertised. This is a snapshot, not an exemption: tags must be inventoried again after the write freeze.

### 1.3 Affected local branches

The following 19 local branches currently contain the introducing commit:

- `design/catalog-material-inventory-foundation`
- `docs/foundation-spec-alignment`
- `docs/foundation-spec-review-findings`
- `docs/foundation-spec-source-normalization`
- `docs/niv-001-history-rewrite-runbook`
- `docs/niv-001-rehearsal-scope-v2`
- `docs/platform-governance-baseline`
- `fazguy`
- `feat/tx-core`
- `feat/tx-readiness-guard`
- `feat/tx-test-topology`
- `feature/foundation-identity-rbac-audit`
- `fix/niv-001-contact-regression-gate`
- `fix/niv-001-credential-containment`
- `fix/niv-001-main-containment`
- `integration/foundation-transaction-capability`
- `main`
- `plan/foundation-transaction-capability`
- `redesign/brand-alignment`

Remote-only heads currently include `backup-main`, `dimsguy`, and `dirguy`.

### 1.4 Existing checkout and worktree impact

All 15 currently registered checkouts/worktrees point to affected history:

| Checkout/worktree | Branch |
|---|---|
| Root checkout | `redesign/brand-alignment` |
| `.worktrees/catalog-material-inventory-foundation-design` | `design/catalog-material-inventory-foundation` |
| `.worktrees/niv-001-contact-test-fix` | `fix/niv-001-contact-regression-gate` |
| `.worktrees/niv-001-main-containment` | `fix/niv-001-main-containment` |
| `.worktrees/niv-001-rehearsal-scope-v2` | `docs/niv-001-rehearsal-scope-v2` |
| `.worktrees/niv-001-runbook` | `docs/niv-001-history-rewrite-runbook` |
| `.worktrees/normalize-foundation-spec-source` | `docs/foundation-spec-source-normalization` |
| `.worktrees/plan-foundation-transaction-capability` | `plan/foundation-transaction-capability` |
| `.worktrees/publish-foundation-specs` | `docs/foundation-spec-alignment` |
| `.worktrees/publish-platform-governance` | `docs/platform-governance-baseline` |
| `.worktrees/review-foundation-spec-source` | `docs/foundation-spec-review-findings` |
| `.worktrees/tx-core` | `feat/tx-core` |
| `.worktrees/tx-integration` | `integration/foundation-transaction-capability` |
| `.worktrees/tx-readiness-guard` | `feat/tx-readiness-guard` |
| `.worktrees/tx-test-topology` | `feat/tx-test-topology` |

Do not update, rebase, reset, remove, or reuse these worktrees during the rewrite. Their owners must inventory uncommitted work, quarantine the old checkout after publication, and recreate needed worktrees from a fresh clone.

Execution preflight found pre-existing uncommitted content in two worktrees: untracked `.superpowers/` content in the root checkout and a tracked modification to `docs/superpowers/plans/2026-07-14-foundation-identity-rbac-organization-audit.md` in `.worktrees/catalog-material-inventory-foundation-design`. Preserve both in place, exclude them from all mirror inputs, and do not modify, stage, commit, stash, reset, clean, or copy them during the rehearsal.

---

## 2. Roles, Approvals, and Stop Conditions

### 2.1 Required roles

| Role | Responsibility |
|---|---|
| Incident owner | Owns NIV-001, freeze window, evidence package, and final status proposal |
| Credential owner | Revokes or rotates the old credential and provisions the non-production test account |
| GitHub repository administrator | Approves temporary repository-setting changes and the exact force-push |
| Rewrite operator | Runs commands only in the isolated rewrite mirror |
| Independent verifier | Reviews backup, scan, ref map, tests, and remote state without operating the rewrite |
| Application owner | Runs controlled authentication with the new non-production account |
| Final approver | Closes `AUD-DEC-01` and approves the proposed NIV-001 status change |

One person may hold more than one role, but the rewrite operator and independent verifier should be different people when possible.

### 2.2 Required approvals before any rewrite

- [ ] Redacted proof confirms the old credential is revoked or rotated.
- [ ] A non-production admin account exists and its secret-manager/config reference is recorded without its value.
- [ ] Incident owner approves the maintenance-window start and end time.
- [ ] Repository administrator approves the exact affected ref list.
- [ ] Every active worktree/branch owner acknowledges the write freeze and records uncommitted-work disposition.
- [ ] Open PR count is confirmed as zero, or every open PR is merged/closed by an approved owner.
- [ ] Fork inventory and contact plan are approved.
- [ ] Recovery mirror and bundle verification are independently approved.
- [ ] `git-filter-repo` and Gitleaks versions/checksums are approved.
- [ ] Explicit human approval authorizes the rehearsal rewrite only.

### 2.3 Additional approval before publication

- [ ] Rehearsal scan reports zero audited-literal hits.
- [ ] Gitleaks output is reviewed and all findings are resolved or separately accepted.
- [ ] Ref-name parity, rewritten tree, tests, first-changed-commit data, PR impact count, and LFS impact are reviewed.
- [ ] A fresh remote-ref inventory exactly matches the frozen inventory.
- [ ] Explicit human approval authorizes the atomic force-push for the recorded ref set and SHA leases.

### 2.4 Immediate abort conditions

Abort without pushing if any of these occurs:

- the old credential has not been revoked/rotated;
- a collaborator pushes after the freeze snapshot;
- a new branch, tag, PR, or fork appears;
- pre-rewrite exact scan finds a path other than the three approved paths;
- the rewrite removes or renames an unexpected ref;
- current branch-tip trees change beyond the intended credential/report removal;
- any required matrix check fails, except a separately evidenced and approved `environment_blocked_preexisting` dependency condition;
- backup bundle verification or `git fsck` fails;
- the remote SHA for any ref differs from its explicit force-with-lease value;
- publication cannot be atomic;
- any non-PR ref remains contaminated after publication.

---

## 3. Tool and Environment Preparation

Run only on a dedicated operator machine or isolated VM with an approved encrypted volume. Do not install tools globally during the incident window.

### 3.1 Validate tools

```powershell
$ToolRoot = [System.IO.Path]::GetFullPath('C:\tmp\niuva-niv001-tools')
$GitFilterRepoScript = Join-Path $ToolRoot 'git-filter-repo-2.47.0\git_filter_repo.py'
$GitleaksCommand = Join-Path $ToolRoot 'gitleaks-8.30.1\gitleaks.exe'

git --version
gh --version
gh auth status
python -B $GitFilterRepoScript --version
& $GitleaksCommand version
Get-FileHash -LiteralPath $GitFilterRepoScript -Algorithm SHA256
Get-FileHash -LiteralPath $GitleaksCommand -Algorithm SHA256
```

Expected:

- Git and GitHub CLI exit `0`.
- `git-filter-repo` is version `2.47` or newer and its package/source checksum is recorded.
- Gitleaks is a pinned approved release and its binary checksum is recorded.
- GitHub authentication belongs to the explicitly approved repository administrator.

The current operator environment meets the tool prerequisites through `C:\tmp\niuva-niv001-tools`; neither tool is added to global `PATH`. Revalidate the pinned paths and checksums immediately before rehearsal.

### 3.2 Initialize an isolated session root

Before running this block, open a dedicated PowerShell 7 process with `-NoLogo -NoProfile`. Do not use an IDE terminal, session recorder, transcript collector, or remote shell that retains input/output. The incident owner must confirm that PowerShell transcription, terminal recording, process dumps for `pwsh`, `git`, and Python, VM snapshots, and third-party command capture are disabled for the audited-memory window. If an organizational policy enforces recording, do not weaken that policy ad hoc; stop and move the procedure to an approved isolated host.

```powershell
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$DebugPreference = 'SilentlyContinue'
$VerbosePreference = 'SilentlyContinue'
$InformationPreference = 'SilentlyContinue'
Set-PSDebug -Off

try {
    Stop-Transcript | Out-Null
} catch {
    # No active transcript is the expected state.
}

if (Get-Module -Name PSReadLine) {
    Set-PSReadLineOption -HistorySaveStyle SaveNothing
}
Clear-History

$RepositoryUrl = 'https://github.com/batakers/Niuva.git'
$RepositorySlug = 'batakers/Niuva'
$IncidentId = 'NIV-001'
$IntroducingCommit = 'a75dc92b46e6d0f6f1820a4d1123c17bffdcca84'
$SessionId = Get-Date -Format 'yyyyMMdd-HHmmss'
$ToolRoot = [System.IO.Path]::GetFullPath('C:\tmp\niuva-niv001-tools')
$GitFilterRepoScript = Join-Path $ToolRoot 'git-filter-repo-2.47.0\git_filter_repo.py'
$GitleaksCommand = Join-Path $ToolRoot 'gitleaks-8.30.1\gitleaks.exe'

$SecureRootInput = Read-Host 'Enter an absolute directory on the approved encrypted volume'
$SecureRoot = [System.IO.Path]::GetFullPath($SecureRootInput)
if (-not [System.IO.Path]::IsPathRooted($SecureRoot)) {
    throw 'The approved secure root must be an absolute path.'
}

$SessionRoot = Join-Path $SecureRoot "$IncidentId-$SessionId"
$BackupMirror = Join-Path $SessionRoot 'backup-mirror.git'
$RewriteMirror = Join-Path $SessionRoot 'rewrite-mirror.git'
$EvidenceRoot = Join-Path $SessionRoot 'redacted-evidence'
$BackupBundle = Join-Path $SessionRoot 'backup-before-rewrite.bundle'

New-Item -ItemType Directory -Path $SessionRoot, $EvidenceRoot | Out-Null
```

Before continuing, the operator and verifier must confirm that `$SessionRoot` is not inside an existing clone or worktree and inherits approved encryption and access controls.

No command in the audited-memory window may use `Start-Transcript`, `Tee-Object`, `Write-Debug`, `Set-PSDebug -Trace`, shell redirection of process output, or a debugger. PowerShell garbage collection is only best-effort for immutable strings; terminating this dedicated process after the exact post-rewrite scan is the required memory boundary.

---

## 4. Freeze and Authoritative Inventory

### 4.1 Start the write freeze

The incident owner announces:

- exact freeze start/end time in Asia/Jakarta;
- no pushes, merges, branch/tag creation, releases, automated dependency updates, or worktree publication;
- old clones must not run `git pull` or `git push` after publication;
- emergency changes require incident-owner approval and restart the inventory/rewrite rehearsal.

Pause scheduled bots and deployments that can push Git refs. Do not change repository settings until the repository administrator approves the recorded action.

### 4.2 Record remote, PR, fork, and repository metadata

```powershell
git ls-remote --heads --tags $RepositoryUrl |
    Set-Content -LiteralPath (Join-Path $EvidenceRoot 'remote-refs-before.tsv') -Encoding utf8NoBOM

gh repo view $RepositorySlug --json nameWithOwner,isPrivate,forkCount,defaultBranchRef |
    Set-Content -LiteralPath (Join-Path $EvidenceRoot 'repository-metadata-before.json') -Encoding utf8NoBOM

gh pr list --repo $RepositorySlug --state open --limit 1000 `
    --json number,state,headRefName,baseRefName,isDraft,url |
    Set-Content -LiteralPath (Join-Path $EvidenceRoot 'open-prs-before.json') -Encoding utf8NoBOM

gh pr list --repo $RepositorySlug --state all --limit 1000 `
    --json number,state,mergedAt,headRefName,baseRefName,url |
    Set-Content -LiteralPath (Join-Path $EvidenceRoot 'all-pr-metadata-before.json') -Encoding utf8NoBOM

gh api "repos/$RepositorySlug/forks" --paginate |
    Set-Content -LiteralPath (Join-Path $EvidenceRoot 'forks-before.json') -Encoding utf8NoBOM

gh api "repos/$RepositorySlug/rulesets" --paginate |
    Set-Content -LiteralPath (Join-Path $EvidenceRoot 'rulesets-before.json') -Encoding utf8NoBOM
```

Do not export PR bodies, comments, logs, environment values, or secret-manager values.

### 4.3 Reconfirm affected refs in the fresh rewrite mirror

This check is repeated after the rewrite mirror is created in section 6:

```powershell
$AffectedRefsPath = Join-Path $EvidenceRoot 'affected-refs-before.txt'
git -C $RewriteMirror for-each-ref --contains $IntroducingCommit `
    --format='%(refname)' refs/heads refs/remotes refs/tags |
    Sort-Object |
    Set-Content -LiteralPath $AffectedRefsPath -Encoding utf8NoBOM
```

Expected snapshot: 22 remote heads and zero tags. Any difference requires a new review of this runbook before rewriting.

---

## 5. Recovery Backup

The recovery backup intentionally contains the old history. It is a restricted incident artifact, never a normal developer clone, and must not be pushed except under the rollback rules in section 13.

### 5.1 Create the immutable recovery mirror

```powershell
git clone --mirror $RepositoryUrl $BackupMirror
git -C $BackupMirror fsck --full
git -C $BackupMirror bundle create $BackupBundle --all
git bundle verify $BackupBundle
Get-FileHash -LiteralPath $BackupBundle -Algorithm SHA256 |
    ConvertTo-Json |
    Set-Content -LiteralPath (Join-Path $EvidenceRoot 'backup-bundle-sha256.json') -Encoding utf8NoBOM
```

If Git LFS is used, run and record this before creating the bundle/archive:

```powershell
git -C $BackupMirror lfs fetch --all
git -C $BackupMirror lfs fsck
```

If Git LFS is not installed or not used, record that result rather than silently skipping the check.

### 5.2 Verify recoverability

- [ ] `git fsck --full` exits `0`.
- [ ] `git bundle verify` exits `0`.
- [ ] SHA-256 is independently recomputed by the verifier.
- [ ] The mirror and bundle are encrypted and access-restricted.
- [ ] Retention owner, expiry, and final destruction method are recorded.
- [ ] The backup is physically/logically separated from the rewrite mirror.
- [ ] No evidence file contains a credential value.

Do not proceed if the backup is incomplete or its recovery ownership is unclear.

---

## 6. Fresh Rewrite Mirror and Pre-Rewrite Scans

### 6.1 Create a separate fresh mirror

```powershell
git clone --mirror $RepositoryUrl $RewriteMirror
git -C $RewriteMirror fsck --full
```

Never copy the existing Niuva checkout or `.git` directory into this mirror.

### 6.2 Define a redacted exact-history scan

The script derives the audited value in memory from the immutable introducing commit, sends it to `git grep` through standard input, and writes only counts and unique paths. It never prints matching lines or the value. This begins the audited-memory window; the same dedicated PowerShell process must remain recording-free until the exact post-rewrite scan completes and the process is terminated.

```powershell
function Get-Niv001AuditedValue {
    param(
        [Parameter(Mandatory)] [string] $RepositoryPath,
        [Parameter(Mandatory)] [string] $SourceCommit
    )

    $source = git -C $RepositoryPath show "${SourceCommit}:backend/tests/backend_test.py" | Out-String
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to read the immutable pre-remediation source.'
    }

    $sourceLine = $source -split "`r?`n" |
        Where-Object { $_ -match '^ADMIN_PASSWORD\s*=' } |
        Select-Object -First 1
    $match = [regex]::Match(
        $sourceLine,
        'ADMIN_PASSWORD\s*=\s*["''](?<value>[^"'']+)["'']'
    )
    if (-not $match.Success) {
        throw 'Unable to derive the audited value for a redacted scan.'
    }

    return $match.Groups['value'].Value
}

function Invoke-Niv001ExactHistoryScan {
    param(
        [Parameter(Mandatory)] [string] $RepositoryPath,
        [Parameter(Mandatory)] [string] $AuditValue,
        [Parameter(Mandatory)] [string] $OutputPath
    )

    $commits = @(git -C $RepositoryPath rev-list --all)
    if ($LASTEXITCODE -ne 0) {
        throw 'Unable to enumerate repository history.'
    }

    $hitCommitCount = 0
    $hitPaths = [System.Collections.Generic.HashSet[string]]::new(
        [System.StringComparer]::Ordinal
    )

    foreach ($commit in $commits) {
        $paths = @(
            $AuditValue |
                git -C $RepositoryPath grep -l -F -f - $commit -- . 2>$null
        )
        $grepExit = $LASTEXITCODE
        if ($grepExit -notin 0, 1) {
            throw "Redacted git grep failed for commit $commit with exit $grepExit."
        }
        if ($paths.Count -gt 0) {
            $hitCommitCount += 1
            $commitPrefix = "${commit}:"
            foreach ($pathResult in $paths) {
                if (-not $pathResult.StartsWith(
                    $commitPrefix,
                    [System.StringComparison]::Ordinal
                )) {
                    throw "Unexpected redacted git grep result format for commit $commit."
                }
                $normalizedPath = $pathResult.Substring($commitPrefix.Length)
                [void] $hitPaths.Add($normalizedPath)
            }
        }
    }

    [pscustomobject]@{
        scanned_commit_count = $commits.Count
        hit_commit_count = $hitCommitCount
        unique_hit_path_count = $hitPaths.Count
        unique_hit_paths = @($hitPaths | Sort-Object)
    } |
        ConvertTo-Json -Depth 3 |
        Set-Content -LiteralPath $OutputPath -Encoding utf8NoBOM
}
```

Run the pre-rewrite scan without displaying `$AuditValue`:

```powershell
$AuditValue = Get-Niv001AuditedValue `
    -RepositoryPath $RewriteMirror `
    -SourceCommit $IntroducingCommit

Invoke-Niv001ExactHistoryScan `
    -RepositoryPath $RewriteMirror `
    -AuditValue $AuditValue `
    -OutputPath (Join-Path $EvidenceRoot 'exact-history-scan-before.json')
```

Expected unique paths:

- `backend/tests/backend_test.py`
- `memory/PRD.md`
- `test_reports/iteration_1.json`

If any other path is reported, stop and revise the filter scope. Do not print the matching content.

### 6.3 Run a generic full-history scanner

```powershell
$GitleaksBefore = Join-Path $EvidenceRoot 'gitleaks-before-redacted.json'
& $GitleaksCommand git `
    --redact=100 `
    --no-banner `
    --report-format json `
    --report-path $GitleaksBefore `
    --log-opts='--all' `
    $RewriteMirror
$GitleaksBeforeExit = $LASTEXITCODE
"gitleaks_before_exit=$GitleaksBeforeExit" |
    Set-Content -LiteralPath (Join-Path $EvidenceRoot 'gitleaks-before-status.txt') -Encoding utf8NoBOM
```

The exact scan is authoritative for the audited literal. Gitleaks provides broader coverage. Review all Gitleaks findings without copying secret fields into the incident report.

---

## 7. Rewrite Rehearsal with `git-filter-repo`

### 7.1 Define a value-free, path-scoped callback

The generated report is removed from every reachable ref by the path filter. The file callback processes only `backend/tests/backend_test.py` and `memory/PRD.md`, and replaces only exact bytes equal to the audited value. It does not match assignment names, email literals, other password values, or any other path. The replacement marker remains inside the existing quoted literal in the historical Python file, so that rewritten file remains syntactically valid. The callback source contains no credential.

```powershell
$FileInfoCallback = @'
import os

target_paths = {
    b"backend/tests/backend_test.py",
    b"memory/PRD.md",
}
if filename not in target_paths:
    return (filename, mode, blob_id)

blob_cache_key = (b"niv001-rewritten-blob", blob_id)
if blob_cache_key in value.data:
    return (filename, mode, value.data[blob_cache_key])

audit_key = b"niv001-audited-value"
if audit_key not in value.data:
    audit_text = os.environ.pop("NIUVA_NIV001_AUDITED_VALUE", "")
    if not audit_text:
        raise RuntimeError("The audited in-memory value is unavailable.")
    value.data[audit_key] = audit_text.encode("utf-8")

audit_value = value.data[audit_key]
contents = value.get_contents_by_identifier(blob_id)
if audit_value not in contents:
    value.data[blob_cache_key] = blob_id
    return (filename, mode, blob_id)

rewritten_contents = contents.replace(
    audit_value,
    b"__REMOVED_NIV_001__",
)
rewritten_blob_id = value.insert_file_with_contents(rewritten_contents)
value.data[blob_cache_key] = rewritten_blob_id
return (filename, mode, rewritten_blob_id)
'@

$CallbackHash = [System.Convert]::ToHexString(
    [System.Security.Cryptography.SHA256]::HashData(
        [System.Text.Encoding]::UTF8.GetBytes($FileInfoCallback)
    )
).ToLowerInvariant()

[pscustomobject]@{
    callback_sha256 = $CallbackHash
    included_paths = @(
        'backend/tests/backend_test.py',
        'memory/PRD.md'
    )
    removed_path = 'test_reports/iteration_1.json'
    replacement_kind = 'exact_audited_value_only'
} |
    ConvertTo-Json |
    Set-Content -LiteralPath (Join-Path $EvidenceRoot 'filter-scope.json') -Encoding utf8NoBOM
```

Do not write `$FileInfoCallback` or `$AuditValue` to a rule file or helper script. The callback hash and scope record are safe to retain because neither includes the audited value.

### 7.2 Run the rehearsal rewrite

This is destructive only to the disposable rewrite mirror. It still requires explicit rehearsal approval.

```powershell
$env:NIUVA_NIV001_AUDITED_VALUE = $AuditValue
try {
    Push-Location $RewriteMirror
    try {
        python -B $GitFilterRepoScript `
            --sensitive-data-removal `
            --invert-paths `
            --path test_reports/iteration_1.json `
            --file-info-callback $FileInfoCallback
        if ($LASTEXITCODE -ne 0) {
            throw 'git-filter-repo failed.'
        }
    } finally {
        Pop-Location
    }
} finally {
    Remove-Item Env:\NIUVA_NIV001_AUDITED_VALUE -ErrorAction SilentlyContinue
}
```

The audited value reaches `git-filter-repo` only through the child process environment inherited from the isolated PowerShell process. It is never part of the process command line. The callback immediately removes its child-process environment copy, and the outer `finally` removes the parent-process copy. The value remains in `$AuditValue` only until the exact post-rewrite scan in section 8.1.

Do not add `--force`. If the fresh-clone check fails, discard the rewrite mirror after approval and create another fresh mirror.

### 7.3 Preserve filter-repo metadata as redacted evidence

```powershell
$FilterRepoMetadata = git -C $RewriteMirror rev-parse `
    --path-format=absolute `
    --git-path filter-repo
Copy-Item -LiteralPath $FilterRepoMetadata `
    -Destination (Join-Path $EvidenceRoot 'filter-repo-metadata') `
    -Recurse
```

Review these files in particular:

- `changed-refs`
- `first-changed-commits`
- `ref-map`
- `commit-map`
- `orphaned_lfs_objects`, if present

These files contain commit/ref metadata, not credential values. Review before sharing them outside the restricted incident team. Do not retain a process-environment dump, callback trace, or debugger capture.

---

## 8. Rewritten-History Verification

### 8.1 Exact post-rewrite scan

Reuse `$AuditValue` only in memory:

```powershell
Invoke-Niv001ExactHistoryScan `
    -RepositoryPath $RewriteMirror `
    -AuditValue $AuditValue `
    -OutputPath (Join-Path $EvidenceRoot 'exact-history-scan-after.json')

$ExactAfter = Get-Content -LiteralPath (Join-Path $EvidenceRoot 'exact-history-scan-after.json') -Raw |
    ConvertFrom-Json
if (
    $ExactAfter.hit_commit_count -ne 0 -or
    $ExactAfter.unique_hit_path_count -ne 0
) {
    throw 'The audited value remains in reachable rewritten history.'
}

$AuditValue = $null
Remove-Variable AuditValue -ErrorAction SilentlyContinue
[System.GC]::Collect()
[System.GC]::WaitForPendingFinalizers()
Clear-History
if (Test-Path Env:\NIUVA_NIV001_AUDITED_VALUE) {
    throw 'The transient audited-value process environment was not cleared.'
}
exit
```

Expected:

- `hit_commit_count = 0`
- `unique_hit_path_count = 0`
- `unique_hit_paths = []`

The `exit` is mandatory. Garbage collection is not accepted as secure erasure; process termination closes the audited-memory window. Reopen a new recording-free PowerShell process for the remaining value-free checks and restore only safe path variables:

```powershell
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$RepositoryUrl = 'https://github.com/batakers/Niuva.git'
$RepositorySlug = 'batakers/Niuva'
$ToolRoot = [System.IO.Path]::GetFullPath('C:\tmp\niuva-niv001-tools')
$GitleaksCommand = Join-Path $ToolRoot 'gitleaks-8.30.1\gitleaks.exe'

$SessionRootInput = Read-Host 'Re-enter the approved isolated session root'
$SessionRoot = [System.IO.Path]::GetFullPath($SessionRootInput)
$BackupMirror = Join-Path $SessionRoot 'backup-mirror.git'
$RewriteMirror = Join-Path $SessionRoot 'rewrite-mirror.git'
$EvidenceRoot = Join-Path $SessionRoot 'redacted-evidence'
$BackupBundle = Join-Path $SessionRoot 'backup-before-rewrite.bundle'
```

### 8.2 Generic post-rewrite scan

```powershell
$GitleaksAfter = Join-Path $EvidenceRoot 'gitleaks-after-redacted.json'
& $GitleaksCommand git `
    --redact=100 `
    --no-banner `
    --report-format json `
    --report-path $GitleaksAfter `
    --log-opts='--all' `
    $RewriteMirror
if ($LASTEXITCODE -ne 0) {
    throw 'Post-rewrite Gitleaks scan requires review before publication.'
}
```

### 8.3 Structural integrity and ref parity

```powershell
git -C $RewriteMirror fsck --full

$BeforeRefs = Get-Content -LiteralPath (Join-Path $EvidenceRoot 'remote-refs-before.tsv') |
    ForEach-Object {
        $parts = $_ -split "`t", 2
        if ($parts.Count -eq 2) { $parts[1] }
    } |
    Where-Object { $_ -match '^refs/(heads|tags)/' } |
    Sort-Object

$AfterRefs = git -C $RewriteMirror for-each-ref `
    --format='%(refname)' refs/heads refs/tags |
    Sort-Object

$RefDiff = Compare-Object -ReferenceObject $BeforeRefs -DifferenceObject $AfterRefs
if ($RefDiff) {
    $RefDiff |
        ConvertTo-Json |
        Set-Content -LiteralPath (Join-Path $EvidenceRoot 'unexpected-ref-diff.json') -Encoding utf8NoBOM
    throw 'Branch/tag ref names changed unexpectedly.'
}
```

### 8.4 Tree-diff verification for every branch and tag

For every frozen branch and tag, require identical tree entries outside the three approved paths. The report path must be absent. Either replacement target may have a different blob ID, but its mode, object type, and path must be unchanged. This catches unrelated path, content, or mode changes without printing file contents.

```powershell
$ApprovedPaths = @(
    'backend/tests/backend_test.py',
    'memory/PRD.md',
    'test_reports/iteration_1.json'
)
$TreeResults = @()
$BeforeRefRows = Get-Content -LiteralPath (Join-Path $EvidenceRoot 'remote-refs-before.tsv')

foreach ($row in $BeforeRefRows) {
    $parts = $row -split "`t", 2
    if ($parts.Count -ne 2 -or $parts[1] -notmatch '^refs/(heads|tags)/') {
        continue
    }

    $oldSha = $parts[0]
    $refName = $parts[1]
    $newSha = git -C $RewriteMirror rev-parse $refName
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to resolve rewritten ref: $refName"
    }

    $OldManifest = @(
        git -C $BackupMirror ls-tree -r --full-tree $oldSha |
            Where-Object {
                $entryPath = ($_ -split "`t", 2)[-1]
                $entryPath -notin $ApprovedPaths
            }
    )
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to read original tree: $refName"
    }

    $NewManifest = @(
        git -C $RewriteMirror ls-tree -r --full-tree $newSha |
            Where-Object {
                $entryPath = ($_ -split "`t", 2)[-1]
                $entryPath -notin $ApprovedPaths
            }
    )
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to read rewritten tree: $refName"
    }

    if (Compare-Object -ReferenceObject $OldManifest -DifferenceObject $NewManifest) {
        throw "Unexpected tree change outside the approved paths: $refName"
    }

    $ReplacementPaths = @(
        'backend/tests/backend_test.py',
        'memory/PRD.md'
    )
    foreach ($targetPath in $ReplacementPaths) {
        $OldTarget = @(git -C $BackupMirror ls-tree $oldSha -- $targetPath)
        $NewTarget = @(git -C $RewriteMirror ls-tree $newSha -- $targetPath)
        if ($OldTarget.Count -ne $NewTarget.Count) {
            throw "Target path presence changed unexpectedly: $refName / $targetPath"
        }
        if ($OldTarget.Count -eq 1) {
            $OldTargetShape = $OldTarget[0] -replace ' [0-9a-f]+\t', "`t"
            $NewTargetShape = $NewTarget[0] -replace ' [0-9a-f]+\t', "`t"
            if ($OldTargetShape -ne $NewTargetShape) {
                throw "Target path mode/type changed unexpectedly: $refName / $targetPath"
            }
        }
    }

    git -C $RewriteMirror cat-file -e "${newSha}:test_reports/iteration_1.json" 2>$null
    if ($LASTEXITCODE -eq 0) {
        throw "Removed report path still exists: $refName"
    }

    $TreeResults += [pscustomobject]@{
        ref = $refName
        old_sha = $oldSha
        new_sha = $newSha.Trim()
        unaffected_tree_entries_equal = $true
        target_shape_equal = $true
        generated_report_absent = $true
    }
}

$TreeResults |
    ConvertTo-Json -Depth 3 |
    Set-Content -LiteralPath (Join-Path $EvidenceRoot 'tree-diff-results.json') -Encoding utf8NoBOM

$ExpectedTreeResultCount = @(
    $BeforeRefRows |
        Where-Object { ($_ -split "`t", 2)[1] -match '^refs/(heads|tags)/' }
).Count
if ($TreeResults.Count -ne $ExpectedTreeResultCount) {
    throw 'Tree-diff result count does not match the frozen branch/tag count.'
}
```

The verifier must compare the number of `tree-diff-results.json` rows to the frozen branch-plus-tag count. A row count mismatch is a stop condition.

### 8.5 Explicit branch test matrix

Create a normal disposable clone from the rewritten mirror, never from the live remote, and do not reuse an existing Niuva worktree. Before running the matrix, remove `REACT_APP_BACKEND_URL`, `NIUVA_TEST_ADMIN_EMAIL`, and `NIUVA_TEST_ADMIN_PASSWORD` from the verification environment so these checks cannot perform controlled authentication.

The matrix for the current 22-head snapshot is explicit:

| Tier | Branches | Required verification |
|---|---|---|
| Full regression | `main`; `redesign/brand-alignment`; active implementation branches `feat/tx-core`, `feat/tx-readiness-guard`, `feat/tx-test-topology`, `integration/foundation-transaction-capability`, `fix/niv-001-contact-regression-gate`, and `fix/niv-001-main-containment` | Credential-hygiene unittest when present; compile all backend Python; complete backend pytest suite with authentication integration tests skipped because no endpoint/credential is configured; frontend production build |
| Historical/documentation | `backup-main`; `design/catalog-material-inventory-foundation`; `dimsguy`; `dirguy`; `docs/foundation-spec-alignment`; `docs/foundation-spec-review-findings`; `docs/foundation-spec-source-normalization`; `docs/niv-001-history-rewrite-runbook`; `docs/niv-001-rehearsal-scope-v2`; `docs/platform-governance-baseline`; `fazguy`; `feature/foundation-identity-rbac-audit`; `fix/niv-001-credential-containment`; `plan/foundation-transaction-capability` | Redacted credential hygiene from sections 8.1-8.2; compile `backend/tests/backend_test.py` when present; credential-hygiene unittest when present; backend compile smoke |
| All branches and tags | Every frozen ref, including any tag discovered at execution time | Ref-name parity and tree-diff verification from sections 8.3-8.4 |

If the active implementation set changes before the freeze, stop, update this table explicitly, and obtain approval for the revised matrix. Do not infer branch tiers from a wildcard during execution.

```powershell
$FullRegressionBranches = @(
    'main',
    'redesign/brand-alignment',
    'feat/tx-core',
    'feat/tx-readiness-guard',
    'feat/tx-test-topology',
    'integration/foundation-transaction-capability',
    'fix/niv-001-contact-regression-gate',
    'fix/niv-001-main-containment'
)
$TargetedBranches = @(
    'backup-main',
    'design/catalog-material-inventory-foundation',
    'dimsguy',
    'dirguy',
    'docs/foundation-spec-alignment',
    'docs/foundation-spec-review-findings',
    'docs/foundation-spec-source-normalization',
    'docs/niv-001-history-rewrite-runbook',
    'docs/niv-001-rehearsal-scope-v2',
    'docs/platform-governance-baseline',
    'fazguy',
    'feature/foundation-identity-rbac-audit',
    'fix/niv-001-credential-containment',
    'plan/foundation-transaction-capability'
)

$ActualBranches = @(
    git -C $RewriteMirror for-each-ref --format='%(refname:strip=2)' refs/heads |
        Sort-Object
)
$MatrixBranches = @($FullRegressionBranches + $TargetedBranches | Sort-Object)
if (Compare-Object -ReferenceObject $MatrixBranches -DifferenceObject $ActualBranches) {
    throw 'The explicit test matrix does not match the rewritten branch inventory.'
}

$VerificationClone = Join-Path $SessionRoot 'verification-clone'
git clone --no-local --branch redesign/brand-alignment $RewriteMirror $VerificationClone
git -C $VerificationClone fetch origin '+refs/heads/*:refs/remotes/origin/*'

Remove-Item Env:\REACT_APP_BACKEND_URL -ErrorAction SilentlyContinue
Remove-Item Env:\NIUVA_TEST_ADMIN_EMAIL -ErrorAction SilentlyContinue
Remove-Item Env:\NIUVA_TEST_ADMIN_PASSWORD -ErrorAction SilentlyContinue

$BranchResults = @()
foreach ($branch in $ActualBranches) {
    git -C $VerificationClone switch --detach "origin/$branch"
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to check out rewritten branch tip: $branch"
    }

    $tier = if ($branch -in $FullRegressionBranches) { 'full_regression' } else { 'targeted' }
    $HygieneExit = $null
    $TargetCompileExit = $null
    $BackendCompileExit = $null
    $BackendTestExit = $null
    $FrontendBuildExit = $null

    Push-Location $VerificationClone
    try {
        if (Test-Path -LiteralPath 'backend/tests/test_repository_credential_hygiene.py') {
            python -B -m unittest backend.tests.test_repository_credential_hygiene -v
            $HygieneExit = $LASTEXITCODE
        }

        if (Test-Path -LiteralPath 'backend/tests/backend_test.py') {
            python -B -m py_compile backend/tests/backend_test.py
            $TargetCompileExit = $LASTEXITCODE
        }

        python -B -m compileall -q backend
        $BackendCompileExit = $LASTEXITCODE

        if ($tier -eq 'full_regression') {
            python -B -m pytest backend/tests -v -p no:cacheprovider
            $BackendTestExit = $LASTEXITCODE

            yarn --cwd frontend build
            $FrontendBuildExit = $LASTEXITCODE
        }
    } finally {
        Pop-Location
    }

    $BranchResults += [pscustomobject]@{
        branch = $branch
        tier = $tier
        hygiene_exit = $HygieneExit
        target_compile_exit = $TargetCompileExit
        backend_compile_exit = $BackendCompileExit
        backend_test_exit = $BackendTestExit
        frontend_build_exit = $FrontendBuildExit
        classification = 'pending_verifier_review'
    }
}

$BranchResults |
    ConvertTo-Json -Depth 3 |
    Set-Content -LiteralPath (Join-Path $EvidenceRoot 'rewritten-branch-test-results.json') -Encoding utf8NoBOM
```

Install dependencies only inside an approved disposable environment using each branch's checked-in manifests and lockfiles. Record tool versions, exit codes, and sanitized summaries; never record credentials, authorization headers, tokens, response bodies, package-registry tokens, or secret-manager output.

A failure may be labeled `environment_blocked_preexisting` only when all of these are evidenced:

1. The applicable dependency manifest and lockfile are byte-identical in the section 8.4 tree comparison.
2. The failure occurs during dependency resolution, import, collection, or tool bootstrap before any changed target behavior executes.
3. A manifest-only dependency preflight using the corresponding pre-rewrite ref reproduces the same sanitized missing/unavailable dependency category without checking out or executing credential-bearing source.
4. The independent verifier records the package/tool name, failure category, old/new manifest object IDs, and approval without retaining raw logs that may contain sensitive values.

A passed preflight followed by a new test, compile, or build failure is rewrite-related until proven otherwise and blocks publication. A historical dependency classification is not a test pass; it is an explicit exception requiring verifier and incident-owner approval.

### 8.6 Pull-request and LFS impact

```powershell
$ChangedRefsPath = git -C $RewriteMirror rev-parse `
    --path-format=absolute `
    --git-path filter-repo/changed-refs
$AffectedPullRefs = @(
    Select-String -LiteralPath $ChangedRefsPath -Pattern '^refs/pull/.*/head$' |
        ForEach-Object { $_.Line }
)

[pscustomobject]@{
    affected_pull_ref_count = $AffectedPullRefs.Count
    affected_pull_refs = $AffectedPullRefs
} |
    ConvertTo-Json -Depth 3 |
    Set-Content -LiteralPath (Join-Path $EvidenceRoot 'affected-pull-refs.json') -Encoding utf8NoBOM
```

If `orphaned_lfs_objects` exists, stop until its cleanup and GitHub Support handling are explicitly approved.

---

## 9. Final Publication Gate

Publication is a separate destructive action. A successful rehearsal does not authorize it.

### 9.1 Recheck the live remote immediately before push

```powershell
$RemoteRefsFinalPath = Join-Path $EvidenceRoot 'remote-refs-immediately-before-push.tsv'
git ls-remote --heads --tags $RepositoryUrl |
    Set-Content -LiteralPath $RemoteRefsFinalPath -Encoding utf8NoBOM

$FrozenRefs = Get-Content -LiteralPath (Join-Path $EvidenceRoot 'remote-refs-before.tsv')
$FinalRefs = Get-Content -LiteralPath $RemoteRefsFinalPath
$RemoteDrift = Compare-Object -ReferenceObject $FrozenRefs -DifferenceObject $FinalRefs
if ($RemoteDrift) {
    $RemoteDrift |
        ConvertTo-Json |
        Set-Content -LiteralPath (Join-Path $EvidenceRoot 'remote-drift.json') -Encoding utf8NoBOM
    throw 'Remote refs changed after the freeze. Restart the rehearsal.'
}
```

Recheck open PRs, forks, rulesets, branch protection, Actions, and any bot capable of pushing. Record approval for any temporary settings change; restore it after publication.

### 9.2 Review a dry-run mirror push

`git-filter-repo` normally removes `origin` as a safety measure. Add a separately named publication remote only after publication approval:

```powershell
git -C $RewriteMirror remote add publish-target $RepositoryUrl
git -C $RewriteMirror push --dry-run --force --mirror publish-target |
    Set-Content -LiteralPath (Join-Path $EvidenceRoot 'mirror-push-dry-run.txt') -Encoding utf8NoBOM
```

The verifier must inspect the dry-run. Expected non-updatable refs are GitHub-owned `refs/pull/*`; any other unexpected ref is an abort condition.

### 9.3 Build an atomic, explicitly leased branch/tag push

This procedure publishes only the frozen `refs/heads/*` and `refs/tags/*` set. It uses the pre-freeze remote SHA as a lease for every ref and requests an atomic remote transaction.

```powershell
$FrozenRefRecords = Get-Content -LiteralPath (Join-Path $EvidenceRoot 'remote-refs-before.tsv') |
    ForEach-Object {
        $parts = $_ -split "`t", 2
        if ($parts.Count -eq 2) {
            [pscustomobject]@{ Sha = $parts[0]; Ref = $parts[1] }
        }
    } |
    Where-Object { $_.Ref -match '^refs/(heads|tags)/' }

$PushArguments = @('--atomic')
foreach ($record in $FrozenRefRecords) {
    git -C $RewriteMirror rev-parse --verify "$($record.Ref)^{commit}" 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Rewritten ref is missing or invalid: $($record.Ref)"
    }
    $PushArguments += "--force-with-lease=$($record.Ref):$($record.Sha)"
    $PushArguments += "$($record.Ref):$($record.Ref)"
}

$PushArguments |
    Set-Content -LiteralPath (Join-Path $EvidenceRoot 'approved-push-argument-shape.txt') -Encoding utf8NoBOM
```

The argument-shape evidence contains refs and SHAs only. It must not contain credential values.

### 9.4 Controlled force-push command

Run only after the user explicitly approves this exact publication step:

```powershell
git -C $RewriteMirror push publish-target @PushArguments
if ($LASTEXITCODE -ne 0) {
    throw 'Atomic publication failed. Do not retry until remote state is re-inventoried.'
}
```

Do not replace this with a blind `git push --force --mirror`. GitHub documents the mirror-force command as its general procedure, but explicit leases plus `--atomic` reduce the risk of overwriting work created after the freeze. If GitHub rejects atomic publication, stop; do not fall back without a new written approval.

### 9.5 Verify the published refs

```powershell
$RemoteRefsAfterPath = Join-Path $EvidenceRoot 'remote-refs-after.tsv'
git ls-remote --heads --tags $RepositoryUrl |
    Set-Content -LiteralPath $RemoteRefsAfterPath -Encoding utf8NoBOM

$PublishedRefs = Get-Content -LiteralPath $RemoteRefsAfterPath |
    ForEach-Object {
        $parts = $_ -split "`t", 2
        if ($parts.Count -eq 2) {
            [pscustomobject]@{ Sha = $parts[0]; Ref = $parts[1] }
        }
    }

foreach ($record in $PublishedRefs) {
    $expected = git -C $RewriteMirror rev-parse $record.Ref
    if ($LASTEXITCODE -ne 0 -or $expected -ne $record.Sha) {
        throw "Published ref mismatch: $($record.Ref)"
    }
}
```

Keep the write freeze active until GitHub Support handling, a fresh-clone verification, and collaborator instructions are complete.

---

## 10. GitHub Pull Requests, Cached Views, Forks, and Support

Force-pushing branches and tags is not sufficient to fully expunge a public secret. Old objects may remain reachable through pull-request refs, cached commit pages, forks, and old clones.

After successful publication:

1. Record the affected PR count from `filter-repo/changed-refs`.
2. Record the `first-changed-commits` file.
3. Record whether `orphaned_lfs_objects` exists.
4. Recheck fork count and coordinate cleanup with every fork owner if any fork appears.
5. Open a GitHub Support request for sensitive-data removal.
6. Provide only repository identity, affected PR count, first changed commit IDs, and LFS orphan metadata. Never paste the credential value into the ticket.
7. Ask GitHub Support to dereference affected PR refs, clear cached views, run server-side garbage collection, and handle orphaned LFS objects if applicable.
8. Record the Support ticket reference and final response.

GitHub states that Support may decline server-side purging when credential rotation sufficiently mitigates the risk. If Support declines or any fork/clone cannot be remediated, record the residual risk and obtain a status decision; do not silently claim full expungement.

Closed PR diff views and commit links may stop working after Support removes internal references. Existing review comments anchored to old SHAs may become invalid. PRs `#1` through `#11` are currently merged and must be included in the impact review; the authoritative affected set comes from `changed-refs`.

---

## 11. Fresh Clone and Collaborator Recovery

### 11.1 Mandatory rule

No collaborator may run `git pull` and then push from an old clone. That can merge the contaminated history back into the cleaned graph.

### 11.2 Each collaborator must

1. Stop all processes, IDE Git integrations, bots, and terminals using the old clone.
2. Record branch name, worktree name, clean/dirty status, and unpushed work without copying credential-bearing content into a report.
3. Quarantine the old clone read-only; do not add it as a remote to a new clone.
4. Create a fresh clone in a new directory.
5. Verify the default branch and expected rewritten SHA from the post-push ref manifest.
6. Run the approved Gitleaks full-history scan with redaction.
7. Recreate worktrees from the fresh clone only.
8. Reapply legitimate uncommitted work as reviewed patches or cherry-picked diffs, never by merging an old branch graph.
9. Scan and test every reapplied change before pushing.
10. Sign the redacted fresh-clone acknowledgment.

Example fresh-clone verification:

```powershell
$FreshCloneRootInput = Read-Host 'Enter a new empty directory for the clean clone'
$FreshCloneRoot = [System.IO.Path]::GetFullPath($FreshCloneRootInput)
$FreshCloneScanReport = Join-Path `
    ([System.IO.Path]::GetDirectoryName($FreshCloneRoot)) `
    'gitleaks-fresh-clone-redacted.json'
git clone 'https://github.com/batakers/Niuva.git' $FreshCloneRoot
git -C $FreshCloneRoot remote -v
git -C $FreshCloneRoot status -sb
git -C $FreshCloneRoot fsck --full

& $GitleaksCommand git `
    --redact=100 `
    --no-banner `
    --report-format json `
    --report-path $FreshCloneScanReport `
    --log-opts='--all' `
    $FreshCloneRoot
```

The Gitleaks report is an incident artifact and must not be committed to the repository.

### 11.3 Existing Niuva worktrees

The 15 worktrees listed in section 1.4 remain quarantined after publication. Recreate only the branches still needed, from a fresh clone, after the incident owner approves branch-by-branch recovery. Do not use `git worktree repair`, `reset`, `rebase`, or `pull` to attach old worktrees to the rewritten repository.

---

## 12. Controlled Authentication with the New Test Account

This phase remains blocked until the user supplies redacted proof that the old credential is inactive and a new non-production test account/config reference exists.

Requirements:

- inject `REACT_APP_BACKEND_URL`, `NIUVA_TEST_ADMIN_EMAIL`, and `NIUVA_TEST_ADMIN_PASSWORD` through an approved secret manager or masked CI environment;
- never type credential values into a saved command, script, `.env` file, test report, shell transcript, issue, PR, or repository file;
- use a non-production backend only;
- capture no token, session cookie, authorization header, response body, or credential value;
- record the environment name, owner, approver, secret/config reference, command, timestamp, and sanitized pass/fail result.

Approved test command shape:

```powershell
python -B -m pytest backend/tests/backend_test.py -v -p no:cacheprovider
```

Acceptance:

- the module is not skipped for missing backend URL;
- admin-dependent tests are not skipped for missing credentials;
- controlled admin login succeeds with the newly provisioned test account;
- the returned user role is the expected non-production admin role;
- no credential or token appears in retained output;
- regression and backend test suites remain green.

---

## 13. Rollback and Recovery

### 13.1 Failure before remote publication

- Stop immediately.
- Preserve redacted evidence and tool logs.
- Leave the live remote untouched.
- Quarantine the failed rewrite mirror.
- Review the failure, then create a new fresh rewrite mirror from the recovery source only after approval.

### 13.2 Failure during atomic publication

An atomic push should update all requested refs or none. If it fails:

- do not retry automatically;
- re-run `git ls-remote --heads --tags`;
- compare against both frozen and proposed manifests;
- confirm whether GitHub applied no ref changes;
- investigate protection, lease, permission, or atomic-capability failures;
- require a new publication approval.

### 13.3 Failure after successful publication but before GitHub Support purge

Prefer fix-forward:

1. Keep the freeze active.
2. Diagnose against the rewritten mirror and post-push manifests.
3. Produce a corrected fresh rewrite from the immutable recovery mirror.
4. Repeat scans, tests, independent verification, leases, and approval.

Restoring the old bundle would deliberately reintroduce the credential-bearing history. It is permitted only for catastrophic service recovery with explicit incident-owner, security-owner, and repository-administrator approval. If used, rotation must already be complete, the repository remains frozen, and a new rewrite begins immediately.

### 13.4 Failure after GitHub Support purge

Do not restore the contaminated history. Fix forward from approved sanitized refs. Any missing legitimate change must be reconstructed as a reviewed patch that passes secret scanning.

### 13.5 Backup disposition

Keep the encrypted recovery mirror/bundle only through the approved rollback window. At closure, record one of these decisions:

- verified secure destruction with date, owner, method, and approval; or
- restricted retention with legal/operational owner, encrypted location, access list, expiry, and review date.

Never place the backup in cloud storage, artifact hosting, or a shared drive without explicit incident-owner approval and encryption controls.

### 13.6 Isolated-session cleanup

Session cleanup is a separately approved incident-closing action, not an implicit delete authorization. After publication, Support handling, fresh-clone verification, and rollback-window decisions are complete:

1. Export only the approved redacted evidence package to the incident record.
2. Apply section 13.5 separately to the credential-bearing recovery mirror and bundle.
3. Dispose of the rewrite mirror, verification clone, transient package caches, process temporary directories, terminal scrollback, and any quarantined failed mirror according to the recorded retention policy.
4. Destroy the ephemeral encrypted volume or isolated VM through the approved platform procedure when its retention period ends; do not rely on ordinary file deletion as memory or media sanitization.
5. Confirm that no transcript, shell-history file, debug trace, crash dump, VM snapshot, process-environment capture, or unredacted scanner output was retained.
6. Record cleanup date, owner, approver, artifact classes retained, artifact classes destroyed, retention expiry, and sanitization method without including any credential value.

Do not run a recursive delete from this document. Resolve and approve exact paths at execution time, then use the organization's recoverable or cryptographic-destruction procedure.

---

## 14. Required Redacted Evidence Package

| Evidence | Required content |
|---|---|
| Incident record | `NIV-001`, date/time, timezone, owner, approver, maintenance window |
| Credential action | Revoked/rotated state, timestamp, credential owner, redacted ticket/config reference |
| New test account | Non-production environment, account owner, secret/config reference, provisioned date |
| Repository snapshot | Public/private state, default branch, branch/tag counts, PR count, fork count |
| Affected refs | Full branch/tag names and old SHAs; no content values |
| Worktree inventory | Owner, branch, clean/dirty state, uncommitted-work disposition |
| Backup | Mirror/bundle location class, SHA-256, verification result, retention decision |
| Toolchain | Git, GitHub CLI, `git-filter-repo`, Gitleaks versions and checksums |
| Pre-scan | Scanned commit count, hit commit count, unique paths only |
| Rewrite | Value-free callback SHA-256, exact included/removed path scope, first changed commits, ref map, changed-ref count |
| PR/LFS impact | Affected PR ref count and orphaned-LFS status |
| Post-scan | Exact scan zero-hit result and redacted Gitleaks result/reference |
| Tree/ref verification | Ref-name parity; per-ref unaffected-tree equality; target shape; generated-report absence |
| Test | Explicit branch tier, command shape, environment, timestamp, sanitized result summary, approved historical-dependency classification if any |
| Publication | Explicit approval reference, atomic/lease result, remote before/after manifests |
| GitHub cleanup | Support ticket reference, cached-view/PR-ref/GC outcome, fork outcome |
| Collaborators | Fresh-clone acknowledgments and old-clone quarantine/disposition |
| Recovery | Fix-forward or rollback actions, approvals, final backup and isolated-session disposition |
| Final decision | `AUD-DEC-01` outcome, final approver, audit-document commit and PR |

Evidence logs must be reviewed for credential values, tokens, authorization headers, cookies, response bodies, and secret-manager output before retention or sharing.

---

## 15. Gate for `AUD-DEC-01` and NIV-001 Status

Do not close `AUD-DEC-01` until all applicable conditions are evidenced:

- [ ] old credential revoked or rotated;
- [ ] new non-production admin account provisioned through a secret manager/config reference;
- [ ] controlled authentication succeeds with the new account;
- [ ] the explicit branch matrix is complete: required full-regression branches pass and every targeted branch has approved hygiene/compile/smoke evidence or a separately approved `environment_blocked_preexisting` classification;
- [ ] ref parity and tree-diff checks pass for every frozen branch and tag;
- [ ] exact full-history post-rewrite scan reports zero hits;
- [ ] Gitleaks full-history findings are resolved or formally dispositioned;
- [ ] all affected heads/tags are published at reviewed rewritten SHAs;
- [ ] GitHub Support outcome for PR refs/cached views/server GC is recorded;
- [ ] fork outcome is recorded;
- [ ] every known collaborator clone/worktree is freshly cloned or formally quarantined;
- [ ] backup retention/destruction decision is recorded;
- [ ] date, owner, approver, environment, secret/config reference, commands, results, and evidence references are complete.

Only then modify `doc/WEBSITE_AUDIT_BASELINE_2026-07-19.md` in a separate reviewed change:

1. Change `AUD-DEC-01` from `Open` to `Closed` with the date and approving owner.
2. Add the redacted rotation/config reference.
3. Add controlled-authentication and scan evidence references.
4. Add the history-rewrite, GitHub Support, clone/worktree, fork, and backup outcomes.
5. Propose NIV-001 status `Verified` for final approver review.

If GitHub cached refs, forks, old clones, or backup risk remain outside the approved closure criteria, propose `Accepted risk` with owner and review date instead of silently using `Verified`.

---

## 16. Official References

- [GitHub: Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [GitHub: Backing up a repository](https://docs.github.com/en/repositories/archiving-a-github-repository/backing-up-a-repository)
- [`git-filter-repo` documentation](https://github.com/newren/git-filter-repo/blob/main/Documentation/git-filter-repo.txt)
- [Gitleaks usage documentation](https://github.com/gitleaks/gitleaks)

GitHub's guidance requires revocation/rotation first, warns that old clones can recontaminate rewritten history, notes that open PRs should be merged or closed, and explains that GitHub Support is required to remove PR refs and cached views. `git-filter-repo` 2.47 or newer is required for `--sensitive-data-removal`.

---

## 17. Planning Record

- Prepared: 19 July 2026; execution snapshot revised 20 July 2026.
- Review revision: the credential replacement is path-scoped to the two observed source paths and exact-value-only; the generated report remains a full-history path removal; redacted `git grep` results are normalized to repository-relative paths before scope comparison; the test matrix is explicit by branch tier; audited-memory recording and cleanup controls are mandatory.
- Read-only snapshot revalidated on 20 July 2026 at 15:40 WIB: 22 remote heads, 0 remote tags, 19 affected local branches, 15 affected registered worktrees, 0 open PRs, 11 merged PRs, 0 forks, and 3 collaborators. All remote heads still contain the introducing commit.
- Remote movement since the earlier snapshot: `dirguy` advanced while no write freeze was active; its current remote head remains in the affected set.
- Aborted rehearsal record: on 20 July 2026, the isolated pre-rewrite exact scan examined 84 commits and found 77 hit commits. After normalizing `git grep` output, three unique repository paths were identified; the additional `memory/PRD.md` path triggered the documented scope stop. Gitleaks, `git-filter-repo`, rewrite, and publication were not started; remote-ref drift was zero and the temporary write freeze was lifted.
- Current state: the old local/manual credential environment is decommissioned, controlled non-production authentication and regression passed, preparation PRs `#10` and `#11` were merged with normal merge commits, pinned rehearsal tools are provisioned, and the first rehearsal stopped safely at the scope gate. No history rewrite, force-push, branch/tag deletion, or publication was performed.
- Next authorized action: request explicit human approval for a new isolated rewrite rehearsal only. This inventory revision does not authorize or start that rehearsal.
