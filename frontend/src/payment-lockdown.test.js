const fs = require("fs");
const path = require("path");

const orderDetailPath = path.join(
  __dirname,
  "pages",
  "operational",
  "OrderDetail.jsx"
);
const adminOrdersPath = path.join(__dirname, "pages", "admin", "Orders.jsx");
const i18nPath = path.join(__dirname, "i18n.js");

describe("Legacy manual-transfer lockdown", () => {
  test("customer order detail has no payment-proof mutation affordance", () => {
    const source = fs.readFileSync(orderDetailPath, "utf8");

    expect(source).not.toContain("/payment-proof");
    expect(source).not.toContain("order.file?.storage_path");
    expect(source).toContain("downloadApiFile");
    expect(source).toContain("/orders/${order.id}/design-file");
    expect(source).not.toContain('data-testid="upload-proof-btn"');
    expect(source).toContain('t("payment.mutationsDisabled")');
    expect(source).toContain("order.payment");
  });

  test("admin order detail keeps legacy evidence read-only", () => {
    const source = fs.readFileSync(adminOrdersPath, "utf8");

    expect(source).not.toContain("/estimate");
    expect(source).not.toContain("/verify-payment");
    expect(source).not.toContain('data-testid="submit-estimate"');
    expect(source).not.toContain('data-testid="verify-payment"');
    expect(source).toContain("order.estimate");
    expect(source).toContain("order.payment.proof");
    expect(source).toContain('t("payment.legacyReadOnly")');
  });

  test("lockdown copy is localized in Indonesian and English", () => {
    const source = fs.readFileSync(i18nPath, "utf8");

    expect(source.match(/"payment\.mutationsDisabled":/g)).toHaveLength(2);
    expect(source.match(/"payment\.legacyReadOnly":/g)).toHaveLength(2);
    expect(source.match(/"payment\.providerInactive":/g)).toHaveLength(2);
  });
});
