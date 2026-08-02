const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const prototypeDir = __dirname;
const app = fs.readFileSync(path.join(prototypeDir, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(prototypeDir, "styles.css"), "utf8");

const functionBody = (name, nextName) => {
  const start = app.indexOf(`function ${name}`);
  const end = app.indexOf(`function ${nextName}`, start + 1);
  assert.notEqual(start, -1, `${name} must exist`);
  assert.notEqual(end, -1, `${nextName} must follow ${name}`);
  return app.slice(start, end);
};

test("default Admin case action is state-aware and Participant copy is evaluator-neutral", () => {
  const dashboard = functionBody("adminDashboard", "adminContent");
  const caseDetail = functionBody("adminCaseDetail", "legacyOrders");

  assert.match(dashboard, /state\.complaintCase/);
  assert.doesNotMatch(caseDetail, /Panel Moderator/);
});

test("legacy customer order route has a dedicated safe-unavailable state", () => {
  assert.match(app, /function legacyCustomerOrderUnavailable\(/);
  assert.match(app, /if \(path === "\/order"\) return legacyCustomerOrderUnavailable\(\);/);
  assert.match(app, /path === "\/order" \|\| path === "\/admin\/orders"/);
  assert.match(app, /Pemesanan lama tidak tersedia/);
});

test("mobile sticky actions name the action they perform", () => {
  assert.match(app, /mobileActionBar\("Keychain Layer", "Rp45\.000", "add-ready", false, "Tambah ke keranjang"\)/);
  assert.match(app, /mobileActionBar\("Total Custom Print", rupiah\(totals\.total\), "add-custom", false, "Tambah ke keranjang"\)/);
  assert.match(app, /mobileActionBar\(cartBarLabel, rupiah\(cartTotal\), "go-checkout", false, cartActionLabel\)/);
});

test("active payment attempt locks cart mutation and offers payment recovery", () => {
  const cart = functionBody("cartPage", "checkoutAuthGate");

  assert.match(app, /const hasActiveCheckoutAttempt = \(\) =>/);
  assert.match(cart, /const cartLocked = hasActiveCheckoutAttempt\(\);/);
  assert.match(cart, /Keranjang terkunci pada Order/);
  assert.match(cart, /Kembali ke pembayaran/);
  assert.match(cart, /const cartTotal = cartLocked \? state\.orderSnapshot\.total : subtotal;/);
  assert.match(cart, /const cartBarLabel = cartLocked \? "Reservasi aktif" : "Total sementara";/);
  assert.match(cart, /cartLocked \? rupiah\(state\.orderSnapshot\.shipping\) : "Dihitung di checkout"/);
  assert.match(cart, /cartLocked \? " disabled" : ""/);
  assert.match(cart, /cartLocked\s*\? ""\s*:/);
});

test("checkout exposes current step and avoids pre-Order preview copy after confirmation", () => {
  const checkout = functionBody("checkoutPage", "orderRefFromPath");

  assert.match(checkout, /aria-current="step"/);
  assert.doesNotMatch(checkout, /Kembali ke pratinjau untuk mengubah/);
  assert.match(checkout, /Lihat keranjang terkunci/);
});

test("mobile Ready Product media has a bounded height", () => {
  assert.match(app, /product-figure ready-product-figure/);
  assert.match(styles, /\.ready-product-figure\s*\{[^}]*min-height:\s*470px;/s);
  assert.match(styles, /@media \(max-width: 620px\)[\s\S]*\.ready-product-figure\s*\{[^}]*min-height:\s*260px;/s);
});
