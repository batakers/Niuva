const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = __dirname;
const worktreeRoot = path.resolve(root, "..", "..", "..", "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const html = read("index.html");
const css = read("styles.css");
const app = read("app.js");
const server = read("server.cjs");
const manifest = read("ASSET_MANIFEST.md");
const readme = read("README.md");
const brief = fs.readFileSync(
  path.resolve(
    root,
    "..",
    "..",
    "specs",
    "candidates",
    "2026-08-11-niuva-stage-b-visual-world-exploration",
    "CONFIRMED_CANDIDATE_DESIGN_BRIEF.md"
  ),
  "utf8"
);

function section(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex);
  return source.slice(startIndex, endIndex);
}

test("candidate brief remains input while the owner correction is explicit", () => {
  for (let index = 1; index <= 12; index += 1) {
    assert.match(brief, new RegExp(`NCDB-${String(index).padStart(2, "0")}`));
  }
  assert.match(brief, /OWNER-CONFIRMED CANDIDATE/);
  assert.match(readme, /four primary Services/i);
  assert.match(readme, /does not amend/i);
});

test("R4 keeps a centered project-neutral hero and removes the redundant footnote", () => {
  const hero = section(html, '<section class="hero"', '<section class="orientation');
  assert.match(hero, /Dari ide menuju/);
  assert.match(hero, /produk yang dapat diuji/);
  assert.match(hero, /class="contour-field"/);
  assert.doesNotMatch(hero, /hero-footnote|<img\b/);
  assert.doesNotMatch(hero, /split-hero|dashboard|mockup/i);
  assert.match(css, /\.hero-copy[\s\S]*text-align: center/);
  assert.match(css, /\.contour-field[\s\S]*left: 50%/);
  assert.match(css, /width: max\(116vw, 1740px\)/);
});

test("official ni mark is copied byte-for-byte and paired with Niuva text", () => {
  const prototypeMark = fs.readFileSync(path.join(root, "assets", "niuva-mark.svg"));
  const officialMark = fs.readFileSync(path.join(worktreeRoot, "frontend", "public", "niuva-mark.svg"));
  assert.deepEqual(prototypeMark, officialMark);
  assert.equal((html.match(/src="\/assets\/niuva-mark\.svg"/g) || []).length, 2);
  assert.equal((html.match(/<span>Niuva<\/span>/g) || []).length, 2);
});

test("FDM contour owns the boundary and process connectors stop at Output", () => {
  assert.match(html, /class="hero-orientation-shell"/);
  assert.doesNotMatch(css, /\.process-rail::before/);
  assert.match(css, /\.process-rail li:not\(:last-child\)::after/);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*\.process-rail li:not\(:last-child\)::after/);
  for (const stage of ["Need", "Research", "Experiment", "Prototype", "Output"]) {
    assert.match(html, new RegExp(`>${stage}<`));
  }
});

test("bounded Homepage sequence contains all ten sections in order", () => {
  const sequence = [
    'class="hero"',
    'class="orientation ',
    'class="process-section"',
    'class="chapters ',
    'class="projects"',
    'class="services ',
    'class="retail"',
    'class="partnership ',
    'class="faq ',
    'class="closing"'
  ];
  let previous = -1;
  for (const marker of sequence) {
    const current = html.indexOf(marker);
    assert.ok(current > previous, `${marker} must follow the prior section`);
    previous = current;
  }
});

test("mega-menu exposes four primary Services and distinct Retail paths", () => {
  const mega = section(html, '<div class="mega-menu"', '<div class="mega-footer">');
  for (const service of [
    "Research &amp; Development",
    "Consultant &amp; Workshop",
    "Design &amp; Prototyping",
    "Apparel &amp; Merchandise"
  ]) assert.match(mega, new RegExp(service));
  assert.match(mega, /class="mega-retail-routes"/);
  assert.match(mega, /Custom 3D Print/);
  assert.match(mega, /Ready Products/);
  assert.match(html, /class="nav-item nav-retail"/);
  assert.match(css, /grid-template-columns: 3fr 2fr/);
});

test("all four Services have equal structure and one CTA label", () => {
  const services = section(html, '<section class="services ', '<section class="retail"');
  assert.equal((services.match(/<article>/g) || []).length, 4);
  assert.equal((services.match(/data-i18n="viewService"/g) || []).length, 4);
  assert.equal((services.match(/data-prototype-action="service"/g) || []).length, 4);
  assert.doesNotMatch(services, /service-support|supporting capability/i);
  assert.match(css, /\.service-grid[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.doesNotMatch(css, /\.service-grid article[\s\S]{0,180}background:/);
});

test("Retail heading is compact while its transaction boundaries remain honest", () => {
  const retail = section(html, '<section class="retail"', '<section class="partnership ');
  assert.doesNotMatch(retail, />Niuva Retail</);
  assert.match(css, /\.retail-heading[\s\S]*grid-template-columns: minmax\(0, 1\.35fr\) minmax\(280px, 0\.65fr\)/);
  assert.match(retail, /class="retail-custom"/);
  assert.match(retail, /class="retail-ready"/);
  assert.match(retail, /id="self-service"/);
  assert.match(retail, /tanpa membuat Order, reservasi, atau pembayaran/);
  assert.doesNotMatch(`${html}\n${app}`, /Rp\s?[\d.]|checkout berhasil|pembayaran berhasil/i);
});

test("Homepage Contact is a split summary and operational-detail handoff", () => {
  const contact = section(html, '<section class="partnership ', '<section class="faq ');
  assert.match(contact, /class="partnership-copy"/);
  assert.match(contact, /class="partnership-details"/);
  assert.equal((contact.match(/<dt/g) || []).length, 3);
  assert.equal((contact.match(/<dd/g) || []).length, 3);
  assert.match(contact, /data-i18n="openContact"/);
  assert.doesNotMatch(contact, /<form\b|<input\b|<textarea\b/);
  assert.match(app, /Inquiry dicatat lebih dahulu/);
});

test("FAQ is conversational editorial disclosure without chat-bubble decoration", () => {
  const faq = section(html, '<section class="faq ', '</section>');
  assert.equal((faq.match(/<details>/g) || []).length, 3);
  assert.equal((faq.match(/<summary>/g) || []).length, 3);
  assert.doesNotMatch(`${html}\n${css}`, /chat-bubble|speech-bubble/);
  assert.match(css, /\.faq-list details p[\s\S]*margin: 4px 0 8px clamp/);
});

test("macro chapters remain conceptual and real media stays in Projects", () => {
  for (const asset of [
    "assets/niuva-mark.svg",
    "assets/projects/pindad-ev-motor.webp",
    "assets/projects/xeon-redesign.webp",
    "assets/projects/agate-motorcycle-simulator.webp"
  ]) {
    assert.ok(fs.existsSync(path.join(root, asset)), `${asset} must exist`);
    assert.match(manifest, new RegExp(asset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.equal((html.match(/class="chapter-illustration/g) || []).length, 3);
  assert.doesNotMatch(section(html, 'class="chapters ', 'class="projects"'), /<img\b/);
  assert.match(html, /Company Profile Niuva/);
});

test("terminal canvas joins Closing and the adaptive minimal footer", () => {
  const terminal = section(html, '<div class="terminal-canvas">', '<div class="prototype-toast"');
  assert.match(terminal, /class="closing-contour"/);
  assert.match(terminal, /class="closing"/);
  assert.match(terminal, /class="site-footer"/);
  assert.match(terminal, /class="[^"]*\bfooter-row\b[^"]*"/);
  assert.match(css, /terminal-contour-breathe 24s/);
  assert.match(css, /\.footer-row[\s\S]*grid-template-columns: auto 1fr auto/);
  assert.doesNotMatch(css, /\.footer-meta[\s\S]{0,180}border-top:/);
});

test("ID and EN cover the new Service, Contact, footer, and boundary copy", () => {
  assert.match(server, /"\/en"/);
  for (const key of [
    "apparelNote",
    "viewService",
    "serviceApparel",
    "openContact",
    "contactDetailsTitle",
    "contactOwnerLabel",
    "contactResponseLabel",
    "contactFlowLabel",
    "contactFlowValue",
    "footerNav",
    "privacy",
    "toastService",
    "toastPrivacy"
  ]) assert.match(app, new RegExp(`${key}:`));
  assert.doesNotMatch(app, /localStorage|navigator\.language|machine translation|translate\.googleapis/i);
});

test("participant and platform boundaries remain explicit", () => {
  assert.match(html, /bukan website production/);
  assert.match(html, /tidak mengirim atau menyimpan data/);
  assert.match(app, /tidak diaktifkan di prototype/);
  assert.doesNotMatch(`${html}\n${app}`, /fetch\(|XMLHttpRequest|WebSocket|window\.open|wa\.me|api\//i);
});

test("semantic, responsive, and reduced-motion contracts remain explicit", () => {
  assert.match(html, /class="skip-link"/);
  assert.match(html, /id="main-content" tabindex="-1"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /<summary>/);
  assert.match(css, /min-width: 320px/);
  assert.match(css, /min-height: 44px/);
  assert.match(css, /font-size: 16px/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(app, /event\.key !== "Escape"/);
  assert.match(app, /\(hover: hover\) and \(pointer: fine\)/);
});
