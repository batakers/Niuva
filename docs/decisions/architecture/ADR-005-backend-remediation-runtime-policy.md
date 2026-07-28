# ADR-005 — Backend Remediation Runtime Policy

Status: **Approved Implementation Decision with Needs Clarification**
Decision date: 27 July 2026
Decision source: Explicit approval of the “NIUVA Backend Remediation dan
Retail Discovery Plan”, 27 July 2026.
Scope: Backend remediation and the read-only Retail discovery slice only.

Clarification boundary: The bounded approval remains in force, but the
password-rule wording must be reconciled with `DEC-AUTH-004`, the universal
session/route/response wording with Admin-specific `DEC-AUTH-005`, and any
cursor-pagination scope beyond public catalog reads before the affected scope
is interpreted or extended. See `docs/decisions/DECISION_REGISTER.md` and
`docs/context/DOCUMENT_REGISTER.md` for the recorded consequences.

## Context

Earlier records deliberately left session, password, limiter, first-Retail-slice,
and protected-scope implementation decisions open. The approved remediation plan
now resolves those items for this bounded implementation. It does not resolve
payment, checkout, production storage, Organization Portal, production rollout,
or go-live.

## Decision

### Authentication and abuse control

- `/api/auth/login` is customer-only and `/api/auth/admin/login` is staff-only.
- Login returns `{user}` and sets HttpOnly access and refresh cookies. Bearer
  sessions issued before cutover are invalid.
- Access sessions last 15 minutes. Refresh sessions last seven absolute days,
  rotate once per use, store only token hashes in MongoDB, and are revocable.
- Cookie-authenticated mutations require the CSRF header/cookie pair.
- Password reset tokens are atomic and single-use; reset revokes all user
  sessions.
- MongoDB is the approved atomic limiter store for this implementation:
  5 attempts per normalized account identifier and 20 attempts per peer IP in
  15 minutes. Forwarded headers are ignored unless explicitly trusted.
- Passwords must contain 12–72 UTF-8 bytes. No provider or organization-wide
  password product policy is inferred beyond this application constraint.
- A fresh deployment creates exactly one configured, valid `super_admin`.
  Startup never changes an existing account password.

This limiter decision supersedes the deferral in `DEC-AUTH-002` only for the
runtime and thresholds listed above. The older record remains historical
evidence of the prior decision state.

### Data and business invariants

- Mutation groups that span collections use the approved MongoDB transaction
  boundary and fail closed when it is unavailable.
- CMS, settings, portfolio, and sensitive identity mutations use
  expected-version compare-and-swap and record a reason.
- Public CMS and portfolio reads use immutable publication snapshots.
- Quote acceptance records approver identity, accepted time, channel, evidence
  reference, actor, reason, and accepted revision. Generic one-click transition
  to `accepted` is prohibited.
- Cumulative Work Order quantities cannot exceed the accepted Quote line
  quantities.
- Growing public catalog reads use cursor pagination.

### Owner clarification — 28 July 2026

The owner approved the following reconciliation details after reviewing the
initial implementation:

- `catalog_manager` may create/edit draft prices and submit a publication
  candidate. Only `manager_approver` may publish, roll back publication, or
  perform a price override. Additive multi-role accounts retain both
  permissions, and every sensitive action is audited. Older wording that lets
  Catalog Manager publish directly is superseded.
- A Quote version may contain the same `variant_id` on multiple rows. Every row
  has a unique `quote_line_id`; a Work Order references both
  `source_quote_version_id` and `quote_line_id`, and the cumulative cap is
  enforced independently per exact line.
- Authorized CMS staff may create, edit, archive/restore, and order capability
  blocks. Delete means archive/soft delete. A slug is unique and stable when a
  title changes. Public publication still requires `manager_approver`.
- Migration 007 backup evidence must include environment, database, timezone-
  aware backup time, checksum algorithm/value, credential-free location,
  reviewer, passed restore test, and approval window, all explicitly bound to
  Migration 007. A backup without a restore test is insufficient.
- Historical portfolio version order is unknown. Migration preflight must stop
  on empty, duplicate, non-sequential, or ambiguously active revision history;
  it may not assume the last embedded element is authoritative.
- NIV-001 remains `open` / verification pending. Historical credentials remain
  at risk until reviewed rotation/revocation evidence exists, and history
  rewrite still needs separate destructive-operation approval.

### Capability boundary

- The first Retail slice is read-only catalog discovery with a secondary,
  clearly discoverable Homepage/navigation entry.
- Product listing/detail may expose only published products, active variants,
  approved price display, safe availability, and CTA state.
- Retail order creation, cart, checkout, payment, fulfillment, reservation, and
  upload remain inactive.
- Legacy order creation and mutation are compatibility-read-only.
- Production upload/storage, payment, Organization Portal, organization
  management, and go-live remain inactive.
- Readiness returns HTTP 503 when any required dependency or enabled capability
  is not ready.

### Organization archive

- Existing organization data is preserved as archived data.
- Organization feature namespaces are not active application schema and must not
  be created by startup.
- No organization data is deleted, renamed, or migrated by this decision.

## Consequences

- Existing users must log in again at cutover.
- Auth frontend and backend must deploy atomically because cookie/CSRF contracts
  change together.
- Schema migration 007 requires backup evidence, dry-run review, idempotent
  apply, validation, and rollback rehearsal on a clone.
- Historical records that violate new invariants require reviewed compatibility
  mapping; they are never silently overwritten.
- The React Router RSC-only advisory is not reachable in this SPA
  `BrowserRouter` deployment. It remains tracked until an upstream version
  closes the advisory without reopening older router vulnerabilities or the
  frontend toolchain is migrated.

## Explicitly not authorized

- Payment gateway/provider selection or activation
- Cart, checkout, refund, return, shipping, or fulfillment policy
- Production object-storage provider or upload activation
- Organization Portal or active organization collections
- Production migration execution, rollout, history rewrite, or go-live

## Verification required

- Auth/CSRF/refresh-replay/reset/limiter/role-negative tests
- Migration dry-run/idempotence/duplicate-preflight tests
- Real replica-set transaction tests
- Frontend integration/build and Retail error-state tests
- Readiness, worker lease/retry, file ownership, CSV, and capability tests
- Redacted dependency and credential-hygiene evidence
