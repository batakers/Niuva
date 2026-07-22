# Backend Framework Security Upgrade Design

**Status:** Approved in conversation on 21 July 2026

## Goal

Remove the known Starlette vulnerabilities reported by the backend dependency audit while preserving all current API, business, database, storage, authentication, and lifecycle behavior.

## Current State

- `fastapi==0.110.1` requires `starlette>=0.37.2,<0.38.0`.
- The resolved environment uses Starlette `0.37.2`.
- The backend audit reports known vulnerabilities against Starlette `0.37.2`.
- The full configured backend suite currently passes with 135 tests, 2 environment-driven skips, and 14 subtests.
- The application uses `@app.on_event("startup")` and `@app.on_event("shutdown")`. Those handlers are outside this minimal security slice unless compatibility testing proves that the dependency upgrade cannot run without a focused change.

## Chosen Approach

Perform a minimal, security-only dependency upgrade:

- update FastAPI from `0.110.1` to `0.139.2`;
- explicitly pin Starlette to `1.3.1` so installations cannot resolve to a vulnerable lower version;
- raise the declared Pydantic floor from `2.6.4` to `2.9.0`, matching the FastAPI `0.139.2` requirement;
- leave Uvicorn and all unrelated dependencies unchanged.

FastAPI `0.139.2` declares `starlette>=0.46.0`, so the selected Starlette release satisfies the framework constraint. Exact FastAPI and Starlette pins keep this high-risk framework boundary reproducible; Pydantic retains the repository's existing minimum-version policy.

## Alternatives Rejected

### Upgrade Starlette Alone

Rejected because FastAPI `0.110.1` constrains Starlette below `0.38.0`. Installing Starlette `1.3.1` beside the current FastAPI version would create an unsupported dependency set.

### Broader Framework Modernization

Rejected for this slice because converting application lifecycle handlers, upgrading Uvicorn, or refactoring request behavior would enlarge the review surface. Those changes may be proposed separately after the security upgrade is stable.

## Risk Controls

Starlette `1.3.1` is the current security-cleared target identified by the audit, but its PyPI metadata classifies the project release line as Alpha. The branch therefore uses an exact pin, changes no unrelated framework component, and requires the complete compatibility matrix before publication. Passing dependency resolution alone is not sufficient.

The authoritative dependency metadata for this decision is:

- FastAPI `0.139.2`: <https://pypi.org/pypi/fastapi/0.139.2/json>
- Starlette `1.3.1`: <https://pypi.org/pypi/starlette/1.3.1/json>

If repository tests expose a compatibility regression that cannot be repaired within the minimal boundary, the upgrade is not published. The fallback is to restore the clean branch and reassess the target; knowingly retaining an audited vulnerable framework is not treated as a successful outcome.

## Change Boundary

The planned manifest change is limited to `backend/requirements.txt`. The local virtual environment may be rebuilt or updated for verification, but environment artifacts are not committed.

No API route, request or response schema, database model, migration, storage rule, authentication behavior, authorization rule, background-job behavior, frontend code, or deployment configuration changes are authorized by this design.

If the upgraded framework breaks an existing behavior, first add or identify a focused test that demonstrates the incompatibility. Make only the smallest compatibility adjustment needed to restore the approved behavior. If that adjustment requires lifecycle redesign, business behavior changes, data migration, or additional dependency modernization, stop and request a new scope decision instead of expanding this change silently.

## Verification Strategy

The existing dependency audit is the security regression test:

1. Capture the current `pip-audit` failure against the old framework set as the RED baseline.
2. Update the three declared framework constraints and install from `backend/requirements.txt`.
3. Run `pip check`; the environment must contain no broken requirements.
4. Run `pip-audit -r backend/requirements.txt`; the backend requirements must report zero known vulnerabilities at verification time.
5. Verify the installed FastAPI, Starlette, and Pydantic versions match the declared compatibility boundary.
6. Import the application and generate its OpenAPI document as a framework smoke test.
7. Run the complete configured backend pytest suite without changing the fixed xdist configuration.
8. Run `git diff --check` and review the entire branch diff before any commit or publication.

If a compatibility failure requires production-code changes, use a focused RED-GREEN test cycle for each behavior before rerunning the full matrix.

## Failure and Recovery

- If package resolution cannot produce the selected versions, restore the original requirements and stop.
- If `pip check` or `pip-audit` fails after installation, do not commit the dependency change.
- If any existing backend test or OpenAPI generation fails, determine whether the failure is a real compatibility regression before editing production code.
- If a safe fix would exceed the approved minimal scope, restore the clean branch and request a broader design decision.
- Rollback is the requirements-file reversal plus reinstalling the previous dependency set; there is no data rollback because this design introduces no migration.

## Success Criteria

- FastAPI resolves to `0.139.2`, Starlette resolves to `1.3.1`, and Pydantic resolves to at least `2.9.0`.
- `pip check` reports no broken requirements.
- `pip-audit` reports zero known vulnerabilities for the backend requirements at verification time.
- Application import and OpenAPI generation succeed.
- The complete backend test suite passes with only documented environment-driven skips.
- No application source, business behavior, database schema, frontend code, or unrelated dependency changes are present unless a separately approved compatibility exception is required.
- Commit, push, and PR creation occur only after the final diff and verification evidence are reviewed.
