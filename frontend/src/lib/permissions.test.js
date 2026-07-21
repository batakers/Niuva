import { ADMIN_ROUTE_PERMISSIONS, hasPermission } from "./permissions";


test("allows an explicit permission", () => {
  expect(hasPermission({ permissions: ["users.read"] }, "users.read")).toBe(true);
});


test("allows the super-admin wildcard", () => {
  expect(hasPermission({ permissions: ["*"] }, "roles.manage")).toBe(true);
});


test("denies missing users and permissions", () => {
  expect(hasPermission(null, "users.read")).toBe(false);
  expect(hasPermission({ permissions: [] }, "users.read")).toBe(false);
});


test("never infers authority from an untrusted role string", () => {
  expect(hasPermission({ role: "super_admin" }, "roles.manage")).toBe(false);
  expect(hasPermission({ role: "operations", permissions: [] }, "inventory.write")).toBe(false);
});

test("denies malformed permissions instead of treating a role-like string as authority", () => {
  expect(hasPermission({ permissions: "*" }, "roles.manage")).toBe(false);
});

test("maps catalog, material, and inventory routes to exact permissions", () => {
  expect(ADMIN_ROUTE_PERMISSIONS["/admin/catalog"]).toBe("catalog.read");
  expect(ADMIN_ROUTE_PERMISSIONS["/admin/materials"]).toBe("materials.read");
  expect(ADMIN_ROUTE_PERMISSIONS["/admin/inventory"]).toBe("inventory.read");
  expect(ADMIN_ROUTE_PERMISSIONS["/admin/stock-movements"]).toBe("inventory.read");
  expect(ADMIN_ROUTE_PERMISSIONS["/admin/restock-alerts"]).toBe("restock_alerts.read");
});
