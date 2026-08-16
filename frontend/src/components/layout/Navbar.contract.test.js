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
const {
  PUBLIC_RETAIL_ITEMS,
  PUBLIC_SERVICE_ITEMS,
} = require("@/lib/publicRoutes");

describe("public navigation semantics", () => {
  test("makes the mobile panel modal only while open and inert while closed", () => {
    expect(shellSource).toContain('role={open ? "dialog" : undefined}');
    expect(shellSource).toContain('aria-modal={open ? "true" : undefined}');
    expect(shellSource).toContain("inert={!open}");
    expect(shellSource).toContain('data-testid="mobile-navigation-backdrop"');
    expect(shellSource).toContain("onClick={() => setOpen(false)}");
    expect(shellSource).not.toContain('aria-hidden={!open}');
  });

  test("uses one registry for canonical Public routes and the 60/40 menu taxonomy", () => {
    expect(PUBLIC_SERVICE_ITEMS).toHaveLength(4);
    expect(PUBLIC_RETAIL_ITEMS).toHaveLength(2);
    expect(publicSource).toContain("PUBLIC_SERVICE_ITEMS.map");
    expect(publicSource).toContain("PUBLIC_RETAIL_ITEMS.map");
    expect(publicSource).toContain("grid-cols-[minmax(0,3fr)_minmax(17rem,2fr)]");
    expect(publicSource).toContain('getPublicPath("services", routeLocale)');
    expect(publicSource).toContain('getPublicPath("retail", routeLocale)');
    expect(publicSource).not.toMatch(/(?:to|pathname):?\s*[={]?['"]\/(?:about|capabilities|services|projects|portfolio|contact|privacy)['"]/);
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
