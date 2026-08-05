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

  test("preserves the approved navigation and secondary Retail destinations", () => {
    for (const destination of [
      'to: "/"',
      'to: "/about"',
      'to: "/capabilities"',
      'to: "/projects"',
      'to: "/contact"',
      'to="/retail"',
    ]) {
      expect(publicSource).toContain(destination);
    }
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
