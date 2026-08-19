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
const surfacePanelSource = fs.readFileSync(
  path.resolve(
    __dirname,
    "..",
    "..",
    "components",
    "ui",
    "surface-panel.jsx"
  ),
  "utf8"
);
const detailSource = fs.readFileSync(
  path.join(__dirname, "B2BDetail.jsx"),
  "utf8"
);
const i18nSource = fs.readFileSync(
  path.join(__dirname, "..", "..", "i18n.js"),
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

  test(
    "clips the shared collection composition without changing the primitive default",
    () => {
      expect(listSource).toContain(
        '<SurfacePanel className="overflow-hidden">'
      );
      expect(surfacePanelSource).not.toContain("overflow-hidden");
    }
  );

  test("consumes the bounded cursor page and exposes explicit continuation", () => {
    expect(listSource).toContain("readB2BPage(response.data)");
    expect(listSource).toContain("page.nextCursor");
    expect(listSource).toContain('t("b2b.loadMore")');
    expect(listSource).toContain("load(nextCursor)");
    expect(listSource).toContain("onRetry={() => load()}");
  });

  test("retains loaded records when load-more fails and retries the same cursor", () => {
    expect(listSource).toContain("loadMoreError");
    expect(listSource).toContain("setLoadMoreError");
    expect(listSource).toContain("if (cursor) setLoadMoreError(message)");
    expect(listSource).toContain("onRetry={() => load(nextCursor)}");
    expect(listSource).toContain('className="min-h-0 border-0 border-t');
    expect(listSource.indexOf("{records.map")).toBeLessThan(
      listSource.indexOf("{loadMoreError &&")
    );
  });

  test("shows operational spine, blockers, version, and audit history", () => {
    expect(detailSource).toContain('data-testid="b2b-operational-spine"');
    expect(detailSource).toContain('t("b2b.blockers")');
    expect(detailSource).toContain("record.version");
    expect(detailSource).toContain("record.history");
    expect(detailSource).toContain("expected_version");
    expect(detailSource).toContain("operation_id");
  });

  test("localizes Operations record context and acceptance evidence", () => {
    for (const key of [
      "b2b.quoteRecord",
      "b2b.inquiryReference",
      "b2b.projectRecord",
      "b2b.projectReference",
      "b2b.workOrderRecord",
      "b2b.workOrderReference",
      "b2b.retailRecordReference",
      "b2b.acceptanceEvidenceTitle",
      "b2b.acceptanceIncomplete",
      "b2b.portfolioDraftSuccess",
      "b2b.portfolioDraftAction",
    ]) {
      expect(i18nSource.match(new RegExp(`"${key}":`, "g"))).toHaveLength(2);
    }
    expect(listSource).toContain('t("b2b.quoteRecord")');
    expect(listSource).toContain('t("b2b.inquiryReference")');
    expect(detailSource).toContain('t("b2b.acceptanceEvidenceTitle")');
    expect(detailSource).toContain('t("b2b.acceptanceIncomplete")');
    expect(detailSource).toContain('t("b2b.portfolioDraftAction")');
    expect(detailSource).not.toContain("Evidence penerimaan offline");
    expect(detailSource).not.toContain("Nama approver customer");
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
      "/admin/retail-orders",
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
