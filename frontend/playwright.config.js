const { defineConfig, devices } = require("@playwright/test");

/**
 * Browser verification for the Admin Studio.
 *
 * The canonical 390px baseline, 320px resilience floor, and three wider widths
 * are projects rather than assertions inside one run: a layout that breaks
 * only at 768 should fail as its own result, not be buried in a suite that
 * happened to pass at 1440.
 *
 * BASE_URL points at an already-running app. Nothing here starts a server, so
 * a missing environment fails loudly instead of silently testing nothing.
 */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

const VIEWPORTS = {
  resilience: { width: 320, height: 720 },
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1024, height: 768 },
  desktop: { width: 1440, height: 900 },
};

module.exports = defineConfig({
  testDir: "./e2e",
  // A browser assertion that only passes on a retry is not evidence.
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  webServer:
    process.env.PLAYWRIGHT_START_SERVER === "true"
      ? {
          command: "npm start",
          url: BASE_URL,
          reuseExistingServer: false,
          timeout: 120000,
          env: {
            ...process.env,
            BROWSER: "none",
            CI: "false",
          },
        }
      : undefined,
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: Object.entries(VIEWPORTS).map(([name, viewport]) => ({
    name,
    use: { ...devices["Desktop Chrome"], viewport },
  })),
});

module.exports.VIEWPORTS = VIEWPORTS;
