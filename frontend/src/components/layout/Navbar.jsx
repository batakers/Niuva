import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BrandIdentity } from "@/components/brand/BrandIdentity";
import { OperationalNavigation } from "@/components/layout/OperationalNavigation";
import { PublicNavigation } from "@/components/layout/PublicNavigation";
import { useI18n } from "@/i18n";
import { useAuth } from "@/context/AuthContext";
import { hasPermission } from "@/lib/permissions";

export function Navbar() {
  const { lang, setLang, t } = useI18n();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const mobilePanelRef = useRef(null);
  const menuFocusTimerRef = useRef(null);
  const loc = useLocation();
  const nav = useNavigate();
  const canAccessAdmin = hasPermission(user, "admin.access");
  const isOperationalRoute =
    loc.pathname === "/dashboard" ||
    loc.pathname === "/order" ||
    loc.pathname.startsWith("/orders/") ||
    (loc.pathname.startsWith("/admin") && loc.pathname !== "/admin/login");
  const workspaceLabel = canAccessAdmin
    ? t("nav.adminStudio")
    : t("nav.customerOrders");

  const goDash = () => nav(canAccessAdmin ? "/admin" : "/dashboard");
  const toggleMenu = () => {
    if (open) {
      setOpen(false);
      return;
    }

    setOpen(true);
  };
  const signOut = async () => {
    await logout();
    window.location.replace("/");
  };
  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    if (!open) return undefined;

    let attempts = 0;
    const focusFirstMenuItem = () => {
      const first = mobilePanelRef.current?.querySelector(
        'a[href], button:not([disabled])'
      );
      if (first) {
        first.focus();
        if (document.activeElement === first) return;
      }
      if (attempts >= 30) return;
      attempts += 1;
      menuFocusTimerRef.current = window.setTimeout(focusFirstMenuItem, 16);
    };

    menuFocusTimerRef.current = window.setTimeout(focusFirstMenuItem, 0);
    return () => window.clearTimeout(menuFocusTimerRef.current);
  }, [open]);
  useEffect(() => {
    document.documentElement.lang = isOperationalRoute ? lang : "id";
  }, [isOperationalRoute, lang]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        window.clearTimeout(menuFocusTimerRef.current);
        setOpen(false);
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = mobilePanelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const insidePanel = mobilePanelRef.current?.contains(active);
      if (!insidePanel) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(menuFocusTimerRef.current), []);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 bg-navigation-backdrop px-4 pb-3 pt-3 sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto flex h-16 max-w-[var(--container-wide)] items-center justify-between rounded-panel bg-surface-default px-4 shadow-navigation ring-1 ring-border-default sm:px-6">
        <Link to="/" className="-ml-2 flex min-h-11 items-center rounded-control px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring" aria-label="Niuva Inovasi Utama - Beranda">
          <BrandIdentity />
        </Link>

        {isOperationalRoute ? (
          <OperationalNavigation
            lang={lang}
            languageAriaLabel={
              lang === "id"
                ? "Ganti bahasa ke English"
                : "Switch language to Bahasa Indonesia"
            }
            logoutLabel={t("nav.logout")}
            onLanguageToggle={() => setLang(lang === "id" ? "en" : "id")}
            onSignOut={signOut}
            onWorkspace={goDash}
            signedIn={Boolean(user)}
            siteLabel={t("nav.site")}
            workspaceLabel={workspaceLabel}
          />
        ) : (
          <PublicNavigation pathname={loc.pathname} />
        )}

        <button
          ref={menuButtonRef}
          className="relative h-11 w-11 cursor-pointer rounded-control bg-surface-muted transition-colors duration-emphasis ease-snap hover:bg-surface-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default lg:hidden"
          onClick={toggleMenu}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation-panel"
        >
          <span
            className={`absolute left-1/2 top-[17px] h-0.5 w-4 -translate-x-1/2 rounded-full bg-text-primary transition-transform duration-emphasis ease-snap ${
              open ? "translate-y-[4px] rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-1/2 top-[24px] h-0.5 w-4 -translate-x-1/2 rounded-full bg-text-primary transition-transform duration-emphasis ease-snap ${
              open ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {open && (
        <div
          data-testid="mobile-navigation-backdrop"
          aria-hidden="true"
          className="fixed inset-0 z-0 bg-text-primary/20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        ref={mobilePanelRef}
        id="mobile-navigation-panel"
        role={open ? "dialog" : undefined}
        aria-modal={open ? "true" : undefined}
        aria-label="Menu navigasi"
        inert={!open}
        className={`fixed inset-x-4 top-[5.5rem] z-10 max-h-[calc(100dvh-6.5rem)] overflow-y-auto rounded-feature bg-surface-default p-5 shadow-overlay ring-1 ring-border-default transition-[opacity,transform] duration-emphasis ease-snap sm:inset-x-6 lg:hidden ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <nav className="grid gap-2" aria-label="Mobile navigation">
          {isOperationalRoute ? (
            <OperationalNavigation
              lang={lang}
              languageAriaLabel={
                lang === "id"
                  ? "Ganti bahasa ke English"
                  : "Switch language to Bahasa Indonesia"
              }
              logoutLabel={t("nav.logout")}
              mobile
              onLanguageToggle={() => setLang(lang === "id" ? "en" : "id")}
              onSignOut={signOut}
              onWorkspace={goDash}
              signedIn={Boolean(user)}
              siteLabel={t("nav.site")}
              workspaceLabel={workspaceLabel}
            />
          ) : (
            <PublicNavigation
              pathname={loc.pathname}
              mobile
              menuOpen={open}
            />
          )}
        </nav>
      </div>
    </header>
  );
}
