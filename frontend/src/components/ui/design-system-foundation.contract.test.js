const fs = require("fs");
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
