import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useI18n } from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import { BrandIdentity } from "@/components/brand/BrandIdentity";
import { visibleAdminMenuGroups } from "../../lib/adminWorkbench";
import { Button } from "../../components/ui/button";
import { NotificationBell } from "@/components/admin/NotificationBell";

export function AdminLayout({ children, title, subtitle }) {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopNav, setDesktopNav] = useState(() =>
    typeof window === "undefined"
      ? true
      : window.matchMedia("(min-width: 1024px)").matches
  );
  const menuButtonRef = useRef(null);
  const sidebarRef = useRef(null);
  const closeButtonRef = useRef(null);

  const accessLevel =
    Array.isArray(user?.role_labels) && user.role_labels.length > 0
      ? user.role_labels.join(" + ")
      : t("admin.noApprovedRole");

  // Filter menu groups based on permissions
  const visibleGroups = visibleAdminMenuGroups(user);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktopNav(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!sidebarOpen || desktopNav) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = sidebarRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [desktopNav, sidebarOpen]);

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
    <div className="admin-workbench flex min-h-screen w-full bg-surface-page">
      <a
        href="#admin-main"
        className="fixed left-3 top-3 z-[70] -translate-y-20 bg-action-primary px-4 py-3 text-sm font-semibold text-text-inverse focus:translate-y-0 motion-reduce:transition-none"
      >
        {t("common.skipToContent")}
      </a>
      {/* Mobile overlay with fade transition */}
      <button
        type="button"
        tabIndex={sidebarOpen ? 0 : -1}
        aria-hidden={!sidebarOpen}
        className={`fixed inset-0 z-40 bg-text-primary/50 transition-opacity duration-standard motion-reduce:transition-none lg:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-label={t("admin.closeMenu")}
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        id="admin-navigation-drawer"
        role={!desktopNav && sidebarOpen ? "dialog" : undefined}
        aria-modal={!desktopNav && sidebarOpen ? "true" : undefined}
        aria-label={t("admin.navigation")}
        inert={!desktopNav && !sidebarOpen}
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border-default bg-surface-default shadow-navigation transition-transform duration-standard ease-snap motion-reduce:transition-none lg:static lg:w-72 lg:translate-x-0 lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b border-border-default px-4">
          <Link 
            to="/admin" 
            className="flex min-h-11 items-center gap-2 transition-opacity duration-fast hover:opacity-80"
          >
            <BrandIdentity variant="mark" size={28} />
            <span className="font-heading text-sm font-bold text-text-primary">
              {t("admin.console")}
            </span>
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-control text-text-secondary transition-colors duration-fast hover:bg-surface-muted hover:text-text-primary motion-reduce:transition-none lg:hidden"
            aria-label={t("admin.closeMenu")}
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
              <p className="mb-2 px-3 type-label text-text-secondary uppercase text-[11px] tracking-wide">
                {t(group.label)}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ path, label, icon: Icon, badge }) => {
                  const active = isActive(path);
                  return (
                    <Link
                      key={path}
                      to={path}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-11 items-start gap-3 rounded-control px-3 py-2.5 type-navigation transition-colors duration-fast motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 ${
                        active
                          ? "bg-action-primary text-text-inverse shadow-sm"
                          : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                      }`}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
                      <span className="min-w-0 flex-1">
                        <span className="block leading-snug">{t(label)}</span>
                        {badge && (
                          <span className="mt-1 inline-flex border border-current/50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                            {t(badge)}
                          </span>
                        )}
                      </span>
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
            className="min-h-11 w-full justify-start text-text-secondary hover:text-status-error hover:bg-status-error/5"
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
            ref={menuButtonRef}
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-control text-text-secondary transition-colors duration-fast hover:bg-surface-muted hover:text-text-primary motion-reduce:transition-none lg:hidden"
            aria-label={t("admin.openMenu")}
            aria-expanded={sidebarOpen}
            aria-controls="admin-navigation-drawer"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb / Page title */}
          <nav className="flex min-w-0 items-center gap-1.5 text-text-secondary" aria-label="Breadcrumb">
            <Link
              to="/admin"
              className="inline-flex min-h-11 shrink-0 items-center type-body-small transition-colors duration-fast hover:text-action-primary"
            >
              {t("admin.console")}
            </Link>
            {title && (
              <>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-disabled" />
                <span className="truncate type-body-small font-medium text-text-primary">
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
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-action-primary font-heading text-sm font-bold text-text-inverse"
              aria-hidden="true"
            >
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main id="admin-main" tabIndex="-1" className="flex-1 p-4 sm:p-6 lg:p-8">
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
          <div className="mx-auto w-full max-w-[96rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}
