# DEC-OPS-002 — Admin Scope Reduction

ID: `DEC-OPS-002`
Title: Admin Scope Reduction
Status: **Approved Decision**
Decision date: 26 July 2026
Decision source: Explicit user decisions recorded during admin CMS redesign session, 26 July 2026.
Branch: `feat/admin-cms-redesign`

Amendment: `DEC-ACCESS-002`, approved 26 July 2026, rebuilds only the
Super Admin staff-invitation, role-assignment, deactivation, and reactivation
surface. Organization management UI, Internship, the full Audit viewer, and
Restock navigation remain unchanged.

## Context

During the Admin CMS/Backoffice redesign the following features were identified as out of current operational scope:

- **Internship management** — not part of the commerce or operational platform.
- **Organization management UI** — admin UI for organizations; the `organization_customer` role and underlying data remain valid, only the management surface was removed.
- **Role management** — the Edit Access dialog, role catalog endpoint, access-policy endpoint, and role-change mutation; no current operational need exists for runtime role assignment beyond initial provisioning.
- **Audit log viewer** — a full audit-event viewer exposes internal traceability data without a defined consumption model; audit *writing* continues uninterrupted.
- **Restock Alerts as sidebar page** — replaced with a header notification bell popup for ambient awareness; the full resolve/reason workflow page is preserved but removed from persistent navigation.

Removing these features reduces maintenance surface, focuses the admin on commerce and content operations, and aligns with the principle that features should exist only when actively needed.

## Decision

### Removed

| Feature | Frontend | Backend | Data |
|---|---|---|---|
| Internship | `Internships.jsx`, route, nav, i18n, dashboard stat | `POST /internships`, `GET /admin/internships`, `InternshipReq` model, `interns` stat field | Collections untouched (non-destructive) |
| Organization management | `Organizations.jsx`, route, nav group, i18n | `organization_routes.py` (all endpoints: `GET /admin/organizations`, `POST /admin/organizations`, `GET /organizations/mine`), permission matrix keys `organizations.*` | Existing records remain archived; startup must not recreate active organization collections |
| Role management (original scope) | The former operational Edit Access dialog and aggregate three-role selector remain removed. `DEC-ACCESS-002` authorizes a new Super Admin-only granular invitation and access-governance surface. | The former aggregate-role endpoints remain removed. New bounded identity-governance APIs must follow `DEC-ACCESS-002`. | — |
| Audit viewer | `AuditLog.jsx`, route, nav, i18n, `safeAuditEvent`/`safeAuditProjection` utilities | `GET /admin/audit-events` | — |
| Restock sidebar nav entry | Sidebar link removed | — | — |

### Added

| Feature | Description |
|---|---|
| Notification bell | `NotificationBell.jsx` in admin header; badge count + popover list consuming `GET /api/notifications`; HTML-tag-safe rendering via regex strip |

### Preserved (explicitly untouched)

| Component | Reason |
|---|---|
| `append_audit_event` / `append_identity_audit_event` | Audit write path; internal traceability continues |
| `list_users` (`GET /admin/users`) | User directory; operational need confirmed |
| `provision_client` (`POST /admin/users`) | Only account-creation path (public registration disabled) |
| `organization_customer` role in `permissions.py` | Valid customer segment; only admin UI removed |
| Restock resolve/reason page (`/admin/restock-alerts`) | Full workflow preserved, accessed via bell popup |
| RBAC enforcement (`has_permission`, `require_permission`) | Authorization layer fully intact |
| `audit_events`, `restock_alerts`, `users` collections | No data deletion |
| Portfolio, Content (Konten), Inquiry (Contacts) pages | Explicitly kept, no changes |

## Consequences

1. **Role management is governance-only.** `DEC-ACCESS-002` authorizes a
   Super Admin-only internal invite and granular access-management workflow.
   Customer provisioning remains a separate operation.
2. **Audit events accumulate without a viewer.** A viewer can be rebuilt when a defined consumption model is approved.
3. **Organization archive is an explicit postponement.** Existing
   `organizations` and `organization_memberships` records are preserved and
   inventoried as an archived namespace, not treated as active schema. Startup
   must not recreate these collections or their indexes. Moving, deleting, or
   otherwise cleaning up archived records remains a separately approved,
   non-destructive migration. `internships` cleanup is likewise separate.
4. **`DEC-ACCESS-001` is unaffected.** The granular internal role model remains canonical; removing the three-role Edit Access UI does not change the role direction.

## Supersedes

- Statements in prior plans or specs that assume Internship, Organization
  management, operational-staff role-change UI, or Audit viewer are part of the
  active Admin surface. The bounded Super Admin governance amendment in
  `DEC-ACCESS-002` remains authoritative.
- Does NOT supersede `DEC-OPS-001` (operational experience direction remains fully in effect) or `DEC-ACCESS-001` (granular role boundary).

## Verification

- 268/268 backend tests pass (3 pre-existing topology-dependent failures unrelated to this work).
- 49/49 frontend unit tests pass (1 pre-existing `react-router-dom` resolution failure in `ProtectedRoute.test.jsx` unrelated to this work).
- No dead references to removed features found in final grep sweep.
- `python -c "import server"` succeeds.
