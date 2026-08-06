# DR-013 — Toolchain and Release Policy Decision Packet

<!-- markdownlint-disable MD013 -->

**Status:** `OPEN` / `HUMAN_DECISION_BLOCKED`
**Prepared:** 2026-08-06 (Asia/Jakarta; actual preparation date)
**Observed baseline:** `origin/main` at `9f6fe38398836b44158783684d23e6455c3cc6c2`
**Decision owner:** Engineering/release/security owners, as assigned by the Project Owner
**Scope:** Documentation and decision preparation only

## 1. Purpose and boundary

DR-013 asks the owners to define one enforceable contract for reproducible
installation, supported runtimes, dependency and lock management, CI quality
gates, vulnerability and license handling, release artifacts, review
ownership, and versioning.

The repository currently contains useful quality checks, but a passing check is
not itself a complete release policy. This packet separates what is observed
at the selected SHA from what still requires a recorded human decision. It is
not an ADR, does not resolve DR-013, and does not authorize source changes,
dependency changes, deployment, provider activation, migration, or go-live.

The baseline is the fetched `origin/main` observation only. It is not a DR-001
release-candidate selection and does not supersede any pending release-baseline
decision.

This refresh reanchors the existing decision inputs to the current fetched
head. PR #180 added bounded authentication-security source and test paths, but
did not change the frontend release workflow, dependency manifests, or the
toolchain policy fields below. The observations remain evidence, not a
selection or implementation authorization.

## 2. Authority and evidence sources

The canonical read order used for this packet is: Master Spec, Document
Register, Decision Register, applicable decision/ADR, applicable runbook, then
current source and tests.

The packet is bounded by:

- `docs/NIUVA_MASTER_SPEC.md` for canonical product and safety boundaries;
- `docs/context/DOCUMENT_REGISTER.md` for authority classification;
- `docs/decisions/DECISION_REGISTER.md` for approved and open decisions;
- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` for the
  open DR-013 field;
- `docs/implementation/production-readiness/TEAM_ASSIGNMENT.md` for the
  `human_decision_blocked` status of PHASE-06A/06D and PHASE-09B;
- `docs/implementation/production-readiness/VERIFICATION_MATRIX.md` for
  V-06-01, V-07-01, V-09-01, and V-10-01;
- `.github/workflows/quality-gates.yml` for the current CI implementation;
- `backend/requirements.txt`, `frontend/package.json`, and
  `frontend/package-lock.json` for current dependency declarations; and
- `doc/PRODUCTION_DEPLOYMENT.md` for the provider-neutral deployment boundary.

No DR-013-specific approved decision or ADR is currently applicable; DR-013 is
open. Approved provider-neutral constraints remain applicable where relevant,
including ADR-002 and ADR-003, but they do not select a package manager,
runtime, lock strategy, or release policy. The applicable runbook is the
provider-neutral `doc/PRODUCTION_DEPLOYMENT.md`; no provider-specific runbook
is applicable.

## 3. Current observed contract

The following is an observation of the current repository. It is not a
selection for DR-013.

| Area | Observed at `9f6fe38` | Decision or evidence limit |
| --- | --- | --- |
| Frontend install | The quality workflow uses Node `24`, `npm ci`, and `frontend/package-lock.json`. | The workflow behavior does not establish that Node 24 is the supported release runtime or that npm is the only supported local workflow. |
| Backend install | The quality workflow uses Python `3.14.3` and installs `backend/requirements.txt` with pip. | `backend/requirements.txt` contains a mixture of exact and ranged constraints; no backend lockfile was found in the inspected repository inventory. Reproducible backend release installation is therefore still a decision field. |
| Runtime support | The CI observation is Node `24` and Python `3.14.3`. | CI versions are evidence of one runner configuration, not a compatibility/support policy, runtime EOL policy, or production approval. |
| Dependency security | Backend CI runs `pip check` and `pip-audit`. Frontend CI runs `npm run audit:production`; the script uses `npm audit --omit=dev --json` and has a narrow, explicit React Router advisory waiver. | Advisory disposition, waiver owner/expiry, transitive-risk handling, and license policy remain open. The current workflow has no license-check step. |
| Tests | Backend CI runs the complete `backend/tests` suite. Frontend CI runs Jest, a production dependency audit, a build, and hermetic Playwright contracts for Retail discovery on mobile/desktop and Admin session cross-tab on desktop. | Expected skips, test-environment parity, coverage thresholds, report retention, and release-blocking rules are not one recorded policy. |
| Build | Frontend CI runs `npm run build` with an empty `REACT_APP_PUBLIC_SITE_URL`. | A public origin is required for origin-dependent sitemap/robots behavior; a successful build with an empty origin is not public-origin or deployment evidence. |
| Browser proof | Playwright browsers are installed in CI and the listed hermetic contracts run. | This is bounded contract evidence, not broad cross-surface browser, accessibility, external-service, or production-environment evidence. |
| Coverage | The inspected quality workflow does not publish coverage artifacts or enforce a coverage threshold. | A required threshold, measurement scope, artifact retention, and exception process need an owner decision. |
| Bundle/performance | `frontend/scripts/check-bundle-size.js` supports gate mode only when `BUNDLE_TOTAL_GZIP_BUDGET`, `BUNDLE_ENTRY_GZIP_BUDGET`, and `BUNDLE_ASYNC_GZIP_BUDGET` are supplied. The normal `measure:bundle` command is report-only. | No approved numeric budget or release-blocking invocation is recorded in the inspected repository evidence. Performance thresholds and exception ownership remain open. |
| Artifact | The current quality workflow has no inspected `upload-artifact` or release-artifact publication step. No tracked release manifest, `VERSION`, or `CHANGELOG` was found in the inspected inventory. | Immutable artifact contents, provenance, retention, promotion, naming, version source, and rollback identity require a decision and later implementation. |
| Review ownership | No tracked `CODEOWNERS` file was found in the inspected inventory. | Required independent review, protected-path ownership, security/release sign-off, and exception authority remain open. |
| Secret scanning | CI scans complete Git history with Gitleaks `v8.30.1`. | A green scan is repository evidence only; credential revocation/rotation, environment secret evidence, and operational custody remain outside this packet. |
| Deployment boundary | `doc/PRODUCTION_DEPLOYMENT.md` remains provider-neutral and does not select a host, proxy, DNS/TLS topology, or provider. | DR-013 must not be used to infer a provider or authorize deployment. Those decisions remain separate under DR-011/DR-012 and later release gates. |

## 4. Decision fields for DR-013

The owner should complete each field explicitly. The option labels are prompts,
not recommendations.

### 4.1 Supported package manager and install contract

Choose and document the supported clean-install commands, working directories,
cache behavior, offline/air-gapped expectation if applicable, and whether local
development may use a different command from release CI.

- Option A — retain the observed frontend `npm ci` contract and backend pip
  installation, with an explicitly approved backend reproducibility mechanism.
- Option B — select another exact supported package-manager/install contract
  and document its migration and compatibility impact.
- Option C — define separate development, CI, and release contracts with an
  exact reason and enforcement boundary.

### 4.2 Node, Python, and runtime support policy

Record the supported Node and Python versions, patch/update policy, EOL rule,
local/CI/release parity, and who approves an emergency runtime exception. The
currently observed Node `24` and Python `3.14.3` values must not be treated as
approved solely because the workflow uses them.

### 4.3 Lock and dependency update strategy

Record whether the backend receives a lockfile or another approved fully
resolved release input; how frontend and backend updates are reviewed; how
transitive changes are detected; and how lockfile regeneration is validated.
The policy must include rollback to a prior dependency set without silently
changing application source.

### 4.4 Vulnerability, waiver, and license policy

Define severity thresholds, exploitability/context review, waiver format,
owner, expiry, renewal, emergency handling, and the treatment of development
versus production dependencies. Define the license allow/deny policy, notice
generation or retention, review owner, and release-blocking behavior.

The current frontend audit script has one narrow advisory exception and fails
closed for other advisory or graph changes. That is an implementation
observation, not a complete organization-wide vulnerability or license policy.

### 4.5 Test, coverage, browser, and expected-skip policy

Define the release-blocking suites, supported test environments, minimum
coverage scope and thresholds, artifact/report retention, browser matrix,
accessibility checks, external-service checks, and the exact process for an
approved expected skip. Distinguish hermetic contracts from staging or
production proof.

### 4.6 Bundle and performance policy

Define budgets and measurement conditions for total, entry, and asynchronous
gzip output; runtime performance thresholds; representative environment and
network/device assumptions; artifact retention; and exception ownership. State
whether the three existing `BUNDLE_*_GZIP_BUDGET` inputs are required for a
release gate and where approved values live.

### 4.7 Artifact, release, and versioning policy

Define the immutable artifact contents, build inputs, provenance/attestation,
retention, promotion rule, rollback identity, release naming, version source,
tagging, changelog/release-note requirement, and who may publish or promote an
artifact. A build output in a CI workspace is not automatically an immutable
release artifact.

### 4.8 Review, ownership, and exception policy

Define required code owners or equivalent protected-path ownership, independent
security/release review, approval separation, branch protection expectations,
exception authority, and evidence custody. The absence of a tracked
`CODEOWNERS` file is an observation; it is not permission to bypass review.

## 5. Owner decision form

Complete this form in an approved decision record or equivalent register entry.
Blank fields intentionally keep DR-013 open.

| Field | Owner decision |
| --- | --- |
| Decision owner(s) and accountable approver | `____________________________` |
| Decision date and expiry/review date | `____________________________` |
| Supported frontend package manager/install command | `____________________________` |
| Supported backend package manager/install command | `____________________________` |
| Supported Node version/range and update policy | `____________________________` |
| Supported Python version/range and update policy | `____________________________` |
| Frontend lock strategy | `____________________________` |
| Backend lock/resolution strategy | `____________________________` |
| Vulnerability threshold and waiver policy | `____________________________` |
| License policy and review evidence | `____________________________` |
| Required test/browser/accessibility suites | `____________________________` |
| Coverage scope, threshold, retention, and exception policy | `____________________________` |
| Bundle/performance budgets and enforcement command | `____________________________` |
| Immutable artifact, provenance, retention, and rollback identity | `____________________________` |
| Version/tag/changelog source of truth | `____________________________` |
| Required independent review and protected ownership | `____________________________` |
| Exception approver and evidence custodian | `____________________________` |
| Related DR-001/DR-012/DR-014 dependencies acknowledged | `____________________________` |

## 6. Traceability to readiness work

| Gate or phase | Relation to DR-013 | Current consequence |
| --- | --- | --- |
| PHASE-06A / V-06-01 | Requires the supported install/runtime/lock and quality-gate contract before release-quality evidence can be considered reproducible. | `human_decision_blocked`; this packet does not authorize dependency or CI changes. |
| PHASE-06D | Requires approved coverage, bundle/performance, security, artifact, and release-quality thresholds. | `human_decision_blocked`; local tests or green CI cannot close the gate alone. |
| PHASE-07 / V-07-01 | Depends on an immutable candidate artifact and separately assigned staging/topology/rollback evidence. | No deployment, host, DNS/TLS, provider, migration, or staging operation is authorized by DR-013. |
| PHASE-09B / V-09-01 | Needs dependency/security/review policy and evidence custody before final operational controls are rehearsed. | Planning remains held until DR-013 and related operational decisions are recorded. |
| PHASE-10 / V-10-01 | Requires the exact candidate plus complete preceding evidence and explicit release/go-live decisions. | Not eligible; DR-013 is only one prerequisite and cannot establish production readiness. |

Related decisions remain separate: DR-001 must select the release-candidate
baseline; DR-012 must close the required operational ownership/evidence fields;
DR-014 governs observability and performance direction; DR-011 governs any
provider or Finance decisions; and DR-015 is the later production-readiness
and go-live decision.

## 7. Post-decision implementation sequence

After the authorized owners record DR-013 and approve a separately scoped
implementation task:

1. Record the decision, owner, expiry/exception rules, and exact supported
   matrix in the canonical decision register or approved ADR.
2. Prepare the selected lock/resolution and clean-install contract without
   weakening the provider-neutral and secret-safe boundaries.
3. Implement only the approved CI, coverage, browser, vulnerability/license,
   bundle/performance, review, versioning, and artifact controls.
4. Run the complete contract at the selected SHA and retain the declared
   reports/artifacts with their provenance.
5. Obtain the required independent review and reconcile any changed-path or
   dependency risk.
6. Re-evaluate V-06-01, V-07-01, V-09-01, and V-10-01 together with DR-001,
   DR-012, DR-014, and the later release/go-live approvals.

None of these implementation steps is authorized by this documentation packet.

## 8. Handover and current readiness statement

Changed for this packet: the task card and this decision packet only.

Intentionally unchanged: application source, tests, dependency manifests and
lockfiles, workflow/build scripts, environment files, providers, migrations,
deployment targets, credentials, and decision-register status.

Checks for this docs-only change are limited to documentation review, exact
scope verification, whitespace validation, and staged secret-pattern scanning.
No application test, migration, staging, deployment, provider, external smoke,
or production operation is run or implied by this packet.

Current status remains **NOT READY for staging, production deployment, or
go-live**. The repository has useful local/CI quality evidence, but DR-013 is
open, the candidate and operational gates are separate, and no owner decision
in this packet authorizes release execution.

<!-- markdownlint-enable MD013 -->
