const fs = require("fs");
const path = require("path");

const read = (...segments) =>
  fs.readFileSync(path.resolve(__dirname, ...segments), "utf8");

const settingsSource = read("Settings.jsx");
const i18nSource = read("..", "..", "i18n.js");

const LEGACY_PAYMENT_FIELDS = ["bank_name", "account_number", "account_holder"];

describe("Settings owns the company profile", () => {
  test("the admin screen reads the admin surface", () => {
    // The public read carries the profile only: no integration status and no
    // legacy payment record.
    expect(settingsSource).toContain('.get("/admin/settings")');
    expect(settingsSource).not.toContain('.get("/settings")');
  });

  test("the form edits profile fields, not payment details", () => {
    expect(settingsSource).toContain('data-testid={`settings-${field}`}');
    expect(settingsSource).toContain('"legal_name"');
    expect(settingsSource).toContain('"whatsapp"');
    for (const field of LEGACY_PAYMENT_FIELDS) {
      expect(settingsSource).not.toContain(`updateField("${field}")`);
    }
  });

  test("the save sends only the named profile fields", () => {
    // Sending the whole form back would try to write the integration status
    // and the legacy record, which the endpoint forbids.
    expect(settingsSource).not.toContain('api.put("/admin/settings", form)');
    expect(settingsSource).toContain("legal_name: form.legal_name");
  });
});

describe("Legacy payment data is readable but inert", () => {
  test("it is shown outside the form and cannot be edited", () => {
    expect(settingsSource).toContain('data-testid="settings-legacy-payment"');
    expect(settingsSource).toContain("form.legacy_payment_readonly");
    expect(settingsSource).toContain('t("settings.legacyPaymentDesc")');
  });
});

describe("Integration cards are provider neutral", () => {
  test("they report status and name no vendor", () => {
    expect(settingsSource).toContain('data-testid="settings-integrations"');
    expect(settingsSource).toContain("form.integrations");
    expect(settingsSource).toContain('t("settings.integrationInactive")');
  });

  test("no credential input exists on the screen", () => {
    for (const secret of ["api_key", "apiKey", "secret", "token", "credential"]) {
      expect(settingsSource.toLowerCase()).not.toContain(secret.toLowerCase());
    }
  });

  test("no vendor is named in the copy", () => {
    for (const vendor of ["Midtrans", "Xendit", "Stripe", "Twilio", "SendGrid"]) {
      expect(i18nSource).not.toContain(vendor);
    }
  });
});

describe("Settings localization", () => {
  test("localizes the profile and integration copy in both languages", () => {
    for (const key of [
      "settings.profileDesc",
      "settings.legalName",
      "settings.whatsapp",
      "settings.integrations",
      "settings.integrationsDesc",
      "settings.integrationInactive",
      "settings.capability.payment",
      "settings.legacyPayment",
      "settings.legacyPaymentDesc",
    ]) {
      expect(i18nSource.match(new RegExp(`"${key}":`, "g"))).toHaveLength(2);
    }
  });
});
