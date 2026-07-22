import {
  accessStateLabel,
  accountStatusLabel,
  internalRoles,
  reasonCodes,
  roleLabels,
  safeAuditEvent,
} from "./identityAccess";

const policy = {
  roles: [
    {
      role: "super_admin",
      label: "Owner",
      kind: "internal",
      permissions: ["*"],
    },
    {
      role: "operations",
      label: "Operations",
      kind: "internal",
      permissions: ["inventory.write"],
    },
    {
      role: "retail_customer",
      label: "Retail Customer",
      kind: "customer",
      permissions: [],
    },
  ],
  access_reason_codes: [
    { code: "role_review_approved", label: "Approve access review" },
    { code: "role_access_removed", label: "Remove access" },
  ],
};

test("uses server role labels and exposes only one internal role catalog", () => {
  expect(internalRoles(policy)).toEqual([
    policy.roles[0],
    policy.roles[1],
  ]);
  expect(roleLabels({ roles: ["super_admin"] }, policy)).toEqual(["Owner"]);
  expect(roleLabels({ roles: ["unknown"] }, policy)).toEqual(["Unknown role"]);
});

test("exposes only server supplied reason codes and separate account states", () => {
  expect(reasonCodes(policy)).toEqual(policy.access_reason_codes);
  expect(reasonCodes({ access_reason_codes: [{ code: "unsafe" }] })).toEqual([]);
  expect(accountStatusLabel("active")).toBe("Active");
  expect(accountStatusLabel("disabled")).toBe("Disabled");
  expect(accessStateLabel("approved")).toBe("Approved");
  expect(accessStateLabel("access_review_required")).toBe("Access review required");
});

test("projects audit events to the documented allowlist", () => {
  const view = safeAuditEvent({
    id: "audit-1",
    actor_user_id: "owner-1",
    actor_email: "private@example.com",
    action: "user.access_updated",
    target_type: "user",
    target_id: "user-2",
    previous: {
      roles: ["retail_customer"],
      access_state: "approved",
      status: "active",
      email: "private@example.com",
    },
    result: {
      roles: ["operations"],
      access_state: "approved",
      status: "active",
      reason: "free text",
    },
    reason_code: "role_review_approved",
    policy_version: "2026-07-22-v1",
    created_at: "2026-07-22T00:00:00+00:00",
    before: { password_hash: "secret" },
    after: { token: "secret" },
    reason: "free text",
  });

  expect(view).toEqual({
    id: "audit-1",
    actor_user_id: "owner-1",
    action: "user.access_updated",
    target_type: "user",
    target_id: "user-2",
    previous: {
      roles: ["retail_customer"],
      access_state: "approved",
      status: "active",
    },
    result: {
      roles: ["operations"],
      access_state: "approved",
      status: "active",
    },
    reason_code: "role_review_approved",
    policy_version: "2026-07-22-v1",
    created_at: "2026-07-22T00:00:00+00:00",
  });
});

test("maps generic audit snapshots to the audit dialog projection shape", () => {
  const before = { sku: "NIV-001", status: "active" };
  const after = { sku: "NIV-001", status: "archived" };

  expect(safeAuditEvent({
    id: "audit-catalog-1",
    actor_user_id: "owner-1",
    action: "catalog.product_archived",
    target_type: "product",
    target_id: "product-1",
    created_at: "2026-07-22T00:00:00+00:00",
    before,
    after,
  })).toEqual({
    id: "audit-catalog-1",
    actor_user_id: "owner-1",
    action: "catalog.product_archived",
    target_type: "product",
    target_id: "product-1",
    created_at: "2026-07-22T00:00:00+00:00",
    previous: before,
    result: after,
  });
});
