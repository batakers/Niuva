# Task Card — Candidate Reconciliation Layer 06

**Status:** Candidate / Context Only — no publication authorization
**Branch:** `docs/reconcile-layer06-security-auth-privacy`
**Base:** `origin/main` at `dddb2a9dbbaea9660313c79ab5d1fe2c96965e52`
**Worktree:** `C:\tmp\niuva-layer06-reconcile`

## Objective

Reconcile the historical Layer 06 security, authentication, authorization, and
privacy audit with the canonical authority and current source/test evidence so
that the next implementation packets have an accurate dependency and gate
ledger.

## Scope

- Reconcile all historical findings `SEC-001` through `SEC-013`.
- Compare the Layer 06 audit against `NIUVA_MASTER_SPEC`, the Document and
  Decision Registers, applicable DEC-ACCESS/DEC-AUTH decisions, ADR-001,
  ADR-002, ADR-005, and the authentication/storage/identity runbooks.
- Inspect current backend/frontend source and relevant tests without editing
  them.
- Record current SHA, historical-baseline ancestry, executed hermetic checks,
  skipped real-transaction checks, dependency-tool limits, and documentation
  drift.

## Exclusions and safety boundaries

- No source, test, dependency, configuration, secret, migration, database, or
  environment change.
- No credential inspection, rotation, history rewrite, force-push, or NIV-001
  execution.
- No provider, storage adapter, email service, payment service, malware scanner,
  proxy, TLS, or production topology selection.
- No live production request, real database transaction test, deployment,
  go-live, moderated session, canonical register amendment, commit, push, or
  pull request.
- Historical audit files remain intact; this task card and the companion report
  are the only intended worktree additions.

## Applicable authority

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. Applicable DEC-ACCESS-001/002/003 and DEC-AUTH-001 through DEC-AUTH-012
5. ADR-001, ADR-002, and ADR-005
6. `docs/runbooks/AUTH_RECOVERY_RUNBOOK.md`
7. `docs/runbooks/AUTH_SESSION_RUNBOOK.md`
8. `docs/runbooks/IDENTITY_RBAC_AUDIT_RUNBOOK.md`
9. `docs/runbooks/NIV-001_GIT_HISTORY_REWRITE_RUNBOOK.md`
10. Current source and tests in the clean Layer 06 worktree

Readiness and audit directories are context/evidence only and do not override
the canonical documents or authorize implementation.

## Affected files

Intended candidate additions only:

- `docs/implementation/production-readiness/LAYER-06-SECURITY-AUTH-PRIVACY-RECONCILIATION.md`
- `docs/implementation/production-readiness/phases/LAYER-06-security-auth-privacy-reconciliation-task-card.md`

Intentionally unchanged: all source, tests, canonical decisions/registers,
historical audit files, runbooks, migrations, lockfiles, and environment files.

## Acceptance criteria

- The companion report identifies every historical finding exactly once and
  gives severity, current evidence, disposition, owner, remaining evidence,
  and explicit limits.
- The report records the current base SHA and historical-baseline ancestry.
- Canonical authority is linked and conflicts are surfaced rather than
  silently resolved.
- Historical evidence is preserved; no canonical document is rewritten.
- Hermetic checks and unavailable/opt-in checks are reported accurately.
- The gate clearly distinguishes source/test alignment from production
  readiness and does not claim closure or go-live.
- Worktree status has no tracked or staged source changes and only the two
  intended candidate documents are untracked.

## Minimum verification

- `git status --short --branch`, `git rev-parse HEAD`, and
  `git rev-parse origin/main`.
- Confirm the historical baseline is an ancestor of the current base.
- Run the bounded Layer 06 pytest selection with `-n 0` and no cache provider.
- Run the explicit integration selection without enabling its opt-in
  environment variables; verify that it remains skipped. Enabling a real
  database transaction test requires separate authorization and an approved
  isolated target.
- Run read-only frontend package-lock audit; report unavailable backend
  dependency and secret-scan tools without installing them.
- Check the candidate Markdown for trailing whitespace/final newline and run
  markdownlint when the tool is available.
- Verify `git diff --quiet` and `git diff --cached --quiet`; do not stage.

## Authorization boundary

This task card authorizes inspection, analysis, and candidate documentation in
the isolated worktree only. It does **not** authorize staging, commit, push,
pull request, canonical promotion, implementation, migration, deployment, or
go-live.

## Open risks and decisions

- Credential-incident/NIV-001 closure evidence is still absent.
- Internal MFA is canonical but unimplemented.
- Abuse-control cooldown and distributed-limiter semantics need a bounded
  implementation decision and dynamic proof.
- Production storage, malware/quarantine, retention, backup/restore, and
  delivery-provider boundaries remain activation-gated.
- Legacy identity events still need privacy-safe routing.
- Global security headers and proxy/TLS behavior are environment evidence, not
  proven by the current source.
- Dependency advisories and stale runbook wording need separate owner decisions.
