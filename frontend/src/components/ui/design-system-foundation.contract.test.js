const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const { buttonVariants } = require("./button");
const { badgeVariants } = require("./badge");
const {
  surfacePanelVariants,
  surfacePanelHeaderVariants,
} = require("./surface-panel");

const sourceRoot = path.resolve(__dirname, "..", "..");
const frontendRoot = path.resolve(sourceRoot, "..");

function implementationSources(directory = sourceRoot) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return implementationSources(absolutePath);
    }

    if (!/\.(?:js|jsx)$/.test(entry.name) || /\.test\./.test(entry.name)) {
      return [];
    }

    return [absolutePath];
  });
}

function findMatches(pattern, files = implementationSources()) {
  return files.flatMap((file) => {
    const source = fs.readFileSync(file, "utf8");
    const matches = source.match(pattern) || [];

    return matches.map((match) => ({
      file: path.relative(frontendRoot, file).replaceAll("\\", "/"),
      match,
    }));
  });
}

describe("frontend design-system foundation", () => {
  test("ships the approved self-hosted font assets with recorded hashes", () => {
    const fontRoot = path.join(frontendRoot, "public", "fonts", "niuva");
    const expectedBinaryHashes = {
      "MonaSansVF.woff2":
        "fd40288d051171b51e3d01f36790604470dbb4d4fc5b36ee5a8119f4f4c6b3e1",
      "BonaNova-Italic.woff2":
        "8559973f32b6b84f226af7589016056f7841bc48d12a3024a3f3c5afbda27164",
    };
    const expectedLicenseHashes = {
      "OFL-Mona-Sans.txt":
        "1eb33139d205c43cdfa3f5c8debc87275ca2ab5fff20fe05039a23e0e85111ed",
      "OFL-Bona-Nova.txt":
        "692b6af789d7374401035e1e474b4ad0b951ea1139c2d041db6e24abbdef21e0",
    };

    for (const [file, expectedHash] of Object.entries(expectedBinaryHashes)) {
      const content = fs.readFileSync(path.join(fontRoot, file));
      const actualHash = crypto.createHash("sha256").update(content).digest("hex");
      expect(actualHash).toBe(expectedHash);
    }

    for (const [file, expectedHash] of Object.entries(expectedLicenseHashes)) {
      const content = fs
        .readFileSync(path.join(fontRoot, file), "utf8")
        .replace(/\r\n?/g, "\n");
      const actualHash = crypto
        .createHash("sha256")
        .update(content, "utf8")
        .digest("hex");
      expect(actualHash).toBe(expectedHash);
    }
  });

  test("defines NDS typography roles without removing compatibility delivery", () => {
    const css = fs.readFileSync(path.join(sourceRoot, "index.css"), "utf8");
    const fontCss = fs.readFileSync(
      path.join(frontendRoot, "public", "fonts", "niuva", "fonts.css"),
      "utf8"
    );
    const document = fs.readFileSync(
      path.join(frontendRoot, "public", "index.html"),
      "utf8"
    );

    expect(fontCss).toContain("font-family: 'Mona Sans'");
    expect(fontCss).toContain("url('./MonaSansVF.woff2')");
    expect(fontCss).toContain("font-family: 'Bona Nova'");
    expect(fontCss.match(/font-display:\s*swap/g)).toHaveLength(2);
    expect(css).toContain("--font-family-nds-display: 'Mona Sans'");
    expect(css).toContain("--font-family-nds-expression: 'Bona Nova'");
    expect(css).toContain("--font-family-sans: 'Poppins'");
    expect(document).toContain("%PUBLIC_URL%/fonts/niuva/fonts.css");
    expect(document).toContain("family=Poppins");
    expect(document).not.toContain("BonaNova-Italic.woff2");
  });

  test("maps NDS values through semantic and surface aliases", () => {
    const css = fs.readFileSync(path.join(sourceRoot, "index.css"), "utf8");

    for (const contract of [
      "--nds-blue-50: #F1F6FA",
      "--nds-blue-500: #6390BB",
      "--nds-blue-700: #315F8F",
      "--nds-blue-950: #0E1B27",
      "--color-surface-canvas: #F8FAFC",
      "--color-action-primary: var(--nds-blue-700)",
      "--color-action-primary-rgb: 49 95 143",
      "--color-border-control: #708BA3",
      "--color-border-focus: var(--color-focus-ring)",
      "--color-action-disabled: var(--color-disabled-surface)",
      "--color-surface-inverse: var(--nds-blue-950)",
      "--color-overlay-surface: var(--color-overlay-scrim)",
      "--color-text-technical: var(--color-text-secondary)",
      "--public-canvas: var(--color-surface-canvas)",
      "--commerce-summary-surface: var(--color-surface-default)",
      "--account-task-surface: var(--color-surface-default)",
      "--operations-row-surface: var(--color-surface-default)",
    ]) {
      expect(css).toContain(contract);
    }
  });

  test("keeps semantic roles independent from lifecycle authority", () => {
    const css = fs.readFileSync(path.join(sourceRoot, "index.css"), "utf8");
    const lifecyclePattern =
      /(?:^|-)(?:inquiry|request|offer|order|payment|quote|project|work-order)(?:-|$)/i;
    const tokenDeclarations = [...css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map(
      ([, name]) => name
    );
    const lifecycleNamedRoles = tokenDeclarations.filter((name) =>
      lifecyclePattern.test(name.slice(2))
    );

    expect(lifecycleNamedRoles).toEqual([]);
  });

  test("uses the approved motion grammar without a global reduced-motion wipe", () => {
    const css = fs.readFileSync(path.join(sourceRoot, "index.css"), "utf8");

    expect(css).toContain("--motion-instant: 0ms");
    expect(css).toContain("--motion-fast: 120ms");
    expect(css).toContain("--motion-standard: 180ms");
    expect(css).toContain("--motion-deliberate: 280ms");
    expect(css).toContain("--motion-ambient: 15s");
    expect(css).toContain("--ease-standard: cubic-bezier(0.2, 0, 0, 1)");
    expect(css).toContain("--ease-enter: cubic-bezier(0, 0, 0.2, 1)");
    expect(css).toContain("--ease-exit: cubic-bezier(0.3, 0, 1, 0.3)");
    expect(css).not.toContain("animation-duration: 0.01ms");
    expect(css).not.toContain("transition-duration: 0.01ms");
    expect(css).not.toMatch(/transition\s*:\s*all\b/);
  });

  test("retains the existing shadcn-style configuration", () => {
    const config = JSON.parse(
      fs.readFileSync(path.join(frontendRoot, "components.json"), "utf8")
    );

    expect(config.style).toBe("new-york");
    expect(config.rsc).toBe(false);
    expect(config.tailwind.cssVariables).toBe(true);
    expect(config.aliases.ui).toBe("@/components/ui");
    expect(config.iconLibrary).toBe("lucide");
  });

  test("keeps shared controls on semantic radius, focus, and action roles", () => {
    expect(buttonVariants()).toEqual(expect.stringContaining("rounded-control"));
    expect(buttonVariants()).toEqual(
      expect.stringContaining("focus-visible:ring-focus-ring")
    );
    expect(buttonVariants({ variant: "default" })).toEqual(
      expect.stringContaining("bg-action-primary")
    );
    expect(buttonVariants({ variant: "destructive" })).toEqual(
      expect.stringContaining("bg-destructive")
    );
  });

  test("keeps adopted controls on explicit transitions and control boundaries", () => {
    const adoptedControls = [
      "button.jsx",
      "input.jsx",
      "textarea.jsx",
      "select.jsx",
      "switch.jsx",
      "tabs.jsx",
    ];

    for (const file of adoptedControls) {
      const source = fs.readFileSync(path.resolve(__dirname, file), "utf8");
      expect(source).not.toContain("transition-all");
    }

    for (const file of ["input.jsx", "textarea.jsx", "select.jsx"]) {
      const source = fs.readFileSync(path.resolve(__dirname, file), "utf8");
      expect(source).toContain("border-border-control");
      expect(source).toContain("aria-invalid:border-status-error");
    }
  });

  test("keeps shared panels on semantic surface contracts", () => {
    const panel = surfacePanelVariants();
    const header = surfacePanelHeaderVariants();

    for (const className of [
      "rounded-panel",
      "border-border-default",
      "bg-surface-default",
      "shadow-surface",
    ]) {
      expect(panel).toEqual(expect.stringContaining(className));
    }

    expect(header).toEqual(expect.stringContaining("rounded-t-panel"));
    expect(header).toEqual(expect.stringContaining("bg-surface-muted"));
  });

  test("keeps Badge presentational and lifecycle status ownership domain-scoped", () => {
    const badgeSource = fs.readFileSync(path.resolve(__dirname, "badge.jsx"), "utf8");
    const stepperSource = fs.readFileSync(
      path.resolve(__dirname, "..", "operational", "StatusStepper.jsx"),
      "utf8"
    );
    const unboundedStatusImports = findMatches(
      /import\s+\{\s*StatusBadge\s*\}\s+from\s+["'][^"']*StatusStepper["']/g
    );

    expect(badgeVariants({ tone: "success" })).toEqual(
      expect.stringContaining("bg-status-success/15")
    );
    expect(badgeSource).not.toContain("status.");
    expect(stepperSource).not.toContain("export function StatusBadge");
    expect(stepperSource).not.toMatch(
      /internal_review|revision_requested|published|ready_to_ship|quality_control|in_progress/
    );
    expect(unboundedStatusImports).toEqual([]);
  });

  test("does not bypass semantic colors in JavaScript or JSX", () => {
    const hardCodedHex = findMatches(
      /#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b/gi
    );
    const scaledTailwindPalette = findMatches(
      /\b(?:bg|text|border|ring|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950)\b/g
    );

    expect({ hardCodedHex, scaledTailwindPalette }).toEqual({
      hardCodedHex: [],
      scaledTailwindPalette: [],
    });
  });

  test("does not introduce a parallel arbitrary radius system", () => {
    expect(findMatches(/\brounded-\[[^\]]+\]/g)).toEqual([]);
  });

  test("maps the existing inverse-decoration token through Tailwind", () => {
    const tailwindSource = fs.readFileSync(
      path.join(frontendRoot, "tailwind.config.js"),
      "utf8"
    );

    expect(tailwindSource).toContain(
      "'decoration-inverse-line': 'var(--color-decoration-inverse-line)'"
    );
  });

  test("maps NDS typography, states, surfaces, and motion through Tailwind", () => {
    const tailwindSource = fs.readFileSync(
      path.join(frontendRoot, "tailwind.config.js"),
      "utf8"
    );

    for (const mapping of [
      "'nds-display': [\"var(--font-family-nds-display)\"]",
      "expression: [\"var(--font-family-nds-expression)\"]",
      "const withOpacity = (token) => `rgb(var(${token}) / <alpha-value>)`",
      "'action-primary': withOpacity('--color-action-primary-rgb')",
      "'action-disabled': withOpacity('--color-action-disabled-rgb')",
      "'disabled-surface': withOpacity('--color-disabled-surface-rgb')",
      "'surface-inverse': withOpacity('--color-surface-inverse-rgb')",
      "'border-focus': withOpacity('--color-border-focus-rgb')",
      "'text-technical': withOpacity('--color-text-technical-rgb')",
      "'overlay-surface': 'var(--color-overlay-surface)'",
      "'public-canvas': 'var(--public-canvas)'",
      "DEFAULT: withOpacity('--color-status-success-rgb')",
      "surface: 'var(--color-status-success-surface)'",
      "deliberate: 'var(--motion-deliberate)'",
      "enter: 'var(--ease-enter)'",
      "exit: 'var(--ease-exit)'",
    ]) {
      expect(tailwindSource).toContain(mapping);
    }
  });

  test("uses 390px as the design baseline and 320px as the resilience floor", () => {
    const playwrightSource = fs.readFileSync(
      path.join(frontendRoot, "playwright.config.js"),
      "utf8"
    );

    expect(playwrightSource).toContain("resilience: { width: 320, height: 720 }");
    expect(playwrightSource).toContain("mobile: { width: 390, height: 844 }");
  });

  test("keeps the undeclared vaul Drawer quarantined", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(frontendRoot, "package.json"), "utf8")
    );
    const drawerPath = path.resolve(__dirname, "drawer.jsx");
    const adopters = findMatches(
      /from\s+["'][^"']*\/drawer["']/g,
      implementationSources().filter((file) => file !== drawerPath)
    );

    expect(packageJson.dependencies.vaul).toBeUndefined();
    expect(packageJson.devDependencies.vaul).toBeUndefined();
    expect(adopters).toEqual([]);
  });
});
