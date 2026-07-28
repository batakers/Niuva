# Niuva Layered Production-Readiness Audit Methodology

Status: Context Only — Audit Evidence and Progress Tracker — Not Implementation Authority

Baseline SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
Methodology version: 1.0
Last updated: 2026-07-28 01:53:32 WIB (UTC+07:00)

## 1. Audit objective

The audit evaluates observed implementation readiness by layer while keeping
three states separate:

1. **Audit completion:** how much of the defined audit scope was examined.
2. **Implementation readiness:** the quality and production capability
   supported by current evidence.
3. **Actual go-live readiness:** a separate operational and human decision
   supported by production-like evidence, ownership, approved open decisions,
   and an explicit approval source.

The audit never creates product, provider, infrastructure, policy, Finance,
production-readiness, or go-live decisions.

## 2. Authority order

Read and apply sources in this order:

1. `AGENTS.md`
2. `docs/NIUVA_MASTER_SPEC.md`
3. `docs/context/DOCUMENT_REGISTER.md`
4. `docs/decisions/DECISION_REGISTER.md`
5. The approved decision or ADR applicable to the layer
6. The applicable runbook
7. Current source code, tests, configuration, and migrations as implementation
   evidence
8. Supporting references only when needed

Classify every used document as one of:

- Approved Canonical
- Approved Baseline
- Approved Decision
- Approved with Open Decisions
- Active Guardrail
- Runbook
- Supporting Reference
- Candidate
- Context Only
- Superseded
- Archive Candidate

An implementation plan, audit tracker, comment, test report, historical
document, or current implementation cannot replace canonical authority.

## 3. Audit phases

Each layer follows this sequence:

1. Freeze and record the read-only baseline.
2. Define included and excluded scope.
3. Read applicable authority and identify open decisions.
4. Inventory source, tests, configuration, migration, and operational
   evidence.
5. Execute safe and proportional verification commands.
6. Record positive controls and failures separately.
7. Create findings with reproducible evidence.
8. Score only the examined scope and state confidence.
9. Record human decisions and environment blockers.
10. Complete the Resume handoff and update `AUDIT_PROGRESS.md`.

## 4. Evidence standard

Acceptable evidence includes:

- repository evidence with `path:line`;
- an exact, safe command plus timestamp, exit code, and relevant result;
- deterministic test/build/lint output tied to a SHA and environment;
- a current approved decision or runbook;
- a redacted operational record with owner, date, environment, and provenance;
- production-like verification only when it was explicitly authorized and
  safely executed.

Evidence must be:

- attributable to the recorded baseline;
- recent enough for the conclusion;
- reproducible or clearly marked non-reproducible;
- scoped to the claim;
- redacted of credentials, tokens, secrets, direct contact/payment data, raw
  customer documents, and unnecessary personal data.

File existence, comments, checkboxes, commit subjects, generated reports, and
skipped tests are leads, not proof of working behavior.

## 5. Audit status

- `not_started`: no substantive coverage was examined.
- `in_progress`: some defined scope has evidence, but coverage is incomplete.
- `blocked`: progress cannot continue safely without a named environment,
  access, authority, or human decision.
- `complete`: all applicable checklist items were examined and limitations are
  explicit.
- `requires_revalidation`: a previously examined conclusion may be stale
  because authority, source, tests, dependencies, tooling, baseline, or
  environment changed.

## 6. Audit completion

Audit completion is a coverage measure from 0% to 100%. It is calculated from
the layer checklist after excluding only items proven non-applicable with a
reason.

An item is complete only when:

- applicable authority was reviewed;
- relevant implementation evidence was inspected;
- a safe verification was run or the exact blocker was recorded;
- the result and limitations were captured.

Blocked work remains incomplete unless the audit objective is specifically to
document the blocker and no additional safe examination is possible.

## 7. Readiness scoring rubric

- `0–19`: layer is absent or has critical failures.
- `20–39`: implementation is very early and most controls are absent.
- `40–59`: basic function exists with high production risk.
- `60–74`: adequate for development/staging but release blockers remain.
- `75–89`: near release candidate with important gaps.
- `90–96`: production-capable with small, controlled residual gaps.
- `97–99`: highly mature with all important controls verified.
- `100`: every applicable control is proven, no P0/P1 is open, no critical
  area is unverified, and production-like verification passed.

Rules:

- Use `—` before enough evidence exists.
- Do not average unknown areas as zero or as passing.
- State the score rationale and the controls that cap the score.
- Static code review alone cannot produce a score of 100.
- A score does not override an open decision or authorize implementation or
  go-live.

## 8. Confidence

Confidence is reported from 0% to 100%:

- `0–24%`: little or stale evidence; mostly assumptions.
- `25–49%`: partial static evidence or non-representative execution.
- `50–74%`: broad current evidence with important environment gaps.
- `75–89%`: current static and dynamic evidence across representative paths.
- `90–100%`: reproducible, production-like, cross-checked evidence with known
  limitations controlled.

Confidence measures evidence strength, not implementation quality.

## 9. Finding severity

- `P0`: critical security/data violation, corruption, privilege escalation, or
  absolute release blocker.
- `P1`: high risk to transactions, authentication, integrity, availability, or
  production operations.
- `P2`: medium issue to resolve before or shortly after a release candidate.
- `P3`: quality debt or non-blocking improvement.

Severity is based on impact and exploit/failure conditions, not effort.

## 10. Finding status

- `open`
- `partial`
- `blocked_by_decision`
- `environment_blocked`
- `approved_not_started`
- `decision_resolved_implementation_open`
- `requires_revalidation`
- `resolved`
- `accepted_risk`

`resolved` requires current resolution evidence and regression verification.
`accepted_risk` requires an owner, reason, approval source, and review date.

## 11. Required finding schema

Every finding must contain:

- Finding ID
- Title
- Severity
- Status
- Confidence
- Category
- Expected behavior
- Actual behavior
- Evidence as `path:line`
- Reproduction or verification command
- Impact
- Root cause or probable cause
- Recommendation
- Acceptance criteria
- Dependencies
- Human decision required
- First observed SHA
- Last verified SHA
- Resolution evidence, if resolved

Recommendations are audit advice only. They do not authorize implementation.

## 12. Positive controls

Record working controls separately from findings. A positive control must name
the exact behavior, evidence, verification scope, SHA, and limitation.
Positive controls do not cancel unrelated findings.

## 13. Historical tracker reconciliation

For each old tracker or report:

1. Record its baseline SHA, date, scope, and authority.
2. Confirm the baseline object exists locally.
3. Compare relevant paths from that baseline to the current audit snapshot.
4. Re-read changed authority before interpreting old findings.
5. Re-run proportional verification when source, tests, dependencies, or
   environment changed.
6. Classify the old conclusion as `resolved`, `stale`, `regressed`,
   `requires_revalidation`, or `unverified`.
7. Never copy an old score or status as current without evidence.

## 14. Revalidation triggers

Revalidation is mandatory when any of these changes:

- baseline SHA or branch ancestry;
- canonical authority, decision, ADR, or runbook;
- source files in the finding scope;
- tests, fixtures, CI configuration, lockfiles, or runtime versions;
- dependency resolution;
- deployment topology or external provider behavior;
- production configuration, data shape, ownership, backup, or recovery
  evidence;
- a previously skipped or environment-blocked verification becomes runnable.

## 15. Environment-blocked evidence

An environment blocker must record:

- the missing capability or access;
- the safe command attempted or the reason it was not attempted;
- whether the check could be reproduced in CI, staging, or an isolated local
  topology;
- what evidence would unblock it;
- the exact next step and required owner.

A skipped test is not a passed test.

## 16. Audit safety rules

- Source, tests, configuration, and migrations remain read-only during audit.
- Do not install or upgrade dependencies.
- Do not alter tests to obtain a pass.
- Do not run migrations against real data.
- Do not change environment values, credentials, tokens, keys, or secrets.
- Do not fetch, checkout, reset, pull, merge, rebase, commit, push, or create a
  PR as part of this audit initialization.
- Do not start external writes or production tests without explicit approval.
- Preserve pre-existing tracked and untracked work.

Generated caches and reports must not be treated as authoritative evidence
unless provenance and baseline are verified.

## 17. Layer completion gate

A layer may be marked `complete` only when:

- included/excluded scope is explicit;
- applicable authority and files are listed;
- every checklist item is examined or proven non-applicable;
- commands and limitations are recorded;
- P0/P1 findings have current evidence;
- score and confidence rationale are present;
- unverified assumptions and decisions are explicit;
- acceptance criteria and remediation phases are documented;
- Resume handoff is complete.

## 18. Production-readiness summary gate

Layer 11 may synthesize but must not silently normalize blockers. The summary
must report:

- applicable layer completion and confidence;
- open P0/P1 counts;
- unverified critical areas;
- environment and production-like evidence gaps;
- open decisions and unassigned owners;
- migration, rollback, backup/restore, incident, and handover state;
- implementation readiness separately from go-live readiness.

No production-ready or go-live claim is permitted while critical scope remains
unverified, an applicable P0/P1 is open, or an explicit production decision is
missing.

## 19. Resume handoff requirement

Every layer ends with:

- current audit state;
- completed sections;
- incomplete sections;
- last files inspected;
- last commands executed;
- blockers;
- findings requiring revalidation;
- next exact step;
- baseline SHA;
- Asia/Jakarta timestamp.

This handoff is part of audit completion and must be updated every session.

## 20. Methodology changelog

### 2026-07-28 — Version 1.0

- Initialized layered audit, evidence, scoring, revalidation, and handoff rules.
- Separated audit completion, implementation readiness, and go-live readiness.
- Recorded read-only and no-secret constraints.
