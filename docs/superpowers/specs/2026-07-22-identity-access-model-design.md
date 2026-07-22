# Identity Access Model Amendment Design

**Status:** Proposed — approved design awaiting written-spec review

**Purpose:** Replace the over-granular internal role model with a balanced
three-person startup model, while correcting the identity foundation's
least-privilege migration, transactional-audit, and redaction gaps.

## Scope and boundaries

This design amends the Identity, RBAC, Organization, and Audit foundation. It
defines the target policy and migration safety requirements; it does not
implement the policy or amend the catalog workflow in this change.

- The transaction-capability foundation on `main` is a required dependency for
  access and organization mutations that must be audited atomically.
- The later Catalog amendment owns the CMS state machine and Supplier
  Foundation data model. This design only assigns their permission ownership.
- Customer roles remain separate from the three internal roles:
  `retail_customer` and `organization_customer` continue to have no internal
  administration authority.
- No legacy account receives elevated authority automatically.

## Internal role model

The runtime keeps `super_admin` as the stable technical identifier and labels
it **Owner** in user-facing administration. It has unrestricted authority.
The two normal internal roles are `operations` and `commercial_finance`.

| Role | Normal business ownership | Authority boundary |
|---|---|---|
| `super_admin` / Owner | Governance, security, user access, audit, exceptions, and emergency recovery | May perform every action in every domain. Its actions remain audited. |
| `operations` | Catalog drafts, content/media, materials, routine inventory, production, quality control, fulfillment, and operational order status | Cannot manage users/roles, inspect full audit events, access supplier or internal-price data, or execute payment/refund actions. |
| `commercial_finance` | Customers and organizations, quotations, pricing, Supplier Foundation, invoices, payments, refunds, catalog review, publication, scheduling, and archiving | Cannot manage users/roles, inspect full audit events, change inventory, or change production/fulfillment state. |

Each active internal user normally has exactly one of these internal roles. A
future expansion may split a role or allow carefully justified combinations,
but only through the policy-change process below. `super_admin` is the only
unrestricted role.

## Permission matrix

| Area / action | Owner | Operations | Commercial & Finance |
|---|:---:|:---:|:---:|
| User, role, and access-review management | Manage | — | — |
| Full audit log, security configuration, and recovery | Manage | — | — |
| Customer and organization records | Manage | Read for order fulfilment | Manage |
| Quotations, pricing, suppliers, and purchasing | Manage | Read only where operationally needed | Manage |
| Catalog draft, content, and media | Manage | Manage | Review only |
| Catalog review, publish, schedule, and archive | Manage | Submit for review | Manage |
| Material specifications and routine inventory movement | Manage | Manage | Read availability only |
| Production, quality control, fulfilment, and operational order status | Manage | Manage | Read status only |
| Invoice, payment, and refund | Manage | Read safe status only | Manage |
| Emergency override | Manage | — | — |

Routine inventory movement means receipt, reservation/release linked to normal
fulfilment, and consumption/production movement. A manual reconciliation
correction is an Owner exception; it must state a constrained reason code and
be audited in the same transaction.

The ordinary CMS flow is `operations` draft and submit, followed by
`commercial_finance` review and publish/schedule. The Owner may perform every
step when an exception or emergency requires it. The later Catalog amendment
must enforce that an Operations user cannot review or publish their own draft
in the ordinary flow.

## Least-privilege migration

The current legacy mapping of `role: "admin"` directly to `super_admin` is
removed. A role resolver must never fall back to a legacy elevated role when
an account has been marked for review.

### Required account states

| State | Effective internal permissions | How it is resolved |
|---|---|---|
| `access_review_required` | None | An Owner explicitly assigns one approved role after review. |
| `approved` | Permissions of the assigned canonical role | Normal operation. |
| `disabled` | None | Account is unable to use authenticated application access. |

Migration requirements:

1. Existing low-privilege legacy `client` users remain compatible as
   `retail_customer`.
2. Every legacy `admin` and every existing account with a superseded internal
   role is reported by a dry-run and placed into
   `access_review_required` on apply, unless an explicit Owner bootstrap
   assignment approves it first.
3. The apply command must require an explicit, reviewed bootstrap Owner
   assignment so the system cannot lock out all access administrators.
4. The migration must retain historical role values only as migration evidence;
   they must grant no runtime permissions after review is required.
5. Existing elevated sessions or tokens must be rejected or refreshed after an
   access-policy change. Claims in an old token are not authority to retain a
   removed permission.
6. Dry-run output is aggregate and safe: counts, opaque identifiers where
   needed for remediation, policy version, and failures. It does not emit
   credentials, tokens, supplier data, or arbitrary user snapshots.

## Atomic access and organization audit

Every mutation of role, access-review state, organization, or organization
membership uses the transaction executor and writes its audit event in the
same MongoDB transaction/session.

```text
authorize Owner
  -> start transaction
  -> change target document
  -> append safe audit event in the same session
  -> commit both, or abort both
```

If transaction capability is unavailable, the mutation fails closed with the
existing stable `503 transaction_unavailable` contract. If the audit write
fails, the access or organization mutation must not persist. The implementation
uses the central executor's existing retry and unknown-commit reconciliation
rules; it must not introduce a separate retry policy.

## Default-deny audit data

Audit records are immutable and visible in full only to `super_admin`. They
store explicit event projections, not raw `before` or `after` documents.

Access-policy events may contain only:

- actor user identifier;
- action, target type, and target identifier;
- prior and resulting canonical role, access-review state, and status;
- a constrained `reason_code` such as `role_review_approved`,
  `role_access_removed`, or `emergency_override`;
- policy version and timestamp.

Organization events may contain only identifiers, safe lifecycle state, and
the same event metadata. They do not copy organization documents, membership
profiles, or free-text fields.

The audit projection rejects all unlisted fields. The global sensitive-field
defense remains in place and explicitly includes passwords, password hashes,
tokens, secrets, supplier data, `supplier_reference`, internal notes, internal
costs, margins, profits, payment data, bank details, and arbitrary free-text
reason values.

## Policy-change lifecycle

Role policy is versioned and deliberately changeable. A change such as splitting
`operations`, adding a permission, or retiring a role follows this sequence:

1. Propose a spec and implementation plan containing a permission-matrix diff.
2. Identify whether the change grants, removes, or merely renames authority.
3. Add focused authorization, redaction, token/session, and migration tests.
4. Run a dry-run that reports affected accounts without exposing sensitive data.
5. Obtain Owner approval for any authority grant and record the policy version.
6. Apply the migration transactionally where applicable; audit each explicit
   account assignment.
7. Verify removed permissions cannot be used by new or previously issued
   elevated sessions, then retain a tested rollback path.

No policy migration may automatically move a user to a more privileged role.
A new role begins with no assigned users. When the team grows, the documented
process can split `operations` into, for example, catalog and warehouse roles
without rebuilding the authorization system.

## Validation requirements for the implementation plan

The later implementation plan must include tests proving:

- `super_admin` can perform every permissioned action;
- Operations and Commercial & Finance have exactly the matrix boundaries above;
- Operations cannot review/publish its own catalog draft in the normal CMS
  flow;
- legacy `admin` and superseded internal roles receive no elevated permission
  before an explicit Owner assignment;
- an approved bootstrap Owner prevents administrator lockout;
- role/access/organization changes and their audit events commit or abort
  together on a real replica set;
- unavailable transaction capability produces no mutation and the stable 503
  contract;
- audit output contains only the allowlisted event projection and rejects
  `supplier_reference`, notes, credentials, payment data, and free-text
  reasons;
- role removal invalidates or re-evaluates previously elevated sessions; and
- an approved policy change can be dry-run, applied, and rolled back safely.

## Alternatives rejected

- **Retain ten operational roles:** too costly for a three-person startup and
  difficult to review consistently.
- **Use only Owner and Staff:** simple, but combines operations, supplier,
  pricing, and financial authority too broadly.
- **Map legacy admins to Owner automatically:** violates least privilege and
  makes stale or misunderstood accounts fully privileged.
- **Keep generic audit snapshots with an expanded denylist:** a future field can
  still be missed; explicit allowlisted event projections are safer.
