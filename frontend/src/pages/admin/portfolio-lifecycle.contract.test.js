const fs = require("fs");
const path = require("path");

const {
  ADMIN_ROUTE_PERMISSIONS,
  PORTFOLIO_ACTION_PERMISSIONS,
  PORTFOLIO_ROLLBACK_PERMISSION,
} = require("@/lib/permissions");

const read = (...segments) =>
  fs.readFileSync(path.resolve(__dirname, ...segments), "utf8");

const appSource = read("..", "..", "App.js");
const detailSource = read("PortfolioDetail.jsx");
const listSource = read("PortfolioAdmin.jsx");
const i18nSource = read("..", "..", "i18n.js");
const badgeSource = read(
  "..",
  "..",
  "components",
  "operational",
  "StatusStepper.jsx"
);

const LIFECYCLE = [
  "draft",
  "review",
  "preview",
  "scheduled",
  "published",
  "archived",
];

describe("Portfolio lifecycle routes", () => {
  test("the entry has a deep-linkable lifecycle surface", () => {
    expect(appSource).toContain('path="/admin/portfolio/:id"');
    expect(ADMIN_ROUTE_PERMISSIONS["/admin/portfolio"]).toBe("content.read");
  });
});

describe("Authoring and approving are different authorities", () => {
  test("only publishing and scheduling need publish authority", () => {
    expect(PORTFOLIO_ACTION_PERMISSIONS.publish).toBe("content.publish");
    expect(PORTFOLIO_ACTION_PERMISSIONS.schedule).toBe("content.publish");
    expect(PORTFOLIO_ACTION_PERMISSIONS.archive).toBe("content.archive");
    for (const action of [
      "submit_review",
      "return_to_draft",
      "approve_preview",
      "return_to_review",
      "restore",
    ]) {
      expect(PORTFOLIO_ACTION_PERMISSIONS[action]).toBe("content.write");
    }
  });

  test("every offered action is gated through the shared map", () => {
    expect(detailSource).toContain(
      "hasPermission(user, PORTFOLIO_ACTION_PERMISSIONS[action])"
    );
  });

  test("a withheld step is named rather than silently hidden", () => {
    // Hiding it would leave an author wondering why the flow stops.
    expect(detailSource).toContain('data-testid="portfolio-needs-approval"');
    expect(detailSource).toContain('t("portfolio.needsApproval")');
  });
});

describe("Lifecycle commands", () => {
  test("every action maps to exactly one lifecycle status", () => {
    const block = detailSource.split("const ACTION_TARGETS = {")[1].split("};")[0];
    const targets = [...block.matchAll(/:\s*"([a-z_]+)"/g)].map((m) => m[1]);

    expect(targets.length).toBeGreaterThan(0);
    for (const target of targets) {
      expect(LIFECYCLE).toContain(target);
    }
  });

  test("commands carry expected_version and a reason", () => {
    expect(detailSource).toContain("expected_version: record.version");
    expect(detailSource).toContain("reason: reason.trim()");
  });

  test("scheduling asks for an activation time before sending", () => {
    expect(detailSource).toContain('data-testid="portfolio-scheduled-for"');
    expect(detailSource).toContain("NEEDS_SCHEDULE");
    expect(detailSource).toContain("scheduled_for");
  });
});

describe("Revisions and rollback", () => {
  test("revisions are listed with a rollback that states its reason", () => {
    expect(detailSource).toContain('data-testid="portfolio-revisions"');
    expect(detailSource).toContain("/rollback`");
    expect(detailSource).toContain('t("portfolio.rollbackReasonRequired")');
    expect(PORTFOLIO_ROLLBACK_PERMISSION).toBe("content.publish");
    expect(detailSource).toContain(
      "hasPermission(user, PORTFOLIO_ROLLBACK_PERMISSION)"
    );
  });

  test("the page says rollback appends rather than truncates", () => {
    expect(detailSource).toContain('t("portfolio.rollbackNote")');
  });
});

describe("Ordering is reachable by keyboard and conflict safe", () => {
  test("reordering uses real buttons, not a drag-only affordance", () => {
    expect(listSource).toContain("portfolio-move-up-");
    expect(listSource).toContain("portfolio-move-down-");
    expect(listSource).toContain("aria-label=");
    // A drag handle alone would put ordering out of reach of a keyboard.
    expect(listSource).not.toContain("draggable");
  });

  test("each move sends the whole sequence", () => {
    expect(listSource).toContain("/admin/portfolio/reorder");
    expect(listSource).toContain("ordered_ids: ordered");
  });

  test("the list reads the admin surface so drafts are visible", () => {
    expect(listSource).toContain('.get("/admin/portfolio")');
    expect(listSource).not.toContain('.get("/portfolio")');
  });

  test("removal archives instead of deleting", () => {
    expect(listSource).toContain('target_status: "archived"');
    expect(listSource).not.toContain("api.delete");
  });
});

describe("Portfolio localization and status tones", () => {
  test("every lifecycle status has a label and a tone", () => {
    for (const status of LIFECYCLE) {
      expect(
        i18nSource.match(new RegExp(`"status\\.${status}":`, "g"))
      ).toHaveLength(2);
      expect(badgeSource).toContain(`${status}:`);
    }
  });

  test("localizes every lifecycle action in both languages", () => {
    for (const action of Object.keys(PORTFOLIO_ACTION_PERMISSIONS)) {
      expect(
        i18nSource.match(new RegExp(`"portfolio\\.action\\.${action}":`, "g"))
      ).toHaveLength(2);
    }
  });
});
