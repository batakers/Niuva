export const ADMIN_ROUTE_PERMISSIONS = Object.freeze({
  "/admin": "dashboard.read",
  "/admin/orders": "orders.read",
  "/admin/catalog": "catalog.read",
  "/admin/materials": "materials.read",
  "/admin/inventory": "inventory.read",
  "/admin/stock-movements": "inventory.read",
  "/admin/restock-alerts": "restock_alerts.read",
  "/admin/portfolio": "content.read",
  "/admin/internships": "admin.access",
  "/admin/contacts": "inquiries.read",
  "/admin/users": "users.read",
  "/admin/organizations": "organizations.read",
  "/admin/audit": "audit.read",
  "/admin/settings": "settings.read",
});


export function hasPermission(user, permission) {
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  return permissions.includes("*") || permissions.includes(permission);
}
