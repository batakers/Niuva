const fs = require("fs");
const path = require("path");

const contactsSource = fs.readFileSync(
  path.join(__dirname, "Contacts.jsx"),
  "utf8"
);
const i18nSource = fs.readFileSync(
  path.resolve(__dirname, "..", "..", "i18n.js"),
  "utf8"
);
const serverSource = fs.readFileSync(
  path.resolve(__dirname, "..", "..", "..", "..", "backend", "server.py"),
  "utf8"
);

describe("Legacy contact archive", () => {
  test("offers no mutation affordance on pre-migration records", () => {
    expect(contactsSource).not.toContain("api.post");
    expect(contactsSource).not.toContain("api.put");
    expect(contactsSource).not.toContain("api.patch");
    expect(contactsSource).not.toContain("api.delete");
  });

  test("states why the archive cannot be triaged and points at the queue", () => {
    expect(contactsSource).toContain('t("contacts.legacyTitle")');
    expect(contactsSource).toContain('t("contacts.legacyBody")');
    expect(contactsSource).toContain('to="/admin/inquiries"');
  });

  test("surfaces a failed load instead of showing an empty archive", () => {
    expect(contactsSource).toContain('t("contacts.loadFailed")');
    expect(contactsSource).toContain("onRetry={load}");
    expect(contactsSource).not.toContain(".catch(() => {})");
  });

  test("localizes the legacy copy in Indonesian and English", () => {
    for (const key of [
      "contacts.legacyTitle",
      "contacts.legacyBody",
      "contacts.openInquiries",
      "contacts.loadFailed",
    ]) {
      expect(i18nSource.match(new RegExp(`"${key}":`, "g"))).toHaveLength(2);
    }
  });

  test("no longer names the legacy archive after the canonical aggregate", () => {
    expect(i18nSource).toContain('"admin.contacts": "Kontak Legacy"');
    expect(i18nSource).toContain('"admin.contacts": "Legacy Contacts"');
  });

  test("classifies legacy rows on read without rewriting stored history", () => {
    const handler = serverSource
      .split("async def list_contacts(")[1]
      .split("# ----------------------------- Portfolio")[0];

    expect(handler).toContain('"record_class": "legacy_contact"');
    expect(handler).toContain('"read_only": True');
    expect(handler).not.toContain("update_one");
    expect(handler).not.toContain("insert_one");
  });
});
