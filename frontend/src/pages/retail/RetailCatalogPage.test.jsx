import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import RetailCatalogPage from "./RetailCatalogPage";
import { publicCatalogApi } from "@/lib/catalog";

jest.mock("@/components/layout/Layout", () => ({
  MarketingLayout: ({ children }) => <main>{children}</main>,
}));

jest.mock("@/components/brand/BrandSystem", () => ({
  MarketingSection: ({ children }) => <section>{children}</section>,
  PageContainer: ({ children }) => <div>{children}</div>,
}));

jest.mock("@/lib/api", () => ({
  HAS_CONFIGURED_BACKEND: true,
  resolveMediaUrl: jest.fn(() => ""),
}));

jest.mock("@/lib/catalog", () => ({
  availabilityLabel: jest.fn(() => "Tersedia"),
  formatCatalogPrice: jest.fn(() => "Mulai Rp100.000"),
  publicCatalogApi: {
    categories: jest.fn(),
    products: jest.fn(),
  },
}));

const categories = [
  { id: "category-ready", name: "Ready Product", slug: "ready" },
  { id: "category-custom", name: "Custom Print", slug: "custom" },
];

const publications = [
  {
    id: "publication-1",
    category: categories[0],
    product: {
      id: "product-1",
      name: "Desk Sign",
      slug: "desk-sign",
      short_description: "Penanda meja terpublikasi.",
      media: [],
    },
    variants: [{ id: "variant-1", stock_status: "in_stock" }],
    cta_state: "discovery_only",
  },
  {
    id: "publication-2",
    category: categories[1],
    product: {
      id: "product-2",
      name: "Custom Bracket",
      slug: "custom-bracket",
      short_description: "Bracket berdasarkan penawaran.",
      media: [],
    },
    variants: [{ id: "variant-2", stock_status: "made_to_order" }],
    cta_state: "quote_required",
  },
];

function renderCatalog({ strict = false } = {}) {
  const page = (
    <MemoryRouter>
      <RetailCatalogPage />
    </MemoryRouter>
  );
  return render(strict ? <React.StrictMode>{page}</React.StrictMode> : page);
}

beforeEach(() => {
  publicCatalogApi.categories.mockResolvedValue(categories);
  publicCatalogApi.products.mockResolvedValue({
    items: publications,
    next_cursor: null,
  });
});
afterEach(() => jest.resetAllMocks());

test("loads the public catalog once and exposes category selection semantics", async () => {
  renderCatalog({ strict: true });

  expect(await screen.findByTestId("retail-product-grid")).toBeInTheDocument();
  expect(publicCatalogApi.categories).toHaveBeenCalledTimes(1);
  expect(publicCatalogApi.products).toHaveBeenCalledTimes(1);

  const allFilter = screen.getByRole("button", { name: "Semua" });
  const customFilter = screen.getByRole("button", { name: "Custom Print" });
  expect(allFilter).toHaveAttribute("aria-pressed", "true");
  expect(customFilter).toHaveAttribute("aria-pressed", "false");

  fireEvent.click(customFilter);

  expect(customFilter).toHaveAttribute("aria-pressed", "true");
  expect(
    screen.getByRole("heading", { name: "Custom Bracket" }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "Desk Sign" }),
  ).not.toBeInTheDocument();
});
test("keeps loaded products visible and offers retry after pagination fails", async () => {
  publicCatalogApi.products
    .mockResolvedValueOnce({ items: [publications[0]], next_cursor: "cursor-2" })
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce({ items: [publications[1]], next_cursor: null });

  renderCatalog();
  await screen.findByRole("heading", { name: "Desk Sign" });

  fireEvent.click(screen.getByRole("button", { name: "Muat produk berikutnya" }));

  expect(await screen.findByTestId("retail-load-more-error")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Desk Sign" })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Coba muat lagi" }));

  expect(
    await screen.findByRole("heading", { name: "Custom Bracket" }),
  ).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.queryByTestId("retail-load-more-error")).not.toBeInTheDocument();
  });
  expect(publicCatalogApi.products).toHaveBeenNthCalledWith(2, {
    cursor: "cursor-2",
  });
  expect(publicCatalogApi.products).toHaveBeenNthCalledWith(3, {
    cursor: "cursor-2",
  });
});
