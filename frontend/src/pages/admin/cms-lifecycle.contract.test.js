const fs = require("fs");
const path = require("path");

const {
  CONTENT_ACTION_PERMISSIONS,
  CONTENT_ACTION_TARGETS,
  CONTENT_STAGE_ACTIONS,
  coerceContentFieldValue,
  emptyFieldsFor,
} = require("@/lib/content");

const read = (...segments) =>
  fs.readFileSync(path.resolve(__dirname, ...segments), "utf8");

const editorSource = read("ContentEditor.jsx");
const apiSource = read("..", "..", "lib", "content.js");
const i18nSource = read("..", "..", "i18n.js");

const LIFECYCLE = [
  "draft",
  "review",
  "preview",
  "scheduled",
  "published",
  "archived",
];

describe("CMS authoring and approving are different authorities", () => {
  test("only publishing needs publish authority", () => {
    expect(CONTENT_ACTION_PERMISSIONS.publish).toBe("content.publish");
    for (const action of Object.keys(CONTENT_ACTION_PERMISSIONS)) {
      if (action === "publish") continue;
      expect(CONTENT_ACTION_PERMISSIONS[action]).toBe("content.write");
    }
  });

  test("the editor gates every offered action through the map", () => {
    expect(editorSource).toContain(
      "hasPermission(user, CONTENT_ACTION_PERMISSIONS[action])"
    );
  });

  test("a withheld step is named rather than hidden", () => {
    expect(editorSource).toContain('data-testid="content-needs-approval"');
    expect(editorSource).toContain('t("content.needsApproval")');
  });
});

describe("CMS lifecycle wiring", () => {
  test("every stage offers actions that exist and target a real status", () => {
    for (const [stage, actions] of Object.entries(CONTENT_STAGE_ACTIONS)) {
      expect(LIFECYCLE).toContain(stage);
      for (const action of actions) {
        expect(CONTENT_ACTION_TARGETS[action]).toBeDefined();
        expect(LIFECYCLE).toContain(CONTENT_ACTION_TARGETS[action]);
        // Nothing may be offered that the permission map cannot scope.
        expect(CONTENT_ACTION_PERMISSIONS[action]).toBeDefined();
      }
    }
  });

  test("published work is revised through a new draft", () => {
    expect(CONTENT_STAGE_ACTIONS.published).toContain("revise");
    expect(CONTENT_ACTION_TARGETS.revise).toBe("draft");
  });

  test("the transition helper posts to the transitions endpoint", () => {
    expect(apiSource).toContain("/transitions`");
    expect(apiSource).toContain("target_status: targetStatus");
  });

  test("capability order remains an integer through the editor contract", () => {
    const orderField = { type: "number" };
    expect(emptyFieldsFor("capability").display_order).toBe(0);
    expect(coerceContentFieldValue(orderField, "12")).toBe(12);
    expect(coerceContentFieldValue(orderField, "")).toBe(0);
  });
});

describe("Rollback carries a real reason", () => {
  test("the reason comes from the operator, not a canned string", () => {
    // A canned reason would stamp every rollback with the same sentence.
    expect(editorSource).toContain("versionId,\n        reason.trim(),\n        block.version,");
    expect(editorSource).not.toContain('t("content.rollbackReason")');
    expect(editorSource).toContain('t("content.rollbackReasonRequired")');
  });
});

describe("CMS localization", () => {
  test("localizes every lifecycle action in both languages", () => {
    for (const action of Object.keys(CONTENT_ACTION_TARGETS)) {
      if (action === "publish") continue;
      expect(
        i18nSource.match(new RegExp(`"content\\.action\\.${action}":`, "g"))
      ).toHaveLength(2);
    }
  });

  test("localizes the lifecycle panel copy in both languages", () => {
    for (const key of [
      "content.lifecycle",
      "content.stageChanged",
      "content.needsApproval",
      "content.rollbackReasonRequired",
    ]) {
      expect(i18nSource.match(new RegExp(`"${key}":`, "g"))).toHaveLength(2);
    }
  });
});
