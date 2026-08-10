const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = __dirname;
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const index = read("index.html");
const app = read("app.js");
const css = read("styles.css");
const review = read("review.html");
const fixtures = read("fixtures.js");

test("participant shell exposes semantic entry points and simulation notice", () => {
  assert.match(index, /lang="id"/);
  assert.match(index, /skip-link/);
  assert.match(index, /id="app"/);
  assert.match(app, /SIMULASI/);
  assert.match(app, /id="main-content"/);
  assert.match(app, /aria-live="polite"/);
});

test("public route contract covers Home, Projects, detail, and Contact", () => {
  assert.match(app, /normalizeRoute\(pathname\)/);
  assert.match(app, /clean === "\/projects"/);
  assert.match(app, /clean === "\/contact"/);
  assert.match(app, /project-detail/);
  assert.match(app, /getDetailSlug\(pathname\)/);
  assert.match(app, /projectData\[state\.detailSlug\]/);
  assert.match(app, /homeView\(\)/);
  assert.match(app, /projectsView\(\)/);
  assert.match(app, /contactView\(\)/);
});

test("unknown project slugs never substitute an approved artifact", () => {
  assert.match(app, /return match \? \(keyBySlug\[match\[1\]\] \|\| null\) : null/);
  assert.match(app, /function projectNotFoundView\(\)/);
  assert.match(app, /label = state\.detailSlug \? \"project-detail\" : \"project-not-found\"/);
  assert.doesNotMatch(app, /projectData\[state\.detailSlug\] \|\| projectData\.pindad/);
  assert.match(app, /Project tidak ditemukan/);
});

test("persistence failure is a retryable state, not field validation", () => {
  assert.match(app, /contactState === \"persistence-unavailable\"/);
  assert.match(app, /id=\"persistence-status\" role=\"alert\"/);
  assert.match(app, /data-action=\"persistence-retry\"/);
  assert.match(app, /state\.errors = \{\}/);
  assert.match(app, /state\.persistenceFailure = false/);
  assert.match(app, /state\.contactState = \"persistence-unavailable\"/);
  assert.match(fixtures, /Penyimpanan gagal setelah submit/);
});

test("home transformation path maps to the canonical U-curve", () => {
  ["Need", "Research", "Experiment", "Prototype", "Output"].forEach((stage) => assert.match(app, new RegExp("[>\\\"]" + stage)));
  assert.match(app, /hero-path/);
  assert.doesNotMatch(app, /thread-number|artifact-index|01 \/ bukti kerja|01 \/ konteks/);
  assert.doesNotMatch(css, /text-transform:\s*uppercase/);
  assert.match(app, /Halaman transaksi Retail belum dibuka di prototype ini/);
  assert.match(app, /aria-describedby=\"retail-status\"/);
});

test("B2B form contains the approved consent and response contract", () => {
  assert.match(app, /Saya setuju Niuva menggunakan data ini untuk meninjau inquiry dan menghubungi saya terkait kebutuhan yang saya kirim\. Data tidak digunakan untuk marketing tanpa persetujuan terpisah\./);
  assert.match(app, /Niuva Operations/);
  assert.match(app, /Maks\. 1 hari kerja/);
  assert.match(app, /Senin–Jumat · 09\.00–17\.00 WIB/);
  assert.match(app, /quotation, harga, ETA/);
});

test("deep links and contact status preserve visible context", () => {
  assert.match(index, /<base href="\/" \/>/);
  assert.match(app, /function assetPath\(relativePath\)/);
  assert.match(app, /id="contact-status" tabindex="-1"/);
  assert.match(app, /revealContactState\("#form-error-summary"\)/);
  assert.match(app, /revealContactState\("#contact-status"\)/);
  assert.match(app, /contact-response-summary/);
  assert.match(app, /contact-start-actions/);
  assert.match(app, /contact-whatsapp-start/);
  assert.match(app, /whatsapp-handoff-confirmed/);
  assert.match(app, /function whatsappHandoffView\(\)/);
  assert.match(app, /inquirySubmitted/);
  assert.match(app, /whatsappReturnState/);
  assert.match(app, /Inquiry belum tercatat karena form belum dikirim/);
  assert.match(app, /state\.contactState = "whatsapp-handoff-confirmed"/);
  assert.match(app, /revealContactState\("#whatsapp-handoff-status"\)/);
  assert.match(app, /Inquiry hanya tercatat setelah Anda mengirim form/);
  assert.match(app, /function focusAfterContactReturn\(contactState\)/);
  assert.match(app, /focusAfterRender/);
  assert.match(app, /id="inquiry-form" tabindex="-1"/);
  assert.match(css, /\.inquiry-form \{[^}]*scroll-margin-top: 6rem/);
  assert.match(fixtures, /"contact-invalid"[\s\S]*seed/);
  assert.match(css, /scroll-margin-top: 6rem/);
});

test("P2 visual polish keeps deferred and fallback states honest", () => {
  assert.match(css, /\.site-header \{[^}]*background: var\(--color-surface-page\)/);
  assert.match(css, /\.project-image-caption/);
  assert.match(app, /Retail sedang disiapkan/);
  assert.match(app, /retailDeferred/);
  assert.doesNotMatch(app, /href="#retail"/);
  assert.match(app, /Lokasi detail belum tersedia di prototype/);
  assert.match(fixtures, /Penyimpanan gagal setelah submit/);
  assert.match(review, /penyimpanan gagal setelah submit/);
});

test("participant mode has no review controls or evaluator vocabulary", () => {
  assert.doesNotMatch(index, /review\.html|evaluator|CVR-|VRA-|WF-|SCN-|route contract|OPEN GATES/i);
  assert.doesNotMatch(app, /fetch\(|XMLHttpRequest|navigator\.sendBeacon|https?:\/\//i);
  assert.match(review, /REVIEW MODE/);
  assert.match(review, /sessionStorage/);
  assert.match(fixtures, /contact-unavailable/);
  assert.match(fixtures, /contact-persistence-fail/);
  assert.match(review, /contact-persistence-fail/);
});

test("WhatsApp handoff does not impersonate Inquiry persistence", () => {
  const start = app.indexOf('if (action === "whatsapp-confirm")');
  const end = app.indexOf('if (action === "whatsapp-return")', start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const handoffHandler = app.slice(start, end);
  assert.match(handoffHandler, /whatsapp-handoff-confirmed/);
  assert.doesNotMatch(handoffHandler, /contactState\s*=\s*"success"/);
  assert.match(app, /Inquiry (?:Anda )?sudah tercatat/);
  assert.match(app, /Inquiry belum tercatat karena form belum dikirim/);
});

test("prototype remains visually constrained to approved system", () => {
  assert.doesNotMatch(css, /gradient|glassmorphism|backdrop-filter|transition:\s*all|@import/i);
  assert.match(css, /--color-action-primary:\s*#4a72a0/);
  assert.match(css, /--font-display:\s*Poppins/);
  assert.match(css, /--font-body:\s*Inter/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /min-height:\s*44px/);
});

test("no production runtime imports or durable mutations are present", () => {
  for (const file of ["index.html", "review.html", "app.js", "fixtures.js", "server.cjs"]) {
    const source = read(file);
    assert.doesNotMatch(source, /frontend\/src|backend\/|mongodb|stripe|payment|api\/v1/i);
  }
  assert.match(app, /sessionStorage/);
  assert.doesNotMatch(app, /localStorage\.setItem|document\.cookie|indexedDB/i);
});
