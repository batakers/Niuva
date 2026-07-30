const { test, expect } = require("@playwright/test");

test("replayed rotation forces every tab to authenticate again", async ({
  context,
  page,
}) => {
  let refreshAttempts = 0;

  await context.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;

    if (path === "/api/auth/admin/session/refresh") {
      refreshAttempts += 1;
      if (refreshAttempts === 1) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            csrf_token: "browser-evidence-csrf",
            access_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            user: {
              id: "admin-browser-evidence",
              name: "Admin Browser Evidence",
              email: "admin-browser-evidence@example.invalid",
              roles: ["super_admin"],
              permissions: ["*"],
            },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Authentication required" }),
      });
      return;
    }

    if (path === "/api/admin/stats/timeseries") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ series: [] }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  });

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole("navigation", { name: /admin/i }),
  ).toBeVisible();

  const secondTab = await context.newPage();
  await secondTab.goto("/admin");
  await expect(secondTab).toHaveURL(/\/admin\/login$/);

  await page.reload();
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect(refreshAttempts).toBe(3);
});
