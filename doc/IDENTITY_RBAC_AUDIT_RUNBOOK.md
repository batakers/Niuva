# Identity Access Policy Migration and Audit Runbook

## 1. Scope and invariants

This runbook governs the versioned identity policy, migration `003`, rollback,
Owner recovery, and identity/organization audit handling. It does not authorize
production rollout, direct database elevation, or changes to CMS, Supplier,
payment, or organization workflows.

The non-negotiable invariants are:

- **Owner** is the product label for canonical role `super_admin`.
- An approved internal account has exactly one internal platform role.
- Customer roles are separate from internal roles and never grant Admin Studio
  authority.
- Legacy or superseded internal markers are fail-closed and require review.
- Exactly one opaque account ID is explicitly selected as the reviewed
  bootstrap Owner. Verified current-policy canonical Owners with no legacy
  marker or evidence remain unchanged. The final invariant is at least one
  active, approved Owner, and later changes preserve it through the guarded
  access-management path.
- `TRANSACTION_MUTATIONS_ENABLED=true` never bypasses the database capability
  probe. Both the flag and transaction capability must be ready.

## 2. Approved access model

| Canonical role | Product label | Class | Main boundary |
|---|---|---|---|
| `super_admin` | Owner | Internal | Full policy administration and final-Owner responsibility |
| `operations` | Operations | Internal | Operational drafts, material, inventory, production, QC, fulfilment |
| `commercial_finance` | Commercial & Finance | Internal | Customers, organizations, commercial pricing, publication, payment |
| `retail_customer` | Retail Customer | Customer | Own Retail resources only; no Admin Studio permission |
| `organization_customer` | Organization Customer | Customer | Active organization memberships only; no Admin Studio permission |

Organization membership roles (`owner`, `project_pic`, `approver`, `finance`,
and `viewer`) are customer-side responsibilities. They never grant an internal
platform role. Organization `owner` is not the platform **Owner** label.

Access state meanings:

| `access_state` | Meaning |
|---|---|
| `approved` | The single canonical role has completed review and may resolve permissions while status is active |
| `access_review_required` | No internal role or permission resolves, regardless of historical role data |

Account `status` is separately `active` or `disabled`. Disabled accounts have
no effective permissions. Runtime account creation writes canonical `roles`,
`status`, `access_state`, and `role_policy_version`; it never creates legacy
`role: admin` or `role: client`. The configured startup administrator is only a
review-required candidate until migration explicitly selects that account as
bootstrap Owner.

## 3. Change control and prerequisites

Before any apply or rollback:

1. Open an approved maintenance/change ticket and record operator, reviewers,
   target database name, deployment revision, policy version, and window.
2. Stop or drain identity mutation traffic.
3. Create a full backup using the approved backup system. Verify that `users`,
   `audit_events`, and `identity_policy_state` can be restored into an isolated
   database. Do not continue with an untested backup.
4. Confirm `/api/health/ready` reports transaction readiness for the exact
   target environment.
5. Confirm the MongoDB capability probe reports a replica set and sessions.
6. Review the opaque account IDs from dry-run and record the one active account
   approved by the business and technical reviewers as bootstrap Owner.
7. Enable `TRANSACTION_MUTATIONS_ENABLED=true` only inside the approved window
   and only after readiness is healthy. The migration still probes capability
   and fails closed if transactions are unavailable.

Never print, paste, or attach database URIs, password hashes, tokens, secrets,
emails, or raw user documents to the ticket.

## 4. Safe dry-run

From `backend/`, with the target environment already selected:

```powershell
python migrations\003_identity_access_policy.py
```

Dry-run is the default. It performs reads only: no indexes, sessions, audit
events, or mutations. Output contains only:

- `policy_version`;
- aggregate `categories` counts;
- opaque `remediation_ids` where human review is required; and
- aggregate `failures` counts.

It never outputs emails, names, credentials, secrets, or raw documents. Review
the remediation IDs through the approved identity-review process. Do not infer
Owner eligibility from an old `admin`, `super_admin`, or other internal marker.

## 5. Apply procedure

After backup, readiness, maintenance approval, and reviewed Owner selection:

```powershell
$env:TRANSACTION_MUTATIONS_ENABLED = "true"
python migrations\003_identity_access_policy.py `
  --apply `
  --bootstrap-owner-id "<reviewed-opaque-user-id>"
```

Apply rejects a missing, unknown, or inactive bootstrap ID, a disabled mutation
flag, or unavailable transaction capability before indexes or data are written.
Indexes are prepared outside account transactions. Every affected account then
uses one guarded `retry_safe=False` transaction containing both its conditional
user update and its safe audit insert.

Classification is fail-closed:

- the explicit active bootstrap account becomes the one approved Owner;
- `role: admin`, any superseded internal `role`, superseded values in `roles`,
  and legacy markers are quarantined with `roles: []` and
  `access_review_required`, even if historical `roles` includes `super_admin`;
- original legacy role values move only to non-authoritative migration evidence
  and the live `role` field is removed;
- legacy `client` becomes approved `retail_customer` without internal authority;
- current-version canonical accounts without legacy markers/evidence remain
  unchanged.

The migration initializes/reconciles the singleton `identity_policy_state` and
the unique `identity_policy_state.key` guard index. It never uses manual
transactions, fallback writes, or one giant transaction.

## 6. Verification and idempotency

Run the same apply command a second time. Expected results:

- all accounts report current policy state;
- no account transaction or duplicate migration audit event is created;
- the reviewed bootstrap is active and approved, and at least one active,
  approved `super_admin` exists;
- every other historical internal identity is review-required;
- the policy singleton reports the actual approved Owner count and current
  policy version; and
- there is one `identity.policy_migrated` or
  `identity.bootstrap_owner_assigned` event per applied account.

Verify through approved read-only tooling or application-safe projections.
Never use a direct `mongosh` role update as a verification shortcut. Disable the
temporary mutation flag after the controlled window unless the environment has
separately approved ongoing guarded mutations.

## 7. Constrained rollback

Rollback is for migration-owned fields only and requires the same backup,
maintenance, active reviewed Owner, enabled flag, and capability safeguards:

```powershell
$env:TRANSACTION_MUTATIONS_ENABLED = "true"
python migrations\003_identity_access_policy.py `
  --rollback `
  --bootstrap-owner-id "<current-approved-owner-id>"
```

Each migration-owned rollback is a guarded per-account transaction with an
`identity.policy_migration_rolled_back` audit event in the same session.
Rollback removes migration-owned marker/evidence/policy fields and leaves every
affected identity with no role and `access_review_required`. It never restores
legacy `admin`, `super_admin`, or any other elevated runtime authority. An Owner
must later reassign access through the normal guarded and audited route.

After rollback, the policy singleton is reconciled to the actual remaining
approved Owner count. This is zero only when no verified current-policy Owner
was preserved outside the migration-owned scope. In that case the platform is
intentionally fail-closed until an approved break-glass/bootstrap procedure is
completed. A backup restore remains the recovery path for data outside the
migration-owned scope.

## 8. Break-glass Owner recovery

Direct emergency elevation in `mongosh` is prohibited.

When no approved Owner can operate:

1. Open an incident and obtain two-person approval from the business owner and
   technical owner.
2. Drain identity writes, create and verify a fresh backup, and confirm
   `/api/health/ready` transaction readiness.
3. Review an existing active account and record only its opaque ID as the
   bootstrap candidate.
4. Use the versioned migration/bootstrap command with the explicit ID, enabled
   mutation flag, capability probe, guarded transaction, and safe audit event.
5. Reconcile the account ID, policy singleton, and audit action before allowing
   administration.
6. Use the normal guarded access route for any further assignment or removal.
7. Attach safe event IDs and aggregate results to the incident. Do not attach
   raw account documents or credentials.

If transaction readiness cannot be established, keep access fail-closed and
restore an approved backup into a transaction-capable environment. The flag is
not an override and a direct database role assignment is not an alternative.

## 9. Audit contract and reconciliation

Identity and organization events contain exactly these envelope fields:

`id`, `actor_user_id`, `action`, `target_type`, `target_id`, `previous`,
`result`, `reason_code`, `policy_version`, and `created_at`.

User projections allow only canonical `roles`, `access_state`, and `status`.
Organization projections allow only their approved IDs, membership role, and
lifecycle state. Events exclude actor email, raw `before`/`after`, free-text
reason, names, legal/tax data, supplier references, membership profiles,
passwords/hashes, credentials, tokens, secrets, payment/bank fields, price,
cost, margin, profit, and internal notes. Unknown projection keys are rejected
before insert. Audit events are append-only.

For `transaction_commit_outcome_unknown`, do not retry or replay the mutation.
Record the operation name and safe target ID, then reconcile by checking:

1. the target account's current policy version and canonical state;
2. the matching safe audit action and target ID; and
3. `identity_policy_state` Owner count/version.

Escalate any mismatch as an incident. Never infer outcome from a client timeout
and never repair it with an unaudited database write.

## 10. Versioned policy lifecycle and ownership

Every policy change follows: requirements approval, new immutable policy
version, tests, safe audit allowlist review, read-only dry-run, reviewed
remediation IDs, transaction-ready apply, idempotency verification, and a
constrained rollback plan. Historical migrations `001` and `002` are immutable;
future changes use a new migration number.

| Responsibility | Accountable party |
|---|---|
| Approve role policy and bootstrap Owner | Business owner plus technical owner |
| Execute backup, migration, rollback, and reconciliation | Authorized technical operator |
| Review access and migration audit events | Current Owner and designated reviewer |
| Maintain transaction readiness and recovery evidence | Platform/operations owner |
| Approve later internal role assignments | Current approved Owner |

Handoff includes the current policy version, active approved Owner IDs, safe
event IDs, readiness evidence, tested backup/restore location, and outstanding
review-required opaque IDs. No secret value belongs in this runbook or Git.
