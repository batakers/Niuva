const fs = require("fs");
const path = require("path");

const {
  ADMIN_MENU_GROUPS,
  visibleAdminMenuGroups,
} = require("@/lib/adminWorkbench");
const { ADMIN_ROUTE_PERMISSIONS } = require("@/lib/permissions");

const read = (...segments) =>
  fs.readFileSync(path.resolve(__dirname, ...segments), "utf8");

const appSource = read("..", "..", "App.js");
const detailSource = read("RetailOrderDetail.jsx");
const i18nSource = read("..", "..", "i18n.js");
const badgeSource = read(
  "..",
  "..",
  "components",
  "operational",
  "StatusStepper.jsx"
);

// The canonical lifecycle, in order.
const RETAIL_STATUSES = [
  "created",
  "awaiting_payment",
  "paid",
  "file_review",
  "queued",
  "in_production",
  "quality_control",
  "ready_to_ship",
  "ready_to_pickup",
  "shipped",
  "picked_up",
  "completed",
];

describe("Retail order routes and navigation", () => {
  test.each(["/admin/retail-orders", "/admin/retail-orders/:id"])(
    "provides a deep-linkable %s route",
    (route) => {
      expect(appSource).toContain(`path="${route}"`);
    }
  );

  test("guards the retail surface with the order read scope", () => {
    expect(ADMIN_ROUTE_PERMISSIONS["/admin/retail-orders"]).toBe("orders.read");
  });

  test("registers retail ahead of the legacy order surface", () => {
    const group = ADMIN_MENU_GROUPS.find(
      (item) => item.label === "admin.group.salesDelivery"
    );
    const paths = group.items.map((item) => item.path);

    expect(paths).toContain("/admin/retail-orders");
    expect(paths.indexOf("/admin/retail-orders")).toBeLessThan(
      paths.indexOf("/admin/orders")
    );
  });

  test("keeps the legacy order surface badged as compatibility", () => {
    const group = ADMIN_MENU_GROUPS.find(
      (item) => item.label === "admin.group.salesDelivery"
    );
    const legacy = group.items.find((item) => item.path === "/admin/orders");
    const retail = group.items.find(
      (item) => item.path === "/admin/retail-orders"
    );

    expect(legacy.badge).toBe("admin.compatibility");
    // The canonical surface carries no compatibility badge.
    expect(retail.badge).toBeUndefined();
  });

  test("both order surfaces ride on the same read scope", () => {
    const paths = visibleAdminMenuGroups({
      permissions: ["orders.read"],
    }).flatMap((group) => group.items.map((item) => item.path));

    expect(paths).toEqual(
      expect.arrayContaining(["/admin/retail-orders", "/admin/orders"])
    );
  });
});

describe("Retail order detail surface", () => {
  test("shows the spine, blockers, items, version, and history", () => {
    expect(detailSource).toContain('data-testid="retail-order-spine"');
    expect(detailSource).toContain('data-testid="retail-order-items"');
    expect(detailSource).toContain("record.history");
    expect(detailSource).toContain("record.version");
  });

  test("keeps historical orders read-only", () => {
    expect(detailSource).toContain("Retail transaction inactive");
    expect(detailSource).not.toContain("/transitions");
    expect(detailSource).not.toContain("retail-action-");
  });

  test("names the suspended actions rather than hiding them", () => {
    expect(detailSource).toContain('data-testid="retail-suspended"');
    expect(detailSource).toContain("record.suspended_actions");
    expect(detailSource).toContain('t("retail.suspendedBody")');
  });

  test("offers no command even when the record advertises historical actions", () => {
    expect(detailSource).not.toContain("permitted_next_actions");
  });
});

describe("Retail order localization and status tones", () => {
  test("every canonical status has a label in both languages", () => {
    for (const status of RETAIL_STATUSES) {
      expect(
        i18nSource.match(new RegExp(`"status\\.${status}":`, "g"))
      ).toHaveLength(2);
    }
  });

  test("every canonical status has a distinct badge tone", () => {
    for (const status of RETAIL_STATUSES) {
      expect(badgeSource).toContain(`${status}:`);
    }
  });

  test("localizes the suspended-action copy in both languages", () => {
    for (const key of [
      "retail.suspendedTitle",
      "retail.suspendedBody",
      "retail.suspended.cancel",
      "retail.suspended.refund",
      "retail.suspended.return",
    ]) {
      expect(i18nSource.match(new RegExp(`"${key}":`, "g"))).toHaveLength(2);
    }
  });
});
