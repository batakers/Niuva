import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";

import RetailProductPage from "./RetailProductPage";
import { publicCatalogApi } from "@/lib/catalog";
import { I18nProvider } from "@/i18n";

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
  publicCatalogApi: { product: jest.fn() },
}));

const publication = {
  id: "publication-1",
  category: { id: "category-1", name: "Ready Product", slug: "ready" },
  product: {
    id: "product-1",
    name: "Desk Sign",
    slug: "desk-sign",
    description: "Penanda meja terpublikasi.",
    media: [],
  },
  variants: [
    { id: "variant-1", name: "Biru", stock_status: "in_stock" },
  ],
  cta_state: "discovery_only",
};

function setLanguage(lang) {
  localStorage.clear();
  localStorage.setItem("niuva_lang", lang);
  window.history.pushState({}, "", "/retail/products/desk-sign");
}

function renderProduct({ lang = "id" } = {}) {
  setLanguage(lang);
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={["/retail/products/desk-sign"]}>
        <Routes>
          <Route path="/retail/products/:slug" element={<RetailProductPage />} />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  );
}

function deferred() {
  let resolve;
  const promise = new Promise((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

function ProductRouteWithSwitcher() {
  const navigate = useNavigate();
  return (
    <>
      <button type="button" onClick={() => navigate("/retail/products/desk-lamp")}>
        Buka produk kedua
      </button>
      <RetailProductPage />
    </>
  );
}

afterEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  window.history.pushState({}, "", "/");
});

test("presents discovery-only state as information rather than a dead CTA", async () => {
  publicCatalogApi.product.mockResolvedValue(publication);

  renderProduct();

  expect(
    await screen.findByRole("heading", { name: "Desk Sign" }),
  ).toBeInTheDocument();
  expect(publicCatalogApi.product).toHaveBeenCalledWith("desk-sign");
  expect(screen.getByRole("status")).toHaveTextContent(
    "Transaksi Retail belum aktif",
  );
  expect(screen.getByRole("status")).toHaveTextContent(
    "akun dan revalidasi server",
  );
  expect(
    screen.queryByRole("button", { name: "Transaksi Retail belum aktif" }),
  ).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Minta penawaran" })).not.toBeInTheDocument();
});
test("keeps the approved contact handoff limited to quote-required products", async () => {
  publicCatalogApi.product.mockResolvedValue({
    ...publication,
    cta_state: "quote_required",
  });

  renderProduct();

  expect(
    await screen.findByRole("link", { name: "Diskusikan kebutuhan ini" }),
  ).toHaveAttribute("href", "/kontak");
  expect(screen.getByText(/tidak membuat Retail Request/i)).toBeInTheDocument();
});
test("keeps a failed product read generic and recoverable", async () => {
  publicCatalogApi.product
    .mockRejectedValueOnce(new Error("private catalog detail"))
    .mockResolvedValueOnce(publication);

  renderProduct();

  expect(
    await screen.findByRole("heading", {
      name: "Detail produk belum berhasil dimuat",
    }),
  ).toBeInTheDocument();
  expect(screen.queryByText(/private catalog detail/i)).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));

  expect(
    await screen.findByRole("heading", { name: "Desk Sign" }),
  ).toBeInTheDocument();
  expect(publicCatalogApi.product).toHaveBeenCalledTimes(2);
});

test("ignores an older response after the product route slug changes", async () => {
  const first = deferred();
  const second = deferred();
  const secondPublication = {
    ...publication,
    product: {
      ...publication.product,
      id: "product-2",
      name: "Desk Lamp",
      slug: "desk-lamp",
    },
  };

  publicCatalogApi.product.mockImplementation((requestedSlug) =>
    requestedSlug === "desk-sign" ? first.promise : second.promise,
  );

  setLanguage("id");
  render(
    <I18nProvider>
      <MemoryRouter initialEntries={["/retail/products/desk-sign"]}>
        <Routes>
          <Route path="/retail/products/:slug" element={<ProductRouteWithSwitcher />} />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  );

  fireEvent.click(screen.getByRole("button", { name: "Buka produk kedua" }));
  await waitFor(() => {
    expect(publicCatalogApi.product).toHaveBeenCalledWith("desk-lamp");
  });

  await act(async () => {
    second.resolve(secondPublication);
    await second.promise;
  });
  expect(await screen.findByRole("heading", { name: "Desk Lamp" })).toBeInTheDocument();

  await act(async () => {
    first.resolve(publication);
    await first.promise;
  });
  expect(screen.getByRole("heading", { name: "Desk Lamp" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Desk Sign" })).not.toBeInTheDocument();
});

test("keeps a stored English preference on the unprefixed product route", async () => {
  publicCatalogApi.product.mockResolvedValue({
    ...publication,
    cta_state: "quote_required",
  });

  renderProduct({ lang: "en" });

  expect(
    await screen.findByRole("link", { name: "Discuss this requirement" }),
  ).toHaveAttribute("href", "/en/contact");
  expect(screen.getByRole("link", { name: "Back to Retail" })).toHaveAttribute(
    "href",
    "/en/retail",
  );
  expect(screen.getByText("Published price")).toBeInTheDocument();
  expect(screen.getByText("Availability")).toBeInTheDocument();
});
