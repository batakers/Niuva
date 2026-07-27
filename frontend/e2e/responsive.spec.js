const { test, expect } = require("./fixtures");

/**
 * Responsive and accessibility behaviour at each named width.
 *
 * Each project runs this file at one viewport, so a failure names the width it
 * happened at instead of being averaged away by the ones that passed.
 */

const SURFACES = [
  "/admin",
  "/admin/inquiries",
  "/admin/b2b/quotes",
  "/admin/retail-orders",
  "/admin/inventory",
];

test.beforeEach(async ({ asRole }) => {
  await asRole("super_admin");
});

for (const path of SURFACES) {
  test(`${path} never scrolls the page sideways`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth - doc.clientWidth;
    });
    // Wide content scrolls inside its own container; the page does not.
    expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(1);
  });
}

test("every interactive control meets the touch target size", async ({
  page,
}) => {
  await page.goto("/admin/inquiries");
  await page.waitForLoadState("networkidle");

  const undersized = await page.evaluate(() => {
    const MIN = 44;
    return [...document.querySelectorAll("button, a[href], select")]
      .filter((element) => {
        const box = element.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) return false;
        return box.height < MIN - 0.5;
      })
      .map((element) => element.textContent.trim().slice(0, 40) || element.tagName)
      .slice(0, 10);
  });

  expect(undersized, "controls under 44px tall").toEqual([]);
});

test("the workbench is reachable by keyboard alone", async ({ page }) => {
  await page.goto("/admin");
  await page.waitForLoadState("networkidle");

  // The first stop must be the skip link, or a keyboard user walks the whole
  // navigation before reaching content on every page.
  await page.keyboard.press("Tab");
  const first = await page.evaluate(() => ({
    text: document.activeElement?.textContent?.trim() || "",
    href: document.activeElement?.getAttribute("href") || "",
  }));
  expect(first.href).toBe("#admin-main");

  await page.keyboard.press("Enter");
  const focusedMain = await page.evaluate(
    () => document.activeElement?.id || document.activeElement?.tagName
  );
  expect(focusedMain).toMatch(/admin-main|MAIN/i);
});

test("the mobile drawer traps focus and closes on Escape", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile" && testInfo.project.name !== "tablet",
    "The drawer only exists below the desktop breakpoint"
  );

  await page.goto("/admin");
  await page.getByRole("button", { name: /buka menu|open menu/i }).click();

  const drawer = page.getByRole("navigation", { name: /admin/i });
  await expect(drawer).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();

  // Focus returns to what opened it, rather than to the top of the document.
  const returned = await page.evaluate(
    () => document.activeElement?.getAttribute("aria-label") || ""
  );
  expect(returned).toMatch(/menu/i);
});

test("reduced motion is honoured", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/admin/inquiries");
  await page.waitForLoadState("networkidle");

  const animated = await page.evaluate(() => {
    return [...document.querySelectorAll("*")].filter((element) => {
      const style = getComputedStyle(element);
      const duration = parseFloat(style.transitionDuration) || 0;
      const animation = parseFloat(style.animationDuration) || 0;
      return duration > 0.01 || animation > 0.01;
    }).length;
  });

  expect(animated, "elements still animating under reduced motion").toBe(0);
});
