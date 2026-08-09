const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const data = require("./fixtures.js");

const root = __dirname;
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const participant = read("index.html");
const review = read("review.html");
const app = read("app.js");
const css = read("styles.css");
const server = read("server.cjs");

function unique(items) {
  return new Set(items).size === items.length;
}

function transition(id) {
  return data.TRANSITIONS.find((item) => item.id === id);
}

test("R6 baseline and packet inventory are exact", () => {
  assert.equal(data.VERSION, "r6-candidate-static");
  assert.equal(data.BASELINE, "237e64adce816f71f8461eca3242aa72edb662f2");
  assert.equal(data.FRAME_IDS.length, 37);
  assert.equal(data.TRANSITION_IDS.length, 95);
  assert.equal(data.FIXTURE_IDS.length, 43);
  assert.equal(data.SCENARIO_IDS.length, 44);
  assert.equal(data.VISUAL_REQUIREMENT_IDS.length, 5);
  assert.ok(unique(data.FRAME_IDS));
  assert.ok(unique(data.TRANSITION_IDS));
  assert.ok(unique(data.FIXTURE_IDS));
  assert.ok(unique(data.SCENARIO_IDS));
  assert.deepEqual(Object.keys(data.SCENARIOS).sort(), [...data.SCENARIO_IDS].sort());
});

test("Participant and Review surfaces are structurally separated", () => {
  assert.match(participant, /data-page="participant"/);
  assert.match(participant, /id="product-main"/);
  assert.match(participant, /id="productNav"/);
  assert.doesNotMatch(participant, /Review Mode|scenarioSelect|reviewFixture|reviewFrame|eventList/);
  assert.doesNotMatch(participant, /\b(?:WF|PT|SCN|FX)-[A-Z0-9-]+\b/);
  assert.match(review, /data-page="review"/);
  assert.match(review, /Review Mode/);
  assert.match(review, /id="scenarioSelect"/);
  assert.match(review, /id="reviewFixture"/);
  assert.match(review, /id="reviewFrame"/);
  assert.match(review, /id="eventList"/);
  assert.match(review, /href="index\.html"/);
});

test("Participant DOM scrub removes evaluator and route leakage", () => {
  assert.match(app, /function scrubParticipantMarkup/);
  assert.match(app, /\.route-tag, \.frame-id, \[data-review-only\]/);
  assert.match(app, /NodeFilter\.SHOW_TEXT/);
  assert.match(app, /\(\?:WF\|PT\|SCN\|FX\)/);
  assert.match(app, /node\.removeAttribute/);
  assert.match(app, /actionRegistry/);
  assert.match(app, /data-action="dispatch"/);
  assert.match(app, /identity"\) === "logo-hidden"/);
  assert.match(css, /data-identity-review="logo-hidden"/);
});

test("critical commercial and transaction boundaries fail closed", () => {
  assert.equal(transition("PT-CFG-03").to, "WF-REQ-01");
  assert.equal(transition("PT-CFG-03").noCommit, true);
  assert.equal(transition("PT-OFFER-01").noCommit, true);
  assert.equal(transition("PT-CHK-04").noCommit, true);
  assert.equal(transition("PT-ADM-10").noCommit, true);
  assert.equal(transition("PT-PAY-02").noDuplicate, true);
  assert.match(app, /Request tersimpan tanpa membuat pesanan/);
  assert.match(app, /tidak ada tombol bayar ulang/i);
  assert.match(app, /Harga sesuai Offer/);
  assert.match(app, /assembly-large\.3mf/);
  assert.match(app, /money\(185000\)/);
});

test("checkout delta and reservation evidence are explicit", () => {
  assert.match(app, /function commercialSnapshot/);
  assert.match(app, /state\.offerState === "accepted"/);
  assert.match(app, /itemTotal: 185000/);
  assert.match(app, /checkoutAdjustment: 0/);
  assert.match(app, /state\.checkoutAdjustment = 2000/);
  assert.match(app, /Penyesuaian harga setelah validasi/);
  assert.match(app, /const total = itemTotal \+ delivery \+ adjustment/);
  assert.match(app, /money\(committedTotal\(\)\)/);
  assert.match(app, /reservationSeconds: 1800/);
  assert.match(app, /Sisa waktu lima menit/);
  assert.match(app, /Reservasi berakhir/);
});

test("offer snapshot survives checkout, payment, and order views", () => {
  assert.match(app, /if \(id === "PT-OFFER-01"\) state\.offerState = "accepted"/);
  assert.match(app, /name: "Cetak assembly-large\.3mf"/);
  assert.match(app, /PLA · multicolor · ETA 5–7 hari kerja · Harga sesuai Offer/);
  assert.match(app, /const snapshot = commercialSnapshot\(\)/);
  assert.doesNotMatch(app, /money\(63000\)/);
});

test("milestones use complete unmerged sequences", () => {
  assert.match(app, /function milestoneSequence/);
  for (const stateName of [
    "payment_confirmed",
    "processing_or_packing",
    "file_review_when_applicable",
    "production_queue",
    "printing",
    "post_processing_when_applicable",
    "quality_control",
    "ready_for_pickup",
    "picked_up",
    "ready_to_ship",
    "shipped",
    "delivered",
    "completed"
  ]) {
    assert.match(app, new RegExp(`\\["${stateName}"`));
  }
  assert.doesNotMatch(app, /Antrean produksi dan printing/);
  assert.doesNotMatch(app, /Post-processing dan QC/);
});

test("after-sales actions follow fixture eligibility", () => {
  assert.match(app, /FX-AFTER-LIFECYCLE/);
  assert.match(app, /\["cancellation", "revision"\]/);
  assert.match(app, /\["complaint", "revision"\]/);
  assert.match(app, /eligibleTypes\.map/);
  assert.match(app, /tidak tersedia untuk fase pesanan sintetis ini/);
});

test("role, ownership, and customer projection boundaries remain visible", () => {
  assert.match(app, /function isAdminFrame/);
  assert.match(app, /operatorSession/);
  assert.match(app, /manager_approver/);
  assert.match(app, /sales_estimator/);
  assert.match(app, /Biaya internal, pemasok, margin/);
  assert.match(app, /Data tersebut tidak dapat ditampilkan/);
  assert.match(app, /tanpa membocorkan keberadaan data/);
  assert.match(app, /Tidak ada notifikasi berhasil ketika penyimpanan ditolak/);
});

test("B2B and after-sales forms retain validation and consent contracts", () => {
  assert.match(app, /function b2bValidation/);
  assert.match(app, /data-field="b2b-/);
  assert.match(app, /b2bErrors/);
  assert.match(app, /FX-B2B-PERSISTENCE-FAIL/);
  assert.match(app, /b2b-retry/);
  assert.match(app, /privasi/i);
  assert.match(app, /data-action="case-type"/);
  assert.match(app, /submit-after-sales/);
  assert.match(app, /afterSalesType/);
  assert.match(app, /Jelaskan singkat apa yang terjadi/);
});

test("prototype is hermetic and provider-neutral", () => {
  assert.doesNotMatch(app, /\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource/);
  assert.doesNotMatch(`${participant}\n${review}\n${app}\n${css}`, /https?:\/\//);
  assert.doesNotMatch(app, /window\.location\s*=|location\.href\s*=/);
  assert.match(app, /sessionStorage/);
  assert.doesNotMatch(app, /localStorage/);
  assert.match(server, /127\.0\.0\.1/);
  assert.match(server, /4176/);
  assert.match(server, /startsWith\(root \+ path\.sep\)/);
  assert.match(server, /"\.svg": "image\/svg\+xml/);
  assert.match(server, /"\.webp": "image\/webp"/);
});

test("semantic, keyboard, and responsive contracts are present", () => {
  assert.match(participant, /class="skip-link"/);
  assert.match(participant, /<main id="product-main"[^>]+tabindex="-1"/);
  assert.match(participant, /id="notice"[^>]+aria-live="polite"[^>]+tabindex="-1"/);
  assert.match(app, /aria-current="page"/);
  assert.match(app, /setAttribute\("aria-current", "step"\)/);
  assert.match(app, /setAttribute\("role", "list"\)/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /@media \(max-width: 520px\)/);
  assert.match(css, /scrollbar-width:\s*none/);
  assert.match(css, /repeat\(auto-fit,minmax\(180px,1fr\)\)/);
});

test("visual contract avoids generic and unsafe motion treatments", () => {
  assert.match(css, /--brand-primary:\s*#6390bb/i);
  assert.match(css, /--action:\s*#4a72a0/i);
  assert.match(css, /\[data-family="public"\]/);
  assert.match(css, /\[data-family="retail"\]/);
  assert.match(css, /\[data-family="admin"\]/);
  assert.doesNotMatch(css, /linear-gradient|radial-gradient|backdrop-filter/);
  assert.doesNotMatch(css, /transition:\s*all/);
  assert.doesNotMatch(css, /scale\(0\)|ease-in(?:\s|;|,)/);
  assert.doesNotMatch(css, /letter-spacing:\s*-\.(?:0[5-9]|[1-9][0-9])em/);
  assert.doesNotMatch(css, /border-left:\s*[2-9][0-9]*px/);
  assert.match(css, /\.context-line, \.eyebrow, \.capability-index \{ display: none; \}/);
  assert.match(participant, /niuva-mark\.svg/);
  assert.match(app, /pindad-ev-motor\.webp/);
  assert.match(app, /agate-motorcycle-simulator\.webp/);
  assert.match(app, /class="public-process"/);
  assert.match(app, /Kebutuhan<\/span><span>File<\/span><span>Keputusan<\/span><span>Objek/);
});

test("repository-derived visual assets are present locally", () => {
  const assets = [
    "assets/niuva-mark.svg",
    "assets/projects/xeon-redesign.webp",
    "assets/projects/pindad-ev-motor.webp",
    "assets/projects/agate-motorcycle-simulator.webp",
    "assets/projects/agate-bicycle-arcade.webp"
  ];
  for (const asset of assets) {
    const fullPath = path.join(root, asset);
    assert.equal(fs.existsSync(fullPath), true, `${asset} should exist`);
    assert.ok(fs.statSync(fullPath).size > 0, `${asset} should not be empty`);
  }
});

test("reset and focus recovery are explicit", () => {
  assert.match(app, /sessionStorage\.removeItem\(seedStorageKey\)/);
  assert.match(app, /sessionStorage\.removeItem\(reviewStorageKey\)/);
  assert.match(app, /focusTarget/);
  assert.match(app, /focus\(\{ preventScroll: true \}\)/);
  assert.match(app, /queueFocus\("#notice"\)/);
  assert.match(app, /queueFocus\("#case-note"\)/);
});
