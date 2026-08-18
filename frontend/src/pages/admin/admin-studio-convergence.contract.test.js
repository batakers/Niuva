const fs = require("fs");
const path = require("path");

const read = (...segments) =>
  fs.readFileSync(path.resolve(__dirname, ...segments), "utf8");

const layoutSource = read("AdminLayout.jsx");
const dashboardSource = read("AdminDashboard.jsx");
const usersSource = read("Users.jsx");
const customersSource = read("Customers.jsx");
const productEditorSource = read("ProductEditor.jsx");
const ordersSource = read("Orders.jsx");
const badgeSource = read(
  "..",
  "..",
  "components",
  "ui",
  "badge.jsx",
);
const i18nSource = read("..", "..", "i18n.js");

describe("Admin Studio shell convergence", () => {
  test("keeps navigation role-aware and the mobile drawer inert when closed", () => {
    expect(layoutSource).toContain("visibleAdminMenuGroups(user)");
    expect(layoutSource).toContain('id="admin-navigation-drawer"');
    expect(layoutSource).toContain('inert={!desktopNav && !sidebarOpen');
    expect(layoutSource).toContain('aria-hidden={!sidebarOpen}');
    expect(layoutSource).toContain('aria-label={t("common.breadcrumb")}');
  });

  test("keeps legacy labels and their compatibility state readable", () => {
    expect(layoutSource).toContain("lg:w-72");
    expect(layoutSource).not.toContain("flex-1 truncate\">{t(label)}");
    expect(layoutSource).toContain("type-label text-text-secondary uppercase");
    expect(layoutSource).toContain("{t(badge)}");
  });

  test("keeps compact Admin controls and status text accessible", () => {
    expect(ordersSource).toContain(
      'aria-label={t("common.status")}',
    );
    expect(dashboardSource).not.toContain(
      'tabular-nums text-text-disabled',
    );
    for (const statusStyle of [
      "border-status-warning/40 bg-status-warning/15 text-text-primary",
      "border-signal/40 bg-signal/15 text-text-primary",
      "border-status-success/40 bg-status-success/15 text-text-primary",
      "border-destructive/40 bg-destructive/10 text-text-primary",
      "border-action-primary/40 bg-action-primary/10 text-text-primary",
    ]) {
      expect(badgeSource).toContain(statusStyle);
    }
  });

  test("does not restore pseudo-terminal presentation", () => {
    for (const source of [layoutSource, dashboardSource]) {
      expect(source).not.toContain("font-mono-tech");
      expect(source).not.toMatch(
        /SYS_ADMIN_CONSOLE|MODULE_LOADED|METRIC_ID|FETCHING_TELEMETRY|ACCESS_LEVEL/,
      );
    }
    expect(i18nSource).not.toContain(
      '"admin.operationalSpine": "Operational Spine"',
    );
    expect(usersSource).not.toMatch(/font-mono[^"\n]*text-action-primary/);
    expect(customersSource).not.toMatch(/font-mono[^"\n]*text-action-primary/);
    expect(dashboardSource).not.toContain(
      "font-mono text-xs tabular-nums text-text-primary",
    );
  });
});
describe("Admin Studio localization and form continuity", () => {
  test("localizes staff and customer page contracts in both languages", () => {
    for (const key of [
      "staff.subtitle",
      "staff.inviteDescription",
      "customers.subtitle",
      "customers.createDescription",
      "account.status.active",
      "account.status.disabled",
      "orders.legacyArchiveTitle",
    ]) {
      expect(i18nSource.match(new RegExp(`"${key}":`, "g"))).toHaveLength(2);
    }

    expect(usersSource).toContain('title={t("admin.users")}');
    expect(customersSource).toContain('title={t("admin.customers")}');
    expect(usersSource).toContain("<AccountStatusBadge");
    expect(customersSource).toContain("<AccountStatusBadge");
  });

  test("routes every Product Editor choice through the adopted Select contract", () => {
    expect(productEditorSource.match(/<EditorSelect\b/g)).toHaveLength(5);
    expect(productEditorSource).toContain("<SelectTrigger>");
    expect(productEditorSource).toContain("<SelectContent>");
    expect(productEditorSource).not.toMatch(/<select\b/);
    expect(productEditorSource).not.toContain("brand-field min-h-11");
    expect(productEditorSource).not.toContain("rounded-none");
    expect(productEditorSource).not.toContain(
      '<TechnicalLabel tone="destructive">',
    );
  });
});
