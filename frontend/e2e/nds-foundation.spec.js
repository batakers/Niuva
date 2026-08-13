const AxeBuilder = require("@axe-core/playwright").default;
const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function mockAccountShell(page) {
  await page.route("**/api/auth/me", (route) =>
    route.fulfill({
      status: 401,
      json: { error: { code: "not_authenticated" } },
    })
  );
  await page.route("**/api/settings", (route) =>
    route.fulfill({
      status: 200,
      json: {
        legal_name: "PT Niuva Inovasi Utama",
        email: "niuvamakerspace@gmail.com",
      },
    })
  );
  await page.route("**/api/auth/login**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    await route.fulfill({
      status: 401,
      json: { detail: "Email atau password tidak valid" },
    });
  });
}

test("NDS foundation loads locally and preserves an accessible task surface", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockAccountShell(page);
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Masuk ke akun Anda" })).toBeVisible();

  const supportsLayoutShift = await page.evaluate(() => {
    window.__ndsLayoutShifts = [];
    if (!PerformanceObserver.supportedEntryTypes.includes("layout-shift")) {
      return false;
    }

    window.__ndsLayoutShiftObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          window.__ndsLayoutShifts.push(entry.value);
        }
      }
    });
    window.__ndsLayoutShiftObserver.observe({ type: "layout-shift" });
    return true;
  });

  const fontResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/fonts/niuva/MonaSansVF.woff2") &&
      response.status() === 200
  );
  await page.evaluate(() => document.body.classList.add("nds-account-surface"));
  await page.evaluate(() => document.fonts.load("400 16px 'Mona Sans'"));
  const fontResponse = await fontResponsePromise;
  expect(fontResponse.ok()).toBe(true);

  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.body).fontFamily))
    .toContain("Mona Sans");

  const semanticContracts = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return {
      action: styles.getPropertyValue("--color-action-primary").trim(),
      canvas: styles.getPropertyValue("--account-canvas").trim(),
      motion: styles.getPropertyValue("--motion-standard").trim(),
    };
  });
  expect(semanticContracts).toEqual({
    action: "#315F8F",
    canvas: "#F8FAFC",
    motion: "180ms",
  });

  const email = page.getByLabel("Email");
  await email.focus();
  const focusEvidence = await email.evaluate((node) => {
    const styles = getComputedStyle(node);
    return {
      boxShadow: styles.boxShadow,
      height: node.getBoundingClientRect().height,
    };
  });
  expect(focusEvidence.boxShadow).not.toBe("none");
  expect(focusEvidence.height).toBeGreaterThanOrEqual(44);

  const submitHeight = await page
    .getByRole("button", { name: "Masuk" })
    .evaluate((node) => node.getBoundingClientRect().height);
  expect(submitHeight).toBeGreaterThanOrEqual(44);

  await email.fill("customer@example.com");
  await page.getByLabel("Password").fill("not-a-real-password");
  const submit = page
    .getByTestId("customer-login-form")
    .locator('button[type="submit"]');
  const loginRequest = page.waitForRequest((request) =>
    request.url().includes("/api/auth/login")
  );
  await submit.click();
  await loginRequest;
  await expect(submit).toBeDisabled();
  await expect(submit).toHaveAttribute("data-state", "disabled");
  await expect(submit).toHaveText("Memverifikasi…");
  await expect(page.getByRole("alert")).toContainText(
    "Email atau password tidak valid"
  );
  await expect(submit).toBeEnabled();
  await expect(submit).toHaveAttribute("data-state", "ready");
  await expect(submit).toHaveText("Masuk");

  const reducedMotionAnimation = await page.evaluate(() => {
    const skeleton = document.createElement("div");
    skeleton.className = "motion-safe:animate-pulse";
    document.body.appendChild(skeleton);
    const animationName = getComputedStyle(skeleton).animationName;
    skeleton.remove();
    return animationName;
  });
  expect(reducedMotionAnimation).toBe("none");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);

  if (supportsLayoutShift) {
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    );
    const layoutShift = await page.evaluate(() =>
      window.__ndsLayoutShifts.reduce((sum, value) => sum + value, 0)
    );
    await testInfo.attach("nds-font-layout-shift.json", {
      body: JSON.stringify(
        { viewport: testInfo.project.name, layoutShift },
        null,
        2
      ),
      contentType: "application/json",
    });
    expect(layoutShift).toBeLessThan(0.1);
  }

  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_TAGS)
    .analyze();
  const summary = violations.map(({ id, impact, nodes }) => ({
    id,
    impact,
    nodes: nodes.slice(0, 5).map((node) => node.target),
  }));
  expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);

  if (["mobile", "desktop"].includes(testInfo.project.name)) {
    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach(`nds-foundation-${testInfo.project.name}.png`, {
      body: screenshot,
      contentType: "image/png",
    });
    if (process.env.NDS_SCREENSHOT_DIR) {
      fs.mkdirSync(process.env.NDS_SCREENSHOT_DIR, { recursive: true });
      fs.writeFileSync(
        path.join(
          process.env.NDS_SCREENSHOT_DIR,
          `nds-foundation-${testInfo.project.name}.png`
        ),
        screenshot
      );
    }
  }
});
