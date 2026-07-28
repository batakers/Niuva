const AxeBuilder = require("@axe-core/playwright").default;
const { test, expect } = require("@playwright/test");

const publication = {
  category: {
    id: "category-signage",
    name: "Signage",
    slug: "signage",
  },
  product: {
    id: "product-desk-sign",
    name: "Desk Sign",
    slug: "desk-sign",
    short_description: "Penanda meja yang dipublikasikan.",
    description: "Penanda meja untuk kebutuhan identitas ruang.",
    media: [{ storage_path: "media:file-123", alt: "Desk Sign" }],
    pricing_mode: "fixed",
    price_from: 150000,
    currency: "IDR",
  },
  variants: [
    {
      id: "variant-blue",
      name: "Biru",
      fixed_price: 150000,
      stock_status: "in_stock",
    },
  ],
  cta_state: "discovery_only",
};

async function mockCatalog(page, { empty = false, fail = false } = {}) {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({ status: 401, json: { error: { code: "not_authenticated" } } }),
  );
  await page.route("**/api/settings", (route) =>
    route.fulfill({
      status: 200,
      json: {
        legal_name: "PT Niuva Inovasi Utama",
        email: "niuvamakerspace@gmail.com",
      },
    }),
  );
  await page.route("**/api/media/file-123", (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        "base64",
      ),
    }),
  );
  await page.route("**/api/catalog/categories*", async (route) => {
    if (fail) {
      await route.fulfill({ status: 503, json: { error: { code: "not_ready" } } });
      return;
    }
    await route.fulfill({
      status: 200,
      json: empty ? [] : [publication.category],
    });
  });
  await page.route("**/api/catalog/products**", async (route) => {
    const url = new URL(route.request().url());
    if (fail) {
      await route.fulfill({ status: 503, json: { error: { code: "not_ready" } } });
      return;
    }
    if (url.pathname.endsWith("/desk-sign")) {
      await route.fulfill({ status: 200, json: publication });
      return;
    }
    await route.fulfill({
      status: 200,
      json: { items: empty ? [] : [publication], next_cursor: null },
    });
  });
}

test("published Retail discovery is usable and never presents checkout", async ({
  page,
}) => {
  await mockCatalog(page);
  await page.goto("/retail");

  await expect(page.getByRole("heading", { name: "Desk Sign" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Desk Sign" })).toHaveAttribute(
    "src",
    /\/api\/media\/file-123$/,
  );
  await expect(page.getByText(/checkout, pembayaran/i)).toBeVisible();
  await page.getByRole("link", { name: /lihat detail/i }).click();
  await expect(page).toHaveURL(/\/retail\/products\/desk-sign$/);
  await expect(
    page.getByRole("button", { name: /transaksi retail belum aktif/i }),
  ).toBeDisabled();
  await expect(page.getByText(/upload, reservasi/i)).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);

  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    violations.map(({ id, impact, nodes }) => ({
      id,
      impact,
      nodes: nodes.map((node) => node.target).slice(0, 5),
    })),
  ).toEqual([]);
});

test("Retail discovery renders empty and controlled backend-failure states", async ({
  page,
}) => {
  await mockCatalog(page, { empty: true });
  await page.goto("/retail");
  await expect(
    page.getByText(/belum ada produk retail yang dipublikasikan/i),
  ).toBeVisible();

  await page.unrouteAll({ behavior: "wait" });
  await mockCatalog(page, { fail: true });
  await page.reload();
  await expect(page.getByText(/katalog belum berhasil dimuat/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /coba lagi|retry/i })).toBeVisible();
});
