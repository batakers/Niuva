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
});
