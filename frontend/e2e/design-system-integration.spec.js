const AxeBuilder = require("@axe-core/playwright").default;
const { test, expect } = require("@playwright/test");

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function mockPublicShell(page) {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 401,
      json: { error: { code: "not_authenticated" } },
    }),
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
}

test("Home keeps its Public navigation contract and measurable accessibility", async ({
  page,
}, testInfo) => {
  // Scan the stable reduced-motion state. Axe can otherwise sample a hero
  // child midway through its approved opacity entrance and report a transient
  // contrast failure that disappears when the animation settles.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockPublicShell(page);
  await page.goto("/");

  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  if (["mobile", "tablet"].includes(testInfo.project.name)) {
    const menuButton = page.getByRole("button", { name: "Buka menu" });
    await menuButton.click();

    const panel = page.getByRole("dialog", { name: "Menu navigasi" });
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("link", { name: "Home", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(panel.getByRole("link", { name: /Retail · Explore/i })).toBeVisible();
    await expect(panel.getByRole("link", { name: "Home", exact: true })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(menuButton).toBeFocused();
  } else {
    const navigation = page.getByRole("navigation", {
      name: "Primary navigation",
    });
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole("link", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  }

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);

  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .analyze();
  const accessibilitySummary = violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    nodes: nodes.slice(0, 5).map((node) => ({
      target: node.target,
      failureSummary: node.failureSummary,
      checks: node.any.map(({ message, data }) => ({ message, data })),
    })),
  }));

  expect(accessibilitySummary, JSON.stringify(accessibilitySummary, null, 2)).toEqual([]);
});
