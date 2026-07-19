# Niuva Website Audit Baseline

- Audit date: 19 July 2026
- Status: Active audit memory - implementation not authorized
- Scope: Public website, supporting frontend, backend/API integration, security, testing, and deployment readiness
- Audit baseline branch: `redesign/brand-alignment`
- Audit baseline commit: `a5a685a243489dbcdeb9b9f8c84cb12dca15f9e3`
- Latest `origin/main` observed during audit: `11858a8e2fbf9ebdcd53c69e8e658dcd4303e8a1`
- Findings: 19 total - P0: 1, P1: 6, P2: 10, P3: 2
- Implementation owner: Unassigned
- Last reviewed: 19 July 2026

## 1. Purpose

This document preserves the results of the comprehensive read-only Niuva website audit performed on 19 July 2026. It is the working memory for prioritization, implementation planning, verification, and follow-up reviews.

This document is not:

- a new product requirement;
- an approval to implement all findings;
- an approval to change protected admin, authentication, dashboard, order, backend, API, payment, or storage behavior;
- a replacement for the BRD, PRS, PRD, PRODUCT, ADRs, approved design specifications, or brand documents;
- a declaration that staging or production is ready.

When this document conflicts with an approved source, follow the source-of-truth hierarchy in `AGENTS.md`.

## 2. How to Use This Baseline

1. Select a small batch of related finding IDs.
2. Confirm dependencies, stakeholder decisions, and protected-scope permission.
3. Create an implementation plan only for the approved batch.
4. Implement and verify that batch without silently expanding scope.
5. Update the finding status and append evidence to this document.
6. Do not mark a finding verified only because code was edited or a build passed.

Recommended batch size:

- one security incident or architecture gate at a time;
- one to three small independent fixes at a time;
- one public journey or one operational vertical slice at a time.

## 3. Status Vocabulary

| Status | Meaning |
|---|---|
| `Open` | Confirmed finding; no approved remediation has been verified |
| `Decision required` | Work cannot safely begin until the named decision is recorded |
| `Approved for implementation` | Scope and owner are approved, but work is not yet verified |
| `In progress` | An approved implementation is actively being worked on |
| `Implemented, verification pending` | Code or configuration changed, but required checks are incomplete |
| `Verified` | Acceptance criteria passed and evidence is recorded |
| `Deferred` | Intentionally postponed with owner, reason, and review date |
| `Accepted risk` | Stakeholder explicitly accepts the residual risk and review date |
| `Superseded` | Replaced by a later approved audit, requirement, or decision |

`Verified`, `Deferred`, and `Accepted risk` entries must record the date, owner or approver, commit/configuration reference, and evidence.

## 4. Executive Baseline

### Readiness conclusion

| Environment | Audit conclusion | Conditions |
|---|---|---|
| Internal review | Suitable | Use the current public routes and documented limitations |
| Controlled visual stakeholder demo | Conditionally suitable | Do not demonstrate contact submission unless staging backend is configured and verified |
| Staging | Not yet ready | Close relevant P0/P1 findings, configure SPA routing and contact integration |
| Production | Not ready | Security, storage, payment, data integrity, legal, testing, and deployment gates remain open |

### Strongest implemented areas

- All five expected public pages exist and contain meaningful content.
- Niuva's R&D, design engineering, and prototyping positioning remains clear.
- Public navigation, footer navigation, aliases, logo link, CTAs, and mobile menu work in development.
- Responsive checks found no horizontal overflow at the required viewport sizes.
- Public pages generally have sound semantic, focus, reduced-motion, heading, and alternative-text foundations.
- Production frontend build succeeds.
- Fresh npm dependency audits reported zero known vulnerabilities.
- Public copy avoids Lorem Ipsum, empty sections, and unsupported marketing claims.

### Largest risks

- A tracked administrator credential requires immediate containment.
- Contact submission is broken when the backend URL or `/api` proxy is not configured.
- Production deep links require a provider SPA fallback that is documented but not implemented in repository configuration.
- File upload/download, manual transfer, and operational mutation behavior have unresolved architecture and governance gaps.
- The frontend has no automated tests or CI enforcement.

## 5. Findings Register

All findings start as `Open` unless their dependency makes `Decision required` more accurate. No finding was remediated during the audit.

| ID | Severity | Category | Finding | Primary evidence | Initial status | Safe independently |
|---|---|---|---|---|---|---|
| NIV-001 | P0 | Security | Administrator credential is stored in tracked test/report files | `backend/tests/backend_test.py:32`; `test_reports/iteration_1.json:35` | Implemented, verification pending | No |
| NIV-002 | P1 | Functional integration | Contact form fails when backend URL or `/api` proxy is absent | `frontend/src/lib/api.js:3`; `frontend/src/pages/marketing/ContactPage.jsx:67` | Decision required | Partially |
| NIV-003 | P1 | Deployment | Repository has no executable provider configuration for SPA fallback | `doc/PRODUCTION_DEPLOYMENT.md:43` | Decision required | No |
| NIV-004 | P1 | Accessibility | Admin Login fields are not associated with accessible labels | `frontend/src/pages/admin/AdminLogin.jsx:82,97` | Open | Technically yes; protected-scope approval required |
| NIV-005 | P1 | Security and storage | File access/upload does not yet satisfy ADR-002 production gates | `frontend/src/lib/api.js:16`; `backend/server.py:236,495`; `backend/storage.py:9` | Decision required | No |
| NIV-006 | P1 | Payment governance | API can still operate a new manual-transfer and payment-proof flow | `backend/server.py:392,419`; ADR-003 | Decision required | No |
| NIV-007 | P1 | Data integrity | Order numbering, money representation, and material deletion are not history/concurrency safe | `backend/server.py:133,310,343,663` | Decision required | No |
| NIV-008 | P2 | Privacy and API projection | Public settings returns all account-detail fields | `backend/server.py:594` | Decision required | Partially |
| NIV-009 | P2 | Routing and SEO | Wildcard redirect produces soft 404 and confusing auth-route behavior | `frontend/src/App.js:100,118` | Open | Partially |
| NIV-010 | P2 | Accessibility | Small Home accent text has approximately 4.39:1 contrast | `frontend/src/pages/marketing/HomePage.jsx:259,270` | Open | Yes |
| NIV-011 | P2 | SEO | Social metadata, structured data, manifest, and release sitemap controls are incomplete | `frontend/public/index.html:4`; `frontend/scripts/generate-release-files.js:12` | Decision required | Partially |
| NIV-012 | P2 | Privacy and legal | Contact form has no complete privacy/PDP notice | `frontend/src/components/brand/BrandSystem.jsx:527`; `frontend/src/components/layout/Footer.jsx:57` | Decision required | No |
| NIV-013 | P2 | Form security | Public form validation, encoding, spam control, and rate limiting are not production-grade | `backend/server.py:143,224,513,536` | Open | Partially |
| NIV-014 | P2 | Testing and CI | Frontend has no tests and repository has no CI enforcement | `frontend/package.json:35`; `backend/pytest.ini:1` | Open | Partially |
| NIV-015 | P2 | Build reproducibility | Manifest declares Yarn while repository uses an npm lockfile; release instructions are incomplete | `frontend/package.json:114`; `frontend/package-lock.json`; `README.md` | Open | Yes after maintainer choice |
| NIV-016 | P2 | Brand and UI | Current Home typography and broad motion do not yet implement the approved Phase 4 direction | `frontend/src/index.css:33,176`; `frontend/src/components/brand/BrandSystem.jsx:21` | Decision required | No |
| NIV-017 | P2 | Performance | Logo is a large base64-embedded SVG and is transferred through duplicate assets | `frontend/public/niuva-mark.svg`; `frontend/src/assets/brand/niuva-mark.svg` | Open | Yes after brand approval |
| NIV-018 | P3 | Error-state UX | Portfolio API failures are swallowed without telemetry or status | `frontend/src/pages/marketing/ProjectsPage.jsx:26` | Open | Yes after monitoring decision |
| NIV-019 | P3 | Maintainability | Unused dependency/component candidates and stale test documentation remain | `frontend/package.json:20`; `frontend/src/components/ui/`; `test_reports/iteration_1.json` | Open | Yes after usage verification |

## 6. Finding Notes and Required Outcomes

### NIV-001 - Credential containment

- Do not reproduce the credential value in issues, plans, logs, or this document.
- Immediately determine whether it was ever active and rotate or invalidate it if applicable.
- Replace tracked literals with an approved secret/fixture mechanism.
- Decide whether Git history and downstream clones require remediation.
- Verification requires a secret scan and a controlled admin authentication check using a newly provisioned credential.

Repository containment progress recorded on 19 July 2026:

- The current branch no longer stores the audited administrator value in the live integration test or generated iteration report.
- Authenticated integration tests now require test-only environment variables and skip admin-dependent coverage when they are absent.
- A repository-hygiene regression test and targeted ignore rule guard the current-tree pattern.
- Credential rotation/invalidation remains an external owner action.
- Git-history remediation remains open because the introducing commit is present on multiple local and remote branches.
- NIV-001 remains P0 and must not be marked `Verified` until both outstanding gates are recorded.

### NIV-002 and NIV-003 - Public staging path

- Decide the frontend host, public domain, backend origin, and `/api` proxy strategy.
- Make missing release configuration fail clearly rather than producing a silently broken form.
- Configure SPA fallback without rewriting real assets or `/api/*`.
- Verify direct load and refresh for `/`, `/about`, `/capabilities`, `/projects`, `/contact`, and `/admin/login`.
- Verify that a contact lead is stored before notification and remains stored if email delivery fails.

### NIV-004 - Admin accessibility

- Associate each visible label with its input.
- Preserve browser autofill, error behavior, focus order, and keyboard submission.
- Obtain explicit permission before editing the protected admin surface.

### NIV-005 - Secure storage foundation

- Keep production upload disabled until ADR-002 gates pass.
- Remove query-string access tokens.
- Replace path-substring authorization with database-backed ownership and permission checks.
- Validate file extension, MIME type, signature, size, and ownership.
- Add malware scanning/quarantine, reconciliation, backup/restore, and tested access expiry.
- Do not choose a provider without the required storage and operational decision.

### NIV-006 - Payment boundary

- Preserve readable legacy records.
- Do not enable a new manual-transfer adapter without a written decision, Finance owner, feature flag, SLA, expiry, refund/late-payment handling, audit, rollback, and exit criteria.
- Do not select or integrate a gateway as part of this audit follow-up unless separately approved.

### NIV-007 - Operational data integrity

- Replace binary floating-point monetary representation with Decimal or consistent minor units.
- Replace `count_documents + 1` order numbering with a conflict-safe mechanism and unique constraint.
- Archive referenced materials rather than deleting them.
- Plan migration, compatibility, dry run, backup, validation, and rollback.
- Use the approved transaction capability for cross-collection atomic mutations.

### NIV-008 to NIV-013 - Public trust and discoverability

- Whitelist customer-safe settings fields instead of exposing the whole settings document.
- Add a real Not Found experience and correct hosting behavior.
- Fix the confirmed Home contrast issue.
- Add approved Open Graph, Twitter, manifest, sitemap, and structured data.
- Obtain legal review for privacy/PDP notice, retention, purpose, rights, and contact details.
- Escape all user-controlled email output and provide production-capable rate limiting and spam controls.

### NIV-014 and NIV-015 - Delivery discipline

- Add public route, navigation, contact, error-state, accessibility, and build smoke tests.
- Make the backend suite reproducible using its declared test environment.
- Add CI only after runner, secret, database, and replica-set ownership are defined.
- Choose one package manager and align the manifest, lockfile, Node version, and setup instructions.

### NIV-016 - Approved Home work

- Treat this as an approved-plan dependency, not an isolated style patch.
- Do not begin until Phase 4 authorization is explicit.
- Keep changes Home-scoped and preserve public route, metadata, accessibility, and performance contracts.

### NIV-017 to NIV-019 - Optimization and cleanup

- Re-export the logo from an approved master asset and compare visual fidelity before replacing it.
- Add observable portfolio fallback behavior without removing the static project evidence.
- Prove dependency/component non-use before removal.
- Sanitize or archive stale reports without preserving credential values.

## 7. Prioritized Work Batches

These batches are sequencing guidance only. Each batch still requires explicit approval.

### Batch 0 - Security incident containment

- Findings: NIV-001
- Goal: invalidate any exposed credential and prevent recurrence.
- Exit gate: rotation decision, sanitized tracked files, secret scan, and documented history decision.

### Batch 1 - Public staging readiness

- Findings: NIV-002, NIV-003, NIV-010
- Goal: make direct routes and the primary lead flow reliable in staging.
- Exit gate: route matrix passes, contact integration passes, release configuration is explicit, contrast passes.

NIV-004 may be included only if the same review covers the protected Admin Login surface.

### Batch 2 - Protected architecture gates

- Findings: NIV-005, NIV-006, NIV-007, NIV-008
- Goal: prevent unsafe operational rollout while preserving legacy compatibility.
- Exit gate: approved design/migration plan, protected flags fail closed, architecture-specific tests pass.

Do not combine storage, payment, and data-integrity implementation into one uncontrolled change. Treat each as its own vertical slice.

### Batch 3 - Public trust, SEO, and form quality

- Findings: NIV-009, NIV-011, NIV-012, NIV-013
- Goal: complete public trust, discoverability, legal, and abuse-prevention controls.
- Exit gate: stakeholder content decisions recorded, metadata validated, legal notice approved, form security tests pass.

### Batch 4 - Quality and reproducibility

- Findings: NIV-014, NIV-015
- Goal: make current behavior reproducible and regression-resistant.
- Exit gate: package-manager policy documented, clean install/build works, selected tests run in CI.

### Batch 5 - Approved visual maturity and optimization

- Findings: NIV-016, NIV-017
- Goal: implement the approved Home direction and reduce asset cost.
- Exit gate: Phase 4 approval, responsive/a11y/performance acceptance, approved logo output.

### Batch 6 - Maintenance cleanup

- Findings: NIV-018, NIV-019
- Goal: improve observability and remove proven dead weight.
- Exit gate: no behavior regression, build/tests pass, and removals are evidence-based.

## 8. Decisions Register

| Decision ID | Required decision | Blocks | Owner | Status |
|---|---|---|---|---|
| AUD-DEC-01 | Credential rotation and Git-history remediation | NIV-001 | Security/operations | Open |
| AUD-DEC-02 | Frontend host, public domain, and deployment owner | NIV-003, NIV-011 | Stakeholder/DevOps | Open |
| AUD-DEC-03 | Backend origin versus same-origin `/api` proxy | NIV-002 | Backend/DevOps | Open |
| AUD-DEC-04 | Production storage provider and operational ownership | NIV-005 | Architecture/operations | Open |
| AUD-DEC-05 | Legacy manual-transfer handling and Finance ownership | NIV-006, NIV-008 | Finance/product | Open |
| AUD-DEC-06 | Migration and transaction rollout approval | NIV-007 | Architecture/data owner | Open |
| AUD-DEC-07 | Privacy legal basis, retention, notice, and contact | NIV-012 | Legal/stakeholder | Open |
| AUD-DEC-08 | Official business metadata, social accounts, and preview image | NIV-011 | Marketing/stakeholder | Open |
| AUD-DEC-09 | CI runner, secret, database, and test-environment ownership | NIV-014 | Engineering/DevOps | Open |
| AUD-DEC-10 | Canonical package manager and supported Node version | NIV-015 | Maintainer | Open |
| AUD-DEC-11 | Homepage Phase 4 authorization | NIV-016 | Stakeholder | Open |
| AUD-DEC-12 | Approved optimized logo source | NIV-017 | Brand owner | Open |
| AUD-DEC-13 | Error monitoring/telemetry provider | NIV-018 | Engineering/operations | Open |

## 9. Verification Baseline

Fresh checks run during the audit:

| Check | Result | Baseline evidence |
|---|---|---|
| `git fetch origin --prune` | Passed | Remote refs refreshed |
| `npm ls --depth=0` | Passed | Dependency tree resolved |
| `npm audit --omit=dev --json` | Passed | Zero reported vulnerabilities |
| `npm audit --json` | Passed | Zero reported vulnerabilities |
| Frontend test command | Failed | No frontend tests found |
| Backend pytest command | Blocked | Worktree-local environment lacked required `pytest-xdist` plugin |
| `npm run build` | Passed | Main JS approximately 177.8 kB gzip; CSS approximately 13.69 kB gzip |
| Sitemap generation | Skipped by build script | Public production site URL not configured |
| Development public routes | Passed | Five canonical routes and two aliases rendered |
| Required responsive viewports | Passed | No horizontal overflow found |
| Mobile menu keyboard behavior | Passed | Escape closed menu and focus returned |
| Contact submission | Failed | `/api/contact` returned 404 without backend/proxy configuration |
| Static deep-link check | Failed without rewrite | Canonical deep links returned 404 on a plain static file server |
| Automated accessibility | Partial | Home contrast and Admin Login label findings confirmed |
| Lighthouse | Not run | Reliable installed runner was unavailable |

Required viewport baseline:

- 360x800
- 390x844
- 768x1024
- 1024x768
- 1366x768
- 1440x900
- 1920x1080

## 10. Completion Evidence Template

Use this block when changing a finding status:

```text
Finding:
Previous status:
New status:
Date:
Owner/approver:
Implementation commit or configuration reference:
Files/configuration changed:
Checks executed:
Result:
Migration/rollback evidence:
Residual risk:
Next review date:
```

Minimum evidence by category:

- Security: redacted scan output, rotation/config reference, regression test.
- Functional: reproduction before, test after, user-visible result.
- Accessibility: automated result plus relevant keyboard/screen-reader verification.
- Deployment: real staging HTTP route matrix and rollback evidence.
- Data/migration: backup, dry run, validation counts, rollback rehearsal.
- SEO: rendered metadata, HTTP behavior, validator or preview evidence.
- Performance: same-condition before/after measurement.
- Cleanup: import/dependency proof plus build and regression tests.

## 11. Known Limitations of the Audit

- No production or staging URL was available.
- Backend tests could not run because the existing local environment lacked a required declared plugin; no dependency was installed during the audit.
- No live MongoDB, email, storage, payment, or deployment provider was exercised.
- No credential was used to authenticate.
- No file upload, payment, destructive migration, or production form submission was attempted.
- Lighthouse and human screen-reader testing were not completed.
- Browser checks primarily used local Chromium; real-device, Safari, and Firefox coverage remains open.
- The current homepage implementation is intentionally behind an approved plan that still requires Phase 4 authorization.

## 12. Related Sources

- `AGENTS.md`
- `AGENTS.brand-baseline-v1.md`
- `PRODUCT.md`
- `doc/BRD_Website_Niuva.md`
- `doc/PRS_Website_Niuva.md`
- `doc/PRD_Platform_Niuva_v2_1_retail_b2b.md`
- `doc/brand/BRAND_WEBSITE_AUDIT.md`
- `doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md`
- `doc/PRODUCTION_DEPLOYMENT.md`
- `doc/decisions/ADR-001-mongodb-transaction-capability.md`
- `doc/decisions/ADR-002-production-file-storage-architecture.md`
- `doc/decisions/ADR-003-retail-payment-orchestration-boundary.md`
- `doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md`
- `docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md`

## 13. Change Log

| Date | Change | Recorded by |
|---|---|---|
| 19 July 2026 | Recorded NIV-001 current-tree containment; external credential rotation and Git-history decision remain open | Codex, pending stakeholder verification |
| 19 July 2026 | Initial baseline created from the comprehensive read-only website audit | Codex, at user request |

## 14. Current Recommended First Three Actions

1. Close NIV-001 through controlled credential containment and rotation.
2. Record AUD-DEC-02 and AUD-DEC-03, then prepare a small staging-readiness plan for NIV-002 and NIV-003.
3. Keep NIV-005, NIV-006, and NIV-007 fail-closed while their architecture and migration decisions remain open.

No remediation should begin solely because it appears in this document. Select and approve the next batch explicitly.
