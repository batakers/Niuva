# Feature 8.3 — CE-020 Current-Head Rebaseline

Status: **candidate evidence only; no publication, operational, or production authority**

Prepared: 11 August 2026 (Asia/Jakarta)

Selected baseline: `origin/main` at
`4cbcd17da126ebb3855bcc4cd837418b91896f5a` (`4cbcd17`). This note is based on
the refreshed head after PR #226 and PR #227 were merged. It supersedes the
local candidate snapshots that were written against `2cd4ab2`; those snapshots
remain preserved in the dated residual-worktree backup and are not copied into
this candidate.

## 1. Bounded candidate

The only source delta in this worktree is the already-approved CE-020 header
withdrawal:

| Path | Candidate change | Explicitly retained |
| --- | --- | --- |
| `backend/material_routes.py:398-412` | Remove the expired `Sunset` response-header assignment from the deprecated DELETE compatibility alias. | `Deprecation: true`, permission `materials.archive`, archive service, reason, response serialization, status, audit behavior, and route shape. |
| `backend/tests/test_material_pricing.py:279-336` | Assert no `Sunset` header and assert the archived response remains `status: archived` and `active: false`. | Existing successor/archive, authorization, projection, and rollback coverage. |

This candidate does **not** delete the alias, add a replacement date, migrate
consumers, change data, activate a provider, deploy, or claim production
readiness. Git publication remains a separate owner gate.

## 2. Current-head verification

- `python -m pytest -n 0 backend/tests/test_api_contract.py backend/tests/test_health.py backend/tests/test_material_pricing.py -q` — **32 passed**.
- `python -m compileall -q backend/material_routes.py` — **passed**.
- `git diff --check` — **passed**.
- The current `origin/main` still exposes the deprecated alias at
  `backend/material_routes.py:398-412`; the candidate removes only the stale
  header assignment at line 404.
- The repository successor remains the POST archive path used by the current
  material UI; no DELETE consumer was inferred from absence of a search hit.

## 3. Authority and remaining gates

The Feature 8.3 compatibility register and Catalog/Material runbook remain
the applicable evidence inputs. This note does not amend canonical decisions,
the Decision Register, or the production-readiness register. Before any PR,
the owner still needs a separate publication authorization and an independent
review of this exact two-file diff. External consumer inventory, monitoring
ownership, rollback evidence, deployment, and go-live remain open gates.

## 4. Disposition of older snapshots

The three earlier local FEATURE-8.3 packets contained historical observations
and a `2cd4ab2` baseline. They are retained outside the repository in the
dated residual-worktree backup for recovery/audit, but are intentionally not
published or treated as current-head authority. This rebaseline note is the
only candidate governance document carried forward in this worktree.
