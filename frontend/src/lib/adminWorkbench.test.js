import {
  ADMIN_MENU_GROUPS,
  getRoleHome,
  visibleAdminMenuGroups,
} from "./adminWorkbench";

describe("Admin workbench information architecture", () => {
  test("uses the approved operational groups", () => {
    expect(ADMIN_MENU_GROUPS.map((group) => group.label)).toEqual([
      "admin.group.workHome",
      "admin.group.salesDelivery",
      "admin.group.productsProduction",
      "admin.group.publishing",
      "admin.group.governance",
    ]);
  });

  test("filters every menu item by additive permissions", () => {
    const groups = visibleAdminMenuGroups({
      permissions: ["inquiries.read", "inventory.read"],
    });
    const paths = groups.flatMap((group) => group.items.map((item) => item.path));

    expect(paths).toEqual([
      "/admin/inquiries",
      "/admin/contacts",
      "/admin/inventory",
      "/admin/stock-movements",
    ]);
  });

  test("maps a multi-role user to a useful work-home queue", () => {
    const home = getRoleHome({
      roles: ["warehouse", "quality_control"],
      permissions: ["inventory.read", "orders.read"],
    });

    expect(home.labelKey).toBe("admin.roleHome.warehouse");
    expect(home.queuePaths).toContain("/admin/inventory");
  });

  test("keeps super admin governance explicit", () => {
    expect(getRoleHome({ roles: ["super_admin"], permissions: ["*"] })).toEqual(
      expect.objectContaining({
        labelKey: "admin.roleHome.superAdmin",
        queuePaths: expect.arrayContaining(["/admin/users"]),
      })
    );
  });

  test("never treats the legacy order archive as an active role-home queue", () => {
    for (const role of [
      "super_admin",
      "manager_approver",
      "warehouse",
      "quality_control",
      "sales_estimator",
      "order_admin",
      "catalog_manager",
      "content_editor",
      "production",
      "designer_engineer",
      "finance",
    ]) {
      expect(
        getRoleHome({ roles: [role], permissions: ["*"] }).queuePaths,
      ).not.toContain("/admin/orders");
    }
  });

  test("uses the canonical Retail queue for order work", () => {
    const home = getRoleHome({
      roles: ["order_admin"],
      permissions: ["orders.read", "customers.read"],
    });

    expect(home.queuePaths).toContain("/admin/retail-orders");
    expect(home.queuePaths).not.toContain("/admin/orders");
  });
});
