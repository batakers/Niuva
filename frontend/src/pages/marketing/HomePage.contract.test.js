const fs = require("fs");
const path = require("path");

const read = (...segments) =>
  fs.readFileSync(path.resolve(__dirname, ...segments), "utf8");

const homeSource = read("HomePage.jsx");
const visualSource = read("home", "HomePageVisuals.jsx");
const styleSource = read("home", "HomePageR4.css");
const normalizeWhitespace = (source) => source.replace(/\s+/g, " ");

describe("NDS 2.0 Homepage R4 production pilot contract", () => {
  test("keeps the centered project-neutral hero and one bounded identity gesture", () => {
    expect(homeSource).toContain("Dari ide menuju");
    expect(homeSource).toContain("produk yang dapat diuji.");
    expect(homeSource).toContain("home-r4-hero-inner");
    expect(homeSource).not.toContain("home-hero-artifact");
    expect(homeSource).not.toContain("flagshipProject");
    expect(homeSource.match(/<HomeFdmContour\b/g)).toHaveLength(2);
    expect(visualSource).toContain('data-motion-active="false"');
    expect(styleSource).toContain("@media (prefers-reduced-motion: reduce)");
  });

  test("renders the canonical process once and stops the connector at Output", () => {
    for (const stage of ["Need", "Research", "Experiment", "Prototype", "Output"]) {
      expect(homeSource).toContain(`name: "${stage}"`);
    }
    expect(homeSource.match(/home-r4-process-rail/g)).toHaveLength(1);
    expect(styleSource).toContain(".home-r4-process-rail li:not(:last-child)::after");
    expect(styleSource).not.toContain(".home-r4-process-rail li::after");
  });

  test("keeps all four primary services at equal visual rank and route contract", () => {
    const order = [
      "research-development",
      "consultant-workshop",
      "design-prototyping",
      "apparel-merchandise",
    ];
    const positions = order.map((slug) => homeSource.indexOf(`"${slug}"`));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(homeSource).toContain('data-service-rank="primary"');
    expect(homeSource).toContain('to="/capabilities"');
    expect(homeSource).not.toContain("service.priority");
    expect(homeSource).not.toContain("supportingCapabilities");
  });

  test("uses conceptual chapter visuals and factual project media only for proof", () => {
    for (const chapter of ["understand", "shape", "prove"]) {
      expect(homeSource).toContain(`key: "${chapter}"`);
      expect(visualSource).toContain(`type === "${chapter}"`);
    }
    for (const title of [
      "Pengembangan Motor EV PT Pindad",
      "Redesain Motor Xeon",
      "Motorcycle Simulator Agate",
    ]) {
      expect(homeSource).toContain(`"${title}"`);
    }
    expect(homeSource).toContain("project.title === title");
    expect(homeSource).not.toContain("project.title.includes");
    expect(homeSource).toContain("Company Profile Niuva");
  });

  test("preserves B2B, Retail, Contact, and fail-closed route boundaries", () => {
    expect(homeSource).toContain('to="/contact"');
    expect(homeSource).toContain('to="/retail"');
    expect(homeSource).toContain('to="/projects"');
    expect(normalizeWhitespace(homeSource)).toContain(
      "tanpa membuat Order, reservasi, atau pembayaran",
    );
    expect(homeSource).not.toContain("checkout(");
    expect(homeSource).not.toContain("payment(");
    expect(homeSource).not.toContain("fetch(");
  });

  test("reuses NDS semantic roles without a page-local palette or dependency", () => {
    expect(homeSource).toContain('className="home-r4 nds-public-surface"');
    expect(homeSource).toContain('from "@/components/ui/button"');
    expect(styleSource).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(styleSource).not.toContain("transition: all");
    expect(styleSource).not.toContain("linear-gradient");
    expect(styleSource).not.toContain("backdrop-filter");
    expect(normalizeWhitespace(styleSource)).toContain(
      ".home-r4-retail-boundary { max-width: 78ch; margin: var(--space-8) 0 0; color: var(--home-r4-muted); font-size: 1rem; }",
    );
    expect(normalizeWhitespace(styleSource)).toContain(
      ".home-r4-projects a:focus-visible, .home-r4-closing a:focus-visible { outline: 3px solid; outline-color: var(--nds-blue-300);",
    );
  });
});
