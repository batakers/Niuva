const fs = require("fs");
const path = require("path");

const shellSource = fs.readFileSync(path.resolve(__dirname, "Navbar.jsx"), "utf8");
const publicSource = fs.readFileSync(
  path.resolve(__dirname, "PublicNavigation.jsx"),
  "utf8",
);
const operationalSource = fs.readFileSync(
  path.resolve(__dirname, "OperationalNavigation.jsx"),
  "utf8",
);
const stylesSource = fs.readFileSync(
  path.resolve(__dirname, "navigationStyles.js"),
  "utf8",
);
describe("public navigation semantics", () => {
  test("makes the mobile panel modal only while open and inert while closed", () => {
    expect(shellSource).toContain('role={open ? "dialog" : undefined}');
    expect(shellSource).toContain('aria-modal={open ? "true" : undefined}');
    expect(shellSource).toContain("inert={!open}");
    expect(shellSource).toContain('data-testid="mobile-navigation-backdrop"');
    expect(shellSource).toContain("onClick={() => setOpen(false)}");
    expect(shellSource).not.toContain('aria-hidden={!open}');
  });

  test("uses one registry for direct Public routes without a Services menu", () => {
    expect(publicSource).toContain("PUBLIC_NAVIGATION_LINKS.map");
    expect(publicSource).toContain('getPublicPath(item.key, routeLocale)');
    expect(publicSource).not.toContain("PUBLIC_SERVICE_ITEMS");
    expect(publicSource).not.toContain("PUBLIC_RETAIL_ITEMS");
    expect(publicSource).not.toContain("desktop-services-panel");
    expect(publicSource).not.toContain("mobile-services-panel");
    expect(publicSource).not.toMatch(/(?:to|pathname):?\s*[={]?['"]\/(?:about|capabilities|services|projects|portfolio|contact|privacy)['"]/);
  });

  test("keeps compact behavior Public-only and freezes it while the menu is open", () => {
    expect(shellSource).toContain("PUBLIC_NAVBAR_COMPACT_THRESHOLD = 96");
    expect(shellSource).toContain("IntersectionObserver");
    expect(shellSource).toContain("if (open) return undefined");
    expect(shellSource).toContain("data-compact={compact ? \"true\" : \"false\"}");
    expect(shellSource).toContain("isPublicRoute");
    expect(shellSource).toContain("duration-deliberate ease-snap");
  });

  test("keeps Public and operational information architecture in separate compositions", () => {
    expect(shellSource).toContain("<PublicNavigation");
    expect(shellSource).toContain("<OperationalNavigation");
    expect(shellSource).not.toContain("const primaryLinks");
    expect(publicSource).toContain("PUBLIC_NAVIGATION_LINKS");
    expect(publicSource).not.toMatch(/useAuth|hasPermission|onSignOut/);
    expect(operationalSource).not.toContain("PUBLIC_NAVIGATION_LINKS");
    expect(operationalSource).not.toMatch(/useAuth|hasPermission/);
  });

  test("uses semantic navigation tokens without direct color-variable utilities", () => {
    const navigationSource = [
      shellSource,
      publicSource,
      operationalSource,
      stylesSource,
    ].join("\n");

    expect(navigationSource).not.toMatch(
      /ring-offset-white|(?:bg|text|border|ring)-\[var\(--color/,
    );
  });
});
