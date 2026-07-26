import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Boxes,
  Building2,
  ChevronRight,
  FileText,
  GraduationCap,
  History,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Package,
  ScrollText,
  Settings as SettingsIcon,
  Users,
  X,
} from "lucide-react";
import { useI18n } from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import { BrandIdentity } from "@/components/brand/BrandIdentity";
import { ADMIN_ROUTE_PERMISSIONS, hasPermission } from "../../lib/permissions";
import { Button } from "../../components/ui/button";
import { NotificationBell } from "@/components/admin/NotificationBell";

const ADMIN_MENU_GROUPS = [
  {
    label: "admin.group.overview",
    items: [
      { path: "/admin", label: "admin.overview", icon: LayoutGrid },
    ],
  },
  {
    label: "admin.group.commerce",
    items: [
      { path: "/admin/orders", label: "admin.orders", icon: Package },
      { path: "/admin/catalog", label: "admin.catalog", icon: BookOpen },
      { path: "/admin/materials", label: "admin.materials", icon: Layers },
    ],
  },
  {
    label: "admin.group.inventory",
    items: [
      { path: "/admin/inventory", label: "admin.inventory", icon: Boxes },
      { path: "/admin/stock-movements", label: "admin.stockMovements", icon: History },
    ],
  },
  {
    label: "admin.group.content",
    items: [
      { path: "/admin/portfolio", label: "admin.portfolio", icon: ImageIcon },
      { path: "/admin/content", label: "admin.content", icon: FileText },
      { path: "/admin/internships", label: "admin.internships", icon: GraduationCap },
      { path: "/admin/contacts", label: "admin.contacts", icon: Mail },
    ],
  },
  {
    label: "admin.group.organization",
    items: [
      { path: "/admin/users", label: "admin.users", icon: Users },
      { path: "/admin/organizations", label: "admin.organizations", icon: Building2 },
    ],
  },
  {
    label: "admin.group.system",
    items: [
      { path: "/admin/audit", label: "admin.audit", icon: ScrollText },
      { path: "/admin/notifications", label: "admin.notifications", icon: MessageSquare },
      { path: "/admin/settings", label: "admin.settings", icon: SettingsIcon },
    ],
  },
];

export function AdminLayout({ children, title, subtitle }) {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const accessLevel =
    Array.isArray(user?.role_labels) && user.role_labels.length > 0
      ? user.role_labels.join(" + ")
      : "No approved role";

  // Filter menu groups based on permissions
  const visibleGroups = ADMIN_MENU_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(({ path }) =>
      hasPermission(user, ADMIN_ROUTE_PERMISSIONS[path])
    ),
  })).filter((group) => group.items.length > 0);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Set noindex for admin pages
  useEffect(() => {
    document.querySelector('link[rel="canonical"]')?.remove();

    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");

    return () => robots.remove();
  }, []);

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/admin" && location.pathname.startsWith(`${path}/`));

  return (
    <div className="flex min-h-screen w-full bg-surface-page">
      {/* Mobile overlay with fade transition */}
      <div
        className={`fixed inset-0 z-40 bg-text-primary/50 transition-opacity duration-standard lg:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border-default bg-surface-default shadow-navigation transition-transform duration-standard ease-snap lg:static lg:translate-x-0 lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b border-border-default px-4">
          <Link 
            to="/admin" 
            className="flex items-center gap-2 transition-opacity duration-fast hover:opacity-80"
          >
            <BrandIdentity variant="mark" size={28} />
            <span className="font-heading text-sm font-bold text-text-primary">
              {t("admin.console")}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-control p-1.5 text-text-secondary transition-colors duration-fast hover:bg-surface-muted hover:text-text-primary lg:hidden"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar navigation */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-4"
          aria-label={t("admin.navigation")}
        >
          {visibleGroups.map((group, groupIndex) => (
            <div 
              key={group.label} 
              className={groupIndex > 0 ? "mt-4 pt-4 border-t border-border-default/50" : ""}
            >
              <p className="mb-2 px-3 type-label text-text-disabled uppercase text-[11px] tracking-wide">
                {t(group.label)}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ path, label, icon: Icon }) => {
                  const active = isActive(path);
                  return (
                    <Link
                      key={path}
                      to={path}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-control px-3 py-2.5 type-navigation transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 ${
                        active
                          ? "bg-action-primary text-text-inverse shadow-sm"
                          : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                      {t(label)}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar footer - user info */}
        <div className="border-t border-border-default p-4 bg-surface-muted/30">
          <div className="mb-3">
            <p className="font-heading text-sm font-semibold text-text-primary truncate">
              {user?.name}
            </p>
            <p className="type-body-small text-text-secondary truncate">
              {accessLevel}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-text-secondary hover:text-status-error hover:bg-status-error/5"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("nav.logout")}
          </Button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Admin header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border-default bg-surface-default/95 backdrop-blur-sm px-4 sm:px-6 shadow-surface">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-control p-2 text-text-secondary transition-colors duration-fast hover:bg-surface-muted hover:text-text-primary lg:hidden"
            aria-label={t("admin.openMenu")}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb / Page title */}
          <nav className="flex items-center gap-1.5 text-text-secondary" aria-label="Breadcrumb">
            <Link
              to="/admin"
              className="type-body-small transition-colors duration-fast hover:text-action-primary"
            >
              {t("admin.console")}
            </Link>
            {title && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-text-disabled" />
                <span className="type-body-small text-text-primary font-medium">
                  {title}
                </span>
              </>
            )}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          <NotificationBell />

          {/* User info (desktop) */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <p className="type-body-small font-medium text-text-primary">
                {user?.name}
              </p>
              <p className="text-xs text-text-secondary">{accessLevel}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-action-primary flex items-center justify-center text-text-inverse font-heading font-bold text-sm ring-2 ring-transparent transition-all duration-fast hover:ring-action-primary/30 hover:ring-offset-2">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Page header */}
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h1 className="font-heading text-2xl font-bold tracking-tight text-text-primary">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-1 type-body-small text-text-secondary">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Page children */}
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
