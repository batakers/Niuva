# Identity, RBAC, Organization, and Audit Runbook

## 1. Purpose and Scope

This runbook explains how to deploy, migrate, verify, recover, and hand over the NIUVA identity foundation. It covers:

- canonical platform roles and backend permissions;
- legacy `admin` and `client` compatibility;
- user status and role administration;
- B2B organizations and organization memberships;
- redacted audit events; and
- emergency access recovery.

It does not deploy CMS, catalog redesign, material pricing, inventory, payment gateway, or the future order/project redesign.

All commands in this document must be run from `backend/` unless another directory is stated. Never run `--apply` before confirming the target database and completing a restorable backup.

## 2. Role Matrices

### Platform roles

Platform roles control application permissions. A user can hold more than one platform role.

| Role | User class | Main permissions |
|---|---|---|
| `retail_customer` | Customer | No Admin Studio permission; access remains limited to the customer's own resources |
| `organization_customer` | Customer | No Admin Studio permission; organization access is granted separately by active membership |
| `content_editor` | Internal | Content and media read/write |
| `catalog_manager` | Internal | Catalog and pricing read/write |
| `warehouse` | Internal | Materials, inventory, and suppliers read/write |
| `order_admin` | Internal | Orders read/write, customer read, and notification write |
| `sales_estimator` | Internal | Inquiries and quotes read/write plus pricing and project read |
| `designer_engineer` | Internal | Designs read/write plus project and file read |
| `production` | Internal | Production read/write plus order, project, and inventory read |
| `quality_control` | Internal | Quality control read/write plus production, order, and project read |
| `finance` | Internal | Payments and invoices read/write, refund write, plus order and project read |
| `manager_approver` | Internal | User, organization, and audit read plus approval write and operational oversight reads |
| `super_admin` | Internal | Wildcard permission `*`; the only role that can assign platform roles |

Legacy documents remain compatible before migration:

- `role: admin` is interpreted as `super_admin`.
- `role: client` is interpreted as `retail_customer`.

### Organization member roles

Organization member roles describe a person's responsibility inside one B2B organization. They do not grant Admin Studio permissions.

| Member role | Intended responsibility |
|---|---|
| `owner` | Organization owner or highest customer-side authority |
| `project_pic` | Main project person in charge |
| `approver` | Customer-side approval authority |
| `finance` | Customer-side billing and payment contact |
| `viewer` | Read-only participant |

An organization customer can see an organization only when both the membership and organization are active. Archived memberships remain in history and are not hard-deleted.

## 3. Dry-run Migration

### Preflight

1. Use the deployment environment or an approved maintenance workstation.
2. Install the declared dependencies with `python -m pip install -r requirements.txt`.
3. Confirm that `MONGO_URL`, `DB_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `JWT_SECRET` come from the intended environment. Do not print secret values.
4. Print and verify only the target database name:

```powershell
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print(os.environ.get('DB_NAME', 'UNSET'))"
```

5. Confirm in writing that the database is non-production, or that an approved production maintenance window is active.

Run the read-only migration:

```powershell
python migrations\001_identity_rbac_audit.py
```

Expected output is JSON containing `"dry_run": true`. `scanned` is the number of legacy user documents found. `updated` is the number of documents that would be updated; dry-run does not persist those changes and does not create indexes.

## 4. Backup Prerequisite

Before applying the migration:

1. Record the target database name, maintenance ticket, operator, and timestamp.
2. Create a full MongoDB backup using the organization's approved backup process. A command-line example is:

```powershell
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
mongodump --uri $env:MONGO_URL --db $env:DB_NAME --out ".\backups\identity-$timestamp"
```

3. Verify the dump contains the `users` collection and any existing identity, organization, and audit collections.
4. Confirm the backup can be read by `mongorestore --dryRun` when supported, or restore it into an isolated verification database.
5. Store the backup outside the application checkout according to the company's retention policy.

Do not continue if the backup is missing, incomplete, or untested.

## 5. Apply Procedure

Run the migration with the explicit write flag:

```powershell
python migrations\001_identity_rbac_audit.py --apply
```

The apply operation:

- backfills canonical `roles` and `status` only on users without `roles`;
- uses a conditional single-document update so a concurrent migration cannot overwrite an already migrated user;
- creates the required unique and query indexes; and
- is idempotent.

Run the apply command a second time only as an idempotency check. It should report `scanned: 0` and `updated: 0`. If a unique index fails, stop and investigate duplicate IDs, emails, organizations, or memberships. Do not bypass the unique constraint.

## 6. Post-migration Verification

Run these checks in `mongosh` against the confirmed database:

```javascript
db.users.countDocuments({ roles: { $exists: false } })
db.users.countDocuments({ status: { $nin: ["active", "disabled"] } })
db.users.find({}, { _id: 0, id: 1, email: 1, role: 1, roles: 1, status: 1 }).limit(20)
db.users.getIndexes()
db.audit_events.getIndexes()
db.organizations.getIndexes()
db.organization_memberships.getIndexes()
```

Expected results:

- no user is missing `roles`;
- every user has `active` or `disabled` status;
- legacy admins have `roles: ["super_admin"]`;
- legacy clients have `roles: ["retail_customer"]`; and
- the identity, audit, organization, and membership indexes exist.

Then perform API smoke checks with approved test accounts:

1. A legacy admin can log in through `/api/auth/admin/login` and receives `roles`, `permissions`, and no `password_hash`.
2. A retail customer can log in through `/api/auth/login` and cannot access `/api/admin/*`.
3. Warehouse can access materials but cannot access users, organizations, audit, or unrelated order administration.
4. Manager/Approver can read users, organizations, and audit but cannot change roles.
5. Super Admin can change user access and organization membership.
6. A disabled user receives HTTP 403 on the next authenticated request.
7. `/api/organizations/mine` returns only organizations linked through the current user's active membership.

## 7. Rollback Procedure

Rollback restores the pre-migration backup. Do not attempt rollback by manually removing `roles`, `status`, organizations, memberships, or audit fields.

1. Stop application writes or place the platform in maintenance mode.
2. Record the failed deployment version and the last known good backup path.
3. Restore the verified backup into the target database using the organization's approved restore procedure. A command-line example is:

```powershell
mongorestore --uri $env:MONGO_URL --db $env:DB_NAME --drop ".\backups\identity-YYYYMMDD-HHMMSS\$env:DB_NAME"
```

4. Deploy the last known good application version.
5. Restart the application and verify legacy admin/client login, order ownership isolation, and file access.
6. Preserve the failed database snapshot and logs for incident review.

Because MongoDB is deployed as standalone, this package does not assume multi-document transactions. Restoring the known-good backup is the authoritative rollback.

## 8. Emergency Admin Studio Access Recovery

Use this procedure only when no approved staff account can enter Admin Studio.

1. Open an incident or maintenance ticket and obtain approval from the manager and technical owner.
2. Stop public writes and create a fresh backup.
3. Identify an existing, verified staff user by email. Never create or copy a password hash manually.
4. In `mongosh`, reactivate that verified account and assign the emergency role:

```javascript
db.users.updateOne(
  { email: "approved-recovery-email@example.com" },
  {
    $set: {
      roles: ["super_admin"],
      status: "active",
      updated_at: new Date().toISOString()
    }
  }
)
```

5. Log in, confirm `/api/auth/me` contains `super_admin` and wildcard permission, then use Admin Studio to save the intended long-term role assignment with a reason referencing the incident. This creates the normal audit event.
6. Remove emergency access when no longer needed and verify at least one active Super Admin remains.
7. Attach the database command, operator, approver, timestamps, and follow-up audit event ID to the incident record.

If no verified staff user exists, restore the last known good backup or use the organization's approved account-provisioning procedure. Do not insert an improvised password hash.

## 9. Audit Events and Sensitive-field Exclusions

Every identity and organization mutation writes an audit event containing:

- `id`;
- `actor_user_id` and `actor_email`;
- `action`;
- `target_type` and `target_id`;
- redacted `before` and `after` snapshots;
- `reason`; and
- UTC `created_at`.

Redaction is recursive. Audit snapshots exclude password fields, tokens, secrets, API keys, internal cost, margin, profit, supplier data, and internal notes. API responses must also exclude `password_hash` and must not expose internal cost, margin, supplier, profit, secret/token values, or internal notes.

Audit records are append-only operational history. Do not edit or delete them during normal administration.

## 10. Ownership and Handoff

| Responsibility | Owner |
|---|---|
| Assign and revoke platform roles | Super Admin |
| Review audit events and unusual access changes | Manager/Approver |
| Create and manage B2B organizations and memberships | Super Admin under the current permission policy |
| Execute migration, backup, restore, and deployment | Technical owner |
| Approve production maintenance and emergency access | Manager plus technical owner |
| Maintain role matrix and update this runbook when policy changes | Product/Business owner with technical owner review |

At handoff, the technical owner must receive the repository, deployment access, environment-variable ownership, backup location, recovery procedure, and a list of active Super Admin accounts. No secret value belongs in this runbook or in Git.
