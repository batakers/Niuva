export const ADMIN_ROUTE_PERMISSIONS = Object.freeze({
  "/admin": "dashboard.read",
  "/admin/orders": "orders.read",
  "/admin/catalog": "catalog.read",
  "/admin/materials": "materials.read",
  "/admin/inventory": "inventory.read",
  "/admin/stock-movements": "inventory.read",
  "/admin/restock-alerts": "restock_alerts.read",
  "/admin/portfolio": "content.read",
  "/admin/content": "content.read",
  "/admin/contacts": "inquiries.read",
  "/admin/inquiries": "inquiries.read",
  "/admin/b2b/quotes": "quotes.read",
  // Authoring a revision is a write, so read-only roles get the dedicated 403
  // at the route rather than a form they cannot submit.
  "/admin/b2b/quotes/revision": "quotes.write",
  "/admin/b2b/projects": "projects.read",
  "/admin/b2b/work-orders": "production.read",
  "/admin/retail-orders": "orders.read",
  "/admin/users": "users.read",
  "/admin/customers": "customers.read",
  "/admin/notifications": "admin.access",
  "/admin/communication": "notifications.write",
  "/admin/settings": "settings.write",
});


// Mirrors require_permission(...) on each B2B command route in the backend so
// the workbench never offers an action the server will reject with 403.
export const B2B_ACTION_PERMISSIONS = Object.freeze({
  inquiry: Object.freeze({
    review: "inquiries.write",
    contact: "inquiries.write",
    reject: "inquiries.write",
    convert: "quotes.write",
  }),
  quote: Object.freeze({
    submit_internal_review: "quotes.write",
    send: "quotes.write",
    return_to_draft: "quotes.write",
    accept: "quotes.write",
    request_revision: "quotes.write",
    expire: "quotes.write",
    reject: "quotes.write",
    create_revision: "quotes.write",
    create_project: "projects.write",
  }),
  project: Object.freeze({
    activate: "projects.write",
    hold: "projects.write",
    resume: "projects.write",
    complete: "projects.write",
    cancel: "projects.write",
    // Opening a production run is a production write, not a project one.
    create_work_order: "production.write",
  }),
  work_order: Object.freeze({
    start: "production.write",
    submit_for_qc: "production.write",
    resume: "production.write",
    cancel: "production.write",
    pass_qc: "qc.write",
    request_rework: "qc.write",
    // Allocation and consumption move stock, so they follow inventory.
    allocate: "inventory.write",
    consume: "inventory.write",
  }),
});

// Mirrors the portfolio router: content.write authors a draft through the
// review stages, while anything that reaches the public, or is scheduled to,
// needs content.publish.
export const PORTFOLIO_ACTION_PERMISSIONS = Object.freeze({
  submit_review: "content.write",
  return_to_draft: "content.write",
  approve_preview: "content.write",
  return_to_review: "content.write",
  revise: "content.write",
  archive: "content.archive",
  restore: "content.write",
  schedule: "content.publish",
  publish: "content.publish",
});

export const PORTFOLIO_ROLLBACK_PERMISSION = "content.publish";

export function hasPermission(user, permission) {
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  return permissions.includes("*") || permissions.includes(permission);
}
