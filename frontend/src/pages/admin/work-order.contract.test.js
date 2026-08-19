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

const read = (...segments) =>
  fs.readFileSync(path.resolve(__dirname, ...segments), "utf8");

const appSource = read("..", "..", "App.js");
const detailSource = read("WorkOrderDetail.jsx");
const panelSource = read("ProjectWorkOrders.jsx");
const projectSource = read("B2BDetail.jsx");
const i18nSource = read("..", "..", "i18n.js");

describe("Work order routes and navigation", () => {
  test.each(["/admin/b2b/work-orders", "/admin/b2b/work-orders/:id"])(
    "provides a deep-linkable %s route",
    (route) => {
      expect(appSource).toContain(`path="${route}"`);
    }
  );

  test("guards the work order surface with the production read scope", () => {
    expect(ADMIN_ROUTE_PERMISSIONS["/admin/b2b/work-orders"]).toBe(
      "production.read"
    );
  });

  test("registers work orders under products and production", () => {
    const group = ADMIN_MENU_GROUPS.find(
      (item) => item.label === "admin.group.productsProduction"
    );
    expect(group.items.map((item) => item.path)).toContain(
      "/admin/b2b/work-orders"
    );
  });

  test("hides work orders from a role that cannot read production", () => {
    const paths = visibleAdminMenuGroups({
      permissions: ["inventory.read"],
    }).flatMap((group) => group.items.map((item) => item.path));

    expect(paths).toContain("/admin/inventory");
    expect(paths).not.toContain("/admin/b2b/work-orders");
  });
});

describe("Work order command scoping", () => {
  test("separates production authority from stock authority", () => {
    // Moving a run through its lifecycle is a production act.
    expect(B2B_ACTION_PERMISSIONS.work_order.start).toBe("production.write");
    expect(B2B_ACTION_PERMISSIONS.work_order.submit_for_qc).toBe(
      "production.write"
    );
    expect(B2B_ACTION_PERMISSIONS.work_order.resume).toBe("production.write");
    // QC outcomes require an independent quality authority.
    expect(B2B_ACTION_PERMISSIONS.work_order.pass_qc).toBe("qc.write");
    expect(B2B_ACTION_PERMISSIONS.work_order.request_rework).toBe("qc.write");
    // Allocating and consuming move stock, so they follow inventory.
    expect(B2B_ACTION_PERMISSIONS.work_order.allocate).toBe("inventory.write");
    expect(B2B_ACTION_PERMISSIONS.work_order.consume).toBe("inventory.write");
    // Opening a run from a project is production, not project authority.
    expect(B2B_ACTION_PERMISSIONS.project.create_work_order).toBe(
      "production.write"
    );
  });

  test("gates every offered action through the shared permission map", () => {
    expect(detailSource).toContain(
      "hasPermission(user, B2B_ACTION_PERMISSIONS.work_order[action])"
    );
  });
});

describe("Work order detail surface", () => {
  test("shows the spine, blockers, requirements, version, and history", () => {
    expect(detailSource).toContain('data-testid="work-order-spine"');
    expect(detailSource).toContain('data-testid="work-order-blockers"');
    expect(detailSource).toContain('data-testid="work-order-requirements"');
    expect(detailSource).toContain("record.material_requirements");
    expect(detailSource).toContain("record.history");
  });

  test("carries expected_version, operation_id, and reason on every command", () => {
    expect(detailSource).toContain("expected_version: record.version");
    expect(detailSource).toContain("operation_id: operationId()");
    expect(detailSource).toContain("reason: reason.trim()");
  });

  test("records completion and rework through the dedicated QC command", () => {
    expect(detailSource).toContain("QC_OUTCOMES");
    expect(detailSource).toContain("pass_qc: \"passed\"");
    expect(detailSource).toContain('request_rework: "rework_required"');
    expect(detailSource).toContain("/admin/b2b/work-orders/${id}/qc");
    expect(detailSource).not.toContain('complete: "completed"');
  });

  test("offers allocation and consumption from material state, not the graph", () => {
    // These are separate commands, so they never appear in
    // permitted_next_actions and must be derived.
    expect(detailSource).toContain("function materialActions(record)");
    expect(detailSource).toContain("record.reservation_ids");
    expect(detailSource).toContain("record.materials_consumed");
  });

  test("surfaces the open shortage with its deficit lines", () => {
    expect(detailSource).toContain('data-testid="work-order-shortage"');
    expect(detailSource).toContain("/admin/b2b/material-shortages");
    expect(detailSource).toContain("line.deficit");
  });

  test("links each required material to its own movement history", () => {
    expect(detailSource).toContain("/admin/stock-movements?subject_type=material");
  });
});

describe("Work orders on the project spine", () => {
  test("the project detail renders its production runs", () => {
    expect(projectSource).toContain("<ProjectWorkOrders");
    expect(projectSource).toContain("onChanged={load}");
  });

  test("offers only variants the accepted quotation actually carries", () => {
    expect(panelSource).toContain("project.quote_snapshot?.items");
    expect(panelSource).toContain("item.variant_id");
  });

  test("refuses to open a run on a project that stopped moving", () => {
    expect(panelSource).toContain('["planned", "active"].includes(project.status)');
  });

  test("distinguishes bootstrap loading, recovery, and authoritative empty", () => {
    expect(panelSource).toContain('useState("loading")');
    expect(panelSource).toContain('data-testid="work-order-loading"');
    expect(panelSource).toContain('data-testid="work-order-load-error"');
    expect(panelSource).toContain('data-testid="work-order-empty"');
    expect(panelSource).toContain('aria-busy={loadState === "loading"}');
    expect(panelSource).toContain("load({ focusOnReady: true })");
    expect(panelSource).toContain("function isUncertainCreate");
    expect(panelSource).toContain("createOperationIdRef");
    expect(panelSource).toContain("operation_id: requestOperationId");
    expect(panelSource).toContain("await load();");
    expect(panelSource).toContain('data-state={createState}');
    expect(panelSource).toContain('loadState === "ready" && canCreate');
    expect(panelSource).toContain('disabled={createState === "uncertain"}');
  });
});

describe("Work order localization", () => {
  test("localizes every work order string in Indonesian and English", () => {
    for (const key of [
      "admin.workOrders",
      "status.in_progress",
      "status.quality_control",
      "status.rework",
      "workOrder.requirementsNote",
      "workOrder.blockerShortage",
      "workOrder.action.allocate",
      "workOrder.action.consume",
      "workOrder.action.submit_for_qc",
      "workOrder.action.pass_qc",
      "workOrder.action.request_rework",
      "workOrder.event.materials_allocated",
      "workOrder.event.qc_recorded",
      "common.loading",
      "common.retry",
      "b2b.loadFailed",
    ]) {
      expect(i18nSource.match(new RegExp(`"${key}":`, "g"))).toHaveLength(2);
    }
  });
});
