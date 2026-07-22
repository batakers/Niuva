# AGENTS.md — Niuva Repository Entry Point

## Canonical Reading Order

1. `docs/NIUVA_MASTER_SPEC.md`
2. `docs/context/DOCUMENT_REGISTER.md`
3. `docs/decisions/DECISION_REGISTER.md`
4. The approved decision or ADR applicable to the task
5. The applicable runbook
6. The current source code and tests
7. Supporting references only when required

## Non-Negotiable Implementation Guardrails

- The Homepage direction is Unified Homepage with a B2B-primary narrative and a Retail secondary path; detailed Retail/B2B navigation remains deferred.
- Retail and B2B are two journeys within one website and operational platform. Preserve their separate Retail Order and B2B Quote/Project lifecycles.
- Enforce authorization in backend handlers and data queries with least privilege. Customer-facing data must exclude internal cost, margin, supplier, profit, and internal notes.
- Transaction-required cross-collection mutations fail closed when MongoDB transaction capability is unavailable. Do not add a non-atomic fallback.
- Storage and Retail payment boundaries remain provider-neutral. Do not select or activate a provider, upload, payment, Finance, production-readiness, or go-live decision without explicit approval.
- Preserve historical records and perform migrations non-destructively with backup, dry run, validation, and rollback instructions. Do not hard-delete referenced records.
- Do not write credentials, tokens, secrets, or API keys into source or product documentation.
- `docs/references/requirements/historical-active/AGENTS.brand-baseline-v1.md` remains an Active Guardrail for public-page and brand work only where it does not conflict with the canonical documents or an approved decision.

## Repository Workflow

- Inspect the applicable canonical authority, repository state, active branch, and relevant source before editing.
- Preserve unrelated tracked and untracked work. Do not commit, push, reset, rebase, force-push, or delete branches without explicit user approval.
- Keep public, customer, and operational concerns separate. Do not invent product direction, pricing promises, roles, policies, or visual identity.
- Do not add dependencies, change global configuration, or modify secrets without explicit approval.
- Follow approved migration and execution gates; a documentation plan does not authorize application implementation.

## Verification and Handover

- Run proportional checks for the changed scope and report what was verified or could not run.
- Verify role and customer-data boundaries, critical conflicts/retries, and responsive/accessibility impact where applicable.
- Document operational, migration, rollback, and handover impact for changes that affect them.
