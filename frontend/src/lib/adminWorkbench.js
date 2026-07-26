import {
  Archive,
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  FileText,
  History,
  Home,
  Image,
  Mail,
  Package,
  Settings,
  Users,
} from "lucide-react";
import { ADMIN_ROUTE_PERMISSIONS, hasPermission } from "./permissions";

export const ADMIN_MENU_GROUPS = Object.freeze([
  {
    label: "admin.group.workHome",
    items: [{ path: "/admin", label: "admin.workHome", icon: Home }],
  },
  {
    label: "admin.group.salesDelivery",
    items: [
      { path: "/admin/inquiries", label: "admin.inquiries", icon: Mail },
      { path: "/admin/b2b/quotes", label: "admin.quotes", icon: FileText },
      {
        path: "/admin/b2b/projects",
        label: "admin.projects",
        icon: BriefcaseBusiness,
      },
      {
        path: "/admin/orders",
        label: "admin.legacyOrders",
        icon: Package,
        badge: "admin.compatibility",
      },
      {
        path: "/admin/contacts",
        label: "admin.contacts",
        icon: Archive,
        badge: "admin.compatibility",
      },
    ],
  },
  {
    label: "admin.group.productsProduction",
    items: [
      { path: "/admin/catalog", label: "admin.catalog", icon: BookOpen },
      { path: "/admin/materials", label: "admin.materials", icon: FileText },
      { path: "/admin/inventory", label: "admin.inventory", icon: Boxes },
      {
        path: "/admin/stock-movements",
        label: "admin.stockMovements",
        icon: History,
      },
    ],
  },
  {
    label: "admin.group.publishing",
    items: [
      { path: "/admin/portfolio", label: "admin.portfolio", icon: Image },
      { path: "/admin/content", label: "admin.content", icon: FileText },
    ],
  },
  {
    label: "admin.group.governance",
    items: [
      { path: "/admin/users", label: "admin.users", icon: Users },
      { path: "/admin/settings", label: "admin.settings", icon: Settings },
      {
        path: "/admin/communication",
        label: "admin.outboundCommunication",
        icon: Mail,
      },
    ],
  },
]);

const ROLE_HOME = Object.freeze({
  super_admin: {
    labelKey: "admin.roleHome.superAdmin",
    queuePaths: ["/admin/users", "/admin/settings"],
  },
  manager_approver: {
    labelKey: "admin.roleHome.approver",
    queuePaths: [
      "/admin/inquiries",
      "/admin/b2b/projects",
      "/admin/content",
      "/admin/portfolio",
    ],
  },
  warehouse: {
    labelKey: "admin.roleHome.warehouse",
    queuePaths: ["/admin/inventory", "/admin/stock-movements"],
  },
  quality_control: {
    labelKey: "admin.roleHome.qualityControl",
    queuePaths: ["/admin/b2b/projects", "/admin/orders"],
  },
  sales_estimator: {
    labelKey: "admin.roleHome.sales",
    queuePaths: [
      "/admin/inquiries",
      "/admin/b2b/quotes",
      "/admin/b2b/projects",
      "/admin/orders",
    ],
  },
  order_admin: {
    labelKey: "admin.roleHome.orderAdmin",
    queuePaths: ["/admin/orders"],
  },
  catalog_manager: {
    labelKey: "admin.roleHome.catalog",
    queuePaths: ["/admin/catalog", "/admin/materials"],
  },
  content_editor: {
    labelKey: "admin.roleHome.content",
    queuePaths: ["/admin/content", "/admin/portfolio"],
  },
  production: {
    labelKey: "admin.roleHome.production",
    queuePaths: ["/admin/b2b/projects", "/admin/orders", "/admin/inventory"],
  },
  designer_engineer: {
    labelKey: "admin.roleHome.design",
    queuePaths: ["/admin/b2b/projects", "/admin/inquiries", "/admin/orders"],
  },
  finance: {
    labelKey: "admin.roleHome.finance",
    queuePaths: ["/admin/b2b/projects", "/admin/orders"],
  },
});

function userRoles(user) {
  if (Array.isArray(user?.roles)) return user.roles;
  if (Array.isArray(user?.role_names)) return user.role_names;
  if (typeof user?.role === "string") return [user.role];
  return [];
}

export function visibleAdminMenuGroups(user) {
  return ADMIN_MENU_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(({ path }) =>
      hasPermission(user, ADMIN_ROUTE_PERMISSIONS[path])
    ),
  })).filter((group) => group.items.length > 0);
}

export function getRoleHome(user) {
  const roles = userRoles(user);
  const selectedRole = Object.keys(ROLE_HOME).find((role) => roles.includes(role));
  const fallback = {
    labelKey: "admin.roleHome.default",
    queuePaths: ADMIN_MENU_GROUPS.flatMap((group) =>
      group.items.map((item) => item.path)
    ),
  };
  const home = ROLE_HOME[selectedRole] || fallback;

  return {
    ...home,
    queuePaths: home.queuePaths.filter((path) =>
      hasPermission(user, ADMIN_ROUTE_PERMISSIONS[path])
    ),
  };
}
