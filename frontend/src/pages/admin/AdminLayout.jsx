import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BellRing, BookOpen, Boxes, Building2, FileText, GraduationCap, History, Image as ImageIcon, Layers, LayoutGrid, Mail, MessageSquare, Package, ScrollText, Settings as SettingsIcon, Users } from "lucide-react";
import { useI18n } from "../../i18n";
import { OperationalLayout } from "@/components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { SurfacePanel } from "../../components/ui/surface-panel";
import { ADMIN_ROUTE_PERMISSIONS, hasPermission } from "../../lib/permissions";

const ADMIN_ROUTES = [
  { path: "/admin", label: "admin.overview", icon: LayoutGrid },
  { path: "/admin/orders", label: "admin.orders", icon: Package },
  { path: "/admin/catalog", label: "admin.catalog", icon: BookOpen },
  { path: "/admin/materials", label: "admin.materials", icon: Layers },
  { path: "/admin/inventory", label: "admin.inventory", icon: Boxes },
  { path: "/admin/stock-movements", label: "admin.stockMovements", icon: History },
  { path: "/admin/restock-alerts", label: "admin.restockAlerts", icon: BellRing },
  { path: "/admin/portfolio", label: "admin.portfolio", icon: ImageIcon },
  { path: "/admin/content", label: "admin.content", icon: FileText },
  { path: "/admin/internships", label: "admin.internships", icon: GraduationCap },
  { path: "/admin/contacts", label: "admin.contacts", icon: Mail },
  { path: "/admin/users", label: "admin.users", icon: Users },
  { path: "/admin/organizations", label: "admin.organizations", icon: Building2 },
  { path: "/admin/audit", label: "admin.audit", icon: ScrollText },
  { path: "/admin/notifications", label: "admin.notifications", icon: MessageSquare },
  { path: "/admin/settings", label: "admin.settings", icon: SettingsIcon },
];

export function AdminLayout({ children, title, subtitle }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const location = useLocation();
  const visibleRoutes = ADMIN_ROUTES.filter(({ path }) =>
    hasPermission(user, ADMIN_ROUTE_PERMISSIONS[path])
  );
  const accessLevel = Array.isArray(user?.role_labels) && user.role_labels.length > 0
    ? user.role_labels.join(" + ")
    : "No approved role";

  return (
    <OperationalLayout>
      <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
        <SurfacePanel className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 z-10 rounded-panel shadow-surface overflow-hidden">
          <div className="p-4 border-b border-border">
            <p className="type-label text-text-secondary">{t("admin.console")}</p>
            <p className="mt-2 font-heading text-sm font-semibold text-text-primary truncate">{user?.name}</p>
            <p className="mt-0.5 type-body-small text-text-secondary">{t("admin.accessLevel")}: {accessLevel}</p>
          </div>
          <nav className="p-2 flex max-h-[55vh] flex-col gap-1 overflow-y-auto lg:max-h-[calc(100vh-15rem)]" aria-label={t("admin.navigation")}>
            {visibleRoutes.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path || (path !== "/admin" && location.pathname.startsWith(`${path}/`));
              return (
                <Link key={path} to={path} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-control px-3 py-2 type-navigation transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 ${
                  active
                    ? "bg-action-primary text-text-inverse"
                    : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                }`}>
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  {t(label)}
                </Link>
              );
            })}
          </nav>
        </SurfacePanel>

        <div className="flex-1 w-full min-w-0 space-y-6">
          <SurfacePanel className="rounded-panel shadow-surface p-6">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-text-primary">{title}</h1>
            {subtitle && <p className="mt-1 type-body-small text-text-secondary">{subtitle}</p>}
          </SurfacePanel>
          <div className="w-full">{children}</div>
        </div>
      </div>
    </OperationalLayout>
  );
}
