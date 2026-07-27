const fs = require("fs");
const path = require("path");

const read = (...segments) =>
  fs.readFileSync(path.resolve(__dirname, ...segments), "utf8");

const dashboardSource = read("AdminDashboard.jsx");
const i18nSource = read("..", "..", "i18n.js");

describe("Charts state which figure they plot", () => {
  test("the plotted value is passed in, never inferred from the row shape", () => {
    expect(dashboardSource).toContain("value={totalForRow}");
    expect(dashboardSource).toContain("value={(row) => Number(row.signed_quantity)");
    // Inferring it would silently change meaning whenever a series gains a
    // field, and would add a signed quantity to a count of events.
    expect(dashboardSource).not.toContain("valueLabel ===");
  });

  test("stock movement plots the signed quantity, not the event count", () => {
    expect(dashboardSource).toContain("row.signed_quantity");
    expect(dashboardSource).not.toContain("totalForRow(row.stock");
  });
});

describe("Charts have an accessible data table", () => {
  test("the same numbers are reachable as a real table", () => {
    expect(dashboardSource).toContain('data-testid="chart-data-table"');
    expect(dashboardSource).toContain("<table");
    expect(dashboardSource).toContain("<caption");
    // Row and column headers, so a screen reader can associate a cell.
    expect(dashboardSource).toContain('scope="col"');
    expect(dashboardSource).toContain('scope="row"');
  });

  test("the chart itself still carries a summary for assistive tech", () => {
    expect(dashboardSource).toContain('role="img"');
    expect(dashboardSource).toContain("aria-label={chartDescription}");
  });

  test("the disclosure is a real control with a touch-sized target", () => {
    expect(dashboardSource).toContain("<summary");
    expect(dashboardSource).toContain("min-h-11 cursor-pointer");
  });
});

describe("Empty states are actionable and permission aware", () => {
  test("an empty chart offers somewhere to go", () => {
    expect(dashboardSource).toContain('data-testid="chart-empty-action"');
    expect(dashboardSource).toContain("emptyAction.to");
  });

  test("the order action is offered only to a reader who may read orders", () => {
    expect(dashboardSource).toContain('hasPermission(user, "orders.read")');
  });
});

describe("Withheld revenue is stated", () => {
  test("the dashboard says revenue is held rather than omitting the panel", () => {
    expect(dashboardSource).toContain('data-testid="revenue-withheld"');
    expect(dashboardSource).toContain("series?.revenue?.available === false");
  });

  test("localizes every chart and revenue string in both languages", () => {
    for (const key of [
      "dashboard.showDataTable",
      "dashboard.openOrders",
      "dashboard.openStockMovements",
      "dashboard.revenueWithheldTitle",
      "dashboard.revenueWithheldBody",
      "dashboard.column.signed_quantity",
      "dashboard.column.movements",
      "dashboard.column.completed",
    ]) {
      expect(i18nSource.match(new RegExp(`"${key}":`, "g"))).toHaveLength(2);
    }
  });
});
