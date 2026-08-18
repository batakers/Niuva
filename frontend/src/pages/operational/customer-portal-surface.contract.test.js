const fs = require("fs");
const path = require("path");

const operationalDir = __dirname;
const srcDir = path.resolve(__dirname, "../..");

function read(relativePath) {
  return fs.readFileSync(path.join(operationalDir, relativePath), "utf8");
}

const dashboardSource = read("ClientDashboard.jsx");
const detailSource = read("OrderDetail.jsx");
const newOrderSource = read("NewOrder.jsx");
const stepperSource = fs.readFileSync(
  path.join(srcDir, "components/operational/StatusStepper.jsx"),
  "utf8",
);
const navbarSource = fs.readFileSync(
  path.join(srcDir, "components/layout/Navbar.jsx"),
  "utf8",
);
const operationalNavigationSource = fs.readFileSync(
  path.join(srcDir, "components/layout/OperationalNavigation.jsx"),
  "utf8",
);
const appSource = fs.readFileSync(path.join(srcDir, "App.js"), "utf8");

describe("Customer Portal design-system contract", () => {
  test("retains the approved protected compatibility routes", () => {
    expect(appSource).toContain(
      '<Route path="/dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />',
    );
    expect(appSource).toContain(
      '<Route path="/order" element={<ProtectedRoute><NewOrder /></ProtectedRoute>} />',
    );
    expect(appSource).toContain(
      '<Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />',
    );
  });

  test("keeps legacy order reads and controlled download free of mutations", () => {
    expect(dashboardSource).toContain('.get("/orders")');
    expect(detailSource).toContain('.get(`/orders/${id}`)');
    expect(detailSource).toContain('`/orders/${order.id}/design-file`');
    expect(`${dashboardSource}\n${detailSource}\n${newOrderSource}`).not.toMatch(
      /api\.(post|put|patch|delete)\(/,
    );
  });

  test("keeps dependency and access-boundary outcomes customer-safe", () => {
    expect(dashboardSource).toContain("invalid_orders_projection");
    expect(detailSource).toContain('"forbidden"');
    expect(detailSource).toContain('"not_found"');
    expect(detailSource).toContain(
      'state={boundaryState ? "unavailable" : "error"}',
    );
    expect(detailSource).not.toContain("error.response.data.detail");
  });

  test("does not render ambiguous legacy notes or internal projection fields", () => {
    expect(detailSource).not.toContain("order.notes");
    expect(detailSource).not.toContain("order.estimate.note");
    expect(detailSource).not.toContain("internal_notes");
    expect(detailSource).not.toContain("supplier");
    expect(detailSource).not.toContain("margin");
  });

  test("provides deliberate desktop and mobile order-history structures", () => {
    expect(dashboardSource).toContain('data-testid="orders-table"');
    expect(dashboardSource).toContain('data-testid="orders-mobile-list"');
    expect(dashboardSource).toContain("hidden md:block");
    expect(dashboardSource).toContain("md:hidden");
  });

  test("uses shared surfaces without pseudo-terminal presentation", () => {
    const migratedSource = [
      dashboardSource,
      detailSource,
      newOrderSource,
      stepperSource,
    ].join("\n");

    expect(migratedSource).toContain("SurfacePanel");
    expect(migratedSource).toContain("OperationalState");
    expect(migratedSource).not.toMatch(
      /font-mono-tech|TerminalSquare|\/\/ DASHBOARD|rounded-(?:sm|md|lg|xl|2xl|3xl)/,
    );
  });

  test("separates operational navigation from public marketing navigation", () => {
    expect(navbarSource).toContain("<OperationalNavigation");
    expect(navbarSource).toContain("<PublicNavigation");
    expect(navbarSource).toContain('t("nav.customerOrders")');
    expect(navbarSource).toContain('t("nav.site")');
    expect(operationalNavigationSource).toContain("onClick={onSignOut}");
    expect(operationalNavigationSource).not.toContain("PUBLIC_NAVIGATION_LINKS");
  });
});
