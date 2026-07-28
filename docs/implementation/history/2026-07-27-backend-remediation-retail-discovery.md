# Backend Remediation and Retail Discovery — Implementation Record

Status: **Implemented in source; not deployed**
Date: 27 July 2026
Authority: `DEC-REMED-001` /
`docs/decisions/architecture/ADR-005-backend-remediation-runtime-policy.md`

## Scope delivered

### Security and identity

- Separate customer and staff login surfaces with generic blocked-account 401.
- HttpOnly 15-minute access and seven-day absolute refresh sessions.
- Hashed, revocable, single-use refresh rotation with family replay revocation.
- CSRF enforcement for cookie-authenticated mutations and no token response
  body/localStorage contract.
- Mongo atomic login limiter, atomic reset-token consumption, and all-session
  revocation after reset.
- One-time valid Super Admin bootstrap with no startup password mutation.
- Bootstrap validates `ADMIN_EMAIL` before any write, resolves a
  development-only blocklist relative to the backend root, and fails closed on
  invalid identity/password-policy configuration.
- Startup no longer inserts sample materials or bypasses the publication
  lifecycle with directly-published portfolio fixtures.
- Separate staff governance and customer-management APIs and UI.

### Data integrity and publication

- Ordered Migration 007→008→009 chain with duplicate preflight, dry-run
  defaults, backup evidence gates, idempotent apply, Date normalization,
  recovery/session markers, and required indexes.
- Schema/index readiness manifest and HTTP 503 fail-closed readiness.
- Shared transaction guard and expected-version/CAS adoption for affected
  content, portfolio, settings, identity, inventory, and B2B mutations.
- Immutable CMS and portfolio publication snapshots with scheduled UTC
  activation, rollback-as-new-revision, and archive.
- Database-backed file ownership and explicit active/deleted/quarantined state.

### Retail discovery and frontend integration

- Secondary Retail entry on the Unified Homepage and navigation.
- Cursor-paginated public categories/product listing and stable-slug detail.
- Published-only product projection with active variants, safe price display,
  availability, CTA state, loading/empty/error/retry/unavailable states.
- Customer cookie login, public settings, published capabilities/portfolio,
  staff/customer separation, portfolio-from-project, and Work Order wiring.
- Development-only PNG/JPEG/WebP media upload with signature/size validation,
  bounded streaming input, DB-backed ownership/state metadata, upload
  compensation, Product/Portfolio editor integration, published-snapshot-only
  public reads, and streaming downloads. Production storage remains inactive.
- Retail/legacy creation and every Retail lifecycle mutation are gated;
  historical Retail aggregates are read-only. The old web-process timer that
  marked legacy design files deleted is removed so retained historical records
  are not mutated by startup side effects. Checkout, payment, production
  upload, Organization Portal, and other inactive capabilities remain gated.

### Business invariants and operations

- Quote readiness, immutable sent/accepted version, and audited offline
  acceptance evidence.
- Cumulative Work Order hard cap, reservation release on cancellation, and
  terminal Project child-state gates.
- Inventory adjustment request/manager approve/reject flow with self-approval
  denial.
- Admin messages, inventory restock alerts, canonical inquiries, and retained
  legacy contact intake enqueue provider-neutral durable outbox deliveries.
  Expired processing leases are reclaimable, retries are bounded with backoff,
  exhausted work remains inspectable, and UI/API reporting says `queued`, not
  `sent`. No active business notification producer bypasses the worker with a
  direct email call.
- Quote lines carry stable `quote_line_id` values. Work Orders reference the
  accepted Quote version and exact line, so repeated variants remain distinct
  and each line receives its own cumulative hard cap.
- Catalog Managers may edit draft prices and prepare candidates, while catalog
  publication, rollback, and variant lifecycle remain Manager/Approver-only.
  Candidate submission validates the aggregate, records an audit reason, and
  is invalidated by later edits; publication uses compare-and-set against that
  candidate state.
- Consistent request ID/error envelope, strict mutation schemas, and
  formula-safe CSV serialization.
- Public settings/CMS contact links accept only validated credential-free HTTPS
  targets (CTA targets remain internal paths), with client-side sanitization for
  historical values.
- FastAPI lifespan, live readiness checks, and capability configuration.
- A bounded GET-only Retail catalog load probe and evidence runbook. Every load
  shape and threshold remains an explicit owner-provided input; the repository
  does not invent an SLA.

## Migration and rollout boundary

- No production database migration was executed.
- Migrations 007, 008, and 009 must be run dry in order, with redacted
  preflight output and each migration's reviewed backup evidence. Every second
  apply must be a no-op, and readiness remains false until the complete chain
  and post-008 index state are present.
- Existing users, orders, materials, portfolio, payment history, and archived
  organization data are preserved.
- NIV-001 history rewrite was not executed. Closure still requires redacted
  credential evidence and separate approval for the destructive command/window.
- Auth frontend/backend must roll out atomically; all legacy bearer sessions are
  intentionally invalid after cutover.

## Open governing conflicts and operational gates

The source is not a production-ready claim and Phase 0–6 are not all closed:

- `ADR-005` selects a 12–72 UTF-8 byte application password policy and a
  universal seven-day absolute refresh lifetime. `DEC-AUTH-004` instead selects
  15–128 Unicode code points plus an operator-owned blocklist/Argon2 rollout,
  while `DEC-AUTH-005` selects Admin default 30-minute idle/eight-hour absolute
  sessions and seven days only for explicit remember-me. The current source
  implements the latter Admin decisions and a separate customer-session
  contract. A governing owner decision is required before these seams can be
  unified or the local bootstrap contract can be called reproducible.
- The Admin session surface intentionally has its own refresh/logout routes and
  returns a synchronizer CSRF token plus expiry metadata. That differs from the
  remediation summary's literal `{user}`-only/unified-route wording and is part
  of the same clarification.
- `ADR-005` explicitly requires cursor pagination for growing public catalog
  reads, which is implemented. The plan summary can also be read as requiring a
  breaking envelope change for every growing Admin/customer list. No common
  compatibility response for those existing array APIs was approved, so that
  broader interpretation remains `Needs Clarification`.
- No metrics provider, alert destination, numerical alert threshold, load shape,
  or performance budget has been approved. Structured request/transaction/
  worker logs and a threshold-driven load harness exist; provider and threshold
  selection remain `Needs Clarification`.
- Migration 007→008→009 has not been rehearsed against a reviewed representative
  backup clone or applied to production. The manual Admin browser matrix also
  has not run because it requires approved HTTPS staging origins and dedicated
  role accounts.
- Production storage/malware scanning, payment, checkout, Organization Portal,
  deployment, and go-live remain explicitly inactive or outside scope.

## Documentation claim corrections

- Earlier “CMS implemented” statements describe the source foundation, not
  immutable-publication rollout or production readiness. This remediation adds
  the publication/CAS kernel; deployment remains unproven.
- Payment is not implemented as an active capability. Historical manual-transfer
  records are read-only and provider selection remains open.
- Organization collections are archived data, not active startup schema.

## Verification

Latest local source verification on 28 July 2026:

- backend: 545 passed, 11 documented environment/topology skips, 14 subtests;
- frontend: 217 passed;
- Retail Playwright: 4 passed on mobile and desktop, including controlled
  empty/error states, published media resolution, and WCAG A/AA scan;
- optimized frontend bundle compilation: passed; production release-file
  generation remains gated on an approved `REACT_APP_PUBLIC_SITE_URL`;
- `pip-audit`: no known vulnerabilities;
- compile, fatal flake8, focused mypy, black/isort, and `git diff --check`:
  passed;
- production npm policy passed with only the exact React Router RSC-only
  advisory waiver described by `DEC-REMED-001`.
- a temporary local MongoDB 7 replica set ran all 66 opted-in transaction,
  migration, and backup/restore integration tests successfully and was
  stopped/removed afterward; no project database was used and no production
  migration was executed.
- a separate fresh-database smoke test created the one configured Super Admin
  and received HTTP 200 from the staff-only login surface; the temporary
  backend, database, and files were then removed.
- the corrected Gitleaks history command scanned all 234 commits reachable from
  the PR checkout in GitHub Actions. A pinned local redacted review proved its
  three findings were exact false positives: one test-only CSRF fixture and two
  historical documentation sentences about token removal. They are ignored by
  exact commit/path/rule/line fingerprints only. After pruning deleted
  remote-tracking refs, none of the four advertised remote heads or any remote
  tag contains the recorded NIV-001 introducing commit. NIV-001 nevertheless
  remains open until credential rotation/revocation, cached PR-ref/clone
  disposition, and reviewed closure evidence exist; no real finding is
  allowlisted.

The real Mongo transaction job remains mandatory in CI despite the local
evidence. Full Admin
role/accessibility/responsive browser contracts are isolated in the manual
`external-admin-e2e` staging workflow because they require dedicated accounts
for each role and approved frontend/API origins. Staging smoke,
backup/restore rehearsal, migration dry-run against a redacted clone, worker
outage/recovery, successful NIV-001 incident closure, and production readiness
are operational gates, not claims made by this local verification.

This record is not production rollout, provider selection, migration execution,
deployment, or go-live approval.
