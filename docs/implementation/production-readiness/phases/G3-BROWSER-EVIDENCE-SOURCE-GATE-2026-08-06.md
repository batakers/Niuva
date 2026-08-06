# G3 Browser Evidence and Frontend Source-Gate Request — 6 August 2026

<!-- markdownlint-disable MD013 -->

**Status:** Evidence and decision-input context only. This packet does not
grant a frontend source gate, select a release candidate, or approve
production-readiness, deployment, provider activation, migration, or go-live.

## 1. Exact current-head provenance

The fresh worktree was created from the freshly fetched `origin/main` after
PR #170 merged:

| Evidence | Result | Limit |
| --- | --- | --- |
| Current `origin/main` | `5254641c3049e1063bc283264fb771d270f53eea` | Point-in-time observation |
| Commit tree | `c7a4af885c9bec74ff7f832c7cfcd6876627f5fa` | Exact tree identity only |
| First parent | `5d5abcfaefdbe4c108c7985001a47e1cdd82479b` | Git ancestry only |
| Worktree | `C:\tmp\niuva-g29-g3-browser-source-gate-20260806` | Clean; `origin/main...HEAD = 0/0` |
| Python / Node / npm | `3.14.3` / `v24.14.0` / `11.18.0` | Local toolchain identity |

PR #170 changed only the DR-001 documentation queue and provenance packet.
Therefore the exact source/test evidence below was executed at `5d5abcf` and
is carried to `5254641c` only for those unchanged source/test paths. No
application source was changed between the two SHAs.

Manifest hashes at the current head:

| File | SHA-256 |
| --- | --- |
| `frontend/package.json` | `7EA49B0BF92416E1D45596B74EC274138F0B76056EB794977A2A6E705A651CAD9` |
| `frontend/package-lock.json` | `E094B3CA22A3A4C274B2945246EEFF9468DC33C328294216C420F04B3443E88C` |
| `backend/requirements.txt` | `4C1CC9FB948CBF6B798532B3C740DF756393371DFFAECCD60023641A9BB04F00` |

## 2. Exact-head quality evidence

| Area | Command/result | Interpretation |
| --- | --- | --- |
| Backend | `python -m pytest -n 0 -q backend/tests` → **961 passed, 15 skipped, 14 subtests passed** | Strong local source evidence; skips remain unproven environment checks |
| Frontend Jest | `CI=true npm test -- --watchAll=false --runInBand` → **62 suites, 373 tests passed** | Component/contract evidence; not browser or external-role evidence |
| Frontend build | `CI=true npm run build` → compiled successfully | Build artifact was generated locally; no registry digest or deployment evidence |
| Release metadata | Postbuild skipped sitemap because `REACT_APP_PUBLIC_SITE_URL` was unset | Exact public-origin release input remains unverified |
| Bundle measurement | `npm run measure:bundle` → **581.27 kB** total gzip; entry **203.11 kB**; largest async **100.14 kB** | Measurement passed; no budget decision was applied |
| Bundle gate | `npm run check:bundle` → failed because `BUNDLE_TOTAL_GZIP_BUDGET`, `BUNDLE_ENTRY_GZIP_BUDGET`, and `BUNDLE_ASYNC_GZIP_BUDGET` were absent | Budget configuration is an open release gate; no budget was invented |
| Bundle unit checks | `npm run test:bundle` → **4 passed** | Verifies gate behavior, not an approved budget |

## 3. Browser evidence

The Playwright runner requires `REACT_APP_BACKEND_URL` when the frontend
catalog state is expected to use mocked API routes. The first Retail run did
not set it, so `HAS_CONFIGURED_BACKEND=false` and the app truthfully rendered
“Katalog belum terhubung”; those two apparent Retail failures are runner
setup evidence, not application failures.

With `PLAYWRIGHT_START_SERVER=true`,
`PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100`,
`REACT_APP_BACKEND_URL=http://127.0.0.1:3100`, and `PORT=3100`:

| Suite | Result | Limit |
| --- | --- | --- |
| `admin-session-cross-tab.spec.js` | **4 passed / 4** across mobile/tablet/laptop/desktop | Hermetic mocked API contract; not a real Admin account or deployed API |
| `retail-discovery.spec.js` | **8 passed / 8** across four viewports | Hermetic mocked catalog; Retail transaction capability remains inactive |
| `design-system-integration.spec.js` | **3 passed / 4**; laptop/tablet/desktop passed, mobile 375px failed | One real browser accessibility/focus failure remains |

The remaining failure is:

```text
expect(panel.getByRole("link", { name: "Home", exact: true })).toBeFocused()
Received: inactive
```

The test opens the mobile menu and expects the first link to receive focus.
`frontend/src/components/layout/Navbar.jsx` currently schedules one
`setTimeout(..., 50)` immediately after `setOpen(true)` and focuses the first
panel link. At the failing 375px run, the link remained inactive when that
single attempt occurred. The observed source/test evidence supports a likely
commit-timing race; it is a remediation hypothesis, not a claimed root-cause
closure. The existing unit test passes but does not reproduce this browser
timing/viewport behavior.

No change was made to `Navbar.jsx`, `Navbar.test.jsx`, or the E2E contract.

## 4. Dependency-audit runner finding

`npm run audit:production` did not pass under the observed Windows toolchain.
The direct `npm audit --omit=dev --json` output was a complete v2 report with
two high entries for the exact React Router advisory
`GHSA-qwww-vcr4-c8h2`, which the repository script explicitly allows for the
client-only BrowserRouter application. However, the script invokes
`spawnSync("npm.cmd", ...)`; Node `v24.14.0` returned `EINVAL`, leaving the
script with no report to parse and causing the gate to fail closed.

This is a separate exact-path source-gate candidate for
`frontend/scripts/audit-production-dependencies.js`. No waiver was broadened,
dependency was changed, or audit result was reclassified as passed.

## 5. Source-gate candidate and stop conditions

If the Project Owner grants a bounded G3 source gate, the candidate scope is:

1. `frontend/src/components/layout/Navbar.jsx`: synchronize initial focus
   with the committed open state (for example, an effect/animation-frame
   handoff with cleanup) while preserving the existing focus trap, Escape
   behavior, inert background, and focus restoration.
2. `frontend/src/components/layout/Navbar.test.jsx`: add a regression that
   covers the delayed open path and focus restoration.
3. Re-run the four viewport design-system suite and the full frontend suite.

The audit runner fix is not included in that scope unless separately assigned:
`frontend/scripts/audit-production-dependencies.js` plus its focused regression
must be reviewed as an independent source slice.

The following remain unverified or externally blocked: real role credentials,
external API/origin/TLS/proxy/CORS/cookie checks, screen-reader review,
staging access, restore rehearsal, immutable artifact digest, provider and
Finance activation, migration apply/rollback, deployment, monitoring/on-call
ownership, and go-live.

## 6. Handover

**Changed by this slice:** this packet and its task card only.

**Intentionally unchanged:** `Navbar.jsx`, `Navbar.test.jsx`, all frontend
E2E tests, audit script, package manifests/lockfile, CI/workflows, backend
source/tests, canonical documents, decisions/ADRs, runbooks, providers,
migrations, credentials, deployment configuration, and environment state.

**Risk:** the mobile navigation can leave keyboard focus outside the opened
menu under the observed viewport timing, so G3 accessibility evidence is not
fully green. The npm audit runner and bundle budget configuration also prevent
an unconditional release-quality claim.

**Rollback:** revert this documentation commit; no runtime, data, provider,
or deployment rollback is required.

**External actions still requiring approval:** bounded source gate for the
Navbar remediation, separate audit-runner source gate, approved bundle-budget
values, real-role/browser verifier and staging target, independent review,
provider activation, migration apply/restore, deployment, production-readiness
approval, and go-live.

<!-- markdownlint-enable MD013 -->
