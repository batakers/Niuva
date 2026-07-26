const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(
  path.join(__dirname, "AdminDashboard.jsx"),
  "utf8"
);

describe("Admin Work Home contract", () => {
  test("uses role-aware queues and the Operational Spine anchor", () => {
    expect(source).toContain("getRoleHome(user)");
    expect(source).toContain('data-testid="operational-spine"');
    expect(source).toContain("roleHome.queuePaths");
  });

  test("does not lead with a generic KPI card grid", () => {
    expect(source).not.toContain("<StatCard");
    expect(source).not.toContain("<ActionCard");
  });
});
