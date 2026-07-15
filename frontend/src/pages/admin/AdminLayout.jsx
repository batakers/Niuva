import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BellRing, BookOpen, Boxes, Building2, GraduationCap, History, Image as ImageIcon, Layers, LayoutGrid, Mail, Package, ScrollText, Settings as SettingsIcon, TerminalSquare, Users } from "lucide-react";
import { useI18n } from "../../i18n";
import { OperationalLayout } from "@/components/layout/Layout";
import { useAuth } from "../../context/AuthContext";
import { SurfacePanel, SurfacePanelHeader } from "../../components/ui/surface-panel";
import { TechnicalLabel } from "../../components/ui/technical-label";
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
  { path: "/admin/internships", label: "admin.internships", icon: GraduationCap },
  { path: "/admin/contacts", label: "admin.contacts", icon: Mail },
  { path: "/admin/users", label: "admin.users", icon: Users },
  { path: "/admin/organizations", label: "admin.organizations", icon: Building2 },
  { path: "/admin/audit", label: "admin.audit", icon: ScrollText },
  { path: "/admin/settings", label: "admin.settings", icon: SettingsIcon },
];

export function AdminLayout({ children, title, subtitle }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const location = useLocation();
  const visibleRoutes = ADMIN_ROUTES.filter(({ path }) =>
    hasPermission(user, ADMIN_ROUTE_PERMISSIONS[path])
  );
  const accessLevel = user?.roles?.join("+") || "unknown";

  return (
    <OperationalLayout>
      <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
        <SurfacePanel className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 z-10">
          <SurfacePanelHeader padding="sm" className="flex items-center gap-2">
            <TerminalSquare className="h-4 w-4 text-muted-foreground" />
            <TechnicalLabel>SYS_ADMIN_CONSOLE</TechnicalLabel>
          </SurfacePanelHeader>
          <div className="p-4 border-b border-border bg-background">
            <TechnicalLabel tone="primary" size="sm" as="p" className="truncate">{user?.name}</TechnicalLabel>
            <TechnicalLabel as="p" className="mt-1">ACCESS_LEVEL: {accessLevel}</TechnicalLabel>
          </div>
          <nav className="p-2 flex max-h-[55vh] flex-col gap-1 overflow-y-auto lg:max-h-[calc(100vh-15rem)]" aria-label={t("admin.navigation")}>
            {visibleRoutes.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path || (path !== "/admin" && location.pathname.startsWith(`${path}/`));
              return (
                <Link key={path} to={path} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 px-3 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                }`}>
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                  {t(label)}
                </Link>
              );
            })}
          </nav>
        </SurfacePanel>

        <div className="flex-1 w-full min-w-0 space-y-6">
          <SurfacePanel>
            <SurfacePanelHeader padding="sm" className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
              <TechnicalLabel>MODULE_LOADED // {title || "OVERVIEW"}</TechnicalLabel>
            </SurfacePanelHeader>
            <div className="p-6">
              <h1 className="font-heading text-2xl font-bold text-foreground uppercase tracking-tight">{title}</h1>
              {subtitle && <TechnicalLabel as="p" size="sm" className="mt-1">{subtitle}</TechnicalLabel>}
            </div>
          </SurfacePanel>
          <div className="w-full">{children}</div>
        </div>
      </div>
    </OperationalLayout>
  );
}
