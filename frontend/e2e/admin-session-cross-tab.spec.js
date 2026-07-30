const { test, expect } = require("@playwright/test");
const { randomUUID } = require("node:crypto");

test("terminal refresh 401 forces every tab to authenticate again", async ({
  context,
  page,
}) => {
  let refreshAttempts = 0;
  const csrfToken = randomUUID();

  await context.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const method = route.request().method();

    if (method === "POST" && path === "/api/auth/admin/session/refresh") {
      refreshAttempts += 1;
      if (refreshAttempts === 1) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            csrf_token: csrfToken,
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

    if (method === "GET" && path === "/api/admin/stats/timeseries") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ series: [] }),
      });
      return;
    }

    if (method === "GET" && path === "/api/admin/stats") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
      return;
    }

    if (method === "GET" && path === "/api/notifications") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
      return;
    }

    if (method === "GET" && path === "/api/notifications/unread-count") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ unread: 0 }),
      });
      return;
    }

    throw new Error(
      `Unexpected API request in terminal-401 UI contract: ${method} ${path}`,
    );
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
