const fs = require("fs");
const path = require("path");

const read = (...segments) =>
  fs.readFileSync(path.resolve(__dirname, ...segments), "utf8");

const appSource = read("..", "..", "App.js");
const catalogSource = read("RetailCatalogPage.jsx");
const detailSource = read("RetailProductPage.jsx");
const visualSource = read(
  "..",
  "..",
  "components",
  "retail",
  "RetailProductVisual.jsx",
);

describe("Retail route and data boundaries", () => {
  test("keeps the approved public discovery routes", () => {
    expect(appSource).toContain('path="/retail"');
    expect(appSource).toContain('path="/retail/products/:slug"');
  });

  test("keeps the surface read-only", () => {
    expect(catalogSource).toContain("publicCatalogApi.categories()");
    expect(catalogSource).toContain("publicCatalogApi.products()");
    expect(detailSource).toContain(".product(slug)");

    for (const source of [catalogSource, detailSource]) {
      expect(source).not.toMatch(/\bapi\.(post|put|patch|delete)\s*\(/);
      expect(source).not.toMatch(
        /(?:checkout|payment|upload|fulfilment)Api\s*[.(]/i,
      );
    }
  });

  test("limits the product contact handoff to quote-required state", () => {
    expect(detailSource).toContain('state === "quote_required"');
    expect(detailSource).toContain('getPublicPath("contact", lang)');
    expect(detailSource).toContain('<Link to={contactPath}>');
    expect(detailSource).toContain('"Minta penawaran"');
    expect(detailSource).toContain('state === "discovery_only"');
    expect(detailSource).toContain("Transaksi Retail belum aktif");
  });
});
describe("Retail design-system convergence", () => {
  test("shares one media composition across catalog and detail", () => {
    for (const source of [catalogSource, detailSource]) {
      expect(source).toContain(
        'import { RetailProductVisual } from "@/components/retail/RetailProductVisual"',
      );
      expect(source).not.toContain("font-mono-tech");
      expect(source).not.toContain("rounded-feature");
      expect(source).not.toContain("bg-action-primary");
      expect(source).toContain("!pt-[var(--space-page-start)]");
    }

    expect(visualSource).toContain("rounded-panel");
    expect(visualSource).toContain("resolveMediaUrl");
  });

  test("keeps filtering and pagination failures perceivable", () => {
    expect(catalogSource).toContain("aria-pressed={selectedCategory");
    expect(catalogSource).toContain('data-testid="retail-load-more-error"');
    expect(catalogSource).toMatch(
      /Produk yang\s+sudah tampil tetap tersedia/,
    );
  });
});
