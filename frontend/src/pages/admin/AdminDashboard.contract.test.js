const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(
  path.join(__dirname, "AdminDashboard.jsx"),
  "utf8"
);

describe("Admin Work Home contract", () => {
  test("uses role-aware queues and the work-priority anchor", () => {
    expect(source).toContain("getRoleHome(user)");
    expect(source).toContain('data-testid="operational-spine"');
    expect(source).toContain("roleHome.queuePaths");
  });

  test("does not lead with a generic KPI card grid", () => {
    expect(source).not.toContain("<StatCard");
    expect(source).not.toContain("<ActionCard");
  });

  test("distinguishes measured zero from an unsupported queue metric", () => {
    expect(source).toContain("const measured = Number.isFinite(count)");
    expect(source).toContain('t("admin.queueNeedsReview")');
    expect(source).toContain('t("admin.queueReviewRequired")');
    expect(source).toContain('path === "/admin/retail-orders"');
    expect(source).not.toContain('path === "/admin/orders"');
  });

  test("uses flat divided chart sections rather than repeated chart cards", () => {
    expect(source).toContain('aria-labelledby="dashboard-trends-title"');
    expect(source).toContain(
      'className="border-t border-border-default py-6 sm:py-8"',
    );
    expect(source).not.toContain(
      '<SurfacePanel className="p-4 sm:p-6">',
    );
  });
});
