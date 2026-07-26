const AxeBuilder = require("@axe-core/playwright").default;
const { test, expect } = require("./fixtures");

/**
 * Automated accessibility scanning of the Admin Studio.
 *
 * This catches the measurable half: contrast, missing labels, invalid ARIA,
 * heading order, and form fields nobody named. It cannot tell you whether the
 * result reads well in sequence to someone listening, which is why the runbook
 * still asks for a human with a screen reader.
 *
 * Scoped to WCAG 2.1 A and AA, which is the bar the plan works to. Anything
 * outside that would be reported as a failure nobody agreed to fix.
 */

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

const SURFACES = [
  "/admin",
  "/admin/inquiries",
  "/admin/b2b/quotes",
  "/admin/b2b/work-orders",
  "/admin/retail-orders",
  "/admin/inventory",
  "/admin/portfolio",
];

for (const path of SURFACES) {
  test(`${path} has no WCAG A or AA violations`, async ({ asRole, page }) => {
    await asRole("super_admin");
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    const { violations } = await new AxeBuilder({ page })
      .withTags(TAGS)
      .analyze();

    // Report what broke and where, rather than only that something did: a
    // count alone sends the reader back to the browser to find it again.
    const summary = violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.map((node) => node.target.join(" ")).slice(0, 5),
    }));

    expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
  });
}

test("the sign-in page has no WCAG A or AA violations", async ({ page }) => {
  // Checked unauthenticated: it is the one page every user meets, including
  // the ones who never get past it.
  await page.goto("/admin/login");
  await page.waitForLoadState("networkidle");

  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const summary = violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    nodes: violation.nodes.map((node) => node.target.join(" ")).slice(0, 5),
  }));

  expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
});
