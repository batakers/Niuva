const fs = require("fs");
const path = require("path");

const movementsSource = fs.readFileSync(
  path.join(__dirname, "StockMovements.jsx"),
  "utf8"
);
const inventorySource = fs.readFileSync(
  path.join(__dirname, "Inventory.jsx"),
  "utf8"
);
const translationsSource = fs.readFileSync(
  path.resolve(__dirname, "..", "..", "lib", "domain-translations.js"),
  "utf8"
);

describe("Movement deep links", () => {
  test("the movement history reads its filters from the URL", () => {
    expect(movementsSource).toContain("useSearchParams");
    expect(movementsSource).toContain("searchParams.get(key)");
    // No shadow filter state to fall out of sync with the address bar.
    expect(movementsSource).not.toContain("useState(INITIAL_FILTERS)");
  });

  test("a movement's source is a link that filters the ledger by it", () => {
    expect(movementsSource).toContain('data-testid="movement-reference-link"');
    expect(movementsSource).toContain(
      "/admin/stock-movements?reference_id=${encodeURIComponent(row.reference_id)}"
    );
    expect(movementsSource).toContain("row.reference_type");
  });

  test("every balance links to its own movement history", () => {
    expect(inventorySource).toContain('data-testid="balance-history-link"');
    expect(inventorySource).toContain("movementHistoryPath(balance)");
    expect(inventorySource).toContain('subject_type: balance.subject_type');
    expect(inventorySource).toContain('subject_id: balance.subject_id');
  });
});

describe("Stock status", () => {
  test("renders the server verdict rather than deriving its own", () => {
    expect(inventorySource).toContain("balance.stock_status");
    // The page maps status to tone, never numbers to status.
    expect(inventorySource).toContain("STOCK_STATUS_TONE");
    expect(inventorySource).not.toContain("reorder_point <");
  });

  test("distinguishes all three verdicts by tone", () => {
    expect(inventorySource).toContain('normal: "success"');
    expect(inventorySource).toContain('rendah: "warning"');
    expect(inventorySource).toContain('habis: "destructive"');
  });

  test("localizes the verdict in Indonesian and English", () => {
    for (const key of [
      "inventory.stockStatusLabel",
      "inventory.stockStatus.normal",
      "inventory.stockStatus.rendah",
      "inventory.stockStatus.habis",
      "inventory.viewMovements",
    ]) {
      expect(
        translationsSource.match(new RegExp(`"${key}":`, "g"))
      ).toHaveLength(2);
    }
  });
});
