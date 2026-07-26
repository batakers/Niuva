const fs = require("fs");
const path = require("path");

const {
  ADMIN_MENU_GROUPS,
  visibleAdminMenuGroups,
} = require("@/lib/adminWorkbench");
const {
  ADMIN_ROUTE_PERMISSIONS,
  B2B_ACTION_PERMISSIONS,
} = require("@/lib/permissions");

const appSource = fs.readFileSync(
  path.resolve(__dirname, "..", "..", "App.js"),
  "utf8"
);
const listSource = fs.readFileSync(
  path.join(__dirname, "B2BList.jsx"),
  "utf8"
);
const detailSource = fs.readFileSync(
  path.join(__dirname, "B2BDetail.jsx"),
  "utf8"
);

describe("B2B Admin workbench routes", () => {
  test.each([
    "/admin/inquiries/:id",
    "/admin/b2b/quotes",
    "/admin/b2b/quotes/:id",
    "/admin/b2b/projects",
    "/admin/b2b/projects/:id",
  ])("provides a deep-linkable %s route", (route) => {
    expect(appSource).toContain(`path="${route}"`);
  });

  test("serves the canonical inquiry list instead of the legacy contacts page", () => {
    expect(appSource).toContain(
      '<Route path="/admin/inquiries" element={protectedPage("/admin/inquiries", <AdminInquiryList />)} />'
    );
  });

  test("keeps the legacy contacts surface reachable for history", () => {
    expect(appSource).toContain(
      '<Route path="/admin/contacts" element={protectedPage("/admin/contacts", <AdminContacts />)} />'
    );
  });

  test("lists B2B aggregates without a modal detail surface", () => {
    expect(listSource).toContain("<Link");
    expect(listSource).not.toContain("<Dialog");
  });

  test("shows operational spine, blockers, version, and audit history", () => {
    expect(detailSource).toContain('data-testid="b2b-operational-spine"');
    expect(detailSource).toContain('t("b2b.blockers")');
    expect(detailSource).toContain("record.version");
    expect(detailSource).toContain("record.history");
    expect(detailSource).toContain("expected_version");
    expect(detailSource).toContain("operation_id");
  });
});

describe("B2B workbench navigation and route permissions", () => {
  test("guards each B2B list route with its read scope", () => {
    expect(ADMIN_ROUTE_PERMISSIONS["/admin/inquiries"]).toBe("inquiries.read");
    expect(ADMIN_ROUTE_PERMISSIONS["/admin/b2b/quotes"]).toBe("quotes.read");
    expect(ADMIN_ROUTE_PERMISSIONS["/admin/b2b/projects"]).toBe("projects.read");
  });

  test("registers quotes and projects ahead of the legacy surfaces", () => {
    const group = ADMIN_MENU_GROUPS.find(
      (item) => item.label === "admin.group.salesDelivery"
    );

    expect(group.items.map((item) => item.path)).toEqual([
      "/admin/inquiries",
      "/admin/b2b/quotes",
      "/admin/b2b/projects",
      "/admin/orders",
      "/admin/contacts",
    ]);
  });

  test("marks every legacy surface as a compatibility surface", () => {
    const group = ADMIN_MENU_GROUPS.find(
      (item) => item.label === "admin.group.salesDelivery"
    );
    const badged = group.items
      .filter((item) => item.badge === "admin.compatibility")
      .map((item) => item.path);

    expect(badged).toEqual(["/admin/orders", "/admin/contacts"]);
  });

  test("hides B2B surfaces a role cannot read", () => {
    const paths = visibleAdminMenuGroups({
      permissions: ["inquiries.read", "quotes.read"],
    }).flatMap((group) => group.items.map((item) => item.path));

    // The legacy archive rides on inquiries.read, the same scope as triage.
    expect(paths).toEqual([
      "/admin/inquiries",
      "/admin/b2b/quotes",
      "/admin/contacts",
    ]);
    expect(paths).not.toContain("/admin/b2b/projects");
  });
});

describe("B2B command permission scoping", () => {
  test("mirrors the backend scope for cross-aggregate commands", () => {
    expect(B2B_ACTION_PERMISSIONS.inquiry.convert).toBe("quotes.write");
    expect(B2B_ACTION_PERMISSIONS.quote.create_project).toBe("projects.write");
  });

  test("scopes each transition to its own aggregate", () => {
    expect(B2B_ACTION_PERMISSIONS.inquiry.review).toBe("inquiries.write");
    expect(B2B_ACTION_PERMISSIONS.quote.send).toBe("quotes.write");
    expect(B2B_ACTION_PERMISSIONS.project.activate).toBe("projects.write");
  });

  test("gates every offered action through the shared permission map", () => {
    expect(detailSource).toContain(
      "hasPermission(user, B2B_ACTION_PERMISSIONS[kind][action])"
    );
  });

  test("never dispatches create_revision as a plain status transition", () => {
    expect(detailSource).not.toContain("create_revision:");
    expect(detailSource).toContain("revisionPending");
  });

  test("routes create_revision to the editor rather than a one-click command", () => {
    expect(detailSource).toContain("/revision`");
    expect(detailSource).toContain('data-testid="open-revision-editor"');
    expect(appSource).toContain('path="/admin/b2b/quotes/:id/revision"');
  });

  test("guards the revision editor with the write scope", () => {
    expect(ADMIN_ROUTE_PERMISSIONS["/admin/b2b/quotes/revision"]).toBe(
      "quotes.write"
    );
  });
});
