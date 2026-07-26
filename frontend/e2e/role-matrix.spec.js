const { test, expect, ROLES } = require("./fixtures");

/**
 * What each role can reach, verified in a real browser.
 *
 * The unit suites assert the permission map; this asserts the map is actually
 * what the running app enforces. Those can disagree, and only this catches it.
 */

for (const [role, expectations] of Object.entries(ROLES)) {
  test.describe(`${role}`, () => {
    test("sees exactly the navigation its permissions allow", async ({
      asRole,
    }, testInfo) => {
      const page = await asRole(role);

      // Below the desktop breakpoint the navigation lives in a drawer, so it
      // has to be opened before there is anything to assert about.
      if (["mobile", "tablet"].includes(testInfo.project.name)) {
        await page.getByRole("button", { name: /buka menu|open menu/i }).click();
      }

      const nav = page.getByRole("navigation", { name: /admin/i });

      for (const path of expectations.visible) {
        await expect(
          nav.locator(`a[href="${path}"]`),
          `${role} should see ${path}`
        ).toHaveCount(1);
      }
      for (const path of expectations.forbidden) {
        await expect(
          nav.locator(`a[href="${path}"]`),
          `${role} must not see ${path}`
        ).toHaveCount(0);
      }
    });

    for (const path of expectations.forbidden) {
      test(`is refused at ${path} even when typed directly`, async ({
        asRole,
      }) => {
        const page = await asRole(role);
        await page.goto(path);

        // Hiding a link is not access control. The route itself must refuse.
        await expect(
          page.getByText(/akses ditolak|access denied/i),
          `${role} reached ${path} directly`
        ).toBeVisible();
      });
    }
  });
}

test.describe("unauthenticated", () => {
  test("is sent to sign-in rather than shown an admin shell", async ({
    page,
  }) => {
    await page.goto("/admin/inquiries");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("cannot read the admin surface through the API", async ({ request }) => {
    // Against the API origin, not the app origin: the dev server answers any
    // path with the SPA shell and a 200, which would let this assertion pass
    // on an HTML page while the API was wide open.
    const api = process.env.PLAYWRIGHT_API_URL;
    test.skip(
      !api,
      "PLAYWRIGHT_API_URL must point at the API origin for this check"
    );

    const response = await request.get(`${api}/api/admin/inquiries`);
    expect(response.status()).toBe(401);
  });
});
