# Niuva AI-Agent Team Workflow

Status: Context Only — Team Working Guide — Not Product, Implementation, or Go-Live Authority

## Purpose and boundary

Use this guide to deliver small, reviewable changes without turning routine
work into a production-readiness ceremony. It does not select product policy,
provider, topology, migration target, production readiness, or go-live.

Canonical authority remains: Master Spec, Document Register, Decision Register,
applicable decision or ADR, runbook, then current source and tests. Read only
the authority needed for the task; do not turn the full reading order into a
blocker for an unrelated, low-risk fix.

## Two work lanes

| Lane | Use it for | Output | It must not do |
| --- | --- | --- | --- |
| Delivery | An authorized bug fix, UI change, test, refactor, or bounded contract change. | Small PR with scoped verification. | Claim that a finding is resolved or that the product is ready. |
| Readiness | Audit findings, migrations, recovery, release evidence, environment, or go-live decisions. | Evidence, decision packet, or separately authorized plan. | Authorize a source change, provider, deployment, or release. |

A Phase or Finding ID links a Delivery task to the Readiness lane when relevant;
it is not a queue that blocks unrelated authorized work. A decision or
environment blocker blocks only work that needs that decision or environment.

## Roles and ownership

Every task has one Driver. Small low-risk tasks may combine Driver and Verifier,
but another person still reviews the PR. Auth, authorization, customer data,
transaction, migration, payment, provider, deployment, and release work need a
separate reviewer and verifier.

| Role | Responsibility |
| --- | --- |
| Driver | Owns scope, branch/worktree, implementation, and handover. |
| Rule reviewer | Checks authority, privacy/data boundaries, and open decisions. |
| Verifier | Checks the diff and evidence; does not mark unproven work complete. |

Default expertise is a starting point, not an ownership wall: Lead integrates
contracts and decisions; Backend owns server/data/security; Frontend owns
client/UI/accessibility. Hand off a shared path explicitly rather than waiting
for an entire phase to finish.

## Start with the smallest useful brief

Use this brief for ordinary Delivery work. Put it in an issue, draft PR, or
team note; do not duplicate a roadmap table.

```text
Title and user outcome:
In scope (paths/behaviour):
Contract or dependency (if any):
Done when:
Verification:
Owner and verifier:
```

Add Finding ID, selected SHA, and freshness only for remediation work. Add an
explicit branch/worktree and commit/push/PR permission only when another person
or agent will act on the task.

Use an extended plan only when work crosses frontend/backend, changes auth,
authorization, data, transaction, migration, dependency, external provider,
or has a non-trivial rollback. The extended plan records authority, files that
must not change, negative cases, rollback, and unresolved decisions. A plan is
not implementation approval.

## Ready test

A task is ready to start when its own scope has:

1. a stated outcome and path/behaviour boundary;
2. applicable authority or explicit authorization;
3. a testable definition of done;
4. an owner and verifier; and
5. no unresolved dependency on a shared path, invariant, or unfinalized
   contract.

Do not require a release candidate, production topology, or unrelated owner
decision for a task that does not consume them. Conversely, never bypass a
required migration, security, or operational gate merely because a task is
small.

## Parallel work

Parallel work is allowed when all of the following are true:

| Check | Meaning |
| --- | --- |
| Paths are disjoint | No concurrent edits to the same file, generated output, lockfile, or shared test helper. |
| Contract is frozen | The producer/consumer schema, error semantics, and ownership are written in a small fixture, type, or interface. |
| Invariants are separate | The work does not change the same auth, transaction, migration, or release invariant. |
| Integration order is known | Each task has a merge order and a post-merge check. |

When a contract is not frozen, parallelize discovery, API fixtures, test design,
or a decision packet—not competing implementations. After a contract is frozen,
backend and frontend may implement in separate branches and verify against the
same fixtures; merging remains ordered.

Use a temporary path lock, not a phase-wide lock. A lock records owner, paths,
contract, start condition, and handover condition. `frontend/src/App.js`, a
migration ledger, an authentication invariant, and a shared API envelope may
need serial ownership; an entire Frontend, Backend, or Phase normally does not.

## Worktree and agent rules

One active Driver edits one task branch/worktree. Never run two editing agents
in the same worktree. Read-only discovery and verification may run in separate
worktrees or clones.

```powershell
git fetch origin
git worktree add ../Niuva-<task> -b <type>/<task> origin/main
```

Preserve unrelated work. Do not switch, reset, stash, clean, force-checkout, or
use broad staging. Stage only the approved paths. A task card that does not
state commit/push/PR permission grants local changes and a report only.

## Working loop

1. Driver writes the brief and checks authority, status, changed paths, and
   shared locks.
2. Reviewer resolves only task-relevant authority or records a decision
   blocker.
3. Driver implements the bounded slice; unrelated discoveries become new
   briefs.
4. Verifier inspects the actual diff and runs proportional checks.
5. Merge in the recorded order. Re-run the contract/integration check when a
   shared boundary changed.
6. Update a readiness tracker only when the task changes tracked evidence,
   selected-SHA scope, or finding status. Batch ordinary Delivery updates at a
   milestone; do not create a Lead bottleneck after every small merge.

## Verification and handover

At minimum, inspect the changed paths and whitespace:

```powershell
git status --short
git diff --check
git diff --name-only origin/main...HEAD
git diff --stat origin/main...HEAD
```

Run task-proportional checks. Backend changes need relevant positive and
negative authorization/data-boundary coverage. Frontend changes need the
affected responsive, keyboard/focus, and failure-state check where applicable.
Transaction-required mutations need a real replica-set capability; a local
success is not migration, restore, staging, or release evidence.

Handover is six short answers:

```text
What changed, and what intentionally did not?
Which authority and task brief governed it?
Which checks passed, and which were not run?
What contract or path lock is released or still held?
What risk, rollback, or decision remains?
What external action still needs authorization?
```

Merging a PR proves only that reviewed source entered the base branch. It does
not resolve an audit finding, grant readiness, or grant go-live.

## Escalate quickly

Stop and ask for a decision when the task needs a new business rule, expands
into a provider/configuration/migration/data target, exposes a secret or
sensitive data, changes a transaction without required capability, cannot
reproduce a critical failure, or needs deployment/rollout/go-live authority.

For a blocked readiness item, produce only the bounded decision/evidence packet.
Continue independent authorized Delivery tasks in parallel.
