export const ADMIN_ROUTE_PERMISSIONS = Object.freeze({
  "/admin": "admin.access",
  "/admin/orders": "orders.read",
  "/admin/materials": "materials.read",
  "/admin/portfolio": "content.read",
  "/admin/internships": "admin.access",
  "/admin/contacts": "inquiries.read",
  "/admin/users": "users.read",
  "/admin/organizations": "organizations.read",
  "/admin/audit": "audit.read",
  "/admin/settings": "settings.read",
});


export function hasPermission(user, permission) {
  const permissions = user?.permissions || [];
  return permissions.includes("*") || permissions.includes(permission);
}
