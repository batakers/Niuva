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
- Separate staff governance and customer-management APIs and UI.

### Data integrity and publication

- Versioned migration 007 with duplicate preflight, dry-run default, backup
  evidence gate, idempotent apply, Date normalization, and required indexes.
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
- Retail/legacy creation and every Retail lifecycle mutation are gated;
  historical Retail aggregates are read-only. Checkout, payment, production
  upload, Organization Portal, and other inactive capabilities remain gated.

### Business invariants and operations

- Quote readiness, immutable sent/accepted version, and audited offline
  acceptance evidence.
- Cumulative Work Order hard cap, reservation release on cancellation, and
  terminal Project child-state gates.
- Inventory adjustment request/manager approve/reject flow with self-approval
  denial.
- Admin and inventory notification producers enqueue durable outbox deliveries;
  expired processing leases are reclaimable and UI/API reporting says
  `queued`, not `sent`.
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
- FastAPI lifespan, live readiness checks, and capability configuration.

## Migration and rollout boundary

- No production database migration was executed.
- Migration 007 must be run dry first, with redacted preflight output and
  reviewed backup evidence. A second apply must be a no-op.
- Existing users, orders, materials, portfolio, payment history, and archived
  organization data are preserved.
- NIV-001 history rewrite was not executed. Closure still requires redacted
  credential evidence and separate approval for the destructive command/window.
- Auth frontend/backend must roll out atomically; all legacy bearer sessions are
  intentionally invalid after cutover.

## Documentation claim corrections

- Earlier “CMS implemented” statements describe the source foundation, not
  immutable-publication rollout or production readiness. This remediation adds
  the publication/CAS kernel; deployment remains unproven.
- Payment is not implemented as an active capability. Historical manual-transfer
  records are read-only and provider selection remains open.
- Organization collections are archived data, not active startup schema.

## Verification

Local source verification on 27 July 2026:

- backend: 460 passed, 7 documented environment/topology skips, 14 subtests;
- frontend: 200 passed;
- Retail Playwright: 4 passed on mobile and desktop, including controlled
  empty/error states and WCAG A/AA scan;
- optimized frontend bundle compilation: passed; production release-file
  generation remains gated on an approved `REACT_APP_PUBLIC_SITE_URL`;
- `pip-audit`: no known vulnerabilities;
- compile, fatal flake8, focused mypy, black/isort, and `git diff --check`:
  passed;
- production npm policy passed with only the exact React Router RSC-only
  advisory waiver described by `DEC-REMED-001`.

The real Mongo transaction job remains mandatory in CI. Staging smoke,
backup/restore rehearsal, migration dry-run against a redacted clone, worker
outage/recovery, execution of the configured Gitleaks history scan in CI, and
production readiness are operational gates, not claims made by this local
verification.

This record is not production rollout, provider selection, migration execution,
commit/push, or go-live approval.
