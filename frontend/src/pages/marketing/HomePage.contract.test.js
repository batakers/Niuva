const fs = require("fs");
const path = require("path");

const read = (...segments) =>
  fs.readFileSync(path.resolve(__dirname, ...segments), "utf8");

const homeSource = read("HomePage.jsx");
const gallerySource = read("home", "NiuvaProjectGallery.jsx");
const styleSource = read("home", "HomePageR4.css");
const foundationSource = read("..", "..", "index.css");
const normalizeWhitespace = (source) => source.replace(/\s+/g, " ");

describe("NDS 2.0 Homepage R4 production pilot contract", () => {
  test("keeps the centered project-neutral hero without the retired contour gesture", () => {
    expect(homeSource).toContain("Dari ide menuju");
    expect(homeSource).toContain("produk yang dapat diuji.");
    expect(homeSource).toContain("home-r4-hero-inner");
    expect(homeSource).not.toContain("home-hero-artifact");
    expect(homeSource).not.toContain("flagshipProject");
    expect(homeSource).not.toContain("HomeFdmContour");
    expect(styleSource).not.toContain("home-r4-contour");
    expect(styleSource).toContain("@media (prefers-reduced-motion: reduce)");
  });

  test("removes decorative horizontal divider rules while retaining real panel boundaries", () => {
    expect(styleSource).not.toContain("border-top: 1px solid var(--public-studio-line)");
    expect(styleSource).not.toContain("border-bottom: 1px solid var(--public-studio-line)");
    expect(styleSource).toContain(".home-r4-contact aside");
    expect(styleSource).toContain("border: 1px solid var(--public-studio-line)");
    expect(styleSource).toContain("border-left: 1px solid var(--public-studio-line)");
  });

  test("restores the accepted R4 measure and section hierarchy", () => {
    for (const label of [
      "Satu partner, dua cara memulai",
      "Cara kerja",
      "Layanan Niuva",
    ]) {
      expect(homeSource).toContain(label);
    }
    expect(styleSource).toContain("73.75rem");
    expect(homeSource.match(/home-r4-editorial-intro/g)).toHaveLength(4);
    expect(styleSource).toContain(".home-r4-editorial-intro");
    expect(styleSource).not.toContain("minmax(0, 0.9fr) minmax(0, 1.35fr)");
    expect(styleSource).not.toContain("minmax(0, 0.55fr) minmax(0, 1.45fr)");
    expect(styleSource).not.toContain("minmax(0, 1.35fr) minmax(17.5rem, 0.65fr)");
    expect(styleSource).not.toContain("processBody");
  });

  test("keeps the Hero transition and Closing Footer clear without contour ornament", () => {
    expect(styleSource).toContain("padding-block: calc(var(--nav-offset) + var(--space-6))");
    expect(styleSource).toContain("padding-top: clamp(9rem, 12vw, 12rem)");
    expect(styleSource).toContain("background: transparent");
    expect(styleSource).toContain("--home-r4-terminal-footer-height");
    expect(styleSource).toContain("margin-top: calc(-1 * var(--home-r4-terminal-footer-height))");
    expect(styleSource).toContain(".home-r4-terminal-footer-inner");
    expect(styleSource).toContain("padding-bottom: calc(var(--home-r4-terminal-footer-height) + var(--space-20))");
    expect(styleSource).toContain("min-height: max(42rem, 100svh)");
    expect(styleSource).not.toContain(".home-r4-terminal-footer::before");
  });

  test("renders the canonical process once and stops the connector at Output", () => {
    for (const stage of ["Need", "Research", "Experiment", "Prototype", "Output"]) {
      expect(homeSource).toContain(`name: "${stage}"`);
    }
    expect(homeSource.match(/home-r4-process-rail/g)).toHaveLength(1);
    expect(homeSource).toContain("IntersectionObserver");
    expect(homeSource).toContain("data-motion-ready");
    expect(styleSource).toContain(".home-r4-process-rail li:not(:last-child)::after");
    expect(styleSource).toContain('.home-r4-process-rail[data-motion-ready="true"]');
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
    expect(homeSource).toContain('getPublicPath("services", locale)');
    expect(homeSource).toContain("hash: service.slug");
    expect(homeSource).not.toContain("service.priority");
    expect(homeSource).not.toContain("supportingCapabilities");
  });

  test("moves directly from the canonical process to factual project proof", () => {
    expect(homeSource).not.toContain("ChaptersSection");
    expect(homeSource).not.toContain("ChapterArticle");
    expect(homeSource).not.toContain("chaptersId");
    expect(homeSource).not.toContain("chaptersEn");
    expect(homeSource.indexOf("<ProcessSection")).toBeLessThan(
      homeSource.indexOf("<ProjectsSection"),
    );
    for (const title of [
      "Pengembangan Motor EV PT Pindad",
      "Redesain Motor Xeon",
      "Motorcycle Simulator Agate",
    ]) {
      expect(homeSource).toContain(`"${title}"`);
    }
    expect(homeSource).toContain("project.title === title");
    expect(homeSource).not.toContain("project.title.includes");
    expect(homeSource).toContain("NiuvaProjectGallery");
    expect(gallerySource).toContain("item.imageAlt");
    expect(gallerySource).toContain("item.shortTitle");
    expect(gallerySource).toContain("home-r4-project-compact-label");
    expect(gallerySource).toContain("home-r4-project-expanded");
    expect(gallerySource).toContain("item.preview || item.body");
    expect(gallerySource).toContain('data-active-index={activeIndex}');
    expect(gallerySource).toContain("ArrowRight");
    expect(gallerySource).not.toContain("picsum.photos");
    expect(homeSource).not.toContain("Ilustrasi konseptual:");
  });

  test("uses the bounded Public authored-motion grammar without a gallery dependency", () => {
    expect(homeSource.match(/home-r4-hero-enter(?=[\s"])/g)).toHaveLength(4);
    expect(homeSource).toContain("useMotionReady");
    expect(styleSource).toContain("@keyframes home-r4-hero-enter");
    expect(styleSource).toContain("@keyframes home-r4-hero-line-enter");
    expect(styleSource).toContain("@keyframes home-r4-hero-fade");
    expect(styleSource).toContain("transition: flex-grow var(--public-motion-media) var(--public-ease-shape)");
    expect(styleSource).toContain("transition: grid-template-rows var(--public-motion-media) var(--public-ease-shape)");
    expect(styleSource).toContain(
      ".home-r4-project-panel.is-active .home-r4-project-scrim {\n  background: rgb(var(--public-studio-evidence-rgb) / 0.88);",
    );
    expect(styleSource).not.toContain(".home-r4-chapter");
    expect(foundationSource).toContain("--public-motion-focal: 720ms");
    expect(foundationSource).toContain("--public-motion-story: 560ms");
    expect(foundationSource).toContain("--public-motion-media: 640ms");
    expect(foundationSource).not.toContain("--public-motion-ambient");
    expect(foundationSource).not.toContain("--public-studio-contour-light");
    expect(foundationSource).not.toContain("--public-studio-contour-dark");
    expect(styleSource).not.toContain("--ease-snap");
    expect(homeSource).not.toContain("gsap");
    expect(gallerySource).not.toContain("onMouseEnter");
  });

  test("preserves B2B, Retail, Contact, and fail-closed route boundaries", () => {
    expect(homeSource).toContain('getPublicPath("contact", locale)');
    expect(homeSource).toContain('getPublicPath("retail", locale)');
    expect(homeSource).toContain('getPublicPath("projects", locale)');
    expect(normalizeWhitespace(homeSource)).toContain(
      "tanpa membuat Order, reservasi, atau pembayaran",
    );
    expect(homeSource).not.toContain("checkout(");
    expect(homeSource).not.toContain("payment(");
    expect(homeSource).not.toContain("fetch(");
  });

  test("uses Public studio aliases without a page-local palette or dependency", () => {
    expect(homeSource).toContain('className="home-r4 nds-public-surface"');
    expect(homeSource).toContain('from "@/components/ui/button"');
    expect(styleSource).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(foundationSource).toContain("--public-studio-canvas: #F3F5F2");
    expect(foundationSource).toContain("--public-studio-action: #2C628F");
    expect(foundationSource).toContain("--public-studio-evidence: #081821");
    expect(foundationSource).toContain("--commerce-canvas: var(--color-surface-canvas)");
    expect(foundationSource).toContain("--account-canvas: var(--color-surface-canvas)");
    expect(foundationSource).toContain("--operations-canvas: var(--color-surface-canvas)");
    expect(styleSource).toContain("background: var(--public-studio-canvas)");
    expect(styleSource).toContain("--home-r4-dark: var(--public-studio-evidence)");
    expect(styleSource).not.toContain("transition: all");
    expect(styleSource).not.toMatch(/linear-gradient/g);
    expect(styleSource).not.toContain("background: linear-gradient");
    expect(styleSource).not.toContain("backdrop-filter");
    expect(normalizeWhitespace(styleSource)).toContain(
      ".home-r4-retail-boundary { max-width: 78ch; margin: var(--space-8) 0 0; color: var(--home-r4-muted); font-size: 1rem; }",
    );
    expect(normalizeWhitespace(styleSource)).toContain(
      ".home-r4-projects a:focus-visible, .home-r4-closing a:focus-visible { outline: var(--focus-ring-width) solid; outline-color: var(--home-r4-inverse-muted);",
    );
    expect(normalizeWhitespace(styleSource)).toContain(
      ".home-r4-contact aside { border: 1px solid var(--public-studio-line); border-radius: var(--radius-panel); background: var(--public-studio-process);",
    );
    expect(styleSource).not.toContain("border-radius: 0 0 var(--radius-panel) var(--radius-panel)");
  });
});
