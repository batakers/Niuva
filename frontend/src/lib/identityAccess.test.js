import {
  accountStatusLabel,
  safeAuditEvent,
} from "./identityAccess";

test("exposes account status labels", () => {
  expect(accountStatusLabel("active")).toBe("Active");
  expect(accountStatusLabel("disabled")).toBe("Disabled");
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
