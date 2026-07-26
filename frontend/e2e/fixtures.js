const { test: base, expect } = require("@playwright/test");

/**
 * Roles under verification, and what each one must and must not reach.
 *
 * Derived from the backend role matrix rather than restated by hand where it
 * can be helped: the point of this suite is to catch the case where the UI and
 * the server disagree about who may see what.
 */
const ROLES = {
  super_admin: {
    env: "E2E_SUPER_ADMIN",
    visible: [
      "/admin/inquiries",
      "/admin/b2b/quotes",
      "/admin/b2b/projects",
      "/admin/retail-orders",
      "/admin/b2b/work-orders",
      "/admin/inventory",
      "/admin/portfolio",
      "/admin/users",
      "/admin/settings",
    ],
    forbidden: [],
  },
  sales_estimator: {
    env: "E2E_SALES",
    visible: ["/admin/inquiries", "/admin/b2b/quotes", "/admin/b2b/projects"],
    forbidden: ["/admin/users", "/admin/settings"],
  },
  warehouse: {
    env: "E2E_WAREHOUSE",
    visible: ["/admin/inventory", "/admin/stock-movements"],
    forbidden: ["/admin/b2b/quotes", "/admin/users", "/admin/settings"],
  },
  content_editor: {
    env: "E2E_CONTENT",
    visible: ["/admin/portfolio", "/admin/content"],
    forbidden: ["/admin/inventory", "/admin/users", "/admin/b2b/quotes"],
  },
  production: {
    env: "E2E_PRODUCTION",
    visible: ["/admin/b2b/work-orders", "/admin/inventory"],
    forbidden: ["/admin/users", "/admin/settings", "/admin/b2b/quotes"],
  },
};

function credentialsFor(role) {
  const prefix = ROLES[role].env;
  const email = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];
  if (!email || !password) {
    throw new Error(
      `Missing ${prefix}_EMAIL / ${prefix}_PASSWORD. Role-matrix verification ` +
        `needs a real account per role; skipping one silently would report a ` +
        `pass for a role nobody checked.`
    );
  }
  return { email, password };
}

async function signIn(page, role) {
  const { email, password } = credentialsFor(role);
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password|sandi/i).fill(password);
  await page.getByRole("button", { name: /masuk|sign in|login/i }).click();
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 15000 });
}

const test = base.extend({
  asRole: async ({ page }, use) => {
    await use(async (role) => {
      await signIn(page, role);
      return page;
    });
  },
});

module.exports = { test, expect, ROLES, signIn, credentialsFor };
