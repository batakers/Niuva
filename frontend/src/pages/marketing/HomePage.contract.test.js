const fs = require("fs");
const path = require("path");

const read = (...segments) =>
  fs.readFileSync(path.resolve(__dirname, ...segments), "utf8");

const homeSource = read("HomePage.jsx");
const blocksSource = read(
  "..",
  "..",
  "components",
  "brand",
  "CompanyProfileBlocks.jsx",
);
const brandSource = read(
  "..",
  "..",
  "components",
  "brand",
  "BrandSystem.jsx",
);

describe("approved Home composition", () => {
  test("uses exactly two semantic five-stage transformation paths", () => {
    expect(homeSource.match(/<TransformationPath\b/g)).toHaveLength(2);
    expect(blocksSource).toContain("HOME_TRANSFORMATION_STAGES");
    for (const stage of ["Need", "Research", "Experiment", "Prototype", "Output"]) {
      expect(blocksSource).toContain(`title: "${stage}"`);
    }
    expect(blocksSource).toContain("data-transformation-path");
    expect(blocksSource).toContain('data-transformation-variant={compact ? "compact" : "complete"}');
  });

  test("uses the approved artifact and editorial proof hierarchy", () => {
    expect(homeSource).toContain('project.title.includes("Pindad")');
    expect(homeSource).toContain('project.title.includes("Xeon")');
    expect(homeSource).toContain('project.title.includes("Bicycle Arcade")');
    expect(homeSource).toContain('variant="editorial"');
    expect(homeSource).not.toContain("profileContent.projects.slice(0, 3)");
    expect(homeSource).not.toContain("<CapabilityPanel");
    expect(blocksSource).toContain('variant = "contained"');
  });

  test("keeps Retail secondary and removes nested Home CTA/reveal shells", () => {
    expect(homeSource).toContain('data-testid="home-retail-discovery"');
    expect(homeSource).toContain('<BrandButton to="/retail" variant="secondary">');
    expect(homeSource).toContain('<BrandPage revealSections={false}>');
    expect(homeSource).toContain('variant="open"');
    expect(brandSource).toContain('data-cta-variant="open"');
    expect(brandSource).toContain('!revealSections && "brand-static-reveal"');
  });

  test("keeps the approved section order", () => {
    const order = [
      "<FlagshipProofSection />",
      "<PrimaryCapabilitiesSection />",
      "<TransformationProcessSection />",
      "<SupportingCapabilitiesSection />",
      "<SelectedProjectsSection />",
      "<RetailDiscoverySection />",
      "<WhyNiuvaSection />",
      "<CTASection",
    ];
    const positions = order.map((token) => homeSource.lastIndexOf(token));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  test("uses semantic inverse, border, and radius roles", () => {
    for (const source of [homeSource, blocksSource, brandSource]) {
      expect(source).not.toMatch(/\b(?:text|border)-white(?:\/\d+)?\b/);
      expect(source).not.toMatch(/\brounded-\[[^\]]+\]/);
      expect(source).not.toMatch(
        /\b(?:bg|text|border|ring)-\[var\(--color/,
      );
    }
  });
});
